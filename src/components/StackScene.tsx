"use client";
import { useEffect, useRef } from "react";
import type * as Three from "three";

import type { Layer } from "@/data/traces";

interface Props {
  /** Couches de haut en bas, dans l'ordre d'une requête. */
  layers: { layer: Layer; label: string }[];
}

const SIZE = 3;
/** Écart entre deux couches : serré à l'arrivée, déplié quand on défile. */
const GAP_CLOSED = 0.42;
const GAP_OPEN = 0.95;
const TRACES = 6;
/** Les requêtes partent des points de la grille, jamais de n'importe où. */
const GRID = 5;

function cssVar(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/**
 * La pile du site en volume : chaque couche technique est une plaque de sa
 * teinte, et des requêtes safran la traversent de la page aux données, en
 * marquant chaque couche d'un span. Défiler déplie la pile. Décor pur : la
 * même information est dans la section Compétences.
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
      const [THREE, { gsap }, { ScrollTrigger }] = await Promise.all([
        import("three"),
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (disposed) return;
      gsap.registerPlugin(ScrollTrigger);

      let renderer: Three.WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      } catch {
        return; // Pas de WebGL : la place reste vide, rien ne manque au contenu.
      }
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      // Hors du flux : la toile suit sa boîte sans jamais l'élargir.
      renderer.domElement.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";
      host.prepend(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
      camera.position.set(7.2, 5.6, 7.2);
      camera.lookAt(0, 0, 0);

      const stack = new THREE.Group();
      scene.add(stack);

      // --- Couches -------------------------------------------------------
      const half = SIZE / 2;
      const outline = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-half, 0, -half),
        new THREE.Vector3(half, 0, -half),
        new THREE.Vector3(half, 0, half),
        new THREE.Vector3(-half, 0, half),
      ]);
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
        return { g, fill, edge, dot };
      });

      // --- Requêtes ------------------------------------------------------
      const ringGeo = new THREE.RingGeometry(0.05, 0.065, 40).rotateX(-Math.PI / 2);
      const headGeo = new THREE.SphereGeometry(0.045, 16, 12);
      const signal = new THREE.Color();
      const traces = Array.from({ length: TRACES }, (_, n) => {
        const head = new THREE.Mesh(headGeo, new THREE.MeshBasicMaterial({ color: signal }));
        const lineGeo = new THREE.BufferGeometry();
        lineGeo.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(6), 3));
        const lineMat = new THREE.LineBasicMaterial({ color: signal, transparent: true, opacity: 0.7 });
        const line = new THREE.Line(lineGeo, lineMat);
        const rings = layers.map(() => {
          const m = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: signal, transparent: true, opacity: 0, depthWrite: false }));
          stack.add(m);
          return { m, age: Infinity };
        });
        stack.add(head, line);
        return { head, line, lineGeo, lineMat, rings, x: 0, z: 0, t: 0, speed: 1, wait: n * 0.55 };
      });

      const pick = (tr: (typeof traces)[number]) => {
        tr.x = ((Math.floor(Math.random() * GRID) + 0.5) / GRID - 0.5) * SIZE;
        tr.z = ((Math.floor(Math.random() * GRID) + 0.5) / GRID - 0.5) * SIZE;
        tr.t = 0;
        tr.speed = 0.75 + Math.random() * 0.5;
        tr.rings.forEach((r) => (r.age = Infinity));
      };
      traces.forEach(pick);

      // --- Teintes du thème ---------------------------------------------
      const paint = () => {
        const isDark = getComputedStyle(document.documentElement).colorScheme === "dark";
        layers.forEach(({ layer }, i) => {
          const c = new THREE.Color(cssVar(`--layer-${layer}`));
          plates[i].fill.color.copy(c);
          plates[i].fill.opacity = isDark ? 0.1 : 0.07;
          plates[i].edge.color.copy(c);
          plates[i].dot.color.copy(c);
          plates[i].dot.opacity = 0.55;
        });
        signal.set(cssVar("--signal"));
        traces.forEach((tr) => {
          (tr.head.material as Three.MeshBasicMaterial).color.copy(signal);
          tr.lineMat.color.copy(signal);
          tr.rings.forEach((r) => (r.m.material as Three.MeshBasicMaterial).color.copy(signal));
        });
      };
      paint();
      const themeObserver = new MutationObserver(() => {
        paint();
        if (reduce) draw(0);
      });
      themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
      const scheme = window.matchMedia("(prefers-color-scheme: dark)");
      const onScheme = () => {
        paint();
        if (reduce) draw(0);
      };
      scheme.addEventListener("change", onScheme);

      // --- Défilement : la pile se déplie et bascule --------------------
      const state = { open: 0 };
      const section = host.closest("section") ?? host;
      const scrollTween = reduce
        ? null
        : gsap.to(state, {
            open: 1,
            ease: "none",
            scrollTrigger: { trigger: section, start: "top top", end: "bottom top", scrub: 0.8 },
          });

      // --- Souris : légère parallaxe, au pointeur fin seulement ---------
      const aim = { x: 0, y: 0 };
      const look = { x: 0, y: 0 };
      const onPointer = (e: PointerEvent) => {
        aim.x = (e.clientX / window.innerWidth - 0.5) * 2;
        aim.y = (e.clientY / window.innerHeight - 0.5) * 2;
      };
      if (finePointer && !reduce) window.addEventListener("pointermove", onPointer, { passive: true });

      // --- Taille --------------------------------------------------------
      const resize = () => {
        const { width, height } = host.getBoundingClientRect();
        if (!width || !height) return;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        // Sur un écran étroit, on recule pour garder la pile entière.
        const narrow = width < 520;
        camera.position.setLength(narrow ? 11.5 : 10);
        // …et on la pousse vers la droite de l'écran pour loger les étiquettes.
        const shift = narrow ? 0.5 : 0;
        stack.position.x = shift;
        stack.position.z = -shift;
        camera.updateProjectionMatrix();
        if (reduce) draw(0);
      };
      const sizeObserver = new ResizeObserver(resize);
      sizeObserver.observe(host);

      // --- Image ---------------------------------------------------------
      const tmp = new THREE.Vector3();
      const draw = (dt: number) => {
        const open = state.open;
        const gap = GAP_CLOSED + (GAP_OPEN - GAP_CLOSED) * open;
        const top = ((layers.length - 1) * gap) / 2;
        plates.forEach((p, i) => (p.g.position.y = top - i * gap));

        // Dans le mouvement, la vitesse de défilement presse les requêtes.
        const rush = scrollTween?.scrollTrigger
          ? 1 + Math.min(Math.abs(scrollTween.scrollTrigger.getVelocity()) / 1800, 2)
          : 1;
        const k = 1 - Math.exp(-dt * 3);
        look.x += (aim.x - look.x) * k;
        look.y += (aim.y - look.y) * k;
        // Un balancement, pas une rotation : les étiquettes restent du même côté.
        const sway = reduce ? 0 : Math.sin(performance.now() / 4000) * 0.22;
        stack.rotation.y = sway + look.x * 0.18 - open * 0.5;
        stack.rotation.x = look.y * 0.08 + open * 0.22;
        stack.position.y = open * 0.6;

        const span = top * 2 + 0.6;
        traces.forEach((tr, n) => {
          if (reduce) {
            // Image fixe : quelques requêtes arrêtées à mi-chemin.
            tr.t = n < 3 ? 0.35 + n * 0.2 : -1;
          } else if (tr.wait > 0) {
            tr.wait -= dt;
            tr.t = -1;
          } else {
            tr.t += (dt * tr.speed * rush) / 2.2;
            if (tr.t > 1) {
              pick(tr);
              tr.wait = 0.4 + Math.random() * 1.2;
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
          tr.lineMat.opacity = visible ? 0.65 * (1 - Math.max(tr.t - 0.8, 0) * 5) : 0;

          // Un span s'ouvre sur chaque couche que la requête traverse.
          tr.rings.forEach((r, i) => {
            const ly = plates[i].g.position.y;
            if (visible && r.age === Infinity && y <= ly) r.age = reduce ? 0.3 : 0;
            r.m.visible = r.age !== Infinity;
            if (!r.m.visible) return;
            if (!reduce) r.age += dt;
            const life = Math.min(r.age / 1.1, 1);
            r.m.position.set(tr.x, ly + 0.002, tr.z);
            r.m.scale.setScalar(1 + life * 3.2);
            (r.m.material as Three.MeshBasicMaterial).opacity = 0.9 * (1 - life);
          });
        });

        renderer.render(scene, camera);

        // Étiquettes HTML posées sur le coin avant gauche de chaque couche.
        const { width, height } = host.getBoundingClientRect();
        plates.forEach((p, i) => {
          const el = labels.current[i];
          if (!el) return;
          tmp.set(-half, 0, half).applyMatrix4(p.g.matrixWorld).project(camera);
          el.style.transform = `translate3d(${((tmp.x + 1) / 2) * width}px, ${((1 - tmp.y) / 2) * height}px, 0) translate(-100%, -50%)`;
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
        scheme.removeEventListener("change", onScheme);
        document.removeEventListener("visibilitychange", run);
        window.removeEventListener("pointermove", onPointer);
        scrollTween?.scrollTrigger?.kill();
        scrollTween?.kill();
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
    <div
      ref={box}
      aria-hidden
      className="stack-scene relative h-full w-full"
    >
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
