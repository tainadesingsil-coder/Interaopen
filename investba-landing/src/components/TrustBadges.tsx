import { CheckBadgeIcon } from "@heroicons/react/24/solid";
import type { LandingCopy } from "@/content/landing";

interface TrustBadgesProps {
  copy: LandingCopy["trustBadges"];
}

export function TrustBadges({ copy }: TrustBadgesProps) {
  return (
    <section className="bg-white py-16" aria-labelledby="trust-badges-title">
      <div className="container">
        <div className="mx-auto max-w-3xl text-center">
          <h2 id="trust-badges-title" className="text-2xl font-bold text-brand-primary">
            {copy.title}
          </h2>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-4">
          {copy.badges.map((badge) => (
            <div
              key={badge.label}
              className="rounded-xl border border-neutral-200 bg-neutral-100/60 p-6 text-center shadow-sm"
            >
              <CheckBadgeIcon className="mx-auto h-8 w-8 text-brand-accent" aria-hidden />
              <p className="mt-4 text-base font-semibold text-brand-primary">{badge.label}</p>
              <p className="mt-1 text-sm text-neutral-600">{badge.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

