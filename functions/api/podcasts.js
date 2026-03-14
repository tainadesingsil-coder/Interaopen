const CACHE_TTL_MS = 10 * 60 * 1000;
const SOURCE_TIMEOUT_MS = 7000;
const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 30;

const PODCAST_FEEDS = [
  {
    name: 'Lex Fridman',
    rssUrl: 'https://lexfridman.com/feed/podcast/',
  },
  {
    name: 'Pizza de Dados',
    rssUrl: 'https://feeds.simplecast.com/BqzFsWvp',
  },
  {
    name: 'Marketing School',
    rssUrl: 'https://feeds.simplecast.com/lX_QnMKP',
  },
];

const getCache = () => {
  const key = '__PODCAST_CACHE__';
  if (!globalThis[key]) {
    globalThis[key] = new Map();
  }
  return globalThis[key];
};

const fetchWithTimeout = async (url, init = {}, timeoutMs = SOURCE_TIMEOUT_MS) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
};

const htmlDecode = (value = '') =>
  value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number.parseInt(code, 10)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) =>
      String.fromCharCode(Number.parseInt(code, 16))
    );

const stripHtml = (value = '') =>
  htmlDecode(value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1'))
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const safeIsoDate = (value = '') => {
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return null;
  return new Date(parsed).toISOString();
};

const parseLimit = (value) => {
  const parsed = Number.parseInt(value || '', 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_LIMIT;
  return Math.min(parsed, MAX_LIMIT);
};

const extractAudioUrl = (item) =>
  item?.enclosure?.link ||
  item?.enclosure?.url ||
  item?.enclosures?.[0]?.link ||
  item?.enclosures?.[0]?.url ||
  null;

const mapPodcastItem = (item, feedName, index) => {
  const audioUrl = extractAudioUrl(item);
  if (!audioUrl) return null;

  const title = stripHtml(item?.title || 'Episódio');
  const description = stripHtml(item?.description || item?.content || '');
  const publishedAt = safeIsoDate(item?.pubDate || '');
  const thumbnail = item?.thumbnail || null;
  const link = item?.link || audioUrl;
  const author = stripHtml(item?.author || '');
  const stableIdBase = item?.guid || item?.link || audioUrl || `${feedName}-${index}`;

  return {
    id: `pod-${stableIdBase}`.replace(/\s+/g, '-').slice(0, 180),
    kind: 'podcast',
    title,
    description,
    url: link,
    source: feedName,
    publishedAt,
    thumbnail,
    channel: author || feedName,
    score: 0,
    ctaLabel: 'Ouvir episódio',
    audioUrl,
  };
};

const sortByDate = (items) =>
  [...items].sort((a, b) => {
    const aTime = a.publishedAt ? Date.parse(a.publishedAt) : 0;
    const bTime = b.publishedAt ? Date.parse(b.publishedAt) : 0;
    return bTime - aTime;
  });

const fetchFeedItems = async (feed) => {
  const endpoint = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.rssUrl)}`;
  const response = await fetchWithTimeout(endpoint);
  if (!response.ok) {
    throw new Error(`podcast_feed_failed:${feed.name}`);
  }

  const payload = await response.json();
  if (payload?.status !== 'ok' || !Array.isArray(payload?.items)) {
    throw new Error(`podcast_invalid_payload:${feed.name}`);
  }

  return payload.items
    .map((item, index) => mapPodcastItem(item, feed.name, index))
    .filter(Boolean);
};

export async function onRequestGet(context) {
  const requestUrl = new URL(context.request.url);
  const limit = parseLimit(requestUrl.searchParams.get('limit'));
  const cache = getCache();
  const cacheKey = `podcasts:${limit}`;
  const now = Date.now();
  const cached = cache.get(cacheKey);

  if (cached && cached.expiresAt > now) {
    return Response.json(cached.data, {
      headers: {
        'x-podcast-cache': 'hit',
        'cache-control': 'public, max-age=300',
      },
    });
  }

  const settled = await Promise.allSettled(PODCAST_FEEDS.map((feed) => fetchFeedItems(feed)));
  const errors = {};
  const merged = settled.flatMap((result, index) => {
    if (result.status === 'fulfilled') return result.value;
    errors[PODCAST_FEEDS[index].name] = 'Feed indisponível no momento.';
    return [];
  });

  const data = {
    generatedAt: new Date().toISOString(),
    items: sortByDate(merged).slice(0, limit),
    errors,
  };

  cache.set(cacheKey, {
    data,
    expiresAt: now + CACHE_TTL_MS,
  });

  return Response.json(data, {
    headers: {
      'x-podcast-cache': 'miss',
      'cache-control': 'public, max-age=300',
    },
  });
}
