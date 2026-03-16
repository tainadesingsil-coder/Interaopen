import { supabaseAdmin } from '@/lib/supabase-admin';

type CriadorTikTok = {
  id: string;
  nome: string | null;
  canal_id: string | null;
  canal_url: string | null;
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

type TikTokResumo = {
  criadores_processados: number;
  videos_lidos: number;
  videos_salvos: number;
};

const FETCH_TIMEOUT_MS = 12000;
const VIDEOS_PER_CREATOR = 5;

const stripHtml = (value: string) =>
  String(value || '')
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
  const maybeNumber = Number(text);
  if (Number.isFinite(maybeNumber)) {
    return toIsoDate(maybeNumber);
  }

  const parsed = Date.parse(text);
  if (Number.isNaN(parsed)) return null;
  return new Date(parsed).toISOString();
};

const fetchJson = async (url: string, headers: Record<string, string>) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers,
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
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

const extractItemsFromTikApiPayload = (payload: unknown): Array<Record<string, unknown>> => {
  if (Array.isArray(payload)) return payload as Array<Record<string, unknown>>;
  if (!payload || typeof payload !== 'object') return [];

  const root = payload as Record<string, unknown>;
  const candidates = [root.items, root.itemList, root.aweme_list, root.data, root.posts];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate as Array<Record<string, unknown>>;
    if (candidate && typeof candidate === 'object') {
      const nested = candidate as Record<string, unknown>;
      if (Array.isArray(nested.items)) return nested.items as Array<Record<string, unknown>>;
    }
  }
  return [];
};

const pickThumbnail = (item: Record<string, unknown>) => {
  const video = (item.video || {}) as Record<string, unknown>;
  const cover = (video.cover || item.cover || item.thumbnail || {}) as Record<string, unknown>;

  const directCandidates = [
    item.thumbnail,
    item.thumbnail_url,
    item.cover_url,
    video.cover_url,
    cover.url,
    cover.uri,
  ];
  for (const candidate of directCandidates) {
    const value = String(candidate || '').trim();
    if (value) return value;
  }

  const arrayCandidates = [
    (cover.url_list as unknown[] | undefined) || [],
    ((item.images as Record<string, unknown>)?.urls as unknown[] | undefined) || [],
  ];
  for (const arr of arrayCandidates) {
    const found = Array.isArray(arr) ? String(arr[0] || '').trim() : '';
    if (found) return found;
  }

  return null;
};

const pickTitle = (item: Record<string, unknown>) =>
  stripHtml(String(item.title || item.desc || item.caption || item.text || 'Vídeo TikTok'));

const pickUrl = (item: Record<string, unknown>, username: string) => {
  const candidates = [
    item.share_url,
    item.url,
    item.video_url,
    (item.share_info as Record<string, unknown> | undefined)?.share_url,
  ];
  for (const candidate of candidates) {
    const value = String(candidate || '').trim();
    if (value.startsWith('http')) return value;
  }
  const id = String(item.aweme_id || item.id || item.video_id || '').trim();
  if (!id) return '';
  return `https://www.tiktok.com/@${username}/video/${id}`;
};

const toConteudo = (item: Record<string, unknown>, criador: CriadorTikTok, username: string) => {
  const titulo = pickTitle(item);
  const url = pickUrl(item, username);
  const thumbnail = pickThumbnail(item);
  const publicadoEm = toIsoDate(
    item.create_time || item.createTime || item.taken_at || item.published_at || item.created_at
  );
  if (!titulo || !url) return null;

  return {
    criador_id: criador.id,
    tipo: 'video',
    titulo: titulo.slice(0, 300),
    url,
    thumbnail,
    descricao: titulo.slice(0, 4000) || null,
    publicado_em: publicadoEm,
    plataforma: 'tiktok',
  } satisfies ConteudoTikTok;
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

export async function atualizarTikTokAutomatico(): Promise<TikTokResumo> {
  const apiKey = String(process.env.TIKAPI_KEY || '').trim();
  if (!apiKey) {
    return { criadores_processados: 0, videos_lidos: 0, videos_salvos: 0 };
  }

  const { data, error } = await supabaseAdmin
    .from('criadores_radar')
    .select('id,nome,canal_id,canal_url')
    .eq('ativo', true)
    .eq('plataforma', 'tiktok');
  if (error) throw error;

  const criadores = (data || []) as CriadorTikTok[];
  const headers = {
    accept: 'application/json',
    'X-API-KEY': apiKey,
    Authorization: `Bearer ${apiKey}`,
  };

  let videosLidos = 0;
  const allItems: ConteudoTikTok[] = [];

  for (const criador of criadores) {
    const username = extractTikTokUsername(criador);
    if (!username) continue;

    const endpoints = [
      `https://api.tikapi.io/public/posts?username=${encodeURIComponent(username)}`,
      `https://api.tikapi.io/public/user/posts?username=${encodeURIComponent(username)}`,
      `https://api.tikapi.io/public/posts/${encodeURIComponent(username)}`,
    ];

    let payload: unknown = null;
    for (const endpoint of endpoints) {
      payload = await fetchJson(endpoint, headers);
      if (payload) break;
    }
    if (!payload) continue;

    const items = extractItemsFromTikApiPayload(payload)
      .slice(0, VIDEOS_PER_CREATOR)
      .map((item) => toConteudo(item, criador, username))
      .filter(Boolean) as ConteudoTikTok[];

    videosLidos += items.length;
    allItems.push(...items);
  }

  const uniqueItems = [...new Map(allItems.map((item) => [item.url, item])).values()];
  const videosSalvos = await upsertTikTokItems(uniqueItems);

  return {
    criadores_processados: criadores.length,
    videos_lidos: videosLidos,
    videos_salvos: videosSalvos,
  };
}
