'use client';

import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { HeroVideo } from '@/app/components/hero/HeroVideo';
import type { Translation } from '@/app/lib/translations';

type Props = {
  copy: Translation['hero'];
  whatsappLink: string;
};

const Reveal = ({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) => {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={
        reduceMotion ? { duration: 0 } : { duration: 0.6, ease: 'easeOut', delay }
      }
    >
      {children}
    </motion.div>
  );
};

export const Hero = ({ copy, whatsappLink }: Props) => {
  return (
    <section
      id='inicio'
      className='grain grain-soft relative flex min-h-[100svh] items-start overflow-hidden bg-[#07131D] pt-24 md:min-h-screen md:items-center md:pt-20'
    >
      <HeroVideo />
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
                  {copy.eyebrow}
                </p>
              </Reveal>
              <Reveal delay={0.1}>
                <h1 className='hero-title-glow mt-4 text-balance text-4xl font-medium leading-[1.2] tracking-[-0.02em] md:text-5xl lg:mx-auto lg:max-w-[600px] lg:text-[clamp(40px,4.4vw,68px)] lg:leading-[1.05] lg:tracking-[-0.03em] lg:font-semibold'>
                  {copy.title.split('\n').map((line) => (
                    <span key={line} className='block'>
                      {line}
                    </span>
                  ))}
                </h1>
              </Reveal>
              <Reveal delay={0.2}>
                <p className='mt-6 max-w-[620px] text-sm text-white/80 md:text-base lg:hidden'>
                  {copy.subtitle}
                </p>
                <p className='mt-8 hidden max-w-[520px] text-[18px] text-white/85 lg:mx-auto lg:block lg:leading-[1.6]'>
                  {copy.subtitleDesktop}
                </p>
              </Reveal>
              <Reveal delay={0.3} className='mt-10 flex justify-center lg:mt-10 lg:justify-center'>
                <a
                  href={whatsappLink}
                  target='_blank'
                  rel='noreferrer'
                  className='hero-cta-glow inline-flex w-full items-center justify-center rounded-full border border-white/12 bg-[#0B2A3A] px-7 py-3 text-sm font-semibold text-white shadow-[0_14px_34px_rgba(10,46,70,0.22)] transition duration-500 hover:-translate-y-0.5 hover:shadow-[0_0_18px_rgba(183,146,90,0.45)] lg:w-auto lg:bg-gradient-to-r lg:from-[#0B2A3A] lg:to-[#0A2231] lg:px-9 lg:py-4'
                >
                  <span className='lg:hidden'>{copy.primaryCta}</span>
                  <span className='hidden lg:inline'>{copy.primaryCtaDesktop}</span>
                </a>
              </Reveal>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
