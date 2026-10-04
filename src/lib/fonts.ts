import { Anybody, Schibsted_Grotesk } from "next/font/google";

/**
 * Anybody porte l'identité : son axe de largeur (50 à 150 %) est animé à
 * l'ouverture de la page, il faut donc le charger en plus du poids.
 */
export const anybody = Anybody({
  subsets: ["latin", "latin-ext"],
  axes: ["wdth"],
  variable: "--font-anybody",
  display: "swap",
});

export const schibsted = Schibsted_Grotesk({
  subsets: ["latin", "latin-ext"],
  variable: "--font-schibsted",
  display: "swap",
});
