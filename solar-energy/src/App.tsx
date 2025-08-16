import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Check, Leaf, Shield, MapPin, MessageCircle, Building2 } from 'lucide-react'
import './index.css'

function Header() {
  return (
    <header className="fixed top-0 z-40 w-full border-b border-white/5 bg-black/40 backdrop-blur">
      <div className="container-section flex items-center justify-between py-4">
        <a href="#" className="text-lg font-extrabold tracking-tight">Solar Energy</a>
        <nav className="hidden md:flex items-center gap-6 text-sm text-gray-300">
          <a href="#beneficios" className="hover:text-white">Benefícios</a>
          <a href="#simulador" className="hover:text-white">Simulador</a>
          <a href="#provasocial" className="hover:text-white">Confiança</a>
          <a href="#como" className="hover:text-white">Como funciona</a>
          <a href="#contato" className="hover:text-white">Contato</a>
        </nav>
        <a href="#simulador" className="btn-gradient hidden md:inline-flex">Simular economia</a>
      </div>
    </header>
  )
}

function Hero() {
  const [lead, setLead] = useState('')
  return (
    <section className="relative pt-28 md:pt-36 pb-16 md:pb-24">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1509395176047-4a66953fd231?q=80&w=1920&auto=format&fit=crop')] bg-cover bg-center opacity-20" />
      <div className="container-section relative">
        <motion.h1 initial={{opacity:0,y:10}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.6}} className="section-title">
          Economize até 95% na sua conta de luz com energia solar em Minas Gerais
        </motion.h1>
        <motion.p initial={{opacity:0,y:10}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:0.1,duration:0.6}} className="section-subtitle mt-3">
          Projetos personalizados, instalação rápida e proposta gratuita em até 24h
        </motion.p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <div className="glass flex items-center gap-2 px-3 py-2 w-full sm:w-auto">
            <MessageCircle className="h-4 w-4 text-[var(--brand-primary)]" />
            <input value={lead} onChange={(e)=>setLead(e.target.value)} placeholder="Seu WhatsApp ou e-mail" className="bg-transparent outline-none flex-1 min-w-[220px]" />
          </div>
          <a href="#simulador" className="btn-gradient inline-flex items-center">
            Simule sua economia
            <ArrowRight className="ml-2 h-4 w-4" />
          </a>
        </div>
        <div className="mt-4 stat-pill"><MapPin className="h-4 w-4 text-[var(--brand-primary)]" /> Atendemos todo o estado de Minas Gerais</div>
      </div>
    </section>
  )
}

