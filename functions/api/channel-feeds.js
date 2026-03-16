const CACHE_TTL_MS = 30 * 1000;
const CREATOR_BASE_TTL_MS = 24 * 60 * 60 * 1000;
const CONTENT_ROTATION_MS = 20 * 60 * 1000;
const SOURCE_TIMEOUT_MS = 8000;
const GOOGLE_TRANSLATE_PUBLIC_ENDPOINT =
  'https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=pt&dt=t&q=';
const FALLBACK_TWITCH_CHANNELS = [
  'bisteconee',
  'baiano',
  'gabepeixe',
  'nicolediretora',
  'tftoddy',
  'riotgames',
  'lucas_montano',
  'linuxtips',
  'glaucia_lemos86',
  'teomewhy',
  'danielhe4rt',
  'karlamag',
  'cozycoding',
  'theprimeagen',
  'tsoding',
  'piratesoftware',
  'j_blow',
  'georgehotz',
  'codeaesthetic',
  'lowlevellearning',
];
const PRIORITY_TWITCH_CHANNELS = ['baiano', 'bisteconee', 'gabepeixe', 'riotgames'];
const REQUIRED_TWITCH_CHANNELS = ['bisteconee', 'gabepeixe', 'nicolediretora', 'tftoddy', 'riotgames'];
const FALLBACK_TIKTOK_VIDEO_URLS = [
  'https://www.tiktok.com/@gabrieladamuchi/video/7601907452212235540',
  'https://www.tiktok.com/@izabela.anholett/video/7611634628490710293',
  'https://www.tiktok.com/@jotalinharesdesign/video/7513681439955684664',
  'https://www.tiktok.com/@jefdicastech/video/7601248981095550226',
  'https://www.tiktok.com/@islamsousa/video/7613833799423528199',
  'https://www.tiktok.com/@jornadatop/video/7232292097313770757',
];
const FALLBACK_TIKTOK_CREATOR_HANDLES = [
  'gabrieladamuchi',
  'izabela.anholett',
  'jotalinharesdesign',
  'jefdicastech',
  'islamsousa',
  'jornadatop',
];
const TWITCH_TOPIC_QUERIES = [
  'inteligencia artificial',
  'marketing digital',
  'tecnologia',
  'software',
  'programacao',
  'negocios',
  'startups',
  'empreendedorismo',
];

const getCache = () => {
  const key = '__CHANNEL_FEEDS_CACHE__';
  if (!globalThis[key]) {
    globalThis[key] = new Map();
  }
  return globalThis[key];
};

const getTokenCache = () => {
  const key = '__TWITCH_APP_TOKEN_CACHE__';
  if (!globalThis[key]) {
    globalThis[key] = { token: '', expiresAt: 0 };
  }
  return globalThis[key];
};

const getCreatorBaseCache = () => {
  const key = '__CHANNEL_FEEDS_CREATOR_BASE_CACHE__';
  if (!globalThis[key]) {
    globalThis[key] = new Map();
  }
  return globalThis[key];
};

const readCreatorBase = (bucket) => {
  const cache = getCreatorBaseCache();
  const entry = cache.get(bucket);
  if (!entry) return [];
  if (Number(entry?.expiresAt || 0) < Date.now()) {
    cache.delete(bucket);
    return [];
  }
  return Array.isArray(entry?.items) ? entry.items : [];
};

const mergeCreatorBase = (bucket, items = [], max = 80) => {
  const normalized = toUniqueList(
    items
      .map((item) => String(item || '').trim())
      .filter(Boolean),
    max
  );
  if (normalized.length === 0) return [];

  const existing = readCreatorBase(bucket);
  const merged = toUniqueList([...normalized, ...existing], max);
  const cache = getCreatorBaseCache();
  cache.set(bucket, {
    items: merged,
    expiresAt: Date.now() + CREATOR_BASE_TTL_MS,
  });
  return merged;
};

const fetchWithTimeout = async (url, init = {}, timeoutMs = SOURCE_TIMEOUT_MS) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        'user-agent':
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        ...(init.headers || {}),
      },
    });
  } finally {
    clearTimeout(timer);
  }
};

const fetchTextWithTimeout = async (url, init = {}, timeoutMs = SOURCE_TIMEOUT_MS) => {
  try {
    const response = await fetchWithTimeout(url, init, timeoutMs);
    if (!response.ok) return '';
    return (await response.text()).trim();
  } catch {
    return '';
  }
};

