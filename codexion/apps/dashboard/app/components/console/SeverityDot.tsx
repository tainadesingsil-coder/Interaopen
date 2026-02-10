import { cn } from '@/app/lib/cn';
import type { SeverityLevel } from '@/src/mock/types';

const severityClass: Record<SeverityLevel, string> = {
  info: 'bg-cyan-300',
  warn: 'bg-amber-300',
  critical: 'bg-rose-400',
};

interface SeverityDotProps {
  severity: SeverityLevel;
  pulse?: boolean;
}

export function SeverityDot({ severity, pulse = false }: SeverityDotProps) {
  return (
    <span
      className={cn(
        'inline-block h-2.5 w-2.5 rounded-full',
        severityClass[severity],
        pulse && 'animate-pulse'
      )}
      aria-label={`Severidade ${severity}`}
    />
  );
}
