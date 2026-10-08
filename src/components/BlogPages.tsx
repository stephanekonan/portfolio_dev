import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  base,
  type Lang,
  ui,
} from "@/i18n/ui";
import {
  formatDate,
  getPost,
  getPosts,
  getSlugs,
} from "@/lib/blog";

import PostList from "./PostList";

export function BlogIndex({ lang }: { lang: Lang }) {
  const t = ui[lang].blog;
  return (
    <div className="mx-auto max-w-304 px-4 pb-28 pt-14 sm:px-8">
      <h1 className="font-display text-3xl font-extrabold font-stretch-140%">{t.title}</h1>
      <p className="mb-12 mt-4 max-w-[56ch] text-lg text-ink-2">{t.lead}</p>
      <PostList posts={getPosts(lang)} lang={lang} />
    </div>
  );
}

export function blogIndexMetadata(lang: Lang): Metadata {
  const t = ui[lang].blog;
  return {
    title: t.title,
    description: t.lead,
    alternates: { canonical: `${base(lang)}/blog`, languages: { fr: "/blog", en: "/en/blog" } },
  };
}

export function BlogArticle({ lang, slug }: { lang: Lang; slug: string }) {
  const post = getPost(slug, lang);
  if (!post) notFound();
  const t = ui[lang].blog;
  return (
    <article lang={post.lang} className="mx-auto max-w-304 px-4 pb-28 pt-12 sm:px-8">
      <Link href={`${base(lang)}/blog`} className="text-sm font-semibold hover:underline">
        {t.back}
      </Link>
      <header className="mt-10 max-w-[68ch]">
        <p className="text-sm text-ink-2">
          <time dateTime={post.date}>{formatDate(post.date, post.lang)}</time>, {post.minutes} {ui[post.lang].blog.minutes}
        </p>
        <h1 className="mt-4 font-display text-[clamp(2rem,4.6vw,3rem)] font-extrabold leading-[1.05] font-stretch-125%">
          {post.title}
        </h1>
        <p className="mt-5 text-lg text-ink-2">{post.description}</p>
        {post.tags.length > 0 && <p className="mt-5 text-sm text-ink-2">{post.tags.join(", ")}</p>}
      </header>
      <div className="mt-10 border-t border-ink pt-10">
        {/* HTML rendu au build depuis les fichiers Markdown du dépôt : seul
            l'auteur écrit ce contenu, aucune saisie de visiteur n'y passe. */}
        <div className="prose-article" dangerouslySetInnerHTML={{ __html: post.html }} />
      </div>
    </article>
  );
}

export function blogArticleMetadata(lang: Lang, slug: string): Metadata {
  const post = getPost(slug, lang);
  if (!post) return {};
  // Sans traduction, la page sert le texte d'origine : le canonique pointe
  // vers sa vraie langue pour ne pas publier deux fois le même contenu.
  const url = (l: Lang) => `${base(l)}/blog/${slug}`;
  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical: url(post.lang),
      languages: Object.fromEntries(post.langs.map((l) => [l, url(l)])),
    },
    openGraph: { type: "article", title: post.title, description: post.description, publishedTime: post.date },
  };
}

export const blogStaticParams = () => getSlugs().map((slug) => ({ slug }));
