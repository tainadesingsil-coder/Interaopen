'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AnimatePresence,
  motion,
  MotionConfig,
  useReducedMotion,
} from 'framer-motion';
import {
  Bath,
  BedDouble,
  CarFront,
  Clock,
  Coins,
  Globe,
  Mail,
  MapPin,
  PhoneCall,
  Ruler,
  Shield,
  Sparkles,
  Sun,
  Trees,
  TrendingUp,
  Waves,
  Wallet,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const heroPoster =
  'https://res.cloudinary.com/dwedcl97k/video/upload/so_0,f_jpg,w_1600/v1769199580/Design_sem_nome_-_2026-01-23T171932.339_fjulxo.mp4';
const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
});

const formatCurrency = (value: number) =>
  currencyFormatter.format(Math.round(value));
const sanitizePdfText = (value: string) =>
  value.replace(/[^\x20-\x7E]/g, ' ');
const escapePdfText = (value: string) =>
  sanitizePdfText(value).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
const buildPdf = (lines: string[]) => {
  const content = lines
    .map((line, index) => {
      const y = 760 - index * 18;
      return `BT /F1 12 Tf 60 ${y} Td (${escapePdfText(line)}) Tj ET`;
    })
    .join('\n');
  let pdf = '%PDF-1.3\n';
  const offsets: number[] = [0];
  const addObject = (obj: string) => {
    offsets.push(pdf.length);
    pdf += `${obj}\n`;
  };
  addObject('1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj');
  addObject('2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj');
  addObject(
    '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj'
  );
  addObject(`4 0 obj << /Length ${content.length} >> stream\n${content}\nendstream\nendobj`);
  addObject('5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj');
  const xrefStart = pdf.length;
  pdf += 'xref\n0 6\n0000000000 65535 f \n';
  for (let i = 1; i <= 5; i += 1) {
    pdf += `${offsets[i].toString().padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer << /Size 6 /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  return pdf;
};

type Locale = 'pt' | 'en' | 'it';

const STORAGE_KEY = 'bella-vista-locale';

const localeOptions = [
  { value: 'pt', label: 'PT', name: 'Português' },
  { value: 'en', label: 'EN', name: 'English' },
  { value: 'it', label: 'IT', name: 'Italiano' },
] as const;

type ShowcaseDetail = { icon: LucideIcon; label: string; value: string };

const detailLabelMap: Record<Locale, Record<string, string>> = {
  pt: {},
  en: {
    Quartos: 'Bedrooms',
    Suítes: 'Suites',
    Vaga: 'Parking',
    Vagas: 'Parking',
    Área: 'Area',
    Banheiro: 'Bathroom',
    Banheiros: 'Bathrooms',
    Piscina: 'Pool',
    'Beach Club': 'Beach Club',
    'Bem-estar': 'Wellness',
    Lazer: 'Leisure',
    Segurança: 'Security',
  },
  it: {
    Quartos: 'Camere',
    Suítes: 'Suite',
    Vaga: 'Posto auto',
    Vagas: 'Posti auto',
    Área: 'Area',
    Banheiro: 'Bagno',
    Banheiros: 'Bagni',
    Piscina: 'Piscina',
    'Beach Club': 'Beach Club',
    'Bem-estar': 'Benessere',
    Lazer: 'Tempo libero',
    Segurança: 'Sicurezza',
  },
};

const detailValueMap: Record<Locale, Record<string, string>> = {
  pt: {},
  en: {
    'Vista para o mar': 'Ocean view',
    Ofurôs: 'Hot tubs',
    'Áreas verdes': 'Green areas',
    '24 horas': '24 hours',
  },
  it: {
    'Vista para o mar': 'Vista mare',
    Ofurôs: 'Ofurô',
    'Áreas verdes': 'Aree verdi',
    '24 horas': '24 ore',
  },
};

const localizeDetail = (detail: ShowcaseDetail, locale: Locale): ShowcaseDetail => ({
  ...detail,
  label: detailLabelMap[locale]?.[detail.label] ?? detail.label,
  value: detailValueMap[locale]?.[detail.value] ?? detail.value,
});

const baseCopy = {
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
    email: 'contato@bellavistabeach.com.br',
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

const translations: Record<Locale, typeof baseCopy> = {
  pt: baseCopy,
  en: {
    ...baseCopy,
    nav: {
      location: 'Location',
      works: 'Construction',
      investment: 'Investment',
      contact: 'Contact',
      menu: 'Menu',
      menuAria: 'Open menu',
      languageLabel: 'Select language',
    },
    hero: {
      ...baseCopy.hero,
      eyebrow: 'Discovery Coast · Bahia',
      title: 'Live near the sea.\nInvest where the future moves.',
      subtitle:
        'Studios and apartments in one of Bahia’s most desired regions, with strong appreciation potential.',
      subtitleDesktop:
        'Studios and apartments on the Discovery Coast, with strategic location and appreciation potential.',
      primaryCta: 'Request an exclusive presentation',
      primaryCtaDesktop: 'Request an exclusive presentation',
      secondaryCta: 'View location',
    },
    location: {
      ...baseCopy.location,
      tag: 'STRATEGIC LOCATION',
      title: 'Where access turns into demand.',
      body:
        'Between BR-367 and the tourism hubs, fast access and liquidity for living or income.',
      benefits: [
        'Access via BR-367',
        'Consistent tourist flow',
        'Balance: privacy + movement',
      ],
    },
    simulator: {
      ...baseCopy.simulator,
      tag: 'INVESTMENT',
      title: 'Simulate your short-term rental return.',
      subtitle:
        'Adjust the numbers and see an estimate of revenue, costs, and annual return. Illustrative values.',
      bullets: [
        'Seasonal demand supports consistent occupancy.',
        'Flexible model for personal use or income.',
        'Lean operation with recurring potential.',
      ],
      presets: {
        conservative: 'Conservative',
        realistic: 'Realistic',
        high: 'High Season',
      },
      fields: {
        propertyValue: 'Property value (R$)',
        dailyRate: 'Average daily rate (R$)',
        occupancy: 'Occupancy (%)',
        monthlyCosts: 'Monthly costs (R$)',
        platformFee: 'Platform fee (%)',
      },
      results: {
        revenue: 'Revenue',
        profit: 'Monthly profit',
        annualReturn: 'Annual return',
        payback: 'Payback',
      },
      ctaPrimary: 'Receive the simulation on WhatsApp',
      ctaSecondary: 'Download the simulation PDF',
      disclaimer: 'Estimate only. Not a financial analysis.',
      paybackUnit: 'years',
      notAvailable: '—',
    },
    progress: {
      ...baseCopy.progress,
      tag: 'CONSTRUCTION',
      title: 'Construction is underway.',
      body:
        'Continuous progress with tracked stages. Visual updates recorded to follow each advance.',
      highlights: ['Structure underway', 'Local team mobilized', 'Active schedule'],
    },
    finalCta: {
      ...baseCopy.finalCta,
      title: 'Everything ready for your next investment decision.',
      body: 'Receive a full presentation and speak with a specialist.',
      primary: 'Schedule a call',
      secondary: 'View progress',
    },
    contact: {
      ...baseCopy.contact,
      tag: 'CONTACT',
      title: 'Talk to our team',
      body: 'Consultative, fast support to move forward with confidence.',
      location: 'Discovery Coast • Bahia',
      whatsappValue: 'Immediate support',
      form: {
        nameLabel: 'Name',
        emailLabel: 'Email',
        messageLabel: 'Message',
        namePlaceholder: 'Your name',
        emailPlaceholder: 'you@email.com',
        messagePlaceholder: 'How can we help?',
        submit: 'Send message',
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
        'Bella Vista balances desire and predictability. An invitation to live the coast with investment security.',
    },
    floating: {
      ariaLabel: 'Open WhatsApp chat',
    },
    showcase: {
      title: 'Bella Vista Beach Residence Showcase',
      subtitle: 'Explore interiors designed to live and invest well.',
      detailsOpen: 'View details',
      detailsClose: 'Close',
      dialogLabel: 'Card details',
      items: [
        { label: 'STUDIO', title: 'Studio apartment', desc: '27 m²' },
        { label: '2 BEDROOMS', title: '2-bedroom apartment', desc: '45 m²' },
        { label: '3 BEDROOMS', title: '3-bedroom apartment', desc: '82.48 m²' },
        {
          label: 'FULL AMENITIES',
          title: 'Complete amenities',
          desc: 'Infinity edge • Spa and gym • Lounge and trails',
        },
      ],
    },
    map: {
      title: 'Regional map',
    },
    pdf: {
      title: 'Bella Vista Beach Residence',
      subtitle: 'Return simulation (illustrative values)',
      propertyValue: 'Property value',
      dailyRate: 'Average daily rate',
      occupancy: 'Occupancy',
      monthlyCosts: 'Monthly costs',
      platformFee: 'Platform fee',
      grossMonthly: 'Monthly revenue',
      netMonthly: 'Monthly profit',
      annualReturn: 'Annual return',
      payback: 'Payback',
      paybackUnit: 'years',
      notAvailable: '-',
      fileName: 'bella-vista-simulation.pdf',
    },
  },
  it: {
    ...baseCopy,
    nav: {
      location: 'Posizione',
      works: 'Cantiere',
      investment: 'Investimento',
      contact: 'Contatto',
      menu: 'Menu',
      menuAria: 'Apri menu',
      languageLabel: 'Seleziona lingua',
    },
    hero: {
      ...baseCopy.hero,
      eyebrow: 'Costa do Descobrimento · Bahia',
      title: 'Vivi vicino al mare.\nInvesti dove passa il futuro.',
      subtitle:
        'Monolocali e appartamenti in una delle zone più desiderate della Bahia, con alto potenziale di valorizzazione.',
      subtitleDesktop:
        'Monolocali e appartamenti sulla Costa do Descobrimento, con posizione strategica e potenziale di valorizzazione.',
      primaryCta: 'Richiedi una presentazione esclusiva',
      primaryCtaDesktop: 'Richiedi una presentazione esclusiva',
      secondaryCta: 'Vedi posizione',
    },
    location: {
      ...baseCopy.location,
      tag: 'POSIZIONE STRATEGICA',
      title: 'Dove l’accesso diventa domanda.',
      body:
        'Tra la BR-367 e i poli turistici, accesso rapido e liquidità per vivere o generare reddito.',
      benefits: [
        'Accesso via BR-367',
        'Flusso turistico costante',
        'Equilibrio: privacy + movimento',
      ],
    },
    simulator: {
      ...baseCopy.simulator,
      tag: 'INVESTIMENTO',
      title: 'Simula il rendimento con affitti brevi.',
      subtitle:
        'Regola i valori e vedi una stima di ricavi, costi e rendimento annuo. Valori indicativi.',
      bullets: [
        'La domanda stagionale favorisce un’occupazione costante.',
        'Modello flessibile per uso personale o reddito.',
        'Gestione snella con potenziale ricorrente.',
      ],
      presets: {
        conservative: 'Conservativo',
        realistic: 'Realistico',
        high: 'Alta stagione',
      },
      fields: {
        propertyValue: 'Valore dell’immobile (R$)',
        dailyRate: 'Tariffa media (R$)',
        occupancy: 'Occupazione (%)',
        monthlyCosts: 'Costi mensili (R$)',
        platformFee: 'Commissione piattaforma (%)',
      },
      results: {
        revenue: 'Ricavi',
        profit: 'Utile mensile',
        annualReturn: 'Rendimento annuo',
        payback: 'Payback',
      },
      ctaPrimary: 'Ricevi la simulazione su WhatsApp',
      ctaSecondary: 'Scarica il PDF della simulazione',
      disclaimer: 'Stima indicativa. Non sostituisce un’analisi finanziaria.',
      paybackUnit: 'anni',
      notAvailable: '—',
    },
    progress: {
      ...baseCopy.progress,
      tag: 'CANTIERE',
      title: 'I lavori sono in corso.',
      body:
        'Avanzamento continuo con fasi monitorate. Aggiornamenti visivi per seguire ogni progresso.',
      highlights: ['Struttura in avanzamento', 'Team locale operativo', 'Cronoprogramma attivo'],
    },
    finalCta: {
      ...baseCopy.finalCta,
      title: 'Tutto pronto per la tua prossima decisione patrimoniale.',
      body: 'Ricevi una presentazione completa e parla con uno specialista.',
      primary: 'Prenota una chiamata',
      secondary: 'Vedi cantiere',
    },
    contact: {
      ...baseCopy.contact,
      tag: 'CONTATTO',
      title: 'Parla con il nostro team',
      body: 'Assistenza consultiva e rapida per procedere con sicurezza.',
      location: 'Costa do Descobrimento • Bahia',
      whatsappValue: 'Assistenza immediata',
      form: {
        nameLabel: 'Nome',
        emailLabel: 'Email',
        messageLabel: 'Messaggio',
        namePlaceholder: 'Il tuo nome',
        emailPlaceholder: 'tu@email.com',
        messagePlaceholder: 'Come possiamo aiutarti?',
        submit: 'Invia messaggio',
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
      title: 'Alcuni luoghi si capiscono. Altri si sentono.',
      body:
        'Bella Vista equilibra desiderio e prevedibilità. Un invito a vivere la costa con sicurezza patrimoniale.',
    },
    floating: {
      ariaLabel: 'Apri WhatsApp',
    },
    showcase: {
      title: 'Vetrina Bella Vista Beach Residence',
      subtitle: 'Esplora interni pensati per vivere e investire bene.',
      detailsOpen: 'Vedi dettagli',
      detailsClose: 'Chiudi',
      dialogLabel: 'Dettagli del card',
      items: [
        { label: 'STUDIO', title: 'Monolocale', desc: '27 m²' },
        { label: '2 CAMERE', title: 'Appartamento 2 camere', desc: '45 m²' },
        { label: '3 CAMERE', title: 'Appartamento 3 camere', desc: '82,48 m²' },
        {
          label: 'AMENITIES COMPLETE',
          title: 'Servizi completi',
          desc: 'Bordo infinito • Spa e palestra • Lounge e sentieri',
        },
      ],
    },
    map: {
      title: 'Mappa della regione',
    },
    pdf: {
      title: 'Bella Vista Beach Residence',
      subtitle: 'Simulazione di rendimento (valori indicativi)',
      propertyValue: "Valore dell'immobile",
      dailyRate: 'Tariffa media',
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

const whatsappLink =
  'https://wa.me/5573999545185?text=Ol%C3%A1%2C%20gostaria%20de%20mais%20informa%C3%A7%C3%B5es';

const showcaseItems = [
  {
    label: 'STUDIO',
    title: 'Apartamento studio',
    desc: '27 m²',
    details: [
      { icon: BedDouble, label: 'Quartos', value: '1' },
      { icon: CarFront, label: 'Vagas', value: '1' },
      { icon: Ruler, label: 'Área', value: '27 m²' },
      { icon: Bath, label: 'Banheiro', value: '1' },
    ],
    images: [
      'https://i.postimg.cc/mksDjFhJ/Whats-App-Image-2026-01-22-at-12-04-21.jpg',
      'https://i.postimg.cc/GpTm1jyg/Whats-App-Image-2026-01-22-at-12-04-21-(2).jpg',
      'https://i.postimg.cc/mDNRbp2p/Whats-App-Image-2026-01-22-at-12-04-21-(1).jpg',
    ],
  },
  {
    label: '2 QUARTOS',
    title: 'Apartamento 2 quartos',
    desc: '45 m²',
    details: [
      { icon: BedDouble, label: 'Quartos', value: '2' },
      { icon: Bath, label: 'Suítes', value: '2' },
      { icon: CarFront, label: 'Vaga', value: '1' },
      { icon: Ruler, label: 'Área', value: '45 m²' },
    ],
    images: [
      'https://i.postimg.cc/pV5VhCch/Whats-App-Image-2026-01-22-at-12-04-20.jpg',
      'https://i.postimg.cc/vZYdztXF/Whats-App-Image-2026-01-22-at-12-04-20-(1).jpg',
      'https://i.postimg.cc/1zbTLGGj/Whats-App-Image-2026-01-22-at-12-04-20-(2).jpg',
      'https://i.postimg.cc/m2Tqf29C/Design-sem-nome-2026-01-24T013521-711.png',
    ],
  },
  {
    label: '3 QUARTOS',
    title: 'Apartamento 3 quartos',
    desc: '82,48 m²',
    details: [
      { icon: BedDouble, label: 'Quartos', value: '3' },
      { icon: Bath, label: 'Suítes', value: '2' },
      { icon: CarFront, label: 'Vaga', value: '1' },
      { icon: Ruler, label: 'Área', value: '82,48 m²' },
    ],
    images: [
      'https://i.postimg.cc/kX7Z3XSm/Design-sem-nome-2026-01-24T013513-644.png',
      'https://i.postimg.cc/6QBTCZ4p/Design-sem-nome-2026-01-24T013506-098.png',
      'https://i.postimg.cc/gJTJ9BM5/Design-sem-nome-2026-01-24T013459-346.png',
      'https://i.postimg.cc/qq67pXS1/Design-sem-nome-2026-01-24T013356-074.png',
    ],
  },
  {
    label: 'AMBIENTE TOTAL',
    title: 'Ambiente completo',
    desc: 'Borda infinita • SPA e academia • Lounge e trilhas',
    details: [
      {
        icon: Waves,
        label: 'Piscina',
        value: 'Vista para o mar',
      },
      { icon: Sparkles, label: 'Bem-estar', value: 'Ofurôs' },
      {
        icon: Trees,
        label: 'Lazer',
        value: 'Áreas verdes',
      },
      { icon: Shield, label: 'Segurança', value: '24 horas' },
    ],
    images: [
      'https://i.postimg.cc/kX7Z3XSm/Design-sem-nome-2026-01-24T013513-644.png',
      'https://i.postimg.cc/6QBTCZ4p/Design-sem-nome-2026-01-24T013506-098.png',
      'https://i.postimg.cc/gJTJ9BM5/Design-sem-nome-2026-01-24T013459-346.png',
      'https://i.postimg.cc/qq67pXS1/Design-sem-nome-2026-01-24T013356-074.png',
    ],
  },
];

const showcaseDetails: ShowcaseDetail[] = [
  { icon: Ruler, label: 'Área', value: '48 m²' },
  { icon: BedDouble, label: 'Quartos', value: '1' },
  { icon: Bath, label: 'Banheiros', value: '1' },
  { icon: CarFront, label: 'Vagas', value: '1' },
];

const progressImages = [
  'https://i.postimg.cc/bwQR1PBD/20251204-082816-(1).jpg',
  'https://i.postimg.cc/tT7mRvNb/20251204-082550-(1).jpg',
  'https://i.postimg.cc/9fwJvwmZ/20251204-082247-(1).jpg',
  'https://i.postimg.cc/90rCyBPd/20251113-080300.jpg',
];

type PresetKey = 'conservative' | 'realistic' | 'high';

const simulatorPresets: Array<{ key: PresetKey; values: SimulatorValues }> = [
  {
    key: 'conservative',
    values: {
      propertyValue: 260000,
      dailyRate: 220,
      occupancy: 45,
      monthlyCosts: 650,
      platformFee: 12,
    },
  },
  {
    key: 'realistic',
    values: {
      propertyValue: 250000,
      dailyRate: 250,
      occupancy: 55,
      monthlyCosts: 650,
      platformFee: 12,
    },
  },
  {
    key: 'high',
    values: {
      propertyValue: 250000,
      dailyRate: 320,
      occupancy: 70,
      monthlyCosts: 720,
      platformFee: 12,
    },
  },
];

const mapEmbedUrl =
  'https://www.google.com/maps?q=Bella%20Vista%20Beach%20Residence%2C%20BA-001%2C%20Km%20367%2C%20Praia%20do%20Mutari%2C%20Santa%20Cruz%20Cabr%C3%A1lia%20-%20BA&output=embed';



function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { duration: 0.6, ease: 'easeOut', delay }
      }
    >
      {children}
    </motion.div>
  );
}

function LanguageSwitcher({
  locale,
  onLocaleChange,
  ariaLabel,
}: {
  locale: Locale;
  onLocaleChange: (value: Locale) => void;
  ariaLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div ref={containerRef} className='relative z-50'>
      <button
        type='button'
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup='menu'
        aria-expanded={open}
        aria-label={ariaLabel}
        className='inline-flex h-10 items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-white/85 shadow-[0_8px_18px_rgba(5,12,18,0.35)] transition hover:border-[var(--gold)]/60 hover:text-white md:h-9 md:px-2.5'
      >
        <Globe className='h-4 w-4' />
        <span>{locale.toUpperCase()}</span>
      </button>
      {open && (
        <div
          role='menu'
          className='absolute right-0 top-full z-[60] mt-2 flex min-w-[140px] max-w-[calc(100vw-24px)] flex-col items-stretch gap-1 rounded-2xl border border-white/15 bg-[rgba(8,16,24,0.92)] p-1 text-white/85 shadow-[0_12px_30px_rgba(0,0,0,0.35)] backdrop-blur'
        >
          {localeOptions.map((option) => {
            const isActive = locale === option.value;
            return (
              <button
                key={option.value}
                type='button'
                onClick={() => {
                  onLocaleChange(option.value);
                  setOpen(false);
                }}
                aria-pressed={isActive}
                aria-label={`${ariaLabel}: ${option.name}`}
                className={`inline-flex items-center justify-center rounded-full px-3 py-2 text-[0.55rem] font-semibold tracking-[0.28em] transition ${
                  isActive
                    ? 'bg-[var(--gold)]/25 text-white shadow-[0_0_14px_rgba(201,164,106,0.35)]'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
                role='menuitemradio'
              >
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function HeroNav({
  labels,
  locale,
  onLocaleChange,
}: {
  labels: typeof baseCopy.nav;
  locale: Locale;
  onLocaleChange: (value: Locale) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className='fixed inset-x-0 top-0 z-50 bg-[#07131D]/85 backdrop-blur-lg shadow-[0_8px_24px_rgba(5,12,18,0.35)] md:bg-[rgba(8,18,28,0.65)]'>
      <nav className='mx-auto flex max-w-6xl items-center justify-between px-6 py-4 text-white lg:py-6'>
        <img
          src='https://i.postimg.cc/65fCvgVb/Prancheta-1.png'
          alt='Bela Vista'
          className='h-8 w-auto md:h-9 lg:h-10'
          loading='lazy'
        />
        <div className='hidden items-center gap-6 text-xs uppercase tracking-[0.28em] text-white/80 md:flex lg:gap-8 lg:text-white/90'>
          <a
            href='#localizacao'
            className='transition hover:text-[#B7925A] hover:drop-shadow-[0_0_10px_rgba(183,146,90,0.55)]'
          >
            {labels.location}
          </a>
          <a
            href='#obra'
            className='transition hover:text-[#B7925A] hover:drop-shadow-[0_0_10px_rgba(183,146,90,0.55)]'
          >
            {labels.works}
          </a>
          <a
            href='#perfil'
            className='transition hover:text-[#B7925A] hover:drop-shadow-[0_0_10px_rgba(183,146,90,0.55)]'
          >
            {labels.investment}
          </a>
          <a
            href={whatsappLink}
            target='_blank'
            rel='noreferrer'
            className='transition hover:text-[#B7925A] hover:drop-shadow-[0_0_10px_rgba(183,146,90,0.55)]'
          >
            {labels.contact}
          </a>
          <LanguageSwitcher
            locale={locale}
            onLocaleChange={onLocaleChange}
            ariaLabel={labels.languageLabel}
          />
        </div>
        <div className='flex items-center gap-3 md:hidden'>
          <LanguageSwitcher
            locale={locale}
            onLocaleChange={onLocaleChange}
            ariaLabel={labels.languageLabel}
          />
          <button
            type='button'
            aria-label={labels.menuAria}
            aria-expanded={menuOpen}
            aria-controls='hero-menu'
            onClick={() => setMenuOpen((open) => !open)}
            className='inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs uppercase tracking-[0.3em] text-white/80 transition hover:text-white'
          >
            {labels.menu}
          </button>
        </div>
      </nav>
      {menuOpen && (
        <div
          id='hero-menu'
          className='md:hidden border-t border-white/10 bg-white/10 backdrop-blur-lg'
        >
          <div className='flex flex-col gap-4 px-6 py-4 text-xs uppercase tracking-[0.28em] text-white/75'>
            <a
              href='#localizacao'
              className='transition hover:text-[#B7925A] hover:drop-shadow-[0_0_10px_rgba(183,146,90,0.55)]'
              onClick={() => setMenuOpen(false)}
            >
              {labels.location}
            </a>
            <a
              href='#obra'
              className='transition hover:text-[#B7925A] hover:drop-shadow-[0_0_10px_rgba(183,146,90,0.55)]'
              onClick={() => setMenuOpen(false)}
            >
              {labels.works}
            </a>
            <a
              href='#perfil'
              className='transition hover:text-[#B7925A] hover:drop-shadow-[0_0_10px_rgba(183,146,90,0.55)]'
              onClick={() => setMenuOpen(false)}
            >
              {labels.investment}
            </a>
            <a
              href={whatsappLink}
              target='_blank'
              rel='noreferrer'
              className='transition hover:text-[#B7925A] hover:drop-shadow-[0_0_10px_rgba(183,146,90,0.55)]'
              onClick={() => setMenuOpen(false)}
            >
              {labels.contact}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

function StudioShowcaseCard({
  label,
  title,
  desc,
  images,
  details,
  index,
  locale,
  showcaseCopy,
}: {
  label: string;
  title: string;
  desc: string;
  images: string[];
  details?: ShowcaseDetail[];
  index: number;
  locale: Locale;
  showcaseCopy: typeof baseCopy.showcase;
}) {
  const reduceMotion = useReducedMotion();
  const [imageIndex, setImageIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const hasCarousel = images.length > 1;
  const resolvedDetails = details ?? showcaseDetails;
  const localizedDetails = resolvedDetails.map((detail) =>
    localizeDetail(detail, locale)
  );

  useEffect(() => {
    if (!hasCarousel) return undefined;
    const interval = window.setInterval(() => {
      setImageIndex((prev) => (prev + 1) % images.length);
    }, 4200);
    return () => window.clearInterval(interval);
  }, [hasCarousel, images.length]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <>
      <motion.button
        type='button'
        onClick={() => setIsOpen(true)}
        aria-haspopup='dialog'
        aria-expanded={isOpen}
        className='group relative min-w-[85%] snap-center overflow-hidden rounded-[24px] border border-white/10 bg-[var(--panel)] text-left shadow-[0_12px_30px_rgba(0,0,0,0.35)] transition duration-300 hover:shadow-[0_18px_50px_rgba(0,0,0,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/60 md:min-w-0'
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        whileHover={reduceMotion ? undefined : { y: -6 }}
        whileTap={reduceMotion ? undefined : { scale: 0.98 }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { duration: 0.35, delay: index * 0.08 }
        }
      >
        <div className='relative aspect-[16/10] w-full overflow-hidden rounded-[18px] border border-white/10'>
          <AnimatePresence mode='wait'>
            <motion.img
              key={images[imageIndex]}
              src={images[imageIndex]}
              alt={title}
              className='absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]'
              initial={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
              transition={reduceMotion ? { duration: 0 } : { duration: 0.5 }}
              loading='lazy'
            />
          </AnimatePresence>
          <div className='absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/70 via-black/20 to-transparent' />
        </div>
        <div className='space-y-3 p-6'>
          <span className='inline-flex rounded-full border border-[var(--gold)]/35 bg-white/5 px-3 py-1 text-[0.6rem] uppercase tracking-[0.4em] text-[rgba(201,164,106,0.95)]'>
            {label}
          </span>
          <div>
            <h3 className='text-lg font-semibold text-[var(--text)]'>
              {title}
            </h3>
            <p className='mt-1 text-sm text-[var(--muted)]'>{desc}</p>
          </div>
          <div className='text-sm text-[var(--muted)]'>
            {showcaseCopy.detailsOpen} →
          </div>
        </div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className='fixed inset-0 z-[60] flex items-center justify-center p-6'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className='absolute inset-0 bg-black/60 backdrop-blur-sm'
              onClick={() => setIsOpen(false)}
              aria-hidden='true'
            />
            <motion.div
              role='dialog'
              aria-modal='true'
              aria-label={`${showcaseCopy.dialogLabel} ${title}`}
              className='relative z-10 w-full max-w-md rounded-[24px] border border-white/10 bg-[rgba(6,16,24,0.96)] p-6 text-white shadow-[0_24px_60px_rgba(5,12,18,0.55),0_0_40px_rgba(183,146,90,0.12)]'
              initial={{ y: 16, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 12, opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type='button'
                onClick={() => setIsOpen(false)}
                className='absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:text-white'
                aria-label={showcaseCopy.detailsClose}
              >
                <X className='h-4 w-4' />
              </button>
              <span className='inline-flex rounded-full border border-[var(--gold)]/40 bg-white/5 px-3 py-1 text-[0.6rem] uppercase tracking-[0.4em] text-[var(--gold)]'>
                {label}
              </span>
              <h3 className='mt-4 text-xl font-semibold'>{title}</h3>
              <p className='mt-2 text-sm text-white/70'>{desc}</p>
              <div className='mt-5 grid grid-cols-2 gap-3'>
                {localizedDetails.map((detail) => {
                  const Icon = detail.icon;
                  return (
                    <div
                      key={detail.label}
                      className='flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3'
                    >
                      <span className='inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/5 text-[var(--gold)]'>
                        <Icon className='h-4 w-4' />
                      </span>
                      <div>
                        <p className='text-[10px] uppercase tracking-[0.2em] text-white/50'>
                          {detail.label}
                        </p>
                        <p className='text-sm font-semibold text-white'>
                          {detail.value}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </>
  );
}

function InteractiveMap({ title }: { title: string }) {
  return (
    <div className='relative h-[340px] w-full overflow-hidden rounded-[24px] border border-white/10 md:h-[360px]'>
      <iframe
        title={title}
        src={mapEmbedUrl}
        className='h-full w-full border-0'
        loading='lazy'
        referrerPolicy='no-referrer-when-downgrade'
      />
    </div>
  );
}

export default function HomePage() {
  const reduceMotion = useReducedMotion();
  const [locale, setLocale] = useState<Locale>('pt');
  const [heroVideoReady, setHeroVideoReady] = useState(false);
  const [propertyValue, setPropertyValue] = useState(250000);
  const [dailyRate, setDailyRate] = useState(250);
  const [occupancy, setOccupancy] = useState(55);
  const [monthlyCosts, setMonthlyCosts] = useState(650);
  const [platformFee, setPlatformFee] = useState(12);
  const [activePreset, setActivePreset] = useState<PresetKey>('realistic');
  const [progressIndex, setProgressIndex] = useState(0);
  const copy = translations[locale];
  const localizedShowcaseItems = useMemo(
    () =>
      showcaseItems.map((item, index) => ({
        ...item,
        ...copy.showcase.items[index],
      })),
    [copy]
  );

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === 'pt' || saved === 'en' || saved === 'it') {
      setLocale(saved);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, locale);
    document.documentElement.lang = locale === 'pt' ? 'pt-BR' : locale;
  }, [locale]);
  const simulatorResults = useMemo(() => {
    const nightsPerMonth = (30 * occupancy) / 100;
    const grossMonthly = nightsPerMonth * dailyRate;
    const platformFeeAmount = grossMonthly * (platformFee / 100);
    const netMonthly = grossMonthly - platformFeeAmount - monthlyCosts;
    const annualReturn =
      propertyValue > 0 ? (netMonthly * 12 * 100) / propertyValue : 0;
    const paybackYears =
      netMonthly > 0 ? propertyValue / (netMonthly * 12) : null;
    return {
      nightsPerMonth,
      grossMonthly,
      netMonthly,
      annualReturn,
      paybackYears,
    };
  }, [propertyValue, dailyRate, occupancy, monthlyCosts, platformFee]);
  const previousResults = useRef(simulatorResults);
  const [animatedResults, setAnimatedResults] = useState(simulatorResults);
  const handleDownloadPdf = () => {
    const lines = [
      copy.pdf.title,
      copy.pdf.subtitle,
      '',
      `${copy.pdf.propertyValue}: ${formatCurrency(propertyValue)}`,
      `${copy.pdf.dailyRate}: ${formatCurrency(dailyRate)}`,
      `${copy.pdf.occupancy}: ${occupancy}%`,
      `${copy.pdf.monthlyCosts}: ${formatCurrency(monthlyCosts)}`,
      `${copy.pdf.platformFee}: ${platformFee}%`,
      '',
      `${copy.pdf.grossMonthly}: ${formatCurrency(simulatorResults.grossMonthly)}`,
      `${copy.pdf.netMonthly}: ${formatCurrency(simulatorResults.netMonthly)}`,
      `${copy.pdf.annualReturn}: ${simulatorResults.annualReturn.toFixed(1)}%`,
      `${copy.pdf.payback}: ${
        simulatorResults.paybackYears
          ? `${simulatorResults.paybackYears.toFixed(1)} ${copy.pdf.paybackUnit}`
          : copy.pdf.notAvailable
      }`,
    ];
    const pdf = buildPdf(lines);
    const blob = new Blob([pdf], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = copy.pdf.fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (reduceMotion) {
      setAnimatedResults(simulatorResults);
      previousResults.current = simulatorResults;
      return;
    }
    const from = previousResults.current;
    const to = simulatorResults;
    const start = performance.now();
    const duration = 420;
    let frame: number;

    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const lerp = (a: number, b: number) => a + (b - a) * progress;
      setAnimatedResults({
        nightsPerMonth: lerp(from.nightsPerMonth, to.nightsPerMonth),
        grossMonthly: lerp(from.grossMonthly, to.grossMonthly),
        netMonthly: lerp(from.netMonthly, to.netMonthly),
        annualReturn: lerp(from.annualReturn, to.annualReturn),
        paybackYears:
          to.paybackYears === null
            ? null
            : lerp(from.paybackYears ?? 0, to.paybackYears),
      });
      if (progress < 1) {
        frame = window.requestAnimationFrame(animate);
      } else {
        previousResults.current = to;
      }
    };

    frame = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(frame);
  }, [reduceMotion, simulatorResults]);

  useEffect(() => {
    if (reduceMotion || progressImages.length < 2) return;
    const interval = window.setInterval(() => {
      setProgressIndex((prev) => (prev + 1) % progressImages.length);
    }, 4200);
    return () => window.clearInterval(interval);
  }, [reduceMotion]);


  return (
    <MotionConfig reducedMotion='user'>
      <div className='bg-[var(--bg-0)] text-[var(--text)]'>
        <HeroNav labels={copy.nav} locale={locale} onLocaleChange={setLocale} />
        <main>
          <section
            id='inicio'
            className='grain grain-soft relative flex min-h-[100svh] items-start overflow-hidden bg-[#07131D] pt-24 md:min-h-screen md:items-center md:pt-20'
          >
            <div className='absolute inset-0' aria-hidden='true'>
              <img
                src={heroPoster}
                alt=''
                className={`absolute inset-0 h-full w-full object-cover hero-media transition-opacity duration-1000 ${
                  heroVideoReady ? 'opacity-0' : 'opacity-100'
                }`}
                loading='lazy'
              />
              <video
                className={`absolute inset-0 h-full w-full object-cover hero-media transition-opacity duration-1000 ${
                  heroVideoReady ? 'opacity-100' : 'opacity-0'
                }`}
                autoPlay
                loop
                muted
                playsInline
                preload='metadata'
                poster={heroPoster}
                onLoadedData={() => setHeroVideoReady(true)}
                onCanPlay={() => setHeroVideoReady(true)}
              >
                <source
                  src='https://res.cloudinary.com/dwedcl97k/video/upload/f_auto,q_auto:best,w_1280/v1769199580/Design_sem_nome_-_2026-01-23T171932.339_fjulxo.mp4'
                  type='video/mp4'
                  media='(max-width: 768px)'
                />
                <source
                  src='https://res.cloudinary.com/dwedcl97k/video/upload/f_auto,q_auto:best,w_1920/v1769199580/Design_sem_nome_-_2026-01-23T171932.339_fjulxo.mp4'
                  type='video/mp4'
                  media='(min-width: 769px)'
                />
              </video>
            </div>
            <div className='absolute inset-0 bg-gradient-to-b from-black/18 via-[#061825]/16 to-transparent lg:from-black/12 lg:via-[#061825]/10' />
            <div className='absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(198,155,78,0.035),transparent_55%)] lg:opacity-28' />
            <div className='absolute inset-0 bg-[linear-gradient(120deg,rgba(6,24,37,0.14),rgba(246,241,234,0.03)_45%,rgba(183,146,90,0.05)_100%)] lg:opacity-24' />
            <div className='absolute inset-0 hidden lg:block lg:bg-[linear-gradient(90deg,rgba(5,14,22,0.2)_0%,rgba(5,14,22,0.06)_55%,rgba(5,14,22,0.02)_100%)]' />
            <div className='absolute inset-0 vignette' />
            <div className='relative z-10 mx-auto w-full max-w-6xl px-6 pb-28 pt-24 text-white md:pb-36'>
              <div className='grid gap-12 lg:min-h-[70vh] lg:flex lg:items-center lg:justify-center'>
                <div className='order-1 text-center lg:text-center'>
                  <div className='inline-block w-full max-w-[640px] rounded-[28px] border border-white/10 bg-black/10 p-6 backdrop-blur-sm md:p-7 lg:mx-auto lg:w-[min(92vw,920px)] lg:max-w-[920px] lg:rounded-[28px] lg:border-white/10 lg:bg-[rgba(10,20,30,0.45)] lg:p-14 lg:backdrop-blur-[18px] lg:shadow-[0_28px_70px_rgba(4,10,16,0.45),0_0_30px_rgba(183,146,90,0.08)]'>
                    <Reveal>
                      <p className='text-center text-[0.6rem] uppercase tracking-[0.5em] text-white/60 lg:mx-auto lg:max-w-[720px] lg:text-center lg:tracking-[0.6em] lg:text-white/55'>
                        {copy.hero.eyebrow}
                      </p>
                    </Reveal>
                    <Reveal delay={0.1}>
                      <h1 className='hero-title-glow mt-4 text-balance text-4xl font-medium leading-[1.2] tracking-[-0.02em] md:text-5xl lg:mx-auto lg:max-w-[600px] lg:text-[clamp(40px,4.4vw,68px)] lg:leading-[1.05] lg:tracking-[-0.03em] lg:font-semibold'>
                        {copy.hero.title.split('\n').map((line) => (
                          <span key={line} className='block'>
                            {line}
                          </span>
                        ))}
                      </h1>
                    </Reveal>
                    <Reveal delay={0.2}>
                      <p className='mt-6 max-w-[620px] text-sm text-white/80 md:text-base lg:hidden'>
                        {copy.hero.subtitle}
                      </p>
                      <p className='mt-8 hidden max-w-[520px] text-[18px] text-white/85 lg:mx-auto lg:block lg:leading-[1.6]'>
                        {copy.hero.subtitleDesktop}
                      </p>
                    </Reveal>
                    <Reveal delay={0.3} className='mt-10 flex justify-center lg:mt-10 lg:justify-center'>
                      <a
                        href={whatsappLink}
                        target='_blank'
                        rel='noreferrer'
                        className='hero-cta-glow inline-flex w-full items-center justify-center rounded-full border border-white/12 bg-[#0B2A3A] px-7 py-3 text-sm font-semibold text-white shadow-[0_14px_34px_rgba(10,46,70,0.22)] transition duration-500 hover:-translate-y-0.5 hover:shadow-[0_0_18px_rgba(183,146,90,0.45)] lg:w-auto lg:bg-gradient-to-r lg:from-[#0B2A3A] lg:to-[#0A2231] lg:px-9 lg:py-4'
                      >
                        <span className='lg:hidden'>{copy.hero.primaryCta}</span>
                        <span className='hidden lg:inline'>{copy.hero.primaryCtaDesktop}</span>
                      </a>
                    </Reveal>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section
            id='contexto'
            className='section-shell section-glow scroll-mt-24 bg-[var(--bg-0)]'
          >
            <div className='section-inner'>
              <div className='flex flex-col gap-3'>
                <p className='text-xs uppercase tracking-[0.32em] text-[var(--muted)]'>
                  {copy.showcase.title}
                </p>
                <h3 className='section-title font-semibold text-[var(--text)]'>
                  {copy.showcase.subtitle}
                </h3>
              </div>
              <div className='mt-6 flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory md:grid md:grid-cols-2 md:gap-6 md:overflow-visible md:snap-none lg:grid-cols-3'>
                {localizedShowcaseItems.map((item, index) => (
                  <StudioShowcaseCard
                    key={`${item.label}-${index}`}
                    {...item}
                    index={index}
                    locale={locale}
                    showcaseCopy={copy.showcase}
                  />
                ))}
              </div>
            </div>
          </section>

          <section
            id='localizacao'
            className='section-shell section-alt section-glow section-divider scroll-mt-24'
          >
            <div className='section-inner'>
              <div className='grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:gap-10 lg:items-start'>
                <motion.div
                  className='order-1 space-y-5 text-center lg:text-left'
                  initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={reduceMotion ? { duration: 0 } : { duration: 0.25 }}
                >
                  <p className='text-xs uppercase tracking-[0.32em] text-[var(--muted)]'>
                    {copy.location.tag}
                  </p>
                  <h2 className='section-title font-semibold text-[var(--text)]'>
                    {copy.location.title}
                  </h2>
                  <p className='text-base text-[var(--muted)] md:text-lg lg:max-w-[42ch]'>
                    {copy.location.body}
                  </p>
                </motion.div>
                <motion.div
                  className='order-2 glass-map relative p-5 md:p-6 lg:row-span-2'
                  initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={reduceMotion ? { duration: 0 } : { duration: 0.35 }}
                >
                  <InteractiveMap title={copy.map.title} />
                </motion.div>
                <motion.div
                  className='order-3 flex flex-wrap justify-center gap-3 text-sm text-white/80 lg:col-start-1 lg:justify-start'
                  initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={reduceMotion ? { duration: 0 } : { duration: 0.25 }}
                >
                  {copy.location.benefits.map((item) => (
                    <span
                      key={item}
                      className='rounded-full border border-white/10 bg-[var(--panel)] px-4 py-2'
                    >
                      {item}
                    </span>
                  ))}
                </motion.div>
              </div>
            </div>
          </section>

          <section
            id='proposta'
            className='section-shell section-base section-glow section-divider scroll-mt-24'
          >
            <div className='section-inner'>
              <div className='grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start'>
                <div className='space-y-6 text-center lg:text-left'>
                  <p className='text-xs uppercase tracking-[0.32em] text-[var(--muted)]'>
                    {copy.simulator.tag}
                  </p>
                  <h2 className='section-title font-semibold text-[var(--text)]'>
                    {copy.simulator.title}
                  </h2>
                  <p className='text-base text-[var(--muted)] md:text-lg lg:max-w-[42ch]'>
                    {copy.simulator.subtitle}
                  </p>
                  <ul className='space-y-3 text-sm text-white/70'>
                    {copy.simulator.bullets.map((item) => (
                      <li
                        key={item}
                        className='flex items-center justify-center gap-3 text-left lg:justify-start'
                      >
                        <span className='h-1.5 w-1.5 rounded-full bg-[var(--gold)]' />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className='flex gap-2 overflow-x-auto pb-1 lg:flex-wrap lg:justify-start lg:overflow-visible'>
                    {simulatorPresets.map((preset) => (
                      <button
                        key={preset.key}
                        type='button'
                        onClick={() => {
                          setPropertyValue(preset.values.propertyValue);
                          setDailyRate(preset.values.dailyRate);
                          setOccupancy(preset.values.occupancy);
                          setMonthlyCosts(preset.values.monthlyCosts);
                          setPlatformFee(preset.values.platformFee);
                          setActivePreset(preset.key);
                        }}
                        className={`flex-shrink-0 rounded-full border px-3 py-2 text-[10px] uppercase tracking-[0.2em] transition ${
                          activePreset === preset.key
                            ? 'border-[var(--gold)]/60 bg-[var(--panel-strong)] text-white'
                            : 'border-white/15 bg-white/5 text-white/70 hover:border-[var(--gold)]/40'
                        }`}
                      >
                        {copy.simulator.presets[preset.key]}
                      </button>
                    ))}
                  </div>
                </div>
                <motion.div
                  className='glass-panel bg-[linear-gradient(180deg,rgba(10,18,24,0.7),rgba(6,12,18,0.95))] p-6 md:p-8'
                  initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={reduceMotion ? { duration: 0 } : { duration: 0.6 }}
                >
                  <div className='space-y-5 text-white'>
                    <div className='grid gap-4 sm:grid-cols-2'>
                      <label className='space-y-2 text-[11px] text-white/60'>
                        <span>{copy.simulator.fields.propertyValue}</span>
                        <input
                          type='number'
                          value={propertyValue}
                          onChange={(event) =>
                            setPropertyValue(Number(event.target.value))
                          }
                          className='w-full rounded-xl border border-white/12 bg-[var(--panel)] px-3 py-2.5 text-[12px] text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/40'
                        />
                      </label>
                      <label className='space-y-2 text-[11px] text-white/60'>
                        <span>{copy.simulator.fields.dailyRate}</span>
                        <input
                          type='number'
                          value={dailyRate}
                          onChange={(event) =>
                            setDailyRate(Number(event.target.value))
                          }
                          className='w-full rounded-xl border border-white/12 bg-[var(--panel)] px-3 py-2.5 text-[12px] text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/40'
                        />
                      </label>
                      <label className='space-y-2 text-[11px] text-white/60 sm:col-span-2'>
                        <div className='flex items-end justify-between'>
                          <span>{copy.simulator.fields.occupancy}</span>
                          <span className='text-base font-semibold text-white'>
                            {occupancy}%
                          </span>
                        </div>
                        <input
                          type='range'
                          min={10}
                          max={90}
                          value={occupancy}
                          onChange={(event) =>
                            setOccupancy(Number(event.target.value))
                          }
                          className='h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-[#C9A46A] transition'
                        />
                      </label>
                      <label className='space-y-2 text-[11px] text-white/60'>
                        <span>{copy.simulator.fields.monthlyCosts}</span>
                        <input
                          type='number'
                          value={monthlyCosts}
                          onChange={(event) =>
                            setMonthlyCosts(Number(event.target.value))
                          }
                          className='w-full rounded-xl border border-white/12 bg-[var(--panel)] px-3 py-2.5 text-[12px] text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/40'
                        />
                      </label>
                      <label className='space-y-2 text-[11px] text-white/60'>
                        <span>{copy.simulator.fields.platformFee}</span>
                        <input
                          type='number'
                          value={platformFee}
                          onChange={(event) =>
                            setPlatformFee(Number(event.target.value))
                          }
                          className='w-full rounded-xl border border-white/12 bg-[var(--panel)] px-3 py-2.5 text-[12px] text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/40'
                        />
                      </label>
                    </div>
                    <div className='grid grid-cols-2 gap-3'>
                      <div className='panel-strong flex items-center gap-3 px-3 py-2.5 text-white/80'>
                        <span className='inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-[var(--gold)]'>
                          <Coins className='h-4 w-4' />
                        </span>
                        <div>
                          <p className='text-[9px] uppercase tracking-[0.2em] text-white/50'>
                            {copy.simulator.results.revenue}
                          </p>
                          <p className='mt-1 text-base font-semibold text-white'>
                            {formatCurrency(animatedResults.grossMonthly)}
                          </p>
                        </div>
                      </div>
                      <div className='panel-strong flex items-center gap-3 px-3 py-2.5 text-white/80'>
                        <span className='inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-[var(--gold)]'>
                          <Wallet className='h-4 w-4' />
                        </span>
                        <div>
                          <p className='text-[9px] uppercase tracking-[0.2em] text-white/50'>
                            {copy.simulator.results.profit}
                          </p>
                          <p className='mt-1 text-base font-semibold text-white'>
                            {formatCurrency(animatedResults.netMonthly)}
                          </p>
                        </div>
                      </div>
                      <div className='panel-strong flex items-center gap-3 px-3 py-2.5 text-white/80'>
                        <span className='inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-[var(--gold)]'>
                          <TrendingUp className='h-4 w-4' />
                        </span>
                        <div>
                          <p className='text-[9px] uppercase tracking-[0.2em] text-white/50'>
                            {copy.simulator.results.annualReturn}
                          </p>
                          <p className='mt-1 text-base font-semibold text-white'>
                            {animatedResults.annualReturn.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                      <div className='panel-strong flex items-center gap-3 px-3 py-2.5 text-white/80'>
                        <span className='inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-[var(--gold)]'>
                          <Clock className='h-4 w-4' />
                        </span>
                        <div>
                          <p className='text-[9px] uppercase tracking-[0.2em] text-white/50'>
                            {copy.simulator.results.payback}
                          </p>
                          <p className='mt-1 text-base font-semibold text-white'>
                            {animatedResults.paybackYears
                              ? `${animatedResults.paybackYears.toFixed(1)} ${copy.simulator.paybackUnit}`
                              : copy.simulator.notAvailable}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
                      <a
                        href={whatsappLink}
                        target='_blank'
                        rel='noreferrer'
                        className='inline-flex flex-1 items-center justify-center rounded-full bg-[var(--gold)] px-6 py-3 text-xs font-semibold text-[#0c1116] shadow-[0_12px_30px_rgba(201,164,106,0.25)] transition hover:brightness-110'
                      >
                        {copy.simulator.ctaPrimary}
                      </a>
                      <button
                        type='button'
                        onClick={handleDownloadPdf}
                        className='text-center text-xs text-white/60 underline-offset-4 transition hover:text-white hover:underline'
                      >
                        {copy.simulator.ctaSecondary}
                      </button>
                    </div>
                    <p className='text-[11px] text-white/50'>
                      {copy.simulator.disclaimer}
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          <section
            id='obra'
            className='section-shell section-alt section-glow section-divider scroll-mt-24'
          >
            <div className='section-inner'>
              <div className='grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center'>
                <motion.div
                  className='space-y-5 text-center lg:text-left'
                  initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={reduceMotion ? { duration: 0 } : { duration: 0.35 }}
                >
                  <p className='text-xs uppercase tracking-[0.32em] text-[var(--muted)]'>
                    {copy.progress.tag}
                  </p>
                  <h2 className='section-title font-semibold text-[var(--text)]'>
                    {copy.progress.title}
                  </h2>
                  <p className='text-base text-[var(--muted)] md:text-lg lg:max-w-[42ch]'>
                    {copy.progress.body}
                  </p>
                  <div className='flex flex-wrap justify-center gap-3 text-xs text-white/70 lg:justify-start'>
                    {copy.progress.highlights.map((item) => (
                      <span
                        key={item}
                        className='rounded-full border border-white/10 bg-[var(--panel)] px-4 py-2'
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </motion.div>
                <motion.div
                  className='glass-panel p-4 md:p-5'
                  initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={reduceMotion ? { duration: 0 } : { duration: 0.4 }}
                >
                  <div className='relative aspect-[16/10] overflow-hidden rounded-2xl'>
                    <AnimatePresence mode='wait'>
                      <motion.img
                        key={progressImages[progressIndex]}
                        src={progressImages[progressIndex]}
                        alt='Andamento da obra'
                        className='absolute inset-0 h-full w-full object-cover'
                        initial={reduceMotion ? { opacity: 1 } : { opacity: 0, scale: 1.02 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
                        transition={reduceMotion ? { duration: 0 } : { duration: 0.6 }}
                        loading='lazy'
                      />
                    </AnimatePresence>
                  </div>
                  <div className='mt-4 flex items-center justify-center gap-2'>
                    {progressImages.map((_, index) => (
                      <button
                        key={index}
                        type='button'
                        onClick={() => setProgressIndex(index)}
                        className={`h-2 w-2 rounded-full transition ${
                          index === progressIndex
                            ? 'bg-[var(--gold)]'
                            : 'bg-white/20 hover:bg-white/40'
                        }`}
                        aria-label={`Imagem ${index + 1}`}
                      />
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          <section
            id='experiencia'
            className='section-shell section-base section-glow section-divider scroll-mt-24'
          >
            <div className='section-inner'>
              <div className='flex flex-col items-center gap-6 text-center'>
                <h2 className='section-title font-semibold text-[var(--text)]'>
                  {copy.finalCta.title}
                </h2>
                <p className='max-w-xl text-base text-[var(--muted)] md:text-lg'>
                  {copy.finalCta.body}
                </p>
                <div className='flex flex-col gap-3 sm:flex-row'>
                  <a
                    href={whatsappLink}
                    target='_blank'
                    rel='noreferrer'
                    className='inline-flex items-center justify-center rounded-full bg-[var(--gold)] px-6 py-3 text-sm font-semibold text-[#0c1116] transition hover:brightness-110'
                  >
                    {copy.finalCta.primary}
                  </a>
                  <a
                    href='#obra'
                    className='inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white/80 transition hover:border-[var(--gold)]/40 hover:text-white'
                  >
                    {copy.finalCta.secondary}
                  </a>
                </div>
              </div>
            </div>
          </section>

          <section
            id='contato'
            className='section-shell section-alt section-glow section-divider scroll-mt-24'
          >
            <div className='section-inner'>
              <div className='grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start'>
                <div className='space-y-5 text-center lg:text-left'>
                  <p className='text-xs uppercase tracking-[0.32em] text-[var(--muted)]'>
                    {copy.contact.tag}
                  </p>
                  <h2 className='section-title font-semibold text-[var(--text)]'>
                    {copy.contact.title}
                  </h2>
                  <p className='text-base text-[var(--muted)] md:text-lg'>
                    {copy.contact.body}
                  </p>
                  <form
                    className='glass-panel mt-6 space-y-4 p-6 md:p-8'
                    action='https://formspree.io/f/maqojlbv'
                    method='POST'
                  >
                    <div className='grid gap-4 sm:grid-cols-2'>
                      <label className='space-y-2 text-sm text-white/70'>
                        <span>{copy.contact.form.nameLabel}</span>
                        <input
                          type='text'
                          name='name'
                          placeholder={copy.contact.form.namePlaceholder}
                          required
                          className='w-full rounded-xl border border-white/12 bg-[var(--panel)] px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/40'
                        />
                      </label>
                      <label className='space-y-2 text-sm text-white/70'>
                        <span>{copy.contact.form.emailLabel}</span>
                        <input
                          type='email'
                          name='email'
                          placeholder={copy.contact.form.emailPlaceholder}
                          required
                          className='w-full rounded-xl border border-white/12 bg-[var(--panel)] px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/40'
                        />
                      </label>
                    </div>
                    <label className='space-y-2 text-sm text-white/70'>
                      <span>{copy.contact.form.messageLabel}</span>
                      <textarea
                        rows={4}
                        name='message'
                        placeholder={copy.contact.form.messagePlaceholder}
                        required
                        className='w-full resize-none rounded-xl border border-white/12 bg-[var(--panel)] px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/40'
                      />
                    </label>
                    <button
                      type='submit'
                      className='inline-flex w-full items-center justify-center rounded-full bg-[var(--gold)] px-6 py-3 text-sm font-semibold text-[#0c1116] transition hover:brightness-110'
                    >
                      {copy.contact.form.submit}
                    </button>
                  </form>
                </div>
                <div className='space-y-4'>
                  <div className='panel-strong flex items-start gap-3 px-5 py-4 text-white/80'>
                    <span className='inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-[var(--gold)]'>
                      <PhoneCall className='h-5 w-5' />
                    </span>
                    <div>
                      <p className='text-xs uppercase tracking-[0.2em] text-white/50'>
                        {copy.contact.cards.whatsapp}
                      </p>
                      <a
                        href={whatsappLink}
                        target='_blank'
                        rel='noreferrer'
                        className='mt-1 block text-sm font-semibold text-white'
                      >
                        {copy.contact.whatsappValue}
                      </a>
                    </div>
                  </div>
                  <div className='panel-strong flex items-start gap-3 px-5 py-4 text-white/80'>
                    <span className='inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-[var(--gold)]'>
                      <Mail className='h-5 w-5' />
                    </span>
                    <div>
                      <p className='text-xs uppercase tracking-[0.2em] text-white/50'>
                        {copy.contact.cards.email}
                      </p>
                      <a
                        href={`mailto:${copy.contact.email}`}
                        className='mt-1 block text-sm font-semibold text-white'
                      >
                        {copy.contact.email}
                      </a>
                    </div>
                  </div>
                  <div className='panel-strong flex items-start gap-3 px-5 py-4 text-white/80'>
                    <span className='inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-[var(--gold)]'>
                      <MapPin className='h-5 w-5' />
                    </span>
                    <div>
                      <p className='text-xs uppercase tracking-[0.2em] text-white/50'>
                        {copy.contact.cards.location}
                      </p>
                      <p className='mt-1 text-sm font-semibold text-white'>
                        {copy.contact.location}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

        </main>
      </div>
    </MotionConfig>
  );
}
