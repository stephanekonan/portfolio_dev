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
  uniform float uTime;
  uniform float uScroll;
  uniform vec2 uMouse;
  uniform float uHover;
  uniform float uStrength;
  uniform vec3 uPaper;
  uniform vec3 uOrange;
  uniform vec3 uGreen;
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.02; a *= 0.5; }
    return v;
  }

  void main() {
    vec2 p = vec2(vUv.x * uAspect, vUv.y);
    float t = uTime * 0.05;
    // Les nappes glissent un peu quand on défile : le fond vit avec la page.
    float s = uScroll * 0.00022;
    vec2 orange = vec2(uAspect * 0.86 + 0.08 * sin(t * 3.0), 0.92 - mod(s, 1.6) * 0.5 + 0.06 * cos(t * 2.0));
    vec2 green = vec2(uAspect * 0.1 + 0.07 * cos(t * 2.5), 0.08 + mod(s, 1.6) * 0.35 + 0.05 * sin(t * 3.0));
    float warp = (fbm(p * 1.7 + vec2(t, -t)) - 0.5) * 0.4;
    float fo = smoothstep(0.8, 0.0, distance(p, orange) + warp);
    float fg = smoothstep(0.75, 0.0, distance(p, green) + warp);
    float fm = smoothstep(0.3, 0.0, distance(p, vec2(uMouse.x * uAspect, uMouse.y))) * uHover;
    vec3 col = uPaper;
    col = mix(col, uOrange, fo * uStrength);
    col = mix(col, uGreen, fg * uStrength * 0.75);
    col = mix(col, uOrange, fm * uStrength * 0.7);
    // Grain fixe : la matière d'un papier, sans scintillement.
    col += (hash(floor(gl_FragCoord.xy)) - 0.5) * 0.04;
    gl_FragColor = vec4(col, 1.0);
  }
`;

function cssVar(name: string) {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
}

/**
 * Le fond de toutes les pages, en WebGL : un crème chaud traversé de deux
 * nappes douces, orange et verte, qui dérivent lentement, glissent quand on
 * défile et s'éclairent sous le curseur. Rendu à demi-résolution (c'est un
 * flou) et à 30 images par seconde sur le ticker de GSAP. Mouvement réduit :
 * le fond est fixe.
 */
export default function Ambient() {
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = box.current;
    if (!host) return;
    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const [THREE, { gsap }] = await Promise.all([
        import("three"),
        loadGsap(),
      ]);
      if (disposed) return;

      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: false });
      } catch {
        return; // Pas de WebGL : le fond reste uni.
      }
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const finePointer = window.matchMedia(
        "(hover: hover) and (pointer: fine)",
      ).matches;
      renderer.setPixelRatio(0.5);
      renderer.domElement.style.cssText =
        "position:absolute;inset:0;width:100%;height:100%;display:block";
      host.appendChild(renderer.domElement);

      // Valeurs brutes : le shader écrit les couleurs telles quelles.
      const raw = (name: string) =>
        new THREE.Color().setStyle(cssVar(name), THREE.LinearSRGBColorSpace);
      const uniforms = {
        uAspect: { value: 1 },
        uTime: { value: 0 },
        uScroll: { value: 0 },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        uHover: { value: 0 },
        uStrength: { value: 0.2 },
        uPaper: { value: raw("--paper") },
        uOrange: { value: raw("--signal") },
        uGreen: { value: raw("--go") },
      };
      const material = new THREE.ShaderMaterial({
        vertexShader: vertex,
        fragmentShader: fragment,
        uniforms,
      });
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
        const dark =
          getComputedStyle(document.documentElement).colorScheme === "dark";
        uniforms.uPaper.value = raw("--paper");
        uniforms.uOrange.value = raw("--signal");
        uniforms.uGreen.value = raw("--go");
        uniforms.uStrength.value = dark ? 0.26 : 0.2;
        dirty = true;
      };
      paint();
      const themeObserver = new MutationObserver(paint);
      themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-theme"],
      });
      const scheme = window.matchMedia("(prefers-color-scheme: dark)");
      scheme.addEventListener("change", paint);

      // Le halo suit le curseur, lissé par GSAP.
      const toX = gsap.quickTo(uniforms.uMouse.value, "x", {
        duration: 0.9,
        ease: "power3.out",
      });
      const toY = gsap.quickTo(uniforms.uMouse.value, "y", {
        duration: 0.9,
        ease: "power3.out",
      });
      const onMove = (e: PointerEvent) => {
        if (e.pointerType !== "mouse") return;
        toX(e.clientX / window.innerWidth);
        toY(1 - e.clientY / window.innerHeight);
        gsap.to(uniforms.uHover, { value: 1, duration: 0.6, overwrite: true });
      };
      const onLeave = () =>
        gsap.to(uniforms.uHover, { value: 0, duration: 0.8, overwrite: true });
      if (finePointer && !reduce) {
        window.addEventListener("pointermove", onMove, { passive: true });
        document.documentElement.addEventListener("pointerleave", onLeave);
      }
      const onScroll = () => (dirty = true);
      window.addEventListener("scroll", onScroll, { passive: true });

      // 30 images par seconde suffisent à une dérive lente.
      let frame = 0;
      const tick = (time: number) => {
        frame++;
        if (reduce ? !dirty : frame % 2 && !dirty) return;
        dirty = false;
        uniforms.uTime.value = reduce ? 0 : time;
        uniforms.uScroll.value = window.scrollY;
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

  return (
    <div
      ref={box}
      aria-hidden
      className="ambient pointer-events-none fixed inset-0 -z-10"
    />
  );
}
