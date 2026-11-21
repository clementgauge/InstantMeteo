/**
 * Moteur unifié de pondération terrain & consensus multi-modèles (coordonné 1:1 avec tendances-14-jours__1__fde09a2a.html).
 * Garantit l'alignement exact des températures, précipitations, rafales, indices de confiance et lissage 3 runs sur toute l'application.
 */

export interface HtmlModelSpec {
  id: string;
  label: string;
  org: string;
  base: number;
  orog: number;
  coast: number;
  long: boolean;
  days: number;
  appModelId?: string;
}

export const HTML_MODELS_REGISTRY: Record<string, HtmlModelSpec> = {
  ecmwf_ifs025: { id: 'ecmwf_ifs025', label: 'ECMWF IFS', org: 'Europe · 9–25 km', base: 1.00, orog: 0.85, coast: 0.85, long: true, days: 15, appModelId: 'ecmwf' },
  ecmwf_aifs025_single: { id: 'ecmwf_aifs025_single', label: 'ECMWF AIFS (IA)', org: 'Europe · IA 25 km', base: 0.96, orog: 0.72, coast: 0.76, long: true, days: 15, appModelId: 'ecmwf_aifs' },
  gfs_seamless: { id: 'gfs_seamless', label: 'NOAA GFS (seamless)', org: 'USA · 13–25 km', base: 0.88, orog: 0.70, coast: 0.75, long: true, days: 16, appModelId: 'gfs' },
  gfs_global: { id: 'gfs_global', label: 'NOAA GFS Global', org: 'USA · 25 km', base: 0.85, orog: 0.65, coast: 0.72, long: true, days: 16 },
  gfs_graphcast025: { id: 'gfs_graphcast025', label: 'NOAA GraphCast (IA)', org: 'USA · IA 25 km', base: 0.86, orog: 0.65, coast: 0.72, long: true, days: 15, appModelId: 'gfs_graphcast' },
  icon_seamless: { id: 'icon_seamless', label: 'DWD ICON (seamless)', org: 'Allemagne · 7–13 km', base: 0.92, orog: 0.85, coast: 0.85, long: true, days: 8, appModelId: 'icon' },
  icon_global: { id: 'icon_global', label: 'DWD ICON Global', org: 'Allemagne · 13 km', base: 0.88, orog: 0.78, coast: 0.78, long: true, days: 8 },
  gem_seamless: { id: 'gem_seamless', label: 'CMC GEM (seamless)', org: 'Canada · 15–25 km', base: 0.85, orog: 0.76, coast: 0.76, long: true, days: 10, appModelId: 'gem' },
  gem_global: { id: 'gem_global', label: 'CMC GEM Global', org: 'Canada · 15–25 km', base: 0.83, orog: 0.72, coast: 0.75, long: true, days: 10 },
  ukmo_seamless: { id: 'ukmo_seamless', label: 'UK Met Office', org: 'Royaume-Uni · 2–10 km', base: 0.90, orog: 0.82, coast: 0.88, long: false, days: 7, appModelId: 'ukmo' },
  meteofrance_seamless: { id: 'meteofrance_seamless', label: 'Météo-France (AROME/ARPEGE)', org: 'France · 1,3–10 km', base: 0.94, orog: 0.90, coast: 0.90, long: false, days: 4, appModelId: 'meteofrance' },
  meteofrance_arpege_europe: { id: 'meteofrance_arpege_europe', label: 'Météo-France ARPEGE Europe', org: 'France · 10 km', base: 0.88, orog: 0.82, coast: 0.84, long: false, days: 4, appModelId: 'arpege_eu' },
  meteofrance_arome_france: { id: 'meteofrance_arome_france', label: 'Météo-France AROME France', org: 'France · 2,5 km', base: 0.95, orog: 0.96, coast: 0.95, long: false, days: 2, appModelId: 'arome' },
  meteofrance_arome_france_hd: { id: 'meteofrance_arome_france_hd', label: 'Météo-France AROME HD', org: 'France · 1,3 km', base: 0.94, orog: 0.97, coast: 0.96, long: false, days: 2 },
  icon_eu: { id: 'icon_eu', label: 'DWD ICON-EU', org: 'Europe · 7 km', base: 0.91, orog: 0.88, coast: 0.86, long: false, days: 5, appModelId: 'iconEu' },
  icon_d2: { id: 'icon_d2', label: 'DWD ICON-D2', org: 'Europe cent. · 2,2 km', base: 0.93, orog: 0.94, coast: 0.90, long: false, days: 2 },
  ukmo_uk_deterministic_2km: { id: 'ukmo_uk_deterministic_2km', label: 'UKMO UKV 2 km', org: 'Royaume-Uni · 2 km', base: 0.93, orog: 0.94, coast: 0.96, long: false, days: 5 },
  jma_seamless: { id: 'jma_seamless', label: 'JMA (seamless)', org: 'Japon · 5–20 km', base: 0.83, orog: 0.78, coast: 0.85, long: false, days: 11, appModelId: 'jma' },
  jma_msm: { id: 'jma_msm', label: 'JMA MSM (haute rés.)', org: 'Japon · 5 km', base: 0.90, orog: 0.92, coast: 0.94, long: false, days: 2 },
  metno_seamless: { id: 'metno_seamless', label: 'MET Norway Nordic', org: 'Scandinavie · 1–2,5 km', base: 0.92, orog: 0.95, coast: 0.95, long: false, days: 3, appModelId: 'metno' },
  metno_nordic: { id: 'metno_nordic', label: 'MET Norway MEPS', org: 'Scandinavie · 2,5 km', base: 0.91, orog: 0.94, coast: 0.94, long: false, days: 3 },
  knmi_seamless: { id: 'knmi_seamless', label: 'KNMI Harmonie-AROME', org: 'Pays-Bas · 2 km', base: 0.91, orog: 0.80, coast: 0.95, long: false, days: 3, appModelId: 'knmi' },
  dmi_seamless: { id: 'dmi_seamless', label: 'DMI Harmonie-AROME', org: 'Danemark · 2 km', base: 0.91, orog: 0.80, coast: 0.95, long: false, days: 3, appModelId: 'dmi' },
  meteoswiss_icon_ch1: { id: 'meteoswiss_icon_ch1', label: 'MeteoSwiss ICON-CH1', org: 'Alpes · 1 km', base: 0.95, orog: 0.98, coast: 0.80, long: false, days: 2 },
  meteoswiss_icon_ch2: { id: 'meteoswiss_icon_ch2', label: 'MeteoSwiss ICON-CH2', org: 'Alpes · 2 km', base: 0.94, orog: 0.97, coast: 0.80, long: false, days: 5 },
  chmi_icon_d2: { id: 'chmi_icon_d2', label: 'CHMI Aladin / ICON', org: 'Europe cent. · 2 km', base: 0.90, orog: 0.90, coast: 0.80, long: false, days: 3 },
  ncep_hrrr_conus: { id: 'ncep_hrrr_conus', label: 'NOAA HRRR', org: 'USA · 3 km', base: 0.93, orog: 0.92, coast: 0.88, long: false, days: 2 },
  ncep_nbm_conus: { id: 'ncep_nbm_conus', label: 'NOAA National Blend', org: 'USA · 2,5 km', base: 0.92, orog: 0.88, coast: 0.88, long: false, days: 11 },
  gem_hrdps_continental: { id: 'gem_hrdps_continental', label: 'CMC HRDPS', org: 'Canada · 2,5 km', base: 0.93, orog: 0.92, coast: 0.90, long: false, days: 2 },
  cma_grapes_global: { id: 'cma_grapes_global', label: 'CMA GRAPES Global', org: 'Chine · 15 km', base: 0.80, orog: 0.72, coast: 0.74, long: false, days: 10, appModelId: 'cma' },
};

