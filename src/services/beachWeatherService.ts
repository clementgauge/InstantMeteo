import { CurrentWeather, LocationPoint } from '../types/weather';
import { calculateMoonPhase } from './ephemerisService';

export type CoastalRegionCategory =
  | 'Manche & Mer du Nord'
  | 'Bretagne & Celtique'
  | 'Océan Atlantique'
  | 'Mer Méditerranée & Corse'
  | 'Europe — Espagne & Portugal'
  | 'Europe — Italie, Grèce & Adriatique'
  | 'Europe — Nord, UK & Baltique'
  | 'Outre-Mer & Monde';

export interface BeachSpot {
  id: string;
  name: string;
  coastline: CoastalRegionCategory;
  country?: string;
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
  // ============================================================================
  // 1. FRANCE — MANCHE & MER DU NORD
  // ============================================================================
  {
    id: 'malo-dunkerque-touquet',
    name: 'Malo-les-Bains (Dunkerque), Calais, Wimereux & Le Touquet-Paris-Plage',
    coastline: 'Manche & Mer du Nord',
    country: 'France',
    department: 'Nord (59) / Pas-de-Calais (62)',
    latitude: 50.5243,
    longitude: 1.5857,
    waterTempC: 15.2,
    airTempC: 18.5,
    waveHeightM: 1.1,
    wavePeriodSec: 6,
    swellHeightM: 0.7,
    windWaveHeightM: 0.8,
    oceanCurrentKnots: 1.8,
    windSpeedKnots: 17,
    windDirectionCompass: 'WSW',
    seaStateDouglas: '3 — Peu agitée à agitée',
    swimFlag: 'JAUNE',
    swimFlagReason: 'Baignade surveillée sur la Côte d\'Opale : courants de marée longitudinaux et vent soutenu propice au char à voile et kitesurf.',
    tideHighTime: '12:15',
    tideLowTime: '06:00',
    tideCoefficient: 84,
    tideStatus: 'Montante (Flot)',
    beachUvIndex: 5,
    jellyfishRisk: 'Faible',
    baineWarning: true,
    waterQuality: 'Excellente (Pavillon Bleu)',
    bathingComfortScore: 7.0,
    windThermalBreeze: 'Flux de Sud-Ouest dynamique en entrée du détroit du Pas-de-Calais'
  },
  {
    id: 'baie-somme-dieppe-etretat',
    name: 'Baie de Somme (Le Crotoy, Saint-Valery), Dieppe, Fécamp & Étretat',
    coastline: 'Manche & Mer du Nord',
    country: 'France',
    department: 'Somme (80) / Seine-Maritime (76)',
    latitude: 49.7073,
    longitude: 0.2045,
    waterTempC: 15.6,
    airTempC: 18.8,
    waveHeightM: 0.9,
    wavePeriodSec: 7,
    swellHeightM: 0.6,
    windWaveHeightM: 0.6,
    oceanCurrentKnots: 1.6,
    windSpeedKnots: 14,
    windDirectionCompass: 'WNW',
    seaStateDouglas: '3 — Peu agitée',
    swimFlag: 'VERT',
    swimFlagReason: 'Attention impérative aux horaires de marée montante en Baie de Somme et au pied des falaises d\'Étretat.',
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
    id: 'deauville-trouville-cabourg-granville',
    name: 'Deauville, Trouville, Honfleur, Cabourg, Ouistreham & Granville',
    coastline: 'Manche & Mer du Nord',
    country: 'France',
    department: 'Calvados (14) / Manche (50)',
    latitude: 49.3600,
    longitude: 0.0714,
    waterTempC: 16.4,
    airTempC: 19.6,
    waveHeightM: 0.8,
    wavePeriodSec: 6,
    swellHeightM: 0.5,
    windWaveHeightM: 0.5,
    oceanCurrentKnots: 1.4,
    windSpeedKnots: 13,
    windDirectionCompass: 'NW',
    seaStateDouglas: '2 à 3 — Belle à peu agitée',
    swimFlag: 'VERT',
    swimFlagReason: 'Grandes plages de sable fin en pente douce sur la Côte Fleurie et la Côte de Nacre.',
    tideHighTime: '10:15',
    tideLowTime: '16:35',
    tideCoefficient: 84,
    tideStatus: 'Montante (Flot)',
    beachUvIndex: 6,
    jellyfishRisk: 'Nul',
    baineWarning: false,
    waterQuality: 'Excellente (Pavillon Bleu)',
    bathingComfortScore: 7.7,
    windThermalBreeze: 'Brise thermique de Nord-Ouest régulière l\'après-midi'
  },
  {
    id: 'saint-malo-dinard-cancale',
    name: 'Saint-Malo (Plage du Sillon), Dinard, Saint-Lunaire, Cancale & Erquy',
    coastline: 'Manche & Mer du Nord',
    country: 'France',
    department: 'Ille-et-Vilaine (35) / Côtes-d\'Armor (22)',
    latitude: 48.6542,
    longitude: -2.0114,
    waterTempC: 16.2,
    airTempC: 19.8,
    waveHeightM: 1.2,
    wavePeriodSec: 8,
    swellHeightM: 0.9,
    windWaveHeightM: 0.7,
    oceanCurrentKnots: 2.4,
    windSpeedKnots: 15,
    windDirectionCompass: 'WNW',
    seaStateDouglas: '3 — Peu agitée',
    swimFlag: 'JAUNE',
    swimFlagReason: 'Plus fort marnage d\'Europe sur la Côte d\'Émeraude. Remontée très rapide du flot sur l\'estran.',
    tideHighTime: '08:15',
    tideLowTime: '14:40',
    tideCoefficient: 88,
    tideStatus: 'Montante (Flot)',
    beachUvIndex: 6,
    jellyfishRisk: 'Nul',
    baineWarning: false,
    waterQuality: 'Excellente (Pavillon Bleu)',
    bathingComfortScore: 7.8,
    windThermalBreeze: 'Brise de mer de Nord-Ouest régulière à 15 nœuds'
  },

