"use client";
import { useEffect } from "react";

/**
 * Mouvements liés au défilement de l'accueil, posés par attributs :
 *
 * - `data-hero-name` : le nom remonte et pâlit à mesure qu'on quitte l'ouverture ;
 * - `data-rule` : un filet se trace de gauche à droite à son arrivée ;
 * - `data-split` : un titre monte ligne par ligne, chacune sous son masque ;
 * - `data-reveal` : un bloc monte d'un cran en apparaissant ;
 * - `data-reveal-group` : ses enfants directs font de même, l'un après l'autre.
 *
 * Sans JavaScript, ou avant son chargement, tout est déjà en place : les états
 * de départ ne sont posés qu'au moment de lancer l'animation. Mouvement réduit :
 * de simples fondus, sans déplacement.
 */
export default function ScrollMotion() {
  useEffect(() => {
    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const [{ gsap }, { ScrollTrigger }, { SplitText }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
        import("gsap/SplitText"),
      ]);
      if (disposed) return;
      gsap.registerPlugin(ScrollTrigger, SplitText);
      ScrollTrigger.config({ ignoreMobileResize: true });

      // `power4.out` est l'ease-out quint du site (`--ease-out-quint`).
      const ease = "power4.out";
      const enter = (el: Element) => ({ trigger: el, start: "top 88%", once: true });
      const all = (sel: string) => gsap.utils.toArray<HTMLElement>(sel);
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const name = document.querySelector("[data-hero-name]");
        if (name)
          gsap.to(name, {
            yPercent: -22,
            opacity: 0.2,
            ease: "none",
            scrollTrigger: { trigger: name.closest("section"), start: "top top", end: "bottom top", scrub: 0.6 },
          });

        all("[data-rule]").forEach((el) =>
          gsap.from(el, { scaleX: 0, duration: 1.2, ease, scrollTrigger: enter(el) }),
        );

        const splits = all("[data-split]").map((el) =>
          SplitText.create(el, {
            type: "lines",
            mask: "lines",
            autoSplit: true,
            onSplit: (self) =>
              gsap.from(self.lines, {
                yPercent: 105,
                duration: 1,
                stagger: 0.08,
                ease,
                scrollTrigger: enter(el),
              }),
          }),
        );

        all("[data-reveal]").forEach((el) =>
          gsap.from(el, { y: 28, opacity: 0, duration: 0.9, ease, scrollTrigger: enter(el) }),
        );

        all("[data-reveal-group]").forEach((el) =>
          gsap.from(el.children, { y: 20, opacity: 0, duration: 0.8, stagger: 0.06, ease, scrollTrigger: enter(el) }),
        );

        return () => splits.forEach((s) => s.revert());
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        all("[data-reveal], [data-split]").forEach((el) =>
          gsap.from(el, { opacity: 0, duration: 0.4, ease: "power1.out", scrollTrigger: enter(el) }),
        );
      });

      // Projets et parcours s'ouvrent en accordéon : la page change de
      // hauteur sans que la fenêtre bouge, il faut recaler les déclencheurs.
      let timer = 0;
      const sizes = new ResizeObserver(() => {
        clearTimeout(timer);
        timer = window.setTimeout(() => ScrollTrigger.refresh(), 200);
      });
      sizes.observe(document.body);

      cleanup = () => {
        clearTimeout(timer);
        sizes.disconnect();
        mm.revert();
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return null;
}
