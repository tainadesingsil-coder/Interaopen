const CACHE_TTL_MS = 4 * 60 * 1000;
const SOURCE_TIMEOUT_MS = 4000;
const MAX_QUERY_LENGTH = 80;
const FALLBACK_YOUTUBE_DATA_API_KEY = 'AIzaSyDmRPaN4CvD2OI04Jz8Y8APqktXggkTFAw';

const NEWS_FEEDS = [
  { name: 'Olhar Digital IA', url: 'https://olhardigital.com.br/tag/inteligencia-artificial/feed/' },
  { name: 'Canaltech', url: 'https://feeds2.feedburner.com/canaltechbr' },
  {
    name: 'Google Notícias IA (PT-BR)',
    url: 'https://news.google.com/rss/search?q=intelig%C3%AAncia+artificial&hl=pt-BR&gl=BR&ceid=BR:pt-419',
  },
];
const CURATED_NEWS_ARTICLES = [
  {
    id: 'iabrasil-bb-visa-transacao-agentica',
    title: 'Banco do Brasil realiza primeira transação agêntica no país com plataforma da Visa',
    description: 'Cobertura sobre inovação financeira com agentes de IA no mercado brasileiro.',
    url: 'https://iabrasilnoticias.com.br/banco-do-brasil-realiza-primeira-transacao-agentica-no-pais-com-plataforma-da-visa/',
    source: 'IA Brasil Notícias',
  },
  {
    id: 'iabrasil-maggu-ai-varejo-farmaceutico',
    title: 'Maggu AI capta R$ 22 milhões para expandir plataforma de IA no varejo farmacêutico',
    description: 'Notícia sobre investimento e expansão de plataforma de inteligência artificial no varejo.',
    url: 'https://iabrasilnoticias.com.br/maggu-ai-capta-r-22-milhoes-para-expandir-plataforma-de-inteligencia-artificial-no-varejo-farmaceutico/',
    source: 'IA Brasil Notícias',
  },
  {
    id: 'forbes-carreira-ia-demissoes-globais',
    title: 'IA acelera demissões globais e pressiona mercado de trabalho',
    description: 'Análise sobre impactos da inteligência artificial no emprego e na economia.',
    url: 'https://forbes.com.br/carreira/2026/02/ia-acelera-demissoes-globais-e-pressiona-mercado-de-trabalho/',
    source: 'Forbes Brasil',
  },
  {
    id: 'forbes-money-waabi-uber-robotaxis',
    title: 'Startup canadense Waabi capta US$ 1 bilhão para expandir robotáxis com a Uber',
    description: 'Reportagem sobre captação bilionária e evolução da mobilidade autônoma com IA.',
    url: 'https://forbes.com.br/forbes-money/2026/01/startup-canadense-waabi-capta-us-1-bilhao-para-expandir-robotaxis-com-a-uber/',
    source: 'Forbes Brasil',
  },
  {
    id: 'forbes-tech-maiores-acordos-ia-2025',
    title: 'Os maiores acordos do mundo da IA em 2025',
    description: 'Panorama dos principais negócios e movimentos estratégicos de IA no ano.',
    url: 'https://forbes.com.br/forbes-tech/2025/12/os-maiores-acordos-do-mundo-da-ia-em-2025/',
    source: 'Forbes Brasil',
  },
  {
    id: 'nucleo-conhecimento-uso-inteligencias-artificiais',
    title: 'Uso de inteligências artificiais: aspectos e implicações',
    description: 'Conteúdo sobre fundamentos, riscos e aplicações do uso de IA sob perspectiva acadêmica.',
    url: 'https://www.nucleodoconhecimento.com.br/lei/uso-de-inteligencias-artificiais',
    source: 'Núcleo do Conhecimento',
  },
  {
    id: 'usp-revista-141-ia-pesquisa-cientifica',
    title: 'Revista USP 141: inteligência artificial na pesquisa científica',
    description: 'Discussão sobre como IA está transformando produção e validação científica.',
    url: 'https://jornal.usp.br/revistausp/revista-usp-141-inteligencia-artificial-na-pesquisa-cientifica/',
    source: 'Jornal da USP',
  },
  {
    id: 'mit-techreview-ia-chinesa-codigo-aberto',
    title: 'IA chinesa de código aberto em 2025',
    description: 'Análise sobre ecossistema open source de IA e competitividade tecnológica global.',
    url: 'https://mittechreview.com.br/ia-chinesa-codigo-aberto-2025/',
    source: 'MIT Technology Review Brasil',
  },
  {
    id: 'theconversation-openclaw-moltbook-bots',
    title: 'Openclaw e Moltbook: agente de IA caseiro e mídias sociais para bots',
    description: 'Artigo sobre novas ferramentas de agentes e limites entre novidade e reciclagem tecnológica.',
    url: 'https://theconversation.com/openclaw-e-moltbook-agente-de-ia-caseiro-e-midias-sociais-para-bots-parecem-grande-novidade-mas-nao-sao-275083',
    source: 'The Conversation',
  },
  {
    id: 'cnn-ia-dor-recem-nascidos',
    title: 'IA identifica nível de dor em recém-nascidos e auxilia médicos na UTI',
    description: 'Reportagem sobre aplicação de IA em saúde neonatal e apoio clínico.',
    url: 'https://www.cnnbrasil.com.br/saude/ia-identifica-nivel-de-dor-em-recem-nascidos-e-auxilia-medicos-na-uti/',
    source: 'CNN Brasil',
  },
  {
    id: 'cnn-bb-visa-agente-ia',
    title: 'Visa e Banco do Brasil fazem primeira transação com agente IA no país',
    description: 'Notícia sobre inovação financeira com uso de agente de inteligência artificial.',
    url: 'https://www.cnnbrasil.com.br/economia/mercado/visa-e-banco-do-brasil-fazem-primeira-transacao-com-agente-ia-do-pais/',
    source: 'CNN Brasil',
  },
  {
    id: 'canaltech-physical-ai',
    title: 'O que é Physical AI? Tecnologia que controla robôs e fábricas',
    description: 'Explicação sobre IA aplicada ao mundo físico, robótica e automação industrial.',
    url: 'https://canaltech.com.br/inteligencia-artificial/o-que-e-physical-ai-conheca-a-tecnologia-que-controla-robos-e-fabricas/',
    source: 'Canaltech',
  },
  {
    id: 'canaltech-gpt-54-chatgpt',
    title: 'GPT-5.4 chega ao ChatGPT com mais precisão e menos alucinações',
    description: 'Cobertura sobre atualização de modelo com foco em desempenho e confiabilidade.',
    url: 'https://canaltech.com.br/inteligencia-artificial/gpt-54-chega-ao-chatgpt-com-mais-precisao-e-menos-alucinacoes/',
    source: 'Canaltech',
  },
];

