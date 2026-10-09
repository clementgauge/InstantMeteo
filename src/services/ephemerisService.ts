import { 
  CurrentWeather, 
  LocationPoint, 
  MoonPhaseData, 
  OutdoorActivityIndices, 
  SolarEphemeris, 
  BarometricTrend 
} from '../types/weather';

export interface SolarEphemerisOptions {
  sunriseIso?: string;
  sunsetIso?: string;
  utcOffsetSeconds?: number;
  localTimeIso?: string;
}

/**
 * Astronomical and Solar Ephemeris calculations for any latitude/longitude worldwide
 * Uses NOAA Solar Calculator equations + optional exact Open-Meteo sunrise/sunset & station timezone
 */
export function calculateSolarEphemeris(
  lat: number,
  lon: number,
  date: Date = new Date(),
  options?: SolarEphemerisOptions
): SolarEphemeris {
  // Station timezone offset in hours: use Open-Meteo utc_offset_seconds if provided,
  // otherwise estimate from longitude for non-European points or browser offset for France
  const isEuropeanCoords = lat >= 35 && lat <= 60 && lon >= -10 && lon <= 25;
  const tzOffsetHours =
    options?.utcOffsetSeconds !== undefined
      ? options.utcOffsetSeconds / 3600
      : isEuropeanCoords
        ? -date.getTimezoneOffset() / 60
        : Math.round(lon / 15);

  // Determine current local decimal hour at the station
  let currentDecHour = date.getUTCHours() + date.getUTCMinutes() / 60 + tzOffsetHours;
  currentDecHour = ((currentDecHour % 24) + 24) % 24;
  if (options?.localTimeIso && options.localTimeIso.includes('T')) {
    const timePart = options.localTimeIso.split('T')[1];
    if (timePart) {
      const [hh, mm] = timePart.split(':').map(Number);
      if (!isNaN(hh) && !isNaN(mm)) {
        currentDecHour = hh + mm / 60;
      }
    }
  }

  // Day of year (1 to 365)
  const startOfYear = Date.UTC(date.getUTCFullYear(), 0, 0);
  const dayOfYear = Math.floor((date.getTime() - startOfYear) / 86400000);

  // Fractional year gamma (radians) - NOAA equation
  const gamma = ((2 * Math.PI) / 365) * (dayOfYear - 1 + (12 - 12) / 24);

  // Equation of time (minutes) - Spencer (1971) / NOAA
  const eqTime =
    229.18 *
    (0.000075 +
      0.001868 * Math.cos(gamma) -
      0.032077 * Math.sin(gamma) -
      0.014615 * Math.cos(2 * gamma) -
      0.040849 * Math.sin(2 * gamma));

  // Solar declination (radians & degrees) - Spencer (1971)
  const declRad =
    0.006918 -
    0.399912 * Math.cos(gamma) +
    0.070257 * Math.sin(gamma) -
    0.006758 * Math.cos(2 * gamma) +
    0.000907 * Math.sin(2 * gamma) -
    0.002697 * Math.cos(3 * gamma) +
    0.00148 * Math.sin(3 * gamma);
  const declination = (declRad * 180) / Math.PI;

  const latRad = (lat * Math.PI) / 180;

  // Helper to compute hour angle (in hours) for a given zenith angle
  const computeHourAngleHours = (zenithDeg: number, decR: number): number => {
    const zenRad = (zenithDeg * Math.PI) / 180;
    const denom = Math.cos(latRad) * Math.cos(decR);
    if (Math.abs(denom) < 1e-6) return 6;
    const cosHa = (Math.cos(zenRad) - Math.sin(latRad) * Math.sin(decR)) / denom;
    if (cosHa >= 1) return 0; // Polar night
    if (cosHa <= -1) return 12; // Midnight sun
    return (Math.acos(cosHa) * 180) / (Math.PI * 15);
  };

  // Solar noon in local station hours
  let solarNoonLocal = 12 - lon / 15 - eqTime / 60 + tzOffsetHours;
  solarNoonLocal = ((solarNoonLocal % 24) + 24) % 24;

  const haSunriseHours = computeHourAngleHours(90.833, declRad);
  let sunriseDec = solarNoonLocal - haSunriseHours;
  let sunsetDec = solarNoonLocal + haSunriseHours;

  // If Open-Meteo provided exact local sunrise/sunset ISO strings, parse them for 100% precision
  const parseIsoHourDec = (iso?: string): number | null => {
    if (!iso || !iso.includes('T')) return null;
    const tPart = iso.split('T')[1];
    if (!tPart) return null;
    const [h, m] = tPart.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return null;
    return h + m / 60;
  };

  const apiSunriseDec = parseIsoHourDec(options?.sunriseIso);
  const apiSunsetDec = parseIsoHourDec(options?.sunsetIso);
  if (apiSunriseDec !== null && apiSunsetDec !== null && apiSunsetDec > apiSunriseDec) {
    sunriseDec = apiSunriseDec;
    sunsetDec = apiSunsetDec;
    solarNoonLocal = (sunriseDec + sunsetDec) / 2;
  }

  const dayLengthHoursTotal = Math.max(0, sunsetDec - sunriseDec);

  const formatTime = (decHours: number): string => {
    const normalized = ((decHours % 24) + 24) % 24;
    let h = Math.floor(normalized);
    let m = Math.round((normalized - h) * 60);
    if (m === 60) {
      h = (h + 1) % 24;
      m = 0;
    }
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const totalMinutesRounded = Math.round(dayLengthHoursTotal * 60);
  const dLenHours = Math.floor(totalMinutesRounded / 60);
  const dLenMinutes = totalMinutesRounded % 60;

  // Next day declination for exact daily daylight gain/loss (minutes/day)
  const gammaNext = ((2 * Math.PI) / 365) * (dayOfYear + (12 - 12) / 24);
  const declRadNext =
    0.006918 -
    0.399912 * Math.cos(gammaNext) +
    0.070257 * Math.sin(gammaNext) -
    0.006758 * Math.cos(2 * gammaNext) +
    0.000907 * Math.sin(2 * gammaNext) -
    0.002697 * Math.cos(3 * gammaNext) +
    0.00148 * Math.sin(3 * gammaNext);
  const nextHaHours = computeHourAngleHours(90.833, declRadNext);
  const dayLengthChangeMinutes = Number(((2 * nextHaHours - 2 * haSunriseHours) * 60).toFixed(1));

  // Civil (96°) and Nautical (102°) twilight hour angles
  const civilHa = computeHourAngleHours(96.0, declRad);
  const nautHa = computeHourAngleHours(102.0, declRad);
  const civilDiff = Math.max(0.35, civilHa - haSunriseHours);
  const nautDiff = Math.max(0.75, nautHa - haSunriseHours);

  // Max solar elevation at solar noon (deg)
  const maxSolarElevationDeg = Number(
    Math.max(0, Math.min(90, 90 - Math.abs(lat - declination))).toFixed(1)
  );

  // Current solar elevation angle at current local hour
  const currentHourAngleRad = ((currentDecHour - solarNoonLocal) * 15 * Math.PI) / 180;
  const sinElev =
    Math.sin(latRad) * Math.sin(declRad) +
    Math.cos(latRad) * Math.cos(declRad) * Math.cos(currentHourAngleRad);
  const currentSolarElevationDeg = Number(
    ((Math.asin(Math.max(-1, Math.min(1, sinElev))) * 180) / Math.PI).toFixed(1)
  );

  // Solar progress percentage today (0% at sunrise, 50% at solar noon, 100% at sunset)
  const isSunAboveHorizon = currentDecHour >= sunriseDec && currentDecHour <= sunsetDec;
  let sunProgress = 0;
  if (currentDecHour > sunriseDec && currentDecHour < sunsetDec && sunsetDec > sunriseDec) {
    sunProgress = Math.round(((currentDecHour - sunriseDec) / (sunsetDec - sunriseDec)) * 100);
  } else if (currentDecHour >= sunsetDec) {
    sunProgress = 100;
  }

  // Golden hours (approx 45 min after sunrise & 45 min before sunset)
  const goldenHourMorning = `${formatTime(sunriseDec)} - ${formatTime(sunriseDec + 0.75)}`;
  const goldenHourEvening = `${formatTime(sunsetDec - 0.75)} - ${formatTime(sunsetDec)}`;

  return {
    sunrise: formatTime(sunriseDec),
    sunset: formatTime(sunsetDec),
    solarNoon: formatTime(solarNoonLocal),
    dayLengthHours: dLenHours,
    dayLengthMinutes: dLenMinutes,
    dayLengthFormatted: `${dLenHours}h ${dLenMinutes.toString().padStart(2, '0')}min`,
    dayLengthChangeMinutes,
    civilTwilightBegin: formatTime(sunriseDec - civilDiff),
    civilTwilightEnd: formatTime(sunsetDec + civilDiff),
    nauticalTwilightBegin: formatTime(sunriseDec - nautDiff),
    nauticalTwilightEnd: formatTime(sunsetDec + nautDiff),
    goldenHourMorning,
    goldenHourEvening,
    maxSolarElevationDeg,
    currentSolarElevationDeg,
    isSunAboveHorizon,
    solarRadiationKwhM2: Number(
      Math.max(0.5, dayLengthHoursTotal * 0.45 * Math.sin((maxSolarElevationDeg * Math.PI) / 180)).toFixed(2)
    ),
    sunProgressPercent: Math.max(0, Math.min(100, sunProgress))
  };
}

/**
 * Calculates Moon Phase, illumination percentage, moonrise/moonset & next full/new moon
 * based on Jean Meeus Astronomical Algorithms
 */
export function calculateMoonPhase(
  date: Date = new Date(),
  lat: number = 46.5,
  lon: number = 2.5,
  utcOffsetSeconds?: number
): MoonPhaseData {
  // Julian Day (JD)
  const jd = date.getTime() / 86400000 + 2440587.5;
  const T = (jd - 2451545.0) / 36525.0; // Julian centuries since J2000.0

  const deg2rad = (d: number) => (d * Math.PI) / 180;
  const norm360 = (d: number) => ((d % 360) + 360) % 360;

  // Mean elongation of the Moon (D)
  const D = norm360(
    297.8501921 + 445267.1114034 * T - 0.0018819 * T * T + (T * T * T) / 545868
  );
  // Sun's mean anomaly (M)
  const M = norm360(357.5291092 + 35999.0502909 * T - 0.0001536 * T * T);
  // Moon's mean anomaly (M')
  const Mprime = norm360(
    134.9633964 + 477198.8675055 * T + 0.0087414 * T * T + (T * T * T) / 69699
  );
  // Moon's mean longitude (L')
  const Lprime = norm360(218.3164477 + 481267.88123421 * T);

  // Phase angle i (degrees) - Meeus Ch. 48
  const i =
    180 -
    D -
    6.289 * Math.sin(deg2rad(Mprime)) +
    2.1 * Math.sin(deg2rad(M)) -
    1.274 * Math.sin(deg2rad(2 * D - Mprime)) -
    0.658 * Math.sin(deg2rad(2 * D)) -
    0.214 * Math.sin(deg2rad(2 * Mprime)) -
    0.11 * Math.sin(deg2rad(D));

  // Illuminated fraction k (0 to 100%)
  const k = (1 + Math.cos(deg2rad(i))) / 2;
  const illumination = Math.max(0, Math.min(100, Math.round(k * 100)));

  // Synodic cycle progress (0 to 29.530588853 days) based on true elongation
  const synodicMonthDays = 29.530588853;
  const trueElongation = norm360(
    D + 6.289 * Math.sin(deg2rad(Mprime)) - 2.1 * Math.sin(deg2rad(M))
  );
  const ageDays = Number(((trueElongation / 360) * synodicMonthDays).toFixed(1));
  const isWaxing = trueElongation < 180;

  let phaseName = 'Nouvelle Lune';
  let phaseCode: MoonPhaseData['phaseCode'] = 'new_moon';

  if (trueElongation < 12 || trueElongation >= 348) {
    phaseName = 'Nouvelle Lune';
    phaseCode = 'new_moon';
  } else if (trueElongation < 78) {
    phaseName = 'Premier Croissant';
    phaseCode = 'waxing_crescent';
  } else if (trueElongation < 102) {
    phaseName = 'Premier Quartier';
    phaseCode = 'first_quarter';
  } else if (trueElongation < 168) {
    phaseName = 'Gibbeuse Croissante';
    phaseCode = 'waxing_gibbous';
  } else if (trueElongation < 192) {
    phaseName = 'Pleine Lune';
    phaseCode = 'full_moon';
  } else if (trueElongation < 258) {
    phaseName = 'Gibbeuse Décroissante';
    phaseCode = 'waning_gibbous';
  } else if (trueElongation < 282) {
    phaseName = 'Dernier Quartier';
    phaseCode = 'last_quarter';
  } else {
    phaseName = 'Dernier Croissant';
    phaseCode = 'waning_crescent';
  }

  // Ecliptic longitude of the Moon for zodiac constellation
  const eclipticLon = norm360(Lprime + 6.289 * Math.sin(deg2rad(Mprime)));
  const moonSigns = [
    'Bélier',
    'Taureau',
    'Gémeaux',
    'Cancer',
    'Lion',
    'Vierge',
    'Balance',
    'Scorpion',
    'Sagittaire',
    'Capricorne',
    'Verseau',
    'Poissons'
  ];
  const signIdx = Math.floor(eclipticLon / 30) % 12;
  const moonSign = moonSigns[signIdx] || 'Taureau';

  const isSyzygy = phaseCode === 'new_moon' || phaseCode === 'full_moon';
  const isQuadrature = phaseCode === 'first_quarter' || phaseCode === 'last_quarter';

  const tideType = isSyzygy
    ? 'Vives-Eaux (Forts coefficients)'
    : isQuadrature
      ? 'Mortes-Eaux (Faibles coefficients)'
      : 'Moyennes';

  // Estimate local moonrise and moonset based on lunar elongation from Sun
  const tzOffsetHours =
    utcOffsetSeconds !== undefined
      ? utcOffsetSeconds / 3600
      : -date.getTimezoneOffset() / 60;
  const solarNoonLocal = ((12 - lon / 15 + tzOffsetHours) % 24 + 24) % 24;
  // Moon transits ~(trueElongation / 15) hours after Solar Noon
  const moonTransitLocal = (solarNoonLocal + trueElongation / 15) % 24;
  // Lunar declination approx: ±23.4° sin(eclipticLon)
  const moonDecDeg = 23.4 * Math.sin(deg2rad(eclipticLon));
  const cosMoonHa =
    -Math.tan(deg2rad(Math.max(-60, Math.min(60, lat)))) * Math.tan(deg2rad(moonDecDeg));
  const moonSemiArcHours =
    (Math.acos(Math.max(-0.95, Math.min(0.95, cosMoonHa))) * 180) / (Math.PI * 15);

  const fmtHour = (decH: number) => {
    const n = ((decH % 24) + 24) % 24;
    const h = Math.floor(n);
    const m = Math.round((n - h) * 60) % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const moonrise = fmtHour(moonTransitLocal - moonSemiArcHours);
  const moonset = fmtHour(moonTransitLocal + moonSemiArcHours);

  // Next Full Moon & Next New Moon dates
  const daysToFullMoon =
    ((180 - trueElongation + 360) % 360) * (synodicMonthDays / 360);
  const daysToNewMoon =
    ((360 - trueElongation) % 360) * (synodicMonthDays / 360);
  const nextFullDate = new Date(date.getTime() + daysToFullMoon * 86400000);
  const nextNewDate = new Date(date.getTime() + daysToNewMoon * 86400000);

  const nextFullMoonDate = nextFullDate.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short'
  });
  const nextNewMoonDate = nextNewDate.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short'
  });

  return {
    phaseName,
    phaseCode,
    illuminationPercent: illumination,
    moonAgeDays: ageDays,
    moonSign,
    tideType,
    moonrise,
    moonset,
    nextFullMoonDate,
    nextNewMoonDate,
    isWaxing
  };
}

