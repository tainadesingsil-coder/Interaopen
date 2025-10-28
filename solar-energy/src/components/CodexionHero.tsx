export default function CodexionHero() {

  return (
    <section id="inicio" className="relative overflow-hidden min-h-screen flex items-center justify-center">

      <div className="container mx-auto px-4 flex flex-col items-center text-center">
        <div className="relative z-10 max-w-3xl">
          <img
            src="https://i.postimg.cc/htrPzRLK/Codexion-63.png"
            alt="Codexion visual"
            className="mt-6 w-full max-w-[680px] h-auto mx-auto object-contain"
            loading="eager"
          />
          <button
            type="button"
            className="mt-6 mx-auto inline-flex items-center justify-center rounded-full bg-white text-black px-7 py-3 text-sm font-semibold hover:scale-[1.02] transition"
          >
            A mudança começa agora!
          </button>
        </div>
      </div>
    </section>
  );
}
