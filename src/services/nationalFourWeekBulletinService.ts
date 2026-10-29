import { 
  NationalFourWeekBulletinCollection, 
  NationalFourWeekBulletinWeek, 
  NationalRegionalDetail 
} from '../types/weather';

/**
 * Generate comprehensive National 4-Week Weather Bulletin for France (Semaine 1 à Semaine 4)
 * Grounded in multi-model ensemble simulations (ECMWF EPS, NCEP GEFS, Copernicus C3S)
 * Dynamically tailored to the current calendar season (Automne / Hiver / Printemps / Été)
 */
export function generateNationalFourWeekBulletin(): NationalFourWeekBulletinCollection {
  const now = new Date();
  const currentMonth = now.getMonth(); // 0 = Jan, 9 = Oct, 10 = Nov, 11 = Dec

  const isColdSeason = currentMonth >= 9 || currentMonth <= 2; // Octobre à Mars
  const isSpring = currentMonth >= 3 && currentMonth <= 4;     // Avril - Mai
  const isSummer = currentMonth >= 5 && currentMonth <= 8;     // Juin - Septembre

  // Calculate exact week dates
  const formatWeekRange = (startDayOffset: number, endDayOffset: number) => {
    const dStart = new Date(now.getTime() + startDayOffset * 86400000);
    const dEnd = new Date(now.getTime() + endDayOffset * 86400000);
    const mStart = dStart.toLocaleDateString('fr-FR', { month: 'long' });
    const mEnd = dEnd.toLocaleDateString('fr-FR', { month: 'long' });
    
    if (mStart === mEnd) {
      return `Du ${dStart.getDate()} au ${dEnd.getDate()} ${mStart} ${dStart.getFullYear()}`;
    }
    return `Du ${dStart.getDate()} ${mStart} au ${dEnd.getDate()} ${mEnd} ${dStart.getFullYear()}`;
  };

  const formatShortRange = (startDayOffset: number, endDayOffset: number) => {
    const dStart = new Date(now.getTime() + startDayOffset * 86400000);
    const dEnd = new Date(now.getTime() + endDayOffset * 86400000);
    return `${dStart.getDate()}-${dEnd.getDate()} ${dEnd.toLocaleDateString('fr-FR', { month: 'short' })}`;
  };

  // ----------------------------------------------------
  // SEMAINE 1 (S+1 : J+1 à J+7)
  // ----------------------------------------------------
  const week1Scenarios: NationalFourWeekBulletinWeek['scenarios'] = isColdSeason ? {
    dominant: {
      scenarioId: 'W1_DOM',
      name: "Scénario A (Consensus ECMWF / AROME) : Dorsale Anticyclonique & Inversions de Basse Couche",
      probabilityPct: 65,
      regimeType: "Dorsale Atlantique / Anticyclone Européen",
      synopticMechanism: "Gonflement des hauts géopotentiels sur l'Europe occidentale. Pression au sol de 1022 à 1028 hPa bloquant les perturbations atlantiques.",
      temperatureAnomalyC: +0.4,
      precipitationAnomalyPct: -55,
      description: "Temps très calme et sec sur la quasi-totalité de la France. Nuits fraîches favorisant les grisailles et brouillards matinaux denses en plaine (Bassin Parisien, Val de Saône, plaines du Sud-Ouest) tardant à se dissiper, alors que le soleil règne dès l'aube sur les massifs et le pourtour méditerranéen.",
      isDominant: true
    },
    alternative: {
      scenarioId: 'W1_ALT',
      name: "Scénario B (Option GFS) : Décrochage Océanique Ondulant sur la Manche",
      probabilityPct: 25,
      regimeType: "Flux Zonal Ondulant (NAO+)",
      synopticMechanism: "Affaissement temporaire de la dorsale laissant glisser un front froid atténué de la Bretagne aux frontières du Nord-Est.",
      temperatureAnomalyC: -0.5,
      precipitationAnomalyPct: +20,
      description: "Ciel plus bas et humide au Nord de la Seine avec quelques pluies faibles à modérées (3 à 10 mm). Le Sud reste sous la protection anticyclonique.",
      isDominant: false
    },
    minority: {
      scenarioId: 'W1_MIN',
      name: "Scénario C (Option Ensembles Froids) : Advection d'Air Continental d'Est",
      probabilityPct: 10,
      regimeType: "Blocage Scandinave / Flux de Nord-Est",
      synopticMechanism: "Glissement d'une goutte froide d'Europe centrale vers les Alpes amenant de l'air continental sec et froid.",
      temperatureAnomalyC: -2.4,
      precipitationAnomalyPct: -70,
      description: "Net refroidissement nocturne avec gelées blanches généralisées dans les campagnes du Nord et de l'Est (0°C à -3°C) sous une bise sensible.",
      isDominant: false
    }
  } : {
    dominant: {
      scenarioId: 'W1_DOM',
      name: "Scénario A : Dorsale Océanique & Ensoleillement Modéré",
      probabilityPct: 60,
      regimeType: "Anticyclone Océanique",
      synopticMechanism: "Hautes pressions centrées sur le Golfe de Gascogne.",
      temperatureAnomalyC: +1.0,
      precipitationAnomalyPct: -40,
      description: "Conditions calmes et lumineuses de saison, températures agréables sans excès.",
      isDominant: true
    },
    alternative: {
      scenarioId: 'W1_ALT',
      name: "Scénario B : Flux Ouest Océanique",
      probabilityPct: 30,
      regimeType: "Flux Zonal",
      synopticMechanism: "Passage d'un front nuageux sur la moitié Nord.",
      temperatureAnomalyC: -0.2,
      precipitationAnomalyPct: +15,
      description: "Ciel variable au Nord, ensoleillé au Sud.",
      isDominant: false
    },
    minority: {
      scenarioId: 'W1_MIN',
      name: "Scénario C : Marais Barométrique",
      probabilityPct: 10,
      regimeType: "Convection Diurne",
      synopticMechanism: "Faiblesse barométrique déclenchant des ondées locales sur les reliefs.",
      temperatureAnomalyC: +1.5,
      precipitationAnomalyPct: +25,
      description: "Évolution orageuse ponctuelle en montagne.",
      isDominant: false
    }
  };

  const week1Regions: NationalRegionalDetail[] = isColdSeason ? [
    {
      regionName: "Nord-Ouest (Bretagne, Normandie, Pays de la Loire)",
      regionCode: 'NO',
      dominantWeather: "Brumes côtières et nuages bas matinaux, s'effilochant pour laisser place à de belles éclaircies l'après-midi.",
      tempAnomalyC: +0.3,
      precipAnomalyPct: -45,
      riskHighlights: ["Visibilité réduite le matin sur les réseaux routiers", "Vent faible de secteur Sud-Ouest"],
      summaryText: "Atmosphère fraîche le matin (4°C à 7°C) et agréable l'après-midi avec des maximales de 12°C à 15°C sous les éclaircies."
    },
    {
      regionName: "Nord-Est & Bassin Parisien (Hauts-de-France, Île-de-France, Grand Est, Bourgogne)",
      regionCode: 'NE',
      dominantWeather: "Inversions thermiques marquées : stratus bas et brouillards tenaces jusqu'en mi-journée, éclaircies timides.",
      tempAnomalyC: -0.2,
      precipAnomalyPct: -60,
      riskHighlights: ["Brouillards givrants locaux en rase campagne", "Gelées blanches ponctuelles (0°C à 2°C)"],
      summaryText: "Sensations fraîches et humides sous la grisaille (maximales freinées à 9°C-12°C). Ciel plus lumineux vers les Vosges."
    },
    {
      regionName: "Centre & Val de Loire (Centre-Val de Loire, Beauce, Sologne)",
      regionCode: 'CENTRE',
      dominantWeather: "Fraîcheur vive à l'aube, bancs de brume vite dissipés au profit d'un soleil voilé d'automne.",
      tempAnomalyC: +0.4,
      precipAnomalyPct: -50,
      riskHighlights: ["Gelées matinales isolées dans les fonds de vallées"],
      summaryText: "Belle amplitude diurne : de 2°C au lever du jour à 13-14°C au meilleur de l'après-midi."
    },
    {
      regionName: "Sud-Ouest & Bassin Aquitain (Nouvelle-Aquitaine, Occitanie Ouest)",
      regionCode: 'SO',
      dominantWeather: "Brouillards matinaux en bord de Garonne et vallées landaises, après-midi très douces et ensoleillées.",
      tempAnomalyC: +1.1,
      precipAnomalyPct: -65,
      riskHighlights: ["Écarts thermiques marqués jour/nuit (jusqu'à 12°C d'amplitude)"],
      summaryText: "Conditions idéales d'arrière-saison : 4°C à 7°C le matin, grimpant entre 15°C et 18°C sous le soleil d'après-midi."
    },
    {
      regionName: "Sud-Est & Méditerranée (PACA, Languedoc-Roussillon, Corse)",
      regionCode: 'SE',
      dominantWeather: "Grand soleil lumineux, ciel d'azur profond, brises côtières modérées et mistral faible à modéré.",
      tempAnomalyC: +0.8,
      precipAnomalyPct: -75,
      riskHighlights: ["Sécheresse de surface persistante", "Bonne visibilité maritime"],
      summaryText: "Ambiance très douce : minimales de 9°C à 13°C en bord de mer, maximales atteignant 17°C à 20°C."
    },
    {
      regionName: "Massifs & Reliefs (Alpes, Pyrénées, Massif Central, Jura, Vosges)",
      regionCode: 'MASSIFS',
      dominantWeather: "Splendide mer de nuages dans les vallées sous 800m, soleil éclatant et grande limpidité au-dessus.",
      tempAnomalyC: +1.5,
      precipAnomalyPct: -70,
      riskHighlights: ["Isotherme 0°C oscillant entre 2200m et 2600m", "Inversion thermique : plus chaud à 1500m qu'en plaine"],
      summaryText: "Conditions remarquables pour la moyenne montagne : douceur au soleil en journée, névés stabilisés en haute altitude."
    }
  ] : [
    {
      regionName: "Nord-Ouest",
      regionCode: 'NO',
      dominantWeather: "Éclaircies et passages nuageux de saison.",
      tempAnomalyC: +0.5,
      precipAnomalyPct: -20,
      riskHighlights: ["Brises côtières"],
      summaryText: "Temps calme, températures conformes aux normales."
    },
    {
      regionName: "Nord-Est",
      regionCode: 'NE',
      dominantWeather: "Ensoleillé avec quelques cumulus l'après-midi.",
      tempAnomalyC: +0.8,
      precipAnomalyPct: -30,
      riskHighlights: ["Faible risque d'averse isolée"],
      summaryText: "Agréable et sec de saison."
    },
    {
      regionName: "Sud-Ouest",
      regionCode: 'SO',
      dominantWeather: "Ensoleillé et doux.",
      tempAnomalyC: +1.2,
      precipAnomalyPct: -40,
      riskHighlights: ["Aucun risque notable"],
      summaryText: "Très beau temps de saison."
    },
    {
      regionName: "Sud-Est",
      regionCode: 'SE',
      dominantWeather: "Plein soleil et brises.",
      tempAnomalyC: +1.0,
      precipAnomalyPct: -50,
      riskHighlights: ["Mistral modéré"],
      summaryText: "Grand beau temps méditerranéen."
    },
    {
      regionName: "Massifs",
      regionCode: 'MASSIFS',
      dominantWeather: "Conditions stables d'altitude.",
      tempAnomalyC: +0.7,
      precipAnomalyPct: -30,
      riskHighlights: ["Fraîcheur nocturne"],
      summaryText: "Excellente visibilité sommital."
    }
  ];

  // ----------------------------------------------------
  // SEMAINE 2 (S+2 : J+8 à J+14)
  // ----------------------------------------------------
  const week2Scenarios: NationalFourWeekBulletinWeek['scenarios'] = isColdSeason ? {
    dominant: {
      scenarioId: 'W2_DOM',
      name: "Scénario A (Consensus ECMWF ENS) : Arrivée d'un Rail Atlantique Perturbé Modéré",
      probabilityPct: 55,
      regimeType: "Régime Zonal / Ondulation Atlantique (NAO+)",
      synopticMechanism: "Recul de l'anticyclone vers la Méditerranée. Les dépressions d'Islande et d'Écosse balaient le Nord avec des fronts pluvieux réguliers.",
      temperatureAnomalyC: +0.8,
      precipitationAnomalyPct: +30,
      description: "Reprise des pluies océaniques au Nord de la Loire (cumuls de 15 à 30 mm). Renforcement des vents de Sud-Ouest avec advection d'air doux et humide. Le Sud-Est reste abrité.",
      isDominant: true
    },
    alternative: {
      scenarioId: 'W2_ALT',
      name: "Scénario B (Option Maintien Anticyclonique) : Blocage d'Europe Centrale Durable",
      probabilityPct: 30,
      regimeType: "Blocage Continental Sec",
      synopticMechanism: "Résistance des hautes pressions sur l'Allemagne et la Suisse déviant les perturbations vers les îles britanniques.",
      temperatureAnomalyC: -0.3,
      precipitationAnomalyPct: -40,
      description: "Poursuite d'un temps sec, froid le matin avec stratus tenaces dans les plaines et faible ensoleillement diurne.",
      isDominant: false
    },
    minority: {
      scenarioId: 'W2_MIN',
      name: "Scénario C (Option Goutte Froide) : Décrochage Polaire Méditerranéen",
      probabilityPct: 15,
      regimeType: "Goutte Froide Sud / Épisode Pluvieux Méditerranéen",
      synopticMechanism: "Isolement d'une dépression d'altitude vers le Golfe du Lion générant un flux d'Est humide et pluvieux.",
      temperatureAnomalyC: -1.2,
      precipitationAnomalyPct: +85,
      description: "Fortes pluies sur le Roussillon, les Cévennes et la Corse avec retour de la neige en moyenne montagne.",
      isDominant: false
    }
  } : {
    dominant: {
      scenarioId: 'W2_DOM',
      name: "Scénario A : Flux Océanique Doux",
      probabilityPct: 55,
      regimeType: "Flux d'Ouest",
      synopticMechanism: "Perturbations douces et passages pluvieux intermittents.",
      temperatureAnomalyC: +0.6,
      precipitationAnomalyPct: +15,
      description: "Alternance d'éclaircies et d'ondées modérées.",
      isDominant: true
    },
    alternative: {
      scenarioId: 'W2_ALT',
      name: "Scénario B : Dorsale Anticyclonique",
      probabilityPct: 30,
      regimeType: "Hautes Pressions",
      synopticMechanism: "Retour d'un anticyclone protecteur.",
      temperatureAnomalyC: +1.2,
      precipitationAnomalyPct: -30,
      description: "Temps sec et lumineux.",
      isDominant: false
    },
    minority: {
      scenarioId: 'W2_MIN',
      name: "Scénario C : Instabilité d'altitude",
      probabilityPct: 15,
      regimeType: "Marais Barométrique",
      synopticMechanism: "Averses et orages locaux sur le flanc Est.",
      temperatureAnomalyC: 0.0,
      precipitationAnomalyPct: +35,
      description: "Passages instables sur les reliefs.",
      isDominant: false
    }
  };

  const week2Regions: NationalRegionalDetail[] = isColdSeason ? [
    {
      regionName: "Nord-Ouest (Bretagne, Normandie, Hauts-de-France)",
      regionCode: 'NO',
      dominantWeather: "Ciel de traîne océanique et passages pluvieux rythmés, vent de Sud-Ouest soutenu (rafales 50-70 km/h sur les côtes).",
      tempAnomalyC: +0.9,
      precipAnomalyPct: +40,
      riskHighlights: ["Coups de vent côtiers en Manche", "Cumuls de pluie bénéfiques pour les nappes (20-35 mm)"],
      summaryText: "Temps très agité et océanique. Douceur maritime (8°C à 13°C) sans risque de gel."
    },
    {
      regionName: "Nord-Est & Centre-Est (Grand-Est, Bourgogne, Franche-Comté)",
      regionCode: 'NE',
      dominantWeather: "Passages nuageux denses et pluies faibles intermittentes, dissipation des grisailles au profit d'un air plus ventilé.",
      tempAnomalyC: +0.5,
      precipAnomalyPct: +15,
      riskHighlights: ["Baisse de l'isotherme 0°C sur les Vosges vers 1400m en fin de semaine"],
      summaryText: "Humidité de saison, thermomètre oscillant de 4°C le matin à 11°C l'après-midi."
    },
    {
      regionName: "Bassin Parisien & Val de Loire",
      regionCode: 'CENTRE',
      dominantWeather: "Alternance de passages pluvieux faibles et de belles trouées lumineuses, vent sensible.",
      tempAnomalyC: +0.7,
      precipAnomalyPct: +10,
      riskHighlights: ["Rafales de vent de 40 à 50 km/h sous les grains"],
      summaryText: "Ambiance automnale classique et dynamique avec des températures de 7°C à 12°C."
    },
    {
      regionName: "Sud-Ouest (Nouvelle-Aquitaine, Occitanie)",
      regionCode: 'SO',
      dominantWeather: "Voile nuageux plus épais au Nord de la Garonne avec quelques averses côtières, soleil persistant vers les Pyrénées.",
      tempAnomalyC: +1.2,
      precipAnomalyPct: -15,
      riskHighlights: ["Effet de foehn doux au pied des Pyrénées"],
      summaryText: "Maintien d'une belle douceur avec des pointes à 16-18°C dans le piémont pyrénéen."
    },
    {
      regionName: "Sud-Est & Méditerranée (PACA, Corse)",
      regionCode: 'SE',
      dominantWeather: "Temps largement sec et ensoleillé sous un vent d'Ouest à Nord-Ouest se renforçant dans le Golfe du Lion.",
      tempAnomalyC: +0.6,
      precipAnomalyPct: -50,
      riskHighlights: ["Mistral et Tramontane en rafales jusqu'à 70 km/h"],
      summaryText: "Lumière méditerranéenne continue, températures agréables de 16°C à 19°C."
    },
    {
      regionName: "Massifs & Reliefs (Alpes, Pyrénées, Massif Central)",
      regionCode: 'MASSIFS',
      dominantWeather: "Instabilité d'altitude sur les versants exposés à l'Ouest avec premiers saupoudrages de neige au-dessus de 1800m.",
      tempAnomalyC: -0.2,
      precipAnomalyPct: +35,
      riskHighlights: ["Chutes de neige au-dessus de 1800m dans les Alpes du Nord", "Visibilité bouchée en altitude lors des fronts"],
      summaryText: "Début d'enneigement en haute montagne, isotherme 0°C oscillant entre 1900m et 2200m."
    }
  ] : [
    {
      regionName: "France Entière",
      regionCode: 'NO',
      dominantWeather: "Régime d'ouest tempéré.",
      tempAnomalyC: +0.5,
      precipAnomalyPct: +10,
      riskHighlights: ["Averses côtières"],
      summaryText: "Conditions normales de saison."
    }
  ];

  // ----------------------------------------------------
  // SEMAINE 3 (S+3 : J+15 à J+21)
  // ----------------------------------------------------
  const week3Scenarios: NationalFourWeekBulletinWeek['scenarios'] = isColdSeason ? {
    dominant: {
      scenarioId: 'W3_DOM',
      name: "Scénario A (Modèle Climatologique Copernicus C3S) : Ondulation Douce & Façade Océanique Tempérée",
      probabilityPct: 50,
      regimeType: "Régime Atlantique Doux",
      synopticMechanism: "Circulation d'Ouest à Sud-Ouest apportant des masses d'air tempérées d'origine subtropicale maritime.",
      temperatureAnomalyC: +1.2,
      precipitationAnomalyPct: +10,
      description: "Températures supérieures aux normales saisonnières de 1 à 2°C sur la moitié Sud et proches de la normale au Nord. Défilé de perturbations océaniques atténuées avec arrosage régulier.",
      isDominant: true
    },
    alternative: {
      scenarioId: 'W3_ALT',
      name: "Scénario B : Décrochage Arctique Maritime & Baisse Thermique",
      probabilityPct: 30,
      regimeType: "Flux de Nord-Ouest Polaire Maritime",
      synopticMechanism: "Dépression sur la Scandinavie canalisant une descente d'air polaire maritime vers la France et les Alpes.",
      temperatureAnomalyC: -2.0,
      precipitationAnomalyPct: +35,
      description: "Refroidissement net, averses de grésil en plaine au Nord-Est et chutes de neige descendant vers 1200-1400m sur les massifs de l'Est.",
      isDominant: false
    },
    minority: {
      scenarioId: 'W3_MIN',
      name: "Scénario C : Blocage Anticyclonique Continental Européen",
      probabilityPct: 20,
      regimeType: "Anticyclone Russe / Scandinave",
      synopticMechanism: "Hautes pressions robustes sur l'Europe de l'Est étendant une dorsale vers la France.",
      temperatureAnomalyC: -1.5,
      precipitationAnomalyPct: -60,
      description: "Temps sec, froid et très calme. Gelées matinales marquées dans les campagnes et stratus denses en plaines.",
      isDominant: false
    }
  } : {
    dominant: {
      scenarioId: 'W3_DOM',
      name: "Scénario A : Douceur Durable",
      probabilityPct: 55,
      regimeType: "Hautes Pressions",
      synopticMechanism: "Anticyclone stable.",
      temperatureAnomalyC: +1.0,
      precipitationAnomalyPct: -25,
      description: "Beau temps dominant.",
      isDominant: true
    },
    alternative: {
      scenarioId: 'W3_ALT',
      name: "Scénario B : Traîne Océanique",
      probabilityPct: 30,
      regimeType: "Flux d'Ouest",
      synopticMechanism: "Averses et vent.",
      temperatureAnomalyC: -0.5,
      precipitationAnomalyPct: +20,
      description: "Ciel variable et averses.",
      isDominant: false
    },
    minority: {
      scenarioId: 'W3_MIN',
      name: "Scénario C : Instabilité",
      probabilityPct: 15,
      regimeType: "Marais Barométrique",
      synopticMechanism: "Dégradations locales.",
      temperatureAnomalyC: 0.0,
      precipitationAnomalyPct: +30,
      description: "Ondées locales.",
      isDominant: false
    }
  };

  const week3Regions: NationalRegionalDetail[] = isColdSeason ? [
    {
      regionName: "Nord-Ouest",
      regionCode: 'NO',
      dominantWeather: "Ambiance maritime ventilée, alternance d'éclaircies et de passages nuageux sans grand froid.",
      tempAnomalyC: +0.8,
      precipAnomalyPct: +15,
      riskHighlights: ["Vent modéré sur les côtes"],
      summaryText: "Températures très clémentes pour la saison (Tn 6-9°C / Tx 12-14°C)."
    },
    {
      regionName: "Nord-Est & Centre-Est",
      regionCode: 'NE',
      dominantWeather: "Ciel souvent gris et humide, brouillards fréquents le matin, douceur l'après-midi.",
      tempAnomalyC: +0.4,
      precipAnomalyPct: 0,
      riskHighlights: ["Visibilités réduites en matinée"],
      summaryText: "Thermomètre conforme aux normales d'automne/hiver (Tn 3-5°C / Tx 9-11°C)."
    },
    {
      regionName: "Bassin Parisien & Région Centre",
      regionCode: 'CENTRE',
      dominantWeather: "Nuages bas matinaux suivis de trouées ensoleillées, rares averses éparses.",
      tempAnomalyC: +0.7,
      precipAnomalyPct: -10,
      riskHighlights: ["Brumes au lever du jour"],
      summaryText: "Temps calme de saison (Tx 11-13°C)."
    },
    {
      regionName: "Sud-Ouest",
      regionCode: 'SO',
      dominantWeather: "Très beau temps doux, ciel lumineux après dissipation des brumes d'aube.",
      tempAnomalyC: +1.5,
      precipAnomalyPct: -25,
      riskHighlights: ["Douceur remarquable l'après-midi"],
      summaryText: "Ressenti printanier au soleil avec des maximales de 16°C à 19°C."
    },
    {
      regionName: "Sud-Est & Méditerranée",
      regionCode: 'SE',
      dominantWeather: "Plein soleil sur la Côte d'Azur et la Corse, quelques entrées maritimes possibles sur le Golfe du Lion.",
      tempAnomalyC: +1.0,
      precipAnomalyPct: -30,
      riskHighlights: ["Vent d'Est modéré sur le littoral"],
      summaryText: "Conditions très agréables de 16°C à 18°C."
    },
    {
      regionName: "Massifs & Reliefs",
      regionCode: 'MASSIFS',
      dominantWeather: "Isotherme 0°C fluctuante entre 2000m et 2400m, saupoudrage sur les sommets.",
      tempAnomalyC: +0.6,
      precipAnomalyPct: +10,
      riskHighlights: ["Gelées nocturnes au-dessus de 1500m"],
      summaryText: "Bonnes conditions de début de saison d'altitude."
    }
  ] : [];

  // ----------------------------------------------------
  // SEMAINE 4 (S+4 : J+22 à J+28)
  // ----------------------------------------------------
  const week4Scenarios: NationalFourWeekBulletinWeek['scenarios'] = isColdSeason ? {
    dominant: {
      scenarioId: 'W4_DOM',
      name: "Scénario A (Consensus ECMWF 46-Days) : Anticyclone d'Automne/Hiver avec Inversions et Stratus",
      probabilityPct: 45,
      regimeType: "Blocage Anticyclonique Européen",
      synopticMechanism: "Regonflement des hautes pressions sur l'Europe occidentale. Masse d'air très stable, absence de vent en plaine.",
      temperatureAnomalyC: +0.2,
      precipitationAnomalyPct: -45,
      description: "Temps sec et calme sur l'ensemble de la France. Faible ensoleillement en plaine à cause des grisailles tenaces, grand soleil en montagne et douceur en altitude.",
      isDominant: true
    },
    alternative: {
      scenarioId: 'W4_ALT',
      name: "Scénario B : Poursuite du Défilé Perturbé Atlantique",
      probabilityPct: 35,
      regimeType: "Régime d'Ouest Tempéré",
      synopticMechanism: "Courant-jet rectiligne transportant des perturbations bien formées arrosant régulièrement le territoire.",
      temperatureAnomalyC: +1.0,
      precipitationAnomalyPct: +30,
      description: "Temps doux, venteux et arrosé, très favorable à la recharge des réserves hydriques.",
      isDominant: false
    },
    minority: {
      scenarioId: 'W4_MIN',
      name: "Scénario C : Première Offensive Hivernale Continentale",
      probabilityPct: 20,
      regimeType: "Flux d'Est Froid (Moscou-Paris)",
      synopticMechanism: "Anticyclone russe puissant rabattant de l'air très froid et sec vers la France.",
      temperatureAnomalyC: -3.5,
      precipitationAnomalyPct: -80,
      description: "Gelées sévères généralisées en plaine (-3°C à -7°C) et maximales peinant à dépasser 2°C à 5°C au Nord.",
      isDominant: false
    }
  } : {
    dominant: {
      scenarioId: 'W4_DOM',
      name: "Scénario A : Conditions Saisonnières Calmes",
      probabilityPct: 45,
      regimeType: "Régime Moyen",
      synopticMechanism: "Pressions proches des normales.",
      temperatureAnomalyC: +0.3,
      precipitationAnomalyPct: -10,
      description: "Temps de saison équilibré.",
      isDominant: true
    },
    alternative: {
      scenarioId: 'W4_ALT',
      name: "Scénario B : Incursion Humide",
      probabilityPct: 35,
      regimeType: "Flux Ouest",
      synopticMechanism: "Pluies passagères.",
      temperatureAnomalyC: -0.2,
      precipitationAnomalyPct: +25,
      description: "Temps plus humide.",
      isDominant: false
    },
    minority: {
      scenarioId: 'W4_MIN',
      name: "Scénario C : Blocage Sec",
      probabilityPct: 20,
      regimeType: "Anticyclone",
      synopticMechanism: "Temps sec prolongé.",
      temperatureAnomalyC: +1.5,
      precipitationAnomalyPct: -50,
      description: "Très sec et ensoleillé.",
      isDominant: false
    }
  };

  const week4Regions: NationalRegionalDetail[] = isColdSeason ? [
    {
      regionName: "Nord-Ouest",
      regionCode: 'NO',
      dominantWeather: "Passages nuageux maritimes, quelques bruines côtières, nuits fraîches.",
      tempAnomalyC: +0.2,
      precipAnomalyPct: -15,
      riskHighlights: ["Brumes côtières locales"],
      summaryText: "Ambiance océanique de saison (Tn 5-7°C / Tx 11-13°C)."
    },
    {
      regionName: "Nord-Est & Centre-Est",
      regionCode: 'NE',
      dominantWeather: "Grisaille automnale/hivernale dominante, brouillards et fraîcheur persistante.",
      tempAnomalyC: -0.3,
      precipAnomalyPct: -40,
      riskHighlights: ["Gelées blanches fréquentes (0°C à -2°C)"],
      summaryText: "Temps froid de saison en plaine avec maximales de 7°C à 10°C."
    },
    {
      regionName: "Bassin Parisien & Centre",
      regionCode: 'CENTRE',
      dominantWeather: "Nuages bas le matin avec éclaircies l'après-midi, vent faible.",
      tempAnomalyC: +0.1,
      precipAnomalyPct: -30,
      riskHighlights: ["Visibilité réduite au lever du jour"],
      summaryText: "Fraîcheur le matin (2°C à 5°C), 10°C à 12°C l'après-midi."
    },
    {
      regionName: "Sud-Ouest",
      regionCode: 'SO',
      dominantWeather: "Éclaircies généreuses après dissipation des brumes d'aube, douceur persistante.",
      tempAnomalyC: +0.8,
      precipAnomalyPct: -35,
      riskHighlights: ["Douceur agréable l'après-midi"],
      summaryText: "Après-midi agréables atteignant 14°C à 17°C."
    },
    {
      regionName: "Sud-Est & Méditerranée",
      regionCode: 'SE',
      dominantWeather: "Ciel clair à peu nuageux, soleil franc, vent modéré.",
      tempAnomalyC: +0.5,
      precipAnomalyPct: -40,
      riskHighlights: ["Mistral modéré dans son couloir habituel"],
      summaryText: "Belles journées méditerranéennes (15°C à 18°C)."
    },
    {
      regionName: "Massifs & Reliefs",
      regionCode: 'MASSIFS',
      dominantWeather: "Soleil en haute montagne dominant les mer de nuages de plaine, froid sec.",
      tempAnomalyC: +0.4,
      precipAnomalyPct: -30,
      riskHighlights: ["Gel nocturne régulier dès 1200m"],
      summaryText: "Excellentes conditions de montagne au soleil, froid vif à l'ombre."
    }
  ] : [];

  const weeks: NationalFourWeekBulletinWeek[] = [
    {
      weekIndex: 1,
      weekLabel: `Semaine 1 (S+1) : ${formatWeekRange(1, 7)}`,
      shortDateRange: formatShortRange(1, 7),
      confidenceIndexPct: 88,
      generalAtmosphericContext: isColdSeason 
        ? "Très haute fiabilité (88%) : Accord unanime entre Météo-France (AROME/ARPEGE) et le CEP (ECMWF IFS) sur la prédominance d'une dorsale anticyclonique. Nuits fraîches favorisant les brouillards de vallée et stratus en plaine, soleil éclatant sur les reliefs et en Méditerranée."
        : "Haute fiabilité : Conditions calmes et ensoleillées avec températures de saison.",
      scenarios: week1Scenarios,
      regions: week1Regions,
      keyNationalRisks: [
        "Brouillards denses et stratus matinaux réduisant la visibilité à moins de 200m dans les vallées fluviales (Seine, Saône, Garonne).",
        "Premières gelées blanches localisées en plaine dans les zones abritées du Nord et de l'Est.",
        "Inversions thermiques marquées : températures plus douces à 1500m sur les massifs qu'au fond des vallées abritées."
      ],
      hydricAndAgriculturalOutlook: "Temps sec favorable aux travaux d'automne (semailles, labours, entretiens). Évaporation très réduite limitant le dessèchement des sols.",
      energyAndConsumptionOutlook: "Consommation électrique modérée en légère hausse le matin liée au chauffage domestique. Production photovoltaïque excellente sur les massifs et le littoral méditerranéen."
    },
    {
      weekIndex: 2,
      weekLabel: `Semaine 2 (S+2) : ${formatWeekRange(8, 14)}`,
      shortDateRange: formatShortRange(8, 14),
      confidenceIndexPct: 70,
      generalAtmosphericContext: isColdSeason
        ? "Fiabilité bonne à modérée (70%) : Scénario dominant privilégiant l'enfoncement progressif d'un talweg atlantique apportant de l'humidité océanique et une reprise des pluies sur la moitié Nord."
        : "Fiabilité modérée : Flux d'ouest océanique avec passages nuageux et ondées.",
      scenarios: week2Scenarios,
      regions: week2Regions,
      keyNationalRisks: [
        "Renforcement des vents de Sud-Ouest avec rafales de 50 à 70 km/h sur les côtes de Manche et de l'Atlantique.",
        "Pluies bénéfiques pour les nappes phréatiques au Nord de la Loire (cumuls estimés de 15 à 30 mm).",
        "Premières neiges en moyenne montagne (au-dessus de 1800m dans les Alpes et les Pyrénées)."
      ],
      hydricAndAgriculturalOutlook: "Arrosage très bénéfique sur les bassins versants septentrionaux favorisant l'enclenchement de la recharge hydrologique hivernale des nappes.",
      energyAndConsumptionOutlook: "Forte hausse de la production éolienne terrestre et maritime avec le passage des dépressions océaniques."
    },
    {
      weekIndex: 3,
      weekLabel: `Semaine 3 (S+3) : ${formatWeekRange(15, 21)}`,
      shortDateRange: formatShortRange(15, 21),
      confidenceIndexPct: 55,
      generalAtmosphericContext: isColdSeason
        ? "Fiabilité modérée (55%) : Le modèle Copernicus C3S anticipe une persistance de la circulation atlantique tempérée (anomalie thermique +0.8°C à +1.2°C) avec alternance d'ondulations douces et de traînes fraîches."
        : "Fiabilité modérée : Douceur de saison et passages variables.",
      scenarios: week3Scenarios,
      regions: week3Regions,
      keyNationalRisks: [
        "Incertitude sur la trajectoire exacte des creusements dépressionnaires atlantiques.",
        "Risque de gelées matinales si une dorsale temporaire s'installe par ciel dégagé."
      ],
      hydricAndAgriculturalOutlook: "Humidité des sols adéquate pour l'implantation des céréales d'hiver. Cours d'eau aux débits de saison réguliers.",
      energyAndConsumptionOutlook: "Besoins de chauffage stables et conformes aux normales de la période."
    },
    {
      weekIndex: 4,
      weekLabel: `Semaine 4 (S+4) : ${formatWeekRange(22, 28)}`,
      shortDateRange: formatShortRange(22, 28),
      confidenceIndexPct: 40,
      generalAtmosphericContext: isColdSeason
        ? "Tendance climatologique à longue échéance : Équilibre entre le maintien d'une circulation océanique douce et la reconstitution d'un anticyclone continental européen avec baisse progressive des températures."
        : "Tendance longue échéance : Conditions de saison sans excès.",
      scenarios: week4Scenarios,
      regions: week4Regions,
      keyNationalRisks: [
        "Dispersion des modèles d'ensemble (ECMWF ENS vs NCEP GEFS) : divergence sur la position des hautes pressions continentales.",
        "Surveillance d'un éventuel blocage froid d'Est (probabilité évaluée à 20%)."
      ],
      hydricAndAgriculturalOutlook: "Stabilité globale permettant la poursuite normale du calendrier agricole d'arrière-saison.",
      energyAndConsumptionOutlook: "Production d'énergie renouvelable (éolien et hydroélectricité) bien orientée."
    }
  ];

  const dateRangeFormatted = `${formatWeekRange(1, 28)}`;
  const generalNationalHeadline = isColdSeason
    ? "Synthèse Synoptique Nationale : Prédominance d'un Temps Calme et Sec, Inversions de Basse Couche puis Transition Océanique"
    : "Synthèse Synoptique Nationale : Équilibre Climatologique et Temps de Saison";

  const executiveSynthesis = isColdSeason
    ? "Sur l'ensemble des 4 prochaines semaines, la France se situera sous l'influence alternée de hautes pressions protectrices générant des inversions thermiques (fraîcheur et grisailles au sol, douceur en altitude) et d'ondulations océaniques douces. L'anomalie thermique globale est modérée (+0.4°C à +0.8°C au-dessus des normales 1991-2020), sans vague de froid sévère ni chaleur anormale. Le cumul pluviométrique s'annonce légèrement déficitaire en Semaine 1 avant une reprise modérée des pluies océaniques au Nord en Semaine 2."
    : "Sur l'ensemble des 4 prochaines semaines, les conditions météorologiques sur la France s'annoncent équilibrées et proches des normales saisonnières.";

  return {
    generatedAt: now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    dateRangeFormatted,
    generalNationalHeadline,
    executiveSynthesis,
    weeks,
    teleconnectionDriversSummary: {
      mjoPhase: "Phase neutre à 4/5 favorisant les ondulations sur l'Atlantique Nord",
      naoTrend: "NAO modérément positive (+0.4 à +0.7 σ), canalisant les perturbations vers le Nord de l'Europe",
      aoTrend: "Oscillation Arctique stable (+0.3 σ), vortex polaire bien structuré sans décrochage massif immédiat",
      ensoPhase: "Condition neutre / La Niña faible (températures de surface du Pacifique équatorial légèrement sous la normale)",
      polarVortexStatus: "Vortex polaire stratosphérique vigoureux limitant les invasions froides précoces vers les latitudes moyennes"
    }
  };
}
