"use client";
import { useEffect, useRef } from "react";

import { usePathname } from "next/navigation";

import { DUR, EASE, SCRAMBLE_CHARS, STAGGER, loadGsap } from "@/lib/motion";

/**
 * Mouvements de toutes les pages du site, posés par attributs :
 *
 * - `data-rule` : un filet se trace de gauche à droite à son arrivée ;
 * - `data-split` : un titre monte lettre par lettre, chaque ligne sous son masque ;
 * - `data-reveal` : un bloc monte en apparaissant ;
 * - `data-reveal-group` : ses enfants directs font de même, l'un après l'autre ;
 * - `data-pop` : ses enfants (logos) surgissent en pivotant ;
 * - `data-timeline` : frise du parcours. Un curseur de temps `data-time-cursor`
 *   la balaie au rythme du défilement et les barres `data-grow` se
 *   remplissent à son passage ;
 * - `data-magnetic` : un bouton est attiré par le curseur, puis revient ;
 * - `data-scramble` : un lien se brouille et se recompose au survol ;
 * - `data-scramble-in` : un numéro se recompose à son arrivée ;
 * - `data-scroll-cue` : le trait SVG du signe « défiler » se dessine en boucle ;
 * - `.prose-article` : les blocs d'un article montent par lots.
 *
 * Les liens vers une ancre de la page défilent sous la conduite de GSAP.
 *
 * Une barre safran sous l'en-tête suit la lecture. La pile 3D de l'accueil a
 * sa propre chorégraphie (StackScene), la trame du papier aussi (PaperField).
 *
 * Sans JavaScript, ou avant son chargement, tout est déjà en place : les états
 * de départ ne sont posés qu'au moment de lancer l'animation. Mouvement réduit :
 * de simples fondus, sans déplacement.
 */
