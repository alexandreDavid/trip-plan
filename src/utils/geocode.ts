// Géocodage gratuit via Nominatim (OpenStreetMap). Pas de clé API.
// Politique d'usage : User-Agent identifiant + max ~1 req/s. On reste donc
// séquentiel et best-effort (usage personnel / faibles volumes).

export interface GeoCoords {
  latitude: number;
  longitude: number;
}

const NOMINATIM = 'https://nominatim.openstreetmap.org/search';

export async function geocodeAddress(query: string): Promise<GeoCoords | null> {
  const q = query.trim();
  if (!q) return null;
  const url = `${NOMINATIM}?format=json&limit=1&q=${encodeURIComponent(q)}`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'trip-plan-app/1.0 (personal trip planner)',
        Accept: 'application/json',
      },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Array<{ lat: string; lon: string }>;
    if (!data.length) return null;
    const lat = parseFloat(data[0].lat);
    const lon = parseFloat(data[0].lon);
    if (Number.isNaN(lat) || Number.isNaN(lon)) return null;
    return { latitude: lat, longitude: lon };
  } catch {
    return null;
  }
}

// Petite pause pour respecter la limite de débit de Nominatim entre deux requêtes.
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
