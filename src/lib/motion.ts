/**
 * Jetons de mouvement du site, côté GSAP. Ils prolongent ceux de la feuille
 * de style : `EASE.out` est la courbe exacte de `--ease-out-quint`, recréée
 * avec CustomEase au chargement.
 *
 * - `out` : tout ce qui entre (révélations, apparitions) ;
 * - `draw` : ce qui se trace ou pousse (filets, barres), plus nerveux ;
 * - `travel` : ce qui va d'un point à un autre (défilement vers une ancre).
 */
export const EASE = {
  out: "quint",
  draw: "expo.out",
  travel: "expo.inOut",
} as const;

/** Durées, en secondes. */
export const DUR = {
  /** Un bloc qui monte, une ligne de titre. */
  reveal: 1.1,
  /** Un filet, une barre. */
  draw: 1.3,
  /** Le défilement vers une ancre. */
  travel: 1.2,
  /** Un aperçu qui suit le curseur : réactif, pas mou. */
  follow: 0.45,
  /** Un texte brouillé qui se recompose. */
  scramble: 0.7,
} as const;

/** Écart entre deux éléments d'une cascade. */
export const STAGGER = { chars: 0.022, items: 0.09 } as const;

/** Caractères d'un texte brouillé : ceux d'un identifiant de trace. */
export const SCRAMBLE_CHARS = "abcdef0123456789";

/**
 * GSAP et les extensions dont le site se sert, chargés à la demande et
 * enregistrés une seule fois : la page s'affiche sans les attendre.
 *
 * ScrollTrigger (défilement), SplitText (titres), ScrambleText (liens,
 * numéros), Flip (onglets des traces), ScrollTo (ancres), DrawSVG (signe
 * « défiler », chemin de « Comment ça marche »), MotionPath (le point qui
 * suit ce chemin), Draggable et Inertia (la pile 3D se fait tourner à la
 * main), CustomEase (la courbe du site).
 */
export async function loadGsap() {
  const [
    { gsap },
    { ScrollTrigger },
    { SplitText },
    { ScrambleTextPlugin },
    { Flip },
    { ScrollToPlugin },
    { DrawSVGPlugin },
    { Draggable },
    { InertiaPlugin },
    { CustomEase },
    { MotionPathPlugin },
  ] = await Promise.all([
    import("gsap"),
    import("gsap/ScrollTrigger"),
    import("gsap/SplitText"),
    import("gsap/ScrambleTextPlugin"),
    import("gsap/Flip"),
    import("gsap/ScrollToPlugin"),
    import("gsap/DrawSVGPlugin"),
    import("gsap/Draggable"),
    import("gsap/InertiaPlugin"),
    import("gsap/CustomEase"),
    import("gsap/MotionPathPlugin"),
  ]);
  gsap.registerPlugin(
    ScrollTrigger,
    SplitText,
    ScrambleTextPlugin,
    Flip,
    ScrollToPlugin,
    DrawSVGPlugin,
    Draggable,
    InertiaPlugin,
    CustomEase,
    MotionPathPlugin,
  );
  if (!CustomEase.get(EASE.out)) CustomEase.create(EASE.out, "0.22, 1, 0.36, 1");
  return { gsap, ScrollTrigger, SplitText, Flip, Draggable };
}
