import { supabaseAdmin } from '@/lib/supabase-admin';

type Plataforma = 'youtube' | 'twitch' | 'podcast';

type CriadorRadar = {
  id: string;
  nome: string | null;
  plataforma: string | null;
  canal_id: string | null;
  canal_url: string | null;
  rss_url: string | null;
  ativo: boolean | null;
};

type ConteudoRadarUpsert = {
  criador_id: string;
  tipo: string;
  titulo: string;
  url: string;
  thumbnail: string | null;
  descricao: string | null;
  publicado_em: string | null;
};

type BuscarConteudosResultado = {
  youtube: number;
  twitch: number;
  podcast: number;
  total: number;
  criadores_processados: number;
};

const FETCH_TIMEOUT_MS = 12000;
const YOUTUBE_LIMIT = 5;
const PODCAST_LIMIT = 3;

const decodeHtml = (value: string) =>
  value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number.parseInt(code, 10)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) =>
      String.fromCharCode(Number.parseInt(code, 16))
    );

const stripHtml = (value: string) =>
  decodeHtml(value).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

const parseIsoDate = (value: string | null | undefined) => {
  const input = String(value || '').trim();
  if (!input) return null;
  const parsed = Date.parse(input);
  if (Number.isNaN(parsed)) return null;
  return new Date(parsed).toISOString();
};

const fetchText = async (url: string) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        accept: 'application/xml,text/xml,application/rss+xml,application/atom+xml,text/plain,*/*',
      },
    });
    if (!response.ok) return '';
    return await response.text();
  } finally {
    clearTimeout(timeout);
  }
};

const fetchJson = async (url: string, init?: RequestInit) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    if (!response.ok) return null;
    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
};

const pickFirstMatch = (block: string, patterns: RegExp[]) => {
  for (const pattern of patterns) {
    const match = block.match(pattern);
    if (match?.[1]) return stripHtml(match[1]);
  }
  return '';
};

const pickAttribute = (block: string, patterns: RegExp[]) => {
  for (const pattern of patterns) {
    const match = block.match(pattern);
    if (match?.[1]) return decodeHtml(match[1]).trim();
  }
  return '';
};

const extractBlocks = (xml: string, tagName: string) => {
  const regex = new RegExp(`<${tagName}[\\s\\S]*?<\\/${tagName}>`, 'gi');
  return [...xml.matchAll(regex)].map((match) => match[0]);
};

const deriveYoutubeChannelId = (criador: CriadorRadar) => {
  const fromChannelId = String(criador.canal_id || '').trim();
  if (/^UC[a-zA-Z0-9_-]{10,}$/i.test(fromChannelId)) return fromChannelId;

  const rss = String(criador.rss_url || '').trim();
  if (rss) {
    try {
      const parsed = new URL(rss);
      const queryId = parsed.searchParams.get('channel_id');
      if (queryId && /^UC[a-zA-Z0-9_-]{10,}$/i.test(queryId)) return queryId;
    } catch {
      // ignore and fallback below
    }
    const idMatch = rss.match(/channel_id=([a-zA-Z0-9_-]+)/i);
    if (idMatch?.[1] && /^UC[a-zA-Z0-9_-]{10,}$/i.test(idMatch[1])) return idMatch[1];
  }

  return '';
};

