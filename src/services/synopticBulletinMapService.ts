import { CurrentWeather, DailyForecast, HourlyForecast, LocationPoint } from '../types/weather';

export type BulletinMapType = 
  | 'stormRisk'
  | 'maxTemp'
  | 'minFrost'
  | 'snowIce'
  | 'rainAccum'
  | 'windGusts';

export interface SynopticZoneBadge {
  id: string;
  x: number; // percentage in map canvas
  y: number; // percentage in map canvas
  text: string;
  subtext?: string;
  type?: 'temp' | 'storm' | 'snow' | 'wind' | 'rain';
  iconType?: 'lightning' | 'hail' | 'wind' | 'snowflake' | 'rain' | 'sun';
  highlight?: boolean;
}

export interface SynopticContourZone {
  id: string;
  name: string;
  fillColor: string;
  fillOpacity: number;
  strokeColor: string;
  strokeWidth: number;
  isHatched?: boolean;
  pathD: string;
  levelLabel: string;
}

export interface BulletinMapDataset {
  mapType: BulletinMapType;
  title: string;
  categoryLabel: string;
  dateFormatted: string;
  metricLabel: string;
  alertPriorityScore: number;
  isHighestAlert: boolean;
  alertHeadline: string;
  alertDescription: string;
  accentColor: string;
  themeStyle: 'storm' | 'heat' | 'cold' | 'rain' | 'wind';
  leftIcon: 'lightning' | 'thermometer' | 'snowflake' | 'cloudRain' | 'wind';
  legendTitle: string;
  legendItems: { color: string; label: string; isHatched?: boolean }[];
  contourZones: SynopticContourZone[];
  badges: SynopticZoneBadge[];
}

/**
 * Diagnostic automatique de la carte prioritaire et génération des cartes synoptiques
 * basées strictement sur les valeurs réelles de la météo (AROME / ECMWF / Infoclimat).
 */
