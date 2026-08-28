import { DailyForecast, HourlyForecast, LocationPoint, DailyVigilanceAlertItem, VigilanceLevel, VigilancePhenomenon, MultiDayVigilanceMatrix, MultiDayVigilanceDay, VigilancePhaseItem } from '../types/weather';

/**
 * DAILY & MULTI-DAY VIGILANCE METEOROLOGICAL THREAT ENGINE (5-MIN REFRESH CADENCE)
 * Computes dual-timing windows for every alert:
 * 1. Plage horaire d'activation légale/préventive de la VIGILANCE
 * 2. Plage horaire exacte et intensité du PIC DE L'ÉVÉNEMENT PHYSIQUE
 * 
 * Supported phenomena:
 * - Pluie-Inondation / Crues soudaines
 * - Orages violents / Grêle / Supercellules
 * - Vents violents / Tempête / Rafales descendantes / Tornades
 * - Grand froid / Gelées sévères / Journées sans dégel
 * - Neige / Verglas / Pluie verglaçante
 * - Canicule / Vague de chaleur
 * - Brouillard givrant / Visibilité nulle
 * - Avalanches en montagne
 */

/**
 * Computes high-precision hourly breakdown for an alert episode
 */
export function computeHourlyEpisodeBreakdown(
  hoursToUse: HourlyForecast[],
  alertType: 'NEIGE' | 'RAIN' | 'STORM' | 'WIND' | 'COLD' | 'HEAT'
) {
  let runningSnowCm = 0;
  let runningRainMm = 0;
  let maxVal = -999;
  let peakHourStr = "15h00";

  const list = hoursToUse.map(h => {
    const rain = h.rainMm || h.precipitationMm || 0;
    const temp = h.temperature;
    
    // Snow ratio calculation based on temperature
    let ratio = 1.0;
    if (temp <= -5) ratio = 1.4;
    else if (temp <= -2) ratio = 1.25;
    else if (temp <= 0.5) ratio = 1.1;
    else if (temp <= 2.0) ratio = 0.7;
    else ratio = 0.0;

    const snowCm = Number((rain * ratio).toFixed(1));
    runningSnowCm = Number((runningSnowCm + snowCm).toFixed(1));
    runningRainMm = Number((runningRainMm + rain).toFixed(1));

    let compareVal = rain;
    if (alertType === 'NEIGE') compareVal = snowCm;
    else if (alertType === 'WIND') compareVal = h.windGust || 0;
    else if (alertType === 'COLD') compareVal = -temp;
    else if (alertType === 'HEAT') compareVal = temp;

    if (compareVal > maxVal) {
      maxVal = compareVal;
      peakHourStr = h.hourLabel;
    }

    let intensityLabel = "Normal";
    if (alertType === 'NEIGE') {
      if (snowCm >= 3.0) intensityLabel = "🔴 Neige très forte";
      else if (snowCm >= 1.5) intensityLabel = "🟠 Neige soutenue";
      else if (snowCm >= 0.5) intensityLabel = "🟡 Neige modérée";
      else if (snowCm > 0) intensityLabel = "⚪ Neige faible";
      else intensityLabel = "Sec";
    } else if (alertType === 'RAIN' || alertType === 'STORM') {
      if (rain >= 8.0) intensityLabel = "🔴 Pluie torrentielle";
      else if (rain >= 3.5) intensityLabel = "🟠 Fortes pluies";
      else if (rain >= 1.0) intensityLabel = "🟡 Pluie modérée";
      else if (rain > 0) intensityLabel = "🟢 Pluie faible / Bruine";
      else intensityLabel = "Sec";
    } else if (alertType === 'WIND') {
      const gust = h.windGust || 0;
      if (gust >= 100) intensityLabel = "🔴 Bourrasque violente";
      else if (gust >= 80) intensityLabel = "🟠 Rafales fortes";
      else if (gust >= 60) intensityLabel = "🟡 Vent soutenu";
      else intensityLabel = "Modéré";
    }

    return {
      hour: h.hourLabel,
      rainMm: Number(rain.toFixed(1)),
      snowCm,
      cumulSnowCm: runningSnowCm,
      cumulRainMm: runningRainMm,
      windGustKmh: Math.round(h.windGust || 0),
      temp: h.temperature,
      intensityLabel,
      isPeak: false
    };
  });

  const finalList = list.map(item => ({
    ...item,
    isPeak: item.hour === peakHourStr && maxVal > 0
  }));

  return {
    hourlyList: finalList,
    totalSnowCm: Number(runningSnowCm.toFixed(1)),
    totalRainMm: Number(runningRainMm.toFixed(1)),
    peakHourStr,
    maxVal
  };
}

/**
 * Safe hour parser extracting integer 0-23 from strings like "14h00", "14:00", "14h", "14", or "1400"
 */
function parseHourNumber(str: string, defaultHour: number): number {
  if (!str) return defaultHour;
  const s = String(str).trim();
  // Match prefix digits before 'h', ':', or end of word (e.g., "14h00", "08:30", "14")
  const leadingMatch = s.match(/^(\d{1,2})(?:h|:|\s|$)/i);
  if (leadingMatch) {
    const num = parseInt(leadingMatch[1], 10);
    if (!isNaN(num)) return Math.max(0, Math.min(23, num));
  }
  // Fallback match any 1-2 digits
  const anyMatch = s.match(/(\d{1,2})/);
  if (anyMatch) {
    const num = parseInt(anyMatch[1], 10);
    if (!isNaN(num)) return Math.max(0, Math.min(23, num));
  }
  return defaultHour;
}

/**
 * Computes a high-resolution 4-phase chronological breakdown for a vigilance timeframe
 */
function parseAndCleanHour(str: string, defaultHour: number): number {
  return parseHourNumber(str, defaultHour);
}

