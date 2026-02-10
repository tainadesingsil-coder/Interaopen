'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { ShowcaseDetail } from '@/app/types';
import { blurDataUrl } from '@/app/lib/constants';
import { useGallery } from '@/app/hooks/useGallery';
import { ShowcaseModal } from '@/app/components/showcase/ShowcaseModal';
import { OptimizedImage } from '@/app/components/shared/OptimizedImage';

type Props = {
  label: string;
  title: string;
  desc: string;
  images: ReadonlyArray<string>;
  details: ReadonlyArray<ShowcaseDetail>;
  index: number;
  detailsOpenLabel: string;
  detailsCloseLabel: string;
  dialogLabel: string;
};

export const ShowcaseCard = ({
  label,
  title,
  desc,
  images,
  details,
  index,
  detailsOpenLabel,
  detailsCloseLabel,
  dialogLabel,
}: Props) => {
  const reduceMotion = useReducedMotion();
  const shouldReduceMotion = !!reduceMotion;
  const [isOpen, setIsOpen] = useState(false);
  const { index: imageIndex } = useGallery({
    length: images.length,
    reduceMotion: shouldReduceMotion,
    auto: images.length > 1,
  });

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <>
      <motion.button
        type='button'
        onClick={() => setIsOpen(true)}
        aria-haspopup='dialog'
        aria-expanded={isOpen}
        aria-label={`${detailsOpenLabel}: ${title}`}
        className='group relative min-w-[85%] snap-center overflow-hidden rounded-[24px] border border-white/10 bg-[var(--panel)] text-left shadow-[0_12px_30px_rgba(0,0,0,0.35)] transition duration-300 hover:shadow-[0_18px_50px_rgba(0,0,0,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/60 md:min-w-0'
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        whileHover={shouldReduceMotion ? undefined : { y: -6 }}
        whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
        transition={
          shouldReduceMotion
            ? { duration: 0 }
            : { duration: 0.35, delay: index * 0.08 }
        }
      >
        <div className='relative aspect-[16/10] w-full overflow-hidden rounded-[18px] border border-white/10'>
          <AnimatePresence mode='wait'>
            <motion.div
              key={images[imageIndex]}
              className='absolute inset-0'
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
              transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.5 }}
            >
              <OptimizedImage
                src={images[imageIndex]}
                alt={title}
                fill
                sizes='(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 85vw'
                className='object-cover transition duration-300 group-hover:scale-[1.03]'
                placeholder='blur'
                blurDataURL={blurDataUrl}
              />
            </motion.div>
          </AnimatePresence>
          <div className='absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/70 via-black/20 to-transparent' />
        </div>
        <div className='space-y-3 p-6'>
          <span className='inline-flex rounded-full border border-[var(--gold)]/35 bg-white/5 px-3 py-1 text-[0.6rem] uppercase tracking-[0.4em] text-[rgba(201,164,106,0.95)]'>
            {label}
          </span>
          <div>
            <h3 className='text-lg font-semibold text-[var(--text)]'>{title}</h3>
            <p className='mt-1 text-sm text-[var(--muted)]'>{desc}</p>
          </div>
          <div className='text-sm text-[var(--muted)]'>{detailsOpenLabel} →</div>
        </div>
      </motion.button>

      <ShowcaseModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        label={label}
        title={title}
        desc={desc}
        details={details}
        detailsCloseLabel={detailsCloseLabel}
        dialogLabel={dialogLabel}
      />
    </>
  );
};
