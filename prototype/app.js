const views = document.querySelectorAll('.view')
const navButtons = document.querySelectorAll('.bottomnav button')
const sheet = document.getElementById('sheet')
const sheetContent = document.getElementById('sheetContent')
const sheetClose = document.getElementById('sheetClose')
const toast = document.getElementById('toast')

navButtons.forEach(btn=>{
  btn.addEventListener('click',()=>{
    navButtons.forEach(b=>b.classList.remove('active'))
    btn.classList.add('active')
    const id = 'view-' + btn.dataset.view
    views.forEach(v=>v.classList.toggle('active', v.id===id))
  })
})

function showToast(msg){
  toast.textContent = msg
  toast.classList.add('show')
  toast.removeAttribute('aria-hidden')
  setTimeout(()=>{toast.classList.remove('show');toast.setAttribute('aria-hidden','true')}, 1800)
}

// Feed population
const feedData = [
  {id:1,title:'Teoria de Tudo: trailer comentado', why:['Você curtiu Arrival','Prefere sci‑fi cerebral','Noite: 10 min livres']},
  {id:2,title:'Synthwave para foco (30 min)', why:['Você salvou playlists synth','Sessões de foco às 21h']},
  {id:3,title:'Debate: jogos e economia criativa', why:['Seguindo 3 criadores do tema','Alta interação em debates']}
]
const feedList = document.getElementById('feedList')
function renderFeed(items){
  feedList.innerHTML = ''
  items.forEach(it=>{
    const card = document.createElement('div')
    card.className = 'card'
    card.innerHTML = `
      <div class="media">Prévia</div>
      <div class="meta">
        <div class="title">${it.title}</div>
        <div class="row">
          <button class="whychip" data-id="${it.id}">Por que isto?</button>
          <div class="actionbar">
            <button class="icon" aria-label="Curtir">❤</button>
            <button class="icon" aria-label="Salvar">🔖</button>
            <button class="icon" aria-label="Compartilhar">↗</button>
          </div>
        </div>
      </div>`
    feedList.appendChild(card)
  })
}
renderFeed(feedData)

feedList.addEventListener('click', (e)=>{
  const btn = e.target.closest('.whychip')
  if(!btn) return
  const id = Number(btn.dataset.id)
  const item = feedData.find(x=>x.id===id)
  openSheet(`<h3>Por que você está vendo isto?</h3>
    <ul>${item.why.map(s=>`<li>${s}</li>`).join('')}</ul>
    <div style="display:flex;gap:8px;margin-top:8px">
      <button id="whyUp" class="btn">Ver mais assim</button>
      <button id="whyDown" class="btn ghost">Ver menos assim</button>
      <button id="whyMute" class="btn ghost">Silenciar tema</button>
    </div>`)
  setTimeout(()=>{
    document.getElementById('whyUp').onclick=()=>{showToast('Preferências aplicadas');closeSheet()}
    document.getElementById('whyDown').onclick=()=>{showToast('Preferências aplicadas');closeSheet()}
    document.getElementById('whyMute').onclick=()=>{showToast('Tema silenciado');closeSheet()}
  })
})

// Adjust Feed
document.getElementById('btnAdjust').addEventListener('click',()=>{
  openSheet(`<h3>Ajustar Feed</h3>
    <label>Tonalidade <input type="range" min="0" max="10" value="6"/></label>
    <label>Duração <input type="range" min="1" max="30" value="10"/></label>
    <label>Fontes <select><option>Creators seguidos</option><option>Explorar</option></select></label>
    <div style="display:flex;gap:8px;margin-top:8px"><button id="applyAdj" class="btn primary">Aplicar</button></div>`)
  setTimeout(()=>{
    document.getElementById('applyAdj').onclick=()=>{
      renderFeed([...feedData].reverse())
      showToast('Preferências aplicadas')
      closeSheet()
    }
  })
})

