import { TrophyIcon } from "@heroicons/react/24/outline";
import type { LandingCopy } from "@/content/landing";

interface ROIHighlightsProps {
  copy: LandingCopy["roiHighlights"];
}

export function ROIHighlights({ copy }: ROIHighlightsProps) {
  return (
    <section className="bg-neutral-100 py-20" aria-labelledby="roi-title">
      <div className="container space-y-10">
        <div className="max-w-2xl space-y-4">
          <h2 id="roi-title" className="text-3xl font-bold text-brand-primary">
            {copy.title}
          </h2>
          <p className="text-sm text-neutral-500">{copy.disclaimer}</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {copy.items.map((item) => (
            <article
              key={item.label}
              className="rounded-xl border border-neutral-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <TrophyIcon className="h-8 w-8 text-brand-accent" aria-hidden />
              <p className="mt-4 text-sm font-medium uppercase tracking-wide text-neutral-500">
                {item.label}
              </p>
              <p className="mt-2 text-3xl font-semibold text-brand-primary">{item.value}</p>
              <p className="mt-3 text-sm text-neutral-600">{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

