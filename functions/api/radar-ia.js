const CACHE_TTL_MS = 60 * 1000;
const CREATOR_BASE_TTL_MS = 24 * 60 * 60 * 1000;
const CONTENT_ROTATION_MS = 20 * 60 * 1000;
const SOURCE_TIMEOUT_MS = 4000;
const MAX_QUERY_LENGTH = 80;
const FALLBACK_YOUTUBE_DATA_API_KEY = 'AIzaSyAcowUDrgcz6eLNa3Tf0k7vp1VNWVkLhJE';
const FALLBACK_TWITTER_API_KEY = 'g0XdkRNw7loRAmsS4eEID6juG';
const FALLBACK_TWITTER_API_SECRET = 'D6j0NactQyxxHUskonK5ydkJxDJH0kQHSp9SqQtG28O4Dnys2N';
const FALLBACK_TWITTER_ACCESS_TOKEN = '2032831349879627776-y91ml7P3XjUWQgrkgKH4cSCFjBxNq9';
const FALLBACK_TWITTER_ACCESS_SECRET = 'EPCfx3xbrenbyIK0IT3JjROIWY3YKBJ7tpMhshQLgmyCr';
const TWITTER_SEARCH_ENDPOINT = 'https://api.x.com/2/tweets/search/recent';
const TWITTER_MAX_RESULTS = 20;
const GOOGLE_TRANSLATE_PUBLIC_ENDPOINT =
  'https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=pt&dt=t&q=';
const FALLBACK_TWITCH_CHANNELS = [
  'bisteconee',
  'baiano',
  'gabepeixe',
  'nicolediretora',
  'tftoddy',
  'riotgames',
  'lucas_montano',
  'linuxtips',
  'glaucia_lemos86',
  'teomewhy',
  'danielhe4rt',
  'karlamag',
  'cozycoding',
  'theprimeagen',
  'tsoding',
  'piratesoftware',
  'chocotaco',
  'codeaesthetic',
  'georgehotz',
  'j_blow',
];
const FALLBACK_INSTAGRAM_USER_ID = '61565928037346';
const INSTAGRAM_GRAPH_VERSION = 'v20.0';
const INSTAGRAM_GRAPH_LIMIT = 18;
const INSTAGRAM_RSS_LIMIT = 18;
const TIKTOK_CREATOR_ITEMS_PER_PROFILE = 5;
const INSTAGRAM_CREATOR_ITEMS_PER_PROFILE = 5;
const FALLBACK_TIKTOK_CREATOR_VIDEO_URLS = [
  'https://www.tiktok.com/@gabrieladamuchi/video/7601907452212235540',
  'https://www.tiktok.com/@izabela.anholett/video/7611634628490710293',
  'https://www.tiktok.com/@jotalinharesdesign/video/7513681439955684664',
  'https://www.tiktok.com/@jefdicastech/video/7601248981095550226',
  'https://www.tiktok.com/@islamsousa/video/7613833799423528199',
  'https://www.tiktok.com/@jornadatop/video/7232292097313770757',
];
const FALLBACK_TABNEWS_KEYWORDS = [
  'ia',
  'inteligencia',
  'machine',
  'llm',
  'devops',
  'backend',
  'frontend',
  'n8n',
  'automacao',
];

