/**
 * Comprehensive Atmospheric & Mountain Isotherm Calculation Engine
 * 
 * Implements standard WMO and Météo-France mountain meteorology:
 * - Isotherme 0°C synoptique (Atmospheric Freezing Level in free air)
 * - Isotherme 0°C du thermomètre mouillé (Tw = 0°C / Wet Bulb Freezing Level)
 * - Limite Pluie-Neige (LPN) avec effet d'isothermie de précipitation (latent heat of fusion)
 * - Limite de Tenue au Sol de la neige (LTN)
 * - Gradient thermique vertical (sec / saturé)
 * - Profil altimétrique interactif et sonde de phase des hydrométéores
 */

export interface IsothermCalculationParams {
  stationAltitude: number;
  temperature: number;
  relativeHumidity?: number;
  precipitationMm?: number;
  modelFreezingHeight?: number | null;
  isNight?: boolean;
  month?: number;
  isValleyEnclosed?: boolean; // Encaissement orographique en fond de vallée
}

export interface IsothermComprehensiveDiagnostic {
  isotherm0Meters: number; // Isotherme 0°C en atmosphère libre (m)
  wetBulbZeroMeters: number; // Isotherme 0°C thermomètre mouillé Tw=0°C (m)
  snowRainLimitMeters: number; // Limite Pluie-Neige LPN (m)
  groundSnowLimitMeters: number; // Limite de tenue au sol LTN (m)
  deltaStationMeters: number; // Écart vertical par rapport à la station (m)
  isothermStatusLabel: string; // Libellé diagnostique précis
  isothermieRisk: boolean; // Risque d'abaissement brutal sous fortes précipitations
  isothermieDropMeters: number; // Abaissement thermique par fusion (m)
  mountainStage: string; // Étage altitudinal (Plaine, Collinéen, Montagnard, etc.)
  explanationText: string; // Synthèse vulgarisée et pédagogique
  meltingLayerThicknessMeters: number; // Épaisseur de la zone de fusion des flocons (m)
}

export interface AltitudePrecipitationProbeResult {
  targetAltitudeMeters: number;
  airTemperatureC: number;
  wetBulbTemperatureC: number;
  phaseId: 'PLUIE_LIQUIDE' | 'PLUIE_FROIDE' | 'PLUIE_NEIGE_MELEE' | 'NEIGE_LOURDE_HUMIDE' | 'NEIGE_DENSE' | 'NEIGE_SECHE_POUDREUSE' | 'GIVRE_RIME' | 'TEMPS_SEC';
  phaseLabel: string;
  phaseEmoji: string;
  phaseBadgeBg: string;
  phaseBadgeText: string;
  phaseBadgeBorder: string;
  snowWaterRatioCmPerMm: number; // Ex: 1.0 = 1mm donne 1cm, 1.3 = 1mm donne 1.3cm
  expectedSnowRateCmH: number; // Chute estimée en cm/h
  groundAccumulationRisk: 'NUL' | 'FAIBLE_FONTE' | 'TEMPORAIRE' | 'TENUE_RAPIDE' | 'FORTE_ACCUMULATION';
  groundAccumulationLabel: string;
  roadConditionDiagnostic: string;
  isInsideMeltingLayer: boolean;
  deltaToLpnMeters: number;
  deltaToIso0Meters: number;
}

/**
 * Calculates physical Isotherme 0°C (Freezing Level in free atmosphere, ASL)
 */
