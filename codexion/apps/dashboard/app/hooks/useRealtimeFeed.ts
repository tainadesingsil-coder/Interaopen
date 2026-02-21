'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import useSWR from 'swr';

import { mockEvents } from '@/src/mock/events';
import type { EventAction, EventType, FeedEvent } from '@/src/mock/types';

type ConnectionState = 'mock' | 'connecting' | 'online' | 'offline' | 'error';

interface UseRealtimeFeedResult {
  events: FeedEvent[];
  connectionState: ConnectionState;
  loading: boolean;
  error: string | null;
  offlineMode: boolean;
  pushLocalEvent: (event: FeedEvent) => void;
  clearFeed: () => void;
}

const DEFAULT_CONDO_ID = 'bella-vista';

function safeString(value: unknown) {
  return typeof value === 'string' ? value : '';
}

function eventTypeFromEdge(typeRaw: string): EventType {
  const type = typeRaw.toLowerCase();
  if (type.startsWith('intercom')) return 'intercom';
  if (type.startsWith('access') || type.startsWith('gate.')) return 'access';
  if (type.startsWith('patrol')) return 'patrol';
  if (type.startsWith('duress')) return 'duress';
  if (type.startsWith('emergency')) return 'emergency';
  if (type.startsWith('watch')) return 'access';
  return 'access';
}

function severityFromEdge(typeRaw: string): FeedEvent['severity'] {
  const type = typeRaw.toLowerCase();
  if (
    type.includes('fail') ||
    type.includes('failed') ||
    type.startsWith('duress') ||
    type.startsWith('emergency')
  ) {
    return 'critical';
  }
  if (type.includes('warn') || type.includes('requested') || type.includes('called')) {
    return 'warn';
  }
  return 'info';
}

function actionsForType(type: EventType): EventAction[] {
  if (type === 'intercom') {
    return [
      { type: 'approve', label: 'Aprovar' },
      { type: 'deny', label: 'Recusar' },
      { type: 'view_camera', label: 'Ver camera' },
    ];
  }
  if (type === 'access') {
    return [
      { type: 'open_gate', label: 'Abrir portao' },
      { type: 'view_camera', label: 'Ver camera' },
    ];
  }
  if (type === 'patrol') {
    return [
      { type: 'acknowledge', label: 'Reconhecer' },
      { type: 'create_incident', label: 'Criar ocorrencia', critical: true },
    ];
  }
  if (type === 'duress' || type === 'emergency') {
    return [
      { type: 'acknowledge', label: 'Reconhecer' },
      { type: 'create_incident', label: 'Criar ocorrencia', critical: true },
    ];
  }
  return [{ type: 'acknowledge', label: 'Reconhecer' }];
}

function toTimeLabel(timestampRaw: string) {
  if (!timestampRaw) {
    return new Date().toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }
  const date = new Date(timestampRaw);
  if (Number.isNaN(date.getTime())) {
    return timestampRaw;
  }
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function titleFromEdgeType(typeRaw: string) {
  return typeRaw
    .replace(/\./g, ' ')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function edgeRowToFeedEvent(row: {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  created_at: string;
}): FeedEvent {
  const type = eventTypeFromEdge(safeString(row.type));
  const payload = row.payload || {};
  const tower = safeString(payload.tower) || safeString(payload.route_name) || 'Condominio';
  const unit =
    safeString(payload.unit) ||
    safeString(payload.target) ||
    safeString(payload.checkpoint) ||
    'N/A';
  const description =
    safeString(payload.message) ||
    safeString(payload.reason) ||
    safeString(payload.error) ||
    `Evento operacional: ${safeString(row.type)}`;

  return {
    id: safeString(row.id),
    condominiumId:
      safeString(payload.condominium_id) || safeString(payload.condominiumId) || DEFAULT_CONDO_ID,
    type,
    severity: severityFromEdge(safeString(row.type)),
    title: titleFromEdgeType(safeString(row.type)),
    description,
    tower,
    unit,
    timestamp: toTimeLabel(safeString(row.created_at)),
    payload,
    actions: actionsForType(type),
  };
}

function parseIncomingEvent(payload: unknown): FeedEvent | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }
  const candidate = payload as Partial<FeedEvent>;
  if (
    typeof candidate.id === 'string' &&
    typeof candidate.type === 'string' &&
    typeof candidate.severity === 'string' &&
    typeof candidate.title === 'string' &&
    typeof candidate.timestamp === 'string'
  ) {
    return {
      condominiumId: candidate.condominiumId || DEFAULT_CONDO_ID,
      ...candidate,
    } as FeedEvent;
  }

  const edgeRow = payload as {
    id?: unknown;
    type?: unknown;
    payload?: unknown;
    created_at?: unknown;
  };
  if (
    typeof edgeRow.id !== 'string' ||
    typeof edgeRow.type !== 'string' ||
    typeof edgeRow.created_at !== 'string'
  ) {
    return null;
  }
  const rowPayload =
    edgeRow.payload && typeof edgeRow.payload === 'object'
      ? (edgeRow.payload as Record<string, unknown>)
      : {};
  return edgeRowToFeedEvent({
    id: edgeRow.id,
    type: edgeRow.type,
    payload: rowPayload,
    created_at: edgeRow.created_at,
  });
}

