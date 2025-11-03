export async function fetchMinasCities(signal?: AbortSignal): Promise<string[]> {
  try {
    const res = await fetch(
      "https://servicodados.ibge.gov.br/api/v1/localidades/estados/MG/municipios",
      {
        headers: { "Accept": "application/json" },
        signal,
      }
    );
    if (!res.ok) throw new Error(String(res.status));
    const data = (await res.json()) as Array<{ nome: string } & Record<string, unknown>>;
    const list = Array.from(new Set(data.map((d) => d.nome))).sort((a, b) => a.localeCompare(b));
    return list;
  } catch (e) {
    // Fallback vazio; chamador deve usar dataset local se necessário
    return [];
  }
}

