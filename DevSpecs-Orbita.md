# Órbita — Especificações para Desenvolvedores

## Arquitetura UX técnica
- Multimodal streaming: WebRTC/gRPC; ASR/TTS streaming; fallback HTTP SSE.
- Estados de rede: online/offline; fila de publicação; retries exponenciais (jitter).
- Temas: dark/light/alto contraste; CSS variables/tokens.

## Orçamentos de latência (p95)
- Abertura de tela principal: < 800 ms
- Tocar WhyChip → abrir sheet: < 120 ms
- Ajuste do feed aplicado (reorder): < 200 ms
- Resposta assistente (texto): < 150 ms
- ASR parcial → texto: < 300 ms; TTS start: < 300 ms
- Watch party chat → render: < 150 ms

## Telemetria (eventos UX)
- `onboarding_start`, `onboarding_complete`, `onboarding_opt_in_{mem,notif,analytics}`
- `feed_view`, `feed_adjust_open`, `feed_adjust_apply`, `why_open`, `why_adjust_{up,down,mute}`
- `studio_open`, `studio_prompt_submit`, `studio_suggestion_accept`, `studio_cuts_generate`, `studio_ab_toggle`, `studio_publish`
- `party_join`, `party_question_submit`, `party_ia_answer_view`, `party_poll_vote`, `party_highlight_mark`, `party_end`
- `profile_memory_edit`, `memory_pause`, `memory_delete_topic`, `export_start/complete`
- `privacy_open`, `privacy_toggle`, `no_record_mode_on/off`

Acompanhar: duração, sucesso/erro, payload mínimo (sem PII) e versão de UI.

## Estados & Máquinas de estado
- Feed: idle → loading → populated | empty | error → adjusting → reordered
- Studio: idle → prompting → drafting → cutting → reviewing → exporting → published | error
- Party: waiting → live → paused → ended → recap_ready
- Memória: active → paused(topic) → editing → deleted(topic)

## API (alto nível)
- Recommendations: `GET /v1/feed?userId&signals` → items + `explainability[]` (id, tipo, peso, fonte)
- Adjust: `POST /v1/feed/adjust` body: temas[], humor, duração, fontes → 204 + server push reorder
- Studio Generate: `POST /v1/studio/script`, `POST /v1/studio/cuts`, `POST /v1/studio/thumbnail`
- Party: `GET /v1/party/:id/stream` (WebRTC), `POST /v1/party/:id/question`, `POST /v1/party/:id/poll`
- Memory: `GET/PUT/DELETE /v1/memory/:topic`, `POST /v1/memory/export`
- Privacy: `GET/PUT /v1/privacy` (permissões, proatividade, anúncios)

## Erros & UX
- Padrão: código, mensagem humana, ação recomendada.
- Offline: fila; indicador; retry manual.
- Conteúdo sensível: blur + escolha de revelar.

## Acessibilidade técnica
- ARIA roles, labels, descrição de mídia, foco visível; navegação por teclado no PWA.

## Testes
- UI: snapshot + testes de interação para Explainability, Ajuste, Studio básico, Party chat.
- A11y: axe-core; contraste em tokens; navegação por teclado.
- Performance: Web Vitals (PWA), perf markers nas transições chave.