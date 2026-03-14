export type ProjectCategory = 'Software' | 'Marketing' | 'IA';
export type ScreenDevice = 'desktop' | 'mobile';

export interface ProjectScreen {
  id: string;
  title: string;
  description: string;
  device: ScreenDevice;
}

export interface FeaturedProject {
  id: string;
  title: string;
  category: ProjectCategory;
  summary: string;
  tags: string[];
  caseHref: string;
  caseLabel?: string;
  screens: ProjectScreen[];
}

export interface ProductOffer {
  id: string;
  title: string;
  description: string;
  area: 'Software' | 'Marketing' | 'IA';
}

export const featuredProjects: FeaturedProject[] = [
  {
    id: 'tiktok-ai-discovery',
    title: 'TikTok · Descoberta de IA',
    category: 'IA',
    summary:
      'Modelo de monitoramento para identificar conteúdos, trends e creators de IA no TikTok em tempo real.',
    tags: ['TikTok', 'Trends', 'IA', 'Curadoria'],
    caseHref: 'https://www.tiktok.com/tag/inteligenciaartificial',
    caseLabel: 'Abrir feed',
    screens: [
      {
        id: 'tiktok-discovery-desktop',
        title: 'Descoberta de conteúdos',
        description: 'Busca contínua por publicações novas relacionadas a IA.',
        device: 'desktop',
      },
      {
        id: 'tiktok-discovery-mobile',
        title: 'Modelo mobile',
        description: 'Visual mobile para acompanhar vídeos em alta.',
        device: 'mobile',
      },
    ],
  },
  {
    id: 'tiktok-live-models',
    title: 'TikTok · Lives e creators',
    category: 'Marketing',
    summary:
      'Modelo de curadoria para lives e criadores que falam de automação, IA e conteúdo digital.',
    tags: ['Live', 'Creator', 'Social', 'Radar'],
    caseHref: 'https://www.tiktok.com/discover/live-ia',
    caseLabel: 'Abrir feed',
    screens: [
      {
        id: 'tiktok-live-desktop',
        title: 'Painel de creators',
        description: 'Lista priorizada de perfis e lives recentes.',
        device: 'desktop',
      },
      {
        id: 'tiktok-live-mobile',
        title: 'Acompanhamento rápido',
        description: 'Acesso mobile para validar conteúdo ao vivo.',
        device: 'mobile',
      },
    ],
  },
  {
    id: 'twitch-science-tech',
    title: 'Twitch · Science & Technology',
    category: 'Software',
    summary:
      'Modelo para acompanhar streams técnicos com foco em programação, IA aplicada e ferramentas de dev.',
    tags: ['Twitch', 'Live Coding', 'IA', 'Dev'],
    caseHref: 'https://www.twitch.tv/directory/category/science-and-technology',
    caseLabel: 'Abrir feed',
    screens: [
      {
        id: 'twitch-desktop',
        title: 'Streams técnicas',
        description: 'Monitoramento de streams para referências de produto e conteúdo.',
        device: 'desktop',
      },
      {
        id: 'twitch-mobile',
        title: 'Visão mobile',
        description: 'Acompanhamento rápido de transmissões ao vivo.',
        device: 'mobile',
      },
    ],
  },
  {
    id: 'discord-midjourney',
    title: 'Discord · Midjourney Community',
    category: 'IA',
    summary:
      'Modelo de comunidade para acompanhar anúncios, tendências e discussões práticas sobre IA generativa.',
    tags: ['Discord', 'Comunidade', 'Midjourney', 'IA'],
    caseHref: 'https://discord.com/servers/midjourney-662267976984297473',
    caseLabel: 'Abrir comunidade',
    screens: [
      {
        id: 'discord-midjourney-desktop',
        title: 'Comunidade ativa',
        description: 'Acompanhamento de canais e novidades em tempo real.',
        device: 'desktop',
      },
      {
        id: 'discord-midjourney-mobile',
        title: 'Entrada rápida',
        description: 'Acesso mobile para conversas e updates da comunidade.',
        device: 'mobile',
      },
    ],
  },
  {
    id: 'discord-huggingface',
    title: 'Discord · Hugging Face',
    category: 'IA',
    summary:
      'Modelo de comunidade técnica para acompanhar discussões de modelos, datasets e aplicações de IA.',
    tags: ['Hugging Face', 'Discord', 'Modelos', 'Open Source'],
    caseHref: 'https://huggingface.co/discord-community',
    caseLabel: 'Abrir comunidade',
    screens: [
      {
        id: 'discord-hf-desktop',
        title: 'Hub técnico',
        description: 'Espaço para acompanhar temas avançados de IA.',
        device: 'desktop',
      },
      {
        id: 'discord-hf-mobile',
        title: 'Notificações',
        description: 'Modelo para seguir canais e novidades no celular.',
        device: 'mobile',
      },
    ],
  },
];

export const productOffers: ProductOffer[] = [
  {
    id: 'web-apps',
    title: 'Web Apps & Plataformas',
    description: 'Produtos web robustos com UX clara, escalabilidade e governança técnica.',
    area: 'Software',
  },
  {
    id: 'mobile-apps',
    title: 'Apps Mobile',
    description: 'Aplicativos iOS/Android com foco em fluidez, retenção e performance.',
    area: 'Software',
  },
  {
    id: 'apis-integracoes',
    title: 'APIs & Integrações',
    description: 'Conexões entre sistemas, automações e arquitetura orientada a produtividade.',
    area: 'Software',
  },
  {
    id: 'google-ads',
    title: 'Google Ads',
    description: 'Operação de mídia de alta intenção com estratégia, estrutura e otimização diária.',
    area: 'Marketing',
  },
  {
    id: 'meta-ads',
    title: 'Meta Ads',
    description: 'Campanhas de escala com criativos, segmentação e testes orientados a conversão.',
    area: 'Marketing',
  },
  {
    id: 'growth-seo',
    title: 'Growth & SEO',
    description: 'Aumento de tráfego qualificado e crescimento orgânico com consistência.',
    area: 'Marketing',
  },
  {
    id: 'agentes-ia',
    title: 'Agentes de IA',
    description: 'Agentes para atendimento, operação e vendas com contexto de negócio.',
    area: 'IA',
  },
];
