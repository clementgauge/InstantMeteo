/**
 * Moteur Physique d'Analyse et de Fiabilité des Hauteurs de Neige en Montagne
 *
 * Résout le biais classique de sous-estimation des modèles NWP (ECMWF, GFS, ICON) :
 * - Les modèles globaux/régionaux lissent l'orographie sur des mailles de 5 à 25 km :
 *   même en demandant une altitude sommet (ex: 3230 m), `snow_depth` reste souvent
 *   ancré à l'altitude moyenne de la maille (~1700–2200 m), sous-estimant fortement le manteau.
 * - Ce module couple :
 *   1) Un bilan massique neigeux sur 60 jours passés (accumulation solide SWE orographique,
 *      densification/tassement, fonte degré-jour et pluie-sur-neige) recalé à l'altitude exacte ;
 *   2) La comparaison multi-modèles directe (ECMWF IFS, DWD ICON, NOAA GFS, Météo-France/Best-Match) ;
 *   3) Un indice de fiabilité dynamique dédié aux hauteurs de neige (35 % à 93 %, jamais figé à 99 %).
 */

export interface MountainSnowModelEntry {
  modelId: string;
  modelName: string;
  rawSnowDepthCm: number | null;
  snowfall48hCm: number | null;
  note: string;
}

export interface SnowDepthReliabilityAnalysis {
  reliabilityPct: number; // 35% à 93%
  reliabilityGrade: 'TRÈS_FIABLE' | 'FIABLE' | 'MODÉRÉE' | 'INCERTAINE' | 'CRITIQUE';
  reliabilityLabel: string;
  badgeColorClass: string;
  rawNwpMeanCm: number;
  correctedNivoseCm: number;
  correctedTopCm: number;
  correctedBottomCm: number;
  underestimationCorrectedCm: number;
  underestimationPct: number;
  rangeNivoseMinCm: number;
  rangeNivoseMaxCm: number;
  rangeTopMinCm: number;
  rangeTopMaxCm: number;
  modelSpreadCm: number;
  lpnProximityRisk: 'FAIBLE' | 'MODÉRÉ' | 'ÉLEVÉ';
  windRedistributionRisk: 'FAIBLE' | 'MODÉRÉ' | 'ÉLEVÉ';
  demBiasLevel: 'FAIBLE' | 'MODÉRÉ' | 'FORT';
  summaryExplanation: string;
  uncertaintyDrivers: string[];
  modelsBreakdown: MountainSnowModelEntry[];
}

export interface DailyPastWeatherPoint {
  tempMinC: number;
  tempMaxC: number;
  precipMm: number;
  snowfallCm?: number;
}

export interface Snowpack60dParams {
  targetAltitudeM: number;
  dailyRefTempAltitudeM: number;
  dailyHistory: DailyPastWeatherPoint[];
  isInternalMassif?: boolean;
  monthIndex?: number; // 0..11
  latitude?: number;
}

export interface Snowpack60dResult {
  depthCm: number;
  sweMm: number;
  bulkDensityKgM3: number;
  snowfall60dCm: number;
  precip60dMm: number;
  meltDaysCount: number;
  meanTempAtAltC: number;
}

/**
 * Simule le bilan massique nivologique quotidien sur 60 jours à l'altitude cible exacte
 * (accumulation solide orographique + tassement métamorphique + fonte degré-jour).
 */
