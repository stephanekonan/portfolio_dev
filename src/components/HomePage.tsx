import Image from "next/image";
import Link from "next/link";

import { ArrowRight } from "lucide-react";

import { AXIS, CAREER } from "@/data/career";
import { PROJECTS } from "@/data/projects";
import { SKILLS } from "@/data/skills";
import { TRACES } from "@/data/traces";
import { base, CONTACT, type Lang, ui } from "@/i18n/ui";
import { getPosts } from "@/lib/blog";
// Importée, la photo est servie sous une adresse qui porte son empreinte :
// une nouvelle photo change d'adresse, ni le service worker ni l'optimiseur
// d'images ne peuvent resservir l'ancienne.
import me from "../../public/me-small.png";
// Les écrans du téléphone : de vraies captures de mes applications.
import shotAboutik from "../../public/aboutik.jpg";
import shotDjaxa from "../../public/djaxa.png";
import shotResi from "../../public/phone/resi.jpg";
import shotWadibu from "../../public/phone/wadibu.jpg";

import BrandIcon from "./BrandIcon";
import CareerTrace from "./CareerTrace";
import ContactForm from "./ContactForm";
import CopyEmail from "./CopyEmail";
import HowItWorks from "./HowItWorks";
import PhoneScene, { type PhoneApp } from "./PhoneScene";
import PostList from "./PostList";
import ProjectIndex from "./ProjectIndex";
import SectionHead from "./SectionHead";
import Showcase from "./Showcase";
import TraceViewer from "./TraceViewer";

/** Mois courant au moment du build, partagé par le rendu serveur et l'hydratation. */
const NOW = new Date().toISOString().slice(0, 7);

/**
 * L'accueil, écrit pour tout le monde : ce que je fais en une phrase,
 * comment marche une application (une commande suivie de l'écran au reçu),
 * ce que j'ai construit, puis le détail pour qui veut creuser. La partie
 * technique (les traces) vient en dernier, annoncée comme telle.
 */
