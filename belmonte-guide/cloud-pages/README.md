# Cloudflare Pages - Belmonte /app

## Estrutura
- `functions/app.ts`: rota `/app` (Pages Functions) que lê headers `Authorization` (Bearer) e `X-Client-Id`.

## Deploy
1) Crie um projeto no Cloudflare Pages e aponte para esta pasta (`cloud-pages`).
2) Build command: `echo skip` (sem build). Output directory: `cloud-pages`.
3) Habilite Pages Functions.
4) Deploy. A prévia ficará em:
   - `https://<hash>.<project>.pages.dev/app`
5) Configure domínio personalizado `belmontappturis.dev` no Pages.
6) Publique `/.well-known/assetlinks.json` e `/.well-known/apple-app-site-association` com os arquivos do repositório raiz (ajuste IDs/assinaturas).

## Teste pelo app
- A `CommerceScreen` abre `https://belmontappturis.dev/app` e envia headers com token/id.