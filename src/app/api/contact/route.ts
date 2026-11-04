import { NextResponse, type NextRequest } from "next/server";
import { replyUrl } from "@/lib/contact-reply";

/**
 * Formulaire de contact → e-mail (Mailtrap) et/ou message Telegram.
 *
 * Les jetons restent côté serveur : le navigateur poste ici, cette fonction
 * Vercel parle à Mailtrap et à l'API Bot de Telegram. Chaque canal configuré
 * reçoit le message ; l'envoi réussit si au moins un canal l'a accepté.
 * Variables (voir `.env.example`) :
 * - `MAILTRAP_API_TOKEN` + `MAILTRAP_FROM_EMAIL` : canal e-mail, jeton et
 *   adresse d'un domaine d'envoi vérifié ;
 * - `MAILTRAP_SANDBOX_INBOX_ID` (facultatif) : bascule vers la boîte de test
 *   Mailtrap au lieu d'un envoi réel, pour le développement local ;
 * - `CONTACT_TO_EMAIL` (facultatif) : destinataire, par défaut l'adresse publique ;
 * - `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID` : canal Telegram, jeton du bot
 *   (@BotFather) et conversation qui reçoit les messages.
 */

const SEND_URL = "https://send.api.mailtrap.io/api/send";
const SANDBOX_URL = "https://sandbox.api.mailtrap.io/api/send";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Un humain met plus de 3 secondes à écrire un message ; un robot, non. */
const MIN_FILL_MS = 3000;

/**
 * Limite par IP, par instance : un garde-fou, pas une vraie protection —
 * chaque instance Vercel a sa mémoire. La limite qui fait foi est la règle
 * de rate limiting Cloudflare posée sur `/api/contact`.
 */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_PER_WINDOW;
}

function allowedOrigin(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  try {
    const { hostname } = new URL(origin);
    return (
      hostname === req.nextUrl.hostname ||
      hostname === "developer.wadibu.ci" ||
      hostname === "localhost" ||
      hostname.endsWith(".vercel.app")
    );
  } catch {
    return false;
  }
}

const clean = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/** De 8 à 15 chiffres (norme E.164), espaces, points, tirets et « + » libres. */
const phoneOk = (v: string) => /^\+?[\d\s.()-]+$/.test(v) && /^\d{8,15}$/.test(v.replace(/\D/g, ""));

/**
 * Numéro au format international, chiffres seuls (ce qu'attend wa.me). Un
 * numéro ivoirien saisi sans indicatif (10 chiffres commençant par 0) reçoit
 * le 225 ; « 00 » en tête vaut « + ».
 */
function intlPhone(v: string) {
  let digits = v.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  else if (!v.startsWith("+") && digits.length === 10 && digits.startsWith("0")) digits = `225${digits}`;
  return digits;
}

/** « +225 07 69 88 37 30 » pour un numéro ivoirien, « +<chiffres> » sinon. */
const showPhone = (digits: string) =>
  digits.length === 13 && digits.startsWith("225")
    ? `+225 ${digits.slice(3).replace(/(\d{2})(?=\d)/g, "$1 ")}`
    : `+${digits}`;