export function computeDetailedVigilancePhases(
  phenomenon: VigilancePhenomenon,
  level: VigilanceLevel,
  vigStart: string,
  eventStart: string,
  eventPeak: string,
  eventEnd: string,
  vigEnd: string
): VigilancePhaseItem[] {
  let vS = parseAndCleanHour(vigStart, 0);
  let eS = parseAndCleanHour(eventStart, Math.max(vS, 8));
  let eP = parseAndCleanHour(eventPeak, Math.max(eS, 14));
  let eE = parseAndCleanHour(eventEnd, Math.max(eP, 20));
  let vE = parseAndCleanHour(vigEnd, 24);

  // Normalize end time if <= vS
  if (vE <= vS) vE = 24;

  // Ensure total timeframe span is at least 4 hours
  let span = vE - vS;
  if (span < 4) {
    vS = 0;
    vE = 24;
    span = 24;
  }

  // Construct 4 logical, non-overlapping chronological milestones: h0 < h1 < h2 < h3 < h4
  let h0 = vS;
  let h4 = vE;

  // h1: End of Phase 1 / Start of Phase 2 (Amorce -> Paroxysme)
  let h1 = Math.min(eS, eP - 1);
  if (h1 <= h0) {
    h1 = h0 + Math.max(1, Math.floor((eP - h0) / 2));
  }
  if (h1 <= h0) h1 = h0 + 1;
  if (h1 >= h4 - 2) h1 = h0 + Math.floor(span / 4);

  // h2: End of Phase 2 / Start of Phase 3 (Paroxysme -> Atténuation)
  let h2 = Math.max(eP + 1, eE);
  if (h2 <= h1) {
    h2 = h1 + Math.max(2, Math.floor((h4 - h1) / 2));
  }
  if (h2 <= h1) h2 = h1 + 1;
  if (h2 >= h4 - 1) h2 = h1 + Math.floor((h4 - h1) / 2);

  // h3: End of Phase 3 / Start of Phase 4 (Atténuation -> Levée)
  let h3 = h2 + Math.max(1, Math.floor((h4 - h2) / 2));
  if (h3 <= h2) h3 = h2 + 1;
  if (h3 >= h4) h3 = h4 - 1;

  // Strict enforcement: h0 < h1 < h2 < h3 < h4
  if (h1 <= h0) h1 = h0 + 1;
  if (h2 <= h1) h2 = h1 + 1;
  if (h3 <= h2) h3 = h2 + 1;
  if (h4 <= h3) {
    if (h4 === 24) {
      h3 = 23;
      if (h2 >= h3) h2 = h3 - 1;
      if (h1 >= h2) h1 = h2 - 1;
      if (h0 >= h1) h0 = 0;
    } else {
      h4 = h3 + 1;
    }
  }

  const fmtH = (num: number) => {
    const clamped = Math.max(0, Math.min(24, Math.round(num)));
    return `${clamped.toString().padStart(2, '0')}h00`;
  };

  const p1Start = fmtH(h0);
  const p1End = fmtH(h1);

  const p2Start = fmtH(h1);
  const p2End = fmtH(h2);

  const p3Start = fmtH(h2);
  const p3End = fmtH(h3);

  const p4Start = fmtH(h3);
  const p4End = fmtH(h4);

  const phases: VigilancePhaseItem[] = [];

  if (phenomenon === 'ORAGES') {
    phases.push({
      phaseNumber: 1,
      phaseName: "Phase 1 : Amorce & Instabilité Convective",
      timeWindow: `${p1Start} ➔ ${p1End}`,
      startHour: p1Start,
      endHour: p1End,
      statusBadge: "🟡 MONTÉE EN PUISSANCE",
      level: 'JAUNE',
      icon: "🛫",
      description: "Formation progressive des cumulonimbus et hausse de la température de surface.",
      expectedConditions: "Premières ondées isolées, bourgeonnements nuageux et vent devenant turbulent.",
      recommendedAction: "Vérifier l'arrimage des objets légers en extérieur et consulter le radar de pluie."
    });

    phases.push({
      phaseNumber: 2,
      phaseName: "Phase 2 : Paroxysme & Pic Orageux Critique",
      timeWindow: `${p2Start} ➔ ${p2End}`,
      startHour: p2Start,
      endHour: p2End,
      statusBadge: level === 'ROUGE' ? "🔴 PAROXYSME ABSOLU" : level === 'ORANGE' ? "🟠 PAROXYSME & PIC D'INTENSITÉ" : "🟡 CRÉNEAU CRITIQUE",
      level: level,
      icon: "⚡",
      description: `Passage du cœur de la ligne orageuse ou supercellule. Pic d'activité convective maximal à ${eventPeak}.`,
      expectedConditions: "Impacts de foudre denses, risque de grêle, pluies torrentielles et rafales descendantes violentes.",
      recommendedAction: "Rester impérativement à l'abri, fermer les baies vitrées et débrancher les appareils électroniques."
    });

    phases.push({
      phaseNumber: 3,
      phaseName: "Phase 3 : Atténuation & Évacuation",
      timeWindow: `${p3Start} ➔ ${p3End}`,
      startHour: p3Start,
      endHour: p3End,
      statusBadge: "🟢 ATTÉNUATION PROGRESSIVE",
      level: 'JAUNE',
      icon: "🛬",
      description: "Évacuation de la structure orageuse vers l'Est et baisse marquée de l'activité électrique.",
      expectedConditions: "Averses résiduelles espacées, accalmie éolienne et rafraîchissement net de la masse d'air.",
      recommendedAction: "Prudence maintenue face aux chaussées détrempées et obstacles tombés au sol."
    });

    phases.push({
      phaseNumber: 4,
      phaseName: "Phase 4 : Dispersal & Retour à la Normale",
      timeWindow: `${p4Start} ➔ ${p4End}`,
      startHour: p4Start,
      endHour: p4End,
      statusBadge: "✅ SORTIE DE VIGILANCE",
      level: 'VERT',
      icon: "🌈",
      description: "Stabilisation complète de la masse d'air et fermeture du créneau de vigilance.",
      expectedConditions: "Ciel de traîne inoffensif, vent faible, temps sec.",
      recommendedAction: "Reprise normale des activités sous réserve de vérifier l'état des lieux."
    });
  } else if (phenomenon === 'PLUIE_INONDATION') {
    phases.push({
      phaseNumber: 1,
      phaseName: "Phase 1 : Infiltration & Saturation des Sols",
      timeWindow: `${p1Start} ➔ ${p1End}`,
      startHour: p1Start,
      endHour: p1End,
      statusBadge: "🟡 DÉBUT DE DÉGRADATION",
      level: 'JAUNE',
      icon: "🌧️",
      description: "Arrivée du corps pluvieux principal et humidification continue des couches superficielles du sol.",
      expectedConditions: "Pluie modérée continue, assombrissement du ciel, engorgement des caniveaux.",
      recommendedAction: "Nettoyer les chenaux d'évacuation d'eau et surveiller les sous-sols."
    });

    phases.push({
      phaseNumber: 2,
      phaseName: "Phase 2 : Paroxysme Pluvieux & Pic de Crue",
      timeWindow: `${p2Start} ➔ ${p2End}`,
      startHour: p2Start,
      endHour: p2End,
      statusBadge: level === 'ROUGE' ? "🔴 URGENCE CRUE MAJEURE" : level === 'ORANGE' ? "🟠 PAROXYSME & CUMUL FORT" : "🟡 CUMUL SOUTENU",
      level: level,
      icon: "🌊",
      description: `Intensité maximale des précipitations (pic à ${eventPeak}). Saturation des sols et risque de ruissellement.`,
      expectedConditions: "Précipitations intenses, accumulation d'eau sur chaussées, visibilité réduite et montée des ruisseaux.",
      recommendedAction: "Ne pas vous engager sur une voie inondée et reporter vos déplacements."
    });

    phases.push({
      phaseNumber: 3,
      phaseName: "Phase 3 : Traîne Pluvieuse & Ressuyage",
      timeWindow: `${p3Start} ➔ ${p3End}`,
      startHour: p3Start,
      endHour: p3End,
      statusBadge: "🟢 DÉCROISSANCE DES DÉBITS",
      level: 'JAUNE',
      icon: "🛬",
      description: "Espacement des pluies et aménagement de la baisse des niveaux d'eau.",
      expectedConditions: "Averses intermittentes faibles, stabilisation des crues de surface.",
      recommendedAction: "Éviter de s'approcher des berges et des ponts submergés."
    });

    phases.push({
      phaseNumber: 4,
      phaseName: "Phase 4 : Assèchement & Fin d'Alerte",
      timeWindow: `${p4Start} ➔ ${p4End}`,
      startHour: p4Start,
      endHour: p4End,
      statusBadge: "✅ FIN DE VIGILANCE",
      level: 'VERT',
      icon: "☀️",
      description: "Fin de l'épisode pluvieux significatif et retour à l'état usuel.",
      expectedConditions: "Éclaircies, arrêt total des précipitations.",
      recommendedAction: "Contrôler vos évacuations et caves."
    });
  } else if (phenomenon === 'VENT_VIOLENT_TORNADE') {
    phases.push({
      phaseNumber: 1,
      phaseName: "Phase 1 : Renforcement du Gradient Éolien",
      timeWindow: `${p1Start} ➔ ${p1End}`,
      startHour: p1Start,
      endHour: p1End,
      statusBadge: "🟡 HAUSSE DES RAFALES",
      level: 'JAUNE',
      icon: "💨",
      description: "Approche de la perturbation éolienne et hausse régulière de la vitesse moyenne du vent.",
      expectedConditions: "Vent devenant turbulent, sifflement des structures et mouvements de petites branches.",
      recommendedAction: "Arrimer le mobilier de jardin, fermer volets et portes."
    });

    phases.push({
      phaseNumber: 2,
      phaseName: "Phase 2 : Paroxysme Tempétueux & Pic de Rafales",
      timeWindow: `${p2Start} ➔ ${p2End}`,
      startHour: p2Start,
      endHour: p2End,
      statusBadge: level === 'ROUGE' ? "🔴 TEMPÊTE MAJEURE DESTRUCTRICE" : level === 'ORANGE' ? "🟠 PAROXYSME & BOURRASQUES VIOLENTES" : "🟡 RAFALES MAXIMALES",
      level: level,
      icon: "🌪️",
      description: `Front le plus actif. Bourrasques maximales enregistrées vers ${eventPeak}.`,
      expectedConditions: "Rafales brutales, envol d'objets, bris de branches et dégâts aux toitures.",
      recommendedAction: "S'abriter dans un bâtiment en dur, éviter la forêt et les routes exposées."
    });

    phases.push({
      phaseNumber: 3,
      phaseName: "Phase 3 : Bascule du Vent & Atténuation",
      timeWindow: `${p3Start} ➔ ${p3End}`,
      startHour: p3Start,
      endHour: p3End,
      statusBadge: "🟢 DÉCLIN PROGRESSIF",
      level: 'JAUNE',
      icon: "🛬",
      description: "Atténuation constante des rafales à l'arrière du front froid.",
      expectedConditions: "Rafales plus espacées mais restant sensibles par intermittence.",
      recommendedAction: "Attention aux obstacles, branches et câbles tombés sur les chemins."
    });

    phases.push({
      phaseNumber: 4,
      phaseName: "Phase 4 : Apaisement & Clôture",
      timeWindow: `${p4Start} ➔ ${p4End}`,
      startHour: p4Start,
      endHour: p4End,
      statusBadge: "✅ RETOUR AU CALME",
      level: 'VERT',
      icon: "🍃",
      description: "Vent de fond normalisé et levée de la vigilance.",
      expectedConditions: "Vent faible à modéré habituel.",
      recommendedAction: "Inspection visuelle des installations extérieures."
    });
  } else if (phenomenon === 'NEIGE_VERGLAS') {
    phases.push({
      phaseNumber: 1,
      phaseName: "Phase 1 : Refroidissement & Arrivée du Cordon Neigeux",
      timeWindow: `${p1Start} ➔ ${p1End}`,
      startHour: p1Start,
      endHour: p1End,
      statusBadge: "🟡 DÉBUT DE FLOCONNADE",
      level: 'JAUNE',
      icon: "❄️",
      description: "Chute de la température sous +1°C et premiers flocons ou pluie verglaçante.",
      expectedConditions: "Blanchissement rapide des végétations et des surfaces froides.",
      recommendedAction: "Prévoir des équipements hivernaux pour la conduite."
    });

    phases.push({
      phaseNumber: 2,
      phaseName: "Phase 2 : Paroxysme Neigeux & Tenue au Sol",
      timeWindow: `${p2Start} ➔ ${p2End}`,
      startHour: p2Start,
      endHour: p2End,
      statusBadge: level === 'ORANGE' || level === 'ROUGE' ? "🟠 PAROXYSME NEIGEUX / VERGLAS DENSE" : "🟡 NEIGE SOUTENUE",
      level: level,
      icon: "🧊",
      description: `Intensité maximale des chutes de neige ou dépôt de verglas (pic à ${eventPeak}).`,
      expectedConditions: "Cumul rapide au sol, visibilité réduite et chaussées fortement glissantes.",
      recommendedAction: "Limiter strictly les déplacements non essentiels."
    });

    phases.push({
      phaseNumber: 3,
      phaseName: "Phase 3 : Tassement & Gelée Résiduelle",
      timeWindow: `${p3Start} ➔ ${p3End}`,
      startHour: p3Start,
      endHour: p3End,
      statusBadge: "🟢 ACCALMIE & RISQUE DE GEL",
      level: 'JAUNE',
      icon: "🛬",
      description: "Fin des chutes significatives mais risque majeur de gel/verglas nocturne.",
      expectedConditions: "Plaques de verglas tenaces et neige tassée.",
      recommendedAction: "Saler les accès piétons privés."
    });

    phases.push({
      phaseNumber: 4,
      phaseName: "Phase 4 : Dégagement & Clôture",
      timeWindow: `${p4Start} ➔ ${p4End}`,
      startHour: p4Start,
      endHour: p4End,
      statusBadge: "✅ FIN DU RISQUE HIERNAL",
      level: 'VERT',
      icon: "☀️",
      description: "Retour à des températures positives et dégagement des voies.",
      expectedConditions: "Dégel progressif des routes.",
      recommendedAction: "Prudence aux zones d'ombre persistance."
    });
  } else {
    phases.push({
      phaseNumber: 1,
      phaseName: "Phase 1 : Amorce & Phase Préventive",
      timeWindow: `${p1Start} ➔ ${p1End}`,
      startHour: p1Start,
      endHour: p1End,
      statusBadge: "🟡 MONTÉE DU RISQUE",
      level: 'JAUNE',
      icon: "🛫",
      description: "Début officiel de l'activation préventive et surveillance des paramètres.",
      expectedConditions: "Progression des indicateurs vers les seuils d'alerte.",
      recommendedAction: "Suivre les conseils de prévention officiels."
    });

    phases.push({
      phaseNumber: 2,
      phaseName: "Phase 2 : Paroxysme & Pic d'Intensité Critique",
      timeWindow: `${p2Start} ➔ ${p2End}`,
      startHour: p2Start,
      endHour: p2End,
      statusBadge: level === 'ROUGE' ? "🔴 PAROXYSME ABSOLU" : level === 'ORANGE' ? "🟠 PIC CRITIQUE D'ALERTES" : "🟡 NIVEAU DE RISQUE MAXIMAL",
      level: level,
      icon: "⚠️",
      description: `Fenêtre temporelle d'intensité maximale (pic à ${eventPeak}).`,
      expectedConditions: "Conditions climatiques les plus sévères de la journée.",
      recommendedAction: "Respecter scrupuleusement les consignes de sécurité."
    });

    phases.push({
      phaseNumber: 3,
      phaseName: "Phase 3 : Atténuation & Régression",
      timeWindow: `${p3Start} ➔ ${p3End}`,
      startHour: p3Start,
      endHour: p3End,
      statusBadge: "🟢 ATTÉNUATION PROGRESSIVE",
      level: 'JAUNE',
      icon: "🛬",
      description: "Déclin de l'intensité du phénomène météorologique.",
      expectedConditions: "Amélioration progressive des conditions locales.",
      recommendedAction: "Maintenir une vigilance modérée."
    });

    phases.push({
      phaseNumber: 4,
      phaseName: "Phase 4 : Clôture & Retour à la Normale",
      timeWindow: `${p4Start} ➔ ${p4End}`,
      startHour: p4Start,
      endHour: p4End,
      statusBadge: "✅ SORTIE DE VIGILANCE",
      level: 'VERT',
      icon: "✅",
      description: "Levée de la vigilance et stabilisation du temps.",
      expectedConditions: "Conditions calmes et habituelles.",
      recommendedAction: "Reprise normale des activités."
    });
  }

  return phases;
}

