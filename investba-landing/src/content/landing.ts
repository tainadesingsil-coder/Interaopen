export type LocaleKey = "pt" | "en" | "es";

export type LotStatus = "available" | "reserved" | "sold";

export interface LotDetail {
  id: string;
  status: LotStatus;
  price: string;
  size: string;
  conditions: string;
}

export interface ROIHighlight {
  label: string;
  value: string;
  description: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface LeadFormField {
  name: string;
  label: string;
  type: "text" | "email" | "tel" | "select";
  placeholder?: string;
  options?: { label: string; value: string }[];
}

export interface LandingCopy {
  locale: LocaleKey;
  hero: {
    eyebrow: string;
    headline: string;
    subheadline: string;
    primaryCta: string;
    secondaryCta: string;
    microSeals: string[];
    pdfLabel: string;
  };
  trustBadges: {
    title: string;
    badges: { label: string; description: string }[];
  };
  benefits: {
    title: string;
    items: { title: string; description: string }[];
  };
  availability: {
    title: string;
    description: string;
    filterLabels: Record<LotStatus, string>;
    legend: Record<LotStatus, string>;
    modal: {
      title: string;
      callToAction: string;
    };
    empty: string;
  };
  roiHighlights: {
    title: string;
    disclaimer: string;
    items: ROIHighlight[];
  };
  faq: {
    title: string;
    items: FAQItem[];
  };
  leadForm: {
    title: string;
    description: string;
    submitLabel: string;
    scheduleLabel: string;
    scheduleNote: string;
    confirmationLabel: string;
    lgpd: string;
    errors: {
      required: string;
      email: string;
    };
    successMessage: string;
    calendar: {
      title: string;
      subtitle: string;
      timeSlots: string[];
      confirmLabel: string;
    };
    fields: LeadFormField[];
  };
  footer: {
    address: string;
    contacts: { label: string; value: string; href: string }[];
    social: { label: string; href: string }[];
    legal: { label: string; href: string }[];
    disclaimer: string;
  };
}

export const localeConfig = {
  pt: { label: "PT", path: "/", lang: "pt-BR" },
  en: { label: "EN", path: "/en", lang: "en-US" },
  es: { label: "ES", path: "/es", lang: "es-ES" },
} as const satisfies Record<LocaleKey, { label: string; path: string; lang: string }>;

export const lots: LotDetail[] = [
  {
    id: "A1",
    status: "available",
    price: "R$ 420 mil",
    size: "512 m?",
    conditions: "Entrada flex?vel + 36x sem juros",
  },
  {
    id: "A2",
    status: "reserved",
    price: "R$ 415 mil",
    size: "505 m?",
    conditions: "Reserva confirmada ? proposta em an?lise",
  },
  {
    id: "A3",
    status: "sold",
    price: "R$ 398 mil",
    size: "498 m?",
    conditions: "Contrato assinado em agosto/24",
  },
  {
    id: "B1",
    status: "available",
    price: "R$ 435 mil",
    size: "540 m?",
    conditions: "Estudo de personaliza??o incluso",
  },
  {
    id: "B2",
    status: "available",
    price: "R$ 448 mil",
    size: "560 m?",
    conditions: "Financiamento banc?rio at? 120x",
  },
  {
    id: "B3",
    status: "reserved",
    price: "R$ 452 mil",
    size: "560 m?",
    conditions: "Reserva priorit?ria para corban parceiro",
  },
  {
    id: "B4",
    status: "sold",
    price: "R$ 470 mil",
    size: "600 m?",
    conditions: "Entregue com infraestrutura completa",
  },
  {
    id: "C1",
    status: "available",
    price: "R$ 465 mil",
    size: "620 m?",
    conditions: "Pagamento h?brido (boleto + PIX)",
  },
  {
    id: "C2",
    status: "sold",
    price: "R$ 480 mil",
    size: "640 m?",
    conditions: "Valoriza??o de 18% em 12 meses",
  },
  {
    id: "C3",
    status: "available",
    price: "R$ 458 mil",
    size: "615 m?",
    conditions: "Pronto para constru??o imediata",
  },
  {
    id: "C4",
    status: "reserved",
    price: "R$ 452 mil",
    size: "608 m?",
    conditions: "Reserva com sinal de 5%",
  },
  {
    id: "C5",
    status: "available",
    price: "R$ 440 mil",
    size: "590 m?",
    conditions: "Estudo arquitet?nico incluso",
  },
];

const baseROIHighlights: ROIHighlight[] = [
  {
    label: "ROI estimado",
    value: "22% em 24 meses",
    description: "Proje??o considerando valoriza??o m?dia da regi?o metropolitana de Salvador.",
  },
  {
    label: "Cap rate",
    value: "9,4% a.a.",
    description: "Potencial de renda com loca??o corporativa e explora??o comercial no masterplan.",
  },
  {
    label: "Compar?veis",
    value: "+18%",
    description: "Valoriza??o m?dia de empreendimentos semelhantes em 12 meses.",
  },
];

const baseFaq: FAQItem[] = [
  {
    question: "Como a InvestBA garante seguran?a jur?dica dos empreendimentos?",
    answer:
      "Todos os projetos possuem matr?cula individual, registro em cart?rio e auditoria contratual independente atualizada a cada trimestre.",
  },
  {
    question: "Quais s?o os prazos m?dios de entrega de infraestrutura?",
    answer:
      "As fases em andamento possuem cronograma validado com fiscaliza??o externa e entregas parcelares a cada 90 dias.",
  },
  {
    question: "Existem condi??es de financiamento?",
    answer:
      "Oferecemos financiamento pr?prio e conveniado com bancos parceiros, al?m de estudos personalizados conforme o perfil do investidor.",
  },
  {
    question: "Posso agendar uma visita t?cnica?",
    answer:
      "Sim, nossa equipe operacional agenda visitas presenciais e virtuais com especialistas e acompanhamento jur?dico se necess?rio.",
  },
  {
    question: "Quais documentos s?o necess?rios para avan?ar?",
    answer:
      "Documento oficial com foto, comprovante de endere?o e informa??es societ?rias quando aplic?vel. Fornecemos checklist completo ap?s o primeiro contato.",
  },
  {
    question: "Qual ? a pol?tica de atendimento do time InvestBA?",
    answer:
      "Temos SLA de resposta em at? 2h ?teis, com follow-up estruturado via CRM e comunica??o multicanal.",
  },
];

const leadFormFieldsPt: LeadFormField[] = [
  {
    name: "fullName",
    label: "Nome completo",
    type: "text",
    placeholder: "Como prefere ser chamado(a)?",
  },
  {
    name: "email",
    label: "E-mail",
    type: "email",
    placeholder: "seuemail@empresa.com",
  },
  {
    name: "phone",
    label: "Telefone",
    type: "tel",
    placeholder: "+55 11 99999-0000",
  },
  {
    name: "interest",
    label: "Interesse",
    type: "select",
    options: [
      { label: "Sou investidor(a)", value: "investor" },
      { label: "Quero lotes residenciais", value: "lot" },
      { label: "Tenho opera??o comercial", value: "commercial" },
    ],
  },
  {
    name: "supportLanguage",
    label: "Pa?s/idioma de atendimento",
    type: "select",
    options: [
      { label: "Brasil / Portugu?s", value: "pt-BR" },
      { label: "Estados Unidos / English", value: "en-US" },
      { label: "LatAm / Espa?ol", value: "es-ES" },
    ],
  },
];

const leadFormFieldsEn: LeadFormField[] = [
  {
    name: "fullName",
    label: "Full name",
    type: "text",
    placeholder: "How should we address you?",
  },
  {
    name: "email",
    label: "Email",
    type: "email",
    placeholder: "you@company.com",
  },
  {
    name: "phone",
    label: "Phone",
    type: "tel",
    placeholder: "+1 305 555-0199",
  },
  {
    name: "interest",
    label: "Interest",
    type: "select",
    options: [
      { label: "Investor", value: "investor" },
      { label: "Residential lot", value: "lot" },
      { label: "Commercial operation", value: "commercial" },
    ],
  },
  {
    name: "supportLanguage",
    label: "Preferred country/language",
    type: "select",
    options: [
      { label: "Brazil / Portuguese", value: "pt-BR" },
      { label: "United States / English", value: "en-US" },
      { label: "Latin America / Spanish", value: "es-ES" },
    ],
  },
];

const leadFormFieldsEs: LeadFormField[] = [
  {
    name: "fullName",
    label: "Nombre completo",
    type: "text",
    placeholder: "?C?mo te gustar?a que te llamemos?",
  },
  {
    name: "email",
    label: "Correo electr?nico",
    type: "email",
    placeholder: "tucorreo@empresa.com",
  },
  {
    name: "phone",
    label: "Tel?fono",
    type: "tel",
    placeholder: "+34 611 000 123",
  },
  {
    name: "interest",
    label: "Inter?s",
    type: "select",
    options: [
      { label: "Inversionista", value: "investor" },
      { label: "Lote residencial", value: "lot" },
      { label: "Operaci?n comercial", value: "commercial" },
    ],
  },
  {
    name: "supportLanguage",
    label: "Pa?s/idioma de atenci?n",
    type: "select",
    options: [
      { label: "Brasil / Portugu?s", value: "pt-BR" },
      { label: "Estados Unidos / Ingl?s", value: "en-US" },
      { label: "LatAm / Espa?ol", value: "es-ES" },
    ],
  },
];

export const landingCopy: Record<LocaleKey, LandingCopy> = {
  pt: {
    locale: "pt",
    hero: {
      eyebrow: "Investimentos territoriais Inteligentes",
      headline: "InvestBA ? Onde vis?o encontra oportunidade",
      subheadline:
        "Empreendimentos com seguran?a jur?dica, infraestrutura em evolu??o e potencial de valoriza??o.",
      primaryCta: "Baixar estudo de rentabilidade (PDF)",
      secondaryCta: "Ver pre?o e disponibilidade",
      microSeals: [
        "Registro em cart?rio",
        "Infraestrutura entregue",
        "Governan?a e transpar?ncia",
      ],
      pdfLabel: "Estudo de rentabilidade InvestBA",
    },
    trustBadges: {
      title: "Certifica??es e conformidade",
      badges: [
        { label: "ISO 9001", description: "Gest?o de qualidade corporativa" },
        { label: "Selo LGPD", description: "Dados tratados com conformidade" },
        { label: "Parceiro Secovi", description: "Boas pr?ticas imobili?rias" },
        { label: "Auditoria independente", description: "Relat?rios atualizados trimestralmente" },
      ],
    },
    benefits: {
      title: "Por que InvestBA?",
      items: [
        {
          title: "Localiza??es estrat?gicas",
          description:
            "Projetos em eixos de crescimento, com masterplan conectado a polos log?sticos e tur?sticos.",
        },
        {
          title: "Condi??es comerciais claras",
          description:
            "Governan?a comercial com simula??es transparentes, suporte consultivo e CRM dedicado.",
        },
        {
          title: "Dados compar?veis",
          description:
            "Estudos propriet?rios com benchmarks de ROI, cap rate e valoriza??o comprovada.",
        },
      ],
    },
    availability: {
      title: "Pre?o e disponibilidade em tempo real",
      description:
        "Explore o mapa de lotes. Atualizamos reservas e vendas em tempo real para garantir transpar?ncia na tomada de decis?o.",
      filterLabels: {
        available: "Dispon?vel",
        reserved: "Reservado",
        sold: "Vendido",
      },
      legend: {
        available: "Dispon?vel",
        reserved: "Reservado",
        sold: "Vendido",
      },
      modal: {
        title: "Detalhes do lote",
        callToAction: "Solicitar proposta",
      },
      empty: "Nenhum lote com esse status agora. Entre em contato para lista de espera.",
    },
    roiHighlights: {
      title: "Indicadores de desempenho",
      disclaimer: "Dados ilustrativos ? estudo completo dispon?vel mediante solicita??o.",
      items: baseROIHighlights,
    },
    faq: {
      title: "Perguntas frequentes",
      items: baseFaq,
    },
    leadForm: {
      title: "Pronto para acelerar seu portf?lio?",
      description:
        "Compartilhe seus dados e receba acesso priorit?rio ao estudo completo, fluxos financeiros e agenda consultiva.",
      submitLabel: "Enviar e ir para obrigado",
      scheduleLabel: "Agendar conversa",
      scheduleNote: "Selecione um hor?rio preferencial (hor?rio de Bras?lia).",
      confirmationLabel: "Confirmar hor?rio",
      lgpd: "Autorizo o contato da InvestBA conforme a LGPD e pol?ticas de privacidade.",
      errors: {
        required: "Campo obrigat?rio",
        email: "Informe um e-mail v?lido",
      },
      successMessage: "Tudo certo! Redirecionando...",
      calendar: {
        title: "Escolha um hor?rio",
        subtitle: "Hor?rios dispon?veis nas pr?ximas 48h",
        timeSlots: ["09:30", "11:00", "14:30", "16:00"],
        confirmLabel: "Confirmar agenda",
      },
      fields: leadFormFieldsPt,
    },
    footer: {
      address: "Av. Magalh?es Neto, 1234 ? Salvador, BA",
      contacts: [
        { label: "+55 71 4000-0000", value: "+557140000000", href: "tel:+557140000000" },
        { label: "contato@investba.com.br", value: "contato@investba.com.br", href: "mailto:contato@investba.com.br" },
      ],
      social: [
        { label: "LinkedIn", href: "https://www.linkedin.com/company/investba" },
        { label: "YouTube", href: "https://www.youtube.com/@investba" },
      ],
      legal: [
        { label: "Pol?tica de privacidade", href: "#" },
        { label: "Termos de uso", href: "#" },
      ],
      disclaimer: "InvestBA ? 2025. Informa??es sujeitas a atualiza??o sem aviso pr?vio.",
    },
  },
  en: {
    locale: "en",
    hero: {
      eyebrow: "Smart territorial investments",
      headline: "InvestBA ? Where vision meets opportunity",
      subheadline:
        "Projects backed by legal certainty, evolving infrastructure and proven upside across Bahia.",
      primaryCta: "Download ROI study (PDF)",
      secondaryCta: "See price & availability",
      microSeals: [
        "Notarized registry",
        "Infrastructure delivered",
        "Governance & transparency",
      ],
      pdfLabel: "InvestBA ROI study",
    },
    trustBadges: {
      title: "Partners & certifications",
      badges: [
        { label: "ISO 9001", description: "Corporate quality management" },
        { label: "LGPD compliant", description: "Data handled with privacy in mind" },
        { label: "Secovi partner", description: "Real estate best practices" },
        { label: "Independent audit", description: "Quarterly compliance reporting" },
      ],
    },
    benefits: {
      title: "Why InvestBA",
      items: [
        {
          title: "Strategic locations",
          description:
            "Masterplans connected to Bahia's main logistics, tourism and residential corridors.",
        },
        {
          title: "Clear commercial terms",
          description:
            "Transparent scenarios, consultative support and a dedicated deal desk for investors.",
        },
        {
          title: "Comparable data",
          description:
            "Proprietary studies with ROI, cap rate and appreciation benchmarks across the market.",
        },
      ],
    },
    availability: {
      title: "Pricing & availability",
      description:
        "Browse available lots. Reservations and sales update in real time so you can move with confidence.",
      filterLabels: {
        available: "Available",
        reserved: "Reserved",
        sold: "Sold",
      },
      legend: {
        available: "Available",
        reserved: "Reserved",
        sold: "Sold",
      },
      modal: {
        title: "Lot details",
        callToAction: "Request proposal",
      },
      empty: "No lots matching this status. Join our waitlist for the next release.",
    },
    roiHighlights: {
      title: "ROI highlights",
      disclaimer: "Illustrative figures ? full study available on request.",
      items: baseROIHighlights.map((item) => ({
        ...item,
        label:
          item.label === "ROI estimado"
            ? "Estimated ROI"
            : item.label === "Cap rate"
              ? "Cap rate"
              : "Comparable appreciation",
        description:
          item.label === "ROI estimado"
            ? "Projection based on Bahia metro area land appreciation trends."
            : item.label === "Cap rate"
              ? "Potential rental yield for corporate and commercial operations within the masterplan."
              : "Average appreciation recorded for comparable developments (12 months).",
      })),
    },
    faq: {
      title: "Frequently asked questions",
      items: baseFaq.map((faq) => ({
        question: (() => {
          switch (faq.question) {
            case "Como a InvestBA garante seguran?a jur?dica dos empreendimentos?":
              return "How does InvestBA ensure legal certainty?";
            case "Quais s?o os prazos m?dios de entrega de infraestrutura?":
              return "What is the infrastructure delivery timeline?";
            case "Existem condi??es de financiamento?":
              return "Are financing options available?";
            case "Posso agendar uma visita t?cnica?":
              return "Can I schedule a technical visit?";
            case "Quais documentos s?o necess?rios para avan?ar?":
              return "Which documents will I need to move forward?";
            default:
              return "What is your client service policy?";
          }
        })(),
        answer: (() => {
          switch (faq.question) {
            case "Como a InvestBA garante seguran?a jur?dica dos empreendimentos?":
              return "Each project has an individual registry, notarized documentation and independent legal audits updated quarterly.";
            case "Quais s?o os prazos m?dios de entrega de infraestrutura?":
              return "Active phases follow an externally validated schedule with partial deliveries every 90 days.";
            case "Existem condi??es de financiamento?":
              return "We provide in-house and bank financing, plus tailor-made simulations for your profile.";
            case "Posso agendar uma visita t?cnica?":
              return "Yes. Our operations team schedules on-site and virtual tours with specialists and legal support when needed.";
            case "Quais documentos s?o necess?rios para avan?ar?":
              return "Government-issued ID, proof of address and corporate documentation when applicable. A detailed checklist follows your first call.";
            default:
              return "We respond within two business hours with structured follow-up through our omnichannel CRM.";
          }
        })(),
      })),
    },
    leadForm: {
      title: "Ready to elevate your portfolio?",
      description:
        "Share your details to receive the full ROI study, comparable scenarios and schedule a consultative session.",
      submitLabel: "Submit & go to thank you",
      scheduleLabel: "Schedule a call",
      scheduleNote: "Select your preferred time (Bahia local time).",
      confirmationLabel: "Confirm time",
      lgpd: "I agree to be contacted according to InvestBA's privacy policy.",
      errors: {
        required: "Required field",
        email: "Enter a valid email",
      },
      successMessage: "All set! Redirecting...",
      calendar: {
        title: "Choose a time",
        subtitle: "Slots available within the next 48 hours",
        timeSlots: ["09:30", "11:00", "14:30", "16:00"],
        confirmLabel: "Confirm call",
      },
      fields: leadFormFieldsEn,
    },
    footer: {
      address: "1234 Magalh?es Neto Ave ? Salvador, Bahia",
      contacts: [
        { label: "+55 71 4000-0000", value: "+557140000000", href: "tel:+557140000000" },
        { label: "hello@investba.com", value: "hello@investba.com", href: "mailto:hello@investba.com" },
      ],
      social: [
        { label: "LinkedIn", href: "https://www.linkedin.com/company/investba" },
        { label: "YouTube", href: "https://www.youtube.com/@investba" },
      ],
      legal: [
        { label: "Privacy policy", href: "#" },
        { label: "Terms of use", href: "#" },
      ],
      disclaimer: "InvestBA ? 2025. Information subject to change without notice.",
    },
  },
  es: {
    locale: "es",
    hero: {
      eyebrow: "Inversiones territoriales inteligentes",
      headline: "InvestBA ? Donde la visi?n encuentra la oportunidad",
      subheadline:
        "Emprendimientos con seguridad jur?dica, infraestructura en evoluci?n y alto potencial de valorizaci?n.",
      primaryCta: "Descargar estudio de rentabilidad (PDF)",
      secondaryCta: "Ver precio y disponibilidad",
      microSeals: [
        "Registro notarial",
        "Infraestructura entregada",
        "Gobernanza y transparencia",
      ],
      pdfLabel: "Estudio de rentabilidad InvestBA",
    },
    trustBadges: {
      title: "Alianzas y certificaciones",
      badges: [
        { label: "ISO 9001", description: "Gesti?n de calidad corporativa" },
        { label: "Cumplimiento LGPD", description: "Datos tratados con privacidad" },
        { label: "Socio Secovi", description: "Buenas pr?cticas inmobiliarias" },
        { label: "Auditor?a independiente", description: "Informes trimestrales actualizados" },
      ],
    },
    benefits: {
      title: "?Por qu? InvestBA?",
      items: [
        {
          title: "Ubicaciones estrat?gicas",
          description:
            "Planes maestros conectados con los principales ejes log?sticos y tur?sticos de Bah?a.",
        },
        {
          title: "Condiciones comerciales claras",
          description:
            "Escenarios transparentes, soporte consultivo y una mesa especializada para inversionistas.",
        },
        {
          title: "Datos comparables",
          description:
            "Estudios propietarios con benchmarks de ROI, cap rate y valorizaci?n comprobada.",
        },
      ],
    },
    availability: {
      title: "Precio y disponibilidad",
      description:
        "Analiza el mapa de lotes. Las reservas y ventas se actualizan en tiempo real para una decisi?n ?gil y precisa.",
      filterLabels: {
        available: "Disponible",
        reserved: "Reservado",
        sold: "Vendido",
      },
      legend: {
        available: "Disponible",
        reserved: "Reservado",
        sold: "Vendido",
      },
      modal: {
        title: "Detalle del lote",
        callToAction: "Solicitar propuesta",
      },
      empty: "No hay lotes con este estado. Cont?ctanos para la lista de espera.",
    },
    roiHighlights: {
      title: "Indicadores de rentabilidad",
      disclaimer: "Cifras ilustrativas ? estudio completo disponible a pedido.",
      items: baseROIHighlights.map((item) => ({
        ...item,
        label:
          item.label === "ROI estimado"
            ? "ROI estimado"
            : item.label === "Cap rate"
              ? "Cap rate"
              : "Comparables de valorizaci?n",
        description:
          item.label === "ROI estimado"
            ? "Proyecci?n basada en el desempe?o de la regi?n metropolitana de Salvador."
            : item.label === "Cap rate"
              ? "Potencial de renta para operaciones corporativas y comerciales dentro del masterplan."
              : "Promedio de valorizaci?n registrado en desarrollos comparables (12 meses).",
      })),
    },
    faq: {
      title: "Preguntas frecuentes",
      items: baseFaq.map((faq) => ({
        question: (() => {
          switch (faq.question) {
            case "Como a InvestBA garante seguran?a jur?dica dos empreendimentos?":
              return "?C?mo garantiza InvestBA la seguridad jur?dica?";
            case "Quais s?o os prazos m?dios de entrega de infraestrutura?":
              return "?Cu?l es el plazo de entrega de la infraestructura?";
            case "Existem condi??es de financiamento?":
              return "?Hay opciones de financiamiento?";
            case "Posso agendar uma visita t?cnica?":
              return "?Puedo agendar una visita t?cnica?";
            case "Quais documentos s?o necess?rios para avan?ar?":
              return "?Qu? documentos necesito para avanzar?";
            default:
              return "?Cu?l es la pol?tica de atenci?n al cliente?";
          }
        })(),
        answer: (() => {
          switch (faq.question) {
            case "Como a InvestBA garante seguran?a jur?dica dos empreendimentos?":
              return "Cada proyecto cuenta con matr?cula individual, registro notarial y auditor?as legales trimestrales.";
            case "Quais s?o os prazos m?dios de entrega de infraestrutura?":
              return "Las fases activas poseen cronograma validado con entregas parciales cada 90 d?as.";
            case "Existem condi??es de financiamento?":
              return "Disponemos de financiamiento propio y bancario, con simulaciones personalizadas.";
            case "Posso agendar uma visita t?cnica?":
              return "S?, coordinamos visitas presenciales y virtuales con especialistas y apoyo legal.";
            case "Quais documentos s?o necess?rios para avan?ar?":
              return "Documento oficial, comprobante de domicilio y datos societarios cuando corresponda.";
            default:
              return "Respondemos en menos de 2 horas h?biles con seguimiento multicanal.";
          }
        })(),
      })),
    },
    leadForm: {
      title: "?Listo para potenciar tu portafolio?",
      description:
        "Comparte tus datos y recibe el estudio completo, escenarios financieros y agenda consultiva prioritaria.",
      submitLabel: "Enviar y ir a agradecimiento",
      scheduleLabel: "Agendar conversaci?n",
      scheduleNote: "Selecciona un horario preferido (hora de Bah?a).",
      confirmationLabel: "Confirmar horario",
      lgpd: "Autorizo el contacto de InvestBA seg?n la pol?tica de privacidad.",
      errors: {
        required: "Campo obligatorio",
        email: "Introduce un correo v?lido",
      },
      successMessage: "?Perfecto! Redirigiendo...",
      calendar: {
        title: "Elige un horario",
        subtitle: "Horarios disponibles en las pr?ximas 48h",
        timeSlots: ["09:30", "11:00", "14:30", "16:00"],
        confirmLabel: "Confirmar conversaci?n",
      },
      fields: leadFormFieldsEs,
    },
    footer: {
      address: "Av. Magalh?es Neto 1234 ? Salvador, Bah?a",
      contacts: [
        { label: "+55 71 4000-0000", value: "+557140000000", href: "tel:+557140000000" },
        { label: "hola@investba.com", value: "hola@investba.com", href: "mailto:hola@investba.com" },
      ],
      social: [
        { label: "LinkedIn", href: "https://www.linkedin.com/company/investba" },
        { label: "YouTube", href: "https://www.youtube.com/@investba" },
      ],
      legal: [
        { label: "Pol?tica de privacidad", href: "#" },
        { label: "T?rminos de uso", href: "#" },
      ],
      disclaimer: "InvestBA ? 2025. Informaci?n sujeta a cambios sin previo aviso.",
    },
  },
};

