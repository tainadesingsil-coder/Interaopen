import type { EnrichmentResult, NormalizedLeadInput } from "@/lib/hookflow/types";

interface GenerateApproachInput {
  lead: NormalizedLeadInput;
  enrichment: EnrichmentResult;
}

type ChatMessageContent = string | { type?: string; text?: string }[];

interface OpenAIChoice {
  message?: {
    content?: ChatMessageContent;
  };
}

interface OpenAIResponse {
  choices?: OpenAIChoice[];
}

const normalizeToTwoSentences = (rawText: string) => {
  const cleanText = rawText.replace(/\s+/g, " ").trim();
  if (!cleanText) {
    return "";
  }

  const sentenceList = cleanText
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  if (sentenceList.length >= 2) {
    return `${sentenceList[0]} ${sentenceList[1]}`.trim();
  }

  if (sentenceList.length === 1) {
    return `${sentenceList[0]} Em seguida, faça uma pergunta de qualificação para avançar o fechamento.`;
  }

  return cleanText;
};

const extractMessageContent = (response: OpenAIResponse) => {
  const content = response.choices?.[0]?.message?.content;
  if (!content) {
    return "";
  }

  if (typeof content === "string") {
    return content;
  }

  return content
    .map((item) => item.text?.trim())
    .filter(Boolean)
    .join(" ");
};

const buildFallbackApproach = (lead: NormalizedLeadInput, enrichment: EnrichmentResult) => {
  const firstName = lead.fullName?.split(" ")[0] ?? "tudo bem";
  const summary = enrichment.summary.toLowerCase();

  return normalizeToTwoSentences(
    `Abra a conversa com ${firstName} conectando sua solução ao resultado principal que ele busca. Use os dados já disponíveis (${summary}) para fazer uma pergunta objetiva e conduzir para o próximo passo de fechamento.`
  );
};

export const generateApproachStrategy = async ({ lead, enrichment }: GenerateApproachInput) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return buildFallbackApproach(lead, enrichment);
  }

  const model = process.env.OPENAI_MODEL ?? "gpt-4o";
  const prompt = [
    `Nome: ${lead.fullName ?? "Não informado"}`,
    `E-mail: ${lead.email}`,
    `Telefone: ${lead.phone ?? "Não informado"}`,
    `Resumo de enriquecimento: ${enrichment.summary}`,
    "Gere uma estratégia de abordagem personalizada em português do Brasil com exatamente 2 frases curtas.",
    "A primeira frase deve quebrar o gelo com contexto e a segunda deve sugerir uma ação clara para avançar o fechamento.",
  ].join("\n");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content:
            "Você é um SDR especialista em vendas consultivas. Sempre responda em português do Brasil com duas frases objetivas e práticas.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 140,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    return buildFallbackApproach(lead, enrichment);
  }

  const data = (await response.json()) as OpenAIResponse;
  const text = extractMessageContent(data);
  const strategy = normalizeToTwoSentences(text);

  if (!strategy) {
    return buildFallbackApproach(lead, enrichment);
  }

  return strategy;
};
