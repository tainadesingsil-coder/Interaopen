import { cn } from '@/app/lib/cn';
import type { SeverityLevel } from '@/src/mock/types';

const severityClass: Record<SeverityLevel, string> = {
  info: 'bg-[var(--status-info)] text-[var(--status-info)]',
  warn: 'bg-[var(--status-warning)] text-[var(--status-warning)]',
  critical: 'bg-[var(--status-offline)] text-[var(--status-offline)]',
};

interface SeverityDotProps {
  severity: SeverityLevel;
  pulse?: boolean;
}

export function SeverityDot({ severity, pulse = false }: SeverityDotProps) {
  return (
    <span
      className={cn(
        'inline-block h-2.5 w-2.5 rounded-full shadow-[0_0_8px_currentColor]',
        severityClass[severity],
        pulse && 'animate-pulse'
      )}
      aria-label={`Severidade ${severity}`}
    />
  );
}
