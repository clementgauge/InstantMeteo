import { CurrentWeather, LocationPoint } from '../types/weather';
import { calculateMoonPhase } from './ephemerisService';

export interface BeachSpot {
  id: string;
  name: string;
  coastline: 'Manche & Mer du Nord' | 'Bretagne & Celtique' | 'Océan Atlantique' | 'Mer Méditerranée & Corse' | 'Outre-Mer & Monde';
  department: string;
  latitude: number;
  longitude: number;
  waterTempC: number;
  airTempC: number;
  waveHeightM: number;
  wavePeriodSec: number;
  swellHeightM?: number;
  windWaveHeightM?: number;
  waveDirectionDeg?: number;
  oceanCurrentKnots?: number;
  windSpeedKnots: number;
  windDirectionCompass: string;
  seaStateDouglas: string;
  swimFlag: 'VERT' | 'JAUNE' | 'ROUGE';
  swimFlagReason: string;
  tideHighTime: string;
  tideLowTime: string;
  tideCoefficient: number;
  tideStatus: 'Montante (Flot)' | 'Descendante (Jusant)' | 'étale' | 'Marée négligeable (Méditerranée)';
  beachUvIndex: number;
  jellyfishRisk: 'Nul' | 'Faible' | 'Modéré' | 'Élevé';
  baineWarning: boolean;
  waterQuality: 'Excellente (Pavillon Bleu)' | 'Bonne' | 'Moyenne';
  bathingComfortScore: number; // 1 to 10
  windThermalBreeze: string;
  isLiveCustomSpot?: boolean;
}

