---
title: "Protéger ses domaines avec Cloudflare : les réglages qui comptent vraiment"
description: "Proxy, garde d'origine, TLS strict, WAF, limites de débit, mode Under Attack et e-mail : une méthode pour protéger une API et ses fronts sans casser l'app mobile ni les webhooks."
date: 2026-10-04
lang: fr
tags: [Cloudflare, Sécurité, DNS, Go]
---

Prenons une architecture courante : un site, une PWA et une console d'administration servis par une plateforme d'hébergement front, une API hébergée ailleurs, une app mobile, et toute la zone DNS derrière Cloudflare. Dans les exemples, le domaine est `example.com`, réservé à la documentation.

Mettre Cloudflare devant un domaine prend dix minutes. Le configurer pour qu'il protège vraiment, sans casser l'app mobile, les webhooks de paiement ni les aperçus de lien, demande plus de méthode. Voici l'ordre que je recommande.

## 1. Proxifier, puis fermer la porte de derrière

Le nuage orange sur un enregistrement DNS fait passer le trafic par Cloudflare : WAF, limites de débit, cache, masquage de l'IP. C'est la première étape, mais elle ne suffit pas.

La plupart des hébergeurs donnent à votre service une adresse publique à eux, du type `mon-api.hebergeur.app`. Quiconque la trouve contourne Cloudflare et toutes ses règles. Le proxy ne cache pas un hôte qui a sa propre adresse publique.

La parade : un secret partagé entre Cloudflare et l'origine.

1. Une **Transform Rule** (*Modify Request Header*), limitée à l'hôte de l'API, ajoute à chaque requête un en-tête contenant une valeur aléatoire longue.
2. L'API refuse toute requête qui ne porte pas cette valeur, avec un `403` sans détail. Seule une éventuelle route de santé y échappe, pour les sondes de l'hébergeur, à condition qu'elle ne renvoie rien de sensible.

Choisissez vous-même le nom de l'en-tête, et rien d'évident : moins il est devinable, moins il attire les essais. En Go, la garde tient en quelques lignes. La comparaison se fait en temps constant, pour ne rien révéler du secret par le temps de réponse :

```go
// header vaut par exemple "X-Origin-Secret" ; prenez le vôtre.
func OriginGuard(header, secret string) func(http.Handler) http.Handler {
	expected := []byte(secret)
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			got := []byte(r.Header.Get(header))
			if subtle.ConstantTimeCompare(got, expected) != 1 {
				http.Error(w, "Forbidden", http.StatusForbidden)
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}
```

Le secret vit à deux endroits : la règle Cloudflare et une variable d'environnement de l'hébergeur, jamais dans le dépôt. Pour le changer sans coupure, faites accepter deux valeurs par l'API le temps de la bascule, mettez à jour la règle, puis retirez l'ancienne valeur.

Selon l'hébergement, il existe des solutions plus solides :

- **Authenticated Origin Pulls** : Cloudflare présente un certificat client (mTLS) que l'origine vérifie. Il faut pouvoir configurer TLS côté origine, ce qu'un domaine partagé d'hébergeur ne permet généralement pas.
- **Cloudflare Tunnel** : sur un VPS, l'origine n'expose plus aucun port, c'est elle qui ouvre une connexion sortante vers Cloudflare. C'est l'option à privilégier dès que vous maîtrisez la machine.

## 2. TLS : Full (strict), jamais Flexible

Dans *SSL/TLS*, le mode **Flexible** chiffre le trajet du visiteur à Cloudflare, mais laisse le trajet de Cloudflare à l'origine en HTTP clair. Avec un hébergeur qui redirige lui-même vers HTTPS, il provoque en plus une boucle de redirections.

Le bon réglage :

- mode **Full (strict)** : chiffré de bout en bout, et le certificat de l'origine est vérifié ;
- **Always Use HTTPS** activé ;
- **version TLS minimale** à 1.2 ;
- **HSTS** activé seulement une fois tous les sous-domaines servis en HTTPS : un navigateur qui l'a reçu refusera ensuite tout accès en HTTP.

## 3. WAF et limites de débit, hôte par hôte

Les règles gérées de Cloudflare filtrent déjà les attaques connues. Ajoutez des règles personnalisées, toujours ciblées par hôte :

- bloquez les sondes qui ne correspondent à aucune technologie que vous utilisez (`/wp-admin`, `/.env`, `/.git`) : si vous n'avez pas de WordPress, aucune de ces URL n'est légitime ;
- appliquez une **limite de débit** aux routes qui coûtent de l'argent ou exposent des comptes : envoi d'OTP par SMS, mot de passe oublié, connexion.

Le plan gratuit offre peu de règles de limitation : réservez-les aux routes qui déclenchent une dépense, comme un SMS. Le reste se limite dans l'API elle-même, avec un limiteur par IP sur chaque route publique. Les deux niveaux se complètent : Cloudflare arrête le gros du trafic en bordure, l'API garde une limite qui tient même si une règle saute. Ne publiez pas vos seuils : ils indiquent exactement à quel rythme rester pour passer sous le radar.

