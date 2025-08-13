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
  if (!canvas || prefersReducedMotion || !window.THREE) return;

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
  const accentA = new THREE.PointLight(0x7c3aed, 0.9, 18); accentA.position.set(-2.4, 1.0, 2.2); scene.add(accentA);
  const accentB = new THREE.PointLight(0x00d4ff, 0.8, 18); accentB.position.set(2.2, 1.2, 2.0); scene.add(accentB);

  // Ground gradient plane (subtle)
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.MeshStandardMaterial({ color: 0x0e1322, roughness: 0.95 }));
  ground.rotation.x = -Math.PI/2; ground.position.y = -1.1; scene.add(ground);

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
  const edgeMat = new THREE.LineBasicMaterial({ color: 0x7c3aed, transparent: true, opacity: 0.45 });
  const edges = new THREE.LineSegments(edgeGeo, edgeMat);
  scene.add(edges);

  // Data flow particles moving along a curve
  const flowCount = 180;
  const flowGeo = new THREE.BufferGeometry();
  const flowPos = new Float32Array(flowCount * 3);
  const flowMat = new THREE.PointsMaterial({ color: 0x00d4ff, size: 0.02, transparent: true, opacity: 0.95 });
  const flow = new THREE.Points(flowGeo, flowMat);
  scene.add(flow);

  const flowCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-2.4, 0.0, 1.6),
    new THREE.Vector3(-1.2, 0.6, 0.8),
    new THREE.Vector3(0.0, 0.1, 0.0),
    new THREE.Vector3(1.3, 0.8, -0.8),
    new THREE.Vector3(2.6, 0.2, -1.6)
  ], false, 'catmullrom', 0.5);
  const flowOffsets = new Float32Array(flowCount);
  for (let i=0;i<flowCount;i++){ flowOffsets[i] = Math.random(); }

  // Morphing hologram logo (stylized “TS” nodes)
  const holoGroup = new THREE.Group();
  const holoMat = new THREE.MeshStandardMaterial({ color: 0x7c3aed, emissive: 0x7c3aed, emissiveIntensity: 1.2, transparent: true, opacity: 0.8, metalness: 0.2, roughness: 0.2 });
  const shapeA = new THREE.IcosahedronGeometry(0.9, 1);
  const shapeB = new THREE.TorusKnotGeometry(0.7, 0.18, 120, 16);
  const holoA = new THREE.Mesh(shapeA, holoMat);
  const holoB = new THREE.Mesh(shapeB, holoMat.clone()); holoB.visible = false;
  holoGroup.add(holoA, holoB);
  holoGroup.position.set(0, 0.7, 0);
  scene.add(holoGroup);

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

    // Morph hologram (blend visibility)
    const phase = (Math.sin(t*0.6)+1)/2; // 0..1
    holoA.visible = phase < 0.7; holoB.visible = !holoA.visible;
    holoGroup.rotation.y += 0.003; holoGroup.rotation.x += 0.0018;
    holoGroup.position.y = 0.7 + Math.sin(t*1.6)*0.06;

    // Subtle camera movement and light pulse
    camera.position.x = cx*0.4; camera.position.y = 1.2 + cy*0.18; camera.lookAt(0,0.4,0);
    accentA.intensity = 0.9 + Math.sin(t*3.0)*0.15; accentB.intensity = 0.8 + Math.cos(t*2.7)*0.15;

    renderScene();
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