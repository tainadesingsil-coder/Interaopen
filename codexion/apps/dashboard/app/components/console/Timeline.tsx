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
      <div className='flex h-full min-h-0 flex-col'>
        <div className='mb-3 flex flex-wrap items-center gap-2 border-b border-[var(--border-subtle)] pb-3'>
          <span className='inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]'>
          <Filter className='h-3.5 w-3.5' />
          Filtros
        </span>
        {(Object.keys(typeLabel) as EventType[]).map((type) => (
          <button
            key={type}
            type='button'
            onClick={() => onToggleFilter(type)}
            className='transition hover:opacity-90'
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
          className='ml-auto inline-flex items-center gap-1 rounded border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)] transition hover:bg-[var(--bg-hover)]'
        >
          <RefreshCcw className='h-3.5 w-3.5' />
          Limpar
        </button>
        </div>

        {offlineMode ? (
          <div className='mb-3 rounded border border-[var(--status-warning)] bg-[var(--bg-primary)] px-3 py-2 text-xs text-[var(--status-warning)]'>
            Modo offline ativo no EDGE. Exibindo eventos locais.
          </div>
        ) : null}

        {loading ? (
          <div className='flex flex-1 items-center justify-center rounded border border-[var(--border-subtle)] bg-[var(--bg-primary)] text-sm text-[var(--text-secondary)]'>
            Carregando feed operacional...
          </div>
        ) : error ? (
          <div className='rounded border border-[var(--status-offline)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--status-offline)]'>
            {error}
          </div>
        ) : events.length === 0 ? (
          <div className='flex flex-1 items-center justify-center rounded border border-[var(--border-subtle)] bg-[var(--bg-primary)] text-sm text-[var(--text-muted)]'>
            Nenhum evento encontrado para o filtro atual.
          </div>
        ) : (
          <div className='noc-scroll min-h-0 flex-1 space-y-2 overflow-y-auto pr-1'>
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
      </div>
    </PanelSection>
  );
}
