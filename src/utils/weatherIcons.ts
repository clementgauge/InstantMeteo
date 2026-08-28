import { HourlyForecast } from '../types/weather';

export interface WeatherCodeInfo {
  code: number;
  label: string;
  detailedLabel?: string;
  shortLabel: string;
  emoji: string;
  nightEmoji: string;
  iconName: string; // Lucide icon name
  skyCondition: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  description: string;
}

export const WEATHER_CODES_MAP: Record<number, WeatherCodeInfo> = {
  0: {
    code: 0,
    label: "Ciel parfaitement dégagé et ensoleillé",
    shortLabel: "Ciel Dégagé",
    emoji: "☀️",
    nightEmoji: "🌙",
    iconName: "Sun",
    skyCondition: "Plein Soleil",
    badgeBg: "bg-amber-500/10",
    badgeText: "text-amber-300",
    badgeBorder: "border-amber-500/30",
    description: "Ensoleillement maximal sans aucun obstacle nuageux."
  },
  1: {
    code: 1,
    label: "Ciel principalement clair avec quelques cirrus / voiles",
    shortLabel: "Peu Nuageux / Voilé",
    emoji: "🌤️",
    nightEmoji: "🌌",
    iconName: "SunDim",
    skyCondition: "Ensoleillé Voilé",
    badgeBg: "bg-amber-500/10",
    badgeText: "text-amber-200",
    badgeBorder: "border-amber-500/20",
    description: "Très beau temps lumineux, voiles d'altitude discrets."
  },
  2: {
    code: 2,
    label: "Ciel éclairci avec passages nuageux et belles éclaircies",
    shortLabel: "Éclaircies & Passages Nuageux",
    emoji: "⛅",
    nightEmoji: "🌥️",
    iconName: "CloudSun",
    skyCondition: "Belles Éclaircies",
    badgeBg: "bg-sky-500/10",
    badgeText: "text-sky-300",
    badgeBorder: "border-sky-500/30",
    description: "Alternance agréable de soleil et de cumulus inoffensifs."
  },
  3: {
    code: 3,
    label: "Ciel très nuageux, plafond bas ou couvert dense",
    shortLabel: "Ciel Couvert",
    emoji: "☁️",
    nightEmoji: "☁️",
    iconName: "Cloud",
    skyCondition: "Ciel Bouché",
    badgeBg: "bg-slate-500/10",
    badgeText: "text-slate-300",
    badgeBorder: "border-slate-500/30",
    description: "Couverture nuageuse compacte, luminosité atténuée."
  },
  45: {
    code: 45,
    label: "Brouillard épais ou brume dense (visibilité < 1 km)",
    shortLabel: "Brouillard Épais",
    emoji: "🌫️",
    nightEmoji: "🌫️",
    iconName: "CloudFog",
    skyCondition: "Brouillard",
    badgeBg: "bg-slate-600/20",
    badgeText: "text-slate-200",
    badgeBorder: "border-slate-500/40",
    description: "Nappe de brouillard au sol avec visibilité fortement réduite."
  },
  48: {
    code: 48,
    label: "Brouillard givrant avec dépôts de gelée blanche au sol",
    shortLabel: "Brouillard Givrant",
    emoji: "❄️🌫️",
    nightEmoji: "❄️🌫️",
    iconName: "CloudFog",
    skyCondition: "Brouillard Givrant",
    badgeBg: "bg-indigo-600/20",
    badgeText: "text-indigo-200",
    badgeBorder: "border-indigo-500/40",
    description: "Brouillard par température négative créant des dépôts de givre."
  },
  51: {
    code: 51,
    label: "Bruine faible intermittente ou crachin léger",
    shortLabel: "Bruine Légère",
    emoji: "🌦️",
    nightEmoji: "🌧️",
    iconName: "CloudDrizzle",
    skyCondition: "Crachin Léger",
    badgeBg: "bg-cyan-500/10",
    badgeText: "text-cyan-300",
    badgeBorder: "border-cyan-500/30",
    description: "Micro-gouttelettes en suspension avec léger mouillage du sol."
  },
  53: {
    code: 53,
    label: "Bruine modérée continue",
    shortLabel: "Bruine Continue",
    emoji: "🌧️",
    nightEmoji: "🌧️",
    iconName: "CloudDrizzle",
    skyCondition: "Bruine Régulière",
    badgeBg: "bg-cyan-600/15",
    badgeText: "text-cyan-200",
    badgeBorder: "border-cyan-500/40",
    description: "Bruine persistante détrempant rapidement les surfaces extérieures."
  },
  55: {
    code: 55,
    label: "Bruine forte et dense",
    shortLabel: "Bruine Forte",
    emoji: "🌧️💦",
    nightEmoji: "🌧️💦",
    iconName: "CloudRain",
    skyCondition: "Bruine Dense",
    badgeBg: "bg-cyan-700/20",
    badgeText: "text-cyan-100",
    badgeBorder: "border-cyan-400/50",
    description: "Bruine très serrée réduisant la visibilité horizontale."
  },
  56: {
    code: 56,
    label: "Bruine verglaçante légère formant une pellicule de verglas",
    shortLabel: "Bruine Verglaçante",
    emoji: "🧊💧",
    nightEmoji: "🧊💧",
    iconName: "CloudSnow",
    skyCondition: "Verglas Léger",
    badgeBg: "bg-purple-600/20",
    badgeText: "text-purple-200",
    badgeBorder: "border-purple-500/40",
    description: "Gouttelettes surfusionnées gelant immédiatement au contact du sol."
  },
  57: {
    code: 57,
    label: "Bruine verglaçante dense et généralisée",
    shortLabel: "Forte Bruine Verglaçante",
    emoji: "🧊💦",
    nightEmoji: "🧊💦",
    iconName: "CloudSnow",
    skyCondition: "Verglas Généralisé",
    badgeBg: "bg-purple-700/30",
    badgeText: "text-purple-100",
    badgeBorder: "border-purple-400/60",
    description: "Conditions glissantes sévères sur chaussées et trottoirs."
  },
  61: {
    code: 61,
    label: "Pluie faible continue et régulière",
    shortLabel: "Pluie Faible",
    emoji: "🌧️",
    nightEmoji: "🌧️",
    iconName: "CloudRain",
    skyCondition: "Petite Pluie",
    badgeBg: "bg-blue-500/10",
    badgeText: "text-blue-300",
    badgeBorder: "border-blue-500/30",
    description: "Pluie continue de faible intensité (0.5 à 1.5 mm/h)."
  },
  63: {
    code: 63,
    label: "Pluie modérée soutenue",
    shortLabel: "Pluie Modérée",
    emoji: "🌧️🌧️",
    nightEmoji: "🌧️🌧️",
    iconName: "CloudRain",
    skyCondition: "Pluie Soutenue",
    badgeBg: "bg-blue-600/20",
    badgeText: "text-blue-200",
    badgeBorder: "border-blue-500/40",
    description: "Pluie active et régulière générant des flaques nettes (1.5 à 4 mm/h)."
  },
  65: {
    code: 65,
    label: "Forte pluie continue et battante",
    shortLabel: "Forte Pluie Battante",
    emoji: "🌧️🌊",
    nightEmoji: "🌧️🌊",
    iconName: "CloudRainWind",
    skyCondition: "Pluie Battante",
    badgeBg: "bg-blue-700/30",
    badgeText: "text-blue-100",
    badgeBorder: "border-blue-400/50",
    description: "Précipitations abondantes avec ruissellement marqué (> 4 mm/h)."
  },
  66: {
    code: 66,
    label: "Pluie verglaçante modérée (risque de verglas)",
    shortLabel: "Pluie Verglaçante",
    emoji: "🧊🌧️",
    nightEmoji: "🧊🌧️",
    iconName: "CloudSnow",
    skyCondition: "Pluie Verglaçante",
    badgeBg: "bg-purple-800/30",
    badgeText: "text-purple-200",
    badgeBorder: "border-purple-400/50",
    description: "Pluie tombant sur un sol gelé causant un verglas immédiat."
  },
  67: {
    code: 67,
    label: "Forte pluie verglaçante dangereuse",
    shortLabel: "Forte Pluie Verglaçante",
    emoji: "⚠️🧊",
    nightEmoji: "⚠️🧊",
    iconName: "CloudSnow",
    skyCondition: "Verglas Majeur",
    badgeBg: "bg-rose-900/40",
    badgeText: "text-rose-200",
    badgeBorder: "border-rose-500/50",
    description: "Épisode de verglas majeur avec lourdes charges sur arbres et câbles."
  },
  71: {
    code: 71,
    label: "Chute de neige faible intermittente ou continue",
    shortLabel: "Neige Faible",
    emoji: "🌨️",
    nightEmoji: "🌨️",
    iconName: "CloudSnow",
    skyCondition: "Petite Neige",
    badgeBg: "bg-indigo-500/10",
    badgeText: "text-indigo-200",
    badgeBorder: "border-indigo-500/30",
    description: "Flocons épars ou chute continue légère (< 1 cm/h)."
  },
  73: {
    code: 73,
    label: "Chute de neige modérée tenant rapidement au sol",
    shortLabel: "Neige Modérée",
    emoji: "🌨️❄️",
    nightEmoji: "🌨️❄️",
    iconName: "CloudSnow",
    skyCondition: "Neige Tenace",
    badgeBg: "bg-indigo-600/20",
    badgeText: "text-indigo-100",
    badgeBorder: "border-indigo-400/40",
    description: "Accumulation de neige régulière sur la végétation et les routes."
  },
  75: {
    code: 75,
    label: "Forte chute de neige abondante et continue",
    shortLabel: "Neige Forte & Abondante",
    emoji: "❄️❄️❄️",
    nightEmoji: "❄️❄️❄️",
    iconName: "CloudSnow",
    skyCondition: "Neige Abondante",
    badgeBg: "bg-indigo-700/30",
    badgeText: "text-white",
    badgeBorder: "border-indigo-300/50",
    description: "Blizzard ou fortes accumulations rapides (> 3 cm/h)."
  },
  77: {
    code: 77,
    label: "Grains de neige fins ou neige en grains",
    shortLabel: "Grains de Neige",
    emoji: "🌨️",
    nightEmoji: "🌨️",
    iconName: "CloudSnow",
    skyCondition: "Neige en Grains",
    badgeBg: "bg-indigo-500/15",
    badgeText: "text-indigo-200",
    badgeBorder: "border-indigo-500/30",
    description: "Petits granules de glace opaques tombant des stratus."
  },
  80: {
    code: 80,
    label: "Averses de pluie faibles et passagères",
    shortLabel: "Averses Faibles",
    emoji: "🌦️",
    nightEmoji: "🌧️",
    iconName: "CloudRain",
    skyCondition: "Giboulées Légères",
    badgeBg: "bg-sky-500/15",
    badgeText: "text-sky-300",
    badgeBorder: "border-sky-500/30",
    description: "Ondées de courte durée alternant avec des éclaircies."
  },
  81: {
    code: 81,
    label: "Averses de pluie modérées",
    shortLabel: "Averses Modérées",
    emoji: "🌧️🌦️",
    nightEmoji: "🌧️",
    iconName: "CloudRain",
    skyCondition: "Ondées Actives",
    badgeBg: "bg-blue-600/20",
    badgeText: "text-blue-300",
    badgeBorder: "border-blue-500/40",
    description: "Passages d'averses intenses mais de durée limitée."
  },
  82: {
    code: 82,
    label: "Averses de pluie violentes et torrentielles",
    shortLabel: "Averses Violentes",
    emoji: "⛈️🌧️",
    nightEmoji: "⛈️🌧️",
    iconName: "CloudRainWind",
    skyCondition: "Déluge Passager",
    badgeBg: "bg-blue-800/30",
    badgeText: "text-cyan-200",
    badgeBorder: "border-cyan-400/50",
    description: "Averses brutales à fort débit d'eau (> 15 mm/h instantané)."
  },
  85: {
    code: 85,
    label: "Averses de neige légères intermittentes",
    shortLabel: "Averses de Neige",
    emoji: "🌨️❄️",
    nightEmoji: "🌨️❄️",
    iconName: "CloudSnow",
    skyCondition: "Giboulées Neigeuses",
    badgeBg: "bg-indigo-500/20",
    badgeText: "text-indigo-200",
    badgeBorder: "border-indigo-400/30",
    description: "Giboulées de neige avec blanchiment temporaire."
  },
  86: {
    code: 86,
    label: "Averses de neige fortes avec bourrasques de vent",
    shortLabel: "Fortes Averses de Neige",
    emoji: "🌨️💨",
    nightEmoji: "🌨️💨",
    iconName: "CloudSnow",
    skyCondition: "Bourrasques de Neige",
    badgeBg: "bg-indigo-700/30",
    badgeText: "text-white",
    badgeBorder: "border-indigo-400/50",
    description: "Bourrasques soudaines avec visibilité quasi nulle."
  },
  95: {
    code: 95,
    label: "Orage modéré avec foudre, tonnerre et averses",
    shortLabel: "Orage Modéré",
    emoji: "⛈️⚡",
    nightEmoji: "⛈️⚡",
    iconName: "CloudLightning",
    skyCondition: "Activité Orageuse",
    badgeBg: "bg-amber-600/20",
    badgeText: "text-amber-300",
    badgeBorder: "border-amber-500/40",
    description: "Cellule orageuse active avec éclairs et coups de tonnerre."
  },
  96: {
    code: 96,
    label: "Orage fort avec petites chutes de grêle",
    shortLabel: "Orage avec Grêle",
    emoji: "⛈️🧊",
    nightEmoji: "⛈️🧊",
    iconName: "CloudLightning",
    skyCondition: "Orage de Grêle",
    badgeBg: "bg-orange-600/25",
    badgeText: "text-orange-200",
    badgeBorder: "border-orange-500/50",
    description: "Orage vigoureux accompagné de grêlons (diamètre 0.5 à 2 cm)."
  },
  99: {
    code: 99,
    label: "Orage violent destructeur avec grosses grêles et fortes rafales",
    shortLabel: "Orage Violent Destructeur",
    emoji: "⛈️⚡💥",
    nightEmoji: "⛈️⚡💥",
    iconName: "CloudLightning",
    skyCondition: "Orage Supercellulaire",
    badgeBg: "bg-rose-700/30",
    badgeText: "text-rose-200",
    badgeBorder: "border-rose-500/60",
    description: "Phénomène orageux extrême avec risque de rafales destructrices et gros grêlons."
  }
};