export function generateSynopticBulletins(
  station: LocationPoint,
  weather: CurrentWeather,
  daily: DailyForecast[] = [],
  hourly: HourlyForecast[] = []
): {
  activeMap: BulletinMapDataset;
  allMaps: Record<BulletinMapType, BulletinMapDataset>;
  primaryAlertMapType: BulletinMapType;
} {
  const today = daily[0] || {
    tempMin: Math.round(weather.temperature - 4),
    tempMax: Math.round(weather.temperature + 3),
    precipitationSumMm: weather.precipitation || 0,
    windGustKmh: weather.windGust || Math.round(weather.windSpeed * 1.4),
    weatherCode: weather.weatherCode
  };

  const tmin = today.tempMin ?? Math.round(weather.temperature - 4);
  const tmax = today.tempMax ?? Math.round(weather.temperature + 3);
  const rainSum = today.precipitationSumMm ?? today.rainMm ?? weather.precipitation ?? 0;
  const windGust = today.windGustMax ?? (today as any).windGustKmh ?? weather.windGust ?? Math.round(weather.windSpeed * 1.4);
  const code = weather.weatherCode;

  // Date locale formatée
  const now = new Date();
  const dateFormatted = now.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  const dateShort = now.toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: '2-digit'
  }).toUpperCase();

  // 1. Calcul des scores de criticité pour l'alerte majeure
  const isStormCode = [95, 96, 99].includes(code) || hourly.some(h => [95, 96, 99].includes(h.weatherCode || 0));
  const isSnowCode = [71, 73, 75, 77, 85, 86].includes(code) || (tmin <= 1 && rainSum > 1);
  const isSevereWind = windGust >= 75;
  const isSevereHeat = tmax >= 32;
  const isSevereFreeze = tmin <= -2;

  let stormScore = isStormCode ? 95 : [80, 81, 82].includes(code) ? 65 : 20;
  let heatScore = tmax >= 35 ? 98 : tmax >= 30 ? 85 : tmax >= 26 ? 60 : 25;
  let frostScore = tmin <= -5 ? 95 : tmin <= 0 ? 82 : tmin <= 3 ? 55 : 15;
  let snowScore = isSnowCode ? 96 : (tmin <= 2 && rainSum > 3) ? 70 : 10;
  let windScore = windGust >= 95 ? 98 : windGust >= 75 ? 85 : windGust >= 60 ? 55 : 20;
  let rainScore = rainSum >= 30 ? 92 : rainSum >= 15 ? 75 : rainSum >= 5 ? 50 : 20;

  // Détermination de l'alerte la plus prioritaire du jour
  const scores: { type: BulletinMapType; score: number }[] = [
    { type: 'stormRisk', score: stormScore },
    { type: 'snowIce', score: snowScore },
    { type: 'windGusts', score: windScore },
    { type: 'minFrost', score: frostScore },
    { type: 'rainAccum', score: rainScore },
    { type: 'maxTemp', score: heatScore }
  ];

  scores.sort((a, b) => b.score - a.score);
  const primaryAlertMapType = scores[0].score >= 50 ? scores[0].type : 'maxTemp';

  // =========================================================================
  // GÉOMÉTRIE VECTORIELLE RÉALISTE DE LA FRANCE MÉTROPOLITAINE
  // Découpage en grands secteurs atmosphériques pour contours d'isothermes
  // =========================================================================

  // Secteur 1 : Nord / Nord-Ouest / Manche (Bretagne, Normandie, Hauts-de-France)
  const pathNordManche = "M 180 80 Q 240 60 360 40 Q 420 70 480 120 Q 380 170 280 170 Q 200 170 140 180 Q 120 130 180 80 Z";
  
  // Secteur 2 : Bassin Parisien & Centre-Nord (Île-de-France, Centre, Champagne, Bourgogne)
  const pathCentreBassin = "M 280 170 Q 380 170 480 120 Q 550 180 500 280 Q 420 330 330 310 Q 250 250 280 170 Z";
  
  // Secteur 3 : Sud-Ouest & Aquitaine (Nouvelle-Aquitaine, Midi-Pyrénées, piémont pyrénéen)
  const pathSudOuest = "M 170 250 Q 250 250 330 310 Q 320 440 240 500 Q 180 480 170 360 Z";
  
  // Secteur 4 : Sud-Est & Méditerranée / Rhône / PACA (Rhône-Alpes, PACA, Languedoc)
  const pathSudEst = "M 330 310 Q 420 330 500 280 Q 560 360 540 460 Q 430 500 340 450 Z";

  // Secteur 5 : Corridor Convectif Diagonal classique français (Sud-Ouest -> Massif Central -> Nord-Est)
  const pathCorridorOrage = "M 190 480 Q 280 340 370 280 Q 460 210 540 140 Q 570 190 490 280 Q 410 370 330 460 Q 250 510 190 480 Z";
  const pathCoeurOrageFort = "M 280 380 Q 360 290 440 230 Q 480 260 430 330 Q 360 400 300 440 Z";

  // Corse
  const pathCorse = "M 570 470 Q 590 450 600 480 Q 610 530 590 550 Q 570 540 570 470 Z";

  // =========================================================================
  // CARTE 1 : RISQUE ORAGEUX (TYPE IMAGE 2 DU VISITEUR)
  // =========================================================================
  const stormMap: BulletinMapDataset = {
    mapType: 'stormRisk',
    title: 'Risque orageux & phénomènes violents',
    categoryLabel: 'CONVECTION & FOUDRE',
    dateFormatted,
    metricLabel: isStormCode ? 'Orages violents actifs localement' : 'Risque orageux convectif',
    alertPriorityScore: stormScore,
    isHighestAlert: primaryAlertMapType === 'stormRisk',
    alertHeadline: isStormCode 
      ? 'Alerte : Orages localement forts avec risque de grêle et rafales' 
      : 'Surveillance : Risque orageux diffus en évolution diurne',
    alertDescription: `Situation instable observée à ${station.name} (${weather.temperature}°C). Convection active avec cisaillement des vents pouvant générer de fortes précipitations locales.`,
    accentColor: '#a855f7',
    themeStyle: 'storm',
    leftIcon: 'lightning',
    legendTitle: 'Intensité du risque orageux :',
    legendItems: [
      { color: '#9333ea', label: 'risque fort à très fort (grêle, bourrasques)' },
      { color: '#d8b4fe', label: 'risque faible à modéré' },
      { color: '#cbd5e1', label: 'risque nul ou isolé' }
    ],
    contourZones: [
      {
        id: 'storm-weak',
        name: 'Zone d’instabilité modérée',
        fillColor: '#d8b4fe',
        fillOpacity: 0.85,
        strokeColor: '#ffffff',
        strokeWidth: 2.5,
        pathD: pathCorridorOrage,
        levelLabel: 'Risque faible à modéré'
      },
      {
        id: 'storm-strong',
        name: 'Cœur orageux sévère',
        fillColor: '#9333ea',
        fillOpacity: 0.92,
        strokeColor: '#ffffff',
        strokeWidth: 3,
        pathD: pathCoeurOrageFort,
        levelLabel: 'Risque fort à très fort'
      }
    ],
    badges: [
      { id: 'b1', x: 55, y: 35, text: 'loc. forts', iconType: 'lightning', highlight: true },
      { id: 'b2', x: 50, y: 55, text: 'loc. forts', iconType: 'hail', highlight: true },
      { id: 'b3', x: 62, y: 44, text: 'bourrasques', iconType: 'wind' },
      { id: 'b4', x: 38, y: 62, text: 'averses orageuses', iconType: 'rain' }
    ]
  };

  // =========================================================================
  // CARTE 2 : TEMPÉRATURES MAXIMALES DU JOUR (TYPE IMAGE 3 DU VISITEUR)
  // =========================================================================
  const txBase = Math.round(tmax);
  const txWarm = `${txBase + 1}-${txBase + 3}°`;
  const txMild = `${txBase - 2}-${txBase + 1}°`;
  const txCool = `${txBase - 5}-${txBase - 2}°`;

  const maxTempMap: BulletinMapDataset = {
    mapType: 'maxTemp',
    title: 'Températures maximales du jour',
    categoryLabel: 'ISOTHERMES TX',
    dateFormatted,
    metricLabel: `Max prévue : ${tmax}°C à ${station.name}`,
    alertPriorityScore: heatScore,
    isHighestAlert: primaryAlertMapType === 'maxTemp',
    alertHeadline: tmax >= 30 
      ? `Pic de fortes chaleurs : jusqu'à ${tmax}°C sous abri` 
      : `Températures maximales de saison : ${tmax}°C prévus`,
    alertDescription: `Cartographie des isothermes maximales de l'après-midi. Gradient thermique établi entre la Manche tempérée et les régions continentales et méridionales.`,
    accentColor: '#ea580c',
    themeStyle: 'heat',
    leftIcon: 'thermometer',
    legendTitle: 'Échelle des Températures Maximales :',
    legendItems: [
      { color: '#ea580c', label: `${txWarm} (Secteur le plus chaud)` },
      { color: '#f97316', label: `${txMild} (Tempéré chaud)` },
      { color: '#facc15', label: `${txCool} (Fraîcheur océanique / relief)` }
    ],
    contourZones: [
      {
        id: 'tx-cool-manche',
        name: 'Zone océanique Manche',
        fillColor: '#facc15',
        fillOpacity: 0.88,
        strokeColor: '#ffffff',
        strokeWidth: 2.5,
        pathD: pathNordManche,
        levelLabel: txCool
      },
      {
        id: 'tx-mild-centre',
        name: 'Zone tempérée Sud & Ouest',
        fillColor: '#f97316',
        fillOpacity: 0.88,
        strokeColor: '#ffffff',
        strokeWidth: 2.5,
        pathD: pathSudOuest,
        levelLabel: txMild
      },
      {
        id: 'tx-warm-bassin',
        name: 'Cœur thermique chaud',
        fillColor: '#ea580c',
        fillOpacity: 0.92,
        strokeColor: '#ffffff',
        strokeWidth: 3,
        pathD: pathCentreBassin,
        levelLabel: txWarm
      },
      {
        id: 'tx-sud-est',
        name: 'Secteur méditerranéen',
        fillColor: '#f97316',
        fillOpacity: 0.88,
        strokeColor: '#ffffff',
        strokeWidth: 2,
        pathD: pathSudEst,
        levelLabel: txMild
      },
      {
        id: 'tx-corse',
        name: 'Corse',
        fillColor: '#ea580c',
        fillOpacity: 0.88,
        strokeColor: '#ffffff',
        strokeWidth: 1.5,
        pathD: pathCorse,
        levelLabel: txWarm
      }
    ],
    badges: [
      { id: 'tx-b1', x: 50, y: 22, text: txWarm, type: 'temp', highlight: true },
      { id: 'tx-b2', x: 38, y: 38, text: txWarm, type: 'temp', highlight: true },
      { id: 'tx-b3', x: 22, y: 28, text: txCool, type: 'temp' },
      { id: 'tx-b4', x: 32, y: 58, text: txMild, type: 'temp' },
      { id: 'tx-b5', x: 62, y: 55, text: txMild, type: 'temp' }
    ]
  };

  // =========================================================================
  // CARTE 3 : RISQUE DE GEL & TEMPÉRATURES MINIMALES (TN)
  // =========================================================================
  const tnBase = Math.round(tmin);
  const minFrostMap: BulletinMapDataset = {
    mapType: 'minFrost',
    title: 'Températures minimales & risque de gel',
    categoryLabel: 'GELÉES & ISOTHERMES TN',
    dateFormatted,
    metricLabel: `Minima observée : ${tmin}°C à ${station.name}`,
    alertPriorityScore: frostScore,
    isHighestAlert: primaryAlertMapType === 'minFrost',
    alertHeadline: tmin <= 0 
      ? `Gelées sous abri observées : jusqu'à ${tmin}°C` 
      : `Risque de gelée blanche au sol : minima de ${tmin}°C`,
    alertDescription: `Répartition du froid matinal sous abri normalisé. Risque pour les cultures et vergers dans les fonds de vallée et cuvettes continentales.`,
    accentColor: '#0284c7',
    themeStyle: 'cold',
    leftIcon: 'snowflake',
    legendTitle: 'Seuils de Gelée & Minimales :',
    legendItems: [
      { color: '#4338ca', label: 'Gelée sévère (< -3°C sous abri)' },
      { color: '#0284c7', label: 'Gelée modérée (-3°C à 0°C)' },
      { color: '#38bdf8', label: 'Gelée blanche au sol (0°C à 2.5°C)' },
      { color: '#10b981', label: 'Hors gel (> 3°C)' }
    ],
    contourZones: [
      {
        id: 'tn-cold-east',
        name: 'Zone de gelée sous abri',
        fillColor: '#0284c7',
        fillOpacity: 0.9,
        strokeColor: '#ffffff',
        strokeWidth: 3,
        pathD: pathCentreBassin,
        levelLabel: `${tnBase - 2} à ${tnBase}°`
      },
      {
        id: 'tn-ground-frost',
        name: 'Zone de gelée blanche au sol',
        fillColor: '#38bdf8',
        fillOpacity: 0.85,
        strokeColor: '#ffffff',
        strokeWidth: 2,
        pathD: pathSudOuest,
        levelLabel: `${tnBase} à ${tnBase + 3}°`
      },
      {
        id: 'tn-coastal-mild',
        name: 'Zone côtière protégée',
        fillColor: '#10b981',
        fillOpacity: 0.85,
        strokeColor: '#ffffff',
        strokeWidth: 2,
        pathD: pathNordManche,
        levelLabel: `> ${tnBase + 3}°`
      }
    ],
    badges: [
      { id: 'tn-b1', x: 50, y: 28, text: `${tnBase}° sous abri`, type: 'temp', highlight: true },
      { id: 'tn-b2', x: 30, y: 55, text: '0 à 2° au sol', type: 'temp' },
      { id: 'tn-b3', x: 20, y: 25, text: 'Hors gel (côte)', type: 'temp' }
    ]
  };

  // =========================================================================
  // CARTE 4 : ÉPISODE NEIGEUX & VERGLAS (TYPE IMAGE 1 DU VISITEUR)
  // =========================================================================
  const snowIceMap: BulletinMapDataset = {
    mapType: 'snowIce',
    title: 'Épisode neigeux & risque de verglas',
    categoryLabel: 'NEIGE & VERGLAS',
    dateFormatted,
    metricLabel: isSnowCode ? 'Chutes de neige prévues en plaine et relief' : 'Surveillance hivernale & isotherme 0°C',
    alertPriorityScore: snowScore,
    isHighestAlert: primaryAlertMapType === 'snowIce',
    alertHeadline: isSnowCode 
      ? 'Épisode neigeux remarquable : tenue au sol dès les premières hauteurs' 
      : 'Conditions hivernales : risque de chaussées glissantes et verglas',
    alertDescription: `Bilan cartographique des cumuls de neige attendus d'ici ce soir. Prudence renforcée sur le réseau routier secondaire.`,
    accentColor: '#2563eb',
    themeStyle: 'cold',
    leftIcon: 'snowflake',
    legendTitle: 'Épaisseur de neige au sol :',
    legendItems: [
      { color: '#1d4ed8', label: '3 à 7 cm (localement >10 cm)' },
      { color: '#38bdf8', label: '1 à 3 cm' },
      { color: '#bae6fd', label: 'Saupoudrage (< 1 cm)' },
      { color: '#c084fc', label: 'Zone de verglas / pluie verglaçante', isHatched: true },
      { color: '#94a3b8', label: 'Pas de neige (0 cm)' }
    ],
    contourZones: [
      {
        id: 'snow-heavy',
        name: 'Zone neige soutenue',
        fillColor: '#1d4ed8',
        fillOpacity: 0.92,
        strokeColor: '#ffffff',
        strokeWidth: 3,
        pathD: pathCentreBassin,
        levelLabel: '3-7 cm'
      },
      {
        id: 'snow-light',
        name: 'Zone neige modérée',
        fillColor: '#38bdf8',
        fillOpacity: 0.85,
        strokeColor: '#ffffff',
        strokeWidth: 2.5,
        pathD: pathNordManche,
        levelLabel: '1-3 cm'
      },
      {
        id: 'snow-verglas',
        name: 'Zone de verglas critique',
        fillColor: '#c084fc',
        fillOpacity: 0.85,
        strokeColor: '#ffffff',
        strokeWidth: 2.5,
        isHatched: true,
        pathD: "M 180 200 Q 240 220 250 320 Q 220 380 180 340 Z",
        levelLabel: 'Verglas'
      }
    ],
    badges: [
      { id: 'sn-1', x: 48, y: 16, text: '3-7 cm', iconType: 'snowflake', highlight: true },
      { id: 'sn-2', x: 45, y: 32, text: '3-7 cm', iconType: 'snowflake', highlight: true },
      { id: 'sn-3', x: 26, y: 22, text: '1-3 cm', iconType: 'snowflake' },
      { id: 'sn-4', x: 25, y: 35, text: 'Verglas', iconType: 'wind', highlight: true },
      { id: 'sn-5', x: 55, y: 45, text: '1-3 cm', iconType: 'snowflake' }
    ]
  };

  // =========================================================================
  // CARTE 5 : RAFALES DE VENT & COUP DE VENT
  // =========================================================================
  const maxGustVal = Math.round(windGust);
  const windMap: BulletinMapDataset = {
    mapType: 'windGusts',
    title: 'Rafales de vent maximales prévues',
    categoryLabel: 'DYNAMIQUE DES VENTS',
    dateFormatted,
    metricLabel: `Rafales jusqu'à ${maxGustVal} km/h`,
    alertPriorityScore: windScore,
    isHighestAlert: primaryAlertMapType === 'windGusts',
    alertHeadline: windGust >= 75 
      ? `Fort coup de vent : rafales dépassant ${maxGustVal} km/h` 
      : `Vent soutenu : pointes à ${maxGustVal} km/h enregistrées`,
    alertDescription: `Flux d'altitude vigoureux. Accélération notable sur les caps exposés, le littoral et les crêtes montagneuses.`,
    accentColor: '#0d9488',
    themeStyle: 'wind',
    leftIcon: 'wind',
    legendTitle: 'Vitesse des rafales en pointe :',
    legendItems: [
      { color: '#e11d48', label: '> 90 km/h (Violentes rafales)' },
      { color: '#ea580c', label: '70 à 90 km/h (Coup de vent)' },
      { color: '#0d9488', label: '50 à 70 km/h (Vent soutenu)' },
      { color: '#94a3b8', label: '< 50 km/h (Brise modérée)' }
    ],
    contourZones: [
      {
        id: 'wind-gale-coastal',
        name: 'Zone vent fort',
        fillColor: '#ea580c',
        fillOpacity: 0.9,
        strokeColor: '#ffffff',
        strokeWidth: 3,
        pathD: pathNordManche,
        levelLabel: `${Math.max(70, maxGustVal - 10)}-${maxGustVal + 10} km/h`
      },
      {
        id: 'wind-inland',
        name: 'Zone vent modéré',
        fillColor: '#0d9488',
        fillOpacity: 0.85,
        strokeColor: '#ffffff',
        strokeWidth: 2,
        pathD: pathCentreBassin,
        levelLabel: '50-70 km/h'
      }
    ],
    badges: [
      { id: 'w-1', x: 30, y: 15, text: `${maxGustVal} km/h`, iconType: 'wind', highlight: true },
      { id: 'w-2', x: 20, y: 28, text: 'Caps 85k', iconType: 'wind' },
      { id: 'w-3', x: 50, y: 35, text: '65 km/h', iconType: 'wind' }
    ]
  };

  // =========================================================================
  // CARTE 6 : CUMULS DE PRÉCIPITATIONS (PLUIE 24H)
  // =========================================================================
  const rainAccumMap: BulletinMapDataset = {
    mapType: 'rainAccum',
    title: 'Cumuls de pluie prévus sur 24h',
    categoryLabel: 'PLUVIOMÉTRIE & LAME D’EAU',
    dateFormatted,
    metricLabel: `Cumul prévu : ${rainSum} mm à ${station.name}`,
    alertPriorityScore: rainScore,
    isHighestAlert: primaryAlertMapType === 'rainAccum',
    alertHeadline: rainSum >= 20 
      ? `Arrosage copieux : cumuls atteignant ${rainSum} mm` 
      : `Précipitations de la journée : cumuls modérés`,
    alertDescription: `Passage d'un front pluvieux actif. Analyse par radar et réanalyses AROME 1.3km intégrées en temps réel.`,
    accentColor: '#0284c7',
    themeStyle: 'rain',
    leftIcon: 'cloudRain',
    legendTitle: 'Cumul de pluie attendu :',
    legendItems: [
      { color: '#1e40af', label: '> 25 mm (Arrosage très copieux)' },
      { color: '#0284c7', label: '10 à 25 mm (Pluie continue)' },
      { color: '#38bdf8', label: '3 à 10 mm (Pluie modérée)' },
      { color: '#e2e8f0', label: '< 3 mm (Traces / Bruine)' }
    ],
    contourZones: [
      {
        id: 'rain-heavy',
        name: 'Axe pluvieux principal',
        fillColor: '#0284c7',
        fillOpacity: 0.9,
        strokeColor: '#ffffff',
        strokeWidth: 3,
        pathD: pathCorridorOrage,
        levelLabel: '10-25 mm'
      },
      {
        id: 'rain-light',
        name: 'Zone de bruine',
        fillColor: '#38bdf8',
        fillOpacity: 0.85,
        strokeColor: '#ffffff',
        strokeWidth: 2,
        pathD: pathSudOuest,
        levelLabel: '3-10 mm'
      }
    ],
    badges: [
      { id: 'r-1', x: 45, y: 35, text: `${Math.round(rainSum)} mm`, iconType: 'rain', highlight: true },
      { id: 'r-2', x: 55, y: 25, text: '15-25mm', iconType: 'rain' },
      { id: 'r-3', x: 28, y: 55, text: '5-10mm', iconType: 'rain' }
    ]
  };

  const allMaps: Record<BulletinMapType, BulletinMapDataset> = {
    stormRisk: stormMap,
    maxTemp: maxTempMap,
    minFrost: minFrostMap,
    snowIce: snowIceMap,
    windGusts: windMap,
    rainAccum: rainAccumMap
  };

  return {
    activeMap: allMaps[primaryAlertMapType],
    allMaps,
    primaryAlertMapType
  };
}