const parseYoutubeEntries = (xml: string, criadorId: string) => {
  const entries = extractBlocks(xml, 'entry');
  return entries
    .map((entry) => {
      const title = pickFirstMatch(entry, [/<title[^>]*>([\s\S]*?)<\/title>/i]);
      const videoId = pickFirstMatch(entry, [/<yt:videoId[^>]*>([\s\S]*?)<\/yt:videoId>/i]);
      const url = pickAttribute(entry, [/<link[^>]+href=['"]([^'"]+)['"][^>]*>/i]);
      const publishedAt = parseIsoDate(
        pickFirstMatch(entry, [
          /<published[^>]*>([\s\S]*?)<\/published>/i,
          /<updated[^>]*>([\s\S]*?)<\/updated>/i,
        ])
      );
      const thumbnail = pickAttribute(entry, [
        /<media:thumbnail[^>]+url=['"]([^'"]+)['"][^>]*>/i,
      ]);
      const description = pickFirstMatch(entry, [
        /<media:description[^>]*>([\s\S]*?)<\/media:description>/i,
        /<summary[^>]*>([\s\S]*?)<\/summary>/i,
      ]);

      const finalUrl = url || (videoId ? `https://www.youtube.com/watch?v=${videoId}` : '');
      const finalThumbnail =
        thumbnail || (videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : null);

      if (!title || !finalUrl) return null;
      return {
        criador_id: criadorId,
        tipo: 'video',
        titulo: title.slice(0, 300),
        url: finalUrl,
        thumbnail: finalThumbnail,
        descricao: description ? description.slice(0, 4000) : null,
        publicado_em: publishedAt,
      } satisfies ConteudoRadarUpsert;
    })
    .filter(Boolean)
    .slice(0, YOUTUBE_LIMIT) as ConteudoRadarUpsert[];
};

const parsePodcastItems = (xml: string, criadorId: string) => {
  const items = extractBlocks(xml, 'item');
  return items
    .map((item) => {
      const title = pickFirstMatch(item, [/<title[^>]*>([\s\S]*?)<\/title>/i]);
      const link = pickFirstMatch(item, [/<link[^>]*>([\s\S]*?)<\/link>/i]);
      const enclosureUrl = pickAttribute(item, [
        /<enclosure[^>]+url=['"]([^'"]+)['"][^>]*>/i,
      ]);
      const guid = pickFirstMatch(item, [/<guid[^>]*>([\s\S]*?)<\/guid>/i]);
      const url = enclosureUrl || link || guid;
      const publishedAt = parseIsoDate(
        pickFirstMatch(item, [
          /<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i,
          /<published[^>]*>([\s\S]*?)<\/published>/i,
        ])
      );
      const thumbnail = pickAttribute(item, [
        /<itunes:image[^>]+href=['"]([^'"]+)['"][^>]*>/i,
        /<media:thumbnail[^>]+url=['"]([^'"]+)['"][^>]*>/i,
        /<media:content[^>]+url=['"]([^'"]+)['"][^>]*>/i,
      ]);
      const description = pickFirstMatch(item, [
        /<description[^>]*>([\s\S]*?)<\/description>/i,
        /<content:encoded[^>]*>([\s\S]*?)<\/content:encoded>/i,
      ]);

      if (!title || !url) return null;
      return {
        criador_id: criadorId,
        tipo: 'podcast',
        titulo: title.slice(0, 300),
        url: url.trim(),
        thumbnail: thumbnail || null,
        descricao: description ? description.slice(0, 4000) : null,
        publicado_em: publishedAt,
      } satisfies ConteudoRadarUpsert;
    })
    .filter(Boolean)
    .slice(0, PODCAST_LIMIT) as ConteudoRadarUpsert[];
};

const extractTwitchLogin = (criador: CriadorRadar) => {
  const rawCanalId = String(criador.canal_id || '').trim();
  if (/^[a-z0-9_]{2,25}$/i.test(rawCanalId)) return rawCanalId.toLowerCase();

  const rawUrl = String(criador.canal_url || '').trim();
  if (!rawUrl) return '';
  const fromUrl = rawUrl.match(/twitch\.tv\/([a-z0-9_]{2,25})/i)?.[1];
  return fromUrl ? fromUrl.toLowerCase() : '';
};