const ALLOWED_TYPES = ['all', 'youtube', 'news', 'instagram'];
const ALLOWED_RANGES = ['24h', '7d', '30d'];
const YOUTUBE_CHANNEL_LIMIT = 5;
const YOUTUBE_VIDEOS_PER_CHANNEL = 4;
const CURATED_YOUTUBE_VIDEOS = [
  {
    id: 'flIPXJljv5g',
    title: 'IA na prática: automações e produtividade',
    channel: 'Canal recomendado de IA',
    url: 'https://www.youtube.com/watch?v=flIPXJljv5g',
  },
  {
    id: '-ffRm_Tu4zY',
    title: 'Como usar IA no dia a dia do negócio',
    channel: 'Canal recomendado de IA',
    url: 'https://www.youtube.com/watch?v=-ffRm_Tu4zY',
  },
  {
    id: 'h_l8wCr7M2Q',
    title: 'Estratégias de IA para empresas',
    channel: 'Canal recomendado de IA',
    url: 'https://www.youtube.com/watch?v=h_l8wCr7M2Q',
  },
  {
    id: 'CVze2NyauQc',
    title: 'Aplicações de IA em negócios reais',
    channel: 'Canal recomendado de IA',
    url: 'https://www.youtube.com/watch?v=CVze2NyauQc',
  },
  {
    id: 'Q5Vsu5DzBig',
    title: 'Como Criar o Seu 1º Agente IA em Apenas 32 Minutos',
    channel: 'Bruno Picinini',
    url: 'https://www.youtube.com/watch?v=Q5Vsu5DzBig',
  },
  {
    id: '-Ka4YKW7RwM',
    title: 'Curso N8N Gratuito Para Iniciantes | Crie Automações com IA',
    channel: 'NoCode StartUp',
    url: 'https://www.youtube.com/watch?v=-Ka4YKW7RwM',
  },
  {
    id: 'axZZGNmZ50I',
    title: 'Agentes de IA para WhatsApp no N8N',
    channel: 'Enzzo Panarotto',
    url: 'https://www.youtube.com/watch?v=axZZGNmZ50I',
  },
  {
    id: 'NvrBpnbNfv4',
    title: 'N8N + WhatsApp com Agente de IA (Tutorial)',
    channel: 'Guilherme Lazarotto',
    url: 'https://www.youtube.com/watch?v=NvrBpnbNfv4',
  },
  {
    id: 'UmuJeb0VvXA',
    title: 'ChatGPT: o que é e como usar (tutorial em português)',
    channel: 'Me Ensina',
    url: 'https://www.youtube.com/watch?v=UmuJeb0VvXA',
  },
  {
    id: '7Gg7CrayIE0',
    title: 'Inteligência Artificial no Marketing',
    channel: 'Canal de Marketing e IA',
    url: 'https://www.youtube.com/watch?v=7Gg7CrayIE0',
  },
  {
    id: 'uYLlxdwJ1BA',
    title: 'Conteúdo recomendado de IA #11',
    channel: 'Canal recomendado',
    url: 'https://www.youtube.com/watch?v=uYLlxdwJ1BA',
  },
  {
    id: '8CSj0n5NGQk',
    title: 'Conteúdo recomendado de IA #12',
    channel: 'Canal recomendado',
    url: 'https://www.youtube.com/watch?v=8CSj0n5NGQk',
  },
  {
    id: 'C38xlWnkezQ',
    title: 'Conteúdo recomendado de IA #13',
    channel: 'Canal recomendado',
    url: 'https://www.youtube.com/watch?v=C38xlWnkezQ',
  },
  {
    id: 'UhA_ZgI-otM',
    title: 'Conteúdo recomendado de IA #14',
    channel: 'Canal recomendado',
    url: 'https://www.youtube.com/watch?v=UhA_ZgI-otM',
  },
  {
    id: 'NSA7j3ADgeg',
    title: 'Conteúdo recomendado de IA #15',
    channel: 'Canal recomendado',
    url: 'https://www.youtube.com/watch?v=NSA7j3ADgeg',
  },
  {
    id: 'CNjaG4-UxAo',
    title: 'Conteúdo recomendado de IA #16',
    channel: 'Canal recomendado',
    url: 'https://www.youtube.com/watch?v=CNjaG4-UxAo',
  },
  {
    id: 'DjuZGCwWUhA',
    title: 'Conteúdo recomendado de IA #17',
    channel: 'Canal recomendado',
    url: 'https://www.youtube.com/watch?v=DjuZGCwWUhA',
  },
  {
    id: 'oTptR7O0KNI',
    title: 'Conteúdo recomendado de IA #18',
    channel: 'Canal recomendado',
    url: 'https://www.youtube.com/watch?v=oTptR7O0KNI',
  },
  {
    id: '4gR6v5z2ObQ',
    title: 'Conteúdo recomendado de IA #19',
    channel: 'Canal recomendado',
    url: 'https://www.youtube.com/watch?v=4gR6v5z2ObQ',
  },
  {
    id: 'Lb9AUZdxk6Y',
    title: 'Conteúdo recomendado de IA #20',
    channel: 'Canal recomendado',
    url: 'https://www.youtube.com/watch?v=Lb9AUZdxk6Y',
  },
];
const CURATED_INSTAGRAM_PUBLICATIONS = [
  {
    id: 'instagram-post-dvyqbtpjmyj',
    title: 'BotConversa',
    description:
      'COMENTE "A358" e eu te mando o link para ativar o seu agora. O WhatsApp acabou de se conectar com o novo GPT e agora responde mensagens sozinho, sem programação e sem equipe extra.',
    url: 'https://www.instagram.com/p/DVyQBtpjmYj/',
    thumbnail: '/api/instagram-image?code=DVyQBtpjmYj',
    ctaLabel: 'Ver post',
  },
  {
    id: 'instagram-post-dvwdlnwf1lj',
    title: 'Adriano Couto | Gestão com IA',
    description:
      'Se você pensou que já existia ChatGPT no Excel, a novidade é que agora a integração oficial gera fórmulas nativas, entende conexões entre abas e traz fluxo mais confiável para gestão com IA.',
    url: 'https://www.instagram.com/p/DVwdlnwF1Lj/',
    thumbnail: '/api/instagram-image?code=DVwdlnwF1Lj',
    ctaLabel: 'Ver post',
  },
  {
    id: 'instagram-post-dvbb0ahmwkz',
    title: 'Renato Asse | Sem Codar',
    description:
      'Eu amo o Supabase, mas o limite de 2 projetos no plano free trava quem cria muito. Nesse post, ele apresenta o Neon como alternativa para vibe coding com até 100 projetos no plano gratuito.',
    url: 'https://www.instagram.com/p/DVbb0AHmWKZ/',
    thumbnail: '/api/instagram-image?code=DVbb0AHmWKZ',
    ctaLabel: 'Ver post',
  },
  {
    id: 'instagram-reel-dsmeb7ikebx',
    title: 'Lucas Rocha | IA e Criação de Conteúdo',
    description:
      '⚠️ Essa tecnologia está avançando rápido demais. O vídeo mostra uso de IA com motion control e reforça o alerta sobre deepfakes, especialmente em contexto eleitoral, para educar quem acredita em tudo que vê online.',
    url: 'https://www.instagram.com/reel/DSmeB7ikeBX/',
    thumbnail: '/api/instagram-image?code=DSmeB7ikeBX',
    ctaLabel: 'Ver reel',
  },
];