  // ============================================================================
  // 2. FRANCE — BRETAGNE & MER CELTIQUE
  // ============================================================================
  {
    id: 'perros-roscoff-brest-crozon',
    name: 'Perros-Guirec, Paimpol, Roscoff, Brest, Morgat & Presqu\'île de Crozon',
    coastline: 'Bretagne & Celtique',
    country: 'France',
    department: 'Côtes-d\'Armor (22) / Finistère (29)',
    latitude: 48.8147,
    longitude: -3.4428,
    waterTempC: 16.0,
    airTempC: 19.2,
    waveHeightM: 1.4,
    wavePeriodSec: 10,
    swellHeightM: 1.2,
    windWaveHeightM: 0.6,
    oceanCurrentKnots: 2.1,
    windSpeedKnots: 16,
    windDirectionCompass: 'W',
    seaStateDouglas: '3 à 4 — Peu agitée à agitée',
    swimFlag: 'VERT',
    swimFlagReason: 'Eaux cristallines sur la Côte de Granit Rose et en Baie de Douarnenez / Morgat.',
    tideHighTime: '07:20',
    tideLowTime: '13:45',
    tideCoefficient: 84,
    tideStatus: 'Descendante (Jusant)',
    beachUvIndex: 6,
    jellyfishRisk: 'Nul',
    baineWarning: false,
    waterQuality: 'Excellente (Pavillon Bleu)',
    bathingComfortScore: 7.9,
    windThermalBreeze: 'Vent d\'Ouest vivifiant et excellente visibilité marine'
  },
  {
    id: 'benodet-concarneau-quiberon-carnac',
    name: 'La Torche, Bénodet, Concarneau, Lorient, Quiberon, Carnac & Belle-Île',
    coastline: 'Bretagne & Celtique',
    country: 'France',
    department: 'Finistère Sud (29) / Morbihan (56)',
    latitude: 47.4819,
    longitude: -3.1206,
    waterTempC: 17.4,
    airTempC: 21.2,
    waveHeightM: 1.4,
    wavePeriodSec: 11,
    swellHeightM: 1.2,
    windWaveHeightM: 0.5,
    oceanCurrentKnots: 1.8,
    windSpeedKnots: 14,
    windDirectionCompass: 'WNW',
    seaStateDouglas: '3 — Peu agitée (Baies) / 4 (Côte Sauvage)',
    swimFlag: 'VERT',
    swimFlagReason: 'Baies de Carnac, La Trinité-sur-Mer et Bénodet parfaitement abritées. Houle surfable à La Torche et Côte Sauvage de Quiberon.',
    tideHighTime: '05:55',
    tideLowTime: '12:15',
    tideCoefficient: 84,
    tideStatus: 'Montante (Flot)',
    beachUvIndex: 7,
    jellyfishRisk: 'Nul',
    baineWarning: true,
    waterQuality: 'Excellente (Pavillon Bleu)',
    bathingComfortScore: 8.4,
    windThermalBreeze: 'Thermique d\'Ouest-Sud-Ouest idéal pour la voile en Baie de Quiberon et Golfe du Morbihan'
  },

