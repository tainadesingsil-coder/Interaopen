import { StatusBar } from 'expo-status-bar';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import * as Speech from 'expo-speech';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ShaderAnimation } from './components/ShaderAnimation';

type AssistantState = 'booting' | 'listening' | 'thinking' | 'speaking' | 'offline';
type MessageRole = 'user' | 'model';

interface ChatMessage {
  role: MessageRole;
  text: string;
}

const GEMINI_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
const BOOT_STORAGE_KEY = 'enigma_native_booted_v1';
const GEMINI_TIMEOUT_MS = 14000;
const RECORD_WINDOW_MS = 4200;
const MIN_AUDIO_BYTES = 2500;
const FALLBACK_PUBLIC_GEMINI_KEY = 'AIzaSyAvso1Z2xzjp7jt5E-keW8BNaFiw';

const SYSTEM_PROMPT = `Você é o ENIGMA, um assistente de voz altamente inteligente e natural.
Responda sempre em português do Brasil.
Seja direto, humano e preciso.
Sem markdown, sem listas.
No máximo 2 frases curtas por resposta.`;

const STATE_LABEL: Record<AssistantState, string> = {
  booting: 'Inicializando...',
  listening: 'Ouvindo você...',
  thinking: 'Pensando...',
  speaking: 'Respondendo...',
  offline: 'Toque para reativar',
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

const localReply = (input: string) => {
  const normalized = normalizeText(input);
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'bom dia' : hour < 18 ? 'boa tarde' : 'boa noite';

  if (
    normalized.includes('bom dia') ||
    normalized.includes('boa tarde') ||
    normalized.includes('boa noite')
  ) {
    return `${greeting}. Estou pronto para ajudar.`;
  }

  if (
    normalized.includes('que horas') ||
    normalized.includes('hora') ||
    normalized.includes('horario')
  ) {
    const time = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return `Agora são ${time}.`;
  }

  if (normalized.includes('data') || normalized.includes('dia de hoje')) {
    return `Hoje é ${now.toLocaleDateString('pt-BR')}.`;
  }

  if (
    normalized.includes('tudo bem') ||
    normalized.includes('como vai') ||
    normalized.includes('como voce esta')
  ) {
    return 'Tudo sob controle. ENIGMA operacional.';
  }

  return 'Comando recebido. Pode continuar.';
};

const WEATHER_CODE_MAP: Record<number, string> = {
  0: 'céu limpo',
  1: 'predomínio de sol',
  2: 'parcialmente nublado',
  3: 'nublado',
  61: 'chuva fraca',
  63: 'chuva moderada',
  65: 'chuva forte',
  80: 'pancadas de chuva fracas',
  81: 'pancadas de chuva moderadas',
  82: 'pancadas de chuva fortes',
  95: 'trovoadas',
};

const isWeatherIntent = (input: string) => {
  const normalized = normalizeText(input);
  return (
    normalized.includes('clima') ||
    normalized.includes('tempo') ||
    normalized.includes('temperatura') ||
    normalized.includes('previsao') ||
    normalized.includes('chuva')
  );
};

const extractWeatherLocation = (input: string) => {
  const normalized = normalizeText(input);
  if (normalized.includes('montes claros')) {
    return 'Montes Claros, Minas Gerais, Brasil';
  }

  const match = input.toLowerCase().match(/\bem\s+([a-zà-ú\s'-]{3,})/i);
  if (match?.[1]) {
    return match[1].trim();
  }
  return 'Montes Claros, Minas Gerais, Brasil';
};

const guessMimeType = (uri: string) => {
  const lower = uri.toLowerCase();
  if (lower.endsWith('.m4a') || lower.endsWith('.mp4')) {
    return 'audio/mp4';
  }
  if (lower.endsWith('.caf')) {
    return 'audio/x-caf';
  }
  return 'audio/webm';
};

const toBase64 = async (uri: string) => {
  return FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
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

export default function App() {
  const [assistantState, setAssistantState] = useState<AssistantState>('booting');
  const [statusMessage, setStatusMessage] = useState('Inicializando...');
  const [lastUser, setLastUser] = useState('');
  const [lastAssistant, setLastAssistant] = useState('');

  const apiKeyRef = useRef(
    process.env.EXPO_PUBLIC_GEMINI_API_KEY || FALLBACK_PUBLIC_GEMINI_KEY
  );
  const shouldRunRef = useRef(true);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const recordingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cycleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const processingRef = useRef(false);
  const speakingRef = useRef(false);
  const messagesRef = useRef<ChatMessage[]>([]);

  const clearTimers = useCallback(() => {
    if (recordingTimerRef.current) {
      clearTimeout(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (cycleTimerRef.current) {
      clearTimeout(cycleTimerRef.current);
      cycleTimerRef.current = null;
    }
  }, []);

  const scheduleNextListen = useCallback(
    (delay = 250) => {
      if (!shouldRunRef.current) {
        return;
      }
      if (cycleTimerRef.current) {
        clearTimeout(cycleTimerRef.current);
      }
      cycleTimerRef.current = setTimeout(() => {
        void startCaptureWindow();
      }, delay);
    },
    []
  );

  const setAudioModeForListening = useCallback(async () => {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
  }, []);

  const setAudioModeForSpeaking = useCallback(async () => {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
  }, []);

  const speakReply = useCallback(
    async (text: string) => {
      speakingRef.current = true;
      setAssistantState('speaking');
      setStatusMessage(STATE_LABEL.speaking);

      await setAudioModeForSpeaking();
      Speech.stop();

      Speech.speak(text, {
        language: 'pt-BR',
        rate: 0.95,
        pitch: 0.9,
        onDone: () => {
          speakingRef.current = false;
          if (!shouldRunRef.current) {
            return;
          }
          void setAudioModeForListening();
          setAssistantState('listening');
          setStatusMessage(STATE_LABEL.listening);
          scheduleNextListen(200);
        },
        onStopped: () => {
          speakingRef.current = false;
          if (!shouldRunRef.current) {
            return;
          }
          void setAudioModeForListening();
          scheduleNextListen(260);
        },
        onError: () => {
          speakingRef.current = false;
          if (!shouldRunRef.current) {
            return;
          }
          void setAudioModeForListening();
          scheduleNextListen(300);
        },
      });
    },
    [scheduleNextListen, setAudioModeForListening, setAudioModeForSpeaking]
  );

  const getLiveWeatherReply = useCallback(async (input: string) => {
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
      )} graus, com ${condition}.`;
    } catch {
      return null;
    }
  }, []);

  const askGemini = useCallback(
    async (inputText: string) => {
      const cleanedInput = normalizeSpokenInput(inputText);
      if (!cleanedInput) {
        scheduleNextListen(180);
        return;
      }

      setLastUser(cleanedInput);
      const userMessage: ChatMessage = { role: 'user', text: cleanedInput };

      if (isWeatherIntent(cleanedInput)) {
        setAssistantState('thinking');
        setStatusMessage(STATE_LABEL.thinking);
        const weatherReply = await getLiveWeatherReply(cleanedInput);
        if (weatherReply) {
          setLastAssistant(weatherReply);
          messagesRef.current = [
            ...messagesRef.current,
            userMessage,
            { role: 'model', text: weatherReply },
          ];
          await speakReply(weatherReply);
          return;
        }
      }

      const normalized = normalizeText(cleanedInput);
      if (
        normalized.includes('bom dia') ||
        normalized.includes('boa tarde') ||
        normalized.includes('boa noite') ||
        normalized.includes('que horas') ||
        normalized.includes('hora') ||
        normalized.includes('horario') ||
        normalized.includes('data') ||
        normalized.includes('dia de hoje') ||
        normalized.includes('tudo bem') ||
        normalized.includes('como vai')
      ) {
        const reply = localReply(cleanedInput);
        setLastAssistant(reply);
        messagesRef.current = [
          ...messagesRef.current,
          userMessage,
          { role: 'model', text: reply },
        ];
        await speakReply(reply);
        return;
      }

      if (!apiKeyRef.current) {
        const reply = localReply(cleanedInput);
        setLastAssistant(reply);
        messagesRef.current = [
          ...messagesRef.current,
          userMessage,
          { role: 'model', text: reply },
        ];
        await speakReply(reply);
        return;
      }

      setAssistantState('thinking');
      setStatusMessage(STATE_LABEL.thinking);
      const conversation = [...messagesRef.current, userMessage];
      messagesRef.current = conversation;

      try {
        const temporalContext = getTemporalContext();
        const response = await fetchWithTimeout(
          `${GEMINI_ENDPOINT}?key=${apiKeyRef.current}`,
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

        setLastAssistant(reply);
        messagesRef.current = [...messagesRef.current, { role: 'model', text: reply }];
        await speakReply(reply);
      } catch {
        const fallback = localReply(cleanedInput);
        setLastAssistant(fallback);
        messagesRef.current = [...messagesRef.current, { role: 'model', text: fallback }];
        await speakReply(fallback);
      }
    },
    [getLiveWeatherReply, scheduleNextListen, speakReply]
  );

  const transcribeAudio = useCallback(async (uri: string) => {
    if (!apiKeyRef.current) {
      return '';
    }

    try {
      const base64Audio = await toBase64(uri);
      const response = await fetchWithTimeout(
        `${GEMINI_ENDPOINT}?key=${apiKeyRef.current}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: 'Transcreva este áudio em português do Brasil. Responda apenas com a transcrição. Se não houver fala, responda VAZIO.',
                  },
                  {
                    inline_data: {
                      mime_type: guessMimeType(uri),
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
  }, []);

  const processCurrentRecording = useCallback(async () => {
    if (!recordingRef.current) {
      processingRef.current = false;
      scheduleNextListen(220);
      return;
    }

    let recordingUri = '';
    try {
      await recordingRef.current.stopAndUnloadAsync();
      recordingUri = recordingRef.current.getURI() ?? '';
    } catch {
      recordingUri = '';
    }
    recordingRef.current = null;

    if (!recordingUri) {
      processingRef.current = false;
      scheduleNextListen(260);
      return;
    }

    const info = await FileSystem.getInfoAsync(recordingUri);
    if (!info.exists || (typeof info.size === 'number' && info.size < MIN_AUDIO_BYTES)) {
      processingRef.current = false;
      scheduleNextListen(220);
      return;
    }

    setAssistantState('thinking');
    setStatusMessage(STATE_LABEL.thinking);

    const transcript = await transcribeAudio(recordingUri);
    if (!transcript) {
      processingRef.current = false;
      scheduleNextListen(240);
      return;
    }

    processingRef.current = false;
    await askGemini(transcript);
  }, [askGemini, scheduleNextListen, transcribeAudio]);

  const startCaptureWindow = useCallback(async () => {
    if (!shouldRunRef.current) {
      return;
    }
    if (processingRef.current || speakingRef.current) {
      scheduleNextListen(300);
      return;
    }

    try {
      setAssistantState('listening');
      setStatusMessage(STATE_LABEL.listening);
      await setAudioModeForListening();

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();
      recordingRef.current = recording;

      processingRef.current = true;
      if (recordingTimerRef.current) {
        clearTimeout(recordingTimerRef.current);
      }
      recordingTimerRef.current = setTimeout(() => {
        void processCurrentRecording();
      }, RECORD_WINDOW_MS);
    } catch {
      processingRef.current = false;
      scheduleNextListen(600);
    }
  }, [processCurrentRecording, scheduleNextListen, setAudioModeForListening]);

  const activateSession = useCallback(async () => {
    try {
      shouldRunRef.current = true;
      setAssistantState('booting');
      setStatusMessage(STATE_LABEL.booting);

      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        setAssistantState('offline');
        setStatusMessage(STATE_LABEL.offline);
        return;
      }

      const markerRoot = FileSystem.cacheDirectory ?? FileSystem.documentDirectory ?? '';
      if (!markerRoot) {
        setAssistantState('offline');
        setStatusMessage(STATE_LABEL.offline);
        return;
      }
      const bootMarkerPath = `${markerRoot}${BOOT_STORAGE_KEY}`;
      const hasBooted = await FileSystem.getInfoAsync(bootMarkerPath);
      if (!hasBooted.exists) {
        const bootMessage = getBootMessage();
        setLastAssistant(bootMessage);
        await FileSystem.writeAsStringAsync(bootMarkerPath, '1');
        await speakReply(bootMessage);
      } else {
        scheduleNextListen(150);
      }
    } catch {
      setAssistantState('offline');
      setStatusMessage(STATE_LABEL.offline);
    }
  }, [scheduleNextListen, speakReply]);

  useEffect(() => {
    messagesRef.current = [];
    void activateSession();

    return () => {
      shouldRunRef.current = false;
      clearTimers();
      Speech.stop();
      try {
        recordingRef.current?.stopAndUnloadAsync();
      } catch {
        // ignore
      }
    };
  }, [activateSession, clearTimers]);

  return (
    <View style={styles.container}>
      <View style={StyleSheet.absoluteFill}>
        <ShaderAnimation />
      </View>

      <View style={styles.overlayGrid} />

      <View style={styles.content}>
        <Text style={styles.logo}>ENIGMA</Text>
        <Text style={styles.state}>{statusMessage}</Text>

        <Text style={styles.hint}>Conversa fluida por voz (modo nativo).</Text>

        {lastUser ? <Text style={styles.userLine}>Você: {lastUser}</Text> : null}
        {lastAssistant ? <Text style={styles.assistantLine}>ENIGMA: {lastAssistant}</Text> : null}

        {assistantState === 'offline' ? (
          <Pressable style={styles.button} onPress={() => void activateSession()}>
            <Text style={styles.buttonText}>Reativar ENIGMA</Text>
          </Pressable>
        ) : null}
      </View>

      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020306',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  overlayGrid: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.2,
    borderColor: 'rgba(255,255,255,0.08)',
    borderWidth: 0.5,
  },
  content: {
    width: '100%',
    maxWidth: 460,
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    color: '#d8f3ff',
    fontSize: 50,
    fontWeight: '800',
    letterSpacing: 6,
  },
  state: {
    color: '#97d9ef',
    fontSize: 16,
    letterSpacing: 1.2,
  },
  hint: {
    color: '#7a9ba7',
    fontSize: 13,
    textAlign: 'center',
  },
  userLine: {
    marginTop: 12,
    color: '#bfe5f4',
    fontSize: 14,
    textAlign: 'center',
  },
  assistantLine: {
    color: '#e3f8ff',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 21,
  },
  button: {
    marginTop: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(31,208,255,0.45)',
    backgroundColor: 'rgba(4,24,34,0.8)',
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  buttonText: {
    color: '#d3f6ff',
    fontWeight: '700',
  },
});
