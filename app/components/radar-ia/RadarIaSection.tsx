'use client';

import {
  RADAR_RANGES,
  RADAR_TYPES,
  type RadarItem,
  type RadarRange,
  type RadarResponsePayload,
  type RadarType,
} from '@/app/lib/radar-ia/types';
import { Bot, Code2, ExternalLink, Megaphone, Mic2, Newspaper, PauseCircle, PlayCircle, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

const KIND_LABEL: Record<RadarType | 'podcast', string> = {
  all: 'Tudo',
  youtube: 'YouTube',
  news: 'Notícias',
  instagram: 'Instagram',
  podcast: 'Podcast',
};

const RANGE_LABEL: Record<RadarRange, string> = {
  '24h': '24h',
  '7d': '7d',
  '30d': '30d',
};

const INITIAL_VISIBLE = 10;
const LIVE_CAPTION_WORDS_PER_SECOND = 3.2;
const LIVE_CAPTION_MIN_SECONDS_PER_LINE = 1.2;
const LIVE_CAPTION_MAX_SECONDS_PER_LINE = 3.2;
const LIVE_TRANSCRIPTION_WATCHDOG_MS = 12000;

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

const DEFAULT_QUERY = 'agentes de IA';
const RADAR_REFRESH_MS = 90 * 1000;
const RADAR_ROTATION_MS = 26 * 1000;
const PODCAST_REFRESH_MS = 4 * 60 * 1000;

const rotateItems = <T,>(items: T[], steps: number) => {
  if (items.length <= 1) return items;
  const offset = ((steps % items.length) + items.length) % items.length;
  if (offset === 0) return items;
  return [...items.slice(offset), ...items.slice(0, offset)];
};

interface PodcastResponsePayload {
  generatedAt: string;
  items: RadarItem[];
  errors: Partial<Record<string, string>>;
}

const extractYoutubeId = (url: string, fallbackId = '') => {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('youtu.be')) {
      return parsed.pathname.replace('/', '').trim();
    }
    const queryId = parsed.searchParams.get('v');
    if (queryId) return queryId;
    const pathParts = parsed.pathname.split('/').filter(Boolean);
    if (pathParts[0] === 'shorts' && pathParts[1]) return pathParts[1];
    if (pathParts[0] === 'embed' && pathParts[1]) return pathParts[1];
    return fallbackId;
  } catch {
    return fallbackId;
  }
};

const extractInstagramCode = (url: string) => {
  const match = url.match(/\/(?:p|reel)\/([a-zA-Z0-9_-]+)/);
  return match?.[1] || '';
};

const extractInstagramKind = (url: string) => {
  if (url.includes('/reel/')) return 'reel';
  if (url.includes('/p/')) return 'post';
  return '';
};

const isTikTokUrl = (url: string) => /tiktok\.com/i.test(url);

const extractTikTokVideoId = (url: string) => {
  const normalized = String(url || '');
  const direct = normalized.match(/\/video\/(\d+)/i);
  if (direct?.[1]) return direct[1];
  try {
    const parsed = new URL(normalized);
    const fromParam = parsed.searchParams.get('item_id');
    if (fromParam) return fromParam;
  } catch {
    // Ignore URL parsing failure.
  }
  return '';
};

const buildTikTokEmbedUrls = (url: string) => {
  const videoId = extractTikTokVideoId(url);
  if (!videoId) return [] as string[];
  return [...new Set([`https://www.tiktok.com/player/v1/${videoId}`, `https://www.tiktok.com/embed/v2/${videoId}`])];
};

const isTwitchUrl = (url: string) => /twitch\.tv/i.test(url);
const isYouTubeUrl = (url: string) => /youtube\.com|youtu\.be/i.test(url);
const isCommunityUrl = (url: string) => /tabnews\.com\.br/i.test(url);

const extractTwitchChannelFromUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split('/').filter(Boolean);
    if (!parts[0] || parts[0] === 'directory') return '';
    return parts[0].toLowerCase();
  } catch {
    return '';
  }
};

const deriveTwitchParentHosts = () => {
  if (typeof window === 'undefined') return ['localhost'];
  const hostname = String(window.location.hostname || '').trim().toLowerCase();
  const hostNoPort = String(window.location.host || '')
    .trim()
    .toLowerCase()
    .split(':')[0];
  const base = [hostname, hostNoPort].filter(Boolean);
  const expanded = base.flatMap((host) => {
    if (host === 'localhost' || host === '127.0.0.1') return [host];
    if (!host.includes('.')) return [host];
    if (host.startsWith('www.')) return [host, host.slice(4)];
    return [host, `www.${host}`];
  });
  return [...new Set(expanded)].slice(0, 5);
};

const buildTwitchEmbedUrls = (channel: string, parents: string[]) => {
  if (!channel) return [] as string[];
  const parentList = parents.length > 0 ? parents : ['localhost'];
  return parentList.map(
    (parent) =>
      `https://player.twitch.tv/?channel=${encodeURIComponent(channel)}&parent=${encodeURIComponent(
        parent
      )}&autoplay=true&muted=true`
  );
};

const buildInstagramEmbedUrl = (code: string, kind: string) => {
  if (!code) return '';
  const base = kind === 'reel' ? `https://www.instagram.com/p/${code}/embed/captioned/` : `https://www.instagram.com/p/${code}/embed/captioned/`;
  return base;
};

const buildPodcastAudioProxyUrl = (url: string) => {
  if (!url) return '';
  return `/api/podcast-audio?url=${encodeURIComponent(url)}`;
};

const extractEngagement = (description: string) => {
  const match = description.match(/([\d.,]+[KMB]?)\s+likes?,\s+([\d.,]+[KMB]?)\s+comments?/i);
  if (!match) return null;
  return {
    likes: match[1],
    comments: match[2],
  };
};

const chunkWords = (text: string, maxCharsPerLine = 110, maxLines = 24) => {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxCharsPerLine && current) {
      lines.push(current.trim());
      current = word;
      if (lines.length >= maxLines) break;
    } else {
      current = next;
    }
  }

  if (current.trim() && lines.length < maxLines) {
    lines.push(current.trim());
  }

  return lines;
};

