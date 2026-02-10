'use client';

import { RotateCcw } from 'lucide-react';

import { Badge } from '@/app/components/console/Badge';
import type { CommandItem } from '@/src/mock/types';

interface CommandQueueBarProps {
  commands: CommandItem[];
  onRetryFailed: (command: CommandItem) => void;
}

function statusVariant(status: CommandItem['status']) {
  if (status === 'success') return 'success';
  if (status === 'fail') return 'critical';
  if (status === 'running') return 'info';
  return 'warn';
}

export function CommandQueueBar({ commands, onRetryFailed }: CommandQueueBarProps) {
  return (
    <aside className='fixed inset-x-0 bottom-0 z-40 h-20 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)]'>
      <div className='mx-auto flex h-full max-w-[1920px] flex-col justify-center px-4 py-3'>
        <div className='mb-2 flex items-center justify-between'>
          <p className='text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]'>
            Command Queue
          </p>
          <p className='text-[11px] text-[var(--text-muted)]'>{commands.length} comando(s)</p>
        </div>

        {commands.length === 0 ? (
          <div className='rounded border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3 py-2 text-xs text-[var(--text-muted)]'>
            Fila vazia.
          </div>
        ) : (
          <div className='noc-scroll flex gap-2 overflow-x-auto pb-1'>
            {commands.map((command) => (
              <article
                key={command.id}
                className='min-w-[280px] rounded border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3 py-2'
              >
                <div className='mb-1 flex items-center justify-between gap-2'>
                  <p className='truncate text-xs font-semibold text-[var(--text-primary)]'>
                    {command.type}
                  </p>
                  <Badge label={command.status} variant={statusVariant(command.status)} />
                </div>
                <p className='text-[11px] text-[var(--text-secondary)]'>{command.target}</p>
                <div className='mt-1 flex items-center justify-between'>
                  <span className='text-[11px] text-[var(--text-muted)]'>{command.timestamp}</span>
                  {command.status === 'fail' ? (
                    <button
                      type='button'
                      onClick={() => onRetryFailed(command)}
                      className='inline-flex items-center gap-1 rounded border border-[var(--status-warning)] bg-[var(--bg-secondary)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--status-warning)] transition hover:bg-[var(--bg-hover)]'
                    >
                      <RotateCcw className='h-3 w-3' />
                      Retry
                    </button>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
