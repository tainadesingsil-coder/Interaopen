'use client';

type Props = {
  error: Error;
  reset: () => void;
};

export default function Error({ error, reset }: Props) {
  return (
    <div className='flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--bg-0)] px-6 text-center text-white'>
      <h2 className='text-2xl font-semibold'>Algo deu errado</h2>
      <p className='max-w-md text-sm text-white/70'>
        {error.message || 'Tente novamente em instantes.'}
      </p>
      <button
        type='button'
        onClick={reset}
        className='rounded-full bg-[var(--gold)] px-6 py-3 text-sm font-semibold text-[#0c1116] transition hover:brightness-110'
      >
        Tentar novamente
      </button>
    </div>
  );
}