const buildCaptionLines = (value: string, maxLines = 22) => {
  if (!value) return [] as string[];
  const base = value.replace(/\s+/g, ' ').trim();
  if (!base) return [] as string[];

  const sentenceBlocks = base
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter((part) => part.length >= 10);

  const rawBlocks = sentenceBlocks.length > 0 ? sentenceBlocks : [base];
  const lines = rawBlocks
    .flatMap((line) => chunkWords(line, 110, 3))
    .map((line) => line.trim())
    .filter((line) => line.length >= 12)
    .slice(0, maxLines);

  if (lines.length >= 2) return lines;
  return chunkWords(base, 95, maxLines).filter((line) => line.length >= 12);
};

const wordsPerLine = (line: string) => line.trim().split(/\s+/).filter(Boolean).length;

const buildCaptionSchedule = (lines: string[]) => {
  if (lines.length === 0) return [] as Array<{ start: number; end: number }>;

  let cursor = 0;
  return lines.map((line) => {
    const words = Math.max(1, wordsPerLine(line));
    const duration = Math.min(
      LIVE_CAPTION_MAX_SECONDS_PER_LINE,
      Math.max(LIVE_CAPTION_MIN_SECONDS_PER_LINE, words / LIVE_CAPTION_WORDS_PER_SECOND)
    );
    const start = cursor;
    const end = cursor + duration;
    cursor = end;
    return { start, end };
  });
};

const normalizeCaptionText = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^\wÀ-ÿ\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const captionTokenSet = (value: string) =>
  new Set(
    normalizeCaptionText(value)
      .split(' ')
      .map((part) => part.trim())
      .filter((part) => part.length >= 3)
  );

const captionSimilarity = (a: string, b: string) => {
  const setA = captionTokenSet(a);
  const setB = captionTokenSet(b);
  if (setA.size === 0 || setB.size === 0) return 0;

  let intersection = 0;
  for (const token of setA) {
    if (setB.has(token)) intersection += 1;
  }
  const union = setA.size + setB.size - intersection;
  return union > 0 ? intersection / union : 0;
};

const hasEnoughNewWords = (previous: string, next: string, minNewWords = 3) => {
  const prev = captionTokenSet(previous);
  const nxt = captionTokenSet(next);
  let newWords = 0;
  for (const token of nxt) {
    if (!prev.has(token)) newWords += 1;
    if (newWords >= minNewWords) return true;
  }
  return false;
};

const blobToBase64 = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = String(reader.result || '');
      const base64 = result.split(',')[1] || '';
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('blob_to_base64_failed'));
    reader.readAsDataURL(blob);
  });

const pickRecorderMimeType = () => {
  if (typeof MediaRecorder === 'undefined' || typeof MediaRecorder.isTypeSupported !== 'function') {
    return '';
  }
  const candidates = ['audio/webm;codecs=opus', 'audio/ogg;codecs=opus', 'audio/webm', 'audio/ogg'];
  for (const candidate of candidates) {
    if (MediaRecorder.isTypeSupported(candidate)) {
      return candidate;
    }
  }
  return '';
};

const dedupeViewerItems = (items: RadarItem[]) => {
  const map = new Map<string, RadarItem>();
  items.forEach((item) => {
    if (!item?.id) return;
    if (!map.has(item.id)) map.set(item.id, item);
  });
  return [...map.values()];
};

const normalizeUrlForViewerMatch = (value: string) => {
  if (!value) return '';
  try {
    const parsed = new URL(value);
    parsed.hash = '';
    if (/tiktok\.com/i.test(parsed.hostname) || /twitch\.tv/i.test(parsed.hostname)) {
      return `${parsed.origin}${parsed.pathname}`.replace(/\/+$/, '').toLowerCase();
    }
    if (/youtube\.com|youtu\.be/i.test(parsed.hostname)) {
      const id =
        parsed.searchParams.get('v') ||
        parsed.pathname.split('/').filter(Boolean).pop() ||
        '';
      return id ? `youtube:${id}` : `${parsed.origin}${parsed.pathname}`.toLowerCase();
    }
    return `${parsed.origin}${parsed.pathname}`.replace(/\/+$/, '').toLowerCase();
  } catch {
    return value.trim().toLowerCase();
  }
};

const extractOpenUrlFromHash = (hashValue: string) => {
  if (!hashValue.startsWith('#radar-ia')) return '';
  const [, queryString = ''] = hashValue.split('?');
  if (!queryString) return '';
  const params = new URLSearchParams(queryString);
  return params.get('open') || '';
};