/**
 * Return rich weather information for any WMO code, taking day/night into account
 */
export function getRichWeatherInfo(
  code: number, 
  isDay: boolean = true,
  rainMm: number = 0,
  windGust: number = 0
): WeatherCodeInfo {
  const base = WEATHER_CODES_MAP[code] || {
    code,
    label: "Temps variable de saison",
    shortLabel: "Variable",
    emoji: isDay ? "⛅" : "🌥️",
    nightEmoji: "🌥️",
    iconName: "CloudSun",
    skyCondition: "Variable",
    badgeBg: "bg-slate-800/80",
    badgeText: "text-slate-300",
    badgeBorder: "border-slate-700",
    description: "Conditions atmosphériques habituelles de saison."
  };

  const activeEmoji = isDay ? base.emoji : base.nightEmoji;
  return {
    ...base,
    detailedLabel: base.label,
    emoji: activeEmoji
  };
}

/**
 * Rain Probability and Expected Quantity Educational Clarifier
 * Explains clearly what a given probability (%) and a given volume (mm) mean together.
 */
export interface RainRiskExplanation {
  probabilityPercent: number;
  expectedVolumeMm: number;
  probabilityLevel: 'TEMPS_SEC' | 'RISQUE_FAIBLE' | 'RISQUE_MODERE' | 'PLUIE_PROBABLE' | 'PLUIE_CERTAINE';
  probabilityLabel: string;
  quantityLabel: string;
  combinedExplanation: string;
  shortSummaryBadge: string;
  riskShortBadge: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  gaugeVisual: string;
  waterVolumeLitresM2: number;
  dailyAdvice: string;
}

