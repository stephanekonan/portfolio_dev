---
title: "Recevoir les messages de son formulaire de contact sur Telegram"
description: "Un e-mail de contact se perd entre deux newsletters. Une alerte Telegram sonne sur le téléphone, avec le WhatsApp du visiteur et deux boutons pour lui répondre. Mode d'emploi."
date: 2026-11-05
tags: [Telegram, Next.js, Formulaire, Sécurité]
---

Un visiteur remplit le formulaire de contact de votre site. Il décrit son projet, laisse son adresse, clique sur **Envoyer**. Le message arrive dans votre boîte mail, entre une newsletter et une facture. Vous le lisez le lendemain soir. Entre-temps, il a contacté quelqu'un d'autre.

En Côte d'Ivoire, les affaires se règlent vite, et souvent sur WhatsApp. Un formulaire de contact devrait donc faire deux choses : **vous alerter tout de suite**, et **vous donner le moyen de répondre là où le client se trouve**.

C'est ce que fait désormais le formulaire de ce portfolio. Chaque message déclenche une alerte Telegram sur mon téléphone, avec le nom, le numéro WhatsApp, l'adresse e-mail et le message du visiteur, plus deux boutons : **Répondre sur WhatsApp** et **Répondre par e-mail**. Voici comment le reproduire.

## Pourquoi Telegram

Telegram propose une **API de bots** gratuite, sans validation ni abonnement. Un bot peut vous écrire, et un message de bot sonne comme n'importe quel message : sur le téléphone, sur l'ordinateur, sur la montre.

WhatsApp a aussi une API, mais elle passe par un compte Business vérifié et des modèles de messages approuvés à l'avance. Pour s'envoyer une alerte à soi-même, c'est beaucoup de démarches. Telegram sert de sonnette, WhatsApp reste le canal où l'on répond au client.

```text
Le visiteur envoie le formulaire
        │
        ▼
Votre serveur (/api/contact) vérifie le message
        │  appel à l'API Bot de Telegram
        ▼
Votre téléphone sonne : alerte avec deux boutons
        │
        ├─ Répondre sur WhatsApp → conversation ouverte avec le visiteur
        └─ Répondre par e-mail   → message prérempli dans votre appli mail
```

Il vous faut deux valeurs : le **jeton** du bot, qui lui permet d'envoyer des messages, et l'**identifiant de la conversation** (`chat_id`), qui lui dit à qui les envoyer. Comptez cinq minutes.

## Étape 1 : obtenir le jeton du bot

Les bots Telegram se créent… avec un bot : **@BotFather**, le bot officiel de Telegram.

1. Dans Telegram, sur le téléphone ou sur Telegram Desktop, touchez la **loupe** et cherchez `BotFather`. Choisissez celui qui porte le **badge bleu** de vérification : il existe des imitations.
2. Touchez **Démarrer** (*Start*). BotFather affiche la liste de ses commandes.
3. Envoyez `/newbot`.
4. BotFather demande un **nom** : c'est ce qui s'affichera en haut de la conversation, par exemple `Contact du site`. Espaces et accents sont permis.
5. Il demande ensuite un **identifiant** (*username*) : unique sur tout Telegram, sans espace, et qui se termine obligatoirement par `bot`, par exemple `contact_monsite_bot`. S'il est déjà pris, BotFather le dit : essayez-en un autre.
6. BotFather répond avec le lien du bot et son **jeton**.

La conversation ressemble à ceci (BotFather parle anglais) :

```text
Vous       /newbot
BotFather  Alright, a new bot. How are we going to call it?
           Please choose a name for your bot.
Vous       Contact du site
BotFather  Good. Now let's choose a username for your bot.
           It must end in `bot`.
Vous       contact_monsite_bot
BotFather  Done! Congratulations on your new bot. You will find it
           at t.me/contact_monsite_bot. […]
           Use this token to access the HTTP API:
           123456789:AAF1x2Y3z4-ExempleDeJetonANePasUtiliser
           Keep your token secure and store it safely […]
```

