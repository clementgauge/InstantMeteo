export type WeatherModelId =
  | 'meteofrance_seamless'
  | 'ecmwf_ifs025'
  | 'icon_seamless'
  | 'gfs_seamless';

export type WeatherLayerMode =
  | 'radar'
  | 'temperatures'
  | 'temp850'
  | 'wind'
  | 'pressure'
  | 'lightning'
  | 'snow'
  | 'satellite';

export type SpatialFieldKey =
  | 'precip'
  | 'temp2m'
  | 'temp850'
  | 'windSpeed'
  | 'windDir'
  | 'windU'
  | 'windV'
  | 'windGust'
  | 'pressure'
  | 'cape'
  | 'clouds'
  | 'snow';

export interface WeatherModelMeta {
  id: WeatherModelId;
  shortName: string;
  label: string;
  resolution: string;
  provider: string;
}

export const WEATHER_MODELS: WeatherModelMeta[] = [
  {
    id: 'meteofrance_seamless',
    shortName: 'AROME / ARPEGE',
    label: 'AROME 1.3km / ARPEGE',
    resolution: '0.02° / 0.1°',
    provider: 'Météo-France'
  },
  {
    id: 'ecmwf_ifs025',
    shortName: 'ECMWF IFS',
    label: 'ECMWF CEP 0.25°',
    resolution: '0.25°',
    provider: 'ECMWF'
  },
  {
    id: 'icon_seamless',
    shortName: 'ICON-EU',
    label: 'ICON-D2 / EU',
    resolution: '2.2–7 km',
    provider: 'DWD'
  },
  {
    id: 'gfs_seamless',
    shortName: 'GFS',
    label: 'GFS NOAA 0.25°',
    resolution: '0.25°',
    provider: 'NOAA'
  }
];

export interface SpatialGridData {
  modelId: WeatherModelId;
  rows: number;
  cols: number;
  latMin: number;
  latMax: number;
  lonMin: number;
  lonMax: number;
  dLat: number;
  dLon: number;
  times: string[]; // ISO timestamps in UTC
  runLabel: string;
  fetchedAt: number;
  fields: Record<SpatialFieldKey, Float32Array[]>;
}

export interface PointTelemetry {
  temp2m: number;
  temp850: number;
  precip: number;
  dbz: number;
  windSpeed: number;
  windDir: number;
  windGust: number;
  pressure: number;
  cape: number;
  clouds: number;
  snow: number;
}

interface CacheEntry {
  grid: SpatialGridData;
  timestamp: number;
}

const GRID_CACHE = new Map<string, CacheEntry>();
const IN_FLIGHT_REQUESTS = new Map<string, Promise<SpatialGridData>>();
const CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * Quantizes viewport bounds with generous padding so small pans/zooms hit cache
 * and edge interpolation never clips cleanly.
 */
export function normalizeBoundsForGrid(bounds: {
  south: number;
  north: number;
  west: number;
  east: number;
}) {
  const latSpan = Math.max(2.5, Math.min(48, bounds.north - bounds.south));
  const lonSpan = Math.max(3.5, Math.min(72, bounds.east - bounds.west));

  const padLat = latSpan * 0.18;
  const padLon = lonSpan * 0.18;

  const step = latSpan > 20 ? 2.0 : latSpan > 8 ? 1.0 : 0.5;
  const quantDown = (v: number) => Math.floor(v / step) * step;
  const quantUp = (v: number) => Math.ceil(v / step) * step;

  const latMin = Math.max(-75, quantDown(bounds.south - padLat));
  const latMax = Math.min(75, quantUp(bounds.north + padLat));
  const lonMin = Math.max(-175, quantDown(bounds.west - padLon));
  const lonMax = Math.min(175, quantUp(bounds.east + padLon));

  return {
    latMin: Number(latMin.toFixed(2)),
    latMax: Number(Math.max(latMin + 1.5, latMax).toFixed(2)),
    lonMin: Number(lonMin.toFixed(2)),
    lonMax: Number(Math.max(lonMin + 2.0, lonMax).toFixed(2))
  };
}

