import type { T } from "./career";

/**
 * Les fiches Play Store des applis, reprises telles quelles (nom, phrases,
 * captures) depuis le dossier `design/play-store*` de chaque projet.
 * Fichier généré : le texte long n'existe qu'en français, comme la fiche.
 */
export interface StoreApp {
  id: string;
  product: "wadibu" | "resi";
  name: string;
  role: T;
  brief: T;
  icon: string;
  banner: string;
  shots: { src: string; label: T }[];
  intro: string[];
  sections: { title: string; bullets: string[]; text: string }[];
  outro: string[];
}

export const STORE_APPS: StoreApp[] = [
  {
    id: "wadibu-client",
    product: "wadibu",
    name: "Wadibu : repas et colis",
    role: {
      fr: "Appli client",
      en: "Customer app",
    },
    brief: {
      fr: "Repas et colis livrés, même en commandant à la voix. Wave ou espèces.",
      en: "Meals and parcels delivered, even when you order by voice. Wave or cash.",
    },
    icon: "/stores/wadibu-client/icone.png",
    banner: "/stores/wadibu-client/presentation.jpg",
    shots: [
      {
        src: "/stores/wadibu-client/telephone-01-accueil.jpg",
        label: {
          fr: "Accueil",
          en: "Home",
        },
      },
      {
        src: "/stores/wadibu-client/telephone-02-voix.jpg",
        label: {
          fr: "Commande à la voix",
          en: "Voice ordering",
        },
      },
      {
        src: "/stores/wadibu-client/telephone-03-colis.jpg",
        label: {
          fr: "Colis",
          en: "Parcels",
        },
      },
      {
        src: "/stores/wadibu-client/telephone-04-restaurants.jpg",
        label: {
          fr: "Restaurants",
          en: "Restaurants",
        },
      },
      {
        src: "/stores/wadibu-client/telephone-05-plat.jpg",
        label: {
          fr: "Plat",
          en: "Dish",
        },
      },
      {
        src: "/stores/wadibu-client/telephone-06-budget.jpg",
        label: {
          fr: "Selon mon budget",
          en: "By budget",
        },
      },
      {
        src: "/stores/wadibu-client/telephone-07-paiement.jpg",
        label: {
          fr: "Paiement",
          en: "Payment",
        },
      },
    ],
    intro: [
      "Wadibu livre vos repas et vos colis en Côte d'Ivoire. Une seule appli pour commander à manger dans les restaurants de votre ville ou faire porter un colis d'un quartier à l'autre, en touchant l'écran ou simplement en parlant.",
    ],
    sections: [
      {
        title: "Commander à la voix",
        bullets: [
          "Touchez le micro et dites ce que vous voulez manger : « un poulet piqué, s'il vous plaît ».",
          "Wadibu vous lit à voix haute les plats disponibles et leurs prix, avec leur photo à l'écran.",
          "Dites le numéro du plat, validez, puis choisissez Wave ou espèces.",
          "Un mot mal compris ? Wadibu vous propose le plat le plus proche et vous demande si c'est bien ça.",
          "Pensé pour celles et ceux qui préfèrent parler plutôt que lire.",
        ],
        text: "",
      },
      {
        title: "Commander un repas",
        bullets: [
          "Dès l'accueil : votre commande en cours et votre dernier plat, à recommander d'un toucher.",
          "Parcourez les restaurants partenaires, leurs plats du jour et les plats les plus commandés.",
          "Filtrez par catégorie : attiéké, alloco, burgers, desserts, boissons…",
          "Choisissez la portion ou l'option qui vous convient : le prix se met à jour tout de suite.",
          "Restaurant fermé ? Programmez la livraison sur un créneau de son choix.",
          "Retrouvez vos commandes et leur avancement dans l'onglet Commandes.",
        ],
        text: "",
      },
      {
        title: "Commande sur mesure",
        bullets: [
          "Commander selon mon budget : indiquez combien vous voulez dépenser et pour combien de personnes. Wadibu vous propose les plats de sa cuisine qui tiennent dans ce budget, livraison et frais compris, et vous dit ce qu'il vous reste.",
          "Composer mon plat : choisissez vous-même chaque élément de votre plat, le prix suit vos choix.",
          "Suggérer un plat : dites-nous ce que vous aimeriez trouver dans l'appli.",
        ],
        text: "",
      },
      {
        title: "Envoyer un colis",
        bullets: [
          "Une conversation remplace le formulaire : une question à la fois, vous touchez la réponse et Wadibu passe à la suivante.",
          "Vous préférez parler ? Répondez à voix haute, l'appli comprend petit, moyen ou grand, le quartier et le numéro.",
          "Taille, contenu, quartiers de départ et d'arrivée, destinataire : tout est récapitulé, prix compris, avant de valider.",
          "Un livreur Wadibu récupère le colis et le remet à votre destinataire.",
        ],
        text: "",
      },
      {
        title: "Payer comme vous voulez",
        bullets: [
          "Wave, directement depuis l'appli (2 % de frais de paiement, affichés avant de valider).",
          "Espèces, à la livraison.",
          "Codes promo acceptés au moment de payer.",
        ],
        text: "Le total à payer est toujours affiché avant la validation, livraison comprise.",
      },
      {
        title: "Et aussi",
        bullets: [
          "Assistance par WhatsApp, appel ou SMS, depuis l'accueil.",
          "Thème clair ou sombre.",
          "Partage d'un plat avec vos proches.",
          "Restaurateurs partenaires : un espace dédié pour gérer vos plats et suivre vos ventes.",
        ],
        text: "",
      },
    ],
    outro: ["Wadibu, c'est la livraison simple, près de chez vous."],
  },
  {
    id: "wadibu-livreur",
    product: "wadibu",
    name: "Wadibu Livreur",
    role: {
      fr: "Appli livreur",
      en: "Courier app",
    },
    brief: {
      fr: "L'appli des livreurs Wadibu : courses repas et colis, gains du jour et solde.",
      en: "The Wadibu couriers' app: meal and parcel runs, today's earnings and balance.",
    },
    icon: "/stores/wadibu-livreur/icone.png",
    banner: "/stores/wadibu-livreur/presentation.jpg",
    shots: [
      {
        src: "/stores/wadibu-livreur/telephone-01-journee.jpg",
        label: {
          fr: "Ma journée",
          en: "My day",
        },
      },
      {
        src: "/stores/wadibu-livreur/telephone-02-commande-repas.jpg",
        label: {
          fr: "Commande repas",
          en: "Meal order",
        },
      },
      {
        src: "/stores/wadibu-livreur/telephone-03-colis.jpg",
        label: {
          fr: "Colis",
          en: "Parcels",
        },
      },
      {
        src: "/stores/wadibu-livreur/telephone-04-portefeuille.jpg",
        label: {
          fr: "Portefeuille",
          en: "Wallet",
        },
      },
      {
        src: "/stores/wadibu-livreur/telephone-05-encaissement.jpg",
        label: {
          fr: "Encaissement",
          en: "Cash collection",
        },
      },
    ],
    intro: [
      "Wadibu Livreur est l'application des livreurs partenaires de Wadibu, le service de livraison de repas et de colis en Côte d'Ivoire.",
      "L'accès est réservé aux livreurs Wadibu : votre compte est créé par l'équipe Wadibu, vous vous connectez avec les identifiants qu'elle vous remet.",
    ],
    sections: [
      {
        title: "Votre journée en un coup d'œil",
        bullets: [
          "Le montant de la journée, le nombre de courses et votre part, mis à jour à chaque course.",
          "Un bouton pour masquer les montants quand vous le souhaitez.",
          "Deux onglets : les commandes de repas et les courses de colis du jour.",
        ],
        text: "",
      },
      {
        title: "Les courses repas",
        bullets: [
          "Suivez chaque commande étape par étape : reçue, acceptée, prête à récupérer, en route, livrée.",
          "Voyez le restaurant où récupérer la commande, les plats et leurs quantités.",
          "Appelez le restaurant ou le client et ouvrez l'itinéraire d'un geste.",
        ],
        text: "",
      },
      {
        title: "Les courses colis",
        bullets: [
          "Point de collecte et point de livraison, avec le nom et le numéro de chaque contact.",
          "Touchez le numéro pour appeler, l'adresse pour lancer l'itinéraire.",
          "Détails du colis : description, poids estimé, type, colis fragile.",
        ],
        text: "",
      },
      {
        title: "Encaissement clair",
        bullets: [
          "Pour chaque course, l'appli affiche le montant exact à encaisser en espèces, ou indique que le client a déjà payé en ligne par Wave.",
          "Votre part du jour s'affiche sur l'accueil, celle de chaque colis sur sa fiche.",
        ],
        text: "",
      },
      {
        title: "Votre portefeuille",
        bullets: [
          "Votre solde toujours visible sur l'accueil, avec une alerte quand il devient bas.",
          "Rechargez-le par Wave directement depuis l'appli.",
          "Demandez un retrait : l'équipe Wadibu vous envoie la somme par Wave.",
          "Chaque mouvement est expliqué : votre part d'une course payée par Wave, la commission d'une course payée en espèces, vos recharges et vos retraits.",
        ],
        text: "",
      },
      {
        title: "Terminer une course",
        bullets: [
          "Une fois la commande remise, glissez « Terminer » : la course est marquée livrée.",
        ],
        text: "",
      },
      {
        title: "Toujours prévenu",
        bullets: [
          "Une notification vous avertit dès qu'une nouvelle course vous est confiée.",
          "L'historique de vos courses reste consultable à tout moment.",
        ],
        text: "",
      },
    ],
    outro: [],
  },
  {
    id: "resi-pro",
    product: "resi",
    name: "Resi Pro - Gestion locative",
    role: {
      fr: "Appli propriétaire",
      en: "Owner app",
    },
    brief: {
      fr: "Réservations, clients, dépenses et revenus de vos résidences. Même hors ligne.",
      en: "Bookings, guests, expenses and revenue for your residences. Even offline.",
    },
    icon: "/stores/resi-pro/icone.png",
    banner: "/stores/resi-pro/presentation.jpg",
    shots: [
      {
        src: "/stores/resi-pro/telephone-01-accueil.jpg",
        label: {
          fr: "Accueil",
          en: "Home",
        },
      },
      {
        src: "/stores/resi-pro/telephone-02-hors-ligne.jpg",
        label: {
          fr: "Hors ligne",
          en: "Offline",
        },
      },
      {
        src: "/stores/resi-pro/telephone-03-planning.jpg",
        label: {
          fr: "Planning",
          en: "Planning",
        },
      },
      {
        src: "/stores/resi-pro/telephone-04-finances.jpg",
        label: {
          fr: "Finances",
          en: "Finances",
        },
      },
      {
        src: "/stores/resi-pro/telephone-05-sombre.jpg",
        label: {
          fr: "Mode sombre",
          en: "Dark mode",
        },
      },
    ],
    intro: [
      "Resi Pro est l’application des propriétaires de résidences meublées. Réservations en ligne et au comptoir, carnet clients, dépenses et revenus : tout ce qui se passe à l’accueil, au même endroit, depuis votre téléphone.",
    ],
    sections: [
      {
        title: "Réservation au comptoir",
        bullets: [
          "Journée, demi-journée ou passage : le prix se calcule à partir du tarif journalier du logement.",
          "Tapez le numéro du client : Resi le retrouve dans votre carnet, ou le crée s’il vient pour la première fois.",
          "Les réservations faites par vos clients depuis l’application Resi arrivent dans la même liste. Chacune garde son canal : En ligne ou Comptoir.",
          "À l’arrivée d’un client Resi, scannez son code QR ou tapez son code PIN : la réservation s’ouvre aussitôt.",
        ],
        text: "Le client se présente, vous l’enregistrez sur place en quelques secondes.",
      },
      {
        title: "Le réseau coupe, l’accueil continue",
        bullets: [
          "La réservation est enregistrée sur le téléphone, puis envoyée automatiquement au retour du réseau.",
          "Logements, clients et réservations restent consultables pendant la coupure.",
          "Un envoi interrompu n’est jamais créé deux fois.",
          "Si la période a été prise entre-temps, Resi vous le signale : rien n’est écrasé, vous tranchez.",
        ],
        text: "Pas de connexion ? Continuez à travailler.",
      },
      {
        title: "Vos résidences et leurs logements",
        bullets: [
          "Regroupez studios, chambres-salons et appartements par résidence.",
          "Chaque logement garde son tarif, ses photos et ses réservations.",
          "Une période déjà réservée est refusée : fini les doubles réservations.",
        ],
        text: "",
      },
      {
        title: "Carnet clients",
        bullets: [
          "Chaque client est identifié par son téléphone : un doublon vous est signalé avant d’être créé.",
          "Historique des séjours et total payé sur une seule fiche.",
          "Pièce d’identité recto verso, facultative : Resi vous rappelle celles qui manquent.",
          "Appelez ou écrivez sur WhatsApp en un geste.",
        ],
        text: "",
      },
      {
        title: "Dépenses, revenus et statistiques",
        bullets: [
          "Saisissez vos dépenses au fil de l’eau, par bien et par catégorie.",
          "Bénéfice net, chiffre d’affaires et taux d’occupation, mois par mois et par résidence.",
          "Un séjour à cheval sur deux mois est réparti au prorata des jours.",
          "Rapports PDF à partager ou imprimer, factures envoyées sur WhatsApp.",
        ],
        text: "",
      },
      {
        title: "Gérants",
        bullets: [],
        text: "Confiez l’accueil sans confier votre compte. Un gérant enregistre les réservations et les dépenses des seuls logements que vous lui confiez. Il ne voit rien d’autre, et tout ce qu’il saisit reste à votre nom.",
      },
      {
        title: "Abonnement",
        bullets: [
          "14 jours d’essai gratuit, avec toutes les fonctions.",
          "Ensuite, choisissez votre forfait, payé avec Wave depuis l’application. Les fonctions disponibles dépendent du forfait choisi.",
          "Aucun prélèvement automatique : vous renouvelez quand vous le souhaitez.",
        ],
        text: "",
      },
    ],
    outro: [
      "Pensée pour les résidences meublées d’Afrique de l’Ouest, en français et en anglais, en mode clair ou sombre.",
      "Une question ? Écrivez-nous depuis l’application, rubrique Aide & support.",
    ],
  },
  {
    id: "resi-client",
    product: "resi",
    name: "Resi - Résidences meublées",
    role: {
      fr: "Appli client",
      en: "Guest app",
    },
    brief: {
      fr: "Trouvez une résidence meublée, négociez le prix et payez avec Wave.",
      en: "Find a furnished residence, negotiate the price and pay with Wave.",
    },
    icon: "/stores/resi-client/icone.png",
    banner: "/stores/resi-client/presentation.jpg",
    shots: [
      {
        src: "/stores/resi-client/telephone-01-carte.jpg",
        label: {
          fr: "Carte",
          en: "Map",
        },
      },
      {
        src: "/stores/resi-client/telephone-02-decouverte.jpg",
        label: {
          fr: "Découverte",
          en: "Discover",
        },
      },
      {
        src: "/stores/resi-client/telephone-03-fiche.jpg",
        label: {
          fr: "Fiche logement",
          en: "Listing",
        },
      },
      {
        src: "/stores/resi-client/telephone-04-paiement.jpg",
        label: {
          fr: "Paiement",
          en: "Payment",
        },
      },
      {
        src: "/stores/resi-client/telephone-05-arrivee.jpg",
        label: {
          fr: "Arrivée",
          en: "Arrival",
        },
      },
    ],
    intro: [
      "Resi vous aide à trouver une résidence meublée pour une nuit, un week-end ou un long séjour. Studios, appartements, villas et duplex : comparez, négociez, réservez et payez avec Wave, sans quitter l’application.",
    ],
    sections: [
      {
        title: "Trouvez autour de vous",
        bullets: [
          "Les résidences à proximité s’affichent sur la carte, autour de votre position ou dans le quartier de votre choix.",
          "Une sélection à la une pour découvrir les logements du moment.",
          "Cherchez par ville, pour ce soir, ce week-end ou les dates de votre choix.",
          "Filtrez par type de logement, budget par jour, nombre de chambres et surface. Triez par recommandation, distance ou prix.",
        ],
        text: "",
      },
      {
        title: "Balayez, trouvez votre coup de cœur",
        bullets: [
          "Parcourez les résidences en photos plein écran : un geste pour passer, un geste pour aimer.",
          "Retrouvez vos résidences préférées dans vos favoris.",
          "Sur chaque fiche : photos, équipements (climatisation, Wi-Fi, parking, piscine, gardiennage…), description, tarifs et emplacement.",
        ],
        text: "",
      },
      {
        title: "Négociez le prix",
        bullets: [],
        text: "Le propriétaire a prévu des prix réduits ? Demandez une meilleure offre directement depuis la fiche du logement, palier après palier, puis réservez au prix qui vous convient. Un logement à prix fixe vous est signalé d’emblée.",
      },
      {
        title: "Réservez sans mauvaise surprise",
        bullets: [
          "Choisissez vos dates d’arrivée et de départ : le total s’affiche avant de payer.",
          "Les longs séjours profitent automatiquement d’une remise de durée quand le propriétaire en propose une.",
          "Un code promo ? Il s’applique au moment de payer.",
          "Les dates déjà prises ne sont pas proposées : pas de double réservation.",
        ],
        text: "",
      },
      {
        title: "Payez avec Wave",
        bullets: [
          "Réglez votre séjour en direct avec Wave, depuis l’application.",
          "Payez la totalité, ou versez un acompte et réglez le reste au propriétaire à votre arrivée, quand il le propose.",
          "Le paiement est vérifié auprès de Wave avant de confirmer votre réservation.",
          "Votre reçu est disponible aussitôt, et l’adresse exacte du logement vous est communiquée après réservation.",
        ],
        text: "",
      },
      {
        title: "Votre carte d’arrivée",
        bullets: [],
        text: "Le jour J, ouvrez « Démarrer mon séjour » : un code QR et un code PIN à présenter au propriétaire. La carte s’affiche même sans réseau, et vous rappelle le solde éventuel à régler sur place.",
      },
      {
        title: "Mes réservations",
        bullets: [],
        text: "Tous vos séjours au même endroit, avec leur état : payée, en attente de paiement ou annulée. Un paiement interrompu peut être repris en un geste.",
      },
      {
        title: "Parrainage",
        bullets: [],
        text: "Recommandez Resi à vos proches avec votre code de parrainage, partagé sur WhatsApp en un geste. Suivez vos filleuls et vos gains depuis l’application.",
      },
    ],
    outro: [
      "Connexion par téléphone, e-mail ou compte Google. Application en français et en anglais, en mode clair ou sombre.",
      "Vous êtes propriétaire d’une résidence ? Gérez-la avec l’application Resi Pro.",
    ],
  },
];
