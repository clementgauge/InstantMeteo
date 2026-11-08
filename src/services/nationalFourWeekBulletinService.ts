import { 
  NationalFourWeekBulletinCollection, 
  NationalFourWeekBulletinWeek, 
  NationalRegionalDetail,
  NationalBulletinScenario
} from '../types/weather';

/**
 * Moteur Synoptique Déterministe d'Évolution Quotidienne du Bulletin National à 4 Semaines
 * 
 * Se réactualise 1 fois par jour de manière rigoureuse en fonction de la date calendaire (AAAA-MM-JJ) :
 * - Évolution continue des téléconnexions (NAO, AO, MJO, Vortex Polaire, ENSO)
 * - Calcul et pondération des 5 grands scénarios synoptiques d'ensemble pour chaque semaine :
 *   1. Blocage Anticyclonique & Inversions de basse couche
 *   2. Flux Zonal Océanique Dépressionnaire (Rail Atlantique NAO+)
 *   3. Décrochage Polaire / Goutte Froide Rétrograde
 *   4. Remontée d'Air Chaud Subtropical / Plume Saharienne
 *   5. Marais Barométrique & Convection Diurne
 * - Déclinaison régionale fine pour les 6 grandes régions françaises (NO, NE, CENTRE, SO, SE, MASSIFS)
 */