const fetchJsonWithTimeout = async (url, init = {}, timeoutMs = SOURCE_TIMEOUT_MS) => {
  try {
    const response = await fetchWithTimeout(url, init, timeoutMs);
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
};

const safeText = (value = '', max = 320) =>
  String(value || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);

const PT_HINTS = [' de ', ' para ', ' com ', ' que ', ' não ', ' ao vivo ', ' espectadores '];

const isLikelyPortuguese = (value = '') => {
  const normalized = ` ${String(value || '').toLowerCase()} `;
  if (/[ãõáéíóúâêôç]/i.test(normalized)) return true;
  return PT_HINTS.some((hint) => normalized.includes(hint));
};

const parseTranslatedPayload = (payload = '') => {
  try {
    const parsed = JSON.parse(payload);
    const chunks = Array.isArray(parsed?.[0]) ? parsed[0] : [];
    const text = chunks
      .map((chunk) => (Array.isArray(chunk) ? String(chunk?.[0] || '') : ''))
      .join('')
      .trim();
    return text || '';
  } catch {
    return '';
  }
};

const translateToPortuguese = async (value = '', force = false) => {
  const input = safeText(value, 240);
  if (!input) return input;
  if (!force && isLikelyPortuguese(input)) return input;
  try {
    const endpoint = `${GOOGLE_TRANSLATE_PUBLIC_ENDPOINT}${encodeURIComponent(input)}`;
    const response = await fetchWithTimeout(endpoint, undefined, 5000);
    if (!response.ok) return input;
    const payload = await response.text();
    const translated = parseTranslatedPayload(payload);
    return translated || input;
  } catch {
    return input;
  }
};

const parseCommaSeparated = (value = '') =>
  String(value || '')
    .split(/[,\n;]/)
    .map((item) => item.trim())
    .filter(Boolean);

const toUniqueList = (items = [], max = 20) =>
  [...new Set(items.map((item) => String(item || '').trim()).filter(Boolean))].slice(0, max);

const rotateList = (items = [], offset = 0) => {
  if (!Array.isArray(items) || items.length <= 1) return Array.isArray(items) ? [...items] : [];
  const normalizedOffset = Math.abs(Number(offset || 0)) % items.length;
  if (normalizedOffset === 0) return [...items];
  return items.map((_, index) => items[(index + normalizedOffset) % items.length]);
};

const getRotationOffset = (size, salt = 0) => {
  if (!Number.isFinite(size) || size <= 1) return 0;
  const bucket = Math.floor(Date.now() / CONTENT_ROTATION_MS);
  return Math.abs((bucket + Number(salt || 0)) % size);
};

const parseEntries = (xml = '') => {
  const items = [...xml.matchAll(/<item[\s\S]*?<\/item>/gi)].map((match) => match[0]);
  if (items.length > 0) return items;
  return [...xml.matchAll(/<entry[\s\S]*?<\/entry>/gi)].map((match) => match[0]);
};

const extractTagValue = (block = '', tags = []) => {
  for (const tag of tags) {
    const direct = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
    if (direct?.[1]) return safeText(direct[1], 1200);

    const linked = block.match(new RegExp(`<${tag}[^>]*href="([^"]+)"[^>]*/?>`, 'i'));
    if (linked?.[1]) return linked[1].trim();
  }
  return '';
};

const extractImageFromBlock = (block = '') => {
  const media = block.match(/<media:content[^>]+url="([^"]+)"/i)?.[1];
  if (media) return media;
  const enclosure = block.match(/<enclosure[^>]+url="([^"]+)"/i)?.[1];
  if (enclosure) return enclosure;
  const img = block.match(/<img[^>]+src="([^"]+)"/i)?.[1];
  if (img) return img;
  return null;
};

const normalizeTikTokUrl = (url = '') => {
  try {
    const parsed = new URL(String(url || '').trim());
    parsed.search = '';
    parsed.hash = '';
    return `${parsed.origin}${parsed.pathname}`.replace(/\/+$/, '');
  } catch {
    return String(url || '').trim();
  }
};

const extractTikTokVideoId = (url = '') => {
  const match = String(url || '').match(/\/video\/(\d+)/i);
  return match?.[1] || '';
};

