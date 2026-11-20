import type { Metadata, Viewport } from "next";
import { base, ui, type Lang } from "@/i18n/ui";

export const SITE_URL = "https://developer.wadibu.ci";

/**
 * Image d'aperçu des liens partagés (WhatsApp, LinkedIn, Facebook, X,
 * Telegram…), tirée de `public/portfolio_developpeur_neon.png` : recadrée au
 * format 1200 × 630 et compressée en JPEG (85 Ko), car WhatsApp ignore les
 * images trop lourdes.
 */
export const SHARE_IMAGE = {
  url: "/apercu.jpg",
  width: 1200,
  height: 630,
  type: "image/jpeg",
  alt: "Stéphane Konan, développeur fullstack : du backend au mobile",
};

export function siteMetadata(lang: Lang): Metadata {
  const t = ui[lang].meta;
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t.title, template: `%s, Stéphane Konan` },
    description: t.description,
    authors: [{ name: "Stéphane Konan", url: SITE_URL }],
    alternates: { canonical: base(lang) || "/", languages: { fr: "/", en: "/en" } },
    openGraph: {
      type: "website",
      siteName: "Stéphane Konan",
      title: t.title,
      description: t.description,
      locale: lang === "fr" ? "fr_CI" : "en_US",
      images: [SHARE_IMAGE],
    },
    icons: { icon: "/favicon.ico" },
    manifest: "/manifest.webmanifest",
  };
}

export const siteViewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5efe6" },
    { media: "(prefers-color-scheme: dark)", color: "#14110e" },
  ],
};
