import { supabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

const clampLimit = (value: string | null) => {
  const parsed = Number.parseInt(String(value || ''), 10);
  if (Number.isNaN(parsed)) return 20;
  return Math.min(100, Math.max(1, parsed));
};

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const criadorId = String(url.searchParams.get('criador_id') || '').trim();
    const tipo = String(url.searchParams.get('tipo') || '').trim();
    const limit = clampLimit(url.searchParams.get('limit'));

    let query = supabaseAdmin
      .from('conteudos_radar')
      .select(
        `
        id,
        criador_id,
        tipo,
        titulo,
        url,
        thumbnail,
        descricao,
        publicado_em,
        criado_em,
        criador:criadores_radar (
          id,
          nome,
          plataforma,
          canal_id,
          canal_url,
          rss_url,
          categoria,
          tags,
          ativo,
          criado_em
        )
      `
      )
      .order('publicado_em', { ascending: false, nullsFirst: false })
      .limit(limit);

    if (criadorId) {
      query = query.eq('criador_id', criadorId);
    }
    if (tipo) {
      query = query.eq('tipo', tipo);
    }

    const { data, error } = await query;
    if (error) {
      throw error;
    }

    return Response.json(
      {
        ok: true,
        total: Array.isArray(data) ? data.length : 0,
        itens: data || [],
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao buscar conteúdos.';
    return Response.json(
      {
        ok: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
