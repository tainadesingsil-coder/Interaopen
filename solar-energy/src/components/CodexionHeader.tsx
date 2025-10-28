export default function CodexionHeader() {
  return (
    <header className="header">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <a href="#inicio" className="flex items-center gap-2 font-display text-lg md:text-xl text-softWhite">
          <span className="inline-block h-2 w-2 rounded-full bg-neon shadow-[0_0_12px_rgba(158,255,0,0.7)]" />
          <span className="tracking-tight">codexion7</span>
        </a>
        <nav className="hidden md:flex items-center gap-6 text-sm text-softGray">
          <a href="#sobre" className="hover:text-softWhite transition">Sobre</a>
          <a href="#servicos" className="hover:text-softWhite transition">Serviços</a>
          <a href="#portfolio" className="hover:text-softWhite transition">Portfólio</a>
          <a href="#contato" className="hover:text-softWhite transition">Contato</a>
          <a
            href="#contato"
            className="ml-2 inline-flex items-center rounded-full border px-4 py-2 border-white/15 text-softWhite hover:border-neon/60 hover:text-neon transition"
          >
            Fale com um especialista
          </a>
        </nav>
      </div>
    </header>
  );
}
