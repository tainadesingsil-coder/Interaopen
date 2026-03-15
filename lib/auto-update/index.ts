import { atualizarNoticiasAutomaticas } from '@/lib/auto-update/noticias';
import { atualizarYoutubeAutomatico } from '@/lib/auto-update/youtube';
import { atualizarLivesTwitch } from '@/lib/auto-update/twitch';
import { atualizarPodcastsAutomaticos } from '@/lib/auto-update/podcasts';

export type AtualizacaoCompletaResumo = {
  atualizado_em: string;
  noticias: Awaited<ReturnType<typeof atualizarNoticiasAutomaticas>>;
  youtube: Awaited<ReturnType<typeof atualizarYoutubeAutomatico>>;
  twitch: Awaited<ReturnType<typeof atualizarLivesTwitch>>;
  podcasts: Awaited<ReturnType<typeof atualizarPodcastsAutomaticos>>;
};

export async function atualizarTodoConteudo(): Promise<AtualizacaoCompletaResumo> {
  const [noticias, youtube, twitch, podcasts] = await Promise.all([
    atualizarNoticiasAutomaticas(),
    atualizarYoutubeAutomatico(),
    atualizarLivesTwitch(),
    atualizarPodcastsAutomaticos(),
  ]);

  return {
    atualizado_em: new Date().toISOString(),
    noticias,
    youtube,
    twitch,
    podcasts,
  };
}