const PT_STOPWORDS = new Set([
  'de',
  'do',
  'da',
  'dos',
  'das',
  'para',
  'com',
  'sobre',
  'como',
  'mais',
  'noticia',
  'notícias',
  'agora',
  'hoje',
  'novo',
  'nova',
  'tecnologia',
  'mercado',
  'artificial',
  'inteligencia',
  'inteligência',
  'brasil',
]);

const AI_TOPIC_PATTERN =
  /\b(ia|ai|intelig[eê]ncia artificial|machine learning|aprendizado de m[aá]quina|openai|chatgpt|n8n|automa[cç][aã]o|agente)\b/i;

const getCache = () => {
  const key = '__RADAR_IA_CACHE__';
  if (!globalThis[key]) {
    globalThis[key] = new Map();
  }
  return globalThis[key];
};

const sanitizeQuery = (value = '') =>
  value
    .replace(/[^\w\sÀ-ÿ\-_.:]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_QUERY_LENGTH);

const parseType = (value) => (ALLOWED_TYPES.includes(value) ? value : 'all');
const parseRange = (value) => (ALLOWED_RANGES.includes(value) ? value : '7d');

const isAiRelated = (value = '') => AI_TOPIC_PATTERN.test(value.toLowerCase());

const isLikelyPortuguese = (value = '') => {
  const normalized = value.toLowerCase();
  const words = normalized.split(/\s+/).filter(Boolean);
  const stopwordHits = words.reduce((count, word) => (PT_STOPWORDS.has(word) ? count + 1 : count), 0);
  return /[ãõáéíóúâêôç]/i.test(normalized) || stopwordHits >= 2;
};

