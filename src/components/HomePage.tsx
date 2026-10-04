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
import SectionHead from "./SectionHead";
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
  const posts = getPosts().slice(0, 3);

  return (
    <>
      <section className="mx-auto max-w-304 px-4 pt-12 pb-24 sm:px-8 md:pt-16">
        <h1 className="text-[min(calc((100vw-4rem)/8.4),8.6rem)] leading-[0.84] font-extrabold uppercase">
          <span className="name-unfold block">Stéphane</span>
          <span className="name-unfold second block">Konan</span>
        </h1>

        <div className="mt-10 grid items-end gap-8 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div>
            <p className="text-xl font-semibold">{t.hero.role}</p>
            <p className="mt-3 max-w-[54ch] text-lg text-ink-2">
              {t.hero.lead}
            </p>
          </div>
          <div className="space-y-3 text-sm lg:text-right">
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

        <div className="mt-16">
          <h2 className="mb-4 text-sm font-semibold text-ink-2">
            {t.career.title}
          </h2>
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
        <SectionHead title={t.traces.title} lead={t.traces.lead} />
        <TraceViewer traces={TRACES} lang={lang} t={t.traces} />
      </section>

      <section id="projets" className="mx-auto max-w-304 px-4 pb-28 sm:px-8">
        <SectionHead title={t.work.title} lead={t.work.lead} />
        <ProjectIndex projects={PROJECTS} lang={lang} t={t.work} />
      </section>

      <section
        id="competences"
        className="mx-auto max-w-304 px-4 pb-28 sm:px-8"
      >
        <SectionHead title={t.skills.title} lead={t.skills.lead} />
        <div>
          {SKILLS.map((g) => (
            <div
              key={g.layer}
              className="grid gap-4 border-b border-rule py-7 md:grid-cols-[13rem_1fr]"
            >
              <h3 className="flex items-center gap-2.5 self-start font-semibold">
                <span
                  className="size-2.5"
                  style={{ background: LAYER_VAR[g.layer] }}
                  aria-hidden
                />
                {g.title[lang]}
              </h3>
              <ul className="grid gap-6 sm:grid-cols-3">
                {g.items.map((s) => (
                  <li key={s.name}>
                    {/* Hauteur fixe, même sans logo : les noms restent alignés
                        d'une colonne à l'autre. */}
                    <p className="mb-2.5 flex h-[18px] items-center gap-2.5 text-ink-2">
                      {s.icons?.map((slug) => (
                        <BrandIcon key={slug} slug={slug} className="size-[18px]" />
                      ))}
                    </p>
                    <p className="font-semibold">{s.name}</p>
                    <p className="mt-1 text-sm text-ink-2">{s.detail[lang]}</p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {posts.length > 0 && (
        <section id="blog" className="mx-auto max-w-304 px-4 pb-28 sm:px-8">
          <SectionHead title={t.blog.latest} lead={t.blog.lead}>
            <Link
              href={`${base(lang)}/blog`}
              className="text-sm font-semibold underline"
            >
              {t.blog.all}
            </Link>
          </SectionHead>
          <PostList posts={posts} lang={lang} />
        </section>
      )}

      <section id="contact" className="border-t border-ink bg-raised">
        <div className="mx-auto grid max-w-304 gap-14 px-4 py-24 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <div>
            <h2 className="font-display text-3xl font-extrabold font-stretch-140%">
              {t.contact.title}
            </h2>
            <p className="mt-5 max-w-[44ch] text-lg text-ink-2">
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
          <ContactForm lang={lang} t={t.contact} />
        </div>
      </section>
    </>
  );
}
