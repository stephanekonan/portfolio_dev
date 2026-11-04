import { createHmac, timingSafeEqual } from "node:crypto";
import { SITE_URL } from "@/lib/metadata";

/**
 * Bouton « Répondre par e-mail » de l'alerte Telegram. Telegram n'accepte
 * que des liens http(s) dans un bouton : le bouton pointe vers
 * `/api/contact/reply`, qui redirige vers un `mailto:` prérempli.
 *
 * Le lien est signé (HMAC dérivé du jeton du bot) : la route ne sert que les
 * liens émis par l'alerte, pas une adresse et un texte choisis par un tiers.
 */

export interface ReplyTarget {
  email: string;
  name: string;
  lang: "fr" | "en";
}

const secret = () => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  return token ? `contact-reply:${token}` : null;
};

const sign = (key: string, t: ReplyTarget) =>
  createHmac("sha256", key).update(`${t.email}\n${t.name}\n${t.lang}`).digest("base64url");

/** Lien absolu vers le site public : Telegram refuse une URL localhost. */
export function replyUrl(t: ReplyTarget): string | null {
  const key = secret();
  if (!key) return null;
  const q = new URLSearchParams({ to: t.email, n: t.name, l: t.lang, s: sign(key, t) });
  return `${SITE_URL}/api/contact/reply?${q}`;
}

/** Le `mailto:` prérempli, ou `null` si la signature ne correspond pas. */
export function mailtoFor(params: URLSearchParams): string | null {
  const key = secret();
  const email = params.get("to") ?? "";
  const name = params.get("n") ?? "";
  const lang = params.get("l") === "en" ? "en" : "fr";
  const given = Buffer.from(params.get("s") ?? "");
  if (!key || !email) return null;
  const expected = Buffer.from(sign(key, { email, name, lang }));
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;

  const subject = lang === "en" ? "Re: your message on my portfolio" : "Re : votre message sur mon portfolio";
  const body =
    lang === "en"
      ? `Hello ${name},\n\nThank you for your message.\n\n`
      : `Bonjour ${name},\n\nMerci pour votre message.\n\n`;
  // encodeURIComponent et non URLSearchParams : un « + » serait lu comme un
  // « + » par les clients mail, pas comme une espace.
  const to = encodeURIComponent(email).replace("%40", "@");
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