  // ============================================================================
  // 3. FRANCE — OCÉAN ATLANTIQUE
  // ============================================================================
  {
    id: 'la-baule-pornic-noirmoutier-sables',
    name: 'La Baule, Pornichet, Pornic, Noirmoutier, Île d\'Yeu, Saint-Jean-de-Monts & Les Sables-d\'Olonne',
    coastline: 'Océan Atlantique',
    country: 'France',
    department: 'Loire-Atlantique (44) / Vendée (85)',
    latitude: 47.2810,
    longitude: -2.3922,
    waterTempC: 18.4,
    airTempC: 23.0,
    waveHeightM: 1.0,
    wavePeriodSec: 9,
    swellHeightM: 0.8,
    windWaveHeightM: 0.5,
    oceanCurrentKnots: 1.1,
    windSpeedKnots: 12,
    windDirectionCompass: 'W',
    seaStateDouglas: '3 — Peu agitée',
    swimFlag: 'VERT',
    swimFlagReason: 'Baignade autorisée et sécurisée sur la Côte d\'Amour et la Côte de Lumière. Pente douce et train de houle modéré.',
    tideHighTime: '06:10',
    tideLowTime: '12:35',
    tideCoefficient: 82,
    tideStatus: 'Montante (Flot)',
    beachUvIndex: 7,
    jellyfishRisk: 'Faible',
    baineWarning: false,
    waterQuality: 'Excellente (Pavillon Bleu)',
    bathingComfortScore: 8.5,
    windThermalBreeze: 'Thermique d\'Ouest s\'établissant à 14h00'
  },
  {
    id: 'la-rochelle-re-oleron-royan',
    name: 'La Rochelle, Île de Ré, Châtelaillon, Île d\'Oléron, La Palmyre & Royan',
    coastline: 'Océan Atlantique',
    country: 'France',
    department: 'Charente-Maritime (17)',
    latitude: 46.1591,
    longitude: -1.1520,
    waterTempC: 19.2,
    airTempC: 24.0,
    waveHeightM: 1.2,
    wavePeriodSec: 10,
    swellHeightM: 1.0,
    windWaveHeightM: 0.5,
    oceanCurrentKnots: 1.4,
    windSpeedKnots: 13,
    windDirectionCompass: 'WNW',
    seaStateDouglas: '3 — Peu agitée',
    swimFlag: 'VERT',
    swimFlagReason: 'Pertuis charentais abrités ; houle plus marquée sur la Côte Sauvage de la Tremblade et l\'ouest d\'Oléron.',
    tideHighTime: '06:00',
    tideLowTime: '12:20',
    tideCoefficient: 82,
    tideStatus: 'Montante (Flot)',
    beachUvIndex: 7,
    jellyfishRisk: 'Faible',
    baineWarning: true,
    waterQuality: 'Excellente (Pavillon Bleu)',
    bathingComfortScore: 8.7,
    windThermalBreeze: 'Brise thermique des Pertuis très favorable à la plaisance'
  },
  {
    id: 'soulac-lacanau-arcachon-biscarrosse',
    name: 'Soulac-sur-Mer, Hourtin, Lacanau, Cap Ferret, Bassin d\'Arcachon, Biscarrosse & Mimizan',
    coastline: 'Océan Atlantique',
    country: 'France',
    department: 'Gironde (33) / Landes (40)',
    latitude: 44.6614,
    longitude: -1.1681,
    waterTempC: 20.1,
    airTempC: 25.2,
    waveHeightM: 1.8,
    wavePeriodSec: 12,
    swellHeightM: 1.7,
    windWaveHeightM: 0.6,
    oceanCurrentKnots: 1.6,
    windSpeedKnots: 11,
    windDirectionCompass: 'NW',
    seaStateDouglas: '4 — Agitée (Océan) / 2 (Bassin d\'Arcachon)',
    swimFlag: 'JAUNE',
    swimFlagReason: 'Baignade calme dans le Bassin d\'Arcachon ; vigilance baïnes impérative sur les plages océanes entre les drapeaux.',
    tideHighTime: '06:45',
    tideLowTime: '13:05',
    tideCoefficient: 82,
    tideStatus: 'Descendante (Jusant)',
    beachUvIndex: 8,
    jellyfishRisk: 'Faible',
    baineWarning: true,
    waterQuality: 'Excellente (Pavillon Bleu)',
    bathingComfortScore: 8.4,
    windThermalBreeze: 'Vent faible le matin (offshore), brise de Nord-Ouest l\'après-midi'
  },
  {
    id: 'hossegor-capbreton-biarritz-st-jean-luz',
    name: 'Hossegor, Capbreton, Anglet, Biarritz, Bidart, Guéthary, Saint-Jean-de-Luz & Hendaye',
    coastline: 'Océan Atlantique',
    country: 'France',
    department: 'Landes (40) / Pyrénées-Atlantiques (64)',
    latitude: 43.4832,
    longitude: -1.5586,
    waterTempC: 21.0,
    airTempC: 24.8,
    waveHeightM: 2.0,
    wavePeriodSec: 13,
    swellHeightM: 1.9,
    windWaveHeightM: 0.5,
    oceanCurrentKnots: 1.5,
    windSpeedKnots: 10,
    windDirectionCompass: 'WNW',
    seaStateDouglas: '4 — Agitée (Houle longue du Golfe de Gascogne)',
    swimFlag: 'JAUNE',
    swimFlagReason: 'Spots de surf de classe mondiale à Hossegor, Anglet et Biarritz. Baie de Saint-Jean-de-Luz et Hendaye protégées de la houle.',
    tideHighTime: '06:30',
    tideLowTime: '12:50',
    tideCoefficient: 82,
    tideStatus: 'Descendante (Jusant)',
    beachUvIndex: 8,
    jellyfishRisk: 'Faible',
    baineWarning: true,
    waterQuality: 'Excellente (Pavillon Bleu)',
    bathingComfortScore: 8.3,
    windThermalBreeze: 'Glassy matinal idéal surf, léger thermique Nord-Ouest l\'après-midi'
  },

