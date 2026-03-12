'use client';

import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { Loader2, SendHorizontal, Sparkles, Volume2 } from 'lucide-react';
import { ShaderAnimation } from '@/app/components/ShaderAnimation';

type AssistantState = 'booting' | 'ready' | 'thinking' | 'speaking';
type MessageRole = 'user' | 'model';

interface ChatMessage {
  role: MessageRole;
  text: string;
}

const SYSTEM_PROMPT = `Você é o ENIGMA, um assistente digital extremamente competente, no estilo JARVIS.
Responda sempre em português brasileiro.
Seja objetivo, técnico quando necessário e confiante.
Não use markdown, bullets ou listas.
Suas respostas serão lidas em voz alta: use no máximo 3 frases curtas e fortes.
Sempre chame o usuário de Estrela da Manhã.`;

const GEMINI_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
const STORAGE_KEY = 'enigma_messages_v1';
const BOOT_STORAGE_KEY = 'enigma_booted_v1';
const FALLBACK_REPLY =
  'O sinal está instável no momento. Tente novamente em instantes.';
const STAR_TITLE = 'Estrela da Manhã';
const BOOT_MESSAGE =
  'ENIGMA online. Estrela da Manhã, sistemas sincronizados. Aguardando seu comando.';

const STATE_LABEL: Record<AssistantState, string> = {
  booting: 'INICIANDO ENIGMA...',
  ready: 'PRONTO PARA SUA ORDEM',
  thinking: 'PENSANDO...',
  speaking: 'ENIGMA FALANDO...',
};

const withStarTitle = (text: string): string => {
  const normalized = text.toLowerCase();
  if (
    normalized.includes('estrela da manhã') ||
    normalized.includes('estrela da manha')
  ) {
    return text;
  }
  return `${STAR_TITLE}, ${text}`;
};