export function calculatePhysicalIsotherm0(params: IsothermCalculationParams): number {
  const alt = Math.max(0, params.stationAltitude || 0);
  const temp = params.temperature;
  const humidity = params.relativeHumidity ?? 65;
  const precip = params.precipitationMm ?? 0;

  // 1. If Open-Meteo provides a valid model sounding freezing level height
  if (
    params.modelFreezingHeight !== undefined && 
    params.modelFreezingHeight !== null && 
    !isNaN(params.modelFreezingHeight) && 
    params.modelFreezingHeight > 0
  ) {
    return Math.round(Math.min(5200, Math.max(0, params.modelFreezingHeight)));
  }

  // 2. Physics-based standard atmospheric calculation
  // Local moist vs dry lapse rate (°C per meter)
  const isMoist = precip > 0.3 || humidity >= 85;
  const lapseRate = isMoist ? 0.0055 : 0.0065; // ~0.55°C / 100m to 0.65°C / 100m

  if (temp <= 0) {
    // If station is already at or below 0°C
    // In standard atmosphere without strong inversion, 0°C level is below station
    const seaLevelEstimatedTemp = temp + (alt * 0.0065);
    if (seaLevelEstimatedTemp <= 0) {
      // Entire air column down to sea level is freezing
      return 0;
    }
    // Zero isotherm exists between sea level and station altitude
    return Math.round(Math.max(0, Math.min(alt, seaLevelEstimatedTemp / 0.0065)));
  }

  // Positive temperature at station: 0°C isotherm is above station
  const calculatedHeight = alt + (temp / lapseRate);
  return Math.round(Math.min(5200, Math.max(0, calculatedHeight)));
}

/**
 * Calculates Wet-Bulb Zero Altitude (Tw = 0°C)
 * When air is dry (RH < 100%), evaporating hydrometeors cool the air column towards Tw.
 */
export function calculateWetBulbZero(
  isotherm0: number, 
  temperature: number, 
  relativeHumidity: number = 65
): number {
  const clampedRh = Math.min(100, Math.max(15, relativeHumidity));
  // In dry air, the wet bulb 0°C level is lower by ~12 to 16m per % of humidity deficit
  const depressionMeters = Math.round((100 - clampedRh) * 13.5);
  return Math.max(0, isotherm0 - depressionMeters);
}

/**
 * Calculates Snow-Rain Limit (LPN - Limite Pluie-Neige)
 * Snowflakes start melting below the wet-bulb 0°C level.
 * Under heavy precipitation, melting snowflake latent heat extracts 334 kJ/kg,
 * pulling the 0°C isotherm and LPN down by 200m to 480m into valleys (isothermie de précipitation).
 */
export function calculateSnowRainLimit(
  isotherm0: number,
  wetBulbZero: number,
  precipitationMm: number = 0,
  temperature: number = 10,
  stationAltitude: number = 200,
  isValleyEnclosed: boolean = false
): number {
  // If ground/station temperature is already <= 1.2°C, snow falls down to or below station altitude
  if (temperature <= 1.2) {
    const subZeroOffset = temperature <= 0 ? 300 : 150;
    return Math.max(0, stationAltitude - subZeroOffset);
  }

  // Base melting layer in stable air: snowflakes survive ~200m to 320m below Tw=0°C before complete liquefaction
  const baseMeltingLayer = precipitationMm > 1.5 ? 220 : 300;
  let lpn = Math.max(0, wetBulbZero - baseMeltingLayer);

  // Isothermie de précipitation: latent heat cooling under moderate to heavy rain/snow
  let isothermieDrop = 0;
  if (precipitationMm >= 6.0) {
    isothermieDrop = 420;
  } else if (precipitationMm >= 3.0) {
    isothermieDrop = 280;
  } else if (precipitationMm >= 1.2) {
    isothermieDrop = 160;
  } else if (precipitationMm >= 0.4) {
    isothermieDrop = 80;
  }

  // Orographic valley constriction amplification (air confinement in alpine valleys)
  if (isValleyEnclosed && isothermieDrop > 0) {
    isothermieDrop = Math.round(isothermieDrop * 1.35);
  }

  lpn = Math.max(0, lpn - isothermieDrop);

  return Math.min(isotherm0, lpn);
}

