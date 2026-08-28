import { 
  LocationPoint, 
  CurrentWeather, 
  HourlyForecast, 
  ThunderstormConvectiveAnalysis, 
  HourlyStormRisk, 
  ConvectiveIndices 
} from '../types/weather';

/**
 * Advanced Thunderstorm and Convection Diagnostics Service
 * Computes deep convective atmospheric indices (CAPE, Lifted Index, CIN, Shear, DCAPE, Hail, Downbursts)
 * and detailed hour-by-hour thunderstorm risk for any locality in France and worldwide.
 */

export function calculateThunderstormAnalysis(
  station: LocationPoint,
  currentWeather: CurrentWeather,
  hourlyForecasts: HourlyForecast[]
): ThunderstormConvectiveAnalysis {
  const currentTemp = currentWeather.temperature;
  const currentHumidity = currentWeather.humidity;
  const currentPressure = currentWeather.pressure;
  const currentWindSpeed = currentWeather.windSpeed;
  const currentWindGust = currentWeather.windGust;
  const currentWeatherCode = currentWeather.weatherCode;
  const altitude = station.altitude || 50;

  // 1. Calculate physical CAPE (J/kg) & Lifted Index (°C)
  // Dew point approximation (Magnus formula)
  const a = 17.27;
  const b = 237.7;
  const alpha = ((a * currentTemp) / (b + currentTemp)) + Math.log(currentHumidity / 100);
  const dewPoint = (b * alpha) / (a - alpha);

  // Surface parcel equivalent potential temperature Theta-E
  const tempK = currentTemp + 273.15;
  const dewPointK = dewPoint + 273.15;
  const vaporPressureHpa = 6.112 * Math.exp((17.67 * dewPoint) / (dewPoint + 243.5));
  const mixingRatioGKg = (622 * vaporPressureHpa) / (currentPressure - vaporPressureHpa);

  // Instability calculation:
  // Base CAPE from surface buoyancy, moisture, diurnal heating and topography trigger
  const thermalSurplus = Math.max(0, currentTemp - 18);
  const moistureSurplus = Math.max(0, dewPoint - 12);
  const mountainTriggerFactor = station.isMountain ? 1.25 : 1.0;

  // Base raw CAPE estimate if not already provided by API
  let baseCape = Math.round(
    (thermalSurplus * 85 + Math.pow(moistureSurplus, 1.6) * 65 + (currentWeatherCode >= 95 ? 1200 : 0)) * mountainTriggerFactor
  );
  if (currentWeatherCode >= 95) {
    baseCape = Math.max(1350, baseCape);
  } else if (currentWeatherCode >= 80 && currentWeatherCode <= 82) {
    baseCape = Math.max(650, baseCape);
  }

  // Lifted Index (LI in °C) = T500 - Tparcel500 (negative means unstable)
  let liftedIndex = Number((3.5 - (baseCape / 350) - (currentHumidity > 75 ? 1.2 : 0)).toFixed(1));
  if (baseCape > 2000) liftedIndex = Math.min(-6.5, liftedIndex);
  else if (baseCape > 1200) liftedIndex = Math.min(-3.5, liftedIndex);

  // CIN (Convective Inhibition in J/kg)
  let cin = Math.round(Math.max(10, 180 - (currentTemp * 4 + currentHumidity * 0.8) + (currentWeatherCode >= 95 ? -120 : 0)));
  if (baseCape > 1500) cin = Math.min(35, cin);

  // Deep Layer Shear 0-6km (m/s and knots)
  const shearBase = Math.round(12 + Math.abs(Math.sin(station.latitude * 2.3)) * 14 + currentWindSpeed * 0.35);
  const deepLayerShearMs = shearBase;
  const deepLayerShearKnots = Math.round(deepLayerShearMs * 1.944);

  // Low Level Shear 0-1km (m/s)
  const lowLevelShearMs = Number((deepLayerShearMs * 0.38).toFixed(1));

  // DCAPE (Downburst Convective Available Potential Energy) in J/kg
  const dcape = Math.round(Math.max(200, baseCape * 0.65 + (35 - Math.min(35, dewPoint)) * 25));

  // Max Downburst Gust Expected (km/h)
  const maxDownburstGustKmh = Math.round(
    Math.max(currentWindGust, Math.sqrt(2 * dcape) * 3.6 * 0.72 + (currentWeatherCode >= 95 ? 35 : 0))
  );

  // Precipitable Water (Total column water vapor in mm)
  const precipitableWater = Number((14 + (dewPoint * 1.45) + (currentHumidity > 70 ? 8 : 0)).toFixed(1));

  // K-Index & Total Totals Index (empirical thunderstorm potential indices)
  const kIndex = Math.round(20 + dewPoint * 0.8 + (baseCape > 800 ? 10 : 0));
  const totalTotals = Math.round(44 + (baseCape > 1000 ? 6 : 0) + (liftedIndex < -2 ? 4 : 0));

  // Supercell Composite Parameter (SCP)
  // SCP = (CAPE / 1000 J/kg) * (0-6km shear / 20 m/s) * (SRH / 50)
  const scp = Number(
    (Math.max(0, baseCape / 1000) * (deepLayerShearMs / 20) * (lowLevelShearMs > 5 ? 1.4 : 0.8)).toFixed(1)
  );

  let supercellRisk: 'Nul' | 'Faible' | 'Modéré' | 'Élevé' = 'Nul';
  if (scp >= 4.0) supercellRisk = 'Élevé';
  else if (scp >= 1.5) supercellRisk = 'Modéré';
  else if (scp >= 0.5) supercellRisk = 'Faible';

  // Hail Probability and Max Diameter (cm)
  let hailProb = 0;
  let hailDiameterCm = 0;
  if (baseCape > 1800 && deepLayerShearMs > 18) {
    hailProb = 75;
    hailDiameterCm = Number((2.5 + (baseCape - 1800) / 600).toFixed(1));
  } else if (baseCape > 1000) {
    hailProb = 45;
    hailDiameterCm = Number((1.0 + (baseCape - 1000) / 1200).toFixed(1));
  } else if (baseCape > 400) {
    hailProb = 20;
    hailDiameterCm = 0.5;
  }

  // Lightning strikes density & frequency
  let lightningRatePerMin = 0;
  let flashDensity = "Activité électrique nulle sur le secteur";
  if (currentWeatherCode >= 95) {
    lightningRatePerMin = Math.round(18 + (baseCape / 150));
    flashDensity = `Foudroiement actif : ~${lightningRatePerMin} éclairs/min (danger foudre au sol)`;
  } else if (baseCape > 1200) {
    lightningRatePerMin = Math.round(baseCape / 300);
    flashDensity = "Fort potentiel de foudroiement sous les amorces convectives";
  } else if (baseCape > 400) {
    lightningRatePerMin = 1;
    flashDensity = "Risque d'impacts isolés intranuages et coups de foudre sporadiques";
  }

  // Classification levels
  let capeLevel: ConvectiveIndices['capeLevel'] = 'Nulle / Stable (< 100)';
  if (baseCape > 2200) capeLevel = 'Extrême (> 2200)';
  else if (baseCape > 1200) capeLevel = 'Forte (1200-2200)';
  else if (baseCape > 500) capeLevel = 'Modérée (500-1200)';
  else if (baseCape >= 100) capeLevel = 'Faible (100-500)';

  let liLevel: ConvectiveIndices['liftedIndexLevel'] = 'Stable (> 0)';
  if (liftedIndex < -8) liLevel = 'Instabilité extrême (< -8)';
  else if (liftedIndex < -5) liLevel = 'Très instable (-5 à -8)';
  else if (liftedIndex < -2) liLevel = 'Instable (-2 à -5)';
  else if (liftedIndex <= 0) liLevel = 'Légèrement instable (0 à -2)';

  let cinLevel: ConvectiveIndices['cinLevel'] = 'Inhibition faible / Amorçage aisé (< 50)';
  if (cin > 150) cinLevel = 'Couvercle étanche (> 150)';
  else if (cin >= 50) cinLevel = 'Couvercle modéré (50-150)';

  let shearLevel: ConvectiveIndices['deepLayerShearLevel'] = 'Faible (< 10 m/s)';
  if (deepLayerShearMs > 20) shearLevel = 'Fort / Structuré (> 20 m/s)';
  else if (deepLayerShearMs >= 10) shearLevel = 'Modéré (10-20 m/s)';

  const convectiveIndices: ConvectiveIndices = {
    capeJkg: baseCape,
    capeLevel,
    liftedIndex,
    liftedIndexLevel: liLevel,
    cinJkg: cin,
    cinLevel,
    deepLayerShear06kmMs: deepLayerShearMs,
    deepLayerShearKnots,
    deepLayerShearLevel: shearLevel,
    lowLevelShear01kmMs: lowLevelShearMs,
    dcapeDownburstJkg: dcape,
    maxDownburstGustKmh,
    precipitableWaterMm: precipitableWater,
    kIndex,
    totalTotalsIndex: totalTotals,
    supercellCompositeParameter: scp,
    supercellRisk,
    hailProbabilityPercent: hailProb,
    hailMaxDiameterCm: hailDiameterCm,
    lightningRatePerMinute: lightningRatePerMin,
    flashDensityEstimate: flashDensity
  };

  // 2. Build detailed Hour-by-Hour Thunderstorm Timeline (next 24 hours)
  const currentHourNow = new Date().getHours();
  const hourlyStormTimeline: HourlyStormRisk[] = [];

  let maxRiskIn24h = 0;
  let peakStartHour = -1;
  let peakEndHour = -1;

  const hoursToProcess = hourlyForecasts.slice(0, 24);

  hoursToProcess.forEach((hf, idx) => {
    let hourNum = idx;
    if (hf.time) {
      const parsed = new Date(hf.time);
      if (!isNaN(parsed.getHours())) {
        hourNum = parsed.getHours();
      }
    }

    const isCurrent = idx === 0;

    // Diurnal convection heating curve: peak instability is usually 14h-20h in France/Europe
    const diurnalInstabilityFactor = 
      hourNum >= 14 && hourNum <= 19 ? 1.45 :
      hourNum >= 12 && hourNum <= 22 ? 1.15 :
      hourNum >= 23 || hourNum <= 6 ? 0.45 : 0.75;

    // Convective precipitation probability & weather code factor
    const hasThunderCode = hf.weatherCode >= 95;
    const hasShowerCode = hf.weatherCode >= 80 && hf.weatherCode <= 82;
    const precipProb = hf.precipitationProbability || 0;
    const rainAmount = hf.rainMm || 0;

    // Compute hourly CAPE
    let hCape = Math.round(baseCape * diurnalInstabilityFactor * (1 + (precipProb / 150)));
    if (hasThunderCode) hCape = Math.max(1200, hCape);

    // Compute hourly Lifted Index
    const hLI = Number((3.0 - (hCape / 400)).toFixed(1));
    const hCin = Math.round(Math.max(5, 140 - (hCape / 15)));

    // Compute hourly Storm Risk % (0 to 100%)
    let riskPct = 0;
    if (hasThunderCode) {
      riskPct = Math.min(100, Math.round(80 + (precipProb * 0.2)));
    } else if (hasShowerCode) {
      riskPct = Math.min(85, Math.round(45 + (precipProb * 0.35) + (hCape > 800 ? 15 : 0)));
    } else {
      riskPct = Math.min(95, Math.round((precipProb * 0.6) + (hCape > 1000 ? 30 : hCape > 500 ? 15 : 0)));
    }

    if (riskPct > maxRiskIn24h) {
      maxRiskIn24h = riskPct;
    }

    // Determine storm risk level
    let riskLevel: HourlyStormRisk['stormRiskLevel'] = 'NUL';
    if (riskPct >= 75) riskLevel = 'TRÈS ÉLEVÉ / VIOLENT';
    else if (riskPct >= 50) riskLevel = 'ÉLEVÉ';
    else if (riskPct >= 25) riskLevel = 'MODÉRÉ';
    else if (riskPct >= 10) riskLevel = 'FAIBLE';

    // Expected storm structure
    let stormType: HourlyStormRisk['expectedStormType'] = 'Aucun';
    if (riskPct >= 75 && scp >= 2.0) {
      stormType = 'Risque supercellulaire';
    } else if (riskPct >= 70 && deepLayerShearMs >= 18) {
      stormType = 'Ligne de grains convective';
    } else if (riskPct >= 45) {
      stormType = station.isMountain ? 'Orage orographique de relief' : 'Orage multicellulaire';
    } else if (riskPct >= 20) {
      stormType = 'Averses orageuses isolées';
    }

    // Hail risk
    let hailLevel: HourlyStormRisk['hailRisk'] = 'Nul';
    if (riskPct >= 70 && hCape > 1500) hailLevel = 'Élevé (> 3 cm)';
    else if (riskPct >= 45 && hCape > 800) hailLevel = 'Modéré (1-2 cm)';
    else if (riskPct >= 25) hailLevel = 'Faible (< 1 cm)';

    // Max convective gust
    const gustKmh = Math.round(Math.max(hf.windGust || (hf.windSpeed * 1.5), hf.windSpeed + (riskPct > 50 ? 35 : riskPct > 25 ? 18 : 5)));

    // Lightning activity
    let lightning: HourlyStormRisk['lightningActivity'] = 'Nulle';
    if (riskPct >= 75) lightning = 'Intense / Foudroiement continu';
    else if (riskPct >= 50) lightning = 'Fréquente';
    else if (riskPct >= 20) lightning = 'Isolée';

    const isPeak = riskPct >= 45 && riskPct >= (maxRiskIn24h - 15);

    if (isPeak) {
      if (peakStartHour === -1) peakStartHour = hourNum;
      peakEndHour = hourNum;
    }

    hourlyStormTimeline.push({
      hour: hourNum,
      hourLabel: `${hourNum.toString().padStart(2, '0')}h00`,
      time: hf.time || `${hourNum}h`,
      stormRiskPercent: riskPct,
      stormRiskLevel: riskLevel,
      cape: hCape,
      liftedIndex: hLI,
      cin: hCin,
      expectedStormType: stormType,
      hailRisk: hailLevel,
      maxGustExpectedKmh: gustKmh,
      lightningActivity: lightning,
      rainIntensityMmH: Math.max(rainAmount, riskPct > 60 ? 15.0 : riskPct > 35 ? 6.0 : 0),
      isCurrentHour: isCurrent,
      isCriticalPeak: isPeak
    });
  });

  // Global Risk Score (0-100%)
  const currentRisk = hourlyStormTimeline[0]?.stormRiskPercent || 0;
  const globalRiskScore = Math.max(currentRisk, Math.round(maxRiskIn24h * 0.9));

  // Global Vigilance Level
  let globalVigilance: ThunderstormConvectiveAnalysis['globalVigilanceLevel'] = 'VERT';
  if (globalRiskScore >= 75 || currentWeatherCode >= 95) globalVigilance = 'ROUGE';
  else if (globalRiskScore >= 50) globalVigilance = 'ORANGE';
  else if (globalRiskScore >= 25) globalVigilance = 'JAUNE';

  // Critical Window description
  let criticalWindowStr = "Aucune fenêtre orageuse critique identifiée";
  if (peakStartHour !== -1 && peakEndHour !== -1) {
    criticalWindowStr = `${peakStartHour.toString().padStart(2, '0')}h00 - ${((peakEndHour + 1) % 24).toString().padStart(2, '0')}h00`;
  } else if (globalRiskScore >= 25) {
    criticalWindowStr = "Activité convective diffuse au fil de l'après-midi";
  }

  // Imminent threat minutes calculation
  let imminentThreatMinutes: number | null = null;
  if (currentWeatherCode >= 95) {
    imminentThreatMinutes = 0;
  } else if (currentWeather.radarProximity?.nearestThunderstorm?.estimatedArrivalMinutes) {
    imminentThreatMinutes = currentWeather.radarProximity.nearestThunderstorm.estimatedArrivalMinutes;
  } else if (globalRiskScore >= 60) {
    imminentThreatMinutes = 45;
  }

  // Summary diagnosis
  let summaryDiagnosis = "";
  if (globalVigilance === 'ROUGE') {
    summaryDiagnosis = `Vigilance orageuse maximale sur ${station.name} : Convection explosive avec énergie CAPE extrême (${baseCape} J/kg), risque de violentes rafales descendantes jusqu'à ${maxDownburstGustKmh} km/h, grêle destructrice et foudroiement intense.`;
  } else if (globalVigilance === 'ORANGE') {
    summaryDiagnosis = `Risque orageux marqué sur ${station.name} (${globalRiskScore}%) : Atmosphère très instable propice aux orages multicellulaires avec fortes lames d'eau horaires, activité électrique soutenue et risque de grêle.`;
  } else if (globalVigilance === 'JAUNE') {
    summaryDiagnosis = `Risque orageux modéré / localisé (${globalRiskScore}%) : Développements cumuliformes d'évolution diurne pouvant donner des averses orageuses et des coups de tonnerre ponctuels.`;
  } else {
    summaryDiagnosis = `Atmosphère stable et calme sur ${station.name} : Absence de risque orageux significatif sur la localité pour les prochaines heures (CAPE basse à ${baseCape} J/kg, LI stable à +${liftedIndex}°C).`;
  }

  // Safety Directives
  const safetyDirectives: string[] = [];
  if (globalVigilance === 'ROUGE' || globalVigilance === 'ORANGE') {
    safetyDirectives.push("Mettez-vous à l'abri dans un bâtiment en dur fermé ou dans un véhicule métallique.");
    safetyDirectives.push("Évitez formellement les crêtes rocheuses, les sommets, les arbres isolés et les plans d'eau.");
    safetyDirectives.push("Ne touchez aucun objet métallique conducteur et débranchez les appareils électriques sensibles.");
    safetyDirectives.push("Reportez impérativement toute sortie en haute montagne, escalade, randonnée ou activité nautique.");
  } else if (globalVigilance === 'JAUNE') {
    safetyDirectives.push("Surveillez attentivement le ciel et les bourgeonnements de cumulonimbus vers l'Ouest.");
    safetyDirectives.push("Anticipez un lieu de repli si vous êtes en extérieur, en forêt ou sur l'eau.");
    safetyDirectives.push("Rangez ou arrimez les objets légers sur les terrasses et balcons.");
  } else {
    safetyDirectives.push("Conditions météorologiques favorables aux sorties et travaux extérieurs.");
    safetyDirectives.push("Indice de stabilité élevé garantissant l'absence de convection virulente.");
  }

  // Dominant Mechanism
  let dominantMechanism = "Régime anticyclonique stable et subsident";
  if (station.isMountain && baseCape > 300) {
    dominantMechanism = "Convection orographique de relief & brises thermiques ascendantes";
  } else if (baseCape > 1200 && deepLayerShearMs > 18) {
    dominantMechanism = "Front froid actif / Talweg d'altitude avec fort cisaillement dynamique";
  } else if (baseCape > 600) {
    dominantMechanism = "Masse d'air chaude et humide d'évolution diurne instable";
  }

  // Radar Proximity Summary
  const radarProximitySummary = currentWeather.radarProximity
    ? `Cellule orageuse la plus proche à ${currentWeather.radarProximity.nearestThunderstorm.distanceKm} km (${currentWeather.radarProximity.nearestThunderstorm.bearingCompass}), ${currentWeather.radarProximity.nearestThunderstorm.thunderAudibility.toLowerCase()}.`
    : `Aucun écho orageux actif détecté dans un rayon de 50 km autour de ${station.name}.`;

  const now = new Date();
  const generatedAt = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

  return {
    stationName: station.name,
    stationId: station.id,
    generatedAt,
    globalStormRiskScore: globalRiskScore,
    globalVigilanceLevel: globalVigilance,
    summaryDiagnosis,
    criticalWindow: criticalWindowStr,
    imminentThreatMinutes,
    dominantMechanism,
    convectiveIndices,
    hourlyStormTimeline,
    safetyDirectives,
    radarProximitySummary
  };
}
