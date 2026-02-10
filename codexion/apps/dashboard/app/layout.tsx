import type { Metadata } from 'next';
import './globals.css';
import './styles/operational-theme.css';

import { IBM_Plex_Mono } from 'next/font/google';

const operationalMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-operational',
  display: 'swap',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://codexion.local';

export const metadata: Metadata = {
  title: 'Codexion | Dashboard de Portaria para Condominio',
  description:
    'Dashboard dark para operacao da portaria com visao separada entre moradores e seguranca.',
  keywords: [
    'codexion',
    'portaria',
    'condominio',
    'dashboard dark',
    'seguranca patrimonial',
    'smartwatch',
  ],
  authors: [{ name: 'Codexion Labs' }],
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: siteUrl,
    siteName: 'Codexion',
    title: 'Codexion Security OS',
    description: 'Portaria digital com controle de acessos e monitoramento em tempo real.',
    images: [
      {
        url: `${siteUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'Codexion Dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Codexion Security OS',
    description: 'Dashboard de portaria com visao clara de moradores e seguranca.',
    images: [`${siteUrl}/twitter-image.jpg`],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='pt-BR'>
      <body className={operationalMono.variable}>
        <a href='#main-content' className='skip-link'>
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
