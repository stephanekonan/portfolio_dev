"use client";
import { useEffect, useRef } from "react";

import { loadGsap } from "@/lib/motion";

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const fragment = /* glsl */ `
  uniform float uAspect;
  uniform vec2 uMouse;
  uniform float uHover;
  uniform float uLight;
  uniform vec3 uPaper;
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

  void main() {
    vec2 p = vec2(vUv.x * uAspect, vUv.y);
    vec3 col = uPaper;
    // Une lumière neutre sous le curseur, comme une lampe sur le papier.
    float lamp = smoothstep(0.45, 0.0, distance(p, vec2(uMouse.x * uAspect, uMouse.y))) * uHover;
    col += lamp * uLight;
    // Grain fixe : la matière du papier, sans scintillement.
    col += (hash(floor(gl_FragCoord.xy)) - 0.5) * 0.035;
    gl_FragColor = vec4(col, 1.0);
  }
`;

function cssVar(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/**
 * Le fond de toutes les pages, en WebGL : le papier crème et son grain, et
 * une lumière neutre, très douce, qui suit le curseur. Aucune couleur :
 * l'orange reste à l'action. Rendu à demi-résolution, seulement quand le
 * curseur bouge. Mouvement réduit : le papier seul.
 */
export default function Ambient() {
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
        renderer = new THREE.WebGLRenderer({ antialias: false });
      } catch {
        return; // Pas de WebGL : le papier reste uni.
      }
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
      renderer.setPixelRatio(0.5);
      renderer.domElement.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";
      host.appendChild(renderer.domElement);

      // Valeurs brutes : le shader écrit les couleurs telles quelles.
      const raw = (name: string) => new THREE.Color().setStyle(cssVar(name), THREE.LinearSRGBColorSpace);
      const uniforms = {
        uAspect: { value: 1 },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        uHover: { value: 0 },
        uLight: { value: 0.04 },
        uPaper: { value: raw("--paper") },
      };
      const material = new THREE.ShaderMaterial({ vertexShader: vertex, fragmentShader: fragment, uniforms });
      const geometry = new THREE.PlaneGeometry(2, 2);
      const mesh = new THREE.Mesh(geometry, material);
      mesh.frustumCulled = false;
      const scene = new THREE.Scene();
      scene.add(mesh);
      const camera = new THREE.Camera();
      let dirty = true;

      const resize = () => {
        renderer.setSize(window.innerWidth, window.innerHeight, false);
        uniforms.uAspect.value = window.innerWidth / window.innerHeight;
        dirty = true;
      };
      resize();
      window.addEventListener("resize", resize);

      const paint = () => {
        uniforms.uPaper.value = raw("--paper");
        // En sombre, la lampe éclaire un peu plus pour rester visible.
        uniforms.uLight.value = getComputedStyle(document.documentElement).colorScheme === "dark" ? 0.05 : 0.035;
        dirty = true;
      };
      paint();
      const themeObserver = new MutationObserver(paint);
      themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
      const scheme = window.matchMedia("(prefers-color-scheme: dark)");
      scheme.addEventListener("change", paint);

      // La lampe suit le curseur, lissée par GSAP.
      const toX = gsap.quickTo(uniforms.uMouse.value, "x", { duration: 0.9, ease: "power3.out" });
      const toY = gsap.quickTo(uniforms.uMouse.value, "y", { duration: 0.9, ease: "power3.out" });
      const onMove = (e: PointerEvent) => {
        if (e.pointerType !== "mouse") return;
        toX(e.clientX / window.innerWidth);
        toY(1 - e.clientY / window.innerHeight);
        gsap.to(uniforms.uHover, { value: 1, duration: 0.6, overwrite: true });
      };
      const onLeave = () => gsap.to(uniforms.uHover, { value: 0, duration: 0.8, overwrite: true });
      if (finePointer && !reduce) {
        window.addEventListener("pointermove", onMove, { passive: true });
        document.documentElement.addEventListener("pointerleave", onLeave);
      }

      // Rendu seulement quand quelque chose change.
      let last = "";
      const tick = () => {
        const state = `${uniforms.uMouse.value.x.toFixed(4)},${uniforms.uMouse.value.y.toFixed(4)},${uniforms.uHover.value.toFixed(3)}`;
        if (!dirty && state === last) return;
        last = state;
        dirty = false;
        renderer.render(scene, camera);
      };
      gsap.ticker.add(tick);
      host.dataset.ready = "";

      cleanup = () => {
        gsap.ticker.remove(tick);
        window.removeEventListener("resize", resize);
        window.removeEventListener("pointermove", onMove);
        document.documentElement.removeEventListener("pointerleave", onLeave);
        themeObserver.disconnect();
        scheme.removeEventListener("change", paint);
        gsap.killTweensOf([uniforms.uMouse.value, uniforms.uHover]);
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

  return <div ref={box} aria-hidden className="ambient pointer-events-none fixed inset-0 -z-10" />;
}