const extractTiktokHandleFromUrl = (url = '') => {
  const match = String(url || '').match(/tiktok\.com\/@([a-z0-9._]{2,40})/i);
  return match?.[1] ? `@${match[1].toLowerCase()}` : '@tiktok';
};

const parseTiktokSeedVideoUrls = (env = {}) => {
  const raw = String(
    env?.TIKTOK_VIDEO_URLS || env?.TIKTOK_CREATOR_URLS || env?.TIKTOK_SEED_URLS || ''
  ).trim();
  const envUrls = raw ? parseCommaSeparated(raw) : [];
  return toUniqueList(
    [...envUrls, ...FALLBACK_TIKTOK_VIDEO_URLS]
      .filter((url) => /^https?:\/\/(www\.)?tiktok\.com\/@[^/]+\/video\/\d+/i.test(url))
      .map((url) => normalizeTikTokUrl(url)),
    14
  );
};

const parseTiktokCreatorHandles = (env = {}) => {
  const raw = String(env?.TIKTOK_CREATOR_HANDLES || env?.TIKTOK_CREATORS || '').trim();
  const fromEnv = raw
    ? parseCommaSeparated(raw)
        .map((value) => value.replace(/^@+/, '').toLowerCase())
        .filter((value) => /^[a-z0-9._]{2,40}$/i.test(value))
    : [];
  const fromSeeds = parseTiktokSeedVideoUrls(env)
    .map((url) => extractTiktokHandleFromUrl(url).replace(/^@/, '').toLowerCase())
    .filter((value) => /^[a-z0-9._]{2,40}$/i.test(value));
  const fromBase = readCreatorBase('tiktok_handles').filter((value) =>
    /^[a-z0-9._]{2,40}$/i.test(String(value || ''))
  );
  return toUniqueList([...fromEnv, ...fromSeeds, ...fromBase, ...FALLBACK_TIKTOK_CREATOR_HANDLES], 24);
};

const parseFeedItems = (xml = '') =>
  parseEntries(xml)
    .map((block) => {
      const title = extractTagValue(block, ['title']);
      const description = extractTagValue(block, ['description', 'summary', 'content']);
      const link = extractTagValue(block, ['link', 'id']);
      const publishedAt = extractTagValue(block, ['pubDate', 'updated', 'published']);
      return {
        title,
        description,
        link,
        publishedAt,
        image: extractImageFromBlock(block),
      };
    })
    .filter((item) => item.link);

const extractTikApiItems = (payload = null) => {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== 'object') return [];
  const root = payload;
  const candidates = [root.items, root.itemList, root.aweme_list, root.data, root.posts];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
    if (candidate && typeof candidate === 'object' && Array.isArray(candidate.items)) return candidate.items;
  }
  return [];
};

const fetchTikApiEntriesByHandle = async (handle = '', env = {}) => {
  const apiKey = String(env?.TIKAPI_KEY || '').trim();
  const cleanHandle = String(handle || '').replace(/^@+/, '').trim().toLowerCase();
  if (!apiKey || !cleanHandle) return [];

  const headers = {
    accept: 'application/json',
    'x-api-key': apiKey,
    authorization: `Bearer ${apiKey}`,
  };
  const endpoints = [
    `https://api.tikapi.io/public/posts?username=${encodeURIComponent(cleanHandle)}`,
    `https://api.tikapi.io/public/user/posts?username=${encodeURIComponent(cleanHandle)}`,
    `https://api.tikapi.io/public/posts/${encodeURIComponent(cleanHandle)}`,
  ];

  for (const endpoint of endpoints) {
    const payload = await fetchJsonWithTimeout(endpoint, { headers }, 7000);
    const items = extractTikApiItems(payload);
    if (items.length === 0) continue;
    return items
      .slice(0, 8)
      .map((item, index) => {
        const shareUrl = normalizeTikTokUrl(
          String(
            item?.share_url ||
              item?.url ||
              item?.video_url ||
              item?.shareInfo?.share_url ||
              item?.share_info?.share_url ||
              ''
          ).trim()
        );
        const awemeId = String(item?.aweme_id || item?.id || item?.video_id || '').trim();
        const url = shareUrl || (awemeId ? `https://www.tiktok.com/@${cleanHandle}/video/${awemeId}` : '');
        const videoId = extractTikTokVideoId(url);
        if (!videoId) return null;
        const cover = item?.video?.cover || item?.cover || item?.thumbnail || {};
        const thumbnail =
          String(
            item?.thumbnail_url ||
              item?.cover_url ||
              item?.video?.cover_url ||
              cover?.url ||
              (Array.isArray(cover?.url_list) ? cover.url_list[0] : '')
          ).trim() || null;
        const title = safeText(String(item?.title || item?.desc || item?.caption || '').trim(), 180);
        const created = Number(item?.create_time || item?.createTime || item?.published_at || 0);
        const publishedAt =
          Number.isFinite(created) && created > 0
            ? new Date((created > 9_999_999_999 ? created : created * 1000)).toISOString()
            : '';
        return {
          url: normalizeTikTokUrl(url),
          title,
          thumbnail,
          publishedAt,
          channel: `@${cleanHandle}`,
          rank: index,
        };
      })
      .filter(Boolean);
  }
  return [];
};