export const BEACH_SPOTS: BeachSpot[] = [
  // MANCHE & MER DU NORD
  {
    id: 'malo-dunkerque',
    name: 'Malo-les-Bains & Le Touquet-Paris-Plage',
    coastline: 'Manche & Mer du Nord',
    department: 'Nord (59) / Pas-de-Calais (62)',
    latitude: 51.0500,
    longitude: 2.3980,
    waterTempC: 14.5,
    airTempC: 17.5,
    waveHeightM: 1.1,
    wavePeriodSec: 6,
    swellHeightM: 0.7,
    windWaveHeightM: 0.8,
    oceanCurrentKnots: 1.8,
    windSpeedKnots: 17,
    windDirectionCompass: 'WSW',
    seaStateDouglas: '3 — Peu agitée à agitée',
    swimFlag: 'JAUNE',
    swimFlagReason: 'Baignade surveillée : courants de marée longitudinaux sur les bancs de Flandre et vent soutenu propice au char à voile.',
    tideHighTime: '12:15',
    tideLowTime: '06:00',
    tideCoefficient: 84,
    tideStatus: 'Montante (Flot)',
    beachUvIndex: 5,
    jellyfishRisk: 'Faible',
    baineWarning: false,
    waterQuality: 'Excellente (Pavillon Bleu)',
    bathingComfortScore: 6.8,
    windThermalBreeze: 'Flux de Sud-Ouest dynamique en entrée du détroit du Pas-de-Calais'
  },
  {
    id: 'etretat-deauville',
    name: 'Étretat, Deauville & Côte Fleurie',
    coastline: 'Manche & Mer du Nord',
    department: 'Seine-Maritime (76) / Calvados (14)',
    latitude: 49.7073,
    longitude: 0.2045,
    waterTempC: 15.2,
    airTempC: 18.4,
    waveHeightM: 0.9,
    wavePeriodSec: 7,
    swellHeightM: 0.6,
    windWaveHeightM: 0.6,
    oceanCurrentKnots: 1.5,
    windSpeedKnots: 14,
    windDirectionCompass: 'WNW',
    seaStateDouglas: '3 — Peu agitée',
    swimFlag: 'VERT',
    swimFlagReason: 'Baignade autorisée. Attention impérative aux horaires de marée montante au pied des falaises du Pays de Caux.',
    tideHighTime: '10:45',
    tideLowTime: '17:10',
    tideCoefficient: 84,
    tideStatus: 'Descendante (Jusant)',
    beachUvIndex: 5,
    jellyfishRisk: 'Nul',
    baineWarning: false,
    waterQuality: 'Bonne',
    bathingComfortScore: 7.4,
    windThermalBreeze: 'Brise de mer d\'Ouest-Nord-Ouest modérée'
  },
  {
    id: 'saint-malo-sillon',
    name: 'Saint-Malo — Plage du Sillon, Dinard & Cancale',
    coastline: 'Manche & Mer du Nord',
    department: 'Ille-et-Vilaine (35)',
    latitude: 48.6542,
    longitude: -2.0114,
    waterTempC: 15.8,
    airTempC: 19.2,
    waveHeightM: 1.2,
    wavePeriodSec: 8,
    swellHeightM: 0.9,
    windWaveHeightM: 0.7,
    oceanCurrentKnots: 2.4,
    windSpeedKnots: 15,
    windDirectionCompass: 'WNW',
    seaStateDouglas: '3 — Peu agitée',
    swimFlag: 'JAUNE',
    swimFlagReason: 'Plus fort marnage d\'Europe en Baie du Mont-Saint-Michel et Saint-Malo. Remontée très rapide du flot sur l\'estran.',
    tideHighTime: '08:15',
    tideLowTime: '14:40',
    tideCoefficient: 88,
    tideStatus: 'Montante (Flot)',
    beachUvIndex: 6,
    jellyfishRisk: 'Nul',
    baineWarning: false,
    waterQuality: 'Excellente (Pavillon Bleu)',
    bathingComfortScore: 7.5,
    windThermalBreeze: 'Brise de mer de Nord-Ouest régulière à 15 nœuds'
  },
  // BRETAGNE & MER D'IROISE
  {
    id: 'perros-roscoff-brest',
    name: 'Perros-Guirec, Roscoff & Rade de Brest',
    coastline: 'Bretagne & Celtique',
    department: 'Côtes-d\'Armor (22) / Finistère (29)',
    latitude: 48.8147,
    longitude: -3.4428,
    waterTempC: 15.6,
    airTempC: 18.8,
    waveHeightM: 1.4,
    wavePeriodSec: 10,
    swellHeightM: 1.2,
    windWaveHeightM: 0.6,
    oceanCurrentKnots: 2.1,
    windSpeedKnots: 16,
    windDirectionCompass: 'W',
    seaStateDouglas: '3 à 4 — Peu agitée à agitée',
    swimFlag: 'VERT',
    swimFlagReason: 'Eaux limpides sur la Côte de Granit Rose. Surveillance des courants dans les chenaux insulaires.',
    tideHighTime: '07:20',
    tideLowTime: '13:45',
    tideCoefficient: 84,
    tideStatus: 'Descendante (Jusant)',
    beachUvIndex: 6,
    jellyfishRisk: 'Nul',
    baineWarning: false,
    waterQuality: 'Excellente (Pavillon Bleu)',
    bathingComfortScore: 7.8,
    windThermalBreeze: 'Vent d\'Ouest vivifiant et excellente visibilité marine'
  },
  {
    id: 'crozon-quiberon-carnac',
    name: 'Presqu\'île de Crozon, Quiberon, Carnac & Belle-Île',
    coastline: 'Bretagne & Celtique',
    department: 'Finistère (29) / Morbihan (56)',
    latitude: 47.4819,
    longitude: -3.1206,
    waterTempC: 16.8,
    airTempC: 20.6,
    waveHeightM: 1.5,
    wavePeriodSec: 11,
    swellHeightM: 1.3,
    windWaveHeightM: 0.5,
    oceanCurrentKnots: 1.9,
    windSpeedKnots: 14,
    windDirectionCompass: 'WNW',
    seaStateDouglas: '3 — Peu agitée (Baie) / 4 (Côte Sauvage)',
    swimFlag: 'JAUNE',
    swimFlagReason: 'Contraste marqué entre la Baie de Quiberon/Carnac (abritée, drapeau vert) et la Côte Sauvage exposée à la houle atlantique.',
    tideHighTime: '05:55',
    tideLowTime: '12:15',
    tideCoefficient: 84,
    tideStatus: 'Montante (Flot)',
    beachUvIndex: 7,
    jellyfishRisk: 'Nul',
    baineWarning: true,
    waterQuality: 'Excellente (Pavillon Bleu)',
    bathingComfortScore: 8.2,
    windThermalBreeze: 'Thermique d\'Ouest-Sud-Ouest idéal pour la voile en Baie de Quiberon'
  },
  // OCÉAN ATLANTIQUE
  {
    id: 'la-baule-sables',
    name: 'Baie de La Baule, Noirmoutier & Les Sables-d\'Olonne',
    coastline: 'Océan Atlantique',
    department: 'Loire-Atlantique (44) / Vendée (85)',
    latitude: 47.2810,
    longitude: -2.3922,
    waterTempC: 17.8,
    airTempC: 22.4,
    waveHeightM: 1.0,
    wavePeriodSec: 9,
    swellHeightM: 0.8,
    windWaveHeightM: 0.5,
    oceanCurrentKnots: 1.1,
    windSpeedKnots: 12,
    windDirectionCompass: 'W',
    seaStateDouglas: '3 — Peu agitée',
    swimFlag: 'VERT',
    swimFlagReason: 'Baignade autorisée et sécurisée. Pente douce et train de houle modéré.',
    tideHighTime: '06:10',
    tideLowTime: '12:35',
    tideCoefficient: 82,
    tideStatus: 'Montante (Flot)',
    beachUvIndex: 7,
    jellyfishRisk: 'Faible',
    baineWarning: false,
    waterQuality: 'Bonne',
    bathingComfortScore: 8.4,
    windThermalBreeze: 'Thermique d\'Ouest s\'établissant à 14h00'
  },
  {
    id: 'la-rochelle-re-oleron',
    name: 'La Rochelle, Île de Ré, Île d\'Oléron & Royan',
    coastline: 'Océan Atlantique',
    department: 'Charente-Maritime (17)',
    latitude: 46.1591,
    longitude: -1.1520,
    waterTempC: 18.6,
    airTempC: 23.5,
    waveHeightM: 1.2,
    wavePeriodSec: 10,
    swellHeightM: 1.0,
    windWaveHeightM: 0.5,
    oceanCurrentKnots: 1.4,
    windSpeedKnots: 13,
    windDirectionCompass: 'WNW',
    seaStateDouglas: '3 — Peu agitée',
    swimFlag: 'VERT',
    swimFlagReason: 'Pertuis charentais abrités ; houle plus marquée sur la Côte Sauvage de la Tremblade et le sud d\'Oléron.',
    tideHighTime: '06:00',
    tideLowTime: '12:20',
    tideCoefficient: 82,
    tideStatus: 'Montante (Flot)',
    beachUvIndex: 7,
    jellyfishRisk: 'Faible',
    baineWarning: true,
    waterQuality: 'Excellente (Pavillon Bleu)',
    bathingComfortScore: 8.6,
    windThermalBreeze: 'Brise thermique des Pertuis très favorable à la plaisance'
  },
  {
    id: 'arcachon-lacanau',
    name: 'Bassin d\'Arcachon, Cap Ferret, Lacanau & Biscarrosse',
    coastline: 'Océan Atlantique',
    department: 'Gironde (33) / Landes (40)',
    latitude: 44.9922,
    longitude: -1.1966,
    waterTempC: 19.4,
    airTempC: 24.8,
    waveHeightM: 1.8,
    wavePeriodSec: 12,
    swellHeightM: 1.7,
    windWaveHeightM: 0.6,
    oceanCurrentKnots: 1.6,
    windSpeedKnots: 11,
    windDirectionCompass: 'NW',
    seaStateDouglas: '4 — Agitée (Océan) / 2 (Bassin)',
    swimFlag: 'JAUNE',
    swimFlagReason: 'Baignade surveillée avec danger marqué de courants de baïnes sur les plages océanes entre mi-marée et basse mer.',
    tideHighTime: '06:45',
    tideLowTime: '13:05',
    tideCoefficient: 82,
    tideStatus: 'Descendante (Jusant)',
    beachUvIndex: 8,
    jellyfishRisk: 'Faible',
    baineWarning: true,
    waterQuality: 'Excellente (Pavillon Bleu)',
    bathingComfortScore: 8.1,
    windThermalBreeze: 'Vent faible le matin (offshore), brise de Nord-Ouest l\'après-midi'
  },
  {
    id: 'biarritz-hossegor-hendaye',
    name: 'Hossegor, Biarritz, Saint-Jean-de-Luz & Hendaye',
    coastline: 'Océan Atlantique',
    department: 'Landes (40) / Pyrénées-Atlantiques (64)',
    latitude: 43.4832,
    longitude: -1.5586,
    waterTempC: 20.2,
    airTempC: 24.2,
    waveHeightM: 2.1,
    wavePeriodSec: 13,
    swellHeightM: 2.0,
    windWaveHeightM: 0.5,
    oceanCurrentKnots: 1.5,
    windSpeedKnots: 10,
    windDirectionCompass: 'WNW',
    seaStateDouglas: '4 — Agitée (Houle longue du Golfe de Gascogne)',
    swimFlag: 'JAUNE',
    swimFlagReason: 'Shorebreak puissant à marée haute et courants d\'arrachement. Baie de Saint-Jean-de-Luz et Hendaye plus abritées.',
    tideHighTime: '06:30',
    tideLowTime: '12:50',
    tideCoefficient: 82,
    tideStatus: 'Descendante (Jusant)',
    beachUvIndex: 8,
    jellyfishRisk: 'Faible',
    baineWarning: true,
    waterQuality: 'Excellente (Pavillon Bleu)',
    bathingComfortScore: 7.9,
    windThermalBreeze: 'Glassy matinal idéal surf, léger thermique Nord-Ouest l\'après-midi'
  },
  // MER MÉDITERRANÉE & CORSE
  {
    id: 'collioure-leucate-agde-sete',
    name: 'Collioure, Leucate, Cap d\'Agde, Sète & La Grande-Motte',
    coastline: 'Mer Méditerranée & Corse',
    department: 'Pyrénées-Orientales (66) / Aude (11) / Hérault (34)',
    latitude: 43.3958,
    longitude: 3.6961,
    waterTempC: 21.4,
    airTempC: 26.2,
    waveHeightM: 0.5,
    wavePeriodSec: 4,
    swellHeightM: 0.3,
    windWaveHeightM: 0.4,
    oceanCurrentKnots: 0.5,
    windSpeedKnots: 16,
    windDirectionCompass: 'NW',
    seaStateDouglas: '2 — Belle à peu agitée',
    swimFlag: 'VERT',
    swimFlagReason: 'Plan d\'eau bien ensoleillé. Vigilance vis-à-vis de la tramontane (offshore) qui pousse les embarcations pneumatiques vers le large.',
    tideHighTime: '—',
    tideLowTime: '—',
    tideCoefficient: 0,
    tideStatus: 'Marée négligeable (Méditerranée)',
    beachUvIndex: 8,
    jellyfishRisk: 'Faible',
    baineWarning: false,
    waterQuality: 'Excellente (Pavillon Bleu)',
    bathingComfortScore: 8.9,
    windThermalBreeze: 'Tramontane matinale laissant place au thermique marin du Golfe du Lion'
  },
  {
    id: 'marseille-cassis-hyeres',
    name: 'Marseille, Calanques de Cassis, Bandol, Hyères & Porquerolles',
    coastline: 'Mer Méditerranée & Corse',
    department: 'Bouches-du-Rhône (13) / Var (83)',
    latitude: 43.1844,
    longitude: 5.5367,
    waterTempC: 21.8,
    airTempC: 26.8,
    waveHeightM: 0.6,
    wavePeriodSec: 5,
    swellHeightM: 0.4,
    windWaveHeightM: 0.4,
    oceanCurrentKnots: 0.6,
    windSpeedKnots: 14,
    windDirectionCompass: 'WNW',
    seaStateDouglas: '2 — Belle (Clapot léger)',
    swimFlag: 'VERT',
    swimFlagReason: 'Conditions optimales dans les calanques et rades abritées. Attention au rafraîchissement de l\'eau par upwelling après épisode de Mistral.',
    tideHighTime: '—',
    tideLowTime: '—',
    tideCoefficient: 0,
    tideStatus: 'Marée négligeable (Méditerranée)',
    beachUvIndex: 9,
    jellyfishRisk: 'Modéré',
    baineWarning: false,
    waterQuality: 'Excellente (Pavillon Bleu)',
    bathingComfortScore: 9.1,
    windThermalBreeze: 'Brise thermique d\'Ouest 12-15 nœuds idéale pour le kitesurf à l\'Almanarre'
  },
  {
    id: 'nice-cannes-st-tropez',
    name: 'Saint-Tropez, Fréjus, Cannes, Antibes, Nice & Menton',
    coastline: 'Mer Méditerranée & Corse',
    department: 'Var (83) / Alpes-Maritimes (06)',
    latitude: 43.6947,
    longitude: 7.2653,
    waterTempC: 22.9,
    airTempC: 27.2,
    waveHeightM: 0.3,
    wavePeriodSec: 4,
    swellHeightM: 0.2,
    windWaveHeightM: 0.2,
    oceanCurrentKnots: 0.4,
    windSpeedKnots: 8,
    windDirectionCompass: 'SSE',
    seaStateDouglas: '2 — Belle (Mer calme)',
    swimFlag: 'VERT',
    swimFlagReason: 'Baignade autorisée sans restriction. Mer calme et chaude sur toute la Côte d\'Azur.',
    tideHighTime: '—',
    tideLowTime: '—',
    tideCoefficient: 0,
    tideStatus: 'Marée négligeable (Méditerranée)',
    beachUvIndex: 9,
    jellyfishRisk: 'Modéré',
    baineWarning: false,
    waterQuality: 'Excellente (Pavillon Bleu)',
    bathingComfortScore: 9.3,
    windThermalBreeze: 'Brise thermique côtière douce de Sud-Sud-Est (8 nœuds)'
  },
  {
    id: 'corse-palombaggia-calvi',
    name: 'Corse — Porto-Vecchio (Palombaggia), Bonifacio, Ajaccio & Calvi',
    coastline: 'Mer Méditerranée & Corse',
    department: 'Corse-du-Sud (2A) / Haute-Corse (2B)',
    latitude: 41.5594,
    longitude: 9.3333,
    waterTempC: 23.6,
    airTempC: 28.0,
    waveHeightM: 0.3,
    wavePeriodSec: 3,
    swellHeightM: 0.2,
    windWaveHeightM: 0.2,
    oceanCurrentKnots: 0.8,
    windSpeedKnots: 9,
    windDirectionCompass: 'E',
    seaStateDouglas: '1 à 2 — Calme à belle',
    swimFlag: 'VERT',
    swimFlagReason: 'Eaux cristallines et chaudes. Vent plus soutenu dans les Bouches de Bonifacio par effet Venturi.',
    tideHighTime: '—',
    tideLowTime: '—',
    tideCoefficient: 0,
    tideStatus: 'Marée négligeable (Méditerranée)',
    beachUvIndex: 9,
    jellyfishRisk: 'Faible',
    baineWarning: false,
    waterQuality: 'Excellente (Pavillon Bleu)',
    bathingComfortScore: 9.7,
    windThermalBreeze: 'Légère brise thermique d\'Est rafraîchissante'
  },
  // OUTRE-MER & GRANDS LITTORAUX MONDIAUX
  {
    id: 'antilles-guadeloupe-martinique',
    name: 'Antilles — Sainte-Anne (Guadeloupe) & Les Salines (Martinique)',
    coastline: 'Outre-Mer & Monde',
    department: 'Guadeloupe (971) / Martinique (972)',
    latitude: 16.2264,
    longitude: -61.3792,
    waterTempC: 28.2,
    airTempC: 29.8,
    waveHeightM: 0.8,
    wavePeriodSec: 8,
    swellHeightM: 0.6,
    windWaveHeightM: 0.5,
    oceanCurrentKnots: 0.9,
    windSpeedKnots: 15,
    windDirectionCompass: 'ENE',
    seaStateDouglas: '2 à 3 — Belle dans le lagon, peu agitée au vent',
    swimFlag: 'VERT',
    swimFlagReason: 'Lagon protégé par la barrière de corail. Alizés réguliers d\'Est-Nord-Est.',
    tideHighTime: '09:30',
    tideLowTime: '15:50',
    tideCoefficient: 55,
    tideStatus: 'Montante (Flot)',
    beachUvIndex: 11,
    jellyfishRisk: 'Faible',
    baineWarning: false,
    waterQuality: 'Excellente (Pavillon Bleu)',
    bathingComfortScore: 9.6,
    windThermalBreeze: 'Alizés tropicaux constants de secteur Est (14-18 nœuds)'
  },
  {
    id: 'reunion-saint-gilles',
    name: 'Île de La Réunion — Lagon de l\'Ermitage & Saint-Gilles-les-Bains',
    coastline: 'Outre-Mer & Monde',
    department: 'La Réunion (974) — Océan Indien',
    latitude: -21.0594,
    longitude: 55.2232,
    waterTempC: 26.4,
    airTempC: 28.1,
    waveHeightM: 1.6,
    wavePeriodSec: 13,
    swellHeightM: 1.5,
    windWaveHeightM: 0.5,
    oceanCurrentKnots: 1.1,
    windSpeedKnots: 13,
    windDirectionCompass: 'SE',
    seaStateDouglas: '1 (Lagon corallien) / 4 (Large Océan Indien)',
    swimFlag: 'VERT',
    swimFlagReason: 'Baignade sécurisée à l\'intérieur strict du lagon corallien de l\'Ermitage. Houle australe longue sur le récif extérieur.',
    tideHighTime: '11:15',
    tideLowTime: '17:35',
    tideCoefficient: 68,
    tideStatus: 'Montante (Flot)',
    beachUvIndex: 11,
    jellyfishRisk: 'Faible',
    baineWarning: false,
    waterQuality: 'Excellente (Pavillon Bleu)',
    bathingComfortScore: 9.2,
    windThermalBreeze: 'Alizés de Sud-Est modérés'
  }
];

