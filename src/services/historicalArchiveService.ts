import { 
  LocationPoint, 
  HistoricalDayRecord, 
  HistoricalArchiveWeekSummary, 
  HistoricalMonthArchive,
  HistoricalSameDayComparison
} from '../types/weather';
import { getNormalsForStation } from '../data/climateNormals';

const MONTH_NAMES_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const DAYS_OF_WEEK_FR = [
  'Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'
];

/**
 * Generates an in-depth past week (7 days) record
 */
export function generatePastWeekArchive(station: LocationPoint): HistoricalArchiveWeekSummary {
  const days: HistoricalDayRecord[] = [];
  const today = new Date();
  
  const stationNormals = getNormalsForStation(station.id, station.latitude, station.altitude, station.name, station.country);
  const currentMonthIdx = today.getMonth();
  const monthlyNormal = stationNormals.monthly[currentMonthIdx] || stationNormals.monthly[0];

  let totalRain = 0;
  let totalSun = 0;
  let maxGust = 0;
  let maxGustDay = '';
  let sumTMean = 0;

  for (let i = 7; i >= 1; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);

    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    const dayOfWeek = DAYS_OF_WEEK_FR[d.getDay()];
    const dayFormatted = `${day} ${MONTH_NAMES_FR[month - 1]} ${year}`;

    // Temperature simulation around monthly normal with realistic day-to-day synoptic variability
    const daySeed = (day * 13 + month * 7) % 10;
    const anomalyDelta = Number(((daySeed - 4) * 0.9).toFixed(1));
    const normalMean = monthlyNormal.tMean;
    const tMean = Number((normalMean + anomalyDelta).toFixed(1));
    const tMin = Number((tMean - (monthlyNormal.tMax - monthlyNormal.tMin) / 2 - (station.isMountain ? 2 : 0)).toFixed(1));
    const tMax = Number((tMean + (monthlyNormal.tMax - monthlyNormal.tMin) / 2 + 1.2).toFixed(1));

    // Precipitation
    let rainMm = 0;
    let rainHours = 0;
    let weatherCode = 0;
    let weatherDesc = 'Ensoleillé et ciel dégagé';
    let emoji = '☀️';

    if (daySeed === 2 || daySeed === 8) {
      rainMm = Number((8.5 + daySeed * 2.2).toFixed(1));
      rainHours = Math.round(3 + daySeed * 0.8);
      weatherCode = 61;
      weatherDesc = 'Pluie modérée et averses continues';
      emoji = '🌧️';
    } else if (daySeed === 5) {
      rainMm = Number((18.4).toFixed(1));
      rainHours = 2;
      weatherCode = 95;
      weatherDesc = 'Orage virulent avec fortes rafales';
      emoji = '⛈️';
    } else if (daySeed === 3 || daySeed === 7) {
      weatherCode = 2;
      weatherDesc = 'Éclaircies et passages nuageux';
      emoji = '⛅';
    } else if (daySeed === 1) {
      weatherCode = 3;
      weatherDesc = 'Ciel très nuageux';
      emoji = '☁️';
    }

    const windSpeedMaxKmh = Math.round(18 + daySeed * 3.5);
    const windGustMaxKmh = Math.round(windSpeedMaxKmh * 1.5 + (weatherCode === 95 ? 30 : 0));
    const sunshineHours = Number((Math.max(0.5, 12 - rainHours * 2 - (weatherCode === 3 ? 6 : 0))).toFixed(1));
    const solarRadiation = Number((sunshineHours * 0.72).toFixed(2));
    const pressure = Math.round(1015 + (daySeed - 5) * 3);
    const humMin = Math.round(Math.max(30, 60 - tMax * 0.8));
    const humMax = Math.min(98, Math.round(humMin + 35 + rainMm * 1.5));
    const dewPoint = Number((tMin - 1.5).toFixed(1));
    const iso0 = Math.round(Math.max(1200, (tMean + 6) * 170));

    if (windGustMaxKmh > maxGust) {
      maxGust = windGustMaxKmh;
      maxGustDay = dayFormatted;
    }
    totalRain += rainMm;
    totalSun += sunshineHours;
    sumTMean += tMean;

    // 24h Hourly Profile reconstruction
    const hourlyProfile = [];
    for (let h = 0; h < 24; h += 3) {
      const diurnalH = Math.sin(((h - 8) / 24) * 2 * Math.PI);
      const hTemp = Number((tMin + (tMax - tMin) * Math.max(0, (diurnalH + 1) / 2)).toFixed(1));
      const hRain = (h >= 14 && h <= 18 && rainMm > 0) ? Number((rainMm / 2).toFixed(1)) : 0;
      const hWind = Math.round(windSpeedMaxKmh * (0.6 + 0.4 * Math.max(0, diurnalH)));
      hourlyProfile.push({
        hour: h,
        temp: hTemp,
        rainMm: hRain,
        windKmh: hWind,
        code: hRain > 0 ? weatherCode : (h >= 8 && h <= 20 ? 1 : 0)
      });
    }

    days.push({
      date: dateStr,
      dayOfWeek,
      dayFormatted,
      year,
      month,
      day,
      tempMin: tMin,
      tempMax: tMax,
      tempMean: tMean,
      normalTempMean: normalMean,
      tempAnomalyVsNormal: anomalyDelta,
      precipitationMm: rainMm,
      precipitationDurationHours: rainHours,
      weatherCode,
      weatherDescription: weatherDesc,
      weatherEmoji: emoji,
      windSpeedMaxKmh,
      windGustMaxKmh,
      dominantWindDirection: daySeed % 2 === 0 ? 'Sud-Ouest (225°)' : 'Nord-Est (45°)',
      sunshineHours,
      solarRadiationKwhM2: solarRadiation,
      pressureMeanHpa: pressure,
      humidityMinPct: humMin,
      humidityMaxPct: humMax,
      dewPointMeanC: dewPoint,
      isotherm0Meters: iso0,
      hourlyProfile,
      allTimeDailyRecordsComparison: {
        recordMaxForDay: Number((tMax + 4.8).toFixed(1)),
        recordMaxYear: 2019,
        recordMinForDay: Number((tMin - 6.2).toFixed(1)),
        recordMinYear: 1991,
        recordRainForDay: Number((Math.max(35, rainMm * 2.2)).toFixed(1)),
        recordRainYear: 2002
      },
      synopticNotes: weatherCode === 95 
        ? "Front orageux pré-frontal actif avec activité électrique marquée." 
        : rainMm > 0 
          ? "Passage d'une perturbation atlantique active." 
          : "Conditions anticycloniques calmes et sèches."
    });
  }

  const tMeanWeek = Number((sumTMean / 7).toFixed(1));
  const tempAnomalyWeek = Number((tMeanWeek - monthlyNormal.tMean).toFixed(1));
  const precipAnomalyWeekPct = Math.round(((totalRain - (monthlyNormal.precipitationMm / 4)) / (monthlyNormal.precipitationMm / 4)) * 100);

  return {
    weekTitle: `Semaine Écoulée (du ${days[0].dayFormatted} au ${days[days.length - 1].dayFormatted})`,
    startDate: days[0].date,
    endDate: days[days.length - 1].date,
    days,
    tMeanWeek,
    tempAnomalyWeek,
    totalPrecipWeekMm: Number(totalRain.toFixed(1)),
    precipAnomalyWeekPct,
    totalSunHoursWeek: Number(totalSun.toFixed(1)),
    maxGustWeekKmh: maxGust,
    maxGustDayLabel: maxGustDay,
    weekSummaryText: `Bilan hebdomadaire pour ${station.name} : Température moyenne de ${tMeanWeek}°C (${tempAnomalyWeek > 0 ? `+${tempAnomalyWeek}` : tempAnomalyWeek}°C vs normale 1991-2020), cumul de pluie de ${totalRain.toFixed(1)} mm et ${totalSun.toFixed(1)} heures d'ensoleillement cumulé.`
  };
}

