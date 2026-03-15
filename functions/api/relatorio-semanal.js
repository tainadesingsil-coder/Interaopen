const GEMINI_SYSTEM_PROMPT = [
  "Você é o estrategista de aprendizado da Codexion.",
  "Escreva em português-BR com tom humano, claro e objetivo.",
  "NUNCA repita frases ou ideias.",
  "Se houver dados de criadores do Radar IA, cite nomes exatos e diferencie criadores vistos vs não vistos.",
  "Os insights precisam ser práticos e conectados ao conteúdo realmente consumido pelo cliente.",
  "A seção de evolução deve identificar claramente quando for o primeiro relatório do cliente.",
  "Os próximos passos devem ser adaptativos por perfil (iniciante, foco em live, foco em vídeo/notícia, alta consistência).",
  "Monte exatamente nesta estrutura:",
  "1) Saudação curta com nome.",
  "2) Resumo do consumo por categoria e tipo.",
  "3) Criadores do Radar: vistos x ainda não vistos.",
  "4) 3 insights acionáveis para o negócio do cliente.",
  "5) Conexões inteligentes cruzando 2+ conteúdos consumidos.",
  "6) Evolução versus semana anterior (se não houver base, diga que é o primeiro relatório).",
  "7) Plano da próxima semana em 3 passos numerados e adaptados ao perfil.",
  "8) Pergunta da semana provocadora e prática.",
  "9) Encerramento motivacional de até 2 frases.",
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
    resendReplyTo:
      env.RESEND_REPLY_TO ??
      processEnv.RESEND_REPLY_TO ??
      "",
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

const RADAR_CREATORS_DEFAULT = [
  "gaules",
  "alanzoka",
  "OpenAI",
  "Google AI",
  "OpenAI Newsroom",
  "Google DeepMind",
];

function splitMultilineList(value) {
  return String(value || "")
    .split(/\r?\n|\|/)
    .map((item) => item.replace(/^[\s\-•\d\)\.]+/, "").trim())
    .filter(Boolean);
}

function uniqueIgnoreCase(values) {
  const seen = new Set();
  const result = [];
  for (const raw of values || []) {
    const value = String(raw || "").trim();
    if (!value) continue;
    const key = value.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(value);
  }
  return result;
}

