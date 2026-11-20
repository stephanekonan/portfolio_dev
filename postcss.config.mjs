import { fileURLToPath } from "node:url";

const config = {
  plugins: {
    "@tailwindcss/postcss": {},
    // Après Tailwind : rend ses variables méconnaissables (voir le fichier).
    // Chemin absolu : Turbopack ne résout pas un chemin relatif ici.
    [fileURLToPath(new URL("./scripts/postcss-discretion.cjs", import.meta.url))]: {},
  },
};

export default config;
