'use client';

import { Activity, AlertTriangle, LayoutGrid, Route, Shield, Users } from 'lucide-react';
import type { ComponentType } from 'react';
import { useMemo, useState } from 'react';

import { cn } from '@/app/lib/cn';

type NavKey = 'overview' | 'timeline' | 'residents' | 'security' | 'incidents' | 'patrols';

const items: Array<{
  id: NavKey;
  label: string;
  Icon: ComponentType<{ className?: string }>;
}> = [
  { id: 'overview', label: 'Visão Geral', Icon: LayoutGrid },
  { id: 'timeline', label: 'Timeline', Icon: Activity },
  { id: 'residents', label: 'Moradores', Icon: Users },
  { id: 'security', label: 'Segurança', Icon: Shield },
  { id: 'incidents', label: 'Ocorrências', Icon: AlertTriangle },
  { id: 'patrols', label: 'Rondas', Icon: Route },
];

interface OperationalSidebarProps {
  adminName: string;
  activeAlerts: number;
  bluetoothSupported: boolean;
  bluetoothConnected: boolean;
  bluetoothConnecting: boolean;
  bluetoothDeviceName: string | null;
  onBluetoothToggle: () => void;
  onWatchNotification: () => void;
  onLogout: () => void;
}

export function OperationalSidebar({
  adminName,
  activeAlerts,
  bluetoothSupported,
  bluetoothConnected,
  bluetoothConnecting,
  bluetoothDeviceName,
  onBluetoothToggle,
  onWatchNotification,
  onLogout,
}: OperationalSidebarProps) {
  const [active, setActive] = useState<NavKey>('timeline');

  const badgeByKey = useMemo(() => {
    return {
      incidents: activeAlerts,
    } as Partial<Record<NavKey, number>>;
  }, [activeAlerts]);

  return (
    <aside className='hidden h-[calc(100vh-64px)] w-[240px] shrink-0 border-r border-[var(--border-subtle)] bg-[var(--bg-secondary)] lg:block'>
      <div className='flex h-full flex-col'>
        <div className='border-b border-[var(--border-subtle)] p-4'>
          <div className='text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]'>
            Sessão
          </div>
          <div className='mt-1 text-sm font-semibold text-[var(--text-primary)]'>
            ADM: {adminName || 'ADM'}
          </div>
          <button
            type='button'
            onClick={onLogout}
            className='mt-3 inline-flex w-full items-center justify-center rounded border border-red-700 bg-red-950/30 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-red-200 transition hover:bg-red-900/40'
          >
            Encerrar sessão
          </button>

          <div className='mt-3 rounded border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-2'>
            <div className='text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]'>
              Relógio Vvfit
            </div>
            <div className='mt-1 text-xs font-semibold text-[var(--text-primary)]'>
              {!bluetoothSupported
                ? 'NÃO SUPORTADO'
                : bluetoothConnecting
                  ? 'CONECTANDO...'
                  : bluetoothConnected
                    ? 'CONECTADO'
                    : 'DESCONECTADO'}
            </div>
            {bluetoothDeviceName ? (
              <div className='mt-1 truncate text-[11px] text-[var(--text-secondary)]'>
                {bluetoothDeviceName}
              </div>
            ) : null}
            <button
              type='button'
              onClick={onBluetoothToggle}
              disabled={!bluetoothSupported || bluetoothConnecting}
              className='mt-2 inline-flex w-full items-center justify-center rounded border border-[var(--status-info)] bg-[var(--bg-secondary)] px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--status-info)] transition hover:bg-[var(--bg-hover)] disabled:cursor-not-allowed disabled:opacity-50'
            >
              {bluetoothConnected ? 'Desconectar relógio' : 'Conectar relógio'}
            </button>

            <button
              type='button'
              onClick={onWatchNotification}
              className='mt-2 inline-flex w-full items-center justify-center rounded border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)] transition hover:bg-[var(--bg-hover)]'
            >
              Enviar notificação
            </button>
          </div>
        </div>

        <nav className='flex-1 space-y-1 p-3'>
          {items.map(({ id, label, Icon }) => {
            const badge = badgeByKey[id];
            return (
              <button
                key={id}
                type='button'
                onClick={() => setActive(id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded px-3 py-2.5 text-left text-sm font-medium transition',
                  active === id
                    ? 'border border-blue-600 bg-blue-600/20 text-[var(--text-primary)]'
                    : 'border border-transparent text-[var(--text-secondary)] hover:border-[var(--border-subtle)] hover:bg-[var(--bg-hover)]/30'
                )}
              >
                <Icon className='h-5 w-5' />
                <span className='flex-1'>{label}</span>
                {typeof badge === 'number' && badge > 0 ? (
                  <span className='rounded border border-red-700 bg-red-950/40 px-2 py-0.5 text-xs font-bold text-red-200'>
                    {badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        <div className='border-t border-[var(--border-subtle)] p-4 text-[11px] text-[var(--text-muted)]'>
          v0.1 • console operacional
        </div>
      </div>
    </aside>
  );
}

