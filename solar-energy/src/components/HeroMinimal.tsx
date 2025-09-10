import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { MessageCircle } from 'lucide-react'

type HeroMinimalProps = {
  imageUrls?: string[];
  videoUrls?: string[];
};

export default function HeroMinimal({ imageUrls }: HeroMinimalProps) {
  const [bubble, setBubble] = useState(false)
  const backgroundImage = Array.isArray(imageUrls) && imageUrls.length > 0 ? imageUrls[0] : undefined

  return (
    <motion.section className="relative overflow-hidden" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}>
      {/* Neon line at top (slightly stronger) */}
      <div className="footer-neon-line absolute top-0 left-0 right-0" style={{ height: '3px' }} />
      {/* Minimal logo overlay */}
      <div className="absolute top-2 left-3 md:top-4 md:left-5 z-20">
        <img src="https://i.postimg.cc/9f3DM49L/LOGO-V-BRANCA-1-1.png" alt="Solar Energy" className="h-[36px] md:h-[64px] w-auto opacity-95" />
      </div>

      {/* Background: imagem única fornecida */}
      {backgroundImage && (
        <div className="absolute inset-0">
          <motion.img
            key={backgroundImage}
            src={backgroundImage}
            alt="Banner"
            className="absolute inset-0 w-full h-full object-cover object-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(6,12,20,0.40) 0%, rgba(6,12,20,0.40) 45%, rgba(6,12,20,0.60) 100%)",
            }}
          />
        </div>
      )}

      {/* Centered content lowered for contrast */}
      <div className="relative z-10 container mx-auto px-4">
        <div className="min-h-[64vh] md:min-h-[82vh] flex items-end justify-center text-center pb-12 md:pb-32 pt-4 md:pt-10">
          <div className="max-w-[28rem] md:max-w-3xl mx-auto px-2">
            {/* Center logo removed */}
            <motion.div
              className="inline-block rounded-lg bg-[rgba(8,20,35,0.46)] backdrop-blur-[3px] px-3 py-2 md:px-6 md:py-4 shadow-[0_10px_28px_rgba(0,0,0,0.30)] neon-soft neon-glow"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
            >
              <motion.h1
                className="text-[18px] sm:text-3xl md:text-4xl font-bold tracking-tight leading-snug text-white drop-shadow-[0_4px_18px_rgba(0,0,0,0.45)]"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: 'easeOut', delay: 0.05 }}
              >
                Mais que energia, é liberdade para investir no que importa.
              </motion.h1>
              <motion.a
                href="https://wa.me/5538999266004?text=Gostaria%20de%20saber%20mais%20sobre%20como%20obter%20meu%20desconto"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 md:mt-4 inline-flex items-center gap-1.5 md:gap-2 rounded-full px-3 py-1 md:px-4 md:py-2 text-[12px] md:text-base font-semibold border"
                style={{ color: '#EAC67A', borderColor: 'rgba(234,198,122,0.55)', background: 'rgba(234,198,122,0.12)' }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: 'easeOut', delay: 0.1 }}
              >
                <MessageCircle className="h-4 w-4" />
                Transforme sua conta de luz em uma escolha inteligente.
              </motion.a>
              {/* Botões removidos conforme solicitação */}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Mascot fixed at bottom-right (edge) */}
      <div className="fixed right-0 bottom-0 z-50 text-right mr-[-2px] mb-[-2px] hidden sm:block">
        <button onClick={()=>setBubble(v=>!v)} aria-label="Assistente" className="mascot-stand">
          <img src="https://i.postimg.cc/Y9KQgcw6/Design-sem-nome-2025-08-18-T120443-767.png" alt="Mascote" className="h-[140px] sm:h-[200px] md:h-[270px] w-auto"/>
        </button>
        <AnimatePresence>
          {bubble && (
            <motion.div initial={{opacity:0, y:6}} animate={{opacity:1, y:0}} exit={{opacity:0, y:6}} transition={{duration:0.2}} className="mascot-bubble right-0 left-auto">
              <div className="text-white/90">Olá! Posso te ajudar a simular sua economia.</div>
              <div className="mt-2">
                <a href="https://wa.me/5538999266004?text=Gostaria%20de%20saber%20mais%20sobre%20como%20obter%20meu%20desconto" target="_blank" rel="noopener noreferrer" className="inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold text-white bg-[var(--blue)] neon-pulse">Simular agora</a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}