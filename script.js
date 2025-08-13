/* Utilities */
const select = (q, root = document) => root.querySelector(q);
const selectAll = (q, root = document) => Array.from(root.querySelectorAll(q));
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Header: mobile nav */
(function initMobileNav() {
  const toggleButton = select('.nav-toggle');
  const navList = select('#site-menu');
  if (!toggleButton || !navList) return;
  const setOpen = (open) => {
    toggleButton.setAttribute('aria-expanded', String(open));
    navList.classList.toggle('open', open);
  };
  toggleButton.addEventListener('click', () => {
    const isOpen = navList.classList.contains('open');
    setOpen(!isOpen);
  });
  selectAll('#site-menu a').forEach((link) => link.addEventListener('click', () => setOpen(false)));
})();

/* Footer year */
(function updateYear() {
  const yearNode = select('#year');
  if (yearNode) yearNode.textContent = new Date().getFullYear();
})();

/* Reveal on scroll */
(function initReveal() {
  const revealTargets = selectAll('.section h2, .section .section-lead, .service-card, .portfolio-item, .contact-form, .about-copy');
  revealTargets.forEach((node) => node.classList.add('reveal'));
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealTargets.forEach((node) => observer.observe(node));
})();

/* Services: 3D tilt cards */
(function initTiltCards() {
  const cards = selectAll('.service-card .card-3d');
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const rotateCard = (evt, card, reset = false) => {
    const rect = card.getBoundingClientRect();
    const mx = reset ? 0.5 : (evt.clientX - rect.left) / rect.width;
    const my = reset ? 0.5 : (evt.clientY - rect.top) / rect.height;
    const rotateY = clamp((mx - 0.5) * 18, -14, 14);
    const rotateX = clamp((0.5 - my) * 18, -14, 14);
    card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  };
  cards.forEach((card) => {
    card.addEventListener('mousemove', (e) => rotateCard(e, card));
    card.addEventListener('mouseleave', (e) => rotateCard(e, card, true));
    card.addEventListener('focus', (e) => card.style.transform = 'translateY(-2px)');
    card.addEventListener('blur', (e) => card.style.transform = '');
  });
})();

/* Lightbox for portfolio */
(function initLightbox() {
  const lightbox = select('#lightbox');
  const content = select('#lightbox-content');
  const closeBtn = select('.lightbox-close');
  if (!lightbox || !content) return;

  const open = (node) => {
    if (!node) return;
    content.innerHTML = '';
    const href = node.getAttribute('href');
    const type = node.dataset.type || 'image';
    if (type === 'video') {
      const video = document.createElement('video');
      video.src = href;
      video.controls = true;
      video.autoplay = true;
      video.playsInline = true;
      content.appendChild(video);
    } else {
      const img = document.createElement('img');
      img.src = href;
      img.alt = node.querySelector('.caption')?.textContent || 'Imagem do portfólio';
      content.appendChild(img);
    }
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
  };

  const close = () => {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    content.innerHTML = '';
  };

  document.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('.portfolio-item');
    if (!a) return;
    if (!a.closest('#portfolio')) return; // ensure within portfolio section
    e.preventDefault();
    open(a);
  });

  closeBtn?.addEventListener('click', close);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) close(); });
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
})();

/* Portfolio dynamic loader */
// (portfolio removed)

/* Portfolio filters */
// (portfolio removed)

/* Lightbox with navigation */
// (portfolio removed)

/* Chat disabled as requested */

