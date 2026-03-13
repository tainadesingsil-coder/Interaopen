const CACHE_TTL_MS = 12 * 60 * 1000;
const SOURCE_TIMEOUT_MS = 4000;
const MAX_QUERY_LENGTH = 80;

const NEWS_FEEDS = [
  { name: 'Olhar Digital IA', url: 'https://olhardigital.com.br/tag/inteligencia-artificial/feed/' },
  { name: 'Canaltech', url: 'https://feeds2.feedburner.com/canaltechbr' },
  {
    name: 'Google Notícias IA (PT-BR)',
    url: 'https://news.google.com/rss/search?q=intelig%C3%AAncia+artificial&hl=pt-BR&gl=BR&ceid=BR:pt-419',
  },
];

const ALLOWED_TYPES = ['all', 'youtube', 'news', 'instagram'];
const ALLOWED_RANGES = ['24h', '7d', '30d'];
const YOUTUBE_CHANNEL_LIMIT = 5;
const YOUTUBE_VIDEOS_PER_CHANNEL = 4;
const CURATED_YOUTUBE_VIDEOS = [
  {
    id: 'flIPXJljv5g',
    title: 'IA na prática: automações e produtividade',
    channel: 'Canal recomendado de IA',
    url: 'https://www.youtube.com/watch?v=flIPXJljv5g',
  },
  {
    id: '-ffRm_Tu4zY',
    title: 'Como usar IA no dia a dia do negócio',
    channel: 'Canal recomendado de IA',
    url: 'https://www.youtube.com/watch?v=-ffRm_Tu4zY',
  },
  {
    id: 'h_l8wCr7M2Q',
    title: 'Estratégias de IA para empresas',
    channel: 'Canal recomendado de IA',
    url: 'https://www.youtube.com/watch?v=h_l8wCr7M2Q',
  },
  {
    id: 'CVze2NyauQc',
    title: 'Aplicações de IA em negócios reais',
    channel: 'Canal recomendado de IA',
    url: 'https://www.youtube.com/watch?v=CVze2NyauQc',
  },
  {
    id: 'Q5Vsu5DzBig',
    title: 'Como Criar o Seu 1º Agente IA em Apenas 32 Minutos',
    channel: 'Bruno Picinini',
    url: 'https://www.youtube.com/watch?v=Q5Vsu5DzBig',
  },
  {
    id: '-Ka4YKW7RwM',
    title: 'Curso N8N Gratuito Para Iniciantes | Crie Automações com IA',
    channel: 'NoCode StartUp',
    url: 'https://www.youtube.com/watch?v=-Ka4YKW7RwM',
  },
  {
    id: 'axZZGNmZ50I',
    title: 'Agentes de IA para WhatsApp no N8N',
    channel: 'Enzzo Panarotto',
    url: 'https://www.youtube.com/watch?v=axZZGNmZ50I',
  },
  {
    id: 'NvrBpnbNfv4',
    title: 'N8N + WhatsApp com Agente de IA (Tutorial)',
    channel: 'Guilherme Lazarotto',
    url: 'https://www.youtube.com/watch?v=NvrBpnbNfv4',
  },
  {
    id: 'UmuJeb0VvXA',
    title: 'ChatGPT: o que é e como usar (tutorial em português)',
    channel: 'Me Ensina',
    url: 'https://www.youtube.com/watch?v=UmuJeb0VvXA',
  },
  {
    id: '7Gg7CrayIE0',
    title: 'Inteligência Artificial no Marketing',
    channel: 'Canal de Marketing e IA',
    url: 'https://www.youtube.com/watch?v=7Gg7CrayIE0',
  },
];

const PT_STOPWORDS = new Set([
  'de',
  'do',
  'da',
  'dos',
  'das',
  'para',
  'com',
  'sobre',
  'como',
  'mais',
  'noticia',
  'notícias',
  'agora',
  'hoje',
  'novo',
  'nova',
  'tecnologia',
  'mercado',
  'artificial',
  'inteligencia',
  'inteligência',
  'brasil',
]);

const AI_TOPIC_PATTERN =
  /\b(ia|ai|intelig[eê]ncia artificial|machine learning|aprendizado de m[aá]quina|openai|chatgpt|n8n|automa[cç][aã]o|agente)\b/i;

const getCache = () => {
  const key = '__RADAR_IA_CACHE__';
  if (!globalThis[key]) {
    globalThis[key] = new Map();
  }
  return globalThis[key];
};

const sanitizeQuery = (value = '') =>
  value
    .replace(/[^\w\sÀ-ÿ\-_.:]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_QUERY_LENGTH);

const parseType = (value) => (ALLOWED_TYPES.includes(value) ? value : 'all');
const parseRange = (value) => (ALLOWED_RANGES.includes(value) ? value : '7d');