/**
 * Calculates Ground Snow Limit (LTN - Limite de Tenue au Sol)
 * For snow to accumulate on ground surfaces, ground/air temperature must be <= +0.5°C.
 * The LTN is usually situated ~120m to 200m above the LPN.
 */
export function calculateGroundSnowLimit(
  snowRainLimit: number,
  isotherm0: number
): number {
  return Math.max(snowRainLimit, Math.min(isotherm0, snowRainLimit + 160));
}

/**
 * Returns comprehensive diagnostic object with French meteorological descriptions
 */
export function getIsothermComprehensiveDiagnostic(
  params: IsothermCalculationParams
): IsothermComprehensiveDiagnostic {
  const stationAlt = Math.max(0, params.stationAltitude || 0);
  const temp = params.temperature;
  const humidity = params.relativeHumidity ?? 65;
  const precip = params.precipitationMm ?? 0;
  const isEnclosed = params.isValleyEnclosed ?? (stationAlt > 300 && stationAlt < 1200);

  const isotherm0 = calculatePhysicalIsotherm0(params);
  const wetBulbZero = calculateWetBulbZero(isotherm0, temp, humidity);
  const snowRainLimit = calculateSnowRainLimit(isotherm0, wetBulbZero, precip, temp, stationAlt, isEnclosed);
  const groundSnowLimit = calculateGroundSnowLimit(snowRainLimit, isotherm0);

  const deltaStation = Math.round(isotherm0 - stationAlt);
  const isothermieDrop = precip >= 5.0 ? 450 : precip >= 2.5 ? 300 : precip >= 1.0 ? 150 : 0;
  const isIsothermieRisk = precip >= 1.5 && deltaStation > 0 && deltaStation < 1600;
  const meltingLayerThickness = Math.max(50, Math.round(isotherm0 - snowRainLimit));

  // Altitude Stage
  let mountainStage = "Étage de Plaine & Basse Vallée (< 300 m)";
  if (isotherm0 >= 4000) {
    mountainStage = "Au-dessus des très hauts sommets alpins (> 4 000 m)";
  } else if (isotherm0 >= 3000) {
    mountainStage = "Étage Nival / Hauts Sommets Alpins (3 000 - 4 000 m)";
  } else if (isotherm0 >= 2200) {
    mountainStage = "Étage Alpin / Grands Cols (2 200 - 3 000 m)";
  } else if (isotherm0 >= 1600) {
    mountainStage = "Étage Subalpin (1 600 - 2 200 m)";
  } else if (isotherm0 >= 1000) {
    mountainStage = "Moyenne Montagne (1 000 - 1 600 m)";
  } else if (isotherm0 >= 500) {
    mountainStage = "Étage Collinéen / Coteaux (500 - 1 000 m)";
  } else if (isotherm0 > 0) {
    mountainStage = "Basse Altitude / Vallées (< 500 m)";
  } else {
    mountainStage = "Gel généralisé jusqu'au niveau de la mer (0 m)";
  }

  // Precise French diagnostic status label
  let isothermStatusLabel = `+${deltaStation} m au-dessus de la station`;
  if (deltaStation <= -100) {
    isothermStatusLabel = `Sous 0°C (${Math.abs(deltaStation)} m sous le seuil de gel)`;
  } else if (deltaStation <= 50 && deltaStation >= -100) {
    isothermStatusLabel = "Au niveau du sol / Affleurant la station";
  } else if (deltaStation > 50 && deltaStation <= 300) {
    isothermStatusLabel = `Légèrement au-dessus (+${deltaStation} m sur les coteaux)`;
  } else if (isotherm0 >= 4000) {
    isothermStatusLabel = `Très haute altitude (+${deltaStation} m, sommets alpins)`;
  }

  // Educational synthetic explanation
  let explanationText = "";
  if (temp <= 0) {
    explanationText = `Masse d'air gelée au niveau du sol (${temp}°C). Le niveau 0°C se situe à ${isotherm0} m. Tout précipité tombera sous forme de neige seule dès ${groundSnowLimit} m avec tenue immédiate.`;
  } else if (deltaStation > 2500) {
    explanationText = `Masse d'air très douce et chaude en altitude : isotherme 0°C haut perché à ${isotherm0} m (${mountainStage}). Fonte rapide des neiges résiduelles.`;
  } else if (isIsothermieRisk) {
    explanationText = `Attention : sous les fortes précipitations en cours (${precip} mm/h), le refroidissement par fusion (isothermie) abaisse la limite pluie-neige de ${isothermieDrop} m, touchant le secteur dès ${snowRainLimit} m (tenue au sol dès ${groundSnowLimit} m).`;
  } else {
    explanationText = `Isotherme 0°C synoptique calé à ${isotherm0} m (${deltaStation > 0 ? '+' : ''}${deltaStation} m par rapport au sol de ${stationAlt} m). Limite pluie-neige estimée à ${snowRainLimit} m et tenue au sol à ${groundSnowLimit} m.`;
  }

  return {
    isotherm0Meters: isotherm0,
    wetBulbZeroMeters: wetBulbZero,
    snowRainLimitMeters: snowRainLimit,
    groundSnowLimitMeters: groundSnowLimit,
    deltaStationMeters: deltaStation,
    isothermStatusLabel,
    isothermieRisk: isIsothermieRisk,
    isothermieDropMeters: isothermieDrop,
    mountainStage,
    explanationText,
    meltingLayerThicknessMeters: meltingLayerThickness
  };
}

