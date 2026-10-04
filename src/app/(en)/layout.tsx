import type { Metadata, Viewport } from "next";
import RootDocument from "@/components/RootDocument";
import { siteMetadata, siteViewport } from "@/lib/metadata";

export const metadata: Metadata = siteMetadata("en");
export const viewport: Viewport = siteViewport;

export default function Layout({ children }: { children: React.ReactNode }) {
  return <RootDocument lang="en">{children}</RootDocument>;
}
