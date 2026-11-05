"use client";
import { useEffect, useRef, useState } from "react";
import { Headphones, Pause, Play, Square } from "lucide-react";
import type { Lang, Ui } from "@/i18n/ui";

interface Props {
  /** Langue du texte lu, qui peut différer de celle de la page. */
  lang: Lang;
  title: string;
  description: string;
  t: Ui["blog"];
}

type Status = "idle" | "playing" | "paused";

const RATES = [1, 1.25, 1.5, 2, 0.75];
/** Chrome coupe un énoncé long au bout d'une quinzaine de secondes : on lit par phrases. */
const MAX_CHUNK = 220;

/**
 * Lecture à voix haute de l'article par la synthèse vocale du navigateur
 * (Web Speech API) : rien à générer ni à héberger, la voix est celle de
 * l'appareil. Les blocs de code et les tableaux ne sont pas lus.
 *
 * La pause annule l'énoncé en cours et la reprise relit la phrase entière :
 * `speechSynthesis.pause()` est peu fiable sur Android.
 */
export default function AudioReader({ lang, title, description, t }: Props) {
  const [supported, setSupported] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [rateIndex, setRateIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const chunks = useRef<string[]>([]);
  const index = useRef(0);
  const rate = useRef(RATES[0]);
  // Chaque annulation change de génération : Chrome déclenche `onend` sur un
  // énoncé annulé, qui ne doit pas enchaîner sur la phrase suivante.
  const generation = useRef(0);
  const voice = useRef<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    const synth = window.speechSynthesis;
    const update = () => {
      const voices = synth.getVoices();
      voice.current = pickVoice(voices, lang);
      // Liste vide : certains Android ne la remplissent jamais mais parlent
      // quand même. Liste pleine sans la langue : lire avec une voix
      // étrangère serait incompréhensible, le lecteur reste caché.
      setSupported(voices.length === 0 || voice.current !== null);
    };
    update();
    synth.addEventListener("voiceschanged", update);
    const stop = () => {
      generation.current++;
      synth.cancel();
    };
    window.addEventListener("pagehide", stop);
    return () => {
      synth.removeEventListener("voiceschanged", update);
      window.removeEventListener("pagehide", stop);
      stop();
    };
  }, [lang]);

  const speak = (i: number) => {
    const synth = window.speechSynthesis;
    const list = chunks.current;
    if (i >= list.length) {
      index.current = 0;
      setProgress(0);
      setStatus("idle");
      return;
    }
    index.current = i;
    setProgress(i / list.length);
    const gen = generation.current;
    const u = new SpeechSynthesisUtterance(list[i]);
    u.lang = lang === "fr" ? "fr-FR" : "en-US";
    if (voice.current) u.voice = voice.current;
    u.rate = rate.current;
    u.onend = () => {
      if (gen === generation.current) speak(i + 1);
    };
    u.onerror = (e) => {
      if (gen !== generation.current || e.error === "interrupted" || e.error === "canceled") return;
      setStatus("idle");
    };
    synth.speak(u);
    setStatus("playing");
  };

  const restart = () => {
    generation.current++;
    window.speechSynthesis.cancel();
  };

  const play = () => {
    if (status === "paused") return speak(index.current);
    chunks.current = collect(title, description);
    restart();
    speak(0);
  };

  const pause = () => {
    restart();
    setStatus("paused");
  };

  const stop = () => {
    restart();
    index.current = 0;
    setProgress(0);
    setStatus("idle");
  };

  const cycleRate = () => {
    const next = (rateIndex + 1) % RATES.length;
    setRateIndex(next);
    rate.current = RATES[next];
    // La vitesse s'applique tout de suite : la phrase en cours est relue.
    if (status === "playing") {
      restart();
      speak(index.current);
    }
  };

  if (!supported) return null;

  const speed = `${String(RATES[rateIndex]).replace(".", lang === "fr" ? "," : ".")}×`;

  return (
    <div className="mt-7">
      <div className="flex flex-wrap items-center gap-3">
        {status === "playing" ? (
          <button type="button" onClick={pause} className="btn btn-sm">
            <Pause className="size-4" aria-hidden />
            {t.pause}
          </button>
        ) : (
          <button type="button" onClick={play} className="btn btn-sm">
            {status === "paused" ? <Play className="size-4" aria-hidden /> : <Headphones className="size-4" aria-hidden />}
            {status === "paused" ? t.resume : t.listen}
          </button>
        )}
        {status !== "idle" && (
          <>
            <button type="button" onClick={stop} className="btn btn-sm" aria-label={t.stop} title={t.stop}>
              <Square className="size-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={cycleRate}
              className="btn btn-sm tabular-nums"
              aria-label={`${t.speed} : ${speed}`}
              title={t.speed}
            >
              {speed}
            </button>
          </>
        )}
      </div>
      {status !== "idle" && (
        <div
          role="progressbar"
          aria-label={t.listen}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
          className="mt-4 h-0.5 max-w-xs bg-rule"
        >
          <div className="h-full bg-ink transition-[width] duration-300" style={{ width: `${progress * 100}%` }} />
        </div>
      )}
    </div>
  );
}

/** Une voix de la langue, en préférant les voix « naturelles » ou en ligne, plus agréables. */
function pickVoice(voices: SpeechSynthesisVoice[], lang: Lang) {
  const main = lang === "fr" ? "fr-fr" : "en-us";
  const score = (v: SpeechSynthesisVoice) =>
    (/natural|neural|online/i.test(v.name) ? 4 : 0) +
    (/google/i.test(v.name) ? 2 : 0) +
    (v.lang.toLowerCase().replace("_", "-") === main ? 1 : 0);
  return (
    voices
      .filter((v) => v.lang.toLowerCase().startsWith(lang))
      .sort((a, b) => score(b) - score(a))[0] ?? null
  );
}

/** Le texte à lire : titre, résumé, puis les blocs de l'article, découpés en phrases. */
function collect(title: string, description: string) {
  const root = document.querySelector("[data-listen]");
  const blocks = [title, description];
  root?.querySelectorAll("h2, h3, p, li, blockquote").forEach((el) => {
    // Pas de code ni de tableau, et un bloc imbriqué (paragraphe d'un
    // élément de liste) est déjà lu avec son parent.
    if (el.closest("pre, table") || el.parentElement?.closest("li, blockquote")) return;
    blocks.push(el.textContent ?? "");
  });
  return blocks.flatMap(split);
}

function split(text: string) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return [];
  const sentences = clean.match(/[^.!?…;:]+[.!?…;:]*\s*/g) ?? [clean];
  const out: string[] = [];
  let current = "";
  for (const s of sentences.flatMap((s) => (s.length > MAX_CHUNK ? s.split(/(?<=,)\s+/) : [s]))) {
    if (current && current.length + s.length > MAX_CHUNK) {
      out.push(current.trim());
      current = "";
    }
    current += s;
  }
  if (current.trim()) out.push(current.trim());
  return out;
}
