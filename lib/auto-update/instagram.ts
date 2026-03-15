import { supabaseAdmin } from '@/lib/supabase-admin';

type CriadorInstagram = {
  id: string;
  nome: string | null;
  canal_id: string | null;
  canal_url: string | null;
};

type ConteudoInstagram = {
  criador_id: string;
  tipo: 'post';
  titulo: string;
  url: string;
  thumbnail: string | null;
  descricao: string | null;
  publicado_em: string | null;
  plataforma: 'instagram';
};

type InstagramResumo = {
  criadores_processados: number;
  posts_lidos: number;
  posts_salvos: number;
};

const POSTS_PER_CREATOR = 5;
const FETCH_TIMEOUT_MS = 12000;

const stripHtml = (value: string) =>
  String(value || '')
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const toIsoDate = (value: unknown) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    const millis = value > 9_999_999_999 ? value : value * 1000;
    const date = new Date(millis);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }

  const text = String(value || '').trim();
  if (!text) return null;
  const asNumber = Number(text);
  if (Number.isFinite(asNumber)) return toIsoDate(asNumber);
  const parsed = Date.parse(text);
  if (Number.isNaN(parsed)) return null;
  return new Date(parsed).toISOString();
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

const extractUsername = (criador: CriadorInstagram) => {
  const fromCanalId = String(criador.canal_id || '').trim().replace(/^@+/, '');
  if (/^[a-z0-9._]{2,40}$/i.test(fromCanalId)) return fromCanalId.toLowerCase();

  const fromUrl = String(criador.canal_url || '').match(/instagram\.com\/([a-z0-9._]{2,40})/i)?.[1];
  if (fromUrl && !['p', 'reel', 'reels', 'stories', 'explore', 'tv'].includes(fromUrl.toLowerCase())) {
    return fromUrl.toLowerCase();
  }

  const fromNome = String(criador.nome || '').trim().replace(/^@+/, '');
  if (/^[a-z0-9._]{2,40}$/i.test(fromNome)) return fromNome.toLowerCase();

  return '';
};

const pickItemUrl = (item: Record<string, unknown>) => {
  const candidates = [item.url, item.uri, item.link, item.id, item.guid];
  for (const candidate of candidates) {
    const value = normalizeUrl(String(candidate || ''));
    if (value.startsWith('http')) return value;
  }
  return '';
};

const pickItemThumbnail = (item: Record<string, unknown>) => {
  const direct = [item.thumbnail, item.image, item.enclosure, item.poster];
  for (const value of direct) {
    const raw = String(value || '').trim();
    if (raw.startsWith('http')) return raw;
  }

  const enclosures = Array.isArray(item.enclosures) ? (item.enclosures as unknown[]) : [];
  for (const enclosure of enclosures) {
    if (enclosure && typeof enclosure === 'object') {
      const obj = enclosure as Record<string, unknown>;
      const candidate = String(obj.url || obj.thumbnail || '').trim();
      if (candidate.startsWith('http')) return candidate;
    }
  }

  const media = item.media && typeof item.media === 'object' ? (item.media as Record<string, unknown>) : null;
  if (media) {
    const candidate = String(media.url || media.thumbnail || '').trim();
    if (candidate.startsWith('http')) return candidate;
  }

  return null;
};

const toConteudo = (item: Record<string, unknown>, criadorId: string): ConteudoInstagram | null => {
  const title = stripHtml(String(item.title || item.name || item.content_text || item.description || 'Post do Instagram'));
  const url = pickItemUrl(item);
  const thumbnail = pickItemThumbnail(item);
  const descricao = stripHtml(String(item.content || item.description || title));
  const publicadoEm = toIsoDate(item.timestamp || item.date_modified || item.date_published || item.published);
  if (!title || !url) return null;

  return {
    criador_id: criadorId,
    tipo: 'post',
    titulo: title.slice(0, 300),
    url,
    thumbnail,
    descricao: descricao ? descricao.slice(0, 4000) : null,
    publicado_em: publicadoEm,
    plataforma: 'instagram',
  };
};

const upsertInstagramItems = async (items: ConteudoInstagram[]) => {
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

export async function atualizarInstagramAutomatico(): Promise<InstagramResumo> {
  const { data, error } = await supabaseAdmin
    .from('criadores_radar')
    .select('id,nome,canal_id,canal_url')
    .eq('ativo', true)
    .eq('plataforma', 'instagram');
  if (error) throw error;

  const criadores = (data || []) as CriadorInstagram[];
  const bridgeBase = String(process.env.RSS_BRIDGE_BASE_URL || 'https://rss-bridge.org/bridge01/').trim();

  const allItems: ConteudoInstagram[] = [];
  let postsLidos = 0;

  for (const criador of criadores) {
    const username = extractUsername(criador);
    if (!username) continue;

    const endpoint = new URL(bridgeBase);
    endpoint.searchParams.set('action', 'display');
    endpoint.searchParams.set('bridge', 'InstagramBridge');
    endpoint.searchParams.set('username', username);
    endpoint.searchParams.set('format', 'Json');

    const payload = await fetchJson(endpoint.toString());
    const items = Array.isArray((payload as { items?: unknown[] } | null)?.items)
      ? (((payload as { items: unknown[] }).items || []) as Array<Record<string, unknown>>)
      : [];

    const parsed = items
      .slice(0, POSTS_PER_CREATOR)
      .map((item) => toConteudo(item, criador.id))
      .filter(Boolean) as ConteudoInstagram[];

    postsLidos += parsed.length;
    allItems.push(...parsed);
  }

  const uniqueItems = [...new Map(allItems.map((item) => [item.url, item])).values()];
  const postsSalvos = await upsertInstagramItems(uniqueItems);

  return {
    criadores_processados: criadores.length,
    posts_lidos: postsLidos,
    posts_salvos: postsSalvos,
  };
}
