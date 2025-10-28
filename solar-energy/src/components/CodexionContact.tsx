import { MessageCircle } from 'lucide-react';

export default function CodexionContact() {
  return (
    <section id="contato" className="relative py-20 md:py-28 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[320px] w-[320px] rounded-full bg-neon/25 blur-3xl animate-pulseGreen" />
      </div>
      <div className="container mx-auto px-4 relative z-10 text-center">
        <h3 className="text-2xl md:text-3xl font-bold text-softWhite">
          O futuro não espera. Quem domina a IA, lidera.
        </h3>
        <a
          href="https://wa.me/5538999266004?text=Quero%20elevar%20meu%20neg%C3%B3cio%20com%20IA%20%40codexion7"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-neon px-8 py-3 font-semibold text-black shadow-[0_10px_22px_rgba(158,255,0,0.25)] hover:scale-[1.02] transition"
        >
          <MessageCircle className="h-5 w-5" />
          Fale com um especialista
        </a>
      </div>
    </section>
  );
}
