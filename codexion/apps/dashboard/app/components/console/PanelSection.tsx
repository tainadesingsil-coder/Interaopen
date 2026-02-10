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
    <section
      className={cn(
        'flex flex-col border border-[var(--border-subtle)] bg-[var(--bg-secondary)] shadow-[0_18px_50px_rgba(0,0,0,0.25)]',
        className
      )}
    >
      <header className='border-b border-[var(--border-subtle)] px-4 py-3'>
        <h3 className='text-sm font-semibold uppercase tracking-[0.14em] text-[var(--text-primary)]'>
          {title}
        </h3>
        {description ? (
          <p className='mt-1 text-xs text-[var(--text-secondary)]'>{description}</p>
        ) : null}
      </header>
      <div className='min-h-0 flex-1 p-4'>{children}</div>
    </section>
  );
}
