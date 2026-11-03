"use client";
import { useEffect, useRef } from "react";
import type * as Three from "three";

import type { Layer } from "@/data/traces";
import { DUR, EASE, loadGsap } from "@/lib/motion";

interface Props {
  /** Couches de haut en bas, dans l'ordre d'une requête. */
  layers: { layer: Layer; label: string }[];
}

const SIZE = 3;
/** Écart entre deux couches dans l'ouverture : serré, puis déplié. */
const GAP_CLOSED = 0.42;
const GAP_OPEN = 1;
const TRACES = 9;
/** Les requêtes partent des points de la grille, jamais de n'importe où. */
const GRID = 5;
/** Recul fixe de la caméra : la taille de la pile se règle par son échelle. */
const DIST = 14;
/** Place réservée à gauche de la pile pour les étiquettes, en px. */
const LABEL_ROOM = 72;

/**
 * Ancres posées par les sections (`data-scene="…"`), dans l'ordre de la page.
 * `hero-full` n'est pas une étape : c'est la cible de l'ouverture dépliée.
 */
const STOPS = ["hero", "skills", "contact"] as const;
type Stop = (typeof STOPS)[number];

interface Pose {
  gap: number;
  rotY: number;
  rotX: number;
}
interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const mixBox = (a: Box, b: Box, t: number): Box => ({
  left: lerp(a.left, b.left, t),
  top: lerp(a.top, b.top, t),
  width: lerp(a.width, b.width, t),
  height: lerp(a.height, b.height, t),
});
const mixPose = (a: Pose, b: Pose, t: number): Pose => ({
  gap: lerp(a.gap, b.gap, t),
  rotY: lerp(a.rotY, b.rotY, t),
  rotX: lerp(a.rotX, b.rotX, t),
});