export function getRainRiskExplanation(
  probabilityPercent: number,
  expectedVolumeMm: number,
  durationHours: number = 0
): RainRiskExplanation {
  const prob = Math.max(0, Math.min(100, Math.round(probabilityPercent)));
  const mm = Math.max(0, Number(expectedVolumeMm.toFixed(1)));

  let probabilityLevel: RainRiskExplanation['probabilityLevel'] = 'TEMPS_SEC';
  let probabilityLabel = "Temps Sec Quasi-Garanti";
  let badgeBg = "bg-emerald-950/40";
  let badgeText = "text-emerald-300";
  let badgeBorder = "border-emerald-500/30";
  let gaugeVisual = "◯◯◯◯◯";

  if (prob <= 10 && mm < 0.1) {
    probabilityLevel = 'TEMPS_SEC';
    probabilityLabel = "Temps Sec Garanti (≤10%)";
    badgeBg = "bg-emerald-950/40";
    badgeText = "text-emerald-300";
    badgeBorder = "border-emerald-500/30";
    gaugeVisual = "◯◯◯◯◯ (0%)";
  } else if (prob <= 30) {
    probabilityLevel = 'RISQUE_FAIBLE';
    probabilityLabel = `Risque Faible (${prob}%)`;
    badgeBg = "bg-sky-950/40";
    badgeText = "text-sky-300";
    badgeBorder = "border-sky-500/30";
    gaugeVisual = "⬤◯◯◯◯ (20-30%)";
  } else if (prob <= 60) {
    probabilityLevel = 'RISQUE_MODERE';
    probabilityLabel = `Risque Modéré / Averses (${prob}%)`;
    badgeBg = "bg-blue-950/50";
    badgeText = "text-blue-300";
    badgeBorder = "border-blue-500/40";
    gaugeVisual = "⬤⬤⬤◯◯ (40-60%)";
  } else if (prob <= 80) {
    probabilityLevel = 'PLUIE_PROBABLE';
    probabilityLabel = `Pluie Très Probable (${prob}%)`;
    badgeBg = "bg-cyan-950/60";
    badgeText = "text-cyan-200";
    badgeBorder = "border-cyan-400/50";
    gaugeVisual = "⬤⬤⬤⬤◯ (70-80%)";
  } else {
    probabilityLevel = 'PLUIE_CERTAINE';
    probabilityLabel = `Pluie Confirmée / Certaine (${prob}%)`;
    badgeBg = "bg-indigo-950/70";
    badgeText = "text-indigo-200";
    badgeBorder = "border-indigo-400/60";
    gaugeVisual = "⬤⬤⬤⬤⬤ (90-100%)";
  }

  // Quantity classification
  let quantityLabel = "0 mm (Aucun cumul)";
  if (mm > 0 && mm < 0.5) quantityLabel = `${mm} mm (Trace / Bruine fine <0.5 L/m²)`;
  else if (mm >= 0.5 && mm < 2) quantityLabel = `${mm} mm (Pluie faible 0.5-2 L/m²)`;
  else if (mm >= 2 && mm < 8) quantityLabel = `${mm} mm (Pluie modérée 2-8 L/m²)`;
  else if (mm >= 8 && mm < 20) quantityLabel = `${mm} mm (Forte pluie 8-20 L/m²)`;
  else if (mm >= 20) quantityLabel = `${mm} mm (Pluie torrentielle >20 L/m²)`;

  // Detailed combined explanation to dispel user confusion between % and mm
  let combinedExplanation = "";
  let shortSummaryBadge = "";
  let dailyAdvice = "";

  if (mm <= 0.05 && prob <= 15) {
    combinedExplanation = `Probabilité de pluie négligeable (${prob}%). Aucun passage pluvieux n'est prévu (0.0 L/m²).`;
    shortSummaryBadge = `0% • Temps sec`;
    dailyAdvice = "Conditions parfaites pour toutes activités extérieures sans parapluie.";
  } else if (prob >= 70 && mm < 0.8) {
    combinedExplanation = `Forte probabilité (${prob}%) d'un passage humide mais sous forme de bruine ou crachin très léger (cumul minime de ${mm} mm = ${mm} L/m²).`;
    shortSummaryBadge = `${prob}% • Bruine minime (${mm} mm)`;
    dailyAdvice = "Le sol sera humide mais sans ruissellement. Vêtement déperlant conseillé.";
  } else if (prob >= 70 && mm >= 0.8) {
    combinedExplanation = `Pluie quasi-certaine (${prob}%) avec un cumul franc estimé à ${mm} mm (${mm} Litres par m²${durationHours > 0 ? ` sur ${durationHours}h` : ''}).`;
    shortSummaryBadge = `${prob}% • Pluie confirmée (${mm} mm)`;
    dailyAdvice = "Parapluie ou imperméable indispensable. Chaussées détrempées.";
  } else if (prob <= 40 && mm >= 3.0) {
    combinedExplanation = `Risque d'averse localisé (${prob}% de probabilité sur la zone), mais si une cellule pluvieuse traverse votre commune, elle apportera une averse soutenue de ${mm} mm.`;
    shortSummaryBadge = `${prob}% risque • Averse isolée (${mm} mm)`;
    dailyAdvice = "Averses éparses : gardez un parapluie à portée au cas où votre quartier serait touché.";
  } else if (prob <= 40 && mm < 3.0) {
    combinedExplanation = `Faible risque (${prob}%) d'ondée ou de quelques gouttes isolées (${mm} mm max).`;
    shortSummaryBadge = `${prob}% risque • Gouttes (${mm} mm)`;
    dailyAdvice = "Risque d'eau très limité. Activités extérieures possibles.";
  } else {
    combinedExplanation = `Risque de pluie modéré (${prob}%) avec un cumul attendu de ${mm} mm (${mm} L/m²).`;
    shortSummaryBadge = `${prob}% • ${mm} mm`;
    dailyAdvice = "Instabilité présente : prévoir un vêtement de pluie d'appoint.";
  }

  return {
    probabilityPercent: prob,
    expectedVolumeMm: mm,
    probabilityLevel,
    probabilityLabel,
    quantityLabel,
    combinedExplanation,
    shortSummaryBadge,
    riskShortBadge: shortSummaryBadge,
    badgeBg,
    badgeText,
    badgeBorder,
    gaugeVisual,
    waterVolumeLitresM2: mm,
    dailyAdvice
  };
}

