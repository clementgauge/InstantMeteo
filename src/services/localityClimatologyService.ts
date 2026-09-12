/**
 * Locality Climatology & Regional Vigilance Adaptation Service
 * 
 * Adapts weather vigilance thresholds (Rain, Flood, Snow, Frost, Heatwave, Wind, Fog)
 * to the exact local climate regime and geographic vulnerability of each locality.
 * (e.g., 10mm in the Sahara causes flash floods, while 10mm in the Alps is standard;
 * 2cm of snow in Nice paralyzes the city, while in Chamonix it is normal everyday winter).
 * 
 * Also provides high-precision differentiation between meteorological fog types:
 * - Brouillard Givrant (strictly T <= 0°C with rime/ice deposition)
 * - Brouillard de Rayonnement (clear nocturnal cooling, calm wind, rapid morning solar dissipation)
 * - Brouillard d'Advection / Marin (warm moist air over colder sea/ground, persistent)
 * - Brouillard de Vallée & Inversion Thermique (cold air trapped beneath warm layer aloft, sea of clouds)
 * - Brouillard Orographique / de Pente (forced upslope lifting touching mountain relief)
 * - Brouillard Dense Généralisé / Frontal
 */

import { LocationPoint, HourlyForecast, VigilanceLevel } from '../types/weather';

export type FogType = 
  | 'GIVRANT'
  | 'RAYONNEMENT'
  | 'ADVECTION'
  | 'VALLEE_INVERSION'
  | 'OROGRAPHIQUE'
  | 'DENSE';

export interface FogDiagnosis {
  fogType: FogType;
  phenomenonKey: 'BROUILLARD_GIVRANT' | 'BROUILLARD_RAYONNEMENT' | 'BROUILLARD_ADVECTION' | 'BROUILLARD_VALLEE' | 'BROUILLARD_OROGRAPHIQUE' | 'BROUILLARD_DENSE';
  label: string;
  shortLabel: string;
  emoji: string;
  isFreezing: boolean;
  scientificMechanism: string;
  meteorologicalContext: string;
  dissipationDynamics: string;
  dissipationExpectedHour: string;
  vigilanceTitle: string;
  vigilanceMessage: string;
  dangerDescription: string;
  triggerCriteria: string;
  severityMetric: string;
  impactsSummary: string[];
  safetyInstructions: string[];
}

export interface LocalityClimatologyProfile {
  regimeKey: 
    | 'ARIDE_SAHARA'
    | 'MEDITERRANEEN_CEVENOL'
    | 'HAUTE_MONTAGNE'
    | 'MOYENNE_MONTAGNE'
    | 'COMBE_FROID_JURA'
    | 'LITTORAL_OCEANIQUE'
    | 'PLAINE_CONTINENTALE'
    | 'URBAIN_DENSE_PARIS'
    | 'ABRI_PLUVIOMETRIQUE_ALSACE';
  regimeName: string;
  geographicTag: string;
  summary: string;
  isAridOrDesert: boolean;
  isMountain: boolean;
  isCoastal: boolean;
  
  // Localized Thresholds
  rainThresholds: {
    jaune24hMm: number;
    orange24hMm: number;
    rouge24hMm: number;
    hourlyPeakJauneMm: number;
    hourlyPeakOrangeMm: number;
    hourlyPeakRougeMm: number;
    climatologicalContext: string;
  };
  snowThresholds: {
    jauneCm: number;
    orangeCm: number;
    rougeCm: number;
    climatologicalContext: string;
  };
  coldThresholds: {
    jauneTnC: number;
    orangeTnC: number;
    rougeTnC: number;
    climatologicalContext: string;
  };
  heatThresholds: {
    jauneTxC: number;
    orangeTxC: number;
    orangeTnC: number;
    rougeTxC: number;
    climatologicalContext: string;
  };
  windThresholds: {
    jauneGustKmh: number;
    orangeGustKmh: number;
    rougeGustKmh: number;
    climatologicalContext: string;
  };
}

/**
 * Identify the local climatological profile of any given station
 */
