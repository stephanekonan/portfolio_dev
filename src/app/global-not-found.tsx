import "@/styles/global.css";

import type { Metadata } from "next";

import NotFoundBody from "@/components/NotFoundBody";
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
        <NotFoundBody />
      </body>
    </html>
  );
}
