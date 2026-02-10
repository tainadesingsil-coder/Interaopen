'use client';

import { motion } from 'framer-motion';
import { MapPin, HeartPulse } from 'lucide-react';

import { Badge } from '@/app/components/ui/badge';
import type { MonitoredUser, PresenceStatus } from '@/app/components/dashboard/types';
import { cn } from '@/app/lib/cn';

interface UserStatusListProps {
  users: MonitoredUser[];
  onSelectUser: (user: MonitoredUser) => void;
}

const statusStyles: Record<PresenceStatus, string> = {
  stable: 'bg-emerald-400 shadow-[0_0_0_8px_rgba(16,185,129,0.15)]',
  attention: 'bg-amber-400 shadow-[0_0_0_8px_rgba(251,191,36,0.14)]',
  critical: 'bg-rose-500 shadow-[0_0_0_8px_rgba(244,63,94,0.16)]',
};

const statusLabel: Record<PresenceStatus, string> = {
  stable: 'Estavel',
  attention: 'Atencao',
  critical: 'Critico',
};

const badgeVariant: Record<PresenceStatus, 'default' | 'warning' | 'danger'> = {
  stable: 'default',
  attention: 'warning',
  critical: 'danger',
};

export function UserStatusList({ users, onSelectUser }: UserStatusListProps) {
  return (
    <ul className='space-y-3'>
      {users.map((user, index) => (
        <motion.li
          key={user.id}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 * index }}
        >
          <button
            type='button'
            onClick={() => onSelectUser(user)}
            className='group w-full rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-left transition hover:border-white/25 hover:bg-white/[0.06]'
          >
            <div className='flex items-start gap-3'>
              <div className='relative h-12 w-12 overflow-hidden rounded-full border border-white/20 bg-zinc-800/80'>
                <img
                  src={user.avatar}
                  alt={`Avatar de ${user.name}`}
                  className='h-full w-full object-cover'
                />
                <span
                  className={cn(
                    'absolute bottom-1 right-1 h-2.5 w-2.5 rounded-full animate-pulse',
                    statusStyles[user.status]
                  )}
                />
              </div>
              <div className='min-w-0 flex-1'>
                <div className='mb-1 flex items-center justify-between gap-2'>
                  <p className='truncate text-sm font-medium text-zinc-100'>{user.name}</p>
                  <Badge variant={badgeVariant[user.status]}>{statusLabel[user.status]}</Badge>
                </div>
                <p className='text-xs text-zinc-400'>{user.role}</p>
                <div className='mt-2 flex flex-wrap items-center gap-3 text-xs text-zinc-300'>
                  <span className='inline-flex items-center gap-1'>
                    <HeartPulse className='h-3.5 w-3.5 text-emerald-300' />
                    {user.heartRate} bpm
                  </span>
                  <span>{user.spo2}% SpO2</span>
                  <span className='inline-flex items-center gap-1 text-zinc-400'>
                    <MapPin className='h-3.5 w-3.5' />
                    {user.location}
                  </span>
                </div>
              </div>
            </div>
          </button>
        </motion.li>
      ))}
    </ul>
  );
}
