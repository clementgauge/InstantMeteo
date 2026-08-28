import { LocationPoint, CurrentWeather, HourlyForecast, DailyForecast } from '../types/weather';
import { 
  WeatherAlertNotification, 
  NotificationPreferences, 
  LiveThreatEvaluation, 
  AlertCategory, 
  AlertSeverity 
} from '../types/notifications';
import { calculateThunderstormAnalysis } from './thunderstormService';
import { computeMultiDayVigilanceMatrix } from './dailyVigilanceService';
import { calculateRadarProximity } from './seasonalProjectionService';

const PREFS_STORAGE_KEY = 'instant_meteo_notification_prefs';
const HISTORY_STORAGE_KEY = 'instant_meteo_notification_history';
const LAST_DISPATCH_STORAGE_KEY = 'instant_meteo_last_dispatched_alert';

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  enabled: true,
  soundAlerts: true,
  vibration: true,
  categories: {
    vigilance: true,
    thunderstorms: true,
    galeWind: true,
    torrentialRain: true,
    heatwave: true,
    frostSnow: true,
    radarProximity: true
  },
  radarDistanceThresholdKm: 100,
  radarApproachingOnly: true,
  minSeverity: 'MODERATE_PLUS',
  quietHoursEnabled: false,
  quietHoursStart: '23:00',
  quietHoursEnd: '07:00',
  urgentOverride: true,
  gpsAutoAlert: true,
};

/**
 * Loads user notification preferences from local storage.
 */
export function loadNotificationPreferences(): NotificationPreferences {
  try {
    const raw = localStorage.getItem(PREFS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_NOTIFICATION_PREFERENCES, ...parsed };
    }
  } catch (e) {
    console.warn("Failed to load notification preferences:", e);
  }
  return DEFAULT_NOTIFICATION_PREFERENCES;
}

/**
 * Saves user notification preferences.
 */
export function saveNotificationPreferences(prefs: NotificationPreferences): void {
  try {
    localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(prefs));
  } catch (e) {
    console.warn("Failed to save notification preferences:", e);
  }
}

/**
 * Check if the browser supports notifications.
 */
export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Gets current browser notification permission status.
 */
export function getBrowserNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) return 'denied';
  return Notification.permission;
}

/**
 * Request notification permission from the user.
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) return 'denied';
  try {
    const perm = await Notification.requestPermission();
    return perm;
  } catch (e) {
    console.error("Error requesting notification permission:", e);
    return 'denied';
  }
}

/**
 * Web Audio API synthesizer for instant rich sound feedback without external MP3 asset dependency.
 */
export function playAlertChime(severity: AlertSeverity = 'MODERATE'): void {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;

    if (severity === 'EXTREME' || severity === 'SEVERE') {
      // 2-tone urgent warning chime (880Hz -> 1174Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, now); // A5
      osc1.frequency.setValueAtTime(1174.66, now + 0.15); // D6
      
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.5);

      // Repeat second pulse for urgency
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(880, now + 0.3);
      osc2.frequency.setValueAtTime(1318.51, now + 0.45); // E6
      
      gain2.gain.setValueAtTime(0.35, now + 0.3);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.85);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.3);
      osc2.stop(now + 0.85);
    } else {
      // Gentle double ping for moderate alert
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880, now + 0.12); // A5
      
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
    }
  } catch (e) {
    console.warn("Web Audio chime failed or is blocked by browser autoplay:", e);
  }
}

/**
 * Intelligent Weather Alert Extraction & Analysis Engine.
 * Evaluates raw atmospheric physics + Météo-France vigilance models and extracts strictly relevant alerts.
 */
