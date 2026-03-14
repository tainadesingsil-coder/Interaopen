'use client';

import {
  RADAR_RANGES,
  RADAR_TYPES,
  type RadarItem,
  type RadarRange,
  type RadarResponsePayload,
  type RadarType,
} from '@/app/lib/radar-ia/types';
import { Bot, Code2, ExternalLink, Megaphone, Newspaper, PlayCircle, Search, X } from 'lucide-react';
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
const INITIAL_VISIBLE = 10;

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

const extractYoutubeId = (url: string) => {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('youtu.be')) {
      return parsed.pathname.replace('/', '').trim();
    }
    return parsed.searchParams.get('v') || '';
  } catch {
    return '';
  }
};

const extractInstagramCode = (url: string) => {
  const match = url.match(/\/p\/([a-zA-Z0-9_-]+)/);
  return match?.[1] || '';
};

function SkeletonCard() {
  return (
    <div className='animate-pulse rounded-[18px] border border-white/10 bg-[#0b0b0f] p-4 shadow-[0_10px_24px_rgba(0,0,0,0.2)] sm:rounded-2xl md:p-5'>
      <div className='h-44 w-full rounded-xl border border-white/10 bg-white/[0.04] sm:h-40' />
      <div className='mt-4 h-4 w-2/3 rounded bg-white/[0.08]' />
      <div className='mt-3 h-3 w-full rounded bg-white/[0.08]' />
      <div className='mt-2 h-3 w-5/6 rounded bg-white/[0.08]' />
      <div className='mt-5 h-9 w-32 rounded-lg border border-white/10 bg-white/[0.05]' />
    </div>
  );
}

function RadarCard({ item, onOpen }: { item: RadarItem; onOpen: (item: RadarItem) => void }) {
  const icon =
    item.kind === 'youtube' ? (
      <PlayCircle className='h-4 w-4 text-[#C6FF2E]' />
    ) : item.kind === 'news' ? (
      <Newspaper className='h-4 w-4 text-[#C6FF2E]' />
    ) : (
      <Bot className='h-4 w-4 text-[#C6FF2E]' />
    );

  return (
    <article className='group flex h-full flex-col rounded-[18px] border border-white/10 bg-[linear-gradient(180deg,rgba(11,11,15,1)_0%,rgba(7,7,10,1)_100%)] p-4 shadow-[0_8px_22px_rgba(0,0,0,0.24)] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:scale-[1.01] hover:border-[#C6FF2E]/60 hover:shadow-[0_0_0_1px_rgba(198,255,46,0.16),0_14px_34px_rgba(198,255,46,0.08)] sm:rounded-2xl md:p-5'>
      {item.thumbnail ? (
        <div className='mb-4 overflow-hidden rounded-xl border border-white/10 bg-black/20'>
          <img
            src={item.thumbnail}
            alt={item.title}
            loading='lazy'
            className='h-44 w-full object-cover transition-transform duration-200 ease-out group-hover:scale-[1.02] sm:h-40'
          />
        </div>
      ) : null}

      <div className='mb-3 flex items-center justify-between gap-2'>
        <span className='inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-[#9ca3af]'>
          {icon}
          {TAB_LABEL[item.kind]}
        </span>
        <span className='text-[11px] tracking-wide text-[#9ca3af]'>{formatDate(item.publishedAt)}</span>
      </div>

      <h4 className='line-clamp-2 text-[15px] font-semibold leading-snug text-white md:text-base'>{item.title}</h4>
      <p className='mt-2 line-clamp-3 text-sm leading-relaxed text-[#9ca3af]'>{item.description}</p>
      <p className='mt-3 text-[11px] leading-relaxed text-[#9ca3af]'>
        {item.channel ? `${item.source} · ${item.channel}` : item.source}
      </p>

      <button
        type='button'
        onClick={() => onOpen(item)}
        className='mt-5 inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-xs font-semibold text-white transition-all duration-200 ease-out hover:border-[#C6FF2E]/60 hover:text-[#C6FF2E] hover:shadow-[0_0_0_1px_rgba(198,255,46,0.14)] sm:w-fit'
      >
        Ver no Radar
        <ExternalLink className='h-3.5 w-3.5' />
      </button>
    </article>
  );
}

