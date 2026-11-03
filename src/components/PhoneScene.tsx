"use client";
import { useEffect, useRef } from "react";

import { loadGsap } from "@/lib/motion";

/** Une application montrée sur l'écran du téléphone. */
export interface PhoneApp {
  id: string;
  name: string;
  caption: string;
  src: string;
  /** Zone utile de l'image `[x, y, largeur, hauteur]`, quand c'est une maquette. */
  crop?: readonly [number, number, number, number];
}

/** Taille de l'écran dessiné, en px de canvas (ratio de l'écran 3D). */
const SW = 420;
const SH = 920;

function cssVar(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/** Couleur d'un pixel de l'image, gardée en mémoire : le fond d'une capture. */
const sampled = new WeakMap<HTMLImageElement, string>();
function bottomColor(img: HTMLImageElement, x: number, y: number) {
  let color = sampled.get(img);
  if (!color) {
    const probe = document.createElement("canvas").getContext("2d")!;
    probe.drawImage(img, x, y, 1, 1, 0, 0, 1, 1);
    const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
    color = `rgb(${r} ${g} ${b})`;
    sampled.set(img, color);
  }
  return color;
}

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
  return t * t * (3 - 2 * t);
};

/**
 * Dessine l'écran : l'application `story` (0, 1, 2…), qui passe à la
 * suivante en fondu sur la fin de son étape. Chaque capture couvre l'écran
 * en gardant son haut, comme une application qu'on vient d'ouvrir.
 */
function drawScreen(c: CanvasRenderingContext2D, apps: PhoneApp[], imgs: HTMLImageElement[], story: number, paper: string) {
  c.clearRect(0, 0, SW, SH);
  c.save();
  c.beginPath();
  c.roundRect(0, 0, SW, SH, 46);
  c.clip();
  c.fillStyle = paper;
  c.fillRect(0, 0, SW, SH);

  const app = (k: number, alpha: number) => {
    const img = imgs[k];
    if (!img?.complete || !img.naturalWidth) return;
    const crop = apps[k].crop;
    const [sx, sy, sw, sh] = crop ?? [0, 0, img.naturalWidth, img.naturalHeight];
    // Une capture remplit l'écran ; une maquette recadrée garde toute sa
    // largeur, et le bas prend la couleur du fond de l'application.
    const scale = crop ? SW / sw : Math.max(SW / sw, SH / sh);
    const dw = sw * scale;
    const dh = sh * scale;
    c.globalAlpha = alpha;
    if (crop && dh < SH) {
      c.fillStyle = bottomColor(img, sx + 8, sy + sh - 4);
      c.fillRect(0, 0, SW, SH);
    }
    c.drawImage(img, sx, sy, sw, sh, (SW - dw) / 2, 0, dw, dh);
    c.globalAlpha = 1;
  };

  const last = apps.length - 1;
  const k = Math.min(Math.floor(story), last);
  const fade = k < last ? smooth(0.65, 1, story - k) : 0;
  app(k, 1);
  if (fade > 0) app(k + 1, fade);

  // Encoche, par-dessus la capture.
  c.fillStyle = "#0e0c0a";
  c.beginPath();
  c.roundRect(SW / 2 - 56, 14, 112, 32, 16);
  c.fill();
  c.restore();
}

/**
 * Le téléphone de l'ouverture, en Three.js. Son écran montre mes vraies
 * applications, une par étape du défilement, et une légende dit laquelle et
 * à quoi elle sert. Grand écran : l'ouverture reste en place le temps de
 * les faire défiler. Autour flottent un colis, une bille et un anneau. On
 * peut le faire tourner à la main (Draggable + Inertia). Mouvement réduit :
 * la première application, immobile.
 */
