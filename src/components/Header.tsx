"use client";
import { useEffect, useRef, useState } from "react";

import { Menu, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { base, type Lang, type Ui } from "@/i18n/ui";

import BrandMark from "./BrandMark";
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
  // Chaque rubrique est un écran de l'accueil (`#/…`) ; ailleurs, le lien
  // ramène d'abord à l'accueil.
  const anchor = (id: string) =>
    onHome ? `#/${id}` : `${home === "/" ? "" : home}/#/${id}`;

  const links = [
    { href: anchor("comment"), label: t.nav.how },
    { href: anchor("realisations"), label: t.nav.work },
    { href: anchor("savoir-faire"), label: t.nav.skills },
    { href: anchor("blog"), label: t.nav.blog },
  ];
  const contact = { href: anchor("contact"), label: t.nav.contact };

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
      className="text-sm text-ink-2 transition-colors hover:text-ink"
    >
      {t.nav.switchTo}
    </Link>
  );

  return (
    // Une barre légère, posée sur le plan de travail : la marque à gauche,
    // les rubriques au centre, la langue et le contact à droite.
    <header className="sticky top-0 z-40 border-b border-rule/70 bg-paper/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-304 items-center justify-between gap-4 px-4 sm:px-8">
        <Link
          href={home}
          onClick={() => close()}
          className="flex items-center gap-2 font-display text-[1.05rem] font-semibold tracking-tight whitespace-nowrap"
        >
          <BrandMark className="size-6" />
          Stéphane Konan
        </Link>

        <nav aria-label={t.nav.label} className="hidden lg:block">
          <ul className="flex items-center gap-8 text-sm text-ink-2">
            {links.map((l) => (
              <li key={l.label}>
                <Link href={l.href} className="transition-colors hover:text-ink">
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
          <Link href={contact.href} className="btn btn-sm">
            {contact.label}
          </Link>
        </div>

        <div className="flex items-center gap-4 lg:hidden">
          <NetworkStatus t={t.network} />
          <button
            ref={buttonRef}
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="menu-mobile"
            aria-label={open ? t.nav.close : t.nav.open}
            className="-mr-1 grid size-10 place-items-center rounded-xl border border-rule bg-raised"
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
            animate={{ height: "calc(100dvh - 5rem)", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              duration: reduce ? 0 : 0.32,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="mx-3 mb-3 max-w-304 overflow-y-auto rounded-2xl border border-rule bg-raised shadow-[var(--shadow-float)] sm:mx-6 lg:hidden"
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
                      className="block py-4 font-display text-xl font-semibold tracking-tight"
                    >
                      {l.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>
              <Link href={contact.href} onClick={() => close()} className="btn btn-primary mt-6">
                {contact.label}
              </Link>
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