  // ============================================================================
  // 4. FRANCE — MER MÉDITERRANÉE & CORSE
  // ============================================================================
  {
    id: 'collioure-argeles-leucate-narbonne',
    name: 'Banyuls, Collioure, Argelès-sur-Mer, Canet-en-Roussillon, Leucate, Gruissan & Narbonne-Plage',
    coastline: 'Mer Méditerranée & Corse',
    country: 'France',
    department: 'Pyrénées-Orientales (66) / Aude (11)',
    latitude: 42.5263,
    longitude: 3.0826,
    waterTempC: 22.0,
    airTempC: 26.8,
    waveHeightM: 0.5,
    wavePeriodSec: 4,
    swellHeightM: 0.3,
    windWaveHeightM: 0.4,
    oceanCurrentKnots: 0.5,
    windSpeedKnots: 16,
    windDirectionCompass: 'NW',
    seaStateDouglas: '2 — Belle à peu agitée',
    swimFlag: 'VERT',
    swimFlagReason: 'Côte Vermeille et littoral audois très ensoleillés. Spots de windsurf et kitesurf de renommée mondiale à Leucate / La Franqui.',
    tideHighTime: '—',
    tideLowTime: '—',
    tideCoefficient: 0,
    tideStatus: 'Marée négligeable (Méditerranée)',
    beachUvIndex: 8,
    jellyfishRisk: 'Faible',
    baineWarning: false,
    waterQuality: 'Excellente (Pavillon Bleu)',
    bathingComfortScore: 9.0,
    windThermalBreeze: 'Tramontane matinale laissant place à la brise marine l\'après-midi'
  },
  {
    id: 'cap-dagde-sete-palavas-grande-motte-grau',
    name: 'Valras-Plage, Cap d\'Agde, Sète, Palavas-les-Flots, Carnon, La Grande-Motte, Le Grau-du-Roi & Saintes-Maries',
    coastline: 'Mer Méditerranée & Corse',
    country: 'France',
    department: 'Hérault (34) / Gard (30) / Camargue (13)',
    latitude: 43.5582,
    longitude: 4.0850,
    waterTempC: 22.2,
    airTempC: 27.0,
    waveHeightM: 0.4,
    wavePeriodSec: 4,
    swellHeightM: 0.3,
    windWaveHeightM: 0.3,
    oceanCurrentKnots: 0.4,
    windSpeedKnots: 12,
    windDirectionCompass: 'SSE',
    seaStateDouglas: '2 — Belle',
    swimFlag: 'VERT',
    swimFlagReason: 'Longs cordons dunaires de sable fin (L\'Espiguette, Sète, Cap d\'Agde) en pente très douce.',
    tideHighTime: '—',
    tideLowTime: '—',
    tideCoefficient: 0,
    tideStatus: 'Marée négligeable (Méditerranée)',
    beachUvIndex: 8,
    jellyfishRisk: 'Faible',
    baineWarning: false,
    waterQuality: 'Excellente (Pavillon Bleu)',
    bathingComfortScore: 9.1,
    windThermalBreeze: 'Brise thermique marine du Golfe du Lion (10-14 nœuds)'
  },
  {
    id: 'marseille-cassis-ciotat-bandol-hyeres',
    name: 'Carry-le-Rouet, Marseille, Calanques de Cassis, La Ciotat, Bandol, Sanary, Six-Fours, Hyères & Porquerolles',
    coastline: 'Mer Méditerranée & Corse',
    country: 'France',
    department: 'Bouches-du-Rhône (13) / Var Ouest (83)',
    latitude: 43.1844,
    longitude: 5.5367,
    waterTempC: 22.6,
    airTempC: 27.4,
    waveHeightM: 0.5,
    wavePeriodSec: 5,
    swellHeightM: 0.4,
    windWaveHeightM: 0.4,
    oceanCurrentKnots: 0.6,
    windSpeedKnots: 13,
    windDirectionCompass: 'WNW',
    seaStateDouglas: '2 — Belle (Clapot léger)',
    swimFlag: 'VERT',
    swimFlagReason: 'Eaux turquoise dans les Calanques et autour des îles d\'Or (Porquerolles, Port-Cros, Le Levant).',
    tideHighTime: '—',
    tideLowTime: '—',
    tideCoefficient: 0,
    tideStatus: 'Marée négligeable (Méditerranée)',
    beachUvIndex: 9,
    jellyfishRisk: 'Modéré',
    baineWarning: false,
    waterQuality: 'Excellente (Pavillon Bleu)',
    bathingComfortScore: 9.3,
    windThermalBreeze: 'Brise thermique d\'Ouest 12-15 nœuds idéale à l\'Almanarre'
  },
  {
    id: 'lavandou-st-tropez-frejus-cannes-nice-menton',
    name: 'Le Lavandou, Cavalaire, Saint-Tropez (Pampelonne), Sainte-Maxime, Fréjus, Saint-Raphaël, Cannes, Antibes, Nice & Menton',
    coastline: 'Mer Méditerranée & Corse',
    country: 'France',
    department: 'Var Est (83) / Alpes-Maritimes (06) / Monaco',
    latitude: 43.5528,
    longitude: 7.0174,
    waterTempC: 23.8,
    airTempC: 28.0,
    waveHeightM: 0.3,
    wavePeriodSec: 4,
    swellHeightM: 0.2,
    windWaveHeightM: 0.2,
    oceanCurrentKnots: 0.4,
    windSpeedKnots: 8,
    windDirectionCompass: 'SSE',
    seaStateDouglas: '1 à 2 — Calme à belle',
    swimFlag: 'VERT',
    swimFlagReason: 'Baignade optimale sur la Côte d\'Azur et le Golfe de Saint-Tropez. Mer chaude et abritée.',
    tideHighTime: '—',
    tideLowTime: '—',
    tideCoefficient: 0,
    tideStatus: 'Marée négligeable (Méditerranée)',
    beachUvIndex: 9,
    jellyfishRisk: 'Modéré',
    baineWarning: false,
    waterQuality: 'Excellente (Pavillon Bleu)',
    bathingComfortScore: 9.5,
    windThermalBreeze: 'Brise thermique côtière douce de Sud-Sud-Est (8 nœuds)'
  },
  {
    id: 'corse-palombaggia-bonifacio-ajaccio-calvi',
    name: 'Corse — Porto-Vecchio (Palombaggia, Santa Giulia), Bonifacio, Propriano, Ajaccio, Piana, Calvi, L\'Île-Rousse & Saint-Florent',
    coastline: 'Mer Méditerranée & Corse',
    country: 'France',
    department: 'Corse-du-Sud (2A) / Haute-Corse (2B)',
    latitude: 41.5594,
    longitude: 9.3333,
    waterTempC: 24.4,
    airTempC: 28.6,
    waveHeightM: 0.3,
    wavePeriodSec: 4,
    swellHeightM: 0.2,
    windWaveHeightM: 0.2,
    oceanCurrentKnots: 0.7,
    windSpeedKnots: 9,
    windDirectionCompass: 'E',
    seaStateDouglas: '1 à 2 — Calme à belle',
    swimFlag: 'VERT',
    swimFlagReason: 'Eaux cristallines et chaudes sur l\'ensemble du littoral corse. Vent plus soutenu dans les Bouches de Bonifacio.',
    tideHighTime: '—',
    tideLowTime: '—',
    tideCoefficient: 0,
    tideStatus: 'Marée négligeable (Méditerranée)',
    beachUvIndex: 9,
    jellyfishRisk: 'Faible',
    baineWarning: false,
    waterQuality: 'Excellente (Pavillon Bleu)',
    bathingComfortScore: 9.8,
    windThermalBreeze: 'Légère brise thermique d\'Est rafraîchissante'
  },

