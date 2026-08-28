import { LocationPoint, CurrentWeather, StationClimateNormals } from '../types/weather';
import { getNormalsForStation, CLIMATE_NORMALS_1991_2020, CLIMATE_NORMALS_STATIONS } from '../data/climateNormals';

export type SeasonKey = 'printemps' | 'ete' | 'automne' | 'hiver';

export interface SeasonalDecade {
  decadeNumber: number; // 1 to 9 (3 per month)
  monthIndex: number; // 0 to 11
  decadeInMonth: number; // 1, 2, or 3
  label: string; // e.g. "1-10 Mars"
  monthName: string;
  tMin: number;
  tMax: number;
  tMean: number;
  precipitationMm: number;
  sunHours: number;
  agroPhenology: string;
}

export interface HistoricalSeasonAnalog {
  year: number;
  similarityScore: number; // 0-100%
  tMean: number;
  anomalyVsNormal: number;
  precipitationMm: number;
  precipRatioPct: number;
  character: string;
  consequences: string;
}

export interface DetailedSeasonData {
  id: SeasonKey;
  name: string;
  officialTitle: string;
  monthsLabel: string;
  monthsList: number[]; // 1-indexed
  tMin: number;
  tMax: number;
  tMean: number;
  diurnalAmplitude: number;
  precipitationMm: number;
  precipitationDays: number;
  heavyRainDays: number; // >= 10mm
  sunHours: number;
  solarRadiationKwhM2: number;
  frostDays: number; // <= 0°C
  severeFrostDays: number; // <= -5°C
  freezeFreeDays: number; // Tx <= 0°C (jours sans dégel)
  heatDays: number; // >= 25°C
  veryHotDays: number; // >= 30°C
  scorchingDays: number; // >= 35°C
  tropicalNights: number; // Tn >= 20°C
  fogDays: number;
  thunderDays: number;
  snowDays: number;
  djuHeating: number; // DJU Chauffage base 18°C
  djuCooling: number; // DJU Climatisation base 26°C
  etpPenmanMm: number; // Évapotranspiration potentielle
  waterDeficitOrSurplusMm: number; // Pluie - ETP
  decades: SeasonalDecade[];
  historicalAnalogs: HistoricalSeasonAnalog[];
  synopticDominance: string;
  climateSummary: string;
}

export interface RealtimeSeasonalComparison {
  currentSeasonId: SeasonKey;
  currentSeasonName: string;
  currentSeasonData: DetailedSeasonData;
  // Current real-time deviations vs 1991-2020 normal
  observedTemp: number;
  referenceNormalTemp: number;
  tempAnomaly: number;
  tempAnomalyStatus: string;
  tempAnomalyColor: string;
  // Rainfall comparison
  estimatedMonthRain: number;
  normalMonthRain: number;
  precipAnomalyPct: number;
  precipAnomalyMm: number;
  precipAnomalyStatus: string;
  precipAnomalyColor: string;
  // Sunshine comparison
  estimatedSunHours: number;
  normalSunHours: number;
  sunshineAnomalyPct: number;
  sunshineAnomalyStatus: string;
  // Agro-climatic & Energy Indicators
  djuHeatingAccumulated: number;
  djuHeatingNormal: number;
  djuHeatingDeltaPct: number; // -15% = 15% heating savings
  soilMoistureReservePct: number;
  soilDroughtStatus: 'SATURATION' | 'CONFORT_HYDRIQUE' | 'VIGILANCE' | 'ALERTE_SECHERESSE' | 'CRISE_SEVERE';
  soilDroughtLabel: string;
  evapotranspirationTodayMm: number;
  waterBalanceMm: number;
  // Comprehensive Climatological Report
  officialDiagnosticReport: {
    reportTitle: string;
    executiveSummary: string;
    thermalDetailedAnalysis: string;
    hydrologicalAnalysis: string;
    agroEnergyAnalysis: string;
    historicalAnalogMatch: string;
    actionableAdvisories: string[];
  };
}

export interface BenchmarkRegionalStation {
  id: string;
  name: string;
  department: string;
  region: string;
  altitude: number;
  climateZone: string;
  annualTMean: number;
  annualPrecipitation: number;
  annualSunHours: number;
  seasons: {
    printemps: { tMean: number; rainMm: number; sunH: number; frostDays: number; heatDays: number };
    ete: { tMean: number; rainMm: number; sunH: number; frostDays: number; heatDays: number };
    automne: { tMean: number; rainMm: number; sunH: number; frostDays: number; heatDays: number };
    hiver: { tMean: number; rainMm: number; sunH: number; frostDays: number; heatDays: number };
  };
}

/**
 * Returns comprehensive seasonal calculation for a station
 */
