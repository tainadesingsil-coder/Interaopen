import { useMemo, useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { Sun, Home, Leaf, ChevronDown, Quote } from 'lucide-react'
import './index.css'
import HeroMinimal from './components/HeroMinimal'

function Header() {
  return (
    <header className="header">
      <div className="container-section flex items-center justify-between py-3">
        <a href="#" className="logo-wrap">
          <img src="/logo.png" alt="Solar Energy" className="h-[96px] w-auto" />
        </a>
      </div>
    </header>
  )
}

function Beneficios() {
  const [open,setOpen]=useState<number|null>(null)
  const items = [
    { icon: Sun, title: '20% de desconto direto na fatura', desc: 'Desconto aplicado todo mês.', detail: 'Assine agora e veja o abatimento aparecer no próximo ciclo. Sem visita técnica e sem obras.' },
    { icon: Home, title: 'Você paga só o mínimo da Cemig', desc: 'O restante vira economia.', detail: 'Seu fornecimento segue igual. A diferença é abatida e você acompanha na própria fatura.' },
    { icon: Leaf, title: 'Simples, claro e garantido', desc: 'Sem burocracia.', detail: 'Cadastro em minutos e contrato digital. Transparência total para você pagar menos.' },
  ]
  return (
    <section className="py-8 md:py-14">
      <div className="container-section grid md:grid-cols-3 gap-4 md:gap-6">
        {items.map((it,i)=> {
          const Icon = it.icon
          const isOpen = open===i
          return (
            <div key={it.title} className="card-aggressive cursor-pointer" onClick={()=>setOpen(isOpen?null:i)}>
              <Icon className="icon-large" />
              <h3 className="mt-3 md:mt-4 text-base md:text-lg font-bold">{it.title}</h3>
              <p className="mt-1 text-[var(--muted)] text-sm">{it.desc}</p>
              <AnimatePresence>
                {isOpen && (
                  <motion.p initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}} transition={{duration:0.25}} className="mt-3 text-sm opacity-90">
                    {it.detail}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function useCalc(conta:number){
  return useMemo(()=>{
    if(!conta || conta <= 0) return {economiaMensal:0, porcentagem:0, novaConta:0, economiaAnual:0}
    const porcentagem = 20 // 20% de desconto garantido
    const economiaMensal = (conta * porcentagem) / 100
    const novaConta = Math.max(conta - economiaMensal, 0)
    const economiaAnual = economiaMensal * 12
    return {economiaMensal, porcentagem, novaConta, economiaAnual}
  },[conta])
}

function Simulador(){
  const [conta,setConta]=useState(300)
  const [cidade,setCidade]=useState('')
  const [suggestOpen,setSuggestOpen]=useState(false)
  const [cidades,setCidades]=useState<string[]>([])
  const {economiaMensal, porcentagem, novaConta, economiaAnual}=useCalc(conta)
  const brl=(v:number)=>v.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})

  const fallbackCidades = useMemo(()=>[
    'Belo Horizonte','Uberlândia','Contagem','Juiz de Fora','Betim','Montes Claros','Ribeirão das Neves','Uberaba','Governador Valadares','Ipatinga','Sete Lagoas','Divinópolis','Santa Luzia','Ibirité','Poços de Caldas','Patos de Minas','Pouso Alegre','Barbacena','Teófilo Otoni','Sabará','Varginha','Itabira','Araguari','Passos','Alfenas','Conselheiro Lafaiete','Ituiutaba','Patrocínio','Ponte Nova','Coronel Fabriciano'
  ],[])

  useEffect(()=>{
    let cancelled=false
    fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados/MG/municipios')
      .then(r=>r.json())
      .then((data)=>{
        if(cancelled) return
        const nomes = Array.isArray(data) ? data.map((m:any)=>m.nome as string) : []
        setCidades(nomes.length? nomes : fallbackCidades)
      })
      .catch(()=> setCidades(fallbackCidades))
    return ()=>{ cancelled=true }
  },[fallbackCidades])

  const sugestoes = useMemo(()=>{
    const q = (cidade||'').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu,'')
    return cidades
      .filter(n=> n && n.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu,'').startsWith(q))
      .slice(0,12)
  },[cidade,cidades])

  return (
    <section className="py-8 md:py-14">
      <div className="container-section">
        <h2 className="text-xl md:text-3xl font-bold">Veja agora quanto volta para você todo mês</h2>
        <p className="section-subtitle mt-1">Digite o valor da sua conta e selecione a cidade em MG. As sugestões aparecem enquanto você digita.</p>
        <div className="mt-4 md:mt-6 grid md:grid-cols-5 gap-4 md:gap-6">
          <div className="md:col-span-3 grid gap-3">
            <input className="input" inputMode="numeric" pattern="[0-9]*" type="number" min={50} step={10} value={conta} onChange={e=>setConta(Number(e.target.value))} placeholder="O que você paga hoje (R$/mês)" />
            <p className="text-xs text-[var(--muted)] -mt-1">Exemplo: R$ 300 = sua conta mensal atual. Ajuste para o valor da sua fatura.</p>
            <div className="relative">
              <input
                className="input"
                value={cidade}
                onChange={e=>{ setCidade(e.target.value); setSuggestOpen(true) }}
                onFocus={()=> setSuggestOpen(true)}
                placeholder="Cidade em Minas Gerais"
                autoComplete="off"
              />
              {suggestOpen && cidade && (
                <div className="absolute z-20 mt-1 w-full rounded-md border border-white/10 bg-white/95 text-slate-800 shadow-xl max-h-60 overflow-auto">
                  {sugestoes.length===0 && (
                    <div className="px-3 py-2 text-sm text-slate-500">Nenhuma cidade encontrada</div>
                  )}
                  {sugestoes.map((nome)=> (
                    <button
                      key={nome}
                      type="button"
                      className="w-full text-left px-3 py-2 hover:bg-slate-100 text-sm"
                      onMouseDown={(e)=>{ e.preventDefault(); setCidade(nome); setSuggestOpen(false) }}
                    >
                      {nome}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="md:col-span-2 grid gap-3">
            <div className="card">
              <p className="text-[var(--muted)] text-sm">O que você devolve ao seu bolso</p>
              <p className="mt-1 text-lg md:text-xl font-bold text-[var(--blue)]">{brl(economiaMensal)} ({porcentagem}%)</p>
            </div>
            <div className="card">
              <p className="text-[var(--muted)] text-sm">Sua nova conta estimada</p>
              <p className="mt-1 text-lg md:text-xl font-semibold">{brl(novaConta)}</p>
            </div>
            <div className="card">
              <p className="text-[var(--muted)] text-sm">Economia no primeiro ano</p>
              <p className="mt-1 text-lg md:text-xl font-semibold">{brl(economiaAnual)}</p>
            </div>
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
  const [open,setOpen]=useState<number|null>(null)
  const steps=[
    {n:1,t:'Você continua pagando o mínimo da Cemig',d:'Sem mudanças na sua rotina.',detail:'Seu medidor e seu fornecimento seguem iguais. O desconto aparece no extrato.'},
    {n:2,t:'A diferença vira desconto na sua fatura',d:'Você vê o abatimento mês a mês.',detail:'Enviamos relatório mensal e você acompanha cada centavo economizado.'},
    {n:3,t:'Conta reduzida, simples assim',d:'Economia de 20% garantida.',detail:'Você sente a diferença no bolso e pode cancelar quando quiser, sem dor de cabeça.'},
  ]
  return (
    <section className="py-8 md:py-14">
      <div className="container-section relative">
        <div ref={railRef} className="steps-rail"><div className="mask"/></div>
        <div className="grid md:grid-cols-3 gap-4 md:gap-6">
          {steps.map((s,i)=> {
            const isOpen=open===i
            return (
              <div key={s.n} className="card cursor-pointer" onClick={()=>setOpen(isOpen?null:i)}>
                <div className="step-circle">{s.n}</div>
                <h3 className="mt-3 font-semibold text-base md:text-lg">{s.t}</h3>
                <p className="mt-1 text-[var(--muted)] text-sm">{s.d}</p>
                <AnimatePresence>
                  {isOpen && (
                    <motion.p initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}} transition={{duration:0.25}} className="mt-3 text-sm opacity-90">
                      {s.detail}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function Depoimentos(){
  const items=[
    {t:'Minha conta caiu 20% após assinar. Paguei o mínimo da Cemig e vi R$ 50 de economia real.',a:'João, BH',img:'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop'},
    {t:'O desconto veio certinho todo mês. Ficou simples entender a fatura.',a:'Maria, Uberlândia',img:'https://images.unsplash.com/photo-1520974692973-ac47dfb7fd89?q=80&w=200&auto=format&fit=crop'},
    {t:'Economizei 20% sem dor de cabeça. Atendimento rápido em MG.',a:'Carlos, Contagem',img:'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop'},
  ]
  return (
    <section className="py-8 md:py-14">
      <div className="container-section grid gap-3 md:gap-4">
        {items.map((d,i)=> (
          <div key={i} className="card flex items-center gap-3 md:gap-4">
            <img src={d.img} alt={d.a} className="h-10 w-10 md:h-12 md:w-12 rounded-full object-cover" />
            <Quote className="h-5 w-5 text-[var(--blue)]" />
            <p className="italic text-sm md:text-base">“{d.t}”</p>
            <span className="ml-auto text-xs md:text-sm text-[var(--muted)]">{d.a}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

function FAQ(){
  const qas=[
    {q:'Preciso trocar meu telhado?',a:'Na maioria dos casos, não. Você mantém tudo como está.'},
    {q:'E se faltar sol?',a:'O desconto é aplicado na fatura. Você continua economizando.'},
    {q:'Quando começo a ver a economia?',a:'Já na próxima fatura você sente a diferença.'},
    {q:'É complicado?',a:'Não. É simples, claro e com desconto garantido.'},
  ]
  const [open,setOpen]=useState<number|null>(0)
  return (
    <section className="py-8 md:py-14">
      <div className="container-section">
        <div className="grid gap-3">
          {qas.map((x,i)=> (
            <div key={i} className="card">
              <button onClick={()=>setOpen(open===i?null:i)} className="w-full flex items-center justify-between text-left">
                <span className="font-medium text-base md:text-lg">{x.q}</span>
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
    <section id="cta" className="section-blue py-10 md:py-14">
      <div className="container-section grid md:grid-cols-2 gap-4 md:gap-6 items-center">
        <div>
          <h2 className="text-xl md:text-3xl font-bold">Pare de pagar mais. 20% de desconto hoje mesmo.</h2>
          <p className="mt-2 opacity-90">Você paga menos, economiza na fatura e sente a diferença no bolso.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input className="input" placeholder="Nome" />
          <input className="input" placeholder="Telefone" />
          <input className="input sm:col-span-2" placeholder="E-mail" />
          <button className="btn-blue sm:col-span-2">Quero meu desconto agora</button>
        </div>
      </div>
    </section>
  )
}

function Plates3D(){
  const [open,setOpen]=useState<number|null>(null)
  const items=[
    {t:'20% garantido todo mês',d:'Desconto direto na fatura. Simples e transparente.',detail:'Relatórios mensais por e-mail e suporte dedicado para qualquer dúvida.'},
    {t:'Você paga o mínimo da Cemig',d:'O restante vira economia para você.',detail:'Nada muda na sua instalação. Só muda o valor que você paga.'},
    {t:'Transparência total',d:'Acompanhe no app e no e-mail.',detail:'Histórico de economia, comprovantes e atendimento local em MG.'},
  ]
  const logos=[
    'https://i.postimg.cc/htTwTBks/Whats-App-Image-2025-08-18-at-13-50-49.jpg',
    'https://i.postimg.cc/nLcqGKsz/Design-sem-nome-2025-08-18-T140112-499.png',
    'https://dummyimage.com/100x40/ffffff/000000.png&text=Parceiro+A',
    'https://dummyimage.com/120x40/ffffff/000000.png&text=Parceiro+B',
    'https://dummyimage.com/90x40/ffffff/000000.png&text=Parceiro+C',
    'https://dummyimage.com/140x40/ffffff/000000.png&text=Parceiro+D'
  ]
  const track=[...logos,...logos]
  return (
    <section className="py-10 md:py-14">
      <div className="container-section">
        <div className="lead-thin max-w-xl">
          <input placeholder="Seu e-mail" />
          <button className="btn-blue">Garanta seu desconto agora</button>
        </div>
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          {items.map((x,i)=>{
            const isOpen=open===i
            return (
              <div key={x.t} className="plate-3d rounded-2xl p-6 cursor-pointer" onClick={()=>setOpen(isOpen?null:i)}>
                <h3 className="text-lg font-bold">{x.t}</h3>
                <p className="mt-1 text-[var(--muted)] text-sm">{x.d}</p>
                <AnimatePresence>
                  {isOpen && (
                    <motion.p initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}} transition={{duration:0.25}} className="mt-3 text-sm opacity-90">
                      {x.detail}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
        <div className="logo-marquee mt-10">
          <motion.div className="logo-track" animate={{ x: ['0%','-50%'] }} transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}>
            {track.map((src,i)=> (
              <div key={src+i} className="neon-soft rounded-md border border-white/10 bg-white/5 p-3">
                <img src={src} className="h-8 md:h-10 w-auto opacity-95" />
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
        <div className="text-xs text-[var(--muted)]">© {new Date().getFullYear()} Solar Energy. Desconto válido para clientes Cemig residencial. Economia baseada em comparação com sua conta atual, transparente e garantida.</div>
      </div>
    </footer>
  )
}

export default function App(){
  return (
    <div className="hero-in-view">
      <Header/>
      <HeroMinimal imageUrls={[
        // second becomes first
        'https://i.postimg.cc/ZqK41bX5/Whats-App-Image-2025-08-15-at-12-47-18-1.jpg',
        // first goes to second
        'https://i.postimg.cc/VkRWfwLh/Whats-App-Image-2025-08-15-at-12-47-12.jpg',
        // new third (requested)
        'https://i.postimg.cc/26314Fwm/Whats-App-Image-2025-08-15-at-12-47-13.jpg',
        'https://i.postimg.cc/Qd3rLQHb/Design-sem-nome-2025-08-18-T103534-552.png',
        'https://i.postimg.cc/cHM4ZW4g/Whats-App-Image-2025-08-15-at-12-47-18.jpg'
      ]}/>
      <Beneficios/>
      <Simulador/>
      <Steps/>
      <Depoimentos/>
      <FAQ/>
      <Plates3D/>
      <CTAFinal/>
      <Footer/>
    </div>
  )
}
