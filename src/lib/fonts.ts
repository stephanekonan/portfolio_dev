import { Bricolage_Grotesque, Instrument_Sans } from "next/font/google";

/**
 * Bricolage Grotesque porte les titres : expressive et chaleureuse, avec un
 * axe de taille optique (`opsz`) qui resserre le dessin en très grand et
 * une largeur (`wdth`) que les titres font varier.
 */
export const display = Bricolage_Grotesque({
  subsets: ["latin", "latin-ext"],
  axes: ["opsz", "wdth"],
  variable: "--font-display-face",
  display: "swap",
});

/** Instrument Sans porte le texte : lisible, nette, un peu de caractère. */
export const text = Instrument_Sans({
  subsets: ["latin", "latin-ext"],
  axes: ["wdth"],
  variable: "--font-text-face",
  display: "swap",
});
