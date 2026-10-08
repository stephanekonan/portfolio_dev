import "server-only";

import {
  createHash,
  createHmac,
  hkdfSync,
  timingSafeEqual,
} from "node:crypto";

import { cookies } from "next/headers";
import { notFound } from "next/navigation";

/**
 * L'espace privé tient sur trois variables d'environnement, absentes du dépôt
 * (public) :
 *
 * - `CARNET_PATH` : le premier segment de l'URL. Rien dans le code ne le
 *   nomme, l'adresse n'est donc connue que de qui l'a reçue ;
 * - `CARNET_CODE` : le code d'accès saisi par le lecteur ;
 * - `CARNET_SECRET` : une valeur longue et aléatoire, qui chiffre le contenu
 *   (voir `content.ts`) et signe le cookie de session.
 *
 * Une variable manquante, et l'espace n'existe pas : toutes ses URL
 * répondent 404.
 */
const COOKIE = "carnet";
export const SESSION_DAYS = 1;

const config = () => ({
  path: process.env.CARNET_PATH?.trim() ?? "",
  code: process.env.CARNET_CODE ?? "",
  secret: process.env.CARNET_SECRET ?? "",
});

/** Comparaison en temps constant : la durée ne dit rien de la valeur attendue. */
function same(a: string, b: string) {
  const digest = (s: string) => createHash("sha256").update(s).digest();
  return timingSafeEqual(digest(a), digest(b));
}

/**
 * Clé dérivée du secret, une par usage : le chiffrement du contenu et la
 * signature des sessions ne partagent jamais la même clé. Le script
 * `scripts/carnet.mjs` dérive la clé de contenu de la même façon.
 */
export function deriveKey(purpose: "contenu" | "session") {
  return Buffer.from(hkdfSync("sha256", config().secret, "", `carnet:${purpose}`, 32));
}

export function isKey(cle: string) {
  const { path, code, secret } = config();
  return Boolean(path && code && secret) && same(cle, path);
}

export const checkCode = (code: string) => same(code, config().code);

/**
 * Jeton de session : `expiration.signature`. La signature couvre aussi
 * l'empreinte du code : changer le code d'accès déconnecte tout le monde.
 */
function sign(exp: number) {
  const codeHash = createHash("sha256").update(config().code).digest("hex");
  return createHmac("sha256", deriveKey("session")).update(`${exp}.${codeHash}`).digest("base64url");
}

export function newSession() {
  const exp = Math.floor(Date.now() / 1000) + SESSION_DAYS * 86400;
  return `${exp}.${sign(exp)}`;
}

function verify(token: string) {
  const [exp, signature] = token.split(".");
  const n = Number(exp);
  if (!Number.isInteger(n) || n < Date.now() / 1000 || !signature) return false;
  return same(signature, sign(n));
}

/** Le cookie ne vaut que sous l'URL privée : le reste du site ne le voit pas. */
export const sessionCookie = (cle: string) => ({
  name: COOKIE,
  path: `/${cle}`,
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: SESSION_DAYS * 86400,
});

/**
 * À appeler en tête de chaque page et de chaque `generateMetadata` : une
 * clé fausse donne un 404 indiscernable d'une page inexistante ; une clé
 * juste sans session valide donne `open: false`, la page affiche alors le
 * formulaire de code et rien d'autre.
 */
export async function gate(params: Promise<{ cle: string }>) {
  const { cle } = await params;
  if (!isKey(cle)) notFound();
  const token = (await cookies()).get(COOKIE)?.value;
  return { cle, open: Boolean(token && verify(token)) };
}