function computeRunLabel(): string {
  const nowUtcHour = new Date().getUTCHours();
  const runCycle = Math.floor(Math.max(0, nowUtcHour - 3) / 6) * 6;
  return `Run ${String(runCycle).padStart(2, '0')}Z`;
}

export async function fetchSpatialWeatherGrid(
  modelId: WeatherModelId,
  rawBounds: { south: number; north: number; west: number; east: number }
): Promise<SpatialGridData> {
  const { latMin, latMax, lonMin, lonMax } = normalizeBoundsForGrid(rawBounds);
  const rows = 9;
  const cols = 9;
  const cacheKey = `${modelId}:${latMin}:${latMax}:${lonMin}:${lonMax}`;

  const cached = GRID_CACHE.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.grid;
  }

  const inFlight = IN_FLIGHT_REQUESTS.get(cacheKey);
  if (inFlight) {
    return inFlight;
  }

  const promise = (async () => {
    const dLat = (latMax - latMin) / (rows - 1);
    const dLon = (lonMax - lonMin) / (cols - 1);

    const reqLats: string[] = [];
    const reqLons: string[] = [];
    for (let r = 0; r < rows; r++) {
      const lat = latMin + r * dLat;
      for (let c = 0; c < cols; c++) {
        const lon = lonMin + c * dLon;
        reqLats.push(lat.toFixed(2));
        reqLons.push(lon.toFixed(2));
      }
    }

    const hourlyVars = [
      'temperature_2m',
      'precipitation',
      'wind_speed_10m',
      'wind_direction_10m',
      'wind_gusts_10m',
      'pressure_msl',
      'cloud_cover',
      'cape',
      'snowfall',
      'temperature_850hPa'
    ].join(',');

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${reqLats.join(',')}&longitude=${reqLons.join(',')}&hourly=${hourlyVars}&forecast_days=3&timezone=GMT&models=${modelId}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) {
        throw new Error(`Open-Meteo HTTP ${res.status}`);
      }
      const raw = await res.json();
      const points: any[] = Array.isArray(raw) ? raw : [raw];
      const times: string[] = points[0]?.hourly?.time || [];
      const numHours = times.length;
      const totalPts = rows * cols;

      const fieldKeys: SpatialFieldKey[] = [
        'precip',
        'temp2m',
        'temp850',
        'windSpeed',
        'windDir',
        'windU',
        'windV',
        'windGust',
        'pressure',
        'cape',
        'clouds',
        'snow'
      ];

      const fields = {} as Record<SpatialFieldKey, Float32Array[]>;
      for (const k of fieldKeys) {
        fields[k] = Array.from({ length: numHours }, () => new Float32Array(totalPts));
      }

      for (let idx = 0; idx < totalPts; idx++) {
        const h = points[idx]?.hourly;
        if (!h) continue;

        const t2m = h.temperature_2m || [];
        const t850 = h.temperature_850hPa || [];
        const prcp = h.precipitation || [];
        const wspd = h.wind_speed_10m || [];
        const wdir = h.wind_direction_10m || [];
        const wgst = h.wind_gusts_10m || [];
        const pmsl = h.pressure_msl || [];
        const cld = h.cloud_cover || [];
        const cape = h.cape || [];
        const snow = h.snowfall || [];

        for (let hr = 0; hr < numHours; hr++) {
          const temp2mVal = typeof t2m[hr] === 'number' ? t2m[hr] : 10;
          const temp850Val =
            typeof t850[hr] === 'number' ? t850[hr] : temp2mVal - 8.5;
          const precipVal = typeof prcp[hr] === 'number' ? prcp[hr] : 0;
          const spdVal = typeof wspd[hr] === 'number' ? wspd[hr] : 12;
          const dirVal = typeof wdir[hr] === 'number' ? wdir[hr] : 250;
          const gustVal = typeof wgst[hr] === 'number' ? wgst[hr] : spdVal * 1.45;
          const presVal = typeof pmsl[hr] === 'number' ? pmsl[hr] : 1015;
          const cldVal = typeof cld[hr] === 'number' ? cld[hr] : 25;
          const capeVal = typeof cape[hr] === 'number' ? cape[hr] : 0;
          const snowVal = typeof snow[hr] === 'number' ? snow[hr] : 0;

          // Meteorological wind direction is where wind blows FROM; vector (U, V) points WHERE wind blows TO
          const toRad = ((dirVal + 180) * Math.PI) / 180;
          const u = spdVal * Math.sin(toRad);
          const v = spdVal * Math.cos(toRad);

          fields.temp2m[hr][idx] = temp2mVal;
          fields.temp850[hr][idx] = temp850Val;
          fields.precip[hr][idx] = precipVal;
          fields.windSpeed[hr][idx] = spdVal;
          fields.windDir[hr][idx] = dirVal;
          fields.windU[hr][idx] = u;
          fields.windV[hr][idx] = v;
          fields.windGust[hr][idx] = gustVal;
          fields.pressure[hr][idx] = presVal;
          fields.cape[hr][idx] = capeVal;
          fields.clouds[hr][idx] = cldVal;
          fields.snow[hr][idx] = snowVal;
        }
      }

      const grid: SpatialGridData = {
        modelId,
        rows,
        cols,
        latMin,
        latMax,
        lonMin,
        lonMax,
        dLat,
        dLon,
        times,
        runLabel: computeRunLabel(),
        fetchedAt: Date.now(),
        fields
      };

      GRID_CACHE.set(cacheKey, { grid, timestamp: Date.now() });
      return grid;
    } finally {
      clearTimeout(timeout);
      IN_FLIGHT_REQUESTS.delete(cacheKey);
    }
  })();

  IN_FLIGHT_REQUESTS.set(cacheKey, promise);
  return promise;
}