/* HERO 3D: Abstract AI lattice + data flow (professional) */
(function heroAILattice() {
  const canvas = select('#hero-canvas');
  if (!canvas || !window.THREE) return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0b0f1a, 0.045);
  const camera = new THREE.PerspectiveCamera(48, 2, 0.1, 200);
  camera.position.set(0, 1.2, 6.5);

  // Postprocessing (bloom)
  let composer = null;
  try {
    const effectComposer = new THREE.EffectComposer(renderer);
    const renderPass = new THREE.RenderPass(scene, camera);
    const bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(1, 1), 0.95, 0.4, 0.85);
    effectComposer.addPass(renderPass);
    effectComposer.addPass(bloomPass);
    composer = effectComposer;
  } catch (_) { composer = null; }
  const renderScene = () => composer ? composer.render() : renderer.render(scene, camera);

  // Lighting
  scene.add(new THREE.HemisphereLight(0xbcd9ff, 0x0b0f1a, 0.9));
  const key = new THREE.DirectionalLight(0xffffff, 1.0); key.position.set(2, 3.6, 2.5); scene.add(key);
  const accentA = new THREE.PointLight(0x2563eb, 0.9, 18); accentA.position.set(-2.4, 1.0, 2.2); scene.add(accentA);
  const accentB = new THREE.PointLight(0x38bdf8, 0.8, 18); accentB.position.set(2.2, 1.2, 2.0); scene.add(accentB);

  // Remove ground plane for clean black
  

  // Neural lattice: points connected by edges forming a dynamic graph
  const nodeCount = 200;
  const nodes = [];
  for (let i=0;i<nodeCount;i++) {
    nodes.push(new THREE.Vector3((Math.random()-0.5)*6, (Math.random()-0.2)*3, (Math.random()-0.5)*4));
  }
  const nodeGeo = new THREE.SphereGeometry(0.02, 8, 8);
  const nodeMat = new THREE.MeshStandardMaterial({ color: 0x7dd3fc, emissive: 0x7dd3fc, emissiveIntensity: 0.9 });
  const nodeGroup = new THREE.Group();
  nodes.forEach(p => { const m = new THREE.Mesh(nodeGeo, nodeMat); m.position.copy(p); nodeGroup.add(m); });
  scene.add(nodeGroup);

  // Edges using line segments
  const edgeGeo = new THREE.BufferGeometry();
  const maxEdges = nodeCount * 3;
  const edgePositions = new Float32Array(maxEdges * 6);
  edgeGeo.setAttribute('position', new THREE.BufferAttribute(edgePositions, 3));
  const edgeMat = new THREE.LineBasicMaterial({ color: 0x2563eb, transparent: true, opacity: 0.35 });
  const edges = new THREE.LineSegments(edgeGeo, edgeMat);
  scene.add(edges);

  // Data flow particles moving along a curve
  const flowCount = 180;
  const flowGeo = new THREE.BufferGeometry();
  const flowPos = new Float32Array(flowCount * 3);
  const flowMat = new THREE.PointsMaterial({ color: 0x39ff88, size: 0.02, transparent: true, opacity: 0.95 });
  const flow = new THREE.Points(flowGeo, flowMat);
  scene.add(flow);
  nodeGroup.visible = false; edges.visible = false; flow.visible = false;

  const flowCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-2.4, 0.0, 1.6),
    new THREE.Vector3(-1.2, 0.6, 0.8),
    new THREE.Vector3(0.0, 0.1, 0.0),
    new THREE.Vector3(1.3, 0.8, -0.8),
    new THREE.Vector3(2.6, 0.2, -1.6)
  ], false, 'catmullrom', 0.5);
  const flowOffsets = new Float32Array(flowCount);
  for (let i=0;i<flowCount;i++){ flowOffsets[i] = Math.random(); }

  // Hologram group cleared (keep lattice only)
  const holoGroup = new THREE.Group();
  scene.add(holoGroup);

  // Realistic globe (center) for context
  const globeTex = new THREE.TextureLoader().load('https://tile.openstreetmap.org/0/0/0.png');
  const globe = new THREE.Mesh(new THREE.SphereGeometry(0.9, 48, 48), new THREE.MeshStandardMaterial({ map: globeTex, roughness: 0.9, metalness: 0.0 }));
  globe.position.set(0, 0.6, 0);
  scene.add(globe);
  // Clouds (subtle)
  try {
    const cloudsTex = new THREE.TextureLoader().load('https://raw.githubusercontent.com/turban/webgl-earth/master/images/fair_clouds_4k.png');
    const cloudsMat = new THREE.MeshPhongMaterial({ map: cloudsTex, transparent: true, opacity: 0.25, depthWrite: false });
    const clouds = new THREE.Mesh(new THREE.SphereGeometry(0.905, 48, 48), cloudsMat);
    globe.add(clouds);
  } catch(_) {}

  // Girl sprite on top of globe (uses transparent PNG from fotos2)
  (function addGirlSprite(){
    const GIRL_SPRITE_URL = 'https://tainasilveira.my.canva.site/fotos2/_assets/media/ec554cb552f24eba90afbb7dc63af7ae.png';
    const loader = new THREE.TextureLoader();
    try { loader.setCrossOrigin('anonymous'); } catch(_) {}
    loader.load(GIRL_SPRITE_URL, (tex)=>{
      tex.colorSpace = THREE.SRGBColorSpace;
      const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
      const sprite = new THREE.Sprite(mat);
      const targetHeight = 0.9; // relative to globe size
      const aspect = tex.image.width / tex.image.height || 0.7;
      sprite.scale.set(targetHeight*aspect, targetHeight, 1);
      sprite.position.set(0, 0.9 + 0.28, 0);
      globe.add(sprite);
    });
  })();

  // Small cart + girl with laptop silhouette (minimal lines)
  const girlCartGroup = new THREE.Group();
  // Cart outline
  (function addCart(){
    const w = 0.28, h = 0.14;
    const cartGeo = new THREE.BufferGeometry();
    const pos = new Float32Array([
      -w/2, -h/2, 0,  w/2, -h/2, 0,
       w/2, -h/2, 0,  w/2,  h/2, 0,
       w/2,  h/2, 0, -w/2,  h/2, 0,
      -w/2,  h/2, 0, -w/2, -h/2, 0,
    ]);
    cartGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const cart = new THREE.LineSegments(cartGeo, new THREE.LineBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.8 }));
    girlCartGroup.add(cart);
  })();

  // Girl silhouette and laptop using line segments
  (function addGirl(){
    function pathToLine(points, color){
      const flat = [];
      for (let i = 0; i < points.length - 1; i++) {
        const a = points[i], b = points[i+1];
        flat.push(a[0], a[1], 0, b[0], b[1], 0);
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(flat), 3));
      return new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.9 }));
    }
    const y0 = -0.005; // local baseline inside cart
    const girl = pathToLine([
      [-0.05, y0+0.08], [0.00, y0+0.12],
      [ 0.00, y0+0.12], [0.05, y0+0.08],
      [ 0.00, y0+0.08], [0.00, y0+0.00],
      [ 0.00, y0+0.00], [-0.05, y0-0.055],
      [ 0.00, y0+0.00], [0.06, y0-0.055],
      // crossed legs line
      [-0.05, y0-0.055], [0.05, y0-0.055],
      // laptop rectangle open
      [0.02, y0+0.02], [0.12, y0+0.02],
      [0.12, y0+0.02], [0.12, y0-0.004]
    ], 0x7c3aed);
    girlCartGroup.add(girl);
  })();

  girlCartGroup.position.set(0, 0.62, 0);
  holoGroup.add(girlCartGroup);

  // Interaction
  let cx=0, cy=0; canvas.addEventListener('pointermove', (e)=>{ cx=(e.clientX/innerWidth-0.5)*2; cy=(e.clientY/innerHeight-0.5)*2; }, {passive:true});

  function resize(){ const w=canvas.clientWidth,h=canvas.clientHeight; if(!w||!h) return; renderer.setSize(w,h,false); camera.aspect=w/h; camera.updateProjectionMatrix(); if (composer) composer.setSize(w,h); }
  new ResizeObserver(resize).observe(canvas); resize();

  const clock = new THREE.Clock();
  function animate(){
    const t = clock.getElapsedTime();

    // Update edges based on proximity
    let idx = 0; const threshold = 1.2; const pos = edgeGeo.attributes.position.array;
    for (let i=0;i<nodeCount; i++) {
      for (let j=i+1; j<nodeCount && idx < maxEdges; j++) {
        const a = nodes[i], b = nodes[j];
        const d = a.distanceTo(b);
        if (d < threshold && Math.random() < 0.03) {
          pos[idx*6+0]=a.x; pos[idx*6+1]=a.y; pos[idx*6+2]=a.z;
          pos[idx*6+3]=b.x; pos[idx*6+4]=b.y; pos[idx*6+5]=b.z; idx++;
        }
      }
    }
    edgeGeo.setDrawRange(0, idx*2);
    edgeGeo.attributes.position.needsUpdate = true;

    // Flow along curve
    for (let i=0;i<flowCount;i++){
      const u = (t*0.2 + flowOffsets[i]) % 1;
      const p = flowCurve.getPoint(u);
      flowPos[i*3]=p.x; flowPos[i*3+1]=p.y; flowPos[i*3+2]=p.z;
    }
    flowGeo.setAttribute('position', new THREE.BufferAttribute(flowPos,3));

    // Gentle float only + globe spin
    globe.rotation.y += 0.004;
    holoGroup.rotation.y += 0.0015;
    holoGroup.position.y = 0.68 + Math.sin(t*1.2)*0.05;

    // Subtle camera movement and light pulse
    camera.position.x = cx*0.4; camera.position.y = 1.2 + cy*0.18; camera.lookAt(0,0.4,0);
    accentA.intensity = 0.9 + Math.sin(t*3.0)*0.15; accentB.intensity = 0.8 + Math.cos(t*2.7)*0.15;

    // Sync slogan text pulse
    const sl = document.getElementById('slogan');
    if (sl) {
      const p = 0.8 + Math.sin(t*1.2)*0.2;
      sl.style.opacity = String(p);
      sl.style.letterSpacing = `${6 + Math.sin(t*1.2)*2}px`;
    }

    renderScene();
    requestAnimationFrame(animate);
  }
  animate();
})();

