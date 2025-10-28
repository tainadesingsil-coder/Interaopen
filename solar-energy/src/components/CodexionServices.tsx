import { Cpu, LineChart, Settings } from 'lucide-react';

function ServiceCard({
  title,
  desc,
  Icon,
}: {
  title: string;
  desc: string;
  Icon: React.ComponentType<any>;
}) {
  return (
    <div className="group relative rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition-transform hover:-translate-y-1 hover:shadow-soft">
      <div className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-tr from-white/10 to-transparent" />
      <div className="relative flex items-start gap-4">
        <div className="h-12 w-12 rounded-xl border border-white/15 bg-black/60 flex items-center justify-center">
          <Icon className="h-6 w-6 text-chrome" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-softWhite">{title}</h3>
          <p className="mt-1 text-sm text-softGray">{desc}</p>
        </div>
      </div>
      <div className="mt-4 h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <div className="mt-3 text-xs text-softGray">Saiba mais</div>
    </div>
  );
}

export default function CodexionServices() {
  return (
    <section id="servicos" className="py-16 md:py-24 bg-gradient-to-b from-black via-black to-black/95">
      <div className="container mx-auto px-4">
        <h2 className="section-title text-softWhite">Serviços</h2>
        <p className="section-subtitle mt-2">Foco em conversão e autoridade digital.</p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <ServiceCard
            title="Softwares Inteligentes"
            desc="Automação personalizada com IA"
            Icon={Cpu}
          />
          <ServiceCard
            title="Estratégia de Crescimento"
            desc="Decisões baseadas em dados"
            Icon={LineChart}
          />
          <ServiceCard
            title="Otimização Digital"
            desc="IA aplicada para reduzir custos e ampliar lucros"
            Icon={Settings}
          />
        </div>
      </div>
      {/* Circuit lines subtle background layer */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.06]" style={{backgroundImage:'linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(0deg, rgba(255,255,255,0.12) 1px, transparent 1px)', backgroundSize:'48px 48px, 48px 48px'}} />
    </section>
  );
}
