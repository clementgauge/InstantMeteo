import { LocationPoint, ModelForecastValue } from '../types/weather';
import {
  determineGeographicZone,
  calculateRobustTrimmedConsensus,
  ModelDatum,
  GeographicZoneType
} from '../utils/robustModelConsensus';
import { resolveAndRecordLocalityAltitude } from './worldAltitudeService';
import {
  regionForLocation,
  computeHtmlModelRawWeight,
  computeHtmlModelWeightAtDay,
  computeWeightedMean,
  TerrainMeta
} from '../utils/unifiedWeatherEngine';
import { calculateDynamicReliability } from '../utils/dynamicReliabilityCalculator';

export interface DeterministicModelMeta {
  openMeteoId: string;
  appModelId: string;
  consensusWeightKey: ModelDatum['modelId'];
  name: string;
  shortName: string;
  fullName: string;
  countryOrOrg: string;
  flag: string;
  resolutionKm: string;
  category: 'REGIONAL_FINE' | 'GLOBAL_EUROPE' | 'GLOBAL_WORLD';
  asiaOnly?: boolean;
  hasPrevRuns?: boolean;
}

export const DETERMINISTIC_MODELS_CATALOG: DeterministicModelMeta[] = [
  {
    openMeteoId: 'ecmwf_ifs025',
    appModelId: 'ecmwf',
    consensusWeightKey: 'ecmwf',
    name: 'ECMWF IFS',
    shortName: 'CEPMMT',
    fullName: 'Centre Européen pour les Prévisions à Moyen Terme (IFS 9km)',
    countryOrOrg: 'Europe (UE)',
    flag: '🇪🇺',
    resolutionKm: '9 km',
    category: 'GLOBAL_EUROPE',
    hasPrevRuns: true
  },
  {
    openMeteoId: 'ecmwf_aifs025_single',
    appModelId: 'ecmwf_aifs',
    consensusWeightKey: 'ai_models',
    name: 'ECMWF AIFS (IA)',
    shortName: 'AIFS IA',
    fullName: 'Artificial Intelligence Forecasting System (ECMWF IA)',
    countryOrOrg: 'Europe (UE)',
    flag: '🤖',
    resolutionKm: '25 km (IA)',
    category: 'GLOBAL_EUROPE',
    hasPrevRuns: true
  },
  {
    openMeteoId: 'meteofrance_arome_france',
    appModelId: 'arome',
    consensusWeightKey: 'meteofrance',
    name: 'Météo-France AROME',
    shortName: 'AROME 1.3k',
    fullName: 'Application de la Recherche à l’Opérationnel à Grande Échelle (1.3km)',
    countryOrOrg: 'France',
    flag: '🇫🇷',
    resolutionKm: '1.3 km (Ultra-HD)',
    category: 'REGIONAL_FINE',
    hasPrevRuns: true
  },
  {
    openMeteoId: 'meteofrance_seamless',
    appModelId: 'meteofrance',
    consensusWeightKey: 'meteofrance',
    name: 'Météo-France ARPEGE',
    shortName: 'ARPEGE 5k',
    fullName: 'Météo-France ARPEGE / AROME Seamless',
    countryOrOrg: 'France',
    flag: '🇫🇷',
    resolutionKm: '5 km',
    category: 'GLOBAL_EUROPE',
    hasPrevRuns: true
  },
  {
    openMeteoId: 'meteofrance_arpege_europe',
    appModelId: 'arpege_eu',
    consensusWeightKey: 'meteofrance',
    name: 'ARPEGE Europe',
    shortName: 'ARPEGE EU',
    fullName: 'Modèle Synoptique Europe Météo-France ARPEGE',
    countryOrOrg: 'France',
    flag: '🇫🇷',
    resolutionKm: '10 km',
    category: 'GLOBAL_EUROPE',
    hasPrevRuns: true
  },
  {
    openMeteoId: 'icon_eu',
    appModelId: 'iconEu',
    consensusWeightKey: 'icon',
    name: 'DWD ICON-EU',
    shortName: 'ICON Europe',
    fullName: 'Icosahedral Nonhydrostatic Regional Europe (DWD)',
    countryOrOrg: 'Allemagne',
    flag: '🇩🇪',
    resolutionKm: '6.5 km',
    category: 'REGIONAL_FINE',
    hasPrevRuns: true
  },
  {
    openMeteoId: 'icon_seamless',
    appModelId: 'icon',
    consensusWeightKey: 'icon',
    name: 'DWD ICON Global',
    shortName: 'ICON 13k',
    fullName: 'Icosahedral Nonhydrostatic Global Model (DWD)',
    countryOrOrg: 'Allemagne',
    flag: '🇩🇪',
    resolutionKm: '13 km',
    category: 'GLOBAL_EUROPE',
    hasPrevRuns: true
  },
  {
    openMeteoId: 'gfs_seamless',
    appModelId: 'gfs',
    consensusWeightKey: 'gfs',
    name: 'NOAA GFS',
    shortName: 'GFS 25k',
    fullName: 'Global Forecast System (NCEP / NOAA)',
    countryOrOrg: 'États-Unis',
    flag: '🇺🇸',
    resolutionKm: '25 km',
    category: 'GLOBAL_WORLD',
    hasPrevRuns: true
  },
  {
    openMeteoId: 'gfs_graphcast025',
    appModelId: 'gfs_graphcast',
    consensusWeightKey: 'ai_models',
    name: 'NOAA GraphCast (IA)',
    shortName: 'GraphCast IA',
    fullName: 'DeepMind / NOAA GraphCast AI Global NWP',
    countryOrOrg: 'États-Unis',
    flag: '🧠',
    resolutionKm: '25 km (IA)',
    category: 'GLOBAL_WORLD',
    hasPrevRuns: false
  },
  {
    openMeteoId: 'ukmo_seamless',
    appModelId: 'ukmo',
    consensusWeightKey: 'ukmo',
    name: 'UK Met Office Unified',
    shortName: 'UKMO 10k',
    fullName: 'Unified Model United Kingdom Meteorological Office',
    countryOrOrg: 'Royaume-Uni',
    flag: '🇬🇧',
    resolutionKm: '10 km',
    category: 'GLOBAL_EUROPE',
    hasPrevRuns: true
  },
  {
    openMeteoId: 'gem_seamless',
    appModelId: 'gem',
    consensusWeightKey: 'gem',
    name: 'CMC GEM',
    shortName: 'GEM Canada',
    fullName: 'Global Environmental Multiscale Model (Environnement Canada)',
    countryOrOrg: 'Canada',
    flag: '🇨🇦',
    resolutionKm: '15 km',
    category: 'GLOBAL_WORLD',
    hasPrevRuns: true
  },
  {
    openMeteoId: 'knmi_seamless',
    appModelId: 'knmi',
    consensusWeightKey: 'ecmwf',
    name: 'KNMI Harmonie',
    shortName: 'KNMI NL',
    fullName: 'Institut Royal Météorologique des Pays-Bas (Harmonie-AROME)',
    countryOrOrg: 'Pays-Bas',
    flag: '🇳🇱',
    resolutionKm: '5.5 km',
    category: 'GLOBAL_EUROPE',
    hasPrevRuns: true
  },
  {
    openMeteoId: 'dmi_seamless',
    appModelId: 'dmi',
    consensusWeightKey: 'ecmwf',
    name: 'DMI Harmonie',
    shortName: 'DMI DK',
    fullName: 'Danish Meteorological Institute (Harmonie-AROME / IFS)',
    countryOrOrg: 'Danemark',
    flag: '🇩🇰',
    resolutionKm: '5.5 km',
    category: 'GLOBAL_EUROPE',
    hasPrevRuns: true
  },
  {
    openMeteoId: 'metno_seamless',
    appModelId: 'metno',
    consensusWeightKey: 'ecmwf',
    name: 'MET Norway Nordic',
    shortName: 'MET NO',
    fullName: 'Norwegian Meteorological Institute Seamless',
    countryOrOrg: 'Norvège',
    flag: '🇳🇴',
    resolutionKm: '5 km',
    category: 'GLOBAL_EUROPE',
    hasPrevRuns: true
  },
  {
    openMeteoId: 'jma_seamless',
    appModelId: 'jma',
    consensusWeightKey: 'gem',
    name: 'JMA GSM',
    shortName: 'JMA Japon',
    fullName: 'Global Spectral Model Japan Meteorological Agency',
    countryOrOrg: 'Japon',
    flag: '🇯🇵',
    resolutionKm: '13 km',
    category: 'GLOBAL_WORLD',
    asiaOnly: true,
    hasPrevRuns: false
  },
  {
    openMeteoId: 'cma_grapes_global',
    appModelId: 'cma',
    consensusWeightKey: 'gem',
    name: 'CMA GRAPES',
    shortName: 'GRAPES Chine',
    fullName: 'Global Regional Assimilation Prediction System CMA',
    countryOrOrg: 'Chine',
    flag: '🇨🇳',
    resolutionKm: '15 km',
    category: 'GLOBAL_WORLD',
    asiaOnly: true,
    hasPrevRuns: false
  }
];

