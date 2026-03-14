const CACHE_TTL_MS = 10 * 60 * 1000;
const SOURCE_TIMEOUT_MS = 9000;
const TRANSLATE_TIMEOUT_MS = 6000;
const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 30;
const RSS2JSON_ENDPOINT = 'https://api.rss2json.com/v1/api.json?rss_url=';
const GOOGLE_TRANSLATE_ENDPOINT =
  'https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=pt&dt=t&q=';
const DEFAULT_USER_AGENT =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
const TRANSLATE_TITLE_MAX_CHARS = 180;
const TRANSLATE_DESCRIPTION_MAX_CHARS = 420;
const PORTUGUESE_SOURCE_PRIORITY = ['Pizza de Dados'];

const PODCAST_FEEDS = [
  {
    name: 'Lex Fridman',
    rssCandidates: ['https://lexfridman.com/feed/podcast/'],
  },
  {
    name: 'Pizza de Dados',
    // User-provided URL first, then resilient alternatives.
    rssCandidates: [
      'https://feeds.simplecast.com/BqzFsWvp',
      'https://podcast.pizzadedados.com/feed.xml',
      'http://feeds.feedburner.com/PizzaDeDados',
    ],
  },
  {
    name: 'Marketing School',
    // User-provided URL first, then active feed endpoint fallback.
    rssCandidates: ['https://feeds.simplecast.com/lX_QnMKP', 'https://feeds.megaphone.fm/ESHO5419936864'],
  },
];

const getCache = () => {
  const key = '__PODCAST_CACHE__';
  if (!globalThis[key]) {
    globalThis[key] = new Map();
  }
  return globalThis[key];
};

const getTranslateCache = () => {
  const key = '__PODCAST_TRANSLATE_CACHE__';
  if (!globalThis[key]) {
    globalThis[key] = new Map();
  }
  return globalThis[key];
};

const fetchWithTimeout = async (url, init = {}, timeoutMs = SOURCE_TIMEOUT_MS) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      ...init,
      headers: {
        'user-agent': DEFAULT_USER_AGENT,
        ...(init.headers || {}),
      },
      signal: controller.signal,
    });
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
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(Number.parseInt(code, 16)));

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

const stripCdata = (value = '') => value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');
const escapeRegex = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const readTagValue = (block, tagNames) => {
  for (const tagName of tagNames) {
    const escapedTag = escapeRegex(tagName);
    const match = block.match(new RegExp(`<${escapedTag}[^>]*>([\\s\\S]*?)</${escapedTag}>`, 'i'));
    if (match && match[1]) {
      return stripCdata(match[1]).trim();
    }
  }
  return '';
};

const readTagAttribute = (block, tagName, attributeName) => {
  const escapedTag = escapeRegex(tagName);
  const escapedAttr = escapeRegex(attributeName);
  const match = block.match(
    new RegExp(
      `<${escapedTag}[^>]*\\s${escapedAttr}\\s*=\\s*(?:"([^"]+)"|'([^']+)'|([^\\s"'/>]+))`,
      'i'
    )
  );
  return (match && (match[1] || match[2] || match[3])) || '';
};