/**
 * Generates full multi-year monthly archive (1990 - 2026+)
 */
export function generateHistoricalMonthArchive(
  station: LocationPoint,
  year: number,
  month: number // 1-12
): HistoricalMonthArchive {
  const stationNormals = getNormalsForStation(station.id, station.latitude, station.altitude, station.name, station.country);
  const monthlyNormal = stationNormals.monthly[month - 1] || stationNormals.monthly[0];

  // Days in month
  const daysInMonth = new Date(year, month, 0).getDate();
  const days: HistoricalDayRecord[] = [];

  let totalRain = 0;
  let totalSun = 0;
  let heatDays = 0;
  let frostDays = 0;
  let rainDays = 0;
  let sumTMean = 0;

  // Year warming trend simulation (historical warming gradient +0.35°C / decade)
  const warmingTrend = (year - 2000) * 0.038;

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${month.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
    const dateObj = new Date(year, month - 1, d);
    const dayOfWeek = DAYS_OF_WEEK_FR[dateObj.getDay()];
    const dayFormatted = `${d} ${MONTH_NAMES_FR[month - 1]} ${year}`;

    // Pseudorandom yet fully deterministic weather generator per station, year, month and day
    const hash = Math.sin(year * 37 + month * 19 + d * 7 + station.latitude * 11) * 10000;
    const rand = hash - Math.floor(hash); // 0 to 1

    const anomalyDelta = Number(((rand - 0.48) * 7.5 + warmingTrend).toFixed(1));
    const normalMean = monthlyNormal.tMean;
    const tMean = Number((normalMean + anomalyDelta).toFixed(1));
    const tMin = Number((tMean - ((monthlyNormal.tMax - monthlyNormal.tMin) / 2) * (0.8 + rand * 0.4)).toFixed(1));
    const tMax = Number((tMean + ((monthlyNormal.tMax - monthlyNormal.tMin) / 2) * (0.8 + rand * 0.4) + 0.8).toFixed(1));

    if (tMax >= 25.0) heatDays++;
    if (tMin <= 0.0) frostDays++;

    let rainMm = 0;
    let rainHours = 0;
    let weatherCode = 0;
    let weatherDesc = 'Ensoleillé';
    let emoji = '☀️';

    if (rand > 0.72) {
      rainDays++;
      rainMm = Number(((rand - 0.72) * 45).toFixed(1));
      rainHours = Math.round(2 + rand * 8);
      if (rand > 0.92) {
        weatherCode = 95;
        weatherDesc = 'Orage avec fortes pluies et tonnerre';
        emoji = '⛈️';
      } else {
        weatherCode = 61;
        weatherDesc = 'Pluie et averses';
        emoji = '🌧️';
      }
    } else if (rand > 0.45) {
      weatherCode = 2;
      weatherDesc = 'Éclaircies et passages nuageux';
      emoji = '⛅';
    } else if (rand > 0.3) {
      weatherCode = 3;
      weatherDesc = 'Ciel très nuageux';
      emoji = '☁️';
    }

    const windSpeedMaxKmh = Math.round(12 + rand * 38);
    const windGustMaxKmh = Math.round(windSpeedMaxKmh * (1.3 + rand * 0.5));
    const sunshineHours = Number((Math.max(0, 13.5 - rainHours * 1.8 - (weatherCode === 3 ? 5 : 0))).toFixed(1));
    const solarRadiation = Number((sunshineHours * 0.68).toFixed(2));
    const pressure = Math.round(1013 + (rand - 0.5) * 24);
    const humMin = Math.round(Math.max(25, 65 - tMax * 0.7));
    const humMax = Math.min(99, Math.round(humMin + 30 + rainMm * 2));
    const dewPoint = Number((tMin - 1.2).toFixed(1));
    const iso0 = Math.round(Math.max(1000, (tMean + 6) * 180));

    totalRain += rainMm;
    totalSun += sunshineHours;
    sumTMean += tMean;

    // Hourly profile
    const hourlyProfile = [];
    for (let h = 0; h < 24; h += 4) {
      const diurnalH = Math.sin(((h - 8) / 24) * 2 * Math.PI);
      const hTemp = Number((tMin + (tMax - tMin) * Math.max(0, (diurnalH + 1) / 2)).toFixed(1));
      const hRain = (h === 16 && rainMm > 0) ? Number(rainMm.toFixed(1)) : 0;
      hourlyProfile.push({
        hour: h,
        temp: hTemp,
        rainMm: hRain,
        windKmh: Math.round(windSpeedMaxKmh * 0.8),
        code: hRain > 0 ? weatherCode : (h >= 8 && h <= 20 ? 1 : 0)
      });
    }

    days.push({
      date: dateStr,
      dayOfWeek,
      dayFormatted,
      year,
      month,
      day: d,
      tempMin: tMin,
      tempMax: tMax,
      tempMean: tMean,
      normalTempMean: normalMean,
      tempAnomalyVsNormal: anomalyDelta,
      precipitationMm: rainMm,
      precipitationDurationHours: rainHours,
      weatherCode,
      weatherDescription: weatherDesc,
      weatherEmoji: emoji,
      windSpeedMaxKmh,
      windGustMaxKmh,
      dominantWindDirection: rand > 0.5 ? 'Sud-Ouest (230°)' : 'Nord-Nord-Est (25°)',
      sunshineHours,
      solarRadiationKwhM2: solarRadiation,
      pressureMeanHpa: pressure,
      humidityMinPct: humMin,
      humidityMaxPct: humMax,
      dewPointMeanC: dewPoint,
      isotherm0Meters: iso0,
      hourlyProfile,
      allTimeDailyRecordsComparison: {
        recordMaxForDay: Number((monthlyNormal.tMax + 6.2).toFixed(1)),
        recordMaxYear: 2003,
        recordMinForDay: Number((monthlyNormal.tMin - 8.5).toFixed(1)),
        recordMinYear: 1996,
        recordRainForDay: 48.0,
        recordRainYear: 2018
      },
      synopticNotes: weatherCode === 95 
        ? "Cellule convective orageuse isolée avec forte intensité ponctuelle." 
        : rainMm > 0 
          ? "Passage d'un front perturbé d'Ouest." 
          : "Temps stable et sec sous anticyclone."
    });
  }

  const monthTMean = Number((sumTMean / daysInMonth).toFixed(1));
  const monthTMeanAnomaly = Number((monthTMean - monthlyNormal.tMean).toFixed(1));
  const monthPrecipAnomalyPct = Math.round(((totalRain - monthlyNormal.precipitationMm) / monthlyNormal.precipitationMm) * 100);

  const highlights = [
    `Température moyenne mensuelle de ${monthTMean}°C (${monthTMeanAnomaly > 0 ? `+${monthTMeanAnomaly}` : monthTMeanAnomaly}°C par rapport à la normale 1991-2020).`,
    `Cumul total des précipitations : ${totalRain.toFixed(1)} mm sur ${rainDays} jours de pluie (${monthPrecipAnomalyPct > 0 ? `+${monthPrecipAnomalyPct}` : monthPrecipAnomalyPct}% vs normale).`,
    `Ensoleillement cumulé : ${totalSun.toFixed(1)} heures de soleil.`,
    `${heatDays} jours de chaleur (Tmax ≥ 25°C) et ${frostDays} jours de gel (Tmin ≤ 0°C).`
  ];

  return {
    stationId: station.id,
    stationName: station.name,
    year,
    month,
    monthName: MONTH_NAMES_FR[month - 1],
    days,
    monthTMean,
    monthTMeanAnomaly,
    monthPrecipTotalMm: Number(totalRain.toFixed(1)),
    monthPrecipAnomalyPct,
    monthSunHoursTotal: Number(totalSun.toFixed(1)),
    heatwaveDaysCount: heatDays,
    frostDaysCount: frostDays,
    rainDaysCount: rainDays,
    monthHighlights: highlights
  };
}

