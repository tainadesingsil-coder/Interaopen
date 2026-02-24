'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, MotionConfig, useReducedMotion } from 'framer-motion';
import { Mail, MapPin, PhoneCall } from 'lucide-react';
import HeroNav from '../components/HeroNav';
import Reveal from '../components/Reveal';
import ShowcaseCard from '../components/ShowcaseCard';
import SimulatorSection from '../components/SimulatorSection';
import { translations, type Locale } from '../lib/i18n';
import {
  mapEmbedUrl,
  progressImages,
  showcaseItems,
  whatsappLink,
} from '../lib/data';
import type { PresetKey } from '../lib/data';

const heroPoster =
  'https://res.cloudinary.com/dwedcl97k/video/upload/so_0,f_jpg,w_1600/v1769199580/Design_sem_nome_-_2026-01-23T171932.339_fjulxo.mp4';
const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
});

const formatCurrency = (value: number) =>
  currencyFormatter.format(Math.round(value));
const sanitizePdfText = (value: string) =>
  value.replace(/[^\x20-\x7E]/g, ' ');
const escapePdfText = (value: string) =>
  sanitizePdfText(value).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
const buildPdf = (lines: string[]) => {
  const content = lines
    .map((line, index) => {
      const y = 760 - index * 18;
      return `BT /F1 12 Tf 60 ${y} Td (${escapePdfText(line)}) Tj ET`;
    })
    .join('\n');
  let pdf = '%PDF-1.3\n';
  const offsets: number[] = [0];
  const addObject = (obj: string) => {
    offsets.push(pdf.length);
    pdf += `${obj}\n`;
  };
  addObject('1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj');
  addObject('2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj');
  addObject(
    '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj'
  );
  addObject(`4 0 obj << /Length ${content.length} >> stream\n${content}\nendstream\nendobj`);
  addObject('5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj');
  const xrefStart = pdf.length;
  pdf += 'xref\n0 6\n0000000000 65535 f \n';
  for (let i = 1; i <= 5; i += 1) {
    pdf += `${offsets[i].toString().padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer << /Size 6 /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  return pdf;
};

const STORAGE_KEY = 'bella-vista-locale';

const mapLocationUrl = mapEmbedUrl.replace('&output=embed', '');

function InteractiveMap({ title }: { title: string }) {
  return (
    <div className='relative h-[340px] w-full overflow-hidden rounded-[24px] border border-white/10 md:h-[360px]'>
      <iframe
        title={title}
        src={mapEmbedUrl}
        className='h-full w-full border-0'
        loading='lazy'
        referrerPolicy='no-referrer-when-downgrade'
      />
    </div>
  );
}

export default function HomePage() {
  const reduceMotion = useReducedMotion();
  const [locale, setLocale] = useState<Locale>('pt');
  const [heroVideoReady, setHeroVideoReady] = useState(false);
  const [propertyValue, setPropertyValue] = useState(250000);
  const [dailyRate, setDailyRate] = useState(250);
  const [occupancy, setOccupancy] = useState(55);
  const [monthlyCosts, setMonthlyCosts] = useState(650);
  const [platformFee, setPlatformFee] = useState(12);
  const [activePreset, setActivePreset] = useState<PresetKey>('realistic');
  const [progressIndex, setProgressIndex] = useState(0);
  const copy = translations[locale];
  const localizedShowcaseItems = useMemo(
    () =>
      showcaseItems.map((item, index) => ({
        ...item,
        ...copy.showcase.items[index],
      })),
    [copy]
  );

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, locale);
    document.documentElement.lang = locale === 'pt' ? 'pt-BR' : locale;
  }, [locale]);
  const simulatorResults = useMemo(() => {
    const nightsPerMonth = (30 * occupancy) / 100;
    const grossMonthly = nightsPerMonth * dailyRate;
    const platformFeeAmount = grossMonthly * (platformFee / 100);
    const netMonthly = grossMonthly - platformFeeAmount - monthlyCosts;
    const annualReturn =
      propertyValue > 0 ? (netMonthly * 12 * 100) / propertyValue : 0;
    const paybackYears =
      netMonthly > 0 ? propertyValue / (netMonthly * 12) : null;
    return {
      nightsPerMonth,
      grossMonthly,
      netMonthly,
      annualReturn,
      paybackYears,
    };
  }, [propertyValue, dailyRate, occupancy, monthlyCosts, platformFee]);
  const previousResults = useRef(simulatorResults);
  const [animatedResults, setAnimatedResults] = useState(simulatorResults);
  const handleDownloadPdf = () => {
    const lines = [
      copy.pdf.title,
      copy.pdf.subtitle,
      '',
      `${copy.pdf.propertyValue}: ${formatCurrency(propertyValue)}`,
      `${copy.pdf.dailyRate}: ${formatCurrency(dailyRate)}`,
      `${copy.pdf.occupancy}: ${occupancy}%`,
      `${copy.pdf.monthlyCosts}: ${formatCurrency(monthlyCosts)}`,
      `${copy.pdf.platformFee}: ${platformFee}%`,
      '',
      `${copy.pdf.grossMonthly}: ${formatCurrency(simulatorResults.grossMonthly)}`,
      `${copy.pdf.netMonthly}: ${formatCurrency(simulatorResults.netMonthly)}`,
      `${copy.pdf.annualReturn}: ${simulatorResults.annualReturn.toFixed(1)}%`,
      `${copy.pdf.payback}: ${
        simulatorResults.paybackYears
          ? `${simulatorResults.paybackYears.toFixed(1)} ${copy.pdf.paybackUnit}`
          : copy.pdf.notAvailable
      }`,
    ];
    const pdf = buildPdf(lines);
    const blob = new Blob([pdf], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = copy.pdf.fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (reduceMotion) {
      setAnimatedResults(simulatorResults);
      previousResults.current = simulatorResults;
      return;
    }
    const from = previousResults.current;
    const to = simulatorResults;
    const start = performance.now();
    const duration = 420;
    let frame: number;

    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const lerp = (a: number, b: number) => a + (b - a) * progress;
      setAnimatedResults({
        nightsPerMonth: lerp(from.nightsPerMonth, to.nightsPerMonth),
        grossMonthly: lerp(from.grossMonthly, to.grossMonthly),
        netMonthly: lerp(from.netMonthly, to.netMonthly),
        annualReturn: lerp(from.annualReturn, to.annualReturn),
        paybackYears:
          to.paybackYears === null
            ? null
            : lerp(from.paybackYears ?? 0, to.paybackYears),
      });
      if (progress < 1) {
        frame = window.requestAnimationFrame(animate);
      } else {
        previousResults.current = to;
      }
    };

    frame = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(frame);
  }, [reduceMotion, simulatorResults]);

  useEffect(() => {
    if (reduceMotion || progressImages.length < 2) return;
    const interval = window.setInterval(() => {
      setProgressIndex((prev) => (prev + 1) % progressImages.length);
    }, 4200);
    return () => window.clearInterval(interval);
  }, [reduceMotion]);


  return (
    <MotionConfig reducedMotion='user'>
      <div className='bg-[var(--bg-0)] text-[var(--text)]'>
        <HeroNav
          labels={copy.nav}
          locale={locale}
          onLocaleChange={setLocale}
          whatsappLink={whatsappLink}
        />
        <main>
          <section
            id='inicio'
            className='grain grain-soft relative flex min-h-[100svh] items-start overflow-hidden bg-[#07131D] pt-24 md:min-h-screen md:items-center md:pt-20'
          >
            <div className='absolute inset-0' aria-hidden='true'>
              <img
                src={heroPoster}
                alt=''
                className={`absolute inset-0 h-full w-full object-cover hero-media transition-opacity duration-1000 ${
                  heroVideoReady ? 'opacity-0' : 'opacity-100'
                }`}
                loading='lazy'
              />
              <video
                className={`absolute inset-0 h-full w-full object-cover hero-media transition-opacity duration-1000 ${
                  heroVideoReady ? 'opacity-100' : 'opacity-0'
                }`}
                autoPlay
                loop
                muted
                playsInline
                preload='metadata'
                poster={heroPoster}
                onLoadedData={() => setHeroVideoReady(true)}
                onCanPlay={() => setHeroVideoReady(true)}
              >
                <source
                  src='https://res.cloudinary.com/dwedcl97k/video/upload/f_auto,q_auto:best,w_1280/v1769199580/Design_sem_nome_-_2026-01-23T171932.339_fjulxo.mp4'
                  type='video/mp4'
                  media='(max-width: 768px)'
                />
                <source
                  src='https://res.cloudinary.com/dwedcl97k/video/upload/f_auto,q_auto:best,w_1920/v1769199580/Design_sem_nome_-_2026-01-23T171932.339_fjulxo.mp4'
                  type='video/mp4'
                  media='(min-width: 769px)'
                />
              </video>
            </div>
            <div className='absolute inset-0 bg-gradient-to-b from-black/18 via-[#061825]/16 to-transparent lg:from-black/12 lg:via-[#061825]/10' />
            <div className='absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(198,155,78,0.035),transparent_55%)] lg:opacity-28' />
            <div className='absolute inset-0 bg-[linear-gradient(120deg,rgba(6,24,37,0.14),rgba(246,241,234,0.03)_45%,rgba(183,146,90,0.05)_100%)] lg:opacity-24' />
            <div className='absolute inset-0 hidden lg:block lg:bg-[linear-gradient(90deg,rgba(5,14,22,0.2)_0%,rgba(5,14,22,0.06)_55%,rgba(5,14,22,0.02)_100%)]' />
            <div className='absolute inset-0 vignette' />
            <div className='relative z-10 mx-auto w-full max-w-6xl px-6 pb-28 pt-24 text-white md:pb-36'>
              <div className='grid gap-12 lg:min-h-[70vh] lg:flex lg:items-center lg:justify-center'>
                <div className='order-1 text-center lg:text-center'>
                  <div className='inline-block w-full max-w-[640px] rounded-[28px] border border-white/10 bg-black/10 p-6 backdrop-blur-sm md:p-7 lg:mx-auto lg:w-[min(92vw,920px)] lg:max-w-[920px] lg:rounded-[28px] lg:border-white/10 lg:bg-[rgba(10,20,30,0.45)] lg:p-14 lg:backdrop-blur-[18px] lg:shadow-[0_28px_70px_rgba(4,10,16,0.45),0_0_30px_rgba(183,146,90,0.08)]'>
                    <Reveal>
                      <p className='text-center text-[0.6rem] uppercase tracking-[0.5em] text-white/60 lg:mx-auto lg:max-w-[720px] lg:text-center lg:tracking-[0.6em] lg:text-white/55'>
                        {copy.hero.eyebrow}
                      </p>
                    </Reveal>
                    <Reveal delay={0.1}>
                      <h1 className='hero-title-glow mt-4 text-balance text-4xl font-medium leading-[1.2] tracking-[-0.02em] md:text-5xl lg:mx-auto lg:max-w-[600px] lg:text-[clamp(40px,4.4vw,68px)] lg:leading-[1.05] lg:tracking-[-0.03em] lg:font-semibold'>
                        {copy.hero.title.split('\n').map((line) => (
                          <span key={line} className='block'>
                            {line}
                          </span>
                        ))}
                      </h1>
                    </Reveal>
                    <Reveal delay={0.2}>
                      <p className='mt-6 max-w-[620px] text-sm text-white/80 md:text-base lg:hidden'>
                        {copy.hero.subtitle}
                      </p>
                      <p className='mt-8 hidden max-w-[520px] text-[18px] text-white/85 lg:mx-auto lg:block lg:leading-[1.6]'>
                        {copy.hero.subtitleDesktop}
                      </p>
                    </Reveal>
                    <Reveal delay={0.3} className='mt-10 flex justify-center lg:mt-10 lg:justify-center'>
                      <a
                        href={whatsappLink}
                        target='_blank'
                        rel='noreferrer'
                        className='hero-cta-glow inline-flex w-full items-center justify-center rounded-full border border-white/12 bg-[#0B2A3A] px-7 py-3 text-sm font-semibold text-white shadow-[0_14px_34px_rgba(10,46,70,0.22)] transition duration-500 hover:-translate-y-0.5 hover:shadow-[0_0_18px_rgba(183,146,90,0.45)] lg:w-auto lg:bg-gradient-to-r lg:from-[#0B2A3A] lg:to-[#0A2231] lg:px-9 lg:py-4'
                      >
                        <span className='lg:hidden'>{copy.hero.primaryCta}</span>
                        <span className='hidden lg:inline'>{copy.hero.primaryCtaDesktop}</span>
                      </a>
                    </Reveal>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section
            id='contexto'
            className='section-shell section-glow scroll-mt-24 bg-[var(--bg-0)]'
          >
            <div className='section-inner'>
              <div className='flex flex-col gap-3'>
                <p className='text-xs uppercase tracking-[0.32em] text-[var(--muted)]'>
                  {copy.showcase.title}
                </p>
                <h3 className='section-title font-semibold text-[var(--text)]'>
                  {copy.showcase.subtitle}
                </h3>
              </div>
              <div className='mt-6 flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory md:grid md:grid-cols-2 md:gap-6 md:overflow-visible md:snap-none lg:grid-cols-3'>
                {localizedShowcaseItems.map((item, index) => (
                  <ShowcaseCard
                    key={`${item.label}-${index}`}
                    {...item}
                    index={index}
                    locale={locale}
                    showcaseCopy={copy.showcase}
                  />
                ))}
              </div>
            </div>
          </section>

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
                    {copy.location.tag}
                  </p>
                  <h2 className='section-title font-semibold text-[var(--text)]'>
                    {copy.location.title}
                  </h2>
                  <p className='text-base text-[var(--muted)] md:text-lg lg:max-w-[42ch]'>
                    {copy.location.body}
                  </p>
                </motion.div>
                <motion.div
                  className='order-2 glass-map relative p-5 md:p-6 lg:row-span-2'
                  initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={reduceMotion ? { duration: 0 } : { duration: 0.35 }}
                >
                  <InteractiveMap title={copy.map.title} />
                </motion.div>
                <motion.div
                  className='order-3 flex flex-wrap justify-center gap-3 text-sm text-white/80 lg:col-start-1 lg:justify-start'
                  initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={reduceMotion ? { duration: 0 } : { duration: 0.25 }}
                >
                  {copy.location.benefits.map((item) => (
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

          <SimulatorSection
            copy={copy.simulator}
            activePreset={activePreset}
            setActivePreset={setActivePreset}
            propertyValue={propertyValue}
            setPropertyValue={setPropertyValue}
            dailyRate={dailyRate}
            setDailyRate={setDailyRate}
            occupancy={occupancy}
            setOccupancy={setOccupancy}
            monthlyCosts={monthlyCosts}
            setMonthlyCosts={setMonthlyCosts}
            platformFee={platformFee}
            setPlatformFee={setPlatformFee}
            animatedResults={animatedResults}
            formatCurrency={formatCurrency}
            handleDownloadPdf={handleDownloadPdf}
            reduceMotion={reduceMotion}
          />

          <section
            id='obra'
            className='section-shell section-alt section-glow section-divider scroll-mt-24'
          >
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
                    {copy.progress.tag}
                  </p>
                  <h2 className='section-title font-semibold text-[var(--text)]'>
                    {copy.progress.title}
                  </h2>
                  <p className='text-base text-[var(--muted)] md:text-lg lg:max-w-[42ch]'>
                    {copy.progress.body}
                  </p>
                  <div className='flex flex-wrap justify-center gap-3 text-xs text-white/70 lg:justify-start'>
                    {copy.progress.highlights.map((item) => (
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
                  <div className='relative aspect-[16/10] overflow-hidden rounded-2xl'>
                    <AnimatePresence mode='wait'>
                      <motion.img
                        key={progressImages[progressIndex]}
                        src={progressImages[progressIndex]}
                        alt='Andamento da obra'
                        className='absolute inset-0 h-full w-full object-cover'
                        initial={reduceMotion ? { opacity: 1 } : { opacity: 0, scale: 1.02 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
                        transition={reduceMotion ? { duration: 0 } : { duration: 0.6 }}
                        loading='lazy'
                      />
                    </AnimatePresence>
                  </div>
                  <div className='mt-4 flex items-center justify-center gap-2'>
                    {progressImages.map((_, index) => (
                      <button
                        key={index}
                        type='button'
                        onClick={() => setProgressIndex(index)}
                        className={`h-2 w-2 rounded-full transition ${
                          index === progressIndex
                            ? 'bg-[var(--gold)]'
                            : 'bg-white/20 hover:bg-white/40'
                        }`}
                        aria-label={`Imagem ${index + 1}`}
                      />
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          <section
            id='experiencia'
            className='section-shell section-base section-glow section-divider scroll-mt-24'
          >
            <div className='section-inner'>
              <div className='flex flex-col items-center gap-6 text-center'>
                <h2 className='section-title font-semibold text-[var(--text)]'>
                  {copy.finalCta.title}
                </h2>
                <p className='max-w-xl text-base text-[var(--muted)] md:text-lg'>
                  {copy.finalCta.body}
                </p>
                <div className='flex flex-col gap-3 sm:flex-row'>
                  <a
                    href={whatsappLink}
                    target='_blank'
                    rel='noreferrer'
                    className='inline-flex items-center justify-center rounded-full bg-[var(--gold)] px-6 py-3 text-sm font-semibold text-[#0c1116] transition hover:brightness-110'
                  >
                    {copy.finalCta.primary}
                  </a>
                  <a
                    href='#obra'
                    className='inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white/80 transition hover:border-[var(--gold)]/40 hover:text-white'
                  >
                    {copy.finalCta.secondary}
                  </a>
                </div>
              </div>
            </div>
          </section>

          <section
            id='contato'
            className='section-shell section-alt section-glow section-divider scroll-mt-24'
          >
            <div className='section-inner'>
              <div className='grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start'>
                <div className='space-y-5 text-center lg:text-left'>
                  <p className='text-xs uppercase tracking-[0.32em] text-[var(--muted)]'>
                    {copy.contact.tag}
                  </p>
                  <h2 className='section-title font-semibold text-[var(--text)]'>
                    {copy.contact.title}
                  </h2>
                  <p className='text-base text-[var(--muted)] md:text-lg'>
                    {copy.contact.body}
                  </p>
                  <form
                    className='glass-panel mt-6 space-y-4 p-6 md:p-8'
                    action='https://formspree.io/f/mgolwpwv'
                    method='POST'
                  >
                    <div className='grid gap-4 sm:grid-cols-2'>
                      <label className='space-y-2 text-sm text-white/70'>
                        <span>{copy.contact.form.nameLabel}</span>
                        <input
                          type='text'
                          name='name'
                          placeholder={copy.contact.form.namePlaceholder}
                          required
                          className='w-full rounded-xl border border-white/12 bg-[var(--panel)] px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/40'
                        />
                      </label>
                      <label className='space-y-2 text-sm text-white/70'>
                        <span>{copy.contact.form.emailLabel}</span>
                        <input
                          type='email'
                          name='email'
                          placeholder={copy.contact.form.emailPlaceholder}
                          required
                          className='w-full rounded-xl border border-white/12 bg-[var(--panel)] px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/40'
                        />
                      </label>
                    </div>
                    <label className='space-y-2 text-sm text-white/70'>
                      <span>{copy.contact.form.messageLabel}</span>
                      <textarea
                        rows={4}
                        name='message'
                        placeholder={copy.contact.form.messagePlaceholder}
                        required
                        className='w-full resize-none rounded-xl border border-white/12 bg-[var(--panel)] px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/40'
                      />
                    </label>
                    <button
                      type='submit'
                      className='inline-flex w-full items-center justify-center rounded-full bg-[var(--gold)] px-6 py-3 text-sm font-semibold text-[#0c1116] transition hover:brightness-110'
                    >
                      {copy.contact.form.submit}
                    </button>
                  </form>
                </div>
                <div className='space-y-4'>
                  <div className='panel-strong flex items-start gap-3 px-5 py-4 text-white/80'>
                    <span className='inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-[var(--gold)]'>
                      <PhoneCall className='h-5 w-5' />
                    </span>
                    <div>
                      <p className='text-xs uppercase tracking-[0.2em] text-white/50'>
                        {copy.contact.cards.whatsapp}
                      </p>
                      <a
                        href={whatsappLink}
                        target='_blank'
                        rel='noreferrer'
                        className='mt-1 block text-sm font-semibold text-white'
                      >
                        {copy.contact.whatsappValue}
                      </a>
                    </div>
                  </div>
                  <div className='panel-strong flex items-start gap-3 px-5 py-4 text-white/80'>
                    <span className='inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-[var(--gold)]'>
                      <Mail className='h-5 w-5' />
                    </span>
                    <div>
                      <p className='text-xs uppercase tracking-[0.2em] text-white/50'>
                        {copy.contact.cards.email}
                      </p>
                      <a
                        href={`mailto:${copy.contact.email}`}
                        className='mt-1 block text-sm font-semibold text-white'
                      >
                        {copy.contact.email}
                      </a>
                    </div>
                  </div>
                  <div className='panel-strong flex items-start gap-3 px-5 py-4 text-white/80'>
                    <span className='inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-[var(--gold)]'>
                      <MapPin className='h-5 w-5' />
                    </span>
                    <div>
                      <p className='text-xs uppercase tracking-[0.2em] text-white/50'>
                        {copy.contact.cards.location}
                      </p>
                      <a
                        href={mapLocationUrl}
                        target='_blank'
                        rel='noreferrer'
                        className='mt-1 block text-sm font-semibold text-white transition hover:text-[var(--gold)]'
                      >
                        {copy.contact.location}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

        </main>
      </div>
    </MotionConfig>
  );
}