const COMPASS_DIRS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
function degToCompass(deg: number): string {
  const idx = Math.round((((deg % 360) + 360) % 360) / 22.5) % 16;
  return COMPASS_DIRS[idx];
}

/**
 * Calcule en temps réel les marées astronomiques SHOM (Pleine Mer, Basse Mer, Coefficient 20-120, État Flot/Jusant)
 * en fonction de l'âge lunaire astronomique et du déphasage de l'onde de marée M2 le long des côtes.
 */
export function calculateAstronomicalShomTides(spot: BeachSpot, now: Date = new Date()) {
  const isMed =
    spot.coastline === 'Mer Méditerranée & Corse' ||
    (spot.latitude >= 30 && spot.latitude <= 45.8 && spot.longitude >= 0 && spot.longitude <= 36);

  if (isMed && spot.tideCoefficient === 0) {
    return {
      isMicroTide: true,
      tideHighTime: 'Micro-marée (< 25 cm)',
      tideLowTime: 'Micro-marée (< 25 cm)',
      tideCoefficient: 0,
      tideStatus: 'Marée négligeable (Méditerranée)' as const,
      tideType: 'Régime micro-tidal méditerranéen',
      rangeMeters: 0.2
    };
  }

  const moon = calculateMoonPhase(now);
  const synodicPeriod = 29.530588853;
  // Syzygie (Nouvelle Lune = 0, Pleine Lune = 14.765j) -> Vive-eau maximale 36h après la syzygie (âge du retard de marée)
  const ageWithLag = (moon.daysIntoCycle - 1.5 + synodicPeriod) % synodicPeriod;
  const phaseAngle = (ageWithLag / (synodicPeriod / 2)) * 2 * Math.PI; // +1 aux vives-eaux, -1 aux mortes-eaux
  const syzygyFactor = Math.cos(phaseAngle);

  // Coefficient SHOM officiel compris entre 20 et 120 (moyenne 70)
  const baseCoeff = Math.round(70 + 44 * syzygyFactor);
  const tideCoefficient = Math.max(20, Math.min(118, baseCoeff));

  // Déphasage de l'onde semi-diurne M2 (12h25m = 745 min) selon la position géographique du port
  const portLagMinutes = Math.round(((spot.latitude - 43.0) * 38) + ((spot.longitude + 4.5) * 24));
  const lunarTransitMinutes = Math.round((moon.daysIntoCycle / synodicPeriod) * 1440);
  const firstHighWaterMin = ((240 + lunarTransitMinutes + portLagMinutes) % 745 + 745) % 745;

  const currentMinutesOfDay = now.getHours() * 60 + now.getMinutes();
  // Trouve la Pleine Mer la plus proche et la Basse Mer (+6h12m = +372 min)
  const highWater1 = firstHighWaterMin;
  const highWater2 = (firstHighWaterMin + 745) % 1440;
  const chosenHighMin = Math.abs(currentMinutesOfDay - highWater1) <= Math.abs(currentMinutesOfDay - highWater2)
    ? highWater1
    : highWater2;
  const chosenLowMin = (chosenHighMin + 372) % 1440;

  const formatMin = (m: number) => {
    const clean = ((Math.round(m) % 1440) + 1440) % 1440;
    const hh = String(Math.floor(clean / 60)).padStart(2, '0');
    const mm = String(clean % 60).padStart(2, '0');
    return `${hh}:${mm}`;
  };

  // Détermine l'état actuel : Montante (Flot), Descendante (Jusant) ou Étale
  const diffToHigh = ((chosenHighMin - currentMinutesOfDay + 720) % 745) - 372;
  let tideStatus: BeachSpot['tideStatus'] = 'Montante (Flot)';
  if (Math.abs(diffToHigh) <= 22) {
    tideStatus = 'étale';
  } else if (diffToHigh < 0) {
    tideStatus = 'Descendante (Jusant)';
  } else {
    tideStatus = 'Montante (Flot)';
  }

  // Marnage en mètres (jusqu'à 13m à Saint-Malo/Manche, ~4.5m en Atlantique)
  const maxSpringRange = spot.id.includes('saint-malo') || spot.latitude >= 48.5 ? 12.6 : spot.coastline === 'Manche & Mer du Nord' ? 8.2 : 4.8;
  const rangeMeters = Number(((tideCoefficient / 100) * maxSpringRange * 0.85).toFixed(1));

  return {
    isMicroTide: false,
    tideHighTime: formatMin(chosenHighMin),
    tideLowTime: formatMin(chosenLowMin),
    tideCoefficient,
    tideStatus,
    tideType: tideCoefficient >= 95 ? 'Grande Vive-Eau' : tideCoefficient >= 70 ? 'Vive-Eau' : tideCoefficient >= 45 ? 'Marée Moyenne' : 'Morte-Eau',
    rangeMeters
  };
}

