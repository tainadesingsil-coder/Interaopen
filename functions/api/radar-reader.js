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
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number.parseInt(code, 10)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(Number.parseInt(code, 16)))
    .replace(/\s+/g, ' ')
    .trim();

const BOILERPLATE_PATTERNS = [
  /\bhome\s+sobre\s+sobre a revista\b/i,
  /\bcadastre-se\b/i,
  /\bconsultar doi\b/i,
  /\bcitações\s*\/\s*google acadêmico\b/i,
  /\bbase de dados\s*\/\s*crossref\b/i,
  /\bconselho editorial\b/i,
  /\bdiretrizes para autores/i,
  /\benviar submissão\b/i,
  /\benglish\b.*\bespañol\b.*\bfrançais\b/i,
  /\bresultados para \{phrase\}\b/i,
  /\bmais resultados\b/i,
];

const MENU_TERMS = [
  'home',
  'cadastre-se',
  'capas',
  'consultar',
  'google acadêmico',
  'crossref',
  'blog',
  'livros acadêmicos',
  'conselho editorial',
  'editores',
  'avaliador',
  'enviar submissão',
  'contato',
];

const menuTermCount = (value = '') => {
  const normalized = value.toLowerCase();
  return MENU_TERMS.reduce((acc, term) => (normalized.includes(term) ? acc + 1 : acc), 0);
};

