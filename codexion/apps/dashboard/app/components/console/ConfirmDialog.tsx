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
    <div className='fixed inset-0 z-[110] flex items-center justify-center bg-black/75 p-4'>
      <div className='w-full max-w-lg rounded border border-[var(--border-strong)] bg-[var(--bg-secondary)] shadow-[0_30px_90px_rgba(0,0,0,0.7)]'>
        <header className='border-b border-[var(--border-subtle)] px-5 py-4'>
          <h3 className='text-base font-semibold text-[var(--text-primary)]'>{title}</h3>
          {description ? (
            <p className='mt-1 text-sm text-[var(--text-secondary)]'>{description}</p>
          ) : null}
        </header>

        <div className='space-y-4 p-5'>
          {requireReason ? (
            <div className='space-y-1'>
              <label className='text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]'>
                Motivo (obrigatório)
              </label>
              <textarea
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                rows={4}
                className='w-full resize-none rounded border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--border-strong)] focus:outline-none'
                placeholder='Descreva objetivamente o motivo operacional...'
              />
            </div>
          ) : null}

          <div className='flex justify-end gap-2'>
            <button
              type='button'
              onClick={onCancel}
              className='rounded border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)] transition hover:bg-[var(--bg-hover)]'
            >
              {cancelLabel}
            </button>
            <button
              type='button'
              onClick={() => onConfirm(reason.trim())}
              disabled={disabled}
              className={cn(
                'rounded px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition disabled:cursor-not-allowed disabled:opacity-40',
                danger
                  ? 'bg-red-700 text-white hover:bg-red-600'
                  : 'bg-[var(--status-info)] text-black hover:opacity-90'
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