Le jeton tient en une ligne : un nombre (l'identifiant du bot), deux-points, puis une longue clé. Copiez-le **en entier**, sans espace autour. Il donne le contrôle total du bot : traitez-le comme un mot de passe.

Vous l'avez perdu ? Envoyez `/mybots` à BotFather, choisissez votre bot, puis **API Token** : il s'affiche à nouveau. Vous l'avez divulgué par erreur ? Au même endroit, **Revoke current token** en génère un nouveau, et l'ancien cesse aussitôt de fonctionner.

## Étape 2 : obtenir l'identifiant de la conversation

Un bot n'a pas le droit d'écrire le premier : il ne peut écrire qu'à quelqu'un qui lui a déjà parlé. On commence donc par lui parler, puis on lui demande qui l'a fait.

1. Ouvrez le lien donné par BotFather, `t.me/contact_monsite_bot`, et touchez **Démarrer**. Telegram envoie `/start` au bot. Envoyez-lui aussi un petit message, « test » par exemple.
2. Dans le navigateur, ouvrez l'adresse suivante, en y collant votre jeton :

```text
https://api.telegram.org/bot<JETON>/getUpdates
```

Attention au piège : le mot `bot` est **collé** au jeton, sans barre oblique entre les deux. Avec le jeton d'exemple, cela donne `https://api.telegram.org/bot123456789:AAF1x2Y3z4-ExempleDeJetonANePasUtiliser/getUpdates`.

La page affiche du JSON : la liste des messages que le bot a reçus. Dans Chrome, cochez **Impression élégante** en haut de la page pour la rendre lisible ; Firefox la met en forme tout seul.

```json
{
  "ok": true,
  "result": [
    {
      "update_id": 815230001,
      "message": {
        "message_id": 1,
        "from": { "id": 691234567, "is_bot": false, "first_name": "Awa", "language_code": "fr" },
        "chat": { "id": 691234567, "first_name": "Awa", "type": "private" },
        "date": 1762333200,
        "text": "/start"
      }
    }
  ]
}
```

La valeur à garder est celle de **`message` → `chat` → `id`**, ici `691234567`. C'est votre `chat_id`. Dans une conversation privée, elle est identique à votre propre identifiant Telegram (`from.id`).

Si vous êtes à l'aise avec le terminal, la même chose en une ligne :

```bash
curl -s "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getUpdates" | grep -o '"chat":{"id":-\?[0-9]*'
```

### Si ça ne marche pas

| Ce que vous voyez | Ce que ça veut dire | Que faire |
| --- | --- | --- |
| `"result": []` | Le bot n'a rien reçu, ou vos messages ont plus de 24 heures : Telegram ne les garde pas au-delà | Renvoyez un message au bot, puis rechargez la page |
| `401 Unauthorized` | Le jeton est faux | Recopiez-le, sans espace, ou réaffichez-le avec `/mybots` |
| `404 Not Found` | L'adresse est mal formée | Vérifiez que `bot` précède bien le jeton, sans `/` |
| `Conflict: can't use getUpdates method while webhook is active` | Un webhook est réglé sur ce bot | Ouvrez `…/bot<JETON>/deleteWebhook`, puis réessayez |

Vous préférez recevoir les alertes dans un **groupe**, pour que toute l'équipe les voie ? Ajoutez le bot au groupe, puis écrivez-y un message qui le mentionne (`@contact_monsite_bot test`) : par défaut, un bot ne voit pas les messages ordinaires d'un groupe. L'identifiant d'un groupe est **négatif** (`-100…` pour un supergroupe) : gardez bien le signe moins.

## Étape 3 : vérifier les deux valeurs

Avant d'écrire la moindre ligne de code, vérifiez que le couple fonctionne. Remplacez le jeton et l'identifiant dans cette adresse, puis ouvrez-la dans le navigateur :

```text
https://api.telegram.org/bot<JETON>/sendMessage?chat_id=<CHAT_ID>&text=Test
```

Votre téléphone doit sonner : « Test », envoyé par votre bot. La page répond `"ok": true`. Si c'est le cas, vos deux valeurs sont bonnes.

## Le jeton reste sur le serveur

La tentation est d'appeler Telegram directement depuis la page, en JavaScript. C'est la seule vraie erreur à ne pas faire : tout ce qui est dans le navigateur est lisible par n'importe quel visiteur. Avec votre jeton, un inconnu pourrait envoyer des messages en votre nom, ou lire ceux que reçoit votre bot.

Le navigateur envoie donc le formulaire à **votre** serveur, et c'est lui seul qui parle à Telegram. Le jeton et l'identifiant vont dans des variables d'environnement : `.env.local` en développement, les réglages de l'hébergeur (Vercel, par exemple) en production. Jamais dans le dépôt, surtout s'il est public.

```bash
TELEGRAM_BOT_TOKEN=123456789:AAH...
TELEGRAM_CHAT_ID=123456789
```

## Envoyer l'alerte

Avec Next.js, une route `app/api/contact/route.ts` reçoit le formulaire. Après les vérifications (voir plus bas), un seul appel suffit :

```ts
await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    link_preview_options: { is_disabled: true },
    reply_markup: { inline_keyboard: buttons },
  }),
  signal: AbortSignal.timeout(15_000),
});
```

`parse_mode: "HTML"` permet le gras, les liens et les citations. Le message ressemble à ceci :

```text
🔔 Nouveau message · Portfolio

👤 Nom : Awa Koné
📱 WhatsApp : +225 07 00 00 00 00
✉️ E-mail : awa@exemple.ci

💬 Message
│ Bonjour, je dirige une PME à Abidjan et j'aimerais…

🌐 FR · 🕒 05/11/2026 09:14 · Réf. 3f9c2a1e
```

Quelques détails qui comptent :

- **Échappez ce qu'écrit le visiteur.** En mode HTML, un nom comme `<b>Awa` casserait la mise en forme, et Telegram refuserait le message. Remplacez `&`, `<` et `>` par `&amp;`, `&lt;` et `&gt;` avant de les insérer.
- **Respectez la limite de 4 096 caractères** d'un message Telegram : coupez le texte du visiteur s'il est trop long, sans couper au milieu d'un `&amp;`.
- **Mettez le message dans `<blockquote expandable>`** : un long message s'affiche replié, et l'alerte reste lisible d'un coup d'œil.
- **Fixez le fuseau horaire**, avec `Intl.DateTimeFormat` et `timeZone: "Africa/Abidjan"`. Sans ça, l'heure affichée dépend de la configuration du serveur, qui change d'un hébergeur à l'autre.

## Demander le numéro WhatsApp

Pour répondre sur WhatsApp, il faut le numéro. Le formulaire comporte donc un champ dédié, de type `tel`, que le serveur vérifie : de 8 à 15 chiffres, espaces et `+` acceptés.

Le lien de réponse, `https://wa.me/<numéro>`, exige le numéro au format international, en chiffres seuls. Or beaucoup de visiteurs ivoiriens écrivent `07 00 00 00 00`, sans indicatif. Le serveur normalise :

```ts
let digits = phone.replace(/\D/g, "");
if (digits.startsWith("00")) digits = digits.slice(2);
else if (!phone.startsWith("+") && digits.length === 10 && digits.startsWith("0")) {
  digits = `225${digits}`; // numéro ivoirien saisi sans indicatif
}
```

Le lien peut même porter une première phrase, déjà écrite dans la conversation qui s'ouvre :

```ts
const wa = `https://wa.me/${digits}?text=${encodeURIComponent(`Bonjour ${name}, merci pour votre message.`)}`;
```

## Deux boutons pour répondre

Sous le message, Telegram affiche des **boutons** (`inline_keyboard`), chacun associé à un lien. Le premier ouvre WhatsApp, sans difficulté.

Le second pose un problème : un bouton Telegram n'accepte que des liens `https://` (ou `tg://`). Un lien `mailto:`, qui ouvre l'application mail, est refusé.

La parade : le bouton pointe vers une petite route de **votre site**, par exemple `/api/contact/reply`, qui redirige aussitôt vers le `mailto:` prérempli (destinataire, objet, « Bonjour Awa, »). Utilisez l'adresse publique du site, pas `localhost` : c'est votre téléphone qui ouvrira le lien.

Une route qui fabrique des liens à partir de ce qu'on lui passe peut être détournée. Chaque lien est donc **signé** : le serveur calcule une empreinte HMAC de l'adresse et du nom avec une clé secrète, et la route refuse tout lien dont l'empreinte ne correspond pas.

```ts
import { createHmac } from "node:crypto";

const sign = (email: string, name: string) =>
  createHmac("sha256", secret).update(`${email}\n${name}`).digest("base64url");
```

Personne ne peut fabriquer un lien valide sans la clé. Comparez les empreintes avec `timingSafeEqual`, pas avec `===`, pour ne rien laisser deviner du temps de calcul.

## Se protéger des robots

Un formulaire public reçoit vite du spam. Trois protections simples, toutes côté serveur :

- **un champ piège** : un champ caché, invisible pour un humain, que les robots remplissent. S'il est rempli, le serveur répond « envoyé » sans rien transmettre, pour ne pas apprendre au robot ce qui l'a trahi ;
- **un temps minimum** : un humain met plus de trois secondes à écrire un message, un robot non ;
- **une limite par adresse IP**, et surtout une règle de limitation de débit chez votre CDN (Cloudflare, par exemple) sur `/api/contact`.

Vérifiez aussi l'en-tête `Origin` : la route n'accepte que les envois venus de votre propre site.

## Tester

Lancez le site en local, puis envoyez un vrai message depuis le formulaire. L'alerte doit sonner en une ou deux secondes. Si rien n'arrive, la réponse de Telegram dit pourquoi : affichez-la dans les journaux du serveur, jamais l'URL appelée, qui contient le jeton.

Un piège rencontré en route : un test lancé depuis le terminal Windows a affiché « envoy� » au lieu de « envoyé ». La faute ne venait pas du code, mais du terminal, qui n'envoyait pas le texte en UTF-8. Pour tester en ligne de commande, mettez le message dans un fichier JSON et envoyez-le avec `curl --data-binary @message.json`.

## Garder l'e-mail en secours

Telegram n'a pas à remplacer l'e-mail. La route envoie le message à **chaque canal configuré**, e-mail et Telegram, et considère l'envoi réussi dès qu'un canal l'a accepté. Si l'un tombe en panne, l'autre prend le relais, et le visiteur ne voit jamais d'erreur.

## La liste à cocher

| Étape | Où | Pourquoi |
| --- | --- | --- |
| Bot créé, jeton récupéré | @BotFather | Le bot qui vous écrit |
| Premier message envoyé au bot | Telegram | Un bot n'écrit qu'à qui lui a parlé |
| `chat_id` lu dans `getUpdates` | Navigateur | Savoir à qui envoyer l'alerte |
| Message « Test » reçu via `sendMessage` | Navigateur | Le jeton et le `chat_id` vont ensemble |
| Jeton et `chat_id` en variables d'environnement | `.env.local`, hébergeur | Le jeton ne quitte jamais le serveur |
| Texte du visiteur échappé, 4 096 caractères max | Route serveur | Un message mal formé est refusé |
| Numéro normalisé au format international | Route serveur | `wa.me` exige l'indicatif |
| Lien e-mail signé (HMAC) | Route de redirection | Personne ne fabrique de faux liens |
| Champ piège, délai, limite de débit | Formulaire, serveur, CDN | Le spam reste dehors |
