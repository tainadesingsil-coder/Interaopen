'use client';

import { Toaster as SonnerToaster } from 'sonner';

export function Toaster() {
  return (
    <SonnerToaster
      theme='dark'
      richColors
      position='top-right'
      toastOptions={{
        style: {
          background: 'rgba(19, 22, 19, 0.88)',
          border: '1px solid rgba(255,255,255,0.12)',
          color: '#EDEDED',
          backdropFilter: 'blur(18px)',
        },
      }}
    />
  );
}
