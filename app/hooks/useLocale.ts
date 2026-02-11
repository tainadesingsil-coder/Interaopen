import { useEffect, useState } from 'react';
import type { Locale } from '@/app/types';

const STORAGE_KEY = 'bella-vista-locale-v2';

export const useLocale = (initialLocale: Locale = 'pt') => {
  const [locale, setLocale] = useState<Locale>(initialLocale);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === 'pt' || saved === 'en' || saved === 'it') {
      setLocale(saved);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, locale);
  }, [locale]);

  return { locale, setLocale };
};
