import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Check, Leaf, Lock, PiggyBank, Shield, Sun, MessageCircle } from 'lucide-react'
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
  const phone = '5531999999999' // TODO: ajustar número oficial
  const encoded = encodeURIComponent(message)
  const url = `https://api.whatsapp.com/send?phone=${phone}&text=${encoded}`
  window.open(url, '_blank')
}

function useCalculator(contaMedia: number, area: number, cidade: CityOption | null) {
  return useMemo(() => {
    if (!contaMedia || !area || !cidade) {
      return { economia: 0, novaConta: 0, roiAnos: 0, potenciaKw: 0 }
    }

    const tarifa = 0.95 // R$/kWh médio em MG (estimativa)
    const irradianciaBase = 150 // kWh/m²/mês aproximado
    const producao = area * irradianciaBase * cidade.irradianceFactor * 0.18 // 18% eficiência total
    const gastoKwh = contaMedia / tarifa
    const economiaKwh = Math.min(producao, gastoKwh)
    const economia = economiaKwh * tarifa
    const novaConta = Math.max(contaMedia - economia, 49.9) // piso de taxas

    const custoPorKw = 5200 // R$ por kWp instalado (médio)
    const potenciaKw = (producao / 120) // kW pico estimado (aprox)
    const investimento = Math.max(potenciaKw, 1) * custoPorKw
    const roiAnos = investimento / (economia * 12)

    return { economia, novaConta, roiAnos, potenciaKw }
  }, [contaMedia, area, cidade])
}

function Header() {
  return (
    <header className="fixed top-0 z-40 w-full border-b border-white/5 bg-black/40 backdrop-blur">
      <div className="container-section flex items-center justify-between py-4">
        <a href="#" className="flex items-center gap-2">
          <Sun className="h-6 w-6 text-solar-yellow" />
          <span className="text-lg font-extrabold tracking-tight text-white">Minas Solar</span>
        </a>
        <nav className="hidden md:flex items-center gap-8 text-sm text-solar-gray-light">
          <a href="#beneficios" className="hover:text-white">Benefícios</a>
          <a href="#como-funciona" className="hover:text-white">Como Funciona</a>
          <a href="#planos" className="hover:text-white">Planos</a>
          <a href="#contato" className="hover:text-white">Contato</a>
        </nav>
        <a href="#simulador" className="btn-primary hidden md:inline-flex">Simular economia</a>
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
            Economize até 95% na sua conta de luz em Minas Gerais
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="section-subtitle mt-4"
          >
            Projetamos, instalamos e monitoramos sistemas solares sob medida para o clima mineiro.
          </motion.p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => document.getElementById('simulador')?.scrollIntoView({ behavior: 'smooth' })}
              className="btn-primary"
            >
              Peça seu estudo gratuito
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
            <button
              onClick={() => openWhatsApp('Olá! Quero meu estudo gratuito de energia solar com a Minas Solar.')} 
              className="btn-secondary"
            >
              Falar no WhatsApp
              <MessageCircle className="ml-2 h-4 w-4 text-solar-yellow" />
            </button>
          </div>
          <div className="mt-6 flex items-center gap-4 text-solar-gray-light text-sm">
            <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-solar-yellow" /> Garantia total</div>
            <div className="flex items-center gap-2"><Leaf className="h-4 w-4 text-solar-yellow" /> Sustentável</div>
            <div className="flex items-center gap-2"><Lock className="h-4 w-4 text-solar-yellow" /> Homologação</div>
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          <div className="aspect-[4/3] rounded-2xl border border-white/5 bg-gradient-to-br from-white/10 to-transparent p-2">
            <div className="h-full w-full rounded-xl bg-[url('https://images.unsplash.com/photo-1509395176047-4a66953fd231?q=80&w=1974&auto=format&fit=crop')] bg-cover bg-center" />
          </div>
          <div className="absolute -bottom-4 -left-4 hidden md:block h-24 w-24 rounded-xl bg-solar-yellow blur-3xl opacity-20" />
        </motion.div>
      </div>
    </section>
  )
}

