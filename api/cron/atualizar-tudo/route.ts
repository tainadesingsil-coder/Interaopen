import { atualizarTodoConteudo } from '@/lib/auto-update';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const resumo = await atualizarTodoConteudo();
    return Response.json(
      {
        ok: true,
        ...resumo,
      },
      { status: 200 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Erro ao atualizar todo o conteúdo automaticamente.';
    return Response.json(
      {
        ok: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
