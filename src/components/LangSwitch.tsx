"use client";
import { useSyncExternalStore } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { Lang } from "@/i18n/ui";

/** Chemin équivalent dans l'autre langue : `/blog/x` ↔ `/en/blog/x`. */
function counterpart(pathname: string, lang: Lang) {
  if (lang === "en") return pathname.replace(/^\/en(?=\/|$)/, "") || "/";
  return pathname === "/" ? "/en" : `/en${pathname}`;
}

const subscribe = (cb: () => void) => {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
};

/**
 * Passe à l'autre langue en gardant la page et, sur l'accueil, l'écran
 * ouvert (`#/realisations/resi` reste ouvert en anglais).
 */
export default function LangSwitch({
  lang,
  label,
  className = "",
}: {
  lang: Lang;
  label: string;
  className?: string;
}) {
  const pathname = usePathname() ?? "/";
  const hash = useSyncExternalStore(
    subscribe,
    () => window.location.hash,
    () => "",
  );
  return (
    <Link
      href={counterpart(pathname, lang) + hash}
      hrefLang={lang === "fr" ? "en" : "fr"}
      className={`text-sm text-ink-2 transition-colors hover:text-ink ${className}`}
    >
      {label}
    </Link>
  );
}
