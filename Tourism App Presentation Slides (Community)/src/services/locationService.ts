import { MGLocation, getLocationsByCityAndInterests } from "../data/minas-database";

export interface RecommendationInput {
  city: string;
  interests: MGLocation['category'][];
}

export function recommendLocations(input: RecommendationInput): MGLocation[] {
  // Em uma próxima etapa, poderíamos enriquecer com dados de redes sociais/APIs
  // Aqui filtramos por cidade e interesses, priorizando rating/reviews
  const results = getLocationsByCityAndInterests(input.city, input.interests)
    .slice()
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0) || (b.reviews ?? 0) - (a.reviews ?? 0));
  return results;
}

