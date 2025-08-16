import { useMemo, useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { ArrowRight, Sun, Home, Leaf, ChevronDown, Quote } from 'lucide-react'
import './index.css'

function Header() {
  return (
    <header className="header">
      <div className="container-section flex items-center justify-between py-3">
        <a href="#" className="font-extrabold tracking-tight">Solar Energy</a>
        <a href="tel:+5531999999999" className="text-sm text-[var(--muted)]">+55 31 99999-9999</a>
      </div>
    </header>
  )
}

function Hero() {
  const [nome, setNome] = useState('')
  const [tel, setTel] = useState('')
  const [email, setEmail] = useState('')
  return (
    <section className="relative pt-24 md:pt-32 pb-12 md:pb-16">
      <div className="container-section relative grid md:grid-cols-2 gap-8 items-center">
        <div>
          <motion.h1 initial={{opacity:0,y:12}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.6}} className="section-title">
            Reduza sua conta de luz em até 20% com energia solar.
          </motion.h1>
          <motion.p initial={{opacity:0,y:12}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:0.1,duration:0.6}} className="section-subtitle mt-3">
            Energia limpa, acessível e sustentável.
          </motion.p>
          <div className="mt-6 grid md:grid-cols-4 gap-3">
            <input className="input" placeholder="Nome" value={nome} onChange={(e)=>setNome(e.target.value)} />
            <input className="input" placeholder="Telefone" value={tel} onChange={(e)=>setTel(e.target.value)} />
            <input className="input" placeholder="E-mail" value={email} onChange={(e)=>setEmail(e.target.value)} />
            <button className="btn-yellow">Quero economizar agora</button>
          </div>
        </div>
        <motion.div initial={{opacity:0,x:20}} whileInView={{opacity:1,x:0}} viewport={{once:true}} transition={{duration:0.6}} className="relative">
          <div className="rounded-2xl overflow-hidden border-2 border-white shadow-2xl">
            <div className="aspect-[4/3] bg-[url('https://i.postimg.cc/vmFXZQSh/Chat-GPT-Image-15-de-ago-de-2025-23-40-27.png')] bg-cover bg-center" />
          </div>
          <div className="absolute -bottom-6 -left-6 w-40 rounded-xl overflow-hidden border-2 border-white shadow-xl">
            <div className="aspect-[4/3] bg-[url('https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=800&auto=format&fit=crop')] bg-cover bg-center" />
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function Beneficios() {
  const items = [
    { icon: Sun, title: 'Economia real de até 20%', desc: 'Menos na sua conta, mais no seu bolso.' },
    { icon: Home, title: 'Residência e empresa', desc: 'Planos sob medida para cada perfil.' },
    { icon: Leaf, title: 'Energia limpa', desc: 'Sustentável, moderna e confiável.' },
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
    <section className="py-12 md:py-16 gradient-blue-white">
      <div className="container-section">
        <h2 className="text-2xl md:text-3xl font-bold">Simule sua economia</h2>
        <p className="section-subtitle mt-1">Vê na hora quanto pode economizar.</p>
        <div className="mt-6 grid md:grid-cols-5 gap-6">
          <div className="md:col-span-3 grid gap-3">
            <input className="input" type="number" min={50} step={10} value={conta} onChange={e=>setConta(Number(e.target.value))} placeholder="Conta média (R$/mês)" />
            <input className="input" type="number" min={5} step={1} value={area} onChange={e=>setArea(Number(e.target.value))} placeholder="Área útil (m²)" />
            <input className="input" value={cidade} onChange={e=>setCidade(e.target.value)} placeholder="Cidade" />
          </div>
          <div className="md:col-span-2 grid gap-3">
            <div className="card"><p className="text-[var(--muted)] text-sm">Economia estimada</p><p className="mt-1 text-xl font-bold text-[var(--blue)]">{brl(e)} ({p.toFixed(0)}%)</p></div>
            <div className="card"><p className="text-[var(--muted)] text-sm">Nova conta</p><p className="mt-1 text-xl font-semibold">{brl(n)}</p></div>
            <div className="card"><p className="text-[var(--muted)] text-sm">ROI estimado</p><p className="mt-1 text-xl font-semibold">{r>0? `${r.toFixed(1)} anos`:'-'}</p></div>
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
    {n:1,t:'Analisamos seu consumo',d:'Você entende seu perfil e oportunidades.'},
    {n:2,t:'Mostramos o plano ideal',d:'Sem complicação e com clareza.'},
    {n:3,t:'Você paga menos luz',d:'Aproveite a economia de até 20%.'},
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
    {t:'Minha conta caiu 20% sem complicação.',a:'Carlos, MG',img:'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop'},
    {t:'Foi simples, rápido e eficiente.',a:'Aline, BH',img:'https://images.unsplash.com/photo-1520974692973-ac47dfb7fd89?q=80&w=200&auto=format&fit=crop'},
    {t:'A economia veio logo no primeiro mês.',a:'Rogério, Contagem',img:'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop'},
  ]
  return (
    <section className="py-12 md:py-16 gradient-blue-white">
      <div className="container-section grid gap-4">
        {items.map((d,i)=> (
          <div key={i} className="card flex items-center gap-4">
            <img src={d.img} alt={d.a} className="h-12 w-12 rounded-full object-cover" />
            <Quote className="h-5 w-5 text-[var(--blue)]" />
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
    {q:'Preciso comprar algum equipamento?',a:'Não. Nosso foco é mostrar como economizar de forma simples.'},
    {q:'Funciona para residência e empresa?',a:'Sim. Adaptamos para cada perfil e necessidade.'},
    {q:'Preciso instalar agora?',a:'Você decide o momento ideal. Estamos prontos para orientar.'},
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
          <h2 className="text-2xl md:text-3xl font-bold">Pronto para economizar até 20%?</h2>
          <p className="mt-2 opacity-90">Fale com um especialista e receba seu plano ideal.</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <input className="input" placeholder="Nome" />
          <input className="input" placeholder="Telefone" />
          <input className="input sm:col-span-2" placeholder="E-mail" />
          <button className="btn-yellow sm:col-span-2">Quero economizar agora</button>
        </div>
      </div>
    </section>
  )
}

function Footer(){
  return (
    <footer className="footer py-8">
      <div className="container-section flex flex-col items-center gap-2">
        <div className="font-semibold">Solar Energy</div>
        <div className="text-sm text-[var(--muted)]">+55 31 99999-9999 • contato@solarenergy.com.br</div>
        <div className="text-xs text-[var(--muted)]">© {new Date().getFullYear()} Solar Energy. Todos os direitos reservados.</div>
      </div>
    </footer>
  )
}

export default function App(){
  return (
    <div>
      <Header/>
      <Hero/>
      <Beneficios/>
      <Simulador/>
      <Steps/>
      <Depoimentos/>
      <FAQ/>
      <CTAFinal/>
      <Footer/>
      <div className="sticky-cta md:hidden">
        <div className="container-section py-3 text-center">
          <button className="btn-blue w-full">Quero economizar agora</button>
        </div>
      </div>
    </div>
  )
}
