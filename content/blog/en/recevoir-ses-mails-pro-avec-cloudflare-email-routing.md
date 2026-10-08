---
title: "Professional email addresses without paying for a mailbox: Cloudflare Email Routing"
description: "Your domain is on Cloudflare but you never bought email? Receive messages sent to contact@ or support@ straight in your Gmail, for free, in fifteen minutes."
date: 2026-10-04
tags: [Cloudflare, Email, DNS, Entrepreneurship]
---

You bought your domain name, say `your-domain.ci`, from an Ivorian registrar, then added it to Cloudflare. The site is up. On your business cards you write `support@your-domain.ci`, because it looks more serious than a Gmail address.

A customer writes to that address. The message never reaches you: it bounces back to them with an error, or gets lost. The reason is simple: **buying a domain does not create a mailbox**. For an address to exist, a server has to accept the messages sent to it. And you do not have one.

The usual answer is to pay for professional mailboxes, per user and per month. For a business that is just starting, that is not always the priority. Cloudflare offers another route, for free: **Email Routing**.

## What Email Routing does

Email Routing does not create a mailbox. It **forwards**: every message sent to an address on your domain is passed on to an address you already own, your Gmail for example.

```text
A customer writes to support@your-domain.ci
        │
        ▼
Cloudflare receives the message for your domain
        │  rule: support@ → your Gmail address
        ▼
The message lands in your Gmail
```

You can create as many addresses as you need, `contact@`, `support@`, `invoices@`, and send them to one or more mailboxes: yours, a partner's, the person who handles customer service.

## Before you start

There is a single requirement: your domain must be **managed by Cloudflare**. In practice, at your registrar, the domain's nameservers must be the ones Cloudflare gave you, and the domain must show as **Active** in your Cloudflare dashboard.

If you have just changed nameservers, the change can take from a few minutes to a few hours to take effect. Wait for the **Active** status before going further.

Also check that no old **MX** record is lying around in your DNS zone. Some registrars add them by default, pointing to their own mail service. MX records tell the world which server receives mail for your domain: only one service can be in charge, and it will be Cloudflare.

## Setup, step by step

1. In the Cloudflare dashboard, open your domain, then **Email** → **Email Routing**.
2. Click **Get started**. Cloudflare offers to create your first address.
3. In **Custom address**, type the part before the `@`, for example `support`.
4. In **Action**, choose **Send to an email**, then enter your destination address, your Gmail for example.
5. Cloudflare sends a verification message to that address. Open it and confirm: until the destination is verified, nothing will be forwarded to it.
6. Cloudflare then offers to add the required DNS records (**Add records and enable**): the MX records and a TXT record for SPF. Accept: it creates them in your zone itself.
7. Check that the Email Routing status switches to **Active**.

To add more addresses later, open the **Routing rules** tab and create a new custom address. A destination that is already verified does not need verifying again.

## Testing

From a **different** address than the destination, send a message to `support@your-domain.ci`. Gmail sometimes hides messages you send to yourself: a test from a friend's phone, or from a second address, is more reliable.

The message should arrive within seconds. If it does not:

- look in the destination's spam folder;
- check in Cloudflare that the destination is indeed **verified**;
- open the **Activity log** in the Email Routing overview: every message received appears there, with its status, forwarded or rejected.

In Gmail, create a filter on `to:support@your-domain.ci` that applies a label to these messages: you will tell work mail from personal mail at a glance.

## Replying from your professional address

This is the first limit people run into: Email Routing **receives**, it does not **send**. If you reply from Gmail without changing anything, your customer sees your Gmail address, and the professional touch evaporates.

Gmail can send "as" another address, but for a domain that is not its own, it requires a sending server (SMTP). So you need an email sending service. Several transactional email providers offer a free tier that is enough for a few dozen messages a day.

The steps:

1. Create an account with a sending provider and register your domain there. It gives you DNS records to add in Cloudflare: one for **DKIM** (the signature on your messages), and an addition to your **SPF**.
2. Get its SMTP credentials: server, port, username, password.
3. In Gmail, open **Settings** → **See all settings** → **Accounts and Import** → **Send mail as** → **Add another email address**.
4. Enter `support@your-domain.ci`, then the provider's SMTP credentials.
5. Gmail sends a confirmation code to `support@your-domain.ci`. Thanks to Email Routing, it lands… in your Gmail. The loop is closed.

When writing a message, you then pick the sending address in the **From** field. In the same settings, the **Reply from the same address the message was sent to** option picks the right address for you.

A word of caution about **SPF**: a domain must have **only one**. Cloudflare created one in step 6; do not add a second one for the sending provider, extend the first. It will look like this:

```text
v=spf1 include:_spf.mx.cloudflare.net include:<your-provider's> ~all
```

Two separate SPF records invalidate both, and your messages end up in spam.

## Protecting your domain

A few settings stop others from using your domain name to send scams:

- add a **DMARC** record. Start with `v=DMARC1; p=none; rua=mailto:dmarc@your-domain.ci` to receive the reports, after first creating a routing rule for `dmarc@`, otherwise they get lost. Then move to `p=quarantine` once all your legitimate mail passes the checks;
- only enable the **catch-all** address, which forwards any address on the domain, if you really need it: it attracts spam sent to made-up addresses;
- if an address is no longer used, delete its rule instead of leaving it forwarding into the void.

## The limits, and when to move to a real mailbox

Email Routing is a very good starting point, not a business email suite:

- **no storage of your own**: everything depends on the destination mailbox. If you lose access to that Gmail, you lose your work mail;
- **no native sending**: you need the SMTP service described above, with its quotas;
- **no separate accounts**: a colleague who leaves keeps the history in their own mailbox if that is where the mail was going;
- **no shared calendar or team tools**.

When the team grows, or when several people need to share one mailbox with its history, a paid professional email service becomes a real investment, not window dressing. Until then, Email Routing gives you credible professional addresses for zero francs.

## The checklist

| Step | Where | Why |
| --- | --- | --- |
| Domain active on Cloudflare | Registrar, then Cloudflare | Cloudflare must manage the DNS zone |
| Old MX records removed | DNS | A single service receives the domain's mail |
| Address created and destination verified | Email Routing | Nothing is forwarded to an unverified address |
| MX and SPF added by Cloudflare | DNS | The world knows where to deliver your mail |
| Test from another address | Another mailbox | Gmail sometimes hides your own messages |
| Send mail as, through SMTP | Gmail and sending provider | Reply from the professional address |
| A single SPF, plus DKIM and DMARC | DNS | Deliverability, and protection against spoofing |