export function getLocalityClimatologyProfile(station?: LocationPoint): LocalityClimatologyProfile {
  const alt = station?.altitude ?? 100;
  const lat = station?.latitude ?? 46.5;
  const lon = station?.longitude ?? 2.5;
  const name = (station?.name || '').toLowerCase();
  const dept = (station?.department || '').toLowerCase();
  const region = (station?.region || '').toLowerCase();
  const country = (station?.country || '').toLowerCase();
  const climateZone = (station?.climateZone || '').toLowerCase();

  // 1. ARID / SAHARAN / DESERTIC
  const isArid = 
    country.includes('algérie') || country.includes('algeria') ||
    country.includes('maroc') || country.includes('morocco') ||
    country.includes('tunisie') || country.includes('tunisia') ||
    country.includes('égypte') || country.includes('egypt') ||
    country.includes('émirats') || country.includes('emirates') || country.includes('dubaï') ||
    country.includes('arabie') || country.includes('saudi') ||
    country.includes('mauritanie') || country.includes('mali') || country.includes('niger') ||
    climateZone.includes('désert') || climateZone.includes('sahara') || climateZone.includes('aride') ||
    name.includes('tamanrasset') || name.includes('djanet') || name.includes('ouargla') || name.includes('adrar') ||
    (lat >= 14 && lat <= 32 && lon >= -17 && lon <= 55 && alt < 1800);

  if (isArid) {
    return {
      regimeKey: 'ARIDE_SAHARA',
      regimeName: 'Climat Saharien & Désertique Aride',
      geographicTag: 'Zone Aride & Oueds',
      summary: 'Précipitations rarissimes mais à ruissellement violent instantané sur sols desséchés imperméables.',
      isAridOrDesert: true,
      isMountain: alt >= 1200,
      isCoastal: false,
      rainThresholds: {
        jaune24hMm: 6.0,
        orange24hMm: 16.0,
        rouge24hMm: 32.0,
        hourlyPeakJauneMm: 3.0,
        hourlyPeakOrangeMm: 8.0,
        hourlyPeakRougeMm: 16.0,
        climatologicalContext: 'En milieu désertique, 10 mm équivaut à plusieurs mois de précipitations normales et provoque des crues éclairs (oueds) dévastatrices.'
      },
      snowThresholds: {
        jauneCm: 0.5,
        orangeCm: 2.0,
        rougeCm: 5.0,
        climatologicalContext: 'Événement rarissime au Sahara provoquant un choc thermique et l’arrêt total des activités.'
      },
      coldThresholds: {
        jauneTnC: 2.0,
        orangeTnC: -1.0,
        rougeTnC: -4.0,
        climatologicalContext: 'Sensibilité extrême au froid nocturne en milieu désertique sans habitations chauffées.'
      },
      heatThresholds: {
        jauneTxC: 42.0,
        orangeTxC: 46.0,
        orangeTnC: 30.0,
        rougeTxC: 49.0,
        climatologicalContext: 'Seuils caniculaires adaptés à la thermorégulation désertique extrême.'
      },
      windThresholds: {
        jauneGustKmh: 65,
        orangeGustKmh: 85,
        rougeGustKmh: 110,
        climatologicalContext: 'Vents de sable violents (Sirocco, Harmattan) réduisant la visibilité à néant.'
      }
    };
  }

  // 2. COMBES À FROID DU JURA (Mouthe, Chapelle-des-Bois, Haut-Doubs)
  const isColdCombe = 
    name.includes('mouthe') || name.includes('chapelle-des-bois') || name.includes('combe') ||
    ((dept.includes('doubs') || dept.includes('jura')) && alt >= 850);

  if (isColdCombe) {
    return {
      regimeKey: 'COMBE_FROID_JURA',
      regimeName: 'Combe à Froid Jurassienne (Microclimat Polaire)',
      geographicTag: 'Haut-Doubs & Combes Fermées',
      summary: 'Inversions radiatives extrêmes piégeant l’air glacial au fond des dépressions fermées.',
      isAridOrDesert: false,
      isMountain: true,
      isCoastal: false,
      rainThresholds: {
        jaune24hMm: 25.0,
        orange24hMm: 55.0,
        rouge24hMm: 110.0,
        hourlyPeakJauneMm: 10.0,
        hourlyPeakOrangeMm: 22.0,
        hourlyPeakRougeMm: 40.0,
        climatologicalContext: 'Pluviométrie jurassienne élevée bien absorbée par le karst géologique.'
      },
      snowThresholds: {
        jauneCm: 10.0,
        orangeCm: 25.0,
        rougeCm: 50.0,
        climatologicalContext: 'Région habituée au déneigement intensif et aux hivers rigoureux.'
      },
      coldThresholds: {
        jauneTnC: -12.0,
        orangeTnC: -22.0,
        rougeTnC: -32.0,
        climatologicalContext: 'À Mouthe, -5°C est une nuit d’hiver très douce. L’alerte orange ne se justifie qu’à partir de -22°C.'
      },
      heatThresholds: {
        jauneTxC: 30.0,
        orangeTxC: 33.0,
        orangeTnC: 17.0,
        rougeTxC: 36.0,
        climatologicalContext: 'Fraîcheur d’altitude rendant les canicules rares et éprouvantes.'
      },
      windThresholds: {
        jauneGustKmh: 75,
        orangeGustKmh: 95,
        rougeGustKmh: 125,
        climatologicalContext: 'Rafales de bise sur les plateaux jurassiens.'
      }
    };
  }

  // 3. HAUTE MONTAGNE (Alpes, Pyrénées > 1000m)
  const isHighMountain = alt >= 1000 || station?.isMountain || 
    name.includes('chamonix') || name.includes('briançon') || name.includes('alpe d') || name.includes('tignes') ||
    dept.includes('hautes-alpes') || dept.includes('haute-savoie') || dept.includes('savoie') || dept.includes('hautes-pyrénées');

  if (isHighMountain) {
    return {
      regimeKey: 'HAUTE_MONTAGNE',
      regimeName: 'Haute Montagne Alpine & Pyrénéenne',
      geographicTag: 'Massifs Alpins / Pyrénéens (>1000m)',
      summary: 'Précipitations abondantes, manteau neigeux pérenne et dépressions orographiques.',
      isAridOrDesert: false,
      isMountain: true,
      isCoastal: false,
      rainThresholds: {
        jaune24hMm: 28.0,
        orange24hMm: 60.0,
        rouge24hMm: 120.0,
        hourlyPeakJauneMm: 12.0,
        hourlyPeakOrangeMm: 25.0,
        hourlyPeakRougeMm: 45.0,
        climatologicalContext: '10 mm de pluie en montagne alpine est une averse banale sans risque; l’alerte requiert au moins 28 à 60 mm.'
      },
      snowThresholds: {
        jauneCm: 15.0,
        orangeCm: 35.0,
        rougeCm: 70.0,
        climatologicalContext: '5 cm de neige est le quotidien hivernal; la vigilance jaune démarre à 15 cm et orange à 35 cm.'
      },
      coldThresholds: {
        jauneTnC: -10.0,
        orangeTnC: -18.0,
        rougeTnC: -26.0,
        climatologicalContext: 'Les températures négatives sont la norme en hiver d’altitude.'
      },
      heatThresholds: {
        jauneTxC: 30.0,
        orangeTxC: 33.0,
        orangeTnC: 17.0,
        rougeTxC: 36.0,
        climatologicalContext: 'L’isotherme 0°C s’élève très haut lors des pics de chaleur estivaux.'
      },
      windThresholds: {
        jauneGustKmh: 85,
        orangeGustKmh: 115,
        rougeGustKmh: 145,
        climatologicalContext: 'Vents d’altitude et de crêtes puissants (effet Venturi et fœhn).'
      }
    };
  }

  // 4. RÉGIME MÉDITERRANÉEN & CÉVENOL (Cévennes, Gard, Hérault, Ardèche, PACA, Corse)
  const isCevenolOrMed = 
    dept.includes('gard') || dept.includes('hérault') || dept.includes('ardèche') || dept.includes('lozère') ||
    dept.includes('bouches-du-rhône') || dept.includes('var') || dept.includes('alpes-maritimes') || 
    dept.includes('corse') || dept.includes('vaucluse') || dept.includes('pyrénées-orientales') || dept.includes('aude') ||
    name.includes('nîmes') || name.includes('montpellier') || name.includes('nice') || name.includes('marseille') ||
    name.includes('toulon') || name.includes('ajaccio') || name.includes('bastia') || name.includes('alès');

  if (isCevenolOrMed) {
    return {
      regimeKey: 'MEDITERRANEEN_CEVENOL',
      regimeName: 'Méditerranéen & Piémont Cévenol',
      geographicTag: 'Arc Méditerranéen & Cévennes',
      summary: 'Épisodes cévenols diluviens paroxystiques, sécheresse estivale et intolérance totale à la neige.',
      isAridOrDesert: false,
      isMountain: alt >= 600,
      isCoastal: alt <= 200,
      rainThresholds: {
        jaune24hMm: 40.0,
        orange24hMm: 85.0,
        rouge24hMm: 180.0,
        hourlyPeakJauneMm: 18.0,
        hourlyPeakOrangeMm: 35.0,
        hourlyPeakRougeMm: 60.0,
        climatologicalContext: 'Bassin versant réactif habitué aux épisodes méditerranéens; seuil orange élevé à 85 mm et rouge à 180 mm.'
      },
      snowThresholds: {
        jauneCm: 1.0,
        orangeCm: 3.0,
        rougeCm: 8.0,
        climatologicalContext: '1 à 2 cm de neige sur la côte méditerranéenne (Nice, Marseille) paralyse immédiatement la ville.'
      },
      coldThresholds: {
        jauneTnC: 0.0,
        orangeTnC: -3.5,
        rougeTnC: -6.5,
        climatologicalContext: 'Gel destructeur pour les cultures horticoles et agrumes méditerranéens dès 0°C.'
      },
      heatThresholds: {
        jauneTxC: 35.0,
        orangeTxC: 36.5,
        orangeTnC: 23.0,
        rougeTxC: 40.5,
        climatologicalContext: 'Seuils officiels Santé Publique France Gard/Hérault/PACA avec nuits tropicales très chaudes (>23°C).'
      },
      windThresholds: {
        jauneGustKmh: 80,
        orangeGustKmh: 105,
        rougeGustKmh: 135,
        climatologicalContext: 'Mistral et Tramontane fréquents mais dangereux au-delà de 100 km/h.'
      }
    };
  }

  // 5. LITTORAL OCÉANIQUE (Bretagne, Manche, Vendée, Landes)
  const isOceanicCoast = 
    (alt <= 120) && (
      dept.includes('finistère') || dept.includes('morbihan') || dept.includes('côtes-d\'armor') ||
      dept.includes('ille-et-vilaine') || dept.includes('manche') || dept.includes('calvados') ||
      dept.includes('seine-maritime') || dept.includes('somme') || dept.includes('pas-de-calais') ||
      dept.includes('vendée') || dept.includes('loire-atlantique') || dept.includes('charente-maritime') ||
      name.includes('brest') || name.includes('saint-malo') || name.includes('cherbourg') || name.includes('lorient')
    );

  if (isOceanicCoast) {
    return {
      regimeKey: 'LITTORAL_OCEANIQUE',
      regimeName: 'Façade Océanique & Manche',
      geographicTag: 'Littoral Atlantique & Manche',
      summary: 'Climat maritime tempéré très venteux avec entrées maritimes et brouillards d’advection tenaces.',
      isAridOrDesert: false,
      isMountain: false,
      isCoastal: true,
      rainThresholds: {
        jaune24hMm: 20.0,
        orange24hMm: 45.0,
        rouge24hMm: 80.0,
        hourlyPeakJauneMm: 8.0,
        hourlyPeakOrangeMm: 18.0,
        hourlyPeakRougeMm: 35.0,
        climatologicalContext: 'Régime océanique régulier à passages perturbés fréquents.'
      },
      snowThresholds: {
        jauneCm: 1.5,
        orangeCm: 5.0,
        rougeCm: 12.0,
        climatologicalContext: 'Influence thermique océanique rendant la neige rare et immédiatement perturbante.'
      },
      coldThresholds: {
        jauneTnC: -1.0,
        orangeTnC: -5.0,
        rougeTnC: -9.0,
        climatologicalContext: 'Amortissement thermique marin; les gelées sévères sous -5°C sont exceptionnelles.'
      },
      heatThresholds: {
        jauneTxC: 29.5,
        orangeTxC: 32.0,
        orangeTnC: 18.5,
        rougeTxC: 37.0,
        climatologicalContext: 'Seuil canicule Santé Publique France Finistère (Tx 30°C / Tn 18°C).'
      },
      windThresholds: {
        jauneGustKmh: 80,
        orangeGustKmh: 110,
        rougeGustKmh: 140,
        climatologicalContext: 'Caps côtiers et îles exposés aux tempêtes atlantiques synoptiques.'
      }
    };
  }

  // 6. ZONE D'ABRI PLUVIOMÉTRIQUE (Colmar, Plaine d'Alsace, Limagne)
  const isRainShadow = 
    name.includes('colmar') || name.includes('clermont-ferrand') || 
    (dept.includes('haut-rhin') && alt <= 220) || climateZone.includes('semi-continental abrité');

  if (isRainShadow) {
    return {
      regimeKey: 'ABRI_PLUVIOMETRIQUE_ALSACE',
      regimeName: 'Plaine d’Abri Pluviométrique (Fœhn)',
      geographicTag: 'Plaine d’Alsace / Limagne',
      summary: 'Climat très sec sous le vent des massifs (Vosges/Dômes) contrastant avec de forts orages d’été.',
      isAridOrDesert: false,
      isMountain: false,
      isCoastal: false,
      rainThresholds: {
        jaune24hMm: 14.0,
        orange24hMm: 32.0,
        rouge24hMm: 65.0,
        hourlyPeakJauneMm: 7.0,
        hourlyPeakOrangeMm: 15.0,
        hourlyPeakRougeMm: 30.0,
        climatologicalContext: 'Colmar reçoit seulement 550 mm/an; un cumul de 25-30 mm y est déjà un événement marquant.'
      },
      snowThresholds: {
        jauneCm: 3.0,
        orangeCm: 8.0,
        rougeCm: 18.0,
        climatologicalContext: 'Neige continentale de plaine.'
      },
      coldThresholds: {
        jauneTnC: -4.0,
        orangeTnC: -9.0,
        rougeTnC: -15.0,
        climatologicalContext: 'Inversions thermiques froides d’hiver rhénan.'
      },
      heatThresholds: {
        jauneTxC: 33.0,
        orangeTxC: 35.0,
        orangeTnC: 20.0,
        rougeTxC: 39.0,
        climatologicalContext: 'Fort réchauffement estival en cuvette fermée.'
      },
      windThresholds: {
        jauneGustKmh: 70,
        orangeGustKmh: 90,
        rougeGustKmh: 115,
        climatologicalContext: 'Vent souvent canalisé du nord ou du sud dans le fossé rhénan.'
      }
    };
  }

  // 7. GRANDES AGGLOMÉRATIONS DENSES & ÎLE-DE-FRANCE (Paris, Lyon)
  const isDenseUrban = 
    dept.includes('paris') || dept.includes('hauts-de-seine') || dept.includes('seine-saint-denis') ||
    dept.includes('val-de-marne') || name.includes('paris') || name.includes('lyon');

  if (isDenseUrban) {
    return {
      regimeKey: 'URBAIN_DENSE_PARIS',
      regimeName: 'Agglomération Urbaine Dense & Îlot de Chaleur',
      geographicTag: 'Bassin Parisien / Métropole',
      summary: 'Vulnérabilité accrue aux îlots de chaleur nocturnes, aux toitures et aux chutes de branches sur les axes denses.',
      isAridOrDesert: false,
      isMountain: false,
      isCoastal: false,
      rainThresholds: {
        jaune24hMm: 16.0,
        orange24hMm: 35.0,
        rouge24hMm: 70.0,
        hourlyPeakJauneMm: 7.5,
        hourlyPeakOrangeMm: 16.0,
        hourlyPeakRougeMm: 30.0,
        climatologicalContext: 'Imperméabilisation massive des sols urbains amplifiant les ruissellements de surface.'
      },
      snowThresholds: {
        jauneCm: 2.0,
        orangeCm: 6.0,
        rougeCm: 15.0,
        climatologicalContext: 'Dès 2-3 cm de neige, paralysie des rocades autoroutières (A86, périphérique) et transports ferroviaires.'
      },
      coldThresholds: {
        jauneTnC: -3.0,
        orangeTnC: -7.5,
        rougeTnC: -13.0,
        climatologicalContext: 'L’effet d’îlot urbain atténue le froid nocturne de 2 à 4°C par rapport à la campagne.'
      },
      heatThresholds: {
        jauneTxC: 31.0,
        orangeTxC: 32.5,
        orangeTnC: 21.0,
        rougeTxC: 38.5,
        climatologicalContext: 'Seuils officiels Santé Publique France Paris (75) : Tx 31°C / Tn 21°C sur 3 jours.'
      },
      windThresholds: {
        jauneGustKmh: 68,
        orangeGustKmh: 85,
        rougeGustKmh: 115,
        climatologicalContext: 'Densité de population et arbres d’alignement créant un risque de chute de branches dès 85 km/h.'
      }
    };
  }

  // 8. PLAINE CONTINENTALE STANDARD / DEFAUT (Bassin Parisien étendu, Centre, Ouest intérieur)
  return {
    regimeKey: 'PLAINE_CONTINENTALE',
    regimeName: 'Plaine Tempérée Standard',
    geographicTag: 'Plaines Intérieures & Collines',
    summary: 'Régime tempéré océanique dégradé équilibré, seuils nationaux Météo-France de référence.',
    isAridOrDesert: false,
    isMountain: alt >= 500,
    isCoastal: false,
    rainThresholds: {
      jaune24hMm: 18.0,
      orange24hMm: 40.0,
      rouge24hMm: 80.0,
      hourlyPeakJauneMm: 8.0,
      hourlyPeakOrangeMm: 18.0,
      hourlyPeakRougeMm: 35.0,
      climatologicalContext: 'Seuils standards de référence Météo-France pour les plaines intérieures.'
    },
    snowThresholds: {
      jauneCm: 3.0,
      orangeCm: 8.0,
      rougeCm: 20.0,
      climatologicalContext: 'Seuils de vigilance neige de référence en plaine.'
    },
    coldThresholds: {
      jauneTnC: -3.0,
      orangeTnC: -8.0,
      rougeTnC: -14.0,
      climatologicalContext: 'Gelées blanches fréquentes de saison, gel sévère dès -8°C.'
    },
    heatThresholds: {
      jauneTxC: 32.5,
      orangeTxC: 34.5,
      orangeTnC: 20.0,
      rougeTxC: 39.0,
      climatologicalContext: 'Seuils moyens de vigilance canicule métropolitaine.'
    },
    windThresholds: {
      jauneGustKmh: 72,
      orangeGustKmh: 90,
      rougeGustKmh: 120,
      climatologicalContext: 'Seuils de coup de vent et tempête standard.'
    }
  };
}

