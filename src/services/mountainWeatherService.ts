import { CurrentWeather, LocationPoint } from '../types/weather';

export type AspectDirection = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';

export type EuropeanMountainRegion =
  | 'FRANCE_ALPES_NORD'
  | 'FRANCE_ALPES_SUD'
  | 'FRANCE_PYRENEES'
  | 'FRANCE_AUTRES'
  | 'SUISSE'
  | 'AUTRICHE'
  | 'ITALIE'
  | 'ESPAGNE_ANDORRE'
  | 'EUROPE_NORD_EST'
  | 'MONDE';

export interface MountainMassif {
  id: string;
  name: string;
  range: string;
  euroRegion?: EuropeanMountainRegion;
  country: string;
  department: string;
  altitudeBase: number;
  altitudePeak: number;
  latitude: number;
  longitude: number;
  beraRiskLevel: 1 | 2 | 3 | 4 | 5;
  beraRiskLabel: string;
  criticalSlopes: AspectDirection[];
  criticalAltitudeThreshold: number;
  snowDepthBottomCm: number;
  snowDepthTopCm: number;
  freshSnow24hCm: number;
  isoZeroAltitudeM: number;
  rainSnowLimitM: number;
  ridgeWindSpeedKmh: number;
  ridgeWindGustKmh: number;
  ridgeWindDirectionDeg: number;
  snowQuality: 'Poudreuse froide' | 'Neige de printemps' | 'Croûte de regel' | 'Neige humide' | 'Plaques à vent' | 'Névés / Rocher sec';
  nivoseStationName: string;
  nivoseElevationM: number;
  beraSummary: string;
  isLiveCustomStation?: boolean;
  topographicRegime?: 'Massif Interne (Lac d\'air froid / Isothermie forte)' | 'Préalpes & Flux Océanique' | 'Climat Sud-Alpin / Méditerranéen Sec' | 'Chaîne Pyrénéenne' | 'Moyenne Montagne Exposée' | 'Domaine Nordique / Haute Latitude';
}

export interface VersantDetailedAnalysis {
  aspect: AspectDirection;
  aspectLabel: string;
  azimuthDeg: number;
  thermalRegime: 'Ubac (Ombre froide)' | 'Adret (Ensoleillé)' | 'Soleil matinal' | 'Soleil tardif';
  windExposure: 'Au vent (Érosion / Glace)' | 'Sous le vent (Plaques à vent)' | 'Travers au vent (Couloirs chargés)' | 'Abrité / Calme';
  solarIrradianceWm2: number;
  surfaceSnowTempC: number;
  estimatedSnowDepthCm: number;
  windSlabRiskPercent: number;
  wetSnowAvalancheRiskPercent: number;
  persistentWeakLayerRiskPercent: number;
  localBeraLevel: 1 | 2 | 3 | 4 | 5;
  snowpackStructure: string;
  criticalSlopeAngleDeg: number;
  optimalTimeWindow: string;
  tacticalAdvice: string;
  isCritical: boolean;
}

export interface ElevationStageProfile {
  stageName: string;
  altitudeM: number;
  tempC: number;
  windChillC: number;
  windSpeedKmh: number;
  windGustKmh: number;
  qfePressureHpa: number;
  oxygenPercentSeaLevel: number;
  snowDepthCm: number;
  precipPhase: 'Neige froide sèche' | 'Neige humide' | 'Pluie & Neige mêlées' | 'Pluie liquide';
}

export interface ContinuousAltitudeBand {
  altitudeM: number;
  label: string;
  airTempC: number;
  wetBulbTempC: number;
  windChillC: number;
  windSpeedKmh: number;
  snowDepthUbacCm: number;
  snowDepthAdretCm: number;
  snowDepthMeanCm: number;
  freshSnow24hCm: number;
  snowDensityKgM3: number;
  precipPhase: 'Neige froide poudreuse' | 'Neige humide collante' | 'Pluie & Neige mêlées (Transition LPN)' | 'Pluie liquide';
  isAboveLpn: boolean;
  isAboveIsoZero: boolean;
}

export interface RainSnowLimitAnalysis {
  isoZeroM: number;
  standardLpnM: number;
  isothermyLpnM: number;
  effectiveLpnM: number;
  isothermyDropM: number;
  wetBulbZeroM: number;
  lapseRateCPer100m: number;
  baseTempC: number;
  peakTempC: number;
  relativeHumidityPct: number;
  topographicRegime: string;
  physicalExplanation: string;
  timeline24h: {
    slotLabel: string;
    tempAtBaseC: number;
    tempAt2000mC: number;
    isoZeroM: number;
    lpnM: number;
    precipMm: number;
    snowLineStatus: string;
  }[];
}

