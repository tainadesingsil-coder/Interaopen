type ConteudoPayload = {
  tipo: string;
  titulo: string;
  url: string;
  categoria: string;
};

/**
 * Registra uma interação de conteúdo para uso futuro.
 * Esta função é exportada para integração posterior.
 */
export async function rastrearConteudo(
  tipo: string,
  titulo: string,
  url: string,
  categoria: string,
): Promise<void> {
  const payload: ConteudoPayload = { tipo, titulo, url, categoria };

  await fetch("/api/rastrear-conteudo", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}
