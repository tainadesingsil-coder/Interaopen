// Dataset simplificado de destinos em Minas Gerais
export interface MGLocation {
  id: string;
  city: string; // Ex.: Belo Horizonte, Ouro Preto, Tiradentes
  name: string;
  category: 'nature' | 'historical' | 'culture' | 'restaurant' | 'hotel' | 'shop' | 'lake' | 'mountain' | 'waterfall';
  description: string;
  image: string;
  rating?: number;
  reviews?: number;
}

export const mgLocations: MGLocation[] = [
  {
    id: 'praça-liberdade',
    city: 'Belo Horizonte',
    name: 'Praça da Liberdade',
    category: 'culture',
    description: 'Conjunto arquitetônico, museus e jardins no coração da cidade',
    image: 'https://images.unsplash.com/photo-1560179707-f14e90ef3db2?q=80&w=1200&auto=format&fit=crop',
    rating: 4.8,
    reviews: 1200,
  },
  {
    id: 'mercado-central',
    city: 'Belo Horizonte',
    name: 'Mercado Central',
    category: 'shop',
    description: 'Queijos, doces, artesanato e gastronomia mineira tradicional',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200&auto=format&fit=crop',
    rating: 4.9,
    reviews: 5400,
  },
  {
    id: 'igreja-sao-francisco',
    city: 'Ouro Preto',
    name: 'Igreja de São Francisco de Assis',
    category: 'historical',
    description: 'Obra-prima do barroco mineiro atribuída a Aleijadinho',
    image: 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?q=80&w=1200&auto=format&fit=crop',
    rating: 4.9,
    reviews: 3100,
  },
  {
    id: 'cachoeira-sao-jose',
    city: 'Tiradentes',
    name: 'Cachoeira São José',
    category: 'waterfall',
    description: 'Queda d’água com poços para banho e trilhas leves',
    image: 'https://images.unsplash.com/photo-1528821154947-1aa3d1b87b34?q=80&w=1200&auto=format&fit=crop',
    rating: 4.7,
    reviews: 870,
  },
  {
    id: 'lagoa-pampulha',
    city: 'Belo Horizonte',
    name: 'Conjunto Moderno da Pampulha',
    category: 'lake',
    description: 'Igreja, museu e jardins de Burle Marx ao redor da lagoa',
    image: 'https://images.unsplash.com/photo-1601902215265-dafde40f19a3?q=80&w=1200&auto=format&fit=crop',
    rating: 4.8,
    reviews: 2200,
  },
];

export function getCitiesFromMG(): string[] {
  return Array.from(new Set(mgLocations.map(l => l.city))).sort();
}

export function getLocationsByCity(city: string): MGLocation[] {
  return mgLocations.filter(l => l.city === city);
}

export function getLocationsByCityAndInterests(city: string, interests: MGLocation['category'][]): MGLocation[] {
  const inCity = getLocationsByCity(city);
  if (!interests || interests.length === 0) return inCity;
  return inCity.filter(l => interests.includes(l.category));
}

