'use client';

import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

interface HealthStatusRingProps {
  score: number;
  onlineNodes: number;
  totalNodes: number;
}

export function HealthStatusRing({
  score,
  onlineNodes,
  totalNodes,
}: HealthStatusRingProps) {
  const normalized = Math.max(0, Math.min(100, score));
  const radius = 66;
  const circumference = 2 * Math.PI * radius;
  const dashoffset = circumference - (normalized / 100) * circumference;

  return (
    <div className='relative flex items-center justify-center'>
      <svg viewBox='0 0 180 180' className='h-44 w-44'>
        <defs>
          <linearGradient id='ringGradient' x1='0%' y1='0%' x2='100%' y2='100%'>
            <stop offset='0%' stopColor='#10b981' />
            <stop offset='100%' stopColor='#22d3ee' />
          </linearGradient>
        </defs>
        <circle
          cx='90'
          cy='90'
          r={radius}
          stroke='rgba(255,255,255,0.1)'
          strokeWidth='12'
          fill='none'
        />
        <motion.circle
          cx='90'
          cy='90'
          r={radius}
          stroke='url(#ringGradient)'
          strokeWidth='12'
          strokeLinecap='round'
          fill='none'
          transform='rotate(-90 90 90)'
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: dashoffset }}
          transition={{ duration: 1.25, ease: 'easeOut' }}
          style={{ strokeDasharray: circumference }}
        />
      </svg>

      <div className='absolute inset-0 flex flex-col items-center justify-center'>
        <div className='mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-white/5'>
          <Shield className='h-4 w-4 text-emerald-300' />
        </div>
        <p className='text-3xl font-semibold text-zinc-100'>{normalized}%</p>
        <p className='text-xs uppercase tracking-[0.2em] text-zinc-400'>Saude da Rede</p>
      </div>

      <div className='absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full border border-white/10 bg-black/50 px-3 py-1 text-xs text-zinc-300'>
        {onlineNodes}/{totalNodes} nodes online
      </div>
    </div>
  );
}
