// Géocodage gratuit via Photon (komoot, basé sur OpenStreetMap). Pas de clé API.
// Choisi plutôt que Nominatim car ce dernier renvoie 403 sans User-Agent valide,
// header que React Native ne transmet pas de façon fiable depuis fetch.

export interface GeoCoords {
  latitude: number;
  longitude: number;
}

const PHOTON = 'https://photon.komoot.io/api/';

// `bias` (coordonnées de la destination) oriente la recherche vers la bonne
// région sans altérer le texte de l'adresse — bien plus fiable que d'ajouter la
// destination à la requête (qui brouille les adresses complètes).
export async function geocodeAddress(query: string, bias?: GeoCoords): Promise<GeoCoords | null> {
  const q = query.trim();
  if (!q) return null;
  let url = `${PHOTON}?limit=1&q=${encodeURIComponent(q)}`;
  if (bias) url += `&lat=${bias.latitude}&lon=${bias.longitude}`;
  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      features?: Array<{ geometry?: { coordinates?: [number, number] } }>;
    };
    // GeoJSON : coordinates = [longitude, latitude]
    const coords = data.features?.[0]?.geometry?.coordinates;
    if (!coords || coords.length < 2) return null;
    const [lon, lat] = coords;
    if (Number.isNaN(lat) || Number.isNaN(lon)) return null;
    return { latitude: lat, longitude: lon };
  } catch {
    return null;
  }
}

// Petite pause entre deux requêtes pour rester poli avec le service.
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
