import { jsPDF } from "jspdf";

const GEMINI_SYSTEM_PROMPT = [
  "Você é o estrategista de aprendizado da Codexion.",
  "Escreva em português-BR com tom humano, claro e objetivo.",
  "NUNCA repita frases ou ideias.",
  "Detecte perfil do usuário com base no consumo: GAMER, TECH, EMPREENDEDOR ou HÍBRIDO.",
  "Definições de perfil:",
  "- GAMER: consumo majoritário de lives/jogos/esports sem foco relevante em negócios/tech aplicada.",
  "- TECH: consumo majoritário de IA, tecnologia, startups e inovação.",
  "- EMPREENDEDOR: consumo majoritário de marketing, negócios, vendas e gestão.",
  "- HÍBRIDO: consumo equilibrado entre jogos e tecnologia/negócios.",
  "Se houver dados de criadores do Radar IA, cite nomes exatos e diferencie criadores vistos vs não vistos.",
  "Os insights precisam ser práticos e conectados ao conteúdo realmente consumido pelo cliente.",
  "Se perfil for GAMER, NÃO force conexão com negócios; foco em jogo, live, técnicas e gameplay.",
  "Se perfil for HÍBRIDO, separar explicitamente seção Gamer e seção Tech/Negócio.",
  "A seção de evolução deve identificar claramente quando for o primeiro relatório do cliente.",
  "Os próximos passos devem ser adaptativos por perfil (iniciante, foco em live, foco em vídeo/notícia, alta consistência).",
  "Monte exatamente nesta estrutura:",
  "1) Saudação curta com nome.",
  "2) Perfil detectado + resumo do consumo por categoria/tipo.",
  "3) Criadores do Radar: vistos x ainda não vistos.",
  "4) Resumo específico dos conteúdos consumidos (OpenAI/Google/DeepMind/História IA/lives).",
  "5) 3 insights acionáveis adaptados ao perfil detectado.",
  "6) Conexões inteligentes cruzando 2+ conteúdos consumidos.",
  "7) Evolução versus semana anterior (se não houver base, diga que é o primeiro relatório).",
  "8) Plano da próxima semana em passos adaptados ao perfil.",
  "9) Pergunta da semana provocadora e prática (no HÍBRIDO: opção gamer + opção tech).",
  "10) Encerramento motivacional de até 2 frases.",
  "Use frases curtas, sem jargão técnico desnecessário.",
  "Você tem acesso ao histórico de relatórios anteriores deste usuário. Nunca repita insights já enviados. Sempre evolua o nível de profundidade. Se o usuário assistiu uma live de programação vá fundo no que foi desenvolvido, quais tecnologias foram usadas e o que o usuário pode construir a partir disso. Seja um mentor técnico real, não um resumidor genérico.",
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

function getTwitchConfig(context) {
  const env = getEnv(context);
  const processEnv = getProcessEnv();
  const twitchAccessToken =
    env.TWITCH_ACCESS_TOKEN ?? processEnv.TWITCH_ACCESS_TOKEN ?? "";
  const twitchClientId =
    env.TWITCH_CLIENT_ID ??
    env.TWITCH_APP_CLIENT_ID ??
    processEnv.TWITCH_CLIENT_ID ??
    processEnv.TWITCH_APP_CLIENT_ID ??
    processEnv.NEXT_PUBLIC_TWITCH_CLIENT_ID ??
    "";
  return { twitchAccessToken, twitchClientId };
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

function extractHistoryReportText(row) {
  if (!row || typeof row !== "object") return "";
  const candidates = [
    row.relatorio,
    row.relatorio_texto,
    row.report_text,
    row.report,
    row.conteudo,
    row.texto,
    row.body,
  ];
  return String(candidates.find((value) => typeof value === "string" && value.trim()) || "").trim();
}

async function fetchHistoricoRelatorios(supabaseUrl, supabaseKey, userId) {
  try {
    const params = new URLSearchParams({
      select: "*",
      user_id: `eq.${userId}`,
      limit: "8",
    });
    const response = await fetch(
      `${supabaseUrl}/rest/v1/historico_relatorios?${params.toString()}`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
        cache: "no-store",
      }
    );
    if (!response.ok) {
      return [];
    }
    const rows = await response.json();
    if (!Array.isArray(rows)) return [];
    return rows.map((row) => extractHistoryReportText(row)).filter(Boolean);
  } catch {
    return [];
  }
}

async function saveHistoricoRelatorio(
  supabaseUrl,
  supabaseKey,
  userId,
  nome,
  email,
  relatorio
) {
  const payload = {
    user_id: userId,
    nome,
    email,
    relatorio,
    gerado_em: new Date().toISOString(),
  };
  try {
    await fetch(`${supabaseUrl}/rest/v1/historico_relatorios`, {
      method: "POST",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(payload),
    });
  } catch {
    // best effort only
  }
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
  "teomewhy",
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

const GAMER_KEYWORDS = [
  "gaules",
  "alanzoka",
  "esports",
  "twitch",
  "cs",
  "cs2",
  "counter-strike",
  "valorant",
  "league of legends",
  "lol",
  "dota",
  "fortnite",
  "free fire",
  "pubg",
  "rank",
  "clutch",
  "x1",
  "ace",
  "md3",
  "mapa",
  "crosshair",
];

const TECH_KEYWORDS = [
  "openai",
  "google ai",
  "deepmind",
  "ia",
  "ai",
  "gpt",
  "gemini",
  "modelo",
  "agent",
  "agente",
  "api",
  "startup",
  "inovacao",
  "inovação",
  "llm",
  "research",
  "multimodal",
  "automacao",
  "automação",
  "software development",
  "game development",
  "teomewhy",
];

const BUSINESS_KEYWORDS = [
  "marketing",
  "negocio",
  "negócio",
  "vendas",
  "gestao",
  "gestão",
  "growth",
  "seo",
  "lead",
  "funil",
  "conversao",
  "conversão",
  "receita",
  "ticket",
  "crm",
  "oferta",
  "copys",
  "anuncio",
  "anúncio",
  "projeto",
];

function countKeywordHits(text, keywords) {
  const normalized = normalizeForCompare(text);
  if (!normalized) return 0;
  return (keywords || []).reduce((acc, keyword) => {
    const key = normalizeForCompare(keyword);
    return acc + (key && normalized.includes(key) ? 1 : 0);
  }, 0);
}

function detectUserProfile(consumedNames, local, byCategory, byType) {
  const corpus = [
    ...(consumedNames || []),
    local?.categorias || "",
    local?.timeline || "",
    local?.conteudos || "",
  ].join(" | ");

  const gamerScore =
    countKeywordHits(corpus, GAMER_KEYWORDS) +
    Number(byType?.live_play || 0) +
    Number(byCategory?.live || 0);
  const techScore =
    countKeywordHits(corpus, TECH_KEYWORDS) +
    Number(byCategory?.video || 0) * 0.4 +
    Number(byCategory?.noticia || 0) * 0.7;
  const empreendedorScore =
    countKeywordHits(corpus, BUSINESS_KEYWORDS) +
    Number(byCategory?.marketing || 0) +
    Number(byCategory?.negocios || 0) +
    Number(byCategory?.vendas || 0);

  const nonGamer = techScore + empreendedorScore;
  const hasBalancedHybrid =
    gamerScore >= 2 &&
    nonGamer >= 2 &&
    Math.abs(gamerScore - nonGamer) <= Math.max(2, Math.round((gamerScore + nonGamer) * 0.45));

  let profile = "TECH";
  if (hasBalancedHybrid) {
    profile = "HÍBRIDO";
  } else if (gamerScore >= techScore && gamerScore >= empreendedorScore) {
    profile = nonGamer <= Math.max(1, gamerScore * 0.55) ? "GAMER" : "HÍBRIDO";
  } else if (empreendedorScore > techScore) {
    profile = "EMPREENDEDOR";
  } else {
    profile = "TECH";
  }

  return {
    profile,
    gamerScore,
    techScore,
    empreendedorScore,
  };
}

function inferMainGame(consumedNames, timeline) {
  const text = normalizeForCompare(
    `${(consumedNames || []).join(" | ")} | ${timeline || ""}`
  );
  const gameMatchers = [
    { name: "CS2", keys: ["cs2", "counter-strike", "cs "] },
    { name: "Valorant", keys: ["valorant"] },
    { name: "League of Legends", keys: ["league of legends", " lol", "lol "] },
    { name: "Free Fire", keys: ["free fire"] },
    { name: "Fortnite", keys: ["fortnite"] },
    { name: "PUBG", keys: ["pubg"] },
    { name: "Dota 2", keys: ["dota 2", "dota2", "dota "] },
  ];

  for (const game of gameMatchers) {
    if (game.keys.some((key) => text.includes(normalizeForCompare(key)))) {
      return game.name;
    }
  }
  return "Jogo não identificado com precisão";
}

function normalizeTimelineEntry(line) {
  return String(line || "")
    .replace(/^[\s\-•]*\d{1,2}:\d{2}\s*[·\-\u2013]\s*/u, "")
    .replace(/^(live_play|video_play|abriu_conteudo)\s*:\s*/i, "")
    .trim();
}

function inferLiveMoment(timeline, gameName) {
  const list = String(timeline || "")
    .split(/\r?\n/)
    .map((line) => normalizeTimelineEntry(line))
    .filter(Boolean);
  const intenseTokens = ["clutch", "virada", "overtime", "x1", "ace", "final"];
  const intense = list.find((line) =>
    intenseTokens.some((token) => normalizeForCompare(line).includes(token))
  );
  if (intense) {
    return `Momento mais intenso detectado: ${intense}.`;
  }
  const firstLive = list.find((line) =>
    normalizeForCompare(line).includes("live")
  );
  if (firstLive) {
    return `Trecho principal da live (${gameName}): ${firstLive}.`;
  }
  return `Live de ${gameName}: não houve detalhe textual de clipe, mas o consumo foi consistente ao longo da sessão.`;
}

function inferGameplayTechniques(gameName) {
  const map = {
    CS2: [
      "controle de economia por round",
      "uso de utilitários antes da entrada",
      "trade e reposicionamento após eliminação",
    ],
    Valorant: [
      "sincronização de utilitários por função",
      "timing de entrada e pós-plant",
      "troca rápida de posição para negação de informação",
    ],
    "League of Legends": [
      "controle de visão e tempo de objetivo",
      "gestão de wave para pressionar mapa",
      "execução disciplinada em teamfights",
    ],
    "Free Fire": [
      "rotação inteligente por cobertura",
      "controle de altura e zona",
      "tomada de duelo só com vantagem de posição",
    ],
    Fortnite: [
      "timing de construção/edição sob pressão",
      "rotação com leitura de safe zone",
      "controle de recurso para endgame",
    ],
    PUBG: [
      "rotação antecipada de zona",
      "uso de utilitário para negar visão",
      "disciplina de posicionamento em fight longa",
    ],
    "Dota 2": [
      "controle de tempo de rota e runas",
      "sincronização de ultimate por objetivo",
      "visão para pickoff e controle de mapa",
    ],
  };
  return (
    map[gameName] || [
      "disciplina de posicionamento",
      "timing de tomada de decisão",
      "consistência mecânica sob pressão",
    ]
  );
}

function classifyTechLaunchFromContent(name) {
  const norm = normalizeForCompare(name);
  if (norm.includes("agente") || norm.includes("agent")) {
    return {
      launch: "novo agente/autonomia assistida",
      does: "executa tarefas em etapas com menor intervenção manual",
      matters: "reduz tempo operacional e aumenta escala de execução",
    };
  }
  if (norm.includes("modelo") || norm.includes("gpt") || norm.includes("gemini")) {
    return {
      launch: "atualização de modelo de IA",
      does: "melhora raciocínio, contexto e qualidade de respostas",
      matters: "eleva produtividade em criação, análise e atendimento",
    };
  }
  if (norm.includes("research") || norm.includes("deepmind")) {
    return {
      launch: "avanço de pesquisa aplicada",
      does: "apresenta novas capacidades e métodos de IA",
      matters: "antecipa oportunidades de adoção competitiva",
    };
  }
  return {
    launch: "atualização de tecnologia/IA",
    does: "introduz recurso com potencial de automação e aceleração",
    matters: "permite executar mais com menos custo operacional",
  };
}

function parseTwitchLiveDetail(text) {
  const raw = String(text || "").trim();
  if (!raw) return null;
  const normalized = normalizeForCompare(raw);
  const isLikelyTwitchLive =
    normalized.includes("twitch live") ||
    normalized.includes("ao vivo") ||
    normalized.includes("espectadores") ||
    /@[a-z0-9_]{3,}/i.test(raw);
  if (!isLikelyTwitchLive) return null;

  const segments = raw
    .split("·")
    .map((part) => part.trim())
    .filter(Boolean);
  const titleSegmentRaw = (segments[0] || raw)
    .replace(/^twitch live\s*[·:\-]?\s*/i, "")
    .trim();
  const titleSegment = titleSegmentRaw.replace(/^\d{1,2}:\d{2}\s*/, "").trim();
  const channelMatch = raw.match(/@([a-z0-9_]+)/i);
  if ((!titleSegment && !channelMatch?.[1]) || /^:\d{2}$/.test(titleSegment)) return null;
  const categorySegment =
    segments.find(
      (segment) =>
        !/espectadores|ao vivo|hours|minutes|seconds|@/i.test(segment) &&
        !/dia de/i.test(segment) &&
        !/^twitch live$/i.test(segment.trim())
    ) || "";
  const viewersMatch = raw.match(/(\d[\d\.\,]*)\s*espectadores/i);
  const durationMatch =
    raw.match(/ao vivo h[áa]\s*([^·\n]+)/i) ||
    raw.match(/live h[áa]\s*([^·\n]+)/i);
  const commands = uniqueIgnoreCase(raw.match(/![a-z0-9_]+/gi) || []);

  let viewers = "";
  if (viewersMatch?.[1]) {
    viewers = viewersMatch[1].replace(/[^\d]/g, "");
  }

  return {
    title:
      (!titleSegment && channelMatch?.[1]) ||
      (/^live twitch$/i.test(titleSegment) && channelMatch?.[1])
        ? `Live de @${channelMatch[1]}`
        : titleSegment || "Live Twitch",
    category: categorySegment,
    channel: channelMatch?.[1] || "",
    viewers,
    duration: durationMatch?.[1]?.trim() || "",
    commands,
  };
}

function collectTwitchLiveDetails(consumedNames, local) {
  const sources = []
    .concat(consumedNames || [])
    .concat(
      String(local?.timeline || "")
        .split(/\r?\n/)
        .map((line) => normalizeTimelineEntry(line))
        .filter(Boolean)
    )
    .concat(
      String(local?.ultimos || "")
        .split(/\r?\n/)
        .map((line) => normalizeTimelineEntry(line))
        .filter(Boolean)
    )
    .concat(parseContentList(local?.conteudos || ""));

  const details = [];
  const seen = new Set();
  for (const source of sources) {
    const parsed = parseTwitchLiveDetail(source);
    if (!parsed) continue;
    const key = `${normalizeForCompare(parsed.title)}|${parsed.channel}`;
    if (seen.has(key)) continue;
    seen.add(key);
    details.push(parsed);
  }
  return details.slice(0, 4);
}

const KNOWN_CREATOR_PROFILES = {
  teomewhy: "desenvolvedor de software brasileiro que ensina programação ao vivo",
};

const TECHNOLOGY_SIGNAL_MAP = [
  { tech: "TypeScript", keys: ["typescript", "ts "] },
  { tech: "JavaScript", keys: ["javascript", "js "] },
  { tech: "Node.js", keys: ["node", "nodejs", "node.js"] },
  { tech: "React", keys: ["react", "jsx"] },
  { tech: "Next.js", keys: ["next.js", "nextjs", "app router"] },
  { tech: "Python", keys: ["python", "fastapi", "django", "flask"] },
  { tech: "Docker", keys: ["docker", "container"] },
  { tech: "PostgreSQL", keys: ["postgres", "postgresql", "sql"] },
  { tech: "Supabase", keys: ["supabase"] },
  { tech: "Git/GitHub", keys: ["git", "github", "pull request", "commit"] },
];

const TECH_RESOURCE_LINKS = {
  TypeScript: "https://www.typescriptlang.org/docs/",
  JavaScript: "https://developer.mozilla.org/pt-BR/docs/Web/JavaScript",
  "Node.js": "https://nodejs.org/docs/latest/api/",
  React: "https://react.dev/learn",
  "Next.js": "https://nextjs.org/docs",
  Python: "https://docs.python.org/3/",
  Docker: "https://docs.docker.com/",
  PostgreSQL: "https://www.postgresql.org/docs/",
  Supabase: "https://supabase.com/docs",
  "Git/GitHub": "https://docs.github.com/pt",
};

function isDevelopmentOrTechnologyLive(detail) {
  const text = normalizeForCompare(
    `${detail?.title || ""} | ${detail?.category || ""}`
  );
  return (
    text.includes("software") ||
    text.includes("development") ||
    text.includes("programacao") ||
    text.includes("programação") ||
    text.includes("dev") ||
    text.includes("codigo") ||
    text.includes("projeto") ||
    text.includes("tech")
  );
}

function inferLikelyDevelopment(detail) {
  const title = normalizeForCompare(detail?.title || "");
  if (title.includes("f1") || title.includes("projeto")) {
    return "Construção prática de projeto ao vivo (iterações rápidas, ajustes e implementação guiada por comunidade).";
  }
  if (title.includes("debug") || title.includes("erro")) {
    return "Sessão focada em depuração e estabilização de funcionalidades em ambiente real.";
  }
  return "Sessão de desenvolvimento aplicada com foco em implementação de funcionalidades e revisão técnica.";
}

function inferTechnologiesFromTexts(texts) {
  const corpus = normalizeForCompare((texts || []).join(" | "));
  const found = [];
  for (const signal of TECHNOLOGY_SIGNAL_MAP) {
    if (
      signal.keys.some((key) =>
        corpus.includes(normalizeForCompare(String(key)))
      )
    ) {
      found.push(signal.tech);
    }
  }
  if (!found.length) {
    return ["TypeScript", "Node.js", "Git/GitHub"];
  }
  return found.slice(0, 6);
}

function buildTechConcepts(technologies, detail) {
  const concepts = [];
  if (technologies.includes("TypeScript")) {
    concepts.push("tipagem avançada para reduzir bugs em produção");
  }
  if (technologies.includes("React") || technologies.includes("Next.js")) {
    concepts.push("arquitetura de componentes e gerenciamento de estado orientado a performance");
  }
  if (technologies.includes("Node.js")) {
    concepts.push("design de APIs e separação de camadas para escalar manutenção");
  }
  if (!concepts.length) {
    concepts.push(
      "quebra de problema em tarefas pequenas e entregáveis em ciclos curtos"
    );
    concepts.push("refatoração incremental com métricas de qualidade");
    concepts.push("versionamento disciplinado com Git para rastrear evolução");
  }
  const unique = uniqueIgnoreCase(concepts);
  if (unique.length >= 3) return unique.slice(0, 3);
  while (unique.length < 3) {
    unique.push(
      detail?.commands?.length
        ? `automatização de fluxo para comandos ${detail.commands.join(" ")}`
        : "automação de rotina técnica para ganhar velocidade de entrega"
    );
  }
  return unique.slice(0, 3);
}

function buildTechResourceLinks(technologies) {
  const resources = [];
  for (const tech of technologies || []) {
    const link = TECH_RESOURCE_LINKS[tech];
    if (!link) continue;
    resources.push(`${tech}: ${link}`);
  }
  if (!resources.length) {
    resources.push("Twitch Developers: https://dev.twitch.tv/docs");
    resources.push("GitHub Docs: https://docs.github.com/pt");
  }
  return resources.slice(0, 4);
}

function buildTechnicalQuestion(detail, technologies) {
  const topTech = technologies?.[0] || "TypeScript";
  const creator = detail?.channel ? `@${detail.channel}` : "o criador";
  return `Como você transformaria o que viu com ${creator} em um mini projeto de 7 dias usando ${topTech}, com escopo fechado e entrega publicável?`;
}

async function twitchHelixGet(context, endpointPath) {
  const { twitchAccessToken, twitchClientId } = getTwitchConfig(context);
  if (!twitchAccessToken || !twitchClientId) {
    return null;
  }
  const response = await fetch(`https://api.twitch.tv/helix${endpointPath}`, {
    headers: {
      Authorization: `Bearer ${twitchAccessToken}`,
      "Client-Id": twitchClientId,
    },
    cache: "no-store",
  });
  if (!response.ok) return null;
  return await response.json();
}

async function fetchDeepTwitchLiveAnalysis(context, liveDetails, consumedNames) {
  const developmentLives = (liveDetails || []).filter((item) =>
    isDevelopmentOrTechnologyLive(item)
  );
  const devLive =
    developmentLives.find((item) => String(item?.channel || "").trim()) ||
    developmentLives[0];
  if (!devLive) return null;

  const creatorHandle = String(devLive.channel || "")
    .replace(/^@/, "")
    .trim()
    .toLowerCase();
  const creatorProfile = KNOWN_CREATOR_PROFILES[creatorHandle] || "";

  const analysis = {
    creatorHandle,
    creatorProfile: creatorProfile || "criador técnico com foco em desenvolvimento ao vivo",
    liveTitle: devLive.title || "Live de programação",
    liveCategory: devLive.category || "Tecnologia",
    viewers: devLive.viewers || "",
    duration: devLive.duration || "",
    likelyDevelopment: inferLikelyDevelopment(devLive),
    technologies: [],
    clips: [],
    vod: null,
    concepts: [],
    resources: [],
    technicalQuestion: "",
  };

  const sourceTexts = []
    .concat(consumedNames || [])
    .concat([devLive.title, devLive.category]);

  if (creatorHandle) {
    const userData = await twitchHelixGet(
      context,
      `/users?login=${encodeURIComponent(creatorHandle)}`
    );
    const user = userData?.data?.[0];
    if (user?.id) {
      const now = new Date();
      const start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const clipsData = await twitchHelixGet(
        context,
        `/clips?broadcaster_id=${encodeURIComponent(
          user.id
        )}&started_at=${encodeURIComponent(
          start.toISOString()
        )}&ended_at=${encodeURIComponent(now.toISOString())}&first=5`
      );
      const videosData = await twitchHelixGet(
        context,
        `/videos?user_id=${encodeURIComponent(user.id)}&type=archive&first=5`
      );

      const clips = Array.isArray(clipsData?.data) ? clipsData.data : [];
      const vods = Array.isArray(videosData?.data) ? videosData.data : [];

      analysis.clips = clips.slice(0, 3).map((clip) => ({
        title: clip?.title || "Clip da live",
        url: clip?.url || "",
        views: clip?.view_count || 0,
      }));
      analysis.vod = vods[0]
        ? {
            title: vods[0]?.title || "VOD recente",
            duration: vods[0]?.duration || "",
            url: vods[0]?.url || "",
          }
        : null;

      sourceTexts.push(
        ...analysis.clips.map((item) => item.title),
        ...vods.slice(0, 4).map((item) => item?.title || "")
      );
    }
  }

  analysis.technologies = inferTechnologiesFromTexts(sourceTexts);
  analysis.concepts = buildTechConcepts(analysis.technologies, devLive);
  analysis.resources = buildTechResourceLinks(analysis.technologies);
  analysis.technicalQuestion = buildTechnicalQuestion(devLive, analysis.technologies);
  return analysis;
}

function buildHistoryCorpus(previousReports) {
  return normalizeForCompare((previousReports || []).join("\n\n"));
}

function evolveInsightsAgainstHistory(lines, previousReports, context) {
  const historyCorpus = buildHistoryCorpus(previousReports);
  if (!historyCorpus) return lines;
  return (lines || []).map((line, index) => {
    const normalized = normalizeForCompare(line);
    if (!normalized) return line;
    const anchor = normalized.slice(0, Math.min(120, normalized.length));
    if (!historyCorpus.includes(anchor)) return line;
    const tech = context?.deepLiveAnalysis?.technologies?.[0] || "TypeScript";
    const creator = context?.deepLiveAnalysis?.creatorHandle
      ? `@${context.deepLiveAnalysis.creatorHandle}`
      : "criador técnico";
    if (index === 0) {
      return `Evolução desta semana: além do resumo anterior, aprofunde o fluxo ponta a ponta observado com ${creator}, detalhando arquitetura, implementação e validação técnica.`;
    }
    if (index === 1) {
      return `Nível avançado: transforme o aprendizado em experimento real com ${tech}, com métrica de qualidade de código (erro, cobertura, tempo de entrega).`;
    }
    return "Próximo passo de maturidade: documente decisões técnicas, trade-offs e resultado da implementação para construir repertório reutilizável.";
  });
}

function buildSpecificContentSummaries(consumedNames, liveDetails) {
  const lines = [];
  const unique = uniqueIgnoreCase(consumedNames || []).slice(0, 10);

  if ((liveDetails || []).length) {
    for (const live of liveDetails) {
      lines.push(`- Twitch Live detalhada: ${live.title}`);
      if (live.channel) {
        lines.push(`  • Criador identificado: @${live.channel}.`);
      }
      if (live.category) {
        lines.push(`  • Categoria da live: ${live.category}.`);
      }
      if (live.viewers) {
        lines.push(`  • Audiência registrada no momento: ${live.viewers} espectadores.`);
      }
      if (live.duration) {
        lines.push(`  • Duração no momento da captura: ao vivo há ${live.duration}.`);
      }
      if (live.commands?.length) {
        lines.push(`  • Comandos/intenções no chat/título: ${live.commands.join(" ")}.`);
      }
      lines.push(
        "  • Leitura estratégica: consistência de transmissão + comunidade ativa + tema claro de sessão."
      );
    }
  }

  for (const item of unique) {
    const norm = normalizeForCompare(item);
    if (norm.includes("openai") || norm.includes("google ai") || norm.includes("deepmind")) {
      const tech = classifyTechLaunchFromContent(item);
      lines.push(`- ${item}`);
      lines.push(`  • O que foi discutido: ${tech.launch}.`);
      lines.push(`  • O que isso faz: ${tech.does}.`);
      lines.push(`  • Por que importa agora: ${tech.matters}.`);
      continue;
    }
    if (norm.includes("historia da ia") || norm.includes("historia ia")) {
      lines.push(`- ${item}`);
      lines.push("  • Ponto central: evolução da IA em ciclos rápidos de adoção.");
      lines.push("  • Aprendizado-chave: quem operacionaliza cedo ganha vantagem.");
      lines.push("  • Oportunidade atual: transformar conhecimento em rotina de execução.");
      continue;
    }
    lines.push(`- ${item}`);
  }
  return lines.length ? lines : ["- Sem conteúdo específico identificado."];
}

function parseContentList(text) {
  return splitMultilineList(text).map((item) => item.trim()).filter(Boolean);
}

function collectConsumedContentNames(interacoes, local) {
  const fromInteractions = (interacoes || [])
    .map((item) => String(item?.titulo_conteudo || "").trim())
    .filter(Boolean);
  const fromLocal = parseContentList(local?.conteudos || "");
  const fromTimeline = String(local?.timeline || "")
    .split(/\r?\n/)
    .map((line) => normalizeTimelineEntry(line))
    .filter((line) => line.length > 2);
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
  const hasTeomewhy = normalized.some((item) => item.norm.includes("teomewhy"));

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
          item.norm.includes("teomewhy") ||
          item.norm.includes("openai") ||
          item.norm.includes("google ai") ||
          item.norm.includes("deepmind")
      )
      .map((item) => item.raw)
  );

  return {
    hasGaules,
    hasAlanzoka,
    hasTeomewhy,
    hasOpenAI,
    hasGoogleAI,
    hasDeepMind,
    hasHistoryAI,
    hasAnyCreatorContent:
      hasGaules ||
      hasAlanzoka ||
      hasTeomewhy ||
      hasOpenAI ||
      hasGoogleAI ||
      hasDeepMind,
    launchMentions: uniqueIgnoreCase(launchMentions),
    creatorsConsumed,
  };
}

