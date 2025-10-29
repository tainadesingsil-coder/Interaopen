import { motion } from 'framer-motion';

export default function CodexionHero() {

  return (
    <section id="inicio" className="relative overflow-hidden min-h-screen flex items-center justify-center">

      <div className="w-full mx-auto px-4 flex flex-col items-center text-center">
        <div className="relative z-10 max-w-[1600px]">
          <img
            src="https://i.postimg.cc/mgLJCFsN/Codexion-74.png"
            alt="Logo Codexion"
            className="w-[180px] md:w-[240px] h-auto mx-auto object-contain mb-4 md:mb-6"
            loading="eager"
          />
          <motion.img
            src="https://i.postimg.cc/5NN6rnqy/Chat-GPT-Image-28-de-out-de-2025-21-31-24.png"
            alt="Codexion visual"
            className="mt-4 w-full max-w-[1200px] md:max-w-[1400px] h-auto mx-auto object-contain will-change-transform"
            loading="eager"
            initial={{ opacity: 0.98, scale: 1 }}
            animate={{ scale: [1, 1.02, 1.04, 1.02, 1] }}
            transition={{ duration: 24, ease: 'easeInOut', repeat: Infinity }}
          />
        </div>
      </div>
    </section>
  );
}
