create table if not exists conteudos_radar (
  id uuid default gen_random_uuid() primary key,
  criador_id uuid references criadores_radar(id),
  tipo text,
  titulo text,
  url text unique,
  thumbnail text,
  descricao text,
  publicado_em timestamp,
  criado_em timestamp default now()
);

create index if not exists idx_conteudos_criador
on conteudos_radar(criador_id);

create index if not exists idx_conteudos_publicado
on conteudos_radar(publicado_em desc);
