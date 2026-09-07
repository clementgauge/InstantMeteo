import { SnowTypeDiagnostic } from '../utils/snowTypeAnalysis';

export interface LocationPoint {
  id: string;
  name: string;
  department: string;
  region: string;
  country?: string;
  countryCode?: string;
  latitude: number;
  longitude: number;
  altitude: number; // in meters (elevation)
  climateZone: string;
  allTimeRecordMax: number;
  allTimeRecordMin: number;
  allTimeRecordRain24h: number;
  mapX?: number; // Normalized % coordinates for France Map
  mapY?: number;
  isFrench?: boolean;
  isMountain?: boolean;
  isHighAltitude?: boolean;
  isWorldLocation?: boolean;
  isRegion?: boolean;
  postalCode?: string;
  officialAgency?: string;
  wmoIcaoCode?: string;
  modelSource?: string;
}

export interface DetailedAirQuality {
  aqi: number;
  label: string;
  color: string;
  advice: string;
  pm25: number;
  pm10: number;
  no2: number;
  o3: number;
  so2: number;
  uvIndex: number;
}

export interface MountainAltitudeMetrics {
  altitudeMeters: number;
  bioclimaticStage: 'Plaine / Littoral' | 'Collinéen' | 'Montagnard' | 'Subalpin' | 'Alpin' | 'Nival';
  isotherm0Altitude: number; // Isotherme 0°C (m)
  snowRainLimitAltitude: number; // Limite Pluie-Neige LPN (m)
  lapseRate: number; // -0.65 °C / 100m
  qfePressure: number; // Pression barométrique locale réelle à la station (hPa)
  qnhPressure: number; // Pression ramenée au niveau de la mer (hPa)
  uvElevationFactor: number; // Coefficient d'augmentation UV (+10% / 1000m)
  uvSnowReflectanceIndex: number; // UV réverbération
  frostRiskLevel: 'AUCUN' | 'FAIBLE' | 'MODÉRÉ' | 'ÉLEVÉ' | 'CRITIQUE';
  dewPoint: number; // Point de rosée (°C)
  evapotranspirationEt0: number; // ETP Penman-Monteith (mm/jour)
  djuHeat: number; // Degrés-Jours Unifiés Chauffage (base 18°C)
  djuCool: number; // Degrés-Jours Unifiés Climatisation (base 24°C)
  freezingLevelAltitudeMeters?: number; // Isotherme 0°C (m) alias
  wetBulbZeroAltitudeMeters?: number; // Isotherme du thermomètre mouillé (effet d'isothermie en fortes précipitations)
  groundSnowLimitAltitude?: number; // Limite de tenue au sol de la neige LTN (m)
  isothermStationDeltaMeters?: number; // Écart vertical Isotherme 0°C - Station (m)
  isothermDiurnalMinMeters?: number; // Isotherme 0°C nocturne minimale (m)
  isothermDiurnalMaxMeters?: number; // Isotherme 0°C diurne maximale (m)
  isothermieRisk?: boolean; // Risque d'abaissement brutal sous fortes précipitations
  isothermieDropMeters?: number; // Abaissement estimé en mètres sous l'effet de fusion
  isothermStatusLabel?: string; // Libellé diagnostique précis
  thermalInversionStrength?: 'Nulle' | 'Modérée' | 'Forte (Lac d\'air froid en vallée)';
  slopeWarmingBonusC?: number; // Gain thermique sur les adrets ensoleillés
}

export interface PastHourObservation {
  timestamp: string; // ISO or formatted
  hourLabel: string; // e.g. "14h", "08h (hier)"
  hoursAgo: number; // 1 to 24
  temperature: number; // °C
  apparentTemperature: number; // °C
  rainMm: number; // mm in that hour
  humidity: number; // %
  dewPoint: number; // °C
  windSpeed: number; // km/h
  windGust: number; // km/h
  windDirectionDeg?: number;
  pressureHpa: number; // hPa
  weatherCode: number;
  weatherDescription: string;
  isDay: boolean;
  normal3hSlotTemp: number; // 3-hour diurnal norm comparison
  tempAnomalyVsSlot: number; // +1.2°C vs diurnal normal
}

export interface NowcastingSlot {
  minutes: number; // offset in minutes from now (e.g. 0, 5, 10, ... 60, 75, 90, ... 180)
  timeLabel: string; // "14h25"
  rainRateMmH: number; // mm/h rate
  accumulatedMm: number; // mm expected in this slot interval
  probabilityPct: number; // 0 - 100%
  radarDbz: number; // calculated Doppler reflectivity in dBZ (0 - 65)
  intensityCategory: 'SEC' | 'BRUINE_TRACES' | 'PLUIE_FAIBLE' | 'PLUIE_MODEREE' | 'PLUIE_FORTE' | 'AVERSE_VIOLENTE' | 'ORAGE_GRELE';
  intensityLabel: string;
  colorClass: string;
  microphysicsPhase: 'Sec' | 'Bruine' | 'Pluie' | 'Averse orageuse' | 'Grésil / Grêle' | 'Pluie-Neige' | 'Neige';
  windSpeedKmh: number;
  windGustKmh: number;
}

export interface NowcastingThreeHourDiagnostic {
  statusHeadline: string; // e.g. "Début de pluie prévu à 14h35 (dans 15 min)"
  statusSubtext: string;
  isRainingNow: boolean;
  hasPrecipitationIn3h: boolean;
  currentIntensityMmH: number;
  currentRadarDbz: number;
  totalAccumulation3hMm: number;
  totalRainDurationMinutes: number;
  startMinuteOffset: number | null; // null if already raining or no rain
  startTimeFormatted: string | null;
  endMinuteOffset: number | null;
  endTimeFormatted: string | null;
  peakMinuteOffset: number | null;
  peakTimeFormatted: string | null;
  peakIntensityMmH: number;
  peakRadarDbz: number;
  dominantPrecipType: string;
  cellVelocityKmh: number;
  cellDirectionLabel: string;
  capeConvectiveJkg: number;
  liftedIndex: number;
  hailRiskPercent: number;
  snowRainLimitMeters: number;
  isothermieRisk: boolean;
  slots: NowcastingSlot[];
  multiModelComparison: {
    aromeOnsetFormatted: string;
    arome3hTotalMm: number;
    ecmwfOnsetFormatted: string;
    ecmwf3hTotalMm: number;
    gfsOnsetFormatted: string;
    gfs3hTotalMm: number;
    consensusSummary: string;
  };
}

export interface HourlyPrecipitationSlot {
  hour: number; // 0 to 23
  hourLabel: string; // "00h", "01h", ...
  rainMm: number;
  intensityCategory: 'SEC' | 'BRUINE_FAIBLE' | 'PLUIE_MODEREE' | 'FORTE_PLUIE' | 'ORAGE_TORRENTIEL';
  intensityLabel: string;
  isPast: boolean;
  isCurrent: boolean;
  isFuture: boolean;
  probabilityPercent: number;
}

export interface ThreeHourPrecipSlot {
  timeSlot: string; // e.g. "06h - 09h", "12h - 15h"
  probabilityPct: number;
  accumulatedMm: number;
  riskDescription: string;
}

export interface DailyPrecipitationDiagnostic {
  rainFallenSoFarTodayMm: number; // Cumul tombé depuis 00h00
  rainExpectedRestOfDayMm: number; // Cumul prévu jusqu'à 23h59
  totalExpected24hMm: number; // Cumul total 24h estimé
  normalDailyPrecipMm: number; // Normale quotidienne (Normale mensuelle / 30)
  dailyAnomalyMm: number; // Écart en mm
  dailyAnomalyPercent: number; // Écart en %
  isRainDay: boolean;
  precipitationType: string; // e.g. "Pluie continue stratiforme", "Averses orageuses locales", "Bruine dense", "Neige fondante"
  rainTiming: {
    hasPrecipitation: boolean;
    startTimeFormatted: string | null; // e.g. "09h30"
    peakHourFormatted: string | null; // e.g. "14h00"
    peakIntensityMmH: number; // e.g. 4.8 mm/h
    endTimeFormatted: string | null; // e.g. "19h00"
    durationHours: number;
  };
  waterBalance: {
    evapotranspirationEt0Mm: number; // Penman-Monteith ET0
    netWaterBalanceMm: number; // P - ET0 (positif = recharge des sols, négatif = assèchement)
    soilMoistureStatus: 'Recharge hydrique active' | 'Équilibre hydrique' | 'Déficit hydrique modéré' | 'Stress hydrique sévère';
    agriculturalWaterAdvice: string;
  };
  hourlyBreakdown: HourlyPrecipitationSlot[];
  threeHourSlots: ThreeHourPrecipSlot[];
}

export interface ThreeHourDiurnalSlotNormal {
  slotId: '00_03' | '03_06' | '06_09' | '09_12' | '12_15' | '15_18' | '18_21' | '21_00';
  slotLabel: string; // "06h - 09h (Matin)"
  typicalTemp: number; // e.g. 14.2°C
  typicalHumidityPct: number;
  typicalWindKmh: number;
  description: string;
}

export interface SolarEphemeris {
  sunrise: string;
  sunset: string;
  solarNoon: string;
  dayLengthHours: number;
  dayLengthMinutes: number;
  dayLengthFormatted: string;
  dayLengthChangeMinutes: number; // e.g. +2.4 min / day
  civilTwilightBegin: string;
  civilTwilightEnd: string;
  nauticalTwilightBegin: string;
  nauticalTwilightEnd: string;
  maxSolarElevationDeg: number;
  solarRadiationKwhM2: number;
  sunProgressPercent: number;
}

export interface MoonPhaseData {
  phaseName: string;
  phaseCode: 'new_moon' | 'waxing_crescent' | 'first_quarter' | 'waxing_gibbous' | 'full_moon' | 'waning_gibbous' | 'last_quarter' | 'waning_crescent';
  illuminationPercent: number;
  moonAgeDays: number;
  moonSign: string;
  tideType: 'Vives-Eaux (Forts coefficients)' | 'Mortes-Eaux (Faibles coefficients)' | 'Moyennes';
  moonrise?: string;
  moonset?: string;
}

export interface BarometricTrend {
  currentQfe: number;
  currentQnh: number;
  change3h: number; // hPa in last 3h
  trendLabel: 'Hausse rapide' | 'En hausse' | 'Stable' | 'En baisse' | 'Chute brutale (Alerte front/tempête)';
  riskWarning?: string;
}

export interface OutdoorActivityItem {
  score: number; // 0-100
  status: 'OPTIMAL' | 'EXCELLENT' | 'FAVORABLE' | 'BON' | 'MOYEN' | 'PRUDENCE' | 'DIFFICILE' | 'DÉCONSEILLÉ' | 'INTERDIT';
  riskLevel: 'Faible' | 'Modéré' | 'Élevé' | 'Critique';
  optimalTimeSlots: string[]; // e.g. ["08h00 - 11h30 : Créneau Idéal", "14h00 - 18h00 : Déconseillé (Chaleur / Orage)"]
  keyFactors: {
    label: string;
    value: string;
    isWarning?: boolean;
  }[];
  advice: string;
  equipment: string[];
}