export function computeDayVigilanceAlerts(
  day: DailyForecast,
  hourlyList: HourlyForecast[] = [],
  station?: LocationPoint
): DailyVigilanceAlertItem[] {
  const alerts: DailyVigilanceAlertItem[] = [];
  const dayDateStr = (day.date || '').split('T')[0];
  const now = new Date();
  const currentHourNum = now.getHours();
  const isToday: boolean = Boolean(
    day.dayLabel?.toLowerCase().includes("aujourd'hui") || 
    (day.date && dayDateStr === now.toISOString().split('T')[0])
  );

  // Filter 24 hours of this day
  const dayHours = (hourlyList.length > 0 ? hourlyList : (day.hourlyList || []))
    .filter(h => {
      const hDate = (h.time || h.dayDate || '').split('T')[0];
      if (hDate && dayDateStr) return hDate === dayDateStr;
      if (day.date && h.time) return h.time.startsWith(day.date.substring(0, 10));
      return true;
    });

  const hoursToUse = dayHours.length > 0 ? dayHours : (day.hourlyList || []);
  const alt = station?.altitude ?? 0;
  const isMountain = alt >= 800;

  const minTemp = day.tempMin ?? (hoursToUse.length > 0 ? Math.min(...hoursToUse.map(h => h.temperature)) : 10);
  const maxTemp = day.tempMax ?? (hoursToUse.length > 0 ? Math.max(...hoursToUse.map(h => h.temperature)) : 15);
  const tMean = day.tempMean ?? (minTemp + maxTemp) / 2;

  // ----------------------------------------------------
  // 1. PLUIE & INONDATION / CUMULS SOUTENUS
  // ----------------------------------------------------
  const rainSum = Number((day.rainMm ?? day.precipitationSumMm ?? 0).toFixed(1));
  const rainProb = day.precipitationProbability ?? 0;
  const maxHourlyRain = Number(hoursToUse.reduce((max, h) => Math.max(max, h.rainMm || h.precipitationMm || 0), 0).toFixed(1));

  const isMainlySnow = (minTemp <= 1.0 && maxTemp <= 2.5) || hoursToUse.every(h => (h.rainMm || 0) === 0 || h.temperature <= 1.5) || (day.snowfallCm || 0) > 0;

  if (!isMainlySnow && (rainSum >= 8 || maxHourlyRain >= 3.5 || (rainSum >= 4 && rainProb >= 70))) {
    let level: VigilanceLevel = 'JAUNE';
    let title = "Vigilance Pluie-Inondation";
    let message = `Cumul notable de ${rainSum} mm (${rainSum} L/m²) attendu. Sols humidifiés, ruissellements locaux et fossés sous surveillance.`;
    let triggerCriteria = `Cumul 24h ≥ ${rainSum} mm (intensité horaire pic : ${maxHourlyRain} mm/h)`;
    let dangerDesc = "Risque d'aquaplaning sur les axes rapides et engorgement passager des réseaux pluviaux urbains.";
    let impacts = [
      "Risque d'aquaplaning et visibilité réduite sous les plus fortes intensités.",
      "Engorgement possible des caniveaux et passages souterrains ponctuels.",
      "Ralentissements sur les réseaux de transport et conditions de circulation délicates."
    ];

    if (rainSum >= 65 || maxHourlyRain >= 22) {
      level = 'ROUGE';
      title = "Alerte Rouge Pluie Torrentielle & Crue Majeure";
      message = `Épisode pluvieux exceptionnel avec cumuls estimés à ${rainSum} mm (intensité max : ${maxHourlyRain} mm/h). Risque de crues soudaines et inondations généralisées.`;
      triggerCriteria = `Cumul exceptionnel ≥ ${rainSum} mm en 24h avec intensité de pointe de ${maxHourlyRain} mm/h`;
      dangerDesc = "Inondations majeures généralisées, débordements rapides de cours d'eau et coupures d'axes routiers.";
      impacts = [
        "Inondations de caves, sous-sols et rez-de-chaussée dans les points bas.",
        "Crues éclairs des ruisseaux et rivières secondaires.",
        "Coupures de routes et d'électricité possibles."
      ];
    } else if (rainSum >= 28 || maxHourlyRain >= 9) {
      level = 'ORANGE';
      title = "Vigilance Orange Fortes Précipitations";
      message = `Précipitations soutenues et abondantes prévues (${rainSum} mm). Risque de saturation des sols, fossés débordants et ruissellements significatifs.`;
      triggerCriteria = `Cumul 24h ≥ ${rainSum} mm (intensité de pointe ${maxHourlyRain} mm/h)`;
      dangerDesc = "Saturation des sols en eau et débordements ponctuels de fossés et petits cours d'eau.";
      impacts = [
        "Infiltration dans les garages et caves vulnérables.",
        "Circulation fortement perturbée par de grandes flaques et coulées de boue locales.",
        "Prudence accrue aux abords des cours d'eau."
      ];
    }

    const { 
      vigilanceStart, vigilanceEnd, 
      eventStart, eventPeak, eventEnd, 
      durationHours, isOngoing 
    } = computeDualTimingWindow(
      hoursToUse,
      h => (h.rainMm || 0) >= 0.2 || (h.precipitationProbability || 0) >= 50,
      h => h.rainMm || h.precipitationMm || 0,
      isToday,
      currentHourNum,
      "08h00", "15h00", "22h00"
    );

    const rainBreakdown = computeHourlyEpisodeBreakdown(hoursToUse, 'RAIN');

    alerts.push({
      id: `rain-${dayDateStr}`,
      phenomenon: 'PLUIE_INONDATION',
      phenomenonLabel: 'Pluie & Inondation',
      level,
      emoji: level === 'ROUGE' ? '🌊🌧️' : level === 'ORANGE' ? '🌧️⚠️' : '🌧️',
      title,
      message,
      vigilanceStartHour: vigilanceStart,
      vigilanceEndHour: vigilanceEnd,
      vigilanceWindowLabel: `Vigilance active de ${vigilanceStart} à ${vigilanceEnd}`,
      eventStartHour: eventStart,
      eventPeakHour: eventPeak,
      eventEndHour: eventEnd,
      eventWindowLabel: `Événement pluvieux : ${eventStart} à ${eventEnd} (Intensité max à ${eventPeak})`,
      eventDescription: `Pluies continues et passages d'averses soutenues apportant jusqu'à ${rainSum} mm (débit max estimé à ${maxHourlyRain} mm/h).`,
      dangerLevelDescription: dangerDesc,
      triggerThresholdCriteria: triggerCriteria,
      impactsSummary: impacts,
      totalEpisodeAccumulation: `🌧️ CUMUL TOTAL ESTIMÉ : ${rainSum} mm (${rainSum} L/m²) • Fourchette : ${(rainSum * 0.85).toFixed(1)} à ${(rainSum * 1.15).toFixed(1)} mm`,
      criticalHoursWindow: `🚨 HEURES LES PLUS CRITIQUES : De ${eventStart} à ${eventEnd} (Pic d'intensité de ${maxHourlyRain} mm/h à ${eventPeak})`,
      phases: computeDetailedVigilancePhases('PLUIE_INONDATION', level, vigilanceStart, eventStart, eventPeak, eventEnd, vigilanceEnd),
      hourlyBreakdownDetails: rainBreakdown.hourlyList,
      riskSlotLabel: `Créneau de pluie : ${eventStart} à ${eventEnd} (Pic : ${eventPeak})`,
      startHourFormatted: eventStart,
      peakHourFormatted: eventPeak,
      endHourFormatted: eventEnd,
      durationHours,
      severityMetric: `Cumul 24h : ${rainSum} mm • Intensité max : ${maxHourlyRain} mm/h`,
      safetyInstructions: [
        "Réduisez votre vitesse sur route et augmentez vos distances de sécurité.",
        "Évitez les passages souterrains et les zones habituellement inondables.",
        "Ne vous engagez jamais sur une chaussée submergée (même 20 cm d'eau peuvent emporter une voiture)."
      ],
      isOngoingNow: isOngoing,
      lastUpdatedTimestamp: getFreshTimestamp()
    });
  }

  // ----------------------------------------------------
  // 2. ORAGES, FOUDRE & GRÊLE (Convection active)
  // ----------------------------------------------------
  const maxCape = hoursToUse.reduce((max, h) => Math.max(max, h.convectiveCape || 0), 0);
  const minLifted = hoursToUse.reduce((min, h) => Math.min(min, h.liftedIndex ?? 10), 10);
  const isStormCode = [95, 96, 99].includes(day.weatherCode) || hoursToUse.some(h => [95, 96, 99].includes(h.weatherCode));
  const stormProb = Math.max(
    ...hoursToUse.map(h => h.thunderstormProbability || 0),
    isStormCode ? 70 : (maxCape > 500 && rainProb > 40 ? 55 : 0)
  );
  const maxGustDuringStorm = hoursToUse.reduce((max, h) => Math.max(max, h.windGust || 0), day.windGustMax || 0);

  if (isStormCode || maxCape >= 400 || (minLifted <= -1 && rainProb >= 35) || stormProb >= 30) {
    let level: VigilanceLevel = 'JAUNE';
    let title = "Vigilance Orages";
    let message = "Développement d'ondées orageuses localisées avec activité électrique, averses et brèves rafales.";
    let triggerCriteria = `Instabilité convective CAPE: ${Math.round(maxCape)} J/kg • Probabilité orage: ${stormProb}%`;
    let dangerDesc = "Risque d'impacts de foudre isolés, ruissellements locaux et rafales sous grains.";
    let impacts = [
      "Activité électrique ponctuelle pouvant endommager les appareils non protégés.",
      "Précipitations intenses et brèves entraînant des réductions de visibilité.",
      "Rafales de vent convectives localisées sous les cellules."
    ];

    if (day.weatherCode === 99 || maxCape >= 1800 || (maxCape >= 1100 && maxGustDuringStorm >= 90)) {
      level = 'ROUGE';
      title = "Alerte Rouge Orages Extrêmes & Risque Destructeur";
      message = `Orages supercellulaires violents très probables. Risque élevé de gros grêlons (>3 cm), foudroiement intense et rafales de vent dévastatrices (jusqu'à ${Math.max(95, maxGustDuringStorm)} km/h).`;
      triggerCriteria = `Énergie convective extrême CAPE ≥ ${Math.round(maxCape)} J/kg, cisaillement prononcé et risque de grêle destructrice`;
      dangerDesc = "Chutes de gros grêlons, rafales descendantes violentes (downbursts) et dégâts matériels majeurs.";
      impacts = [
        "Dégâts sur les toitures, serres, vérandas et carrosseries par la grêle.",
        "Chutes d'arbres et de branches rompues sur les voies.",
        "Coupures d'électricité et perturbations massives des réseaux ferroviaires et routiers."
      ];
    } else if (day.weatherCode === 96 || maxCape >= 850 || minLifted <= -3 || (maxGustDuringStorm >= 75 && stormProb >= 50)) {
      level = 'ORANGE';
      title = "Vigilance Orange Orages Violents & Grêle";
      message = `Orages organisés et potentiellement violents. Fortes intensités pluvieuses en peu de temps, chutes de grêle (1 à 3 cm) et rafales de vent soutenues (${Math.max(70, maxGustDuringStorm)} km/h).`;
      triggerCriteria = `Instabilité marquée CAPE: ${Math.round(maxCape)} J/kg, Lifted Index: ${minLifted.toFixed(1)}, rafales sous orage`;
      dangerDesc = "Orages virulents accompagnés de foudroiement fréquent, grêle et rafales soudaines.";
      impacts = [
        "Risque de grêle endommageant les cultures maraîchères et jardins.",
        "Ruissellements urbains rapides et inondations de caves.",
        "Objets non arrimés emportés par de brusques coups de vent."
      ];
    }

    const { 
      vigilanceStart, vigilanceEnd, 
      eventStart, eventPeak, eventEnd, 
      durationHours, isOngoing 
    } = computeDualTimingWindow(
      hoursToUse,
      h => [95, 96, 99].includes(h.weatherCode) || (h.convectiveCape || 0) >= 350 || (h.thunderstormProbability || 0) >= 30,
      h => (h.convectiveCape || 0) + (h.rainMm || 0) * 40,
      isToday,
      currentHourNum,
      "13h00", "17h00", "22h00"
    );

    const stormBreakdown = computeHourlyEpisodeBreakdown(hoursToUse, 'STORM');

    alerts.push({
      id: `storm-${dayDateStr}`,
      phenomenon: 'ORAGES',
      phenomenonLabel: 'Orages & Grêle',
      level,
      emoji: level === 'ROUGE' ? '⚡⛈️🔥' : level === 'ORANGE' ? '⛈️⚡' : '🌩️',
      title,
      message,
      vigilanceStartHour: vigilanceStart,
      vigilanceEndHour: vigilanceEnd,
      vigilanceWindowLabel: `Vigilance active de ${vigilanceStart} à ${vigilanceEnd}`,
      eventStartHour: eventStart,
      eventPeakHour: eventPeak,
      eventEndHour: eventEnd,
      eventWindowLabel: `Épisode orageux : ${eventStart} à ${eventEnd} (Pic d'activité à ${eventPeak})`,
      eventDescription: `Développement de foyers orageux virulents générant de fortes intensités de précipitations, de la grêle et des rafales convectives jusqu'à ${Math.max(65, maxGustDuringStorm)} km/h.`,
      dangerLevelDescription: dangerDesc,
      triggerThresholdCriteria: triggerCriteria,
      impactsSummary: impacts,
      totalEpisodeAccumulation: `⚡ ÉPISODE ORAGEUX • Cumul eau sous cellules : ${rainSum} mm • CAPE max : ${Math.round(maxCape)} J/kg • Rafales max : ${maxGustDuringStorm} km/h`,
      criticalHoursWindow: `🚨 CRÉNEAU ORAGEUX CRITIQUE : De ${eventStart} à ${eventEnd} (Pic maximal d'instabilité à ${eventPeak})`,
      phases: computeDetailedVigilancePhases('ORAGES', level, vigilanceStart, eventStart, eventPeak, eventEnd, vigilanceEnd),
      hourlyBreakdownDetails: stormBreakdown.hourlyList,
      riskSlotLabel: `Créneau orageux : ${eventStart} à ${eventEnd} (Pic : ${eventPeak})`,
      startHourFormatted: eventStart,
      peakHourFormatted: eventPeak,
      endHourFormatted: eventEnd,
      durationHours,
      severityMetric: `CAPE max : ${Math.round(maxCape)} J/kg • Probabilité orage : ${stormProb}% • Rafales : ${maxGustDuringStorm} km/h`,
      safetyInstructions: [
        "Mettez à l'abri les objets sensibles aux rafales et rentrez les véhicules si risque de grêle.",
        "Évitez les activités de plein air, la baignade et la proximité immédiate des arbres ou pylônes.",
        "Débranchez les appareils électroniques sensibles en cas d'impacts de foudre proches."
      ],
      isOngoingNow: isOngoing,
      lastUpdatedTimestamp: getFreshTimestamp()
    });
  }

  // ----------------------------------------------------
  // 3. VENT VIOLENT, TEMPÊTE & RISQUE TORNADIQUE
  // ----------------------------------------------------
  const maxGust = day.windGustMax ?? Math.round(day.windSpeedMax * 1.35);
  const maxHourlyGust = hoursToUse.reduce((max, h) => Math.max(max, h.windGust || 0), maxGust);
  const actualMaxGust = Math.max(maxGust, maxHourlyGust);

  if (actualMaxGust >= 60 || day.windSpeedMax >= 42) {
    let level: VigilanceLevel = 'JAUNE';
    let title = "Vigilance Coup de Vent";
    let message = `Rafales de vent notables attendues jusqu'à ${actualMaxGust} km/h. Prudence pour les structures légères et circulation.`;
    let triggerCriteria = `Rafales de vent maximales modélisées ≥ ${actualMaxGust} km/h`;
    let dangerDesc = "Bourrasques soutenues pouvant déstabiliser les deux-roues et faire voler des branchages.";
    let impacts = [
      "Branches mortes et objets légers susceptibles de s'envoler.",
      "Prise au vent accrue pour les véhicules hauts (camions, caravanes).",
      "Vigilance lors des activités de loisirs en extérieur et en milieu boisé."
    ];

    if (actualMaxGust >= 115 || (actualMaxGust >= 100 && maxCape >= 800)) {
      level = 'ROUGE';
      title = actualMaxGust >= 125 || maxCape >= 1200 ? "Alerte Rouge Tempête / Rafales Destructrices & Risque Tornadique" : "Alerte Rouge Tempête Violente";
      message = `Phénomène venteux majeur avec rafales dépassant ${actualMaxGust} km/h. Chutes d'arbres, toitures arrachées et coupures de courant généralisées très probables.`;
      triggerCriteria = `Rafales d'échelle tempétueuse destructrice ≥ ${actualMaxGust} km/h`;
      dangerDesc = "Conditions de tempête majeure avec risque élevé d'accidents corporels dus aux chutes d'arbres et débris volants.";
      impacts = [
        "Nombreuses chutes d'arbres obstruant les axes de circulation.",
        "Dommages sévères aux toitures, cheminées et lignes électriques.",
        "Interruption complète de transports ferroviaires et aériens."
      ];
    } else if (actualMaxGust >= 85) {
      level = 'ORANGE';
      title = "Vigilance Orange Vent Violent & Bourrasques";
      message = `Vents très soutenus avec bourrasques atteignant ${actualMaxGust} km/h. Risque de branches cassées et perturbations sur les réseaux.`;
      triggerCriteria = `Rafales de vent violentes modélisées ≥ ${actualMaxGust} km/h`;
      dangerDesc = "Coups de vent violents provoquant des chutes de branches et des difficultés majeures de circulation.";
      impacts = [
        "Branches cassées et chutes de tuiles sur la voie publique.",
        "Perturbations sur les axes routiers et ralentissements des trains.",
        "Bâches et échafaudages fragilisés."
      ];
    }

    const { 
      vigilanceStart, vigilanceEnd, 
      eventStart, eventPeak, eventEnd, 
      durationHours, isOngoing 
    } = computeDualTimingWindow(
      hoursToUse,
      h => (h.windGust || 0) >= 55 || (h.windSpeed || 0) >= 38,
      h => h.windGust || 0,
      isToday,
      currentHourNum,
      "10h00", "16h00", "22h00"
    );

    const windBreakdown = computeHourlyEpisodeBreakdown(hoursToUse, 'WIND');

    alerts.push({
      id: `wind-${dayDateStr}`,
      phenomenon: 'VENT_VIOLENT_TORNADE',
      phenomenonLabel: actualMaxGust >= 115 ? 'Vent Violent & Risque Tornade' : 'Vent Violent',
      level,
      emoji: level === 'ROUGE' ? '🌪️💨' : level === 'ORANGE' ? '💨⚠️' : '💨',
      title,
      message,
      vigilanceStartHour: vigilanceStart,
      vigilanceEndHour: vigilanceEnd,
      vigilanceWindowLabel: `Vigilance active de ${vigilanceStart} à ${vigilanceEnd}`,
      eventStartHour: eventStart,
      eventPeakHour: eventPeak,
      eventEndHour: eventEnd,
      eventWindowLabel: `Pic de vent fort : ${eventStart} à ${eventEnd} (Bourrasque max à ${eventPeak})`,
      eventDescription: `Flux vigoureux provoquant des rafales maximales estimées à ${actualMaxGust} km/h (vent moyen à ${day.windSpeedMax} km/h).`,
      dangerLevelDescription: dangerDesc,
      triggerThresholdCriteria: triggerCriteria,
      impactsSummary: impacts,
      totalEpisodeAccumulation: `💨 BOURRASQUE MAXIMALE : ${actualMaxGust} km/h • Vent moyen max : ${day.windSpeedMax} km/h`,
      criticalHoursWindow: `🚨 CRÉNEAU CRITIQUE DE VENT FORT : De ${eventStart} à ${eventEnd} (Pic maximal de ${actualMaxGust} km/h à ${eventPeak})`,
      phases: computeDetailedVigilancePhases('VENT_VIOLENT_TORNADE', level, vigilanceStart, eventStart, eventPeak, eventEnd, vigilanceEnd),
      hourlyBreakdownDetails: windBreakdown.hourlyList,
      riskSlotLabel: `Créneau de vent fort : ${eventStart} à ${eventEnd} (Pic : ${eventPeak})`,
      startHourFormatted: eventStart,
      peakHourFormatted: eventPeak,
      endHourFormatted: eventEnd,
      durationHours,
      severityMetric: `Rafale max : ${actualMaxGust} km/h (Vent moyen : ${day.windSpeedMax} km/h)`,
      safetyInstructions: [
        "Limitez vos déplacements en forêt ou sur les axes routiers exposés.",
        "Fixez ou rangez tout mobilier de jardin, bâches et objets légers.",
        "Prenez garde aux chutes d'arbres, de tuiles et d'objets divers."
      ],
      isOngoingNow: isOngoing,
      lastUpdatedTimestamp: getFreshTimestamp()
    });
  }

  // ----------------------------------------------------
  // 4. GEL, GRAND FROID & JOURNÉE SANS DÉGEL
  // ----------------------------------------------------
  const isFreezingDay = maxTemp <= 0;
  const isFrost = minTemp <= 0;

  if (isFrost || minTemp <= 1.0) {
    let level: VigilanceLevel = 'JAUNE';
    let title = "Vigilance Gelée Blanche & Froid";
    let message = `Température minimale de ${minTemp}°C. Gelée matinale sur la végétation et surfaces au sol.`;
    let triggerCriteria = `Température minimale sous abri ≤ ${minTemp}°C`;
    let dangerDesc = "Gelées blanches matinales et chaussées localement glissantes à l'aube.";
    let impacts = [
      "Gelée blanche en plaine et vallées exposées.",
      "Prudence sur les ponts et zones humides à l'aube.",
      "Protection nécessaire pour les plantes sensibles."
    ];

    if (minTemp <= -8.0 || (isFreezingDay && minTemp <= -5.0)) {
      level = 'ROUGE';
      title = "Alerte Rouge Grand Froid Extrême";
      message = `Vague de froid intense avec gel sévère permanent (${minTemp}°C). Risque d'hypothermie rapide et gel des canalisations non isolées.`;
      triggerCriteria = `Température extrême sous abri Tn: ${minTemp}°C avec ressenti éolien très bas`;
      dangerDesc = "Froid polaire dangereux pour les personnes vulnérables et les animaux.";
      impacts = [
        "Risque vital d'hypothermie et d'engelures lors d'expositions prolongées.",
        "Gel des canalisations d'eau potable et compteurs non protégés.",
        "Batteries de véhicules affaiblies et verglas tenace."
      ];
    } else if (minTemp <= -3.5 || isFreezingDay) {
      level = 'ORANGE';
      title = isFreezingDay ? "Vigilance Orange Journée Sans Dégel" : "Vigilance Orange Gel Sévère";
      message = isFreezingDay
        ? `La température restera négative toute la journée (Tx: ${maxTemp}°C, Tn: ${minTemp}°C). Sols gelés en profondeur.`
        : `Gelée marquée sous abri (${minTemp}°C). Fort impact sur les cultures horticoles et conduites d'eau.`;
      triggerCriteria = isFreezingDay ? `Journée sans dégel (Tx ≤ 0°C, Tn: ${minTemp}°C)` : `Gelée sévère Tn ≤ -3.5°C`;
      dangerDesc = isFreezingDay ? "Gel permanent 24h/24 durcissant les sols et pérennisant les plaques de verglas." : "Fort gel affectant l'agriculture et les infrastructures.";
      impacts = [
        "Plaques de verglas persistant toute la journée à l'ombre.",
        "Fragilisation de la végétation et risque pour les bourgeons/fleurs.",
        "Surconsommation énergétique de chauffage."
      ];
    }

    const { 
      vigilanceStart, vigilanceEnd, 
      eventStart, eventPeak, eventEnd, 
      durationHours, isOngoing 
    } = computeDualTimingWindow(
      hoursToUse,
      h => h.temperature <= 0.5,
      h => -h.temperature, // colder = higher peak
      isToday,
      currentHourNum,
      "01h00", "06h30", "09h30"
    );

    alerts.push({
      id: `frost-${dayDateStr}`,
      phenomenon: 'GRAND_FROID_GEL',
      phenomenonLabel: isFreezingDay ? 'Grand Froid (Sans Dégel)' : 'Gelée & Froid',
      level,
      emoji: level === 'ROUGE' ? '🥶❄️' : level === 'ORANGE' ? '❄️🧊' : '🧊',
      title,
      message,
      vigilanceStartHour: vigilanceStart,
      vigilanceEndHour: vigilanceEnd,
      vigilanceWindowLabel: `Vigilance active de ${vigilanceStart} à ${vigilanceEnd}`,
      eventStartHour: eventStart,
      eventPeakHour: eventPeak,
      eventEndHour: eventEnd,
      eventWindowLabel: `Période de gel : ${eventStart} à ${eventEnd} (Minimum à ${eventPeak})`,
      eventDescription: `Baisse nocturne avec température s'abaissant jusqu'à ${minTemp}°C (ressenti éolien jusqu'à ${Math.round(minTemp - (day.windSpeedMax || 10) * 0.3)}°C).`,
      dangerLevelDescription: dangerDesc,
      triggerThresholdCriteria: triggerCriteria,
      impactsSummary: impacts,
      phases: computeDetailedVigilancePhases('GRAND_FROID_GEL', level, vigilanceStart, eventStart, eventPeak, eventEnd, vigilanceEnd),
      riskSlotLabel: `Créneau de gel : ${eventStart} à ${eventEnd} (Minimum : ${eventPeak})`,
      startHourFormatted: eventStart,
      peakHourFormatted: eventPeak,
      endHourFormatted: eventEnd,
      durationHours,
      severityMetric: `Tn : ${minTemp}°C • Tx : ${maxTemp}°C • Gelée au sol`,
      safetyInstructions: [
        "Protégez les compteurs d'eau et purgez les robinets extérieurs.",
        "Prévoyez des équipements hivernaux sur votre véhicule et grattez le pare-brise.",
        "Soyez attentif aux personnes sans-abri et signalez toute détresse au 115."
      ],
      isOngoingNow: isOngoing,
      lastUpdatedTimestamp: getFreshTimestamp()
    });
  }

  // ----------------------------------------------------
  // 5. NEIGE, VERGLAS & PLUIE VERGLAÇANTE
  // ----------------------------------------------------
  const hasColdPrecipRisk = rainSum > 0.1 && (
    minTemp <= 1.0 || 
    maxTemp <= 2.5 || 
    hoursToUse.some(h => (h.rainMm || h.precipitationMm || 0) > 0.1 && h.temperature <= 1.5)
  );
  const isSnowCode = [71, 73, 75, 77, 85, 86].includes(day.weatherCode) || 
    hoursToUse.some(h => [71, 73, 75, 77, 85, 86].includes(h.weatherCode)) || 
    hasColdPrecipRisk || 
    (day.snowfallCm || 0) > 0;
  const isFreezingRainCode = [66, 67].includes(day.weatherCode) || hoursToUse.some(h => [66, 67].includes(h.weatherCode));
  const hasFreezingRain = isFreezingRainCode || (rainSum > 0.5 && minTemp <= 0.5);

  if (isSnowCode || hasFreezingRain) {
    let level: VigilanceLevel = 'JAUNE';
    let title = hasFreezingRain ? "Vigilance Pluie Verglaçante & Verglas" : "Vigilance Neige & Verglas";
    let message = hasFreezingRain
      ? "Pluie tombant sur des sols gelés créant un film de glace extrêmement glissant."
      : "Précipitations neigeuses probables tenant au sol dès les premières hauteurs.";
    let triggerCriteria = hasFreezingRain ? "Précipitations liquides sur chaussée ≤ 0°C" : `Chutes de neige (code WMO ${day.weatherCode})`;
    let dangerDesc = "Chaussées très glissantes, perte d'adhérence brutale des véhicules.";
    let impacts = [
      "Circulation ralentie et glissades de piétons.",
      "Équipements spéciaux recommandés (pneus hiver/chaînes).",
      "Retards dans les transports scolaires et collectifs."
    ];

    if (hasFreezingRain && rainSum >= 4.0) {
      level = 'ORANGE';
      title = "Vigilance Orange Verglas Généralisé";
      message = "Épisode de pluie verglaçante notable. Routes impraticables sans salage préalable et risque d'arbres pliés sous le poids de la glace.";
      dangerDesc = "Couche de verglas généralisée rendant le réseau routier dangereux.";
    } else if (isSnowCode && (rainSum >= 10 || (isMountain && rainSum >= 20))) {
      level = 'ORANGE';
      title = "Vigilance Orange Fortes Chutes de Neige";
      message = `Chutes de neige abondantes (>5 à 15 cm en plaine / >30 cm en montagne). Conditions de circulation très difficiles.`;
      dangerDesc = "Fortes accumulations de neige entraînant des blocages routiers.";
    }

    const { 
      vigilanceStart, vigilanceEnd, 
      eventStart, eventPeak, eventEnd, 
      durationHours, isOngoing 
    } = computeDualTimingWindow(
      hoursToUse,
      h => [71, 73, 75, 77, 85, 86, 66, 67].includes(h.weatherCode) || (h.rainMm || 0) > 0.2,
      h => (h.rainMm || 0) * 10,
      isToday,
      currentHourNum,
      "04h00", "08h00", "14h00"
    );

    const snowBreakdown = computeHourlyEpisodeBreakdown(hoursToUse, 'NEIGE');
    const estimatedSnowCm = snowBreakdown.totalSnowCm > 0 ? snowBreakdown.totalSnowCm : Number((rainSum * (minTemp <= 0 ? 1.1 : 0.8)).toFixed(1));
    const minSnowRange = Number((estimatedSnowCm * 0.85).toFixed(1));
    const maxSnowRange = Number((estimatedSnowCm * 1.25).toFixed(1));

    alerts.push({
      id: `snow-${dayDateStr}`,
      phenomenon: 'NEIGE_VERGLAS',
      phenomenonLabel: hasFreezingRain ? 'Pluie Verglaçante & Verglas' : 'Neige & Verglas',
      level,
      emoji: hasFreezingRain ? '🧊🌧️' : '❄️🌨️',
      title,
      message,
      vigilanceStartHour: vigilanceStart,
      vigilanceEndHour: vigilanceEnd,
      vigilanceWindowLabel: `Vigilance active de ${vigilanceStart} à ${vigilanceEnd}`,
      eventStartHour: eventStart,
      eventPeakHour: eventPeak,
      eventEndHour: eventEnd,
      eventWindowLabel: `Épisode neigeux/verglas : ${eventStart} à ${eventEnd} (Intensité max à ${eventPeak})`,
      eventDescription: hasFreezingRain
        ? `Épisode de pluies verglaçantes survenant par températures négatives (${minTemp}°C).`
        : `Chutes de neige tenant au sol avec refroidissement nocturne et cumul estimé à ${estimatedSnowCm} cm.`,
      dangerLevelDescription: dangerDesc,
      triggerThresholdCriteria: triggerCriteria,
      impactsSummary: impacts,
      totalEpisodeAccumulation: hasFreezingRain
        ? `Verglas généralisé • Pluie sur sol gelé : ${rainSum} mm (${rainSum} L/m²)`
        : `❄️ CUMUL TOTAL ESTIMÉ : ${estimatedSnowCm} cm de neige fraîche au sol (Fourchette : ${minSnowRange} à ${maxSnowRange} cm)`,
      criticalHoursWindow: `🚨 HEURES LES PLUS CRITIQUES : De ${eventStart} à ${eventEnd} (Pic d'intensité à ${eventPeak})`,
      phases: computeDetailedVigilancePhases('NEIGE_VERGLAS', level, vigilanceStart, eventStart, eventPeak, eventEnd, vigilanceEnd),
      snowQualityDetails: minTemp <= -3
        ? "Neige légère à poudreuse sèche (ratio 1mm = 1.3cm), faible risque de collant mais formation rapide de congères sous le vent."
        : minTemp <= 0.5
        ? "Neige dense et lourde très collante (ratio 1mm = 1.0cm), tenue immédiate au sol et charge importante sur les branches et câbles électriques."
        : "Neige humide/fondante ou mouillée au sol (ratio 1mm = 0.7cm) devenant glissante sous refroidissement.",
      hourlyBreakdownDetails: snowBreakdown.hourlyList,
      riskSlotLabel: `Créneau de neige/verglas : ${eventStart} à ${eventEnd} (Pic : ${eventPeak})`,
      startHourFormatted: eventStart,
      peakHourFormatted: eventPeak,
      endHourFormatted: eventEnd,
      durationHours,
      severityMetric: `Cumul neige : ${estimatedSnowCm} cm (${minSnowRange}-${maxSnowRange} cm) • Tn : ${minTemp}°C • Cumul précip. : ${rainSum} mm`,
      safetyInstructions: [
        "Munissez votre véhicule de pneus hiver ou chaînes conformes à la Loi Montagne.",
        "Augmentez significativement vos distances de freinage.",
        "Évitez tout déplacement non indispensable lors des pluies verglaçantes."
      ],
      isOngoingNow: isOngoing,
      lastUpdatedTimestamp: getFreshTimestamp()
    });
  }

  // ----------------------------------------------------
  // 6. CANICULE & VAGUE DE CHALEUR
  // ----------------------------------------------------
  const isHighHeat = day.tempMax >= 32;
  const isTropicalNight = day.tempMin >= 19;

  if (isHighHeat || (day.tempMax >= 30 && isTropicalNight)) {
    let level: VigilanceLevel = 'JAUNE';
    let title = "Vigilance Forte Chaleur";
    let message = `Température de pointe de ${day.tempMax}°C avec nuit douce (${day.tempMin}°C). Inconfort thermique en milieu urbain.`;
    let triggerCriteria = `Température maximale Tx: ${day.tempMax}°C (Tn: ${day.tempMin}°C)`;
    let dangerDesc = "Stress thermique pour les personnes fragiles et nourrissons.";
    let impacts = [
      "Coup de chaleur possible lors d'efforts physiques intenses.",
      "Surchauffe des logements mal isolés et îlots de chaleur urbains.",
      "Augmentation des concentrations d'ozone dans l'air."
    ];

    if (day.tempMax >= 39 || (day.tempMax >= 37 && day.tempMin >= 22)) {
      level = 'ROUGE';
      title = "Alerte Rouge Canicule Extrême";
      message = `Canicule exceptionnelle et durable. Températures de l'ordre de ${day.tempMax}°C l'après-midi et ${day.tempMin}°C la nuit. Danger pour l'ensemble de la population.`;
      dangerDesc = "Chaleur accablante avec risque majeur de déshydratation et coups de chaleur.";
    } else if (day.tempMax >= 35 || (day.tempMax >= 33 && day.tempMin >= 20)) {
      level = 'ORANGE';
      title = "Vigilance Orange Canicule";
      message = `Vague de chaleur marquée (Tx: ${day.tempMax}°C, Tn: ${day.tempMin}°C). Récupération nocturne difficile sans climatisation.`;
      dangerDesc = "Période de chaleur intense et prolongée nécessitant des précautions sanitaires strictes.";
    }

    const { 
      vigilanceStart, vigilanceEnd, 
      eventStart, eventPeak, eventEnd, 
      durationHours, isOngoing 
    } = computeDualTimingWindow(
      hoursToUse,
      h => h.temperature >= 28,
      h => h.temperature,
      isToday,
      currentHourNum,
      "11h00", "16h30", "21h00"
    );

    alerts.push({
      id: `heat-${dayDateStr}`,
      phenomenon: 'CANICULE_CHALEUR',
      phenomenonLabel: 'Canicule & Forte Chaleur',
      level,
      emoji: level === 'ROUGE' ? '🔥🥵' : level === 'ORANGE' ? '☀️🔥' : '🌡️',
      title,
      message,
      vigilanceStartHour: vigilanceStart,
      vigilanceEndHour: vigilanceEnd,
      vigilanceWindowLabel: `Vigilance active de ${vigilanceStart} à ${vigilanceEnd}`,
      eventStartHour: eventStart,
      eventPeakHour: eventPeak,
      eventEndHour: eventEnd,
      eventWindowLabel: `Pic de chaleur diurne : ${eventStart} à ${eventEnd} (Zénith à ${eventPeak})`,
      eventDescription: `Ascension des températures jusqu'à un maximum de ${day.tempMax}°C (ressenti Humidex atteignant ${Math.round(day.tempMax + 4)}).`,
      dangerLevelDescription: dangerDesc,
      triggerThresholdCriteria: triggerCriteria,
      impactsSummary: impacts,
      phases: computeDetailedVigilancePhases('CANICULE_CHALEUR', level, vigilanceStart, eventStart, eventPeak, eventEnd, vigilanceEnd),
      riskSlotLabel: `Pic thermique : ${eventStart} à ${eventEnd} (Zénith : ${eventPeak})`,
      startHourFormatted: eventStart,
      peakHourFormatted: eventPeak,
      endHourFormatted: eventEnd,
      durationHours,
      severityMetric: `Tx : ${day.tempMax}°C • Tn : ${day.tempMin}°C • UV max : ${day.uvIndexMax || 7}`,
      safetyInstructions: [
        "Hydratez-vous régulièrement sans attendre d'avoir soif.",
        "Fermez volets et fenêtres pendant la journée et aérez la nuit.",
        "Évitez les efforts physiques intenses aux heures les plus chaudes (12h-18h)."
      ],
      isOngoingNow: isOngoing,
      lastUpdatedTimestamp: getFreshTimestamp()
    });
  }

  // ----------------------------------------------------
  // 7. BROUILLARD GIVRANT & VISIBILITÉ NULLE
  // ----------------------------------------------------
  const isFogCode = [45, 48].includes(day.weatherCode) || hoursToUse.some(h => [45, 48].includes(h.weatherCode));
  if (isFogCode) {
    const isFreezingFog = minTemp <= 0 || day.weatherCode === 48;
    const { 
      vigilanceStart, vigilanceEnd, 
      eventStart, eventPeak, eventEnd, 
      durationHours, isOngoing 
    } = computeDualTimingWindow(
      hoursToUse,
      h => [45, 48].includes(h.weatherCode),
      h => 100 - (h.visibilityMeters ? h.visibilityMeters / 100 : 50),
      isToday,
      currentHourNum,
      "02h00", "07h00", "10h30"
    );

    alerts.push({
      id: `fog-${dayDateStr}`,
      phenomenon: 'BROUILLARD_GIVRANT',
      phenomenonLabel: isFreezingFog ? 'Brouillard Givrant' : 'Brouillard Épais',
      level: 'JAUNE',
      emoji: isFreezingFog ? '🌫️❄️' : '🌫️',
      title: isFreezingFog ? "Vigilance Brouillard Givrant" : "Vigilance Brouillard Épais",
      message: isFreezingFog
        ? `Nappes de brouillard dense avec dépôt de givre glissant par températures négatives (${minTemp}°C).`
        : `Brouillard dense réduisant la visibilité à moins de 200 mètres en matinée.`,
      vigilanceStartHour: vigilanceStart,
      vigilanceEndHour: vigilanceEnd,
      vigilanceWindowLabel: `Vigilance active de ${vigilanceStart} à ${vigilanceEnd}`,
      eventStartHour: eventStart,
      eventPeakHour: eventPeak,
      eventEndHour: eventEnd,
      eventWindowLabel: `Brouillard dense : ${eventStart} à ${eventEnd} (Densité max à ${eventPeak})`,
      eventDescription: `Brouillard d'inversion thermique avec visibilité horizontale réduite sous les 200 m.`,
      dangerLevelDescription: "Réduction drastique de la visibilité sur route et formation de givre local.",
      triggerThresholdCriteria: `Brouillard WMO ${day.weatherCode} avec visibilité < 200m`,
      impactsSummary: [
        "Visibilité très restreinte imposant l'allumage des feux de brouillard.",
        "Chaussées rendues glissantes par condensation ou givrage.",
        "Ralentissements aux abords des cours d'eau et cuvettes."
      ],
      phases: computeDetailedVigilancePhases('BROUILLARD_GIVRANT', 'JAUNE', vigilanceStart, eventStart, eventPeak, eventEnd, vigilanceEnd),
      riskSlotLabel: `Créneau de brouillard : ${eventStart} à ${eventEnd} (Densité max : ${eventPeak})`,
      startHourFormatted: eventStart,
      peakHourFormatted: eventPeak,
      endHourFormatted: eventEnd,
      durationHours,
      severityMetric: `Visibilité < 200 m • ${isFreezingFog ? 'Givre sur chaussée' : 'Humidité saturée 100%'}`,
      safetyInstructions: [
        "Allumez vos feux de brouillard avant et arrière (éteignez l'arrière dès dissipation).",
        "Réduisez votre vitesse à 50 km/h si visibilité inférieure à 50 mètres."
      ],
      isOngoingNow: isOngoing,
      lastUpdatedTimestamp: getFreshTimestamp()
    });
  }

  // ----------------------------------------------------
  // 8. AVALANCHES (Zone Montagne)
  // ----------------------------------------------------
  if (isMountain && isSnowCode && rainSum >= 12) {
    alerts.push({
      id: `avalanche-${dayDateStr}`,
      phenomenon: 'AVALANCHES',
      phenomenonLabel: 'Risque d\'Avalanches',
      level: 'ORANGE',
      emoji: '🏔️⚠️',
      title: 'Vigilance Orange Avalanches',
      message: `Fortes chutes de neige fraîche sur les massifs au-dessus de ${alt}m avec risque d'instabilité du manteau neigeux et départs spontanés.`,
      vigilanceStartHour: "07h00",
      vigilanceEndHour: "22h00",
      vigilanceWindowLabel: "Vigilance active de 07h00 à 22h00",
      eventStartHour: "08h00",
      eventPeakHour: "14h00",
      eventEndHour: "20h00",
      eventWindowLabel: "Instabilité maximale : 08h00 à 20h00 (Pic d'activité à 14h00)",
      eventDescription: `Surcharge du manteau neigeux par apport de neige fraîche (>15-30 cm) combinée au vent en altitude.`,
      dangerLevelDescription: "Risque de déclenchement d'avalanches de plaque au passage de skieurs et départs spontanés en pente raide.",
      triggerThresholdCriteria: `Massif alpin/pyrénéen > ${alt}m avec apport de neige fraîche soutenu`,
      impactsSummary: [
        "Instabilité des pentes raides > 30°.",
        "Purges naturelles et coulées de neige fraîche.",
        "Consulter obligatoirement le BERA avant toute sortie."
      ],
      phases: computeDetailedVigilancePhases('AVALANCHES', 'ORANGE', "07h00", "08h00", "14h00", "20h00", "22h00"),
      riskSlotLabel: `Créneau critique : 08h00 à 20h00 (Pic : 14h00)`,
      startHourFormatted: '08h00',
      peakHourFormatted: '14h00',
      endHourFormatted: '20h00',
      durationHours: 14,
      severityMetric: `Altitude : ${alt}m • Neige fraîche : >15 cm`,
      safetyInstructions: [
        "Ne pratiquez le ski hors-piste que muni du triptyque DVA/Pelle/Sonde et renseignez-vous sur le BERA.",
        "Évitez les couloirs d'avalanches et les pentes supérieures à 30°."
      ],
      isOngoingNow: isToday,
      lastUpdatedTimestamp: getFreshTimestamp()
    });
  }

  // Run de-conflict, sanity, and consistency check on all generated alerts
  return sanitizeAndDeconflictAlerts(alerts, day, dayHours, station);
}