const NEWS_FEEDS = [
  { name: 'Olhar Digital IA', url: 'https://olhardigital.com.br/tag/inteligencia-artificial/feed/' },
  { name: 'Canaltech', url: 'https://feeds2.feedburner.com/canaltechbr' },
  { name: 'G1 Tecnologia', url: 'https://g1.globo.com/rss/g1/tecnologia/' },
  { name: 'G1 Economia Tecnologia', url: 'https://g1.globo.com/rss/g1/economia/tecnologia/' },
  { name: 'Folha Tec', url: 'https://www1.folha.uol.com.br/tec/rss091.xml' },
  { name: 'TecMundo', url: 'https://rss.tecmundo.com.br/feed' },
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
const YOUTUBE_CREATOR_ITEMS_PER_CHANNEL = 5;
const BRAZILIAN_YOUTUBE_HANDLE_FALLBACK = [
  'brunopicinini',
  'filipedeschamps',
  'hashtagprogramacao',
  'codigofontetv',
  'alura',
  'linuxtips',
];
const BRAZILIAN_YOUTUBE_CHANNEL_HINTS = [
  'brasil',
  'portugal',
  'português',
  'portugues',
  'me ensina',
  'picinini',
  'nocode',
  'lazarotto',
  'panarotto',
  'canal',
];
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
    id: 'instagram-post-dv1oioxdvbv',
    title: 'Resumo semanal do mercado de IA',
    description: 'Post com panorama rápido das principais movimentações da semana em IA.',
    url: 'https://www.instagram.com/p/DV1OIoxDvbV/',
    thumbnail: '/api/instagram-image?code=DV1OIoxDvbV',
    ctaLabel: 'Ver post',
  },
  {
    id: 'instagram-post-dv0pwgrlfay',
    title: 'OpenAI, Anthropic e engenharia de prompts',
    description: 'Post com contexto e análise prática sobre prompts e modelos atuais.',
    url: 'https://www.instagram.com/p/DV0pWgrlfaY/',
    thumbnail: '/api/instagram-image?code=DV0pWgrlfaY',
    ctaLabel: 'Ver post',
  },
  {
    id: 'instagram-post-dvtoyvkksxm',
    title: 'China, Seedance 2.0 e impactos no ecossistema',
    description: 'Post com leitura de mercado sobre tendências globais e novas plataformas.',
    url: 'https://www.instagram.com/p/DVtoYvkkSxm/',
    thumbnail: '/api/instagram-image?code=DVtoYvkkSxm',
    ctaLabel: 'Ver post',
  },
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
  {
    id: 'instagram-post-dvv4xchjioj',
    title: 'Atualização rápida de IA no Instagram',
    description: 'Post recente com destaque do mercado de IA.',
    url: 'https://www.instagram.com/p/DVv4XchjiOj/',
    thumbnail: '/api/instagram-image?code=DVv4XchjiOj',
    ctaLabel: 'Ver post',
  },
  {
    id: 'instagram-reel-dulpg23dtut',
    title: 'GIULLYA BECKER | COMUNICADORA',
    description: '🚨ALERTA TUTORIAL🚨 Qual outro efeito você quer aprender? 👀',
    url: 'https://www.instagram.com/reel/DUlPg23Dtut/',
    thumbnail: '/api/instagram-image?code=DUlPg23Dtut&kind=reel',
    ctaLabel: 'Ver reel',
  },
  {
    id: 'instagram-reel-dvf5rv1jkig',
    title: 'Ramon Siqueira',
    description:
      'A extensão que faz tudo pra você. Destaque para fluxos com Claude, vibe coding e automações com IA.',
    url: 'https://www.instagram.com/reel/DVf5Rv1jKig/',
    thumbnail: '/api/instagram-image?code=DVf5Rv1jKig&kind=reel',
    ctaLabel: 'Ver reel',
  },
  {
    id: 'instagram-reel-dvrofstknfl',
    title: 'Rafael Riedel | Marketing & IA',
    description:
      'Comente "Claw" para receber o link de configuração e acompanhe conteúdos sobre agentes de IA e automação.',
    url: 'https://www.instagram.com/reel/DVrofSTknFL/',
    thumbnail: '/api/instagram-image?code=DVrofSTknFL&kind=reel',
    ctaLabel: 'Ver reel',
  },
  {
    id: 'instagram-reel-dvhizj9ay-r',
    title: 'Hollyfield Agency',
    description:
      'Reel sobre Claude Code Security e aplicação de capacidades avançadas de IA em defesa cibernética ativa.',
    url: 'https://www.instagram.com/reel/DVHIzJ9AY-R/',
    thumbnail: '/api/instagram-image?code=DVHIzJ9AY-R&kind=reel',
    ctaLabel: 'Ver reel',
  },
  {
    id: 'instagram-reel-dvj79dscstm',
    title: 'Rony Meisler | Empreendedor',
    description:
      'Reel sobre aprendizagem personalizada com IA e potencial para revolucionar estudo e desenvolvimento.',
    url: 'https://www.instagram.com/reel/DVj79dSCStm/',
    thumbnail: '/api/instagram-image?code=DVj79dSCStm&kind=reel',
    ctaLabel: 'Ver reel',
  },
  {
    id: 'instagram-post-dvinx6slufl',
    title: 'Conteúdo de IA atualizado',
    description: 'Novo post adicionado à curadoria do Radar IA.',
    url: 'https://www.instagram.com/p/DVinx6SluFl/',
    thumbnail: '/api/instagram-image?code=DVinx6SluFl',
    ctaLabel: 'Ver post',
  },
  {
    id: 'instagram-post-dvvryyjdj2p',
    title: 'Conteúdo de IA atualizado',
    description: 'Novo post adicionado à curadoria do Radar IA.',
    url: 'https://www.instagram.com/p/DVvrYYjDJ2p/',
    thumbnail: '/api/instagram-image?code=DVvrYYjDJ2p',
    ctaLabel: 'Ver post',
  },
  {
    id: 'instagram-post-dvv1dj9ak0k',
    title: 'Conteúdo de IA atualizado',
    description: 'Novo post adicionado à curadoria do Radar IA.',
    url: 'https://www.instagram.com/p/DVv1Dj9AK0K/',
    thumbnail: '/api/instagram-image?code=DVv1Dj9AK0K',
    ctaLabel: 'Ver post',
  },
  {
    id: 'instagram-post-dvtkv1ojukg',
    title: 'Conteúdo de IA atualizado',
    description: 'Novo post adicionado à curadoria do Radar IA.',
    url: 'https://www.instagram.com/p/DVtKV1Ojukg/',
    thumbnail: '/api/instagram-image?code=DVtKV1Ojukg',
    ctaLabel: 'Ver post',
  },
  {
    id: 'instagram-post-dvbrkftks5u',
    title: 'Conteúdo de IA atualizado',
    description: 'Novo post adicionado à curadoria do Radar IA.',
    url: 'https://www.instagram.com/p/DVbrKfTkS5U/',
    thumbnail: '/api/instagram-image?code=DVbrKfTkS5U',
    ctaLabel: 'Ver post',
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

const getCreatorBaseCache = () => {
  const key = '__RADAR_CREATOR_BASE_CACHE__';
  if (!globalThis[key]) {
    globalThis[key] = new Map();
  }
  return globalThis[key];
};

const readCreatorBase = (bucket) => {
  const cache = getCreatorBaseCache();
  const entry = cache.get(bucket);
  if (!entry) return [];
  if (Number(entry?.expiresAt || 0) < Date.now()) {
    cache.delete(bucket);
    return [];
  }
  return Array.isArray(entry?.items) ? entry.items : [];
};

const mergeCreatorBase = (bucket, items = [], max = 80) => {
  const normalized = toUniqueList(
    items
      .map((item) => String(item || '').trim())
      .filter(Boolean),
    max
  );
  if (normalized.length === 0) return [];

  const existing = readCreatorBase(bucket);
  const merged = toUniqueList([...normalized, ...existing], max);
  const cache = getCreatorBaseCache();
  cache.set(bucket, {
    items: merged,
    expiresAt: Date.now() + CREATOR_BASE_TTL_MS,
  });
  return merged;
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

const extractInstagramHandle = (value = '') => {
  const normalized = value.replace(/\s+/g, ' ').trim();
  if (!normalized) return null;

  const directAt = normalized.match(/@([a-z0-9._]{2,40})/i);
  if (directAt && directAt[1]) return `@${directAt[1]}`;

  const inParentheses = normalized.match(/\(@([a-z0-9._]{2,40})\)/i);
  if (inParentheses && inParentheses[1]) return `@${inParentheses[1]}`;

  return null;
};

const normalizeInstagramHandle = (value = '') => {
  const normalized = String(value || '').trim().replace(/^@+/, '').replace(/\s+/g, '');
  if (!normalized) return null;
  if (!/^[a-z0-9._]{2,40}$/i.test(normalized)) return null;
  return `@${normalized}`;
};

const looksLikeGenericInstagramText = (value = '') => {
  const normalized = value.toLowerCase().trim();
  if (!normalized) return true;
  return (
    normalized === 'instagram' ||
    normalized.includes('see instagram photos') ||
    normalized.includes('photos and videos') ||
    normalized.includes('on instagram') ||
    normalized.length < 4
  );
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

const fetchTextWithTimeout = async (url, init = {}, timeoutMs = SOURCE_TIMEOUT_MS) => {
  const response = await fetchWithTimeout(url, init, timeoutMs);
  if (!response.ok) return '';
  return (await response.text()).trim();
};

const parseTranslatedPayload = (payload = '') => {
  try {
    const parsed = JSON.parse(payload);
    const chunks = Array.isArray(parsed?.[0]) ? parsed[0] : [];
    const text = chunks
      .map((chunk) => (Array.isArray(chunk) ? String(chunk?.[0] || '') : ''))
      .join('')
      .trim();
    return text || '';
  } catch {
    return '';
  }
};

const translateToPortuguese = async (value = '', force = false) => {
  const input = stripHtml(String(value || '')).slice(0, 260);
  if (!input) return input;
  if (!force && isLikelyPortuguese(input)) return input;
  try {
    const endpoint = `${GOOGLE_TRANSLATE_PUBLIC_ENDPOINT}${encodeURIComponent(input)}`;
    const response = await fetchWithTimeout(endpoint, undefined, 5000);
    if (!response.ok) return input;
    const payload = await response.text();
    const translated = parseTranslatedPayload(payload);
    return translated || input;
  } catch {
    return input;
  }
};

const toUniqueList = (items = [], max = 20) =>
  [...new Set(items.map((item) => String(item || '').trim()).filter(Boolean))].slice(0, max);

const tinyHash = (value = '') => {
  let hash = 17;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
};

const getRotationOffset = (size, salt = 0) => {
  if (!Number.isFinite(size) || size <= 1) return 0;
  const bucket = Math.floor(Date.now() / CONTENT_ROTATION_MS);
  return Math.abs((bucket + Number(salt || 0)) % size);
};

const rotateList = (items = [], offset = 0) => {
  if (!Array.isArray(items) || items.length <= 1) return Array.isArray(items) ? [...items] : [];
  const normalizedOffset = Math.abs(Number(offset || 0)) % items.length;
  if (normalizedOffset === 0) return [...items];
  return items.map((_, index) => items[(index + normalizedOffset) % items.length]);
};

const parseCommaSeparated = (value = '') =>
  String(value || '')
    .split(/[,\n;]/)
    .map((item) => item.trim())
    .filter(Boolean);

const extractTiktokHandleFromUrl = (value = '') => {
  const match = String(value || '').match(/tiktok\.com\/@([a-z0-9._]{2,40})/i);
  return match?.[1]?.toLowerCase() || '';
};

const extractTiktokVideoIdFromUrl = (value = '') => {
  const match = String(value || '').match(/\/video\/(\d+)/i);
  return match?.[1] || '';
};

const normalizeTikTokVideoUrl = (value = '') => {
  try {
    const parsed = new URL(String(value || '').trim());
    parsed.search = '';
    parsed.hash = '';
    return `${parsed.origin}${parsed.pathname}`.replace(/\/+$/, '');
  } catch {
    return String(value || '').trim();
  }
};

const parseTiktokSeedUrls = (env = {}) => {
  const raw = String(
    env?.TIKTOK_CREATOR_URLS || env?.TIKTOK_SEED_URLS || env?.TIKTOK_PROFILE_URLS || ''
  ).trim();
  const envUrls = raw ? parseCommaSeparated(raw) : [];
  const all = [...envUrls, ...FALLBACK_TIKTOK_CREATOR_VIDEO_URLS];
  return toUniqueList(
    all
      .map((url) => normalizeTikTokVideoUrl(url))
      .filter(
        (url) =>
          /^https?:\/\/(www\.)?tiktok\.com\/@/i.test(url) &&
          extractTiktokVideoIdFromUrl(url)
      ),
    24
  );
};

const parseTiktokCreatorHandles = (env = {}) => {
  const raw = String(env?.TIKTOK_CREATOR_HANDLES || env?.TIKTOK_CREATORS || '').trim();
  const explicitHandles = raw
    ? parseCommaSeparated(raw)
        .map((value) => value.replace(/^@+/, '').toLowerCase())
        .filter((value) => /^[a-z0-9._]{2,40}$/i.test(value))
    : [];

  const handlesFromUrls = parseTiktokSeedUrls(env)
    .map((url) => extractTiktokHandleFromUrl(url))
    .filter(Boolean);

  const fromBase = readCreatorBase('tiktok_handles');
  return toUniqueList([...explicitHandles, ...handlesFromUrls, ...fromBase], 20);
};

const parseTabNewsKeywords = (env = {}) => {
  const raw = String(env?.TABNEWS_KEYWORDS || env?.COMMUNITY_KEYWORDS || '').trim();
  const fromEnv = raw ? parseCommaSeparated(raw) : [];
  return toUniqueList([...fromEnv, ...FALLBACK_TABNEWS_KEYWORDS], 12)
    .map((value) => stripHtml(value).toLowerCase().trim())
    .filter(Boolean);
};

const isTabNewsRelevant = (title = '', description = '', keywords = []) => {
  const haystack = `${title} ${description}`.toLowerCase();
  if (keywords.length === 0) return true;
  return keywords.some((keyword) => haystack.includes(keyword));
};

const fetchTabNewsItems = async (query, range, env = {}) => {
  const keywords = parseTabNewsKeywords(env);
  const cutoff = rangeCutoffMs(range);
  const endpoints = [
    'https://www.tabnews.com.br/api/v1/contents?page=1&per_page=24&strategy=new',
    'https://www.tabnews.com.br/api/v1/contents?page=1&per_page=24&strategy=relevant',
  ];

  const settled = await Promise.allSettled(
    endpoints.map(async (endpoint, endpointIndex) => {
      const response = await fetchWithTimeout(
        endpoint,
        {
          headers: { accept: 'application/json' },
        },
        6500
      );
      if (!response.ok) return [];
      const payload = await response.json();
      const posts = Array.isArray(payload) ? payload : [];
      return posts.map((post, index) => {
        const owner = stripHtml(post?.owner_username || '');
        const slug = stripHtml(post?.slug || '');
        const title = stripHtml(post?.title || '');
        if (!owner || !slug || !title) return null;

        const publishedAt = safeIsoDate(post?.published_at || post?.created_at || '');
        if (publishedAt) {
          const timestamp = Date.parse(publishedAt);
          if (!Number.isNaN(timestamp) && timestamp < cutoff) return null;
        }

        const description = stripHtml(post?.source_url || post?.title || '').slice(0, 1200);
        if (!isTabNewsRelevant(title, description, keywords) && !isAiRelated(`${title} ${description}`)) {
          return null;
        }

        const tabcoins = Number(post?.tabcoins || 0);
        const comments = Number(post?.children_deep_count || 0);
        return {
          id: `news-tabnews-${post?.id || `${owner}-${slug}`}`,
          kind: 'news',
          title: title.slice(0, 180),
          description: `${description}${comments > 0 ? ` · ${comments} comentários` : ''}`.slice(0, 1200),
          url: `https://www.tabnews.com.br/${owner}/${slug}`,
          source: 'TabNews Brasil',
          publishedAt,
          thumbnail: buildInstagramThumbnail(`TabNews · ${title}`),
          channel: `@${owner}`,
          score:
            74 -
            endpointIndex -
            index +
            Math.min(8, Math.max(0, tabcoins)) +
            computeScore(`${title} ${owner}`, description, publishedAt, query),
          ctaLabel: 'Ver discussão',
        };
      });
    })
  );

  return dedupeByUrl(
    settled.flatMap((result) => (result.status === 'fulfilled' ? result.value : [])).filter(Boolean)
  ).slice(0, 22);
};

const extractInstagramHandleFromProfileUrl = (value = '') => {
  const match = String(value || '').match(/instagram\.com\/([a-z0-9._]{2,40})(?:[/?#]|$)/i);
  const candidate = match?.[1]?.toLowerCase() || '';
  if (!candidate || ['p', 'reel', 'reels', 'stories', 'explore', 'tv'].includes(candidate)) {
    return '';
  }
  return candidate;
};

const extractInstagramHandleFromHtml = (html = '') => {
  const patterns = [
    /"owner_username":"([a-z0-9._]{2,40})"/i,
    /"username":"([a-z0-9._]{2,40})"/i,
    /"alternateName":"@([a-z0-9._]{2,40})"/i,
    /profilePage_([a-z0-9._]{2,40})/i,
  ];
  for (const pattern of patterns) {
    const match = String(html || '').match(pattern);
    if (match?.[1]) return String(match[1]).toLowerCase();
  }
  return '';
};

const parseInstagramSeedUrls = (env = {}) => {
  const raw = String(env?.INSTAGRAM_SEED_URLS || env?.INSTAGRAM_CREATOR_URLS || '').trim();
  const envUrls = raw ? parseCommaSeparated(raw) : [];
  const curatedUrls = CURATED_INSTAGRAM_PUBLICATIONS.map((item) => item.url);
  return toUniqueList(
    [...envUrls, ...curatedUrls].filter((url) => /^https?:\/\/(www\.)?instagram\.com\//i.test(url)),
    30
  );
};

const parseInstagramCreatorHandles = (env = {}) => {
  const raw = String(env?.INSTAGRAM_CREATOR_HANDLES || env?.INSTAGRAM_CREATORS || '').trim();
  const fromEnv = raw
    ? parseCommaSeparated(raw)
        .map((value) => value.replace(/^@+/, '').toLowerCase())
        .filter((value) => /^[a-z0-9._]{2,40}$/i.test(value))
    : [];
  const fromBase = readCreatorBase('instagram_handles');
  return toUniqueList([...fromEnv, ...fromBase], 20);
};

const resolveInstagramHandleFromSeedUrl = async (seedUrl = '') => {
  try {
    const oEmbedUrl = `https://www.instagram.com/api/v1/oembed/?url=${encodeURIComponent(seedUrl)}`;
    const response = await fetchWithTimeout(
      oEmbedUrl,
      {
        headers: {
          'user-agent':
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
          accept: 'application/json',
        },
      },
      4500
    );
    if (response.ok) {
      const payload = await response.json();
      const fromName = normalizeInstagramHandle(payload?.author_name || '');
      if (fromName) return fromName.replace(/^@/, '').toLowerCase();
      const fromUrl = extractInstagramHandleFromProfileUrl(String(payload?.author_url || ''));
      if (fromUrl) return fromUrl.toLowerCase();
    }
  } catch {
    // Fallback below.
  }

  try {
    const response = await fetchWithTimeout(
      seedUrl,
      {
        headers: {
          'user-agent':
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
          accept: 'text/html,application/xhtml+xml',
        },
      },
      5500
    );
    if (response.ok) {
      const html = await response.text();
      const fromHtml = extractInstagramHandleFromHtml(html);
      if (fromHtml) return fromHtml;
    }
  } catch {
    // Ignore and use URL fallback.
  }

  return extractInstagramHandleFromProfileUrl(seedUrl);
};

const fetchInstagramCreatorEntriesFromBridge = async (handle = '', env = {}) => {
  const cleanHandle = String(handle || '').replace(/^@+/, '').trim().toLowerCase();
  if (!cleanHandle) return [];
  const base =
    String(env?.RSS_BRIDGE_BASE_URL || env?.INSTAGRAM_RSS_BRIDGE_URL || 'https://rss-bridge.org/bridge01/')
      .trim()
      .replace(/\/+$/, '');
  if (!base) return [];

  try {
    const endpoint = new URL(`${base}/`);
    endpoint.searchParams.set('action', 'display');
    endpoint.searchParams.set('bridge', 'InstagramBridge');
    endpoint.searchParams.set('username', cleanHandle);
    endpoint.searchParams.set('format', 'Json');
    const response = await fetchWithTimeout(
      endpoint.toString(),
      {
        headers: {
          accept: 'application/json',
        },
      },
      6500
    );
    if (!response.ok) return [];
    const payload = await response.json();
    const items = Array.isArray(payload?.items) ? payload.items : [];
    return items
      .map((item) => {
        const link = String(item?.url || item?.link || '').trim();
        if (!/^https?:\/\/(www\.)?instagram\.com\//i.test(link)) return null;
        return {
          link,
          title: stripHtml(item?.title || ''),
          description: stripHtml(item?.content || item?.description || ''),
          publishedAt: safeIsoDate(item?.timestamp || item?.date || item?.created || ''),
        };
      })
      .filter(Boolean);
  } catch {
    return [];
  }
};

const resolveTiktokOEmbed = async (videoUrl = '') => {
  try {
    const endpoint = new URL('https://www.tiktok.com/oembed');
    endpoint.searchParams.set('url', videoUrl);
    const response = await fetchWithTimeout(
      endpoint.toString(),
      {
        headers: {
          'user-agent':
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
          accept: 'application/json',
        },
      },
      4500
    );
    if (!response.ok) return null;
    const payload = await response.json();
    const authorHandle =
      extractTiktokHandleFromUrl(String(payload?.author_url || '')) || extractTiktokHandleFromUrl(videoUrl);
    return {
      title: stripHtml(payload?.title || ''),
      thumbnail: String(payload?.thumbnail_url || '').trim() || null,
      channel: authorHandle ? `@${authorHandle}` : null,
      authorName: stripHtml(payload?.author_name || ''),
    };
  } catch {
    return null;
  }
};

const fetchTiktokCreatorFeedEntries = async (handle = '') => {
  const cleanHandle = String(handle || '').replace(/^@+/, '').trim().toLowerCase();
  if (!cleanHandle) return [];
  const candidates = [
    `https://rsshub.app/tiktok/user/${encodeURIComponent(cleanHandle)}`,
    `https://rsshub.app/tiktok/user/${encodeURIComponent(cleanHandle)}/video`,
  ];

  for (const endpoint of candidates) {
    try {
      const response = await fetchWithTimeout(endpoint, undefined, 5500);
      if (!response.ok) continue;
      const xml = await response.text();
      const parsed = parseFeedItems(xml);
      if (parsed.length > 0) {
        return parsed;
      }
    } catch {
      // Try next endpoint candidate.
    }
  }

  return [];
};

const buildTiktokFallbackSeedItems = async (query, env = {}) => {
  const seedUrls = parseTiktokSeedUrls(env);
  const rotationOffset = getRotationOffset(seedUrls.length, tinyHash(`tiktok:${query}`));
  const rotatedSeedUrls = rotateList(seedUrls, rotationOffset);
  const settled = await Promise.allSettled(
    rotatedSeedUrls.slice(0, 12).map(async (url, index) => {
      const normalizedUrl = normalizeTikTokVideoUrl(url);
      const videoId = extractTiktokVideoIdFromUrl(normalizedUrl);
      if (!videoId) return null;
      const oEmbed = await resolveTiktokOEmbed(normalizedUrl);
      const channel = oEmbed?.channel || (() => {
        const handle = extractTiktokHandleFromUrl(normalizedUrl);
        return handle ? `@${handle}` : null;
      })();
      const title = oEmbed?.title || `Vídeo recente de ${channel || 'criador no TikTok'}`;
      const description = (oEmbed?.title || 'Atualização recente da sua base de criadores do TikTok.').slice(0, 240);
      return {
        id: `news-tiktok-seed-${videoId || index}`,
        kind: 'news',
        title: title.slice(0, 180),
        description,
        url: normalizedUrl,
        source: 'TikTok Creator Base',
        publishedAt: null,
        thumbnail: oEmbed?.thumbnail || null,
        channel,
        score: 56 - index + computeScore(title, description, null, query),
        ctaLabel: 'Assistir no TikTok',
      };
    })
  );

  return settled.flatMap((result) => (result.status === 'fulfilled' && result.value ? [result.value] : []));
};

const fetchTiktokCreatorItems = async (query, range, env = {}) => {
  const handles = parseTiktokCreatorHandles(env);
  mergeCreatorBase('tiktok_handles', handles, 40);
  if (handles.length === 0) {
    return buildTiktokFallbackSeedItems(query, env);
  }

  const cutoff = rangeCutoffMs(range);
  const settled = await Promise.allSettled(
    handles.map(async (handle, creatorIndex) => {
      const parsed = await fetchTiktokCreatorFeedEntries(handle);
      return parsed.slice(0, TIKTOK_CREATOR_ITEMS_PER_PROFILE).map((entry, entryIndex) => {
        const cleanUrl = normalizeTikTokVideoUrl(String(entry?.link || '').trim());
        if (!cleanUrl) return null;
        const videoId = extractTiktokVideoIdFromUrl(cleanUrl);
        if (!videoId) return null;
        const publishedAt = safeIsoDate(entry?.publishedAt || '');
        if (publishedAt) {
          const parsedTime = Date.parse(publishedAt);
          if (!Number.isNaN(parsedTime) && parsedTime < cutoff) {
            return null;
          }
        }
        return { handle, creatorIndex, entryIndex, cleanUrl, videoId, publishedAt, entry };
      });
    })
  );

  const candidates = settled
    .flatMap((result) => (result.status === 'fulfilled' ? result.value : []))
    .filter(Boolean);

  const withMetadata = await Promise.allSettled(
    candidates.map(async (candidate, index) => {
      const oEmbed = await resolveTiktokOEmbed(candidate.cleanUrl);
      const titleFromFeed = stripHtml(candidate.entry?.title || '');
      const descriptionFromFeed = stripHtml(candidate.entry?.description || '');
      const title =
        oEmbed?.title ||
        titleFromFeed ||
        `Novo vídeo de @${candidate.handle} no TikTok`;
      const description =
        descriptionFromFeed ||
        oEmbed?.title ||
        'Novo conteúdo do criador na sua base TikTok.';
      const publishedAt = candidate.publishedAt || null;
      const aiBoost = isAiRelated(`${title} ${description}`) ? 6 : 0;

      return {
        id: `news-tiktok-${candidate.handle}-${candidate.videoId || index}`,
        kind: 'news',
        title: title.slice(0, 180),
        description: description.slice(0, 1200),
        url: candidate.cleanUrl,
        source: 'TikTok Creators',
        publishedAt,
        thumbnail: oEmbed?.thumbnail || null,
        channel: oEmbed?.channel || `@${candidate.handle}`,
        score:
          72 -
          candidate.creatorIndex -
          candidate.entryIndex +
          aiBoost +
          computeScore(title, description, publishedAt, query),
        ctaLabel: 'Assistir no TikTok',
      };
    })
  );

  const dynamicItems = withMetadata.flatMap((result) => (result.status === 'fulfilled' ? [result.value] : []));
  const discoveredHandles = dynamicItems
    .map((item) => String(item?.channel || '').replace(/^@+/, '').toLowerCase())
    .filter((value) => /^[a-z0-9._]{2,40}$/i.test(value));
  mergeCreatorBase('tiktok_handles', discoveredHandles, 40);
  if (dynamicItems.length === 0) {
    return buildTiktokFallbackSeedItems(query, env);
  }

  const fallbackItems = await buildTiktokFallbackSeedItems(query, env);
  return sortByScoreAndDate(dedupeByUrl([...dynamicItems, ...fallbackItems])).slice(0, 18);
};

const oauthPercentEncode = (value = '') =>
  encodeURIComponent(String(value))
    .replace(/[!'()*]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`);

const buildOauthNonce = () => Math.random().toString(36).slice(2, 14);

const bytesToBase64 = (bytes) => {
  let binary = '';
  bytes.forEach((value) => {
    binary += String.fromCharCode(value);
  });
  return btoa(binary);
};

const hmacSha1Base64 = async (key, message) => {
  const encoder = new TextEncoder();
  const importedKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(key),
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', importedKey, encoder.encode(message));
  return bytesToBase64(new Uint8Array(signature));
};

const buildTwitterOauthHeader = async ({
  method,
  url,
  queryParams,
  apiKey,
  apiSecret,
  accessToken,
  accessSecret,
}) => {
  const oauthParams = {
    oauth_consumer_key: apiKey,
    oauth_nonce: buildOauthNonce(),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: String(Math.floor(Date.now() / 1000)),
    oauth_token: accessToken,
    oauth_version: '1.0',
  };

  const signatureParams = [
    ...Object.entries(queryParams || {}).map(([key, value]) => [key, String(value)]),
    ...Object.entries(oauthParams),
  ]
    .map(([key, value]) => [oauthPercentEncode(key), oauthPercentEncode(value)])
    .sort((a, b) => {
      if (a[0] === b[0]) return a[1].localeCompare(b[1]);
      return a[0].localeCompare(b[0]);
    });

  const normalizedParams = signatureParams.map(([key, value]) => `${key}=${value}`).join('&');
  const signatureBaseString = [
    method.toUpperCase(),
    oauthPercentEncode(url),
    oauthPercentEncode(normalizedParams),
  ].join('&');
  const signingKey = `${oauthPercentEncode(apiSecret)}&${oauthPercentEncode(accessSecret)}`;
  const signature = await hmacSha1Base64(signingKey, signatureBaseString);
  oauthParams.oauth_signature = signature;

  const header = Object.entries(oauthParams)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, value]) => `${oauthPercentEncode(key)}="${oauthPercentEncode(value)}"`)
    .join(', ');

  return `OAuth ${header}`;
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

const getTwitterCredentials = (env = {}) => {
  const apiKey = String(env?.TWITTER_API_KEY || FALLBACK_TWITTER_API_KEY || '').trim();
  const apiSecret = String(env?.TWITTER_API_SECRET || FALLBACK_TWITTER_API_SECRET || '').trim();
  const accessToken = String(env?.TWITTER_ACCESS_TOKEN || FALLBACK_TWITTER_ACCESS_TOKEN || '').trim();
  const accessSecret = String(env?.TWITTER_ACCESS_SECRET || FALLBACK_TWITTER_ACCESS_SECRET || '').trim();
  return { apiKey, apiSecret, accessToken, accessSecret };
};

const normalizeTweetText = (value = '') =>
  stripHtml(String(value || ''))
    .replace(/https?:\/\/t\.co\/\S+/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const buildTwitterQuery = (query) =>
  `(${query} OR "inteligência artificial" OR ia OR openai OR chatgpt OR agentes de ia) lang:pt -is:retweet -is:reply`;

const fetchTwitterNewsItems = async (query, range, env = {}) => {
  const { apiKey, apiSecret, accessToken, accessSecret } = getTwitterCredentials(env);
  if (!apiKey || !apiSecret || !accessToken || !accessSecret) return [];

  try {
    const sinceIso = new Date(rangeCutoffMs(range)).toISOString();
    const queryParams = {
      query: buildTwitterQuery(query),
      max_results: String(TWITTER_MAX_RESULTS),
      'tweet.fields': 'created_at,lang,author_id,public_metrics',
      expansions: 'author_id',
      'user.fields': 'username,name',
      start_time: sinceIso,
    };

    const url = new URL(TWITTER_SEARCH_ENDPOINT);
    Object.entries(queryParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });

    const oauthHeader = await buildTwitterOauthHeader({
      method: 'GET',
      url: TWITTER_SEARCH_ENDPOINT,
      queryParams,
      apiKey,
      apiSecret,
      accessToken,
      accessSecret,
    });

    const response = await fetchWithTimeout(
      url.toString(),
      {
        headers: {
          authorization: oauthHeader,
          accept: 'application/json',
        },
      },
      7000
    );

    if (!response.ok) {
      return [];
    }

    const payload = await response.json();
    const tweets = Array.isArray(payload?.data) ? payload.data : [];
    const users = Array.isArray(payload?.includes?.users) ? payload.includes.users : [];
    const userById = new Map(users.map((user) => [String(user?.id || ''), user]));

    return tweets
      .map((tweet, index) => {
        const tweetText = normalizeTweetText(tweet?.text || '');
        if (!tweetText || tweetText.length < 20) return null;

        const user = userById.get(String(tweet?.author_id || ''));
        const username = String(user?.username || '').trim();
        const channel = username ? `@${username}` : null;
        const tweetId = String(tweet?.id || '').trim();
        if (!tweetId) return null;

        const title =
          tweetText.length > 170 ? `${tweetText.slice(0, 167).trim()}...` : tweetText;
        const publishedAt = safeIsoDate(tweet?.created_at || '') || null;

        return {
          id: `news-x-${tweetId}`,
          kind: 'news',
          title,
          description: tweetText,
          url: username ? `https://x.com/${username}/status/${tweetId}` : `https://x.com/i/web/status/${tweetId}`,
          source: 'X (Twitter)',
          publishedAt,
          thumbnail: null,
          channel,
          score: 70 - index + computeScore(title, tweetText, publishedAt, query),
          ctaLabel: 'Ver no X',
        };
      })
      .filter(Boolean);
  } catch {
    return [];
  }
};

const extractTwitchChannelCandidate = (value = '') => {
  const raw = String(value || '').trim().toLowerCase();
  if (!raw) return '';
  const fromUrl = raw.match(/twitch\.tv\/([a-z0-9_]{2,25})/i)?.[1];
  if (fromUrl) return fromUrl.toLowerCase();
  const cleaned = raw.replace(/^@/, '');
  return /^[a-z0-9_]{2,25}$/i.test(cleaned) ? cleaned.toLowerCase() : '';
};

const parseTwitchChannels = (env = {}) => {
  const raw = String(env?.TWITCH_CHANNELS || env?.TWITCH_CHANNEL || '').trim();
  const provided = raw
    ? raw
        .split(/[,\n; ]/)
        .map((item) => item.trim())
        .filter(Boolean)
    : [];
  const cleanedProvided = provided.map(extractTwitchChannelCandidate).filter(Boolean);
  const fromBase = readCreatorBase('twitch_channels').map(extractTwitchChannelCandidate).filter(Boolean);
  const fallback = FALLBACK_TWITCH_CHANNELS.map(extractTwitchChannelCandidate).filter(Boolean);
  return toUniqueList([...cleanedProvided, ...fromBase, ...fallback], 16);
};

const fetchTwitchLiveItems = async (query, env = {}) => {
  const channels = parseTwitchChannels(env);
  mergeCreatorBase('twitch_channels', channels, 30);
  if (channels.length === 0) return [];

  const nowIso = new Date().toISOString();
  const settled = await Promise.allSettled(
    channels.map(async (channel, index) => {
      const base = 'https://decapi.me/twitch';
      const [uptime, title, game, viewers] = await Promise.all([
        fetchTextWithTimeout(`${base}/uptime/${channel}`, undefined, 5500),
        fetchTextWithTimeout(`${base}/title/${channel}`, undefined, 5500),
        fetchTextWithTimeout(`${base}/game/${channel}`, undefined, 5500),
        fetchTextWithTimeout(`${base}/viewercount/${channel}`, undefined, 5500),
      ]);

      const isLive = !!uptime && !/offline/i.test(uptime);
      const cleanTitle = stripHtml(title || `Canal ${channel} na Twitch`);
      const cleanGame = stripHtml(game || '');
      const shouldTranslate = isLive && !isLikelyPortuguese(`${cleanTitle} ${cleanGame}`);
      const translatedTitle = shouldTranslate
        ? await translateToPortuguese(cleanTitle, true)
        : cleanTitle;
      const translatedGame = shouldTranslate ? await translateToPortuguese(cleanGame, true) : cleanGame;
      const viewerLabel = viewers && !/offline/i.test(viewers) ? `${viewers} espectadores` : '';
      const liveOrOfflineLabel = isLive ? `Ao vivo há ${uptime}` : 'Offline agora';
      const descriptionParts = [
        translatedTitle,
        translatedGame && translatedGame !== 'No game' ? translatedGame : '',
        viewerLabel,
        liveOrOfflineLabel,
      ]
        .filter(Boolean);
      const description = descriptionParts.join(' · ').slice(0, 1200);

      return {
        id: `news-twitch-${channel}`,
        kind: 'news',
        title: translatedTitle.slice(0, 180),
        description,
        url: `https://www.twitch.tv/${channel}`,
        source: isLive ? (shouldTranslate ? 'Twitch Live · traduzido' : 'Twitch Live') : 'Twitch Monitor',
        publishedAt: isLive ? nowIso : null,
        thumbnail: `https://static-cdn.jtvnw.net/previews-ttv/live_user_${channel}-640x360.jpg?t=${Date.now()}`,
        channel: `@${channel}`,
        score:
          (isLive ? 85 : 35) -
          index +
          computeScore(translatedTitle, description, isLive ? nowIso : null, query),
        ctaLabel: isLive ? 'Assistir live' : 'Ver canal',
      };
    })
  );

  const resolved = settled
    .flatMap((result) => (result.status === 'fulfilled' && result.value ? [result.value] : []))
    .slice(0, 12);

  if (resolved.length > 0) {
    return resolved;
  }

  return channels.slice(0, 4).map((channel, index) => ({
    id: `news-twitch-fallback-${channel}`,
    kind: 'news',
    title: `Twitch · ${channel}`,
    description: 'Canal monitorado no Radar para detectar live em tempo real.',
    url: `https://www.twitch.tv/${channel}`,
    source: 'Twitch Monitor',
    publishedAt: null,
    thumbnail: `https://static-cdn.jtvnw.net/previews-ttv/live_user_${channel}-640x360.jpg?t=${Date.now()}`,
    channel: `@${channel}`,
    score: 52 - index + computeScore(channel, 'twitch monitor', null, query),
    ctaLabel: 'Abrir canal',
  }));
};

const sortByScoreAndDate = (items) =>
  [...items].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const aTime = a.publishedAt ? Date.parse(a.publishedAt) : 0;
    const bTime = b.publishedAt ? Date.parse(b.publishedAt) : 0;
    return bTime - aTime;
  });

const extractSourceFromFeedBlock = (block = '') => {
  const match = block.match(/<source[^>]*?(?:url="([^"]+)")?[^>]*>([\s\S]*?)<\/source>/i);
  if (!match) {
    return { name: '', url: '' };
  }
  return {
    name: stripHtml(match[2] || '').slice(0, 140),
    url: String(match[1] || '').trim(),
  };
};

const parseFeedItems = (xml) =>
  extractEntries(xml)
    .map((block) => {
      const title = extractTagValue(block, ['title']);
      const description = extractTagValue(block, ['description', 'summary', 'content']);
      const link = extractTagValue(block, ['link', 'id']);
      const publishedRaw = extractTagValue(block, ['pubDate', 'updated', 'published']);
      const source = extractSourceFromFeedBlock(block);
      return {
        title,
        description,
        link,
        publishedAt: safeIsoDate(publishedRaw),
        thumbnail: extractImageFromBlock(block),
        image: extractImageFromBlock(block),
        sourceName: source.name,
        sourceUrl: source.url,
      };
    })
    .filter((item) => item.title && item.link);

const extractYoutubeVideoIdFromUrl = (value = '') => {
  const raw = String(value || '').trim();
  if (!raw) return '';
  try {
    const parsed = new URL(raw);
    if (/youtu\.be/i.test(parsed.hostname)) {
      return parsed.pathname.replace('/', '').trim();
    }
    const fromQuery = parsed.searchParams.get('v');
    if (fromQuery) return fromQuery.trim();
    const pathParts = parsed.pathname.split('/').filter(Boolean);
    if (pathParts[0] === 'shorts' && pathParts[1]) return pathParts[1].trim();
    if (pathParts[0] === 'embed' && pathParts[1]) return pathParts[1].trim();
    return '';
  } catch {
    const fallback = raw.match(/(?:v=|\/shorts\/|\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]{8,20})/);
    return fallback?.[1] || '';
  }
};

const parseYoutubeSeedUrls = (env = {}) => {
  const raw = String(
    env?.YOUTUBE_SEED_URLS || env?.YOUTUBE_CREATOR_URLS || env?.YOUTUBE_VIDEO_URLS || ''
  ).trim();
  const fromEnv = raw ? parseCommaSeparated(raw) : [];
  const curated = CURATED_YOUTUBE_VIDEOS.map((item) => item.url);
  return toUniqueList(
    [...fromEnv, ...curated].filter((url) => /youtu\.be|youtube\.com/i.test(String(url || ''))),
    80
  );
};

const parseYoutubeSeedVideoIds = (env = {}) =>
  toUniqueList(
    parseYoutubeSeedUrls(env)
      .map((url) => extractYoutubeVideoIdFromUrl(url))
      .filter(Boolean),
    80
  );

const parseYoutubeCreatorChannelIds = (env = {}) => {
  const raw = String(env?.YOUTUBE_CHANNEL_IDS || env?.YOUTUBE_CREATOR_CHANNEL_IDS || '').trim();
  const values = raw ? parseCommaSeparated(raw) : [];
  const fromEnv = values
    .map((value) => String(value || '').trim())
    .map((value) => {
      const match = value.match(/(UC[a-zA-Z0-9_-]{10,})/);
      return match?.[1] || value;
    })
    .filter((value) => /^UC[a-zA-Z0-9_-]{10,}$/i.test(value));
  const fromBase = readCreatorBase('youtube_channel_ids').filter((value) =>
    /^UC[a-zA-Z0-9_-]{10,}$/i.test(String(value || ''))
  );
  return toUniqueList([...fromEnv, ...fromBase], 24);
};

const parseYoutubeCreatorHandles = (env = {}) => {
  const raw = String(env?.YOUTUBE_CHANNEL_HANDLES || env?.YOUTUBE_HANDLES || '').trim();
  const fromEnv = raw
    ? parseCommaSeparated(raw)
        .map((value) => String(value || '').trim().replace(/^@+/, '').toLowerCase())
        .filter((value) => /^[a-z0-9._-]{2,60}$/i.test(value))
    : [];
  return toUniqueList([...fromEnv, ...BRAZILIAN_YOUTUBE_HANDLE_FALLBACK], 20);
};

const fetchYoutubeVideoIdsFromHandle = async (handle = '', limit = 6) => {
  const cleanHandle = String(handle || '').trim().replace(/^@+/, '').toLowerCase();
  if (!cleanHandle) return [];
  const endpoint = `https://www.youtube.com/@${encodeURIComponent(cleanHandle)}/videos`;
  try {
    const response = await fetchWithTimeout(
      endpoint,
      {
        headers: {
          'user-agent':
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
          accept: 'text/html,application/xhtml+xml',
        },
      },
      6500
    );
    if (!response.ok) return [];
    const html = await response.text();
    const matches = [...html.matchAll(/"videoId":"([a-zA-Z0-9_-]{11})"/g)].map((match) => match[1]);
    return toUniqueList(matches, limit);
  } catch {
    return [];
  }
};

const fetchYoutubeOEmbedFallbackItem = async (videoId = '', query = '') => {
  const cleanVideoId = String(videoId || '').trim();
  if (!cleanVideoId) return null;
  try {
    const endpoint = new URL('https://www.youtube.com/oembed');
    endpoint.searchParams.set('url', `https://www.youtube.com/watch?v=${cleanVideoId}`);
    endpoint.searchParams.set('format', 'json');
    const response = await fetchWithTimeout(endpoint.toString(), undefined, 5000);
    if (!response.ok) return null;
    const payload = await response.json();
    const title = stripHtml(payload?.title || '').slice(0, 180);
    const channel = stripHtml(payload?.author_name || '');
    if (!title) return null;
    if (!isLikelyPortuguese(`${title} ${channel}`) && !isLikelyBrazilianYouTubeChannel(channel)) return null;
    return {
      id: `yt-${cleanVideoId}`,
      kind: 'youtube',
      title,
      description: 'Vídeo recente em português da base de canais brasileiros de tecnologia e IA.',
      url: `https://www.youtube.com/watch?v=${cleanVideoId}`,
      source: 'YouTube BR',
      publishedAt: null,
      thumbnail: `https://i.ytimg.com/vi/${cleanVideoId}/hqdefault.jpg`,
      channel: channel || null,
      score: 60 + computeScore(title, channel, null, query),
      ctaLabel: 'Assistir',
    };
  } catch {
    return null;
  }
};

const fetchYoutubeHandleFallbackItems = async (query, range, env = {}) => {
  const handles = parseYoutubeCreatorHandles(env);
  if (handles.length === 0) return [];
  const offset = getRotationOffset(handles.length, tinyHash(`yt-handle:${query}:${range}`));
  const selectedHandles = rotateList(handles, offset).slice(0, 5);

  const settledIds = await Promise.allSettled(
    selectedHandles.map(async (handle) => fetchYoutubeVideoIdsFromHandle(handle, 5))
  );
  const allVideoIds = toUniqueList(
    settledIds.flatMap((result) => (result.status === 'fulfilled' ? result.value : [])),
    24
  );
  if (allVideoIds.length === 0) return [];

  const settledItems = await Promise.allSettled(
    allVideoIds.map(async (videoId) => fetchYoutubeOEmbedFallbackItem(videoId, query))
  );
  return sortByScoreAndDate(
    settledItems
      .flatMap((result) => (result.status === 'fulfilled' && result.value ? [result.value] : []))
      .filter(Boolean)
  ).slice(0, 24);
};

const isLikelyBrazilianYouTubeChannel = (value = '') => {
  const normalized = stripHtml(String(value || '')).toLowerCase();
  if (!normalized) return false;
  if (isLikelyPortuguese(normalized)) return true;
  return BRAZILIAN_YOUTUBE_CHANNEL_HINTS.some((hint) => normalized.includes(hint));
};

const fetchYoutubeVideoDetailsByIds = async (apiKey, videoIds = []) => {
  const ids = toUniqueList(videoIds, 100);
  if (!apiKey || ids.length === 0) return [];

  const chunks = [];
  for (let index = 0; index < ids.length; index += 50) {
    chunks.push(ids.slice(index, index + 50));
  }

  const settled = await Promise.allSettled(
    chunks.map(async (chunk) => {
      const endpoint = new URL('https://www.googleapis.com/youtube/v3/videos');
      endpoint.searchParams.set('part', 'snippet');
      endpoint.searchParams.set('id', chunk.join(','));
      endpoint.searchParams.set('key', apiKey);
      const response = await fetchWithTimeout(endpoint.toString(), undefined, 6500);
      if (!response.ok) return [];
      const payload = await response.json();
      return Array.isArray(payload?.items) ? payload.items : [];
    })
  );

  return settled.flatMap((result) => (result.status === 'fulfilled' ? result.value : []));
};

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
  const isPortugueseCandidate = isLikelyPortuguese(`${title} ${description} ${channelTitle || ''}`);
  const isBrazilianChannel = isLikelyBrazilianYouTubeChannel(channelTitle || '');
  if (!isPortugueseCandidate && !isBrazilianChannel) {
    return null;
  }
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

const fetchYoutubeCreatorBaseItems = async (query, range, env = {}, apiKey = '') => {
  if (!apiKey) return [];

  const explicitChannelIds = parseYoutubeCreatorChannelIds(env);
  const seedVideoIds = parseYoutubeSeedVideoIds(env);
  const seedVideoDetails = await fetchYoutubeVideoDetailsByIds(apiKey, seedVideoIds);
  const seedChannelIds = dedupeById(
    seedVideoDetails
      .map((item) => ({ id: String(item?.snippet?.channelId || '').trim() }))
      .filter((item) => item.id)
  )
    .map((item) => item.id)
    .slice(0, 24);

  const creatorChannelIds = toUniqueList([...explicitChannelIds, ...seedChannelIds], 24);
  mergeCreatorBase('youtube_channel_ids', creatorChannelIds, 60);
  if (creatorChannelIds.length === 0) return [];

  const publishedAfter = new Date(rangeCutoffMs(range)).toISOString();
  const settled = await Promise.allSettled(
    creatorChannelIds.slice(0, 10).map(async (channelId) => {
      const endpoint = createYoutubeEndpoint(apiKey, {
        type: 'video',
        channelId,
        maxResults: String(YOUTUBE_CREATOR_ITEMS_PER_CHANNEL),
        order: 'date',
        publishedAfter,
        relevanceLanguage: 'pt',
        regionCode: 'BR',
      });
      const response = await fetchWithTimeout(endpoint, undefined, 6500);
      if (!response.ok) return [];
      const payload = await response.json();
      const items = Array.isArray(payload?.items) ? payload.items : [];
      return items
        .map((item) => normalizeYoutubeItem(item, query))
        .filter(Boolean)
        .map((item) => ({
          ...item,
          source: 'YouTube Creators Base',
          score: Number(item.score || 0) + 8,
        }));
    })
  );

  return sortByScoreAndDate(
    dedupeById(
      settled.flatMap((result) => (result.status === 'fulfilled' ? result.value : []))
    )
  ).slice(0, 30);
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

const isGoogleNewsUrl = (value = '') => {
  try {
    const parsed = new URL(String(value || '').trim());
    return parsed.hostname.includes('news.google.com');
  } catch {
    return /news\.google\.com/i.test(String(value || ''));
  }
};

const extractInstagramCodeFromUrl = (url = '') => {
  const match = String(url).match(/\/(?:p|reel)\/([a-zA-Z0-9_-]+)/);
  return match?.[1] || '';
};

const instagramHandle = (value = '') => {
  const normalized = String(value || '').trim().replace(/^@+/, '');
  if (!normalized) return null;
  return `@${normalized}`;
};

const instagramTitleFromCaption = (caption = '') => {
  const cleaned = stripHtml(caption || '').replace(/\s+/g, ' ').trim();
  if (!cleaned) return 'Publicação do Instagram';
  const parts = cleaned
    .split(/(?<=[.!?])\s+/)
    .map((item) => item.trim())
    .filter(Boolean);
  return (parts[0] || cleaned).slice(0, 160);
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
  const topNews = takeTop(results.news, 4);
  const topInstagram = takeTop(results.instagram, 3);
  return [...topYoutube, ...topNews, ...topInstagram];
};

const buildCuratedYoutubeItems = (query, range) => {
  const offsetByRange = {
    '24h': 3,
    '7d': 0,
    '30d': 6,
  };
  const baseOffset = offsetByRange[range] || 0;
  const timeOffset = getRotationOffset(
    CURATED_YOUTUBE_VIDEOS.length,
    tinyHash(`youtube:${query}:${range}`)
  );
  const rotated = rotateList(CURATED_YOUTUBE_VIDEOS, baseOffset + timeOffset);

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
  const apiKey = (
    env?.YOUTUBE_DATA_API_KEY ||
    env?.YOUTUBE_API_KEY ||
    env?.NEXT_PUBLIC_YOUTUBE_API_KEY ||
    FALLBACK_YOUTUBE_DATA_API_KEY ||
    ''
  ).trim();
  const curatedItems = buildCuratedYoutubeItems(query, range);
  const handleFallbackPromise = fetchYoutubeHandleFallbackItems(query, range, env).catch(() => []);
  if (!apiKey) {
    const handleFallbackItems = await handleFallbackPromise;
    return sortByScoreAndDate(dedupeById([...handleFallbackItems, ...curatedItems])).slice(0, 30);
  }

  try {
    const publishedAfter = new Date(rangeCutoffMs(range)).toISOString();
    const aiQuery = `${query} inteligência artificial`;
    const creatorBasePromise = fetchYoutubeCreatorBaseItems(query, range, env, apiKey).catch(() => []);
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
        mergeCreatorBase('youtube_channel_ids', channelIds, 60);

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

    const discoveredChannelIds = dedupeById(
      videoItems
        .map((item) => ({ id: String(item?.snippet?.channelId || '').trim() }))
        .filter((item) => item.id)
    ).map((item) => item.id);
    mergeCreatorBase('youtube_channel_ids', discoveredChannelIds, 60);

    const dynamicItems = sortByScoreAndDate(
      dedupeById(videoItems.map((item) => normalizeYoutubeItem(item, query)).filter(Boolean))
    );
    const creatorBaseItems = await creatorBasePromise;
    const handleFallbackItems = await handleFallbackPromise;
    const combinedDynamic = sortByScoreAndDate(
      dedupeById([...creatorBaseItems, ...dynamicItems, ...handleFallbackItems])
    );

    if (combinedDynamic.length === 0) {
      return sortByScoreAndDate(curatedItems).slice(0, 30);
    }

    const dynamicIds = new Set(combinedDynamic.map((item) => item.id));
    const curatedRemainder = curatedItems.filter((item) => !dynamicIds.has(item.id));
    // Prioritize creator-base + fresh API videos and keep curated fallback at the end.
    return [...combinedDynamic, ...curatedRemainder].slice(0, 36);
  } catch (error) {
    const handleFallbackItems = await handleFallbackPromise;
    return sortByScoreAndDate(dedupeById([...handleFallbackItems, ...curatedItems])).slice(0, 30);
  }
};

const fetchYoutubeLiveNewsItems = async (query, range, env = {}) => {
  const apiKey = (env?.YOUTUBE_DATA_API_KEY || FALLBACK_YOUTUBE_DATA_API_KEY || '').trim();
  if (!apiKey) return [];
  const publishedAfter = new Date(rangeCutoffMs(range)).toISOString();
  const liveQueries = [
    `${query} ao vivo brasil tecnologia`,
    'programacao ao vivo brasil',
    'inteligencia artificial ao vivo brasil',
  ];

  const settled = await Promise.allSettled(
    liveQueries.map(async (liveQuery) => {
      const endpoint = createYoutubeEndpoint(apiKey, {
        type: 'video',
        eventType: 'live',
        q: liveQuery,
        maxResults: '8',
        order: 'viewCount',
        relevanceLanguage: 'pt',
        regionCode: 'BR',
        publishedAfter,
      });
      const response = await fetchWithTimeout(endpoint, undefined, 6500);
      if (!response.ok) return [];
      const payload = await response.json();
      const items = Array.isArray(payload?.items) ? payload.items : [];
      return items
        .map((item, index) => {
          const videoId = String(item?.id?.videoId || '').trim();
          const title = stripHtml(item?.snippet?.title || '');
          if (!videoId || !title) return null;
          const description = stripHtml(item?.snippet?.description || '').slice(0, 1200);
          const channel = stripHtml(item?.snippet?.channelTitle || '') || null;
          const publishedAt = safeIsoDate(item?.snippet?.publishedAt || '') || null;
          const thumbnail =
            item?.snippet?.thumbnails?.high?.url ||
            item?.snippet?.thumbnails?.medium?.url ||
            item?.snippet?.thumbnails?.default?.url ||
            null;
          return {
            id: `news-ytlive-${videoId}`,
            kind: 'news',
            title: title.slice(0, 180),
            description: description || 'Live de tecnologia e IA em andamento no YouTube.',
            url: `https://www.youtube.com/watch?v=${videoId}`,
            source: 'YouTube Live BR',
            publishedAt,
            thumbnail,
            channel,
            score: 86 - index + computeScore(`${title} ${channel || ''}`, description, publishedAt, query),
            ctaLabel: 'Assistir live',
          };
        })
        .filter(Boolean);
    })
  );

  return dedupeByUrl(
    settled.flatMap((result) => (result.status === 'fulfilled' ? result.value : []))
  ).slice(0, 16);
};

const fetchNewsItems = async (query, range, env = {}) => {
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
    score: 24 - index + computeScore(article.title, article.description, null, query),
    ctaLabel: 'Ler matéria',
  }));

  const rssSettledPromise = Promise.allSettled(
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
        source: entry.sourceName || feed.name,
        publishedAt: entry.publishedAt,
        thumbnail: entry.thumbnail || entry.image || null,
        channel: null,
        score: computeScore(entry.title, entry.description, entry.publishedAt, query),
        ctaLabel: 'Ler matéria',
      }));
    })
  );
  const twitterPromise = fetchTwitterNewsItems(query, range, env);
  const tabNewsPromise = fetchTabNewsItems(query, range, env);

  const [settled, twitterItems, tabNewsItems] = await Promise.all([
    rssSettledPromise,
    twitterPromise,
    tabNewsPromise,
  ]);
  const items = settled.flatMap((result) => (result.status === 'fulfilled' ? result.value : []));
  const filtered = items.filter((item) => {
    if (isGoogleNewsUrl(item.url)) return false;
    if (!isLikelyPortuguese(`${item.title} ${item.description}`)) {
      return false;
    }
    if (!item.publishedAt) return true;
    const parsed = Date.parse(item.publishedAt);
    if (Number.isNaN(parsed)) return true;
    return parsed >= cutoff;
  });

  const dynamicItems = sortByScoreAndDate(
    dedupeByUrl([...filtered, ...twitterItems, ...tabNewsItems])
  );
  const dynamicUrls = new Set(dynamicItems.map((item) => normalizeUrlForDedupe(item.url)));
  const curatedRemainder = curatedItems.filter((item) => !dynamicUrls.has(normalizeUrlForDedupe(item.url)));

  return [...dynamicItems, ...curatedRemainder].slice(0, 36);
};

