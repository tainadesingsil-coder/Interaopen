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
  };
}

export function CondominiumOverview({
  condominium,
  watchTelemetry,
}: CondominiumOverviewProps) {
  return (
    <PanelSection
      title='Contexto do Condominio'
      description='Visao rapida de torres, portoes, equipe e telemetria operacional do relogio.'
      className='mb-2'
    >
      <div className='grid gap-2 lg:grid-cols-4'>
        <div className='border border-zinc-800 bg-zinc-950/50 p-2'>
          <p className='mb-1 inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.12em] text-zinc-500'>
            <Building2 className='h-3.5 w-3.5' />
            Torres
          </p>
          <ul className='space-y-1 text-xs text-zinc-300'>
            {condominium.towers.map((tower) => (
              <li key={tower} className='border border-zinc-800 bg-zinc-900/60 px-2 py-1'>
                {tower}
              </li>
            ))}
          </ul>
        </div>

        <div className='border border-zinc-800 bg-zinc-950/50 p-2'>
          <p className='mb-1 inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.12em] text-zinc-500'>
            <DoorClosed className='h-3.5 w-3.5' />
            Nomes de portoes
          </p>
          <ul className='space-y-1 text-xs text-zinc-300'>
            {condominium.gates.map((gate) => (
              <li key={gate} className='border border-zinc-800 bg-zinc-900/60 px-2 py-1'>
                {gate}
              </li>
            ))}
          </ul>
        </div>

        <div className='border border-zinc-800 bg-zinc-950/50 p-2'>
          <p className='mb-1 inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.12em] text-zinc-500'>
            <Shield className='h-3.5 w-3.5' />
            Equipe de seguranca
          </p>
          <ul className='space-y-1 text-xs text-zinc-300'>
            {condominium.securityTeam.map((agent) => (
              <li key={agent} className='border border-zinc-800 bg-zinc-900/60 px-2 py-1'>
                {agent}
              </li>
            ))}
          </ul>
        </div>

        <div className='border border-zinc-800 bg-zinc-950/50 p-2'>
          <p className='mb-1 inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.12em] text-zinc-500'>
            <Watch className='h-3.5 w-3.5' />
            Telemetria do relogio
          </p>
          <div className='space-y-1 text-xs'>
            <div className='border border-zinc-800 bg-zinc-900/60 px-2 py-1 text-zinc-300'>
              Estado: {watchTelemetry.connected ? 'Conectado' : 'Desconectado'}
            </div>
            <div className='border border-zinc-800 bg-zinc-900/60 px-2 py-1 text-zinc-300'>
              Dispositivo: {watchTelemetry.deviceName || '--'}
            </div>
            <div className='grid grid-cols-2 gap-1'>
              <div className='border border-zinc-800 bg-zinc-900/60 px-2 py-1 text-zinc-300'>
                <Activity className='mr-1 inline h-3 w-3 text-emerald-400' />
                HR {watchTelemetry.hr ?? '--'}
              </div>
              <div className='border border-zinc-800 bg-zinc-900/60 px-2 py-1 text-zinc-300'>
                SpO2 {watchTelemetry.spo2 ?? '--'}
              </div>
            </div>
            <div className='grid grid-cols-2 gap-1'>
              <div className='border border-zinc-800 bg-zinc-900/60 px-2 py-1 text-zinc-300'>
                Passos {watchTelemetry.steps ?? '--'}
              </div>
              <div className='border border-zinc-800 bg-zinc-900/60 px-2 py-1 text-zinc-300'>
                <Battery className='mr-1 inline h-3 w-3 text-zinc-400' />
                {watchTelemetry.battery ?? '--'}%
              </div>
            </div>
            <div className='border border-zinc-800 bg-zinc-900/60 px-2 py-1 text-zinc-400'>
              Ultimo heartbeat: {watchTelemetry.lastSeenAt || '--'}
            </div>
          </div>
        </div>
      </div>
    </PanelSection>
  );
}
