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
    traces: "Traces",
    work: "Projets",
    skills: "Compétences",
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
    lead: "Je livre des produits entiers : l'API, l'app mobile et le web qui vont avec, pensés pour un réseau qui coupe et des paiements par Wave.",
    available: "Ouvert aux missions et aux postes",
    copy: "Copier l'adresse",
    copied: "Adresse copiée",
  },
  career: {
    title: "Parcours",
    lead: "Chaque barre est une période, posée sur l'axe du temps. Ouvrez-en une pour lire ses attributs.",
    now: "aujourd'hui",
    present: "en cours",
    kinds: { job: "Poste", project: "Produit", study: "Formation" },
    close: "Fermer",
  },
  traces: {
    title: "Trois requêtes, suivies de bout en bout",
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
    lead: "Applications et sites livrés pour des clients ou pour moi-même.",
    open: "Voir",
    noLink: "Pas de lien public",
    columns: { name: "Projet", kind: "Type", stack: "Stack" },
    kinds: { web: "Web", mobile: "Mobile" },
  },
  skills: {
    title: "Compétences, couche par couche",
    lead: "Ce que je sais faire, rangé comme dans les traces : de la page au disque, en passant par le réseau.",
  },
  blog: {
    title: "Blog",
    lead: "Notes de terrain : ce que j'ai mis en production, ce qui a cassé et comment je l'ai réparé.",
    latest: "Derniers articles",
    all: "Tous les articles",
    read: "Lire l'article",
    back: "Retour au blog",
    minutes: "min de lecture",
    empty: "Aucun article pour l'instant.",
    inFrench: "en français",
    inEnglish: "in English",
  },
  contact: {
    title: "Écrivez-moi",
    lead: "Un projet, une mission, une question sur un article. Je réponds sous 48 heures.",
    name: "Votre nom",
    email: "Votre adresse e-mail",
    message: "Votre message",
    send: "Envoyer le message",
    sending: "Envoi en cours",
    sent: "Message envoyé. Je vous réponds sous 48 heures.",
    queued: "Pas de réseau : message gardé sur cet appareil, il partira dès le retour de la connexion.",
    flushed: "Réseau revenu : votre message en attente est parti.",
    error: "L'envoi a échoué. Réessayez, ou écrivez directement à l'adresse ci-dessous.",
    invalid: "Renseignez votre nom, une adresse e-mail valide et un message d'au moins 10 caractères.",
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
    traces: "Traces",
    work: "Projects",
    skills: "Skills",
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
    lead: "I ship whole products: the API, the mobile app and the web around them, built for networks that drop and payments through Wave.",
    available: "Open to contracts and full-time roles",
    copy: "Copy address",
    copied: "Address copied",
  },
  career: {
    title: "Career",
    lead: "Each bar is a period on the time axis. Open one to read its attributes.",
    now: "today",
    present: "ongoing",
    kinds: { job: "Role", project: "Product", study: "Education" },
    close: "Close",
  },
  traces: {
    title: "Three requests, traced end to end",
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
    lead: "Apps and websites shipped for clients or for myself.",
    open: "Open",
    noLink: "No public link",
    columns: { name: "Project", kind: "Type", stack: "Stack" },
    kinds: { web: "Web", mobile: "Mobile" },
  },
  skills: {
    title: "Skills, layer by layer",
    lead: "What I can do, sorted like the traces: from the page to the disk, through the network.",
  },
  blog: {
    title: "Blog",
    lead: "Field notes: what I put in production, what broke and how I fixed it.",
    latest: "Latest posts",
    all: "All posts",
    read: "Read the post",
    back: "Back to the blog",
    minutes: "min read",
    empty: "No posts yet.",
    inFrench: "in French",
    inEnglish: "in English",
  },
  contact: {
    title: "Write to me",
    lead: "A project, a contract, a question about a post. I reply within 48 hours.",
    name: "Your name",
    email: "Your email address",
    message: "Your message",
    send: "Send message",
    sending: "Sending",
    sent: "Message sent. I'll reply within 48 hours.",
    queued: "No network: your message is kept on this device and will leave as soon as you're back online.",
    flushed: "Back online: your pending message has been sent.",
    error: "Sending failed. Try again, or write directly to the address below.",
    invalid: "Enter your name, a valid email address and a message of at least 10 characters.",
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
