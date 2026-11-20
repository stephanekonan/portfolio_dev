"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { base, type Lang, type Ui } from "@/i18n/ui";

import BrandMark from "./BrandMark";
import LangSwitch from "./LangSwitch";
import ThemeToggle from "./ThemeToggle";

interface Props {
  lang: Lang;
  t: Ui;
}

/**
 * Plus d'en-tête sur l'accueil : l'écran (Desk) porte lui-même le thème et
 * la langue, et toutes les rubriques s'ouvrent depuis ses fiches. Sur les
 * autres pages (articles, 404), une barre légère ramène à l'accueil.
 */
export default function Header({ lang, t }: Props) {
  const pathname = usePathname() ?? "/";
  const home = base(lang) || "/";
  if (pathname === home) return null;

  return (
    <header className="sticky top-0 z-40 border-b border-rule/70 bg-paper/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-304 items-center justify-between gap-4 px-4 sm:px-8">
        <Link
          href={home}
          className="flex items-center gap-2 font-display text-[1.05rem] font-semibold tracking-tight whitespace-nowrap"
        >
          <BrandMark className="size-6" />
          Stéphane Konan
        </Link>
        <div className="flex items-center gap-4">
          <ThemeToggle t={t.theme} />
          <LangSwitch lang={lang} label={t.nav.switchTo} />
        </div>
      </div>
    </header>
  );
}
