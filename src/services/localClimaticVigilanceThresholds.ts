import { LocationPoint, DailyForecast, HourlyForecast, VigilanceLevel, VigilancePhenomenon } from '../types/weather';

export type ClimateProfileType = 
  | 'DESERT_ARID'          // Sahara, Sahel, Dubaï, Le Caire, Riyad, Atacama
  | 'HIGH_MOUNTAIN'        // Alpes, Pyrénées > 800m (Chamonix, Tignes, Briançon...)
  | 'MEDITERRANEAN_RUGGED' // Gard, Ardèche, Cévennes, Hérault, Var, PACA, Corse
  | 'OCEANIC_COASTAL'      // Bretagne, Manche, Littoral Atlantique (Brest, Cherbourg...)
  | 'CONTINENTAL_PLAINS'   // Bassin Parisien, Grand-Est, Centre, Bourgogne
  | 'TROPICAL_EQUATORIAL'; // DOM-TOM, Antilles, Réunion, Guyane

export interface LocalClimaticProfile {
  type: ClimateProfileType;
  label: string;
  shortTag: string;
  description: string;
  soilVulnerability: string;
  // Specific thresholds
  rain: {
    jauneMm: number;
    orangeMm: number;
    rougeMm: number;
    hourlyPeakJauneMm: number;
    hourlyPeakOrangeMm: number;
    hourlyPeakRougeMm: number;
    contextNote: string;
  };
  snow: {
    jauneCm: number;
    orangeCm: number;
    rougeCm: number;
    contextNote: string;
  };
  heat: {
    jauneTx: number;
    orangeTx: number;
    orangeTn: number;
    rougeTx: number;
    rougeTn: number;
    contextNote: string;
  };
  cold: {
    jauneTn: number;
    orangeTn: number;
    rougeTn: number;
    contextNote: string;
  };
  wind: {
    jauneGustKmH: number;
    orangeGustKmH: number;
    rougeGustKmH: number;
    contextNote: string;
  };
}

export type FogType = 
  | 'RAYONNEMENT'    // Radiation fog (nuit claire, vent faible < 10 km/h, plaine/vallée)
  | 'ADVECTION'      // Advection fog (air doux/humide sur mer ou sol froid, brise maritime)
  | 'INVERSION'      // Inversion fog (mer de nuages en fond de vallée, anticyclone d'hiver)
  | 'OROGRAPHIQUE'   // Upslope fog (relief, ascension adiabatique le long des pentes)
  | 'EVAPORATION'    // Steam fog (air glacial sur étendue d'eau plus tiède, lac/rivière)
  | 'GIVRANT'        // Freezing fog (gouttelettes en surfusion, T <= 0°C, verglas sur structures)
  | 'DENSE_CLASSIQUE';// Dense fog standard

export interface FogDiagnostic {
  type: FogType;
  label: string;
  phenomenonKey: VigilancePhenomenon;
  emoji: string;
  scientificExplanation: string;
  driverMechanism: string;
  hazardsDescription: string;
  isFreezing: boolean;
}

/**
 * Detects the local climate profile of any station worldwide
 */
