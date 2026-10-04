"use client";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Lock,
  LockOpen,
  Play,
  RotateCcw,
  Wifi,
  WifiOff,
} from "lucide-react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "motion/react";

import type { T } from "@/data/career";
import type {
  ProductTrace,
  Span,
} from "@/data/traces";
import type {
  Lang,
  Ui,
} from "@/i18n/ui";

type Phase = "idle" | "running" | "waiting" | "done";

/** Largeur, en millisecondes de trace, de la zone hachurée d'attente. */
const GAP = 120;
/** Millisecondes de trace jouées par milliseconde réelle : une trace dure environ 2 s. */
const RATE = 0.14;

/** Lien unique, ou un lien par langue pour un site cible bilingue. */
const link = (href: string | T, lang: Lang) => (typeof href === "string" ? href : href[lang]);

const LAYER_VAR: Record<Span["layer"], string> = {
  web: "var(--layer-web)",
  mobile: "var(--layer-mobile)",
  api: "var(--layer-api)",
  infra: "var(--layer-infra)",
  data: "var(--layer-data)",
};

interface Props {
  traces: ProductTrace[];
  lang: Lang;
  t: Ui["traces"];
}

export default function TraceViewer({ traces, lang, t }: Props) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const trace = traces[active];
  const spans = trace.spans;
  const gap = trace.gap;
  const end = Math.max(...spans.map((s) => s.start + s.duration));
  const gapAt = Math.min(...spans.filter((s) => s.afterGap).map((s) => s.start), end);

  const [phase, setPhase] = useState<Phase>("idle");
  const [time, setTime] = useState(0);
  /** L'attente est demandée pour la prochaine requête (réseau coupé, vente concurrente). */
  const [gapOn, setGapOn] = useState(false);
  const [gapUsed, setGapUsed] = useState(false);
  const [waited, setWaited] = useState(0);
  const [selected, setSelected] = useState(spans[0].id);

  const timeRef = useRef(0);
  const gapOnRef = useRef(false);
  const resumedRef = useRef(false);
  const waitStartRef = useRef(0);

  useEffect(() => {
    gapOnRef.current = gapOn;
  }, [gapOn]);

  const restart = (next: Phase) => {
    timeRef.current = 0;
    resumedRef.current = false;
    setTime(0);
    setGapUsed(false);
    setWaited(0);
    setPhase(next);
  };

  const switchTrace = (index: number) => {
    if (index === active) return;
    setActive(index);
    setGapOn(false);
    setSelected(traces[index].spans[0].id);
    restart("idle");
  };

  const resume = useCallback(() => {
    resumedRef.current = true;
    // Le réseau revenu ne doit pas rester « coupé » pour la requête suivante ;
    // une vente concurrente, elle, reste demandée tant qu'on ne la retire pas.
    if (gap?.release) setGapOn(false);
    setPhase("running");
  }, [gap]);

  const toggleGap = () => {
    if (phase === "waiting") {
      if (gap?.release) resume();
      return;
    }
    setGapOn((v) => !v);
    if (phase === "done") restart("idle");
  };

  useEffect(() => {
    if (phase !== "running") return;
    const rate = reduce ? 1e6 : RATE;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const next = timeRef.current + (now - last) * rate;
      last = now;
      if (gap && gapOnRef.current && !resumedRef.current && next >= gapAt) {
        timeRef.current = gapAt;
        setTime(gapAt);
        setGapUsed(true);
        waitStartRef.current = now;
        setPhase("waiting");
        return;
      }
      if (next >= end) {
        timeRef.current = end;
        setTime(end);
        setPhase("done");
        return;
      }
      timeRef.current = next;
      setTime(next);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase, reduce, gap, gapAt, end]);

  useEffect(() => {
    if (phase !== "waiting") return;
    const id = setInterval(() => setWaited(performance.now() - waitStartRef.current), 100);
    // Sans bouton pour lever l'attente (verrou), elle se lève d'elle-même.
    const auto = gap?.autoResumeMs ? setTimeout(resume, reduce ? 600 : gap.autoResumeMs) : undefined;
    return () => {
      clearInterval(id);
      clearTimeout(auto);
    };
  }, [phase, gap, resume, reduce]);

  // Géométrie : la zone d'attente s'insère à `gapAt`. Les spans qui la
  // suivent glissent d'autant, ceux qui la traversent (les parents) s'étirent.
  const gapReserved = Boolean(gap) && (gapOn || gapUsed);
  const total = end + (gapReserved ? GAP : 0);
  const pct = (ms: number) => `${(ms / total) * 100}%`;
  const crosses = (s: Span) => gapReserved && s.start < gapAt && s.start + s.duration > gapAt;
  const pos = (s: Span) => s.start + (s.afterGap && gapReserved ? GAP : 0);
  const width = (s: Span) => s.duration + (crosses(s) ? GAP : 0);
  const toVisual = (ms: number) => (gapReserved && ms > gapAt ? ms + GAP : ms);
  const fill = (s: Span) =>
    phase === "idle" ? 0 : Math.min(1, Math.max(0, (toVisual(time) - pos(s)) / width(s)));

  const current = spans.find((s) => s.id === selected) ?? spans[0];
  const seconds = (waited / 1000).toLocaleString(lang, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  const ticks = [0, 100, 200, 300].filter((v) => v <= end);
  const gapActive = phase === "waiting" || gapUsed;

  const status =
    phase === "waiting" && gap
      ? gap.waiting[lang]
      : phase === "done"
        ? gapUsed && gap
          ? gap.doneAfter[lang]
          : trace.done[lang]
        : "";

  const GapIcon = gap?.icon === "lock" ? (gapOn || phase === "waiting" ? Lock : LockOpen) : gapOn || phase === "waiting" ? WifiOff : Wifi;
  const gapButtonLabel =
    phase === "waiting" && gap?.release ? gap.release[lang] : gap?.release && gapOn ? gap.release[lang] : gap?.trigger[lang];

  return (
    <div>
      <div role="tablist" aria-label={t.tabsLabel} className="flex max-w-full overflow-x-auto border border-rule bg-raised p-1 scrollbar-none sm:inline-flex">
        {traces.map((tr, i) => (
          <button
            key={tr.id}
            role="tab"
            id={`tab-${tr.id}`}
            aria-selected={i === active}
            aria-controls={`panel-${tr.id}`}
            onClick={() => switchTrace(i)}
            className="relative flex-1 whitespace-nowrap px-5 py-2 text-sm font-semibold sm:flex-none"
          >
            {i === active && (
              <motion.span
                layoutId="trace-tab"
                className="absolute inset-0 bg-ink"
                transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 40 }}
              />
            )}
            <span className={`relative ${i === active ? "text-paper" : "text-ink-2"}`}>{tr.product}</span>
          </button>
        ))}
      </div>

      <div role="tabpanel" id={`panel-${trace.id}`} aria-labelledby={`tab-${trace.id}`} className="mt-10">
        <h3 className="font-display text-xl font-bold leading-tight font-stretch-108% sm:text-2xl sm:font-stretch-112%">
          {trace.scenario[lang]}
        </h3>
        <p className="mt-4 max-w-[62ch] text-ink-2">{trace.pitch[lang]}</p>
        <div className="mt-7 flex flex-wrap items-center gap-3">
          {gap && (
            <button
              onClick={toggleGap}
              aria-pressed={gapOn}
              disabled={phase === "waiting" && !gap.release}
              className={`inline-flex items-center gap-2 border px-4 py-2.5 text-sm font-semibold transition-colors disabled:cursor-wait ${
                gapOn || phase === "waiting"
                  ? "border-signal bg-signal text-[#0f1012]"
                  : "border-ink text-ink hover:bg-raised"
              }`}
            >
              <GapIcon className="size-4" aria-hidden />
              {gapButtonLabel}
            </button>
          )}
          <button
            onClick={() => restart("running")}
            disabled={phase === "running" || phase === "waiting"}
            className="inline-flex items-center gap-2 bg-ink px-4 py-2.5 text-sm font-semibold text-paper transition-opacity disabled:opacity-40"
          >
            {phase === "done" ? <RotateCcw className="size-4" aria-hidden /> : <Play className="size-4" aria-hidden />}
            {phase === "done" ? t.replay : t.play}
          </button>
        </div>

        <div className="mt-8 border-t border-ink">
          <div className="relative grid grid-cols-1 md:grid-cols-[20rem_1fr]">
            <div className="hidden md:block" />
            <div className="relative mx-2 h-7 border-b border-rule md:mx-0">
              {ticks.map((v) => (
                <span
                  key={v}
                  className="absolute top-1.5 -translate-x-1/2 whitespace-nowrap font-mono text-[11px] text-ink-2 first:translate-x-0 last:-translate-x-full"
                  style={{ left: pct(v + (gapReserved && v >= gapAt ? GAP : 0)) }}
                >
                  {v} ms
                </span>
              ))}
            </div>
          </div>

          <div className="relative">
            <ol>
              {spans.map((s) => {
                const p = fill(s);
                const isSel = s.id === current.id;
                const nearEnd = (pos(s) + width(s)) / total > 0.82;
                return (
                  <li key={s.id}>
                    <button
                      onClick={() => setSelected(s.id)}
                      aria-pressed={isSel}
                      className={`grid w-full grid-cols-1 items-center gap-1 border-b border-rule py-2.5 text-left transition-colors md:grid-cols-[20rem_1fr] md:gap-0 ${
                        isSel ? "bg-raised" : "hover:bg-raised/60"
                      }`}
                    >
                      <span
                        className="flex min-w-0 items-center gap-2 pr-4"
                        style={{ paddingLeft: `${s.depth * 0.75 + 0.5}rem` }}
                      >
                        <span className="size-2 shrink-0" style={{ background: LAYER_VAR[s.layer] }} aria-hidden />
                        <span className="truncate font-mono text-[13px]" title={s.name}>{s.name}</span>
                      </span>
                      <span className="relative mx-2 block h-5 md:mx-0">
                        {/* Sur mobile, le nom occupe sa propre ligne : l'attente
                            se dessine dans chaque piste au lieu d'un calque commun
                            qui recouvrirait les noms. */}
                        {gapReserved && (
                          <span
                            className={`absolute inset-y-0 border-x border-dashed border-signal md:hidden ${gapActive ? "hatch" : ""}`}
                            style={{ left: pct(gapAt), width: pct(GAP) }}
                            aria-hidden
                          />
                        )}
                        <span
                          className="absolute inset-y-0 border border-dashed"
                          style={{ left: pct(pos(s)), width: pct(width(s)), borderColor: "var(--rule)" }}
                          aria-hidden
                        />
                        <span
                          className="absolute inset-y-0 origin-left"
                          style={{
                            left: pct(pos(s)),
                            width: pct(width(s)),
                            background: LAYER_VAR[s.layer],
                            transform: `scaleX(${p})`,
                          }}
                          aria-hidden
                        />
                        {/* Près du bord droit, la durée passe avant la barre
                            pour ne pas déborder du conteneur. */}
                        <span
                          className={`absolute top-0.5 whitespace-nowrap font-mono text-[11px] text-ink-2 transition-opacity ${nearEnd ? "pr-2" : "pl-2"}`}
                          style={{
                            ...(nearEnd
                              ? { right: `calc(100% - ${pct(pos(s))})` }
                              : { left: pct(pos(s) + width(s)) }),
                            opacity: p >= 1 ? 1 : 0,
                          }}
                        >
                          {s.duration} ms
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>

            {gapReserved && gap && (
              <div className="pointer-events-none absolute inset-y-0 left-0 right-0 hidden md:grid md:grid-cols-[20rem_1fr]">
                <div />
                <div className="relative">
                  <div
                    className="absolute inset-y-0 border-x border-dashed border-signal"
                    style={{ left: pct(gapAt), width: pct(GAP) }}
                  >
                    {gapActive && (
                      <motion.div
                        className="hatch absolute inset-0 origin-left"
                        initial={{ scaleX: reduce ? 1 : 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: reduce ? 0 : 1.2, ease: [0.22, 1, 0.36, 1] }}
                      />
                    )}
                    <span className="absolute left-1/2 top-2 max-w-[95%] -translate-x-1/2 truncate bg-paper px-1.5 text-[11px] font-semibold">
                      {gap.label[lang]}
                      {gapActive && waited > 0 ? ` ${seconds} s` : ""}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <p aria-live="polite" className="mt-4 min-h-6 text-sm font-semibold">
          {status && (
            <span className="inline-flex items-start gap-2">
              <span
                className={`mt-1.5 size-2 shrink-0 rounded-full ${phase === "waiting" ? "animate-pulse bg-signal" : "bg-api"}`}
                aria-hidden
              />
              <span>
                {status}
                {/* Compteur visuel seulement : annoncé toutes les 100 ms, il
                    saturerait les lecteurs d'écran. */}
                {phase === "waiting" && waited > 0 && (
                  <span aria-hidden className="ml-2 font-normal text-ink-2 md:hidden">
                    {seconds} s
                  </span>
                )}
              </span>
            </span>
          )}
        </p>

        <div className="mt-6 grid gap-4 border-t border-rule pt-6 md:grid-cols-[12rem_1fr] md:gap-8">
          <p className="text-sm font-semibold text-ink-2">{t.attributes}</p>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`${trace.id}-${current.id}`}
              initial={{ opacity: 0, y: reduce ? 0 : 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduce ? 0 : -4 }}
              transition={{ duration: 0.18 }}
              className="min-w-0"
            >
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="break-all font-mono text-sm font-semibold">{current.name}</span>
                <span className="text-xs font-semibold" style={{ color: LAYER_VAR[current.layer] }}>
                  {t.layers[current.layer]}
                </span>
              </p>
              <div className="mt-4 grid gap-6 lg:grid-cols-2">
                <p className="max-w-[60ch]">{current.what[lang]}</p>
                <p className="max-w-[60ch] text-ink-2">{current.why[lang]}</p>
              </div>
              <p className="mt-4 break-all font-mono text-xs text-ink-2">{current.where}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-16 grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
          <figure className="min-w-0">
            <div className="overflow-hidden border border-rule bg-raised">
              {/* eslint-disable-next-line @next/next/no-img-element -- captures statiques déjà dimensionnées */}
              <img
                src={trace.image.src}
                alt={trace.image.alt[lang]}
                loading="lazy"
                className={`block aspect-16/10 w-full ${trace.image.portrait ? "object-contain" : "object-cover object-top"}`}
              />
            </div>
            <figcaption className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-ink-2">
              <span>{trace.image.alt[lang]}</span>
              {trace.href ? (
                <a href={link(trace.href, lang)} target="_blank" rel="noopener" className="font-semibold text-ink underline">
                  {t.visit}
                </a>
              ) : (
                <span>{t.unpublished}</span>
              )}
            </figcaption>
          </figure>

          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink-2">{t.figures}</p>
            <dl className="mt-3 grid grid-cols-2 border-t border-ink">
              {trace.figures.map((f) => (
                <div key={f.label.fr} className="border-b border-rule py-3 pr-3">
                  <dt className="sr-only">{f.label[lang]}</dt>
                  <dd>
                    <span className="font-display text-xl font-bold font-stretch-140%">{f.value}</span>
                    <span className="mt-0.5 block text-sm text-ink-2">{f.label[lang]}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="mt-12">
          <p className="text-sm font-semibold text-ink-2">{t.surfaces}</p>
          <ul className={`mt-3 grid gap-8 ${trace.surfaces.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3"}`}>
            {trace.surfaces.map((s) => (
              <li key={s.layer} className="border-t-2 pt-4" style={{ borderColor: LAYER_VAR[s.layer] }}>
                <p className="text-xs font-semibold" style={{ color: LAYER_VAR[s.layer] }}>
                  {t.layers[s.layer]}
                </p>
                <h4 className="mt-1 text-lg font-semibold">
                  {s.href ? (
                    <a href={link(s.href, lang)} target="_blank" rel="noopener" className="hover:underline">
                      {s.title[lang]}
                    </a>
                  ) : (
                    s.title[lang]
                  )}
                </h4>
                <p className="mt-2 text-sm text-ink-2">{s.body[lang]}</p>
                <p className="mt-3 text-sm">
                  <span className="sr-only">{t.stack} : </span>
                  {s.stack.join(", ")}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
