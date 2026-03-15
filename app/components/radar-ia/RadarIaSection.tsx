'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  buildTwitchEmbedVariants,
  getTwitchParentHosts,
} from '@/app/lib/twitchEmbed';

type RadarLink = {
  title: string;
  url: string;
};

type TwitchStream = {
  channel: string;
  title: string;
};

type RadarIaSectionProps = {
  streams?: TwitchStream[];
  youtubeLinks?: RadarLink[];
  tiktokLinks?: RadarLink[];
  newsLinks?: RadarLink[];
  onOpenUrl?: (url: string) => void;
  className?: string;
};

type RadarTab = 'twitch' | 'youtube' | 'tiktok' | 'news';

const EMBED_TIMEOUT_MS = 7000;

const DEFAULT_STREAMS: TwitchStream[] = [
  { channel: 'gaules', title: 'Gaules (ao vivo)' },
  { channel: 'alanzoka', title: 'Alanzoka (ao vivo)' },
];

const DEFAULT_YOUTUBE: RadarLink[] = [
  { title: 'Canal OpenAI', url: 'https://www.youtube.com/@OpenAI' },
  { title: 'Google AI', url: 'https://www.youtube.com/@GoogleAI' },
];

const DEFAULT_TIKTOK: RadarLink[] = [
  {
    title: 'Instagram Codexion',
    url: 'https://www.instagram.com/codexionai?igsh=MXJyeXhlbmF0dDluOA==',
  },
];

const DEFAULT_NEWS: RadarLink[] = [
  { title: 'OpenAI Newsroom', url: 'https://openai.com/news/' },
  { title: 'Google DeepMind', url: 'https://deepmind.google/discover/blog/' },
];

function inferPlatformFromUrl(url: string, fallback: RadarTab): string {
  const lower = String(url || '').toLowerCase();
  if (lower.includes('instagram.com')) return 'instagram';
  if (lower.includes('tiktok.com')) return 'tiktok';
  if (lower.includes('youtube.com') || lower.includes('youtu.be')) return 'youtube';
  if (fallback === 'news') return 'news';
  return fallback;
}

function normalizeRadarItemTitle(item: RadarLink, tab: RadarTab): string {
  const rawTitle = String(item?.title || '').trim();
  const url = String(item?.url || '');
  const lowerUrl = url.toLowerCase();
  const lowerTitle = rawTitle.toLowerCase();

  if (tab === 'tiktok' && lowerUrl.includes('instagram.com')) {
    if (!rawTitle || lowerTitle.includes('tiktok')) return 'Instagram Codexion';
    return rawTitle;
  }

  if (tab === 'news') {
    if (lowerUrl.includes('openai.com/news')) return rawTitle || 'OpenAI Newsroom';
    if (lowerUrl.includes('deepmind.google')) return rawTitle || 'Google DeepMind';
    if (!rawTitle) return 'Notícia de IA';
  }

  return rawTitle || 'Conteúdo Radar IA';
}

function emitRadarOpenUrl(url: string) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent('radar:open-url', {
      detail: {
        url,
        source: 'radar-ia',
      },
    })
  );
}

function emitRadarTrack(payload: {
  tipo: string;
  titulo: string;
  categoria: string;
  url: string;
  platform?: string;
}) {
  if (typeof window === 'undefined') return;
  try {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(
        {
          source: 'codexion-radar',
          ...payload,
        },
        '*'
      );
    }
  } catch {
    // no-op
  }
}

function isDev() {
  return process.env.NODE_ENV !== 'production';
}