const extractOpenUrlFromLocation = () => {
  if (typeof window === 'undefined') return '';
  const searchParams = new URLSearchParams(window.location.search || '');
  const fromSearch = searchParams.get('open') || '';
  if (fromSearch) return fromSearch;
  return extractOpenUrlFromHash(window.location.hash || '');
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
    ) : item.kind === 'podcast' ? (
      <Mic2 className='h-4 w-4 text-[#C6FF2E]' />
    ) : (
      <Bot className='h-4 w-4 text-[#C6FF2E]' />
    );

  const isVisualSensitive = item.kind === 'instagram' || item.kind === 'podcast';

  return (
    <article className='group flex h-full flex-col rounded-[18px] border border-white/10 bg-[linear-gradient(180deg,rgba(11,11,15,1)_0%,rgba(7,7,10,1)_100%)] p-4 shadow-[0_8px_22px_rgba(0,0,0,0.24)] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:scale-[1.01] hover:border-[#C6FF2E]/60 hover:shadow-[0_0_0_1px_rgba(198,255,46,0.16),0_14px_34px_rgba(198,255,46,0.08)] sm:rounded-2xl md:p-5'>
      {item.thumbnail ? (
        <div className='mb-4 overflow-hidden rounded-xl border border-white/10 bg-black/20'>
          <img
            src={item.thumbnail}
            alt={item.title}
            loading='lazy'
            className={`w-full transition-transform duration-200 ease-out group-hover:scale-[1.02] ${
              isVisualSensitive ? 'h-48 object-contain bg-black/35 p-1.5 sm:h-44' : 'h-44 object-cover sm:h-40'
            }`}
          />
        </div>
      ) : null}

      <div className='mb-3 flex items-center justify-between gap-2'>
        <span className='inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-[#9ca3af]'>
          {icon}
          {KIND_LABEL[item.kind]}
        </span>
        <span className='text-[11px] tracking-wide text-[#9ca3af]'>{formatDate(item.publishedAt)}</span>
      </div>

      <h4 className='line-clamp-2 text-[15px] font-semibold leading-snug text-white md:text-base'>{item.title}</h4>
      <p className='mt-2 line-clamp-3 text-sm leading-relaxed text-[#9ca3af]'>{item.description}</p>
      <p className='mt-3 line-clamp-1 text-[11px] leading-relaxed text-[#9ca3af]'>
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

function RadarViewer({
  item,
  allItems,
  onClose,
  onSelectItem,
}: {
  item: RadarItem;
  allItems: RadarItem[];
  onClose: () => void;
  onSelectItem: (next: RadarItem) => void;
}) {
  const youtubeId =
    item.kind === 'youtube' ? extractYoutubeId(item.url, item.id.replace(/^yt-/, '').trim()) : '';
  const instagramCode = item.kind === 'instagram' ? extractInstagramCode(item.url) : '';
  const instagramKind = item.kind === 'instagram' ? extractInstagramKind(item.url) : '';
  const instagramEmbedUrl =
    item.kind === 'instagram' ? buildInstagramEmbedUrl(instagramCode, instagramKind) : '';
  const engagement = item.kind === 'instagram' ? extractEngagement(item.description) : null;
  const podcastAudioUrl =
    item.kind === 'podcast' ? buildPodcastAudioProxyUrl(item.audioUrl || item.url) : '';
  const isPodcastWithCoverPlay = item.kind === 'podcast';
  const podcastAudioRef = useRef<HTMLAudioElement | null>(null);
  const podcastRecorderRef = useRef<MediaRecorder | null>(null);
  const podcastRecorderStreamRef = useRef<MediaStream | null>(null);
  const podcastAudioContextRef = useRef<AudioContext | null>(null);
  const podcastAudioSourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const podcastAudioDestinationRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const isCaptionRequestInFlightRef = useRef(false);
  const isPodcastPlayingRef = useRef(false);
  const lastLiveCaptionRef = useRef('');
  const liveCaptionWatchdogRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isPodcastPlaying, setIsPodcastPlaying] = useState(false);
  const [captionLineIndex, setCaptionLineIndex] = useState(0);
  const [liveCaptionText, setLiveCaptionText] = useState('');
  const [liveCaptionError, setLiveCaptionError] = useState('');
  const [isSpeechCaptionActive, setIsSpeechCaptionActive] = useState(false);
  const expectsRealtimeSpeech =
    item.kind === 'podcast' && (item.translatedLanguage || '').toLowerCase().startsWith('en');
  const [useRealtimeCaptionMode, setUseRealtimeCaptionMode] = useState(expectsRealtimeSpeech);
  const captionLines = useMemo(
    () => (item.kind === 'podcast' ? buildCaptionLines(item.translatedDescription || '') : []),
    [item.kind, item.translatedDescription]
  );
  const captionSchedule = useMemo(() => buildCaptionSchedule(captionLines), [captionLines]);
  const captionCycleDuration = useMemo(
    () => (captionSchedule.length > 0 ? captionSchedule[captionSchedule.length - 1].end : 0),
    [captionSchedule]
  );
  const isTikTokNews = item.kind === 'news' && (isTikTokUrl(item.url) || /tiktok/i.test(item.source));
  const isTwitchNews = item.kind === 'news' && (isTwitchUrl(item.url) || /twitch/i.test(item.source));
  const isYouTubeNews = item.kind === 'news' && (isYouTubeUrl(item.url) || /youtube live/i.test(item.source));
  const isCommunityNews =
    item.kind === 'news' && (isCommunityUrl(item.url) || /tabnews|comunidade br/i.test(item.source));
  const tikTokEmbedUrls = isTikTokNews ? buildTikTokEmbedUrls(item.url) : [];
  const [twitchParentHosts, setTwitchParentHosts] = useState<string[]>(['localhost']);
  const [twitchEmbedIndex, setTwitchEmbedIndex] = useState(0);
  const [twitchEmbedFailed, setTwitchEmbedFailed] = useState(false);
  const twitchChannel = isTwitchNews ? extractTwitchChannelFromUrl(item.url) : '';
  const twitchEmbedUrls = isTwitchNews ? buildTwitchEmbedUrls(twitchChannel, twitchParentHosts) : [];
  const twitchEmbedUrl = twitchEmbedUrls[twitchEmbedIndex] || '';
  const youtubeNewsId = isYouTubeNews ? extractYoutubeId(item.url, '') : '';
  const [tikTokEmbedFailed, setTikTokEmbedFailed] = useState(false);
  const [tikTokEmbedIndex, setTikTokEmbedIndex] = useState(0);
  const [autoFallbackDone, setAutoFallbackDone] = useState(false);
  const relatedTikTokItems = useMemo(() => {
    if (!isTikTokNews) return [] as RadarItem[];
    const creatorMatches = allItems.filter((candidate) => {
      if (candidate.id === item.id) return false;
      if (candidate.kind !== 'news') return false;
      if (!isTikTokUrl(candidate.url) && !/tiktok/i.test(candidate.source)) return false;
      if (item.channel && candidate.channel && candidate.channel === item.channel) return true;
      return false;
    });
    if (creatorMatches.length > 0) return creatorMatches.slice(0, 8);
    return allItems
      .filter(
        (candidate) =>
          candidate.id !== item.id &&
          candidate.kind === 'news' &&
          (isTikTokUrl(candidate.url) || /tiktok/i.test(candidate.source))
      )
      .slice(0, 8);
  }, [allItems, isTikTokNews, item.channel, item.id]);
  const firstPlayableRelatedTikTokItem = useMemo(
    () => relatedTikTokItems.find((candidate) => extractTikTokVideoId(candidate.url)),
    [relatedTikTokItems]
  );
  const readerUrl = `/api/radar-reader?url=${encodeURIComponent(item.url)}&fallbackTitle=${encodeURIComponent(
    item.title
  )}&fallbackDescription=${encodeURIComponent(item.description)}&fallbackSource=${encodeURIComponent(
    item.source
  )}`;

  useEffect(() => {
    setTikTokEmbedFailed(false);
    setTikTokEmbedIndex(0);
    setAutoFallbackDone(false);
    setTwitchEmbedFailed(false);
    setTwitchEmbedIndex(0);
  }, [item.id]);

  useEffect(() => {
    if (!isTikTokNews) return;
    if (tikTokEmbedUrls.length > 0) return;
    if (autoFallbackDone) return;
    if (!firstPlayableRelatedTikTokItem) return;
    setAutoFallbackDone(true);
    onSelectItem(firstPlayableRelatedTikTokItem);
  }, [
    autoFallbackDone,
    firstPlayableRelatedTikTokItem,
    isTikTokNews,
    onSelectItem,
    tikTokEmbedUrls.length,
  ]);

  useEffect(() => {
    setTwitchParentHosts(deriveTwitchParentHosts());
  }, []);

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

  useEffect(() => {
    setIsPodcastPlaying(false);
    setCaptionLineIndex(0);
    setLiveCaptionText('');
    setLiveCaptionError('');
    setUseRealtimeCaptionMode(expectsRealtimeSpeech);
    isPodcastPlayingRef.current = false;
    lastLiveCaptionRef.current = '';
    if (liveCaptionWatchdogRef.current) {
      clearTimeout(liveCaptionWatchdogRef.current);
      liveCaptionWatchdogRef.current = null;
    }
  }, [item.id, expectsRealtimeSpeech]);

  const stopSpeechCapture = () => {
    const recorder = podcastRecorderRef.current;
    if (recorder) {
      if (recorder.state !== 'inactive') {
        recorder.stop();
      }
      podcastRecorderRef.current = null;
    }

    const stream = podcastRecorderStreamRef.current;
    if (stream && !podcastAudioDestinationRef.current) {
      stream.getTracks().forEach((track) => track.stop());
      podcastRecorderStreamRef.current = null;
    }

    if (liveCaptionWatchdogRef.current) {
      clearTimeout(liveCaptionWatchdogRef.current);
      liveCaptionWatchdogRef.current = null;
    }
    setIsSpeechCaptionActive(false);
  };

  const destroySpeechGraph = () => {
    stopSpeechCapture();
    const stream = podcastRecorderStreamRef.current;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      podcastRecorderStreamRef.current = null;
    }
    podcastAudioDestinationRef.current = null;
    podcastAudioSourceNodeRef.current = null;
    if (podcastAudioContextRef.current) {
      void podcastAudioContextRef.current.close();
      podcastAudioContextRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      destroySpeechGraph();
    };
  }, [item.id]);

  const sendAudioChunkToTranscribe = async (blob: Blob) => {
    if (isCaptionRequestInFlightRef.current) return;
    isCaptionRequestInFlightRef.current = true;

    try {
      const audioBase64 = await blobToBase64(blob);
      if (!audioBase64 || audioBase64.length < 40) return;

      const languageHint = (item.translatedLanguage || '').startsWith('pt') ? 'pt-BR' : 'en-US';
      const response = await fetch('/api/podcast-transcribe', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          audioBase64,
          mimeType: blob.type || 'audio/webm;codecs=opus',
          languageHint,
        }),
      });

      if (!response.ok) {
        return;
      }

      const payload = (await response.json()) as {
        ok?: boolean;
        transcript?: string;
        translatedText?: string;
      };
      const translated = String(payload?.translatedText || '').trim();
      if (translated) {
        const normalized = normalizeCaptionText(translated);
        if (!normalized || normalized.length < 10) return;

        const previous = lastLiveCaptionRef.current;
        if (previous) {
          if (normalized === previous) return;

          const looksContained =
            previous.includes(normalized) ||
            normalized.includes(previous) ||
            captionSimilarity(previous, normalized) > 0.9;

          if (looksContained && !hasEnoughNewWords(previous, normalized, 3)) {
            return;
          }
        }

        lastLiveCaptionRef.current = normalized;
        setLiveCaptionText(translated);
        setLiveCaptionError('');
        if (liveCaptionWatchdogRef.current) {
          clearTimeout(liveCaptionWatchdogRef.current);
          liveCaptionWatchdogRef.current = null;
        }
      }
    } catch {
      setUseRealtimeCaptionMode(false);
      setIsSpeechCaptionActive(false);
      setLiveCaptionError('');
    } finally {
      isCaptionRequestInFlightRef.current = false;
    }
  };

  const startSpeechCapture = async () => {
    if (item.kind !== 'podcast') return;
    if (!expectsRealtimeSpeech) return;
    if (podcastRecorderRef.current && podcastRecorderRef.current.state === 'recording') return;

    const audioElement = podcastAudioRef.current as (HTMLAudioElement & {
      captureStream?: () => MediaStream;
      mozCaptureStream?: () => MediaStream;
    }) | null;

    if (!audioElement) return;
    if (typeof window === 'undefined' || typeof MediaRecorder === 'undefined') return;

    try {
      let stream = podcastRecorderStreamRef.current;
      if (!stream) {
        if (podcastAudioDestinationRef.current?.stream) {
          stream = podcastAudioDestinationRef.current.stream;
        }
      }
      if (!stream) {
        const AudioContextCtor = (window.AudioContext ||
          (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext);

        if (AudioContextCtor) {
          if (!podcastAudioContextRef.current || !podcastAudioDestinationRef.current || !podcastAudioSourceNodeRef.current) {
            const context = new AudioContextCtor();
            const sourceNode = context.createMediaElementSource(audioElement);
            const destinationNode = context.createMediaStreamDestination();
            sourceNode.connect(destinationNode);
            sourceNode.connect(context.destination);
            podcastAudioContextRef.current = context;
            podcastAudioSourceNodeRef.current = sourceNode;
            podcastAudioDestinationRef.current = destinationNode;
          }
          if (podcastAudioContextRef.current.state === 'suspended') {
            await podcastAudioContextRef.current.resume();
          }
          stream = podcastAudioDestinationRef.current?.stream || null;
        } else {
          const captureStream =
            (typeof audioElement.captureStream === 'function' && audioElement.captureStream.bind(audioElement)) ||
            (typeof audioElement.mozCaptureStream === 'function' &&
              audioElement.mozCaptureStream.bind(audioElement));
          if (!captureStream) {
            setUseRealtimeCaptionMode(false);
            setIsSpeechCaptionActive(false);
            setLiveCaptionError('');
            return;
          }
          stream = captureStream();
        }
      }

      if (!stream || stream.getTracks().length === 0) {
        setUseRealtimeCaptionMode(false);
        setIsSpeechCaptionActive(false);
        setLiveCaptionError('');
        return;
      }

      const mimeType = pickRecorderMimeType();
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);

      recorder.ondataavailable = (event) => {
        if (!event.data || event.data.size < 3000) return;
        if (!isPodcastPlayingRef.current) return;
        void sendAudioChunkToTranscribe(event.data);
      };
      recorder.onerror = () => {
        setUseRealtimeCaptionMode(false);
        setIsSpeechCaptionActive(false);
      };

      podcastRecorderStreamRef.current = stream;
      podcastRecorderRef.current = recorder;
      recorder.start(3200);
      setIsSpeechCaptionActive(true);
      setUseRealtimeCaptionMode(true);
      if (liveCaptionWatchdogRef.current) {
        clearTimeout(liveCaptionWatchdogRef.current);
      }
      liveCaptionWatchdogRef.current = setTimeout(() => {
        if (!lastLiveCaptionRef.current) {
          setUseRealtimeCaptionMode(false);
          setIsSpeechCaptionActive(false);
        }
      }, LIVE_TRANSCRIPTION_WATCHDOG_MS);
    } catch {
      setUseRealtimeCaptionMode(false);
      setIsSpeechCaptionActive(false);
      stopSpeechCapture();
    }
  };

  const togglePodcastCoverPlayback = async () => {
    const element = podcastAudioRef.current;
    if (!element) return;

    try {
      if (element.paused) {
        await element.play();
      } else {
        element.pause();
      }
    } catch {
      // Native controls remain available as fallback.
    }
  };

  return (
    <div className='fixed inset-0 z-50 bg-black/80 p-2 backdrop-blur-[2px] sm:p-5'>
      <div className='mx-auto flex h-full w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#060608]'>
        <header className='flex items-start justify-between gap-3 border-b border-white/10 p-3 sm:p-4'>
          <div>
            <p className='text-[11px] uppercase tracking-[0.14em] text-[#9ca3af]'>
              {item.kind === 'youtube'
                ? 'YouTube'
                : item.kind === 'news'
                  ? isTikTokNews
                    ? 'TikTok'
                    : isTwitchNews
                      ? 'Twitch'
                      : isYouTubeNews
                        ? 'YouTube Live'
                        : isCommunityNews
                          ? 'Comunidade BR'
                      : 'Notícia'
                  : item.kind === 'podcast'
                    ? 'Podcast'
                    : 'Instagram'}
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
          {item.kind === 'youtube' ? (
            youtubeId ? (
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                title={item.title}
                allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
                allowFullScreen
                className='h-full min-h-[280px] w-full rounded-xl border border-white/10 bg-black sm:min-h-[420px]'
              />
            ) : (
              <div className='flex h-full min-h-[320px] flex-col items-center justify-center rounded-xl border border-white/10 bg-[#0b0b0f] p-5 text-center sm:min-h-[460px]'>
                <p className='text-sm text-[#c9d1d9]'>Não foi possível montar o player interno deste vídeo.</p>
              </div>
            )
          ) : item.kind === 'news' ? (
            isTikTokNews ? (
              <div className='flex h-full min-h-[320px] flex-col gap-3 overflow-auto rounded-xl border border-white/10 bg-[#0b0b0f] p-3 sm:min-h-[460px] sm:p-4'>
                {tikTokEmbedUrls.length > 0 ? (
                  !tikTokEmbedFailed ? (
                    <iframe
                      src={tikTokEmbedUrls[tikTokEmbedIndex] || tikTokEmbedUrls[0]}
                      title={`TikTok player - ${item.title}`}
                      allow='autoplay; encrypted-media; picture-in-picture; web-share'
                      allowFullScreen
                      onError={() => {
                        if (tikTokEmbedIndex < tikTokEmbedUrls.length - 1) {
                          setTikTokEmbedIndex((prev) => prev + 1);
                        } else {
                          setTikTokEmbedFailed(true);
                        }
                      }}
                      className='h-[54vh] min-h-[300px] w-full rounded-xl border border-white/10 bg-black sm:h-[64vh] sm:min-h-[420px]'
                    />
                  ) : (
                    <div className='flex min-h-[300px] items-center justify-center rounded-xl border border-white/10 bg-black/30 p-5 text-center sm:min-h-[420px]'>
                      <p className='text-sm text-[#c9d1d9]'>
                        Este vídeo não abriu no player interno. Clique em outro vídeo do criador abaixo.
                      </p>
                    </div>
                  )
                ) : (
                  <div className='rounded-xl border border-white/10 bg-white/[0.02] p-4'>
                    <p className='text-[11px] uppercase tracking-[0.12em] text-[#9ca3af]'>TikTok Live</p>
                    <h5 className='mt-1 text-sm font-semibold text-white sm:text-base'>{item.title}</h5>
                    <p className='mt-2 text-sm leading-relaxed text-[#d1d5db]'>
                      Esta live usa formato que nem sempre libera player embutido. Selecione outra live/vídeo do TikTok abaixo para assistir no Radar.
                    </p>
                  </div>
                )}
                {!tikTokEmbedFailed && tikTokEmbedUrls.length > 1 ? (
                  <button
                    type='button'
                    onClick={() => {
                      setTikTokEmbedIndex((prev) => (prev + 1) % tikTokEmbedUrls.length);
                    }}
                    className='self-start rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-[#9ca3af] transition hover:border-[#C6FF2E]/45 hover:text-[#C6FF2E]'
                  >
                    Tentar player alternativo
                  </button>
                ) : null}

                {relatedTikTokItems.length > 0 ? (
                  <div className='rounded-xl border border-white/10 bg-white/[0.02] p-3'>
                    <p className='text-[11px] uppercase tracking-[0.12em] text-[#9ca3af]'>
                      {item.channel ? `Mais vídeos de ${item.channel}` : 'Mais vídeos do TikTok'}
                    </p>
                    <div className='mt-2 grid gap-2 sm:grid-cols-2'>
                      {relatedTikTokItems.map((candidate) => (
                        <button
                          key={candidate.id}
                          type='button'
                          onClick={() => onSelectItem(candidate)}
                          className='rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-left text-xs text-[#d1d5db] transition hover:border-[#C6FF2E]/45 hover:text-[#C6FF2E]'
                        >
                          <p className='line-clamp-2 font-medium'>{candidate.title}</p>
                          <p className='mt-1 text-[11px] text-[#9ca3af]'>
                            {candidate.channel || 'TikTok'} · clique para assistir
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : isYouTubeNews && youtubeNewsId ? (
              <iframe
                src={`https://www.youtube.com/embed/${youtubeNewsId}?autoplay=1&rel=0&modestbranding=1`}
                title={`YouTube live - ${item.title}`}
                allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
                allowFullScreen
                className='h-full min-h-[320px] w-full rounded-xl border border-white/10 bg-black sm:min-h-[460px]'
              />
            ) : isTwitchNews ? (
              <div className='flex h-full min-h-[320px] flex-col gap-3 overflow-auto rounded-xl border border-white/10 bg-[#0b0b0f] p-3 sm:min-h-[460px] sm:p-4'>
                {!twitchEmbedFailed && twitchEmbedUrl ? (
                  <iframe
                    src={twitchEmbedUrl}
                    title={`Twitch player - ${item.title}`}
                    allow='autoplay; fullscreen; picture-in-picture'
                    allowFullScreen
                    onError={() => {
                      if (twitchEmbedIndex < twitchEmbedUrls.length - 1) {
                        setTwitchEmbedIndex((prev) => prev + 1);
                      } else {
                        setTwitchEmbedFailed(true);
                      }
                    }}
                    className='h-[54vh] min-h-[300px] w-full rounded-xl border border-white/10 bg-black sm:h-[64vh] sm:min-h-[420px]'
                  />
                ) : (
                  <div className='rounded-xl border border-white/10 bg-white/[0.02] p-4'>
                    <p className='text-[11px] uppercase tracking-[0.12em] text-[#9ca3af]'>Twitch</p>
                    <h5 className='mt-1 text-sm font-semibold text-white sm:text-base'>{item.title}</h5>
                    <p className='mt-2 text-sm leading-relaxed text-[#d1d5db]'>
                      O player interno foi bloqueado neste domínio. Use o botão abaixo para abrir o canal da Twitch.
                    </p>
                    <a
                      href={item.url}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='mt-3 inline-flex items-center rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-semibold text-[#c9d1d9] transition hover:border-[#C6FF2E]/45 hover:text-[#C6FF2E]'
                    >
                      Abrir canal na Twitch
                    </a>
                  </div>
                )}

                {!twitchEmbedFailed && twitchEmbedUrls.length > 1 ? (
                  <button
                    type='button'
                    onClick={() => {
                      setTwitchEmbedIndex((prev) => (prev + 1) % twitchEmbedUrls.length);
                    }}
                    className='self-start rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-[#9ca3af] transition hover:border-[#C6FF2E]/45 hover:text-[#C6FF2E]'
                  >
                    Tentar player alternativo
                  </button>
                ) : null}
              </div>
            ) : isCommunityNews ? (
              <div className='flex h-full min-h-[320px] flex-col gap-3 overflow-auto rounded-xl border border-white/10 bg-[#0b0b0f] p-3 sm:min-h-[460px] sm:p-5'>
                <div className='rounded-xl border border-white/10 bg-white/[0.02] p-4'>
                  <p className='text-[11px] uppercase tracking-[0.12em] text-[#9ca3af]'>Comunidade BR de tecnologia</p>
                  <h5 className='mt-1 text-sm font-semibold text-white sm:text-base'>{item.title}</h5>
                  <p className='mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-[#d1d5db]'>
                    {item.description}
                  </p>
                  <p className='mt-3 text-xs text-[#9ca3af]'>
                    Conteúdo em português atualizado via comunidade brasileira.
                  </p>
                </div>
              </div>
            ) : (
              <iframe
                src={readerUrl}
                title={`Leitura interna - ${item.title}`}
                className='h-full min-h-[320px] w-full rounded-xl border border-white/10 bg-[#0b0b0f] sm:min-h-[460px]'
              />
            )
          ) : item.kind === 'podcast' ? (
            <div className='flex h-full min-h-[320px] flex-col gap-3 overflow-auto rounded-xl border border-white/10 bg-[#0b0b0f] p-3 sm:min-h-[460px] sm:gap-4 sm:p-5'>
              {item.thumbnail ? (
                <div className='relative'>
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className='h-44 w-full rounded-xl border border-white/10 bg-black/35 object-contain p-1.5 sm:h-56'
                  />
                  {isPodcastWithCoverPlay ? (
                    <button
                      type='button'
                      onClick={() => {
                        void togglePodcastCoverPlayback();
                      }}
                      className='absolute inset-0 flex items-center justify-center rounded-xl'
                      aria-label={isPodcastPlaying ? 'Pausar podcast' : 'Reproduzir podcast'}
                    >
                      <span className='inline-flex h-14 w-14 items-center justify-center rounded-full border border-white/15 bg-black/55 text-[#C6FF2E] shadow-[0_0_0_1px_rgba(198,255,46,0.18)] transition hover:scale-[1.03]'>
                        {isPodcastPlaying ? (
                          <PauseCircle className='h-8 w-8' />
                        ) : (
                          <PlayCircle className='h-8 w-8' />
                        )}
                      </span>
                    </button>
                  ) : null}
                </div>
              ) : null}
              <audio
                ref={podcastAudioRef}
                controls
                preload='none'
                playsInline
                src={podcastAudioUrl}
                onPlay={() => {
                  setIsPodcastPlaying(true);
                  isPodcastPlayingRef.current = true;
                  void startSpeechCapture();
                }}
                onPause={() => {
                  setIsPodcastPlaying(false);
                  isPodcastPlayingRef.current = false;
                  stopSpeechCapture();
                }}
                onEnded={() => {
                  setIsPodcastPlaying(false);
                  isPodcastPlayingRef.current = false;
                  stopSpeechCapture();
                }}
                onTimeUpdate={(event) => {
                  if (useRealtimeCaptionMode) return;
                  if (captionLines.length === 0) return;
                  const element = event.currentTarget;
                  if (captionSchedule.length === 0 || captionCycleDuration <= 0) return;
                  const localTime = ((element.currentTime % captionCycleDuration) + captionCycleDuration) % captionCycleDuration;
                  const nextIndex =
                    captionSchedule.findIndex((slot) => localTime >= slot.start && localTime < slot.end) ??
                    0;
                  const safeIndex = nextIndex >= 0 ? nextIndex : captionLines.length - 1;

                  if (safeIndex !== captionLineIndex) {
                    setCaptionLineIndex(safeIndex);
                  }
                }}
                className='block h-14 w-full min-w-0 rounded-lg border border-white/10 bg-black/20'
                style={{ minHeight: 54 }}
              />
              {liveCaptionText || captionLines.length > 0 || useRealtimeCaptionMode ? (
                <div className='rounded-xl border border-white/10 bg-white/[0.02] p-3'>
                  <p className='text-[10px] uppercase tracking-[0.11em] text-[#9ca3af]'>
                    {useRealtimeCaptionMode && isSpeechCaptionActive ? 'Legenda ao vivo (PT-BR)' : 'Legenda (PT-BR)'}
                  </p>
                  <p className='mt-1.5 min-h-[48px] whitespace-pre-wrap break-words text-sm leading-relaxed text-[#d1d5db]'>
                    {liveCaptionText ||
                      (useRealtimeCaptionMode
                        ? 'Ouvindo e traduzindo em tempo real...'
                        : captionLines[captionLineIndex] || captionLines[0])}
                  </p>
                  {liveCaptionError ? <p className='mt-1 text-[11px] text-[#9ca3af]'>{liveCaptionError}</p> : null}
                </div>
              ) : null}
              <div className='rounded-xl border border-white/10 bg-white/[0.02] p-4'>
                <p className='text-[11px] uppercase tracking-[0.12em] text-[#9ca3af]'>Descrição do episódio</p>
                <p className='mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-[#d1d5db] sm:text-[15px]'>
                  {item.description}
                </p>
              </div>
            </div>
          ) : (
            <div className='flex h-full min-h-[320px] flex-col gap-4 overflow-auto rounded-xl border border-white/10 bg-[#0b0b0f] p-4 sm:min-h-[460px] sm:p-5'>
              {instagramEmbedUrl ? (
                <div className='mx-auto w-full max-w-[430px]'>
                  <iframe
                    src={instagramEmbedUrl}
                    title={`Instagram embed - ${item.title}`}
                    className='h-[72vh] min-h-[420px] w-full rounded-xl border border-white/10 bg-black sm:h-[78vh] sm:min-h-[520px]'
                    allow='autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share'
                    allowFullScreen
                  />
                </div>
              ) : (
                <img
                  src={
                    instagramCode
                      ? `/api/instagram-image?code=${instagramCode}${instagramKind ? `&kind=${instagramKind}` : ''}`
                      : item.thumbnail || '/api/instagram-image?code=DV1OIoxDvbV'
                  }
                  alt={item.title}
                  className='max-h-[72vh] w-full rounded-xl border border-white/10 bg-black/35 object-contain p-1.5'
                />
              )}

              <div className='rounded-xl border border-white/10 bg-white/[0.02] p-4'>
                <p className='text-[11px] uppercase tracking-[0.12em] text-[#9ca3af]'>Legenda</p>
                <p className='mt-2 whitespace-pre-wrap break-words text-[15px] leading-relaxed text-[#d1d5db]'>
                  {item.description}
                </p>
                {engagement ? (
                  <div className='mt-3 flex flex-wrap gap-2'>
                    <span className='rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] text-[#9ca3af]'>
                      👍 {engagement.likes} curtidas
                    </span>
                    <span className='rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] text-[#9ca3af]'>
                      💬 {engagement.comments} comentários
                    </span>
                  </div>
                ) : (
                  <p className='mt-3 text-xs text-[#9ca3af]'>Comentários detalhados não disponíveis neste conteúdo.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {item.kind === 'news' && !isTikTokNews && !isTwitchNews && !isYouTubeNews && !isCommunityNews ? (
          <footer className='flex items-center justify-end border-t border-white/10 p-3 sm:p-4'>
            <a
              href={item.url}
              target='_blank'
              rel='noreferrer'
              className='inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-semibold text-white transition hover:border-[#C6FF2E]/60 hover:text-[#C6FF2E] sm:w-auto'
            >
              Abrir fonte original
              <ExternalLink className='h-3.5 w-3.5' />
            </a>
          </footer>
        ) : null}
      </div>
    </div>
  );
}

export function RadarIaSection() {
  const submittedQuery = DEFAULT_QUERY;
  const [activeTab, setActiveTab] = useState<RadarType>('all');
  const [activeRange, setActiveRange] = useState<RadarRange>('7d');
  const [payload, setPayload] = useState<RadarResponsePayload | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const [viewerItem, setViewerItem] = useState<RadarItem | null>(null);
  const [pendingOpenUrl, setPendingOpenUrl] = useState('');
  const [podcastItems, setPodcastItems] = useState<RadarItem[]>([]);
  const [isLoadingPodcasts, setIsLoadingPodcasts] = useState(false);
  const [podcastError, setPodcastError] = useState('');
  const [radarRefreshTick, setRadarRefreshTick] = useState(0);
  const [radarRotationTick, setRadarRotationTick] = useState(0);
  const [podcastRefreshTick, setPodcastRefreshTick] = useState(0);
  const [lastRadarUpdateAt, setLastRadarUpdateAt] = useState('');

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE);
    setViewerItem(null);
  }, [activeTab, submittedQuery, activeRange]);

  useEffect(() => {
    const refreshTimer = window.setInterval(() => {
      setRadarRefreshTick((prev) => prev + 1);
    }, RADAR_REFRESH_MS);
    const rotationTimer = window.setInterval(() => {
      setRadarRotationTick((prev) => prev + 1);
    }, RADAR_ROTATION_MS);
    const podcastTimer = window.setInterval(() => {
      setPodcastRefreshTick((prev) => prev + 1);
    }, PODCAST_REFRESH_MS);

    return () => {
      window.clearInterval(refreshTimer);
      window.clearInterval(rotationTimer);
      window.clearInterval(podcastTimer);
    };
  }, []);

  useEffect(() => {
    const syncFromLocation = () => {
      const openUrl = extractOpenUrlFromLocation();
      if (!openUrl) return;
      setPendingOpenUrl(openUrl);
      if (activeTab !== 'all') {
        setActiveTab('all');
      }
    };

    syncFromLocation();
    window.addEventListener('hashchange', syncFromLocation);
    window.addEventListener('popstate', syncFromLocation);
    return () => {
      window.removeEventListener('hashchange', syncFromLocation);
      window.removeEventListener('popstate', syncFromLocation);
    };
  }, [activeTab]);

  useEffect(() => {
    const handleExternalOpenRequest = (event: Event) => {
      const customEvent = event as CustomEvent<string>;
      const openUrl = String(customEvent?.detail || '').trim();
      if (!openUrl) return;
      if (activeTab !== 'all') {
        setActiveTab('all');
      }
      setPendingOpenUrl('');
      requestAnimationFrame(() => {
        setPendingOpenUrl(openUrl);
      });
    };

    window.addEventListener('radar:open-url', handleExternalOpenRequest as EventListener);
    return () => {
      window.removeEventListener('radar:open-url', handleExternalOpenRequest as EventListener);
    };
  }, [activeTab]);

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
        setLastRadarUpdateAt(new Date().toISOString());
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
  }, [submittedQuery, activeTab, activeRange, radarRefreshTick]);

  useEffect(() => {
    const controller = new AbortController();
    const loadPodcasts = async () => {
      setIsLoadingPodcasts(true);
      setPodcastError('');
      try {
        const response = await fetch('/api/podcasts?limit=12', {
          method: 'GET',
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error('podcasts_fetch_failed');
        }
        const data = (await response.json()) as PodcastResponsePayload;
        const items = Array.isArray(data.items) ? data.items : [];
        setPodcastItems(items);
        if (items.length === 0 && data.errors && Object.keys(data.errors).length > 0) {
          setPodcastError('Feeds de podcast indisponíveis no momento. Tente novamente em instantes.');
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setPodcastError('Não foi possível atualizar podcasts agora.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingPodcasts(false);
        }
      }
    };

    void loadPodcasts();
    return () => controller.abort();
  }, [podcastRefreshTick]);

  const activeItems = useMemo(() => {
    if (!payload) {
      return [] as RadarItem[];
    }
    if (activeTab === 'all') {
      return payload.all;
    }
    return payload.results[activeTab];
  }, [payload, activeTab]);

  const dynamicActiveItems = useMemo(() => {
    const topPinned = activeItems.slice(0, 1);
    const rotating = activeItems.slice(1);
    return [...topPinned, ...rotateItems(rotating, radarRotationTick)];
  }, [activeItems, radarRotationTick]);

  const displayedItems = useMemo(
    () => dynamicActiveItems.slice(0, visibleCount),
    [dynamicActiveItems, visibleCount]
  );
  const viewerItems = useMemo(() => {
    if (!payload) return dedupeViewerItems([...podcastItems]);
    return dedupeViewerItems([
      ...payload.all,
      ...payload.results.youtube,
      ...payload.results.news,
      ...payload.results.instagram,
      ...podcastItems,
    ]);
  }, [payload, podcastItems]);

  useEffect(() => {
    if (!pendingOpenUrl || viewerItems.length === 0) return;
    const pendingKey = normalizeUrlForViewerMatch(pendingOpenUrl);
    const match = viewerItems.find(
      (candidate) =>
        normalizeUrlForViewerMatch(candidate.url) === pendingKey ||
        candidate.url === pendingOpenUrl
    );
    if (match) {
      setViewerItem(match);
    } else {
      const source = /tiktok\.com/i.test(pendingOpenUrl)
        ? 'TikTok Creator Base'
        : /twitch\.tv/i.test(pendingOpenUrl)
          ? 'Twitch Monitor'
          : /youtube\.com|youtu\.be/i.test(pendingOpenUrl)
            ? 'YouTube Live BR'
            : 'Radar IA';
      setViewerItem({
        id: `open-${pendingKey}`,
        kind: 'news',
        title: source === 'TikTok Creator Base' ? 'TikTok · Conteúdo selecionado' : 'Conteúdo selecionado',
        description: 'Conteúdo aberto a partir da seção de canais em tempo real.',
        url: pendingOpenUrl,
        source,
        publishedAt: null,
        thumbnail: null,
        channel: null,
        score: 0,
        ctaLabel: 'Abrir',
      });
    }

    setPendingOpenUrl('');
    if (typeof window !== 'undefined') {
      const nextUrl = `${window.location.pathname}#radar-ia`;
      window.history.replaceState(null, '', nextUrl);
    }
  }, [pendingOpenUrl, viewerItems]);

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
          Atualização contínua de vídeos, notícias e fontes confiáveis de IA.
        </p>
        <p className='mt-2 text-xs text-[#9ca3af]'>
          Recomendações rotativas automáticas · última atualização{' '}
          {lastRadarUpdateAt
            ? new Date(lastRadarUpdateAt).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
              })
            : '--:--'}
        </p>
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
                  {KIND_LABEL[tab]}
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

      <section className='rounded-[20px] border border-white/10 bg-[#0b0b0f] p-3 shadow-[0_10px_28px_rgba(0,0,0,0.2)] sm:rounded-2xl sm:p-4 md:p-5'>
        <header className='mb-4 space-y-1'>
          <p className='text-xs uppercase tracking-[0.18em] text-[#9ca3af]'>Conteúdo em áudio</p>
          <h4 className='text-lg font-bold text-white md:text-xl'>Podcasts</h4>
          <p className='text-xs text-[#9ca3af]'>
            Episódios em português e traduções automáticas para facilitar a leitura.
          </p>
        </header>

        {podcastError ? (
          <p className='mb-4 rounded-xl border border-[#fda4af]/30 bg-[#fda4af]/10 px-3 py-2 text-sm text-[#fecdd3]'>
            {podcastError}
          </p>
        ) : null}

        {isLoadingPodcasts ? (
          <div className='grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3'>
            {Array.from({ length: 3 }).map((_, index) => (
              <SkeletonCard key={`podcast-skeleton-${index}`} />
            ))}
          </div>
        ) : podcastItems.length === 0 ? (
          <div className='rounded-xl border border-dashed border-white/10 bg-black/20 p-6 text-center sm:p-7'>
            <p className='text-sm leading-relaxed text-[#9ca3af]'>Nenhum episódio de podcast disponível no momento.</p>
          </div>
        ) : (
          <div className='grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3'>
            {podcastItems.map((item) => (
              <RadarCard key={item.id} item={item} onOpen={setViewerItem} />
            ))}
          </div>
        )}
      </section>
      {viewerItem ? (
        <RadarViewer
          item={viewerItem}
          allItems={viewerItems}
          onClose={() => setViewerItem(null)}
          onSelectItem={setViewerItem}
        />
      ) : null}
    </article>
  );
}
