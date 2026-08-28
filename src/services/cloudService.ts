import { LocationPoint, CloudDynamicsDetail, CloudHourlyStep } from '../types/weather';
import { getOctasFromPercent } from '../utils/weatherIcons';

/**
 * Computes multi-layer cloud dynamics, base/top heights, infrared temperatures and hourly evolution
 */
export function calculateCloudDynamics(
  station: LocationPoint,
  cloudCoverTotalPct: number,
  tempC: number,
  dewPointC: number,
  humidityPct: number,
  altitudeM: number,
  measuredLowPct?: number,
  measuredMidPct?: number,
  measuredHighPct?: number
): CloudDynamicsDetail {
  const safeTotal = Math.max(0, Math.min(100, Math.round(cloudCoverTotalPct)));
  const cloudCoverOctas = getOctasFromPercent(safeTotal);

  let cloudCoverLabel: CloudDynamicsDetail['cloudCoverLabel'] = 'Ciel pur';
  if (cloudCoverOctas === 8) cloudCoverLabel = 'Ciel couvert (8 octas)';
  else if (cloudCoverOctas >= 5) cloudCoverLabel = 'Très nuageux (5-7 octas)';
  else if (cloudCoverOctas >= 3) cloudCoverLabel = 'Éclaircies (3-4 octas)';
  else if (cloudCoverOctas >= 1) cloudCoverLabel = 'Peu nuageux (1-2 octas)';

  // Safe dew point (Td <= T)
  const safeDewPoint = Math.min(tempC, Number(dewPointC.toFixed(1)));

  // Lifted Condensation Level (LCL - Espy equation: LCL = 125 * (T - Td))
  const lclMeters = Math.max(150, Math.round(125 * Math.max(0.5, tempC - safeDewPoint)));
  const cloudCeilingMeters = Math.round(Math.max(200, lclMeters + altitudeM * 0.15));
  const cloudCeilingFeet = Math.round(cloudCeilingMeters * 3.28084);

  // Cloud layers decomposition (use measured values if available)
  const lowCoverPct = typeof measuredLowPct === 'number' ? Math.max(0, Math.min(100, Math.round(measuredLowPct))) : Math.round(Math.min(100, safeTotal * 0.75));
  const midCoverPct = typeof measuredMidPct === 'number' ? Math.max(0, Math.min(100, Math.round(measuredMidPct))) : Math.round(Math.min(100, safeTotal * 0.60));
  const highCoverPct = typeof measuredHighPct === 'number' ? Math.max(0, Math.min(100, Math.round(measuredHighPct))) : Math.round(Math.min(100, safeTotal * 0.45));

  // Low clouds
  const lowBaseM = Math.max(250, cloudCeilingMeters);
  const lowTopM = Math.min(2200, lowBaseM + 850);
  const lowClouds = {
    coverPct: lowCoverPct,
    baseMeters: lowBaseM,
    baseFeet: Math.round(lowBaseM * 3.28084),
    topMeters: lowTopM,
    topFlightLevel: Math.round(lowTopM / 30.48),
    mainTypes: ['Stratocumulus (Sc)', 'Cumulus fractus (Cu)', 'Stratus (St)'],
    description: `Étage inférieur dense à base ${lowBaseM}m AGL (${Math.round(lowBaseM * 3.28084)} ft) et sommet à ${lowTopM}m (FL0${Math.round(lowTopM / 30.48)}).`
  };

  // Mid clouds
  const midBaseM = 2800;
  const midTopM = 5400;
  const midClouds = {
    coverPct: midCoverPct,
    baseMeters: midBaseM,
    baseFeet: Math.round(midBaseM * 3.28084),
    topMeters: midTopM,
    topFlightLevel: Math.round(midTopM / 30.48),
    mainTypes: ['Altocumulus (Ac)', 'Altostratus (As)', 'Nimbostratus (Ns)'],
    description: `Étage moyen étendu entre ${midBaseM}m (FL0${Math.round(midBaseM / 30.48)}) et ${midTopM}m (FL${Math.round(midTopM / 30.48)}).`
  };

  // High clouds
  const highBaseM = 7500;
  const highTopM = 11200;
  const highClouds = {
    coverPct: highCoverPct,
    baseMeters: highBaseM,
    baseFeet: Math.round(highBaseM * 3.28084),
    topMeters: highTopM,
    topFlightLevel: Math.round(highTopM / 30.48),
    mainTypes: ['Cirrus fibratus (Ci)', 'Cirrostratus (Cs)', 'Cirrocumulus (Cc)'],
    description: `Étage supérieur glacé étiré jusqu'à ${highTopM}m (FL${Math.round(highTopM / 30.48)}) à température de -52°C.`
  };

  // Cloud Top Height & Infrared Temp
  const cloudTopHeightMaxMeters = cloudCoverTotalPct > 60 ? highTopM : midTopM;
  const cloudTopTempInfraredC = Number((tempC - (cloudTopHeightMaxMeters * 0.0065)).toFixed(1));

  // Optical thickness and solar transmission
  const cloudOpticalThicknessPct = Math.round(Math.min(95, cloudCoverTotalPct * 0.88 + 8));
  const directSolarTransmissionPct = Math.max(5, 100 - cloudOpticalThicknessPct);

  // Fog & Visibility
  let fogMistRisk: CloudDynamicsDetail['fogMistRisk'] = 'AUCUN';
  let visibilityKm = 25;
  if (humidityPct >= 96 && (tempC - dewPointC) <= 0.8) {
    fogMistRisk = 'BROUILLARD DENSE';
    visibilityKm = 0.4;
  } else if (humidityPct >= 90 && (tempC - dewPointC) <= 1.8) {
    fogMistRisk = 'BRUME LÉGÈRE';
    visibilityKm = 3.5;
  } else if (cloudCeilingMeters <= 350) {
    fogMistRisk = 'STRATUS PLAQUÉS';
    visibilityKm = 5.0;
  }

  // Dominant Family
  let dominantCloudFamily = 'Cumuliformes & Stratiformes mixtes';
  if (cloudCoverTotalPct < 20) dominantCloudFamily = 'Ciel dégagé / Cirrus fins isolés';
  else if (lowCoverPct > 70) dominantCloudFamily = 'Nappes de stratocumulus de basses couches';
  else if (midCoverPct > 60) dominantCloudFamily = 'Voile étendu d\'altostratus et altocumulus';

  // 24-Hour Evolution Simulation Steps
  const hourlyCloudEvolution: CloudHourlyStep[] = [];
  const currentHour = new Date().getHours();
  
  for (let i = 0; i < 24; i++) {
    const stepHour = (currentHour + i) % 24;
    const hourLabel = `${stepHour.toString().padStart(2, '0')}:00`;
    
    // diurnal cycle variation
    const diurnalFactor = Math.sin(((stepHour - 6) / 24) * 2 * Math.PI) * 15;
    const totalCover = Math.min(100, Math.max(5, Math.round(cloudCoverTotalPct + diurnalFactor + ((i % 5) - 2) * 3)));
    const lowCover = Math.min(100, Math.max(0, Math.round(totalCover * 0.7)));
    const midCover = Math.min(100, Math.max(0, Math.round(totalCover * 0.55)));
    const highCover = Math.min(100, Math.max(0, Math.round(totalCover * 0.4)));
    const baseH = Math.round(Math.max(250, cloudCeilingMeters + (stepHour >= 12 && stepHour <= 17 ? 400 : -200)));
    const topH = Math.round(Math.max(baseH + 600, cloudTopHeightMaxMeters - (stepHour < 6 ? 1500 : 0)));
    const optThick = Math.min(95, Math.round(totalCover * 0.85));
    const topTemp = Number((tempC - (topH * 0.0065)).toFixed(1));

    let emoji = '☀️';
    let wmo = 'Ciel dégagé et lumineux';
    if (totalCover >= 85) {
      emoji = '☁️';
      wmo = 'Ciel totalement couvert et sombre';
    } else if (totalCover >= 60) {
      emoji = '⛅';
      wmo = 'Ciel très nuageux avec rares éclaircies';
    } else if (totalCover >= 30) {
      emoji = '🌤️';
      wmo = 'Éclaircies et passages nuageux';
    }

    hourlyCloudEvolution.push({
      hourLabel,
      totalCoverPct: totalCover,
      lowCoverPct: lowCover,
      midCoverPct: midCover,
      highCoverPct: highCover,
      baseHeightMeters: baseH,
      topHeightMeters: topH,
      opticalThicknessPct: optThick,
      cloudTopTempC: topTemp,
      skyConditionEmoji: emoji,
      wmoDescription: wmo
    });
  }

  const nebulositySynthesis = `Nébulosité globale de ${cloudCoverTotalPct}% (${cloudCoverOctas}/8 octas). Base des nuages mesurée à ${cloudCeilingMeters} m (${cloudCeilingFeet} ft), sommet étiré jusqu'à ${cloudTopHeightMaxMeters} m (FL${Math.round(cloudTopHeightMaxMeters / 30.48)}) avec température sommitale de ${cloudTopTempInfraredC}°C. Atténuation solaire estimée à ${cloudOpticalThicknessPct}%.`;

  return {
    totalCloudCoverPct: cloudCoverTotalPct,
    cloudCoverOctas,
    cloudCoverLabel,
    cloudCeilingMeters,
    cloudCeilingFeet,
    liftedCondensationLevelLclMeters: lclMeters,
    cloudTopHeightMaxMeters,
    cloudTopTempInfraredC,
    cloudOpticalThicknessPct,
    directSolarTransmissionPct,
    lowClouds,
    midClouds,
    highClouds,
    dominantCloudFamily,
    fogMistRisk,
    visibilityKm,
    hourlyCloudEvolution,
    nebulositySynthesis
  };
}
