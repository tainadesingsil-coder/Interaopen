import { NextRequest, NextResponse } from "next/server";

const GEMINI_SYSTEM_PROMPT =
  "Você é o assistente de aprendizado da Codexion. Analise o conteúdo consumido pelo cliente e gere um relatório semanal personalizado em português com: saudação com o nome do cliente, resumo do que ele consumiu por categoria, 3 insights práticos aplicáveis ao negócio dele, evolução comparada à semana anterior, recomendação de conteúdo para a próxima semana e um parágrafo motivacional final. Seja direto, caloroso e 100% personalizado.";

type InteracaoConteudo = {
  user_id: string;
  tipo_conteudo: string;
  titulo_conteudo: string;
  url_conteudo: string;
  categoria: string;
  assistido_em: string;
};

type RelatorioSemanalBody = {
  user_id?: string;
  nome?: string;
  email?: string;
};

type UsuarioPerfil = {
  nome: string;
  email: string;
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

function getResendConfig() {
  return {
    resendApiKey: process.env.RESEND_API_KEY,
    resendFromEmail: process.env.RESEND_FROM_EMAIL ?? "Codexion <onboarding@resend.dev>",
  };
}

function formatDateIsoDaysAgo(daysAgo: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - daysAgo);
  return date.toISOString();
}

async function fetchInteracoesIntervalo(
  supabaseUrl: string,
  supabaseKey: string,
  userId: string,
  fromIso: string,
  toIso: string,
) {
  const params = new URLSearchParams({
    select:
      "user_id,tipo_conteudo,titulo_conteudo,url_conteudo,categoria,assistido_em",
    user_id: `eq.${userId}`,
    assistido_em: `gte.${fromIso}`,
    order: "assistido_em.desc",
  });
  params.append("assistido_em", `lt.${toIso}`);

  const response = await fetch(
    `${supabaseUrl}/rest/v1/interacoes_conteudo?${params.toString()}`,
    {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Falha ao buscar interações: ${errorText}`);
  }

  return (await response.json()) as InteracaoConteudo[];
}

function aggregateByCategory(interacoes: InteracaoConteudo[]) {
  return interacoes.reduce<Record<string, number>>((acc, item) => {
    const key = item.categoria || "Sem categoria";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
}

function aggregateByType(interacoes: InteracaoConteudo[]) {
  return interacoes.reduce<Record<string, number>>((acc, item) => {
    const key = item.tipo_conteudo || "desconhecido";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
}

function buildGeminiInput(
  nome: string,
  atual: InteracaoConteudo[],
  anterior: InteracaoConteudo[],
) {
  const categoriasAtual = aggregateByCategory(atual);
  const tiposAtual = aggregateByType(atual);
  const categoriasAnterior = aggregateByCategory(anterior);

  const recentes = atual.slice(0, 12).map((item) => ({
    tipo: item.tipo_conteudo,
    titulo: item.titulo_conteudo,
    categoria: item.categoria,
    url: item.url_conteudo,
    data: item.assistido_em,
  }));

  return [
    `Nome do cliente: ${nome}`,
    `Consumo últimos 7 dias (quantidade total): ${atual.length}`,
    `Consumo semana anterior (quantidade total): ${anterior.length}`,
    `Categorias semana atual: ${JSON.stringify(categoriasAtual)}`,
    `Categorias semana anterior: ${JSON.stringify(categoriasAnterior)}`,
    `Tipos semana atual: ${JSON.stringify(tiposAtual)}`,
    `Conteúdos recentes: ${JSON.stringify(recentes)}`,
    "Gere o relatório com seções curtas e objetivas, em português-BR.",
  ].join("\n");
}

function extractGeminiText(payload: unknown): string {
  const response = payload as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };

  const parts = response.candidates?.[0]?.content?.parts ?? [];
  const text = parts
    .map((part) => part.text ?? "")
    .join("")
    .trim();

  return text;
}

async function generateReportWithGemini(
  nome: string,
  atual: InteracaoConteudo[],
  anterior: InteracaoConteudo[],
) {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!geminiApiKey) {
    throw new Error("GEMINI_API_KEY não configurada.");
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: GEMINI_SYSTEM_PROMPT }],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: buildGeminiInput(nome, atual, anterior) }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1500,
        },
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Falha no Gemini: ${errorText}`);
  }

  const data = (await response.json()) as unknown;
  const generatedText = extractGeminiText(data);
  if (!generatedText) {
    throw new Error("Gemini não retornou texto para o relatório.");
  }

  return generatedText;
}