const tokensFromQuery = (query) =>
  query
    .toLowerCase()
    .split(/\s+/)
    .map((item) => item.trim())
    .filter((item) => item.length >= 2);

const htmlDecode = (value) =>
  value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number.parseInt(code, 10)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) =>
      String.fromCharCode(Number.parseInt(code, 16))
    );

const extractMetaContent = (html, key) => {
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${key}["'][^>]+content=["']([^"']+)["'][^>]*>`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${key}["'][^>]*>`, 'i'),
    new RegExp(`<meta[^>]+name=["']${key}["'][^>]+content=["']([^"']+)["'][^>]*>`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${key}["'][^>]*>`, 'i'),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match && match[1]) return htmlDecode(match[1]).trim();
  }
  return '';
};

const cleanInstagramTitle = (value = '') =>
  (() => {
    const normalized = value.replace(/\s+/g, ' ').trim();
    const marker = normalized.toLowerCase().indexOf(' on instagram');
    if (marker > 0) {
      return normalized.slice(0, marker).trim();
    }
    return normalized.replace(/^Instagram:\s*/i, '').trim();
  })();

const extractInstagramCaption = (value = '') => {
  const normalized = value.replace(/\s+/g, ' ').trim();
  if (!normalized) return '';

  const colonIndex = normalized.indexOf(':');
  let candidate = colonIndex >= 0 ? normalized.slice(colonIndex + 1).trim() : normalized;
  candidate = candidate.replace(/^[“"]+/, '').replace(/[”"]+$/, '').trim();
  if (candidate.length >= 12) {
    return candidate.slice(0, 1200);
  }

  const quoted = normalized.match(/[“"]([^”"]{12,})[”"]/);
  if (quoted && quoted[1]) return quoted[1].trim().slice(0, 1200);
  return normalized.replace(/^Instagram:\s*/i, '').trim().slice(0, 1200);
};

const escapeSvgText = (value = '') =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const buildInstagramThumbnail = (title) => {
  const safeTitle = escapeSvgText(title || 'Radar Instagram');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="405" viewBox="0 0 720 405">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#3f0f74"/>
      <stop offset="55%" stop-color="#d62976"/>
      <stop offset="100%" stop-color="#feda75"/>
    </linearGradient>
  </defs>
  <rect width="720" height="405" fill="url(#bg)"/>
  <rect x="18" y="18" width="684" height="369" rx="18" fill="rgba(6,6,8,0.5)" stroke="rgba(255,255,255,0.2)"/>
  <text x="42" y="72" fill="#ffffff" font-size="24" font-family="Arial, sans-serif" font-weight="700">Instagram</text>
  <text x="42" y="104" fill="#c9d1d9" font-size="18" font-family="Arial, sans-serif">@hollyfield.ia</text>
  <text x="42" y="176" fill="#ffffff" font-size="30" font-family="Arial, sans-serif" font-weight="700">${safeTitle}</text>
  <text x="42" y="350" fill="#C6FF2E" font-size="18" font-family="Arial, sans-serif" font-weight="700">Conteúdo atualizado</text>
</svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const stripHtml = (value) =>
  htmlDecode(value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1'))
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const extractTagValue = (block, tagNames) => {
  for (const tagName of tagNames) {
    const direct = block.match(new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i'));
    if (direct && direct[1]) {
      return stripHtml(direct[1]);
    }
    const linked = block.match(new RegExp(`<${tagName}[^>]*href="([^"]+)"[^>]*/?>`, 'i'));
    if (linked && linked[1]) {
      return linked[1].trim();
    }
  }
  return '';
};

const extractEntries = (xml) => {
  const itemMatches = [...xml.matchAll(/<item[\s\S]*?<\/item>/gi)].map((match) => match[0]);
  if (itemMatches.length > 0) {
    return itemMatches;
  }
  return [...xml.matchAll(/<entry[\s\S]*?<\/entry>/gi)].map((match) => match[0]);
};

const safeIsoDate = (value) => {
  const parsed = Date.parse(value || '');
  if (Number.isNaN(parsed)) {
    return null;
  }
  return new Date(parsed).toISOString();
};

const rangeCutoffMs = (range) => {
  const now = Date.now();
  if (range === '24h') return now - 24 * 60 * 60 * 1000;
  if (range === '30d') return now - 30 * 24 * 60 * 60 * 1000;
  return now - 7 * 24 * 60 * 60 * 1000;
};

const fetchWithTimeout = async (url, init = {}, timeoutMs = SOURCE_TIMEOUT_MS) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
};

const textMatchScore = (text, queryTokens) => {
  if (!queryTokens.length) return 0;
  const normalized = text.toLowerCase();
  return queryTokens.reduce((count, token) => (normalized.includes(token) ? count + 1 : count), 0);
};

const recencyScore = (publishedAt) => {
  if (!publishedAt) return 0;
  const parsed = Date.parse(publishedAt);
  if (Number.isNaN(parsed)) return 0;
  const age = Date.now() - parsed;
  if (age <= 24 * 60 * 60 * 1000) return 4;
  if (age <= 7 * 24 * 60 * 60 * 1000) return 3;
  if (age <= 30 * 24 * 60 * 60 * 1000) return 2;
  return 1;
};

const computeScore = (title, description, publishedAt, query) => {
  const tokens = tokensFromQuery(query);
  return textMatchScore(title, tokens) * 5 + textMatchScore(description, tokens) * 2 + recencyScore(publishedAt);
};

const sortByScoreAndDate = (items) =>
  [...items].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const aTime = a.publishedAt ? Date.parse(a.publishedAt) : 0;
    const bTime = b.publishedAt ? Date.parse(b.publishedAt) : 0;
    return bTime - aTime;
  });

const parseFeedItems = (xml) =>
  extractEntries(xml)
    .map((block) => {
      const title = extractTagValue(block, ['title']);
      const description = extractTagValue(block, ['description', 'summary', 'content']);
      const link = extractTagValue(block, ['link', 'id']);
      const publishedRaw = extractTagValue(block, ['pubDate', 'updated', 'published']);
      return {
        title,
        description,
        link,
        publishedAt: safeIsoDate(publishedRaw),
      };
    })
    .filter((item) => item.title && item.link);

const createYoutubeEndpoint = (apiKey, options) => {
  const endpoint = new URL('https://www.googleapis.com/youtube/v3/search');
  endpoint.searchParams.set('part', 'snippet');
  endpoint.searchParams.set('key', apiKey);

  Object.entries(options).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      endpoint.searchParams.set(key, value);
    }
  });

  return endpoint.toString();
};

