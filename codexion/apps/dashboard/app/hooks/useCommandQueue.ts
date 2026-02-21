'use client';

import { useMemo } from 'react';
import useSWR from 'swr';

import { mockCommands } from '@/src/mock/commands';
import type { CommandItem } from '@/src/mock/types';

type EdgeCommand = {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  status: 'pending' | 'dispatched' | 'success' | 'failed';
  created_at: string;
  updated_at: string;
};

const DEFAULT_CONDO_ID = 'bella-vista';

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

function mapStatus(statusRaw: EdgeCommand['status']): CommandItem['status'] {
  if (statusRaw === 'pending') return 'pending';
  if (statusRaw === 'dispatched') return 'running';
  if (statusRaw === 'success') return 'success';
  return 'fail';
}

function safeString(value: unknown) {
  return typeof value === 'string' ? value : '';
}

function mapEdgeCommand(command: EdgeCommand): CommandItem {
  const payload = command.payload || {};
  const target =
    safeString(payload.target) ||
    safeString(payload.scope) ||
    safeString(payload.device_id) ||
    safeString(payload.route_id) ||
    'N/A';
  const condoId =
    safeString(payload.condominium_id) || safeString(payload.condominiumId) || DEFAULT_CONDO_ID;
  const actor = safeString(payload.actor) || 'EDGE';
  const notes =
    safeString(payload.reason) ||
    safeString(payload.summary) ||
    safeString(payload.intercom_event_id) ||
    undefined;

  return {
    id: command.id,
    condominiumId: condoId,
    type: command.type,
    target,
    timestamp: toTimeLabel(command.updated_at || command.created_at),
    status: mapStatus(command.status),
    actor,
    notes,
  };
}

export function useCommandQueue(options?: { limit?: number; statuses?: string }) {
  const apiBase = useMemo(
    () => process.env.NEXT_PUBLIC_EDGE_API_URL || 'http://localhost:8787',
    []
  );
  const enabled = apiBase.length > 0;
  const limit = options?.limit ?? 20;
  const statuses = options?.statuses ?? 'pending,failed,dispatched';

  const key = enabled ? `${apiBase}/commands?status=${encodeURIComponent(statuses)}&limit=${limit}` : null;

  const swr = useSWR(
    key,
    async (url: string) => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`EDGE commands respondeu ${response.status}`);
      }
      return response.json() as Promise<{ items?: EdgeCommand[] }>;
    },
    {
      refreshInterval: 1000,
      revalidateOnFocus: false,
    }
  );

  const commands = useMemo(() => {
    if (!enabled) {
      return mockCommands;
    }
    const items = Array.isArray(swr.data?.items) ? swr.data?.items : [];
    return items.map(mapEdgeCommand);
  }, [enabled, swr.data]);

  return {
    enabled,
    commands,
    loading: enabled && swr.isLoading,
    error: swr.error ? String(swr.error?.message || 'Falha ao carregar comandos do EDGE.') : null,
    mutate: swr.mutate,
  };
}
