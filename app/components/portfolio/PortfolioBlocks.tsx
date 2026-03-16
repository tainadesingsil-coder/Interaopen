'use client';

import { cn } from '@/app/lib/utils';
import type {
  FeaturedProject,
  ProductOffer,
  ProjectScreen,
} from '@/app/data/portfolio';
import Link from 'next/link';
import { Bot } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const AREA_COLOR: Record<ProductOffer['area'], string> = {
  Software: 'text-sky-300',
  Marketing: 'text-fuchsia-300',
  IA: 'text-lime-300',
};

const extractRadarOpenParam = (href: string) => {
  try {
    const parsed = new URL(href, typeof window !== 'undefined' ? window.location.origin : 'https://localhost');
    return parsed.searchParams.get('open') || '';
  } catch {
    return '';
  }
};

export function ProjectCard({ project }: { project: FeaturedProject }) {
  const isExternalLink = /^https?:\/\//i.test(project.caseHref);
  const radarOpenUrl = extractRadarOpenParam(project.caseHref);
  const isRadarDeepLink = !!radarOpenUrl;

  return (
    <article
      className='group rounded-xl border border-white/10 bg-[#0b0b0f] p-5 transition duration-200 hover:border-[#C6FF2E] hover:shadow-[0_0_0_1px_rgba(198,255,46,0.18),0_8px_22px_rgba(198,255,46,0.09)]'
      id={project.id}
    >
      {project.thumbnail ? (
        <div className='mb-4 overflow-hidden rounded-xl border border-white/10 bg-black/20'>
          <img
            src={project.thumbnail}
            alt={project.title}
            loading='lazy'
            className='h-44 w-full object-cover transition-transform duration-200 ease-out group-hover:scale-[1.02]'
          />
        </div>
      ) : null}

      <div className='flex items-start justify-between gap-3'>
        <h3 className='text-base font-bold text-white md:text-lg'>{project.title}</h3>
        <div className='flex flex-col items-end gap-1'>
          {project.isLive ? (
            <span className='rounded-md border border-red-500/45 bg-red-500/15 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-red-300'>
              Live
            </span>
          ) : null}
          <span className='rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-[#9ca3af]'>
            {project.category}
          </span>
        </div>
      </div>
      <p className='mt-3 text-sm leading-relaxed text-[#9ca3af]'>{project.summary}</p>
      {project.channel || project.metricLabel ? (
        <p className='mt-2 text-xs text-[#9ca3af]'>
          {[project.channel, project.metricLabel].filter(Boolean).join(' · ')}
        </p>
      ) : null}

      <div className='mt-4 flex flex-wrap gap-2'>
        {project.tags.map((tag) => (
          <span
            key={tag}
            className='rounded-md border border-white/10 bg-black/30 px-2 py-1 font-mono text-[11px] text-[#9ca3af]'
          >
            {tag}
          </span>
        ))}
      </div>

      {isRadarDeepLink ? (
        <button
          type='button'
          onClick={() => {
            if (typeof window === 'undefined') return;
            window.dispatchEvent(new CustomEvent('radar:open-url', { detail: radarOpenUrl }));
            if (window.location.hash !== '#radar-ia') {
              window.location.hash = 'radar-ia';
            } else {
              window.dispatchEvent(new Event('hashchange'));
            }
          }}
          className='mt-5 inline-flex items-center rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white transition hover:border-[#C6FF2E] hover:text-[#C6FF2E]'
        >
          {project.caseLabel || 'Ver case'}
        </button>
      ) : (
        <Link
          href={project.caseHref}
          target={isExternalLink ? '_blank' : undefined}
          rel={isExternalLink ? 'noreferrer' : undefined}
          className='mt-5 inline-flex items-center rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white transition hover:border-[#C6FF2E] hover:text-[#C6FF2E]'
        >
          {project.caseLabel || 'Ver case'}
        </Link>
      )}
    </article>
  );
}

