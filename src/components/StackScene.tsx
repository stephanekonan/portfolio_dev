"use client";
import { useEffect, useRef } from "react";
import type * as Three from "three";

import type { Layer } from "@/data/traces";
import { loadGsap } from "@/lib/motion";

interface Props {
  /** Couches de haut en bas, dans l'ordre d'une requête. */
  layers: { layer: Layer; label: string }[];
}

const SIZE = 3;
/** Écart entre deux couches : serré à l'arrivée, déplié en fin de défilement. */
const GAP_CLOSED = 0.42;
const GAP_OPEN = 1;
const TRACES = 9;
/** Les requêtes partent des points de la grille, jamais de n'importe où. */
const GRID = 5;

function cssVar(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/**
 * La pile du site en volume : chaque couche technique est une plaque de sa
 * teinte, et des requêtes safran la traversent de la page aux données, en
 * marquant chaque couche d'un span. Les plaques tombent en place à
 * l'ouverture ; au défilement, l'ouverture est épinglée (grand écran) le
 * temps que la pile glisse au centre, se déplie et pivote. On peut aussi
 * l'attraper et la lancer. Décor pur : la même information est dans la
 * section Compétences.
 */
export default function StackScene({ layers }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const labels = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const host = box.current;
    if (!host) return;
    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const [THREE, { gsap, Draggable }] = await Promise.all([import("three"), loadGsap()]);
      if (disposed) return;

      let renderer: Three.WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      } catch {
        return; // Pas de WebGL : la place reste vide, rien ne manque au contenu.
      }
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
      const wideQuery = window.matchMedia("(min-width: 64rem)");

      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      // Hors du flux : la toile suit sa boîte sans jamais l'élargir.
      renderer.domElement.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";
      host.prepend(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
      camera.position.set(7.2, 5.6, 7.2);
      camera.lookAt(0, 0, 0);
      // Directions « droite » et « haut » de l'écran, dans le plan du sol.
      const screenRight = new THREE.Vector3(1, 0, -1).normalize();

      const stack = new THREE.Group();
      scene.add(stack);

      // --- Couches -------------------------------------------------------
      const half = SIZE / 2;
      const corners = [
        new THREE.Vector3(-half, 0, -half),
        new THREE.Vector3(half, 0, -half),
        new THREE.Vector3(half, 0, half),
        new THREE.Vector3(-half, 0, half),
      ];
      const outline = new THREE.BufferGeometry().setFromPoints(corners);
      const plate = new THREE.PlaneGeometry(SIZE, SIZE).rotateX(-Math.PI / 2);
      const dotsGeo = new THREE.BufferGeometry();
      const dots: number[] = [];
      for (let i = 0; i < GRID; i++)
        for (let j = 0; j < GRID; j++)
          dots.push(((i + 0.5) / GRID - 0.5) * SIZE, 0, ((j + 0.5) / GRID - 0.5) * SIZE);
      dotsGeo.setAttribute("position", new THREE.Float32BufferAttribute(dots, 3));

      const plates = layers.map(() => {
        const g = new THREE.Group();
        const fill = new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, side: THREE.DoubleSide });
        const edge = new THREE.LineBasicMaterial({ transparent: true });
        const dot = new THREE.PointsMaterial({ size: 2, sizeAttenuation: false, transparent: true });
        g.add(new THREE.Mesh(plate, fill), new THREE.LineLoop(outline, edge), new THREE.Points(dotsGeo, dot));
        stack.add(g);
        // `drop` et `alpha` portent l'entrée : chaque plaque tombe en place.
        return { g, fill, edge, dot, drop: 0, alpha: 1 };
      });
      let fillBase = 0.07;

      // --- Requêtes ------------------------------------------------------
      const ringGeo = new THREE.RingGeometry(0.05, 0.065, 40).rotateX(-Math.PI / 2);
      const headGeo = new THREE.SphereGeometry(0.05, 16, 12);
      const traces = Array.from({ length: TRACES }, (_, n) => {
        const head = new THREE.Mesh(headGeo, new THREE.MeshBasicMaterial());
        const lineGeo = new THREE.BufferGeometry();
        lineGeo.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(6), 3));
        const lineMat = new THREE.LineBasicMaterial({ transparent: true, opacity: 0.7 });
        const line = new THREE.Line(lineGeo, lineMat);
        const rings = layers.map(() => {
          const m = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }));
          stack.add(m);
          return { m, age: Infinity };
        });
        stack.add(head, line);
        // Les premières requêtes partent une fois les plaques posées.
        return { head, line, lineGeo, lineMat, rings, x: 0, z: 0, t: 0, speed: 1, wait: 1.6 + n * 0.35 };
      });

      const pick = (tr: (typeof traces)[number]) => {
        tr.x = ((Math.floor(Math.random() * GRID) + 0.5) / GRID - 0.5) * SIZE;
        tr.z = ((Math.floor(Math.random() * GRID) + 0.5) / GRID - 0.5) * SIZE;
        tr.t = 0;
        tr.speed = 0.8 + Math.random() * 0.6;
        tr.rings.forEach((r) => (r.age = Infinity));
      };
      traces.forEach(pick);

      // --- Teintes du thème ---------------------------------------------
      const paint = () => {
        fillBase = getComputedStyle(document.documentElement).colorScheme === "dark" ? 0.1 : 0.07;
        layers.forEach(({ layer }, i) => {
          const c = new THREE.Color(cssVar(`--layer-${layer}`));
          plates[i].fill.color.copy(c);
          plates[i].edge.color.copy(c);
          plates[i].dot.color.copy(c);
        });
        const signal = new THREE.Color(cssVar("--signal"));
        traces.forEach((tr) => {
          (tr.head.material as Three.MeshBasicMaterial).color.copy(signal);
          tr.lineMat.color.copy(signal);
          tr.rings.forEach((r) => (r.m.material as Three.MeshBasicMaterial).color.copy(signal));
        });
      };
      paint();
      const repaint = () => {
        paint();
        if (reduce) draw(0);
      };
      const themeObserver = new MutationObserver(repaint);
      themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
      const scheme = window.matchMedia("(prefers-color-scheme: dark)");
      scheme.addEventListener("change", repaint);

      // --- Placement ------------------------------------------------------
      // `place` vaut 1 quand la pile est rangée à droite de l'ouverture, 0
      // quand elle est au centre ; `open` règle le dépliement.
      const state = { open: 0, place: 1 };
      const layout = { dist: 10, side: 0, down: 0 };

      // --- Entrée : les plaques tombent une à une -------------------------
      const intro = reduce
        ? null
        : gsap.fromTo(
            plates,
            { drop: (i: number) => 2.4 + i * 0.35, alpha: 0 },
            { drop: 0, alpha: 1, duration: 1.6, ease: "expo.out", stagger: 0.11, delay: 0.25 },
          );

      // --- Défilement ----------------------------------------------------
      const section = host.closest("section") ?? host;
      const name = section.querySelector("[data-hero-name]");
      const text = section.querySelector("[data-hero-text]");
      let trigger: { getVelocity(): number } | undefined;
      const mm = gsap.matchMedia();
      if (!reduce) {
        // Grand écran : l'ouverture est épinglée le temps de la chorégraphie.
        mm.add("(min-width: 64rem)", () => {
          const header = document.querySelector("header");
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: section,
              start: () => `top ${header?.offsetHeight ?? 0}px`,
              end: "+=150%",
              pin: true,
              scrub: 1,
              invalidateOnRefresh: true,
            },
          });
          tl.to(state, { open: 1, duration: 1, ease: "power1.inOut" }, 0)
            .to(state, { place: 0, duration: 0.6, ease: "power2.inOut" }, 0)
            .to(name, { yPercent: -45, opacity: 0, duration: 0.45, ease: "power1.in" }, 0)
            .to(text, { y: -60, opacity: 0, duration: 0.4, ease: "power1.in" }, 0.05)
            .to({}, { duration: 0.2 });
          trigger = tl.scrollTrigger;
          return () => (trigger = undefined);
        });
        // Petit écran : pas d'épinglage, la pile se déplie en défilant.
        mm.add("(max-width: 63.999rem)", () => {
          const tl = gsap.timeline({
            scrollTrigger: { trigger: section, start: "top top", end: "bottom top", scrub: 0.8 },
          });
          tl.to(state, { open: 1, ease: "none" }, 0).to(name, { yPercent: -25, opacity: 0.2, ease: "none" }, 0);
          trigger = tl.scrollTrigger;
          return () => (trigger = undefined);
        });
      }

      // --- Souris : parallaxe, au pointeur fin seulement -----------------
      const aim = { x: 0, y: 0 };
      const look = { x: 0, y: 0 };
      const onPointer = (e: PointerEvent) => {
        aim.x = (e.clientX / window.innerWidth - 0.5) * 2;
        aim.y = (e.clientY / window.innerHeight - 0.5) * 2;
      };
      if (finePointer && !reduce) window.addEventListener("pointermove", onPointer, { passive: true });

      // --- À la main : on attrape la pile et on la lance (Draggable +
      // Inertia). Horizontal seulement : au doigt, le défilement vertical
      // de la page passe toujours.
      const spin = { y: 0 };
      const [drag] = Draggable.create(document.createElement("div"), {
        type: "x",
        trigger: host,
        inertia: true,
        allowNativeTouchScrolling: true,
        onDrag() {
          spin.y += this.deltaX * 0.008;
        },
        onThrowUpdate() {
          spin.y += this.deltaX * 0.008;
        },
      });

      // --- Taille --------------------------------------------------------
      const resize = () => {
        const { width, height } = host.getBoundingClientRect();
        if (!width || !height) return;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        if (wideQuery.matches) {
          // La toile couvre toute l'ouverture : la pile se range en bas à
          // droite, sous le nom et à côté du texte.
          layout.dist = 14.5;
          const visH = 2 * layout.dist * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
          layout.side = visH * camera.aspect * 0.26;
          layout.down = visH * 0.15;
        } else {
          // Boîte étroite : on recule, et on pousse la pile à droite pour
          // loger les étiquettes.
          layout.dist = width < 520 ? 11.5 : 10;
          layout.side = width < 520 ? 0.7 : 0;
          layout.down = 0;
        }
        if (reduce) draw(0);
      };
      const sizeObserver = new ResizeObserver(resize);
      sizeObserver.observe(host);
      wideQuery.addEventListener("change", resize);

      // --- Image ---------------------------------------------------------
      const tmp = new THREE.Vector3();
      const draw = (dt: number) => {
        const now = performance.now() / 1000;
        const { open, place } = state;
        const gap = GAP_CLOSED + (GAP_OPEN - GAP_CLOSED) * open;
        const top = ((layers.length - 1) * gap) / 2;
        plates.forEach((p, i) => {
          // Les plaques respirent, chacune à sa phase.
          const bob = reduce ? 0 : Math.sin(now * 1.1 + i * 0.7) * 0.045;
          p.g.position.y = top - i * gap + bob + p.drop;
          p.fill.opacity = fillBase * p.alpha;
          p.edge.opacity = p.alpha;
          p.dot.opacity = 0.55 * p.alpha;
        });

        // Au centre, on se rapproche : la pile dépliée remplit l'écran.
        camera.position.setLength(layout.dist - open * (layout.dist > 12 ? 2.6 : 0.8));
        stack.position.copy(screenRight).multiplyScalar(layout.side * place);
        stack.position.y = -layout.down * place + open * 0.2;

        // Dans le mouvement, la vitesse de défilement presse les requêtes.
        const rush = trigger ? 1 + Math.min(Math.abs(trigger.getVelocity()) / 1200, 3) : 1;
        const k = 1 - Math.exp(-dt * 3);
        look.x += (aim.x - look.x) * k;
        look.y += (aim.y - look.y) * k;
        const sway = reduce ? 0 : Math.sin(now / 3.2) * 0.3;
        stack.rotation.y = sway + look.x * 0.32 - open * 1.1 + spin.y;
        stack.rotation.x = look.y * 0.12 + open * 0.28;

        const ready = !intro || intro.progress() > 0.6;
        const span = top * 2 + 0.6;
        traces.forEach((tr, n) => {
          if (reduce) {
            // Image fixe : quelques requêtes arrêtées à mi-chemin.
            tr.t = n < 3 ? 0.35 + n * 0.2 : -1;
          } else if (!ready || tr.wait > 0) {
            if (ready) tr.wait -= dt;
            tr.t = -1;
          } else {
            tr.t += (dt * tr.speed * rush) / 1.6;
            if (tr.t > 1) {
              pick(tr);
              tr.wait = 0.2 + Math.random() * 0.9;
              tr.t = -1;
            }
          }
          const visible = tr.t >= 0;
          tr.head.visible = tr.line.visible = visible;
          const y = top + 0.3 - Math.max(tr.t, 0) * span;
          tr.head.position.set(tr.x, y, tr.z);
          const pos = tr.lineGeo.attributes.position as Three.BufferAttribute;
          pos.setXYZ(0, tr.x, top + 0.3, tr.z);
          pos.setXYZ(1, tr.x, y, tr.z);
          pos.needsUpdate = true;
          tr.lineMat.opacity = visible ? 0.7 * (1 - Math.max(tr.t - 0.8, 0) * 5) : 0;

          // Un span s'ouvre sur chaque couche que la requête traverse.
          tr.rings.forEach((r, i) => {
            const ly = plates[i].g.position.y;
            if (visible && r.age === Infinity && y <= ly) r.age = reduce ? 0.3 : 0;
            r.m.visible = r.age !== Infinity;
            if (!r.m.visible) return;
            if (!reduce) r.age += dt;
            const life = Math.min(r.age / 1.1, 1);
            r.m.position.set(tr.x, ly + 0.002, tr.z);
            r.m.scale.setScalar(1 + life * 4.5);
            (r.m.material as Three.MeshBasicMaterial).opacity = 0.95 * (1 - life);
          });
        });

        renderer.render(scene, camera);

        // Étiquettes HTML posées sur le coin de chaque couche le plus à
        // gauche à l'écran : il change quand la pile pivote.
        const { width, height } = host.getBoundingClientRect();
        plates.forEach((p, i) => {
          const el = labels.current[i];
          if (!el) return;
          let lx = Infinity;
          let ly = 0;
          for (const c of corners) {
            tmp.copy(c).applyMatrix4(p.g.matrixWorld).project(camera);
            if (tmp.x < lx) [lx, ly] = [tmp.x, tmp.y];
          }
          el.style.opacity = String(p.alpha);
          el.style.transform = `translate3d(${((lx + 1) / 2) * width}px, ${((1 - ly) / 2) * height}px, 0) translate(-100%, -50%)`;
        });
      };

      // --- Boucle, coupée hors écran et onglet caché ---------------------
      let raf = 0;
      let last = performance.now();
      let onScreen = false;
      const loop = (now: number) => {
        draw(Math.min((now - last) / 1000, 0.05));
        last = now;
        raf = requestAnimationFrame(loop);
      };
      const run = () => {
        cancelAnimationFrame(raf);
        if (reduce || !onScreen || document.hidden) return;
        last = performance.now();
        raf = requestAnimationFrame(loop);
      };
      const io = new IntersectionObserver(([e]) => {
        onScreen = e.isIntersecting;
        run();
      });
      io.observe(host);
      document.addEventListener("visibilitychange", run);
      resize();
      host.dataset.ready = "";

      cleanup = () => {
        cancelAnimationFrame(raf);
        io.disconnect();
        sizeObserver.disconnect();
        themeObserver.disconnect();
        scheme.removeEventListener("change", repaint);
        wideQuery.removeEventListener("change", resize);
        document.removeEventListener("visibilitychange", run);
        window.removeEventListener("pointermove", onPointer);
        drag.kill();
        intro?.kill();
        mm.revert();
        scene.traverse((o) => {
          const m = (o as Three.Mesh).material as Three.Material | undefined;
          m?.dispose();
        });
        [outline, plate, dotsGeo, ringGeo, headGeo, ...traces.map((t) => t.lineGeo)].forEach((g) => g.dispose());
        renderer.dispose();
        renderer.domElement.remove();
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, [layers]);

  return (
    <div ref={box} aria-hidden className="stack-scene relative h-full w-full">
      {layers.map(({ layer, label }, i) => (
        <span
          key={layer}
          ref={(el) => {
            labels.current[i] = el;
          }}
          className="pointer-events-none absolute top-0 left-0 pr-3 font-mono text-xs whitespace-nowrap text-ink-2"
        >
          {label}
        </span>
      ))}
    </div>
  );
}
