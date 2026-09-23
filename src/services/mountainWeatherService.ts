import { LocationPoint, CurrentWeather } from '../types/weather';

export interface MassifData {
  id: string;
  name: string;
  range: 'alpes-nord' | 'alpes-sud' | 'pyrenees' | 'massif-central' | 'jura' | 'vosges' | 'corse';
  rangeName: string;
  department: string;
  altitudePeak: number;
  altitudeBase: number;
  latitude: number;
  longitude: number;
  avalancheRiskLevel: 1 | 2 | 3 | 4 | 5;
  avalancheRiskLabel: string;
  avalancheRiskColor: string;
  criticalExposures: string[]; // e.g. ['N', 'NE', 'NO']
  criticalAltitudeMeters: number;
  snowDepthBottomCm: number; // à altitude station/base
  snowDepthTopCm: number; // au sommet / haute altitude
  freshSnow24hCm: number;
  ridgeWindGustKmh: number;
  snowQuality: 'Poudreuse froide' | 'Neige de printemps (regel)' | 'Plaques à vent friables' | 'Neige lourde humide' | 'Pistes damées / Névés d\'altitude' | 'Pâturages d\'alpage (hors neige)';
  beraSummary: string;
  nivoseStationName: string;
  nivoseElevationM: number;
}

export const FRENCH_MASSIFS: MassifData[] = [
  // Alpes du Nord
  {
    id: 'mont-blanc',
    name: 'Massif du Mont-Blanc',
    range: 'alpes-nord',
    rangeName: 'Alpes du Nord',
    department: 'Haute-Savoie (74)',
    altitudePeak: 4809,
    altitudeBase: 1050,
    latitude: 45.8326,
    longitude: 6.8652,
    avalancheRiskLevel: 2,
    avalancheRiskLabel: 'Limité (Niveau 2/5)',
    avalancheRiskColor: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
    criticalExposures: ['N', 'NE', 'E', 'NO'],
    criticalAltitudeMeters: 3000,
    snowDepthBottomCm: 0,
    snowDepthTopCm: 180,
    freshSnow24hCm: 5,
    ridgeWindGustKmh: 65,
    snowQuality: 'Plaques à vent friables',
    beraSummary: 'Conditions glaciaires en haute altitude. Présence de crevasses ouvertes en été/automne. Regel nocturne marqué au-dessus de 3000m.',
    nivoseStationName: 'Aiguille du Midi (Météo-France)',
    nivoseElevationM: 3842
  },
  {
    id: 'vanoise',
    name: 'Vanoise & Haute-Tarentaise',
    range: 'alpes-nord',
    rangeName: 'Alpes du Nord',
    department: 'Savoie (73)',
    altitudePeak: 3855,
    altitudeBase: 1400,
    latitude: 45.3333,
    longitude: 6.7833,
    avalancheRiskLevel: 1,
    avalancheRiskLabel: 'Faible (Niveau 1/5)',
    avalancheRiskColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    criticalExposures: ['N', 'NE'],
    criticalAltitudeMeters: 3100,
    snowDepthBottomCm: 0,
    snowDepthTopCm: 120,
    freshSnow24hCm: 0,
    ridgeWindGustKmh: 45,
    snowQuality: 'Neige de printemps (regel)',
    beraSummary: 'Manteau stabilisé en dessous de 3000m. Chutes de pierres possibles lors du dégel en parois rocheuses sud.',
    nivoseStationName: 'Bellecôte Nivôse',
    nivoseElevationM: 3000
  },
  {
    id: 'belledonne',
    name: 'Belledonne & Oisans',
    range: 'alpes-nord',
    rangeName: 'Alpes du Nord',
    department: 'Isère (38)',
    altitudePeak: 4102,
    altitudeBase: 900,
    latitude: 45.1833,
    longitude: 6.0000,
    avalancheRiskLevel: 1,
    avalancheRiskLabel: 'Faible (Niveau 1/5)',
    avalancheRiskColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    criticalExposures: ['N', 'E'],
    criticalAltitudeMeters: 2900,
    snowDepthBottomCm: 0,
    snowDepthTopCm: 80,
    freshSnow24hCm: 0,
    ridgeWindGustKmh: 40,
    snowQuality: 'Pistes damées / Névés d\'altitude',
    beraSummary: 'Randonnées d\'alpage praticables sans équipement neige jusqu\'à 2800m. Vigilance sur névés pentus résiduels le matin.',
    nivoseStationName: 'Le Pleynet Nivôse',
    nivoseElevationM: 2050
  },
  {
    id: 'aravis',
    name: 'Aravis & Bornes',
    range: 'alpes-nord',
    rangeName: 'Alpes du Nord',
    department: 'Haute-Savoie (74)',
    altitudePeak: 2750,
    altitudeBase: 1000,
    latitude: 45.8667,
    longitude: 6.5167,
    avalancheRiskLevel: 1,
    avalancheRiskLabel: 'Faible (Niveau 1/5)',
    avalancheRiskColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    criticalExposures: ['N'],
    criticalAltitudeMeters: 2600,
    snowDepthBottomCm: 0,
    snowDepthTopCm: 20,
    freshSnow24hCm: 0,
    ridgeWindGustKmh: 35,
    snowQuality: 'Pâturages d\'alpage (hors neige)',
    beraSummary: 'Massif totalement dégagé hors quelques combes d\'altitude ombragées. Sentiers d\'alpages en parfaites conditions estivales.',
    nivoseStationName: 'Pointe Percée Nivôse',
    nivoseElevationM: 2200
  },
  {
    id: 'chartreuse-vercors',
    name: 'Chartreuse & Vercors',
    range: 'alpes-nord',
    rangeName: 'Préalpes',
    department: 'Isère / Drôme (38/26)',
    altitudePeak: 2341,
    altitudeBase: 800,
    latitude: 44.9667,
    longitude: 5.5333,
    avalancheRiskLevel: 1,
    avalancheRiskLabel: 'Faible (Niveau 1/5)',
    avalancheRiskColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    criticalExposures: ['N'],
    criticalAltitudeMeters: 2100,
    snowDepthBottomCm: 0,
    snowDepthTopCm: 0,
    freshSnow24hCm: 0,
    ridgeWindGustKmh: 45,
    snowQuality: 'Pâturages d\'alpage (hors neige)',
    beraSummary: 'Hauts-plateaux du Vercors secs. Risque d\'orages d\'évolution diurne sur les crêtes rocheuses l\'après-midi.',
    nivoseStationName: 'Grand Veymont Sommet',
    nivoseElevationM: 2341
  },

  // Alpes du Sud
  {
    id: 'ecrins',
    name: 'Massif des Écrins & Pelvoux',
    range: 'alpes-sud',
    rangeName: 'Alpes du Sud',
    department: 'Hautes-Alpes (05)',
    altitudePeak: 4102,
    altitudeBase: 1300,
    latitude: 44.9228,
    longitude: 6.3578,
    avalancheRiskLevel: 2,
    avalancheRiskLabel: 'Limité (Niveau 2/5)',
    avalancheRiskColor: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
    criticalExposures: ['N', 'NE', 'NO'],
    criticalAltitudeMeters: 3200,
    snowDepthBottomCm: 0,
    snowDepthTopCm: 140,
    freshSnow24hCm: 2,
    ridgeWindGustKmh: 50,
    snowQuality: 'Neige de printemps (regel)',
    beraSummary: 'Course d\'alpinisme de haute montagne : regel nocturne de qualité en versants nord au-dessus de 3100m. Risque de chutes de séracs.',
    nivoseStationName: 'Glacier Blanc Nivôse',
    nivoseElevationM: 3200
  },
  {
    id: 'mercantour',
    name: 'Mercantour & Haut-Var',
    range: 'alpes-sud',
    rangeName: 'Alpes du Sud',
    department: 'Alpes-Maritimes (06)',
    altitudePeak: 3143,
    altitudeBase: 1200,
    latitude: 44.1500,
    longitude: 7.2500,
    avalancheRiskLevel: 1,
    avalancheRiskLabel: 'Faible (Niveau 1/5)',
    avalancheRiskColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    criticalExposures: ['N'],
    criticalAltitudeMeters: 2800,
    snowDepthBottomCm: 0,
    snowDepthTopCm: 15,
    freshSnow24hCm: 0,
    ridgeWindGustKmh: 40,
    snowQuality: 'Pâturages d\'alpage (hors neige)',
    beraSummary: 'Ensoleillement très généreux. Crêtes et sentiers du GR52 praticables. Attention aux rafales de brise de vallée.',
    nivoseStationName: 'Millefonts Nivôse',
    nivoseElevationM: 2430
  },

  // Pyrénées
  {
    id: 'pyrenees-haute-bigorre',
    name: 'Haute-Bigorre & Vignemale',
    range: 'pyrenees',
    rangeName: 'Pyrénées Centrales',
    department: 'Hautes-Pyrénées (65)',
    altitudePeak: 3298,
    altitudeBase: 1200,
    latitude: 42.7733,
    longitude: -0.1472,
    avalancheRiskLevel: 1,
    avalancheRiskLabel: 'Faible (Niveau 1/5)',
    avalancheRiskColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    criticalExposures: ['N', 'NE'],
    criticalAltitudeMeters: 2900,
    snowDepthBottomCm: 0,
    snowDepthTopCm: 45,
    freshSnow24hCm: 0,
    ridgeWindGustKmh: 55,
    snowQuality: 'Pistes damées / Névés d\'altitude',
    beraSummary: 'Glacier d\'Ossoue et couloir de Gaube : névés durs résiduels nécessitant crampons et piolet le matin. Pâturages dégagés.',
    nivoseStationName: 'Pic du Midi Nivôse',
    nivoseElevationM: 2877
  },
  {
    id: 'pyrenees-aspe-ossau',
    name: 'Aspe - Ossau & Gourette',
    range: 'pyrenees',
    rangeName: 'Pyrénées Occidentales',
    department: 'Pyrénées-Atlantiques (64)',
    altitudePeak: 2884,
    altitudeBase: 1100,
    latitude: 42.8428,
    longitude: -0.4289,
    avalancheRiskLevel: 1,
    avalancheRiskLabel: 'Faible (Niveau 1/5)',
    avalancheRiskColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    criticalExposures: ['N'],
    criticalAltitudeMeters: 2600,
    snowDepthBottomCm: 0,
    snowDepthTopCm: 20,
    freshSnow24hCm: 0,
    ridgeWindGustKmh: 45,
    snowQuality: 'Pâturages d\'alpage (hors neige)',
    beraSummary: 'Conditions douces atlantiques. Mer de nuages fréquente le matin vers 1400m se dissipant en mi-journée.',
    nivoseStationName: 'Soum Couy Nivôse',
    nivoseElevationM: 2150
  },
  {
    id: 'pyrenees-canigou',
    name: 'Massif du Canigou & Cerdagne',
    range: 'pyrenees',
    rangeName: 'Pyrénées Orientales',
    department: 'Pyrénées-Orientales (66)',
    altitudePeak: 2784,
    altitudeBase: 1000,
    latitude: 42.5189,
    longitude: 2.4567,
    avalancheRiskLevel: 1,
    avalancheRiskLabel: 'Faible (Niveau 1/5)',
    avalancheRiskColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    criticalExposures: ['N'],
    criticalAltitudeMeters: 2700,
    snowDepthBottomCm: 0,
    snowDepthTopCm: 5,
    freshSnow24hCm: 0,
    ridgeWindGustKmh: 60,
    snowQuality: 'Pâturages d\'alpage (hors neige)',
    beraSummary: 'Tramontane vigoureuse en crête sommitale (Pic du Canigou). Sentiers entièrement secs et rocheux.',
    nivoseStationName: 'Canigou Crête',
    nivoseElevationM: 2784
  },

  // Massif Central
  {
    id: 'massif-central-sancy',
    name: 'Massif du Sancy & Monts Dore',
    range: 'massif-central',
    rangeName: 'Massif Central',
    department: 'Puy-de-Dôme (63)',
    altitudePeak: 1885,
    altitudeBase: 1050,
    latitude: 45.5333,
    longitude: 2.8167,
    avalancheRiskLevel: 1,
    avalancheRiskLabel: 'Faible (Niveau 1/5)',
    avalancheRiskColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    criticalExposures: ['E'],
    criticalAltitudeMeters: 1700,
    snowDepthBottomCm: 0,
    snowDepthTopCm: 0,
    freshSnow24hCm: 0,
    ridgeWindGustKmh: 50,
    snowQuality: 'Pâturages d\'alpage (hors neige)',
    beraSummary: 'Aucun manteau neigeux résiduel. Crêtes herbeuses et chemins de randonnée du Puy de Sancy en parfait état.',
    nivoseStationName: 'Puy de Sancy Sommet',
    nivoseElevationM: 1885
  },
  {
    id: 'massif-central-cantal',
    name: 'Plomb du Cantal & Puy Mary',
    range: 'massif-central',
    rangeName: 'Massif Central',
    department: 'Cantal (15)',
    altitudePeak: 1855,
    altitudeBase: 1100,
    latitude: 45.0500,
    longitude: 2.7500,
    avalancheRiskLevel: 1,
    avalancheRiskLabel: 'Faible (Niveau 1/5)',
    avalancheRiskColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    criticalExposures: ['NE'],
    criticalAltitudeMeters: 1750,
    snowDepthBottomCm: 0,
    snowDepthTopCm: 0,
    freshSnow24hCm: 0,
    ridgeWindGustKmh: 45,
    snowQuality: 'Pâturages d\'alpage (hors neige)',
    beraSummary: 'Vent d\'Ouest soutenu sur les crêtes volcaniques. Visibilité panoramique remarquable.',
    nivoseStationName: 'Plomb du Cantal Météo',
    nivoseElevationM: 1855
  },

  // Jura
  {
    id: 'jura-hautes-combes',
    name: 'Hautes-Combes & Mont d\'Or',
    range: 'jura',
    rangeName: 'Jura & Doubs',
    department: 'Doubs / Jura (25/39)',
    altitudePeak: 1720,
    altitudeBase: 900,
    latitude: 46.7167,
    longitude: 6.3500,
    avalancheRiskLevel: 1,
    avalancheRiskLabel: 'Faible (Niveau 1/5)',
    avalancheRiskColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    criticalExposures: ['NE'],
    criticalAltitudeMeters: 1500,
    snowDepthBottomCm: 0,
    snowDepthTopCm: 0,
    freshSnow24hCm: 0,
    ridgeWindGustKmh: 35,
    snowQuality: 'Pâturages d\'alpage (hors neige)',
    beraSummary: 'Prairies jurassiennes et combes boisées sèches. Excellentes conditions de VTT et randonnée.',
    nivoseStationName: 'Mont d\'Or Sommet',
    nivoseElevationM: 1463
  },

  // Vosges
  {
    id: 'vosges-cretes',
    name: 'Hautes-Vosges & Hohneck',
    range: 'vosges',
    rangeName: 'Massif des Vosges',
    department: 'Vosges / Haut-Rhin (88/68)',
    altitudePeak: 1424,
    altitudeBase: 700,
    latitude: 48.0333,
    longitude: 7.0167,
    avalancheRiskLevel: 1,
    avalancheRiskLabel: 'Faible (Niveau 1/5)',
    avalancheRiskColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    criticalExposures: ['E'],
    criticalAltitudeMeters: 1300,
    snowDepthBottomCm: 0,
    snowDepthTopCm: 0,
    freshSnow24hCm: 0,
    ridgeWindGustKmh: 40,
    snowQuality: 'Pâturages d\'alpage (hors neige)',
    beraSummary: 'Route des Crêtes ouverte. Hautes chaumes ventilées avec risque de brouillard d\'inversion en matinée.',
    nivoseStationName: 'Grand Ballon Météo',
    nivoseElevationM: 1424
  },

  // Corse
  {
    id: 'corse-cinto',
    name: 'Monte Cinto & Massif du Rotondo',
    range: 'corse',
    rangeName: 'Haute Montagne Corse',
    department: 'Haute-Corse (2B)',
    altitudePeak: 2706,
    altitudeBase: 900,
    latitude: 42.4667,
    longitude: 8.9500,
    avalancheRiskLevel: 1,
    avalancheRiskLabel: 'Faible (Niveau 1/5)',
    avalancheRiskColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    criticalExposures: ['N'],
    criticalAltitudeMeters: 2500,
    snowDepthBottomCm: 0,
    snowDepthTopCm: 10,
    freshSnow24hCm: 0,
    ridgeWindGustKmh: 65,
    snowQuality: 'Pâturages d\'alpage (hors neige)',
    beraSummary: 'Tracé du GR20 sec. Rafales de Libeccio violentes sur les cols sommitales. Risque d\'orages thermiques.',
    nivoseStationName: 'Monte Cinto Nivôse',
    nivoseElevationM: 2600
  }
];