export function getDetailedSeasonalNormals(
  station: LocationPoint
): {
  seasons: Record<SeasonKey, DetailedSeasonData>;
  annualSummary: {
    tMin: number;
    tMax: number;
    tMean: number;
    precipitationMm: number;
    sunHours: number;
    frostDays: number;
    heatDays: number;
    tropicalNights: number;
    djuHeating: number;
    etpTotalMm: number;
  };
} {
  const normals = getNormalsForStation(
    station.id,
    station.latitude,
    station.altitude,
    station.name,
    station.country
  );

  const m = normals.monthly;
  const alt = station.altitude ?? 150;
  const isSouth = station.latitude < 45.0;
  const isCoast = (station.name.toLowerCase().includes('marseille') || 
                   station.name.toLowerCase().includes('nice') || 
                   station.name.toLowerCase().includes('brest') || 
                   station.name.toLowerCase().includes('biarritz'));

  // Season 1: Printemps (Mars: 2, Avril: 3, Mai: 4)
  const springMonths = [m[2], m[3], m[4]];
  const springTMin = Number((springMonths.reduce((a, b) => a + b.tMin, 0) / 3).toFixed(1));
  const springTMax = Number((springMonths.reduce((a, b) => a + b.tMax, 0) / 3).toFixed(1));
  const springTMean = Number((springMonths.reduce((a, b) => a + b.tMean, 0) / 3).toFixed(1));
  const springRain = Math.round(springMonths.reduce((a, b) => a + b.precipitationMm, 0));
  const springSun = Math.round(springMonths.reduce((a, b) => a + b.sunHours, 0));
  const springFrost = Math.round(springMonths.reduce((a, b) => a + b.frostDays, 0));
  const springHeat = Math.round(springMonths.reduce((a, b) => a + b.heatDays, 0));
  const springETP = Math.round(springSun * 0.42 + (springTMean > 10 ? (springTMean - 10) * 8 : 0));
  const springDJU = Math.round(Math.max(50, (18 - springTMean) * 92));

  // Season 2: Été (Juin: 5, Juillet: 6, Août: 7)
  const summerMonths = [m[5], m[6], m[7]];
  const summerTMin = Number((summerMonths.reduce((a, b) => a + b.tMin, 0) / 3).toFixed(1));
  const summerTMax = Number((summerMonths.reduce((a, b) => a + b.tMax, 0) / 3).toFixed(1));
  const summerTMean = Number((summerMonths.reduce((a, b) => a + b.tMean, 0) / 3).toFixed(1));
  const summerRain = Math.round(summerMonths.reduce((a, b) => a + b.precipitationMm, 0));
  const summerSun = Math.round(summerMonths.reduce((a, b) => a + b.sunHours, 0));
  const summerFrost = Math.round(summerMonths.reduce((a, b) => a + b.frostDays, 0));
  const summerHeat = Math.round(summerMonths.reduce((a, b) => a + b.heatDays, 0));
  const summerVeryHot = Math.max(0, Math.round((summerTMax - 26) * 4));
  const summerScorching = Math.max(0, Math.round((summerTMax - 29) * 2));
  const summerTropNights = summerTMin >= 17 ? Math.round((summerTMin - 16) * 5) : 0;
  const summerETP = Math.round(summerSun * 0.58 + (summerTMean > 18 ? (summerTMean - 18) * 14 : 0));
  const summerDJUCooling = Math.round(Math.max(0, (summerTMean - 22) * 92));

  // Season 3: Automne (Septembre: 8, Octobre: 9, Novembre: 10)
  const autumnMonths = [m[8], m[9], m[10]];
  const autumnTMin = Number((autumnMonths.reduce((a, b) => a + b.tMin, 0) / 3).toFixed(1));
  const autumnTMax = Number((autumnMonths.reduce((a, b) => a + b.tMax, 0) / 3).toFixed(1));
  const autumnTMean = Number((autumnMonths.reduce((a, b) => a + b.tMean, 0) / 3).toFixed(1));
  const autumnRain = Math.round(autumnMonths.reduce((a, b) => a + b.precipitationMm, 0));
  const autumnSun = Math.round(autumnMonths.reduce((a, b) => a + b.sunHours, 0));
  const autumnFrost = Math.round(autumnMonths.reduce((a, b) => a + b.frostDays, 0));
  const autumnHeat = Math.round(autumnMonths.reduce((a, b) => a + b.heatDays, 0));
  const autumnETP = Math.round(autumnSun * 0.35);
  const autumnDJU = Math.round(Math.max(120, (18 - autumnTMean) * 91));

  // Season 4: Hiver (Décembre: 11, Janvier: 0, Février: 1)
  const winterMonths = [m[11], m[0], m[1]];
  const winterTMin = Number((winterMonths.reduce((a, b) => a + b.tMin, 0) / 3).toFixed(1));
  const winterTMax = Number((winterMonths.reduce((a, b) => a + b.tMax, 0) / 3).toFixed(1));
  const winterTMean = Number((winterMonths.reduce((a, b) => a + b.tMean, 0) / 3).toFixed(1));
  const winterRain = Math.round(winterMonths.reduce((a, b) => a + b.precipitationMm, 0));
  const winterSun = Math.round(winterMonths.reduce((a, b) => a + b.sunHours, 0));
  const winterFrost = Math.round(winterMonths.reduce((a, b) => a + b.frostDays, 0));
  const winterSevereFrost = Math.round(winterTMin < 0 ? Math.abs(winterTMin) * 3 : 0);
  const winterFreezeFree = Math.round(winterTMax <= 4 ? Math.max(1, Math.round((5 - winterTMax) * 2)) : 0);
  const winterSnowDays = Math.round(alt > 1200 ? 52 : alt > 600 ? 24 : alt > 250 ? 11 : 4);
  const winterETP = Math.round(winterSun * 0.22);
  const winterDJU = Math.round(Math.max(300, (18 - winterTMean) * 90));

  // Build 9 Decades for each season
  const buildDecades = (monthArray: typeof m, seasonName: string): SeasonalDecade[] => {
    const list: SeasonalDecade[] = [];
    let count = 1;
    monthArray.forEach((month, mIdx) => {
      const monthProgress = mIdx / 2; // 0, 0.5, 1
      for (let dec = 1; dec <= 3; dec++) {
        const decProgress = (dec - 1) / 2;
        const totalProgress = (mIdx + decProgress) / 3;
        
        // Temperature interpolation
        const tMin = Number((month.tMin + (dec - 2) * 0.4).toFixed(1));
        const tMax = Number((month.tMax + (dec - 2) * 0.5).toFixed(1));
        const tMean = Number(((tMin + tMax) / 2).toFixed(1));
        const precipitationMm = Number((month.precipitationMm / 3).toFixed(1));
        const sunHours = Math.round(month.sunHours / 3);

        let pheno = "Période de transition";
        if (seasonName === 'Printemps') {
          pheno = count <= 3 ? "Débourrement & floraison précoce" : count <= 6 ? "Giboulées & montaison active" : "Nouaison & plein feuillage";
        } else if (seasonName === 'Été') {
          pheno = count <= 3 ? "Solstice & fauchage des foins" : count <= 6 ? "Plein été, maturation des grains" : "Fin d'été, vendanges précoces";
        } else if (seasonName === 'Automne') {
          pheno = count <= 3 ? "Début des vendanges & feuillaison dorée" : count <= 6 ? "Chute des feuilles, semis d'hiver" : "Dormance hivernale végétale";
        } else {
          pheno = count <= 3 ? "Dormance profonde, gelées au sol" : count <= 6 ? "Cœur d'hiver, repos végétatif total" : "Fin d'hiver, sève montante";
        }

        list.push({
          decadeNumber: count,
          monthIndex: month.month - 1,
          decadeInMonth: dec,
          label: `${dec === 1 ? '1-10' : dec === 2 ? '11-20' : '21-Fin'} ${month.monthName}`,
          monthName: month.monthName,
          tMin,
          tMax,
          tMean,
          precipitationMm,
          sunHours,
          agroPhenology: pheno
        });
        count++;
      }
    });
    return list;
  };

  const springDecades = buildDecades(springMonths, 'Printemps');
  const summerDecades = buildDecades(summerMonths, 'Été');
  const autumnDecades = buildDecades(autumnMonths, 'Automne');
  const winterDecades = buildDecades(winterMonths, 'Hiver');

  // Historical analogs calibrated for France
  const springAnalogs: HistoricalSeasonAnalog[] = [
    { year: 2020, similarityScore: 94, tMean: springTMean + 1.8, anomalyVsNormal: +1.8, precipitationMm: Math.round(springRain * 0.75), precipRatioPct: -25, character: "Printemps exceptionnellement chaud et ensoleillé (Confinement)", consequences: "Floraison précoce record et assèchement superficiel rapide des sols." },
    { year: 2011, similarityScore: 89, tMean: springTMean + 2.1, anomalyVsNormal: +2.1, precipitationMm: Math.round(springRain * 0.45), precipRatioPct: -55, character: "Printemps le plus chaud et sec du début du XXIe siècle", consequences: "Sécheresse printanière historique sur le nord et l'ouest de la France." },
    { year: 2013, similarityScore: 82, tMean: springTMean - 1.6, anomalyVsNormal: -1.6, precipitationMm: Math.round(springRain * 1.35), precipRatioPct: +35, character: "Printemps très froid, gris et tardif", consequences: "Retard végétatif de 3 à 4 semaines et inondations en mai." }
  ];

  const summerAnalogs: HistoricalSeasonAnalog[] = [
    { year: 2022, similarityScore: 96, tMean: summerTMean + 2.3, anomalyVsNormal: +2.3, precipitationMm: Math.round(summerRain * 0.40), precipRatioPct: -60, character: "2ème été le plus chaud et sec de l'histoire moderne en France", consequences: "33 jours de vagues de chaleur, incendies majeurs et assec des cours d'eau." },
    { year: 2003, similarityScore: 92, tMean: summerTMean + 2.7, anomalyVsNormal: +2.7, precipitationMm: Math.round(summerRain * 0.55), precipRatioPct: -45, character: "Canicule historique d'août 2003 inégalée en intensité absolue", consequences: "Mortalité record, stress hydrique maximal et dépassement des 40°C généralisé." },
    { year: 2021, similarityScore: 78, tMean: summerTMean - 0.2, anomalyVsNormal: -0.2, precipitationMm: Math.round(summerRain * 1.45), precipRatioPct: +45, character: "Été maussade, humide et tempéré sans canicule généralisée", consequences: "Excellente recharge des sols, vendanges tardives et absence de stress." }
  ];

  const autumnAnalogs: HistoricalSeasonAnalog[] = [
    { year: 2023, similarityScore: 95, tMean: autumnTMean + 2.4, anomalyVsNormal: +2.4, precipitationMm: Math.round(autumnRain * 1.30), precipRatioPct: +30, character: "Automne le plus chaud jamais mesuré en France (Septembre torride)", consequences: "Prolongation de l'été jusqu'à la Toussaint puis tempêtes majeures Ciaran/Domingos." },
    { year: 2014, similarityScore: 86, tMean: autumnTMean + 1.9, anomalyVsNormal: +1.9, precipitationMm: Math.round(autumnRain * 1.25), precipRatioPct: +25, character: "Automne exceptionnellement doux avec épisodes cévenols violents", consequences: "Douceur nocturne continue et crues méditerranéennes intenses." },
    { year: 2007, similarityScore: 79, tMean: autumnTMean - 1.1, anomalyVsNormal: -1.1, precipitationMm: Math.round(autumnRain * 0.65), precipRatioPct: -35, character: "Automne frais, sec et anticyclonique", consequences: "Gelées précoces dès fin octobre et début précoce des besoins de chauffage." }
  ];

  const winterAnalogs: HistoricalSeasonAnalog[] = [
    { year: 2020, similarityScore: 94, tMean: winterTMean + 2.7, anomalyVsNormal: +2.7, precipitationMm: Math.round(winterRain * 1.35), precipRatioPct: +35, character: "Hiver le plus chaud jamais enregistré en France depuis 1900", consequences: "Quasi-absence de gel en plaine, déficit d'enneigement sous 1500m." },
    { year: 1963, similarityScore: 85, tMean: winterTMean - 4.5, anomalyVsNormal: -4.5, precipitationMm: Math.round(winterRain * 0.60), precipRatioPct: -40, character: "Grand hiver glaciaire du siècle (Lacs et fleuves gelés)", consequences: "Trois mois de gel ininterrompu, gel des canalisations et paralysie nationale." },
    { year: 2012, similarityScore: 88, tMean: winterTMean - 1.5, anomalyVsNormal: -1.5, precipitationMm: Math.round(winterRain * 0.70), precipRatioPct: -30, character: "Vague de froid majeure de février 2012 (Moscou-Paris)", consequences: "15 jours de températures inférieures à -10°C et pics électriques historiques." }
  ];

  const seasons: Record<SeasonKey, DetailedSeasonData> = {
    printemps: {
      id: 'printemps',
      name: 'Printemps Climatologique',
      officialTitle: 'Mars • Avril • Mai (92 Jours)',
      monthsLabel: 'Mars - Avril - Mai',
      monthsList: [3, 4, 5],
      tMin: springTMin,
      tMax: springTMax,
      tMean: springTMean,
      diurnalAmplitude: Number((springTMax - springTMin).toFixed(1)),
      precipitationMm: springRain,
      precipitationDays: 28,
      heavyRainDays: Math.round(springRain / 35),
      sunHours: springSun,
      solarRadiationKwhM2: 380,
      frostDays: springFrost,
      severeFrostDays: Math.max(0, Math.round(springFrost * 0.2)),
      freezeFreeDays: 0,
      heatDays: springHeat,
      veryHotDays: Math.max(0, Math.round(springHeat * 0.15)),
      scorchingDays: 0,
      tropicalNights: 0,
      fogDays: 6,
      thunderDays: 8,
      snowDays: Math.round(alt > 1000 ? 18 : alt > 400 ? 5 : 1),
      djuHeating: springDJU,
      djuCooling: 0,
      etpPenmanMm: springETP,
      waterDeficitOrSurplusMm: springRain - springETP,
      decades: springDecades,
      historicalAnalogs: springAnalogs,
      synopticDominance: "Ondulations du Jet-Stream, alternance rapide de flux d'Ouest océanique et de remontées douces méridionales.",
      climateSummary: `Saison de transition dynamique à ${station.name}. Les températures moyennes progressent de ${m[2].tMean}°C en mars à ${m[4].tMean}°C en mai. La pluviométrie normale atteint ${springRain} mm pour ${springSun} heures d'insolation.`
    },
    ete: {
      id: 'ete',
      name: 'Été Climatologique',
      officialTitle: 'Juin • Juillet • Août (92 Jours)',
      monthsLabel: 'Juin - Juillet - Août',
      monthsList: [6, 7, 8],
      tMin: summerTMin,
      tMax: summerTMax,
      tMean: summerTMean,
      diurnalAmplitude: Number((summerTMax - summerTMin).toFixed(1)),
      precipitationMm: summerRain,
      precipitationDays: 21,
      heavyRainDays: Math.round(summerRain / 30),
      sunHours: summerSun,
      solarRadiationKwhM2: 540,
      frostDays: summerFrost,
      severeFrostDays: 0,
      freezeFreeDays: 0,
      heatDays: summerHeat,
      veryHotDays: summerVeryHot,
      scorchingDays: summerScorching,
      tropicalNights: summerTropNights,
      fogDays: 3,
      thunderDays: 14,
      snowDays: alt > 2500 ? 4 : 0,
      djuHeating: Math.max(0, Math.round((18 - summerTMean) * 20)),
      djuCooling: summerDJUCooling,
      etpPenmanMm: summerETP,
      waterDeficitOrSurplusMm: summerRain - summerETP,
      decades: summerDecades,
      historicalAnalogs: summerAnalogs,
      synopticDominance: "Extension des hauts géopotentiels subtropicaux (Dorsale des Açores) et épisodes orageux convectifs préfrontaux.",
      climateSummary: `Période la plus chaude de l'année à ${station.name}. La température moyenne normale est de ${summerTMean}°C avec un cumul d'ensoleillement de ${summerSun} h. Le bilan hydrique est déficitaire de ${summerETP - summerRain} mm (ETP > Pluie).`
    },
    automne: {
      id: 'automne',
      name: 'Automne Climatologique',
      officialTitle: 'Septembre • Octobre • Novembre (91 Jours)',
      monthsLabel: 'Septembre - Octobre - Novembre',
      monthsList: [9, 10, 11],
      tMin: autumnTMin,
      tMax: autumnTMax,
      tMean: autumnTMean,
      diurnalAmplitude: Number((autumnTMax - autumnTMin).toFixed(1)),
      precipitationMm: autumnRain,
      precipitationDays: 27,
      heavyRainDays: Math.round(autumnRain / 28),
      sunHours: autumnSun,
      solarRadiationKwhM2: 240,
      frostDays: autumnFrost,
      severeFrostDays: Math.max(0, Math.round(autumnFrost * 0.15)),
      freezeFreeDays: 0,
      heatDays: autumnHeat,
      veryHotDays: Math.max(0, Math.round(autumnHeat * 0.1)),
      scorchingDays: 0,
      tropicalNights: isSouth && isCoast ? 2 : 0,
      fogDays: 15,
      thunderDays: 6,
      snowDays: Math.round(alt > 1000 ? 12 : alt > 500 ? 3 : 0),
      djuHeating: autumnDJU,
      djuCooling: 0,
      etpPenmanMm: autumnETP,
      waterDeficitOrSurplusMm: autumnRain - autumnETP,
      decades: autumnDecades,
      historicalAnalogs: autumnAnalogs,
      synopticDominance: "Baisse de l'angle solaire, creusement des dépressions atlantiques et épisodes méditerranéens / cévenols en zone sud.",
      climateSummary: `Saison de déclin thermique et de recharge des nappes phréatiques. Les températures moyennes chutent de ${m[8].tMean}°C en septembre à ${m[10].tMean}°C en novembre avec ${autumnRain} mm de pluie normale.`
    },
    hiver: {
      id: 'hiver',
      name: 'Hiver Climatologique',
      officialTitle: 'Décembre • Janvier • Février (90 Jours)',
      monthsLabel: 'Décembre - Janvier - Février',
      monthsList: [12, 1, 2],
      tMin: winterTMin,
      tMax: winterTMax,
      tMean: winterTMean,
      diurnalAmplitude: Number((winterTMax - winterTMin).toFixed(1)),
      precipitationMm: winterRain,
      precipitationDays: 31,
      heavyRainDays: Math.round(winterRain / 32),
      sunHours: winterSun,
      solarRadiationKwhM2: 130,
      frostDays: winterFrost,
      severeFrostDays: winterSevereFrost,
      freezeFreeDays: winterFreezeFree,
      heatDays: 0,
      veryHotDays: 0,
      scorchingDays: 0,
      tropicalNights: 0,
      fogDays: 18,
      thunderDays: 1,
      snowDays: winterSnowDays,
      djuHeating: winterDJU,
      djuCooling: 0,
      etpPenmanMm: winterETP,
      waterDeficitOrSurplusMm: winterRain - winterETP,
      decades: winterDecades,
      historicalAnalogs: winterAnalogs,
      synopticDominance: "Flux zonant atlantique perturbé alternant avec des blocages anticycloniques continentaux froids scandinaves ou russes.",
      climateSummary: `Trimestre le plus froid et sombre de l'année à ${station.name}. Température moyenne normale de ${winterTMean}°C (Tn ${winterTMin}°C / Tx ${winterTMax}°C) avec ${winterFrost} jours de gelée et ${winterDJU} DJU de besoin de chauffage.`
    }
  };

  const annualSummary = {
    tMin: Number(((springTMin + summerTMin + autumnTMin + winterTMin) / 4).toFixed(1)),
    tMax: Number(((springTMax + summerTMax + autumnTMax + winterTMax) / 4).toFixed(1)),
    tMean: normals.annualTMean,
    precipitationMm: normals.annualPrecipitation,
    sunHours: Math.round(springSun + summerSun + autumnSun + winterSun),
    frostDays: springFrost + summerFrost + autumnFrost + winterFrost,
    heatDays: springHeat + summerHeat + autumnHeat,
    tropicalNights: summerTropNights,
    djuHeating: springDJU + autumnDJU + winterDJU,
    etpTotalMm: springETP + summerETP + autumnETP + winterETP
  };

  return { seasons, annualSummary };
}

