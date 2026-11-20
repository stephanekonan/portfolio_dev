"use client";
import { useEffect, useId, useRef, useState } from "react";

import {
  BookOpen,
  Clock3,
  FolderOpen,
  Layers,
  LayoutGrid,
  Mail,
  Route,
  SquareTerminal,
  UserRound,
  X,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import type { Ui } from "@/i18n/ui";

import { href } from "./kit";

const ITEMS = [
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

/** Combien de rubriques restent visibles dans la barre, avant « Plus ». */
const VISIBLE = 3;

function Item({
  label,
  to,
  Icon,
}: {
  label: string;
  to: string;
  Icon: (typeof ITEMS)[number]["Icon"];
}) {
  return (
    <a
      href={to}
      className="group flex w-[4.9rem] flex-col items-center gap-1 rounded-xl px-1.5 py-1 text-[0.68rem] text-ink-2 hover:text-ink"
    >
      <span className="grid size-11 place-items-center rounded-xl border border-rule bg-raised shadow-sm transition-[translate,background-color,color] duration-200 ease-out group-hover:-translate-y-1 group-hover:bg-signal group-hover:text-on-signal">
        <Icon className="size-5" strokeWidth={1.75} aria-hidden />
      </span>
      <span className="max-w-full truncate">{label}</span>
    </a>
  );
}

/**
 * La barre de l'accueil : trois rubriques et un bouton « Plus » qui ouvre
 * une fenêtre avec toutes les rubriques. Elle se ferme par la croix, Échap
 * ou un clic à côté.
 */
export default function Dock({ s }: { s: Ui["screens"] }) {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const id = useId();
  const box = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    box.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopImmediatePropagation();
      setOpen(false);
      button.current?.focus();
    };
    const onDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (!box.current?.contains(target) && !button.current?.contains(target))
        setOpen(false);
    };
    window.addEventListener("keydown", onKey, true);
    document.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey, true);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  return (
    <div className="relative">
      <AnimatePresence>
        {open && (
          <motion.div
            ref={box}
            id={id}
            role="dialog"
            tabIndex={-1}
            aria-label={s.dockLabel}
            initial={{
              opacity: 0,
              y: reduce ? 0 : 10,
              scale: reduce ? 1 : 0.96,
            }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: reduce ? 0 : 6, scale: reduce ? 1 : 0.98 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="absolute bottom-full left-1/2 z-30 mb-3 w-max origin-bottom -translate-x-1/2 rounded-[1.4rem] border border-rule bg-raised/95 p-3 shadow-[var(--shadow-float)] backdrop-blur-md"
          >
            <div className="mb-2 flex items-center justify-between px-1.5">
              <p className="text-xs font-medium tracking-wide text-ink-3 uppercase">
                {s.dockLabel}
              </p>
              <button
                onClick={() => {
                  setOpen(false);
                  button.current?.focus();
                }}
                aria-label={s.close}
                className="grid size-7 place-items-center rounded-lg text-ink-2 hover:bg-sunken hover:text-ink"
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>
            <ul className="grid grid-cols-4 gap-x-1 gap-y-1.5">
              {ITEMS.map(({ key, to, Icon }) => (
                <li key={key}>
                  <Item label={s.dock[key]} to={to} Icon={Icon} />
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      <ul className="flex gap-1 rounded-[1.4rem] border border-rule bg-raised/80 p-2.5 shadow-[var(--shadow-float)] backdrop-blur-md">
        {ITEMS.slice(0, VISIBLE).map(({ key, to, Icon }) => (
          <li key={key}>
            <Item label={s.dock[key]} to={to} Icon={Icon} />
          </li>
        ))}
        <li>
          <button
            ref={button}
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls={id}
            aria-haspopup="dialog"
            className="group flex w-[4.9rem] flex-col items-center gap-1 rounded-xl px-1.5 py-1 text-[0.68rem] text-ink-2 hover:text-ink"
          >
            <span
              className={`grid size-11 place-items-center rounded-xl border shadow-sm transition-[translate,background-color,color] duration-200 ease-out group-hover:-translate-y-1 ${
                open
                  ? "border-transparent bg-signal text-on-signal"
                  : "border-rule bg-raised group-hover:bg-signal group-hover:text-on-signal"
              }`}
            >
              {open ? (
                <X className="size-5" strokeWidth={1.75} aria-hidden />
              ) : (
                <LayoutGrid className="size-5" strokeWidth={1.75} aria-hidden />
              )}
            </span>
            <span>{open ? s.close : s.more}</span>
          </button>
        </li>
      </ul>
    </div>
  );
}
