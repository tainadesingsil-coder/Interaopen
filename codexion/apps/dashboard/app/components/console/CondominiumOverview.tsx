import { Activity, Battery, Building2, DoorClosed, Shield, Watch } from 'lucide-react';

import { PanelSection } from '@/app/components/console/PanelSection';
import type { CondominiumProfile } from '@/src/mock/types';

interface CondominiumOverviewProps {
  condominium: CondominiumProfile;
  watchTelemetry: {
    connected: boolean;
    deviceName: string | null;
    hr: number | null;
    spo2: number | null;
    steps: number | null;
    battery: number | null;
    lastSeenAt: string | null;
    warning?: string | null;
  };
}

export function CondominiumOverview({
  condominium,
  watchTelemetry,
}: CondominiumOverviewProps) {
  const towersCount = condominium.towers.length;
  const gatesCount = condominium.gates.length;
  const teamCount = condominium.securityTeam.length;
  const watchConnected = watchTelemetry.connected;

  const watchHrLabel = watchTelemetry.hr === null || watchTelemetry.hr === undefined ? '--' : String(watchTelemetry.hr);
  const watchBatteryLabel =
    watchTelemetry.battery === null || watchTelemetry.battery === undefined
      ? '--'
      : `${watchTelemetry.battery}%`;

  return (
    <PanelSection
      title='Visão Operacional'
      description='Resumo do condomínio, gates, equipe e telemetria do relógio.'
      className='mb-3'
    >
      <div className='grid gap-3 lg:grid-cols-4'>
        <div className='rounded border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-4'>
          <div className='mb-2 flex items-center justify-between'>
            <div className='text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]'>
              Torres
            </div>
            <Building2 className='h-4 w-4 text-[var(--text-muted)]' />
          </div>
          <div className='metric-value text-[var(--status-info)]'>{towersCount}</div>
          <div className='mt-1 text-xs text-[var(--text-secondary)]'>
            {condominium.towers.join(' • ')}
          </div>
        </div>

        <div className='rounded border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-4'>
          <div className='mb-2 flex items-center justify-between'>
            <div className='text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]'>
              Portões
            </div>
            <DoorClosed className='h-4 w-4 text-[var(--text-muted)]' />
          </div>
          <div className='metric-value text-[var(--status-info)]'>{gatesCount}</div>
          <div className='mt-1 text-xs text-[var(--text-secondary)]'>
            {condominium.gates.slice(0, 3).join(' • ')}
            {condominium.gates.length > 3 ? ' • ...' : ''}
          </div>
        </div>

        <div className='rounded border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-4'>
          <div className='mb-2 flex items-center justify-between'>
            <div className='text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]'>
              Equipe
            </div>
            <Shield className='h-4 w-4 text-[var(--text-muted)]' />
          </div>
          <div className='metric-value text-[var(--status-online)]'>{teamCount}</div>
          <div className='mt-1 text-xs text-[var(--text-secondary)]'>
            {condominium.securityTeam.slice(0, 3).join(' • ')}
            {condominium.securityTeam.length > 3 ? ' • ...' : ''}
          </div>
        </div>

        <div className='rounded border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-4'>
          <div className='mb-2 flex items-center justify-between'>
            <div className='text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]'>
              Relógio
            </div>
            <Watch className='h-4 w-4 text-[var(--text-muted)]' />
          </div>

          <div className='flex items-end justify-between gap-3'>
            <div>
              <div
                className={
                  watchConnected
                    ? 'metric-value text-[var(--status-online)]'
                    : 'metric-value text-[var(--text-muted)]'
                }
              >
                {watchHrLabel}
                <span className='ml-2 text-xs text-[var(--text-muted)]'>BPM</span>
              </div>
              <div className='mt-1 text-xs text-[var(--text-secondary)]'>
                {watchConnected ? 'CONECTADO' : 'DESCONECTADO'} • BAT {watchBatteryLabel}
              </div>
            </div>

            <div className='text-right text-[11px] text-[var(--text-muted)]'>
              <div className='inline-flex items-center gap-1'>
                <Activity className='h-3.5 w-3.5' />
                SpO2 {watchTelemetry.spo2 ?? '--'}
              </div>
              <div className='mt-1 inline-flex items-center gap-1'>
                <Battery className='h-3.5 w-3.5' />
                {watchTelemetry.lastSeenAt ? `HB ${watchTelemetry.lastSeenAt}` : 'HB --'}
              </div>
            </div>
          </div>

          {watchTelemetry.deviceName ? (
            <div className='mt-2 truncate text-[11px] text-[var(--text-muted)]'>
              {watchTelemetry.deviceName}
            </div>
          ) : null}
          {watchTelemetry.warning ? (
            <div className='mt-2 rounded border border-[var(--status-warning)] bg-[var(--bg-secondary)] px-2 py-1 text-[11px] text-[var(--status-warning)]'>
              {watchTelemetry.warning}
            </div>
          ) : null}
        </div>
      </div>
    </PanelSection>
  );
}