/**
 * Catmull-Rom cubic 1D weight interpolation for ultra-smooth contour maps without blocky pixels.
 */
function cubicHermite(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const a = -0.5 * p0 + 1.5 * p1 - 1.5 * p2 + 0.5 * p3;
  const b = p0 - 2.5 * p1 + 2 * p2 - 0.5 * p3;
  const c = -0.5 * p0 + 0.5 * p2;
  const d = p1;
  return ((a * t + b) * t + c) * t + d;
}

/**
 * Bicubic spatial sampling with safe clamping for non-negative fields (precip, wind, cape, snow, clouds).
 */
export function sampleGridBicubic(
  grid: SpatialGridData,
  hourIndex: number,
  field: SpatialFieldKey,
  lat: number,
  lon: number,
  clampMinZero = false
): number {
  const arr = grid.fields[field]?.[hourIndex];
  if (!arr) return 0;

  const fr = Math.max(0, Math.min(grid.rows - 1.0001, (lat - grid.latMin) / grid.dLat));
  const fc = Math.max(0, Math.min(grid.cols - 1.0001, (lon - grid.lonMin) / grid.dLon));

  const r1 = Math.floor(fr);
  const c1 = Math.floor(fc);
  const tr = fr - r1;
  const tc = fc - c1;

  const clampR = (r: number) => Math.max(0, Math.min(grid.rows - 1, r));
  const clampC = (c: number) => Math.max(0, Math.min(grid.cols - 1, c));

  const get = (r: number, c: number) => arr[clampR(r) * grid.cols + clampC(c)];

  const rowVals = [0, 0, 0, 0];
  let localMin = Infinity;
  let localMax = -Infinity;

  for (let i = -1; i <= 2; i++) {
    const r = r1 + i;
    const v0 = get(r, c1 - 1);
    const v1 = get(r, c1);
    const v2 = get(r, c1 + 1);
    const v3 = get(r, c1 + 2);
    if (i === 0 || i === 1) {
      localMin = Math.min(localMin, v1, v2);
      localMax = Math.max(localMax, v1, v2);
    }
    rowVals[i + 1] = cubicHermite(v0, v1, v2, v3, tc);
  }

  let val = cubicHermite(rowVals[0], rowVals[1], rowVals[2], rowVals[3], tr);
  // Prevent spline ringing outside physical local bounds on steep fronts
  val = Math.max(localMin - (localMax - localMin) * 0.08, Math.min(localMax + (localMax - localMin) * 0.08, val));
  if (clampMinZero && val < 0) val = 0;
  return val;
}