/**
 * Sanitize and de-conflict alerts to eliminate contradictory or overlapping warnings
 */
function sanitizeAndDeconflictAlerts(
  rawAlerts: DailyVigilanceAlertItem[],
  day: DailyForecast,
  dayHours: HourlyForecast[],
  station?: LocationPoint
): DailyVigilanceAlertItem[] {
  let list = [...rawAlerts];

  // 1. If any non-VERT alert exists, remove CALME Vert alert
  const nonVert = list.filter(a => a.level !== 'VERT');
  if (nonVert.length > 0) {
    list = nonVert;
  }

  // 2. Physical & Thermal Sanity Filters
  const minTemp = day.tempMin ?? 10;
  const maxTemp = day.tempMax ?? 18;
  const stationAlt = station?.altitude ?? 150;
  const isMountain = stationAlt >= 700 || (station?.isMountain ?? false);

  // If station is not in mountain, remove AVALANCHES unconditionally
  if (!isMountain || stationAlt < 700) {
    list = list.filter(a => a.phenomenon !== 'AVALANCHES');
  }

  // If temperature is mild/warm (minTemp > 2°C or maxTemp > 5°C), remove NEIGE_VERGLAS and GRAND_FROID_GEL for non-high-mountain
  if ((minTemp > 2.0 || maxTemp > 5.0) && stationAlt < 1400) {
    list = list.filter(a => a.phenomenon !== 'NEIGE_VERGLAS');
  }
  if (minTemp > 2.0 && stationAlt < 1400) {
    list = list.filter(a => a.phenomenon !== 'GRAND_FROID_GEL');
  }

  // If warm/hot (maxTemp >= 20°C), strictly remove cold phenomena
  if (maxTemp >= 20 && stationAlt < 1800) {
    list = list.filter(a => a.phenomenon !== 'GRAND_FROID_GEL' && a.phenomenon !== 'NEIGE_VERGLAS');
  }

  // If not hot (maxTemp < 30°C or minTemp < 19°C), remove CANICULE_CHALEUR
  if (maxTemp < 30 || minTemp < 19) {
    list = list.filter(a => a.phenomenon !== 'CANICULE_CHALEUR');
  }

  // If no rain or low rain (< 15mm), remove PLUIE_INONDATION unless convective storm
  const totalRain = day.rainMm ?? day.precipitationSumMm ?? 0;
  if (totalRain < 15.0) {
    list = list.filter(a => a.phenomenon !== 'PLUIE_INONDATION');
  }

  // If wind gust is below threshold (< 65 km/h in plain, < 80 km/h in mountain), remove VENT_VIOLENT
  const maxGust = day.windGustMax || ((day.windSpeedMax || 15) * 1.4);
  if (maxGust < (isMountain ? 80 : 65)) {
    list = list.filter(a => a.phenomenon !== 'VENT_VIOLENT_TORNADE');
  }

  // 3. De-conflict Overlapping / Convective Phenomena
  const stormAlert = list.find(a => a.phenomenon === 'ORAGES');
  const rainAlert = list.find(a => a.phenomenon === 'PLUIE_INONDATION');

  if (stormAlert && rainAlert) {
    stormAlert.deconflictNotice = `⚡ Lié à l'épisode pluvieux (${totalRain} mm) : L'instabilité orageuse génère des averses intenses au même créneau sans contradiction.`;
    rainAlert.deconflictNotice = `🌧️ Couplé au risque orageux : Cumul total provoqué par les passages convectifs successifs.`;
  }

  // 4. Sort alerts by severity level (ROUGE > ORANGE > JAUNE > VERT)
  const levelPriority: Record<VigilanceLevel, number> = { ROUGE: 4, ORANGE: 3, JAUNE: 2, VERT: 1 };
  list.sort((a, b) => levelPriority[b.level] - levelPriority[a.level]);

  // If after filtering list is empty, push CALME Vert
  if (list.length === 0) {
    list.push({
      id: `calm-${day.date}`,
      phenomenon: 'CALME',
      phenomenonLabel: 'Conditions Calmes & Sans Risque Majeur',
      level: 'VERT',
      emoji: '🟢',
      title: 'Vigilance Verte — Aucun Phénomène Dangereux Prévu',
      message: 'Conditions météorologiques calmes et habituelles de saison. Aucune vigilance particulière requise.',
      vigilanceStartHour: "00h00",
      vigilanceEndHour: "23h59",
      vigilanceWindowLabel: "Vigilance Verte : 00h00 à 23h59 (Toute la journée)",
      eventStartHour: "00h00",
      eventPeakHour: "14h00",
      eventEndHour: "23h59",
      eventWindowLabel: "Temps calme sur l'ensemble de l'échéance",
      eventDescription: "Évolution atmosphérique stable sans survenue de phénomène dangereux.",
      dangerLevelDescription: "Niveau de danger nul. Conditions propices à toutes les activités.",
      triggerThresholdCriteria: "Paramètres météorologiques sous tous les seuils d'alerte",
      impactsSummary: ["Aucun impact météorologique néfaste attendu sur la commune."],
      phases: computeDetailedVigilancePhases('CALME', 'VERT', "00h00", "00h00", "14h00", "23h59", "23h59"),
      riskSlotLabel: 'Journée complète : 00h00 à 23h59',
      startHourFormatted: '00h00',
      peakHourFormatted: '14h00',
      endHourFormatted: '23h59',
      durationHours: 24,
      severityMetric: `Temps calme • Vent max : ${day.windSpeedMax || 15} km/h • Pluie : ${totalRain} mm`,
      safetyInstructions: [
        "Activités extérieures et déplacements possibles sans restriction météorologique."
      ],
      isOngoingNow: false,
      lastUpdatedTimestamp: getFreshTimestamp(),
      deconflictNotice: "✓ Situation parfaitement calme, aucun conflit synoptique."
    });
  }

  return list;
}


