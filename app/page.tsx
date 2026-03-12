'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AudioLines, Loader2, Mic, Volume2 } from 'lucide-react';

type VoiceState = 'idle' | 'listening' | 'thinking' | 'speaking';
type MessageRole = 'user' | 'model';

interface ChatMessage {
  role: MessageRole;
  text: string;
}

const SYSTEM_PROMPT = `Você é o ENIGMA, um assistente de voz misterioso, inteligente e preciso.
Responda sempre em português brasileiro.
Seja direto, elegante e levemente enigmático no tom.
Suas respostas serão lidas em voz alta, então sem listas ou markdown.
Máximo 3 frases curtas e impactantes.`;

const GEMINI_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
const STORAGE_KEY = 'enigma_messages_v1';
const FALLBACK_REPLY =
  'O sinal está instável no momento. Tente novamente em instantes.';

const STATE_LABEL: Record<VoiceState, string> = {
  idle: 'TOQUE PARA FALAR',
  listening: 'OUVINDO...',
  thinking: 'PENSANDO...',
  speaking: 'FALANDO...',
};

export default function HomePage() {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [lastUserInput, setLastUserInput] = useState('');
  const [lastAssistantReply, setLastAssistantReply] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const recognitionRef = useRef<any>(null);
  const hasRecognitionResultRef = useRef(false);
  const voiceStateRef = useRef<VoiceState>('idle');
  const messagesRef = useRef<ChatMessage[]>([]);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    voiceStateRef.current = voiceState;
  }, [voiceState]);

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
          const latestUser = [...parsed].reverse().find((item) => item.role === 'user');
          const latestModel = [...parsed].reverse().find((item) => item.role === 'model');
          setLastUserInput(latestUser?.text ?? '');
          setLastAssistantReply(latestModel?.text ?? '');
        }
      } catch {
        window.sessionStorage.removeItem(STORAGE_KEY);
      }
    }

    return () => {
      recognitionRef.current?.stop?.();
      window.speechSynthesis?.cancel();
    };
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  const speakText = useCallback((text: string) => {
    if (typeof window === 'undefined') {
      return;
    }

    const synth = synthRef.current ?? window.speechSynthesis;
    if (!synth) {
      setVoiceState('idle');
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

    utterance.onstart = () => setVoiceState('speaking');
    utterance.onend = () => setVoiceState('idle');
    utterance.onerror = () => setVoiceState('idle');

    setVoiceState('speaking');
    synth.speak(utterance);
  }, []);

  const askGemini = useCallback(
    async (inputText: string) => {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      const cleanedInput = inputText.trim();
      if (!cleanedInput) {
        setVoiceState('idle');
        return;
      }

      if (!apiKey) {
        const missingKeyReply =
          'A chave do oráculo não foi encontrada. Defina NEXT_PUBLIC_GEMINI_API_KEY.';
        const userMessage: ChatMessage = { role: 'user', text: cleanedInput };
        const modelMessage: ChatMessage = { role: 'model', text: missingKeyReply };
        setErrorMessage(missingKeyReply);
        setLastAssistantReply(missingKeyReply);
        setMessages((previous) => [...previous, userMessage, modelMessage]);
        speakText(missingKeyReply);
        return;
      }

      setErrorMessage('');
      setLastUserInput(cleanedInput);
      setVoiceState('thinking');

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

        const modelMessage: ChatMessage = { role: 'model', text: reply };
        setLastAssistantReply(reply);
        setMessages((previous) => [...previous, modelMessage]);
        speakText(reply);
      } catch {
        setErrorMessage(
          'Não consegui consultar o Gemini agora. Vou responder com fallback.'
        );
        const fallbackMessage: ChatMessage = {
          role: 'model',
          text: FALLBACK_REPLY,
        };
        setLastAssistantReply(FALLBACK_REPLY);
        setMessages((previous) => [...previous, fallbackMessage]);
        speakText(FALLBACK_REPLY);
      }
    },
    [speakText]
  );

  const ensureRecognition = useCallback(() => {
    if (recognitionRef.current) {
      return recognitionRef.current;
    }

    if (typeof window === 'undefined') {
      return null;
    }

    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      return null;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = 'pt-BR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onresult = (event: any) => {
      hasRecognitionResultRef.current = true;
      const transcript = event.results?.[0]?.[0]?.transcript?.trim() ?? '';

      if (transcript) {
        void askGemini(transcript);
      } else {
        setVoiceState('idle');
      }
    };

    recognition.onerror = () => {
      setErrorMessage('Não consegui ouvir com clareza. Tente falar novamente.');
      setVoiceState('idle');
    };

    recognition.onend = () => {
      if (!hasRecognitionResultRef.current && voiceStateRef.current === 'listening') {
        setVoiceState('idle');
      }
    };

    recognitionRef.current = recognition;
    return recognition;
  }, [askGemini]);

  const handleMainButton = useCallback(() => {
    if (voiceStateRef.current === 'thinking') {
      return;
    }

    if (voiceStateRef.current === 'speaking') {
      synthRef.current?.cancel();
      setVoiceState('idle');
      return;
    }

    const recognition = ensureRecognition();
    if (!recognition) {
      setErrorMessage(
        'Seu navegador não suporta reconhecimento de voz Web Speech API.'
      );
      return;
    }

    if (voiceStateRef.current === 'listening') {
      recognition.stop();
      setVoiceState('idle');
      return;
    }

    hasRecognitionResultRef.current = false;
    setErrorMessage('');
    setVoiceState('listening');
    window.speechSynthesis?.cancel();

    try {
      recognition.start();
    } catch {
      setErrorMessage(
        'Microfone indisponível. Verifique a permissão e tente novamente.'
      );
      setVoiceState('idle');
    }
  }, [ensureRecognition]);

  const isVisualizerActive = useMemo(
    () => voiceState === 'listening' || voiceState === 'speaking',
    [voiceState]
  );

  return (
    <main className='enigma-shell' id='main-content'>
      <div className='enigma-grid' aria-hidden='true' />

      <header className='enigma-header'>
        <h1 className='enigma-logo' data-text='ENIGMA'>
          ENIGMA
        </h1>
        <p className='enigma-subtitle'>Voz sintética. Mente afiada. Mistério calculado.</p>
      </header>

      <section className='enigma-core'>
        <div className={`ring-layer ring-layer--outer state-${voiceState}`} />
        <div className={`ring-layer ring-layer--inner state-${voiceState}`} />

        <button
          type='button'
          className={`enigma-button state-${voiceState}`}
          onClick={handleMainButton}
          aria-label={STATE_LABEL[voiceState]}
        >
          {voiceState === 'idle' && <Mic size={40} />}
          {voiceState === 'listening' && <AudioLines size={40} />}
          {voiceState === 'thinking' && <Loader2 size={40} className='icon-spin' />}
          {voiceState === 'speaking' && <Volume2 size={40} />}
        </button>

        <div
          className={`audio-visualizer ${isVisualizerActive ? 'active' : ''}`}
          aria-hidden='true'
        >
          {Array.from({ length: 18 }).map((_, index) => (
            <span
              key={`bar-${index}`}
              style={{ animationDelay: `${index * 0.07}s` }}
            />
          ))}
        </div>

        <p className='status-label'>{STATE_LABEL[voiceState]}</p>
      </section>

      <section className='dialog-panel' aria-live='polite'>
        <article className='dialog-item'>
          <h2>VOCÊ</h2>
          <p>{lastUserInput || 'Aguardando sua voz...'}</p>
        </article>
        <article className='dialog-item'>
          <h2>ENIGMA</h2>
          <p>{lastAssistantReply || 'No silêncio, preparo a próxima resposta.'}</p>
        </article>
        {errorMessage ? <p className='error-text'>{errorMessage}</p> : null}
      </section>
    </main>
  );
}
