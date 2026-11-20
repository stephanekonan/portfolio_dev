"use client";
import { useEffect } from "react";

const SELECTOR = "svg[class*='lucide']";

function strip(root: ParentNode) {
  for (const svg of root.querySelectorAll(SELECTOR)) {
    for (const name of [...svg.classList]) if (name.startsWith("lucide")) svg.classList.remove(name);
  }
}

/**
 * Retire des icônes les classes `lucide`, `lucide-<nom>` que la librairie
 * pose toujours et auxquelles les détecteurs de technologies la
 * reconnaissent. Aucun style n'en dépend. Fait après l'hydratation (le HTML
 * serveur et le premier rendu restent identiques), puis à chaque ajout
 * d'icône. Voir aussi `src/lib/discretion.ts`.
 */
export default function Discretion() {
  useEffect(() => {
    strip(document);
    const observer = new MutationObserver((records) => {
      for (const r of records) {
        if (r.type === "attributes") {
          if (r.target instanceof SVGElement && r.target.matches(SELECTOR)) strip(r.target.parentNode ?? document);
        } else {
          for (const node of r.addedNodes) if (node instanceof Element) strip(node.parentNode ?? node);
        }
      }
    });
    observer.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);
  return null;
}
