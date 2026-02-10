'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { Translation } from '@/app/lib/translations';
import { progressImages } from '@/app/lib/constants';
import { ProgressGallery } from '@/app/components/progress/ProgressGallery';

type Props = {
  copy: Translation['progress'];
};

export const Progress = ({ copy }: Props) => {
  const reduceMotion = useReducedMotion();

  return (
    <section id='obra' className='section-shell section-alt section-glow section-divider scroll-mt-24'>
      <div className='section-inner'>
        <div className='grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center'>
          <motion.div
            className='space-y-5 text-center lg:text-left'
            initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.35 }}
          >
            <p className='text-xs uppercase tracking-[0.32em] text-[var(--muted)]'>
              {copy.tag}
            </p>
            <h2 className='section-title font-semibold text-[var(--text)]'>
              {copy.title}
            </h2>
            <p className='text-base text-[var(--muted)] md:text-lg lg:max-w-[42ch]'>
              {copy.body}
            </p>
            <div className='flex flex-wrap justify-center gap-3 text-xs text-white/70 lg:justify-start'>
              {copy.highlights.map((item) => (
                <span
                  key={item}
                  className='rounded-full border border-white/10 bg-[var(--panel)] px-4 py-2'
                >
                  {item}
                </span>
              ))}
            </div>
          </motion.div>
          <motion.div
            className='glass-panel p-4 md:p-5'
            initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.4 }}
          >
            <ProgressGallery
              images={progressImages}
              alt={copy.title}
              reduceMotion={!!reduceMotion}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};
