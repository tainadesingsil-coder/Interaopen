const SOURCE_TIMEOUT_MS = 4000;

const buildCandidateSources = (code, kind = '') => {
  const post = {
    mediaUrl: `https://www.instagram.com/p/${code}/media/?size=l`,
    pageUrl: `https://www.instagram.com/p/${code}/`,
  };
  const reel = {
    mediaUrl: `https://www.instagram.com/reel/${code}/media/?size=l`,
    pageUrl: `https://www.instagram.com/reel/${code}/`,
  };

  if (kind === 'reel') return [reel, post];
  if (kind === 'post') return [post, reel];
  return [post, reel];
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

const extractMetaContent = (html, key) => {
  const decodeEntities = (value = '') =>
    value
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>');
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${key}["'][^>]+content=["']([^"']+)["'][^>]*>`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${key}["'][^>]*>`, 'i'),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      return decodeEntities(match[1].trim());
    }
  }
  return '';
};

export async function onRequestGet(context) {
  const requestUrl = new URL(context.request.url);
  const rawCode = requestUrl.searchParams.get('code') || '';
  const code = rawCode.replace(/[^a-zA-Z0-9_-]/g, '');
  const rawKind = (requestUrl.searchParams.get('kind') || '').toLowerCase();
  const kind = rawKind === 'reel' || rawKind === 'post' ? rawKind : '';

  if (!code || code.length < 5) {
    return new Response('invalid_instagram_code', {
      status: 400,
      headers: { 'cache-control': 'no-store' },
    });
  }

  try {
    const candidates = buildCandidateSources(code, kind);
    for (const source of candidates) {
      const response = await fetchWithTimeout(source.mediaUrl, {
        headers: {
          'user-agent':
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        },
      });

      const contentType = response.headers.get('content-type') || '';
      if (response.ok && contentType.toLowerCase().startsWith('image/')) {
        const body = await response.arrayBuffer();
        return new Response(body, {
          headers: {
            'content-type': contentType,
            'cache-control': 'public, max-age=1800',
          },
        });
      }

      const pageResponse = await fetchWithTimeout(source.pageUrl, {
        headers: {
          'user-agent':
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        },
      });
      if (!pageResponse.ok) {
        continue;
      }

      const html = await pageResponse.text();
      const ogImage = extractMetaContent(html, 'og:image');
      if (!ogImage) {
        continue;
      }

      const imageResponse = await fetchWithTimeout(ogImage);
      const imageType = imageResponse.headers.get('content-type') || '';
      if (imageResponse.ok && imageType.toLowerCase().startsWith('image/')) {
        const imageBody = await imageResponse.arrayBuffer();
        return new Response(imageBody, {
          headers: {
            'content-type': imageType,
            'cache-control': 'public, max-age=1800',
          },
        });
      }
    }

    return new Response(fallbackSvg(code), {
      headers: {
        'content-type': 'image/svg+xml; charset=utf-8',
        'cache-control': 'public, max-age=300',
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