export function getLocalClimaticProfile(station?: LocationPoint): LocalClimaticProfile {
  const name = (station?.name || '').toLowerCase();
  const region = (station?.region || '').toLowerCase();
  const dept = (station?.department || '').toLowerCase();
  const country = (station?.country || '').toLowerCase();
  const climateZone = (station?.climateZone || '').toLowerCase();
  const alt = station?.altitude ?? 150;
  const lat = station?.latitude ?? 46.5;
  const lon = station?.longitude ?? 2.5;

  // 1. DESERT & HYPER-ARID ZONES (Sahara, Moyen-Orient, Égypte, Atacama...)
  const isDesert = (
    climateZone.includes('aride') ||
    climateZone.includes('désert') ||
    climateZone.includes('desert') ||
    climateZone.includes('sahara') ||
    country.includes('algérie') ||
    country.includes('algeria') ||
    country.includes('égypte') ||
    country.includes('egypt') ||
    country.includes('émirats') ||
    country.includes('emirates') ||
    country.includes('arabie') ||
    country.includes('saudi') ||
    country.includes('maroc') && (name.includes('ouarzazate') || name.includes('zagora') || name.includes('erfoud')) ||
    name.includes('sahara') ||
    name.includes('tamanrasset') ||
    name.includes('dubaï') ||
    name.includes('dubai') ||
    name.includes('cairo') ||
    name.includes('caire') ||
    name.includes('riyadh') ||
    name.includes('riyad') ||
    name.includes('doha') ||
    name.includes('djanet') ||
    name.includes('adrar') ||
    name.includes('ghardaïa') ||
    name.includes('in salah') ||
    name.includes('timimoun') ||
    (lat >= 16 && lat <= 32 && lon >= -15 && lon <= 45 && alt < 1200 && !region.includes('côte') && !climateZone.includes('méditerranéen'))
  );

  if (isDesert) {
    return {
      type: 'DESERT_ARID',
      label: 'Climat Désertique & Aride (Sahara / Moyen-Orient)',
      shortTag: 'Désert Aride',
      description: 'Environnement hyper-aride caractérisé par des sols encroûtés et desséchés à très faible perméabilité initiale.',
      soilVulnerability: 'Sols calcaires et sableux tassés imperméables : ruissellement immédiat à 100% dans les lits d\'oueds asséchés avec risque mortel de crue éclair (flash flood).',
      rain: {
        jauneMm: 4.0,           // 4 mm is already unusual
        orangeMm: 10.0,         // 10 mm is catastrophic flash flood in the desert!
        rougeMm: 22.0,          // 22 mm is an historic once-in-a-century deluge
        hourlyPeakJauneMm: 2.5,
        hourlyPeakOrangeMm: 6.0,
        hourlyPeakRougeMm: 12.0,
        contextNote: 'Dans le Sahara, 10 mm représentent plusieurs mois à une année de précipitations : crues éclairs destructrices d\'oueds.'
      },
      snow: {
        jauneCm: 0.2,
        orangeCm: 1.5,
        rougeCm: 5.0,
        contextNote: 'La neige au Sahara est un phénomène rarissime et hautement perturbant.'
      },
      heat: {
        jauneTx: 38.0,
        orangeTx: 44.0,
        orangeTn: 27.0,
        rougeTx: 48.5,
        rougeTn: 31.0,
        contextNote: 'Seuils caniculaires adaptés aux fortes chaleurs sahariennes habituelles.'
      },
      cold: {
        jauneTn: 3.0,
        orangeTn: -1.0,
        rougeTn: -5.0,
        contextNote: 'Fort rayonnement nocturne désertique : gelées destructrices pour les oasis.'
      },
      wind: {
        jauneGustKmH: 60,
        orangeGustKmH: 80,
        rougeGustKmH: 105,
        contextNote: 'Vent de sable (Sirocco/Khamsin) réduisant la visibilité à quelques mètres.'
      }
    };
  }

  // 2. HIGH MOUNTAIN & ALPINE RELIEFS (Altitude >= 750m, Alpes, Pyrénées, Massif Central haut)
  const isMountain = alt >= 750 || (station?.isMountain ?? false) || [
    'chamonix', 'briançon', 'tignes', 'val d\'isère', 'alpe d\'huez', 'font-romeu', 
    'barèges', 'la mongie', 'saint-lary', 'superbesse', 'le mont-dore', 'mouthe',
    'embrun', 'gap', 'briancon', 'modane', 'albertville'
  ].some(k => name.includes(k));

  if (isMountain) {
    return {
      type: 'HIGH_MOUNTAIN',
      label: 'Climat Montagnard Alpin & Haute Altitude',
      shortTag: 'Montagne & Altitude',
      description: 'Zones de relief accidenté dotées de bassins versants drainants et habituées aux fortes intempéries orographiques.',
      soilVulnerability: 'Pentes rocheuses et moraines très drainantes : 10 mm d\'eau y sont ordinaires et facilement absorbés sans submersion.',
      rain: {
        jauneMm: 22.0,          // 10 mm is ordinary in the Alps! 22 mm required for Jaune
        orangeMm: 55.0,         // 55 mm for Orange
        rougeMm: 115.0,         // 115 mm for Rouge
        hourlyPeakJauneMm: 12.0,
        hourlyPeakOrangeMm: 28.0,
        hourlyPeakRougeMm: 50.0,
        contextNote: 'En montagne, 10 mm est un cumul ordinaire sans risque hydrologique majeur ; les seuils sont relevés.'
      },
      snow: {
        jauneCm: 10.0,          // Mountain has dedicated snow plows: 10 cm is standard Jaune
        orangeCm: 30.0,         // 30 cm needed for Orange
        rougeCm: 65.0,          // 65 cm for Rouge
        contextNote: 'Équipements hivernaux et déneigement permanent : seuils neige calibrés pour la viabilité hivernale montagnarde.'
      },
      heat: {
        jauneTx: 28.0,
        orangeTx: 31.0,
        orangeTn: 16.0,
        rougeTx: 34.0,
        rougeTn: 19.0,
        contextNote: 'En altitude, une température > 30°C est exceptionnelle et accélère la fonte du pergélisol.'
      },
      cold: {
        jauneTn: -6.0,          // -5°C is routine in winter
        orangeTn: -13.0,
        rougeTn: -22.0,
        contextNote: 'Climat habitué au gel permanent : vigilance grand froid réservée aux vagues polaires sévères.'
      },
      wind: {
        jauneGustKmH: 75,
        orangeGustKmH: 105,
        rougeGustKmH: 140,
        contextNote: 'Vent violent amplifié sur les crêtes et cols d\'altitude.'
      }
    };
  }

  // 3. MEDITERRANEAN & CEVENNES (Gard, Ardèche, Hérault, PACA, Corse...)
  const isMediterranean = (
    climateZone.includes('méditerranéen') ||
    climateZone.includes('mediterraneen') ||
    ['30', '34', '11', '66', '13', '83', '06', '84', '2a', '2b', '07', '26'].some(d => dept.includes(d)) ||
    ['corse', 'provence', 'marseille', 'nice', 'toulon', 'nîmes', 'montpellier', 'perpignan', 'cannes', 'antibes', 'ajaccio', 'bastia'].some(k => name.includes(k) || region.includes(k))
  );

  if (isMediterranean) {
    return {
      type: 'MEDITERRANEAN_RUGGED',
      label: 'Climat Méditerranéen & Piémont Cévenol',
      shortTag: 'Méditerranée & Cévennes',
      description: 'Régime d\'orages violents et épisodes cévenols sur reliefs calcaires et cours d\'eau torrentiels.',
      soilVulnerability: 'Sols calcaires arides en été mais ravinés lors des épisodes méditerranéens avec montées de cours d\'eau soudaines.',
      rain: {
        jauneMm: 25.0,
        orangeMm: 70.0,
        rougeMm: 150.0,
        hourlyPeakJauneMm: 18.0,
        hourlyPeakOrangeMm: 40.0,
        hourlyPeakRougeMm: 70.0,
        contextNote: 'Les épisodes cévenols et méditerranéens requièrent des seuils élevés car les pluies sont courtes mais diluviennes.'
      },
      snow: {
        jauneCm: 0.5,           // On the Mediterranean coast, 1 cm paralyzes everything!
        orangeCm: 2.5,
        rougeCm: 8.0,
        contextNote: 'Sur le littoral méditerranéen, 2 cm de neige entraînent la paralysie totale des transports (absence d\'engins).'
      },
      heat: {
        jauneTx: 34.0,
        orangeTx: 37.5,
        orangeTn: 22.5,
        rougeTx: 41.5,
        rougeTn: 25.5,
        contextNote: 'Habitudes estivales et architecture adaptées aux chaleurs méditerranéennes.'
      },
      cold: {
        jauneTn: 0.5,
        orangeTn: -2.5,
        rougeTn: -6.0,
        contextNote: 'Gelées blanches rares menaçant les vergers d\'agrumes et la végétation méditerranéenne.'
      },
      wind: {
        jauneGustKmH: 70,
        orangeGustKmH: 95,
        rougeGustKmH: 125,
        contextNote: 'Mistral et Tramontane fréquents : seuils ajustés aux couloirs de vent rhodaniens.'
      }
    };
  }

  // 4. OCEANIC COASTAL (Bretagne, Normandie, Côte Atlantique, Manche)
  const isOceanicCoastal = (
    climateZone.includes('océanique') ||
    ['29', '22', '56', '35', '50', '14', '76', '85', '44', '17', '33', '40', '64'].some(d => dept.includes(d)) ||
    ['brest', 'saint-malo', 'cherbourg', 'quimper', 'lorient', 'vannes', 'rennes', 'nantes', 'la rochelle', 'biarritz', 'bayonne'].some(k => name.includes(k)) ||
    region.includes('bretagne') || region.includes('normandie')
  );

  if (isOceanicCoastal) {
    return {
      type: 'OCEANIC_COASTAL',
      label: 'Climat Océanique Côtier (Façade Manche & Atlantique)',
      shortTag: 'Littoral Océanique',
      description: 'Ambiance maritime tempérée avec passages perturbés fréquents, vent marin et brouillards d\'advection côtiers.',
      soilVulnerability: 'Sols bocagers humides et vallées encaissées habitués aux crachins réguliers mais vulnérables aux tempêtes marines.',
      rain: {
        jauneMm: 16.0,
        orangeMm: 42.0,
        rougeMm: 85.0,
        hourlyPeakJauneMm: 6.0,
        hourlyPeakOrangeMm: 15.0,
        hourlyPeakRougeMm: 30.0,
        contextNote: 'Pluies régulières océaniques : seuils adaptés aux sols souvent gorgés d\'eau en saison froide.'
      },
      snow: {
        jauneCm: 1.5,
        orangeCm: 5.0,
        rougeCm: 14.0,
        contextNote: 'Influence de l\'océan limitant la tenue de la neige au sol.'
      },
      heat: {
        jauneTx: 29.0,
        orangeTx: 32.5,
        orangeTn: 18.0,
        rougeTx: 36.5,
        rougeTn: 21.0,
        contextNote: 'Seuils caniculaires abaissés en raison de l\'absence d\'équipements de climatisation et de l\'air iodé humide.'
      },
      cold: {
        jauneTn: -1.0,
        orangeTn: -4.5,
        rougeTn: -9.0,
        contextNote: 'Gelées rares modérées par la proximité marine.'
      },
      wind: {
        jauneGustKmH: 75,
        orangeGustKmH: 100,
        rougeGustKmH: 130,
        contextNote: 'Coups de vent fréquents : vigilance orange réservée aux tempêtes synoptiques creuses.'
      }
    };
  }

  // 5. TROPICAL & EQUATORIAL (Antilles, Réunion, Guyane...)
  const isTropical = (
    climateZone.includes('tropical') ||
    climateZone.includes('équatorial') ||
    ['971', '972', '973', '974', '976'].some(d => dept.includes(d)) ||
    country.includes('guadeloupe') || country.includes('martinique') || country.includes('réunion') || country.includes('guyane')
  );

  if (isTropical) {
    return {
      type: 'TROPICAL_EQUATORIAL',
      label: 'Climat Tropical & Équatorial',
      shortTag: 'Tropical Humide',
      description: 'Climat chaud et très arrosé avec régimes d\'ondes tropicales et risque cyclonique.',
      soilVulnerability: 'Sols volcaniques ou argileux exposés aux glissements de terrain sous fortes lames d\'eau.',
      rain: {
        jauneMm: 35.0,
        orangeMm: 85.0,
        rougeMm: 170.0,
        hourlyPeakJauneMm: 25.0,
        hourlyPeakOrangeMm: 50.0,
        hourlyPeakRougeMm: 90.0,
        contextNote: 'Pluies tropicales massives : seuils calibrés sur les grains tropicaux intenses.'
      },
      snow: {
        jauneCm: 999,
        orangeCm: 999,
        rougeCm: 999,
        contextNote: 'Phénomène inexistant en zone tropicale de basse altitude.'
      },
      heat: {
        jauneTx: 34.0,
        orangeTx: 36.0,
        orangeTn: 26.0,
        rougeTx: 38.0,
        rougeTn: 28.0,
        contextNote: 'Humidex tropical éprouvant avec nuits chaudes permanentes.'
      },
      cold: {
        jauneTn: 16.0,
        orangeTn: 13.0,
        rougeTn: 10.0,
        contextNote: 'Températures en dessous de 16°C inhabituelles en zone littorale tropicale.'
      },
      wind: {
        jauneGustKmH: 75,
        orangeGustKmH: 100,
        rougeGustKmH: 140,
        contextNote: 'Seuils tempétueux et cycloniques.'
      }
    };
  }

  // 6. CONTINENTAL PLAINS & DEFAULT INLAND (Bassin Parisien, Centre, Grand-Est, Bourgogne)
  return {
    type: 'CONTINENTAL_PLAINS',
    label: 'Climat Tempéré Continental & Plaines Intérieures',
    shortTag: 'Plaines Intérieures',
    description: 'Régime tempéré semi-continental aux quatre saisons marquées avec contrastes saisonniers équilibrés.',
    soilVulnerability: 'Bassin sédimentaire avec réseaux hydrographiques structurés et saturation hivernale progressive.',
    rain: {
      jauneMm: 12.0,
      orangeMm: 35.0,
      rougeMm: 75.0,
      hourlyPeakJauneMm: 7.0,
      hourlyPeakOrangeMm: 18.0,
      hourlyPeakRougeMm: 35.0,
      contextNote: 'Seuils standards métropolitains en plaine semi-continentale.'
    },
    snow: {
      jauneCm: 2.0,
      orangeCm: 6.0,
      rougeCm: 16.0,
      contextNote: 'Neige tenant au sol provoquant des perturbations routières significatives en milieu urbain.'
    },
    heat: {
      jauneTx: 32.0,
      orangeTx: 35.0,
      orangeTn: 20.0,
      rougeTx: 39.0,
      rougeTn: 22.5,
      contextNote: 'Seuils caniculaires basés sur la surmortalité sanitaire estivale en plaine.'
    },
    cold: {
      jauneTn: -1.0,
      orangeTn: -5.5,
      rougeTn: -11.0,
      contextNote: 'Gelées blanches fréquentes ; alerte grand froid dès -5.5°C avec journées sans dégel.'
    },
    wind: {
      jauneGustKmH: 65,
      orangeGustKmH: 90,
      rougeGustKmH: 125,
      contextNote: 'Risque de chutes de branches et tuiles en milieu urbain dense.'
    }
  };
}

