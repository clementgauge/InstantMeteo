import { LocationPoint } from '../types/weather';

export interface StationLiveWeather {
  temp: number;
  feelsLike: number;
  windSpeed: number;
  windGusts?: number;
  windDirection?: number;
  humidity: number;
  weatherCode: number;
  timestamp: number;
  isLive: boolean;
}

// In-memory cache with 5-minute TTL
const weatherCache = new Map<string, StationLiveWeather>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// Track currently pending fetch keys to avoid duplicate parallel requests
const pendingFetches = new Set<string>();

/**
 * Fetch real-time live meteorological data for an arbitrary list of stations worldwide using Open-Meteo
 */
export async function fetchLiveWeatherForStations(
  stations: LocationPoint[]
): Promise<Record<string, StationLiveWeather>> {
  const result: Record<string, StationLiveWeather> = {};
  const now = Date.now();

  const stationsToFetch: LocationPoint[] = [];

  for (const st of stations) {
    if (st.latitude === undefined || st.longitude === undefined) continue;
    const cached = weatherCache.get(st.id);
    if (cached && now - cached.timestamp < CACHE_TTL_MS) {
      result[st.id] = cached;
    } else {
      if (!pendingFetches.has(st.id)) {
        stationsToFetch.push(st);
      } else if (cached) {
        result[st.id] = cached;
      }
    }
  }

  if (stationsToFetch.length === 0) {
    return result;
  }

  // Mark pending
  stationsToFetch.forEach(st => pendingFetches.add(st.id));

  // Chunk stations into batches of up to 40 stations per Open-Meteo request
  const CHUNK_SIZE = 40;
  const chunks: LocationPoint[][] = [];
  for (let i = 0; i < stationsToFetch.length; i += CHUNK_SIZE) {
    chunks.push(stationsToFetch.slice(i, i + CHUNK_SIZE));
  }

  try {
    await Promise.allSettled(
      chunks.map(async (chunk) => {
        try {
          const lats = chunk.map(s => (s.latitude || 0).toFixed(4)).join(',');
          const lons = chunk.map(s => (s.longitude || 0).toFixed(4)).join(',');

          const url = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,wind_direction_10m,wind_gusts_10m,weather_code&timezone=auto`;

          const res = await fetch(url);
          if (!res.ok && !(res.status >= 200 && res.status < 400)) throw new Error(`Open-Meteo error: ${res.status}`);

          const rawData = await res.json();
          const items = Array.isArray(rawData) ? rawData : [rawData];

          items.forEach((item, idx) => {
            const st = chunk[idx];
            if (!st) return;

            if (item && item.current) {
              const liveData: StationLiveWeather = {
                temp: Number((item.current.temperature_2m ?? 20).toFixed(1)),
                feelsLike: Number((item.current.apparent_temperature ?? item.current.temperature_2m ?? 20).toFixed(1)),
                windSpeed: Math.round(item.current.wind_speed_10m ?? 15),
                windGusts: item.current.wind_gusts_10m ? Math.round(item.current.wind_gusts_10m) : undefined,
                windDirection: item.current.wind_direction_10m ? Math.round(item.current.wind_direction_10m) : undefined,
                humidity: Math.round(item.current.relative_humidity_2m ?? 60),
                weatherCode: item.current.weather_code ?? 0,
                timestamp: Date.now(),
                isLive: true
              };

              weatherCache.set(st.id, liveData);
              result[st.id] = liveData;
            }
          });
        } catch (err) {
          console.warn('Batch live weather fetch error:', err);
        }
      })
    );
  } finally {
    stationsToFetch.forEach(st => pendingFetches.delete(st.id));
  }

  // Populate any remaining from cache
  for (const st of stations) {
    if (!result[st.id] && weatherCache.has(st.id)) {
      result[st.id] = weatherCache.get(st.id)!;
    }
  }

  return result;
}

export function getCachedStationWeather(stationId: string): StationLiveWeather | undefined {
  return weatherCache.get(stationId);
}
