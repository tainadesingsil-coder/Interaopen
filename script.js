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

  // Hero Three.js background (procedural São Francisco river + stilt house)
  (function initHero3D() {
    const container = document.getElementById('hero-3d');
    if (!container) return; // if no 3D container, skip (using static image)
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/three@0.160.0/build/three.min.js';
    script.onload = () => {
      const THREE = window.THREE;
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(35, container.clientWidth / container.clientHeight, 0.1, 1000);
      camera.position.set(0, 1.4, 7.5);
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);

      // Lights
      const key = new THREE.DirectionalLight(0xffffff, 0.9); key.position.set(3, 4, 5); scene.add(key);
      scene.add(new THREE.AmbientLight(0xffffff, 0.35));

      // Helpers: curve for river (S-shape)
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-6, 0, 3),
        new THREE.Vector3(-2, 0, -1),
        new THREE.Vector3(2, 0, 1.2),
        new THREE.Vector3(6, 0, -2.5)
      ]);

      function createRibbonGeometry(curve, segments, width) {
        const positions = [];
        const indices = [];
        const normals = [];
        const up = new THREE.Vector3(0, 1, 0);
        let idx = 0;
        for (let i = 0; i <= segments; i++) {
          const t = i / segments;
          const center = curve.getPoint(t);
          const tangent = curve.getTangent(t).normalize();
          const side = new THREE.Vector3().crossVectors(up, tangent).normalize();
          const left = new THREE.Vector3().copy(center).addScaledVector(side, width * 0.5);
          const right = new THREE.Vector3().copy(center).addScaledVector(side, -width * 0.5);
          positions.push(left.x, left.y, left.z);
          positions.push(right.x, right.y, right.z);
          normals.push(0,1,0, 0,1,0);
          if (i < segments) {
            indices.push(idx, idx+1, idx+2, idx+1, idx+3, idx+2);
            idx += 2;
          }
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
        geo.setIndex(indices);
        geo.computeBoundingSphere();
        return geo;
      }

      // Water shader
      const waterUniforms = {
        u_time: { value: 0 },
        u_colorA: { value: new THREE.Color('#0a2330') },
        u_colorB: { value: new THREE.Color('#113a4e') }
      };
      const waterMat = new THREE.ShaderMaterial({
        uniforms: waterUniforms,
        transparent: true,
        vertexShader: `
          uniform float u_time;
          varying float v_wave;
          void main(){
            vec3 p = position;
            float w = sin(p.x*2.0 + u_time*1.2)*0.03 + cos(p.z*2.4 + u_time*1.3)*0.03;
            p.y += w;
            v_wave = w;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(p,1.0);
          }
        `,
        fragmentShader: `
          varying float v_wave;
          uniform vec3 u_colorA;
          uniform vec3 u_colorB;
          void main(){
            float m = clamp((v_wave+0.06)/0.12, 0.0, 1.0);
            vec3 c = mix(u_colorA, u_colorB, m);
            gl_FragColor = vec4(c, 0.96);
          }
        `
      });
      const water = new THREE.Mesh(createRibbonGeometry(curve, 140, 2.2), waterMat);
      scene.add(water);

      // Ground patches: sandbars and banks
      function addBankPatch(centerT, offset, len, width, color) {
        const segs = 40;
        const pts = [];
        for (let i=0;i<=segs;i++){
          const t = THREE.MathUtils.clamp(centerT + (i/segs-0.5)*len, 0, 1);
          const c = curve.getPoint(t);
          const side = new THREE.Vector3().crossVectors(new THREE.Vector3(0,1,0), curve.getTangent(t)).normalize();
          const p = new THREE.Vector3().copy(c).addScaledVector(side, offset + (Math.sin(i*0.2)*0.15));
          pts.push(new THREE.Vector2(p.x, p.z));
        }
        for (let i=segs;i>=0;i--){
          const t = THREE.MathUtils.clamp(centerT + (i/segs-0.5)*len, 0, 1);
          const c = curve.getPoint(t);
          const side = new THREE.Vector3().crossVectors(new THREE.Vector3(0,1,0), curve.getTangent(t)).normalize();
          const p = new THREE.Vector3().copy(c).addScaledVector(side, offset+width + (Math.cos(i*0.2)*0.1));
          pts.push(new THREE.Vector2(p.x, p.z));
        }
        const shape = new THREE.Shape(pts);
        const geom = new THREE.ShapeGeometry(shape);
        const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.95, metalness: 0.0 });
        const mesh = new THREE.Mesh(geom, mat);
        mesh.rotation.x = -Math.PI/2;
        scene.add(mesh);
      }
      addBankPatch(0.35, 1.2, 0.28, 0.5, 0x8d7f63); // sandbar
      addBankPatch(0.65, -1.3, 0.32, 0.45, 0x8d7f63); // sandbar other side

      // Vegetation (stylized trees)
      const treeMat = new THREE.MeshStandardMaterial({ color: 0xbad4c2 });
      for (let i=0;i<18;i++){
        const t = Math.random()*0.9+0.05;
        const c = curve.getPoint(t);
        const side = new THREE.Vector3().crossVectors(new THREE.Vector3(0,1,0), curve.getTangent(t)).normalize();
        const dist = (Math.random()<0.5?1:-1) * (1.6 + Math.random()*0.8);
        const pos = new THREE.Vector3().copy(c).addScaledVector(side, dist);
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.03,0.03,0.25,6), new THREE.MeshStandardMaterial({ color: 0x6b5b4d }));
        trunk.position.set(pos.x, 0.125, pos.z);
        const crown = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.35, 6), treeMat);
        crown.position.set(pos.x, 0.35, pos.z);
        scene.add(trunk, crown);
      }

      // Minimalist stilt house (cabana de pescador)
      const house = new THREE.Group();
      const base = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.35, 0.6), new THREE.MeshStandardMaterial({ color: 0xf2f2f2 }));
      base.position.y = 0.35/2 + 0.25;
      house.add(base);
      // Stilts
      const stiltMat = new THREE.MeshStandardMaterial({ color: 0x8a8173 });
      const stiltGeo = new THREE.CylinderGeometry(0.03,0.03,0.25,6);
      const stiltPositions = [
        [-0.38, 0.125, -0.25], [0.38, 0.125, -0.25], [-0.38, 0.125, 0.25], [0.38, 0.125, 0.25]
      ];
      stiltPositions.forEach(p=>{ const s = new THREE.Mesh(stiltGeo, stiltMat); s.position.set(p[0], p[1], p[2]); house.add(s); });
      // Roof
      const roof = new THREE.Mesh(new THREE.ConeGeometry(0.7, 0.3, 4), new THREE.MeshStandardMaterial({ color: 0xcccccc }));
      roof.rotation.y = Math.PI/4;
      roof.position.y = 0.35 + 0.25 + 0.15;
      house.add(roof);
      // Small dock
      const dock = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.06, 0.2), new THREE.MeshStandardMaterial({ color: 0x9aa3a7 }));
      dock.position.set(0.7, 0.2, 0.0);
      house.add(dock);

      // Fisherman (minimalist mannequin) on dock
      const fisherman = new THREE.Group();
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.45, 12), new THREE.MeshStandardMaterial({ color: 0xbcbcbc }));
      body.position.y = 0.45/2;
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 12), new THREE.MeshStandardMaterial({ color: 0xe6e6e6 }));
      head.position.y = 0.45 + 0.12;
      // Arms: left idle, right throwing (as a group with pivot at shoulder)
      const leftArm = new THREE.Mesh(new THREE.CylinderGeometry(0.03,0.03,0.32,8), new THREE.MeshStandardMaterial({ color: 0xbcbcbc }));
      leftArm.position.set(-0.12, 0.35, 0);
      leftArm.rotation.z = 0.6;
      const rightArm = new THREE.Group();
      rightArm.position.set(0.12, 0.35, 0); // shoulder pivot
      const rightArmBone = new THREE.Mesh(new THREE.CylinderGeometry(0.03,0.03,0.34,8), new THREE.MeshStandardMaterial({ color: 0xbcbcbc }));
      rightArmBone.position.y = -0.17;
      const rightHandRef = new THREE.Object3D();
      rightHandRef.position.y = -0.34;
      rightArm.add(rightArmBone);
      rightArm.add(rightHandRef);
      fisherman.add(body, head, leftArm, rightArm);
      fisherman.position.set(0.9, 0.26, 0.0);
      house.add(fisherman);

      // Place house near a bank point
      (function placeHouseAt(t, sideOffset){
        const c = curve.getPoint(t);
        const side = new THREE.Vector3().crossVectors(new THREE.Vector3(0,1,0), curve.getTangent(t)).normalize();
        const pos = new THREE.Vector3().copy(c).addScaledVector(side, sideOffset);
        house.position.set(pos.x, 0, pos.z);
        scene.add(house);
      })(0.58, -1.4);

      // Parallax camera
      container.addEventListener('pointermove', (e) => {
        const rect = container.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        camera.position.x = (x - 0.5) * 1.2;
        camera.position.y = 1.4 + (0.5 - y) * 0.4;
      });

      // Click to move house to nearest bank point
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();
      const groundPlane = new THREE.Mesh(new THREE.PlaneGeometry(50, 30), new THREE.MeshBasicMaterial({ visible: false }));
      groundPlane.rotation.x = -Math.PI/2; scene.add(groundPlane);
      container.addEventListener('click', (e) => {
        const rect = container.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const hit = raycaster.intersectObject(groundPlane);
        if (hit.length) {
          const p = hit[0].point;
          // Find closest point on curve by sampling
          let bestT = 0; let bestD = Infinity; let bestSide = new THREE.Vector3(); let bestC = new THREE.Vector3();
          for (let i=0;i<=150;i++){
            const t = i/150;
            const c = curve.getPoint(t);
            const d = c.distanceTo(p);
            if (d < bestD) { bestD = d; bestT = t; bestC = c; bestSide = new THREE.Vector3().crossVectors(new THREE.Vector3(0,1,0), curve.getTangent(t)).normalize(); }
          }
          const sideOffset = (p.clone().sub(bestC).dot(bestSide) > 0 ? 1 : -1) * 1.4;
          const pos = bestC.clone().addScaledVector(bestSide, sideOffset);
          house.position.set(pos.x, 0, pos.z);
          // Also trigger throw on click near house
          triggerThrow();
        }
      });

      // Fisherman throw animation + net
      let throwState = 'idle';
      let throwStart = 0;
      const nets = [];
      function spawnNet(origin) {
        const geo = new THREE.RingGeometry(0.05, 0.2, 24, 1);
        const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85, wireframe: true });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.copy(origin);
        mesh.rotation.x = -Math.PI/2;
        scene.add(mesh);
        nets.push({ mesh, start: clock.getElapsedTime(), dur: 1.6, dir: new THREE.Vector3(0.8, 0.6, -1.2).normalize() });
      }
      function triggerThrow() {
        if (throwState !== 'idle') return;
        throwState = 'windup';
        throwStart = clock.getElapsedTime();
      }
      // Auto throw every few seconds
      setInterval(triggerThrow, 6000);

      const onResize = () => {
        const w = container.clientWidth;
        const h = container.clientHeight;
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      window.addEventListener('resize', onResize);

      const clock = new THREE.Clock();
      const animate = () => {
        requestAnimationFrame(animate);
        waterUniforms.u_time.value = clock.getElapsedTime();

        // Throw state machine
        if (throwState !== 'idle') {
          const t = clock.getElapsedTime() - throwStart;
          if (throwState === 'windup') {
            // 0-0.4s: arm back
            const k = Math.min(t / 0.4, 1);
            rightArm.rotation.z = -0.8 * k; // back
            if (k >= 1) { throwState = 'throw'; throwStart = clock.getElapsedTime(); }
          } else if (throwState === 'throw') {
            // 0-0.5s: swing forward and release
            const k = Math.min((clock.getElapsedTime() - throwStart) / 0.5, 1);
            rightArm.rotation.z = -0.8 + (1.2 * k); // forward
            if (k >= 0.4 && k < 0.45) {
              // release once
              const handWorld = new THREE.Vector3();
              rightHandRef.getWorldPosition(handWorld);
              spawnNet(handWorld);
            }
            if (k >= 1) { throwState = 'recover'; throwStart = clock.getElapsedTime(); }
          } else if (throwState === 'recover') {
            // 0-0.6s: settle to neutral
            const k = Math.min((clock.getElapsedTime() - throwStart) / 0.6, 1);
            rightArm.rotation.z = 0.4 * (1 - k); // slight forward pose to neutral
            if (k >= 1) { rightArm.rotation.z = 0; throwState = 'idle'; }
          }
        }

        // Update nets
        for (let i = nets.length - 1; i >= 0; i--) {
          const n = nets[i];
          const tt = (clock.getElapsedTime() - n.start) / n.dur;
          if (tt >= 1) {
            scene.remove(n.mesh);
            nets.splice(i, 1);
            continue;
          }
          const arc = (tt * (1 - tt)) * 2.2; // parabolic arc factor
          n.mesh.position.addScaledVector(n.dir, 0.06); // advance
          n.mesh.position.y = 0.25 + arc; // height
          const s = 1 + tt * 2.2; // expand net radius
          n.mesh.scale.set(s, s, s);
          n.mesh.material.opacity = 0.85 * (1 - Math.max(0, (tt - 0.6) / 0.4));
        }

        renderer.render(scene, camera);
      };
      animate();
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

  // Hero hover accent position (green spotlight)
  const hero = document.querySelector('.hero.hero-light');
  if (hero) {
    const updatePos = (e) => {
      const r = hero.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * 100;
      const y = ((e.clientY - r.top) / r.height) * 100;
      hero.style.setProperty('--mx', x + '%');
      hero.style.setProperty('--my', y + '%');
    };
    hero.addEventListener('mousemove', updatePos);
  }

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

  // Removed Lot Explorer interactions per updated request
})();

