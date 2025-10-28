import { motion } from 'framer-motion';
import { useRef, useState } from 'react';

export default function CodexionHero() {
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  return (
    <section id="inicio" className="relative overflow-hidden min-h-screen flex items-center justify-center">

      <div className="w-full mx-auto px-4 flex flex-col items-center text-center">
        <div
          ref={sceneRef}
          onMouseMove={(e) => {
            const el = sceneRef.current;
            if (!el) return;
            const r = el.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width - 0.5;
            const py = (e.clientY - r.top) / r.height - 0.5;
            setTilt({ rx: py * -6, ry: px * 8 });
          }}
          onMouseLeave={() => setTilt({ rx: 0, ry: 0 })}
          className="relative z-10 max-w-[1600px] [perspective:1000px]"
          style={{ transformStyle: 'preserve-3d' as any }}
        >
          {/* Base image (screen) */}
          <img
            src="https://i.postimg.cc/htrPzRLK/Codexion-63.png"
            alt="Codexion visual"
            className="mt-6 w-full max-w-[1400px] md:max-w-[1600px] h-auto mx-auto object-contain"
            loading="eager"
          />
          {/* Figure pop-out masked layer */}
          <motion.img
            src="https://i.postimg.cc/htrPzRLK/Codexion-63.png"
            alt="Figura saindo do notebook"
            className="pointer-events-none absolute inset-0 mx-auto w-full max-w-[1400px] md:max-w-[1600px] object-contain"
            style={{
              transformStyle: 'preserve-3d',
              transform: `translateZ(60px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)` as any,
              WebkitMaskImage:
                'radial-gradient(ellipse at 50% 35%, rgba(255,255,255,1) 24%, rgba(255,255,255,0.9) 32%, rgba(255,255,255,0) 50%)',
              maskImage:
                'radial-gradient(ellipse at 50% 35%, rgba(255,255,255,1) 24%, rgba(255,255,255,0.9) 32%, rgba(255,255,255,0) 50%)',
              filter: 'drop-shadow(0 18px 60px rgba(255,255,255,0.08))',
            }}
            initial={{ y: 16, opacity: 0.9, scale: 1 }}
            animate={{ y: [-2, 2, -2], opacity: 1, scale: [1.01, 1.03, 1.01] }}
            transition={{ duration: 6, ease: 'easeInOut', repeat: Infinity }}
          />
          <button
            type="button"
            className="mt-6 mx-auto inline-flex items-center justify-center rounded-full bg-white text-black px-7 py-3 text-sm font-semibold hover:scale-[1.02] transition"
          >
            A mudança começa agora!
          </button>
        </div>
      </div>
    </section>
  );
}
