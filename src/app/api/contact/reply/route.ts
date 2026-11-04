import { NextResponse, type NextRequest } from "next/server";
import { mailtoFor } from "@/lib/contact-reply";

/** Bouton « Répondre par e-mail » de l'alerte Telegram (voir `lib/contact-reply`). */
export function GET(req: NextRequest) {
  const mailto = mailtoFor(req.nextUrl.searchParams);
  if (!mailto) return new NextResponse("Lien invalide.", { status: 404 });
  return new NextResponse(null, {
    status: 302,
    headers: { Location: mailto, "Cache-Control": "no-store", "X-Robots-Tag": "noindex" },
  });
}
