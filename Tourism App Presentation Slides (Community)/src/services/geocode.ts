export interface GeoPoint { lat: number; lon: number }

export async function geocodeCity(city: string, signal?: AbortSignal): Promise<GeoPoint | null> {
  try {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("q", `${city}, Minas Gerais, Brasil`);
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", "1");
    const res = await fetch(url.toString(), {
      headers: { "Accept": "application/json", "User-Agent": "DoraApp/1.0" },
      signal,
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (Array.isArray(data) && data[0]) {
      return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
    }
    return null;
  } catch {
    return null;
  }
}

