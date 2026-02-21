'use client';

import { useEffect, useMemo, useState } from 'react';

type SessionItem = {
  device_id: string;
  device_name: string | null;
  connected: boolean;
  battery_level: number | null;
  last_hr: number | null;
  last_steps: number | null;
  last_spo2: number | null;
  connected_at: string | null;
  disconnected_at: string | null;
  last_seen_at: string | null;
  created_at: string;
  updated_at: string;
};

type LatestTelemetry = {
  id: string;
  device_id: string;
  hr: number;
  steps: number;
  spo2: number | null;
  recorded_at: string;
  ingested_at: string;
};

function safeNumber(value: unknown) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

export function useEdgeWatchSession() {
  const apiBase = useMemo(
    () => process.env.NEXT_PUBLIC_EDGE_API_URL || 'http://localhost:8787',
    []
  );
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [latestTelemetry, setLatestTelemetry] = useState<LatestTelemetry | null>(null);
  const [loading, setLoading] = useState(Boolean(apiBase));
  const [error, setError] = useState<string | null>(null);

  const enabled = apiBase.length > 0;

  const fetchJson = async (path: string, init?: RequestInit) => {
    const response = await fetch(`${apiBase}${path}`, {
      ...init,
      headers: {
        'content-type': 'application/json',
        ...(init?.headers || {}),
      },
    });
    if (!response.ok) {
      throw new Error(`Edge API ${path} respondeu ${response.status}`);
    }
    return response.json();
  };

  const refresh = async () => {
    if (!enabled) {
      return;
    }
    try {
      const [sessionResponse, telemetryResponse] = await Promise.all([
        fetchJson('/watch/session'),
        fetchJson('/telemetry/watch/latest'),
      ]);
      setSessions(Array.isArray(sessionResponse.items) ? sessionResponse.items : []);
      const telemetryItems = Array.isArray(telemetryResponse.items)
        ? telemetryResponse.items
        : [];
      setLatestTelemetry(telemetryItems[0] || null);
      setError(null);
    } catch (unknownError) {
      const message =
        unknownError instanceof Error
          ? unknownError.message
          : 'Falha ao carregar sessao do relogio no EDGE.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    refresh();
    const interval = window.setInterval(() => {
      refresh();
    }, 2500);
    return () => window.clearInterval(interval);
  }, [enabled]);

  const connectSession = async (payload: {
    device_id: string;
    device_name?: string | null;
  }) => {
    if (!enabled) {
      return null;
    }
    const data = await fetchJson('/watch/session/connect', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    await refresh();
    return data;
  };

  const disconnectSession = async (payload: { device_id: string }) => {
    if (!enabled) {
      return null;
    }
    const data = await fetchJson('/watch/session/disconnect', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    await refresh();
    return data;
  };

  const sendHeartbeat = async (payload: {
    device_id: string;
    battery_level?: number | null;
    hr?: number | null;
    steps?: number | null;
    spo2?: number | null;
    timestamp?: string;
  }) => {
    if (!enabled) {
      return null;
    }
    return fetchJson('/watch/heartbeat', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  };

  const sendTelemetry = async (payload: {
    device_id: string;
    hr: number;
    steps: number;
    spo2?: number | null;
    timestamp?: string;
    battery_level?: number | null;
  }) => {
    if (!enabled) {
      return null;
    }
    const data = await fetchJson('/telemetry/watch', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    await refresh();
    return data;
  };

  const activeSession = sessions.find((item) => item.connected) || sessions[0] || null;

  return {
    enabled,
    loading,
    error,
    sessions,
    activeSession,
    latestTelemetry,
    latestHr: safeNumber(latestTelemetry?.hr),
    latestSteps: safeNumber(latestTelemetry?.steps),
    latestSpo2: safeNumber(latestTelemetry?.spo2),
    lastSeenAt: activeSession?.last_seen_at || latestTelemetry?.recorded_at || null,
    connectSession,
    disconnectSession,
    sendHeartbeat,
    sendTelemetry,
    refresh,
  };
}