const normalizeYoutubeItem = (item, query) => {
  const videoId = item?.id?.videoId || '';
  const title = (item?.snippet?.title || '').trim();
  if (!videoId || !title) {
    return null;
  }

  const description = (item?.snippet?.description || '').trim();
  const publishedAt = safeIsoDate(item?.snippet?.publishedAt || '');
  const thumbnail =
    item?.snippet?.thumbnails?.high?.url ||
    item?.snippet?.thumbnails?.medium?.url ||
    item?.snippet?.thumbnails?.default?.url ||
    null;
  const channelTitle = item?.snippet?.channelTitle || null;
  const aiChannelBoost = isAiRelated(channelTitle || '') ? 6 : 0;
  const aiTopicBoost = isAiRelated(`${title} ${description}`) ? 4 : 0;

  return {
    id: `yt-${videoId}`,
    kind: 'youtube',
    title,
    description,
    url: `https://www.youtube.com/watch?v=${videoId}`,
    source: 'YouTube',
    publishedAt,
    thumbnail,
    channel: channelTitle,
    score: computeScore(title, description, publishedAt, query) + aiChannelBoost + aiTopicBoost,
    ctaLabel: 'Assistir',
  };
};

const dedupeById = (items) => {
  const map = new Map();
  items.forEach((item) => {
    if (!map.has(item.id)) {
      map.set(item.id, item);
    }
  });
  return [...map.values()];
};