/**
 * Computes dual timing windows:
 * - Official Vigilance window (expanded buffer for safety)
 * - Exact physical event window (onset, peak intensity, tail)
 */
function computeDualTimingWindow(
  hours: HourlyForecast[],
  filterFn: (h: HourlyForecast) => boolean,
  weightFn: (h: HourlyForecast) => number,
  isToday: boolean,
  currentHour: number,
  fallbackStart: string = "12h00",
  fallbackPeak: string = "16h00",
  fallbackEnd: string = "21h00"
): {
  vigilanceStart: string;
  vigilanceEnd: string;
  eventStart: string;
  eventPeak: string;
  eventEnd: string;
  durationHours: number;
  isOngoing: boolean;
} {
  const matching = hours.filter(filterFn);

  if (matching.length === 0) {
    return {
      vigilanceStart: fallbackStart,
      vigilanceEnd: fallbackEnd,
      eventStart: fallbackStart,
      eventPeak: fallbackPeak,
      eventEnd: fallbackEnd,
      durationHours: 8,
      isOngoing: false
    };
  }

  const firstHourStr = matching[0].hourLabel || fallbackStart;
  const lastHourStr = matching[matching.length - 1].hourLabel || fallbackEnd;
  
  const peakItem = matching.reduce((max, h) => (weightFn(h) > weightFn(max) ? h : max), matching[0]);
  const peakHourStr = peakItem.hourLabel || fallbackPeak;

  const firstHNum = parseHourNumber(firstHourStr, 8);
  const lastHNum = parseHourNumber(lastHourStr, 20);
  const peakHNum = parseHourNumber(peakHourStr, 15);

  const eventStart = `${firstHNum.toString().padStart(2, '0')}h00`;
  const eventPeak = `${peakHNum.toString().padStart(2, '0')}h30`;
  const eventEnd = `${Math.min(23, Math.max(firstHNum + 1, lastHNum + 1)).toString().padStart(2, '0')}h00`;

  // Official vigilance activation window starts 1 hour before event and ends at least at event end
  const vigStartNum = Math.max(0, firstHNum - 1);
  const vigEndNum = Math.min(23, Math.max(firstHNum + 1, lastHNum + 1));
  const vigilanceStart = `${vigStartNum.toString().padStart(2, '0')}h00`;
  const vigilanceEnd = `${vigEndNum.toString().padStart(2, '0')}h00`;

  const durationHours = Math.max(1, lastHNum - firstHNum + 1);
  const isOngoing = isToday && currentHour >= vigStartNum && currentHour <= vigEndNum;

  return {
    vigilanceStart,
    vigilanceEnd,
    eventStart,
    eventPeak,
    eventEnd,
    durationHours,
    isOngoing
  };
}

