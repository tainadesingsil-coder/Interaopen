import { Building2, DoorClosed, Shield } from 'lucide-react';

import { PanelSection } from '@/app/components/console/PanelSection';
import type { CondominiumProfile } from '@/src/mock/types';

interface CondominiumOverviewProps {
  condominium: CondominiumProfile;
}

export function CondominiumOverview({ condominium }: CondominiumOverviewProps) {
  return (
    <PanelSection
      title='Contexto do Condominio'
      description='Visao rapida de torres, portoes e equipe de seguranca.'
      className='mb-2'
    >
      <div className='grid gap-2 lg:grid-cols-3'>
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
      </div>
    </PanelSection>
  );
}
