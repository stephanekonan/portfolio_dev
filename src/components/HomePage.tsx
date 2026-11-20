import { ui, type Lang } from "@/i18n/ui";
import { formatDate, getPosts } from "@/lib/blog";

import Desk from "./desk/Desk";

/** Mois courant au moment du build, partagé par le rendu serveur et l'hydratation. */
const NOW = new Date().toISOString().slice(0, 7);

/**
 * L'accueil tient dans un seul écran, comme une application : le plan de
 * travail et ses fiches, puis des écrans qui s'ouvrent les uns après les
 * autres (Desk). Les articles sont lus ici, côté serveur, et passés tout
 * prêts.
 */
export default function HomePage({ lang }: { lang: Lang }) {
  const posts = getPosts(lang)
    .slice(0, 6)
    .map((p) => ({
      slug: p.slug,
      title: p.title,
      description: p.description,
      date: p.date,
      dateLabel: formatDate(p.date, lang),
      minutes: p.minutes,
    }));
  return <Desk lang={lang} t={ui[lang]} posts={posts} now={NOW} />;
}
