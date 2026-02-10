export type EventType = 'intercom' | 'access' | 'patrol' | 'duress' | 'emergency';
export type SeverityLevel = 'info' | 'warn' | 'critical';

export type EventActionType =
  | 'approve'
  | 'deny'
  | 'open_gate'
  | 'view_camera'
  | 'create_incident'
  | 'acknowledge';

export interface EventAction {
  type: EventActionType;
  label: string;
  critical?: boolean;
}

export interface FeedEvent {
  id: string;
  condominiumId: string;
  type: EventType;
  severity: SeverityLevel;
  title: string;
  description: string;
  tower: string;
  unit: string;
  timestamp: string;
  payload: Record<string, unknown>;
  actions: EventAction[];
}

export type CommandStatus = 'pending' | 'running' | 'success' | 'fail';

export interface CommandItem {
  id: string;
  condominiumId: string;
  type: string;
  target: string;
  timestamp: string;
  status: CommandStatus;
  actor: string;
  notes?: string;
}

export interface CondominiumProfile {
  id: string;
  name: string;
  city: string;
  towers: string[];
  gates: string[];
  securityTeam: string[];
  residentsCount: number;
}