export function evaluateLiveThreatAndAlerts(
  station: LocationPoint,
  currentWeather: CurrentWeather | null,
  hourlyForecasts: HourlyForecast[],
  dailyForecasts: DailyForecast[]
): LiveThreatEvaluation {
  const alerts: WeatherAlertNotification[] = [];
  const now = new Date();
  const timestamp = Date.now();
  const formattedTime = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  if (!currentWeather) {
    return {
      threatScore: 0,
      threatLevel: 'CALME',
      dominantAlert: null,
      activeAlerts: [],
      radarProximityEchoes: {
        nearestStormDistanceKm: null,
        nearestStormEtaMin: null,
        nearestStormBearing: null,
        nearestRainDistanceKm: null,
        nearestRainEtaMin: null,
        nearestRainBearing: null,
        threateningCellsCount300km: 0,
        threateningCellsCount100km: 0,
        threateningCellsCount50km: 0,
        threateningCellsCount20km: 0
      },
      evaluationSummary: "En attente des données météorologiques...",
      calculatedAt: formattedTime
    };
  }

  // 1. Vigilance Matrix Analysis (Official Météo-France Model)
  const multiDayVigilance = computeMultiDayVigilanceMatrix(station, dailyForecasts, hourlyForecasts);
  const todayVigilance = multiDayVigilance.days[0];
  const tomorrowVigilance = multiDayVigilance.days[1];

  let maxVigilanceLevel = todayVigilance?.maxLevel || 'VERT';
  if (tomorrowVigilance && tomorrowVigilance.maxLevel === 'ROUGE') {
    maxVigilanceLevel = 'ROUGE';
  } else if (tomorrowVigilance && tomorrowVigilance.maxLevel === 'ORANGE' && maxVigilanceLevel !== 'ROUGE') {
    maxVigilanceLevel = 'ORANGE';
  }

  // 2. Convective Instability & Thunderstorm Index
  const stormAnalysis = calculateThunderstormAnalysis(station, currentWeather, hourlyForecasts);
  const cape = stormAnalysis.convectiveIndices.capeJkg;
  const maxGust = stormAnalysis.convectiveIndices.maxDownburstGustKmh;
  const hailRisk = stormAnalysis.convectiveIndices.hailProbabilityPercent;

  // 3. Hourly Peaks calculation across the next 24h
  const next24h = hourlyForecasts.slice(0, 24);
  let maxRainHourly = 0;
  let maxWindGustHourly = currentWeather.windGust || 0;
  let maxTempHourly = currentWeather.temperature || 0;
  let minTempHourly = currentWeather.temperature || 0;
  let peakRainHour = "16h00";
  let peakWindHour = "15h30";
  let peakTempHour = "16h00";

  next24h.forEach(h => {
    const rain = h.rainMm ?? h.precipitationMm ?? 0;
    const hourStr = h.hourLabel || h.time?.slice(11, 16) || "12h00";
    if (rain > maxRainHourly) {
      maxRainHourly = rain;
      peakRainHour = hourStr;
    }
    const gust = h.windGust || 0;
    if (gust > maxWindGustHourly) {
      maxWindGustHourly = gust;
      peakWindHour = hourStr;
    }
    if (h.temperature > maxTempHourly) {
      maxTempHourly = h.temperature;
      peakTempHour = hourStr;
    }
    if (h.temperature < minTempHourly) {
      minTempHourly = h.temperature;
    }
  });

  // Calculate Threat Score (0 - 100)
  let threatScore = 5;

  // ----------------------------------------------------
  // CRITERION 1: ORAGES VIOLENTS / SUPERCELLULES (Thunderstorms)
  // ----------------------------------------------------
  if (stormAnalysis.globalVigilanceLevel === 'ROUGE' || stormAnalysis.globalStormRiskScore >= 60 || cape >= 1400 || (todayVigilance && todayVigilance.dominantAlert?.phenomenon === 'ORAGES' && todayVigilance.maxLevel !== 'VERT')) {
    const isExtreme = cape > 2000 || todayVigilance?.maxLevel === 'ROUGE';
    const isOrange = cape >= 1200 || todayVigilance?.maxLevel === 'ORANGE';
    const severity: AlertSeverity = isExtreme ? 'EXTREME' : isOrange ? 'SEVERE' : 'MODERATE';
    
    threatScore = Math.max(threatScore, isExtreme ? 95 : isOrange ? 80 : 55);

    const peakH = todayVigilance?.dominantAlert?.eventPeakHour || todayVigilance?.dominantAlert?.peakHourFormatted || "16h30";
    const startH = todayVigilance?.dominantAlert?.eventStartHour || todayVigilance?.dominantAlert?.startHourFormatted || "14h00";
    const endH = todayVigilance?.dominantAlert?.eventEndHour || todayVigilance?.dominantAlert?.endHourFormatted || "20h00";

    alerts.push({
      id: `alert-storm-${station.id}-${todayVigilance?.dayDateStr || 'today'}`,
      timestamp,
      formattedTime,
      category: 'ORAGE',
      categoryLabel: 'Orages Violents & Convection',
      severity,
      severityLabel: severity === 'EXTREME' ? 'Alerte Rouge Orages' : severity === 'SEVERE' ? 'Alerte Orange Orages' : 'Vigilance Jaune Orages',
      badgeBg: severity === 'EXTREME' ? 'bg-rose-600' : severity === 'SEVERE' ? 'bg-amber-600' : 'bg-yellow-500',
      badgeColor: severity === 'EXTREME' ? 'text-white' : severity === 'SEVERE' ? 'text-white' : 'text-slate-950',
      emoji: '⚡',
      title: `Orages Violents prévus à ${station.name}`,
      shortSummary: `Pic d'activité vers ${peakH} avec CAPE ${cape} J/kg et rafales jusqu'à ${Math.max(maxGust, maxWindGustHourly)} km/h.`,
      detailedAnalysis: `Atmosphère fortement instable (Énergie Convective CAPE ${cape} J/kg, Indice de Soulèvement Lifted Index ${stormAnalysis.convectiveIndices.liftedIndex}°C). Risque de foudroiement intense, chutes de grêle (${hailRisk}%) et fortes bourrasques convectives.`,
      peakHour: peakH,
      timeWindow: `${startH} ➔ ${endH}`,
      safeReturnTime: `Avant ${Math.max(6, parseInt(startH.substring(0,2), 10) - 1 || 13)}h00`,
      keyMetrics: [
        { label: 'Énergie CAPE', value: `${cape} J/kg`, highlight: true },
        { label: 'Rafales Max', value: `${Math.max(maxGust, maxWindGustHourly)} km/h`, highlight: true },
        { label: 'Risque Grêle', value: `${hailRisk}%` },
        { label: 'Pic Prévu', value: peakH }
      ],
      safetyAdvice: [
        `Interrompez toute activité de plein air, randonnée ou baignade avant ${startH}.`,
        'Éloignez-vous des arbres isolés, crêtes et structures métalliques.',
        'Mettez à l\'abri vos biens sensibles et évitez l\'usage d\'appareils électriques filaires.'
      ],
      stationId: station.id,
      stationName: station.name,
      department: station.department,
      read: false
    });
  }

  // ----------------------------------------------------
  // CRITERION 2: RAFALES DE VENT VIOLENTES (Gale Winds)
  // ----------------------------------------------------
  if (maxWindGustHourly >= 70 || (todayVigilance && todayVigilance.dominantAlert?.phenomenon === 'VENT_VIOLENT_TORNADE' && todayVigilance.maxLevel !== 'VERT')) {
    const isExtreme = maxWindGustHourly >= 110 || todayVigilance?.maxLevel === 'ROUGE';
    const isOrange = maxWindGustHourly >= 90 || todayVigilance?.maxLevel === 'ORANGE';
    const severity: AlertSeverity = isExtreme ? 'EXTREME' : isOrange ? 'SEVERE' : 'MODERATE';
    
    threatScore = Math.max(threatScore, isExtreme ? 90 : isOrange ? 75 : 50);

    alerts.push({
      id: `alert-wind-${station.id}-${todayVigilance?.dayDateStr || 'today'}`,
      timestamp,
      formattedTime,
      category: 'VENT',
      categoryLabel: 'Vent Violent & Tempête',
      severity,
      severityLabel: severity === 'EXTREME' ? 'Alerte Tempête Violente' : severity === 'SEVERE' ? 'Fort Coup de Vent' : 'Bourrasques Notables',
      badgeBg: isExtreme ? 'bg-rose-600' : isOrange ? 'bg-amber-600' : 'bg-yellow-500',
      badgeColor: isExtreme || isOrange ? 'text-white' : 'text-slate-950',
      emoji: '💨',
      title: `Fortes rafales de vent à ${station.name}`,
      shortSummary: `Pointes mesurables jusqu'à ${maxWindGustHourly} km/h attendues vers ${peakWindHour}.`,
      detailedAnalysis: `Resserrage isobarique marqué provoquant de violentes rafales en plaine et sur le relief. Risque de chutes de branches et perturbation des transports.`,
      peakHour: peakWindHour,
      timeWindow: `13h00 ➔ 21h00`,
      keyMetrics: [
        { label: 'Rafale Max', value: `${maxWindGustHourly} km/h`, highlight: true },
        { label: 'Vent Moyen', value: `${currentWeather.windSpeed} km/h` },
        { label: 'Orientation', value: `${currentWeather.windDirection}°` }
      ],
      safetyAdvice: [
        'Limitez vos déplacements et évitez les zones boisées.',
        'Fixez ou rentrez les objets sensibles au vent sur vos balcons et terrasses.',
        'Prudence accrue au volant en particulier pour les véhicules hauts.'
      ],
      stationId: station.id,
      stationName: station.name,
      department: station.department,
      read: false
    });
  }

  // ----------------------------------------------------
  // CRITERION 3: PLUIES INTENSES / INONDATIONS (Torrential Rain)
  // ----------------------------------------------------
  if (maxRainHourly >= 10 || (todayVigilance && (todayVigilance.dominantAlert?.phenomenon === 'PLUIE_INONDATION') && todayVigilance.maxLevel !== 'VERT')) {
    const isExtreme = maxRainHourly >= 30 || todayVigilance?.maxLevel === 'ROUGE';
    const isOrange = maxRainHourly >= 18 || todayVigilance?.maxLevel === 'ORANGE';
    const severity: AlertSeverity = isExtreme ? 'EXTREME' : isOrange ? 'SEVERE' : 'MODERATE';
    
    threatScore = Math.max(threatScore, isExtreme ? 92 : isOrange ? 78 : 45);

    alerts.push({
      id: `alert-rain-${station.id}-${todayVigilance?.dayDateStr || 'today'}`,
      timestamp,
      formattedTime,
      category: 'PLUIE',
      categoryLabel: 'Pluie Intense & Ruissellement',
      severity,
      severityLabel: severity === 'EXTREME' ? 'Pluies Diluviennes' : severity === 'SEVERE' ? 'Fortes Précipitations' : 'Averses Soutenues',
      badgeBg: isExtreme ? 'bg-rose-600' : isOrange ? 'bg-amber-600' : 'bg-cyan-600',
      badgeColor: 'text-white',
      emoji: '🌧️',
      title: `Précipitations soutenues à ${station.name}`,
      shortSummary: `Intensités jusqu'à ${maxRainHourly.toFixed(1)} mm/h prévues vers ${peakRainHour}.`,
      detailedAnalysis: `Passage d'un front pluvieux très actif avec risque d'accumulation rapide d'eau sur les chaussées et saturation des sols.`,
      peakHour: peakRainHour,
      timeWindow: `12h00 ➔ 22h00`,
      keyMetrics: [
        { label: 'Intensité Pic', value: `${maxRainHourly.toFixed(1)} mm/h`, highlight: true },
        { label: 'Cumul 24h estimé', value: `${(maxRainHourly * 3.5).toFixed(0)} mm` },
        { label: 'Pression', value: `${currentWeather.pressure} hPa` }
      ],
      safetyAdvice: [
        'Ne vous engagez jamais sur une route immergée, même partiellement.',
        'Éloignez-vous des cours d\'eau et des points bas.',
        'Surveillez la montée des eaux dans les sous-sols et parkings souterrains.'
      ],
      stationId: station.id,
      stationName: station.name,
      department: station.department,
      read: false
    });
  }

  // ----------------------------------------------------
  // CRITERION 4: CANICULE / CHALEUR EXTRÊME (Heatwave)
  // ----------------------------------------------------
  const currentFeelsLike = currentWeather.feelsLike ?? currentWeather.temperature;
  if (maxTempHourly >= 34 || currentFeelsLike >= 37 || (todayVigilance && todayVigilance.dominantAlert?.phenomenon === 'CANICULE_CHALEUR' && todayVigilance.maxLevel !== 'VERT')) {
    const isExtreme = maxTempHourly >= 39 || todayVigilance?.maxLevel === 'ROUGE';
    const isOrange = maxTempHourly >= 36 || todayVigilance?.maxLevel === 'ORANGE';
    const severity: AlertSeverity = isExtreme ? 'EXTREME' : isOrange ? 'SEVERE' : 'MODERATE';
    
    threatScore = Math.max(threatScore, isExtreme ? 88 : isOrange ? 70 : 40);

    alerts.push({
      id: `alert-heat-${station.id}-${todayVigilance?.dayDateStr || 'today'}`,
      timestamp,
      formattedTime,
      category: 'CANICULE',
      categoryLabel: 'Canicule & Chaleur Intense',
      severity,
      severityLabel: isExtreme ? 'Alerte Canicule Extrême' : isOrange ? 'Vigilance Canicule' : 'Pic de Forte Chaleur',
      badgeBg: isExtreme ? 'bg-rose-600' : isOrange ? 'bg-amber-600' : 'bg-orange-500',
      badgeColor: 'text-white',
      emoji: '☀️',
      title: `Pic de Chaleur Sévère à ${station.name}`,
      shortSummary: `Température maximale attendue de ${maxTempHourly.toFixed(1)}°C (ressenti ${currentFeelsLike.toFixed(1)}°C) vers ${peakTempHour}.`,
      detailedAnalysis: `Masse d'air surchauffée avec maintien de températures nocturnes élevées limitant la récupération thermique corporelle.`,
      peakHour: peakTempHour,
      timeWindow: `12h00 ➔ 19h30`,
      keyMetrics: [
        { label: 'Tx Maximale', value: `${maxTempHourly.toFixed(1)}°C`, highlight: true },
        { label: 'Ressenti Humidex', value: `${currentFeelsLike.toFixed(1)}°C`, highlight: true },
        { label: 'Tn Nocturne', value: `${minTempHourly.toFixed(1)}°C` }
      ],
      safetyAdvice: [
        'Buvez régulièrement de l\'eau sans attendre d\'avoir soif.',
        'Évitez de sortir aux heures les plus chaudes (12h - 18h) et fermez vos volets.',
        'Prenez régulièrement des nouvelles des personnes âgées ou fragiles de votre entourage.'
      ],
      stationId: station.id,
      stationName: station.name,
      department: station.department,
      read: false
    });
  }

  // ----------------------------------------------------
  // CRITERION 5: GEL / NEIGE / GRAND FROID (Frost & Snow)
  // ----------------------------------------------------
  const approxDewPoint = currentWeather.altitudeMetrics?.dewPoint ?? Number((currentWeather.temperature - (100 - currentWeather.humidity) / 5).toFixed(1));
  if (minTempHourly <= 1.0 || (todayVigilance && (todayVigilance.dominantAlert?.phenomenon === 'NEIGE_VERGLAS' || todayVigilance.dominantAlert?.phenomenon === 'GRAND_FROID_GEL') && todayVigilance.maxLevel !== 'VERT')) {
    const isExtreme = minTempHourly <= -10 || todayVigilance?.maxLevel === 'ROUGE';
    const isOrange = minTempHourly <= -4 || todayVigilance?.maxLevel === 'ORANGE';
    const severity: AlertSeverity = isExtreme ? 'EXTREME' : isOrange ? 'SEVERE' : 'MODERATE';
    
    threatScore = Math.max(threatScore, isExtreme ? 85 : isOrange ? 68 : 35);

    alerts.push({
      id: `alert-frost-${station.id}-${todayVigilance?.dayDateStr || 'today'}`,
      timestamp,
      formattedTime,
      category: 'GEL_NEIGE',
      categoryLabel: 'Gelée, Neige & Verglas',
      severity,
      severityLabel: isExtreme ? 'Grand Froid Polaire' : isOrange ? 'Risque Neige/Verglas Accru' : 'Gelées Nocturnes',
      badgeBg: isExtreme ? 'bg-indigo-700' : isOrange ? 'bg-blue-600' : 'bg-cyan-600',
      badgeColor: 'text-white',
      emoji: '❄️',
      title: `Risque de Gelées / Verglas à ${station.name}`,
      shortSummary: `Baisse des températures jusqu'à ${minTempHourly.toFixed(1)}°C en fin de nuit / matinée.`,
      detailedAnalysis: `Refroidissement radiatif nocturne propice à la formation de gelées au sol et risque de chaussées glissantes.`,
      peakHour: '06h30',
      timeWindow: `02h00 ➔ 08h30`,
      keyMetrics: [
        { label: 'Tn Minimale', value: `${minTempHourly.toFixed(1)}°C`, highlight: true },
        { label: 'Point de Rosée', value: `${approxDewPoint}°C` },
        { label: 'Altitude', value: `${station.altitude} m` }
      ],
      safetyAdvice: [
        'Équipez vos véhicules de pneus hiver / chaînes si vous devez circuler.',
        'Protégez les végétaux sensibles et les canalisations extérieures exposées.',
        'Prudence sur les trottoirs et ponts sensibles aux plaques de verglas.'
      ],
      stationId: station.id,
      stationName: station.name,
      department: station.department,
      read: false
    });
  }

  // ----------------------------------------------------
  // CRITERION 6: PROXIMITÉ RADAR & CELLULES ACTIVES (300 km -> 100 km -> 50 km -> 20 km)
  // ----------------------------------------------------
  const radar = currentWeather.radarProximity || calculateRadarProximity(
    station,
    currentWeather.precipitation || 0,
    currentWeather.weatherCode,
    currentWeather.windSpeed,
    currentWeather.windDirection || 220,
    cape,
    hourlyForecasts.slice(0, 6).map(h => h.rainMm || h.precipitationMm || 0)
  );

  const stormCells = radar.topThunderstormCells300km || [];
  const rainCells = radar.topRainEchoes300km || [];

  const threateningStorms = stormCells.filter(c => c.isThreatening || c.distanceKm <= 100);
  const threateningRains = rainCells.filter(c => c.isThreatening || (c.distanceKm <= 75 && c.intensityMmH > 1.0));

  const count300 = stormCells.filter(c => c.isThreatening).length + rainCells.filter(c => c.isThreatening).length;
  const count100 = stormCells.filter(c => c.distanceKm <= 100 && c.isThreatening).length + rainCells.filter(c => c.distanceKm <= 100 && c.isThreatening).length;
  const count50 = stormCells.filter(c => c.distanceKm <= 50 && (c.isThreatening || c.reflectivityDbz > 35)).length + rainCells.filter(c => c.distanceKm <= 50 && (c.isThreatening || c.intensityMmH > 0.5)).length;
  const count20 = stormCells.filter(c => c.distanceKm <= 20).length + rainCells.filter(c => c.distanceKm <= 20 && c.intensityMmH > 0.5).length;

  const nearestStorm = stormCells[0] || null;
  const nearestRain = rainCells[0] || null;

  // Radar Proximity Alert: Approaching Thunderstorm Cell
  if (nearestStorm && (nearestStorm.distanceKm <= 120 || nearestStorm.isThreatening)) {
    const sDist = nearestStorm.distanceKm;
    const sEta = nearestStorm.estimatedArrivalMinutes ?? (sDist === 0 ? 0 : Math.round((sDist / (nearestStorm.speedKmh || 40)) * 60));
    
    // Arrival hour string (e.g. "14h28")
    const arrivalDate = new Date(Date.now() + (sEta * 60000));
    const arrivalHourStr = `${arrivalDate.getHours().toString().padStart(2, '0')}h${arrivalDate.getMinutes().toString().padStart(2, '0')}`;

    const isCriticalClose = sDist <= 25;
    const isMediumClose = sDist <= 75;
    const isSupercell = (nearestStorm.capeJkg || 0) > 1400 || (nearestStorm.lightningStrikesCount15min || 0) > 25;

    const severity: AlertSeverity = isCriticalClose || isSupercell ? 'EXTREME' : isMediumClose ? 'SEVERE' : 'MODERATE';
    threatScore = Math.max(threatScore, isCriticalClose ? 96 : isMediumClose ? 85 : 65);

    const traj = sDist <= 5 ? 'Imminent sur place' : 'Approche directe';

    alerts.push({
      id: `alert-radar-storm-${station.id}-${nearestStorm.id}`,
      timestamp,
      formattedTime,
      category: 'RADAR_PROXIMITE_ORAGE',
      categoryLabel: `Traqueur Radar Orages (${sDist <= 25 ? '< 25 km' : sDist <= 100 ? '< 100 km' : '< 300 km'})`,
      severity,
      severityLabel: isCriticalClose ? '🚨 Impact Orageux Imminent' : isMediumClose ? '⚡ Cellule Orageuse en Approche' : '🛰️ Surveillance Radar 100-300 km',
      badgeBg: isCriticalClose ? 'bg-rose-600' : isMediumClose ? 'bg-amber-600' : 'bg-yellow-600',
      badgeColor: 'text-white',
      emoji: '⚡',
      title: `Orage Détecté à ${sDist} km de ${station.name} (${nearestStorm.bearingCompass})`,
      shortSummary: sDist <= 3 
        ? `Activité convective violente directement sur votre secteur (Réflectivité ${nearestStorm.reflectivityDbz} dBZ, foudre active).`
        : `Cellule orageuse détectée à ${sDist} km au ${nearestStorm.bearingCompass} (vitesse ${nearestStorm.speedKmh} km/h). Temps estimé avant impact : ~${sEta} min (${arrivalHourStr}).`,
      detailedAnalysis: `Analyse radar ARAMIS : Cellule convective ${nearestStorm.stormSeverity.toLowerCase()} avec ${nearestStorm.lightningStrikesCount15min} impacts de foudre/15 min, CAPE locale à ${nearestStorm.capeJkg} J/kg et sommets FL${nearestStorm.cloudTopFlightLevel}.`,
      peakHour: arrivalHourStr,
      timeWindow: sDist <= 10 ? 'Maintenant ➔ +45 min' : `Impact estimé à ${arrivalHourStr}`,
      radarProximityMetrics: {
        distanceKm: sDist,
        bearingCompass: nearestStorm.bearingCompass,
        bearingDeg: nearestStorm.bearingDeg,
        speedKmh: nearestStorm.speedKmh,
        etaMinutes: sEta,
        estimatedArrivalHour: arrivalHourStr,
        trajectoryStatus: traj,
        reflectivityDbz: nearestStorm.reflectivityDbz,
        capeJkg: nearestStorm.capeJkg,
        lightningStrikes15min: nearestStorm.lightningStrikesCount15min,
        isSupercell,
        hailDiameterCm: nearestStorm.hailRiskCm,
        maxDownburstGustKmh: Math.round((currentWeather.windSpeed || 20) + 35)
      },
      keyMetrics: [
        { label: 'Distance Radar', value: `${sDist} km (${nearestStorm.bearingCompass})`, highlight: true },
        { label: 'Temps Estimé (ETA)', value: sDist <= 3 ? 'Immédiat' : `~${sEta} min (${arrivalHourStr})`, highlight: true },
        { label: 'Vitesse de Dérive', value: `${nearestStorm.speedKmh} km/h` },
        { label: 'Énergie CAPE', value: `${nearestStorm.capeJkg} J/kg` },
        { label: 'Foudre Météorage', value: `${nearestStorm.lightningStrikesCount15min} éclairs/15m` }
      ],
      safetyAdvice: [
        'Mettez-vous à l\'abri dans un bâtiment en dur avant l\'arrivée de la cellule.',
        'Éloignez-vous des arbres isolés, des points hauts et des structures métalliques.',
        'Anticipez de violentes bourrasques de vent sous le front de rafales.'
      ],
      stationId: station.id,
      stationName: station.name,
      department: station.department,
      read: false
    });
  }

  // Radar Proximity Alert: Heavy Rain Echo Approaching
  if (nearestRain && (nearestRain.distanceKm <= 75 || nearestRain.isThreatening) && nearestRain.intensityMmH >= 1.5) {
    const rDist = nearestRain.distanceKm;
    const rEta = nearestRain.estimatedArrivalMinutes ?? (rDist === 0 ? 0 : Math.round((rDist / (nearestRain.speedKmh || 35)) * 60));
    
    const rArrivalDate = new Date(Date.now() + (rEta * 60000));
    const rArrivalHourStr = `${rArrivalDate.getHours().toString().padStart(2, '0')}h${rArrivalDate.getMinutes().toString().padStart(2, '0')}`;

    const isHeavy = nearestRain.intensityMmH >= 8.0 || nearestRain.reflectivityDbz >= 42;
    const severity: AlertSeverity = (rDist <= 15 && isHeavy) ? 'SEVERE' : 'MODERATE';
    threatScore = Math.max(threatScore, rDist <= 20 ? 75 : 50);

    alerts.push({
      id: `alert-radar-rain-${station.id}-${nearestRain.id}`,
      timestamp,
      formattedTime,
      category: 'RADAR_PROXIMITE_PLUIE',
      categoryLabel: `Radar Précipitations (${rDist <= 25 ? '< 25 km' : '< 100 km'})`,
      severity,
      severityLabel: rDist <= 10 ? '🌧️ Précipitations Imminentes' : '🌧️ Front Pluvieux en Approche',
      badgeBg: isHeavy ? 'bg-blue-700' : 'bg-cyan-700',
      badgeColor: 'text-white',
      emoji: '🌧️',
      title: `Écho Pluvieux (${nearestRain.intensityMmH} mm/h) à ${rDist} km au ${nearestRain.bearingCompass}`,
      shortSummary: rDist <= 2 
        ? `Précipitations actives en cours sur la station (${nearestRain.intensityMmH} mm/h, ${nearestRain.reflectivityDbz} dBZ).`
        : `Ligne de pluie mesurée à ${nearestRain.intensityMmH} mm/h avançant à ${nearestRain.speedKmh} km/h. Arrivée estimée dans ~${rEta} min (${rArrivalHourStr}).`,
      detailedAnalysis: `Écho radar ARAMIS : ${nearestRain.intensityLabel} avec une réflectivité de ${nearestRain.reflectivityDbz} dBZ et des sommets à ${nearestRain.cloudTopAltitudeKm} km. Surface active : ${nearestRain.echoAreaKm2} km².`,
      peakHour: rArrivalHourStr,
      timeWindow: `Arrivée prévue à ${rArrivalHourStr}`,
      radarProximityMetrics: {
        distanceKm: rDist,
        bearingCompass: nearestRain.bearingCompass,
        bearingDeg: nearestRain.bearingDeg,
        speedKmh: nearestRain.speedKmh,
        etaMinutes: rEta,
        estimatedArrivalHour: rArrivalHourStr,
        trajectoryStatus: rDist <= 5 ? 'Imminent sur place' : 'Approche directe',
        reflectivityDbz: nearestRain.reflectivityDbz,
        intensityLabel: nearestRain.intensityLabel
      },
      keyMetrics: [
        { label: 'Distance Radar', value: `${rDist} km (${nearestRain.bearingCompass})`, highlight: true },
        { label: 'Temps Estimé (ETA)', value: rDist <= 2 ? 'En cours' : `~${rEta} min (${rArrivalHourStr})`, highlight: true },
        { label: 'Intensité Instantanée', value: `${nearestRain.intensityMmH} mm/h`, highlight: true },
        { label: 'Réflectivité Radar', value: `${nearestRain.reflectivityDbz} dBZ` }
      ],
      safetyAdvice: [
        'Prévoyez des équipements imperméables et adaptez votre vitesse sur route mouillée.',
        'Risque d\'aquaplanage et de visibilité réduite lors de la traversée de la ligne pluvieuse.'
      ],
      stationId: station.id,
      stationName: station.name,
      department: station.department,
      read: false
    });
  }

  // Sort alerts by severity
  const severityRank = { EXTREME: 4, SEVERE: 3, MODERATE: 2, INFO: 1 };
  alerts.sort((a, b) => severityRank[b.severity] - severityRank[a.severity]);

  const dominantAlert = alerts.length > 0 ? alerts[0] : null;

  let threatLevel: LiveThreatEvaluation['threatLevel'] = 'CALME';
  if (threatScore >= 80) threatLevel = 'ALERTE_MAXIMALE';
  else if (threatScore >= 60) threatLevel = 'RISQUE_ELEVE';
  else if (threatScore >= 30) threatLevel = 'VIGILANCE_MODEREE';

  let evaluationSummary = `Conditions météo calmes à ${station.name} (${station.department}). Aucun phénomène violent détecté.`;
  if (dominantAlert) {
    evaluationSummary = `${dominantAlert.severityLabel} : ${dominantAlert.shortSummary}`;
  }

  return {
    threatScore,
    threatLevel,
    dominantAlert,
    activeAlerts: alerts,
    radarProximityEchoes: {
      nearestStormDistanceKm: nearestStorm?.distanceKm ?? null,
      nearestStormEtaMin: nearestStorm?.estimatedArrivalMinutes ?? null,
      nearestStormBearing: nearestStorm ? `${nearestStorm.bearingCompass} (${nearestStorm.bearingDeg}°)` : null,
      nearestRainDistanceKm: nearestRain?.distanceKm ?? null,
      nearestRainEtaMin: nearestRain?.estimatedArrivalMinutes ?? null,
      nearestRainBearing: nearestRain ? `${nearestRain.bearingCompass} (${nearestRain.bearingDeg}°)` : null,
      threateningCellsCount300km: count300,
      threateningCellsCount100km: count100,
      threateningCellsCount50km: count50,
      threateningCellsCount20km: count20,
    },
    evaluationSummary,
    calculatedAt: formattedTime
  };
}

