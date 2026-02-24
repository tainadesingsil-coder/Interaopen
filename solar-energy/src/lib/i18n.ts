export type Locale = 'pt' | 'en' | 'it';

export const baseCopy = {
  nav: {
    location: 'Localização',
    works: 'Obras',
    investment: 'Investimento',
    contact: 'Contato',
    menu: 'Menu',
    menuAria: 'Abrir menu',
    languageLabel: 'Selecionar idioma',
  },
  hero: {
    eyebrow: 'Costa do Descobrimento · Bahia',
    title: 'Viva perto do mar.\nInvista onde o futuro passa.',
    subtitle:
      'Studios e apartamentos em uma das regiões mais desejadas da Bahia, com alto potencial de valorização.',
    subtitleDesktop:
      'Studios e apartamentos na Costa do Descobrimento, com localização estratégica e potencial de valorização.',
    primaryCta: 'Solicitar apresentação exclusiva',
    primaryCtaDesktop: 'Solicitar apresentação exclusiva',
    secondaryCta: 'Ver localização',
  },
  location: {
    tag: 'LOCALIZAÇÃO ESTRATÉGICA',
    title: 'Localização que vira demanda.',
    body:
      'Entre BR-367 e os polos turísticos, acesso rápido e liquidez para uso próprio ou renda.',
    benefits: [
      'Acesso pela BR-367',
      'Fluxo turístico constante',
      'Equilíbrio: privacidade + movimento',
    ],
  },
  simulator: {
    tag: 'INVESTIMENTO',
    title: 'Simule seu retorno com aluguel de temporada.',
    subtitle:
      'Ajuste os números e veja uma estimativa de faturamento, custos e retorno anual. Valores ilustrativos.',
    bullets: [
      'Demanda sazonal favorece ocupação consistente.',
      'Modelo flexível para uso próprio ou renda.',
      'Operação enxuta com potencial recorrente.',
    ],
    presets: {
      conservative: 'Conservador',
      realistic: 'Realista',
      high: 'Alta Temporada',
    },
    fields: {
      propertyValue: 'Valor do imóvel (R$)',
      dailyRate: 'Diária média (R$)',
      occupancy: 'Ocupação (%)',
      monthlyCosts: 'Custos mensais (R$)',
      platformFee: 'Taxa de plataforma (%)',
    },
    results: {
      revenue: 'Faturamento',
      profit: 'Lucro mensal',
      annualReturn: 'Retorno anual',
      payback: 'Payback',
    },
    ctaPrimary: 'Receber simulação no WhatsApp',
    ctaSecondary: 'Baixar PDF da simulação',
    disclaimer: 'Estimativa. Não substitui análise financeira.',
    paybackUnit: 'anos',
    notAvailable: '—',
  },
  showcase: {
    title: 'Vitrine do Bella Vista Beach Residence',
    subtitle: 'Explore o interior pensado para viver e investir bem.',
    detailsOpen: 'Ver detalhes',
    detailsClose: 'Fechar',
    dialogLabel: 'Detalhes do card',
    items: [
      { label: 'STUDIO', title: 'Apartamento studio', desc: '27 m²' },
      { label: '2 QUARTOS', title: 'Apartamento 2 quartos', desc: '45 m²' },
      { label: '3 QUARTOS', title: 'Apartamento 3 quartos', desc: '82,48 m²' },
      {
        label: 'AMBIENTE TOTAL',
        title: 'Ambiente completo',
        desc: 'Borda infinita • SPA e academia • Lounge e trilhas',
      },
    ],
  },
  progress: {
    tag: 'ANDAMENTO DA OBRA',
    title: 'Já estamos em obra.',
    body:
      'Evolução contínua com etapas monitoradas. Atualizações visuais registradas para acompanhar cada avanço.',
    highlights: ['Estrutura em andamento', 'Equipe local mobilizada', 'Cronograma ativo'],
  },
  finalCta: {
    title: 'Tudo pronto para sua próxima decisão patrimonial.',
    body:
      'Receba uma apresentação completa e tire dúvidas com um especialista.',
    primary: 'Agendar conversa',
    secondary: 'Ver obras',
  },
  contact: {
    tag: 'CONTATO',
    title: 'Fale com nossa equipe',
    body: 'Atendimento consultivo e rápido para você avançar com segurança.',
    email: 'gestaocliente@bellaimperial.com.br',
    location: 'Costa do Descobrimento • Bahia',
    whatsappValue: 'Atendimento imediato',
    form: {
      nameLabel: 'Nome',
      emailLabel: 'Email',
      messageLabel: 'Mensagem',
      namePlaceholder: 'Seu nome',
      emailPlaceholder: 'voce@email.com',
      messagePlaceholder: 'Como podemos ajudar?',
      submit: 'Enviar mensagem',
    },
    cards: {
      whatsapp: 'WhatsApp',
      email: 'Email',
      location: 'Localização',
    },
  },
  map: {
    title: 'Mapa da região',
  },
  experience: {
    tag: 'Experiência',
    title: 'Alguns lugares você entende. Outros você sente.',
    body:
      'O Bella Vista equilibra desejo e previsibilidade. Um convite para viver o litoral com segurança patrimonial.',
  },
  floating: {
    ariaLabel: 'Abrir conversa no WhatsApp',
  },
  pdf: {
    title: 'Bella Vista Beach Residence',
    subtitle: 'Simulacao de retorno (valores ilustrativos)',
    propertyValue: 'Valor do imovel',
    dailyRate: 'Diaria media',
    occupancy: 'Ocupacao',
    monthlyCosts: 'Custos mensais',
    platformFee: 'Taxa plataforma',
    grossMonthly: 'Faturamento mensal',
    netMonthly: 'Lucro mensal',
    annualReturn: 'Retorno anual',
    payback: 'Payback',
    paybackUnit: 'anos',
    notAvailable: '-',
    fileName: 'simulacao-bella-vista.pdf',
  },
};

