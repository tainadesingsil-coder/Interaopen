import Link from "next/link";
import type { LandingCopy, LocaleKey } from "@/content/landing";

interface FooterProps {
  copy: LandingCopy["footer"];
  locale: LocaleKey;
}

const sectionLabels: Record<LocaleKey, { contact: string; social: string; legal: string }> = {
  pt: {
    contact: "Contato",
    social: "Redes",
    legal: "Legal",
  },
  en: {
    contact: "Contact",
    social: "Social",
    legal: "Legal",
  },
  es: {
    contact: "Contacto",
    social: "Redes",
    legal: "Legal",
  },
};

export function Footer({ copy, locale }: FooterProps) {
  const labels = sectionLabels[locale];
  return (
    <footer className="bg-neutral-950 text-neutral-200" aria-labelledby="footer-title">
      <div className="container space-y-8 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <p id="footer-title" className="text-lg font-semibold text-white">
              InvestBA
            </p>
            <p className="text-sm text-neutral-400">{copy.address}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-white">{labels.contact}</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {copy.contacts.map((contact) => (
                <li key={contact.href}>
                  <Link href={contact.href} className="hover:text-brand-accent focus-ring">
                    {contact.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-white">{labels.social}</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {copy.social.map((social) => (
                <li key={social.href}>
                  <Link href={social.href} className="hover:text-brand-accent focus-ring" target="_blank" rel="noreferrer">
                    {social.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-white">{labels.legal}</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {copy.legal.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="hover:text-brand-accent focus-ring">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-6 text-xs text-neutral-500">
          {copy.disclaimer}
        </div>
      </div>
    </footer>
  );
}

