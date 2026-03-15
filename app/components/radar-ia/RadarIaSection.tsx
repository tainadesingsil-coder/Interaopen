'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  buildTwitchEmbedUrl,
  getTwitchParentHosts,
  rotateHosts,
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

const EMBED_TIMEOUT_MS = 6500;

const DEFAULT_STREAMS: TwitchStream[] = [
  { channel: 'gaules', title: 'Gaules (ao vivo)' },
  { channel: 'alanzoka', title: 'Alanzoka (ao vivo)' },
];

const DEFAULT_YOUTUBE: RadarLink[] = [
  { title: 'Canal OpenAI', url: 'https://www.youtube.com/@OpenAI' },
  { title: 'Google AI', url: 'https://www.youtube.com/@GoogleAI' },
];

const DEFAULT_TIKTOK: RadarLink[] = [
  { title: 'Tendências de IA no TikTok', url: 'https://www.tiktok.com/tag/ai' },
];

const DEFAULT_NEWS: RadarLink[] = [
  { title: 'OpenAI Newsroom', url: 'https://openai.com/news/' },
  { title: 'Google DeepMind', url: 'https://deepmind.google/discover/blog/' },
];

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

function isDev() {
  return process.env.NODE_ENV !== 'production';
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
  const [embedAttempt, setEmbedAttempt] = useState(0);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [showTwitchFallback, setShowTwitchFallback] = useState(false);

  const parentHosts = useMemo(() => getTwitchParentHosts(), []);
  const activeStream =
    streams[activeStreamIndex] ?? streams[0] ?? DEFAULT_STREAMS[0];

  const parentHostsForAttempt = useMemo(
    () => rotateHosts(parentHosts, embedAttempt),
    [parentHosts, embedAttempt]
  );

  const twitchEmbedUrl = useMemo(() => {
    if (!activeStream || !parentHostsForAttempt.length) return '';
    return buildTwitchEmbedUrl({
      channel: activeStream.channel,
      parentHosts: parentHostsForAttempt,
      autoplay: true,
      muted: true,
    });
  }, [activeStream, parentHostsForAttempt]);

  useEffect(() => {
    setIframeLoaded(false);
    if (!activeStream || !parentHostsForAttempt.length) {
      setShowTwitchFallback(true);
      return;
    }
    setShowTwitchFallback(false);
  }, [activeStream, parentHostsForAttempt]);

  useEffect(() => {
    if (!isDev()) return;
    // Diagnostic logs only in development.
    console.info('[Radar IA] Twitch parent hosts:', parentHostsForAttempt);
    console.info('[Radar IA] Twitch embed URL:', twitchEmbedUrl);
  }, [parentHostsForAttempt, twitchEmbedUrl]);

  useEffect(() => {
    if (activeTab !== 'twitch' || showTwitchFallback || iframeLoaded) return;
    const timer = window.setTimeout(() => {
      if (!iframeLoaded) {
        if (isDev()) {
          console.warn(
            '[Radar IA] Twitch iframe timeout. Switching to fallback.',
            {
              channel: activeStream?.channel,
              parents: parentHostsForAttempt,
            }
          );
        }
        setShowTwitchFallback(true);
      }
    }, EMBED_TIMEOUT_MS);

    return () => window.clearTimeout(timer);
  }, [
    activeTab,
    iframeLoaded,
    showTwitchFallback,
    activeStream?.channel,
    parentHostsForAttempt,
  ]);

  const handleOpenUrl = (url: string) => {
    emitRadarOpenUrl(url);
    onOpenUrl?.(url);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleTryAlternativePlayer = () => {
    setEmbedAttempt((prev) => prev + 1);
    setIframeLoaded(false);
    setShowTwitchFallback(false);
  };

  const handleIframeError = () => {
    if (isDev()) {
      console.error('[Radar IA] Twitch iframe error event fired.', {
        channel: activeStream?.channel,
        parents: parentHostsForAttempt,
      });
    }
    setShowTwitchFallback(true);
  };

  const handleIframeLoad = () => {
    setIframeLoaded(true);
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
            TikTok
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
                  setEmbedAttempt(0);
                  setShowTwitchFallback(false);
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

          {!parentHostsForAttempt.length || showTwitchFallback ? (
            <div className='rounded-xl border border-violet-300/30 bg-violet-950/30 p-4 text-sm text-violet-100'>
              <p className='mb-3'>
                Não foi possível carregar a live da Twitch neste embed. Isso pode acontecer
                quando o domínio atual não está permitido no parâmetro <code>parent</code>.
              </p>
              <div className='flex flex-wrap gap-2'>
                <button
                  type='button'
                  onClick={handleTryAlternativePlayer}
                  className='rounded-md border border-violet-300/40 bg-violet-500/20 px-3 py-2 text-sm font-medium'
                >
                  Tentar player alternativo
                </button>
                <button
                  type='button'
                  onClick={() =>
                    handleOpenUrl(`https://www.twitch.tv/${activeStream.channel}`)
                  }
                  className='rounded-md border border-white/30 bg-white/10 px-3 py-2 text-sm font-medium'
                >
                  Abrir canal na Twitch
                </button>
              </div>
            </div>
          ) : (
            <div className='overflow-hidden rounded-xl border border-white/15'>
              <iframe
                key={`${activeStream.channel}-${embedAttempt}`}
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
            <button
              key={item.url}
              type='button'
              onClick={() => handleOpenUrl(item.url)}
              className='block w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-white/90 transition hover:border-white/20 hover:bg-white/10'
            >
              {item.title}
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export default RadarIaSection;
