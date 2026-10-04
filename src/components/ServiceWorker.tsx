"use client";
import { useEffect } from "react";

/**
 * Enregistre `public/sw.js` en production seulement : en développement, un
 * cache servirait d'anciennes versions des pages pendant qu'on les modifie.
 */
export default function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Sans service worker, le site fonctionne en ligne comme avant.
    });
  }, []);
  return null;
}
