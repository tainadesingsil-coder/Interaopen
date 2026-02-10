import { enrichLeadByEmail } from "@/lib/hookflow/enrichment";
import { generateApproachStrategy } from "@/lib/hookflow/openai";
import { getSupabaseAdminClient, HOOKFLOW_LEADS_TABLE } from "@/lib/hookflow/supabase";
import type { HookflowLeadRow, NormalizedLeadInput } from "@/lib/hookflow/types";
import { buildPersonalizedWhatsAppMessage, buildWhatsAppUrl } from "@/lib/hookflow/whatsapp";

const fallbackStrategy =
  "Inicie reconhecendo o contexto do lead e conecte sua solução ao objetivo imediato dele. Feche com uma pergunta direta para avançar para uma reunião ou demonstração.";

const toErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Erro desconhecido no processamento.";

const insertLead = async (lead: NormalizedLeadInput) => {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    throw new Error(
      "SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configurados para salvar leads."
    );
  }

  const payload = {
    facebook_lead_id: lead.facebookLeadId ?? null,
    full_name: lead.fullName ?? null,
    email: lead.email,
    phone: lead.phone ?? null,
    form_id: lead.formId ?? null,
    ad_id: lead.adId ?? null,
    page_id: lead.pageId ?? null,
    raw_webhook: lead.rawWebhook,
    enrichment_source: "none" as const,
    enrichment_data: null,
    approach_strategy: null,
    whatsapp_message: null,
    status: "received",
    processing_error: null,
  };

  if (lead.facebookLeadId) {
    const { data, error } = await supabase
      .from(HOOKFLOW_LEADS_TABLE)
      .upsert(payload, {
        onConflict: "facebook_lead_id",
      })
      .select("*")
      .single();

    if (error || !data) {
      throw new Error(error?.message ?? "Falha ao salvar lead no Supabase.");
    }

    return data;
  }

  const { data, error } = await supabase.from(HOOKFLOW_LEADS_TABLE).insert(payload).select("*").single();
  if (error || !data) {
    throw new Error(error?.message ?? "Falha ao salvar lead no Supabase.");
  }

  return data;
};

export const processIncomingLead = async (lead: NormalizedLeadInput) => {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    throw new Error(
      "SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configurados para processar leads."
    );
  }

  const storedLead = await insertLead(lead);
  let processingError: string | null = null;

  const enrichment = await enrichLeadByEmail(lead.email).catch((error: unknown) => {
    processingError = `Erro no enriquecimento: ${toErrorMessage(error)}`;
    return {
      source: "none" as const,
      data: null,
      summary:
        "Não foi possível consultar enriquecimento agora. Continue com a abordagem inicial e valide contexto na conversa.",
    };
  });

  const strategy = await generateApproachStrategy({ lead, enrichment }).catch((error: unknown) => {
    const message = toErrorMessage(error);
    processingError = processingError
      ? `${processingError} | Erro no OpenAI: ${message}`
      : `Erro no OpenAI: ${message}`;

    return fallbackStrategy;
  });

  const whatsappMessage = buildPersonalizedWhatsAppMessage(lead, strategy);
  const status = processingError ? "processed_with_warnings" : "processed";

  const { data: updatedLead, error } = await supabase
    .from(HOOKFLOW_LEADS_TABLE)
    .update({
      enrichment_source: enrichment.source,
      enrichment_data: enrichment.data,
      approach_strategy: strategy,
      whatsapp_message: whatsappMessage,
      status,
      processing_error: processingError,
    })
    .eq("id", storedLead.id)
    .select("*")
    .single();

  if (error || !updatedLead) {
    throw new Error(error?.message ?? "Falha ao finalizar processamento do lead.");
  }

  return {
    ...updatedLead,
    whatsapp_url: buildWhatsAppUrl(updatedLead.phone, whatsappMessage),
  };
};

export const listRecentLeads = async (limit = 100): Promise<HookflowLeadRow[]> => {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from(HOOKFLOW_LEADS_TABLE)
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    return [];
  }

  return data;
};
