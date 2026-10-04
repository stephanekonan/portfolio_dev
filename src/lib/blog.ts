import "server-only";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";
import type { Lang } from "@/i18n/ui";

/**
 * Un article = un fichier Markdown dans `content/blog/`. Le nom du fichier
 * donne l'URL (`mon-article.md` → `/blog/mon-article`) ; l'en-tête YAML porte
 * le reste. Un article en `draft: true` n'est pas publié.
 */
const DIR = path.join(process.cwd(), "content", "blog");

export interface PostMeta {
  slug: string;
  title: string;
  description: string;
  /** Date de publication, `AAAA-MM-JJ`. */
  date: string;
  lang: Lang;
  tags: string[];
  minutes: number;
}

export interface Post extends PostMeta {
  html: string;
}

function read(file: string): Post | null {
  const raw = fs.readFileSync(path.join(DIR, file), "utf8");
  const { data, content } = matter(raw);
  if (data.draft) return null;
  const words = content.split(/\s+/).filter(Boolean).length;
  return {
    slug: file.replace(/\.md$/, ""),
    title: String(data.title ?? file),
    description: String(data.description ?? ""),
    // gray-matter lit une date YAML nue comme un objet Date.
    date: data.date instanceof Date ? data.date.toISOString().slice(0, 10) : String(data.date ?? ""),
    lang: data.lang === "en" ? "en" : "fr",
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    minutes: Math.max(1, Math.round(words / 220)),
    html: marked.parse(content, { async: false }),
  };
}

export function getPosts(): Post[] {
  if (!fs.existsSync(DIR)) return [];
  return fs
    .readdirSync(DIR)
    .filter((f) => f.endsWith(".md"))
    .map(read)
    .filter((p): p is Post => p !== null)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getPost(slug: string): Post | undefined {
  return getPosts().find((p) => p.slug === slug);
}

export const formatDate = (date: string, lang: Lang) =>
  new Date(`${date}T12:00:00`).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