const fetchTiktokCreatorFeedEntries = async (handle = '') => {
  const cleanHandle = String(handle || '').replace(/^@+/, '').trim().toLowerCase();
  if (!cleanHandle) return [];
  const candidates = [
    `https://rsshub.app/tiktok/user/${encodeURIComponent(cleanHandle)}`,
    `https://rsshub.app/tiktok/user/${encodeURIComponent(cleanHandle)}/video`,
  ];
  for (const endpoint of candidates) {
    try {
      const response = await fetchWithTimeout(endpoint, undefined, 5500);
      if (!response.ok) continue;
      const xml = await response.text();
      const parsed = parseFeedItems(xml);
      if (parsed.length > 0) return parsed;
    } catch {
      // Try next feed candidate.
    }
  }
  return [];
};

const fetchTiktokVideoCandidates = async (env = {}) => {
  const seedUrls = parseTiktokSeedVideoUrls(env);
  const handles = parseTiktokCreatorHandles(env);
  mergeCreatorBase('tiktok_handles', handles, 60);

  const settled = await Promise.allSettled(
    handles.slice(0, 14).map(async (handle) => {
      const apiEntries = await fetchTikApiEntriesByHandle(handle, env);
      if (apiEntries.length > 0) {
        return apiEntries.slice(0, 6);
      }

      const entries = await fetchTiktokCreatorFeedEntries(handle);
      return entries
        .slice(0, 6)
        .map((entry, index) => {
          const url = normalizeTikTokUrl(String(entry?.link || '').trim());
          const videoId = extractTikTokVideoId(url);
          if (!videoId) return null;
          return {
            url,
            title: safeText(entry?.title || '', 180),
            thumbnail: String(entry?.image || '').trim() || null,
            publishedAt: String(entry?.publishedAt || '').trim() || null,
            channel: `@${handle}`,
            rank: index,
          };
        })
        .filter(Boolean);
    })
  );

  const dynamicCandidates = settled.flatMap((result) => (result.status === 'fulfilled' ? result.value : []));
  const seedCandidates = seedUrls
    .map((url, index) => {
      const normalized = normalizeTikTokUrl(url);
      const videoId = extractTikTokVideoId(normalized);
      if (!videoId) return null;
      return {
        url: normalized,
        title: '',
        thumbnail: null,
        publishedAt: null,
        channel: extractTiktokHandleFromUrl(normalized),
        rank: 100 + index,
      };
    })
    .filter(Boolean);

  const map = new Map();
  [...dynamicCandidates, ...seedCandidates].forEach((candidate) => {
    const key = normalizeTikTokUrl(String(candidate?.url || ''));
    if (!key || map.has(key)) return;
    map.set(key, candidate);
  });

  const merged = [...map.values()];
  const sorted = merged.sort((a, b) => {
    const aTime = a?.publishedAt ? Date.parse(a.publishedAt) : 0;
    const bTime = b?.publishedAt ? Date.parse(b.publishedAt) : 0;
    if (!Number.isNaN(aTime) || !Number.isNaN(bTime)) return (Number.isNaN(bTime) ? 0 : bTime) - (Number.isNaN(aTime) ? 0 : aTime);
    return Number(a?.rank || 0) - Number(b?.rank || 0);
  });
  const offset = getRotationOffset(sorted.length, 7);
  return rotateList(sorted, offset).slice(0, 18);
};