/* Cycle hero bullets */
(function cycleBullets(){
  const items = selectAll('.bullet');
  if (!items.length) return;
  let i=0; setInterval(()=>{
    items.forEach((el,idx)=>el.classList.toggle('active', idx===i));
    i=(i+1)%items.length;
  }, 2500);
})();

/* Contact form */
(function initForm() {
  const form = select('#contact-form');
  const success = select('#form-success');
  if (!form) return;

  const showError = (field, message) => {
    const errorEl = field.parentElement.querySelector('.error');
    if (errorEl) errorEl.textContent = message || '';
  };

  const validateField = (input) => {
    if (input.validity.valid) { showError(input, ''); return true; }
    if (input.validity.valueMissing) { showError(input, 'Campo obrigatório'); return false; }
    if (input.type === 'email' && input.validity.typeMismatch) { showError(input, 'E-mail inválido'); return false; }
    showError(input, 'Corrija este campo');
    return false;
  };

  selectAll('input, textarea', form).forEach((node) => {
    node.addEventListener('input', () => validateField(node));
    node.addEventListener('blur', () => validateField(node));
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const inputs = selectAll('input, textarea', form);
    const allValid = inputs.every(validateField);
    if (!allValid) return;

    // Simulate async submit
    form.querySelector('button[type="submit"]').disabled = true;
    setTimeout(() => {
      form.reset();
      inputs.forEach((i) => showError(i, ''));
      if (success) {
        success.hidden = false;
        success.focus?.();
      }
      form.querySelector('button[type="submit"]').disabled = false;
    }, 600);
  });
})();

