'use client';

import { ClipboardList, FileStack, History, Play } from 'lucide-react';

import { Badge } from '@/app/components/console/Badge';
import { PanelSection } from '@/app/components/console/PanelSection';
import { SeverityDot } from '@/app/components/console/SeverityDot';
import type { CommandItem, EventAction, FeedEvent } from '@/src/mock/types';

interface ContextPanelProps {
  selectedEvent: FeedEvent | null;
  relatedEvents: FeedEvent[];
  auditTrail: CommandItem[];
  onActionRequest: (
    event: FeedEvent,
    action: EventAction,
    options: { requireReason: boolean; source: 'context' }
  ) => void;
}

function statusVariant(status: CommandItem['status']) {
  if (status === 'success') return 'success';
  if (status === 'fail') return 'critical';
  if (status === 'running') return 'info';
  return 'warn';
}

export function ContextPanel({
  selectedEvent,
  relatedEvents,
  auditTrail,
  onActionRequest,
}: ContextPanelProps) {
  if (!selectedEvent) {
    return (
      <PanelSection
        title='Contexto do Evento'
        description='Selecione um item da timeline para abrir detalhes.'
        className='h-full min-h-0'
      >
        <div className='flex h-[460px] items-center justify-center rounded border border-[var(--border-subtle)] bg-[var(--bg-primary)] text-sm text-[var(--text-muted)]'>
          Nenhum evento selecionado.
        </div>
      </PanelSection>
    );
  }

  return (
    <div className='space-y-3'>
      <PanelSection title='Evento Selecionado' className='h-auto'>
        <div className='mb-2 flex items-center gap-2'>
          <SeverityDot severity={selectedEvent.severity} pulse />
          <p className='text-sm font-semibold text-[var(--text-primary)]'>{selectedEvent.title}</p>
          <span className='ml-auto text-xs text-[var(--text-muted)]'>{selectedEvent.timestamp}</span>
        </div>
        <p className='mb-2 text-xs text-[var(--text-secondary)]'>{selectedEvent.description}</p>
        <div className='mb-3 flex flex-wrap gap-1.5'>
          <Badge label={selectedEvent.type} variant='neutral' />
          <Badge label={`${selectedEvent.tower}/${selectedEvent.unit}`} variant='info' />
        </div>
        <div className='rounded border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-3'>
          <p className='mb-2 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]'>
            <FileStack className='h-3.5 w-3.5' />
            Payload
          </p>
          <pre className='noc-scroll max-h-52 overflow-auto whitespace-pre-wrap break-all text-[11px] leading-5 text-[var(--text-secondary)]'>
            {JSON.stringify(selectedEvent.payload, null, 2)}
          </pre>
        </div>
      </PanelSection>

      <PanelSection title='Histórico Relacionado' description='Últimos 5 eventos da mesma unidade'>
        {relatedEvents.length === 0 ? (
          <p className='text-xs text-[var(--text-muted)]'>Sem histórico relacionado.</p>
        ) : (
          <ul className='space-y-1.5'>
            {relatedEvents.slice(0, 5).map((item) => (
              <li
                key={item.id}
                className='flex items-center justify-between rounded border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3 py-2'
              >
                <div className='min-w-0'>
                  <p className='truncate text-xs font-semibold text-[var(--text-primary)]'>
                    {item.title}
                  </p>
                  <p className='text-[11px] text-[var(--text-muted)]'>{item.type}</p>
                </div>
                <span className='text-[11px] text-[var(--text-muted)]'>{item.timestamp}</span>
              </li>
            ))}
          </ul>
        )}
      </PanelSection>

      <PanelSection title='Ações Completas' description='Confirmação operacional para execução'>
        <div className='grid gap-1.5'>
          {selectedEvent.actions.map((action) => {
            const requireReason = Boolean(action.critical || selectedEvent.severity === 'critical');
            return (
              <button
                key={`${selectedEvent.id}-${action.type}-context`}
                type='button'
                onClick={() =>
                  onActionRequest(selectedEvent, action, {
                    requireReason,
                    source: 'context',
                  })
                }
                className='inline-flex items-center justify-between rounded border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3 py-2 text-xs text-[var(--text-primary)] transition hover:bg-[var(--bg-hover)]'
              >
                <span>{action.label}</span>
                <span className='inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]'>
                  <Play className='h-3 w-3' />
                  {requireReason ? 'Confirmação + motivo' : 'Confirmar'}
                </span>
              </button>
            );
          })}
        </div>
      </PanelSection>

      <PanelSection title='Audit Trail' description='Operador e status dos comandos executados'>
        {auditTrail.length === 0 ? (
          <p className='text-xs text-[var(--text-muted)]'>Nenhum comando relacionado.</p>
        ) : (
          <ul className='space-y-1.5'>
            {auditTrail.map((command) => (
              <li
                key={command.id}
                className='rounded border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3 py-2'
              >
                <div className='mb-1 flex items-center justify-between gap-2'>
                  <p className='inline-flex items-center gap-1 text-xs font-semibold text-[var(--text-primary)]'>
                    <ClipboardList className='h-3.5 w-3.5 text-[var(--text-muted)]' />
                    {command.type}
                  </p>
                  <Badge label={command.status} variant={statusVariant(command.status)} />
                </div>
                <div className='flex items-center justify-between text-[11px] text-[var(--text-muted)]'>
                  <span className='inline-flex items-center gap-1'>
                    <History className='h-3 w-3' />
                    {command.timestamp}
                  </span>
                  <span>{command.actor}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </PanelSection>
    </div>
  );
}
