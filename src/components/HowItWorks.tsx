"use client";
import { useEffect, useRef } from "react";

import {
  BrainCircuit,
  MousePointerClick,
  NotebookPen,
  ReceiptText,
  Route,
} from "lucide-react";

import type { Ui } from "@/i18n/ui";
import { loadGsap } from "@/lib/motion";

import SectionHead from "./SectionHead";

/** Icône de chaque étape ; toutes à l'encre, le reçu seul en orange. */
const LOOK = [
  { color: "var(--ink)", Icon: MousePointerClick },
  { color: "var(--ink)", Icon: Route },
  { color: "var(--ink)", Icon: BrainCircuit },
  { color: "var(--ink)", Icon: NotebookPen },
  { color: "var(--signal)", Icon: ReceiptText },
];

/** Les cinq étapes sur le chemin, et le chemin qui les relie. */
const STATIONS = [
  { x: 260, y: 56, side: "right" },
  { x: 170, y: 176, side: "left" },
  { x: 350, y: 296, side: "right" },
  { x: 170, y: 416, side: "left" },
  { x: 260, y: 536, side: "right" },
] as const;
const ROUTE =
  "M260 56 C260 116 170 116 170 176 C170 236 350 236 350 296 C350 356 170 356 170 416 C170 476 260 476 260 536";

/**
 * « Comment ça marche » : une commande suivie de l'écran jusqu'au reçu, en
 * cinq étapes et une métaphore de restaurant, pour qui ne fait pas de
 * développement. Grand écran : le schéma reste à gauche, un point safran
 * suit le chemin au défilement (GSAP MotionPath, DrawSVG) et l'étape lue
 * s'allume. Petit écran : chaque étape porte sa pastille.
 */