const normalizeUrlForDedupe = (value = '') => {
  try {
    const parsed = new URL(value.trim());
    parsed.hash = '';
    parsed.searchParams.delete('utm_source');
    parsed.searchParams.delete('utm_medium');
    parsed.searchParams.delete('utm_campaign');
    parsed.searchParams.delete('utm_content');
    parsed.searchParams.delete('utm_term');
    const pathname = parsed.pathname.replace(/\/+$/, '');
    return `${parsed.origin}${pathname}`.toLowerCase();
  } catch {
    return value.trim().toLowerCase();
  }
};

const dedupeByUrl = (items) => {
  const map = new Map();
  items.forEach((item) => {
    const key = normalizeUrlForDedupe(item.url || item.id);
    if (!map.has(key)) {
      map.set(key, item);
    }
  });
  return [...map.values()];
};

const takeTop = (items, count) => sortByScoreAndDate(items).slice(0, count);

const buildBalancedAll = (results) => {
  const topYoutube = takeTop(results.youtube, 3);
  const topNews = takeTop(results.news, 3);
  const topInstagram = takeTop(results.instagram, 3);
  return [...topYoutube, ...topNews, ...topInstagram];
};

const buildCuratedYoutubeItems = (query, range) => {
  const offsetByRange = {
    '24h': 3,
    '7d': 0,
    '30d': 6,
  };
  const offset = offsetByRange[range] || 0;
  const rotated = CURATED_YOUTUBE_VIDEOS.map(
    (_, index) => CURATED_YOUTUBE_VIDEOS[(index + offset) % CURATED_YOUTUBE_VIDEOS.length]
  );

  return rotated.map((video, index) => {
    const description = `Sugestão da sua base para aprender IA, automação e aplicações em negócios.`;
    const baseScore = 12 - index;
    return {
      id: `yt-${video.id}`,
      kind: 'youtube',
      title: video.title,
      description,
      url: video.url,
      source: 'YouTube Sugestão da Base',
      publishedAt: null,
      thumbnail: `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`,
      channel: video.channel,
      score: baseScore + computeScore(video.title, description, null, query),
      ctaLabel: 'Assistir',
    };
  });
};