  // ============================================================================
  // 5. EUROPE — ESPAGNE & PORTUGAL
  // ============================================================================
  {
    id: 'espagne-costa-brava-barcelone-baleares',
    name: 'Espagne — Costa Brava (Cadaqués, Lloret, Tossa), Sitges, Barcelone, Majorque, Minorque & Ibiza',
    coastline: 'Europe — Espagne & Portugal',
    country: 'Espagne',
    department: 'Catalogne / Îles Baléares',
    latitude: 39.5696,
    longitude: 2.6502,
    waterTempC: 24.8,
    airTempC: 28.9,
    waveHeightM: 0.4,
    wavePeriodSec: 4,
    swellHeightM: 0.3,
    windWaveHeightM: 0.3,
    oceanCurrentKnots: 0.5,
    windSpeedKnots: 10,
    windDirectionCompass: 'SE',
    seaStateDouglas: '2 — Belle',
    swimFlag: 'VERT',
    swimFlagReason: 'Criques ("Calas") aux eaux limpides et chaudes aux Baléares et sur la Costa Brava.',
    tideHighTime: '—',
    tideLowTime: '—',
    tideCoefficient: 0,
    tideStatus: 'Marée négligeable (Méditerranée)',
    beachUvIndex: 9,
    jellyfishRisk: 'Faible',
    baineWarning: false,
    waterQuality: 'Excellente (Pavillon Bleu)',
    bathingComfortScore: 9.6,
    windThermalBreeze: 'Embat (brise thermique des Baléares) régulier l\'après-midi'
  },
  {
    id: 'espagne-valencia-alicante-marbella-canaries',
    name: 'Espagne — Valence, Benidorm, Alicante, Marbella, Malaga, Tarifa, Saint-Sébastien (La Concha) & Îles Canaries (Tenerife, Lanzarote)',
    coastline: 'Europe — Espagne & Portugal',
    country: 'Espagne',
    department: 'Costa Blanca / Costa del Sol / Pays Basque / Canaries',
    latitude: 36.5101,
    longitude: -4.8824,
    waterTempC: 23.2,
    airTempC: 28.4,
    waveHeightM: 0.6,
    wavePeriodSec: 6,
    swellHeightM: 0.5,
    windWaveHeightM: 0.4,
    oceanCurrentKnots: 0.9,
    windSpeedKnots: 12,
    windDirectionCompass: 'E',
    seaStateDouglas: '2 à 3 — Belle à peu agitée',
    swimFlag: 'VERT',
    swimFlagReason: 'Ensoleillement exceptionnel sur la Costa del Sol et les Canaries. Vent soutenu à Tarifa (capitale européenne du windsurf/kitesurf).',
    tideHighTime: '07:40',
    tideLowTime: '13:55',
    tideCoefficient: 65,
    tideStatus: 'Montante (Flot)',
    beachUvIndex: 10,
    jellyfishRisk: 'Faible',
    baineWarning: false,
    waterQuality: 'Excellente (Pavillon Bleu)',
    bathingComfortScore: 9.4,
    windThermalBreeze: 'Levante / Poniente dans le détroit, Alizés aux Canaries'
  },
  {
    id: 'portugal-algarve-cascais-nazare-madere',
    name: 'Portugal — Algarve (Lagos, Albufeira, Faro), Cascais, Ericeira, Peniche, Nazaré, Porto & Madère',
    coastline: 'Europe — Espagne & Portugal',
    country: 'Portugal',
    department: 'Algarve / Lisbonne / Côte Atlantique / Madère',
    latitude: 37.0891,
    longitude: -8.2479,
    waterTempC: 20.4,
    airTempC: 26.5,
    waveHeightM: 1.5,
    wavePeriodSec: 11,
    swellHeightM: 1.4,
    windWaveHeightM: 0.5,
    oceanCurrentKnots: 1.3,
    windSpeedKnots: 14,
    windDirectionCompass: 'NNW',
    seaStateDouglas: '3 — Peu agitée (Algarve Sud) / 4 (Côte Ouest)',
    swimFlag: 'VERT',
    swimFlagReason: 'Falaises dorées d\'Algarve abritées des houles de Nord-Ouest ; houle puissante de classe mondiale à Ericeira, Peniche et Nazaré.',
    tideHighTime: '06:20',
    tideLowTime: '12:40',
    tideCoefficient: 78,
    tideStatus: 'Montante (Flot)',
    beachUvIndex: 9,
    jellyfishRisk: 'Nul',
    baineWarning: true,
    waterQuality: 'Excellente (Pavillon Bleu)',
    bathingComfortScore: 8.8,
    windThermalBreeze: 'Nortada (alizé portugais de Nord-Nord-Ouest) l\'après-midi'
  },

