'use client';

import { Filter, RefreshCcw } from 'lucide-react';

import { Badge } from '@/app/components/console/Badge';
import { EventRow } from '@/app/components/console/EventRow';
import { PanelSection } from '@/app/components/console/PanelSection';
import type { EventActionType, EventType, FeedEvent } from '@/src/mock/types';

const typeLabel: Record<EventType, string> = {
  intercom: 'Interfone',
  access: 'Acesso',
  patrol: 'Ronda',
  duress: 'Coação',
  emergency: 'Emergência',
};

interface TimelineProps {
  events: FeedEvent[];
  selectedEventId: string | null;
  activeFilters: EventType[];
  loading: boolean;
  error: string | null;
  offlineMode: boolean;
  onToggleFilter: (type: EventType) => void;
  onSelectEvent: (event: FeedEvent) => void;
  onAction: (event: FeedEvent, actionType: EventActionType) => void;
  onClearFeed: () => void;
}

export function Timeline({
  events,
  selectedEventId,
  activeFilters,
  loading,
  error,
  offlineMode,
  onToggleFilter,
  onSelectEvent,
  onAction,
  onClearFeed,
}: TimelineProps) {
  return (
    <PanelSection
      title='Timeline Operacional'
      description='Feed em tempo real de interfone, acesso, ronda, coação e emergência.'
      className='h-full min-h-0'
    >
      <div className='mb-3 flex flex-wrap items-center gap-1.5 border-b border-zinc-800 pb-2'>
        <span className='inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.14em] text-zinc-500'>
          <Filter className='h-3.5 w-3.5' />
          Filtros
        </span>
        {(Object.keys(typeLabel) as EventType[]).map((type) => (
          <button
            key={type}
            type='button'
            onClick={() => onToggleFilter(type)}
            className='transition'
          >
            <Badge
              label={typeLabel[type]}
              variant={activeFilters.includes(type) ? 'info' : 'neutral'}
            />
          </button>
        ))}
        <button
          type='button'
          onClick={onClearFeed}
          className='ml-auto inline-flex items-center gap-1 border border-zinc-700 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-zinc-300 transition hover:bg-zinc-800'
        >
          <RefreshCcw className='h-3.5 w-3.5' />
          Limpar
        </button>
      </div>

      {offlineMode ? (
        <div className='mb-3 border border-amber-600/40 bg-amber-950/20 px-2 py-1 text-xs text-amber-200'>
          Modo offline ativo no EDGE. Exibindo eventos locais.
        </div>
      ) : null}

      {loading ? (
        <div className='flex h-[320px] items-center justify-center border border-zinc-800 bg-zinc-950/30 text-sm text-zinc-400'>
          Carregando feed operacional...
        </div>
      ) : error ? (
        <div className='border border-rose-700/50 bg-rose-950/20 px-3 py-2 text-sm text-rose-200'>
          {error}
        </div>
      ) : events.length === 0 ? (
        <div className='flex h-[320px] items-center justify-center border border-zinc-800 bg-zinc-950/30 text-sm text-zinc-500'>
          Nenhum evento encontrado para o filtro atual.
        </div>
      ) : (
        <div className='noc-scroll max-h-[calc(100vh-270px)] space-y-1.5 overflow-y-auto pr-1'>
          {events.map((event) => (
            <EventRow
              key={event.id}
              event={event}
              selected={selectedEventId === event.id}
              onSelect={onSelectEvent}
              onAction={onAction}
            />
          ))}
        </div>
      )}
    </PanelSection>
  );
}
