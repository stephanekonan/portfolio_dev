import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Stéphane Konan, ingénieur logiciel",
    short_name: "S. Konan",
    start_url: "/",
    display: "standalone",
    background_color: "#eceee8",
    theme_color: "#0f1012",
    icons: [{ src: "/me-small.png", sizes: "400x400", type: "image/png" }],
  };
}
