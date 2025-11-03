import { motion } from 'framer-motion';
import { ShoppingCart, Banknote } from 'lucide-react';

export default function CodexionHero() {

  return (
    <section id="inicio" className="relative overflow-hidden min-h-screen flex items-center justify-center">

      <div className="w-full mx-auto px-4 flex flex-col items-center text-center">
        <div className="relative z-10 max-w-[1600px] w-full">
          <img
            src="https://i.postimg.cc/mgLJCFsN/Codexion-74.png"
            alt="Logo Codexion"
            className="w-[180px] md:w-[240px] h-auto mx-auto object-contain mb-4 md:mb-6"
            loading="eager"
          />
          <div className="relative w-full h-[90vh] md:h-[92vh] overflow-hidden">
            <motion.div
              className="absolute top-[26%] md:top-[24%] left-1/2 -translate-x-1/2 -translate-y-1/2 will-change-transform select-none"
              initial={{ x: '-60vw', opacity: 1 }}
              animate={{ x: 0 }}
              transition={{ duration: 24, ease: 'easeOut' }}
              style={{ width: 'fit-content' }}
            >
              <div className="relative">
                <img
                  src="https://i.postimg.cc/5NN6rnqy/Chat-GPT-Image-28-de-out-de-2025-21-31-24.png"
                  alt="Codexion visual"
                  className="h-[56vh] md:h-[70vh] w-auto object-contain"
                  loading="eager"
                />
                {/* Carrinho de dinheiro à frente */}
                <motion.div
                  className="absolute bottom-[10%] left-[66%] -translate-x-1/2 flex items-center justify-center rounded-xl border border-white/15 bg-white/10 backdrop-blur px-3 py-2"
                  initial={{ y: 0 }}
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 3.2, ease: 'easeInOut', repeat: Infinity }}
                >
                  <ShoppingCart className="h-5 w-5 text-softWhite" />
                  <Banknote className="h-5 w-5 text-softWhite ml-1" />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
