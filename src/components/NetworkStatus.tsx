"use client";
import { useEffect, useState } from "react";
import type { Ui } from "@/i18n/ui";

interface Props {
  t: Ui["network"];
}

/**
 * Témoin du réseau réel du visiteur. Hors ligne, la page est servie par le
 * service worker ; le témoin le dit, et `data-network` sur `<html>` pâlit
 * légèrement le papier.
 */
export default function NetworkStatus({ t }: Props) {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const update = () => {
      setOnline(navigator.onLine);
      document.documentElement.dataset.network = navigator.onLine ? "online" : "offline";
    };
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  return (
    <span className="inline-flex items-center gap-2 text-xs font-semibold" role="status">
      <span className="relative flex size-2" aria-hidden>
        {!online && <span className="absolute inset-0 animate-ping rounded-full bg-signal opacity-60" />}
        <span className={`relative size-2 rounded-full ${online ? "bg-api" : "bg-signal"}`} />
      </span>
      <span className={online ? "sr-only lg:not-sr-only" : ""}>{online ? t.online : t.offline}</span>
    </span>
  );
}