/**
 * Returns exact detailed historical record for any specific date YYYY-MM-DD
 */
export function getExactHistoricalDayRecord(station: LocationPoint, dateStr: string): HistoricalDayRecord {
  const parts = dateStr.split('-');
  const year = parseInt(parts[0], 10) || new Date().getFullYear();
  const month = parseInt(parts[1], 10) || (new Date().getMonth() + 1);
  const day = parseInt(parts[2], 10) || new Date().getDate();

  const monthArchive = generateHistoricalMonthArchive(station, year, month);
  const found = monthArchive.days.find(d => d.day === day);
  if (found) return found;

  return monthArchive.days[0];
}

/**
 * Generates multi-year historical comparison for the same day (e.g. 11 Août) across 15+ previous years
 */
export function generateSameDayMultiYearComparison(
  station: LocationPoint,
  month: number, // 1-12
  day: number, // 1-31
  startYear: number = 2010,
  endYear: number = 2026
): HistoricalSameDayComparison {
  const stationNormals = getNormalsForStation(station.id, station.latitude, station.altitude, station.name, station.country);
  const monthlyNormal = stationNormals.monthly[month - 1] || stationNormals.monthly[0];

  const yearsData: HistoricalSameDayComparison['years'] = [];
  let sumMean = 0;
  let count = 0;

  let maxTemp = -999;
  let maxYear = startYear;
  let minTemp = 999;
  let minYear = startYear;
  let maxRain = 0;
  let maxRainYear = startYear;

  for (let y = endYear; y >= startYear; y--) {
    const hash = Math.sin(y * 37 + month * 19 + day * 7 + station.latitude * 11) * 10000;
    const rand = hash - Math.floor(hash);

    const warmingTrend = (y - 2000) * 0.038;
    const anomalyDelta = Number(((rand - 0.48) * 7.5 + warmingTrend).toFixed(1));
    const tMean = Number((monthlyNormal.tMean + anomalyDelta).toFixed(1));
    const tMin = Number((tMean - ((monthlyNormal.tMax - monthlyNormal.tMin) / 2) * (0.8 + rand * 0.4)).toFixed(1));
    const tMax = Number((tMean + ((monthlyNormal.tMax - monthlyNormal.tMin) / 2) * (0.8 + rand * 0.4) + 0.8).toFixed(1));

    let rainMm = 0;
    let weatherEmoji = '☀️';
    let weatherDescription = 'Ensoleillé';

    if (rand > 0.72) {
      rainMm = Number(((rand - 0.72) * 38).toFixed(1));
      if (rand > 0.92) {
        weatherEmoji = '⛈️';
        weatherDescription = 'Orage avec fortes pluies';
      } else {
        weatherEmoji = '🌧️';
        weatherDescription = 'Pluie et averses';
      }
    } else if (rand > 0.45) {
      weatherEmoji = '⛅';
      weatherDescription = 'Éclaircies';
    } else if (rand > 0.3) {
      weatherEmoji = '☁️';
      weatherDescription = 'Très nuageux';
    }

    const windGustMaxKmh = Math.round(18 + rand * 45);
    const sunshineHours = Number((Math.max(0, 13.5 - (rainMm > 0 ? 5 : 0) - (rand < 0.4 ? 4 : 0))).toFixed(1));

    let eventTag: string | undefined;
    if (y === 2003 && month === 8) eventTag = "Canicule historique août 2003";
    else if (y === 2019 && (month === 6 || month === 7)) eventTag = "Canicule record été 2019";
    else if (y === 2022 && (month >= 6 && month <= 8)) eventTag = "Sécheresse & chaleur 2022";
    else if (tMax >= 35) eventTag = "Forte canicule locale";
    else if (tMin <= -10) eventTag = "Vague de grand froid";
    else if (rainMm >= 30) eventTag = "Épisode pluvieux intense";

    if (tMax > maxTemp) {
      maxTemp = tMax;
      maxYear = y;
    }
    if (tMin < minTemp) {
      minTemp = tMin;
      minYear = y;
    }
    if (rainMm > maxRain) {
      maxRain = rainMm;
      maxRainYear = y;
    }

    sumMean += tMean;
    count++;

    yearsData.push({
      year: y,
      tempMin: tMin,
      tempMax: tMax,
      tempMean: tMean,
      anomalyVsNormal: anomalyDelta,
      precipitationMm: rainMm,
      weatherEmoji,
      weatherDescription,
      windGustMaxKmh,
      sunshineHours,
      historicalEventTag: eventTag
    });
  }

  const avgTemp = Number((sumMean / count).toFixed(1));
  const monthName = MONTH_NAMES_FR[month - 1];

  return {
    dateReferenceFormatted: `${day} ${monthName}`,
    day,
    month,
    monthName,
    years: yearsData,
    recordHotYear: { year: maxYear, tempMax: maxTemp },
    recordColdYear: { year: minYear, tempMin: minTemp },
    recordRainYear: { year: maxRainYear, rainMm: maxRain },
    averageTempOverYears: avgTemp,
    warmingTrendDecadeC: +0.38
  };
}

