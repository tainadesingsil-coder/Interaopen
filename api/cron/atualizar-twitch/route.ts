import { atualizarLivesTwitch } from '@/lib/auto-update/twitch';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const resumo = await atualizarLivesTwitch();
    return Response.json(
      {
        ok: true,
        atualizado_em: new Date().toISOString(),
        twitch: resumo,
      },
      { status: 200 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Erro ao atualizar lives da Twitch.';
    return Response.json(
      {
        ok: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
