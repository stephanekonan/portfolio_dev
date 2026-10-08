import { Lock } from "lucide-react";
import Link from "next/link";
import { ui } from "@/i18n/ui";
import { lock } from "@/lib/carnet/actions";
import { getArticles, getJournal } from "@/lib/carnet/content";
import ThemeToggle from "../ThemeToggle";
import { CarnetSidebar, CarnetTabBar } from "./CarnetNav";

/**
 * Cadre de toute page de l'espace privé : barre du haut (nom du carnet,
 * thème, verrou), navigation latérale sur grand écran, onglets en bas sur
 * mobile. Fermé, le cadre se réduit à la barre du haut et au formulaire.
 */
export default function Shell({ cle, open, children }: { cle: string; open: boolean; children: React.ReactNode }) {
  const series = open ? getArticles().map(({ slug, title }) => ({ slug, title })) : [];
  const journalCount = open ? getJournal().length : 0;
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-rule bg-paper/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-304 items-center justify-between gap-4 px-4 sm:px-8">
          <Link href={open ? `/${cle}` : "/"} className="flex min-w-0 items-baseline gap-3 whitespace-nowrap">
            {/* Sur un téléphone, le titre long pousserait le thème et le verrou hors de l'écran. */}
            <span className="font-display text-base font-bold font-stretch-135% sm:hidden">Carnet</span>
            <span className="hidden font-display text-base font-bold font-stretch-135% sm:inline">Construire en avançant</span>
            <span className="hidden text-xs text-ink-2 md:inline">carnet de Stéphane Konan</span>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle t={ui.fr.theme} />
            {open && (
              <form action={lock}>
                <input type="hidden" name="cle" value={cle} />
                <button
                  type="submit"
                  title="Verrouiller le carnet"
                  className="-mr-2 flex h-10 items-center gap-2 px-2 text-sm text-ink-2 hover:text-ink"
                >
                  <Lock className="size-4" aria-hidden />
                  <span className="hidden sm:inline">Verrouiller</span>
                  <span className="sr-only sm:hidden">Verrouiller le carnet</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </header>
      {open ? (
        <>
          <div className="mx-auto max-w-304 px-4 sm:px-8 lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-14">
            <CarnetSidebar cle={cle} series={series} journalCount={journalCount} />
            <main id="contenu" className="min-w-0 pb-28 pt-10 lg:pt-12">
              {children}
            </main>
          </div>
          <CarnetTabBar cle={cle} />
        </>
      ) : (
        <main id="contenu">{children}</main>
      )}
    </>
  );
}
