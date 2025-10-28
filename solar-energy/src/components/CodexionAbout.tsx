export default function CodexionAbout() {
  const img =
    'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?q=80&w=1600&auto=format&fit=crop';
  return (
    <section id="sobre" className="py-16 md:py-24">
      <div className="container mx-auto px-4 grid md:grid-cols-2 gap-8 md:gap-12 items-center">
        <div>
          <h2 className="section-title text-softWhite">Sobre a @codexion7</h2>
          <p className="section-subtitle mt-3">
            A @codexion7 é uma empresa de tecnologia estratégica que une inteligência
            artificial, performance e automação para transformar empresas em potências digitais.
            Nosso foco é simples: gerar resultado real.
          </p>
        </div>
        <div className="relative">
          <div className="absolute -inset-4 rounded-3xl bg-neon/10 blur-2xl" />
          <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-md">
            <img
              src={img}
              alt="Humanoide metálico analisando holograma verde"
              className="w-full h-[320px] md:h-[420px] object-cover"
              style={{ objectPosition: '50% 45%' }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
