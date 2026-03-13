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
type CaptureMode = 'speech-recognition' | 'recorder' | 'none';
type MessageRole = 'user' | 'model';

interface ChatMessage {
  role: MessageRole;
  text: string;
}

const GEMINI_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
const STORAGE_KEY = 'enigma_messages_v4';
const BOOT_STORAGE_KEY = 'enigma_booted_v4';
const GEMINI_TIMEOUT_MS = 12000;
const RECORDER_WINDOW_MS = 4200;
const FALLBACK_PUBLIC_GEMINI_KEY = 'AIzaSyAvso1Z2xzjp7jt5E-keW8BNaLga0jQYnA';

const SYSTEM_PROMPT = `Você é o ENIGMA, um assistente digital avançado.
Responda em português do Brasil, curto e natural.
No máximo 2 frases.
Sem markdown e sem listas.`;

const WEATHER_CODE_MAP: Record<number, string> = {
  0: 'céu limpo',
  1: 'predomínio de sol',
  2: 'parcialmente nublado',
  3: 'nublado',
  45: 'neblina',
  48: 'névoa úmida',
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
  return `Hoje é ${date}, agora são ${time}. Saudação sugerida: ${greeting}.`;
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

const blobToBase64 = async (blob: Blob) => {
  const buffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
};

export default function HomePage() {
  const [assistantState, setAssistantState] = useState<AssistantState>('booting');
  const [errorMessage, setErrorMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const synthRef = useRef<SpeechSynthesis | null>(null);
  const messagesRef = useRef<ChatMessage[]>([]);
  const stateRef = useRef<AssistantState>('booting');
  const shouldListenRef = useRef(true);
  const captureModeRef = useRef<CaptureMode>('none');
  const cooldownStartRef = useRef(0);

  const recognitionRef = useRef<any>(null);
  const recognitionActiveRef = useRef(false);
  const lastHeardTextRef = useRef('');
  const recognitionFailuresRef = useRef(0);
  const recorderAvailableRef = useRef(false);
  const listeningStartedAtRef = useRef(0);

  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const recorderActiveRef = useRef(false);
  const recorderChunksRef = useRef<BlobPart[]>([]);

  const restartTimerRef = useRef<number | null>(null);
  const recordStopTimerRef = useRef<number | null>(null);
  const speechGuardRef = useRef<number | null>(null);
  const listeningWatchdogRef = useRef<number | null>(null);

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
    const timer = window.setTimeout(() => setErrorMessage(''), 2400);
    return () => window.clearTimeout(timer);
  }, [errorMessage]);

  const stopCapture = useCallback(() => {
    if (captureModeRef.current === 'speech-recognition') {
      try {
        recognitionRef.current?.stop?.();
      } catch {
        // ignore
      }
      return;
    }

    if (captureModeRef.current === 'recorder') {
      if (recordStopTimerRef.current) {
        window.clearTimeout(recordStopTimerRef.current);
      }
      if (recorderRef.current?.state === 'recording') {
        recorderRef.current.stop();
      }
    }
  }, []);

  const scheduleCapture = useCallback(
    (delay = 300) => {
      if (typeof window === 'undefined') {
        return;
      }
      if (restartTimerRef.current) {
        window.clearTimeout(restartTimerRef.current);
      }
      restartTimerRef.current = window.setTimeout(() => {
        if (!shouldListenRef.current) {
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
        if (now - cooldownStartRef.current < 600) {
          scheduleCapture(420);
          return;
        }

        if (captureModeRef.current === 'speech-recognition') {
          if (recognitionActiveRef.current) {
            return;
          }
          try {
            cooldownStartRef.current = now;
            recognitionRef.current?.start?.();
          } catch {
            scheduleCapture(650);
          }
          return;
        }

        if (captureModeRef.current === 'recorder') {
          if (!recorderRef.current || recorderActiveRef.current) {
            return;
          }
          try {
            recorderRef.current.start();
            recorderActiveRef.current = true;
            cooldownStartRef.current = now;
            recordStopTimerRef.current = window.setTimeout(() => {
              if (recorderRef.current?.state === 'recording') {
                recorderRef.current.stop();
              }
            }, RECORDER_WINDOW_MS);
          } catch {
            scheduleCapture(700);
          }
        }
      }, delay);
    },
    []
  );

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (listeningWatchdogRef.current) {
      window.clearInterval(listeningWatchdogRef.current);
    }

    listeningWatchdogRef.current = window.setInterval(() => {
      if (!shouldListenRef.current) {
        return;
      }
      if (stateRef.current !== 'listening') {
        return;
      }
      const elapsed = Date.now() - listeningStartedAtRef.current;
      if (elapsed > 9000) {
        stopCapture();
        scheduleCapture(120);
      }
    }, 1800) as unknown as number;

    return () => {
      if (listeningWatchdogRef.current) {
        window.clearInterval(listeningWatchdogRef.current);
      }
    };
  }, [scheduleCapture, stopCapture]);

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

      stopCapture();
      const synth = synthRef.current ?? window.speechSynthesis;
      if (!synth) {
        setAssistantState('offline');
        return;
      }

      if (speechGuardRef.current) {
        window.clearTimeout(speechGuardRef.current);
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
        if (speechGuardRef.current) {
          window.clearTimeout(speechGuardRef.current);
        }
        if (options?.boot) {
          window.sessionStorage.setItem(BOOT_STORAGE_KEY, '1');
        }
        setAssistantState('listening');
        if (options?.resume) {
          scheduleCapture(180);
        }
      };

      utterance.onerror = () => {
        if (speechGuardRef.current) {
          window.clearTimeout(speechGuardRef.current);
        }
        setAssistantState('listening');
        if (options?.resume) {
          scheduleCapture(300);
        }
      };

      setAssistantState('speaking');
      synth.speak(utterance);

      if (options?.resume) {
        speechGuardRef.current = window.setTimeout(() => {
          scheduleCapture(380);
        }, 10000);
      }
    },
    [pickVoice, scheduleCapture, stopCapture]
  );

  const getLiveWeather = useCallback(async (input: string) => {
    try {
      const location = extractWeatherLocation(input);
      const geoResponse = await fetchWithTimeout(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          location
        )}&count=1&language=pt&format=json`,
        { method: 'GET' },
        GEMINI_TIMEOUT_MS
      );
      if (!geoResponse.ok) {
        return null;
      }
      const geoPayload = await geoResponse.json();
      const place = geoPayload?.results?.[0];
      if (!place) {
        return null;
      }

      const weatherResponse = await fetchWithTimeout(
        `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}` +
          '&current=temperature_2m,apparent_temperature,weather_code&timezone=auto',
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
        scheduleCapture(260);
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
        const temporal = getTemporalContext();
        const response = await fetchWithTimeout(
          `${GEMINI_ENDPOINT}?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              systemInstruction: {
                parts: [{ text: SYSTEM_PROMPT }, { text: temporal }],
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
          throw new Error('gemini_not_ok');
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
    [getLiveWeather, scheduleCapture, speak]
  );

  const transcribeWithGemini = useCallback(
    async (blob: Blob) => {
      const apiKey =
        process.env.NEXT_PUBLIC_GEMINI_API_KEY || FALLBACK_PUBLIC_GEMINI_KEY;
      if (!apiKey) {
        return '';
      }

      try {
        const base64Audio = await blobToBase64(blob);
        const response = await fetchWithTimeout(
          `${GEMINI_ENDPOINT}?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [
                    {
                      text: 'Transcreva esse áudio em português do Brasil. Responda apenas com o texto transcrito. Se não houver fala, responda VAZIO.',
                    },
                    {
                      inline_data: {
                        mime_type: blob.type || 'audio/webm',
                        data: base64Audio,
                      },
                    },
                  ],
                },
              ],
            }),
          },
          GEMINI_TIMEOUT_MS
        );

        if (!response.ok) {
          return '';
        }

        const payload = await response.json();
        const text = payload?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';
        if (!text || normalizeText(text) === 'vazio') {
          return '';
        }
        return text;
      } catch {
        return '';
      }
    },
    []
  );

  const initSpeechRecognition = useCallback(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    const RecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!RecognitionCtor) {
      return false;
    }

    const recognition = new RecognitionCtor();
    recognition.lang = 'pt-BR';
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      recognitionActiveRef.current = true;
      listeningStartedAtRef.current = Date.now();
      setAssistantState('listening');
      setErrorMessage('');
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
        recognitionFailuresRef.current = 0;
        lastHeardTextRef.current = '';
        void askGemini(transcript);
      } else {
        scheduleCapture(320);
      }
    };

    recognition.onerror = (event: any) => {
      recognitionActiveRef.current = false;
      const code = event?.error;
      if (code === 'not-allowed') {
        if (recorderAvailableRef.current) {
          captureModeRef.current = 'recorder';
          setErrorMessage('Ajustando para modo de voz alternativo.');
          scheduleCapture(240);
          return;
        }
        return;
      }
      if (code === 'audio-capture') {
        if (recorderAvailableRef.current) {
          captureModeRef.current = 'recorder';
          setErrorMessage('Mudando para captura alternativa.');
          scheduleCapture(240);
          return;
        }
        return;
      }
      recognitionFailuresRef.current += 1;
      if (recognitionFailuresRef.current >= 3 && recorderAvailableRef.current) {
        captureModeRef.current = 'recorder';
        setErrorMessage('Ajustando captura para modo mais estável.');
        scheduleCapture(280);
        return;
      }
      if (shouldListenRef.current) {
        scheduleCapture(code === 'no-speech' ? 520 : 700);
      }
    };

    recognition.onend = () => {
      recognitionActiveRef.current = false;
      if (lastHeardTextRef.current) {
        const text = lastHeardTextRef.current;
        lastHeardTextRef.current = '';
        void askGemini(text);
        return;
      }
      if (
        shouldListenRef.current &&
        stateRef.current !== 'thinking' &&
        stateRef.current !== 'speaking' &&
        stateRef.current !== 'offline'
      ) {
        scheduleCapture(360);
      }
    };

    recognitionRef.current = recognition;
    captureModeRef.current = 'speech-recognition';
    return true;
  }, [askGemini, scheduleCapture]);

  const initRecorderFallback = useCallback(async () => {
    if (!streamRef.current) {
      return false;
    }

    const preferredTypes = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/ogg',
    ];
    const mimeType = preferredTypes.find((type) => MediaRecorder.isTypeSupported(type));

    let recorder: MediaRecorder;
    try {
      recorder = mimeType
        ? new MediaRecorder(streamRef.current, { mimeType })
        : new MediaRecorder(streamRef.current);
    } catch {
      return false;
    }

    recorder.onstart = () => {
      recorderActiveRef.current = true;
      listeningStartedAtRef.current = Date.now();
      setAssistantState('listening');
      setErrorMessage('');
    };

    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        recorderChunksRef.current.push(event.data);
      }
    };

    recorder.onerror = () => {
      recorderActiveRef.current = false;
      if (shouldListenRef.current) {
        scheduleCapture(720);
      }
    };

    recorder.onstop = async () => {
      recorderActiveRef.current = false;
      if (recordStopTimerRef.current) {
        window.clearTimeout(recordStopTimerRef.current);
      }

      const blob = new Blob(recorderChunksRef.current, {
        type: recorder.mimeType || 'audio/webm',
      });
      recorderChunksRef.current = [];

      if (!shouldListenRef.current) {
        return;
      }

      if (
        stateRef.current === 'thinking' ||
        stateRef.current === 'speaking' ||
        stateRef.current === 'offline'
      ) {
        scheduleCapture(320);
        return;
      }

      if (blob.size < 3000) {
        scheduleCapture(320);
        return;
      }

      const transcript = await transcribeWithGemini(blob);
      if (transcript) {
        void askGemini(transcript);
      } else {
        scheduleCapture(340);
      }
    };

    recorderRef.current = recorder;
    recorderAvailableRef.current = true;
    return true;
  }, [askGemini, scheduleCapture, transcribeWithGemini]);

  const activate = useCallback(async () => {
    if (typeof window === 'undefined') {
      return;
    }

    shouldListenRef.current = true;
    setErrorMessage('');
    setAssistantState('booting');
    captureModeRef.current = 'none';
    recorderAvailableRef.current = false;

    if (!navigator.mediaDevices?.getUserMedia) {
      setAssistantState('offline');
      setErrorMessage('Navegador sem suporte para microfone.');
      return;
    }

    try {
      if (!streamRef.current) {
        streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      }
    } catch {
      shouldListenRef.current = false;
      setAssistantState('offline');
      setErrorMessage('Permissão de microfone negada.');
      return;
    }

    const speechReady = initSpeechRecognition();
    const recorderReady = await initRecorderFallback();

    if (!speechReady && !recorderReady) {
      setAssistantState('offline');
      setErrorMessage('Não consegui ativar a captura de voz neste navegador.');
      return;
    }

    captureModeRef.current = speechReady ? 'speech-recognition' : 'recorder';

    const booted = window.sessionStorage.getItem(BOOT_STORAGE_KEY);
    if (!booted) {
      const bootText = getBootMessage();
      setMessages((prev) => [...prev, { role: 'model', text: bootText }]);
      speak(bootText, { boot: true, resume: true });
      return;
    }

    setAssistantState('listening');
    scheduleCapture(180);
  }, [initRecorderFallback, initSpeechRecognition, scheduleCapture, speak]);

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

    const onGesture = () => {
      if (stateRef.current === 'offline') {
        void activate();
        return;
      }
      if (
        stateRef.current !== 'thinking' &&
        stateRef.current !== 'speaking' &&
        shouldListenRef.current
      ) {
        scheduleCapture(20);
      }
    };

    window.addEventListener('pointerdown', onGesture);

    return () => {
      shouldListenRef.current = false;
      window.removeEventListener('pointerdown', onGesture);
      if (restartTimerRef.current) {
        window.clearTimeout(restartTimerRef.current);
      }
      if (recordStopTimerRef.current) {
        window.clearTimeout(recordStopTimerRef.current);
      }
      if (speechGuardRef.current) {
        window.clearTimeout(speechGuardRef.current);
      }
      if (listeningWatchdogRef.current) {
        window.clearTimeout(listeningWatchdogRef.current);
      }
      stopCapture();
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      window.speechSynthesis?.cancel();
    };
  }, [activate, scheduleCapture, stopCapture]);

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
