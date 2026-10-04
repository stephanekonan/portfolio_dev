---
title: "Des adresses e-mail pro sans payer de boîte mail : Cloudflare Email Routing"
description: "Votre domaine est sur Cloudflare mais vous n'avez pas acheté d'e-mails ? Recevez les messages envoyés à contact@ ou support@ directement dans votre Gmail, gratuitement, en quinze minutes."
date: 2026-10-04
lang: fr
tags: [Cloudflare, E-mail, DNS, Entrepreneuriat]
---

Vous avez acheté votre nom de domaine, disons `votre-domaine.ci`, chez un registraire ivoirien, puis vous l'avez ajouté à Cloudflare. Le site tourne. Sur vos cartes de visite, vous écrivez `support@votre-domaine.ci`, parce que ça fait plus sérieux qu'une adresse Gmail.

Un client vous écrit à cette adresse. Le message ne vous arrive jamais : il revient chez lui avec une erreur, ou se perd. La raison est simple : **acheter un domaine ne crée aucune boîte mail**. Pour qu'une adresse existe, un serveur doit accepter les messages qui lui sont destinés. Et vous n'en avez pas.

La solution habituelle est de payer des boîtes mail professionnelles, par utilisateur et par mois. Pour une entreprise qui démarre, ce n'est pas toujours la priorité. Cloudflare propose une autre voie, gratuite : **Email Routing**.

## Ce que fait Email Routing

Email Routing ne crée pas de boîte mail. Il **redirige** : chaque message envoyé à une adresse de votre domaine est transféré vers une adresse que vous possédez déjà, par exemple votre Gmail.

```text
Un client écrit à support@votre-domaine.ci
        │
        ▼
Cloudflare reçoit le message pour votre domaine
        │  règle : support@ → votre adresse Gmail
        ▼
Le message arrive dans votre Gmail
```

Vous pouvez créer autant d'adresses que nécessaire, `contact@`, `support@`, `factures@`, et les envoyer vers une ou plusieurs boîtes : la vôtre, celle d'un associé, celle de la personne qui gère le service client.

## Avant de commencer

Une seule condition : votre domaine doit être **géré par Cloudflare**. Concrètement, chez votre registraire, les serveurs de noms (*nameservers*) du domaine doivent être ceux que Cloudflare vous a donnés, et le domaine doit apparaître comme **Actif** dans votre tableau de bord Cloudflare.

Si vous venez de changer les serveurs de noms, la prise en compte peut prendre de quelques minutes à quelques heures. Attendez le statut **Actif** avant la suite.

Vérifiez aussi qu'aucun ancien enregistrement **MX** ne traîne dans votre zone DNS. Certains registraires en ajoutent par défaut, pointant vers leur propre service mail. Les MX indiquent au monde quel serveur reçoit le courrier de votre domaine : il ne peut y en avoir qu'un responsable, et ce sera Cloudflare.

## Mise en place, étape par étape

1. Dans le tableau de bord Cloudflare, ouvrez votre domaine, puis **Email** → **Email Routing**.
2. Cliquez sur **Commencer** (*Get started*). Cloudflare propose de créer votre première adresse.
3. Dans **Adresse personnalisée** (*Custom address*), saisissez la partie avant le `@`, par exemple `support`.
4. Dans **Action**, choisissez **Envoyer vers une adresse e-mail** (*Send to an email*), puis saisissez votre adresse de destination, par exemple votre Gmail.
5. Cloudflare envoie un message de vérification à cette adresse. Ouvrez-le et confirmez : tant que la destination n'est pas vérifiée, rien n'y sera transféré.
6. Cloudflare propose ensuite d'**ajouter les enregistrements DNS** nécessaires (*Add records and enable*) (les MX et un enregistrement TXT pour le SPF). Acceptez : il les crée lui-même dans votre zone.
7. Vérifiez que le statut d'Email Routing passe à **Actif**.

Pour ajouter d'autres adresses plus tard, ouvrez l'onglet **Règles de routage** (*Routing rules*) et créez une nouvelle adresse personnalisée. Une destination déjà vérifiée n'a pas besoin de l'être une seconde fois.

## Tester

Depuis une **autre** adresse que la destination, envoyez un message à `support@votre-domaine.ci`. Gmail masque parfois les messages que vous vous envoyez à vous-même : un test depuis le téléphone d'un ami, ou depuis une seconde adresse, est plus fiable.

Le message doit arriver en quelques secondes. S'il n'arrive pas :

- regardez dans les spams de la destination ;
- vérifiez dans Cloudflare que la destination est bien **vérifiée** ;
- consultez le **journal d'activité** (*Activity log*) dans la vue d'ensemble d'Email Routing : chaque message reçu y apparaît, avec son statut, transféré ou rejeté.

