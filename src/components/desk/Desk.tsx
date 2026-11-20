"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import type { Lang, Ui } from "@/i18n/ui";

import Home from "./Home";
import { parseHash } from "./kit";
import { type PostCard, renderScreen } from "./screens";

const subscribe = (cb: () => void) => {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
};
const readHash = () => window.location.hash;

interface Props {
  lang: Lang;
  t: Ui;
  posts: PostCard[];
  now: string;
}

/**
 * L'accueil en application : un seul écran, sans défilement de page. Le
 * plan de travail occupe toute la fenêtre sous l'en-tête ; chaque fiche
 * ouvre un écran, qui en ouvre d'autres. L'adresse (`#/…`) dit quel écran
 * est affiché : liens, retour du navigateur et partage marchent tels quels.
 *
 * Un écran plus profond arrive de la droite, un retour revient de la
 * gauche. Échap remonte d'un niveau.
 */
export default function Desk({ lang, t, posts, now }: Props) {
  const reduce = useReducedMotion();
  const hash = useSyncExternalStore(subscribe, readHash, () => "");
  const seg = parseHash(hash);
  const screen = seg.length ? renderScreen(seg, { lang, t, posts, now }) : null;
  const path = screen ? seg.join("/") : "";
  const depth = screen ? seg.length : 0;

  // Sens du mouvement : plus profond → de la droite ; moins → de la gauche.
  // L'écran précédent est gardé en état, mis à jour pendant le rendu.
  const [prev, setPrev] = useState({ depth, path, dir: 1 });
  if (prev.path !== path)
    setPrev({ depth, path, dir: depth >= prev.depth ? 1 : -1 });
  const dir = prev.path !== path ? (depth >= prev.depth ? 1 : -1) : prev.dir;

  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    // Le lecteur d'écran et le clavier reprennent sur le titre du nouvel écran.
    requestAnimationFrame(() =>
      document
        .querySelector<HTMLElement>("[data-desk] [data-screen-title]")
        ?.focus({ preventScroll: true }),
    );
  }, [path]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || !window.location.hash.startsWith("#/")) return;
      if (
        (e.target as HTMLElement)?.closest(
          "input, textarea, select, [role=dialog]",
        )
      )
        return;
      const up = parseHash(window.location.hash).slice(0, -1);
      window.location.hash = `/${up.join("/")}`;
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const shift = reduce ? 0 : 48;

  return (
    <section data-desk className="h-[calc(100dvh-4.0625rem)] p-2 sm:p-3">
      {screen && <h1 className="sr-only">Stéphane Konan</h1>}
      <div className="relative mx-auto h-full max-w-[90rem] overflow-hidden rounded-[1.75rem] border border-rule bg-raised/55 shadow-[var(--shadow-card)] sm:rounded-[2rem]">
        <AnimatePresence initial={false} custom={dir}>
          <motion.div
            key={path || "home"}
            custom={dir}
            variants={{
              enter: (d: number) => ({ x: d * shift, opacity: 0 }),
              center: { x: 0, opacity: 1 },
              exit: (d: number) => ({ x: -d * shift, opacity: 0 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              duration: reduce ? 0.15 : 0.38,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="absolute inset-0"
          >
            {screen ?? <Home t={t.hero} s={t.screens} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
