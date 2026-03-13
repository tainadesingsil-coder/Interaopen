'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
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
const GEMINI_TIMEOUT_MS = 12000;
const FALLBACK_PUBLIC_GEMINI_KEY = 'AIzaSyAvso1Z2xzjp7jt5E-keW8BNaLga0jQYnA';

const STATE_LABEL: Record<AssistantState, string> = {
  booting: 'Inicializando...',
  listening: 'Pronto para você.',
  thinking: 'Pensando...',
  speaking: 'Respondendo...',
  offline: 'Toque para reativar.',
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
  return `${greeting}, Estrela da Manhã. Quais instruções para agora?`;
};

const stripAccents = (value: string) =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const normalizeIntentText = (input: string) =>
  stripAccents(input.toLowerCase())
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const getLocalReply = (input: string) => {
  const normalized = normalizeIntentText(input);
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'bom dia' : hour < 18 ? 'boa tarde' : 'boa noite';

  if (
    normalized.includes('tudo bem') ||
    normalized.includes('como vai') ||
    normalized.includes('como você está') ||
    normalized.includes('como voce esta')
  ) {
    return 'Tudo sob controle. ENIGMA operacional e pronto para o seu próximo comando.';
  }

  if (
    normalized.includes('bom dia') ||
    normalized.includes('boa tarde') ||
    normalized.includes('boa noite')
  ) {
    return `${greeting}. Estou online e pronto para executar suas instruções.`;
  }

  if (
    normalized.includes('hora') ||
    normalized.includes('horas') ||
    normalized.includes('que horas') ||
    normalized.includes('horario')
  ) {
    const time = new Date().toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
    return `Agora são ${time}.`;
  }

  if (normalized.includes('data') || normalized.includes('dia de hoje')) {
    const date = new Date().toLocaleDateString('pt-BR');
    return `Hoje é ${date}.`;
  }

  if (
    normalized.includes('quem é você') ||
    normalized.includes('quem e voce') ||
    normalized.includes('o que você faz') ||
    normalized.includes('o que voce faz')
  ) {
    return 'Sou o ENIGMA, seu assistente de voz. Entendo comandos naturais e respondo com precisão.';
  }

  return 'Comando recebido. Posso continuar com a próxima instrução.';
};

const isLocalIntent = (input: string) => {
  const normalized = normalizeIntentText(input);
  return (
    normalized.includes('tudo bem') ||
    normalized.includes('como vai') ||
    normalized.includes('como voce esta') ||
    normalized.includes('bom dia') ||
    normalized.includes('boa tarde') ||
    normalized.includes('boa noite') ||
    normalized.includes('que horas') ||
    normalized.includes('hora') ||
    normalized.includes('horario') ||
    normalized.includes('data') ||
    normalized.includes('dia de hoje') ||
    normalized.includes('quem e voce') ||
    normalized.includes('o que voce faz')
  );
};

const normalizeSpokenInput = (input: string) => {
  return input
    .replace(/^[,.\s]+|[,.\s]+$/g, '')
    .replace(/^enigma[\s,:-]*/i, '')
    .replace(/\s+/g, ' ')
    .trim();
};

const fetchWithTimeout = async (
  url: string,
  init: RequestInit,
  timeoutMs: number
) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
};

const WEATHER_CODE_MAP: Record<number, string> = {
  0: 'céu limpo',
  1: 'predomínio de sol',
  2: 'parcialmente nublado',
  3: 'nublado',
  45: 'neblina',
  48: 'névoa úmida',
  51: 'garoa fraca',
  53: 'garoa moderada',
  55: 'garoa intensa',
  56: 'garoa congelante fraca',
  57: 'garoa congelante intensa',
  61: 'chuva fraca',
  63: 'chuva moderada',
  65: 'chuva forte',
  66: 'chuva congelante fraca',
  67: 'chuva congelante forte',
  71: 'neve fraca',
  73: 'neve moderada',
  75: 'neve forte',
  77: 'grãos de neve',
  80: 'pancadas de chuva fracas',
  81: 'pancadas de chuva moderadas',
  82: 'pancadas de chuva fortes',
  85: 'pancadas de neve fracas',
  86: 'pancadas de neve fortes',
  95: 'trovoadas',
  96: 'trovoadas com granizo fraco',
  99: 'trovoadas com granizo forte',
};

