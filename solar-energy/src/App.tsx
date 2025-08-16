import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Sun, Home, Leaf } from 'lucide-react'
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
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1509395176047-4a66953fd231?q=80&w=1920&auto=format&fit=crop')] bg-cover bg-center opacity-15" />
      <div className="container-section relative">
        <motion.h1 initial={{opacity:0,y:8}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.5}} className="section-title text-center">
          Reduza sua conta de luz em até 20% com energia solar.
        </motion.h1>
        <motion.p initial={{opacity:0,y:8}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:0.1,duration:0.5}} className="section-subtitle mt-3 text-center">
          Energia limpa, acessível e sustentável para sua casa ou empresa.
        </motion.p>
        <div className="mt-6 max-w-3xl mx-auto grid md:grid-cols-4 gap-3">
          <input className="input" placeholder="Nome" value={nome} onChange={(e)=>setNome(e.target.value)} />
          <input className="input" placeholder="Telefone" value={tel} onChange={(e)=>setTel(e.target.value)} />
          <input className="input" placeholder="E-mail" value={email} onChange={(e)=>setEmail(e.target.value)} />
          <button className="btn-yellow">Quero economizar agora</button>
        </div>
      </div>
    </section>
  )
}

function Beneficios() {
  const items = [
    { icon: Sun, title: 'Economia real', desc: 'Até 20% a menos na sua conta.' },
    { icon: Home, title: 'Solução simples', desc: 'Sem complicação, acessível.' },
    { icon: Leaf, title: 'Energia limpa', desc: 'Sustentável e responsável.' },
  ]
  return (
    <section className="py-12 md:py-16 bg-[var(--bg-muted)]">
      <div className="container-section">
        <div className="grid md:grid-cols-3 gap-6">
          {items.map(({icon:Icon,title,desc})=> (
            <div key={title} className="card text-center">
              <Icon className="mx-auto h-6 w-6 text-[var(--blue)]" />
              <h3 className="mt-3 font-semibold">{title}</h3>
              <p className="mt-1 text-[var(--muted)] text-sm">{desc}</p>
            </div>
          ))}
        </div>
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
        <h2 className="text-2xl md:text-3xl font-bold">Simule sua economia</h2>
        <p className="section-subtitle mt-1">Descubra agora seu potencial de economia.</p>
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

function ComoFunciona(){
  const steps=[
    {n:1,t:'Analisamos seu consumo',d:'Entenda seu perfil e oportunidades.'},
    {n:2,t:'Mostramos como aplicar',d:'Simulação clara e sem complicação.'},
    {n:3,t:'Você paga menos luz',d:'Aproveite a economia de até 20%.'},
  ]
  return (
    <section className="py-12 md:py-16 bg-[var(--bg-muted)]">
      <div className="container-section">
        <h2 className="text-2xl md:text-3xl font-bold">Como funciona</h2>
        <div className="mt-6 grid md:grid-cols-3 gap-6">
          {steps.map(s=> (
            <div key={s.n} className="card">
              <div className="text-4xl font-extrabold text-[var(--blue)]">{s.n}</div>
              <h3 className="mt-2 font-semibold">{s.t}</h3>
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
    {t:'“Minha conta caiu 20% sem complicação.”',a:'Carlos, MG'},
    {t:'“Simples, rápido e eficiente.”',a:'Aline, BH'},
    {t:'“A economia veio no primeiro mês.”',a:'Rogério, Contagem'},
  ]
  return (
    <section className="py-12 md:py-16">
      <div className="container-section">
        <div className="grid md:grid-cols-3 gap-6">
          {items.map((d,i)=> (
            <blockquote key={i} className="card italic"><p>{d.t}</p><p className="mt-2 not-italic text-sm text-[var(--muted)]">— {d.a}</p></blockquote>
          ))}
        </div>
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
  return (
    <section className="py-12 md:py-16 bg-[var(--bg-muted)]">
      <div className="container-section">
        <h2 className="text-2xl md:text-3xl font-bold">Perguntas frequentes</h2>
        <div className="mt-6 grid gap-3">
          {qas.map((x,i)=> (
            <details key={i} className="card">
              <summary className="cursor-pointer font-medium">{x.q}</summary>
              <p className="mt-2 text-[var(--muted)] text-sm">{x.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

function CTAFinal(){
  return (
    <section className="section-blue py-14 md:py-16 text-center">
      <div className="container-section">
        <h2 className="text-2xl md:text-3xl font-bold">Está pronto para economizar até 20% na sua conta de luz?</h2>
        <button className="btn-yellow mt-6 inline-flex items-center">Sim, quero economizar<ArrowRight className="ml-2 h-4 w-4"/></button>
      </div>
    </section>
  )
}

function Footer(){
  return (
    <footer className="footer py-8">
      <div className="container-section flex flex-col md:flex-row items-center md:items-start justify-between gap-4">
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
      <ComoFunciona/>
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
