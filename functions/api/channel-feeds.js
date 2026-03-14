const CACHE_TTL_MS = 5 * 60 * 1000;
const SOURCE_TIMEOUT_MS = 8000;
const FALLBACK_DISCORD_APP_ID = '1482397432993026088';
const FALLBACK_TWITCH_CHANNELS = ['cozycoding', 'theprimeagen', 'tsoding'];
const FALLBACK_TIKTOK_VIDEO_URLS = [
  'https://www.tiktok.com/@gabrieladamuchi/video/7601907452212235540',
  'https://www.tiktok.com/@izabela.anholett/video/7611634628490710293',
  'https://www.tiktok.com/@jotalinharesdesign/video/7513681439955684664',
  'https://www.tiktok.com/@jefdicastech/video/7601248981095550226',
  'https://www.tiktok.com/@islamsousa/video/7613833799423528199',
  'https://www.tiktok.com/@jornadatop/video/7232292097313770757',
];
const FALLBACK_DISCORD_COMMUNITY_URLS = [
  'https://discord.com/channels/327861810768117763/1181004493517758604/threads/1252303012634824865',
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

const parseCommaSeparated = (value = '') =>
  String(value || '')
    .split(/[,\n;]/)
    .map((item) => item.trim())
    .filter(Boolean);

const toUniqueList = (items = [], max = 20) =>
  [...new Set(items.map((item) => String(item || '').trim()).filter(Boolean))].slice(0, max);

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

const extractTiktokHandleFromUrl = (url = '') => {
  const match = String(url || '').match(/tiktok\.com\/@([a-z0-9._]{2,40})/i);
  return match?.[1] ? `@${match[1].toLowerCase()}` : '@tiktok';
};

const parseTiktokVideoUrls = (env = {}) => {
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

const fetchTiktokItems = async (env = {}) => {
  const videoUrls = parseTiktokVideoUrls(env);
  const settled = await Promise.allSettled(
    videoUrls.map(async (videoUrl, index) => {
      const oEmbed = await resolveTiktokOEmbed(videoUrl);
      const channel = extractTiktokHandleFromUrl(videoUrl);
      const title = oEmbed?.title || `TikTok · ${channel}`;
      return {
        id: `tiktok-video-${videoUrl}`.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 80),
        title,
        summary:
          oEmbed?.authorName
            ? `Vídeo recente de ${oEmbed.authorName} na sua base de criadores.`
            : 'Vídeo recente da sua base de criadores no TikTok.',
        url: videoUrl,
        thumbnail: oEmbed?.thumbnail || null,
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
    .flatMap((result) => (result.status === 'fulfilled' ? [result.value] : []))
    .sort((a, b) => Number(a.rank || 0) - Number(b.rank || 0))
    .map(({ rank, ...item }) => item)
    .slice(0, 10);
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

const parseDiscordChannelsUrl = (value = '') => {
  const match = String(value || '').match(/discord\.com\/channels\/(\d+)\/(\d+)(?:\/(?:threads\/)?(\d+))?/i);
  if (!match) return null;
  return {
    guildId: match[1],
    channelId: match[2],
    threadId: match[3] || '',
    activeChannelId: match[3] || match[2],
  };
};

const parseDiscordCommunityUrls = (env = {}) => {
  const raw = String(
    env?.DISCORD_COMMUNITY_URLS || env?.DISCORD_CHANNEL_URLS || env?.DISCORD_THREAD_URLS || ''
  ).trim();
  const envUrls = raw ? parseCommaSeparated(raw) : [];
  return toUniqueList(
    [...envUrls, ...FALLBACK_DISCORD_COMMUNITY_URLS].filter((url) =>
      /^https?:\/\/(www\.)?discord\.com\/channels\//i.test(url)
    ),
    10
  );
};

const fetchDiscordItems = async (env = {}) => {
  const communityUrls = parseDiscordCommunityUrls(env);
  if (communityUrls.length === 0) return [];

  const settled = await Promise.allSettled(
    communityUrls.map(async (communityUrl, index) => {
      const parsed = parseDiscordChannelsUrl(communityUrl);
      if (!parsed) return null;

      const widgetResponse = await fetchWithTimeout(
        `https://discord.com/api/guilds/${parsed.guildId}/widget.json`,
        {
          headers: { accept: 'application/json' },
        },
        6500
      );
      if (!widgetResponse.ok) return null;

      const payload = await widgetResponse.json();
      const channels = Array.isArray(payload?.channels) ? payload.channels : [];
      const channelName = safeText(
        channels.find((channel) => String(channel?.id || '') === parsed.channelId)?.name || '',
        90
      );
      const serverName = safeText(payload?.name || `Servidor ${parsed.guildId}`, 120);
      const onlineCount = Number(payload?.presence_count || 0);

      return {
        id: `discord-community-${parsed.guildId}-${parsed.activeChannelId}-${index}`,
        title: `Discord · ${serverName}`,
        summary: `${onlineCount > 0 ? `${onlineCount} online agora` : 'Comunidade ativa'}${
          channelName ? ` · #${channelName}` : ''
        }`,
        url: communityUrl,
        thumbnail: null,
        tags: ['Discord', 'Comunidade', 'Live'],
        category: 'Software',
        isLive: true,
        metricLabel: onlineCount > 0 ? `${onlineCount} membros online` : 'Atualizado agora',
        caseLabel: 'Ver no Radar',
        channel: channelName ? `#${channelName}` : '@discord',
      };
    })
  );

  return settled.flatMap((result) => (result.status === 'fulfilled' && result.value ? [result.value] : []));
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
