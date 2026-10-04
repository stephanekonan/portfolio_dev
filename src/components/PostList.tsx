import Link from "next/link";
import { formatDate, type PostMeta } from "@/lib/blog";
import { base, ui, type Lang } from "@/i18n/ui";

export default function PostList({ posts, lang }: { posts: PostMeta[]; lang: Lang }) {
  const t = ui[lang].blog;
  if (posts.length === 0) return <p className="text-ink-2">{t.empty}</p>;
  return (
    <ul className="border-t border-rule">
      {posts.map((p) => (
        <li key={p.slug} className="border-b border-rule">
          <Link
            href={`${base(lang)}/blog/${p.slug}`}
            className="group grid gap-2 py-6 md:grid-cols-[11rem_minmax(0,1fr)] md:gap-8"
          >
            <span className="text-sm text-ink-2">
              <time dateTime={p.date}>{formatDate(p.date, lang)}</time>
              <span className="block">
                {p.minutes} {t.minutes}
                {p.lang !== lang && `, ${p.lang === "fr" ? t.inFrench : t.inEnglish}`}
              </span>
            </span>
            <span>
              <span className="font-display text-lg font-bold [font-stretch:118%] group-hover:underline">
                {p.title}
              </span>
              <span className="mt-2 block max-w-[68ch] text-ink-2">{p.description}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
