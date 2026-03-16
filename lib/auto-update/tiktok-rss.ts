import { supabaseAdmin } from '@/lib/supabase-admin';

type CriadorTikTok = {
  id: string;
  nome: string | null;
  canal_id: string | null;
  canal_url: string | null;
  rss_url: string | null;
};

type ConteudoTikTok = {
  criador_id: string;
  tipo: 'video';
  titulo: string;
  url: string;
  thumbnail: string | null;
  descricao: string | null;
  publicado_em: string | null;
  plataforma: 'tiktok';
};

export type TikTokRssResumo = {
  criadores_processados: number;
  videos_lidos: number;
  videos_salvos: number;
};

const FETCH_TIMEOUT_MS = 12000;
const VIDEOS_PER_CREATOR = 5;
const FORCED_RSS_CREATORS = [
  'islamsousa',
  'jornadatop',
  'gabrieladamuchi',
  'izabela',
  'izabela.anholett',
] as const;

const stripHtml = (value: string) =>
  String(value || '')
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const htmlDecode = (value = '') =>
  String(value || '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_match, code) => String.fromCharCode(Number.parseInt(code, 10)))
    .replace(/&#x([0-9a-f]+);/gi, (_match, code) => String.fromCharCode(Number.parseInt(code, 16)));

const toIsoDate = (value: unknown) => {
  const text = String(value || '').trim();
  if (!text) return null;
  const parsed = Date.parse(text);
  if (Number.isNaN(parsed)) return null;
  return new Date(parsed).toISOString();
};

const normalizeTikTokUrl = (value = '') => {
  try {
    const parsed = new URL(String(value || '').trim());
    parsed.hash = '';
    parsed.search = '';
    return `${parsed.origin}${parsed.pathname}`.replace(/\/+$/, '');
  } catch {
    return String(value || '').trim();
  }
};

const extractTagValue = (block = '', tag = '') => {
  if (!tag) return '';
  const direct = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'))?.[1];
  if (direct) return htmlDecode(stripHtml(direct));
  return '';
};

const extractImageFromBlock = (block = '') => {
  const mediaContent = block.match(/<media:content[^>]+url="([^"]+)"/i)?.[1];
  if (mediaContent) return mediaContent;
  const mediaThumbnail = block.match(/<media:thumbnail[^>]+url="([^"]+)"/i)?.[1];
  if (mediaThumbnail) return mediaThumbnail;
  const enclosure = block.match(/<enclosure[^>]+url="([^"]+)"/i)?.[1];
  if (enclosure) return enclosure;
  const img = block.match(/<img[^>]+src="([^"]+)"/i)?.[1];
  if (img) return img;
  return null;
};

const parseRssEntries = (xml = '') => {
  const itemBlocks = [...xml.matchAll(/<item[\s\S]*?<\/item>/gi)].map((match) => match[0]);
  const entryBlocks = [...xml.matchAll(/<entry[\s\S]*?<\/entry>/gi)].map((match) => match[0]);
  const blocks = itemBlocks.length > 0 ? itemBlocks : entryBlocks;

  return blocks
    .map((block) => {
      const title = extractTagValue(block, 'title');
      const description = extractTagValue(block, 'description') || extractTagValue(block, 'summary');
      const link =
        extractTagValue(block, 'link') ||
        block.match(/<link[^>]+href="([^"]+)"/i)?.[1] ||
        extractTagValue(block, 'id');
      const publishedAt =
        toIsoDate(extractTagValue(block, 'pubDate')) ||
        toIsoDate(extractTagValue(block, 'published')) ||
        toIsoDate(extractTagValue(block, 'updated'));
      return {
        title: title || 'Vídeo TikTok',
        description: description || title || 'Vídeo recente do TikTok.',
        url: normalizeTikTokUrl(String(link || '').trim()),
        thumbnail: extractImageFromBlock(block),
        publishedAt,
      };
    })
    .filter((entry) => !!entry.url && /tiktok\.com/i.test(entry.url));
};

const fetchText = async (url: string) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        accept: 'application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8',
        'user-agent':
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
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

const extractTikTokUsername = (criador: CriadorTikTok) => {
  const fromCanalId = String(criador.canal_id || '').trim().replace(/^@+/, '');
  if (/^[a-z0-9._]{2,40}$/i.test(fromCanalId)) return fromCanalId.toLowerCase();

  const fromUrl = String(criador.canal_url || '').match(/tiktok\.com\/@([a-z0-9._]{2,40})/i)?.[1];
  if (fromUrl) return fromUrl.toLowerCase();

  const fromNome = String(criador.nome || '').trim().replace(/^@+/, '');
  if (/^[a-z0-9._]{2,40}$/i.test(fromNome)) return fromNome.toLowerCase();

  return '';
};

