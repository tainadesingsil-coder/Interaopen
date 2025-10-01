import { useCity } from "../contexts/CityContext";
import { useCityIntelligence } from "./useCityIntelligence";

export function useCityContent() {
  const { selectedCity, interests } = useCity();
  const intel = useCityIntelligence(selectedCity, interests as any);
  const places = intel.places || [];

  const isCat = (p: any, cat: string) => String(p.category || "").toLowerCase().includes(cat);

  const restaurants = places.filter((p) => isCat(p, "restaurant"));
  const hotels = places.filter((p) => isCat(p, "hotel"));
  const shops = places.filter((p) => isCat(p, "shop"));
  const waterfalls = places.filter((p) => isCat(p, "waterfall"));
  const attractions = places.filter((p) => isCat(p, "attraction") || isCat(p, "culture") || isCat(p, "historical"));

  return {
    city: selectedCity,
    loading: intel.loadingPlaces,
    restaurants,
    hotels,
    shops,
    waterfalls,
    attractions,
  };
}

