const CACHE_TTL_MS = 5 * 60 * 1000;
const SOURCE_TIMEOUT_MS = 8000;
const FALLBACK_DISCORD_APP_ID = '1482397432993026088';
const FALLBACK_TWITCH_CHANNELS = ['cozycoding', 'theprimeagen', 'tsoding'];
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

const parseTiktokRssFeeds = (env = {}) => {
  const raw = String(env?.TIKTOK_RSS_FEEDS || env?.TIKTOK_RSS_URL || '').trim();
  if (!raw) return [];
  return raw
    .split(/[,\n;]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item, index, arr) => arr.indexOf(item) === index)
    .slice(0, 4);
};

const tiktokFallbackItems = () => [
  {
    id: 'tiktok-fallback-ia',
    title: 'TikTok · #inteligenciaartificial',
    summary: 'Feed em tempo real com vídeos sobre IA no TikTok.',
    url: 'https://www.tiktok.com/tag/inteligenciaartificial',
    thumbnail: null,
    tags: ['TikTok', 'IA', 'Trends'],
    category: 'IA',
    isLive: true,
    metricLabel: 'Atualizando agora',
    caseLabel: 'Abrir feed',
    channel: '@tiktok',
  },
  {
    id: 'tiktok-fallback-marketing',
    title: 'TikTok · Marketing digital',
    summary: 'Conteúdos e estratégias atuais de marketing digital.',
    url: 'https://www.tiktok.com/discover/marketing-digital',
    thumbnail: null,
    tags: ['TikTok', 'Marketing', 'Conteúdo'],
    category: 'Marketing',
    isLive: true,
    metricLabel: 'Atualizando agora',
    caseLabel: 'Abrir feed',
    channel: '@tiktok',
  },
];

const fetchTiktokItems = async (env = {}) => {
  const feeds = parseTiktokRssFeeds(env);
  if (feeds.length === 0) return tiktokFallbackItems();

  const settled = await Promise.allSettled(
    feeds.map(async (feedUrl) => {
      const response = await fetchWithTimeout(feedUrl);
      if (!response.ok) throw new Error(`tiktok_rss_failed:${response.status}`);
      const xml = await response.text();
      const entries = parseEntries(xml).slice(0, 8);
      return entries.map((entry, index) => {
        const title = extractTagValue(entry, ['title']);
        const summary = extractTagValue(entry, ['description', 'summary', 'content']);
        const link = extractTagValue(entry, ['link', 'id']);
        if (!link) return null;
        return {
          id: `tiktok-${feedUrl}-${index}`.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 80),
          title: title || 'TikTok · Conteúdo recente',
          summary: safeText(summary || title || 'Novo conteúdo no TikTok.', 260),
          url: link,
          thumbnail: extractImageFromBlock(entry),
          tags: ['TikTok', 'Trend', 'Atualização'],
          category: 'Marketing',
          isLive: true,
          metricLabel: 'Atualizado há instantes',
          caseLabel: 'Assistir',
          channel: '@tiktok',
        };
      });
    })
  );

  const merged = settled
    .flatMap((result) => (result.status === 'fulfilled' ? result.value : []))
    .filter(Boolean)
    .slice(0, 10);

  return merged.length > 0 ? merged : tiktokFallbackItems();
};

const parseTwitchChannels = (env = {}) => {
  const raw = String(env?.TWITCH_CHANNELS || '').trim();
  const provided = raw
    ? raw
        .split(/[,\n; ]/)
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean)
    : [];

  const base = provided.length > 0 ? provided : FALLBACK_TWITCH_CHANNELS;
  return base
    .map((channel) => channel.replace(/^@/, ''))
    .filter((channel) => /^[a-z0-9_]{2,25}$/i.test(channel))
    .filter((channel, index, arr) => arr.indexOf(channel) === index)
    .slice(0, 12);
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

  return [...byUser.values()]
    .sort((a, b) => Number(b?.viewer_count || 0) - Number(a?.viewer_count || 0))
    .slice(0, 10)
    .map((stream, index) => {
      const channel = String(stream?.user_login || '').trim();
      const title = safeText(stream?.title || 'Live na Twitch', 180);
      const viewers = Number(stream?.viewer_count || 0);
      const thumbnail = String(stream?.thumbnail_url || '')
        .replace('{width}', '640')
        .replace('{height}', '360');
      return {
        id: `twitch-live-${stream?.id || channel || index}`,
        title: title || 'Live na Twitch',
        summary: `${safeText(stream?.game_name || 'Categoria em destaque', 90)} · ${viewers} espectadores ao vivo`,
        url: channel ? `https://www.twitch.tv/${channel}` : 'https://www.twitch.tv/directory',
        thumbnail: thumbnail || null,
        tags: ['Twitch', 'LIVE', safeText(stream?.game_name || 'Tech', 24)],
        category: 'Software',
        isLive: true,
        metricLabel: `${viewers} espectadores`,
        caseLabel: 'Assistir',
        channel: channel ? `@${channel}` : '@twitch',
      };
    });
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
      return {
        id: `twitch-fallback-${channel}`,
        title: safeText(title || `Canal ${channel} na Twitch`, 180),
        summary: `${safeText(game || 'Software and Game Development', 90)} · ${
          isLive ? `${viewerCount} espectadores ao vivo` : 'Offline agora'
        }`,
        url: `https://www.twitch.tv/${channel}`,
        thumbnail: `https://static-cdn.jtvnw.net/previews-ttv/live_user_${channel}-640x360.jpg?t=${Date.now()}`,
        tags: ['Twitch', isLive ? 'LIVE' : 'Monitor', 'Tech'],
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
  return liveFirst.slice(0, 10);
};

