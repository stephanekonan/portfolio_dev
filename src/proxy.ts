import { NextResponse, type NextRequest } from "next/server";

/**
 * Une image du site ne s'ouvre jamais seule dans un onglet (adresse collée,
 * « Ouvrir l'image dans un nouvel onglet ») : le navigateur l'annonce par
 * `Sec-Fetch-Dest: document`, et on renvoie alors vers l'accueil. Les
 * images affichées dans les pages (`Sec-Fetch-Dest: image`) ne passent même
 * pas par ici, grâce à la condition `has` du matcher.
 */
export function proxy(request: NextRequest) {
  return NextResponse.redirect(new URL("/", request.url));
}

export const config = {
  matcher: [
    {
      source: "/:path*.:ext(png|jpe?g|webp|gif|avif)",
      has: [{ type: "header", key: "sec-fetch-dest", value: "document" }],
    },
    {
      source: "/_next/image",
      has: [{ type: "header", key: "sec-fetch-dest", value: "document" }],
    },
  ],
};
