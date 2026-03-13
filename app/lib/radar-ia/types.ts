export const RADAR_TYPES = ['all', 'youtube', 'news', 'instagram'] as const;
export const RADAR_RANGES = ['24h', '7d', '30d'] as const;

export type RadarType = (typeof RADAR_TYPES)[number];
export type RadarRange = (typeof RADAR_RANGES)[number];
export type RadarItemKind = Exclude<RadarType, 'all'>;

export interface RadarItem {
  id: string;
  kind: RadarItemKind;
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string | null;
  thumbnail: string | null;
  channel: string | null;
  score: number;
  ctaLabel: string;
}

export interface RadarResponsePayload {
  query: string;
  type: RadarType;
  range: RadarRange;
  generatedAt: string;
  errors: Partial<Record<RadarItemKind, string>>;
  results: {
    youtube: RadarItem[];
    news: RadarItem[];
    instagram: RadarItem[];
  };
  all: RadarItem[];
}
