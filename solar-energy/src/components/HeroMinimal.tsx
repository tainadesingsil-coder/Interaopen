import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

type HeroMinimalProps = {
  imageUrls: string[];
};

export default function HeroMinimal({ imageUrls }: HeroMinimalProps) {
  const [index, setIndex] = useState(0);
  const [bubble, setBubble] = useState(false)

  useEffect(() => {
    if (!imageUrls || imageUrls.length <= 1) return;
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % imageUrls.length);
    }, 6000);
    return () => clearInterval(id);
  }, [imageUrls]);

  const current = imageUrls?.[index] ?? imageUrls?.[0];

  return (
    <motion.section className="relative overflow-hidden" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}>
      {/* Minimal logo overlay */}
      <div className="absolute top-5 left-5 z-20">
        <img src="https://i.postimg.cc/W40qnLhn/Design-sem-nome-2025-08-16-T014206-739.png" alt="Solar Energy" className="h-16 md:h-20 w-auto opacity-95" />
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

      {/* Background slideshow */}
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          <motion.img
            key={current}
            src={current}
            alt="Painéis solares modernos"
            className="absolute inset-0 w-full h-full object-cover object-center"
            initial={{ opacity: 0, scale: 1.0 }}
            animate={{ opacity: 1, scale: 1.0 }}
            exit={{ opacity: 0, scale: 1.0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          />
        </AnimatePresence>
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(11,31,58,0.82) 0%, rgba(10,160,255,0.18) 45%, rgba(8,20,35,0.88) 100%)",
          }}
        />
      </div>

      {/* Centered content: no button/text */}
      <div className="relative z-10 container mx-auto px-4">
        <div className="min-h-[60vh] md:min-h-[70vh] flex items-center justify-center text-center py-16 md:py-28" />
        {/* Social icons removed as solicitado */}
      </div>
    </motion.section>
  );
}