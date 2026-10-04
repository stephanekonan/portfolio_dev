import type { Metadata, Viewport } from "next";
import { base, ui, type Lang } from "@/i18n/ui";

export const SITE_URL = "https://developer.wadibu.ci";

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
      images: [{ url: "/resi.png", width: 1360, height: 850 }],
    },
    icons: { icon: "/favicon.ico" },
    manifest: "/manifest.webmanifest",
  };
}

export const siteViewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#eceee8" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1012" },
  ],
};
