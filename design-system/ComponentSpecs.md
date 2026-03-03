# Especificações de Componentes — Órbita

Todos os tamanhos em px; grid base 4.

## AppBar
- Altura: 56 (compacta), 64 (padrão)
- Padding horizontal: 16
- Slots: ícone voltar/opções, título (máx 1 linha), busca (variante), ações (voz/notifications)
- Estados: scrolled (elevation 2), search-active, disabled

## BottomNav
- Altura: 72
- Ícone: 24, label 12
- Safe area: bottom inset + 8
- Estados: active (brand), inactive (textSecondary), badge (dot ou count)

## SearchBar
- Altura: 44
- Radius: 12
- Ícones: search (leading 20), voice (trailing 20)
- Placeholder: textSecondary; foco com border brand

## FilterPills
- Altura: 32
- Padding pill: 12×8; radius 16
- Espaçamento entre pills: 8
- Estados: default, selected (brand bg + textPrimary), disabled (opacity 0.4)

## ContentCard (vídeo)
- Largura: full; Radius: 16; Elevation: 1
- Mídia: 16:9; título 16/semibold (máx 2 linhas)
- Meta: avatar 32, nome 14, badges (12, radius 8)
- WhyChip: 28 de altura, ícone info 16
- ActionBar: botões 24 com touch 44, espaçamento 16
- Estados: loading (skeleton), error, age-restricted (blur + badge)

## WhyChip
- Altura: 28; Padding: 12×6; Radius: 16
- Ícone info 16; label 12/semibold
- Abre BottomSheet: header 24, lista de sinais (ícone 16 + label 14 + peso)

## BottomSheet
- Alturas: 50% e 90%
- Handle: 36×4 (radius 2)
- Header: título 16/semibold; ação fechar 24
- Conteúdo scroll; safe areas respeitadas

## FAB Multimodal
- Tamanhos: 56 (primário)
- Menu radial: itens 40 (radius 20): Voz, Câmera, Upload, Prompt
- Ícones: 20; labels 12

## PromptPanel
- Altura: 56 (mín); multiline até 120
- Botões: chips de ação (altura 32)
- Anexos: preview 40 com remove

## Timeline (Studio)
- Altura: 164 (compacta), 220 (expandida)
- Tracks: vídeo (alto), áudio (baixo)
- Cortes: handles 8; snap a 250 ms
- Marcadores: 2 px linha, label 10

## AssetDrawer
- Largura (side): 280; Altura (bottom): 40% da tela
- Células: 96×96; radius 12
- Filtros: pills 28

## SuggestionChips
- Altura: 32; radius 16; ícone 14
- Ações: aceitar (brand), modificar (accent), descartar (danger/ghost)

## ABTestToggle
- Labels A/B 12; indicador ativo brand; alternância instantânea

## Poll/Quiz
- Pergunta: 16/semibold; opções: 14; barra de resultado com animação 180 ms
- Estados: aberta/encerrada; múltipla escolha (máx 2)

## ChatThread
- Bubbles: radius 16; IA com marca lateral brand 2 px
- Avatar: 28; timestamp 10; replies com ind. de thread

## LiveIndicator
- Dot 8 pulsante; label 12; contraste alto

## PrivacyBadge
- Ícone cadeado 14; label 12; tooltip “E2EE ativo”

## MemoryMeter
- Barra 4 px; níveis 0–100; cores: info→brand; tooltip com categorias ativas

## Toggle / Slider / SegmentedControl
- Toggle: 44×24; knob 20; estados on/off/disabled
- Slider: trilho 2 px; polegar 16; marcadores opcionais
- Segmented: altura 36; radius 18; item ativo brand bg

## Toast/Snackbar
- Altura: 44; radius 12; posição bottom acima da nav; duração 3 s
- Tipos: info/success/warning/danger

## Modal/ConfirmDialog
- Largura: 90% (máx 560); header 16/semibold; ações 44 de altura
- Estados destrutivos exigem digitação de confirmação em dados críticos