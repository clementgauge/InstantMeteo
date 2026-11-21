export interface RecordedAltitudeEntry {
  key: string;
  name: string;
  country?: string;
  lat: number;
  lon: number;
  alt: number;
  coastal?: number | null;
  relief?: number | null;
  exposure?: number | null;
  source: 'curated' | 'dem_90m' | 'geocoding' | 'station' | 'user';
  updatedAt: number;
}

export const WORLD_ALTITUDES_STORAGE_KEY = 'im_world_altitudes_v1';

export const CURATED_WORLD_ALTITUDES: Array<{
  name: string;
  country: string;
  lat: number;
  lon: number;
  alt: number;
}> = [
  { name: 'Paris', country: 'France', lat: 48.8566, lon: 2.3522, alt: 35 },
  { name: 'Versailles', country: 'France', lat: 48.8049, lon: 2.1204, alt: 132 },
  { name: 'Lyon', country: 'France', lat: 45.7640, lon: 4.8357, alt: 173 },
  { name: 'Marseille', country: 'France', lat: 43.2965, lon: 5.3698, alt: 12 },
  { name: 'Toulouse', country: 'France', lat: 43.6047, lon: 1.4442, alt: 146 },
  { name: 'Nice', country: 'France', lat: 43.7102, lon: 7.2620, alt: 10 },
  { name: 'Bordeaux', country: 'France', lat: 44.8378, lon: -0.5792, alt: 12 },
  { name: 'Strasbourg', country: 'France', lat: 48.5734, lon: 7.7521, alt: 142 },
  { name: 'Brest', country: 'France', lat: 48.3904, lon: -4.4861, alt: 20 },
  { name: 'Nantes', country: 'France', lat: 47.2184, lon: -1.5536, alt: 20 },
  { name: 'Lille', country: 'France', lat: 50.6292, lon: 3.0573, alt: 21 },
  { name: 'Rennes', country: 'France', lat: 48.1173, lon: -1.6778, alt: 30 },
  { name: 'Montpellier', country: 'France', lat: 43.6108, lon: 3.8767, alt: 27 },
  { name: 'Grenoble', country: 'France', lat: 45.1885, lon: 5.7245, alt: 214 },
  { name: 'Clermont-Ferrand', country: 'France', lat: 45.7772, lon: 3.0870, alt: 358 },
  { name: 'Chamonix-Mont-Blanc', country: 'France', lat: 45.9237, lon: 6.8694, alt: 1035 },
  { name: 'Chamonix', country: 'France', lat: 45.9237, lon: 6.8694, alt: 1035 },
  { name: 'Briançon', country: 'France', lat: 44.8962, lon: 6.6436, alt: 1326 },
  { name: 'Ajaccio', country: 'France', lat: 41.9192, lon: 8.7386, alt: 10 },
  { name: 'Val Thorens', country: 'France', lat: 45.2980, lon: 6.5800, alt: 2300 },
  { name: 'Tignes', country: 'France', lat: 45.4694, lon: 6.9065, alt: 2100 },
  { name: "Val d'Isère", country: 'France', lat: 45.4480, lon: 6.9806, alt: 1850 },
  { name: 'Courchevel', country: 'France', lat: 45.4150, lon: 6.6347, alt: 1850 },
  { name: 'La Plagne', country: 'France', lat: 45.5067, lon: 6.6772, alt: 1970 },
  { name: 'Les Arcs', country: 'France', lat: 45.5714, lon: 6.8286, alt: 1800 },
  { name: "L'Alpe d'Huez", country: 'France', lat: 45.0924, lon: 6.0704, alt: 1860 },
  { name: 'Les Deux Alpes', country: 'France', lat: 45.0089, lon: 6.1228, alt: 1650 },
  { name: 'Avoriaz', country: 'France', lat: 46.1917, lon: 6.7747, alt: 1800 },
  { name: 'Chamrousse', country: 'France', lat: 45.1119, lon: 5.8758, alt: 1750 },
  { name: 'Méribel', country: 'France', lat: 45.3967, lon: 6.5656, alt: 1450 },
  { name: 'Mouthe', country: 'France', lat: 46.7106, lon: 6.1939, alt: 935 },
  { name: 'Font-Romeu', country: 'France', lat: 42.5044, lon: 2.0372, alt: 1800 },
  { name: 'Super-Besse', country: 'France', lat: 45.5094, lon: 2.8531, alt: 1350 },
  { name: 'Gérardmer', country: 'France', lat: 48.0725, lon: 6.8789, alt: 675 },
  { name: 'Saint-Véran', country: 'France', lat: 44.7003, lon: 6.8686, alt: 2042 },
  { name: 'Genève', country: 'Suisse', lat: 46.2044, lon: 6.1432, alt: 375 },
  { name: 'Zurich', country: 'Suisse', lat: 47.3769, lon: 8.5417, alt: 408 },
  { name: 'Zermatt', country: 'Suisse', lat: 46.0207, lon: 7.7491, alt: 1608 },
  { name: 'Saint-Moritz', country: 'Suisse', lat: 46.4908, lon: 9.8355, alt: 1822 },
  { name: 'Innsbruck', country: 'Autriche', lat: 47.2692, lon: 11.4041, alt: 574 },
  { name: 'Andorre-la-Vieille', country: 'Andorre', lat: 42.5063, lon: 1.5218, alt: 1023 },
  { name: 'Madrid', country: 'Espagne', lat: 40.4168, lon: -3.7038, alt: 657 },
  { name: 'Londres', country: 'Royaume-Uni', lat: 51.5074, lon: -0.1278, alt: 11 },
  { name: 'Bruxelles', country: 'Belgique', lat: 50.8503, lon: 4.3517, alt: 13 },
  { name: 'Amsterdam', country: 'Pays-Bas', lat: 52.3676, lon: 4.9041, alt: 2 },
  { name: 'Berlin', country: 'Allemagne', lat: 52.5200, lon: 13.4050, alt: 34 },
  { name: 'Munich', country: 'Allemagne', lat: 48.1351, lon: 11.5820, alt: 519 },
  { name: 'Rome', country: 'Italie', lat: 41.9028, lon: 12.4964, alt: 21 },
  { name: 'Milan', country: 'Italie', lat: 45.4642, lon: 9.1900, alt: 122 },
  { name: 'Oslo', country: 'Norvège', lat: 59.9139, lon: 10.7522, alt: 23 },
  { name: 'Reykjavik', country: 'Islande', lat: 64.1466, lon: -21.9426, alt: 15 },
  { name: 'Montréal', country: 'Canada', lat: 45.5017, lon: -73.5673, alt: 36 },
  { name: 'Québec', country: 'Canada', lat: 46.8139, lon: -71.2080, alt: 98 },
  { name: 'New York', country: 'États-Unis', lat: 40.7128, lon: -74.0060, alt: 10 },
  { name: 'Denver', country: 'États-Unis', lat: 39.7392, lon: -104.9903, alt: 1609 },
  { name: 'Salt Lake City', country: 'États-Unis', lat: 40.7608, lon: -111.8910, alt: 1288 },
  { name: 'Mexico', country: 'Mexique', lat: 19.4326, lon: -99.1332, alt: 2240 },
  { name: 'Bogota', country: 'Colombie', lat: 4.7110, lon: -74.0721, alt: 2625 },
  { name: 'Quito', country: 'Équateur', lat: -0.1807, lon: -78.4678, alt: 2850 },
  { name: 'La Paz', country: 'Bolivie', lat: -16.4897, lon: -68.1193, alt: 3640 },
  { name: 'El Alto', country: 'Bolivie', lat: -16.5048, lon: -68.1633, alt: 4061 },
  { name: 'Cusco', country: 'Pérou', lat: -13.5319, lon: -71.9675, alt: 3399 },
  { name: 'Santiago', country: 'Chili', lat: -33.4489, lon: -70.6693, alt: 570 },
  { name: 'Buenos Aires', country: 'Argentine', lat: -34.6037, lon: -58.3816, alt: 25 },
  { name: 'São Paulo', country: 'Brésil', lat: -23.5505, lon: -46.6333, alt: 760 },
  { name: 'Rio de Janeiro', country: 'Brésil', lat: -22.9068, lon: -43.1729, alt: 11 },
  { name: 'Tokyo', country: 'Japon', lat: 35.6762, lon: 139.6503, alt: 40 },
  { name: 'Pékin', country: 'Chine', lat: 39.9042, lon: 116.4074, alt: 43 },
  { name: 'Lhassa', country: 'Chine', lat: 29.6520, lon: 91.1721, alt: 3656 },
  { name: 'Katmandou', country: 'Népal', lat: 27.7172, lon: 85.3240, alt: 1400 },
  { name: 'Séoul', country: 'Corée du Sud', lat: 37.5665, lon: 126.9780, alt: 38 },
  { name: 'Sydney', country: 'Australie', lat: -33.8688, lon: 151.2093, alt: 19 },
  { name: 'Addis-Abeba', country: 'Éthiopie', lat: 9.0320, lon: 38.7469, alt: 2355 },
  { name: 'Nairobi', country: 'Kenya', lat: -1.2921, lon: 36.8219, alt: 1795 },
  { name: 'Johannesburg', country: 'Afrique du Sud', lat: -26.2041, lon: 28.0473, alt: 1753 },
  { name: 'Marrakech', country: 'Maroc', lat: 31.6295, lon: -7.9811, alt: 466 },
  { name: 'Ifrane', country: 'Maroc', lat: 33.5228, lon: -5.1110, alt: 1665 },
  { name: 'Le Caire', country: 'Égypte', lat: 30.0444, lon: 31.2357, alt: 23 },
  { name: 'Dubaï', country: 'Émirats arabes unis', lat: 25.2048, lon: 55.2708, alt: 5 },
  { name: 'Ein Bokek (Mer Morte)', country: 'Israël', lat: 31.2000, lon: 35.3625, alt: -390 },
];

