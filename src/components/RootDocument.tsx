import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import Header from "./Header";
import Footer from "./Footer";
import ScrollMotion from "./ScrollMotion";
import ServiceWorker from "./ServiceWorker";
import ImageGuard from "./ImageGuard";
import { hand, text } from "@/lib/fonts";
import { ui, type Lang } from "@/i18n/ui";
import { THEME_SCRIPT } from "@/lib/theme";
import { DISCRETION_SCRIPT } from "@/lib/discretion";
import Discretion from "./Discretion";
import "@/styles/global.css";

interface Props {
  lang: Lang;
  children: React.ReactNode;
  /**
   * En-tête, `<main>` et pied de page du site. Sans eux, la page pose sa
   * propre structure : c'est le cas de l'espace privé.
   */
  chrome?: boolean;
  /**
   * Mesure d'audience (Vercel Analytics, Hotjar). Coupée sur l'espace privé :
   * ses pages ne doivent finir ni dans un enregistrement de session, ni dans
   * des statistiques qui révéleraient leur adresse.
   */
  tracking?: boolean;
}

export default function RootDocument({ lang, children, chrome = true, tracking = true }: Props) {
  const t = ui[lang];
  return (
    // `suppressHydrationWarning` : le script de tête pose `data-theme` sur
    // <html> avant React, l'écart avec le rendu serveur est voulu.
    <html lang={lang} className={`${text.variable} ${hand.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: DISCRETION_SCRIPT + THEME_SCRIPT }} />
      </head>
      <body>
        <a
          href="#contenu"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
        >
          {lang === "fr" ? "Aller au contenu" : "Skip to content"}
        </a>
        {chrome ? (
          <>
            {/* Mouvements au défilement, sur toutes les pages du site public. */}
            <ScrollMotion />
            <Header lang={lang} t={t} />
            <main id="contenu">{children}</main>
            <Footer t={t} />
          </>
        ) : (
          children
        )}
        <ServiceWorker />
        <ImageGuard />
        <Discretion />
        {/* Script et envoi sous `/m`, réécrit vers `/_vercel/insights` dans
            next.config.ts : l'adresse d'origine trahit Vercel. */}
        {tracking && <Analytics scriptSrc="/m/s.js" endpoint="/m" />}
        {tracking && (
          <Script id="hotjar" strategy="afterInteractive">
            {`(function(h,o,t,j){h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};h._hjSettings={hjid:6485478,hjsv:6};var a=o.getElementsByTagName('head')[0];var r=o.createElement('script');r.async=1;r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;a.appendChild(r);})(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');`}
          </Script>
        )}
      </body>
    </html>
  );
}
