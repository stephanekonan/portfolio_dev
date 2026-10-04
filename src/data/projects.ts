import type { T } from "./career";

export interface Project {
  name: string;
  kind: "web" | "mobile";
  stack: string[];
  summary: T;
  image: string;
  /** Les captures d'app mobile sont en portrait : elles se posent autrement. */
  portrait?: boolean;
  href?: string;
}

export const PROJECTS: Project[] = [
  {
    name: "Valorie",
    kind: "web",
    stack: ["React 19", "Vite", "Tailwind 4"],
    summary: {
      fr: "Maison française de mode et de cosmétique : catalogue, fiches produit et univers de marque.",
      en: "French fashion and cosmetics house: catalogue, product pages and brand world.",
    },
    image: "/valorie.png",
    href: "https://valorie.vercel.app/",
  },
  {
    name: "LPA, Ligue des peuples africains",
    kind: "web",
    stack: [],
    summary: {
      fr: "Site d'une mission évangélique africaine centrée sur la foi, l'évangélisation et la transformation sociale.",
      en: "Website of an African evangelical mission focused on faith, evangelism and social change.",
    },
    image: "/lpa.png",
    href: "https://www.lpa.ci/",
  },
  {
    name: "Smarty+",
    kind: "mobile",
    stack: ["Flutter", "SQLite", "Go"],
    summary: {
      fr: "Suivi des dépenses et des revenus personnels, pour mieux tenir son budget.",
      en: "Personal expense and income tracking, to keep a budget on course.",
    },
    image: "/smart_spending.png",
    href: "https://apkpure.com/p/com.smart_spending",
  },
  {
    name: "MotoTrack-AI",
    kind: "mobile",
    stack: ["Flutter"],
    summary: {
      fr: "Optimise les courses des livreurs à moto en plaçant leur sécurité et leur bien-être au centre.",
      en: "Optimises motorbike couriers' rides with their safety and well-being at the centre.",
    },
    image: "/moto_track.png",
  },
  {
    name: "djaxa .r",
    kind: "mobile",
    stack: ["Kotlin", "Firebase"],
    summary: {
      fr: "Gestion des ateliers de réparation de téléphones : prises en charge, suivi, clients.",
      en: "Management for phone repair shops: intake, tracking, customers.",
    },
    image: "/djaxa.png",
    portrait: true,
  },
  {
    name: "Weni CI",
    kind: "web",
    stack: ["WordPress"],
    summary: {
      fr: "Envoyer un colis sans bouger de chez soi : site vitrine et commande en ligne.",
      en: "Send a parcel without leaving home: showcase site and online ordering.",
    },
    image: "/weni.png",
    href: "https://weni.ci",
  },
];
