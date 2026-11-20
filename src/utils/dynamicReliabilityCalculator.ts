/**
 * Calculateur Dynamique de Fiabilité Météorologique & Dispersion Multi-Modèles
 *
 * Règles de calibration scientifique :
 * 1. La fiabilité varie réellement selon les conditions synoptiques, la convection,
 *    la limite pluie-neige, la dispersion inter-modèles / ensembliste (P90-P10)
 *    et l'instabilité entre les 3 derniers runs.
 * 2. Plancher absolu à 35 % : même dans les situations les plus chaotiques ou
 *    catastrophiques, l'indice ne descend jamais en dessous de 35 %.
 * 3. Plafond les 1ers jours à 98 % (rare, uniquement en consensus unanime très stable).
 * 4. Plafond strict à 80 % après 5 jours : par principe, dès J+5 et au-delà,
 *    la fiabilité ne peut jamais dépasser 80 %.
 */

export interface ReliabilityFactors {
  leadDayIndex: number; // 0 = aujourd'hui, 1 = demain, etc.
  pressureHpa?: number; // Pression sous abri ou QNH
  weatherCode?: number; // Code WMO
  precipitationMm?: number;
  precipitationProbability?: number;
  convectiveCape?: number; // J/kg
  temperatureSpreadC?: number; // Écart max-min entre modèles (ou P90-P10)
  ensembleSpreadP90P10C?: number; // Dispersion P90-P10 des scénarios d'ensemble
  runToRunSwingC?: number; // Oscillation max entre les 3 derniers runs
  precipitationSpreadMm?: number;
  temperatureC?: number;
  altitudeM?: number;
  modelsCount?: number;
}

export interface DynamicReliabilityResult {
  scorePct: number; // 35 % minimum à ~97 % maximum (plafonné à 80 % après 5 jours)
  grade: 'EXCELLENTE' | 'BONNE' | 'MOYENNE' | 'DÉLICATE' | 'FAIBLE_SPÉCULATIVE';
  gradeLabel: string;
  divergenceLevel: 'TRÈS_FAIBLE' | 'FAIBLE_CONSENSUS' | 'MODEREE' | 'FORTE_DIVERGENCE' | 'DIVERGENCE_MAXIMALE';
  divergenceLabel: string;
  badgeColor: string;
  meteorologicalReason: string;
  whatIsCertain: string;
  whatIsUncertain: string;
}