export const MOUNTAIN_MASSIFS: MountainMassif[] = [
  // ============================================================================
  // 1. FRANCE — ALPES DU NORD
  // ============================================================================
  {
    id: 'mont-blanc-chamonix',
    name: 'Chamonix Mont-Blanc — Grands Montets & Brévent',
    range: 'Alpes du Nord (Mont-Blanc)',
    euroRegion: 'FRANCE_ALPES_NORD',
    country: 'France',
    department: 'Haute-Savoie (74)',
    altitudeBase: 1035,
    altitudePeak: 3842,
    latitude: 45.9237,
    longitude: 6.8694,
    beraRiskLevel: 3,
    beraRiskLabel: 'Risque Marqué (3/5)',
    criticalSlopes: ['N', 'NE', 'E', 'NW'],
    criticalAltitudeThreshold: 2200,
    snowDepthBottomCm: 35,
    snowDepthTopCm: 295,
    freshSnow24hCm: 18,
    isoZeroAltitudeM: 2150,
    rainSnowLimitM: 1800,
    ridgeWindSpeedKmh: 55,
    ridgeWindGustKmh: 85,
    ridgeWindDirectionDeg: 245,
    snowQuality: 'Plaques à vent',
    nivoseStationName: 'Aiguilles Rouges / Midi',
    nivoseElevationM: 2330,
    topographicRegime: 'Massif Interne (Lac d\'air froid / Isothermie forte)',
    beraSummary: 'Vallée de Chamonix : fort effet d\'isothermie en cas de précipitations abaissant la limite pluie-neige jusqu\'à 400m sous l\'isotherme 0°C. Plaques à vent formées en haute altitude au-dessus de 2200m.'
  },
  {
    id: 'val-thorens-3-vallees',
    name: 'Val Thorens / Les Menuires (Les 3 Vallées)',
    range: 'Alpes du Nord (Vanoise)',
    euroRegion: 'FRANCE_ALPES_NORD',
    country: 'France',
    department: 'Savoie (73)',
    altitudeBase: 1800,
    altitudePeak: 3230,
    latitude: 45.2979,
    longitude: 6.5800,
    beraRiskLevel: 3,
    beraRiskLabel: 'Risque Marqué (3/5)',
    criticalSlopes: ['N', 'NE', 'NW'],
    criticalAltitudeThreshold: 2300,
    snowDepthBottomCm: 85,
    snowDepthTopCm: 245,
    freshSnow24hCm: 15,
    isoZeroAltitudeM: 2180,
    rainSnowLimitM: 1850,
    ridgeWindSpeedKmh: 46,
    ridgeWindGustKmh: 74,
    ridgeWindDirectionDeg: 230,
    snowQuality: 'Poudreuse froide',
    nivoseStationName: 'Cime Caron / Bellecôte',
    nivoseElevationM: 3035,
    topographicRegime: 'Massif Interne (Lac d\'air froid / Isothermie forte)',
    beraSummary: 'Plus haute station d\'Europe (2300m village) : enneigement garanti sur l\'ensemble du domaine. Couches fragiles persistantes en versants Nord au-dessus de 2400m.'
  },
  {
    id: 'tignes-val-disere',
    name: 'Tignes & Val d\'Isère (Espace Killy)',
    range: 'Alpes du Nord (Haute-Tarentaise)',
    euroRegion: 'FRANCE_ALPES_NORD',
    country: 'France',
    department: 'Savoie (73)',
    altitudeBase: 1550,
    altitudePeak: 3456,
    latitude: 45.4683,
    longitude: 6.9056,
    beraRiskLevel: 3,
    beraRiskLabel: 'Risque Marqué (3/5)',
    criticalSlopes: ['N', 'NE', 'E', 'NW'],
    criticalAltitudeThreshold: 2300,
    snowDepthBottomCm: 70,
    snowDepthTopCm: 265,
    freshSnow24hCm: 16,
    isoZeroAltitudeM: 2150,
    rainSnowLimitM: 1820,
    ridgeWindSpeedKmh: 50,
    ridgeWindGustKmh: 78,
    ridgeWindDirectionDeg: 250,
    snowQuality: 'Poudreuse froide',
    nivoseStationName: 'Le Chevril / Grande Motte',
    nivoseElevationM: 2560,
    topographicRegime: 'Massif Interne (Lac d\'air froid / Isothermie forte)',
    beraSummary: 'Haute-Tarentaise : climat interne froid favorisant une limite pluie-neige basse et d\'épaisses hauteurs de neige sur le glacier de la Grande Motte et Pisaillas (retours d\'Est fréquents).'
  },
  {
    id: 'courchevel-meribel',
    name: 'Courchevel & Méribel (Les 3 Vallées)',
    range: 'Alpes du Nord (Vanoise)',
    euroRegion: 'FRANCE_ALPES_NORD',
    country: 'France',
    department: 'Savoie (73)',
    altitudeBase: 1300,
    altitudePeak: 3230,
    latitude: 45.4153,
    longitude: 6.6347,
    beraRiskLevel: 2,
    beraRiskLabel: 'Risque Limité (2/5)',
    criticalSlopes: ['N', 'NE', 'NW'],
    criticalAltitudeThreshold: 2250,
    snowDepthBottomCm: 45,
    snowDepthTopCm: 215,
    freshSnow24hCm: 12,
    isoZeroAltitudeM: 2200,
    rainSnowLimitM: 1900,
    ridgeWindSpeedKmh: 40,
    ridgeWindGustKmh: 64,
    ridgeWindDirectionDeg: 240,
    snowQuality: 'Poudreuse froide',
    nivoseStationName: 'La Saulire',
    nivoseElevationM: 2738,
    topographicRegime: 'Massif Interne (Lac d\'air froid / Isothermie forte)',
    beraSummary: 'Excellente conservation de la neige froide dans les combes Nord de la Saulire et du Mont Vallon.'
  },
  {
    id: 'la-plagne-les-arcs',
    name: 'La Plagne & Les Arcs (Paradiski)',
    range: 'Alpes du Nord (Tarentaise)',
    euroRegion: 'FRANCE_ALPES_NORD',
    country: 'France',
    department: 'Savoie (73)',
    altitudeBase: 1250,
    altitudePeak: 3250,
    latitude: 45.5064,
    longitude: 6.6772,
    beraRiskLevel: 3,
    beraRiskLabel: 'Risque Marqué (3/5)',
    criticalSlopes: ['N', 'NE', 'E'],
    criticalAltitudeThreshold: 2200,
    snowDepthBottomCm: 42,
    snowDepthTopCm: 235,
    freshSnow24hCm: 14,
    isoZeroAltitudeM: 2200,
    rainSnowLimitM: 1880,
    ridgeWindSpeedKmh: 45,
    ridgeWindGustKmh: 70,
    ridgeWindDirectionDeg: 245,
    snowQuality: 'Poudreuse froide',
    nivoseStationName: 'Bellecôte / Aiguille Rouge',
    nivoseElevationM: 3035,
    topographicRegime: 'Massif Interne (Lac d\'air froid / Isothermie forte)',
    beraSummary: 'Dénivelé majeur de 1250m à 3250m (Aiguille Rouge et Bellecôte). Fort gradient d\'enneigement entre les villages forestiers et les glaciers.'
  },
  {
    id: 'avoriaz-portes-du-soleil',
    name: 'Avoriaz, Morzine & Les Gets (Portes du Soleil)',
    range: 'Alpes du Nord (Chablais)',
    euroRegion: 'FRANCE_ALPES_NORD',
    country: 'France / Suisse',
    department: 'Haute-Savoie (74)',
    altitudeBase: 1000,
    altitudePeak: 2466,
    latitude: 46.1914,
    longitude: 6.7749,
    beraRiskLevel: 3,
    beraRiskLabel: 'Risque Marqué (3/5)',
    criticalSlopes: ['N', 'NE', 'E', 'SE'],
    criticalAltitudeThreshold: 1900,
    snowDepthBottomCm: 35,
    snowDepthTopCm: 230,
    freshSnow24hCm: 20,
    isoZeroAltitudeM: 1950,
    rainSnowLimitM: 1650,
    ridgeWindSpeedKmh: 48,
    ridgeWindGustKmh: 76,
    ridgeWindDirectionDeg: 280,
    snowQuality: 'Plaques à vent',
    nivoseStationName: 'Hauts-Forts / Avoriaz',
    nivoseElevationM: 2220,
    topographicRegime: 'Préalpes & Flux Océanique',
    beraSummary: 'Massif du Chablais en première ligne face aux perturbations de Nord-Ouest : cumuls neigeux très abondants dès 1700m sur le plateau d\'Avoriaz.'
  },
  {
    id: 'la-clusaz-grand-bornand',
    name: 'La Clusaz, Le Grand-Bornand & Flaine (Aravis / Grand Massif)',
    range: 'Alpes du Nord (Aravis / Giffre)',
    euroRegion: 'FRANCE_ALPES_NORD',
    country: 'France',
    department: 'Haute-Savoie (74)',
    altitudeBase: 1100,
    altitudePeak: 2500,
    latitude: 45.9042,
    longitude: 6.4239,
    beraRiskLevel: 2,
    beraRiskLabel: 'Risque Limité (2/5)',
    criticalSlopes: ['N', 'NE', 'E'],
    criticalAltitudeThreshold: 1950,
    snowDepthBottomCm: 30,
    snowDepthTopCm: 225,
    freshSnow24hCm: 16,
    isoZeroAltitudeM: 2000,
    rainSnowLimitM: 1700,
    ridgeWindSpeedKmh: 42,
    ridgeWindGustKmh: 68,
    ridgeWindDirectionDeg: 270,
    snowQuality: 'Poudreuse froide',
    nivoseStationName: 'Col des Aravis / Flaine',
    nivoseElevationM: 2150,
    topographicRegime: 'Préalpes & Flux Océanique',
    beraSummary: 'Effet de barrage orographique marqué sur la chaîne des Aravis et le désert de Platé (Flaine), produisant un enneigement remarquable dès 1600m.'
  },
  {
    id: 'alpe-dhuez-2-alpes',
    name: 'Alpe d\'Huez, Les 2 Alpes & La Grave (Oisans / Grandes Rousses)',
    range: 'Alpes du Nord (Isère)',
    euroRegion: 'FRANCE_ALPES_NORD',
    country: 'France',
    department: 'Isère (38)',
    altitudeBase: 1250,
    altitudePeak: 3568,
    latitude: 45.0924,
    longitude: 6.0699,
    beraRiskLevel: 2,
    beraRiskLabel: 'Risque Limité (2/5)',
    criticalSlopes: ['N', 'NE', 'NW'],
    criticalAltitudeThreshold: 2400,
    snowDepthBottomCm: 35,
    snowDepthTopCm: 240,
    freshSnow24hCm: 10,
    isoZeroAltitudeM: 2300,
    rainSnowLimitM: 2000,
    ridgeWindSpeedKmh: 40,
    ridgeWindGustKmh: 65,
    ridgeWindDirectionDeg: 260,
    snowQuality: 'Neige de printemps',
    nivoseStationName: 'Pic Blanc / Les Écrins',
    nivoseElevationM: 2940,
    topographicRegime: 'Massif Interne (Lac d\'air froid / Isothermie forte)',
    beraSummary: 'Fort ensoleillement sur l\'Île au Soleil (Alpe d\'Huez) et haute altitude glaciaire aux 2 Alpes (3568m). Contraste marqué entre les pentes Sud transformées et les couloirs Nord de La Grave.'
  },

  // ============================================================================
  // 2. FRANCE — ALPES DU SUD
  // ============================================================================
  {
    id: 'serre-chevalier-montgenevre',
    name: 'Serre Chevalier, Briançon & Montgenèvre',
    range: 'Alpes du Sud (Briançonnais)',
    euroRegion: 'FRANCE_ALPES_SUD',
    country: 'France',
    department: 'Hautes-Alpes (05)',
    altitudeBase: 1200,
    altitudePeak: 2800,
    latitude: 44.9431,
    longitude: 6.5619,
    beraRiskLevel: 2,
    beraRiskLabel: 'Risque Limité (2/5)',
    criticalSlopes: ['N', 'NE', 'E'],
    criticalAltitudeThreshold: 2300,
    snowDepthBottomCm: 28,
    snowDepthTopCm: 185,
    freshSnow24hCm: 8,
    isoZeroAltitudeM: 2400,
    rainSnowLimitM: 2050,
    ridgeWindSpeedKmh: 36,
    ridgeWindGustKmh: 58,
    ridgeWindDirectionDeg: 290,
    snowQuality: 'Neige de printemps',
    nivoseStationName: 'Col du Lautaret / Chardonnet',
    nivoseElevationM: 2450,
    topographicRegime: 'Climat Sud-Alpin / Méditerranéen Sec',
    beraSummary: 'Air sec briançonnais favorisant une excellente conservation de la neige par sublimation réduite et une limite pluie-neige basse lors des retours d\'Est lombards.'
  },
  {
    id: 'vars-risoul-isola2000',
    name: 'Vars, Risoul (Forêt Blanche), Isola 2000 & Auron',
    range: 'Alpes du Sud (Queyras & Mercantour)',
    euroRegion: 'FRANCE_ALPES_SUD',
    country: 'France',
    department: 'Hautes-Alpes (05) / Alpes-Maritimes (06)',
    altitudeBase: 1600,
    altitudePeak: 2750,
    latitude: 44.1856,
    longitude: 7.1565,
    beraRiskLevel: 2,
    beraRiskLabel: 'Risque Limité (2/5)',
    criticalSlopes: ['N', 'NE', 'NW'],
    criticalAltitudeThreshold: 2350,
    snowDepthBottomCm: 40,
    snowDepthTopCm: 190,
    freshSnow24hCm: 9,
    isoZeroAltitudeM: 2450,
    rainSnowLimitM: 2100,
    ridgeWindSpeedKmh: 34,
    ridgeWindGustKmh: 54,
    ridgeWindDirectionDeg: 140,
    snowQuality: 'Neige de printemps',
    nivoseStationName: 'Millefonts / Parpaillon',
    nivoseElevationM: 2430,
    topographicRegime: 'Climat Sud-Alpin / Méditerranéen Sec',
    beraSummary: 'Enneigement abondant par flux de Sud méditerranéen sur Isola 2000 et le Mercantour, suivi d\'un grand soleil favorisant le cycle gel nocturne / décaillage printanier.'
  },

  // ============================================================================
  // 3. FRANCE — PYRÉNÉES, MASSIF CENTRAL, VOSGES, JURA, CORSE
  // ============================================================================
  {
    id: 'tourmalet-saint-lary-cauterets',
    name: 'Grand Tourmalet, Saint-Lary-Soulan, Peyragudes & Cauterets',
    range: 'Pyrénées Centrales & Occidentales',
    euroRegion: 'FRANCE_PYRENEES',
    country: 'France',
    department: 'Hautes-Pyrénées (65)',
    altitudeBase: 1400,
    altitudePeak: 2600,
    latitude: 42.9086,
    longitude: 0.1456,
    beraRiskLevel: 3,
    beraRiskLabel: 'Risque Marqué (3/5)',
    criticalSlopes: ['N', 'NE', 'E', 'SE'],
    criticalAltitudeThreshold: 2100,
    snowDepthBottomCm: 35,
    snowDepthTopCm: 195,
    freshSnow24hCm: 15,
    isoZeroAltitudeM: 2250,
    rainSnowLimitM: 1950,
    ridgeWindSpeedKmh: 58,
    ridgeWindGustKmh: 90,
    ridgeWindDirectionDeg: 280,
    snowQuality: 'Plaques à vent',
    nivoseStationName: 'Lac d\'Ardiden / Port d\'Aula',
    nivoseElevationM: 2445,
    topographicRegime: 'Chaîne Pyrénéenne',
    beraSummary: 'Flux de Nord-Ouest océanique bloqué sur la barrière pyrénéenne : fort cumul neigeux à Cauterets et au Pic du Midi avec transport éolien vers les pentes Est.'
  },
  {
    id: 'font-romeu-ax-les-angles',
    name: 'Font-Romeu Pyrénées 2000, Les Angles & Ax 3 Domaines',
    range: 'Pyrénées Orientales & Ariège',
    euroRegion: 'FRANCE_PYRENEES',
    country: 'France',
    department: 'Pyrénées-Orientales (66) / Ariège (09)',
    altitudeBase: 1500,
    altitudePeak: 2400,
    latitude: 42.5047,
    longitude: 2.0369,
    beraRiskLevel: 2,
    beraRiskLabel: 'Risque Limité (2/5)',
    criticalSlopes: ['N', 'NE', 'E'],
    criticalAltitudeThreshold: 2100,
    snowDepthBottomCm: 30,
    snowDepthTopCm: 145,
    freshSnow24hCm: 8,
    isoZeroAltitudeM: 2300,
    rainSnowLimitM: 2000,
    ridgeWindSpeedKmh: 45,
    ridgeWindGustKmh: 72,
    ridgeWindDirectionDeg: 315,
    snowQuality: 'Croûte de regel',
    nivoseStationName: 'Puigmal / Hospitalet',
    nivoseElevationM: 2470,
    topographicRegime: 'Chaîne Pyrénéenne',
    beraSummary: 'Plateau de Cerdagne et Capcir : air sec et ensoleillé avec regel nocturne puissant permettant le maintien du manteau neigeux.'
  },
  {
    id: 'sancy-cantal-lioran',
    name: 'Super-Besse, Le Mont-Dore & Le Lioran (Massif Central)',
    range: 'Massif Central (Auvergne)',
    euroRegion: 'FRANCE_AUTRES',
    country: 'France',
    department: 'Puy-de-Dôme (63) / Cantal (15)',
    altitudeBase: 1150,
    altitudePeak: 1885,
    latitude: 45.5122,
    longitude: 2.8528,
    beraRiskLevel: 2,
    beraRiskLabel: 'Risque Limité (2/5)',
    criticalSlopes: ['N', 'NE', 'E'],
    criticalAltitudeThreshold: 1500,
    snowDepthBottomCm: 18,
    snowDepthTopCm: 90,
    freshSnow24hCm: 6,
    isoZeroAltitudeM: 1750,
    rainSnowLimitM: 1480,
    ridgeWindSpeedKmh: 50,
    ridgeWindGustKmh: 78,
    ridgeWindDirectionDeg: 250,
    snowQuality: 'Croûte de regel',
    nivoseStationName: 'Chastreix-Sancy',
    nivoseElevationM: 1385,
    topographicRegime: 'Moyenne Montagne Exposée',
    beraSummary: 'Volcans d\'Auvergne directement exposés aux flux atlantiques : variations rapides de la limite pluie-neige et vent soutenu sur les crêtes du Sancy.'
  },
  {
    id: 'vosges-jura-rousses-bresse',
    name: 'La Bresse-Hohneck, Gérardmer (Vosges) & Les Rousses (Jura)',
    range: 'Massifs des Vosges & du Jura',
    euroRegion: 'FRANCE_AUTRES',
    country: 'France',
    department: 'Vosges (88) / Jura (39)',
    altitudeBase: 850,
    altitudePeak: 1680,
    latitude: 48.0106,
    longitude: 6.9744,
    beraRiskLevel: 1,
    beraRiskLabel: 'Risque Faible (1/5)',
    criticalSlopes: ['NE', 'E'],
    criticalAltitudeThreshold: 1250,
    snowDepthBottomCm: 12,
    snowDepthTopCm: 75,
    freshSnow24hCm: 4,
    isoZeroAltitudeM: 1600,
    rainSnowLimitM: 1320,
    ridgeWindSpeedKmh: 42,
    ridgeWindGustKmh: 66,
    ridgeWindDirectionDeg: 240,
    snowQuality: 'Neige humide',
    nivoseStationName: 'Markstein / La Pesse',
    nivoseElevationM: 1184,
    topographicRegime: 'Moyenne Montagne Exposée',
    beraSummary: 'Enneigement sensible aux fluctuations de l\'isotherme 0°C entre 900m et 1500m ; combes froides du Jura conservant l\'air polaire par inversion nocturne.'
  },

  // ============================================================================
  // 4. SUISSE — GRANDES STATIONS DE SKI HELVÉTIQUES
  // ============================================================================
  {
    id: 'zermatt-cervin',
    name: 'Zermatt — Matterhorn Glacier Paradise (Suisse)',
    range: 'Alpes Valaisannes (Suisse)',
    euroRegion: 'SUISSE',
    country: 'Suisse',
    department: 'Canton du Valais (VS)',
    altitudeBase: 1620,
    altitudePeak: 3883,
    latitude: 46.0207,
    longitude: 7.7491,
    beraRiskLevel: 3,
    beraRiskLabel: 'Risque Marqué (3/5 SLF)',
    criticalSlopes: ['N', 'NE', 'E', 'NW'],
    criticalAltitudeThreshold: 2400,
    snowDepthBottomCm: 55,
    snowDepthTopCm: 320,
    freshSnow24hCm: 20,
    isoZeroAltitudeM: 2200,
    rainSnowLimitM: 1850,
    ridgeWindSpeedKmh: 58,
    ridgeWindGustKmh: 90,
    ridgeWindDirectionDeg: 235,
    snowQuality: 'Poudreuse froide',
    nivoseStationName: 'Gornergrat SLF',
    nivoseElevationM: 3135,
    topographicRegime: 'Massif Interne (Lac d\'air froid / Isothermie forte)',
    beraSummary: 'Bulletin SLF Suisse : Plus haut domaine skiable des Alpes (3883m). Climat intra-alpin sec avec d\'importantes accumulations en altitude par flux de Sud (Lombarde).'
  },
  {
    id: 'verbier-4-vallees',
    name: 'Verbier, Nendaz & Veysonnaz (Les 4 Vallées — Suisse)',
    range: 'Alpes Valaisannes (Suisse)',
    euroRegion: 'SUISSE',
    country: 'Suisse',
    department: 'Canton du Valais (VS)',
    altitudeBase: 1500,
    altitudePeak: 3330,
    latitude: 46.0961,
    longitude: 7.2286,
    beraRiskLevel: 3,
    beraRiskLabel: 'Risque Marqué (3/5 SLF)',
    criticalSlopes: ['N', 'NE', 'NW', 'E'],
    criticalAltitudeThreshold: 2250,
    snowDepthBottomCm: 45,
    snowDepthTopCm: 260,
    freshSnow24hCm: 16,
    isoZeroAltitudeM: 2150,
    rainSnowLimitM: 1820,
    ridgeWindSpeedKmh: 48,
    ridgeWindGustKmh: 76,
    ridgeWindDirectionDeg: 250,
    snowQuality: 'Poudreuse froide',
    nivoseStationName: 'Mont Fort / Attelas SLF',
    nivoseElevationM: 2727,
    topographicRegime: 'Massif Interne (Lac d\'air froid / Isothermie forte)',
    beraSummary: 'Secteur Mont-Fort (3330m) et Mont-Gelé : itinéraires freeride de haute montagne exigeant une surveillance étroite des plaques à vent en faces Nord.'
  },
  {
    id: 'st-moritz-davos-laax',
    name: 'Saint-Moritz (Engadine), Davos Klosters & Laax (Grisons)',
    range: 'Alpes des Grisons (Suisse)',
    euroRegion: 'SUISSE',
    country: 'Suisse',
    department: 'Canton des Grisons (GR)',
    altitudeBase: 1560,
    altitudePeak: 3303,
    latitude: 46.4908,
    longitude: 9.8355,
    beraRiskLevel: 2,
    beraRiskLabel: 'Risque Limité (2/5 SLF)',
    criticalSlopes: ['N', 'NE', 'E'],
    criticalAltitudeThreshold: 2300,
    snowDepthBottomCm: 50,
    snowDepthTopCm: 220,
    freshSnow24hCm: 11,
    isoZeroAltitudeM: 2100,
    rainSnowLimitM: 1750,
    ridgeWindSpeedKmh: 40,
    ridgeWindGustKmh: 64,
    ridgeWindDirectionDeg: 270,
    snowQuality: 'Poudreuse froide',
    nivoseStationName: 'Corvatsch / Weissfluhjoch SLF',
    nivoseElevationM: 2540,
    topographicRegime: 'Massif Interne (Lac d\'air froid / Isothermie forte)',
    beraSummary: 'Haute-Engadine : lac d\'air glacial à 1800m et faible humidité relative garantissant une neige froide sèche et une limite pluie-neige structurellement basse.'
  },
  {
    id: 'grindelwald-wengen-crans',
    name: 'Grindelwald-Wengen (Jungfrau), Crans-Montana & Saas-Fee',
    range: 'Oberland Bernois & Haut-Valais (Suisse)',
    euroRegion: 'SUISSE',
    country: 'Suisse',
    department: 'Berne (BE) / Valais (VS)',
    altitudeBase: 1034,
    altitudePeak: 3571,
    latitude: 46.6242,
    longitude: 8.0414,
    beraRiskLevel: 3,
    beraRiskLabel: 'Risque Marqué (3/5 SLF)',
    criticalSlopes: ['N', 'NE', 'E'],
    criticalAltitudeThreshold: 2150,
    snowDepthBottomCm: 35,
    snowDepthTopCm: 280,
    freshSnow24hCm: 17,
    isoZeroAltitudeM: 2050,
    rainSnowLimitM: 1750,
    ridgeWindSpeedKmh: 52,
    ridgeWindGustKmh: 84,
    ridgeWindDirectionDeg: 285,
    snowQuality: 'Poudreuse froide',
    nivoseStationName: 'Jungfraujoch / Allalin SLF',
    nivoseElevationM: 3454,
    topographicRegime: 'Préalpes & Flux Océanique',
    beraSummary: 'Paroi Nord de l\'Eiger et glaciers de Saas-Fee (3600m) : fort blocage orographique par flux de Nord-Ouest.'
  },

  // ============================================================================
  // 5. AUTRICHE — GRANDES STATIONS DE SKI AUTRICHIENNES
  // ============================================================================
  {
    id: 'st-anton-lech-arlberg',
    name: 'St. Anton am Arlberg, Lech & Zürs (Ski Arlberg — Autriche)',
    range: 'Alpes du Tyrol & Vorarlberg (Autriche)',
    euroRegion: 'AUTRICHE',
    country: 'Autriche',
    department: 'Tyrol / Vorarlberg',
    altitudeBase: 1304,
    altitudePeak: 2811,
    latitude: 47.1296,
    longitude: 10.2682,
    beraRiskLevel: 3,
    beraRiskLabel: 'Risque Marqué (3/5 LWD Tirol)',
    criticalSlopes: ['N', 'NE', 'E', 'SE'],
    criticalAltitudeThreshold: 2100,
    snowDepthBottomCm: 65,
    snowDepthTopCm: 255,
    freshSnow24hCm: 22,
    isoZeroAltitudeM: 1950,
    rainSnowLimitM: 1620,
    ridgeWindSpeedKmh: 52,
    ridgeWindGustKmh: 80,
    ridgeWindDirectionDeg: 285,
    snowQuality: 'Poudreuse froide',
    nivoseStationName: 'Valluga LWD Tirol',
    nivoseElevationM: 2809,
    topographicRegime: 'Préalpes & Flux Océanique',
    beraSummary: 'Barrage nord-alpin de l\'Arlberg ("Schneeloch") : l\'un des secteurs les plus enneigés d\'Europe avec une limite pluie-neige abaissée par effet de blocage.'
  },
  {
    id: 'ischgl-solden-obergurgl',
    name: 'Ischgl (Silvretta), Sölden & Obergurgl (Tyrol — Autriche)',
    range: 'Alpes de l\'Ötztal & Paznaun (Autriche)',
    euroRegion: 'AUTRICHE',
    country: 'Autriche',
    department: 'Tyrol',
    altitudeBase: 1377,
    altitudePeak: 3340,
    latitude: 46.9692,
    longitude: 11.0076,
    beraRiskLevel: 3,
    beraRiskLabel: 'Risque Marqué (3/5 LWD Tirol)',
    criticalSlopes: ['N', 'NE', 'E'],
    criticalAltitudeThreshold: 2300,
    snowDepthBottomCm: 48,
    snowDepthTopCm: 270,
    freshSnow24hCm: 16,
    isoZeroAltitudeM: 2050,
    rainSnowLimitM: 1750,
    ridgeWindSpeedKmh: 46,
    ridgeWindGustKmh: 74,
    ridgeWindDirectionDeg: 270,
    snowQuality: 'Poudreuse froide',
    nivoseStationName: 'Rettenbachferner / Idalp',
    nivoseElevationM: 2995,
    topographicRegime: 'Massif Interne (Lac d\'air froid / Isothermie forte)',
    beraSummary: 'Deux glaciers skiables au-dessus de 3000m (Rettenbach & Tiefenbach à Sölden) et haute altitude sur l\'arène transfrontalière Ischgl-Samnaun.'
  },
  {
    id: 'kitzbuhel-mayrhofen-kaprun',
    name: 'Kitzbühel, Mayrhofen (Zillertal), Saalbach & Kaprun',
    range: 'Alpes de Kitzbühel & Hohe Tauern (Autriche)',
    euroRegion: 'AUTRICHE',
    country: 'Autriche',
    department: 'Tyrol / Salzbourg',
    altitudeBase: 800,
    altitudePeak: 3250,
    latitude: 47.4492,
    longitude: 12.3919,
    beraRiskLevel: 2,
    beraRiskLabel: 'Risque Limité (2/5 LWD)',
    criticalSlopes: ['N', 'NE', 'E'],
    criticalAltitudeThreshold: 2000,
    snowDepthBottomCm: 30,
    snowDepthTopCm: 240,
    freshSnow24hCm: 14,
    isoZeroAltitudeM: 1900,
    rainSnowLimitM: 1580,
    ridgeWindSpeedKmh: 42,
    ridgeWindGustKmh: 66,
    ridgeWindDirectionDeg: 290,
    snowQuality: 'Poudreuse froide',
    nivoseStationName: 'Hahnenkamm / Hintertuxer Gletscher',
    nivoseElevationM: 2660,
    topographicRegime: 'Préalpes & Flux Océanique',
    beraSummary: 'Contraste prononcé d\'altitude entre les vallées tyroliennes (800m) et les glaciers permanents d\'Hintertux et du Kitzsteinhorn (3250m).'
  },

  // ============================================================================
  // 6. ITALIE — DOLOMITES & ALPES ITALIENNES
  // ============================================================================
  {
    id: 'dolomites-cortina-gardena',
    name: 'Cortina d\'Ampezzo, Val Gardena, Sella Ronda & Marmolada',
    range: 'Dolomites (Italie)',
    euroRegion: 'ITALIE',
    country: 'Italie',
    department: 'Vénétie / Haut-Adige (Südtirol)',
    altitudeBase: 1224,
    altitudePeak: 3269,
    latitude: 46.5405,
    longitude: 12.1357,
    beraRiskLevel: 2,
    beraRiskLabel: 'Risque Limité (2/5 AINEVA)',
    criticalSlopes: ['N', 'NE', 'NW'],
    criticalAltitudeThreshold: 2300,
    snowDepthBottomCm: 40,
    snowDepthTopCm: 210,
    freshSnow24hCm: 12,
    isoZeroAltitudeM: 2250,
    rainSnowLimitM: 1920,
    ridgeWindSpeedKmh: 38,
    ridgeWindGustKmh: 62,
    ridgeWindDirectionDeg: 320,
    snowQuality: 'Neige de printemps',
    nivoseStationName: 'Marmolada / Faloria AINEVA',
    nivoseElevationM: 2615,
    topographicRegime: 'Climat Sud-Alpin / Méditerranéen Sec',
    beraSummary: 'Dolomiti Superski : air sec favorisant une excellente tenue du manteau neigeux et de grosses chutes par dépressions adriatiques/méditerranéennes.'
  },
  {
    id: 'cervinia-courmayeur-livigno',
    name: 'Breuil-Cervinia, Courmayeur, Livigno & Sestrière (Italie)',
    range: 'Val d\'Aoste, Lombardie & Piémont (Italie)',
    euroRegion: 'ITALIE',
    country: 'Italie',
    department: 'Val d\'Aoste / Sondrio / Turin',
    altitudeBase: 1816,
    altitudePeak: 3883,
    latitude: 45.9344,
    longitude: 7.6311,
    beraRiskLevel: 3,
    beraRiskLabel: 'Risque Marqué (3/5 AINEVA)',
    criticalSlopes: ['N', 'NE', 'E', 'NW'],
    criticalAltitudeThreshold: 2400,
    snowDepthBottomCm: 65,
    snowDepthTopCm: 290,
    freshSnow24hCm: 18,
    isoZeroAltitudeM: 2200,
    rainSnowLimitM: 1880,
    ridgeWindSpeedKmh: 50,
    ridgeWindGustKmh: 80,
    ridgeWindDirectionDeg: 220,
    snowQuality: 'Poudreuse froide',
    nivoseStationName: 'Plateau Rosa / Livigno Carosello',
    nivoseElevationM: 3480,
    topographicRegime: 'Massif Interne (Lac d\'air froid / Isothermie forte)',
    beraSummary: 'Livigno ("Petit Tibet" à 1816m) et Cervinia (2050m–3883m) figurent parmi les stations les plus froides et enneigées du versant sud des Alpes.'
  },

  // ============================================================================
  // 7. ESPAGNE & ANDORRE
  // ============================================================================
  {
    id: 'grandvalira-baqueira-sierra-nevada',
    name: 'Grandvalira (Andorre), Baqueira-Beret & Sierra Nevada (Espagne)',
    range: 'Pyrénées & Cordillère Bétique (Andorre / Espagne)',
    euroRegion: 'ESPAGNE_ANDORRE',
    country: 'Andorre / Espagne',
    department: 'Andorre / Catalogne / Andalousie',
    altitudeBase: 1500,
    altitudePeak: 3300,
    latitude: 42.5403,
    longitude: 1.7336,
    beraRiskLevel: 2,
    beraRiskLabel: 'Risque Limité (2/5 AEMET)',
    criticalSlopes: ['N', 'NE', 'NW'],
    criticalAltitudeThreshold: 2200,
    snowDepthBottomCm: 40,
    snowDepthTopCm: 195,
    freshSnow24hCm: 14,
    isoZeroAltitudeM: 2300,
    rainSnowLimitM: 1980,
    ridgeWindSpeedKmh: 45,
    ridgeWindGustKmh: 72,
    ridgeWindDirectionDeg: 310,
    snowQuality: 'Poudreuse froide',
    nivoseStationName: 'Port d\'Envalira / Bonaigua',
    nivoseElevationM: 2510,
    topographicRegime: 'Chaîne Pyrénéenne',
    beraSummary: 'Val d\'Aran (Baqueira) et Pas de la Case (Grandvalira) : exposition directe aux flux atlantiques de Nord-Ouest assurant un enneigement supérieur au reste de la péninsule.'
  },

  // ============================================================================
  // 8. ALLEMAGNE, SCANDINAVIE & EUROPE DE L'EST
  // ============================================================================
  {
    id: 'garmisch-zugspitze-are-trysil',
    name: 'Garmisch-Zugspitze (Allemagne), Åre (Suède), Trysil (Norvège) & Levi (Finlande)',
    range: 'Alpes Bavaroises & Alpes Scandinaves',
    euroRegion: 'EUROPE_NORD_EST',
    country: 'Allemagne / Norvège / Suède / Finlande',
    department: 'Bavière / Jämtland / Laponie',
    altitudeBase: 400,
    altitudePeak: 2962,
    latitude: 47.4210,
    longitude: 10.9853,
    beraRiskLevel: 2,
    beraRiskLabel: 'Risque Limité (2/5)',
    criticalSlopes: ['N', 'NE', 'E'],
    criticalAltitudeThreshold: 1400,
    snowDepthBottomCm: 45,
    snowDepthTopCm: 210,
    freshSnow24hCm: 12,
    isoZeroAltitudeM: 1450,
    rainSnowLimitM: 1150,
    ridgeWindSpeedKmh: 48,
    ridgeWindGustKmh: 75,
    ridgeWindDirectionDeg: 295,
    snowQuality: 'Poudreuse froide',
    nivoseStationName: 'Zugspitzplatt / Åreskutan',
    nivoseElevationM: 2600,
    topographicRegime: 'Domaine Nordique / Haute Latitude',
    beraSummary: 'En Scandinavie (Åre, Trysil, Levi), la haute latitude abaisse l\'isotherme 0°C dès 300–600m ; sur la Zugspitze (2962m), climat alpin nordique.'
  },
  {
    id: 'bansko-jasna-zakopane',
    name: 'Bansko (Bulgarie), Jasná (Slovaquie), Zakopane (Pologne) & Kranjska Gora',
    range: 'Carpates, Tatras, Pirin & Alpes Juliennes',
    euroRegion: 'EUROPE_NORD_EST',
    country: 'Bulgarie / Slovaquie / Pologne / Slovénie',
    department: 'Europe Centrale & Balkans',
    altitudeBase: 900,
    altitudePeak: 2600,
    latitude: 41.7686,
    longitude: 23.4439,
    beraRiskLevel: 2,
    beraRiskLabel: 'Risque Limité (2/5)',
    criticalSlopes: ['N', 'NE', 'E'],
    criticalAltitudeThreshold: 1850,
    snowDepthBottomCm: 30,
    snowDepthTopCm: 165,
    freshSnow24hCm: 10,
    isoZeroAltitudeM: 1850,
    rainSnowLimitM: 1550,
    ridgeWindSpeedKmh: 44,
    ridgeWindGustKmh: 70,
    ridgeWindDirectionDeg: 330,
    snowQuality: 'Poudreuse froide',
    nivoseStationName: 'Todorka / Chopok Tatras',
    nivoseElevationM: 2250,
    topographicRegime: 'Massif Interne (Lac d\'air froid / Isothermie forte)',
    beraSummary: 'Climat continental froid des Tatras (Jasná, Zakopane) et du massif du Pirin (Bansko) favorisant le maintien du manteau neigeux.'
  },

  // ============================================================================
  // 9. GRANDS MASSIFS MONDIAUX (AMÉRIQUES, ASIE, OCÉANIE)
  // ============================================================================
  {
    id: 'banff-whistler-aspen',
    name: 'Banff, Whistler (Canada), Aspen, Vail & Jackson Hole (USA)',
    range: 'Montagnes Rocheuses & Chaîne Côtière',
    euroRegion: 'MONDE',
    country: 'Canada / États-Unis',
    department: 'Alberta / Colombie-Britannique / Colorado',
    altitudeBase: 1400,
    altitudePeak: 3800,
    latitude: 51.4254,
    longitude: -116.1773,
    beraRiskLevel: 3,
    beraRiskLabel: 'Considerable (3/5 Avalanche Canada / CAIC)',
    criticalSlopes: ['N', 'NE', 'E'],
    criticalAltitudeThreshold: 2200,
    snowDepthBottomCm: 90,
    snowDepthTopCm: 280,
    freshSnow24hCm: 24,
    isoZeroAltitudeM: 1700,
    rainSnowLimitM: 1400,
    ridgeWindSpeedKmh: 50,
    ridgeWindGustKmh: 82,
    ridgeWindDirectionDeg: 245,
    snowQuality: 'Poudreuse froide',
    nivoseStationName: 'Bow Summit / Independence Pass',
    nivoseElevationM: 2680,
    topographicRegime: 'Massif Interne (Lac d\'air froid / Isothermie forte)',
    beraSummary: 'Neige sèche de très faible densité ("Champagne Powder") sur les Rocheuses nord-américaines.'
  },
  {
    id: 'niseko-hakuba-andes',
    name: 'Niseko, Hakuba (Japon), Bariloche (Andes) & Queenstown (NZ)',
    range: 'Alpes Japonaises, Cordillère des Andes & Alpes du Sud NZ',
    euroRegion: 'MONDE',
    country: 'Japon / Argentine / Nouvelle-Zélande',
    department: 'Hokkaido / Nagano / Patagonie',
    altitudeBase: 400,
    altitudePeak: 3200,
    latitude: 42.8631,
    longitude: 140.6975,
    beraRiskLevel: 3,
    beraRiskLabel: 'Risque Marqué (3/5 NAD Japon)',
    criticalSlopes: ['E', 'SE', 'S'],
    criticalAltitudeThreshold: 1100,
    snowDepthBottomCm: 130,
    snowDepthTopCm: 370,
    freshSnow24hCm: 30,
    isoZeroAltitudeM: 950,
    rainSnowLimitM: 650,
    ridgeWindSpeedKmh: 60,
    ridgeWindGustKmh: 94,
    ridgeWindDirectionDeg: 315,
    snowQuality: 'Poudreuse froide',
    nivoseStationName: 'Mt. Annupuri Telemetry',
    nivoseElevationM: 1308,
    topographicRegime: 'Domaine Nordique / Haute Latitude',
    beraSummary: 'Flux de mousson hivernale sibérienne sur le Japon déposant une poudreuse abondante dès les basses altitudes.'
  }
];

