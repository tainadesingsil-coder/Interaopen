import { supabaseAdmin } from '@/lib/supabase-admin';

type CriadorPodcast = {
  id: string;
  rss_url: string | null;
};

type ConteudoInsert = {
  criador_id: string | null;
  tipo: 'podcast';
  titulo: string;
  url: string;
  thumbnail: string | null;
  descricao: string | null;
  publicado_em: string | null;
};

type PodcastsResumo = {
  feeds_processados: number;
  episodios_salvos: number;
};

const PODCAST_THEMES = ['ia', 'marketing', 'tecnologia'] as const;
const MAX_FEEDS_DISCOVERED = 12;
const EPISODES_PER_FEED = 3;
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

const normalizeUrl = (value: string) => {
  const raw = String(value || '').trim();
  if (!raw) return '';
  try {
    const parsed = new URL(raw);
    parsed.hash = '';
    return `${parsed.origin}${parsed.pathname}${parsed.search}`;
  } catch {
    return raw;
  }
};

const pickTagValue = (block: string, tags: string[]) => {
  for (const tag of tags) {
    const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
    if (match?.[1]) return stripHtml(match[1]);
  }
  return '';
};

const pickAttribute = (block: string, regex: RegExp) => {
  const match = block.match(regex);
  return match?.[1] ? decodeHtml(match[1]).trim() : '';
};

const parsePodcastFeed = (xml: string, criadorId: string | null): ConteudoInsert[] => {
  const channelThumbnail = pickAttribute(
    xml,
    /<itunes:image[^>]+href=['"]([^'"]+)['"][^>]*\/?>/i
  );
  const items = [...xml.matchAll(/<item[\s\S]*?<\/item>/gi)].map((match) => match[0]);

  return items
    .slice(0, EPISODES_PER_FEED)
    .map((item) => {
      const titulo = pickTagValue(item, ['title']);
      const descricao = pickTagValue(item, ['description', 'content:encoded']);
      const enclosureUrl = pickAttribute(item, /<enclosure[^>]+url=['"]([^'"]+)['"][^>]*\/?>/i);
      const link = pickTagValue(item, ['link']);
      const guid = pickTagValue(item, ['guid']);
      const url = normalizeUrl(enclosureUrl || link || guid);
      const thumbnail =
        pickAttribute(item, /<itunes:image[^>]+href=['"]([^'"]+)['"][^>]*\/?>/i) ||
        pickAttribute(item, /<media:thumbnail[^>]+url=['"]([^'"]+)['"][^>]*\/?>/i) ||
        channelThumbnail ||
        null;
      const publicado = pickTagValue(item, ['pubDate', 'published', 'updated']);

      if (!titulo || !url) return null;
      return {
        criador_id: criadorId,
        tipo: 'podcast',
        titulo: titulo.slice(0, 300),
        url,
        thumbnail,
        descricao: descricao ? descricao.slice(0, 4000) : null,
        publicado_em: toIsoDate(publicado),
      } satisfies ConteudoInsert;
    })
    .filter(Boolean) as ConteudoInsert[];
};

const fetchFixedPodcastFeeds = async () => {
  const { data, error } = await supabaseAdmin
    .from('criadores_radar')
    .select('id,rss_url')
    .eq('ativo', true)
    .eq('plataforma', 'podcast');
  if (error) throw error;

  const rows = (data || []) as CriadorPodcast[];
  return rows
    .map((row) => ({
      criador_id: row.id,
      rss_url: normalizeUrl(String(row.rss_url || '')),
    }))
    .filter((row) => row.rss_url);
};

const discoverPodcastFeeds = async () => {
  const discovered = await Promise.all(
    PODCAST_THEMES.map(async (theme) => {
      const endpoint = new URL('https://itunes.apple.com/search');
      endpoint.searchParams.set('media', 'podcast');
      endpoint.searchParams.set('entity', 'podcast');
      endpoint.searchParams.set('country', 'BR');
      endpoint.searchParams.set('lang', 'pt_br');
      endpoint.searchParams.set('limit', '20');
      endpoint.searchParams.set('term', theme);
      const payload = await fetchJson(endpoint.toString());
      const results = (payload as { results?: unknown[] } | null)?.results;
      if (!Array.isArray(results)) return [] as string[];
      return results
        .map((result) => normalizeUrl(String((result as Record<string, unknown>).feedUrl || '')))
        .filter(Boolean);
    })
  );
  return [...new Set(discovered.flat())].slice(0, MAX_FEEDS_DISCOVERED);
};

export async function atualizarPodcastsAutomaticos(): Promise<PodcastsResumo> {
  const fixedFeeds = await fetchFixedPodcastFeeds();
  const discoveredFeeds = await discoverPodcastFeeds();

  const allFeeds = [
    ...fixedFeeds.map((feed) => ({ ...feed, discovered: false })),
    ...discoveredFeeds.map((url) => ({ criador_id: null, rss_url: url, discovered: true })),
  ];
  const uniqueFeeds = [
    ...new Map(
      allFeeds.map((feed) => [feed.rss_url, { criador_id: feed.criador_id, rss_url: feed.rss_url }])
    ).values(),
  ];

  const parsedItemsByFeed = await Promise.all(
    uniqueFeeds.map(async (feed) => {
      const xml = await fetchText(feed.rss_url);
      if (!xml) return [] as ConteudoInsert[];
      return parsePodcastFeed(xml, feed.criador_id);
    })
  );

  const allItems = parsedItemsByFeed.flat();
  if (allItems.length === 0) {
    return {
      feeds_processados: uniqueFeeds.length,
      episodios_salvos: 0,
    };
  }

  const uniqueByUrl = [...new Map(allItems.map((item) => [item.url, item])).values()];
  const { error } = await supabaseAdmin.from('conteudos_radar').upsert(uniqueByUrl, {
    onConflict: 'url',
    ignoreDuplicates: false,
  });
  if (error) throw error;

  return {
    feeds_processados: uniqueFeeds.length,
    episodios_salvos: uniqueByUrl.length,
  };
}
