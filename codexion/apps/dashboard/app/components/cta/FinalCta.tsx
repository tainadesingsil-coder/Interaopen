import type { Translation } from '@/app/lib/translations';

type Props = {
  copy: Translation['finalCta'];
  whatsappLink: string;
};

export const FinalCta = ({ copy, whatsappLink }: Props) => (
  <section
    id='experiencia'
    className='section-shell section-base section-glow section-divider scroll-mt-24'
  >
    <div className='section-inner'>
      <div className='flex flex-col items-center gap-6 text-center'>
        <h2 className='section-title font-semibold text-[var(--text)]'>{copy.title}</h2>
        <p className='text-base text-[var(--muted)] md:text-lg lg:max-w-[48ch]'>
          {copy.body}
        </p>
        <div className='flex flex-col gap-3 sm:flex-row'>
          <a
            href={whatsappLink}
            target='_blank'
            rel='noreferrer'
            className='inline-flex items-center justify-center rounded-full bg-[var(--gold)] px-6 py-3 text-sm font-semibold text-[#0c1116] transition hover:brightness-110'
          >
            {copy.primary}
          </a>
          <a
            href='#obra'
            className='inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white/80 transition hover:border-[var(--gold)]/40 hover:text-white'
          >
            {copy.secondary}
          </a>
        </div>
      </div>
    </div>
  </section>
);