/* Lead capture to email (Web3Forms) */
(function leadCapture() {
  const form = select('#contact-form');
  if (!form) return;
  // Add hidden inputs for service
  const access = document.createElement('input');
  access.type='hidden'; access.name='access_key'; access.value='a5f5d0d0-0000-4000-8000-000000000000'; // TODO: replace with your Web3Forms key
  const subject = document.createElement('input');
  subject.type='hidden'; subject.name='subject'; subject.value='Novo lead do site de Taina';
  const reply = document.createElement('input');
  reply.type='hidden'; reply.name='replyto'; reply.value='{{email}}';
  form.append(access, subject, reply);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new FormData(form);
    try {
      const res = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: data });
      const json = await res.json();
      if (json.success) {
        select('#form-success')?.removeAttribute('hidden');
      }
    } catch (_) {}
  });
})();

/* Services: click-to-contact prefill */
(function serviceClicks() {
  const cards = selectAll('.service-card[role="button"]');
  const form = select('#contact-form');
  if (!cards.length || !form) return;
  cards.forEach(c => c.addEventListener('click', () => {
    const s = c.getAttribute('data-service') || '';
    const msg = select('#mensagem');
    if (msg) msg.value = `Olá! Tenho interesse em ${s}. Podemos conversar?`;
    select('#contato')?.scrollIntoView({ behavior: 'smooth' });
  }));
})();

/* Mini buttons prefill */
(function miniButtonsPrefill(){
  const btns = selectAll('.mini-btn');
  const msg = select('#mensagem');
  btns.forEach(b=> b.addEventListener('click', (e)=>{
    const s = b.getAttribute('data-service')||b.textContent||'';
    if (msg) msg.value = `Olá! Tenho interesse em ${s}. Podemos conversar?`;
  }));
})();

/* About photo LinkedIn override */
(function aboutPhotoOverride() {
  const url = new URL(location.href);
  const final = url.searchParams.get('linkedin');
  if (!final) return;
  const photos = selectAll('.about-card');
  photos.forEach(img => img.src = final);
})();

