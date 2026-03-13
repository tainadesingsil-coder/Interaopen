import type { PresetKey, SimulatorValues } from '@/app/types';

const DEFAULT_MAP_LOCATION_URL =
  'https://www.google.com/maps?q=Bella%20Vista%20Beach%20Residence%2C%20BA-001%2C%20Km%20367%2C%20Praia%20do%20Mutari%2C%20Santa%20Cruz%20Cabr%C3%A1lia%20-%20BA';
const DEFAULT_WHATSAPP_NUMBER = '557399833471';
const DEFAULT_FORMSPREE_ID = 'mgolwpwv';

const sanitizeHttpsUrl = (value: string | undefined, fallback: string, hosts: string[]) => {
  if (!value) return fallback;
  try {
    const parsedUrl = new URL(value);
    if (parsedUrl.protocol !== 'https:') return fallback;
    if (!hosts.includes(parsedUrl.hostname)) return fallback;
    return parsedUrl.toString();
  } catch {
    return fallback;
  }
};

const normalizePhoneNumber = (value: string | undefined) => (value ?? '').replace(/\D/g, '');

export const heroPoster = '/images/hero/hero-poster.jpg';

export const heroVideoSources = {
  mobile:
    'https://res.cloudinary.com/dwedcl97k/video/upload/f_auto,q_auto:good,w_960/v1769199580/Design_sem_nome_-_2026-01-23T171932.339_fjulxo.mp4',
  desktop:
    'https://res.cloudinary.com/dwedcl97k/video/upload/f_auto,q_auto:good,w_1600/v1769199580/Design_sem_nome_-_2026-01-23T171932.339_fjulxo.mp4',
};

export const blurDataUrl =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiBmaWxsPSIjMGYxNjIwIi8+PC9zdmc+';

export const showcaseImages = {
  studio: [
    '/images/showcase/studio-1.jpg',
    '/images/showcase/studio-2.jpg',
    '/images/showcase/studio-3.jpg',
  ],
  apt2: [
    '/images/showcase/apt-2-1.jpg',
    '/images/showcase/apt-2-2.jpg',
  ],
  apt3: ['/images/showcase/apt-3-1.png', '/images/showcase/apt-3-2.png'],
  amenities: [
    '/images/showcase/amenities-1.png',
    '/images/showcase/amenities-2.png',
    '/images/showcase/amenities-3.png',
    '/images/showcase/amenities-4.png',
  ],
};

export const progressImages = [
  '/images/progress/progress-1.jpg',
  '/images/progress/progress-2.jpg',
  '/images/progress/progress-3.jpg',
  '/images/progress/progress-4.jpg',
];

export const simulatorPresets: { key: PresetKey; values: SimulatorValues }[] = [
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

export const mapEmbedUrl =
  'https://www.google.com/maps?q=Bella%20Vista%20Beach%20Residence%2C%20BA-001%2C%20Km%20367%2C%20Praia%20do%20Mutari%2C%20Santa%20Cruz%20Cabr%C3%A1lia%20-%20BA&output=embed';

export const mapLocationUrl =
  sanitizeHttpsUrl(process.env.NEXT_PUBLIC_MAP_LOCATION_URL, DEFAULT_MAP_LOCATION_URL, [
    'google.com',
    'www.google.com',
    'maps.google.com',
  ]);

export const whatsappNumber =
  normalizePhoneNumber(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER) || DEFAULT_WHATSAPP_NUMBER;

export const baseWhatsAppUrl = `https://wa.me/${whatsappNumber}`;

const formspreeCandidate = (process.env.NEXT_PUBLIC_FORMSPREE_ID ?? '').trim();
export const formspreeId =
  /^[a-z0-9]{6,20}$/i.test(formspreeCandidate) ? formspreeCandidate : DEFAULT_FORMSPREE_ID;

export const languageOptions: { value: 'pt' | 'en' | 'it'; label: string; name: string }[] =
  [
    { value: 'pt', label: 'PT', name: 'Português' },
    { value: 'en', label: 'EN', name: 'English' },
    { value: 'it', label: 'IT', name: 'Italiano' },
  ];
