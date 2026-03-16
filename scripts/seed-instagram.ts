import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function seed() {
  const criadores = [
    {
      nome: '@forbesbr',
      plataforma: 'instagram',
      canal_url: 'https://instagram.com/forbesbr',
      rss_url: 'https://rss-bridge.org/bridge01/?action=display&bridge=InstagramBridge&username=forbesbr&format=Json',
      categoria: 'negocios',
      tags: ['negocios', 'empreendedorismo', 'forbes'],
    },
    {
      nome: '@rony',
      plataforma: 'instagram',
      canal_url: 'https://instagram.com/rony',
      rss_url: 'https://rss-bridge.org/bridge01/?action=display&bridge=InstagramBridge&username=rony&format=Json',
      categoria: 'marketing',
      tags: ['marketing', 'vendas'],
    },
    {
      nome: '@osdesbugados',
      plataforma: 'instagram',
      canal_url: 'https://instagram.com/osdesbugados',
      rss_url:
        'https://rss-bridge.org/bridge01/?action=display&bridge=InstagramBridge&username=osdesbugados&format=Json',
      categoria: 'tecnologia',
      tags: ['tech', 'ia', 'desbugados'],
    },
    {
      nome: '@tiagotessmann',
      plataforma: 'instagram',
      canal_url: 'https://instagram.com/tiagotessmann',
      rss_url:
        'https://rss-bridge.org/bridge01/?action=display&bridge=InstagramBridge&username=tiagotessmann&format=Json',
      categoria: 'tecnologia',
      tags: ['ia', 'tech'],
    },
    {
      nome: '@diegoalmeida.ia',
      plataforma: 'instagram',
      canal_url: 'https://instagram.com/diegoalmeida.ia',
      rss_url:
        'https://rss-bridge.org/bridge01/?action=display&bridge=InstagramBridge&username=diegoalmeida.ia&format=Json',
      categoria: 'ia',
      tags: ['ia', 'agentes', 'automacao'],
    },
    {
      nome: '@yagomartinsbr',
      plataforma: 'instagram',
      canal_url: 'https://instagram.com/yagomartinsbr',
      rss_url:
        'https://rss-bridge.org/bridge01/?action=display&bridge=InstagramBridge&username=yagomartinsbr&format=Json',
      categoria: 'marketing',
      tags: ['marketing', 'digital'],
    },
    {
      nome: '@hollyfield.ia',
      plataforma: 'instagram',
      canal_url: 'https://instagram.com/hollyfield.ia',
      rss_url:
        'https://rss-bridge.org/bridge01/?action=display&bridge=InstagramBridge&username=hollyfield.ia&format=Json',
      categoria: 'ia',
      tags: ['ia', 'tech'],
    },
    {
      nome: '@botconversa',
      plataforma: 'instagram',
      canal_url: 'https://instagram.com/botconversa',
      rss_url:
        'https://rss-bridge.org/bridge01/?action=display&bridge=InstagramBridge&username=botconversa&format=Json',
      categoria: 'automacao',
      tags: ['bot', 'automacao', 'whatsapp'],
    },
    {
      nome: '@renatoasse',
      plataforma: 'instagram',
      canal_url: 'https://instagram.com/renatoasse',
      rss_url:
        'https://rss-bridge.org/bridge01/?action=display&bridge=InstagramBridge&username=renatoasse&format=Json',
      categoria: 'marketing',
      tags: ['marketing', 'vendas'],
    },
    {
      nome: '@lucasrochaator',
      plataforma: 'instagram',
      canal_url: 'https://instagram.com/lucasrochaator',
      rss_url:
        'https://rss-bridge.org/bridge01/?action=display&bridge=InstagramBridge&username=lucasrochaator&format=Json',
      categoria: 'negocios',
      tags: ['negocios', 'actor'],
    },
    {
      nome: '@giubeckers',
      plataforma: 'instagram',
      canal_url: 'https://instagram.com/giubeckers',
      rss_url:
        'https://rss-bridge.org/bridge01/?action=display&bridge=InstagramBridge&username=giubeckers&format=Json',
      categoria: 'marketing',
      tags: ['marketing', 'conteudo'],
    },
    {
      nome: '@luvadeaplicativo',
      plataforma: 'instagram',
      canal_url: 'https://instagram.com/luvadeaplicativo',
      rss_url:
        'https://rss-bridge.org/bridge01/?action=display&bridge=InstagramBridge&username=luvadeaplicativo&format=Json',
      categoria: 'tecnologia',
      tags: ['apps', 'tech'],
    },
    {
      nome: '@rafael.riedel',
      plataforma: 'instagram',
      canal_url: 'https://instagram.com/rafael.riedel',
      rss_url:
        'https://rss-bridge.org/bridge01/?action=display&bridge=InstagramBridge&username=rafael.riedel&format=Json',
      categoria: 'negocios',
      tags: ['negocios', 'empreendedorismo'],
    },
  ];

  const { error } = await supabase.from('criadores_radar').upsert(criadores, { onConflict: 'canal_url' });

  if (error) console.error('Erro:', error);
  else console.log(`✅ ${criadores.length} criadores inseridos com sucesso`);
}

void seed();
