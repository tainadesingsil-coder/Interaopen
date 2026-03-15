const GEMINI_SYSTEM_PROMPT = [
  "Você é o estrategista de aprendizado da Codexion.",
  "Escreva em português-BR com tom humano, claro e objetivo.",
  "NUNCA repita frases ou ideias.",
  "Monte exatamente nesta estrutura:",
  "1) Saudação curta com nome.",
  "2) Resumo do consumo por categoria e tipo.",
  "3) 3 insights acionáveis para o negócio do cliente.",
  "4) Evolução versus semana anterior (se não houver base, diga isso com clareza).",
  "5) Plano da próxima semana em 3 passos numerados.",
  "6) Encerramento motivacional de até 2 frases.",
  "Use frases curtas, sem jargão técnico desnecessário.",
].join(" ");

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

function getResendConfig(context) {
  const env = getEnv(context);
  const processEnv = getProcessEnv();
  return {
    resendApiKey: env.RESEND_API_KEY ?? processEnv.RESEND_API_KEY,
    resendFromEmail:
      env.RESEND_FROM_EMAIL ??
      processEnv.RESEND_FROM_EMAIL ??
      "Codexion <onboarding@resend.dev>",
  };
}

function getGeminiApiKey(context) {
  const env = getEnv(context);
  const processEnv = getProcessEnv();
  return env.GEMINI_API_KEY ?? processEnv.GEMINI_API_KEY;
}

function formatDateIsoDaysAgo(daysAgo) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - daysAgo);
  return date.toISOString();
}

async function fetchInteracoesIntervalo(
  supabaseUrl,
  supabaseKey,
  userId,
  fromIso,
  toIso
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
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Falha ao buscar interações: ${errorText}`);
  }

  return await response.json();
}

function aggregateByCategory(interacoes) {
  return interacoes.reduce((acc, item) => {
    const key = item?.categoria || "Sem categoria";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
}

function aggregateByType(interacoes) {
  return interacoes.reduce((acc, item) => {
    const key = item?.tipo_conteudo || "desconhecido";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
}

function summarizeMap(map, limit) {
  const entries = Object.entries(map || {});
  if (!entries.length) return "Sem dados suficientes ainda.";
  return entries
    .sort((a, b) => b[1] - a[1])
    .slice(0, typeof limit === "number" ? limit : 4)
    .map(([name, count]) => `${name}: ${count}`)
    .join(" | ");
}

function buildDeterministicReport(nome, atual, anterior) {
  const byCategory = aggregateByCategory(atual);
  const byType = aggregateByType(atual);
  const topCategory = summarizeMap(byCategory, 4);
  const topType = summarizeMap(byType, 4);
  const diff = atual.length - anterior.length;
  const evolutionLabel =
    anterior.length === 0
      ? "Ainda sem base anterior para comparação."
      : diff === 0
      ? "Consumo estável em relação à semana passada."
      : diff > 0
      ? `Você evoluiu: +${diff} ações em relação à semana passada.`
      : `Ritmo menor: ${Math.abs(diff)} ações a menos que na semana passada.`;

  const recentes = atual
    .slice(0, 5)
    .map(
      (item) =>
        `- ${item?.categoria || "Conteúdo"}: ${item?.titulo_conteudo || "Interação na área exclusiva"}`
    )
    .join("\n");

  return [
    `Olá, ${nome}!`,
    ``,
    `Resumo da sua semana na Área Exclusiva:`,
    `- Total de ações: ${atual.length}`,
    `- Categorias com mais consumo: ${topCategory}`,
    `- Tipos de ação mais frequentes: ${topType}`,
    ``,
    `Ações recentes:`,
    recentes || "- Sem ações recentes registradas.",
    ``,
    `Insights práticos:`,
    `- Escolha o tema mais recorrente e transforme em uma ação de negócio nesta semana.`,
    `- Defina 1 métrica simples para medir resultado (ex.: leads, reuniões ou taxa de resposta).`,
    `- Agende um bloco fixo de execução para manter consistência (30 a 45 min por dia).`,
    ``,
    `Evolução:`,
    `- ${evolutionLabel}`,
    ``,
    `Próximos passos (7 dias):`,
    `1) Priorize 1 tema principal.`,
    `2) Execute uma ação ainda hoje.`,
    `3) Volte à área exclusiva para comparar evolução.`,
    ``,
    `Mensagem final: você já está construindo ritmo. A consistência semanal é o que transforma conteúdo em resultado real.`,
  ].join("\n");
}

function buildWelcomeReport(nome) {
  return [
    `Olá, ${nome}! Seja muito bem-vindo(a) à Área Exclusiva da Codexion.`,
    ``,
    `Seu cadastro foi ativado com sucesso e, a partir de agora, seus relatórios serão personalizados com base no que você realmente consumir.`,
    ``,
    `Como funciona:`,
    `- Você navega pela área exclusiva (conteúdos, vídeos e lives).`,
    `- A IA identifica os temas que mais fazem sentido para seu momento.`,
    `- Você recebe um resumo claro com insights práticos para aplicar no negócio.`,
    ``,
    `Próximos passos recomendados:`,
    `1) Assista 1 conteúdo completo hoje.`,
    `2) Salve os pontos principais para execução.`,
    `3) Volte amanhã para manter o ritmo semanal.`,
    ``,
    `Conte com a Codexion para transformar aprendizado em crescimento.`,
  ].join("\n");
}

function buildGeminiInput(nome, atual, anterior, resumoLocal) {
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
    `Consumo últimos 7 dias (total): ${atual.length}`,
    `Consumo semana anterior (total): ${anterior.length}`,
    `Categorias semana atual: ${JSON.stringify(categoriasAtual)}`,
    `Categorias semana anterior: ${JSON.stringify(categoriasAnterior)}`,
    `Tipos semana atual: ${JSON.stringify(tiposAtual)}`,
    `Conteúdos recentes: ${JSON.stringify(recentes)}`,
    `Resumo local opcional do frontend: ${JSON.stringify(resumoLocal || {})}`,
    "Reforço: não repetir frases. Clareza e objetividade acima de tudo.",
  ].join("\n");
}

function extractGeminiText(payload) {
  const parts = payload?.candidates?.[0]?.content?.parts ?? [];
  return parts
    .map((part) => part?.text ?? "")
    .join("")
    .trim();
}

async function generateReportWithGemini(
  context,
  nome,
  atual,
  anterior,
  resumoLocal
) {
  const geminiApiKey = getGeminiApiKey(context);
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
            parts: [{ text: buildGeminiInput(nome, atual, anterior, resumoLocal) }],
          },
        ],
        generationConfig: {
          temperature: 0.45,
          maxOutputTokens: 1400,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Falha no Gemini: ${errorText}`);
  }

  const data = await response.json();
  const generatedText = extractGeminiText(data);
  if (!generatedText) {
    throw new Error("Gemini não retornou texto para o relatório.");
  }

  return generatedText;
}

