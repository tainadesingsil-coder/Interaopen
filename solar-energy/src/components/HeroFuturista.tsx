import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import gsap from 'gsap'

export default function HeroFuturista(){
  const mountRef = useRef<HTMLDivElement|null>(null)

  useEffect(()=>{
    if(!mountRef.current) return

    const GOLD = 0xEAC67A
    const CYAN = 0x00C6FF
    const BG = 0x0A0A0A

    const container = mountRef.current

    const renderer = new THREE.WebGLRenderer({ antialias:true, alpha:false })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2))
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setClearColor(BG, 1)
    container.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(55, container.clientWidth/container.clientHeight, 0.1, 1000)
    camera.position.set(0, 8.5, 18)
    camera.lookAt(0,0,0)

    const hemi = new THREE.HemisphereLight(0xffffff, 0x202020, 0.6)
    scene.add(hemi)
    const dir = new THREE.DirectionalLight(0xffffff, 0.8)
    dir.position.set(5,10,5)
    scene.add(dir)

    // Partículas de fundo
    const P_COUNT = 600
    const positions = new Float32Array(P_COUNT*3)
    for(let i=0;i<P_COUNT;i++){
      positions[i*3+0] = (Math.random()-0.5)*80
      positions[i*3+1] = (Math.random()-0.5)*40 + 8
      positions[i*3+2] = (Math.random()-0.5)*80
    }
    const particlesGeo = new THREE.BufferGeometry()
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions,3))
    const particlesMat = new THREE.PointsMaterial({ color:0x88AACC, size:0.03, sizeAttenuation:true, transparent:true, opacity:0.8, depthWrite:false, blending:THREE.AdditiveBlending })
    const particles = new THREE.Points(particlesGeo, particlesMat)
    scene.add(particles)

    // Shaders beam
    const beamVertex = `
      varying vec2 vUv0;
      void main(){ vUv0=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }
    `
    const beamFragment = `
      precision highp float; varying vec2 vUv0; uniform float uTime; uniform float uOpacity;
      vec3 mixGoldCyan(float t){ vec3 a=vec3(234.0/255.0,198.0/255.0,122.0/255.0); vec3 b=vec3(0.0,198.0/255.0,1.0); return mix(a,b,smoothstep(0.0,1.0,t)); }
      void main(){ float r=distance(vUv0.x,0.5); float radial=smoothstep(0.8,0.2,r); float flick=0.85+0.15*sin(uTime*6.0+vUv0.y*8.0); vec3 col=mixGoldCyan(vUv0.y);
        float alpha=radial*flick*uOpacity; alpha*=smoothstep(0.0,0.05,vUv0.y)*smoothstep(1.0,0.95,vUv0.y); gl_FragColor=vec4(col,alpha); }
    `
    const makeBeam=(from:THREE.Vector3,to:THREE.Vector3)=>{
      const h=from.distanceTo(to)
      const geom=new THREE.CylinderGeometry(0.06,0.12,h,16,1,true)
      const mat=new THREE.ShaderMaterial({ vertexShader:beamVertex, fragmentShader:beamFragment, transparent:true, depthWrite:false, blending:THREE.AdditiveBlending, uniforms:{ uTime:{value:0}, uOpacity:{value:0} } })
      const mesh=new THREE.Mesh(geom,mat)
      mesh.position.copy(from).lerp(to,0.5)
      mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), new THREE.Vector3().subVectors(to,from).normalize())
      return mesh as THREE.Mesh & { material: THREE.ShaderMaterial }
    }

    const glowTex = new THREE.TextureLoader().load('https://unpkg.com/three@0.160.0/examples/textures/sprites/glow.png')
    const makeSun=(size=0.6)=>{
      const g=new THREE.Group()
      const sphere=new THREE.Mesh(new THREE.SphereGeometry(size,32,32), new THREE.MeshBasicMaterial({ color:CYAN, transparent:true, opacity:0, blending:THREE.AdditiveBlending, depthWrite:false }))
      const halo=new THREE.Sprite(new THREE.SpriteMaterial({ map:glowTex, color:GOLD, transparent:true, opacity:0, depthWrite:false, blending:THREE.AdditiveBlending }))
      halo.scale.set(size*4,size*4,1)
      g.add(sphere); g.add(halo)
      ;(g as any).sphere=sphere; (g as any).halo=halo
      return g as THREE.Group & { sphere: THREE.Mesh, halo: THREE.Sprite }
    }

    // Grid painéis
    const grid=new THREE.Group(); scene.add(grid)
    const COLS=10, ROWS=6, SPACING=1.2
    const panelGeo=new THREE.PlaneGeometry(1,1,1,1); panelGeo.rotateX(-Math.PI/2)
    const baseMat=new THREE.MeshStandardMaterial({ color:0x0C1118, metalness:0.2, roughness:0.65, emissive:0x000000, emissiveIntensity:0 })
    const panels: (THREE.Mesh & { userData:any })[]=[]
    for(let r=0;r<ROWS;r++){
      for(let c=0;c<COLS;c++){
        const m=baseMat.clone()
        const p=new THREE.Mesh(panelGeo,m) as THREE.Mesh & { userData:any }
        p.position.set((c-(COLS-1)/2)*SPACING, 0, (r-(ROWS-1)/2)*SPACING)
        p.rotation.y=(c-COLS/2)*0.03
        p.userData={ active:false, beam:null as any, sun:null as any }
        grid.add(p); panels.push(p)
      }
    }
    grid.rotation.x=-0.16; grid.position.y=-0.3

    // Sol central
    const central=makeSun(1.4); central.position.set(0,3.8,0); scene.add(central)

    // Raycaster
    const raycaster=new THREE.Raycaster(); const mouse=new THREE.Vector2(); let last:THREE.Object3D|null=null
    const activeSet=new Set<THREE.Object3D>()

    const onPointerMove=(e:MouseEvent|TouchEvent)=>{
      const rect=renderer.domElement.getBoundingClientRect()
      const cx=(e as MouseEvent).clientX ?? (e as TouchEvent).touches?.[0]?.clientX ?? 0
      const cy=(e as MouseEvent).clientY ?? (e as TouchEvent).touches?.[0]?.clientY ?? 0
      mouse.x=((cx-rect.left)/rect.width)*2-1
      mouse.y=-((cy-rect.top)/rect.height)*2+1
    }
    window.addEventListener('mousemove', onPointerMove, { passive:true })
    window.addEventListener('touchmove', onPointerMove, { passive:true })

    const activate=(panel:any)=>{
      if(panel.userData.active) return; panel.userData.active=true
      gsap.to(panel.material, { duration:0.35, emissiveIntensity:1.0, ease:'power2.out', onStart:()=>{ panel.material.emissive=new THREE.Color(CYAN) } })
      const from=panel.position.clone().add(new THREE.Vector3(0,0.02,0))
      const to=panel.position.clone().add(new THREE.Vector3(0,1.2+Math.random()*0.4,0))
      const beam=makeBeam(from,to); scene.add(beam)
      const sun=makeSun(0.45+Math.random()*0.15); sun.position.copy(to); scene.add(sun)
      gsap.to(beam.material.uniforms.uOpacity, { value:1, duration:0.4, ease:'power2.out' })
      gsap.to((sun as any).sphere.material, { opacity:0.9, duration:0.45, ease:'power2.out' })
      gsap.to((sun as any).halo.material, { opacity:0.8, duration:0.45, ease:'power2.out' })
      gsap.fromTo(sun.scale, { x:0.6,y:0.6,z:0.6 }, { x:1,y:1,z:1, duration:0.6, ease:'power2.out' })
      panel.userData.beam=beam; panel.userData.sun=sun; activeSet.add(panel)
      updateCentral()
    }

    const deactivate=(panel:any)=>{
      if(!panel.userData.active) return; panel.userData.active=false
      gsap.to(panel.material, { duration:0.45, emissiveIntensity:0.0, ease:'power2.inOut', onComplete:()=>{ panel.material.emissive=new THREE.Color(0x000000) } })
      const { beam, sun } = panel.userData
      if(beam){ gsap.to(beam.material.uniforms.uOpacity, { value:0, duration:0.35, ease:'power2.inOut', onComplete:()=>{ scene.remove(beam); beam.geometry.dispose() } }) }
      if(sun){
        gsap.to((sun as any).sphere.material, { opacity:0, duration:0.35, ease:'power2.inOut' })
        gsap.to((sun as any).halo.material, { opacity:0, duration:0.35, ease:'power2.inOut', onComplete:()=>{ scene.remove(sun) } })
      }
      panel.userData.beam=null; panel.userData.sun=null; activeSet.delete(panel)
      updateCentral()
    }

    const updateCentral=()=>{
      const count=activeSet.size
      const targetScale=Math.min(1.0+count*0.06, 1.6)
      const targetOpacity=Math.min(0.15+count*0.05, 0.8)
      const sphere=(central as any).sphere, halo=(central as any).halo
      gsap.to(sphere.material, { opacity:targetOpacity, duration:0.5, ease:'power2.out' })
      gsap.to(halo.material, { opacity:Math.min(targetOpacity+0.15,0.95), duration:0.5, ease:'power2.out' })
      gsap.to(central.scale, { x:targetScale, y:targetScale, z:targetScale, duration:0.6, ease:'power2.out' })
    }

    const clock=new THREE.Clock()
    const animate=()=>{
      const t=clock.getElapsedTime()
      requestAnimationFrame(animate)
      // drift de partículas
      const arr=particles.geometry.attributes.position.array as Float32Array
      for(let i=0;i<P_COUNT;i++){ const idx=i*3+1; arr[idx]+=Math.sin(t*0.2+i*0.13)*0.0015 }
      particles.geometry.attributes.position.needsUpdate=true
      particles.rotation.y=Math.sin(t*0.05)*0.05
      // shimmer beams & giro dos sóis
      panels.forEach(p=>{ if(p.userData.beam){ p.userData.beam.material.uniforms.uTime.value=t } if(p.userData.sun){ p.userData.sun.rotation.y+=0.005 } })
      central.rotation.y+=0.003
      renderer.render(scene,camera)
      // hover
      raycaster.setFromCamera(mouse,camera)
      const hits=raycaster.intersectObjects(panels,false)
      const hit=hits?.[0]?.object || null
      if(hit!==last){ if(last) deactivate(last); if(hit) activate(hit); last=hit }
    }
    animate()

    const onResize=()=>{
      const w=container.clientWidth, h=container.clientHeight
      camera.aspect=w/h; camera.updateProjectionMatrix(); renderer.setSize(w,h)
    }
    const ro=new ResizeObserver(onResize); ro.observe(container)
    window.addEventListener('resize', onResize)

    return ()=>{
      ro.disconnect()
      window.removeEventListener('resize', onResize)
      window.removeEventListener('mousemove', onPointerMove as any)
      window.removeEventListener('touchmove', onPointerMove as any)
      renderer.dispose()
      container.removeChild(renderer.domElement)
    }
  },[])

  return (
    <section className="relative w-full h-screen overflow-hidden">
      <div ref={mountRef} className="absolute inset-0" />
      <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
        <div className="text-center px-4">
          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">Não é sobre energia, é sobre liberdade financeira.</h1>
          <p className="mt-3 md:mt-4 text-sm md:text-lg text-slate-300">Transforme sua conta de luz em investimento inteligente.</p>
          <div className="mt-6 md:mt-8 flex items-center justify-center gap-3 md:gap-4">
            <a href="#cta" className="btn-yellow btn-pulse">Solicite orçamento</a>
            <a href="#beneficios" className="btn-outline-white">Saiba mais</a>
          </div>
        </div>
      </div>
    </section>
  )
}