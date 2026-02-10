'use client';

import type { ComponentType } from 'react';
import {
  Bell,
  DoorOpen,
  Flame,
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

  return (
    <article
      className={cn(
        'border border-zinc-800 bg-zinc-950/70 p-3 transition',
        selected && 'border-cyan-500/50 bg-zinc-900'
      )}
    >
      <button
        type='button'
        className='w-full text-left'
        onClick={() => onSelect(event)}
      >
        <div className='mb-2 flex items-start justify-between gap-2'>
          <div className='flex min-w-0 items-center gap-2'>
            <Icon className='h-4 w-4 shrink-0 text-zinc-300' />
            <h4 className='truncate text-sm font-medium text-zinc-100'>{event.title}</h4>
          </div>
          <span className='text-[11px] text-zinc-500'>{event.timestamp}</span>
        </div>

        <div className='mb-2 flex flex-wrap items-center gap-2'>
          <Badge label={eventLabel[event.type]} variant='neutral' />
          <Badge
            label={event.severity}
            variant={
              event.severity === 'critical'
                ? 'critical'
                : event.severity === 'warn'
                  ? 'warn'
                  : 'info'
            }
            className='uppercase'
          />
          <span className='inline-flex items-center gap-1 text-xs text-zinc-400'>
            <SeverityDot severity={event.severity} pulse={event.severity !== 'info'} />
            {event.tower} / {event.unit}
          </span>
        </div>

        <p className='text-xs text-zinc-400'>{event.description}</p>
      </button>

      <div className='mt-3 flex flex-wrap gap-1.5 border-t border-zinc-800 pt-2'>
        {event.actions.map((action) => (
          <button
            key={`${event.id}-${action.type}`}
            type='button'
            onClick={() => onAction(event, action.type)}
            className={cn(
              'border px-2 py-1 text-[11px] uppercase tracking-[0.12em] transition',
              action.critical
                ? 'border-rose-500/40 text-rose-300 hover:bg-rose-950/40'
                : 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'
            )}
          >
            {actionLabel[action.type]}
          </button>
        ))}
      </div>
    </article>
  );
}
