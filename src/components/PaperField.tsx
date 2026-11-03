"use client";
import { useEffect, useRef } from "react";

import { loadGsap } from "@/lib/motion";

/** Pas de la trame, en px CSS. */
const STEP = 28;
/** Rayon d'influence du curseur, en px. */
const REACH = 170;

const vertex = /* glsl */ `
  attribute vec2 aBase;
  uniform vec2 uRes;
  uniform float uScroll;
  uniform float uWrap;
  uniform vec2 uMouse;
  uniform float uHover;
  uniform float uWave;
  uniform float uTime;
  uniform float uDpr;
  varying float vNear;

  void main() {
    vec2 p = aBase;
    // La trame est imprimée sur la page : elle défile avec le contenu.
    p.y = mod(aBase.y - uScroll, uWrap) - ${STEP.toFixed(1)};
    // Un défilement rapide fait onduler le papier.
    p.x += sin(p.y * 0.011 + uTime * 1.7) * uWave * 7.0;
    p.y += sin(p.x * 0.009 + uTime * 1.2) * uWave * 5.0;
    // Le curseur écarte les points autour de lui.
    vec2 d = p - uMouse;
    float near = smoothstep(${REACH.toFixed(1)}, 0.0, length(d)) * uHover;
    p += normalize(d + 0.0001) * near * 22.0;
    vNear = near;
    gl_Position = vec4(p.x / uRes.x * 2.0 - 1.0, 1.0 - p.y / uRes.y * 2.0, 0.0, 1.0);
    gl_PointSize = (1.7 + near * 1.8) * uDpr;
  }
`;

const fragment = /* glsl */ `
  uniform vec3 uInk;
  uniform vec3 uSignal;
  uniform float uAlpha;
  varying float vNear;

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    if (dot(c, c) > 0.25) discard;
    gl_FragColor = vec4(mix(uInk, uSignal, vNear), uAlpha * (1.0 + vNear * 2.5));
  }
`;

