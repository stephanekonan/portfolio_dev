"use client";
import { useEffect, useRef } from "react";

import { ArrowUpRight } from "lucide-react";

import type { ProductTrace } from "@/data/traces";
import type { Lang, Ui } from "@/i18n/ui";
import { loadGsap } from "@/lib/motion";

interface Props {
  products: ProductTrace[];
  lang: Lang;
  t: Ui["showcase"];
}

/** Teinte de la pastille de chaque produit. */
const TINT: Record<ProductTrace["id"], string> = {
  resi: "var(--layer-web)",
  wadibu: "var(--signal)",
  aboutik: "var(--go)",
};

/**
 * Les trois produits phares en grandes cartes. Grand écran : la rangée
 * reste en place et les cartes défilent à l'horizontale au rythme du
 * défilement (ScrollTrigger épinglé), l'image glissant dans son cadre
 * (`containerAnimation`). Petit écran : les cartes s'empilent.
 */
export default function Showcase({ products, lang, t }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrap.current;
    const row = track.current;
    if (!el || !row) return;
    let dead = false;
    let off = () => {};
    loadGsap().then(({ gsap }) => {
      if (dead) return;
      const mm = gsap.matchMedia();
      mm.add(
        "(min-width: 64rem) and (prefers-reduced-motion: no-preference)",
        () => {
          const distance = () => row.scrollWidth - el.clientWidth;
          const slide = gsap.to(row, {
            x: () => -distance(),
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "center center",
              end: () => `+=${distance()}`,
              pin: true,
              scrub: 0.8,
              invalidateOnRefresh: true,
            },
          });
          gsap.utils.toArray<HTMLElement>("[data-shot]", row).forEach((img) =>
            gsap.fromTo(
              img,
              { xPercent: -6 },
              {
                xPercent: 6,
                ease: "none",
                scrollTrigger: {
                  trigger: img,
                  containerAnimation: slide,
                  start: "left right",
                  end: "right left",
                  scrub: true,
                },
              },
            ),
          );
        },
      );
      off = () => mm.revert();
    });
    return () => {
      dead = true;
      off();
    };
  }, []);

  return (
    <div ref={wrap} className="lg:overflow-hidden lg:py-6">
      <div
        ref={track}
        className="flex flex-col gap-10 lg:w-max lg:flex-row lg:gap-10 lg:pr-[10vw]"
      >
        {products.map((p, i) => {
          const href = typeof p.href === "string" ? p.href : p.href?.[lang];
          return (
            <article
              key={p.id}
              data-reveal
              className="card flex flex-col overflow-hidden lg:w-[min(40rem,52vw)] lg:shrink-0"
            >
              <div className="relative aspect-[16/10] overflow-hidden border-b-2 border-ink bg-paper lg:aspect-[2/1]">
                <img
                  data-shot
                  src={p.image.src}
                  alt={p.image.alt[lang]}
                  loading="lazy"
                  className={`absolute inset-0 h-full w-full scale-[1.14] ${
                    p.image.portrait
                      ? "object-contain py-4"
                      : "object-cover object-top"
                  }`}
                />
              </div>
              <div className="flex flex-1 flex-col gap-3 p-6 sm:p-7">
                <p className="flex flex-wrap items-center gap-2">
                  <span className="chip">
                    <span
                      className="size-2 rounded-full"
                      style={{ background: TINT[p.id] }}
                      aria-hidden
                    />
                    0{i + 1}
                  </span>
                  <span className="chip">{t.kinds[p.id]}</span>
                </p>
                <h3 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
                  {p.product}
                </h3>
                <p className="max-w-[58ch] text-ink-2 sm:text-lg">
                  {t.pitch[p.id]}
                </p>
                <div className="mt-auto pt-2">
                  {href ? (
                    <a
                      data-magnetic
                      href={href}
                      target="_blank"
                      rel="noopener"
                      className="btn btn-sm"
                    >
                      {t.visit}
                      <ArrowUpRight className="size-4" aria-hidden />
                    </a>
                  ) : (
                    <span className="chip">{t.unpublished}</span>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
