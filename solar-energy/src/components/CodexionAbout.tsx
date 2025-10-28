export default function CodexionAbout() {
  const img =
    'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?q=80&w=1600&auto=format&fit=crop';
  return (
    <section id="sobre" className="py-16 md:py-24 bg-black relative overflow-hidden">
      <div className="container mx-auto px-4 grid md:grid-cols-2 gap-8 md:gap-12 items-center">
        <div>
          <h2 className="section-title text-softWhite">Nosso DNA é entender o seu.</h2>
          <p className="section-subtitle mt-3">
            Diagnóstico inteligente que identifica o estágio da sua empresa e traça um plano de ação estratégico.
          </p>
          {/* Mini wizard (simplified placeholder) */}
          <form className="mt-6 grid gap-3 max-w-xl">
            <label className="text-sm text-softGray/90">Qual o seu principal objetivo atual?</label>
            <select className="input">
              <option>Gerar mais leads</option>
              <option>Escalar vendas</option>
              <option>Otimizar custos</option>
              <option>Fortalecer a marca</option>
            </select>
            <label className="text-sm text-softGray/90">Quanto investe em marketing por mês?</label>
            <select className="input">
              <option>Até R$ 5.000</option>
              <option>R$ 5.000 a R$ 20.000</option>
              <option>R$ 20.000 a R$ 100.000</option>
              <option>Acima de R$ 100.000</option>
            </select>
            <label className="text-sm text-softGray/90">Qual o porte da sua empresa?</label>
            <select className="input">
              <option>Micro/Pequena</option>
              <option>Média</option>
              <option>Grande</option>
            </select>
            <button type="button" className="mt-2 inline-flex items-center justify-center rounded-full border px-5 py-2.5 text-sm font-medium border-white/20 text-softWhite hover:shadow-neonGreenCyan" style={{ background: 'linear-gradient(90deg, rgba(158,255,0,0.1), rgba(0,200,255,0.1))' }}>
              Receber diagnóstico gratuito
            </button>
          </form>
        </div>
        <div className="relative">
          <div className="absolute -inset-4 rounded-3xl bg-[linear-gradient(135deg,rgba(158,255,0,0.12),rgba(0,200,255,0.1))] blur-2xl" />
          <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-md">
            <img
              src={img}
              alt="Humanoide metálico analisando holograma"
              className="w-full h-[320px] md:h-[420px] object-cover"
              style={{ objectPosition: '50% 45%' }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
