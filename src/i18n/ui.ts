export type Lang = "fr" | "en";

export const LANGS: Lang[] = ["fr", "en"];

/** Préfixe d'URL d'une langue : le français est servi à la racine. */
export const base = (lang: Lang) => (lang === "fr" ? "" : "/en");

export const langFromPath = (pathname: string): Lang =>
  pathname === "/en" || pathname.startsWith("/en/") ? "en" : "fr";

/**
 * Dictionnaire de référence : sa forme fixe le type `Ui`, que `en` doit
 * respecter clé pour clé — une clé oubliée casse le typage au lieu
 * d'afficher un trou.
 */
const fr = {
  meta: {
    title: "Stéphane Konan, ingénieur logiciel",
    description:
      "Je conçois et livre des produits entiers, de l'API Go ou AdonisJS à l'app Flutter et au web : Wadibu (livraison) et Resi (gestion locative, hors ligne).",
  },
  nav: {
    label: "Navigation principale",
    how: "Comment ça marche",
    work: "Réalisations",
    skills: "Savoir-faire",
    blog: "Blog",
    contact: "Contact",
    switchTo: "English",
    switchHref: "/en",
    open: "Ouvrir le menu",
    close: "Fermer le menu",
  },
  theme: {
    label: "Thème",
    system: "Suivre le système",
    light: "Clair",
    dark: "Sombre",
  },
  network: {
    online: "En ligne",
    offline: "Hors ligne, page servie depuis le cache",
  },
  hero: {
    role: "Ingénieur logiciel",
    headline: "Je crée des applications et des sites qui marchent, même quand le réseau coupe.",
    lead: "De l'idée jusqu'à l'application dans votre poche, je m'occupe de tout : l'écran, les paiements par Wave et tout ce qui tourne en coulisses.",
    ctaProject: "Parler de mon projet",
    ctaWork: "Voir mes réalisations",
    available: "Ouvert aux missions et aux postes",
    copy: "Copier l'adresse",
    copied: "Adresse copiée",
    /** Étiquettes courtes de la pile 3D de l'ouverture. */
    layers: { web: "L'écran", mobile: "Le téléphone", infra: "Le trajet", api: "Le cerveau", data: "La mémoire" },
    scroll: "Défiler",
    /** Le téléphone 3D montre mes vraies applications, une par étape du défilement. */
    apps: {
      hint: "Mes applications, en vrai",
      wadibu: "Commander un repas ou envoyer un colis",
      resi: "Gérer ses résidences meublées",
      aboutik: "Tenir ses boutiques et sa caisse",
      djaxa: "Suivre un atelier de réparation",
    },
  },
  how: {
    title: "Ce qui se passe quand vous appuyez sur « Commander »",
    lead: "Une application, c'est un peu un restaurant. Suivez une commande, de votre doigt jusqu'au reçu.",
    tap: "Commander",
    steps: [
      {
        name: "L'écran",
        analogy: "La vitrine",
        title: "Vous appuyez sur un bouton",
        body: "Tout commence sur votre écran : un site ou une application, clair et rapide, même sur un petit téléphone.",
      },
      {
        name: "Le trajet",
        analogy: "Le coursier",
        title: "Votre demande voyage sur Internet",
        body: "Elle part, protégée. Si le réseau coupe en chemin, l'application la garde et la renvoie dès qu'il revient.",
      },
      {
        name: "Le cerveau",
        analogy: "Le cuisinier",
        title: "Le serveur vérifie et décide",
        body: "Il contrôle le prix, le stock et le paiement par Wave, puis prévient la bonne personne : le livreur, le vendeur, le gérant.",
      },
      {
        name: "La mémoire",
        analogy: "Le carnet de commandes",
        title: "Tout est noté",
        body: "La commande est enregistrée et sauvegardée, pour être retrouvée, suivie et comptée plus tard.",
      },
      {
        name: "La réponse",
        analogy: "Le reçu",
        title: "La confirmation revient",
        body: "Quelques instants plus tard, votre écran affiche : commande confirmée.",
      },
    ],
    outro: "Je construis chacune de ces étapes, de l'écran à la mémoire. C'est ce qu'on appelle un développeur « full-stack ».",
  },
  showcase: {
    title: "Réalisations",
    lead: "Trois produits que j'ai construits de bout en bout, utilisés pour de vrai en Côte d'Ivoire.",
    kinds: { resi: "Location meublée", wadibu: "Livraison de colis et de repas", aboutik: "Gestion de boutiques" },
    /** Présentations en mots simples ; le détail technique reste dans « Sous le capot ». */
    pitch: {
      resi: "Pour les résidences meublées en Côte d'Ivoire : réservations en ligne ou au comptoir, carnet de clients, dépenses et revenus. Quand le réseau coupe, l'accueil continue.",
      wadibu: "Livraison de colis et de repas à Agboville : une application pour les clients, une pour les livreurs, un site de commande et une console pour l'équipe.",
      aboutik: "Pour les boutiques à plusieurs magasins, réalisée chez Ablele : produits, stocks, ventes en caisse, clients et trésorerie, avec des abonnements payés par Mobile Money.",
    },
    visit: "Voir le projet",
    unpublished: "Bientôt en ligne",
    drag: "Faites défiler",
  },
  career: {
    title: "Parcours",
    lead: "Chaque barre est une période de ma vie professionnelle. Touchez-en une pour en savoir plus.",
    now: "aujourd'hui",
    present: "en cours",
    kinds: { job: "Poste", project: "Produit", study: "Formation" },
    close: "Fermer",
  },
  traces: {
    title: "Sous le capot",
    kicker: "Pour les développeurs",
    lead: "Une trace montre le chemin d'une requête à travers chaque couche. Voici celles de trois produits que j'ai construits, avec les vrais noms du code. Provoquez une coupure ou une vente concurrente pour voir comment chacun tient.",
    tabsLabel: "Choisir une trace",
    play: "Lancer la requête",
    replay: "Rejouer",
    layers: { web: "Web", mobile: "Mobile", api: "API", infra: "Réseau", data: "Données" },
    attributes: "Attributs du span",
    pickSpan: "Sélectionnez un span pour lire ce qu'il fait et pourquoi.",
    surfaces: "Surfaces livrées",
    figures: "En chiffres",
    stack: "Stack",
    visit: "Voir le projet",
    unpublished: "Publication en cours",
  },
  work: {
    title: "Autres projets",
    lead: "Applications et sites livrés pour des clients ou pour moi-même. Survolez un nom pour voir le projet.",
    open: "Voir",
    noLink: "Pas de lien public",
    columns: { name: "Projet", kind: "Type", stack: "Stack" },
    kinds: { web: "Web", mobile: "Mobile" },
  },
  skills: {
    title: "Savoir-faire",
    lead: "Ce que je sais faire, étape par étape, avec les outils que j'utilise pour chacune.",
    tools: "Outils",
    plain: {
      web: "Des sites et des espaces d'administration rapides, clairs sur tous les écrans.",
      mobile: "Des applications pour téléphone qui continuent de marcher sans réseau.",
      infra: "Un site toujours en ligne, protégé des attaques, avec des adresses e-mail professionnelles.",
      api: "Le cerveau qui relie tout : comptes, paiements Wave, SMS et notifications.",
      data: "Les informations rangées et sauvegardées, sur le serveur comme sur le téléphone.",
    },
  },
  blog: {
    title: "Blog",
    lead: "Notes de terrain : ce que j'ai mis en production, ce qui a cassé et comment je l'ai réparé.",
    latest: "Derniers articles",
    all: "Tous les articles",
    read: "Lire l'article",
    back: "Retour au blog",
    minutes: "min de lecture",
    listen: "Écouter l'article",
    pause: "Pause",
    resume: "Reprendre",
    stop: "Arrêter la lecture",
    speed: "Vitesse de lecture",
    empty: "Aucun article pour l'instant.",
    inFrench: "en français",
    inEnglish: "in English",
  },
  contact: {
    title: "Parlons de votre projet",
    lead: "Un projet, une mission, une question sur un article. Je réponds sous 48 heures.",
    name: "Votre nom",
    email: "Votre adresse e-mail",
    phone: "Votre numéro WhatsApp",
    message: "Votre message",
    send: "Envoyer le message",
    sending: "Envoi en cours",
    sent: "Message envoyé. Je vous réponds sous 48 heures.",
    queued: "Pas de réseau : message gardé sur cet appareil, il partira dès le retour de la connexion.",
    flushed: "Réseau revenu : votre message en attente est parti.",
    error: "L'envoi a échoué. Réessayez, ou écrivez directement à l'adresse ci-dessous.",
    invalid:
      "Renseignez votre nom, un numéro WhatsApp valide, une adresse e-mail valide et un message d'au moins 10 caractères.",
    or: "Ou directement",
    whatsapp: "WhatsApp",
  },
  footer: {
    offline: "Ce site fonctionne hors ligne : coupez le réseau et rechargez la page.",
    built: "Conçu et développé par Stéphane Konan.",
  },
};

