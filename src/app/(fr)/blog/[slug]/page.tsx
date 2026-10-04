import { BlogArticle, blogArticleMetadata, blogStaticParams } from "@/components/BlogPages";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = blogStaticParams;

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return blogArticleMetadata("fr", slug);
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  return <BlogArticle lang="fr" slug={slug} />;
}