const fetchYoutubeItems = async (query, range, env) => {
  const apiKey = (env?.YOUTUBE_DATA_API_KEY || FALLBACK_YOUTUBE_DATA_API_KEY || '').trim();
  const curatedItems = buildCuratedYoutubeItems(query, range);
  if (!apiKey) return curatedItems;

  try {
    const publishedAfter = new Date(rangeCutoffMs(range)).toISOString();
    const aiQuery = `${query} inteligência artificial`;
    let videoItems = [];

    try {
      const channelSearchUrl = createYoutubeEndpoint(apiKey, {
        type: 'channel',
        q: aiQuery,
        maxResults: '8',
        order: 'relevance',
        relevanceLanguage: 'pt',
        regionCode: 'BR',
      });

      const channelsResponse = await fetchWithTimeout(channelSearchUrl);
      if (channelsResponse.ok) {
        const channelsPayload = await channelsResponse.json();
        const channelIds = dedupeById(
          (channelsPayload?.items || [])
            .map((item) => ({
              id: item?.id?.channelId || '',
            }))
            .filter((item) => item.id)
        )
          .map((item) => item.id)
          .slice(0, YOUTUBE_CHANNEL_LIMIT);

        const channelVideoRequests =
          channelIds.length > 0
            ? channelIds.map((channelId) =>
                fetchWithTimeout(
                  createYoutubeEndpoint(apiKey, {
                    type: 'video',
                    q: aiQuery,
                    channelId,
                    maxResults: String(YOUTUBE_VIDEOS_PER_CHANNEL),
                    order: 'date',
                    publishedAfter,
                    relevanceLanguage: 'pt',
                    regionCode: 'BR',
                  })
                ).then((response) => {
                  if (!response.ok) {
                    throw new Error(`youtube_channel_video_failed:${channelId}`);
                  }
                  return response.json();
                })
              )
            : [];

        const settled = await Promise.allSettled(channelVideoRequests);
        videoItems = settled.flatMap((result) =>
          result.status === 'fulfilled' ? result.value?.items || [] : []
        );
      }
    } catch (error) {
      // Keep flow resilient: we'll still try direct video search below.
    }

    if (videoItems.length === 0) {
      const latestResponse = await fetchWithTimeout(
        createYoutubeEndpoint(apiKey, {
          type: 'video',
          q: aiQuery,
          maxResults: '24',
          order: 'date',
          publishedAfter,
          relevanceLanguage: 'pt',
          regionCode: 'BR',
        })
      );
      if (latestResponse.ok) {
        const latestPayload = await latestResponse.json();
        videoItems = latestPayload?.items || [];
      }
    }

    if (videoItems.length === 0) {
      const fallbackResponse = await fetchWithTimeout(
        createYoutubeEndpoint(apiKey, {
          type: 'video',
          q: aiQuery,
          maxResults: '24',
          order: 'relevance',
          publishedAfter,
          relevanceLanguage: 'pt',
          regionCode: 'BR',
        })
      );
      if (fallbackResponse.ok) {
        const fallbackPayload = await fallbackResponse.json();
        videoItems = fallbackPayload?.items || [];
      }
    }

    const dynamicItems = sortByScoreAndDate(
      dedupeById(videoItems.map((item) => normalizeYoutubeItem(item, query)).filter(Boolean))
    );

    if (dynamicItems.length === 0) {
      return sortByScoreAndDate(curatedItems).slice(0, 30);
    }

    const dynamicIds = new Set(dynamicItems.map((item) => item.id));
    const curatedRemainder = curatedItems.filter((item) => !dynamicIds.has(item.id));
    // Prioritize fresh API videos and keep curated list as a safety net at the end.
    return [...dynamicItems, ...curatedRemainder].slice(0, 30);
  } catch (error) {
    return sortByScoreAndDate(curatedItems).slice(0, 30);
  }
};

const fetchNewsItems = async (query, range) => {
  const cutoff = rangeCutoffMs(range);
  const curatedItems = CURATED_NEWS_ARTICLES.map((article, index) => ({
    id: `news-curated-${article.id}`,
    kind: 'news',
    title: article.title,
    description: article.description,
    url: article.url,
    source: article.source,
    publishedAt: null,
    thumbnail: null,
    channel: null,
    score: 80 - index + computeScore(article.title, article.description, null, query),
    ctaLabel: 'Ler matéria',
  }));

  const settled = await Promise.allSettled(
    NEWS_FEEDS.map(async (feed) => {
      const response = await fetchWithTimeout(feed.url);
      if (!response.ok) {
        throw new Error(`news_fetch_failed:${feed.name}`);
      }
      const xml = await response.text();
      const parsed = parseFeedItems(xml);
      return parsed.map((entry, index) => ({
        id: `news-${feed.name.toLowerCase().replace(/\s+/g, '-')}-${index}`,
        kind: 'news',
        title: entry.title,
        description: entry.description,
        url: entry.link,
        source: feed.name,
        publishedAt: entry.publishedAt,
        thumbnail: null,
        channel: null,
        score: computeScore(entry.title, entry.description, entry.publishedAt, query),
        ctaLabel: 'Ler matéria',
      }));
    })
  );

  const items = settled.flatMap((result) => (result.status === 'fulfilled' ? result.value : []));
  const filtered = items.filter((item) => {
    if (!isLikelyPortuguese(`${item.title} ${item.description}`)) {
      return false;
    }
    if (!item.publishedAt) return true;
    const parsed = Date.parse(item.publishedAt);
    if (Number.isNaN(parsed)) return true;
    return parsed >= cutoff;
  });

  return sortByScoreAndDate(dedupeByUrl([...curatedItems, ...filtered])).slice(0, 30);
};

