import type { Translation } from '@/app/lib/translations';
import { ContactForm } from '@/app/components/contact/ContactForm';
import { ContactInfo } from '@/app/components/contact/ContactInfo';

type Props = {
  copy: Translation['contact'];
  whatsappLink: string;
};

export const Contact = ({ copy, whatsappLink }: Props) => (
  <section
    id='contato'
    className='section-shell section-alt section-glow section-divider scroll-mt-24'
  >
    <div className='section-inner'>
      <div className='grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start'>
        <div className='space-y-5 text-center lg:text-left'>
          <p className='text-xs uppercase tracking-[0.32em] text-[var(--muted)]'>
            {copy.tag}
          </p>
          <h2 className='section-title font-semibold text-[var(--text)]'>{copy.title}</h2>
          <p className='text-base text-[var(--muted)] md:text-lg'>{copy.body}</p>
          <ContactForm copy={copy.form} />
        </div>
        <ContactInfo copy={copy} whatsappLink={whatsappLink} />
      </div>
    </div>
  </section>
);
