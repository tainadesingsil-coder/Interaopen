const SOURCE_TIMEOUT_MS = 12000;
const GOOGLE_SPEECH_ENDPOINT = 'https://speech.googleapis.com/v1/speech:recognize';
const GOOGLE_TRANSLATE_V2_ENDPOINT = 'https://translation.googleapis.com/language/translate/v2';
const FALLBACK_GOOGLE_TRANSLATE_API_KEY = 'AIzaSyCeX1cIN_MQdjE6GMN32jzfxi5ha7V21NA';
const FALLBACK_GOOGLE_SPEECH_API_KEY = 'AIzaSyCeX1cIN_MQdjE6GMN32jzfxi5ha7V21NA';

const DEFAULT_USER_AGENT =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

const fetchWithTimeout = async (url, init = {}, timeoutMs = SOURCE_TIMEOUT_MS) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        'user-agent': DEFAULT_USER_AGENT,
        ...(init.headers || {}),
      },
    });
  } finally {
    clearTimeout(timer);
  }
};

const htmlDecode = (value = '') =>
  String(value || '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number.parseInt(code, 10)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(Number.parseInt(code, 16)))
    .trim();

const safeText = (value = '', limit = 900) => htmlDecode(String(value || '').replace(/\s+/g, ' ').trim()).slice(0, limit);

const getApiKey = (env = {}, keyName, fallback = '') =>
  String(env?.[keyName] || fallback || '').trim();

const speechConfigFromMimeType = (mimeType = '') => {
  const normalized = String(mimeType || '').toLowerCase();
  if (normalized.includes('webm') && normalized.includes('opus')) {
    return { encoding: 'WEBM_OPUS', sampleRateHertz: 48000 };
  }
  if (normalized.includes('ogg') && normalized.includes('opus')) {
    return { encoding: 'OGG_OPUS', sampleRateHertz: 48000 };
  }
  if (normalized.includes('mpeg') || normalized.includes('mp3')) {
    return { encoding: 'MP3', sampleRateHertz: 44100 };
  }
  return { encoding: 'WEBM_OPUS', sampleRateHertz: 48000 };
};

const transcribeAudioChunk = async ({ apiKey, audioBase64, mimeType, languageHint = 'en-US' }) => {
  const endpoint = `${GOOGLE_SPEECH_ENDPOINT}?key=${encodeURIComponent(apiKey)}`;
  const speechConfig = speechConfigFromMimeType(mimeType);
  const payload = {
    config: {
      ...speechConfig,
      languageCode: languageHint,
      alternativeLanguageCodes: ['pt-BR', 'en-US'],
      enableAutomaticPunctuation: true,
      model: 'latest_short',
    },
    audio: {
      content: audioBase64,
    },
  };

  const response = await fetchWithTimeout(endpoint, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`speech_http_${response.status}:${details.slice(0, 180)}`);
  }

  const data = await response.json();
  const transcript =
    data?.results
      ?.map((result) => result?.alternatives?.[0]?.transcript || '')
      .join(' ')
      .trim() || '';

  return transcript;
};

const translateTextToPtBr = async ({ apiKey, text }) => {
  const endpoint = `${GOOGLE_TRANSLATE_V2_ENDPOINT}?key=${encodeURIComponent(apiKey)}`;
  const response = await fetchWithTimeout(endpoint, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      q: text,
      target: 'pt',
      format: 'text',
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`translate_http_${response.status}:${details.slice(0, 180)}`);
  }

  const data = await response.json();
  const translation = data?.data?.translations?.[0] || {};
  return {
    translatedText: safeText(translation.translatedText || text, 1200),
    detectedLanguage: String(translation.detectedSourceLanguage || '').toLowerCase() || null,
  };
};

export async function onRequestPost(context) {
  try {
    const speechApiKey = getApiKey(context.env, 'GOOGLE_SPEECH_API_KEY', FALLBACK_GOOGLE_SPEECH_API_KEY);
    const translateApiKey = getApiKey(
      context.env,
      'GOOGLE_TRANSLATE_API_KEY',
      FALLBACK_GOOGLE_TRANSLATE_API_KEY
    );

    if (!speechApiKey || !translateApiKey) {
      return Response.json(
        { ok: false, error: 'missing_google_api_key' },
        { status: 500, headers: { 'cache-control': 'no-store' } }
      );
    }

    const body = await context.request.json();
    const audioBase64 = String(body?.audioBase64 || '').trim();
    const mimeType = String(body?.mimeType || 'audio/webm;codecs=opus').trim();
    const languageHint = String(body?.languageHint || 'en-US').trim();

    if (!audioBase64 || audioBase64.length < 40) {
      return Response.json(
        { ok: false, error: 'missing_audio_chunk' },
        { status: 400, headers: { 'cache-control': 'no-store' } }
      );
    }

    const transcript = safeText(
      await transcribeAudioChunk({
        apiKey: speechApiKey,
        audioBase64,
        mimeType,
        languageHint,
      }),
      1200
    );

    if (!transcript) {
      return Response.json(
        { ok: true, transcript: '', translatedText: '', detectedLanguage: null },
        { headers: { 'cache-control': 'no-store' } }
      );
    }

    const translated = await translateTextToPtBr({
      apiKey: translateApiKey,
      text: transcript,
    });

    return Response.json(
      {
        ok: true,
        transcript,
        translatedText: translated.translatedText,
        detectedLanguage: translated.detectedLanguage,
      },
      {
        headers: { 'cache-control': 'no-store' },
      }
    );
  } catch (error) {
    return Response.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'transcription_failed',
      },
      { status: 500, headers: { 'cache-control': 'no-store' } }
    );
  }
}
