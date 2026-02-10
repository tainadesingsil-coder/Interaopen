import { cn } from '@/app/lib/cn';

type Variant = 'neutral' | 'info' | 'warn' | 'critical' | 'success';

const variantClasses: Record<Variant, string> = {
  neutral:
    'border-[var(--border-subtle)] text-[var(--text-secondary)] bg-[var(--bg-primary)]',
  info:
    'border-[var(--status-info)] text-[var(--status-info)] bg-[var(--bg-primary)]',
  warn:
    'border-[var(--status-warning)] text-[var(--status-warning)] bg-[var(--bg-primary)]',
  critical:
    'border-[var(--status-offline)] text-[var(--status-offline)] bg-[var(--bg-primary)]',
  success:
    'border-[var(--status-online)] text-[var(--status-online)] bg-[var(--bg-primary)]',
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
        'inline-flex items-center border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] font-mono',
        variantClasses[variant],
        className
      )}
    >
      {label}
    </span>
  );
}