/**
 * Dispatches a native browser / Web Push notification with vibrations and sound.
 */
export async function dispatchWeatherWebNotification(
  alert: WeatherAlertNotification,
  prefs: NotificationPreferences = loadNotificationPreferences()
): Promise<boolean> {
  if (!prefs.enabled) return false;

  // Category filter check
  const catKeyMap: Record<AlertCategory, keyof NotificationPreferences['categories']> = {
    VIGILANCE: 'vigilance',
    ORAGE: 'thunderstorms',
    VENT: 'galeWind',
    PLUIE: 'torrentialRain',
    CANICULE: 'heatwave',
    GEL_NEIGE: 'frostSnow',
    RADAR_PROXIMITE_ORAGE: 'radarProximity',
    RADAR_PROXIMITE_PLUIE: 'radarProximity',
    RADAR_PROXIMITE_VENT: 'radarProximity',
  };

  const prefCatKey = catKeyMap[alert.category];
  if (prefCatKey && !prefs.categories[prefCatKey]) {
    return false;
  }

  // Radar Proximity distance filter
  if (alert.radarProximityMetrics && prefs.radarDistanceThresholdKm) {
    if (alert.radarProximityMetrics.distanceKm > prefs.radarDistanceThresholdKm) {
      return false;
    }
  }

  // Radar Proximity approaching only check
  if (alert.radarProximityMetrics && prefs.radarApproachingOnly) {
    if (alert.radarProximityMetrics.trajectoryStatus === "S'éloigne de la zone") {
      return false;
    }
  }

  // Severity filter check
  if (prefs.minSeverity === 'SEVERE_ONLY' && alert.severity !== 'SEVERE' && alert.severity !== 'EXTREME') {
    return false;
  }
  if (prefs.minSeverity === 'MODERATE_PLUS' && alert.severity === 'INFO') {
    return false;
  }

  // Quiet hours check
  if (prefs.quietHoursEnabled) {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const [startH, startM] = prefs.quietHoursStart.split(':').map(Number);
    const [endH, endM] = prefs.quietHoursEnd.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    let isQuiet = false;
    if (startMinutes < endMinutes) {
      isQuiet = currentMinutes >= startMinutes && currentMinutes <= endMinutes;
    } else {
      // Overnight range (e.g. 23:00 to 07:00)
      isQuiet = currentMinutes >= startMinutes || currentMinutes <= endMinutes;
    }

    if (isQuiet && !(prefs.urgentOverride && (alert.severity === 'SEVERE' || alert.severity === 'EXTREME'))) {
      return false;
    }
  }

  // Play sound if enabled
  if (prefs.soundAlerts) {
    playAlertChime(alert.severity);
  }

  // Record in History
  addAlertToHistory(alert);

  // Send real Web Notification
  if (isNotificationSupported() && Notification.permission === 'granted') {
    try {
      const notifTitle = `${alert.emoji} ${alert.title}`;
      const notifBody = `${alert.shortSummary}\n⏱️ Créneau : ${alert.timeWindow} (Pic : ${alert.peakHour})`;

      const options: NotificationOptions = {
        body: notifBody,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: alert.id,
        silent: !prefs.soundAlerts,
        requireInteraction: alert.severity === 'EXTREME' || alert.severity === 'SEVERE',
        data: {
          url: window.location.href,
          alertId: alert.id,
          stationId: alert.stationId
        }
      };

      // Vibrate if supported
      if (prefs.vibration && 'vibrate' in navigator) {
        if (alert.severity === 'EXTREME') {
          navigator.vibrate([300, 100, 300, 100, 500]);
        } else if (alert.severity === 'SEVERE') {
          navigator.vibrate([200, 100, 200]);
        } else {
          navigator.vibrate([150]);
        }
      }

      new Notification(notifTitle, options);
      return true;
    } catch (e) {
      console.warn("Could not dispatch native Notification:", e);
    }
  }

  return false;
}

