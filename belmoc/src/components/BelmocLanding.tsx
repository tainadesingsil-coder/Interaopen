import { motion } from 'framer-motion'
import { ArrowRight, LineChart, ShieldCheck, TrendingUp, Building2, Lock, CheckCircle2, Clock } from 'lucide-react'

const WHATSAPP_LINK = 'https://wa.me/5538999266004?text=Quero%20investir%20em%20uma%20usina%20solar%20com%20a%20Belmoc'

function Header(){
  return (
    <header className="fixed top-0 z-40 w-full backdrop-blur border-b border-white/10" style={{ background: 'rgba(10,10,10,0.55)' }}>
      <div className="container-section flex items-center justify-between py-3">
        <a href="#" className="logo-wrap inline-flex items-center gap-3">
          <img src="/logo.svg" alt="Belmoc" className="h-[42px] md:h-[52px] w-auto" />
        </a>
        <a href={WHATSAPP_LINK} className="btn-yellow btn-pulse hidden sm:inline-flex" aria-label="Quero investir agora">
          Quero investir agora
          <ArrowRight className="ml-2 h-4 w-4" />
        </a>
      </div>
    </header>
  )
}

function Hero(){
  return (
    <section className="relative overflow-hidden min-h-[76vh] md:min-h-[86vh] flex items-center">
      <div className="absolute inset-0" style={{
        background:
          'radial-gradient(900px 500px at 20% 10%, rgba(234,198,122,0.12), transparent 60%), radial-gradient(800px 600px at 80% 0%, rgba(234,198,122,0.08), transparent 60%), linear-gradient(180deg, #0B0B0C 0%, #0E1116 60%, #0A0A0A 100%)'
      }} />
      <div className="container-section relative z-10 grid md:grid-cols-12 gap-6 md:gap-8 items-center pt-24 md:pt-28 pb-10">
        <div className="md:col-span-7">
          <motion.h1 initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{duration:0.6,ease:'easeOut'}} className="text-3xl md:text-6xl font-extrabold tracking-tight">
            Invista em energia que valoriza seu patrimônio.
          </motion.h1>
          <motion.p initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{duration:0.7,delay:0.1,ease:'easeOut'}} className="mt-3 md:mt-4 text-base md:text-xl text-[var(--muted)] max-w-2xl">
            A Belmoc instala sua usina solar, você ganha economia mensal e aumenta o valor do seu imóvel.
          </motion.p>
          <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{duration:0.7,delay:0.18,ease:'easeOut'}} className="mt-6 flex flex-wrap items-center gap-3">
            <a href={WHATSAPP_LINK} className="btn-yellow">
              Quero investir agora
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
            <div className="inline-flex items-center text-xs md:text-sm text-white/70">
              <ShieldCheck className="h-4 w-4 mr-2 text-[var(--gold)]" /> Consultoria premium e instalação homologada
            </div>
          </motion.div>
        </div>
        <div className="md:col-span-5">
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <div className="card">
              <LineChart className="h-5 w-5 text-[var(--gold)]" />
              <p className="mt-2 text-sm text-white/70">Retorno do investimento</p>
              <p className="text-xl md:text-2xl font-bold">ROI 3–5 anos</p>
            </div>
            <div className="card">
              <TrendingUp className="h-5 w-5 text-[var(--gold)]" />
              <p className="mt-2 text-sm text-white/70">Valorização imobiliária</p>
              <p className="text-xl md:text-2xl font-bold">até 10%</p>
            </div>
            <div className="card">
              <Building2 className="h-5 w-5 text-[var(--gold)]" />
              <p className="mt-2 text-sm text-white/70">Ativo real instalado</p>
              <p className="text-xl md:text-2xl font-bold">no seu imóvel</p>
            </div>
            <div className="card">
              <ShieldCheck className="h-5 w-5 text-[var(--gold)]" />
              <p className="mt-2 text-sm text-white/70">Proteção contra inflação</p>
              <p className="text-xl md:text-2xl font-bold">da energia</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Destaque(){
  const items=[
    { icon: LineChart, t:'ROI entre 3 e 5 anos.', d:'Receba retorno mensal com geração própria e reduza sua exposição a aumentos tarifários.' },
    { icon: TrendingUp, t:'Imóveis valorizam até 10%.', d:'Usina solar agrega liquidez e diferenciação ao seu patrimônio.' },
    { icon: ShieldCheck, t:'Proteção contra inflação da energia.', d:'Blindagem da conta de luz por décadas com tecnologia de alta eficiência.' },
  ]
  return (
    <section className="py-10 md:py-16">
      <div className="container-section">
        <h2 className="text-2xl md:text-4xl font-extrabold">Uma usina solar é mais que economia — é patrimônio que cresce.</h2>
        <div className="mt-6 md:mt-8 grid md:grid-cols-3 gap-4 md:gap-6">
          {items.map((x)=>{
            const Icon=x.icon
            return (
              <div key={x.t} className="card">
                <Icon className="h-5 w-5 text-[var(--gold)]" />
                <p className="mt-3 text-base md:text-lg font-semibold">{x.t}</p>
                <p className="mt-1 text-sm text-white/70">{x.d}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function Numeros(){
  const economiaTotalMi = 12
  const items=[
    { n:'+200', l:'usinas vendidas em Minas Gerais' },
    { n:`+R$ ${economiaTotalMi} mi`, l:'economizados por clientes' },
    { n:'100%', l:'de satisfação no Norte de Minas' },
  ]
  return (
    <section className="py-8 md:py-12">
      <div className="container-section grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {items.map((x)=> (
          <div key={x.l} className="card text-center">
            <p className="text-2xl md:text-3xl font-extrabold text-[var(--gold)]">{x.n}</p>
            <p className="mt-1 text-sm text-white/70">{x.l}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function ProvaSocial(){
  const depo=[
    {t:'Transformamos custo em ativo. O payback veio antes do previsto.',a:'Medular — Case de investimento'},
    {t:'A usina elevou o valuation e reduziu volatilidade da operação.',a:'Amávia — Case corporativo'},
  ]
  return (
    <section className="py-10 md:py-14">
      <div className="container-section grid gap-3 md:gap-4">
        {depo.map((d)=> (
          <div key={d.a} className="card">
            <p className="text-base md:text-lg italic">“{d.t}”</p>
            <p className="mt-2 text-xs md:text-sm text-white/70">{d.a}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function ComoFunciona(){
  const steps=[
    { n:1, t:'Estudo, projeto e proposta', d:'Análise técnica e financeira personalizada do seu imóvel e consumo.' },
    { n:2, t:'Instalação e homologação', d:'Execução por equipe certificada, com segurança e conformidade total.' },
    { n:3, t:'Operação e retorno mensal', d:'Monitoramento, manutenção e rentabilidade com redução recorrente da fatura.' },
  ]
  return (
    <section className="py-10 md:py-16">
      <div className="container-section">
        <h2 className="text-2xl md:text-4xl font-extrabold">Como funciona</h2>
        <div className="mt-6 grid md:grid-cols-3 gap-4 md:gap-6">
          {steps.map((s)=> (
            <div key={s.n} className="card">
              <div className="flex items-center gap-3">
                <div className="step-circle" style={{ background: 'var(--gold)' }}>{s.n}</div>
                <p className="font-semibold text-base md:text-lg">{s.t}</p>
              </div>
              <p className="mt-2 text-sm text-white/75">{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Autoridade(){
  return (
    <section className="py-8 md:py-12">
      <div className="container-section">
        <div className="card md:flex md:items-center md:justify-between">
          <div>
            <h3 className="text-lg md:text-2xl font-extrabold">Belmoc — referência em usinas solares no Norte de Minas.</h3>
            <p className="mt-1 text-sm text-white/75">Engenharia, execução e atendimento premium de ponta a ponta.</p>
          </div>
          <div className="mt-3 md:mt-0 inline-flex items-center text-sm text-white/80">
            <Lock className="h-4 w-4 mr-2 text-[var(--gold)]" />
            <span>🔒 Site seguro</span>
          </div>
        </div>
      </div>
    </section>
  )
}

function FAQ(){
  const qas=[
    {q:'Qual é o ROI típico de uma usina solar?',a:'Projetos residenciais e corporativos apresentam payback entre 3 e 5 anos, variando pela tarifa local e perfil de consumo.'},
    {q:'Usina solar valoriza meu imóvel?',a:'Sim. Empreendimentos com geração própria são percebidos como mais eficientes, podendo valorizar até 10%.'},
    {q:'E a manutenção ao longo dos anos?',a:'Baixa. Recomendamos inspeções periódicas e limpeza. Equipamentos possuem garantias estendidas.'},
    {q:'A energia aumenta todo ano. Isso me protege?',a:'A geração própria reduz sua exposição a aumentos, fornecendo previsibilidade de custos por décadas.'},
    {q:'Belmoc cuida de tudo?',a:'Da engenharia à homologação e monitoramento. Você acompanha a performance e colhe os resultados.'},
  ]
  return (
    <section className="py-10 md:py-14">
      <div className="container-section">
        <div className="grid gap-3">
          {qas.map((x)=> (
            <div key={x.q} className="card">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 mt-0.5 text-[var(--gold)]" />
                <div>
                  <p className="font-medium text-base md:text-lg">{x.q}</p>
                  <p className="mt-1 text-sm text-white/75">{x.a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CTAFinal(){
  return (
    <section className="py-12 md:py-16">
      <div className="container-section text-center">
        <h2 className="text-2xl md:text-4xl font-extrabold">Invista hoje em uma usina solar e colha benefícios para sempre.</h2>
        <p className="mt-2 text-white/75 max-w-2xl mx-auto">Avaliação técnica rápida e proposta sob medida para seu imóvel.</p>
        <div className="mt-6">
          <a href={WHATSAPP_LINK} className="btn-yellow inline-flex">
            Quero investir com a Belmoc
            <ArrowRight className="ml-2 h-4 w-4" />
          </a>
        </div>
        <div className="mt-3 inline-flex items-center text-xs text-white/60">
          <Clock className="h-3.5 w-3.5 mr-1.5" /> Proposta em até 24h úteis
        </div>
      </div>
    </section>
  )
}

function Footer(){
  return (
    <footer className="py-8">
      <div className="container-section">
        <p className="text-center text-xs md:text-sm text-white/70">
          © 2025 Belmoc — Todos os direitos reservados | 🔒 Site seguro | Desenvolvido por Codexion
        </p>
      </div>
    </footer>
  )
}

export default function BelmocLanding(){
  return (
    <div className="min-h-screen flex flex-col">
      <Header/>
      <main className="flex-1">
        <Hero/>
        <Destaque/>
        <Numeros/>
        <ProvaSocial/>
        <ComoFunciona/>
        <Autoridade/>
        <FAQ/>
        <CTAFinal/>
      </main>
      <Footer/>
    </div>
  )
}