export function simulateAltitudeSnowpack60d(params: Snowpack60dParams): Snowpack60dResult {
  const {
    targetAltitudeM,
    dailyRefTempAltitudeM,
    dailyHistory,
    isInternalMassif = true,
    monthIndex = new Date().getMonth(),
    latitude = 45.5
  } = params;

  if (!dailyHistory || dailyHistory.length === 0) {
    return {
      depthCm: 0,
      sweMm: 0,
      bulkDensityKgM3: 0,
      snowfall60dCm: 0,
      precip60dMm: 0,
      meltDaysCount: 0,
      meanTempAtAltC: 0
    };
  }

  // Facteur d'amplification orographique réaliste des précipitations en altitude
  const orographicPrecipFactor =
    targetAltitudeM > 1100
      ? 1 + Math.min(0.24, (targetAltitudeM - 1100) * 0.00012)
      : 1.0;

  // Sublimation & érosion éolienne sur les crêtes d'altitude exposées (> 2200 m)
  const ridgeSublimationLossRate =
    targetAltitudeM >= 2200
      ? Math.min(0.014, 0.004 + (targetAltitudeM - 2200) * 0.000006)
      : 0.002;

  // Facteur solaire saisonnier pour la fonte (plus faible Nov-Jan, plus fort Mar-Août)
  const isNorthern = latitude >= 0;
  const effectiveMonth = isNorthern ? monthIndex : (monthIndex + 6) % 12;
  const seasonalSolarFactor =
    effectiveMonth === 11 || effectiveMonth === 0
      ? 0.52
      : effectiveMonth === 10 || effectiveMonth === 1
      ? 0.72
      : effectiveMonth === 2 || effectiveMonth === 9
      ? 0.92
      : effectiveMonth === 3 || effectiveMonth === 4
      ? 1.15
      : 1.32;

  let sweMm = 0;
  let bulkDensityKgM3 = 220;
  let totalSnowfallCm = 0;
  let totalPrecipMm = 0;
  let meltDaysCount = 0;
  let sumTempZ = 0;

  const altDiffFromTempRef = targetAltitudeM - dailyRefTempAltitudeM;

  for (let dIdx = 0; dIdx < dailyHistory.length; dIdx++) {
    const day = dailyHistory[dIdx];
    const isWet = day.precipMm >= 1.0;
    const lapseRate = isWet ? 0.0057 : 0.0065;
    const coldPoolBonus = isInternalMassif && !isWet ? -0.5 : 0;

    const tMinZ = day.tempMinC - altDiffFromTempRef * lapseRate + coldPoolBonus;
    const tMaxZ = day.tempMaxC - altDiffFromTempRef * lapseRate + coldPoolBonus * 0.4;
    const tMeanZ = (tMinZ + tMaxZ) / 2;
    sumTempZ += tMeanZ;

    const precipZ = Math.max(0, day.precipMm) * orographicPrecipFactor;
    totalPrecipMm += precipZ;

    // Partition pluie / neige selon la température humide estimée à l'altitude exacte
    let snowFraction = 0;
    if (tMaxZ <= 0.4 && tMeanZ <= -0.6) {
      snowFraction = 1.0;
    } else if (tMeanZ >= 2.6) {
      snowFraction = 0.0;
    } else {
      snowFraction = Math.max(0, Math.min(1, (2.4 - tMeanZ) / 3.0));
    }

    const solidSweMm = precipZ * snowFraction;
    const liquidRainMm = precipZ * (1 - snowFraction);

    if (solidSweMm > 0) {
      const freshDensity =
        tMeanZ <= -8 ? 105 : tMeanZ <= -3 ? 130 : tMeanZ <= 0 ? 170 : 215;
      const freshCm = (solidSweMm / freshDensity) * 100;
      totalSnowfallCm += freshCm;

      if (sweMm <= 0.1) {
        sweMm = solidSweMm;
        bulkDensityKgM3 = freshDensity;
      } else {
        const oldVol = sweMm / bulkDensityKgM3;
        const newVol = solidSweMm / freshDensity;
        sweMm += solidSweMm;
        bulkDensityKgM3 = sweMm / (oldVol + newVol);
      }
    }

    // Métamorphisme, tassement par gravité & vent (vers 310-390 kg/m³)
    if (sweMm > 0) {
      const targetCompactedDensity = tMeanZ > 0 ? 390 : 320;
      const compactionRate = tMeanZ > 0 ? 0.045 : 0.025;
      bulkDensityKgM3 = bulkDensityKgM3 + (targetCompactedDensity - bulkDensityKgM3) * compactionRate;
      // Sublimation et transport éolien hors crêtes
      sweMm = Math.max(0, sweMm * (1 - ridgeSublimationLossRate));
    }

    // Chaleur résiduelle du sol en début de saison (20 premiers jours sur roche nue peu enneigée)
    if (sweMm > 0 && dIdx < 20 && sweMm < 40 && (effectiveMonth === 9 || effectiveMonth === 10)) {
      sweMm = Math.max(0, sweMm - 1.8);
    }

    // Fonte degré-jour + pluie sur neige (jamais de mise à zéro instantanée)
    if (sweMm > 0 && (tMaxZ > 0.2 || tMeanZ > 0)) {
      const positiveDegreeDays = Math.max(0, tMeanZ) + Math.max(0, tMaxZ - 0.3) * 0.28;
      if (positiveDegreeDays > 0.12) {
        meltDaysCount++;
        const ddf = 3.2 * seasonalSolarFactor;
        const rainMelt = liquidRainMm * 0.14 * Math.max(0, tMeanZ);
        const meltSwe = positiveDegreeDays * ddf + rainMelt;
        sweMm = Math.max(0, sweMm - meltSwe);
      }
    }
  }

  // Continuité glaciaire / haute montagne > 2900m hors coeur d'été si les températures récentes restent froides
  const meanTempAtAltC = Number((sumTempZ / dailyHistory.length).toFixed(1));
  if (
    targetAltitudeM >= 2950 &&
    (effectiveMonth >= 10 || effectiveMonth <= 5) &&
    meanTempAtAltC <= -1.0 &&
    sweMm < 60
  ) {
    sweMm = Math.max(sweMm, Math.round((targetAltitudeM - 2850) * 0.12));
  }

  const rawDepthCm = sweMm > 0.5 ? Math.round((sweMm / Math.max(90, bulkDensityKgM3)) * 100) : 0;

  return {
    depthCm: rawDepthCm,
    sweMm: Number(sweMm.toFixed(1)),
    bulkDensityKgM3: Math.round(bulkDensityKgM3),
    snowfall60dCm: Math.round(totalSnowfallCm),
    precip60dMm: Math.round(totalPrecipMm),
    meltDaysCount,
    meanTempAtAltC
  };
}

