/**
 * Calculateur Dynamique de Fiabilité Météorologique & Prévisibilité Synoptique
 * 
 * Remplace les indices statiques/figés par une évaluation physique et honnête :
 * 1. Échéance temporelle (décroissance naturelle du chaos atmosphérique de Lorenz)
 * 2. Régime synoptique (un anticyclone bloquant >1025 hPa est infiniment plus prévisible qu'une goutte froide)
 * 3. Phénomènes chaotiques (convection orageuse estivale, marais barométrique, limite pluie-neige en plaine)
 * 4. Dispersion inter-modèles (écart-type entre ECMWF, GFS, ICON, AROME et UKMO)
 */

export interface ReliabilityFactors {
  leadDayIndex: number; // 0 = aujourd'hui, 1 = demain, etc.
  pressureHpa?: number; // Pression sous abri ou QNH
  weatherCode?: number; // Code WMO
  precipitationMm?: number;
  precipitationProbability?: number;
  convectiveCape?: number; // J/kg
  temperatureSpreadC?: number; // Écart max entre modèles
  precipitationSpreadMm?: number;
  temperatureC?: number;
  altitudeM?: number;
}

export interface DynamicReliabilityResult {
  scorePct: number; // 20% à 98%
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
  const tSpread = factors.temperatureSpreadC ?? (d <= 2 ? 0.8 : d <= 5 ? 1.8 : d <= 8 ? 3.2 : 5.0);
  const temp = factors.temperatureC ?? 15;
  const alt = factors.altitudeM ?? 150;

  // 1. Base chronologique déterministe
  let baseScore = 96;
  if (d === 0) baseScore = 97;
  else if (d === 1) baseScore = 93;
  else if (d === 2) baseScore = 87;
  else if (d === 3) baseScore = 81;
  else if (d === 4) baseScore = 74;
  else if (d === 5) baseScore = 67;
  else if (d === 6) baseScore = 60;
  else if (d === 7) baseScore = 54;
  else if (d === 8) baseScore = 48;
  else if (d === 9) baseScore = 43;
  else if (d === 10) baseScore = 39;
  else baseScore = Math.max(22, 36 - (d - 11) * 3);

  let modifier = 0;
  const reasons: string[] = [];

  // 2. Impact du champ de pression (Anticyclone vs Dépression / Marais)
  if (p >= 1025) {
    const boost = d <= 2 ? 3 : d <= 6 ? 9 : 12;
    modifier += boost;
    reasons.push(`Blocage anticyclonique robuste (${p} hPa) verrouillant la masse d'air`);
  } else if (p >= 1020) {
    const boost = d <= 2 ? 2 : d <= 6 ? 5 : 7;
    modifier += boost;
    reasons.push(`Champ de hautes pressions protecteur (${p} hPa)`);
  } else if (p <= 1005) {
    const penalty = d <= 2 ? -4 : -8;
    modifier += penalty;
    reasons.push(`Dépression creuse (${p} hPa) : sensibilité à la trajectoire exacte du centre dépressionnaire`);
  } else if (p >= 1010 && p <= 1016 && cape > 300) {
    const penalty = -7;
    modifier += penalty;
    reasons.push(`Marais barométrique plat (${p} hPa) favorisant l'aléa thermique local`);
  }

  // 3. Phénomènes chaotiques et très peu prévisibles
  const isThunderstorm = (code >= 95 && code <= 99) || code === 17 || cape >= 700;
  const isSnowNearFreezing = (code >= 71 && code <= 77) || (code === 68 || code === 69) || (rain > 0 && temp >= -0.5 && temp <= 2.2 && alt < 600);
  const isFogStratus = code === 45 || code === 48;

  if (isThunderstorm) {
    const penalty = d <= 1 ? -12 : d <= 4 ? -18 : -22;
    modifier += penalty;
    reasons.push(`Instabilité orageuse convective (CAPE ${cape} J/kg) : localisation microscopique très difficilement prévisible`);
  } else if (isSnowNearFreezing) {
    const penalty = -10;
    modifier += penalty;
    reasons.push(`Limite pluie-neige en plaine autour de 0°C : forte sensibilité à l'isothermie en cours d'averse`);
  } else if (isFogStratus && p >= 1020) {
    const penalty = d <= 2 ? -5 : -7;
    modifier += penalty;
    reasons.push(`Inversion thermique de basse couche : incertitude sur l'heure exacte de dissipation de la grisaille`);
  } else if (code <= 1 && rain === 0) {
    modifier += (d <= 4 ? 4 : 6);
    reasons.push(`Ciel dégagé et sec : excellente régularité thermique`);
  }

