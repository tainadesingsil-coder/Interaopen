# Órbita — Especificação de Design UX/UI

## Visão geral
- Objetivo: plataforma mobile-first que une rede social, entretenimento e assistente pessoal por IA (GPT-5) com experiência personalizada, explicável e multimodal.
- Princípios: clareza, controle, confiança, velocidade, acessibilidade, explainability e criação assistida.
- Plataformas alvo: iOS/Android (prioridade), PWA responsivo como extensão.

## Linguagem visual
- Paleta (dark-first com alto contraste):
  - Fundo base: `#0B0F14`
  - Superfície base: `#121821`
  - Superfície elevada: `#18212B`
  - Borda/Divisor: `#273341`
  - Texto primário: `#E6EDF6`
  - Texto secundário: `#B9C2CF`
  - Brand (primário): `#4DA3FF`
  - Acento (interações): `#00E5FF`
  - Sucesso: `#22C55E` | Aviso: `#F59E0B` | Erro: `#EF4444` | Info: `#60A5FA`
- Tipografia: Inter/SF Pro/Roboto, 4pt grid, tamanhos base 16 px, hierarquia:
  - Display 28–32, H1 24, H2 20, H3 18, Body 16, Caption 14, Micro 12. Peso 400/600/700.
- Espaçamento: escala 4, 8, 12, 16, 24, 32, 40, 64.
- Raios: 8, 12, 16, 24, full.
- Elevação (sombras suaves em dark): 1/2/3 com opacidade 0.24/0.18/0.12.
- Motion: durações 120/180/240/320 ms; easing padrão `cubic-bezier(0.2,0,0,1)`; entrada `0.16,1,0.3,1`.

## Acessibilidade
- Tamanho alvo mínimo 44×44 px; espaçamento mínimo entre alvos 8 px.
- Contraste WCAG AA (texto normal ≥ 4.5:1). Paleta validada para dark.
- Modo escuro/claro e alto contraste. Ajuste de fonte do sistema respeitado.
- Legendas automáticas, transcripts; controle de velocidade (0.5–2x).
- Suporte a VoiceOver/TalkBack; comandos de voz; foco visível; haptics sutis.

## Navegação
- Barra inferior (5 abas): Feed, Studio IA, Parties, Perfil, Config.
- Acesso multimodal persistente: botão flutuante com microfone/câmera/upload.
- Pesquisa global e ações rápidas no topo (drag-down do Feed).

## Padrões de explainability
- Chip “Por que isto?” em cada card: estado compacto + expansão em sheet.
- Sheet de justificativa lista sinais com pesos e controle de relevância (sliders/pills).
- Ações de ajuste devolvem feedback visual e reordenam feed em tempo real.

## Componentes-chave (visão)
- AppBar, BottomNav, SearchBar, FilterPills (scroll horizontal), ContentCard (vídeo/música/texto/evento), WhyChip, ActionBar (curtir/salvar/compartilhar/comentar), FAB Multimodal, BottomSheet, Tooltip/Coachmark, Toggle, Slider, SegmentedControl, Modal, Toast/Snackbar, Empty/Loading/Error states, Avatar (IA/usuário), VoiceButton (hold-to-talk), CameraButton, UploadButton, Timeline (Studio), AssetDrawer, PromptPanel, SuggestionChips, ABTestToggle, Poll/Quiz, ChatThread, LiveIndicator, PrivacyBadge, MemoryMeter.

---

## Telas e especificações

### 1) Onboarding (≤ 90 s)
- Estrutura: 6 passos progressivos com indicador (1/6).
  1. Boas-vindas + opt-ins iniciais (analytics, notificações) — claros e opcionais.
  2. Preferências de conteúdo (temas pílulas com multi-seleção) + intensidade.
  3. Creators/estilos preferidos (busca + sugestões).
  4. Objetivos (consumir, criar, ambos) + metas (frequência, formatos).
  5. Privacidade e Memória: ativar, pausar por tópico, “modo sem registro”.
  6. Resumo e prévia do feed com botão “Começar”.
- Interações: haptics nos selects, preview dinâmico à direita (ou acima em mobile pequeno).
- Acessibilidade: saltar onboarding; salvar rascunho; linguagem simples.
- Métricas: conclusão < 90 s; taxa de opt-in consciente; % edição de memória.

### 2) Feed Personalizado e Explicável
- Layout: AppBar com busca e ícone de microfone; abaixo, FilterPills; lista de ContentCards.
- ContentCard (vídeo): thumbnail/auto-play controlado, título, creator, badges (duração/tema), WhyChip, ActionBar.
- WhyChip: toque abre BottomSheet com 3–5 sinais (ex.: “Você curtiu X”, “tempo disponível ~10 min”, “estilo sci-fi”). Inclui controles: reduzir/aumentar peso, silenciar tema/creator.
- Ajuste rápido do feed: botão “Ajustar” abre sheet com sliders (temas, humor, duração, fontes). Aplicação instantânea (transição animada com reorder).
- Estados: carregando (skeletons), vazio (mensagem + ação “refinar preferências”), erro (tentar novamente).
- Métricas: uso de WhyChip; CTR pós-explain; tempo até primeira interação; frequência de ajustes.