const fetchTwitchItems = async (env = {}) => {
  const helix = await fetchTwitchHelixItems(env);
  if (helix.length > 0) return helix;
  return fetchTwitchDecapiFallback(env);
};

const fetchDiscordItems = async (env = {}) => {
  const appId = String(env?.DISCORD_APP_ID || env?.DISCORD_APPLICATION_ID || FALLBACK_DISCORD_APP_ID || '').trim();
  if (!appId) return [];

  const rpcResponse = await fetchWithTimeout(`https://discord.com/api/v10/applications/${appId}/rpc`, undefined, 6000);
  if (!rpcResponse.ok) {
    return [
      {
        id: `discord-app-${appId}`,
        title: 'Discord · CodexionAI',
        summary: 'Acompanhe e distribua o aplicativo no Discord Directory.',
        url: `https://discord.com/application-directory/${appId}`,
        thumbnail: null,
        tags: ['Discord', 'App', 'Comunidade'],
        category: 'IA',
        isLive: true,
        metricLabel: 'Atualizado agora',
        caseLabel: 'Abrir app',
        channel: '@discord',
      },
    ];
  }

  const payload = await rpcResponse.json();
  const icon = String(payload?.icon || '').trim();
  const appName = safeText(payload?.name || 'CodexionAI', 80);
  const installCount = Number(payload?.approximate_user_install_count || 0);
  const description = safeText(payload?.description || 'Aplicativo de IA para Discord.', 220);
  const iconUrl = icon ? `https://cdn.discordapp.com/app-icons/${appId}/${icon}.png?size=512` : null;

  return [
    {
      id: `discord-app-${appId}`,
      title: `Discord · ${appName}`,
      summary: `${description}${installCount > 0 ? ` · ${installCount} instalações` : ''}`,
      url: `https://discord.com/application-directory/${appId}`,
      thumbnail: iconUrl,
      tags: ['Discord', 'Bot', 'IA'],
      category: 'IA',
      isLive: true,
      metricLabel: installCount > 0 ? `${installCount} instalações` : 'Atualizado agora',
      caseLabel: 'Abrir app',
      channel: '@discord',
    },
    {
      id: `discord-invite-${appId}`,
      title: 'Discord · Adicionar bot',
      summary: 'Instalação direta do bot com escopos de comandos.',
      url: `https://discord.com/oauth2/authorize?client_id=${appId}&scope=bot%20applications.commands`,
      thumbnail: iconUrl,
      tags: ['Discord Bot', 'Install', 'Automação'],
      category: 'Software',
      isLive: true,
      metricLabel: 'Link oficial',
      caseLabel: 'Adicionar bot',
      channel: '@discord',
    },
  ];
};

const aggregateChannelFeeds = async (env = {}) => {
  const [tiktok, twitch, discord] = await Promise.all([
    fetchTiktokItems(env),
    fetchTwitchItems(env),
    fetchDiscordItems(env),
  ]);

  return {
    generatedAt: new Date().toISOString(),
    tiktok,
    twitch,
    discord,
  };
};

export async function onRequestGet(context) {
  const cache = getCache();
  const cacheKey = 'channel-feeds:v1';
  const now = Date.now();
  const cached = cache.get(cacheKey);

  if (cached && cached.expiresAt > now) {
    return Response.json(cached.data, {
      headers: {
        'x-channel-cache': 'hit',
        'cache-control': 'public, max-age=180',
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
      'cache-control': 'public, max-age=180',
    },
  });
}
