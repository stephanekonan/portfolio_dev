import "server-only";
import { createDecipheriv } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { PostMeta } from "@/lib/blog";
import sealed from "../../../content/carnet.sealed.json";
import { deriveKey } from "./access";
import {
  type ArticleCategory,
  type JournalCategory,
  isArticleCategory,
  isJournalCategory,
} from "./categories";
import { type Figures, type TocItem, render, renderInline, toDay } from "./markdown";

/**
 * Le dépôt est public : le texte du carnet n'y entre jamais en clair.
 *
 * - On écrit dans `carnet/` (ignoré par git) : `articles/*.md`,
 *   `journal/*.md`, `chiffres.md`.
 * - `npm run carnet:seal` chiffre tout le dossier (AES-256-GCM, clé tirée de
 *   `CARNET_SECRET`) dans `content/carnet.sealed.json`, qui est versionné.
 * - En production, les pages déchiffrent ce fichier. En développement, elles
 *   lisent `carnet/` directement s'il existe : on relit sans resceller.
 *
 * Un fichier dont le nom commence par `_` (modèle, brouillon) est ignoré,
 * comme un en-tête `draft: true`.
 */
const SOURCE = path.join(process.cwd(), "carnet");

type Files = Record<string, string>;

function readSource(dir = SOURCE, prefix = ""): Files {
  const out: Files = {};
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = prefix + entry.name;
    if (entry.isDirectory()) Object.assign(out, readSource(path.join(dir, entry.name), `${rel}/`));
    else if (entry.name.endsWith(".md")) out[rel] = fs.readFileSync(path.join(dir, entry.name), "utf8");
  }
  return out;
}

let opened: Files | undefined;

function decrypt(): Files {
  if (opened) return opened;
  try {
    const decipher = createDecipheriv("aes-256-gcm", deriveKey("contenu"), Buffer.from(sealed.iv, "base64"));
    decipher.setAuthTag(Buffer.from(sealed.tag, "base64"));
    const json = Buffer.concat([decipher.update(Buffer.from(sealed.data, "base64")), decipher.final()]);
    opened = (JSON.parse(json.toString("utf8")) as { files: Files }).files;
  } catch {
    // Mauvais secret ou fichier abîmé : carnet vide plutôt qu'une page 500.
    console.error("carnet : impossible de déchiffrer content/carnet.sealed.json (CARNET_SECRET ?)");
    opened = {};
  }
  return opened;
}

const files = (): Files =>
  process.env.NODE_ENV !== "production" && fs.existsSync(SOURCE) ? readSource() : decrypt();

/** Fichiers d'un dossier, sans les modèles ni les brouillons. */
function folder(all: Files, dir: string) {
  return Object.entries(all)
    .filter(([p]) => p.startsWith(`${dir}/`) && !path.posix.basename(p).startsWith("_"))
    .map(([p, raw]) => ({ name: path.posix.basename(p, ".md"), ...matter(raw) }))
    .filter((f) => !f.data.draft);
}

const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);
const str = (v: unknown) => (v == null ? "" : String(v).trim());

function figures(all: Files): Figures {
  const d = all["chiffres.md"] ? matter(all["chiffres.md"]).data : {};
  return {
    updated: toDay(d.mis_a_jour),
    launch: toDay(d.lancement),
    start: toDay(d.debut_plan),
    contacted: num(d.restaurants_contactes),
    partners: num(d.restaurants_partenaires),
    users: num(d.utilisateurs),
    orders: num(d.commandes),
  };
}

export interface CarnetArticle extends PostMeta {
  updated: string;
  author: string;
  categories: ArticleCategory[];
  ogTitle: string;
  ogDescription: string;
  /** Position dans la série : l'article pilier vient en premier. */
  order: number;
  html: string;
  toc: TocItem[];
}

export interface JournalEntry {
  /** Nom du fichier, sert d'ancre : `/journal#2026-10-08-jour-1`. */
  id: string;
  date: string;
  day: number | null;
  title: string;
  category: JournalCategory | null;
  photo: { src: string; alt: string } | null;
  figures: { label: string; value: string }[];
  conclusion: string;
  /** Prochaine étape annoncée dans l'entrée. */
  next: string;
  html: string;
}

export function getFigures() {
  return figures(files());
}

export function getArticles(): CarnetArticle[] {
  const all = files();
  const fig = figures(all);
  return folder(all, "articles")
    .map(({ name, data, content }) => {
      const { html, toc } = render(content, fig);
      const words = content.split(/\s+/).filter(Boolean).length;
      const title = str(data.title) || name;
      const description = str(data.description);
      return {
        slug: name,
        title,
        description,
        date: toDay(data.date),
        updated: toDay(data.maj),
        lang: "fr" as const,
        langs: ["fr" as const],
        author: str(data.auteur) || "Stéphane Konan",
        categories: (Array.isArray(data.categories) ? data.categories.map(String) : []).filter(isArticleCategory),
        tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
        ogTitle: str(data.og_title) || title,
        ogDescription: str(data.og_description) || description,
        order: num(data.ordre) ?? 99,
        minutes: Math.max(1, Math.round(words / 220)),
        html,
        toc,
      };
    })
    .sort((a, b) => a.order - b.order || b.date.localeCompare(a.date));
}

export const getArticle = (slug: string) => getArticles().find((a) => a.slug === slug);

export function getJournal(): JournalEntry[] {
  const all = files();
  const fig = figures(all);
  return folder(all, "journal")
    .map(({ name, data, content }) => {
      const category = str(data.categorie);
      const chiffres = data.chiffres && typeof data.chiffres === "object" ? data.chiffres : {};
      return {
        id: name,
        date: toDay(data.date),
        day: num(data.jour),
        title: str(data.titre) || name,
        category: isJournalCategory(category) ? category : null,
        photo: str(data.photo) ? { src: str(data.photo), alt: str(data.photo_alt) } : null,
        figures: Object.entries(chiffres as Record<string, unknown>).map(([label, value]) => ({
          label,
          value: str(value),
        })),
        conclusion: str(data.conclusion) ? renderInline(str(data.conclusion)) : "",
        next: str(data.suite) ? renderInline(str(data.suite)) : "",
        html: render(content, fig).html,
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date) || (b.day ?? 0) - (a.day ?? 0));
}
