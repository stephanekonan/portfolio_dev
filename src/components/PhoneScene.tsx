"use client";
import { useEffect, useRef } from "react";

import type { Ui } from "@/i18n/ui";
import { loadGsap } from "@/lib/motion";

type Phone = Ui["hero"]["phone"];

/** Taille de l'écran dessiné, en px de canvas (ratio de l'écran 3D). */
const SW = 420;
const SH = 920;

function cssVar(name: string) {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
}

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
  return t * t * (3 - 2 * t);
};

function roundRect(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  c.beginPath();
  c.roundRect(x, y, w, h, r);
}

/**
 * Dessine l'écran du téléphone à un instant de l'histoire : `story` va de 0
 * (le panier) à 3 (commande livrée), chaque étape passant à la suivante en
 * fondu sur sa fin. `time` anime l'appel à toucher le bouton.
 */
function drawScreen(
  c: CanvasRenderingContext2D,
  t: Phone,
  story: number,
  time: number,
  colors: Record<string, string>,
) {
  const { paper, raised, ink, ink2, rule, signal, go, family } = colors;
  c.clearRect(0, 0, SW, SH);
  c.save();
  roundRect(c, 0, 0, SW, SH, 46);
  c.clip();
  c.fillStyle = paper;
  c.fillRect(0, 0, SW, SH);

  // Barre d'état et encoche.
  c.fillStyle = ink;
  c.font = `600 22px ${family}`;
  c.textBaseline = "middle";
  c.fillText("9:41", 40, 44);
  roundRect(c, SW / 2 - 60, 26, 120, 36, 18);
  c.fill();

  const stage = Math.min(Math.floor(story), 3);
  const local = story >= 3 ? 1 : story - stage;
  const pad = 34;
  const font = (w: number, s: number) => `${w} ${s}px ${family}`;

  const scene = (k: number, p: number) => {
    if (k === 0) {
      c.fillStyle = ink;
      c.font = font(700, 40);
      c.fillText(t.cart, pad, 140);
      t.items.forEach(([name, price], i) => {
        const y = 220 + i * 92;
        c.fillStyle = raised;
        roundRect(c, pad, y - 36, SW - pad * 2, 72, 20);
        c.fill();
        c.fillStyle = ink;
        c.font = font(500, 26);
        c.fillText(name, pad + 22, y);
        c.font = font(600, 26);
        const w = c.measureText(price).width;
        c.fillText(price, SW - pad - 22 - w, y);
      });
      c.strokeStyle = rule;
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(pad, 520);
      c.lineTo(SW - pad, 520);
      c.stroke();
      c.fillStyle = ink;
      c.font = font(600, 28);
      c.fillText(t.total, pad, 570);
      c.font = font(800, 34);
      const w = c.measureText(t.totalPrice).width;
      c.fillText(t.totalPrice, SW - pad - w, 570);

      // Le bouton « Commander » : il appelle le doigt, puis s'enfonce.
      const press = smooth(0.35, 0.6, p);
      const bw = SW - pad * 2;
      const by = 760;
      const pulse = (time % 1.6) / 1.6;
      if (p < 0.35) {
        c.strokeStyle = signal;
        c.globalAlpha = 1 - pulse;
        c.lineWidth = 4;
        roundRect(
          c,
          pad - pulse * 16,
          by - 44 - pulse * 16,
          bw + pulse * 32,
          88 + pulse * 32,
          60,
        );
        c.stroke();
        c.globalAlpha = 1;
      }
      const s = 1 - press * 0.06;
      c.save();
      c.translate(SW / 2, by);
      c.scale(s, s);
      c.fillStyle = signal;
      roundRect(c, -bw / 2, -44, bw, 88, 44);
      c.fill();
      c.fillStyle = "#17130f";
      c.font = font(700, 32);
      c.textAlign = "center";
      c.fillText(t.order, 0, 2);
      c.restore();
      c.textAlign = "left";
    }

    if (k === 1) {
      // Paiement : un anneau qui se remplit, puis la coche verte.
      const done = smooth(0.55, 0.75, p);
      const cx = SW / 2;
      const cy = 400;
      c.lineWidth = 14;
      c.strokeStyle = rule;
      c.beginPath();
      c.arc(cx, cy, 90, 0, Math.PI * 2);
      c.stroke();
      c.strokeStyle = done > 0 ? go : signal;
      c.beginPath();
      c.arc(
        cx,
        cy,
        90,
        -Math.PI / 2,
        -Math.PI / 2 + Math.PI * 2 * Math.min(p / 0.6, 1),
      );
      c.stroke();
      if (done > 0) {
        c.strokeStyle = go;
        c.lineWidth = 14;
        c.lineCap = "round";
        c.beginPath();
        c.moveTo(cx - 40, cy + 2);
        c.lineTo(cx - 40 + 28 * done, cy + 2 + 28 * done);
        if (done > 0.5)
          c.lineTo(
            cx - 12 + 58 * (done - 0.5) * 2,
            cy + 30 - 58 * (done - 0.5) * 2,
          );
        c.stroke();
        c.lineCap = "butt";
      }
      c.fillStyle = ink;
      c.font = font(700, 34);
      c.textAlign = "center";
      c.fillText(done > 0.5 ? t.paid : t.paying, cx, 580);
      c.fillStyle = ink2;
      c.font = font(600, 28);
      c.fillText(t.totalPrice, cx, 630);
      c.textAlign = "left";
    }

    if (k === 2) {
      // En route : une petite carte, un trajet, le livreur qui avance.
      c.fillStyle = raised;
      roundRect(c, pad, 120, SW - pad * 2, 480, 28);
      c.fill();
      c.strokeStyle = rule;
      c.lineWidth = 2;
      for (let i = 1; i < 6; i++) {
        c.beginPath();
        c.moveTo(pad, 120 + i * 80);
        c.lineTo(SW - pad, 120 + i * 80);
        c.moveTo(pad + i * 60, 120);
        c.lineTo(pad + i * 60, 600);
        c.stroke();
      }
      const a = { x: pad + 60, y: 540 };
      const b = { x: SW / 2 + 40, y: 360 };
      const d = { x: SW - pad - 60, y: 190 };
      c.strokeStyle = signal;
      c.lineWidth = 8;
      c.setLineDash([4, 16]);
      c.lineCap = "round";
      c.beginPath();
      c.moveTo(a.x, a.y);
      c.quadraticCurveTo(b.x - 160, b.y + 40, b.x, b.y);
      c.quadraticCurveTo(b.x + 140, b.y - 40, d.x, d.y);
      c.stroke();
      c.setLineDash([]);
      c.lineCap = "butt";
      // Position du livreur sur les deux courbes.
      const q = (
        p0: { x: number; y: number },
        p1: { x: number; y: number },
        p2: { x: number; y: number },
        u: number,
      ) => ({
        x: (1 - u) ** 2 * p0.x + 2 * (1 - u) * u * p1.x + u ** 2 * p2.x,
        y: (1 - u) ** 2 * p0.y + 2 * (1 - u) * u * p1.y + u ** 2 * p2.y,
      });
      const u = Math.min(p / 0.85, 1);
      const pos =
        u < 0.5
          ? q(a, { x: b.x - 160, y: b.y + 40 }, b, u * 2)
          : q(b, { x: b.x + 140, y: b.y - 40 }, d, (u - 0.5) * 2);
      c.fillStyle = go;
      c.beginPath();
      c.arc(d.x, d.y, 16, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = signal;
      c.beginPath();
      c.arc(pos.x, pos.y, 20, 0, Math.PI * 2);
      c.fill();
      c.strokeStyle = paper;
      c.lineWidth = 5;
      c.stroke();
      c.fillStyle = ink;
      c.font = font(700, 34);
      c.fillText(t.onTheWay, pad, 680);
      c.fillStyle = ink2;
      c.font = font(500, 28);
      c.fillText(t.eta, pad, 730);
    }

    if (k === 3) {
      // Livré : le grand cercle vert et sa coche.
      const pop = smooth(0, 0.5, p);
      const cx = SW / 2;
      const cy = 400;
      c.fillStyle = go;
      c.beginPath();
      c.arc(cx, cy, 30 + 80 * pop, 0, Math.PI * 2);
      c.fill();
      c.strokeStyle = paper;
      c.lineWidth = 16;
      c.lineCap = "round";
      c.lineJoin = "round";
      c.globalAlpha = pop;
      c.beginPath();
      c.moveTo(cx - 40, cy);
      c.lineTo(cx - 10, cy + 30);
      c.lineTo(cx + 44, cy - 30);
      c.stroke();
      c.globalAlpha = 1;
      c.lineCap = "butt";
      c.fillStyle = ink;
      c.font = font(800, 38);
      c.textAlign = "center";
      c.fillText(t.delivered, cx, 590);
      c.fillStyle = ink2;
      c.font = font(500, 30);
      c.fillText(t.thanks, cx, 640);
      c.textAlign = "left";
    }
  };

  scene(stage, local);
  // Fondu vers l'étape suivante sur la fin de chaque étape.
  const fade = stage < 3 ? smooth(0.85, 1, local) : 0;
  if (fade > 0) {
    c.globalAlpha = fade;
    c.fillStyle = paper;
    c.fillRect(0, 80, SW, SH - 80);
    scene(stage + 1, 0);
    c.globalAlpha = 1;
  }

  // Barre d'accueil.
  c.fillStyle = ink;
  roundRect(c, SW / 2 - 70, SH - 26, 140, 8, 4);
  c.fill();
  c.restore();
}

/**
 * Le téléphone de l'ouverture, en Three.js. Son écran raconte une commande
 * à mesure qu'on défile : le panier et le bouton « Commander », le paiement
 * par Wave, le livreur en route, la commande livrée. Grand écran :
 * l'ouverture est épinglée le temps de l'histoire. Autour flottent un colis,
 * une bille orange et un anneau d'encre. On peut le faire tourner à la main
 * (Draggable + Inertia). Mouvement réduit : le panier, immobile.
 */
export default function PhoneScene({ t }: { t: Phone }) {
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = box.current;
    if (!host) return;
    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const [THREE, { RoundedBoxGeometry }, { gsap, Draggable }] =
        await Promise.all([
          import("three"),
          import("three/examples/jsm/geometries/RoundedBoxGeometry.js"),
          loadGsap(),
        ]);
      if (disposed) return;

      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      } catch {
        return; // Pas de WebGL : la place reste vide, rien ne manque au contenu.
      }
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const finePointer = window.matchMedia(
        "(hover: hover) and (pointer: fine)",
      ).matches;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.domElement.style.cssText =
        "position:absolute;inset:0;width:100%;height:100%;display:block";
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
      scene.add(phone);
      const bodyGeo = new RoundedBoxGeometry(1.9, 4, 0.24, 6, 0.3);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: 0x1d1915,
        roughness: 0.35,
        metalness: 0.4,
      });
      phone.add(new THREE.Mesh(bodyGeo, bodyMat));

      const canvas = document.createElement("canvas");
      canvas.width = SW;
      canvas.height = SH;
      const ctx = canvas.getContext("2d")!;
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 4;
      const screenGeo = new THREE.PlaneGeometry(1.76, 1.76 * (SH / SW));
      const screenMat = new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        toneMapped: false,
      });
      const screen = new THREE.Mesh(screenGeo, screenMat);
      screen.position.z = 0.125;
      phone.add(screen);

      // --- Ce qui flotte autour : un colis, une bille, un anneau ----------
      const parcelGeo = new RoundedBoxGeometry(0.7, 0.55, 0.55, 4, 0.06);
      const parcelMat = new THREE.MeshStandardMaterial({
        color: 0xd9a066,
        roughness: 0.8,
      });
      const parcel = new THREE.Mesh(parcelGeo, parcelMat);
      const tapeGeo = new THREE.BoxGeometry(0.72, 0.1, 0.57);
      const tapeMat = new THREE.MeshStandardMaterial({
        color: 0xf5efe6,
        roughness: 0.6,
      });
      parcel.add(new THREE.Mesh(tapeGeo, tapeMat));
      const ballGeo = new THREE.SphereGeometry(0.3, 32, 24);
      const ballMat = new THREE.MeshStandardMaterial({ roughness: 0.3 });
      const ball = new THREE.Mesh(ballGeo, ballMat);
      const ringGeo = new THREE.TorusGeometry(0.34, 0.12, 20, 48);
      const ringMat = new THREE.MeshStandardMaterial({ roughness: 0.4 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      const floaters = [
        { m: parcel, at: new THREE.Vector3(2.0, 1.6, -0.6), phase: 0 },
        { m: ball, at: new THREE.Vector3(-2.1, 1.1, 0.4), phase: 2 },
        { m: ring, at: new THREE.Vector3(1.9, -1.6, 0.5), phase: 4 },
      ];
      floaters.forEach((f) => scene.add(f.m));

      // --- Teintes du thème ---------------------------------------------
      const colors: Record<string, string> = {};
      const paint = () => {
        for (const [k, v] of Object.entries({
          paper: "--paper",
          raised: "--raised",
          ink: "--ink",
          ink2: "--ink-2",
          rule: "--rule",
          signal: "--signal",
          go: "--go",
        }))
          colors[k] = cssVar(v);
        // La police du texte du site, telle que next/font l'a nommée.
        colors.family = getComputedStyle(document.body).fontFamily;
        ballMat.color.set(colors.signal);
        ringMat.color.set(colors.ink);
        dirty = true;
      };
      let dirty = true;
      paint();
      document.fonts.ready.then(() => (dirty = true));
      const themeObserver = new MutationObserver(paint);
      themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-theme"],
      });
      const scheme = window.matchMedia("(prefers-color-scheme: dark)");
      scheme.addEventListener("change", paint);

      // --- L'histoire, au défilement -------------------------------------
      const s = { story: 0 };
      const section = host.closest("section") ?? host;
      const mm = gsap.matchMedia();
      if (!reduce) {
        // Grand écran : l'ouverture reste en place le temps de la commande.
        mm.add("(min-width: 64rem)", () => {
          const header = document.querySelector("header");
          gsap.to(s, {
            story: 3,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: () => `top ${header?.offsetHeight ?? 0}px`,
              end: "+=160%",
              pin: true,
              scrub: 0.8,
              invalidateOnRefresh: true,
              // Premier recalculé : tout ce qui suit se décale de son épinglage.
              refreshPriority: 1,
            },
          });
        });
        // Petit écran : l'histoire avance pendant que le téléphone traverse l'écran.
        mm.add("(max-width: 63.999rem)", () => {
          gsap.to(s, {
            story: 3,
            ease: "none",
            scrollTrigger: {
              trigger: host,
              start: "top 75%",
              end: "bottom 25%",
              scrub: 0.8,
            },
          });
        });
      }

      // --- Souris et main ------------------------------------------------
      const aim = { x: 0, y: 0 };
      const look = { x: 0, y: 0 };
      const onPointer = (e: PointerEvent) => {
        aim.x = (e.clientX / window.innerWidth - 0.5) * 2;
        aim.y = (e.clientY / window.innerHeight - 0.5) * 2;
      };
      if (finePointer && !reduce)
        window.addEventListener("pointermove", onPointer, { passive: true });
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
      const io = new IntersectionObserver(
        ([e]) => (onScreen = e.isIntersecting),
      );
      io.observe(host);
      let lastStory = -1;
      let lastScreen = 0;
      const tick = (time: number, dt: number) => {
        if (!onScreen) return;
        const k = 1 - Math.exp(-(dt / 1000) * 3);
        look.x += (aim.x - look.x) * k;
        look.y += (aim.y - look.y) * k;
        const now = reduce ? 0 : time;

        phone.rotation.y =
          -0.38 +
          Math.sin(now * 0.5) * 0.12 +
          look.x * 0.35 +
          spin.y +
          s.story * 0.13;
        phone.rotation.x = 0.06 + look.y * 0.15;
        phone.position.y = Math.sin(now * 0.9) * 0.08;
        floaters.forEach((f, i) => {
          f.m.position.copy(f.at);
          f.m.position.y += Math.sin(now * 0.8 + f.phase) * 0.15;
          f.m.rotation.set(now * 0.3 + i, now * 0.4 + f.phase, 0);
        });

        // L'écran ne se redessine que s'il change : histoire, appel du bouton.
        const idle = s.story < 0.35 && !reduce;
        if (
          dirty ||
          s.story !== lastStory ||
          (idle && time - lastScreen > 1 / 30)
        ) {
          drawScreen(ctx, t, s.story, now, colors);
          tex.needsUpdate = true;
          lastStory = s.story;
          lastScreen = time;
          dirty = false;
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
        scene.traverse((o) =>
          (
            (o as InstanceType<typeof THREE.Mesh>).material as
              | { dispose?: () => void }
              | undefined
          )?.dispose?.(),
        );
        [bodyGeo, screenGeo, parcelGeo, tapeGeo, ballGeo, ringGeo].forEach(
          (g) => g.dispose(),
        );
        tex.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, [t]);

  return (
    <div
      ref={box}
      aria-hidden
      className="phone-scene relative h-full w-full cursor-grab"
    />
  );
}