export interface ReconcileMountainSnowParams {
  altitudeBaseM: number;
  altitudeNivoseM: number;
  altitudePeakM: number;
  baseTempC: number;
  nivoseTempC: number;
  peakTempC: number;
  liveLpnM: number;
  liveIsoZeroM: number;
  ridgeWindGustKmh: number;
  precip24hMm: number;
  // Raw NWP snow_depth (cm)
  rawBestMatchBaseCm: number;
  rawBestMatchNivoseCm: number;
  rawBestMatchPeakCm: number;
  multiModelEntries: MountainSnowModelEntry[];
  // 60-day physical snowpack balance at 3 elevations
  sim60dBase?: Snowpack60dResult | null;
  sim60dNivose?: Snowpack60dResult | null;
  sim60dPeak?: Snowpack60dResult | null;
  // Fallback catalog hints (when offline)
  catalogBottomCm?: number;
  catalogTopCm?: number;
}

/**
 * Réconcilie les données brutes NWP et le bilan physique 60j à l'altitude exacte,
 * corrige les sous-estimations de maille et calcule la fiabilité nivologique dynamique.
 */
export function reconcileMountainSnowAndReliability(
  p: ReconcileMountainSnowParams
): SnowDepthReliabilityAnalysis {
  const validModelDepths = p.multiModelEntries
    .map((m) => m.rawSnowDepthCm)
    .filter((v): v is number => typeof v === 'number' && !isNaN(v) && v >= 0);

  const rawNwpPeakVals = validModelDepths.length > 0 ? validModelDepths : [p.rawBestMatchPeakCm];
  const rawNwpMeanCm = Math.round(
    rawNwpPeakVals.reduce((a, b) => a + b, 0) / rawNwpPeakVals.length
  );
  const rawNwpMaxCm = Math.max(p.rawBestMatchPeakCm, ...rawNwpPeakVals);
  const rawNwpMinCm = Math.min(p.rawBestMatchPeakCm, ...rawNwpPeakVals);
  const modelSpreadCm = Math.max(0, rawNwpMaxCm - rawNwpMinCm);

  // Réconciliation à chaque niveau : jamais de mise à zéro brutale sur un simple redoux diurne !
  const reconcileLevel = (
    rawNwpCm: number,
    sim60d: Snowpack60dResult | null | undefined,
    levelAlt: number,
    levelTemp: number,
    catalogFallbackCm: number,
    isPeak: boolean
  ): number => {
    const simCm = sim60d?.depthCm ?? 0;
    const rawAnchor = isPeak ? Math.max(rawNwpCm, Math.round((rawNwpMeanCm + rawNwpMaxCm) / 2)) : rawNwpCm;

    // Si on n'a ni mesure API > 0 ni simulation > 0
    if (rawAnchor === 0 && simCm === 0) {
      return levelTemp <= 0.5 && levelAlt >= p.liveLpnM ? catalogFallbackCm : 0;
    }

    // Correction de sous-estimation NWP :
    // Quand la simulation 60j à l'altitude exacte montre un manteau nettement plus épais que la maille NWP lissée
    if (simCm > rawAnchor * 1.25 && simCm >= 8) {
      const nwpUpper = Math.max(rawAnchor, isPeak ? rawNwpMaxCm : Math.round(rawNwpMaxCm * 0.75));
      const blended = Math.round(simCm * 0.45 + nwpUpper * 0.55);
      return Math.max(rawAnchor, blended);
    }

    if (simCm > 0 && rawAnchor > 0) {
      return Math.round(simCm * 0.38 + rawAnchor * 0.62);
    }

    return Math.max(rawAnchor, simCm);
  };

  let correctedTopCm = reconcileLevel(
    p.rawBestMatchPeakCm,
    p.sim60dPeak,
    p.altitudePeakM,
    p.peakTempC,
    p.catalogTopCm ?? 0,
    true
  );

  let correctedNivoseCm = reconcileLevel(
    p.rawBestMatchNivoseCm,
    p.sim60dNivose,
    p.altitudeNivoseM,
    p.nivoseTempC,
    Math.round((p.catalogTopCm ?? 0) * 0.65),
    false
  );

  let correctedBottomCm = reconcileLevel(
    p.rawBestMatchBaseCm,
    p.sim60dBase,
    p.altitudeBaseM,
    p.baseTempC,
    p.catalogBottomCm ?? 0,
    false
  );

  // Cohérence verticale hypsométrique stricte : Sommet >= Nivôse >= Pied de station
  if (p.altitudeNivoseM >= p.altitudeBaseM && correctedNivoseCm < correctedBottomCm) {
    correctedNivoseCm = correctedBottomCm;
  }
  if (correctedTopCm < correctedNivoseCm) {
    correctedTopCm = correctedNivoseCm;
  }

  const baselineRawTop = Math.max(p.rawBestMatchPeakCm, rawNwpMeanCm);
  const underestimationCorrectedCm = Math.max(0, correctedTopCm - baselineRawTop);
  const underestimationPct =
    baselineRawTop > 0
      ? Math.round((underestimationCorrectedCm / baselineRawTop) * 100)
      : correctedTopCm > 0
      ? 100
      : 0;

  // Calcul dynamique du score de fiabilité nivologique (35% à 93%)
  let relScore = 88;
  const uncertaintyDrivers: string[] = [];

  // 1. Biais sous-maille DEM / écart entre brut NWP et bilan altimétrique
  let demBiasLevel: SnowDepthReliabilityAnalysis['demBiasLevel'] = 'FAIBLE';
  if (underestimationCorrectedCm >= 35 || underestimationPct >= 65) {
    demBiasLevel = 'FORT';
    relScore -= 14;
    uncertaintyDrivers.push(
      `Sous-estimation forte des modèles bruts (${baselineRawTop} cm bruts vs ${correctedTopCm} cm corrigés au sommet) liée au lissage d'altitude de leurs mailles.`
    );
  } else if (underestimationCorrectedCm >= 12 || underestimationPct >= 25) {
    demBiasLevel = 'MODÉRÉ';
    relScore -= 7;
    uncertaintyDrivers.push(
      `Correction orographique appliquée (+${underestimationCorrectedCm} cm) pour compenser la résolution kilométrique des modèles.`
    );
  } else {
    uncertaintyDrivers.push(
      `Bonne cohérence entre la maille NWP et le bilan physique d'altitude sur 60 jours.`
    );
  }

  // 2. Dispersion inter-modèles (ECMWF IFS vs ICON vs GFS vs AROME/Best-Match)
  if (modelSpreadCm >= 45) {
    relScore -= 14;
    uncertaintyDrivers.push(
      `Forte divergence entre modèles sur la hauteur au sol (${modelSpreadCm} cm d'écart entre ${rawNwpMinCm} et ${rawNwpMaxCm} cm).`
    );
  } else if (modelSpreadCm >= 20) {
    relScore -= 8;
    uncertaintyDrivers.push(
      `Dispersion modérée entre modèles météo (${modelSpreadCm} cm d'écart inter-centres).`
    );
  } else if (validModelDepths.length >= 2) {
    relScore += 2;
    uncertaintyDrivers.push(
      `Accord satisfaisant entre centres météorologiques sur l'épaisseur du manteau (${modelSpreadCm} cm d'écart).`
    );
  }

  // 3. Sensibilité à la Limite Pluie-Neige (LPN proche du domaine ou transition 0°C)
  const distNivoseLpn = Math.abs(p.altitudeNivoseM - p.liveLpnM);
  const isNearFreezeWithPrecip =
    (distNivoseLpn <= 260 && p.precip24hMm >= 1.0) ||
    (p.baseTempC >= -0.8 && p.baseTempC <= 2.8 && p.precip24hMm >= 1.5);
  let lpnProximityRisk: SnowDepthReliabilityAnalysis['lpnProximityRisk'] = 'FAIBLE';

  if (isNearFreezeWithPrecip) {
    lpnProximityRisk = 'ÉLEVÉ';
    relScore -= 13;
    uncertaintyDrivers.push(
      `LPN active (${p.liveLpnM} m) très proche du cœur de station : la moindre variation de ±1 °C bascule les chutes entre pluie et neige lourde.`
    );
  } else if (distNivoseLpn <= 400 || (p.nivoseTempC > -0.5 && p.nivoseTempC < 3.0)) {
    lpnProximityRisk = 'MODÉRÉ';
    relScore -= 6;
    uncertaintyDrivers.push(
      `Zone thermique proche du 0 °C autour de la balise (${p.nivoseTempC}°C) favorisant tassement rapide et fonte diurne en adret.`
    );
  } else if (p.peakTempC <= -4 && correctedTopCm > 0) {
    relScore += 2;
    uncertaintyDrivers.push(
      `Manteau préservé dans l'air froid en altitude (${p.peakTempC}°C au sommet), limitant l'incertitude liée à la fonte.`
    );
  }

  // 4. Redistribution éolienne en crête (vent > 55 km/h = fortes congères vs crêtes pelées)
  let windRedistributionRisk: SnowDepthReliabilityAnalysis['windRedistributionRisk'] = 'FAIBLE';
  if (p.ridgeWindGustKmh >= 75) {
    windRedistributionRisk = 'ÉLEVÉ';
    relScore -= 11;
    uncertaintyDrivers.push(
      `Vent violent en crête (${p.ridgeWindGustKmh} km/h) : fort transport éolien créant de grands écarts entre croupes décapées et combes accumulées.`
    );
  } else if (p.ridgeWindGustKmh >= 50) {
    windRedistributionRisk = 'MODÉRÉ';
    relScore -= 6;
    uncertaintyDrivers.push(
      `Vent modéré à soutenu (${p.ridgeWindGustKmh} km/h) redistribuant localement la neige fraîche sous le vent.`
    );
  }

  // 5. Sans neige au sol : la fiabilité d'absence de neige est plus haute si loin de la LPN
  if (correctedTopCm === 0 && p.peakTempC >= 4.0) {
    relScore = Math.max(relScore, 84);
  }

  // Bonus rare d'unanimité physique & multi-modèles (froid sec stable, faible biais et vent calme)
  if (
    demBiasLevel === 'FAIBLE' &&
    lpnProximityRisk === 'FAIBLE' &&
    windRedistributionRisk === 'FAIBLE' &&
    modelSpreadCm <= 6 &&
    validModelDepths.length >= 3 &&
    p.peakTempC <= -3
  ) {
    relScore += 6;
  }

  // Bornes claires : plancher absolu 35 %, plafond maximal 98 % (rare, accord parfait)
  const reliabilityPct = Math.min(98, Math.max(35, Math.round(relScore)));

  let reliabilityGrade: SnowDepthReliabilityAnalysis['reliabilityGrade'] = 'FIABLE';
  let reliabilityLabel = 'Fiabilité Bonne';
  let badgeColorClass = 'text-sky-300 bg-sky-500/15 border-sky-500/40';

  if (reliabilityPct >= 82) {
    reliabilityGrade = 'TRÈS_FIABLE';
    reliabilityLabel = 'Haute Fiabilité Nivologique';
    badgeColorClass = 'text-emerald-300 bg-emerald-500/15 border-emerald-500/40';
  } else if (reliabilityPct >= 68) {
    reliabilityGrade = 'FIABLE';
    reliabilityLabel = 'Fiabilité Bonne (Corrigée)';
    badgeColorClass = 'text-sky-300 bg-sky-500/15 border-sky-500/40';
  } else if (reliabilityPct >= 52) {
    reliabilityGrade = 'MODÉRÉE';
    reliabilityLabel = 'Fiabilité Modérée (Dispersion / Vent)';
    badgeColorClass = 'text-amber-300 bg-amber-500/15 border-amber-500/40';
  } else if (reliabilityPct >= 42) {
    reliabilityGrade = 'INCERTAINE';
    reliabilityLabel = 'Fiabilité Délicate (Forte Variabilité)';
    badgeColorClass = 'text-orange-300 bg-orange-500/15 border-orange-500/40';
  } else {
    reliabilityGrade = 'CRITIQUE';
    reliabilityLabel = 'Fiabilité Critique (Transition / Éclatement)';
    badgeColorClass = 'text-rose-300 bg-rose-500/15 border-rose-500/40';
  }

  // Fourchette spatiale réaliste (Adret/Crête balayée vs Ubac/Combe protégée)
  const spatialSpreadFrac =
    windRedistributionRisk === 'ÉLEVÉ'
      ? 0.35
      : windRedistributionRisk === 'MODÉRÉ'
      ? 0.25
      : 0.18;

  const rangeNivoseMinCm =
    correctedNivoseCm > 0 ? Math.max(1, Math.round(correctedNivoseCm * (1 - spatialSpreadFrac))) : 0;
  const rangeNivoseMaxCm =
    correctedNivoseCm > 0 ? Math.round(correctedNivoseCm * (1 + spatialSpreadFrac * 1.15)) : 0;
  const rangeTopMinCm =
    correctedTopCm > 0 ? Math.max(1, Math.round(correctedTopCm * (1 - spatialSpreadFrac))) : 0;
  const rangeTopMaxCm =
    correctedTopCm > 0 ? Math.round(correctedTopCm * (1 + spatialSpreadFrac * 1.15)) : 0;

  const summaryExplanation =
    underestimationCorrectedCm > 5
      ? `Les modèles bruts indiquent en moyenne ${baselineRawTop} cm à cause du lissage d'altitude de leur grille. Après recalage physique sur 60 jours à l'altitude réelle (${p.altitudePeakM} m) et synthèse multi-modèles, l'enneigement fiabilisé atteint ${correctedTopCm} cm (fourchette ${rangeTopMinCm}–${rangeTopMaxCm} cm selon adret/ubac).`
      : `Consensus cohérent entre modèles bruts (${baselineRawTop} cm) et bilan physique d'altitude (${correctedTopCm} cm). Fourchette réaliste de ${rangeTopMinCm} à ${rangeTopMaxCm} cm sur les hauts versants selon exposition au soleil et au vent.`;

  return {
    reliabilityPct,
    reliabilityGrade,
    reliabilityLabel,
    badgeColorClass,
    rawNwpMeanCm: baselineRawTop,
    correctedNivoseCm,
    correctedTopCm,
    correctedBottomCm,
    underestimationCorrectedCm,
    underestimationPct,
    rangeNivoseMinCm,
    rangeNivoseMaxCm,
    rangeTopMinCm,
    rangeTopMaxCm,
    modelSpreadCm,
    lpnProximityRisk,
    windRedistributionRisk,
    demBiasLevel,
    summaryExplanation,
    uncertaintyDrivers,
    modelsBreakdown: [
      ...p.multiModelEntries,
      {
        modelId: 'phys-60d',
        modelName: 'Bilan Physique 60j (Altitude exacte)',
        rawSnowDepthCm: p.sim60dPeak?.depthCm ?? correctedTopCm,
        snowfall48hCm: null,
        note: `SWE ${p.sim60dPeak?.sweMm ?? 0} mm • Densité ${p.sim60dPeak?.bulkDensityKgM3 ?? 220} kg/m³`
      }
    ]
  };
}
