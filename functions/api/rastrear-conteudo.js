function getEnv(context) {
  return context?.env ?? {};
}

function getProcessEnv() {
  if (typeof process !== "undefined" && process?.env) {
    return process.env;
  }
  return {};
}

function getSupabaseConfig(context) {
  const env = getEnv(context);
  const processEnv = getProcessEnv();
  const supabaseUrl =
    env.SUPABASE_URL ??
    env.NEXT_PUBLIC_SUPABASE_URL ??
    processEnv.SUPABASE_URL ??
    processEnv.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    env.SUPABASE_SERVICE_ROLE_KEY ?? processEnv.SUPABASE_SERVICE_ROLE_KEY;
  return { supabaseUrl, supabaseKey };
}

export async function onRequestPost(context) {
  const { supabaseUrl, supabaseKey } = getSupabaseConfig(context);

  if (!supabaseUrl || !supabaseKey) {
    return Response.json(
      {
        error:
          "SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias para esta rota.",
      },
      { status: 500 }
    );
  }

  let body;
  try {
    body = await context.request.json();
  } catch {
    return Response.json(
      { error: "Corpo da requisição inválido." },
      { status: 400 }
    );
  }

  const tipo = typeof body?.tipo === "string" ? body.tipo.trim() : "";
  const titulo = typeof body?.titulo === "string" ? body.titulo.trim() : "";
  const url = typeof body?.url === "string" ? body.url.trim() : "";
  const categoria =
    typeof body?.categoria === "string" ? body.categoria.trim() : "";
  const userId =
    typeof body?.user_id === "string" && body.user_id.trim()
      ? body.user_id.trim()
      : "anonimo";

  if (!tipo || !titulo || !url || !categoria) {
    return Response.json(
      { error: "Campos obrigatórios ausentes: tipo, titulo, url, categoria." },
      { status: 400 }
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
    return Response.json(
      { error: "Falha ao salvar interação.", details: errorText },
      { status: 500 }
    );
  }

  return Response.json({ ok: true });
}
