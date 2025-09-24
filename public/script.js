// Configuração e interações básicas da landing page
(function () {
  const app = document.getElementById('app');
  if (!app) return;

  const driveUrl = app.getAttribute('data-drive-url') || '#';
  const contactEmail = app.getAttribute('data-contact-email') || '';
  const whatsapp = app.getAttribute('data-whatsapp') || '';

  // Atribui CTAs ao Drive
  document.querySelectorAll('[data-drive-cta]').forEach((el) => {
    el.setAttribute('href', driveUrl);
    el.setAttribute('target', '_blank');
    el.setAttribute('rel', 'noopener');
  });

  // Footer contatos
  const footerEmail = document.getElementById('footer-email');
  if (footerEmail) {
    footerEmail.setAttribute('href', contactEmail ? `mailto:${contactEmail}` : '#');
  }
  const footerWhatsapp = document.getElementById('footer-whatsapp');
  if (footerWhatsapp) {
    const waLink = whatsapp ? `https://wa.me/${whatsapp}` : '#';
    footerWhatsapp.setAttribute('href', waLink);
  }

  // Hero Three.js background
  (function initHero3D() {
    const container = document.getElementById('hero-3d');
    if (!container) return;
    const textureUrl = 'https://i.postimg.cc/6QbBKQJF/Black-and-White-Dark-Minimalist-Project-Management-Platform-Website-UI-Prototype-4.png';
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/three@0.160.0/build/three.min.js';
    script.onload = () => {
      const THREE = window.THREE;
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(35, container.clientWidth / container.clientHeight, 0.1, 1000);
      camera.position.z = 8;
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);

      const light = new THREE.DirectionalLight(0xffffff, 0.9);
      light.position.set(2, 3, 4);
      scene.add(light);
      scene.add(new THREE.AmbientLight(0xffffff, 0.35));

      const loader = new THREE.TextureLoader();
      loader.setCrossOrigin('anonymous');
      loader.load(textureUrl, (tex) => {
        tex.encoding = THREE.sRGBEncoding;
        const geometry = new THREE.PlaneGeometry(12, 6, 64, 32);
        // Displace slightly for relief
        const pos = geometry.attributes.position;
        for (let i = 0; i < pos.count; i++) {
          const u = (i % 65) / 64; // approx columns
          const v = Math.floor(i / 65) / 32; // approx rows
          const n = Math.sin(u * Math.PI * 2) * Math.cos(v * Math.PI * 2);
          pos.setZ(i, n * 0.15);
        }
        pos.needsUpdate = true;
        const material = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9, metalness: 0.0 });
        const plane = new THREE.Mesh(geometry, material);
        plane.rotation.x = -0.2;
        scene.add(plane);

        const houseGeo = new THREE.BoxGeometry(0.4, 0.2, 0.4);
        const houseMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
        let house = null;

        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        container.addEventListener('pointermove', (e) => {
          const rect = container.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width;
          const y = (e.clientY - rect.top) / rect.height;
          camera.position.x = (x - 0.5) * 1.2;
          camera.position.y = (0.5 - y) * 0.6;
        });
        container.addEventListener('click', (e) => {
          const rect = container.getBoundingClientRect();
          mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
          mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
          raycaster.setFromCamera(mouse, camera);
          const intersects = raycaster.intersectObject(plane);
          if (intersects.length > 0) {
            const p = intersects[0].point.clone();
            if (!house) {
              house = new THREE.Mesh(houseGeo, houseMat);
              scene.add(house);
            }
            house.position.copy(p.add(new THREE.Vector3(0, 0, 0.1)));
          }
        });

        const onResize = () => {
          const w = container.clientWidth;
          const h = container.clientHeight;
          renderer.setSize(w, h);
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
        };
        window.addEventListener('resize', onResize);

        const animate = () => {
          requestAnimationFrame(animate);
          renderer.render(scene, camera);
        };
        animate();
      });
    };
    document.head.appendChild(script);
  })();

  // Animação de revelação ao rolar
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.15 }
  );

  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

  // Formulário: compõe e abre mailto com os dados
  const form = document.getElementById('contact-form');
  const feedback = document.getElementById('form-feedback');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const nome = formData.get('nome') || '';
      const email = formData.get('email') || '';
      const telefone = formData.get('telefone') || '';
      const imobiliaria = formData.get('imobiliaria') || '';

      const subject = encodeURIComponent('Quero ser parceiro — Portal do Velho Chico');
      const body = encodeURIComponent(
        `Nome: ${nome}\nE-mail: ${email}\nTelefone: ${telefone}\nImobiliária: ${imobiliaria}`
      );

      if (!contactEmail) {
        if (feedback) {
          feedback.textContent = 'Configurar e-mail de contato para envio.';
        }
        return;
      }

      const mailto = `mailto:${contactEmail}?subject=${subject}&body=${body}`;
      window.location.href = mailto;

      if (feedback) {
        feedback.textContent = 'Abrindo seu aplicativo de e-mail…';
      }
      form.reset();
    });
  }

  // Lot Explorer Interaction (3D-like)
  const lotExplorer = document.getElementById('lot-explorer');
  const lotPlane = document.getElementById('lot-plane');
  const lotStage = document.getElementById('lot-stage');
  const lotInfo = document.getElementById('lot-info');
  const buildBtn = document.getElementById('lot-action-build');

  function openLotExplorer() {
    if (!lotExplorer) return;
    lotExplorer.setAttribute('aria-hidden', 'false');
  }
  function closeLotExplorer() {
    if (!lotExplorer) return;
    lotExplorer.setAttribute('aria-hidden', 'true');
  }

  document.querySelectorAll('[data-open-lot-explorer]').forEach((el) => {
    el.addEventListener('click', openLotExplorer);
  });
  document.querySelectorAll('[data-close-lot-explorer]').forEach((el) => {
    el.addEventListener('click', closeLotExplorer);
  });

  // Drag rotate logic
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let rotX = 60; // initial tilt
  let rotZ = 0;

  if (lotStage && lotPlane) {
    const onDown = (e) => {
      isDragging = true;
      startX = (e.touches ? e.touches[0].clientX : e.clientX);
      startY = (e.touches ? e.touches[0].clientY : e.clientY);
    };
    const onMove = (e) => {
      if (!isDragging) return;
      const x = (e.touches ? e.touches[0].clientX : e.clientX);
      const y = (e.touches ? e.touches[0].clientY : e.clientY);
      const dx = x - startX;
      const dy = y - startY;
      rotZ += dx * 0.2;
      rotX = Math.max(20, Math.min(80, rotX - dy * 0.2));
      lotPlane.style.transform = `rotateX(${rotX}deg) rotateZ(${rotZ}deg)`;
      startX = x; startY = y;
    };
    const onUp = () => { isDragging = false; };
    lotStage.addEventListener('mousedown', onDown);
    lotStage.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    lotStage.addEventListener('touchstart', onDown, { passive: true });
    lotStage.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onUp);
  }

  // Select lot and show info
  function setLotInfo(lotId) {
    if (!lotInfo) return;
    lotInfo.innerHTML = `
      <div>
        <h4 style="margin:0 0 6px 0; color:#fff;">Lote ${lotId}</h4>
        <p class="muted" style="margin:0 0 10px 0;">Dimensão aproximada 10x20m. Vista parcial para o rio.</p>
        <div style="display:flex; gap:8px;">
          <span style="padding:4px 8px; border:1px solid rgba(255,255,255,0.12); border-radius:8px; font-size:12px;">Frente Norte</span>
          <span style="padding:4px 8px; border:1px solid rgba(255,255,255,0.12); border-radius:8px; font-size:12px;">Próx. à Marina</span>
        </div>
      </div>
    `;
  }

  document.querySelectorAll('.lot').forEach((el) => {
    el.addEventListener('click', (e) => {
      document.querySelectorAll('.lot').forEach((n) => n.classList.remove('selected'));
      el.classList.add('selected');
      const lotId = el.getAttribute('data-lot') || '';
      setLotInfo(lotId);
      e.stopPropagation();
    });
  });

  // Simple build simulation: toggle placeholder house extrusion
  if (buildBtn && lotPlane) {
    let built = false;
    buildBtn.addEventListener('click', () => {
      const selected = document.querySelector('.lot.selected');
      if (!selected) { return; }
      if (!built) {
        const house = document.createElement('div');
        house.className = 'house';
        house.style.position = 'absolute';
        house.style.width = '80px';
        house.style.height = '40px';
        house.style.left = '50%';
        house.style.top = '50%';
        house.style.transform = 'translate(-50%, -50%) translate3d(0,0,40px)';
        house.style.background = 'linear-gradient(180deg, #d1d5db, #9ca3af)';
        house.style.border = '1px solid rgba(255,255,255,0.3)';
        house.style.borderRadius = '6px';
        house.style.boxShadow = '0 10px 30px rgba(0,0,0,0.45)';
        selected.appendChild(house);
        built = true;
        buildBtn.textContent = 'Remover Simulação';
      } else {
        const house = selected.querySelector('.house');
        if (house) { house.remove(); }
        built = false;
        buildBtn.textContent = 'Simular Casa de Pescador';
      }
    });
  }
})();