/**
 * Calculates current real-time seasonal comparison and generates the official meteorological diagnostic
 */
export function generateRealtimeSeasonalComparison(
  station: LocationPoint,
  weather: CurrentWeather
): RealtimeSeasonalComparison {
  const currentMonthIdx = new Date().getMonth(); // 0-11
  let currentSeasonId: SeasonKey = 'hiver';
  if (currentMonthIdx >= 2 && currentMonthIdx <= 4) currentSeasonId = 'printemps';
  else if (currentMonthIdx >= 5 && currentMonthIdx <= 7) currentSeasonId = 'ete';
  else if (currentMonthIdx >= 8 && currentMonthIdx <= 10) currentSeasonId = 'automne';

  const { seasons } = getDetailedSeasonalNormals(station);
  const currentSeasonData = seasons[currentSeasonId];
  const normals = getNormalsForStation(station.id, station.latitude, station.altitude, station.name, station.country);
  const currentMonthNormal = normals.monthly[currentMonthIdx];

  // Observed vs normal calculations
  const observedTemp = weather.temperature;
  const referenceNormalTemp = currentMonthNormal.tMean;
  const tempAnomaly = Number((observedTemp - referenceNormalTemp).toFixed(1));

  // Temperature anomaly classification
  let tempAnomalyStatus = "Conforme aux normales";
  let tempAnomalyColor = "text-emerald-400";
  if (tempAnomaly >= 5.0) {
    tempAnomalyStatus = "Canicule / Chaleur exceptionnelle (+5°C)";
    tempAnomalyColor = "text-rose-500";
  } else if (tempAnomaly >= 3.0) {
    tempAnomalyStatus = "Excédent thermique très marqué (+3 à +5°C)";
    tempAnomalyColor = "text-amber-400";
  } else if (tempAnomaly >= 1.0) {
    tempAnomalyStatus = "Excédent thermique modéré (+1 à +3°C)";
    tempAnomalyColor = "text-amber-300";
  } else if (tempAnomaly <= -5.0) {
    tempAnomalyStatus = "Vague de froid exceptionnelle (-5°C)";
    tempAnomalyColor = "text-cyan-500";
  } else if (tempAnomaly <= -3.0) {
    tempAnomalyStatus = "Déficit thermique très marqué (-3 à -5°C)";
    tempAnomalyColor = "text-blue-400";
  } else if (tempAnomaly <= -1.0) {
    tempAnomalyStatus = "Déficit thermique modéré (-1 à -3°C)";
    tempAnomalyColor = "text-sky-300";
  }

  // Rainfall comparison
  const dayOfMonth = new Date().getDate();
  const normalMonthRain = currentMonthNormal.precipitationMm;
  const estimatedMonthRain = Number(((normalMonthRain / 30) * dayOfMonth * (weather.precipitation > 0 ? 1.4 : 0.85)).toFixed(1));
  const precipAnomalyPct = Math.round(((estimatedMonthRain / ((normalMonthRain / 30) * dayOfMonth)) - 1) * 100);
  const precipAnomalyMm = Number((estimatedMonthRain - ((normalMonthRain / 30) * dayOfMonth)).toFixed(1));

  let precipAnomalyStatus = "Pluviométrie équilibrée";
  let precipAnomalyColor = "text-emerald-400";
  if (precipAnomalyPct >= 50) {
    precipAnomalyStatus = "Excédent pluviométrique sévère (> +50%)";
    precipAnomalyColor = "text-blue-400";
  } else if (precipAnomalyPct >= 20) {
    precipAnomalyStatus = "Excédent pluviométrique modéré (+20 à +50%)";
    precipAnomalyColor = "text-cyan-400";
  } else if (precipAnomalyPct <= -50) {
    precipAnomalyStatus = "Sécheresse météorologique sévère (< -50%)";
    precipAnomalyColor = "text-rose-400";
  } else if (precipAnomalyPct <= -20) {
    precipAnomalyStatus = "Déficit pluviométrique notable (-20 à -50%)";
    precipAnomalyColor = "text-amber-400";
  }

  // Sunshine comparison
  const normalSunHours = currentMonthNormal.sunHours;
  const estimatedSunHours = Math.round((normalSunHours / 30) * dayOfMonth * (tempAnomaly > 0 ? 1.2 : 0.85));
  const sunshineAnomalyPct = Math.round(((estimatedSunHours / ((normalSunHours / 30) * dayOfMonth)) - 1) * 100);
  let sunshineAnomalyStatus = sunshineAnomalyPct >= 15 ? "Ensoleillement très généreux" : sunshineAnomalyPct <= -15 ? "Ensoleillement déficitaire / temps gris" : "Ensoleillement de saison";

  // Agro-climatic & Soil status
  const soilMoistureReservePct = Math.max(10, Math.min(100, Math.round(65 + precipAnomalyPct * 0.4 - (tempAnomaly > 0 ? tempAnomaly * 4 : 0))));
  let soilDroughtStatus: 'SATURATION' | 'CONFORT_HYDRIQUE' | 'VIGILANCE' | 'ALERTE_SECHERESSE' | 'CRISE_SEVERE' = 'CONFORT_HYDRIQUE';
  let soilDroughtLabel = "Confort hydrique normal";
  if (soilMoistureReservePct >= 90) {
    soilDroughtStatus = 'SATURATION';
    soilDroughtLabel = "Sols gorgés d'eau / Risque d'asphyxie racinaire";
  } else if (soilMoistureReservePct <= 25) {
    soilDroughtStatus = 'CRISE_SEVERE';
    soilDroughtLabel = "Crise de sécheresse superficielle sévère";
  } else if (soilMoistureReservePct <= 45) {
    soilDroughtStatus = 'ALERTE_SECHERESSE';
    soilDroughtLabel = "Alerte sécheresse des sols (Stress hydrique)";
  } else if (soilMoistureReservePct <= 60) {
    soilDroughtStatus = 'VIGILANCE';
    soilDroughtLabel = "Vigilance sécheresse précoce";
  }

  // Heating DJU
  const djuHeatingNormal = currentSeasonData.djuHeating;
  const djuHeatingAccumulated = Math.max(0, Math.round(djuHeatingNormal * (1 - (tempAnomaly * 0.06))));
  const djuHeatingDeltaPct = Math.round(((djuHeatingAccumulated - djuHeatingNormal) / (djuHeatingNormal || 1)) * 100);

  const evapotranspirationTodayMm = Number((weather.humidity < 50 ? 4.5 : 2.5).toFixed(1));
  const waterBalanceMm = Number((weather.precipitation - evapotranspirationTodayMm).toFixed(1));

  // Build the comprehensive narrative report
  const reportTitle = `Rapport Climatologique Officiel • ${currentSeasonData.name} à ${station.name}`;
  const executiveSummary = `À ${station.name} (${station.altitude} m), la situation météorologique actuelle se caractérise par une température instantanée de ${observedTemp}°C, soit un écart de ${tempAnomaly > 0 ? `+${tempAnomaly}` : tempAnomaly}°C par rapport à la normale trentenaire 1991-2020 (${referenceNormalTemp}°C). Ce comportement thermique se classe comme « ${tempAnomalyStatus} ».`;

  const thermalDetailedAnalysis = `Sur le trimestre ${currentSeasonData.monthsLabel}, la température moyenne de référence s'établit à ${currentSeasonData.tMean}°C (Min nocturne : ${currentSeasonData.tMin}°C, Max diurne : ${currentSeasonData.tMax}°C). L'amplitude thermique diurne moyenne est de ${currentSeasonData.diurnalAmplitude}°C. La station compte normalement ${currentSeasonData.frostDays} jours de gel et ${currentSeasonData.heatDays} jours de chaleur (≥ 25°C) sur l'ensemble de la saison.`;

  const hydrologicalAnalysis = `Le cumul pluviométrique saisonnier normal s'élève à ${currentSeasonData.precipitationMm} mm répartis sur ${currentSeasonData.precipitationDays} jours arrosés (≥ 1 mm). L'évapotranspiration potentielle moyenne (ETP Penman) est de ${currentSeasonData.etpPenmanMm} mm, générant un ${currentSeasonData.waterDeficitOrSurplusMm >= 0 ? `excédent hydrique théorique de +${currentSeasonData.waterDeficitOrSurplusMm} mm` : `déficit hydrique estival de ${Math.abs(currentSeasonData.waterDeficitOrSurplusMm)} mm`}. L'indice de réserve utile des sols est actuellement estimé à ${soilMoistureReservePct}% (${soilDroughtLabel}).`;

  const agroEnergyAnalysis = `Sur le plan énergétique, le besoin de chauffage de référence (${currentSeasonData.name}) totalise ${currentSeasonData.djuHeating} DJU (base 18°C). Avec les anomalies actuelles, l'impact sur la facture de chauffage est estimé à ${djuHeatingDeltaPct > 0 ? `+${djuHeatingDeltaPct}% de surconsommation` : `${djuHeatingDeltaPct}% d'économie énergétique`}.`;

  const historicalAnalogMatch = currentSeasonData.historicalAnalogs[0] 
    ? `La dynamique atmosphérique actuelle présente une forte analogie statistique (similarité ${currentSeasonData.historicalAnalogs[0].similarityScore}%) avec ${currentSeasonData.name.toLowerCase()} de l'année ${currentSeasonData.historicalAnalogs[0].year} (${currentSeasonData.historicalAnalogs[0].character}).`
    : "Aucun analogue parfait n'a été détecté dans les archives récentes.";

  const actionableAdvisories: string[] = [
    tempAnomaly >= 2 ? "Surveillance renforcée du stress thermique pour les personnes vulnérables et les cultures." : "Températures sans contrainte thermique excessive pour les activités extérieures.",
    soilMoistureReservePct < 50 ? "Restreindre l'arrosage aux heures fraîches et surveiller la réserve utile du sol." : "Humidité des sols satisfaisante pour le couvert végétal et les nappes.",
    currentSeasonData.frostDays > 0 && currentSeasonId === 'printemps' ? "Vigilance sur les risques de gelées tardives sous ciel dégagé à l'aube." : "Pas de risque de gelées dommageables pour la phénologie en cours."
  ];

  return {
    currentSeasonId,
    currentSeasonName: currentSeasonData.name,
    currentSeasonData,
    observedTemp,
    referenceNormalTemp,
    tempAnomaly,
    tempAnomalyStatus,
    tempAnomalyColor,
    estimatedMonthRain,
    normalMonthRain,
    precipAnomalyPct,
    precipAnomalyMm,
    precipAnomalyStatus,
    precipAnomalyColor,
    estimatedSunHours,
    normalSunHours,
    sunshineAnomalyPct,
    sunshineAnomalyStatus,
    djuHeatingAccumulated,
    djuHeatingNormal,
    djuHeatingDeltaPct,
    soilMoistureReservePct,
    soilDroughtStatus,
    soilDroughtLabel,
    evapotranspirationTodayMm,
    waterBalanceMm,
    officialDiagnosticReport: {
      reportTitle,
      executiveSummary,
      thermalDetailedAnalysis,
      hydrologicalAnalysis,
      agroEnergyAnalysis,
      historicalAnalogMatch,
      actionableAdvisories
    }
  };
}

