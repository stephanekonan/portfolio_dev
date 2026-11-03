/**
 * Jetons de mouvement du site, côté GSAP. Ils prolongent ceux de la feuille
 * de style : `EASE.out` est l'ease-out quint de `--ease-out-quint`.
 *
 * - `out` : tout ce qui entre (révélations, apparitions) ;
 * - `draw` : ce qui se trace ou pousse (filets, barres), plus nerveux ;
 * - `travel` : ce qui se déplace d'un point à un autre à l'écran (la pile 3D
 *   qui vole d'une section à l'autre).
 */
export const EASE = {
  out: "power4.out",
  draw: "expo.out",
  travel: "expo.inOut",
} as const;

/** Durées, en secondes. */
export const DUR = {
  /** Préavis d'un bloc qui monte, d'une ligne de titre. */
  reveal: 1.1,
  /** Un filet, une barre. */
  draw: 1.3,
  /** Le vol de la pile entre deux sections. */
  travel: 1.4,
  /** Un aperçu qui suit le curseur : réactif, pas mou. */
  follow: 0.45,
} as const;

/** Écart entre deux éléments d'une cascade. */
export const STAGGER = { chars: 0.022, items: 0.09 } as const;

/**
 * GSAP et ses extensions, chargés à la demande et enregistrés une seule
 * fois : la page s'affiche sans les attendre.
 */
export async function loadGsap() {
  const [{ gsap }, { ScrollTrigger }, { SplitText }] = await Promise.all([
    import("gsap"),
    import("gsap/ScrollTrigger"),
    import("gsap/SplitText"),
  ]);
  gsap.registerPlugin(ScrollTrigger, SplitText);
  return { gsap, ScrollTrigger, SplitText };
}
