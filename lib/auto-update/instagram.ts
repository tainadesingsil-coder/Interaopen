import { supabaseAdmin } from '../supabase-admin';

type CriadorInstagram = {
  id: string;
  nome: string | null;
  canal_id: string | null;
  canal_url: string | null;
};

type ApifyInstagramPost = {
  ownerUsername?: string;
  caption?: string;
  url?: string;
  shortCode?: string;
  displayUrl?: string;
  timestamp?: number | string;
};

export type InstagramResumo = {
  criadores_processados: number;
  posts_lidos: number;
  posts_salvos: number;
  por_criador: Record<string, number>;
};

const APIFY_TIMEOUT_SECONDS = 60;
const RESULTS_LIMIT = 5;

const sanitizeText = (value: unknown, max = 5000) =>
  String(value || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);

const normalizeUsername = (value: unknown) =>
  String(value || '')
    .trim()
    .replace(/^@+/, '')
    .toLowerCase();

const usernameFromUrl = (value: unknown) => {
  const raw = String(value || '').trim();
  const match = raw.match(/instagram\.com\/([a-z0-9._]{2,40})/i);
  if (!match?.[1]) return '';
  const candidate = match[1].toLowerCase();
  if (['p', 'reel', 'reels', 'stories', 'explore', 'tv'].includes(candidate)) return '';
  return candidate;
};

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

const resolveCriadorUsername = (criador: CriadorInstagram) =>
  normalizeUsername(criador.nome) ||
  normalizeUsername(criador.canal_id) ||
  usernameFromUrl(criador.canal_url) ||
  '';

const buildPostUrl = (post: ApifyInstagramPost, ownerUsername: string) => {
  const fromUrl = String(post.url || '').trim();
  if (fromUrl.startsWith('http')) return fromUrl;
  const shortCode = String(post.shortCode || '').trim();
  if (shortCode) return `https://instagram.com/p/${shortCode}`;
  if (ownerUsername) return `https://instagram.com/${ownerUsername}/`;
  return '';
};

export async function atualizarInstagramAutomatico(): Promise<InstagramResumo> {
  const supabase = supabaseAdmin;
  const token = String(process.env.APIFY_TOKEN || '').trim();
  if (!token) {
    throw new Error('APIFY_TOKEN não definido no ambiente.');
  }

  const criadores = await supabase.from('criadores_radar').select('*').eq('plataforma', 'instagram').eq('ativo', true);
  if (criadores.error) throw criadores.error;

  const rows = (criadores.data || []) as CriadorInstagram[];
  const usernames = rows
    .map((criador) => resolveCriadorUsername(criador))
    .filter((username) => /^[a-z0-9._]{2,40}$/.test(username));
  const uniqueUsernames = [...new Set(usernames)];

  const criadorByUsername = new Map<string, CriadorInstagram>();
  rows.forEach((criador) => {
    const username = resolveCriadorUsername(criador);
    if (username && !criadorByUsername.has(username)) {
      criadorByUsername.set(username, criador);
    }
  });

  const porCriador = Object.fromEntries(uniqueUsernames.map((username) => [`@${username}`, 0])) as Record<string, number>;
  if (uniqueUsernames.length === 0) {
    console.log('Total: 0 posts salvos no Supabase');
    return {
      criadores_processados: rows.length,
      posts_lidos: 0,
      posts_salvos: 0,
      por_criador: porCriador,
    };
  }

  const run = await fetch(
    `https://api.apify.com/v2/acts/apify~instagram-profile-scraper/run-sync-get-dataset-items?token=${token}&timeout=${APIFY_TIMEOUT_SECONDS}`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        usernames: uniqueUsernames,
        resultsLimit: RESULTS_LIMIT,
      }),
    }
  );

  if (!run.ok) {
    throw new Error(`Apify request failed with status ${run.status}`);
  }

  const postsRaw = (await run.json()) as unknown;
  const posts = Array.isArray(postsRaw) ? (postsRaw as ApifyInstagramPost[]) : [];

  let postsSalvos = 0;
  for (const post of posts) {
    const ownerUsername = normalizeUsername(post.ownerUsername);
    if (!ownerUsername) continue;

    const criador = criadorByUsername.get(ownerUsername);
    if (!criador?.id) continue;

    const url = buildPostUrl(post, ownerUsername);
    if (!url) continue;

    const titulo = sanitizeText(post.caption, 120) || ownerUsername;
    const descricao = sanitizeText(post.caption, 4000) || null;
    const publicadoEm = toIsoDate(post.timestamp);
    const thumbnail = String(post.displayUrl || '').trim() || null;

    const { error } = await supabase.from('conteudos_radar').upsert(
      {
        criador_id: criador.id,
        tipo: 'post',
        titulo,
        url,
        thumbnail,
        descricao,
        publicado_em: publicadoEm,
      },
      { onConflict: 'url' }
    );

    if (error) {
      console.log(`@${ownerUsername}: erro - ${error.message}`);
      continue;
    }

    const key = `@${ownerUsername}`;
    porCriador[key] = (porCriador[key] || 0) + 1;
    postsSalvos += 1;
  }

  uniqueUsernames.forEach((username) => {
    const key = `@${username}`;
    console.log(`${key}: ${porCriador[key] || 0} posts salvos`);
  });
  console.log(`Total: ${postsSalvos} posts salvos no Supabase`);

  return {
    criadores_processados: rows.length,
    posts_lidos: posts.length,
    posts_salvos: postsSalvos,
    por_criador: porCriador,
  };
}