function extractCreatorFromInteraction(item) {
  const title = String(item?.titulo_conteudo || "").trim();
  const url = String(item?.url_conteudo || "").trim();

  const fromAtHandle = title.match(/@([a-z0-9_]+)/i);
  if (fromAtHandle?.[1]) return fromAtHandle[1];

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
  const profile = context.profile || "TECH";
  const insights = [];
  const featuredLive = (context.liveDetails || [])[0];
  const liveCreatorLabel = featuredLive?.channel ? `@${featuredLive.channel}` : "criador";

  if (profile === "GAMER") {
    insights.push(
      `${context.liveMoment} O foco aqui é leitura de situação e tomada de decisão sob pressão em ${context.gameName}.`
    );
    insights.push(
      featuredLive
        ? `Live de ${liveCreatorLabel}: audiência de ${
            featuredLive.viewers || "n/d"
          } e tema "${
            featuredLive.title
          }" reforçam consistência de comunidade e clareza de pauta.`
        : `Técnicas observadas no gameplay: ${context.gameTechniques
            .slice(0, 3)
            .join(", ")}. Treine isso em blocos curtos e repetíveis para ganhar consistência.`
    );
    insights.push(
      `Dica prática de jogo: escolha 1 fundamento de ${context.gameName} para dominar esta semana e mantenha rotina diária de revisão de partidas.`
    );
    return insights;
  }

  if (profile === "TECH") {
    insights.push(
      `Tecnologias destacadas hoje: ${context.techSources.length ? context.techSources.join(", ") : "fontes de IA"}. Priorize um único caso de uso para implementar imediatamente.`
    );
    insights.push(
      `Sinal técnico detectado: ${context.launchHints.length ? context.launchHints.slice(0, 2).join(" | ") : "novos agentes/modelos e automação prática"}. Isso reduz fricção operacional se aplicado com processo claro.`
    );
    insights.push(
      "Aplicação agora: selecione uma tarefa repetitiva, conecte IA + checklist humano e meça ganho de tempo já nos próximos 7 dias."
    );
    return insights;
  }

  if (profile === "EMPREENDEDOR") {
    insights.push(
      `Seu consumo está orientado a crescimento/negócios. Converta o conteúdo em uma alavanca principal (aquisição, conversão ou retenção) e execute com foco semanal.`
    );
    insights.push(
      "Estratégia prática: documente uma oferta clara, um canal prioritário e um CTA único para evitar dispersão."
    );
    insights.push(
      "Métrica de execução: acompanhe diariamente um KPI (leads, reuniões, conversão ou ticket) para ajustar rápido."
    );
    return insights;
  }

  // HÍBRIDO
  insights.push(
    featuredLive
      ? `Bloco Gamer: ${context.liveMoment} Na live de ${liveCreatorLabel}, o padrão "${
          featuredLive.title
        }" mostra disciplina de agenda e construção de comunidade.`
      : `Bloco Gamer: ${context.liveMoment} Em ${context.gameName}, as técnicas mais úteis foram ${context.gameTechniques
          .slice(0, 2)
          .join(" e ")}.`
  );
  insights.push(
    `Bloco Tech/Negócio: ${context.techSources.length ? context.techSources.join(", ") : "fontes de IA"} apontam para ${context.launchHints.length ? context.launchHints[0] : "automação imediata"}; aplique isso no fluxo de conteúdo e operação.`
  );
  insights.push(
    "Integração híbrida: use consistência gamer (rotina disciplinada) + automação de IA para publicar melhor e executar mais com menos desgaste."
  );
  return insights;
}

