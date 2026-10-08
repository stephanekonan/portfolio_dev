"use client";
import { BookOpen, House, NotebookPen } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export interface SeriesItem {
  slug: string;
  title: string;
}

interface Props {
  cle: string;
  series: SeriesItem[];
  journalCount: number;
}

function useSections(cle: string) {
  const pathname = usePathname() ?? "";
  const home = `/${cle}`;
  const journal = `${home}/journal`;
  const section = pathname === home ? "home" : pathname.startsWith(journal) ? "journal" : "articles";
  return {
    pathname,
    section,
    items: [
      { key: "home", href: home, label: "Accueil", Icon: House },
      { key: "articles", href: `${home}/articles`, label: "Articles", Icon: BookOpen },
      { key: "journal", href: journal, label: "Journal", Icon: NotebookPen },
    ] as const,
  };
}

/**
 * Navigation de l'espace privé. Sur grand écran, une colonne collante : les
 * trois rubriques, puis la série d'articles dans l'ordre de lecture. Sur
 * mobile, une barre d'onglets en bas d'écran, à portée de pouce.
 */
export function CarnetSidebar({ cle, series, journalCount }: Props) {
  const { pathname, section, items } = useSections(cle);
  return (
    <nav aria-label="Navigation du carnet" className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] overflow-y-auto py-10 lg:block">
      <ul className="space-y-1">
        {items.map(({ key, href, label, Icon }) => {
          const active = section === key;
          return (
            <li key={key}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 border-l-2 py-1.5 pl-3 text-sm transition-colors ${
                  active ? "border-ink font-semibold" : "border-transparent text-ink-2 hover:border-rule hover:text-ink"
                }`}
              >
                <Icon className="size-4" aria-hidden />
                {label}
                {key === "journal" && journalCount > 0 && (
                  <span className="ml-auto pr-2 text-xs text-ink-2 tabular-nums">{journalCount}</span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>

      {series.length > 0 && (
        <div className="mt-10">
          <p className="mb-3 pl-3 text-xs font-semibold text-ink-2">Ordre de lecture</p>
          <ol className="space-y-1">
            {series.map((s, i) => {
              const href = `/${cle}/${s.slug}`;
              const active = pathname === href;
              return (
                <li key={s.slug}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={`grid grid-cols-[1.5rem_1fr] border-l-2 py-1.5 pl-3 text-sm leading-snug transition-colors ${
                      active ? "border-signal font-semibold" : "border-transparent text-ink-2 hover:text-ink"
                    }`}
                  >
                    <span className="tabular-nums">{i + 1}</span>
                    <span>{s.title}</span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </div>
      )}

      <p className="mt-10 pl-3 text-xs text-ink-2">
        Page privée, non indexée.{" "}
        <Link href="/" className="underline hover:text-ink">
          Retour au portfolio
        </Link>
      </p>
    </nav>
  );
}

export function CarnetTabBar({ cle }: { cle: string }) {
  const { section, items } = useSections(cle);
  return (
    <nav
      aria-label="Navigation du carnet"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-rule bg-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
    >
      <ul className="mx-auto grid max-w-md grid-cols-3">
        {items.map(({ key, href, label, Icon }) => {
          const active = section === key;
          return (
            <li key={key}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`relative flex flex-col items-center gap-1 py-2.5 text-xs ${
                  active ? "font-semibold text-ink" : "text-ink-2"
                }`}
              >
                {active && <span className="absolute inset-x-6 top-0 h-0.5 bg-ink" aria-hidden />}
                <Icon className="size-5" aria-hidden />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
