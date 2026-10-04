"use client";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Plus } from "lucide-react";
import type { CareerSpan } from "@/data/career";
import type { Lang, Ui } from "@/i18n/ui";

interface Props {
  spans: CareerSpan[];
  axis: { from: number; to: number };
  /** Mois courant `AAAA-MM`, figé au build : serveur et client rendent la même barre. */
  now: string;
  lang: Lang;
  t: Ui["career"];
}

const months = (ym: string) => {
  const [y, m] = ym.split("-").map(Number);
  return y * 12 + (m - 1);
};

const KIND_STYLE: Record<CareerSpan["kind"], React.CSSProperties> = {
  job: { background: "var(--layer-career)" },
  project: { background: "var(--layer-api)" },
  study: { background: "transparent", boxShadow: "inset 0 0 0 1.5px var(--layer-career)" },
};

export default function CareerTrace({ spans, axis, now, lang, t }: Props) {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState<string | null>(null);

  const origin = axis.from * 12;
  const range = (axis.to - axis.from) * 12;
  const x = (m: number) => ((m - origin) / range) * 100;
  const nowX = x(months(now));
  const years = Array.from({ length: axis.to - axis.from + 1 }, (_, i) => axis.from + i);

  const fmt = (ym: string) =>
    new Date(`${ym}-01T12:00:00`).toLocaleDateString(lang, { month: "short", year: "numeric" });

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-[15rem_1fr]">
        <div className="hidden md:block" />
        <div className="relative h-6 border-b border-ink">
          {years.map((y) => (
            <span
              key={y}
              // Sur un écran étroit, une année sur deux : sinon les libellés se chevauchent.
              className={`absolute bottom-1 -translate-x-1/2 text-xs text-ink-2 first:translate-x-0 last:-translate-x-full ${
                (y - axis.from) % 2 ? "hidden sm:inline" : ""
              }`}
              style={{ left: `${x(y * 12)}%` }}
            >
              {y}
            </span>
          ))}
        </div>
      </div>

      <div className="relative">
        <ol>
          {spans.map((s, i) => {
            const start = months(s.start);
            const end = s.end ? months(s.end) : months(now);
            const left = x(start);
            const width = Math.max(x(end) - left, 0.8);
            const isOpen = open === s.id;
            const ongoing = !s.end;
            const panelId = `career-${s.id}`;
            return (
              <li key={s.id} className="border-b border-rule">
                <button
                  onClick={() => setOpen(isOpen ? null : s.id)}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  className="group grid w-full grid-cols-1 items-center gap-1.5 py-3 text-left md:grid-cols-[15rem_1fr] md:gap-0"
                >
                  <span className="flex items-baseline justify-between gap-3 pr-4">
                    <span className="font-semibold">{s.name}</span>
                    <span className="text-xs text-ink-2">{t.kinds[s.kind]}</span>
                  </span>
                  <span className="relative block h-4">
                    <motion.span
                      className="absolute inset-y-0 origin-left"
                      style={{ left: `${left}%`, width: `${width}%`, ...KIND_STYLE[s.kind] }}
                      initial={reduce ? false : { scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: 0.9 + i * 0.09, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                      aria-hidden
                    />
                    {ongoing && (
                      <span
                        className="absolute top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-signal"
                        style={{ left: `${left + width}%` }}
                        aria-hidden
                      />
                    )}
                    <span className="sr-only">
                      {fmt(s.start)} – {s.end ? fmt(s.end) : t.present}
                    </span>
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={panelId}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: reduce ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="grid gap-4 pb-5 md:grid-cols-[15rem_1fr]">
                        <p className="text-sm text-ink-2">
                          {fmt(s.start)} – {s.end ? fmt(s.end) : t.present}
                        </p>
                        <div>
                          <p className="font-semibold">{s.role[lang]}</p>
                          <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[8rem_1fr]">
                            {s.attributes.map((a) => (
                              <div key={a.key.fr} className="contents">
                                <dt className="text-ink-2">{a.key[lang]}</dt>
                                <dd className="max-w-[62ch]">{a.value[lang]}</dd>
                              </div>
                            ))}
                          </dl>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ol>

        <div className="pointer-events-none absolute inset-y-0 left-0 right-0 hidden md:grid md:grid-cols-[15rem_1fr]">
          <div />
          <div className="relative">
            <span
              className="absolute -top-6 bottom-0 border-l border-dashed border-signal"
              style={{ left: `${nowX}%` }}
              aria-hidden
            />
          </div>
        </div>
      </div>

      <p className="mt-3 flex items-center gap-2 text-xs text-ink-2">
        <Plus className="size-3.5" aria-hidden />
        {t.lead}
      </p>
    </div>
  );
}