export function calculateDynamicReliability(factors: ReliabilityFactors): DynamicReliabilityResult {
  const d = Math.max(0, factors.leadDayIndex);
  const p = factors.pressureHpa ?? 1015;
  const code = factors.weatherCode ?? 0;
  const rain = factors.precipitationMm ?? 0;
  const cape = factors.convectiveCape ?? 0;
  const tSpread = factors.temperatureSpreadC ?? (d <= 1 ? 0.8 : d <= 3 ? 1.5 : d <= 6 ? 2.8 : d <= 9 ? 4.2 : 5.6);
  const ensSpread = factors.ensembleSpreadP90P10C ?? tSpread;
  const runSwing = factors.runToRunSwingC ?? 0;
  const temp = factors.temperatureC ?? 15;
  const alt = factors.altitudeM ?? 150;

  // 1. Courbe de base réaliste par échéance (J+0 ~93% -> J+1 ~91% -> J+5 ~73% -> J+14 ~52% -> J+30 ~45%)
  const baseCurve = [93, 91, 86, 82, 78, 73, 69, 65, 62, 59, 57, 55, 54, 53, 52, 51];
  const baseScore = d < baseCurve.length
    ? baseCurve[d]
    : Math.max(44, Math.round(50 - (d - 15) * 0.4));

  let modifier = 0;
  const reasons: string[] = [];

  // 2. Impact synoptique réel (anticyclone bloquant vs dépression creuse)
  if (p >= 1028) {
    const boost = d <= 5 ? 6 : d <= 10 ? 6 : 5;
    modifier += boost;
    reasons.push(`Dorsale / blocage anticyclonique solide (${p} hPa) stabilisant la masse d'air`);
  } else if (p >= 1021) {
    const boost = d <= 5 ? 3 : 3;
    modifier += boost;
    reasons.push(`Champ de pression élevé (${p} hPa) limitant les creusements imprévus`);
  } else if (p <= 995) {
    const penalty = d <= 2 ? 7 : 10;
    modifier -= penalty;
    reasons.push(`Dépression très creuse (${p} hPa) : trajectoire et creusement particulièrement instables`);
  } else if (p <= 1004) {
    const penalty = d <= 2 ? 4 : 6;
    modifier -= penalty;
    reasons.push(`Régime dépressionnaire actif (${p} hPa) augmentant l'erreur de chronologie frontale`);
  }

  // 3. Phénomènes convectifs, fortes pluies et transitions critiques pluie/neige
  const isThunderstorm = (code >= 95 && code <= 99) || code === 17 || cape >= 700;
  const isSnowNearFreezing =
    (code >= 71 && code <= 77) ||
    code === 68 ||
    code === 69 ||
    (rain > 0 && temp >= -1.0 && temp <= 2.6 && alt < 1200);
  const isHeavyRain = rain >= 15;
  const isRainy = rain >= 4;

  if (isThunderstorm) {
    const stormPenalty = cape >= 1400 ? 12 : 9;
    modifier -= stormPenalty;
    reasons.push(`Instabilité orageuse convective : déclenchement et intensité très sensibles aux basses couches`);
  } else if (isSnowNearFreezing) {
    modifier -= 7;
    reasons.push(`Limite pluie-neige proche du niveau station : bascule thermique incertaine au degré près`);
  } else if (isHeavyRain) {
    modifier -= 6;
    reasons.push(`Épisode pluvieux soutenu (${rain.toFixed(1)} mm) : cumuls locaux sensibles au blocage orographique`);
  } else if (isRainy && d >= 2) {
    modifier -= 3;
    reasons.push(`Passage frontal humide : calage horaire variable entre les centres de calcul`);
  }

  // 4. Dispersion réelle relative à l'échéance (évite d'écraser J+10 à 35% si la dispersion est normale pour J+10)
  const effectiveSpread = Math.max(tSpread, ensSpread);
  const expectedNormalSpread =
    d <= 1 ? 1.1 : d <= 3 ? 2.0 : d <= 6 ? 3.5 : d <= 10 ? 5.2 : 6.6;
  const excessSpread = Number((effectiveSpread - expectedNormalSpread).toFixed(1));

  if (excessSpread <= -1.2) {
    modifier += 6;
    reasons.push(`Accord exceptionnellement resserré pour l'échéance (${effectiveSpread.toFixed(1)}°C d'amplitude P90-P10)`);
  } else if (excessSpread <= -0.3) {
    modifier += 3;
    reasons.push(`Faisceau multi-modèles et ensembles plus groupé que la normale (${effectiveSpread.toFixed(1)}°C)`);
  } else if (excessSpread >= 3.0) {
    modifier -= 14;
    reasons.push(`Chaos ensembliste majeur (${effectiveSpread.toFixed(1)}°C d'amplitude P90-P10, très au-dessus de la normale)`);
  } else if (excessSpread >= 1.6) {
    modifier -= 9;
    reasons.push(`Forte dispersion inter-modèles pour cette échéance (${effectiveSpread.toFixed(1)}°C P90-P10)`);
  } else if (excessSpread >= 0.6) {
    modifier -= 4;
    reasons.push(`Divergence thermique modérée (${effectiveSpread.toFixed(1)}°C entre scénarios)`);
  }

  // 5. Stabilité d'un run à l'autre (moyenne des 3 derniers runs)
  if (runSwing >= 3.3) {
    modifier -= 8;
    reasons.push(`Forte instabilité inter-runs (${runSwing.toFixed(1)}°C de variation sur les 3 derniers runs)`);
  } else if (runSwing >= 1.8) {
    modifier -= 4;
    reasons.push(`Hésitation notable des modèles sur les 3 derniers runs (±${(runSwing / 2).toFixed(1)}°C)`);
  } else if (runSwing > 0 && runSwing <= 0.8) {
    modifier += 3;
    reasons.push(`Bonne continuité confirmée sur les 3 derniers runs`);
  }

  // Rare bonus d'unanimité totale les tous premiers jours (permet d'atteindre 98 % dans de rares cas limpides)
  if (d <= 1 && p >= 1025 && rain === 0 && !isThunderstorm && !isSnowNearFreezing && effectiveSpread <= 0.7 && runSwing <= 0.6) {
    modifier += 3;
    reasons.push(`Unanimité quasi totale des modèles en régime sec anticyclonique (cas rare jusqu'à 98%)`);
  }

  // 6. Règles strictes et bornes claires :
  //    - Plafond premiers jours (J+0, J+1) = 98 % (atteint uniquement dans les rares cas d'accord parfait)
  //    - Plafond strict <= 80 % après 5 jours (appliqué dès J+5 pour ne jamais dépasser 80 %)
  //    - Plancher absolu = 35 % même en cas de fiabilité catastrophique
  const horizonCaps = [98, 98, 94, 90, 85, 80, 79, 77, 74, 71, 68, 65, 62, 59, 57, 55];
  const horizonFloors = [65, 58, 50, 44, 38, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35];
  const cap = d < horizonCaps.length ? horizonCaps[d] : 54;
  const floor = d < horizonFloors.length ? horizonFloors[d] : 35;

  const finalScore = Math.min(cap, Math.max(floor, Math.round(baseScore + modifier)));

  // 7. Qualification nuancée et honnête des paliers (35% à 98%)
  let grade: DynamicReliabilityResult['grade'] = 'BONNE';
  let gradeLabel = 'Bonne Fiabilité (Consensus Multi-Modèles)';
  let badgeColor = 'text-sky-400 bg-sky-500/15 border-sky-500/40';
  let divergenceLevel: DynamicReliabilityResult['divergenceLevel'] = 'FAIBLE_CONSENSUS';
  let divergenceLabel = 'Accord synoptique globalement favorable';

  if (finalScore >= 82) {
    grade = 'EXCELLENTE';
    gradeLabel = 'Haute Fiabilité (Court Terme Déterministe)';
    badgeColor = 'text-emerald-400 bg-emerald-500/15 border-emerald-500/40';
    divergenceLevel = 'TRÈS_FAIBLE';
    divergenceLabel = 'Consensus étroit : faible dispersion entre modèles et runs';
  } else if (finalScore >= 68) {
    grade = 'BONNE';
    gradeLabel = 'Bonne Fiabilité (Tendance Consolidée)';
    badgeColor = 'text-sky-400 bg-sky-500/15 border-sky-500/40';
    divergenceLevel = 'FAIBLE_CONSENSUS';
    divergenceLabel = 'Accord majoritaire : marges d\'ajustement limitées';
  } else if (finalScore >= 53) {
    grade = 'MOYENNE';
    gradeLabel = 'Fiabilité Modérée (Selon Régime Synoptique)';
    badgeColor = 'text-amber-400 bg-amber-500/15 border-amber-500/40';
    divergenceLevel = 'MODEREE';
    divergenceLabel = 'Divergence modérée : timing frontal et amplitude thermique à préciser';
  } else if (finalScore >= 42) {
    grade = 'DÉLICATE';
    gradeLabel = 'Fiabilité Délicate (Forte Dispersion)';
    badgeColor = 'text-orange-400 bg-orange-500/15 border-orange-500/40';
    divergenceLevel = 'FORTE_DIVERGENCE';
    divergenceLabel = 'Forte divergence : large éclatement des scénarios ensemblistes';
  } else {
    grade = 'FAIBLE_SPÉCULATIVE';
    gradeLabel = 'Fiabilité Très Dégradée / Chaotique (Plancher Critique)';
    badgeColor = 'text-rose-400 bg-rose-500/15 border-rose-500/40';
    divergenceLevel = 'DIVERGENCE_MAXIMALE';
    divergenceLabel = 'Dispersion extrême ou instabilité critique : seule la médiane reste indicative';
  }

  const meteorologicalReason = reasons.length > 0
    ? reasons.join(' • ')
    : `Évolution de la prévisibilité atmosphérique selon les conditions à échéance J+${d}.`;

  let whatIsCertain = '';
  let whatIsUncertain = '';

  if (d <= 2) {
    whatIsCertain = `Trajectoire thermique bien cadrée (${finalScore}% de confiance) via la moyenne des 3 derniers runs multi-modèles.`;
    whatIsUncertain = isThunderstorm
      ? `Localisation précise des cellules orageuses et intensité ponctuelle des pluies.`
      : isSnowNearFreezing
      ? `Altitude exacte de la limite pluie-neige en cas de précipitations.`
      : `Ajustements fins de nébulosité matinale ou brises locales (±0.8°C).`;
  } else if (d <= 5) {
    whatIsCertain = `Signal synoptique de masse d'air encadré par la moyenne des 3 derniers runs (${finalScore}% de confiance, plafonné à 80% dès J+5).`;
    whatIsUncertain = `Chronologie exacte des perturbations et amplitude diurne définitive (écart de ${effectiveSpread.toFixed(1)}°C entre scénarios).`;
  } else if (d <= 9) {
    whatIsCertain = `Tendance thermique générale et enveloppe probabiliste P10-P90 (${finalScore}% de confiance, plafond 80% après 5 jours).`;
    whatIsUncertain = `Position exacte des dépressions/dorsales et températures quotidiennes précises (dispersion : ${effectiveSpread.toFixed(1)}°C).`;
  } else {
    whatIsCertain = `Tendance statistique médiane sur 200+ scénarios lissée sur 3 runs (${finalScore}% de confiance).`;
    whatIsUncertain = `Timing précis des perturbations et valeurs journalières exactes (écart P90-P10 de ${effectiveSpread.toFixed(1)}°C).`;
  }

  return {
    scorePct: finalScore,
    grade,
    gradeLabel,
    divergenceLevel,
    divergenceLabel,
    badgeColor,
    meteorologicalReason,
    whatIsCertain,
    whatIsUncertain
  };
}