const memoryRegistry = new Map<string, RecordedAltitudeEntry>();

function normalizeText(value?: string): string {
  return (value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function buildAltitudeCoordKey(lat: number, lon: number): string {
  return `${Number(lat).toFixed(3)},${Number(lon).toFixed(3)}`;
}

function hydrateRegistry(): void {
  if (memoryRegistry.size === 0) {
    for (const item of CURATED_WORLD_ALTITUDES) {
      const key = buildAltitudeCoordKey(item.lat, item.lon);
      memoryRegistry.set(key, {
        key,
        name: item.name,
        country: item.country,
        lat: item.lat,
        lon: item.lon,
        alt: item.alt,
        source: 'curated',
        updatedAt: 0,
      });
    }
  }
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const raw = window.localStorage.getItem(WORLD_ALTITUDES_STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Record<string, RecordedAltitudeEntry>;
    if (parsed && typeof parsed === 'object') {
      for (const [k, v] of Object.entries(parsed)) {
        if (v && typeof v.alt === 'number' && !isNaN(v.alt)) {
          memoryRegistry.set(k, v);
        }
      }
    }
  } catch {
    // Ignore storage read error
  }
}

function persistRegistryToStorage(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const obj: Record<string, RecordedAltitudeEntry> = {};
    const entries = Array.from(memoryRegistry.entries())
      .filter(([, v]) => v.source !== 'curated' || v.updatedAt > 0)
      .sort((a, b) => (b[1].updatedAt || 0) - (a[1].updatedAt || 0))
      .slice(0, 600);
    for (const [k, v] of entries) {
      obj[k] = v;
    }
    window.localStorage.setItem(WORLD_ALTITUDES_STORAGE_KEY, JSON.stringify(obj));
  } catch {
    // Ignore quota errors
  }
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function getRecordedAltitudeEntry(
  lat: number,
  lon: number,
  name?: string,
  country?: string
): RecordedAltitudeEntry | null {
  hydrateRegistry();
  const exactKey = buildAltitudeCoordKey(lat, lon);
  const exact = memoryRegistry.get(exactKey);
  if (exact) return exact;

  // Nearby within 1.8 km
  let bestNear: RecordedAltitudeEntry | null = null;
  let bestDist = 1.8;
  for (const entry of memoryRegistry.values()) {
    const dist = haversineKm(lat, lon, entry.lat, entry.lon);
    if (dist < bestDist) {
      bestDist = dist;
      bestNear = entry;
    }
  }
  if (bestNear) return bestNear;

  const normName = normalizeText(name);
  const normCountry = normalizeText(country);
  if (normName) {
    for (const entry of memoryRegistry.values()) {
      if (normalizeText(entry.name) === normName) {
        if (!normCountry || !entry.country || normalizeText(entry.country) === normCountry) {
          if (haversineKm(lat, lon, entry.lat, entry.lon) < 25) {
            return entry;
          }
        }
      }
    }
  }
  return null;
}

export function recordLocalityAltitude(params: {
  lat: number;
  lon: number;
  alt: number;
  name: string;
  country?: string;
  coastal?: number | null;
  relief?: number | null;
  exposure?: number | null;
  source?: RecordedAltitudeEntry['source'];
  syncBackend?: boolean;
}): RecordedAltitudeEntry {
  hydrateRegistry();
  const clampedAlt = Math.round(Math.max(-430, Math.min(6000, params.alt)));
  const key = buildAltitudeCoordKey(params.lat, params.lon);
  const existing = memoryRegistry.get(key);
  const entry: RecordedAltitudeEntry = {
    key,
    name: params.name || existing?.name || 'Localité',
    country: params.country || existing?.country,
    lat: Number(params.lat.toFixed(4)),
    lon: Number(params.lon.toFixed(4)),
    alt: clampedAlt,
    coastal: params.coastal !== undefined ? params.coastal : existing?.coastal,
    relief: params.relief !== undefined ? params.relief : existing?.relief,
    exposure: params.exposure !== undefined ? params.exposure : existing?.exposure,
    source: params.source || 'dem_90m',
    updatedAt: Date.now(),
  };
  memoryRegistry.set(key, entry);
  persistRegistryToStorage();

  if (params.syncBackend !== false && typeof window !== 'undefined' && typeof fetch === 'function') {
    fetch('/api/world-altitudes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    }).catch(() => {});
  }
  return entry;
}

export function getRecordedAltitudesCount(): number {
  hydrateRegistry();
  return memoryRegistry.size;
}

export async function resolveAndRecordLocalityAltitude(params: {
  lat: number;
  lon: number;
  name: string;
  country?: string;
  knownAltitude?: number;
}): Promise<RecordedAltitudeEntry> {
  hydrateRegistry();
  const existing = getRecordedAltitudeEntry(params.lat, params.lon, params.name, params.country);
  if (existing && (existing.source === 'curated' || Date.now() - existing.updatedAt < 30 * 86400 * 1000)) {
    return existing;
  }

  // Try server registry first
  if (typeof window !== 'undefined' && typeof fetch === 'function') {
    try {
      const qs = new URLSearchParams({
        lat: String(params.lat),
        lon: String(params.lon),
        name: params.name || '',
      });
      const srvRes = await fetch(`/api/world-altitudes?${qs.toString()}`);
      if (srvRes.ok) {
        const srvData = await srvRes.json();
        if (srvData?.entry && typeof srvData.entry.alt === 'number') {
          return recordLocalityAltitude({
            ...srvData.entry,
            syncBackend: false,
          });
        }
      }
    } catch {
      // Ignore server registry lookup failure
    }
  }

  // Live Copernicus 90m DEM (center + 8 surrounding points ~11 km ring for coastal & relief metadata)
  try {
    const d = 0.1;
    const pts = [
      [params.lat, params.lon],
      [params.lat + d, params.lon],
      [params.lat - d, params.lon],
      [params.lat, params.lon + d],
      [params.lat, params.lon - d],
      [params.lat + d, params.lon + d],
      [params.lat + d, params.lon - d],
      [params.lat - d, params.lon + d],
      [params.lat - d, params.lon - d],
    ];
    const lats = pts.map((p) => p[0].toFixed(4)).join(',');
    const lons = pts.map((p) => p[1].toFixed(4)).join(',');
    const res = await fetch(`https://api.open-meteo.com/v1/elevation?latitude=${lats}&longitude=${lons}`);
    if (res.ok) {
      const json = await res.json();
      const elevs: number[] = Array.isArray(json?.elevation) ? json.elevation : [];
      if (elevs.length >= 1 && typeof elevs[0] === 'number' && !isNaN(elevs[0])) {
        const demCenter = Math.round(elevs[0]);
        const valid = elevs.filter((v) => typeof v === 'number' && !isNaN(v));
        const seaFrac = valid.length ? valid.filter((e) => e <= 1).length / valid.length : 0;
        const coastal = Math.max(0, Math.min(1, seaFrac * 1.4));
        const spread = valid.length ? Math.max(...valid) - Math.min(...valid) : 0;
        const relief = Math.max(0, Math.min(1, spread / 900));
        const exposure = Math.min(1.4, Math.max(0, 0.25 + 0.55 * relief + 0.35 * coastal));

        // Use known station/curated altitude if present & DEM hits extreme adjacent ridge noise (>180m)
        const hasValidKnown =
          typeof params.knownAltitude === 'number' &&
          !isNaN(params.knownAltitude) &&
          params.knownAltitude !== 0;
        const resolvedAlt =
          hasValidKnown && Math.abs((params.knownAltitude as number) - demCenter) > 180
            ? Math.round(params.knownAltitude as number)
            : demCenter;

        return recordLocalityAltitude({
          lat: params.lat,
          lon: params.lon,
          alt: resolvedAlt,
          name: params.name,
          country: params.country,
          coastal: Number(coastal.toFixed(2)),
          relief: Number(relief.toFixed(2)),
          exposure: Number(exposure.toFixed(2)),
          source: 'dem_90m',
        });
      }
    }
  } catch {
    // Fallback below
  }

  const fallbackAlt =
    typeof params.knownAltitude === 'number' && !isNaN(params.knownAltitude)
      ? Math.round(params.knownAltitude)
      : existing?.alt ?? 50;

  return recordLocalityAltitude({
    lat: params.lat,
    lon: params.lon,
    alt: fallbackAlt,
    name: params.name,
    country: params.country,
    source: typeof params.knownAltitude === 'number' ? 'station' : 'dem_90m',
    syncBackend: false,
  });
}