const isBoilerplateParagraph = (value = '') => {
  const normalized = value.replace(/\s+/g, ' ').trim();
  if (!normalized) return true;

  if (BOILERPLATE_PATTERNS.some((pattern) => pattern.test(normalized))) return true;

  const terms = menuTermCount(normalized);
  if (terms >= 4) return true;

  const uppercaseChars = (normalized.match(/[A-ZÀ-ÖØ-Þ]/g) || []).length;
  const letters = (normalized.match(/[A-Za-zÀ-ÖØ-öø-ÿ]/g) || []).length || 1;
  const upperRatio = uppercaseChars / letters;
  if (upperRatio > 0.45 && terms >= 2) return true;

  return false;
};

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
  const regionCandidates = [
    ...[...html.matchAll(/<article[^>]*>([\s\S]*?)<\/article>/gi)].map((match) => match[1]),
    ...[...html.matchAll(/<main[^>]*>([\s\S]*?)<\/main>/gi)].map((match) => match[1]),
  ];

  const bestRegion = regionCandidates
    .map((candidate) => ({ candidate, score: stripHtml(candidate).length }))
    .sort((a, b) => b.score - a.score)[0]?.candidate;

  const collect = (sourceHtml) =>
    [...sourceHtml.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
      .map((match) => stripHtml(match[1]))
      .filter((text) => text.length >= 70 && !isBoilerplateParagraph(text))
      .slice(0, 18);

  const fromRegion = bestRegion
    ? collect(bestRegion)
    : [];
  const fromFull = collect(html);

  if (fromRegion.length >= 4) return fromRegion;
  if (fromFull.length > fromRegion.length) return fromFull;

  const matches = [...(bestRegion || html).matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((match) => stripHtml(match[1]))
    .filter((text) => text.length >= 70 && !isBoilerplateParagraph(text))
    .slice(0, 18);

  if (matches.length > 0) return matches;

  return [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((match) => stripHtml(match[1]))
    .filter((text) => text.length >= 70 && !isBoilerplateParagraph(text))
    .slice(0, 18);
};

const pickParagraphsFromText = (value = '') =>
  String(value || '')
    .split(/\n{2,}/)
    .map((line) => stripHtml(line))
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter((line) => line.length >= 70 && !isBoilerplateParagraph(line))
    .slice(0, 18);

const fetchViaJinaReader = async (sourceUrl = '') => {
  const raw = String(sourceUrl || '').trim();
  if (!raw) return { title: '', paragraphs: [] };
  const withoutProtocol = raw.replace(/^https?:\/\//i, '');
  const endpoint = `https://r.jina.ai/http://${withoutProtocol}`;
  try {
    const response = await fetchWithTimeout(
      endpoint,
      {
        headers: {
          accept: 'text/plain',
        },
      },
      7000
    );
    if (!response.ok) return { title: '', paragraphs: [] };
    const payload = await response.text();
    const lines = payload.split('\n').map((line) => line.trim()).filter(Boolean);
    const titleLine = lines.find((line) => line.toLowerCase().startsWith('title:')) || '';
    const extractedTitle = titleLine ? stripHtml(titleLine.replace(/^title:\s*/i, '')) : '';
    return {
      title: extractedTitle,
      paragraphs: pickParagraphsFromText(payload),
    };
  } catch {
    return { title: '', paragraphs: [] };
  }
};

const normalizeSourceLabel = (sourceUrl, fallbackSource = '') => {
  const fromFallback = (fallbackSource || '').trim();
  if (fromFallback) return fromFallback;
  try {
    const parsed = new URL(sourceUrl);
    if (parsed.hostname.includes('news.google.com')) {
      return 'Google Notícias';
    }
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return sourceUrl;
  }
};

const buildReaderHtml = ({ title, sourceUrl, sourceLabel, description, paragraphs }) => {
  const titleSafe = escapeHtml(title || 'Leitura interna');
  const sourceSafe = escapeHtml(sourceUrl);
  const sourceLabelSafe = escapeHtml(sourceLabel || sourceUrl);
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
    <div class="meta">Fonte: <a href="${sourceSafe}" target="_blank" rel="noreferrer">${sourceLabelSafe}</a></div>
    <article class="card">
      ${body}
    </article>
  </main>
</body>
</html>`;
};

const buildFallbackHtml = (sourceUrl, fallbackTitle = '', fallbackDescription = '', fallbackSource = '') =>
  buildReaderHtml({
    title: fallbackTitle || 'Visualização indisponível',
    sourceUrl,
    sourceLabel: normalizeSourceLabel(sourceUrl, fallbackSource),
    description:
      fallbackDescription ||
      'Não foi possível abrir esta página internamente agora. Você ainda pode abrir a fonte original.',
    paragraphs: [],
  });

export async function onRequestGet(context) {
  const requestUrl = new URL(context.request.url);
  const source = requestUrl.searchParams.get('url') || '';
  const fallbackTitle = stripHtml(requestUrl.searchParams.get('fallbackTitle') || '');
  const fallbackDescription = stripHtml(requestUrl.searchParams.get('fallbackDescription') || '');
  const fallbackSource = stripHtml(requestUrl.searchParams.get('fallbackSource') || '');

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
      const jinaFallback = await fetchViaJinaReader(parsed.toString());
      if (jinaFallback.paragraphs.length > 0) {
        return new Response(
          buildReaderHtml({
            title: jinaFallback.title || fallbackTitle || 'Leitura interna',
            sourceUrl: parsed.toString(),
            sourceLabel: normalizeSourceLabel(parsed.toString(), fallbackSource),
            description: fallbackDescription,
            paragraphs: jinaFallback.paragraphs,
          }),
          {
            headers: {
              'content-type': 'text/html; charset=utf-8',
              'cache-control': 'public, max-age=120',
            },
          }
        );
      }
      return new Response(
        buildFallbackHtml(parsed.toString(), fallbackTitle, fallbackDescription, fallbackSource),
        {
          headers: {
            'content-type': 'text/html; charset=utf-8',
            'cache-control': 'public, max-age=120',
          },
        }
      );
    }

    const html = await response.text();
    const extractedTitle =
      extractMeta(html, 'og:title') || stripHtml(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '');
    const title =
      extractedTitle && extractedTitle.toLowerCase() !== 'google news'
        ? extractedTitle
        : fallbackTitle || extractedTitle || 'Leitura interna';
    const description = extractMeta(html, 'og:description') || extractMeta(html, 'description');
    const paragraphs = pickParagraphs(html);
    const jinaFallback = paragraphs.length === 0 ? await fetchViaJinaReader(parsed.toString()) : { title: '', paragraphs: [] };
    const finalParagraphs =
      paragraphs.length > 0
        ? paragraphs
        : jinaFallback.paragraphs.length > 0
          ? jinaFallback.paragraphs
          : fallbackDescription
            ? [fallbackDescription]
            : [];
    const finalDescription = description || fallbackDescription;

    return new Response(
      buildReaderHtml({
        title: title || jinaFallback.title || fallbackTitle || 'Leitura interna',
        sourceUrl: parsed.toString(),
        sourceLabel: normalizeSourceLabel(parsed.toString(), fallbackSource),
        description: finalDescription,
        paragraphs: finalParagraphs,
      }),
      {
        headers: {
          'content-type': 'text/html; charset=utf-8',
          'cache-control': 'public, max-age=300',
        },
      }
    );
  } catch {
    const jinaFallback = await fetchViaJinaReader(parsed.toString());
    if (jinaFallback.paragraphs.length > 0) {
      return new Response(
        buildReaderHtml({
          title: jinaFallback.title || fallbackTitle || 'Leitura interna',
          sourceUrl: parsed.toString(),
          sourceLabel: normalizeSourceLabel(parsed.toString(), fallbackSource),
          description: fallbackDescription,
          paragraphs: jinaFallback.paragraphs,
        }),
        {
          headers: {
            'content-type': 'text/html; charset=utf-8',
            'cache-control': 'public, max-age=120',
          },
        }
      );
    }
    return new Response(
      buildFallbackHtml(parsed.toString(), fallbackTitle, fallbackDescription, fallbackSource),
      {
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'public, max-age=120',
      },
      }
    );
  }
}
