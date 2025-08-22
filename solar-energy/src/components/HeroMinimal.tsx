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
              "linear-gradient(180deg, rgba(6,12,20,0.60) 0%, rgba(10,160,255,0.10) 45%, rgba(6,12,20,0.80) 100%)",
          }}
        />
        {/* Minimal overlay (no rays) */}
        <div className="absolute inset-0 pointer-events-none" />
      </div>

      {/* Centered content lowered for contrast */}
      <div className="relative z-10 container mx-auto px-4">
        <div className="min-h-[70vh] md:min-h-[82vh] flex items-end justify-center text-center pb-14 md:pb-20 pt-8 md:pt-14">
          <div>
            <motion.div
              className="inline-block rounded-xl bg-[rgba(8,20,35,0.35)] backdrop-blur-[2px] px-4 py-3 md:px-7 md:py-5 shadow-[0_12px_32px_rgba(0,0,0,0.25)]"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <motion.h1
                className="text-3xl md:text-5xl font-extrabold leading-tight text-white drop-shadow-[0_6px_28px_rgba(0,0,0,0.5)]"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut', delay: 0.05 }}
              >
                Não é sobre energia,<br className="hidden sm:block" /> é sobre liberdade financeira.
              </motion.h1>
              <motion.p
                className="mt-2 md:mt-3 text-sm md:text-lg text-slate-200"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
              >
                Transforme sua conta de luz em investimento inteligente.
              </motion.p>
              <motion.div
                className="mt-5 md:mt-6 flex items-center justify-center gap-3 md:gap-4"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut', delay: 0.15 }}
              >
                <a href="#cta" className="btn-yellow btn-pulse">Solicite orçamento</a>
                <a href="#beneficios" className="btn-outline-white">Saiba mais</a>
              </motion.div>
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