const parseTwitchStream = (payload: unknown, criador: CriadorRadar) => {
  const stream =
    payload &&
    typeof payload === 'object' &&
    Array.isArray((payload as { data?: unknown[] }).data) &&
    (payload as { data: unknown[] }).data.length > 0
      ? (payload as { data: Array<Record<string, unknown>> }).data[0]
      : null;

  if (!stream) return null;

  const login = extractTwitchLogin(criador);
  const streamId = String(stream.id || '').trim();
  const title = stripHtml(String(stream.title || 'Live na Twitch'));
  const gameName = stripHtml(String(stream.game_name || ''));
  const viewerCount = Number(stream.viewer_count || 0);
  const thumbnailTemplate = String(stream.thumbnail_url || '').trim();
  const thumbnail = thumbnailTemplate
    ? thumbnailTemplate
        .replace('{width}', '640')
        .replace('{height}', '360')
        .concat(`?t=${Date.now()}`)
    : null;

  return {
    criador_id: criador.id,
    tipo: 'live',
    titulo: title.slice(0, 300) || `Live de ${criador.nome || login || 'criador'}`,
    url: String(criador.canal_url || (login ? `https://www.twitch.tv/${login}` : '')).trim(),
    thumbnail,
    descricao: stripHtml(
      `${gameName}${viewerCount > 0 ? ` · ${viewerCount} espectadores` : ''}${
        streamId ? ` · live ${streamId}` : ''
      }`
    ).slice(0, 4000),
    publicado_em: new Date().toISOString(),
  } satisfies ConteudoRadarUpsert;
};

const upsertConteudos = async (items: ConteudoRadarUpsert[]) => {
  if (items.length === 0) return 0;
  const { error } = await supabaseAdmin.from('conteudos_radar').upsert(items, {
    onConflict: 'url',
    ignoreDuplicates: false,
  });
  if (error) {
    throw error;
  }
  return items.length;
};

export async function buscarConteudosCriadores(): Promise<BuscarConteudosResultado> {
  const { data, error } = await supabaseAdmin
    .from('criadores_radar')
    .select('id,nome,plataforma,canal_id,canal_url,rss_url,ativo')
    .eq('ativo', true);

  if (error) {
    throw error;
  }

  const criadores = (data || []) as CriadorRadar[];
  const resultado: BuscarConteudosResultado = {
    youtube: 0,
    twitch: 0,
    podcast: 0,
    total: 0,
    criadores_processados: criadores.length,
  };

  const twitchClientId = String(process.env.TWITCH_CLIENT_ID || '').trim();
  const twitchAccessToken = String(process.env.TWITCH_ACCESS_TOKEN || '').trim();

  for (const criador of criadores) {
    const plataforma = String(criador.plataforma || '').trim().toLowerCase() as Plataforma;

    if (plataforma === 'youtube') {
      const channelId = deriveYoutubeChannelId(criador);
      if (!channelId) continue;
      const xml = await fetchText(
        `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channelId)}`
      );
      if (!xml) continue;
      const items = parseYoutubeEntries(xml, criador.id);
      const saved = await upsertConteudos(items);
      resultado.youtube += saved;
      resultado.total += saved;
      continue;
    }

    if (plataforma === 'twitch') {
      if (!twitchClientId || !twitchAccessToken) continue;
      const login = extractTwitchLogin(criador);
      if (!login) continue;

      const payload = await fetchJson(
        `https://api.twitch.tv/helix/streams?user_login=${encodeURIComponent(login)}`,
        {
          method: 'GET',
          headers: {
            'Client-Id': twitchClientId,
            Authorization: `Bearer ${twitchAccessToken}`,
            accept: 'application/json',
          },
        }
      );
      if (!payload) continue;
      const item = parseTwitchStream(payload, criador);
      if (!item) continue;

      const saved = await upsertConteudos([item]);
      resultado.twitch += saved;
      resultado.total += saved;
      continue;
    }

    if (plataforma === 'podcast') {
      const rssUrl = String(criador.rss_url || '').trim();
      if (!rssUrl) continue;
      const xml = await fetchText(rssUrl);
      if (!xml) continue;

      const items = parsePodcastItems(xml, criador.id);
      const saved = await upsertConteudos(items);
      resultado.podcast += saved;
      resultado.total += saved;
    }
  }

  return resultado;
}
