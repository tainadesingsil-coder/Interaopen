'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { Locale } from '@/app/types';
import { LanguageSwitcher } from '@/app/components/shared/LanguageSwitcher';

type Props = {
  labels: {
    location: string;
    works: string;
    investment: string;
    contact: string;
    languageLabel: string;
  };
  whatsappLink: string;
  menuLabel: string;
  menuAria: string;
  locale: Locale;
  onLocaleChange: (value: Locale) => void;
};

export const Navigation = ({
  labels,
  whatsappLink,
  menuLabel,
  menuAria,
  locale,
  onLocaleChange,
}: Props) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className='fixed inset-x-0 top-0 z-50 bg-[#07131D]/85 backdrop-blur-lg shadow-[0_8px_24px_rgba(5,12,18,0.35)] md:bg-[rgba(8,18,28,0.65)]'>
      <nav className='mx-auto flex max-w-6xl items-center justify-between px-6 py-4 text-white lg:py-6'>
        <Image
          src='/logo.png'
          alt='Bella Vista'
          width={160}
          height={48}
          className='h-8 w-auto md:h-9 lg:h-10'
          priority
        />
        <div className='hidden items-center gap-6 text-xs uppercase tracking-[0.28em] text-white/80 md:flex lg:gap-8 lg:text-white/90'>
          <a
            href='#localizacao'
            className='transition hover:text-[#B7925A] hover:drop-shadow-[0_0_10px_rgba(183,146,90,0.55)]'
          >
            {labels.location}
          </a>
          <a
            href='#obra'
            className='transition hover:text-[#B7925A] hover:drop-shadow-[0_0_10px_rgba(183,146,90,0.55)]'
          >
            {labels.works}
          </a>
          <a
            href='#perfil'
            className='transition hover:text-[#B7925A] hover:drop-shadow-[0_0_10px_rgba(183,146,90,0.55)]'
          >
            {labels.investment}
          </a>
          <a
            href={whatsappLink}
            target='_blank'
            rel='noreferrer'
            className='transition hover:text-[#B7925A] hover:drop-shadow-[0_0_10px_rgba(183,146,90,0.55)]'
          >
            {labels.contact}
          </a>
          <LanguageSwitcher
            locale={locale}
            onLocaleChange={onLocaleChange}
            ariaLabel={labels.languageLabel}
          />
        </div>
        <div className='flex items-center gap-3 md:hidden'>
          <LanguageSwitcher
            locale={locale}
            onLocaleChange={onLocaleChange}
            ariaLabel={labels.languageLabel}
            buttonClassName='h-10 w-10'
          />
          <button
            type='button'
            aria-label={menuAria}
            aria-expanded={menuOpen}
            aria-controls='hero-menu'
            onClick={() => setMenuOpen((open) => !open)}
            className='inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs uppercase tracking-[0.3em] text-white/85 transition hover:text-white'
          >
            {menuLabel}
          </button>
        </div>
      </nav>
      {menuOpen && (
        <div
          id='hero-menu'
          className='md:hidden border-t border-white/10 bg-white/10 backdrop-blur-lg'
        >
          <div className='flex flex-col gap-4 px-6 py-4 text-xs uppercase tracking-[0.28em] text-white/75'>
            <a
              href='#localizacao'
              className='transition hover:text-[#B7925A] hover:drop-shadow-[0_0_10px_rgba(183,146,90,0.55)]'
              onClick={() => setMenuOpen(false)}
            >
              {labels.location}
            </a>
            <a
              href='#obra'
              className='transition hover:text-[#B7925A] hover:drop-shadow-[0_0_10px_rgba(183,146,90,0.55)]'
              onClick={() => setMenuOpen(false)}
            >
              {labels.works}
            </a>
            <a
              href='#perfil'
              className='transition hover:text-[#B7925A] hover:drop-shadow-[0_0_10px_rgba(183,146,90,0.55)]'
              onClick={() => setMenuOpen(false)}
            >
              {labels.investment}
            </a>
            <a
              href={whatsappLink}
              target='_blank'
              rel='noreferrer'
              className='transition hover:text-[#B7925A] hover:drop-shadow-[0_0_10px_rgba(183,146,90,0.55)]'
              onClick={() => setMenuOpen(false)}
            >
              {labels.contact}
            </a>
            <LanguageSwitcher
              locale={locale}
              onLocaleChange={onLocaleChange}
              ariaLabel={labels.languageLabel}
              className='mt-2 w-fit'
            />
          </div>
        </div>
      )}
    </header>
  );
};
