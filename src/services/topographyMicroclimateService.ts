import { LocationPoint, CurrentWeather, TopographicMicroclimateAnalysis, AltitudeVerticalSlice } from '../types/weather';

/**
 * Advanced Topographic & Microclimates Modeling Service
 * Analyzes mountain vs plain differences, valleys (vallons/combes), thermal inversions,
 * adiabatic lapse rates, and orographic effects (Foehn / Blocage orographique).
 */
export function calculateTopographicMicroclimate(
  station: LocationPoint,
  weather: CurrentWeather
): TopographicMicroclimateAnalysis {
  const stationAlt = station.altitude ?? 150;
  const currentTemp = weather.temperature;
  const humidity = weather.humidity;
  const windSpeed = weather.windSpeed;
  const isNight = !weather.isDay;
  const rain = weather.precipitation;
  const dewPoint = weather.altitudeMetrics?.dewPoint ?? (currentTemp - ((100 - humidity) / 5));

  // Determine bioclimatic stage
  let bioclimaticStage = "Étage de Plaine & Basse Vallée (< 300 m)";
  if (stationAlt >= 2500) {
    bioclimaticStage = "Étage Alpin / Haute Cime (> 2500 m)";
  } else if (stationAlt >= 1800) {
    bioclimaticStage = "Étage Subalpin (1800 - 2500 m)";
  } else if (stationAlt >= 1100) {
    bioclimaticStage = "Étage Montagnard (1100 - 1800 m)";
  } else if (stationAlt >= 500) {
    bioclimaticStage = "Étage Collinéen / Moyenne Montagne (500 - 1100 m)";
  } else if (stationAlt >= 300) {
    bioclimaticStage = "Piedmont & Versants Collines (300 - 500 m)";
  }

  // 1. Valley Thermal Inversion Modeling
  // Night-time radiative cooling + light winds (wind < 12 km/h) favors cold air drainage into valley floors / combes
  const isRadiativeInversionFavorable = isNight && windSpeed < 12 && humidity > 60 && rain === 0;
  const isWinterSeason = [11, 0, 1, 2].includes(new Date().getMonth());
  const isValleyInversionActive = isRadiativeInversionFavorable || (isWinterSeason && windSpeed < 8 && weather.weatherCode <= 3);

  let inversionStrength: 'Nulle' | 'Modérée (+2°C à +4°C en pente)' | 'Forte (+5°C à +8°C sur les versants)' | 'Extrême (Lac d\'air froid / Combe)' = 'Nulle';
  let valleyBottomTemp = currentTemp;
  let slopeTemp = currentTemp;

  if (isValleyInversionActive) {
    const deltaInversion = stationAlt > 600 ? 5.5 : stationAlt > 200 ? 3.8 : 2.2;
    if (deltaInversion >= 5.0) {
      inversionStrength = "Forte (+5°C à +8°C sur les versants)";
    } else {
      inversionStrength = "Modérée (+2°C à +4°C en pente)";
    }
    
    // Inversion: valley bottoms are colder than mid-slopes
    valleyBottomTemp = Number((currentTemp - (deltaInversion * 0.6)).toFixed(1));
    slopeTemp = Number((currentTemp + (deltaInversion * 0.4)).toFixed(1));
  } else {
    valleyBottomTemp = Number((currentTemp + (stationAlt > 500 ? 1.8 : 0.4)).toFixed(1));
    slopeTemp = currentTemp;
  }

  // 2. Adiabatic Lapse Rates (Dry: -0.98°C/100m, Saturated: -0.55 to -0.65°C/100m)
  const isSaturated = humidity > 85 || rain > 0;
  const actualLapseRate = isValleyInversionActive 
    ? 0.35 // Positive inversion gradient in lowest 300m
    : isSaturated 
      ? -0.58 
      : -0.82;

  const lapseRateType = isValleyInversionActive 
    ? 'Inversion de température' 
    : isSaturated 
      ? 'Gradient humide saturé sous précipitations' 
      : 'Gradient standard sec';

  // 3. Orographic Foehn Effect
  let foehnStatus: 'Actif (Effet de Foehn marqué sous le vent)' | 'Blocage orographique au vent' | 'Neutre / Absence d\'écoulement orographique' = 'Neutre / Absence d\'écoulement orographique';
  let windwardEnhance = 15;
  let leewardWarming = 1.0;
  let foehnDetails = "Écoulement atmosphérique homogène sans contraste orographique majeur.";

  if (stationAlt >= 400 && windSpeed >= 22) {
    if (weather.windDirection >= 160 && weather.windDirection <= 240) {
      // South / South-West wind over Alps / Pyrenees / Massif Central
      foehnStatus = 'Actif (Effet de Foehn marqué sous le vent)';
      windwardEnhance = 65;
      leewardWarming = 4.2;
      foehnDetails = "Vent de Sud dynamique : effet de foehn actif sur les versants sous le vent (réchauffement adiabatique + assèchement brutal de la masse d'air).";
    } else if (weather.windDirection >= 290 || weather.windDirection <= 40) {
      foehnStatus = 'Blocage orographique au vent';
      windwardEnhance = 50;
      leewardWarming = 0.5;
      foehnDetails = "Flux de Nord/Nord-Ouest humide bloqué contre les reliefs : précipitations orographiques amplifiées et plafond nuageux bas.";
    }
  }

  // 4. Multi-Altitude Vertical Slices Profile
  const referenceAltitudes = [
    { alt: Math.max(50, Math.min(200, stationAlt - 300)), label: "Fond de Vallon / Plaine basse" },
    { alt: 500, label: "Versant / Coteau (500 m)" },
    { alt: 1000, label: "Moyenne Montagne (1 000 m)" },
    { alt: 1600, label: "Étage Subalpin (1 600 m)" },
    { alt: 2200, label: "Haute Montagne / Cols (2 200 m)" },
    { alt: 3000, label: "Hauts Sommets / Cimes (3 000 m)" }
  ];

  const verticalProfile: AltitudeVerticalSlice[] = referenceAltitudes.map((slice) => {
    const altDiff = slice.alt - stationAlt;
    let t = currentTemp;
    
    if (isValleyInversionActive && slice.alt < stationAlt) {
      t = valleyBottomTemp;
    } else {
      const gradient = isSaturated ? -0.006 : -0.0075;
      t = Number((currentTemp + (altDiff * gradient)).toFixed(1));
    }

    const feels = Number((t - (windSpeed * 0.15 + (slice.alt / 1000) * 1.5)).toFixed(1));
    
    // Barometric formula QFE
    const pressureQfe = Math.round(1013.25 * Math.pow(1 - (0.0065 * slice.alt) / 288.15, 5.255));

    let precipState: 'Pluie liquide' | 'Pluie et neige mêlées' | 'Neige seule' | 'Neige soufflée / Blizzard' | 'Temps sec' = 'Temps sec';
    if (rain > 0 || weather.weatherCode >= 50) {
      if (t <= -1) {
        precipState = windSpeed > 40 ? 'Neige soufflée / Blizzard' : 'Neige seule';
      } else if (t <= 1.8) {
        precipState = 'Pluie et neige mêlées';
      } else {
        precipState = 'Pluie liquide';
      }
    }

    const iso0Diff = weather.altitudeMetrics?.isotherm0Altitude 
      ? slice.alt - weather.altitudeMetrics.isotherm0Altitude 
      : 0;

    const isoComparison = iso0Diff > 0 
      ? `Au-dessus de l'Isotherme 0°C (+${iso0Diff} m)` 
      : `Sous l'Isotherme 0°C (${iso0Diff} m)`;

    return {
      altitudeMeters: slice.alt,
      label: slice.label,
      temperature: t,
      feelsLike: feels,
      pressureQfe,
      precipitationState: precipState,
      lapseRateCPer100m: isSaturated ? -0.60 : -0.75,
      isothermComparison: isoComparison
    };
  });

  return {
    stationAltitude: stationAlt,
    bioclimaticStage,
    valleyInversion: {
      isActive: isValleyInversionActive,
      strength: inversionStrength,
      valleyBottomTemp,
      slopeTemp,
      phenomenonDescription: isValleyInversionActive
        ? `Inversion thermique établie : l'air froid et dense stagne en fond de vallée (${valleyBottomTemp}°C), tandis que les versants et plateaux bénéficient d'un air plus doux (${slopeTemp}°C).`
        : "Gradient altimétrique normal : la température décroît régulièrement avec l'altitude sans accumulation d'air froid en cuvette.",
      riskFrostInDepressions: valleyBottomTemp <= 2.5
    },
    adiabaticLapseRates: {
      dryLapseRate: -0.98,
      saturatedLapseRate: -0.65,
      actualLocalLapseRate: actualLapseRate,
      lapseRateType,
      dewPointDepression: Number((currentTemp - dewPoint).toFixed(1))
    },
    orographicFoehnEffect: {
      windwardSidePrecipEnhancementPct: windwardEnhance,
      leewardSideFoehnWarmingC: leewardWarming,
      status: foehnStatus,
      details: foehnDetails
    },
    verticalProfile
  };
}
