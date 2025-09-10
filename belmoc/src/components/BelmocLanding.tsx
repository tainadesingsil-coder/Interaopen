import { motion } from 'framer-motion'
import { ArrowRight, LineChart, ShieldCheck, TrendingUp, Building2, Lock, CheckCircle2, Clock, Building } from 'lucide-react'

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
    <section className="relative overflow-hidden min-h-[78vh] md:min-h-[88vh] flex items-center">
      <div className="absolute inset-0" style={{
        background:
          'radial-gradient(900px 500px at 20% 10%, rgba(234,198,122,0.12), transparent 60%), radial-gradient(800px 600px at 80% 0%, rgba(234,198,122,0.08), transparent 60%), linear-gradient(180deg, #0B1628 0%, #0E1520 60%, #0A0F19 100%)'
      }} />
      <div className="container-section relative z-10 grid md:grid-cols-12 gap-6 md:gap-8 items-center pt-24 md:pt-28 pb-10">
        <div className="md:col-span-7">
          <img src="/logo.svg" alt="Belmoc" className="h-10 w-auto mb-4 opacity-95" />
          <motion.h1 initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{duration:0.6,ease:'easeOut'}} className="text-3xl md:text-6xl font-extrabold tracking-tight">
            Invista na sua usina solar e colha resultados para sempre.
          </motion.h1>
          <motion.p initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{duration:0.7,delay:0.1,ease:'easeOut'}} className="mt-3 md:mt-4 text-base md:text-xl text-white/80 max-w-2xl">
            Energia que gera patrimônio, economia e independência.
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
              <p className="mt-2 text-sm text-white/70">Investimento sólido</p>
              <p className="text-xl md:text-2xl font-bold">ROI previsível</p>
            </div>
            <div className="card">
              <TrendingUp className="h-5 w-5 text-[var(--gold)]" />
              <p className="mt-2 text-sm text-white/70">Valorização imobiliária</p>
              <p className="text-xl md:text-2xl font-bold">+ valor do imóvel</p>
            </div>
            <div className="card">
              <Building className="h-5 w-5 text-[var(--gold)]" />
              <p className="mt-2 text-sm text-white/70">Ativo real</p>
              <p className="text-xl md:text-2xl font-bold">no seu patrimônio</p>
            </div>
            <div className="card">
              <ShieldCheck className="h-5 w-5 text-[var(--gold)]" />
              <p className="mt-2 text-sm text-white/70">Independência energética</p>
              <p className="text-xl md:text-2xl font-bold">proteção contra alta</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Diferenciais(){
  const items=[
    { icon: LineChart, t:'Investimento sólido', d:'ROI previsível em poucos anos com geração própria.' },
    { icon: TrendingUp, t:'Valorização imobiliária', d:'Usinas elevam o valor de mercado do imóvel.' },
    { icon: ShieldCheck, t:'Independência energética', d:'Blindagem contra a inflação da energia no longo prazo.' },
    { icon: Building2, t:'Credibilidade local', d:'Referência no Norte de Minas, execução de ponta a ponta.' },
  ]
  return (
    <section className="py-10 md:py-16">
      <div className="container-section">
        <h2 className="text-2xl md:text-4xl font-extrabold">Diferenciais Belmoc</h2>
        <div className="mt-6 md:mt-8 grid md:grid-cols-4 gap-4 md:gap-6">
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
  const clientes = 180
  const items=[
    { n:'+200', l:'usinas instaladas em Minas Gerais' },
    { n:`+R$ ${economiaTotalMi} mi`, l:'em economia acumulada' },
    { n:`+${clientes}`, l:'clientes investidores satisfeitos' },
  ]
  return (
    <section className="py-8 md:py-12">
      <div className="container-section grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {items.map((x)=> (
          <div key={x.l} className="card text-center">
            <p className="text-2xl md:text-4xl font-extrabold text-[var(--gold)]">{x.n}</p>
            <p className="mt-1 text-sm text-white/70">{x.l}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function Narrativa(){
  return (
    <section className="py-10 md:py-14">
      <div className="container-section">
        <div className="card">
          <p className="text-base md:text-lg text-white/85">
            Na Belmoc, tratamos energia como ativo. Nossa visão é simples: cada usina instalada é
            um passo a mais rumo à independência energética e ao crescimento do seu patrimônio. Com
            engenharia própria e execução local, conectamos tecnologia e resultado financeiro de longo prazo.
          </p>
        </div>
      </div>
    </section>
  )
}

function Educativa(){
  const blocks=[
    { t:'Economia recorrente', d:'Redução mensal da fatura, gerando fluxo de caixa ao longo dos anos.' },
    { t:'Valorização patrimonial', d:'Usina agrega valor percebido e liquidez ao imóvel.' },
    { t:'Retorno garantido', d:'Projeto técnico e equipamentos com garantia estendida e performance monitorada.' },
  ]
  return (
    <section className="py-10 md:py-16">
      <div className="container-section">
        <h2 className="text-2xl md:text-4xl font-extrabold">Por que é um investimento inteligente?</h2>
        <div className="mt-6 grid md:grid-cols-3 gap-4 md:gap-6">
          {blocks.map(b=> (
            <div key={b.t} className="card">
              <p className="text-base md:text-lg font-semibold">{b.t}</p>
              <p className="mt-1 text-sm text-white/75">{b.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Exclusividade(){
  return (
    <section className="py-8 md:py-12">
      <div className="container-section">
        <div className="card md:flex md:items-center md:justify-between">
          <div>
            <h3 className="text-lg md:text-2xl font-extrabold">Mais do que energia, a Belmoc entrega patrimônio e independência para o Norte de Minas.</h3>
            <p className="mt-1 text-sm text-white/75">Projetos exclusivos, execução certificada e acompanhamento contínuo.</p>
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
    {q:'Qual o ROI típico?',a:'Payback esperado entre 3 e 5 anos, dependendo do perfil de consumo e tarifa local.'},
    {q:'Valoriza meu imóvel?',a:'Sim. Projetos com geração própria aumentam o valor percebido e atratividade.'},
    {q:'Garantia e manutenção?',a:'Equipamentos com garantia estendida e manutenção simples; monitoramento contínuo.'},
    {q:'Protege da inflação da energia?',a:'A geração própria reduz a exposição a reajustes, trazendo previsibilidade de custos.'},
    {q:'A Belmoc cuida de tudo?',a:'Da engenharia à homologação e operação assistida. Você acompanha os resultados.'},
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
        <h2 className="text-2xl md:text-4xl font-extrabold">Invista hoje e transforme energia em patrimônio.</h2>
        <p className="mt-2 text-white/75 max-w-2xl mx-auto">Receba uma avaliação técnica e uma proposta personalizada para seu imóvel.</p>
        <div className="mt-6">
          <a href={WHATSAPP_LINK} className="btn-yellow inline-flex">
            Falar com a Belmoc
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
        <Diferenciais/>
        <Narrativa/>
        <Numeros/>
        <Educativa/>
        <Exclusividade/>
        <FAQ/>
        <CTAFinal/>
      </main>
      <Footer/>
    </div>
  )
}

