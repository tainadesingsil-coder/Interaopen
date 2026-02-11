# HookFlow SaaS Base

Base de SaaS para processar leads do **Facebook Lead Ads** com:

- Recebimento de webhook (`/api/webhooks/facebook-leads`)
- Persistência no **Supabase/PostgreSQL**
- Enriquecimento automático por e-mail (**Clearbit** ou **Apollo**)
- Geração de estratégia personalizada de abordagem (2 frases) com **OpenAI GPT-4o**
- Dashboard moderno para vendedor (`/dashboard`) com botão **Chamar no WhatsApp**

---

## Stack

- Next.js 14 (App Router)
- Tailwind CSS
- Supabase (`@supabase/supabase-js`)
- OpenAI API (HTTP)

---

## Como rodar

```bash
npm install
cp .env.example .env.local
npm run dev
```

Aplicação:
- Home: `http://localhost:3000`
- Dashboard: `http://localhost:3000/dashboard`

---

## Variáveis de ambiente

Defina no `.env.local`:

```bash
# Supabase
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

# Facebook Lead Ads
FACEBOOK_VERIFY_TOKEN=
FACEBOOK_APP_SECRET=
FACEBOOK_GRAPH_ACCESS_TOKEN=

# Enriquecimento
ENRICHMENT_PROVIDER=auto
CLEARBIT_API_KEY=
APOLLO_API_KEY=

# OpenAI
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o

# WhatsApp fallback do vendedor
NEXT_PUBLIC_WHATSAPP_NUMBER=5511999999999
```

---

## Banco de dados (Supabase)

Execute a migration:

`supabase/migrations/202602100001_create_hookflow_leads.sql`

Tabela criada: `public.hookflow_leads`

Campos principais:
- Dados do lead (`full_name`, `email`, `phone`, `facebook_lead_id`)
- Payload bruto (`raw_webhook`)
- Enriquecimento (`enrichment_source`, `enrichment_data`)
- IA (`approach_strategy`)
- WhatsApp (`whatsapp_message`)
- Controle (`status`, `processing_error`, `created_at`)

---

## Webhook do Facebook

Endpoint:

`/api/webhooks/facebook-leads`

### Verificação (GET)
Suporta `hub.mode`, `hub.challenge`, `hub.verify_token`.

### Recebimento (POST)
Suporta:
1. Payload oficial Facebook com `leadgen_id` (consulta Graph API para buscar `field_data`)
2. Payload simplificado para testes internos

Exemplo de payload simplificado:

```json
{
  "lead": {
    "leadgen_id": "123456789",
    "full_name": "Ana Martins",
    "email": "ana@empresa.com",
    "phone": "+55 11 99999-0000",
    "form_id": "form_001",
    "ad_id": "ad_001",
    "page_id": "page_001"
  }
}
```

Teste local:

```bash
curl -X POST http://localhost:3000/api/webhooks/facebook-leads \
  -H "Content-Type: application/json" \
  -d '{"lead":{"leadgen_id":"123","full_name":"Ana Martins","email":"ana@empresa.com","phone":"+55 11 99999-0000"}}'
```

---

## Dashboard de vendas

Rota: `/dashboard`

Mostra:
- Nome, e-mail e telefone
- Status do processamento
- Fonte e highlights do enriquecimento
- Estratégia personalizada (2 frases)
- Botão **Chamar no WhatsApp** com mensagem pré-montada

---

## Estrutura relevante do projeto

```bash
app/
  api/
    leads/route.ts
    webhooks/facebook-leads/route.ts
  dashboard/page.tsx
  page.tsx
lib/hookflow/
  enrichment.ts
  facebook.ts
  openai.ts
  service.ts
  supabase.ts
  types.ts
  whatsapp.ts
supabase/migrations/
  202602100001_create_hookflow_leads.sql
```
