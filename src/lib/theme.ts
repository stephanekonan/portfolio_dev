export type Theme = "system" | "light" | "dark";

const KEY = "theme";

/**
 * Exécuté dans <head> avant le premier rendu : pose `data-theme` si le
 * visiteur a déjà choisi. Sans lui, la page s'afficherait d'abord dans la
 * teinte du système puis basculerait à l'hydratation.
 */
export const THEME_SCRIPT = `try{var t=localStorage.getItem("${KEY}");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;

const listeners = new Set<() => void>();
/** Dernier choix de la page, au cas où le stockage le refuserait. */
let memory: Theme | null = null;

export function readTheme(): Theme {
  if (memory) return memory;
  try {
    const value = localStorage.getItem(KEY);
    return value === "light" || value === "dark" ? value : "system";
  } catch {
    return "system";
  }
}

export function subscribeTheme(callback: () => void) {
  listeners.add(callback);
  // Un choix fait dans un autre onglet s'applique aussi à celui-ci.
  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY) return;
    memory = null;
    apply(readTheme());
    callback();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", onStorage);
  };
}

const PAPER = { light: "#eceee8", dark: "#0f1012" };

function apply(theme: Theme) {
  const root = document.documentElement;
  if (theme === "system") delete root.dataset.theme;
  else root.dataset.theme = theme;

  // La barre du navigateur mobile suit la teinte choisie, pas seulement celle
  // du système : les balises `theme-color` portent chacune une media query.
  document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((meta) => {
    meta.dataset.media ??= meta.media;
    if (theme === "system") {
      meta.media = meta.dataset.media;
      meta.content = meta.dataset.media.includes("dark") ? PAPER.dark : PAPER.light;
    } else {
      meta.media = "";
      meta.content = PAPER[theme];
    }
  });
}

export function setTheme(theme: Theme) {
  memory = theme;
  try {
    if (theme === "system") localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, theme);
  } catch {
    // Stockage refusé : le choix vaut pour la page en cours seulement.
  }
  const update = () => {
    apply(theme);
    listeners.forEach((l) => l());
  };
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduce && "startViewTransition" in document) document.startViewTransition(update);
  else update();
}
