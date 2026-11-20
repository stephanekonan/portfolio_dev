import { CONTACT, type Ui } from "@/i18n/ui";

export default function Footer({ t }: { t: Ui }) {
  const links = [
    { href: CONTACT.github, label: "GitHub" },
    { href: CONTACT.linkedin, label: "LinkedIn" },
    { href: CONTACT.whatsapp, label: "WhatsApp" },
    { href: CONTACT.tiktok, label: "TikTok" },
  ];
  return (
    <footer className="border-t border-rule bg-paper/70 backdrop-blur-sm">
      <div className="mx-auto grid max-w-304 gap-6 px-4 py-10 text-sm sm:px-8 md:grid-cols-[1fr_auto]">
        <div className="space-y-1 text-ink-2">
          <p>{t.footer.offline}</p>
          <p>{t.footer.built}</p>
        </div>
        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          {links.map((l) => (
            <li key={l.label}>
              <a href={l.href} target="_blank" rel="noopener" className="chip transition-colors hover:border-signal hover:text-signal">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