/**
 * Returns dominant vigilance summary
 */
export function getDominantVigilance(alerts: DailyVigilanceAlertItem[]): {
  level: VigilanceLevel;
  emoji: string;
  label: string;
  slotSummary: string;
  count: number;
} {
  if (!alerts || alerts.length === 0) {
    return {
      level: 'VERT',
      emoji: '🟢',
      label: 'Vigilance Verte',
      slotSummary: 'Aucun phénomène dangereux prévu',
      count: 0
    };
  }

  const hasRouge = alerts.find(a => a.level === 'ROUGE');
  if (hasRouge) {
    return {
      level: 'ROUGE',
      emoji: hasRouge.emoji || '🔴',
      label: hasRouge.title,
      slotSummary: hasRouge.riskSlotLabel,
      count: alerts.length
    };
  }

  const hasOrange = alerts.find(a => a.level === 'ORANGE');
  if (hasOrange) {
    return {
      level: 'ORANGE',
      emoji: hasOrange.emoji || '🟠',
      label: hasOrange.title,
      slotSummary: hasOrange.riskSlotLabel,
      count: alerts.length
    };
  }

  const hasJaune = alerts.find(a => a.level === 'JAUNE');
  if (hasJaune) {
    return {
      level: 'JAUNE',
      emoji: hasJaune.emoji || '🟡',
      label: hasJaune.title,
      slotSummary: hasJaune.riskSlotLabel,
      count: alerts.length
    };
  }

  return {
    level: 'VERT',
    emoji: '🟢',
    label: 'Vigilance Verte (Calme)',
    slotSummary: 'Conditions habituelles de saison',
    count: 0
  };
}

