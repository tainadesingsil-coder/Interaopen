create extension if not exists pgcrypto;

create table if not exists public.hookflow_leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  facebook_lead_id text unique,
  full_name text,
  email text not null,
  phone text,
  form_id text,
  ad_id text,
  page_id text,
  raw_webhook jsonb not null default '{}'::jsonb,
  enrichment_source text not null default 'none',
  enrichment_data jsonb,
  approach_strategy text,
  whatsapp_message text,
  status text not null default 'received',
  processing_error text
);

create index if not exists hookflow_leads_created_at_idx
  on public.hookflow_leads (created_at desc);

create index if not exists hookflow_leads_email_idx
  on public.hookflow_leads (email);

create index if not exists hookflow_leads_status_idx
  on public.hookflow_leads (status);

create or replace function public.hookflow_set_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists hookflow_leads_set_updated_at on public.hookflow_leads;

create trigger hookflow_leads_set_updated_at
before update on public.hookflow_leads
for each row
execute procedure public.hookflow_set_updated_at();
