import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useMemo } from "react";

type HeroMinimalProps = {
  imageUrls?: string[];
  videoUrls?: string[];
};

export default function HeroMinimal({ imageUrls, videoUrls }: HeroMinimalProps) {
  const [index, setIndex] = useState(0);
  const [bubble, setBubble] = useState(false)

  const slides = useMemo(()=>{
    const videos = Array.isArray(videoUrls) ? videoUrls.filter(u=>typeof u === 'string' && /\.(mp4|webm|ogg)$/i.test(u)) : []
    return { videos, images: Array.isArray(imageUrls) ? imageUrls : [] }
  },[imageUrls, videoUrls])

  useEffect(() => {
    const total = slides.videos.length ? slides.videos.length : slides.images.length
    if (total <= 1) return;
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % total);
    }, 8000);
    return () => clearInterval(id);
  }, [slides]);

  const currentVideo = slides.videos?.[index]
  const currentImage = slides.images?.[index] ?? slides.images?.[0]

  // pre-build particle configuration (deterministic)
  const particles = useMemo(() => Array.from({ length: 24 }, (_, i) => ({
    key: `p-${i}`,
    left: `${(i * 37) % 100}%`,
    size: 2 + ((i * 7) % 5),
    delay: (i * 0.35) % 6,
    duration: 6 + ((i * 3) % 5),
  })), [])

  return (
    <motion.section className="relative overflow-hidden" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}>
      {/* Minimal logo overlay */}
      <div className="absolute top-5 left-5 z-20">
        <img src="https://i.postimg.cc/W40qnLhn/Design-sem-nome-2025-08-16-T014206-739.png" alt="Solar Energy" className="h-16 md:h-20 w-auto opacity-95" />
      </div>

      {/* Background: videos with crossfade, fallback to images */}
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          {slides.videos.length > 0 ? (
            <motion.video
              key={currentVideo}
              src={currentVideo}
              className="absolute inset-0 w-full h-full object-cover object-center"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
            />
          ) : (
            <motion.img
              key={currentImage}
              src={currentImage}
              alt="Cenário de energia solar"
              className="absolute inset-0 w-full h-full object-cover object-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
            />
          )}
        </AnimatePresence>
        {/* Cinematic gradient */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(6,12,20,0.78) 0%, rgba(10,160,255,0.18) 45%, rgba(6,12,20,0.88) 100%)",
          }}
        />
        {/* Golden energy particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {particles.map((p)=> (
            <span
              key={p.key}
              className="absolute rounded-full"
              style={{
                left: p.left,
                bottom: '-10%',
                width: p.size,
                height: p.size,
                background: 'radial-gradient(circle, rgba(255,215,128,0.95) 0%, rgba(255,180,64,0.75) 60%, rgba(255,180,64,0) 70%)',
                boxShadow: '0 0 14px rgba(255,200,80,0.85), 0 0 28px rgba(255,180,64,0.55)',
                filter: 'blur(0.2px)',
                animation: `floatUp ${p.duration}s linear ${p.delay}s infinite, shimmer 4s ease-in-out ${p.delay}s infinite`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Centered content */}
      <div className="relative z-10 container mx-auto px-4">
        <div className="min-h-[70vh] md:min-h-[82vh] flex items-center justify-center text-center py-16 md:py-32">
          <div>
            <motion.h1
              className="text-3xl md:text-5xl font-extrabold leading-tight text-white drop-shadow-[0_8px_40px_rgba(0,0,0,0.55)]"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
            >
              Não é sobre energia,<br className="hidden sm:block" /> é sobre liberdade financeira.
            </motion.h1>
            <motion.p
              className="mt-3 md:mt-4 text-sm md:text-lg text-slate-300"
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut', delay: 0.1 }}
            >
              Transforme sua conta de luz em investimento inteligente.
            </motion.p>
            <motion.div
              className="mt-6 md:mt-8 flex items-center justify-center gap-3 md:gap-4"
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut', delay: 0.2 }}
            >
              <a href="#cta" className="btn-yellow btn-pulse">Solicite orçamento</a>
              <a href="#beneficios" className="btn-outline-white">Saiba mais</a>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Mascot fixed at bottom-right (edge) */}
      <div className="fixed right-0 bottom-0 z-50 text-right mr-[-2px] mb-[-2px]">
        <button onClick={()=>setBubble(v=>!v)} aria-label="Assistente" className="mascot-stand">
          <img src="https://i.postimg.cc/Y9KQgcw6/Design-sem-nome-2025-08-18-T120443-767.png" alt="Mascote" className="h-[140px] sm:h-[200px] md:h-[270px] w-auto"/>
        </button>
        <AnimatePresence>
          {bubble && (
            <motion.div initial={{opacity:0, y:6}} animate={{opacity:1, y:0}} exit={{opacity:0, y:6}} transition={{duration:0.2}} className="mascot-bubble right-0 left-auto">
              <div className="text-white/90">Olá! Posso te ajudar a simular sua economia.</div>
              <div className="mt-2">
                <a href="#cta" className="inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold text-white bg-[var(--blue)] neon-pulse">Simular agora</a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}