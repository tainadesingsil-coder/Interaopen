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
(async function loadPortfolio() {
  const grid = select('#portfolio-grid');
  if (!grid) return;
  const urlParam = new URLSearchParams(location.search).get('portfolio');
  const source = urlParam || grid.dataset.source || '/workspace/portfolio.json';
  try {
    const res = await fetch(source, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    const items = Array.isArray(data) ? data : (data.items || []);
    if (!items.length) throw new Error('Manifesto vazio');

    const frag = document.createDocumentFragment();
    items.forEach((item) => {
      const type = item.type === 'video' ? 'video' : 'image';
      const a = document.createElement('a');
      a.className = 'portfolio-item reveal in';
      a.href = item.src;
      a.dataset.type = type;
      if (item.category) a.dataset.category = item.category;
      a.setAttribute('aria-label', item.title || 'Item do portfólio');

      if (type === 'video') {
        const thumb = document.createElement('div');
        thumb.className = 'thumb video-thumb';
        const play = document.createElement('span');
        play.className = 'play';
        play.textContent = '▶';
        const img = document.createElement('img');
        img.src = item.thumb || item.poster || item.src;
        img.alt = item.title || 'Vídeo do portfólio';
        thumb.appendChild(play);
        thumb.appendChild(img);
        a.appendChild(thumb);
        // hover preview small muted inline video
        const v = document.createElement('video');
        v.className = 'hover-preview';
        v.src = item.src;
        v.muted = true;
        v.loop = true;
        v.playsInline = true;
        a.appendChild(v);
        a.addEventListener('mouseenter', () => v.play());
        a.addEventListener('mouseleave', () => { v.pause(); v.currentTime = 0; });
      } else {
        const thumb = document.createElement('div');
        thumb.className = 'thumb';
        thumb.style.backgroundImage = `url('${item.thumb || item.src}')`;
        a.appendChild(thumb);
      }
      const caption = document.createElement('span');
      caption.className = 'caption';
      caption.textContent = item.title || '';
      a.appendChild(caption);
      frag.appendChild(a);
    });
    grid.innerHTML = '';
    grid.appendChild(frag);
  } catch (err) {
    grid.innerHTML = '<p style="color: var(--text-dim)">Não foi possível carregar o portfólio automaticamente.</p>';
  }
})();

/* Portfolio filters */
(function initFilters() {
  const grid = select('#portfolio-grid');
  const buttons = selectAll('.filter-btn');
  if (!grid || !buttons.length) return;
  const setActive = (btn) => {
    buttons.forEach(b => { b.classList.toggle('active', b === btn); b.setAttribute('aria-selected', String(b === btn)); });
  };
  const applyFilter = (key) => {
    const items = selectAll('.portfolio-item', grid);
    items.forEach((el) => {
      const cat = el.dataset.category || 'design';
      const type = el.dataset.type;
      const match = key === 'all' || key === cat || key === type;
      el.style.display = match ? '' : 'none';
    });
  };
  buttons.forEach((btn) => btn.addEventListener('click', () => {
    setActive(btn);
    applyFilter(btn.dataset.filter);
  }));
})();

/* Lightbox with navigation */
(function enhanceLightbox() {
  const lightbox = select('#lightbox');
  const content = select('#lightbox-content');
  const prev = select('.lightbox-prev');
  const next = select('.lightbox-next');
  if (!lightbox || !content || !prev || !next) return;
  let list = [];
  let index = 0;

  const rebuildList = () => {
    list = selectAll('.portfolio-item');
  };
  rebuildList();

  const openByIndex = (i) => {
    rebuildList();
    if (!list.length) return;
    index = (i + list.length) % list.length;
    const node = list[index];
    const href = node.getAttribute('href');
    const type = node.dataset.type || 'image';
    content.innerHTML = '';
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

  document.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('.portfolio-item');
    if (!a) return;
    if (!a.closest('#portfolio')) return;
    e.preventDefault();
    const all = selectAll('.portfolio-item');
    const idx = all.indexOf(a);
    openByIndex(idx);
  });

  prev.addEventListener('click', () => openByIndex(index - 1));
  next.addEventListener('click', () => openByIndex(index + 1));
  window.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'ArrowLeft') openByIndex(index - 1);
    if (e.key === 'ArrowRight') openByIndex(index + 1);
  });
})();

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

  const apiKey = localStorage.getItem('OPENAI_API_KEY') || '';
  if (!apiKey) {
    addMsg('Dica: salve sua chave OpenAI no localStorage como OPENAI_API_KEY para ativar o chat.');
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const q = input.value.trim();
    if (!q) return;
    addMsg(q, 'user');
    input.value = '';
    try {
      if (!apiKey) { addMsg('Chat offline: descreva seu projeto que retorno por e-mail.'); return; }
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'Você é o assistente do site da Taina Silveira, responda de forma objetiva sobre serviços, prazos e portfólio.' },
            { role: 'user', content: q }
          ],
          temperature: 0.7,
          max_tokens: 250
        })
      });
      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content || 'Não foi possível responder agora.';
      addMsg(text, 'bot');
    } catch (err) {
      addMsg('Erro de conexão com o assistente.');
    }
  });
})();