export interface OutdoorActivityIndices {
  hiking: {
    score: number; // 0-100
    status: 'EXCELLENT' | 'FAVORABLE' | 'PRUDENCE' | 'DÉCONSEILLÉ';
    riskThunderstorm: 'Faible' | 'Modéré' | 'Élevé';
    cloudBaseMeters: number;
    windAtRidgeKmh: number;
    advice: string;
    optimalTimeSlots?: string[];
    equipment?: string[];
  };
  cycling: {
    score: number;
    status: 'OPTIMAL' | 'BON' | 'MOYEN' | 'DIFFICILE';
    windImpact: 'Favorable' | 'Vent modéré' | 'Vent violent pénalisant';
    heatStress: 'Faible' | 'Modéré' | 'Fort';
    advice: string;
    optimalTimeSlots?: string[];
    equipment?: string[];
  };
  running?: OutdoorActivityItem;
  beachSea: {
    score: number;
    uvRisk: string;
    thermalBreezeKmh: number;
    waterComfortEstimate: string;
    advice: string;
    optimalTimeSlots?: string[];
    equipment?: string[];
  };
  gardeningAgriculture: {
    et0Evapotranspiration: number; // mm/j
    sprayWindow: 'Idéale (Vent < 19 km/h, sans pluie)' | 'Moyenne' | 'Déconseillée (Vent/Pluie)';
    frostRiskGround: string;
    soilDryingRate: 'Très rapide' | 'Modéré' | 'Humide';
    advice: string;
    optimalTimeSlots?: string[];
    equipment?: string[];
  };
  outdoorWorkDiy?: OutdoorActivityItem;
  astronomy?: OutdoorActivityItem;
  aviationDrone?: OutdoorActivityItem;
  seniorsHealth?: OutdoorActivityItem;
  solarEnergy: {
    pvOutputPotentialKwhPerKwp: number; // kWh/kWc/jour
    efficiencyScore: number; // 0-100%
    sunHoursEstimated: number;
    advice: string;
  };
}

export interface SynopticWeatherConditions {
  cloudCoverTotalPct: number;
  cloudCoverLowPct: number;
  cloudCoverMidPct: number;
  cloudCoverHighPct: number;
  cloudCoverOctas: number; // 0 to 8 octas
  visibilityKm: number;
  visibilityDescription: string;
  cloudCeilingMeters: number;
  wetBulbTemperature: number; // °C
  humidexIndex: number;
  windChill: number; // °C
  absoluteHumidityGm3: number; // g/m³
  beaufortScale: {
    force: number;
    description: string;
    seaDescription: string;
    windSpeedKmhRange: string;
  };
  solarRadiationWm2: number;
  airMassType: string;
  synopticSummary: string;
}

export interface HourlyStormRisk {
  hour: number;
  hourLabel: string; // e.g. "14h", "15h"
  time: string;
  stormRiskPercent: number; // 0-100%
  stormRiskLevel: 'NUL' | 'FAIBLE' | 'MODÉRÉ' | 'ÉLEVÉ' | 'TRÈS ÉLEVÉ / VIOLENT';
  cape: number; // J/kg (Convective Available Potential Energy)
  liftedIndex: number; // °C (Lifted Index)
  cin: number; // J/kg (Convective Inhibition)
  expectedStormType: 'Aucun' | 'Averses orageuses isolées' | 'Orage multicellulaire' | 'Ligne de grains convective' | 'Risque supercellulaire' | 'Orage orographique de relief';
  hailRisk: 'Nul' | 'Faible (< 1 cm)' | 'Modéré (1-2 cm)' | 'Élevé (> 3 cm)';
  maxGustExpectedKmh: number;
  lightningActivity: 'Nulle' | 'Isolée' | 'Fréquente' | 'Intense / Foudroiement continu';
  rainIntensityMmH: number;
  isCurrentHour: boolean;
  isCriticalPeak: boolean;
}

export interface ConvectiveIndices {
  capeJkg: number;
  capeLevel: 'Nulle / Stable (< 100)' | 'Faible (100-500)' | 'Modérée (500-1200)' | 'Forte (1200-2200)' | 'Extrême (> 2200)';
  liftedIndex: number;
  liftedIndexLevel: 'Stable (> 0)' | 'Légèrement instable (0 à -2)' | 'Instable (-2 à -5)' | 'Très instable (-5 à -8)' | 'Instabilité extrême (< -8)';
  cinJkg: number;
  cinLevel: 'Couvercle étanche (> 150)' | 'Couvercle modéré (50-150)' | 'Inhibition faible / Amorçage aisé (< 50)';
  deepLayerShear06kmMs: number;
  deepLayerShearKnots: number;
  deepLayerShearLevel: 'Faible (< 10 m/s)' | 'Modéré (10-20 m/s)' | 'Fort / Structuré (> 20 m/s)';
  lowLevelShear01kmMs: number;
  dcapeDownburstJkg: number;
  maxDownburstGustKmh: number;
  precipitableWaterMm: number;
  kIndex: number;
  totalTotalsIndex: number;
  supercellCompositeParameter: number;
  supercellRisk: 'Nul' | 'Faible' | 'Modéré' | 'Élevé';
  hailProbabilityPercent: number;
  hailMaxDiameterCm: number;
  lightningRatePerMinute: number;
  flashDensityEstimate: string;
}

export interface ThunderstormConvectiveAnalysis {
  stationName: string;
  stationId: string;
  generatedAt: string;
  globalStormRiskScore: number; // 0 to 100%
  globalVigilanceLevel: 'VERT' | 'JAUNE' | 'ORANGE' | 'ROUGE';
  summaryDiagnosis: string;
  criticalWindow: string; // e.g. "15h30 - 19h00"
  imminentThreatMinutes: number | null;
  dominantMechanism: string;
  convectiveIndices: ConvectiveIndices;
  hourlyStormTimeline: HourlyStormRisk[];
  safetyDirectives: string[];
  radarProximitySummary: string;
  thunderstormProbability?: number; // Alias for globalStormRiskScore
  capeJkg?: number; // Direct access to convectiveIndices.capeJkg
  liftedIndex?: number; // Direct access to convectiveIndices.liftedIndex
}

export interface RadarDistanceBandInfo {
  bandId: '0_5km' | '5_15km' | '15_30km' | '30_60km' | 'gt_60km';
  title: string;
  rangeKm: string;
  threatLevel: 'DIRECT' | 'IMMINENT' | 'APPROACHING' | 'DISTANT' | 'CLEAR';
  echoPresent: boolean;
  phenomenon: string; // e.g. "Orage violent avec foudre active"
  reflectivityDbz: number; // e.g. 55 dBZ
  flashToThunderSec: number | null; // e.g. 9 sec (3 km)
  etaMinutes: number | null;
  acousticThunderAudibility: string;
  safetyAdvice: string;
}

export interface RainEchoCell {
  id: string;
  rank: number; // 1 to 8
  cellName: string; // e.g. "Cellule Pluvieuse Principale - Ouest"
  locationSector: string; // e.g. "28 km Ouest-Sud-Ouest"
  distanceKm: number;
  distanceBand: '0-25km' | '25-75km' | '75-150km' | '150-300km';
  bearingDeg: number;
  bearingCompass: string;
  intensityMmH: number;
  intensityLabel: string;
  reflectivityDbz: number;
  echoAreaKm2: number;
  cloudTopAltitudeKm?: number;
  cloudTopFlightLevel?: string; // e.g. "FL280"
  synopticOrigin?: string; // e.g. "Corps pluvio-orageux de méso-échelle"
  speedKmh: number;
  movementHeadingCompass: string;
  estimatedArrivalMinutes: number | null;
  isThreatening: boolean;
  threatLevel: '🔴 MENAÇANT' | '🟡 SOUS SURVEILLANCE' | '🟢 S\'ÉLOIGNE' | '⚪ AUCUN ÉCHO';
  threatDescription: string;
  detailedParagraph: string; // Comprehensive narrative analysis paragraph
}

export interface ThunderstormEchoCell {
  id: string;
  rank: number; // 1 to 8
  cellName: string; // e.g. "Amas Convectif Supercellulaire N°1"
  locationSector: string; // e.g. "35 km Sud-Ouest"
  distanceKm: number;
  distanceBand: '0-25km' | '25-75km' | '75-150km' | '150-300km';
  bearingDeg: number;
  bearingCompass: string;
  lightningStrikesCount15min: number;
  stormSeverity: 'Faible' | 'Modéré' | 'Fort' | 'Violent / Supercellulaire';
  capeJkg: number;
  hailRiskCm: number;
  downburstGustKmh: number;
  reflectivityDbz: number;
  cloudTopAltitudeKm?: number;
  cloudTopFlightLevel?: string; // e.g. "FL380" (11 500 m)
  synopticOrigin?: string; // e.g. "Ligne de grain pré-frontale supercellulaire"
  speedKmh: number;
  movementHeadingCompass: string;
  estimatedArrivalMinutes: number | null;
  isThreatening: boolean;
  threatLevel: '🔴 EXTRÊMEMENT MENAÇANT' | '🟠 MENAÇANT' | '🟡 SOUS SURVEILLANCE' | '🟢 S\'ÉLOIGNE' | '⚪ NON ACTIF';
  threatDescription: string;
  detailedParagraph: string; // Comprehensive narrative analysis paragraph
}

export interface RadarProximityTracker {
  stationName: string;
  stationCoordinates: { lat: number; lon: number };
  nearestRainCell: {
    distanceKm: number;
    bearingDeg: number;
    bearingCompass: string;
    intensityMmH: number;
    intensityLabel: string;
    speedKmh: number;
    movementDirection: string;
    estimatedArrivalMinutes: number | null;
    trajectoryStatus: 'Approche directe' | 'Trajectoire tangentielle' | 'S\'éloigne de la zone' | 'Temps sec sur 50 km';
    reflectivityDbz?: number;
    passageDurationMin?: number;
  };
  nearestThunderstorm: {
    distanceKm: number;
    bearingDeg: number;
    bearingCompass: string;
    lightningStrikesCount15min: number;
    stormSeverity: 'Faible' | 'Modéré' | 'Fort' | 'Violent / Supercellulaire';
    estimatedArrivalMinutes: number | null;
    thunderAudibility: string;
    safetyAlertLevel: 'VERT' | 'JAUNE' | 'ORANGE' | 'ROUGE';
    safetyRecommendations: string[];
    flashToThunderSeconds?: number;
    peakCurrentKa?: number;
    hailDiameterRiskCm?: number;
    downburstGustKmh?: number;
  };
  topRainEchoes100km?: RainEchoCell[];
  topThunderstormCells100km?: ThunderstormEchoCell[];
  topRainEchoes300km?: RainEchoCell[];
  topThunderstormCells300km?: ThunderstormEchoCell[];
  synopticRadarBulletin300km?: string;
  globalThreatAssessment?: {
    hasThreateningEcho: boolean;
    summaryMessage: string;
    alertLevel: 'VERT' | 'JAUNE' | 'ORANGE' | 'ROUGE';
    threateningEchoesCount: number;
  };
  distanceBands?: RadarDistanceBandInfo[];
  stormThreatIndex: number; // 0 to 100
  concentricRings: number[]; // [10, 25, 50, 100, 200]
  isEchoPresent?: boolean;
  echoQualityIndex?: number;
  observedGroundTruthSummary?: string;
  nearestAramisRadar?: {
    id: string;
    name: string;
    region: string;
    department: string;
    latitude: number;
    longitude: number;
    altitudeMeters: number;
    distanceKm: number;
    bearingDeg: number;
    bearingCompass: string;
    beamAltitudeMeters: number;
    band: string;
    polarization: string;
    signalQualityPercent: number;
    operationalStatus: string;
    specialization: string;
  };
}

export interface AltitudeVerticalSlice {
  altitudeMeters: number;
  label: string; // e.g. "Fond de Vallée / Vallon", "Versant / Coteau", "Étage Montagnard", "Crêtes & Sommets"
  temperature: number;
  feelsLike: number;
  pressureQfe: number;
  precipitationState: 'Pluie liquide' | 'Pluie et neige mêlées' | 'Neige seule' | 'Neige soufflée / Blizzard' | 'Temps sec';
  lapseRateCPer100m: number;
  isothermComparison: string;
}

export interface TopographicMicroclimateAnalysis {
  stationAltitude: number;
  bioclimaticStage: string;
  valleyInversion: {
    isActive: boolean;
    strength: 'Nulle' | 'Modérée (+2°C à +4°C en pente)' | 'Forte (+5°C à +8°C sur les versants)' | 'Extrême (Lac d\'air froid / Combe)';
    valleyBottomTemp: number;
    slopeTemp: number;
    phenomenonDescription: string;
    riskFrostInDepressions: boolean;
  };
  adiabaticLapseRates: {
    dryLapseRate: number; // -0.98 °C / 100m
    saturatedLapseRate: number; // -0.65 °C / 100m
    actualLocalLapseRate: number; // e.g. -0.72 °C / 100m
    lapseRateType: 'Gradient standard sec' | 'Gradient humide saturé sous précipitations' | 'Inversion de température';
    dewPointDepression: number;
  };
  orographicFoehnEffect: {
    windwardSidePrecipEnhancementPct: number; // +30% to +80%
    leewardSideFoehnWarmingC: number; // +2°C to +7°C
    status: 'Actif (Effet de Foehn marqué sous le vent)' | 'Blocage orographique au vent' | 'Neutre / Absence d\'écoulement orographique';
    details: string;
  };
  verticalProfile: AltitudeVerticalSlice[];
}

