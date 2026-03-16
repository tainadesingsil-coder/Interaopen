import { supabaseAdmin } from '@/lib/supabase-admin';

type ConteudoInsert = {
  criador_id: string | null;
  tipo: 'live';
  titulo: string;
  url: string;
  thumbnail: string | null;
  descricao: string | null;
  publicado_em: string | null;
};

type TwitchResumo = {
  consultas: number;
  lives_detectadas: number;
  lives_salvas: number;
};

const TOPIC_TERMS = ['ia', 'tecnologia', 'marketing', 'jogos', 'cs2', 'valorant'] as const;
const ALLOWED_LANGS = new Set(['pt', 'pt-br', 'en', 'en-us', 'en-gb']);
const FETCH_TIMEOUT_MS = 12000;

const stripHtml = (value: string) =>
  String(value || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const fetchJson = async (url: string, init: RequestInit) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
};

const includesTopic = (text: string) => {
  const haystack = String(text || '').toLowerCase();
  return TOPIC_TERMS.some((term) => haystack.includes(term));
};

const buildHeaders = () => {
  const clientId = String(process.env.TWITCH_CLIENT_ID || '').trim();
  const accessToken = String(process.env.TWITCH_ACCESS_TOKEN || '').trim();
  if (!clientId || !accessToken) return null;
  return {
    'Client-Id': clientId,
    Authorization: `Bearer ${accessToken}`,
    accept: 'application/json',
  };
};

const normalizeLogin = (value: string) => String(value || '').trim().toLowerCase();

const mapStreamToContent = (stream: Record<string, unknown>): ConteudoInsert | null => {
  const login = normalizeLogin(String(stream.user_login || ''));
  if (!login) return null;

  const title = stripHtml(String(stream.title || 'Live na Twitch'));
  const game = stripHtml(String(stream.game_name || ''));
  const lang = normalizeLogin(String(stream.language || ''));
  const tags = Array.isArray(stream.tags) ? stream.tags.map((tag) => String(tag || '').toLowerCase()) : [];
  const relevanceText = `${title} ${game} ${tags.join(' ')}`.toLowerCase();
  if (!includesTopic(relevanceText)) return null;
  if (lang && !ALLOWED_LANGS.has(lang)) return null;

  const thumbnailTemplate = String(stream.thumbnail_url || '').trim();
  const thumbnail = thumbnailTemplate
    ? thumbnailTemplate
        .replace('{width}', '640')
        .replace('{height}', '360')
        .concat(`?t=${Date.now()}`)
    : null;

  const viewers = Number(stream.viewer_count || 0);
  const startedAt = String(stream.started_at || '').trim();

  return {
    criador_id: null,
    tipo: 'live',
    titulo: title.slice(0, 300),
    url: `https://www.twitch.tv/${login}`,
    thumbnail,
    descricao: stripHtml(`${game}${viewers > 0 ? ` · ${viewers} espectadores` : ''}`).slice(0, 4000) || null,
    publicado_em: startedAt || new Date().toISOString(),
  };
};

const fetchStreamsByLanguage = async (
  headers: Record<string, string>,
  language: 'pt' | 'en'
): Promise<Record<string, unknown>[]> => {
  const endpoint = new URL('https://api.twitch.tv/helix/streams');
  endpoint.searchParams.set('first', '100');
  endpoint.searchParams.set('language', language);
  const payload = await fetchJson(endpoint.toString(), { method: 'GET', headers });
  const data = (payload as { data?: unknown[] } | null)?.data;
  return Array.isArray(data) ? (data as Record<string, unknown>[]) : [];
};

const fetchLiveChannelsByTopic = async (
  headers: Record<string, string>,
  topic: string
): Promise<Record<string, unknown>[]> => {
  const endpoint = new URL('https://api.twitch.tv/helix/search/channels');
  endpoint.searchParams.set('query', topic);
  endpoint.searchParams.set('live_only', 'true');
  endpoint.searchParams.set('first', '30');
  const payload = await fetchJson(endpoint.toString(), { method: 'GET', headers });
  const data = (payload as { data?: unknown[] } | null)?.data;
  return Array.isArray(data) ? (data as Record<string, unknown>[]) : [];
};

const mapSearchChannelToContent = (channel: Record<string, unknown>): ConteudoInsert | null => {
  const isLive = Boolean(channel.is_live);
  if (!isLive) return null;

  const login = normalizeLogin(String(channel.broadcaster_login || channel.display_name || ''));
  if (!login) return null;

  const lang = normalizeLogin(String(channel.broadcaster_language || ''));
  if (lang && !ALLOWED_LANGS.has(lang)) return null;

  const title = stripHtml(String(channel.title || 'Live na Twitch'));
  const game = stripHtml(String(channel.game_name || ''));
  const relevanceText = `${title} ${game}`.toLowerCase();
  if (!includesTopic(relevanceText)) return null;

  const thumb = String(channel.thumbnail_url || '').trim();
  const thumbnail = thumb ? `${thumb}?t=${Date.now()}` : null;

  return {
    criador_id: null,
    tipo: 'live',
    titulo: title.slice(0, 300),
    url: `https://www.twitch.tv/${login}`,
    thumbnail,
    descricao: game ? game.slice(0, 4000) : null,
    publicado_em: new Date().toISOString(),
  };
};

export async function atualizarLivesTwitch(): Promise<TwitchResumo> {
  const headers = buildHeaders();
  if (!headers) {
    return { consultas: 0, lives_detectadas: 0, lives_salvas: 0 };
  }

  const [streamsPt, streamsEn, topicChannels] = await Promise.all([
    fetchStreamsByLanguage(headers, 'pt'),
    fetchStreamsByLanguage(headers, 'en'),
    Promise.all(TOPIC_TERMS.map((topic) => fetchLiveChannelsByTopic(headers, topic))),
  ]);

  const mappedFromStreams = [...streamsPt, ...streamsEn]
    .map((stream) => mapStreamToContent(stream))
    .filter(Boolean) as ConteudoInsert[];

  const mappedFromSearch = topicChannels
    .flat()
    .map((channel) => mapSearchChannelToContent(channel))
    .filter(Boolean) as ConteudoInsert[];

  const all = [...mappedFromStreams, ...mappedFromSearch];
  const uniqueByUrl = [...new Map(all.map((item) => [item.url, item])).values()];

  if (uniqueByUrl.length === 0) {
    return {
      consultas: 2 + TOPIC_TERMS.length,
      lives_detectadas: 0,
      lives_salvas: 0,
    };
  }

  const { error } = await supabaseAdmin.from('conteudos_radar').upsert(uniqueByUrl, {
    onConflict: 'url',
    ignoreDuplicates: false,
  });
  if (error) throw error;

  return {
    consultas: 2 + TOPIC_TERMS.length,
    lives_detectadas: uniqueByUrl.length,
    lives_salvas: uniqueByUrl.length,
  };
}
