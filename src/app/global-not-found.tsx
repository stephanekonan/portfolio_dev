import "@/styles/global.css";

import type { Metadata } from "next";
import Link from "next/link";

import {
  anybody,
  schibsted,
} from "@/lib/fonts";
import { THEME_SCRIPT } from "@/lib/theme";

export const metadata: Metadata = {
  title: "404, page introuvable",
};

export default function GlobalNotFound() {
  return (
    <html lang="fr" className={`${anybody.variable} ${schibsted.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>
        <main className="mx-auto flex min-h-dvh max-w-304 flex-col justify-center px-4 sm:px-8">
          <p className="font-mono text-sm text-ink-2">GET {"→"} 404</p>
          <h1 className="mt-4 font-display text-3xl font-extrabold font-stretch-140%">
            Cette page n&apos;existe pas.
          </h1>
          <p className="mt-4 max-w-[52ch] text-lg text-ink-2">
            Le lien est peut-être ancien, ou l&apos;adresse mal tapée. Repartez de l&apos;accueil.
          </p>
          <p className="mt-8 flex gap-6 font-semibold">
            <Link href="/" className="underline">Accueil</Link>
            <Link href="/en" className="underline" hrefLang="en">English home</Link>
          </p>
        </main>
      </body>
    </html>
  );
}