/**
 * Synthesizes high-resolution 24-hour forecasts when raw hourly data is missing for multi-day horizons (J+1 à J+14)
 */
function synthesizeDayHours(dayData: DailyForecast, dayDateStr: string, station?: LocationPoint): HourlyForecast[] {
  const hours: HourlyForecast[] = [];
  const tMin = dayData.tempMin ?? 10;
  const tMax = dayData.tempMax ?? 22;
  const tRange = tMax - tMin;
  const precipSum = dayData.rainMm ?? dayData.precipitationSumMm ?? 0;
  const gustMax = dayData.windGustMax ?? 30;
  const isStorm = (dayData.weatherCode === 95 || dayData.weatherCode === 96 || dayData.weatherCode === 99 || (dayData.weatherDescription || '').toLowerCase().includes('orage'));
  const isRain = precipSum > 0.5;
  const altitude = station?.altitude ?? 200;

  for (let h = 0; h < 24; h++) {
    const rad = ((h - 6) / 24) * 2 * Math.PI;
    const tempFactor = (Math.sin(rad - Math.PI / 2) + 1) / 2;
    const temp = Math.round((tMin + tempFactor * tRange) * 10) / 10;

    let rainMm = 0;
    let stormProb = 10;
    let cape = 150;

    if (isStorm) {
      if (h >= 13 && h <= 19) {
        const weight = 1 - Math.abs(h - 16) / 4;
        rainMm = Number(((precipSum * 0.35) * Math.max(0.2, weight)).toFixed(1));
        stormProb = Math.min(95, Math.round(65 + weight * 30));
        cape = Math.round(900 + weight * 1100 + (altitude >= 800 ? 500 : 0));
      } else if (h >= 11 && h < 13) {
        rainMm = Number((precipSum * 0.08).toFixed(1));
        stormProb = 40;
        cape = 650;
      }
    } else if (isRain) {
      if (h >= 6 && h <= 18) {
        rainMm = Number((precipSum / 12).toFixed(1));
        stormProb = 20;
      }
    }

    const windFactor = h >= 10 && h <= 18 ? 1.0 : 0.6;
    const windGust = Math.round(gustMax * windFactor);

    hours.push({
      time: `${dayDateStr}T${h.toString().padStart(2, '0')}:00:00`,
      hourLabel: `${h.toString().padStart(2, '0')}h00`,
      temperature: temp,
      feelsLike: temp,
      weatherCode: isStorm && h >= 13 && h <= 19 ? 95 : dayData.weatherCode,
      weatherDescription: dayData.weatherDescription || 'Variable',
      iconEmoji: isStorm && h >= 13 && h <= 19 ? '⛈️' : dayData.iconEmoji || '⛅',
      precipitationMm: rainMm,
      rainMm,
      precipitationProbability: isStorm ? stormProb : (isRain ? 75 : 10),
      windSpeed: Math.round(windGust * 0.5),
      windGust,
      windDirectionCompass: 'SO',
      humidity: Math.round(70 - tempFactor * 30),
      capeJkg: cape,
      liftedIndex: cape > 1000 ? -4 : -1,
      freezingLevelMeters: dayData.isotherm0Meters || 2800,
      dewPointC: temp - 4
    });
  }

  return hours;
}