const resolveTiktokOEmbed = async (videoUrl = '') => {
  try {
    const endpoint = new URL('https://www.tiktok.com/oembed');
    endpoint.searchParams.set('url', videoUrl);
    const response = await fetchWithTimeout(
      endpoint.toString(),
      {
        headers: {
          accept: 'application/json',
        },
      },
      5500
    );
    if (!response.ok) return null;
    const payload = await response.json();
    return {
      title: safeText(payload?.title || '', 180),
      thumbnail: String(payload?.thumbnail_url || '').trim() || null,
      authorName: safeText(payload?.author_name || '', 120),
    };
  } catch {
    return null;
  }
};

const resolveTikTokPageMeta = async (videoUrl = '') => {
  try {
    const response = await fetchWithTimeout(
      videoUrl,
      {
        headers: {
          accept: 'text/html,application/xhtml+xml',
        },
      },
      5500
    );
    if (!response.ok) return null;
    const html = await response.text();
    const extractMeta = (key) => {
      const byProperty = html.match(
        new RegExp(`<meta[^>]+property=["']${key}["'][^>]+content=["']([^"']+)["'][^>]*>`, 'i')
      )?.[1];
      if (byProperty) return safeText(byProperty, 280);
      const byName = html.match(
        new RegExp(`<meta[^>]+name=["']${key}["'][^>]+content=["']([^"']+)["'][^>]*>`, 'i')
      )?.[1];
      return byName ? safeText(byName, 280) : '';
    };
    const title = extractMeta('og:title') || extractMeta('twitter:title') || '';
    const thumbnail = extractMeta('og:image') || extractMeta('twitter:image') || '';
    return {
      title: title || '',
      thumbnail: thumbnail || null,
    };
  } catch {
    return null;
  }
};

const fetchTiktokItems = async (env = {}) => {
  const candidates = await fetchTiktokVideoCandidates(env);
  const settled = await Promise.allSettled(
    candidates.map(async (candidate, index) => {
      const videoUrl = String(candidate?.url || '').trim();
      if (!videoUrl) return null;
      const oEmbed = await resolveTiktokOEmbed(videoUrl);
      const pageMeta = !oEmbed?.thumbnail || !oEmbed?.title ? await resolveTikTokPageMeta(videoUrl) : null;
      const channel = String(candidate?.channel || extractTiktokHandleFromUrl(videoUrl));
      const fallbackTitle = safeText(candidate?.title || '', 180);
      const title = oEmbed?.title || pageMeta?.title || fallbackTitle || `TikTok · ${channel}`;
      return {
        id: `tiktok-video-${videoUrl}`.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 80),
        title,
        summary:
          oEmbed?.authorName
            ? `Vídeo recente de ${oEmbed.authorName} na sua base de criadores.`
            : 'Vídeo recente da sua base de criadores no TikTok.',
        url: videoUrl,
        thumbnail: oEmbed?.thumbnail || pageMeta?.thumbnail || candidate?.thumbnail || null,
        tags: ['TikTok', 'Vídeo', 'Creator'],
        category: /marketing|conteudo|social/i.test(title) ? 'Marketing' : 'IA',
        isLive: true,
        metricLabel: 'Atualizado pela base de criadores',
        caseLabel: 'Ver no Radar',
        channel,
        rank: index,
      };
    })
  );

  return settled
    .flatMap((result) => (result.status === 'fulfilled' && result.value ? [result.value] : []))
    .sort((a, b) => Number(a.rank || 0) - Number(b.rank || 0))
    .map(({ rank, ...item }) => item)
    .slice(0, 10);
};

const extractTwitchChannelCandidate = (value = '') => {
  const raw = String(value || '').trim().toLowerCase();
  if (!raw) return '';
  const fromUrl = raw.match(/twitch\.tv\/([a-z0-9_]{2,25})/i)?.[1];
  if (fromUrl) return fromUrl.toLowerCase();
  const cleaned = raw.replace(/^@/, '');
  return /^[a-z0-9_]{2,25}$/i.test(cleaned) ? cleaned.toLowerCase() : '';
};

const parseTwitchChannels = (env = {}) => {
  const raw = String(env?.TWITCH_CHANNELS || '').trim();
  const provided = raw
    ? raw
        .split(/[,\n; ]/)
        .map((item) => item.trim())
        .filter(Boolean)
    : [];
  const cleanedProvided = provided.map(extractTwitchChannelCandidate).filter(Boolean);
  const fallback = FALLBACK_TWITCH_CHANNELS.map(extractTwitchChannelCandidate).filter(Boolean);
  return toUniqueList([...REQUIRED_TWITCH_CHANNELS, ...cleanedProvided, ...fallback], 14);
};