export interface AnnualTemperatureEvolutionRecord {
  year: number;
  annualMeanTemp: number;
  meanTemp: number; // alias for annualMeanTemp
  anomalyVs1991_2020: number;
  anomaly: number; // alias for anomalyVs1991_2020
  anomalyVsPreindustrial: number;
  isRecordWarm: boolean;
  isRecordCold: boolean;
  summerMeanTemp: number;
  winterMeanTemp: number;
  summerAvgTmax: number;
  winterAvgTmin: number;
  frostDaysTotal: number;
  heatwaveDaysTotal: number;
  precipitationTotalMm: number;
}

export interface SeasonalNormalDetail {
  season: string;
  months: string;
  tMin: number;
  tMax: number;
  tMean: number;
  meanTemp: number;
  avgTmin: number;
  avgTmax: number;
  rainMm: number;
  totalPrecipitation: number;
  avgRainyDays: number;
  sunHours: number;
  totalSunshineHours: number;
  frostDays?: number;
  heatDays?: number;
  snowDays?: number;
  fogDays?: number;
  tropicalNights?: number;
  description: string;
}

export interface SeasonalNormalsBreakdown {
  spring: SeasonalNormalDetail;
  summer: SeasonalNormalDetail;
  autumn: SeasonalNormalDetail;
  winter: SeasonalNormalDetail;
}

export interface DayPartForecast {
  timeLabel: string;
  hour: number;
  temp: number;
  feelsLike: number;
  rainProb: number;
  rainMm: number;
  windSpeed: number;
  windGust: number;
  skyLabel: string;
  weatherCode: number;
  iconEmoji: string;
  uvIndex: number;
  dewPoint: number;
  cloudCoverPct?: number;
  cloudCoverOctas?: number;
}

export type VigilanceLevel = 'VERT' | 'JAUNE' | 'ORANGE' | 'ROUGE';

export type VigilancePhenomenon = 
  | 'PLUIE_INONDATION'
  | 'ORAGES'
  | 'VENT_VIOLENT_TORNADE'
  | 'NEIGE_VERGLAS'
  | 'GRAND_FROID_GEL'
  | 'CANICULE_CHALEUR'
  | 'AVALANCHES'
  | 'BROUILLARD_GIVRANT'
  | 'CALME';

export interface VigilancePhaseItem {
  phaseNumber: number; // 1, 2, 3, 4
  phaseName: string; // e.g. "Phase 1 : Amorce & Phase Préventive"
  timeWindow: string; // e.g. "08h00 ➔ 12h00"
  startHour: string; // "08h00"
  endHour: string; // "12h00"
  statusBadge: string; // e.g. "🟡 MONTÉE EN PUISSANCE", "🔴 PIC MAXIMAL DE CRISE", "🟢 ATTÉNUATION"
  level: VigilanceLevel;
  icon: string; // e.g. "🛫", "⚡", "🛬", "✅"
  description: string; // Explanation of what happens in this phase
  expectedConditions: string; // Weather conditions (rain, wind, lightning, etc.)
  recommendedAction: string; // Safety instructions for this specific phase
}

export interface DailyVigilanceAlertItem {
  id: string;
  phenomenon: VigilancePhenomenon;
  phenomenonLabel: string; // e.g. "Orages Violents & Grêle", "Gel & Verglas", "Pluie-Inondation", "Coup de Vent & Risque Tornadique"
  level: VigilanceLevel;
  emoji: string;
  title: string;
  message: string;
  
  // Official Regulatory / Activation Slot of the Vigilance Alert
  vigilanceStartHour?: string; // e.g. "12h00"
  vigilanceEndHour?: string; // e.g. "22h00"
  vigilanceWindowLabel?: string; // e.g. "Période de Vigilance Active : 12h00 à 22h00"
  
  // Meteorological Event Physical Occurrence & Peak Slot
  eventStartHour?: string; // e.g. "15h30"
  eventPeakHour?: string; // e.g. "17h00"
  eventEndHour?: string; // e.g. "19h00"
  eventWindowLabel?: string; // e.g. "Événement physique attendu : 15h30 à 19h00 (Pic critique à 17h00)"
  eventDescription?: string; // e.g. "Front orageux structuré avec foudre dense, rafales à 90-105 km/h et grêlons de 2 cm."
  dangerLevelDescription?: string; // e.g. "Risque très élevé de chutes de branches, inondations par ruissellement et grêle sur toitures."
  triggerThresholdCriteria?: string; // e.g. "CAPE > 1200 J/kg, Rafales > 85 km/h, Pluie > 20 mm/h"
  impactsSummary?: string[]; // concrete expected impacts
  
  // Structured Phase Breakdown of the Vigilance Window (User Request)
  phases?: VigilancePhaseItem[];
  
  // High-precision Episode Totals & Critical Hours (User Request)
  totalEpisodeAccumulation?: string; // e.g. "14.5 cm de neige fraîche (Fourchette : 12.0 à 17.5 cm)" or "42.8 mm (42.8 L/m²)"
  criticalHoursWindow?: string; // e.g. "🚨 HEURES LES PLUS CRITIQUES : De 14h00 à 18h00 (Pic max à 16h00)"
  snowQualityDetails?: string; // e.g. "Neige lourde et collante (ratio 1mm=1.2cm), risque de verglas sous-jacent et bris de branches"
  hourlyBreakdownDetails?: Array<{
    hour: string;
    rainMm: number;
    snowCm: number;
    cumulSnowCm: number;
    cumulRainMm: number;
    windGustKmh: number;
    temp: number;
    intensityLabel: string;
    isPeak: boolean;
  }>;
  
  // Legacy / Compatibility fields
  riskSlotLabel: string; // e.g. "Créneau critique : 14h00 - 19h30"
  startHourFormatted: string; // "14h00"
  peakHourFormatted: string; // "17h00"
  endHourFormatted: string; // "20h30 (Fin de vigilance)"
  durationHours: number;
  severityMetric: string; // e.g. "Cumul max: 32 mm/h", "Rafales: 95 km/h", "Tmin: -3.2°C", "CAPE: 1450 J/kg"
  safetyInstructions: string[];
  isOngoingNow?: boolean;
  lastUpdatedTimestamp: string;
  deconflictNotice?: string;
  coherenceCheckPassed?: boolean;
}

export interface MultiDayVigilanceDay {
  date: string;
  dayDateStr: string;
  dayLabel: string;
  dayOffset: number; // 0 for today, 1 for tomorrow, ..., 14
  maxLevel: VigilanceLevel;
  dominantAlert: DailyVigilanceAlertItem;
  alerts: DailyVigilanceAlertItem[];
  hasSevereThreat: boolean;
  dominantPhenomenon: string;
  dominantEmoji: string;
  summaryText: string;
  unifiedSynthesisNotice?: string;
  hourlyChronogram?: Array<{
    hour: number;
    hourLabel: string;
    level: VigilanceLevel;
    phenomenonLabel: string;
    emoji: string;
    isPeak: boolean;
  }>;

  tempMin: number;
  tempMax: number;
  rainSum: number;
  windGustMax: number;
}

export interface MultiDayVigilanceMatrix {
  station: LocationPoint;
  lastUpdated: string;
  currentActiveLevel: VigilanceLevel;
  currentDominantAlert?: DailyVigilanceAlertItem;
  criticalAlertsNext14DaysCount: number;
  orangeRedDaysCount: number;
  yellowDaysCount: number;
  days: MultiDayVigilanceDay[];
}

export interface DailyDetailedAnalysis {
  date: string;
  dayLabel: string;
  dayNumber: number; // 1 to 7/14
  tempMin: number;
  tempMax: number;
  tempMean: number;
  weatherCode: number;
  weatherDescription: string;
  precipitationSumMm: number;
  precipitationProbabilityMax: number;
  precipitationHours?: number;
  rainDurationHours: number;
  windSpeedMaxKmh: number;
  windGustMaxKmh: number;
  dominantWindDirection: string;
  uvIndexMax: number;
  sunshineHours: number;
  et0EvapotranspirationMm: number;
  isotherm0Meters: number;
  snowRainLimitMeters: number;
  dayParts: {
    morning: DayPartForecast;
    midday: DayPartForecast;
    afternoon: DayPartForecast;
    evening: DayPartForecast;
    night: DayPartForecast;
  };
  hourly: HourlyForecast[];
  climateComparison: {
    normalTMax: number;
    normalTMin: number;
    anomalyTMean: number;
    anomalyDescription: string;
  };
  activityScores: {
    outdoorSport: { score: number; label: string; details: string };
    gardening: { score: number; label: string; details: string };
    mountainHiking: { score: number; label: string; details: string };
    baignadePlage: { score: number; label: string; details: string };
  };
  lifestyleTips: {
    clothingAdvice: string;
    ventilationOptimalHour: string;
    sunProtectionWindow: string;
    hydratationAdvice: string;
    gardenAdvice: string;
  };
  vigilanceAlerts: DailyVigilanceAlertItem[];
}

export interface FortnightProjection {
  fortnightNumber: number; // 1 to 8 (Q1 à Q8)
  fortnightTitle: string; // "Quinzaine 1 (J+1 à J+15)"
  dateRangeFormatted: string;
  monthName: string;
  expectedTMean: number;
  tempAnomalyVsNormal: number;
  tempAnomalyStatus: string;
  precipAnomalyPct: number;
  precipStatus: string;
  expectedPrecipMm: number;
  normalPrecipMm: number;
  dominantSynopticRegime: string;
  synopticRegimeCode: 'NAO_POS' | 'NAO_NEG' | 'SCAND_BLOCK' | 'ATLANTIC_RIDGE' | 'MED_LOW' | 'WEST_ZONAL';
  confidenceScore: number; // 90% down to 40%
  heatwaveRisk: 'Nul' | 'Faible' | 'Modéré' | 'Élevé' | 'Très Élevé';
  droughtRisk: 'Nul' | 'Faible' | 'Modéré' | 'Élevé' | 'Critique';
  earlyFrostRisk: 'Nul' | 'Faible' | 'Modéré' | 'Élevé';
  mediterraneanFloodRisk: 'Nul' | 'Faible' | 'Modéré' | 'Élevé';
  winterStormRisk: 'Nul' | 'Faible' | 'Modéré' | 'Élevé';
  groundMoistureForecast: number; // 0-100%
  waterTableImpact: string;
  agriculturalGuidance: string;
  scenariosProbabilities: {
    warmDry: number; // %
    median: number;
    coolWet: number;
  };
  synopticDescription: string;
}

export interface SeasonalFourMonthTrends {
  stationId: string;
  stationName: string;
  generatedAt: string;
  lastDailyRunTimestamp: string;
  modelEnsembleSources: string; // "Copernicus C3S Multi-System (ECMWF SEAS5, Météo-France System 8, UKMO GloSea6, NCEP CFSv2)"
  baselineNormalsPeriod: string; // "1991-2020 WMO Standard"
  fourMonthSynthesis: string;
  fortnights: FortnightProjection[];
  macroTeleconnections: {
    naoState: string;
    scandBlockState: string;
    atlanticMdrSst: string;
    ensoStatus: string;
    polarVortexStatus: string;
  };
  seasonalRiskMatrix: {
    heatwave: { maxRisk: string; peakPeriod: string };
    drought: { severity: string; impactedSectors: string };
    storms: { probability: string; mainZones: string };
    frost: { firstRiskDate: string; altitudeImpact: string };
  };
}