function normalizeForCompare(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function parseContentList(text) {
  return splitMultilineList(text).map((item) => item.trim()).filter(Boolean);
}

function collectConsumedContentNames(interacoes, local) {
  const fromInteractions = (interacoes || [])
    .map((item) => String(item?.titulo_conteudo || "").trim())
    .filter(Boolean);
  const fromLocal = parseContentList(local?.conteudos || "");
  const fromTimeline = parseContentList(local?.timeline || "");
  return uniqueIgnoreCase(fromInteractions.concat(fromLocal, fromTimeline));
}

function detectRadarSignals(consumedNames) {
  const normalized = (consumedNames || []).map((item) => ({
    raw: item,
    norm: normalizeForCompare(item),
  }));

  const hasGaules = normalized.some(
    (item) => item.norm.includes("gaules") || item.norm.includes("gaule")
  );
  const hasAlanzoka = normalized.some((item) => item.norm.includes("alanzoka"));

  const hasOpenAI = normalized.some((item) => item.norm.includes("openai"));
  const hasGoogleAI = normalized.some(
    (item) => item.norm.includes("google ai") || item.norm.includes("googleai")
  );
  const hasDeepMind = normalized.some((item) =>
    item.norm.includes("deepmind")
  );

  const hasHistoryAI = normalized.some(
    (item) =>
      item.norm.includes("historia da ia") ||
      item.norm.includes("historia ia") ||
      item.norm.includes("history of ai")
  );

  const launchKeywords = [
    "gpt",
    "modelo",
    "agent",
    "agente",
    "multimodal",
    "automation",
    "automacao",
    "api",
    "tool",
    "ferramenta",
    "gemini",
    "deep research",
    "assistants",
  ];
  const launchMentions = normalized
    .map((item) => item.raw)
    .filter((raw) =>
      launchKeywords.some((keyword) =>
        normalizeForCompare(raw).includes(normalizeForCompare(keyword))
      )
    );

  const creatorsConsumed = uniqueIgnoreCase(
    normalized
      .filter(
        (item) =>
          item.norm.includes("gaules") ||
          item.norm.includes("alanzoka") ||
          item.norm.includes("openai") ||
          item.norm.includes("google ai") ||
          item.norm.includes("deepmind")
      )
      .map((item) => item.raw)
  );

  return {
    hasGaules,
    hasAlanzoka,
    hasOpenAI,
    hasGoogleAI,
    hasDeepMind,
    hasHistoryAI,
    hasAnyCreatorContent:
      hasGaules || hasAlanzoka || hasOpenAI || hasGoogleAI || hasDeepMind,
    launchMentions: uniqueIgnoreCase(launchMentions),
    creatorsConsumed,
  };
}

function extractCreatorFromInteraction(item) {
  const title = String(item?.titulo_conteudo || "").trim();
  const url = String(item?.url_conteudo || "").trim();

  const fromLiveTitle = title.match(/live(?: twitch)?\s*:\s*([a-z0-9_\.]+)/i);
  if (fromLiveTitle?.[1]) return fromLiveTitle[1];

  const fromCanalTitle = title.match(/(?:canal|criador)\s*:\s*([^|,-]+)/i);
  if (fromCanalTitle?.[1]) return fromCanalTitle[1].trim();

  if (url) {
    try {
      const parsed = new URL(url);
      const host = parsed.hostname.replace(/^www\./i, "").toLowerCase();
      if (host.includes("twitch.tv")) {
        const parts = parsed.pathname.split("/").filter(Boolean);
        if (parts[0]) return parts[0];
      }
      if (host.includes("youtube.com") || host.includes("youtu.be")) {
        return "YouTube";
      }
      if (host.includes("tiktok.com")) {
        return "TikTok";
      }
      if (host.includes("openai.com")) {
        return "OpenAI";
      }
      if (host.includes("deepmind.google")) {
        return "Google DeepMind";
      }
    } catch {
      // ignore invalid urls
    }
  }

  return "";
}

function normalizeResumoLocal(resumoLocal) {
  const totalRaw = Number(resumoLocal?.total ?? 0);
  const total = Number.isFinite(totalRaw) && totalRaw > 0 ? Math.round(totalRaw) : 0;
  const todayTotalRaw = Number(resumoLocal?.today_total ?? 0);
  const todayTotal =
    Number.isFinite(todayTotalRaw) && todayTotalRaw > 0
      ? Math.round(todayTotalRaw)
      : 0;
  const liveCountRaw = Number(resumoLocal?.live_count ?? 0);
  const liveCount =
    Number.isFinite(liveCountRaw) && liveCountRaw > 0 ? Math.round(liveCountRaw) : 0;
  const videoCountRaw = Number(resumoLocal?.video_count ?? 0);
  const videoCount =
    Number.isFinite(videoCountRaw) && videoCountRaw > 0
      ? Math.round(videoCountRaw)
      : 0;
  const categorias =
    typeof resumoLocal?.categorias === "string" ? resumoLocal.categorias.trim() : "";
  const ultimos =
    typeof resumoLocal?.ultimos === "string" ? resumoLocal.ultimos.trim() : "";
  const conteudos =
    typeof resumoLocal?.conteudos === "string" ? resumoLocal.conteudos.trim() : "";
  const timeline =
    typeof resumoLocal?.timeline === "string" ? resumoLocal.timeline.trim() : "";
  const creatorsSeenRaw =
    typeof resumoLocal?.creators_seen === "string"
      ? resumoLocal.creators_seen
      : "";
  const radarCreatorsRaw =
    typeof resumoLocal?.radar_creators === "string"
      ? resumoLocal.radar_creators
      : "";
  const creatorsSeen = uniqueIgnoreCase(splitMultilineList(creatorsSeenRaw));
  const radarCreators = uniqueIgnoreCase(
    splitMultilineList(radarCreatorsRaw).concat(RADAR_CREATORS_DEFAULT)
  );
  return {
    total,
    todayTotal,
    liveCount,
    videoCount,
    categorias,
    ultimos,
    conteudos,
    timeline,
    creatorsSeen,
    radarCreators,
  };
}

function buildContextualInsights(signals, context) {
  const insights = [];
  const creatorsLabel = context.creatorsSeen.slice(0, 3).join(", ");
  const launchLabel = context.launchHints.length
    ? context.launchHints.slice(0, 2).join(" | ")
    : "novas automações, agentes e fluxos multimodais";

  if (signals.hasGaules || signals.hasAlanzoka) {
    const creatorNames = [];
    if (signals.hasGaules) creatorNames.push("gaules");
    if (signals.hasAlanzoka) creatorNames.push("alanzoka");
    insights.push(
      `Você consumiu ${creatorNames.join(
        " e "
      )}. O diferencial desses criadores é disciplina diária + gestão de comunidade em tempo real; replique isso criando um calendário fixo (mínimo 5 dias/semana) com quadro recorrente e CTA claro para o seu negócio.`
    );
  }

  if (signals.hasOpenAI || signals.hasGoogleAI || signals.hasDeepMind) {
    const aiSources = [];
    if (signals.hasOpenAI) aiSources.push("OpenAI");
    if (signals.hasGoogleAI) aiSources.push("Google AI");
    if (signals.hasDeepMind) aiSources.push("Google DeepMind");
    insights.push(
      `Você acompanhou ${aiSources.join(
        ", "
      )}. O sinal tecnológico da semana aponta para ${launchLabel}; aplique isso automatizando 1 processo crítico (ex.: qualificação de leads, suporte inicial ou produção de conteúdo) com meta de reduzir tempo operacional já nesta semana.`
    );
  }

  if (signals.hasHistoryAI) {
    insights.push(
      "Ao revisar História da IA, o padrão fica claro: quem transforma mudança tecnológica em rotina operacional vence. Traduza isso hoje em um playbook simples de 1 página para seu time executar IA no dia a dia."
    );
  }

  if (context.currentTotal >= 14) {
    insights.push(
      `Seu volume de interação (${context.currentTotal}) mostra consistência acima da média. O próximo nível agora é execução orientada a KPI: escolha 1 métrica principal e conecte cada conteúdo consumido a uma decisão prática.`
    );
  } else if (context.currentTotal > 0) {
    insights.push(
      `Você já iniciou bem (${context.currentTotal} ações), mas ainda falta densidade para máxima precisão. Foque em sessões mais profundas (30–40 min) e finalize cada sessão com 1 ação executável.`
    );
  }

  while (insights.length < 3) {
    insights.push(
      "Use o conteúdo consumido como matéria-prima de execução: uma decisão por sessão, uma ação por dia, uma revisão por semana."
    );
  }

  return insights.slice(0, 3);
}

function buildIntelligentConnections(signals, context) {
  const connections = [];
  const hasCreatorPerformance = signals.hasGaules || signals.hasAlanzoka;
  const hasAiTech = signals.hasOpenAI || signals.hasGoogleAI || signals.hasDeepMind;

  if (hasCreatorPerformance && hasAiTech) {
    const creator = signals.hasGaules
      ? "gaules"
      : signals.hasAlanzoka
      ? "alanzoka"
      : "criadores de alta performance";
    const aiSource = signals.hasOpenAI
      ? "OpenAI"
      : signals.hasGoogleAI
      ? "Google AI"
      : "Google DeepMind";
    connections.push(
      `${creator} aplica consistência extrema + ${aiSource} acelera automação = oportunidade de escalar frequência de conteúdo sem perder qualidade.`
    );
  }

  if (signals.hasHistoryAI && hasAiTech) {
    connections.push(
      `História da IA mostra ciclos de adoção rápidos + tecnologias atuais indicam janela de vantagem competitiva agora; quem operacionalizar primeiro captura atenção e mercado.`
    );
  }

  if (context.pendingCreators.length > 0 && context.creatorsSeen.length > 0) {
    connections.push(
      `Você já validou ${context.creatorsSeen.slice(
        0,
        2
      ).join(", ")}; ao adicionar ${context.pendingCreators
        .slice(0, 2)
        .join(", ")} você amplia repertório sem perder foco.`
    );
  }

  if (!connections.length) {
    connections.push(
      "Conectar conteúdo + execução é o multiplicador principal: para cada tema consumido, defina imediatamente uma aplicação prática no funil do negócio."
    );
  }

  return connections.slice(0, 2);
}

function buildWeekQuestion(signals, context) {
  const hasCreatorPerformance = signals.hasGaules || signals.hasAlanzoka;
  const hasAiTech = signals.hasOpenAI || signals.hasGoogleAI || signals.hasDeepMind;

  if (context.isFirstReport) {
    return "Qual processo do seu negócio mais drena tempo hoje e poderia ser o primeiro a ser automatizado com IA ainda esta semana?";
  }

  if (hasCreatorPerformance && hasAiTech) {
    return "Se você tivesse que unir a consistência dos criadores do Radar com uma automação de IA em um único plano de 7 dias, qual rotina começaria amanhã às 9h?";
  }

  if (signals.hasHistoryAI) {
    return "Qual decisão você está adiando por medo de mudança tecnológica, mesmo sabendo que a janela de vantagem acontece agora?";
  }

  if (context.pendingCreators.length > 0) {
    return `Qual criador pendente (${context.pendingCreators[0]}) pode destravar um insight novo para seu negócio nesta semana?`;
  }

  return "Qual ação concreta você vai executar nas próximas 24h para transformar este relatório em resultado real?";
}

function buildDeterministicReport(nome, atual, anterior, resumoLocal) {
  const local = normalizeResumoLocal(resumoLocal);
  const byCategory = aggregateByCategory(atual);
  const byType = aggregateByType(atual);
  const currentTotal =
    atual.length > 0 ? atual.length : local.todayTotal || local.total;
  const topCategory =
    atual.length > 0
      ? summarizeMap(byCategory, 4)
      : local.categorias || summarizeMap(byCategory, 4);
  const topType =
    Object.keys(byType).length > 0
      ? summarizeMap(byType, 4)
      : local.ultimos
      ? "live_play, abriu_conteudo, video_play, tempo_na_area"
      : summarizeMap(byType, 4);
  const liveCount =
    (byType.live_play ?? 0) + (byType.live_open ?? 0) + local.liveCount;
  const videoCount = (byType.video_play ?? 0) + local.videoCount;
  const creatorsFromInteractions = uniqueIgnoreCase(
    atual.map((item) => extractCreatorFromInteraction(item)).filter(Boolean)
  );
  const creatorsSeen = uniqueIgnoreCase(
    creatorsFromInteractions.concat(local.creatorsSeen)
  );
  const radarCreators = uniqueIgnoreCase(local.radarCreators);
  const pendingCreators = radarCreators.filter(
    (creator) =>
      !creatorsSeen.some((seen) => seen.toLowerCase() === creator.toLowerCase())
  );
  const consumedNames = collectConsumedContentNames(atual, local);
  const signals = detectRadarSignals(consumedNames);
  const launchHints = uniqueIgnoreCase(signals.launchMentions);
  const dominantType =
    Object.entries(byType).sort((a, b) => b[1] - a[1])[0]?.[0] ||
    (liveCount > videoCount ? "live_play" : "video_play");
  const diff = currentTotal - anterior.length;
  const isFirstReport = anterior.length === 0;
  const evolutionLabel =
    isFirstReport
      ? "Este é o primeiro relatório deste usuário. A partir do próximo ciclo teremos comparação de evolução."
      : diff === 0
      ? "Consumo estável em relação à semana passada."
      : diff > 0
      ? `Você evoluiu: +${diff} ações em relação à semana passada.`
      : `Ritmo menor: ${Math.abs(diff)} ações a menos que na semana passada.`;

  const recentes =
    atual.length > 0
      ? atual
          .slice(0, 5)
          .map(
            (item) =>
              `- ${item?.categoria || "Conteúdo"}: ${
                item?.titulo_conteudo || "Interação na área exclusiva"
              }`
          )
          .join("\n")
      : local.ultimos;
  const timeline = local.timeline || local.ultimos;
  const conteudosEspecificos = local.conteudos;
  const insights = buildContextualInsights(signals, {
    creatorsSeen,
    launchHints,
    currentTotal,
    liveCount,
    videoCount,
  });
  const intelligentConnections = buildIntelligentConnections(signals, {
    creatorsSeen,
    pendingCreators,
  });
  const weekQuestion = buildWeekQuestion(signals, {
    isFirstReport,
    pendingCreators,
  });

  const nextSteps = [];
  if (isFirstReport) {
    nextSteps.push(
      "1) Defina 2 criadores do Radar para acompanhar de forma intencional nesta semana."
    );
    nextSteps.push(
      "2) Assista 1 live + 1 vídeo e registre 3 decisões de negócio baseadas no conteúdo."
    );
    nextSteps.push(
      "3) Volte amanhã para gerar base comparativa e ativar evolução semanal personalizada."
    );
  } else if (
    (signals.hasGaules || signals.hasAlanzoka) &&
    (signals.hasOpenAI || signals.hasGoogleAI || signals.hasDeepMind)
  ) {
    nextSteps.push(
      "1) Escolha um formato recorrente inspirado nos criadores que você viu e padronize uma rotina semanal de publicação."
    );
    nextSteps.push(
      "2) Automatize a etapa mais repetitiva desse formato com IA (roteiro, clipping, distribuição ou atendimento)."
    );
    nextSteps.push(
      "3) Mensure impacto em audiência ou conversão e ajuste no próximo relatório com base nos números."
    );
  } else if (dominantType.includes("live")) {
    nextSteps.push(
      "1) Escolha a live com maior aderência ao seu negócio e extraia 2 oportunidades acionáveis."
    );
    nextSteps.push(
      "2) Teste uma ação nas próximas 24h (oferta, criativo ou abordagem comercial)."
    );
    nextSteps.push(
      "3) Compare resultado no próximo relatório para validar evolução real."
    );
  } else {
    nextSteps.push(
      "1) Selecione um conteúdo prioritário e transforme em um plano com início/fim nesta semana."
    );
    nextSteps.push(
      "2) Defina métrica de sucesso simples (leads, reuniões, conversão ou retenção)."
    );
    nextSteps.push(
      "3) Reavalie no próximo relatório e ajuste com base no que funcionou."
    );
  }

  return [
    `Olá, ${nome}!`,
    ``,
    `Resumo do seu dia na Área Exclusiva:`,
    `- Total de ações: ${currentTotal}`,
    `- Lives assistidas: ${liveCount || 0}`,
    `- Vídeos assistidos: ${videoCount || 0}`,
    `- Categorias com mais consumo: ${topCategory}`,
    `- Tipos de ação mais frequentes: ${topType}`,
    ``,
    `Criadores monitorados no Radar:`,
    `- Já acompanhados: ${
      creatorsSeen.length ? creatorsSeen.join(", ") : "Nenhum identificado ainda"
    }`,
    `- Ainda para acompanhar: ${
      pendingCreators.length ? pendingCreators.slice(0, 6).join(", ") : "Cobertura completa dos criadores atuais"
    }`,
    ``,
    `Conteúdos específicos identificados:`,
    conteudosEspecificos || "- Sem conteúdo nominal identificado ainda.",
    ``,
    `Ações recentes:`,
    recentes || timeline || "- Sem ações recentes registradas.",
    ``,
    `Insights práticos:`,
    `- ${insights[0]}`,
    `- ${insights[1]}`,
    `- ${insights[2]}`,
    ``,
    `Conexões inteligentes:`,
    ...intelligentConnections.map((item) => `- ${item}`),
    ``,
    `Evolução:`,
    `- ${evolutionLabel}`,
    ``,
    `Próximos passos (7 dias):`,
    ...nextSteps,
    ``,
    `Pergunta da semana:`,
    `- ${weekQuestion}`,
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
  const local = normalizeResumoLocal(resumoLocal);
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
    `Primeiro relatório do cliente?: ${anterior.length === 0 ? "sim" : "não"}`,
    `Categorias semana atual: ${JSON.stringify(categoriasAtual)}`,
    `Categorias semana anterior: ${JSON.stringify(categoriasAnterior)}`,
    `Tipos semana atual: ${JSON.stringify(tiposAtual)}`,
    `Conteúdos recentes: ${JSON.stringify(recentes)}`,
    `Resumo local opcional do frontend: ${JSON.stringify(resumoLocal || {})}`,
    `Criadores vistos no Radar (local): ${JSON.stringify(local.creatorsSeen)}`,
    `Criadores monitorados no Radar (local): ${JSON.stringify(local.radarCreators)}`,
    `Conteúdos específicos (local): ${local.conteudos || "não informado"}`,
    `Timeline local: ${local.timeline || "não informado"}`,
    "Regra de interpretação contextual:",
    "- gaules/alanzoka => extrair mentalidade de alta performance, gestão de comunidade, crescimento de audiência, disciplina e consistência aplicável ao negócio do cliente.",
    "- OpenAI/Google AI/Google DeepMind => identificar tecnologia discutida/lançada e sugerir aplicação específica no contexto do cliente.",
    "- História da IA => conectar contexto histórico com oportunidade prática imediata.",
    "Reforço obrigatório: cite conteúdos/lives/vídeos por nome quando existirem no input. Evite termos genéricos.",
    "Se faltarem títulos exatos, diga isso explicitamente em 1 linha e use os itens de timeline disponíveis.",
    "Nos próximos passos, adapte por perfil observado do usuário e explique a lógica em ações concretas.",
    "Não repetir frases. Clareza e objetividade acima de tudo.",
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
  const { resendApiKey, resendFromEmail, resendReplyTo } = getResendConfig(context);
  if (!resendApiKey) {
    throw new Error("RESEND_API_KEY não configurada.");
  }

  const payload = {
    from: resendFromEmail,
    to: [toEmail],
    subject,
    html,
  };
  if (resendReplyTo) {
    payload.reply_to = resendReplyTo;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Falha ao enviar e-mail com Resend: ${errorText}`);
  }
}

export async function onRequestPost(context) {
  const { supabaseUrl, supabaseKey } = getSupabaseConfig(context);
  const hasSupabase = Boolean(supabaseUrl && supabaseKey);

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
  const providedNome = typeof body?.nome === "string" ? body.nome.trim() : "";
  const providedEmail = typeof body?.email === "string" ? body.email.trim() : "";

  try {
    let interacoesSemanaAtual = [];
    let interacoesSemanaAnterior = [];
    let perfil = {
      nome: providedNome || "Cliente",
      email: providedEmail || "",
    };

    if (hasSupabase) {
      const nowIso = new Date().toISOString();
      const last7DaysIso = formatDateIsoDaysAgo(7);
      const last14DaysIso = formatDateIsoDaysAgo(14);

      [interacoesSemanaAtual, interacoesSemanaAnterior] = await Promise.all([
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

      perfil = await resolveUserProfile(
        supabaseUrl,
        supabaseKey,
        userId,
        providedNome || undefined,
        providedEmail || undefined
      );
    }

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
    const hasRichLocalSummary = Boolean(
      resumoLocal &&
        (typeof resumoLocal.conteudos === "string" ||
          typeof resumoLocal.ultimos === "string" ||
          typeof resumoLocal.timeline === "string")
    );
    let relatorio = "";

    if (isWelcomeFlow && interacoesSemanaAtual.length === 0) {
      relatorio = buildWelcomeReport(nomeCliente);
    } else if (interacoesSemanaAtual.length === 0 && hasRichLocalSummary) {
      relatorio = buildDeterministicReport(
        nomeCliente,
        interacoesSemanaAtual,
        interacoesSemanaAnterior,
        resumoLocal
      );
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
          interacoesSemanaAnterior,
          resumoLocal
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
