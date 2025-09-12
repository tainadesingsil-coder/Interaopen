import { useEffect, useRef, useState } from 'react'
import { Cpu, Bot, Workflow, Briefcase, ArrowRight } from 'lucide-react'

const CTA_LINK = 'https://wa.me/5538999266004?text=Quero%20um%20or%C3%A7amento%20com%20a%20CodexionTech'

function Section({ children, className }: { children: React.ReactNode, className?: string }){
  return <section className={`py-12 md:py-16 ${className||''}`}>{children}</section>
}

function Container({ children }: { children: React.ReactNode }){
  return <div className="container-section">{children}</div>
}

export default function CodexionLanding(){
  const robotRef = useRef<HTMLImageElement|null>(null)
  const [robotReady, setRobotReady] = useState(false)
  useEffect(() => {
    const onAnimEnd = () => setRobotReady(true)
    robotRef.current?.addEventListener('animationend', onAnimEnd)
    return () => {
      robotRef.current?.removeEventListener('animationend', onAnimEnd)
    }
  }, [])
  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0B] text-white">
      {/* Hero com gradiente + overlay e robô */}
      <Section className="relative overflow-hidden pt-24 md:pt-32 hero-gradient hero">
        <img
          src="https://i.postimg.cc/3rpjDcfh/Black-and-White-Dark-Minimalist-Project-Management-Platform-Website-UI-Prototype-1.png"
          alt="Banner Codexion"
          className="hero-bg"
        />
        <div className="hero-overlay" />
        {/* Robô animado */}
        <div className="hero-robot-wrap">
          <img
            src="https://i.postimg.cc/W3KhWT93/Future-Tenses-Grammar-Presentation-in-Blue-Orange-Green-Futuristic-Style.png"
            alt="Robô futurista"
            className="hero-robot"
            ref={robotRef}
          />
          {robotReady && (
            <div className="robot-panel">
              <p className="robot-panel-title">Como posso ajudar?</p>
              <div className="robot-panel-actions">
                <a href="https://wa.me/qr/F3UMI4YIMPD4B1" className="btn-neon btn-pulse">Falar no WhatsApp</a>
                <a href="#solucoes" className="btn-outline-white">Ver serviços</a>
                <a href="#cases" className="btn-outline-white">Ver cases</a>
              </div>
            </div>
          )}
        </div>
        <Container>
          <div className="relative z-10 py-8 md:py-14" />
        </Container>
      </Section>

      {/* Soluções */}
      <Section>
        <Container>
          <a id="solucoes" />
          <div className="mt-4 max-w-4xl">
            <h3 className="text-2xl md:text-4xl font-extrabold tracking-tight">
              <span className="text-gradient-blue">Tecnologia que acelera resultados</span>
            </h3>
            <p className="mt-3 text-[#C7C7D1] text-base md:text-lg leading-relaxed">
              Co-criamos produtos e plataformas com <span className="text-white font-semibold">desenvolvimento moderno</span>,
              <span className="text-white font-semibold"> IA aplicada</span> e <span className="text-white font-semibold">automações</span> para escalar operações com 
              segurança. Arquiteturas enxutas, UX rápida e integrações que se conectam ao seu CRM, mídia e
              funil — para <span className="text-white font-semibold">crescer com previsibilidade</span>.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {['Web & Mobile','IA aplicada','APIs & Integrações','Dados & Observabilidade'].map(chip => (
                <span key={chip} className="logo-chip">{chip}</span>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* Destaque visual + cards de soluções (transferidos) */}
      <Section>
        <Container>
          <div className="mt-6 grid md:grid-cols-2 gap-5 items-start">
            <div>
              <div className="card-dark overflow-hidden">
                <img src="https://i.postimg.cc/x8vnv2hB/Preto-e-Roxo-Moderno-Aumente-Suas-Vendas-Marketing-Post-para-Instagram.png" alt="Destaque visual Codexion" className="w-full h-auto object-cover" />
              </div>
            </div>
            <div className="grid gap-4 md:gap-5">
              {[{icon:Briefcase,t:'Desenvolvimento de sistemas',d:'Web, mobile e APIs performáticas.'},
                {icon:Bot,t:'Inteligência Artificial',d:'Chatbots, visão computacional e automações.'},
                {icon:Workflow,t:'Social Media',d:'Cuidamos das suas mídias com automações integradas ao seu site: conteúdo, captação e funis 24/7.'},
                {icon:Cpu,t:'Marketing IA',d:'Uma agência de IA orquestrando funil, mídia e CRM para vender mais.'}].map(({icon:Icon,t,d})=> (
                <div key={t} className="card-dark">
                  <Icon className="h-5 w-5 text-accent neon-icon" />
                  <p className="mt-3 font-semibold">{t}</p>
                  <p className="mt-1 text-sm text-[#A3A3AD]">{d}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* Prova Social */}
      <Section>
        <Container>
          <h2 className="section-title">O que dizem</h2>
          <div className="mt-6 grid md:grid-cols-3 gap-4 md:gap-6">
            {[1,2,3].map(i=> (
              <div key={i} className="card-dark">
                <p className="text-sm italic text-[#C7C7D1]">“A CodexionTech elevou nossa operação. Resultado além do esperado.”</p>
                <p className="mt-2 text-xs text-[#8B8B96]">Cliente {i}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Casos de Sucesso */}
      <Section>
        <Container>
          <a id="cases" />
          <h2 className="section-title">Casos de Sucesso</h2>
          <div className="mt-6 grid md:grid-cols-3 gap-4 md:gap-6">
            {[1,2,3].map(i=> (
              <div key={i} className="card-dark">
                <p className="text-sm text-[#A3A3AD]"><span className="text-white font-semibold">Problema:</span> Processo lento e manual.</p>
                <p className="text-sm text-[#A3A3AD] mt-1"><span className="text-white font-semibold">Solução:</span> Plataforma automatizada com IA.</p>
                <p className="text-sm text-[#A3A3AD] mt-1"><span className="text-white font-semibold">Resultado:</span> +45% de eficiência.</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* CTA Final */}
      <Section>
        <Container>
          <div className="text-center">
            <h3 className="text-2xl md:text-4xl font-extrabold">Pronto para acelerar seus resultados?</h3>
            <p className="mt-2 text-[#A3A3AD]">Fale com a CodexionTech e receba um plano sob medida.</p>
            <a href={CTA_LINK} className="btn-neon mt-6 inline-flex">Fale com a CodexionTech <ArrowRight className="ml-2 h-4 w-4" /></a>
          </div>
        </Container>
      </Section>

      {/* Rodapé */}
      <footer className="py-8 border-t border-white/5 bg-black">
        <Container>
          <p className="text-center text-xs md:text-sm text-[#8B8B96]">© 2025 CodexionTech — Todos os direitos reservados | 🔒 Site seguro | Desenvolvido por CodexionTech</p>
        </Container>
      </footer>
    </div>
  )
}