const isAiRelated = (value = '') => AI_TOPIC_PATTERN.test(value.toLowerCase());

const isLikelyPortuguese = (value = '') => {
  const normalized = value.toLowerCase();
  const words = normalized.split(/\s+/).filter(Boolean);
  const stopwordHits = words.reduce((count, word) => (PT_STOPWORDS.has(word) ? count + 1 : count), 0);
  return /[ãõáéíóúâêôç]/i.test(normalized) || stopwordHits >= 2;
};

const tokensFromQuery = (query) =>
  query
    .toLowerCase()
    .split(/\s+/)
    .map((item) => item.trim())
    .filter((item) => item.length >= 2);

const htmlDecode = (value) =>
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

const stripHtml = (value) =>
  htmlDecode(value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1'))
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const extractTagValue = (block, tagNames) => {
  for (const tagName of tagNames) {
    const direct = block.match(new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i'));
    if (direct && direct[1]) {
      return stripHtml(direct[1]);
    }
    const linked = block.match(new RegExp(`<${tagName}[^>]*href="([^"]+)"[^>]*/?>`, 'i'));
    if (linked && linked[1]) {
      return linked[1].trim();
    }
  }
  return '';
};

const extractEntries = (xml) => {
  const itemMatches = [...xml.matchAll(/<item[\s\S]*?<\/item>/gi)].map((match) => match[0]);
  if (itemMatches.length > 0) {
    return itemMatches;
  }
  return [...xml.matchAll(/<entry[\s\S]*?<\/entry>/gi)].map((match) => match[0]);
};

const safeIsoDate = (value) => {
  const parsed = Date.parse(value || '');
  if (Number.isNaN(parsed)) {
    return null;
  }
  return new Date(parsed).toISOString();
};

const rangeCutoffMs = (range) => {
  const now = Date.now();
  if (range === '24h') return now - 24 * 60 * 60 * 1000;
  if (range === '30d') return now - 30 * 24 * 60 * 60 * 1000;
  return now - 7 * 24 * 60 * 60 * 1000;
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

const textMatchScore = (text, queryTokens) => {
  if (!queryTokens.length) return 0;
  const normalized = text.toLowerCase();
  return queryTokens.reduce((count, token) => (normalized.includes(token) ? count + 1 : count), 0);
};

const recencyScore = (publishedAt) => {
  if (!publishedAt) return 0;
  const parsed = Date.parse(publishedAt);
  if (Number.isNaN(parsed)) return 0;
  const age = Date.now() - parsed;
  if (age <= 24 * 60 * 60 * 1000) return 4;
  if (age <= 7 * 24 * 60 * 60 * 1000) return 3;
  if (age <= 30 * 24 * 60 * 60 * 1000) return 2;
  return 1;
};

const computeScore = (title, description, publishedAt, query) => {
  const tokens = tokensFromQuery(query);
  return textMatchScore(title, tokens) * 5 + textMatchScore(description, tokens) * 2 + recencyScore(publishedAt);
};

const sortByScoreAndDate = (items) =>
  [...items].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const aTime = a.publishedAt ? Date.parse(a.publishedAt) : 0;
    const bTime = b.publishedAt ? Date.parse(b.publishedAt) : 0;
    return bTime - aTime;
  });

const parseFeedItems = (xml) =>
  extractEntries(xml)
    .map((block) => {
      const title = extractTagValue(block, ['title']);
      const description = extractTagValue(block, ['description', 'summary', 'content']);
      const link = extractTagValue(block, ['link', 'id']);
      const publishedRaw = extractTagValue(block, ['pubDate', 'updated', 'published']);
      return {
        title,
        description,
        link,
        publishedAt: safeIsoDate(publishedRaw),
      };
    })
    .filter((item) => item.title && item.link);

const createYoutubeEndpoint = (apiKey, options) => {
  const endpoint = new URL('https://www.googleapis.com/youtube/v3/search');
  endpoint.searchParams.set('part', 'snippet');
  endpoint.searchParams.set('key', apiKey);

  Object.entries(options).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      endpoint.searchParams.set(key, value);
    }
  });

  return endpoint.toString();
};

