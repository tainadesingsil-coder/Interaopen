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
  camera.position.set(0, 1.55, 6.8);

  // Postprocessing (bloom) for high-end look
  let composer = null;
  try {
    const size = { width: 0, height: 0 };
    const rtParams = { stencilBuffer: false }; // perf
    const effectComposer = new THREE.EffectComposer(renderer, new THREE.WebGLRenderTarget(size.width, size.height, rtParams));
    const renderPass = new THREE.RenderPass(scene, camera);
    const bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(1, 1), 0.8, 0.4, 0.85);
    effectComposer.addPass(renderPass);
    effectComposer.addPass(bloomPass);
    composer = effectComposer;
  } catch (_) {
    composer = null;
  }

  function renderScene() {
    if (composer) composer.render(); else renderer.render(scene, camera);
  }

  // Lights
  const hemi = new THREE.HemisphereLight(0xaecbff, 0x0b0f1a, 0.95); scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffffff, 1.05); key.position.set(2.2, 4, 3.2); scene.add(key);
  const magenta = new THREE.PointLight(0x7c3aed, 1.0, 16); magenta.position.set(-3, 1.6, 2.5); scene.add(magenta);
  const cyan = new THREE.PointLight(0x00d4ff, 1.0, 16); cyan.position.set(3, 1.4, 2.0); scene.add(cyan);

  // Helpers
  function makeNoiseTexture(w=256, h=256) { const c = document.createElement('canvas'); c.width=w; c.height=h; const ctx = c.getContext('2d'); const img = ctx.createImageData(w,h); const d=img.data; for (let i=0;i<w*h;i++){ const v=(Math.random()*255)|0; d[i*4]=v; d[i*4+1]=v; d[i*4+2]=v; d[i*4+3]=255; } ctx.putImageData(img,0,0); const tex=new THREE.CanvasTexture(c); tex.wrapS=tex.wrapT=THREE.RepeatWrapping; tex.repeat.set(4,4); return tex; }
  function makeSignTexture(label, colorHex) { const padX=28,padY=18,font=44; const c=document.createElement('canvas'); const ctx=c.getContext('2d'); ctx.font=`700 ${font}px Plus Jakarta Sans, Manrope, sans-serif`; const textW=ctx.measureText(label).width; const w=Math.ceil(textW)+padX*2; const h=font+padY*2; c.width=w; c.height=h; const grd=ctx.createLinearGradient(0,0,w,0); grd.addColorStop(0,'rgba(12,16,28,0.15)'); grd.addColorStop(1,'rgba(12,16,28,0.35)'); ctx.fillStyle=grd; ctx.fillRect(0,0,w,h); ctx.shadowColor=`#${colorHex.toString(16).padStart(6,'0')}`; ctx.shadowBlur=18; ctx.fillStyle=`#${colorHex.toString(16).padStart(6,'0')}`; ctx.textBaseline='middle'; ctx.font=`800 ${font}px Plus Jakarta Sans, Manrope, sans-serif`; ctx.fillText(label,padX,h/2); const tex=new THREE.CanvasTexture(c); tex.anisotropy=4; tex.needsUpdate=true; return tex; }
  const noiseTex = makeNoiseTexture();

  // Ground & lanes
  const road = new THREE.Mesh(new THREE.PlaneGeometry(20, 60), new THREE.MeshStandardMaterial({ color: 0x0f1424, roughness: 0.95, bumpMap: noiseTex, bumpScale: 0.02 })); road.rotation.x=-Math.PI/2; road.position.z=-10; scene.add(road);
  const laneMat = new THREE.MeshStandardMaterial({ color: 0x0f1424, emissive: 0x00d4ff, emissiveIntensity: 1.0 });
  const lane = new THREE.Mesh(new THREE.PlaneGeometry(0.08,60), laneMat); lane.rotation.x=-Math.PI/2; lane.position.set(-0.7,0.001,-10); scene.add(lane);
  const lane2 = new THREE.Mesh(new THREE.PlaneGeometry(0.08,60), laneMat.clone()); lane2.rotation.x=-Math.PI/2; lane2.position.set(0.7,0.001,-10); scene.add(lane2);

  // City blocks with labeled signs
  const blocks = new THREE.Group();
  const blockMat = new THREE.MeshStandardMaterial({ color: 0x101b33, metalness: 0.25, roughness: 0.82, bumpMap: noiseTex, bumpScale: 0.02 });
  const storeNames = ['Padaria', 'Farmácia', 'Mercado', 'Café', 'Restaurante'];
  for (let i=0;i<16;i++){
    const w = 0.9 + Math.random()*0.8; const h = 1.9 + Math.random()*2.2; const d = 1 + Math.random()*1.5;
    const g = new THREE.BoxGeometry(w, h, d); const m = new THREE.Mesh(g, blockMat);
    const side = i%2===0 ? -1.9 : 1.9; m.position.set(side, h/2-0.05, -i*3.6 - 2); blocks.add(m);
    const name = storeNames[i % storeNames.length]; const color = (name==='Padaria')?0xffd166: (name==='Farmácia')?0x66ffb3: (name==='Mercado')?0x66c2ff: (i%2?0x7c3aed:0x00d4ff);
    const tex = makeSignTexture(name, color);
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(0.95*w, 0.42), new THREE.MeshStandardMaterial({ color: 0xffffff, map: tex, emissive: color, emissiveMap: tex, emissiveIntensity: 1.15, transparent: true }));
    const offset = side<0 ? 0.52*w : -0.52*w; sign.position.set(side+offset, h*0.72, -i*3.6 - 2 + (side<0? 0.46 : -0.46)); sign.rotation.y = side<0 ? Math.PI/2 : -Math.PI/2; blocks.add(sign);
  }
  scene.add(blocks);

  // Try loading a high-fidelity humanoid robot glTF
  let bot = null, mixer = null; let fallbackRig = null;
  const loader = (window.THREE && THREE.GLTFLoader) ? new THREE.GLTFLoader() : null;
  const modelURL = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/RobotExpressive/glTF/RobotExpressive.gltf';

  function buildFallbackRig() {
    const metal = new THREE.MeshPhysicalMaterial({ color: 0xd6e4ff, metalness: 0.8, roughness: 0.22, clearcoat: 0.85, bumpMap: noiseTex, bumpScale: 0.02 });
    const dark = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.35, roughness: 0.6, bumpMap: noiseTex, bumpScale: 0.01 });
    const glow = new THREE.MeshStandardMaterial({ color: 0x7c3aed, emissive: 0x7c3aed, emissiveIntensity: 1.0 });
    const rig = new THREE.Group();
    const hips = new THREE.Group(); hips.position.y = 0.4; rig.add(hips);
    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.4, 1.2, 14, 22), metal); torso.position.y = 0.55; hips.add(torso);
    const shoulders = new THREE.Group(); shoulders.position.y = 1.15; hips.add(shoulders);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.31, 26, 26), dark); head.position.y = 1.55; hips.add(head);
    const visor = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.02, 10, 16), glow); visor.rotation.z = Math.PI/2; visor.position.set(0, 1.58, 0.24); hips.add(visor);
    const armGeo = new THREE.CylinderGeometry(0.075,0.075,0.9,14);
    const armL = new THREE.Mesh(armGeo, metal); armL.position.set(-0.45, 0.95, 0); shoulders.add(armL);
    const armR = new THREE.Mesh(armGeo, metal); armR.position.set(0.45, 0.95, 0); shoulders.add(armR);
    const legGeo = new THREE.CapsuleGeometry(0.1, 0.88, 10, 16);
    const legL = new THREE.Mesh(legGeo, metal); legL.position.set(-0.18, -0.05, 0); hips.add(legL);
    const legR = new THREE.Mesh(legGeo, metal); legR.position.set(0.18, -0.05, 0); hips.add(legR);
    const footGeo = new THREE.BoxGeometry(0.18, 0.08, 0.28);
    const footL = new THREE.Mesh(footGeo, dark); footL.position.set(-0.18, -0.5, 0.08); hips.add(footL);
    const footR = new THREE.Mesh(footGeo, dark); footR.position.set(0.18, -0.5, 0.08); hips.add(footR);
    const phone = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.36, 0.04), dark); phone.position.set(0.62, 0.95, 0.08); shoulders.add(phone);
    return { rig, parts: { hips, shoulders, torso, head, armL, armR, legL, legR, footL, footR } };
  }

  function placeBot(object3d) {
    bot = object3d; bot.position.set(0, 0, 2.6); scene.add(bot);
  }

  if (loader) {
    loader.load(modelURL, (gltf) => {
      const model = gltf.scene;
      model.traverse((o)=>{ if (o.isMesh) { o.castShadow=false; o.receiveShadow=false; o.material.metalness = 0.5; o.material.roughness = 0.35; }});
      model.scale.set(1.2,1.2,1.2);
      placeBot(model);
      if (gltf.animations && gltf.animations.length) {
        mixer = new THREE.AnimationMixer(model);
        const clip = THREE.AnimationClip.findByName(gltf.animations, 'Walk') || gltf.animations[0];
        const action = mixer.clipAction(clip); action.play(); action.timeScale = 1.1;
      }
    }, undefined, () => {
      const fb = buildFallbackRig(); fallbackRig = fb; placeBot(fb.rig);
    });
  } else {
    const fb = buildFallbackRig(); fallbackRig = fb; placeBot(fb.rig);
  }

  // Interaction and loop
  let cx=0, cy=0; canvas.addEventListener('pointermove', (e)=>{ cx=(e.clientX/innerWidth-0.5)*2; cy=(e.clientY/innerHeight-0.5)*2; }, {passive:true});
  const clock = new THREE.Clock();

  function resize(){ const w=canvas.clientWidth,h=canvas.clientHeight; if(!w||!h) return; renderer.setSize(w,h,false); camera.aspect=w/h; camera.updateProjectionMatrix(); if (composer) composer.setSize(w,h); }
  new ResizeObserver(resize).observe(canvas); resize();

  function animate(){
    const dt = Math.min(clock.getDelta(), 0.033);
    const t = clock.elapsedTime;

    // Move bot forward; loop
    if (bot) { bot.position.z -= 0.024; if (bot.position.z < -42) bot.position.z = 2.6; }
    if (mixer) mixer.update(dt);

    if (fallbackRig) {
      const { hips, shoulders, torso, head, armL, armR, legL, legR, footL, footR } = fallbackRig.parts;
      const phase = t*4.4; const swing = Math.sin(phase)*0.33; const opp = Math.sin(phase+Math.PI)*0.33;
      armL.rotation.z = 0.20 + swing*0.55; armR.rotation.z = -0.20 + opp*0.55;
      legL.rotation.x = -swing*0.85; legR.rotation.x = -opp*0.85;
      footL.rotation.x = Math.max(0, -swing*0.3); footR.rotation.x = Math.max(0, -opp*0.3);
      hips.rotation.y = Math.sin(phase)*0.06; shoulders.rotation.y = -Math.sin(phase)*0.05;
      torso.position.y = 0.55 + Math.abs(Math.sin(phase)*0.045); head.rotation.y = cx*0.35;
    }

    // Camera and lights
    camera.position.x = cx*0.45; camera.position.y = 1.55 + cy*0.18; camera.lookAt(0, 0.9, (bot?.position.z||0)-2);
    magenta.intensity = 0.95 + Math.sin(t*3.2)*0.2; cyan.intensity = 0.95 + Math.cos(t*2.9)*0.2;
    const pulse = 1.0 + Math.sin(t*3.5)*0.2; lane.material.emissiveIntensity = pulse; lane2.material.emissiveIntensity = pulse;

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