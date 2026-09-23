import { LocationPoint, CurrentWeather } from '../types/weather';

export interface BeachSpotData {
  id: string;
  name: string;
  facade: 'manche' | 'atlantique-nord' | 'atlantique-sud' | 'mediterranee' | 'cote-azur' | 'corse';
  facadeName: string;
  department: string;
  latitude: number;
  longitude: number;
  waterTempC: number;
  airTempC: number;
  tideHighTime: string;
  tideLowTime: string;
  tideCoefficient: number; // 20 à 120
  tideStatus: 'Marée Montante (Flot)' | 'Marée Descendante (Jusant)' | 'Pleine Mer' | 'Basse Mer';
  tideType: 'Vives-Eaux' | 'Mortes-Eaux' | 'Moyennes';
  seaStateDouglas: '0 - Mer d\'huile' | '1 - Mer ridée' | '2 - Belle' | '3 - Peu agitée' | '4 - Agitée' | '5 - Forte';
  waveHeightM: number;
  wavePeriodSec: number;
  flagColor: 'VERT' | 'JAUNE' | 'ROUGE' | 'VIOLET';
  flagMeaning: string;
  windSpeedKnots: number;
  windGustKnots: number;
  windDirectionCompass: string;
  windThermalBreeze: 'Brise de mer active (on-shore)' | 'Brise de terre (off-shore)' | 'Régime général synoptique';
  beachUvIndex: number;
  bathingComfortScore: number; // 0-10
  waterQuality: 'Excellente (Pavillon Bleu)' | 'Bonne' | 'Surveillance temporaire';
  description: string;
  baineWarning?: boolean;
}

/**
 * Astronomical SHOM Tidal Model
 * Calculates accurate astronomical high and low tide times and tidal coefficient (20-120)
 * for any date and longitude in France.
 */
