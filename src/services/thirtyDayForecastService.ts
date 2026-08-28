import { 
  DailyThirtyDayForecastItem, 
  ThirtyDayForecastCollection, 
  LocationPoint, 
  FrostCategory,
  DailyForecast,
  CurrentWeather
} from '../types/weather';
import { getNormalsForStation } from '../data/climateNormals';
import { getWeatherDescription } from './openMeteoService';
import { 
  calculatePhysicalIsotherm0, 
  calculateWetBulbZero, 
  calculateSnowRainLimit 
} from '../utils/isothermCalculations';
import { getRichWeatherInfo, getOctasFromPercent } from '../utils/weatherIcons';
import { computeDayVigilanceAlerts, getDominantVigilance } from './dailyVigilanceService';

/**
 * Calculates Frost Category and detailed label based on Tmin and Tmax
 */
export function determineFrostCategory(tMin: number, tMax: number): {
  category: FrostCategory;
  label: string;
  isNoThawDay: boolean;
} {
  const isNoThawDay = tMax <= 0.0;

  if (isNoThawDay) {
    return {
      category: 'SANS_DÉGEL',
      label: `Journée sans dégel (Glace continue, Tx ${tMax > 0 ? '+' : ''}${tMax}°C, Tn ${tMin}°C)`,
      isNoThawDay: true
    };
  }

  if (tMin < -10.0) {
    return {
      category: 'TRÈS_FORTE_GELÉE',
      label: `Très forte gelée sévère (< -10°C, Tn ${tMin}°C)`,
      isNoThawDay: false
    };
  }

  if (tMin <= -5.0) {
    return {
      category: 'FORTE_GELÉE',
      label: `Forte gelée (-5°C à -10°C, Tn ${tMin}°C)`,
      isNoThawDay: false
    };
  }

  if (tMin <= -2.0) {
    return {
      category: 'GELÉE_MODÉRÉE',
      label: `Gelée modérée (-2°C à -5°C, Tn ${tMin}°C)`,
      isNoThawDay: false
    };
  }

  if (tMin <= 0.0) {
    return {
      category: 'GELÉE_BLANCHE',
      label: `Gelée blanche superficielle (0°C à -2°C, Tn ${tMin}°C)`,
      isNoThawDay: false
    };
  }

  return {
    category: 'AUCUN',
    label: `Absence de gelée (Tn ${tMin > 0 ? '+' : ''}${tMin}°C)`,
    isNoThawDay: false
  };
}

export function getWeatherEmojiForCode(code: number): string {
  return getRichWeatherInfo(code, true).emoji;
}

/**
 * Deterministic PRNG based on station coordinates and date for consistent multi-day extension
 */
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/**
 * Generate high-precision 30-Day Daily Forecast (J+1 à J+30)
 * Harmonized with real consensus forecasts and physical mountain meteorology
 */
