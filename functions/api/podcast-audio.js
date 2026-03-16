const SOURCE_TIMEOUT_MS = 15000;
const AUDIO_HOST_ALLOWLIST = new Set([
  'mcdn.podbean.com',
  'traffic.megaphone.fm',
  'media.blubrry.com',
  'ins.blubrry.com',
  'cdn.simplecast.com',
  'feeds.soundcloud.com',
]);

const DEFAULT_USER_AGENT =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

const fetchWithTimeout = async (url, init = {}, timeoutMs = SOURCE_TIMEOUT_MS) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
};

const isAllowedHost = (hostname = '') => {
  const normalized = String(hostname || '').toLowerCase().replace(/^www\./, '');
  if (AUDIO_HOST_ALLOWLIST.has(normalized)) return true;
  // Allow known subdomains from trusted providers.
  return (
    normalized.endsWith('.podbean.com') ||
    normalized.endsWith('.megaphone.fm') ||
    normalized.endsWith('.blubrry.com') ||
    normalized.endsWith('.simplecast.com')
  );
};

export async function onRequestGet(context) {
  const requestUrl = new URL(context.request.url);
  const targetRaw = requestUrl.searchParams.get('url') || '';
  if (!targetRaw) {
    return new Response('missing_audio_url', {
      status: 400,
      headers: { 'cache-control': 'no-store' },
    });
  }

  let target;
  try {
    target = new URL(targetRaw);
  } catch {
    return new Response('invalid_audio_url', {
      status: 400,
      headers: { 'cache-control': 'no-store' },
    });
  }

  if (!['https:', 'http:'].includes(target.protocol)) {
    return new Response('invalid_audio_protocol', {
      status: 400,
      headers: { 'cache-control': 'no-store' },
    });
  }

  if (!isAllowedHost(target.hostname)) {
    return new Response('audio_host_not_allowed', {
      status: 403,
      headers: { 'cache-control': 'no-store' },
    });
  }

  const rangeHeader = context.request.headers.get('range');

  try {
    const upstreamResponse = await fetchWithTimeout(target.toString(), {
      headers: {
        'user-agent': DEFAULT_USER_AGENT,
        accept: 'audio/*,*/*;q=0.8',
        ...(rangeHeader ? { range: rangeHeader } : {}),
      },
      redirect: 'follow',
    });

    if (!upstreamResponse.ok && upstreamResponse.status !== 206) {
      return new Response('audio_upstream_unavailable', {
        status: 502,
        headers: { 'cache-control': 'no-store' },
      });
    }

    const headers = new Headers();
    headers.set('cache-control', 'public, max-age=900');
    headers.set('access-control-allow-origin', '*');
    headers.set('content-type', upstreamResponse.headers.get('content-type') || 'audio/mpeg');

    const contentLength = upstreamResponse.headers.get('content-length');
    const contentRange = upstreamResponse.headers.get('content-range');
    const acceptRanges = upstreamResponse.headers.get('accept-ranges');

    if (contentLength) headers.set('content-length', contentLength);
    if (contentRange) headers.set('content-range', contentRange);
    headers.set('accept-ranges', acceptRanges || 'bytes');

    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      headers,
    });
  } catch {
    return new Response('audio_proxy_failed', {
      status: 504,
      headers: { 'cache-control': 'no-store' },
    });
  }
}
