'use client';

import type { ComponentType } from 'react';
import {
  Bell,
  DoorOpen,
  ShieldAlert,
  ShieldCheck,
  Siren,
} from 'lucide-react';

import { Badge } from '@/app/components/console/Badge';
import { SeverityDot } from '@/app/components/console/SeverityDot';
import { cn } from '@/app/lib/cn';
import type { EventActionType, EventType, FeedEvent } from '@/src/mock/types';

const eventIcon: Record<EventType, ComponentType<{ className?: string }>> = {
  intercom: Bell,
  access: DoorOpen,
  patrol: ShieldCheck,
  duress: ShieldAlert,
  emergency: Siren,
};

const eventLabel: Record<EventType, string> = {
  intercom: 'Interfone',
  access: 'Acesso',
  patrol: 'Ronda',
  duress: 'Coação',
  emergency: 'Emergência',
};

const actionLabel: Record<EventActionType, string> = {
  approve: 'Aprovar',
  deny: 'Recusar',
  open_gate: 'Abrir portão',
  view_camera: 'Ver câmera',
  create_incident: 'Criar ocorrência',
  acknowledge: 'Reconhecer',
};

interface EventRowProps {
  event: FeedEvent;
  selected: boolean;
  onSelect: (event: FeedEvent) => void;
  onAction: (event: FeedEvent, actionType: EventActionType) => void;
}

export function EventRow({ event, selected, onSelect, onAction }: EventRowProps) {
  const Icon = eventIcon[event.type];
  const severityClass =
    event.severity === 'critical' ? 'critical' : event.severity === 'warn' ? 'warning' : 'info';

  return (
    <article
      className={cn(
        'timeline-event flex flex-col gap-2 rounded border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-3',
        severityClass,
        selected && 'border-[var(--status-info)] bg-[var(--bg-hover)]'
      )}
    >
      <button
        type='button'
        className='flex w-full min-w-0 items-start gap-3 text-left'
        onClick={() => onSelect(event)}
      >
        <div className='w-[84px] shrink-0 text-[11px] text-[var(--text-muted)]'>
          {event.timestamp}
        </div>

        <div className='mt-0.5 shrink-0'>
          <Icon className='h-4 w-4 text-[var(--text-secondary)]' />
        </div>

        <div className='min-w-0 flex-1'>
          <div className='flex flex-wrap items-center gap-2'>
            <span className='truncate text-sm font-semibold text-[var(--text-primary)]'>
              {event.title}
            </span>
            <Badge label={eventLabel[event.type]} variant='neutral' />
            <Badge label={`${event.tower}/${event.unit}`} variant='info' />
            <span className='inline-flex items-center gap-1 text-[11px] text-[var(--text-muted)]'>
              <SeverityDot severity={event.severity} pulse={event.severity !== 'info'} />
              {event.severity.toUpperCase()}
            </span>
          </div>

          <p className='mt-1 text-xs text-[var(--text-secondary)]'>{event.description}</p>
        </div>
      </button>

      <div className='flex flex-wrap gap-2 border-t border-[var(--border-subtle)] pt-2'>
        {event.actions.map((action) => (
          <button
            key={`${event.id}-${action.type}`}
            type='button'
            onClick={(clickEvent) => {
              clickEvent.stopPropagation();
              onAction(event, action.type);
            }}
            className={cn(
              'rounded border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] transition',
              action.critical
                ? 'border-red-700 bg-red-950/30 text-red-200 hover:bg-red-900/40'
                : 'border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
            )}
          >
            {actionLabel[action.type]}
          </button>
        ))}
      </div>
    </article>
  );
}
