import type { Lang } from "@/i18n/ui";

export type T = Record<Lang, string>;

export interface CareerSpan {
  id: string;
  name: string;
  kind: "job" | "project" | "study";
  /** Mois de début et de fin, `AAAA-MM`. Sans fin, la période court encore. */
  start: string;
  end?: string;
  role: T;
  attributes: { key: T; value: T }[];
}

const same = (s: string): T => ({ fr: s, en: s });

/**
 * Ordre d'affichage = ordre chronologique de début : la cascade se lit de
 * haut en bas comme une trace, le span le plus ancien en premier.
 */
export const CAREER: CareerSpan[] = [
  {
    id: "bts",
    name: "BTS Informatique",
    kind: "study",
    start: "2019-10",
    end: "2021-07",
    role: {
      fr: "Développeur d'applications, École pratique de la CCI de Côte d'Ivoire",
      en: "Application development, École pratique of the Côte d'Ivoire CCI",
    },
    attributes: [
      { key: { fr: "Lieu", en: "Location" }, value: same("Plateau, Abidjan") },
      { key: { fr: "Avant", en: "Before" }, value: { fr: "Bac D, lycée municipal 2 de Koumassi, 2019", en: "Science baccalaureate, Koumassi, 2019" } },
    ],
  },
  {
    id: "weni",
    name: "Weni Livraison",
    kind: "job",
    start: "2021-11",
    end: "2023-04",
    role: { fr: "Développeur front-end Angular et WordPress", en: "Angular and WordPress front-end developer" },
    attributes: [
      { key: { fr: "Livré", en: "Shipped" }, value: { fr: "Site vitrine et site e-commerce, maintenance de l'app web interne en Vue.js", en: "Showcase and e-commerce sites, upkeep of the internal Vue.js web app" } },
      { key: { fr: "Aussi", en: "Also" }, value: { fr: "Visuels publicitaires, vidéos, page Facebook, flotte téléphonique des livreurs", en: "Ad visuals, videos, Facebook page, couriers' phone fleet" } },
    ],
  },
  {
    id: "vague",
    name: "Vague Digitale",
    kind: "job",
    start: "2023-04",
    end: "2023-10",
    role: { fr: "Développeur full-stack Laravel et MySQL", en: "Full-stack Laravel and MySQL developer" },
    attributes: [
      { key: { fr: "Produit", en: "Product" }, value: { fr: "Imoconnect, réservation de résidences", en: "Imoconnect, residence booking" } },
      { key: { fr: "Apport", en: "Contribution" }, value: { fr: "Backend des réservations, montée progressive vers une architecture plus propre", en: "Booking backend, gradual move to a cleaner architecture" } },
    ],
  },
  {
    id: "ablele",
    name: "Ablele",
    kind: "job",
    start: "2023-10",
    role: { fr: "Développeur full-stack Laravel, Go et Flutter", en: "Full-stack Laravel, Go and Flutter developer" },
    attributes: [
      { key: { fr: "Produits", en: "Products" }, value: { fr: "Aboutik (stock multi-magasins), AgriFin (gestion agricole), une app de lavage auto", en: "Aboutik (multi-store inventory), AgriFin (farm management), a car-wash app" } },
      { key: { fr: "Architecture", en: "Architecture" }, value: { fr: "Clean Architecture et DDD : services, repositories, pipelines de paiement", en: "Clean Architecture and DDD: services, repositories, payment pipelines" } },
      { key: { fr: "Mise en ligne", en: "Release" }, value: { fr: "Backend sur serveur OVH, APK publiés sur APKPure", en: "Backend on an OVH server, APKs on APKPure" } },
    ],
  },
  {
    id: "wadibu",
    name: "Wadibu",
    kind: "project",
    start: "2025-06",
    role: { fr: "Fondateur et lead developer", en: "Founder and lead developer" },
    attributes: [
      { key: { fr: "Livré", en: "Shipped" }, value: { fr: "API Go, apps client et livreur en Flutter, PWA, site, back-office", en: "Go API, Flutter customer and courier apps, PWA, website, back-office" } },
      { key: { fr: "Production", en: "Production" }, value: { fr: "Toute la zone derrière Cloudflare, déploiement continu de chaque surface", en: "Whole zone behind Cloudflare, continuous deployment of every surface" } },
    ],
  },
  {
    id: "secplus",
    name: "CompTIA Security+",
    kind: "study",
    start: "2025-11",
    end: "2026-04",
    role: { fr: "Bootcamp cybersécurité, Comycode Abidjan", en: "Cybersecurity bootcamp, Comycode Abidjan" },
    attributes: [
      { key: { fr: "Certification", en: "Certification" }, value: same("CompTIA Security+ SY0-701") },
      { key: { fr: "En pratique", en: "In practice" }, value: { fr: "Durcissement des API en production : garde d'origine, règles de bordure, rotation des jetons", en: "Hardening production APIs: origin guard, edge rules, token rotation" } },
    ],
  },
  {
    id: "resi",
    name: "Resi",
    kind: "project",
    start: "2026-09",
    role: { fr: "Conception et développement, seul", en: "Solo design and development" },
    attributes: [
      { key: { fr: "Livré", en: "Shipped" }, value: { fr: "API AdonisJS, app Flutter hors ligne, site et back-office Next.js", en: "AdonisJS API, offline Flutter app, Next.js site and back-office" } },
      { key: { fr: "Statut", en: "Status" }, value: { fr: "Publication sur les stores en cours", en: "Store release in progress" } },
    ],
  },
];

export const AXIS = { from: 2019, to: 2027 };