export function ProductCard({ offer }: { offer: ProductOffer }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fullAnswer, setFullAnswer] = useState('');
  const [typedAnswer, setTypedAnswer] = useState('');
  const typingTimerRef = useRef<number | null>(null);

  const clearTypingTimer = () => {
    if (typingTimerRef.current && typeof window !== 'undefined') {
      window.clearInterval(typingTimerRef.current);
      typingTimerRef.current = null;
    }
  };

  useEffect(() => {
    if (!isExpanded || !fullAnswer) {
      return;
    }

    clearTypingTimer();
    setTypedAnswer('');
    typingTimerRef.current = window.setInterval(() => {
      setTypedAnswer((prev) => {
        const next = fullAnswer.slice(0, prev.length + 2);
        if (next.length >= fullAnswer.length) {
          clearTypingTimer();
        }
        return next;
      });
    }, 18);

    return () => {
      clearTypingTimer();
    };
  }, [fullAnswer, isExpanded]);

  useEffect(() => {
    return () => {
      clearTypingTimer();
    };
  }, []);

  const explainOffer = async () => {
    if (isLoading) {
      return;
    }

    if (isExpanded) {
      setIsExpanded(false);
      return;
    }

    setIsExpanded(true);
    setErrorMessage('');

    if (fullAnswer) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/service-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'explain',
          service: offer,
          question: `Explique ${offer.title} de forma comercial para o cliente entender valor e escopo.`,
          history: [],
        }),
      });

      if (!response.ok) {
        throw new Error('service_advisor_request_failed');
      }

      const payload = (await response.json()) as { answer?: string };
      const answer = (payload.answer ?? '').replace(/\s+/g, ' ').trim();
      if (!answer) {
        throw new Error('empty_answer');
      }

      setFullAnswer(answer);
    } catch {
      setErrorMessage('Não consegui explicar agora. Tente novamente em instantes.');
      setFullAnswer(
        `${offer.title}: ${offer.description} Podemos detalhar escopo, prazo e impacto para sua operação.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <article className='rounded-xl border border-white/10 bg-[#0b0b0f] p-4 transition hover:border-[#C6FF2E] hover:shadow-[0_0_18px_rgba(198,255,46,0.08)]'>
      <p
        className={cn(
          'text-[10px] font-semibold uppercase tracking-[0.18em]',
          AREA_COLOR[offer.area]
        )}
      >
        {offer.area}
      </p>
      <h4 className='mt-2 text-sm font-bold text-white md:text-base'>{offer.title}</h4>
      <p className='mt-2 text-sm leading-relaxed text-[#9ca3af]'>{offer.description}</p>
      <button
        type='button'
        onClick={() => void explainOffer()}
        className='mt-3 inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white transition hover:border-[#C6FF2E] hover:text-[#C6FF2E]'
      >
        <Bot className='h-3.5 w-3.5' />
        {isExpanded ? 'Ocultar explicação IA' : 'Explicar com IA'}
      </button>

      {isExpanded ? (
        <div className='mt-3 rounded-md border border-[#C6FF2E]/30 bg-[#C6FF2E]/8 p-3'>
          {isLoading ? (
            <p className='text-xs text-[#c9d1d9]'>IA escrevendo explicação...</p>
          ) : (
            <p className='text-sm leading-relaxed text-[#d9ff8a]'>{typedAnswer || fullAnswer}</p>
          )}
          {errorMessage ? <p className='mt-2 text-xs text-[#fda4af]'>{errorMessage}</p> : null}
        </div>
      ) : null}
    </article>
  );
}

export function ScreenshotMockup({
  screen,
  projectTitle,
}: {
  screen: ProjectScreen;
  projectTitle: string;
}) {
  const isMobile = screen.device === 'mobile';

  return (
    <article className='rounded-xl border border-white/10 bg-[#0b0b0f] p-4'>
      <div className='mb-3 flex items-center justify-between'>
        <div>
          <p className='text-xs font-semibold text-white'>{screen.title}</p>
          <p className='text-[11px] text-[#9ca3af]'>{projectTitle}</p>
        </div>
        <span className='rounded-md border border-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-[#9ca3af]'>
          {screen.device}
        </span>
      </div>

      <div className='flex justify-center rounded-lg border border-white/10 bg-black/30 p-3'>
        <div
          className={cn(
            'relative overflow-hidden rounded-md border border-white/10 bg-[#060608]',
            isMobile ? 'aspect-[9/18] w-[150px]' : 'aspect-[16/10] w-full max-w-[460px]'
          )}
        >
          <div className='flex items-center gap-1 border-b border-white/10 px-3 py-2'>
            <span className='h-1.5 w-1.5 rounded-full bg-[#9ca3af]' />
            <span className='h-1.5 w-1.5 rounded-full bg-[#9ca3af]' />
            <span className='h-1.5 w-1.5 rounded-full bg-[#C6FF2E]' />
          </div>
          <div className='grid h-full grid-cols-6 gap-2 p-3 opacity-90'>
            <div className='col-span-2 rounded border border-white/10 bg-white/5' />
            <div className='col-span-4 rounded border border-white/10 bg-white/5' />
            <div className='col-span-6 rounded border border-white/10 bg-white/5' />
            <div className='col-span-3 rounded border border-white/10 bg-white/5' />
            <div className='col-span-3 rounded border border-white/10 bg-white/5' />
            <div className='col-span-6 rounded border border-[#C6FF2E]/40 bg-[#C6FF2E]/10' />
          </div>
        </div>
      </div>

      <p className='mt-3 text-sm text-[#9ca3af]'>{screen.description}</p>
    </article>
  );
}
