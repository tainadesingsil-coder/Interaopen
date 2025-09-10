import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { MessageCircle, Instagram } from 'lucide-react'

type HeroMinimalProps = {
  imageUrls?: string[];
  videoUrls?: string[];
};

export default function HeroMinimal({ imageUrls }: HeroMinimalProps) {
  const [bubble, setBubble] = useState(false)
  const backgroundImage = Array.isArray(imageUrls) && imageUrls.length > 0 ? imageUrls[0] : undefined

  return (
    <motion.section className="relative overflow-hidden min-h-[70vh] md:min-h-[82vh]" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}>

      {/* Background: imagem única fornecida */}
      {backgroundImage && (
        <div className="absolute inset-0">
          <motion.img
            key={backgroundImage}
            src={backgroundImage}
            alt="Banner"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: '50% 18%' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      )}

      {/* Ícones minimalistas abaixo do topo da imagem */}
      <div className="absolute inset-x-0 top-56 md:top-44 z-20 flex items-center justify-center gap-3 md:gap-4">
        <a
          href="https://wa.me/5538999266004?text=Gostaria%20de%20saber%20mais%20sobre%20como%20obter%20meu%20desconto"
          className="social w-[28px] h-[28px] opacity-85 hover:opacity-100 transition"
          aria-label="WhatsApp"
          onClick={(e)=>{ e.preventDefault(); window.location.href='https://wa.me/5538999266004?text=Gostaria%20de%20saber%20mais%20sobre%20como%20obter%20meu%20desconto' }}
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          <MessageCircle className="h-4 w-4" />
        </a>
        <a
          href="https://www.instagram.com/solarenergymoc/"
          className="social w-[28px] h-[28px] opacity-85 hover:opacity-100 transition"
          aria-label="Instagram"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Instagram className="h-4 w-4" />
        </a>
      </div>

      {/* Apenas imagem no banner */}

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
                <a href="https://wa.me/5538999266004?text=Gostaria%20de%20saber%20mais%20sobre%20como%20obter%20meu%20desconto" target="_blank" rel="noopener noreferrer" className="inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold text-white bg-[var(--blue)] neon-pulse">Simular agora</a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}