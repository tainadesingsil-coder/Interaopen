# CODEXION Portfolio

## Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- API Routes (backend aggregation)

## Como rodar

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Variáveis de ambiente

Defina no `.env.local`:

```env
NEXT_PUBLIC_GEMINI_API_KEY=sua_chave_aqui
YOUTUBE_DATA_API_KEY=sua_chave_youtube_data_api_v3
GEMINI_API_KEY=sua_chave_backend_gemini
```

## Radar IA

- Endpoint: `/api/radar-ia?query=...&type=all|youtube|news|instagram&range=24h|7d|30d`
- Implementação backend: `functions/api/radar-ia.js` (Cloudflare Pages Function)
- Cache server-side: 12 minutos
- Timeout por fonte: 4s (graceful degradation)
- Fallback Instagram sem scraping (link oficial do perfil recomendado)

## Assistente IA dos Serviços

- Endpoint: `/api/service-advisor` (POST)
- Implementação backend: `functions/api/service-advisor.js`
- Uso: explica cada serviço da seção "Produtos que entregamos" e permite diálogo no front

### Fontes do Radar IA

Configuradas em `functions/api/radar-ia.js` no array `NEWS_FEEDS`.

- Olhar Digital IA (PT-BR)
- Canaltech (PT-BR)
- Google Notícias IA (PT-BR)

YouTube do Radar IA prioriza canais e vídeos em português sobre Inteligência Artificial.

Para adicionar/trocar fontes:
1. Edite `NEWS_FEEDS` com nome + URL RSS/Atom.
2. Mantenha domínio confiável.
3. Teste com `npm run build`.

### Variáveis em produção (Cloudflare)

No projeto Cloudflare Pages, configure:

- `YOUTUBE_DATA_API_KEY`
- `GEMINI_API_KEY`

## Build

```bash
npm run build
```
