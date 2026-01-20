import type { Metadata } from 'next';
import { Inter, Manrope } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Bella Vista Beach Residence | Bahia',
  description:
    'Studios e apartamentos com localização estratégica no litoral sul da Bahia. Atendimento consultivo via WhatsApp.',
  openGraph: {
    title: 'Bella Vista Beach Residence | Bahia',
    description:
      'Investimento imobiliário estratégico no litoral sul da Bahia, com alto potencial de valorização.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='pt-BR'>
      <body className={`${inter.className} ${manrope.variable}`}>{children}</body>
    </html>
  );
}
