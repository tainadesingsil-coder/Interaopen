import { supabaseAdmin } from '@/lib/supabase-admin';

type ConteudoRadarInsert = {
  criador_id: string | null;
  tipo: 'noticia';
  titulo: string;
  url: string;
  thumbnail: string | null;
  descricao: string | null;
  publicado_em: string | null;
};

type NoticiasResumo = {
  fontes: number;
  itens_lidos: number;
  itens_salvos: number;
};

const NEWS_FEEDS = [
  { nome: 'MIT Technology Review', url: 'https://feeds.feedburner.com/mit-tech-review' },
  { nome: 'TechCrunch AI', url: 'https://techcrunch.com/feed' },
  { nome: 'The Verge', url: 'https://www.theverge.com/rss/index.xml' },
  { nome: 'Wired', url: 'https://www.wired.com/feed/rss' },
  { nome: 'InfoMoney Tecnologia', url: 'https://www.infomoney.com.br/feed' },
  { nome: 'Canaltech', url: 'https://canaltech.com.br/rss' },
] as const;

const MAX_ITEMS_PER_FEED = 30;
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

const extractBlocks = (xml: string) => {
  const items = [...xml.matchAll(/<item[\s\S]*?<\/item>/gi)].map((match) => match[0]);
  if (items.length > 0) return items;
  return [...xml.matchAll(/<entry[\s\S]*?<\/entry>/gi)].map((match) => match[0]);
};

const pickTagValue = (block: string, tags: string[]) => {
  for (const tag of tags) {
    const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
    if (match?.[1]) return stripHtml(match[1]);
  }
  return '';
};

const pickLink = (block: string) => {
  const directLink = block.match(/<link[^>]*>([\s\S]*?)<\/link>/i)?.[1];
  if (directLink) return stripHtml(directLink);

  const atomHref = block.match(/<link[^>]+href=['"]([^'"]+)['"][^>]*\/?>/i)?.[1];
  if (atomHref) return decodeHtml(atomHref).trim();

  const guid = block.match(/<guid[^>]*>([\s\S]*?)<\/guid>/i)?.[1];
  if (guid) return stripHtml(guid);

  return '';
};

const pickThumbnail = (block: string) => {
  const mediaThumbnail = block.match(/<media:thumbnail[^>]+url=['"]([^'"]+)['"][^>]*\/?>/i)?.[1];
  if (mediaThumbnail) return decodeHtml(mediaThumbnail).trim();

  const mediaContent = block.match(/<media:content[^>]+url=['"]([^'"]+)['"][^>]*\/?>/i)?.[1];
  if (mediaContent) return decodeHtml(mediaContent).trim();

  const enclosure = block.match(
    /<enclosure[^>]+url=['"]([^'"]+)['"][^>]+type=['"]image\/[^'"]+['"][^>]*\/?>/i
  )?.[1];
  if (enclosure) return decodeHtml(enclosure).trim();

  const imageTag = block.match(/<img[^>]+src=['"]([^'"]+)['"][^>]*\/?>/i)?.[1];
  if (imageTag) return decodeHtml(imageTag).trim();

  return null;
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

const parseFeed = (xml: string): ConteudoRadarInsert[] =>
  extractBlocks(xml)
    .slice(0, MAX_ITEMS_PER_FEED)
    .map((block) => {
      const titulo = pickTagValue(block, ['title']);
      const url = pickLink(block);
      const descricao = pickTagValue(block, ['description', 'summary', 'content:encoded']);
      const publicado = pickTagValue(block, ['pubDate', 'published', 'updated']);
      const thumbnail = pickThumbnail(block);

      if (!titulo || !url) return null;
      return {
        criador_id: null,
        tipo: 'noticia',
        titulo: titulo.slice(0, 300),
        url,
        thumbnail,
        descricao: descricao ? descricao.slice(0, 4000) : null,
        publicado_em: toIsoDate(publicado),
      } satisfies ConteudoRadarInsert;
    })
    .filter(Boolean) as ConteudoRadarInsert[];

export async function atualizarNoticiasAutomaticas(): Promise<NoticiasResumo> {
  const feeds = await Promise.all(
    NEWS_FEEDS.map(async (feed) => {
      const xml = await fetchText(feed.url);
      if (!xml) return [] as ConteudoRadarInsert[];
      return parseFeed(xml);
    })
  );

  const items = feeds.flat();
  if (items.length === 0) {
    return { fontes: NEWS_FEEDS.length, itens_lidos: 0, itens_salvos: 0 };
  }

  const uniqueByUrl = [...new Map(items.map((item) => [item.url, item])).values()];
  const { error } = await supabaseAdmin.from('conteudos_radar').upsert(uniqueByUrl, {
    onConflict: 'url',
    ignoreDuplicates: false,
  });
  if (error) throw error;

  return {
    fontes: NEWS_FEEDS.length,
    itens_lidos: uniqueByUrl.length,
    itens_salvos: uniqueByUrl.length,
  };
}
