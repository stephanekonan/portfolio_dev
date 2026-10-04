import type { T } from "./career";

export type Layer = "web" | "mobile" | "api" | "infra" | "data";

export interface Span {
  id: string;
  layer: Layer;
  /** Identifiant tel qu'il apparaît dans le code : on ne traduit pas un nom de fonction. */
  name: string;
  /** Début et durée en millisecondes simulées, relatifs au début de la trace. */
  start: number;
  duration: number;
  /** Profondeur dans l'arbre des appels, pour l'indentation. */
  depth: number;
  /** Vrai pour les spans qui attendent le réseau quand on l'a coupé. */
  afterGap?: boolean;
  what: T;
  why: T;
  where: string;
}

export interface Surface {
  layer: Layer;
  title: T;
  body: T;
  stack: string[];
  /** Un lien par langue quand le site cible est lui-même bilingue. */
  href?: string | T;
}

/**
 * Une attente que le visiteur peut provoquer : coupure réseau chez Resi,
 * verrou tenu par une vente concurrente chez Aboutik. Les spans `afterGap`
 * attendent qu'elle se lève.
 */
export interface TraceGap {
  icon: "network" | "lock";
  /** Bouton qui active l'attente pour la prochaine requête. */
  trigger: T;
  /** Bouton qui la lève pendant l'attente. Absent : reprise automatique. */
  release?: T;
  autoResumeMs?: number;
  /** Texte posé sur la zone hachurée. */
  label: T;
  /** Statut annoncé pendant l'attente. */
  waiting: T;
  /** Statut de fin quand la requête a attendu. */
  doneAfter: T;
}

export interface ProductTrace {
  id: "resi" | "wadibu" | "aboutik";
  product: string;
  scenario: T;
  pitch: T;
  gap?: TraceGap;
  /** Statut annoncé à la fin de la requête. */
  done: T;
  spans: Span[];
  figures: { value: string; label: T }[];
  surfaces: Surface[];
  /** `portrait` : capture d'app en hauteur, posée entière plutôt que recadrée. */
  image: { src: string; alt: T; portrait?: boolean };
  href?: string | T;
}