export default function PhoneScene({ apps, hint }: { apps: PhoneApp[]; hint: string }) {
  const box = useRef<HTMLDivElement>(null);
  const count = useRef<HTMLSpanElement>(null);
  const label = useRef<HTMLParagraphElement>(null);
  const name = useRef<HTMLSpanElement>(null);
  const caption = useRef<HTMLSpanElement>(null);
  const dots = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const host = box.current;
    if (!host) return;
    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const [THREE, { RoundedBoxGeometry }, { gsap, Draggable }] = await Promise.all([
        import("three"),
        import("three/examples/jsm/geometries/RoundedBoxGeometry.js"),
        loadGsap(),
      ]);
      if (disposed) return;

      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      } catch {
        return; // Pas de WebGL : la place reste vide, la section Réalisations montre tout.
      }
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.domElement.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";
      host.prepend(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
      camera.position.set(0, 0, 11);

      // --- Lumières : chaude de face, orange en contre-jour -------------
      scene.add(new THREE.AmbientLight(0xffffff, 1.4));
      const key = new THREE.DirectionalLight(0xffffff, 2.2);
      key.position.set(3, 5, 6);
      scene.add(key);
      const rim = new THREE.PointLight(0xff6a1a, 30, 20);
      rim.position.set(-4, 2, -3);
      scene.add(rim);

      // --- Le téléphone -------------------------------------------------
      const phone = new THREE.Group();
      phone.position.y = 0.35;
      scene.add(phone);
      const bodyGeo = new RoundedBoxGeometry(1.9, 4, 0.24, 6, 0.3);
      const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1d1915, roughness: 0.35, metalness: 0.4 });
      phone.add(new THREE.Mesh(bodyGeo, bodyMat));

      const canvas = document.createElement("canvas");
      canvas.width = SW;
      canvas.height = SH;
      const ctx = canvas.getContext("2d")!;
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 4;
      const screenGeo = new THREE.PlaneGeometry(1.76, 1.76 * (SH / SW));
      const screenMat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false });
      const screen = new THREE.Mesh(screenGeo, screenMat);
      screen.position.z = 0.125;
      phone.add(screen);

      // --- Ce qui flotte autour : un colis, une bille, un anneau ----------
      const parcelGeo = new RoundedBoxGeometry(0.7, 0.55, 0.55, 4, 0.06);
      const parcelMat = new THREE.MeshStandardMaterial({ color: 0xd9a066, roughness: 0.8 });
      const parcel = new THREE.Mesh(parcelGeo, parcelMat);
      const tapeGeo = new THREE.BoxGeometry(0.72, 0.1, 0.57);
      const tapeMat = new THREE.MeshStandardMaterial({ color: 0xf5efe6, roughness: 0.6 });
      parcel.add(new THREE.Mesh(tapeGeo, tapeMat));
      const ballGeo = new THREE.SphereGeometry(0.3, 32, 24);
      const ballMat = new THREE.MeshStandardMaterial({ roughness: 0.3 });
      const ball = new THREE.Mesh(ballGeo, ballMat);
      const ringGeo = new THREE.TorusGeometry(0.34, 0.12, 20, 48);
      const ringMat = new THREE.MeshStandardMaterial({ roughness: 0.4 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      const floaters = [
        { m: parcel, at: new THREE.Vector3(2.0, 1.9, -0.6), phase: 0 },
        { m: ball, at: new THREE.Vector3(-2.1, 1.4, 0.4), phase: 2 },
        { m: ring, at: new THREE.Vector3(1.9, -1.2, 0.5), phase: 4 },
      ];
      floaters.forEach((f) => scene.add(f.m));

      // --- Les captures -------------------------------------------------
      let dirty = true;
      const imgs = apps.map((a) => {
        const img = new Image();
        img.decoding = "async";
        img.onload = () => (dirty = true);
        img.src = a.src;
        return img;
      });

      // --- Teintes du thème ---------------------------------------------
      let paper = "#f5efe6";
      const paint = () => {
        paper = cssVar("--paper");
        ballMat.color.set(cssVar("--signal"));
        ringMat.color.set(cssVar("--ink"));
        dirty = true;
      };
      paint();
      const themeObserver = new MutationObserver(paint);
      themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
      const scheme = window.matchMedia("(prefers-color-scheme: dark)");
      scheme.addEventListener("change", paint);

      // --- Les applications, au défilement -------------------------------
      const s = { story: 0 };
      const last = apps.length - 1;
      const section = host.closest("section") ?? host;
      const mm = gsap.matchMedia();
      if (!reduce && last > 0) {
        // Grand écran : l'ouverture reste en place le temps de toutes les montrer.
        mm.add("(min-width: 64rem)", () => {
          const header = document.querySelector("header");
          gsap.to(s, {
            story: last,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: () => `top ${header?.offsetHeight ?? 0}px`,
              end: `+=${last * 70}%`,
              pin: true,
              scrub: 0.8,
              invalidateOnRefresh: true,
              // Premier recalculé : tout ce qui suit se décale de son épinglage.
              refreshPriority: 1,
            },
          });
        });
        // Petit écran : les applications défilent pendant que le téléphone traverse l'écran.
        mm.add("(max-width: 63.999rem)", () => {
          gsap.to(s, {
            story: last,
            ease: "none",
            scrollTrigger: { trigger: host, start: "top 75%", end: "bottom 15%", scrub: 0.8 },
          });
        });
      }

      // La légende suit l'application affichée.
      let shown = -1;
      const legend = (k: number) => {
        if (k === shown) return;
        shown = k;
        if (count.current) count.current.textContent = `${k + 1}/${apps.length}`;
        if (name.current) name.current.textContent = apps[k].name;
        if (caption.current) caption.current.textContent = apps[k].caption;
        dots.current?.querySelectorAll("span").forEach((d, i) => d.toggleAttribute("data-on", i === k));
        if (!reduce && label.current)
          gsap.fromTo(label.current, { y: 8, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: "power3.out", overwrite: true });
      };
      legend(0);

      // --- Souris et main ------------------------------------------------
      const aim = { x: 0, y: 0 };
      const look = { x: 0, y: 0 };
      const onPointer = (e: PointerEvent) => {
        aim.x = (e.clientX / window.innerWidth - 0.5) * 2;
        aim.y = (e.clientY / window.innerHeight - 0.5) * 2;
      };
      if (finePointer && !reduce) window.addEventListener("pointermove", onPointer, { passive: true });
      // On attrape le téléphone et on le lance. Horizontal seulement : au
      // doigt, le défilement vertical passe toujours.
      const spin = { y: 0 };
      const [drag] = Draggable.create(document.createElement("div"), {
        type: "x",
        trigger: host,
        inertia: true,
        allowNativeTouchScrolling: true,
        onDrag() {
          spin.y += this.deltaX * 0.01;
        },
        onThrowUpdate() {
          spin.y += this.deltaX * 0.01;
        },
      });

      // --- Taille --------------------------------------------------------
      const resize = () => {
        const { width, height } = host.getBoundingClientRect();
        if (!width || !height) return;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        // Boîte étroite : on recule pour garder le téléphone et ses objets.
        camera.position.z = width / height < 0.9 ? 13.5 : 11;
        camera.updateProjectionMatrix();
        dirty = true;
      };
      const sizes = new ResizeObserver(resize);
      sizes.observe(host);

      // --- Image, sur le ticker de GSAP, coupée hors écran ----------------
      let onScreen = true;
      const io = new IntersectionObserver(([e]) => (onScreen = e.isIntersecting));
      io.observe(host);
      let lastStory = -1;
      const tick = (time: number, dt: number) => {
        if (!onScreen) return;
        const k = 1 - Math.exp(-(dt / 1000) * 3);
        look.x += (aim.x - look.x) * k;
        look.y += (aim.y - look.y) * k;
        const now = reduce ? 0 : time;

        phone.rotation.y = -0.32 + Math.sin(now * 0.5) * 0.12 + look.x * 0.35 + spin.y;
        phone.rotation.x = 0.05 + look.y * 0.15;
        phone.position.y = 0.35 + Math.sin(now * 0.9) * 0.08;
        floaters.forEach((f, i) => {
          f.m.position.copy(f.at);
          f.m.position.y += Math.sin(now * 0.8 + f.phase) * 0.15;
          f.m.rotation.set(now * 0.3 + i, now * 0.4 + f.phase, 0);
        });

        // L'écran ne se redessine que s'il change.
        if (dirty || s.story !== lastStory) {
          drawScreen(ctx, apps, imgs, s.story, paper);
          tex.needsUpdate = true;
          lastStory = s.story;
          dirty = false;
          legend(Math.min(Math.round(s.story), last));
        }
        renderer.render(scene, camera);
      };
      gsap.ticker.add(tick);
      host.dataset.ready = "";

      cleanup = () => {
        gsap.ticker.remove(tick);
        io.disconnect();
        sizes.disconnect();
        themeObserver.disconnect();
        scheme.removeEventListener("change", paint);
        window.removeEventListener("pointermove", onPointer);
        drag.kill();
        mm.revert();
        scene.traverse((o) => ((o as InstanceType<typeof THREE.Mesh>).material as { dispose?: () => void } | undefined)?.dispose?.());
        [bodyGeo, screenGeo, parcelGeo, tapeGeo, ballGeo, ringGeo].forEach((g) => g.dispose());
        tex.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, [apps]);

  return (
    <div className="relative h-full w-full">
      <div ref={box} aria-hidden className="phone-scene absolute inset-0 cursor-grab" />
      {/* Légende : quelle application, à quoi elle sert. La section
          Réalisations reprend tout, pour les lecteurs d'écran. */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center gap-2.5 text-center">
        <p className="font-mono text-xs text-ink-2">{hint}</p>
        <p ref={label} className="chip px-4 py-1.5 text-sm">
          <span ref={count} className="font-mono text-ink-2">
            1/{apps.length}
          </span>
          <span ref={name} className="font-bold">
            {apps[0]?.name}
          </span>
          <span ref={caption} className="font-normal text-ink-2">
            {apps[0]?.caption}
          </span>
        </p>
        <span ref={dots} className="flex gap-1.5">
          {apps.map((a, i) => (
            <span
              key={a.id}
              data-on={i === 0 ? "" : undefined}
              className="h-1.5 w-1.5 rounded-full bg-rule transition-[width,background-color] duration-300 data-[on]:w-5 data-[on]:bg-ink"
            />
          ))}
        </span>
      </div>
    </div>
  );
}
