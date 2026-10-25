/**
 * Bioclimatic & Thermo-Hygrometric Standards Engine
 * High-precision formulas for Perceived Temperature (Ressenti / Apparent Temperature),
 * Humidex (Environment Canada / MSC standard), Windchill (NOAA / JAG/TI standard),
 * Dew Point (Magnus-Tetens) and Heat Index (Rothfusz equation).
 */

export interface BioclimaticResult {
  /** Température de l'air sous abri (°C) */
  temperature: number;
  /** Humidité relative (%) */
  humidity: number;
  /** Vitesse du vent à 10m (km/h) */
  windSpeedKmH: number;
  /** Point de rosée exact (°C) */
  dewPoint: number;
  /** Pression de vapeur d'eau réelle (hPa) */
  vaporPressureHpa: number;
  /** Indice Humidex certifié (Service Météorologique du Canada) */
  humidex: number;
  /** Indice de refroidissement éolien Windchill (°C) (Formule OMM / NOAA / JAG/TI) */
  windChill: number;
  /** Température ressentie thermo-physiologique globale (°C) (Modèle Steadman unifié) */
  feelsLike: number;
  /** Écart entre la température ressentie et la température mesurée (°C) */
  deltaTemp: number;
  /** Évaluation qualitative du confort thermique */
  comfortLabel: string;
  /** Code couleur de sévérité */
  severityColor: string;
  /** Facteur dominant : 'HUMIDEX' | 'WINDCHILL' | 'NEUTRE' | 'SOLAIRE' */
  dominantFactor: 'HUMIDEX' | 'WINDCHILL' | 'NEUTRE' | 'SOLAIRE';
  /** Explication pédagogique pour l'utilisateur */
  explanation: string;
}

/**
 * 1. Calcul ultra-précis du Point de Rosée (Formule de Magnus-Tetens améliorée)
 * Précision ±0.1°C pour -40°C <= T <= 50°C
 */
export function calculateExactDewPoint(temperature: number, relativeHumidity: number): number {
  const rh = Math.min(100, Math.max(1, relativeHumidity));
  const a = 17.625;
  const b = 243.04;
  const alpha = ((a * temperature) / (b + temperature)) + Math.log(rh / 100);
  const dp = (b * alpha) / (a - alpha);
  return Math.round(dp * 10) / 10;
}

/**
 * 2. Pression partielle de vapeur d'eau réelle (e en hPa)
 * Formule de Tetens / Goff-Gratch
 */
export function calculateVaporPressureHpa(dewPoint: number): number {
  const e = 6.112 * Math.exp((17.67 * dewPoint) / (dewPoint + 243.5));
  return Number(e.toFixed(1));
}

/**
 * 3. Indice Humidex Officiel (Service Météorologique du Canada / MSC)
 * Formule : Humidex = T + (5/9) * (e - 10) où e est la pression de vapeur en hPa
 */
export function calculateExactHumidex(temperature: number, relativeHumidity: number, dewPoint?: number): number {
  const dp = dewPoint !== undefined ? dewPoint : calculateExactDewPoint(temperature, relativeHumidity);
  const e = calculateVaporPressureHpa(dp);
  
  // Formule officielle canadienne
  const rawHumidex = temperature + (5 / 9) * (e - 10);
  return Number(rawHumidex.toFixed(1));
}

/**
 * 4. Refroidissement Éolien (Windchill / WCT - Formule conjointe NOAA / Environnement Canada / OMM)
 * Formule JAG/TI : WCT = 13.12 + 0.6215*T - 11.37*(V^0.16) + 0.3965*T*(V^0.16) avec V en km/h
 */
export function calculateExactWindChill(temperature: number, windSpeedKmH: number): number {
  const v = Math.max(0, windSpeedKmH);
  
  // Le refroidissement éolien ne s'applique qu'en régime froid (T <= 10°C) et ventilé (V >= 4.8 km/h)
  if (temperature <= 10 && v >= 4.8) {
    const vPow = Math.pow(v, 0.16);
    const wc = 13.12 + (0.6215 * temperature) - (11.37 * vPow) + (0.3965 * temperature * vPow);
    return Number(wc.toFixed(1));
  }
  
  // Transition continue pour vent faible
  if (temperature <= 10 && v > 0 && v < 4.8) {
    const vPow = Math.pow(4.8, 0.16);
    const wcAtThreshold = 13.12 + (0.6215 * temperature) - (11.37 * vPow) + (0.3965 * temperature * vPow);
    const ratio = v / 4.8;
    const interpolated = temperature + ratio * (wcAtThreshold - temperature);
    return Number(interpolated.toFixed(1));
  }
  
  return Number(temperature.toFixed(1));
}

