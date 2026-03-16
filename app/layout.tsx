import type { Metadata } from 'next';
import { Syne } from 'next/font/google';
import './globals.css';
const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  weight: ['700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'CODEXION | Portfolio',
  description: 'Interface moderna de portfólio com sidebar animada e visual premium.',
  keywords: ['codexion', 'portfolio', 'next.js', 'interface', 'design'],
  authors: [{ name: 'CODEXION' }],
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'CODEXION',
    title: 'CODEXION | Portfolio',
    description: 'Portfólio CODEXION com navegação lateral e apresentação de projetos.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CODEXION | Portfolio',
    description: 'Nova interface de portfólio para a marca CODEXION.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='pt-BR'>
      <body className={`${syne.className} ${syne.variable}`}>
        {children}
      </body>
    </html>
  );
}