/**
 * Add an alert to persistent local history.
 */
export function addAlertToHistory(alert: WeatherAlertNotification): void {
  try {
    const history = getNotificationHistory();
    // Prepend and keep max 30 items
    const filtered = history.filter(item => item.id !== alert.id);
    const updated = [alert, ...filtered].slice(0, 30);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn("Failed to add alert to history:", e);
  }
}

/**
 * Get notification history from localStorage.
 */
export function getNotificationHistory(): WeatherAlertNotification[] {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn("Failed to load notification history:", e);
  }
  return [];
}

/**
 * Clear notification history.
 */
export function clearNotificationHistory(): void {
  try {
    localStorage.removeItem(HISTORY_STORAGE_KEY);
  } catch (e) {
    console.warn("Failed to clear notification history:", e);
  }
}

/**
 * Generates and triggers a test notification for the user to confirm it works on their phone/browser.
 */
export async function sendTestNotification(stationName: string = "Paris (75)"): Promise<boolean> {
  const perm = await requestNotificationPermission();
  if (perm !== 'granted') return false;

  const testAlert: WeatherAlertNotification = {
    id: `test-alert-${Date.now()}`,
    timestamp: Date.now(),
    formattedTime: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    category: 'ORAGE',
    categoryLabel: 'Test de Notification Météo',
    severity: 'SEVERE',
    severityLabel: 'Alerte Test Réussie',
    badgeBg: 'bg-indigo-600',
    badgeColor: 'text-white',
    emoji: '⚡',
    title: `Instant Météo : Test Push sur votre téléphone`,
    shortSummary: `Vos notifications météo ultra-précises sont bien configurées pour ${stationName}.`,
    detailedAnalysis: `Système de détection active d'orages violents, rafales critiques, pluies torrentielles et canicules opérationnel.`,
    peakHour: '16h30',
    timeWindow: '14h00 ➔ 20h00',
    keyMetrics: [
      { label: 'Statut Push', value: '100% Opérationnel', highlight: true },
      { label: 'Localisation', value: stationName },
      { label: 'Réactivité', value: 'Temps Réel (< 10s)' }
    ],
    safetyAdvice: [
      'Vous recevrez les alertes prioritaires même si l\'application est en arrière-plan.',
      'Le format inclut l\'heure exacte du pic et les consignes de sécurité immédiates.'
    ],
    stationId: 'test-station',
    stationName,
    department: 'France',
    read: false
  };

  return dispatchWeatherWebNotification(testAlert, {
    ...loadNotificationPreferences(),
    enabled: true,
    minSeverity: 'ALL'
  });
}

