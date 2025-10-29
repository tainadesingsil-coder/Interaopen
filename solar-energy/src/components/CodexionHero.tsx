import { motion, useScroll, useTransform } from 'framer-motion';

export default function CodexionHero() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['-10vh', '110vh']);

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
        </div>
      </div>
      {/* Walker overlay across the whole page */}
      <motion.img
        src="https://i.postimg.cc/5NN6rnqy/Chat-GPT-Image-28-de-out-de-2025-21-31-24.png"
        alt="Codexion visual"
        className="pointer-events-none fixed left-1/2 -translate-x-1/2 z-30 select-none opacity-95"
        style={{ y }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        width={520}
      />
    </section>
  );
}
