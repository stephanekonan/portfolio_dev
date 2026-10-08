/*
 * Service worker du portfolio : le site reste consultable sans réseau.
 *
 * - Pages : réseau d'abord, cache en repli. En ligne, on voit toujours la
 *   dernière version ; hors ligne, la dernière version visitée.
 * - Ressources versionnées de Next (/_next/static) et images : cache d'abord,
 *   leur nom change à chaque build, elles ne périment donc jamais.
 * - /api/* n'est jamais mis en cache : le formulaire gère lui-même sa file
 *   d'envoi hors ligne.
 * - Une réponse marquée `Cache-Control: no-store` n'est jamais gardée : c'est
 *   le cas des pages rendues à la demande, dont l'espace privé, qui ne doit
 *   pas rester lisible hors ligne sur l'appareil.
 *
 * Changer VERSION purge les anciens caches à l'activation.
 */
const VERSION = "v2";
const PAGES = `pages-${VERSION}`;
const ASSETS = `assets-${VERSION}`;
const PRECACHE = ["/", "/en", "/blog", "/en/blog"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(PAGES)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== PAGES && k !== ASSETS).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return;

  const isAsset =
    url.pathname.startsWith("/_next/static/") || /\.(png|jpe?g|webp|svg|ico|woff2)$/.test(url.pathname);

  if (isAsset) {
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ||
          fetch(request).then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(ASSETS).then((cache) => cache.put(request, copy));
            }
            return res;
          }),
      ),
    );
    return;
  }

  // Navigations et données RSC de Next : réseau d'abord.
  event.respondWith(
    fetch(request)
      .then((res) => {
        if (res.ok && !/no-store/i.test(res.headers.get("Cache-Control") ?? "")) {
          const copy = res.clone();
          caches.open(PAGES).then((cache) => cache.put(request, copy));
        }
        return res;
      })
      .catch(() =>
        caches
          .match(request, { ignoreVary: true })
          .then((hit) => hit || (request.mode === "navigate" ? caches.match("/") : Response.error())),
      ),
  );
});
