import { Caveat, Inter } from "next/font/google";

/**
 * Inter porte tout le site, titres compris : une grotesque nette, serrée
 * en très grand (`tracking` négatif), comme un outil de travail bien rangé.
 */
export const text = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-text-face",
  display: "swap",
});

/** L'écriture à la main du post-it de l'accueil, et de lui seul. */
export const hand = Caveat({
  subsets: ["latin", "latin-ext"],
  weight: ["500"],
  variable: "--font-hand-face",
  display: "swap",
});
