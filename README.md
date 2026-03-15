# Bella Vista Beach Residence

Landing page premium para o empreendimento Bella Vista Beach Residence, construída com Next.js (App Router), TailwindCSS e Framer Motion.

## ✅ Como rodar

```bash
npm install
npm run dev
```

## ✅ Build e export

```bash
npm run build
```

O build gera `out/` e copia para `dist/` via script `postbuild`.

## ✅ Variáveis de ambiente

Crie o arquivo `.env.local` com base no `.env.example`:

```
cp .env.example .env.local
```

### Twitch embed (`RadarIaSection`)

Para melhorar compatibilidade do player Twitch em produção e em páginas embutidas, defina:

```bash
NEXT_PUBLIC_TWITCH_EMBED_PARENTS=codexionai.pages.dev,www.codexionai.pages.dev,<host-que-embute>
```

Importante:
- A Twitch exige `parent` **exato** no embed (sem wildcard).
- Se o site estiver embutido em outro host, esse host também precisa estar na lista.
- Em cenários bloqueados pela Twitch/políticas de embed, o componente cai para fallback com botão **“Abrir canal na Twitch”**.

## ✅ Imagens locais

As imagens foram migradas para `/public/images`. Para baixar os arquivos do CDN e gerar WebP/redimensionamentos:

```bash
npm run assets:download
```

Isso gera:
- `public/images/hero`
- `public/images/showcase`
- `public/images/progress`

Para rodar somente a conversão WebP (sem baixar novamente):

```bash
npm run assets:optimize
```

## ✅ Estrutura de pastas

```
app/
  components/
    hero/
    showcase/
    simulator/
    location/
    progress/
    contact/
    cta/
    shared/
  hooks/
  lib/
  types/
```

## ✅ Funcionalidades principais

- Multilíngue (PT / EN / IT)
- Simulador de ROI com PDF
- WhatsApp integrado
- Formulário com Formspree
- SEO completo + Schema.org
```