/* HERO 3D upgrade: robot photographer scene */
(function heroRobot3D() {
  const canvas = select('#hero-canvas');
  if (!canvas || prefersReducedMotion || !window.THREE) return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 2, 0.1, 100);
  camera.position.set(0, 0.8, 5);

  // Lights
  const hemi = new THREE.HemisphereLight(0x8ec5ff, 0x0b0f1a, 0.8);
  scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffffff, 1.1);
  key.position.set(3, 3, 2);
  scene.add(key);
  const rim = new THREE.PointLight(0x7c3aed, 1.2, 8);
  rim.position.set(-2.4, 1.2, 2.2);
  scene.add(rim);

  // Ground
  const ground = new THREE.Mesh(
    new THREE.CylinderGeometry(5, 5, 0.2, 64),
    new THREE.MeshStandardMaterial({ color: 0x0f1020, metalness: 0.6, roughness: 0.8 })
  );
  ground.position.y = -1.1;
  scene.add(ground);

  // Robot made from primitives
  const metal = new THREE.MeshPhysicalMaterial({ color: 0xbad7ff, metalness: 0.5, roughness: 0.2, clearcoat: 0.7 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x1a2235, metalness: 0.2, roughness: 0.6 });
  const glow = new THREE.MeshStandardMaterial({ color: 0x7c3aed, emissive: 0x7c3aed, emissiveIntensity: 0.8 });

  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.6, 1.0, 8, 16), metal);
  body.position.y = -0.1;

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.38, 24, 24), dark);
  head.position.y = 0.9;
  const eye = new THREE.Mesh(new THREE.CapsuleGeometry(0.26, 0.02, 8, 16), glow);
  eye.rotation.z = Math.PI / 2;
  eye.position.set(0, 0.95, 0.32);

  const armL = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.9, 12), metal);
  armL.position.set(-0.6, 0.2, 0);
  armL.rotation.z = 0.5;
  const armR = armL.clone();
  armR.position.x = 0.6; armR.rotation.z = -0.5;

  // Camera device in right hand
  const camGroup = new THREE.Group();
  const camBody = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.32, 0.25), dark);
  const camLens = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.28, 24), metal);
  camLens.rotation.x = Math.PI / 2;
  camLens.position.z = 0.2;
  const flash = new THREE.PointLight(0xffffff, 0, 5);
  flash.position.set(0.2, 0.2, 0.1);
  camGroup.add(camBody, camLens, flash);
  camGroup.position.set(0.95, 0.45, 0.2);

  const robot = new THREE.Group();
  robot.add(body, head, eye, armL, armR, camGroup);
  scene.add(robot);

  // Floating storefronts (panels) around robot
  const panelGeo = new THREE.PlaneGeometry(0.9, 0.6);
  const panels = [];
  const panelMats = [
    new THREE.MeshStandardMaterial({ color: 0x16203a, metalness: 0.1, roughness: 0.8 }),
    new THREE.MeshStandardMaterial({ color: 0x1d2748, metalness: 0.1, roughness: 0.8 }),
    new THREE.MeshStandardMaterial({ color: 0x0f1a2e, metalness: 0.1, roughness: 0.8 })
  ];
  for (let i = 0; i < 6; i++) {
    const p = new THREE.Mesh(panelGeo, panelMats[i % panelMats.length]);
    p.position.set(Math.cos(i) * 2.2, 0.6 + Math.sin(i * 1.3) * 0.4, Math.sin(i) * 1.4);
    p.rotation.y = -Math.atan2(p.position.z, p.position.x) + Math.PI / 2;
    panels.push(p);
    scene.add(p);
  }

  // Particles
  const pts = new THREE.BufferGeometry();
  const count = 420;
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    pos[i*3+0] = (Math.random()-0.5) * 8;
    pos[i*3+1] = (Math.random()-0.2) * 5;
    pos[i*3+2] = (Math.random()-0.5) * 6;
  }
  pts.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const ptsMat = new THREE.PointsMaterial({ color: 0x7dd3fc, size: 0.012, transparent: true, opacity: 0.8 });
  const star = new THREE.Points(pts, ptsMat);
  scene.add(star);

  let pointerX = 0, pointerY = 0;
  window.addEventListener('pointermove', (e) => {
    pointerX = (e.clientX / innerWidth - 0.5) * 2;
    pointerY = (e.clientY / innerHeight - 0.5) * 2;
  }, { passive: true });

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(canvas);
  resize();

  const clock = new THREE.Clock();
  let flashTimer = 0;

  function animate() {
    const t = clock.getElapsedTime();
    robot.rotation.y = THREE.MathUtils.lerp(robot.rotation.y, pointerX * 0.5, 0.05);
    head.rotation.y = pointerX * 0.6;
    armR.rotation.z = -0.5 + Math.sin(t * 1.8) * 0.1;
    camGroup.rotation.y = Math.sin(t * 1.2) * 0.2;

    panels.forEach((p, i) => {
      p.rotation.y += 0.002 * (i % 2 === 0 ? 1 : -1);
      p.position.y = 0.6 + Math.sin(t * 1.1 + i) * 0.08;
    });

    star.rotation.y += 0.0015;

    // Camera flash pulse
    flashTimer += clock.getDelta();
    if (flashTimer > 2.4) {
      flash.intensity = 8; // flash
      setTimeout(() => flash.intensity = 0, 80);
      flashTimer = 0;
    }

    renderer.render(scene, camera);
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