export type Ui = typeof fr;

const en: Ui = {
  meta: {
    title: "Stéphane Konan, Software Engineer",
    description:
      "I design and ship whole products, from the Go or AdonisJS API to the Flutter app and the web: Wadibu (delivery) and Resi (rental management, offline-first).",
  },
  nav: {
    label: "Main navigation",
    how: "How it works",
    work: "Work",
    skills: "Expertise",
    blog: "Blog",
    contact: "Contact",
    switchTo: "Français",
    switchHref: "/",
    open: "Open menu",
    close: "Close menu",
  },
  theme: {
    label: "Theme",
    system: "Follow system",
    light: "Light",
    dark: "Dark",
  },
  network: {
    online: "Online",
    offline: "Offline, page served from cache",
  },
  hero: {
    role: "Software Engineer",
    headline: "I build apps and websites that keep working, even when the network drops.",
    lead: "From the idea to the app in your pocket, I handle everything: the screen, Wave payments and all that runs behind the scenes.",
    ctaProject: "Talk about my project",
    ctaWork: "See my work",
    available: "Open to contracts and full-time roles",
    copy: "Copy address",
    copied: "Address copied",
    layers: { web: "The screen", mobile: "The phone", infra: "The journey", api: "The brain", data: "The memory" },
    scroll: "Scroll",
    apps: {
      hint: "My apps, for real",
      wadibu: "Order a meal or send a parcel",
      resi: "Run furnished residences",
      aboutik: "Run shops and the till",
      djaxa: "Track a repair workshop",
    },
  },
  how: {
    title: "What happens when you tap “Order”",
    lead: "An app is a bit like a restaurant. Follow one order, from your finger to the receipt.",
    tap: "Order",
    steps: [
      {
        name: "The screen",
        analogy: "The shop window",
        title: "You tap a button",
        body: "It all starts on your screen: a website or an app, clear and fast, even on a small phone.",
      },
      {
        name: "The journey",
        analogy: "The courier",
        title: "Your request travels over the Internet",
        body: "It leaves, protected. If the network drops on the way, the app keeps it and sends it again as soon as it is back.",
      },
      {
        name: "The brain",
        analogy: "The cook",
        title: "The server checks and decides",
        body: "It checks the price, the stock and the Wave payment, then alerts the right person: the courier, the seller, the manager.",
      },
      {
        name: "The memory",
        analogy: "The order book",
        title: "Everything is written down",
        body: "The order is recorded and backed up, so it can be found, tracked and counted later.",
      },
      {
        name: "The answer",
        analogy: "The receipt",
        title: "The confirmation comes back",
        body: "A moment later, your screen reads: order confirmed.",
      },
    ],
    outro: "I build every one of these steps, from the screen to the memory. That is what people call a “full-stack” developer.",
  },
  showcase: {
    title: "Work",
    lead: "Three products I built end to end, used for real in Côte d'Ivoire.",
    kinds: { resi: "Furnished rentals", wadibu: "Parcel and food delivery", aboutik: "Shop management" },
    pitch: {
      resi: "For furnished residences in Côte d'Ivoire: online or front-desk bookings, a client book, expenses and revenue. When the network drops, the front desk keeps going.",
      wadibu: "Parcel and food delivery in Agboville: an app for customers, one for couriers, an ordering website and a console for the team.",
      aboutik: "For shops with several stores, built at Ablele: products, stock, checkout sales, customers and cash, with subscriptions paid through Mobile Money.",
    },
    visit: "View the project",
    unpublished: "Coming soon",
    drag: "Keep scrolling",
  },
  career: {
    title: "Career",
    lead: "Each bar is a period of my working life. Tap one to learn more.",
    now: "today",
    present: "ongoing",
    kinds: { job: "Role", project: "Product", study: "Education" },
    close: "Close",
  },
  traces: {
    title: "Under the hood",
    kicker: "For developers",
    lead: "A trace shows a request's path through every layer. Here are three products I built, with the real names from the code. Trigger an outage or a concurrent sale to see how each one holds.",
    tabsLabel: "Choose a trace",
    play: "Send the request",
    replay: "Replay",
    layers: { web: "Web", mobile: "Mobile", api: "API", infra: "Network", data: "Data" },
    attributes: "Span attributes",
    pickSpan: "Select a span to read what it does and why.",
    surfaces: "Shipped surfaces",
    figures: "By the numbers",
    stack: "Stack",
    visit: "View the project",
    unpublished: "Release in progress",
  },
  work: {
    title: "Other projects",
    lead: "Apps and websites shipped for clients or for myself. Hover a name to see the project.",
    open: "Open",
    noLink: "No public link",
    columns: { name: "Project", kind: "Type", stack: "Stack" },
    kinds: { web: "Web", mobile: "Mobile" },
  },
  skills: {
    title: "Expertise",
    lead: "What I can do, step by step, with the tools I use for each one.",
    tools: "Tools",
    plain: {
      web: "Fast websites and admin spaces, clear on every screen.",
      mobile: "Phone apps that keep working without a network.",
      infra: "A site that stays online, protected from attacks, with professional email addresses.",
      api: "The brain that ties it all together: accounts, Wave payments, SMS and notifications.",
      data: "Information kept tidy and backed up, on the server as on the phone.",
    },
  },
  blog: {
    title: "Blog",
    lead: "Field notes: what I put in production, what broke and how I fixed it.",
    latest: "Latest posts",
    all: "All posts",
    read: "Read the post",
    back: "Back to the blog",
    minutes: "min read",
    listen: "Listen to this post",
    pause: "Pause",
    resume: "Resume",
    stop: "Stop reading",
    speed: "Reading speed",
    empty: "No posts yet.",
    inFrench: "in French",
    inEnglish: "in English",
  },
  contact: {
    title: "Let's talk about your project",
    lead: "A project, a contract, a question about a post. I reply within 48 hours.",
    name: "Your name",
    email: "Your email address",
    phone: "Your WhatsApp number",
    message: "Your message",
    send: "Send message",
    sending: "Sending",
    sent: "Message sent. I'll reply within 48 hours.",
    queued: "No network: your message is kept on this device and will leave as soon as you're back online.",
    flushed: "Back online: your pending message has been sent.",
    error: "Sending failed. Try again, or write directly to the address below.",
    invalid: "Enter your name, a valid WhatsApp number, a valid email address and a message of at least 10 characters.",
    or: "Or directly",
    whatsapp: "WhatsApp",
  },
  footer: {
    offline: "This site works offline: cut the network and reload the page.",
    built: "Designed and built by Stéphane Konan.",
  },
};

export const ui: Record<Lang, Ui> = { fr, en };

export const CONTACT = {
  email: "stephanekonan.dev@gmail.com",
  whatsapp: "https://wa.me/2250769883730",
  linkedin: "https://www.linkedin.com/in/st%C3%A9phane-konan-59120a199",
  github: "https://github.com/stephanekonan",
  tiktok: "https://www.tiktok.com/@stephanekonan69",
};
