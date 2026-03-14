const GEMINI_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
const GEMINI_TIMEOUT_MS = 10000;
const MAX_TEXT = 420;
const FALLBACK_GEMINI_API_KEY = 'AIzaSyDmRPaN4CvD2OI04Jz8Y8APqktXggkTFAw';

const sanitizeText = (value = '') =>
  String(value)
    .replace(/[^\w\sÀ-ÿ.,!?()\-_:;/]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_TEXT);

const fetchWithTimeout = async (url, init = {}, timeoutMs = GEMINI_TIMEOUT_MS) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
};

const buildFallbackAnswer = (service, mode, question) => {
  if (mode === 'explain') {
    return `${service.title}: ${service.description} Aplicamos de forma prática para gerar resultado com previsibilidade e escala.`;
  }
  return `Sobre ${service.title}: ${service.description} Para sua dúvida "${question}", eu recomendo começar pelo objetivo principal e definir o fluxo operacional.`;
};

const buildPrompt = (service, mode, question) => {
  if (mode === 'explain') {
    return `Explique o serviço "${service.title}" da Codexion em português do Brasil, de forma comercial e clara, com no máximo 5 frases curtas. Contexto: ${service.description}. Área: ${service.area}.`;
  }
  return `Serviço: ${service.title}. Área: ${service.area}. Contexto: ${service.description}. Pergunta do cliente: ${question}. Responda em português do Brasil, direto, prático e comercial, no máximo 5 frases.`;
};

export async function onRequestPost(context) {
  let payload = null;
  try {
    payload = await context.request.json();
  } catch {
    return Response.json({ error: 'payload_invalido' }, { status: 400 });
  }

  const mode = payload?.mode === 'explain' ? 'explain' : 'chat';
  const service = {
    id: sanitizeText(payload?.service?.id || ''),
    title: sanitizeText(payload?.service?.title || ''),
    description: sanitizeText(payload?.service?.description || ''),
    area: sanitizeText(payload?.service?.area || ''),
  };
  const question = sanitizeText(payload?.question || '');

  if (!service.id || !service.title || !service.description) {
    return Response.json({ error: 'servico_invalido' }, { status: 400 });
  }

  const history = Array.isArray(payload?.history)
    ? payload.history
        .map((item) => ({
          role: item?.role === 'assistant' ? 'model' : 'user',
          text: sanitizeText(item?.text || ''),
        }))
        .filter((item) => item.text)
        .slice(-8)
    : [];

  const apiKey = (
    context.env.GEMINI_API_KEY ||
    context.env.NEXT_PUBLIC_GEMINI_API_KEY ||
    FALLBACK_GEMINI_API_KEY ||
    ''
  ).trim();

  if (!apiKey) {
    return Response.json({
      answer: buildFallbackAnswer(service, mode, question),
      source: 'fallback',
    });
  }

  try {
    const prompt = buildPrompt(service, mode, question);
    const response = await fetchWithTimeout(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: {
          parts: [
            {
              text: 'Você é especialista comercial da Codexion. Fale em português do Brasil, direto e claro. Não use markdown.',
            },
          ],
        },
        generationConfig: {
          temperature: 0.55,
          topP: 0.9,
          maxOutputTokens: 280,
        },
        contents: [
          ...history.map((item) => ({
            role: item.role,
            parts: [{ text: item.text }],
          })),
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error('gemini_request_failed');
    }

    const data = await response.json();
    const answer = (data?.candidates?.[0]?.content?.parts || [])
      .map((part) => part?.text || '')
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!answer) {
      throw new Error('empty_answer');
    }

    return Response.json({
      answer,
      source: 'gemini',
    });
  } catch {
    return Response.json({
      answer: buildFallbackAnswer(service, mode, question),
      source: 'fallback',
    });
  }
}
