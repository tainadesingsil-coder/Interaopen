import { supabaseAdmin } from '@/lib/supabase-admin';

type TipoAcao =
  | 'acesso'
  | 'view'
  | 'consumo_completo'
  | 'concluido'
  | 'save'
  | 'salvar'
  | 'compartilhar'
  | 'share'
  | string;

const normalizarAcao = (acao: TipoAcao) => String(acao || '').trim().toLowerCase();

const pontuacaoPorAcao = (acao: TipoAcao) => {
  const tipo = normalizarAcao(acao);
  if (['save', 'salvar', 'compartilhar', 'share'].includes(tipo)) return 5;
  if (['consumo_completo', 'concluido', 'completo', 'finished'].includes(tipo)) return 3;
  return 1;
};

export async function registrarInteracao(
  user_id: string,
  criador_id: string,
  plataforma: string,
  categoria: string,
  tipo_acao: TipoAcao
) {
  const userId = String(user_id || '').trim();
  if (!userId) {
    throw new Error('user_id é obrigatório para registrar interação.');
  }

  const criadorId = String(criador_id || '').trim();
  const plataformaValue = String(plataforma || '').trim();
  const categoriaValue = String(categoria || '').trim();
  const pontos = pontuacaoPorAcao(tipo_acao);
  const agora = new Date().toISOString();

  const { data: existentes, error: selectError } = await supabaseAdmin
    .from('preferencias_usuario')
    .select('id,total_acessos,score')
    .eq('user_id', userId)
    .eq('criador_id', criadorId)
    .eq('plataforma', plataformaValue)
    .eq('categoria', categoriaValue)
    .limit(1);

  if (selectError) {
    throw selectError;
  }

  const existente = Array.isArray(existentes) && existentes.length > 0 ? existentes[0] : null;

  if (existente?.id) {
    const proximoTotalAcessos = Number(existente.total_acessos || 0) + 1;
    const proximoScore = Number(existente.score || 0) + pontos;

    const { data, error } = await supabaseAdmin
      .from('preferencias_usuario')
      .update({
        total_acessos: proximoTotalAcessos,
        score: proximoScore,
        ultimo_acesso: agora,
      })
      .eq('id', existente.id)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  const { data, error } = await supabaseAdmin
    .from('preferencias_usuario')
    .insert({
      user_id: userId,
      criador_id: criadorId,
      plataforma: plataformaValue,
      categoria: categoriaValue,
      total_acessos: 1,
      score: pontos,
      ultimo_acesso: agora,
    })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
}
