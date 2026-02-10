import { cn } from '@/app/lib/cn';

interface PanelSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function PanelSection({
  title,
  description,
  children,
  className,
}: PanelSectionProps) {
  return (
    <section className={cn('border border-zinc-800 bg-zinc-950/40', className)}>
      <header className='border-b border-zinc-800 px-3 py-2'>
        <h3 className='text-sm font-semibold text-zinc-100'>{title}</h3>
        {description ? (
          <p className='mt-0.5 text-xs text-zinc-400'>{description}</p>
        ) : null}
      </header>
      <div className='p-3'>{children}</div>
    </section>
  );
}
