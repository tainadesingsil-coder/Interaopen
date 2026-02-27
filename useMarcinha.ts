'use client';

import { useCallback, useState } from 'react';

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

const normalizeType = (value: string | undefined): MarcinhaType => {
  if (value === 'checklist' || value === 'plan' || value === 'error') return value;
  return 'text';
};

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
    'Você é Marcinha, assistente de treino/dança.',
    'Responda APENAS em JSON válido (sem markdown, sem texto fora do JSON).',
    'Formato obrigatório:',
    '{',
    '  "type": "text" | "checklist" | "plan" | "error",',
    '  "text": "resposta principal em português-BR",',
    '  "data": { "itens_opcionais": [] },',
    '  "ctx": { "atualizacoes_memoria": "opcional" }',
    '}',
    'Quando usuário pedir plano, retorne type="plan".',
    'Quando usuário pedir passos/lista, retorne type="checklist".',
    'Contexto de memória atual do usuário:',
    JSON.stringify(ctx ?? {}, null, 2),
  ].join('\n');

const getAnthropicKey = (): string => {
  const fromImportMeta =
    typeof import.meta !== 'undefined'
      ? ((import.meta as ImportMeta).env?.VITE_ANTHROPIC_KEY ?? '')
      : '';

  const fromNextPublic =
    typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_ANTHROPIC_KEY ?? '' : '';

  return fromImportMeta || fromNextPublic;
};

const historyToClaude = (history: MarcinhaMessage[]) =>
  history.slice(-MAX_HISTORY).map((msg) => ({
    role: msg.role === 'user' ? 'user' : 'assistant',
    content: msg.text,
  }));

export const useMarcinha = () => {
  const [messages, setMessages] = useState<MarcinhaMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [ctx, setCtx] = useState<MarcinhaCtx>({});

  const send = useCallback(
    async (text: string) => {
      const input = text.trim();
      if (!input || loading) return;

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
      const nextHistory = [...messages, userMessage];
      setMessages(nextHistory);
      setLoading(true);

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
            max_tokens: 900,
            temperature: 0.4,
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
              text: parsed.text?.trim() || rawText || 'Sem resposta da IA.',
              data: parsed.data,
              time: nowIso(),
            }
          : {
              role: 'ai',
              type: 'text',
              text: rawText || 'Sem resposta da IA.',
              time: nowIso(),
            };

        if (parsed?.ctx && typeof parsed.ctx === 'object') {
          setCtx((prev) => ({ ...prev, ...parsed.ctx }));
        }

        setMessages((prev) => [...prev, aiMessage]);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Erro inesperado ao chamar a IA.';
        setMessages((prev) => [
          ...prev,
          {
            role: 'ai',
            type: 'error',
            text: message,
            data: { input },
            time: nowIso(),
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [ctx, loading, messages],
  );

  return { messages, send, loading, ctx, setCtx };
};

