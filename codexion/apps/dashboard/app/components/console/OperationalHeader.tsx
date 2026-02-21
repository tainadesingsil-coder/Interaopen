'use client';

import { AlertCircle, BellRing, BluetoothSearching, Cpu, Search, Settings, Siren } from 'lucide-react';

import { Badge } from '@/app/components/console/Badge';
import { SeverityDot } from '@/app/components/console/SeverityDot';

interface OperationalHeaderProps {
  adminName: string;
  condominiums: string[];
  selectedCondominium: string;
  onSelectCondominium: (value: string) => void;
  edgeOnline: boolean;
  edgePingMs: number;
  bleScanning: boolean;
  activeAlerts: number;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  bluetoothSupported: boolean;
  bluetoothConnected: boolean;
  bluetoothConnecting: boolean;
  bluetoothDeviceName: string | null;
  bluetoothHeartbeatAt: string | null;
  bluetoothHr: number | null;
  bluetoothBattery: number | null;
  onBluetoothToggle: () => void;
  onWatchNotification: () => void;
  onEmergencyRequest: () => void;
}

export function OperationalHeader({
  adminName,
  condominiums,
  selectedCondominium,
  onSelectCondominium,
  edgeOnline,
  edgePingMs,
  bleScanning,
  activeAlerts,
  searchQuery,
  onSearchQueryChange,
  bluetoothSupported,
  bluetoothConnected,
  bluetoothConnecting,
  bluetoothDeviceName,
  bluetoothHeartbeatAt,
  bluetoothHr,
  bluetoothBattery,
  onBluetoothToggle,
  onWatchNotification,
  onEmergencyRequest,
}: OperationalHeaderProps) {
  const ledClass = edgeOnline ? 'online' : 'offline';
  const bluetoothStatusLabel = !bluetoothSupported
    ? 'NÃO SUPORTADO'
    : bluetoothConnecting
      ? 'CONECTANDO...'
      : bluetoothConnected
        ? 'CONECTADO'
        : 'DESCONECTADO';

  return (
    <header className='fixed inset-x-0 top-0 z-50 h-16 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]'>
      <div className='mx-auto flex h-full max-w-[1920px] items-center gap-3 px-4'>
        {/* Brand */}
        <div className='flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded bg-gradient-to-br from-[var(--status-info)] to-[#1d4ed8] shadow-[0_10px_40px_rgba(59,130,246,0.18)]'>
            <span className='text-lg font-bold text-white'>C</span>
          </div>
          <div className='hidden sm:block'>
            <div className='text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]'>
              Sistema de Portaria
            </div>
            <div className='text-sm font-semibold text-[var(--text-primary)]'>
              Codexion Security Console
            </div>
          </div>
        </div>

        {/* Session */}
        <div className='hidden md:flex min-w-[160px] flex-col justify-center rounded border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3 py-1.5'>
          <div className='text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]'>
            Sessao
          </div>
          <div className='truncate text-xs text-[var(--text-primary)]'>ADM: {adminName}</div>
        </div>

        {/* Condo select */}
        <label className='hidden lg:flex min-w-[260px] items-center gap-2 rounded border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3 py-2'>
          <span className='text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]'>
            Condomínio
          </span>
          <select
            value={selectedCondominium}
            onChange={(event) => onSelectCondominium(event.target.value)}
            className='w-full bg-transparent text-sm text-[var(--text-primary)] outline-none'
          >
            {condominiums.map((item) => (
              <option key={item} value={item} className='bg-[var(--bg-secondary)] text-[var(--text-primary)]'>
                {item}
              </option>
            ))}
          </select>
        </label>

        {/* Indicators */}
        <div className='ml-auto flex items-center gap-2'>
          <div className='hidden xl:flex items-center gap-2 rounded border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3 py-2'>
            <Cpu className='h-4 w-4 text-[var(--text-muted)]' />
            <div className={`status-led ${ledClass}`} aria-hidden='true' />
            <div className='text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]'>EDGE</div>
            <div className='text-xs font-semibold text-[var(--text-primary)]'>
              {edgeOnline ? 'ONLINE' : 'OFFLINE'}
            </div>
            <div className='text-[11px] text-[var(--text-muted)]'>{edgePingMs}ms</div>
            <SeverityDot severity={edgeOnline ? 'info' : 'critical'} pulse={!edgeOnline} />
          </div>

          <div className='hidden xl:flex items-center gap-2 rounded border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3 py-2'>
            <BluetoothSearching className='h-4 w-4 text-[var(--text-muted)]' />
            <div className='text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]'>BLE</div>
            <div className='text-xs font-semibold text-[var(--text-primary)]'>
              {bleScanning ? 'SCANNING ON' : 'SCANNING OFF'}
            </div>
          </div>

          <button
            type='button'
            onClick={onBluetoothToggle}
            disabled={!bluetoothSupported || bluetoothConnecting}
            className='hidden lg:flex min-w-[210px] flex-col rounded border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3 py-2 text-left transition hover:bg-[var(--bg-hover)] disabled:cursor-not-allowed disabled:opacity-50'
          >
            <div className='text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]'>
              Relógio Vvfit
            </div>
            <div className='text-xs font-semibold text-[var(--text-primary)]'>{bluetoothStatusLabel}</div>
            <div
              className={`mt-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${
                bluetoothConnected ? 'text-[var(--status-online)]' : 'text-[var(--status-info)]'
              }`}
            >
              {bluetoothConnected ? 'Desconectar relógio' : 'Conectar relógio'}
            </div>
            {bluetoothConnected && bluetoothDeviceName ? (
              <div className='truncate text-[11px] text-[var(--text-secondary)]'>{bluetoothDeviceName}</div>
            ) : null}
            {bluetoothConnected ? (
              <div className='truncate text-[11px] text-[var(--text-muted)]'>
                HB {bluetoothHeartbeatAt || '--'} • HR {bluetoothHr ?? '--'} • BAT {bluetoothBattery ?? '--'}%
              </div>
            ) : null}
          </button>

          <div className='hidden md:flex items-center gap-2 rounded border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3 py-2'>
            <AlertCircle className='h-4 w-4 text-[var(--status-offline)]' />
            <div className='text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]'>Alertas</div>
            <Badge
              label={String(activeAlerts)}
              variant={activeAlerts > 0 ? 'critical' : 'success'}
            />
          </div>

          <label className='hidden 2xl:flex w-[320px] items-center gap-2 rounded border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3 py-2'>
            <Search className='h-4 w-4 text-[var(--text-muted)]' />
            <input
              value={searchQuery}
              onChange={(event) => onSearchQueryChange(event.target.value)}
              placeholder='Buscar unidade, visitante, evento...'
              className='w-full bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none'
            />
          </label>

          <button
            type='button'
            onClick={onEmergencyRequest}
            className='inline-flex items-center gap-2 rounded border border-red-700 bg-red-950/40 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-primary)] transition hover:bg-red-900/60'
          >
            <Siren className='h-4 w-4 text-[var(--status-offline)]' />
            Emergência
          </button>

          <button
            type='button'
            onClick={onWatchNotification}
            className='hidden lg:inline-flex items-center gap-2 rounded border border-[var(--status-info)] bg-[var(--bg-primary)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--status-info)] transition hover:bg-[var(--bg-hover)]'
          >
            <BellRing className='h-4 w-4' />
            Notificar relógio
          </button>

          <button
            type='button'
            aria-label='Configurações'
            className='hidden sm:inline-flex h-9 w-9 items-center justify-center rounded border border-[var(--border-subtle)] bg-[var(--bg-primary)] text-[var(--text-secondary)] transition hover:bg-[var(--bg-hover)]'
          >
            <Settings className='h-4 w-4' />
          </button>
        </div>
      </div>
    </header>
  );
}

