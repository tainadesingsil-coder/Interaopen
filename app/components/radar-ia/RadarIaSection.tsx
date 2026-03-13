'use client';

import {
  RADAR_RANGES,
  RADAR_TYPES,
  type RadarItem,
  type RadarRange,
  type RadarResponsePayload,
  type RadarType,
} from '@/app/lib/radar-ia/types';
import { Bot, Code2, ExternalLink, Megaphone, Newspaper, PlayCircle, Search } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

const QUICK_CHIPS = [
  'Agentes de IA',
  'Automação com n8n',
  'Chatbots para WhatsApp',
  'Novidades OpenAI',
  'IA para marketing',
];

const TAB_LABEL: Record<RadarType, string> = {
  all: 'Tudo',
  youtube: 'YouTube',
  news: 'Notícias',
  instagram: 'Instagram',
};

const RANGE_LABEL: Record<RadarRange, string> = {
  '24h': '24h',
  '7d': '7d',
  '30d': '30d',
};

const MAX_QUERY_LENGTH = 80;
const INITIAL_VISIBLE = 6;

const sanitizeClientQuery = (value: string) =>
  value
    .replace(/[^\p{L}\p{N}\s\-_.:]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_QUERY_LENGTH);

const formatDate = (value: string | null) => {
  if (!value) {
    return 'Atualizado recentemente';
  }
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) {
    return 'Atualizado recentemente';
  }
  return new Date(parsed).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const useDebouncedValue = (value: string, delay = 450) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debounced;
};

function SkeletonCard() {
  return (
    <div className='animate-pulse rounded-xl border border-white/10 bg-[#0b0b0f] p-4'>
      <div className='h-4 w-2/3 rounded bg-white/10' />
      <div className='mt-3 h-3 w-full rounded bg-white/10' />
      <div className='mt-2 h-3 w-5/6 rounded bg-white/10' />
      <div className='mt-4 h-8 w-28 rounded bg-white/10' />
    </div>
  );
}

function RadarCard({ item }: { item: RadarItem }) {
  const icon =
    item.kind === 'youtube' ? (
      <PlayCircle className='h-4 w-4 text-[#C6FF2E]' />
    ) : item.kind === 'news' ? (
      <Newspaper className='h-4 w-4 text-[#C6FF2E]' />
    ) : (
      <Bot className='h-4 w-4 text-[#C6FF2E]' />
    );

  return (
    <article className='group rounded-xl border border-white/10 bg-[#0b0b0f] p-4 transition hover:border-[#C6FF2E] hover:shadow-[0_0_0_1px_rgba(198,255,46,0.18),0_10px_28px_rgba(198,255,46,0.08)]'>
      {item.thumbnail ? (
        <div className='mb-3 overflow-hidden rounded-md border border-white/10 bg-black/20'>
          <img
            src={item.thumbnail}
            alt={item.title}
            loading='lazy'
            className='h-40 w-full object-cover'
          />
        </div>
      ) : null}

      <div className='mb-2 flex items-center justify-between gap-2'>
        <span className='inline-flex items-center gap-1 rounded-md border border-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-[#9ca3af]'>
          {icon}
          {TAB_LABEL[item.kind]}
        </span>
        <span className='text-[11px] text-[#9ca3af]'>{formatDate(item.publishedAt)}</span>
      </div>

      <h4 className='line-clamp-2 text-sm font-bold text-white md:text-base'>{item.title}</h4>
      <p className='mt-2 line-clamp-2 text-sm text-[#9ca3af]'>{item.description}</p>
      <p className='mt-2 text-[11px] text-[#9ca3af]'>
        {item.channel ? `${item.source} · ${item.channel}` : item.source}
      </p>

      <a
        href={item.url}
        target='_blank'
        rel='noreferrer'
        className='mt-4 inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white transition hover:border-[#C6FF2E] hover:text-[#C6FF2E]'
      >
        {item.ctaLabel}
        <ExternalLink className='h-3.5 w-3.5' />
      </a>
    </article>
  );
}

