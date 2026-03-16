import { atualizarNoticiasAutomaticas } from '@/lib/auto-update/noticias';
import { atualizarYoutubeAutomatico } from '@/lib/auto-update/youtube';
import { atualizarLivesTwitch } from '@/lib/auto-update/twitch';
import { atualizarPodcastsAutomaticos } from '@/lib/auto-update/podcasts';
import { atualizarTikTokAutomatico } from '@/lib/auto-update/tiktok';
import { atualizarTikTokRssAutomatico } from '@/lib/auto-update/tiktok-rss';
import { atualizarInstagramAutomatico } from '@/lib/auto-update/instagram';

export type AtualizacaoCompletaResumo = {
  atualizado_em: string;
  noticias: Awaited<ReturnType<typeof atualizarNoticiasAutomaticas>>;
  youtube: Awaited<ReturnType<typeof atualizarYoutubeAutomatico>>;
  twitch: Awaited<ReturnType<typeof atualizarLivesTwitch>>;
  podcasts: Awaited<ReturnType<typeof atualizarPodcastsAutomaticos>>;
  tiktok: Awaited<ReturnType<typeof atualizarTikTokAutomatico>>;
  instagram: Awaited<ReturnType<typeof atualizarInstagramAutomatico>>;
};

export async function atualizarTodoConteudo(): Promise<AtualizacaoCompletaResumo> {
  const [noticias, youtube, twitch, podcasts, tiktokApi, tiktokRss, instagram] = await Promise.all([
    atualizarNoticiasAutomaticas(),
    atualizarYoutubeAutomatico(),
    atualizarLivesTwitch(),
    atualizarPodcastsAutomaticos(),
    atualizarTikTokAutomatico(),
    atualizarTikTokRssAutomatico(),
    atualizarInstagramAutomatico(),
  ]);

  const tiktok = {
    criadores_processados: Math.max(tiktokApi.criadores_processados, tiktokRss.criadores_processados),
    videos_lidos: tiktokApi.videos_lidos + tiktokRss.videos_lidos,
    videos_salvos: tiktokApi.videos_salvos + tiktokRss.videos_salvos,
  };

  return {
    atualizado_em: new Date().toISOString(),
    noticias,
    youtube,
    twitch,
    podcasts,
    tiktok,
    instagram,
  };
}
