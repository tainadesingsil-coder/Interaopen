import { motion } from 'framer-motion';

const items = [
  {
    t: 'Automação de atendimento com IA',
    img: 'https://images.unsplash.com/photo-1545235617-9465d2a55698?q=80&w=1600&auto=format&fit=crop',
  },
  {
    t: 'Dashboard de performance em tempo real',
    img: 'https://images.unsplash.com/photo-1551281044-8af0d8d6a6cd?q=80&w=1600&auto=format&fit=crop',
  },
  {
    t: 'Arquitetura de growth e CRM',
    img: 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?q=80&w=1600&auto=format&fit=crop',
  },
];

function Mock({ t, img, i }: { t: string; img: string; i: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{ duration: 0.6, delay: i * 0.06 }}
      className="relative rounded-3xl border border-white/10 bg-white/5 p-3 backdrop-blur-md will-change-transform"
      style={{ perspective: '1000px' }}
    >
      <div className="relative h-[220px] md:h-[280px] overflow-hidden rounded-2xl">
        <img src={img} alt={t} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-1.5 bg-metal-sheen opacity-70" />
      </div>
      <div className="mt-3 text-softWhite font-medium">{t}</div>
    </motion.div>
  );
}

export default function CodexionPortfolio() {
  return (
    <section id="portfolio" className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <h2 className="section-title text-softWhite">
          Projetos que unem design, automação e performance real.
        </h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {items.map((x, i) => (
            <Mock key={x.t} t={x.t} img={x.img} i={i} />)
          )}
        </div>
      </div>
    </section>
  );
}