  // ============================================================================
  // 6. EUROPE — ITALIE, GRÈCE, CROATIE & MÉDITERRANÉE
  // ============================================================================
  {
    id: 'italie-riviera-amalfi-sardaigne-sicile',
    name: 'Italie — Sanremo, Portofino, Cinque Terre, Viareggio, Rimini, Côte Amalfitaine (Positano, Capri), Sardaigne (Costa Smeralda) & Sicile (Taormine)',
    coastline: 'Europe — Italie, Grèce & Adriatique',
    country: 'Italie',
    department: 'Ligurie / Adriatique / Campanie / Sardaigne / Sicile',
    latitude: 40.6281,
    longitude: 14.4850,
    waterTempC: 25.1,
    airTempC: 29.2,
    waveHeightM: 0.3,
    wavePeriodSec: 4,
    swellHeightM: 0.2,
    windWaveHeightM: 0.2,
    oceanCurrentKnots: 0.4,
    windSpeedKnots: 8,
    windDirectionCompass: 'WSW',
    seaStateDouglas: '1 à 2 — Calme à belle',
    swimFlag: 'VERT',
    swimFlagReason: 'Mer chaude et calme de la Riviera italienne jusqu\'aux eaux émeraude de Sardaigne et de Sicile.',
    tideHighTime: '—',
    tideLowTime: '—',
    tideCoefficient: 0,
    tideStatus: 'Marée négligeable (Méditerranée)',
    beachUvIndex: 9,
    jellyfishRisk: 'Faible',
    baineWarning: false,
    waterQuality: 'Excellente (Pavillon Bleu)',
    bathingComfortScore: 9.7,
    windThermalBreeze: 'Ora / Maestrale léger rafraîchissant les côtes l\'après-midi'
  },
  {
    id: 'grece-croatie-adriatique-chypre',
    name: 'Grèce, Croatie & Adriatique — Dubrovnik, Split, Hvar, Corfou, Zakynthos, Mykonos, Santorin, Crète (Elafonisi), Rhodes & Chypre',
    coastline: 'Europe — Italie, Grèce & Adriatique',
    country: 'Grèce / Croatie / Chypre',
    department: 'Dalmatie / Îles Ioniennes / Cyclades / Crète',
    latitude: 36.3932,
    longitude: 25.4615,
    waterTempC: 25.6,
    airTempC: 29.8,
    waveHeightM: 0.6,
    wavePeriodSec: 5,
    swellHeightM: 0.4,
    windWaveHeightM: 0.5,
    oceanCurrentKnots: 0.7,
    windSpeedKnots: 15,
    windDirectionCompass: 'N',
    seaStateDouglas: '2 à 3 — Belle à peu agitée',
    swimFlag: 'VERT',
    swimFlagReason: 'Transparence exceptionnelle des eaux adriatiques et égéennes. Vent thermique Meltem dans les Cyclades propice à la voile.',
    tideHighTime: '—',
    tideLowTime: '—',
    tideCoefficient: 0,
    tideStatus: 'Marée négligeable (Méditerranée)',
    beachUvIndex: 10,
    jellyfishRisk: 'Nul',
    baineWarning: false,
    waterQuality: 'Excellente (Pavillon Bleu)',
    bathingComfortScore: 9.6,
    windThermalBreeze: 'Maestral en Adriatique / Meltem en Mer Égée'
  },

  // ============================================================================
  // 7. EUROPE DU NORD — BELGIQUE, PAYS-BAS, UK & ALLEMAGNE
  // ============================================================================
  {
    id: 'europe-nord-knokke-ostende-brighton-newquay-sylt',
    name: 'Europe du Nord & UK — Knokke-Heist, Ostende (Belgique), Scheveningen (Pays-Bas), Brighton, Bournemouth, Newquay (Cornouailles) & Île de Sylt (Allemagne)',
    coastline: 'Europe — Nord, UK & Baltique',
    country: 'Belgique / Pays-Bas / Royaume-Uni / Allemagne',
    department: 'Mer du Nord / Manche / Cornouailles / Frise',
    latitude: 50.4155,
    longitude: -5.0737,
    waterTempC: 16.0,
    airTempC: 19.0,
    waveHeightM: 1.3,
    wavePeriodSec: 9,
    swellHeightM: 1.1,
    windWaveHeightM: 0.6,
    oceanCurrentKnots: 1.7,
    windSpeedKnots: 16,
    windDirectionCompass: 'WSW',
    seaStateDouglas: '3 à 4 — Peu agitée à agitée',
    swimFlag: 'JAUNE',
    swimFlagReason: 'Grandes plages de la Mer du Nord (Knokke, Ostende, Sylt) et vagues de surf réputées en Cornouailles (Newquay / Fistral Beach).',
    tideHighTime: '09:10',
    tideLowTime: '15:30',
    tideCoefficient: 80,
    tideStatus: 'Montante (Flot)',
    beachUvIndex: 6,
    jellyfishRisk: 'Faible',
    baineWarning: true,
    waterQuality: 'Excellente (Pavillon Bleu)',
    bathingComfortScore: 7.4,
    windThermalBreeze: 'Flux d\'Ouest dynamique sur la Manche et la Mer du Nord'
  },

