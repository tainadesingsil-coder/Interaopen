'use client';

import { BellRing, CircleDot, DoorOpen, Fingerprint, UserRound } from 'lucide-react';
import { motion } from 'framer-motion';

import type { AccessEvent, PresenceStatus } from '@/app/components/dashboard/types';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { cn } from '@/app/lib/cn';

interface EventFeedProps {
  events: AccessEvent[];
  onSimulateVisitor: () => void;
}

const severityClasses: Record<PresenceStatus, string> = {
  stable: 'text-emerald-300',
  attention: 'text-amber-300',
  critical: 'text-rose-300',
};

const actionIcon = {
  Entrada: DoorOpen,
  Saida: Fingerprint,
  Interfone: BellRing,
};

const actionBadgeVariant = {
  Entrada: 'default',
  Saida: 'outline',
  Interfone: 'warning',
} as const;

export function EventFeed({ events, onSimulateVisitor }: EventFeedProps) {
  return (
    <section className='rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl'>
      <div className='mb-4 flex items-center justify-between'>
        <div>
          <p className='text-xs uppercase tracking-[0.2em] text-zinc-500'>Tempo Real</p>
          <h3 className='text-lg font-semibold text-zinc-100'>Feed de Eventos</h3>
        </div>
        <Button size='sm' variant='secondary' onClick={onSimulateVisitor}>
          Simular Interfone
        </Button>
      </div>

      <ul className='space-y-2.5'>
        {events.map((event, index) => {
          const Icon = actionIcon[event.action];
          return (
            <motion.li
              key={event.id}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className='rounded-2xl border border-white/10 bg-black/30 p-3'
            >
              <div className='mb-1 flex items-center justify-between gap-3'>
                <div className='flex items-center gap-2'>
                  <Icon className='h-4 w-4 text-zinc-300' />
                  <p className='text-sm font-medium text-zinc-100'>{event.actor}</p>
                </div>
                <p className='text-xs text-zinc-500'>{event.timestamp}</p>
              </div>
              <div className='flex items-center justify-between text-xs'>
                <div className='flex items-center gap-2'>
                  <Badge variant={actionBadgeVariant[event.action]}>{event.action}</Badge>
                  <span className='inline-flex items-center gap-1 text-zinc-400'>
                    <UserRound className='h-3.5 w-3.5' />
                    {event.zone}
                  </span>
                </div>
                <span className={cn('inline-flex items-center gap-1', severityClasses[event.severity])}>
                  <CircleDot className='h-3 w-3' />
                  {event.severity}
                </span>
              </div>
            </motion.li>
          );
        })}
      </ul>
    </section>
  );
}
