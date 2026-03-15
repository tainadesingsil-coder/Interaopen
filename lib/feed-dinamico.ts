import { supabaseAdmin } from '@/lib/supabase-admin';

type PreferenciaUsuario = {
  criador_id: string | null;
  plataforma: string | null;
  categoria: string | null;
  score: number | null;
};

export type CriadorRadar = {
  id: string;
  nome: string | null;
  plataforma: string | null;
  canal_id: string | null;
  canal_url: string | null;
  rss_url: string | null;
  categoria: string | null;
  tags: string[] | null;
  ativo: boolean | null;
  criado_em: string | null;
};

const toKey = (value: string | null | undefined) => String(value || '').trim().toLowerCase();

const fetchCriadoresAtivos = async () => {
  const { data, error } = await supabaseAdmin
    .from('criadores_radar')
    .select('id,nome,plataforma,canal_id,canal_url,rss_url,categoria,tags,ativo,criado_em')
    .eq('ativo', true)
    .order('criado_em', { ascending: false });

  if (error) {
    throw error;
  }

  return (data || []) as CriadorRadar[];
};

export async function getFeedPersonalizado(user_id: string): Promise<CriadorRadar[]> {
  const userKey = String(user_id || '').trim();
  if (!userKey) {
    return fetchCriadoresAtivos();
  }

  const { data: preferencias, error } = await supabaseAdmin
    .from('preferencias_usuario')
    .select('criador_id,plataforma,categoria,score')
    .eq('user_id', userKey)
    .order('score', { ascending: false });

  if (error) {
    throw error;
  }

  const preferenciasList = (preferencias || []) as PreferenciaUsuario[];
  if (preferenciasList.length === 0) {
    return fetchCriadoresAtivos();
  }

  const criadores = await fetchCriadoresAtivos();
  if (criadores.length === 0) {
    return [];
  }

  const scoreByCriador = new Map<string, number>();
  const scoreByPlataforma = new Map<string, number>();
  const scoreByCategoria = new Map<string, number>();

  for (const pref of preferenciasList) {
    const baseScore = Number(pref.score || 0);
    const criadorKey = toKey(pref.criador_id);
    const plataformaKey = toKey(pref.plataforma);
    const categoriaKey = toKey(pref.categoria);

    if (criadorKey) {
      scoreByCriador.set(criadorKey, (scoreByCriador.get(criadorKey) || 0) + baseScore);
    }
    if (plataformaKey) {
      scoreByPlataforma.set(plataformaKey, (scoreByPlataforma.get(plataformaKey) || 0) + baseScore);
    }
    if (categoriaKey) {
      scoreByCategoria.set(categoriaKey, (scoreByCategoria.get(categoriaKey) || 0) + baseScore);
    }
  }

  const ranked = criadores
    .map((criador) => {
      const idKey = toKey(criador.id);
      const canalIdKey = toKey(criador.canal_id);
      const plataformaKey = toKey(criador.plataforma);
      const categoriaKey = toKey(criador.categoria);

      const matchCriador = Math.max(scoreByCriador.get(idKey) || 0, scoreByCriador.get(canalIdKey) || 0);
      const matchPlataforma = scoreByPlataforma.get(plataformaKey) || 0;
      const matchCategoria = scoreByCategoria.get(categoriaKey) || 0;
      const relevancia = matchCriador * 10 + matchPlataforma * 3 + matchCategoria * 2;

      return { criador, relevancia };
    })
    .filter((item) => item.relevancia > 0);

  if (ranked.length === 0) {
    return criadores;
  }

  return ranked
    .sort((a, b) => {
      if (b.relevancia !== a.relevancia) return b.relevancia - a.relevancia;
      const aTime = Date.parse(a.criador.criado_em || '');
      const bTime = Date.parse(b.criador.criado_em || '');
      return (Number.isNaN(bTime) ? 0 : bTime) - (Number.isNaN(aTime) ? 0 : aTime);
    })
    .map((item) => item.criador);
}
