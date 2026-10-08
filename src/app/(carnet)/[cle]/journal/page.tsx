import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Shell from "@/components/carnet/Shell";
import Unlock from "@/components/carnet/Unlock";
import { formatDate } from "@/lib/blog";
import { gate } from "@/lib/carnet/access";
import { JOURNAL_CATEGORIES, type JournalCategory, isJournalCategory } from "@/lib/carnet/categories";
import { getJournal } from "@/lib/carnet/content";

type Props = {
  params: Promise<{ cle: string }>;
  searchParams: Promise<{ categorie?: string }>;
};

const LEAD =
  "Les entrées courtes, datées, la plus récente en haut. Ce qui s'est passé, ce que j'en ai tiré, sans attendre d'avoir du recul.";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { cle, open } = await gate(params);
  if (!open) return { title: "Espace privé" };
  return { title: "Journal", description: LEAD, alternates: { canonical: `/${cle}/journal` } };
}

export default async function Page({ params, searchParams }: Props) {
  const { cle, open } = await gate(params);
  if (!open) {
    return (
      <Shell cle={cle} open={false}>
        <Unlock cle={cle} next={`/${cle}/journal`} />
      </Shell>
    );
  }

  const { categorie = "" } = await searchParams;
  const active = isJournalCategory(categorie) ? categorie : null;
  const all = getJournal();
  const entries = active ? all.filter((e) => e.category === active) : all;
  const count = (k: JournalCategory) => all.filter((e) => e.category === k).length;

  return (
    <Shell cle={cle} open>
      <h1 className="font-display text-3xl font-extrabold font-stretch-140%">Journal</h1>
      <p className="mt-4 max-w-[56ch] text-lg text-ink-2">{LEAD}</p>

      <nav aria-label="Filtrer par catégorie" className="mt-10">
        <ul className="flex flex-wrap gap-2 text-sm">
          {[null, ...(Object.keys(JOURNAL_CATEGORIES) as JournalCategory[])].map((k) => {
            const current = k === active;
            const n = k ? count(k) : all.length;
            return (
              <li key={k ?? "tout"}>
                <Link
                  href={k ? `/${cle}/journal?categorie=${k}` : `/${cle}/journal`}
                  aria-current={current ? "page" : undefined}
                  scroll={false}
                  className={`inline-flex items-center gap-1.5 border px-3 py-1.5 transition-colors ${
                    current
                      ? "border-ink bg-ink text-paper"
                      : n === 0
                        ? "border-rule text-ink-2/70 hover:border-ink-2"
                        : "border-rule text-ink-2 hover:border-ink hover:text-ink"
                  }`}
                >
                  {k && <span aria-hidden>{JOURNAL_CATEGORIES[k].emoji}</span>}
                  {k ? JOURNAL_CATEGORIES[k].label : "Tout"}
                  <span className="tabular-nums opacity-70">{n}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {entries.length === 0 ? (
        <p className="mt-12 border-t border-rule pt-6 text-ink-2">
          Rien dans cette catégorie pour l&apos;instant.{" "}
          <Link href={`/${cle}/journal`} className="font-semibold text-ink underline">
            Voir toutes les entrées
          </Link>
        </p>
      ) : (
        <ol className="c-feed mt-12">
          {entries.map((e) => (
            <li key={e.id} id={e.id} className="scroll-mt-24">
              <div className="c-feed-meta">
                <time dateTime={e.date} className="font-semibold text-ink">
                  {formatDate(e.date, "fr")}
                </time>
                {e.day !== null && <span>Jour {e.day}</span>}
                {e.category && (
                  <span>
                    <span aria-hidden>{JOURNAL_CATEGORIES[e.category].emoji} </span>
                    {JOURNAL_CATEGORIES[e.category].label}
                  </span>
                )}
              </div>
              <article className="min-w-0">
                <h2 className="font-display text-xl font-bold font-stretch-118%">
                  <a href={`#${e.id}`} className="hover:underline">
                    {e.title}
                  </a>
                </h2>
                {e.photo && (
                  <Image
                    src={e.photo.src}
                    alt={e.photo.alt}
                    width={1200}
                    height={900}
                    sizes="(min-width: 768px) 68ch, 100vw"
                    // Une photo hébergée ailleurs est servie telle quelle :
                    // l'optimiseur n'accepte que les domaines déclarés.
                    unoptimized={!e.photo.src.startsWith("/")}
                    className="mt-6 h-auto w-full max-w-[68ch] border border-rule"
                  />
                )}
                {/* HTML rendu depuis le Markdown de l'auteur (carnet/journal). */}
                <div className="prose-article mt-5" dangerouslySetInnerHTML={{ __html: e.html }} />
                {e.figures.length > 0 && (
                  <dl className="c-figs mt-8 max-w-[68ch]">
                    {e.figures.map((f) => (
                      <div key={f.label}>
                        <dt>{f.label}</dt>
                        <dd>{f.value}</dd>
                      </div>
                    ))}
                  </dl>
                )}
                {(e.conclusion || e.next) && (
                  <dl className="mt-8 grid max-w-[68ch] gap-px border border-rule bg-rule sm:grid-cols-2">
                    {e.conclusion && (
                      <div className="bg-raised p-4">
                        <dt className="text-sm text-ink-2">Ce que j&apos;en retiens</dt>
                        <dd className="mt-1 font-semibold" dangerouslySetInnerHTML={{ __html: e.conclusion }} />
                      </div>
                    )}
                    {e.next && (
                      <div className="bg-paper p-4">
                        <dt className="text-sm text-ink-2">Prochaine étape</dt>
                        <dd className="mt-1" dangerouslySetInnerHTML={{ __html: e.next }} />
                      </div>
                    )}
                  </dl>
                )}
              </article>
            </li>
          ))}
        </ol>
      )}
    </Shell>
  );
}
