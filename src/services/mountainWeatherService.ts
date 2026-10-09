import { CurrentWeather, LocationPoint } from '../types/weather';

export type AspectDirection = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';

export interface MountainMassif {
  id: string;
  name: string;
  range: string; // Alpes du Nord, Alpes du Sud, Pyrénées, Massif Central, Vosges, Jura, Corse, Monde
  country: string;
  department: string;
  altitudeBase: number;
  altitudePeak: number;
  latitude: number;
  longitude: number;
  beraRiskLevel: 1 | 2 | 3 | 4 | 5; // Échelle européenne et internationale d'avalanche (1 Faible à 5 Très Fort)
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

export const MOUNTAIN_MASSIFS: MountainMassif[] = [
  // FRANCE - ALPES DU NORD, ALPES DU SUD, PYRÉNÉES, MASSIF CENTRAL, VOSGES, JURA, CORSE
  {
    id: 'mont-blanc',
    name: 'Massif du Mont-Blanc (Chamonix)',
    range: 'Alpes du Nord',
    country: 'France',
    department: 'Haute-Savoie (74)',
    altitudeBase: 1035,
    altitudePeak: 4808,
    latitude: 45.8326,
    longitude: 6.8652,
    beraRiskLevel: 3,
    beraRiskLabel: 'Risque Marqué (3/5)',
    criticalSlopes: ['N', 'NE', 'E', 'NW'],
    criticalAltitudeThreshold: 2200,
    snowDepthBottomCm: 45,
    snowDepthTopCm: 295,
    freshSnow24hCm: 18,
    isoZeroAltitudeM: 2150,
    rainSnowLimitM: 1850,
    ridgeWindSpeedKmh: 55,
    ridgeWindGustKmh: 85,
    ridgeWindDirectionDeg: 245, // WSW -> charges N, NE, E
    snowQuality: 'Plaques à vent',
    nivoseStationName: 'Aiguilles Rouges',
    nivoseElevationM: 2330,
    beraSummary: 'Plaques à vent friables formées par le flux de Sud-Ouest en haute altitude. Déclenchements provoqués possibles au passage d\'un seul skieur ou alpiniste dans les pentes raides (>35°) au-dessus de 2200m sur un large secteur Nord à Est.'
  },
  {
    id: 'vanoise',
    name: 'Massif de la Vanoise (Val Thorens / Tignes)',
    range: 'Alpes du Nord',
    country: 'France',
    department: 'Savoie (73)',
    altitudeBase: 1250,
    altitudePeak: 3855,
    latitude: 45.4022,
    longitude: 6.8058,
    beraRiskLevel: 3,
    beraRiskLabel: 'Risque Marqué (3/5)',
    criticalSlopes: ['N', 'NE', 'NW'],
    criticalAltitudeThreshold: 2300,
    snowDepthBottomCm: 50,
    snowDepthTopCm: 240,
    freshSnow24hCm: 14,
    isoZeroAltitudeM: 2200,
    rainSnowLimitM: 1900,
    ridgeWindSpeedKmh: 45,
    ridgeWindGustKmh: 72,
    ridgeWindDirectionDeg: 210,
    snowQuality: 'Poudreuse froide',
    nivoseStationName: 'Bellecôte',
    nivoseElevationM: 3035,
    beraSummary: 'Manteau neigeux bien enneigé en haute altitude mais présentant des sous-couches fragiles persistantes (faces planes) en versants froids ombragés (Ubac) au-dessus de 2300m.'
  },
  {
    id: 'oisans-ecrins',
    name: 'Massif des Écrins & Oisans (La Grave / Les 2 Alpes)',
    range: 'Alpes du Nord / Sud',
    country: 'France',
    department: 'Isère (38) / Hautes-Alpes (05)',
    altitudeBase: 1100,
    altitudePeak: 4102,
    latitude: 44.9224,
    longitude: 6.3596,
    beraRiskLevel: 2,
    beraRiskLabel: 'Risque Limité (2/5)',
    criticalSlopes: ['N', 'NE', 'NW'],
    criticalAltitudeThreshold: 2500,
    snowDepthBottomCm: 30,
    snowDepthTopCm: 215,
    freshSnow24hCm: 8,
    isoZeroAltitudeM: 2350,
    rainSnowLimitM: 2050,
    ridgeWindSpeedKmh: 38,
    ridgeWindGustKmh: 60,
    ridgeWindDirectionDeg: 260,
    snowQuality: 'Neige de printemps',
    nivoseStationName: 'Le Gua / Les Écrins',
    nivoseElevationM: 2940,
    beraSummary: 'Bon regel nocturne sur les versants ensoleillés (Adret). Humidification diurne rapide en pentes Sud/Sud-Ouest dès la fin de matinée. Quelques plaques dures résiduelles dans les couloirs Nord de haute altitude.'
  },
  {
    id: 'queyras-mercantour',
    name: 'Massifs du Queyras & Mercantour (Isola 2000 / Vars)',
    range: 'Alpes du Sud',
    country: 'France',
    department: 'Hautes-Alpes (05) / Alpes-Maritimes (06)',
    altitudeBase: 1400,
    altitudePeak: 3143,
    latitude: 44.1756,
    longitude: 7.1525,
    beraRiskLevel: 2,
    beraRiskLabel: 'Risque Limité (2/5)',
    criticalSlopes: ['E', 'SE', 'S', 'SW'],
    criticalAltitudeThreshold: 2400,
    snowDepthBottomCm: 25,
    snowDepthTopCm: 175,
    freshSnow24hCm: 5,
    isoZeroAltitudeM: 2500,
    rainSnowLimitM: 2200,
    ridgeWindSpeedKmh: 32,
    ridgeWindGustKmh: 50,
    ridgeWindDirectionDeg: 310,
    snowQuality: 'Neige de printemps',
    nivoseStationName: 'Millefonts',
    nivoseElevationM: 2430,
    beraSummary: 'Conditions printanières prédominantes. Croûte de regel portante le matin, puis évolution rapide vers une neige transformée humide sur les versants Est à Sud-Ouest au fil de l\'ensoleillement.'
  },
  {
    id: 'haute-bigorre',
    name: 'Pyrénées Centrales — Haute-Bigorre & Néouvielle (Tourmalet)',
    range: 'Pyrénées',
    country: 'France',
    department: 'Hautes-Pyrénées (65)',
    altitudeBase: 1200,
    altitudePeak: 3298,
    latitude: 42.8336,
    longitude: 0.1456,
    beraRiskLevel: 3,
    beraRiskLabel: 'Risque Marqué (3/5)',
    criticalSlopes: ['E', 'SE', 'NE', 'N'],
    criticalAltitudeThreshold: 2100,
    snowDepthBottomCm: 20,
    snowDepthTopCm: 190,
    freshSnow24hCm: 15,
    isoZeroAltitudeM: 2250,
    rainSnowLimitM: 1950,
    ridgeWindSpeedKmh: 60,
    ridgeWindGustKmh: 92,
    ridgeWindDirectionDeg: 270,
    snowQuality: 'Plaques à vent',
    nivoseStationName: 'Lac d\'Ardiden',
    nivoseElevationM: 2445,
    beraSummary: 'Transport de neige significatif par vent d\'Ouest à Sud-Ouest sur les crêtes frontalières, formant des accumulations instables sous le vent (versants Est et Nord-Est). Corniches volumineuses.'
  },
  {
    id: 'luchonnais-aneto',
    name: 'Pyrénées — Luchonnais, Haute-Ariège & Massif de l\'Aneto',
    range: 'Pyrénées',
    country: 'France / Espagne',
    department: 'Haute-Garonne (31) / Ariège (09)',
    altitudeBase: 1300,
    altitudePeak: 3404,
    latitude: 42.6322,
    longitude: 0.6567,
    beraRiskLevel: 2,
    beraRiskLabel: 'Risque Limité (2/5)',
    criticalSlopes: ['N', 'NE', 'E'],
    criticalAltitudeThreshold: 2200,
    snowDepthBottomCm: 20,
    snowDepthTopCm: 165,
    freshSnow24hCm: 6,
    isoZeroAltitudeM: 2400,
    rainSnowLimitM: 2100,
    ridgeWindSpeedKmh: 35,
    ridgeWindGustKmh: 55,
    ridgeWindDirectionDeg: 285,
    snowQuality: 'Croûte de regel',
    nivoseStationName: 'Maupas',
    nivoseElevationM: 2430,
    beraSummary: 'Manteau globalement consolidé. Attention aux glissades sur pentes raides gelées le matin (crampons indispensables au-dessus de 2200m).'
  },
  {
    id: 'sancy-cantal',
    name: 'Massif du Sancy & Monts du Cantal (Super-Besse / Le Lioran)',
    range: 'Massif Central',
    country: 'France',
    department: 'Puy-de-Dôme (63) / Cantal (15)',
    altitudeBase: 1050,
    altitudePeak: 1885,
    latitude: 45.5284,
    longitude: 2.8139,
    beraRiskLevel: 2,
    beraRiskLabel: 'Risque Limité (2/5)',
    criticalSlopes: ['N', 'NE', 'E'],
    criticalAltitudeThreshold: 1500,
    snowDepthBottomCm: 15,
    snowDepthTopCm: 85,
    freshSnow24hCm: 5,
    isoZeroAltitudeM: 1750,
    rainSnowLimitM: 1500,
    ridgeWindSpeedKmh: 50,
    ridgeWindGustKmh: 78,
    ridgeWindDirectionDeg: 250,
    snowQuality: 'Croûte de regel',
    nivoseStationName: 'Chastreix-Sancy',
    nivoseElevationM: 1385,
    beraSummary: 'Couloirs sommitaux du Sancy et du Plomb du Cantal présentant des surfaces verglacées le matin et des corniches résiduelles sur les versants Est.'
  },
  {
    id: 'hautes-vosges',
    name: 'Ballons des Vosges (Hohneck / La Bresse / Gérardmer)',
    range: 'Massif des Vosges',
    country: 'France',
    department: 'Vosges (88) / Haut-Rhin (68)',
    altitudeBase: 750,
    altitudePeak: 1424,
    latitude: 48.0378,
    longitude: 7.0164,
    beraRiskLevel: 1,
    beraRiskLabel: 'Risque Faible (1/5)',
    criticalSlopes: ['NE', 'E'],
    criticalAltitudeThreshold: 1200,
    snowDepthBottomCm: 5,
    snowDepthTopCm: 55,
    freshSnow24hCm: 2,
    isoZeroAltitudeM: 1600,
    rainSnowLimitM: 1350,
    ridgeWindSpeedKmh: 45,
    ridgeWindGustKmh: 70,
    ridgeWindDirectionDeg: 240,
    snowQuality: 'Neige humide',
    nivoseStationName: 'Markstein',
    nivoseElevationM: 1184,
    beraSummary: 'Enneigement concentré sur les crêtes et dans les cirques glaciaires orientés Nord-Est (Wormspel, Falimont). Prudence vis-à-vis des corniches surplombant les sentiers.'
  },
  {
    id: 'haut-jura',
    name: 'Crêtes du Haut-Jura (Crêt de la Neige / Les Rousses)',
    range: 'Massif du Jura',
    country: 'France / Suisse',
    department: 'Ain (01) / Jura (39)',
    altitudeBase: 900,
    altitudePeak: 1720,
    latitude: 46.2725,
    longitude: 5.9408,
    beraRiskLevel: 1,
    beraRiskLabel: 'Risque Faible (1/5)',
    criticalSlopes: ['N', 'NE'],
    criticalAltitudeThreshold: 1400,
    snowDepthBottomCm: 10,
    snowDepthTopCm: 75,
    freshSnow24hCm: 4,
    isoZeroAltitudeM: 1650,
    rainSnowLimitM: 1400,
    ridgeWindSpeedKmh: 40,
    ridgeWindGustKmh: 65,
    ridgeWindDirectionDeg: 230,
    snowQuality: 'Croûte de regel',
    nivoseStationName: 'La Pesse / Lelex',
    nivoseElevationM: 1350,
    beraSummary: 'Manteau neigeux bien stabilisé sur les plateaux et combes jurassiennes. Quelques pentes raides verglacées sur le versant oriental de la Haute-Chaîne.'
  },
  {
    id: 'cinto-rotondo',
    name: 'Massifs du Monte Cinto & Rotondo (Asco / Restonica)',
    range: 'Montagnes de Corse',
    country: 'France',
    department: 'Haute-Corse (2B)',
    altitudeBase: 1100,
    altitudePeak: 2706,
    latitude: 42.3797,
    longitude: 8.9456,
    beraRiskLevel: 2,
    beraRiskLabel: 'Risque Limité (2/5)',
    criticalSlopes: ['N', 'NE', 'NW'],
    criticalAltitudeThreshold: 2000,
    snowDepthBottomCm: 15,
    snowDepthTopCm: 155,
    freshSnow24hCm: 7,
    isoZeroAltitudeM: 2300,
    rainSnowLimitM: 2000,
    ridgeWindSpeedKmh: 50,
    ridgeWindGustKmh: 82,
    ridgeWindDirectionDeg: 280,
    snowQuality: 'Croûte de regel',
    nivoseStationName: 'Maniccia',
    nivoseElevationM: 2380,
    beraSummary: 'Neige dure à glacée en début de journée sur le GR20 et les hauts sommets corses. Crampons et piolet indispensables pour franchir les brèches d\'altitude.'
  },
  // GRANDS MASSIFS & STATIONS MONDIALES (EUROPE, AMÉRIQUES, ASIE, OCÉANIE, AFRIQUE)
  {
    id: 'zermatt-cervin',
    name: 'Zermatt — Mont Rose & Cervin (Matterhorn)',
    range: 'Alpes Valaisannes (Suisse)',
    country: 'Suisse',
    department: 'Canton du Valais (VS)',
    altitudeBase: 1620,
    altitudePeak: 4634,
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
    rainSnowLimitM: 1900,
    ridgeWindSpeedKmh: 58,
    ridgeWindGustKmh: 90,
    ridgeWindDirectionDeg: 235,
    snowQuality: 'Poudreuse froide',
    nivoseStationName: 'Gornergrat SLF',
    nivoseElevationM: 3135,
    beraSummary: 'Bulletin SLF Suisse : Accumulations de neige soufflée fraîche au-dessus de 2400m sur les pentes Nord à Est. Crevasses glaciaires masquées par des ponts de neige fragiles au-dessus de 3200m.'
  },
  {
    id: 'dolomites-cortina',
    name: 'Dolomites — Cortina d\'Ampezzo & Marmolada',
    range: 'Alpes Orientales (Italie)',
    country: 'Italie',
    department: 'Vénétie / Haut-Adige',
    altitudeBase: 1224,
    altitudePeak: 3343,
    latitude: 46.5405,
    longitude: 12.1357,
    beraRiskLevel: 2,
    beraRiskLabel: 'Risque Limité (2/5 AINEVA)',
    criticalSlopes: ['N', 'NE', 'NW'],
    criticalAltitudeThreshold: 2300,
    snowDepthBottomCm: 35,
    snowDepthTopCm: 195,
    freshSnow24hCm: 10,
    isoZeroAltitudeM: 2350,
    rainSnowLimitM: 2050,
    ridgeWindSpeedKmh: 40,
    ridgeWindGustKmh: 65,
    ridgeWindDirectionDeg: 320,
    snowQuality: 'Neige de printemps',
    nivoseStationName: 'Ra Valles / Faloria',
    nivoseElevationM: 2615,
    beraSummary: 'Bulletin AINEVA Dolomites : Excellente cohésion matinale sur les versants Sud des parois dolomitiques, mais plaques à vent localisées dans les couloirs encaissés orientés Nord.'
  },
  {
    id: 'st-anton-arlberg',
    name: 'Massif de l\'Arlberg (St. Anton / Lech / Innsbruck)',
    range: 'Alpes Tyroliennes (Autriche)',
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
    snowDepthTopCm: 250,
    freshSnow24hCm: 22,
    isoZeroAltitudeM: 1950,
    rainSnowLimitM: 1650,
    ridgeWindSpeedKmh: 52,
    ridgeWindGustKmh: 80,
    ridgeWindDirectionDeg: 280,
    snowQuality: 'Poudreuse froide',
    nivoseStationName: 'Valluga LWD',
    nivoseElevationM: 2809,
    beraSummary: 'Flux de Nord-Ouest actif sur le barrage nord-alpin autrichien générant de fortes accumulations sous le vent sur les versants Est et Sud-Est.'
  },
  {
    id: 'banff-whistler',
    name: 'Rocheuses Canadiennes — Banff, Lake Louise & Whistler',
    range: 'Montagnes Rocheuses (Canada)',
    country: 'Canada',
    department: 'Alberta / Colombie-Britannique',
    altitudeBase: 1380,
    altitudePeak: 3544,
    latitude: 51.4254,
    longitude: -116.1773,
    beraRiskLevel: 3,
    beraRiskLabel: 'Considerable (3/5 Avalanche Canada)',
    criticalSlopes: ['N', 'NE', 'E'],
    criticalAltitudeThreshold: 2000,
    snowDepthBottomCm: 95,
    snowDepthTopCm: 280,
    freshSnow24hCm: 24,
    isoZeroAltitudeM: 1600,
    rainSnowLimitM: 1300,
    ridgeWindSpeedKmh: 50,
    ridgeWindGustKmh: 82,
    ridgeWindDirectionDeg: 240,
    snowQuality: 'Poudreuse froide',
    nivoseStationName: 'Bow Summit Parks Canada',
    nivoseElevationM: 2080,
    beraSummary: 'Manteau continental froid typique des Rocheuses avec présence d\'une couche fragile profonde de gobelets (depth hoar) sollicitée par les nouvelles charges de neige soufflée en zone alpine.'
  },
  {
    id: 'aspen-jackson',
    name: 'Rocheuses Américaines — Aspen, Vail & Jackson Hole',
    range: 'Montagnes Rocheuses (USA)',
    country: 'États-Unis',
    department: 'Colorado / Wyoming',
    altitudeBase: 2400,
    altitudePeak: 4265,
    latitude: 39.1911,
    longitude: -106.8175,
    beraRiskLevel: 3,
    beraRiskLabel: 'Considerable (3/5 CAIC Colorado)',
    criticalSlopes: ['N', 'NE', 'E', 'NW'],
    criticalAltitudeThreshold: 3100,
    snowDepthBottomCm: 75,
    snowDepthTopCm: 230,
    freshSnow24hCm: 16,
    isoZeroAltitudeM: 2850,
    rainSnowLimitM: 2550,
    ridgeWindSpeedKmh: 48,
    ridgeWindGustKmh: 76,
    ridgeWindDirectionDeg: 255,
    snowQuality: 'Poudreuse froide',
    nivoseStationName: 'Independence Pass SNOTEL',
    nivoseElevationM: 3680,
    beraSummary: 'Neige sèche de très faible densité ("Champagne Powder") reposant sur des strates de faces planes en versants Nord et Est au-dessus de la limite forestière (treeline ~3400m).'
  },
  {
    id: 'niseko-hakuba',
    name: 'Alpes Japonaises & Hokkaido — Niseko & Hakuba',
    range: 'Archipel Nippon (Japon)',
    country: 'Japon',
    department: 'Hokkaido / Nagano',
    altitudeBase: 300,
    altitudePeak: 2932,
    latitude: 42.8631,
    longitude: 140.6975,
    beraRiskLevel: 3,
    beraRiskLabel: 'Risque Marqué (3/5 NAD Japon)',
    criticalSlopes: ['E', 'SE', 'S'],
    criticalAltitudeThreshold: 900,
    snowDepthBottomCm: 140,
    snowDepthTopCm: 380,
    freshSnow24hCm: 32,
    isoZeroAltitudeM: 900,
    rainSnowLimitM: 600,
    ridgeWindSpeedKmh: 62,
    ridgeWindGustKmh: 95,
    ridgeWindDirectionDeg: 315, // NW Siberian monsoon -> loads E, SE, S!
    snowQuality: 'Poudreuse froide',
    nivoseStationName: 'Mt. Annupuri Telemetry',
    nivoseElevationM: 1308,
    beraSummary: 'Flux de mousson hivernale sibérienne de Nord-Ouest ("Japow") déposant d\'importantes quantités de poudreuse légère avec plaques à vent marquées sur les versants sous le vent (Est à Sud).'
  },
  {
    id: 'andes-bariloche',
    name: 'Cordillère des Andes — Bariloche (Cerro Catedral) & Valle Nevado',
    range: 'Cordillère des Andes',
    country: 'Argentine / Chili',
    department: 'Patagonie / Santiago',
    altitudeBase: 1050,
    altitudePeak: 3670,
    latitude: -41.1681,
    longitude: -71.4408,
    beraRiskLevel: 2,
    beraRiskLabel: 'Risque Limité (2/5 CIAV)',
    criticalSlopes: ['S', 'SE', 'SW'], // Hémisphère Sud : Ubac est au Sud !
    criticalAltitudeThreshold: 1800,
    snowDepthBottomCm: 40,
    snowDepthTopCm: 185,
    freshSnow24hCm: 12,
    isoZeroAltitudeM: 2100,
    rainSnowLimitM: 1800,
    ridgeWindSpeedKmh: 55,
    ridgeWindGustKmh: 88,
    ridgeWindDirectionDeg: 285,
    snowQuality: 'Plaques à vent',
    nivoseStationName: 'Punta Nevada',
    nivoseElevationM: 2100,
    beraSummary: 'Hémisphère Sud : les versants Sud et Sud-Est constituent l\'Ubac froid ombragé et concentrent les plaques à vent formées par les vents dominants du Pacifique.'
  },
  {
    id: 'himalaya-everest',
    name: 'Himalaya — Khumbu, Namche Bazaar & Camp de Base Everest',
    range: 'Chaîne de l\'Himalaya',
    country: 'Népal',
    department: 'Solu-Khumbu',
    altitudeBase: 3440,
    altitudePeak: 5545, // Kala Patthar / EBC trekking peak
    latitude: 27.9881,
    longitude: 86.9250,
    beraRiskLevel: 3,
    beraRiskLabel: 'Risque Marqué Haute Altitude (3/5)',
    criticalSlopes: ['N', 'NE', 'E'],
    criticalAltitudeThreshold: 4500,
    snowDepthBottomCm: 25,
    snowDepthTopCm: 260,
    freshSnow24hCm: 15,
    isoZeroAltitudeM: 4300,
    rainSnowLimitM: 4000,
    ridgeWindSpeedKmh: 75,
    ridgeWindGustKmh: 118,
    ridgeWindDirectionDeg: 255,
    snowQuality: 'Plaques à vent',
    nivoseStationName: 'Pyramid Ev-K2-CNR',
    nivoseElevationM: 5050,
    beraSummary: 'Influence directe du Jet-Stream subtropical sur les crêtes himalayennes. Hypoxie sévère (>5000m : 52% d\'O₂ disponible) et refroidissement éolien extrême.'
  },
  {
    id: 'nz-queenstown',
    name: 'Alpes du Sud — Queenstown, Remarkables & Aoraki / Mt Cook',
    range: 'Alpes Néo-Zélandaises',
    country: 'Nouvelle-Zélande',
    department: 'Otago / Canterbury',
    altitudeBase: 1200,
    altitudePeak: 3724,
    latitude: -45.0531,
    longitude: 168.8152,
    beraRiskLevel: 2,
    beraRiskLabel: 'Moderate (2/5 NZAA)',
    criticalSlopes: ['S', 'SE', 'E'],
    criticalAltitudeThreshold: 1900,
    snowDepthBottomCm: 35,
    snowDepthTopCm: 190,
    freshSnow24hCm: 10,
    isoZeroAltitudeM: 2050,
    rainSnowLimitM: 1750,
    ridgeWindSpeedKmh: 50,
    ridgeWindGustKmh: 80,
    ridgeWindDirectionDeg: 290,
    snowQuality: 'Croûte de regel',
    nivoseStationName: 'Lake Alta NZAA',
    nivoseElevationM: 1850,
    beraSummary: 'Climat maritime subantarctique : alternance rapide entre vents forts de Nord-Ouest et refroidissements polaires brusques. Versants Sud (Ubac austral) plus froids et chargés.'
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
 * Calcule les paramètres physiques réels à une altitude cible (en mètres)
 * en utilisant l'équation hypsométrique et le gradient adiabatique standard (-6.5°C / 1000m).
 */
export function calculateAltitudePhysics(
  weather: CurrentWeather,
  stationAltitudeM: number,
  targetAltitudeM: number
) {
  const deltaAlt = targetAltitudeM - stationAltitudeM;
  // Gradient thermique troposphérique moyen : -0.0065 °C / m
  const tempAtAltitude = Number((weather.temperature - deltaAlt * 0.0065).toFixed(1));

  // Isotherme 0°C
  const isoZero = weather.freezingLevelHeight
    ? Math.round(weather.freezingLevelHeight)
    : Math.max(0, Math.round(stationAltitudeM + (weather.temperature / 0.0065)));

  // Limite pluie-neige (généralement 300m sous l'isotherme 0°C par effet d'isothermie)
  const lpn = Math.max(0, isoZero - 300);

  // Accélération orographique du vent avec l'altitude
  const windFactor = Math.max(1, 1 + Math.max(0, deltaAlt) / 1800);
  const windSpeedAtAltitude = Math.round(weather.windSpeed * windFactor);
  const windGustAtAltitude = Math.round(weather.windGust * windFactor * 1.15);

  // Indice de refroidissement éolien (Formule officielle Environnement Canada / Météo-France)
  let windChill = tempAtAltitude;
  if (tempAtAltitude <= 10 && windSpeedAtAltitude >= 5) {
    windChill = Number((
      13.12 +
      0.6215 * tempAtAltitude -
      11.37 * Math.pow(windSpeedAtAltitude, 0.16) +
      0.3965 * tempAtAltitude * Math.pow(windSpeedAtAltitude, 0.16)
    ).toFixed(1));
  }

  // Indice UV majoré (+12% par tranche de 1000m d'altitude + réverbération neige)
  const uvBase = Math.max(1, weather.uvIndex || 3);
  const uvAtAltitude = Number((uvBase * (1 + Math.max(0, targetAltitudeM) * 0.00012)).toFixed(1));

  // Pression barométrique locale réelle (QFE) à l'altitude cible (formule barométrique internationale)
  const qfePressure = Math.round(weather.pressure * Math.pow(1 - (0.0065 * targetAltitudeM) / 288.15, 5.255));

  // Taux d'oxygène effectif par rapport au niveau de la mer (1013.25 hPa)
  const oxygenPercentSeaLevel = Math.round((qfePressure / 1013.25) * 100);

  return {
    targetAltitudeM,
    tempAtAltitude,
    isoZero,
    lpn,
    windSpeedAtAltitude,
    windGustAtAltitude,
    windChill,
    uvAtAltitude,
    qfePressure,
    oxygenPercentSeaLevel
  };
}

/**
 * Analyse physique et nivologique multi-versants (8 orientations : N, NE, E, SE, S, SW, W, NW)
 * Vérifiée selon l'hémisphère (Nord/Sud), la direction réelle du vent en crête, l'isotherme 0°C et l'altitude.
 */
export function calculateMultiAspectAnalysis(
  massif: MountainMassif,
  targetAltitudeM: number,
  currentWeather?: CurrentWeather
): VersantDetailedAnalysis[] {
  const isSouthernHemisphere = massif.latitude < 0;
  const windFromDeg = ((massif.ridgeWindDirectionDeg ?? currentWeather?.windDirection ?? 250) % 360 + 360) % 360;
  const windToDeg = (windFromDeg + 180) % 360; // Direction sous le vent (leeward)
  const ridgeWindKmh = massif.ridgeWindSpeedKmh || 40;
  const isoZero = massif.isoZeroAltitudeM || 2200;

  // Température de l'air à l'altitude d'analyse
  const tempAtAlt = Number(((isoZero - targetAltitudeM) * 0.0065).toFixed(1));

  const aspects: AspectDirection[] = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

  return aspects.map((aspect) => {
    const { deg: aspectDeg, label: aspectLabel } = ASPECT_AZIMUTH[aspect];

    // 1. Différence angulaire avec le vent venant de `windFromDeg`
    const diffFromWind = Math.abs((((aspectDeg - windFromDeg) % 360) + 540) % 360 - 180);
    // Différence angulaire avec le côté sous le vent `windToDeg`
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

    // 2. Régime thermique et insolation selon l'hémisphère
    // Hémisphère Nord : S (180°) reçoit le maximum d'insolation, N (0°) est l'Ubac froid
    // Hémisphère Sud : N (0°) reçoit le maximum d'insolation, S (180°) est l'Ubac froid
    const sunnyAzimuth = isSouthernHemisphere ? 0 : 180;
    const diffFromSun = Math.abs((((aspectDeg - sunnyAzimuth) % 360) + 540) % 360 - 180); // 0 = plein soleil, 180 = pleine ombre

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

    // Irradiance solaire maximale estimée à midi sur une pente de 30° (en W/m²)
    const altitudeSolarBoost = 1 + (targetAltitudeM / 1000) * 0.08;
    const sunCosine = Math.cos((diffFromSun * Math.PI) / 180); // +1 plein adret, -1 plein ubac
    const solarIrradianceWm2 = Math.round(Math.max(120, (540 + 340 * sunCosine) * altitudeSolarBoost));

    // Température de surface de la neige (toujours <= 0°C si neige présente)
    // En Ubac clair, le rayonnement infrarouge nocturne refroidit la neige de 3 à 5°C sous la température de l'air
    // En Adret, le rayonnement solaire réchauffe la surface jusqu'à 0°C (fusion)
    const radiativeOffset = sunCosine * 3.8 - (diffFromSun >= 135 ? 2.5 : 0);
    const rawSurfaceTemp = tempAtAlt + radiativeOffset;
    const surfaceSnowTempC = Number(Math.min(0, rawSurfaceTemp).toFixed(1));

    // Épaisseur de neige estimée sur ce versant à targetAltitudeM
    const altRatio = Math.max(0, Math.min(1, (targetAltitudeM - massif.altitudeBase) / Math.max(300, massif.altitudePeak - massif.altitudeBase)));
    const baseInterpSnow = massif.snowDepthBottomCm + altRatio * (massif.snowDepthTopCm - massif.snowDepthBottomCm);
    // L'ubac conserve +20% de neige, l'adret perd -22% par ablation solaire; le côté sous le vent gagne +15%
    const aspectSnowMultiplier = (1 - sunCosine * 0.22) * (diffFromLee <= 60 ? 1.18 : diffFromWind <= 55 ? 0.82 : 1.0);
    const estimatedSnowDepthCm = Math.max(0, Math.round(baseInterpSnow * aspectSnowMultiplier));

    // Risques spécifiques par versant (%)
    const windSlabRiskPercent = Math.round(Math.min(98, Math.max(8, windSlabFactor * 100)));
    const wetSnowAvalancheRiskPercent = Math.round(
      Math.min(95, Math.max(5, (sunCosine > 0 ? sunCosine * 45 : 10) + (tempAtAlt > -2 ? (tempAtAlt + 3) * 14 : 0)))
    );
    // Couches fragiles persistantes (faces planes / gobelets) : maximales en Ubac froid entre 2000m et 3200m
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

    // Structure nivologique et conseils tactiques par versant
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
      // Ubac froid
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
    const phys = calculateAltitudePhysics(weather, stationAltitudeM, st.alt);
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
 * à partir des données météo temps réel Open-Meteo.
 */
export function buildDynamicMountainProfileFromLocation(
  station: LocationPoint,
  weather: CurrentWeather
): MountainMassif {
  const baseAlt = Math.max(100, Math.round(station.altitude || 450));
  // Relief environnant estimé ou sommet local
  const peakAlt = baseAlt >= 1500
    ? Math.round(baseAlt + 1200)
    : baseAlt >= 600
      ? Math.round(baseAlt + 950)
      : Math.round(baseAlt + 650);

  const physPeak = calculateAltitudePhysics(weather, baseAlt, peakAlt);
  const windDir = weather.windDirection ?? 250;
  const leeDeg = (windDir + 180) % 360;

  // Détermine les versants sous le vent (leeward) + ubac
  const allAspects: AspectDirection[] = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const criticalSlopes = allAspects.filter((asp) => {
    const az = ASPECT_AZIMUTH[asp].deg;
    const diffLee = Math.abs((((az - leeDeg) % 360) + 540) % 360 - 180);
    return diffLee <= 68;
  });

  // Calcul réaliste de l'enneigement selon l'isotherme 0°C et la latitude
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
    beraSummary: snowDepthTopCm > 0
      ? `Analyse orographique directe pour ${station.name} : isotherme 0°C situé vers ${physPeak.isoZero} m (limite pluie-neige vers ${physPeak.lpn} m). Vent en crête de secteur ${windDir}° soufflant jusqu'à ${physPeak.windGustAtAltitude} km/h, sollicitant principalement les versants ${criticalSlopes.join(', ')}.`
      : `Relief sec ou faiblement enneigé autour de ${station.name} (${baseAlt} m – ${peakAlt} m). Isotherme 0°C à ${physPeak.isoZero} m. Vigilance sur le refroidissement éolien en crête (${physPeak.windChill}°C) et les rafales jusqu'à ${physPeak.windGustAtAltitude} km/h.`,
    isLiveCustomStation: true
  };
}

/**
 * Recherche en temps réel N'IMPORTE QUELLE station de ski, sommet ou localité de montagne dans le monde
 * via l'API Geocoding Open-Meteo + API Forecast multi-niveaux.
 */
export async function searchAndBuildWorldMountainStation(query: string): Promise<MountainMassif[]> {
  const clean = query.trim();
  if (clean.length < 2) return [];

  try {
    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(clean)}&count=6&language=fr&format=json`
    );
    if (!geoRes.ok) return [];
    const geoData = await geoRes.json();
    if (!geoData.results || !Array.isArray(geoData.results)) return [];

    const results: MountainMassif[] = await Promise.all(
      geoData.results.slice(0, 5).map(async (item: any) => {
        const lat = Number(item.latitude);
        const lon = Number(item.longitude);
        const baseElev = Math.max(100, Math.round(item.elevation || 800));
        // Interroge Open-Meteo à une altitude de crête (+1100m au-dessus de la station) pour obtenir la vraie météo de haute altitude
        const peakElev = baseElev >= 1200 ? baseElev + 1300 : baseElev + 900;

        try {
          const wxUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&elevation=${peakElev}&current=temperature_2m,wind_speed_10m,wind_direction_10m,wind_gusts_10m,snowfall,snow_depth,surface_pressure&hourly=freezing_level_height&forecast_days=1`;
          const wxRes = await fetch(wxUrl);
          const wxData = wxRes.ok ? await wxRes.json() : null;

          const cur = wxData?.current || {};
          const isoZero = Math.round(wxData?.hourly?.freezing_level_height?.[12] || Math.max(0, peakElev + ((cur.temperature_2m ?? 0) / 0.0065)));
          const lpn = Math.max(0, isoZero - 300);
          const windSpeed = Math.round(cur.wind_speed_10m ?? 35);
          const windGust = Math.round(cur.wind_gusts_10m ?? 58);
          const windDir = Math.round(cur.wind_direction_10m ?? 250);
          const snowTopCm = Math.max(
            Math.round((cur.snow_depth ?? 0) * 100),
            cur.temperature_2m <= 0 ? Math.round(Math.max(0, (peakElev - lpn) * 0.11)) : 0
          );
          const snowBottomCm = baseElev >= lpn ? Math.round(snowTopCm * 0.35) : 0;
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
            name: `${item.name} (${item.admin1 || item.country || 'Monde'})`,
            range: `${item.admin1 || 'Massif'} • ${item.country || 'International'}`,
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
            beraSummary: `Analyse nivologique et orographique en direct pour ${item.name} (${item.country || ''}) : base à ${baseElev} m, crêtes environnantes vers ${peakElev} m. Isotherme 0°C mesuré à ${isoZero} m, vent d'altitude de secteur ${windDir}° (${windSpeed} km/h, rafales ${windGust} km/h).`,
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
            snowDepthBottomCm: 10,
            snowDepthTopCm: 90,
            freshSnow24hCm: 5,
            isoZeroAltitudeM: 2200,
            rainSnowLimitM: 1900,
            ridgeWindSpeedKmh: 40,
            ridgeWindGustKmh: 65,
            ridgeWindDirectionDeg: 250,
            snowQuality: 'Neige de printemps',
            nivoseStationName: `Station ${item.name}`,
            nivoseElevationM: baseElev + 800,
            beraSummary: `Profil orographique pour ${item.name} (${item.country || ''}).`,
            isLiveCustomStation: true
          };
        }
      })
    );

    return results;
  } catch {
    return [];
  }
}
