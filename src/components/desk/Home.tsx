"use client";
import {
  ArrowRight,
  BookOpen,
  Check,
  Clock3,
  FolderOpen,
  Layers,
  Mail,
  Route,
  SquareTerminal,
  UserRound,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import type { Ui } from "@/i18n/ui";

import BrandIcon, { type BrandSlug } from "../BrandIcon";
import BrandMark from "../BrandMark";
import { useContext } from "react";

import { Controls, href } from "./kit";

/** Les projets du dossier « en cours » : une initiale colorée, une piste. */
const ROWS = [
  { id: "wadibu", name: "Wadibu", initial: "W", color: "#f97316", bar: "82%" },
  { id: "resi", name: "Resi", initial: "R", color: "#16a34a", bar: "64%" },
  {
    id: "bright-idea",
    key: "brightidea",
    name: "Bright Idea",
    initial: "B",
    color: "#2563eb",
    bar: "91%",
  },
] as const;

/** Le dossier « Ma pile » : chaque outil ouvre la couche où il sert. */
const STACK: { slug: BrandSlug; color: string; layer: string }[] = [
  { slug: "flutter", color: "#0175c2", layer: "mobile" },
  { slug: "go", color: "#00add8", layer: "api" },
  { slug: "nextdotjs", color: "currentColor", layer: "web" },
  { slug: "firebase", color: "#f5a623", layer: "data" },
  { slug: "adonisjs", color: "#5a45ff", layer: "api" },
  { slug: "postgresql", color: "#336791", layer: "data" },
  { slug: "cloudflare", color: "#f38020", layer: "infra" },
  { slug: "tailwindcss", color: "#06b6d4", layer: "web" },
];

const DOCK = [
  { key: "work", to: href("realisations"), Icon: FolderOpen },
  { key: "skills", to: href("savoir-faire"), Icon: Layers },
  { key: "career", to: href("parcours"), Icon: Clock3 },
  { key: "how", to: href("comment"), Icon: Route },
  { key: "about", to: href("apropos"), Icon: UserRound },
  {
    key: "code",
    to: href("realisations", "resi", "trace"),
    Icon: SquareTerminal,
  },
  { key: "blog", to: href("blog"), Icon: BookOpen },
  { key: "contact", to: href("contact"), Icon: Mail },
] as const;

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * L'écran d'accueil : le plan de travail, le titre au centre, et des fiches
 * posées autour. Chaque fiche est une porte : le post-it ouvre « À propos »,
 * les dossiers ouvrent les réalisations, une ligne ouvre son projet, un
 * logo ouvre la couche où l'outil sert. Le dock du bas reprend toutes les
 * rubriques, et c'est lui qui reste sur petit écran.
 */
export default function Home({ t, s }: { t: Ui["hero"]; s: Ui["screens"] }) {
  const reduce = useReducedMotion();
  const controls = useContext(Controls);
  const d = t.desk;
  const up = (i: number) => ({
    initial: { opacity: 0, y: reduce ? 0 : 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, delay: 0.05 + i * 0.07, ease: EASE },
  });
  const pop = (i: number) => ({
    initial: { opacity: 0, scale: reduce ? 1 : 0.94 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.7, delay: 0.25 + i * 0.08, ease: EASE },
  });
  const lift =
    "transition-[translate,box-shadow] duration-200 ease-out hover:-translate-y-1 focus-visible:-translate-y-1";

  return (
    <div className="relative h-full">
      <div className="relative flex h-full flex-col items-center justify-between">
        {/* --- Le centre ------------------------------------------------ */}
        <div className="relative z-10 flex w-full max-w-[52rem] flex-1 flex-col items-center justify-center px-5 pt-10 pb-6 text-center sm:pt-12">
          <motion.a
            {...up(0)}
            href={href("apropos")}
            aria-label={s.dock.about}
            whileHover={reduce ? undefined : { rotate: -8, scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="tile size-14 sm:size-[4.25rem]"
          >
            <BrandMark className="size-7 sm:size-8" />
          </motion.a>
          <motion.h1
            {...up(1)}
            className="mt-6 font-display text-[clamp(2.1rem,4.2vw,3.4rem)] leading-[1.06] font-semibold tracking-[-0.045em] sm:mt-7"
          >
            <span className="block">{t.headline}</span>
            <span className="block text-ink-2">{t.headline2}</span>
          </motion.h1>
          <motion.p
            {...up(2)}
            className="mt-4 max-w-[50ch] text-ink-2 sm:mt-5 sm:text-lg"
          >
            {t.lead}
          </motion.p>
          <motion.div
            {...up(3)}
            className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:mt-8"
          >
            <a href={href("contact")} className="btn btn-primary px-6 py-3">
              {t.ctaProject}
              <ArrowRight className="size-4" aria-hidden />
            </a>
            <a
              href={href("realisations")}
              className="btn hidden px-6 py-3 sm:inline-flex"
            >
              {t.ctaWork}
            </a>
          </motion.div>
          <motion.p {...up(4)} className="chip mt-5">
            <span className="size-2 rounded-full bg-go" aria-hidden />
            {t.available}
          </motion.p>
        </div>

        {/* --- Le dock -------------------------------------------------- */}
        <motion.nav
          {...up(5)}
          aria-label={s.dockLabel}
          className="relative z-10 mb-4 px-3 sm:mb-6"
        >
          <ul className="grid grid-cols-4 gap-x-2 gap-y-1.5 rounded-[1.4rem] border border-rule bg-raised/80 p-2.5 shadow-[var(--shadow-float)] backdrop-blur-md">
            {DOCK.map(({ key, to, Icon }) => (
              <li key={key}>
                <a
                  href={to}
                  className="group flex flex-col items-center gap-1 rounded-xl px-1.5 py-1 text-[0.68rem] text-ink-2 hover:text-ink sm:w-[4.4rem]"
                >
                  <span className="grid size-11 place-items-center rounded-xl border border-rule bg-raised shadow-sm transition-[translate,background-color,color] duration-200 ease-out group-hover:-translate-y-1 group-hover:bg-signal group-hover:text-white">
                    <Icon className="size-5" strokeWidth={1.75} aria-hidden />
                  </span>
                  <span className="truncate">{s.dock[key]}</span>
                </a>
              </li>
            ))}
          </ul>
          {/* Thème et langue, sous le dock : il n'y a plus d'en-tête. */}
          <div className="mt-3 flex justify-center">{controls}</div>
        </motion.nav>
      </div>

      {/* --- Les fiches autour (portes) ---------------------------------- */}
      <div className="pointer-events-none absolute inset-0 hidden md:block">
        {/* Post-it épinglé : « À propos ». La case cochée : « Comment ça marche ». */}
        <motion.div
          {...pop(0)}
          className="absolute top-6 -left-6 w-56 lg:top-8 lg:left-4 lg:w-60"
        >
          <div data-float style={{ "--float-d": "7s" } as React.CSSProperties}>
            <a
              href={href("apropos")}
              className={`pointer-events-auto relative block -rotate-3 rounded-sm bg-note px-5 pt-7 pb-12 shadow-[var(--shadow-float)] ${lift}`}
            >
              <span className="absolute top-2.5 left-1/2 size-3 -translate-x-1/2 rounded-full bg-[#e5484d] shadow-[0_2px_3px_rgb(0_0_0/0.25)]" />
              <span className="block font-hand text-[1.3rem] leading-[1.15] text-[#3b3527]">
                {d.note}
              </span>
            </a>
            <div className="absolute -bottom-14 left-2 h-20 w-32 rounded-2xl border border-rule bg-raised/60 backdrop-blur-sm" />
            <a
              href={href("comment")}
              aria-label={s.how.kicker}
              className={`tile pointer-events-auto absolute -bottom-10 left-7 size-12 rotate-[-4deg] ${lift}`}
            >
              <span className="grid size-7 place-items-center rounded-lg bg-signal text-white">
                <Check className="size-4" strokeWidth={3} aria-hidden />
              </span>
            </a>
          </div>
        </motion.div>

        {/* Livraisons : le dernier produit sorti. */}
        <motion.div
          {...pop(2)}
          className="absolute top-16 -right-16 w-72 lg:-right-4"
        >
          <div
            data-float
            style={{ "--float-d": "6.5s" } as React.CSSProperties}
            className="folder p-3"
          >
            <a
              href={href("realisations")}
              className="pointer-events-auto block px-1 pb-2 text-sm font-semibold hover:text-signal"
            >
              {d.releases}
            </a>
            <a
              href={href("realisations", "wadibu")}
              className={`pointer-events-auto block rounded-xl border border-rule bg-raised p-3 text-left shadow-sm ${lift}`}
            >
              <span className="block text-sm font-semibold">
                {d.releaseName}
              </span>
              <span className="block text-xs text-ink-2">
                {d.releaseDetail}
              </span>
              <span className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-signal-soft px-2 py-1 text-xs font-medium text-signal">
                <span className="size-1.5 rounded-full bg-signal" />
                {d.releaseTag}
              </span>
            </a>
          </div>
        </motion.div>

        {/* Projets en cours : chaque ligne ouvre son projet. */}
        <motion.div
          {...pop(3)}
          className="absolute -bottom-10 left-6 hidden w-80 lg:block"
        >
          <div
            data-float
            style={{ "--float-d": "8s" } as React.CSSProperties}
            className="folder h-[15rem] p-3"
          >
            <a
              href={href("realisations")}
              className="pointer-events-auto block px-1 pb-2 text-sm font-semibold hover:text-signal"
            >
              {d.projects}
            </a>
            <ul className="space-y-2">
              {ROWS.map((r) => (
                <li key={r.id}>
                  <a
                    href={href("realisations", r.id)}
                    className={`pointer-events-auto block rounded-xl border border-rule bg-raised p-2.5 shadow-sm ${lift}`}
                  >
                    <span className="flex items-center gap-2 text-xs">
                      <span
                        className="grid size-5 place-items-center rounded-md text-[0.65rem] font-bold text-white"
                        style={{ background: r.color }}
                      >
                        {r.initial}
                      </span>
                      <span className="font-semibold">{r.name}</span>
                      <span className="truncate text-ink-3">
                        {d.rows["key" in r ? r.key : r.id]}
                      </span>
                    </span>
                    <span className="mt-2 block h-1 rounded-full bg-sunken">
                      <span
                        className="block h-full rounded-full bg-[#38bdf8]"
                        style={{ width: r.bar }}
                      />
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* Ma pile : chaque logo ouvre la couche où l'outil sert. */}
        <motion.div
          {...pop(4)}
          className="absolute right-12 -bottom-10 hidden w-72 lg:block"
        >
          <div
            data-float
            style={{ "--float-d": "6s" } as React.CSSProperties}
            className="folder h-[15rem] p-4"
          >
            <a
              href={href("savoir-faire")}
              className="pointer-events-auto block text-sm font-semibold hover:text-signal"
            >
              {d.stack}
            </a>
            <div className="mt-4 grid grid-cols-4 gap-3">
              {STACK.map((st) => (
                <a
                  key={st.slug}
                  href={href("savoir-faire", st.layer)}
                  className={`tile pointer-events-auto size-12 ${lift}`}
                  style={{ color: st.color }}
                >
                  <BrandIcon slug={st.slug} className="size-6" />
                </a>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