export interface CurrentWeather {
  temperature: number;
  feelsLike: number;
  tempMin: number;
  tempMax: number;
  humidity: number;
  windSpeed: number;
  windGust: number;
  windDirection: number;
  pressure: number; // QFE or surface pressure
  pressureMsl?: number; // QNH sea-level pressure
  uvIndex: number;
  precipitation: number;
  weatherCode: number;
  weatherDescription: string;
  airQualityAqi: number;
  airQualityLabel: string;
  airQualityDetails?: DetailedAirQuality;
  dewPoint?: number;
  humidex?: number;
  windChill?: number;
  vaporPressureHpa?: number;
  cloudBaseLclMeters?: number;
  cloudCoverLowPct?: number;
  cloudCoverMidPct?: number;
  cloudCoverHighPct?: number;
  cloudCoverTotalPct?: number;
  solarRadiationWm2?: number;
  sunshineDurationTodayHours?: number;
  soilMoisturePct?: number;
  soilTemperatureC?: number;
  visibilityKm?: number;
  barometricTendency3hHpa?: number;
  barometricTendencyLabel?: string;
  evapotranspirationEt0Mm?: number;
  djuHeating?: number;
  djuCooling?: number;
  capeJkg?: number;
  liftedIndex?: number;
  isotherm0Meters?: number;
  snowRainLimitMeters?: number;
  snowDepthCm?: number;
  snowFresh24hCm?: number;
  altitudeMetrics?: MountainAltitudeMetrics;
  solarEphemeris?: SolarEphemeris;
  moonPhase?: MoonPhaseData;
  barometricTrend?: BarometricTrend;
  outdoorIndices?: OutdoorActivityIndices;
  synopticConditions?: SynopticWeatherConditions;
  radarProximity?: RadarProximityTracker;
  thunderstormAnalysis?: ThunderstormConvectiveAnalysis;
  topographicAnalysis?: TopographicMicroclimateAnalysis;
  pastHourly?: PastHourObservation[];
  dailyPrecipitationDiagnostic?: DailyPrecipitationDiagnostic;
  nowcasting3h?: NowcastingThreeHourDiagnostic;
  timestamp: string;
  isDay: boolean;

  // Real-time Temperature Reliability & Multi-Model Calibration
  multiModelRealtime?: {
    meteoFrance?: number;
    ecmwf?: number;
    icon?: number;
    gfs?: number;
    consensusTemp?: number;
    spreadC?: number;
    morningInversionEffect?: string;
    microclimateAdjustmentC?: number;
  };
  recalibrationOffsetApplied?: number;
  recalibrationOffset?: number;
  isUserRecalibrated?: boolean;
  recalibrationSource?: string;
}

export interface ThermalTierDefinition {
  tierId: 'DEEP_FREEZE' | 'FROST' | 'VERY_COLD' | 'COOL' | 'MILD' | 'COMFORT' | 'WARM' | 'HOT' | 'HEATWAVE';
  name: string;
  tempRangeLabel: string;
  minTemp: number;
  maxTemp: number;
  colorHex: string;
  tailwindBg: string;
  tailwindText: string;
  tailwindBorder: string;
  iconEmoji: string;
  description: string;
  clothingAdvice: string;
  healthComfortNotice: string;
  agriculturalImpact: string;
}

export interface PrecipitationClarityDiagnostic {
  probabilityPercent: number; // Probabilité d'occurrence (0-100%)
  expectedQuantityMm: number; // Quantité totale en mm
  instantIntensityMmH: number; // Taux instantané en mm/h
  intensityCategory: 'SEC' | 'BRUINE' | 'PLUIE_FAIBLE' | 'PLUIE_MODEREE' | 'FORTE_PLUIE' | 'ORAGE_TORRENTIEL';
  intensityLabel: string;
  durationMinutesFormatted: string; // e.g. "1h45"
  waterVolumeLitresPerM2: number; // 1 mm = 1 L/m²
  soilSaturationRisk: 'Nul' | 'Faible' | 'Modéré (flaques)' | 'Élevé (ruissellement)' | 'Critique (saturation)';
  dailyLifeAdvice: string;
}

export interface HourlyForecast {
  time: string;
  hourLabel: string;
  hourNumber?: number;
  dayIndex?: number; // 0 to 6
  dayDate?: string; // e.g. "2026-08-11"
  dayLabel?: string; // e.g. "Aujourd'hui", "Demain", "Mercredi"
  temperature: number;
  feelsLike?: number;
  apparentTemperature?: number;
  weatherCode: number;
  weatherDescription?: string;
  iconEmoji?: string;
  precipitationProbability: number;
  rainMm: number;
  precipitationMm?: number;
  snowfallCm?: number;
  rainIntensityLabel?: string; // "Sec", "Bruine fine (<0.5 mm)", "Pluie modérée (1-3 mm)", "Forte pluie (3-7 mm)", "Orage violent (>7 mm)"
  rainDurationMinutes?: number; // 0 to 60 min
  precipVolumeLitersM2?: number; // 1 mm = 1 L/m²
  windSpeed: number;
  windGust?: number;
  windDirectionDeg?: number;
  windDirectionCompass?: string; // "N", "NE", "E", "SE", "S", "SO", "O", "NO"
  dewPoint?: number;
  wetBulbTemperature?: number;
  uvIndex?: number;
  humidity?: number;
  pressureHpa?: number; // QFE surface pressure
  pressureMsl?: number; // QNH sea level pressure
  cloudCover?: number; // Total 0-100%
  cloudCoverLow?: number; // 0-100%
  cloudCoverMid?: number; // 0-100%
  cloudCoverHigh?: number; // 0-100%
  cloudCoverLabel?: string; // e.g. "Peu Nuageux (25%) • 2/8 octas"
  trendTag?: string; // e.g. "↗ +1.2°C • Éclaircies"
  trendText?: string;
  trendEmoji?: string;
  rainRiskSummary?: string;
  solarRadiationDirectWm2?: number;
  solarRadiationDiffuseWm2?: number;
  isotherm0Meters?: number;
  wetBulbZeroMeters?: number; // Isotherme 0°C du thermomètre mouillé (Tw = 0°C)
  snowRainLimitMeters?: number;
  groundSnowLimitMeters?: number; // Limite de tenue au sol LTN
  isothermStationDelta?: number; // Isotherm 0°C - Station Altitude (m)
  isothermStatusLabel?: string; // e.g. "+2 150m au-dessus du sol", "Au niveau de la station"
  convectiveCape?: number; // J/kg
  capeJkg?: number;
  freezingLevelMeters?: number;
  dewPointC?: number;
  liftedIndex?: number; // °C
  convectiveCin?: number; // J/kg
  thunderstormProbability?: number; // 0-100%
  thermalTierLabel?: string; // e.g. "Doux (15°C à 19°C)"
  thermalTierColor?: string;
  thermalTierId?: 'DEEP_FREEZE' | 'FROST' | 'VERY_COLD' | 'COOL' | 'MILD' | 'COMFORT' | 'WARM' | 'HOT' | 'HEATWAVE';
  isDay?: boolean;
  visibilityMeters?: number;
  visibilityKm?: number;
}

export interface DailyForecast {
  date: string;
  dayLabel: string;
  fullDateFormatted?: string; // "Mardi 11 Août 2026"
  iconEmoji?: string;
  tempMin: number;
  tempMax: number;
  tempMean?: number;
  feelsLikeMin?: number;
  feelsLikeMax?: number;
  snowfallCm?: number;
  weatherCode: number;
  weatherDescription: string;
  precipitationProbability: number;
  rainMm: number;
  precipitationSumMm?: number;
  precipitationHours?: number;
  rainTimingSummary?: string; // e.g. "Pluies éparses l'après-midi entre 14h et 18h"
  rainRiskShortBadge?: string; // e.g. "75% • Pluie confirmée (4.2 mm)"
  rainRiskExplanation?: string; // e.g. "Pluie quasi-certaine (75%) avec cumul estimé à 4.2 mm"
  cloudCoverMean?: number; // 0-100%
  uvIndexMax: number;
  windSpeedMax: number;
  windGustMax?: number;
  dominantWindDir?: string;
  dominantWindDirection?: string;
  sunshineHours?: number;
  et0Mm?: number;
  isotherm0Altitude?: number; // Isotherme 0°C moyen ou diurne (m)
  isotherm0Meters?: number;
  isotherm0MinMeters?: number; // Isotherme 0°C nocturne minimal (m)
  isotherm0MaxMeters?: number; // Isotherme 0°C diurne maximal (m)
  snowRainLimitAltitude?: number; // Limite Pluie-Neige LPN journalière (m)
  snowRainLimitMeters?: number;
  wetBulbZeroAltitude?: number; // Isotherme 0°C humide moyen (m)
  thermalTierSummary?: string;
  vigilanceAlerts?: DailyVigilanceAlertItem[];
  dominantVigilanceLevel?: VigilanceLevel;
  dominantVigilanceEmoji?: string;
  dominantVigilanceLabel?: string;
  vigilanceSlotSummary?: string; // e.g. "Créneau critique : 14h00 - 19h30 (Fin 20h30)"
  hourlyList?: HourlyForecast[]; // The complete 24 hours of this day
}

export interface MonthlyNormal {
  month: number;
  monthName: string;
  tMin: number;
  tMax: number;
  tMean: number;
  precipitationMm: number;
  sunHours: number;
  frostDays: number;
  heatDays: number;
}

export interface StationClimateNormals {
  stationId: string;
  name: string;
  department: string;
  annualTMean: number;
  annualPrecipitation: number;
  heatwaveThresholdMax: number;
  heatwaveThresholdMin: number;
  monthly: MonthlyNormal[];
}

export interface ClimateAnomaly {
  currentTemp: number;
  normalTemp: number;
  tempAnomaly: number; // e.g. +2.4°C
  isWarmAnomaly: boolean;
  normalPrecip: number;
  monthRainSoFar: number;
  precipAnomalyPercentage: number; // -35% or +40%
  precipDiffMm: number;
  heatwaveAlert: boolean;
  frostAlert: boolean;
  tropicalNightAlert: boolean;
  severity: 'NORMAL' | 'MODERATE' | 'SEVERE' | 'CRITICAL';
  statusLabel: string;
  summaryText: string;
}

export interface WeeklyOutlook {
  weekNumber: number; // 1, 2, 3, 4
  weekTitle: string; // "Semaine 1 (J+1 à J+7)"
  dateRangeFormatted: string;
  expectedTMean: number;
  tempAnomalyVsNormal: number; // +1.8°C
  tempAnomalyStatus: 'Excédent chaud marqué' | 'Léger excédent' | 'Conforme aux normales' | 'Léger déficit' | 'Déficit froid marqué';
  precipAnomalyPct: number; // +30% or -45%
  precipStatus: 'Très sec / Déficit' | 'Sec' | 'Normal' | 'Humide / Excédent' | 'Très arrosé';
  dominantWeatherRegime: string; // "Dorsale anticyclonique atlantique", "Flux d'Ouest zonant perturbé", etc.
  synopticPatternDescription: string;
  confidenceScore: number; // 90%, 75%, 60%, 50%
  heatwaveRisk: 'Nul' | 'Faible' | 'Modéré' | 'Élevé' | 'Très Élevé';
  frostRisk: 'Nul' | 'Faible' | 'Modéré' | 'Élevé';
  droughtRiskIndex: number; // 0-100
  soilMoistureIndex: number; // 0-100%
  keyAdvisories: string[];
}

export interface FourWeekTrends {
  stationId: string;
  stationName: string;
  generatedAt: string;
  baselineNormalMonth: string;
  baselineNormalTemp: number;
  baselineNormalPrecip: number;
  overallMonthTrend: string;
  weeks: WeeklyOutlook[];
  scenarios: {
    median: { tempAnomaly: number; precipPct: number; label: string };
    warmDry: { tempAnomaly: number; precipPct: number; label: string };
    coolWet: { tempAnomaly: number; precipPct: number; label: string };
  };
  macroClimateDrivers: {
    naoIndex: string; // "NAO positive (+1.2) : renforcement du flux atlantique"
    jetStreamPosition: string; // "Jet-Stream ondulant sur l'Europe occidentale"
    soilMoistureStatus: string;
    waterTableImpact: string;
  };
}

