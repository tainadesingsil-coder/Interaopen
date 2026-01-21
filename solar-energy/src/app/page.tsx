'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, MotionConfig, useReducedMotion } from 'framer-motion';
import { Building2, Compass, KeyRound, Landmark, MapPin } from 'lucide-react';

const whatsappNumber = '5571999999999';

const copy = {
  whatsappMessage:
    'Olá! Quero entender mais sobre o Bella Vista Beach Residence.',
  header: {
    brand: 'Bella Vista',
    cta: 'Conversar no WhatsApp',
  },
  hero: {
    eyebrow: 'BR-367 • Litoral Sul da Bahia',
    title: 'Viva perto do mar.\nInvista onde o futuro passa.',
    subtitle:
      'Stúdios e apartamentos em uma das regiões mais desejadas da Bahia, com localização estratégica e alto potencial de valorização.',
    primaryCta: 'Falar com um especialista no WhatsApp',
    secondaryCta: 'Ver localização',
    note: 'Atendimento consultivo, reservado e sem pressão.',
  },
  context: {
    tag: 'Contexto da Bahia',
    title: 'A Bahia vive uma explosão turística.',
    body:
      'Turismo, mobilidade e infraestrutura aceleram a valorização. O mercado responde quando o desejo encontra acesso.',
    bullets: [
      'Fluxo turístico em alta com ocupação constante.',
      'Infraestrutura e mobilidade avançando a cada temporada.',
      'Demanda por imóveis com liquidez e renda recorrente.',
    ],
    caption: 'Entre natureza e mobilidade estratégica',
    imageAlt: 'Vista do litoral sul da Bahia',
  },
  location: {
    tag: 'Localização estratégica',
    title:
      'Entre a BR-367 e o azul do mar, nasce uma decisão bem posicionada.',
    body:
      'Acesso direto, visibilidade e proximidade com os polos mais desejados do litoral sul. Um ponto de equilíbrio entre fluxo turístico e privacidade.',
    badge: 'BR-367',
    mapNote: 'BR-367 → polos turísticos → Bella Vista Beach Residence',
    pinLabel: 'Bella Vista',
    chips: [
      { label: 'Porto Seguro', top: '18%', left: '12%' },
      { label: 'Coroa Vermelha', top: '32%', left: '58%' },
      { label: "Arraial d'Ajuda", top: '58%', left: '16%' },
      { label: 'Trancoso', top: '70%', left: '62%' },
    ],
  },
  product: {
    tag: 'Proposta do produto',
    title:
      'Pensado para quem entende que investir bem começa pela localização certa.',
    cards: [
      {
        title: 'Stúdios funcionais',
        description:
          'Plantas inteligentes, metragem otimizada e facilidade de operação.',
        icon: Building2,
      },
      {
        title: 'Projeto contemporâneo',
        description:
          'Arquitetura limpa, acabamentos consistentes e presença premium.',
        icon: Compass,
      },
      {
        title: 'Região em crescimento',
        description: 'Demanda turística crescente, valorização sustentada.',
        icon: Landmark,
      },
      {
        title: 'Ideal para morar ou investir',
        description:
          'Uso próprio com liquidez para temporada e renda passiva.',
        icon: KeyRound,
      },
    ],
  },
  audience: {
    tag: 'Para quem é',
    title: 'Este projeto é ideal para quem busca patrimônio, não impulso.',
    body:
      'Perfil racional, sensível ao lugar certo. Uma escolha feita com calma e visão de longo prazo.',
    items: ['Investidor patrimonial', 'Segunda residência', 'Renda com temporada'],
  },
  experience: {
    tag: 'Experiência',
    title: 'Alguns lugares você entende. Outros você sente.',
    body:
      'O Bella Vista equilibra desejo e previsibilidade. Um convite para viver o litoral com segurança patrimonial.',
  },
  cta: {
    tag: 'Conversão',
    title: 'Quando fizer sentido, você vai saber.',
    body:
      'Converse com um especialista e avalie o Bella Vista como ativo imobiliário estratégico. Sem formulários. Sem pressa.',
    button: 'Conversar agora no WhatsApp',
  },
  floating: {
    label: 'WhatsApp',
    ariaLabel: 'Abrir conversa no WhatsApp',
  },
};

