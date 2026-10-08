"use client";
import { useActionState } from "react";
import { KeyRound } from "lucide-react";
import { unlock } from "@/lib/carnet/actions";

const field =
  "mt-1.5 block w-full border-0 border-b border-ink bg-transparent px-0 py-2 text-base outline-none transition-colors focus:border-b-2 focus-visible:outline-none";

/**
 * Formulaire de code, servi à la place de toute page de l'espace privé tant
 * que la session n'est pas ouverte. Fonctionne sans JavaScript : c'est un
 * formulaire HTML posté à une Server Action.
 */
export default function Unlock({ cle, next }: { cle: string; next: string }) {
  const [state, action, pending] = useActionState(unlock, undefined);
  return (
    <div className="mx-auto max-w-304 px-4 pb-28 pt-14 sm:px-8">
      <p className="font-mono text-sm text-ink-2">GET {"→"} 401</p>
      <h1 className="mt-4 font-display text-3xl font-extrabold font-stretch-140%">Espace privé</h1>
      <p className="mt-4 max-w-[52ch] text-lg text-ink-2">
        Ces pages ne sont pas publiques. Entrez le code d&apos;accès pour les lire.
      </p>
      <form action={action} className="mt-12 grid max-w-sm gap-7">
        <input type="hidden" name="cle" value={cle} />
        <input type="hidden" name="next" value={next} />
        <label className="block text-sm font-semibold">
          Code d&apos;accès
          <input
            name="code"
            type="password"
            autoComplete="current-password"
            required
            autoFocus
            aria-invalid={state?.error ? true : undefined}
            aria-describedby="code-erreur"
            className={field}
          />
        </label>
        <div className="flex flex-wrap items-center gap-5">
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center gap-2 bg-ink px-6 py-3 font-semibold text-paper transition-opacity disabled:opacity-50"
          >
            <KeyRound className="size-4" aria-hidden />
            {pending ? "Vérification" : "Ouvrir"}
          </button>
          <p id="code-erreur" aria-live="polite" className="min-h-6 text-sm">
            {state?.error}
          </p>
        </div>
      </form>
    </div>
  );
}
