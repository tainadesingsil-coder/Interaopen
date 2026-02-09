import type { ReactNode } from 'react';

type Props = {
  id?: string;
  className?: string;
  children: ReactNode;
};

export const Section = ({ id, className, children }: Props) => (
  <section id={id} className={className}>
    {children}
  </section>
);
