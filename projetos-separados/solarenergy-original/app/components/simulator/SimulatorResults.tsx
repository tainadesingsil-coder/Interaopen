'use client';

import { Clock, Coins, TrendingUp, Wallet } from 'lucide-react';

type Props = {
  revenueLabel: string;
  profitLabel: string;
  annualReturnLabel: string;
  paybackLabel: string;
  revenueValue: string;
  profitValue: string;
  annualReturnValue: string;
  paybackValue: string;
};

export const SimulatorResults = ({
  revenueLabel,
  profitLabel,
  annualReturnLabel,
  paybackLabel,
  revenueValue,
  profitValue,
  annualReturnValue,
  paybackValue,
}: Props) => (
  <div className='grid grid-cols-2 gap-3'>
    <div className='panel-strong flex items-center gap-3 px-3 py-2.5 text-white/80'>
      <span className='inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-[var(--gold)]'>
        <Coins className='h-4 w-4' />
      </span>
      <div>
        <p className='text-[9px] uppercase tracking-[0.2em] text-white/50'>
          {revenueLabel}
        </p>
        <p className='mt-1 text-base font-semibold text-white'>{revenueValue}</p>
      </div>
    </div>
    <div className='panel-strong flex items-center gap-3 px-3 py-2.5 text-white/80'>
      <span className='inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-[var(--gold)]'>
        <Wallet className='h-4 w-4' />
      </span>
      <div>
        <p className='text-[9px] uppercase tracking-[0.2em] text-white/50'>
          {profitLabel}
        </p>
        <p className='mt-1 text-base font-semibold text-white'>{profitValue}</p>
      </div>
    </div>
    <div className='panel-strong flex items-center gap-3 px-3 py-2.5 text-white/80'>
      <span className='inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-[var(--gold)]'>
        <TrendingUp className='h-4 w-4' />
      </span>
      <div>
        <p className='text-[9px] uppercase tracking-[0.2em] text-white/50'>
          {annualReturnLabel}
        </p>
        <p className='mt-1 text-base font-semibold text-white'>{annualReturnValue}</p>
      </div>
    </div>
    <div className='panel-strong flex items-center gap-3 px-3 py-2.5 text-white/80'>
      <span className='inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-[var(--gold)]'>
        <Clock className='h-4 w-4' />
      </span>
      <div>
        <p className='text-[9px] uppercase tracking-[0.2em] text-white/50'>
          {paybackLabel}
        </p>
        <p className='mt-1 text-base font-semibold text-white'>{paybackValue}</p>
      </div>
    </div>
  </div>
);
