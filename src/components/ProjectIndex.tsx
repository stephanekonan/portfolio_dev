"use client";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronDown, ExternalLink } from "lucide-react";
import type { Project } from "@/data/projects";
import type { Lang, Ui } from "@/i18n/ui";

interface Props {
  projects: Project[];
  lang: Lang;
  t: Ui["work"];
}

export default function ProjectIndex({ projects, lang, t }: Props) {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div>
      <div className="hidden grid-cols-[1fr_7rem_14rem_2rem] border-b border-ink pb-2 text-xs text-ink-2 md:grid">
        <span>{t.columns.name}</span>
        <span>{t.columns.kind}</span>
        <span>{t.columns.stack}</span>
        <span />
      </div>
      <ul>
        {projects.map((p) => {
          const isOpen = open === p.name;
          const id = `project-${p.name.replace(/\W+/g, "-").toLowerCase()}`;
          return (
            <li key={p.name} className="border-b border-rule">
              <button
                onClick={() => setOpen(isOpen ? null : p.name)}
                aria-expanded={isOpen}
                aria-controls={id}
                className="grid w-full grid-cols-[1fr_2rem] items-baseline gap-x-4 py-4 text-left md:grid-cols-[1fr_7rem_14rem_2rem] md:gap-x-0"
              >
                <span className="font-display text-lg font-semibold [font-stretch:118%]">{p.name}</span>
                <span className="hidden text-sm md:block">{t.kinds[p.kind]}</span>
                <span className="hidden truncate pr-4 text-sm text-ink-2 md:block">{p.stack.join(", ")}</span>
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
                    transition={{ duration: reduce ? 0 : 0.32, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="grid gap-6 pb-8 pt-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
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
                          className={p.portrait ? "h-full w-auto object-contain" : "block aspect-[16/10] w-full object-cover object-top"}
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
