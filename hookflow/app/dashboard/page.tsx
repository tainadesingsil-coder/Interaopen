import Link from "next/link";
import { listRecentLeads } from "@/lib/hookflow/service";
import { hasSupabaseCredentials } from "@/lib/hookflow/supabase";
import type { HookflowLeadRow } from "@/lib/hookflow/types";
import { buildPersonalizedWhatsAppMessage, buildWhatsAppUrl } from "@/lib/hookflow/whatsapp";

export const dynamic = "force-dynamic";

const statusStyles: Record<string, string> = {
  received: "bg-amber-500/15 text-amber-300 border border-amber-500/25",
  processed: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/25",
  processed_with_warnings: "bg-orange-500/15 text-orange-300 border border-orange-500/25",
};

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const getNestedString = (input: unknown, keys: string[]) => {
  let current: unknown = input;

  for (const key of keys) {
    if (!isRecord(current)) {
      return undefined;
    }

    current = current[key];
  }

  return typeof current === "string" && current.trim().length > 0 ? current : undefined;
};

const extractEnrichmentHighlights = (lead: HookflowLeadRow) => {
  const data = lead.enrichment_data;
  if (!data) {
    return ["Sem dados adicionais de enriquecimento."];
  }

  const role =
    getNestedString(data, ["person", "employment", "title"]) ??
    getNestedString(data, ["person", "title"]);
  const company =
    getNestedString(data, ["company", "name"]) ??
    getNestedString(data, ["person", "organization", "name"]);
  const location =
    getNestedString(data, ["person", "location"]) ??
    getNestedString(data, ["person", "city"]) ??
    getNestedString(data, ["company", "geo", "city"]);

  const items = [
    role ? `Cargo: ${role}` : null,
    company ? `Empresa: ${company}` : null,
    location ? `Local: ${location}` : null,
  ].filter(Boolean);

  return items.length > 0 ? (items as string[]) : ["Dados enriquecidos sem campos padronizados."];
};

const buildMessage = (lead: HookflowLeadRow) => {
  const strategy =
    lead.approach_strategy ??
    "Quero entender seu momento atual para montar uma proposta alinhada ao seu objetivo.";

  return (
    lead.whatsapp_message ??
    buildPersonalizedWhatsAppMessage(
      {
        fullName: lead.full_name ?? undefined,
      },
      strategy
    )
  );
};

export default async function HookFlowDashboardPage() {
  const hasCredentials = hasSupabaseCredentials();
  const leads = hasCredentials ? await listRecentLeads(100) : [];

  const processedLeads = leads.filter((lead) => lead.status.startsWith("processed")).length;
  const enrichedLeads = leads.filter((lead) => lead.enrichment_source !== "none").length;

  return (
    <main id="main-content" className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto w-full max-w-7xl px-6 py-10 md:px-10">
        <header className="mb-8 rounded-3xl border border-white/10 bg-gradient-to-r from-indigo-600/30 via-slate-900 to-fuchsia-600/20 p-8 shadow-2xl">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <p className="mb-3 inline-flex rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs font-medium tracking-wide text-cyan-200">
                HookFlow SaaS Base
              </p>
              <h1 className="text-3xl font-semibold md:text-4xl">
                Dashboard de Leads com Enriquecimento + IA
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-slate-300 md:text-base">
                Receba leads do Facebook Lead Ads, enriqueça os dados automaticamente e entregue
                para o vendedor uma estratégia personalizada de abordagem em 2 frases.
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-white/10"
            >
              Ver visão geral
            </Link>
          </div>
        </header>

        {!hasCredentials ? (
          <div className="mb-8 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-6 text-rose-100">
            <h2 className="text-lg font-semibold">Configuração pendente</h2>
            <p className="mt-2 text-sm">
              Defina <code>SUPABASE_URL</code> e <code>SUPABASE_SERVICE_ROLE_KEY</code> no
              ambiente para carregar os leads reais.
            </p>
          </div>
        ) : null}

        <section className="mb-8 grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-slate-300">Total de leads</p>
            <p className="mt-2 text-3xl font-semibold">{leads.length}</p>
          </article>
          <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-slate-300">Leads processados</p>
            <p className="mt-2 text-3xl font-semibold">{processedLeads}</p>
          </article>
          <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-slate-300">Com enriquecimento</p>
            <p className="mt-2 text-3xl font-semibold">{enrichedLeads}</p>
          </article>
        </section>

        {leads.length === 0 ? (
          <section className="rounded-2xl border border-dashed border-white/20 bg-white/[0.02] p-8 text-center">
            <h2 className="text-xl font-semibold">Nenhum lead ainda</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-300">
              Assim que o webhook <code>/api/webhooks/facebook-leads</code> receber eventos, os
              cards aparecerão aqui com dados enriquecidos, estratégia personalizada e atalho de
              WhatsApp.
            </p>
          </section>
        ) : (
          <section className="grid gap-5 lg:grid-cols-2">
            {leads.map((lead) => {
              const whatsappMessage = buildMessage(lead);
              const whatsappUrl = buildWhatsAppUrl(lead.phone, whatsappMessage);
              const highlights = extractEnrichmentHighlights(lead);
              const badgeClass =
                statusStyles[lead.status] ??
                "bg-slate-500/15 text-slate-300 border border-slate-500/20";

              return (
                <article
                  key={lead.id}
                  className="rounded-2xl border border-white/10 bg-slate-900/70 p-6 shadow-xl backdrop-blur"
                >
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-semibold text-white">
                        {lead.full_name ?? "Lead sem nome"}
                      </h3>
                      <p className="text-sm text-slate-300">{lead.email}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${badgeClass}`}>
                      {lead.status}
                    </span>
                  </div>

                  <dl className="grid gap-2 text-sm text-slate-300 md:grid-cols-2">
                    <div>
                      <dt className="text-slate-400">Telefone</dt>
                      <dd>{lead.phone ?? "Não informado"}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-400">Recebido em</dt>
                      <dd>{formatDate(lead.created_at)}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-400">Fonte de enriquecimento</dt>
                      <dd className="uppercase">{lead.enrichment_source}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-400">Facebook Lead ID</dt>
                      <dd className="truncate">{lead.facebook_lead_id ?? "N/A"}</dd>
                    </div>
                  </dl>

                  <div className="mt-4 rounded-xl border border-indigo-400/20 bg-indigo-500/10 p-4">
                    <p className="mb-2 text-xs uppercase tracking-wide text-indigo-200">
                      Estratégia de abordagem personalizada
                    </p>
                    <p className="text-sm text-slate-100">
                      {lead.approach_strategy ?? "Estratégia ainda não disponível para este lead."}
                    </p>
                  </div>

                  <div className="mt-4 rounded-xl border border-cyan-400/20 bg-cyan-500/10 p-4">
                    <p className="mb-2 text-xs uppercase tracking-wide text-cyan-100">
                      Destaques do enriquecimento
                    </p>
                    <ul className="list-inside list-disc space-y-1 text-sm text-slate-100">
                      {highlights.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  {lead.processing_error ? (
                    <p className="mt-4 rounded-xl border border-orange-500/30 bg-orange-500/10 p-3 text-xs text-orange-100">
                      {lead.processing_error}
                    </p>
                  ) : null}

                  <div className="mt-5 flex flex-wrap gap-3">
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400"
                    >
                      Chamar no WhatsApp
                    </a>
                    <a
                      href={`mailto:${lead.email}`}
                      className="inline-flex items-center rounded-xl border border-white/20 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-white/10"
                    >
                      Enviar e-mail
                    </a>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </section>
    </main>
  );
}