export const TRACES: ProductTrace[] = [
  {
    id: "resi",
    product: "Resi",
    scenario: {
      fr: "Une réservation prise au comptoir, réseau coupé",
      en: "A walk-in booking, taken with the network down",
    },
    pitch: {
      fr: "Gestion locative des résidences meublées en Côte d'Ivoire. Le propriétaire encaisse des réservations en ligne ou au comptoir, tient son carnet clients, suit dépenses et revenus. Quand le réseau coupe, l'accueil continue.",
      en: "Rental management for furnished residences in Côte d'Ivoire. Owners take bookings online or at the front desk, keep a client book and track expenses and revenue. When the network drops, the front desk keeps going.",
    },
    gap: {
      icon: "network",
      trigger: { fr: "Couper le réseau", en: "Cut the network" },
      release: { fr: "Rétablir le réseau", en: "Restore the network" },
      label: { fr: "réseau coupé", en: "network down" },
      waiting: { fr: "En attente de réseau", en: "Waiting for network" },
      doneAfter: {
        fr: "Réseau revenu, synchronisation terminée. 1 réservation transmise.",
        en: "Network back, sync complete. 1 booking sent.",
      },
    },
    done: { fr: "Synchronisation terminée. 1 réservation transmise.", en: "Sync complete. 1 booking sent." },
    spans: [
      {
        id: "r1",
        layer: "mobile",
        name: "AddReservationCubit.submit",
        start: 0,
        duration: 38,
        depth: 0,
        what: {
          fr: "Le gérant saisit le séjour : journée, demi-journée ou passage. Le prix découle du tarif journalier du logement.",
          en: "The manager enters the stay: full day, half day or short visit. The price comes from the unit's daily rate.",
        },
        why: {
          fr: "Le prix est figé dans la réservation (daily_price) : changer un tarif plus tard ne réécrit pas l'historique.",
          en: "The price is frozen in the booking (daily_price): changing a rate later never rewrites history.",
        },
        where: "mobile/lib/features/reservation/business_logic/add_reservation_cubit.dart",
      },
      {
        id: "r2",
        layer: "data",
        name: "pending_bookings.insert",
        start: 38,
        duration: 14,
        depth: 1,
        what: {
          fr: "La réservation entre dans la file SQLite du téléphone, avec un client_request_id (UUID).",
          en: "The booking enters the phone's SQLite queue, with a client_request_id (UUID).",
        },
        why: {
          fr: "L'UUID rend l'envoi idempotent : relancé après une coupure, il ne crée jamais la même réservation deux fois.",
          en: "The UUID makes the send idempotent: retried after an outage, it never creates the same booking twice.",
        },
        where: "mobile/lib/core/storage/app_database.dart",
      },
      {
        id: "r3",
        layer: "mobile",
        name: "SyncService.synchronize",
        start: 60,
        duration: 250,
        depth: 0,
        afterGap: true,
        what: {
          fr: "Au retour du réseau, la file se vide d'elle-même. Rien à relancer.",
          en: "When the network returns, the queue drains on its own. Nothing to retry.",
        },
        why: {
          fr: "La file se vide en série : deux réservations sur le même logement doivent s'ordonner, en parallèle l'issue serait indéterminée.",
          en: "The queue drains serially: two bookings on the same unit must be ordered, in parallel the outcome would be undefined.",
        },
        where: "mobile/lib/core/sync/sync_service.dart",
      },
      {
        id: "r4",
        layer: "api",
        name: "ProprioBookingController.store",
        start: 78,
        duration: 196,
        depth: 1,
        afterGap: true,
        what: {
          fr: "Middleware JWT, contrôle du rôle, validation VineJS, puis délégation au use case.",
          en: "JWT middleware, role check, VineJS validation, then hand-off to the use case.",
        },
        why: {
          fr: "Le contrôleur reste fin : il valide, délègue et répond { data }. Aucune règle métier, aucun accès Firestore à ce niveau.",
          en: "The controller stays thin: it validates, delegates and returns { data }. No business rule, no Firestore access at this level.",
        },
        where: "api/app/controllers/proprio/booking_controller.ts",
      },
      {
        id: "r5",
        layer: "api",
        name: "create_owner_booking.use_case",
        start: 104,
        duration: 128,
        depth: 2,
        afterGap: true,
        what: {
          fr: "Vérifie que la période est libre et que ce client_request_id n'a pas déjà été traité.",
          en: "Checks the period is free and that this client_request_id hasn't been processed already.",
        },
        why: {
          fr: "Une période prise entre-temps renvoie un 409 : c'est un conflit que le propriétaire arbitre, pas une panne à réessayer.",
          en: "A period taken in the meantime returns a 409: a conflict for the owner to settle, not a failure to retry.",
        },
        where: "api/app/features/bookings/use_cases/create_owner_booking.use_case.ts",
      },
      {
        id: "r6",
        layer: "data",
        name: "booking_repository.create",
        start: 176,
        duration: 46,
        depth: 3,
        afterGap: true,
        what: {
          fr: "Écriture Firestore avec un instantané du client et du prix au moment de la réservation.",
          en: "Firestore write with a snapshot of the client and price at booking time.",
        },
        why: {
          fr: "Renommer une fiche client ne doit pas réécrire les séjours passés : client_snapshot fige ce qui a été vendu.",
          en: "Renaming a client must not rewrite past stays: client_snapshot freezes what was sold.",
        },
        where: "api/app/features/bookings/repositories/booking_repository.ts",
      },
      {
        id: "r7",
        layer: "mobile",
        name: "SyncReport",
        start: 284,
        duration: 26,
        depth: 1,
        afterGap: true,
        what: {
          fr: "Le téléphone affiche le bilan : transmises, refusées, encore en attente.",
          en: "The phone shows the outcome: sent, refused, still waiting.",
        },
        why: {
          fr: "Le propriétaire doit voir ce qui est parti sans fouiller : un refus arrive avec la période en conflit.",
          en: "The owner should see what went through at a glance: a refusal comes with the conflicting period.",
        },
        where: "mobile/lib/core/sync/sync_service.dart",
      },
    ],
    figures: [
      { value: "139", label: { fr: "routes d'API", en: "API routes" } },
      { value: "110", label: { fr: "use cases métier", en: "business use cases" } },
      { value: "80", label: { fr: "fichiers de tests Japa", en: "Japa test files" } },
      { value: "33", label: { fr: "écrans Flutter", en: "Flutter screens" } },
    ],
    surfaces: [
      {
        layer: "mobile",
        title: { fr: "App propriétaire et gérant", en: "Owner and manager app" },
        body: {
          fr: "Saisie hors ligne, carnet clients avec scan des pièces d'identité, rapports PDF et factures WhatsApp, thèmes clair et sombre.",
          en: "Offline entry, client book with ID scanning, PDF reports and WhatsApp invoices, light and dark themes.",
        },
        stack: ["Flutter", "Cubit", "auto_route", "SQLite", "ML Kit", "FCM"],
      },
      {
        layer: "api",
        title: { fr: "API REST", en: "REST API" },
        body: {
          fr: "Découpage par feature, trois rôles plus les gérants, refresh token à usage unique, abonnements réglés par Wave.",
          en: "Feature-sliced, three roles plus managers, single-use refresh tokens, subscriptions paid through Wave.",
        },
        stack: ["AdonisJS 7", "TypeScript", "Firestore", "VineJS", "Japa"],
      },
      {
        layer: "web",
        title: { fr: "Site public et back-office", en: "Public site and back-office" },
        body: {
          fr: "Site bilingue avec démo de coupure réseau. Back-office admin en backend-for-frontend : les jetons ne quittent jamais les cookies httpOnly.",
          en: "Bilingual site with a network-outage demo. Admin back-office as a backend-for-frontend: tokens never leave httpOnly cookies.",
        },
        stack: ["Next.js 16", "React 19", "Tailwind 4"],
        href: { fr: "https://resi-site-rho.vercel.app/fr", en: "https://resi-site-rho.vercel.app/en" },
      },
    ],
    image: {
      src: "/resi.png",
      alt: { fr: "Page d'accueil du site Resi, avec la démo de synchronisation", en: "Resi website home page, with the sync demo" },
    },
    href: { fr: "https://resi-site-rho.vercel.app/fr", en: "https://resi-site-rho.vercel.app/en" },
  },
  {
    id: "wadibu",
    product: "Wadibu",
    scenario: {
      fr: "Une commande food, de la PWA au suivi",
      en: "A food order, from the PWA to tracking",
    },
    pitch: {
      fr: "Livraison de colis et de repas à Agboville. Une API Go sert l'app client, l'app livreur, la PWA de commande, le site et la console d'administration.",
      en: "Parcel and food delivery in Agboville. A Go API serves the customer app, the courier app, the ordering PWA, the website and the admin console.",
    },
    done: { fr: "Commande payée, suivi ouvert.", en: "Order paid, tracking open." },
    spans: [
      {
        id: "w1",
        layer: "web",
        name: "checkout.submit",
        start: 0,
        duration: 236,
        depth: 0,
        what: {
          fr: "Le client valide son panier dans la PWA. Le navigateur appelle l'API directement.",
          en: "The customer checks out in the PWA. The browser calls the API directly.",
        },
        why: {
          fr: "Pas de serveur intermédiaire : moins de surface exposée, et c'est le CORS de l'API qui décide qui peut l'appeler.",
          en: "No intermediate server: less exposed surface, and the API's CORS decides who may call it.",
        },
        where: "pwa/",
      },
      {
        id: "w2",
        layer: "infra",
        name: "cloudflare.edge",
        start: 6,
        duration: 24,
        depth: 1,
        what: {
          fr: "WAF et limites de débit en bordure, puis la requête repart vers l'origine avec une preuve de passage.",
          en: "WAF and rate limits at the edge, then the request moves on to the origin with a proof of transit.",
        },
        why: {
          fr: "Cette preuve n'existe qu'entre Cloudflare et l'API : aucun navigateur ne peut la fabriquer.",
          en: "That proof only exists between Cloudflare and the API: no browser can forge it.",
        },
        where: "Cloudflare",
      },
      {
        id: "w3",
        layer: "api",
        name: "middleware.OriginGuard",
        start: 32,
        duration: 6,
        depth: 1,
        what: {
          fr: "Vérifie la preuve de passage en temps constant. Sans elle, la requête est refusée.",
          en: "Checks the proof of transit in constant time. Without it, the request is refused.",
        },
        why: {
          fr: "Un hébergeur expose aussi une adresse directe : sans cette garde, on contournerait le WAF en appelant l'origine.",
          en: "A host also exposes a direct address: without this guard, anyone could skip the WAF by calling the origin.",
        },
        where: "api/internal/interface/api/http/middleware/",
      },
      {
        id: "w4",
        layer: "api",
        name: "foodHandler.CreateFoodOrder",
        start: 40,
        duration: 180,
        depth: 1,
        what: {
          fr: "Authentification JWT, puis le handler délègue au use case : prix de livraison, code promo, création.",
          en: "JWT authentication, then the handler delegates to the use case: delivery price, promo code, creation.",
        },
        why: {
          fr: "Clean Architecture : le handler HTTP ne connaît que le use case, qui ne connaît que les interfaces du domaine.",
          en: "Clean Architecture: the HTTP handler only knows the use case, which only knows domain interfaces.",
        },
        where: "api/internal/usecase/food/",
      },
      {
        id: "w5",
        layer: "data",
        name: "orderRepository.Create",
        start: 150,
        duration: 52,
        depth: 2,
        what: {
          fr: "La commande est écrite dans Firestore, l'implémentation vit dans infrastructure/.",
          en: "The order is written to Firestore, the implementation lives in infrastructure/.",
        },
        why: {
          fr: "Le domaine déclare l'interface du repository ; changer de base ne toucherait ni les use cases ni les handlers.",
          en: "The domain declares the repository interface; switching databases would touch neither use cases nor handlers.",
        },
        where: "api/internal/infrastructure/persistence/",
      },
      {
        id: "w6",
        layer: "api",
        name: "paymentWebhook.Handle",
        start: 262,
        duration: 54,
        depth: 0,
        what: {
          fr: "Le prestataire confirme le paiement mobile money, la commande passe en préparation.",
          en: "The provider confirms the mobile money payment, the order moves to preparation.",
        },
        why: {
          fr: "Le webhook n'est cru que si sa signature HMAC est valide, et un réconciliateur périodique rattrape ceux qui se perdent.",
          en: "The webhook is only trusted with a valid HMAC signature, and a periodic reconciler catches the ones that get lost.",
        },
        where: "api/internal/interface/api/http/handler/",
      },
      {
        id: "w7",
        layer: "web",
        name: "trackingHandler.GetTracking",
        start: 330,
        duration: 34,
        depth: 0,
        what: {
          fr: "Le client suit sa commande depuis un lien public.",
          en: "The customer follows the order from a public link.",
        },
        why: {
          fr: "Une route publique se protège seule : elle est limitée par adresse IP, en plus des règles de bordure.",
          en: "A public route protects itself: it is rate-limited per IP, on top of the edge rules.",
        },
        where: "api/internal/interface/api/http/handler/",
      },
    ],
    figures: [
      { value: "5", label: { fr: "surfaces sur une seule API", en: "surfaces on a single API" } },
      { value: "303", label: { fr: "fichiers Go", en: "Go files" } },
      { value: "40", label: { fr: "fichiers de tests Go", en: "Go test files" } },
      { value: "293", label: { fr: "fichiers Dart", en: "Dart files" } },
    ],
    surfaces: [
      {
        layer: "mobile",
        title: { fr: "Apps client et livreur", en: "Customer and courier apps" },
        body: {
          fr: "Commande de colis et de repas, suivi de course, espace livreur. Distribuées sur APKPure en attendant les stores.",
          en: "Parcel and food ordering, ride tracking, courier space. Distributed on APKPure ahead of the stores.",
        },
        stack: ["Flutter", "Dart 3", "Firebase"],
        href: "https://apkpure.com/fr/wadibu/com.wadibu.app",
      },
      {
        layer: "api",
        title: { fr: "API REST", en: "REST API" },
        body: {
          fr: "Clean Architecture stricte, paiements mobile money, e-mails transactionnels, OTP par SMS. Derrière Cloudflare, avec garde d'origine.",
          en: "Strict Clean Architecture, mobile money payments, transactional emails, SMS OTP. Behind Cloudflare, with an origin guard.",
        },
        stack: ["Go 1.24", "gorilla/mux", "Firestore"],
      },
      {
        layer: "web",
        title: { fr: "Site, PWA et back-office", en: "Website, PWA and back-office" },
        body: {
          fr: "Site vitrine, PWA de commande food et console d'administration, chacun déployé en continu.",
          en: "Showcase site, food-ordering PWA and admin console, each continuously deployed.",
        },
        stack: ["Next.js 16", "Next.js 15", "Vite", "React"],
        href: "https://www.wadibu.ci",
      },
    ],
    image: {
      src: "/wadibu.png",
      alt: { fr: "Page d'accueil du site Wadibu", en: "Wadibu website home page" },
    },
    href: "https://www.wadibu.ci",
  },
  {
    id: "aboutik",
    product: "Aboutik",
    scenario: {
      fr: "Une vente en caisse, deux vendeurs sur le même stock",
      en: "A checkout sale, two sellers on the same stock",
    },
    pitch: {
      fr: "Gestion de boutiques multi-magasins, réalisée chez Ablele : produits et kits, stocks, ventes en caisse, clients, trésorerie, objectifs des vendeurs et abonnements payés en Mobile Money. Trois rôles : administrateur, gérant, vendeur.",
      en: "Multi-store shop management, built at Ablele: products and bundles, stock, checkout sales, customers, cash, seller targets and subscriptions paid through Mobile Money. Three roles: admin, manager, seller.",
    },
    gap: {
      icon: "lock",
      trigger: { fr: "Ajouter une vente concurrente", en: "Add a concurrent sale" },
      autoResumeMs: 1600,
      label: { fr: "verrou tenu par la vente B", en: "lock held by sale B" },
      waiting: {
        fr: "La vente B tient le verrou : la vente A attend son tour.",
        en: "Sale B holds the lock: sale A waits its turn.",
      },
      doneAfter: {
        fr: "Vente A enregistrée après la vente B, sur un stock déjà décrémenté : aucune survente.",
        en: "Sale A recorded after sale B, on already reduced stock: no overselling.",
      },
    },
    done: {
      fr: "Vente enregistrée : stock, caisse et marge à jour.",
      en: "Sale recorded: stock, cash and margin up to date.",
    },
    spans: [
      {
        id: "a1",
        layer: "mobile",
        name: "CartController.addToCart",
        start: 0,
        duration: 20,
        depth: 0,
        what: {
          fr: "Le vendeur scanne ou choisit les articles. Le panier est gardé sur le téléphone.",
          en: "The seller scans or picks the items. The cart is kept on the phone.",
        },
        why: {
          fr: "Une app fermée par erreur en pleine caisse ne fait pas perdre le panier au client qui attend.",
          en: "An app closed by mistake mid-checkout doesn't lose the waiting customer's cart.",
        },
        where: "mobile/lib/v1/controllers/cart_controller.dart",
      },
      {
        id: "a2",
        layer: "mobile",
        name: "VenteController.saveVente",
        start: 24,
        duration: 276,
        depth: 0,
        what: {
          fr: "Le vendeur valide la vente avec son mode de paiement.",
          en: "The seller confirms the sale with its payment method.",
        },
        why: {
          fr: "Chaque rôle a son écran, mais tous envoient la même vente : l'app ne calcule ni prix ni stock.",
          en: "Each role has its own screen, but all send the same sale: the app computes neither price nor stock.",
        },
        where: "mobile/lib/v1/controllers/seller/vente_controller.dart",
      },
      {
        id: "a3",
        layer: "api",
        name: "SellerController.store",
        start: 30,
        duration: 262,
        depth: 1,
        what: {
          fr: "Authentification Sanctum, rôle et magasin vérifiés, validation, puis délégation au service.",
          en: "Sanctum authentication, role and store checked, validation, then hand-off to the service.",
        },
        why: {
          fr: "Administrateur, gérant et vendeur passent par le même service de vente : une seule règle, pas trois copies.",
          en: "Admin, manager and seller go through the same sales service: one rule, not three copies.",
        },
        where: "api/app/Http/Controllers/Seller/SellerController.php",
      },
      {
        id: "a4",
        layer: "api",
        name: "AdminSalesService.createSale",
        start: 38,
        duration: 246,
        depth: 2,
        what: {
          fr: "Toute la vente s'exécute dans une transaction : rien n'est écrit si une étape échoue.",
          en: "The whole sale runs in one transaction: nothing is written if a step fails.",
        },
        why: {
          fr: "Vente, stock et caisse restent cohérents entre eux, même si une erreur survient au milieu.",
          en: "Sale, stock and cash stay consistent with each other, even if an error happens halfway.",
        },
        where: "api/app/Services/AdminSalesService.php",
      },
      {
        id: "a5",
        layer: "data",
        name: "Product::lockForUpdate",
        start: 44,
        duration: 16,
        depth: 3,
        what: {
          fr: "Verrou pessimiste sur les produits vendus et sur les composants des kits.",
          en: "Pessimistic lock on the products sold and on the bundles' components.",
        },
        why: {
          fr: "Deux vendeurs sur le même article : le second attend la fin du premier au lieu de vendre deux fois le dernier exemplaire.",
          en: "Two sellers on the same item: the second waits for the first instead of selling the last unit twice.",
        },
        where: "api/app/Services/AdminSalesService.php",
      },
      {
        id: "a6",
        layer: "api",
        name: "aggregateStockRequirements",
        start: 64,
        duration: 30,
        depth: 3,
        afterGap: true,
        what: {
          fr: "Les kits sont décomposés en composants, les besoins cumulés par produit, puis comparés au stock.",
          en: "Bundles are broken into components, needs are summed per product, then checked against stock.",
        },
        why: {
          fr: "Deux kits qui partagent un composant passent chacun seuls, mais dépassent le stock une fois additionnés.",
          en: "Two bundles sharing a component each pass alone, but exceed stock once added together.",
        },
        where: "api/app/Services/AdminSalesService.php",
      },
      {
        id: "a7",
        layer: "data",
        name: "VenteDetail::create",
        start: 98,
        duration: 40,
        depth: 3,
        afterGap: true,
        what: {
          fr: "Chaque ligne fige le prix de vente et le prix d'achat du moment (purchase_price_at_sale).",
          en: "Each line freezes the sale price and the current purchase price (purchase_price_at_sale).",
        },
        why: {
          fr: "La marge d'une vente reste juste même quand le prix d'achat change le mois suivant.",
          en: "A sale's margin stays right even when the purchase price changes the next month.",
        },
        where: "api/app/Services/AdminSalesService.php",
      },
      {
        id: "a8",
        layer: "data",
        name: "Product::updateQuantityAndRecordMovement",
        start: 142,
        duration: 64,
        depth: 3,
        afterGap: true,
        what: {
          fr: "Un seul mouvement de stock par produit, avec son origine : « Vente n°12 (kit Pack Bureau) ».",
          en: "One stock movement per product, with its origin: “Sale #12 (Office Pack bundle)”.",
        },
        why: {
          fr: "Chaque sortie garde sa raison : l'inventaire se réconcilie ligne à ligne, kits compris.",
          en: "Every outflow keeps its reason: inventory reconciles line by line, bundles included.",
        },
        where: "api/app/Models/Product.php",
      },
      {
        id: "a9",
        layer: "api",
        name: "CashMovementService.record",
        start: 212,
        duration: 52,
        depth: 3,
        afterGap: true,
        what: {
          fr: "Une entrée de caisse automatique est rattachée à la vente.",
          en: "An automatic cash entry is attached to the sale.",
        },
        why: {
          fr: "La caisse du jour se construit sans saisie manuelle, et annuler une vente contre-passe son mouvement.",
          en: "The day's cash builds itself without manual entry, and cancelling a sale reverses its movement.",
        },
        where: "api/app/Services/CashMovementService.php",
      },
    ],
    figures: [
      { value: "317", label: { fr: "routes d'API", en: "API routes" } },
      { value: "70", label: { fr: "migrations de schéma", en: "schema migrations" } },
      { value: "252", label: { fr: "fichiers PHP applicatifs", en: "application PHP files" } },
      { value: "425", label: { fr: "fichiers Dart", en: "Dart files" } },
    ],
    surfaces: [
      {
        layer: "mobile",
        title: { fr: "App administrateur, gérant et vendeur", en: "Admin, manager and seller app" },
        body: {
          fr: "Caisse, scan de codes-barres, stocks et alertes de rupture, objectifs des vendeurs, rapports PDF et Excel, notifications push.",
          en: "Checkout, barcode scanning, stock and low-stock alerts, seller targets, PDF and Excel reports, push notifications.",
        },
        stack: ["Flutter", "GetX", "Dio", "ML Kit", "Firebase"],
        href: "https://apkpure.com/aboutik/com.example.ashop",
      },
      {
        layer: "api",
        title: { fr: "API REST", en: "REST API" },
        body: {
          fr: "Services, repositories et DTO, traitements différés, imports et exports Excel, abonnements Mobile Money, SMS en masse.",
          en: "Services, repositories and DTOs, queued jobs, Excel imports and exports, Mobile Money subscriptions, bulk SMS.",
        },
        stack: ["Laravel 10", "PHP 8", "Sanctum", "MySQL"],
      },
    ],
    image: {
      src: "/aboutik.jpg",
      alt: { fr: "Tableau de bord de l'application Aboutik", en: "Aboutik app dashboard" },
      portrait: true,
    },
    href: "https://apkpure.com/aboutik/com.example.ashop",
  },
];