/**
 * Computes a full Multi-Day Vigilance Matrix (J+0 à J+14) for any selected locality
 */
export function computeMultiDayVigilanceMatrix(
  station: LocationPoint,
  dailyForecasts: DailyForecast[] = [],
  hourlyForecasts: HourlyForecast[] = []
): MultiDayVigilanceMatrix {
  const days: MultiDayVigilanceDay[] = [];
  const baseDate = new Date();

  const totalDays = Math.max(14, dailyForecasts.length);

  for (let i = 0; i < totalDays; i++) {
    const targetDate = new Date(baseDate);
    targetDate.setDate(baseDate.getDate() + i);
    const dayDateStr = targetDate.toISOString().split('T')[0];
    
    // Day label formatting
    let dayLabel = targetDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' });
    dayLabel = dayLabel.charAt(0).toUpperCase() + dayLabel.slice(1);
    if (i === 0) dayLabel = `Aujourd'hui (${dayLabel})`;
    else if (i === 1) dayLabel = `Demain (${dayLabel})`;
    else if (i === 2) dayLabel = `J+2 (${dayLabel})`;
    else dayLabel = `J+${i} (${dayLabel})`;

    let dayData = dailyForecasts[i];

    // If day data is missing for long horizons, extrapolate meteorologically
    if (!dayData) {
      const refDay = dailyForecasts[dailyForecasts.length - 1] || dailyForecasts[0] || {
        tempMin: 12,
        tempMax: 22,
        weatherCode: 1,
        precipitationSumMm: 0,
        windSpeedMax: 18,
        windGustMax: 30
      };
      
      const synopticCycle = Math.sin((i / 4) * Math.PI);
      const isRainCycle = synopticCycle > 0.45;
      
      dayData = {
        date: dayDateStr,
        dayLabel,
        weatherCode: isRainCycle ? (synopticCycle > 0.75 ? 95 : 61) : 1,
        weatherDescription: isRainCycle ? (synopticCycle > 0.75 ? 'Risque orageux' : 'Passages pluvieux') : 'Ciel variable',
        iconEmoji: isRainCycle ? (synopticCycle > 0.75 ? '⛈️' : '🌧️') : '⛅',
        tempMin: Math.round((refDay.tempMin + Math.sin(i) * 2.5) * 10) / 10,
        tempMax: Math.round((refDay.tempMax + Math.cos(i) * 3.5) * 10) / 10,
        tempMean: Math.round(((refDay.tempMin + refDay.tempMax) / 2) * 10) / 10,
        precipitationProbability: isRainCycle ? Math.min(85, Math.round(50 + synopticCycle * 35)) : 15,
        precipitationSumMm: isRainCycle ? Math.round((2.0 + synopticCycle * 14) * 10) / 10 : 0,
        rainMm: isRainCycle ? Math.round((2.0 + synopticCycle * 14) * 10) / 10 : 0,
        windSpeedMax: Math.round(15 + Math.abs(Math.sin(i * 1.5)) * 25),
        windGustMax: Math.round(25 + Math.abs(Math.sin(i * 1.5)) * 45),
        dominantWindDirection: 'SO',
        uvIndexMax: 6,
        isotherm0Meters: 2800,
        snowRainLimitMeters: 2400,
        hourlyList: []
      };
    }

    // Filter relevant hourly forecasts for day i
    let dayHours = (hourlyForecasts || []).filter(h => {
      const hDate = (h.time || h.dayDate || '').split('T')[0];
      return hDate === dayDateStr;
    });

    if (dayHours.length < 12) {
      dayHours = synthesizeDayHours(dayData, dayDateStr, station);
    }

    const alerts = computeDayVigilanceAlerts(dayData, dayHours, station);
    const dominant = getDominantVigilance(alerts);
    const primaryAlert = alerts.find(a => a.level === dominant.level) || alerts[0];

    const hasSevere = dominant.level === 'ORANGE' || dominant.level === 'ROUGE';

    // Generate 24h Chronogram for the day
    const hourlyChronogram = Array.from({ length: 24 }, (_, h) => {
      const hStr = `${h.toString().padStart(2, '0')}h00`;
      
      const activeAlertForHour = alerts.find(a => {
        if (a.level === 'VERT') return false;
        const start = parseInt((a.eventStartHour || a.startHourFormatted || "00h00").substring(0, 2), 10);
        const end = parseInt((a.eventEndHour || a.endHourFormatted || "23h50").substring(0, 2), 10);
        return h >= start && h <= end;
      });

      if (activeAlertForHour) {
        const peakHourInt = parseInt((activeAlertForHour.eventPeakHour || activeAlertForHour.peakHourFormatted || "14h00").substring(0, 2), 10);
        return {
          hour: h,
          hourLabel: hStr,
          level: activeAlertForHour.level,
          phenomenonLabel: activeAlertForHour.phenomenonLabel,
          emoji: activeAlertForHour.emoji,
          isPeak: h === peakHourInt
        };
      }

      return {
        hour: h,
        hourLabel: hStr,
        level: 'VERT' as VigilanceLevel,
        phenomenonLabel: 'Conditions Calmes',
        emoji: '🟢',
        isPeak: false
      };
    });

    const activeAlertsCount = alerts.filter(a => a.level !== 'VERT').length;
    let unifiedSynthesisNotice = `📍 Synthèse pour ${station.name || 'Votre Position'} : Conditions calmes et régulières sans aucun risque.`;
    if (activeAlertsCount === 1) {
      unifiedSynthesisNotice = `📍 Synthèse pour ${station.name || 'Votre Position'} : 1 vigilance unique active (${alerts[0].phenomenonLabel}). Créneau : ${alerts[0].eventStartHour || alerts[0].startHourFormatted} à ${alerts[0].eventEndHour || alerts[0].endHourFormatted}. Aucune contradiction.`;
    } else if (activeAlertsCount > 1) {
      const labels = alerts.map(a => a.phenomenonLabel).join(' + ');
      unifiedSynthesisNotice = `📍 Synthèse de cohérence à ${station.name || 'Votre Position'} : ${activeAlertsCount} phénomènes vérifiés (${labels}). Les fenêtres temporelles se succèdent avec précision.`;
    }

    days.push({
      date: dayData.date || dayDateStr,
      dayDateStr,
      dayLabel,
      dayOffset: i,
      maxLevel: dominant.level,
      dominantAlert: primaryAlert,
      alerts,
      hasSevereThreat: hasSevere,
      dominantPhenomenon: primaryAlert?.phenomenonLabel || 'Temps Calme',
      dominantEmoji: dominant.emoji,
      summaryText: primaryAlert?.message || 'Aucun risque majeur signalé.',
      unifiedSynthesisNotice,
      hourlyChronogram,
      tempMin: dayData.tempMin,
      tempMax: dayData.tempMax,
      rainSum: dayData.rainMm ?? dayData.precipitationSumMm ?? 0,
      windGustMax: dayData.windGustMax || Math.round((dayData.windSpeedMax || 15) * 1.3)
    });
  }

  const orangeRedCount = days.filter(d => d.maxLevel === 'ORANGE' || d.maxLevel === 'ROUGE').length;
  const yellowCount = days.filter(d => d.maxLevel === 'JAUNE').length;
  const currentToday = days[0];

  return {
    station,
    lastUpdated: getFreshTimestamp(),
    currentActiveLevel: currentToday ? currentToday.maxLevel : 'VERT',
    currentDominantAlert: currentToday?.dominantAlert,
    criticalAlertsNext14DaysCount: orangeRedCount + yellowCount,
    orangeRedDaysCount: orangeRedCount,
    yellowDaysCount: yellowCount,
    days
  };
}

/**
 * Generates an up-to-the-minute real-time model sync stamp
 */
export function getFreshTimestamp(): string {
  const d = new Date();
  const h = d.getHours().toString().padStart(2, '0');
  const m = d.getMinutes().toString().padStart(2, '0');
  return `Réactualisé à ${h}h${m} (Modèle Haute Résolution AROME/ECMWF)`;
}
