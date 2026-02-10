export type EnrichmentSource = "apollo" | "clearbit" | "none";

export interface NormalizedLeadInput {
  facebookLeadId?: string;
  fullName?: string;
  email: string;
  phone?: string;
  formId?: string;
  adId?: string;
  pageId?: string;
  rawWebhook: Record<string, unknown>;
}

export interface EnrichmentResult {
  source: EnrichmentSource;
  data: Record<string, unknown> | null;
  summary: string;
}

export interface HookflowLeadRow {
  id: string;
  created_at: string;
  updated_at: string;
  facebook_lead_id: string | null;
  full_name: string | null;
  email: string;
  phone: string | null;
  form_id: string | null;
  ad_id: string | null;
  page_id: string | null;
  raw_webhook: Record<string, unknown>;
  enrichment_source: EnrichmentSource;
  enrichment_data: Record<string, unknown> | null;
  approach_strategy: string | null;
  whatsapp_message: string | null;
  status: string;
  processing_error: string | null;
}
