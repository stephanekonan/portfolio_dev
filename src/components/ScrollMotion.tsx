"use client";
import { useEffect, useRef } from "react";

/**
 * Mouvements liés au défilement de l'accueil, posés par attributs :
 *
 * - `data-rule` : un filet se trace de gauche à droite à son arrivée ;
 * - `data-split` : un titre monte lettre par lettre, chaque ligne sous son masque ;
 * - `data-reveal` : un bloc monte en apparaissant ;
 * - `data-reveal-group` : ses enfants directs font de même, l'un après l'autre ;
 * - `data-grow-list` : ses barres `data-grow` poussent depuis leur gauche,
 *   l'une après l'autre (frise du parcours).
 *
 * L'ouverture a sa propre chorégraphie, dans StackScene. Une barre safran
 * sous l'en-tête suit la lecture de la page.
 *
 * Sans JavaScript, ou avant son chargement, tout est déjà en place : les états
 * de départ ne sont posés qu'au moment de lancer l'animation. Mouvement réduit :
 * de simples fondus, sans déplacement.
 */
export default function ScrollMotion() {
  const bar = useRef<HTMLDivElement>(null);

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
      const enter = (el: Element) => ({ trigger: el, start: "top 85%", once: true });
      const all = (sel: string) => gsap.utils.toArray<HTMLElement>(sel);
      const mm = gsap.matchMedia();

      const progress = gsap.fromTo(
        bar.current,
        { scaleX: 0 },
        { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } },
      );

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        all("[data-rule]").forEach((el) =>
          gsap.from(el, { scaleX: 0, duration: 1.4, ease: "expo.out", scrollTrigger: enter(el) }),
        );

        const splits = all("[data-split]").map((el) =>
          SplitText.create(el, {
            type: "lines, chars",
            mask: "lines",
            autoSplit: true,
            onSplit: (self) =>
              gsap.from(self.chars, {
                yPercent: 120,
                rotate: 6,
                duration: 1.1,
                stagger: 0.022,
                ease,
                scrollTrigger: enter(el),
              }),
          }),
        );

        all("[data-reveal]").forEach((el) =>
          gsap.from(el, { y: 80, opacity: 0, duration: 1.2, ease, scrollTrigger: enter(el) }),
        );

        all("[data-reveal-group]").forEach((el) =>
          gsap.from(el.children, { y: 60, opacity: 0, duration: 1.1, stagger: 0.09, ease, scrollTrigger: enter(el) }),
        );

        all("[data-grow-list]").forEach((el) =>
          gsap.from(el.querySelectorAll("[data-grow]"), {
            scaleX: 0,
            duration: 1.2,
            delay: 0.15,
            stagger: 0.1,
            ease: "expo.out",
            scrollTrigger: enter(el),
          }),
        );

        return () => splits.forEach((s) => s.revert());
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        all("[data-reveal], [data-split], [data-reveal-group]").forEach((el) =>
          gsap.from(el, { opacity: 0, duration: 0.4, ease: "power1.out", scrollTrigger: enter(el) }),
        );
      });

      // Projets et parcours s'ouvrent en accordéon, l'ouverture est
      // épinglée : la page change de hauteur sans que la fenêtre bouge, il
      // faut recaler les déclencheurs.
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
        progress.scrollTrigger?.kill();
        progress.kill();
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return (
    <div
      ref={bar}
      aria-hidden
      className="fixed inset-x-0 top-14 z-40 h-0.5 origin-left scale-x-0 bg-signal"
    />
  );
}