function isLikelyMobileOrWebView() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }

  const ua = navigator.userAgent || '';
  const isMobileUa = /Android|iPhone|iPad|iPod|Mobile/i.test(ua);
  const isTouch =
    window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

  const androidWebView =
    /Android/i.test(ua) &&
    (/\bwv\b/i.test(ua) ||
      (/Version\/[\d.]+/i.test(ua) && /Chrome\/[\d.]+/i.test(ua)));

  const iosWebView =
    /(iPhone|iPad|iPod)/i.test(ua) &&
    /AppleWebKit/i.test(ua) &&
    !/Safari/i.test(ua);

  const genericWebViewSignals =
    /; wv\)|\bwv\b|FBAN|FBAV|Instagram|Line\/|MiuiBrowser|Electron|Crosswalk/i.test(
      ua
    );

  return isStandalone || androidWebView || iosWebView || genericWebViewSignals || (isMobileUa && isTouch);
}

function isInvalidIframeDocumentUrl(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return false;
  return (
    normalized.startsWith('about:blank') ||
    normalized.startsWith('about:srcdoc') ||
    normalized.startsWith('chrome-error://') ||
    normalized.startsWith('edge-error://') ||
    normalized.startsWith('data:text/html')
  );
}

export function RadarIaSection({
  streams = DEFAULT_STREAMS,
  youtubeLinks = DEFAULT_YOUTUBE,
  tiktokLinks = DEFAULT_TIKTOK,
  newsLinks = DEFAULT_NEWS,
  onOpenUrl,
  className = '',
}: RadarIaSectionProps) {
  const [activeTab, setActiveTab] = useState<RadarTab>('twitch');
  const [activeStreamIndex, setActiveStreamIndex] = useState(0);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [showTwitchFallback, setShowTwitchFallback] = useState(false);
  const [embedVariantIndex, setEmbedVariantIndex] = useState(0);
  const [copyFeedback, setCopyFeedback] = useState('');
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const isMobileOrWebView = useMemo(() => isLikelyMobileOrWebView(), []);

  const parentHosts = useMemo(() => getTwitchParentHosts(), []);
  const activeStream =
    streams[activeStreamIndex] ?? streams[0] ?? DEFAULT_STREAMS[0];

  const twitchEmbedVariants = useMemo(
    () =>
      activeStream
        ? buildTwitchEmbedVariants({
            channel: activeStream.channel,
            parentHosts,
            autoplay: !isMobileOrWebView,
            muted: true,
          })
        : [],
    [activeStream, parentHosts, isMobileOrWebView]
  );

  const activeVariant = twitchEmbedVariants[embedVariantIndex] ?? null;
  const twitchEmbedUrl = activeVariant?.url ?? '';
  const twitchChannelUrl = activeStream
    ? `https://www.twitch.tv/${activeStream.channel}`
    : 'https://www.twitch.tv/';

  const moveToNextVariant = useCallback(
    (reason: string) => {
      if (isDev()) {
        console.warn('[Radar IA] Twitch variante falhou, tentando próxima...', {
          reason,
          currentVariantIndex: embedVariantIndex,
          totalVariants: twitchEmbedVariants.length,
          channel: activeStream?.channel,
        });
      }

      setIframeLoaded(false);
      setCopyFeedback('');

      if (embedVariantIndex + 1 < twitchEmbedVariants.length) {
        setEmbedVariantIndex((prev) => prev + 1);
        return;
      }

      setShowTwitchFallback(true);
    },
    [activeStream?.channel, embedVariantIndex, twitchEmbedVariants.length]
  );

  useEffect(() => {
    setIframeLoaded(false);
    setShowTwitchFallback(false);
    setEmbedVariantIndex(0);
    setCopyFeedback('');

    if (!activeStream || !twitchEmbedVariants.length) {
      setShowTwitchFallback(true);
      return;
    }
  }, [activeStream, twitchEmbedVariants.length]);

  useEffect(() => {
    if (!isDev()) return;
    // Diagnostic logs only in development.
    console.info('[Radar IA] Twitch parent hosts:', parentHosts);
    console.info('[Radar IA] Twitch embed URL:', twitchEmbedUrl);
  }, [parentHosts, twitchEmbedUrl]);

  useEffect(() => {
    if (activeTab !== 'twitch' || showTwitchFallback || iframeLoaded) return;
    const timer = window.setTimeout(() => {
      if (!iframeLoaded) {
        moveToNextVariant('watchdog_timeout');
      }
    }, EMBED_TIMEOUT_MS);

    return () => window.clearTimeout(timer);
  }, [
    activeTab,
    iframeLoaded,
    showTwitchFallback,
    moveToNextVariant,
  ]);

  const handleOpenUrl = (
    url: string,
    title?: string,
    categoria?: string,
    platform?: string
  ) => {
    emitRadarTrack({
      tipo: 'abriu_conteudo',
      titulo: title || 'Abriu conteúdo no Radar IA',
      categoria: categoria || 'conteudo_exclusivo',
      url,
      platform,
    });
    emitRadarOpenUrl(url);
    onOpenUrl?.(url);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCopyTwitchLink = async () => {
    try {
      await navigator.clipboard.writeText(twitchChannelUrl);
      setCopyFeedback('Link copiado.');
    } catch {
      setCopyFeedback('Não foi possível copiar agora.');
    }
  };

  const handleIframeError = () => {
    if (isDev()) {
      console.error('[Radar IA] Twitch iframe error event fired.', {
        channel: activeStream?.channel,
        variant: activeVariant,
      });
    }
    moveToNextVariant('iframe_error');
  };

  const handleIframeLoad = () => {
    const frame = iframeRef.current;
    if (!frame) {
      moveToNextVariant('missing_iframe_ref');
      return;
    }

    const srcFromAttribute = frame.getAttribute('src') ?? '';
    if (isInvalidIframeDocumentUrl(srcFromAttribute)) {
      moveToNextVariant('invalid_src_attribute');
      return;
    }

    // onLoad alone is not enough; validate if browser redirected iframe to a local error page.
    try {
      const currentHref = frame.contentWindow?.location?.href ?? '';
      if (isInvalidIframeDocumentUrl(currentHref)) {
        moveToNextVariant('invalid_current_href');
        return;
      }
    } catch {
      // Cross-origin access is expected on success.
    }

    setIframeLoaded(true);
    if (activeStream) {
      emitRadarTrack({
        tipo: 'live_play',
        titulo: activeStream.title || `Live Twitch: ${activeStream.channel}`,
        categoria: 'live',
        url: twitchChannelUrl,
        platform: 'twitch',
      });
    }
  };

  return (
    <section className={`rounded-2xl border border-white/10 bg-black/20 p-6 ${className}`}>
      <div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
        <h2 className='text-xl font-semibold text-white'>Radar IA</h2>
        <div className='flex flex-wrap gap-2'>
          <button
            type='button'
            onClick={() => setActiveTab('twitch')}
            className={`rounded-md px-3 py-1.5 text-sm ${
              activeTab === 'twitch'
                ? 'bg-violet-500/30 text-violet-100'
                : 'bg-white/10 text-white/80'
            }`}
          >
            Lives
          </button>
          <button
            type='button'
            onClick={() => setActiveTab('youtube')}
            className={`rounded-md px-3 py-1.5 text-sm ${
              activeTab === 'youtube'
                ? 'bg-violet-500/30 text-violet-100'
                : 'bg-white/10 text-white/80'
            }`}
          >
            YouTube
          </button>
          <button
            type='button'
            onClick={() => setActiveTab('tiktok')}
            className={`rounded-md px-3 py-1.5 text-sm ${
              activeTab === 'tiktok'
                ? 'bg-violet-500/30 text-violet-100'
                : 'bg-white/10 text-white/80'
            }`}
          >
            Instagram
          </button>
          <button
            type='button'
            onClick={() => setActiveTab('news')}
            className={`rounded-md px-3 py-1.5 text-sm ${
              activeTab === 'news'
                ? 'bg-violet-500/30 text-violet-100'
                : 'bg-white/10 text-white/80'
            }`}
          >
            Notícias
          </button>
        </div>
      </div>

      {activeTab === 'twitch' ? (
        <div className='space-y-4'>
          <div className='flex flex-wrap gap-2'>
            {streams.map((stream, index) => (
              <button
                key={`${stream.channel}-${index}`}
                type='button'
                onClick={() => {
                  setActiveStreamIndex(index);
                  setEmbedVariantIndex(0);
                  setIframeLoaded(false);
                  setShowTwitchFallback(false);
                  setCopyFeedback('');
                }}
                className={`rounded-md px-3 py-2 text-sm ${
                  index === activeStreamIndex
                    ? 'bg-violet-500/30 text-violet-100'
                    : 'bg-white/10 text-white/80'
                }`}
              >
                {stream.title}
              </button>
            ))}
          </div>

          {!twitchEmbedVariants.length || showTwitchFallback ? (
            <div className='rounded-xl border border-violet-300/30 bg-violet-950/30 p-4 text-sm text-violet-100'>
              <p className='mb-3'>
                Não foi possível abrir esta live no player interno neste ambiente.
              </p>
              <div className='flex flex-wrap gap-2'>
                <button
                  type='button'
                  onClick={() =>
                    handleOpenUrl(
                      twitchChannelUrl,
                      activeStream?.title || `Live Twitch: ${activeStream?.channel || ''}`,
                      'live',
                      'twitch'
                    )
                  }
                  className='rounded-md border border-violet-300/40 bg-violet-500/20 px-3 py-2 text-sm font-medium'
                >
                  Abrir na Twitch
                </button>
                <button
                  type='button'
                  onClick={handleCopyTwitchLink}
                  className='rounded-md border border-white/30 bg-white/10 px-3 py-2 text-sm font-medium'
                >
                  Copiar link da live
                </button>
              </div>
              {copyFeedback ? (
                <p className='mt-2 text-xs text-violet-200/90'>{copyFeedback}</p>
              ) : null}
            </div>
          ) : (
            <div className='overflow-hidden rounded-xl border border-white/15'>
              <iframe
                key={`${activeStream.channel}-${embedVariantIndex}`}
                ref={iframeRef}
                src={twitchEmbedUrl}
                title={`Live Twitch - ${activeStream.title}`}
                allow='autoplay; fullscreen'
                allowFullScreen
                loading='lazy'
                className='aspect-video w-full border-0 bg-black'
                onError={handleIframeError}
                onLoad={handleIframeLoad}
              />
            </div>
          )}
        </div>
      ) : null}

      {activeTab !== 'twitch' ? (
        <div className='space-y-2'>
          {(activeTab === 'youtube'
            ? youtubeLinks
            : activeTab === 'tiktok'
              ? tiktokLinks
              : newsLinks
          ).map((item) => (
            (() => {
              const displayTitle = normalizeRadarItemTitle(item, activeTab);
              const platform = inferPlatformFromUrl(item.url, activeTab);
              const platformLabel =
                platform === 'instagram'
                  ? 'Instagram'
                  : platform === 'news'
                    ? 'Notícia'
                    : platform === 'youtube'
                      ? 'YouTube'
                      : platform === 'tiktok'
                        ? 'TikTok'
                        : 'Radar';
              return (
            <button
              key={item.url}
              type='button'
              onClick={() =>
                handleOpenUrl(
                  item.url,
                  displayTitle,
                  activeTab === 'news'
                    ? 'noticia'
                    : activeTab === 'youtube' || activeTab === 'tiktok'
                      ? 'video'
                      : 'conteudo_exclusivo',
                  platform
                )
              }
              className='flex w-full items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-white/90 transition hover:border-white/20 hover:bg-white/10'
            >
              <span className='flex-1 leading-relaxed'>{displayTitle}</span>
              <span className='rounded-full border border-white/20 bg-white/5 px-2 py-0.5 text-[11px] uppercase tracking-wide text-white/65'>
                {platformLabel}
              </span>
            </button>
              );
            })()
          ))}
        </div>
      ) : null}
    </section>
  );
}

export default RadarIaSection;