interface EnsembleSystemMeta {
  prefixKey: string;
  parentDetModelId: string;
  appModelId: string;
  name: string;
  shortName: string;
  fullName: string;
  countryOrOrg: string;
  flag: string;
  resolutionKm: string;
  category: 'GLOBAL_EUROPE' | 'GLOBAL_WORLD';
  weight: number;
}

const ENSEMBLE_SYSTEMS: EnsembleSystemMeta[] = [
  {
    prefixKey: 'ecmwf_ifs025_ensemble',
    parentDetModelId: 'ecmwf_ifs025',
    appModelId: 'ecmwf_eps',
    name: 'ECMWF EPS (51 scénarios)',
    shortName: 'EPS 51m UE',
    fullName: 'Ensemble Prediction System CEPMMT (51 membres réels)',
    countryOrOrg: 'Europe (UE)',
    flag: '🇪🇺',
    resolutionKm: '18 km (51m)',
    category: 'GLOBAL_EUROPE',
    weight: 1.35
  },
  {
    prefixKey: 'ecmwf_aifs025_ensemble',
    parentDetModelId: 'ecmwf_aifs025_single',
    appModelId: 'ecmwf_aifs_eps',
    name: 'ECMWF AIFS ENS (51 scénarios IA)',
    shortName: 'AIFS-ENS 51m',
    fullName: 'ECMWF AI Ensemble Forecasting System (51 membres réels)',
    countryOrOrg: 'Europe (UE)',
    flag: '🤖',
    resolutionKm: '25 km IA (51m)',
    category: 'GLOBAL_EUROPE',
    weight: 1.25
  },
  {
    prefixKey: 'ncep_gefs_seamless',
    parentDetModelId: 'gfs_seamless',
    appModelId: 'gefs',
    name: 'NOAA GEFS (31 scénarios)',
    shortName: 'GEFS 31m USA',
    fullName: 'Global Ensemble Forecast System NOAA/NCEP (31 membres réels)',
    countryOrOrg: 'États-Unis',
    flag: '🇺🇸',
    resolutionKm: '25 km (31m)',
    category: 'GLOBAL_WORLD',
    weight: 1.15
  },
  {
    prefixKey: 'icon_seamless_eps',
    parentDetModelId: 'icon_seamless',
    appModelId: 'icon_eps',
    name: 'DWD ICON-EPS (40 scénarios)',
    shortName: 'ICON-EPS 40m',
    fullName: 'DWD Ensemble Prediction System (40 membres réels)',
    countryOrOrg: 'Allemagne',
    flag: '🇩🇪',
    resolutionKm: '20 km (40m)',
    category: 'GLOBAL_EUROPE',
    weight: 1.15
  },
  {
    prefixKey: 'gem_global_ensemble',
    parentDetModelId: 'gem_seamless',
    appModelId: 'gem_geps',
    name: 'CMC GEPS (21 scénarios)',
    shortName: 'GEPS 21m Can.',
    fullName: 'Global Ensemble Prediction System Canada (21 membres réels)',
    countryOrOrg: 'Canada',
    flag: '🇨🇦',
    resolutionKm: '25 km (21m)',
    category: 'GLOBAL_WORLD',
    weight: 0.95
  },
  {
    prefixKey: 'ukmo_global_ensemble_20km',
    parentDetModelId: 'ukmo_seamless',
    appModelId: 'ukmo_eps',
    name: 'UKMO MOGREPS-G (18 scénarios)',
    shortName: 'UKMO-ENS 18m',
    fullName: 'Met Office Global & Regional Ensemble Prediction System (18 membres réels)',
    countryOrOrg: 'Royaume-Uni',
    flag: '🇬🇧',
    resolutionKm: '20 km (18m)',
    category: 'GLOBAL_EUROPE',
    weight: 1.0
  }
];

export interface ConsensusDaySummary {
  dayIndex: number;
  date: string;
  consensusTMin: number;
  consensusTMax: number;
  consensusRainMm: number;
  consensusWeatherCode: number;
  deterministicTMax: number;
  deterministicTMin: number;
  ensembleMedianTMax: number;
  ensembleMedianTMin: number;
  ensembleP10TMax: number;
  ensembleP25TMax: number;
  ensembleP75TMax: number;
  ensembleP90TMax: number;
  ensembleP10TMin: number;
  ensembleP25TMin: number;
  ensembleP75TMin: number;
  ensembleP90TMin: number;
  totalScenariosCount: number;
  activeDeterministicCount: number;
  ensembleMembersTotalCount: number;
  runsAveragedCount: number;
  runToRunSwingC: number;
  maxSpreadC: number;
  minSpreadC: number;
  modelsMap: Record<string, ModelForecastValue>;
  warmestModelName: string;
  coldestModelName: string;
  consensusProbPct?: number;
  consensusWindMaxKmh?: number;
  consensusGustMaxKmh?: number;
  consensusSnowCm?: number;
  consensusUvMax?: number;
  consensusSunHours?: number;
  consensusConfidencePct?: number;
  terrainMeta?: TerrainMeta;
}

export interface StationMultiModelConsensusResult {
  stationId: string;
  zone: GeographicZoneType;
  fetchedAt: number;
  days: ConsensusDaySummary[];
  daysByDate: Map<string, ConsensusDaySummary>;
}

