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
    id: 'enigma-voice-core',
    title: 'ENIGMA Voice Core',
    category: 'IA',
    summary:
      'Assistente conversacional com pipeline de voz e respostas naturais para operações e atendimento.',
    tags: ['Next.js', 'Gemini', 'Speech', 'UX Voice'],
    caseHref: '#case-enigma-voice-core',
    screens: [
      {
        id: 'enigma-desktop',
        title: 'Console Operacional',
        description: 'Painel principal com status em tempo real e histórico de interações.',
        device: 'desktop',
      },
      {
        id: 'enigma-mobile',
        title: 'Modo Mobile',
        description: 'Fluxo de comando por voz otimizado para uso em campo.',
        device: 'mobile',
      },
    ],
  },
  {
    id: 'atlas-ops-platform',
    title: 'Atlas Ops Platform',
    category: 'Software',
    summary:
      'Plataforma de gestão com dashboards de performance, alertas e automações para equipes comerciais.',
    tags: ['React', 'API', 'Analytics', 'SaaS'],
    caseHref: '#case-atlas-ops-platform',
    screens: [
      {
        id: 'atlas-desktop',
        title: 'Dashboard Executivo',
        description: 'Visão consolidada de funil, receita e produtividade.',
        device: 'desktop',
      },
      {
        id: 'atlas-mobile',
        title: 'Painel Comercial',
        description: 'Consulta rápida de metas e tarefas no app mobile.',
        device: 'mobile',
      },
    ],
  },
  {
    id: 'growth-command-ads',
    title: 'Growth Command Ads',
    category: 'Marketing',
    summary:
      'Estrutura de aquisição com Google Ads, Meta Ads e otimização contínua orientada a ROI.',
    tags: ['Google Ads', 'Meta Ads', 'SEO', 'Growth'],
    caseHref: '#case-growth-command-ads',
    screens: [
      {
        id: 'growth-desktop',
        title: 'Painel de Mídia',
        description: 'Relatórios de campanhas e decisões baseadas em dados.',
        device: 'desktop',
      },
      {
        id: 'growth-mobile',
        title: 'Acompanhamento Diário',
        description: 'Resumo de investimento e performance em formato mobile.',
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