const fetchCuratedInstagramItems = async (query) => {
  const rotatedPublications = rotateList(
    CURATED_INSTAGRAM_PUBLICATIONS,
    getRotationOffset(CURATED_INSTAGRAM_PUBLICATIONS.length, tinyHash(`instagram:${query}`))
  );
  const settled = await Promise.allSettled(
    rotatedPublications.map(async (publication, index) => {
      let title = publication.title;
      let description = publication.description;
      let channel = publication.channel || null;
      let resolvedFromOEmbed = false;

      try {
        const oEmbedUrl = `https://www.instagram.com/api/v1/oembed/?url=${encodeURIComponent(publication.url)}`;
        const oEmbedResponse = await fetchWithTimeout(
          oEmbedUrl,
          {
            headers: {
              'user-agent':
                'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
              accept: 'application/json',
            },
          },
          4500
        );
        if (oEmbedResponse.ok) {
          const oEmbed = await oEmbedResponse.json();
          const embeddedTitle = stripHtml(oEmbed?.title || '').slice(0, 1200);
          const embeddedAuthorHandle =
            normalizeInstagramHandle(oEmbed?.author_name || '') ||
            extractInstagramHandle(String(oEmbed?.author_url || ''));

          if (embeddedTitle && !looksLikeGenericInstagramText(embeddedTitle) && embeddedTitle.length >= 8) {
            title = embeddedTitle.slice(0, 180);
            description = embeddedTitle;
            resolvedFromOEmbed = true;
          }
          if (embeddedAuthorHandle) {
            channel = embeddedAuthorHandle;
          }
        }
      } catch (error) {
        // Continue with HTML meta fallback below.
      }

      if (!resolvedFromOEmbed) {
        try {
          const response = await fetchWithTimeout(
            publication.url,
            {
              headers: {
                'user-agent':
                  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
                accept: 'text/html,application/xhtml+xml',
              },
            },
            5500
          );

          if (response.ok) {
            const html = await response.text();
            const ogTitle = cleanInstagramTitle(extractMetaContent(html, 'og:title'));
            const ogDescription = extractMetaContent(html, 'og:description');
            const caption = extractInstagramCaption(ogDescription);
            const discoveredHandle = extractInstagramHandle(`${ogTitle} ${ogDescription}`);

            if (ogTitle && !looksLikeGenericInstagramText(ogTitle) && ogTitle.length <= 180) {
              title = ogTitle;
            }
            if (caption && !looksLikeGenericInstagramText(caption) && caption.length >= 12) {
              description = caption;
            }
            if (discoveredHandle) {
              channel = discoveredHandle;
            }
          }
        } catch (error) {
          // Keep curated fallback when Instagram blocks metadata fetch.
        }
      }

      return {
        id: publication.id,
        kind: 'instagram',
        title,
        description,
        url: publication.url,
        source: 'Instagram',
        publishedAt: null,
        thumbnail: publication.thumbnail || buildInstagramThumbnail(title),
        channel,
        score:
          50 -
          index +
          computeScore(`${title} ${channel || ''} instagram`, description, null, query),
        ctaLabel: publication.ctaLabel,
      };
    })
  );

  const items = settled.flatMap((result) => (result.status === 'fulfilled' ? [result.value] : []));
  const discoveredHandles = items
    .map((item) => String(item?.channel || '').replace(/^@+/, '').toLowerCase())
    .filter((value) => /^[a-z0-9._]{2,40}$/i.test(value));
  mergeCreatorBase('instagram_handles', discoveredHandles, 40);
  return items;
};

