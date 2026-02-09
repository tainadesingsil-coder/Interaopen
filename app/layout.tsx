import type { Metadata } from 'next';
import { Inter, Sora } from 'next/font/google';
import './globals.css';
import { StructuredData } from '@/app/components/shared/StructuredData';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://bellavistaresidence.com.br';

export const metadata: Metadata = {
  title:
    'Bella Vista Beach Residence | Investimento Imobiliário no Litoral Sul da Bahia',
  description:
    'Stúdios e apartamentos de 2 e 3 quartos com infraestrutura de resort em Coroa Vermelha. Alto potencial de valorização e rentabilidade garantida.',
  keywords: [
    'bella vista',
    'coroa vermelha',
    'investimento imobiliário',
    'litoral bahia',
    'apartamento praia',
  ],
  authors: [{ name: 'Bella Vista Beach Residence' }],
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: siteUrl,
    siteName: 'Bella Vista Beach Residence',
    title: 'Bella Vista Beach Residence | Bahia',
    description: 'Investimento imobiliário estratégico no Litoral Sul da Bahia',
    images: [
      {
        url: `${siteUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'Bella Vista Beach Residence',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bella Vista Beach Residence | Bahia',
    description: 'Investimento imobiliário estratégico no Litoral Sul da Bahia',
    images: [`${siteUrl}/twitter-image.jpg`],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: siteUrl,
    languages: {
      'pt-BR': siteUrl,
      en: `${siteUrl}/en`,
      it: `${siteUrl}/it`,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='pt-BR'>
      <body className={`${inter.className} ${sora.variable}`}>
        <a href='#main-content' className='skip-link'>
          Skip to content
        </a>
        <StructuredData />
        {children}
      </body>
    </html>
  );
}