const ASPECT_AZIMUTH: Record<AspectDirection, { deg: number; label: string }> = {
  N: { deg: 0, label: 'Nord (0°)' },
  NE: { deg: 45, label: 'Nord-Est (45°)' },
  E: { deg: 90, label: 'Est (90°)' },
  SE: { deg: 135, label: 'Sud-Est (135°)' },
  S: { deg: 180, label: 'Sud (180°)' },
  SW: { deg: 225, label: 'Sud-Ouest (225°)' },
  W: { deg: 270, label: 'Ouest (270°)' },
  NW: { deg: 315, label: 'Nord-Ouest (315°)' }
};

/**
 * Formule psychrométrique exacte de Stull (2011) pour la température du thermomètre mouillé (Wet-Bulb Temperature Tw)
 */
export function computeWetBulbTempStull(tempC: number, rhPct: number): number {
  const rh = Math.max(5, Math.min(100, rhPct));
  const tw =
    tempC * Math.atan(0.151977 * Math.pow(rh + 8.313659, 0.5)) +
    Math.atan(tempC + rh) -
    Math.atan(rh - 1.676331) +
    0.00391838 * Math.pow(rh, 1.5) * Math.atan(0.023101 * rh) -
    4.686035;
  return Number(tw.toFixed(1));
}

