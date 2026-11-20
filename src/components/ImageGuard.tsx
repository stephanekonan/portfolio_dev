"use client";
import { useEffect } from "react";

/** Champs où le clic droit reste utile (coller, corriger l'orthographe). */
const EDITABLE = "input, textarea, select, [contenteditable]:not([contenteditable='false'])";

/**
 * Empêche d'enregistrer les images du site depuis le navigateur : plus de
 * menu contextuel (qui propose « Enregistrer l'image sous… » et
 * « Enregistrer la page sous… », pages et images comprises), plus de
 * glisser-déposer d'une image vers le bureau, et les raccourcis
 * d'enregistrement (Ctrl/Cmd+S) et de code source (Ctrl/Cmd+U) sont
 * neutralisés. Complète les règles CSS de `global.css` et `src/proxy.ts`.
 *
 * Limite assumée : une capture d'écran ou les outils de développement
 * restent possibles, rien ne peut l'empêcher côté site.
 */
export default function ImageGuard() {
  useEffect(() => {
    const onContextMenu = (e: MouseEvent) => {
      if (e.target instanceof Element && e.target.closest(EDITABLE)) return;
      e.preventDefault();
    };
    const onDragStart = (e: DragEvent) => {
      if (e.target instanceof Element && e.target.closest("img, picture, video, canvas, a:has(img)")) {
        e.preventDefault();
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      const key = e.key.toLowerCase();
      if (key === "s" || key === "u") e.preventDefault();
    };
    document.addEventListener("contextmenu", onContextMenu);
    document.addEventListener("dragstart", onDragStart);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("contextmenu", onContextMenu);
      document.removeEventListener("dragstart", onDragStart);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);
  return null;
}
