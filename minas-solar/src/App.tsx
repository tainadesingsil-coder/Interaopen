import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Building2, Check, Leaf, PiggyBank, Shield, MessageCircle } from 'lucide-react'
import './index.css'

type CityOption = {
  name: string
  irradianceFactor: number
}

const CITIES: CityOption[] = [
  { name: 'Belo Horizonte', irradianceFactor: 1.0 },
  { name: 'Contagem', irradianceFactor: 0.98 },
  { name: 'Uberlândia', irradianceFactor: 1.06 },
  { name: 'Juiz de Fora', irradianceFactor: 0.96 },
  { name: 'Betim', irradianceFactor: 0.99 },
  { name: 'Montes Claros', irradianceFactor: 1.05 },
  { name: 'Divinópolis', irradianceFactor: 1.01 },
  { name: 'Governador Valadares', irradianceFactor: 1.07 },
]

function currencyBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function openWhatsApp(message: string) {
  const phone = '5531999999999'
  const encoded = encodeURIComponent(message)
  const url = `https://api.whatsapp.com/send?phone=${phone}&text=${encoded}`
  window.open(url, '_blank')
}

function useCalculator(contaMedia: number, area: number, cidade: CityOption | null) {
  return useMemo(() => {
    if (!contaMedia || !area || !cidade) {
      return { economia: 0, novaConta: 0, roiAnos: 0, potenciaKw: 0, geracaoKwh: 0, economiaPct: 0 }
    }

    const tarifa = 0.95
    const irradianciaBase = 150
    const producao = area * irradianciaBase * cidade.irradianceFactor * 0.18
    const gastoKwh = contaMedia / tarifa
    const economiaKwh = Math.min(producao, gastoKwh)
    const economia = economiaKwh * tarifa
    const economiaPct = Math.min(100, (economia / Math.max(contaMedia, 1)) * 100)
    const novaConta = Math.max(contaMedia - economia, 49.9)

    const custoPorKw = 5200
    const potenciaKw = (producao / 120)
    const investimento = Math.max(potenciaKw, 1) * custoPorKw
    const roiAnos = investimento / (economia * 12)

    return { economia, novaConta, roiAnos, potenciaKw, geracaoKwh: producao, economiaPct }
  }, [contaMedia, area, cidade])
}

function Header() {
  return (
    <header className="fixed top-0 z-40 w-full border-b border-white/5 bg-black/40 backdrop-blur">
      <div className="container-section flex items-center justify-between py-4">
        <a href="#" className="flex items-center gap-3">
          <img src="/brand-logo.svg" alt="Solar Energy" className="h-8 w-auto" />
          <span className="text-lg font-extrabold tracking-tight text-white">Solar Energy</span>
        </a>
        <nav className="hidden md:flex items-center gap-6 text-sm text-solar-gray-light">
          <a href="#" className="hover:text-white">Home</a>
          <a href="#beneficios" className="hover:text-white">Benefícios</a>
          <a href="#como-funciona" className="hover:text-white">Como Funciona</a>
          <a href="#planos" className="hover:text-white">Planos</a>
          <a href="#depoimentos" className="hover:text-white">Depoimentos</a>
          <a href="#parceiros" className="hover:text-white">Parceiros</a>
          <a href="#contato" className="hover:text-white">Contato</a>
        </nav>
        <a href="#simulador" className="btn-gradient hidden md:inline-flex">Simular economia solar</a>
      </div>
    </header>
  )
}

