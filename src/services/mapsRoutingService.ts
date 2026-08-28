/**
 * Maps Routing & Travel Time Service
 * Fetches real road driving duration, distance, and exact road geometry coordinates
 * from live Maps routing engines (OSRM / OpenStreetMap & Google Maps integration)
 */

export interface MapsRouteResult {
  distanceKm: number;
  durationMinutes: number;
  durationHours: number;
  durationText: string;
  waypointsCoordinates: { lat: number; lon: number; fraction: number }[];
  isLiveMapsData: boolean;
  source: 'OpenStreetMap / OSRM Routing' | 'Estimation Géométrique' | 'Estimation Géométrique Calibrée Maps';
}

/**
 * Fetch real driving route, duration and distance from live Maps Routing API
 */
export async function fetchMapsRoute(
  origin: { lat: number; lon: number },
  destination: { lat: number; lon: number },
  numWaypoints: number = 5
): Promise<MapsRouteResult> {
  const cacheKey = `maps_route_${origin.lat.toFixed(4)}_${origin.lon.toFixed(4)}_${destination.lat.toFixed(4)}_${destination.lon.toFixed(4)}`;

  // Check sessionStorage cache to prevent repeated route queries
  try {
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && parsed.distanceKm) {
        return parsed;
      }
    }
  } catch {
    // Ignore cache error
  }

  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${origin.lon},${origin.lat};${destination.lon},${destination.lat}?overview=full&geometries=geojson&steps=false`;
    const response = await fetch(url, { signal: AbortSignal.timeout(6000) });

    if (response.ok) {
      const data = await response.json();
      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const distKm = Math.max(1, Math.round(route.distance / 1000));
        const durSec = route.duration;
        const durTotalMinutes = Math.round(durSec / 60);
        const durHours = durSec / 3600;

        const durH = Math.floor(durTotalMinutes / 60);
        const durM = durTotalMinutes % 60;
        const durationText = durH > 0 ? `${durH}h${durM.toString().padStart(2, '0')}` : `${durM} min`;

        // Extract coordinates along the actual road path
        const rawCoords: [number, number][] = route.geometry?.coordinates || [];
        const waypointsCoordinates: { lat: number; lon: number; fraction: number }[] = [];

        if (rawCoords.length > 0) {
          for (let i = 0; i < numWaypoints; i++) {
            const fraction = i / (numWaypoints - 1);
            const index = Math.min(
              rawCoords.length - 1,
              Math.floor(fraction * (rawCoords.length - 1))
            );
            const coord = rawCoords[index];
            waypointsCoordinates.push({
              lon: coord[0],
              lat: coord[1],
              fraction,
            });
          }
        }

        const result: MapsRouteResult = {
          distanceKm: distKm,
          durationMinutes: durTotalMinutes,
          durationHours: durHours,
          durationText,
          waypointsCoordinates:
            waypointsCoordinates.length > 0
              ? waypointsCoordinates
              : fallbackCoordinates(origin, destination, numWaypoints),
          isLiveMapsData: true,
          source: 'OpenStreetMap / OSRM Routing',
        };

        try {
          sessionStorage.setItem(cacheKey, JSON.stringify(result));
        } catch {
          // Ignore storage quota
        }

        return result;
      }
    }
  } catch (error) {
    console.warn('Maps Routing API unavailable, falling back to geometric estimation:', error);
  }

  // Fallback calculation if offline or API limit reached
  return calculateFallbackRoute(origin, destination, numWaypoints);
}

function calculateHaversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function fallbackCoordinates(
  origin: { lat: number; lon: number },
  destination: { lat: number; lon: number },
  numWaypoints: number
): { lat: number; lon: number; fraction: number }[] {
  const coords: { lat: number; lon: number; fraction: number }[] = [];
  for (let i = 0; i < numWaypoints; i++) {
    const fraction = i / (numWaypoints - 1);
    coords.push({
      lat: origin.lat + (destination.lat - origin.lat) * fraction,
      lon: origin.lon + (destination.lon - origin.lon) * fraction,
      fraction,
    });
  }
  return coords;
}

function calculateFallbackRoute(
  origin: { lat: number; lon: number },
  destination: { lat: number; lon: number },
  numWaypoints: number
): MapsRouteResult {
  const straight = calculateHaversineKm(origin.lat, origin.lon, destination.lat, destination.lon);
  const roadDistKm = Math.max(5, Math.round(straight * 1.28));
  
  // Real-world driving speeds calibrated to Google Maps / Waze in France
  // Dense urban/suburban (e.g. Paris ➔ Trappes, Versailles, Banlieue): ~44 km/h with traffic & junctions
  const avgSpeedKmh = roadDistKm > 300 ? 105 : roadDistKm > 100 ? 86 : roadDistKm > 45 ? 65 : 44;
  const durHours = roadDistKm / avgSpeedKmh;
  const durTotalMinutes = Math.max(5, Math.round(durHours * 60));

  const durH = Math.floor(durTotalMinutes / 60);
  const durM = durTotalMinutes % 60;
  const durationText = durH > 0 ? `${durH}h${durM.toString().padStart(2, '0')}` : `${durM} min`;

  return {
    distanceKm: roadDistKm,
    durationMinutes: durTotalMinutes,
    durationHours: durHours,
    durationText,
    waypointsCoordinates: fallbackCoordinates(origin, destination, numWaypoints),
    isLiveMapsData: false,
    source: 'Estimation Géométrique Calibrée Maps',
  };
}

export type CoordinatePoint =
  | { latitude: number; longitude: number; name?: string }
  | { lat: number; lon: number; name?: string };

function getLatLon(point: CoordinatePoint): { lat: number; lon: number; name?: string } {
  if ('latitude' in point) {
    return { lat: point.latitude, lon: point.longitude, name: point.name };
  }
  return { lat: point.lat, lon: point.lon, name: point.name };
}

/**
 * Generate Google Maps navigation URL
 */
export function getGoogleMapsUrl(
  origin: CoordinatePoint,
  destination: CoordinatePoint
): string {
  const o = getLatLon(origin);
  const d = getLatLon(destination);

  const originParam = o.name ? encodeURIComponent(o.name) : `${o.lat},${o.lon}`;
  const destParam = d.name ? encodeURIComponent(d.name) : `${d.lat},${d.lon}`;

  return `https://www.google.com/maps/dir/?api=1&origin=${originParam}&destination=${destParam}&travelmode=driving`;
}

/**
 * Generate Waze navigation URL
 */
export function getWazeUrl(destination: CoordinatePoint): string {
  const d = getLatLon(destination);
  return `https://waze.com/ul?ll=${d.lat},${d.lon}&navigate=yes`;
}
