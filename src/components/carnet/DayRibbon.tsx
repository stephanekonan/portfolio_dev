import Link from "next/link";
import { formatDate } from "@/lib/blog";
import type { JournalEntry } from "@/lib/carnet/content";

const DAYS = 30;
/** Les quatre semaines du plan ; la dernière absorbe les jours 29 et 30. */
const WEEKS = [7, 7, 7, 9];

const dayOf = (start: string, date: string) => Math.round((Date.parse(date) - Date.parse(start)) / 86_400_000) + 1;

/**
 * Le plan de 30 jours vu d'un coup d'œil : une case par jour, pleine pour
 * les jours passés, safran pour aujourd'hui, vide pour la suite. Un jour qui
 * a son entrée de journal devient un lien vers elle.
 */
export default function DayRibbon({ cle, start, entries }: { cle: string; start: string; entries: JournalEntry[] }) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(start)) {
    return (
      <p className="text-ink-2">
        Renseignez <code className="font-mono text-sm">debut_plan</code> dans{" "}
        <code className="font-mono text-sm">carnet/chiffres.md</code> pour afficher le plan de 30 jours.
      </p>
    );
  }

  const today = dayOf(start, new Date().toISOString().slice(0, 10));
  const byDay = new Map<number, JournalEntry>();
  // Entrées les plus anciennes d'abord : la plus récente d'un même jour gagne.
  for (const e of [...entries].reverse()) byDay.set(e.day ?? dayOf(start, e.date), e);

  const headline = today < 1 ? "Jour 0" : `Jour ${today}`;
  const caption =
    today < 1
      ? `Le plan commence le ${formatDate(start, "fr")}.`
      : today > DAYS
        ? `Plan de 30 jours terminé, commencé le ${formatDate(start, "fr")}.`
        : `sur ${DAYS}, depuis le ${formatDate(start, "fr")}`;

  return (
    <section aria-label="Plan de 30 jours">
      <div className="flex flex-wrap items-end gap-x-6 gap-y-2">
        <p className="c-day font-display text-[clamp(3.75rem,12vw,7.5rem)] leading-[0.85] font-extrabold font-stretch-150%">
          {headline}
        </p>
        <p className="pb-1 text-ink-2">{caption}</p>
      </div>

      <ol className="mt-8 grid grid-cols-10 gap-1 sm:grid-cols-[repeat(30,minmax(0,1fr))]">
        {Array.from({ length: DAYS }, (_, i) => {
          const day = i + 1;
          const entry = byDay.get(day);
          const state = day < today ? "passe" : day === today ? "aujourdhui" : "a-venir";
          const label = `Jour ${day}${state === "aujourdhui" ? ", aujourd'hui" : ""}${entry ? ` : ${entry.title}` : ""}`;
          const cell = `c-cell block h-9 sm:h-12`;
          return (
            <li key={day} style={{ "--i": i } as React.CSSProperties} data-etat={state} data-entree={entry ? "" : undefined} aria-current={state === "aujourdhui" ? "date" : undefined}>
              {entry ? (
                <Link href={`/${cle}/journal#${entry.id}`} title={label} className={cell}>
                  <span className="sr-only">{label}</span>
                </Link>
              ) : (
                <span title={label} className={cell}>
                  <span className="sr-only">{label}</span>
                </span>
              )}
            </li>
          );
        })}
      </ol>
      <div aria-hidden className="mt-2 hidden grid-cols-[repeat(30,minmax(0,1fr))] gap-1 text-xs text-ink-2 sm:grid">
        {WEEKS.map((span, i) => (
          <span key={i} className="border-t border-rule pt-1.5" style={{ gridColumn: `span ${span}` }}>
            Semaine {i + 1}
          </span>
        ))}
      </div>
      <p className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-xs text-ink-2">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 bg-ink" aria-hidden /> jour passé
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 bg-signal" aria-hidden /> aujourd&apos;hui
        </span>
        <span className="flex items-center gap-1.5">
          <span className="c-legend-entry size-2.5" aria-hidden /> entrée de journal, cliquable
        </span>
      </p>
    </section>
  );
}