function openSheet(html){
  sheetContent.innerHTML = html
  sheet.classList.add('open')
  sheet.removeAttribute('aria-hidden')
}
function closeSheet(){
  sheet.classList.remove('open')
  sheet.setAttribute('aria-hidden','true')
}
sheetClose.addEventListener('click', closeSheet)

// Studio interactions (mock)
const studioPrompt = document.getElementById('studioPrompt')
const chipButtons = document.querySelectorAll('.chip')
chipButtons.forEach(c=>c.addEventListener('click',()=>{
  studioPrompt.value = {
    roteiro:'Crie um roteiro de 45s com 3 cenas e CTA final.',
    cortes:'Detecte pausas e gere cortes a cada 3–5s.',
    legendas:'Gerar legendas com auto‑pontuação e emojis sutis.',
    thumb:'Crie 2 variações de thumbnail com foco no rosto.'
  }[c.dataset.suggest]
}))

document.getElementById('btnGenerateCuts').addEventListener('click',()=>{
  showToast('Cortes gerados')
})

document.getElementById('btnPublish').addEventListener('click',()=>{
  showToast('Publicado!')
})

// Party interactions
const chat = document.getElementById('chat')
const partyInput = document.getElementById('partyInput')
document.getElementById('btnAsk').addEventListener('click',()=>{
  const q = partyInput.value.trim()
  if(!q) return
  chat.insertAdjacentHTML('beforeend', `<div class="msg">Você: ${q}</div>`)
  partyInput.value = ''
  setTimeout(()=>{
    chat.insertAdjacentHTML('beforeend', `<div class="msg ia">IA: ${q}? Aqui vai um destaque e uma enquete sugerida.</div>`)
    chat.scrollTop = chat.scrollHeight
  }, 500)
})

// Profile memory
const memoryList = document.getElementById('memoryList')
const topics = [
  {name:'Sci‑fi', paused:false},
  {name:'Debates', paused:false},
  {name:'Synthwave', paused:false}
]
function renderMemory(){
  memoryList.innerHTML = ''
  topics.forEach((t,i)=>{
    const li = document.createElement('li')
    li.className = 'memory-item'
    li.innerHTML = `<span>${t.name}</span>
      <span>
        <label style="margin-right:8px"><input type="checkbox" ${t.paused?'':'checked'} data-idx="${i}" class="memToggle"/> Ativo</label>
        <button class="btn ghost" data-del="${i}">Apagar</button>
      </span>`
    memoryList.appendChild(li)
  })
}
renderMemory()

memoryList.addEventListener('change',(e)=>{
  if(e.target.classList.contains('memToggle')){
    const i = Number(e.target.dataset.idx)
    topics[i].paused = !e.target.checked
    showToast(topics[i].paused ? 'Tópico pausado' : 'Tópico ativado')
  }
})
memoryList.addEventListener('click',(e)=>{
  const del = e.target.dataset.del
  if(del!==undefined){
    topics.splice(Number(del),1)
    renderMemory(); showToast('Tópico apagado')
  }
})

document.getElementById('btnExport').addEventListener('click',()=>{
  const blob = new Blob([JSON.stringify({topics},null,2)],{type:'application/json'})
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = 'orbita-export.json'
  a.click()
  URL.revokeObjectURL(a.href)
})

// Voice button mock
const btnVoice = document.getElementById('btnVoice')
btnVoice.addEventListener('click',()=>showToast('Escutando... (mock)'))

// Theme handling
const appEl = document.getElementById('app')
const themeSelect = document.getElementById('themeSelect')
const savedTheme = localStorage.getItem('orbita_theme') || 'dark'
appEl.setAttribute('data-theme', savedTheme)
if(themeSelect){
  themeSelect.value = savedTheme
  themeSelect.addEventListener('change', ()=>{
    const t = themeSelect.value
    appEl.setAttribute('data-theme', t)
    localStorage.setItem('orbita_theme', t)
    showToast('Tema aplicado')
  })
}