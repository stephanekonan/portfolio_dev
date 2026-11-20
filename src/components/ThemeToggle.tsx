"use client";
import { useId, useSyncExternalStore } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Monitor, Moon, Sun } from "lucide-react";
import { readTheme, setTheme, subscribeTheme, type Theme } from "@/lib/theme";
import type { Ui } from "@/i18n/ui";

const OPTIONS: { value: Theme; Icon: typeof Sun }[] = [
  { value: "system", Icon: Monitor },
  { value: "light", Icon: Sun },
  { value: "dark", Icon: Moon },
];

export default function ThemeToggle({ t }: { t: Ui["theme"] }) {
  const reduce = useReducedMotion();
  // Deux sélecteurs coexistent (barre et menu mobile) : chacun son indicateur.
  const indicator = useId();
  // Côté serveur, le choix du visiteur est inconnu : « système » jusqu'à
  // l'hydratation. Le script de tête a déjà posé la bonne teinte entre-temps.
  const theme = useSyncExternalStore(subscribeTheme, readTheme, () => "system" as Theme);

  return (
    <div role="group" aria-label={t.label} className="segmented">
      {OPTIONS.map(({ value, Icon }) => {
        const active = theme === value;
        return (
          <button
            key={value}
            aria-pressed={active}
            aria-label={t[value]}
            title={t[value]}
            onClick={() => !active && setTheme(value)}
            className="relative grid size-7 place-items-center rounded-[0.6rem]"
          >
            {active && (
              <motion.span
                layoutId={`theme-${indicator}`}
                className="segmented-thumb"
                transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 550, damping: 38 }}
              />
            )}
            <Icon className={`relative size-3.5 ${active ? "text-ink" : "text-ink-3"}`} aria-hidden />
          </button>
        );
      })}
    </div>
  );
}
