import type { MetadataRoute } from "next";

// Importée, la photo est servie sous une adresse qui porte son empreinte :
// une nouvelle photo change d'adresse, aucun cache ne sert l'ancienne.
import me from "../../public/me-small.png";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Stéphane Konan, ingénieur logiciel",
    short_name: "S. Konan",
    start_url: "/",
    display: "standalone",
    background_color: "#f5efe6",
    theme_color: "#17130f",
    icons: [{ src: me.src, sizes: `${me.width}x${me.height}`, type: "image/png" }],
  };
}
