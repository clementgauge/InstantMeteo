export type DegradationSeverity = 'VERTE' | 'JAUNE' | 'ORANGE' | 'ROUGE';
export type DegradationType = 
  | 'front_froid' 
  | 'front_chaud' 
  | 'front_occlus' 
  | 'orages_grains' 
  | 'episode_cevenol' 
  | 'tempete_vent' 
  | 'neige_verglas' 
  | 'inversion_brouillard' 
  | 'canicule_dome' 
  | 'vague_froid';

export interface RadarEchoCell {
  id: string;
  name: string;
  coordinate: [number, number];
  reflectivityDbz: number; // e.g. 58 dBZ
  intensityMmH: number;    // e.g. 60 mm/h
  echoType: 'GRELE' | 'ORAGE_VIOLENT' | 'PLUIE_TORRENTIELLE' | 'PLUIE_FORTE' | 'AVERSES_TRAINE' | 'NEIGE';
  movementDirection: string; // e.g. 'NE (65 km/h)'
  locationName: string;
  department: string;
}

export interface WeatherDegradationEvent {
  id: string;
  name: string;
  phenomenonLabel: string;
  phenomenonIcon: string;
  type: DegradationType;
  severity: DegradationSeverity;
  headline: string;
  description: string;
  arrivalEstimate: string;
  peakEstimate: string;
  endEstimate: string;
  speedKmH: number;
  trajectoryAngleDeg: number;
  trajectoryLabel: string;
  impactedZoneName: string;
  impactedDepartments: string[];
  impactedRegions: string[];
  keyMetrics: {
    maxGustsKmH?: number;
    rainAccumulation24hMm?: number;
    hourlyRainIntensityMm?: number;
    temperatureDropC?: number;
    lightningIntensityPerMin?: number;
    snowRainLimitDropMeters?: number;
    hailDiameterCm?: number;
    capeInstabilityJkg?: number;
  };
  coordinates: [number, number][]; // Line path of front axis
  impactZonePolygon: [number, number][]; // Closed polygon for the exact impacted area
  centerCoordinate: [number, number];
  safetyGuidelines: string[];
  radarEchoCells: RadarEchoCell[];
}

export const OFFICIAL_RADAR_ECHO_CELLS: RadarEchoCell[] = [
  {
    id: 'cell-bdx-01',
    name: 'Supercellule SC-1',
    coordinate: [44.95, -0.42],
    reflectivityDbz: 58,
    intensityMmH: 65,
    echoType: 'GRELE',
    movementDirection: 'Nord-Est (60 km/h)',
    locationName: 'Nord Libournais / Gironde',
    department: '33'
  },
  {
    id: 'cell-lim-02',
    name: 'Cellule Convective Ligne Grains',
    coordinate: [45.75, 1.45],
    reflectivityDbz: 54,
    intensityMmH: 48,
    echoType: 'ORAGE_VIOLENT',
    movementDirection: 'Nord-Est (65 km/h)',
    locationName: 'Haute-Vienne / Limousin',
    department: '87'
  },
  {
    id: 'cell-cev-03',
    name: 'Noyau Précipitant Cévenol V-Shape',
    coordinate: [44.22, 3.88],
    reflectivityDbz: 52,
    intensityMmH: 55,
    echoType: 'PLUIE_TORRENTIELLE',
    movementDirection: 'Stationnaire / Régénération Sud',
    locationName: 'Massif de l\'Aigoual & Gardons',
    department: '30'
  },
  {
    id: 'cell-manche-04',
    name: 'Grain Froid Frontal',
    coordinate: [49.65, -1.45],
    reflectivityDbz: 44,
    intensityMmH: 22,
    echoType: 'PLUIE_FORTE',
    movementDirection: 'Est-Sud-Est (70 km/h)',
    locationName: 'Nord Cotentin / Cherbourg',
    department: '50'
  },
  {
    id: 'cell-alp-05',
    name: 'Écho Neigeux Orographique',
    coordinate: [45.92, 6.86],
    reflectivityDbz: 36,
    intensityMmH: 15,
    echoType: 'NEIGE',
    movementDirection: 'Sud-Est (35 km/h)',
    locationName: 'Massif du Mont-Blanc / Chamonix',
    department: '74'
  }
];

