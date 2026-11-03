"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronDown, ExternalLink } from "lucide-react";
import type { Project } from "@/data/projects";
import type { Lang, Ui } from "@/i18n/ui";
import { DUR, EASE, loadGsap } from "@/lib/motion";

interface Props {
  projects: Project[];
  lang: Lang;
  t: Ui["work"];
}

export default function ProjectIndex({ projects, lang, t }: Props) {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState<string | null>(null);
  const list = useRef<HTMLUListElement>(null);
  const card = useRef<HTMLDivElement>(null);

  // Grand écran, pointeur fin : la capture du projet survolé suit le curseur
  // (GSAP quickTo). Elle est dessinée en WebGL : l'image se courbe et ses
  // couleurs se séparent selon la vitesse du geste, et passe d'un projet à
  // l'autre en fondu. Un projet ouvert montre déjà la sienne.
  useEffect(() => {
    const ul = list.current;
    const el = card.current;
    const query =
      "(hover: hover) and (pointer: fine) and (min-width: 64rem) and (prefers-reduced-motion: no-preference)";
    if (!ul || !el || !window.matchMedia(query).matches) return;
    let dead = false;
    let off = () => {};
    Promise.all([import("three"), loadGsap()]).then(([THREE, { gsap }]) => {
      if (dead) return;
      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try {
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      } catch {
        return;
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(el.offsetWidth, el.offsetHeight, false);
      renderer.domElement.style.cssText =
        "display:block;width:100%;height:100%";
      el.appendChild(renderer.domElement);

      // Valeurs brutes : le shader écrit les couleurs telles quelles.
      const raw = (name: string) =>
        new THREE.Color().setStyle(
          getComputedStyle(document.documentElement)
            .getPropertyValue(name)
            .trim(),
          THREE.LinearSRGBColorSpace,
        );
      const empty = new THREE.Texture();
      const uniforms = {
        uA: { value: empty },
        uB: { value: empty },
        uAspA: { value: 1.6 },
        uAspB: { value: 1.6 },
        uFitA: { value: 0 },
        uFitB: { value: 0 },
        uMix: { value: 0 },
        uVel: { value: new THREE.Vector2() },
        uBg: { value: raw("--raised") },
      };
      const material = new THREE.ShaderMaterial({
        uniforms,
        transparent: true,
        vertexShader: /* glsl */ `
          uniform vec2 uVel;
          varying vec2 vUv;
          void main() {
            vUv = uv;
            vec3 p = position * 0.9;
            // L'image se courbe dans le sens du geste, davantage au milieu.
            p.x += uVel.x * 0.12 * sin(uv.y * 3.1416);
            p.y -= uVel.y * 0.12 * sin(uv.x * 3.1416);
            gl_Position = vec4(p, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          uniform sampler2D uA, uB;
          uniform float uAspA, uAspB, uFitA, uFitB, uMix;
          uniform vec2 uVel;
          uniform vec3 uBg;
          varying vec2 vUv;
          const float BOX = 1.6;
          // Couvrir en gardant le haut (captures d'écran), ou contenir
          // (captures d'app en portrait).
          vec2 fit(vec2 uv, float asp, float contain) {
            if (contain > 0.5) {
              if (asp > BOX) uv.y = (uv.y - 0.5) * asp / BOX + 0.5;
              else uv.x = (uv.x - 0.5) * BOX / asp + 0.5;
            } else {
              if (asp > BOX) uv.x = (uv.x - 0.5) * BOX / asp + 0.5;
              else uv.y = 1.0 - (1.0 - uv.y) * asp / BOX;
            }
            return uv;
          }
          vec4 shot(sampler2D t, float asp, float contain) {
            vec2 b = fit(vUv, asp, contain);
            if (b.x < 0.0 || b.x > 1.0 || b.y < 0.0 || b.y > 1.0) return vec4(uBg, 1.0);
            // Les couleurs se séparent avec la vitesse.
            vec2 s = vec2(length(uVel) * 0.012, 0.0);
            return vec4(
              texture2D(t, fit(vUv + s, asp, contain)).r,
              texture2D(t, b).g,
              texture2D(t, fit(vUv - s, asp, contain)).b,
              1.0
            );
          }
          void main() {
            gl_FragColor = mix(shot(uA, uAspA, uFitA), shot(uB, uAspB, uFitB), uMix);
          }
        `,
      });
      const geometry = new THREE.PlaneGeometry(2, 2, 24, 24);
      const scene = new THREE.Scene();
      const mesh = new THREE.Mesh(geometry, material);
      mesh.frustumCulled = false;
      scene.add(mesh);
      const camera = new THREE.Camera();

      // Captures chargées à la demande, une fois chacune.
      const loader = new THREE.TextureLoader();
      type Shot = { tex: InstanceType<typeof THREE.Texture>; asp: number };
      const cache = new Map<string, Promise<Shot>>();
      const load = (src: string) => {
        if (!cache.has(src))
          cache.set(
            src,
            loader.loadAsync(src).then((tex) => {
              tex.minFilter = THREE.LinearFilter;
              const img = tex.image as HTMLImageElement;
              return { tex, asp: img.width / img.height };
            }),
          );
        return cache.get(src)!;
      };
      let current = "";
      const show = (src: string, contain: boolean) => {
        if (src === current) return;
        current = src;
        load(src).then(({ tex, asp }) => {
          if (current !== src) return;
          if (uniforms.uA.value === empty) {
            uniforms.uA.value = tex;
            uniforms.uAspA.value = asp;
            uniforms.uFitA.value = contain ? 1 : 0;
            return;
          }
          uniforms.uB.value = tex;
          uniforms.uAspB.value = asp;
          uniforms.uFitB.value = contain ? 1 : 0;
          gsap.fromTo(
            uniforms.uMix,
            { value: 0 },
            {
              value: 1,
              duration: 0.35,
              ease: "power2.out",
              overwrite: true,
              onComplete: () => {
                uniforms.uA.value = uniforms.uB.value;
                uniforms.uAspA.value = uniforms.uAspB.value;
                uniforms.uFitA.value = uniforms.uFitB.value;
                uniforms.uMix.value = 0;
              },
            },
          );
        });
      };

      gsap.set(el, { yPercent: -50, autoAlpha: 0, scale: 0.92 });
      const xTo = gsap.quickTo(el, "x", {
        duration: DUR.follow,
        ease: "power3.out",
      });
      const yTo = gsap.quickTo(el, "y", {
        duration: DUR.follow,
        ease: "power3.out",
      });
      const vel = { x: 0, y: 0 };
      let last = { x: 0, y: 0 };
      let visible = false;
      // À droite de l'écran, la capture passe à gauche du curseur.
      const at = (e: PointerEvent) =>
        e.clientX > window.innerWidth - el.offsetWidth - 64
          ? e.clientX - 32 - el.offsetWidth
          : e.clientX + 32;
      const hide = () => {
        visible = false;
        gsap.to(el, {
          autoAlpha: 0,
          scale: 0.92,
          duration: 0.2,
          ease: "power2.out",
          overwrite: "auto",
        });
      };
      const enter = (e: PointerEvent) => {
        gsap.set(el, { x: at(e), y: e.clientY });
        last = { x: e.clientX, y: e.clientY };
      };
      const move = (e: PointerEvent) => {
        xTo(at(e));
        yTo(e.clientY);
        vel.x = gsap.utils.clamp(-1, 1, (e.clientX - last.x) * 0.05);
        vel.y = gsap.utils.clamp(-1, 1, (e.clientY - last.y) * 0.05);
        last = { x: e.clientX, y: e.clientY };
      };
      const over = (e: PointerEvent) => {
        const li = (e.target as Element).closest<HTMLElement>("[data-preview]");
        if (!li || li.querySelector('[aria-expanded="true"]')) return hide();
        show(li.dataset.preview!, !!li.dataset.portrait);
        visible = true;
        gsap.to(el, {
          autoAlpha: 1,
          scale: 1,
          duration: 0.3,
          ease: EASE.out,
          overwrite: "auto",
        });
      };
      // Rendu sur le ticker de GSAP, seulement quand la capture est visible.
      const tick = () => {
        const u = uniforms.uVel.value;
        u.x += (vel.x - u.x) * 0.2;
        u.y += (vel.y - u.y) * 0.2;
        vel.x *= 0.85;
        vel.y *= 0.85;
        if (visible || Number(gsap.getProperty(el, "autoAlpha")) > 0)
          renderer.render(scene, camera);
      };
      gsap.ticker.add(tick);
      ul.addEventListener("pointerenter", enter);
      ul.addEventListener("pointermove", move);
      ul.addEventListener("pointerover", over);
      ul.addEventListener("pointerleave", hide);
      ul.addEventListener("pointerdown", hide);
      off = () => {
        gsap.ticker.remove(tick);
        ul.removeEventListener("pointerenter", enter);
        ul.removeEventListener("pointermove", move);
        ul.removeEventListener("pointerover", over);
        ul.removeEventListener("pointerleave", hide);
        ul.removeEventListener("pointerdown", hide);
        gsap.killTweensOf([el, uniforms.uMix]);
        cache.forEach((p) => p.then(({ tex }) => tex.dispose()));
        geometry.dispose();
        material.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    });
    return () => {
      dead = true;
      off();
    };
  }, []);

  return (
    <div>
      <div className="hidden grid-cols-[1fr_7rem_14rem_2rem] border-b border-ink pb-2 text-xs text-ink-2 md:grid">
        <span>{t.columns.name}</span>
        <span>{t.columns.kind}</span>
        <span>{t.columns.stack}</span>
        <span />
      </div>
      <div
        ref={card}
        aria-hidden
        style={{ visibility: "hidden" }}
        className="pointer-events-none fixed top-0 left-0 z-30 hidden aspect-[16/10] w-72 overflow-hidden rounded-2xl border-2 border-ink lg:block"
      />
      <ul ref={list} data-reveal-group>
        {projects.map((p) => {
          const isOpen = open === p.name;
          const id = `project-${p.name.replace(/\W+/g, "-").toLowerCase()}`;
          return (
            <li
              key={p.name}
              data-preview={p.image}
              data-portrait={p.portrait || undefined}
              className="border-b border-rule"
            >
              <button
                onClick={() => setOpen(isOpen ? null : p.name)}
                aria-expanded={isOpen}
                aria-controls={id}
                className="grid w-full grid-cols-[1fr_2rem] items-baseline gap-x-4 py-4 text-left md:grid-cols-[1fr_7rem_14rem_2rem] md:gap-x-0"
              >
                <span className="font-display text-lg font-semibold [font-stretch:118%]">
                  {p.name}
                </span>
                <span className="hidden text-sm md:block">
                  {t.kinds[p.kind]}
                </span>
                <span className="hidden truncate pr-4 text-sm text-ink-2 md:block">
                  {p.stack.join(", ")}
                </span>
                <ChevronDown
                  className={`size-4 justify-self-end transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                  aria-hidden
                />
                <span className="col-span-1 text-sm text-ink-2 md:hidden">
                  {[t.kinds[p.kind], ...p.stack].join(", ")}
                </span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    id={id}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{
                      duration: reduce ? 0 : 0.32,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="overflow-hidden"
                  >
                    <div className="grid gap-6 pt-1 pb-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
                      <div>
                        <p className="max-w-[52ch]">{p.summary[lang]}</p>
                        {p.href ? (
                          <a
                            data-magnetic
                            href={p.href}
                            target="_blank"
                            rel="noopener"
                            className="btn btn-sm mt-5"
                          >
                            {t.open}
                            <ExternalLink className="size-3.5" aria-hidden />
                          </a>
                        ) : (
                          <p className="mt-5 text-sm text-ink-2">{t.noLink}</p>
                        )}
                      </div>
                      <div
                        className={`overflow-hidden rounded-[1.25rem] border-2 border-ink bg-raised ${
                          p.portrait ? "flex h-80 justify-center" : ""
                        }`}
                      >
                        <img
                          src={p.image}
                          alt={p.name}
                          loading="lazy"
                          className={
                            p.portrait
                              ? "h-full w-auto object-contain"
                              : "block aspect-[16/10] w-full object-cover object-top"
                          }
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