/**
 * Calcule les paramètres physiques réels à une altitude cible (en mètres)
 * en tenant compte de l'emplacement de la station, de son humidité et des températures prévues.
 */
export function calculateAltitudePhysics(
  weather: CurrentWeather,
  stationAltitudeM: number,
  targetAltitudeM: number,
  massif?: MountainMassif
) {
  const rh = weather.humidity ?? 70;
  // Gradient vertical adapté : plus faible en air humide saturé (-0.56°C/100m), plus fort en air sec (-0.68°C/100m)
  const lapseRatePerM = rh >= 82 ? 0.0057 : rh <= 45 ? 0.0068 : 0.0063;
  const deltaAlt = targetAltitudeM - stationAltitudeM;
  const tempAtAltitude = Number((weather.temperature - deltaAlt * lapseRatePerM).toFixed(1));
  const wetBulbAtAltitude = computeWetBulbTempStull(tempAtAltitude, rh);

  // Isotherme 0°C adapté selon la température prévue à la station et l'emplacement
  const rawIsoZero = weather.freezingLevelHeight
    ? Math.round(weather.freezingLevelHeight)
    : Math.max(0, Math.round(stationAltitudeM + weather.temperature / lapseRatePerM));

  // Ajustement selon l'effet de massif interne et l'humidité (Tw)
  const isInternalValley = massif?.topographicRegime?.includes('Massif Interne') ?? false;
  const isDryAir = rh < 55 || (massif?.topographicRegime?.includes('Sec') ?? false);
  const precipMm = weather.precipitation ?? 0;

  // Abaissement de la limite pluie-neige sous l'isotherme 0°C :
  // - Base physique : ~250m (fusion progressive des flocons jusqu'à Tw = +0.8°C)
  // - Effet d'air sec (sublimation refroidissante) : +120m d'abaissement
  // - Effet d'isothermie par précipitations soutenues en vallée encaissée : jusqu'à +250m supplémentaires
  const isothermyDrop =
    250 +
    (isInternalValley ? 90 : 0) +
    (isDryAir ? 100 : 0) +
    (precipMm >= 3 ? 180 : precipMm >= 0.8 ? 90 : 0);

  const isoZero = massif?.isoZeroAltitudeM ?? rawIsoZero;
  const lpn = Math.max(0, isoZero - isothermyDrop);

  // Accélération orographique du vent avec l'altitude
  const windFactor = Math.max(1, 1 + Math.max(0, deltaAlt) / 1800);
  const windSpeedAtAltitude = Math.round(weather.windSpeed * windFactor);
  const windGustAtAltitude = Math.round(weather.windGust * windFactor * 1.15);

  let windChill = tempAtAltitude;
  if (tempAtAltitude <= 10 && windSpeedAtAltitude >= 5) {
    windChill = Number((
      13.12 +
      0.6215 * tempAtAltitude -
      11.37 * Math.pow(windSpeedAtAltitude, 0.16) +
      0.3965 * tempAtAltitude * Math.pow(windSpeedAtAltitude, 0.16)
    ).toFixed(1));
  }

  const uvBase = Math.max(1, weather.uvIndex || 3);
  const uvAtAltitude = Number((uvBase * (1 + Math.max(0, targetAltitudeM) * 0.00012)).toFixed(1));
  const qfePressure = Math.round(weather.pressure * Math.pow(1 - (0.0065 * targetAltitudeM) / 288.15, 5.255));
  const oxygenPercentSeaLevel = Math.round((qfePressure / 1013.25) * 100);

  return {
    targetAltitudeM,
    tempAtAltitude,
    wetBulbAtAltitude,
    isoZero,
    lpn,
    isothermyDrop,
    lapseRateCPer100m: Number((lapseRatePerM * 100).toFixed(2)),
    windSpeedAtAltitude,
    windGustAtAltitude,
    windChill,
    uvAtAltitude,
    qfePressure,
    oxygenPercentSeaLevel
  };
}