const parseLimit = (value) => {
  const parsed = Number.parseInt(value || '', 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_LIMIT;
  return Math.min(parsed, MAX_LIMIT);
};

const truncateText = (value = '', maxChars = 400) => {
  if (!value || value.length <= maxChars) return value;
  return `${value.slice(0, maxChars).trim()}...`;
};

const isLikelyPortuguese = (value = '') => {
  const normalized = String(value || '').toLowerCase();
  if (!normalized.trim()) return false;

  if (/[ãõáéíóúâêôç]/i.test(normalized)) return true;

  const ptMatches =
    normalized.match(/\b(de|da|do|dos|das|para|com|sem|não|uma|que|por|sobre|episódio|dados)\b/g) || [];
  const enMatches = normalized.match(/\b(the|and|with|for|you|your|how|what|this|that|is|are)\b/g) || [];
  if (ptMatches.length >= 2) return true;
  if (enMatches.length >= 3 && ptMatches.length === 0) return false;
  return ptMatches.length > enMatches.length;
};

const parseTranslatedPayload = (payload) => {
  if (!Array.isArray(payload) || !Array.isArray(payload[0])) return '';
  return payload[0]
    .map((chunk) => (Array.isArray(chunk) && typeof chunk[0] === 'string' ? chunk[0] : ''))
    .join('')
    .trim();
};

const translateToPortuguese = async (value = '', maxChars = TRANSLATE_DESCRIPTION_MAX_CHARS) => {
  const input = truncateText(String(value || '').trim(), maxChars);
  if (!input) return '';
  if (isLikelyPortuguese(input)) return input;

  const cache = getTranslateCache();
  const cacheKey = `pt:${input}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetchWithTimeout(
      `${GOOGLE_TRANSLATE_ENDPOINT}${encodeURIComponent(input)}`,
      {},
      TRANSLATE_TIMEOUT_MS
    );
    if (!response.ok) {
      return input;
    }
    const payload = await response.json();
    const translated = parseTranslatedPayload(payload);
    const output = translated || input;
    cache.set(cacheKey, output);
    return output;
  } catch {
    return input;
  }
};

const extractAudioUrl = (item) =>
  item?.enclosure?.link ||
  item?.enclosure?.url ||
  item?.enclosures?.[0]?.link ||
  item?.enclosures?.[0]?.url ||
  null;

const mapPodcastItem = (item, feedName, index, sourceKey = '') => {
  const audioUrl = extractAudioUrl(item);
  if (!audioUrl) return null;

  const title = stripHtml(item?.title || 'Episódio');
  const description = stripHtml(item?.description || item?.content || '');
  const publishedAt = safeIsoDate(item?.pubDate || '');
  const thumbnail = item?.thumbnail || null;
  const link = item?.link || audioUrl;
  const author = stripHtml(item?.author || '');
  const stableIdBase = item?.guid || item?.link || audioUrl || `${feedName}-${sourceKey}-${index}`;

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

const mapDirectRssItem = (itemBlock, feedName, sourceKey, index) => {
  const audioUrl =
    readTagAttribute(itemBlock, 'enclosure', 'url') ||
    readTagAttribute(itemBlock, 'media:content', 'url') ||
    '';
  if (!audioUrl) return null;

  const title = stripHtml(readTagValue(itemBlock, ['title']) || 'Episódio');
  const description = stripHtml(
    readTagValue(itemBlock, ['description', 'content:encoded', 'itunes:summary']) || ''
  );
  const publishedAt = safeIsoDate(readTagValue(itemBlock, ['pubDate', 'published', 'dc:date']) || '');
  const thumbnail =
    readTagAttribute(itemBlock, 'itunes:image', 'href') ||
    readTagAttribute(itemBlock, 'media:thumbnail', 'url') ||
    null;
  const author = stripHtml(readTagValue(itemBlock, ['itunes:author', 'author', 'dc:creator']) || '');
  const guid = readTagValue(itemBlock, ['guid']);
  const link = readTagValue(itemBlock, ['link']) || audioUrl;
  const stableIdBase = guid || link || audioUrl || `${feedName}-${sourceKey}-${index}`;

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

const parseDirectRssItems = (xml, feedName, sourceKey, maxItems = 20) => {
  const itemRegex = /<item\b[\s\S]*?<\/item>/gi;
  const mapped = [];
  let match = itemRegex.exec(xml);
  while (match && mapped.length < maxItems) {
    const parsed = mapDirectRssItem(match[0], feedName, sourceKey, mapped.length);
    if (parsed) mapped.push(parsed);
    match = itemRegex.exec(xml);
  }
  return mapped;
};

const fetchFeedItemsFromRss2Json = async (feedName, rssUrl) => {
  const endpoint = `${RSS2JSON_ENDPOINT}${encodeURIComponent(rssUrl)}`;
  const response = await fetchWithTimeout(endpoint);
  if (!response.ok) {
    throw new Error(`rss2json_http_${response.status}`);
  }

  const payload = await response.json();
  if (payload?.status !== 'ok' || !Array.isArray(payload?.items)) {
    throw new Error(`rss2json_payload_${payload?.status || 'invalid'}:${payload?.message || 'unknown'}`);
  }

  const mapped = payload.items
    .map((item, index) => mapPodcastItem(item, feedName, index, rssUrl))
    .filter(Boolean);
  if (mapped.length === 0) {
    throw new Error('rss2json_no_audio_items');
  }

  return mapped;
};

const fetchFeedItemsFromDirectRss = async (feedName, rssUrl) => {
  const response = await fetchWithTimeout(
    rssUrl,
    {
      headers: {
        accept: 'application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8',
      },
    },
    12000
  );

  if (!response.ok) {
    throw new Error(`rss_http_${response.status}`);
  }

  const xml = await response.text();
  const mapped = parseDirectRssItems(xml, feedName, rssUrl, 20);
  if (mapped.length === 0) {
    throw new Error('rss_no_audio_items');
  }

  return mapped;
};

const fetchFeedItems = async (feed) => {
  const reasons = [];
  for (const rssUrl of feed.rssCandidates) {
    try {
      return await fetchFeedItemsFromRss2Json(feed.name, rssUrl);
    } catch (error) {
      reasons.push(`rss2json:${rssUrl}:${error instanceof Error ? error.message : 'unknown'}`);
    }
  }

  for (const rssUrl of feed.rssCandidates) {
    try {
      return await fetchFeedItemsFromDirectRss(feed.name, rssUrl);
    } catch (error) {
      reasons.push(`rss:${rssUrl}:${error instanceof Error ? error.message : 'unknown'}`);
    }
  }

  throw new Error(reasons.join('|').slice(0, 500));
};

const dedupeByAudioUrl = (items) => {
  const seen = new Set();
  return items.filter((item) => {
    const key = String(item.audioUrl || '').trim();
    if (!key) return false;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const limitPerFeed = (items, feedName, maxPerFeed = 8) => {
  let count = 0;
  return items.filter((item) => {
    if (item.source !== feedName) return false;
    if (count >= maxPerFeed) return false;
    count += 1;
    return true;
  });
};

const buildBalancedItems = (groupedItems, limit) => {
  const ordered = [...groupedItems].sort((a, b) => {
    const aPriority = PORTUGUESE_SOURCE_PRIORITY.includes(a.feedName) ? 0 : 1;
    const bPriority = PORTUGUESE_SOURCE_PRIORITY.includes(b.feedName) ? 0 : 1;
    if (aPriority !== bPriority) return aPriority - bPriority;
    return a.feedName.localeCompare(b.feedName, 'pt-BR');
  });

  const queues = ordered.map((entry) => ({
    feedName: entry.feedName,
    items: limitPerFeed(sortByDate(entry.items), entry.feedName, 8),
  }));

  const output = [];
  while (output.length < limit && queues.some((queue) => queue.items.length > 0)) {
    for (const queue of queues) {
      if (output.length >= limit) break;
      const next = queue.items.shift();
      if (next) output.push(next);
    }
  }
  return output;
};

const translatePodcastItems = async (items) =>
  Promise.all(
    items.map(async (item) => {
      const translatedTitle = await translateToPortuguese(item.title || '', TRANSLATE_TITLE_MAX_CHARS);
      const translatedDescription = await translateToPortuguese(
        item.description || '',
        TRANSLATE_DESCRIPTION_MAX_CHARS
      );
      const translated = translatedTitle !== item.title || translatedDescription !== item.description;

      return {
        ...item,
        title: translatedTitle || item.title,
        description: translatedDescription || item.description,
        source: translated ? `${item.source} · traduzido` : item.source,
      };
    })
  );

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
  const groupedItems = settled.flatMap((result, index) => {
    if (result.status === 'fulfilled') {
      return [{ feedName: PODCAST_FEEDS[index].name, items: result.value }];
    }
    errors[PODCAST_FEEDS[index].name] = 'Feed indisponível no momento.';
    return [];
  });

  const balanced = buildBalancedItems(groupedItems, Math.max(limit * 2, 12));
  const translated = await translatePodcastItems(balanced);
  const merged = dedupeByAudioUrl(translated);

  const data = {
    generatedAt: new Date().toISOString(),
    items: merged.slice(0, limit),
    errors,
  };

  if (data.items.length > 0) {
    cache.set(cacheKey, {
      data,
      expiresAt: now + CACHE_TTL_MS,
    });
  } else if (cached?.data?.items?.length) {
    return Response.json(cached.data, {
      headers: {
        'x-podcast-cache': 'stale',
        'cache-control': 'public, max-age=180',
      },
    });
  }

  return Response.json(data, {
    headers: {
      'x-podcast-cache': 'miss',
      'cache-control': 'public, max-age=300',
    },
  });
}
