# Órbita — Design System (Resumo)

## Componentes
- AppBar: título, busca, ícones (voz, notificações). Variantes: padrão, scrolled.
- BottomNav: 5 ícones (Feed, Studio, Parties, Perfil, Config) com labels e badge.
- SearchBar: input com voz; sugestão de buscas recentes.
- FilterPills: rolagem horizontal; estados: selecionado/desabilitado.
- ContentCard: variantes (vídeo/música/texto/evento). Slots: mídia, título, meta, WhyChip, ActionBar.
- WhyChip: compacto; abre BottomSheet com justificativas e controles (sliders, toggles, silenciar tema/creator).
- ActionBar: curtir, salvar, compartilhar, comentar. Contadores e estados.
- FAB Multimodal: abrir menu radial (voz, câmera, upload, prompt).
- BottomSheet: cabeçalho drag, max/half; scroll interno, safe area.
- Tooltip/Coachmark: orientação contextual.
- Toggle/Slider/SegmentedControl: controles de ajuste de feed/privacidade.
- Modal/ConfirmDialog: operações destrutivas (apagar memória, excluir dados).
- Toast/Snackbar: confirmações curtas.
- Avatar (IA/usuário): com status ao vivo.
- VoiceButton: press-and-hold; feedback waveform.
- Timeline (Studio): faixas, marcadores, cortes, handles.
- AssetDrawer: mídia, filtros, busca.
- PromptPanel: input multimodal, chips de ação, histórico de prompts.
- SuggestionChips: aceitar/modificar/descartar.
- ABTestToggle: duplicar variações com rótulos A/B.
- Poll/Quiz: pergunta, opções, barras de resultado.
- ChatThread: mensagens, respostas, destaques, mentions.
- LiveIndicator: dot pulsante + label.
- PrivacyBadge: E2EE status.
- MemoryMeter: nível de personalização.

## Padrões
- Explainability: chip + sheet com sinais e pesos ajustáveis.
- Multimodal: input único com anexos (voz/imagem/vídeo/texto).
- Acessibilidade: alvos ≥ 44px, contraste AA+, foco visível, rótulos, haptics.
- Erros/Empty/Loading: mensagens úteis com ação.
- Motion: ≤ 240 ms; easing padrão; transições coerentes.

## Estados e variações
- Tema: dark/claro/alto contraste.
- Tamanho de fonte: padrão, +1, +2.
- Conectividade: online/offline (fila de publicação).
- Latência: indicador p95 para streaming (texto/voz/vídeo).

## Boas práticas de conteúdo
- Microcopy direto e explicável; evite jargão.
- Rótulos consistentes: “Ajustar Feed”, “Por que isto?”, “Modo sem registro”.

## Handoff para Dev
- Tokens em `design-system/tokens.json`.
- Estados necessários por componente: loading/empty/error/disabled.
- Props essenciais (alto nível):
  - ContentCard: `type`, `mediaSrc`, `title`, `creator`, `badges[]`, `why[]`, `onAdjust()`, states.
  - WhyChip: `signals[]`, `onOpen()`, `onAdjust()`, `disabled`.
  - Timeline: `tracks[]`, `cuts[]`, `onSplit()`, `onTrim()`, `onReorder()`.
  - PromptPanel: `value`, `onChange()`, `attachments[]`, `onVoiceStart/Stop()`, `onSubmit()`.
  - Poll: `question`, `options[]`, `onVote()`, `results`.

## QA de acessibilidade
- Teste de contraste automático sobre tokens.
- Navegação por teclado (PWA) e leitor de tela (iOS/Android).
- Descrições de mídia (alt text) e legendas.