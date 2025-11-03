import {
  ChartBarIcon,
  MapPinIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import type { LandingCopy } from "@/content/landing";

interface BenefitsProps {
  copy: LandingCopy["benefits"];
}

const icons = [MapPinIcon, UserGroupIcon, ChartBarIcon];

export function Benefits({ copy }: BenefitsProps) {
  return (
    <section className="bg-neutral-100 py-20" aria-labelledby="benefits-title">
      <div className="container">
        <div className="mb-12 max-w-3xl">
          <h2 id="benefits-title" className="text-3xl font-bold text-brand-primary">
            {copy.title}
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {copy.items.map((item, index) => {
            const Icon = icons[index % icons.length];
            return (
              <div
                key={item.title}
                className="flex h-full flex-col rounded-xl border border-neutral-200 bg-white p-8 shadow-sm"
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-accent/10 text-brand-accent">
                  <Icon className="h-6 w-6" aria-hidden />
                </span>
                <h3 className="mt-6 text-xl font-semibold text-brand-primary">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-neutral-600">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

