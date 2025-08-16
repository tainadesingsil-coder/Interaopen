import { motion } from "framer-motion";

type HeroMinimalProps = {
  imageUrl: string;
};

export default function HeroMinimal({ imageUrl }: HeroMinimalProps) {
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
                href="#lead"
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
              <img
                src={imageUrl}
                alt="Placas solares modernas"
                className="block w-full h-auto object-cover"
                style={{ transform: "translateZ(0)" }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}