const normalizeYoutubeItem = (item, query) => {
  const videoId = item?.id?.videoId || '';
  const title = (item?.snippet?.title || '').trim();
  if (!videoId || !title) {
    return null;
  }

  const description = (item?.snippet?.description || '').trim();
  const publishedAt = safeIsoDate(item?.snippet?.publishedAt || '');
  const thumbnail =
    item?.snippet?.thumbnails?.high?.url ||
    item?.snippet?.thumbnails?.medium?.url ||
    item?.snippet?.thumbnails?.default?.url ||
    null;
  const channelTitle = item?.snippet?.channelTitle || null;
  const aiChannelBoost = isAiRelated(channelTitle || '') ? 6 : 0;
  const aiTopicBoost = isAiRelated(`${title} ${description}`) ? 4 : 0;

  return {
    id: `yt-${videoId}`,
    kind: 'youtube',
    title,
    description,
    url: `https://www.youtube.com/watch?v=${videoId}`,
    source: 'YouTube',
    publishedAt,
    thumbnail,
    channel: channelTitle,
    score: computeScore(title, description, publishedAt, query) + aiChannelBoost + aiTopicBoost,
    ctaLabel: 'Assistir',
  };
};

const dedupeById = (items) => {
  const map = new Map();
  items.forEach((item) => {
    if (!map.has(item.id)) {
      map.set(item.id, item);
    }
  });
  return [...map.values()];
};

const buildCuratedYoutubeItems = (query) =>
  CURATED_YOUTUBE_VIDEOS.map((video, index) => {
    const description = `Vídeo recomendado para aprender IA, automação e aplicações em negócios.`;
    const baseScore = 90 - index;
    return {
      id: `yt-${video.id}`,
      kind: 'youtube',
      title: video.title,
      description,
      url: video.url,
      source: 'YouTube Curadoria Codexion',
      publishedAt: null,
      thumbnail: `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`,
      channel: video.channel,
      score: baseScore + computeScore(video.title, description, null, query),
      ctaLabel: 'Assistir',
    };
  });

const fetchYoutubeItems = async (query, range, env) => {
  const apiKey = (env.YOUTUBE_DATA_API_KEY || '').trim();
  const curatedItems = buildCuratedYoutubeItems(query);
  if (!apiKey) return curatedItems;

  const publishedAfter = new Date(rangeCutoffMs(range)).toISOString();
  const aiQuery = `${query} inteligência artificial`;

  const channelSearchUrl = createYoutubeEndpoint(apiKey, {
    type: 'channel',
    q: aiQuery,
    maxResults: '8',
    order: 'relevance',
    relevanceLanguage: 'pt',
    regionCode: 'BR',
  });

  const channelsResponse = await fetchWithTimeout(channelSearchUrl);
  if (!channelsResponse.ok) {
    throw new Error('youtube_channel_fetch_failed');
  }

  const channelsPayload = await channelsResponse.json();
  const channelIds = dedupeById(
    (channelsPayload?.items || [])
      .map((item) => ({
        id: item?.id?.channelId || '',
      }))
      .filter((item) => item.id)
  )
    .map((item) => item.id)
    .slice(0, YOUTUBE_CHANNEL_LIMIT);

  const channelVideoRequests =
    channelIds.length > 0
      ? channelIds.map((channelId) =>
          fetchWithTimeout(
            createYoutubeEndpoint(apiKey, {
              type: 'video',
              q: aiQuery,
              channelId,
              maxResults: String(YOUTUBE_VIDEOS_PER_CHANNEL),
              order: 'date',
              publishedAfter,
              relevanceLanguage: 'pt',
              regionCode: 'BR',
            })
          ).then((response) => {
            if (!response.ok) {
              throw new Error(`youtube_channel_video_failed:${channelId}`);
            }
            return response.json();
          })
        )
      : [];

  const settled = await Promise.allSettled(channelVideoRequests);
  let videoItems = settled.flatMap((result) =>
    result.status === 'fulfilled' ? result.value?.items || [] : []
  );

  if (videoItems.length === 0) {
    const fallbackResponse = await fetchWithTimeout(
      createYoutubeEndpoint(apiKey, {
        type: 'video',
        q: aiQuery,
        maxResults: '16',
        order: 'relevance',
        publishedAfter,
        relevanceLanguage: 'pt',
        regionCode: 'BR',
      })
    );
    if (!fallbackResponse.ok) {
      throw new Error('youtube_video_fallback_failed');
    }
    const fallbackPayload = await fallbackResponse.json();
    videoItems = fallbackPayload?.items || [];
  }

  const mapped = dedupeById(
    videoItems
      .map((item) => normalizeYoutubeItem(item, query))
      .filter(Boolean)
      .filter((item) => isAiRelated(`${item.title} ${item.description} ${item.channel || ''}`))
  );

  return sortByScoreAndDate(dedupeById([...mapped, ...curatedItems])).slice(0, 30);
};

