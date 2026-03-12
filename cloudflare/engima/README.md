# Cloudflare ENGIMA

Esta pasta organiza a configuração de deploy do projeto **engima** no Cloudflare Pages.

## Secrets necessários no GitHub

Configure no repositório:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

## Projeto Cloudflare Pages

Crie um projeto no Cloudflare Pages com o nome:

`engima`

Depois disso:

- Push em `main` publica produção.
- Push em outras branches gera preview/dev automaticamente pelo workflow.