export default function ScrollMotion() {
  const bar = useRef<HTMLDivElement>(null);
  // Une navigation remplace le contenu : tout est reposé page par page.
  const pathname = usePathname();

  useEffect(() => {
    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const { gsap, ScrollTrigger, SplitText } = await loadGsap();
      if (disposed) return;
      ScrollTrigger.config({ ignoreMobileResize: true });

      const ease = EASE.out;
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
          gsap.from(el, { scaleX: 0, duration: DUR.draw, ease: EASE.draw, scrollTrigger: enter(el) }),
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
                duration: DUR.reveal,
                stagger: STAGGER.chars,
                ease,
                scrollTrigger: enter(el),
              }),
          }),
        );

        all("[data-reveal]").forEach((el) =>
          gsap.from(el, { y: 80, opacity: 0, duration: DUR.reveal, ease, scrollTrigger: enter(el) }),
        );

        // Un groupe vide (rangée de logos d'une compétence qui n'en a pas)
        // n'a rien à animer.
        const filled = (sel: string) => all(sel).filter((el) => el.children.length > 0);

        filled("[data-reveal-group]").forEach((el) =>
          gsap.from(el.children, { y: 60, opacity: 0, duration: DUR.reveal, stagger: STAGGER.items, ease, scrollTrigger: enter(el) }),
        );

        filled("[data-pop]").forEach((el) =>
          gsap.from(el.children, {
            scale: 0.3,
            rotate: -35,
            opacity: 0,
            duration: 0.8,
            stagger: 0.06,
            ease: "back.out(2.2)",
            scrollTrigger: enter(el),
          }),
        );

        // Le curseur de temps avance avec le défilement ; chaque barre se
        // remplit pendant que le curseur la traverse. L'unité de la frise est
        // le pourcentage de l'axe.
        all("[data-timeline]").forEach((el) => {
          const cursor = el.querySelector<HTMLElement>("[data-time-cursor]");
          const bars = gsap.utils.toArray<HTMLElement>(el.querySelectorAll("[data-grow]"));
          const span = (b: HTMLElement) => [parseFloat(b.style.left) || 0, parseFloat(b.style.width) || 0];
          const end = Math.max(...bars.map((b) => span(b)[0] + span(b)[1]), 1);
          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: { trigger: el, start: "top 75%", end: "bottom 40%", scrub: 0.6, invalidateOnRefresh: true },
          });
          if (cursor)
            tl.fromTo(
              cursor,
              { x: 0, opacity: 1 },
              { x: () => (cursor.parentElement!.offsetWidth * end) / 100, duration: end },
              0,
            ).to(cursor, { opacity: 0, duration: 4 });
          bars.forEach((b) => {
            const [left, width] = span(b);
            tl.fromTo(b, { scaleX: 0 }, { scaleX: 1, duration: width }, left);
          });
        });

        // Articles : les blocs entrent par lots, pas un par un.
        const prose = all(".prose-article > *");
        if (prose.length) gsap.set(prose, { y: 30, opacity: 0 });
        const batch = prose.length
          ? ScrollTrigger.batch(prose, {
              start: "top 90%",
              once: true,
              onEnter: (els) => gsap.to(els, { y: 0, opacity: 1, duration: 0.9, stagger: 0.07, ease }),
            })
          : [];

        return () => {
          splits.forEach((s) => s.revert());
          batch.forEach((t) => t.kill());
        };
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        all("[data-reveal], [data-split], [data-reveal-group]").forEach((el) =>
          gsap.from(el, { opacity: 0, duration: 0.4, ease: "power1.out", scrollTrigger: enter(el) }),
        );
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Numéros de section : brouillés comme un identifiant de span, puis
        // recomposés à leur arrivée.
        all("[data-scramble-in]").forEach((el) =>
          gsap.from(el, {
            scrambleText: { text: "··", chars: SCRAMBLE_CHARS },
            duration: DUR.scramble,
            ease: "none",
            scrollTrigger: enter(el),
          }),
        );

        // Signe « défiler » de l'ouverture : un trait qui se dessine en
        // boucle, et s'efface dès qu'on défile.
        all("[data-scroll-cue]").forEach((el) => {
          gsap
            .timeline({ repeat: -1, repeatDelay: 0.3 })
            .fromTo(el.querySelectorAll("path"), { drawSVG: "0% 0%" }, { drawSVG: "0% 100%", duration: 0.9, ease: EASE.draw })
            .to(el.querySelectorAll("path"), { drawSVG: "100% 100%", duration: 0.6, ease: "power2.in" });
          gsap.to(el, { autoAlpha: 0, ease: "none", scrollTrigger: { start: 0, end: 240, scrub: true } });
        });
      });

      // Liens de navigation : le libellé se brouille et se recompose au survol.
      mm.add("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
        const offs = all("[data-scramble]").map((el) => {
          const text = el.textContent ?? "";
          const run = () =>
            gsap.to(el, {
              scrambleText: { text, chars: "lowerCase", speed: 0.8 },
              duration: DUR.scramble * 0.6,
              overwrite: true,
            });
          el.addEventListener("pointerenter", run);
          return () => el.removeEventListener("pointerenter", run);
        });
        return () => offs.forEach((off) => off());
      });

      // Ancres de la page : un défilement mené par GSAP (ScrollTo), qui
      // tient compte de l'en-tête collant et de l'ouverture épinglée. Écouté
      // à la capture : un `<Link>` qui trouve le clic déjà annulé renonce à
      // sa propre navigation, mais son `onClick` (fermer le menu) passe.
      const onClick = (e: MouseEvent) => {
        const a = (e.target as Element).closest<HTMLAnchorElement>("a[href*='#']");
        if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
        const url = new URL(a.href);
        const target = url.hash && document.getElementById(decodeURIComponent(url.hash.slice(1)));
        if (url.pathname !== location.pathname || !target) return;
        e.preventDefault();
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const header = document.querySelector("header")?.offsetHeight ?? 0;
        gsap.to(window, {
          scrollTo: { y: target, offsetY: header + 16 },
          duration: reduce ? 0 : DUR.travel,
          ease: EASE.travel,
          overwrite: true,
        });
        history.pushState(null, "", url.hash);
      };
      document.addEventListener("click", onClick, true);

      // Boutons aimantés : au pointeur fin seulement, sans mouvement réduit.
      mm.add("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
        const offs = all("[data-magnetic]").map((el) => {
          const x = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3.out" });
          const y = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3.out" });
          const move = (e: PointerEvent) => {
            const r = el.getBoundingClientRect();
            x((e.clientX - r.left - r.width / 2) * 0.3);
            y((e.clientY - r.top - r.height / 2) * 0.4);
          };
          const leave = () => gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: "elastic.out(1, 0.4)" });
          el.addEventListener("pointermove", move);
          el.addEventListener("pointerleave", leave);
          return () => {
            el.removeEventListener("pointermove", move);
            el.removeEventListener("pointerleave", leave);
          };
        });
        return () => offs.forEach((off) => off());
      });

      // Accordéons, épinglage de l'ouverture : la page change de hauteur sans
      // que la fenêtre bouge, il faut recaler les déclencheurs.
      let timer = 0;
      const sizes = new ResizeObserver(() => {
        clearTimeout(timer);
        // Remis dans l'ordre de la page : un épinglage créé après les
        // déclencheurs qu'il précède doit quand même les décaler.
        timer = window.setTimeout(() => {
          ScrollTrigger.sort();
          ScrollTrigger.refresh();
        }, 200);
      });
      sizes.observe(document.body);

      cleanup = () => {
        clearTimeout(timer);
        sizes.disconnect();
        document.removeEventListener("click", onClick, true);
        mm.revert();
        progress.scrollTrigger?.kill();
        progress.kill();
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, [pathname]);

  return (
    <div
      ref={bar}
      aria-hidden
      className="fixed inset-x-0 top-0 z-50 h-1 origin-left scale-x-0 rounded-r-full bg-signal"
    />
  );
}
