import { motion } from 'framer-motion';

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
          <div className="relative w-full h-[58vh] md:h-[62vh] overflow-hidden">
            <motion.img
              src="https://i.postimg.cc/5NN6rnqy/Chat-GPT-Image-28-de-out-de-2025-21-31-24.png"
              alt="Codexion visual"
              className="absolute top-1/2 -translate-y-1/2 will-change-transform select-none"
              loading="eager"
              initial={{ x: '-52vw', opacity: 0 }}
              animate={{ x: ['-52vw', '52vw', '52vw', '-52vw'], opacity: [0, 1, 1, 0] }}
              transition={{ duration: 36, ease: 'linear', times: [0, 0.1, 0.9, 1], repeat: Infinity, repeatDelay: 0.6 }}
              style={{ width: '56vw', maxWidth: '900px' }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