function RadarViewer({ item, onClose }: { item: RadarItem; onClose: () => void }) {
  const youtubeId = item.kind === 'youtube' ? extractYoutubeId(item.url) : '';
  const instagramCode = item.kind === 'instagram' ? extractInstagramCode(item.url) : '';
  const readerUrl = `/api/radar-reader?url=${encodeURIComponent(item.url)}`;

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleEsc);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  return (
    <div className='fixed inset-0 z-50 bg-black/80 p-3 backdrop-blur-[2px] sm:p-5'>
      <div className='mx-auto flex h-full w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#060608]'>
        <header className='flex items-start justify-between gap-3 border-b border-white/10 p-4'>
          <div>
            <p className='text-[11px] uppercase tracking-[0.14em] text-[#9ca3af]'>
              {item.kind === 'youtube' ? 'YouTube' : item.kind === 'news' ? 'Notícia' : 'Instagram'}
            </p>
            <h4 className='mt-1 line-clamp-2 text-sm font-semibold text-white sm:text-base'>{item.title}</h4>
          </div>
          <button
            type='button'
            onClick={onClose}
            className='inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-[#9ca3af] transition hover:border-[#C6FF2E]/50 hover:text-[#C6FF2E]'
            aria-label='Fechar visualizador'
          >
            <X className='h-4 w-4' />
          </button>
        </header>

        <div className='min-h-0 flex-1 p-3 sm:p-4'>
          {item.kind === 'youtube' && youtubeId ? (
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`}
              title={item.title}
              allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
              allowFullScreen
              className='h-full min-h-[280px] w-full rounded-xl border border-white/10 bg-black sm:min-h-[420px]'
            />
          ) : item.kind === 'news' ? (
            <iframe
              src={readerUrl}
              title={`Leitura interna - ${item.title}`}
              className='h-full min-h-[320px] w-full rounded-xl border border-white/10 bg-[#0b0b0f] sm:min-h-[460px]'
            />
          ) : (
            <div className='flex h-full min-h-[320px] flex-col gap-4 overflow-auto rounded-xl border border-white/10 bg-[#0b0b0f] p-4 sm:min-h-[460px] sm:p-5'>
              <img
                src={
                  instagramCode
                    ? `/api/instagram-image?code=${instagramCode}`
                    : item.thumbnail || '/api/instagram-image?code=DV1OIoxDvbV'
                }
                alt={item.title}
                className='w-full rounded-xl border border-white/10 object-cover'
              />
              <p className='text-sm leading-relaxed text-[#c9d1d9]'>{item.description}</p>
            </div>
          )}
        </div>

        <footer className='flex items-center justify-end border-t border-white/10 p-3 sm:p-4'>
          <a
            href={item.url}
            target='_blank'
            rel='noreferrer'
            className='inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-semibold text-white transition hover:border-[#C6FF2E]/60 hover:text-[#C6FF2E]'
          >
            Abrir fonte original
            <ExternalLink className='h-3.5 w-3.5' />
          </a>
        </footer>
      </div>
    </div>
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
  const [viewerItem, setViewerItem] = useState<RadarItem | null>(null);

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
    setViewerItem(null);
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
    <article id='radar-ia' className='space-y-4 sm:space-y-5'>
      <header className='rounded-[20px] border border-white/10 bg-[#0b0b0f] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.2)] sm:rounded-2xl sm:p-5 md:p-6'>
        <div className='-mx-1 mb-4 overflow-x-auto px-1 pb-1 sm:mx-0 sm:overflow-visible sm:px-0 sm:pb-0'>
          <div className='inline-flex min-w-max gap-2 rounded-xl border border-white/10 bg-[#060608]/70 p-2'>
          <span className='inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] text-[#9ca3af]'>
            <Code2 className='h-3.5 w-3.5 text-[#C6FF2E]' />
            Software
          </span>
          <span className='inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] text-[#9ca3af]'>
            <Megaphone className='h-3.5 w-3.5 text-[#C6FF2E]' />
            Marketing
          </span>
          <span className='inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] text-[#9ca3af]'>
            <Bot className='h-3.5 w-3.5 text-[#C6FF2E]' />
            Agência IA
          </span>
          </div>
        </div>

        <p className='text-xs uppercase tracking-[0.18em] text-[#9ca3af]'>Acesso exclusivo</p>
        <h3 className='mt-2 text-xl font-extrabold leading-tight text-white sm:text-2xl md:text-3xl'>Radar IA em tempo real</h3>
        <p className='mt-2.5 max-w-2xl text-sm leading-relaxed text-[#9ca3af]'>
          Pesquise um tema e veja vídeos + notícias + fontes confiáveis.
        </p>

        <div className='mt-4 flex flex-col gap-2.5 sm:mt-5 sm:flex-row sm:items-center'>
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
              className='h-12 w-full rounded-xl border border-white/10 bg-[#060608] py-2 pl-10 pr-3 text-sm text-white outline-none transition-all duration-200 ease-out placeholder:text-[#6b7280] focus:border-[#C6FF2E]/80 focus:ring-2 focus:ring-[#C6FF2E]/15 sm:h-11'
            />
          </div>
          <button
            type='button'
            onClick={() => submitQuery(draftQuery)}
            className='h-12 w-full rounded-xl border border-[#C6FF2E]/40 bg-[#C6FF2E]/10 px-5 text-sm font-semibold text-[#C6FF2E] transition-all duration-200 ease-out hover:border-[#C6FF2E] hover:bg-[#C6FF2E]/14 hover:shadow-[0_0_18px_rgba(198,255,46,0.14)] active:scale-[0.99] sm:h-11 sm:w-auto'
          >
            Pesquisar
          </button>
        </div>

        <div className='-mx-1 mt-4 overflow-x-auto px-1 pb-1 sm:mx-0 sm:overflow-visible sm:px-0 sm:pb-0'>
          <div className='inline-flex min-w-max gap-2 sm:flex sm:min-w-0 sm:flex-wrap'>
            {QUICK_CHIPS.map((chip) => (
              <button
                key={chip}
                type='button'
                onClick={() => {
                  setDraftQuery(chip);
                  submitQuery(chip);
                }}
                className={`rounded-lg border px-3 py-1.5 text-xs transition-all duration-200 ease-out ${
                  sanitizeClientQuery(chip) === submittedQuery
                    ? 'border-[#C6FF2E]/55 bg-[#C6FF2E]/12 text-[#C6FF2E]'
                    : 'border-white/10 bg-white/[0.03] text-[#9ca3af] hover:border-[#C6FF2E]/45 hover:text-[#C6FF2E]'
                }`}
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      </header>

      <section className='rounded-[20px] border border-white/10 bg-[#0b0b0f] p-4 shadow-[0_10px_28px_rgba(0,0,0,0.2)] sm:rounded-2xl md:p-5'>
        <div className='mb-4 flex flex-col gap-3'>
          <div className='-mx-1 overflow-x-auto px-1 pb-1'>
            <div className='inline-flex min-w-max gap-2 rounded-xl border border-white/10 bg-[#060608]/80 p-1'>
              {RADAR_TYPES.map((tab) => (
                <button
                  key={tab}
                  type='button'
                  onClick={() => setActiveTab(tab)}
                  className={`shrink-0 whitespace-nowrap rounded-lg border px-3 py-2 text-xs font-semibold leading-none transition-all duration-200 ease-out ${
                    activeTab === tab
                      ? 'border-[#C6FF2E]/60 bg-[#C6FF2E]/12 text-[#C6FF2E] shadow-[0_0_0_1px_rgba(198,255,46,0.14)]'
                      : 'border-white/10 bg-white/[0.03] text-[#9ca3af] hover:border-[#C6FF2E]/45 hover:text-[#C6FF2E]'
                  }`}
                >
                  {TAB_LABEL[tab]}
                </button>
              ))}
            </div>
          </div>

          <div className='-mx-1 overflow-x-auto px-1 pb-1'>
            <div className='inline-flex min-w-max gap-2 rounded-xl border border-white/10 bg-[#060608]/80 p-1'>
              {RADAR_RANGES.map((range) => (
                <button
                  key={range}
                  type='button'
                  onClick={() => setActiveRange(range)}
                  className={`shrink-0 whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs leading-none transition-all duration-200 ease-out ${
                    activeRange === range
                      ? 'border-[#C6FF2E]/60 bg-[#C6FF2E]/12 text-[#C6FF2E] shadow-[0_0_0_1px_rgba(198,255,46,0.14)]'
                      : 'border-white/10 bg-white/[0.03] text-[#9ca3af] hover:border-[#C6FF2E]/45 hover:text-[#C6FF2E]'
                  }`}
                >
                  {RANGE_LABEL[range]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {errorMessage ? (
          <p className='mb-4 rounded-xl border border-[#fda4af]/30 bg-[#fda4af]/10 px-3 py-2 text-sm text-[#fecdd3]'>
            {errorMessage}
          </p>
        ) : null}

        {isLoading ? (
          <div className='grid gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3'>
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonCard key={`skeleton-${index}`} />
            ))}
          </div>
        ) : displayedItems.length === 0 ? (
          <div className='rounded-xl border border-dashed border-white/10 bg-black/20 p-6 text-center sm:p-7'>
            <p className='text-sm leading-relaxed text-[#9ca3af]'>
              Nenhum resultado encontrado para <span className='text-white'>{submittedQuery}</span>.
            </p>
          </div>
        ) : (
          <>
            <div className='grid gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3'>
              {displayedItems.map((item) => (
                <RadarCard key={item.id} item={item} onOpen={setViewerItem} />
              ))}
            </div>
            {activeItems.length > visibleCount ? (
              <div className='mt-5 flex justify-center'>
                <button
                  type='button'
                  onClick={() => setVisibleCount((prev) => prev + INITIAL_VISIBLE)}
                  className='rounded-xl border border-white/10 bg-white/[0.04] px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.08em] text-white transition-all duration-200 ease-out hover:border-[#C6FF2E]/50 hover:text-[#C6FF2E]'
                >
                  Carregar mais
                </button>
              </div>
            ) : null}
          </>
        )}
      </section>
      {viewerItem ? <RadarViewer item={viewerItem} onClose={() => setViewerItem(null)} /> : null}
    </article>
  );
}