const getTwitchCredentials = (env = {}) => {
  const clientId = String(env?.TWITCH_CLIENT_ID || env?.TWITCH_API_KEY || '').trim();
  const clientSecret = String(env?.TWITCH_CLIENT_SECRET || env?.TWITCH_API_SECRET || '').trim();
  return { clientId, clientSecret };
};

const getTwitchAppToken = async (env = {}) => {
  const { clientId, clientSecret } = getTwitchCredentials(env);
  if (!clientId || !clientSecret) return { clientId: '', token: '' };

  const tokenCache = getTokenCache();
  if (tokenCache.token && tokenCache.expiresAt > Date.now() + 45_000) {
    return { clientId, token: tokenCache.token };
  }

  const endpoint = new URL('https://id.twitch.tv/oauth2/token');
  endpoint.searchParams.set('client_id', clientId);
  endpoint.searchParams.set('client_secret', clientSecret);
  endpoint.searchParams.set('grant_type', 'client_credentials');

  const response = await fetchWithTimeout(endpoint.toString(), { method: 'POST' }, 7000);
  if (!response.ok) return { clientId: '', token: '' };
  const payload = await response.json();
  const token = String(payload?.access_token || '').trim();
  const expiresIn = Number(payload?.expires_in || 0);
  if (!token) return { clientId: '', token: '' };

  tokenCache.token = token;
  tokenCache.expiresAt = Date.now() + Math.max(60_000, expiresIn * 1000);
  return { clientId, token };
};

const fetchTwitchHelixItems = async (env = {}) => {
  const { clientId, token } = await getTwitchAppToken(env);
  if (!clientId || !token) return [];

  const headers = {
    'client-id': clientId,
    authorization: `Bearer ${token}`,
    accept: 'application/json',
  };

  const categorySettled = await Promise.allSettled(
    TWITCH_TOPIC_QUERIES.map(async (query) => {
      const endpoint = new URL('https://api.twitch.tv/helix/search/categories');
      endpoint.searchParams.set('query', query);
      endpoint.searchParams.set('first', '5');
      const response = await fetchWithTimeout(endpoint.toString(), { headers }, 6500);
      if (!response.ok) return [];
      const payload = await response.json();
      return Array.isArray(payload?.data) ? payload.data : [];
    })
  );

  const categoryIds = [
    ...new Set(
      categorySettled.flatMap((result) =>
        result.status === 'fulfilled' ? result.value.map((item) => String(item?.id || '').trim()) : []
      )
    ),
  ]
    .filter(Boolean)
    .slice(0, 12);

  if (categoryIds.length === 0) return [];

  const streamSettled = await Promise.allSettled(
    categoryIds.map(async (categoryId) => {
      const endpoint = new URL('https://api.twitch.tv/helix/streams');
      endpoint.searchParams.set('game_id', categoryId);
      endpoint.searchParams.set('first', '10');
      const response = await fetchWithTimeout(endpoint.toString(), { headers }, 6500);
      if (!response.ok) return [];
      const payload = await response.json();
      return Array.isArray(payload?.data) ? payload.data : [];
    })
  );

  const merged = streamSettled.flatMap((result) => (result.status === 'fulfilled' ? result.value : []));
  const byUser = new Map();
  merged.forEach((stream) => {
    const key = String(stream?.user_login || '').toLowerCase();
    if (!key) return;
    if (!byUser.has(key) || Number(stream?.viewer_count || 0) > Number(byUser.get(key)?.viewer_count || 0)) {
      byUser.set(key, stream);
    }
  });

  const topStreams = [...byUser.values()]
    .sort((a, b) => Number(b?.viewer_count || 0) - Number(a?.viewer_count || 0))
    .slice(0, 10);

  const translated = await Promise.all(
    topStreams.map(async (stream, index) => {
      const channel = String(stream?.user_login || '').trim();
      const rawTitle = safeText(stream?.title || 'Live na Twitch', 180);
      const rawGame = safeText(stream?.game_name || 'Categoria em destaque', 90);
      const language = String(stream?.language || '').toLowerCase();
      const mustTranslate = !!language && !language.startsWith('pt');
      const title = await translateToPortuguese(rawTitle, mustTranslate);
      const translatedGame = await translateToPortuguese(rawGame, mustTranslate);
      const translated = title !== rawTitle || translatedGame !== rawGame;
      const viewers = Number(stream?.viewer_count || 0);
      const thumbnail = String(stream?.thumbnail_url || '')
        .replace('{width}', '640')
        .replace('{height}', '360');
      return {
        id: `twitch-live-${stream?.id || channel || index}`,
        title: title || 'Live na Twitch',
        summary: `${translatedGame || rawGame} · ${viewers} espectadores ao vivo`,
        url: channel ? `https://www.twitch.tv/${channel}` : 'https://www.twitch.tv/directory',
        source: translated ? 'Twitch Live · traduzido' : 'Twitch Live',
        publishedAt: new Date().toISOString(),
        thumbnail: thumbnail || null,
        tags: ['Twitch', 'LIVE', safeText(translatedGame || rawGame || 'Tech', 24)],
        category: 'Software',
        isLive: true,
        metricLabel: `${viewers} espectadores`,
        caseLabel: 'Assistir',
        channel: channel ? `@${channel}` : '@twitch',
      };
    })
  );

  return translated;
};

