function getEnv(context) {
  return context?.env ?? {};
}

function getSupabaseConfig(context) {
  const env = getEnv(context);
  const supabaseUrl =
    env.SUPABASE_URL ??
    env.NEXT_PUBLIC_SUPABASE_URL ??
    process.env.SUPABASE_URL ??
    process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  return { supabaseUrl, supabaseKey };
}

function isCronAuthorized(request, context) {
  const env = getEnv(context);
  const cronSecret = env.CRON_SECRET ?? process.env.CRON_SECRET;
  if (!cronSecret) return true;

  const authHeader = request.headers.get("authorization") ?? "";
  const bearerToken = authHeader.replace(/^Bearer\s+/i, "").trim();
  const querySecret = new URL(request.url).searchParams.get("secret") ?? "";
  return bearerToken === cronSecret || querySecret === cronSecret;
}

async function fetchActiveUsersFromTable(supabaseUrl, supabaseKey, table) {
  const params = new URLSearchParams({
    select: "id,user_id,nome,name,full_name,email,ativo",
    ativo: "eq.true",
    limit: "500",
  });

  const response = await fetch(`${supabaseUrl}/rest/v1/${table}?${params}`, {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
    },
    cache: "no-store",
  });

  if (!response.ok) return null;
  return await response.json();
}

async function fetchFallbackUsersFromInteractions(supabaseUrl, supabaseKey) {
  const params = new URLSearchParams({
    select: "user_id",
    order: "assistido_em.desc",
    limit: "1000",
  });

  const response = await fetch(
    `${supabaseUrl}/rest/v1/interacoes_conteudo?${params}`,
    {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
      cache: "no-store",
    }
  );

  if (!response.ok) return [];

  const rows = await response.json();
  const uniqueIds = Array.from(
    new Set(
      (rows ?? [])
        .map((row) =>
          typeof row?.user_id === "string" ? row.user_id.trim() : ""
        )
        .filter(Boolean)
    )
  );

  return uniqueIds.map((id) => ({ user_id: id }));
}

async function resolveActiveUsers(supabaseUrl, supabaseKey) {
  const candidateTables = ["usuarios", "profiles"];
  for (const table of candidateTables) {
    const users = await fetchActiveUsersFromTable(supabaseUrl, supabaseKey, table);
    if (users && users.length > 0) return users;
  }
  return fetchFallbackUsersFromInteractions(supabaseUrl, supabaseKey);
}

export async function onRequestGet(context) {
  const request = context.request;

  if (!isCronAuthorized(request, context)) {
    return Response.json({ error: "Não autorizado." }, { status: 401 });
  }

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

  const users = await resolveActiveUsers(supabaseUrl, supabaseKey);
  if (!users.length) {
    return Response.json({ ok: true, total: 0, enviados: 0, falhas: 0 });
  }

  const origin = new URL(request.url).origin;
  const executions = await Promise.allSettled(
    users.map(async (user) => {
      const userId = user.user_id ?? user.id;
      if (!userId) {
        throw new Error("Registro sem user_id/id.");
      }

      const nome = user.nome ?? user.name ?? user.full_name;
      const email = user.email;

      const response = await fetch(`${origin}/api/relatorio-semanal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          nome,
          email,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Falha ao processar user ${userId}: ${response.status} ${errorText}`
        );
      }
    })
  );

  const enviados = executions.filter((item) => item.status === "fulfilled").length;
  const falhas = executions.length - enviados;
  const detalhesFalhas = executions
    .filter((item) => item.status === "rejected")
    .map((item) =>
      item.reason instanceof Error ? item.reason.message : String(item.reason)
    );

  return Response.json({
    ok: true,
    total: executions.length,
    enviados,
    falhas,
    detalhesFalhas,
  });
}