### 3) Studio IA (Criação e Edição)
- Layout: três regiões
  - PromptPanel (topo/side): input texto/voz + SuggestionChips (“Criar roteiro”, “Gerar cortes”, “Legendas”, “Thumbnail”).
  - Preview/Tela: player com controles (marcadores, legendas, velocidade).
  - Timeline simplificada: faixas de vídeo/áudio; cortes automáticos com handles; drag & drop de assets do AssetDrawer.
- Assistente IA: sidebar flutuante com sugestões contextualizadas (aceitar/modificar/descartar). Respostas em streaming; microcopy clara.
- A/B testing: toggle que duplica variações (Título/Thumb/Hook inicial). Indicadores de performance quando publicado.
- Ações rápidas: exportar (720/1080/4K — Pro), compartilhar, salvar rascunho.
- Estados: render em progresso (barra), erro (logs simples), colaboração futura.
- Métricas: tempo para publicar; % uso de features IA; watch time lift c/ cortes IA.

### 4) Watch Parties & Interatividade
- Tela de evento ao vivo
  - Vídeo principal (topo), LiveIndicator, controles (play, volume, latência baixa).
  - Sidebar: ChatThread com threads, Poll/Quiz, fila de perguntas, mensagens destacadas.
  - Co-host IA: avatar animado; cartões-resposta (texto/áudio); botões “resumir”, “marcar destaque”, “criar enquete”.
- Pós-evento: resumo visual (timeline com highlights), clipes, enquetes finalizadas e insights.
- Métricas: participação em polls, perguntas respondidas pela IA, retenção do evento.

### 5) Perfil & Memória Personalizada
- Dashboard: preferências ativas (pills), histórico de interações (timeline), MemoryMeter (nível de personalização), criador vs. consumidor split.
- Memória: lista por tópicos com editar/pausar/apagar; modo “sem registro” com temporizador; exportar dados (JSON/CSV) e portabilidade.
- Privacidade: E2EE em DMs/parties privadas com status visível.
- Métricas: % usuários que editam memória; taxa de pausas por tópico.

### 6) Configurações de Privacidade e Segurança
- Estrutura: permissões (microfone, câmera, localização), dados & memória, proatividade da IA (frequência), anúncios (opt-in), segurança (2FA, sessões).
- Ações: “Excluir tudo”, “Baixar meus dados”, “Modo sem registro”.
- Explainability do uso de dados: texto curto + link de detalhes.

---

## Multimodalidade
- VoiceButton: pressionar-e-segurar com waveform; transcrição em tempo real; editar antes de enviar.
- CameraButton: câmera rápida (vertical primeiro); templates; recorte automático.
- UploadButton: arquivos recentes; dropzone; pré-processamento (silêncio, normalização).
- Input unificado aceita texto/voz/imagem/vídeo em todas as telas principais.

## Microinterações
- Toques com ripple discreto; hover nos PWAs; animações ≤ 240 ms.
- Reordenamento do feed com efeito spring leve; feedback de ajustes com toasts.
- Estados de gravação de voz com animação de pulso.

## Estados & Mensagens
- Erros sempre com causa provável + ação (ex.: “Conexão instável — reter fila para publicar depois”).
- Vazio com recomendações acionáveis (ex.: “Siga 5 creators para destravar watch parties de nicho”).

## Conteúdo & Tom
- Microcopy direto, inclusivo, explicável. Ex.: “Sugerido porque você: curtiu X, prefere Y à noite, segue Z”.
- Rótulos consistentes: “Ajustar Feed”, “Por que isto?”, “Modo sem registro”, “Co-host IA”.

## Métricas UX/UI
- Onboarding < 90 s; uso de filtros > 50% dos AA; > 5 interações com IA por sessão; > 20% DAU em watch parties; ≥ 70% satisfação com explicações.

## Notas para Dev
- Design tokens centralizados (JSON). Semânticos: bg/surface/text/border/brand/accent/success/warning/danger/info.
- Estados: loading/skeleton, empty, error para cada componente.
- Inputs multimodais usam eventos em streaming (WebRTC/gRPC) — placeholder para latência p95.
- Acessibilidade: labels/ARIA, foco visível, teclas de atalho em PWA.

## Estrutura recomendada de protótipo (Figma)
- Páginas: 01 Foundations, 02 Components, 03 Patterns, 04 Screens, 05 Flows, 06 Prototypes.
- Frames principais (390×844 e 360×800): Onboarding (6), Feed (3 var.), Studio (4 var.), Party (ao vivo/pós), Perfil, Privacidade.
- Interações: tap/drag/hold; overlays para BottomSheets; variáveis para temas e estados.