export type PresenceStatus = 'stable' | 'attention' | 'critical';

export type DashboardScreen = 'overview' | 'people' | 'events' | 'map';

export interface VitalPoint {
  time: string;
  ecg: number;
  stress: number;
  pressure: number;
}

export interface MonitoredUser {
  id: string;
  name: string;
  role: string;
  location: string;
  avatar: string;
  heartRate: number;
  spo2: number;
  status: PresenceStatus;
  vitalsHistory: VitalPoint[];
}

export interface AccessEvent {
  id: string;
  actor: string;
  action: 'Entrada' | 'Saida' | 'Interfone';
  zone: string;
  timestamp: string;
  severity: PresenceStatus;
}

export interface MapAgent {
  id: string;
  name: string;
  x: number;
  y: number;
  status: PresenceStatus;
}
