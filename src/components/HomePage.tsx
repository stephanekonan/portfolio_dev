import Link from "next/link";

import { AXIS, CAREER } from "@/data/career";
import { PROJECTS } from "@/data/projects";
import { SKILLS } from "@/data/skills";
import { TRACES } from "@/data/traces";
import { base, CONTACT, type Lang, ui } from "@/i18n/ui";
import { getPosts } from "@/lib/blog";

import BrandIcon from "./BrandIcon";
import CareerTrace from "./CareerTrace";
import ContactForm from "./ContactForm";
import CopyEmail from "./CopyEmail";
import HowItWorks from "./HowItWorks";
import HeroDesk from "./HeroDesk";
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
  return (
    <>
      <HeroDesk t={t.hero} />

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
            className="font-display text-2xl font-semibold tracking-tight"
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
                  <h3 className="flex items-center gap-3 font-display text-xl font-semibold tracking-tight">
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
                  <p className="max-w-[46ch] text-xl leading-snug font-medium tracking-tight">
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
        <div className="card grid gap-12 p-6 sm:p-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:p-14">
          <div>
            <h2
              data-split
              className="font-display text-[clamp(2.2rem,4.6vw,3.6rem)] leading-[1.04] font-semibold tracking-[-0.04em]"
            >
              {t.contact.title}
            </h2>
            <p data-reveal className="mt-5 max-w-[40ch] text-lg text-ink-2">
              {t.contact.lead}
            </p>
            <div className="mt-10 space-y-3 text-sm">
              <p className="text-ink-2">{t.contact.or}</p>
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
            className="rounded-2xl border border-rule bg-paper/70 p-6 sm:p-8"
          >
            <ContactForm lang={lang} t={t.contact} />
          </div>
        </div>
      </section>
    </>
  );
}
