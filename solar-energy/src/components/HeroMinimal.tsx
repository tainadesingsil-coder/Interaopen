import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

type HeroMinimalProps = {
  imageUrls: string[];
};

export default function HeroMinimal({ imageUrls }: HeroMinimalProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!imageUrls || imageUrls.length <= 1) return;
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % imageUrls.length);
    }, 2800);
  return () => clearInterval(id);
  }, [imageUrls]);

  const current = imageUrls?.[index] ?? imageUrls?.[0];

  return (
    <motion.section className="relative overflow-hidden" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}>
      {/* Background slideshow */}
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          <motion.img
            key={current}
            src={current}
            alt="Usina solar"
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1.02 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </AnimatePresence>
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(11,31,58,0.85) 0%, rgba(7,23,44,0.55) 45%, rgba(8,20,35,0.88) 100%)",
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4">
        <div className="min-h-[72vh] flex items-center justify-center text-center py-24 md:py-32">
          <div className="max-w-2xl">
            <h1 className="text-white text-4xl md:text-6xl font-extrabold leading-tight">
              20% de desconto na sua conta de luz
            </h1>
            <p className="mt-5 text-white/80 text-base md:text-lg">
              Pague o mínimo da Cemig e economize na fatura.
            </p>
            <div className="mt-8">
              <a href="#cta" className="btn-yellow">Garanta seu desconto agora</a>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}