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
        <div className='mt-6 flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory md:grid md:grid-cols-2 md:gap-6 md:overflow-visible md:snap-none lg:grid-cols-3'>
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