export interface HtmlRegionFlags {
  eu: boolean;
  fr: boolean;
  us: boolean;
  ca: boolean;
  gb: boolean;
  jp: boolean;
  nordic: boolean;
  dk: boolean;
  ch: boolean;
  cz: boolean;
}

export function regionForLocation(cc: string | undefined, lat: number, lon: number): HtmlRegionFlags {
  const c = (cc || '').toUpperCase();
  const eu =
    ['FR', 'BE', 'LU', 'CH', 'DE', 'ES', 'IT', 'PT', 'NL', 'GB', 'IE', 'AT', 'DK', 'NO', 'SE', 'FI', 'PL', 'CZ'].includes(c) ||
    (lat > 35 && lat < 71 && lon > -12 && lon < 32);
  const fr = c === 'FR' || (lat > 41 && lat < 51.5 && lon > -5.5 && lon < 10);
  const us = c === 'US' || (lat > 24 && lat < 50 && lon > -126 && lon < -65);
  const ca = c === 'CA' || (lat > 42 && lat < 75 && lon > -142 && lon < -52);
  const gb = ['GB', 'IE'].includes(c) || (lat > 49.5 && lat < 61 && lon > -11 && lon < 2);
  const jp = c === 'JP' || (lat > 24 && lat < 46 && lon > 122 && lon < 148);
  const nordic = ['NO', 'SE', 'FI', 'DK'].includes(c) || (lat > 54 && lat < 72 && lon > 4 && lon < 32);
  const dk = c === 'DK' || (lat > 54.4 && lat < 58 && lon > 7.5 && lon < 15.5);
  const ch = c === 'CH' || (lat > 45.6 && lat < 48 && lon > 5.8 && lon < 10.6);
  const cz = c === 'CZ' || (lat > 48.4 && lat < 51.2 && lon > 12 && lon < 19);
  return { eu, fr, us, ca, gb, jp, nordic, dk, ch, cz };
}

