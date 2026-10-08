import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Shell from "@/components/carnet/Shell";
import { TocAside, TocMobile } from "@/components/carnet/Toc";
import Unlock from "@/components/carnet/Unlock";
import { formatDate } from "@/lib/blog";
import { gate } from "@/lib/carnet/access";
import { ARTICLE_CATEGORIES } from "@/lib/carnet/categories";
import { type CarnetArticle, getArticle, getArticles } from "@/lib/carnet/content";

type Props = { params: Promise<{ cle: string; slug: string }> };

/** En dessous, le sommaire encombre plus qu'il n'aide. */
const TOC_MIN = 3;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { cle, open } = await gate(params);
  if (!open) return { title: "Espace privé" };
  const { slug } = await params;
  const post = getArticle(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    keywords: post.tags,
    authors: [{ name: post.author }],
    alternates: { canonical: `/${cle}/${slug}` },
    openGraph: {
      type: "article",
      siteName: "Stéphane Konan",
      locale: "fr_CI",
      title: post.ogTitle,
      description: post.ogDescription,
      publishedTime: post.date,
      modifiedTime: post.updated || undefined,
      authors: [post.author],
      tags: post.tags,
    },
  };
}

function Neighbour({ cle, post, dir }: { cle: string; post?: CarnetArticle; dir: "prev" | "next" }) {
  if (!post) return <div />;
  return (
    <Link
      href={`/${cle}/${post.slug}`}
      rel={dir}
      className={`group block border-t-2 border-ink pt-4 ${dir === "next" ? "sm:text-right" : ""}`}
    >
      <span className="text-sm text-ink-2">{dir === "prev" ? "Article précédent" : "Article suivant"}</span>
      <span className="mt-1 block font-display text-lg font-bold font-stretch-118% group-hover:underline">{post.title}</span>
    </Link>
  );
}

export default async function Page({ params }: Props) {
  const { cle, open } = await gate(params);
  const { slug } = await params;
  if (!open) {
    return (
      <Shell cle={cle} open={false}>
        <Unlock cle={cle} next={`/${cle}/${slug}`} />
      </Shell>
    );
  }

  const all = getArticles();
  const index = all.findIndex((a) => a.slug === slug);
  if (index < 0) notFound();
  const post = all[index];
  const toc = post.toc.length >= TOC_MIN ? post.toc : null;

  return (
    <Shell cle={cle} open>
      {/* Progression de lecture, en CSS seul (animation liée au défilement). */}
      <div aria-hidden className="c-progress" />
      <article lang="fr">
        <header className="max-w-[68ch]">
          <p className="text-sm text-ink-2">
            Article {index + 1} sur {all.length}
            {post.categories.length > 0 && `, ${post.categories.map((c) => ARTICLE_CATEGORIES[c]).join(", ").toLowerCase()}`}
          </p>
          <h1 className="mt-4 font-display text-[clamp(2rem,4.6vw,3rem)] leading-[1.05] font-extrabold font-stretch-125%">
            {post.title}
          </h1>
          <p className="mt-5 text-lg text-ink-2">{post.description}</p>
          <p className="mt-5 text-sm text-ink-2">
            <time dateTime={post.date}>{formatDate(post.date, "fr")}</time>, {post.minutes} min de lecture
            {post.updated && (
              <>
                , mis à jour le <time dateTime={post.updated}>{formatDate(post.updated, "fr")}</time>
              </>
            )}
          </p>
        </header>
        <div className="mt-10 border-t border-ink pt-10 xl:grid xl:grid-cols-[minmax(0,68ch)_minmax(0,1fr)] xl:gap-12">
          <div className="min-w-0">
            {toc && <TocMobile toc={toc} />}
            {/* HTML rendu sur le serveur depuis le Markdown de l'auteur, dans
                carnet/ : aucune saisie de visiteur n'y passe. */}
            <div className="prose-article" dangerouslySetInnerHTML={{ __html: post.html }} />
          </div>
          {toc && (
            <div>
              <TocAside toc={toc} />
            </div>
          )}
        </div>
        {post.tags.length > 0 && <p className="mt-12 max-w-[68ch] text-sm text-ink-2">{post.tags.join(", ")}</p>}
      </article>
      <nav aria-label="Autres articles de la série" className="mt-16 grid max-w-[68ch] gap-8 sm:grid-cols-2">
        <Neighbour cle={cle} post={all[index - 1]} dir="prev" />
        <Neighbour cle={cle} post={all[index + 1]} dir="next" />
      </nav>
    </Shell>
  );
}
