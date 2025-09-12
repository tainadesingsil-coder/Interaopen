import { motion } from 'framer-motion'
import { Cpu, Bot, Workflow, Briefcase, Shield, Rocket, CheckCircle2, ArrowRight } from 'lucide-react'

const CTA_LINK = 'https://wa.me/5538999266004?text=Quero%20um%20or%C3%A7amento%20com%20a%20CodexionTech'

function Section({ children, className }: { children: React.ReactNode, className?: string }){
  return <section className={`py-12 md:py-16 ${className||''}`}>{children}</section>
}

function Container({ children }: { children: React.ReactNode }){
  return <div className="container-section">{children}</div>
}

export default function CodexionLanding(){
  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0B] text-white">
      {/* Hero com gradiente forte + lead */}
      <Section className="pt-24 md:pt-32 hero-gradient">
        <Container>
          <div className="flex items-center justify-center text-center">
            <motion.h1 initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{duration:0.6}} className="text-4xl md:text-7xl font-extrabold tracking-tight">
              Codexion
            </motion.h1>
          </div>
        </Container>
      </Section>

      {/* Soluções */}
      <Section>
        <Container>
          <h2 className="section-title">Soluções</h2>
          <div className="mt-6 grid md:grid-cols-4 gap-4 md:gap-6">
            {[{icon:Briefcase,t:'Desenvolvimento de sistemas',d:'Web, mobile e APIs performáticas.'},
              {icon:Bot,t:'Inteligência Artificial',d:'Chatbots, visão computacional e automações.'},
              {icon:Workflow,t:'Automação',d:'Integrações e orquestração de processos.'},
              {icon:Cpu,t:'Consultoria',d:'Arquitetura, cloud e estratégia digital.'}].map(({icon:Icon,t,d})=> (
              <div key={t} className="card-dark">
                <Icon className="h-5 w-5 text-accent" />
                <p className="mt-3 font-semibold">{t}</p>
                <p className="mt-1 text-sm text-[#A3A3AD]">{d}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Benefícios */}
      <Section>
        <Container>
          <h2 className="section-title">Benefícios</h2>
          <div className="mt-6 grid md:grid-cols-3 gap-4 md:gap-6">
            {[{icon:Rocket,t:'Agilidade',d:'Entrega contínua com qualidade.'},
              {icon:Shield,t:'Segurança',d:'Boas práticas, auditoria e observabilidade.'},
              {icon:CheckCircle2,t:'Crescimento',d:'Produtos que escalam com o seu negócio.'}].map(({icon:Icon,t,d})=> (
              <div key={t} className="card-dark">
                <Icon className="h-5 w-5 text-accent" />
                <p className="mt-3 font-semibold">{t}</p>
                <p className="mt-1 text-sm text-[#A3A3AD]">{d}</p>
              </div>
            ))}
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

