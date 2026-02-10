'use client';

import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '@/app/hooks/usePrefersReducedMotion';
import type { Translation } from '@/app/lib/translations';
import { LocationMap } from '@/app/components/location/LocationMap';

type Props = {
  copy: Translation['location'];
  mapTitle: string;
};

export const Location = ({ copy, mapTitle }: Props) => {
  const reduceMotion = usePrefersReducedMotion();

  return (
    <section
      id='localizacao'
      className='section-shell section-alt section-glow section-divider scroll-mt-24'
    >
      <div className='section-inner'>
        <div className='grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:gap-10 lg:items-start'>
          <motion.div
            className='order-1 space-y-5 text-center lg:text-left'
            initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.25 }}
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
          </motion.div>
          <motion.div
            className='order-2 glass-map relative p-5 md:p-6 lg:row-span-2'
            initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.35 }}
          >
            <LocationMap title={mapTitle} />
          </motion.div>
          <motion.div
            className='order-3 flex flex-wrap justify-center gap-3 text-sm text-white/80 lg:col-start-1 lg:justify-start'
            initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.25 }}
          >
            {copy.benefits.map((item) => (
              <span
                key={item}
                className='rounded-full border border-white/10 bg-[var(--panel)] px-4 py-2'
              >
                {item}
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
