'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, MotionConfig, useReducedMotion } from 'framer-motion';
import { Building2, Compass, KeyRound, Landmark, MapPin } from 'lucide-react';

const whatsappNumber = '5571999999999';
const whatsappMessage =
  'Olá! Quero entender mais sobre o Bella Vista Beach Residence.';
const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
  whatsappMessage
)}`;

const heroImage =
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2400&q=80';
const contextImage =
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=80';

const mapChips = [
  { label: 'Porto Seguro', top: '18%', left: '12%' },
  { label: 'Coroa Vermelha', top: '32%', left: '58%' },
  { label: "Arraial d'Ajuda", top: '58%', left: '16%' },
  { label: 'Trancoso', top: '70%', left: '62%' },
];

const productCards = [
  {
    title: 'Stúdios funcionais',
    description: 'Plantas inteligentes com metragem otimizada e alto potencial.',
    icon: Building2,
  },
  {
    title: 'Projeto contemporâneo',
    description: 'Arquitetura clean, acabamentos consistentes e leitura premium.',
    icon: Compass,
  },
  {
    title: 'Região em crescimento',
    description: 'Demanda turística crescente e valorização sustentada.',
    icon: Landmark,
  },
  {
    title: 'Ideal para morar ou investir',
    description: 'Uso próprio com liquidez para temporada e renda passiva.',
    icon: KeyRound,
  },
];

const audience = [
  'Investidor patrimonial',
  'Segunda residência',
  'Renda com temporada',
];

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
          Bella Vista
        </span>
        <a
          href={whatsappLink}
          target='_blank'
          rel='noreferrer'
          className='rounded-full bg-ocean px-5 py-2 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-glow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ocean'
        >
          Falar no WhatsApp
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
            className='relative flex min-h-screen items-center overflow-hidden pt-16'
          >
            <div
              className='absolute inset-0 bg-cover bg-center'
              style={{ backgroundImage: `url(${heroImage})` }}
              aria-hidden='true'
            />
            <div className='absolute inset-0 bg-gradient-to-b from-black/45 via-black/55 to-black/70' />
            <div className='absolute inset-0 vignette' />
            <div className='relative z-10 mx-auto w-full max-w-6xl px-6 pb-16 pt-20 text-white'>
              <Reveal>
                <p className='text-[0.65rem] uppercase tracking-[0.42em] text-white/70'>
                  BR-367 • Litoral Sul da Bahia
                </p>
              </Reveal>
              <Reveal delay={0.1}>
                <h1 className='mt-4 max-w-3xl text-balance text-4xl font-semibold leading-tight md:text-6xl'>
                  Viva perto do mar.
                  <br />
                  Invista onde o futuro passa.
                </h1>
              </Reveal>
              <Reveal delay={0.2}>
                <p className='mt-6 max-w-2xl text-lg text-white/80 md:text-xl'>
                  Stúdios e apartamentos em uma das regiões mais desejadas da
                  Bahia, com localização estratégica e alto potencial de
                  valorização.
                </p>
              </Reveal>
              <Reveal delay={0.3} className='mt-10 flex flex-col gap-4 md:flex-row'>
                <a
                  href={whatsappLink}
                  target='_blank'
                  rel='noreferrer'
                  className='inline-flex items-center justify-center rounded-full bg-white px-7 py-3 text-sm font-semibold text-ocean shadow-card transition hover:-translate-y-0.5 hover:shadow-glow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white'
                >
                  Falar com um especialista no WhatsApp
                </a>
                <a
                  href='#localizacao'
                  className='inline-flex items-center justify-center text-sm font-semibold text-white/80 transition hover:text-white'
                >
                  Ver localização
                </a>
              </Reveal>
              <Reveal delay={0.4}>
                <p className='mt-4 text-sm text-white/70'>
                  Atendimento consultivo, reservado e sem pressão.
                </p>
              </Reveal>
            </div>
          </section>

          <section
            id='contexto'
            className='scroll-mt-24 bg-sand py-24'
          >
            <div className='mx-auto grid max-w-6xl items-center gap-12 px-6 md:grid-cols-[1.05fr_1fr]'>
              <div className='space-y-5'>
                <Reveal>
                  <p className='text-xs uppercase tracking-[0.32em] text-muted'>
                    Contexto da Bahia
                  </p>
                </Reveal>
                <Reveal delay={0.1}>
                  <h2 className='text-3xl font-semibold text-balance md:text-4xl'>
                    A Bahia vive uma explosão turística.
                  </h2>
                </Reveal>
                <Reveal delay={0.2}>
                  <p className='text-base text-muted md:text-lg'>
                    O ciclo é claro: quando turismo e infraestrutura evoluem, o
                    mercado responde com valorização consistente e demanda
                    sustentável.
                  </p>
                </Reveal>
                <Reveal delay={0.3}>
                  <ul className='space-y-3 text-sm text-ink/80'>
                    <li className='flex items-center gap-3'>
                      <span className='h-1.5 w-1.5 rounded-full bg-gold' />
                      Fluxo turístico em alta com ocupação crescente.
                    </li>
                    <li className='flex items-center gap-3'>
                      <span className='h-1.5 w-1.5 rounded-full bg-gold' />
                      Investimentos em infraestrutura e mobilidade.
                    </li>
                    <li className='flex items-center gap-3'>
                      <span className='h-1.5 w-1.5 rounded-full bg-gold' />
                      Procura por ativos com liquidez e lastro real.
                    </li>
                  </ul>
                </Reveal>
              </div>
              <Reveal delay={0.2}>
                <figure className='rounded-2xl bg-white p-3 shadow-soft'>
                  <img
                    src={contextImage}
                    alt='Vista do litoral sul da Bahia'
                    className='h-[360px] w-full rounded-xl object-cover'
                    loading='lazy'
                  />
                  <figcaption className='mt-3 text-xs uppercase tracking-[0.28em] text-muted'>
                    Entre natureza e mobilidade estratégica
                  </figcaption>
                </figure>
              </Reveal>
            </div>
          </section>

          <section
            id='localizacao'
            className='scroll-mt-24 bg-white py-24'
          >
            <div className='mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-[1fr_1.1fr]'>
              <div className='space-y-5'>
                <Reveal>
                  <p className='text-xs uppercase tracking-[0.32em] text-muted'>
                    Localização estratégica
                  </p>
                </Reveal>
                <Reveal delay={0.1}>
                  <h2 className='text-3xl font-semibold text-balance md:text-4xl'>
                    Entre a BR-367 e o azul do mar, nasce uma decisão bem
                    posicionada.
                  </h2>
                </Reveal>
                <Reveal delay={0.2}>
                  <p className='text-base text-muted md:text-lg'>
                    Acesso direto, visibilidade e proximidade com os polos mais
                    desejados do litoral sul. Um ponto de equilíbrio entre fluxo
                    turístico e privacidade.
                  </p>
                </Reveal>
              </div>
              <Reveal delay={0.1}>
                <div className='relative rounded-2xl border border-slate-200 bg-white p-6 shadow-card'>
                  <div className='absolute inset-0 rounded-2xl ring-1 ring-gold/20' />
                  <div className='relative h-[320px] rounded-xl bg-sand/70'>
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

                    <div className='absolute right-[18%] top-[46%] flex items-center'>
                      <span className='relative flex h-4 w-4 items-center justify-center'>
                        <span className='absolute inline-flex h-full w-full rounded-full bg-gold/30 motion-safe:animate-ping' />
                        <span className='relative inline-flex h-3 w-3 rounded-full bg-gold' />
                      </span>
                      <span className='ml-3 rounded-full border border-white/60 bg-white/80 px-3 py-1 text-xs font-semibold text-ocean'>
                        Bella Vista
                      </span>
                    </div>

                    {mapChips.map((chip) => (
                      <span
                        key={chip.label}
                        className='absolute rounded-full border border-white/70 bg-white/80 px-3 py-1 text-xs text-ink shadow-sm'
                        style={{ top: chip.top, left: chip.left }}
                      >
                        {chip.label}
                      </span>
                    ))}
                  </div>
                  <div className='mt-5 flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-muted'>
                    <MapPin className='h-4 w-4 text-gold' />
                    BR-367 → polos turísticos → Bella Vista Beach Residence
                  </div>
                </div>
              </Reveal>
            </div>
          </section>

          <section
            id='proposta'
            className='scroll-mt-24 bg-sand py-24'
          >
            <div className='mx-auto max-w-6xl px-6'>
              <div className='mb-12 max-w-3xl space-y-4'>
                <Reveal>
                  <p className='text-xs uppercase tracking-[0.32em] text-muted'>
                    Proposta do produto
                  </p>
                </Reveal>
                <Reveal delay={0.1}>
                  <h2 className='text-3xl font-semibold text-balance md:text-4xl'>
                    Pensado para quem entende que investir bem começa pela
                    localização certa.
                  </h2>
                </Reveal>
              </div>
              <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-4'>
                {productCards.map((card, index) => {
                  const Icon = card.icon;
                  return (
                    <Reveal key={card.title} delay={0.1 + index * 0.08}>
                      <div className='group h-full rounded-2xl border border-white/70 bg-white px-5 py-6 shadow-soft transition hover:-translate-y-1 hover:shadow-card'>
                        <Icon className='h-6 w-6 text-ocean/80' />
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

          <section id='perfil' className='scroll-mt-24 bg-white py-24'>
            <div className='mx-auto max-w-6xl px-6'>
              <Reveal>
                <div className='rounded-2xl border border-slate-200 bg-sand px-6 py-12 text-center shadow-soft md:px-12'>
                  <p className='text-xs uppercase tracking-[0.32em] text-muted'>
                    Para quem é
                  </p>
                  <h2 className='mt-4 text-3xl font-semibold md:text-4xl'>
                    Este projeto é ideal para quem busca patrimônio, não impulso.
                  </h2>
                  <p className='mx-auto mt-4 max-w-2xl text-base text-muted md:text-lg'>
                    Uma escolha racional com o conforto emocional de estar perto
                    do mar. Sem promessas vazias. Só consistência.
                  </p>
                  <div className='mt-10 grid gap-4 md:grid-cols-3'>
                    {audience.map((item) => (
                      <div
                        key={item}
                        className='rounded-xl border border-white/70 bg-white px-4 py-4 text-sm font-semibold text-ink shadow-sm'
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
            className='grain scroll-mt-24 bg-ocean py-24 text-white'
          >
            <div className='mx-auto flex max-w-6xl flex-col gap-8 px-6 lg:flex-row lg:items-center lg:justify-between'>
              <div className='space-y-4'>
                <Reveal>
                  <p className='text-xs uppercase tracking-[0.32em] text-white/60'>
                    Experiência
                  </p>
                </Reveal>
                <Reveal delay={0.1}>
                  <h2 className='text-3xl font-semibold text-balance md:text-4xl'>
                    Alguns lugares você entende. Outros você sente.
                  </h2>
                </Reveal>
                <Reveal delay={0.2}>
                  <p className='max-w-xl text-base text-white/70 md:text-lg'>
                    A sensação do litoral, com a segurança de um investimento
                    estruturado. Uma pausa emocional com lógica financeira.
                  </p>
                </Reveal>
              </div>
              <Reveal delay={0.2}>
                <a
                  href={whatsappLink}
                  target='_blank'
                  rel='noreferrer'
                  className='inline-flex items-center justify-center rounded-full border border-white/40 px-7 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/10'
                >
                  Falar com um especialista
                </a>
              </Reveal>
            </div>
          </section>

          <section id='cta' className='bg-ocean py-24 text-white'>
            <div className='mx-auto flex max-w-6xl flex-col gap-8 px-6'>
              <Reveal>
                <p className='text-xs uppercase tracking-[0.32em] text-white/60'>
                  Conversão
                </p>
              </Reveal>
              <Reveal delay={0.1}>
                <h2 className='text-3xl font-semibold md:text-4xl'>
                  Quando fizer sentido, você vai saber.
                </h2>
              </Reveal>
              <Reveal delay={0.2}>
                <p className='max-w-2xl text-base text-white/70 md:text-lg'>
                  Converse com um especialista e avalie o Bella Vista como ativo
                  imobiliário estratégico. Sem formulários. Sem pressa.
                </p>
              </Reveal>
              <Reveal delay={0.3}>
                <a
                  href={whatsappLink}
                  target='_blank'
                  rel='noreferrer'
                  className='inline-flex w-fit items-center justify-center rounded-full bg-white px-8 py-3 text-sm font-semibold text-ocean shadow-glow transition hover:-translate-y-0.5'
                >
                  Conversar agora no WhatsApp
                </a>
              </Reveal>
              <Reveal delay={0.4}>
                <p className='text-xs uppercase tracking-[0.3em] text-white/50'>
                  Bella Vista Beach Residence • Bahia
                </p>
              </Reveal>
            </div>
          </section>
        </main>

        <a
          href={whatsappLink}
          target='_blank'
          rel='noreferrer'
          aria-label='Abrir conversa no WhatsApp'
          className='fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 rounded-full bg-ocean px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-glow transition hover:-translate-y-0.5'
        >
          WhatsApp
        </a>
      </div>
    </MotionConfig>
  );
}