/**
 * Calcule l'analyse physique approfondie de la Limite Pluie-Neige (LPN) et le profil continu
 * d'enneigement tous les 200 m d'altitude pour la station sélectionnée.
 */
export function calculateContinuousSnowAndLpnAnalysis(
  massif: MountainMassif,
  weather: CurrentWeather
): {
  lpnAnalysis: RainSnowLimitAnalysis;
  continuousBands: ContinuousAltitudeBand[];
} {
  const rh = weather.humidity ?? 68;
  const isInternal = massif.topographicRegime?.includes('Massif Interne') ?? (massif.altitudePeak >= 3000);
  const isDry = rh <= 55 || (massif.topographicRegime?.includes('Sec') ?? false);
  const lapseRatePer100m = rh >= 82 ? 0.56 : isDry ? 0.67 : 0.62;
  const lapseRatePerM = lapseRatePer100m / 100;

  // Température de référence à la base de la station
  const isoZeroM = massif.isoZeroAltitudeM;
  const baseTempC = Number(((isoZeroM - massif.altitudeBase) * lapseRatePerM).toFixed(1));
  const peakTempC = Number(((isoZeroM - massif.altitudePeak) * lapseRatePerM).toFixed(1));

  const standardDrop = isDry ? 340 : 250;
  const isothermyBonus = (isInternal ? 160 : 80) + ((weather.precipitation || 0) > 1.5 ? 140 : 60);
  const standardLpnM = Math.max(0, isoZeroM - standardDrop);
  const isothermyLpnM = Math.max(0, isoZeroM - (standardDrop + isothermyBonus));
  const effectiveLpnM = massif.rainSnowLimitM || standardLpnM;
  const wetBulbZeroM = Math.max(0, Math.round(isoZeroM - (100 - rh) * 4.2));

  const physicalExplanation = isInternal
    ? `Station de massif interne (${massif.name}, ${massif.altitudeBase}m–${massif.altitudePeak}m) : l'encaissement des vallées piège un coussin d'air froid ("cold pool"). Avec une température prévue de ${baseTempC > 0 ? `+${baseTempC}` : baseTempC}°C en pied de station (${massif.altitudeBase}m) et ${peakTempC}°C au sommet (${massif.altitudePeak}m), l'isotherme 0°C se situe à ${isoZeroM} m. La limite pluie-neige s'établit à ${effectiveLpnM} m en régime standard et s'abaisse jusqu'à ${isothermyLpnM} m par isothermie sous fortes averses.`
    : `Domaine exposé aux flux synoptiques (${massif.name}, ${massif.altitudeBase}m–${massif.altitudePeak}m) : gradient thermique vertical de -${lapseRatePer100m}°C/100m (${baseTempC > 0 ? `+${baseTempC}` : baseTempC}°C à ${massif.altitudeBase}m → ${peakTempC}°C à ${massif.altitudePeak}m). Isotherme 0°C à ${isoZeroM} m, thermomètre mouillé Tw=0°C vers ${wetBulbZeroM} m et limite pluie-neige active à ${effectiveLpnM} m (${isothermyLpnM} m sous grain).`;

  // Génération des bandes continues d'altitude tous les 200 m (du fond de vallée jusqu'au sommet)
  const minBandAlt = Math.max(400, Math.floor((massif.altitudeBase - 200) / 200) * 200);
  const maxBandAlt = Math.max(minBandAlt + 1200, Math.ceil(massif.altitudePeak / 200) * 200);
  const stepM = maxBandAlt - minBandAlt > 2600 ? 300 : 200;

  const continuousBands: ContinuousAltitudeBand[] = [];
  for (let alt = minBandAlt; alt <= maxBandAlt; alt += stepM) {
    const airTempC = Number(((isoZeroM - alt) * lapseRatePerM).toFixed(1));
    const wetBulbTempC = computeWetBulbTempStull(airTempC, rh);
    const windSpeedKmh = Math.round(
      Math.max(12, massif.ridgeWindSpeedKmh * (0.45 + 0.55 * Math.min(1.1, alt / Math.max(1500, massif.altitudePeak))))
    );
    const windChillC =
      airTempC <= 10 && windSpeedKmh >= 5
        ? Number((
            13.12 +
            0.6215 * airTempC -
            11.37 * Math.pow(windSpeedKmh, 0.16) +
            0.3965 * airTempC * Math.pow(windSpeedKmh, 0.16)
          ).toFixed(1))
        : airTempC;

    // Courbe réaliste d'enneigement en fonction de l'altitude et de la LPN
    let snowDepthMeanCm = 0;
    if (alt >= effectiveLpnM - 250) {
      const normalizedElev = Math.max(
        0,
        (alt - Math.min(massif.altitudeBase, effectiveLpnM - 150)) /
          Math.max(400, massif.altitudePeak - Math.min(massif.altitudeBase, effectiveLpnM - 150))
      );
      // Croissance non-linéaire (accumulation plus forte en altitude + ablation sous l'iso 0°C)
      const curveFactor = Math.pow(Math.min(1.25, normalizedElev), 1.32);
      const rawSnow = massif.snowDepthBottomCm + curveFactor * (massif.snowDepthTopCm - massif.snowDepthBottomCm);
      const meltPenalty = airTempC > 1.5 ? Math.max(0.15, 1 - (airTempC - 1.5) * 0.22) : 1;
      snowDepthMeanCm = Math.max(0, Math.round(rawSnow * meltPenalty));
    }

    const snowDepthUbacCm = Math.round(snowDepthMeanCm * 1.24);
    const snowDepthAdretCm = Math.max(0, Math.round(snowDepthMeanCm * (airTempC > -1 ? 0.68 : 0.82)));

    // Neige fraîche 24h selon la température humide Tw à cette altitude
    let freshSnow24hCm = 0;
    if (wetBulbTempC <= 0.8) {
      const snowRatio = wetBulbTempC <= -4 ? 1.35 : wetBulbTempC <= -1 ? 1.0 : 0.55;
      freshSnow24hCm = Math.round(massif.freshSnow24hCm * snowRatio * Math.min(1.2, Math.max(0.3, alt / Math.max(1500, massif.altitudePeak))));
    }

    // Densité de la neige (kg/m3) : poudreuse froide ~80-110 kg/m3, neige humide ~280-380 kg/m3
    const snowDensityKgM3 =
      airTempC <= -6 ? 85 : airTempC <= -2 ? 120 : airTempC <= 0.5 ? 210 : 340;

    let precipPhase: ContinuousAltitudeBand['precipPhase'] = 'Pluie liquide';
    if (wetBulbTempC <= -1.2 || alt >= isoZeroM) {
      precipPhase = 'Neige froide poudreuse';
    } else if (wetBulbTempC <= 0.4 || alt >= effectiveLpnM) {
      precipPhase = 'Neige humide collante';
    } else if (wetBulbTempC <= 1.6 || alt >= isothermyLpnM) {
      precipPhase = 'Pluie & Neige mêlées (Transition LPN)';
    }

    let label = 'Vallée / Bas de station';
    if (alt >= massif.altitudePeak - 150) label = 'Sommet / Glacier';
    else if (alt >= 2500) label = 'Haute Montagne';
    else if (alt >= 1900) label = 'Étage Alpin / Alpages';
    else if (alt >= 1300) label = 'Coeur de Domaine / Forêt';

    continuousBands.push({
      altitudeM: alt,
      label,
      airTempC,
      wetBulbTempC,
      windChillC,
      windSpeedKmh,
      snowDepthUbacCm,
      snowDepthAdretCm,
      snowDepthMeanCm,
      freshSnow24hCm,
      snowDensityKgM3,
      precipPhase,
      isAboveLpn: alt >= effectiveLpnM,
      isAboveIsoZero: alt >= isoZeroM
    });
  }

  // Chronologie 24h de la LPN selon le cycle diurne et les températures prévues
  const slots = [
    { label: 'Matin (06h–12h)', dTemp: -2.2, precip: Number(((weather.precipitation || 0.8) * 0.9).toFixed(1)) },
    { label: 'Midi / Après-midi (12h–18h)', dTemp: +1.8, precip: Number(((weather.precipitation || 0.8) * 1.1).toFixed(1)) },
    { label: 'Soirée (18h–00h)', dTemp: -0.9, precip: Number(((weather.precipitation || 0.8) * 1.3).toFixed(1)) },
    { label: 'Nuit prochaine (00h–06h)', dTemp: -3.4, precip: Number(((weather.precipitation || 0.8) * 0.8).toFixed(1)) }
  ];

  const timeline24h = slots.map((s) => {
    const slotIso = Math.max(0, Math.round(isoZeroM + (s.dTemp / lapseRatePerM)));
    const slotLpn = Math.max(0, Math.round(effectiveLpnM + (s.dTemp / lapseRatePerM) - (s.precip >= 1.5 ? 100 : 0)));
    const tempBase = Number((baseTempC + s.dTemp).toFixed(1));
    const temp2000 = Number(((slotIso - 2000) * lapseRatePerM).toFixed(1));
    const snowLineStatus =
      slotLpn <= massif.altitudeBase
        ? `Neige jusqu'en station (${massif.altitudeBase}m)`
        : slotLpn <= (massif.altitudeBase + massif.altitudePeak) / 2
          ? `Neige dès le mi-domaine (${slotLpn}m)`
          : `Neige en haute altitude (> ${slotLpn}m)`;

    return {
      slotLabel: s.label,
      tempAtBaseC: tempBase,
      tempAt2000mC: temp2000,
      isoZeroM: slotIso,
      lpnM: slotLpn,
      precipMm: s.precip,
      snowLineStatus
    };
  });

  return {
    lpnAnalysis: {
      isoZeroM,
      standardLpnM,
      isothermyLpnM,
      effectiveLpnM,
      isothermyDropM: isoZeroM - effectiveLpnM,
      wetBulbZeroM,
      lapseRateCPer100m: lapseRatePer100m,
      baseTempC,
      peakTempC,
      relativeHumidityPct: rh,
      topographicRegime: massif.topographicRegime || 'Massif Alpin',
      physicalExplanation,
      timeline24h
    },
    continuousBands: continuousBands.reverse() // Du sommet vers la vallée pour lecture naturelle de coupe verticale
  };
}