export default function HomePage({ lang }: { lang: Lang }) {
  const t = ui[lang];
  const posts = getPosts(lang).slice(0, 3);
  // Wadibu : la PWA de commande ; Resi : son site au format téléphone ;
  // Aboutik : l'écran de sa maquette, recadré ; djaxa .r : une capture.
  const apps: PhoneApp[] = [
    { id: "wadibu", name: "Wadibu", caption: t.hero.apps.wadibu, src: shotWadibu.src },
    { id: "resi", name: "Resi", caption: t.hero.apps.resi, src: shotResi.src },
    { id: "aboutik", name: "Aboutik", caption: t.hero.apps.aboutik, src: shotAboutik.src, crop: [86, 92, 434, 783] },
    { id: "djaxa", name: "djaxa .r", caption: t.hero.apps.djaxa, src: shotDjaxa.src },
  ];

  return (
    <>
      {/* L'ouverture tient dans l'écran, sous l'en-tête flottant. Sur grand
          écran, elle reste en place le temps que le téléphone raconte une
          commande (PhoneScene). */}
      <section className="relative mx-auto grid max-w-304 items-center gap-6 px-4 pt-8 pb-16 sm:px-8 lg:h-[calc(100svh-4.25rem)] lg:min-h-[40rem] lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:pt-2 lg:pb-10">
        <div data-hero-text className="relative z-10">
          <p className="flex items-center gap-3">
            <Image
              src={me}
              alt=""
              width={48}
              height={48}
              priority
              className="size-12 rounded-full border-2 border-ink object-cover"
            />
            <span className="leading-tight">
              <span className="block font-semibold">Stéphane Konan</span>
              <span className="block text-sm text-ink-2">{t.hero.role}</span>
            </span>
          </p>
          <h1
            data-split
            className="mt-6 font-display text-[clamp(2.3rem,4.3vw,4rem)] leading-[1] font-extrabold tracking-[-0.035em]"
          >
            {t.hero.headline}
          </h1>
          <p className="mt-5 max-w-[48ch] text-lg text-ink-2">{t.hero.lead}</p>
          <div className="mt-7 flex flex-wrap items-center gap-4">
            <a data-magnetic href="#contact" className="btn btn-primary">
              {t.hero.ctaProject}
              <ArrowRight className="size-4" aria-hidden />
            </a>
            <a data-magnetic href="#realisations" className="btn">
              {t.hero.ctaWork}
            </a>
          </div>
          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm">
            <span className="chip">
              <span className="size-2 rounded-full bg-go" aria-hidden />
              {t.hero.available}
            </span>
            <CopyEmail
              email={CONTACT.email}
              copy={t.hero.copy}
              copied={t.hero.copied}
            />
          </div>
        </div>

        <div className="h-[26rem] sm:h-[30rem] lg:h-[min(42rem,85%)]">
          <PhoneScene apps={apps} hint={t.hero.apps.hint} />
        </div>

        {/* Signe « défiler » : son trait se dessine en boucle (DrawSVG). */}
        <div
          data-scroll-cue
          aria-hidden
          className="absolute bottom-5 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 text-ink-2 lg:flex"
        >
          <span className="font-mono text-xs">{t.hero.scroll}</span>
          <svg
            viewBox="0 0 10 48"
            className="h-12 w-2.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M5 0v46" />
            <path d="M1 41l4 5 4-5" />
          </svg>
        </div>
      </section>

      <HowItWorks t={t.how} index="01" />

      <section
        id="realisations"
        className="mx-auto max-w-304 px-4 pb-28 sm:px-8"
      >
        <SectionHead
          index="02"
          title={t.showcase.title}
          lead={t.showcase.lead}
        />
        <Showcase products={TRACES} lang={lang} t={t.showcase} />

        <div className="mt-24">
          <h3
            data-reveal
            className="font-display text-2xl font-bold tracking-tight"
          >
            {t.work.title}
          </h3>
          <p data-reveal className="mt-3 mb-8 max-w-[60ch] text-ink-2">
            {t.work.lead}
          </p>
          <ProjectIndex projects={PROJECTS} lang={lang} t={t.work} />
        </div>
      </section>

      <section
        id="competences"
        className="mx-auto max-w-304 px-4 pb-28 sm:px-8"
      >
        <SectionHead index="03" title={t.skills.title} lead={t.skills.lead} />
        <div className="grid gap-6">
          {SKILLS.map((g) => (
            <article key={g.layer} data-reveal className="card p-6 sm:p-8">
              <div className="grid gap-6 md:grid-cols-[15rem_1fr]">
                <div>
                  <h3 className="flex items-center gap-3 font-display text-xl font-bold">
                    <span
                      className="size-3 rounded-full bg-signal"
                      aria-hidden
                    />
                    {t.hero.layers[g.layer]}
                  </h3>
                  <p className="mt-1 ml-6.5 font-mono text-xs text-ink-2">
                    {g.title[lang]}
                  </p>
                </div>
                <div>
                  <p className="max-w-[46ch] text-xl leading-snug font-semibold">
                    {t.skills.plain[g.layer]}
                  </p>
                  <ul
                    data-reveal-group
                    className="mt-6 grid gap-5 border-t border-rule pt-5 sm:grid-cols-3"
                  >
                    {g.items.map((s) => (
                      <li key={s.name}>
                        {/* Hauteur fixe, même sans logo : les noms restent
                            alignés d'une colonne à l'autre. */}
                        <p
                          data-pop
                          className="mb-2 flex h-4.5 items-center gap-2.5 text-ink-2"
                        >
                          {s.icons?.map((slug) => (
                            <BrandIcon
                              key={slug}
                              slug={slug}
                              className="size-4.5"
                            />
                          ))}
                        </p>
                        <p className="font-semibold">{s.name}</p>
                        <p className="mt-1 text-sm text-ink-2">
                          {s.detail[lang]}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-304 px-4 pb-28 sm:px-8">
        <SectionHead index="04" title={t.career.title} />
        <div data-reveal className="card p-5 sm:p-8">
          <CareerTrace
            spans={CAREER}
            axis={AXIS}
            now={NOW}
            lang={lang}
            t={t.career}
          />
        </div>
      </section>

      <section id="traces" className="mx-auto max-w-304 px-4 pb-28 sm:px-8">
        <SectionHead
          index={`05 · ${t.traces.kicker}`}
          title={t.traces.title}
          lead={t.traces.lead}
        />
        <div data-reveal>
          <TraceViewer traces={TRACES} lang={lang} t={t.traces} />
        </div>
      </section>

      {posts.length > 0 && (
        <section id="blog" className="mx-auto max-w-304 px-4 pb-28 sm:px-8">
          <SectionHead index="06" title={t.blog.latest} lead={t.blog.lead}>
            <Link href={`${base(lang)}/blog`} className="btn btn-sm">
              {t.blog.all}
            </Link>
          </SectionHead>
          <PostList posts={posts} lang={lang} />
        </section>
      )}

      <section id="contact" className="mx-auto max-w-304 px-4 pb-24 sm:px-8">
        <div className="card grid gap-12 bg-ink p-6 text-paper sm:p-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:p-14">
          <div>
            <h2
              data-split
              className="font-display text-[clamp(2.4rem,5vw,4rem)] leading-[0.98] font-extrabold tracking-[-0.03em]"
            >
              {t.contact.title}
            </h2>
            <p data-reveal className="mt-5 max-w-[40ch] text-lg">
              {t.contact.lead}
            </p>
            <div className="mt-10 space-y-3 text-sm">
              <p>{t.contact.or}</p>
              <CopyEmail
                email={CONTACT.email}
                copy={t.hero.copy}
                copied={t.hero.copied}
              />
              <p>
                <a
                  href={CONTACT.whatsapp}
                  target="_blank"
                  rel="noopener"
                  className="font-semibold underline"
                >
                  {t.contact.whatsapp}, +225 07 69 88 37 30
                </a>
              </p>
            </div>
          </div>
          <div
            data-reveal
            className="rounded-[1.25rem] border-2 border-paper bg-raised p-6 text-ink sm:p-8"
          >
            <ContactForm lang={lang} t={t.contact} />
          </div>
        </div>
      </section>
    </>
  );
}
