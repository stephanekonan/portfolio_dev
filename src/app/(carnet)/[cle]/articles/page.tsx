import type { Metadata } from "next";
import Link from "next/link";
import PostList from "@/components/PostList";
import Shell from "@/components/carnet/Shell";
import Unlock from "@/components/carnet/Unlock";
import { gate } from "@/lib/carnet/access";
import { ARTICLE_CATEGORIES, type ArticleCategory, isArticleCategory } from "@/lib/carnet/categories";
import { getArticles } from "@/lib/carnet/content";

type Props = {
  params: Promise<{ cle: string }>;
  searchParams: Promise<{ categorie?: string }>;
};

const LEAD = "Les textes de fond, du plus ancien au plus récent dans l'ordre de lecture. Filtrez par thème si vous cherchez un sujet précis.";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { cle, open } = await gate(params);
  if (!open) return { title: "Espace privé" };
  return { title: "Articles", description: LEAD, alternates: { canonical: `/${cle}/articles` } };
}

export default async function Page({ params, searchParams }: Props) {
  const { cle, open } = await gate(params);
  if (!open) {
    return (
      <Shell cle={cle} open={false}>
        <Unlock cle={cle} next={`/${cle}/articles`} />
      </Shell>
    );
  }

  const { categorie = "" } = await searchParams;
  const articles = getArticles();
  const active = isArticleCategory(categorie) ? categorie : null;
  const shown = active ? articles.filter((a) => a.categories.includes(active)) : articles;
  // Seuls les thèmes qui ont au moins un article servent de filtre.
  const used = (Object.keys(ARTICLE_CATEGORIES) as ArticleCategory[]).filter((k) =>
    articles.some((a) => a.categories.includes(k)),
  );
  const kicker = new Map(articles.map((a) => [a.slug, a.categories.map((c) => ARTICLE_CATEGORIES[c]).join(", ")]));

  return (
    <Shell cle={cle} open>
      <h1 className="font-display text-3xl font-extrabold font-stretch-140%">Articles</h1>
      <p className="mt-4 max-w-[56ch] text-lg text-ink-2">{LEAD}</p>

      {used.length > 1 && (
        <nav aria-label="Filtrer par thème" className="mt-10">
          <ul className="flex flex-wrap gap-2 text-sm">
            {[null, ...used].map((k) => {
              const current = k === active;
              return (
                <li key={k ?? "tout"}>
                  <Link
                    href={k ? `/${cle}/articles?categorie=${k}` : `/${cle}/articles`}
                    aria-current={current ? "page" : undefined}
                    scroll={false}
                    className={`inline-block border px-3 py-1.5 transition-colors ${
                      current ? "border-ink bg-ink text-paper" : "border-rule text-ink-2 hover:border-ink hover:text-ink"
                    }`}
                  >
                    {k ? ARTICLE_CATEGORIES[k] : "Tous"}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}

      <div className="mt-10">
        <PostList posts={shown} lang="fr" href={(slug) => `/${cle}/${slug}`} kicker={(p) => kicker.get(p.slug)} />
      </div>
    </Shell>
  );
}
