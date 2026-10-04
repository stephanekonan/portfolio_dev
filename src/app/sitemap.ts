import type { MetadataRoute } from "next";
import { getPosts } from "@/lib/blog";
import { SITE_URL } from "@/lib/metadata";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/blog"].flatMap((p) => [
    { url: `${SITE_URL}${p || "/"}`, alternates: { languages: { en: `${SITE_URL}/en${p}` } } },
    { url: `${SITE_URL}/en${p}` },
  ]);
  const posts = getPosts().flatMap((post) => [
    { url: `${SITE_URL}/blog/${post.slug}`, lastModified: post.date },
    { url: `${SITE_URL}/en/blog/${post.slug}`, lastModified: post.date },
  ]);
  return [...pages, ...posts];
}
