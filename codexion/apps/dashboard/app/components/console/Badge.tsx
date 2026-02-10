import { cn } from '@/app/lib/cn';

type Variant = 'neutral' | 'info' | 'warn' | 'critical' | 'success';

const variantClasses: Record<Variant, string> = {
  neutral: 'border-zinc-700 text-zinc-300 bg-zinc-900/70',
  info: 'border-cyan-400/40 text-cyan-300 bg-cyan-950/30',
  warn: 'border-amber-400/40 text-amber-300 bg-amber-950/30',
  critical: 'border-rose-500/50 text-rose-300 bg-rose-950/35',
  success: 'border-emerald-500/40 text-emerald-300 bg-emerald-950/35',
};

interface BadgeProps {
  label: string;
  variant?: Variant;
  className?: string;
}

export function Badge({ label, variant = 'neutral', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center border px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em]',
        variantClasses[variant],
        className
      )}
    >
      {label}
    </span>
  );
}
