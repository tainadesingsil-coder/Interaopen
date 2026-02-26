'use client';

import { useEffect, useRef, useState } from 'react';
import { Globe } from 'lucide-react';
import type { Locale } from '../lib/i18n';

const localeOptions = [
  { value: 'pt', label: 'PT', name: 'Português' },
  { value: 'en', label: 'EN', name: 'English' },
  { value: 'it', label: 'IT', name: 'Italiano' },
] as const;

type LanguageSwitcherProps = {
  locale: Locale;
  onLocaleChange: (value: Locale) => void;
  ariaLabel: string;
};

export default function LanguageSwitcher({
  locale,
  onLocaleChange,
  ariaLabel,
}: LanguageSwitcherProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
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
    <div ref={containerRef} className='relative z-50'>
      <button
        type='button'
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup='menu'
        aria-expanded={open}
        aria-label={ariaLabel}
        className='inline-flex h-10 items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-white/85 shadow-[0_8px_18px_rgba(5,12,18,0.35)] transition hover:border-[var(--gold)]/60 hover:text-white md:h-9 md:px-2.5'
      >
        <Globe className='h-4 w-4' />
        <span>{locale.toUpperCase()}</span>
      </button>
      {open && (
        <div
          role='menu'
          className='absolute right-0 top-full z-[60] mt-2 flex min-w-[140px] max-w-[calc(100vw-24px)] flex-col items-stretch gap-1 rounded-2xl border border-white/15 bg-[rgba(8,16,24,0.92)] p-1 text-white/85 shadow-[0_12px_30px_rgba(0,0,0,0.35)] backdrop-blur'
        >
          {localeOptions.map((option) => {
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
                className={`inline-flex items-center justify-center rounded-full px-3 py-2 text-[0.55rem] font-semibold tracking-[0.28em] transition ${
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
}
