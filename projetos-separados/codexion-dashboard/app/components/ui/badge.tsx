import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/app/lib/cn';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'border-emerald-300/40 bg-emerald-400/20 text-emerald-300',
        warning: 'border-amber-300/40 bg-amber-400/20 text-amber-300',
        danger: 'border-rose-300/40 bg-rose-500/20 text-rose-300',
        outline: 'border-white/20 bg-transparent text-zinc-200',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
