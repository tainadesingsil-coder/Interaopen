'use client';

import { Activity, Gauge, HeartHandshake, ShieldAlert } from 'lucide-react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type { MonitoredUser } from '@/app/components/dashboard/types';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/app/components/ui/sheet';
import { Badge } from '@/app/components/ui/badge';

interface VitalsSheetProps {
  user: MonitoredUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VitalsSheet({ user, open, onOpenChange }: VitalsSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side='right' className='w-full sm:max-w-2xl'>
        <SheetHeader>
          <SheetTitle>Painel de Sinais Vitais</SheetTitle>
          <SheetDescription>
            Monitoramento em tempo real de ECG, estresse e pressao arterial.
          </SheetDescription>
        </SheetHeader>

        {!user ? (
          <div className='mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm text-zinc-400'>
            Selecione um usuario para exibir o detalhamento.
          </div>
        ) : (
          <div className='mt-6 space-y-5'>
            <div className='rounded-2xl border border-white/10 bg-white/[0.04] p-4'>
              <div className='mb-4 flex items-center gap-3'>
                <div className='h-12 w-12 overflow-hidden rounded-full border border-white/20'>
                  <img
                    src={user.avatar}
                    alt={`Avatar de ${user.name}`}
                    className='h-full w-full object-cover'
                  />
                </div>
                <div>
                  <p className='text-base font-medium text-zinc-100'>{user.name}</p>
                  <p className='text-sm text-zinc-400'>{user.role}</p>
                </div>
                <Badge className='ml-auto'>{user.location}</Badge>
              </div>

              <div className='grid gap-3 sm:grid-cols-3'>
                <div className='rounded-xl border border-white/10 bg-black/30 p-3'>
                  <p className='mb-1 inline-flex items-center gap-1 text-xs text-zinc-500'>
                    <HeartHandshake className='h-3.5 w-3.5 text-emerald-300' />
                    ECG
                  </p>
                  <p className='text-lg font-semibold text-zinc-100'>{user.heartRate} bpm</p>
                </div>
                <div className='rounded-xl border border-white/10 bg-black/30 p-3'>
                  <p className='mb-1 inline-flex items-center gap-1 text-xs text-zinc-500'>
                    <Gauge className='h-3.5 w-3.5 text-cyan-300' />
                    Estresse
                  </p>
                  <p className='text-lg font-semibold text-zinc-100'>
                    {user.vitalsHistory[user.vitalsHistory.length - 1]?.stress ?? 0}%
                  </p>
                </div>
                <div className='rounded-xl border border-white/10 bg-black/30 p-3'>
                  <p className='mb-1 inline-flex items-center gap-1 text-xs text-zinc-500'>
                    <ShieldAlert className='h-3.5 w-3.5 text-amber-300' />
                    Pressao
                  </p>
                  <p className='text-lg font-semibold text-zinc-100'>
                    {user.vitalsHistory[user.vitalsHistory.length - 1]?.pressure ?? 0} mmHg
                  </p>
                </div>
              </div>
            </div>

            <div className='h-[360px] rounded-2xl border border-white/10 bg-white/[0.03] p-4'>
              <div className='mb-2 flex items-center gap-2 text-sm text-zinc-300'>
                <Activity className='h-4 w-4 text-emerald-300' />
                Curvas Biometricas (ultimas 8h)
              </div>
              <ResponsiveContainer width='100%' height='92%'>
                <LineChart data={user.vitalsHistory}>
                  <CartesianGrid stroke='rgba(255,255,255,0.08)' strokeDasharray='3 3' />
                  <XAxis dataKey='time' tick={{ fill: '#A1A1AA', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#A1A1AA', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(10,10,10,0.9)',
                      border: '1px solid rgba(255,255,255,0.14)',
                      borderRadius: '12px',
                    }}
                    labelStyle={{ color: '#D4D4D8' }}
                  />
                  <Legend wrapperStyle={{ color: '#D4D4D8', fontSize: 12 }} />
                  <Line
                    type='monotone'
                    dataKey='ecg'
                    stroke='#10B981'
                    strokeWidth={2}
                    dot={false}
                    name='ECG'
                  />
                  <Line
                    type='monotone'
                    dataKey='stress'
                    stroke='#22D3EE'
                    strokeWidth={2}
                    dot={false}
                    name='Estresse'
                  />
                  <Line
                    type='monotone'
                    dataKey='pressure'
                    stroke='#F59E0B'
                    strokeWidth={2}
                    dot={false}
                    name='Pressao'
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
