'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const CLAUDE_MODEL = 'claude-3-5-sonnet-latest';
const MAX_HISTORY = 24;

export type MarcinhaRole = 'user' | 'ai';
export type MarcinhaType = 'text' | 'checklist' | 'plan' | 'error';

export type MarcinhaMessage = {
  role: MarcinhaRole;
  type: MarcinhaType;
  text: string;
  data?: unknown;
  time: string;
};

export type MarcinhaCtx = Record<string, unknown>;

type ClaudeContentBlock = {
  type: 'text';
  text: string;
};

type ClaudeResponse = {
  content?: ClaudeContentBlock[];
  error?: { message?: string };
};

type ClaudePayload = {
  type?: string;
  text?: string;
  data?: unknown;
  ctx?: MarcinhaCtx;
};

const nowIso = () => new Date().toISOString();
const MAX_TEXT_CHARS = 3500;

const normalizeType = (value: string | undefined): MarcinhaType => {
  if (value === 'checklist' || value === 'plan' || value === 'error') return value;
  return 'text';
};

const inferTypeFromText = (text: string): MarcinhaType => {
  const t = text.toLowerCase();
  if (t.includes('erro') || t.includes('falha')) return 'error';
  if (
    text.includes('\n•') ||
    text.includes('\n- ') ||
    /checklist|passo a passo|etapas|tarefas/i.test(text)
  ) {
    return 'checklist';
  }
  if (/plano|cronograma|semana|periodiza|treino \d+x/i.test(t)) {
    return 'plan';
  }
  return 'text';
};

const sanitizeText = (value: string) => value.trim().slice(0, MAX_TEXT_CHARS);

const parseClaudePayload = (raw: string): ClaudePayload | null => {
  const tryParse = (value: string) => {
    try {
      return JSON.parse(value) as ClaudePayload;
    } catch {
      return null;
    }
  };

  const direct = tryParse(raw);
  if (direct) return direct;

  const fencedMatch = raw.match(/```json\s*([\s\S]*?)```/i);
  if (fencedMatch?.[1]) {
    const fenced = tryParse(fencedMatch[1].trim());
    if (fenced) return fenced;
  }

  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start >= 0 && end > start) {
    return tryParse(raw.slice(start, end + 1).trim());
  }

  return null;
};

const buildSystemPrompt = (ctx: MarcinhaCtx) =>
  [
    'Você é Marcinha, assistente de treino/dança com conversa FLUIDA e humana.',
    'Objetivo: responder com inteligência prática, sem repetir frase pronta.',
    'Fale em português-BR natural e objetivo.',
    'Sempre mantenha continuidade do diálogo anterior.',
    'Se usuário responder "sim/não", interprete o contexto da pergunta anterior.',
    'Faça no máximo 1 pergunta de continuação quando necessário.',
    'Responda APENAS em JSON válido (sem markdown e sem texto fora do JSON).',
    'Formato obrigatório:',
    '{',
    '  "type": "text" | "checklist" | "plan" | "error",',
    '  "text": "resposta principal em português-BR",',
    '  "data": { "itens_opcionais": [] },',
    '  "ctx": { "atualizacoes_memoria": "opcional" }',
    '}',
    'Regras de tipo:',
    '- Quando usuário pedir plano de treino, cronograma ou rotina: type="plan".',
    '- Quando usuário pedir lista de passos/tarefas: type="checklist".',
    '- Em erros de compreensão: type="error".',
    '- Caso contrário: type="text".',
    'Não repita a mesma resposta textual da mensagem anterior do assistente.',
    'Priorize respostas específicas (ex.: descanso entre séries, progressão, volume, frequência).',
    'Contexto de memória atual do usuário:',
    JSON.stringify(ctx ?? {}, null, 2),
  ].join('\n');

