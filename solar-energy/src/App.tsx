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
          <img src="https://i.postimg.cc/9f3DM49L/LOGO-V-BRANCA-1-1.png" alt="Solar Energy" className="h-[56px] md:h-[96px] w-auto" />
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
    <section id="beneficios" className="py-8 md:py-14">
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
        <p className="section-subtitle mt-1">Digite o valor da sua conta e selecione a cidade em MG</p>
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
    {t:'A fatura de luz ficou simples e previsível. Hoje sobra para investir.',a:'Medular, Montes Claros - MG',img:'https://i.postimg.cc/zByHknrC/Whats-App-Image-2025-08-18-at-13-57-45.jpg'},
    {t:'O desconto chegou direitinho todo mês. A fatura ficou fácil de entender.',a:'HortiFrut Fm, Montes Claros - MG',img:'https://i.postimg.cc/T2kH1xkB/Whats-App-Image-2025-08-18-at-13-51-19.jpg'},
    {t:'Reduzi 20% sem complicação. Atendimento ágil e eficiente em MG.',a:'Amávia, Montes Claros - MG',img:'https://i.postimg.cc/90VHwxxV/Whats-App-Image-2025-08-18-at-13-19-46.jpg', pos:'50% 35%', link:'https://i.postimg.cc/90VHwxxV/Whats-App-Image-2025-08-18-at-13-19-46.jpg'},
  ]
  return (
    <section className="py-8 md:py-14">
      <div className="container-section grid gap-3 md:gap-4">
        {items.map((d,i)=> (
          <div key={i} className="card flex items-center gap-3 md:gap-4">
            <div className="h-12 w-12 md:h-12 md:w-12 rounded-full overflow-hidden shrink-0">
              <img src={d.img} alt={d.a} className="h-full w-full object-cover" style={{ objectPosition: (d as any).pos || '50% 50%' }} />
            </div>
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
    {q:'Preciso trocar meu telhado?',a:'Não. Sem obras, sem manutenção e já com economia no primeiro mês.'},
    {q:'E se faltar sol?',a:'Mesmo em dias nublados, a economia é garantida com energia compensada.'},
    {q:'Quando começo a ver a economia?',a:'Você já nota a redução já na primeira fatura com o desconto ativo.'},
    {q:'É complicado?',a:'Não. Todo o processo é simples, rápido e sem burocracia para você.'},
    {q:'Quanto tempo leva para ativar o desconto?',a:'O desconto começa a valer já no primeiro mês após a adesão.'},
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
          <input id="lead-email" className="input sm:col-span-2" type="email" inputMode="email" placeholder="E-mail" />
          <input id="lead-nome" className="input" type="text" placeholder="Nome" />
          <input id="lead-tel" className="input" type="tel" inputMode="tel" placeholder="Telefone" />
          <button
            type="button"
            className="btn-yellow btn-pulse sm:col-span-2"
            onClick={(e)=>{
              e.preventDefault();
              const nome=(document.getElementById('lead-nome') as HTMLInputElement)?.value?.trim()||'';
              const email=(document.getElementById('lead-email') as HTMLInputElement)?.value?.trim()||'';
              const tel=(document.getElementById('lead-tel') as HTMLInputElement)?.value?.trim()||'';
              const msg = `Olá! Quero meu desconto. Nome: ${nome || '-'} | E-mail: ${email || '-'} | Telefone: ${tel || '-'}`;
              const url = 'https://wa.me/5538999266004?text=' + encodeURIComponent(msg);
              window.location.href = url;
            }}
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            Quero meu desconto agora
          </button>
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

  return (
    <section className="py-10 md:py-14">
      <div className="container-section">
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
      </div>
    </section>
  )
}

function Footer(){
  return (
    <footer className="footer py-8">
      <div className="footer-neon-line" />
      <div className="container-section mt-4">
        <p className="text-center text-xs md:text-sm" style={{ color: '#B8B8B8' }}>
          © 2025 Solar Energy — Todos os direitos reservados | 🔒 Site seguro | Desenvolvido por Codexion
        </p>
      </div>
    </footer>
  )
}

export default function App(){
  return (
    <div className="hero-in-view min-h-screen flex flex-col">
      <Header/>
      <main className="flex-1">
             <HeroMinimal imageUrls={[
          'https://i.postimg.cc/D0YVzXS0/Solar-Social-Media7-Banner.png'
        ]} />
        <Beneficios/>
        <Simulador/>
        <Steps/>
        <Depoimentos/>
        <FAQ/>
        <Plates3D/>
        <CTAFinal/>
      </main>
      <Footer/>
    </div>
  )
}
