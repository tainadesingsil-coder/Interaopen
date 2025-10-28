import { motion } from 'framer-motion';

export default function CodexionHero() {
  const img =
    'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=1920&auto=format&fit=crop';

  return (
    <section id="inicio" className="relative overflow-hidden min-h-[88vh] flex items-center">

      <div className="container mx-auto px-4 flex flex-col items-center text-center">
        <div className="relative z-10 max-w-3xl">
          <p className="uppercase tracking-[0.22em] text-xs md:text-sm text-softGray">@codexion7</p>
          <h1 className="mt-3 text-4xl md:text-6xl font-medium tracking-wide leading-[1.05] text-softWhite">
            A mudança começa <span className="text-softWhite relative">
              agora!
              <span className="absolute inset-x-0 -bottom-1 h-[8px] rounded-full opacity-60 bg-[linear-gradient(90deg,#9eff00,#00c8ff)] blur-md" />
            </span>
          </h1>
          <p className="mt-4 text-base md:text-lg text-softGray max-w-xl">
            Estratégia, IA e tecnologia para acelerar o crescimento do seu negócio.
          </p>
          <div className="mt-7 flex items-center justify-center gap-4">
            <a
              href="#contato"
              className="relative inline-flex items-center justify-center rounded-full px-7 py-3 text-sm font-semibold text-black transition-transform focus:outline-none focus:ring-2 focus:ring-white/50 hover:scale-[1.02]"
              style={{
                background:
                  'linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.6) 48%, rgba(255,255,255,0.92) 100%), linear-gradient(90deg, #9eff00, #00c8ff)',
                boxShadow:
                  '0 10px 22px rgba(158,255,0,0.22), 0 10px 28px rgba(0,200,255,0.16), inset 0 1px 0 rgba(255,255,255,0.6), inset 0 -1px 0 rgba(0,0,0,0.2)',
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" className="h-4 w-4 mr-2" fill="currentColor"><path d="M187.64,168.62a24.13,24.13,0,0,1-8.61,1.59h0a24,24,0,0,1-20.8-12.47L142,132.54a8,8,0,0,1,14-7.84l16.23,29.2a8.06,8.06,0,0,0,7,4.15h0A8,8,0,0,0,186,152.89l5.86-21.65a80.06,80.06,0,1,0-36.3,41.18,8,8,0,1,1,7.5,14.2A95.83,95.83,0,0,1,128,224h0a96,96,0,1,1,91.33-124.37l-9.44,34.86A24,24,0,0,1,187.64,168.62Z"/></svg>
              Comece hoje
            </a>
            <span className="text-softGray text-sm">Quem sai na frente com IA, lidera o futuro.</span>
          </div>
        </div>
      </div>
    </section>
  );
}
