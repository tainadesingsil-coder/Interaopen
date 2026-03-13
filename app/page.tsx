'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ShaderAnimation } from '@/app/components/ShaderAnimation';

declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

type AssistantState =
  | 'booting'
  | 'listening'
  | 'thinking'
  | 'speaking'
  | 'offline';
type MessageRole = 'user' | 'model';

interface ChatMessage {
  role: MessageRole;
  text: string;
}

const SYSTEM_PROMPT = `Você é o ENIGMA, um assistente digital extremamente competente, no estilo JARVIS.
Responda sempre em português brasileiro.
Seja objetivo, técnico quando necessário e confiante.
Não use markdown, bullets ou listas.
Suas respostas serão lidas em voz alta: use no máximo 2 frases curtas e fortes.
Se o usuário cumprimentar, responda de forma natural considerando o horário local informado no contexto.
Sempre chame o usuário de Estrela da Manhã.`;

const GEMINI_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
const STORAGE_KEY = 'enigma_messages_v2';
const BOOT_STORAGE_KEY = 'enigma_booted_v2';
const STAR_TITLE = 'Estrela da Manhã';
const FALLBACK_REPLY =
  'Estrela da Manhã, há instabilidade no núcleo agora. Repita em alguns segundos.';
const FALLBACK_PUBLIC_GEMINI_KEY = 'AIzaSyAvso1Z2xzjp7jt5E-keW8BNaLga0jQYnA';

