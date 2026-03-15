import { supabaseAdmin } from '@/lib/supabase-admin';

type CriadorYoutube = {
  id: string;
  canal_id: string | null;
  canal_url: string | null;
  rss_url: string | null;
};

type ConteudoInsert = {
  criador_id: string | null;
  tipo: 'video';
  titulo: string;
  url: string;
  thumbnail: string | null;
  descricao: string | null;
  publicado_em: string | null;
};

type YoutubeResumo = {
  temas: number;
  criadores_fixos: number;
  videos_salvos: number;
};

const THEMES = ['ia', 'marketing', 'tecnologia', 'negocios', 'games'] as const;
const PER_THEME_LIMIT = 10;
const FIXED_CREATOR_LIMIT = 5;
const FETCH_TIMEOUT_MS = 12000;

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

const toIsoDate = (value: string) => {
  const raw = String(value || '').trim();
  if (!raw) return null;
  const parsed = Date.parse(raw);
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
  } catch {
    return '';
  } finally {
    clearTimeout(timeout);
  }
};

const fetchJson = async (url: string) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: { accept: 'application/json' },
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
};

const extractYoutubeChannelId = (criador: CriadorYoutube) => {
  const fromCanalId = String(criador.canal_id || '').trim();
  if (/^UC[a-zA-Z0-9_-]{10,}$/i.test(fromCanalId)) return fromCanalId;

  const fromRss = String(criador.rss_url || '').trim();
  if (fromRss) {
    try {
      const parsed = new URL(fromRss);
      const queryId = parsed.searchParams.get('channel_id');
      if (queryId && /^UC[a-zA-Z0-9_-]{10,}$/i.test(queryId)) return queryId;
    } catch {
      // ignore and fallback below
    }
    const regexId = fromRss.match(/channel_id=([a-zA-Z0-9_-]+)/i)?.[1];
    if (regexId && /^UC[a-zA-Z0-9_-]{10,}$/i.test(regexId)) return regexId;
  }

  const fromCanalUrl = String(criador.canal_url || '').trim();
  const pathId = fromCanalUrl.match(/youtube\.com\/channel\/([a-zA-Z0-9_-]+)/i)?.[1];
  if (pathId && /^UC[a-zA-Z0-9_-]{10,}$/i.test(pathId)) return pathId;

  return '';
};

const parseYoutubeFeed = (xml: string, criadorId: string | null): ConteudoInsert[] => {
  const entries = [...xml.matchAll(/<entry[\s\S]*?<\/entry>/gi)].map((match) => match[0]);
  return entries
    .slice(0, FIXED_CREATOR_LIMIT)
    .map((entry) => {
      const title = stripHtml(entry.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '');
      const videoId = stripHtml(entry.match(/<yt:videoId[^>]*>([\s\S]*?)<\/yt:videoId>/i)?.[1] || '');
      const link =
        decodeHtml(entry.match(/<link[^>]+href=['"]([^'"]+)['"][^>]*\/?>/i)?.[1] || '').trim() ||
        (videoId ? `https://www.youtube.com/watch?v=${videoId}` : '');
      const published = stripHtml(
        entry.match(/<published[^>]*>([\s\S]*?)<\/published>/i)?.[1] ||
          entry.match(/<updated[^>]*>([\s\S]*?)<\/updated>/i)?.[1] ||
          ''
      );
      const description = stripHtml(
        entry.match(/<media:description[^>]*>([\s\S]*?)<\/media:description>/i)?.[1] ||
          entry.match(/<summary[^>]*>([\s\S]*?)<\/summary>/i)?.[1] ||
          ''
      );

      const thumbnail =
        decodeHtml(
          entry.match(/<media:thumbnail[^>]+url=['"]([^'"]+)['"][^>]*\/?>/i)?.[1] || ''
        ).trim() || (videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : null);

      if (!title || !link) return null;
      return {
        criador_id: criadorId,
        tipo: 'video',
        titulo: title.slice(0, 300),
        url: link,
        thumbnail,
        descricao: description ? description.slice(0, 4000) : null,
        publicado_em: toIsoDate(published),
      } satisfies ConteudoInsert;
    })
    .filter(Boolean) as ConteudoInsert[];
};

