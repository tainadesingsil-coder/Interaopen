'use client';

import { motion } from 'framer-motion';
import { Radar, Warehouse } from 'lucide-react';

import type { MapAgent, PresenceStatus } from '@/app/components/dashboard/types';
import { cn } from '@/app/lib/cn';

interface SecurityMapProps {
  agents: MapAgent[];
  compact?: boolean;
}

const statusDot: Record<PresenceStatus, string> = {
  stable: 'bg-emerald-400',
  attention: 'bg-amber-300',
  critical: 'bg-rose-500',
};

export function SecurityMap({ agents, compact = false }: SecurityMapProps) {
  return (
    <section className='rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl'>
      <div className='mb-4 flex items-center justify-between'>
        <div>
          <p className='text-xs uppercase tracking-[0.2em] text-zinc-500'>Tracking Indoor</p>
          <h3 className='text-lg font-semibold text-zinc-100'>Mapa de Seguranca</h3>
        </div>
        <div className='inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-zinc-300'>
          <Radar className='h-3.5 w-3.5 text-cyan-300' />
          RSSI + BLE Beacons
        </div>
      </div>

      <div
        className={cn(
          'relative overflow-hidden rounded-2xl border border-white/10 bg-[#0a0f0d]',
          compact ? 'h-[260px]' : 'h-[380px]'
        )}
      >
        <div className='absolute inset-0 opacity-35'>
          <div className='absolute left-[6%] top-[8%] h-[28%] w-[28%] rounded-2xl border border-white/10' />
          <div className='absolute left-[38%] top-[8%] h-[24%] w-[56%] rounded-2xl border border-white/10' />
          <div className='absolute left-[6%] top-[42%] h-[50%] w-[42%] rounded-2xl border border-white/10' />
          <div className='absolute left-[52%] top-[38%] h-[54%] w-[42%] rounded-2xl border border-white/10' />
          <div className='absolute inset-x-0 top-[34%] h-[1px] bg-white/10' />
          <div className='absolute left-[34%] top-0 h-full w-[1px] bg-white/10' />
        </div>

        <div className='absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-2.5 py-1 text-[11px] text-zinc-300'>
          <Warehouse className='h-3.5 w-3.5 text-emerald-300' />
          Planta baixa - condominio/fabrica
        </div>

        {agents.map((agent) => (
          <motion.div
            key={agent.id}
            className='absolute'
            animate={{
              left: `${agent.x}%`,
              top: `${agent.y}%`,
            }}
            transition={{
              type: 'spring',
              damping: 24,
              stiffness: 120,
            }}
            style={{ translateX: '-50%', translateY: '-50%' }}
          >
            <div className='relative'>
              <span
                className={cn(
                  'absolute -inset-2 rounded-full opacity-30 blur-sm',
                  statusDot[agent.status]
                )}
              />
              <div className='relative flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/60 text-xs text-zinc-100'>
                {agent.name.charAt(0)}
              </div>
              <span
                className={cn(
                  'absolute -bottom-1 -right-1 h-2.5 w-2.5 rounded-full border border-black',
                  statusDot[agent.status]
                )}
              />
            </div>
          </motion.div>
        ))}
      </div>

      <div className='mt-4 flex flex-wrap gap-4 text-xs text-zinc-400'>
        <span className='inline-flex items-center gap-1.5'>
          <span className='h-2.5 w-2.5 rounded-full bg-emerald-400' />
          Estavel
        </span>
        <span className='inline-flex items-center gap-1.5'>
          <span className='h-2.5 w-2.5 rounded-full bg-amber-300' />
          Atencao
        </span>
        <span className='inline-flex items-center gap-1.5'>
          <span className='h-2.5 w-2.5 rounded-full bg-rose-500' />
          Critico
        </span>
      </div>
    </section>
  );
}
