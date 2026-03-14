import { NextRequest, NextResponse } from "next/server";

type ActiveUserRecord = {
  id?: string;
  user_id?: string;
  nome?: string;
  name?: string;
  full_name?: string;
  email?: string;
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

function isCronAuthorized(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return true;

  const authHeader = request.headers.get("authorization") ?? "";
  const bearerToken = authHeader.replace(/^Bearer\s+/i, "").trim();
  const querySecret = new URL(request.url).searchParams.get("secret") ?? "";

  return bearerToken === cronSecret || querySecret === cronSecret;
}

async function fetchActiveUsersFromTable(
  supabaseUrl: string,
  supabaseKey: string,
  table: string,
) {
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

  if (!response.ok) {
    return null;
  }

  const rows = (await response.json()) as ActiveUserRecord[];
  return rows;
}

async function fetchFallbackUsersFromInteractions(
  supabaseUrl: string,
  supabaseKey: string,
) {
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
    },
  );

  if (!response.ok) return [];

  const rows = (await response.json()) as Array<{ user_id?: string }>;
  const uniqueIds = Array.from(
    new Set(rows.map((row) => row.user_id?.trim()).filter(Boolean)),
  );

  return uniqueIds.map(
    (id): ActiveUserRecord => ({
      user_id: id as string,
    }),
  );
}

async function resolveActiveUsers(supabaseUrl: string, supabaseKey: string) {
  const candidateTables = ["usuarios", "profiles"];
  for (const table of candidateTables) {
    const users = await fetchActiveUsersFromTable(supabaseUrl, supabaseKey, table);
    if (users && users.length > 0) {
      return users;
    }
  }

  return fetchFallbackUsersFromInteractions(supabaseUrl, supabaseKey);
}

export async function GET(request: NextRequest) {
  if (!isCronAuthorized(request)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { supabaseUrl, supabaseKey } = getSupabaseConfig();
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      { error: "Variáveis do Supabase não configuradas." },
      { status: 500 },
    );
  }

  const users = await resolveActiveUsers(supabaseUrl, supabaseKey);
  if (!users.length) {
    return NextResponse.json({ ok: true, total: 0, enviados: 0, falhas: 0 });
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          nome,
          email,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Falha ao processar user ${userId}: ${response.status} ${errorText}`,
        );
      }
    }),
  );

  const enviados = executions.filter((item) => item.status === "fulfilled").length;
  const falhas = executions.length - enviados;
  const detalhesFalhas = executions
    .filter(
      (item): item is PromiseRejectedResult => item.status === "rejected",
    )
    .map((item) => item.reason instanceof Error ? item.reason.message : String(item.reason));

  return NextResponse.json({
    ok: true,
    total: executions.length,
    enviados,
    falhas,
    detalhesFalhas,
  });
}