const getInstagramGraphCredentials = (env = {}) => {
  const userId =
    String(
      env?.INSTAGRAM_USER_ID ||
      env?.IG_USER_ID ||
      env?.INSTAGRAM_BUSINESS_ACCOUNT_ID ||
      FALLBACK_INSTAGRAM_USER_ID ||
      ''
    ).trim();
  const token = String(env?.INSTAGRAM_ACCESS_TOKEN || env?.IG_ACCESS_TOKEN || env?.META_ACCESS_TOKEN || '').trim();
  return { userId, token };
};

const fetchInstagramGraphItems = async (query, env = {}) => {
  const { userId, token } = getInstagramGraphCredentials(env);
  if (!userId || !token) return [];

  try {
    const endpoint = new URL(`https://graph.facebook.com/${INSTAGRAM_GRAPH_VERSION}/${userId}/media`);
    endpoint.searchParams.set(
      'fields',
      'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,username'
    );
    endpoint.searchParams.set('limit', String(INSTAGRAM_GRAPH_LIMIT));
    endpoint.searchParams.set('access_token', token);

    const response = await fetchWithTimeout(endpoint.toString(), undefined, 6500);
    if (!response.ok) {
      return [];
    }
    const payload = await response.json();
    const items = Array.isArray(payload?.data) ? payload.data : [];
    const discoveredHandles = items
      .map((media) => instagramHandle(media?.username || '') || '')
      .map((value) => String(value).replace(/^@+/, '').toLowerCase())
      .filter(Boolean);
    mergeCreatorBase('instagram_handles', discoveredHandles, 40);

    return items
      .map((media, index) => {
        const permalink = String(media?.permalink || '').trim();
        if (!permalink) return null;

        const caption = stripHtml(media?.caption || '');
        const title = instagramTitleFromCaption(caption);
        const code = extractInstagramCodeFromUrl(permalink);
        const mediaType = String(media?.media_type || '').toUpperCase();
        const isVideo = mediaType.includes('VIDEO') || permalink.includes('/reel/');
        const thumbnail =
          code
            ? `/api/instagram-image?code=${code}${isVideo ? '&kind=reel' : ''}`
            : media?.thumbnail_url || media?.media_url || buildInstagramThumbnail(title);

        const publishedAt = safeIsoDate(media?.timestamp || '');
        const channel = instagramHandle(media?.username || '') || null;

        return {
          id: `instagram-graph-${media?.id || code || index}`,
          kind: 'instagram',
          title,
          description: caption || 'Publicação recente do Instagram sobre IA.',
          url: permalink,
          source: 'Instagram',
          publishedAt,
          thumbnail,
          channel,
          score: 120 - index + computeScore(`${title} ${channel || ''}`, caption, publishedAt, query),
          ctaLabel: isVideo ? 'Ver reel' : 'Ver post',
        };
      })
      .filter(Boolean);
  } catch {
    return [];
  }
};

