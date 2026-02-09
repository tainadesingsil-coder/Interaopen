import { Mail, MapPin, PhoneCall } from 'lucide-react';
import { mapLocationUrl } from '@/app/lib/constants';
import type { Translation } from '@/app/lib/translations';

type Props = {
  copy: Translation['contact'];
  whatsappLink: string;
};

export const ContactInfo = ({ copy, whatsappLink }: Props) => (
  <div className='space-y-4'>
    <div className='panel-strong flex items-start gap-3 px-5 py-4 text-white/80'>
      <span className='inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-[var(--gold)]'>
        <PhoneCall className='h-5 w-5' />
      </span>
      <div>
        <p className='text-xs uppercase tracking-[0.2em] text-white/50'>
          {copy.cards.whatsapp}
        </p>
        <a
          href={whatsappLink}
          target='_blank'
          rel='noreferrer'
          className='mt-1 block text-sm font-semibold text-white'
        >
          {copy.whatsappValue}
        </a>
      </div>
    </div>
    <div className='panel-strong flex items-start gap-3 px-5 py-4 text-white/80'>
      <span className='inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-[var(--gold)]'>
        <Mail className='h-5 w-5' />
      </span>
      <div>
        <p className='text-xs uppercase tracking-[0.2em] text-white/50'>
          {copy.cards.email}
        </p>
        <a
          href={`mailto:${copy.email}`}
          className='mt-1 block text-sm font-semibold text-white'
        >
          {copy.email}
        </a>
      </div>
    </div>
    <div className='panel-strong flex items-start gap-3 px-5 py-4 text-white/80'>
      <span className='inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-[var(--gold)]'>
        <MapPin className='h-5 w-5' />
      </span>
      <div>
        <p className='text-xs uppercase tracking-[0.2em] text-white/50'>
          {copy.cards.location}
        </p>
        <a
          href={mapLocationUrl}
          target='_blank'
          rel='noreferrer'
          className='mt-1 inline-flex text-sm font-semibold text-white transition hover:text-[var(--gold)]'
        >
          {copy.location}
        </a>
      </div>
    </div>
  </div>
);
