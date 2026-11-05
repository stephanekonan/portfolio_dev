---
title: "Get your contact form messages on Telegram"
description: "A contact email gets lost between two newsletters. A Telegram alert rings on your phone, with the visitor's WhatsApp and two buttons to reply. Here is how."
date: 2026-11-05
tags: [Telegram, Next.js, Forms, Security]
---

A visitor fills in the contact form on your site. They describe their project, leave their address, click **Send**. The message lands in your mailbox, between a newsletter and an invoice. You read it the next evening. By then, they have contacted someone else.

In Côte d'Ivoire, business moves fast, and often on WhatsApp. A contact form should therefore do two things: **alert you right away**, and **give you a way to reply where the customer is**.

That is what the form on this portfolio now does. Every message triggers a Telegram alert on my phone, with the visitor's name, WhatsApp number, email address and message, plus two buttons: **Reply on WhatsApp** and **Reply by email**. Here is how to build the same thing.

## Why Telegram

Telegram offers a free **Bot API**, with no review and no subscription. A bot can write to you, and a bot message rings like any other message: on your phone, your computer, your watch.

WhatsApp has an API too, but it goes through a verified Business account and message templates approved in advance. That is a lot of paperwork just to send yourself an alert. Telegram is the doorbell; WhatsApp stays the channel where you answer the customer.

```text
The visitor sends the form
        │
        ▼
Your server (/api/contact) checks the message
        │  call to the Telegram Bot API
        ▼
Your phone rings: an alert with two buttons
        │
        ├─ Reply on WhatsApp → chat opened with the visitor
        └─ Reply by email    → prefilled message in your mail app
```

You need two values: the bot's **token**, which lets it send messages, and the **chat ID** (`chat_id`), which tells it who to send them to. Allow five minutes.

## Step 1: get the bot token

Telegram bots are created… with a bot: **@BotFather**, Telegram's official bot.

1. In Telegram, on your phone or in Telegram Desktop, tap the **magnifying glass** and search for `BotFather`. Pick the one with the **blue verified badge**: there are imitations.
2. Tap **Start**. BotFather shows its list of commands.
3. Send `/newbot`.
4. BotFather asks for a **name**: this is what will show at the top of the chat, for example `Site contact`. Spaces and accents are fine.
5. It then asks for a **username**: unique across Telegram, no spaces, and it must end in `bot`, for example `contact_mysite_bot`. If it is taken, BotFather says so: try another one.
6. BotFather replies with the bot's link and its **token**.

The conversation looks like this:

```text
You        /newbot
BotFather  Alright, a new bot. How are we going to call it?
           Please choose a name for your bot.
You        Site contact
BotFather  Good. Now let's choose a username for your bot.
           It must end in `bot`.
You        contact_mysite_bot
BotFather  Done! Congratulations on your new bot. You will find it
           at t.me/contact_mysite_bot. […]
           Use this token to access the HTTP API:
           123456789:AAF1x2Y3z4-ExampleTokenDoNotUse
           Keep your token secure and store it safely […]
```

