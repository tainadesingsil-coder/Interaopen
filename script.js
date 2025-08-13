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
  const items = selectAll('.portfolio-item');
  const lightbox = select('#lightbox');
  const content = select('#lightbox-content');
  const closeBtn = select('.lightbox-close');
  if (!items.length || !lightbox || !content) return;

  const open = (node) => {
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

  items.forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      open(a);
    });
  });

  closeBtn?.addEventListener('click', close);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) close(); });
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
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

/* HERO 3D with Three.js */
(function initHero3D() {
  const canvas = select('#hero-canvas');
  if (!canvas) return;
  if (prefersReducedMotion || !window.THREE) {
    // Fallback: do nothing, CSS background handles aesthetics
    return;
  }

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 2, 0.1, 100);
  camera.position.set(0, 0, 4);

  // Lights
  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambient);
  const keyLight = new THREE.DirectionalLight(0x7c3aed, 1.2);
  keyLight.position.set(2, 2, 2);
  scene.add(keyLight);
  const fillLight = new THREE.PointLight(0x00d4ff, 1.2, 10);
  fillLight.position.set(-2, -1, 2);
  scene.add(fillLight);

  // Geometry: torus knot for a more dynamic look
  const geometry = new THREE.TorusKnotGeometry(0.9, 0.28, 180, 24);
  const material = new THREE.MeshPhysicalMaterial({
    color: 0x6c5ce7,
    metalness: 0.2,
    roughness: 0.15,
    transmission: 0.0,
    clearcoat: 1.0,
    clearcoatRoughness: 0.2,
    emissive: 0x1a103f,
    emissiveIntensity: 0.35,
    reflectivity: 0.8,
  });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  // Subtle particle field
  const particles = new THREE.BufferGeometry();
  const particleCount = 350;
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i += 1) {
    positions[i * 3 + 0] = (Math.random() - 0.5) * 8;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 5;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
  }
  particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particleMat = new THREE.PointsMaterial({ color: 0x7dd3fc, size: 0.012, transparent: true, opacity: 0.9 });
  const points = new THREE.Points(particles, particleMat);
  scene.add(points);

  let pointerX = 0, pointerY = 0;
  window.addEventListener('pointermove', (e) => {
    const { innerWidth, innerHeight } = window;
    pointerX = (e.clientX / innerWidth - 0.5) * 2;
    pointerY = (e.clientY / innerHeight - 0.5) * 2;
  }, { passive: true });

  function resizeRenderer() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (width === 0 || height === 0) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  const resizeObserver = new ResizeObserver(resizeRenderer);
  resizeObserver.observe(canvas);
  window.addEventListener('orientationchange', resizeRenderer);
  resizeRenderer();

  let rafId = null;
  const targetRotation = { x: 0, y: 0 };
  const clock = new THREE.Clock();

  function animate() {
    const elapsed = clock.getElapsedTime();

    targetRotation.x = THREE.MathUtils.lerp(targetRotation.x, pointerY * 0.35, 0.05);
    targetRotation.y = THREE.MathUtils.lerp(targetRotation.y, pointerX * 0.5, 0.05);

    mesh.rotation.x = elapsed * 0.25 + targetRotation.x;
    mesh.rotation.y = elapsed * 0.35 + targetRotation.y;

    points.rotation.y = elapsed * 0.05;

    renderer.render(scene, camera);
    rafId = requestAnimationFrame(animate);
  }

  animate();

  // Cleanup on page hide
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (rafId) cancelAnimationFrame(rafId);
    } else {
      animate();
    }
  });
})();