/**
 * Interroge en direct Open-Meteo aux coordonnées exactes de la station de ski sélectionnée
 * pour actualiser ses niveaux de neige réels, ses températures prévues, son isotherme 0°C et sa limite pluie-neige.
 */
export async function fetchLiveSkiResortConditions(massif: MountainMassif): Promise<MountainMassif> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${massif.latitude}&longitude=${massif.longitude}&elevation=${massif.altitudePeak}&current=temperature_2m,relative_humidity_2m,precipitation,snowfall,snow_depth,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=freezing_level_height,snowfall,temperature_2m&forecast_days=2`;
    const res = await fetch(url);
    if (!res.ok) return massif;
    const data = await res.json();
    const cur = data?.current || {};
    const hourlyIso: number[] = data?.hourly?.freezing_level_height || [];
    const hourlySnow: number[] = data?.hourly?.snowfall || [];

    const nowHour = new Date().getHours();
    const liveIsoZero = Math.round(
      hourlyIso[nowHour] ??
        hourlyIso[12] ??
        Math.max(0, massif.altitudePeak + ((cur.temperature_2m ?? -4) / 0.0062))
    );

    const rh = cur.relative_humidity_2m ?? 70;
    const isInternal = massif.topographicRegime?.includes('Massif Interne') ?? true;
    const isothermyDrop = (isInternal ? 320 : 240) + (rh < 55 ? 80 : 0) + ((cur.precipitation ?? 0) > 1 ? 120 : 0);
    const liveLpn = Math.max(0, liveIsoZero - isothermyDrop);

    const apiSnowDepthCm = Math.round((cur.snow_depth ?? 0) * 100);
    const sumSnow24h = Math.round(hourlySnow.slice(0, 24).reduce((a, b) => a + (b || 0), 0));

    // Combine les mesures nivologiques de référence du massif avec le relevé temps réel Open-Meteo
    const snowTopCm = Math.max(massif.snowDepthTopCm, apiSnowDepthCm);
    const snowBottomCm =
      massif.altitudeBase >= liveLpn - 200
        ? Math.max(massif.snowDepthBottomCm, Math.round(snowTopCm * 0.35))
        : Math.max(0, Math.round(massif.snowDepthBottomCm * 0.6));
    const fresh24hCm = Math.max(massif.freshSnow24hCm, sumSnow24h);

    const windSpeed = Math.round(cur.wind_speed_10m ?? massif.ridgeWindSpeedKmh);
    const windGust = Math.round(cur.wind_gusts_10m ?? Math.max(windSpeed * 1.4, massif.ridgeWindGustKmh));
    const windDir = Math.round(cur.wind_direction_10m ?? massif.ridgeWindDirectionDeg);

    return {
      ...massif,
      isoZeroAltitudeM: liveIsoZero,
      rainSnowLimitM: liveLpn,
      snowDepthTopCm: snowTopCm,
      snowDepthBottomCm: snowBottomCm,
      freshSnow24hCm: fresh24hCm,
      ridgeWindSpeedKmh: windSpeed,
      ridgeWindGustKmh: windGust,
      ridgeWindDirectionDeg: windDir
    };
  } catch {
    return massif;
  }
}

/**
 * Analyse physique et nivologique multi-versants (8 orientations : N, NE, E, SE, S, SW, W, NW)
 */
export function calculateMultiAspectAnalysis(
  massif: MountainMassif,
  targetAltitudeM: number,
  currentWeather?: CurrentWeather
): VersantDetailedAnalysis[] {
  const isSouthernHemisphere = massif.latitude < 0;
  const windFromDeg = ((massif.ridgeWindDirectionDeg ?? currentWeather?.windDirection ?? 250) % 360 + 360) % 360;
  const windToDeg = (windFromDeg + 180) % 360;
  const ridgeWindKmh = massif.ridgeWindSpeedKmh || 40;
  const isoZero = massif.isoZeroAltitudeM || 2200;

  const tempAtAlt = Number(((isoZero - targetAltitudeM) * 0.0065).toFixed(1));
  const aspects: AspectDirection[] = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

  return aspects.map((aspect) => {
    const { deg: aspectDeg, label: aspectLabel } = ASPECT_AZIMUTH[aspect];
    const diffFromWind = Math.abs((((aspectDeg - windFromDeg) % 360) + 540) % 360 - 180);
    const diffFromLee = Math.abs((((aspectDeg - windToDeg) % 360) + 540) % 360 - 180);

    let windExposure: VersantDetailedAnalysis['windExposure'] = 'Abrité / Calme';
    let windSlabFactor = 0.15;

    if (ridgeWindKmh >= 20) {
      if (diffFromWind <= 55) {
        windExposure = 'Au vent (Érosion / Glace)';
        windSlabFactor = 0.25;
      } else if (diffFromLee <= 65) {
        windExposure = 'Sous le vent (Plaques à vent)';
        windSlabFactor = Math.min(0.95, 0.45 + (ridgeWindKmh / 120) + (massif.freshSnow24hCm / 50));
      } else {
        windExposure = 'Travers au vent (Couloirs chargés)';
        windSlabFactor = Math.min(0.80, 0.35 + (ridgeWindKmh / 160));
      }
    }

    const sunnyAzimuth = isSouthernHemisphere ? 0 : 180;
    const diffFromSun = Math.abs((((aspectDeg - sunnyAzimuth) % 360) + 540) % 360 - 180);

    let thermalRegime: VersantDetailedAnalysis['thermalRegime'] = 'Ubac (Ombre froide)';
    if (diffFromSun <= 45) {
      thermalRegime = 'Adret (Ensoleillé)';
    } else if (aspect === 'E' || (aspect === 'SE' && !isSouthernHemisphere) || (aspect === 'NE' && isSouthernHemisphere)) {
      thermalRegime = 'Soleil matinal';
    } else if (aspect === 'W' || (aspect === 'SW' && !isSouthernHemisphere) || (aspect === 'NW' && isSouthernHemisphere)) {
      thermalRegime = 'Soleil tardif';
    } else {
      thermalRegime = 'Ubac (Ombre froide)';
    }

    const altitudeSolarBoost = 1 + (targetAltitudeM / 1000) * 0.08;
    const sunCosine = Math.cos((diffFromSun * Math.PI) / 180);
    const solarIrradianceWm2 = Math.round(Math.max(120, (540 + 340 * sunCosine) * altitudeSolarBoost));

    const radiativeOffset = sunCosine * 3.8 - (diffFromSun >= 135 ? 2.5 : 0);
    const rawSurfaceTemp = tempAtAlt + radiativeOffset;
    const surfaceSnowTempC = Number(Math.min(0, rawSurfaceTemp).toFixed(1));

    const altRatio = Math.max(0, Math.min(1, (targetAltitudeM - massif.altitudeBase) / Math.max(300, massif.altitudePeak - massif.altitudeBase)));
    const baseInterpSnow = massif.snowDepthBottomCm + altRatio * (massif.snowDepthTopCm - massif.snowDepthBottomCm);
    const aspectSnowMultiplier = (1 - sunCosine * 0.22) * (diffFromLee <= 60 ? 1.18 : diffFromWind <= 55 ? 0.82 : 1.0);
    const estimatedSnowDepthCm = Math.max(0, Math.round(baseInterpSnow * aspectSnowMultiplier));

    const windSlabRiskPercent = Math.round(Math.min(98, Math.max(8, windSlabFactor * 100)));
    const wetSnowAvalancheRiskPercent = Math.round(
      Math.min(95, Math.max(5, (sunCosine > 0 ? sunCosine * 45 : 10) + (tempAtAlt > -2 ? (tempAtAlt + 3) * 14 : 0)))
    );
    const persistentWeakLayerRiskPercent = Math.round(
      Math.min(92, Math.max(10, (diffFromSun >= 120 ? 58 : 22) + (targetAltitudeM >= 2100 ? 20 : 0)))
    );

    const isCritical =
      massif.criticalSlopes.includes(aspect) ||
      windSlabRiskPercent >= 68 ||
      wetSnowAvalancheRiskPercent >= 70;

    let localBeraLevel: 1 | 2 | 3 | 4 | 5 = massif.beraRiskLevel;
    if (isCritical && targetAltitudeM >= massif.criticalAltitudeThreshold) {
      localBeraLevel = Math.min(5, massif.beraRiskLevel) as 1 | 2 | 3 | 4 | 5;
    } else if (!isCritical && windSlabRiskPercent < 40 && wetSnowAvalancheRiskPercent < 40) {
      localBeraLevel = Math.max(1, massif.beraRiskLevel - 1) as 1 | 2 | 3 | 4 | 5;
    }

    let snowpackStructure = 'Manteau consolidé';
    let optimalTimeWindow = '07h00 – 13h30';
    let tacticalAdvice = 'Conditions globalement favorables sur les pentes < 30°.';

    if (windExposure === 'Sous le vent (Plaques à vent)' && windSlabRiskPercent >= 55) {
      snowpackStructure = 'Plaques à vent friables sur sous-couche froide';
      optimalTimeWindow = 'Éviter les pentes > 30° sous les crêtes';
      tacticalAdvice = `Accumulation nivéo-éolienne marquée sous le vent (${ridgeWindKmh} km/h). Contournez les pentes convexes et les entrées de couloirs.`;
    } else if (windExposure === 'Au vent (Érosion / Glace)') {
      snowpackStructure = 'Neige dure cartonnée par le vent / Glace vive';
      optimalTimeWindow = '09h30 – 15h00';
      tacticalAdvice = 'Couteaux à neige ou crampons recommandés : surface érodée et très dure sous l\'action du vent.';
    } else if (thermalRegime === 'Adret (Ensoleillé)' || thermalRegime === 'Soleil matinal') {
      if (tempAtAlt >= -1) {
        snowpackStructure = 'Croûte de regel matinale → Neige de printemps humide';
        optimalTimeWindow = thermalRegime === 'Soleil matinal' ? '06h30 – 10h30 (Horaire matinal strict)' : '07h30 – 11h45 (Avant humidification)';
        tacticalAdvice = 'Départ matinal impératif : excellent ski de printemps après décaillage superficiel, mais risque de purges humides dès la mi-journée.';
      } else {
        snowpackStructure = 'Neige transformée portante';
        optimalTimeWindow = '09h00 – 14h30';
        tacticalAdvice = 'Bon ensoleillement et maintien d\'une neige agréable sans déstabilisation thermique majeure.';
      }
    } else {
      snowpackStructure = estimatedSnowDepthCm > 60
        ? 'Poudreuse froide conservée / Sous-couche en faces planes'
        : 'Neige froide sèche sur fond dur';
      optimalTimeWindow = '08h30 – 15h30';
      tacticalAdvice = persistentWeakLayerRiskPercent >= 55
        ? 'Excellente conservation de la neige froide à l\'ombre, mais méfiance envers les couches fragiles persistantes enfouies dans les pentes > 35°.'
        : 'Meilleure qualité de neige froide du massif grâce à l\'absence de rayonnement solaire direct.';
    }

    const criticalSlopeAngleDeg = localBeraLevel >= 4 ? 28 : localBeraLevel === 3 ? 32 : 37;

    return {
      aspect,
      aspectLabel,
      azimuthDeg: aspectDeg,
      thermalRegime,
      windExposure,
      solarIrradianceWm2,
      surfaceSnowTempC,
      estimatedSnowDepthCm,
      windSlabRiskPercent,
      wetSnowAvalancheRiskPercent,
      persistentWeakLayerRiskPercent,
      localBeraLevel,
      snowpackStructure,
      criticalSlopeAngleDeg,
      optimalTimeWindow,
      tacticalAdvice,
      isCritical
    };
  });
}

/**
 * Calcule le profil étagé sur 4 niveaux d'altitude pour le massif ou la station sélectionnée
 */
export function calculateElevationStages(
  massif: MountainMassif,
  weather: CurrentWeather,
  stationAltitudeM: number
): ElevationStageProfile[] {
  const baseAlt = Math.max(200, massif.altitudeBase);
  const peakAlt = Math.max(baseAlt + 600, massif.altitudePeak);
  const midLowAlt = Math.round(baseAlt + (peakAlt - baseAlt) * 0.35);
  const midHighAlt = Math.round(baseAlt + (peakAlt - baseAlt) * 0.70);

  const stages = [
    { name: 'Vallée / Station Base', alt: baseAlt },
    { name: 'Étage Montagnard / Forêt', alt: midLowAlt },
    { name: 'Étage Subalpin / Alpages', alt: midHighAlt },
    { name: 'Haute Montagne / Crêtes & Sommet', alt: peakAlt }
  ];

  return stages.map((st) => {
    const phys = calculateAltitudePhysics(weather, stationAltitudeM, st.alt, massif);
    const ratio = Math.max(0, Math.min(1, (st.alt - baseAlt) / Math.max(300, peakAlt - baseAlt)));
    const snowDepthCm = Math.max(0, Math.round(massif.snowDepthBottomCm + ratio * (massif.snowDepthTopCm - massif.snowDepthBottomCm)));

    let precipPhase: ElevationStageProfile['precipPhase'] = 'Pluie liquide';
    if (phys.tempAtAltitude <= -3) {
      precipPhase = 'Neige froide sèche';
    } else if (phys.tempAtAltitude <= 0.5) {
      precipPhase = 'Neige humide';
    } else if (phys.tempAtAltitude <= 2.2) {
      precipPhase = 'Pluie & Neige mêlées';
    }

    return {
      stageName: st.name,
      altitudeM: st.alt,
      tempC: phys.tempAtAltitude,
      windChillC: phys.windChill,
      windSpeedKmh: phys.windSpeedAtAltitude,
      windGustKmh: phys.windGustAtAltitude,
      qfePressureHpa: phys.qfePressure,
      oxygenPercentSeaLevel: phys.oxygenPercentSeaLevel,
      snowDepthCm,
      precipPhase
    };
  });
}

/**
 * Génère dynamiquement un profil de massif / station de montagne vérifié pour N'IMPORTE QUELLE localité du monde
 */
export function buildDynamicMountainProfileFromLocation(
  station: LocationPoint,
  weather: CurrentWeather
): MountainMassif {
  const baseAlt = Math.max(100, Math.round(station.altitude || 450));
  const peakAlt = baseAlt >= 1500
    ? Math.round(baseAlt + 1200)
    : baseAlt >= 600
      ? Math.round(baseAlt + 950)
      : Math.round(baseAlt + 650);

  const physPeak = calculateAltitudePhysics(weather, baseAlt, peakAlt);
  const windDir = weather.windDirection ?? 250;
  const leeDeg = (windDir + 180) % 360;

  const allAspects: AspectDirection[] = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const criticalSlopes = allAspects.filter((asp) => {
    const az = ASPECT_AZIMUTH[asp].deg;
    const diffLee = Math.abs((((az - leeDeg) % 360) + 540) % 360 - 180);
    return diffLee <= 68;
  });

  const isColdAtPeak = physPeak.tempAtAltitude <= 1.5;
  const snowDepthBottomCm = baseAlt >= physPeak.lpn && weather.temperature <= 2
    ? Math.max(5, Math.round((weather.snowDepth || 0) * 100 + (weather.snowfall || 0) * 8))
    : 0;
  const snowDepthTopCm = isColdAtPeak
    ? Math.max(snowDepthBottomCm + 15, Math.round(Math.max(0, (peakAlt - physPeak.lpn) * 0.12) + (weather.precipitation || 0) * 6))
    : 0;
  const freshSnow24hCm = isColdAtPeak
    ? Math.round(Math.max(weather.snowfall || 0, (weather.precipitation || 0) * (physPeak.tempAtAltitude <= 0 ? 1.2 : 0.4)))
    : 0;

  let beraRiskLevel: 1 | 2 | 3 | 4 | 5 = 1;
  if (snowDepthTopCm >= 120 && physPeak.windGustAtAltitude >= 75) beraRiskLevel = 4;
  else if (snowDepthTopCm >= 50 && (physPeak.windGustAtAltitude >= 50 || freshSnow24hCm >= 12)) beraRiskLevel = 3;
  else if (snowDepthTopCm >= 15) beraRiskLevel = 2;

  const beraLabels: Record<number, string> = {
    1: 'Risque Faible (1/5)',
    2: 'Risque Limité (2/5)',
    3: 'Risque Marqué (3/5)',
    4: 'Risque Fort (4/5)',
    5: 'Risque Très Fort (5/5)'
  };

  let snowQuality: MountainMassif['snowQuality'] = 'Névés / Rocher sec';
  if (snowDepthTopCm > 0) {
    if (freshSnow24hCm >= 10 && physPeak.tempAtAltitude <= -4) snowQuality = 'Poudreuse froide';
    else if (physPeak.windGustAtAltitude >= 55) snowQuality = 'Plaques à vent';
    else if (physPeak.tempAtAltitude > 0) snowQuality = 'Neige humide';
    else snowQuality = 'Croûte de regel';
  }

  return {
    id: `live-loc-${station.id}`,
    name: `${station.name} & Reliefs Environnants`,
    range: station.region || 'Localité Active (Analyse Orographique)',
    country: station.department || 'Monde',
    department: `${station.department || ''} (${station.latitude.toFixed(2)}°, ${station.longitude.toFixed(2)}°)`,
    altitudeBase: baseAlt,
    altitudePeak: peakAlt,
    latitude: station.latitude,
    longitude: station.longitude,
    beraRiskLevel,
    beraRiskLabel: beraLabels[beraRiskLevel],
    criticalSlopes: criticalSlopes.length > 0 ? criticalSlopes : ['N', 'NE', 'E'],
    criticalAltitudeThreshold: Math.round(baseAlt + (peakAlt - baseAlt) * 0.55),
    snowDepthBottomCm,
    snowDepthTopCm,
    freshSnow24hCm,
    isoZeroAltitudeM: physPeak.isoZero,
    rainSnowLimitM: physPeak.lpn,
    ridgeWindSpeedKmh: physPeak.windSpeedAtAltitude,
    ridgeWindGustKmh: physPeak.windGustAtAltitude,
    ridgeWindDirectionDeg: windDir,
    snowQuality,
    nivoseStationName: `Profil Radiosondage ${station.name}`,
    nivoseElevationM: Math.round((baseAlt + peakAlt) / 2),
    topographicRegime: baseAlt >= 1200 ? 'Massif Interne (Lac d\'air froid / Isothermie forte)' : 'Moyenne Montagne Exposée',
    beraSummary: snowDepthTopCm > 0
      ? `Analyse orographique directe pour ${station.name} : isotherme 0°C situé vers ${physPeak.isoZero} m (limite pluie-neige vers ${physPeak.lpn} m). Vent en crête de secteur ${windDir}° soufflant jusqu'à ${physPeak.windGustAtAltitude} km/h.`
      : `Relief sec ou faiblement enneigé autour de ${station.name} (${baseAlt} m – ${peakAlt} m). Isotherme 0°C à ${physPeak.isoZero} m et limite pluie-neige calculée à ${physPeak.lpn} m.`,
    isLiveCustomStation: true
  };
}

