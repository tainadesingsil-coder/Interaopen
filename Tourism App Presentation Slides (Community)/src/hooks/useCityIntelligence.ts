import { useEffect, useMemo, useState } from "react";
import { fetchMinasCities } from "../services/ibge";

interface Place {
  id: string;
  name: string;
  category: string;
  description?: string;
  image?: string;
  lat?: number;
  lon?: number;
  rating?: number;
}

interface CityIntelState {
  cities: string[];
  loadingCities: boolean;
  places: Place[];
  loadingPlaces: boolean;
  error?: string;
}

export function useCityIntelligence(city: string, interests: string[]) {
  const [state, setState] = useState<CityIntelState>({
    cities: [],
    loadingCities: true,
    places: [],
    loadingPlaces: false,
  });

  // Load IBGE cities list
  useEffect(() => {
    const ctrl = new AbortController();
    setState((s) => ({ ...s, loadingCities: true }));
    fetchMinasCities(ctrl.signal)
      .then((cities) => setState((s) => ({ ...s, cities: cities, loadingCities: false })))
      .catch(() => setState((s) => ({ ...s, loadingCities: false })));
    return () => ctrl.abort();
  }, []);

  // Query Overpass (OpenStreetMap) for interests in the selected city
  useEffect(() => {
    if (!city) return;
    const ctrl = new AbortController();
    const categories = interests.length ? interests : ["restaurant", "tourism", "hotel", "shop"];
    const filters = categories
      .map((c) => {
        if (c === "restaurant") return "node[amenity=restaurant]";
        if (c === "hotel") return "node[tourism=hotel]";
        if (c === "shop") return "node[shop]";
        if (c === "culture" || c === "historical") return "node[tourism=attraction]";
        if (c === "waterfall") return "node[natural=waterfall]";
        if (c === "lake") return "node[natural=water]";
        if (c === "mountain") return "node[natural=peak]";
        return "node[tourism]";
      })
      .join(";\n");

    // Overpass: find city boundary and fetch POIs
    const query = `
      [out:json][timeout:25];
      area["name"="${city}"]["boundary"="administrative"]["admin_level"~"^(8|9|10)$"]; // city area
      ( ${filters}; );
      (._;>;);
      out body;
    `;

    async function run() {
      try {
        setState((s) => ({ ...s, loadingPlaces: true }));
        const res = await fetch("https://overpass-api.de/api/interpreter", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({ data: query }).toString(),
          signal: ctrl.signal,
        });
        if (!res.ok) throw new Error(String(res.status));
        const data = await res.json();
        const nodes: any[] = Array.isArray(data?.elements) ? data.elements.filter((e: any) => e.type === "node") : [];
        const places: Place[] = nodes.slice(0, 40).map((n) => ({
          id: String(n.id),
          name: n.tags?.name || "Ponto de interesse",
          category: n.tags?.amenity || n.tags?.tourism || n.tags?.shop || n.tags?.natural || "place",
          description: n.tags?.description || "",
          lat: n.lat,
          lon: n.lon,
          image: undefined,
        }));
        setState((s) => ({ ...s, places, loadingPlaces: false }));
      } catch (e: any) {
        setState((s) => ({ ...s, loadingPlaces: false, error: e?.message || "overpass" }));
      }
    }

    run();
    return () => ctrl.abort();
  }, [city, interests.join(",")]);

  return state;
}

