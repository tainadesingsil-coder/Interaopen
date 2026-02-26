'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Bath, BedDouble, CarFront, Ruler, X } from 'lucide-react';
import type { BaseCopy, Locale } from '../lib/i18n';
import type { ShowcaseDetail } from '../lib/data';

const detailLabelMap: Record<Locale, Record<string, string>> = {
  pt: {},
  en: {
    Quartos: 'Bedrooms',
    Suítes: 'Suites',
    Vaga: 'Parking',
    Vagas: 'Parking',
    Área: 'Area',
    Banheiro: 'Bathroom',
    Banheiros: 'Bathrooms',
    Piscina: 'Pool',
    'Beach Club': 'Beach Club',
    'Bem-estar': 'Wellness',
    Lazer: 'Leisure',
    Segurança: 'Security',
  },
  it: {
    Quartos: 'Camere',
    Suítes: 'Suite',
    Vaga: 'Posto auto',
    Vagas: 'Posti auto',
    Área: 'Area',
    Banheiro: 'Bagno',
    Banheiros: 'Bagni',
    Piscina: 'Piscina',
    'Beach Club': 'Beach Club',
    'Bem-estar': 'Benessere',
    Lazer: 'Tempo libero',
    Segurança: 'Sicurezza',
  },
};

const detailValueMap: Record<Locale, Record<string, string>> = {
  pt: {},
  en: {
    'Vista para o mar': 'Ocean view',
    Ofurôs: 'Hot tubs',
    'Áreas verdes': 'Green areas',
    '24 horas': '24 hours',
    '27 m²': '27 sqm',
    '45 m²': '45 sqm',
    '82,48 m²': '82.48 sqm',
    '48 m²': '48 sqm',
  },
  it: {
    'Vista para o mar': 'Vista mare',
    Ofurôs: 'Vasche idromassaggio',
    'Áreas verdes': 'Aree verdi',
    '24 horas': '24 ore',
  },
};

const localizeDetail = (detail: ShowcaseDetail, locale: Locale): ShowcaseDetail => ({
  ...detail,
  label: detailLabelMap[locale]?.[detail.label] ?? detail.label,
  value: detailValueMap[locale]?.[detail.value] ?? detail.value,
});

const showcaseDetails: ShowcaseDetail[] = [
  { icon: Ruler, label: 'Área', value: '48 m²' },
  { icon: BedDouble, label: 'Quartos', value: '1' },
  { icon: Bath, label: 'Banheiros', value: '1' },
  { icon: CarFront, label: 'Vagas', value: '1' },
];

type ShowcaseCardProps = {
  label: string;
  title: string;
  desc: string;
  images: string[];
  details?: ShowcaseDetail[];
  index: number;
  locale: Locale;
  showcaseCopy: BaseCopy['showcase'];
};

export default function ShowcaseCard({
  label,
  title,
  desc,
  images,
  details,
  index,
  locale,
  showcaseCopy,
}: ShowcaseCardProps) {
  const reduceMotion = useReducedMotion();
  const [imageIndex, setImageIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const hasCarousel = images.length > 1;
  const resolvedDetails = details ?? showcaseDetails;
  const localizedDetails = resolvedDetails.map((detail) =>
    localizeDetail(detail, locale)
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!hasCarousel) return undefined;
    const interval = window.setInterval(() => {
      setImageIndex((prev) => (prev + 1) % images.length);
    }, 4200);
    return () => window.clearInterval(interval);
  }, [hasCarousel, images.length]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const { overflow, paddingRight } = document.body.style;
    const { overflow: htmlOverflow } = document.documentElement.style;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    return () => {
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
      document.documentElement.style.overflow = htmlOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const modal = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className='fixed inset-0 z-[60] flex items-center justify-center p-6 overflow-y-auto'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className='absolute inset-0 bg-transparent'
            onClick={() => setIsOpen(false)}
            aria-hidden='true'
          />
          <motion.div
            role='dialog'
            aria-modal='true'
            aria-label={`${showcaseCopy.dialogLabel} ${title}`}
            className='relative z-10 w-full max-w-md rounded-[24px] border border-white/10 bg-[rgba(6,16,24,0.96)] p-6 text-white shadow-[0_24px_60px_rgba(5,12,18,0.55),0_0_40px_rgba(183,146,90,0.12)]'
            initial={{ y: 16, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 12, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type='button'
              onClick={() => setIsOpen(false)}
              className='absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:text-white'
              aria-label={showcaseCopy.detailsClose}
            >
              <X className='h-4 w-4' />
            </button>
            <span className='inline-flex rounded-full border border-[var(--gold)]/40 bg-white/5 px-3 py-1 text-[0.6rem] uppercase tracking-[0.4em] text-[var(--gold)]'>
              {label}
            </span>
            <h3 className='mt-4 text-xl font-semibold'>{title}</h3>
            <p className='mt-2 text-sm text-white/70'>{desc}</p>
            <div className='mt-5 grid grid-cols-2 gap-3'>
              {localizedDetails.map((detail) => {
                const Icon = detail.icon;
                return (
                  <div
                    key={detail.label}
                    className='flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3'
                  >
                    <span className='inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/5 text-[var(--gold)]'>
                      <Icon className='h-4 w-4' />
                    </span>
                    <div>
                      <p className='text-[10px] uppercase tracking-[0.2em] text-white/50'>
                        {detail.label}
                      </p>
                      <p className='text-sm font-semibold text-white'>
                        {detail.value}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <motion.button
        type='button'
        onClick={() => setIsOpen(true)}
        aria-haspopup='dialog'
        aria-expanded={isOpen}
        className='group relative min-w-[85%] snap-center overflow-hidden rounded-[24px] border border-white/10 bg-[var(--panel)] text-left shadow-[0_12px_30px_rgba(0,0,0,0.35)] transition duration-300 hover:shadow-[0_18px_50px_rgba(0,0,0,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/60 md:min-w-0'
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        whileHover={reduceMotion ? undefined : { y: -6 }}
        whileTap={reduceMotion ? undefined : { scale: 0.98 }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { duration: 0.35, delay: index * 0.08 }
        }
      >
        <div className='relative aspect-[16/10] w-full overflow-hidden rounded-[18px] border border-white/10'>
          <AnimatePresence mode='wait'>
            <motion.img
              key={images[imageIndex]}
              src={images[imageIndex]}
              alt={title}
              className='absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]'
              initial={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
              transition={reduceMotion ? { duration: 0 } : { duration: 0.5 }}
              loading='lazy'
            />
          </AnimatePresence>
          <div className='absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/70 via-black/20 to-transparent' />
        </div>
        <div className='space-y-3 p-6'>
          <span className='inline-flex rounded-full border border-[var(--gold)]/35 bg-white/5 px-3 py-1 text-[0.6rem] uppercase tracking-[0.4em] text-[rgba(201,164,106,0.95)]'>
            {label}
          </span>
          <div>
            <h3 className='text-lg font-semibold text-[var(--text)]'>
              {title}
            </h3>
            <p className='mt-1 text-sm text-[var(--muted)]'>{desc}</p>
          </div>
          <div className='text-sm text-[var(--muted)]'>
            {showcaseCopy.detailsOpen} →
          </div>
        </div>
      </motion.button>

      {mounted ? createPortal(modal, document.body) : null}
    </>
  );
}