export interface HistoricalYearData {
  year: number;
  meanTemp?: number;
  tMean?: number;
  anomaly: number;
  event?: string;
  heatwaveDays?: number;
  frostDays?: number;
}

export interface ClimateProjection {
  year: number;
  rcp45Temp?: number;
  rcp85Temp?: number;
  rcp45Anomaly?: number;
  rcp85Anomaly?: number;
  rcp45HeatDays?: number;
  rcp85HeatDays?: number;
  ssp126?: number;
  ssp245?: number;
  ssp585?: number;
}

export interface AiDiagnostic {
  summary: string;
  historicalContext?: string;
  agricultureImpact: string;
  healthAdviceSenior?: string;
  healthAdvice?: string[];
  waterResourceStatus?: string;
  energyImpact?: string;
  extremeRiskLevel?: 'FAIBLE' | 'MODÉRÉ' | 'ÉLEVÉ' | 'CRITIQUE' | string;
  vigilanceMessage?: string;
  generationDate?: string;
  generatedAt?: string;
}

export interface HistoricalDayRecord {
  date: string; // YYYY-MM-DD
  dayOfWeek: string;
  dayFormatted: string; // "11 Août 2024"
  year: number;
  month: number;
  day: number;
  tempMin: number;
  tempMax: number;
  tempMean: number;
  normalTempMean: number;
  tempAnomalyVsNormal: number; // +2.1°C
  precipitationMm: number;
  precipitationDurationHours: number;
  weatherCode: number;
  weatherDescription: string;
  weatherEmoji: string;
  windSpeedMaxKmh: number;
  windGustMaxKmh: number;
  dominantWindDirection: string;
  sunshineHours: number;
  solarRadiationKwhM2: number;
  pressureMeanHpa: number;
  humidityMinPct: number;
  humidityMaxPct: number;
  dewPointMeanC: number;
  isotherm0Meters: number;
  hourlyProfile: {
    hour: number;
    temp: number;
    rainMm: number;
    windKmh: number;
    code: number;
  }[];
  allTimeDailyRecordsComparison: {
    recordMaxForDay: number;
    recordMaxYear: number;
    recordMinForDay: number;
    recordMinYear: number;
    recordRainForDay: number;
    recordRainYear: number;
  };
  synopticNotes: string;
}

export interface HistoricalArchiveWeekSummary {
  weekTitle: string;
  startDate: string;
  endDate: string;
  days: HistoricalDayRecord[];
  tMeanWeek: number;
  tempAnomalyWeek: number;
  totalPrecipWeekMm: number;
  precipAnomalyWeekPct: number;
  totalSunHoursWeek: number;
  maxGustWeekKmh: number;
  maxGustDayLabel: string;
  weekSummaryText: string;
}

export interface HistoricalMonthArchive {
  stationId: string;
  stationName: string;
  year: number;
  month: number;
  monthName: string;
  days: HistoricalDayRecord[];
  monthTMean: number;
  monthTMeanAnomaly: number;
  monthPrecipTotalMm: number;
  monthPrecipAnomalyPct: number;
  monthSunHoursTotal: number;
  heatwaveDaysCount: number;
  frostDaysCount: number;
  rainDaysCount: number;
  monthHighlights: string[];
}

export interface HistoricalSameDayComparison {
  dateReferenceFormatted: string; // "11 Août"
  day: number;
  month: number;
  monthName: string;
  years: {
    year: number;
    tempMin: number;
    tempMax: number;
    tempMean: number;
    anomalyVsNormal: number;
    precipitationMm: number;
    weatherEmoji: string;
    weatherDescription: string;
    windGustMaxKmh: number;
    sunshineHours: number;
    historicalEventTag?: string;
  }[];
  recordHotYear: { year: number; tempMax: number };
  recordColdYear: { year: number; tempMin: number };
  recordRainYear: { year: number; rainMm: number };
  averageTempOverYears: number;
  warmingTrendDecadeC: number;
}

export interface CloudHourlyStep {
  hourLabel: string;
  totalCoverPct: number;
  lowCoverPct: number;
  midCoverPct: number;
  highCoverPct: number;
  baseHeightMeters: number;
  topHeightMeters: number;
  opticalThicknessPct: number;
  cloudTopTempC: number;
  skyConditionEmoji: string;
  wmoDescription: string;
}

export interface CloudDynamicsDetail {
  totalCloudCoverPct: number;
  cloudCoverOctas: number;
  cloudCoverLabel: 'Ciel pur' | 'Peu nuageux (1-2 octas)' | 'Éclaircies (3-4 octas)' | 'Très nuageux (5-7 octas)' | 'Ciel couvert (8 octas)';
  cloudCeilingMeters: number;
  cloudCeilingFeet: number;
  liftedCondensationLevelLclMeters: number;
  cloudTopHeightMaxMeters: number;
  cloudTopTempInfraredC: number;
  cloudOpticalThicknessPct: number;
  directSolarTransmissionPct: number;
  lowClouds: {
    coverPct: number;
    baseMeters: number;
    baseFeet: number;
    topMeters: number;
    topFlightLevel: number;
    mainTypes: string[];
    description: string;
  };
  midClouds: {
    coverPct: number;
    baseMeters: number;
    baseFeet: number;
    topMeters: number;
    topFlightLevel: number;
    mainTypes: string[];
    description: string;
  };
  highClouds: {
    coverPct: number;
    baseMeters: number;
    baseFeet: number;
    topMeters: number;
    topFlightLevel: number;
    mainTypes: string[];
    description: string;
  };
  dominantCloudFamily: string;
  fogMistRisk: 'AUCUN' | 'BRUME LÉGÈRE' | 'BROUILLARD DENSE' | 'STRATUS PLAQUÉS';
  visibilityKm: number;
  hourlyCloudEvolution: CloudHourlyStep[];
  nebulositySynthesis: string;
}

export interface NationalDailyExtremeItem {
  value: number;
  stationName: string;
  department: string;
  comment: string;
}

export interface NationalVigilanceSummaryItem {
  level: 'VERT' | 'JAUNE' | 'ORANGE' | 'ROUGE' | string;
  phenomenon: string;
  territoryName: string;
  details: string;
}

export interface NationalWeeklyMilestone {
  dayLabel: string;
  eventTitle: string;
  severity: 'record' | 'warning' | 'info' | string;
  description: string;
}

export interface NationalBrokenRecord {
  stationName: string;
  date: string;
  metric: string;
  newValue: string;
  oldValue: string;
  previousYear: number;
}

export interface FullNationalDigest {
  lastUpdated: string;
  territoryId: string;
  territoryName: string;
  flag: string;
  daily: {
    date: string;
    tMaxNational: NationalDailyExtremeItem;
    tMinNational: NationalDailyExtremeItem;
    maxPrecipitation24h: NationalDailyExtremeItem;
    maxWindGust: NationalDailyExtremeItem;
    nationalMeanTemp: number;
    nationalTempAnomalyVsNormal: number;
    totalLightningStrikesCount: number;
    sunshineAverageHours: number;
    sunshineAnomalyPct: number;
    synopticSituation: string;
    keyHighlights: string[];
    vigilancesSummary: NationalVigilanceSummaryItem[];
  };
  weekly: {
    weeklyMeanTemp: number;
    weeklyTempAnomalyVsNormal: number;
    weeklyMeanPrecipitationMm: number;
    weeklyPrecipAnomalyPct: number;
    soilMoistureStatus: string;
    weeklySunshineTotalHours: number;
    rainDaysCount: number;
    fullSunDaysCount: number;
    weeklyMaxGustKmh: number;
    weeklyMaxGustStation: string;
    notableMilestones: NationalWeeklyMilestone[];
    brokenRecordsList: NationalBrokenRecord[];
    weeklySynthesis: string;
  };
}

// ==========================================
// 30-DAY DAILY FORECAST (RÉACTUALISÉ TOUTES LES HEURES)
// ==========================================
export type FrostCategory = 'AUCUN' | 'GELÉE_BLANCHE' | 'GELÉE_MODÉRÉE' | 'FORTE_GELÉE' | 'TRÈS_FORTE_GELÉE' | 'SANS_DÉGEL';

export interface DailyThirtyDayForecastItem {
  dayIndex: number; // 1 to 30
  date: string; // YYYY-MM-DD
  dayLabel: string; // "Mer 12 Août"
  fullDateFormatted: string;
  tempMin: number;
  tempMax: number;
  tempMean: number;
  feelsLikeMin: number;
  feelsLikeMax: number;
  weatherCode: number;
  weatherDescription: string;
  weatherIcon: string;
  precipitationProb: number;
  precipitationMm: number;
  snowfallCm: number;
  snowDepthCm: number;
  isotherm0Meters: number;
  snowRainLimitMeters: number;
  frostCategory: FrostCategory;
  frostLabel: string;
  isNoThawDay: boolean; // Tx <= 0°C
  windSpeedKmh: number;
  windGustKmh: number;
  windDirection: string;
  pressureHpa: number;
  humidityMeanPct: number;
  sunshineHours: number;
  uvIndexMax: number;
  modelConfidence: number; // 95% at D+1 to 45% at D+30
  cloudCoverPct?: number; // 0-100%
  cloudCoverOctas?: number; // 0-8 octas
  tempAnomalyVsNormal: number;
  synopticRegime: string;
  airMassOrigin: string;
  vigilanceAlerts?: DailyVigilanceAlertItem[];
  dominantVigilanceLevel?: VigilanceLevel;
  dominantVigilanceEmoji?: string;
  vigilanceSlotSummary?: string;
}

export interface ThirtyDayForecastCollection {
  stationId: string;
  stationName: string;
  altitudeMeters: number;
  lastHourlyRun: string;
  nextHourlyRun: string;
  refreshCountdownSec: number;
  sourceModel: string;
  days: DailyThirtyDayForecastItem[];
  summaryPeriod: string;
  snowDaysCount: number;
  frostDaysCount: number;
  noThawDaysCount: number;
  totalExpectedSnowCm: number;
  totalExpectedPrecipMm: number;
  meanTMin: number;
  meanTMax: number;
  maxConsecutiveFrostDays: number;
  scenarios: {
    median: { tempDelta: number; precipDeltaPct: number; snowDeltaPct: number; label: string };
    coldSnowy: { tempDelta: number; precipDeltaPct: number; snowDeltaPct: number; label: string };
    mildDry: { tempDelta: number; precipDeltaPct: number; snowDeltaPct: number; label: string };
  };
}

// ==========================================
// 8-MONTH SEASONAL TRENDS (DÉCADE PAR DÉCADE - 24 DÉCADES)
// ==========================================
export type SynopticRegimeCode8M = 
  | 'NAO_POS' 
  | 'NAO_NEG' 
  | 'SCAND_BLOCK' 
  | 'POLAR_VORTEX' 
  | 'ATLANTIC_RIDGE' 
  | 'MOSCOW_PARIS_COLD' 
  | 'MED_LOW' 
  | 'WEST_ZONAL';

export interface DecadeProjection {
  decadeNumber: number; // 1 to 24 (sur 8 mois)
  decadeInMonth: number; // 1, 2 ou 3 (1ère, 2ème ou 3ème décade)
  monthIndex: number; // 0 to 11
  monthName: string;
  decadeTitle: string; // "Décade 1 (1er au 10 Décembre)"
  dateRangeFormatted: string;
  expectedTMean: number;
  tempAnomalyVsNormal: number;
  tempAnomalyStatus: string;
  precipAnomalyPct: number;
  precipStatus: string;
  expectedPrecipMm: number;
  normalPrecipMm: number;
  snowPotentialScore: number; // 0 to 100%
  expectedSnowfallCm: number;
  dominantSynopticRegime: string;
  synopticRegimeCode: SynopticRegimeCode8M;
  coldWaveProbability: number; // 0 to 100%
  heavySnowRisk: 'Nul' | 'Faible' | 'Modéré' | 'Élevé' | 'Très Élevé';
  frostDaysExpected: number;
  confidenceScore: number; // 92% à 30%
  heatwaveRisk: 'Nul' | 'Faible' | 'Modéré' | 'Élevé' | 'Très Élevé';
  droughtRisk: 'Nul' | 'Faible' | 'Modéré' | 'Élevé' | 'Critique';
  groundMoistureForecast: number; // 0-100%
  synopticDescription: string;
  mountainSnowpackImpact: string;
  agriculturalAndEnergyImpact: string;

