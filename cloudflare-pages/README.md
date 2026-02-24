# Cloudflare Pages (Bella Vista)

Depois de rodar `npm run build`, o site estatico fica disponivel em:

- `cloudflare-pages/bella-vista`

Use este caminho como **Build output directory** no Cloudflare Pages quando quiser
fazer upload manual (Direct Upload) ou validar o pacote localmente.

## Fluxo recomendado

1. Rode `npm install`
2. Rode `npm run build`
3. No Cloudflare Pages, use:
   - Framework preset: `None`
   - Build command: *(vazio para upload manual)*
   - Build output directory: `cloudflare-pages/bella-vista`