const matchesForcedUsername = (criador: CriadorTikTok, username: string) => {
  const normalized = username.toLowerCase();
  const values = [
    String(criador.canal_id || '').toLowerCase(),
    String(criador.canal_url || '').toLowerCase(),
    String(criador.nome || '').toLowerCase(),
  ];
  return values.some((value) => value.includes(normalized));
};

const upsertTikTokItems = async (items: ConteudoTikTok[]) => {
  if (items.length === 0) return 0;

  try {
    const { error } = await supabaseAdmin.from('conteudos_radar').upsert(items as unknown as object[], {
      onConflict: 'url',
      ignoreDuplicates: false,
    });
    if (error) throw error;
    return items.length;
  } catch (error) {
    const message = String((error as { message?: string })?.message || '').toLowerCase();
    const plataformaColumnMissing =
      message.includes('plataforma') &&
      (message.includes('could not find') || message.includes('schema cache') || message.includes('column'));
    if (!plataformaColumnMissing) throw error;

    const withoutPlataforma = items.map(({ plataforma: _ignored, ...rest }) => rest);
    const { error: retryError } = await supabaseAdmin
      .from('conteudos_radar')
      .upsert(withoutPlataforma as object[], {
        onConflict: 'url',
        ignoreDuplicates: false,
      });
    if (retryError) throw retryError;
    return withoutPlataforma.length;
  }
};

const buildRssUrls = (username: string, explicitRssUrl = '') => {
  const cleanUser = String(username || '').trim().replace(/^@+/, '').toLowerCase();
  const primary = `https://www.tiktok.com/@${cleanUser}/rss`;
  const fallback = `https://rss.app/feeds/${cleanUser}_tiktok.xml`;
  const fromCreator = String(explicitRssUrl || '').trim();
  return [fromCreator, primary, fallback].filter(Boolean);
};

export async function atualizarTikTokRssAutomatico(): Promise<TikTokRssResumo> {
  const { data, error } = await supabaseAdmin
    .from('criadores_radar')
    .select('id,nome,canal_id,canal_url,rss_url')
    .eq('ativo', true)
    .eq('plataforma', 'tiktok');
  if (error) throw error;

  const criadores = (data || []) as CriadorTikTok[];
  const creatorsByUsername = new Map<string, CriadorTikTok>();
  criadores.forEach((criador) => {
    const username = extractTikTokUsername(criador);
    if (username) creatorsByUsername.set(username, criador);
  });

  // Force canonical rss_url values for specific creators requested by user.
  for (const forcedUsername of FORCED_RSS_CREATORS) {
    const creator =
      creatorsByUsername.get(forcedUsername) ||
      criadores.find((item) => matchesForcedUsername(item, forcedUsername));
    if (!creator) continue;
    const canonical = `https://www.tiktok.com/@${forcedUsername}/rss`;
    if (String(creator.rss_url || '').trim() === canonical) continue;
    await supabaseAdmin.from('criadores_radar').update({ rss_url: canonical }).eq('id', creator.id);
  }

  let videosLidos = 0;
  const allItems: ConteudoTikTok[] = [];

  for (const criador of criadores) {
    const username = extractTikTokUsername(criador);
    if (!username) continue;

    const rssCandidates = buildRssUrls(username, criador.rss_url || '');
    let parsedItems: Array<{
      title: string;
      description: string;
      url: string;
      thumbnail: string | null;
      publishedAt: string | null;
    }> = [];

    for (const endpoint of rssCandidates) {
      const xml = await fetchText(endpoint);
      if (!xml) continue;
      const parsed = parseRssEntries(xml);
      if (parsed.length > 0) {
        parsedItems = parsed;
        break;
      }
    }

    const topItems = parsedItems.slice(0, VIDEOS_PER_CREATOR);
    videosLidos += topItems.length;
    allItems.push(
      ...topItems.map((item) => ({
        criador_id: criador.id,
        tipo: 'video',
        titulo: stripHtml(item.title).slice(0, 300) || `Vídeo de @${username}`,
        url: item.url,
        thumbnail: item.thumbnail ? String(item.thumbnail).trim() : null,
        descricao: stripHtml(item.description).slice(0, 4000) || null,
        publicado_em: item.publishedAt,
        plataforma: 'tiktok',
      }) satisfies ConteudoTikTok)
    );
  }

  const uniqueItems = [...new Map(allItems.map((item) => [item.url, item])).values()];
  const videosSalvos = await upsertTikTokItems(uniqueItems);

  return {
    criadores_processados: criadores.length,
    videos_lidos: videosLidos,
    videos_salvos: videosSalvos,
  };
}