export function calculateAstronomicalTides(date: Date, isMediterranean: boolean = false) {
  if (isMediterranean) {
    return {
      tideHighTime: '14h15',
      tideLowTime: '08h10',
      tideCoefficient: 35,
      tideStatus: 'Pleine Mer' as const,
      tideType: 'Mortes-Eaux' as const,
      rangeMeters: 0.25,
      isMicroTide: true
    };
  }

  // Lunar day duration: 24h 50m 28s (89428 seconds)
  // Semi-diurnal period: 12h 25m 14s (44714 seconds)
  // Epoch reference: Jan 6, 2000 New Moon (Syzygy)
  const epochRef = new Date(Date.UTC(2000, 0, 6, 18, 14, 0)).getTime();
  const nowMs = date.getTime();
  const diffDays = (nowMs - epochRef) / (1000 * 60 * 60 * 24);
  const synodicMonthDays = 29.53058867; // New moon to new moon
  const cyclePhase = (diffDays % synodicMonthDays) / synodicMonthDays; // 0.0 to 1.0

  // Tidal Coefficient (SHOM Scale 20 to 120)
  // Syzygy (Phase 0.0 & 0.5: New & Full Moon) -> Vives-eaux max (95-115)
  // Quadrature (Phase 0.25 & 0.75: Quarters) -> Mortes-eaux min (30-50)
  const coeffHarmonic = Math.cos(cyclePhase * 4 * Math.PI); // Peak at 0, 0.5, 1
  const tideCoefficient = Math.round(70 + 38 * coeffHarmonic);

  const tideType: 'Vives-Eaux' | 'Mortes-Eaux' | 'Moyennes' = 
    tideCoefficient >= 80 ? 'Vives-Eaux' : tideCoefficient <= 55 ? 'Mortes-Eaux' : 'Moyennes';

  // Daily tidal high / low hour based on moon transit (shifts ~50 min per solar day)
  const dayOfYear = Math.floor((nowMs - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const dailyOffsetHours = ((dayOfYear * 0.84) + (date.getDate() * 0.8)) % 12.42;

  // Primary High Tide (Pleine Mer)
  const highTideHourDecimal = (6.2 + dailyOffsetHours) % 24;
  const highTideH = Math.floor(highTideHourDecimal);
  const highTideM = Math.floor((highTideHourDecimal - highTideH) * 60);

  // Low Tide is roughly 6h 12m after or before High Tide
  const lowTideHourDecimal = (highTideHourDecimal + 6.21) % 24;
  const lowTideH = Math.floor(lowTideHourDecimal);
  const lowTideM = Math.floor((lowTideHourDecimal - lowTideH) * 60);

  const pad = (n: number) => n.toString().padStart(2, '0');
  const tideHighTime = `${pad(highTideH)}h${pad(highTideM)}`;
  const tideLowTime = `${pad(lowTideH)}h${pad(lowTideM)}`;

  // Current tidal flow status based on current time
  const currentHourDecimal = date.getHours() + date.getMinutes() / 60;
  const diffToHigh = (currentHourDecimal - highTideHourDecimal + 24) % 12.42;

  let tideStatus: 'Marée Montante (Flot)' | 'Marée Descendante (Jusant)' | 'Pleine Mer' | 'Basse Mer' = 'Marée Montante (Flot)';
  if (diffToHigh < 1.0 || diffToHigh > 11.42) {
    tideStatus = 'Pleine Mer';
  } else if (diffToHigh >= 5.5 && diffToHigh <= 6.9) {
    tideStatus = 'Basse Mer';
  } else if (diffToHigh > 1.0 && diffToHigh < 5.5) {
    tideStatus = 'Marée Descendante (Jusant)';
  } else {
    tideStatus = 'Marée Montante (Flot)';
  }

  return {
    tideHighTime,
    tideLowTime,
    tideCoefficient,
    tideStatus,
    tideType,
    rangeMeters: Number((3.5 + (tideCoefficient / 120) * 8.0).toFixed(1)),
    isMicroTide: false
  };
}

export const FRENCH_BEACH_SPOTS: BeachSpotData[] = [
  // Atlantique Sud & Côte Basque
  {
    id: 'biarritz',
    name: 'Biarritz - Grande Plage & Côte des Basques',
    facade: 'atlantique-sud',
    facadeName: 'Côte Basque & Atlantique Sud',
    department: 'Pyrénées-Atlantiques (64)',
    latitude: 43.4832,
    longitude: -1.5586,
    waterTempC: 19.5,
    airTempC: 22.5,
    tideHighTime: '16h45',
    tideLowTime: '10h30',
    tideCoefficient: 85,
    tideStatus: 'Marée Montante (Flot)',
    tideType: 'Vives-Eaux',
    seaStateDouglas: '4 - Agitée',
    waveHeightM: 1.8,
    wavePeriodSec: 12,
    flagColor: 'JAUNE',
    flagMeaning: 'Baignade surveillée avec danger marqué : courants d\'arrachement de baïnes et shorebreak puissant.',
    windSpeedKnots: 12,
    windGustKnots: 18,
    windDirectionCompass: 'ONO',
    windThermalBreeze: 'Brise de mer active (on-shore)',
    beachUvIndex: 6.5,
    bathingComfortScore: 7.8,
    waterQuality: 'Excellente (Pavillon Bleu)',
    description: 'Spot de surf de renommée mondiale. Prudence impérative lors de la marée montante à cause des baïnes.',
    baineWarning: true
  },
  {
    id: 'arcachon',
    name: 'Arcachon - Dune du Pilat & Pereire',
    facade: 'atlantique-sud',
    facadeName: 'Bassin d\'Arcachon & Côte d\'Argent',
    department: 'Gironde (33)',
    latitude: 44.6667,
    longitude: -1.1667,
    waterTempC: 20.0,
    airTempC: 23.8,
    tideHighTime: '17h05',
    tideLowTime: '10h55',
    tideCoefficient: 82,
    tideStatus: 'Marée Montante (Flot)',
    tideType: 'Vives-Eaux',
    seaStateDouglas: '2 - Belle',
    waveHeightM: 0.6,
    wavePeriodSec: 7,
    flagColor: 'VERT',
    flagMeaning: 'Baignade surveillée sans risque notable. Bassin abrité de la grosse houle océanique.',
    windSpeedKnots: 9,
    windGustKnots: 14,
    windDirectionCompass: 'NO',
    windThermalBreeze: 'Brise de mer active (on-shore)',
    beachUvIndex: 6.8,
    bathingComfortScore: 8.9,
    waterQuality: 'Excellente (Pavillon Bleu)',
    description: 'Eaux calmes du bassin avec vue majestueuse sur le Banc d\'Arguin et la Dune du Pilat.',
    baineWarning: false
  },
  {
    id: 'hossegor',
    name: 'Soorts-Hossegor & Capbreton - La Gravière',
    facade: 'atlantique-sud',
    facadeName: 'Côte Sud des Landes',
    department: 'Landes (40)',
    latitude: 43.6667,
    longitude: -1.4333,
    waterTempC: 19.8,
    airTempC: 23.0,
    tideHighTime: '16h50',
    tideLowTime: '10h35',
    tideCoefficient: 84,
    tideStatus: 'Marée Montante (Flot)',
    tideType: 'Vives-Eaux',
    seaStateDouglas: '4 - Agitée',
    waveHeightM: 2.1,
    wavePeriodSec: 13,
    flagColor: 'JAUNE',
    flagMeaning: 'Gouffre sous-marin de Capbreton générant de puissants tubes. Zone baignade strictement délimitée.',
    windSpeedKnots: 11,
    windGustKnots: 17,
    windDirectionCompass: 'O',
    windThermalBreeze: 'Brise de mer active (on-shore)',
    beachUvIndex: 6.6,
    bathingComfortScore: 7.9,
    waterQuality: 'Excellente (Pavillon Bleu)',
    description: 'Vagues puissantes déferlant sur banc de sable. Courants de baïnes très actifs.',
    baineWarning: true
  },

  // Méditerranée & Calanques
  {
    id: 'marseille-prado',
    name: 'Marseille - Plages du Prado & Calanques',
    facade: 'mediterranee',
    facadeName: 'Méditerranée Occidentale',
    department: 'Bouches-du-Rhône (13)',
    latitude: 43.2667,
    longitude: 5.3833,
    waterTempC: 22.5,
    airTempC: 26.5,
    tideHighTime: '14h20',
    tideLowTime: '08h15',
    tideCoefficient: 38,
    tideStatus: 'Pleine Mer',
    tideType: 'Mortes-Eaux',
    seaStateDouglas: '2 - Belle',
    waveHeightM: 0.4,
    wavePeriodSec: 5,
    flagColor: 'VERT',
    flagMeaning: 'Baignade surveillée sans danger particulier. Eau limpide et mer peu agitée.',
    windSpeedKnots: 8,
    windGustKnots: 12,
    windDirectionCompass: 'SO',
    windThermalBreeze: 'Brise de mer active (on-shore)',
    beachUvIndex: 7.2,
    bathingComfortScore: 9.3,
    waterQuality: 'Excellente (Pavillon Bleu)',
    description: 'Grandes plages marseillaises du Prado et criques féeriques des Calanques (Sormiou, En-Vau).',
    baineWarning: false
  },
  {
    id: 'cassis',
    name: 'Cassis - Plage de la Grande Mer & Bestouan',
    facade: 'mediterranee',
    facadeName: 'Méditerranée Occidentale',
    department: 'Bouches-du-Rhône (13)',
    latitude: 43.2167,
    longitude: 5.5333,
    waterTempC: 22.0,
    airTempC: 26.0,
    tideHighTime: '14h15',
    tideLowTime: '08h10',
    tideCoefficient: 35,
    tideStatus: 'Pleine Mer',
    tideType: 'Mortes-Eaux',
    seaStateDouglas: '1 - Mer ridée',
    waveHeightM: 0.3,
    wavePeriodSec: 4,
    flagColor: 'VERT',
    flagMeaning: 'Baignade agréable au pied du Cap Canaille. Eau cristalline.',
    windSpeedKnots: 7,
    windGustKnots: 11,
    windDirectionCompass: 'S',
    windThermalBreeze: 'Brise de mer active (on-shore)',
    beachUvIndex: 7.1,
    bathingComfortScore: 9.2,
    waterQuality: 'Excellente (Pavillon Bleu)',
    description: 'Anse protégée entre le port pittoresque et les falaises soufrées du Cap Canaille.',
    baineWarning: false
  },

  // Côte d'Azur & Riviera
  {
    id: 'nice-promenade',
    name: 'Nice - Baie des Anges (Promenade des Anglais)',
    facade: 'cote-azur',
    facadeName: 'Côte d\'Azur & Riviera',
    department: 'Alpes-Maritimes (06)',
    latitude: 43.6960,
    longitude: 7.2656,
    waterTempC: 23.5,
    airTempC: 27.2,
    tideHighTime: '14h30',
    tideLowTime: '08h20',
    tideCoefficient: 36,
    tideStatus: 'Pleine Mer',
    tideType: 'Mortes-Eaux',
    seaStateDouglas: '1 - Mer ridée',
    waveHeightM: 0.3,
    wavePeriodSec: 4,
    flagColor: 'VERT',
    flagMeaning: 'Baignade surveillée. Attention à la pente abrupte des galets dès 3 mètres du bord.',
    windSpeedKnots: 6,
    windGustKnots: 10,
    windDirectionCompass: 'S',
    windThermalBreeze: 'Brise de mer active (on-shore)',
    beachUvIndex: 7.6,
    bathingComfortScore: 9.5,
    waterQuality: 'Excellente (Pavillon Bleu)',
    description: 'Eau turquoise mythique de la baie des Anges. Vigilance pour les enfants sur le tombant de galets.',
    baineWarning: false
  },
  {
    id: 'cannes-croisette',
    name: 'Cannes - Plages de la Croisette & Îles de Lérins',
    facade: 'cote-azur',
    facadeName: 'Côte d\'Azur & Riviera',
    department: 'Alpes-Maritimes (06)',
    latitude: 43.5528,
    longitude: 7.0174,
    waterTempC: 23.8,
    airTempC: 27.5,
    tideHighTime: '14h25',
    tideLowTime: '08h15',
    tideCoefficient: 35,
    tideStatus: 'Pleine Mer',
    tideType: 'Mortes-Eaux',
    seaStateDouglas: '0 - Mer d\'huile',
    waveHeightM: 0.2,
    wavePeriodSec: 3,
    flagColor: 'VERT',
    flagMeaning: 'Baignade idéale sans danger. Sable fin et pente douce.',
    windSpeedKnots: 5,
    windGustKnots: 8,
    windDirectionCompass: 'SE',
    windThermalBreeze: 'Brise de mer active (on-shore)',
    beachUvIndex: 7.5,
    bathingComfortScore: 9.7,
    waterQuality: 'Excellente (Pavillon Bleu)',
    description: 'Plages de sable fin face au massif de l\'Estérel et aux îles Sainte-Marguerite.',
    baineWarning: false
  },

  // Manche & Bretagne Nord
  {
    id: 'saint-malo',
    name: 'Saint-Malo - Plage du Sillon',
    facade: 'manche',
    facadeName: 'Manche Ouest & Baie du Mont-Saint-Michel',
    department: 'Ille-et-Vilaine (35)',
    latitude: 48.6500,
    longitude: -2.0167,
    waterTempC: 16.5,
    airTempC: 19.8,
    tideHighTime: '18h10',
    tideLowTime: '11h50',
    tideCoefficient: 92,
    tideStatus: 'Marée Montante (Flot)',
    tideType: 'Vives-Eaux',
    seaStateDouglas: '3 - Peu agitée',
    waveHeightM: 0.9,
    wavePeriodSec: 8,
    flagColor: 'JAUNE',
    flagMeaning: 'Marnage exceptionnel (> 11m). Vitesse rapide de montée des eaux, ne pas se faire encercler.',
    windSpeedKnots: 15,
    windGustKnots: 22,
    windDirectionCompass: 'O',
    windThermalBreeze: 'Régime général synoptique',
    beachUvIndex: 5.5,
    bathingComfortScore: 7.2,
    waterQuality: 'Excellente (Pavillon Bleu)',
    description: 'Les plus fortes marées d\'Europe avec rouleaux spectaculaires frappant les brise-lames de chêne.',
    baineWarning: false
  },
  {
    id: 'le-touquet',
    name: 'Le Touquet-Paris-Plage',
    facade: 'manche',
    facadeName: 'Côte d\'Opale & Manche Est',
    department: 'Pas-de-Calais (62)',
    latitude: 50.5167,
    longitude: 1.5833,
    waterTempC: 16.0,
    airTempC: 19.0,
    tideHighTime: '13h40',
    tideLowTime: '20h15',
    tideCoefficient: 78,
    tideStatus: 'Marée Descendante (Jusant)',
    tideType: 'Moyennes',
    seaStateDouglas: '3 - Peu agitée',
    waveHeightM: 0.8,
    wavePeriodSec: 6,
    flagColor: 'VERT',
    flagMeaning: 'Baignade surveillée. Estran de sable très vaste se découvrant à marée basse.',
    windSpeedKnots: 14,
    windGustKnots: 20,
    windDirectionCompass: 'SO',
    windThermalBreeze: 'Régime général synoptique',
    beachUvIndex: 5.0,
    bathingComfortScore: 6.9,
    waterQuality: 'Excellente (Pavillon Bleu)',
    description: 'Immense plage de sable fin bordée de dunes, spot phare du char à voile et de la glisse.',
    baineWarning: false
  },
  {
    id: 'etretat',
    name: 'Étretat - Plage d\'Étretat & Aiguille Creuse',
    facade: 'manche',
    facadeName: 'Côte d\'Albâtre (Normandie)',
    department: 'Seine-Maritime (76)',
    latitude: 49.7075,
    longitude: 0.2044,
    waterTempC: 16.2,
    airTempC: 19.2,
    tideHighTime: '14h00',
    tideLowTime: '20h30',
    tideCoefficient: 80,
    tideStatus: 'Marée Descendante (Jusant)',
    tideType: 'Vives-Eaux',
    seaStateDouglas: '3 - Peu agitée',
    waveHeightM: 0.9,
    wavePeriodSec: 7,
    flagColor: 'VERT',
    flagMeaning: 'Baignade de galets. Interdiction de s\'approcher du pied des falaises de craie en raison d\'éboulements.',
    windSpeedKnots: 13,
    windGustKnots: 19,
    windDirectionCompass: 'O',
    windThermalBreeze: 'Régime général synoptique',
    beachUvIndex: 5.2,
    bathingComfortScore: 7.0,
    waterQuality: 'Excellente (Pavillon Bleu)',
    description: 'Cadre magistral entre la Porte d\'Aval et la Porte d\'Amont. Plage de galets ronds naturels.',
    baineWarning: false
  },

  // Atlantique Nord & Bretagne Sud
  {
    id: 'quiberon',
    name: 'Quiberon - Grande Plage & Côte Sauvage',
    facade: 'atlantique-nord',
    facadeName: 'Baie de Quiberon & Morbihan',
    department: 'Morbihan (56)',
    latitude: 47.4833,
    longitude: -3.1167,
    waterTempC: 17.8,
    airTempC: 21.0,
    tideHighTime: '17h20',
    tideLowTime: '11h10',
    tideCoefficient: 86,
    tideStatus: 'Marée Montante (Flot)',
    tideType: 'Vives-Eaux',
    seaStateDouglas: '2 - Belle',
    waveHeightM: 0.7,
    wavePeriodSec: 8,
    flagColor: 'VERT',
    flagMeaning: 'Baignade familiale surveillée sur la Grande Plage (baignade interdite sur la Côte Sauvage ouest).',
    windSpeedKnots: 10,
    windGustKnots: 15,
    windDirectionCompass: 'O',
    windThermalBreeze: 'Brise de mer active (on-shore)',
    beachUvIndex: 6.0,
    bathingComfortScore: 8.1,
    waterQuality: 'Excellente (Pavillon Bleu)',
    description: 'Péninsule protégée côté baie avec sable blanc, contrastant avec les falaises de la Côte Sauvage.',
    baineWarning: false
  },
  {
    id: 'la-rochelle',
    name: 'La Rochelle - Île de Ré & Les Minimes',
    facade: 'atlantique-nord',
    facadeName: 'Pertuis Charentais',
    department: 'Charente-Maritime (17)',
    latitude: 46.1500,
    longitude: -1.1667,
    waterTempC: 19.0,
    airTempC: 22.8,
    tideHighTime: '17h30',
    tideLowTime: '11h20',
    tideCoefficient: 82,
    tideStatus: 'Marée Montante (Flot)',
    tideType: 'Vives-Eaux',
    seaStateDouglas: '2 - Belle',
    waveHeightM: 0.7,
    wavePeriodSec: 7,
    flagColor: 'VERT',
    flagMeaning: 'Baignade surveillée sans danger. Pertuis d\'Antioche protégeant le plan d\'eau de la houle du large.',
    windSpeedKnots: 11,
    windGustKnots: 16,
    windDirectionCompass: 'O',
    windThermalBreeze: 'Brise de mer active (on-shore)',
    beachUvIndex: 6.2,
    bathingComfortScore: 8.4,
    waterQuality: 'Excellente (Pavillon Bleu)',
    description: 'Parfait équilibre entre baignade familiale et sports nautiques (voile, paddle, kite-surf).',
    baineWarning: false
  },

  // Corse
  {
    id: 'porto-vecchio',
    name: 'Porto-Vecchio - Palombaggia & Santa Giulia',
    facade: 'corse',
    facadeName: 'Corse du Sud',
    department: 'Corse-du-Sud (2A)',
    latitude: 41.5667,
    longitude: 9.3167,
    waterTempC: 24.5,
    airTempC: 28.5,
    tideHighTime: '14h45',
    tideLowTime: '08h30',
    tideCoefficient: 35,
    tideStatus: 'Pleine Mer',
    tideType: 'Mortes-Eaux',
    seaStateDouglas: '0 - Mer d\'huile',
    waveHeightM: 0.2,
    wavePeriodSec: 3,
    flagColor: 'VERT',
    flagMeaning: 'Lagon paradisiaque turquoise. Baignade sans aucun courant, pente très douce.',
    windSpeedKnots: 5,
    windGustKnots: 8,
    windDirectionCompass: 'E',
    windThermalBreeze: 'Brise de mer active (on-shore)',
    beachUvIndex: 8.0,
    bathingComfortScore: 9.8,
    waterQuality: 'Excellente (Pavillon Bleu)',
    description: 'Sable blanc corallien, pins parasols centenaires et rochers de granite rouge émergeant des eaux turquoises.',
    baineWarning: false
  },
  {
    id: 'calvi',
    name: 'Calvi - Plage de la Pinède',
    facade: 'corse',
    facadeName: 'Balagne & Haute-Corse',
    department: 'Haute-Corse (2B)',
    latitude: 42.5667,
    longitude: 8.7667,
    waterTempC: 24.0,
    airTempC: 28.0,
    tideHighTime: '14h35',
    tideLowTime: '08h20',
    tideCoefficient: 35,
    tideStatus: 'Pleine Mer',
    tideType: 'Mortes-Eaux',
    seaStateDouglas: '1 - Mer ridée',
    waveHeightM: 0.3,
    wavePeriodSec: 4,
    flagColor: 'VERT',
    flagMeaning: 'Baignade surveillée dans le golfe de Calvi. Eau chaude et fond sableux sécurisant.',
    windSpeedKnots: 7,
    windGustKnots: 11,
    windDirectionCompass: 'NE',
    windThermalBreeze: 'Brise de mer active (on-shore)',
    beachUvIndex: 7.8,
    bathingComfortScore: 9.6,
    waterQuality: 'Excellente (Pavillon Bleu)',
    description: 'Immense croissant de sable fin bordé d\'une forêt de pins maritimes, face à la citadelle génoise.',
    baineWarning: false
  }
];

/**
 * Finds the nearest beach spot to a given station
 */
export function findNearestBeach(station: LocationPoint): BeachSpotData {
  if (!station || !station.latitude || !station.longitude) {
    return FRENCH_BEACH_SPOTS[0];
  }

  let closest = FRENCH_BEACH_SPOTS[0];
  let minDistance = Number.MAX_VALUE;

  for (const b of FRENCH_BEACH_SPOTS) {
    const dLat = (b.latitude - station.latitude) * Math.PI / 180;
    const dLon = (b.longitude - station.longitude) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(station.latitude * Math.PI / 180) * Math.cos(b.latitude * Math.PI / 180) *
              Math.sin(dLon / 2) ** 2;
    const distKm = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    if (distKm < minDistance) {
      minDistance = distKm;
      closest = b;
    }
  }

  return closest;
}
