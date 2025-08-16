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
    }, 4500);
    return () => clearInterval(id);
  }, [imageUrls]);

  const current = imageUrls?.[index] ?? imageUrls?.[0];

  return (
    <section className="relative overflow-hidden">
      <div className="absolute top-5 left-5 z-10">
        <img src="/logo.svg" alt="Solar Energy" className="h-6 w-auto opacity-90" />
      </div>

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center pt-32 md:pt-44 pb-16 md:pb-24">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="order-1"
          >
            <h1 className="text-white text-4xl md:text-6xl font-extrabold leading-tight">
              20% de desconto na sua conta de luz
            </h1>
            <p className="mt-6 md:mt-7 text-white/70 text-base md:text-lg max-w-xl">
              Pague o mínimo da Cemig e economize na fatura.
            </p>

            <div className="mt-8">
              <a
                href="#cta"
                className="btn-yellow"
              >
                Garanta seu desconto agora
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative order-2 md:order-2"
          >
            <div className="relative overflow-hidden shadow-2xl">
              <div className="relative w-full aspect-video">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={current}
                    className="absolute inset-0"
                    initial={{ clipPath: "inset(0% 100% 0% 0%)" }}
                    animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
                    exit={{ clipPath: "inset(0% 0% 0% 100%)" }}
                    transition={{ duration: 0.9, ease: "easeOut" }}
                    style={{ transformPerspective: 800 }}
                    whileHover={{ scale: 1.015, rotate: 0.2 }}
                  >
                    <motion.img
                      src={current}
                      alt="Usina solar"
                      className="absolute inset-0 w-full h-full object-cover"
                      initial={{ opacity: 0, scale: 1.08, x: -12, y: 6, filter: "blur(2px)" as any }}
                      animate={{ opacity: 1, scale: 1.02, x: 0, y: 0, filter: "blur(0px)" as any }}
                      exit={{ opacity: 0, scale: 1.02, x: 8, y: -4 }}
                      transition={{ duration: 4.0, ease: "easeOut" }}
                      style={{ transform: "translateZ(0)" }}
                    />
                    <motion.div
                      className="pointer-events-none absolute inset-0"
                      initial={{ x: "-30%", opacity: 0.0 }}
                      animate={{ x: "130%", opacity: 0.18 }}
                      transition={{ duration: 3.6, ease: "easeInOut" }}
                      style={{ background: "linear-gradient(120deg, transparent 35%, rgba(255,255,255,0.5) 50%, transparent 65%)" }}
                    />
                  </motion.div>
                </AnimatePresence>
                <div className="absolute top-2 left-2 bg-black/25 text-white text-[10px] px-1.5 py-0.5 rounded-md backdrop-blur-sm">
                  20% garantido todo mês
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}