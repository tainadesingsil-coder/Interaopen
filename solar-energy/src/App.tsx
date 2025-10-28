import './index.css';
import CodexionHeader from './components/CodexionHeader';
import CodexionHero from './components/CodexionHero';
import CodexionAbout from './components/CodexionAbout';
import CodexionServices from './components/CodexionServices';
import CodexionContact from './components/CodexionContact';

export default function App() {
  return (
    <div className='hero-in-view min-h-screen flex flex-col bg-black'>
      <CodexionHeader />
      <main className='flex-1'>
        <CodexionHero />
        <CodexionAbout />
        <CodexionServices />
        <CodexionContact />
      </main>
      <footer className='footer py-8'>
        <div className='footer-neon-line' />
        <div className='container mx-auto px-4 mt-4'>
          <p className='text-center text-xs md:text-sm text-softGray'>
            © 2025 Codexion7 — IA, Estratégia e Softwares Inteligentes
          </p>
        </div>
      </footer>
    </div>
  );
}
