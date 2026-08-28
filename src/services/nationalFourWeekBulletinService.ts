import { 
  NationalFourWeekBulletinCollection, 
  NationalFourWeekBulletinWeek, 
  NationalBulletinScenario, 
  NationalRegionalDetail 
} from '../types/weather';

/**
 * Generate comprehensive National 4-Week Weather Bulletin for France (Semaine 1 à Semaine 4)
 * with multi-scenario probabilistic branching, regional breakdowns, and agricultural/hydrological outlooks.
 */
export function generateNationalFourWeekBulletin(): NationalFourWeekBulletinCollection {
  const now = new Date();
  
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
  const week1Scenarios: NationalFourWeekBulletinWeek['scenarios'] = {
    dominant: {
      scenarioId: 'W1_DOM',
      name: "Scénario A : Dorsale Anticyclonique Océanique & Chaleur Modérée de Saison",
      probabilityPct: 65,
      regimeType: "Dorsale Atlantique / NAO+",
      synopticMechanism: "Gonflement des hauts géopotentiels sur la Péninsule Ibérique et le Golfe de Gascogne. Le rail dépressionnaire circule haut en latitude sur les Îles Britanniques.",
      temperatureAnomalyC: +1.2,
      precipitationAnomalyPct: -45,
      description: "Temps très largement estival et lumineux sur l'ensemble de la France. Seules les côtes de la Manche connaissent de timides incursions nuageuses. Nuits fraîches et agréables, journées chaudes sans excès.",
      isDominant: true
    },
    alternative: {
      scenarioId: 'W1_ALT',
      name: "Scénario B : Flux d'Ouest Ondulant et Averses au Nord de la Loire",
      probabilityPct: 25,
      regimeType: "Flux Zonal Ondulant",
      synopticMechanism: "Affaissement temporaire de la dorsale laissant passer une traîne modérément instable de la Bretagne à l'Alsace.",
      temperatureAnomalyC: -0.4,
      precipitationAnomalyPct: +15,
      description: "Ciel plus changeant au Nord avec passages pluvieux intermittents (5 à 15 mm). Le Sud reste sous le soleil et la chaleur.",
      isDominant: false
    },
    minority: {
      scenarioId: 'W1_MIN',
      name: "Scénario C : Dôme de Chaleur et Pic Caniculaire au Sud",
      probabilityPct: 10,
      regimeType: "Blocage Subtropical Ibérique",
      synopticMechanism: "Advection d'air d'origine saharienne par un creusement au large du Portugal.",
      temperatureAnomalyC: +3.8,
      precipitationAnomalyPct: -80,
      description: "Forte poussée de chaleur avec maximales dépassant 36°C dans le Sud-Ouest et 34°C en Vallée du Rhône.",
      isDominant: false
    }
  };

  const week1Regions: NationalRegionalDetail[] = [
    {
      regionName: "Nord-Ouest (Bretagne, Normandie, Pays de la Loire, Hauts-de-France)",
      regionCode: 'NO',
      dominantWeather: "Éclaircies généreuses, brises côtières tempérées, passages nuageux inoffensifs.",
      tempAnomalyC: +0.5,
      precipAnomalyPct: -30,
      riskHighlights: ["Brumes matinales littorales", "Vent modéré sur les caps de la Manche"],
      summaryText: "Ambiance très agréable et respirable. Maximales de 22°C à 26°C sur les côtes, jusqu'à 28°C dans les terres ligériennes."
    },
    {
      regionName: "Nord-Est & Centre-Est (Grand-Est, Bourgogne, Franche-Comté, Lorraine, Alsace)",
      regionCode: 'NE',
      dominantWeather: "Soleil dominant, ciel bleu limpide, nuages bourgeonnant l'après-midi sur les Vosges.",
      tempAnomalyC: +1.4,
      precipAnomalyPct: -50,
      riskHighlights: ["Faible risque orageux isolé sur les crêtes vosgiennes"],
      summaryText: "Temps sec idéal. Températures chaudes l'après-midi (27°C à 30°C) avec une humidité basse propice aux moissons."
    },
    {
      regionName: "Bassin Parisien & Région Centre (Île-de-France, Centre-Val de Loire, Beauce)",
      regionCode: 'CENTRE',
      dominantWeather: "Grand soleil estival, voile d'altitude décoratif, vent faible.",
      tempAnomalyC: +1.2,
      precipAnomalyPct: -60,
      riskHighlights: ["Aucun risque météorologique notable"],
      summaryText: "Semaine estivale par excellence. Températures de 15°C au lever du jour à 28-30°C au cœur de l'après-midi."
    },
    {
      regionName: "Sud-Ouest (Nouvelle-Aquitaine, Occitanie Ouest, Midi-Toulousain)",
      regionCode: 'SO',
      dominantWeather: "Plein soleil, chaleur bien installée, quelques brumes côtières landaises.",
      tempAnomalyC: +1.8,
      precipAnomalyPct: -65,
      riskHighlights: ["Chaleur soutenue l'après-midi (30-33°C)", "Indice UV 8 très élevé"],
      summaryText: "Fort ensoleillement continu. Les températures approchent les 32°C à Bordeaux et Toulouse sans excès nocturne."
    },
    {
      regionName: "Sud-Est & Méditerranée (PACA, Côte d'Azur, Vallée du Rhône, Corse)",
      regionCode: 'SE',
      dominantWeather: "Temps chaud et très sec, ciel d'azur, mistral et tramontane faiblissants.",
      tempAnomalyC: +1.5,
      precipAnomalyPct: -85,
      riskHighlights: ["Risque feux de forêts modéré à sévère", "Indice de sécheresse des sols en hausse"],
      summaryText: "Chaleur méditerranéenne franche. Maximales entre 31°C et 35°C dans l'arrière-pays provençal et en Corse."
    },
    {
      regionName: "Reliefs & Massifs (Alpes, Pyrénées, Massif Central, Jura, Vosges)",
      regionCode: 'MASSIFS',
      dominantWeather: "Excellentes conditions de randonnée, très bonne visibilité, rares cumulus diurnes.",
      tempAnomalyC: +1.6,
      precipAnomalyPct: -40,
      riskHighlights: ["Isotherme 0°C élevé (> 4200 m sur les Alpes)", "Fonte glaciaire active"],
      summaryText: "Douceur remarquable en altitude avec une isotherme 0°C flirtant avec les plus hauts sommets alpins."
    }
  ];

  // ----------------------------------------------------
  // SEMAINE 2 (S+2 : J+8 à J+14)
  // ----------------------------------------------------
  const week2Scenarios: NationalFourWeekBulletinWeek['scenarios'] = {
    dominant: {
      scenarioId: 'W2_DOM',
      name: "Scénario A : Marais Barométrique Chaud et Évolution Orageuse Diurne",
      probabilityPct: 55,
      regimeType: "Marais Barométrique / Blocage Est",
      synopticMechanism: "Champ de pression mou sur la France avec advection d'air tiède et humide. Convection thermique l'après-midi sur les reliefs et plaines intérieures.",
      temperatureAnomalyC: +1.6,
      precipitationAnomalyPct: +20,
      description: "Maintien d'une ambiance chaude et estivale, devenant lourde et instable en fin de journée. Orages d'évolution diurne éclatant principalement des Pyrénées aux Alpes et sur le Massif Central.",
      isDominant: true
    },
    alternative: {
      scenarioId: 'W2_ALT',
      name: "Scénario B : Goutte Froide Atlantique et Dégradation Pluvio-Orageuse Organisée",
      probabilityPct: 30,
      regimeType: "Creusement Atlantique",
      synopticMechanism: "Plongeon d'une poche d'air froid à 500 hPa vers le Golfe de Gascogne provoquant un conflit de masse d'air violent.",
      temperatureAnomalyC: -0.2,
      precipitationAnomalyPct: +60,
      description: "Fronts orageux actifs balayant le pays du Sud-Ouest vers le Nord-Est avec fortes précipitations et risque de grêle.",
      isDominant: false
    },
    minority: {
      scenarioId: 'W2_MIN',
      name: "Scénario C : Blocage Anticyclonique Scandinave Sec et Continental",
      probabilityPct: 15,
      regimeType: "Scand-Block",
      synopticMechanism: "Puissant anticyclone sur la Scandinavie envoyant un flux de Nord-Est continental sec.",
      temperatureAnomalyC: +0.8,
      precipitationAnomalyPct: -70,
      description: "Temps totalement sec, vent d'Est sensible et asséchant, ciel limpide sur l'ensemble du territoire.",
      isDominant: false
    }
  };

  const week2Regions: NationalRegionalDetail[] = [
    {
      regionName: "Nord-Ouest (Bretagne, Normandie, Hauts-de-France)",
      regionCode: 'NO',
      dominantWeather: "Temps variable et doux, ciel voilé, averses éparses possibles en soirée.",
      tempAnomalyC: +0.8,
      precipAnomalyPct: +10,
      riskHighlights: ["Averses orageuses locales sur l'intérieur breton"],
      summaryText: "Températures proches des normales (23°C à 27°C). Atmosphère douce et légèrement plus humide."
    },
    {
      regionName: "Nord-Est & Centre-Est (Grand-Est, Bourgogne, Lorraine, Alsace)",
      regionCode: 'NE',
      dominantWeather: "Chaud et lourd, ensoleillé en matinée, bourgeonnements orageux l'après-midi.",
      tempAnomalyC: +1.8,
      precipAnomalyPct: +30,
      riskHighlights: ["Risque d'orages localement forts avec foudre et bourrasques", "Cumuls hétérogènes"],
      summaryText: "Chaleur lourde atteignant 28°C à 32°C. Les averses orageuses apporteront un arrosage bienvenu mais localisé."
    },
    {
      regionName: "Bassin Parisien & Région Centre",
      regionCode: 'CENTRE',
      dominantWeather: "Soleil et nuages cumuliformes, sensation de lourdeur, rares ondées orageuses.",
      tempAnomalyC: +1.5,
      precipAnomalyPct: -10,
      riskHighlights: ["Atmosphère moite en soirée"],
      summaryText: "Temps estival persistant. Températures oscillant entre 27°C et 31°C l'après-midi."
    },
    {
      regionName: "Sud-Ouest (Nouvelle-Aquitaine, Occitanie Ouest)",
      regionCode: 'SO',
      dominantWeather: "Très chaud le matin, développement d'orages pré-frontaux en fin d'après-midi.",
      tempAnomalyC: +2.1,
      precipAnomalyPct: +25,
      riskHighlights: ["Risque d'orages de chaleur sur le piémont pyrénéen", "Pointes à 34°C"],
      summaryText: "Fortes chaleurs persistant sur le bassin aquitain avant le déclenchement d'ondées orageuses salvatrices."
    },
    {
      regionName: "Sud-Est & Méditerranée (PACA, Rhône, Corse)",
      regionCode: 'SE',
      dominantWeather: "Chaleur caniculaire locale, soleil ardent, orages cantonnés aux reliefs alpins.",
      tempAnomalyC: +2.3,
      precipAnomalyPct: -50,
      riskHighlights: ["Sécheresse superficielle critique", "Fortes chaleurs nocturnes (Tn > 22°C)"],
      summaryText: "Régime très sec et étouffant. Les températures dépassent fréquemment 33°C à 36°C dans l'intérieur."
    },
    {
      regionName: "Massifs & Reliefs (Alpes, Pyrénées, Massif Central)",
      regionCode: 'MASSIFS',
      dominantWeather: "Matinées lumineuses suivies d'orages de montagne réguliers après 15h.",
      tempAnomalyC: +1.5,
      precipAnomalyPct: +45,
      riskHighlights: ["Foudre fréquente sur les cimes", "Chutes de grésil localisées"],
      summaryText: "Forte activité convective typique d'un marais barométrique. Prudence pour les activités de haute montagne en après-midi."
    }
  ];

  // ----------------------------------------------------
  // SEMAINE 3 (S+3 : J+15 à J+21)
  // ----------------------------------------------------
  const week3Scenarios: NationalFourWeekBulletinWeek['scenarios'] = {
    dominant: {
      scenarioId: 'W3_DOM',
      name: "Scénario A : Anticyclone d'Europe Centrale & Douceur Durable de Fin d'Été",
      probabilityPct: 50,
      regimeType: "Scand-Block / Anticyclone Continental",
      synopticMechanism: "Blocage anticyclonique étiré de la Pologne à la France garantissant une masse d'air stable et continentale.",
      temperatureAnomalyC: +1.3,
      precipitationAnomalyPct: -35,
      description: "Retour d'un temps calme, très stable et ensoleillé sur une grande majorité des régions. Déficit pluviométrique marqué et températures agréables.",
      isDominant: true
    },
    alternative: {
      scenarioId: 'W3_ALT',
      name: "Scénario B : Flux Océanique de Nord-Ouest Frais et Humide",
      probabilityPct: 30,
      regimeType: "Dorsale Atlantique / Flux de Nord",
      synopticMechanism: "Dépression centrée sur la Scandinavie rabattant de l'air d'origine polaire maritime sur le quart Nord-Est de la France.",
      temperatureAnomalyC: -1.5,
      precipitationAnomalyPct: +40,
      description: "Nette baisse des températures avec sensation automnale précoce au Nord de la Loire et pluies fréquentes.",
      isDominant: false
    },
    minority: {
      scenarioId: 'W3_MIN',
      name: "Scénario C : Creusement Méditerranéen & Premières Entrées Maritimes",
      probabilityPct: 20,
      regimeType: "Creusement Méditerranéen",
      synopticMechanism: "Goutte froide isolée sur les Baléares générant un flux de Sud-Est humide sur le pourtour méditerranéen.",
      temperatureAnomalyC: +0.4,
      precipitationAnomalyPct: +80,
      description: "Épisode d'arrosage soutenu sur les Cévennes et la Corse avec ciel bas et entrées maritimes denses.",
      isDominant: false
    }
  };

  const week3Regions: NationalRegionalDetail[] = [
    {
      regionName: "Nord-Ouest (Bretagne, Normandie, Hauts-de-France)",
      regionCode: 'NO',
      dominantWeather: "Ciel clair à peu nuageux, brises thermiques, nuits fraîches.",
      tempAnomalyC: +0.5,
      precipAnomalyPct: -25,
      riskHighlights: ["Rosée matinale abondante", "Fraîcheur à l'aube (Tn 11-13°C)"],
      summaryText: "Conditions de fin d'été très agréables avec des journées lumineuses et des nuits reposantes."
    },
    {
      regionName: "Nord-Est & Centre-Est",
      regionCode: 'NE',
      dominantWeather: "Beau temps sec, vent d'Est modéré, excellente visibilité.",
      tempAnomalyC: +1.1,
      precipAnomalyPct: -40,
      riskHighlights: ["Sécheresse agricole des sols superficiels"],
      summaryText: "Poursuite du temps calme et sec. Les maximales atteignent 25°C à 28°C."
    },
    {
      regionName: "Bassin Parisien & Région Centre",
      regionCode: 'CENTRE',
      dominantWeather: "Ensoleillement généreux, températures idéales, pas de pluie.",
      tempAnomalyC: +1.0,
      precipAnomalyPct: -45,
      riskHighlights: ["Faible recharge hydrique"],
      summaryText: "Conditions météo optimales pour toutes les activités extérieures (Tx 26-28°C)."
    },
    {
      regionName: "Sud-Ouest",
      regionCode: 'SO',
      dominantWeather: "Chaleur agréable et modérée, soleil sans partage, brumes matinales en vallées.",
      tempAnomalyC: +1.5,
      precipAnomalyPct: -30,
      riskHighlights: ["Indice thermique de saison très confortable"],
      summaryText: "Temps estival radieux. Maximales de 28°C à 31°C sans excès de chaleur."
    },
    {
      regionName: "Sud-Est & Méditerranée",
      regionCode: 'SE',
      dominantWeather: "Soleil dominant, début possible d'entrées maritimes sur le Golfe du Lion.",
      tempAnomalyC: +1.4,
      precipAnomalyPct: -20,
      riskHighlights: ["Risque d'averses orageuses locales en arrière-pays"],
      summaryText: "La chaleur commence à décliner doucement tout en restant très estivale (29°C à 33°C)."
    },
    {
      regionName: "Massifs & Reliefs",
      regionCode: 'MASSIFS',
      dominantWeather: "Beau temps d'altitude limpide, faible convection, fraîcheur nocturne.",
      tempAnomalyC: +0.9,
      precipAnomalyPct: -30,
      riskHighlights: ["Amplitudes thermiques marquées (de 6°C la nuit à 22°C le jour à 1500m)"],
      summaryText: "Conditions parfaites en montagne avec une atmosphère très limpide et stable."
    }
  ];

  // ----------------------------------------------------
  // SEMAINE 4 (S+4 : J+22 à J+28)
  // ----------------------------------------------------
  const week4Scenarios: NationalFourWeekBulletinWeek['scenarios'] = {
    dominant: {
      scenarioId: 'W4_DOM',
      name: "Scénario A : Transition Océanique Douce et Fronts Perturbés Atténués",
      probabilityPct: 45,
      regimeType: "Régime NAO+ Tempéré",
      synopticMechanism: "Reprise d'un flux zonal atlantique classique. Les perturbations océaniques traversent la moitié Nord tandis que le Sud reste sous protection anticyclonique.",
      temperatureAnomalyC: +0.6,
      precipitationAnomalyPct: -10,
      description: "Climatologie d'arrière-saison classique avec alternance de passages nuageux arrosant modérément le Nord et belles éclaircies durables au Sud.",
      isDominant: true
    },
    alternative: {
      scenarioId: 'W4_ALT',
      name: "Scénario B : Poursuite du Blocage Chaud et Sec (Été Indien)",
      probabilityPct: 35,
      regimeType: "Dorsale Subtropicale",
      synopticMechanism: "Résistance exceptionnelle des hautes pressions méditerranéennes et continentales bloquant toute intrusion dépressionnaire.",
      temperatureAnomalyC: +2.4,
      precipitationAnomalyPct: -65,
      description: "Véritable été indien avec douceur remarquable et sécheresse prolongée sur toute la France.",
      isDominant: false
    },
    minority: {
      scenarioId: 'W4_MIN',
      name: "Scénario C : Premier Vrai Coup de Fraîcheur Automnale & Décrochage Arctique",
      probabilityPct: 20,
      regimeType: "Régime NAO- / Flux de Nord Polaire",
      synopticMechanism: "Vaste dépression nord-européenne plongeant vers les Alpes et chassant l'air chaud.",
      temperatureAnomalyC: -2.8,
      precipitationAnomalyPct: +50,
      description: "Baisse brutale des températures, première neige possible sous 2000 m dans les Alpes et vent froid de Nord.",
      isDominant: false
    }
  };

  const week4Regions: NationalRegionalDetail[] = [
    {
      regionName: "Nord-Ouest",
      regionCode: 'NO',
      dominantWeather: "Passages nuageux océaniques, quelques pluies faibles, vent d'Ouest modéré.",
      tempAnomalyC: +0.2,
      precipAnomalyPct: +15,
      riskHighlights: ["Rafales de vent côtières jusqu'à 50 km/h"],
      summaryText: "Ambiance océanique douce et vivifiante. Maximales de 20°C à 24°C."
    },
    {
      regionName: "Nord-Est & Centre-Est",
      regionCode: 'NE',
      dominantWeather: "Ciel partagé, éclaircies et nuages sans pluie significative, nuits fraîches.",
      tempAnomalyC: +0.5,
      precipAnomalyPct: -15,
      riskHighlights: ["Brumes et bancs de brouillard matinaux"],
      summaryText: "Atmosphère automnale débutante mais douce et calme (Tx 22°C à 25°C)."
    },
    {
      regionName: "Bassin Parisien & Centre",
      regionCode: 'CENTRE',
      dominantWeather: "Beau temps doux et agréable, nuages élevés inoffensifs.",
      tempAnomalyC: +0.7,
      precipAnomalyPct: -20,
      riskHighlights: ["Conditions de circulation optimales"],
      summaryText: "Douceur très confortable sans intempéries (Tx 24°C à 26°C)."
    },
    {
      regionName: "Sud-Ouest",
      regionCode: 'SO',
      dominantWeather: "Très ensoleillé et chaud, été indien bien installé.",
      tempAnomalyC: +1.6,
      precipAnomalyPct: -40,
      riskHighlights: ["Journées encore très estivales (27-30°C)"],
      summaryText: "Conditions idéales pour les vendanges et activités touristiques."
    },
    {
      regionName: "Sud-Est & Méditerranée",
      regionCode: 'SE',
      dominantWeather: "Soleil et ciel bleu, mer encore très tiède (23-24°C), surveillance d'instabilité côtière.",
      tempAnomalyC: +1.2,
      precipAnomalyPct: -10,
      riskHighlights: ["Surveillance des premières gouttes froides méditerranéennes"],
      summaryText: "Climat méditerranéen magnifique avec une mer particulièrement propice à la baignade."
    },
    {
      regionName: "Massifs & Reliefs",
      regionCode: 'MASSIFS',
      dominantWeather: "Ciel clair, excellente visibilité en altitude, températures fraîches à l'aube.",
      tempAnomalyC: +0.4,
      precipAnomalyPct: -15,
      riskHighlights: ["Premières gelées blanches possibles dans les combes jurassiennes à l'aube"],
      summaryText: "Début des teintes d'automne en altitude sous un temps majoritairement calme."
    }
  ];

  const weeks: NationalFourWeekBulletinWeek[] = [
    {
      weekIndex: 1,
      weekLabel: `Semaine 1 (S+1) : ${formatWeekRange(1, 7)}`,
      shortDateRange: formatShortRange(1, 7),
      confidenceIndexPct: 85,
      generalAtmosphericContext: "Haute fiabilité : Blocage anticyclonique solide garantissant un temps largement sec et estival. Températures légèrement au-dessus des normales (+1.2°C à l'échelle nationale).",
      scenarios: week1Scenarios,
      regions: week1Regions,
      keyNationalRisks: [
        "Sécheresse superficielle en accentuation sur le pourtour méditerranéen et la moyenne vallée du Rhône.",
        "Indice UV 7 à 8 nécessitant une protection solaire adéquate en milieu de journée.",
        "Risque d'incendie de forêt modéré à élevé en zone méditerranéenne sous brise marine."
      ],
      hydricAndAgriculturalOutlook: "Conditions météorologiques optimales pour la fin des récoltes céréalières et les travaux des champs. En revanche, l'évapotranspiration (ETP) reste élevée (4 à 6 mm/jour), asséchant les horizons de surface sans pluies prévues.",
      energyAndConsumptionOutlook: "Consommation électrique modérée (climatisation active au Sud mais sans pic d'alerte). Excellente production photovoltaïque sur l'ensemble du territoire."
    },
    {
      weekIndex: 2,
      weekLabel: `Semaine 2 (S+2) : ${formatWeekRange(8, 14)}`,
      shortDateRange: formatShortRange(8, 14),
      confidenceIndexPct: 70,
      generalAtmosphericContext: "Fiabilité bonne à modérée : Marais barométrique chaud évoluant vers une instabilité orageuse diurne d'origine convective. Températures chaudes (+1.6°C au-dessus des moyennes de saison).",
      scenarios: week2Scenarios,
      regions: week2Regions,
      keyNationalRisks: [
        "Orages d'été localement vigoureux avec fortes intensités pluvieuses en montagne et sur le flanc Est.",
        "Sensations d'inconfort thermique lourd dans les grandes agglomérations.",
        "Cumuls très hétérogènes : 0 mm sous une commune et 30 mm à 5 km de distance."
      ],
      hydricAndAgriculturalOutlook: "Les pluies orageuses apporteront un répit très localisé aux cultures d'été (maïs, tournesol, vignes), mais leur ruissellement rapide limitera la recharge profonde des nappes.",
      energyAndConsumptionOutlook: "Légère hausse de la demande de climatisation lors des journées les plus lourdes. Production éolienne faible à modérée, intermittence solaire liée aux enclumes orageuses en fin de journée."
    },
    {
      weekIndex: 3,
      weekLabel: `Semaine 3 (S+3) : ${formatWeekRange(15, 21)}`,
      shortDateRange: formatShortRange(15, 21),
      confidenceIndexPct: 55,
      generalAtmosphericContext: "Fiabilité modérée : Tendance dominante au regonflement d'une cellule anticyclonique continentale. Temps calme, sec et bien ventilé avec douceur persistante.",
      scenarios: week3Scenarios,
      regions: week3Regions,
      keyNationalRisks: [
        "Aggravation du déficit pluviométrique sur le quart Nord-Est et le Centre.",
        "Amplitudes thermiques journalières accrues (fraîcheur matinale, après-midi chauds)."
      ],
      hydricAndAgriculturalOutlook: "Stabilité favorable aux vendanges dans le Midi et le Val de Loire. L'humidité des sols atteint un niveau bas sur les plaines sédimentaires.",
      energyAndConsumptionOutlook: "Bilan énergétique très équilibré. Températures diurnes agréables limitant les besoins en refroidissement, nuits fraîches favorables au rafraîchissement naturel des bâtiments."
    },
    {
      weekIndex: 4,
      weekLabel: `Semaine 4 (S+4) : ${formatWeekRange(22, 28)}`,
      shortDateRange: formatShortRange(22, 28),
      confidenceIndexPct: 40,
      generalAtmosphericContext: "Tendance à longue échéance : Équilibre entre la reprise modérée d'un rail atlantique doux au Nord et la persistance d'un été indien ensoleillé au Sud.",
      scenarios: week4Scenarios,
      regions: week4Regions,
      keyNationalRisks: [
        "Incertitude synoptique typique des transitions saisonnières (Scénario chaud à 35% vs Scénario frais à 20%).",
        "Premiers signaux de vigilance sur le Golfe du Lion (surveillance de gouttes froides de rentrée)."
      ],
      hydricAndAgriculturalOutlook: "Arrosage attendu sur la bordure nordique. Les cours d'eau du Sud demeurent à des débits d'étiage de fin d'été.",
      energyAndConsumptionOutlook: "Reprise progressive de la production éolienne océanique sur la Manche et la façade atlantique."
    }
  ];

  const dateRangeFormatted = `${formatWeekRange(1, 28)}`;
  const generalNationalHeadline = "Synthèse Synoptique Nationale : Prédominance d'un Temps Chaud et Sec avec Épisodes Orageux Convectifs";
  const executiveSynthesis = "Sur l'ensemble des 4 prochaines semaines, la France se situera sous l'influence globale de pressions plus élevées que la moyenne avec une anomalie thermique moyenne estimée à +1.2°C à +1.5°C au-dessus des normales 1991-2020. Le signal pluviométrique est globalement déficitaire (-25% à l'échelle du pays), entrecoupé d'orages d'évolution diurne en Semaine 2. Les indices de blocage restent forts, écartant à ce stade tout coup de froid précoce durable.";

  return {
    generatedAt: now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    dateRangeFormatted,
    generalNationalHeadline,
    executiveSynthesis,
    weeks,
    teleconnectionDriversSummary: {
      mjoPhase: "Phase 4/5 (Pacifique Ouest) favorisant les dorsales sur l'Europe occidentale",
      naoTrend: "NAO légèrement positive (+0.6 σ), maintien du courant-jet au Nord",
      aoTrend: "Oscillation Arctique neutre (+0.2 σ), pas de déstabilisation du vortex",
      ensoPhase: "La Niña modérée (ONI -0.7°C), favorise des blocages récurrents",
      polarVortexStatus: "Vortex polaire stratosphérique en cours de reformation automnale normale"
    }
  };
}