function cssVar(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/**
 * La pile du site en volume, une seule pour toute la page : chaque couche
 * technique est une plaque de sa teinte, et des requêtes safran la
 * traversent de la page aux données en marquant chaque couche d'un span.
 *
 * La toile est fixe et transparente ; la pile se loge dans l'ancre de la
 * section en cours et vole d'une ancre à l'autre :
 * - ouverture : rangée à côté du texte, puis (grand écran) épinglée le temps
 *   de glisser au centre, se déplier et pivoter ;
 * - compétences : à droite des rangées, la couche lue se soulève ;
 * - contact : repliée en une seule plaque qui tourne.
 * Hors de ces sections, elle suit son ancre hors de l'écran. Décor pur : la
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
      const [THREE, { gsap, ScrollTrigger }] = await Promise.all([import("three"), loadGsap()]);
      if (disposed) return;

      let renderer: Three.WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      } catch {
        return; // Pas de WebGL : rien ne manque au contenu.
      }
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

      // Toile plein écran : densité plafonnée, c'est elle qui coûte.
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.domElement.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";
      host.prepend(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
      camera.position.set(7.2, 5.6, 7.2).setLength(DIST);
      camera.lookAt(0, 0, 0);
      camera.updateMatrixWorld();
      const right = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0);
      const up = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 1);
      const visH = 2 * DIST * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));

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
        // `drop`/`alpha` : l'entrée ; `dim`/`lift` : la mise en avant d'une couche.
        return { g, fill, edge, dot, drop: 0, alpha: 1, dim: 1, lift: 0 };
      });
      let fillBase = 0.07;

      // --- Requêtes ------------------------------------------------------
      const ringGeo = new THREE.RingGeometry(0.05, 0.065, 40).rotateX(-Math.PI / 2);
      const headGeo = new THREE.SphereGeometry(0.05, 16, 12);
      const traces = Array.from({ length: TRACES }, (_, n) => {
        const headMat = new THREE.MeshBasicMaterial({ transparent: true });
        const head = new THREE.Mesh(headGeo, headMat);
        const lineGeo = new THREE.BufferGeometry();
        lineGeo.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(6), 3));
        const lineMat = new THREE.LineBasicMaterial({ transparent: true });
        const line = new THREE.Line(lineGeo, lineMat);
        const rings = layers.map(() => {
          const mat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
          const m = new THREE.Mesh(ringGeo, mat);
          stack.add(m);
          return { m, mat, age: Infinity };
        });
        stack.add(head, line);
        // Les premières requêtes partent une fois les plaques posées.
        return { head, headMat, line, lineGeo, lineMat, rings, x: 0, z: 0, t: 0, speed: 1, wait: 1.6 + n * 0.35 };
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
          tr.headMat.color.copy(signal);
          tr.lineMat.color.copy(signal);
          tr.rings.forEach((r) => r.mat.color.copy(signal));
        });
      };
      paint();
      const themeObserver = new MutationObserver(paint);
      themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
      const scheme = window.matchMedia("(prefers-color-scheme: dark)");
      scheme.addEventListener("change", paint);

      // --- Ancres et poses -----------------------------------------------
      const anchor = (name: string) => document.querySelector<HTMLElement>(`[data-scene="${name}"]`);
      const present = (el: HTMLElement | null) => !!el && el.getBoundingClientRect().width > 0;
      // `heroOpen` déplie l'ouverture, `heroMix` l'amène au centre.
      const s = { heroOpen: 0, heroMix: 0, blend: 1 };

      const boxOf = (name: Stop): Box | null => {
        const el = anchor(name);
        if (!present(el)) return null;
        const r = el!.getBoundingClientRect();
        if (name !== "hero" || s.heroMix === 0) return r;
        const full = anchor("hero-full");
        return present(full) ? mixBox(r, full!.getBoundingClientRect(), s.heroMix) : r;
      };
      const poseOf = (name: Stop, now: number): Pose => {
        if (name === "skills") return { gap: 0.72, rotY: -0.35, rotX: 0.05 };
        if (name === "contact")
          // Une plaque carrée est la même tous les quarts de tour : la
          // rotation boucle sans saut visible.
          return { gap: 0.09, rotY: reduce ? 0.3 : (now * 0.35) % (Math.PI / 2), rotX: 0 };
        return {
          gap: lerp(GAP_CLOSED, GAP_OPEN, s.heroOpen),
          rotY: -s.heroOpen * 1.1,
          rotX: s.heroOpen * 0.28,
        };
      };

      // Un vol part de l'endroit exact où la pile se trouve, même en plein vol.
      let current: Stop = "hero";
      let from: { box: Box; pose: Pose } | null = null;
      let shown = { box: { left: 0, top: 0, width: 0, height: 0 } as Box, pose: poseOf("hero", 0) };
      let flight: ReturnType<typeof gsap.to> | null = null;
      const go = (next: Stop) => {
        if (next === current) return;
        from = { box: { ...shown.box }, pose: { ...shown.pose } };
        current = next;
        flight?.kill();
        if (reduce) {
          s.blend = 1;
          return;
        }
        s.blend = 0;
        flight = gsap.to(s, { blend: 1, duration: DUR.travel, ease: EASE.travel });
      };

      // La section en cours est la dernière dont le début est passé. Un
      // déclencheur peut se signaler dès sa création : la liste est remplie
      // après coup, et `pickStop` l'ignore tant qu'elle est vide.
      const stops: { name: Stop; st: ScrollTrigger | null }[] = [];
      function pickStop() {
        let next: Stop = "hero";
        for (const { name, st } of stops)
          if (st && st.scroll() >= st.start && present(anchor(name))) next = name;
        go(next);
      }
      for (const name of STOPS) {
        const el = anchor(name);
        const section = el?.closest("section") ?? el;
        stops.push({
          name,
          st: section ? ScrollTrigger.create({ trigger: section, start: "top 60%", onToggle: pickStop }) : null,
        });
      }

      // --- Ouverture : entrée, puis chorégraphie au défilement -----------
      const intro = reduce
        ? null
        : gsap.fromTo(
            plates,
            { drop: (i: number) => 2.4 + i * 0.35, alpha: 0 },
            { drop: 0, alpha: 1, duration: 1.6, ease: "expo.out", stagger: 0.11, delay: 0.25 },
          );

      const hero = anchor("hero")?.closest("section");
      const mm = gsap.matchMedia();
      if (hero && !reduce) {
        // Grand écran : l'ouverture est épinglée le temps de la chorégraphie.
        mm.add("(min-width: 64rem)", () => {
          const header = document.querySelector("header");
          gsap
            .timeline({
              scrollTrigger: {
                trigger: hero,
                start: () => `top ${header?.offsetHeight ?? 0}px`,
                end: "+=150%",
                pin: true,
                scrub: 1,
                invalidateOnRefresh: true,
              },
            })
            .to(s, { heroOpen: 1, duration: 1, ease: "power1.inOut" }, 0)
            .to(s, { heroMix: 1, duration: 0.6, ease: "power2.inOut" }, 0)
            .to(hero.querySelector("[data-hero-name]"), { yPercent: -45, opacity: 0, duration: 0.45, ease: "power1.in" }, 0)
            .to(hero.querySelector("[data-hero-text]"), { y: -60, opacity: 0, duration: 0.4, ease: "power1.in" }, 0.05)
            .to({}, { duration: 0.2 });
        });
        // Petit écran : pas d'épinglage, la pile se déplie en défilant.
        mm.add("(max-width: 63.999rem)", () => {
          gsap
            .timeline({ scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 0.8 } })
            .to(s, { heroOpen: 1, ease: "none" }, 0)
            .to(hero.querySelector("[data-hero-name]"), { yPercent: -25, opacity: 0.2, ease: "none" }, 0);
        });
      }

      // --- Compétences : la couche lue se soulève ------------------------
      let focus = -1;
      const rows = gsap.utils.toArray<HTMLElement>("[data-layer-row]");
      rows[0]?.parentElement?.setAttribute("data-scrolly", "");
      const rowTriggers = rows.map((row, i) =>
        ScrollTrigger.create({
          trigger: row,
          start: "top 55%",
          end: "bottom 55%",
          onToggle: (self) => {
            // Passée vers le bas, la dernière rangée reste lue.
            const keep = !self.isActive && i === rows.length - 1 && self.direction === 1;
            if (self.isActive) focus = i;
            else if (focus === i && !keep) focus = -1;
            row.toggleAttribute("data-active", self.isActive || keep);
          },
        }),
      );

      // Les épinglages changent la hauteur de la page : on recale tout.
      ScrollTrigger.refresh();
      pickStop();

      // --- Souris : parallaxe, au pointeur fin seulement -----------------
      const aim = { x: 0, y: 0 };
      const look = { x: 0, y: 0 };
      const onPointer = (e: PointerEvent) => {
        aim.x = (e.clientX / window.innerWidth - 0.5) * 2;
        aim.y = (e.clientY / window.innerHeight - 0.5) * 2;
      };
      if (finePointer && !reduce) window.addEventListener("pointermove", onPointer, { passive: true });

      // --- Taille --------------------------------------------------------
      let vw = 1;
      let vh = 1;
      const resize = () => {
        vw = window.innerWidth;
        vh = window.innerHeight;
        renderer.setSize(vw, vh, false);
        camera.aspect = vw / vh;
        camera.updateProjectionMatrix();
      };
      window.addEventListener("resize", resize);
      resize();

      // --- Image ---------------------------------------------------------
      const tmp = new THREE.Vector3();
      let blank = false;
      const draw = (dt: number) => {
        const now = performance.now() / 1000;
        const target = boxOf(current);
        const pose = poseOf(current, now);
        // Ancre absente (petit écran sans pile dans la section) : on
        // s'efface sur place.
        let alpha = target ? 1 : 0;
        let b = target ?? shown.box;
        let p = pose;
        if (from && s.blend < 1) {
          b = mixBox(from.box, b, s.blend);
          p = mixPose(from.pose, pose, s.blend);
          alpha = lerp(1, alpha, s.blend) * (1 - Math.sin(Math.PI * s.blend) * 0.35);
        }
        shown = { box: b, pose: p };

        const offscreen = b.top + b.height < -80 || b.top > vh + 80 || b.width < 2;
        if (alpha < 0.01 || offscreen) {
          if (!blank) {
            renderer.clear();
            labels.current.forEach((el) => el && (el.style.opacity = "0"));
            blank = true;
          }
          return;
        }
        blank = false;

        // Place et échelle : la pile tient dans la boîte de l'ancre,
        // étiquettes comprises.
        const left = b.left + LABEL_ROOM;
        const width = Math.max(b.width - LABEL_ROOM, 10);
        const upp = visH / vh;
        const top = ((layers.length - 1) * p.gap) / 2;
        const scale = Math.min((width * upp) / 4.6, (b.height * upp) / (2.5 + top * 2 * 0.85));
        stack.scale.setScalar(Math.max(scale, 0.01));
        stack.position
          .copy(right)
          .multiplyScalar((left + width / 2 - vw / 2) * upp)
          .addScaledVector(up, -(b.top + b.height / 2 - vh / 2) * upp);

        // Repliée (contact), la pile n'est plus qu'une tranche de filets
        // colorés : remplissages allégés, ni requêtes ni étiquettes.
        const unfolded = THREE.MathUtils.smoothstep(p.gap, 0.1, 0.4);
        const k = reduce ? 1 : 1 - Math.exp(-dt * 6);
        plates.forEach((pl, i) => {
          pl.dim += ((focus < 0 || current !== "skills" ? 1 : i === focus ? 1 : 0.22) - pl.dim) * k;
          pl.lift += ((current === "skills" && i === focus ? 0.3 : 0) - pl.lift) * k;
          // Les plaques respirent, chacune à sa phase.
          const bob = reduce ? 0 : Math.sin(now * 1.1 + i * 0.7) * 0.045;
          pl.g.position.y = top - i * p.gap + bob + pl.drop + pl.lift;
          const a = pl.alpha * pl.dim * alpha;
          pl.fill.opacity = fillBase * a * (0.25 + 0.75 * unfolded);
          pl.edge.opacity = a;
          pl.dot.opacity = 0.55 * a;
        });

        const kLook = 1 - Math.exp(-dt * 3);
        look.x += (aim.x - look.x) * kLook;
        look.y += (aim.y - look.y) * kLook;
        const sway = reduce ? 0 : Math.sin(now / 3.2) * 0.3;
        stack.rotation.y = p.rotY + sway + look.x * 0.32;
        stack.rotation.x = p.rotX + look.y * 0.12;

        // Dans le mouvement, la vitesse de défilement presse les requêtes.
        const st = stops[0].st;
        const rush = st && !reduce ? 1 + Math.min(Math.abs(st.getVelocity()) / 1200, 3) : 1;
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
          tr.headMat.opacity = alpha * unfolded;
          const pos = tr.lineGeo.attributes.position as Three.BufferAttribute;
          pos.setXYZ(0, tr.x, top + 0.3, tr.z);
          pos.setXYZ(1, tr.x, y, tr.z);
          pos.needsUpdate = true;
          tr.lineMat.opacity = visible ? 0.7 * alpha * unfolded * (1 - Math.max(tr.t - 0.8, 0) * 5) : 0;

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
            r.mat.opacity = 0.95 * (1 - life) * alpha * unfolded * plates[i].dim;
          });
        });

        renderer.render(scene, camera);

        // Étiquettes posées sur le coin de chaque couche le plus à gauche à
        // l'écran : il change quand la pile pivote.
        plates.forEach((pl, i) => {
          const el = labels.current[i];
          if (!el) return;
          let lx = Infinity;
          let ly = 0;
          for (const c of corners) {
            tmp.copy(c).applyMatrix4(pl.g.matrixWorld).project(camera);
            if (tmp.x < lx) [lx, ly] = [tmp.x, tmp.y];
          }
          el.style.opacity = String(pl.alpha * alpha * unfolded * (0.35 + 0.65 * pl.dim));
          el.style.transform = `translate3d(${((lx + 1) / 2) * vw}px, ${((1 - ly) / 2) * vh}px, 0) translate(-100%, -50%)`;
        });
      };

      // --- Boucle, coupée onglet caché -----------------------------------
      let raf = 0;
      let last = performance.now();
      const loop = (t: number) => {
        draw(Math.min((t - last) / 1000, 0.05));
        last = t;
        raf = requestAnimationFrame(loop);
      };
      const run = () => {
        cancelAnimationFrame(raf);
        if (document.hidden) return;
        last = performance.now();
        raf = requestAnimationFrame(loop);
      };
      document.addEventListener("visibilitychange", run);
      run();
      host.dataset.ready = "";

      cleanup = () => {
        cancelAnimationFrame(raf);
        themeObserver.disconnect();
        scheme.removeEventListener("change", paint);
        window.removeEventListener("resize", resize);
        document.removeEventListener("visibilitychange", run);
        window.removeEventListener("pointermove", onPointer);
        intro?.kill();
        flight?.kill();
        mm.revert();
        stops.forEach(({ st }) => st?.kill());
        rowTriggers.forEach((t) => t.kill());
        rows[0]?.parentElement?.removeAttribute("data-scrolly");
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
    <div ref={box} aria-hidden className="stack-scene pointer-events-none fixed inset-0 z-30">
      {layers.map(({ layer, label }, i) => (
        <span
          key={layer}
          ref={(el) => {
            labels.current[i] = el;
          }}
          className="absolute top-0 left-0 pr-3 font-mono text-xs whitespace-nowrap text-ink-2"
        >
          {label}
        </span>
      ))}
    </div>
  );
}
