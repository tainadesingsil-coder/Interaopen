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

/* Chatbot UI with optional OpenAI API in browser */
(function initChat() {
  const toggle = select('.chat-toggle');
  const panel = select('#chat-panel');
  const close = select('.chat-close');
  const form = select('#chat-form');
  const input = select('#chat-input');
  const log = select('#chat-messages');
  if (!toggle || !panel || !form) return;

  const setOpen = (open) => {
    panel.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    if (open) input?.focus();
  };

  toggle.addEventListener('click', () => setOpen(panel.hidden));
  close?.addEventListener('click', () => setOpen(false));

  const addMsg = (text, who = 'bot') => {
    const div = document.createElement('div');
    div.className = `msg ${who}`;
    div.textContent = text;
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
  };

  // Lightweight memory (localStorage) of Q&A context
  const memoryKey = 'CHAT_MEMORY_TAINA';
  const defaultMemory = [
    { q: 'serviços', a: 'Ofereço marketing digital (tráfego, conteúdo), design (identidade, social), e automação/IA.' },
    { q: 'prazo', a: 'Prazos típicos: identidade 2–3 semanas; landing 1–2 semanas; campanha 1 semana.' },
    { q: 'investimento', a: 'Projetos sob medida; estimativas após briefing. Faço propostas modulares.' },
    { q: 'foco', a: 'Integração de estética, dados e IA para performance com identidade forte.' },
  ];
  const memory = JSON.parse(localStorage.getItem(memoryKey) || 'null') || defaultMemory;
  const saveMemory = () => localStorage.setItem(memoryKey, JSON.stringify(memory));

  const apiKey = localStorage.getItem('OPENAI_API_KEY') || '';
  if (!apiKey) addMsg('Dica: salve sua chave OpenAI no localStorage como OPENAI_API_KEY para ativar respostas inteligentes.');

  const systemPrompt = 'Você é o assistente do site da Taina Silveira. Seja objetivo e profissional. Use a memória interna (Q&A) quando pertinente: ' + memory.map(m => `(${m.q} -> ${m.a})`).join(' ');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const q = input.value.trim();
    if (!q) return;
    addMsg(q, 'user');
    input.value = '';

    try {
      if (!apiKey) {
        // Fallback retrieval from memory
        const hit = memory.find(m => q.toLowerCase().includes(m.q));
        addMsg(hit ? hit.a : 'Posso te ajudar com marketing, design e IA. Dê mais detalhes.', 'bot');
        // store brief pair
        memory.push({ q, a: hit ? hit.a : 'Aguardando mais detalhes...' }); saveMemory();
        return;
      }
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            ...memory.slice(-6).map(m => ({ role: 'system', content: `Memória: ${m.q} -> ${m.a}` })),
            { role: 'user', content: q }
          ],
          temperature: 0.6,
          max_tokens: 300
        })
      });
      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content || 'Não consegui responder agora.';
      addMsg(text, 'bot');
      memory.push({ q, a: text }); saveMemory();
    } catch (err) {
      addMsg('Erro de conexão com o assistente.');
    }
  });
})();