const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
  copy.whatsappMessage
)}`;

const heroImage =
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2400&q=80';
const contextImage =
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=80';

function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { duration: 0.6, ease: 'easeOut', delay }
      }
    >
      {children}
    </motion.div>
  );
}

function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition ${
        scrolled
          ? 'bg-sand/80 backdrop-blur-lg shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className='mx-auto flex max-w-6xl items-center justify-between px-6 py-4'>
        <span className='font-display text-xs uppercase tracking-[0.35em] text-ink'>
          {copy.header.brand}
        </span>
        <a
          href={whatsappLink}
          target='_blank'
          rel='noreferrer'
          className='rounded-full bg-ocean/95 px-5 py-2 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-glow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ocean'
        >
          {copy.header.cta}
        </a>
      </div>
    </header>
  );
}

export default function HomePage() {
  const reduceMotion = useReducedMotion();
  const mapLineVariants = useMemo(
    () => ({
      hidden: reduceMotion ? { pathLength: 1, opacity: 1 } : { pathLength: 0 },
      visible: {
        pathLength: 1,
        opacity: 1,
        transition: reduceMotion ? { duration: 0 } : { duration: 1.6 },
      },
    }),
    [reduceMotion]
  );

  return (
    <MotionConfig reducedMotion='user'>
      <div className='bg-sand text-ink'>
        <Header />

        <main className='pt-20'>
          <section
            id='inicio'
            className='relative flex min-h-screen items-center overflow-hidden pt-20'
          >
            <div
              className='absolute inset-0 bg-cover bg-center'
              style={{ backgroundImage: `url(${heroImage})` }}
              aria-hidden='true'
            />
            <div className='absolute inset-0 bg-gradient-to-b from-black/35 via-black/55 to-black/80' />
            <div className='absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_55%)]' />
            <div className='absolute inset-0 vignette' />
            <div className='relative z-10 mx-auto w-full max-w-6xl px-6 pb-20 pt-24 text-white'>
              <Reveal>
                <p className='text-[0.65rem] uppercase tracking-[0.42em] text-white/70'>
                  {copy.hero.eyebrow}
                </p>
              </Reveal>
              <Reveal delay={0.1}>
                <h1 className='mt-4 max-w-3xl text-balance text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl'>
                  {copy.hero.title.split('\n').map((line) => (
                    <span key={line} className='block'>
                      {line}
                    </span>
                  ))}
                </h1>
              </Reveal>
              <Reveal delay={0.2}>
                <p className='mt-6 max-w-2xl text-lg text-white/80 md:text-xl'>
                  {copy.hero.subtitle}
                </p>
              </Reveal>
              <Reveal
                delay={0.3}
                className='mt-10 flex flex-col gap-4 md:flex-row md:items-center'
              >
                <a
                  href={whatsappLink}
                  target='_blank'
                  rel='noreferrer'
                  className='inline-flex items-center justify-center rounded-full bg-white/95 px-7 py-3 text-sm font-semibold text-ocean shadow-card transition hover:-translate-y-0.5 hover:shadow-glow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white'
                >
                  {copy.hero.primaryCta}
                </a>
                <a
                  href='#localizacao'
                  className='inline-flex items-center justify-center text-sm font-semibold text-white/80 transition hover:text-white'
                >
                  {copy.hero.secondaryCta}
                </a>
              </Reveal>
              <Reveal delay={0.4}>
                <p className='mt-4 text-sm text-white/70'>{copy.hero.note}</p>
              </Reveal>
            </div>
          </section>

          <section
            id='contexto'
            className='scroll-mt-24 bg-sand py-28'
          >
            <div className='mx-auto grid max-w-6xl items-center gap-12 px-6 md:grid-cols-[1.05fr_1fr]'>
              <div className='space-y-5'>
                <Reveal>
                  <p className='text-xs uppercase tracking-[0.32em] text-muted'>
                    {copy.context.tag}
                  </p>
                </Reveal>
                <Reveal delay={0.1}>
                  <h2 className='text-3xl font-semibold text-balance md:text-4xl'>
                    {copy.context.title}
                  </h2>
                </Reveal>
                <Reveal delay={0.2}>
                  <p className='text-base text-muted md:text-lg'>
                    {copy.context.body}
                  </p>
                </Reveal>
                <Reveal delay={0.3}>
                  <ul className='space-y-3 text-sm text-ink/80'>
                    {copy.context.bullets.map((item) => (
                      <li key={item} className='flex items-center gap-3'>
                        <span className='h-1.5 w-1.5 rounded-full bg-gold' />
                        {item}
                      </li>
                    ))}
                  </ul>
                </Reveal>
              </div>
              <Reveal delay={0.2}>
                <figure className='rounded-2xl border border-white/70 bg-white/75 p-3 shadow-soft backdrop-blur'>
                  <img
                    src={contextImage}
                    alt={copy.context.imageAlt}
                    className='h-[360px] w-full rounded-xl object-cover'
                    loading='lazy'
                  />
                  <figcaption className='mt-3 text-xs uppercase tracking-[0.28em] text-muted'>
                    {copy.context.caption}
                  </figcaption>
                </figure>
              </Reveal>
            </div>
          </section>

          <section
            id='localizacao'
            className='scroll-mt-24 bg-white py-28'
          >
            <div className='mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-[1fr_1.1fr]'>
              <div className='space-y-5'>
                <Reveal>
                  <p className='text-xs uppercase tracking-[0.32em] text-muted'>
                    {copy.location.tag}
                  </p>
                </Reveal>
                <Reveal delay={0.1}>
                  <h2 className='text-3xl font-semibold text-balance md:text-4xl'>
                    {copy.location.title}
                  </h2>
                </Reveal>
                <Reveal delay={0.2}>
                  <p className='text-base text-muted md:text-lg'>
                    {copy.location.body}
                  </p>
                </Reveal>
              </div>
              <Reveal delay={0.1}>
                <div className='relative rounded-2xl border border-white/70 bg-white/70 p-6 shadow-card backdrop-blur'>
                  <div className='absolute inset-0 rounded-2xl bg-gradient-to-br from-white/60 via-white/30 to-transparent' />
                  <div className='relative h-[320px] rounded-xl bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.7),rgba(246,241,234,0.8)_55%,rgba(246,241,234,0.6)_100%)]'>
                    <motion.svg
                      className='absolute inset-0 h-full w-full'
                      viewBox='0 0 640 320'
                      initial='hidden'
                      whileInView='visible'
                      viewport={{ once: true, amount: 0.6 }}
                    >
                      <motion.path
                        d='M30 250 C140 180 210 200 280 140 C360 70 460 40 610 30'
                        stroke='#08263A'
                        strokeWidth='3'
                        strokeLinecap='round'
                        fill='none'
                        variants={mapLineVariants}
                      />
                    </motion.svg>

                    <span className='absolute left-5 top-5 rounded-full border border-white/70 bg-white/80 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-ocean'>
                      {copy.location.badge}
                    </span>

                    <div className='absolute right-[18%] top-[46%] flex items-center'>
                      <span className='relative flex h-4 w-4 items-center justify-center'>
                        <span className='absolute inline-flex h-full w-full rounded-full bg-gold/30 motion-safe:animate-ping' />
                        <span className='relative inline-flex h-3 w-3 rounded-full bg-gold shadow-[0_0_12px_rgba(183,146,90,0.45)]' />
                      </span>
                      <span className='ml-3 rounded-full border border-white/60 bg-white/85 px-3 py-1 text-xs font-semibold text-ocean shadow-sm'>
                        {copy.location.pinLabel}
                      </span>
                    </div>

                    {copy.location.chips.map((chip) => (
                      <span
                        key={chip.label}
                        className='absolute rounded-full border border-white/70 bg-white/80 px-3 py-1 text-xs text-ink shadow-sm backdrop-blur'
                        style={{ top: chip.top, left: chip.left }}
                      >
                        {chip.label}
                      </span>
                    ))}
                  </div>
                  <div className='mt-5 flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-muted'>
                    <MapPin className='h-4 w-4 text-gold' />
                    {copy.location.mapNote}
                  </div>
                </div>
              </Reveal>
            </div>
          </section>

          <section
            id='proposta'
            className='scroll-mt-24 bg-sand py-28'
          >
            <div className='mx-auto max-w-6xl px-6'>
              <div className='mb-12 max-w-3xl space-y-4'>
                <Reveal>
                  <p className='text-xs uppercase tracking-[0.32em] text-muted'>
                    {copy.product.tag}
                  </p>
                </Reveal>
                <Reveal delay={0.1}>
                  <h2 className='text-3xl font-semibold text-balance md:text-4xl'>
                    {copy.product.title}
                  </h2>
                </Reveal>
              </div>
              <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-4'>
                {copy.product.cards.map((card, index) => {
                  const Icon = card.icon;
                  return (
                    <Reveal key={card.title} delay={0.1 + index * 0.08}>
                      <div className='group h-full rounded-2xl border border-white/70 bg-white/80 px-5 py-6 shadow-soft backdrop-blur transition hover:-translate-y-1 hover:shadow-card'>
                        <Icon className='h-6 w-6 text-ocean/80 transition group-hover:text-ocean' />
                        <h3 className='mt-4 text-lg font-semibold text-ink'>
                          {card.title}
                        </h3>
                        <p className='mt-3 text-sm text-muted'>
                          {card.description}
                        </p>
                      </div>
                    </Reveal>
                  );
                })}
              </div>
            </div>
          </section>

          <section id='perfil' className='scroll-mt-24 bg-white py-28'>
            <div className='mx-auto max-w-6xl px-6'>
              <Reveal>
                <div className='rounded-2xl border border-white/70 bg-sand/90 px-6 py-12 text-center shadow-soft backdrop-blur md:px-12'>
                  <p className='text-xs uppercase tracking-[0.32em] text-muted'>
                    {copy.audience.tag}
                  </p>
                  <h2 className='mt-4 text-3xl font-semibold md:text-4xl'>
                    {copy.audience.title}
                  </h2>
                  <p className='mx-auto mt-4 max-w-2xl text-base text-muted md:text-lg'>
                    {copy.audience.body}
                  </p>
                  <div className='mt-10 grid gap-4 md:grid-cols-3'>
                    {copy.audience.items.map((item) => (
                      <div
                        key={item}
                        className='rounded-xl border border-white/70 bg-white/80 px-4 py-4 text-sm font-semibold text-ink shadow-sm backdrop-blur'
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            </div>
          </section>

          <section
            id='experiencia'
            className='grain scroll-mt-24 bg-ocean py-28 text-white'
          >
            <div className='mx-auto flex max-w-6xl flex-col gap-8 px-6 lg:flex-row lg:items-center lg:justify-between'>
              <div className='space-y-4'>
                <Reveal>
                  <p className='text-xs uppercase tracking-[0.32em] text-white/60'>
                    {copy.experience.tag}
                  </p>
                </Reveal>
                <Reveal delay={0.1}>
                  <h2 className='text-3xl font-semibold text-balance md:text-4xl'>
                    {copy.experience.title}
                  </h2>
                </Reveal>
                <Reveal delay={0.2}>
                  <p className='max-w-xl text-base text-white/70 md:text-lg'>
                    {copy.experience.body}
                  </p>
                </Reveal>
              </div>
            </div>
          </section>

          <section id='cta' className='grain bg-ocean py-28 text-white'>
            <div className='mx-auto flex max-w-6xl flex-col gap-8 px-6'>
              <Reveal>
                <p className='text-xs uppercase tracking-[0.32em] text-white/60'>
                  {copy.cta.tag}
                </p>
              </Reveal>
              <Reveal delay={0.1}>
                <h2 className='text-3xl font-semibold md:text-4xl'>
                  {copy.cta.title}
                </h2>
              </Reveal>
              <Reveal delay={0.2}>
                <p className='max-w-2xl text-base text-white/70 md:text-lg'>
                  {copy.cta.body}
                </p>
              </Reveal>
              <Reveal delay={0.3}>
                <a
                  href={whatsappLink}
                  target='_blank'
                  rel='noreferrer'
                  className='inline-flex w-fit items-center justify-center rounded-full bg-white/95 px-8 py-3 text-sm font-semibold text-ocean shadow-glow transition hover:-translate-y-0.5 hover:shadow-[0_20px_60px_rgba(8,38,58,0.25)]'
                >
                  {copy.cta.button}
                </a>
              </Reveal>
            </div>
          </section>
        </main>

        <a
          href={whatsappLink}
          target='_blank'
          rel='noreferrer'
          aria-label={copy.floating.ariaLabel}
          className='fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 rounded-full bg-ocean/95 px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-glow backdrop-blur transition hover:-translate-y-0.5 hover:shadow-[0_18px_48px_rgba(8,38,58,0.25)]'
        >
          {copy.floating.label}
        </a>
      </div>
    </MotionConfig>
  );
}
