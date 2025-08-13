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

/* HERO 3D: realistic tech modeling scene */
(function heroTech3D() {
  const canvas = select('#hero-canvas');
  if (!canvas || prefersReducedMotion || !window.THREE) return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0b0f1a, 0.06);
  const camera = new THREE.PerspectiveCamera(45, 2, 0.1, 100);
  camera.position.set(0, 1.4, 6.2);

  // Environment lighting
  const hemi = new THREE.HemisphereLight(0xbcd9ff, 0x0b0f1a, 0.85); scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffffff, 1.1); key.position.set(3, 4, 2); scene.add(key);
  const rim = new THREE.PointLight(0x7c3aed, 1.0, 14); rim.position.set(-3, 1.2, 2.2); scene.add(rim);

  // Base platform (brushed metal)
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(8, 8, 0.12, 100),
    new THREE.MeshPhysicalMaterial({ color: 0x0e1322, metalness: 0.9, roughness: 0.5, clearcoat: 0.5 })
  );
  base.position.y = -1.25; scene.add(base);

  // Neon ring
  const ringGeo = new THREE.TorusGeometry(3.2, 0.05, 24, 120);
  const ringMat = new THREE.MeshStandardMaterial({ color: 0x00d4ff, emissive: 0x00d4ff, emissiveIntensity: 1.4, metalness: 0.2, roughness: 0.2 });
  const ring = new THREE.Mesh(ringGeo, ringMat); ring.rotation.x = Math.PI/2; ring.position.y = -0.4; scene.add(ring);

  // Central chip (tech block)
  const chip = new THREE.Group();
  const chipBody = new THREE.Mesh(
    new THREE.BoxGeometry(1.8, 0.5, 1.8),
    new THREE.MeshPhysicalMaterial({ color: 0x1a2235, metalness: 0.6, roughness: 0.2, clearcoat: 1.0 })
  );
  const chipTop = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 0.12, 1.6),
    new THREE.MeshStandardMaterial({ color: 0x0c1426, metalness: 0.4, roughness: 0.3 })
  );
  chipTop.position.y = 0.32;

  // Pins around
  const pinMat = new THREE.MeshStandardMaterial({ color: 0xbad7ff, metalness: 0.9, roughness: 0.25 });
  const pins = new THREE.Group();
  for (let i=0; i<28; i++) {
    const g = new THREE.CylinderGeometry(0.03, 0.03, 0.18, 10);
    const m = new THREE.Mesh(g, pinMat);
    const a = (i/28) * Math.PI * 2;
    const r = 1.05;
    m.position.set(Math.cos(a)*r, -0.16, Math.sin(a)*r);
    pins.add(m);
  }
  chip.add(chipBody, chipTop, pins);
  scene.add(chip);

  // Hologram: floating polygonal frame
  const holoGeo = new THREE.IcosahedronGeometry(0.9, 1);
  const holoMat = new THREE.MeshStandardMaterial({ color: 0x7c3aed, wireframe: true, emissive: 0x7c3aed, emissiveIntensity: 0.9, transparent: true, opacity: 0.8 });
  const holo = new THREE.Mesh(holoGeo, holoMat); holo.position.y = 0.9; scene.add(holo);

  // Particle dust
  const dGeo = new THREE.BufferGeometry(); const count = 700; const pos = new Float32Array(count*3);
  for (let i=0;i<count;i++){ pos[i*3]= (Math.random()-0.5)*10; pos[i*3+1]=(Math.random()-0.2)*6; pos[i*3+2]=(Math.random()-0.5)*8; }
  dGeo.setAttribute('position', new THREE.BufferAttribute(pos,3));
  scene.add(new THREE.Points(dGeo, new THREE.PointsMaterial({ color: 0x7dd3fc, size: 0.012, transparent: true, opacity: 0.85 })));

  // Subtle camera dolly and parallax
  let cx = 0, cy = 0;
  canvas.addEventListener('pointermove', (e)=>{ cx = (e.clientX/innerWidth-0.5)*2; cy = (e.clientY/innerHeight-0.5)*2; }, {passive:true});

  function resize(){ const w=canvas.clientWidth,h=canvas.clientHeight; if(!w||!h) return; renderer.setSize(w,h,false); camera.aspect=w/h; camera.updateProjectionMatrix(); }
  new ResizeObserver(resize).observe(canvas); resize();

  const clock = new THREE.Clock();
  function animate(){
    const t = clock.getElapsedTime();
    // Chip levitation and rotation
    chip.position.y = Math.sin(t*1.3)*0.06;
    chip.rotation.y += 0.003;
    ring.material.emissiveIntensity = 1.1 + Math.sin(t*2.0)*0.3;
    holo.rotation.x += 0.0022; holo.rotation.y += 0.0028;
    holo.position.y = 0.9 + Math.sin(t*1.6)*0.08;

    // Camera
    camera.position.x = cx*0.35; camera.position.y = 1.4 + cy*0.2; camera.lookAt(0,0.2,0);

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