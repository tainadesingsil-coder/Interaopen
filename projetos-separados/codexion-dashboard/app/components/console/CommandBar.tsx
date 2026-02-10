'use client';

import { Search, Siren, BluetoothSearching, Cpu } from 'lucide-react';

import { Badge } from '@/app/components/console/Badge';
import { SeverityDot } from '@/app/components/console/SeverityDot';

interface CommandBarProps {
  condominiums: string[];
  selectedCondominium: string;
  onSelectCondominium: (value: string) => void;
  edgeOnline: boolean;
  edgePingMs: number;
  bleScanning: boolean;
  activeAlerts: number;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  onEmergencyRequest: () => void;
}

export function CommandBar({
  condominiums,
  selectedCondominium,
  onSelectCondominium,
  edgeOnline,
  edgePingMs,
  bleScanning,
  activeAlerts,
  searchQuery,
  onSearchQueryChange,
  onEmergencyRequest,
}: CommandBarProps) {
  return (
    <header className='fixed inset-x-0 top-0 z-50 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur'>
      <div className='mx-auto grid max-w-[1800px] grid-cols-1 gap-2 px-3 py-2 lg:grid-cols-[220px_220px_160px_130px_minmax(240px,1fr)_220px] lg:items-center'>
        <label className='flex items-center gap-2 border border-zinc-800 bg-zinc-900 px-2 py-1.5 text-xs text-zinc-300'>
          <span className='text-[10px] uppercase tracking-[0.14em] text-zinc-500'>
            Condomínio
          </span>
          <select
            value={selectedCondominium}
            onChange={(event) => onSelectCondominium(event.target.value)}
            className='w-full bg-transparent text-sm text-zinc-100 outline-none'
          >
            {condominiums.map((item) => (
              <option key={item} value={item} className='bg-zinc-900 text-zinc-100'>
                {item}
              </option>
            ))}
          </select>
        </label>

        <div className='flex items-center gap-2 border border-zinc-800 bg-zinc-900 px-2 py-1.5'>
          <Cpu className='h-4 w-4 text-zinc-400' />
          <div className='min-w-0'>
            <p className='text-[10px] uppercase tracking-[0.14em] text-zinc-500'>EDGE</p>
            <p className='text-xs text-zinc-100'>
              {edgeOnline ? 'Online' : 'Offline'} • {edgePingMs}ms
            </p>
          </div>
          <SeverityDot severity={edgeOnline ? 'info' : 'critical'} pulse={!edgeOnline} />
        </div>

        <div className='flex items-center gap-2 border border-zinc-800 bg-zinc-900 px-2 py-1.5'>
          <BluetoothSearching className='h-4 w-4 text-zinc-400' />
          <div>
            <p className='text-[10px] uppercase tracking-[0.14em] text-zinc-500'>BLE</p>
            <p className='text-xs text-zinc-100'>{bleScanning ? 'Scanning ON' : 'Scanning OFF'}</p>
          </div>
        </div>

        <div className='flex items-center justify-between border border-zinc-800 bg-zinc-900 px-2 py-1.5'>
          <span className='text-[10px] uppercase tracking-[0.14em] text-zinc-500'>Alertas</span>
          <Badge
            label={String(activeAlerts)}
            variant={activeAlerts > 0 ? 'critical' : 'success'}
          />
        </div>

        <label className='flex items-center gap-2 border border-zinc-800 bg-zinc-900 px-2 py-1.5'>
          <Search className='h-4 w-4 text-zinc-500' />
          <input
            value={searchQuery}
            onChange={(event) => onSearchQueryChange(event.target.value)}
            placeholder='Buscar morador, unidade ou evento...'
            className='w-full bg-transparent text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none'
          />
        </label>

        <button
          type='button'
          onClick={onEmergencyRequest}
          className='inline-flex items-center justify-center gap-2 border border-rose-500/50 bg-rose-950/40 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-rose-200 transition hover:bg-rose-900/60'
        >
          <Siren className='h-4 w-4' />
          Modo Emergência
        </button>
      </div>
    </header>
  );
}
