### Guia de Estilo — Taina Silveira

- **Paleta de cores**
  - **Fundo principal (`--bg`)**: #0B0F1A
  - **Fundo secundário (`--bg-2`)**: #0F1020
  - **Superfície translúcida (`--surface`)**: rgba(255,255,255,0.06)
  - **Texto principal (`--text`)**: #E5E7EB
  - **Texto secundário (`--text-dim`)**: #9CA3AF
  - **Primária (`--primary`)**: #7C3AED (roxo elétrico)
  - **Secundária (`--secondary`)**: #00D4FF (ciano)
  - **Acento (`--accent`)**: #22D3EE (turquesa)
  - **Gradiente principal (`--gradient-1`)**: 135° de `--primary` para `--secondary`

- **Tipografia**
  - **Títulos**: Space Grotesk 400–700 (fallback: Inter, system-ui)
  - **Corpo de texto**: Inter 300–700 (fallback: system-ui)
  - **Diretrizes**:
    - Espaçamento confortável (line-height 1.5+)
    - Títulos com leve tracking negativo e alto contraste

- **Componentes e diretrizes**
  - **Botões**: usar `--gradient-1` para primários; `--surface` para ghost; bordas arredondadas e foco visível.
  - **Cartões**: glassmorphism leve com `backdrop-filter`; borda 1px translúcida; sombras suaves.
  - **Animações**: preferir transições 180–220ms; respeitar `prefers-reduced-motion`.
  - **3D**: elementos leves (WebGL simples ou transforms CSS); degradar para estático quando necessário.

- **Acessibilidade**
  - Contraste mínimo AA para texto e interações.
  - Estados de foco visíveis e elementos clicáveis grandes.
  - Conteúdo essencial acessível sem 3D/JS.