export type BaseCopy = typeof baseCopy;

export const translations: Record<Locale, BaseCopy> = {
  pt: baseCopy,
  en: {
    ...baseCopy,
    nav: {
      location: 'Location',
      works: 'Construction Progress',
      investment: 'Investment',
      contact: 'Contact',
      menu: 'Menu',
      menuAria: 'Open menu',
      languageLabel: 'Select language',
    },
    hero: {
      ...baseCopy.hero,
      eyebrow: 'Brazil’s Discovery Coast · Bahia',
      title: 'Live by the sea.\nInvest where the future is headed.',
      subtitle:
        'Studios and apartments on Bahia’s Discovery Coast with strong appreciation potential.',
      subtitleDesktop:
        'Studios and apartments on Brazil’s Discovery Coast, Bahia, with a strategic position and strong appreciation potential.',
      primaryCta: 'Request a private presentation',
      primaryCtaDesktop: 'Request a private presentation',
      secondaryCta: 'View location',
    },
    location: {
      ...baseCopy.location,
      tag: 'PRIME LOCATION',
      title: 'A location that drives demand.',
      body:
        'Set between BR-367 and the region’s tourism hubs, Bella Vista combines fast access, consistent demand, and privacy for owners and investors.',
      benefits: [
        'BR-367 access',
        'Year-round tourism demand',
        'Privacy with liquidity',
      ],
    },
    simulator: {
      ...baseCopy.simulator,
      tag: 'INVESTMENT',
      title: 'Simulate your return with short-term rentals.',
      subtitle:
        'Adjust the inputs and see an estimate of revenue, costs, and annual return. Illustrative values.',
      bullets: [
        'Seasonal demand supports strong occupancy.',
        'Flexible model for personal use or income.',
        'Lean operations with recurring returns.',
      ],
      presets: {
        conservative: 'Conservative',
        realistic: 'Balanced',
        high: 'High Season',
      },
      fields: {
        propertyValue: 'Property value (R$)',
        dailyRate: 'Average nightly rate (R$)',
        occupancy: 'Occupancy (%)',
        monthlyCosts: 'Monthly costs (R$)',
        platformFee: 'Platform fee (%)',
      },
      results: {
        revenue: 'Monthly revenue',
        profit: 'Monthly profit',
        annualReturn: 'Annual return',
        payback: 'Payback',
      },
      ctaPrimary: 'Get the simulation on WhatsApp',
      ctaSecondary: 'Download the PDF',
      disclaimer: 'Estimate only. Not financial advice.',
      paybackUnit: 'years',
      notAvailable: '—',
    },
    progress: {
      ...baseCopy.progress,
      tag: 'CONSTRUCTION PROGRESS',
      title: 'Construction is in progress.',
      body:
        'Progress is tracked on-site with regular visual updates.',
      highlights: ['Structure underway', 'Local team mobilized', 'Active schedule'],
    },
    finalCta: {
      ...baseCopy.finalCta,
      title: 'Everything is in place for your next investment move.',
      body: 'Get the full presentation and speak with a specialist.',
      primary: 'Schedule a private call',
      secondary: 'View construction',
    },
    contact: {
      ...baseCopy.contact,
      tag: 'CONTACT',
      title: 'Connect with our team',
      body: 'Premium, consultative support for international buyers.',
      location: 'Bahia’s Discovery Coast, Brazil',
      whatsappValue: 'Immediate WhatsApp support',
      form: {
        nameLabel: 'Full name',
        emailLabel: 'Email',
        messageLabel: 'Message',
        namePlaceholder: 'Your full name',
        emailPlaceholder: 'you@email.com',
        messagePlaceholder: "Tell us what you're looking for",
        submit: 'Send inquiry',
      },
      cards: {
        whatsapp: 'WhatsApp',
        email: 'Email',
        location: 'Location',
      },
    },
    experience: {
      ...baseCopy.experience,
      tag: 'EXPERIENCE',
      title: 'Some places you understand. Others you feel.',
      body:
        'Bella Vista balances desire and predictability—an invitation to enjoy the coast with investment-grade security.',
    },
    floating: {
      ariaLabel: 'Open WhatsApp chat',
    },
    showcase: {
      title: 'Residence Collection',
      subtitle: 'Explore spaces designed for living and built for returns.',
      detailsOpen: 'Explore',
      detailsClose: 'Close',
      dialogLabel: 'Residence details',
      items: [
        { label: 'STUDIO', title: 'Studio residence', desc: '27 sqm' },
        { label: '2 BEDROOMS', title: '2-bedroom residence', desc: '45 sqm' },
        { label: '3 BEDROOMS', title: '3-bedroom residence', desc: '82.48 sqm' },
        {
          label: 'FULL AMENITIES',
          title: 'Signature amenities',
          desc: 'Infinity edge • Spa & gym • Lounge & trails',
        },
      ],
    },
    map: {
      title: 'Location map',
    },
    pdf: {
      title: 'Bella Vista Beach Residence',
      subtitle: 'Return simulation (illustrative values)',
      propertyValue: 'Property value',
      dailyRate: 'Average nightly rate',
      occupancy: 'Occupancy',
      monthlyCosts: 'Monthly costs',
      platformFee: 'Platform fee',
      grossMonthly: 'Monthly revenue',
      netMonthly: 'Monthly profit',
      annualReturn: 'Annual return',
      payback: 'Payback',
      paybackUnit: 'years',
      notAvailable: '-',
      fileName: 'bella-vista-return-simulation.pdf',
    },
  },
  it: {
    ...baseCopy,
    nav: {
      location: 'Posizione Strategica',
      works: 'Avanzamento Lavori',
      investment: 'Investimento',
      contact: 'Contatto',
      menu: 'Menu',
      menuAria: 'Apri menu',
      languageLabel: 'Seleziona lingua',
    },
    hero: {
      ...baseCopy.hero,
      eyebrow: 'Costa della Scoperta, Bahia – Brasile',
      title: 'Vivi sul mare.\nInvesti nel futuro.',
      subtitle:
        'Monolocali e appartamenti sulla Costa della Scoperta con forte potenziale di valorizzazione.',
      subtitleDesktop:
        'Asset immobiliari sulla costa della Bahia, in una posizione strategica con prospettive di rendimento.',
      primaryCta: 'Richiedi una presentazione privata',
      primaryCtaDesktop: 'Richiedi una presentazione privata',
      secondaryCta: 'Vedi posizione',
    },
    location: {
      ...baseCopy.location,
      tag: 'POSIZIONE PRIVILEGIATA',
      title: 'Una posizione strategica ad alta richiesta.',
      body:
        'Tra la BR-367 e i poli turistici, Bella Vista unisce accesso rapido, domanda costante e privacy per proprietari e investitori.',
      benefits: [
        'Accesso diretto alla BR-367',
        'Domanda turistica tutto l’anno',
        'Privacy con alta liquidità',
      ],
    },
    simulator: {
      ...baseCopy.simulator,
      tag: 'INVESTIMENTO',
      title: 'Simula il rendimento degli affitti brevi.',
      subtitle:
        'Regola i valori e ottieni una stima di ricavi, costi e rendimento annuo. Valori indicativi.',
      bullets: [
        'Domanda stagionale con occupazione elevata.',
        'Modello flessibile per seconda casa o reddito.',
        'Gestione snella con rendimento ricorrente.',
      ],
      presets: {
        conservative: 'Conservativo',
        realistic: 'Equilibrato',
        high: 'Alta Stagione',
      },
      fields: {
        propertyValue: 'Valore dell’immobile (R$)',
        dailyRate: 'Tariffa media per notte (R$)',
        occupancy: 'Occupazione (%)',
        monthlyCosts: 'Costi mensili (R$)',
        platformFee: 'Commissione piattaforma (%)',
      },
      results: {
        revenue: 'Ricavi mensili',
        profit: 'Utile mensile',
        annualReturn: 'Rendimento annuo',
        payback: 'Payback',
      },
      ctaPrimary: 'Ricevi la simulazione su WhatsApp',
      ctaSecondary: 'Scarica il PDF',
      disclaimer: 'Stima indicativa. Non sostituisce un’analisi finanziaria.',
      paybackUnit: 'anni',
      notAvailable: '—',
    },
    progress: {
      ...baseCopy.progress,
      tag: 'AVANZAMENTO LAVORI',
      title: 'Lavori in corso.',
      body:
        'Avanzamento monitorato con aggiornamenti visivi periodici.',
      highlights: ['Struttura in avanzamento', 'Team locale operativo', 'Cronoprogramma attivo'],
    },
    finalCta: {
      ...baseCopy.finalCta,
      title: 'Tutto è pronto per il tuo prossimo investimento immobiliare.',
      body: 'Ricevi la presentazione completa e parla con un consulente.',
      primary: 'Prenota una consulenza',
      secondary: 'Vedi avanzamento',
    },
    contact: {
      ...baseCopy.contact,
      tag: 'CONTATTO',
      title: 'Contatta il nostro team',
      body: 'Assistenza dedicata e riservata per investitori internazionali.',
      location: 'Costa della Scoperta, Bahia – Brasile',
      whatsappValue: 'Supporto WhatsApp dedicato',
      form: {
        nameLabel: 'Nome completo',
        emailLabel: 'Email',
        messageLabel: 'Messaggio',
        namePlaceholder: 'Nome completo',
        emailPlaceholder: 'tu@email.com',
        messagePlaceholder: 'Descrivici le tue esigenze',
        submit: 'Invia richiesta',
      },
      cards: {
        whatsapp: 'WhatsApp',
        email: 'Email',
        location: 'Posizione',
      },
    },
    experience: {
      ...baseCopy.experience,
      tag: 'ESPERIENZA',
      title: 'Alcuni luoghi si comprendono. Altri si sentono.',
      body:
        'Bella Vista unisce desiderio e stabilità: un asset immobiliare per vivere la costa e valorizzare il patrimonio.',
    },
    floating: {
      ariaLabel: 'Apri WhatsApp',
    },
    showcase: {
      title: 'Collezione Residenze',
      subtitle: 'Scopri spazi pensati per vivere oggi e valorizzare domani.',
      detailsOpen: 'Scopri di più',
      detailsClose: 'Chiudi',
      dialogLabel: 'Dettagli residenza',
      items: [
        { label: 'STUDIO', title: 'Monolocale', desc: '27 m²' },
        { label: '2 CAMERE', title: 'Appartamento 2 camere', desc: '45 m²' },
        { label: '3 CAMERE', title: 'Appartamento 3 camere', desc: '82,48 m²' },
        {
          label: 'SERVIZI COMPLETI',
          title: 'Servizi premium',
          desc: 'Bordo infinito • Spa e palestra • Lounge e sentieri',
        },
      ],
    },
    map: {
      title: 'Mappa della zona',
    },
    pdf: {
      title: 'Bella Vista Beach Residence',
      subtitle: 'Simulazione di rendimento (valori indicativi)',
      propertyValue: "Valore dell'immobile",
      dailyRate: 'Tariffa media per notte',
      occupancy: 'Occupazione',
      monthlyCosts: 'Costi mensili',
      platformFee: 'Commissione piattaforma',
      grossMonthly: 'Ricavi mensili',
      netMonthly: 'Utile mensile',
      annualReturn: 'Rendimento annuo',
      payback: 'Payback',
      paybackUnit: 'anni',
      notAvailable: '-',
      fileName: 'simulazione-bella-vista.pdf',
    },
  },
};
