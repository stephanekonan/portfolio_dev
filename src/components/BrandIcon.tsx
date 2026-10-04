import {
  siAdonisjs,
  siAndroid,
  siAngular,
  siAstro,
  siCloudflare,
  siDart,
  siDocker,
  siFirebase,
  siFlutter,
  siGo,
  siKotlin,
  siLaravel,
  siMailtrap,
  siMysql,
  siNextdotjs,
  siOvh,
  siPostgresql,
  siReact,
  siRender,
  siSqlite,
  siTailwindcss,
  siVercel,
  siWordpress,
  type SimpleIcon,
} from "simple-icons";

/**
 * Logos de marques (Simple Icons, CC0), importés un par un : le paquet en
 * compte des milliers, seuls ceux-ci entrent dans le build. Rendus côté
 * serveur, en SVG inline, à la couleur du texte : ils restent dans la
 * palette du site au lieu d'y poser leurs propres couleurs.
 */
const ICONS = {
  adonisjs: siAdonisjs,
  android: siAndroid,
  angular: siAngular,
  astro: siAstro,
  cloudflare: siCloudflare,
  dart: siDart,
  docker: siDocker,
  firebase: siFirebase,
  flutter: siFlutter,
  go: siGo,
  kotlin: siKotlin,
  laravel: siLaravel,
  mailtrap: siMailtrap,
  mysql: siMysql,
  nextdotjs: siNextdotjs,
  ovh: siOvh,
  postgresql: siPostgresql,
  react: siReact,
  render: siRender,
  sqlite: siSqlite,
  tailwindcss: siTailwindcss,
  vercel: siVercel,
  wordpress: siWordpress,
} satisfies Record<string, SimpleIcon>;

export type BrandSlug = keyof typeof ICONS;

export default function BrandIcon({ slug, className = "size-4" }: { slug: BrandSlug; className?: string }) {
  const icon = ICONS[slug];
  // Décoratif : le nom de l'outil est déjà écrit à côté. Le <title> ne sert
  // qu'à l'infobulle au survol.
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <title>{icon.title}</title>
      <path d={icon.path} />
    </svg>
  );
}
