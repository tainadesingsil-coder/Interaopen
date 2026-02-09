import type { LucideIcon } from 'lucide-react';

export type Locale = 'pt' | 'en' | 'it';

export type PresetKey = 'conservative' | 'realistic' | 'high';

export type SimulatorValues = {
  propertyValue: number;
  dailyRate: number;
  occupancy: number;
  monthlyCosts: number;
  platformFee: number;
};

export type SimulatorResults = {
  nightsPerMonth: number;
  grossMonthly: number;
  netMonthly: number;
  annualReturn: number;
  paybackYears: number | null;
};

export type ShowcaseDetail = {
  icon: LucideIcon;
  label: string;
  value: string;
};

export type ShowcaseItem = {
  label: string;
  title: string;
  desc: string;
  details: ShowcaseDetail[];
  images: string[];
};
