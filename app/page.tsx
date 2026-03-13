'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ShaderAnimation } from '@/app/components/ShaderAnimation';

declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

type AssistantState = 'booting' | 'listening' | 'thinking' | 'speaking' | 'offline';
type MessageRole = 'user' | 'model';

interface ChatMessage {
  role: MessageRole;
  text: string;
}

const GEMINI_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
const STORAGE_KEY = 'enigma_messages_v3';
const BOOT_STORAGE_KEY = 'enigma_booted_v3';
const GEMINI_TIMEOUT_MS = 12000;
const FALLBACK_PUBLIC_GEMINI_KEY = 'AIzaSyAvso1Z2xzjp7jt5E-keW8BNaLga0jQYnA';

const SYSTEM_PROMPT = `Você é o ENIGMA, um assistente digital avançado, natural e preciso.
Responda sempre em português do Brasil.
Fale de forma curta, humana e objetiva.
Sem markdown, sem listas.
No máximo 2 frases por resposta.`;

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
  61: 'chuva fraca',
  63: 'chuva moderada',
  65: 'chuva forte',
  80: 'pancadas de chuva fracas',
  81: 'pancadas de chuva moderadas',
  82: 'pancadas de chuva fortes',
  95: 'trovoadas',
};

const STATE_LABEL: Record<AssistantState, string> = {
  booting: 'Inicializando...',
  listening: 'Ouvindo você.',
  thinking: 'Pensando...',
  speaking: 'Respondendo...',
  offline: 'Toque para ativar.',
};

const stripAccents = (value: string) =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const normalizeText = (value: string) =>
  stripAccents(value.toLowerCase())
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const normalizeSpokenInput = (value: string) =>
  value
    .replace(/^[,.\s]+|[,.\s]+$/g, '')
    .replace(/^enigma[\s,:-]*/i, '')
    .replace(/\s+/g, ' ')
    .trim();

const getTemporalContext = () => {
  const now = new Date();
  const date = now.toLocaleDateString('pt-BR');
  const time = now.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const hour = now.getHours();
  const greeting = hour < 12 ? 'bom dia' : hour < 18 ? 'boa tarde' : 'boa noite';
  return `Hoje é ${date}, agora são ${time}. Saudação apropriada: ${greeting}.`;
};

const getBootMessage = () => {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
  return `${greeting}, Estrela da Manhã. Quais instruções para agora?`;
};

const isTimeIntent = (input: string) => {
  const text = normalizeText(input);
  return text.includes('que horas') || text.includes('hora') || text.includes('horario');
};

const isDateIntent = (input: string) => {
  const text = normalizeText(input);
  return text.includes('data') || text.includes('dia de hoje');
};

const isGreetingIntent = (input: string) => {
  const text = normalizeText(input);
  return text.includes('bom dia') || text.includes('boa tarde') || text.includes('boa noite');
};

const isStatusIntent = (input: string) => {
  const text = normalizeText(input);
  return (
    text.includes('tudo bem') ||
    text.includes('como vai') ||
    text.includes('como voce esta')
  );
};

const isIdentityIntent = (input: string) => {
  const text = normalizeText(input);
  return text.includes('quem e voce') || text.includes('o que voce faz');
};

const isWeatherIntent = (input: string) => {
  if (isTimeIntent(input)) {
    return false;
  }
  const text = normalizeText(input);
  return (
    text.includes('clima') ||
    text.includes('tempo') ||
    text.includes('temperatura') ||
    text.includes('previsao') ||
    text.includes('chuva') ||
    text.includes('frio') ||
    text.includes('calor') ||
    text.includes('vento')
  );
};

