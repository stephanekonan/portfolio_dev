import { BlogIndex, blogIndexMetadata } from "@/components/BlogPages";

export const metadata = blogIndexMetadata("en");

export default function Page() {
  return <BlogIndex lang="en" />;
}
