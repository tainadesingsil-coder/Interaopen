const SOURCE_TIMEOUT_MS = 4500;

const fetchWithTimeout = async (url, init = {}, timeoutMs = SOURCE_TIMEOUT_MS) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'user-agent':
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        ...(init.headers || {}),
      },
    });
  } finally {
    clearTimeout(timer);
  }
};

const escapeHtml = (value = '') =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const stripHtml = (value = '') =>
  value
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();

const extractMeta = (html, key) => {
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${key}["'][^>]+content=["']([^"']+)["'][^>]*>`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${key}["'][^>]*>`, 'i'),
    new RegExp(`<meta[^>]+name=["']${key}["'][^>]+content=["']([^"']+)["'][^>]*>`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${key}["'][^>]*>`, 'i'),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return stripHtml(match[1]);
  }
  return '';
};

const pickParagraphs = (html) => {
  const matches = [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((match) => stripHtml(match[1]))
    .filter((text) => text.length >= 70)
    .slice(0, 18);
  return matches;
};

const buildReaderHtml = ({ title, sourceUrl, description, paragraphs }) => {
  const titleSafe = escapeHtml(title || 'Leitura interna');
  const sourceSafe = escapeHtml(sourceUrl);
  const descriptionSafe = escapeHtml(description || '');
  const body =
    paragraphs.length > 0
      ? paragraphs.map((item) => `<p>${escapeHtml(item)}</p>`).join('\n')
      : `<p>${descriptionSafe || 'Não foi possível extrair o conteúdo completo desta página no momento.'}</p>`;

  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${titleSafe}</title>
  <style>
    :root { color-scheme: dark; }
    body {
      margin: 0;
      background: #060608;
      color: #fff;
      font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
      line-height: 1.7;
    }
    .wrap {
      max-width: 860px;
      margin: 0 auto;
      padding: 24px 18px 32px;
    }
    .eyebrow {
      color: #9ca3af;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: .14em;
      margin-bottom: 10px;
    }
    h1 {
      margin: 0 0 10px 0;
      font-size: 22px;
      line-height: 1.25;
    }
    .meta {
      color: #9ca3af;
      font-size: 13px;
      margin-bottom: 16px;
      word-break: break-all;
    }
    .meta a { color: #C6FF2E; text-decoration: none; }
    .card {
      border: 1px solid rgba(255,255,255,0.08);
      background: #0b0b0f;
      border-radius: 14px;
      padding: 16px;
    }
    p {
      margin: 0 0 14px 0;
      color: #d1d5db;
      font-size: 15px;
    }
    p:last-child { margin-bottom: 0; }
  </style>
</head>
<body>
  <main class="wrap">
    <div class="eyebrow">Leitura interna · Radar IA</div>
    <h1>${titleSafe}</h1>
    <div class="meta">Fonte: <a href="${sourceSafe}" target="_blank" rel="noreferrer">${sourceSafe}</a></div>
    <article class="card">
      ${body}
    </article>
  </main>
</body>
</html>`;
};

const buildFallbackHtml = (sourceUrl) =>
  buildReaderHtml({
    title: 'Visualização indisponível',
    sourceUrl,
    description: 'Não foi possível abrir esta página internamente agora.',
    paragraphs: [],
  });

export async function onRequestGet(context) {
  const requestUrl = new URL(context.request.url);
  const source = requestUrl.searchParams.get('url') || '';

  if (!source) {
    return new Response('missing_url', {
      status: 400,
      headers: { 'cache-control': 'no-store' },
    });
  }

  let parsed;
  try {
    parsed = new URL(source);
  } catch {
    return new Response('invalid_url', {
      status: 400,
      headers: { 'cache-control': 'no-store' },
    });
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return new Response('invalid_protocol', {
      status: 400,
      headers: { 'cache-control': 'no-store' },
    });
  }

  try {
    const response = await fetchWithTimeout(parsed.toString());
    if (!response.ok) {
      return new Response(buildFallbackHtml(parsed.toString()), {
        headers: {
          'content-type': 'text/html; charset=utf-8',
          'cache-control': 'public, max-age=120',
        },
      });
    }

    const html = await response.text();
    const title =
      extractMeta(html, 'og:title') ||
      stripHtml(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '') ||
      'Leitura interna';
    const description = extractMeta(html, 'og:description') || extractMeta(html, 'description');
    const paragraphs = pickParagraphs(html);

    return new Response(
      buildReaderHtml({
        title,
        sourceUrl: parsed.toString(),
        description,
        paragraphs,
      }),
      {
        headers: {
          'content-type': 'text/html; charset=utf-8',
          'cache-control': 'public, max-age=300',
        },
      }
    );
  } catch {
    return new Response(buildFallbackHtml(parsed.toString()), {
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'public, max-age=120',
      },
    });
  }
}
