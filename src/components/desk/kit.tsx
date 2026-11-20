"use client";
import { createContext, useContext } from "react";

import { ArrowUpRight, ChevronLeft, ChevronRight, House } from "lucide-react";

import type { Lang, Ui } from "@/i18n/ui";

/**
 * Les écrans de l'accueil s'adressent par le fragment d'URL :
 * `#/realisations/resi/trace`. Un lien ordinaire change d'écran, le bouton
 * « précédent » du navigateur revient en arrière, et une adresse se partage.
 */
export const href = (...parts: string[]) =>
  `#/${parts.filter(Boolean).join("/")}`;

/** Les anciennes ancres de la page à défilement mènent au bon écran. */
const LEGACY: Record<string, string> = {
  comment: "comment",
  realisations: "realisations",
  competences: "savoir-faire",
  traces: "realisations/resi/trace",
  blog: "blog",
  contact: "contact",
};

export function parseHash(hash: string): string[] {
  const raw = decodeURIComponent(hash.replace(/^#/, ""));
  if (!raw.startsWith("/"))
    return (LEGACY[raw] ?? "").split("/").filter(Boolean);
  return raw.split("/").filter(Boolean);
}

export const slug = (name: string) =>
  name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export const pick = (
  v: string | Record<Lang, string> | undefined,
  lang: Lang,
) => (typeof v === "string" ? v : v?.[lang]);

/** Thème et langue : fournis par Desk, posés en haut à droite de chaque écran. */
export const Controls = createContext<React.ReactNode>(null);

export interface Crumb {
  label: string;
  path: string;
}

/**
 * Le cadre commun des écrans : retour vers l'écran parent et fil d'Ariane
 * en haut, titre en deux tons, puis le contenu. Seul le contenu défile, et
 * seulement s'il dépasse (petit écran).
 */
export function Screen({
  crumbs,
  kicker,
  title,
  title2,
  aside,
  children,
  t,
}: {
  /** Du plus haut au plus profond ; le dernier est l'écran affiché. */
  crumbs: Crumb[];
  kicker: string;
  title: string;
  title2?: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
  t: Ui["screens"];
}) {
  const parent = crumbs.at(-2) ?? { label: t.home, path: "#/" };
  const controls = useContext(Controls);
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-3 px-4 pt-4 sm:px-8 sm:pt-6">
        <a href={parent.path} className="btn btn-sm pl-2.5">
          <ChevronLeft className="size-4" aria-hidden />
          {parent.label}
        </a>
        <nav
          aria-label="Fil d'Ariane"
          className="hidden min-w-0 flex-1 justify-center md:flex"
        >
          <ol className="flex min-w-0 items-center gap-1.5 text-xs text-ink-3">
            {[{ label: t.home, path: "#/" }, ...crumbs].map((c, i, all) => (
              <li key={c.path} className="flex min-w-0 items-center gap-1.5">
                {i > 0 && (
                  <ChevronRight className="size-3 shrink-0" aria-hidden />
                )}
                {i === all.length - 1 ? (
                  <span aria-current="page" className="truncate text-ink-2">
                    {c.label}
                  </span>
                ) : (
                  <a href={c.path} className="truncate hover:text-ink">
                    {c.label}
                  </a>
                )}
              </li>
            ))}
          </ol>
        </nav>
        <div className="flex items-center gap-3">
          <span className="hidden sm:block">{controls}</span>
          <a
            href="#/"
            aria-label={t.toHome}
            title={t.toHome}
            className="tile size-9 rounded-xl hover:border-ink-3"
          >
            <House className="size-4" aria-hidden />
          </a>
        </div>
      </div>

      {/* Fixes : la petite étiquette et les actions de l'écran. */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 pt-5 pb-3 sm:px-8 sm:pt-6">
        <p className="chip chip-signal font-mono">{kicker}</p>
        {aside}
      </div>

      {/* Le grand titre défile avec le contenu. */}
      <div className="scroll-soft min-h-0 flex-1 overflow-y-auto px-4 pb-6 sm:px-8 sm:pb-8">
        <h2
          data-screen-title
          tabIndex={-1}
          className="pt-1 font-display text-[clamp(1.7rem,3.2vw,2.6rem)] leading-[1.08] font-semibold tracking-[-0.04em] outline-none"
        >
          {title}
          {title2 && <span className="block text-ink-2">{title2}</span>}
        </h2>
        <div className="mt-5 sm:mt-6">{children}</div>
      </div>
    </div>
  );
}

/** Une fiche qui ouvre un autre écran : elle se soulève au survol. */
export function CardLink({
  to,
  className = "",
  children,
  external = false,
}: {
  to: string;
  className?: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  return (
    <a
      href={to}
      {...(external ? { target: "_blank", rel: "noopener" } : {})}
      className={`card group relative block p-5 transition-[translate,box-shadow,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-ink-3/60 hover:shadow-[var(--shadow-float)] ${className}`}
    >
      {children}
      <span className="absolute top-4 right-4 grid size-7 place-items-center rounded-lg bg-sunken text-ink-2 transition-colors group-hover:bg-signal group-hover:text-white">
        {external ? (
          <ArrowUpRight className="size-3.5" aria-hidden />
        ) : (
          <ChevronRight className="size-3.5" aria-hidden />
        )}
      </span>
    </a>
  );
}

/** Petit titre de groupe à l'intérieur d'un écran. */
export function Group({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={className}>
      <h3 className="mb-3 text-xs font-medium tracking-wide text-ink-3 uppercase">
        {title}
      </h3>
      {children}
    </section>
  );
}