const parseInstagramRssFeeds = (env = {}) => {
  const raw = String(env?.INSTAGRAM_RSS_FEEDS || env?.INSTAGRAM_RSS_URLS || env?.INSTAGRAM_RSS_URL || '').trim();
  if (!raw) return [];
  return raw
    .split(/[,\n;]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item, index, arr) => arr.indexOf(item) === index)
    .slice(0, 3);
};

const fetchInstagramItemsFromRss = async (query, env = {}) => {
  const feeds = parseInstagramRssFeeds(env);
  if (feeds.length === 0) return [];

  const settled = await Promise.allSettled(
    feeds.map(async (feedUrl) => {
      const response = await fetchWithTimeout(feedUrl, undefined, 6500);
      if (!response.ok) {
        throw new Error(`instagram_rss_fetch_failed:${response.status}`);
      }
      const xml = await response.text();
      const parsed = parseFeedItems(xml).slice(0, INSTAGRAM_RSS_LIMIT);
      return parsed.map((entry, index) => {
        const code = extractInstagramCodeFromUrl(entry.link);
        const isReel = entry.link.includes('/reel/');
        const title = instagramTitleFromCaption(entry.title || entry.description || 'Publicação do Instagram');
        const description = (entry.description || '').slice(0, 1200);
        return {
          id: `instagram-rss-${normalizeUrlForDedupe(entry.link) || index}`,
          kind: 'instagram',
          title,
          description: description || title,
          url: entry.link,
          source: 'Instagram',
          publishedAt: entry.publishedAt,
          thumbnail: code
            ? `/api/instagram-image?code=${code}${isReel ? '&kind=reel' : ''}`
            : buildInstagramThumbnail(title),
          channel: null,
          score: 90 - index + computeScore(title, description, entry.publishedAt, query),
          ctaLabel: isReel ? 'Ver reel' : 'Ver post',
        };
      });
    })
  );

  return dedupeByUrl(
    settled.flatMap((result) => (result.status === 'fulfilled' ? result.value : []))
  );
};

