const SOURCE_TIMEOUT_MS = 4000;

const POST_CODE_TO_MEDIA_URL = {
  DV1OIoxDvbV: 'https://www.instagram.com/p/DV1OIoxDvbV/media/?size=l',
  DV0pWgrlfaY: 'https://www.instagram.com/p/DV0pWgrlfaY/media/?size=l',
  DVtoYvkkSxm: 'https://www.instagram.com/p/DVtoYvkkSxm/media/?size=l',
  DVv4XchjiOj: 'https://www.instagram.com/p/DVv4XchjiOj/media/?size=l',
};

const fetchWithTimeout = async (url, init = {}, timeoutMs = SOURCE_TIMEOUT_MS) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal, redirect: 'follow' });
  } finally {
    clearTimeout(timer);
  }
};

const fallbackSvg = (code) => {
  const safeCode = (code || 'post').replace(/[^a-zA-Z0-9_-]/g, '');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="405" viewBox="0 0 720 405">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#3f0f74"/>
      <stop offset="55%" stop-color="#d62976"/>
      <stop offset="100%" stop-color="#feda75"/>
    </linearGradient>
  </defs>
  <rect width="720" height="405" fill="url(#bg)"/>
  <rect x="18" y="18" width="684" height="369" rx="18" fill="rgba(6,6,8,0.5)" stroke="rgba(255,255,255,0.2)"/>
  <text x="42" y="78" fill="#ffffff" font-size="24" font-family="Arial, sans-serif" font-weight="700">Instagram</text>
  <text x="42" y="112" fill="#c9d1d9" font-size="18" font-family="Arial, sans-serif">@hollyfield.ia</text>
  <text x="42" y="182" fill="#ffffff" font-size="26" font-family="Arial, sans-serif" font-weight="700">Post ${safeCode}</text>
  <text x="42" y="348" fill="#C6FF2E" font-size="18" font-family="Arial, sans-serif" font-weight="700">Carregando capa real...</text>
</svg>`;
};

export async function onRequestGet(context) {
  const requestUrl = new URL(context.request.url);
  const rawCode = requestUrl.searchParams.get('code') || '';
  const code = rawCode.replace(/[^a-zA-Z0-9]/g, '');
  const mediaUrl = POST_CODE_TO_MEDIA_URL[code];

  if (!mediaUrl) {
    return new Response('invalid_instagram_code', {
      status: 400,
      headers: { 'cache-control': 'no-store' },
    });
  }

  try {
    const response = await fetchWithTimeout(mediaUrl, {
      headers: {
        'user-agent':
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
      },
    });

    const contentType = response.headers.get('content-type') || '';
    if (!response.ok || !contentType.toLowerCase().startsWith('image/')) {
      return new Response(fallbackSvg(code), {
        headers: {
          'content-type': 'image/svg+xml; charset=utf-8',
          'cache-control': 'public, max-age=300',
        },
      });
    }

    const body = await response.arrayBuffer();
    return new Response(body, {
      headers: {
        'content-type': contentType,
        'cache-control': 'public, max-age=1800',
      },
    });
  } catch (error) {
    return new Response(fallbackSvg(code), {
      headers: {
        'content-type': 'image/svg+xml; charset=utf-8',
        'cache-control': 'public, max-age=120',
      },
    });
  }
}