const extractWeatherLocation = (input: string) => {
  const text = normalizeText(input);
  if (text.includes('montes claros')) {
    return 'Montes Claros, Minas Gerais, Brasil';
  }

  const match = input.toLowerCase().match(/\bem\s+([a-zà-ú\s'-]{3,})/i);
  if (match?.[1]) {
    const cleaned = match[1]
      .replace(/\b(agora|hoje|amanha|amanhã|por favor)\b/gi, '')
      .trim();
    if (cleaned.length >= 3) {
      return cleaned;
    }
  }

  return 'Montes Claros, Minas Gerais, Brasil';
};

const localReply = (input: string) => {
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'bom dia' : hour < 18 ? 'boa tarde' : 'boa noite';

  if (isGreetingIntent(input)) {
    return `${greeting}. Estou pronto para ajudar.`;
  }

  if (isTimeIntent(input)) {
    const time = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return `Agora são ${time}.`;
  }

  if (isDateIntent(input)) {
    return `Hoje é ${now.toLocaleDateString('pt-BR')}.`;
  }

  if (isStatusIntent(input)) {
    return 'Tudo sob controle. ENIGMA operacional e atento a você.';
  }

  if (isIdentityIntent(input)) {
    return 'Sou o ENIGMA. Entendo sua fala e respondo de forma direta.';
  }

  return 'Comando recebido. Pode continuar.';
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

export default function HomePage() {
  const [assistantState, setAssistantState] = useState<AssistantState>('booting');
  const [errorMessage, setErrorMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const synthRef = useRef<SpeechSynthesis | null>(null);
  const recognitionRef = useRef<any>(null);
  const messagesRef = useRef<ChatMessage[]>([]);
  const shouldListenRef = useRef(true);
  const recognitionRunningRef = useRef(false);
  const restartTimerRef = useRef<number | null>(null);
  const startCooldownRef = useRef(0);
  const speakingGuardRef = useRef<number | null>(null);
  const stateRef = useRef<AssistantState>('booting');

  useEffect(() => {
    stateRef.current = assistantState;
  }, [assistantState]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

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

  const scheduleRestart = useCallback((delay = 320) => {
    if (typeof window === 'undefined') {
      return;
    }
    if (restartTimerRef.current) {
      window.clearTimeout(restartTimerRef.current);
    }
    restartTimerRef.current = window.setTimeout(() => {
      if (recognitionRef.current && shouldListenRef.current && !recognitionRunningRef.current) {
        try {
          recognitionRef.current.start();
        } catch {
          scheduleRestart(650);
        }
      }
    }, delay);
  }, []);

  const pickVoice = useCallback((voices: SpeechSynthesisVoice[]) => {
    const preferred = [
      'google português do brasil',
      'microsoft antonio',
      'microsoft francisca',
      'luciana',
      'pt-br',
    ];
    const mapped = voices.map((voice) => ({
      voice,
      name: voice.name.toLowerCase(),
      lang: voice.lang.toLowerCase(),
    }));

    for (const candidate of preferred) {
      const found = mapped.find(
        (item) => item.name.includes(candidate) || item.lang.includes(candidate)
      );
      if (found) {
        return found.voice;
      }
    }
    return mapped.find((item) => item.lang.startsWith('pt'))?.voice ?? null;
  }, []);

  const speak = useCallback(
    (text: string, options?: { boot?: boolean; resume?: boolean }) => {
      if (typeof window === 'undefined') {
        return;
      }
      const synth = synthRef.current ?? window.speechSynthesis;
      if (!synth) {
        setAssistantState('offline');
        return;
      }

      if (speakingGuardRef.current) {
        window.clearTimeout(speakingGuardRef.current);
      }

      synth.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      utterance.rate = 0.96;
      utterance.pitch = 0.88;
      utterance.volume = 1;

      const voice = pickVoice(synth.getVoices());
      if (voice) {
        utterance.voice = voice;
      }

      utterance.onstart = () => {
        setAssistantState('speaking');
      };

      utterance.onend = () => {
        if (speakingGuardRef.current) {
          window.clearTimeout(speakingGuardRef.current);
        }
        if (options?.boot) {
          window.sessionStorage.setItem(BOOT_STORAGE_KEY, '1');
        }
        setAssistantState('listening');
        if (options?.resume) {
          scheduleRestart(180);
        }
      };

      utterance.onerror = () => {
        if (speakingGuardRef.current) {
          window.clearTimeout(speakingGuardRef.current);
        }
        setAssistantState('listening');
        if (options?.resume) {
          scheduleRestart(280);
        }
      };

      setAssistantState('speaking');
      synth.speak(utterance);

      if (options?.resume) {
        speakingGuardRef.current = window.setTimeout(() => {
          scheduleRestart(360);
        }, 10000);
      }
    },
    [pickVoice, scheduleRestart]
  );

  const getLiveWeather = useCallback(async (input: string) => {
    try {
      const location = extractWeatherLocation(input);
      const geo = await fetchWithTimeout(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          location
        )}&count=1&language=pt&format=json`,
        { method: 'GET' },
        GEMINI_TIMEOUT_MS
      );
      if (!geo.ok) {
        return null;
      }

      const geoPayload = await geo.json();
      const place = geoPayload?.results?.[0];
      if (!place) {
        return null;
      }

      const weather = await fetchWithTimeout(
        `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}` +
          '&current=temperature_2m,apparent_temperature,weather_code&timezone=auto',
        { method: 'GET' },
        GEMINI_TIMEOUT_MS
      );
      if (!weather.ok) {
        return null;
      }

      const weatherPayload = await weather.json();
      const current = weatherPayload?.current;
      if (!current) {
        return null;
      }

      const condition =
        WEATHER_CODE_MAP[current.weather_code as number] ?? 'condições variáveis';
      const city = place.name as string;
      const region = place.admin1 ? `, ${place.admin1}` : '';

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
    async (input: string) => {
      const cleaned = normalizeSpokenInput(input);
      if (!cleaned) {
        scheduleRestart(260);
        return;
      }

      const userMessage: ChatMessage = { role: 'user', text: cleaned };

      if (
        isGreetingIntent(cleaned) ||
        isTimeIntent(cleaned) ||
        isDateIntent(cleaned) ||
        isStatusIntent(cleaned) ||
        isIdentityIntent(cleaned)
      ) {
        const reply = localReply(cleaned);
        setMessages((prev) => [...prev, userMessage, { role: 'model', text: reply }]);
        speak(reply, { resume: true });
        return;
      }

      if (isWeatherIntent(cleaned)) {
        setAssistantState('thinking');
        const weatherReply = await getLiveWeather(cleaned);
        if (weatherReply) {
          setMessages((prev) => [...prev, userMessage, { role: 'model', text: weatherReply }]);
          speak(weatherReply, { resume: true });
          return;
        }
      }

      const apiKey =
        process.env.NEXT_PUBLIC_GEMINI_API_KEY || FALLBACK_PUBLIC_GEMINI_KEY;
      if (!apiKey) {
        const reply = localReply(cleaned);
        setMessages((prev) => [...prev, userMessage, { role: 'model', text: reply }]);
        speak(reply, { resume: true });
        return;
      }

      setAssistantState('thinking');
      const conversation = [...messagesRef.current, userMessage];
      setMessages(conversation);

      try {
        const temporalContext = getTemporalContext();
        const response = await fetchWithTimeout(
          `${GEMINI_ENDPOINT}?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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
          throw new Error('gemini_error');
        }

        const payload = await response.json();
        const reply = payload?.candidates?.[0]?.content?.parts
          ?.map((part: { text?: string }) => part.text ?? '')
          .join(' ')
          .trim();

        if (!reply) {
          throw new Error('empty_reply');
        }

        setMessages((prev) => [...prev, { role: 'model', text: reply }]);
        speak(reply, { resume: true });
      } catch {
        const reply = localReply(cleaned);
        setMessages((prev) => [...prev, { role: 'model', text: reply }]);
        speak(reply, { resume: true });
      }
    },
    [getLiveWeather, scheduleRestart, speak]
  );

  const initRecognition = useCallback(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    const RecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!RecognitionCtor) {
      setAssistantState('offline');
      setErrorMessage('Seu navegador não suporta reconhecimento de voz.');
      return false;
    }

    const recognition = new RecognitionCtor();
    recognition.lang = 'pt-BR';
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      recognitionRunningRef.current = true;
      setErrorMessage('');
      setAssistantState('listening');
    };

    recognition.onresult = (event: any) => {
      const index = event.resultIndex ?? 0;
      const isFinal = event.results?.[index]?.isFinal ?? true;
      if (!isFinal) {
        return;
      }
      const transcript =
        event.results?.[index]?.[0]?.transcript?.trim() ??
        event.results?.[0]?.[0]?.transcript?.trim() ??
        '';
      if (transcript) {
        void askGemini(transcript);
      } else {
        scheduleRestart(300);
      }
    };

    recognition.onerror = (event: any) => {
      recognitionRunningRef.current = false;
      const code = event?.error;
      if (code === 'not-allowed') {
        shouldListenRef.current = false;
        setAssistantState('offline');
        setErrorMessage('Permita o microfone para continuar.');
        return;
      }

      if (code === 'audio-capture') {
        shouldListenRef.current = false;
        setAssistantState('offline');
        setErrorMessage('Microfone não detectado.');
        return;
      }

      if (shouldListenRef.current) {
        scheduleRestart(code === 'no-speech' ? 520 : 760);
      }
    };

    recognition.onend = () => {
      recognitionRunningRef.current = false;
      if (
        shouldListenRef.current &&
        stateRef.current !== 'thinking' &&
        stateRef.current !== 'speaking' &&
        stateRef.current !== 'offline'
      ) {
        scheduleRestart(340);
      }
    };

    recognitionRef.current = recognition;
    return true;
  }, [askGemini, scheduleRestart]);

  const activate = useCallback(async () => {
    if (typeof window === 'undefined') {
      return;
    }

    shouldListenRef.current = true;
    setErrorMessage('');
    setAssistantState('booting');

    if (!navigator.mediaDevices?.getUserMedia) {
      setAssistantState('offline');
      setErrorMessage('Navegador sem suporte para microfone.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
    } catch {
      shouldListenRef.current = false;
      setAssistantState('offline');
      setErrorMessage('Permissão de microfone negada.');
      return;
    }

    const ok = initRecognition();
    if (!ok) {
      return;
    }

    const booted = window.sessionStorage.getItem(BOOT_STORAGE_KEY);
    if (!booted) {
      const text = getBootMessage();
      setMessages((prev) => [...prev, { role: 'model', text: text }]);
      speak(text, { boot: true, resume: true });
      return;
    }

    scheduleRestart(200);
  }, [initRecognition, scheduleRestart, speak]);

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

    void activate();

    const onFirstGesture = () => {
      if (stateRef.current === 'offline') {
        void activate();
      }
    };

    window.addEventListener('pointerdown', onFirstGesture);

    return () => {
      shouldListenRef.current = false;
      window.removeEventListener('pointerdown', onFirstGesture);
      if (restartTimerRef.current) {
        window.clearTimeout(restartTimerRef.current);
      }
      if (speakingGuardRef.current) {
        window.clearTimeout(speakingGuardRef.current);
      }
      recognitionRef.current?.stop?.();
      window.speechSynthesis?.cancel();
    };
  }, [activate]);

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
            onClick={() => void activate()}
          >
            Reativar voz
          </button>
        ) : null}

        {errorMessage ? <p className='error-text'>{errorMessage}</p> : null}
      </div>
    </main>
  );
}
