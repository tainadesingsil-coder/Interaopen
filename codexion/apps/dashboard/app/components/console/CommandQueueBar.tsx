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
    <aside className='fixed inset-x-0 bottom-0 z-40 border-t border-zinc-800 bg-zinc-950/98'>
      <div className='mx-auto max-w-[1800px] px-3 py-2'>
        <div className='mb-2 flex items-center justify-between'>
          <p className='text-[10px] uppercase tracking-[0.18em] text-zinc-500'>
            Command Queue
          </p>
          <p className='text-[11px] text-zinc-500'>{commands.length} comando(s)</p>
        </div>

        {commands.length === 0 ? (
          <div className='border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-xs text-zinc-500'>
            Fila vazia.
          </div>
        ) : (
          <div className='noc-scroll flex gap-1.5 overflow-x-auto pb-1'>
            {commands.map((command) => (
              <article
                key={command.id}
                className='min-w-[260px] border border-zinc-800 bg-zinc-900/50 px-2 py-2'
              >
                <div className='mb-1 flex items-center justify-between gap-2'>
                  <p className='truncate text-xs text-zinc-200'>{command.type}</p>
                  <Badge label={command.status} variant={statusVariant(command.status)} />
                </div>
                <p className='text-[11px] text-zinc-500'>{command.target}</p>
                <div className='mt-1 flex items-center justify-between'>
                  <span className='text-[11px] text-zinc-500'>{command.timestamp}</span>
                  {command.status === 'fail' ? (
                    <button
                      type='button'
                      onClick={() => onRetryFailed(command)}
                      className='inline-flex items-center gap-1 border border-amber-500/40 px-1.5 py-0.5 text-[10px] uppercase tracking-[0.12em] text-amber-300 transition hover:bg-amber-900/30'
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