const getAnthropicKey = (): string => {
  const fromImportMeta =
    typeof import.meta !== 'undefined'
      ? ((import.meta as ImportMeta).env?.VITE_ANTHROPIC_KEY ??
        (import.meta as ImportMeta).env?.NEXT_PUBLIC_ANTHROPIC_KEY ??
        '')
      : '';

  const fromProcess =
    typeof process !== 'undefined'
      ? process.env.NEXT_PUBLIC_ANTHROPIC_KEY ?? process.env.VITE_ANTHROPIC_KEY ?? ''
      : '';

  let fromStorage = '';
  if (typeof window !== 'undefined') {
    fromStorage =
      window.localStorage.getItem('VITE_ANTHROPIC_KEY') ??
      window.localStorage.getItem('NEXT_PUBLIC_ANTHROPIC_KEY') ??
      '';
  }

  return fromImportMeta || fromProcess || fromStorage;
};

const historyToClaude = (history: MarcinhaMessage[]) =>
  history.slice(-MAX_HISTORY).map((msg) => ({
    role: msg.role === 'user' ? 'user' : 'assistant',
    content: `[type=${msg.type}] ${msg.text}`,
  }));

export const useMarcinha = () => {
  const [messages, setMessages] = useState<MarcinhaMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [ctx, setCtx] = useState<MarcinhaCtx>({});
  const messagesRef = useRef<MarcinhaMessage[]>([]);
  const inFlightRef = useRef(false);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const send = useCallback(
    async (text: string) => {
      const input = sanitizeText(text);
      if (!input || inFlightRef.current) return;

      const key = getAnthropicKey();
      if (!key) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'ai',
            type: 'error',
            text:
              'Chave da Anthropic não encontrada. Defina VITE_ANTHROPIC_KEY no .env (ou NEXT_PUBLIC_ANTHROPIC_KEY).',
            time: nowIso(),
          },
        ]);
        return;
      }

      const userMessage: MarcinhaMessage = {
        role: 'user',
        type: 'text',
        text: input,
        time: nowIso(),
      };
      const nextHistory = [...messagesRef.current, userMessage];
      messagesRef.current = nextHistory;
      setMessages(nextHistory);
      setLoading(true);
      inFlightRef.current = true;

      try {
        const response = await fetch(CLAUDE_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': key,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true',
          },
          body: JSON.stringify({
            model: CLAUDE_MODEL,
            max_tokens: 1200,
            temperature: 0.7,
            system: buildSystemPrompt(ctx),
            messages: historyToClaude(nextHistory),
          }),
        });

        const body = (await response.json()) as ClaudeResponse;
        if (!response.ok) {
          throw new Error(body.error?.message ?? 'Falha ao chamar Claude.');
        }

        const rawText = (body.content ?? [])
          .filter((block) => block.type === 'text')
          .map((block) => block.text)
          .join('\n')
          .trim();

        const parsed = parseClaudePayload(rawText);
        const aiMessage: MarcinhaMessage = parsed
          ? {
              role: 'ai',
              type: normalizeType(parsed.type),
              text: sanitizeText(parsed.text?.trim() || rawText || 'Sem resposta da IA.'),
              data: parsed.data,
              time: nowIso(),
            }
          : {
              role: 'ai',
              type: inferTypeFromText(rawText || ''),
              text: sanitizeText(rawText || 'Sem resposta da IA.'),
              time: nowIso(),
            };

        if (parsed?.ctx && typeof parsed.ctx === 'object') {
          setCtx((prev) => ({ ...prev, ...parsed.ctx }));
        }

        setMessages((prev) => {
          const next = [...prev, aiMessage];
          messagesRef.current = next;
          return next;
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Erro inesperado ao chamar a IA.';
        setMessages((prev) => {
          const next = [
            ...prev,
            {
              role: 'ai' as const,
              type: 'error' as const,
              text: sanitizeText(message),
              data: { input },
              time: nowIso(),
            },
          ];
          messagesRef.current = next;
          return next;
        });
      } finally {
        setLoading(false);
        inFlightRef.current = false;
      }
    },
    [ctx],
  );

  return { messages, send, loading, ctx, setCtx };
};