export default function HowItWorks({
  t,
  index,
}: {
  t: Ui["how"];
  index: string;
}) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let dead = false;
    let off = () => {};
    loadGsap().then(({ gsap, ScrollTrigger }) => {
      if (dead) return;
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const steps = gsap.utils.toArray<HTMLElement>("[data-how-step]", el);
      const stations = gsap.utils.toArray<SVGGElement>("[data-station]", el);
      const list = el.querySelector("ol");
      const route = el.querySelector<SVGPathElement>("[data-route]");
      const done = el.querySelector<SVGPathElement>("[data-route-done]");
      const dot = el.querySelector<SVGCircleElement>("[data-dot]");
      const tap = el.querySelector<SVGGElement>("[data-tap]");

      // L'étape lue s'allume ; les étapes passées restent allumées sur le schéma.
      const activate = (i: number) => {
        steps.forEach((s, j) => s.toggleAttribute("data-active", j === i));
        stations.forEach((s, j) => s.toggleAttribute("data-active", j <= i));
        if (reduce) return;
        gsap.fromTo(
          stations[i],
          { scale: 0.7, transformOrigin: "50% 50%" },
          { scale: 1, duration: 0.6, ease: "back.out(3)", overwrite: true },
        );
        if (i === 0 && tap)
          gsap.fromTo(
            tap,
            { scale: 0.9, transformOrigin: "50% 50%" },
            { scale: 1, duration: 0.5, ease: "back.out(4)" },
          );
      };
      el.setAttribute("data-scrolly", "");
      activate(0);
      const triggers = steps.map((s, i) =>
        ScrollTrigger.create({
          trigger: s,
          start: "top 60%",
          end: "bottom 60%",
          onToggle: (self) => self.isActive && activate(i),
        }),
      );

      // Le point suit le chemin au rythme du défilement, le tracé safran derrière lui.
      const tl =
        reduce || !list || !route || !dot || !done
          ? null
          : gsap
              .timeline({
                scrollTrigger: {
                  trigger: list,
                  start: "top 60%",
                  end: "bottom 60%",
                  scrub: 0.6,
                },
              })
              .to(
                dot,
                {
                  motionPath: {
                    path: route,
                    align: route,
                    alignOrigin: [0.5, 0.5],
                  },
                  ease: "none",
                },
                0,
              )
              .fromTo(
                done,
                { drawSVG: "0%" },
                { drawSVG: "100%", ease: "none" },
                0,
              );

      off = () => {
        triggers.forEach((tr) => tr.kill());
        tl?.scrollTrigger?.kill();
        tl?.kill();
        el.removeAttribute("data-scrolly");
      };
    });
    return () => {
      dead = true;
      off();
    };
  }, []);

  return (
    <section id="comment" className="mx-auto max-w-304 px-4 pb-28 sm:px-8">
      <SectionHead index={index} title={t.title} lead={t.lead} />
      <div
        ref={root}
        className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16"
      >
        <div aria-hidden className="hidden lg:block">
          <div className="sticky top-[calc(50svh-17rem)]">
            <svg
              viewBox="0 0 520 600"
              className="h-[34rem] w-full overflow-visible"
            >
              <path
                data-route
                d={ROUTE}
                fill="none"
                stroke="var(--rule)"
                strokeWidth="2"
                strokeDasharray="2 6"
                strokeLinecap="round"
              />
              <path
                data-route-done
                d={ROUTE}
                fill="none"
                stroke="var(--signal)"
                strokeWidth="2"
                strokeLinecap="round"
              />

              {/* Le bouton sur lequel tout commence. */}
              <g data-tap>
                <rect
                  x="88"
                  y="38"
                  width="132"
                  height="36"
                  rx="18"
                  fill="var(--ink)"
                />
                <text
                  x="154"
                  y="61"
                  textAnchor="middle"
                  fill="var(--paper)"
                  fontSize="14"
                  fontWeight="600"
                >
                  {t.tap}
                </text>
              </g>

              {STATIONS.map((st, i) => {
                const { color, Icon } = LOOK[i];
                const step = t.steps[i];
                const tx = st.side === "right" ? st.x + 40 : st.x - 40;
                const anchor = st.side === "right" ? "start" : "end";
                return (
                  <g
                    key={i}
                    data-station
                    style={{ "--c": color } as React.CSSProperties}
                  >
                    <circle
                      className="ring"
                      cx={st.x}
                      cy={st.y}
                      r="24"
                      fill="var(--paper)"
                      stroke={color}
                      strokeWidth="1.5"
                    />
                    <Icon
                      className="glyph"
                      x={st.x - 10}
                      y={st.y - 10}
                      width={20}
                      height={20}
                      strokeWidth={1.75}
                    />
                    <text
                      x={tx}
                      y={st.y - 2}
                      textAnchor={anchor}
                      fill="var(--ink)"
                      fontSize="15"
                      fontWeight="600"
                    >
                      {step.name}
                    </text>
                    <text
                      x={tx}
                      y={st.y + 17}
                      textAnchor={anchor}
                      fill="var(--ink-2)"
                      fontSize="12"
                      fontFamily="var(--font-mono)"
                    >
                      {step.analogy}
                    </text>
                  </g>
                );
              })}

              <circle
                data-dot
                r="7"
                fill="var(--signal)"
                transform={`translate(${STATIONS[0].x} ${STATIONS[0].y})`}
              />
            </svg>
          </div>
        </div>

        <ol>
          {t.steps.map((step, i) => {
            const { color, Icon } = LOOK[i];
            return (
              <li
                key={step.name}
                data-how-step
                className="flex flex-col justify-center border-b border-rule py-8 last:border-0 lg:min-h-[60svh] lg:border-0 lg:py-0"
              >
                <p className="flex items-center gap-3 text-sm">
                  <span
                    className="grid size-9 place-items-center rounded-full text-paper lg:hidden"
                    style={{ background: color }}
                    aria-hidden
                  >
                    <Icon className="size-4.5" strokeWidth={1.75} />
                  </span>
                  <span className="font-mono text-xs text-ink-2">0{i + 1}</span>
                  <span className="font-semibold">{step.name}</span>
                  <span className="text-ink-2">· {step.analogy}</span>
                </p>
                <h3 className="mt-4 font-display text-xl leading-tight font-bold font-stretch-112% sm:text-2xl">
                  {step.title}
                </h3>
                <p className="mt-3 max-w-[44ch] text-lg text-ink-2">
                  {step.body}
                </p>
              </li>
            );
          })}
        </ol>
      </div>
      <p
        data-reveal
        className="mt-12 max-w-[52ch] border-l-2 border-signal pl-5 text-xl font-semibold"
      >
        {t.outro}
      </p>
    </section>
  );
}