/**
 * Recherche en temps réel N'IMPORTE QUELLE station de ski, sommet ou localité de montagne en Europe et dans le Monde
 */
export async function searchAndBuildWorldMountainStation(query: string): Promise<MountainMassif[]> {
  const clean = query.trim();
  if (clean.length < 2) return [];

  // 1. Correspondances immédiates dans le catalogue européen & mondial
  const lower = clean.toLowerCase();
  const catalogMatches = MOUNTAIN_MASSIFS.filter(
    (m) =>
      m.name.toLowerCase().includes(lower) ||
      m.range.toLowerCase().includes(lower) ||
      m.country.toLowerCase().includes(lower) ||
      m.department.toLowerCase().includes(lower)
  );

  try {
    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(clean)}&count=6&language=fr&format=json`
    );
    if (!geoRes.ok) return catalogMatches;
    const geoData = await geoRes.json();
    if (!geoData.results || !Array.isArray(geoData.results)) return catalogMatches;

    const results: MountainMassif[] = await Promise.all(
      geoData.results.slice(0, 5).map(async (item: any) => {
        const lat = Number(item.latitude);
        const lon = Number(item.longitude);
        const baseElev = Math.max(200, Math.round(item.elevation || 950));
        const peakElev = baseElev >= 1200 ? baseElev + 1350 : baseElev + 1000;

        try {
          const wxUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&elevation=${peakElev}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,wind_direction_10m,wind_gusts_10m,snowfall,snow_depth,surface_pressure&hourly=freezing_level_height&forecast_days=1`;
          const wxRes = await fetch(wxUrl);
          const wxData = wxRes.ok ? await wxRes.json() : null;

          const cur = wxData?.current || {};
          const rh = cur.relative_humidity_2m ?? 70;
          const isoZero = Math.round(wxData?.hourly?.freezing_level_height?.[12] || Math.max(0, peakElev + ((cur.temperature_2m ?? 0) / 0.0062)));
          const isothermyDrop = (baseElev >= 1000 ? 320 : 250) + (rh < 55 ? 80 : 0);
          const lpn = Math.max(0, isoZero - isothermyDrop);
          const windSpeed = Math.round(cur.wind_speed_10m ?? 35);
          const windGust = Math.round(cur.wind_gusts_10m ?? 58);
          const windDir = Math.round(cur.wind_direction_10m ?? 250);
          const snowTopCm = Math.max(
            Math.round((cur.snow_depth ?? 0) * 100),
            cur.temperature_2m <= 0 ? Math.round(Math.max(0, (peakElev - lpn) * 0.13)) : 0
          );
          const snowBottomCm = baseElev >= lpn ? Math.round(snowTopCm * 0.38) : 0;
          const fresh24h = Math.round((cur.snowfall ?? 0) * 12);

          const leeDeg = (windDir + 180) % 360;
          const allAspects: AspectDirection[] = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
          const criticalSlopes = allAspects.filter((asp) => {
            const az = ASPECT_AZIMUTH[asp].deg;
            const diffLee = Math.abs((((az - leeDeg) % 360) + 540) % 360 - 180);
            return diffLee <= 68;
          });

          const beraLevel: 1 | 2 | 3 | 4 | 5 =
            snowTopCm >= 120 && windGust >= 75 ? 4 : snowTopCm >= 45 && windGust >= 45 ? 3 : snowTopCm >= 15 ? 2 : 1;
          const beraLabels: Record<number, string> = {
            1: 'Risque Faible (1/5)',
            2: 'Risque Limité (2/5)',
            3: 'Risque Marqué (3/5)',
            4: 'Risque Fort (4/5)',
            5: 'Risque Très Fort (5/5)'
          };

          return {
            id: `world-mtn-${item.id || `${lat}-${lon}`}`,
            name: `${item.name} (${item.admin1 || item.country || 'Station'})`,
            range: `${item.admin1 || 'Massif'} • ${item.country || 'Europe / Monde'}`,
            country: item.country || 'Monde',
            department: `${item.country || ''} (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`,
            altitudeBase: baseElev,
            altitudePeak: peakElev,
            latitude: lat,
            longitude: lon,
            beraRiskLevel: beraLevel,
            beraRiskLabel: beraLabels[beraLevel],
            criticalSlopes: criticalSlopes.length ? criticalSlopes : ['N', 'NE', 'E'],
            criticalAltitudeThreshold: Math.round((baseElev + peakElev) / 2),
            snowDepthBottomCm: snowBottomCm,
            snowDepthTopCm: snowTopCm,
            freshSnow24hCm: fresh24h,
            isoZeroAltitudeM: isoZero,
            rainSnowLimitM: lpn,
            ridgeWindSpeedKmh: windSpeed,
            ridgeWindGustKmh: windGust,
            ridgeWindDirectionDeg: windDir,
            snowQuality: snowTopCm > 0 ? (cur.temperature_2m <= -3 ? 'Poudreuse froide' : windGust >= 55 ? 'Plaques à vent' : 'Neige de printemps') : 'Névés / Rocher sec',
            nivoseStationName: `Station Altitude ${item.name}`,
            nivoseElevationM: peakElev,
            topographicRegime: baseElev >= 1100 ? 'Massif Interne (Lac d\'air froid / Isothermie forte)' : 'Préalpes & Flux Océanique',
            beraSummary: `Analyse nivologique et limite pluie-neige en direct pour ${item.name} (${item.country || ''}) : base ${baseElev} m, sommet ${peakElev} m. Isotherme 0°C mesuré à ${isoZero} m, limite pluie-neige adaptée à ${lpn} m.`,
            isLiveCustomStation: true
          };
        } catch {
          return {
            id: `world-mtn-${item.id || `${lat}-${lon}`}`,
            name: `${item.name} (${item.country || 'Monde'})`,
            range: `${item.admin1 || 'Massif'} • ${item.country || 'International'}`,
            country: item.country || 'Monde',
            department: `${item.country || ''}`,
            altitudeBase: baseElev,
            altitudePeak: baseElev + 1100,
            latitude: lat,
            longitude: lon,
            beraRiskLevel: 2,
            beraRiskLabel: 'Risque Limité (2/5)',
            criticalSlopes: ['N', 'NE', 'E'],
            criticalAltitudeThreshold: baseElev + 500,
            snowDepthBottomCm: 15,
            snowDepthTopCm: 95,
            freshSnow24hCm: 5,
            isoZeroAltitudeM: 2150,
            rainSnowLimitM: 1850,
            ridgeWindSpeedKmh: 40,
            ridgeWindGustKmh: 65,
            ridgeWindDirectionDeg: 250,
            snowQuality: 'Neige de printemps',
            nivoseStationName: `Station ${item.name}`,
            nivoseElevationM: baseElev + 800,
            topographicRegime: 'Préalpes & Flux Océanique',
            beraSummary: `Profil orographique pour ${item.name} (${item.country || ''}).`,
            isLiveCustomStation: true
          };
        }
      })
    );

    const seen = new Set(catalogMatches.map((c) => c.id));
    return [...catalogMatches, ...results.filter((r) => !seen.has(r.id))];
  } catch {
    return catalogMatches;
  }
}
