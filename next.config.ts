import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Deux layouts racines, `(fr)` et `(en)` : aucun ne peut porter seul la
  // page 404, d'où `global-not-found.tsx`.
  experimental: {
    globalNotFound: true,
  },
  async headers() {
    return [
      {
        // Le service worker doit être relu à chaque visite, sinon une
        // nouvelle version du site resterait bloquée derrière l'ancienne.
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
