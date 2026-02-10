'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { Locale } from '@/app/types';
import type { Translation } from '@/app/lib/translations';
import { simulatorPresets } from '@/app/lib/constants';
import { useSimulator } from '@/app/hooks/useSimulator';
import { SimulatorPresets } from '@/app/components/simulator/SimulatorPresets';
import { SimulatorResults } from '@/app/components/simulator/SimulatorResults';
import { PDFGenerator } from '@/app/components/simulator/PDFGenerator';

type Props = {
  locale: Locale;
  copy: Translation['simulator'];
  pdfCopy: Translation['pdf'];
  whatsappLink: string;
};

export const Simulator = ({ locale, copy, pdfCopy, whatsappLink }: Props) => {
  const reduceMotion = useReducedMotion();
  const shouldReduceMotion = !!reduceMotion;
  const {
    values,
    setValue,
    activePreset,
    applyPreset,
    animatedResults,
    handleDownloadPdf,
    formatCurrency,
  } = useSimulator({ locale, reduceMotion: shouldReduceMotion, pdfCopy });

  return (
    <section
      id='perfil'
      className='section-shell section-base section-glow section-divider scroll-mt-24'
    >
      <div className='section-inner'>
        <div className='grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start'>
          <div className='space-y-6 text-center lg:text-left'>
            <p className='text-xs uppercase tracking-[0.32em] text-[var(--muted)]'>
              {copy.tag}
            </p>
            <h2 className='section-title font-semibold text-[var(--text)]'>{copy.title}</h2>
            <p className='text-base text-[var(--muted)] md:text-lg lg:max-w-[42ch]'>
              {copy.subtitle}
            </p>
            <ul className='space-y-3 text-sm text-white/70'>
              {copy.bullets.map((item) => (
                <li
                  key={item}
                  className='flex items-center justify-center gap-3 text-left lg:justify-start'
                >
                  <span className='h-1.5 w-1.5 rounded-full bg-[var(--gold)]' />
                  {item}
                </li>
              ))}
            </ul>
            <SimulatorPresets
              presets={simulatorPresets}
              labels={copy.presets}
              activePreset={activePreset}
              onSelect={(preset) => applyPreset(preset.values, preset.key)}
            />
          </div>
          <motion.div
            className='glass-panel bg-[linear-gradient(180deg,rgba(10,18,24,0.7),rgba(6,12,18,0.95))] p-6 md:p-8'
            initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6 }}
          >
            <div className='space-y-5 text-white'>
              <div className='grid gap-4 sm:grid-cols-2'>
                <label className='space-y-2 text-[11px] text-white/60'>
                  <span>{copy.fields.propertyValue}</span>
                  <input
                    type='number'
                    value={values.propertyValue}
                    onChange={(event) =>
                      setValue('propertyValue', Number(event.target.value))
                    }
                    className='w-full rounded-xl border border-white/12 bg-[var(--panel)] px-3 py-2.5 text-[12px] text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/40'
                  />
                </label>
                <label className='space-y-2 text-[11px] text-white/60'>
                  <span>{copy.fields.dailyRate}</span>
                  <input
                    type='number'
                    value={values.dailyRate}
                    onChange={(event) => setValue('dailyRate', Number(event.target.value))}
                    className='w-full rounded-xl border border-white/12 bg-[var(--panel)] px-3 py-2.5 text-[12px] text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/40'
                  />
                </label>
                <label className='space-y-2 text-[11px] text-white/60 sm:col-span-2'>
                  <div className='flex items-end justify-between'>
                    <span>{copy.fields.occupancy}</span>
                    <span className='text-base font-semibold text-white'>
                      {values.occupancy}%
                    </span>
                  </div>
                  <input
                    type='range'
                    min={10}
                    max={90}
                    value={values.occupancy}
                    onChange={(event) =>
                      setValue('occupancy', Number(event.target.value))
                    }
                    className='h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-[#C9A46A] transition'
                  />
                </label>
                <label className='space-y-2 text-[11px] text-white/60'>
                  <span>{copy.fields.monthlyCosts}</span>
                  <input
                    type='number'
                    value={values.monthlyCosts}
                    onChange={(event) =>
                      setValue('monthlyCosts', Number(event.target.value))
                    }
                    className='w-full rounded-xl border border-white/12 bg-[var(--panel)] px-3 py-2.5 text-[12px] text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/40'
                  />
                </label>
                <label className='space-y-2 text-[11px] text-white/60'>
                  <span>{copy.fields.platformFee}</span>
                  <input
                    type='number'
                    value={values.platformFee}
                    onChange={(event) =>
                      setValue('platformFee', Number(event.target.value))
                    }
                    className='w-full rounded-xl border border-white/12 bg-[var(--panel)] px-3 py-2.5 text-[12px] text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/40'
                  />
                </label>
              </div>
              <SimulatorResults
                revenueLabel={copy.results.revenue}
                profitLabel={copy.results.profit}
                annualReturnLabel={copy.results.annualReturn}
                paybackLabel={copy.results.payback}
                revenueValue={formatCurrency(animatedResults.grossMonthly)}
                profitValue={formatCurrency(animatedResults.netMonthly)}
                annualReturnValue={`${animatedResults.annualReturn.toFixed(1)}%`}
                paybackValue={
                  animatedResults.paybackYears
                    ? `${animatedResults.paybackYears.toFixed(1)} ${copy.paybackUnit}`
                    : '—'
                }
              />
              <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
                <a
                  href={whatsappLink}
                  target='_blank'
                  rel='noreferrer'
                  className='inline-flex flex-1 items-center justify-center rounded-full bg-[var(--gold)] px-6 py-3 text-xs font-semibold text-[#0c1116] shadow-[0_12px_30px_rgba(201,164,106,0.25)] transition hover:brightness-110'
                >
                  {copy.ctaPrimary}
                </a>
                <PDFGenerator label={copy.ctaSecondary} onDownload={handleDownloadPdf} />
              </div>
              <p className='text-[11px] text-white/50'>{copy.disclaimer}</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