Dans Gmail, créez un filtre sur `to:support@votre-domaine.ci` pour appliquer un libellé à ces messages : vous distinguerez d'un coup d'œil le courrier pro du courrier perso.

## Répondre depuis votre adresse pro

C'est la limite qu'on découvre en premier : Email Routing **reçoit**, il n'**envoie** pas. Si vous répondez depuis Gmail sans rien régler, votre client verra votre adresse Gmail, et le côté professionnel s'évapore.

Gmail sait envoyer « en tant que » une autre adresse, mais pour un domaine qui n'est pas le sien, il exige un serveur d'envoi (SMTP). Il vous faut donc un service d'envoi d'e-mails. Plusieurs fournisseurs d'e-mails transactionnels proposent une formule gratuite suffisante pour quelques dizaines de messages par jour.

La démarche :

1. Créez un compte chez un fournisseur d'envoi, et déclarez-y votre domaine. Il vous donne des enregistrements DNS à ajouter dans Cloudflare : un pour le **DKIM** (la signature de vos messages), et un ajout à votre **SPF**.
2. Récupérez ses identifiants SMTP : serveur, port, utilisateur, mot de passe.
3. Dans Gmail, ouvrez **Paramètres** → **Afficher tous les paramètres** → **Comptes et importation** → **Envoyer des e-mails en tant que** → **Ajouter une autre adresse e-mail**.
4. Saisissez `support@votre-domaine.ci`, puis les identifiants SMTP du fournisseur.
5. Gmail envoie un code de confirmation à `support@votre-domaine.ci`. Grâce à Email Routing, il arrive… dans votre Gmail. La boucle est bouclée.

Lors de la rédaction d'un message, choisissez ensuite l'adresse d'envoi dans le champ **De**. Dans les mêmes paramètres, l'option **Répondre à partir de l'adresse à laquelle le message a été envoyé** choisit la bonne adresse pour vous.

Un point d'attention sur le **SPF** : un domaine ne doit en avoir **qu'un seul**. Cloudflare en a créé un à l'étape 6 ; n'en ajoutez pas un second pour le fournisseur d'envoi, complétez le premier. Il ressemblera à ceci :

```text
v=spf1 include:_spf.mx.cloudflare.net include:<celui-de-votre-fournisseur> ~all
```

Deux enregistrements SPF distincts invalident les deux, et vos messages finissent en spam.

## Protéger votre domaine

Quelques réglages évitent que d'autres utilisent votre nom de domaine pour envoyer des arnaques :

- ajoutez un enregistrement **DMARC**. Commencez par `v=DMARC1; p=none; rua=mailto:dmarc@votre-domaine.ci` pour recevoir les rapports, en créant d'abord une règle de routage pour `dmarc@`, sans quoi ils se perdent. Passez ensuite à `p=quarantine` quand vos envois légitimes passent tous les contrôles ;
- n'activez l'adresse **fourre-tout** (*catch-all*), qui redirige n'importe quelle adresse du domaine, que si vous en avez vraiment besoin : elle attire le spam envoyé à des adresses inventées ;
- si une adresse ne sert plus, supprimez sa règle au lieu de la laisser rediriger dans le vide.

## Les limites, et quand passer à une vraie boîte

Email Routing est une très bonne solution de départ, pas une messagerie d'entreprise :

- **pas de stockage chez vous** : tout dépend de la boîte de destination. Si vous perdez l'accès à ce Gmail, vous perdez le courrier pro ;
- **pas d'envoi natif** : il faut le service SMTP décrit plus haut, avec ses quotas ;
- **pas de comptes séparés** : un collaborateur qui part garde l'historique dans sa propre boîte si c'est elle qui recevait ;
- **pas d'agenda partagé ni d'outils d'équipe**.

Quand l'équipe grandit, ou quand plusieurs personnes doivent partager une même boîte avec son historique, une messagerie professionnelle payante devient un vrai investissement, pas une dépense de façade. D'ici là, Email Routing vous donne des adresses pro crédibles pour zéro franc.

## La liste à cocher

| Étape | Où | Pourquoi |
| --- | --- | --- |
| Domaine actif sur Cloudflare | Registraire, puis Cloudflare | Cloudflare doit gérer la zone DNS |
| Anciens MX supprimés | DNS | Un seul service reçoit le courrier du domaine |
| Adresse créée et destination vérifiée | Email Routing | Rien n'est transféré vers une adresse non vérifiée |
| MX et SPF ajoutés par Cloudflare | DNS | Le monde sait où livrer vos messages |
| Test depuis une autre adresse | Une autre boîte | Gmail masque parfois vos propres envois |
| Envoi en tant que, via un SMTP | Gmail et fournisseur d'envoi | Répondre depuis l'adresse pro |
| Un seul SPF, DKIM et DMARC | DNS | Délivrabilité, et protection contre l'usurpation |
