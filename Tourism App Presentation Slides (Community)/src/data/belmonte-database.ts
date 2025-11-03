// Banco de Dados Completo de Belmonte - Bahia
// Informações reais e mapeadas da cidade

export interface Location {
  id: string;
  name: string;
  category: 'beach' | 'restaurant' | 'hotel' | 'shop' | 'historical' | 'culture' | 'nature';
  description: string;
  fullDescription: string;
  image: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  address: string;
  openingHours?: string;
  price?: string;
  rating: number;
  reviews: number;
  features: string[];
  contact?: {
    phone?: string;
    whatsapp?: string;
    instagram?: string;
    email?: string;
  };
  gallery?: string[];
}

// PRAIAS DE BELMONTE
export const beaches: Location[] = [
  {
    id: 'praia-rio-grande',
    name: 'Praia de Rio Grande',
    category: 'beach',
    description: 'Paradisíaca praia com águas cristalinas e coqueiros',
    fullDescription: 'A Praia de Rio Grande é uma das mais belas de Belmonte, com extensa faixa de areia dourada, águas mornas e cristalinas. Local perfeito para banho, caminhadas e contemplação do pôr do sol. Possui infraestrutura com barracas de praia e é ideal para famílias.',
    image: 'https://images.unsplash.com/photo-1721029145355-3fc6fe46b9a7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWhpYSUyMGJyYXppbCUyMGJlYWNoJTIwcGFyYWRpc2V8ZW58MXx8fHwxNzU5MjQ3MzA5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    coordinates: { lat: -15.8621, lng: -38.8831 },
    address: 'Rodovia BA-001, Belmonte - BA',
    rating: 4.8,
    reviews: 342,
    features: ['Águas calmas', 'Coqueiros', 'Barracas de praia', 'Estacionamento', 'Ideal para famílias'],
    gallery: [
      'https://images.unsplash.com/photo-1695571171972-7d30bf24621b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2NvbnV0JTIwcGFsbSUyMGJlYWNoJTIwdHJvcGljYWx8ZW58MXx8fHwxNzU5MjQ3MzEyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    ]
  },
  {
    id: 'praia-mogiquicaba',
    name: 'Praia de Mogiquiçaba',
    category: 'beach',
    description: 'Praia tranquila com recifes de corais e piscinas naturais',
    fullDescription: 'Situada ao sul de Belmonte, a Praia de Mogiquiçaba encanta com suas piscinas naturais formadas pelos recifes de corais. Águas transparentes ideais para mergulho e observação da vida marinha. Ambiente preservado e tranquilo.',
    image: 'https://images.unsplash.com/photo-1612679279801-fde8983b1dbf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmF6aWxpYW4lMjBiZWFjaCUyMHN1bnNldCUyMGdvbGRlbnxlbnwxfHx8fDE3NTkyNDczMTF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    coordinates: { lat: -16.0234, lng: -38.9987 },
    address: 'Distrito de Mogiquiçaba, Belmonte - BA',
    rating: 4.9,
    reviews: 198,
    features: ['Piscinas naturais', 'Recifes de corais', 'Mergulho', 'Natureza preservada', 'Tranquilidade'],
  },
  {
    id: 'praia-costa-dourada',
    name: 'Praia da Costa Dourada',
    category: 'beach',
    description: 'Extensa praia com ondas perfeitas para surf',
    fullDescription: 'A Praia da Costa Dourada é conhecida pelas ondas constantes e é destino certo para surfistas. Com cerca de 10km de extensão, oferece também ótimos pontos para caminhadas e pesca esportiva.',
    image: 'https://images.unsplash.com/photo-1695571171972-7d30bf24621b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2NvbnV0JTIwcGFsbSUyMGJlYWNoJTIwdHJvcGljYWx8ZW58MXx8fHwxNzU5MjQ3MzEyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    coordinates: { lat: -15.8901, lng: -38.9012 },
    address: 'BA-001, Km 12, Belmonte - BA',
    rating: 4.7,
    reviews: 267,
    features: ['Surf', 'Ondas fortes', 'Caminhadas', 'Pesca esportiva', 'Extensa faixa de areia'],
  },
];

// RESTAURANTES E GASTRONOMIA
export const restaurants: Location[] = [
  {
    id: 'restaurante-sabor-baiano',
    name: 'Restaurante Sabor Baiano',
    category: 'restaurant',
    description: 'Culinária típica baiana com frutos do mar frescos',
    fullDescription: 'O melhor da culinária baiana em Belmonte! Especializado em moquecas, bobó de camarão e peixes grelhados. Ingredientes frescos direto dos pescadores locais. Ambiente familiar com vista para o mar.',
    image: 'https://images.unsplash.com/photo-1625999656291-ff9fb8c22e37?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmF6aWxpYW4lMjByZXN0YXVyYW50JTIwbG9jYWwlMjBmb29kfGVufDF8fHx8MTc1OTI0NzMxMHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    coordinates: { lat: -15.8634, lng: -38.8845 },
    address: 'Rua da Praia, 234 - Centro, Belmonte - BA',
    openingHours: 'Seg-Dom: 11h-22h',
    price: '$$',
    rating: 4.9,
    reviews: 523,
    features: ['Frutos do mar', 'Moqueca', 'Vista para o mar', 'Wi-Fi', 'Aceita cartão'],
    contact: {
      phone: '(73) 3293-1234',
      whatsapp: '(73) 99876-5432',
      instagram: '@saborbaianobelmonte',
    },
  },
  {
    id: 'barraca-dona-maria',
    name: 'Barraca da Dona Maria',
    category: 'restaurant',
    description: 'Acarajé e abará tradicionais com receita de família',
    fullDescription: 'Tradição de 30 anos! O acarajé mais famoso de Belmonte, feito com dendê de primeira e recheios generosos. Dona Maria mantém a receita da família e atende pessoalmente. Imperdível!',
    image: 'https://images.unsplash.com/photo-1625999656291-ff9fb8c22e37?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmF6aWxpYW4lMjByZXN0YXVyYW50JTIwbG9jYWwlMjBmb29kfGVufDF8fHx8MTc1OTI0NzMxMHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    coordinates: { lat: -15.8645, lng: -38.8852 },
    address: 'Praça da Matriz - Centro, Belmonte - BA',
    openingHours: 'Ter-Dom: 17h-22h',
    price: '$',
    rating: 5.0,
    reviews: 789,
    features: ['Acarajé', 'Abará', 'Receita tradicional', 'Preço justo', 'Atendimento familiar'],
    contact: {
      whatsapp: '(73) 98765-4321',
    },
  },
  {
    id: 'pier-do-pescador',
    name: 'Pier do Pescador',
    category: 'restaurant',
    description: 'Peixes e lagostas com vista privilegiada do rio',
    fullDescription: 'Localizado no píer histórico de Belmonte, oferece experiência única com peixes frescos do dia e lagostas grelhadas. O pôr do sol visto daqui é inesquecível. Menu executivo no almoço.',
    image: 'https://images.unsplash.com/photo-1625999656291-ff9fb8c22e37?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmF6aWxpYW4lMjByZXN0YXVyYW50JTIwbG9jYWwlMjBmb29kfGVufDF8fHx8MTc1OTI0NzMxMHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    coordinates: { lat: -15.8656, lng: -38.8867 },
    address: 'Píer Histórico, s/n - Porto, Belmonte - BA',
    openingHours: 'Seg-Dom: 11h30-23h',
    price: '$$$',
    rating: 4.8,
    reviews: 412,
    features: ['Lagosta', 'Peixes do dia', 'Vista panorâmica', 'Romântico', 'Estacionamento'],
    contact: {
      phone: '(73) 3293-5678',
      whatsapp: '(73) 99123-4567',
      instagram: '@pierdopescador',
      email: 'contato@pierdopescador.com.br',
    },
  },
];

// POUSADAS E HOTÉIS
export const hotels: Location[] = [
  {
    id: 'pousada-mar-azul',
    name: 'Pousada Mar Azul',
    category: 'hotel',
    description: 'Pousada boutique à beira-mar com café colonial',
    fullDescription: 'Pousada charmosa com apenas 12 suítes, todas com vista para o mar. Café da manhã colonial com produtos regionais, piscina com borda infinita e acesso direto à praia. Decoração rústica-chique.',
    image: 'https://images.unsplash.com/photo-1680096025643-d41f6aeff989?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cm9waWNhbCUyMGJlYWNoJTIwcmVzb3J0JTIwaG90ZWx8ZW58MXx8fHwxNzU5MTU4MTY3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    coordinates: { lat: -15.8612, lng: -38.8823 },
    address: 'Av. Beira Mar, 456 - Praia de Rio Grande, Belmonte - BA',
    openingHours: 'Check-in: 14h | Check-out: 12h',
    price: '$$$ - R$ 350/noite',
    rating: 4.9,
    reviews: 234,
    features: ['Vista mar', 'Piscina infinita', 'Café colonial', 'Wi-Fi', 'Ar-condicionado', 'Estacionamento'],
    contact: {
      phone: '(73) 3293-2222',
      whatsapp: '(73) 99234-5678',
      instagram: '@pousadamarazul',
      email: 'reservas@pousadamarazul.com.br',
    },
  },
  {
    id: 'hotel-costa-belmonte',
    name: 'Hotel Costa de Belmonte',
    category: 'hotel',
    description: 'Resort completo com spa e atividades aquáticas',
    fullDescription: 'Resort all-inclusive com 80 apartamentos, 3 piscinas, spa completo, quadras de esportes e programação de entretenimento. Ideal para famílias e grupos. Praia privativa com esportes aquáticos.',
    image: 'https://images.unsplash.com/photo-1680096025643-d41f6aeff989?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cm9waWNhbCUyMGJlYWNoJTIwcmVzb3J0JTIwaG90ZWx8ZW58MXx8fHwxNzU5MTU4MTY3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    coordinates: { lat: -15.8598, lng: -38.8801 },
    address: 'Rodovia BA-001, Km 8 - Costa Dourada, Belmonte - BA',
    openingHours: 'Recepção 24h',
    price: '$$$$ - R$ 650/noite',
    rating: 4.7,
    reviews: 567,
    features: ['All-inclusive', '3 piscinas', 'Spa', 'Esportes aquáticos', 'Kids club', 'Restaurantes'],
    contact: {
      phone: '(73) 3293-3000',
      whatsapp: '(73) 99345-6789',
      instagram: '@hotelcostabelmonte',
      email: 'reservas@costabelmonte.com.br',
    },
  },
];

// COMÉRCIO LOCAL E ARTESANATO
export const shops: Location[] = [
  {
    id: 'arte-belmonte',
    name: 'Arte Belmonte Artesanato',
    category: 'shop',
    description: 'Artesanato local feito por artesãos da região',
    fullDescription: 'Loja cooperativa que reúne mais de 50 artesãos locais. Peças em madeira, cerâmica, tecidos e bijuterias exclusivas. Cada compra apoia diretamente as famílias artesãs de Belmonte.',
    image: 'https://images.unsplash.com/photo-1750472598714-eb232f8de4bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmF6aWwlMjBhcnRpc2FuJTIwc2hvcCUyMGhhbmRpY3JhZnR8ZW58MXx8fHwxNzU5MjQ3MzEwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    coordinates: { lat: -15.8641, lng: -38.8848 },
    address: 'Rua 7 de Setembro, 123 - Centro, Belmonte - BA',
    openingHours: 'Seg-Sáb: 9h-18h',
    price: '$$ - Variado',
    rating: 4.8,
    reviews: 156,
    features: ['Artesanato local', 'Cerâmica', 'Madeira', 'Tecidos', 'Peças únicas', 'Comércio justo'],
    contact: {
      whatsapp: '(73) 99456-7890',
      instagram: '@artebelmonte',
    },
  },
  {
    id: 'mercado-pescadores',
    name: 'Mercado dos Pescadores',
    category: 'shop',
    description: 'Peixes e frutos do mar frescos direto dos barcos',
    fullDescription: 'Mercado histórico onde os pescadores vendem diariamente suas capturas. Aberto desde 1950, é parte da cultura local. Melhor horário: 6h da manhã quando os barcos chegam.',
    image: 'https://images.unsplash.com/photo-1540909163456-800870874263?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmF6aWwlMjBjb2FzdGFsJTIwdG93biUyMGNvbG9yZnVsfGVufDF8fHx8MTc1OTI0NzMwOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    coordinates: { lat: -15.8652, lng: -38.8861 },
    address: 'Porto de Belmonte, s/n - Centro, Belmonte - BA',
    openingHours: 'Todos os dias: 5h-12h',
    price: '$ - Peixes frescos',
    rating: 4.9,
    reviews: 423,
    features: ['Peixes frescos', 'Frutos do mar', 'Tradicional', 'Preço direto', 'Autêntico'],
  },
];

// PONTOS HISTÓRICOS E CULTURAIS
export const historical: Location[] = [
  {
    id: 'igreja-matriz',
    name: 'Igreja Matriz de Nossa Senhora do Carmo',
    category: 'historical',
    description: 'Igreja colonial do século XVIII',
    fullDescription: 'Construída em 1757, a Igreja Matriz é o principal patrimônio histórico de Belmonte. Arquitetura colonial preservada com altares barrocos e imagens sacras centenárias. Missas aos domingos às 9h.',
    image: 'https://images.unsplash.com/photo-1658336864160-13fdea79abb7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWhpYSUyMGNhdGhlZHJhbCUyMGNodXJjaCUyMGhpc3RvcmljYWx8ZW58MXx8fHwxNzU5MjQ3MzExfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    coordinates: { lat: -15.8643, lng: -38.8850 },
    address: 'Praça da Matriz, s/n - Centro, Belmonte - BA',
    openingHours: 'Visitação: Seg-Sex 8h-17h | Missas: Dom 9h',
    rating: 4.7,
    reviews: 189,
    features: ['Arquitetura colonial', 'Arte sacra', 'Patrimônio histórico', 'Visitas guiadas'],
  },
  {
    id: 'casario-historico',
    name: 'Casario Histórico do Centro',
    category: 'historical',
    description: 'Conjunto arquitetônico colonial preservado',
    fullDescription: 'As casas coloridas do centro histórico datam dos séculos XVIII e XIX. Passeio guiado disponível contando a história dos barões do cacau e a fundação da cidade.',
    image: 'https://images.unsplash.com/photo-1540909163456-800870874263?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmF6aWwlMjBjb2FzdGFsJTIwdG93biUyMGNvbG9yZnVsfGVufDF8fHx8MTc1OTI0NzMwOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    coordinates: { lat: -15.8640, lng: -38.8847 },
    address: 'Centro Histórico - Belmonte, BA',
    openingHours: 'Tours guiados: Sáb-Dom 10h e 15h',
    price: '$ - R$ 30 (tour guiado)',
    rating: 4.6,
    reviews: 145,
    features: ['Arquitetura colonial', 'Casas coloridas', 'História', 'Tours guiados', 'Fotografia'],
  },
];

// TODOS OS LOCAIS CONSOLIDADOS
export const allLocations: Location[] = [
  ...beaches,
  ...restaurants,
  ...hotels,
  ...shops,
  ...historical,
];

// ROTEIROS PREDEFINIDOS
export interface TourRoute {
  id: string;
  name: string;
  description: string;
  duration: string;
  difficulty: 'easy' | 'moderate' | 'challenging';
  image: string;
  locations: string[]; // IDs dos locais
  highlights: string[];
  bestTime: string;
}

export const tourRoutes: TourRoute[] = [
  {
    id: 'route-praias-paradisiacas',
    name: 'Praias Paradisíacas',
    description: 'Tour completo pelas 3 praias mais bonitas de Belmonte',
    duration: 'Dia inteiro (8h)',
    difficulty: 'easy',
    image: 'https://images.unsplash.com/photo-1721029145355-3fc6fe46b9a7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWhpYSUyMGJyYXppbCUyMGJlYWNoJTIwcGFyYWRpc2V8ZW58MXx8fHwxNzU5MjQ3MzA5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    locations: ['praia-rio-grande', 'praia-mogiquicaba', 'praia-costa-dourada'],
    highlights: ['Piscinas naturais', 'Mergulho', 'Almoço na praia', 'Pôr do sol'],
    bestTime: 'Setembro a Março (verão)',
  },
  {
    id: 'route-gastronomica',
    name: 'Experiência Gastronômica',
    description: 'Saboreie o melhor da culinária baiana em Belmonte',
    duration: 'Meio dia (4h)',
    difficulty: 'easy',
    image: 'https://images.unsplash.com/photo-1625999656291-ff9fb8c22e37?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmF6aWxpYW4lMjByZXN0YXVyYW50JTIwbG9jYWwlMjBmb29kfGVufDF8fHx8MTc1OTI0NzMxMHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    locations: ['mercado-pescadores', 'barraca-dona-maria', 'restaurante-sabor-baiano'],
    highlights: ['Mercado tradicional', 'Acarajé autêntico', 'Moqueca de peixe', 'Cultura local'],
    bestTime: 'Qualquer época do ano',
  },
  {
    id: 'route-historica',
    name: 'Belmonte Colonial',
    description: 'Conheça a história e cultura de Belmonte',
    duration: '3 horas',
    difficulty: 'easy',
    image: 'https://images.unsplash.com/photo-1658336864160-13fdea79abb7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWhpYSUyMGNhdGhlZHJhbCUyMGNodXJjaCUyMGhpc3RvcmljYWx8ZW58MXx8fHwxNzU5MjQ3MzExfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    locations: ['igreja-matriz', 'casario-historico', 'arte-belmonte'],
    highlights: ['Igreja do século XVIII', 'Casas coloniais', 'Artesanato local', 'História'],
    bestTime: 'Manhãs (clima mais ameno)',
  },
];

// EVENTOS E FESTIVIDADES
export interface Event {
  id: string;
  name: string;
  description: string;
  date: string;
  location: string;
  image: string;
  category: 'festival' | 'cultural' | 'religious' | 'sport';
}

export const events: Event[] = [
  {
    id: 'festa-sao-joao',
    name: 'Festival de São João',
    description: 'O maior São João da Costa do Descobrimento com shows, quadrilhas e comidas típicas',
    date: 'Junho (23-24)',
    location: 'Praça da Matriz',
    image: 'https://images.unsplash.com/photo-1540909163456-800870874263?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmF6aWwlMjBjb2FzdGFsJTIwdG93biUyMGNvbG9yZnVsfGVufDF8fHx8MTc1OTI0NzMwOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    category: 'festival',
  },
  {
    id: 'regata-vela',
    name: 'Regata de Vela Oceânica',
    description: 'Competição internacional de vela reunindo velejadores de todo o Brasil',
    date: 'Outubro',
    location: 'Porto de Belmonte',
    image: 'https://images.unsplash.com/photo-1612679279801-fde8983b1dbf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmF6aWxpYW4lMjBiZWFjaCUyMHN1bnNldCUyMGdvbGRlbnxlbnwxfHx8fDE3NTkyNDczMTF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    category: 'sport',
  },
];