function buildIntelligentConnections(signals, context) {
  const profile = context.profile || "TECH";
  const connections = [];
  const featuredLive = (context.liveDetails || [])[0];
  const liveCreator = featuredLive?.channel ? `@${featuredLive.channel}` : "criador";

  if (profile === "GAMER") {
    connections.push(
      `${context.gameName} + consistência dos streamers = evolução de rank por repetição inteligente de fundamentos.`
    );
    connections.push(
      `Leitura de momento intenso + treino focado = menos erro sob pressão nas partidas decisivas.`
    );
    return connections;
  }

  if (profile === "TECH") {
    connections.push(
      `${context.techSources.length ? context.techSources[0] : "OpenAI/Google"} + automação de rotina = ganho imediato de velocidade de execução técnica.`
    );
    connections.push(
      `Lançamentos de IA + aplicação semanal orientada a KPI = adoção real (não só consumo de notícia).`
    );
    return connections;
  }

  if (profile === "EMPREENDEDOR") {
    connections.push(
      "Conteúdo de estratégia + execução comercial diária = previsibilidade de crescimento."
    );
    connections.push(
      "Marketing com métrica única + revisão semanal = aumento de eficiência sem dispersão."
    );
    return connections;
  }

  // HÍBRIDO
  connections.push(
    `${context.primaryStreamer || liveCreator} usa consistência extrema + ${
      context.techSources[0] || "IA atual"
    } oferece automação = oportunidade de automatizar consistência de conteúdo.`
  );
  connections.push(
    `Técnicas de gameplay (disciplina, timing, leitura) + processos de negócio (KPI, funil, execução) = vantagem competitiva sustentável.`
  );
  return connections;
}