/* Hero Services Assistant */
(function initHeroAssistant(){
  const form = select('#assistant-form');
  const input = select('#assistant-input');
  const box = select('#assistant-response');
  if (!form || !input || !box) return;

  const serviceInfo = {
    marketing: {
      title: 'Marketing Digital',
      text: 'Gestão de tráfego (Meta/Google), conteúdo e funis orientados por dados. Exemplos: captação de leads para clínicas locais, campanhas de lançamento (PLF), always-on para e-commerce com ROAS otimizado.',
      niches: ['clínica', 'salão', 'restaurante', 'e-commerce', 'infoproduto', 'imobiliária']
    },
    design: {
      title: 'Design Gráfico',
      text: 'Identidade visual, social media, peças para anúncios e UI com estética forte e clareza. Exemplos: identidade para cafeteria/artista, carrosséis de alta performance, landing pages com conversão.',
      niches: ['cafeteria', 'artista', 'startup', 'evento', 'educação']
    },
    ia: {
      title: 'Automação com IA',
      text: 'Workflows inteligentes para atendimento, conteúdo e análise. Exemplos: chatbot de WhatsApp para pré-venda, geração assistida de conteúdo, integração CRM + planilhas + e-mail.',
      niches: ['whatsapp', 'crm', 'conteúdo', 'suporte', 'atendimento']
    },
    consultoria: {
      title: 'Consultoria',
      text: 'Diagnóstico, estratégia e implementação conforme seu momento. Exemplos: revisão de funil, plano de mídia trimestral, roadmap de branding e jornada digital.',
      niches: ['estratégia', 'funil', 'branding', 'posicionamento']
    }
  };

  function normalize(q){
    return (q||'').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu,'');
  }

  function buildAnswer(q){
    const n = normalize(q);
    const hits = [];
    if (/(marketing|trafego|ads|anuncio|meta|google|lead|roas|e[- ]?commerce|loja)/.test(n)) hits.push('marketing');
    if (/(design|identidade|branding|ui|ux|social|logo|landing|site)/.test(n)) hits.push('design');
    if (/(ia|inteligencia|automacao|chatbot|assistente|gpt|workflow|zap|whatsapp|crm)/.test(n)) hits.push('ia');
    if (/(consultoria|diagnostico|estrategia|plano|mentoria|posicionamento|funil)/.test(n)) hits.push('consultoria');

    // niche detection
    const nicheWords = ['clinica','salão','salao','restaurante','e-commerce','loja','imobiliaria','infoproduto','cafeteria','artista','startup','evento','educacao'];
    const niche = nicheWords.find(w => n.includes(w));

    if (!n || /(ajuda|servico|servicos|o que faz|o que voce faz|pode ajudar)/.test(n)) {
      return { html: `<strong>Posso ajudar nestes serviços:</strong><br>
        • Marketing Digital — ${serviceInfo.marketing.text}<br>
        • Design Gráfico — ${serviceInfo.design.text}<br>
        • Automação com IA — ${serviceInfo.ia.text}<br>
        • Consultoria — ${serviceInfo.consultoria.text}`, service: '' };
    }

    if (/(preco|valor|orcamento|quanto custa)/.test(n)) {
      return { html: `Preparo orçamento conforme objetivo, prazo e escopo. Conte o contexto (ex.: nicho, canais, meta) e envio uma proposta alinhada.`, service: '' };
    }

    if (hits.length) {
      const first = hits[0];
      const s = serviceInfo[first];
      let extra = '';
      if (niche) {
        if (first==='marketing' && /(clinica|salao|restaurante)/.test(niche)) extra = ' Ex.: captação de pacientes, agenda por WhatsApp e campanhas locais.';
        if (first==='marketing' && /(e[- ]?commerce|loja)/.test(niche)) extra = ' Ex.: estrutura de campanhas (TOF/MOF/BOF), catálogos e remarketing dinâmico.';
        if (first==='design' && /(cafeteria|artista|startup|evento)/.test(niche)) extra = ' Ex.: identidade e materiais de lançamento/coleta de leads.';
        if (first==='ia') extra = ' Ex.: chatbot para dúvidas frequentes e qualificação de leads com integração ao CRM.';
        if (first==='consultoria') extra = ' Ex.: auditoria do funil atual e plano de 90 dias.';
      }
      return { html: `<strong>${s.title}</strong><br>${s.text}${extra}`, service: s.title };
    }

    return { html: `Consigo orientar em Marketing, Design, Automação com IA e Consultoria. Diga seu nicho e objetivo (ex.: "clínica — captar 200 leads/mês") para eu sugerir a melhor abordagem.`, service: '' };
  }

  function setMessagePrefill(service){
    if (!service) return;
    const msg = select('#mensagem');
    if (msg) msg.value = `Olá! Tenho interesse em ${service}. Podemos conversar?`;
  }

  function render(html, service){
    box.innerHTML = `${html}`;
    const actions = document.createElement('div');
    actions.className = 'actions';
    const contactBtn = document.createElement('a');
    contactBtn.href = '#contato';
    contactBtn.className = 'btn-mini';
    contactBtn.textContent = 'Falar sobre isso';
    contactBtn.addEventListener('click', ()=> setMessagePrefill(service));
    actions.appendChild(contactBtn);
    box.appendChild(actions);
    box.hidden = false;
  }

  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const q = input.value.trim();
    const { html, service } = buildAnswer(q);
    render(html, service);
  });
})();