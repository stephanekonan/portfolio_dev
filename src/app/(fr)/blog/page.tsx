import { BlogIndex, blogIndexMetadata } from "@/components/BlogPages";

export const metadata = blogIndexMetadata("fr");

export default function Page() {
  return <BlogIndex lang="fr" />;
}