const fetchNewsItems = async (query, range) => {
  const cutoff = rangeCutoffMs(range);
  const settled = await Promise.allSettled(
    NEWS_FEEDS.map(async (feed) => {
      const response = await fetchWithTimeout(feed.url);
      if (!response.ok) {
        throw new Error(`news_fetch_failed:${feed.name}`);
      }
      const xml = await response.text();
      const parsed = parseFeedItems(xml);
      return parsed.map((entry, index) => ({
        id: `news-${feed.name.toLowerCase().replace(/\s+/g, '-')}-${index}`,
        kind: 'news',
        title: entry.title,
        description: entry.description,
        url: entry.link,
        source: feed.name,
        publishedAt: entry.publishedAt,
        thumbnail: null,
        channel: null,
        score: computeScore(entry.title, entry.description, entry.publishedAt, query),
        ctaLabel: 'Ler matéria',
      }));
    })
  );

  const items = settled.flatMap((result) => (result.status === 'fulfilled' ? result.value : []));
  const filtered = items.filter((item) => {
    if (!isLikelyPortuguese(`${item.title} ${item.description}`)) {
      return false;
    }
    if (!item.publishedAt) return true;
    const parsed = Date.parse(item.publishedAt);
    if (Number.isNaN(parsed)) return true;
    return parsed >= cutoff;
  });

  return sortByScoreAndDate(filtered).slice(0, 30);
};

const fetchInstagramItems = async (query) => {
  const url = 'https://www.instagram.com/hollyfield.ia?igsh=MWJxYWczbmdmYm02aw==';
  const description = `Fonte recomendada para acompanhar tendências de IA. ${
    query ? `Tema buscado: ${query}.` : ''
  }`.trim();

  return [
    {
      id: 'instagram-hollyfield-ia',
      kind: 'instagram',
      title: 'hollyfield.ia',
      description,
      url,
      source: 'Instagram',
      publishedAt: null,
      thumbnail: null,
      channel: '@hollyfield.ia',
      score: computeScore('hollyfield ia instagram', description, null, query) + 1,
      ctaLabel: 'Abrir no Instagram',
    },
  ];
};

const emptyResponse = (query, type, range) => ({
  query,
  type,
  range,
  generatedAt: new Date().toISOString(),
  errors: {},
  results: {
    youtube: [],
    news: [],
    instagram: [],
  },
  all: [],
});

const aggregateRadar = async (query, type, range, env) => {
  const data = emptyResponse(query, type, range);
  const requestedKinds = type === 'all' ? ['youtube', 'news', 'instagram'] : [type];

  const tasks = {
    youtube: requestedKinds.includes('youtube') ? fetchYoutubeItems(query, range, env) : Promise.resolve([]),
    news: requestedKinds.includes('news') ? fetchNewsItems(query, range) : Promise.resolve([]),
    instagram: requestedKinds.includes('instagram')
      ? fetchInstagramItems(query)
      : Promise.resolve([]),
  };

  const [youtubeResult, newsResult, instagramResult] = await Promise.allSettled([
    tasks.youtube,
    tasks.news,
    tasks.instagram,
  ]);

  if (youtubeResult.status === 'fulfilled') data.results.youtube = youtubeResult.value;
  else if (requestedKinds.includes('youtube')) data.errors.youtube = 'Fonte YouTube indisponível no momento.';

  if (newsResult.status === 'fulfilled') data.results.news = newsResult.value;
  else if (requestedKinds.includes('news')) data.errors.news = 'Fonte de notícias indisponível no momento.';

  if (instagramResult.status === 'fulfilled') data.results.instagram = instagramResult.value;
  else if (requestedKinds.includes('instagram'))
    data.errors.instagram = 'Fonte Instagram indisponível no momento.';

  data.all = sortByScoreAndDate([
    ...data.results.youtube,
    ...data.results.news,
    ...data.results.instagram,
  ]);

  return data;
};

export async function onRequestGet(context) {
  const requestUrl = new URL(context.request.url);
  const query = sanitizeQuery(requestUrl.searchParams.get('query') || '');
  const type = parseType(requestUrl.searchParams.get('type'));
  const range = parseRange(requestUrl.searchParams.get('range'));

  if (!query) {
    return Response.json(emptyResponse('', type, range), {
      headers: { 'cache-control': 'no-store' },
    });
  }

  const cache = getCache();
  const cacheKey = `${type}:${range}:${query.toLowerCase()}`;
  const now = Date.now();
  const cached = cache.get(cacheKey);

  if (cached && cached.expiresAt > now) {
    return Response.json(cached.data, {
      headers: {
        'x-radar-cache': 'hit',
        'cache-control': 'public, max-age=120',
      },
    });
  }

  const data = await aggregateRadar(query, type, range, context.env);
  cache.set(cacheKey, {
    data,
    expiresAt: now + CACHE_TTL_MS,
  });

  return Response.json(data, {
    headers: {
      'x-radar-cache': 'miss',
      'cache-control': 'public, max-age=120',
    },
  });
}