/**
 * High-Precision Scientific Meteorological Fog Diagnostic
 * 
 * Accurately classifies fog into distinct physical families:
 * 1. BROUILLARD GIVRANT (strictly negative temperature T <= 0°C with rime/ice)
 * 2. BROUILLARD DE RAYONNEMENT (clear nocturnal radiative cooling, light wind < 10 km/h)
 * 3. BROUILLARD D'ADVECTION (warm moist air mass sliding over cold sea or land, persistent)
 * 4. BROUILLARD DE VALLÉE & INVERSION THERMIQUE (dense cold pool trapped under inversion, sea of clouds)
 * 5. BROUILLARD OROGRAPHIQUE / DE PENTE (forced upslope lifting touching mountain relief)
 * 6. BROUILLARD ÉPAIS DENSE / FRONTAL (general or frontal zero visibility)
 */
export function diagnosePreciseFogType(params: {
  station?: LocationPoint;
  minTemp: number;
  maxTemp: number;
  currentTemp?: number;
  weatherCode: number;
  hoursToUse: HourlyForecast[];
  rainSum: number;
  windSpeedMax?: number;
}): FogDiagnosis {
  const { station, minTemp, maxTemp, currentTemp, weatherCode, hoursToUse, rainSum, windSpeedMax = 8 } = params;
  const alt = station?.altitude ?? 100;
  const profile = getLocalityClimatologyProfile(station);
  
  // Check if any hour has temperature <= 0°C during the fog or negative minTemp
  const hasFreezingTemp = minTemp <= 0.0 || hoursToUse.some(h => [45, 48].includes(h.weatherCode) && h.temperature <= 0.0);
  const isOfficialFreezingCode = weatherCode === 48 || hoursToUse.some(h => h.weatherCode === 48);

  // 1. BROUILLARD GIVRANT (STRICT CONSTRAINT: ONLY IF T <= 0°C)
  if ((hasFreezingTemp || isOfficialFreezingCode) && minTemp <= 0.5) {
    return {
      fogType: 'GIVRANT',
      phenomenonKey: 'BROUILLARD_GIVRANT',
      label: 'Brouillard Givrant',
      shortLabel: 'Givrant',
      emoji: '❄️🌫️',
      isFreezing: true,
      scientificMechanism: 'Gouttelettes d’eau en surfusion en suspension dans un air à température négative. Au contact des surfaces au sol (chaussées, ponts, branchages, câbles électriques), les gouttelettes gèlent instantanément, créant un dépôt de givre dur ou de verglas blanc.',
      meteorologicalContext: `Température négative de ${minTemp}°C sous abri avec humidité saturée à 100%. Phénomène hautement accidentogène pour la circulation routière.`,
      dissipationDynamics: 'Persistance tant que le mercure reste négatif. Dégel et dissipation progressive à la mi-journée lorsque la température repasse au-dessus de 0°C sous l’effet du rayonnement solaire.',
      dissipationExpectedHour: maxTemp > 0 ? '11h30' : 'Persistant toute la journée (Sans dégel)',
      vigilanceTitle: 'Vigilance Brouillard Givrant & Verglas',
      vigilanceMessage: `Nappes de brouillard givrant avec formation de plaques de givre glissant au sol par températures négatives (${minTemp}°C).`,
      dangerDescription: 'Chaussées brutalement glissantes, perte d’adhérence soudaine sur les ponts et viaducs, visibilité inférieure à 150 mètres.',
      triggerCriteria: `Température sous abri ≤ 0°C (${minTemp}°C) avec code brouillard WMO ${weatherCode}`,
      severityMetric: `Tn : ${minTemp}°C • Visibilité < 150 m • Givre au sol`,
      impactsSummary: [
        'Dépôts de givre immédiats sur les pare-brise, routes et surfaces métalliques.',
        'Plaques de verglas tenaces particulièrement sur les ponts, viaducs et zones ombragées.',
        'Visibilité horizontale inférieure à 150 mètres imposant une réduction majeure de la vitesse.'
      ],
      safetyInstructions: [
        'Réduisez votre vitesse à 50 km/h et allumez impérativement vos feux de brouillard avant et arrière.',
        'Méfiez-vous particulièrement des passages sur ponts, zones boisées et cuvettes humides.',
        'Prévoyez des distances de sécurité au moins triplées en raison du risque de verglas invisible.'
      ]
    };
  }

  // 2. BROUILLARD D'ADVECTION / MARIN (Littoral marin ou advection d'air doux et humide sur sol frais)
  if (profile.isCoastal || profile.regimeKey === 'LITTORAL_OCEANIQUE' || (windSpeedMax >= 10 && windSpeedMax <= 30 && minTemp > 2.0)) {
    return {
      fogType: 'ADVECTION',
      phenomenonKey: 'BROUILLARD_ADVECTION',
      label: 'Brouillard d’Advection & Entrées Maritimes',
      shortLabel: 'Advection',
      emoji: '🌊🌫️',
      isFreezing: false,
      scientificMechanism: 'Une masse d’air maritime doux et très humide glisse au-dessus d’une eau littorale ou d’un sol continental plus froid. La couche inférieure de l’air se refroidit par contact jusqu’à son point de rosée et se condense en nappes opaques de brouillard marin.',
      meteorologicalContext: `Alimenté en continu par la brise marine ou un flux humide océanique modéré (${windSpeedMax} km/h). Température douce (${minTemp}°C à ${maxTemp}°C). Ne dépend pas du refroidissement radiatif nocturne.`,
      dissipationDynamics: 'Peut persister plusieurs heures en plein jour, voire toute la journée sur le rivage, car continuellement régénéré par la brise marine.',
      dissipationExpectedHour: '13h00 à 15h00 (ou persistance côtière)',
      vigilanceTitle: 'Vigilance Brouillard d’Advection & Entrées Maritimes',
      vigilanceMessage: 'Épaisses entrées maritimes pénétrant dans l’intérieur des terres avec visibilité horizontale très réduite.',
      dangerDescription: 'Brouillard marin dense et humide réduisant la visibilité à moins de 200 mètres, navigation côtière délicate.',
      triggerCriteria: `Advection marine avec humidité saturée et vent de mer (${windSpeedMax} km/h)`,
      severityMetric: `Humidité : 100% • Vent marin : ${windSpeedMax} km/h • Visibilité < 200 m`,
      impactsSummary: [
        'Visibilité côtière très dégradée affectant la navigation maritime et les routes littorales.',
        'Dépôts d’humidité constante sur les pare-brise sans risque de gel.',
        'Grisaille maritime opaque pouvant s’avancer à plusieurs dizaines de kilomètres dans les terres.'
      ],
      safetyInstructions: [
        'Allumez vos feux de croisement et feux antibrouillard.',
        'Navigateurs : signalez votre présence au sifflet ou corne de brume et veillez au radar.',
        'Adaptez votre allure sur les voies rapides littorales.'
      ]
    };
  }

  // 3. BROUILLARD DE VALLÉE & INVERSION THERMIQUE (Cuvettes, Combes, Massifs, Graben Rhénan)
  const isValleyOrInversion = 
    profile.regimeKey === 'COMBE_FROID_JURA' || 
    profile.regimeKey === 'ABRI_PLUVIOMETRIQUE_ALSACE' || 
    (alt >= 200 && alt <= 850 && windSpeedMax <= 10) ||
    station?.department?.toLowerCase().includes('isère') ||
    station?.department?.toLowerCase().includes('savoie') ||
    station?.department?.toLowerCase().includes('rhône') ||
    station?.department?.toLowerCase().includes('saône');

  if (isValleyOrInversion) {
    return {
      fogType: 'VALLEE_INVERSION',
      phenomenonKey: 'BROUILLARD_VALLEE',
      label: 'Brouillard de Vallée & Inversion Thermique',
      shortLabel: 'Vallée & Inversion',
      emoji: '⛰️🌫️',
      isFreezing: false,
      scientificMechanism: 'Pendant les nuits claires anticycloniques, l’air froid plus lourd s’écoule le long des pentes (drainage catabatique) et s’accumule au fond des vallées et plaines encaissées. Il se retrouve piégé sous une couche d’air plus doux en altitude (inversion thermique), créant une "mer de nuages" vue des sommets.',
      meteorologicalContext: `Inversion thermique marquée avec vent quasi nul (${windSpeedMax} km/h). Ciel parfaitement bleu et doux sur les sommets environnants tandis que le fond de vallée reste plongé dans l’air frais et la grisaille.`,
      dissipationDynamics: 'Dissipation lente et difficile. Le couvercle d’inversion peut empêcher tout réchauffement au sol et maintenir la couche de stratus/brouillard une grande partie de la journée.',
      dissipationExpectedHour: '12h00 à 14h00 (ou stratus bas persistant)',
      vigilanceTitle: 'Vigilance Brouillard de Vallée & Inversion Thermique',
      vigilanceMessage: 'Nappe de brouillard compacte piégée en fond de vallée et cuvettes sous inversion thermique.',
      dangerDescription: 'Opacité dense en vallée, transition brutale en sortant de la nappe vers les hauteurs ensoleillées.',
      triggerCriteria: `Inversion thermique anticyclonique en vallée avec visibilité < 200 m`,
      severityMetric: `Vent : ${windSpeedMax} km/h (Calme) • Inversion thermique • Visibilité < 200 m`,
      impactsSummary: [
        'Mer de nuages compacte en vallée avec température restant fraîche au sol.',
        'Transition brutale de visibilité lors des montées ou descentes en altitude.',
        'Accumulation possible de polluants atmosphériques sous le couvercle d’inversion.'
      ],
      safetyInstructions: [
        'Ralentissez à l’approche des descentes en cuvettes et fonds de vallée.',
        'Allumez vos feux de brouillard dès l’entrée dans la nappe.',
        'Consultez les webcams d’altitude si vous vous déplacez vers les massifs.'
      ]
    };
  }

  // 4. BROUILLARD OROGRAPHIQUE / DE PENTE (Relief montagneux)
  if (profile.isMountain || alt >= 600) {
    return {
      fogType: 'OROGRAPHIQUE',
      phenomenonKey: 'BROUILLARD_OROGRAPHIQUE',
      label: 'Brouillard Orographique & Nuages de Pente',
      shortLabel: 'Orographique',
      emoji: '🏔️🌫️',
      isFreezing: false,
      scientificMechanism: 'Une masse d’air humide est poussée par le vent contre le relief montagneux et forcée de s’élever. Le refroidissement adiabatique (environ 0,65°C par 100 m de gain d’altitude) amène rapidement l’air à saturation : la base des nuages (stratus) s’accroche directement aux versants de montagne.',
      meteorologicalContext: `Relief à ${alt}m d’altitude. Le brouillard correspond au contact direct avec la base des nuages d’altitude basse sur les cols et pentes exposées.`,
      dissipationDynamics: 'Lié à la circulation du vent et à l’humidité synoptique. Se dissipe lorsque le flux bascule ou s’assèche.',
      dissipationExpectedHour: '14h00',
      vigilanceTitle: 'Vigilance Brouillard Orographique & Cols de Montagne',
      vigilanceMessage: `Plafond nuageux touchant le sol sur les versants et passages de cols au-dessus de ${Math.max(400, alt - 200)}m.`,
      dangerDescription: 'Perte totale de repères visuels en montagne, routes en lacets et cols dans le brouillard épais.',
      triggerCriteria: `Soulèvement orographique touchant le relief à ${alt}m`,
      severityMetric: `Altitude : ${alt} m • Plafond au sol • Visibilité < 100 m`,
      impactsSummary: [
        'Visibilité quasi nulle sur les routes de cols et sentiers de randonnée.',
        'Désorientation rapide des randonneurs hors des sentiers balisés.',
        'Humidité ruisselante sur la chaussée en montagne.'
      ],
      safetyInstructions: [
        'Randonnée déconseillée en haute montagne sans GPS ou boussole.',
        'Redoublez de prudence dans les virages en lacets et descentes de cols.',
        'Allumez les feux de brouillard et klaxonnez avant les virages sans visibilité.'
      ]
    };
  }

  // 5. BROUILLARD DE RAYONNEMENT (Par défaut par nuit claire et vent calme en plaine)
  if (windSpeedMax <= 12 && minTemp > 0.0) {
    return {
      fogType: 'RAYONNEMENT',
      phenomenonKey: 'BROUILLARD_RAYONNEMENT',
      label: 'Brouillard de Rayonnement Nocturne',
      shortLabel: 'Rayonnement',
      emoji: '🌫️🌅',
      isFreezing: false,
      scientificMechanism: 'Par nuit claire sans vent, le sol perd sa chaleur par émission de rayonnement infrarouge vers l’espace. La fine couche d’air en contact immédiat avec le sol se refroidit sous son point de rosée et se condense en une nappe de brouillard au ras du sol.',
      meteorologicalContext: `Ciel nocturne dégagé, vent très faible (${windSpeedMax} km/h), sol humide. Pic d’épaisseur typique entre 05h30 et 08h30 à l’aube. Température positive (${minTemp}°C, aucun givre au sol).`,
      dissipationDynamics: 'Dissipation rapide après le lever du soleil : le rayonnement solaire réchauffe le sol, qui chauffe la couche d’air inférieure, faisant s’évaporer les gouttelettes d’eau par le bas entre 09h30 et 11h00.',
      dissipationExpectedHour: '10h00 à 11h00',
      vigilanceTitle: 'Vigilance Brouillard de Rayonnement Matinal',
      vigilanceMessage: 'Épaisses nappes de brouillard au lever du jour en plaine, se dissipant au fil de la matinée sous le soleil.',
      dangerDescription: 'Visibilité horizontale inférieure à 200 mètres à l’aube, s’améliorant rapidement en milieu de matinée.',
      triggerCriteria: `Refroidissement radiatif nocturne avec vent calme (< 12 km/h) et Tn: ${minTemp}°C`,
      severityMetric: `Tn : ${minTemp}°C (Positive, pas de gel) • Visibilité < 200 m • Dissipation 10h-11h`,
      impactsSummary: [
        'Brouillard dense particulièrement épais près des cours d’eau, champs et zones boisées à l’aube.',
        'Ralentissements sur les axes routiers aux heures de pointe matinales.',
        'Dissipation rapide par la base dès que le soleil perce.'
      ],
      safetyInstructions: [
        'Allumez vos feux de brouillard avant et réduisez votre allure aux abords des cours d’eau.',
        'N’oubliez pas d’éteindre vos feux antibrouillard arrière dès que la visibilité s’améliore.',
        'Augmentez vos distances de sécurité.'
      ]
    };
  }

  // 6. BROUILLARD DENSE GÉNÉRALISÉ (Cas résiduel)
  return {
    fogType: 'DENSE',
    phenomenonKey: 'BROUILLARD_DENSE',
    label: 'Brouillard Épais & Visibilité Nulle',
    shortLabel: 'Brouillard Épais',
    emoji: '🌫️⚠️',
    isFreezing: false,
    scientificMechanism: 'Saturation complète de la masse d’air en microgouttelettes d’eau avec visibilité horizontale inférieure à 200 mètres.',
    meteorologicalContext: `Visibilité très compromise sans gel au sol (Tn: ${minTemp}°C).`,
    dissipationDynamics: 'Évolution progressive selon le brassage du vent et le réchauffement diurne.',
    dissipationExpectedHour: '11h30',
    vigilanceTitle: 'Vigilance Brouillard Épais',
    vigilanceMessage: 'Brouillard dense réduisant la visibilité horizontale à moins de 200 mètres.',
    dangerDescription: 'Réduction brutale de la visibilité sur route.',
    triggerCriteria: `Brouillard dense WMO ${weatherCode} avec visibilité < 200m`,
    severityMetric: `Visibilité < 200 m • Humidité saturée`,
    impactsSummary: [
      'Visibilité fortement restreinte sur l’ensemble du réseau routier.',
      'Ralentissements des flux de transport aux heures matinales.'
    ],
    safetyInstructions: [
      'Allumez vos feux de croisement et feux antibrouillard.',
      'Respectez scrupuleusement les limitations de vitesse par visibilité réduite (50 km/h si visibilité < 50 m).'
    ]
  };
}