/**
 * 5. Heat Index (Indice de Chaleur US NOAA / Équation de Rothfusz)
 * Valable pour T >= 27°C et Humidité >= 40%
 */
export function calculateHeatIndex(temperatureC: number, relativeHumidity: number): number {
  const T = (temperatureC * 9) / 5 + 32; // Conversion Fahrenheit
  const RH = Math.min(100, Math.max(1, relativeHumidity));

  if (temperatureC < 20) return temperatureC;

  const simpleHI = 0.5 * (T + 61.0 + ((T - 68.0) * 1.2) + (RH * 0.094));
  let hiF = simpleHI;

  if (simpleHI >= 80) {
    hiF = -42.379 +
      2.04901523 * T +
      10.14333127 * RH -
      0.22475541 * T * RH -
      0.00683783 * T * T -
      0.05481717 * RH * RH +
      0.00122874 * T * T * RH +
      0.00085282 * T * RH * RH -
      0.00000199 * T * T * RH * RH;

    if (RH < 13 && T >= 80 && T <= 112) {
      const adj = ((13 - RH) / 4) * Math.sqrt((17 - Math.abs(T - 95.0)) / 17);
      hiF -= adj;
    } else if (RH > 85 && T >= 80 && T <= 87) {
      const adj = ((RH - 85) / 10) * ((87 - T) / 5);
      hiF += adj;
    }
  }

  const hiC = ((hiF - 32) * 5) / 9;
  return Number(hiC.toFixed(1));
}

/**
 * 6. Calcul Fiable & Unifié de la Température Ressentie (Apparent Temperature / Steadman Bio-meteorological Model)
 * Combine harmonieusement le modèle atmosphérique, le Windchill en hiver et l'Humidex/Heat-Index en été.
 */
export function calculateReliableFeelsLike(
  temperature: number,
  relativeHumidity: number,
  windSpeedKmH: number,
  solarRadiationWm2?: number,
  apiApparentTemp?: number | null
): number {
  const hum = Math.min(100, Math.max(5, relativeHumidity));
  const dp = calculateExactDewPoint(temperature, hum);
  const e = calculateVaporPressureHpa(dp);
  const vMs = Math.max(0, windSpeedKmH) / 3.6;
  const q = solarRadiationWm2 ?? 0;
  const solarFactor = q > 50 ? Math.min(2.5, (q / 1000) * 2.8) : 0;

  let calculated: number;

  // 1. Régime Froid (T <= 10°C) : Formule officielle conjointe JAG/TI Windchill
  if (temperature <= 10) {
    const wc = calculateExactWindChill(temperature, windSpeedKmH);
    // Atténuation douce par l'ensoleillement direct sur la peau
    calculated = Math.min(temperature + 1.0, wc + (solarFactor * 0.7));
  } 
  // 2. Régime Chaud (T >= 24°C) : Modèle combiné Humidex Canadien & Heat Index US
  else if (temperature >= 24) {
    const humidex = calculateExactHumidex(temperature, hum, dp);
    const windCooling = Math.min(3.5, 0.40 * Math.sqrt(vMs));
    // En été, humidité et rayonnement amplifient la sensation d'étouffement, tandis que la brise rafraîchit
    const warmFeels = humidex - windCooling + (solarFactor * 0.9);
    calculated = Math.max(temperature - 3.5, warmFeels);
  } 
  // 3. Zone Tempérée (10°C < T < 24°C) : Formule bioclimatique de Steadman (BoM Australia)
  // AT = T + 0.33 * e - 0.70 * v - 4.00 (+ rayonnement solaire)
  else {
    const steadmanAt = temperature + (0.33 * e) - (0.70 * vMs) - 4.00 + solarFactor;
    
    // Raccordement continu aux frontières pour éviter toute discontinuité
    if (temperature < 12) {
      // Transition douce avec le Windchill à 10°C
      const wcAt10 = calculateExactWindChill(10, windSpeedKmH);
      const ratio = (temperature - 10) / 2;
      calculated = (wcAt10 * (1 - ratio)) + (steadmanAt * ratio);
    } else if (temperature > 22) {
      // Transition douce avec l'Humidex à 24°C
      const humidexAt24 = calculateExactHumidex(24, hum, dp) - Math.min(3.5, 0.40 * Math.sqrt(vMs));
      const ratio = (temperature - 22) / 2;
      calculated = (steadmanAt * (1 - ratio)) + (humidexAt24 * ratio);
    } else {
      calculated = steadmanAt;
    }
  }

  // Si l'API fournit une valeur apparent_temperature, on l'utilise en pondération douce (25%) avec notre physique locale (75%)
  if (typeof apiApparentTemp === 'number' && !isNaN(apiApparentTemp) && Math.abs(apiApparentTemp - temperature) <= 18) {
    const blended = (calculated * 0.75) + (apiApparentTemp * 0.25);
    return Number(blended.toFixed(1));
  }

  return Number(calculated.toFixed(1));
}

