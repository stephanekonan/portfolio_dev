import type { Metadata, Viewport } from "next";
import RootDocument from "@/components/RootDocument";
import { SITE_URL, siteViewport } from "@/lib/metadata";
import "@/styles/carnet.css";

/**
 * Racine de l'espace privé, `/<CARNET_PATH>/…` (voir `src/lib/carnet`).
 * Ni en-tête du site, ni mesure d'audience. Rien n'y est indexé ni mis en
 * cache, et aucune page publique n'y renvoie.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Carnet", template: "%s, carnet" },
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
  referrer: "same-origin",
  icons: { icon: "/favicon.ico" },
};

export const viewport: Viewport = siteViewport;

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <RootDocument lang="fr" chrome={false} tracking={false}>
      {children}
    </RootDocument>
  );
}
