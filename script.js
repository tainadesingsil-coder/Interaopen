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

/* HERO 3D: futuristic city street with humanoid robot silhouette */
(function heroCityRobot() {
  const canvas = select('#hero-canvas');
  if (!canvas || prefersReducedMotion || !window.THREE) return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0b0f1a, 0.06);
  const camera = new THREE.PerspectiveCamera(50, 2, 0.1, 200);
  camera.position.set(0, 1.6, 6.5);

  // Lights: neon ambience + key
  const hemi = new THREE.HemisphereLight(0xaecbff, 0x0b0f1a, 0.9); scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffffff, 1.0); key.position.set(2, 4, 3); scene.add(key);
  const magenta = new THREE.PointLight(0x7c3aed, 1.0, 16); magenta.position.set(-3, 1.6, 2.5); scene.add(magenta);
  const cyan = new THREE.PointLight(0x00d4ff, 1.0, 16); cyan.position.set(3, 1.4, 2.0); scene.add(cyan);

  // Ground road with emissive lanes
  const road = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 60, 1, 1),
    new THREE.MeshStandardMaterial({ color: 0x0f1424, roughness: 0.95 })
  );
  road.rotation.x = -Math.PI/2; road.position.z = -10; scene.add(road);
  const lane = new THREE.Mesh(
    new THREE.PlaneGeometry(0.08, 60),
    new THREE.MeshStandardMaterial({ color: 0x0f1424, emissive: 0x00d4ff, emissiveIntensity: 0.9 })
  );
  lane.rotation.x = -Math.PI/2; lane.position.set(-0.7, 0.001, -10); scene.add(lane);
  const lane2 = lane.clone(); lane2.position.x = 0.7; scene.add(lane2);

  // City blocks (simple extrusions with emissive billboards)
  const blocks = new THREE.Group();
  const blockMat = new THREE.MeshStandardMaterial({ color: 0x101b33, metalness: 0.2, roughness: 0.85 });
  for (let i=0;i<14;i++){
    const w = 0.9 + Math.random()*0.8;
    const h = 1.6 + Math.random()*2.2;
    const d = 1 + Math.random()*1.5;
    const g = new THREE.BoxGeometry(w, h, d);
    const m = new THREE.Mesh(g, blockMat);
    const side = i%2===0 ? -1.8 : 1.8;
    m.position.set(side, h/2-0.05, -i*3.6 - 2);
    blocks.add(m);

    // Billboard
    const signG = new THREE.PlaneGeometry(0.9*w, 0.4);
    const signM = new THREE.MeshStandardMaterial({ color: 0x0b0f1a, emissive: i%2?0x7c3aed:0x00d4ff, emissiveIntensity: 1.2 });
    const sign = new THREE.Mesh(signG, signM);
    const offset = side<0 ? 0.5*w : -0.5*w;
    sign.position.set(side+offset, h*0.7, -i*3.6 - 2 + (side<0? 0.45 : -0.45));
    sign.rotation.y = side<0 ? Math.PI/2 : -Math.PI/2;
    blocks.add(sign);
  }
  scene.add(blocks);

  // Humanoid robot silhouette (stylized, performance-friendly)
  const metal = new THREE.MeshPhysicalMaterial({ color: 0xd6e4ff, metalness: 0.75, roughness: 0.25, clearcoat: 0.8 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.3, roughness: 0.6 });
  const glow = new THREE.MeshStandardMaterial({ color: 0x7c3aed, emissive: 0x7c3aed, emissiveIntensity: 0.9 });

  const bot = new THREE.Group();
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.45, 1.1, 12, 20), metal); torso.position.y = 0.5;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.32, 24, 24), dark); head.position.y = 1.3;
  const visor = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.02, 10, 16), glow); visor.rotation.z = Math.PI/2; visor.position.set(0, 1.34, 0.26);
  const armL = new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.08,0.85,12), metal); armL.position.set(-0.5, 0.6, 0);
  const armR = armL.clone(); armR.position.x = 0.5;
  const legG = new THREE.CapsuleGeometry(0.1, 0.8, 8, 14);
  const legL = new THREE.Mesh(legG, metal); legL.position.set(-0.18, 0.0, 0);
  const legR = new THREE.Mesh(legG, metal); legR.position.set(0.18, 0.0, 0);
  // Phone in right hand
  const phone = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.36, 0.04), dark); phone.position.set(0.62, 0.75, 0.08);

  bot.add(torso, head, visor, armL, armR, legL, legR, phone);
  bot.position.set(0, 0.4, 2.5);
  scene.add(bot);

  // Animation controls
  let cx=0, cy=0; canvas.addEventListener('pointermove', (e)=>{ cx=(e.clientX/innerWidth-0.5)*2; cy=(e.clientY/innerHeight-0.5)*2; }, {passive:true});
  const clock = new THREE.Clock();

  function resize(){ const w=canvas.clientWidth,h=canvas.clientHeight; if(!w||!h) return; renderer.setSize(w,h,false); camera.aspect=w/h; camera.updateProjectionMatrix(); }
  new ResizeObserver(resize).observe(canvas); resize();

  function animate(){
    const t = clock.getElapsedTime();
    // Walk forward in a straight line
    bot.position.z -= 0.02; if (bot.position.z < -40) bot.position.z = 2.5;
    const swing = Math.sin(t*4.8)*0.32; const opp = Math.sin(t*4.8+Math.PI)*0.32;
    armL.rotation.z = 0.25 + swing*0.5; armR.rotation.z = -0.25 + opp*0.5;
    legL.rotation.x = -swing*0.8; legR.rotation.x = -opp*0.8;
    torso.position.y = 0.5 + Math.abs(Math.sin(t*4.8)*0.04); // breathing bounce
    head.rotation.y = cx*0.3;

    // Parallax camera
    camera.position.x = cx*0.4; camera.position.y = 1.6 + cy*0.15; camera.lookAt(0, 0.7, bot.position.z-2);

    // Neon flicker/billboards
    magenta.intensity = 0.9 + Math.sin(t*3.2)*0.2;
    cyan.intensity = 0.9 + Math.cos(t*2.9)*0.2;

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