function Simulador() {
  const [conta, setConta] = useState<number>(350)
  const [area, setArea] = useState<number>(30)
  const [cidade, setCidade] = useState<CityOption | null>(CITIES[0])

  const { economia, novaConta, roiAnos, potenciaKw } = useCalculator(conta, area, cidade)

  function handleWhatsApp() {
    const msg = `Olá, Minas Solar! Quero meu estudo gratuito.\n\nConta média: ${currencyBRL(conta)}\nÁrea disponível: ${area} m²\nCidade: ${cidade?.name}\n\nEconomia estimada: ${currencyBRL(economia)}/mês\nNova conta: ${currencyBRL(novaConta)}\nROI estimado: ${roiAnos.toFixed(1)} anos\nPotência aproximada: ${potenciaKw.toFixed(1)} kWp`
    openWhatsApp(msg)
  }

  return (
    <section id="simulador" className="py-16 md:py-24">
      <div className="container-section">
        <div className="max-w-3xl">
          <h2 className="section-title">Simule sua economia</h2>
          <p className="section-subtitle mt-2">Em menos de 1 minuto você tem uma estimativa realista para Minas Gerais.</p>
        </div>

        <div className="mt-8 grid md:grid-cols-5 gap-6">
          <div className="md:col-span-3 rounded-xl border border-white/10 bg-white/5 p-6">
            <div className="grid gap-4">
              <label className="grid gap-2">
                <span className="text-sm text-solar-gray-light">Conta média (R$)</span>
                <input
                  type="number"
                  min={50}
                  step={10}
                  value={conta}
                  onChange={(e) => setConta(Number(e.target.value))}
                  className="w-full rounded-md bg-black/40 border border-white/10 px-4 py-3 outline-none focus:ring-2 focus:ring-solar-yellow/40"
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm text-solar-gray-light">Área disponível (m²)</span>
                <input
                  type="number"
                  min={5}
                  step={1}
                  value={area}
                  onChange={(e) => setArea(Number(e.target.value))}
                  className="w-full rounded-md bg-black/40 border border-white/10 px-4 py-3 outline-none focus:ring-2 focus:ring-solar-yellow/40"
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm text-solar-gray-light">Cidade</span>
                <select
                  value={cidade?.name}
                  onChange={(e) => setCidade(CITIES.find(c => c.name === e.target.value) ?? null)}
                  className="w-full rounded-md bg-black/40 border border-white/10 px-4 py-3 outline-none focus:ring-2 focus:ring-solar-yellow/40"
                >
                  {CITIES.map(c => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </label>
              <button onClick={handleWhatsApp} className="btn-primary mt-2">
                Receber proposta no WhatsApp
                <MessageCircle className="ml-2 h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="md:col-span-2 rounded-xl border border-white/10 bg-white/5 p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-solar-gray-light">Economia mensal estimada</span>
                <span className="text-xl font-bold text-solar-yellow">{currencyBRL(economia)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-solar-gray-light">Nova conta estimada</span>
                <span className="text-xl font-semibold">{currencyBRL(novaConta)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-solar-gray-light">ROI estimado</span>
                <span className="text-xl font-semibold">{roiAnos > 0 ? `${roiAnos.toFixed(1)} anos` : '-'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-solar-gray-light">Potência aproximada</span>
                <span className="text-xl font-semibold">{potenciaKw > 0 ? `${potenciaKw.toFixed(1)} kWp` : '-'}</span>
              </div>
              <p className="text-xs text-solar-gray-light/80">Estimativas baseadas em dados médios de irradiação de MG. Resultado final depende de projeto técnico.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Beneficios() {
  const items = [
    { icon: PiggyBank, title: 'Economia imediata', desc: 'Reduza sua conta em até 95% logo no primeiro mês.' },
    { icon: Shield, title: 'Garantia e manutenção', desc: 'Equipamentos com garantia e assistência técnica completa.' },
    { icon: Leaf, title: 'Sustentável e valorização', desc: 'Imóvel mais valorizado e emissão de CO₂ reduzida.' },
  ]
  return (
    <section id="beneficios" className="py-16 md:py-24">
      <div className="container-section">
        <h2 className="section-title">Benefícios que fazem diferença</h2>
        <p className="section-subtitle mt-2">Soluções pensadas para o jeito mineiro: econômico, seguro e duradouro.</p>
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-xl border border-white/10 bg-white/5 p-6">
              <Icon className="h-7 w-7 text-solar-yellow" />
              <h3 className="mt-4 text-xl font-semibold">{title}</h3>
              <p className="mt-1 text-solar-gray-light">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ComoFunciona() {
  const steps = [
    { title: 'Diagnóstico gratuito', desc: 'Entendemos seu consumo e avaliamos seu telhado/área.' },
    { title: 'Projeto personalizado', desc: 'Solução sob medida para o seu imóvel e sua cidade.' },
    { title: 'Instalação e homologação', desc: 'Equipe própria, segurança total e tudo homologado.' },
  ]
  return (
    <section id="como-funciona" className="py-16 md:py-24">
      <div className="container-section">
        <h2 className="section-title">Como funciona</h2>
        <p className="section-subtitle mt-2">Da análise ao funcionamento, acompanhamos você de ponta a ponta.</p>
        <div className="mt-10 grid md:grid-cols-3 gap-6">
          {steps.map((s, i) => (
            <div key={s.title} className="rounded-xl border border-white/10 bg-white/5 p-6">
              <div className="flex items-center gap-3 text-solar-yellow">
                <div className="h-8 w-8 rounded-full border border-solar-yellow flex items-center justify-center font-bold">{i + 1}</div>
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
      price: 'a partir de R$ 499/mês',
      features: ['Redução de custos operacionais', 'Payback acelerado', 'Suporte prioritário'],
    },
    {
      name: 'Rural',
      price: 'financiado via bancos parceiros',
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
                  <li key={f} className="flex items-center gap-2"><Check className="h-4 w-4 text-solar-yellow" /> {f}</li>
                ))}
              </ul>
              <button onClick={() => openWhatsApp(`Quero proposta para o plano ${p.name} da Minas Solar.`)} className="btn-primary mt-4">Pedir proposta</button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Depoimentos() {
  const itens = [
    { nome: 'Ana Paula', cidade: 'Belo Horizonte', economia: 82, foto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1000&auto=format&fit=crop' },
    { nome: 'Carlos Eduardo', cidade: 'Uberlândia', economia: 90, foto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1000&auto=format&fit=crop' },
    { nome: 'Mariana Souza', cidade: 'Juiz de Fora', economia: 76, foto: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=1000&auto=format&fit=crop' },
  ]
  return (
    <section className="py-16 md:py-24">
      <div className="container-section">
        <h2 className="section-title">Clientes que já estão economizando</h2>
        <p className="section-subtitle mt-2">Histórias reais de mineiros que decidiram pagar menos na conta de luz.</p>
        <div className="mt-10 grid md:grid-cols-3 gap-6">
          {itens.map((d) => (
            <div key={d.nome} className="rounded-xl border border-white/10 bg-white/5 p-6">
              <div className="flex items-center gap-4">
                <img src={d.foto} alt={d.nome} className="h-12 w-12 rounded-full object-cover" />
                <div>
                  <p className="font-semibold">{d.nome}</p>
                  <p className="text-sm text-solar-gray-light">{d.cidade}</p>
                </div>
              </div>
              <p className="mt-4 text-solar-gray-light text-sm">“Minha conta caiu cerca de {d.economia}% logo nos primeiros meses. Atendimento nota 10!”</p>
            </div>
          ))}
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
    const msg = `Olá, Minas Solar!\n\nNome: ${nome}\nE-mail: ${email}\nTelefone: ${telefone}\nConta média: R$ ${contaMedia}\nCidade: ${cidade}\nMensagem: ${mensagem}`
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
          <input required value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome" className="rounded-md bg-black/40 border border-white/10 px-4 py-3 outline-none focus:ring-2 focus:ring-solar-yellow/40" />
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail" className="rounded-md bg-black/40 border border-white/10 px-4 py-3 outline-none focus:ring-2 focus:ring-solar-yellow/40" />
          <input required value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="Telefone/WhatsApp" className="rounded-md bg-black/40 border border-white/10 px-4 py-3 outline-none focus:ring-2 focus:ring-solar-yellow/40" />
          <input required value={contaMedia} onChange={(e) => setContaMedia(e.target.value)} placeholder="Conta média (R$)" className="rounded-md bg-black/40 border border-white/10 px-4 py-3 outline-none focus:ring-2 focus:ring-solar-yellow/40" />
          <input required value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder="Cidade" className="rounded-md bg-black/40 border border-white/10 px-4 py-3 outline-none focus:ring-2 focus:ring-solar-yellow/40 md:col-span-2" />
          <textarea value={mensagem} onChange={(e) => setMensagem(e.target.value)} placeholder="Mensagem" className="rounded-md bg-black/40 border border-white/10 px-4 py-3 outline-none focus:ring-2 focus:ring-solar-yellow/40 md:col-span-2 min-h-[120px]" />
          <button type="submit" className="btn-primary md:col-span-2">Enviar no WhatsApp</button>
        </form>
      </div>
    </section>
  )
}

function FAQ() {
  const faqs = [
    { q: 'Quanto posso economizar?', a: 'Clientes em MG chegam a reduzir até 95% da conta, dependendo do consumo e área disponível.' },
    { q: 'A energia solar funciona em dias nublados?', a: 'Sim, há geração mesmo com céu encoberto, porém menor. O dimensionamento considera essa variação.' },
    { q: 'Qual o prazo de instalação?', a: 'Após aprovação, a instalação ocorre geralmente em até 10 dias úteis, respeitando a homologação da distribuidora.' },
    { q: 'Precisa de manutenção?', a: 'Baixa manutenção. Recomendamos limpezas periódicas e checagens preventivas.' },
    { q: 'E se eu me mudar?', a: 'O sistema valoriza o imóvel. É possível realocar, mas recomendamos avaliação técnica.' },
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
                <ArrowRight className={`h-4 w-4 transition-transform ${open === i ? 'rotate-90 text-solar-yellow' : ''}`} />
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
    <section className="py-16 md:py-24">
      <div className="container-section text-center">
        <h2 className="section-title">Comece a economizar agora</h2>
        <p className="section-subtitle mt-2">Peça seu estudo gratuito e receba a proposta em até 24h úteis.</p>
        <button onClick={() => document.getElementById('simulador')?.scrollIntoView({ behavior: 'smooth' })} className="btn-primary mt-6">
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
          <div className="flex items-center gap-2">
            <Sun className="h-6 w-6 text-solar-yellow" />
            <span className="text-lg font-extrabold">Minas Solar</span>
          </div>
          <p className="mt-2 text-solar-gray-light text-sm">Energia solar para todo o estado de Minas Gerais.</p>
        </div>
        <div className="text-sm text-solar-gray-light">
          <p>Telefone: (31) 99999-9999</p>
          <p>E-mail: contato@minassolar.com.br</p>
          <p>Redes: Instagram • Facebook • LinkedIn</p>
        </div>
      </div>
      <div className="container-section mt-6 text-center text-xs text-solar-gray-light">© {new Date().getFullYear()} Minas Solar. Todos os direitos reservados.</div>
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
      <Contato />
      <FAQ />
      <CTAFinal />
      <Footer />
    </div>
  )
}
