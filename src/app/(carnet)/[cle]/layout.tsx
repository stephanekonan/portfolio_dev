import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import { ui } from "@/i18n/ui";
import { isKey } from "@/lib/carnet/access";

// Le carnet n'est jamais gardé hors ligne (voir public/sw.js) : la mention
// du site public serait fausse ici.
const FOOTER = {
  ...ui.fr,
  footer: { ...ui.fr.footer, offline: "Espace privé : non indexé, jamais gardé hors ligne sur l'appareil." },
};

/**
 * Une clé fausse s'arrête ici, sur la 404 ordinaire : rien ne laisse deviner
 * qu'un espace privé existe. Chaque page revérifie la clé et la session
 * (`gate`), le layout ne se réexécutant pas à chaque navigation.
 */
export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ cle: string }>;
}) {
  const { cle } = await params;
  if (!isKey(cle)) notFound();
  return (
    <>
      {children}
      {/* Sur mobile, la barre d'onglets recouvre le bas de l'écran. */}
      <div className="pb-16 lg:pb-0">
        <Footer t={FOOTER} />
      </div>
    </>
  );
}
