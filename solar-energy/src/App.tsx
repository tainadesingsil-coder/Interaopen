import { useMemo, useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { Sun, Home, Leaf, ChevronDown, Quote, Instagram, Facebook, Youtube } from 'lucide-react'
import './index.css'
import HeroMinimal from './components/HeroMinimal'

function Header() {
  return (
    <header className="header">
      <div className="container-section flex items-center justify-between py-3">
        <a href="#" className="logo-wrap">
          <img src="/logo.png" alt="Solar Energy" className="h-[96px] w-auto" />
        </a>
        <div className="flex items-center gap-2">
          <a href="#" aria-label="Instagram" className="social">
            <Instagram size={12} strokeWidth={1.2} className="text-white" />
          </a>
          <a href="#" aria-label="Facebook" className="social">
            <Facebook size={12} strokeWidth={1.2} className="text-white" />
          </a>
          <a href="#" aria-label="YouTube" className="social">
            <Youtube size={12} strokeWidth={1.2} className="text-white" />
          </a>
        </div>
      </div>
    </header>
  )
}

function Beneficios() {
  const items = [
    { icon: Sun, title: 'Economia REAL desde o primeiro mês', desc: 'Pare de sangrar no boleto: sua conta pode despencar.' },
    { icon: Home, title: 'Garantia de até 25 anos', desc: 'Energia confiável, sem dor de cabeça — segurança por décadas.' },
    { icon: Leaf, title: 'Energia limpa que valoriza', desc: 'Sua casa vale mais e você gasta menos. Simples assim.' },
  ]
  return (
    <section className="py-12 md:py-16">
      <div className="container-section grid md:grid-cols-3 gap-6">
        {items.map(({icon:Icon,title,desc})=> (
          <div key={title} className="card-aggressive">
            <Icon className="icon-large" />
            <h3 className="mt-4 text-lg font-bold">{title}</h3>
            <p className="mt-1 text-[var(--muted)] text-sm">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function useCalc(conta:number, area:number, cidade:string){
  return useMemo(()=>{
    if(!conta||!area||!cidade) return {e:0,p:0,n:0,r:0}
    const tarifa=0.95, irr=150
    const prod= area*irr*0.18
    const gasto= conta/tarifa
    const ecoK= Math.min(prod,gasto)
    const e= ecoK*tarifa
    const p= Math.min(100, e/Math.max(conta,1)*100)
    const n= Math.max(conta-e, 49.9)
    const r= (Math.max(prod/120,1)*5200)/(e*12)
    return {e,p,n,r}
  },[conta,area,cidade])
}

function Simulador(){
  const [conta,setConta]=useState(300)
  const [area,setArea]=useState(25)
  const [cidade,setCidade]=useState('Belo Horizonte')
  const {e,p,n,r}=useCalc(conta,area,cidade)
  const brl=(v:number)=>v.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})
  return (
    <section className="py-12 md:py-16">
      <div className="container-section">
        <h2 className="text-2xl md:text-3xl font-bold">Veja agora quanto seu bolso pode recuperar</h2>
        <p className="section-subtitle mt-1">Sua conta não pode esperar. Simule e descubra seu alívio imediato.</p>
        <div className="mt-6 grid md:grid-cols-5 gap-6">
          <div className="md:col-span-3 grid gap-3">
            <input className="input" type="number" min={50} step={10} value={conta} onChange={e=>setConta(Number(e.target.value))} placeholder="O que você paga hoje (R$/mês)" />
            <input className="input" type="number" min={5} step={1} value={area} onChange={e=>setArea(Number(e.target.value))} placeholder="Área útil no telhado (m²)" />
            <input className="input" value={cidade} onChange={e=>setCidade(e.target.value)} placeholder="Cidade" />
          </div>
          <div className="md:col-span-2 grid gap-3">
            <div className="card"><p className="text-[var(--muted)] text-sm">O que você devolve ao seu bolso</p><p className="mt-1 text-xl font-bold text-[var(--yellow)]">{brl(e)} ({p.toFixed(0)}%)</p></div>
            <div className="card"><p className="text-[var(--muted)] text-sm">Sua nova conta estimada</p><p className="mt-1 text-xl font-semibold">{brl(n)}</p></div>
            <div className="card"><p className="text-[var(--muted)] text-sm">Em quantos anos se paga</p><p className="mt-1 text-xl font-semibold">{r>0? `${r.toFixed(1)} anos`:'-'}</p></div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Steps(){
  const railRef = useRef<HTMLDivElement>(null)
  const inView = useInView(railRef, { once: true, margin: '-20% 0px -20% 0px' })
  useEffect(()=>{
    if(!railRef.current) return
    const mask = railRef.current.querySelector<HTMLDivElement>('.mask')
    if(inView && mask){ mask.animate([{width:'0%'},{width:'100%'}], {duration:1200, fill:'forwards', easing:'ease-out'}) }
  },[inView])
  const steps=[
    {n:1,t:'Agende sua simulação gratuita',d:'Simples, rápido e sem compromisso.'},
    {n:2,t:'Receba seu projeto sob medida',d:'Clareza total de economia e prazos.'},
    {n:3,t:'Instalação expressa e ativação',d:'Veja sua conta despencar já nos próximos meses.'},
  ]
  return (
    <section className="py-12 md:py-16">
      <div className="container-section relative">
        <div ref={railRef} className="steps-rail"><div className="mask"/></div>
        <div className="grid md:grid-cols-3 gap-6">
          {steps.map(s=> (
            <div key={s.n} className="card">
              <div className="step-circle">{s.n}</div>
              <h3 className="mt-3 font-semibold">{s.t}</h3>
              <p className="mt-1 text-[var(--muted)] text-sm">{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Depoimentos(){
  const items=[
    {t:'Minha conta foi de R$ 740 para R$ 80 em 3 meses com a Solar Energy.',a:'Ana, BH',img:'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop'},
    {t:'Reduzi 87% em 90 dias. Processo claro e sem dor de cabeça.',a:'Marcos, Contagem',img:'https://images.unsplash.com/photo-1520974692973-ac47dfb7fd89?q=80&w=200&auto=format&fit=crop'},
    {t:'Instalação rápida, atendimento local e economia visível.',a:'Paula, Nova Lima',img:'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop'},
  ]
  return (
    <section className="py-12 md:py-16">
      <div className="container-section grid gap-4">
        {items.map((d,i)=> (
          <div key={i} className="card flex items-center gap-4">
            <img src={d.img} alt={d.a} className="h-12 w-12 rounded-full object-cover" />
            <Quote className="h-5 w-5 text-[var(--yellow)]" />
            <p className="italic">“{d.t}”</p>
            <span className="ml-auto text-sm text-[var(--muted)]">— {d.a}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

function FAQ(){
  const qas=[
    {q:'Preciso trocar meu telhado?',a:'Na maioria dos casos, não. Adaptamos ao seu padrão com eficiência — sem obras desnecessárias.'},
    {q:'E se faltar sol?',a:'Seus créditos compensam. Sua conta nunca fica no escuro.'},
    {q:'Quanto tempo para instalar?',a:'Em poucos dias úteis você já está economizando.'},
    {q:'Qual a garantia?',a:'Painéis e sistema com cobertura de até 25 anos. Segurança e tranquilidade.'},
  ]
  const [open,setOpen]=useState<number|null>(0)
  return (
    <section className="py-12 md:py-16">
      <div className="container-section">
        <div className="grid gap-3">
          {qas.map((x,i)=> (
            <div key={i} className="card">
              <button onClick={()=>setOpen(open===i?null:i)} className="w-full flex items-center justify-between text-left">
                <span className="font-medium">{x.q}</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${open===i?'rotate-180 text-[var(--blue)]':''}`} />
              </button>
              <AnimatePresence>
                {open===i && (
                  <motion.p initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}} transition={{duration:0.25}} className="mt-2 text-[var(--muted)] text-sm">
                    {x.a}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CTAFinal(){
  return (
    <section className="section-blue py-14 md:py-16">
      <div className="container-section grid md:grid-cols-2 gap-6 items-center">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold">Sua economia começou quando você clicou. Vamos fazer acontecer.</h2>
          <p className="mt-2 opacity-90">Pare de pagar caro. Fale com um especialista agora e receba seu plano ideal.</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <input className="input" placeholder="Nome" />
          <input className="input" placeholder="Telefone" />
          <input className="input sm:col-span-2" placeholder="E-mail" />
          <button className="btn-yellow sm:col-span-2">Simular minha economia AGORA</button>
        </div>
      </div>
    </section>
  )
}

function Plates3D(){
  const logos=['https://dummyimage.com/100x40/ffffff/000000.png&text=Parceiro+A','https://dummyimage.com/120x40/ffffff/000000.png&text=Parceiro+B','https://dummyimage.com/90x40/ffffff/000000.png&text=Parceiro+C','https://dummyimage.com/140x40/ffffff/000000.png&text=Parceiro+D']
  const track=[...logos,...logos]
  return (
    <section className="py-12 md:py-16">
      <div className="container-section">
        <div className="lead-thin max-w-xl">
          <input placeholder="Seu e-mail" />
          <button className="btn-yellow">Começar a economizar hoje</button>
        </div>
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <div className="plate-3d rounded-2xl p-6">
            <h3 className="text-lg font-bold">Confiança que se paga</h3>
            <p className="mt-1 text-[var(--muted)] text-sm">Facilidade total no pagamento. Parcelamento leve como sua conta.</p>
          </div>
          <div className="plate-3d rounded-2xl p-6">
            <h3 className="text-lg font-bold">Prova de benefício</h3>
            <p className="mt-1 text-[var(--muted)] text-sm">Mais de 500 projetos entregues em MG — residências, comércios e áreas rurais.</p>
          </div>
          <div className="plate-3d rounded-2xl p-6">
            <h3 className="text-lg font-bold">É agora ou nunca</h3>
            <p className="mt-1 text-[var(--muted)] text-sm">Proposta gratuita em 24h e instalação expressa. Sua conta não pode esperar.</p>
          </div>
        </div>
        <div className="logo-marquee mt-10">
          <motion.div className="logo-track" animate={{ x: ['0%','-50%'] }} transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}>
            {track.map((src,i)=> (
              <div key={src+i} className="neon-soft rounded-md border border-white/10 bg-white/5 p-3">
                <img src={src} className="h-8 w-auto opacity-90" />
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function Footer(){
  return (
    <footer className="footer py-8">
      <div className="footer-neon-line" />
      <div className="container-section flex flex-col items-center gap-2 mt-4">
        <div className="font-semibold">Solar Energy</div>
        <div className="text-sm text-[var(--muted)]">contato@solarenergy.com.br</div>
        <div className="text-xs text-[var(--muted)]">© {new Date().getFullYear()} Solar Energy. Todos os direitos reservados.</div>
      </div>
    </footer>
  )
}

export default function App(){
  return (
    <div>
      <Header/>
      <HeroMinimal imageUrl="https://images.unsplash.com/photo-1509395176047-4a66953fd231?q=80&w=1920&auto=format&fit=crop"/>
      <Beneficios/>
      <Simulador/>
      <Steps/>
      <Depoimentos/>
      <FAQ/>
      <Plates3D/>
      <CTAFinal/>
      <Footer/>
      <div className="sticky-cta md:hidden">
        <div className="container-section py-3 text-center">
          <button className="btn-blue w-full">Simule e comece a economizar hoje</button>
        </div>
      </div>
    </div>
  )
}