const MEMORY_CACHE = new Map<string, { timestamp: number; data: StationMultiModelConsensusResult }>();
const IN_FLIGHT_CACHE = new Map<string, Promise<StationMultiModelConsensusResult>>();
const CACHE_TTL_MS = 15 * 60 * 1000;
const ENSEMBLE_HISTORY_STORAGE_KEY = 'instant_meteo_ens_3run_archive_v1';

interface StoredEnsembleCycle {
  cycleId: number; // 6-hour run epoch index
  savedAt: number;
  byDate: Record<string, { tMaxMembers: number[]; tMinMembers: number[] }>;
}

function getCurrentRunCycleId(): number {
  // NWP models update roughly every 6 hours (00z, 06z, 12z, 18z)
  return Math.floor(Date.now() / (6 * 3600 * 1000));
}

function loadEnsembleRunArchive(stationKey: string): StoredEnsembleCycle[] {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    const raw = window.localStorage.getItem(ENSEMBLE_HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Record<string, StoredEnsembleCycle[]>;
    return Array.isArray(parsed[stationKey]) ? parsed[stationKey] : [];
  } catch {
    return [];
  }
}

function saveEnsembleRunArchive(
  stationKey: string,
  cycleId: number,
  dayMap: Record<string, { tMaxMembers: number[]; tMinMembers: number[] }>
): StoredEnsembleCycle[] {
  if (typeof window === 'undefined' || !window.localStorage) {
    return [{ cycleId, savedAt: Date.now(), byDate: dayMap }];
  }
  try {
    const raw = window.localStorage.getItem(ENSEMBLE_HISTORY_STORAGE_KEY);
    const parsed: Record<string, StoredEnsembleCycle[]> = raw ? JSON.parse(raw) : {};
    const existing = Array.isArray(parsed[stationKey]) ? parsed[stationKey] : [];
    const filtered = existing.filter(c => c.cycleId !== cycleId);
    const updated = [{ cycleId, savedAt: Date.now(), byDate: dayMap }, ...filtered].slice(0, 3);
    parsed[stationKey] = updated;

    // Keep at most 4 stations in localStorage so quota is never exceeded
    const keys = Object.keys(parsed);
    if (keys.length > 4) {
      keys
        .sort((a, b) => (parsed[b][0]?.savedAt ?? 0) - (parsed[a][0]?.savedAt ?? 0))
        .slice(4)
        .forEach(k => delete parsed[k]);
    }
    window.localStorage.setItem(ENSEMBLE_HISTORY_STORAGE_KEY, JSON.stringify(parsed));
    return updated;
  } catch {
    return [{ cycleId, savedAt: Date.now(), byDate: dayMap }];
  }
}

function quantile(sorted: number[], q: number): number {
  if (sorted.length === 0) return 0;
  if (sorted.length === 1) return sorted[0];
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  const next = sorted[base + 1] !== undefined ? sorted[base + 1] : sorted[base];
  return Number((sorted[base] + rest * (next - sorted[base])).toFixed(1));
}

function isStationInAsia(lat: number, lon: number): boolean {
  return lat >= 5 && lat <= 55 && lon >= 65 && lon <= 155;
}

/**
 * Fetches 16 deterministic/AI NWP models + their last 3 operational runs (Run N, Run N-1, Run N-2)
 * + 212 real probabilistic ensemble scenarios across 6 global ensemble centers.
 * Computes ONE canonical 3-run-averaged consensus temperature (Tmin, Tmax) per calendar day.
 */
