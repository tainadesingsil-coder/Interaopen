import { NextRequest, NextResponse } from "next/server";

type RastrearConteudoBody = {
  tipo?: string;
  titulo?: string;
  url?: string;
  categoria?: string;
  user_id?: string;
};

function getSupabaseConfig() {
  const supabaseUrl =
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_PUBLISHABLE_KEY ??
    process.env.SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return { supabaseUrl, supabaseKey };
}

export async function POST(request: NextRequest) {
  const { supabaseUrl, supabaseKey } = getSupabaseConfig();

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      { error: "Variáveis do Supabase não configuradas." },
      { status: 500 },
    );
  }

  let body: RastrearConteudoBody;
  try {
    body = (await request.json()) as RastrearConteudoBody;
  } catch {
    return NextResponse.json(
      { error: "Corpo da requisição inválido." },
      { status: 400 },
    );
  }

  const tipo = body.tipo?.trim();
  const titulo = body.titulo?.trim();
  const url = body.url?.trim();
  const categoria = body.categoria?.trim();
  const userId = body.user_id?.trim() || "anonimo";

  if (!tipo || !titulo || !url || !categoria) {
    return NextResponse.json(
      { error: "Campos obrigatórios ausentes: tipo, titulo, url, categoria." },
      { status: 400 },
    );
  }

  const insertPayload = {
    user_id: userId,
    tipo_conteudo: tipo,
    titulo_conteudo: titulo,
    url_conteudo: url,
    categoria,
    assistido_em: new Date().toISOString(),
  };

  const response = await fetch(`${supabaseUrl}/rest/v1/interacoes_conteudo`, {
    method: "POST",
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(insertPayload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    return NextResponse.json(
      { error: "Falha ao salvar interação.", details: errorText },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