/**
 * Generates and triggers a radar proximity test notification (e.g. approaching thunderstorm at 45km).
 */
export async function sendRadarTestNotification(
  stationName: string = "Paris (75)",
  phenomenon: 'ORAGE' | 'PLUIE' = 'ORAGE',
  distanceKm: number = 42,
  bearingCompass: string = "Sud-Ouest",
  etaMinutes: number = 38
): Promise<boolean> {
  const perm = await requestNotificationPermission();
  if (perm !== 'granted') return false;

  const arrivalDate = new Date(Date.now() + (etaMinutes * 60000));
  const arrivalHourStr = `${arrivalDate.getHours().toString().padStart(2, '0')}h${arrivalDate.getMinutes().toString().padStart(2, '0')}`;

  const isStorm = phenomenon === 'ORAGE';

  const testAlert: WeatherAlertNotification = {
    id: `test-radar-${Date.now()}`,
    timestamp: Date.now(),
    formattedTime: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    category: isStorm ? 'RADAR_PROXIMITE_ORAGE' : 'RADAR_PROXIMITE_PLUIE',
    categoryLabel: isStorm ? `Traqueur Radar Orages (< 50 km)` : `Traqueur Radar Pluie (< 50 km)`,
    severity: isStorm ? 'SEVERE' : 'MODERATE',
    severityLabel: isStorm ? '⚡ Cellule Orageuse en Approche' : '🌧️ Front Pluvieux en Approche',
    badgeBg: isStorm ? 'bg-amber-600' : 'bg-blue-600',
    badgeColor: 'text-white',
    emoji: isStorm ? '⚡' : '🌧️',
    title: isStorm 
      ? `Alerte Radar : Orage Détecté à ${distanceKm} km (${bearingCompass})`
      : `Alerte Radar : Ligne Pluvieuse Détectée à ${distanceKm} km (${bearingCompass})`,
    shortSummary: isStorm
      ? `Cellule convective active détectée à ${distanceKm} km au ${bearingCompass} (vitesse 45 km/h). Impact estimé dans ~${etaMinutes} min (${arrivalHourStr}).`
      : `Ligne de précipitations soutenues (18 mm/h) détectée à ${distanceKm} km au ${bearingCompass}. Début des pluies estimé à ${arrivalHourStr}.`,
    detailedAnalysis: `Écho radar ARAMIS : Cellule en déplacement Nord-Est direct vers votre secteur. Réflectivité 52 dBZ, sommets nuageux FL360, foudre active.`,
    peakHour: arrivalHourStr,
    timeWindow: `Arrivée estimée à ${arrivalHourStr} (dans ~${etaMinutes} min)`,
    radarProximityMetrics: {
      distanceKm,
      bearingCompass,
      bearingDeg: 225,
      speedKmh: 45,
      etaMinutes,
      estimatedArrivalHour: arrivalHourStr,
      trajectoryStatus: 'Approche directe',
      reflectivityDbz: 52,
      intensityLabel: isStorm ? 'Orage Fort / Grêle potentielle' : 'Pluie Forte',
      capeJkg: 1450,
      lightningStrikes15min: 34,
      isSupercell: true,
      hailDiameterCm: 2.0,
      maxDownburstGustKmh: 85
    },
    keyMetrics: [
      { label: 'Distance Radar', value: `${distanceKm} km (${bearingCompass})`, highlight: true },
      { label: 'Temps Estimé (ETA)', value: `~${etaMinutes} min (${arrivalHourStr})`, highlight: true },
      { label: 'Vitesse de Déplacement', value: '45 km/h' },
      { label: 'Trajectoire', value: 'Approche Directe' }
    ],
    safetyAdvice: [
      'Mettez-vous à l\'abri et rentrez le mobilier extérieur avant l\'arrivée de la ligne.',
      'Évitez tout déplacement non indispensable pendant le passage de la cellule.'
    ],
    stationId: 'test-radar-station',
    stationName,
    department: 'France',
    read: false
  };

  return dispatchWeatherWebNotification(testAlert, {
    ...loadNotificationPreferences(),
    enabled: true,
    minSeverity: 'ALL'
  });
}