const isTimeIntent = (input: string) => {
  const normalized = normalizeIntentText(input);
  return (
    normalized.includes('que horas') ||
    normalized.includes('hora') ||
    normalized.includes('horario')
  );
};

const isWeatherIntent = (input: string) => {
  const normalized = normalizeIntentText(input);
  if (isTimeIntent(input)) {
    return false;
  }
  return (
    normalized.includes('clima') ||
    normalized.includes('temperatura') ||
    normalized.includes('previsao') ||
    normalized.includes('chuva') ||
    normalized.includes('frio') ||
    normalized.includes('calor') ||
    normalized.includes('vento') ||
    normalized.includes('como ta o tempo') ||
    normalized.includes('como esta o tempo')
  );
};

const extractWeatherLocation = (input: string) => {
  const normalized = input.toLowerCase();
  if (normalized.includes('montes claros')) {
    return 'Montes Claros, Minas Gerais, Brasil';
  }

  const afterEm = normalized.match(/\bem\s+([a-zà-ú\s'-]{3,})/i);
  if (afterEm?.[1]) {
    const cleaned = afterEm[1]
      .replace(/\b(agora|hoje|amanhã|amanha|por favor)\b/gi, '')
      .trim();
    if (cleaned.length >= 3) {
      return cleaned;
    }
  }

  return 'Montes Claros, Minas Gerais, Brasil';
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

  useEffect(() => {
    if (!errorMessage || typeof window === 'undefined') {
      return;
    }
    const timer = window.setTimeout(() => {
      setErrorMessage('');
    }, 2200);
    return () => window.clearTimeout(timer);
  }, [errorMessage]);

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

  const getLiveWeatherReply = useCallback(async (input: string) => {
    try {
      const locationQuery = extractWeatherLocation(input);
      const geoUrl =
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          locationQuery
        )}&count=1&language=pt&format=json`;
      const geoResponse = await fetchWithTimeout(
        geoUrl,
        { method: 'GET' },
        GEMINI_TIMEOUT_MS
      );
      if (!geoResponse.ok) {
        return null;
      }

      const geoPayload = await geoResponse.json();
      const result = geoPayload?.results?.[0];
      if (!result) {
        return null;
      }

      const weatherUrl =
        `https://api.open-meteo.com/v1/forecast?latitude=${result.latitude}&longitude=${result.longitude}` +
        '&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m' +
        '&timezone=auto';
      const weatherResponse = await fetchWithTimeout(
        weatherUrl,
        { method: 'GET' },
        GEMINI_TIMEOUT_MS
      );
      if (!weatherResponse.ok) {
        return null;
      }

      const weatherPayload = await weatherResponse.json();
      const current = weatherPayload?.current;
      if (!current) {
        return null;
      }

      const condition =
        WEATHER_CODE_MAP[current.weather_code as number] ?? 'condições variáveis';
      const city = result.name as string;
      const region = result.admin1 ? `, ${result.admin1}` : '';

      return `Em ${city}${region}, agora está ${Math.round(
        current.temperature_2m
      )} graus, sensação de ${Math.round(
        current.apparent_temperature
      )} graus, com ${condition}.`;
    } catch {
      return null;
    }
  }, []);

  const askGemini = useCallback(
    async (inputText: string) => {
      const apiKey =
        process.env.NEXT_PUBLIC_GEMINI_API_KEY || FALLBACK_PUBLIC_GEMINI_KEY;
      const cleanedInput = normalizeSpokenInput(inputText);
      if (!cleanedInput) {
        startListening();
        return;
      }

      if (isLocalIntent(cleanedInput)) {
        const localReply = getLocalReply(cleanedInput);
        setErrorMessage('');
        setMessages((previous) => [
          ...previous,
          { role: 'user', text: cleanedInput },
          { role: 'model', text: localReply },
        ]);
        speakText(localReply, { resumeListening: true });
        return;
      }

      if (isWeatherIntent(cleanedInput)) {
        const weatherReply = await getLiveWeatherReply(cleanedInput);
        if (weatherReply) {
          setErrorMessage('');
          setMessages((previous) => [
            ...previous,
            { role: 'user', text: cleanedInput },
            { role: 'model', text: weatherReply },
          ]);
          speakText(weatherReply, { resumeListening: true });
          return;
        }
      }

      if (!apiKey) {
        const localReply = getLocalReply(cleanedInput);
        setErrorMessage('');
        setMessages((previous) => [
          ...previous,
          { role: 'user', text: cleanedInput },
          { role: 'model', text: localReply },
        ]);
        speakText(localReply, { resumeListening: true });
        return;
      }

      setErrorMessage('');
      setAssistantState('thinking');
      const userMessage: ChatMessage = { role: 'user', text: cleanedInput };
      const conversation: ChatMessage[] = [...messagesRef.current, userMessage];
      setMessages(conversation);

      try {
        const temporalContext = getTemporalContext();
        const response = await fetchWithTimeout(
          `${GEMINI_ENDPOINT}?key=${apiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              systemInstruction: {
                parts: [{ text: SYSTEM_PROMPT }, { text: temporalContext }],
              },
              generationConfig: {
                temperature: 0.7,
                topP: 0.9,
                maxOutputTokens: 180,
              },
              contents: conversation.map((message) => ({
                role: message.role,
                parts: [{ text: message.text }],
              })),
            }),
          },
          GEMINI_TIMEOUT_MS
        );

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

        setMessages((previous) => [...previous, { role: 'model', text: reply }]);
        speakText(reply, { resumeListening: true });
      } catch {
        const localReply = getLocalReply(cleanedInput);
        setErrorMessage('');
        setMessages((previous) => [...previous, { role: 'model', text: localReply }]);
        speakText(localReply, { resumeListening: true });
      }
    },
    [getLiveWeatherReply, speakText, startListening]
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
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setAssistantState('listening');
    };

    recognition.onresult = (event: any) => {
      if (stateRef.current === 'thinking' || stateRef.current === 'speaking') {
        return;
      }
      gotResultRef.current = true;
      const resultIndex = event.resultIndex ?? 0;
      const transcript =
        event.results?.[resultIndex]?.[0]?.transcript?.trim() ??
        event.results?.[0]?.[0]?.transcript?.trim() ??
        '';
      if (transcript) {
        setErrorMessage('');
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
        setErrorMessage('');
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

      setErrorMessage('');

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
      const bootText = getBootMessage();
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

  return (
    <main className='enigma-shell' id='main-content'>
      <div className='shader-stage' aria-hidden='true'>
        <ShaderAnimation />
      </div>
      <div className='jarvis-grid' aria-hidden='true' />

      <div className='enigma-front'>
        <header className='enigma-header'>
          <h1 className='enigma-logo'>ENIGMA</h1>
        </header>

        <section className='status-shell'>
          <div className={`status-dot state-${assistantState}`} aria-hidden='true' />
          <p className='status-label'>{STATE_LABEL[assistantState]}</p>
        </section>

        {assistantState === 'offline' ? (
          <button
            type='button'
            className='reactivate-button'
            onClick={() => void activateVoiceMode()}
          >
            Reativar voz
          </button>
        ) : null}

        {errorMessage ? <p className='error-text'>{errorMessage}</p> : null}
      </div>
    </main>
  );
}
