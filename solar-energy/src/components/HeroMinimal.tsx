import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { InstagramLogo, FacebookLogo, LinkedinLogo } from '@phosphor-icons/react'

type HeroMinimalProps = {
  imageUrls: string[];
};

export default function HeroMinimal({ imageUrls }: HeroMinimalProps) {
  const [index, setIndex] = useState(0);

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
        <img src="https://i.postimg.cc/W40qnLhn/Design-sem-nome-2025-08-16-T014206-739.png" alt="Solar Energy" className="h-20 w-auto opacity-95" />
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

      {/* Centered content */}
      <div className="relative z-10 container mx-auto px-4">
        <div className="min-h-[80vh] md:min-h-[88vh] flex items-center justify-center text-center py-24 md:py-32">
          <div className="max-w-3xl">
            <h1 className="text-white tracking-tight text-4xl md:text-6xl font-extrabold leading-tight">
              Energia inteligente para um futuro sustentável
            </h1>
            <p className="mt-5 text-white/80 text-base md:text-lg font-light">
              Tecnologia limpa com eficiência real. Confiável, moderna e acessível.
            </p>
            <div className="mt-8">
              <a href="#cta" className="inline-flex items-center justify-center rounded-full px-8 py-3 text-sm md:text-base font-semibold text-white bg-[var(--blue)] shadow-lg hover:shadow-xl transition-transform hover:scale-[1.03]">
                Simule sua economia
              </a>
            </div>
          </div>
        </div>
        {/* Discrete social icons aligned to hero footer */}
        <div className="absolute inset-x-0 bottom-6 flex justify-center">
          <nav className="flex items-center gap-4 opacity-80 hover:opacity-100 transition">
            <a href="#" aria-label="Instagram" className="inline-flex"><InstagramLogo size={18} weight="thin" className="text-white"/></a>
            <a href="#" aria-label="Facebook" className="inline-flex"><FacebookLogo size={18} weight="thin" className="text-white"/></a>
            <a href="#" aria-label="LinkedIn" className="inline-flex"><LinkedinLogo size={18} weight="thin" className="text-white"/></a>
          </nav>
        </div>
      </div>
    </motion.section>
  );
}