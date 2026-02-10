import type { Metadata } from 'next';
import { Geist, Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-display',
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
      <body className={`${inter.className} ${geist.variable}`}>
        <a href='#main-content' className='skip-link'>
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