/**
 * Accurately diagnoses the exact meteorological type of fog
 * based on thermodynamics, station geography, wind and time of day.
 */
export function diagnoseFogType(
  day: DailyForecast,
  hoursToUse: HourlyForecast[],
  station?: LocationPoint
): FogDiagnostic {
  const minTemp = day.tempMin ?? (hoursToUse.length > 0 ? Math.min(...hoursToUse.map(h => h.temperature)) : 5);
  const maxWind = day.windSpeedMax ?? 10;
  const alt = station?.altitude ?? 150;
  const isMountain = alt >= 700 || (station?.isMountain ?? false);
  const profile = getLocalClimaticProfile(station);
  const isCoast = profile.type === 'OCEANIC_COASTAL' || profile.type === 'MEDITERRANEAN_RUGGED';

  // 1. BROUILLARD GIVRANT (Freezing Fog)
  // Strictly when temperature is freezing (<= 0.0°C) with water droplets in supercooling depositing rime
  if (minTemp <= 0.0 || day.weatherCode === 48 || hoursToUse.some(h => [45, 48].includes(h.weatherCode) && h.temperature <= 0.0)) {
    return {
      type: 'GIVRANT',
      label: 'Brouillard Givrant',
      phenomenonKey: 'BROUILLARD_GIVRANT',
      emoji: '❄️🌫️',
      scientificExplanation: `Brouillard constitué de micro-gouttelettes d'eau liquide en surfusion par température négative (${minTemp}°C). Elles congèlent instantanément lors de tout impact avec le sol, les arbres ou la carrosserie.`,
      driverMechanism: 'Surfusion des gouttelettes liquides par températures sous 0°C avec dépôt immédiat de givre dur ou doux.',
      hazardsDescription: 'Dépôts glissants immédiats sur le réseau routier, verglas invisible (black ice) et givrage des câbles électriques.',
      isFreezing: true
    };
  }

  // 2. BROUILLARD D'INVERSION THERMIQUE / VALLÉE (Inversion / Valley Fog)
  // High pressure, valley relief or basin, cold moist air trapped under warmer air aloft
  if (isMountain || alt >= 350 || profile.type === 'HIGH_MOUNTAIN' || ['vallée', 'cuvette', 'combe', 'plaine'].some(k => (station?.name || '').toLowerCase().includes(k))) {
    return {
      type: 'INVERSION',
      label: 'Brouillard d\'Inversion Thermique (Mer de Nuages)',
      phenomenonKey: 'BROUILLARD_VALLEE',
      emoji: '⛰️🌫️',
      scientificExplanation: `Air froid et humide bloqué au fond des vallées ou bassins sous une couche d'inversion thermique anticyclonique plus chaude et sèche en altitude.`,
      driverMechanism: 'Piégeage radiatif sous couvercle d\'inversion thermique avec mer de nuages dense et soleil éclatant sur les sommets.',
      hazardsDescription: 'Visibilité nulle persistante toute la matinée voire l\'après-midi dans les fonds de vallées et cuvettes encaissées.',
      isFreezing: false
    };
  }

  // 3. BROUILLARD OROGRAPHIQUE / DE PENTE (Upslope Fog)
  // Mountain side with moist airflow forced upwards
  if (alt >= 500 && maxWind >= 12) {
    return {
      type: 'OROGRAPHIQUE',
      label: 'Brouillard Orographique (de Pente)',
      phenomenonKey: 'BROUILLARD_OROGRAPHIQUE',
      emoji: '🏔️🌫️',
      scientificExplanation: `Masse d'air humide contrainte de s'élever le long du relief ; la détente adiabatique abaisse la température au point de rosée et condense le nuage au niveau du sol.`,
      driverMechanism: 'Soulèvement dynamique forcé le long des versants montagneux et condensation immédiate.',
      hazardsDescription: 'Englobement soudain des cols routiers, sentiers de randonnée et crêtes dans une purée de pois dense.',
      isFreezing: false
    };
  }

  // 4. BROUILLARD D'ADVECTION / MARIN (Advection / Sea Fog)
  // Moist air mass moving over colder sea or coastal waters, winds 10-25 km/h
  if (isCoast || maxWind >= 10) {
    return {
      type: 'ADVECTION',
      label: 'Brouillard d\'Advection (Entrées Maritimes)',
      phenomenonKey: 'BROUILLARD_ADVECTION',
      emoji: '🌊🌫️',
      scientificExplanation: `Air doux et maritime saturé d'humidité transporté par le vent au-dessus d'une surface d'eau ou de sol plus froide, provoquant une condensation massive par contact.`,
      driverMechanism: 'Advection horizontale d\'une masse d\'air humide sur substrat plus froid ; nappe vaste et tenace pouvant durer toute la journée.',
      hazardsDescription: 'Nappe maritime épaisse avançant à l\'intérieur des terres, freinant la visibilité portuaire, maritime et côtière.',
      isFreezing: false
    };
  }

  // 5. BROUILLARD DE RAYONNEMENT (Radiation Fog)
  // Clear night, calm wind (< 10 km/h), high humidity, inland plain
  if (maxWind < 10) {
    return {
      type: 'RAYONNEMENT',
      label: 'Brouillard de Rayonnement',
      phenomenonKey: 'BROUILLARD_RAYONNEMENT',
      emoji: '🌾🌫️',
      scientificExplanation: `Refroidissement nocturne intense du sol par rayonnement infrarouge sous ciel dégagé et vent très faible (< 10 km/h). L'air en contact immédiat avec le sol atteint son point de rosée.`,
      driverMechanism: 'Refroidissement radiatif nocturne du sol sans brassage de vent ; dissipation graduelle par réchauffement solaire en milieu de journée.',
      hazardsDescription: 'Bancs de brouillard denses en fin de nuit et début de matinée dans les plaines et près des cours d\'eau.',
      isFreezing: false
    };
  }

  // 6. DEFAULT DENSE FOG
  return {
    type: 'DENSE_CLASSIQUE',
    label: 'Brouillard Dense',
    phenomenonKey: 'BROUILLARD_DENSE',
    emoji: '🌫️',
    scientificExplanation: `Forte concentration de gouttelettes d'eau en suspension dans l'air abaissant la visibilité horizontale sous les 200 mètres.`,
    driverMechanism: 'Saturation hygrométrique de la basse couche atmosphérique.',
    hazardsDescription: 'Réduction sévère de la visibilité sur l\'ensemble des réseaux de communication.',
    isFreezing: false
  };
}
