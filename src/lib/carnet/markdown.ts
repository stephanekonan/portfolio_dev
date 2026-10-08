import "server-only";
import matter from "gray-matter";
import { Marked, type Tokens } from "marked";
import { formatDate } from "@/lib/blog";

/**
 * Markdown de l'espace privé : celui du blog, plus des ancres sur les titres
 * (pour le sommaire) et quelques blocs propres au carnet, écrits comme des
 * blocs de code dont la « langue » donne le composant :
 *
 * ```progression   frise date → événement → ce que j'ai appris → suite
 * ```cercle        boucle d'étapes, la dernière ramène à la première
 * ```colonnes      deux colonnes titrées, chacune une liste de points
 * ```chiffres      indicateurs du lancement, lus dans `carnet/chiffres.md`
 * ```retiens       encadré final « Ce que j'en retiens »
 *
 * Le contenu d'un bloc est du YAML (voir `carnet/LISEZMOI.md`). Partout,
 * `[[texte]]` signale une information à compléter et s'affiche comme telle.
 *
 * Tout est rendu en HTML statique sur le serveur : aucun JavaScript côté
 * navigateur. Seul l'auteur écrit ces fichiers, aucune saisie de visiteur
 * n'y passe.
 */

export interface TocItem {
  id: string;
  /** HTML du titre, entités comprises. */
  html: string;
  depth: 2 | 3;
}

/** Indicateurs du lancement, saisis à la main. `null` : pas encore connu. */
export interface Figures {
  updated: string;
  launch: string;
  /** Premier jour du plan de 30 jours, `AAAA-MM-JJ`. */
  start: string;
  contacted: number | null;
  partners: number | null;
  users: number | null;
  orders: number | null;
}

const ESC: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
export const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ESC[c]);