const fetchYoutubeFromFixedCreators = async (): Promise<{ items: ConteudoInsert[]; criadores: number }> => {
  const { data, error } = await supabaseAdmin
    .from('criadores_radar')
    .select('id,canal_id,canal_url,rss_url')
    .eq('ativo', true)
    .eq('plataforma', 'youtube');

  if (error) throw error;
  const criadores = (data || []) as CriadorYoutube[];

  const feeds = await Promise.all(
    criadores.map(async (criador) => {
      const channelId = extractYoutubeChannelId(criador);
      if (!channelId) return [] as ConteudoInsert[];
      const xml = await fetchText(
        `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channelId)}`
      );
      if (!xml) return [] as ConteudoInsert[];
      return parseYoutubeFeed(xml, criador.id);
    })
  );

  return { items: feeds.flat(), criadores: criadores.length };
};

const fetchYoutubeFromThemes = async (apiKey: string): Promise<ConteudoInsert[]> => {
  const allThemeResults = await Promise.all(
    THEMES.map(async (theme) => {
      const endpoint = new URL('https://www.googleapis.com/youtube/v3/search');
      endpoint.searchParams.set('part', 'snippet');
      endpoint.searchParams.set('type', 'video');
      endpoint.searchParams.set('order', 'date');
      endpoint.searchParams.set('maxResults', String(PER_THEME_LIMIT));
      endpoint.searchParams.set('q', theme);
      endpoint.searchParams.set('relevanceLanguage', 'pt');
      endpoint.searchParams.set('key', apiKey);

      const payload = await fetchJson(endpoint.toString());
      const items = Array.isArray((payload as { items?: unknown[] } | null)?.items)
        ? ((payload as { items: Array<Record<string, unknown>> }).items || [])
        : [];

      return items
        .map((item) => {
          const idObj = (item.id || {}) as Record<string, unknown>;
          const snippet = (item.snippet || {}) as Record<string, unknown>;
          const videoId = String(idObj.videoId || '').trim();
          const title = stripHtml(String(snippet.title || ''));
          const description = stripHtml(String(snippet.description || ''));
          const publishedAt = toIsoDate(String(snippet.publishedAt || ''));
          const thumbnails = (snippet.thumbnails || {}) as Record<string, Record<string, unknown>>;
          const thumbnail = String(
            thumbnails.high?.url || thumbnails.medium?.url || thumbnails.default?.url || ''
          ).trim();
          if (!videoId || !title) return null;
          return {
            criador_id: null,
            tipo: 'video',
            titulo: title.slice(0, 300),
            url: `https://www.youtube.com/watch?v=${videoId}`,
            thumbnail: thumbnail || null,
            descricao: description ? description.slice(0, 4000) : null,
            publicado_em: publishedAt,
          } satisfies ConteudoInsert;
        })
        .filter(Boolean) as ConteudoInsert[];
    })
  );

  return allThemeResults.flat();
};

export async function atualizarYoutubeAutomatico(): Promise<YoutubeResumo> {
  const apiKey = String(process.env.YOUTUBE_API_KEY || process.env.YOUTUBE_DATA_API_KEY || '').trim();
  const fixed = await fetchYoutubeFromFixedCreators();
  const discovered = apiKey ? await fetchYoutubeFromThemes(apiKey) : [];

  const allItems = [...fixed.items, ...discovered];
  if (allItems.length === 0) {
    return {
      temas: THEMES.length,
      criadores_fixos: fixed.criadores,
      videos_salvos: 0,
    };
  }

  const uniqueByUrl = [...new Map(allItems.map((item) => [item.url, item])).values()];
  const { error } = await supabaseAdmin.from('conteudos_radar').upsert(uniqueByUrl, {
    onConflict: 'url',
    ignoreDuplicates: false,
  });
  if (error) throw error;

  return {
    temas: THEMES.length,
    criadores_fixos: fixed.criadores,
    videos_salvos: uniqueByUrl.length,
  };
}
