# ENIGMA - Assistente de Voz

Interface futurista com reconhecimento de voz, resposta textual via Gemini e leitura em voz alta.

## Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Web Speech API (SpeechRecognition + SpeechSynthesis)
- Google Gemini (`gemini-1.5-flash`)

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
```

## Fluxo de uso

Usuário fala no microfone, o app transcreve em `pt-BR`, envia o contexto para o Gemini e o ENIGMA responde com voz sintetizada também em `pt-BR`.

## Build

```bash
npm run build
```
