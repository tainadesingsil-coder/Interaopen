# Bella Vista Beach Residence

Landing page premium para o empreendimento Bella Vista Beach Residence, construída com Next.js (App Router), TailwindCSS e Framer Motion.

## ✅ Como rodar

```bash
npm install
npm run dev
```

Versao recomendada do Node.js: `22` (minimo `20.10`).

## ✅ Build e export

```bash
npm run build
```

O build gera `out/` e copia para:

- `dist/`
- `cloudflare-pages/bella-vista/`

Assim voce tem uma pasta fixa para publicar no Cloudflare Pages.

## ✅ Deploy no Cloudflare Pages

Use a pasta abaixo como output no Cloudflare:

- `cloudflare-pages/bella-vista`

No GitHub Actions, o nome do projeto da Cloudflare pode ser configurado por:

- `Repository variables` -> `CLOUDFLARE_PAGES_PROJECT`

## ✅ Variáveis de ambiente

Crie o arquivo `.env.local` com base no `.env.example`:

```
cp .env.example .env.local
```

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
