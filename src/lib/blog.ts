import "server-only";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";
import { LANGS, type Lang } from "@/i18n/ui";

/**
 * Un article = un fichier Markdown par langue dans `content/blog/<langue>/`.
 * Le nom du fichier donne l'URL (`fr/mon-article.md` → `/blog/mon-article`) ;
 * sa traduction porte le même nom dans `en/` et sert `/en/blog/mon-article`.
 * L'en-tête YAML porte le reste. Un article en `draft: true` n'est pas publié.
 * Sans traduction, la version disponible est servie dans les deux langues.
 */
const DIR = path.join(process.cwd(), "content", "blog");

export interface PostMeta {
  slug: string;
  title: string;
  description: string;
  /** Date de publication, `AAAA-MM-JJ`. */
  date: string;
  /** Langue du texte servi, qui peut différer de celle de la page. */
  lang: Lang;
  /** Langues dans lesquelles l'article existe. */
  langs: Lang[];
  tags: string[];
  minutes: number;
}

export interface Post extends PostMeta {
  html: string;
}

type Raw = Omit<Post, "langs">;

function read(lang: Lang, file: string): Raw | null {
  const raw = fs.readFileSync(path.join(DIR, lang, file), "utf8");
  const { data, content } = matter(raw);
  if (data.draft) return null;
  const words = content.split(/\s+/).filter(Boolean).length;
  return {
    slug: file.replace(/\.md$/, ""),
    title: String(data.title ?? file),
    description: String(data.description ?? ""),
    // gray-matter lit une date YAML nue comme un objet Date.
    date: data.date instanceof Date ? data.date.toISOString().slice(0, 10) : String(data.date ?? ""),
    lang,
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    minutes: Math.max(1, Math.round(words / 220)),
    html: marked.parse(content, { async: false }),
  };
}

/** Toutes les versions publiées, rangées par slug puis par langue. */
function versions(): Map<string, Partial<Record<Lang, Raw>>> {
  const bySlug = new Map<string, Partial<Record<Lang, Raw>>>();
  for (const lang of LANGS) {
    const dir = path.join(DIR, lang);
    if (!fs.existsSync(dir)) continue;
    for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".md"))) {
      const post = read(lang, file);
      if (!post) continue;
      bySlug.set(post.slug, { ...bySlug.get(post.slug), [lang]: post });
    }
  }
  return bySlug;
}

/** La version dans `lang`, sinon la première disponible. */
function pick(v: Partial<Record<Lang, Raw>>, lang: Lang): Post {
  const langs = LANGS.filter((l) => v[l]);
  return { ...(v[lang] ?? v[langs[0]])!, langs };
}

export function getPosts(lang: Lang): Post[] {
  return [...versions().values()].map((v) => pick(v, lang)).sort((a, b) => b.date.localeCompare(a.date));
}

export function getPost(slug: string, lang: Lang): Post | undefined {
  const v = versions().get(slug);
  return v && pick(v, lang);
}

export const getSlugs = () => [...versions().keys()];

export const formatDate = (date: string, lang: Lang) =>
  new Date(`${date}T12:00:00`).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