const fetchInstagramItemsFromCreatorProfiles = async (query, env = {}) => {
  const explicitHandles = parseInstagramCreatorHandles(env);
  const seedUrls = parseInstagramSeedUrls(env);
  const settledHandles = await Promise.allSettled(
    seedUrls.slice(0, 10).map((url) => resolveInstagramHandleFromSeedUrl(url))
  );
  const discoveredHandles = settledHandles.flatMap((result) =>
    result.status === 'fulfilled' && result.value ? [result.value] : []
  );
  const handles = toUniqueList([...explicitHandles, ...discoveredHandles], 16);
  mergeCreatorBase('instagram_handles', handles, 40);
  if (handles.length === 0) return [];

  const settled = await Promise.allSettled(
    handles.map(async (handle) => {
      const feedCandidates = [
        `https://rsshub.app/instagram/user/${encodeURIComponent(handle)}`,
        `https://rsshub.app/instagram/u/${encodeURIComponent(handle)}`,
      ];

      let parsed = [];
      for (const feedUrl of feedCandidates) {
        try {
          const response = await fetchWithTimeout(feedUrl, undefined, 6000);
          if (!response.ok) continue;
          const xml = await response.text();
          const entries = parseFeedItems(xml);
          if (entries.length > 0) {
            parsed = entries;
            break;
          }
        } catch {
          // Try next RSS candidate.
        }
      }

      if (parsed.length === 0) {
        parsed = await fetchInstagramCreatorEntriesFromBridge(handle, env);
      }

      return parsed.slice(0, INSTAGRAM_CREATOR_ITEMS_PER_PROFILE).map((entry, index) => {
        const code = extractInstagramCodeFromUrl(entry.link);
        const isReel = entry.link.includes('/reel/');
        const title = instagramTitleFromCaption(entry.title || entry.description || `Atualização de @${handle}`);
        const description = (entry.description || title).slice(0, 1200);
        const publishedAt = safeIsoDate(entry.publishedAt || '');
        const aiBoost = isAiRelated(`${title} ${description}`) ? 5 : 0;

        return {
          id: `instagram-creator-${handle}-${normalizeUrlForDedupe(entry.link) || index}`,
          kind: 'instagram',
          title,
          description,
          url: entry.link,
          source: 'Instagram Creators',
          publishedAt,
          thumbnail: code
            ? `/api/instagram-image?code=${code}${isReel ? '&kind=reel' : ''}`
            : buildInstagramThumbnail(title),
          channel: `@${handle}`,
          score: 112 - index + aiBoost + computeScore(`${title} @${handle}`, description, publishedAt, query),
          ctaLabel: isReel ? 'Ver reel' : 'Ver post',
        };
      });
    })
  );

  return dedupeByUrl(
    settled.flatMap((result) => (result.status === 'fulfilled' ? result.value : []))
  );
};