async function fetchFirstUserFromTable(
  supabaseUrl: string,
  supabaseKey: string,
  table: string,
  userId: string,
): Promise<UsuarioPerfil | null> {
  const params = new URLSearchParams({
    select: "id,user_id,nome,name,full_name,email",
    or: `(id.eq.${userId},user_id.eq.${userId})`,
    limit: "1",
  });

  const response = await fetch(`${supabaseUrl}/rest/v1/${table}?${params}`, {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
    },
    cache: "no-store",
  });

  if (!response.ok) return null;
  const data = (await response.json()) as Array<Record<string, string>>;
  if (!data.length) return null;

  const first = data[0];
  const nome =
    first.nome ?? first.name ?? first.full_name ?? first.user_id ?? first.id;
  const email = first.email;

  if (!email) return null;
  return { nome, email };
}

async function resolveUserProfile(
  supabaseUrl: string,
  supabaseKey: string,
  userId: string,
  nome?: string,
  email?: string,
) {
  if (nome && email) return { nome, email };

  const tables = ["usuarios", "profiles"];
  for (const table of tables) {
    const profile = await fetchFirstUserFromTable(
      supabaseUrl,
      supabaseKey,
      table,
      userId,
    );
    if (profile) {
      return {
        nome: nome ?? profile.nome,
        email: email ?? profile.email,
      };
    }
  }

  return {
    nome: nome ?? "Cliente",
    email: email ?? "",
  };
}

function buildEmailTemplate(nome: string, relatorioTexto: string) {
  const safeText = relatorioTexto
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `<p style="margin:0 0 10px 0;line-height:1.6;color:#d1d5db;">${line}</p>`)
    .join("");

  return `
<!DOCTYPE html>
<html lang="pt-BR">
  <body style="margin:0;padding:0;background:#050607;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:28px 14px;background:#050607;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;border:1px solid rgba(180,255,0,.25);border-radius:14px;overflow:hidden;background:#0a0d11;">
            <tr>
              <td style="padding:24px 24px 8px 24px;">
                <p style="margin:0;font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:#B4FF00;">Relatório semanal</p>
                <h1 style="margin:10px 0 8px 0;font-size:28px;line-height:1.2;color:#ffffff;">Olá, ${nome}</h1>
                <p style="margin:0;color:#9ca3af;line-height:1.6;">Seu resumo personalizado da semana já está pronto.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 24px 8px 24px;">
                ${safeText}
              </td>
            </tr>
            <tr>
              <td style="padding:18px 24px 26px 24px;">
                <a href="https://codexionai.pages.dev/" style="display:inline-block;background:#B4FF00;color:#000;text-decoration:none;font-weight:700;padding:12px 18px;border-radius:10px;">Acessar minha área exclusiva</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
}

async function sendEmailByResend(
  nome: string,
  email: string,
  relatorioTexto: string,
) {
  const { resendApiKey, resendFromEmail } = getResendConfig();
  if (!resendApiKey) {
    throw new Error("RESEND_API_KEY não configurada.");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: resendFromEmail,
      to: [email],
      subject: `Seu relatório semanal chegou, ${nome} ⚡`,
      html: buildEmailTemplate(nome, relatorioTexto),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Falha ao enviar e-mail com Resend: ${errorText}`);
  }
}

export async function POST(request: NextRequest) {
  const { supabaseUrl, supabaseKey } = getSupabaseConfig();
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      { error: "Variáveis do Supabase não configuradas." },
      { status: 500 },
    );
  }

  let body: RelatorioSemanalBody;
  try {
    body = (await request.json()) as RelatorioSemanalBody;
  } catch {
    return NextResponse.json(
      { error: "Corpo da requisição inválido." },
      { status: 400 },
    );
  }

  const userId = body.user_id?.trim();
  if (!userId) {
    return NextResponse.json(
      { error: "Campo obrigatório ausente: user_id." },
      { status: 400 },
    );
  }

  try {
    const nowIso = new Date().toISOString();
    const last7DaysIso = formatDateIsoDaysAgo(7);
    const last14DaysIso = formatDateIsoDaysAgo(14);

    const [interacoesSemanaAtual, interacoesSemanaAnterior] =
      await Promise.all([
        fetchInteracoesIntervalo(
          supabaseUrl,
          supabaseKey,
          userId,
          last7DaysIso,
          nowIso,
        ),
        fetchInteracoesIntervalo(
          supabaseUrl,
          supabaseKey,
          userId,
          last14DaysIso,
          last7DaysIso,
        ),
      ]);

    const perfil = await resolveUserProfile(
      supabaseUrl,
      supabaseKey,
      userId,
      body.nome?.trim(),
      body.email?.trim(),
    );

    const nomeCliente = perfil.nome || "Cliente";
    if (!perfil.email) {
      return NextResponse.json(
        {
          error:
            "Não foi possível identificar e-mail do cliente para envio do relatório.",
        },
        { status: 400 },
      );
    }

    const relatorio = await generateReportWithGemini(
      nomeCliente,
      interacoesSemanaAtual,
      interacoesSemanaAnterior,
    );

    await sendEmailByResend(nomeCliente, perfil.email, relatorio);

    return NextResponse.json({
      ok: true,
      user_id: userId,
      email_enviado_para: perfil.email,
      relatorio,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro inesperado ao gerar relatório.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
