'use client';

import { useEffect, useRef, useState } from 'react';
import { Globe } from 'lucide-react';
import type { Locale } from '@/app/types';
import { languageOptions } from '@/app/lib/constants';

type Props = {
  locale: Locale;
  onLocaleChange: (value: Locale) => void;
  ariaLabel: string;
  className?: string;
  buttonClassName?: string;
};

export const LanguageSwitcher = ({
  locale,
  onLocaleChange,
  ariaLabel,
  className,
  buttonClassName,
}: Props) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return undefined;
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div ref={containerRef} className={`relative ${className ?? ''}`}>
      <button
        type='button'
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup='menu'
        aria-expanded={open}
        aria-label={ariaLabel}
        className={`inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white/90 shadow-[0_8px_18px_rgba(5,12,18,0.35)] transition hover:border-[var(--gold)]/50 hover:text-white ${buttonClassName ?? ''}`}
      >
        <Globe className='h-4 w-4' />
      </button>
      {open && (
        <div
          className='absolute right-0 z-50 mt-2 flex items-center gap-1 rounded-full border border-white/15 bg-[rgba(8,16,24,0.92)] p-1 text-white/85 shadow-[0_12px_30px_rgba(0,0,0,0.35)] backdrop-blur'
          role='menu'
        >
          {languageOptions.map((option) => {
            const isActive = locale === option.value;
            return (
              <button
                key={option.value}
                type='button'
                onClick={() => {
                  onLocaleChange(option.value);
                  setOpen(false);
                }}
                aria-pressed={isActive}
                aria-label={`${ariaLabel}: ${option.name}`}
                title={option.name}
                className={`inline-flex items-center rounded-full px-2.5 py-1 text-[0.55rem] font-semibold tracking-[0.28em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/50 ${
                  isActive
                    ? 'bg-[var(--gold)]/25 text-white shadow-[0_0_14px_rgba(201,164,106,0.35)]'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
                role='menuitemradio'
              >
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
