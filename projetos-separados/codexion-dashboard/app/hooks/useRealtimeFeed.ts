'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { mockEvents } from '@/src/mock/events';
import type { FeedEvent } from '@/src/mock/types';

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

function parseIncomingEvent(payload: unknown): FeedEvent | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }
  const candidate = payload as Partial<FeedEvent>;
  if (
    typeof candidate.id !== 'string' ||
    typeof candidate.type !== 'string' ||
    typeof candidate.severity !== 'string' ||
    typeof candidate.title !== 'string' ||
    typeof candidate.timestamp !== 'string'
  ) {
    return null;
  }
  return candidate as FeedEvent;
}

export function useRealtimeFeed(): UseRealtimeFeedResult {
  const wsRef = useRef<WebSocket | null>(null);
  const [events, setEvents] = useState<FeedEvent[]>(mockEvents);
  const [connectionState, setConnectionState] = useState<ConnectionState>('mock');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offlineMode, setOfflineMode] = useState(false);

  const wsUrl = useMemo(() => {
    if (typeof window === 'undefined') {
      return null;
    }
    if (process.env.NEXT_PUBLIC_EDGE_WS_URL) {
      return process.env.NEXT_PUBLIC_EDGE_WS_URL;
    }
    return null;
  }, []);

  useEffect(() => {
    if (!wsUrl) {
      setConnectionState('mock');
      setLoading(false);
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
          setEvents(incoming);
          return;
        }
        if (parsed.channel === 'feed.event') {
          const event = parseIncomingEvent(parsed.data);
          if (!event) {
            return;
          }
          setEvents((previous) => [event, ...previous].slice(0, 300));
        }
      } catch (_error) {
        // Ignore malformed WS payloads from unknown channels.
      }
    };

    ws.onerror = () => {
      setConnectionState('error');
      setError('Falha na conexão em tempo real. Exibindo feed local.');
      setLoading(false);
    };

    ws.onclose = () => {
      setConnectionState('offline');
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [wsUrl]);

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