The token fits on one line: a number (the bot's ID), a colon, then a long key. Copy it **in full**, with no spaces around it. It gives full control of the bot: treat it like a password.

Lost it? Send `/mybots` to BotFather, pick your bot, then **API Token**: it shows again. Leaked it by mistake? In the same place, **Revoke current token** generates a new one, and the old one stops working at once.

## Step 2: get the chat ID

A bot is not allowed to write first: it can only write to someone who has already talked to it. So you talk to it first, then ask it who did.

1. Open the link BotFather gave you, `t.me/contact_mysite_bot`, and tap **Start**. Telegram sends `/start` to the bot. Send it a short message too, "test" for example.
2. In your browser, open the following address, pasting your token into it:

```text
https://api.telegram.org/bot<TOKEN>/getUpdates
```

Watch out for the trap: the word `bot` is **glued** to the token, with no slash between them. With the example token, that gives `https://api.telegram.org/bot123456789:AAF1x2Y3z4-ExampleTokenDoNotUse/getUpdates`.

The page shows JSON: the list of messages the bot has received. In Chrome, tick **Pretty-print** at the top of the page to make it readable; Firefox formats it on its own.

```json
{
  "ok": true,
  "result": [
    {
      "update_id": 815230001,
      "message": {
        "message_id": 1,
        "from": { "id": 691234567, "is_bot": false, "first_name": "Awa", "language_code": "en" },
        "chat": { "id": 691234567, "first_name": "Awa", "type": "private" },
        "date": 1762333200,
        "text": "/start"
      }
    }
  ]
}
```

The value to keep is **`message` → `chat` → `id`**, here `691234567`. That is your `chat_id`. In a private chat, it is the same as your own Telegram ID (`from.id`).

If you are comfortable with the terminal, the same thing in one line:

```bash
curl -s "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getUpdates" | grep -o '"chat":{"id":-\?[0-9]*'
```

### If it does not work

| What you see | What it means | What to do |
| --- | --- | --- |
| `"result": []` | The bot received nothing, or your messages are older than 24 hours: Telegram does not keep them longer | Send the bot another message, then reload the page |
| `401 Unauthorized` | The token is wrong | Copy it again, with no spaces, or show it again with `/mybots` |
| `404 Not Found` | The address is malformed | Check that `bot` comes right before the token, with no `/` |
| `Conflict: can't use getUpdates method while webhook is active` | A webhook is set on this bot | Open `…/bot<TOKEN>/deleteWebhook`, then try again |

Would you rather get the alerts in a **group**, so the whole team sees them? Add the bot to the group, then post a message there that mentions it (`@contact_mysite_bot test`): by default, a bot does not see ordinary group messages. A group ID is **negative** (`-100…` for a supergroup): keep the minus sign.

## Step 3: check both values

Before writing a single line of code, check that the pair works. Replace the token and the ID in this address, then open it in your browser:

```text
https://api.telegram.org/bot<TOKEN>/sendMessage?chat_id=<CHAT_ID>&text=Test
```

Your phone should ring: "Test", sent by your bot. The page answers `"ok": true`. If so, both values are right.

## The token stays on the server

The temptation is to call Telegram straight from the page, in JavaScript. That is the one real mistake to avoid: anything in the browser can be read by any visitor. With your token, a stranger could send messages in your name, or read the ones your bot receives.

So the browser sends the form to **your** server, and only the server talks to Telegram. The token and the chat ID go in environment variables: `.env.local` in development, your host's settings (Vercel, for example) in production. Never in the repository, especially a public one.

```bash
TELEGRAM_BOT_TOKEN=123456789:AAH...
TELEGRAM_CHAT_ID=123456789
```

## Send the alert

With Next.js, an `app/api/contact/route.ts` route receives the form. After the checks (see below), a single call does it:

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

`parse_mode: "HTML"` allows bold text, links and quotes. The message looks like this:

```text
🔔 Nouveau message · Portfolio

👤 Nom : Awa Koné
📱 WhatsApp : +225 07 00 00 00 00
✉️ E-mail : awa@example.ci

💬 Message
│ Hello, I run a small business in Abidjan and I would like…

🌐 EN · 🕒 05/11/2026 09:14 · Réf. 3f9c2a1e
```

A few details that matter:

- **Escape what the visitor writes.** In HTML mode, a name like `<b>Awa` would break the formatting, and Telegram would reject the message. Replace `&`, `<` and `>` with `&amp;`, `&lt;` and `&gt;` before inserting them.
- **Respect the 4,096-character limit** of a Telegram message: cut the visitor's text if it is too long, without cutting in the middle of an `&amp;`.
- **Put the message in `<blockquote expandable>`**: a long message shows collapsed, and the alert stays readable at a glance.
- **Set the time zone**, with `Intl.DateTimeFormat` and `timeZone: "Africa/Abidjan"`. Without it, the time shown depends on the server's configuration, which varies from host to host.

## Ask for the WhatsApp number

To reply on WhatsApp, you need the number. The form therefore has a dedicated `tel` field, which the server checks: 8 to 15 digits, spaces and `+` allowed.

The reply link, `https://wa.me/<number>`, requires the number in international format, digits only. Yet many Ivorian visitors type `07 00 00 00 00`, without the country code. The server normalises it:

```ts
let digits = phone.replace(/\D/g, "");
if (digits.startsWith("00")) digits = digits.slice(2);
else if (!phone.startsWith("+") && digits.length === 10 && digits.startsWith("0")) {
  digits = `225${digits}`; // Ivorian number typed without the country code
}
```

The link can even carry a first sentence, already typed in the chat that opens:

```ts
const wa = `https://wa.me/${digits}?text=${encodeURIComponent(`Hello ${name}, thank you for your message.`)}`;
```

## Two buttons to reply

Below the message, Telegram shows **buttons** (`inline_keyboard`), each tied to a link. The first one opens WhatsApp, no trouble there.

The second one is a problem: a Telegram button only accepts `https://` (or `tg://`) links. A `mailto:` link, which opens the mail app, is rejected.

The workaround: the button points to a small route on **your site**, for example `/api/contact/reply`, which immediately redirects to the prefilled `mailto:` (recipient, subject, "Hello Awa,"). Use the site's public address, not `localhost`: your phone is the one that will open the link.

A route that builds links from whatever it is given can be abused. So every link is **signed**: the server computes an HMAC of the address and the name with a secret key, and the route rejects any link whose signature does not match.

```ts
import { createHmac } from "node:crypto";

const sign = (email: string, name: string) =>
  createHmac("sha256", secret).update(`${email}\n${name}`).digest("base64url");
```

Nobody can forge a valid link without the key. Compare signatures with `timingSafeEqual`, not `===`, so the computation time gives nothing away.

## Keep the bots out

A public form gets spam quickly. Three simple protections, all on the server side:

- **a honeypot field**: a hidden field, invisible to humans, that bots fill in. If it is filled, the server answers "sent" without forwarding anything, so the bot never learns what gave it away;
- **a minimum delay**: a human takes more than three seconds to write a message, a bot does not;
- **a per-IP limit**, and above all a rate-limiting rule at your CDN (Cloudflare, for example) on `/api/contact`.

Also check the `Origin` header: the route only accepts submissions coming from your own site.

## Test it

Run the site locally, then send a real message from the form. The alert should ring within a second or two. If nothing arrives, Telegram's response says why: log it on the server, but never the URL you called, which contains the token.

A trap we hit along the way: a test run from the Windows terminal displayed "envoy�" instead of "envoyé". The code was not to blame; the terminal was not sending the text as UTF-8. To test from the command line, put the message in a JSON file and send it with `curl --data-binary @message.json`.

## Keep email as a fallback

Telegram does not have to replace email. The route sends the message to **every configured channel**, email and Telegram, and counts the submission as successful as soon as one channel accepts it. If one goes down, the other takes over, and the visitor never sees an error.

## The checklist

| Step | Where | Why |
| --- | --- | --- |
| Bot created, token copied | @BotFather | The bot that writes to you |
| First message sent to the bot | Telegram | A bot only writes to people who talked to it |
| `chat_id` read from `getUpdates` | Browser | Know where to send the alert |
| "Test" message received via `sendMessage` | Browser | The token and the `chat_id` go together |
| Token and `chat_id` in environment variables | `.env.local`, host | The token never leaves the server |
| Visitor text escaped, 4,096 characters max | Server route | A malformed message is rejected |
| Number normalised to international format | Server route | `wa.me` needs the country code |
| Signed email link (HMAC) | Redirect route | Nobody forges fake links |
| Honeypot, delay, rate limit | Form, server, CDN | Spam stays out |
