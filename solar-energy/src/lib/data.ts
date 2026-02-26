import {
  Bath,
  BedDouble,
  CarFront,
  Ruler,
  Shield,
  Sparkles,
  Trees,
  Waves,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const whatsappLink =
  'https://wa.me/557399833471?text=Ol%C3%A1%20gostaria%20de%20saber%20mais%20sobre%20o%20bella%20vista%20beach%20residense';

export type ShowcaseDetail = { icon: LucideIcon; label: string; value: string };

export type ShowcaseItem = {
  label: string;
  title: string;
  desc: string;
  details: ShowcaseDetail[];
  images: string[];
};

export const showcaseItems: ShowcaseItem[] = [
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
      'https://i.postimg.cc/cHNZ2FqK/CASA-TIPO-E-6.png',
      'https://i.postimg.cc/281JdnJM/CASA-TIPO-E-5.png',
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
      'https://i.postimg.cc/g2PCYnSv/SUPERIOR-v2.png',
      'https://i.postimg.cc/kX7Z3XSm/Design-sem-nome-2026-01-24T013513-644.png',
      'https://i.postimg.cc/6QBTCZ4p/Design-sem-nome-2026-01-24T013506-098.png',
      'https://i.postimg.cc/gJTJ9BM5/Design-sem-nome-2026-01-24T013459-346.png',
      'https://i.postimg.cc/qq67pXS1/Design-sem-nome-2026-01-24T013356-074.png',
    ],
  },
];

export const progressImages = [
  'https://i.postimg.cc/bwQR1PBD/20251204-082816-(1).jpg',
  'https://i.postimg.cc/tT7mRvNb/20251204-082550-(1).jpg',
  'https://i.postimg.cc/9fwJvwmZ/20251204-082247-(1).jpg',
  'https://i.postimg.cc/90rCyBPd/20251113-080300.jpg',
];

export type SimulatorValues = {
  propertyValue: number;
  dailyRate: number;
  occupancy: number;
  monthlyCosts: number;
  platformFee: number;
};

export type PresetKey = 'conservative' | 'realistic' | 'high';

export type SimulatorPreset = { key: PresetKey; values: SimulatorValues };

export const simulatorPresets: SimulatorPreset[] = [
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