function Hero() {
  return (
    <section className="relative pt-28 md:pt-36 pb-16 md:pb-24">
      <div className="container-section grid md:grid-cols-2 gap-10 items-center">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="section-title"
          >
            Economize até 20% na sua conta de luz com energia solar em Minas Gerais
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="section-subtitle mt-4"
          >
            Projeto, instalação e monitoramento completo — proposta gratuita em até 24h
          </motion.p>
          <div className="mt-3 badge">Atendimento em todo o estado de Minas Gerais</div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => document.getElementById('simulador')?.scrollIntoView({ behavior: 'smooth' })}
              className="btn-gradient hover-lift"
            >
              Peça seu estudo gratuito
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
            <button
              onClick={() => openWhatsApp('Olá! Quero meu estudo gratuito de energia solar com a Solar Energy.')} 
              className="btn-secondary hover-lift"
            >
              Falar por WhatsApp
              <MessageCircle className="ml-2 h-4 w-4" />
            </button>
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          <div className="card-gradient rounded-2xl">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-2">
              <div className="aspect-[4/3] w-full rounded-xl bg-[url('https://images.unsplash.com/photo-1509395176047-4a66953fd231?q=80&w=1974&auto=format&fit=crop')] bg-cover bg-center" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function Simulador() {
  const [conta, setConta] = useState<number>(350)
  const [area, setArea] = useState<number>(30)
  const [cidade, setCidade] = useState<CityOption | null>(CITIES[0])

  const { economia, novaConta, roiAnos, potenciaKw, geracaoKwh, economiaPct } = useCalculator(conta, area, cidade)

  function handleWhatsApp() {
    const msg = `Olá, Solar Energy! Quero meu estudo gratuito.\n\nConta média: ${currencyBRL(conta)}\nÁrea disponível: ${area} m²\nCidade: ${cidade?.name}\n\nGeração estimada: ${geracaoKwh.toFixed(0)} kWh/mês\nEconomia estimada: ${currencyBRL(economia)} (${economiaPct.toFixed(0)}%)\nNova conta: ${currencyBRL(novaConta)}\nROI estimado: ${roiAnos.toFixed(1)} anos\nPotência aproximada: ${potenciaKw.toFixed(1)} kWp`
    openWhatsApp(msg)
  }

  return (
    <section id="simulador" className="py-16 md:py-24">
      <div className="container-section">
        <div className="max-w-3xl">
          <h2 className="section-title">Simule sua economia</h2>
          <p className="section-subtitle mt-2">Descubra sua geração mensal, economia e ROI com base na sua cidade.</p>
        </div>

        <div className="mt-8 grid md:grid-cols-5 gap-6">
          <div className="md:col-span-3 rounded-xl border border-white/10 bg-white/5 p-6">
            <div className="grid gap-4">
              <label className="grid gap-2">
                <span className="text-sm text-solar-gray-light">Conta média (R$/mês)</span>
                <input
                  type="number"
                  min={50}
                  step={10}
                  value={conta}
                  onChange={(e) => setConta(Number(e.target.value))}
                  className="w-full rounded-md bg-black/40 border border-white/10 px-4 py-3 outline-none focus:ring-2"
                  style={{ ['--tw-ring-color' as any]: 'var(--brand-ring)' }}
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm text-solar-gray-light">Área do telhado (m²)</span>
                <input
                  type="number"
                  min={5}
                  step={1}
                  value={area}
                  onChange={(e) => setArea(Number(e.target.value))}
                  className="w-full rounded-md bg-black/40 border border-white/10 px-4 py-3 outline-none focus:ring-2"
                  style={{ ['--tw-ring-color' as any]: 'var(--brand-ring)' }}
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm text-solar-gray-light">Cidade</span>
                <select
                  value={cidade?.name}
                  onChange={(e) => setCidade(CITIES.find(c => c.name === e.target.value) ?? null)}
                  className="w-full rounded-md bg-black/40 border border-white/10 px-4 py-3 outline-none focus:ring-2"
                  style={{ ['--tw-ring-color' as any]: 'var(--brand-ring)' }}
                >
                  {CITIES.map(c => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </label>
              <button onClick={handleWhatsApp} className="btn-gradient mt-2">
                Receber proposta no WhatsApp
                <MessageCircle className="ml-2 h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="md:col-span-2 rounded-xl border border-white/10 bg-white/5 p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-solar-gray-light">Geração mensal estimada</span>
                <span className="text-xl font-bold text-[var(--brand-primary)]">{geracaoKwh > 0 ? `${geracaoKwh.toFixed(0)} kWh` : '-'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-solar-gray-light">Economia mensal</span>
                <span className="text-xl font-semibold">{economia > 0 ? `${currencyBRL(economia)} (${economiaPct.toFixed(0)}%)` : '-'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-solar-gray-light">Nova conta estimada</span>
                <span className="text-xl font-semibold">{currencyBRL(novaConta)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-solar-gray-light">ROI estimado</span>
                <span className="text-xl font-semibold">{roiAnos > 0 ? `${roiAnos.toFixed(1)} anos` : '-'}</span>
              </div>
              <p className="text-xs text-solar-gray-light/80">Estimativas médias para MG. Resultados finais dependem de projeto técnico.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Beneficios() {
  const items = [
    { icon: PiggyBank, title: 'Economia imediata', desc: 'Descontos de até 20% na sua conta de luz.' },
    { icon: Shield, title: 'Garantia de até 25 anos', desc: 'Equipamentos com longa durabilidade e suporte.' },
    { icon: Leaf, title: 'Energia limpa e valorização', desc: 'Sustentável e valorização do seu imóvel.' },
    { icon: Building2, title: 'Especialistas em MG', desc: 'Projeto pensado para o clima e normas do estado.' },
  ]
  return (
    <section id="beneficios" className="py-16 md:py-24">
      <div className="container-section">
        <h2 className="section-title">Por que escolher a Solar Energy</h2>
        <p className="section-subtitle mt-2">Soluções completas para reduzir custos e aumentar sua segurança energética.</p>
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card-gradient rounded-xl hover-lift">
              <div className="rounded-[0.70rem] border border-white/10 bg-white/5 p-6">
                <Icon className="h-7 w-7 text-[var(--brand-primary)]" />
                <h3 className="mt-4 text-xl font-semibold">{title}</h3>
                <p className="mt-1 text-solar-gray-light">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ComoFunciona() {
  const steps = [
    { title: 'Diagnóstico gratuito', desc: 'Análise da conta e avaliação do telhado/área.' },
    { title: 'Projeto personalizado', desc: 'Simulação e proposta sob medida para seu perfil.' },
    { title: 'Instalação e homologação', desc: 'Execução rápida e homologação com a distribuidora.' },
  ]
  return (
    <section id="como-funciona" className="py-16 md:py-24">
      <div className="container-section">
        <h2 className="section-title">Como funciona</h2>
        <p className="section-subtitle mt-2">Do diagnóstico à energia gerando, acompanhamos cada etapa.</p>
        <div className="mt-10 grid md:grid-cols-3 gap-6">
          {steps.map((s, i) => (
            <div key={s.title} className="rounded-xl border border-white/10 bg-white/5 p-6">
              <div className="flex items-center gap-3 text-[var(--brand-primary)]">
                <div className="h-8 w-8 rounded-full border border-[var(--brand-primary)] flex items-center justify-center font-bold">{i + 1}</div>
                <span className="font-semibold">{s.title}</span>
              </div>
              <p className="mt-3 text-solar-gray-light">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Planos() {
  const plans = [
    {
      name: 'Residencial',
      price: 'a partir de R$ 149/mês',
      features: ['Projeto sob medida', 'Instalação em até 10 dias', 'Monitoramento via app'],
    },
    {
      name: 'Comercial',
      price: 'soluções sob medida',
      features: ['Redução de custos operacionais', 'Payback acelerado', 'Suporte prioritário'],
    },
    {
      name: 'Rural',
      price: 'crédito especial e tecnologia robusta',
      features: ['Soluções para fazendas e sítios', 'Estruturas reforçadas', 'Baixa manutenção'],
    },
  ]
  return (
    <section id="planos" className="py-16 md:py-24">
      <div className="container-section">
        <h2 className="section-title">Planos e financiamento</h2>
        <p className="section-subtitle mt-2">Escolha a solução ideal para sua casa, comércio ou propriedade rural.</p>
        <div className="mt-10 grid md:grid-cols-3 gap-6">
          {plans.map((p) => (
            <div key={p.name} className="rounded-xl border border-white/10 bg-white/5 p-6 flex flex-col">
              <h3 className="text-xl font-semibold">{p.name}</h3>
              <p className="mt-1 text-solar-gray-light">{p.price}</p>
              <ul className="mt-4 space-y-2 text-sm flex-1">
                {p.features.map(f => (
                  <li key={f} className="flex items-center gap-2"><Check className="h-4 w-4 text-[var(--brand-primary)]" /> {f}</li>
                ))}
              </ul>
              <button onClick={() => openWhatsApp(`Quero proposta para o plano ${p.name} da Solar Energy.`)} className="btn-gradient mt-4">Pedir proposta</button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Depoimentos() {
  const itens = [
    { nome: 'Ana Paula', cidade: 'Belo Horizonte', economia: 18, foto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1000&auto=format&fit=crop' },
    { nome: 'Carlos Eduardo', cidade: 'Uberlândia', economia: 20, foto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1000&auto=format&fit=crop' },
    { nome: 'Mariana Souza', cidade: 'Juiz de Fora', economia: 16, foto: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=1000&auto=format&fit=crop' },
  ]
  return (
    <section id="depoimentos" className="py-16 md:py-24">
      <div className="container-section">
        <h2 className="section-title">Quem já está economizando</h2>
        <p className="section-subtitle mt-2">Depoimentos de clientes em todo o estado de Minas Gerais.</p>
        <div className="mt-10 grid md:grid-cols-3 gap-6 overflow-x-auto md:overflow-visible scrollbar-hide">
          {itens.map((d) => (
            <div key={d.nome} className="min-w-[280px] md:min-w-0 rounded-xl border border-white/10 bg-white/5 p-6">
              <div className="flex items-center gap-4">
                <img src={d.foto} alt={d.nome} className="h-12 w-12 rounded-full object-cover" />
                <div>
                  <p className="font-semibold">{d.nome}</p>
                  <p className="text-sm text-solar-gray-light">{d.cidade}</p>
                </div>
              </div>
              <p className="mt-4 text-solar-gray-light text-sm">“Consegui economizar cerca de {d.economia}% na conta de luz. Atendimento excelente!”</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Parceiros() {
  const logos = [
    'https://dummyimage.com/140x40/ffffff/000000.png&text=Construtora+A',
    'https://dummyimage.com/120x40/ffffff/000000.png&text=Cooperativa+B',
    'https://dummyimage.com/100x40/ffffff/000000.png&text=Comércio+C',
    'https://dummyimage.com/160x40/ffffff/000000.png&text=Agro+D',
  ]
  return (
    <section id="parceiros" className="py-16 md:py-24">
      <div className="container-section grid md:grid-cols-2 gap-10 items-center">
        <div>
          <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/5">
            <div className="aspect-[4/3] w-full bg-[url('https://images.unsplash.com/photo-1520974692973-ac47dfb7fd89?q=80&w=1822&auto=format&fit=crop')] bg-cover bg-center" />
          </div>
        </div>
        <div>
          <h2 className="section-title">Empresas e clientes que confiam na Solar Energy</h2>
          <p className="section-subtitle mt-2">Mais de 500 projetos entregues para residências, comércios e propriedades rurais.</p>
          <p className="mt-4 text-solar-gray-light">Parceiros que acreditam em um futuro mais sustentável e rentável.</p>
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 items-center">
            {logos.map((src) => (
              <div key={src} className="rounded-md border border-white/10 bg-white/5 p-3 flex items-center justify-center">
                <img src={src} alt="logo parceiro" className="h-8 w-auto opacity-80" />
              </div>
            ))}
          </div>
          <button onClick={() => openWhatsApp('Quero ser parceiro da Solar Energy.')} className="btn-gradient mt-6">Quero ser parceiro</button>
        </div>
      </div>
    </section>
  )
}

function Contato() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')
  const [contaMedia, setContaMedia] = useState('')
  const [cidade, setCidade] = useState('')
  const [mensagem, setMensagem] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const msg = `Olá, tenho interesse na Solar Energy. Meu nome é ${nome}, consumo R$${contaMedia}/mês e moro em ${cidade}.\n\nMensagem: ${mensagem}\nE-mail: ${email}\nTelefone: ${telefone}`
    openWhatsApp(msg)
  }

  return (
    <section id="contato" className="py-16 md:py-24">
      <div className="container-section">
        <div className="max-w-3xl">
          <h2 className="section-title">Fale com a gente</h2>
          <p className="section-subtitle mt-2">Receba um estudo gratuito em até 24 horas úteis.</p>
        </div>
        <form onSubmit={handleSubmit} className="mt-8 grid md:grid-cols-2 gap-4 rounded-xl border border-white/10 bg-white/5 p-6">
          <input required value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome" className="rounded-md bg-black/40 border border-white/10 px-4 py-3 outline-none focus:ring-2" />
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail" className="rounded-md bg-black/40 border border-white/10 px-4 py-3 outline-none focus:ring-2" />
          <input required value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="Telefone (WhatsApp)" className="rounded-md bg-black/40 border border-white/10 px-4 py-3 outline-none focus:ring-2" />
          <input required value={contaMedia} onChange={(e) => setContaMedia(e.target.value)} placeholder="Conta média (R$)" className="rounded-md bg-black/40 border border-white/10 px-4 py-3 outline-none focus:ring-2" />
          <input required value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder="Cidade" className="rounded-md bg-black/40 border border-white/10 px-4 py-3 outline-none focus:ring-2 md:col-span-2" />
          <textarea value={mensagem} onChange={(e) => setMensagem(e.target.value)} placeholder="Mensagem" className="rounded-md bg-black/40 border border-white/10 px-4 py-3 outline-none focus:ring-2 md:col-span-2 min-h-[120px]" />
          <button type="submit" className="btn-gradient md:col-span-2">Enviar no WhatsApp</button>
        </form>
      </div>
    </section>
  )
}

function FAQ() {
  const faqs = [
    { q: 'Preciso trocar o telhado?', a: 'Na maioria dos casos não. Avaliamos a estrutura e indicamos eventuais ajustes.' },
    { q: 'E se faltar sol?', a: 'Há geração mesmo em dias nublados. O projeto considera essa variação sazonal.' },
    { q: 'Quanto tempo para instalar?', a: 'Após aprovação, geralmente em até 10 dias úteis, além do prazo de homologação.' },
    { q: 'Qual a garantia dos painéis/inversor?', a: 'Painéis com até 25 anos de garantia de performance e inversores com garantia de fábrica.' },
  ]
  const [open, setOpen] = useState<number | null>(0)
  return (
    <section className="py-16 md:py-24">
      <div className="container-section">
        <h2 className="section-title">Perguntas frequentes</h2>
        <div className="mt-6 divide-y divide-white/10 rounded-xl border border-white/10 bg-white/5">
          {faqs.map((f, i) => (
            <div key={f.q}>
              <button onClick={() => setOpen(open === i ? null : i)} className="w-full text-left px-6 py-4 flex items-center justify-between">
                <span className="font-medium">{f.q}</span>
                <ArrowRight className={`h-4 w-4 transition-transform ${open === i ? 'rotate-90 text-[var(--brand-primary)]' : ''}`} />
              </button>
              {open === i && (
                <div className="px-6 pb-4 text-solar-gray-light">{f.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CTAFinal() {
  return (
    <section className="py-16 md:py-24 section-yellow">
      <div className="container-section text-center">
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">Comece a economizar agora com energia solar</h2>
        <p className="mt-2 text-black/70">Peça seu estudo gratuito e receba a proposta em até 24h úteis.</p>
        <button onClick={() => document.getElementById('simulador')?.scrollIntoView({ behavior: 'smooth' })} className="btn-gradient mt-6">
          Simular minha economia
        </button>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-white/5 py-10">
      <div className="container-section flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <img src="/brand-logo.svg" alt="Solar Energy" className="h-6 w-auto" />
            <span className="text-lg font-extrabold">Solar Energy</span>
          </div>
          <p className="mt-2 text-solar-gray-light text-sm">Energia solar para todo o estado de Minas Gerais.</p>
        </div>
        <div className="text-sm text-solar-gray-light">
          <p>Telefone: (31) 99999-9999</p>
          <p>E-mail: contato@solarenergy.com.br</p>
          <p>Redes: Instagram • Facebook • LinkedIn</p>
        </div>
      </div>
      <div className="container-section mt-6 text-center text-xs text-solar-gray-light">© {new Date().getFullYear()} Solar Energy. Todos os direitos reservados.</div>
    </footer>
  )
}

export default function App() {
  return (
    <div>
      <Header />
      <Hero />
      <Simulador />
      <Beneficios />
      <ComoFunciona />
      <Planos />
      <Depoimentos />
      <Parceiros />
      <Contato />
      <FAQ />
      <CTAFinal />
      <Footer />

      <button
        onClick={() => openWhatsApp('Olá! Quero um atendimento agora.')} 
        className="floating-whatsapp btn-gradient shadow-lg"
        aria-label="WhatsApp"
        title="Fale no WhatsApp"
      >
        <MessageCircle className="h-5 w-5" />
      </button>

      <div className="sticky-cta md:hidden">
        <div className="container-section py-3 flex items-center gap-3">
          <button className="btn-gradient flex-1" onClick={() => document.getElementById('simulador')?.scrollIntoView({ behavior: 'smooth' })}>
            Simular agora
          </button>
          <button className="btn-secondary" onClick={() => openWhatsApp('Olá! Quero meu estudo gratuito de energia solar com a Solar Energy.')}>WhatsApp</button>
        </div>
      </div>
    </div>
  )
}