/**
 * Detailed Cloud Cover Strata & Sky Condition Diagnostic (WMO / Météo-France standards)
 */
export interface CloudCoverDetail {
  totalPercent: number;
  label: string;
  shortLabel: string;
  octas: number;
  octasLabel: string; // e.g. "2/8 octas"
  emoji: string;
  layers: {
    lowPercent: number;
    midPercent: number;
    highPercent: number;
    strataSummary: string;
    dominantStrata: 'BAS' | 'MOYEN' | 'HAUT' | 'MIXTE' | 'AUCUN';
  };
  lightingQuality: string;
  colorClass: string;
}

/**
 * Calculates exact octas (0/8 to 8/8) based on international WMO synoptic standard
 */
export function getOctasFromPercent(pct: number): number {
  const p = Math.max(0, Math.min(100, Math.round(pct)));
  if (p <= 6) return 0;
  if (p <= 18) return 1;
  if (p <= 31) return 2;
  if (p <= 43) return 3;
  if (p <= 56) return 4;
  if (p <= 68) return 5;
  if (p <= 81) return 6;
  if (p <= 94) return 7;
  return 8;
}

export function getDetailedCloudCover(
  totalPercent: number,
  low: number = 0,
  mid: number = 0,
  high: number = 0,
  isDay: boolean = true
): CloudCoverDetail {
  const total = Math.max(0, Math.min(100, Math.round(totalPercent)));
  const l = Math.max(0, Math.min(100, Math.round(low)));
  const m = Math.max(0, Math.min(100, Math.round(mid)));
  const h = Math.max(0, Math.min(100, Math.round(high)));
  
  const octas = getOctasFromPercent(total);
  const octasLabel = `${octas}/8 octas`;

  let label = "Ciel Dégagé & Limpide";
  let shortLabel = "Dégagé";
  let emoji = isDay ? "☀️" : "🌙";
  let lightingQuality = "Ensoleillement franc sans obstacle";
  let colorClass = "text-amber-300";
  let dominantStrata: CloudCoverDetail['layers']['dominantStrata'] = 'AUCUN';

  // Determine dominant strata if any
  if (total <= 6) {
    dominantStrata = 'AUCUN';
  } else if (l >= m && l >= h && l >= 20) {
    dominantStrata = 'BAS';
  } else if (m >= l && m >= h && m >= 20) {
    dominantStrata = 'MOYEN';
  } else if (h >= l && h >= m && h >= 20) {
    dominantStrata = 'HAUT';
  } else {
    dominantStrata = 'MIXTE';
  }

  // WMO Synoptic classification
  if (octas === 0) {
    label = isDay ? "Ciel Serein & Parfaitement Dégagé (0-6%)" : "Nuit Claire & Étoilée (0-6%)";
    shortLabel = isDay ? "Plein Soleil" : "Nuit Claire";
    emoji = isDay ? "☀️" : "🌙";
    lightingQuality = isDay ? "Luminosité maximale, azur pur sans nébulosité" : "Visibilité astronomique parfaite";
    colorClass = "text-amber-400";
  } else if (octas <= 2) {
    // 1-2 octas: Peu nuageux
    if (dominantStrata === 'HAUT' && h >= 25) {
      label = "Peu Nuageux • Cirrus fins d'altitude (7-30%)";
      shortLabel = "Cirrus Fins";
      emoji = isDay ? "🌤️" : "🌌";
      lightingQuality = "Ensoleillement continu avec quelques mèches de cirrus";
    } else {
      label = "Peu Nuageux • Belles Éclaircies (7-30%)";
      shortLabel = "Belles Éclaircies";
      emoji = isDay ? "🌤️" : "🌌";
      lightingQuality = "Très large ensoleillement entrecoupé de discrets cumulus";
    }
    colorClass = "text-amber-200";
  } else if (octas <= 4) {
    // 3-4 octas: Éclaircies / Partiellement nuageux
    if (dominantStrata === 'HAUT' && h >= 50 && l <= 15) {
      label = "Voile de Cirrus • Soleil Tamisé (30-55%)";
      shortLabel = "Voile Tamisé";
      emoji = isDay ? "🌤️" : "🌥️";
      lightingQuality = "Lumière solaire filtrée par un voile de haute altitude";
    } else {
      label = "Partiellement Nuageux • Éclaircies Larges (30-55%)";
      shortLabel = "Éclaircies";
      emoji = isDay ? "⛅" : "🌥️";
      lightingQuality = "Alternance équilibrée de passages nuageux et de soleil";
    }
    colorClass = "text-sky-300";
  } else if (octas <= 6) {
    // 5-6 octas: Très nuageux
    if (dominantStrata === 'HAUT' && h >= 70 && l <= 20) {
      label = "Ciel Fortement Voilé (Cirrostratus) (55-80%)";
      shortLabel = "Fortement Voilé";
      emoji = isDay ? "⛅" : "🌥️";
      lightingQuality = "Halo solaire diffus, ciel laiteux sans pluie";
    } else if (dominantStrata === 'BAS' && l >= 60) {
      label = "Très Nuageux • Stratocumulus denses (55-80%)";
      shortLabel = "Très Nuageux (Bas)";
      emoji = "☁️";
      lightingQuality = "Ombres absentes, ciel gris et compact";
    } else {
      label = "Très Nuageux • Rares Éclaircies (55-80%)";
      shortLabel = "Très Nuageux";
      emoji = "☁️";
      lightingQuality = "Lumière diffuse, ciel dominé par les nuages";
    }
    colorClass = "text-slate-300";
  } else if (octas === 7) {
    // 7 octas: Presque couvert
    label = "Ciel Presque Couvert • Rares Trouées (80-95%)";
    shortLabel = "Presque Couvert";
    emoji = "☁️";
    lightingQuality = "Plafond gris sombre, luminosité très atténuée";
    colorClass = "text-slate-400";
  } else {
    // 8 octas: Ciel couvert
    label = "Ciel Totalement Couvert & Bouché (95-100%)";
    shortLabel = "Ciel Couvert";
    emoji = "☁️";
    lightingQuality = "Plafond bas et uniforme, absence totale d'ensoleillement direct";
    colorClass = "text-slate-400";
  }

  const strataSummary = `Bas: ${l}% • Moyens: ${m}% • Hauts (voile): ${h}%`;

  return {
    totalPercent: total,
    label,
    shortLabel,
    octas,
    octasLabel,
    emoji,
    layers: {
      lowPercent: l,
      midPercent: m,
      highPercent: h,
      strataSummary,
      dominantStrata
    },
    lightingQuality,
    colorClass
  };
}