  // Nouveaux paramètres & indicateurs avancés
  soilWaterIndexPct: number; // 0 à 100% (Indice d'humidité des sols SWI)
  groundMoistureStatus: 'EXCÉDENT_SATURATION' | 'OPTIMAL' | 'DÉFICIT_MODÉRÉ' | 'SÉCHERESSE_SÉVÈRE';
  waterTableRechargeIndex: string; // e.g. "Recharge active +18%", "Recharge stoppée"
  synopticBlockingIndexPct: number; // Indice de blocage Tibaldi-Molteni (%)
  speiDroughtIndex: number; // Indice SPEI (-3.0 à +3.0)
  speiLabel: string;
  hotDaysExpected: number; // Jours Tmax >= 25°C
  veryHotDaysExpected: number; // Jours Tmax >= 30°C
  capePotentialJkg: number; // Énergie convective CAPE moyenne
  thunderstormRiskScore: number; // 0 à 100
  sstAnomalyMediterreaneanC: number; // Anomalie de surface Méditerranée
  sstAnomalyAtlanticC: number; // Anomalie de surface Atlantique Nord
  multiModelConsensus: {
    ecmwfSeas5Anom: number;
    copernicusC3sAnom: number;
    meteoFranceSystem8Anom: number;
    ncepCfsv2Anom: number;
    ukmoGloSea6Anom: number;
    dwdGcfsAnom: number;
    spreadLevel: 'FAIBLE_ACCORD_FORT' | 'MODÉRÉ' | 'FORT_DIVERGENCE';
  };
}

export interface MonthlySeasonalProjection {
  monthIndex: number; // 0 to 11
  monthName: string; // e.g. "Septembre"
  year: number; // e.g. 2026
  monthLabel: string; // e.g. "Septembre 2026"
  season: 'Automne' | 'Hiver' | 'Printemps' | 'Été';
  normalTMean: number;
  expectedTMean: number;
  tempAnomaly: number;
  tempAnomalyStatus: string;
  normalPrecipMm: number;
  expectedPrecipMm: number;
  precipAnomalyPct: number;
  precipStatus: string;
  tercilesTemp: {
    warmPct: number; // % probabilité plus chaud que normale
    normalPct: number; // % probabilité conforme
    coldPct: number; // % probabilité plus froid
  };
  tercilesPrecip: {
    wetPct: number; // % probabilité plus humide
    normalPct: number; // % probabilité conforme
    dryPct: number; // % probabilité plus sec
  };
  dominantSynopticRegime: string;
  synopticRegimeCode: SynopticRegimeCode8M;
  confidenceScore: number; // 90% down to 35%
  snowPotentialScore: number;
  expectedSnowfallCm: number;
  frostDaysExpected: number;
  hotDaysExpected: number;
  soilWaterIndexPct: number;
  speiDroughtIndex: number;
  speiLabel: string;
  riskSummary: string;
  agroEnergyAdvice: string;
  decades: DecadeProjection[]; // Les 3 décades de ce mois
}

export type SeasonalScaleLevel = 'DEPARTMENT' | 'REGION' | 'NATIONAL';

export interface FrenchDepartmentInfo {
  code: string; // e.g. "01", "13", "75", "2A", etc.
  name: string; // e.g. "Ain", "Bouches-du-Rhône", "Paris"
  region: string; // e.g. "Auvergne-Rhône-Alpes", "Île-de-France"
  prefecture: string; // e.g. "Bourg-en-Bresse", "Marseille", "Paris"
  latitude: number;
  longitude: number;
  avgAltitude: number;
  climateZone: string;
  tMeanAnnual: number;
  annualPrecipMm: number;
  dominantTraits: string;
  keyRisks: string[];
}

export interface FrenchRegionInfo {
  id: string;
  name: string;
  capital: string;
  departmentCodes: string[];
  latitude: number;
  longitude: number;
  avgAltitude: number;
  climateProfile: string;
  geographicalFeatures: string;
  tMeanAnnual: number;
  annualPrecipMm: number;
}

export interface SpatialSubOutlook {
  codeOrId: string;
  name: string;
  tempAnomalyVsNormal: number;
  precipAnomalyPct: number;
  snowPotentialScore: number;
  character: string;
}

export interface SeasonalEightMonthTrends {
  scaleMode: SeasonalScaleLevel; // 'DEPARTMENT' | 'REGION' | 'NATIONAL'
  territoryId: string;
  territoryName: string;
  territoryCode?: string;
  territorySubtitle: string;
  regionName?: string;
  departmentName?: string;
  stationId?: string;
  stationName?: string;
  altitudeMeters: number;
  climateZone: string;
  generatedAt: string;
  lastDailyRunTimestamp: string;
  modelEnsembleSources: string;
  baselineNormalsPeriod: string;
  eightMonthSynthesis: string;
  biDailyRun: {
    runSlot: '06h00 UTC' | '18h00 UTC' | string;
    runDateFormatted: string;
    runTimestamp: string;
    nextRunTimestamp: string;
    nextRunCountdownHours: number;
    officialSupercomputer: string;
    cycleType: string;
    isLockedForCycle: boolean;
    seedKey?: string;
  };
  months: MonthlySeasonalProjection[]; // Synthèse des 8 mois complets
  decades: DecadeProjection[]; // 24 décades complètes
  winterSummary: {
    winterCharacter: string;
    expectedSnowAnomaly: string;
    coldWaveRiskIndex: number;
    naoTrend: string;
    polarVortexStability: string;
    scandiBlockFrequence: string;
  };
  macroTeleconnections: {
    naoState: string;
    scandBlockState: string;
    polarVortexStatus: string;
    ensoStatus: string;
    atlanticMdrSst: string;
    mjoPhase: string;
  };
  seasonalRiskMatrix: {
    coldWave: { maxRisk: string; peakPeriod: string };
    snowDeficitOrExcess: { severity: string; impactedMassifs: string };
    frost: { firstRiskDate: string; altitudeImpact: string };
    winterStorms: { probability: string; mainZones: string };
    springDrought: { severity: string; impactedSectors: string };
  };
  spatialComparison?: {
    scaleContextLabel: string;
    relativeToNationalAverage: string;
    subTerritories?: SpatialSubOutlook[];
  };
}

// ==========================================
// OBSERVATOIRE DE L'ENNEIGEMENT & NIVOLOGIE PAR COMMUNE
// ==========================================
export type SnowQualityType = 
  | 'Poudreuse légère et froide (Champagne powder)' 
  | 'Neige fraîche compacte' 
  | 'Neige damée / tassée' 
  | 'Neige croûtée par le regel' 
  | 'Neige humide / lourde' 
  | 'Neige de printemps / névé transformé' 
  | 'Absence de manteau neigeux';

export interface AltitudeSnowLayer {
  altitudeMeters: number;
  label: string; // "Fond de vallée", "Village / Station (1200m)", "Mi-pente (1800m)", "Sommet / Crêtes (2500m)"
  snowDepthCm: number;
  freshSnow24hCm: number;
  freshSnow72hCm: number;
  freshSnow7DaysCm: number;
  snowQuality: SnowQualityType;
  densityKgM3: number;
  sweWaterEquivalentMm: number;
  snowTemperatureSurfaceC: number;
  snowTemperatureBaseC: number;
  isContinuousSnowpack: boolean;
  snowTypeDiagnostic?: SnowTypeDiagnostic;
}

export interface AvalancheRiskReport {
  dangerLevel: 1 | 2 | 3 | 4 | 5;
  dangerLabel: '1 - Faible' | '2 - Limité' | '3 - Marqué' | '4 - Fort' | '5 - Très Fort';
  color: string;
  primaryRiskTypes: string[]; // ["Plaques à vent en versants Nord", "Départs spontanés de neige humide", "Glissements de fond"]
  criticalAltitudes: string;
  favorableExposures: string[];
  criticalExposures: string[];
  beraBulletinSummary: string;
}

export interface MultiYearSnowSeasonRecord {
  seasonLabel: string; // "Hiver 2025-2026", "Hiver 2010-2011", "Hiver 1985-1986", "Hiver 1955-1956"
  startYear: number;
  endYear: number;
  totalSnowfallSeasonCm: number;
  maxSnowDepthRecordedCm: number;
  maxSnowDepthDate: string;
  daysWithSnowCoverGt1cm: number;
  daysWithSnowCoverGt10cm: number;
  daysWithSnowCoverGt30cm: number;
  daysWithSnowCoverGt50cm: number;
  firstSnowDate: string;
  lastSnowDate: string;
  snowAnomalyVs1991_2020Pct: number;
  winterCharacter: string;
  isRecordSnowy: boolean;
  isRecordDeficit: boolean;
}

export interface SnowNivologyObservatory {
  stationId: string;
  stationName: string;
  department: string;
  massifName: string;
  altitudeStationMeters: number;
  lastUpdated: string;
  currentIsotherm0Meters: number;
  currentRainSnowLimitMeters: number;
  currentSnowStatus: string;
  altitudeLayers: AltitudeSnowLayer[];
  avalancheReport: AvalancheRiskReport;
  historicalSeasons: MultiYearSnowSeasonRecord[]; // 1950 to 2026
  allTimeRecordSnowDepthCm: number;
  allTimeRecordSnowYear: string;
  historicalAverages: {
    avgSnowfallSeasonCm: number;
    avgDaysSnowCoverGt1cm: number;
    avgDaysSnowCoverGt10cm: number;
    avgDaysSnowCoverGt30cm: number;
    avgFirstSnowDate: string;
    avgLastSnowDate: string;
    climateTrendDecadeDays: number; // e.g. -3.8 jours d'enneigement / décennie
  };
  snowQualityDetails: {
    grainType: string;
    stabilityScore: number; // 0-100
    skatingAndSkiCondition: string;
    drivingCondition: string;
  };
  snowTypeDiagnostic?: SnowTypeDiagnostic;
}

// ==========================================
// ANALYSEUR DES GELÉES & HIVERNOLOGIE MULTI-ANNÉES
// ==========================================
export interface FrostTiersCount {
  weakFrostDays: number; // -0.1°C à -2.0°C (Gelées blanches faibles)
  moderateFrostDays: number; // -2.1°C à -5.0°C (Gelées modérées)
  hardFrostDays: number; // -5.1°C à -10.0°C (Fortes gelées)
  extremeFrostDays: number; // < -10.0°C (Très fortes gelées)
  noThawDays: number; // Tx <= 0.0°C (Journées sans dégel / glace permanente)
  totalFrostDays: number; // Tn <= 0.0°C
}

export interface MultiYearFrostSeasonRecord {
  seasonLabel: string; // "2025-2026", "2011-2012", "1984-1985", "1955-1956"
  year: number;
  frostTiers: FrostTiersCount;
  absoluteMinTempC: number;
  absoluteMinTempDate: string;
  firstAutumnFrostDate: string;
  lastSpringFrostDate: string;
  frostFreePeriodDays: number;
  longestConsecutiveFrostSpellDays: number;
  coldWaveDaysCount: number;
  heatingDegreeDaysDju: number;
  winterColdSeverityScore: number; // 0 to 100
  notableColdWaveTag?: string;
  isRecordCold: boolean;
  isRecordMild: boolean;
}

