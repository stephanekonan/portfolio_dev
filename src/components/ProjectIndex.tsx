"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronDown, ExternalLink } from "lucide-react";
import type { Project } from "@/data/projects";
import type { Lang, Ui } from "@/i18n/ui";
import { DUR, EASE, loadGsap } from "@/lib/motion";

interface Props {
  projects: Project[];
  lang: Lang;
  t: Ui["work"];
}

export default function ProjectIndex({ projects, lang, t }: Props) {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState<string | null>(null);
  const list = useRef<HTMLUListElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const shot = useRef<HTMLImageElement>(null);

  // Grand écran, pointeur fin : la capture du projet survolé suit le curseur
  // et penche dans le sens du geste. Un projet ouvert montre déjà la sienne.
  useEffect(() => {
    const ul = list.current;
    const el = card.current;
    const query =
      "(hover: hover) and (pointer: fine) and (min-width: 64rem) and (prefers-reduced-motion: no-preference)";
    if (!ul || !el || !window.matchMedia(query).matches) return;
    let dead = false;
    let off = () => {};
    loadGsap().then(({ gsap }) => {
      if (dead) return;
      gsap.set(el, { yPercent: -50, autoAlpha: 0, scale: 0.92 });
      const xTo = gsap.quickTo(el, "x", {
        duration: DUR.follow,
        ease: "power3.out",
      });
      const yTo = gsap.quickTo(el, "y", {
        duration: DUR.follow,
        ease: "power3.out",
      });
      const tilt = gsap.quickTo(el, "rotation", {
        duration: 0.6,
        ease: "power3.out",
      });
      let lastX = 0;
      // À droite de l'écran, la capture passe à gauche du curseur.
      const at = (e: PointerEvent) =>
        e.clientX > window.innerWidth - el.offsetWidth - 64
          ? e.clientX - 32 - el.offsetWidth
          : e.clientX + 32;
      const hide = () =>
        gsap.to(el, {
          autoAlpha: 0,
          scale: 0.92,
          duration: 0.2,
          ease: "power2.out",
          overwrite: "auto",
        });
      const enter = (e: PointerEvent) => {
        gsap.set(el, { x: at(e), y: e.clientY });
        lastX = e.clientX;
      };
      const move = (e: PointerEvent) => {
        xTo(at(e));
        yTo(e.clientY);
        tilt(gsap.utils.clamp(-8, 8, (e.clientX - lastX) * 0.5));
        lastX = e.clientX;
      };
      const over = (e: PointerEvent) => {
        const li = (e.target as Element).closest<HTMLElement>("[data-preview]");
        if (!li || li.querySelector('[aria-expanded="true"]')) return hide();
        const img = shot.current;
        if (img && img.getAttribute("src") !== li.dataset.preview) {
          img.src = li.dataset.preview!;
          img.style.objectFit = li.dataset.portrait ? "contain" : "cover";
        }
        gsap.to(el, {
          autoAlpha: 1,
          scale: 1,
          duration: 0.3,
          ease: EASE.out,
          overwrite: "auto",
        });
      };
      ul.addEventListener("pointerenter", enter);
      ul.addEventListener("pointermove", move);
      ul.addEventListener("pointerover", over);
      ul.addEventListener("pointerleave", hide);
      ul.addEventListener("pointerdown", hide);
      off = () => {
        ul.removeEventListener("pointerenter", enter);
        ul.removeEventListener("pointermove", move);
        ul.removeEventListener("pointerover", over);
        ul.removeEventListener("pointerleave", hide);
        ul.removeEventListener("pointerdown", hide);
        gsap.killTweensOf(el);
      };
    });
    return () => {
      dead = true;
      off();
    };
  }, []);

  return (
    <div>
      <div className="hidden grid-cols-[1fr_7rem_14rem_2rem] border-b border-ink pb-2 text-xs text-ink-2 md:grid">
        <span>{t.columns.name}</span>
        <span>{t.columns.kind}</span>
        <span>{t.columns.stack}</span>
        <span />
      </div>
      <div
        ref={card}
        aria-hidden
        style={{ visibility: "hidden" }}
        className="pointer-events-none fixed top-0 left-0 z-30 hidden w-72 overflow-hidden border border-rule bg-raised lg:block"
      >
        <img
          ref={shot}
          alt=""
          className="block aspect-[16/10] w-full object-cover object-top"
        />
      </div>
      <ul ref={list} data-reveal-group>
        {projects.map((p) => {
          const isOpen = open === p.name;
          const id = `project-${p.name.replace(/\W+/g, "-").toLowerCase()}`;
          return (
            <li
              key={p.name}
              data-preview={p.image}
              data-portrait={p.portrait || undefined}
              className="border-b border-rule"
            >
              <button
                onClick={() => setOpen(isOpen ? null : p.name)}
                aria-expanded={isOpen}
                aria-controls={id}
                className="grid w-full grid-cols-[1fr_2rem] items-baseline gap-x-4 py-4 text-left md:grid-cols-[1fr_7rem_14rem_2rem] md:gap-x-0"
              >
                <span className="font-display text-lg font-semibold [font-stretch:118%]">
                  {p.name}
                </span>
                <span className="hidden text-sm md:block">
                  {t.kinds[p.kind]}
                </span>
                <span className="hidden truncate pr-4 text-sm text-ink-2 md:block">
                  {p.stack.join(", ")}
                </span>
                <ChevronDown
                  className={`size-4 justify-self-end transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                  aria-hidden
                />
                <span className="col-span-1 text-sm text-ink-2 md:hidden">
                  {[t.kinds[p.kind], ...p.stack].join(", ")}
                </span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    id={id}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{
                      duration: reduce ? 0 : 0.32,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="overflow-hidden"
                  >
                    <div className="grid gap-6 pt-1 pb-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
                      <div>
                        <p className="max-w-[52ch]">{p.summary[lang]}</p>
                        {p.href ? (
                          <a
                            href={p.href}
                            target="_blank"
                            rel="noopener"
                            className="mt-5 inline-flex items-center gap-2 border border-ink px-4 py-2 text-sm font-semibold hover:bg-ink hover:text-paper"
                          >
                            {t.open}
                            <ExternalLink className="size-3.5" aria-hidden />
                          </a>
                        ) : (
                          <p className="mt-5 text-sm text-ink-2">{t.noLink}</p>
                        )}
                      </div>
                      <div
                        className={`overflow-hidden border border-rule bg-raised ${
                          p.portrait ? "flex h-80 justify-center" : ""
                        }`}
                      >
                        <img
                          src={p.image}
                          alt={p.name}
                          loading="lazy"
                          className={
                            p.portrait
                              ? "h-full w-auto object-contain"
                              : "block aspect-[16/10] w-full object-cover object-top"
                          }
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
