import type { MGLocation } from "../data/minas-database";

export interface DoraAnswerInput {
  city: string;
  interests: string[];
  places: MGLocation[] | Array<{ id: string; name: string; category: string; description?: string; lat?: number; lon?: number; image?: string; rating?: number; }>
  question: string;
}

function pickTop<T>(arr: T[], n: number): T[] {
  return arr.slice(0, n);
}

function formatPlace(p: any): string {
  const base = `• ${p.name}`;
  const cat = p.category ? ` (${p.category})` : "";
  const extra = p.description ? ` – ${p.description}` : "";
  return `${base}${cat}${extra}`;
}

export async function generateDoraAnswer(input: DoraAnswerInput): Promise<string> {
  const city = input.city;
  const q = input.question?.trim() || "";
  const interests = input.interests && input.interests.length > 0 ? input.interests : ["culture", "historical", "restaurant", "waterfall"];

  // Rank places roughly: by rating desc then name
  const places = [...input.places].sort((a: any, b: any) => (b.rating ?? 0) - (a.rating ?? 0) || String(a.name).localeCompare(String(b.name)));

  const byCategory = interests.reduce<Record<string, any[]>>((acc, cat) => {
    acc[cat] = places.filter((p: any) => String(p.category).toLowerCase().includes(cat));
    return acc;
  }, {});

  const highlights: string[] = [];
  for (const cat of interests) {
    const top = pickTop(byCategory[cat] || [], 3).map(formatPlace);
    if (top.length) {
      const title = cat === "waterfall" ? "Cachoeiras" : cat === "lake" ? "Lagos" : cat === "restaurant" ? "Gastronomia" : cat === "hotel" ? "Hospedagem" : cat === "shop" ? "Comércio" : cat === "historical" ? "História" : cat === "culture" ? "Cultura" : cat;
      highlights.push(`- ${title}:\n${top.join("\n")}`);
    }
  }

  const intro = `Sou a Dora, sua historiadora de Minas. Planejando em ${city}${q ? `: “${q}”` : ""}?`;
  const body = highlights.length ? highlights.join("\n\n") : "Não encontrei locais suficientes para seus interesses agora. Tente ajustar os filtros.";
  const outro = "Dica: toque em ‘Como Chegar’ para abrir a rota no mapa e ajuste os filtros de interesses para refinar ainda mais.";

  return [intro, body, outro].join("\n\n");
}

