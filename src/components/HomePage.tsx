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
import PostList from "./PostList";
import ProjectIndex from "./ProjectIndex";
import ScrollMotion from "./ScrollMotion";
import SectionHead from "./SectionHead";
import StackScene from "./StackScene";
import TraceViewer from "./TraceViewer";

const LAYER_VAR = {
  web: "var(--layer-web)",
  mobile: "var(--layer-mobile)",
  api: "var(--layer-api)",
  infra: "var(--layer-infra)",
  data: "var(--layer-data)",
} as const;

/** Mois courant au moment du build, partagé par le rendu serveur et l'hydratation. */
const NOW = new Date().toISOString().slice(0, 7);

export default function HomePage({ lang }: { lang: Lang }) {
  const t = ui[lang];
  const posts = getPosts(lang).slice(0, 3);

  return (
    <>
      <ScrollMotion />
      {/* Une seule pile 3D pour la page : elle se loge dans les ancres
          `data-scene` des sections et vole de l'une à l'autre. */}
      <StackScene
        layers={SKILLS.map((g) => ({
          layer: g.layer,
          label: t.hero.layers[g.layer],
        }))}
      />

      {/* L'ouverture tient dans l'écran, sous l'en-tête de 3,5 rem. Sur grand
          écran, elle est épinglée le temps que la pile glisse de son ancre
          vers tout l'écran (`hero-full`) en se dépliant. */}
      <section className="relative mx-auto flex max-w-304 flex-col px-4 pt-12 pb-16 sm:px-8 md:pt-16 lg:h-[calc(100svh-3.5rem)] lg:min-h-[38rem]">
        <h1
          data-hero-name
          className="relative z-10 text-[min(calc((100vw-4rem)/8.4),8.6rem)] leading-[0.84] font-extrabold uppercase"
        >
          <span className="name-unfold block">Stéphane</span>
          <span className="name-unfold second block">Konan</span>
        </h1>

        <div className="mt-10 grid flex-1 grid-cols-1 items-end gap-6 lg:mt-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <div data-hero-text className="relative z-10 space-y-8 lg:pb-6">
            <div>
              <p className="text-xl font-semibold">{t.hero.role}</p>
              <p className="mt-3 max-w-[46ch] text-lg text-ink-2">
                {t.hero.lead}
              </p>
            </div>
            <div className="space-y-3 text-sm">
              <p className="inline-flex items-center gap-2 font-semibold">
                <span className="size-2 rounded-full bg-signal" aria-hidden />
                {t.hero.available}
              </p>
              <div>
                <CopyEmail
                  email={CONTACT.email}
                  copy={t.hero.copy}
                  copied={t.hero.copied}
                />
              </div>
            </div>
          </div>
          <div
            data-scene="hero"
            aria-hidden
            className="-order-1 h-[20rem] sm:h-[26rem] lg:order-none lg:h-full lg:min-h-[24rem]"
          />
        </div>
        <div
          data-scene="hero-full"
          aria-hidden
          className="pointer-events-none absolute inset-0 hidden lg:block"
        />
      </section>

      <section className="mx-auto max-w-304 px-4 pb-28 sm:px-8">
        <SectionHead index="01" title={t.career.title} />
        <div data-reveal>
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
        <SectionHead index="02" title={t.traces.title} lead={t.traces.lead} />
        <div data-reveal>
          <TraceViewer traces={TRACES} lang={lang} t={t.traces} />
        </div>
      </section>

      <section id="projets" className="mx-auto max-w-304 px-4 pb-28 sm:px-8">
        <SectionHead index="03" title={t.work.title} lead={t.work.lead} />
        <ProjectIndex projects={PROJECTS} lang={lang} t={t.work} />
      </section>

      <section
        id="competences"
        className="mx-auto max-w-304 px-4 pb-28 sm:px-8"
      >
        <SectionHead index="04" title={t.skills.title} lead={t.skills.lead} />
        {/* Grand écran : la pile se loge à droite, collante, et la couche de
            la rangée lue se soulève (StackScene, `data-layer-row`). */}
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,0.7fr)] lg:gap-12">
          <div>
            {SKILLS.map((g) => (
              <div
                key={g.layer}
                data-layer-row
                className="grid gap-4 border-b border-rule py-7 md:grid-cols-[13rem_1fr] lg:grid-cols-1"
              >
                <h3
                  data-reveal
                  className="flex items-center gap-2.5 self-start font-semibold"
                >
                  <span
                    className="size-2.5"
                    style={{ background: LAYER_VAR[g.layer] }}
                    aria-hidden
                  />
                  {g.title[lang]}
                </h3>
                <ul data-reveal-group className="grid gap-6 sm:grid-cols-3">
                  {g.items.map((s) => (
                    <li key={s.name}>
                      {/* Hauteur fixe, même sans logo : les noms restent alignés
                        d'une colonne à l'autre. */}
                      <p className="mb-2.5 flex h-4.5 items-center gap-2.5 text-ink-2">
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
            ))}
          </div>
          <div aria-hidden className="hidden lg:block">
            <div
              data-scene="skills"
              className="sticky top-[calc(50svh-11rem)] h-[26rem]"
            />
          </div>
        </div>
      </section>

      {posts.length > 0 && (
        <section id="blog" className="mx-auto max-w-304 px-4 pb-28 sm:px-8">
          <SectionHead index="05" title={t.blog.latest} lead={t.blog.lead}>
            <Link
              href={`${base(lang)}/blog`}
              className="text-sm font-semibold underline"
            >
              {t.blog.all}
            </Link>
          </SectionHead>
          <div data-reveal>
            <PostList posts={posts} lang={lang} />
          </div>
        </section>
      )}

      <section id="contact" className="border-t border-ink bg-raised">
        <div className="mx-auto grid max-w-304 gap-14 px-4 py-24 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <div>
            <h2
              data-split
              className="font-display text-3xl font-extrabold font-stretch-140%"
            >
              {t.contact.title}
            </h2>
            <p data-reveal className="mt-5 max-w-[44ch] text-lg text-ink-2">
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
            {/* La pile s'y replie en une seule plaque. */}
            <div
              data-scene="contact"
              aria-hidden
              className="mt-12 hidden h-56 lg:block"
            />
          </div>
          <div data-reveal>
            <ContactForm lang={lang} t={t.contact} />
          </div>
        </div>
      </section>
    </>
  );
}