/**
 * Interactive Altitude Precipitation Phase Prober
 * Given a target altitude (e.g., from an interactive slider 0-4000m),
 * estimates the exact local temperature, precipitation microphysics phase,
 * accumulation rate, and driving/hiking safety diagnostics.
 */
export function probeAltitudePrecipitationPhase(
  targetAltitude: number,
  stationAltitude: number,
  stationTemp: number,
  stationHumidity: number = 65,
  precipitationMm: number = 0,
  isotherm0Meters?: number,
  snowRainLimitMeters?: number
): AltitudePrecipitationProbeResult {
  const targetAlt = Math.max(0, Math.min(4500, Math.round(targetAltitude)));
  const stationAlt = Math.max(0, Math.round(stationAltitude));
  const altDiff = targetAlt - stationAlt;

  // Lapse rate: saturated under rain/clouds (0.55°C/100m), dry otherwise (0.65°C/100m)
  const isMoist = precipitationMm > 0.1 || stationHumidity >= 80;
  const lapseRate = isMoist ? 0.0055 : 0.0065;
  const airTemp = Number((stationTemp - (altDiff * lapseRate)).toFixed(1));

  // Wet bulb estimation at probed altitude
  const targetHum = Math.min(100, Math.max(30, stationHumidity + (altDiff > 0 ? Math.round(altDiff * 0.008) : 0)));
  const wetBulb = Number((airTemp * Math.atan(0.151977 * Math.pow(targetHum + 8.313659, 0.5)) + Math.atan(airTemp + targetHum) - Math.atan(targetHum - 1.676331) + 0.00391838 * Math.pow(targetHum, 1.5) * Math.atan(0.023101 * targetHum) - 4.686035).toFixed(1));

  const iso0 = isotherm0Meters ?? calculatePhysicalIsotherm0({
    stationAltitude: stationAlt,
    temperature: stationTemp,
    relativeHumidity: stationHumidity,
    precipitationMm
  });

  const lpn = snowRainLimitMeters ?? calculateSnowRainLimit(
    iso0,
    calculateWetBulbZero(iso0, stationTemp, stationHumidity),
    precipitationMm,
    stationTemp,
    stationAlt
  );

  const deltaToLpn = targetAlt - lpn;
  const deltaToIso0 = targetAlt - iso0;
  const hasPrecip = precipitationMm > 0.05;

  let phaseId: AltitudePrecipitationProbeResult['phaseId'] = 'TEMPS_SEC';
  let phaseLabel = "Temps sec (Pas de précipitation)";
  let phaseEmoji = "☀️";
  let phaseBadgeBg = "bg-slate-900";
  let phaseBadgeText = "text-slate-300";
  let phaseBadgeBorder = "border-slate-800";
  let snowRatio = 1.0;
  let groundRisk: AltitudePrecipitationProbeResult['groundAccumulationRisk'] = 'NUL';
  let groundLabel = "Pas de neige au sol";
  let roadDiag = "Chaussée sèche ou simplement humide";

  if (!hasPrecip) {
    if (airTemp <= -5.0) {
      phaseId = 'TEMPS_SEC';
      phaseLabel = `Temps sec et grand froid (${airTemp}°C)`;
      phaseEmoji = "🧊";
      phaseBadgeBg = "bg-indigo-950/80";
      phaseBadgeText = "text-indigo-200";
      phaseBadgeBorder = "border-indigo-500/40";
      groundRisk = 'NUL';
      groundLabel = "Sol sec et gelé";
      roadDiag = "Gelée blanche possible à l'ombre et sur ponts";
    } else if (airTemp <= 0.0) {
      phaseId = 'TEMPS_SEC';
      phaseLabel = `Temps sec sous 0°C (${airTemp}°C)`;
      phaseEmoji = "❄️";
      phaseBadgeBg = "bg-blue-950/80";
      phaseBadgeText = "text-blue-200";
      phaseBadgeBorder = "border-blue-500/30";
      groundRisk = 'NUL';
      groundLabel = "Sol froid / gelé";
      roadDiag = "Risque de verglas résiduel";
    } else {
      phaseId = 'TEMPS_SEC';
      phaseLabel = `Temps sec (${airTemp}°C)`;
      phaseEmoji = "🌤️";
      phaseBadgeBg = "bg-slate-900/80";
      phaseBadgeText = "text-slate-300";
      phaseBadgeBorder = "border-slate-800";
      groundRisk = 'NUL';
      groundLabel = "Sol sec";
      roadDiag = "Chaussée dégagée et sèche";
    }
  } else {
    // Precipitation is falling!
    if (airTemp > 3.5 && deltaToLpn < -250) {
      phaseId = 'PLUIE_LIQUIDE';
      phaseLabel = `Pluie liquide tiède (${airTemp}°C)`;
      phaseEmoji = "🌧️";
      phaseBadgeBg = "bg-blue-950/80";
      phaseBadgeText = "text-blue-300";
      phaseBadgeBorder = "border-blue-500/40";
      snowRatio = 0;
      groundRisk = 'NUL';
      groundLabel = "Aucune tenue de neige";
      roadDiag = "Chaussée détrempée / Risque d'aquaplaning";
    } else if (airTemp > 1.8 && deltaToLpn < 0) {
      phaseId = 'PLUIE_FROIDE';
      phaseLabel = `Pluie froide soutenue (${airTemp}°C)`;
      phaseEmoji = "🌧️💧";
      phaseBadgeBg = "bg-sky-950/80";
      phaseBadgeText = "text-sky-200";
      phaseBadgeBorder = "border-sky-500/40";
      snowRatio = 0;
      groundRisk = 'NUL';
      groundLabel = "Sol détrempé très froid";
      roadDiag = "Chaussée très froide et glissante";
    } else if (airTemp > 0.8 || (deltaToLpn >= -100 && deltaToLpn <= 100)) {
      phaseId = 'PLUIE_NEIGE_MELEE';
      phaseLabel = `Pluie et neige mêlées / Isothermie active (${airTemp}°C)`;
      phaseEmoji = "🌨️💧";
      phaseBadgeBg = "bg-cyan-950/90";
      phaseBadgeText = "text-cyan-200";
      phaseBadgeBorder = "border-cyan-400/50";
      snowRatio = 0.5;
      groundRisk = 'FAIBLE_FONTE';
      groundLabel = "Bouillie neigeuse temporaire / Fonte immédiate";
      roadDiag = "Pellicule grasse et boueuse, adhérence dégradée";
    } else if (airTemp > 0.0 || (deltaToLpn > 100 && deltaToLpn <= 300)) {
      phaseId = 'NEIGE_LOURDE_HUMIDE';
      phaseLabel = `Neige lourde, humide & collante (${airTemp}°C)`;
      phaseEmoji = "🌨️❄️";
      phaseBadgeBg = "bg-teal-950/90";
      phaseBadgeText = "text-teal-200";
      phaseBadgeBorder = "border-teal-400/50";
      snowRatio = 0.9;
      groundRisk = 'TEMPORAIRE';
      groundLabel = "Tenue progressive sur herbe et bas-côtés";
      roadDiag = "Neige fondante sur chaussée, pneus hiver vivement recommandés";
    } else if (airTemp >= -3.5) {
      phaseId = 'NEIGE_DENSE';
      phaseLabel = `Chutes de neige dense & tenue au sol (${airTemp}°C)`;
      phaseEmoji = "❄️⛄";
      phaseBadgeBg = "bg-blue-900/90";
      phaseBadgeText = "text-white font-bold";
      phaseBadgeBorder = "border-blue-400";
      snowRatio = 1.1;
      groundRisk = 'TENUE_RAPIDE';
      groundLabel = "Tenue immédiate sur toutes les surfaces";
      roadDiag = "Chaussée blanche enneigée, équipements spéciaux obligatoires";
    } else if (airTemp < -10.0 && targetAlt >= 2500) {
      phaseId = 'GIVRE_RIME';
      phaseLabel = `Neige poudreuse ultra-froide & givre de crête (${airTemp}°C)`;
      phaseEmoji = "❄️✨";
      phaseBadgeBg = "bg-purple-950/90";
      phaseBadgeText = "text-purple-200 font-bold";
      phaseBadgeBorder = "border-purple-400/60";
      snowRatio = 1.4;
      groundRisk = 'FORTE_ACCUMULATION';
      groundLabel = "Accumulation rapide de poudreuse volatile";
      roadDiag = "Conditions hivernales extrêmes / Congères et visibilité nulle";
    } else {
      phaseId = 'NEIGE_SECHE_POUDREUSE';
      phaseLabel = `Neige sèche, légère & poudreuse (${airTemp}°C)`;
      phaseEmoji = "❄️🏔️";
      phaseBadgeBg = "bg-indigo-950/90";
      phaseBadgeText = "text-cyan-100 font-bold";
      phaseBadgeBorder = "border-cyan-400/60";
      snowRatio = 1.3;
      groundRisk = 'FORTE_ACCUMULATION';
      groundLabel = "Excellente neige poudreuse de qualité supérieure";
      roadDiag = "Route totalement enneigée, chaînes ou chaussettes requises";
    }
  }

  const expectedSnowRate = Number((precipitationMm * snowRatio).toFixed(1));
  const isInsideMelting = Math.abs(deltaToIso0) <= 250;

  return {
    targetAltitudeMeters: targetAlt,
    airTemperatureC: airTemp,
    wetBulbTemperatureC: wetBulb,
    phaseId,
    phaseLabel,
    phaseEmoji,
    phaseBadgeBg,
    phaseBadgeText,
    phaseBadgeBorder,
    snowWaterRatioCmPerMm: snowRatio,
    expectedSnowRateCmH: expectedSnowRate,
    groundAccumulationRisk: groundRisk,
    groundAccumulationLabel: groundLabel,
    roadConditionDiagnostic: roadDiag,
    isInsideMeltingLayer: isInsideMelting,
    deltaToLpnMeters: deltaToLpn,
    deltaToIso0Meters: deltaToIso0
  };
}

