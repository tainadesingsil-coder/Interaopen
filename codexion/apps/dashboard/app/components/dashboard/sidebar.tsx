'use client';

import { motion } from 'framer-motion';
import type { ComponentType } from 'react';
import {
  Activity,
  LayoutDashboard,
  MapPinned,
  ShieldCheck,
  UsersRound,
} from 'lucide-react';

import type { DashboardScreen } from '@/app/components/dashboard/types';
import { cn } from '@/app/lib/cn';

interface DashboardSidebarProps {
  activeScreen: DashboardScreen;
  onChangeScreen: (screen: DashboardScreen) => void;
}

const sidebarItems: {
  key: DashboardScreen;
  label: string;
  icon: ComponentType<{ className?: string }>;
}[] = [
  { key: 'overview', label: 'Visao Geral', icon: LayoutDashboard },
  { key: 'people', label: 'Pessoas', icon: UsersRound },
  { key: 'events', label: 'Eventos', icon: ShieldCheck },
  { key: 'map', label: 'Mapa', icon: MapPinned },
];

export function DashboardSidebar({
  activeScreen,
  onChangeScreen,
}: DashboardSidebarProps) {
  return (
    <aside className='relative z-20 w-full border-b border-white/10 bg-white/[0.03] px-4 py-3 backdrop-blur-xl lg:h-[calc(100vh-2rem)] lg:w-72 lg:rounded-3xl lg:border lg:px-3 lg:py-4'>
      <div className='mb-4 hidden items-center gap-3 px-2 lg:flex'>
        <div className='flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-300/30 bg-emerald-400/10'>
          <Activity className='h-5 w-5 text-emerald-300' />
        </div>
        <div>
          <p className='text-xs uppercase tracking-[0.18em] text-zinc-500'>Codexion</p>
          <h1 className='text-lg font-semibold text-zinc-100'>Edge Security OS</h1>
        </div>
      </div>

      <nav className='flex gap-2 overflow-x-auto lg:flex-col lg:gap-1 lg:overflow-visible'>
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeScreen === item.key;
          return (
            <button
              key={item.key}
              type='button'
              onClick={() => onChangeScreen(item.key)}
              className={cn(
                'relative flex min-w-fit items-center gap-2 rounded-xl px-4 py-2.5 text-sm transition-colors lg:w-full',
                isActive
                  ? 'text-zinc-50'
                  : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
              )}
            >
              {isActive ? (
                <motion.span
                  layoutId='active-screen-pill'
                  className='absolute inset-0 rounded-xl border border-emerald-300/30 bg-emerald-400/15'
                  transition={{ type: 'spring', stiffness: 280, damping: 24 }}
                />
              ) : null}
              <Icon className='relative z-[1] h-4 w-4' />
              <span className='relative z-[1] whitespace-nowrap'>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