## 4. Under Attack et Bot Fight Mode : où les activer, où surtout pas

Le mode **Under Attack** présente un défi JavaScript à chaque visiteur. Sur un site lu par des navigateurs, il protège bien. Sur une API, il casse tout ce qui n'est pas un navigateur :

- l'**app mobile**, dont le client HTTP n'exécute pas de JavaScript ;
- les **webhooks** du prestataire de paiement, qui reçoivent le défi au lieu de la réponse attendue ;
- les **serveurs** qui appellent l'API.

Réservez donc Under Attack aux hôtes lus par des navigateurs, et protégez l'API autrement : garde d'origine, WAF, limites de débit. Les webhooks se vérifient par signature (HMAC) dans l'API, pas par un défi Cloudflare.

### Piège fréquent : les appels de serveur à serveur

Un front qui appelle l'API depuis ses propres serveurs (rendu côté serveur, fonctions *serverless*) le fait depuis des adresses IP de centres de données. C'est précisément ce que **Bot Fight Mode** cible : le mobile fonctionne, le site reçoit des `403`.

Deux issues :

- faire appeler l'API **depuis le navigateur**, avec un CORS strict : plus de serveur au milieu ;
- ou, si l'appel serveur est indispensable, l'authentifier par un secret dédié et l'exempter par une règle WAF précise, jamais en désactivant la protection pour tout le monde.

Pour diagnostiquer un `403`, regardez la réponse brute avec `curl -i` sur votre propre domaine :

- un en-tête `cf-mitigated: challenge` signe Cloudflare ;
- une réponse sans cet en-tête vient de votre origine, par exemple de la garde décrite plus haut.

### Piège fréquent : les aperçus de lien

Partager une page sur une messagerie doit afficher un aperçu : titre, image, description. Mais certaines messageries construisent cet aperçu depuis le téléphone, sans exécuter le défi JavaScript. Avec Under Attack actif, les aperçus disparaissent.

Deux solutions :

- une règle WAF personnalisée avec l'action **Skip**, limitée aux robots d'aperçu (`WhatsApp`, `facebookexternalhit`, `TelegramBot`) et aux seules pages partageables ;
- servir les balises `og:*` depuis un hôte non challengé, vers lequel ces robots sont redirigés.

Un user-agent se falsifie facilement : la règle Skip ne doit ouvrir que des pages publiques, jamais une route qui écrit ou qui renvoie des données privées.

## 5. DNS et e-mail

Si votre domaine envoie des e-mails, quelques règles :

- les enregistrements **SPF**, **DKIM** et **DMARC** restent en DNS seul (nuage gris) : ce ne sont pas des hôtes web ;
- **DMARC** commence en `p=none` pour lire les rapports, puis passe en `quarantine` quand tout est aligné ;
- activez **DNSSEC** dans Cloudflare et publiez l'enregistrement DS chez le registraire ;
- supprimez les enregistrements orphelins (anciens hébergeurs, essais) : un CNAME qui pointe vers un service abandonné permet une prise de contrôle du sous-domaine.

## 6. Ce qu'on ne publie pas

Une dernière règle, valable pour un article comme pour un README ou une page d'erreur : ne publiez pas la carte de votre infrastructure. Noms des sous-domaines internes, adresse directe de l'origine, nom de l'en-tête secret, seuils de limitation, hôtes exemptés de défi : chacune de ces informations fait gagner du temps à un attaquant. La sécurité ne doit pas reposer sur le secret de ces détails, mais rien n'oblige à les offrir.

## La liste à cocher

| Réglage | Où | Pourquoi |
| --- | --- | --- |
| Proxy activé (nuage orange) | DNS, hôtes web | Faire passer le trafic par le WAF |
| Secret d'origine (Transform Rule) | API | Interdire le contournement par l'adresse de l'hébergeur |
| Full (strict), TLS 1.2 minimum, HSTS | SSL/TLS | Chiffrer et vérifier de bout en bout |
| Règles gérées et sondes bloquées | WAF | Filtrer le bruit avant l'origine |
| Limite de débit sur OTP et connexion | WAF et API | Protéger les comptes et la facture SMS |
| Under Attack sur les hôtes navigateur seulement | Sécurité | Ne jamais challenger l'app mobile ni les webhooks |
| Skip pour les robots d'aperçu, pages publiques seulement | WAF | Garder les aperçus de lien |
| SPF, DKIM, DMARC, DNSSEC | DNS | Protéger le domaine et la délivrabilité |

Rien de tout cela n'est exotique. Ce qui compte, c'est de savoir, pour chaque hôte, **qui l'appelle** : un navigateur, une app, un serveur ou un robot. La bonne protection en découle.
