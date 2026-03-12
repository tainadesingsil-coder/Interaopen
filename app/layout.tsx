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
  title: 'ENIGMA | Assistente de Voz',
  description:
    'ENIGMA é um assistente de voz futurista com reconhecimento de fala, Gemini e resposta em voz sintetizada.',
  keywords: ['enigma', 'assistente de voz', 'next.js', 'gemini', 'speech api'],
  authors: [{ name: 'ENIGMA' }],
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'ENIGMA',
    title: 'ENIGMA | Assistente de Voz',
    description: 'Fale com o ENIGMA e receba respostas em voz alta.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ENIGMA | Assistente de Voz',
    description: 'Reconhecimento de voz e respostas com Gemini.',
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