export const ACTIVE_WEATHER_DEGRADATIONS: WeatherDegradationEvent[] = [
  {
    id: 'front-orages-sud-ouest-nord-est',
    name: 'Axe Orageux Violent & Ligne de Grains',
    phenomenonLabel: 'Orages Violents & Chutes de Grêle',
    phenomenonIcon: '⚡',
    type: 'orages_grains',
    severity: 'ORANGE',
    headline: 'Dégradation orageuse active du Sud-Ouest vers le Massif Central et le Nord-Est',
    description: 'Une convergence dynamique entre une masse d\'air saharienne très chaude et une goutte froide atlantique engendre une ligne de grains multicellulaires violents avec risque de fortes chutes de grêle (2 à 4 cm), rafales descendantes jusqu\'à 105 km/h et intensités pluvieuses de 30 à 50 mm/h.',
    arrivalEstimate: 'En cours (Progression constante)',
    peakEstimate: '17h00 - 22h30',
    endEstimate: '03h00 (Évacuation vers l\'Allemagne)',
    speedKmH: 65,
    trajectoryAngleDeg: 45,
    trajectoryLabel: 'Sud-Ouest (Aquitaine) ➔ Massif Central / Bourgogne ➔ Grand Est / Lorraine',
    impactedZoneName: 'Bassin Aquitain, Limousin, Auvergne, Bourgogne et Grand-Est',
    impactedDepartments: ['33', '47', '24', '19', '87', '23', '63', '03', '71', '21', '52', '88', '54', '57', '67'],
    impactedRegions: ['Nouvelle-Aquitaine', 'Auvergne-Rhône-Alpes', 'Bourgogne-Franche-Comté', 'Grand Est'],
    keyMetrics: {
      maxGustsKmH: 105,
      rainAccumulation24hMm: 65,
      hourlyRainIntensityMm: 45,
      temperatureDropC: 10.5,
      lightningIntensityPerMin: 140,
      hailDiameterCm: 3.5,
      capeInstabilityJkg: 2400
    },
    coordinates: [
      [43.8, -1.2],
      [44.7, 0.3],
      [45.6, 1.8],
      [46.8, 3.8],
      [47.9, 5.5],
      [49.1, 7.2]
    ],
    // Clear closed polygon defining the exact alert zone
    impactZonePolygon: [
      [43.4, -1.5],
      [44.2, -0.8],
      [45.2, 0.5],
      [46.4, 2.8],
      [47.6, 4.8],
      [49.4, 6.5],
      [49.2, 7.8],
      [47.8, 6.8],
      [46.5, 4.5],
      [45.2, 2.5],
      [44.0, 0.8],
      [43.3, -0.4],
      [43.4, -1.5]
    ],
    centerCoordinate: [46.2, 2.8],
    safetyGuidelines: [
      'Mettez à l\'abri vos véhicules et objets sensibles au vent et à la grêle.',
      'Évitez d\'utiliser le téléphone filaire et les appareils électriques durant les orages.',
      'Ne vous engagez en aucun cas sur une voie immergée ou à proximité des cours d\'eau en crue.',
      'En camping ou en montagne, regagnez un abri solide avant le début des premières rafales.'
    ],
    radarEchoCells: [
      OFFICIAL_RADAR_ECHO_CELLS[0],
      OFFICIAL_RADAR_ECHO_CELLS[1]
    ]
  },
  {
    id: 'episode-cevenol-mediterraneen',
    name: 'Épisode Cévenol / Méditerranéen Majeur',
    phenomenonLabel: 'Pluies Torrentielles & Risque Crues Éclairs',
    phenomenonIcon: '🌊',
    type: 'episode_cevenol',
    severity: 'ORANGE',
    headline: 'Blocage pluvio-orageux stationnaire sur le relief des Cévennes et le littoral languedocien',
    description: 'Flux de Sud à Sud-Est méditerranéen saturé en humidité se bloquant contre le relief cévenol et les Préalpes. Régénération stationnaire de cellules convectives en V apportant des cumuls d\'eau de 150 à 300 mm en 24h sur les bassins versants des Gardons, de l\'Hérault et de l\'Ardèche.',
    arrivalEstimate: 'Depuis 06h00 ce matin',
    peakEstimate: '14h00 - Minuit',
    endEstimate: 'Demain 12h00',
    speedKmH: 15,
    trajectoryAngleDeg: 350,
    trajectoryLabel: 'Golfe du Lion ➔ Plaines de l\'Hérault / Gard ➔ Crêtes Cévenoles (Lozère / Ardèche)',
    impactedZoneName: 'Contreforts Cévenols, Bas-Languedoc, Vallée de l\'Ardèche et Cuestas',
    impactedDepartments: ['34', '30', '48', '07', '12', '13', '84'],
    impactedRegions: ['Occitanie', 'Auvergne-Rhône-Alpes', 'Provence-Alpes-Côte d\'Azur'],
    keyMetrics: {
      maxGustsKmH: 85,
      rainAccumulation24hMm: 280,
      hourlyRainIntensityMm: 60,
      temperatureDropC: 3.0,
      lightningIntensityPerMin: 85,
      capeInstabilityJkg: 1650
    },
    coordinates: [
      [43.3, 3.5],
      [43.8, 3.9],
      [44.3, 3.6],
      [44.6, 4.2],
      [44.9, 4.5]
    ],
    // Clear polygon for Cévennes / Languedoc zone
    impactZonePolygon: [
      [43.1, 3.2],
      [43.6, 3.0],
      [44.4, 3.2],
      [44.9, 3.8],
      [45.1, 4.8],
      [44.5, 4.9],
      [43.7, 4.6],
      [43.3, 4.2],
      [43.1, 3.2]
    ],
    centerCoordinate: [44.1, 3.8],
    safetyGuidelines: [
      'Reportez impérativement tous vos déplacements non essentiels en zone cévenole.',
      'Ne descendez en aucun cas dans les sous-sols, caves ou parkings souterrains.',
      'Tenez-vous éloigné des rivières, ponts submersibles et passages à gué.',
      'Surveillez la montée des eaux et coupez l\'électricité si l\'inondation menace votre habitation.'
    ],
    radarEchoCells: [
      OFFICIAL_RADAR_ECHO_CELLS[2]
    ]
  },
  {
    id: 'front-froid-oceanique-manche',
    name: 'Front Froid Océanique & Coup de Vent Manche',
    phenomenonLabel: 'Coup de Vent Littoral & Forte Traîne',
    phenomenonIcon: '💨',
    type: 'front_froid',
    severity: 'JAUNE',
    headline: 'Traîne active avec bourrasques de vent et averses grésil sur les côtes de Manche',
    description: 'Passage d\'un front froid très dynamique associé à une dépression centrée sur la mer du Nord. Bascule des vents de Sud-Ouest à Nord-Ouest avec des pointes de 85 à 100 km/h sur les caps exposés et traîne d\'averses fortes entrecoupées d\'éclaircies.',
    arrivalEstimate: '11h30',
    peakEstimate: '14h00 - 19h00',
    endEstimate: 'Demain 06h00',
    speedKmH: 55,
    trajectoryAngleDeg: 120,
    trajectoryLabel: 'Manche occidentale (Finistère / Cotentin) ➔ Hauts-de-France & Bassin Parisien',
    impactedZoneName: 'Façade Manche, Côtes Bretonnes, Normandie et Littoral du Nord',
    impactedDepartments: ['29', '22', '35', '50', '14', '76', '27', '60', '80', '62', '59'],
    impactedRegions: ['Bretagne', 'Normandie', 'Hauts-de-France', 'Île-de-France'],
    keyMetrics: {
      maxGustsKmH: 95,
      rainAccumulation24hMm: 35,
      hourlyRainIntensityMm: 18,
      temperatureDropC: 7.0,
      lightningIntensityPerMin: 15,
      snowRainLimitDropMeters: 600
    },
    coordinates: [
      [48.6, -4.8],
      [49.4, -2.5],
      [50.0, 0.5],
      [50.8, 2.5],
      [51.2, 4.0]
    ],
    impactZonePolygon: [
      [48.2, -5.0],
      [48.8, -4.8],
      [49.8, -2.2],
      [50.6, 1.2],
      [51.3, 2.8],
      [51.2, 4.4],
      [50.4, 3.8],
      [49.4, 1.8],
      [48.8, -0.5],
      [48.2, -2.5],
      [48.2, -5.0]
    ],
    centerCoordinate: [49.8, 0.2],
    safetyGuidelines: [
      'Soyez vigilant lors de vos déplacements sur le littoral et les ponts exposés.',
      'Rangez les objets susceptibles d\'être emportés par les coups de vent.',
      'Évitez les activités nautiques et les promenades en bord de mer en période de pleine mer.'
    ],
    radarEchoCells: [
      OFFICIAL_RADAR_ECHO_CELLS[3]
    ]
  },
  {
    id: 'front-neigeux-alpes-pyrenees',
    name: 'Dégradation Hivernale & Chute de la LPN',
    phenomenonLabel: 'Chutes de Neige & Abaissement LPN',
    phenomenonIcon: '❄️',
    type: 'neige_verglas',
    severity: 'JAUNE',
    headline: 'Abaissement brutal de la Limite Pluie-Neige dès 1200m dans les Alpes du Nord et Pyrénées',
    description: 'Advection d\'air polaire maritime créant d\'importantes chutes de neige par effet de blocage orographique. La LPN chute rapidement de 2200m à 1100m en quelques heures avec 30 à 50 cm de neige fraîche au-dessus de 1800m.',
    arrivalEstimate: 'Ce soir 19h00',
    peakEstimate: '23h00 - 07h00',
    endEstimate: 'Demain 16h00',
    speedKmH: 40,
    trajectoryAngleDeg: 140,
    trajectoryLabel: 'Jura ➔ Massifs Alpins (Savoie / Haute-Savoie / Isère) ➔ Massif Central',
    impactedZoneName: 'Massifs Alpins (Chablais, Mont-Blanc, Vanoise, Oisans) et Hautes Pyrénées',
    impactedDepartments: ['74', '73', '38', '05', '01', '39', '25', '64', '65', '09', '66'],
    impactedRegions: ['Auvergne-Rhône-Alpes', 'Bourgogne-Franche-Comté', 'Occitanie'],
    keyMetrics: {
      maxGustsKmH: 80,
      rainAccumulation24hMm: 45,
      temperatureDropC: 8.5,
      snowRainLimitDropMeters: 1100
    },
    coordinates: [
      [46.4, 6.0],
      [45.9, 6.6],
      [45.4, 6.9],
      [44.8, 6.7],
      [44.2, 6.8]
    ],
    impactZonePolygon: [
      [46.5, 5.8],
      [46.4, 6.8],
      [45.8, 7.2],
      [45.0, 7.1],
      [44.1, 7.0],
      [44.1, 6.1],
      [44.8, 5.8],
      [45.5, 5.7],
      [46.5, 5.8]
    ],
    centerCoordinate: [45.5, 6.5],
    safetyGuidelines: [
      'Équipements hivernaux spéciaux (pneus hiver / chaînes) obligatoires sur les routes de montagne.',
      'Risque accru de plaques à vent en haute montagne (consultez le BERA).',
      'Anticipez les fermetures de cols d\'altitude.'
    ],
    radarEchoCells: [
      OFFICIAL_RADAR_ECHO_CELLS[4]
    ]
  },
  {
    id: 'dome-chaleur-vallee-rhone',
    name: 'Dôme de Chaleur & Blocage Caniculaire',
    phenomenonLabel: 'Canicule & Températures > 38°C',
    phenomenonIcon: '🔥',
    type: 'canicule_dome',
    severity: 'JAUNE',
    headline: 'Hautes pressions subtropicales avec températures supérieures à 37°C dans le Sud-Est',
    description: 'Dorsale anticyclonique comprimant la masse d\'air par subsidence. Fortes chaleurs diurnes durables et nuits tropicales (minimales ne descendant pas sous 22 à 25°C dans les agglomérations).',
    arrivalEstimate: 'En cours',
    peakEstimate: '15h00 - 18h30 quotidiennement',
    endEstimate: 'J+4',
    speedKmH: 0,
    trajectoryAngleDeg: 0,
    trajectoryLabel: 'Basse Vallée du Rhône, Provence, Roussillon et Sud de l\'Aquitaine',
    impactedZoneName: 'Couloir Rhodanien, Plaine du Comtat, Pays d\'Aix et Camargue',
    impactedDepartments: ['84', '13', '30', '34', '11', '66', '26', '07', '69', '38'],
    impactedRegions: ['Provence-Alpes-Côte d\'Azur', 'Occitanie', 'Auvergne-Rhône-Alpes'],
    keyMetrics: {
      maxGustsKmH: 25,
      temperatureDropC: 0,
      capeInstabilityJkg: 1800
    },
    coordinates: [
      [43.2, 4.8],
      [44.2, 4.8],
      [45.2, 4.9],
      [45.7, 4.9]
    ],
    impactZonePolygon: [
      [43.2, 4.2],
      [44.0, 4.3],
      [45.5, 4.5],
      [45.8, 5.2],
      [44.8, 5.4],
      [43.6, 5.6],
      [43.1, 5.0],
      [43.2, 4.2]
    ],
    centerCoordinate: [44.4, 4.8],
    safetyGuidelines: [
      'Buvez régulièrement de l\'eau sans attendre d\'avoir soif.',
      'Fermez volets et fenêtres pendant la journée et aérez la nuit.',
      'Évitez les efforts physiques intenses aux heures les plus chaudes (11h - 18h).'
    ],
    radarEchoCells: []
  }
];