export async function fetchMultiModelConsensusForStation(
  station: LocationPoint
): Promise<StationMultiModelConsensusResult> {
  const stationKey = `${station.id}_${station.latitude.toFixed(2)}_${station.longitude.toFixed(2)}`;
  const now = Date.now();

  const cached = MEMORY_CACHE.get(stationKey);
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const existingFlight = IN_FLIGHT_CACHE.get(stationKey);
  if (existingFlight) {
    return existingFlight;
  }

  const runPromise = (async (): Promise<StationMultiModelConsensusResult> => {
    const lat = station.latitude;
    const lon = station.longitude;
    const altEntry = await resolveAndRecordLocalityAltitude({
      lat,
      lon,
      name: station.name,
      country: station.country,
      knownAltitude: station.altitude
    });
    const alt = altEntry.alt;
    const terrainMeta: TerrainMeta = {
      alt,
      coastal: typeof altEntry.coastal === 'number' ? altEntry.coastal : 0,
      relief: typeof altEntry.relief === 'number' ? altEntry.relief : Math.min(1, Math.max(0, alt / 1500)),
      exposure: typeof altEntry.exposure === 'number' ? altEntry.exposure : Math.min(1.4, Math.max(0.2, 0.25 + alt / 2500))
    };
    const htmlRegion = regionForLocation(
      station.countryCode || (station.isFrench ? 'FR' : ''),
      lat,
      lon
    );
    const zone = determineGeographicZone(lat, lon, alt, station.department);
    const inAsia = isStationInAsia(lat, lon);

    const detModelsParam = DETERMINISTIC_MODELS_CATALOG.map(m => m.openMeteoId).join(',');
    const prevRunModelsParam = DETERMINISTIC_MODELS_CATALOG.filter(m => m.hasPrevRuns).map(m => m.openMeteoId).join(',');
    const ensModelsParam = 'ecmwf_ifs025,ecmwf_aifs025,gfs_seamless,icon_seamless,gem_global,ukmo_global_ensemble_20km';

    const dailyUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&elevation=${alt}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,snowfall_sum,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max,uv_index_max,sunshine_duration,weather_code&models=${detModelsParam}&forecast_days=16&timezone=auto`;
    const prevRunsUrl = `https://previous-runs-api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&elevation=${alt}&hourly=temperature_2m,temperature_2m_previous_day1,temperature_2m_previous_day2,precipitation,precipitation_previous_day1,precipitation_previous_day2,snowfall,snowfall_previous_day1,snowfall_previous_day2,wind_speed_10m,wind_speed_10m_previous_day1,wind_speed_10m_previous_day2,wind_gusts_10m,wind_gusts_10m_previous_day1,wind_gusts_10m_previous_day2&models=${prevRunModelsParam}&forecast_days=16&timezone=auto`;
    const ensUrl = `https://ensemble-api.open-meteo.com/v1/ensemble?latitude=${lat}&longitude=${lon}&elevation=${alt}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&models=${ensModelsParam}&forecast_days=15&timezone=auto`;

    const [dailyRes, prevRes, ensRes] = await Promise.all([
      fetch(dailyUrl),
      fetch(prevRunsUrl).catch(() => null),
      fetch(ensUrl).catch(() => null)
    ]);

    if (!dailyRes.ok && !(dailyRes.status >= 200 && dailyRes.status < 400)) {
      throw new Error(`Multi-model daily fetch failed: ${dailyRes.status}`);
    }

    const dailyJson = await dailyRes.json();
    const prevJson = prevRes && prevRes.ok ? await prevRes.json().catch(() => null) : null;
    const ensJson = ensRes && ensRes.ok ? await ensRes.json().catch(() => null) : null;

    const dailyTimes: string[] = Array.isArray(dailyJson?.daily?.time) ? dailyJson.daily.time : [];
    if (dailyTimes.length === 0) {
      throw new Error('No dates in multi-model daily response');
    }

    // 1. Pre-index previous-runs-api hourly values per (modelId -> dateStr -> { r0, r1, r2 })
    // including temperature extrema + 3-run smoothing for precipitation, snowfall, wind and gusts.
    type RunExtrema = {
      min: number;
      max: number;
      count: number;
      rainSum?: number;
      snowSum?: number;
      windMax?: number;
      gustMax?: number;
    };
    const hourlyPrevRunsByModelDate = new Map<string, Map<string, { r0?: RunExtrema; r1?: RunExtrema; r2?: RunExtrema }>>();

    const prevHourly = prevJson?.hourly;
    const prevTimes: string[] = Array.isArray(prevHourly?.time) ? prevHourly.time : [];
    if (prevTimes.length > 0) {
      const dateSliceIndices = new Map<string, number[]>();
      prevTimes.forEach((t, idx) => {
        const dStr = t.slice(0, 10);
        const arr = dateSliceIndices.get(dStr);
        if (arr) arr.push(idx);
        else dateSliceIndices.set(dStr, [idx]);
      });

      const extractExtrema = (
        tempSeries: any,
        rainSeries: any,
        snowSeries: any,
        windSeries: any,
        gustSeries: any,
        indices: number[]
      ): RunExtrema | undefined => {
        if (!Array.isArray(tempSeries)) return undefined;
        let min = Infinity;
        let max = -Infinity;
        let count = 0;
        let rainSum = 0;
        let rainCnt = 0;
        let snowSum = 0;
        let snowCnt = 0;
        let windMax = -Infinity;
        let gustMax = -Infinity;

        for (const idx of indices) {
          const v = tempSeries[idx];
          if (typeof v === 'number' && !isNaN(v)) {
            if (v < min) min = v;
            if (v > max) max = v;
            count++;
          }
          const rv = rainSeries?.[idx];
          if (typeof rv === 'number' && !isNaN(rv)) {
            rainSum += rv;
            rainCnt++;
          }
          const sv = snowSeries?.[idx];
          if (typeof sv === 'number' && !isNaN(sv)) {
            snowSum += sv;
            snowCnt++;
          }
          const wv = windSeries?.[idx];
          if (typeof wv === 'number' && !isNaN(wv) && wv > windMax) {
            windMax = wv;
          }
          const gv = gustSeries?.[idx];
          if (typeof gv === 'number' && !isNaN(gv) && gv > gustMax) {
            gustMax = gv;
          }
        }
        if (count < 2) return undefined;
        return {
          min,
          max,
          count,
          rainSum: rainCnt >= 2 ? rainSum : undefined,
          snowSum: snowCnt >= 2 ? snowSum : undefined,
          windMax: windMax > -Infinity ? windMax : undefined,
          gustMax: gustMax > -Infinity ? gustMax : undefined
        };
      };

      for (const meta of DETERMINISTIC_MODELS_CATALOG) {
        if (!meta.hasPrevRuns) continue;
        const mId = meta.openMeteoId;
        const s0 = prevHourly[`temperature_2m_${mId}`];
        const s1 = prevHourly[`temperature_2m_previous_day1_${mId}`];
        const s2 = prevHourly[`temperature_2m_previous_day2_${mId}`];

        const p0 = prevHourly[`precipitation_${mId}`];
        const p1 = prevHourly[`precipitation_previous_day1_${mId}`];
        const p2 = prevHourly[`precipitation_previous_day2_${mId}`];

        const sn0 = prevHourly[`snowfall_${mId}`];
        const sn1 = prevHourly[`snowfall_previous_day1_${mId}`];
        const sn2 = prevHourly[`snowfall_previous_day2_${mId}`];

        const w0 = prevHourly[`wind_speed_10m_${mId}`];
        const w1 = prevHourly[`wind_speed_10m_previous_day1_${mId}`];
        const w2 = prevHourly[`wind_speed_10m_previous_day2_${mId}`];

        const g0 = prevHourly[`wind_gusts_10m_${mId}`];
        const g1 = prevHourly[`wind_gusts_10m_previous_day1_${mId}`];
        const g2 = prevHourly[`wind_gusts_10m_previous_day2_${mId}`];

        const byDate = new Map<string, { r0?: RunExtrema; r1?: RunExtrema; r2?: RunExtrema }>();
        dateSliceIndices.forEach((indices, dStr) => {
          const r0 = extractExtrema(s0, p0, sn0, w0, g0, indices);
          const r1 = extractExtrema(s1, p1, sn1, w1, g1, indices);
          const r2 = extractExtrema(s2, p2, sn2, w2, g2, indices);
          if (r0 || r1 || r2) {
            byDate.set(dStr, { r0, r1, r2 });
          }
        });
        hourlyPrevRunsByModelDate.set(mId, byDate);
      }
    }

    // 2. Discover real ensemble member keys per system from ensemble-api response
    const ensDaily = ensJson?.daily || {};
    const ensTimes: string[] = Array.isArray(ensDaily.time) ? ensDaily.time : [];
    const ensDateIdx = new Map<string, number>();
    ensTimes.forEach((t, i) => ensDateIdx.set(t, i));

    const ensDailyKeys = Object.keys(ensDaily);
    const ensKeysBySystem = new Map<string, { maxKeys: string[]; minKeys: string[]; rainKeys: string[] }>();

    for (const sys of ENSEMBLE_SYSTEMS) {
      const maxKeys = ensDailyKeys.filter(
        k => k.startsWith('temperature_2m_max') && k.endsWith(sys.prefixKey)
      );
      const minKeys = ensDailyKeys.filter(
        k => k.startsWith('temperature_2m_min') && k.endsWith(sys.prefixKey)
      );
      const rainKeys = ensDailyKeys.filter(
        k => k.startsWith('precipitation_sum') && k.endsWith(sys.prefixKey)
      );
      ensKeysBySystem.set(sys.prefixKey, { maxKeys, minKeys, rainKeys });
    }

    // Snapshot & retrieve stored historical ensemble runs (up to 3 cycles) for true per-scenario 3-run stabilization
    const currentEnsByDate: Record<string, { tMaxMembers: number[]; tMinMembers: number[] }> = {};
    ensTimes.forEach((dateStr, eIdx) => {
      const tMaxMembers: number[] = [];
      const tMinMembers: number[] = [];
      for (const sys of ENSEMBLE_SYSTEMS) {
        const sysKeys = ensKeysBySystem.get(sys.prefixKey);
        if (!sysKeys) continue;
        for (const k of sysKeys.maxKeys) {
          const v = ensDaily[k]?.[eIdx];
          if (typeof v === 'number' && !isNaN(v)) tMaxMembers.push(Number(v.toFixed(1)));
        }
        for (const k of sysKeys.minKeys) {
          const v = ensDaily[k]?.[eIdx];
          if (typeof v === 'number' && !isNaN(v)) tMinMembers.push(Number(v.toFixed(1)));
        }
      }
      if (tMaxMembers.length > 0 && tMinMembers.length > 0) {
        currentEnsByDate[dateStr] = { tMaxMembers, tMinMembers };
      }
    });

    const cycleId = getCurrentRunCycleId();
    const storedEnsCycles = ensTimes.length > 0
      ? saveEnsembleRunArchive(stationKey, cycleId, currentEnsByDate)
      : loadEnsembleRunArchive(stationKey);

    // Build per-day consensus
    const days: ConsensusDaySummary[] = [];
    const daysByDate = new Map<string, ConsensusDaySummary>();

    const detDaily = dailyJson.daily;

    for (let dIdx = 0; dIdx < dailyTimes.length; dIdx++) {
      const dateStr = dailyTimes[dIdx];
      const leadDay = dIdx;

      // Track each deterministic model's 3-run shift so parent shifts can also stabilize ensemble systems
      const parentShiftMaxByModel = new Map<string, { shift: number; runsCount: number; swing: number }>();
      const parentShiftMinByModel = new Map<string, { shift: number; runsCount: number; swing: number }>();

      const modelsMap: Record<string, ModelForecastValue> = {};
      const detMaxDataForConsensus: ModelDatum[] = [];
      const detMinDataForConsensus: ModelDatum[] = [];
      const detRainVals: number[] = [];
      const detWeatherCodes: number[] = [];
      const allRunSwings: number[] = [];
      let maxRunsUsedOnDay = 1;

      const detWeightedTx: number[] = [];
      const detWeightedTn: number[] = [];
      const detWeightedTempWeights: number[] = [];
      const detWeightedRain: number[] = [];
      const detWeightedRainWeights: number[] = [];
      const detWeightedSnow: number[] = [];
      const detWeightedSnowWeights: number[] = [];
      const detWeightedProb: number[] = [];
      const detWeightedProbWeights: number[] = [];
      const detWeightedWind: number[] = [];
      const detWeightedWindWeights: number[] = [];
      const detWeightedGust: number[] = [];
      const detWeightedGustWeights: number[] = [];
      const detWeightedUv: number[] = [];
      const detWeightedUvWeights: number[] = [];
      const detWeightedSun: number[] = [];
      const detWeightedSunWeights: number[] = [];

      // A. Compute 3-run smoothed values & terrain weights for each deterministic / AI model
      for (const meta of DETERMINISTIC_MODELS_CATALOG) {
        const rawTxArr = detDaily[`temperature_2m_max_${meta.openMeteoId}`];
        const rawTnArr = detDaily[`temperature_2m_min_${meta.openMeteoId}`];
        const rawRainArr = detDaily[`precipitation_sum_${meta.openMeteoId}`];
        const rawSnowArr = detDaily[`snowfall_sum_${meta.openMeteoId}`];
        const rawProbArr = detDaily[`precipitation_probability_max_${meta.openMeteoId}`];
        const rawWindArr = detDaily[`wind_speed_10m_max_${meta.openMeteoId}`];
        const rawGustArr = detDaily[`wind_gusts_10m_max_${meta.openMeteoId}`];
        const rawUvArr = detDaily[`uv_index_max_${meta.openMeteoId}`];
        const rawSunArr = detDaily[`sunshine_duration_${meta.openMeteoId}`];
        const rawCodeArr = detDaily[`weather_code_${meta.openMeteoId}`];

        const rawTx = typeof rawTxArr?.[dIdx] === 'number' ? Number(rawTxArr[dIdx].toFixed(1)) : null;
        const rawTn = typeof rawTnArr?.[dIdx] === 'number' ? Number(rawTnArr[dIdx].toFixed(1)) : null;
        const rawRain = typeof rawRainArr?.[dIdx] === 'number' ? Number(rawRainArr[dIdx].toFixed(1)) : null;
        const rawSnow = typeof rawSnowArr?.[dIdx] === 'number' ? Number(rawSnowArr[dIdx].toFixed(1)) : null;
        const rawProb = typeof rawProbArr?.[dIdx] === 'number' ? Math.round(rawProbArr[dIdx]) : null;
        const rawWind = typeof rawWindArr?.[dIdx] === 'number' ? Math.round(rawWindArr[dIdx]) : null;
        const rawGust = typeof rawGustArr?.[dIdx] === 'number' ? Math.round(rawGustArr[dIdx]) : null;
        const rawUv = typeof rawUvArr?.[dIdx] === 'number' ? Number(rawUvArr[dIdx].toFixed(1)) : null;
        const rawSun = typeof rawSunArr?.[dIdx] === 'number' ? Number((rawSunArr[dIdx] / 3600).toFixed(1)) : null;
        const rawCode = typeof rawCodeArr?.[dIdx] === 'number' ? rawCodeArr[dIdx] : null;

        const prevEntry = hourlyPrevRunsByModelDate.get(meta.openMeteoId)?.get(dateStr);

        let avg3Tx = rawTx;
        let avg3Tn = rawTn;
        let smoothedRain = rawRain;
        let smoothedSnow = rawSnow;
        let smoothedWind = rawWind;
        let smoothedGust = rawGust;
        let runsCount = rawTx !== null ? 1 : 0;
        let modelSwing = 0;

        if (prevEntry && prevEntry.r0) {
          const maxRuns: number[] = [prevEntry.r0.max];
          const minRuns: number[] = [prevEntry.r0.min];
          if (prevEntry.r1) {
            maxRuns.push(prevEntry.r1.max);
            minRuns.push(prevEntry.r1.min);
          }
          if (prevEntry.r2) {
            maxRuns.push(prevEntry.r2.max);
            minRuns.push(prevEntry.r2.min);
          }

          if (maxRuns.length >= 2) {
            runsCount = maxRuns.length;
            const hrAvgMax = maxRuns.reduce((a, b) => a + b, 0) / maxRuns.length;
            const hrAvgMin = minRuns.reduce((a, b) => a + b, 0) / minRuns.length;

            // Pure run-to-run shift applied onto the WMO daily value so there is zero hourly-sampling bias
            const shiftMax = hrAvgMax - prevEntry.r0.max;
            const shiftMin = hrAvgMin - prevEntry.r0.min;

            const maxSwing = Math.max(...maxRuns) - Math.min(...maxRuns);
            const minSwing = Math.max(...minRuns) - Math.min(...minRuns);
            modelSwing = Number(Math.max(maxSwing, minSwing).toFixed(1));

            parentShiftMaxByModel.set(meta.openMeteoId, { shift: shiftMax, runsCount, swing: maxSwing });
            parentShiftMinByModel.set(meta.openMeteoId, { shift: shiftMin, runsCount, swing: minSwing });

            avg3Tx = rawTx !== null ? Number((rawTx + shiftMax).toFixed(1)) : Number(hrAvgMax.toFixed(1));
            avg3Tn = rawTn !== null ? Number((rawTn + shiftMin).toFixed(1)) : Number(hrAvgMin.toFixed(1));

            // 3-run 0.50/0.30/0.20 smoothing for rain, snow, wind & gusts
            const blend3 = (v0: number | undefined, v1: number | undefined, v2: number | undefined, fallback: number | null) => {
              if (fallback === null && v0 === undefined) return null;
              const arr = [
                { v: v0, w: 0.50 },
                { v: v1, w: 0.30 },
                { v: v2, w: 0.20 }
              ].filter((x): x is { v: number; w: number } => typeof x.v === 'number' && !isNaN(x.v));
              if (arr.length < 2 || v0 === undefined) return fallback;
              const wSum = arr.reduce((a, b) => a + b.w, 0);
              const hrWeighted = arr.reduce((a, b) => a + b.v * b.w, 0) / wSum;
              return fallback !== null ? Math.max(0, fallback + (hrWeighted - v0)) : Math.max(0, hrWeighted);
            };

            const rSm = blend3(prevEntry.r0.rainSum, prevEntry.r1?.rainSum, prevEntry.r2?.rainSum, rawRain);
            if (rSm !== null) smoothedRain = Number(rSm.toFixed(1));
            const snSm = blend3(prevEntry.r0.snowSum, prevEntry.r1?.snowSum, prevEntry.r2?.snowSum, rawSnow);
            if (snSm !== null) smoothedSnow = Number(snSm.toFixed(1));
            const wSm = blend3(prevEntry.r0.windMax, prevEntry.r1?.windMax, prevEntry.r2?.windMax, rawWind);
            if (wSm !== null) smoothedWind = Math.round(wSm);
            const gSm = blend3(prevEntry.r0.gustMax, prevEntry.r1?.gustMax, prevEntry.r2?.gustMax, rawGust);
            if (gSm !== null) smoothedGust = Math.round(gSm);
          }
        }

        const isExcluded = Boolean(meta.asiaOnly && !inAsia);
        const isAvailable = avg3Tx !== null && avg3Tn !== null && !isExcluded;

        let sanitizedCode = rawCode;
        if (sanitizedCode !== null && [71, 73, 75, 77, 85, 86].includes(sanitizedCode) && (avg3Tx ?? 10) > 2.5) {
          sanitizedCode = (smoothedRain ?? 0) >= 5 ? 63 : (smoothedRain ?? 0) > 0 ? 61 : 2;
        }

        modelsMap[meta.appModelId] = {
          modelId: meta.appModelId,
          name: isExcluded ? `${meta.name} (Exclu hors Asie)` : meta.name,
          shortName: meta.shortName,
          fullName: meta.fullName,
          countryOrOrg: meta.countryOrOrg,
          flag: meta.flag,
          resolutionKm: meta.resolutionKm,
          modelCategory: meta.category,
          tempMin: avg3Tn,
          tempMax: avg3Tx,
          precipitationMm: smoothedRain,
          weatherCode: sanitizedCode,
          isAvailable,
          runStatus: isExcluded
            ? 'NON_RETENU_REGION'
            : avg3Tx !== null
            ? 'DIRECT_RUN'
            : 'REGIONAL_HORIZON_ENDED',
          isExcludedOutsideAsia: isExcluded,
          exclusionReason: isExcluded
            ? "Modèle asiatique écarté hors Asie pour éviter les biais régionaux."
            : undefined,
          runsAveragedCount: runsCount,
          runSwingC: modelSwing,
          rawLatestTempMax: rawTx
        };

        if (isAvailable && avg3Tx !== null && avg3Tn !== null) {
          const rawW = computeHtmlModelRawWeight(meta.openMeteoId, terrainMeta, htmlRegion);
          const dayW = computeHtmlModelWeightAtDay(meta.openMeteoId, rawW, dIdx);

          detMaxDataForConsensus.push({ modelId: meta.consensusWeightKey, value: avg3Tx });
          detMinDataForConsensus.push({ modelId: meta.consensusWeightKey, value: avg3Tn });
          detWeightedTx.push(avg3Tx);
          detWeightedTn.push(avg3Tn);
          detWeightedTempWeights.push(dayW);

          if (smoothedRain !== null) {
            detRainVals.push(smoothedRain);
            detWeightedRain.push(smoothedRain);
            detWeightedRainWeights.push(dayW);
          }
          if (smoothedSnow !== null) {
            detWeightedSnow.push(smoothedSnow);
            detWeightedSnowWeights.push(dayW);
          }
          if (rawProb !== null) {
            detWeightedProb.push(rawProb);
            detWeightedProbWeights.push(dayW);
          }
          if (smoothedWind !== null) {
            detWeightedWind.push(smoothedWind);
            detWeightedWindWeights.push(dayW);
          }
          if (smoothedGust !== null) {
            detWeightedGust.push(smoothedGust);
            detWeightedGustWeights.push(dayW);
          }
          if (rawUv !== null) {
            detWeightedUv.push(rawUv);
            detWeightedUvWeights.push(dayW);
          }
          if (rawSun !== null) {
            detWeightedSun.push(rawSun);
            detWeightedSunWeights.push(dayW);
          }
          if (sanitizedCode !== null) detWeatherCodes.push(sanitizedCode);
          if (modelSwing > 0) allRunSwings.push(modelSwing);
          if (runsCount > maxRunsUsedOnDay) maxRunsUsedOnDay = runsCount;
        }
      }

      // B. Extract & 3-run-stabilize all 212 Ensemble Scenarios across 6 ensemble systems
      const eIdx = ensDateIdx.get(dateStr);
      const allEnsembleMaxValues3Run: number[] = [];
      const allEnsembleMinValues3Run: number[] = [];
      const ensembleSystemMediansMax: { weight: number; val: number }[] = [];
      const ensembleSystemMediansMin: { weight: number; val: number }[] = [];
      let ensembleMembersTotalCount = 0;

      if (eIdx !== undefined) {
        let globalMemberOffset = 0;
        for (const sys of ENSEMBLE_SYSTEMS) {
          const sysKeys = ensKeysBySystem.get(sys.prefixKey);
          if (!sysKeys) continue;

          const parentMaxShift = parentShiftMaxByModel.get(sys.parentDetModelId);
          const parentMinShift = parentShiftMinByModel.get(sys.parentDetModelId);

          const sysMaxVals: number[] = [];
          const sysMinVals: number[] = [];
          const sysRainVals: number[] = [];

          for (let mIdx = 0; mIdx < sysKeys.maxKeys.length; mIdx++) {
            const rawMemberMax = ensDaily[sysKeys.maxKeys[mIdx]]?.[eIdx];
            const minKey = sysKeys.minKeys[mIdx];
            const rawMemberMin = minKey ? ensDaily[minKey]?.[eIdx] : undefined;

            if (typeof rawMemberMax === 'number' && !isNaN(rawMemberMax)) {
              // Average this scenario across up to 3 stored ensemble runs if present,
              // otherwise apply parent system's live 3-run synoptic damping shift
              let stabilizedMax = rawMemberMax;
              if (storedEnsCycles.length >= 2) {
                const historicalVals: number[] = [rawMemberMax];
                for (let c = 1; c < storedEnsCycles.length; c++) {
                  const pastArr = storedEnsCycles[c].byDate[dateStr]?.tMaxMembers;
                  const pastVal = pastArr?.[globalMemberOffset + mIdx];
                  if (typeof pastVal === 'number' && !isNaN(pastVal)) {
                    historicalVals.push(pastVal);
                  }
                }
                if (historicalVals.length >= 2) {
                  stabilizedMax = historicalVals.reduce((a, b) => a + b, 0) / historicalVals.length;
                } else if (parentMaxShift) {
                  stabilizedMax = rawMemberMax + parentMaxShift.shift;
                }
              } else if (parentMaxShift) {
                stabilizedMax = rawMemberMax + parentMaxShift.shift;
              }
              const roundedMax = Number(stabilizedMax.toFixed(1));
              sysMaxVals.push(roundedMax);
              allEnsembleMaxValues3Run.push(roundedMax);
            }

            if (typeof rawMemberMin === 'number' && !isNaN(rawMemberMin)) {
              let stabilizedMin = rawMemberMin;
              if (storedEnsCycles.length >= 2) {
                const historicalVals: number[] = [rawMemberMin];
                for (let c = 1; c < storedEnsCycles.length; c++) {
                  const pastArr = storedEnsCycles[c].byDate[dateStr]?.tMinMembers;
                  const pastVal = pastArr?.[globalMemberOffset + mIdx];
                  if (typeof pastVal === 'number' && !isNaN(pastVal)) {
                    historicalVals.push(pastVal);
                  }
                }
                if (historicalVals.length >= 2) {
                  stabilizedMin = historicalVals.reduce((a, b) => a + b, 0) / historicalVals.length;
                } else if (parentMinShift) {
                  stabilizedMin = rawMemberMin + parentMinShift.shift;
                }
              } else if (parentMinShift) {
                stabilizedMin = rawMemberMin + parentMinShift.shift;
              }
              const roundedMin = Number(stabilizedMin.toFixed(1));
              sysMinVals.push(roundedMin);
              allEnsembleMinValues3Run.push(roundedMin);
            }
          }

          globalMemberOffset += sysKeys.maxKeys.length;

          for (const rk of sysKeys.rainKeys) {
            const rv = ensDaily[rk]?.[eIdx];
            if (typeof rv === 'number' && !isNaN(rv)) sysRainVals.push(rv);
          }

          if (sysMaxVals.length > 0 && sysMinVals.length > 0) {
            const sortedMax = [...sysMaxVals].sort((a, b) => a - b);
            const sortedMin = [...sysMinVals].sort((a, b) => a - b);
            const sortedRain = [...sysRainVals].sort((a, b) => a - b);
            const medMax = quantile(sortedMax, 0.5);
            const medMin = quantile(sortedMin, 0.5);
            const medRain = sortedRain.length > 0 ? Number(quantile(sortedRain, 0.5).toFixed(1)) : null;

            ensembleMembersTotalCount += sysMaxVals.length;
            ensembleSystemMediansMax.push({ weight: sys.weight, val: medMax });
            ensembleSystemMediansMin.push({ weight: sys.weight, val: medMin });

            const runsCountForEns = Math.max(
              storedEnsCycles.length,
              parentMaxShift?.runsCount ?? 1
            );
            if (runsCountForEns > maxRunsUsedOnDay) maxRunsUsedOnDay = runsCountForEns;

            modelsMap[sys.appModelId] = {
              modelId: sys.appModelId,
              name: sys.name,
              shortName: sys.shortName,
              fullName: sys.fullName,
              countryOrOrg: sys.countryOrOrg,
              flag: sys.flag,
              resolutionKm: sys.resolutionKm,
              modelCategory: sys.category,
              tempMin: medMin,
              tempMax: medMax,
              precipitationMm: medRain,
              weatherCode: detWeatherCodes[0] ?? 1,
              isAvailable: true,
              runStatus: 'ENSEMBLE_TREND',
              ensembleMembersCount: sysMaxVals.length,
              runsAveragedCount: Math.min(3, runsCountForEns),
              runSwingC: parentMaxShift ? Number(parentMaxShift.swing.toFixed(1)) : 0
            };
          }
        }
      }

      // C. Compute canonical terrain-weighted & 3-run-averaged multi-model + ensemble consensus
      const detMaxConsensus = calculateRobustTrimmedConsensus(detMaxDataForConsensus, zone, 1, leadDay);
      const detMinConsensus = calculateRobustTrimmedConsensus(detMinDataForConsensus, zone, 1, leadDay);

      const htmlDetTx = computeWeightedMean(detWeightedTx, detWeightedTempWeights);
      const htmlDetTn = computeWeightedMean(detWeightedTn, detWeightedTempWeights);
      const effectiveDetTx = htmlDetTx !== null ? Number(htmlDetTx.toFixed(1)) : detMaxConsensus.trimmedConsensus;
      const effectiveDetTn = htmlDetTn !== null ? Number(htmlDetTn.toFixed(1)) : detMinConsensus.trimmedConsensus;

      const sortedAllEnsMax = [...allEnsembleMaxValues3Run].sort((a, b) => a - b);
      const sortedAllEnsMin = [...allEnsembleMinValues3Run].sort((a, b) => a - b);

      const weightedEnsMax = ensembleSystemMediansMax.length > 0
        ? Number(
            (
              ensembleSystemMediansMax.reduce((s, x) => s + x.val * x.weight, 0) /
              ensembleSystemMediansMax.reduce((s, x) => s + x.weight, 0)
            ).toFixed(1)
          )
        : effectiveDetTx;

      const weightedEnsMin = ensembleSystemMediansMin.length > 0
        ? Number(
            (
              ensembleSystemMediansMin.reduce((s, x) => s + x.val * x.weight, 0) /
              ensembleSystemMediansMin.reduce((s, x) => s + x.weight, 0)
            ).toFixed(1)
          )
        : effectiveDetTn;

      // Coordinated horizon blend matching tendances-14-jours:
      // J+0..J+2: 70% terrain-weighted fine+global (3-run avg) + 30% ensemble (3-run stabilized)
      // J+3..J+6: 50% deterministic (3-run avg) + 50% ensemble scenarios
      // J+7..J+15: 28% deterministic (3-run avg) + 72% ensemble scenarios
      const ensBlendWeight =
        ensembleMembersTotalCount === 0
          ? 0
          : leadDay <= 2
          ? 0.30
          : leadDay <= 6
          ? 0.50
          : 0.72;

      let consensusTMax = Number(
        (effectiveDetTx * (1 - ensBlendWeight) + weightedEnsMax * ensBlendWeight).toFixed(1)
      );
      let consensusTMin = Number(
        (effectiveDetTn * (1 - ensBlendWeight) + weightedEnsMin * ensBlendWeight).toFixed(1)
      );
      if (consensusTMax < consensusTMin + 0.5) {
        consensusTMax = Number((consensusTMin + 0.5).toFixed(1));
      }

      const ensP10Max = sortedAllEnsMax.length >= 5 ? quantile(sortedAllEnsMax, 0.1) : Number((consensusTMax - 1.5).toFixed(1));
      const ensP25Max = sortedAllEnsMax.length >= 5 ? quantile(sortedAllEnsMax, 0.25) : Number((consensusTMax - 0.8).toFixed(1));
      const ensP75Max = sortedAllEnsMax.length >= 5 ? quantile(sortedAllEnsMax, 0.75) : Number((consensusTMax + 0.8).toFixed(1));
      const ensP90Max = sortedAllEnsMax.length >= 5 ? quantile(sortedAllEnsMax, 0.9) : Number((consensusTMax + 1.5).toFixed(1));

      const ensP10Min = sortedAllEnsMin.length >= 5 ? quantile(sortedAllEnsMin, 0.1) : Number((consensusTMin - 1.2).toFixed(1));
      const ensP25Min = sortedAllEnsMin.length >= 5 ? quantile(sortedAllEnsMin, 0.25) : Number((consensusTMin - 0.6).toFixed(1));
      const ensP75Min = sortedAllEnsMin.length >= 5 ? quantile(sortedAllEnsMin, 0.75) : Number((consensusTMin + 0.6).toFixed(1));
      const ensP90Min = sortedAllEnsMin.length >= 5 ? quantile(sortedAllEnsMin, 0.9) : Number((consensusTMin + 1.2).toFixed(1));

      const activeModels = Object.values(modelsMap).filter(
        m => m.isAvailable && !m.isExcludedOutsideAsia && m.tempMax !== null && m.tempMin !== null
      );
      const activeMaxTemps = activeModels.map(m => m.tempMax as number);
      const activeMinTemps = activeModels.map(m => m.tempMin as number);

      const detSpreadMax = activeMaxTemps.length > 0 ? Math.max(...activeMaxTemps) - Math.min(...activeMaxTemps) : 0;
      const ensSpreadMax = ensP90Max - ensP10Max;
      const maxSpreadC = Number(Math.max(detSpreadMax, ensSpreadMax).toFixed(1));

      const detSpreadMin = activeMinTemps.length > 0 ? Math.max(...activeMinTemps) - Math.min(...activeMinTemps) : 0;
      const ensSpreadMin = ensP90Min - ensP10Min;
      const minSpreadC = Number(Math.max(detSpreadMin, ensSpreadMin).toFixed(1));

      const weightedRain = computeWeightedMean(detWeightedRain, detWeightedRainWeights);
      const sortedDetRain = [...detRainVals].sort((a, b) => a - b);
      const consensusRainMm = weightedRain !== null
        ? Number(Math.max(0, weightedRain).toFixed(1))
        : sortedDetRain.length > 0
        ? Number(quantile(sortedDetRain, 0.5).toFixed(1))
        : 0;

      const weightedSnow = computeWeightedMean(detWeightedSnow, detWeightedSnowWeights);
      const consensusSnowCm = weightedSnow !== null ? Number(Math.max(0, weightedSnow).toFixed(1)) : undefined;

      const weightedProb = computeWeightedMean(detWeightedProb, detWeightedProbWeights);
      const consensusProbPct = weightedProb !== null
        ? Math.min(100, Math.max(0, Math.round(weightedProb)))
        : undefined;

      const weightedWind = computeWeightedMean(detWeightedWind, detWeightedWindWeights);
      const consensusWindMaxKmh = weightedWind !== null ? Math.round(Math.max(0, weightedWind)) : undefined;

      const weightedGust = computeWeightedMean(detWeightedGust, detWeightedGustWeights);
      const consensusGustMaxKmh = weightedGust !== null ? Math.round(Math.max(0, weightedGust)) : undefined;

      const weightedUv = computeWeightedMean(detWeightedUv, detWeightedUvWeights);
      const consensusUvMax = weightedUv !== null ? Number(Math.max(0, weightedUv).toFixed(1)) : undefined;

      const weightedSun = computeWeightedMean(detWeightedSun, detWeightedSunWeights);
      const consensusSunHours = weightedSun !== null ? Number(Math.max(0, weightedSun).toFixed(1)) : undefined;

      const consensusWeatherCode = detWeatherCodes[0] ?? 2;

      const avgRunSwingC = allRunSwings.length > 0
        ? Number((allRunSwings.reduce((a, b) => a + b, 0) / allRunSwings.length).toFixed(1))
        : 0;

      const dynRel = calculateDynamicReliability({
        leadDayIndex: leadDay,
        weatherCode: consensusWeatherCode,
        precipitationMm: consensusRainMm,
        precipitationProbability: consensusProbPct,
        temperatureSpreadC: maxSpreadC,
        ensembleSpreadP90P10C: ensSpreadMax,
        runToRunSwingC: avgRunSwingC,
        temperatureC: consensusTMax,
        altitudeM: alt,
        modelsCount: detMaxDataForConsensus.length + ensembleMembersTotalCount
      });

      const warmestModel = [...activeModels].sort((a, b) => (b.tempMax ?? -99) - (a.tempMax ?? -99))[0];
      const coldestModel = [...activeModels].sort((a, b) => (a.tempMax ?? 99) - (b.tempMax ?? 99))[0];

      const summary: ConsensusDaySummary = {
        dayIndex: dIdx,
        date: dateStr,
        consensusTMin,
        consensusTMax,
        consensusRainMm,
        consensusWeatherCode,
        deterministicTMax: effectiveDetTx,
        deterministicTMin: effectiveDetTn,
        ensembleMedianTMax: weightedEnsMax,
        ensembleMedianTMin: weightedEnsMin,
        ensembleP10TMax: ensP10Max,
        ensembleP25TMax: ensP25Max,
        ensembleP75TMax: ensP75Max,
        ensembleP90TMax: ensP90Max,
        ensembleP10TMin: ensP10Min,
        ensembleP25TMin: ensP25Min,
        ensembleP75TMin: ensP75Min,
        ensembleP90TMin: ensP90Min,
        totalScenariosCount: detMaxDataForConsensus.length + ensembleMembersTotalCount,
        activeDeterministicCount: detMaxDataForConsensus.length,
        ensembleMembersTotalCount,
        runsAveragedCount: Math.min(3, maxRunsUsedOnDay),
        runToRunSwingC: avgRunSwingC,
        maxSpreadC,
        minSpreadC,
        modelsMap,
        warmestModelName: warmestModel?.name || 'ECMWF IFS',
        coldestModelName: coldestModel?.name || 'DWD ICON',
        consensusProbPct,
        consensusWindMaxKmh,
        consensusGustMaxKmh,
        consensusSnowCm,
        consensusUvMax,
        consensusSunHours,
        consensusConfidencePct: dynRel.scorePct,
        terrainMeta
      };

      days.push(summary);
      daysByDate.set(dateStr, summary);
    }

    const result: StationMultiModelConsensusResult = {
      stationId: station.id,
      zone,
      fetchedAt: Date.now(),
      days,
      daysByDate
    };

    MEMORY_CACHE.set(stationKey, { timestamp: Date.now(), data: result });
    return result;
  })();

  IN_FLIGHT_CACHE.set(stationKey, runPromise);
  try {
    return await runPromise;
  } finally {
    IN_FLIGHT_CACHE.delete(stationKey);
  }
}

export function getCachedMultiModelConsensus(station: LocationPoint): StationMultiModelConsensusResult | null {
  const stationKey = `${station.id}_${station.latitude.toFixed(2)}_${station.longitude.toFixed(2)}`;
  const cached = MEMORY_CACHE.get(stationKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }
  return null;
}
