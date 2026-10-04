"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Send } from "lucide-react";
import type { Lang, Ui } from "@/i18n/ui";

interface Props {
  lang: Lang;
  t: Ui["contact"];
}

interface Pending {
  id: string;
  name: string;
  email: string;
  message: string;
  lang: Lang;
}

type Status = "idle" | "sending" | "sent" | "queued" | "flushed" | "error" | "invalid";

/**
 * Le même principe que la file d'envoi de Resi : un message écrit sans
 * réseau est gardé sur l'appareil et part au retour de la connexion. L'`id`
 * voyage avec le message pour qu'un envoi rejoué se reconnaisse dans la
 * boîte de réception.
 */
const OUTBOX = "portfolio-outbox";

const readOutbox = (): Pending[] => {
  try {
    return JSON.parse(localStorage.getItem(OUTBOX) ?? "[]");
  } catch {
    return [];
  }
};

const writeOutbox = (items: Pending[]) => {
  try {
    localStorage.setItem(OUTBOX, JSON.stringify(items));
  } catch {
    // Stockage indisponible (navigation privée) : le message reste en mémoire le temps de la page.
  }
};

const uuid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

async function deliver(item: Pending, elapsed: number, website: string): Promise<"ok" | "network" | "retry" | "error"> {
  try {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...item, elapsed, website }),
    });
    if (res.ok) return "ok";
    // 429 et 5xx : le serveur ou Mailtrap flanche, le message reste valable.
    return res.status === 429 || res.status >= 500 ? "retry" : "error";
  } catch {
    return "network";
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ContactForm({ lang, t }: Props) {
  const reduce = useReducedMotion();
  const [status, setStatus] = useState<Status>("idle");
  // Posé au montage : sert à écarter les envois trop rapides pour un humain.
  const mountedAt = useRef(0);
  const flushing = useRef(false);

  const flush = async () => {
    if (flushing.current || !navigator.onLine) return;
    const items = readOutbox();
    if (items.length === 0) return;
    flushing.current = true;
    // En série, comme la synchronisation de Resi : l'ordre d'écriture est conservé.
    for (const item of items) {
      const result = await deliver(item, Number.MAX_SAFE_INTEGER, "");
      if (result === "network" || result === "retry") break;
      writeOutbox(readOutbox().filter((p) => p.id !== item.id));
      if (result === "ok") setStatus("flushed");
    }
    flushing.current = false;
  };

  useEffect(() => {
    mountedAt.current = Date.now();
    // Vidage différé : la file du dernier passage part sans bloquer le premier rendu.
    const id = setTimeout(flush, 0);
    window.addEventListener("online", flush);
    return () => {
      clearTimeout(id);
      window.removeEventListener("online", flush);
    };
  }, []);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const item: Pending = {
      id: uuid(),
      name: String(data.get("name") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      message: String(data.get("message") ?? "").trim(),
      lang,
    };
    const website = String(data.get("website") ?? "");

    if (!item.name || !EMAIL_RE.test(item.email) || item.message.length < 10) {
      setStatus("invalid");
      return;
    }

    const queue = () => {
      writeOutbox([...readOutbox(), item]);
      form.reset();
      setStatus("queued");
    };

    if (!navigator.onLine) return queue();

    setStatus("sending");
    const result = await deliver(item, Date.now() - mountedAt.current, website);
    if (result === "ok") {
      form.reset();
      setStatus("sent");
    } else if (result === "network") {
      queue();
    } else {
      setStatus("error");
    }
  };

  const message =
    status === "sent"
      ? t.sent
      : status === "queued"
        ? t.queued
        : status === "flushed"
          ? t.flushed
          : status === "error"
            ? t.error
            : status === "invalid"
              ? t.invalid
              : "";
  const tone =
    status === "error" || status === "invalid" ? "var(--layer-infra)" : status === "queued" ? "var(--signal)" : "var(--layer-api)";

  const field =
    "mt-1.5 block w-full border-0 border-b border-ink bg-transparent px-0 py-2 text-base outline-none transition-colors placeholder:text-ink-2/60 focus:border-b-2 focus-visible:outline-none";

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-7">
      <div className="grid gap-7 sm:grid-cols-2">
        <label className="block text-sm font-semibold">
          {t.name}
          <input name="name" autoComplete="name" required className={field} />
        </label>
        <label className="block text-sm font-semibold">
          {t.email}
          <input name="email" type="email" autoComplete="email" required className={field} />
        </label>
      </div>
      <label className="block text-sm font-semibold">
        {t.message}
        <textarea name="message" rows={5} required className={`${field} resize-y`} />
      </label>
      {/* Champ piège : invisible pour un humain, rempli par les robots. */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-5">
        <button
          type="submit"
          disabled={status === "sending"}
          className="inline-flex items-center gap-2 bg-ink px-6 py-3 font-semibold text-paper transition-opacity disabled:opacity-50"
        >
          <Send className="size-4" aria-hidden />
          {status === "sending" ? t.sending : t.send}
        </button>
        <div aria-live="polite" className="min-h-6 flex-1 text-sm">
          <AnimatePresence mode="wait">
            {message && (
              <motion.p
                key={status}
                initial={{ opacity: 0, x: reduce ? 0 : -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-start gap-2"
              >
                <span className="mt-1.5 size-2 shrink-0 rounded-full" style={{ background: tone }} aria-hidden />
                {message}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </form>
  );
}
