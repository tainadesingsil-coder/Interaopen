import { motion } from 'framer-motion';

export default function CodexionHero() {
  const img =
    'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=1920&auto=format&fit=crop';

  return (
    <section id="inicio" className="relative overflow-hidden min-h-[88vh] flex items-center">
      <div className="pointer-events-none absolute -left-24 -top-24 h-[420px] w-[420px] rounded-full bg-neon/20 blur-3xl animate-pulseGreen" />
      <div className="pointer-events-none absolute right-0 top-12 h-[360px] w-[360px] rounded-full bg-white/5 blur-3xl" />

      <div className="container mx-auto grid items-center gap-10 px-4 md:grid-cols-2">
        <div className="relative z-10">
          <p className="uppercase tracking-[0.22em] text-xs md:text-sm text-softGray">@codexion7</p>
          <h1 className="mt-3 text-4xl md:text-6xl font-extrabold leading-[1.05] text-softWhite">
            A mudança começa agora!
          </h1>
          <p className="mt-4 text-base md:text-lg text-softGray max-w-xl">
            Estratégia, IA e tecnologia para acelerar o crescimento do seu negócio.
          </p>
          <div className="mt-7 flex items-center gap-4">
            <a
              href="#contato"
              className="relative inline-flex items-center justify-center rounded-full px-7 py-3 text-sm font-semibold text-black transition-transform focus:outline-none focus:ring-2 focus:ring-neon/60"
              style={{
                background:
                  'linear-gradient(180deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.55) 48%, rgba(255,255,255,0.85) 100%), linear-gradient(90deg, #93ff00 0%, #9eff00 100%)',
                boxShadow:
                  '0 10px 22px rgba(158,255,0,0.25), inset 0 1px 0 rgba(255,255,255,0.5), inset 0 -1px 0 rgba(0,0,0,0.2)',
              }}
            >
              Comece hoje
            </a>
            <span className="text-softGray text-sm">Quem sai na frente com IA, lidera o futuro.</span>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-6 rounded-[28px] bg-neon/10 blur-2xl" />
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="relative rounded-[24px] overflow-hidden border border-white/10 bg-white/5 backdrop-blur-md shadow-soft"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-black/30 via-transparent to-neon/5" />
            <img
              src={img}
              alt="Humanoide metálico emergindo de um notebook"
              className="w-full h-[360px] md:h-[520px] object-cover"
              style={{ objectPosition: '50% 40%' }}
            />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-metal-sheen opacity-70" />
          </motion.div>
          <motion.div
            className="pointer-events-none absolute -bottom-6 left-1/2 -translate-x-1/2 h-24 w-56 rounded-full bg-neon/20 blur-2xl"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </div>
    </section>
  );
}