function mapWatchSessionToFeedEvent(data: unknown): FeedEvent | null {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const session = data as {
    device_id?: unknown;
    device_name?: unknown;
    connected?: unknown;
    battery_level?: unknown;
    last_hr?: unknown;
    last_steps?: unknown;
    last_spo2?: unknown;
    last_seen_at?: unknown;
    updated_at?: unknown;
  };

  const deviceId = safeString(session.device_id);
  if (!deviceId) {
    return null;
  }

  const deviceName = safeString(session.device_name) || deviceId;
  const connected = Boolean(session.connected);
  const recordedAt = safeString(session.last_seen_at) || safeString(session.updated_at) || new Date().toISOString();
  const battery = session.battery_level;
  const hr = session.last_hr;
  const steps = session.last_steps;
  const spo2 = session.last_spo2;

  return {
    id: `watch-session-${deviceId}-${safeString(session.updated_at) || Date.now()}`,
    condominiumId: 'all',
    type: 'access',
    severity: connected ? 'info' : 'warn',
    title: connected ? 'Relógio conectado' : 'Relógio desconectado',
    description: connected
      ? `Dispositivo ${deviceName} ativo • HR ${String(hr ?? '--')} • Passos ${String(steps ?? '--')} • SpO2 ${String(spo2 ?? '--')}`
      : `Dispositivo ${deviceName} desconectado`,
    tower: 'Vvfit',
    unit: deviceName,
    timestamp: toTimeLabel(recordedAt),
    payload: {
      device_id: deviceId,
      device_name: deviceName,
      connected,
      battery_level: battery,
      hr,
      steps,
      spo2,
      recorded_at: recordedAt,
    },
    actions: [{ type: 'acknowledge', label: 'Reconhecer' }],
  };
}

function mapWatchHeartbeatToFeedEvent(data: unknown): FeedEvent | null {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const heartbeat = data as {
    device_id?: unknown;
    device_name?: unknown;
    last_hr?: unknown;
    last_steps?: unknown;
    last_spo2?: unknown;
    battery_level?: unknown;
    last_seen_at?: unknown;
    updated_at?: unknown;
  };

  const deviceId = safeString(heartbeat.device_id);
  if (!deviceId) {
    return null;
  }

  const deviceName = safeString(heartbeat.device_name) || deviceId;
  const hr = Number(heartbeat.last_hr);
  const steps = Number(heartbeat.last_steps);
  const spo2 = heartbeat.last_spo2;
  const battery = heartbeat.battery_level;
  const recordedAt =
    safeString(heartbeat.last_seen_at) || safeString(heartbeat.updated_at) || new Date().toISOString();

  const hrSafe = Number.isFinite(hr) ? hr : null;
  const stepsSafe = Number.isFinite(steps) ? steps : null;
  const severity: FeedEvent['severity'] =
    hrSafe !== null && hrSafe >= 130 ? 'warn' : 'info';

  return {
    id: `watch-heartbeat-${deviceId}-${safeString(heartbeat.last_seen_at) || Date.now()}`,
    condominiumId: 'all',
    type: 'access',
    severity,
    title: 'Heartbeat do relógio',
    description: `HR ${String(hrSafe ?? '--')} • Passos ${String(stepsSafe ?? '--')} • SpO2 ${String(spo2 ?? '--')} • Bateria ${String(battery ?? '--')}%`,
    tower: 'Vvfit',
    unit: deviceName,
    timestamp: toTimeLabel(recordedAt),
    payload: {
      device_id: deviceId,
      device_name: deviceName,
      hr: hrSafe,
      steps: stepsSafe,
      spo2,
      battery_level: battery,
      recorded_at: recordedAt,
    },
    actions: [{ type: 'acknowledge', label: 'Reconhecer' }],
  };
}

