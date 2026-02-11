'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { ShowcaseDetail } from '@/app/types';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  label: string;
  title: string;
  desc: string;
  details: ReadonlyArray<ShowcaseDetail>;
  detailsCloseLabel: string;
  dialogLabel: string;
};

export const ShowcaseModal = ({
  isOpen,
  onClose,
  label,
  title,
  desc,
  details,
  detailsCloseLabel,
  dialogLabel,
}: Props) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        className='fixed inset-0 z-[60] flex items-center justify-center p-6'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className='absolute inset-0 bg-black/60 backdrop-blur-sm' onClick={onClose} />
        <motion.div
          role='dialog'
          aria-modal='true'
          aria-label={`${dialogLabel} ${title}`}
          className='relative z-10 w-full max-w-md rounded-[24px] border border-white/10 bg-[rgba(6,16,24,0.96)] p-6 text-white shadow-[0_24px_60px_rgba(5,12,18,0.55),0_0_40px_rgba(183,146,90,0.12)]'
          initial={{ y: 16, opacity: 0, scale: 0.98 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 12, opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type='button'
            onClick={onClose}
            className='absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:text-white'
            aria-label={detailsCloseLabel}
          >
            <X className='h-4 w-4' />
          </button>
          <span className='inline-flex rounded-full border border-[var(--gold)]/40 bg-white/5 px-3 py-1 text-[0.6rem] uppercase tracking-[0.4em] text-[var(--gold)]'>
            {label}
          </span>
          <h3 className='mt-4 text-lg font-semibold md:text-xl'>{title}</h3>
          <p className='mt-2 text-xs text-white/70 md:text-sm'>{desc}</p>
          <div className='mt-4 rounded-2xl border border-white/10 bg-white/5 p-3 md:p-5'>
            <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-5'>
              {details.map((detail) => {
                const Icon = detail.icon;
                return (
                  <div key={detail.label} className='flex items-start gap-3 md:gap-4'>
                    <span className='mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/5 text-[var(--gold)] md:h-11 md:w-11'>
                      <Icon className='h-6 w-6' />
                    </span>
                    <div className='min-w-0 flex-1'>
                      <p className='text-[10px] uppercase tracking-[0.16em] text-white/50'>
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
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);