/* HERO 3D: more realistic motion (idle + walk), abstract environment */
(function heroRobot3D() {
  const canvas = select('#hero-canvas');
  if (!canvas || prefersReducedMotion || !window.THREE) return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 2, 0.1, 100);
  camera.position.set(0, 1.4, 6.6);

  // Lights
  scene.add(new THREE.HemisphereLight(0x9fd0ff, 0x0b0f1a, 0.95));
  const dl = new THREE.DirectionalLight(0xffffff, 1.0); dl.position.set(3, 4, 2); scene.add(dl);
  const rim = new THREE.PointLight(0x7c3aed, 0.9, 12); rim.position.set(-3, 1.2, 2.2); scene.add(rim);

  // Stage
  const stage = new THREE.Mesh(new THREE.CylinderGeometry(8, 8, 0.12, 80), new THREE.MeshStandardMaterial({ color: 0x0f1020, roughness: 0.9 }));
  stage.position.y = -1.25; scene.add(stage);

  // Materials
  const metal = new THREE.MeshPhysicalMaterial({ color: 0xbad7ff, metalness: 0.65, roughness: 0.25, clearcoat: 0.8 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x1a2235, metalness: 0.25, roughness: 0.6 });
  const glow = new THREE.MeshStandardMaterial({ color: 0x7c3aed, emissive: 0x7c3aed, emissiveIntensity: 0.9 });

  // Robot rig (primitives, smooth motion)
  const robot = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.62, 1.15, 12, 20), metal);
  body.position.y = -0.05;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.4, 28, 28), dark); head.position.y = 0.98;
  const visor = new THREE.Mesh(new THREE.CapsuleGeometry(0.28, 0.02, 10, 18), glow); visor.rotation.z = Math.PI/2; visor.position.set(0, 1.02, 0.34);
  const armL = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.92, 14), metal); armL.position.set(-0.64, 0.22, 0); armL.rotation.z = 0.5;
  const armR = armL.clone(); armR.position.x = 0.64; armR.rotation.z = -0.5;
  const legGeo = new THREE.CapsuleGeometry(0.11, 0.78, 8, 14);
  const legL = new THREE.Mesh(legGeo, metal); legL.position.set(-0.22, -0.86, 0);
  const legR = new THREE.Mesh(legGeo, metal); legR.position.set(0.22, -0.86, 0);
  const phone = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.46, 0.05), dark); phone.position.set(0.95, 0.45, 0.2);

  robot.add(body, head, visor, armL, armR, legL, legR, phone);
  scene.add(robot);

  // Floating abstract panels for parallax (no store labels)
  const panels = [];
  for (let i = 0; i < 7; i++) {
    const g = new THREE.PlaneGeometry(1.2, 0.7);
    const m = new THREE.MeshStandardMaterial({ color: 0x101b30 + i*0x030303, metalness: 0.15, roughness: 0.85 });
    const p = new THREE.Mesh(g, m);
    p.position.set(Math.cos(i) * 2.3, 0.6 + Math.sin(i * 1.1) * 0.4, Math.sin(i) * 1.6);
    p.rotation.y = -Math.atan2(p.position.z, p.position.x) + Math.PI/2;
    panels.push(p); scene.add(p);
  }

  // Particles
  const pts = new THREE.BufferGeometry(); const count = 520; const pos = new Float32Array(count*3);
  for (let i=0;i<count;i++){ pos[i*3]= (Math.random()-0.5)*9; pos[i*3+1]=(Math.random()-0.2)*5; pos[i*3+2]=(Math.random()-0.5)*7; }
  pts.setAttribute('position', new THREE.BufferAttribute(pos,3));
  scene.add(new THREE.Points(pts, new THREE.PointsMaterial({ color: 0x7dd3fc, size: 0.012, transparent: true, opacity: 0.8 })));

  // Interaction cursor affects heading subtly
  let cursorX = 0, cursorY = 0;
  canvas.addEventListener('pointermove', (e)=>{ cursorX = (e.clientX/innerWidth-0.5)*2; cursorY = (e.clientY/innerHeight-0.5)*2; }, {passive:true});

  function resize(){ const w=canvas.clientWidth,h=canvas.clientHeight; if(!w||!h) return; renderer.setSize(w,h,false); camera.aspect=w/h; camera.updateProjectionMatrix(); }
  new ResizeObserver(resize).observe(canvas); resize();

  // Animation: idle + walk loop target drifting
  const clock = new THREE.Clock();
  let tGoal = 0;
  const target = new THREE.Vector3(1.2, -0.6, 0.8);

  function animate(){
    const dt = Math.min(clock.getDelta(), 0.03);
    tGoal += dt;
    // Drift target smoothly in a loop
    const R = 1.6;
    target.set(Math.cos(tGoal*0.6)*R, -0.6, Math.sin(tGoal*0.7)*R*0.6);

    // Move robot towards target with smoothing
    const to = target.clone().sub(robot.position);
    const dist = to.length();
    const speed = 1.0;
    if (dist>0.01){ to.normalize(); robot.position.add(to.multiplyScalar(speed*dt)); }

    // Heading & head aim
    const yaw = Math.atan2(to.x, to.z);
    robot.rotation.y = THREE.MathUtils.lerp(robot.rotation.y, yaw + cursorX*0.15, 0.08);
    head.rotation.y = THREE.MathUtils.lerp(head.rotation.y || 0, cursorX*0.4, 0.12);

    // Walk cycle with breathing
    const walk = performance.now()/1000 * (dist>0.02? 4.8 : 1.2);
    const swing = Math.sin(walk)*(dist>0.02? 0.32 : 0.1);
    const opp = Math.sin(walk+Math.PI)*(dist>0.02? 0.32 : 0.1);
    armL.rotation.z = 0.5 + swing*0.45;
    armR.rotation.z = -0.5 + opp*0.45;
    legL.rotation.x = -swing*0.75;
    legR.rotation.x = -opp*0.75;
    body.position.y = -0.05 + Math.abs(Math.sin(walk)*0.045); // breathing bounce

    // Panels parallax
    panels.forEach((p,i)=>{ p.rotation.y += 0.0015*(i%2?1:-1); p.position.y = 0.6 + Math.sin(tGoal*1.1+i)*0.06; });

    renderer.render(scene,camera);
    requestAnimationFrame(animate);
  }
  animate();
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