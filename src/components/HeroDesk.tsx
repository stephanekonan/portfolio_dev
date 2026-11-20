import { ArrowRight, Check, Clock3 } from "lucide-react";

import { CONTACT, type Ui } from "@/i18n/ui";

import BrandIcon, { type BrandSlug } from "./BrandIcon";
import BrandMark from "./BrandMark";
import CopyEmail from "./CopyEmail";

/** Les projets du dossier « en cours » : une initiale colorée, une piste. */
const ROWS = [
  { id: "wadibu", name: "Wadibu", initial: "W", color: "#f97316", bar: "82%" },
  { id: "resi", name: "Resi", initial: "R", color: "#16a34a", bar: "64%" },
  { id: "brightidea", name: "Bright Idea", initial: "B", color: "#2563eb", bar: "91%" },
] as const;

/** Le dossier « Ma pile » : chaque outil dans sa pastille, à sa couleur. */
const STACK: { slug: BrandSlug; color: string }[] = [
  { slug: "flutter", color: "#0175c2" },
  { slug: "go", color: "#00add8" },
  { slug: "nextdotjs", color: "currentColor" },
  { slug: "firebase", color: "#f5a623" },
];

/**
 * L'ouverture de l'accueil : un plan de travail quadrillé de points, le
 * titre au centre sous la marque, et des fiches posées tout autour (un
 * post-it, trois dossiers) qui dérivent doucement. Les fiches décorent :
 * elles sont masquées aux lecteurs d'écran et s'effacent sur petit écran,
 * où seul le centre reste.
 */
export default function HeroDesk({ t }: { t: Ui["hero"] }) {
  const d = t.desk;
  return (
    <section className="px-3 pt-4 pb-24 sm:px-6 sm:pb-32">
      <div className="relative mx-auto flex min-h-[calc(100svh-6rem)] max-w-[84rem] items-center justify-center overflow-hidden rounded-[2rem] border border-rule bg-raised/55 shadow-[var(--shadow-card)] lg:min-h-[46rem]">
        {/* --- Le centre ------------------------------------------------ */}
        <div data-hero-text className="relative z-10 flex w-full max-w-[52rem] flex-col items-center px-5 pt-16 pb-20 text-center sm:pt-20 sm:pb-36">
          <span className="tile size-16 sm:size-[4.5rem]">
            <BrandMark className="size-8 sm:size-9" />
          </span>
          <h1 className="mt-8 font-display text-[clamp(2.25rem,4.2vw,3.4rem)] leading-[1.06] font-semibold tracking-[-0.045em]">
            <span data-split className="block">
              {t.headline}
            </span>
            <span data-split className="block text-ink-2">
              {t.headline2}
            </span>
          </h1>
          <p data-reveal className="mt-6 max-w-[46ch] text-lg text-ink-2">
            {t.lead}
          </p>
          <div data-reveal className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <a data-magnetic href="#contact" className="btn btn-primary px-6 py-3">
              {t.ctaProject}
              <ArrowRight className="size-4" aria-hidden />
            </a>
            <a href="#realisations" className="btn px-6 py-3">
              {t.ctaWork}
            </a>
          </div>
          <div data-reveal className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-sm">
            <span className="chip">
              <span className="size-2 rounded-full bg-go" aria-hidden />
              {t.available}
            </span>
            <CopyEmail email={CONTACT.email} copy={t.copy} copied={t.copied} />
          </div>
        </div>

        {/* --- Les fiches autour ---------------------------------------- */}
        <div aria-hidden className="pointer-events-none absolute inset-0 hidden md:block">
          {/* Post-it épinglé, en haut à gauche, et la case cochée posée dessus. */}
          <div data-float style={{ "--float-d": "7s" } as React.CSSProperties} className="absolute top-6 -left-6 w-56 lg:top-10 lg:left-4 lg:w-60">
            <div className="relative -rotate-3 rounded-sm bg-note px-5 pt-7 pb-12 shadow-[var(--shadow-float)]">
              <span className="absolute top-2.5 left-1/2 size-3 -translate-x-1/2 rounded-full bg-[#e5484d] shadow-[0_2px_3px_rgb(0_0_0/0.25)]" />
              <p className="font-hand text-[1.3rem] leading-[1.15] text-[#3b3527]">{d.note}</p>
            </div>
            <div className="absolute -bottom-14 left-2 h-20 w-32 rounded-2xl border border-rule bg-raised/60 backdrop-blur-sm" />
            <span className="tile absolute -bottom-10 left-7 size-12 rotate-[-4deg]">
              <span className="grid size-7 place-items-center rounded-lg bg-signal text-white">
                <Check className="size-4" strokeWidth={3} />
              </span>
            </span>
          </div>

          {/* Livraisons, en haut à droite, avec son chronomètre. */}
          <span data-float style={{ "--float-d": "5.5s" } as React.CSSProperties} className="tile absolute top-8 right-[17.5rem] hidden size-11 lg:grid">
            <Clock3 className="size-5 text-ink" />
          </span>
          <div data-float style={{ "--float-d": "6.5s" } as React.CSSProperties} className="folder absolute top-16 -right-16 w-72 p-3 lg:-right-4">
            <p className="px-1 pb-2 text-sm font-semibold">{d.releases}</p>
            <div className="rounded-xl border border-rule bg-raised p-3 text-left shadow-sm">
              <p className="text-sm font-semibold">{d.releaseName}</p>
              <p className="text-xs text-ink-2">{d.releaseDetail}</p>
              <p className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-signal-soft px-2 py-1 text-xs font-medium text-signal">
                <span className="size-1.5 rounded-full bg-signal" />
                {d.releaseTag}
              </p>
            </div>
          </div>

          {/* Projets en cours, en bas à gauche. */}
          <div data-float style={{ "--float-d": "8s" } as React.CSSProperties} className="folder absolute -bottom-24 left-6 hidden w-80 p-3 lg:block">
            <p className="px-1 pb-2 text-sm font-semibold">{d.projects}</p>
            <ul className="space-y-2">
              {ROWS.map((r) => (
                <li key={r.id} className="rounded-xl border border-rule bg-raised p-2.5 shadow-sm">
                  <p className="flex items-center gap-2 text-xs">
                    <span className="grid size-5 place-items-center rounded-md text-[0.65rem] font-bold text-white" style={{ background: r.color }}>
                      {r.initial}
                    </span>
                    <span className="font-semibold">{r.name}</span>
                    <span className="truncate text-ink-3">{d.rows[r.id]}</span>
                  </p>
                  <span className="mt-2 block h-1 rounded-full bg-sunken">
                    <span className="block h-full rounded-full bg-[#38bdf8]" style={{ width: r.bar }} />
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Ma pile, en bas à droite. */}
          <div data-float style={{ "--float-d": "6s" } as React.CSSProperties} className="folder absolute -right-6 -bottom-12 w-64 p-4 pb-14 lg:right-12">
            <p className="text-sm font-semibold">{d.stack}</p>
            <div className="mt-4 flex gap-3">
              {STACK.map((s) => (
                <span key={s.slug} className="tile size-12" style={{ color: s.color }}>
                  <BrandIcon slug={s.slug} className="size-6" />
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
