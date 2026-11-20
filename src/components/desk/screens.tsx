"use client";
import Image from "next/image";
import Link from "next/link";

import {
  ArrowUpRight,
  BrainCircuit,
  ChevronLeft,
  ChevronRight,
  Database,
  Monitor,
  MousePointerClick,
  NotebookPen,
  ReceiptText,
  Route,
  ShieldCheck,
  Smartphone,
  SquareTerminal,
} from "lucide-react";

import { AXIS, CAREER } from "@/data/career";
import { PROJECTS } from "@/data/projects";
import { SKILLS } from "@/data/skills";
import { TRACES, type Layer } from "@/data/traces";
import { base, CONTACT, type Lang, type Ui } from "@/i18n/ui";

import me from "../../../public/me-small.png";
import BrandIcon from "../BrandIcon";
import CareerTrace from "../CareerTrace";
import ContactForm from "../ContactForm";
import CopyEmail from "../CopyEmail";
import TraceViewer from "../TraceViewer";
import { CardLink, type Crumb, Group, href, pick, Screen, slug } from "./kit";

export interface PostCard {
  slug: string;
  title: string;
  description: string;
  date: string;
  dateLabel: string;
  minutes: number;
}

interface Ctx {
  lang: Lang;
  t: Ui;
  posts: PostCard[];
  now: string;
}

const LAYER_ICON: Record<Layer, typeof Monitor> = {
  web: Monitor,
  mobile: Smartphone,
  infra: ShieldCheck,
  api: BrainCircuit,
  data: Database,
};
const LAYER_COLOR: Record<Layer, string> = {
  web: "var(--layer-web)",
  mobile: "var(--layer-mobile)",
  infra: "var(--layer-infra)",
  api: "var(--layer-api)",
  data: "var(--layer-data)",
};
const STEP_ICON = [
  MousePointerClick,
  Route,
  BrainCircuit,
  NotebookPen,
  ReceiptText,
];

function LayerBadge({ layer, label }: { layer: Layer; label: string }) {
  const Icon = LAYER_ICON[layer];
  return (
    <span className="inline-flex items-center gap-2 text-xs font-medium text-ink-2">
      <span
        className="grid size-7 place-items-center rounded-lg text-white"
        style={{ background: LAYER_COLOR[layer] }}
      >
        <Icon className="size-3.5" aria-hidden />
      </span>
      {label}
    </span>
  );
}