const fetchInstagramItems = async (query, env = {}) => {
  const [dynamic, rssDynamic, creatorDynamic, curated] = await Promise.all([
    fetchInstagramGraphItems(query, env),
    fetchInstagramItemsFromRss(query, env),
    fetchInstagramItemsFromCreatorProfiles(query, env),
    fetchCuratedInstagramItems(query),
  ]);

  const dynamicCombined = dedupeByUrl([...dynamic, ...rssDynamic, ...creatorDynamic]);
  if (dynamicCombined.length === 0) {
    return curated;
  }

  const curatedWithoutDuplicates = curated.filter(
    (item) =>
      !dynamicCombined.some(
        (dynamicItem) => normalizeUrlForDedupe(dynamicItem.url) === normalizeUrlForDedupe(item.url)
      )
  );

  return sortByScoreAndDate([...dynamicCombined, ...curatedWithoutDuplicates]).slice(0, 30);
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
    news: requestedKinds.includes('news') ? fetchNewsItems(query, range, env) : Promise.resolve([]),
    instagram: requestedKinds.includes('instagram')
      ? fetchInstagramItems(query, env)
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
  const cacheKey = `v7:${type}:${range}:${query.toLowerCase()}`;
  const now = Date.now();
  const cached = cache.get(cacheKey);

  if (cached && cached.expiresAt > now) {
    return Response.json(cached.data, {
      headers: {
        'x-radar-cache': 'hit',
        'cache-control': 'public, max-age=30',
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
      'cache-control': 'public, max-age=30',
    },
  });
}
