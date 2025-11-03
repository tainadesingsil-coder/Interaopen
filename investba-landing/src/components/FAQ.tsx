import { MinusSmallIcon, PlusSmallIcon } from "@heroicons/react/24/outline";
import type { LandingCopy } from "@/content/landing";

interface FAQProps {
  copy: LandingCopy["faq"];
}

export function FAQ({ copy }: FAQProps) {
  return (
    <section className="bg-white py-20" aria-labelledby="faq-title">
      <div className="container">
        <div className="max-w-2xl space-y-4">
          <h2 id="faq-title" className="text-3xl font-bold text-brand-primary">
            {copy.title}
          </h2>
        </div>
        <div className="mt-8 space-y-4">
          {copy.items.map((item) => (
            <details
              key={item.question}
              className="group rounded-xl border border-neutral-200 bg-neutral-100/60 p-6 transition hover:border-brand-accent"
            >
              <summary className="flex cursor-pointer items-start justify-between gap-4 text-left text-brand-primary">
                <span className="text-lg font-semibold leading-snug">{item.question}</span>
                <span className="mt-1 flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300 bg-white text-brand-primary transition group-open:border-brand-accent group-open:bg-brand-accent group-open:text-white">
                  <PlusSmallIcon className="h-5 w-5 group-open:hidden" aria-hidden />
                  <MinusSmallIcon className="hidden h-5 w-5 group-open:block" aria-hidden />
                </span>
              </summary>
              <p className="mt-4 text-sm leading-relaxed text-neutral-600">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