export default function HomePage() {
  const [assistantState, setAssistantState] = useState<AssistantState>('booting');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const messagesRef = useRef<ChatMessage[]>([]);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    synthRef.current = window.speechSynthesis;
    const stored = window.sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as ChatMessage[];
        if (Array.isArray(parsed)) {
          setMessages(parsed);
        }
      } catch {
        window.sessionStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  const speakText = useCallback((text: string, isBootMessage = false) => {
    if (typeof window === 'undefined') {
      return;
    }

    const synth = synthRef.current ?? window.speechSynthesis;
    if (!synth) {
      setAssistantState('ready');
      return;
    }

    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 1;
    utterance.pitch = 1;

    const voices = synth.getVoices();
    const portugueseVoice = voices.find((voice) => {
      const lang = voice.lang.toLowerCase();
      return lang.includes('pt-br') || lang.startsWith('pt');
    });

    if (portugueseVoice) {
      utterance.voice = portugueseVoice;
    }

    utterance.onstart = () => setAssistantState('speaking');
    utterance.onend = () => {
      setAssistantState('ready');
      if (isBootMessage && typeof window !== 'undefined') {
        window.sessionStorage.setItem(BOOT_STORAGE_KEY, '1');
      }
    };
    utterance.onerror = () => setAssistantState('ready');

    setAssistantState('speaking');
    synth.speak(utterance);
  }, []);

  const askGemini = useCallback(
    async (inputText: string) => {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      const cleanedInput = inputText.trim();
      if (!cleanedInput) {
        setAssistantState('ready');
        return;
      }

      if (!apiKey) {
        const missingKeyReply = withStarTitle(
          'A chave do oráculo não foi encontrada. Defina NEXT_PUBLIC_GEMINI_API_KEY.'
        );
        const userMessage: ChatMessage = { role: 'user', text: cleanedInput };
        const modelMessage: ChatMessage = { role: 'model', text: missingKeyReply };
        setErrorMessage(missingKeyReply);
        setMessages((previous) => [...previous, userMessage, modelMessage]);
        speakText(missingKeyReply);
        return;
      }

      setErrorMessage('');
      setAssistantState('thinking');

      const userMessage: ChatMessage = { role: 'user', text: cleanedInput };
      const conversation: ChatMessage[] = [...messagesRef.current, userMessage];
      setMessages(conversation);

      try {
        const response = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: SYSTEM_PROMPT }],
            },
            contents: conversation.map((message) => ({
              role: message.role,
              parts: [{ text: message.text }],
            })),
          }),
        });

        if (!response.ok) {
          throw new Error(`Gemini respondeu com status ${response.status}`);
        }

        const payload = await response.json();
        const reply = payload?.candidates?.[0]?.content?.parts
          ?.map((part: { text?: string }) => part.text ?? '')
          .join(' ')
          .trim();

        if (!reply) {
          throw new Error('Resposta vazia do Gemini');
        }

        const decoratedReply = withStarTitle(reply);
        const modelMessage: ChatMessage = { role: 'model', text: decoratedReply };
        setMessages((previous) => [...previous, modelMessage]);
        speakText(decoratedReply);
      } catch {
        setErrorMessage(
          'Não consegui consultar o Gemini agora. Vou responder com fallback.'
        );
        const fallbackMessage: ChatMessage = {
          role: 'model',
          text: withStarTitle(FALLBACK_REPLY),
        };
        setMessages((previous) => [...previous, fallbackMessage]);
        speakText(fallbackMessage.text);
      }
    },
    [speakText]
  );

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (window.sessionStorage.getItem(BOOT_STORAGE_KEY)) {
      setAssistantState('ready');
      return;
    }

    const timer = window.setTimeout(() => {
      const bootMessage = withStarTitle(BOOT_MESSAGE);
      setMessages((previous) => {
        if (previous.length > 0) {
          return previous;
        }
        return [...previous, { role: 'model', text: bootMessage }];
      });
      speakText(bootMessage, true);
    }, 650);

    return () => window.clearTimeout(timer);
  }, [speakText]);

  const handleSend = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const value = inputText.trim();
      if (!value || assistantState === 'thinking') {
        return;
      }
      setInputText('');
      await askGemini(value);
    },
    [assistantState, askGemini, inputText]
  );

  return (
    <main className='enigma-shell' id='main-content'>
      <div className='shader-stage' aria-hidden='true'>
        <ShaderAnimation />
      </div>
      <div className='jarvis-grid' aria-hidden='true' />

      <div className='enigma-front'>
        <header className='enigma-header'>
          <h1 className='enigma-logo' data-text='ENIGMA'>
            ENIGMA
          </h1>
          <p className='enigma-subtitle'>
            Voz sintética. Mente afiada. Mistério calculado.
          </p>
        </header>

        <section className='status-shell'>
          <div className={`status-dot state-${assistantState}`} aria-hidden='true' />
          <p className='status-label'>{STATE_LABEL[assistantState]}</p>
        </section>

        <section className={`core-orb state-${assistantState}`} aria-hidden='true'>
          {assistantState === 'thinking' ? (
            <Loader2 size={34} className='spin-icon' />
          ) : assistantState === 'speaking' ? (
            <Volume2 size={34} />
          ) : (
            <Sparkles size={34} />
          )}
          <span className='core-ring' />
        </section>

        <section className='dialog-panel' aria-live='polite'>
          {messages.length === 0 ? (
            <article className='dialog-item model'>
              <h2>ENIGMA</h2>
              <p>Inicializando o núcleo cognitivo.</p>
            </article>
          ) : (
            messages.slice(-6).map((message, index) => (
              <article
                key={`msg-${index}-${message.role}`}
                className={`dialog-item ${message.role === 'user' ? 'user' : 'model'}`}
              >
                <h2>{message.role === 'user' ? 'VOCÊ' : 'ENIGMA'}</h2>
                <p>{message.text}</p>
              </article>
            ))
          )}
        </section>

        <form className='composer' onSubmit={handleSend}>
          <input
            value={inputText}
            onChange={(event) => setInputText(event.target.value)}
            className='composer-input'
            placeholder='Digite seu comando para o ENIGMA...'
            autoComplete='off'
          />
          <button
            type='submit'
            className='composer-button'
            aria-label='Enviar comando'
            disabled={assistantState === 'thinking'}
          >
            {assistantState === 'thinking' ? (
              <Loader2 size={18} className='spin-icon' />
            ) : (
              <SendHorizontal size={18} />
            )}
          </button>
        </form>

        <p className='helper-text'>
          ENIGMA inicia falando quando abre. Você responde por texto.
        </p>

        {errorMessage ? <p className='error-text'>{errorMessage}</p> : null}
      </div>
    </main>
  );
}
