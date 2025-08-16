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
    <section
      className="relative overflow-hidden"
      style={{ background: "linear-gradient(180deg, #0E3A6F 0%, #001B36 100%)" }}
    >
      <div className="absolute top-5 left-5 z-10">
        <img src="/logo.svg" alt="Solar Energy" className="h-6 w-auto opacity-90" />
      </div>

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center py-16 md:py-24">
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
            <p className="mt-4 text-white/70 text-base md:text-lg max-w-xl">
              Pague o mínimo da Cemig e economize na fatura.
            </p>

            <div className="mt-8">
              <a
                href="#cta"
                className="inline-flex items-center rounded-full px-6 py-3 text-sm font-semibold transition transform bg-[#FFC107] text-[#0E3A6F] shadow-lg hover:scale-105 hover:shadow-2xl"
              >
                Garanta seu desconto agora!
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
            <div
              className="pointer-events-none absolute -inset-6 rounded-3xl"
              style={{
                background:
                  "radial-gradient(closest-side, rgba(0,183,255,0.25), transparent 70%)",
              }}
            />
            <div className="relative rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
              <div className="relative w-full h-full">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={current}
                    src={current}
                    alt="Usina solar"
                    className="block w-full h-auto object-cover"
                    initial={{ opacity: 0, scale: 1.04 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0.0, scale: 1.02 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    style={{ transform: "translateZ(0)" }}
                  />
                </AnimatePresence>
                {/* Badge discreto opcional */}
                <div className="absolute top-3 left-3 bg-black/40 text-white text-xs px-2 py-1 rounded-md border border-white/10 backdrop-blur-sm">
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