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

## Créer le bot

1. Dans Telegram, ouvrez une conversation avec **@BotFather**, le bot officiel qui fabrique les bots.
2. Envoyez `/newbot`, choisissez un nom affiché (« Contact du site ») puis un identifiant qui finit par `bot`.
3. BotFather vous donne un **jeton**, de la forme `123456789:AAH…`. Ce jeton donne le contrôle total du bot : traitez-le comme un mot de passe.

## Trouver l'identifiant de la conversation

Le bot ne peut pas écrire à quelqu'un qui ne lui a jamais parlé. Il faut donc :

1. ouvrir votre bot dans Telegram, appuyer sur **Démarrer**, puis lui envoyer un message, n'importe lequel ;
2. ouvrir dans le navigateur `https://api.telegram.org/bot<JETON>/getUpdates`, en remplaçant `<JETON>` par le vôtre.

La réponse liste les messages reçus par le bot. Cherchez ce bloc :

```json
"message": {
  "chat": { "id": 123456789, "first_name": "Awa", "type": "private" }
}
```

Ce nombre est l'**identifiant de la conversation** (`chat_id`). Si la liste est vide, c'est que le bot n'a encore rien reçu : renvoyez-lui un message et rechargez la page.

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
| Jeton et `chat_id` en variables d'environnement | `.env.local`, hébergeur | Le jeton ne quitte jamais le serveur |
| Texte du visiteur échappé, 4 096 caractères max | Route serveur | Un message mal formé est refusé |
| Numéro normalisé au format international | Route serveur | `wa.me` exige l'indicatif |
| Lien e-mail signé (HMAC) | Route de redirection | Personne ne fabrique de faux liens |
| Champ piège, délai, limite de débit | Formulaire, serveur, CDN | Le spam reste dehors |