export function RadarIaSection() {
  const [draftQuery, setDraftQuery] = useState('agentes de IA');
  const [submittedQuery, setSubmittedQuery] = useState('agentes de IA');
  const [activeTab, setActiveTab] = useState<RadarType>('all');
  const [activeRange, setActiveRange] = useState<RadarRange>('7d');
  const [payload, setPayload] = useState<RadarResponsePayload | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);

  const debouncedDraft = useDebouncedValue(draftQuery, 500);

  const submitQuery = useCallback((value: string) => {
    const sanitized = sanitizeClientQuery(value);
    if (!sanitized) {
      return;
    }
    setSubmittedQuery(sanitized);
  }, []);

  useEffect(() => {
    const sanitized = sanitizeClientQuery(debouncedDraft);
    if (sanitized.length >= 3 && sanitized !== submittedQuery) {
      setSubmittedQuery(sanitized);
    }
  }, [debouncedDraft, submittedQuery]);

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE);
  }, [activeTab, submittedQuery, activeRange]);

  useEffect(() => {
    if (!submittedQuery) {
      return;
    }

    const controller = new AbortController();
    const params = new URLSearchParams({
      query: submittedQuery,
      type: activeTab,
      range: activeRange,
    });

    const load = async () => {
      setIsLoading(true);
      setErrorMessage('');
      try {
        const response = await fetch(`/api/radar-ia?${params.toString()}`, {
          method: 'GET',
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error('radar_fetch_failed');
        }
        const data = (await response.json()) as RadarResponsePayload;
        setPayload(data);
      } catch (error) {
        if (!controller.signal.aborted) {
          setErrorMessage('Não foi possível atualizar o Radar IA agora.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    void load();
    return () => controller.abort();
  }, [submittedQuery, activeTab, activeRange]);

  const activeItems = useMemo(() => {
    if (!payload) {
      return [] as RadarItem[];
    }
    if (activeTab === 'all') {
      return payload.all;
    }
    return payload.results[activeTab];
  }, [payload, activeTab]);

  const displayedItems = useMemo(
    () => activeItems.slice(0, visibleCount),
    [activeItems, visibleCount]
  );

  return (
    <article id='radar-ia' className='space-y-4'>
      <header className='rounded-xl border border-white/10 bg-[#0b0b0f] p-5 md:p-6'>
        <div className='mb-4 inline-flex flex-wrap gap-2 rounded-xl border border-white/10 bg-black/20 p-2'>
          <span className='inline-flex items-center gap-1 rounded-md border border-white/10 px-2 py-1 text-[11px] text-[#9ca3af]'>
            <Code2 className='h-3.5 w-3.5 text-[#C6FF2E]' />
            Software
          </span>
          <span className='inline-flex items-center gap-1 rounded-md border border-white/10 px-2 py-1 text-[11px] text-[#9ca3af]'>
            <Megaphone className='h-3.5 w-3.5 text-[#C6FF2E]' />
            Marketing
          </span>
          <span className='inline-flex items-center gap-1 rounded-md border border-white/10 px-2 py-1 text-[11px] text-[#9ca3af]'>
            <Bot className='h-3.5 w-3.5 text-[#C6FF2E]' />
            Agência IA
          </span>
        </div>

        <p className='text-xs uppercase tracking-[0.18em] text-[#9ca3af]'>Inteligência de mercado</p>
        <h3 className='mt-2 text-2xl font-bold text-white md:text-3xl'>Radar IA em tempo real</h3>
        <p className='mt-2 text-sm text-[#9ca3af]'>
          Pesquise um tema e veja vídeos + notícias + fontes confiáveis.
        </p>

        <div className='mt-4 flex flex-col gap-3 md:flex-row'>
          <div className='relative w-full'>
            <Search className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]' />
            <input
              value={draftQuery}
              maxLength={MAX_QUERY_LENGTH}
              onChange={(event) => setDraftQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  submitQuery(draftQuery);
                }
              }}
              placeholder='Ex: agentes de IA para atendimento'
              className='w-full rounded-md border border-white/10 bg-[#060608] py-2 pl-10 pr-3 text-sm text-white outline-none transition placeholder:text-[#6b7280] focus:border-[#C6FF2E]'
            />
          </div>
          <button
            type='button'
            onClick={() => submitQuery(draftQuery)}
            className='rounded-md border border-[#C6FF2E]/40 bg-[#C6FF2E]/10 px-4 py-2 text-sm font-semibold text-[#C6FF2E] transition hover:shadow-[0_0_18px_rgba(198,255,46,0.15)]'
          >
            Pesquisar
          </button>
        </div>

        <div className='mt-3 flex flex-wrap gap-2'>
          {QUICK_CHIPS.map((chip) => (
            <button
              key={chip}
              type='button'
              onClick={() => {
                setDraftQuery(chip);
                submitQuery(chip);
              }}
              className='rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-[#9ca3af] transition hover:border-[#C6FF2E] hover:text-[#C6FF2E]'
            >
              {chip}
            </button>
          ))}
        </div>
      </header>

      <section className='rounded-xl border border-white/10 bg-[#0b0b0f] p-4 md:p-5'>
        <div className='mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
          <div className='flex flex-wrap gap-2'>
            {RADAR_TYPES.map((tab) => (
              <button
                key={tab}
                type='button'
                onClick={() => setActiveTab(tab)}
                className={`rounded-md border px-3 py-1.5 text-xs font-semibold transition ${
                  activeTab === tab
                    ? 'border-[#C6FF2E] bg-[#C6FF2E]/10 text-[#C6FF2E]'
                    : 'border-white/10 bg-white/5 text-[#9ca3af] hover:border-[#C6FF2E] hover:text-[#C6FF2E]'
                }`}
              >
                {TAB_LABEL[tab]}
              </button>
            ))}
          </div>

          <div className='flex flex-wrap gap-2'>
            {RADAR_RANGES.map((range) => (
              <button
                key={range}
                type='button'
                onClick={() => setActiveRange(range)}
                className={`rounded-md border px-2.5 py-1 text-xs transition ${
                  activeRange === range
                    ? 'border-[#C6FF2E] bg-[#C6FF2E]/10 text-[#C6FF2E]'
                    : 'border-white/10 bg-white/5 text-[#9ca3af] hover:border-[#C6FF2E] hover:text-[#C6FF2E]'
                }`}
              >
                {RANGE_LABEL[range]}
              </button>
            ))}
          </div>
        </div>

        {errorMessage ? <p className='mb-3 text-sm text-[#fda4af]'>{errorMessage}</p> : null}

        {isLoading ? (
          <div className='grid gap-3 md:grid-cols-2 xl:grid-cols-3'>
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonCard key={`skeleton-${index}`} />
            ))}
          </div>
        ) : displayedItems.length === 0 ? (
          <div className='rounded-lg border border-dashed border-white/10 bg-black/20 p-6 text-center'>
            <p className='text-sm text-[#9ca3af]'>
              Nenhum resultado encontrado para <span className='text-white'>{submittedQuery}</span>.
            </p>
          </div>
        ) : (
          <>
            <div className='grid gap-3 md:grid-cols-2 xl:grid-cols-3'>
              {displayedItems.map((item) => (
                <RadarCard key={item.id} item={item} />
              ))}
            </div>
            {activeItems.length > visibleCount ? (
              <div className='mt-4 flex justify-center'>
                <button
                  type='button'
                  onClick={() => setVisibleCount((prev) => prev + INITIAL_VISIBLE)}
                  className='rounded-md border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white transition hover:border-[#C6FF2E] hover:text-[#C6FF2E]'
                >
                  Carregar mais
                </button>
              </div>
            ) : null}
          </>
        )}
      </section>
    </article>
  );
}
