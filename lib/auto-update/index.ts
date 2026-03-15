import { atualizarNoticiasAutomaticas } from '@/lib/auto-update/noticias';
import { atualizarYoutubeAutomatico } from '@/lib/auto-update/youtube';
import { atualizarLivesTwitch } from '@/lib/auto-update/twitch';
import { atualizarPodcastsAutomaticos } from '@/lib/auto-update/podcasts';
import { atualizarTikTokAutomatico } from '@/lib/auto-update/tiktok';
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
  const [noticias, youtube, twitch, podcasts, tiktok, instagram] = await Promise.all([
    atualizarNoticiasAutomaticas(),
    atualizarYoutubeAutomatico(),
    atualizarLivesTwitch(),
    atualizarPodcastsAutomaticos(),
    atualizarTikTokAutomatico(),
    atualizarInstagramAutomatico(),
  ]);

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