export interface FrostAndColdObservatory {
  stationId: string;
  stationName: string;
  altitudeMeters: number;
  department: string;
  climateZone: string;
  lastUpdated: string;
  currentSeasonProgress: {
    seasonLabel: string;
    currentFrostTiers: FrostTiersCount;
    currentMinSeasonC: number;
    currentMinDate: string;
    firstFrostObservedDate: string;
    anomalyVsNormalDays: number;
  };
  historicalFrostSeasons: MultiYearFrostSeasonRecord[]; // 1950 to 2026
  normals1991_2020: {
    avgTotalFrostDays: number;
    avgWeakFrostDays: number;
    avgModerateFrostDays: number;
    avgHardFrostDays: number;
    avgExtremeFrostDays: number;
    avgNoThawDays: number;
    avgFirstAutumnFrostDate: string;
    avgLastSpringFrostDate: string;
    avgAnnualDjuHeating: number;
  };
  allTimeColdRecords: {
    absoluteColdRecordC: number;
    absoluteColdRecordDate: string;
    coldestWinterSeason: string;
    longestColdWaveDays: number;
    longestColdWaveYear: string;
    latestSpringFrostRecordDate: string;
    earliestAutumnFrostRecordDate: string;
  };
  historicalColdWavesCatalog: {
    name: string;
    period: string;
    minTempRecorded: number;
    consecutiveFrostDays: number;
    nationalImpactDescription: string;
  }[];
}

// ==========================================
// OBSERVATOIRE ENSO & RÉGIMES MÉTÉOS 0-6 MOIS
// ==========================================
export interface EnsoMonthlyProjection {
  monthIndex: number; // 1 to 6
  monthName: string; // "Septembre 2026", "Octobre 2026", etc.
  oniSstAnomalyC: number; // e.g. -0.8°C
  phase: 'LA_NINA' | 'NEUTRE' | 'EL_NINO';
  phaseLabel: string; // "La Niña (Modérée)", "Neutralité ENSO", "El Niño (Fort)"
  probLaNina: number; // e.g. 68%
  probNeutral: number; // e.g. 28%
  probElNino: number; // e.g. 4%
  walkerCirculationImpact: string;
  teleconnectionEuropeEffect: string;
  jetStreamPosition: string;
}

export interface EuropeanWeatherRegime {
  regimeId: 'NAO_POS' | 'NAO_NEG' | 'ATLANTIC_RIDGE' | 'SCAND_BLOCK' | 'MED_TROUGH' | 'SUBTROPICAL_RIDGE';
  name: string;
  shortName: string;
  icon: string;
  currentProbabilityPct: number;
  shortTermTrend: string; // 1 à 7 jours
  mediumTermTrend: string; // 1 à 4 semaines
  longTermTrend6M: string; // 1 à 6 mois
  synopticMechanism: string;
  impactFranceTemperature: string;
  impactFrancePrecipitation: string;
  typicalSeasonality: string;
}

export interface TeleconnectionIndexItem {
  code: string; // "NAO", "AO", "MJO", "QBO", "IOD", "VORTEX_POLAR"
  name: string;
  currentValueFormatted: string;
  phaseLabel: string;
  statusColor: string;
  trendDescription: string;
  sixMonthProjection: string;
  impactFranceSummary: string;
}

export interface SixMonthSynopticSynthesisMonth {
  monthOffset: number; // 1 to 6
  monthName: string; // e.g. "Septembre 2026"
  season: string; // "Fin d'Été / Rentrée", "Automne 2026", "Hiver 2026-2027"
  dominantRegime: string;
  dominantRegimeId: string;
  tempAnomalyForecastC: number; // e.g. +1.2°C
  precipAnomalyForecastPct: number; // e.g. -15%
  ensoPhaseAtMonth: string;
  confidenceScorePct: number;
  synopticScenario: string;
  agriculturalAndHydricOutlook: string;
}

export interface DailyEnsoEvolutionPoint {
  dateIso: string; // "2026-08-14"
  dateFormatted: string; // "14 Août 2026"
  dayOffset: number; // -60 (past) to +180 (future)
  nino34AnomalyC: number;
  nino12AnomalyC: number;
  nino3AnomalyC: number;
  nino4AnomalyC: number;
  soiIndex: number; // Southern Oscillation Index
  iodDipoleIndexC: number; // Dipole Mode Index
  mjoPhase: number; // 1 to 8
  mjoAmplitude: number; // e.g. 1.85
  naoIndex: number; // e.g. +0.65
  aoIndex: number; // e.g. +0.82
  qbo30hPaWind: number; // m/s (e.g. +14)
  isForecast: boolean;
}

export interface EnsoAndTeleconnectionsObservatoryData {
  generatedAt: string;
  currentDateFormatted: string;
  stationName: string;
  dailyParamsUpdateTimestamp: string;
  currentEnsoStatus: {
    oniIndex: number; // e.g. -0.7°C
    phase: 'LA_NINA' | 'NEUTRE' | 'EL_NINO';
    phaseLabel: string;
    soiSouthernOscillationIndex: number; // e.g. +8.4
    tradeWindsStrength: 'Renforcés (Alizés vigoureux)' | 'Normaux' | 'Affaiblis / Inversés';
    seaSurfaceTempPacificAnomalyC: number;
    diagnosticSummary: string;
    historicalAnalogs: string[];
  };
  ninoRegionsSummary: {
    nino12: { current: number; trend7d: string; status: string; label: string };
    nino3: { current: number; trend7d: string; status: string; label: string };
    nino34: { current: number; trend7d: string; status: string; label: string };
    nino4: { current: number; trend7d: string; status: string; label: string };
  };
  dailyTeleconnectionMetrics: {
    soiDaily: { value: number; label: string; trend: string };
    iodDaily: { value: number; label: string; trend: string };
    mjoDaily: { phase: number; amplitude: number; convectiveCenter: string; trajectory: string };
    naoDaily: { value: number; label: string; spread: string };
    aoDaily: { value: number; label: string; vortexCoupling: string };
    qboDaily: { wind30hpa: number; wind50hpa: number; phase: string };
  };
  dailyEnsoHistoryAndProjections: DailyEnsoEvolutionPoint[];
  sixMonthEnsoProjections: EnsoMonthlyProjection[];
  europeanRegimes: EuropeanWeatherRegime[];
  majorTeleconnections: TeleconnectionIndexItem[];
  sixMonthSyntheses: SixMonthSynopticSynthesisMonth[];
}

// ==========================================
// 14-DAY DETAILED SCENARIOS & DIVERGENCES
// ==========================================

export interface DayScenarioBranch {
  name: string; // e.g. "Scénario 1 : Dominant (Anticyclone et Subsidence)"
  type?: 'dominant' | 'alt1' | 'alt2';
  title?: string; // e.g. "Temps sec, doux et lumineux"
  probabilityPct: number; // e.g. 60%
  supportingModels?: string[]; // e.g. ["ECMWF IFS", "Météo-France AROME", "UKMO"]
  synopticPattern: string; // e.g. "Dorsale anticyclonique d'altitude"
  tempMin: number;
  tempMax: number;
  feelsLikeMax?: number;
  precipitationMm: number;
  precipitationProbPct?: number;
  precipitationType?: string; // "Ciel sec", "Ondées locales", "Pluie continue", "Orages"
  snowfallCm: number;
  windGustKmh: number;
  windDirection?: string;
  sunshineHours?: number;
  isotherm0Meters?: number;
  description: string; // Detailed narrative of atmospheric mechanism
  synopticTrigger?: string; // Explication physique détaillée du déclencheur synoptique
  practicalImpacts?: {
    clothing: string; // Conseil tenue vestimentaire
    agricultureOutdoor: string; // Arrosage, fenaison, chantiers, jardinage
    drivingTransit: string; // Conditions de circulation routière, vent latéral
    homeComfort: string; // Confort intérieur, ventilation nocturne, chauffage
  };
}

export interface PreviousYearComparisonRecord {
  datePreviousYear: string; // e.g. "12 Août 2025"
  tempMinN1: number;
  tempMaxN1: number;
  tempMeanN1: number;
  weatherCodeN1: number;
  weatherDescriptionN1: string;
  rainMmN1: number;
  normalTMin: number;
  normalTMax: number;
  normalTMean: number;
  deltaTMeanVsN1: number; // e.g. -3.2°C (Plus frais qu'en 2025)
  deltaTMaxVsN1: number;
  deltaTMinVsN1: number;
  deltaTMeanVsNormal: number; // vs 1991-2020
  climaticSummaryN1: string; // Narrative comparing this year vs last year
  isWarmerThanLastYear: boolean;
}

export interface FourteenDayDayDetail {
  dayIndex: number; // 0 (Aujourd'hui) to 14
  date: string; // YYYY-MM-DD
  dayLabel: string; // e.g. "Mer 12 Août"
  fullDateFormatted: string; // e.g. "Mercredi 12 Août 2026"
  horizonCategory: 'COURT_TERME_J1_J3' | 'MOYEN_TERME_J4_J7' | 'TENDANCE_J8_J10' | 'LONGUE_ECHEANCE_J11_J14';
  divergenceLevel: 'FAIBLE_CONSENSUS' | 'MODEREE' | 'FORTE_DIVERGENCE' | 'DIVERGENCE_MAXIMALE';
  divergenceLevelLabel: string;
  divergenceSummary: string; // Explanation of what models agree / disagree on
  modelConsensusScorePct: number; // e.g. 92% at J+1 down to 42% at J+14
  
  // Honest Uncertainty & Scientific Transparency (Added fields)
  uncertaintyMarginC: number; // e.g. ±0.8°C at J+1, ±2.5°C at J+5, ±5.5°C at J+12
  confidenceGrade: 'EXCELLENTE' | 'BONNE' | 'MOYENNE' | 'FAIBLE_SPÉCULATIVE';
  confidenceGradeLabel: string; // e.g. "Fiabilité Haute • Déterministe", "Tendance Probable", etc.
  whatIsCertain: string; // Ce qui est scientifiquement acquis pour cette date
  whatIsUncertain: string; // Ce qui reste incertain / le piège météo
  synopticPivot: string; // L'élément clé qui fera basculer vers un scénario plutôt qu'un autre
  probableTxRange: { min: number; max: number }; // Fourchette réaliste de Tx
  probableTnRange: { min: number; max: number }; // Fourchette réaliste de Tn
  
  dominantScenario: DayScenarioBranch;
  alternativeScenario1: DayScenarioBranch;
  alternativeScenario2?: DayScenarioBranch;
  
  // Multi-model cluster breakdown
  modelClusters: {
    ecmwfVote: string;
    gfsVote: string;
    iconVote: string;
    arpegeVote: string;
    gemVote: string;
  };
  
  // Real Multi-Model Consensus Data (10 Models)
  multiModelConsensus?: DayMultiModelConsensus;

  // Comparison with N-1 (Same calendar day in previous year)
  previousYearComparison: PreviousYearComparisonRecord;
}

export interface ModelForecastValue {
  modelId: string;
  name: string;
  shortName?: string;
  fullName: string;
  countryOrOrg: string;
  flag?: string; // e.g. "🇪🇺", "🇫🇷", "🇩🇪", "🇺🇸", "🇨🇦", "🇬🇧", "🇯🇵", "🇨🇳"
  resolutionKm?: string; // e.g. "9 km", "1.3 km", "6.5 km", "13 km", "25 km"
  modelCategory?: 'REGIONAL_FINE' | 'GLOBAL_EUROPE' | 'GLOBAL_WORLD';
  tempMin: number | null;
  tempMax: number | null;
  precipitationMm: number | null;
  weatherCode: number | null;
  isAvailable: boolean;
  runStatus?: 'DIRECT_RUN' | 'ENSEMBLE_TREND' | 'REGIONAL_HORIZON_ENDED' | 'NON_RETENU_REGION';
  isExcludedOutsideAsia?: boolean;
  exclusionReason?: string;
  ensembleMembersCount?: number;
}