const STATE_LABEL: Record<AssistantState, string> = {
  booting: 'Inicializando...',
  listening: 'Pronto para você.',
  thinking: 'Pensando...',
  speaking: 'Respondendo...',
  offline: 'Toque para reativar.',
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

const getTemporalContext = () => {
  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 12 ? 'bom dia' : hour < 18 ? 'boa tarde' : 'boa noite';
  const time = now.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const date = now.toLocaleDateString('pt-BR');

  return `Contexto temporal: hoje é ${date}, agora são ${time}. Saudação recomendada: ${greeting}.`;
};

const getBootMessage = () => {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
  return `${greeting}, ${STAR_TITLE}. ENIGMA online em modo de voz natural.`;
};

export default function HomePage() {
  const [assistantState, setAssistantState] = useState<AssistantState>('booting');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  const synthRef = useRef<SpeechSynthesis | null>(null);
  const recognitionRef = useRef<any>(null);
  const gotResultRef = useRef(false);
  const stateRef = useRef<AssistantState>('booting');
  const shouldAutoListenRef = useRef(true);
  const messagesRef = useRef<ChatMessage[]>([]);
  const restartTimerRef = useRef<number | null>(null);
  const lastRecognitionStartRef = useRef(0);

  useEffect(() => {
    stateRef.current = assistantState;
  }, [assistantState]);

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

    return () => {
      shouldAutoListenRef.current = false;
      if (restartTimerRef.current) {
        window.clearTimeout(restartTimerRef.current);
      }
      recognitionRef.current?.stop?.();
      window.speechSynthesis?.cancel();
    };
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  const startListening = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition || !shouldAutoListenRef.current) {
      return;
    }

    if (
      stateRef.current === 'thinking' ||
      stateRef.current === 'speaking' ||
      stateRef.current === 'offline'
    ) {
      return;
    }

    const now = Date.now();
    if (now - lastRecognitionStartRef.current < 650) {
      return;
    }

    try {
      lastRecognitionStartRef.current = now;
      recognition.start();
      setErrorMessage('');
      setAssistantState('listening');
    } catch {
      // Recognition can throw if start is called while already active.
    }
  }, []);

  const scheduleListeningRestart = useCallback(
    (delay = 260) => {
      if (typeof window === 'undefined') {
        return;
      }
      if (restartTimerRef.current) {
        window.clearTimeout(restartTimerRef.current);
      }
      restartTimerRef.current = window.setTimeout(() => {
        startListening();
      }, delay);
    },
    [startListening]
  );

  const pickPremiumVoice = useCallback((voices: SpeechSynthesisVoice[]) => {
    const rankedCandidates = [
      'google português do brasil',
      'microsoft antonio',
      'microsoft francisca',
      'luciana',
      'portuguese (brazil)',
      'pt-br',
    ];

    const normalizedVoices = voices.map((voice) => ({
      voice,
      name: voice.name.toLowerCase(),
      lang: voice.lang.toLowerCase(),
    }));

    for (const candidate of rankedCandidates) {
      const match = normalizedVoices.find(
        (item) => item.name.includes(candidate) || item.lang.includes(candidate)
      );
      if (match) {
        return match.voice;
      }
    }

    return normalizedVoices.find((item) => item.lang.startsWith('pt'))?.voice ?? null;
  }, []);

  const speakText = useCallback(
    (text: string, options?: { isBoot?: boolean; resumeListening?: boolean }) => {
      if (typeof window === 'undefined') {
        return;
      }

      const synth = synthRef.current ?? window.speechSynthesis;
      if (!synth) {
        setAssistantState('offline');
        return;
      }

      synth.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      utterance.rate = 0.95;
      utterance.pitch = 0.86;
      utterance.volume = 1;

      const voice = pickPremiumVoice(synth.getVoices());
      if (voice) {
        utterance.voice = voice;
      }

      utterance.onstart = () => {
        setAssistantState('speaking');
      };

      utterance.onend = () => {
        if (options?.isBoot && typeof window !== 'undefined') {
          window.sessionStorage.setItem(BOOT_STORAGE_KEY, '1');
        }
        setAssistantState('listening');
        if (options?.resumeListening) {
          scheduleListeningRestart(180);
        }
      };

      utterance.onerror = () => {
        setAssistantState('listening');
        if (options?.resumeListening) {
          scheduleListeningRestart(260);
        }
      };

      setAssistantState('speaking');
      synth.speak(utterance);
    },
    [pickPremiumVoice, scheduleListeningRestart]
  );

  const askGemini = useCallback(
    async (inputText: string) => {
      const apiKey =
        process.env.NEXT_PUBLIC_GEMINI_API_KEY || FALLBACK_PUBLIC_GEMINI_KEY;
      const cleanedInput = inputText.trim();
      if (!cleanedInput) {
        startListening();
        return;
      }

      if (!apiKey) {
        const missingKeyReply = withStarTitle(
          'A chave do oráculo não foi encontrada. Defina NEXT_PUBLIC_GEMINI_API_KEY.'
        );
        setErrorMessage(missingKeyReply);
        setMessages((previous) => [
          ...previous,
          { role: 'user', text: cleanedInput },
          { role: 'model', text: missingKeyReply },
        ]);
        speakText(missingKeyReply, { resumeListening: true });
        return;
      }

      setErrorMessage('');
      setAssistantState('thinking');
      const userMessage: ChatMessage = { role: 'user', text: cleanedInput };
      const conversation: ChatMessage[] = [...messagesRef.current, userMessage];
      setMessages(conversation);

      try {
        const temporalContext = getTemporalContext();
        const response = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: SYSTEM_PROMPT }, { text: temporalContext }],
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
        setMessages((previous) => [...previous, { role: 'model', text: decoratedReply }]);
        speakText(decoratedReply, { resumeListening: true });
      } catch {
        setErrorMessage('Falha ao consultar o Gemini. Resposta de contingência ativada.');
        const fallback = withStarTitle(FALLBACK_REPLY);
        setMessages((previous) => [...previous, { role: 'model', text: fallback }]);
        speakText(fallback, { resumeListening: true });
      }
    },
    [speakText, startListening]
  );

  const setupRecognition = useCallback(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    const RecognitionCtor =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!RecognitionCtor) {
      setErrorMessage('Seu navegador não suporta reconhecimento de voz contínuo.');
      setAssistantState('offline');
      return false;
    }

    const recognition = new RecognitionCtor();
    recognition.lang = 'pt-BR';
    recognition.interimResults = false;
    recognition.continuous = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setAssistantState('listening');
    };

    recognition.onresult = (event: any) => {
      if (stateRef.current === 'thinking' || stateRef.current === 'speaking') {
        return;
      }
      gotResultRef.current = true;
      const transcript = event.results?.[0]?.[0]?.transcript?.trim() ?? '';
      if (transcript) {
        setErrorMessage('');
        recognition.stop();
        void askGemini(transcript);
      } else {
        scheduleListeningRestart(280);
      }
    };

    recognition.onerror = (event: any) => {
      const code = event?.error;

      if (code === 'aborted' || code === 'no-speech') {
        if (
          shouldAutoListenRef.current &&
          stateRef.current !== 'thinking' &&
          stateRef.current !== 'speaking' &&
          stateRef.current !== 'offline'
        ) {
          setErrorMessage('');
          scheduleListeningRestart(code === 'aborted' ? 520 : 760);
        }
        return;
      }

      if (code === 'network') {
        setErrorMessage('Rede instável no reconhecimento de voz. Tentando novamente...');
        if (shouldAutoListenRef.current) {
          scheduleListeningRestart(1300);
        }
        return;
      }

      if (code === 'not-allowed') {
        setErrorMessage('Permita o microfone para conversa natural com ENIGMA.');
        setAssistantState('offline');
        shouldAutoListenRef.current = false;
        return;
      }

      if (code === 'audio-capture') {
        setErrorMessage('Microfone não detectado. Verifique o dispositivo.');
        setAssistantState('offline');
        shouldAutoListenRef.current = false;
        return;
      }

      setErrorMessage('Oscilação na captura de voz. Reiniciando escuta...');

      if (shouldAutoListenRef.current) {
        scheduleListeningRestart(880);
      }
    };

    recognition.onend = () => {
      if (gotResultRef.current) {
        gotResultRef.current = false;
        return;
      }

      if (
        shouldAutoListenRef.current &&
        stateRef.current !== 'thinking' &&
        stateRef.current !== 'speaking' &&
        stateRef.current !== 'offline'
      ) {
        scheduleListeningRestart(340);
      }
    };

    recognitionRef.current = recognition;
    return true;
  }, [askGemini, scheduleListeningRestart]);

  const activateVoiceMode = useCallback(async () => {
    if (typeof window === 'undefined') {
      return;
    }

    shouldAutoListenRef.current = true;
    setErrorMessage('');
    setAssistantState('booting');

    const configured = setupRecognition();
    if (!configured) {
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setErrorMessage('Navegador sem suporte para acesso ao microfone.');
      setAssistantState('offline');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
    } catch {
      setErrorMessage('Permissão de microfone negada. Toque para tentar novamente.');
      setAssistantState('offline');
      shouldAutoListenRef.current = false;
      return;
    }

    const alreadyBooted = window.sessionStorage.getItem(BOOT_STORAGE_KEY);
    if (!alreadyBooted) {
      const bootText = withStarTitle(getBootMessage());
      setMessages((previous) => {
        if (previous.some((message) => message.text === bootText)) {
          return previous;
        }
        return [...previous, { role: 'model', text: bootText }];
      });
      speakText(bootText, { isBoot: true, resumeListening: true });
      return;
    }

    setAssistantState('listening');
    scheduleListeningRestart(240);
  }, [scheduleListeningRestart, setupRecognition, speakText]);

  useEffect(() => {
    void activateVoiceMode();
  }, [activateVoiceMode]);

  const latestMessages = useMemo(() => messages.slice(-6), [messages]);

  return (
    <main className='enigma-shell' id='main-content'>
      <div className='shader-stage' aria-hidden='true'>
        <ShaderAnimation />
      </div>
      <div className='jarvis-grid' aria-hidden='true' />

      <div className='enigma-front'>
        <header className='enigma-header'>
          <h1 className='enigma-logo'>ENIGMA</h1>
          <p className='enigma-subtitle'>Assistente natural de voz.</p>
        </header>

        <section className='status-shell'>
          <div className={`status-dot state-${assistantState}`} aria-hidden='true' />
          <p className='status-label'>{STATE_LABEL[assistantState]}</p>
        </section>

        <section className='dialog-panel' aria-live='polite'>
          {latestMessages.length === 0 ? (
            <article className='dialog-item model'>
              <h2>ENIGMA</h2>
              <p>Sincronizando protocolo de voz inteligente.</p>
            </article>
          ) : (
            latestMessages.map((message, index) => (
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

        <p className='helper-text'>
          Sem digitação e sem botão de microfone. Fale naturalmente.
        </p>

        {errorMessage ? <p className='error-text'>{errorMessage}</p> : null}

        {assistantState === 'offline' ? (
          <button
            type='button'
            className='reactivate-button'
            onClick={() => void activateVoiceMode()}
          >
            Reativar voz
          </button>
        ) : null}
      </div>
    </main>
  );
}
