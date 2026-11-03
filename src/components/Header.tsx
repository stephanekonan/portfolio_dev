"use client";
import { useEffect, useRef, useState } from "react";

import { Menu, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { base, type Lang, type Ui } from "@/i18n/ui";

import NetworkStatus from "./NetworkStatus";
import ThemeToggle from "./ThemeToggle";

interface Props {
  lang: Lang;
  t: Ui;
}

/** Chemin équivalent dans l'autre langue : `/blog/x` ↔ `/en/blog/x`. */
function counterpart(pathname: string, lang: Lang) {
  if (lang === "en") return pathname.replace(/^\/en(?=\/|$)/, "") || "/";
  return pathname === "/" ? "/en" : `/en${pathname}`;
}

export default function Header({ lang, t }: Props) {
  const reduce = useReducedMotion();
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const home = base(lang) || "/";
  const onHome = pathname === home;
  // Hors de l'accueil, les ancres renvoient vers l'accueil avant de défiler.
  const anchor = (id: string) =>
    onHome ? `#${id}` : `${home === "/" ? "" : home}/#${id}`;

  const links = [
    { href: anchor("comment"), label: t.nav.how },
    { href: anchor("realisations"), label: t.nav.work },
    { href: anchor("competences"), label: t.nav.skills },
    { href: `${base(lang)}/blog`, label: t.nav.blog },
    { href: anchor("contact"), label: t.nav.contact },
  ];

  const close = (returnFocus = false) => {
    setOpen(false);
    if (returnFocus) buttonRef.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    // Page figée sous le menu : sinon le contenu défile derrière le panneau.
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    panelRef.current?.querySelector<HTMLElement>("a, button")?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    // Passé en largeur bureau, le menu n'a plus lieu d'être.
    const desktop = window.matchMedia("(min-width: 64rem)");
    const onDesktop = () => desktop.matches && setOpen(false);
    window.addEventListener("keydown", onKey);
    desktop.addEventListener("change", onDesktop);
    return () => {
      root.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
      desktop.removeEventListener("change", onDesktop);
    };
  }, [open]);

  const langLink = (
    <Link
      href={counterpart(pathname, lang)}
      hrefLang={lang === "fr" ? "en" : "fr"}
      className="chip hover:bg-paper"
    >
      {t.nav.switchTo}
    </Link>
  );

  return (
    // Un îlot flottant : l'en-tête se détache du contenu qui défile dessous.
    <header className="sticky top-0 z-40 px-3 pt-3 sm:px-6">
      <div className="mx-auto flex h-14 max-w-304 items-center justify-between gap-4 rounded-full border-2 border-ink bg-raised/90 pr-3 pl-5 shadow-[3px_3px_0_var(--ink)] backdrop-blur-md sm:pr-4 sm:pl-6">
        <Link
          href={home}
          onClick={() => close()}
          className="flex items-center gap-2 font-display text-lg font-extrabold tracking-tight whitespace-nowrap"
        >
          <span className="size-2.5 rounded-full bg-signal" aria-hidden />
          Stéphane Konan
        </Link>

        <nav aria-label={t.nav.label} className="hidden lg:block">
          <ul className="flex items-center gap-7 text-sm">
            {links.map((l) => (
              <li key={l.label}>
                <Link href={l.href} className="hover:underline">
                  {/* Brouillé puis recomposé au survol (ScrollMotion). */}
                  <span data-scramble>{l.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center gap-5 lg:flex">
          <NetworkStatus t={t.network} />
          <ThemeToggle t={t.theme} />
          {langLink}
        </div>

        <div className="flex items-center gap-4 lg:hidden">
          <NetworkStatus t={t.network} />
          <button
            ref={buttonRef}
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="menu-mobile"
            aria-label={open ? t.nav.close : t.nav.open}
            className="-mr-1 grid size-10 place-items-center rounded-full border-2 border-ink"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={open ? "x" : "menu"}
                initial={{ opacity: 0, rotate: reduce ? 0 : -45 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: reduce ? 0 : 45 }}
                transition={{ duration: 0.15 }}
                className="grid place-items-center"
              >
                {open ? (
                  <X className="size-5" aria-hidden />
                ) : (
                  <Menu className="size-5" aria-hidden />
                )}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id="menu-mobile"
            ref={panelRef}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "calc(100dvh - 5.5rem)", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              duration: reduce ? 0 : 0.32,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="mx-auto mt-2 max-w-304 overflow-y-auto rounded-[1.75rem] border-2 border-ink bg-raised lg:hidden"
          >
            <nav
              aria-label={t.nav.label}
              className="flex min-h-full flex-col px-4 pt-4 pb-8 sm:px-8"
            >
              <ul>
                {links.map((l, i) => (
                  <motion.li
                    key={l.label}
                    initial={{ opacity: 0, y: reduce ? 0 : 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: reduce ? 0 : 0.05 + i * 0.035,
                      duration: 0.25,
                    }}
                    className="border-b border-rule"
                  >
                    <Link
                      href={l.href}
                      onClick={() => close()}
                      className="block py-4 font-display text-xl font-bold font-stretch-120%"
                    >
                      {l.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>
              <div className="mt-auto flex items-center justify-between gap-4 pt-10">
                <div className="flex items-center gap-3 text-sm text-ink-2">
                  {t.theme.label}
                  <ThemeToggle t={t.theme} />
                </div>
                {langLink}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
