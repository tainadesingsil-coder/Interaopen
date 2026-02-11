import Link from "next/link";

export default function HomePage() {
  return (
    <main id="main-content" className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto w-full max-w-6xl px-6 py-12 md:px-10">
        <header className="rounded-3xl border border-white/10 bg-gradient-to-br from-violet-600/25 via-slate-900 to-cyan-500/15 p-8 shadow-2xl">
          <p className="mb-3 inline-flex rounded-full border border-violet-300/30 bg-violet-500/20 px-3 py-1 text-xs tracking-wide text-violet-100">
            HookFlow
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight md:text-5xl">
            Base SaaS para receber, enriquecer e converter leads do Facebook Ads
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-slate-300 md:text-base">
            Pipeline completo com webhook do Facebook Lead Ads, persistência no
            Supabase/PostgreSQL, enriquecimento por e-mail, estratégia de abordagem com GPT-4o e
            dashboard moderno para o time comercial.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400"
            >
              Abrir dashboard
            </Link>
            <Link
              href="/api/leads"
              className="inline-flex items-center rounded-xl border border-white/20 px-5 py-2.5 text-sm font-medium text-slate-100 transition hover:bg-white/10"
            >
              Ver API de leads
            </Link>
          </div>
        </header>

        <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-wide text-cyan-200">1. Ingestão</p>
            <h2 className="mt-2 text-lg font-semibold">Webhook Facebook</h2>
            <p className="mt-2 text-sm text-slate-300">
              Endpoint validado com <code>hub.challenge</code> e assinatura.
            </p>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-wide text-cyan-200">2. Banco</p>
            <h2 className="mt-2 text-lg font-semibold">Supabase/PostgreSQL</h2>
            <p className="mt-2 text-sm text-slate-300">
              Armazena payload bruto, dados enriquecidos e status de processamento.
            </p>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-wide text-cyan-200">3. IA</p>
            <h2 className="mt-2 text-lg font-semibold">GPT-4o</h2>
            <p className="mt-2 text-sm text-slate-300">
              Gera estratégia personalizada em 2 frases para orientar o vendedor.
            </p>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-wide text-cyan-200">4. Conversão</p>
            <h2 className="mt-2 text-lg font-semibold">WhatsApp 1-clique</h2>
            <p className="mt-2 text-sm text-slate-300">
              Botão &quot;Chamar no WhatsApp&quot; com mensagem personalizada pronta.
            </p>
          </article>
        </section>
      </section>
    </main>
  );
}
