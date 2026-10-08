"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { checkCode, isKey, newSession, sessionCookie } from "./access";

export type UnlockState = { error: string } | undefined;

/** Retour à la page demandée, à condition qu'elle soit dans l'espace privé. */
const target = (cle: string, next: FormDataEntryValue | null) => {
  const path = String(next ?? "");
  return path === `/${cle}` || path.startsWith(`/${cle}/`) ? path : `/${cle}`;
};

export async function unlock(_: UnlockState, form: FormData): Promise<UnlockState> {
  const cle = String(form.get("cle") ?? "");
  if (!isKey(cle)) return { error: "Code incorrect." };
  if (!checkCode(String(form.get("code") ?? ""))) {
    // Une seconde de pénalité par essai raté : deviner le code à la chaîne
    // devient lent. Un code long reste la vraie protection.
    await new Promise((r) => setTimeout(r, 1000));
    return { error: "Code incorrect." };
  }
  (await cookies()).set({ ...sessionCookie(cle), value: newSession() });
  redirect(target(cle, form.get("next")));
}

export async function lock(form: FormData) {
  const cle = String(form.get("cle") ?? "");
  if (!isKey(cle)) return;
  const { name, path } = sessionCookie(cle);
  (await cookies()).delete({ name, path });
  redirect(`/${cle}`);
}