/**
 * Fast bilinear sampler for real-time 60fps wind particle advection and hover telemetry.
 */
export function sampleGridBilinear(
  grid: SpatialGridData,
  hourIndex: number,
  field: SpatialFieldKey,
  lat: number,
  lon: number
): number {
  const arr = grid.fields[field]?.[hourIndex];
  if (!arr) return 0;

  const fr = Math.max(0, Math.min(grid.rows - 1.0001, (lat - grid.latMin) / grid.dLat));
  const fc = Math.max(0, Math.min(grid.cols - 1.0001, (lon - grid.lonMin) / grid.dLon));

  const r0 = Math.floor(fr);
  const c0 = Math.floor(fc);
  const r1 = Math.min(grid.rows - 1, r0 + 1);
  const c1 = Math.min(grid.cols - 1, c0 + 1);
  const tr = fr - r0;
  const tc = fc - c0;

  const v00 = arr[r0 * grid.cols + c0];
  const v01 = arr[r0 * grid.cols + c1];
  const v10 = arr[r1 * grid.cols + c0];
  const v11 = arr[r1 * grid.cols + c1];

  return (
    v00 * (1 - tr) * (1 - tc) +
    v01 * (1 - tr) * tc +
    v10 * tr * (1 - tc) +
    v11 * tr * tc
  );
}

export function samplePointTelemetry(
  grid: SpatialGridData,
  hourIndex: number,
  lat: number,
  lon: number
): PointTelemetry {
  const temp2m = Number(sampleGridBilinear(grid, hourIndex, 'temp2m', lat, lon).toFixed(1));
  const temp850 = Number(sampleGridBilinear(grid, hourIndex, 'temp850', lat, lon).toFixed(1));
  const precip = Number(Math.max(0, sampleGridBilinear(grid, hourIndex, 'precip', lat, lon)).toFixed(1));
  const u = sampleGridBilinear(grid, hourIndex, 'windU', lat, lon);
  const v = sampleGridBilinear(grid, hourIndex, 'windV', lat, lon);
  const windSpeed = Math.round(Math.hypot(u, v));
  const windDir = Math.round((((Math.atan2(-u, -v) * 180) / Math.PI) + 360) % 360);
  const windGust = Math.round(Math.max(windSpeed, sampleGridBilinear(grid, hourIndex, 'windGust', lat, lon)));
  const pressure = Math.round(sampleGridBilinear(grid, hourIndex, 'pressure', lat, lon));
  const cape = Math.round(Math.max(0, sampleGridBilinear(grid, hourIndex, 'cape', lat, lon)));
  const clouds = Math.round(Math.min(100, Math.max(0, sampleGridBilinear(grid, hourIndex, 'clouds', lat, lon))));
  const snow = Number(Math.max(0, sampleGridBilinear(grid, hourIndex, 'snow', lat, lon)).toFixed(1));

  let dbz = 0;
  if (precip >= 0.05) {
    const z = 200 * Math.pow(precip, 1.6);
    dbz = Math.min(65, Math.max(12, Math.round(10 * Math.log10(z))));
  }

  return {
    temp2m,
    temp850,
    precip,
    dbz,
    windSpeed,
    windDir,
    windGust,
    pressure,
    cape,
    clouds,
    snow
  };
}

/**
 * Finds the grid hour index closest to the current wall-clock time.
 */
export function findCurrentHourIndex(times: string[]): number {
  if (!times.length) return 0;
  const nowMs = Date.now();
  let bestIdx = 0;
  let bestDiff = Infinity;
  for (let i = 0; i < times.length; i++) {
    const tMs = Date.parse(times[i] + 'Z');
    const diff = Math.abs(tMs - nowMs);
    if (diff < bestDiff) {
      bestDiff = diff;
      bestIdx = i;
    }
  }
  return bestIdx;
}