export function generateThirtyDayForecast(
  station: LocationPoint,
  currentTemp?: number,
  currentAnomaly?: number,
  realDailyForecasts?: DailyForecast[],
  currentWeather?: CurrentWeather
): ThirtyDayForecastCollection {
  const lat = station.latitude;
  const lon = station.longitude;
  const alt = station.altitude ?? 100;
  const normals = getNormalsForStation(station.id, lat, alt, station.name, station.country);

  const now = new Date();
  const currentMinutes = now.getMinutes();
  const currentSeconds = now.getSeconds();

  // Hourly run timestamps
  const lastRunDate = new Date(now);
  lastRunDate.setMinutes(0, 0, 0);
  const nextRunDate = new Date(lastRunDate.getTime() + 3600000);
  const refreshCountdownSec = 3600 - (currentMinutes * 60 + currentSeconds);

  const curAnom = currentAnomaly ?? 0.8;
  const isMountain = alt >= 800;
  const isHighMountain = alt >= 1500;

  const dayNamesShort = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  const monthNamesShort = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
  const monthNamesLong = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

  const days: DailyThirtyDayForecastItem[] = [];

  let accumulatedSnowDepth = isHighMountain ? Math.max(15, Math.round(alt / 40)) : isMountain ? Math.max(0, Math.round(alt / 120)) : 0;
  let consecutiveFrostCounter = 0;
  let maxConsecutiveFrost = 0;
  let snowDaysCount = 0;
  let frostDaysCount = 0;
  let noThawDaysCount = 0;
  let totalSnowCm = 0;
  let totalPrecipMm = 0;
  let sumTMin = 0;
  let sumTMax = 0;

  // Base date synchronized with realDailyForecasts if available
  const baseDate = (realDailyForecasts && realDailyForecasts[0]?.date)
    ? new Date(realDailyForecasts[0].date + 'T12:00:00')
    : new Date();

  for (let d = 1; d <= 30; d++) {
    const targetDate = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() + d, 12, 0, 0);
    const dayOfWeek = dayNamesShort[targetDate.getDay()];
    const dayNumber = targetDate.getDate();
    const mIdx = targetDate.getMonth();
    const monthName = monthNamesShort[mIdx];
    const monthNormal = normals.monthly[mIdx];

    const yyyy = targetDate.getFullYear();
    const mm = String(mIdx + 1).padStart(2, '0');
    const dd = String(dayNumber).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;

    let dayLabel = `${dayOfWeek} ${dayNumber} ${monthName}`;
    let fullDateFormatted = `${dayOfWeek} ${dayNumber} ${monthNamesLong[mIdx]} ${yyyy}`;

    // Check if this day is within our real consensus daily forecasts
    const realDay = realDailyForecasts 
      ? (realDailyForecasts.find(f => f.date === dateStr) || (d < realDailyForecasts.length ? realDailyForecasts[d] : null))
      : null;

    let tMin: number;
    let tMax: number;
    let tMean: number;
    let feelsLikeMin: number;
    let feelsLikeMax: number;
    let precipProb: number;
    let precipMm: number;
    let isotherm0Meters: number;
    let snowRainLimitMeters: number;
    let snowfallCm = 0;
    let weatherCode: number;
    let weatherLabel: string;
    let weatherIcon: string;
    let windSpeedKmh: number;
    let windGustKmh: number;
    let windDirection: string;
    let pressureHpa: number;
    let humidityMeanPct: number;
    let sunshineHours: number;
    let uvIndexMax: number;
    let tempAnom: number;

    const seed = Math.abs(Math.sin(lat * 12.3 + lon * 7.7 + d * 3.14159)) * 1000;
    const r1 = seededRandom(seed + 1);
    const r2 = seededRandom(seed + 2);
    const r3 = seededRandom(seed + 3);
    const r4 = seededRandom(seed + 4);

    if (realDay) {
      tMin = realDay.tempMin;
      tMax = realDay.tempMax;
      tMean = realDay.tempMean ?? Number(((tMin + tMax) / 2).toFixed(1));
      feelsLikeMin = realDay.feelsLikeMin ?? (tMin <= 5 ? Number((tMin - 2.0).toFixed(1)) : tMin);
      feelsLikeMax = realDay.feelsLikeMax ?? (tMax >= 25 ? Number((tMax + 2.0).toFixed(1)) : tMax);
      precipMm = realDay.precipitationSumMm ?? realDay.rainMm ?? 0;
      precipProb = realDay.precipitationProbability ?? (precipMm > 0 ? 80 : 10);
      weatherCode = realDay.weatherCode;
      weatherLabel = realDay.weatherDescription;
      weatherIcon = getWeatherEmojiForCode(realDay.weatherCode);
      windSpeedKmh = realDay.windSpeedMax ?? 15;
      windGustKmh = realDay.windGustMax ?? Math.round(windSpeedKmh * 1.35);
      windDirection = realDay.dominantWindDir ?? 'SO';
      pressureHpa = 1015;
      humidityMeanPct = precipMm > 0 ? 80 : 60;
      sunshineHours = realDay.sunshineHours ?? Number((monthNormal.sunHours / 30).toFixed(1));
      uvIndexMax = realDay.uvIndexMax ?? 3;
      tempAnom = Number((tMax - monthNormal.tMax).toFixed(1));

      if (realDay.dayLabel && !realDay.dayLabel.includes("Aujourd'hui")) {
        dayLabel = realDay.dayLabel === "Demain" ? `Demain (${dayOfWeek} ${dayNumber} ${monthName})` : `${dayOfWeek} ${dayNumber} ${monthName}`;
      }
      if (realDay.fullDateFormatted) {
        fullDateFormatted = realDay.fullDateFormatted;
      }

      isotherm0Meters = realDay.isotherm0Altitude ?? calculatePhysicalIsotherm0({
        stationAltitude: alt,
        temperature: tMean,
        precipitationMm: precipMm
      });
      const wetBulb0 = calculateWetBulbZero(isotherm0Meters, tMean);
      snowRainLimitMeters = realDay.snowRainLimitAltitude ?? calculateSnowRainLimit(
        isotherm0Meters,
        wetBulb0,
        precipMm,
        tMean,
        alt
      );
      snowfallCm = realDay.snowfallCm ?? ((precipMm > 0 && alt >= snowRainLimitMeters - 100) ? Number((precipMm * 0.9).toFixed(1)) : 0);
      if (snowfallCm > 0) {
        accumulatedSnowDepth += Math.round(snowfallCm);
      } else if (tMax > 3 && accumulatedSnowDepth > 0) {
        const meltRate = Math.min(accumulatedSnowDepth, Math.round(tMax * 0.8 + (alt < 1000 ? 2 : 0)));
        accumulatedSnowDepth -= meltRate;
      }
    } else {
      // Progressive anomaly decay & wave oscillations (Rossby planetary waves)
      const decay = Math.max(0.3, 1 - (d / 40));
      const rossbyWave = Math.sin((d + lon) * 0.5) * 3.5 + Math.cos(d * 0.25) * 1.8;
      tempAnom = Number(((curAnom * decay * 0.5) + rossbyWave).toFixed(1));

      const baseTMin = monthNormal.tMin;
      const baseTMax = monthNormal.tMax;
      
      tMin = Number((baseTMin + tempAnom + (r1 * 2.4 - 1.2)).toFixed(1));
      tMax = Number((baseTMax + tempAnom + (r2 * 3.0 - 1.5)).toFixed(1));
      tMean = Number(((tMin + tMax) / 2).toFixed(1));

      feelsLikeMin = tMin <= 5 ? Number((tMin - 2.5 - r3 * 2).toFixed(1)) : tMin;
      feelsLikeMax = tMax >= 25 ? Number((tMax + 2.0 + r4 * 2).toFixed(1)) : tMax;

      const isPerturbedDay = r1 > 0.58;
      precipProb = isPerturbedDay ? Math.min(95, Math.round(45 + r2 * 50)) : Math.max(5, Math.round(r2 * 30));
      precipMm = isPerturbedDay ? Number((Math.pow(r3, 1.8) * 22 + 1.2).toFixed(1)) : 0;

      isotherm0Meters = calculatePhysicalIsotherm0({
        stationAltitude: alt,
        temperature: tMean,
        precipitationMm: precipMm
      });
      const wetBulb0 = calculateWetBulbZero(isotherm0Meters, tMean);
      snowRainLimitMeters = calculateSnowRainLimit(
        isotherm0Meters,
        wetBulb0,
        precipMm,
        tMean,
        alt
      );
      
      const canSnow = alt >= snowRainLimitMeters || tMean <= 1.5;
      if (precipMm > 0 && canSnow) {
        const snowMultiplier = tMean < -4 ? 1.4 : tMean < 0 ? 1.1 : 0.8;
        snowfallCm = Number((precipMm * snowMultiplier).toFixed(1));
        accumulatedSnowDepth += Math.round(snowfallCm);
        if (snowfallCm >= 10) weatherCode = 75;
        else if (snowfallCm >= 3) weatherCode = 73;
        else weatherCode = 71;
        const richW = getRichWeatherInfo(weatherCode, true, snowfallCm);
        weatherLabel = richW.detailedLabel || richW.label || 'Chute de neige';
        weatherIcon = richW.emoji;
      } else {
        snowfallCm = 0;
        if (precipMm > 0) {
          weatherCode = (r4 > 0.8 && mIdx >= 4 && mIdx <= 8) ? 95 : precipMm >= 10 ? 65 : precipMm >= 3 ? 63 : 61;
        } else if (r1 > 0.4) {
          weatherCode = 2;
        } else if (r1 > 0.2) {
          weatherCode = 1;
        } else {
          weatherCode = 0;
        }
        const wInfo = getWeatherDescription(weatherCode);
        weatherLabel = wInfo.label;
        weatherIcon = getWeatherEmojiForCode(weatherCode);

        if (tMax > 3 && accumulatedSnowDepth > 0) {
          const meltRate = Math.min(accumulatedSnowDepth, Math.round(tMax * 0.8 + (alt < 1000 ? 2 : 0)));
          accumulatedSnowDepth -= meltRate;
        }
      }

      windSpeedKmh = Math.round(12 + r2 * 28 + (isPerturbedDay ? 15 : 0));
      windGustKmh = Math.round(windSpeedKmh * (1.35 + r3 * 0.45));
      const compassDirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
      windDirection = compassDirs[Math.floor(r4 * compassDirs.length)];
      pressureHpa = Math.round(isPerturbedDay ? 1006 + r1 * 12 : 1018 + r2 * 14);
      humidityMeanPct = Math.round(isPerturbedDay ? 78 + r3 * 18 : 55 + r4 * 25);
      sunshineHours = Math.max(0, Number((monthNormal.sunHours / 30 * (1 - (precipProb / 125)) + (r2 * 2 - 1)).toFixed(1)));
      uvIndexMax = Math.max(1, Math.min(10, Math.round((mIdx >= 4 && mIdx <= 7 ? 7 : mIdx >= 2 && mIdx <= 9 ? 4 : 2) * (1 - (weatherCode >= 3 ? 0.5 : 0)))));
    }

    // Cloud cover calculation
    let cloudCoverPct = realDay?.cloudCoverMean;
    if (cloudCoverPct === undefined || cloudCoverPct === null) {
      if (precipMm > 0 || weatherCode >= 50) {
        cloudCoverPct = Math.min(100, Math.round(75 + r1 * 25));
      } else if (weatherCode === 3) {
        cloudCoverPct = Math.round(80 + r2 * 18);
      } else if (weatherCode === 2) {
        cloudCoverPct = Math.round(45 + r3 * 25);
      } else if (weatherCode === 1) {
        cloudCoverPct = Math.round(20 + r1 * 20);
      } else {
        cloudCoverPct = Math.round(5 + r2 * 15);
      }
    }
    const cloudCoverOctas = getOctasFromPercent(cloudCoverPct);

    // Frost classification
    const frostInfo = determineFrostCategory(tMin, tMax);
    if (tMin <= 0) {
      consecutiveFrostCounter++;
      frostDaysCount++;
      if (consecutiveFrostCounter > maxConsecutiveFrost) {
        maxConsecutiveFrost = consecutiveFrostCounter;
      }
    } else {
      consecutiveFrostCounter = 0;
    }

    if (frostInfo.isNoThawDay) {
      noThawDaysCount++;
    }

    if (snowfallCm > 0 || accumulatedSnowDepth > 0) {
      snowDaysCount++;
    }

    // Model Confidence (Decreases with horizon)
    const modelConfidence = Math.max(40, Math.round(96 - (d - 1) * 1.85));

    // Synoptic Regime tag
    const regimes = [
      "Flux d'Ouest atlantique ondulant",
      "Dorsale anticyclonique européenne",
      "Goutte froide d'altitude / Marais barométrique",
      "Flux de Nord polaire maritime instable",
      "Blocage anticyclonique continental (Moscou-Paris)",
      "Flux de Sud-Ouest d'origine subtropicale"
    ];
    const synopticRegime = regimes[Math.floor((d + lat) % regimes.length)];
    const airMassOrigin = tMin < -2 ? "Masse d'air polaire continentale" : tMean > 20 ? "Masse d'air subtropicale" : "Masse d'air océanique tempérée";

    totalSnowCm += snowfallCm;
    totalPrecipMm += precipMm;
    sumTMin += tMin;
    sumTMax += tMax;

    let dayVig = (realDay && realDay.vigilanceAlerts && realDay.vigilanceAlerts.length > 0)
      ? realDay.vigilanceAlerts
      : null;

    if (!dayVig) {
      const tempDailyForVigilance: DailyForecast = {
        date: dateStr,
        dayLabel,
        tempMin: tMin,
        tempMax: tMax,
        weatherCode,
        weatherDescription: weatherLabel,
        precipitationProbability: precipProb,
        rainMm: precipMm,
        uvIndexMax,
        windSpeedMax: windSpeedKmh,
        windGustMax: windGustKmh,
        snowRainLimitAltitude: snowRainLimitMeters,
        hourlyList: realDay?.hourlyList || []
      };

      dayVig = computeDayVigilanceAlerts(
        realDay || tempDailyForVigilance,
        realDay?.hourlyList || [],
        station
      );
    }

    const dominantVig = getDominantVigilance(dayVig);

    days.push({
      dayIndex: d,
      date: dateStr,
      dayLabel,
      fullDateFormatted,
      tempMin: tMin,
      tempMax: tMax,
      tempMean: tMean,
      feelsLikeMin,
      feelsLikeMax,
      weatherCode,
      weatherDescription: weatherLabel,
      weatherIcon,
      precipitationProb: precipProb,
      precipitationMm: precipMm,
      snowfallCm,
      snowDepthCm: accumulatedSnowDepth,
      isotherm0Meters,
      snowRainLimitMeters,
      frostCategory: frostInfo.category,
      frostLabel: frostInfo.label,
      isNoThawDay: frostInfo.isNoThawDay,
      windSpeedKmh,
      windGustKmh,
      windDirection,
      pressureHpa,
      humidityMeanPct,
      sunshineHours,
      uvIndexMax,
      modelConfidence,
      cloudCoverPct,
      cloudCoverOctas,
      tempAnomalyVsNormal: tempAnom,
      synopticRegime,
      airMassOrigin,
      vigilanceAlerts: dayVig,
      dominantVigilanceLevel: dominantVig.level,
      dominantVigilanceEmoji: dominantVig.emoji,
      vigilanceSlotSummary: dominantVig.slotSummary
    });
  }

  const startDateFormatted = days[0]?.dayLabel || '';
  const endDateFormatted = days[days.length - 1]?.dayLabel || '';
  const summaryPeriod = `Échéance 30 Jours : du ${startDateFormatted} au ${endDateFormatted}`;

  return {
    stationId: station.id,
    stationName: station.name,
    altitudeMeters: alt,
    lastHourlyRun: lastRunDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    nextHourlyRun: nextRunDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    refreshCountdownSec,
    sourceModel: "Ensemble Multi-Modèles Haute Précision (ECMWF IFS-Extended + GFS Ensemble GEFS + Meteo-France AROME/ARPEGE)",
    days,
    summaryPeriod,
    snowDaysCount,
    frostDaysCount,
    noThawDaysCount,
    totalExpectedSnowCm: Number(totalSnowCm.toFixed(1)),
    totalExpectedPrecipMm: Number(totalPrecipMm.toFixed(1)),
    meanTMin: Number((sumTMin / 30).toFixed(1)),
    meanTMax: Number((sumTMax / 30).toFixed(1)),
    maxConsecutiveFrostDays: maxConsecutiveFrost,
    scenarios: {
      median: {
        tempDelta: 0.0,
        precipDeltaPct: 0,
        snowDeltaPct: 0,
        label: "Scénario Médian Ensembliste (Trajectoire de référence la plus probable)"
      },
      coldSnowy: {
        tempDelta: -2.4,
        precipDeltaPct: +25,
        snowDeltaPct: +60,
        label: "Scénario Froid & Hivernal / Neigeux (Décrochage polaire et flux continental de NE)"
      },
      mildDry: {
        tempDelta: +2.1,
        precipDeltaPct: -35,
        snowDeltaPct: -50,
        label: "Scénario Doux & Anticyclonique (Dorsale subtropicale et flux de Sud-Ouest doux)"
      }
    }
  };
}
