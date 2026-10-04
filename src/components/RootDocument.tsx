import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import Header from "./Header";
import Footer from "./Footer";
import ServiceWorker from "./ServiceWorker";
import { anybody, schibsted } from "@/lib/fonts";
import { ui, type Lang } from "@/i18n/ui";
import { THEME_SCRIPT } from "@/lib/theme";
import "@/styles/global.css";

export default function RootDocument({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  const t = ui[lang];
  return (
    // `suppressHydrationWarning` : le script de tête pose `data-theme` sur
    // <html> avant React, l'écart avec le rendu serveur est voulu.
    <html lang={lang} className={`${anybody.variable} ${schibsted.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>
        <a
          href="#contenu"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
        >
          {lang === "fr" ? "Aller au contenu" : "Skip to content"}
        </a>
        <Header lang={lang} t={t} />
        <main id="contenu">{children}</main>
        <Footer t={t} />
        <ServiceWorker />
        <Analytics />
        <Script id="hotjar" strategy="afterInteractive">
          {`(function(h,o,t,j){h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};h._hjSettings={hjid:6485478,hjsv:6};var a=o.getElementsByTagName('head')[0];var r=o.createElement('script');r.async=1;r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;a.appendChild(r);})(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');`}
        </Script>
      </body>
    </html>
  );
}
