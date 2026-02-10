import type { CommandItem } from '@/src/mock/types';

export const mockCommands: CommandItem[] = [
  {
    id: 'cmd-1001',
    type: 'access.approve',
    target: 'main_gate',
    timestamp: '18:41:23',
    status: 'running',
    actor: 'Operador Portaria',
    notes: 'Interfone Torre A 1203',
  },
  {
    id: 'cmd-1002',
    type: 'notify.security',
    target: 'watch-04',
    timestamp: '18:35:12',
    status: 'pending',
    actor: 'Duress Detector',
    notes: 'Alerta silencioso operacional',
  },
  {
    id: 'cmd-1003',
    type: 'emergency.lockdown',
    target: 'all_gates',
    timestamp: '18:34:02',
    status: 'success',
    actor: 'Operador Portaria',
    notes: 'Teste de protocolo concluído',
  },
  {
    id: 'cmd-1004',
    type: 'access.open_gate',
    target: 'service_gate',
    timestamp: '18:32:17',
    status: 'fail',
    actor: 'Operador Portaria',
    notes: 'Timeout no controlador local',
  },
];