function buildWeekQuestion(signals, context) {
  const profile = context.profile || "TECH";

  if (profile === "GAMER") {
    return `No ${context.gameName}, qual fundamento você vai dominar primeiro para subir de nível/rank nesta semana: posicionamento, timing ou tomada de decisão?`;
  }

  if (profile === "TECH") {
    return `Qual tecnologia que você consumiu hoje (${context.launchHints[0] || "automação por IA"}) vai virar um piloto real no seu fluxo já nas próximas 48h?`;
  }

  if (profile === "EMPREENDEDOR") {
    return "Qual próximo passo único no seu negócio você vai executar amanhã para gerar resultado mensurável em 7 dias?";
  }

  // HÍBRIDO
  return [
    `Opção Gamer: no ${context.gameName}, qual ajuste você vai testar para evoluir desempenho já na próxima sessão?`,
    `Opção Tech/Negócio: qual automação baseada em ${context.techSources[0] || "IA"} você vai ativar esta semana para ganhar escala?`,
  ].join(" || ");
}

function buildDeterministicReport(
  nome,
  atual,
  anterior,
  resumoLocal,
  previousReports = [],
  deepLiveAnalysis = null
) {
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
  const profileData = detectUserProfile(consumedNames, local, byCategory, byType);
  const profile = profileData.profile;
  const gameName = inferMainGame(consumedNames, local.timeline);
  const liveMoment = inferLiveMoment(local.timeline, gameName);
  const gameTechniques = inferGameplayTechniques(gameName);
  const liveDetails = collectTwitchLiveDetails(consumedNames, local);
  const contentSummaries = buildSpecificContentSummaries(consumedNames, liveDetails);
  const techSources = uniqueIgnoreCase(
    consumedNames.filter((item) => {
      const norm = normalizeForCompare(item);
      return (
        norm.includes("openai") ||
        norm.includes("google ai") ||
        norm.includes("deepmind")
      );
    })
  );
  const primaryStreamer =
    creatorsSeen.find((name) => {
      const norm = normalizeForCompare(name);
      return norm.includes("gaules") || norm.includes("alanzoka");
    }) || "";
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
    profile,
    creatorsSeen,
    launchHints,
    currentTotal,
    liveCount,
    videoCount,
    gameName,
    liveMoment,
    gameTechniques,
    techSources,
    liveDetails,
    deepLiveAnalysis,
  });
  const evolvedInsights = evolveInsightsAgainstHistory(insights, previousReports, {
    deepLiveAnalysis,
  });
  const intelligentConnections = buildIntelligentConnections(signals, {
    profile,
    creatorsSeen,
    pendingCreators,
    gameName,
    techSources,
    primaryStreamer,
    liveDetails,
  });
  const weekQuestion = buildWeekQuestion(signals, {
    profile,
    isFirstReport,
    pendingCreators,
    gameName,
    launchHints,
    techSources,
  });

  const nextSteps = [];
  if (profile === "GAMER") {
    nextSteps.push(
      `1) Em ${gameName}, treine 20-30 min por dia focando em ${gameTechniques[0]}.`
    );
    nextSteps.push(
      `2) Revise uma partida e anote 3 decisões críticas (boa, ruim, corrigível).`
    );
    nextSteps.push(
      "3) Teste uma nova estratégia de rank (posição, ritmo ou escolha de personagem/função) e compare desempenho."
    );
  } else if (profile === "TECH") {
    nextSteps.push(
      `1) Escolha uma tecnologia consumida hoje (${launchHints[0] || "IA aplicada"}) e defina um piloto de 7 dias.`
    );
    nextSteps.push(
      "2) Implemente em um fluxo real com dono, prazo e métrica de sucesso."
    );
    nextSteps.push(
      "3) Documente resultado e decida: escalar, ajustar ou descartar no próximo ciclo."
    );
  } else if (profile === "EMPREENDEDOR") {
    nextSteps.push(
      "1) Defina a prioridade da semana no negócio (aquisição, conversão ou retenção)."
    );
    nextSteps.push(
      "2) Execute uma ação de maior impacto em até 24h e acompanhe KPI diário."
    );
    nextSteps.push(
      "3) Faça revisão semanal objetiva e ajuste com base em números, não em opinião."
    );
  } else {
    nextSteps.push(
      `1) Bloco Gamer: escolha 1 fundamento de ${gameName} para evoluir (treino diário curto + review).`
    );
    nextSteps.push(
      `2) Bloco Tech/Negócio: pilote uma automação baseada em ${techSources[0] || "IA"} no seu fluxo real.`
    );
    nextSteps.push(
      "3) Integre os dois blocos: transforme disciplina de gameplay em rotina operacional com KPI semanal."
    );
  }

  if (isFirstReport) {
    nextSteps.push(
      "4) Como este é o primeiro relatório, mantenha consistência diária para liberar comparação evolutiva já no próximo ciclo."
    );
  }

  const liveDeepSection = [];
  const technicalDeepeningSection = [];
  if (deepLiveAnalysis) {
    const creatorTag = deepLiveAnalysis.creatorHandle
      ? `@${deepLiveAnalysis.creatorHandle}`
      : "criador";
    liveDeepSection.push(
      `- Criador identificado: ${creatorTag} (${deepLiveAnalysis.creatorProfile}).`
    );
    liveDeepSection.push(
      `- O que provavelmente foi desenvolvido: ${deepLiveAnalysis.likelyDevelopment}`
    );
    liveDeepSection.push(
      `- Tecnologias observadas no histórico público do canal: ${deepLiveAnalysis.technologies.join(
        ", "
      )}.`
    );
    liveDeepSection.push(
      `- 3 conceitos técnicos para aprofundar: ${deepLiveAnalysis.concepts
        .map((concept, index) => `${index + 1}) ${concept}`)
        .join(" | ")}.`
    );
    liveDeepSection.push(
      `- Recursos e documentação: ${deepLiveAnalysis.resources.join(" | ")}.`
    );
    liveDeepSection.push(
      `- Pergunta técnica da sessão: ${deepLiveAnalysis.technicalQuestion}`
    );
    liveDeepSection.push(
      deepLiveAnalysis.clips.length
        ? `- Clipes mais assistidos (24h): ${deepLiveAnalysis.clips
            .map((clip) => `${clip.title} (${clip.views} views) ${clip.url}`)
            .join(" | ")}`
        : "- Clipes mais assistidos (24h): sem retorno de clipes via API neste ciclo, manter monitoramento no próximo relatório."
    );
    liveDeepSection.push(
      deepLiveAnalysis.vod?.url
        ? `- VOD recente: ${deepLiveAnalysis.vod.title} (${deepLiveAnalysis.vod.duration}) ${deepLiveAnalysis.vod.url}`
        : "- VOD recente: sem VOD retornado via API neste ciclo."
    );

    technicalDeepeningSection.push(
      `- Conceito principal da sessão: ${deepLiveAnalysis.concepts[0] || "arquitetura e execução técnica orientada a projeto"}.`
    );
    technicalDeepeningSection.push(
      `- Próximo nível sugerido: implementar uma versão própria com ${deepLiveAnalysis.technologies
        .slice(0, 2)
        .join(" + ")} incluindo testes e documentação de decisão técnica.`
    );
    technicalDeepeningSection.push(
      `- Recurso específico para esta semana: ${
        deepLiveAnalysis.resources[0] || "https://docs.github.com/pt"
      }`
    );
  }

  return [
    `Olá, ${nome}!`,
    ``,
    `Resumo do seu dia na Área Exclusiva:`,
    `- Perfil detectado: ${profile}`,
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
    `Resumo dos conteúdos (objetivo e aplicável):`,
    ...contentSummaries,
    ``,
    `Ações recentes:`,
    recentes || timeline || "- Sem ações recentes registradas.",
    ``,
    `Insights práticos:`,
    profile === "HÍBRIDO"
      ? `- Seção Gamer: ${evolvedInsights[0]}`
      : `- ${evolvedInsights[0]}`,
    profile === "HÍBRIDO"
      ? `- Seção Tech/Negócio: ${evolvedInsights[1]}`
      : `- ${evolvedInsights[1]}`,
    `- ${evolvedInsights[2]}`,
    ``,
    ...(liveDeepSection.length
      ? ["Análise profunda da live Twitch:", ...liveDeepSection, ""]
      : []),
    `Conexões inteligentes:`,
    ...intelligentConnections.map((item) => `- ${item}`),
    ``,
    ...(technicalDeepeningSection.length
      ? ["Aprofundamento técnico:", ...technicalDeepeningSection, ""]
      : []),
    `Evolução:`,
    `- ${evolutionLabel}`,
    ``,
    `Próximos passos (7 dias):`,
    ...nextSteps,
    ``,
    `Pergunta da semana:`,
    ...(profile === "HÍBRIDO"
      ? weekQuestion.split("||").map((part) => `- ${part.trim()}`)
      : [`- ${weekQuestion}`]),
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

function buildGeminiInput(
  nome,
  atual,
  anterior,
  resumoLocal,
  previousReports = [],
  deepLiveAnalysis = null
) {
  const local = normalizeResumoLocal(resumoLocal);
  const categoriasAtual = aggregateByCategory(atual);
  const tiposAtual = aggregateByType(atual);
  const categoriasAnterior = aggregateByCategory(anterior);
  const consumedNames = collectConsumedContentNames(atual, local);
  const profileData = detectUserProfile(consumedNames, local, categoriasAtual, tiposAtual);
  const gameName = inferMainGame(consumedNames, local.timeline);
  const liveMoment = inferLiveMoment(local.timeline, gameName);
  const gameTechniques = inferGameplayTechniques(gameName);
  const liveDetails = collectTwitchLiveDetails(consumedNames, local);
  const previousSummaries = (previousReports || [])
    .slice(0, 4)
    .map((item, index) => `Relatório anterior ${index + 1}: ${String(item).slice(0, 900)}`);

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
    `Perfil detectado pelo motor local: ${profileData.profile}`,
    `Pontuação de perfil local: gamer=${profileData.gamerScore}, tech=${profileData.techScore}, empreendedor=${profileData.empreendedorScore}`,
    `Categorias semana atual: ${JSON.stringify(categoriasAtual)}`,
    `Categorias semana anterior: ${JSON.stringify(categoriasAnterior)}`,
    `Tipos semana atual: ${JSON.stringify(tiposAtual)}`,
    `Conteúdos recentes: ${JSON.stringify(recentes)}`,
    `Resumo local opcional do frontend: ${JSON.stringify(resumoLocal || {})}`,
    `Criadores vistos no Radar (local): ${JSON.stringify(local.creatorsSeen)}`,
    `Criadores monitorados no Radar (local): ${JSON.stringify(local.radarCreators)}`,
    `Conteúdos específicos (local): ${local.conteudos || "não informado"}`,
    `Timeline local: ${local.timeline || "não informado"}`,
    `Jogo principal detectado (local): ${gameName}`,
    `Momento intenso detectado da live (local): ${liveMoment}`,
    `Detalhes estruturados de live Twitch (local): ${JSON.stringify(liveDetails)}`,
    `Contexto profundo da live via API Twitch: ${JSON.stringify(deepLiveAnalysis || {})}`,
    `Histórico de relatórios anteriores (evitar repetição): ${JSON.stringify(previousSummaries)}`,
    `Técnicas de gameplay detectadas (local): ${JSON.stringify(gameTechniques)}`,
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

function isAdvancedReportValid(text) {
  const normalized = normalizeForCompare(text);
  const requiredTokens = [
    "perfil detectado",
    "insights praticos",
    "conexoes inteligentes",
    "pergunta da semana",
    "proximos passos",
  ];
  if (!requiredTokens.every((token) => normalized.includes(token))) {
    return false;
  }
  const genericSignals = [
    "escolha o tema mais recorrente",
    "execute uma acao ainda hoje",
    "transformar aprendizado em crescimento",
  ];
  const genericHits = genericSignals.filter((signal) =>
    normalized.includes(normalizeForCompare(signal))
  ).length;
  return genericHits < 3;
}

async function generateReportWithGemini(
  context,
  nome,
  atual,
  anterior,
  resumoLocal,
  previousReports = [],
  deepLiveAnalysis = null
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
            parts: [
              {
                text: buildGeminiInput(
                  nome,
                  atual,
                  anterior,
                  resumoLocal,
                  previousReports,
                  deepLiveAnalysis
                ),
              },
            ],
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
  if (!isAdvancedReportValid(generatedText)) {
    throw new Error("Gemini retornou relatório genérico/fora do formato avançado.");
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

const CODEXION_LOGO_PDF_URL =
  "https://i.postimg.cc/KjFrCpzg/Codexion-2026-02-27T195557-566-removebg-preview(1).png";
const SYNE_REGULAR_TTF_URL =
  "https://raw.githubusercontent.com/google/fonts/main/ofl/syne/Syne-Regular.ttf";
const SYNE_BOLD_TTF_URL =
  "https://raw.githubusercontent.com/google/fonts/main/ofl/syne/Syne-Bold.ttf";

function formatDatePtBr(date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function formatDateIso(date) {
  const year = String(date.getUTCFullYear());
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function sanitizeFilenamePart(value) {
  const normalized = normalizeForCompare(value).replace(/[^a-z0-9]+/g, "-");
  const cleaned = normalized.replace(/^-+|-+$/g, "");
  return cleaned || "cliente";
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }
  if (typeof btoa === "function") {
    return btoa(binary);
  }
  if (typeof Buffer !== "undefined") {
    return Buffer.from(buffer).toString("base64");
  }
  throw new Error("Ambiente sem encoder base64 disponível.");
}

async function fetchAsBase64(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Falha ao baixar recurso: ${url}`);
  }
  const contentType = response.headers.get("content-type") || "";
  const arrayBuffer = await response.arrayBuffer();
  return {
    base64: arrayBufferToBase64(arrayBuffer),
    contentType,
  };
}

async function tryRegisterSyneFont(pdf) {
  try {
    const [regular, bold] = await Promise.all([
      fetchAsBase64(SYNE_REGULAR_TTF_URL),
      fetchAsBase64(SYNE_BOLD_TTF_URL),
    ]);
    pdf.addFileToVFS("Syne-Regular.ttf", regular.base64);
    pdf.addFileToVFS("Syne-Bold.ttf", bold.base64);
    pdf.addFont("Syne-Regular.ttf", "Syne", "normal");
    pdf.addFont("Syne-Bold.ttf", "Syne", "bold");
    return true;
  } catch {
    return false;
  }
}

async function tryLoadLogoDataUrl() {
  try {
    const { base64, contentType } = await fetchAsBase64(CODEXION_LOGO_PDF_URL);
    const mimeType =
      contentType && /^image\//i.test(contentType) ? contentType : "image/png";
    return `data:${mimeType};base64,${base64}`;
  } catch {
    return "";
  }
}

async function buildWeeklyReportPdfAttachment(nome, relatorioTexto, reportDate) {
  const pdf = new jsPDF({
    unit: "mm",
    format: "a4",
    compress: true,
  });
  const hasSyne = await tryRegisterSyneFont(pdf);
  const logoDataUrl = await tryLoadLogoDataUrl();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const marginX = 18;
  const contentWidth = pageWidth - marginX * 2;
  const lineHeight = 5.4;
  const maxContentY = pageHeight - 18;
  const reportDatePtBr = formatDatePtBr(reportDate);
  const reportDateIso = formatDateIso(reportDate);
  const filename = `relatorio-codexion-${sanitizeFilenamePart(
    nome
  )}-${reportDateIso}.pdf`;
  let y = 56;
  let pageNumber = 1;

  const setBrandFont = (weight) => {
    if (hasSyne) {
      pdf.setFont("Syne", weight);
    } else {
      pdf.setFont("helvetica", weight);
    }
  };

  const drawFooter = () => {
    setBrandFont("normal");
    pdf.setFontSize(9);
    pdf.setTextColor(140, 140, 140);
    pdf.text(
      `@codexionai • ${reportDatePtBr}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: "center" }
    );
  };

  const drawPageBase = () => {
    pdf.setFillColor(0, 0, 0);
    pdf.rect(0, 0, pageWidth, pageHeight, "F");

    if (logoDataUrl) {
      try {
        pdf.addImage(logoDataUrl, "PNG", pageWidth / 2 - 10, 10, 20, 20);
      } catch {
        // fallback para texto caso a imagem falhe
      }
    }

    setBrandFont("bold");
    pdf.setFontSize(20);
    pdf.setTextColor(255, 255, 255);
    pdf.text("CODEXION", pageWidth / 2, 35, { align: "center" });

    pdf.setDrawColor(180, 255, 0);
    pdf.setLineWidth(0.8);
    pdf.line(marginX, 42, pageWidth - marginX, 42);
  };

  const ensureSpace = (heightNeeded) => {
    if (y + heightNeeded <= maxContentY) return;
    drawFooter();
    pdf.addPage();
    pageNumber += 1;
    drawPageBase();
    y = 52;
  };

  const writeWrapped = (text, options = {}) => {
    const fontWeight = options.fontWeight || "normal";
    const color = options.color || [178, 178, 178];
    const fontSize = options.fontSize || 11;
    const left = options.left ?? marginX;
    const width = options.width ?? contentWidth;
    const before = options.before || 0;
    const after = options.after || 0;
    const lines = pdf.splitTextToSize(String(text || ""), width);

    y += before;
    ensureSpace(lines.length * lineHeight + after);
    setBrandFont(fontWeight);
    pdf.setFontSize(fontSize);
    pdf.setTextColor(color[0], color[1], color[2]);
    pdf.text(lines, left, y);
    y += lines.length * lineHeight + after;
  };

  drawPageBase();

  writeWrapped("Relatório Semanal", {
    fontWeight: "bold",
    fontSize: 16,
    color: [180, 255, 0],
    after: 1.5,
  });
  writeWrapped(`Cliente: ${nome}`, {
    fontWeight: "bold",
    fontSize: 12,
    color: [255, 255, 255],
    after: 1.2,
  });
  writeWrapped(`Data do relatório: ${reportDatePtBr}`, {
    fontSize: 10.5,
    color: [178, 178, 178],
    after: 4,
  });

  const lines = String(relatorioTexto || "")
    .split(/\r?\n/)
    .map((line) => line.trim());

  for (const line of lines) {
    if (!line) {
      y += 2;
      continue;
    }

    if (/^[A-ZÀ-Ýa-zà-ÿ0-9\s\/]+:$/.test(line)) {
      writeWrapped(line.replace(/:$/, ""), {
        fontWeight: "bold",
        fontSize: 12.2,
        color: [180, 255, 0],
        before: 1,
        after: 1.5,
      });
      continue;
    }

    if (/^[-•]\s+/.test(line)) {
      const bulletText = line.replace(/^[-•]\s+/, "");
      writeWrapped(`• ${bulletText}`, {
        fontSize: 10.7,
        color: [178, 178, 178],
        left: marginX + 2,
        width: contentWidth - 2,
        after: 0.6,
      });
      continue;
    }

    if (/^\d+[\)\.]\s+/.test(line)) {
      writeWrapped(line, {
        fontSize: 10.7,
        color: [178, 178, 178],
        left: marginX + 2,
        width: contentWidth - 2,
        after: 0.6,
      });
      continue;
    }

    writeWrapped(line, {
      fontSize: 10.9,
      color: [178, 178, 178],
      after: 1,
    });
  }

  drawFooter();
  const pdfArrayBuffer = pdf.output("arraybuffer");
  const content = arrayBufferToBase64(pdfArrayBuffer);
  if (!content) {
    throw new Error("Falha ao gerar conteúdo base64 do PDF.");
  }

  return {
    filename,
    content,
    content_type: "application/pdf",
    content_disposition: "attachment",
  };
}

async function sendEmailByResend(
  context,
  toEmail,
  subject,
  html,
  attachments = []
) {
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
  if (Array.isArray(attachments) && attachments.length > 0) {
    payload.attachments = attachments;
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
    const normalizedLocal = normalizeResumoLocal(resumoLocal);
    const consumedNamesForDeepLive = collectConsumedContentNames(
      interacoesSemanaAtual,
      normalizedLocal
    );
    const liveDetailsForDeepLive = collectTwitchLiveDetails(
      consumedNamesForDeepLive,
      normalizedLocal
    );
    const deepLiveAnalysis = await fetchDeepTwitchLiveAnalysis(
      context,
      liveDetailsForDeepLive,
      consumedNamesForDeepLive
    );
    const previousReports = hasSupabase
      ? await fetchHistoricoRelatorios(supabaseUrl, supabaseKey, userId)
      : [];

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
        resumoLocal,
        previousReports,
        deepLiveAnalysis
      );
    } else {
      try {
        relatorio = await generateReportWithGemini(
          context,
          nomeCliente,
          interacoesSemanaAtual,
          interacoesSemanaAnterior,
          resumoLocal,
          previousReports,
          deepLiveAnalysis
        );
      } catch (_) {
        relatorio = buildDeterministicReport(
          nomeCliente,
          interacoesSemanaAtual,
          interacoesSemanaAnterior,
          resumoLocal,
          previousReports,
          deepLiveAnalysis
        );
      }
    }

    const subject = isWelcomeFlow
      ? `Bem-vindo(a) à Área Exclusiva, ${nomeCliente} ⚡`
      : `Seu relatório semanal chegou, ${nomeCliente} ⚡ — PDF em anexo.`;

    const pdfAttachment = await buildWeeklyReportPdfAttachment(
      nomeCliente,
      relatorio,
      new Date()
    );

    const html = buildEmailTemplate({
      nome: nomeCliente,
      kicker: isWelcomeFlow ? "Boas-vindas" : "Relatório IA",
      title: isWelcomeFlow
        ? "Acesso ativado com sucesso"
        : "Seu relatório personalizado da semana",
      subtitle: isWelcomeFlow
        ? "Você já pode navegar na área exclusiva e receber recomendações mais inteligentes a cada interação."
        : "Seu resumo completo foi enviado em PDF no anexo para você baixar e consultar quando quiser.",
      relatorioTexto: isWelcomeFlow
        ? relatorio
        : "Seu relatório semanal está disponível no PDF em anexo.\n\n- Abra o arquivo PDF para ver a análise completa.\n- Você pode salvar o arquivo e consultar quando quiser.",
      ctaLabel: "Acessar minha área exclusiva",
      ctaUrl: "https://codexionai.pages.dev/",
    });

    await sendEmailByResend(context, perfil.email, subject, html, [pdfAttachment]);
    if (hasSupabase && !isWelcomeFlow) {
      await saveHistoricoRelatorio(
        supabaseUrl,
        supabaseKey,
        userId,
        nomeCliente,
        perfil.email,
        relatorio
      );
    }

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
