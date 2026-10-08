import type { Metadata } from "next";
import Link from "next/link";
import DayRibbon from "@/components/carnet/DayRibbon";
import Shell from "@/components/carnet/Shell";
import Unlock from "@/components/carnet/Unlock";
import { formatDate } from "@/lib/blog";
import { gate } from "@/lib/carnet/access";
import { ARTICLE_CATEGORIES, JOURNAL_CATEGORIES } from "@/lib/carnet/categories";
import { getArticles, getFigures, getJournal } from "@/lib/carnet/content";
import { figuresHtml } from "@/lib/carnet/markdown";

type Props = { params: Promise<{ cle: string }> };

const TITLE = "Construire en avançant";
const LEAD =
  "Ce que je vis en lançant Wadibu à Agboville, et ce que je règle sur moi-même en même temps. Écrit au fur et à mesure, pour pouvoir relire dans six mois où j'en étais.";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { cle, open } = await gate(params);
  if (!open) return { title: "Espace privé" };
  return { title: { absolute: `${TITLE}, carnet de Stéphane Konan` }, description: LEAD, alternates: { canonical: `/${cle}` } };
}

function Heading({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex items-baseline justify-between gap-4 border-t border-ink pt-5">
      <h2 className="font-display text-xl font-bold font-stretch-120%">{children}</h2>
      {action}
    </div>
  );
}

export default async function Page({ params }: Props) {
  const { cle, open } = await gate(params);
  if (!open) {
    return (
      <Shell cle={cle} open={false}>
        <Unlock cle={cle} next={`/${cle}`} />
      </Shell>
    );
  }

  const articles = getArticles();
  const journal = getJournal();
  const figures = getFigures();
  const last = journal[0];

  return (
    <Shell cle={cle} open>
      <h1 className="sr-only">{TITLE}</h1>
      <DayRibbon cle={cle} start={figures.start} entries={journal} />

      <section aria-label="Où j'en suis" className="mt-14 grid gap-px border border-rule bg-rule md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="bg-paper p-5 sm:p-7">
          <p className="text-sm text-ink-2">Dernière entrée</p>
          {last ? (
            <>
              <p className="mt-2 font-display text-lg font-bold font-stretch-118%">
                <Link href={`/${cle}/journal#${last.id}`} className="hover:underline">
                  {last.title}
                </Link>
              </p>
              <p className="mt-1 text-sm text-ink-2">
                <time dateTime={last.date}>{formatDate(last.date, "fr")}</time>
                {last.category && `, ${JOURNAL_CATEGORIES[last.category].label.toLowerCase()}`}
              </p>
              {last.conclusion && <p className="mt-4 max-w-[52ch]" dangerouslySetInnerHTML={{ __html: last.conclusion }} />}
            </>
          ) : (
            <p className="mt-2">Pas encore d&apos;entrée. La première s&apos;écrit dans carnet/journal/.</p>
          )}
        </div>
        <div className="bg-raised p-5 sm:p-7">
          <p className="text-sm text-ink-2">Prochaine étape</p>
          {last?.next ? (
            <p className="mt-2 font-semibold" dangerouslySetInnerHTML={{ __html: last.next }} />
          ) : (
            <p className="mt-2 text-ink-2">Ajoutez un champ « suite » à la dernière entrée du journal.</p>
          )}
        </div>
      </section>

      <section aria-label="Ordre de lecture" className="mt-20">
        <Heading
          action={
            <Link href={`/${cle}/articles`} className="text-sm font-semibold underline">
              Tous les articles
            </Link>
          }
        >
          Par où commencer
        </Heading>
        <ol>
          {articles.map((a, i) => (
            <li key={a.slug} className="border-b border-rule last:border-b-0">
              <Link
                href={`/${cle}/${a.slug}`}
                className="group grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-4 py-6 sm:grid-cols-[4rem_minmax(0,1fr)_auto] sm:gap-x-6"
              >
                <span className="font-display text-3xl leading-none font-extrabold text-ink-2 font-stretch-150% group-hover:text-ink">
                  {i + 1}
                </span>
                <span>
                  <span className="block text-sm text-ink-2">
                    {a.categories.map((c) => ARTICLE_CATEGORIES[c]).join(", ")}
                  </span>
                  <span className="mt-1 block font-display text-lg font-bold font-stretch-118% group-hover:underline">
                    {a.title}
                  </span>
                  <span className="mt-2 block max-w-[62ch] text-ink-2">{a.description}</span>
                </span>
                <span className="col-start-2 mt-3 text-sm text-ink-2 sm:col-start-3 sm:mt-0 sm:text-right">
                  {a.minutes} min
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section aria-label="Wadibu en chiffres" className="mt-20">
        <Heading>Wadibu en chiffres</Heading>
        {/* Indicateurs saisis par l'auteur dans carnet/chiffres.md. */}
        <div dangerouslySetInnerHTML={{ __html: figuresHtml(figures) }} />
      </section>

      {journal.length > 1 && (
        <section aria-label="Journal récent" className="mt-20">
          <Heading
            action={
              <Link href={`/${cle}/journal`} className="text-sm font-semibold underline">
                Tout le journal
              </Link>
            }
          >
            Journal récent
          </Heading>
          <ul>
            {journal.slice(1, 4).map((e) => (
              <li key={e.id} className="border-b border-rule">
                <Link href={`/${cle}/journal#${e.id}`} className="group flex items-baseline gap-4 py-4">
                  <time dateTime={e.date} className="w-28 shrink-0 text-sm text-ink-2">
                    {formatDate(e.date, "fr")}
                  </time>
                  <span className="font-semibold group-hover:underline">{e.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </Shell>
  );
}