export const slugify = (s: string) =>
  s
    .replace(/<[^>]+>/g, "")
    .replace(/&[#a-z0-9]+;/gi, "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** gray-matter lit une date YAML nue comme un objet Date. */
export const toDay = (v: unknown) =>
  v instanceof Date ? v.toISOString().slice(0, 10) : v == null ? "" : String(v);

const isDay = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s);

/** YAML d'un bloc, lu par le même moteur que les en-têtes des fichiers. */
function yaml(src: string): Record<string, unknown> {
  try {
    const data = matter(`---\n${src}\n---\n`).data;
    return data && typeof data === "object" ? data : {};
  } catch {
    return {};
  }
}

const list = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const text = (v: unknown) => (v == null ? "" : toDay(v).trim());

const TODO = /\[\[(.+?)\]\]/g;
const todo = (html: string) =>
  html.replace(TODO, '<mark class="c-todo"><span class="c-todo-label">À compléter</span> $1</mark>');

export function figuresHtml(f: Figures) {
  const today = new Date().toISOString().slice(0, 10);
  const days = isDay(f.launch)
    ? Math.round((Date.parse(today) - Date.parse(f.launch)) / 86_400_000)
    : null;
  const items: [string, number | null, string?][] = [
    ["Restaurants contactés", f.contacted],
    ["Restaurants partenaires", f.partners],
    ["Utilisateurs", f.users],
    ["Commandes", f.orders],
    days !== null && days < 0
      ? ["Jours avant le lancement", -days]
      : ["Jours depuis le lancement", days, "date de lancement à renseigner"],
  ];
  const cells = items
    .map(([label, value, hint]) => {
      const dd =
        value === null
          ? `<dd class="c-stats-empty"><span aria-hidden="true">—</span><span class="c-stats-hint">${hint ?? "à renseigner"}</span></dd>`
          : `<dd>${value.toLocaleString("fr-FR")}</dd>`;
      return `<div><dt>${label}</dt>${dd}</div>`;
    })
    .join("");
  const note = isDay(f.updated) ? `Chiffres au ${formatDate(f.updated, "fr")}. ` : "";
  return `<section class="c-stats" aria-label="Wadibu en chiffres"><dl>${cells}</dl><p class="c-stats-note">${note}Saisis à la main, jamais estimés.</p></section>`;
}

export function render(markdown: string, figures: Figures): { html: string; toc: TocItem[] } {
  const toc: TocItem[] = [];
  const used = new Map<string, number>();
  const anchor = (label: string) => {
    const id = slugify(label) || "section";
    const n = used.get(id) ?? 0;
    used.set(id, n + 1);
    return n ? `${id}-${n + 1}` : id;
  };

  const md = new Marked();
  const inline = (v: unknown) => md.parseInline(text(v), { async: false });
  const date = (v: unknown) => {
    const s = text(v);
    return isDay(s) ? `<time datetime="${s}">${formatDate(s, "fr")}</time>` : inline(s);
  };

  const blocks: Record<string, (data: Record<string, unknown>) => string> = {
    progression({ etapes }) {
      const steps = list(etapes).map((raw) => {
        const s = (raw ?? {}) as Record<string, unknown>;
        const learned = text(s.appris);
        const next = text(s.suite);
        const state = text(s.statut) || (learned || next ? "fait" : "a-venir");
        const detail = [
          ["Ce que j'ai appris", learned],
          ["Prochaine étape", next],
        ]
          .filter(([, v]) => v)
          .map(([k, v]) => `<div><dt>${k}</dt><dd>${inline(v)}</dd></div>`)
          .join("");
        return `<li data-etat="${escapeHtml(state)}"><p class="c-prog-date">${date(s.date)}</p><p class="c-prog-event">${inline(s.evenement)}</p>${
          detail ? `<dl>${detail}</dl>` : state === "a-venir" ? `<p class="c-prog-soon">À venir</p>` : ""
        }</li>`;
      });
      return `<ol class="c-prog">${steps.join("")}</ol>`;
    },

    cercle({ etapes, note }) {
      const steps = list(etapes).map((s) => `<li>${inline(s)}</li>`);
      const caption = text(note) ? `<figcaption>${inline(note)}</figcaption>` : "";
      return `<figure class="c-cycle"><ol>${steps.join("")}</ol><p class="sr-only">Chaque étape mène à la suivante, et la dernière ramène à la première.</p><p class="c-cycle-loop" aria-hidden="true">et la boucle repart</p>${caption}</figure>`;
    },

    colonnes({ colonnes }) {
      const cols = list(colonnes).map((raw) => {
        const c = (raw ?? {}) as Record<string, unknown>;
        const sub = text(c.sous_titre) ? `<p class="c-cols-sub">${inline(c.sous_titre)}</p>` : "";
        const points = list(c.points).map((p) => `<li>${inline(p)}</li>`);
        return `<section><h3>${inline(c.titre)}</h3>${sub}<ul>${points.join("")}</ul></section>`;
      });
      return `<div class="c-cols">${cols.join("")}</div>`;
    },

    chiffres: () => figuresHtml(figures),

    retiens({ points }) {
      const id = anchor("Ce que j'en retiens");
      toc.push({ id, html: "Ce que j'en retiens", depth: 2 });
      const items = list(points).map((p) => `<li>${inline(p)}</li>`);
      return `<aside class="c-retiens" aria-labelledby="${id}"><h2 id="${id}">Ce que j'en retiens</h2><ul>${items.join("")}</ul></aside>`;
    },
  };

  md.use({
    renderer: {
      heading({ tokens, depth }: Tokens.Heading) {
        const html = this.parser.parseInline(tokens);
        const id = anchor(html);
        // Le sommaire garde le texte du titre, sans liens ni balises.
        if (depth === 2 || depth === 3) toc.push({ id, html: html.replace(/<[^>]+>/g, ""), depth });
        return `<h${depth} id="${id}">${html}</h${depth}>\n`;
      },
      code({ text: src, lang }: Tokens.Code) {
        const block = lang && blocks[lang];
        return block ? block(yaml(src)) : false;
      },
    },
  });

  return { html: todo(md.parse(markdown, { async: false })), toc };
}

/** Pour le texte court d'un en-tête (conclusion d'une entrée, etc.). */
export const renderInline = (s: string) => todo(new Marked().parseInline(s, { async: false }));
