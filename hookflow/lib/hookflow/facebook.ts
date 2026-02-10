import { createHmac, timingSafeEqual } from "node:crypto";
import type { NormalizedLeadInput } from "@/lib/hookflow/types";

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const asString = (value: unknown) => {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
};

const getStringFromRecord = (record: UnknownRecord, key: string) => asString(record[key]);

const pickFirstString = (record: UnknownRecord, keys: string[]) => {
  for (const key of keys) {
    const value = getStringFromRecord(record, key);
    if (value) {
      return value;
    }
  }

  return undefined;
};

const normalizePhone = (value?: string) => {
  if (!value) {
    return undefined;
  }

  return value.replace(/[^\d+]/g, "");
};

const mapFieldDataToRecord = (fieldData: unknown) => {
  const mapped: UnknownRecord = {};
  if (!Array.isArray(fieldData)) {
    return mapped;
  }

  for (const item of fieldData) {
    if (!isRecord(item)) {
      continue;
    }

    const fieldName = asString(item.name);
    const values = item.values;
    if (!fieldName || !Array.isArray(values) || values.length === 0) {
      continue;
    }

    const firstValue = values[0];
    if (typeof firstValue === "string") {
      mapped[fieldName] = firstValue;
    }
  }

  return mapped;
};

const getNameFromFields = (fields: UnknownRecord) => {
  const fullName = pickFirstString(fields, ["full_name", "nome_completo", "name", "nome"]);
  if (fullName) {
    return fullName;
  }

  const firstName = pickFirstString(fields, ["first_name", "primeiro_nome"]);
  const lastName = pickFirstString(fields, ["last_name", "sobrenome"]);
  if (firstName && lastName) {
    return `${firstName} ${lastName}`.trim();
  }

  return firstName ?? lastName;
};

const extractLeadFromSimplePayload = (payload: UnknownRecord): NormalizedLeadInput | null => {
  const lead = isRecord(payload.lead) ? payload.lead : payload;
  const email = pickFirstString(lead, ["email", "email_address"]);
  if (!email) {
    return null;
  }

  return {
    facebookLeadId: pickFirstString(lead, ["facebook_lead_id", "leadgen_id", "lead_id"]),
    fullName: pickFirstString(lead, ["full_name", "name", "nome"]),
    email,
    phone: normalizePhone(pickFirstString(lead, ["phone", "phone_number", "telefone"])),
    formId: pickFirstString(lead, ["form_id"]),
    adId: pickFirstString(lead, ["ad_id"]),
    pageId: pickFirstString(lead, ["page_id"]),
    rawWebhook: payload,
  };
};

const extractLeadgenValue = (payload: UnknownRecord) => {
  const entries = payload.entry;
  if (!Array.isArray(entries)) {
    return null;
  }

  for (const entry of entries) {
    if (!isRecord(entry) || !Array.isArray(entry.changes)) {
      continue;
    }

    for (const change of entry.changes) {
      if (!isRecord(change) || asString(change.field) !== "leadgen") {
        continue;
      }

      if (isRecord(change.value)) {
        return change.value;
      }
    }
  }

  return null;
};

const fetchFacebookLeadById = async (leadgenId: string) => {
  const accessToken = process.env.FACEBOOK_GRAPH_ACCESS_TOKEN;
  if (!accessToken) {
    return null;
  }

  const searchParams = new URLSearchParams({
    fields: "id,field_data,form_id,ad_id,page_id",
    access_token: accessToken,
  });

  const endpoint = `https://graph.facebook.com/v20.0/${leadgenId}?${searchParams.toString()}`;
  const response = await fetch(endpoint, {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Facebook Graph API error (${response.status})`);
  }

  const data = (await response.json()) as unknown;
  return isRecord(data) ? data : null;
};

export const isFacebookSignatureValid = (body: string, signatureHeader: string | null) => {
  const appSecret = process.env.FACEBOOK_APP_SECRET;
  if (!appSecret) {
    return true;
  }

  if (!signatureHeader?.startsWith("sha256=")) {
    return false;
  }

  const expectedSignature = createHmac("sha256", appSecret).update(body).digest("hex");
  const actualSignature = signatureHeader.replace("sha256=", "");

  const expectedBuffer = Buffer.from(expectedSignature, "hex");
  const actualBuffer = Buffer.from(actualSignature, "hex");

  if (expectedBuffer.length !== actualBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, actualBuffer);
};

export const normalizeFacebookLeadPayload = async (payload: unknown) => {
  if (!isRecord(payload)) {
    return null;
  }

  const simpleLead = extractLeadFromSimplePayload(payload);
  if (simpleLead) {
    return simpleLead;
  }

  const leadgenValue = extractLeadgenValue(payload);
  if (!leadgenValue) {
    return null;
  }

  const facebookLeadId = pickFirstString(leadgenValue, ["leadgen_id", "id"]);
  const webhookFieldMap = mapFieldDataToRecord(leadgenValue.field_data);

  let hydratedFieldMap = webhookFieldMap;
  let hydratedMeta: UnknownRecord = {};

  if (facebookLeadId && !pickFirstString(webhookFieldMap, ["email"])) {
    const graphLead = await fetchFacebookLeadById(facebookLeadId);
    if (graphLead) {
      hydratedFieldMap = {
        ...hydratedFieldMap,
        ...mapFieldDataToRecord(graphLead.field_data),
      };
      hydratedMeta = graphLead;
    }
  }

  const email = pickFirstString(hydratedFieldMap, ["email", "email_address"]);
  if (!email) {
    return null;
  }

  return {
    facebookLeadId,
    fullName: getNameFromFields(hydratedFieldMap),
    email,
    phone: normalizePhone(
      pickFirstString(hydratedFieldMap, ["phone", "phone_number", "telefone"])
    ),
    formId: pickFirstString(leadgenValue, ["form_id"]) ?? asString(hydratedMeta.form_id),
    adId: pickFirstString(leadgenValue, ["ad_id"]) ?? asString(hydratedMeta.ad_id),
    pageId: pickFirstString(leadgenValue, ["page_id"]) ?? asString(hydratedMeta.page_id),
    rawWebhook: payload,
  } satisfies NormalizedLeadInput;
};