/**
 * Hourly Micro-Trend Computation (Evolution from Hour H-1 to H, and H to H+1)
 */
export interface HourlyTrendDiagnostic {
  temperatureDelta: number; // e.g. +0.8 or -0.5
  pressureDeltaHpa: number; // e.g. +0.4 or -1.1
  cloudDeltaPercent: number; // e.g. -20 or +30
  trendTag: string; // e.g. "↗ +1.2°C • Éclaircies"
  trendFullText: string;
  trendEmoji: string;
  trendColorClass: string;
}

export function computeHourlyTrend(
  current: HourlyForecast,
  prev?: HourlyForecast,
  next?: HourlyForecast
): HourlyTrendDiagnostic {
  const prevTemp = prev ? prev.temperature : current.temperature;
  const tempDelta = Number((current.temperature - prevTemp).toFixed(1));

  const prevPress = prev?.pressureHpa ?? current.pressureHpa ?? 1015;
  const currPress = current.pressureHpa ?? 1015;
  const pressureDeltaHpa = Number((currPress - prevPress).toFixed(1));

  const prevCloud = prev?.cloudCover ?? current.cloudCover ?? 40;
  const currCloud = current.cloudCover ?? 40;
  const cloudDelta = Math.round(currCloud - prevCloud);

  const isRainingNow = (current.precipitationMm || current.rainMm || 0) > 0.1;
  const wasRaining = prev ? ((prev.precipitationMm || prev.rainMm || 0) > 0.1) : false;

  let trendTag = "→ Temp. Stable";
  let trendFullText = "Conditions météorologiques stables";
  let trendEmoji = "➡️";
  let trendColorClass = "text-slate-300";

  if (isRainingNow && !wasRaining) {
    trendTag = "🌧️ Début Pluie";
    trendFullText = `Arrivée d'un passage pluvieux (${current.rainMm} mm) avec baisse thermique (${tempDelta}°C)`;
    trendEmoji = "🌧️";
    trendColorClass = "text-cyan-300";
  } else if (!isRainingNow && wasRaining) {
    trendTag = "🌤️ Retour au Sec";
    trendFullText = "Fin des précipitations et retour d'éclaircies";
    trendEmoji = "🌤️";
    trendColorClass = "text-emerald-300";
  } else if (tempDelta >= 0.8) {
    trendTag = `↗ +${tempDelta}°C • Hausse`;
    trendFullText = `Réchauffement en cours (+${tempDelta}°C/h)${cloudDelta < -15 ? ' favorisé par les éclaircies' : ''}`;
    trendEmoji = "↗️";
    trendColorClass = "text-amber-300";
  } else if (tempDelta <= -0.8) {
    trendTag = `↘ ${tempDelta}°C • Baisse`;
    trendFullText = `Refroidissement thermique (${tempDelta}°C/h)${cloudDelta > 20 ? " dû à l'ennuagement" : ''}`;
    trendEmoji = "↘️";
    trendColorClass = "text-blue-300";
  } else if (cloudDelta <= -25) {
    trendTag = "☀️ Éclaircies en hausse";
    trendFullText = "Dissipation des nuages et amélioration lumineuse";
    trendEmoji = "☀️";
    trendColorClass = "text-amber-200";
  } else if (cloudDelta >= 25) {
    trendTag = "☁️ Ennuagement";
    trendFullText = "Ciel se couvrant progressivement";
    trendEmoji = "☁️";
    trendColorClass = "text-slate-400";
  } else if (pressureDeltaHpa >= 0.8) {
    trendTag = `↗ Pression (+${pressureDeltaHpa} hPa)`;
    trendFullText = "Hausse barométrique stabilisant la masse d'air";
    trendEmoji = "↗️";
    trendColorClass = "text-teal-300";
  } else if (pressureDeltaHpa <= -0.8) {
    trendTag = `↘ Pression (${pressureDeltaHpa} hPa)`;
    trendFullText = "Baisse barométrique à l'approche d'une perturbation";
    trendEmoji = "↘️";
    trendColorClass = "text-orange-300";
  }

  return {
    temperatureDelta: tempDelta,
    pressureDeltaHpa,
    cloudDeltaPercent: cloudDelta,
    trendTag,
    trendFullText,
    trendEmoji,
    trendColorClass
  };
}