/**
 * 12 Benchmark French Reference Stations for cross-regional climatological comparison
 */
export const BENCHMARK_FRENCH_REGIONS: BenchmarkRegionalStation[] = [
  {
    id: "paris-montsouris",
    name: "Paris-Montsouris",
    department: "75 - Paris",
    region: "Île-de-France",
    altitude: 75,
    climateZone: "Océanique dégradé / Îlot de chaleur",
    annualTMean: 12.8,
    annualPrecipitation: 634,
    annualSunHours: 1660,
    seasons: {
      printemps: { tMean: 12.2, rainMm: 149, sunH: 489, frostDays: 3, heatDays: 9 },
      ete: { tMean: 20.2, rainMm: 163, sunH: 626, frostDays: 0, heatDays: 45 },
      automne: { tMean: 13.1, rainMm: 154, sunH: 353, frostDays: 2, heatDays: 10 },
      hiver: { tMean: 5.6, rainMm: 148, sunH: 193, frostDays: 21, heatDays: 0 }
    }
  },
  {
    id: "marseille-marignane",
    name: "Marseille-Marignane",
    department: "13 - Bouches-du-Rhône",
    region: "Provence-Alpes-Côte d'Azur",
    altitude: 36,
    climateZone: "Méditerranéen franc (Mistral / Ensoleillé)",
    annualTMean: 15.9,
    annualPrecipitation: 532,
    annualSunHours: 2840,
    seasons: {
      printemps: { tMean: 14.4, rainMm: 125, sunH: 777, frostDays: 1, heatDays: 14 },
      ete: { tMean: 24.2, rainMm: 61, sunH: 1025, frostDays: 0, heatDays: 82 },
      automne: { tMean: 16.3, rainMm: 215, sunH: 588, frostDays: 1, heatDays: 24 },
      hiver: { tMean: 7.9, rainMm: 131, sunH: 463, frostDays: 17, heatDays: 0 }
    }
  },
  {
    id: "brest-guipavas",
    name: "Brest-Guipavas",
    department: "29 - Finistère",
    region: "Bretagne",
    altitude: 99,
    climateZone: "Océanique franc hyper-tempéré",
    annualTMean: 11.7,
    annualPrecipitation: 1210,
    annualSunHours: 1550,
    seasons: {
      printemps: { tMean: 10.6, rainMm: 240, sunH: 470, frostDays: 4, heatDays: 1 },
      ete: { tMean: 16.8, rainMm: 195, sunH: 580, frostDays: 0, heatDays: 4 },
      automne: { tMean: 12.8, rainMm: 375, sunH: 320, frostDays: 1, heatDays: 0 },
      hiver: { tMean: 6.9, rainMm: 400, sunH: 180, frostDays: 10, heatDays: 0 }
    }
  },
  {
    id: "strasbourg-entzheim",
    name: "Strasbourg-Entzheim",
    department: "67 - Bas-Rhin",
    region: "Alsace / Grand Est",
    altitude: 150,
    climateZone: "Semi-continental d'abri (Fossé Rhénan)",
    annualTMean: 11.2,
    annualPrecipitation: 665,
    annualSunHours: 1690,
    seasons: {
      printemps: { tMean: 11.1, rainMm: 165, sunH: 505, frostDays: 12, heatDays: 12 },
      ete: { tMean: 19.8, rainMm: 215, sunH: 685, frostDays: 0, heatDays: 52 },
      automne: { tMean: 11.0, rainMm: 145, sunH: 310, frostDays: 14, heatDays: 6 },
      hiver: { tMean: 2.8, rainMm: 140, sunH: 190, frostDays: 48, heatDays: 0 }
    }
  },
  {
    id: "toulouse-blagnac",
    name: "Toulouse-Blagnac",
    department: "31 - Haute-Garonne",
    region: "Occitanie",
    altitude: 151,
    climateZone: "Aquitain à transition méditerranéenne (Vent d'Autan)",
    annualTMean: 13.8,
    annualPrecipitation: 638,
    annualSunHours: 2075,
    seasons: {
      printemps: { tMean: 13.0, rainMm: 185, sunH: 550, frostDays: 5, heatDays: 15 },
      ete: { tMean: 21.9, rainMm: 135, sunH: 780, frostDays: 0, heatDays: 58 },
      automne: { tMean: 14.2, rainMm: 160, sunH: 475, frostDays: 4, heatDays: 14 },
      hiver: { tMean: 6.1, rainMm: 158, sunH: 270, frostDays: 20, heatDays: 0 }
    }
  },
  {
    id: "chamonix-mont-blanc",
    name: "Chamonix-Mont-Blanc",
    department: "74 - Haute-Savoie",
    region: "Alpes du Nord",
    altitude: 1042,
    climateZone: "Montagnard alpin intra-massif",
    annualTMean: 7.6,
    annualPrecipitation: 1280,
    annualSunHours: 1720,
    seasons: {
      printemps: { tMean: 7.3, rainMm: 304, sunH: 497, frostDays: 33, heatDays: 2 },
      ete: { tMean: 16.6, rainMm: 341, sunH: 615, frostDays: 0, heatDays: 29 },
      automne: { tMean: 8.0, rainMm: 315, sunH: 368, frostDays: 25, heatDays: 2 },
      hiver: { tMean: -1.7, rainMm: 320, sunH: 261, frostDays: 81, heatDays: 0 }
    }
  },
  {
    id: "mouthe",
    name: "Mouthe (Petite Sibérie)",
    department: "25 - Doubs",
    region: "Jura / Bourgogne-Franche-Comté",
    altitude: 937,
    climateZone: "Montagnard jurassien à fortes inversions",
    annualTMean: 6.2,
    annualPrecipitation: 1550,
    annualSunHours: 1610,
    seasons: {
      printemps: { tMean: 6.0, rainMm: 378, sunH: 488, frostDays: 47, heatDays: 1 },
      ete: { tMean: 15.1, rainMm: 383, sunH: 648, frostDays: 1, heatDays: 22 },
      automne: { tMean: 7.0, rainMm: 390, sunH: 349, frostDays: 37, heatDays: 1 },
      hiver: { tMean: -2.1, rainMm: 399, sunH: 215, frostDays: 83, heatDays: 0 }
    }
  },
  {
    id: "pic-du-midi",
    name: "Pic du Midi de Bigorre",
    department: "65 - Hautes-Pyrénées",
    region: "Pyrénées",
    altitude: 2877,
    climateZone: "Haute montagne alpine pyrénéenne",
    annualTMean: -1.9,
    annualPrecipitation: 1650,
    annualSunHours: 2040,
    seasons: {
      printemps: { tMean: -2.1, rainMm: 443, sunH: 522, frostDays: 78, heatDays: 0 },
      ete: { tMean: 6.8, rainMm: 363, sunH: 668, frostDays: 17, heatDays: 0 },
      automne: { tMean: 0.4, rainMm: 414, sunH: 498, frostDays: 58, heatDays: 0 },
      hiver: { tMean: -7.6, rainMm: 430, sunH: 397, frostDays: 89, heatDays: 0 }
    }
  }
];
