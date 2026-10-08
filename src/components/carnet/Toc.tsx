"use client";
import { useEffect, useState } from "react";
import type { TocItem } from "@/lib/carnet/markdown";

function Items({ toc, active }: { toc: TocItem[]; active?: string }) {
  return (
    <ol className="space-y-1 text-sm">
      {toc.map((item) => {
        const current = item.id === active;
        return (
          <li key={item.id}>
            {/* Texte des titres, rendu depuis le Markdown de l'auteur. */}
            <a
              href={`#${item.id}`}
              aria-current={current ? "location" : undefined}
              className={`block border-l-2 py-1 leading-snug transition-colors ${item.depth === 3 ? "pl-6" : "pl-3"} ${
                current ? "border-signal font-semibold text-ink" : "border-transparent text-ink-2 hover:text-ink"
              }`}
              dangerouslySetInnerHTML={{ __html: item.html }}
            />
          </li>
        );
      })}
    </ol>
  );
}

/** Repliable en tête d'article, tant que l'écran est trop étroit pour une colonne. */
export function TocMobile({ toc }: { toc: TocItem[] }) {
  return (
    <details className="group mb-10 border-y border-rule xl:hidden">
      <summary className="flex cursor-pointer list-none items-center justify-between py-3 text-sm font-semibold [&::-webkit-details-marker]:hidden">
        Sommaire
        <span aria-hidden className="text-lg leading-none text-ink-2 transition-transform group-open:rotate-45">
          +
        </span>
      </summary>
      <nav aria-label="Sommaire" className="pb-5">
        <Items toc={toc} />
      </nav>
    </details>
  );
}

/**
 * Colonne collante sur grand écran. La section en cours de lecture est
 * marquée : c'est le dernier titre passé sous la barre du haut.
 */
export function TocAside({ toc }: { toc: TocItem[] }) {
  const [active, setActive] = useState<string>();

  useEffect(() => {
    const headings = toc.map((t) => document.getElementById(t.id)).filter((h): h is HTMLElement => h !== null);
    const update = () => {
      let current = headings[0]?.id;
      for (const h of headings) if (h.getBoundingClientRect().top < 120) current = h.id;
      setActive(current);
    };
    // Recalculé seulement quand un titre franchit la zone haute de l'écran.
    const observer = new IntersectionObserver(update, { rootMargin: "-100px 0px -60% 0px" });
    headings.forEach((h) => observer.observe(h));
    update();
    return () => observer.disconnect();
  }, [toc]);

  return (
    <nav aria-label="Sommaire" className="sticky top-24 hidden max-h-[calc(100dvh-8rem)] overflow-y-auto xl:block">
      <p className="mb-3 pl-3 text-xs font-semibold text-ink-2">Dans cet article</p>
      <Items toc={toc} active={active} />
    </nav>
  );
}