function Beneficios() {
  const items = [
    { icon: Check, title: 'Economia imediata', desc: 'Reduza a fatura já no primeiro mês.' },
    { icon: Shield, title: 'Garantia até 25 anos', desc: 'Durabilidade e suporte de longo prazo.' },
    { icon: Leaf, title: 'Sustentável e valoriza', desc: 'Energia limpa e imóvel mais valorizado.' },
    { icon: Building2, title: 'Atendimento local', desc: 'Equipe especializada em MG.' },
  ]
  return (
    <section id="beneficios" className="py-16 md:py-24">
      <div className="container-section">
        <h2 className="section-title">Benefícios em destaque</h2>
        <p className="section-subtitle mt-2">Soluções que unem economia, confiança e tecnologia.</p>
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map(({icon:Icon,title,desc})=> (
            <div key={title} className="glass p-6 hover-lift">
              <Icon className="h-6 w-6 text-[var(--brand-primary)]" />
              <h3 className="mt-4 text-lg font-semibold">{title}</h3>
              <p className="mt-1 text-gray-300">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function useCalculator(conta: number, area: number, cidade: string) {
  return useMemo(()=>{
    if(!conta || !area || !cidade) return { economia:0, economiaPct:0, novaConta:0, roi:0 }
    const tarifa = 0.95
    const irradiancia = 150
    const fatorCidade = 1
    const producao = area * irradiancia * fatorCidade * 0.18
    const gastoKwh = conta / tarifa
    const economiaKwh = Math.min(producao, gastoKwh)
    const economia = economiaKwh * tarifa
    const economiaPct = Math.min(100, economia/Math.max(conta,1)*100)
    const novaConta = Math.max(conta - economia, 49.9)
    const investimento = Math.max(producao/120, 1) * 5200
    const roi = investimento / (economia * 12)
    return { economia, economiaPct, novaConta, roi }
  }, [conta, area, cidade])
}

function Simulador() {
  const [conta, setConta] = useState<number>(350)
  const [area, setArea] = useState<number>(30)
  const [cidade, setCidade] = useState('Belo Horizonte')
  const r = useCalculator(conta, area, cidade)
  const brl = (v:number)=> v.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})
  return (
    <section id="simulador" className="py-16 md:py-24">
      <div className="container-section">
        <h2 className="section-title">Simulador de economia</h2>
        <p className="section-subtitle mt-2">Resultados instantâneos com base no seu consumo e área útil.</p>
        <div className="mt-8 grid md:grid-cols-5 gap-6">
          <div className="md:col-span-3 glass p-6">
            <div className="grid gap-4">
              <label className="grid gap-1 text-sm text-gray-300">
                Conta média (R$/mês)
                <input type="number" value={conta} min={50} step={10} onChange={(e)=>setConta(Number(e.target.value))} className="rounded-md bg-black/40 border border-white/10 px-4 py-3 outline-none focus:ring-2" />
              </label>
              <label className="grid gap-1 text-sm text-gray-300">
                Área útil no telhado (m²)
                <input type="number" value={area} min={5} step={1} onChange={(e)=>setArea(Number(e.target.value))} className="rounded-md bg-black/40 border border-white/10 px-4 py-3 outline-none focus:ring-2" />
              </label>
              <label className="grid gap-1 text-sm text-gray-300">
                Cidade
                <input value={cidade} onChange={(e)=>setCidade(e.target.value)} className="rounded-md bg-black/40 border border-white/10 px-4 py-3 outline-none focus:ring-2" />
              </label>
              <a href="#contato" className="btn-gradient w-fit mt-1">Quero proposta</a>
            </div>
          </div>
          <div className="md:col-span-2 grid gap-4">
            <div className="glass p-5">
              <p className="text-gray-300">Economia estimada</p>
              <p className="mt-1 text-xl font-bold text-[var(--brand-primary)]">{brl(r.economia)} ({r.economiaPct.toFixed(0)}%)</p>
            </div>
            <div className="glass p-5">
              <p className="text-gray-300">Nova conta</p>
              <p className="mt-1 text-xl font-semibold">{brl(r.novaConta)}</p>
            </div>
            <div className="glass p-5">
              <p className="text-gray-300">ROI estimado</p>
              <p className="mt-1 text-xl font-semibold">{r.roi>0? `${r.roi.toFixed(1)} anos`:'-'}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function ProvaSocial() {
  return (
    <section id="provasocial" className="py-16 md:py-24">
      <div className="container-section">
        <h2 className="section-title">Confiança comprovada</h2>
        <p className="section-subtitle mt-2">Depoimentos, selos e parceiros que atestam a qualidade.</p>
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <div className="glass p-6">
            <div className="chip">Selo INMETRO</div>
            <p className="mt-3 text-gray-300 text-sm">Equipamentos certificados e de alta performance.</p>
          </div>
          <div className="glass p-6">
            <div className="chip">Mais de 500 projetos</div>
            <p className="mt-3 text-gray-300 text-sm">Residências, comércios e áreas rurais em todo MG.</p>
          </div>
          <div className="glass p-6">
            <div className="chip">Parceiros e bancos</div>
            <p className="mt-3 text-gray-300 text-sm">Financiamento e pagamento facilitado.</p>
          </div>
        </div>
      </div>
    </section>
  )
}

function ComoFunciona() {
  const steps = [
    { n:1, t:'Diagnóstico', d:'Análise do consumo e avaliação da área.' },
    { n:2, t:'Projeto', d:'Simulação e proposta personalizada.' },
    { n:3, t:'Instalação & homologação', d:'Execução rápida e homologação com a distribuidora.' },
  ]
  return (
    <section id="como" className="py-16 md:py-24">
      <div className="container-section">
        <h2 className="section-title">Como funciona</h2>
        <p className="section-subtitle mt-2">Transparência e velocidade em cada etapa.</p>
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          {steps.map(s=> (
            <div key={s.n} className="glass p-6">
              <div className="flex items-center gap-3 text-[var(--brand-primary)]">
                <div className="h-8 w-8 rounded-full border border-[var(--brand-primary)] flex items-center justify-center font-bold">{s.n}</div>
                <span className="font-semibold">{s.t}</span>
              </div>
              <p className="mt-3 text-gray-300">{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CTA() {
  return (
    <section className="py-16 md:py-24">
      <div className="container-section glass p-8 text-center">
        <h2 className="section-title">Comece a economizar agora com energia solar</h2>
        <p className="section-subtitle mt-2">Proposta gratuita e personalizada em até 24h.</p>
        <a href="#simulador" className="btn-gradient mt-6 inline-flex">Simule minha economia</a>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-white/5 py-10">
      <div className="container-section flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
        <div className="text-sm text-gray-300">
          <p className="font-semibold text-white">Solar Energy</p>
          <p>Minas Gerais • contato@solarenergy.com.br • (31) 99999-9999</p>
        </div>
        <div className="text-sm text-gray-300 flex gap-4">
          <a href="#">Sobre</a>
          <a href="#contato">Contato</a>
          <a href="#">Política de Privacidade</a>
        </div>
      </div>
      <div className="container-section mt-6 text-center text-xs text-gray-400">© {new Date().getFullYear()} Solar Energy. Todos os direitos reservados.</div>
    </footer>
  )
}

export default function App() {
  return (
    <div>
      <Header />
      <Hero />
      <Beneficios />
      <Simulador />
      <ProvaSocial />
      <ComoFunciona />
      <CTA />
      <Footer />
    </div>
  )
}