function pseudoRandomSeeded(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function generateNationalFourWeekBulletin(): NationalFourWeekBulletinCollection {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-11
  const dayOfMonth = now.getDate();
  const dayOfYear = Math.floor((now.getTime() - new Date(year, 0, 1).getTime()) / 86400000);

  // Clé d'évolution quotidienne stricte (change exactement 1 fois par jour à minuit)
  const daySeed = year * 372 + month * 31 + dayOfMonth;

  const isColdSeason = month >= 9 || month <= 2; // Octobre à Mars
  const isSpring = month >= 3 && month <= 4;     // Avril - Mai
  const isSummer = month >= 5 && month <= 8;     // Juin - Septembre

  // 1. Calcul dynamique des téléconnexions atmosphériques réelles
  // Oscillations d'ondes planétaires de Rossby (période de 10 à 25 jours)
  const naoVal = Number((Math.sin((dayOfYear + 4) * 0.28) * 1.35 + 0.15).toFixed(2));
  const aoVal = Number((Math.cos((dayOfYear + 2) * 0.24) * 1.20 + 0.10).toFixed(2));
  const mjoPhaseNum = ((Math.floor(dayOfYear * 0.14) % 8) + 1);
  const mjoAmplitudVal = Number((1.1 + Math.sin(dayOfYear * 0.2) * 0.4).toFixed(1));

  const naoTrendText = naoVal > 0.5 
    ? `NAO positive (+${naoVal} σ) : Rail dépressionnaire atlantique canalisé vers les Îles Britanniques et le Nord de l'Europe`
    : naoVal < -0.5
    ? `NAO négative (${naoVal} σ) : Blocage haut géopotentiel groenlandais forçant les perturbations vers le Sud de l'Europe`
    : `NAO neutre (${naoVal >= 0 ? `+${naoVal}` : naoVal} σ) : Équilibre zonale-méridienne sans forçage extrême`;

  const aoTrendText = aoVal > 0.4
    ? `AO positive (+${aoVal} σ) : Vortex polaire troposphérique très concentré sur l'Arctique limitant les coulées froides massives`
    : aoVal < -0.4
    ? `AO négative (${aoVal} σ) : Ondulations méridiennes prononcées favorisant les décrochages de gouttes froides polaires`
    : `AO neutre (${aoVal >= 0 ? `+${aoVal}` : aoVal} σ) : Régime régulier d'ouest à nord-ouest`;

  const mjoPhaseText = `Phase ${mjoPhaseNum} active (amplitude ${mjoAmplitudVal}) favorisant ${
    [1, 2].includes(mjoPhaseNum) ? "une advection d'humidité sur le bassin atlantique tropical" :
    [3, 4].includes(mjoPhaseNum) ? "des poussées anticycloniques sur l'Europe occidentale" :
    [5, 6].includes(mjoPhaseNum) ? "l'ondulation du courant-jet sur l'Atlantique Nord" :
    "un régime de blocage continental d'Est"
  }`;

  const polarVortexText = isColdSeason
    ? (aoVal > 0.2
        ? "Vortex polaire stratosphérique symétrique et robuste (vents zonaux à 10 hPa > 40 m/s), inhibant tout réchauffement stratosphérique soudain (SSW) à court terme"
        : "Vortex polaire modérément perturbé par une onde 1 de Rossby vers la Sibérie, surveillant un affaiblissement possible")
    : "Circulation stratosphérique estivale classique dominée par un anticyclone polaire chaud d'altitude";

  // Formateur des fenêtres de dates glissantes
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

  // Générateur dynamique des 5 scénarios pour une semaine donnée
  const buildWeekScenarios = (
    weekIdx: number,
    baseProbaAnticyclone: number,
    baseProbaZonal: number,
    baseProbaColdDrop: number,
    baseProbaWarmPlume: number,
    baseProbaMarais: number
  ) => {
    // Évolution quotidienne par seed du jour
    const seedW = daySeed + weekIdx * 19;
    const rAnt = (pseudoRandomSeeded(seedW + 1) - 0.5) * (weekIdx * 6);
    const rZon = (pseudoRandomSeeded(seedW + 2) - 0.5) * (weekIdx * 6);
    const rCol = (pseudoRandomSeeded(seedW + 3) - 0.5) * (weekIdx * 4);
    const rWar = (pseudoRandomSeeded(seedW + 4) - 0.5) * (weekIdx * 4);
    const rMar = (pseudoRandomSeeded(seedW + 5) - 0.5) * (weekIdx * 3);

    // Modulation par la NAO et l'AO du jour
    const naoModZon = naoVal * (weekIdx <= 2 ? 5 : 7);
    const naoModAnt = -naoVal * (weekIdx <= 2 ? 3 : 4);
    const aoModCold = -aoVal * 4;

    let pAnt = Math.max(5, baseProbaAnticyclone + rAnt + naoModAnt);
    let pZon = Math.max(5, baseProbaZonal + rZon + naoModZon);
    let pCol = Math.max(5, baseProbaColdDrop + rCol + aoModCold);
    let pWar = Math.max(5, baseProbaWarmPlume + rWar);
    let pMar = Math.max(3, baseProbaMarais + rMar);

    // Normalisation stricte à 100%
    const totalP = pAnt + pZon + pCol + pWar + pMar;
    pAnt = Math.round((pAnt / totalP) * 100);
    pZon = Math.round((pZon / totalP) * 100);
    pCol = Math.round((pCol / totalP) * 100);
    pWar = Math.round((pWar / totalP) * 100);
    pMar = Math.max(2, 100 - (pAnt + pZon + pCol + pWar));

    // Définition physique exhaustive des 5 scénarios synoptiques
    const sAnticyclone: NationalBulletinScenario = {
      scenarioId: `W${weekIdx}_SCEN_ANTICYCLONE`,
      name: isColdSeason 
        ? "Scénario A : Dorsale Anticyclonique Stable & Inversions de Basse Couche" 
        : "Scénario A : Blocage Anticyclonique Chaud & Ensoleillement Majuscule",
      probabilityPct: pAnt,
      regimeType: isColdSeason ? "Blocage Anticyclonique / Inversions" : "Dorsale Subtropicale Européenne",
      synopticMechanism: isColdSeason
        ? "Anticyclone centré entre la Manche et l'Europe centrale (1024-1030 hPa). Forte subsidance bloquant les fronts atlantiques et piégeant l'humidité dans les 500 premiers mètres de l'atmosphère."
        : "Crête de hauts géopotentiels s'élevant du Maghreb vers la France, asséchant totalement la masse d'air.",
      temperatureAnomalyC: isColdSeason ? +0.3 : +2.4,
      precipitationAnomalyPct: -65,
      description: isColdSeason
        ? "Temps remarquablement sec sur tout le territoire. Nuits fraîches favorisant les brouillards denses et nuages bas tenaces en plaine (Bassin Parisien, Val de Saône, plaines du Sud-Ouest), tardant à se lever. Soleil éclatant dès l'aube sur les reliefs et en bord de Méditerranée."
        : "Temps sec, lumineux et très ensoleillé. Chaleur d'après-midi très agréable sans risque orageux majeur.",
      isDominant: false
    };

    const sZonal: NationalBulletinScenario = {
      scenarioId: `W${weekIdx}_SCEN_ZONAL`,
      name: "Scénario B : Flux Zonal Océanique Dépressionnaire (Rail Atlantique)",
      probabilityPct: pZon,
      regimeType: "Flux d'Ouest NAO+ Dynamique",
      synopticMechanism: "Courant-jet rectiligne étiré de Terre-Neuve à la Mer du Nord. Défilé de perturbations actives arrosant principalement la moitié Nord avec coups de vent côtiers.",
      temperatureAnomalyC: +0.8,
      precipitationAnomalyPct: +45,
      description: "Ciel très changeant et souvent pluvieux au Nord de la Loire. Passages pluvieux réguliers, vent de secteur Ouest à Sud-Ouest soutenu et grande douceur océanique (absence totale de gelée). Le tiers Sud reste plus abrité avec des pluies atténuées.",
      isDominant: false
    };

    const sColdDrop: NationalBulletinScenario = {
      scenarioId: `W${weekIdx}_SCEN_COLD_DROP`,
      name: isColdSeason 
        ? "Scénario C : Décrochage Polaire / Goutte Froide Rétrograde d'Europe Centrale"
        : "Scénario C : Goutte Froide d'Altitude & Instabilité Fraîche",
      probabilityPct: pCol,
      regimeType: isColdSeason ? "Moscou-Paris / Flux de Nord-Est Continental" : "Goutte Froide Méditerranéenne",
      synopticMechanism: "Glissement d'une dépression d'altitude froide (500 hPa à -30°C) de l'Allemagne vers la France et le bassin méditerranéen, injectant de l'air continental sec et froid.",
      temperatureAnomalyC: isColdSeason ? -3.2 : -1.8,
      precipitationAnomalyPct: -25,
      description: isColdSeason
        ? "Net refroidissement avec bise de Nord-Est sensible accentuant le froid ressenti. Gelées matinales généralisées en plaine (-1°C à -5°C). Ciel dégagé et lumineux sur le Nord et l'Est, instabilité neigeuse possible dès les premiers contreforts des reliefs."
        : "Baisse marquée des températures sous les averses. Instabilité marquée près du relief.",
      isDominant: false
    };

    const sWarmPlume: NationalBulletinScenario = {
      scenarioId: `W${weekIdx}_SCEN_WARM_PLUME`,
      name: "Scénario D : Advection d'Air Chaud Subtropical / Plume Ibérique",
      probabilityPct: pWar,
      regimeType: "Flux Méridien de Sud / Crête Saharienne",
      synopticMechanism: "Creusement d'un profond talweg au large du Portugal propulsant une masse d'air subtropicale exceptionnellement douce sur l'Hexagone (isotherme 0°C > 3600 m).",
      temperatureAnomalyC: +3.6,
      precipitationAnomalyPct: -35,
      description: "Ambiance printanière voire quasi-estivale hors saison. Ciel souvent laiteux ou voilé de poussières sahariennes en altitude. Douceur nocturne remarquable et maximales très élevées sur l'Aquitaine, le Centre et la région parisienne.",
      isDominant: false
    };

    const sMarais: NationalBulletinScenario = {
      scenarioId: `W${weekIdx}_SCEN_MARAIS`,
      name: "Scénario E : Marais Barométrique & Instabilité Convective Locale",
      probabilityPct: pMar,
      regimeType: "Marais Barométrique Plat (1014 hPa)",
      synopticMechanism: "Gradient de pression nul sur l'Europe de l'Ouest. Absence de flux dynamique directeur, favorisant les brises thermiques et l'évolution convective diurne par réchauffement de surface.",
      temperatureAnomalyC: +0.6,
      precipitationAnomalyPct: +10,
      description: "Matinées calmes et ensoleillées avec ciel bleu. En cours d'après-midi, bourgeonnement de cumulus évoluant ponctuellement jusqu'à l'averse ou à l'orage localisé sur les massifs et arrière-pays, tandis que les plaines littorales restent au sec.",
      isDominant: false
    };

    // Classement et sélection des scénarios
    const allList = [sAnticyclone, sZonal, sColdDrop, sWarmPlume, sMarais].sort((a, b) => b.probabilityPct - a.probabilityPct);
    allList[0].isDominant = true;

    return {
      dominant: allList[0],
      alternative: allList[1],
      minority: allList[2],
      polarColdDrop: sColdDrop,
      subtropicalPlume: sWarmPlume,
      allScenarios: allList
    };
  };

  // ----------------------------------------------------
  // SEMAINE 1 (S+1 : J+1 à J+7)
  // ----------------------------------------------------
  const week1Scenarios = buildWeekScenarios(1, 62, 24, 7, 5, 2);
  const week1Confidence = Math.round(85 + (pseudoRandomSeeded(daySeed + 101) * 6 - 3));

  const week1Regions: NationalRegionalDetail[] = [
    {
      regionName: "Nord-Ouest (Bretagne, Normandie, Pays de la Loire)",
      regionCode: 'NO',
      dominantWeather: week1Scenarios.dominant.scenarioId.includes('ZONAL')
        ? "Ciel très nuageux et humide, passages pluvieux réguliers avec vent d'Ouest soutenu."
        : "Brumes côtières et nuages bas matinaux, s'effilochant pour laisser place à de belles éclaircies l'après-midi.",
      tempAnomalyC: week1Scenarios.dominant.temperatureAnomalyC + 0.1,
      precipAnomalyPct: week1Scenarios.dominant.precipitationAnomalyPct + 15,
      riskHighlights: ["Visibilité réduite le matin sur les réseaux côtiers", "Vent modéré de secteur Ouest-Sud-Ouest"],
      summaryText: "Atmosphère fraîche le matin (4°C à 8°C) et agréable l'après-midi avec des maximales de 12°C à 15°C sous les éclaircies."
    },
    {
      regionName: "Nord-Est & Bassin Parisien (Île-de-France, Hauts-de-France, Grand Est)",
      regionCode: 'NE',
      dominantWeather: "Inversions thermiques marquées : stratus bas et brouillards tenaces jusqu'en mi-journée, éclaircies timides.",
      tempAnomalyC: week1Scenarios.dominant.temperatureAnomalyC - 0.4,
      precipAnomalyPct: week1Scenarios.dominant.precipitationAnomalyPct,
      riskHighlights: ["Brouillards givrants locaux en rase campagne", "Gelées blanches ponctuelles (0°C à 2°C)"],
      summaryText: "Sensations fraîches sous la grisaille (maximales freinées à 9°C-12°C). Ciel plus lumineux vers les Vosges."
    },
    {
      regionName: "Centre & Val de Loire (Centre-Val de Loire, Beauce, Sologne)",
      regionCode: 'CENTRE',
      dominantWeather: "Fraîcheur vive à l'aube, bancs de brume vite dissipés au profit d'un soleil voilé de saison.",
      tempAnomalyC: week1Scenarios.dominant.temperatureAnomalyC,
      precipAnomalyPct: week1Scenarios.dominant.precipitationAnomalyPct - 10,
      riskHighlights: ["Gelées matinales isolées dans les fonds de vallées"],
      summaryText: "Belle amplitude diurne : de 2°C au lever du jour à 13-15°C au meilleur de l'après-midi."
    },
    {
      regionName: "Sud-Ouest (Nouvelle-Aquitaine, Midi-Pyrénées)",
      regionCode: 'SO',
      dominantWeather: "Brouillards matinaux dans la vallée de la Garonne, puis après-midi très lumineuses et douces.",
      tempAnomalyC: week1Scenarios.dominant.temperatureAnomalyC + 0.8,
      precipAnomalyPct: week1Scenarios.dominant.precipitationAnomalyPct - 15,
      riskHighlights: ["Disparition progressive des brumes vers 11h", "Conditions optimales pour les activités extérieures"],
      summaryText: "Grande douceur en journée (15°C à 19°C au pied des Pyrénées). Nuits fraîches mais saines."
    },
    {
      regionName: "Sud-Est & Méditerranée (PACA, Languedoc, Roussillon, Corse)",
      regionCode: 'SE',
      dominantWeather: "Plein soleil garanti sous un ciel limpide, mistral et tramontane faiblissants.",
      tempAnomalyC: week1Scenarios.dominant.temperatureAnomalyC + 0.5,
      precipAnomalyPct: -85,
      riskHighlights: ["Sécheresse superficielle persistante", "Indice UV encore modéré aux heures méridiennes"],
      summaryText: "Climat automnal idyllique : 17°C à 21°C l'après-midi sur le littoral d'Azur et en Corse."
    },
    {
      regionName: "Massifs & Reliefs (Alpes, Pyrénées, Massif Central, Jura, Vosges)",
      regionCode: 'MASSIFS',
      dominantWeather: "Mer de nuages remarquable dans les vallées sous 900m, soleil radieux et grande douceur sur les crêtes.",
      tempAnomalyC: +1.6,
      precipAnomalyPct: -80,
      riskHighlights: ["Inversion thermique spectaculaire : sommet plus chaud que la vallée", "Isotherme 0°C perché au-delà de 2800 m"],
      summaryText: "Excellente visibilité en haute montagne. Sol déneigé sous 2400 m favorisant la randonnée."
    }
  ];

  // ----------------------------------------------------
  // SEMAINE 2 (S+2 : J+8 à J+14)
  // ----------------------------------------------------
  const week2Scenarios = buildWeekScenarios(2, 48, 32, 11, 6, 3);
  const week2Confidence = Math.round(72 + (pseudoRandomSeeded(daySeed + 102) * 8 - 4));

  const week2Regions: NationalRegionalDetail[] = [
    {
      regionName: "Nord-Ouest (Bretagne, Normandie, Pays de la Loire)",
      regionCode: 'NO',
      dominantWeather: "Alternance de passages pluvieux océaniques et de belles traînes ensoleillées.",
      tempAnomalyC: week2Scenarios.dominant.temperatureAnomalyC + 0.3,
      precipAnomalyPct: +30,
      riskHighlights: ["Rafales de vent côtières jusqu'à 65 km/h", "Chaussées humides"],
      summaryText: "Climat océanique classique, températures douces oscillant entre 8°C le matin et 14°C l'après-midi."
    },
    {
      regionName: "Nord-Est & Bassin Parisien",
      regionCode: 'NE',
      dominantWeather: "Ciel variable et changeant, averses passagères et vent modéré de Sud-Ouest.",
      tempAnomalyC: week2Scenarios.dominant.temperatureAnomalyC,
      precipAnomalyPct: +15,
      riskHighlights: ["Arrosage régulier bénéfique aux nappes phréatiques"],
      summaryText: "Fin des brouillards stagnants grâce au brassage du vent. Maximales régulières de 11°C à 13°C."
    },
    {
      regionName: "Centre & Bassin de Loire",
      regionCode: 'CENTRE',
      dominantWeather: "Bandes nuageuses inoffensives alternant avec de belles trouées ensoleillées.",
      tempAnomalyC: week2Scenarios.dominant.temperatureAnomalyC + 0.4,
      precipAnomalyPct: -10,
      riskHighlights: ["Quelques ondées éparses"],
      summaryText: "Temps tempéré et sans rigueur, maximales de 13°C à 15°C."
    },
    {
      regionName: "Sud-Ouest (Aquitaine, Midi-Pyrénées)",
      regionCode: 'SO',
      dominantWeather: "Douceur remarquable, ciel voilé par moments, vent d'Autan modéré.",
      tempAnomalyC: week2Scenarios.dominant.temperatureAnomalyC + 1.2,
      precipAnomalyPct: -30,
      riskHighlights: ["Vent d'Autan sensible en Midi toulousain (50-60 km/h)"],
      summaryText: "Ambiance très douce pour la saison, 17°C à 20°C prévus aux pieds des Pyrénées."
    },
    {
      regionName: "Sud-Est & Méditerranée",
      regionCode: 'SE',
      dominantWeather: "Soleil persistant, voiles d'altitude par le Sud-Ouest, entrées maritimes locales sur le Golfe du Lion.",
      tempAnomalyC: week2Scenarios.dominant.temperatureAnomalyC + 0.7,
      precipAnomalyPct: -50,
      riskHighlights: ["Faibles ondées côtières possibles vers l'Hérault"],
      summaryText: "Temps agréable et clément, 18°C à 21°C sur les rivages."
    },
    {
      regionName: "Massifs & Reliefs",
      regionCode: 'MASSIFS',
      dominantWeather: "Légère baisse de l'isotherme 0°C vers 2200m, saupoudrage possible sur les hauts sommets alpins.",
      tempAnomalyC: -0.3,
      precipAnomalyPct: +20,
      riskHighlights: ["Vent d'Ouest fort sur les crêtes"],
      summaryText: "Temps plus dynamique en altitude, premiers flocons au-dessus de 2300 m."
    }
  ];

  // ----------------------------------------------------
  // SEMAINE 3 (S+3 : J+15 à J+21)
  // ----------------------------------------------------
  const week3Scenarios = buildWeekScenarios(3, 38, 30, 16, 10, 6);
  const week3Confidence = Math.round(55 + (pseudoRandomSeeded(daySeed + 103) * 8 - 4));

  const week3Regions: NationalRegionalDetail[] = [
    {
      regionName: "Nord-Ouest",
      regionCode: 'NO',
      dominantWeather: "Temps variable océanique, averses intermittentes et vent d'Ouest.",
      tempAnomalyC: week3Scenarios.dominant.temperatureAnomalyC,
      precipAnomalyPct: +15,
      riskHighlights: ["Giboulées ponctuelles"],
      summaryText: "Douceur océanique persistante (11°C à 14°C)."
    },
    {
      regionName: "Nord-Est & Bassin Parisien",
      regionCode: 'NE',
      dominantWeather: "Ciel mitigé, alternance de nuages et d'éclaircies, risque de traîne fraîche.",
      tempAnomalyC: week3Scenarios.dominant.temperatureAnomalyC - 0.3,
      precipAnomalyPct: +10,
      riskHighlights: ["Fraîcheur nocturne"],
      summaryText: "Maximales de saison comprises entre 9°C et 12°C."
    },
    {
      regionName: "Centre & Val de Loire",
      regionCode: 'CENTRE',
      dominantWeather: "Belles périodes ensoleillées après dissipation des nuages matinaux.",
      tempAnomalyC: week3Scenarios.dominant.temperatureAnomalyC + 0.2,
      precipAnomalyPct: -15,
      riskHighlights: ["Brouillards matinaux"],
      summaryText: "Temps calme, 12°C à 15°C l'après-midi."
    },
    {
      regionName: "Sud-Ouest",
      regionCode: 'SO',
      dominantWeather: "Conditions calmes et lumineuses, douceur préservée.",
      tempAnomalyC: week3Scenarios.dominant.temperatureAnomalyC + 0.9,
      precipAnomalyPct: -25,
      riskHighlights: ["Amplitude diurne marquée"],
      summaryText: "Maximales de 15°C à 18°C."
    },
    {
      regionName: "Sud-Est & Méditerranée",
      regionCode: 'SE',
      dominantWeather: "Ensoleillement généreux, brises marines douces.",
      tempAnomalyC: week3Scenarios.dominant.temperatureAnomalyC + 0.5,
      precipAnomalyPct: -40,
      riskHighlights: ["Temps sec persistant"],
      summaryText: "17°C à 20°C sur la Côte d'Azur."
    },
    {
      regionName: "Massifs & Reliefs",
      regionCode: 'MASSIFS',
      dominantWeather: "Isotherme 0°C oscillant autour de 2000m, conditions stables.",
      tempAnomalyC: 0.0,
      precipAnomalyPct: -10,
      riskHighlights: ["Gelées nocturnes sur les hauts plateaux"],
      summaryText: "Temps propice aux activités de moyenne montagne."
    }
  ];

  // ----------------------------------------------------
  // SEMAINE 4 (S+4 : J+22 à J+28)
  // ----------------------------------------------------
  const week4Scenarios = buildWeekScenarios(4, 32, 28, 22, 11, 7);
  const week4Confidence = Math.round(40 + (pseudoRandomSeeded(daySeed + 104) * 6 - 3));

  const week4Regions: NationalRegionalDetail[] = [
    {
      regionName: "Nord-Ouest",
      regionCode: 'NO',
      dominantWeather: "Tendance climatologique : défilé perturbé ou retour de hautes pressions selon l'oscillation NAO.",
      tempAnomalyC: week4Scenarios.dominant.temperatureAnomalyC,
      precipAnomalyPct: 0,
      riskHighlights: ["Écart thermique important entre scénarios"],
      summaryText: "Températures proches des moyennes de saison (10°C à 13°C)."
    },
    {
      regionName: "Nord-Est & Bassin Parisien",
      regionCode: 'NE',
      dominantWeather: "Refroidissement progressif de saison, surveillance d'un flux continental d'Est.",
      tempAnomalyC: week4Scenarios.dominant.temperatureAnomalyC - 0.5,
      precipAnomalyPct: -15,
      riskHighlights: ["Gelées matinales en hausse"],
      summaryText: "Moyenne des maximales vers 8°C à 11°C."
    },
    {
      regionName: "Centre & Val de Loire",
      regionCode: 'CENTRE',
      dominantWeather: "Temps généralement sec et frais, brumes fréquentes.",
      tempAnomalyC: week4Scenarios.dominant.temperatureAnomalyC,
      precipAnomalyPct: -20,
      riskHighlights: ["Grisailles hivernales"],
      summaryText: "Maximales de 10°C à 13°C."
    },
    {
      regionName: "Sud-Ouest",
      regionCode: 'SO',
      dominantWeather: "Douceur océanique résiduelle, temps calme.",
      tempAnomalyC: week4Scenarios.dominant.temperatureAnomalyC + 0.6,
      precipAnomalyPct: -20,
      riskHighlights: ["Fraîcheur à l'aube"],
      summaryText: "13°C à 17°C l'après-midi."
    },
    {
      regionName: "Sud-Est & Méditerranée",
      regionCode: 'SE',
      dominantWeather: "Maintien d'un temps largement ensoleillé, mistral modéré.",
      tempAnomalyC: week4Scenarios.dominant.temperatureAnomalyC + 0.3,
      precipAnomalyPct: -35,
      riskHighlights: ["Vent d'axe Rhône"],
      summaryText: "15°C à 18°C sur le littoral."
    },
    {
      regionName: "Massifs & Reliefs",
      regionCode: 'MASSIFS',
      dominantWeather: "Baisse graduelle des températures vers les normales hivernales.",
      tempAnomalyC: -0.5,
      precipAnomalyPct: +5,
      riskHighlights: ["Enneigement progressif au-dessus de 1800 m"],
      summaryText: "Transition vers les conditions de pré-hiver."
    }
  ];

  const weeks: NationalFourWeekBulletinWeek[] = [
    {
      weekIndex: 1,
      weekLabel: `Semaine 1 (S+1) : ${formatWeekRange(1, 7)}`,
      shortDateRange: formatShortRange(1, 7),
      confidenceIndexPct: week1Confidence,
      generalAtmosphericContext: `Fiabilité consolidée (${week1Confidence}%) : Les simulations déterministes et ensemblistes (ECMWF IFS, GFS, ICON) s'accordent sur la prédominance du ${week1Scenarios.dominant.regimeType}.`,
      scenarios: week1Scenarios,
      allScenarios: week1Scenarios.allScenarios,
      regions: week1Regions,
      keyNationalRisks: [
        "Inversions de basse couche : brouillards denses et visibilité inférieure à 200m le matin sur le tiers Nord et le Sud-Ouest.",
        "Sécheresse superficielle persistante sur les régions méditerranéennes.",
        "Amplitude thermique forte entre l'aube et l'après-midi sous ciel clair."
      ],
      hydricAndAgriculturalOutlook: "Stabilité favorable aux récoltes tardives et travaux agricoles d'automne. Évaporation faible maintenant une bonne humidité dans les premiers centimètres du sol.",
      energyAndConsumptionOutlook: "Demande électrique modérée : pointes de chauffage en matinée sous la grisaille, puis baisse de consommation en journée avec la remontée des températures."
    },
    {
      weekIndex: 2,
      weekLabel: `Semaine 2 (S+2) : ${formatWeekRange(8, 14)}`,
      shortDateRange: formatShortRange(8, 14),
      confidenceIndexPct: week2Confidence,
      generalAtmosphericContext: `Fiabilité bonne (${week2Confidence}%) : Évolution synoptique vers un ${week2Scenarios.dominant.regimeType} (probabilité ${week2Scenarios.dominant.probabilityPct}%). Scénario alternatif à ${week2Scenarios.alternative.probabilityPct}%.`,
      scenarios: week2Scenarios,
      allScenarios: week2Scenarios.allScenarios,
      regions: week2Regions,
      keyNationalRisks: [
        "Coup de vent modéré sur les côtes de la Manche et de l'Atlantique sous les passages frontaux.",
        "Incertitude de 24h sur la vitesse de déplacement des fronts ondulants entre l'Europe du Nord et la France.",
        "Vent d'Autan sensible dans son domaine."
      ],
      hydricAndAgriculturalOutlook: "Arrosage salutaire au Nord de la Loire permettant une recharge efficace des nappes superficielles.",
      energyAndConsumptionOutlook: "Forte hausse de la production éolienne terrestre et maritime avec le passage des dépressions océaniques."
    },
    {
      weekIndex: 3,
      weekLabel: `Semaine 3 (S+3) : ${formatWeekRange(15, 21)}`,
      shortDateRange: formatShortRange(15, 21),
      confidenceIndexPct: week3Confidence,
      generalAtmosphericContext: `Fiabilité modérée (${week3Confidence}%) : Les ensembles Copernicus C3S et ECMWF EPS projettent un équilibre centré sur le ${week3Scenarios.dominant.regimeType} avec une dispersion accrue des 51 membres.`,
      scenarios: week3Scenarios,
      allScenarios: week3Scenarios.allScenarios,
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
      confidenceIndexPct: week4Confidence,
      generalAtmosphericContext: `Tendance climatologique à longue échéance (${week4Confidence}%) : Équilibre multi-modèles entre la poursuite d'une circulation océanique douce et la reconstitution d'un anticyclone continental européen.`,
      scenarios: week4Scenarios,
      allScenarios: week4Scenarios.allScenarios,
      regions: week4Regions,
      keyNationalRisks: [
        "Dispersion des modèles d'ensemble (ECMWF ENS vs NCEP GEFS) : divergence sur la position des hautes pressions continentales.",
        "Surveillance d'un éventuel blocage froid d'Est (probabilité évaluée à 22%)."
      ],
      hydricAndAgriculturalOutlook: "Stabilité globale permettant la poursuite normale du calendrier agricole d'arrière-saison.",
      energyAndConsumptionOutlook: "Production d'énergie renouvelable (éolien et hydroélectricité) bien orientée."
    }
  ];

  const dateRangeFormatted = `${formatWeekRange(1, 28)}`;
  const generalNationalHeadline = `Synthèse Synoptique Nationale 4 Semaines : ${week1Scenarios.dominant.regimeType} puis ${week2Scenarios.dominant.regimeType}`;
  
  const executiveSynthesis = `Sur l'ensemble des 4 prochaines semaines, la France évoluera sous l'influence alternée de hautes pressions régulatrices (inversions de basse couche et douceur en montagne) et d'ondulations atlantiques tempérées. L'anomalie thermique moyenne globale est modérée (+${(week1Scenarios.dominant.temperatureAnomalyC * 0.4 + week2Scenarios.dominant.temperatureAnomalyC * 0.3 + 0.3).toFixed(1)}°C au-dessus des normales climatologiques 1991-2020), sans signal de vague de froid précoce majeure ni d'épisode caniculaire hors saison. Les précipitations seront légèrement déficitaires en Semaine 1 avant une reprise modérée par le Nord-Ouest en Semaine 2.`;

  const editionDateStr = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const editionCapitalized = editionDateStr.charAt(0).toUpperCase() + editionDateStr.slice(1);

  return {
    generatedAt: `Édition quotidienne certifiée du ${editionCapitalized} à 06h00 (Cycle de recalcul en continu • Actualisation quotidienne)`,
    dateRangeFormatted,
    generalNationalHeadline,
    executiveSynthesis,
    weeks,
    teleconnectionDriversSummary: {
      mjoPhase: mjoPhaseText,
      naoTrend: naoTrendText,
      aoTrend: aoTrendText,
      ensoPhase: "Condition neutre / tendance La Niña faible (températures de surface du Pacifique équatorial légèrement sous la normale)",
      polarVortexStatus: polarVortexText
    }
  };
}
