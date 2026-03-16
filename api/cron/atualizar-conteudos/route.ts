import { buscarConteudosCriadores } from '@/lib/buscar-conteudos';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const resultado = await buscarConteudosCriadores();
    return Response.json(
      {
        ok: true,
        atualizado_em: new Date().toISOString(),
        ...resultado,
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao atualizar conteúdos.';
    return Response.json(
      {
        ok: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