function Shot({
  src,
  alt,
  portrait,
  className = "",
}: {
  src: string;
  alt: string;
  portrait?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border border-rule bg-sunken ${className}`}
    >
      <img
        src={src}
        alt={alt}
        className={
          portrait
            ? "mx-auto h-full max-h-80 w-auto object-contain py-3"
            : "block aspect-[16/10] w-full object-cover object-top"
        }
      />
    </div>
  );
}

function Chips({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-1.5">
      {items.map((s) => (
        <li key={s} className="chip">
          {s}
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------------
   Chaque écran reçoit son adresse découpée (`["realisations", "resi"]`) et
   rend son cadre. Une adresse inconnue rend `null` : l'accueil reprend.
   ------------------------------------------------------------------------ */

export function renderScreen(seg: string[], ctx: Ctx): React.ReactNode {
  const [head, a, b] = seg;
  switch (head) {
    case "apropos":
      return <About ctx={ctx} />;
    case "realisations":
      if (!a) return <Work ctx={ctx} />;
      if (TRACES.some((p) => p.id === a)) {
        if (!b) return <Product id={a} ctx={ctx} />;
        if (b === "trace") return <Trace id={a} ctx={ctx} />;
        return <Surface id={a} layer={b} ctx={ctx} />;
      }
      return b ? null : <Project id={a} ctx={ctx} />;
    case "savoir-faire":
      return a ? <SkillLayer layer={a} ctx={ctx} /> : <Skills ctx={ctx} />;
    case "parcours":
      return <Career ctx={ctx} />;
    case "comment":
      return a ? <Step index={Number(a)} ctx={ctx} /> : <How ctx={ctx} />;
    case "blog":
      return <Blog ctx={ctx} />;
    case "contact":
      return <Contact ctx={ctx} />;
    default:
      return null;
  }
}

/* --- À propos ----------------------------------------------------------- */

function About({ ctx }: { ctx: Ctx }) {
  const { t } = ctx;
  const s = t.screens;
  const c = s.about.cards;
  const cards = [
    { to: href("realisations"), ...c.work },
    { to: href("savoir-faire"), ...c.skills },
    { to: href("parcours"), ...c.career },
    { to: href("contact"), ...c.contact },
  ];
  return (
    <Screen
      t={s}
      crumbs={[{ label: s.about.kicker, path: href("apropos") }]}
      kicker={s.about.kicker}
      title={s.about.title}
      title2={s.about.title2}
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="card flex flex-col gap-5 p-6">
          <div className="flex items-center gap-4">
            <Image
              src={me}
              alt=""
              width={64}
              height={64}
              priority
              className="size-16 rounded-2xl border border-rule object-cover"
            />
            <div>
              <p className="font-semibold">Stéphane Konan</p>
              <p className="text-sm text-ink-2">{t.hero.role}</p>
            </div>
          </div>
          <p className="text-lg leading-snug">{t.hero.lead}</p>
          <p className="chip w-fit">
            <span className="size-2 rounded-full bg-go" aria-hidden />
            {t.hero.available}
          </p>
          <div className="mt-auto text-sm">
            <CopyEmail
              email={CONTACT.email}
              copy={t.hero.copy}
              copied={t.hero.copied}
            />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {cards.map((card) => (
            <CardLink key={card.to} to={card.to}>
              <p className="pr-8 font-semibold">{card.title}</p>
              <p className="mt-1.5 text-sm text-ink-2">{card.body}</p>
            </CardLink>
          ))}
        </div>
      </div>
    </Screen>
  );
}

/* --- Réalisations --------------------------------------------------------- */

const workCrumb = (s: Ui["screens"]): Crumb => ({
  label: s.work.kicker,
  path: href("realisations"),
});

function Work({ ctx }: { ctx: Ctx }) {
  const { t, lang } = ctx;
  const s = t.screens;
  return (
    <Screen
      t={s}
      crumbs={[workCrumb(s)]}
      kicker={s.work.kicker}
      title={s.work.title}
      title2={s.work.title2}
    >
      <Group title={s.work.featured}>
        <div className="grid gap-4 md:grid-cols-3">
          {TRACES.map((p) => (
            <CardLink
              key={p.id}
              to={href("realisations", p.id)}
              className="p-3"
            >
              <Shot
                src={p.image.src}
                alt={p.image.alt[lang]}
                portrait={p.image.portrait}
                className="h-36"
              />
              <div className="px-2 pt-3 pb-1">
                <p className="text-lg font-semibold tracking-tight">
                  {p.product}
                </p>
                <p className="text-sm text-ink-2">{t.showcase.kinds[p.id]}</p>
              </div>
            </CardLink>
          ))}
        </div>
      </Group>
      <Group title={s.work.others} className="mt-7">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {PROJECTS.map((p) => (
            <CardLink
              key={p.name}
              to={href("realisations", slug(p.name))}
              className="flex items-center gap-3 p-3"
            >
              <span className="block h-12 w-16 shrink-0 overflow-hidden rounded-lg border border-rule bg-sunken">
                <img
                  src={p.image}
                  alt=""
                  className={`size-full ${p.portrait ? "object-contain" : "object-cover object-top"}`}
                />
              </span>
              <span className="min-w-0 pr-8">
                <span className="block truncate text-sm font-semibold">
                  {p.name}
                </span>
                <span className="block truncate text-xs text-ink-2">
                  {[t.work.kinds[p.kind], ...p.stack].join(" · ")}
                </span>
              </span>
            </CardLink>
          ))}
        </div>
      </Group>
    </Screen>
  );
}

function Product({ id, ctx }: { id: string; ctx: Ctx }) {
  const { t, lang } = ctx;
  const s = t.screens;
  const p = TRACES.find((x) => x.id === id)!;
  const link = pick(p.href, lang);
  return (
    <Screen
      t={s}
      crumbs={[
        workCrumb(s),
        { label: p.product, path: href("realisations", p.id) },
      ]}
      kicker={t.showcase.kinds[p.id]}
      title={p.product}
      aside={
        <div className="flex flex-wrap gap-2">
          <a href={href("realisations", p.id, "trace")} className="btn btn-sm">
            <SquareTerminal className="size-4" aria-hidden />
            {s.product.trace}
          </a>
          {link && (
            <a
              href={link}
              target="_blank"
              rel="noopener"
              className="btn btn-sm btn-primary"
            >
              {t.showcase.visit}
              <ArrowUpRight className="size-4" aria-hidden />
            </a>
          )}
        </div>
      }
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          <Shot
            src={p.image.src}
            alt={p.image.alt[lang]}
            portrait={p.image.portrait}
          />
          <p className="text-ink-2">{t.showcase.pitch[p.id]}</p>
        </div>
        <div className="space-y-5">
          <Group title={s.product.figures}>
            <dl className="grid grid-cols-2 gap-3">
              {p.figures.map((f) => (
                <div key={f.label[lang]} className="card p-4">
                  <dt className="text-xs text-ink-2">{f.label[lang]}</dt>
                  <dd className="mt-1 text-2xl font-semibold tracking-tight">
                    {f.value}
                  </dd>
                </div>
              ))}
            </dl>
          </Group>
          <Group title={s.product.surfaces}>
            <div className="grid gap-3">
              {p.surfaces.map((sf) => (
                <CardLink
                  key={sf.layer}
                  to={href("realisations", p.id, sf.layer)}
                  className="p-4"
                >
                  <LayerBadge
                    layer={sf.layer}
                    label={t.traces.layers[sf.layer]}
                  />
                  <p className="mt-2 pr-8 font-semibold">{sf.title[lang]}</p>
                </CardLink>
              ))}
            </div>
          </Group>
        </div>
      </div>
    </Screen>
  );
}

function Surface({ id, layer, ctx }: { id: string; layer: string; ctx: Ctx }) {
  const { t, lang } = ctx;
  const s = t.screens;
  const p = TRACES.find((x) => x.id === id)!;
  const i = p.surfaces.findIndex((x) => x.layer === layer);
  if (i < 0) return null;
  const sf = p.surfaces[i];
  const link = pick(sf.href, lang);
  const prev = p.surfaces[i - 1];
  const next = p.surfaces[i + 1];
  return (
    <Screen
      t={s}
      crumbs={[
        workCrumb(s),
        { label: p.product, path: href("realisations", p.id) },
        {
          label: t.traces.layers[sf.layer],
          path: href("realisations", p.id, sf.layer),
        },
      ]}
      kicker={`${p.product} · ${t.traces.layers[sf.layer]}`}
      title={sf.title[lang]}
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="card space-y-5 p-6">
          <LayerBadge layer={sf.layer} label={t.traces.layers[sf.layer]} />
          <p className="text-lg leading-snug">{sf.body[lang]}</p>
          <Group title={t.traces.stack}>
            <Chips items={sf.stack} />
          </Group>
          {link && (
            <a
              href={link}
              target="_blank"
              rel="noopener"
              className="btn btn-sm btn-primary w-fit"
            >
              {t.traces.visit}
              <ArrowUpRight className="size-4" aria-hidden />
            </a>
          )}
        </div>
        <div className="grid content-start gap-3">
          <CardLink to={href("realisations", p.id, "trace")}>
            <p className="pr-8 font-semibold">{s.product.trace}</p>
            <p className="mt-1.5 text-sm text-ink-2">{s.product.traceLead}</p>
          </CardLink>
          <Pager
            prev={
              prev && {
                to: href("realisations", p.id, prev.layer),
                label: prev.title[lang],
              }
            }
            next={
              next && {
                to: href("realisations", p.id, next.layer),
                label: next.title[lang],
              }
            }
            s={s}
          />
        </div>
      </div>
    </Screen>
  );
}

function Trace({ id, ctx }: { id: string; ctx: Ctx }) {
  const { t, lang } = ctx;
  const s = t.screens;
  const p = TRACES.find((x) => x.id === id)!;
  return (
    <Screen
      t={s}
      crumbs={[
        workCrumb(s),
        { label: p.product, path: href("realisations", p.id) },
        { label: s.trace.kicker, path: href("realisations", p.id, "trace") },
      ]}
      kicker={s.trace.kicker}
      title={p.product}
      title2={s.product.traceLead}
      aside={
        <div className="segmented">
          {TRACES.map((x) => (
            <a
              key={x.id}
              href={href("realisations", x.id, "trace")}
              aria-current={x.id === id ? "page" : undefined}
              className={`rounded-[0.6rem] px-4 py-1.5 text-sm font-medium ${x.id === id ? "bg-raised text-ink shadow-sm" : "text-ink-2 hover:text-ink"}`}
            >
              {x.product}
            </a>
          ))}
        </div>
      }
    >
      <p className="mb-6 max-w-[70ch] text-sm text-ink-2">{t.traces.lead}</p>
      <TraceViewer key={p.id} traces={[p]} lang={lang} t={t.traces} />
    </Screen>
  );
}

function Project({ id, ctx }: { id: string; ctx: Ctx }) {
  const { t, lang } = ctx;
  const s = t.screens;
  const i = PROJECTS.findIndex((x) => slug(x.name) === id);
  if (i < 0) return null;
  const p = PROJECTS[i];
  const prev = PROJECTS[i - 1];
  const next = PROJECTS[i + 1];
  return (
    <Screen
      t={s}
      crumbs={[workCrumb(s), { label: p.name, path: href("realisations", id) }]}
      kicker={`${s.work.others} · ${t.work.kinds[p.kind]}`}
      title={p.name}
      aside={
        p.href ? (
          <a
            href={p.href}
            target="_blank"
            rel="noopener"
            className="btn btn-sm btn-primary"
          >
            {t.showcase.visit}
            <ArrowUpRight className="size-4" aria-hidden />
          </a>
        ) : (
          <span className="chip">{t.work.noLink}</span>
        )
      }
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <Shot src={p.image} alt={p.name} portrait={p.portrait} />
        <div className="space-y-5">
          <p className="text-lg leading-snug">{p.summary[lang]}</p>
          {p.stack.length > 0 && (
            <Group title={t.traces.stack}>
              <Chips items={p.stack} />
            </Group>
          )}
          <Pager
            prev={
              prev && {
                to: href("realisations", slug(prev.name)),
                label: prev.name,
              }
            }
            next={
              next && {
                to: href("realisations", slug(next.name)),
                label: next.name,
              }
            }
            s={s}
          />
        </div>
      </div>
    </Screen>
  );
}

/* --- Savoir-faire --------------------------------------------------------- */

const skillsCrumb = (s: Ui["screens"]): Crumb => ({
  label: s.skills.kicker,
  path: href("savoir-faire"),
});

function Skills({ ctx }: { ctx: Ctx }) {
  const { t, lang } = ctx;
  const s = t.screens;
  return (
    <Screen
      t={s}
      crumbs={[skillsCrumb(s)]}
      kicker={s.skills.kicker}
      title={s.skills.title}
      title2={s.skills.title2}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SKILLS.map((g) => (
          <CardLink key={g.layer} to={href("savoir-faire", g.layer)}>
            <LayerBadge
              layer={g.layer}
              label={`${t.hero.layers[g.layer]} · ${g.title[lang]}`}
            />
            <p className="mt-3 pr-6 leading-snug font-medium">
              {t.skills.plain[g.layer]}
            </p>
            <p className="mt-4 flex flex-wrap gap-2.5 text-ink-2">
              {[...new Set(g.items.flatMap((it) => it.icons ?? []))]
                .slice(0, 6)
                .map((ic) => (
                  <BrandIcon key={ic} slug={ic} className="size-4" />
                ))}
            </p>
          </CardLink>
        ))}
      </div>
    </Screen>
  );
}

function SkillLayer({ layer, ctx }: { layer: string; ctx: Ctx }) {
  const { t, lang } = ctx;
  const s = t.screens;
  const i = SKILLS.findIndex((g) => g.layer === layer);
  if (i < 0) return null;
  const g = SKILLS[i];
  const used = TRACES.flatMap((p) =>
    p.surfaces.filter((sf) => sf.layer === g.layer).map((sf) => ({ p, sf })),
  );
  const prev = SKILLS[i - 1];
  const next = SKILLS[i + 1];
  return (
    <Screen
      t={s}
      crumbs={[
        skillsCrumb(s),
        { label: t.hero.layers[g.layer], path: href("savoir-faire", g.layer) },
      ]}
      kicker={`${s.skills.kicker} · ${g.title[lang]}`}
      title={t.hero.layers[g.layer]}
      title2={t.skills.plain[g.layer]}
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)]">
        <Group title={s.skills.tools}>
          <ul className="grid gap-3 sm:grid-cols-2">
            {g.items.map((it) => (
              <li key={it.name} className="card p-4">
                <p className="flex h-5 items-center gap-2 text-ink-2">
                  {it.icons?.map((ic) => (
                    <BrandIcon key={ic} slug={ic} className="size-4.5" />
                  ))}
                </p>
                <p className="mt-2 font-semibold">{it.name}</p>
                <p className="mt-1 text-sm text-ink-2">{it.detail[lang]}</p>
              </li>
            ))}
          </ul>
        </Group>
        <div className="space-y-5">
          {used.length > 0 && (
            <Group title={s.skills.usedIn}>
              <div className="grid gap-3">
                {used.map(({ p, sf }) => (
                  <CardLink
                    key={p.id}
                    to={href("realisations", p.id, sf.layer)}
                    className="p-4"
                  >
                    <p className="text-xs text-ink-3">{p.product}</p>
                    <p className="pr-8 text-sm font-semibold">
                      {sf.title[lang]}
                    </p>
                  </CardLink>
                ))}
              </div>
            </Group>
          )}
          <Pager
            prev={
              prev && {
                to: href("savoir-faire", prev.layer),
                label: t.hero.layers[prev.layer],
              }
            }
            next={
              next && {
                to: href("savoir-faire", next.layer),
                label: t.hero.layers[next.layer],
              }
            }
            s={s}
          />
        </div>
      </div>
    </Screen>
  );
}

/* --- Parcours ------------------------------------------------------------- */

function Career({ ctx }: { ctx: Ctx }) {
  const { t, lang, now } = ctx;
  const s = t.screens;
  return (
    <Screen
      t={s}
      crumbs={[{ label: s.career.kicker, path: href("parcours") }]}
      kicker={s.career.kicker}
      title={s.career.title}
      title2={s.career.title2}
    >
      <div className="card p-5 sm:p-7">
        <CareerTrace
          spans={CAREER}
          axis={AXIS}
          now={now}
          lang={lang}
          t={t.career}
        />
      </div>
    </Screen>
  );
}

/* --- Comment ça marche ---------------------------------------------------- */

const howCrumb = (s: Ui["screens"]): Crumb => ({
  label: s.how.kicker,
  path: href("comment"),
});

function How({ ctx }: { ctx: Ctx }) {
  const { t } = ctx;
  const s = t.screens;
  return (
    <Screen
      t={s}
      crumbs={[howCrumb(s)]}
      kicker={s.how.kicker}
      title={t.how.title}
      title2={t.how.lead}
    >
      <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {t.how.steps.map((step, i) => {
          const Icon = STEP_ICON[i];
          return (
            <li key={step.name}>
              <CardLink to={href("comment", String(i + 1))} className="h-full">
                <span
                  className={`grid size-10 place-items-center rounded-xl text-white ${i === 4 ? "bg-go" : "bg-signal"}`}
                >
                  <Icon className="size-5" strokeWidth={1.75} aria-hidden />
                </span>
                <p className="mt-4 font-mono text-xs text-ink-3">0{i + 1}</p>
                <p className="font-semibold">{step.name}</p>
                <p className="text-sm text-ink-2">{step.analogy}</p>
              </CardLink>
            </li>
          );
        })}
      </ol>
      <p className="mt-6 max-w-[60ch] border-l-2 border-signal pl-4 text-ink-2">
        {t.how.outro}
      </p>
    </Screen>
  );
}

function Step({ index, ctx }: { index: number; ctx: Ctx }) {
  const { t } = ctx;
  const s = t.screens;
  const steps = t.how.steps;
  const step = steps[index - 1];
  if (!step) return null;
  const Icon = STEP_ICON[index - 1];
  return (
    <Screen
      t={s}
      crumbs={[
        howCrumb(s),
        { label: step.name, path: href("comment", String(index)) },
      ]}
      kicker={`${s.how.step} ${index} / ${steps.length} · ${step.analogy}`}
      title={step.title}
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="card flex flex-col gap-5 p-6 sm:p-8">
          <span
            className={`grid size-14 place-items-center rounded-2xl text-white ${index === steps.length ? "bg-go" : "bg-signal"}`}
          >
            <Icon className="size-7" strokeWidth={1.5} aria-hidden />
          </span>
          <p className="text-xl leading-snug">{step.body}</p>
          {/* Le chemin : chaque point est une étape, celle-ci est pleine. */}
          <ol className="flex items-center gap-2" aria-hidden>
            {steps.map((x, i) => (
              <li key={x.name} className="flex flex-1 items-center gap-2">
                <a
                  href={href("comment", String(i + 1))}
                  className={`h-1.5 flex-1 rounded-full ${i < index ? "bg-signal" : "bg-sunken"}`}
                />
              </li>
            ))}
          </ol>
        </div>
        <div className="grid content-start gap-3">
          <Pager
            prev={
              index > 1
                ? {
                    to: href("comment", String(index - 1)),
                    label: steps[index - 2].name,
                  }
                : undefined
            }
            next={
              index < steps.length
                ? {
                    to: href("comment", String(index + 1)),
                    label: steps[index].name,
                  }
                : undefined
            }
            s={s}
          />
          {index === steps.length && (
            <CardLink to={href("contact")}>
              <p className="pr-8 text-sm text-ink-2">{t.how.outro}</p>
            </CardLink>
          )}
        </div>
      </div>
    </Screen>
  );
}

/* --- Blog et contact ------------------------------------------------------ */

function Blog({ ctx }: { ctx: Ctx }) {
  const { t, lang, posts } = ctx;
  const s = t.screens;
  return (
    <Screen
      t={s}
      crumbs={[{ label: s.blog.kicker, path: href("blog") }]}
      kicker={s.blog.kicker}
      title={t.blog.latest}
      title2={s.blog.title2}
      aside={
        <Link href={`${base(lang)}/blog`} className="btn btn-sm">
          {t.blog.all}
        </Link>
      }
    >
      {posts.length === 0 ? (
        <p className="text-ink-2">{t.blog.empty}</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {posts.map((p) => (
            <CardLink key={p.slug} to={`${base(lang)}/blog/${p.slug}`}>
              <p className="text-xs text-ink-3">
                <time dateTime={p.date}>{p.dateLabel}</time> · {p.minutes}{" "}
                {t.blog.minutes}
              </p>
              <p className="mt-2 pr-6 leading-snug font-semibold">{p.title}</p>
              <p className="mt-2 line-clamp-3 text-sm text-ink-2">
                {p.description}
              </p>
            </CardLink>
          ))}
        </div>
      )}
    </Screen>
  );
}

function Contact({ ctx }: { ctx: Ctx }) {
  const { t, lang } = ctx;
  const s = t.screens;
  return (
    <Screen
      t={s}
      crumbs={[{ label: s.contact.kicker, path: href("contact") }]}
      kicker={s.contact.kicker}
      title={t.contact.title}
      title2={t.contact.lead}
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)]">
        <div className="card space-y-4 p-6 text-sm">
          <p className="text-ink-2">{t.contact.or}</p>
          <CopyEmail
            email={CONTACT.email}
            copy={t.hero.copy}
            copied={t.hero.copied}
          />
          <a
            href={CONTACT.whatsapp}
            target="_blank"
            rel="noopener"
            className="btn btn-sm w-fit"
          >
            {t.contact.whatsapp}, +225 07 69 88 37 30
            <ArrowUpRight className="size-4" aria-hidden />
          </a>
          <ul className="flex flex-wrap gap-2 border-t border-rule pt-4">
            {[
              { href: CONTACT.github, label: "GitHub" },
              { href: CONTACT.linkedin, label: "LinkedIn" },
              { href: CONTACT.tiktok, label: "TikTok" },
            ].map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  target="_blank"
                  rel="noopener"
                  className="chip hover:border-signal hover:text-signal"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="card p-6 sm:p-7">
          <ContactForm lang={lang} t={t.contact} />
        </div>
      </div>
    </Screen>
  );
}

/* --- Précédent / suivant -------------------------------------------------- */

function Pager({
  prev,
  next,
  s,
}: {
  prev?: { to: string; label: string };
  next?: { to: string; label: string };
  s: Ui["screens"];
}) {
  if (!prev && !next) return null;
  return (
    <div className="grid grid-cols-2 gap-3">
      {prev ? (
        <a
          href={prev.to}
          className="card group p-4 transition-colors hover:border-ink-3/60"
        >
          <span className="flex items-center gap-1 text-xs text-ink-3">
            <ChevronLeft className="size-3.5" aria-hidden />
            {s.previous}
          </span>
          <span className="mt-1 block truncate text-sm font-semibold group-hover:text-signal">
            {prev.label}
          </span>
        </a>
      ) : (
        <span />
      )}
      {next && (
        <a
          href={next.to}
          className="card group p-4 text-right transition-colors hover:border-ink-3/60"
        >
          <span className="flex items-center justify-end gap-1 text-xs text-ink-3">
            {s.next}
            <ChevronRight className="size-3.5" aria-hidden />
          </span>
          <span className="mt-1 block truncate text-sm font-semibold group-hover:text-signal">
            {next.label}
          </span>
        </a>
      )}
    </div>
  );
}
