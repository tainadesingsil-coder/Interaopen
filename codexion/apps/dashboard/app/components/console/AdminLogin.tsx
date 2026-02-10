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
    <main className='flex min-h-screen items-center justify-center bg-[var(--bg-primary)] px-4 py-10 text-[var(--text-primary)]'>
      <section className='w-full max-w-md rounded border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.55)]'>
        <header className='mb-5 border-b border-[var(--border-subtle)] pb-4'>
          <p className='text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]'>
            Console Operacional 24/7
          </p>
          <h1 className='mt-2 text-2xl font-semibold tracking-tight'>Acesso ADM</h1>
          <p className='mt-2 text-sm text-[var(--text-secondary)]'>
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
            <label className='text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]'>
              Usuário
            </label>
            <input
              value={username}
              onChange={(event) => onUsernameChange(event.target.value)}
              placeholder='ADM'
              className='w-full rounded border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--border-strong)] focus:outline-none'
            />
          </div>

          <div className='space-y-1'>
            <label className='text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]'>
              Senha
            </label>
            <input
              type='password'
              value={password}
              onChange={(event) => onPasswordChange(event.target.value)}
              placeholder='******'
              className='w-full rounded border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--border-strong)] focus:outline-none'
            />
          </div>

          {error ? (
            <p className='rounded border border-[var(--status-offline)] bg-[var(--bg-primary)] px-3 py-2 text-xs text-[var(--status-offline)]'>
              {error}
            </p>
          ) : null}

          <button
            type='submit'
            disabled={loading}
            className='inline-flex w-full items-center justify-center gap-2 rounded border border-[var(--status-info)] bg-[var(--bg-primary)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--status-info)] transition hover:bg-[var(--bg-hover)] disabled:opacity-45'
          >
            {loading ? <LockKeyhole className='h-4 w-4 animate-pulse' /> : <ShieldCheck className='h-4 w-4' />}
            {loading ? 'Entrando...' : 'Entrar no Console'}
          </button>
        </form>

        <footer className='mt-5 border-t border-[var(--border-subtle)] pt-4 text-xs text-[var(--text-muted)]'>
          Demo inicial: usuario <strong>ADM</strong> e senha <strong>123456</strong>.
        </footer>
      </section>
    </main>
  );
}
