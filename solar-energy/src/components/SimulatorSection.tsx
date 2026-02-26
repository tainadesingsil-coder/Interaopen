'use client';

import { motion } from 'framer-motion';
import { Clock, Coins, TrendingUp, Wallet } from 'lucide-react';
import { simulatorPresets, whatsappLink } from '../lib/data';
import type { PresetKey } from '../lib/data';
import type { BaseCopy } from '../lib/i18n';

type SimulatorResults = {
  grossMonthly: number;
  netMonthly: number;
  annualReturn: number;
  paybackYears: number | null;
};

type SimulatorSectionProps = {
  copy: BaseCopy['simulator'];
  activePreset: PresetKey;
  setActivePreset: (preset: PresetKey) => void;
  propertyValue: number;
  setPropertyValue: (value: number) => void;
  dailyRate: number;
  setDailyRate: (value: number) => void;
  occupancy: number;
  setOccupancy: (value: number) => void;
  monthlyCosts: number;
  setMonthlyCosts: (value: number) => void;
  platformFee: number;
  setPlatformFee: (value: number) => void;
  animatedResults: SimulatorResults;
  formatCurrency: (value: number) => string;
  handleDownloadPdf: () => void;
  reduceMotion: boolean;
};

export default function SimulatorSection({
  copy,
  activePreset,
  setActivePreset,
  propertyValue,
  setPropertyValue,
  dailyRate,
  setDailyRate,
  occupancy,
  setOccupancy,
  monthlyCosts,
  setMonthlyCosts,
  platformFee,
  setPlatformFee,
  animatedResults,
  formatCurrency,
  handleDownloadPdf,
  reduceMotion,
}: SimulatorSectionProps) {
  return (
    <section
      id='proposta'
      className='section-shell section-base section-glow section-divider scroll-mt-24'
    >
      <div className='section-inner'>
        <div className='grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start'>
          <div className='space-y-6 text-center lg:text-left'>
            <p className='text-xs uppercase tracking-[0.32em] text-[var(--muted)]'>
              {copy.tag}
            </p>
            <h2 className='section-title font-semibold text-[var(--text)]'>
              {copy.title}
            </h2>
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
            <div className='flex gap-2 overflow-x-auto pb-1 lg:flex-wrap lg:justify-start lg:overflow-visible'>
              {simulatorPresets.map((preset) => (
                <button
                  key={preset.key}
                  type='button'
                  onClick={() => {
                    setPropertyValue(preset.values.propertyValue);
                    setDailyRate(preset.values.dailyRate);
                    setOccupancy(preset.values.occupancy);
                    setMonthlyCosts(preset.values.monthlyCosts);
                    setPlatformFee(preset.values.platformFee);
                    setActivePreset(preset.key);
                  }}
                  className={`flex-shrink-0 rounded-full border px-3 py-2 text-[10px] uppercase tracking-[0.2em] transition ${
                    activePreset === preset.key
                      ? 'border-[var(--gold)]/60 bg-[var(--panel-strong)] text-white'
                      : 'border-white/15 bg-white/5 text-white/70 hover:border-[var(--gold)]/40'
                  }`}
                >
                  {copy.presets[preset.key]}
                </button>
              ))}
            </div>
          </div>
          <motion.div
            className='glass-panel bg-[linear-gradient(180deg,rgba(10,18,24,0.7),rgba(6,12,18,0.95))] p-6 md:p-8'
            initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.6 }}
          >
            <div className='space-y-5 text-white'>
              <div className='grid gap-4 sm:grid-cols-2'>
                <label className='space-y-2 text-[11px] text-white/60'>
                  <span>{copy.fields.propertyValue}</span>
                  <input
                    type='number'
                    value={propertyValue}
                    onChange={(event) =>
                      setPropertyValue(Number(event.target.value))
                    }
                    className='w-full rounded-xl border border-white/12 bg-[var(--panel)] px-3 py-2.5 text-[12px] text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/40'
                  />
                </label>
                <label className='space-y-2 text-[11px] text-white/60'>
                  <span>{copy.fields.dailyRate}</span>
                  <input
                    type='number'
                    value={dailyRate}
                    onChange={(event) =>
                      setDailyRate(Number(event.target.value))
                    }
                    className='w-full rounded-xl border border-white/12 bg-[var(--panel)] px-3 py-2.5 text-[12px] text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/40'
                  />
                </label>
                <label className='space-y-2 text-[11px] text-white/60 sm:col-span-2'>
                  <div className='flex items-end justify-between'>
                    <span>{copy.fields.occupancy}</span>
                    <span className='text-base font-semibold text-white'>
                      {occupancy}%
                    </span>
                  </div>
                  <input
                    type='range'
                    min={10}
                    max={90}
                    value={occupancy}
                    onChange={(event) =>
                      setOccupancy(Number(event.target.value))
                    }
                    className='h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-[#C9A46A] transition'
                  />
                </label>
                <label className='space-y-2 text-[11px] text-white/60'>
                  <span>{copy.fields.monthlyCosts}</span>
                  <input
                    type='number'
                    value={monthlyCosts}
                    onChange={(event) =>
                      setMonthlyCosts(Number(event.target.value))
                    }
                    className='w-full rounded-xl border border-white/12 bg-[var(--panel)] px-3 py-2.5 text-[12px] text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/40'
                  />
                </label>
                <label className='space-y-2 text-[11px] text-white/60'>
                  <span>{copy.fields.platformFee}</span>
                  <input
                    type='number'
                    value={platformFee}
                    onChange={(event) =>
                      setPlatformFee(Number(event.target.value))
                    }
                    className='w-full rounded-xl border border-white/12 bg-[var(--panel)] px-3 py-2.5 text-[12px] text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/40'
                  />
                </label>
              </div>
              <div className='grid grid-cols-2 gap-3'>
                <div className='panel-strong flex items-center gap-3 px-3 py-2.5 text-white/80'>
                  <span className='inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-[var(--gold)]'>
                    <Coins className='h-4 w-4' />
                  </span>
                  <div>
                    <p className='text-[9px] uppercase tracking-[0.2em] text-white/50'>
                      {copy.results.revenue}
                    </p>
                    <p className='mt-1 text-base font-semibold text-white'>
                      {formatCurrency(animatedResults.grossMonthly)}
                    </p>
                  </div>
                </div>
                <div className='panel-strong flex items-center gap-3 px-3 py-2.5 text-white/80'>
                  <span className='inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-[var(--gold)]'>
                    <Wallet className='h-4 w-4' />
                  </span>
                  <div>
                    <p className='text-[9px] uppercase tracking-[0.2em] text-white/50'>
                      {copy.results.profit}
                    </p>
                    <p className='mt-1 text-base font-semibold text-white'>
                      {formatCurrency(animatedResults.netMonthly)}
                    </p>
                  </div>
                </div>
                <div className='panel-strong flex items-center gap-3 px-3 py-2.5 text-white/80'>
                  <span className='inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-[var(--gold)]'>
                    <TrendingUp className='h-4 w-4' />
                  </span>
                  <div>
                    <p className='text-[9px] uppercase tracking-[0.2em] text-white/50'>
                      {copy.results.annualReturn}
                    </p>
                    <p className='mt-1 text-base font-semibold text-white'>
                      {animatedResults.annualReturn.toFixed(1)}%
                    </p>
                  </div>
                </div>
                <div className='panel-strong flex items-center gap-3 px-3 py-2.5 text-white/80'>
                  <span className='inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-[var(--gold)]'>
                    <Clock className='h-4 w-4' />
                  </span>
                  <div>
                    <p className='text-[9px] uppercase tracking-[0.2em] text-white/50'>
                      {copy.results.payback}
                    </p>
                    <p className='mt-1 text-base font-semibold text-white'>
                      {animatedResults.paybackYears
                        ? `${animatedResults.paybackYears.toFixed(1)} ${copy.paybackUnit}`
                        : copy.notAvailable}
                    </p>
                  </div>
                </div>
              </div>
              <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
                <a
                  href={whatsappLink}
                  target='_blank'
                  rel='noreferrer'
                  className='inline-flex flex-1 items-center justify-center rounded-full bg-[var(--gold)] px-6 py-3 text-xs font-semibold text-[#0c1116] shadow-[0_12px_30px_rgba(201,164,106,0.25)] transition hover:brightness-110'
                >
                  {copy.ctaPrimary}
                </a>
                <button
                  type='button'
                  onClick={handleDownloadPdf}
                  className='text-center text-xs text-white/60 underline-offset-4 transition hover:text-white hover:underline'
                >
                  {copy.ctaSecondary}
                </button>
              </div>
              <p className='text-[11px] text-white/50'>
                {copy.disclaimer}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