/**
 * Automatically detects the nearest mountain massif based on station coordinates
 */
export function findNearestMassif(station: LocationPoint): MassifData {
  if (!station || !station.latitude || !station.longitude) {
    return FRENCH_MASSIFS[0];
  }

  let closest = FRENCH_MASSIFS[0];
  let minDistance = Number.MAX_VALUE;

  for (const m of FRENCH_MASSIFS) {
    const dLat = (m.latitude - station.latitude) * Math.PI / 180;
    const dLon = (m.longitude - station.longitude) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(station.latitude * Math.PI / 180) * Math.cos(m.latitude * Math.PI / 180) *
              Math.sin(dLon / 2) ** 2;
    const distKm = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    if (distKm < minDistance) {
      minDistance = distKm;
      closest = m;
    }
  }

  return closest;
}

/**
 * Computes realistic atmospheric physical variables at any mountain altitude
 */
export function computeMountainPhysics(
  baseWeather: CurrentWeather,
  baseAltitude: number,
  targetAltitude: number
) {
  const deltaAlt = targetAltitude - baseAltitude;
  // Lapse rate: -0.65°C / 100m for dry/standard air, -0.55°C / 100m in saturated / rainy air
  const isWet = (baseWeather.humidity || 60) > 80 || (baseWeather.precipitation || 0) > 0;
  const lapseRatePer100m = isWet ? -0.55 : -0.65;
  const tempAtAltitude = Number((baseWeather.temperature + (deltaAlt / 100) * lapseRatePer100m).toFixed(1));

  // Wind amplification with elevation (relief compression and boundary layer exit)
  const altitudeRatio = Math.max(0, targetAltitude / 2000);
  const windSpeedAtAltitude = Math.round((baseWeather.windSpeed || 15) * (1 + altitudeRatio * 0.45));
  const windGustAtAltitude = Math.round((baseWeather.windGust || 25) * (1 + altitudeRatio * 0.50));

  // Wind Chill (Steadman formula)
  let windChill = tempAtAltitude;
  if (tempAtAltitude <= 10 && windSpeedAtAltitude >= 5) {
    windChill = Number((
      13.12 + 0.6215 * tempAtAltitude - 11.37 * Math.pow(windSpeedAtAltitude, 0.16) + 0.3965 * tempAtAltitude * Math.pow(windSpeedAtAltitude, 0.16)
    ).toFixed(1));
  }

  // UV index with elevation (+10% to 12% per 1000m) and snow reflection bonus (albedo up to +80%)
  const hasSnow = tempAtAltitude <= 0 || targetAltitude >= (baseWeather.snowRainLimitMeters || 2800);
  const uvElevationCoeff = 1 + (targetAltitude / 1000) * 0.12;
  const albedoMultiplier = hasSnow ? 1.80 : 1.0;
  const uvAtAltitude = Number(((baseWeather.uvIndex || 4) * uvElevationCoeff * albedoMultiplier).toFixed(1));

  // Local barometric pressure QFE (barometric formula)
  const qfePressure = Math.round(1013.25 * Math.pow(1 - (0.0065 * targetAltitude) / 288.15, 5.255));

  // Freezing level (isotherme 0°C) and snow/rain limit (LPN)
  const iso0 = baseWeather.isotherm0Meters || Math.round(baseAltitude + (baseWeather.temperature / 0.0065));
  const lpn = baseWeather.snowRainLimitMeters || Math.max(0, iso0 - 300);

  return {
    tempAtAltitude,
    windSpeedAtAltitude,
    windGustAtAltitude,
    windChill,
    uvAtAltitude,
    qfePressure,
    iso0,
    lpn,
    hasSnow
  };
}
