import type { SiteConfig, SiteContent } from "../types";

export const SITE_CONFIG: SiteConfig = {
  title: "Stéphane Konan — Mobile & Web Developer",
  author: "Stéphane Konan",
  description:
    "Développeur basé à Abidjan, Côte d’Ivoire. Spécialisé dans la conception d’interfaces, le développement et la maintenance d’applications web et mobiles performantes, avec une expertise en Laravel, Golang, Angular, Nextjs, MySQL, Firebase, Flutter et Kotlin Android.",
  lang: "fr",
  siteLogo: "/me-small.png",
  navLinks: [
    { text: "Expériences", href: "#experience" },
    { text: "Projets", href: "#projects" },
    { text: "A propos de moi", href: "#about" },
  ],
  socialLinks: [
    { text: "LinkedIn", href: "https://www.linkedin.com/in/st%C3%A9phane-konan-59120a199" },
    { text: "Github", href: "https://github.com/stephanekonan" },
    { text: "Tik Tok", href: "https://www.tiktok.com/@stephanekonan69" },
  ],
};

export const SITE_CONTENT: SiteContent = {
  hero: {
    name: "Stéphane Konan",
    specialty: "Software Developer",
    summary:
      "Développeur basé à Abidjan, Côte d’Ivoire. Spécialisé dans la conception d’interfaces, le développement et la maintenance d’applications web et mobiles performantes, avec une expertise en Laravel, Golang, Angular, Nextjs, MySQL, Firebase, Flutter et Kotlin Android.",
    email: "stephanekonan.dev@gmail.com",
  },
  techStack: [
    {
      url: "https://res.cloudinary.com/dw6xejg8r/image/upload/v1755389885/laravel_juecw5.png",
      alt: "Laravel",
      // width: 50,
      height: 50
    },
    {
      url: "https://res.cloudinary.com/dw6xejg8r/image/upload/v1755389883/flutter_yhordj.png",
      alt: "Flutter",
      // width: 50,
      height: 50
    },
    {
      url: "https://res.cloudinary.com/dw6xejg8r/image/upload/v1755393316/angular-logo_h9nsqr.png",
      alt: "Angular",
      // width: 50,
      height: 50
    },
    {
      url: "https://res.cloudinary.com/dw6xejg8r/image/upload/v1755389884/go_m8fvqz.png",
      alt: "Go",
      // width: 50,
      height: 50
    },
    {
      url: "https://res.cloudinary.com/dw6xejg8r/image/upload/v1755389882/firebase_hh7ahe.png",
      alt: "Firebase",
      // width: 50,
      height: 50
    },
    {
      url: "https://res.cloudinary.com/dw6xejg8r/image/upload/v1755389888/sql_y2d6mh.png",
      alt: "Sql",
      // width: 50,
      height: 50
    },
    {
      url: "https://res.cloudinary.com/dw6xejg8r/image/upload/v1755391607/Github-desktop-logo-symbol.svg_kvr1zq.png",
      alt: "GitHub",
      // width: 50,
      height: 50
    },
    {
      url: "https://res.cloudinary.com/dw6xejg8r/image/upload/v1755389889/vercel_gjkmnx.png",
      alt: "Vercel",
      // width: 50,
      height: 50
    },
    {
      url: "https://res.cloudinary.com/dw6xejg8r/image/upload/v1755389884/hostinger_g2m20p.png",
      alt: "Hostinger",
      // width: 50,
      height: 50
    },
    {
      url: "https://res.cloudinary.com/dw6xejg8r/image/upload/v1755389887/render_wvzuiz.png",
      alt: "Render",
      // width: 50,
      height: 50
    }
  ],
  experience: [
    {
      company: "Wadibu",
      position: "CEO & Lead Developer",
      startDate: "1 Juin 2025",
      endDate: "Aujourd'hui",
      summary: [
        "Conception et développement complet des applications Wadibu : application client, application livreur, application restaurant (admin).",
        "Mise en place et déploiement du site web vitrine ainsi que de l’API backend, assurant la cohérence et la performance de l’ensemble de l’écosystème.",
        "Architecture, intégration et optimisation des fonctionnalités clés, en garantissant une base technique robuste prête pour une future publication sur les stores."
      ]
    },
    {
      company: "Ablele",
      position: "Développeur Mobile & Backend",
      startDate: "Octobre 2023",
      endDate: "Aujourd'hui",
      summary: [
        "Développement d’une application de gestion complète et d’une application de lavage auto, avec backend Laravel et frontend Flutter.",
        "Déploiement sur APK Pure, avec architecture et code prêts pour une future mise en ligne sur les stores officiels.",
        "Intégration d’outils modernes (Figma, Illustrator) pour la création d’interfaces attractives et la communication des concepts techniques."
      ]
    },
    {
      company: "Vague Digitale",
      position: "Développeur Frontend Laravel",
      startDate: "Avril 2023",
      endDate: "Octobre 2023",
      summary: [
        "Conception et développement d’une application de gestion avec Laravel, intégrant des fonctionnalités avancées pour optimiser la productivité.",
        "Création de supports visuels (Illustrator) et montage vidéo pour le marketing et la communication interne."
      ]
    },
    {
      company: "Weni Livraison",
      position: "Développeur Frontend Angular & WordPress",
      startDate: "Novembre 2021",
      endDate: "Avril 2021",
      summary: [
        "Création et maintenance du site vitrine de l’entreprise et d’un site e-commerce avec Angular et WordPress.",
        "Réalisation d’affiches publicitaires (Illustrator, Photoshop) et de vidéos promotionnelles pour renforcer la notoriété.",
        "Gestion de la page Facebook (community management) et animation de la communauté.",
        "Gestion de la flotte téléphonique des livreurs et support opérationnel.",
        "Maintenance et amélioration de l’application web interne avec Vue.js."
      ]
    }
  ],
  projects: [
    {
      name: "Wadibu Site web",
      summary: "Plateforme en ligne présentant l’écosystème Wadibu et ses services",
      linkPreview: "https://www.wadibu.ci",
      linkSource: "/",
      image: "/wadibu.png",
    },
    {
      name: "Wadibu Apps",
      summary: "Suite d’applications dédiée à la livraison et à la restauration",
      linkPreview: "/",
      linkSource: "/",
      image: "/app_wadibu.png",
    },
    {
      name: "MotoTrack-AI",
      summary: "Application pensée pour optimiser les courses tout en plaçant la sécurité et le bien-être des livreurs",
      linkPreview: "/",
      linkSource: "/",
      image: "/moto_track.png",
    },
    {
      name: "Aboutik App",
      summary: "Application de gestion de stock multi-magasins développée avec Laravel et Flutter.",
      linkPreview: "https://apkpure.com/aboutik/com.example.ashop",
      linkSource: "/",
      image: "/aboutik.jpg",
    },
    {
      name: "djaxa .r",
      summary: "Application de gestion spécialisée pour les ateliers de réparation de téléphones.",
      linkPreview: "/",
      linkSource: "/",
      image: "/djaxa.png",
    },
    {
      name: "Weni CI",
      summary: "Weni te permet d’envoyer des colis facilement sans bouger de chez toi",
      linkPreview: "https://weni.ci",
      linkSource: "/",
      image: "/weni.png",
    },
  ],
  about: {
    description: `
      Je suis développeur mobile et web, passionné par la création d’expériences simples, efficaces et agréables à utiliser.
      J’aime autant concevoir des applications Android et iOS que développer des sites et applications web performants.
      Mon objectif : proposer des solutions utiles, bien pensées et fiables, qui répondent vraiment aux besoins des utilisateurs.
      Chaque projet est pour moi l’occasion d’allier créativité et technique, avec un soin particulier apporté à la performance, à la sécurité et à l’évolutivité.
    `,
    image: "/me-small.png",
  },
};

// #5755ff
