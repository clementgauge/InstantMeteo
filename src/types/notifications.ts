export type AlertCategory = 
  | 'VIGILANCE' 
  | 'ORAGE' 
  | 'VENT' 
  | 'PLUIE' 
  | 'CANICULE' 
  | 'GEL_NEIGE'
  | 'RADAR_PROXIMITE_ORAGE'
  | 'RADAR_PROXIMITE_PLUIE'
  | 'RADAR_PROXIMITE_VENT';

export type AlertSeverity = 'INFO' | 'MODERATE' | 'SEVERE' | 'EXTREME';

export interface WeatherAlertNotification {
  id: string;
  timestamp: number;
  formattedTime: string;
  category: AlertCategory;
  categoryLabel: string;
  severity: AlertSeverity;
  severityLabel: string;
  badgeBg: string;
  badgeColor: string;
  emoji: string;
  title: string;
  shortSummary: string;
  detailedAnalysis: string;
  peakHour: string;
  timeWindow: string;
  safeReturnTime?: string;
  // Proximity Radar Metrics (optional if cell is tracked)
  radarProximityMetrics?: {
    distanceKm: number;
    bearingCompass: string;
    bearingDeg: number;
    speedKmh: number;
    etaMinutes: number | null;
    estimatedArrivalHour?: string;
    trajectoryStatus: 'Approche directe' | 'Trajectoire tangentielle' | 'S\'éloigne de la zone' | 'Imminent sur place';
    reflectivityDbz?: number;
    intensityLabel?: string;
    capeJkg?: number;
    lightningStrikes15min?: number;
    isSupercell?: boolean;
    hailDiameterCm?: number;
    maxDownburstGustKmh?: number;
  };
  keyMetrics: {
    label: string;
    value: string;
    highlight?: boolean;
  }[];
  safetyAdvice: string[];
  stationId: string;
  stationName: string;
  department: string;
  read: boolean;
}

export interface NotificationPreferences {
  enabled: boolean;
  soundAlerts: boolean;
  vibration: boolean;
  categories: {
    vigilance: boolean;
    thunderstorms: boolean;
    galeWind: boolean;
    torrentialRain: boolean;
    heatwave: boolean;
    frostSnow: boolean;
    radarProximity: boolean;
  };
  radarDistanceThresholdKm: 300 | 100 | 50 | 20;
  radarApproachingOnly: boolean;
  minSeverity: 'ALL' | 'MODERATE_PLUS' | 'SEVERE_ONLY';
  quietHoursEnabled: boolean;
  quietHoursStart: string; // "23:00"
  quietHoursEnd: string;   // "07:00"
  urgentOverride: boolean; // bypass quiet hours for SEVERE/EXTREME
  gpsAutoAlert: boolean;
}

export interface LiveThreatEvaluation {
  threatScore: number; // 0 - 100
  threatLevel: 'CALME' | 'VIGILANCE_MODEREE' | 'RISQUE_ELEVE' | 'ALERTE_MAXIMALE';
  dominantAlert: WeatherAlertNotification | null;
  activeAlerts: WeatherAlertNotification[];
  radarProximityEchoes: {
    nearestStormDistanceKm: number | null;
    nearestStormEtaMin: number | null;
    nearestStormBearing: string | null;
    nearestRainDistanceKm: number | null;
    nearestRainEtaMin: number | null;
    nearestRainBearing: string | null;
    threateningCellsCount300km: number;
    threateningCellsCount100km: number;
    threateningCellsCount50km: number;
    threateningCellsCount20km: number;
  };
  evaluationSummary: string;
  calculatedAt: string;
}

