'use client';

import { useEffect, useState } from 'react';

import { cn } from '@/app/lib/cn';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  requireReason?: boolean;
  danger?: boolean;
  onCancel: () => void;
  onConfirm: (reason: string) => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  requireReason = false,
  danger = false,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (!open) {
      setReason('');
    }
  }, [open]);

  if (!open) {
    return null;
  }

  const disabled = requireReason && reason.trim().length < 4;

  return (
    <div className='fixed inset-0 z-[110] flex items-center justify-center bg-black/70 p-4'>
      <div className='w-full max-w-lg border border-zinc-700 bg-zinc-950 shadow-[0_20px_70px_rgba(0,0,0,0.6)]'>
        <header className='border-b border-zinc-800 px-4 py-3'>
          <h3 className='text-base font-semibold text-zinc-100'>{title}</h3>
          {description ? (
            <p className='mt-1 text-sm text-zinc-400'>{description}</p>
          ) : null}
        </header>

        <div className='space-y-3 p-4'>
          {requireReason ? (
            <div className='space-y-1'>
              <label className='text-xs uppercase tracking-[0.14em] text-zinc-500'>
                Motivo (obrigatório)
              </label>
              <textarea
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                rows={4}
                className='w-full resize-none border border-zinc-700 bg-zinc-900/70 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none'
                placeholder='Descreva objetivamente o motivo operacional...'
              />
            </div>
          ) : null}

          <div className='flex justify-end gap-2'>
            <button
              type='button'
              onClick={onCancel}
              className='border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs font-medium uppercase tracking-[0.12em] text-zinc-300 transition hover:bg-zinc-800'
            >
              {cancelLabel}
            </button>
            <button
              type='button'
              onClick={() => onConfirm(reason.trim())}
              disabled={disabled}
              className={cn(
                'px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition disabled:cursor-not-allowed disabled:opacity-40',
                danger
                  ? 'bg-rose-600 text-white hover:bg-rose-500'
                  : 'bg-cyan-500 text-black hover:bg-cyan-400'
              )}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