const fetchTwitchDecapiFallback = async (env = {}) => {
  const channels = parseTwitchChannels(env);
  const settled = await Promise.allSettled(
    channels.map(async (channel) => {
      const base = 'https://decapi.me/twitch';
      const [uptime, title, game, viewers] = await Promise.all([
        fetchTextWithTimeout(`${base}/uptime/${channel}`, undefined, 5000),
        fetchTextWithTimeout(`${base}/title/${channel}`, undefined, 5000),
        fetchTextWithTimeout(`${base}/game/${channel}`, undefined, 5000),
        fetchTextWithTimeout(`${base}/viewercount/${channel}`, undefined, 5000),
      ]);
      const isLive = !!uptime && !/offline/i.test(uptime);
      const viewerCount = viewers && !/offline/i.test(viewers) ? viewers : '0';
      const rawTitle = safeText(title || `Canal ${channel} na Twitch`, 180);
      const rawGame = safeText(game || 'Software and Game Development', 90);
      const shouldTranslate = isLive && !isLikelyPortuguese(`${rawTitle} ${rawGame}`);
      const translatedTitle = shouldTranslate ? await translateToPortuguese(rawTitle, true) : rawTitle;
      const translatedGame = shouldTranslate ? await translateToPortuguese(rawGame, true) : rawGame;
      return {
        id: `twitch-fallback-${channel}`,
        title: translatedTitle,
        summary: `${translatedGame} · ${
          isLive ? `${viewerCount} espectadores ao vivo` : 'Offline agora'
        }`,
        url: `https://www.twitch.tv/${channel}`,
        source: isLive ? (shouldTranslate ? 'Twitch Live · traduzido' : 'Twitch Live') : 'Twitch Monitor',
        publishedAt: isLive ? new Date().toISOString() : null,
        thumbnail: `https://static-cdn.jtvnw.net/previews-ttv/live_user_${channel}-640x360.jpg?t=${Date.now()}`,
        tags: ['Twitch', isLive ? 'LIVE' : 'Monitor', safeText(translatedGame || 'Tech', 24)],
        category: 'Software',
        isLive,
        metricLabel: isLive ? `${viewerCount} espectadores` : 'Offline',
        caseLabel: isLive ? 'Assistir' : 'Ver canal',
        channel: `@${channel}`,
      };
    })
  );

  const merged = settled.flatMap((result) => (result.status === 'fulfilled' ? [result.value] : []));
  const liveFirst = merged.sort((a, b) => Number(b.isLive) - Number(a.isLive));
  return liveFirst.slice(0, 12);
};

