import type { MetadataRoute } from "next";
import { base, type Lang } from "@/i18n/ui";
import { getPosts } from "@/lib/blog";
import { SITE_URL } from "@/lib/metadata";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/blog"].flatMap((p) => [
    { url: `${SITE_URL}${p || "/"}`, alternates: { languages: { en: `${SITE_URL}/en${p}` } } },
    { url: `${SITE_URL}/en${p}` },
  ]);
  // Seules les versions réellement écrites : une page servie en repli
  // pointe son canonique vers l'original.
  const posts = getPosts("fr").flatMap((post) => {
    const url = (lang: Lang) => `${SITE_URL}${base(lang)}/blog/${post.slug}`;
    const languages = Object.fromEntries(post.langs.map((l) => [l, url(l)]));
    return post.langs.map((lang) => ({ url: url(lang), lastModified: post.date, alternates: { languages } }));
  });
  return [...pages, ...posts];
}