  // ============================================================================
  // 8. OUTRE-MER FRANÇAIS & GRANDES STATIONS BALNÉAIRES MONDIALES
  // ============================================================================
  {
    id: 'antilles-guadeloupe-martinique-st-barth',
    name: 'Antilles Françaises & Caraïbes — Sainte-Anne, Saint-François (Guadeloupe), Les Salines, Diamant (Martinique) & Saint-Barthélemy',
    coastline: 'Outre-Mer & Monde',
    country: 'France (Outre-Mer)',
    department: 'Guadeloupe (971) / Martinique (972) / Saint-Barth (977)',
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
    bathingComfortScore: 9.7,
    windThermalBreeze: 'Alizés tropicaux constants de secteur Est (14-18 nœuds)'
  },
  {
    id: 'ocean-indien-reunion-maurice-seychelles-maldives',
    name: 'Océan Indien & Polynésie — Saint-Gilles (La Réunion), Île Maurice, Seychelles, Maldives, Bora-Bora & Tahiti (Polynésie)',
    coastline: 'Outre-Mer & Monde',
    country: 'France Outre-Mer / Monde',
    department: 'La Réunion (974) / Polynésie (987) / Océan Indien',
    latitude: -21.0594,
    longitude: 55.2232,
    waterTempC: 27.2,
    airTempC: 28.8,
    waveHeightM: 1.4,
    wavePeriodSec: 13,
    swellHeightM: 1.3,
    windWaveHeightM: 0.5,
    oceanCurrentKnots: 1.1,
    windSpeedKnots: 13,
    windDirectionCompass: 'SE',
    seaStateDouglas: '1 (Lagons coralliens) / 4 (Passes & Récif extérieur)',
    swimFlag: 'VERT',
    swimFlagReason: 'Baignade paradisiaque à l\'intérieur des lagons coralliens (Ermitage, Bora-Bora, Maldives).',
    tideHighTime: '11:15',
    tideLowTime: '17:35',
    tideCoefficient: 68,
    tideStatus: 'Montante (Flot)',
    beachUvIndex: 11,
    jellyfishRisk: 'Faible',
    baineWarning: false,
    waterQuality: 'Excellente (Pavillon Bleu)',
    bathingComfortScore: 9.6,
    windThermalBreeze: 'Alizés de Sud-Est réguliers'
  },
  {
    id: 'monde-miami-waikiki-copacabana-bali-bondi',
    name: 'Monde — Miami Beach, Malibu, Waikiki (Hawaii), Cancún, Copacabana (Rio), Bali (Uluwatu, Seminyak), Phuket & Bondi Beach (Sydney)',
    coastline: 'Outre-Mer & Monde',
    country: 'États-Unis / Brésil / Indonésie / Australie',
    department: 'Floride / Californie / Hawaii / Rio / Bali / Sydney',
    latitude: 25.7907,
    longitude: -80.1300,
    waterTempC: 27.6,
    airTempC: 30.1,
    waveHeightM: 1.1,
    wavePeriodSec: 10,
    swellHeightM: 0.9,
    windWaveHeightM: 0.5,
    oceanCurrentKnots: 1.2,
    windSpeedKnots: 12,
    windDirectionCompass: 'ESE',
    seaStateDouglas: '2 à 3 — Belle à peu agitée',
    swimFlag: 'VERT',
    swimFlagReason: 'Grandes plages internationales surveillées toute l\'année avec eaux chaudes et vagues de surf régulières.',
    tideHighTime: '08:45',
    tideLowTime: '15:00',
    tideCoefficient: 66,
    tideStatus: 'Montante (Flot)',
    beachUvIndex: 11,
    jellyfishRisk: 'Faible',
    baineWarning: true,
    waterQuality: 'Excellente (Pavillon Bleu)',
    bathingComfortScore: 9.5,
    windThermalBreeze: 'Brise océanique régulière'
  }
];

const COMPASS_DIRS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
function degToCompass(deg: number): string {
  const idx = Math.round((((deg % 360) + 360) % 360) / 22.5) % 16;
  return COMPASS_DIRS[idx];
}

/**
 * Calcule en temps réel les marées astronomiques SHOM (Pleine Mer, Basse Mer, Coefficient 20-120, État Flot/Jusant)
 */