export interface DayMultiModelConsensus {
  dayIndex: number;
  date: string;
  models: Record<string, ModelForecastValue>;
  availableModelsCount: number;
  tempMaxMin: number;
  tempMaxMax: number;
  tempMaxMedian: number;
  tempMaxSpread: number;
  tempMinMin: number;
  tempMinMax: number;
  tempMinMedian: number;
  tempMinSpread: number;
  precipitationMedian: number;
  precipitationMax: number;
  agreementStatus: 'UNANIME' | 'BON_ACCORD' | 'DIVERGENCE_MODEREE' | 'FORTE_DISPERSION';
  agreementLabel: string;
  synopticDiscrepancyReason: string;
  warmestModelName?: string;
  coldestModelName?: string;
}

export interface FourteenDayMilestoneSynthesis {
  milestoneId: 'PHASE_1_3' | 'PHASE_4_7' | 'PHASE_8_10' | 'PHASE_11_14';
  title: string; // "Phase 1 : J+1 à J+3 (Haute Fiabilité)"
  daysRangeLabel: string; // "12 au 14 Août 2026"
  confidenceIndexPct: number;
  synopticConsensusOverview: string;
  keyDivergencePoints: string[];
  dominantRegimeName: string;
  temperatureTrendOverview: string;
  precipitationOverview: string;
}

export interface FourteenDayScenariosCollection {
  stationId: string;
  stationName: string;
  altitudeMeters: number;
  generatedAtFormatted: string;
  lastRunTime: string;
  days: FourteenDayDayDetail[];
  milestones: FourteenDayMilestoneSynthesis[];
  multiModelDays?: DayMultiModelConsensus[];
  overallSummary: string;
}

// ==========================================
// GIGA BULLETIN NATIONAL À 4 SEMAINES (FRANCE)
// ==========================================

export interface NationalBulletinScenario {
  scenarioId: string;
  name: string; // "Scénario A : Blocage Scandinave et Flux d'Est Sec"
  probabilityPct: number; // 60%
  regimeType: string; // "Scand-Block"
  synopticMechanism: string;
  temperatureAnomalyC: number; // +1.5°C
  precipitationAnomalyPct: number; // -30%
  description: string;
  isDominant: boolean;
}

export interface NationalRegionalDetail {
  regionName: string; // e.g. "Nord-Ouest (Bretagne, Normandie, Hauts-de-France)"
  regionCode: 'NO' | 'NE' | 'CENTRE' | 'SO' | 'SE' | 'MASSIFS';
  dominantWeather: string;
  tempAnomalyC: number;
  precipAnomalyPct: number;
  riskHighlights: string[];
  summaryText: string;
}

export interface NationalFourWeekBulletinWeek {
  weekIndex: number; // 1 to 4 (S+1, S+2, S+3, S+4)
  weekLabel: string; // "Semaine 1 (S+1) : Du 12 au 18 Août 2026"
  shortDateRange: string; // "12-18 Août"
  confidenceIndexPct: number; // e.g. 85%, 70%, 55%, 40%
  generalAtmosphericContext: string;
  
  scenarios: {
    dominant: NationalBulletinScenario;
    alternative: NationalBulletinScenario;
    minority: NationalBulletinScenario;
  };
  
  regions: NationalRegionalDetail[];
  
  keyNationalRisks: string[];
  hydricAndAgriculturalOutlook: string;
  energyAndConsumptionOutlook: string;
}

export interface NationalFourWeekBulletinCollection {
  generatedAt: string;
  dateRangeFormatted: string;
  generalNationalHeadline: string;
  executiveSynthesis: string;
  weeks: NationalFourWeekBulletinWeek[];
  teleconnectionDriversSummary: {
    mjoPhase: string;
    naoTrend: string;
    aoTrend: string;
    ensoPhase: string;
    polarVortexStatus: string;
  };
}

// ==========================================
// TEMPS GLOBAUX DANS LE MONDE & ÉVÉNEMENTS EXTRÊMES EN TEMPS RÉEL
// ==========================================

export type ExtremeEventType = 
  | 'CYCLONE_HURRICANE_TYPHOON'
  | 'HEAT_DOME_RECORD'
  | 'POLAR_COLD_BLIZZARD'
  | 'TORRENTIAL_FLOOD_RIVER'
  | 'MEGA_WILDFIRE_DROUGHT'
  | 'SEVERE_CONVECTION_DERECHO';

export type ExtremeEventSeverity = 'CRITIQUE_CATASTROPHIQUE' | 'ALERTE_MAXIMALE' | 'VIGILANCE_RENFORCEE';

export interface GlobalExtremeWeatherEvent {
  id: string;
  name: string; // e.g. "Super Typhon MAWAR (Bassin Pacifique Ouest)"
  type: ExtremeEventType;
  typeLabel: string;
  categoryLabel?: string; // "Catégorie 4 Saffir-Simpson", "Canicule Record +51°C", "Vortex Sibérien -56°C"
  severity: ExtremeEventSeverity;
  continent: 'Europe' | 'Amérique du Nord' | 'Amérique du Sud' | 'Asie' | 'Afrique' | 'Océanie' | 'Pôles & Océans';
  locationName: string; // e.g. "Mer des Philippines & Taïwan", "Golfe Persique (Koweït)", "Iakoutie (Russie)"
  coordinates: { lat: number; lon: number };
  status: 'ACTIF_EN_COURS' | 'EN_INTENSIFICATION' | 'EN_ATTÉNUATION';
  peakValueFormatted: string; // "Vents 245 km/h • 922 hPa", "+51.8°C relevés", "-56.2°C au sol", "380 mm en 24h"
  anomalyVsNormal: string; // "+12.4°C vs normale", "5x la pluie mensuelle", "Rafales records décennales"
  synopticMechanism: string; // Detailed meteorological explanation
  impactsDescription: string; // Humanitarian, infrastructure, ecosystems impacts
  affectedPopulationEstimate: string;
  satelliteImageHint: string;
  lastUpdatedFormatted: string;
  verifiedMedia?: string[]; // e.g. ['AFP', 'Le Monde', 'Franceinfo', 'Reuters']
  meteorologicalCenters?: string[]; // e.g. ['NOAA / NWS', 'Météo-France', 'OMM / WMO']
  controlledDataTypes?: string; // e.g. 'Balises SYNOP WMO + Satellites VIIRS 375m'
  verifiedWithin24h?: boolean;
}

export interface GlobalCityWeather {
  cityId: string;
  cityName: string;
  country: string;
  continent: 'Europe' | 'Amérique du Nord' | 'Amérique du Sud' | 'Asie' | 'Afrique' | 'Océanie' | 'Pôles';
  latitude: number;
  longitude: number;
  altitude: number;
  currentTempC: number;
  tempMinC: number;
  tempMaxC: number;
  apparentTempC: number;
  weatherCode: number;
  weatherDescription: string;
  weatherIcon: string;
  humidityPct: number;
  pressureHpa: number;
  windSpeedKmh: number;
  windGustKmh: number;
  climateAnomalyC: number; // vs local 1991-2020 normal
  precipitation24hMm: number;
  uvIndex: number;
  airQualityLabel: string;
  isExtremeAlert: boolean;
  alertHeadline?: string;
}

export interface CryosphereMetrics {
  arcticSeaIceExtentMillionKm2: number;
  arcticAnomalyPct: number; // e.g. -14.2% vs 1981-2010
  antarcticSeaIceExtentMillionKm2: number;
  antarcticAnomalyPct: number; // e.g. -18.5%
  greenlandMeltSurfaceKm2: number;
  polarVortexStrengthIndex: 'Vigoureux et Compact' | 'Ondulant / Fragmenté' | 'Réchauffement Stratosphérique Majeur (SSW)';
  cryosphereSynthesis: string;
}

export interface GlobalClimateMetrics {
  globalMeanTempAnomalyC: number; // +1.48°C
  northernHemisphereAnomalyC: number; // +1.82°C
  southernHemisphereAnomalyC: number; // +1.14°C
  globalSstOceansAnomalyC: number; // +0.95°C (Record absolu mondial)
  ensoPacificNiño34C: number; // +1.95°C (Fort El Niño)
  mjoPhaseActive: string; // Phase 7/8
  activeTropicalSystemsCount: number;
  planetaryRecordsCount24h: number;
}

export interface GlobalExtremeEventsCollection {
  generatedAt: string;
  globalMetrics: GlobalClimateMetrics;
  cryosphere: CryosphereMetrics;
  extremeEvents: GlobalExtremeWeatherEvent[];
  globalCities: GlobalCityWeather[];
  planetaryExecutiveSynthesis: string;
}

// ==========================================
// GIGA BULLETIN MÉTÉO J+1 À J+7 PAR DÉPARTEMENT & MONDE
// ==========================================

export type ConvectiveRiskLevel = 'NUL' | 'FAIBLE' | 'MODERE' | 'FORT_ORAGES' | 'EXTREME_GRELE';
export type WorkSafetyRiskLevel = 'FAVORABLE' | 'MODÉRÉ' | 'DÉCONSEILLÉ' | 'CRITIQUE_INTERDIT';

export interface DayDiurnalPeriod {
  timeSlot: 'Matinée (06h - 12h)' | 'Après-midi (12h - 18h)' | 'Soirée & Nuit (18h - 06h)';
  skyCondition: string;
  icon: string;
  tempValue: number;
  tempApparent: number;
  windDirection: string;
  windSpeedKmh: number;
  windGustKmh: number;
  precipitationProbPct: number;
  precipitationMm: number;
  precipitationType: 'Aucune' | 'Bruine locale' | 'Pluie continue modérée' | 'Averses convectives' | 'Orage violent' | 'Neige en grains' | 'Neige seule' | 'Grésil / Grêle';
  humidityPct: number;
  fogOrFrostRisk: string; // e.g. "Brumes et brouillards matinaux en fond de vallée", "Rosée abondante", "Gelée blanche au sol 0°C", "Ciel clair"
  isotherm0mMeters: number;
}

export interface DepartmentDayForecast {
  dayOffset: number; // 1 to 7
  dayOfWeek: string; // e.g. "Mercredi 12 Août"
  shortDate: string; // "12/08"
  synopticSituationSummary: string;
  tempMinC: number;
  tempMaxC: number;
  tempNormalMinC: number;
  tempNormalMaxC: number;
  tempAnomalyC: number;
  sunshineHoursEstimate: number;
  uvIndex: number;
  convectiveRisk: ConvectiveRiskLevel;
  confidenceScorePct: number;
  morning: DayDiurnalPeriod;
  afternoon: DayDiurnalPeriod;
  eveningNight: DayDiurnalPeriod;
  modelsComparison: {
    aromeTempMax: number;
    arpegeTempMax: number;
    ecmwfTempMax: number;
    gfsTempMax: number;
    iconTempMax: number;
    dominantConsensus: string;
    spreadConfidence: string;
  };
}

export interface DepartmentMicroclimateDiagnostic {
  reliefAndValleysEffect: string;
  thermalInversionsRisk: string;
  localWindRegime: string; // "Mistral rhodanien", "Tramontane", "Vent d'Autan", "Bise de Nord-Est", "Brise thermique de mer", "Vent de Foehn"
  hydrologicalState: string;
}

export interface BioclimaticAndActivityIndices {
  agriculturalSprayingIndex: WorkSafetyRiskLevel;
  agriculturalSprayingDetails: string;
  hayMakingAndHarvestingIndex: WorkSafetyRiskLevel;
  hayMakingDetails: string;
  constructionBtpAlert: string;
  roadTransportAlert: string;
  wildfireRiskFwi: 'FAIBLE' | 'MODÉRÉ' | 'SÉVÈRE' | 'TRÈS SÉVÈRE' | 'EXTRÊME';
  airQualityAndPollen: string;
}

export interface DepartmentBulletinData {
  departmentCode: string; // "01", "75", "13", "69", "33", "59", "29", "06", "31", "67", "974", "WORLD-NYC", "WORLD-TOK", etc.
  departmentName: string;
  regionName: string;
  country: string;
  isFrenchTerritory: boolean;
  climateType: string;
  generatedAt: string;
  executiveSynoptic7DaySummary: string;
  microclimate: DepartmentMicroclimateDiagnostic;
  bioclimaticIndices: BioclimaticAndActivityIndices;
  sevenDays: DepartmentDayForecast[];
}





