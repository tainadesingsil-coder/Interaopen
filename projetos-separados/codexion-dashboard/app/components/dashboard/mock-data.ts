import type { AccessEvent, MapAgent, MonitoredUser } from '@/app/components/dashboard/types';

const baseHistory = [
  { time: '08:00', ecg: 71, stress: 29, pressure: 11 },
  { time: '09:00', ecg: 74, stress: 34, pressure: 12 },
  { time: '10:00', ecg: 76, stress: 31, pressure: 12 },
  { time: '11:00', ecg: 79, stress: 39, pressure: 13 },
  { time: '12:00', ecg: 78, stress: 40, pressure: 13 },
  { time: '13:00', ecg: 81, stress: 44, pressure: 14 },
  { time: '14:00', ecg: 77, stress: 33, pressure: 12 },
  { time: '15:00', ecg: 75, stress: 28, pressure: 12 },
];

export const monitoredUsers: MonitoredUser[] = [
  {
    id: 'usr-01',
    name: 'Taina Silva',
    role: 'Moradora Torre A',
    location: 'Lobby Principal',
    avatar: '/logo.png',
    heartRate: 76,
    spo2: 98,
    status: 'stable',
    vitalsHistory: baseHistory,
  },
  {
    id: 'usr-02',
    name: 'Andre Costa',
    role: 'Vigilante Noturno',
    location: 'Garagem Subsolo',
    avatar: '/logo.svg',
    heartRate: 112,
    spo2: 95,
    status: 'attention',
    vitalsHistory: baseHistory.map((item, index) => ({
      ...item,
      ecg: item.ecg + (index % 2 ? 8 : 5),
      stress: item.stress + 16,
      pressure: item.pressure + 1,
    })),
  },
  {
    id: 'usr-03',
    name: 'Marina Lopes',
    role: 'Supervisora Industrial',
    location: 'Setor Prensagem',
    avatar: '/logo-source.jpg',
    heartRate: 89,
    spo2: 96,
    status: 'stable',
    vitalsHistory: baseHistory.map((item, index) => ({
      ...item,
      ecg: item.ecg + (index % 3),
      stress: item.stress + 6,
    })),
  },
  {
    id: 'usr-04',
    name: 'Joao Pereira',
    role: 'Tecnico de Campo',
    location: 'Area Externa B',
    avatar: '/logo.png',
    heartRate: 131,
    spo2: 92,
    status: 'critical',
    vitalsHistory: baseHistory.map((item, index) => ({
      ...item,
      ecg: item.ecg + 22 + (index % 2 ? 6 : 0),
      stress: item.stress + 34,
      pressure: item.pressure + 3,
    })),
  },
];

export const accessEvents: AccessEvent[] = [
  {
    id: 'evt-01',
    actor: 'Taina Silva',
    action: 'Entrada',
    zone: 'Portao Norte',
    timestamp: '18:09',
    severity: 'stable',
  },
  {
    id: 'evt-02',
    actor: 'Andre Costa',
    action: 'Saida',
    zone: 'Checkpoint C3',
    timestamp: '18:12',
    severity: 'attention',
  },
  {
    id: 'evt-03',
    actor: 'Visitante: Carlos',
    action: 'Interfone',
    zone: 'Torre B',
    timestamp: '18:16',
    severity: 'critical',
  },
  {
    id: 'evt-04',
    actor: 'Marina Lopes',
    action: 'Entrada',
    zone: 'Bloco Industrial',
    timestamp: '18:22',
    severity: 'stable',
  },
];

export const initialMapAgents: MapAgent[] = [
  { id: 'usr-01', name: 'Taina', x: 18, y: 22, status: 'stable' },
  { id: 'usr-02', name: 'Andre', x: 62, y: 40, status: 'attention' },
  { id: 'usr-03', name: 'Marina', x: 34, y: 68, status: 'stable' },
  { id: 'usr-04', name: 'Joao', x: 78, y: 24, status: 'critical' },
];
