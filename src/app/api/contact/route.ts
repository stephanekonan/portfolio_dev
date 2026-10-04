import { NextResponse, type NextRequest } from "next/server";

/**
 * Formulaire de contact → API d'envoi Mailtrap.
 *
 * Le jeton reste côté serveur : le navigateur poste ici, cette fonction
 * Vercel parle à Mailtrap. Variables (voir `.env.example`) :
 * - `MAILTRAP_API_TOKEN` (requis) : jeton d'un domaine d'envoi vérifié ;
 * - `MAILTRAP_FROM_EMAIL` (requis) : adresse de ce domaine, ex. portfolio@wadibu.ci ;
 * - `MAILTRAP_SANDBOX_INBOX_ID` (facultatif) : bascule vers la boîte de test
 *   Mailtrap au lieu d'un envoi réel, pour le développement local ;
 * - `CONTACT_TO_EMAIL` (facultatif) : destinataire, par défaut l'adresse publique.
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
  const message = clean(body.message, 5000);
  const id = clean(body.id, 80);
  const lang = body.lang === "en" ? "en" : "fr";
  if (!name || !EMAIL_RE.test(email) || message.length < 10) {
    return NextResponse.json({ code: "invalid_fields" }, { status: 422 });
  }

  const token = process.env.MAILTRAP_API_TOKEN;
  const from = process.env.MAILTRAP_FROM_EMAIL;
  if (!token || !from) {
    console.error("contact: MAILTRAP_API_TOKEN ou MAILTRAP_FROM_EMAIL manquant");
    return NextResponse.json({ code: "mail_not_configured" }, { status: 503 });
  }

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
      reply_to: { email, name },
      subject: `Portfolio : message de ${name}`,
      text: `${message}\n\n--\n${name} <${email}>\nLangue : ${lang}\nRéférence : ${id || "aucune"}`,
      category: "portfolio-contact",
      // La référence voyage avec le message : un envoi rejoué depuis la file
      // hors ligne se reconnaît dans la boîte de réception.
      custom_variables: { client_request_id: id, lang },
    }),
    signal: AbortSignal.timeout(15_000),
  }).catch((err: unknown) => {
    console.error("contact: Mailtrap injoignable", err);
    return null;
  });

  if (!res?.ok) {
    if (res) console.error("contact: Mailtrap a refusé l'envoi", res.status, await res.text());
    return NextResponse.json({ code: "send_failed" }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
