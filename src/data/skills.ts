import type { T } from "./career";
import type { Layer } from "./traces";
import type { BrandSlug } from "@/components/BrandIcon";

export interface SkillGroup {
  layer: Layer;
  title: T;
  items: { name: string; icons?: BrandSlug[]; detail: T }[];
}

/**
 * Rangées dans l'ordre d'une requête : la page, le téléphone, le réseau,
 * l'API, puis les données. Chaque détail dit ce que j'en ai fait en
 * production, pas un niveau sur une jauge.
 */
export const SKILLS: SkillGroup[] = [
  {
    layer: "web",
    title: { fr: "Web", en: "Web" },
    items: [
      { name: "Next.js et React", icons: ["nextdotjs","react"], detail: { fr: "Sites, PWA et back-offices en React 18 et 19, App Router, server actions", en: "Sites, PWAs and back-offices in React 18 and 19, App Router, server actions" } },
      { name: "Tailwind CSS", icons: ["tailwindcss"], detail: { fr: "Systèmes de jetons en v3 et v4, thèmes clair et sombre", en: "Token systems in v3 and v4, light and dark themes" } },
      { name: "Angular, Astro, WordPress", icons: ["angular","astro","wordpress"], detail: { fr: "Sites vitrines et e-commerce, sites statiques en Astro", en: "Showcase and e-commerce sites, static sites in Astro" } },
    ],
  },
  {
    layer: "mobile",
    title: { fr: "Mobile", en: "Mobile" },
    items: [
      { name: "Flutter", icons: ["flutter","dart"], detail: { fr: "Bloc et Cubit, auto_route, get_it, flavors dev, staging et prod", en: "Bloc and Cubit, auto_route, get_it, dev, staging and prod flavors" } },
      { name: "Hors ligne", icons: ["sqlite"], detail: { fr: "SQLite, file d'envoi idempotente, synchronisation en série", en: "SQLite, idempotent outbox, serial sync" } },
      { name: "Kotlin Android", icons: ["kotlin","android"], detail: { fr: "Apps natives avec Firebase", en: "Native apps with Firebase" } },
    ],
  },
  {
    layer: "infra",
    title: { fr: "Réseau, infra et sécurité", en: "Network, infra and security" },
    items: [
      {
        name: "Cloudflare",
        icons: ["cloudflare"],
        detail: {
          fr: "DNS et proxy de zone, WAF et limites de débit, Transform Rules, garde d'origine, mode Under Attack, DNSSEC, protection de la délivrabilité e-mail",
          en: "Zone DNS and proxy, WAF and rate limits, Transform Rules, origin guard, Under Attack mode, DNSSEC, email deliverability protection",
        },
      },
      { name: "Vercel, Render, OVH", icons: ["vercel","render","ovh","docker"], detail: { fr: "Déploiement continu de fronts, d'API et de VPS, Docker", en: "Continuous deployment of fronts, APIs and VPSs, Docker" } },
      { name: "Sécurité applicative", detail: { fr: "CompTIA Security+, JWT avec rotation, CORS strict, rate limiting, garde d'origine", en: "CompTIA Security+, rotating JWTs, strict CORS, rate limiting, origin guard" } },
    ],
  },
  {
    layer: "api",
    title: { fr: "API", en: "API" },
    items: [
      { name: "Go", icons: ["go"], detail: { fr: "Clean Architecture et DDD, net/http, middlewares, webhooks, concurrence", en: "Clean Architecture and DDD, net/http, middlewares, webhooks, concurrency" } },
      { name: "AdonisJS et Laravel", icons: ["adonisjs","laravel"], detail: { fr: "Découpage par feature, validation VineJS, tests Japa ; Laravel en production depuis 2023", en: "Feature slicing, VineJS validation, Japa tests; Laravel in production since 2023" } },
      { name: "Intégrations", icons: ["mailtrap","firebase"], detail: { fr: "Wave et GeniusPay, Mailtrap, OTP par SMS, notifications FCM", en: "Wave and GeniusPay, Mailtrap, SMS OTP, FCM notifications" } },
    ],
  },
  {
    layer: "data",
    title: { fr: "Données", en: "Data" },
    items: [
      { name: "Firestore", icons: ["firebase"], detail: { fr: "Modélisation sans jointure, index composites, unicité portée par la clé", en: "Join-free modelling, composite indexes, uniqueness carried by the key" } },
      { name: "MySQL et PostgreSQL", icons: ["mysql","postgresql"], detail: { fr: "Schémas relationnels pour la gestion de stock et les réservations", en: "Relational schemas for inventory and bookings" } },
      { name: "SQLite et Realtime Database", icons: ["sqlite","firebase"], detail: { fr: "Caches hors ligne sur mobile, OTP et tentatives d'authentification", en: "Offline caches on mobile, OTPs and auth attempts" } },
    ],
  },
];