const fetchInstagramItems = async (query) => {
  return CURATED_INSTAGRAM_PUBLICATIONS.map((publication, index) => ({
    id: publication.id,
    kind: 'instagram',
    title: publication.title,
    description: publication.description,
    url: publication.url,
    source: 'Instagram',
    publishedAt: null,
    thumbnail: publication.thumbnail || buildInstagramThumbnail(publication.title),
    channel: '@hollyfield.ia',
    score:
      50 -
      index +
      computeScore(`${publication.title} hollyfield ia instagram`, publication.description, null, query),
    ctaLabel: publication.ctaLabel,
  }));
};

const emptyResponse = (query, type, range) => ({
  query,
  type,
  range,
  generatedAt: new Date().toISOString(),
  errors: {},
  results: {
    youtube: [],
    news: [],
    instagram: [],
  },
  all: [],
});

const aggregateRadar = async (query, type, range, env) => {
  const data = emptyResponse(query, type, range);
  const requestedKinds = type === 'all' ? ['youtube', 'news', 'instagram'] : [type];

  const tasks = {
    youtube: requestedKinds.includes('youtube') ? fetchYoutubeItems(query, range, env) : Promise.resolve([]),
    news: requestedKinds.includes('news') ? fetchNewsItems(query, range) : Promise.resolve([]),
    instagram: requestedKinds.includes('instagram')
      ? fetchInstagramItems(query)
      : Promise.resolve([]),
  };

  const [youtubeResult, newsResult, instagramResult] = await Promise.allSettled([
    tasks.youtube,
    tasks.news,
    tasks.instagram,
  ]);

  if (youtubeResult.status === 'fulfilled' && requestedKinds.includes('youtube')) {
    data.results.youtube =
      youtubeResult.value?.length > 0 ? youtubeResult.value : buildCuratedYoutubeItems(query, range);
  } else if (requestedKinds.includes('youtube')) {
    data.errors.youtube = 'Fonte YouTube indisponível no momento.';
    data.results.youtube = buildCuratedYoutubeItems(query, range);
  }

  if (newsResult.status === 'fulfilled') data.results.news = newsResult.value;
  else if (requestedKinds.includes('news')) data.errors.news = 'Fonte de notícias indisponível no momento.';

  if (instagramResult.status === 'fulfilled') data.results.instagram = instagramResult.value;
  else if (requestedKinds.includes('instagram'))
    data.errors.instagram = 'Fonte Instagram indisponível no momento.';

  data.all =
    type === 'all'
      ? buildBalancedAll(data.results)
      : sortByScoreAndDate([
          ...data.results.youtube,
          ...data.results.news,
          ...data.results.instagram,
        ]);

  return data;
};

export async function onRequestGet(context) {
  const requestUrl = new URL(context.request.url);
  const query = sanitizeQuery(requestUrl.searchParams.get('query') || '');
  const type = parseType(requestUrl.searchParams.get('type'));
  const range = parseRange(requestUrl.searchParams.get('range'));

  if (!query) {
    return Response.json(emptyResponse('', type, range), {
      headers: { 'cache-control': 'no-store' },
    });
  }

  const cache = getCache();
  const cacheKey = `${type}:${range}:${query.toLowerCase()}`;
  const now = Date.now();
  const cached = cache.get(cacheKey);

  if (cached && cached.expiresAt > now) {
    return Response.json(cached.data, {
      headers: {
        'x-radar-cache': 'hit',
        'cache-control': 'public, max-age=120',
      },
    });
  }

  const data = await aggregateRadar(query, type, range, context.env);
  cache.set(cacheKey, {
    data,
    expiresAt: now + CACHE_TTL_MS,
  });

  return Response.json(data, {
    headers: {
      'x-radar-cache': 'miss',
      'cache-control': 'public, max-age=120',
    },
  });
}
