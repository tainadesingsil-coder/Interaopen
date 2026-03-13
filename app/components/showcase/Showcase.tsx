import type { Translation } from '@/app/lib/translations';
import { ShowcaseCard } from '@/app/components/showcase/ShowcaseCard';

type Props = {
  copy: Translation['showcase'];
};

export const Showcase = ({ copy }: Props) => {
  return (
    <section id='contexto' className='section-shell section-glow scroll-mt-24 bg-[var(--bg-0)]'>
      <div className='section-inner'>
        <div className='flex flex-col gap-3'>
          <p className='text-xs uppercase tracking-[0.32em] text-[var(--muted)]'>
            {copy.title}
          </p>
          <h3 className='section-title font-semibold text-[var(--text)]'>
            {copy.subtitle}
          </h3>
        </div>
        <div className='mt-6 flex snap-x snap-mandatory gap-6 overflow-x-auto px-1 pb-4 md:grid md:grid-cols-2 md:gap-6 md:overflow-visible md:px-0 md:snap-none lg:grid-cols-3'>
          {copy.cards.map((item, index) => (
            <ShowcaseCard
              key={item.label}
              {...item}
              index={index}
              detailsOpenLabel={copy.detailsOpen}
              detailsCloseLabel={copy.detailsClose}
              dialogLabel={copy.dialogLabel}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
