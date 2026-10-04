"use client";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check, Copy } from "lucide-react";

interface Props {
  email: string;
  copy: string;
  copied: string;
}

export default function CopyEmail({ email, copy, copied }: Props) {
  const reduce = useReducedMotion();
  const [done, setDone] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setDone(true);
      setTimeout(() => setDone(false), 2200);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  };

  return (
    <span className="inline-flex flex-wrap items-center gap-x-4 gap-y-2">
      <a href={`mailto:${email}`} className="font-semibold underline">
        {email}
      </a>
      <button
        onClick={onCopy}
        className="inline-flex items-center gap-1.5 border border-rule px-2.5 py-1 text-xs font-semibold hover:border-ink"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={done ? "done" : "idle"}
            initial={{ opacity: 0, y: reduce ? 0 : 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduce ? 0 : -4 }}
            transition={{ duration: 0.15 }}
            className="inline-flex items-center gap-1.5"
          >
            {done ? <Check className="size-3.5 text-api" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
            {done ? copied : copy}
          </motion.span>
        </AnimatePresence>
      </button>
      <span aria-live="polite" className="sr-only">
        {done ? copied : ""}
      </span>
    </span>
  );
}
