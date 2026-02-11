import type { EnrichmentResult } from "@/lib/hookflow/types";

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

const getNestedString = (record: UnknownRecord, path: string[]) => {
  let current: unknown = record;

  for (const segment of path) {
    if (!isRecord(current)) {
      return undefined;
    }

    current = current[segment];
  }

  return asString(current);
};

const summarizeClearbitData = (data: UnknownRecord) => {
  const role = getNestedString(data, ["person", "employment", "title"]);
  const companyName = getNestedString(data, ["company", "name"]);
  const industry =
    getNestedString(data, ["company", "category", "industry"]) ??
    getNestedString(data, ["company", "category", "sector"]);
  const location =
    getNestedString(data, ["person", "location"]) ??
    getNestedString(data, ["person", "geo", "city"]) ??
    getNestedString(data, ["company", "geo", "city"]);

  const parts = [
    role ? `cargo: ${role}` : null,
    companyName ? `empresa: ${companyName}` : null,
    industry ? `segmento: ${industry}` : null,
    location ? `local: ${location}` : null,
  ].filter(Boolean);

  return parts.length > 0
    ? `Dados identificados por enriquecimento (${parts.join(", ")}).`
    : "Dados básicos enriquecidos via Clearbit.";
};

const summarizeApolloData = (data: UnknownRecord) => {
  const person = isRecord(data.person) ? data.person : data;
  const title = getNestedString(person, ["title"]);
  const organization = isRecord(person.organization) ? person.organization : {};
  const companyName = getNestedString(organization, ["name"]);
  const industry = getNestedString(organization, ["industry"]);
  const location =
    getNestedString(person, ["city"]) ??
    getNestedString(person, ["state"]) ??
    getNestedString(organization, ["city"]);

  const parts = [
    title ? `cargo: ${title}` : null,
    companyName ? `empresa: ${companyName}` : null,
    industry ? `segmento: ${industry}` : null,
    location ? `local: ${location}` : null,
  ].filter(Boolean);

  return parts.length > 0
    ? `Dados identificados por enriquecimento (${parts.join(", ")}).`
    : "Dados básicos enriquecidos via Apollo.";
};

const enrichWithClearbit = async (email: string, apiKey: string): Promise<EnrichmentResult | null> => {
  const endpoint = `https://person.clearbit.com/v2/combined/find?email=${encodeURIComponent(email)}`;
  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    cache: "no-store",
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Clearbit request failed (${response.status})`);
  }

  const data = (await response.json()) as unknown;
  if (!isRecord(data)) {
    return null;
  }

  return {
    source: "clearbit",
    data,
    summary: summarizeClearbitData(data),
  };
};

const APOLLO_ENDPOINTS = [
  "https://api.apollo.io/api/v1/people/match",
  "https://api.apollo.io/v1/people/match",
];

const enrichWithApollo = async (email: string, apiKey: string): Promise<EnrichmentResult | null> => {
  for (const endpoint of APOLLO_ENDPOINTS) {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": apiKey,
      },
      body: JSON.stringify({
        email,
        api_key: apiKey,
      }),
      cache: "no-store",
    });

    if (response.status === 404) {
      continue;
    }

    if (!response.ok) {
      continue;
    }

    const data = (await response.json()) as unknown;
    if (!isRecord(data)) {
      continue;
    }

    return {
      source: "apollo",
      data,
      summary: summarizeApolloData(data),
    };
  }

  return null;
};

export const enrichLeadByEmail = async (email: string): Promise<EnrichmentResult> => {
  const provider = (process.env.ENRICHMENT_PROVIDER ?? "auto").toLowerCase();
  const clearbitKey = process.env.CLEARBIT_API_KEY;
  const apolloKey = process.env.APOLLO_API_KEY;

  const tryClearbit = async () => {
    if (!clearbitKey) {
      return null;
    }

    return enrichWithClearbit(email, clearbitKey);
  };

  const tryApollo = async () => {
    if (!apolloKey) {
      return null;
    }

    return enrichWithApollo(email, apolloKey);
  };

  let enrichment: EnrichmentResult | null = null;

  if (provider === "clearbit") {
    enrichment = await tryClearbit();
  } else if (provider === "apollo") {
    enrichment = await tryApollo();
  } else {
    enrichment = (await tryClearbit()) ?? (await tryApollo());
  }

  return (
    enrichment ?? {
      source: "none",
      data: null,
      summary:
        "Nenhum dado adicional encontrado no enriquecimento. Use o contato inicial para coletar mais contexto.",
    }
  );
};
