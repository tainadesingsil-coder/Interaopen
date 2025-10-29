import { motion } from 'framer-motion';

export default function CodexionHero() {

  return (
    <section id="inicio" className="relative overflow-hidden min-h-screen flex items-center justify-center">

      <div className="w-full mx-auto px-4 flex flex-col items-center text-center">
        <div className="relative z-10 max-w-[1600px]">
          <motion.img
            src="https://i.postimg.cc/5NN6rnqy/Chat-GPT-Image-28-de-out-de-2025-21-31-24.png"
            alt="Codexion visual"
            className="mt-6 w-full max-w-[1400px] md:max-w-[1600px] h-auto mx-auto object-contain will-change-transform"
            loading="eager"
            initial={{ x: -12, y: 0, opacity: 1 }}
            animate={{ x: [ -24, 24, -24 ], y: [0, -8, 0] }}
            transition={{ duration: 22, ease: 'easeInOut', repeat: Infinity }}
          />
        </div>
      </div>
    </section>
  );
}
