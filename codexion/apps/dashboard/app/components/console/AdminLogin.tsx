'use client';

import { LockKeyhole, ShieldCheck } from 'lucide-react';

interface AdminLoginProps {
  username: string;
  password: string;
  loading: boolean;
  error: string | null;
  onUsernameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: () => void;
}

export function AdminLogin({
  username,
  password,
  loading,
  error,
  onUsernameChange,
  onPasswordChange,
  onSubmit,
}: AdminLoginProps) {
  return (
    <main className='flex min-h-screen items-center justify-center bg-[#070a0d] px-4 py-10 text-zinc-100'>
      <section className='w-full max-w-md border border-zinc-800 bg-zinc-950/95 p-5 shadow-[0_20px_80px_rgba(0,0,0,0.55)]'>
        <header className='mb-4 border-b border-zinc-800 pb-3'>
          <p className='text-[10px] uppercase tracking-[0.16em] text-zinc-500'>Console Operacional</p>
          <h1 className='mt-1 text-xl font-semibold'>Acesso ADM</h1>
          <p className='mt-1 text-sm text-zinc-400'>
            Entre com credenciais de administrador para acessar a portaria.
          </p>
        </header>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
          }}
          className='space-y-3'
        >
          <div className='space-y-1'>
            <label className='text-[11px] uppercase tracking-[0.14em] text-zinc-500'>Usuário</label>
            <input
              value={username}
              onChange={(event) => onUsernameChange(event.target.value)}
              placeholder='ADM'
              className='w-full border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none'
            />
          </div>

          <div className='space-y-1'>
            <label className='text-[11px] uppercase tracking-[0.14em] text-zinc-500'>Senha</label>
            <input
              type='password'
              value={password}
              onChange={(event) => onPasswordChange(event.target.value)}
              placeholder='******'
              className='w-full border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none'
            />
          </div>

          {error ? (
            <p className='border border-rose-600/40 bg-rose-950/30 px-2 py-1 text-xs text-rose-300'>
              {error}
            </p>
          ) : null}

          <button
            type='submit'
            disabled={loading}
            className='inline-flex w-full items-center justify-center gap-2 border border-cyan-400/40 bg-cyan-900/30 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-200 transition hover:bg-cyan-800/40 disabled:opacity-45'
          >
            {loading ? <LockKeyhole className='h-4 w-4 animate-pulse' /> : <ShieldCheck className='h-4 w-4' />}
            {loading ? 'Entrando...' : 'Entrar no Console'}
          </button>
        </form>

        <footer className='mt-4 border-t border-zinc-800 pt-3 text-xs text-zinc-500'>
          Demo inicial: usuario <strong>ADM</strong> e senha <strong>123456</strong>.
        </footer>
      </section>
    </main>
  );
}
