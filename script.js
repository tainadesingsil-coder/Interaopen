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

/* Quick links toggle */
(function initQuickLinks(){
  const toggle = select('.quick-toggle');
  const panel = select('#quick-panel');
  if (!toggle || !panel) return;
  toggle.addEventListener('click', ()=>{
    const open = panel.hasAttribute('hidden') ? true : panel.hidden;
    panel.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('click', (e)=>{
    if (!panel || !toggle) return;
    if (e.target === toggle || toggle.contains(e.target)) return;
    if (!panel.contains(e.target)) { panel.hidden = true; toggle.setAttribute('aria-expanded','false'); }
  });
  panel.addEventListener('click', (e)=>{
    const a = e.target.closest('a');
    if (a) { panel.hidden = true; toggle.setAttribute('aria-expanded','false'); }
  });
  window.addEventListener('keydown', (e)=>{
    if (e.key === 'Escape') { panel.hidden = true; toggle.setAttribute('aria-expanded','false'); }
  });
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
  if (!canvas) return;
  const hasWebGL = (function(){ try { const test = document.createElement('canvas').getContext('webgl') || document.createElement('canvas').getContext('experimental-webgl'); return !!test; } catch(e){ return false; } })();
  if (!hasWebGL || !window.THREE) {
    const fb = select('#hero-fallback'); if (fb) fb.style.display = 'block';
    const c2d = select('#hero-2d'); if (c2d) c2d.style.display = 'block';
    return;
  }

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  try { select('#hero-fallback')?.style && (select('#hero-fallback').style.display = 'none'); } catch(_) {}

  const scene = new THREE.Scene();
  // Remove fog for perfectly black background
  // scene.fog disabled
  const camera = new THREE.PerspectiveCamera(48, 2, 0.1, 200);
  camera.position.set(0, 1.2, 6.5);
  let girlModel = null;

  // Postprocessing (bloom)
  const renderScene = () => renderer.render(scene, camera);

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
  nodeGroup.visible = false; edges.visible = false; flow.visible = false; /* only globe visible */
  // Ensure arcs are subtle neon
  try { if (globe && globe.children) globe.children.forEach((ch)=>{ if (ch.isLine) { ch.material.opacity = 0.28; ch.material.color.set(0x00d4ff); } }); } catch(_) {}

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
  const globeTex = new THREE.TextureLoader().load('https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg');
  const globe = new THREE.Mesh(new THREE.SphereGeometry(0.9, 32, 32), new THREE.MeshStandardMaterial({ map: globeTex, roughness: 0.9, metalness: 0.0 }));
  globe.position.set(0, 0.6, 0);
  scene.add(globe);

  // Subtle neon ring under the globe
  (function addNeonRing(){
    const ringGeo = new THREE.RingGeometry(1.0, 1.2, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.22, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(0, 0.05, 0);
    scene.add(ring);
  })();
  // Clouds (subtle)
  try {
    const cloudsTex = new THREE.TextureLoader().load('https://threejs.org/examples/textures/planets/earth_clouds_1024.png');
    const cloudsMat = new THREE.MeshPhongMaterial({ map: cloudsTex, transparent: true, opacity: 0.25, depthWrite: false });
    const clouds = new THREE.Mesh(new THREE.SphereGeometry(0.905, 48, 48), cloudsMat);
    globe.add(clouds);
  } catch(_) {}

  // Network arcs on globe
  (function addNetwork(){
    const arcMat = new THREE.LineBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.4 });
    const arcs = new THREE.Group();
    function arc(lat1, lon1, lat2, lon2){
      const R=0.9, steps=32, pts=[];
      function toXYZ(lat,lon,r){ const la=THREE.MathUtils.degToRad(lat), lo=THREE.MathUtils.degToRad(lon); return new THREE.Vector3( r*Math.cos(la)*Math.cos(lo), r*Math.sin(la), r*Math.cos(la)*Math.sin(lo) ); }
      const a=toXYZ(lat1,lon1,R), b=toXYZ(lat2,lon2,R);
      for(let i=0;i<=steps;i++){
        const t=i/steps; const p=new THREE.Vector3().copy(a).lerp(b,t);
        p.normalize().multiplyScalar(R+Math.sin(Math.PI*t)*0.08);
        pts.push(p.x,p.y,p.z);
      }
      const g=new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pts),3));
      const l=new THREE.Line(g, arcMat); arcs.add(l);
    }
    const anchors=[[37.77,-122.4],[51.5,-0.12],[-23.55,-46.63],[35.68,139.69],[48.85,2.35]];
    for(let i=0;i<anchors.length;i++){
      const a=anchors[i], b=anchors[(i+2)%anchors.length]; arc(a[0],a[1],b[0],b[1]);
    }
    globe.add(arcs);
  })();

  // Optional: load GLTF model of girl if provided
  (function loadGirl(){
    const url = window.GIRL_GLTF_URL || '';
    if (!url || !THREE.GLTFLoader) return;
    const loader = new THREE.GLTFLoader();
    loader.load(url, (gltf)=>{
      const model = gltf.scene;
      model.scale.set(0.35,0.35,0.35);
      model.position.set(0, 1.05, 0);
      model.rotation.y = Math.PI * 0.5;
      model.traverse((o)=>{ if (o.isMesh) { o.castShadow=false; o.receiveShadow=false; } });
      globe.add(model);
      girlModel = model;
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

  girlCartGroup.visible = false; girlModel = null;
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

    // Only globe spin
    globe.rotation.y += 0.004;
    // Keep other elements static
    holoGroup.rotation.y = 0;
    holoGroup.position.y = 0.68;
    if (girlModel) {
      girlModel.rotation.y = girlModel.rotation.y;
      girlModel.position.y = 1.05;
    }

    // Keep camera and lights fixed for calm look
    camera.position.x = 0; camera.position.y = 1.2; camera.lookAt(0,0.4,0);
    accentA.intensity = 0.9; accentB.intensity = 0.8;

    // Sync slogan text pulse
    const sl = document.getElementById('slogan');
    if (sl) {
      sl.style.opacity = '1';
      sl.style.letterSpacing = 'normal';
    }

    renderScene();
    requestAnimationFrame(animate);
  }
  try { animate(); } catch (e) { const fb = select('#hero-fallback'); if (fb) fb.style.display = 'block'; }
})();

/* HERO 2D fallback animation */
(function hero2d(){
  const c = select('#hero-2d');
  if (!c) return;
  const ctx = c.getContext('2d');
  function resize(){ c.width = c.clientWidth || innerWidth; c.height = c.clientHeight || innerHeight; }
  new ResizeObserver(resize).observe(c); resize();
  let t=0; function loop(){
    if (select('#hero-canvas')) {
      const webglVisible = getComputedStyle(select('#hero-canvas')).display !== 'none';
      if (webglVisible) { c.style.display='none'; requestAnimationFrame(loop); return; }
    }
    c.style.display='block'; if (select('#hero-fallback')) select('#hero-fallback').style.display='none';
    t+=0.01; ctx.clearRect(0,0,c.width,c.height);
    ctx.translate(c.width/2, c.height/2);
    const R = Math.min(c.width,c.height)*0.28;
    // globe circle
    ctx.strokeStyle = 'rgba(0,212,255,0.25)'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(0,0,R,0,Math.PI*2); ctx.stroke();
    // rotating arcs
    for(let i=0;i<6;i++){
      ctx.save(); ctx.rotate(t + i*Math.PI/3);
      ctx.strokeStyle = 'rgba(124,58,237,0.35)'; ctx.beginPath(); ctx.arc(0,0,R+8, -0.6, 0.6); ctx.stroke(); ctx.restore();
    }
    // particles
    for(let i=0;i<60;i++){
      const a = i/60*Math.PI*2 + t; const r = R + 20 + (i%10);
      const x = Math.cos(a)*r, y=Math.sin(a)*r*0.6; ctx.fillStyle='rgba(0,212,255,0.25)'; ctx.fillRect(x,y,2,2);
    }
    ctx.setTransform(1,0,0,1,0,0);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
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
  if (!cards.length) return;
  cards.forEach(c => c.addEventListener('click', () => {
    const s = c.getAttribute('data-service') || '';
    openServiceModal(s);
  }));

  function openServiceModal(service){
    const modal = select('#service-modal');
    const title = select('#modal-title');
    const body = select('#modal-body');
    if (!modal || !title || !body) return;
    title.textContent = service || 'Serviço';
    body.innerHTML = getServiceCopy(service);
    modal.setAttribute('aria-hidden', 'false');
  }
  function getServiceCopy(service){
    const copies = {
      'Marketing Digital': 'Por que importa: atrair e converter demanda previsível. Para negócios locais, e-commerce e marcas pessoais. Como fazemos: mídia paga (Meta/Google), funis e criativos orientados por dados.',
      'Design e Identidade Visual': 'Por que importa: confiança visual e clareza. Identidades, peças para anúncios e interfaces que elevam percepção e conversão.',
      'Automação com IA': 'Por que importa: escala e eficiência 24/7. Chatbots, captação, conteúdo e análise integrados ao seu fluxo (CRM, planilhas, e-mail).',
      'Consultoria Estratégica': 'Por que importa: direção estratégica e priorização. Diagnóstico, plano de 90 dias e acompanhamento para destravar crescimento.'
    };
    return copies[service] || 'Informações sobre o serviço.';
  }
  document.addEventListener('click', (e)=>{
    const modal = select('#service-modal');
    if (!modal) return;
    const close = e.target.closest && e.target.closest('[data-close]');
    if (close || e.target === select('.modal-backdrop')) {
      modal.setAttribute('aria-hidden','true');
    }
  });
  window.addEventListener('keydown', (e)=>{
    if (e.key === 'Escape') {
      select('#service-modal')?.setAttribute('aria-hidden','true');
    }
  });
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

  const urlCfg = new URL(location.href);
  const qpProxy = urlCfg.searchParams.get('aiProxy');
  if (qpProxy) localStorage.setItem('AI_PROXY_URL', qpProxy);
  const AI_PROXY_URL = localStorage.getItem('AI_PROXY_URL') || '';

  const serviceInfo = {
    marketing: {
      title: 'Marketing Digital',
      text: 'Aquisição previsível com mídia paga (Meta/Google), funis TOFU–BOFU e criativos com teste A/B.'
    },
    design: {
      title: 'Design e Identidade Visual',
      text: 'Identidade, guias e aplicações para social/web com estética moderna e coerência de marca.'
    },
    ia: {
      title: 'Automação com IA',
      text: 'Chatbots, integrações (CRM/planilhas/e-mail) e workflows para ganho de escala e eficiência.'
    },
    consultoria: {
      title: 'Consultoria Estratégica',
      text: 'Diagnóstico + plano de 90 dias para priorizar ações e acelerar resultados com clareza.'
    }
  };

  function normalize(q){
    return (q||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  }

  async function askAI(question){
    if (!AI_PROXY_URL) return null;
    try {
      const ctrl = new AbortController();
      const t = setTimeout(()=>ctrl.abort(), 10000);
      const res = await fetch(AI_PROXY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          context: {
            services: [
              { name: serviceInfo.marketing.title, desc: serviceInfo.marketing.text },
              { name: serviceInfo.design.title, desc: serviceInfo.design.text },
              { name: serviceInfo.ia.title, desc: serviceInfo.ia.text },
              { name: serviceInfo.consultoria.title, desc: serviceInfo.consultoria.text }
            ],
            instructions: 'Responda de forma objetiva sobre os serviços: Marketing Digital, Design/Identidade, Automação com IA e Consultoria. Sempre sugira próximos passos práticos e convide para contato.'
          }
        }),
        signal: ctrl.signal
      });
      clearTimeout(t);
      if (!res.ok) return null;
      const json = await res.json();
      if (json && json.answer) return String(json.answer);
      return null;
    } catch (_) {
      return null;
    }
  }

  function buildAnswerLocal(q){
    const n = normalize(q);
    const hits = [];
    if (/(marketing|trafego|ads|anuncio|meta|google|lead|roas|e[- ]?commerce|loja)/.test(n)) hits.push('marketing');
    if (/(design|identidade|branding|ui|ux|logo|landing|site)/.test(n)) hits.push('design');
    if (/(ia|inteligencia|automacao|chatbot|assistente|gpt|workflow|zap|whatsapp|crm)/.test(n)) hits.push('ia');
    if (/(consultoria|diagnostico|estrategia|plano|mentoria|posicionamento|funil)/.test(n)) hits.push('consultoria');

    if (!n || /(ajuda|servico|servicos|o que faz|o que voce faz|pode ajudar|como funciona)/.test(n)) {
      return {
        html: `Posso ajudar nestes serviços:<br>
          • ${serviceInfo.marketing.title} — ${serviceInfo.marketing.text}<br>
          • ${serviceInfo.design.title} — ${serviceInfo.design.text}<br>
          • ${serviceInfo.ia.title} — ${serviceInfo.ia.text}<br>
          • ${serviceInfo.consultoria.title} — ${serviceInfo.consultoria.text}`,
        service: ''
      };
    }

    if (/(preco|valor|orcamento|quanto custa|preço)/.test(n)) {
      return {
        html: `Vamos montar um orçamento conforme objetivo e escopo. Diga seu nicho, meta e prazo para estimativa com opções e cronograma.`,
        service: ''
      };
    }

    if (hits.length) {
      const first = hits[0];
      const s = serviceInfo[first];
      const suggestions = {
        marketing: ['Meta/Google com funis TOFU–BOFU', 'Teste A/B de criativos e ofertas', 'Medições e metas semanais'],
        design: ['Guia de marca e paleta', 'Pacote social + landing', 'Componentes para site/app'],
        ia: ['Chatbot WhatsApp para pré-venda', 'Integração CRM + planilha + e-mail', 'Automação de conteúdo'],
        consultoria: ['Auditoria do funil atual', 'Plano de 90 dias', 'Roadmap de canais e conteúdo']
      };
      const list = (suggestions[first]||[]).map(i=>`- ${i}`).join('<br>');
      return {
        html: `<strong>${s.title}</strong><br>${s.text}<br><br><em>Próximos passos sugeridos:</em><br>${list}`,
        service: s.title
      };
    }

    // fallback básico explícito
    return {
      html: `Trabalho com: <strong>${serviceInfo.marketing.title}</strong>, <strong>${serviceInfo.design.title}</strong>, <strong>${serviceInfo.ia.title}</strong> e <strong>${serviceInfo.consultoria.title}</strong>.<br>Me diga seu objetivo (ex.: anúncios para captar clientes, criar identidade, chatbot no WhatsApp) que te mostro o melhor caminho e próximos passos.`,
      service: ''
    };
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

  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const q = input.value.trim();
    // Local answer first (instant)
    const local = buildAnswerLocal(q);
    render(local.html || 'Posso te ajudar com Marketing, Design, IA e Consultoria. Conte seu objetivo e indico o melhor caminho.', local.service);
    // Try AI in background, replace if available
    if (AI_PROXY_URL) {
      const ai = await askAI(q);
      if (ai) { render(ai, local.service || ''); }
    }
  });
  document.addEventListener('click', (e)=>{
    const ex = e.target.closest && e.target.closest('.assistant-example');
    if (!ex) return;
    e.preventDefault();
    const q = ex.getAttribute('data-q') || ex.textContent || '';
    input.value = q;
    form.dispatchEvent(new Event('submit'));
  });
})();