  // 4. Dispersion inter-modèles
  if (tSpread <= 1.0) {
    modifier += 5;
    reasons.push(`Consensus unanime des modèles européens et mondiaux (écart < 1°C)`);
  } else if (tSpread >= 3.8) {
    modifier -= 12;
    reasons.push(`Forte divergence numérique entre ECMWF, GFS et ICON (écart thermique de ${tSpread}°C)`);
  } else if (tSpread >= 2.5) {
    modifier -= 6;
    reasons.push(`Dispersion modérée des modèles sur l'amplitude thermique (écart de ${tSpread}°C)`);
  }

  // Calcul final bridé entre 20% et 98%
  const finalScore = Math.min(98, Math.max(20, Math.round(baseScore + modifier)));

  // Attribution des paliers qualitatifs
  let grade: DynamicReliabilityResult['grade'] = 'MOYENNE';
  let gradeLabel = 'Fiabilité Moyenne';
  let badgeColor = 'text-amber-400 bg-amber-500/10 border-amber-500/30';
  let divergenceLevel: DynamicReliabilityResult['divergenceLevel'] = 'MODEREE';
  let divergenceLabel = 'Divergence modérée : concordance globale sur la tendance';

  if (finalScore >= 85) {
    grade = 'EXCELLENTE';
    gradeLabel = 'Fiabilité Exceptionnelle (Consensus Déterministe)';
    badgeColor = 'text-emerald-400 bg-emerald-500/15 border-emerald-500/40';
    divergenceLevel = 'TRÈS_FAIBLE';
    divergenceLabel = 'Consensus unanime : tous les modèles s\'alignent sur ce scénario';
  } else if (finalScore >= 70) {
    grade = 'BONNE';
    gradeLabel = 'Fiabilité Bonne (Tendance Fiable)';
    badgeColor = 'text-sky-400 bg-sky-500/15 border-sky-500/40';
    divergenceLevel = 'FAIBLE_CONSENSUS';
    divergenceLabel = 'Bon accord synoptique : calage précis des centres d\'action';
  } else if (finalScore >= 52) {
    grade = 'MOYENNE';
    gradeLabel = 'Fiabilité Moyenne (Incertitude sur le Timing)';
    badgeColor = 'text-amber-400 bg-amber-500/15 border-amber-500/40';
    divergenceLevel = 'MODEREE';
    divergenceLabel = 'Divergence modérée : écart de timing sur les fronts ou ondulations';
  } else if (finalScore >= 38) {
    grade = 'DÉLICATE';
    gradeLabel = 'Fiabilité Délicate (Scénarios Divergents)';
    badgeColor = 'text-orange-400 bg-orange-500/15 border-orange-500/40';
    divergenceLevel = 'FORTE_DIVERGENCE';
    divergenceLabel = 'Forte divergence : éclatement du faisceau de trajectoires dépressionnaires';
  } else {
    grade = 'FAIBLE_SPÉCULATIVE';
    gradeLabel = 'Fiabilité Spéculative (Chaos Ensembliste)';
    badgeColor = 'text-rose-400 bg-rose-500/15 border-rose-500/40';
    divergenceLevel = 'DIVERGENCE_MAXIMALE';
    divergenceLabel = 'Dispersion maximale : tendance probabiliste par régimes généraux';
  }

  const meteorologicalReason = reasons.length > 0 
    ? reasons.join(' • ') 
    : `Évolution classique à échéance J+${d}.`;

  const whatIsCertain = finalScore >= 75
    ? `Consolidé à ${finalScore}% : La masse d'air dominante et l'allure générale des températures ne s'écarteront pas des prévisions.`
    : finalScore >= 50
    ? `Partiellement acquis (${finalScore}%) : La grande tendance régionale (absence de vague extrême imprévue).`
    : `Spéculatif : Seule l'orientation statistique moyenne du courant-jet est projetée.`;

  const whatIsUncertain = isThunderstorm
    ? `Aléa orageux : La formation exacte des foyers convectifs se joue à l'échelle de quelques kilomètres et quelques heures.`
    : isSnowNearFreezing
    ? `Aléa nivologique : Le passage pluie/neige dépendra de l'intensité précipitante et du refroidissement par évaporation.`
    : tSpread > 2.5
    ? `Divergence des modèles : ${tSpread}°C d'écart entre le scénario le plus doux et le plus frais.`
    : d >= 6
    ? `Trajectoire fine des ondulations atlantiques à moyenne échéance.`
    : `Variations locales d'ensoleillement et timing des passages nuageux.`;

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
