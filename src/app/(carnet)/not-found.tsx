import type { Metadata } from "next";
import NotFoundBody from "@/components/NotFoundBody";

export const metadata: Metadata = {
  title: { absolute: "404, page introuvable" },
};

export default function NotFound() {
  return <NotFoundBody />;
}