export function useRealtimeFeed(): UseRealtimeFeedResult {
  const wsRef = useRef<WebSocket | null>(null);
  const [events, setEvents] = useState<FeedEvent[]>(() => {
    if (process.env.NEXT_PUBLIC_EDGE_WS_URL || process.env.NEXT_PUBLIC_EDGE_API_URL) {
      return [];
    }
    return mockEvents;
  });
  const [connectionState, setConnectionState] = useState<ConnectionState>(() => {
    if (process.env.NEXT_PUBLIC_EDGE_WS_URL || process.env.NEXT_PUBLIC_EDGE_API_URL) {
      return 'connecting';
    }
    return 'mock';
  });
  const [loading, setLoading] = useState(() =>
    Boolean(process.env.NEXT_PUBLIC_EDGE_WS_URL || process.env.NEXT_PUBLIC_EDGE_API_URL)
  );
  const [error, setError] = useState<string | null>(null);
  const [offlineMode, setOfflineMode] = useState(false);

  const apiBase = useMemo(() => {
    if (typeof window === 'undefined') {
      return '';
    }
    return process.env.NEXT_PUBLIC_EDGE_API_URL || '';
  }, []);

  const wsUrl = useMemo(() => {
    if (typeof window === 'undefined') {
      return null;
    }
    if (process.env.NEXT_PUBLIC_EDGE_WS_URL) {
      return process.env.NEXT_PUBLIC_EDGE_WS_URL;
    }
    return null;
  }, []);

  const feedKey = apiBase ? `${apiBase}/feed?limit=50` : null;
  const {
    data: feedData,
    error: feedError,
    isLoading: feedLoading,
  } = useSWR(
    feedKey,
    async (url: string) => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`EDGE feed respondeu ${response.status}`);
      }
      return response.json() as Promise<{ items?: unknown[] }>;
    },
    {
      refreshInterval: 2000,
      revalidateOnFocus: false,
    }
  );

  useEffect(() => {
    if (!feedData || !Array.isArray(feedData.items)) {
      return;
    }
    const incoming = feedData.items
      .map((item) => parseIncomingEvent(item))
      .filter((item): item is FeedEvent => Boolean(item));

    if (incoming.length === 0) {
      return;
    }

    setEvents((previous) => {
      const byId = new Map<string, FeedEvent>();
      for (const item of [...incoming, ...previous]) {
        byId.set(item.id, item);
      }
      return Array.from(byId.values()).slice(0, 300);
    });

    if (!wsUrl) {
      setConnectionState('online');
      setError(null);
      setLoading(false);
    }
  }, [feedData, wsUrl]);

  useEffect(() => {
    if (!feedError || wsUrl) {
      return;
    }
    setConnectionState('error');
    setError('Falha ao carregar feed do EDGE. Exibindo feed local.');
    setLoading(false);
    setEvents((previous) => (previous.length > 0 ? previous : mockEvents));
  }, [feedError, wsUrl]);

  useEffect(() => {
    if (!wsUrl) {
      if (apiBase) {
        setConnectionState('connecting');
        setLoading(true);
      } else {
        setConnectionState('mock');
        setLoading(false);
      }
      return;
    }

    setConnectionState('connecting');
    setLoading(true);

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnectionState('online');
      setError(null);
      setLoading(false);
    };

    ws.onmessage = (message) => {
      try {
        const parsed = JSON.parse(message.data) as {
          channel?: string;
          data?: unknown;
        };
        if (parsed.channel === 'gateway.ready') {
          const info = parsed.data as { offline_mode?: boolean } | undefined;
          setOfflineMode(Boolean(info?.offline_mode));
          return;
        }
        if (parsed.channel === 'feed.snapshot' && Array.isArray(parsed.data)) {
          const incoming = parsed.data
            .map((item) => parseIncomingEvent(item))
            .filter((item): item is FeedEvent => Boolean(item));
          setEvents((previous) => {
            const byId = new Map<string, FeedEvent>();
            for (const item of [...incoming, ...previous]) {
              byId.set(item.id, item);
            }
            return Array.from(byId.values()).slice(0, 300);
          });
          return;
        }
        if (parsed.channel === 'feed.event') {
          const event = parseIncomingEvent(parsed.data);
          if (!event) {
            return;
          }
          setEvents((previous) => [event, ...previous].slice(0, 300));
          return;
        }

        if (parsed.channel === 'watch.session') {
          const watchSessionEvent = mapWatchSessionToFeedEvent(parsed.data);
          if (!watchSessionEvent) {
            return;
          }
          setEvents((previous) => [watchSessionEvent, ...previous].slice(0, 300));
          return;
        }

        if (parsed.channel === 'watch.heartbeat') {
          const watchHeartbeatEvent = mapWatchHeartbeatToFeedEvent(parsed.data);
          if (!watchHeartbeatEvent) {
            return;
          }
          setEvents((previous) => [watchHeartbeatEvent, ...previous].slice(0, 300));
        }
      } catch (_error) {
        // Ignore malformed WS payloads from unknown channels.
      }
    };

    ws.onerror = () => {
      setConnectionState('error');
      setError('Falha na conexao em tempo real. Exibindo feed local.');
      setLoading(false);
    };

    ws.onclose = () => {
      setConnectionState('offline');
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [apiBase, wsUrl]);

  useEffect(() => {
    if (wsUrl || !apiBase) {
      return;
    }
    setLoading(feedLoading);
  }, [apiBase, feedLoading, wsUrl]);

  const pushLocalEvent = (event: FeedEvent) => {
    setEvents((previous) => [event, ...previous].slice(0, 300));
  };

  const clearFeed = () => {
    setEvents([]);
  };

  return {
    events,
    connectionState,
    loading,
    error,
    offlineMode,
    pushLocalEvent,
    clearFeed,
  };
}