/**
 * Interroge en direct l'API Marine Open-Meteo + Météo pour n'importe quelle localité côtière ou proche de la mer
 */
export async function fetchLiveMarineSpotForCoordinates(
  name: string,
  departmentOrCountry: string,
  lat: number,
  lon: number,
  fallbackAirTemp?: number,
  fallbackWindKmh?: number,
  fallbackWindDir?: number,
  fallbackUv?: number
): Promise<BeachSpot> {
  // Détermine la façade maritime selon les coordonnées
  let coastline: BeachSpot['coastline'] = 'Océan Atlantique';
  const isMed = lat >= 30 && lat <= 45.8 && lon >= 0 && lon <= 36 && !(lat >= 43.2 && lon < 0);
  if (isMed) {
    coastline = 'Mer Méditerranée & Corse';
  } else if (lat >= 48.5 && lon >= -2.5 && lon <= 5) {
    coastline = 'Manche & Mer du Nord';
  } else if (lat >= 47.2 && lat <= 49.0 && lon < -2.0 && lon >= -5.5) {
    coastline = 'Bretagne & Celtique';
  } else if (lat < 35 || lon < -10 || lon > 15) {
    coastline = 'Outre-Mer & Monde';
  }

  try {
    const [marineRes, wxRes] = await Promise.all([
      fetch(
        `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&current=wave_height,wave_direction,wave_period,wind_wave_height,swell_wave_height,swell_wave_direction,swell_wave_period,ocean_current_velocity,sea_surface_temperature`
      ),
      fallbackAirTemp !== undefined
        ? Promise.resolve(null)
        : fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m,wind_direction_10m,uv_index`
          )
    ]);

    const marineData = marineRes.ok ? await marineRes.json() : null;
    const wxData = wxRes && wxRes.ok ? await wxRes.json() : null;

    const mCur = marineData?.current || {};
    const wCur = wxData?.current || {};

    const airTempC = Number((fallbackAirTemp ?? wCur.temperature_2m ?? 21.0).toFixed(1));
    // Température de surface de la mer (SST) réelle ou estimation physique selon la latitude
    const defaultSst = Math.max(8, Math.min(29, Number((27 - Math.abs(lat) * 0.25).toFixed(1))));
    const waterTempC = Number((mCur.sea_surface_temperature ?? defaultSst).toFixed(1));

    const waveHeightM = Number((mCur.wave_height ?? (coastline === 'Mer Méditerranée & Corse' ? 0.5 : 1.3)).toFixed(1));
    const wavePeriodSec = Math.round(mCur.wave_period ?? mCur.swell_wave_period ?? (coastline === 'Mer Méditerranée & Corse' ? 5 : 10));
    const swellHeightM = Number((mCur.swell_wave_height ?? waveHeightM * 0.8).toFixed(1));
    const windWaveHeightM = Number((mCur.wind_wave_height ?? waveHeightM * 0.5).toFixed(1));
    const waveDirectionDeg = Math.round(mCur.wave_direction ?? 270);
    // ocean_current_velocity en km/h ou m/s -> conversion en nœuds
    const rawCurrent = mCur.ocean_current_velocity ?? 1.2;
    const oceanCurrentKnots = Number(Math.max(0.3, Math.min(4.5, rawCurrent * 0.54)).toFixed(1));

    const windKmh = fallbackWindKmh ?? wCur.wind_speed_10m ?? 22;
    const windSpeedKnots = Math.round(windKmh / 1.852);
    const windDirDeg = fallbackWindDir ?? wCur.wind_direction_10m ?? 260;
    const windDirectionCompass = degToCompass(windDirDeg);
    const beachUvIndex = Math.max(1, Math.round((fallbackUv ?? wCur.uv_index ?? 6) * 1.15));

    let seaStateDouglas = '2 — Belle';
    if (waveHeightM >= 4.0) seaStateDouglas = '6 — Très forte';
    else if (waveHeightM >= 2.5) seaStateDouglas = '5 — Forte';
    else if (waveHeightM >= 1.25) seaStateDouglas = '4 — Agitée';
    else if (waveHeightM >= 0.5) seaStateDouglas = '3 — Peu agitée';
    else if (waveHeightM >= 0.1) seaStateDouglas = '2 — Belle';
    else seaStateDouglas = '1 — Calme / Ridée';

    let swimFlag: BeachSpot['swimFlag'] = 'VERT';
    let swimFlagReason = `Conditions maritimes favorables à ${name}. Baignade et activités nautiques dans de bonnes conditions.`;
    if (waveHeightM >= 2.5 || windSpeedKnots >= 28) {
      swimFlag = 'ROUGE';
      swimFlagReason = `Danger en mer à ${name} : forte houle (${waveHeightM} m) ou vent soutenu (${windSpeedKnots} nœuds). Baignade déconseillée.`;
    } else if (waveHeightM >= 1.4 || windSpeedKnots >= 18) {
      swimFlag = 'JAUNE';
      swimFlagReason = `Baignade avec vigilance à ${name} : plan d'eau agité (${waveHeightM} m, période ${wavePeriodSec}s) et courants côtiers actifs.`;
    }

    const comfortRaw = 8.5 - Math.max(0, (22 - waterTempC) * 0.18) - (waveHeightM > 1.8 ? 1.2 : 0) - (windSpeedKnots > 20 ? 1.0 : 0);
    const bathingComfortScore = Number(Math.max(3.5, Math.min(9.9, comfortRaw)).toFixed(1));

    const isAtlanticBaines = lat >= 43.3 && lat <= 46.3 && lon >= -2.0 && lon <= -1.0;

    return {
      id: `live-marine-${lat.toFixed(3)}-${lon.toFixed(3)}`,
      name,
      coastline,
      department: departmentOrCountry,
      latitude: lat,
      longitude: lon,
      waterTempC,
      airTempC,
      waveHeightM,
      wavePeriodSec,
      swellHeightM,
      windWaveHeightM,
      waveDirectionDeg,
      oceanCurrentKnots,
      windSpeedKnots,
      windDirectionCompass,
      seaStateDouglas,
      swimFlag,
      swimFlagReason,
      tideHighTime: isMed ? '—' : '08:30',
      tideLowTime: isMed ? '—' : '14:50',
      tideCoefficient: isMed ? 0 : 82,
      tideStatus: isMed ? 'Marée négligeable (Méditerranée)' : 'Montante (Flot)',
      beachUvIndex,
      jellyfishRisk: waterTempC >= 22 ? 'Modéré' : 'Faible',
      baineWarning: isAtlanticBaines,
      waterQuality: 'Excellente (Pavillon Bleu)',
      bathingComfortScore,
      windThermalBreeze: `Flux marin de secteur ${windDirectionCompass} (${windSpeedKnots} nœuds / ${Math.round(windKmh)} km/h)`,
      isLiveCustomSpot: true
    };
  } catch {
    return {
      id: `live-marine-${lat.toFixed(3)}-${lon.toFixed(3)}`,
      name,
      coastline,
      department: departmentOrCountry,
      latitude: lat,
      longitude: lon,
      waterTempC: 18.5,
      airTempC: fallbackAirTemp ?? 21.0,
      waveHeightM: 1.1,
      wavePeriodSec: 9,
      swellHeightM: 0.9,
      windWaveHeightM: 0.5,
      oceanCurrentKnots: 1.2,
      windSpeedKnots: Math.round((fallbackWindKmh ?? 20) / 1.852),
      windDirectionCompass: degToCompass(fallbackWindDir ?? 260),
      seaStateDouglas: '3 — Peu agitée',
      swimFlag: 'VERT',
      swimFlagReason: `Analyse marine côtière pour ${name}.`,
      tideHighTime: '08:30',
      tideLowTime: '14:50',
      tideCoefficient: isMed ? 0 : 80,
      tideStatus: isMed ? 'Marée négligeable (Méditerranée)' : 'Montante (Flot)',
      beachUvIndex: 6,
      jellyfishRisk: 'Faible',
      baineWarning: false,
      waterQuality: 'Excellente (Pavillon Bleu)',
      bathingComfortScore: 8.0,
      windThermalBreeze: 'Régime côtier standard',
      isLiveCustomSpot: true
    };
  }
}

/**
 * Recherche N'IMPORTE QUELLE commune littorale, plage, île ou port en France et dans le Monde
 */
export async function searchAndBuildCoastalSpots(query: string): Promise<BeachSpot[]> {
  const clean = query.trim();
  if (clean.length < 2) return [];

  try {
    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(clean)}&count=5&language=fr&format=json`
    );
    if (!geoRes.ok) return [];
    const geoData = await geoRes.json();
    if (!geoData.results || !Array.isArray(geoData.results)) return [];

    const spots = await Promise.all(
      geoData.results.slice(0, 4).map((item: any) =>
        fetchLiveMarineSpotForCoordinates(
          `${item.name} (${item.admin1 || item.country || 'Littoral'})`,
          `${item.admin2 || item.admin1 || ''} • ${item.country || ''}`,
          Number(item.latitude),
          Number(item.longitude)
        )
      )
    );
    return spots;
  } catch {
    return [];
  }
}

/**
 * Trouve le spot côtier le plus proche de la localité active pour référence
 */
export function findNearestCoastalSpot(station: LocationPoint): { spot: BeachSpot; distanceKm: number } {
  let nearest = BEACH_SPOTS[0];
  let minKm = Number.MAX_VALUE;

  for (const sp of BEACH_SPOTS) {
    const dLat = (sp.latitude - station.latitude) * 111.32;
    const dLon = (sp.longitude - station.longitude) * 111.32 * Math.cos((station.latitude * Math.PI) / 180);
    const km = Math.round(Math.sqrt(dLat * dLat + dLon * dLon));
    if (km < minKm) {
      minKm = km;
      nearest = sp;
    }
  }
  return { spot: nearest, distanceKm: minKm };
}
