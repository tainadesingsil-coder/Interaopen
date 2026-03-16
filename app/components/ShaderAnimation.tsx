'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    THREE?: any;
  }
}

interface SceneState {
  camera: any;
  scene: any;
  renderer: any;
  uniforms: any;
  animationId: number | null;
}

const THREE_SCRIPT_URL =
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/89/three.min.js';

export function ShaderAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cleanupResizeRef = useRef<(() => void) | null>(null);
  const sceneRef = useRef<SceneState>({
    camera: null,
    scene: null,
    renderer: null,
    uniforms: null,
    animationId: null,
  });

  useEffect(() => {
    let mounted = true;
    let createdScript = false;
    let scriptElement: HTMLScriptElement | null = null;

    const init = () => {
      if (!mounted || !containerRef.current || !window.THREE) {
        return;
      }
      initThreeJS();
    };

    if (window.THREE) {
      init();
    } else {
      scriptElement = document.querySelector<HTMLScriptElement>(
        'script[data-enigma-threejs="v89"]'
      );

      if (!scriptElement) {
        createdScript = true;
        scriptElement = document.createElement('script');
        scriptElement.src = THREE_SCRIPT_URL;
        scriptElement.async = true;
        scriptElement.dataset.enigmaThreejs = 'v89';
        document.head.appendChild(scriptElement);
      }

      scriptElement.addEventListener('load', init);
    }

    return () => {
      mounted = false;

      if (sceneRef.current.animationId) {
        cancelAnimationFrame(sceneRef.current.animationId);
      }

      if (cleanupResizeRef.current) {
        cleanupResizeRef.current();
      }

      if (sceneRef.current.renderer) {
        sceneRef.current.renderer.dispose();
      }

      if (scriptElement) {
        scriptElement.removeEventListener('load', init);
      }

      if (createdScript && scriptElement?.parentNode) {
        scriptElement.parentNode.removeChild(scriptElement);
      }
    };
  }, []);

  const initThreeJS = () => {
    if (!containerRef.current || !window.THREE) {
      return;
    }

    const THREE = window.THREE;
    const container = containerRef.current;

    container.innerHTML = '';

    const camera = new THREE.Camera();
    camera.position.z = 1;

    const scene = new THREE.Scene();
    const geometry = new THREE.PlaneBufferGeometry(2, 2);

    const uniforms = {
      time: { type: 'f', value: 1.0 },
      resolution: { type: 'v2', value: new THREE.Vector2() },
    };

    const vertexShader = `
      void main() {
        gl_Position = vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      #define TWO_PI 6.2831853072
      #define PI 3.14159265359

      precision highp float;
      uniform vec2 resolution;
      uniform float time;

      float random(in float x) {
        return fract(sin(x) * 1e4);
      }

      float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
      }

      void main(void) {
        vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);

        vec2 mosaicScale = vec2(4.0, 2.0);
        vec2 screenSize = vec2(256.0, 256.0);
        uv.x = floor(uv.x * screenSize.x / mosaicScale.x) / (screenSize.x / mosaicScale.x);
        uv.y = floor(uv.y * screenSize.y / mosaicScale.y) / (screenSize.y / mosaicScale.y);

        float t = time * 0.06 + random(uv.x) * 0.4;
        float lineWidth = 0.0008;

        vec3 color = vec3(0.0);
        for (int j = 0; j < 3; j++) {
          for (int i = 0; i < 5; i++) {
            color[j] += lineWidth * float(i * i) /
              abs(fract(t - 0.01 * float(j) + float(i) * 0.01) - length(uv));
          }
        }

        gl_FragColor = vec4(color[2], color[1], color[0], 1.0);
      }
    `;

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    sceneRef.current = {
      camera,
      scene,
      renderer,
      uniforms,
      animationId: null,
    };

    const onWindowResize = () => {
      const rect = container.getBoundingClientRect();
      renderer.setSize(rect.width, rect.height);
      uniforms.resolution.value.x = renderer.domElement.width;
      uniforms.resolution.value.y = renderer.domElement.height;
    };

    onWindowResize();
    window.addEventListener('resize', onWindowResize, false);
    cleanupResizeRef.current = () => {
      window.removeEventListener('resize', onWindowResize, false);
    };

    const animate = () => {
      sceneRef.current.animationId = requestAnimationFrame(animate);
      uniforms.time.value += 0.05;
      renderer.render(scene, camera);
    };

    animate();
  };

  return <div ref={containerRef} className='shader-canvas-layer' />;
}