export function htmlModelIdsForRegion(R: HtmlRegionFlags): string[] {
  const list = [
    'ecmwf_ifs025',
    'ecmwf_aifs025_single',
    'gfs_seamless',
    'gfs_global',
    'gfs_graphcast025',
    'icon_seamless',
    'icon_global',
    'gem_seamless',
    'gem_global',
    'ukmo_seamless',
  ];
  if (R.eu) list.push('meteofrance_seamless', 'meteofrance_arpege_europe', 'icon_eu', 'icon_d2');
  if (R.fr) list.push('meteofrance_arome_france', 'meteofrance_arome_france_hd');
  if (R.gb) list.push('ukmo_uk_deterministic_2km');
  if (R.jp) list.push('jma_seamless', 'jma_msm');
  if (R.nordic) list.push('metno_seamless', 'metno_nordic', 'knmi_seamless');
  if (R.dk) list.push('dmi_seamless');
  if (R.ch) list.push('meteoswiss_icon_ch1', 'meteoswiss_icon_ch2');
  if (R.cz) list.push('chmi_icon_d2');
  if (R.us) list.push('ncep_hrrr_conus', 'ncep_nbm_conus');
  if (R.ca) list.push('gem_hrdps_continental');
  return Array.from(new Set(list));
}

export function clampVal(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

export interface TerrainMeta {
  alt: number;
  coastal: number;
  relief: number;
  exposure: number;
}

export function computeHtmlModelRawWeight(
  modelId: string,
  meta: TerrainMeta,
  region: HtmlRegionFlags
): number {
  const M = HTML_MODELS_REGISTRY[modelId];
  if (!M) return 0.8;
  const altF = clampVal((meta.alt || 0) / 1200, 0, 1);
  const coastal = clampVal(meta.coastal || 0, 0, 1);

  let raw = M.base || 0.8;
  const isNative =
    (modelId === 'meteofrance_arome_france' && region.fr) ||
    (modelId === 'meteofrance_arome_france_hd' && region.fr) ||
    (modelId === 'meteofrance_seamless' && region.eu) ||
    (modelId === 'meteofrance_arpege_europe' && region.eu) ||
    (modelId === 'icon_eu' && region.eu) ||
    (modelId === 'icon_d2' && region.eu) ||
    (modelId === 'ncep_hrrr_conus' && region.us) ||
    (modelId === 'ncep_nbm_conus' && region.us) ||
    (modelId === 'gem_hrdps_continental' && region.ca) ||
    (modelId === 'ukmo_uk_deterministic_2km' && region.gb) ||
    ((modelId === 'jma_seamless' || modelId === 'jma_msm') && region.jp) ||
    ((modelId === 'meteoswiss_icon_ch1' || modelId === 'meteoswiss_icon_ch2') && region.ch) ||
    ((modelId === 'metno_seamless' || modelId === 'metno_nordic') && region.nordic);

  if (isNative) raw *= 1.12;
  raw *= (1 - 0.28 * altF * (1 - (M.orog || 0.6))) * (1 - 0.18 * coastal * (1 - (M.coast || 0.6)));
  return raw;
}

export function computeHtmlModelWeightAtDay(
  modelId: string,
  rawWeight: number,
  dayIndex: number
): number {
  const M = HTML_MODELS_REGISTRY[modelId];
  let w = rawWeight;
  if (dayIndex >= 8) {
    w *= M?.long ? 1.06 : 0.96;
  }
  return w;
}

export function computeWeightedMean(arr: Array<number | null | undefined>, weights: number[]): number | null {
  let s = 0;
  let w = 0;
  for (let i = 0; i < arr.length; i++) {
    const v = arr[i];
    if (typeof v === 'number' && !isNaN(v)) {
      s += v * (weights[i] || 1);
      w += weights[i] || 1;
    }
  }
  return w > 0 ? s / w : null;
}

export function computeWeightedStd(
  arr: Array<number | null | undefined>,
  meanVal: number | null,
  weights: number[]
): number {
  if (meanVal == null) return 0;
  let s = 0;
  let w = 0;
  for (let i = 0; i < arr.length; i++) {
    const v = arr[i];
    if (typeof v === 'number' && !isNaN(v)) {
      const wt = weights[i] || 1;
      s += wt * (v - meanVal) * (v - meanVal);
      w += wt;
    }
  }
  return w > 0 ? Math.sqrt(s / w) : 0;
}