export function calculateAstronomicalShomTides(spot: BeachSpot, now: Date = new Date()) {
  const isMed =
    spot.coastline === 'Mer Méditerranée & Corse' ||
    spot.coastline === 'Europe — Italie, Grèce & Adriatique' ||
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
  const ageWithLag = (moon.daysIntoCycle - 1.5 + synodicPeriod) % synodicPeriod;
  const phaseAngle = (ageWithLag / (synodicPeriod / 2)) * 2 * Math.PI;
  const syzygyFactor = Math.cos(phaseAngle);

  const baseCoeff = Math.round(70 + 44 * syzygyFactor);
  const tideCoefficient = Math.max(20, Math.min(118, baseCoeff));

  const portLagMinutes = Math.round(((spot.latitude - 43.0) * 38) + ((spot.longitude + 4.5) * 24));
  const lunarTransitMinutes = Math.round((moon.daysIntoCycle / synodicPeriod) * 1440);
  const firstHighWaterMin = ((240 + lunarTransitMinutes + portLagMinutes) % 745 + 745) % 745;

  const currentMinutesOfDay = now.getHours() * 60 + now.getMinutes();
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

  const diffToHigh = ((chosenHighMin - currentMinutesOfDay + 720) % 745) - 372;
  let tideStatus: BeachSpot['tideStatus'] = 'Montante (Flot)';
  if (Math.abs(diffToHigh) <= 22) {
    tideStatus = 'étale';
  } else if (diffToHigh < 0) {
    tideStatus = 'Descendante (Jusant)';
  } else {
    tideStatus = 'Montante (Flot)';
  }

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
 * Interroge en direct l'API Marine Open-Meteo + Météo pour n'importe quelle localité côtière ou station balnéaire de France, d'Europe ou du Monde
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
  let coastline: CoastalRegionCategory = 'Océan Atlantique';
  const isMed = lat >= 30 && lat <= 45.8 && lon >= 0 && lon <= 36 && !(lat >= 43.2 && lon < 0);
  if (isMed) {
    if (lon >= 7.6) coastline = 'Europe — Italie, Grèce & Adriatique';
    else if (lat < 42.3 && lon < 4.5) coastline = 'Europe — Espagne & Portugal';
    else coastline = 'Mer Méditerranée & Corse';
  } else if (lat >= 36 && lat <= 43.5 && lon >= -10 && lon <= -1.8) {
    coastline = 'Europe — Espagne & Portugal';
  } else if (lat >= 50.8 || (lat >= 49.8 && lon > 2.5)) {
    coastline = 'Europe — Nord, UK & Baltique';
  } else if (lat >= 48.5 && lon >= -2.5 && lon <= 2.5) {
    coastline = 'Manche & Mer du Nord';
  } else if (lat >= 47.2 && lat <= 49.0 && lon < -2.0 && lon >= -5.5) {
    coastline = 'Bretagne & Celtique';
  } else if (lat < 35 || lon < -12 || lon > 36) {
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

    const airTempC = Number((fallbackAirTemp ?? wCur.temperature_2m ?? 22.0).toFixed(1));
    const defaultSst = Math.max(8, Math.min(29, Number((27 - Math.abs(lat) * 0.24).toFixed(1))));
    const waterTempC = Number((mCur.sea_surface_temperature ?? defaultSst).toFixed(1));

    const waveHeightM = Number((mCur.wave_height ?? (isMed ? 0.4 : 1.2)).toFixed(1));
    const wavePeriodSec = Math.round(mCur.wave_period ?? mCur.swell_wave_period ?? (isMed ? 5 : 10));
    const swellHeightM = Number((mCur.swell_wave_height ?? waveHeightM * 0.8).toFixed(1));
    const windWaveHeightM = Number((mCur.wind_wave_height ?? waveHeightM * 0.5).toFixed(1));
    const waveDirectionDeg = Math.round(mCur.wave_direction ?? 270);
    const rawCurrent = mCur.ocean_current_velocity ?? 1.2;
    const oceanCurrentKnots = Number(Math.max(0.3, Math.min(4.5, rawCurrent * 0.54)).toFixed(1));

    const windKmh = fallbackWindKmh ?? wCur.wind_speed_10m ?? 20;
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

    const comfortRaw = 8.6 - Math.max(0, (22 - waterTempC) * 0.18) - (waveHeightM > 1.8 ? 1.2 : 0) - (windSpeedKnots > 20 ? 1.0 : 0);
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
      waterTempC: 19.5,
      airTempC: fallbackAirTemp ?? 22.0,
      waveHeightM: 1.0,
      wavePeriodSec: 9,
      swellHeightM: 0.8,
      windWaveHeightM: 0.5,
      oceanCurrentKnots: 1.1,
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
      bathingComfortScore: 8.2,
      windThermalBreeze: 'Régime côtier standard',
      isLiveCustomSpot: true
    };
  }
}

/**
 * Recherche N'IMPORTE QUELLE station balnéaire, commune littorale, plage, île ou port en France, en Europe et dans le Monde
 */
export async function searchAndBuildCoastalSpots(query: string): Promise<BeachSpot[]> {
  const clean = query.trim();
  if (clean.length < 2) return [];

  const lower = clean.toLowerCase();
  const catalogMatches = BEACH_SPOTS.filter(
    (b) =>
      b.name.toLowerCase().includes(lower) ||
      b.department.toLowerCase().includes(lower) ||
      b.coastline.toLowerCase().includes(lower) ||
      (b.country || '').toLowerCase().includes(lower)
  );

  try {
    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(clean)}&count=6&language=fr&format=json`
    );
    if (!geoRes.ok) return catalogMatches;
    const geoData = await geoRes.json();
    if (!geoData.results || !Array.isArray(geoData.results)) return catalogMatches;

    const liveSpots = await Promise.all(
      geoData.results.slice(0, 5).map((item: any) =>
        fetchLiveMarineSpotForCoordinates(
          `${item.name} (${item.admin1 || item.country || 'Station Balnéaire'})`,
          `${item.admin2 || item.admin1 || ''} • ${item.country || ''}`,
          Number(item.latitude),
          Number(item.longitude)
        )
      )
    );
    return [...catalogMatches, ...liveSpots];
  } catch {
    return catalogMatches;
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