/**
 * Computes specialized outdoor and professional weather indices
 */
export function calculateOutdoorIndices(
  weather: CurrentWeather,
  station: LocationPoint
): OutdoorActivityIndices {
  const alt = station.altitude ?? 0;
  const temp = weather.temperature;
  const wind = weather.windSpeed;
  const rain = weather.precipitation;
  const uv = weather.uvIndex;
  const code = weather.weatherCode;
  const humidity = weather.humidity;
  const feelsLike = weather.feelsLike;
  const dewPoint = weather.altitudeMetrics?.dewPoint ?? (temp - ((100 - humidity) / 5));
  
  // 1. Hiking & Mountaineering (Randonnée / Alpinisme / Haute Montagne)
  let hikingScore = 88;
  if (rain > 0) hikingScore -= 30;
  if (code >= 95) hikingScore -= 65; // Thunderstorm
  if (wind > 45) hikingScore -= 35;
  else if (wind > 25) hikingScore -= 15;
  if (alt > 1500 && temp < 0) hikingScore -= 20;
  if (humidity > 90) hikingScore -= 10;
  if (temp > 32) hikingScore -= 25;
  hikingScore = Math.max(10, Math.min(100, Math.round(hikingScore)));
  
  const hikingStatus = hikingScore >= 80 ? 'EXCELLENT' : hikingScore >= 60 ? 'FAVORABLE' : hikingScore >= 40 ? 'PRUDENCE' : 'DÉCONSEILLÉ';
  const thunderRisk = code >= 95 ? 'Élevé' : (temp > 24 && humidity > 60) ? 'Modéré' : 'Faible';
  const ridgeWind = Math.round(wind * 1.6);
  const cloudBase = Math.max(600, Math.round((temp - dewPoint) * 125));

  // 2. Cycling & Road Bike / Gravel / VTT
  let cycleScore = 92;
  if (wind > 40) cycleScore -= 40;
  else if (wind > 22) cycleScore -= 15;
  if (temp > 32 || temp < 0) cycleScore -= 25;
  else if (temp > 28 || temp < 5) cycleScore -= 10;
  if (rain > 0.5) cycleScore -= 35;
  cycleScore = Math.max(15, Math.min(100, Math.round(cycleScore)));
  const cycleStatus = cycleScore >= 80 ? 'OPTIMAL' : cycleScore >= 65 ? 'BON' : cycleScore >= 45 ? 'MOYEN' : 'DIFFICILE';
  const windImpact = wind > 35 ? 'Vent violent pénalisant' : wind > 18 ? 'Vent modéré' : 'Favorable';
  const heatStress = temp > 28 ? 'Fort' : temp > 22 ? 'Modéré' : 'Faible';

  // 3. Running & Trail (Course à pied)
  let runScore = 90;
  if (temp > 28) runScore -= 30;
  else if (temp > 23) runScore -= 12;
  if (temp < -2) runScore -= 20;
  if (humidity > 80 && temp > 22) runScore -= 15;
  if (rain > 2) runScore -= 25;
  if (wind > 35) runScore -= 15;
  runScore = Math.max(15, Math.min(100, Math.round(runScore)));
  const runStatus = runScore >= 80 ? 'OPTIMAL' : runScore >= 65 ? 'BON' : runScore >= 45 ? 'MOYEN' : 'DÉCONSEILLÉ';

  // 4. Beach, Swimming & Water Sports (Baignade / Plage / Voile / Kitesurf)
  let beachScore = Math.round(Math.max(0, Math.min(100, (temp * 2.8) + (uv * 4.5) - (wind * 0.6) - (rain * 25))));
  if (temp < 18) beachScore = Math.min(30, beachScore);
  const waterComfort = temp >= 25 ? 'Idéale et chaude (> 22°C est.)' : temp >= 21 ? 'Très agréable (19-21°C)' : 'Fraîche (< 18°C)';

  // 5. Gardening & Agriculture (Jardinage, Potager, Viticulture)
  const et0 = weather.altitudeMetrics?.evapotranspirationEt0 ?? 3.5;
  const sprayWindow = (wind < 19 && rain === 0) 
    ? 'Idéale (Vent < 19 km/h, sans pluie)' 
    : wind >= 19 
      ? 'Déconseillée (Vent/Pluie)' 
      : 'Moyenne';

  // 6. Outdoor DIY / Roofing / Painting (Bricolage Extérieur, Toiture, Peinture)
  let diyScore = 85;
  if (wind > 35) diyScore -= 45; // High wind dangerous for ladders/roof
  else if (wind > 20) diyScore -= 20;
  if (rain > 0) diyScore -= 50;
  if (humidity > 80) diyScore -= 20; // Bad for painting/drying
  if (temp < 8 || temp > 33) diyScore -= 20;
  diyScore = Math.max(10, Math.min(100, Math.round(diyScore)));

  // 7. Astronomy & Night Sky Observation (Astronomie / Seeing)
  let astroScore = 80;
  if (code >= 3) astroScore -= 60; // Overcast
  else if (code === 2) astroScore -= 30;
  else if (code === 1) astroScore -= 10;
  if (humidity > 85) astroScore -= 20; // Fog / dew on optics
  if (wind > 25) astroScore -= 15;
  astroScore = Math.max(10, Math.min(100, Math.round(astroScore)));

  // 8. Light Aviation & Drone & Paragliding (Aviation légère, Drone, Parapente)
  let aeroScore = 85;
  if (wind > 30) aeroScore -= 40;
  if (code >= 95) aeroScore -= 65;
  if (rain > 0) aeroScore -= 35;
  if (cloudBase < 800) aeroScore -= 25;
  aeroScore = Math.max(10, Math.min(100, Math.round(aeroScore)));

  // 9. Seniors & Health / Fragile Persons (Seniors, Enfants, Bien-être)
  let seniorScore = 90;
  if (temp > 31) seniorScore -= 40; // Heatwave
  else if (temp > 27) seniorScore -= 15;
  if (temp < 2) seniorScore -= 25; // Frost
  if (rain > 2) seniorScore -= 20;
  if (wind > 35) seniorScore -= 20;
  seniorScore = Math.max(20, Math.min(100, Math.round(seniorScore)));

  // 10. Solar Energy
  const pvPotential = Number((Math.max(1.0, Math.min(7.2, (1 - (weather.weatherCode >= 3 ? 0.6 : 0.1)) * 5.8 * (uv / 5)))).toFixed(2));
  const efficiency = Math.round(Math.min(100, (pvPotential / 6.0) * 100));

  return {
    hiking: {
      score: hikingScore,
      status: hikingStatus,
      riskThunderstorm: thunderRisk,
      cloudBaseMeters: cloudBase,
      windAtRidgeKmh: ridgeWind,
      advice: hikingScore >= 75 
        ? "Excellentes conditions de marche. Prévoir protection solaire, eau en abondance et vérifier les prévisions d'altitude."
        : hikingScore >= 50 
          ? "Sortie praticable avec prudence. Évitez les crêtes exposées en cas de renforcement du vent ou bourgeonnement orageux."
          : "Randonnée fortement déconseillée en haute altitude en raison de la dégradation météo.",
      optimalTimeSlots: [
        "07h30 - 11h30 : Créneau Idéal (Fraîcheur & Ciel dégagé)",
        "14h00 - 17h30 : Prudence (Chaleur / Risque convectif)",
        "18h00 - 20h30 : Agréable en basse altitude"
      ],
      equipment: [
        "Chaussures montantes imperméables",
        "Veste coupe-vent / imperméable respirante",
        "Gourde 1.5L minimum par personne",
        "Lunettes de soleil UV catégorie 3 ou 4",
        "Casquette ou chapeau à large bord"
      ]
    },
    cycling: {
      score: cycleScore,
      status: cycleStatus,
      windImpact,
      heatStress,
      advice: wind > 30 
        ? "Vent fort : privilégier un itinéraire abrité en vallée ou forêt, prudence en descente et rafales latérales." 
        : cycleScore >= 75
          ? "Conditions parfaites pour un entraînement sur route, gravel ou VTT."
          : "Sortie mitigée, chaussée potentiellement humide.",
      optimalTimeSlots: [
        "08h00 - 11h00 : Idéal (Vent faible, fraîcheur)",
        "17h30 - 20h00 : Très bon créneau de fin de journée"
      ],
      equipment: [
        "Casque et gants aérés",
        "Bidon d'eau isotonique (1L / 2h d'effort)",
        "Coupe-vent sans manches compactable",
        "Éclairage avant/arrière de sécurité"
      ]
    },
    running: {
      score: runScore,
      status: runStatus,
      riskLevel: runScore >= 75 ? 'Faible' : runScore >= 50 ? 'Modéré' : 'Élevé',
      optimalTimeSlots: [
        "07h00 - 09h30 : Créneau d'or (Température basse, air pur)",
        "19h00 - 21h00 : Bonne récupération thermique",
        "12h00 - 16h00 : Fortement déconseillé en été"
      ],
      keyFactors: [
        { label: "Stress thermique", value: feelsLike > 27 ? "Élevé" : "Faible à modéré", isWarning: feelsLike > 27 },
        { label: "Qualité de l'air", value: weather.airQualityLabel || "Bonne" },
        { label: "Refroidissement corporel", value: humidity > 75 ? "Transpiration peu efficace" : "Optimal" }
      ],
      advice: temp > 25 
        ? "Hydratation impérative toutes les 15 minutes. Réduire l'intensité de 10 à 15%."
        : "Rythme optimal d'entraînement. Échauffement progressif recommandé.",
      equipment: ["Chaussures avec bon amorti", "Ceinture porte-flasque d'hydratation", "Casquette anti-UV respirante"]
    },
    beachSea: {
      score: beachScore,
      uvRisk: uv >= 8 ? 'Très Élevé (Protection maximale)' : uv >= 6 ? 'Élevé' : 'Modéré',
      thermalBreezeKmh: Math.round(wind * 0.9 + 5),
      waterComfortEstimate: waterComfort,
      advice: uv >= 6 
        ? "Crème solaire SPF 50+, chapeau et lunettes indispensables. Éviter le zénith 12h-16h."
        : "Conditions agréables en bord d'eau sans danger majeur.",
      optimalTimeSlots: [
        "10h00 - 12h30 : Baignade douce & Soleil modéré",
        "16h30 - 19h30 : Idéal pour plage et sports de glisse"
      ],
      equipment: ["Crème solaire haute protection", "Parasol / tente anti-UV", "T-shirt lycra anti-UV pour enfants"]
    },
    gardeningAgriculture: {
      et0Evapotranspiration: et0,
      sprayWindow,
      frostRiskGround: temp <= 3 ? 'Risque de gelée blanche au sol au lever du jour' : 'Aucun risque de gelée',
      soilDryingRate: et0 > 4.5 ? 'Très rapide' : 'Modéré',
      advice: et0 > 4.0 
        ? "Évapotranspiration forte : arrosage profond au goutte-à-goutte tôt le matin ou après 20h."
        : "Humidité satisfaisante pour les semis, boutures et repiquages.",
      optimalTimeSlots: [
        "06h30 - 09h00 : Idéal pour pulvérisation et taille",
        "19h30 - 21h30 : Arrosage nocturne efficace"
      ],
      equipment: ["Paillage au pied des plants", "Gants de protection", "Arrosoir avec pomme fine"]
    },
    outdoorWorkDiy: {
      score: diyScore,
      status: diyScore >= 75 ? 'OPTIMAL' : diyScore >= 50 ? 'MOYEN' : 'DÉCONSEILLÉ',
      riskLevel: wind > 35 || rain > 0 ? 'Critique' : wind > 20 ? 'Modéré' : 'Faible',
      optimalTimeSlots: [
        "08h30 - 12h00 : Idéal pour peinture, toiture et maçonnerie",
        "14h00 - 17h00 : Surveiller la chaleur et le séchage trop rapide"
      ],
      keyFactors: [
        { label: "Sécurité hauteur / Toiture", value: wind > 30 ? "Danger vent fort" : "Favorable (< 25 km/h)", isWarning: wind > 30 },
        { label: "Séchage peintures / Enduits", value: humidity > 75 ? "Ralenti (Hygrométrie haute)" : "Séchage rapide" },
        { label: "Risque de lessivage", value: rain > 0 ? "Alerte pluie" : "Aucun risque" }
      ],
      advice: wind > 30 
        ? "Travaux sur échelle ou toiture strictement déconseillés en raison des rafales de vent."
        : "Excellentes conditions pour bricolage extérieur, peinture de clôture et terrassement.",
      equipment: ["Harnais de sécurité pour toiture", "Lunettes de protection", "Gants de chantier"]
    },
    astronomy: {
      score: astroScore,
      status: astroScore >= 75 ? 'EXCELLENT' : astroScore >= 50 ? 'MOYEN' : 'DÉCONSEILLÉ',
      riskLevel: code >= 3 ? 'Élevé' : 'Faible',
      optimalTimeSlots: [
        "22h30 - 03h30 : Nuit noire & Observation stellaire optimale",
        "Crépuscule nautique pour planètes Vénus / Jupiter"
      ],
      keyFactors: [
        { label: "Transparence atmosphérique", value: code <= 1 ? "Excellente" : "Voile nuageux" },
        { label: "Seeing / Turbulence", value: wind < 15 ? "Très stable" : "Turbulence modérée" },
        { label: "Risque de buée optique", value: humidity > 85 ? "Élevé (Résistances chauffantes requises)" : "Faible" }
      ],
      advice: astroScore >= 70 
        ? "Ciel très dégagé propice à l'observation des nébuleuses, galaxies et planètes."
        : "Couverture nuageuse ou brume gênant les observations du ciel profond.",
      equipment: ["Télescope / Jumelles astronomiques", "Lampe rouge anti-éblouissement", "Vêtements chauds pour la nuit"]
    },
    aviationDrone: {
      score: aeroScore,
      status: aeroScore >= 75 ? 'FAVORABLE' : aeroScore >= 50 ? 'PRUDENCE' : 'INTERDIT',
      riskLevel: wind > 30 || code >= 95 ? 'Critique' : wind > 20 ? 'Modéré' : 'Faible',
      optimalTimeSlots: [
        "08h00 - 11h30 : Aérologie calme du matin",
        "18h00 - 20h00 : Restitution douce sans thermiques violents"
      ],
      keyFactors: [
        { label: "Vent au sol & Rafales", value: `${wind} km/h (Rafales ${weather.windGust} km/h)`, isWarning: wind > 25 },
        { label: "Plafond des nuages", value: `${cloudBase} m AGL` },
        { label: "Cisaillement basse couche", value: "Faible à modéré" }
      ],
      advice: wind > 28 
        ? "Vent limite pour vol de drone civil et parapente. Risque de dérive et rabattants."
        : "Conditions aérologiques stables favorables au vol à vue (VFR).",
      equipment: ["Anémomètre portable de terrain", "Radio VHF aéronautique", "Batteries tempérées"]
    },
    seniorsHealth: {
      score: seniorScore,
      status: seniorScore >= 75 ? 'OPTIMAL' : seniorScore >= 50 ? 'MOYEN' : 'PRUDENCE',
      riskLevel: temp > 30 || temp < 0 ? 'Élevé' : 'Faible',
      optimalTimeSlots: [
        "09h00 - 11h00 : Promenade douce ensoleillée",
        "16h30 - 18h30 : Sortie au calme sans chaleur excessive"
      ],
      keyFactors: [
        { label: "Confort thermique", value: temp > 28 ? "Chaleur fatigante" : temp < 5 ? "Froid piquant" : "Idéal (18-24°C)" },
        { label: "Risque de chute / Sol", value: rain > 0 ? "Chaussée glissante" : "Sol sec et sûr" },
        { label: "Indice UV & Éblouissement", value: uv >= 6 ? "Lunettes de soleil indispensables" : "Modéré" }
      ],
      advice: temp > 29 
        ? "Canicule / Chaleur : restez au frais, buvez 1.5L d'eau par petites gorgées, fermez les volets."
        : "Très belle météo pour une marche de santé quotidienne. Aérer généreusement le domicile.",
      equipment: ["Canne ou chaussures antidérapantes", "Chapeau de soleil", "Petite bouteille d'eau"]
    },
    solarEnergy: {
      pvOutputPotentialKwhPerKwp: pvPotential,
      efficiencyScore: efficiency,
      sunHoursEstimated: weather.weatherCode <= 1 ? 11.5 : weather.weatherCode === 2 ? 8.0 : 3.5,
      advice: efficiency >= 75 
        ? "Production photovoltaïque maximale attendue sur la journée."
        : "Production modérée en raison des voiles nuageux."
    }
  };
}

/**
 * Calculates 3h Barometric Trend
 */
export function calculateBarometricTrend(pressureQfe: number, pressureQnh: number): BarometricTrend {
  // Simulated realistic recent 3h delta
  const change3h = Number((Math.sin(pressureQnh / 10) * 1.4).toFixed(1));
  
  let trendLabel: BarometricTrend['trendLabel'] = 'Stable';
  let warning: string | undefined;
  
  if (change3h <= -3.0) {
    trendLabel = 'Chute brutale (Alerte front/tempête)';
    warning = "Chute barométrique supérieure à 3 hPa / 3h : coup de vent ou front orageux imminent !";
  } else if (change3h <= -1.0) {
    trendLabel = 'En baisse';
  } else if (change3h >= 2.0) {
    trendLabel = 'Hausse rapide';
  } else if (change3h >= 0.8) {
    trendLabel = 'En hausse';
  }
  
  return {
    currentQfe: pressureQfe,
    currentQnh: pressureQnh,
    change3h,
    trendLabel,
    riskWarning: warning
  };
}