async function fetchFirstUserFromTable(supabaseUrl, supabaseKey, table, userId) {
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
  const data = await response.json();
  if (!Array.isArray(data) || data.length === 0) return null;

  const first = data[0] ?? {};
  const nome =
    first.nome ?? first.name ?? first.full_name ?? first.user_id ?? first.id;
  const email = first.email;

  if (!email) return null;
  return { nome, email };
}

async function resolveUserProfile(
  supabaseUrl,
  supabaseKey,
  userId,
  nome,
  email
) {
  if (nome && email) return { nome, email };

  const tables = ["usuarios", "profiles"];
  for (const table of tables) {
    const profile = await fetchFirstUserFromTable(
      supabaseUrl,
      supabaseKey,
      table,
      userId
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

function escapeHtml(text) {
  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function inlineFormat(text) {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code style=\"background:rgba(255,255,255,.08);padding:1px 6px;border-radius:6px;\">$1</code>");
}

function textReportToHtml(relatorioTexto) {
  const lines = String(relatorioTexto || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) {
    return `<p style="margin:0;color:#d1d5db;line-height:1.7;">Sem conteúdo para exibir.</p>`;
  }

  let html = "";
  let bullets = [];
  let ordered = [];

  const flushBullets = () => {
    if (!bullets.length) return;
    html += `<ul style="margin:0 0 14px 20px;padding:0;color:#d1d5db;">${bullets
      .map((item) => `<li style="margin:0 0 8px 0;line-height:1.65;">${inlineFormat(item)}</li>`)
      .join("")}</ul>`;
    bullets = [];
  };

  const flushOrdered = () => {
    if (!ordered.length) return;
    html += `<ol style="margin:0 0 14px 20px;padding:0;color:#d1d5db;">${ordered
      .map((item) => `<li style="margin:0 0 8px 0;line-height:1.65;">${inlineFormat(item)}</li>`)
      .join("")}</ol>`;
    ordered = [];
  };

  for (const line of lines) {
    if (/^[-•]\s+/.test(line)) {
      flushOrdered();
      bullets.push(line.replace(/^[-•]\s+/, ""));
      continue;
    }

    if (/^\d+[\)\.]\s+/.test(line)) {
      flushBullets();
      ordered.push(line.replace(/^\d+[\)\.]\s+/, ""));
      continue;
    }

    flushBullets();
    flushOrdered();

    if (/^[A-ZÀ-Ýa-zà-ÿ0-9\s]+:$/.test(line)) {
      html += `<h3 style="margin:16px 0 8px 0;font-size:16px;line-height:1.4;color:#ffffff;">${inlineFormat(
        line.replace(/:$/, "")
      )}</h3>`;
      continue;
    }

    html += `<p style="margin:0 0 12px 0;line-height:1.7;color:#d1d5db;">${inlineFormat(
      line
    )}</p>`;
  }

  flushBullets();
  flushOrdered();
  return html;
}

function buildEmailTemplate({
  nome,
  kicker,
  title,
  subtitle,
  relatorioTexto,
  ctaLabel,
  ctaUrl,
}) {
  const reportHtml = textReportToHtml(relatorioTexto);

  return `
<!DOCTYPE html>
<html lang="pt-BR">
  <body style="margin:0;padding:0;background:#050607;font-family:Inter,Segoe UI,Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:28px 14px;background:#050607;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;border:1px solid rgba(180,255,0,.22);border-radius:16px;overflow:hidden;background:#0a0d11;">
            <tr>
              <td style="padding:20px 24px 0 24px;">
                <div style="display:inline-block;background:rgba(180,255,0,.12);border:1px solid rgba(180,255,0,.26);color:#B4FF00;font-size:11px;letter-spacing:.16em;text-transform:uppercase;padding:7px 10px;border-radius:999px;">
                  ${escapeHtml(kicker)}
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:12px 24px 0 24px;">
                <h1 style="margin:0 0 8px 0;font-size:30px;line-height:1.15;color:#ffffff;">${escapeHtml(
                  title
                )}</h1>
                <p style="margin:0;color:#9ca3af;line-height:1.65;">Olá, ${escapeHtml(
                  nome
                )}. ${escapeHtml(subtitle)}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 24px 8px 24px;">
                <div style="border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.02);border-radius:12px;padding:18px 16px;">
                  ${reportHtml}
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 24px 26px 24px;">
                <a href="${escapeHtml(
                  ctaUrl
                )}" style="display:inline-block;background:#B4FF00;color:#000;text-decoration:none;font-weight:700;padding:12px 18px;border-radius:10px;">
                  ${escapeHtml(ctaLabel)}
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

async function sendEmailByResend(context, toEmail, subject, html) {
  const { resendApiKey, resendFromEmail } = getResendConfig(context);
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
      to: [toEmail],
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Falha ao enviar e-mail com Resend: ${errorText}`);
  }
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

  const userId = typeof body?.user_id === "string" ? body.user_id.trim() : "";
  if (!userId) {
    return Response.json(
      { error: "Campo obrigatório ausente: user_id." },
      { status: 400 }
    );
  }

  const trigger =
    typeof body?.trigger === "string" ? body.trigger.trim().toLowerCase() : "weekly";

  try {
    const nowIso = new Date().toISOString();
    const last7DaysIso = formatDateIsoDaysAgo(7);
    const last14DaysIso = formatDateIsoDaysAgo(14);

    const [interacoesSemanaAtual, interacoesSemanaAnterior] = await Promise.all([
      fetchInteracoesIntervalo(
        supabaseUrl,
        supabaseKey,
        userId,
        last7DaysIso,
        nowIso
      ),
      fetchInteracoesIntervalo(
        supabaseUrl,
        supabaseKey,
        userId,
        last14DaysIso,
        last7DaysIso
      ),
    ]);

    const perfil = await resolveUserProfile(
      supabaseUrl,
      supabaseKey,
      userId,
      typeof body?.nome === "string" ? body.nome.trim() : undefined,
      typeof body?.email === "string" ? body.email.trim() : undefined
    );

    const nomeCliente = perfil.nome || "Cliente";
    if (!perfil.email) {
      return Response.json(
        {
          error:
            "Não foi possível identificar e-mail do cliente para envio do relatório.",
        },
        { status: 400 }
      );
    }

    const resumoLocal =
      body?.resumo_local && typeof body.resumo_local === "object"
        ? body.resumo_local
        : undefined;

    const isWelcomeFlow = trigger === "welcome" || trigger === "subscription";
    let relatorio = "";

    if (isWelcomeFlow && interacoesSemanaAtual.length === 0) {
      relatorio = buildWelcomeReport(nomeCliente);
    } else {
      try {
        relatorio = await generateReportWithGemini(
          context,
          nomeCliente,
          interacoesSemanaAtual,
          interacoesSemanaAnterior,
          resumoLocal
        );
      } catch (_) {
        relatorio = buildDeterministicReport(
          nomeCliente,
          interacoesSemanaAtual,
          interacoesSemanaAnterior
        );
      }
    }

    const subject = isWelcomeFlow
      ? `Bem-vindo(a) à Área Exclusiva, ${nomeCliente} ⚡`
      : `Seu relatório semanal chegou, ${nomeCliente} ⚡`;

    const html = buildEmailTemplate({
      nome: nomeCliente,
      kicker: isWelcomeFlow ? "Boas-vindas" : "Relatório IA",
      title: isWelcomeFlow
        ? "Acesso ativado com sucesso"
        : "Seu relatório personalizado da semana",
      subtitle: isWelcomeFlow
        ? "Você já pode navegar na área exclusiva e receber recomendações mais inteligentes a cada interação."
        : "Este resumo foi gerado com base no que você consumiu na Área Exclusiva.",
      relatorioTexto: relatorio,
      ctaLabel: "Acessar minha área exclusiva",
      ctaUrl: "https://codexionai.pages.dev/",
    });

    await sendEmailByResend(context, perfil.email, subject, html);

    return Response.json({
      ok: true,
      user_id: userId,
      email_enviado_para: perfil.email,
      relatorio,
      trigger,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro inesperado ao gerar relatório.";
    return Response.json({ error: message }, { status: 500 });
  }
}
