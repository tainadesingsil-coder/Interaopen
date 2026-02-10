import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

export const Button = ({ children, className, ...props }: Props) => (
  <button
    {...props}
    className={`inline-flex items-center justify-center rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/60 ${className ?? ''}`}
  >
    {children}
  </button>
);