const fetchTwitchItems = async (env = {}) => {
  const [helix, monitored] = await Promise.all([
    fetchTwitchHelixItems(env),
    fetchTwitchDecapiFallback(env),
  ]);

  const normalizeChannelKey = (value = '') =>
    String(value || '')
      .trim()
      .toLowerCase()
      .replace(/^@/, '');

  const byChannel = new Map();
  monitored.forEach((item) => {
    const key = normalizeChannelKey(item?.channel);
    if (key) byChannel.set(key, item);
  });
  helix.forEach((item) => {
    const key = normalizeChannelKey(item?.channel);
    if (!key || !byChannel.has(key)) {
      byChannel.set(key || `helix-${item.id}`, item);
    }
  });

  REQUIRED_TWITCH_CHANNELS.forEach((channel) => {
    if (byChannel.has(channel)) return;
    byChannel.set(channel, {
      id: `twitch-required-${channel}`,
      title: `Twitch · ${channel}`,
      summary: 'Canal monitorado em tempo real no Radar para detectar lives e manter atualização contínua.',
      url: `https://www.twitch.tv/${channel}`,
      source: 'Twitch Monitor',
      publishedAt: null,
      thumbnail: `https://static-cdn.jtvnw.net/previews-ttv/live_user_${channel}-640x360.jpg?t=${Date.now()}`,
      tags: ['Twitch', 'Monitor', 'Tech'],
      category: 'Software',
      isLive: false,
      metricLabel: 'Monitor ativo',
      caseLabel: 'Ver canal',
      channel: `@${channel}`,
    });
  });

  const allItems = [...byChannel.values()];
  const profileMap = await fetchTwitchProfileImages([...byChannel.keys()], env);
  const hydratedItems = allItems.map((item) => {
    const channelKey = normalizeChannelKey(item?.channel);
    if (!channelKey) return item;
    const profileImage = profileMap.get(channelKey) || null;
    if (!profileImage) return item;
    if (item?.isLive) return item;
    return {
      ...item,
      thumbnail: profileImage,
    };
  });
  const pinned = PRIORITY_TWITCH_CHANNELS.map((channel) =>
    hydratedItems.find((item) => normalizeChannelKey(item?.channel) === channel)
  ).filter(Boolean);
  const pinnedKeys = new Set(pinned.map((item) => normalizeChannelKey(item?.channel)));

  const rest = hydratedItems
    .filter((item) => !pinnedKeys.has(normalizeChannelKey(item?.channel)))
    .sort((a, b) => Number(Boolean(b?.isLive)) - Number(Boolean(a?.isLive)));

  return [...pinned, ...rest].slice(0, 12);
};

const fetchTwitchProfileImages = async (channelKeys = [], env = {}) => {
  const channels = toUniqueList(
    channelKeys
      .map((value) => String(value || '').trim().toLowerCase())
      .filter(Boolean),
    40
  );
  if (channels.length === 0) return new Map();

  const { clientId, token } = await getTwitchAppToken(env);
  if (!clientId || !token) return new Map();

  const endpoint = new URL('https://api.twitch.tv/helix/users');
  channels.forEach((channel) => endpoint.searchParams.append('login', channel));

  try {
    const response = await fetchWithTimeout(
      endpoint.toString(),
      {
        headers: {
          'client-id': clientId,
          authorization: `Bearer ${token}`,
          accept: 'application/json',
        },
      },
      7000
    );
    if (!response.ok) return new Map();
    const payload = await response.json();
    const users = Array.isArray(payload?.data) ? payload.data : [];
    return new Map(
      users
        .map((user) => {
          const login = String(user?.login || '').trim().toLowerCase();
          const image = String(user?.profile_image_url || '').trim();
          if (!login || !image) return null;
          return [login, image];
        })
        .filter(Boolean)
    );
  } catch {
    return new Map();
  }
};

const aggregateChannelFeeds = async (env = {}) => {
  const [tiktok, twitch] = await Promise.all([
    fetchTiktokItems(env),
    fetchTwitchItems(env),
  ]);

  return {
    generatedAt: new Date().toISOString(),
    tiktok,
    twitch,
  };
};

export async function onRequestGet(context) {
  const cache = getCache();
  const cacheKey = 'channel-feeds:v7';
  const now = Date.now();
  const cached = cache.get(cacheKey);

  if (cached && cached.expiresAt > now) {
    return Response.json(cached.data, {
      headers: {
        'x-channel-cache': 'hit',
        'cache-control': 'public, max-age=15',
      },
    });
  }

  const data = await aggregateChannelFeeds(context.env || {});
  cache.set(cacheKey, {
    data,
    expiresAt: now + CACHE_TTL_MS,
  });

  return Response.json(data, {
    headers: {
      'x-channel-cache': 'miss',
      'cache-control': 'public, max-age=15',
    },
  });
}