function cssVar(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/**
 * La trame du papier minéral, en WebGL, derrière toutes les pages : une
 * grille de points imprimée sur la page, qui défile avec elle, ondule quand
 * on défile vite et s'écarte autour du curseur en prenant la teinte safran
 * (ce qui est vivant). Rien n'est redessiné tant que rien ne bouge.
 * Mouvement réduit : la trame défile, sans onde ni réaction au curseur.
 */
export default function PaperField() {
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = box.current;
    if (!host) return;
    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const [THREE, { gsap }] = await Promise.all([import("three"), loadGsap()]);
      if (disposed) return;

      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try {
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
      } catch {
        return; // Pas de WebGL : le papier reste uni.
      }
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
      const dpr = Math.min(window.devicePixelRatio, 2);
      renderer.setPixelRatio(dpr);
      renderer.domElement.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";
      host.appendChild(renderer.domElement);

      const uniforms = {
        uRes: { value: new THREE.Vector2(1, 1) },
        uScroll: { value: 0 },
        uWrap: { value: 1 },
        uMouse: { value: new THREE.Vector2(-9999, -9999) },
        uHover: { value: 0 },
        uWave: { value: 0 },
        uTime: { value: 0 },
        uDpr: { value: dpr },
        uInk: { value: new THREE.Color() },
        uSignal: { value: new THREE.Color() },
        uAlpha: { value: 0.2 },
      };
      const material = new THREE.ShaderMaterial({
        vertexShader: vertex,
        fragmentShader: fragment,
        uniforms,
        transparent: true,
        depthTest: false,
      });
      const geometry = new THREE.BufferGeometry();
      const points = new THREE.Points(geometry, material);
      points.frustumCulled = false;
      const scene = new THREE.Scene();
      scene.add(points);
      const camera = new THREE.Camera();

      let dirty = true;

      // --- Grille, refaite à chaque taille d'écran ----------------------
      const resize = () => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        renderer.setSize(w, h, false);
        uniforms.uRes.value.set(w, h);
        const cols = Math.ceil(w / STEP) + 1;
        const rows = Math.ceil(h / STEP) + 2;
        uniforms.uWrap.value = rows * STEP;
        const base = new Float32Array(cols * rows * 2);
        for (let r = 0, k = 0; r < rows; r++)
          for (let c = 0; c < cols; c++, k += 2) {
            base[k] = c * STEP + (w % STEP) / 2;
            base[k + 1] = r * STEP;
          }
        geometry.setAttribute("aBase", new THREE.BufferAttribute(base, 2));
        // `position` n'est pas lu, mais three.js en tire le nombre de points.
        geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(cols * rows * 3), 3));
        dirty = true;
      };
      resize();
      window.addEventListener("resize", resize);

      // --- Teintes du thème ---------------------------------------------
      const paint = () => {
        const dark = getComputedStyle(document.documentElement).colorScheme === "dark";
        // Valeurs brutes : le shader écrit les couleurs telles quelles.
        uniforms.uInk.value.setStyle(cssVar("--ink-2"), THREE.LinearSRGBColorSpace);
        uniforms.uSignal.value.setStyle(cssVar("--signal"), THREE.LinearSRGBColorSpace);
        uniforms.uAlpha.value = dark ? 0.3 : 0.22;
        dirty = true;
      };
      paint();
      const themeObserver = new MutationObserver(paint);
      themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
      const scheme = window.matchMedia("(prefers-color-scheme: dark)");
      scheme.addEventListener("change", paint);

      // --- Curseur : suivi lissé par GSAP (quickTo) ----------------------
      const mouse = { x: -9999, y: -9999 };
      const toX = gsap.quickTo(mouse, "x", { duration: 0.5, ease: "power3.out" });
      const toY = gsap.quickTo(mouse, "y", { duration: 0.5, ease: "power3.out" });
      const onMove = (e: PointerEvent) => {
        if (e.pointerType !== "mouse") return;
        if (uniforms.uHover.value === 0) gsap.set(mouse, { x: e.clientX, y: e.clientY });
        toX(e.clientX);
        toY(e.clientY);
        gsap.to(uniforms.uHover, { value: 1, duration: 0.4, overwrite: true });
      };
      const onLeave = () => gsap.to(uniforms.uHover, { value: 0, duration: 0.6, overwrite: true });
      if (finePointer && !reduce) {
        window.addEventListener("pointermove", onMove, { passive: true });
        document.documentElement.addEventListener("pointerleave", onLeave);
      }

      // --- Défilement : la vitesse fait onduler le papier -----------------
      let lastY = window.scrollY;
      const onScroll = () => (dirty = true);
      window.addEventListener("scroll", onScroll, { passive: true });

      // --- Boucle sur le ticker de GSAP, à la demande ---------------------
      let lastMouse = "";
      const tick = (time: number, dt: number) => {
        const y = window.scrollY;
        if (!reduce) {
          const speed = Math.min(Math.abs(y - lastY) / Math.max(dt, 1) / 3, 1);
          uniforms.uWave.value += (speed - uniforms.uWave.value) * (speed > uniforms.uWave.value ? 0.3 : 0.06);
          if (uniforms.uWave.value < 0.002) uniforms.uWave.value = 0;
        }
        lastY = y;
        const m = `${mouse.x.toFixed(1)},${mouse.y.toFixed(1)},${uniforms.uHover.value.toFixed(3)}`;
        if (!dirty && uniforms.uWave.value === 0 && m === lastMouse) return;
        lastMouse = m;
        dirty = false;
        uniforms.uScroll.value = y;
        uniforms.uMouse.value.set(mouse.x, mouse.y);
        uniforms.uTime.value = time;
        renderer.render(scene, camera);
      };
      gsap.ticker.add(tick);
      host.dataset.ready = "";

      cleanup = () => {
        gsap.ticker.remove(tick);
        window.removeEventListener("resize", resize);
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("pointermove", onMove);
        document.documentElement.removeEventListener("pointerleave", onLeave);
        themeObserver.disconnect();
        scheme.removeEventListener("change", paint);
        gsap.killTweensOf([mouse, uniforms.uHover]);
        geometry.dispose();
        material.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return <div ref={box} aria-hidden className="paper-field pointer-events-none fixed inset-0 -z-10" />;
}