/**
 * 7. Diagnostic complet et contextualisé de la biométéorologie
 */
export function getBioclimaticFullDiagnostic(
  temperature: number,
  relativeHumidity: number,
  windSpeedKmH: number,
  solarRadiationWm2?: number,
  apiApparentTemp?: number | null
): BioclimaticResult {
  const dewPoint = calculateExactDewPoint(temperature, relativeHumidity);
  const vaporPressureHpa = calculateVaporPressureHpa(dewPoint);
  const humidex = calculateExactHumidex(temperature, relativeHumidity, dewPoint);
  const windChill = calculateExactWindChill(temperature, windSpeedKmH);
  const feelsLike = calculateReliableFeelsLike(temperature, relativeHumidity, windSpeedKmH, solarRadiationWm2, apiApparentTemp);
  const deltaTemp = Number((feelsLike - temperature).toFixed(1));

  let dominantFactor: 'HUMIDEX' | 'WINDCHILL' | 'NEUTRE' | 'SOLAIRE' = 'NEUTRE';
  let comfortLabel = 'Confort thermique optimal';
  let severityColor = 'text-emerald-400';
  let explanation = 'Température et humidité en parfaite harmonie avec la régulation thermique du corps humain.';

  if (temperature <= 10 && windSpeedKmH >= 12 && deltaTemp <= -2) {
    dominantFactor = 'WINDCHILL';
    if (feelsLike <= -25) {
      comfortLabel = 'Refroidissement éolien extrême (Gelures rapides)';
      severityColor = 'text-violet-400';
      explanation = `Le vent soutenu (${windSpeedKmH} km/h) dissipe instantanément la couche d'air chaud protectrice cutanée. Risque de gelures en moins de 10 min.`;
    } else if (feelsLike <= -10) {
      comfortLabel = 'Grand froid mordant & vent vif';
      severityColor = 'text-cyan-400';
      explanation = `Vents à ${windSpeedKmH} km/h accentuant considérablement la déperdition thermique corporelle.`;
    } else {
      comfortLabel = 'Fraîcheur vive ventilée (Windchill)';
      severityColor = 'text-blue-400';
      explanation = `Sensation de froid plus vive que la température affichée sous abri sous l'effet du vent.`;
    }
  } else if (temperature >= 24 && humidex >= 30) {
    dominantFactor = 'HUMIDEX';
    if (humidex >= 54) {
      comfortLabel = 'Danger Mortel Immédiat (Coup de chaleur)';
      severityColor = 'text-rose-500';
      explanation = `Humidex critique de ${humidex}. L'évaporation de la sueur est bloquée par l'air saturé, surchauffe interne immédiate.`;
    } else if (humidex >= 46) {
      comfortLabel = 'Danger Extrême (Arrêt de tout effort)';
      severityColor = 'text-rose-400';
      explanation = `Humidex de ${humidex} provoquant un stress thermique majeur. Hydratation et ombre strictes requises.`;
    } else if (humidex >= 40) {
      comfortLabel = 'Inconfort Généralisé & Chaleur Lourde';
      severityColor = 'text-amber-400';
      explanation = `Atmosphère lourde et moite (Humidex ${humidex}). Éviter les efforts physiques intenses.`;
    } else {
      comfortLabel = 'Légère Moiteur & Chaleur Ressentie';
      severityColor = 'text-yellow-400';
      explanation = `L'humidité ambiante (${relativeHumidity}%) élève légèrement la sensation de chaleur par rapport à l'abri.`;
    }
  } else if (solarRadiationWm2 && solarRadiationWm2 > 600 && deltaTemp > 1.5) {
    dominantFactor = 'SOLAIRE';
    comfortLabel = 'Ensoleillement Direct Chaleureux';
    severityColor = 'text-amber-300';
    explanation = 'Le rayonnement solaire direct augmente la température ressentie en plein air.';
  }

  return {
    temperature,
    humidity: relativeHumidity,
    windSpeedKmH,
    dewPoint,
    vaporPressureHpa,
    humidex,
    windChill,
    feelsLike,
    deltaTemp,
    comfortLabel,
    severityColor,
    dominantFactor,
    explanation
  };
}