export async function POST(req: NextRequest) {
  if (!allowedOrigin(req)) {
    return NextResponse.json({ code: "forbidden_origin" }, { status: 403 });
  }

  const ip =
    req.headers.get("cf-connecting-ip") ?? req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (limited(ip)) {
    return NextResponse.json({ code: "rate_limited" }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ code: "invalid_json" }, { status: 400 });
  }

  // Piège rempli ou formulaire envoyé trop vite : on répond comme si tout
  // allait bien, pour ne pas apprendre au robot ce qui l'a trahi.
  if (clean(body.website, 200) || Number(body.elapsed ?? 0) < MIN_FILL_MS) {
    return NextResponse.json({ ok: true });
  }

  const name = clean(body.name, 100);
  const email = clean(body.email, 200);
  const phone = clean(body.phone, 30);
  const message = clean(body.message, 5000);
  const id = clean(body.id, 80);
  const lang = body.lang === "en" ? "en" : "fr";
  if (!name || !phoneOk(phone) || !EMAIL_RE.test(email) || message.length < 10) {
    return NextResponse.json({ code: "invalid_fields" }, { status: 422 });
  }

  const contact: Contact = { name, email, phone: intlPhone(phone), message, id, lang };
  const results = await Promise.all([sendMail(contact), sendTelegram(contact)]);
  const tried = results.filter((r) => r !== null);
  if (tried.length === 0) {
    console.error("contact: aucun canal configuré (Mailtrap ou Telegram)");
    return NextResponse.json({ code: "mail_not_configured" }, { status: 503 });
  }
  if (!tried.includes(true)) {
    return NextResponse.json({ code: "send_failed" }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}

/** `phone` : chiffres au format international, sans « + » (voir `intlPhone`). */
type Contact = { name: string; email: string; phone: string; message: string; id: string; lang: "fr" | "en" };

/** `null` : canal non configuré ; sinon, l'envoi a-t-il été accepté. */
async function sendMail(c: Contact): Promise<boolean | null> {
  const token = process.env.MAILTRAP_API_TOKEN;
  const from = process.env.MAILTRAP_FROM_EMAIL;
  if (!token || !from) return null;

  const sandbox = process.env.MAILTRAP_SANDBOX_INBOX_ID;
  const url = sandbox ? `${SANDBOX_URL}/${sandbox}` : SEND_URL;
  const to = process.env.CONTACT_TO_EMAIL || "stephanekonan.dev@gmail.com";

  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: { email: from, name: "Portfolio Stéphane Konan" },
      to: [{ email: to }],
      // Répondre au message écrit directement au visiteur.
      reply_to: { email: c.email, name: c.name },
      subject: `Portfolio : message de ${c.name}`,
      text: `${c.message}\n\n--\n${c.name} <${c.email}>\nWhatsApp : ${showPhone(c.phone)} (https://wa.me/${c.phone})\nLangue : ${c.lang}\nRéférence : ${c.id || "aucune"}`,
      category: "portfolio-contact",
      // La référence voyage avec le message : un envoi rejoué depuis la file
      // hors ligne se reconnaît dans la boîte de réception.
      custom_variables: { client_request_id: c.id, lang: c.lang },
    }),
    signal: AbortSignal.timeout(15_000),
  }).catch((err: unknown) => {
    console.error("contact: Mailtrap injoignable", err);
    return null;
  });

  if (!res?.ok) {
    if (res) console.error("contact: Mailtrap a refusé l'envoi", res.status, await res.text());
    return false;
  }
  return true;
}

/** Échappe le texte du visiteur pour le mode HTML de Telegram. */
const html = (v: string) => v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Telegram limite un message à 4 096 caractères. */
const TELEGRAM_MAX = 4096;

async function sendTelegram(c: Contact): Promise<boolean | null> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return null;

  // Le lien ouvre WhatsApp avec une première phrase déjà écrite.
  const hello =
    c.lang === "en"
      ? `Hello ${c.name}, thank you for your message on my portfolio.`
      : `Bonjour ${c.name}, merci pour votre message sur mon portfolio.`;
  const wa = `https://wa.me/${c.phone}?text=${encodeURIComponent(hello)}`;
  const when = new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Africa/Abidjan",
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date());

  const head =
    `🔔 <b>Nouveau message · Portfolio</b>\n\n` +
    `👤 <b>Nom</b> : ${html(c.name)}\n` +
    `📱 <b>WhatsApp</b> : <a href="${html(wa)}">${showPhone(c.phone)}</a>\n` +
    `✉️ <b>E-mail</b> : ${html(c.email)}\n\n` +
    `💬 <b>Message</b>\n<blockquote expandable>`;
  const foot =
    `</blockquote>\n\n` +
    `🌐 ${c.lang.toUpperCase()} · 🕒 ${when} · Réf. <code>${html(c.id.slice(0, 8) || "aucune")}</code>`;
  // Telegram n'accepte que des liens http(s) dans un bouton : la réponse par
  // e-mail passe par une redirection signée vers un mailto: prérempli.
  const mail = replyUrl({ email: c.email, name: c.name, lang: c.lang });
  const buttons = [
    [{ text: "💬 Répondre sur WhatsApp", url: wa }],
    ...(mail ? [[{ text: "✉️ Répondre par e-mail", url: mail }]] : []),
  ];

  const room = TELEGRAM_MAX - head.length - foot.length;
  let text = html(c.message);
  // Couper au milieu d'une entité (&amp;…) laisserait un HTML invalide, refusé.
  if (text.length > room) text = text.slice(0, room - 1).replace(/&[a-z]*$/, "") + "…";

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: head + text + foot,
      parse_mode: "HTML",
      link_preview_options: { is_disabled: true },
      reply_markup: { inline_keyboard: buttons },
    }),
    signal: AbortSignal.timeout(15_000),
  }).catch((err: unknown) => {
    // Le jeton est dans l'URL : ne journaliser que le message d'erreur.
    console.error("contact: Telegram injoignable", err instanceof Error ? err.message : "");
    return null;
  });

  if (!res?.ok) {
    if (res) console.error("contact: Telegram a refusé l'envoi", res.status, await res.text());
    return false;
  }
  return true;
}
