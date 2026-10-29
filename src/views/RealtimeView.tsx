import React, { useState, useEffect } from 'react';
import { 
  Droplets, 
  Wind, 
  Sun, 
  Gauge, 
  CloudRain, 
  Activity, 
  Clock, 
  Calendar, 
  Thermometer,
  ThermometerSnowflake, 
  Flame, 
  Info, 
  ShieldAlert, 
  Mountain, 
  Search, 
  ChevronRight, 
  ChevronDown,
  ChevronUp,
  Sparkles, 
  Radar, 
  TrendingUp, 
  Navigation, 
  SlidersHorizontal,
  CheckCircle2, 
  Split, 
  Globe, 
  FileText, 
  Smartphone, 
  Monitor,
  Maximize2, 
  Minimize2, 
  ExternalLink, 
  QrCode, 
  Download, 
  AlertTriangle, 
  Compass, 
  Eye, 
  Layers,
  Sprout,
  Plane,
  Tv,
  MapPin,
  Moon,
  Play,
  Map,
  Zap,
  RotateCcw,
  Radio,
  Plus
} from 'lucide-react';
import { LocationPoint, CurrentWeather, HourlyForecast, DailyForecast, ClimateAnomaly } from '../types/weather';
import { getClientGeographicBackdrop, fetchCityRealPhoto } from '../utils/geoBackdrops';
import { calculateSolarEphemeris } from '../services/ephemerisService';
import { getRichWeatherInfo } from '../utils/weatherIcons';
import { DynamicSkyHeroArt } from '../components/DynamicSkyHeroArt';
import { FloatingWeatherBubble } from '../components/FloatingWeatherBubble';
import { UnifiedHourly48hTrend } from '../components/UnifiedHourly48hTrend';
import { WeatherGauge } from '../components/WeatherGauge';
import { AnomalyBadge } from '../components/AnomalyBadge';
import { AltitudeMeteorologyCard } from '../components/AltitudeMeteorologyCard';
import { OutdoorIndicesCard } from '../components/OutdoorIndicesCard';
import { PollenRealtimeTrackerCard } from '../components/PollenRealtimeTrackerCard';
import { DeepWeatherConditionsCard } from '../components/DeepWeatherConditionsCard';
import { RadarProximityTrackerCard } from '../components/RadarProximityTrackerCard';
import { ThunderstormConvectiveDetailsCard } from '../components/ThunderstormConvectiveDetailsCard';
import { DailyDetailedAnalyzerModal } from '../components/DailyDetailedAnalyzerModal';
import { Past24HoursAnalysisCard } from '../components/Past24HoursAnalysisCard';
import { ShortTermMultiModelEnsembleCard } from '../components/ShortTermMultiModelEnsembleCard';
import { GrandDayAndWeekDetailedForecastCard } from '../components/GrandDayAndWeekDetailedForecastCard';
import { ThermalTiersGuideCard } from '../components/ThermalTiersGuideCard';
import { GigaPrecipitationNowcastingCard } from '../components/GigaPrecipitationNowcastingCard';
import { CertifiedPrecisionMeteoHub } from '../components/CertifiedPrecisionMeteoHub';
import { FrostAndColdObservatoryCard } from '../components/FrostAndColdObservatoryCard';
import { CloudNephologyObservatoryCard } from '../components/CloudNephologyObservatoryCard';
import { DayWeatherOverviewCard } from '../components/DayWeatherOverviewCard';
import { DesktopWeatherHeroDashboard } from '../components/DesktopWeatherHeroDashboard';
import { TemperatureReliabilityCalibrationCard } from '../components/TemperatureReliabilityCalibrationCard';
import { ImouWeatherSecurityBanner } from '../components/ImouWeatherSecurityBanner';
import { AgricultureWeatherCard } from '../components/AgricultureWeatherCard';
import { AviationWeatherCard } from '../components/AviationWeatherCard';
import { ProfessionalMeteoCard } from '../components/ProfessionalMeteoCard';
import { LiveMeteoFranceVigilanceCard } from '../components/LiveMeteoFranceVigilanceCard';
import { MeteoFrancePluieEtNormalesWidget } from '../components/MeteoFrancePluieEtNormalesWidget';
import { RemarkableWeatherHighlightCard } from '../components/RemarkableWeatherHighlightCard';
import { CertifiedLiveSiteStatsCard } from '../components/CertifiedLiveSiteStatsCard';
import { calculatePhysicalIsotherm0 } from '../utils/isothermCalculations';
import { FranceMiniOverviewCard } from '../components/FranceMiniOverviewCard';
import { WeatherContradictionModal } from '../components/WeatherContradictionModal';
import { IntenseRegenerationBanner } from '../components/IntenseRegenerationBanner';
import { FavoriteCitiesBar } from '../components/FavoriteCitiesBar';
import { TodayVsYesterdayCard } from '../components/TodayVsYesterdayCard';
import { MorningAudioBriefingCard } from '../components/MorningAudioBriefingCard';
import { ShareableWeatherCardModal } from '../components/ShareableWeatherCardModal';
import { AuroraNightSkyCard } from '../components/AuroraNightSkyCard';
import { isBlockVisible } from '../services/displayPreferencesService';

interface RealtimeViewProps {
  station: LocationPoint;
  weather: CurrentWeather;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  anomaly: ClimateAnomaly;
  seniorMode: boolean;
  simplifiedMode?: boolean;
  onToggleSimplifiedMode?: () => void;
  tempUnit: 'C' | 'F';
  onSelectStation?: (station: LocationPoint) => void;
  onOpenSearchModal?: () => void;
  onOpenGigaRadar?: () => void;
  onNavigateTab?: (tab: string) => void;
  onLocateGps?: () => void;
  onOpenInstallModal?: () => void;
  onToggleFullscreen?: () => void;
  isFullscreen?: boolean;
  onRecalibrate?: (offset: number) => void;
  onResetRecalibration?: () => void;
  showFloatingBubble?: boolean;
  onToggleFloatingBubble?: () => void;
  onWeatherRectified?: () => void;
  isUsingCachedData?: boolean;
  cachedAt?: string;
}

export const RealtimeView: React.FC<RealtimeViewProps> = ({
  station,
  weather,
  hourly,
  daily,
  anomaly,
  seniorMode,
  simplifiedMode = false,
  onToggleSimplifiedMode,
  tempUnit,
  onSelectStation,
  onOpenSearchModal,
  onOpenGigaRadar,
  onNavigateTab,
  onLocateGps,
  onOpenInstallModal,
  onToggleFullscreen,
  isFullscreen,
  onRecalibrate,
  onResetRecalibration,
  showFloatingBubble: propShowFloatingBubble,
  onToggleFloatingBubble,
  onWeatherRectified,
  isUsingCachedData = false,
  cachedAt,
}) => {
  const [isContradictionModalOpen, setIsContradictionModalOpen] = useState<boolean>(false);
  const [activeProfileTab, setActiveProfileTab] = useState<'classic' | 'agriculture' | 'aviation' | 'pro'>('classic');
  const [localShowBubble, setLocalShowBubble] = useState<boolean>(true);
  const isBubbleActive = propShowFloatingBubble !== undefined ? propShowFloatingBubble : localShowBubble;
  const toggleBubble = onToggleFloatingBubble || (() => setLocalShowBubble(!localShowBubble));
  const [isDailyAnalyzerOpen, setIsDailyAnalyzerOpen] = useState<boolean>(false);
  const [selectedDayIndexForAnalyzer, setSelectedDayIndexForAnalyzer] = useState<number>(0);
  const [isShareCardModalOpen, setIsShareCardModalOpen] = useState<boolean>(false);
  const [activeWinterModule, setActiveWinterModule] = useState<'NONE' | 'CLOUD' | 'SNOW' | 'FROST' | 'ALTITUDE'>('CLOUD');
  const initialGeoBackdrop = getClientGeographicBackdrop(
    station.name,
    station.region,
    station.department,
    station.altitude
  );
  const [cityPhotoUrl, setCityPhotoUrl] = useState<string>(initialGeoBackdrop);

  useEffect(() => {
    let isMounted = true;
    const initialBg = getClientGeographicBackdrop(
      station.name,
      station.region,
      station.department,
      station.altitude
    );
    setCityPhotoUrl(initialBg);

    // Résolution multi-source asynchrone (Wikipedia REST API + Wikimedia + backend)
    fetchCityRealPhoto(
      station.name,
      station.region,
      station.department,
      station.altitude
    ).then((resolvedPhoto) => {
      if (isMounted && resolvedPhoto) {
        setCityPhotoUrl(resolvedPhoto);
      }
    }).catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [station.name, station.region, station.department, station.altitude]);

  // Reinitialise sur profil classique dès que le mode simple est activé
  useEffect(() => {
    if (simplifiedMode && activeProfileTab !== 'classic') {
      setActiveProfileTab('classic');
    }
  }, [simplifiedMode, activeProfileTab]);

  // Actualisation réactive des blocs masqués / affichés selon les préférences + horloge astronomique
  const [displayTick, setDisplayTick] = useState(0);
  useEffect(() => {
    const handlePreferencesUpdate = () => {
      setDisplayTick((t) => t + 1);
    };
    window.addEventListener('instant_meteo_display_preferences_updated', handlePreferencesUpdate);
    const liveEphInterval = setInterval(() => setDisplayTick((t) => t + 1), 15000);
    return () => {
      window.removeEventListener('instant_meteo_display_preferences_updated', handlePreferencesUpdate);
      clearInterval(liveEphInterval);
    };
  }, []);

  const liveEphemeris = React.useMemo(() => {
    const now = new Date();
    const prevEph = weather.solarEphemeris;
    const todayDatePrefix = now.toISOString().split('T')[0];
    return calculateSolarEphemeris(station.latitude, station.longitude, now, {
      sunriseIso: prevEph?.sunrise ? `${todayDatePrefix}T${prevEph.sunrise}` : undefined,
      sunsetIso: prevEph?.sunset ? `${todayDatePrefix}T${prevEph.sunset}` : undefined,
    });
  }, [station.latitude, station.longitude, weather.solarEphemeris, displayTick]);

  const effectiveIsDay = liveEphemeris.isSunAboveHorizon ?? weather.isDay ?? true;
  const effectiveWeatherDesc = React.useMemo(() => {
    return getRichWeatherInfo(weather.weatherCode, effectiveIsDay).label;
  }, [weather.weatherCode, effectiveIsDay]);

  const formatTemp = (celsius: number) => {
    if (tempUnit === 'F') {
      return `${Math.round((celsius * 9/5 + 32) * 10) / 10}°F`;
    }
    return `${celsius > 0 ? `+${celsius}` : celsius}°C`;
  };

  const handleOpenDayAnalyzer = (index: number) => {
    setSelectedDayIndexForAnalyzer(index);
    setIsDailyAnalyzerOpen(true);
  };

  const todayInfoclimat = React.useMemo(() => {
    const now = new Date();
    const curH = now.getHours();
    const passed = (hourly || []).filter(h => {
      const hRaw = parseInt(h.hourLabel?.replace('h', '') || '0', 10);
      return isNaN(hRaw) ? true : hRaw <= curH;
    });
    const pts = passed.length > 0 ? passed : (hourly || []).slice(0, Math.max(1, curH + 1));

    let obsTmin = weather.temperature;
    let obsTminH = `${String(Math.min(7, curH)).padStart(2, '0')}h00`;
    if (pts.length > 0) {
      const minPt = pts.reduce((min, curr) => curr.temperature < min.temperature ? curr : min, pts[0]);
      obsTmin = minPt.temperature;
      obsTminH = minPt.hourLabel || `${String(Math.min(7, curH)).padStart(2, '0')}h00`;
    } else if (daily[0]?.tempMin !== undefined) {
      obsTmin = daily[0].tempMin;
      obsTminH = '06h45';
    }

    let obsTmax = weather.temperature;
    let obsTmaxH = curH >= 15 ? '15h30' : 'En cours';
    if (pts.length > 0) {
      const maxPt = pts.reduce((max, curr) => curr.temperature > max.temperature ? curr : max, pts[0]);
      obsTmax = Math.max(weather.temperature, maxPt.temperature);
      obsTmaxH = weather.temperature >= maxPt.temperature ? 'En cours' : (maxPt.hourLabel || '15h00');
    }

    const rain00h = Number(pts.reduce((acc, h) => acc + (h.rainMm || h.precipitationMm || 0), 0).toFixed(1));
    const daylight = Math.max(0, Math.min(12, curH - 7));
    const avgCloud = pts.length > 0 ? pts.reduce((acc, h) => acc + (h.cloudCover ?? 30), 0) / pts.length : 30;
    const sunMin = Math.round(daylight * 60 * Math.max(0, Math.min(1, (100 - avgCloud) / 100)));
    const sunH = Math.floor(sunMin / 60);
    const sunM = sunMin % 60;
    const sunLabel = sunH > 0 ? `${sunH}h${sunM.toString().padStart(2, '0')}` : `${sunM} min`;

    return {
      tmin: obsTmin,
      tminHour: obsTminH,
      tmax: obsTmax,
      tmaxHour: obsTmaxH,
      rainSum: rain00h,
      sunLabel
    };
  }, [hourly, weather.temperature, daily]);

  const isGpsPosition = station.id.startsWith('gps');

  return (
    <div className="space-y-5">
      {/* 0. BARRE DES VILLES FAVORITES (Accès en 1 clic avec météo temps réel - Mode Expert uniquement) */}
      {!simplifiedMode && (
        <FavoriteCitiesBar
          currentStation={station}
          currentWeather={weather}
          tempUnit={tempUnit}
          onSelectStation={(st) => onSelectStation && onSelectStation(st)}
          onOpenSearchModal={onOpenSearchModal}
        />
      )}

      {/* 4 Profils Météo Spécialisés : Chaîne Météo Classique, Agro-Météo, Aviation, Météo Pro (Masqués en Mode Simple) */}
      {!simplifiedMode && (
        <div className="w-full">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800/90 shadow-sm">
            <button
              id="realtime-tab-classic"
              onClick={() => setActiveProfileTab('classic')}
              className={`flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl text-left transition cursor-pointer min-w-0 ${
                activeProfileTab === 'classic'
                  ? 'bg-gradient-to-r from-blue-600 via-sky-600 to-blue-700 text-white shadow-lg shadow-blue-500/30 ring-1 ring-blue-300/60'
                  : 'bg-white dark:bg-slate-950/70 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-300 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 border border-slate-200 dark:border-blue-900/30 hover:border-blue-400 dark:hover:border-blue-700/60'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${
                  activeProfileTab === 'classic'
                    ? 'bg-white/20 border-white/30 text-white'
                    : 'bg-blue-50 dark:bg-blue-500/15 border-blue-200 dark:border-blue-500/30 text-blue-600 dark:text-blue-400'
                }`}>
                  <Tv className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-black tracking-tight truncate leading-tight">
                    Chaîne Météo (Classique)
                  </div>
                  <div className={`text-[10px] truncate leading-tight ${
                    activeProfileTab === 'classic' ? 'text-blue-100 font-medium' : 'text-slate-500 dark:text-slate-400'
                  }`}>
                    Vue générale &amp; prévisions
                  </div>
                </div>
              </div>
              <span className={`hidden sm:inline-block h-2 w-2 rounded-full shrink-0 ${
                activeProfileTab === 'classic' ? 'bg-white animate-pulse' : 'bg-slate-400 dark:bg-slate-700'
              }`} />
            </button>

            <button
              id="realtime-tab-agriculture"
              onClick={() => setActiveProfileTab('agriculture')}
              className={`flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl text-left transition cursor-pointer min-w-0 ${
                activeProfileTab === 'agriculture'
                  ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-green-700 text-white shadow-lg shadow-emerald-500/30 ring-1 ring-emerald-300/60'
                  : 'bg-white dark:bg-slate-950/70 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-300 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 border border-slate-200 dark:border-emerald-900/30 hover:border-emerald-400 dark:hover:border-emerald-700/60'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${
                  activeProfileTab === 'agriculture'
                    ? 'bg-white/20 border-white/30 text-white'
                    : 'bg-emerald-50 dark:bg-emerald-500/15 border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                }`}>
                  <Sprout className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-black tracking-tight truncate leading-tight">
                    Agro-Météo
                  </div>
                  <div className={`text-[10px] truncate leading-tight ${
                    activeProfileTab === 'agriculture' ? 'text-emerald-100 font-medium' : 'text-slate-500 dark:text-slate-400'
                  }`}>
                    Sols, ET0, gelées &amp; ΔT
                  </div>
                </div>
              </div>
              <span className={`hidden sm:inline-block h-2 w-2 rounded-full shrink-0 ${
                activeProfileTab === 'agriculture' ? 'bg-white animate-pulse' : 'bg-slate-400 dark:bg-slate-700'
              }`} />
            </button>

            <button
              id="realtime-tab-aviation"
              onClick={() => setActiveProfileTab('aviation')}
              className={`flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl text-left transition cursor-pointer min-w-0 ${
                activeProfileTab === 'aviation'
                  ? 'bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-700 text-white shadow-lg shadow-cyan-500/30 ring-1 ring-cyan-300/60'
                  : 'bg-white dark:bg-slate-950/70 text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-300 hover:bg-cyan-50/50 dark:hover:bg-cyan-950/30 border border-slate-200 dark:border-cyan-900/30 hover:border-cyan-400 dark:hover:border-cyan-700/60'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${
                  activeProfileTab === 'aviation'
                    ? 'bg-white/20 border-white/30 text-white'
                    : 'bg-sky-50 dark:bg-sky-500/15 border-sky-200 dark:border-sky-500/30 text-sky-600 dark:text-sky-400'
                }`}>
                  <Plane className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-black tracking-tight truncate leading-tight">
                    Météo Aviation
                  </div>
                  <div className={`text-[10px] truncate leading-tight ${
                    activeProfileTab === 'aviation' ? 'text-sky-100 font-medium' : 'text-slate-500 dark:text-slate-400'
                  }`}>
                    METAR, VFR/IFR &amp; vent piste
                  </div>
                </div>
              </div>
              <span className={`hidden sm:inline-block h-2 w-2 rounded-full shrink-0 ${
                activeProfileTab === 'aviation' ? 'bg-white animate-pulse' : 'bg-slate-400 dark:bg-slate-700'
              }`} />
            </button>

            <button
              id="realtime-tab-pro"
              onClick={() => setActiveProfileTab('pro')}
              className={`flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl text-left transition cursor-pointer min-w-0 ${
                activeProfileTab === 'pro'
                  ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-700 text-white shadow-lg shadow-purple-500/30 ring-1 ring-purple-300/60'
                  : 'bg-white dark:bg-slate-950/70 text-slate-700 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-300 hover:bg-purple-50/50 dark:hover:bg-purple-950/30 border border-slate-200 dark:border-purple-900/30 hover:border-purple-400 dark:hover:border-purple-700/60'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${
                  activeProfileTab === 'pro'
                    ? 'bg-white/20 border-white/30 text-white'
                    : 'bg-indigo-50 dark:bg-indigo-500/15 border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400'
                }`}>
                  <Activity className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-black tracking-tight truncate leading-tight">
                    Météo Pro &amp; Modèles
                  </div>
                  <div className={`text-[10px] truncate leading-tight ${
                    activeProfileTab === 'pro' ? 'text-indigo-100 font-medium' : 'text-slate-400'
                  }`}>
                    SYNOP, radiosondages &amp; CAPE
                  </div>
                </div>
              </div>
              <span className={`hidden sm:inline-block h-2 w-2 rounded-full shrink-0 ${
                activeProfileTab === 'pro' ? 'bg-white animate-pulse' : 'bg-slate-400 dark:bg-slate-700'
              }`} />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 0. BANNIÈRE DE RÉGÉNÉRATION HAUTE INTENSITÉ (Si contradiction active)     */}
      {/* ========================================================================= */}
      <IntenseRegenerationBanner
        station={station}
        tempUnit={tempUnit}
        onOpenContradictionModal={() => setIsContradictionModalOpen(true)}
        onStateChanged={() => {
          if (onWeatherRectified) onWeatherRectified();
        }}
      />

      {/* ========================================================================= */}
      {/* BANDEAU VEDETTE : DIRECT MÉTÉO & SURVEILLANCE ATMOSPHÉRIQUE               */}
      {/* ========================================================================= */}
      <div className="w-full rounded-2xl border border-sky-400/30 dark:border-sky-500/30 bg-gradient-to-r from-sky-500/10 via-indigo-500/10 to-purple-500/10 dark:from-slate-900/95 dark:via-sky-950/40 dark:to-slate-900/95 p-3 sm:p-3.5 shadow-lg backdrop-blur-md flex flex-wrap items-center justify-between gap-3 transition-all">
        <div className="flex items-center gap-2.5 flex-wrap min-w-0">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-400/40 text-emerald-700 dark:text-emerald-300 text-xs font-black shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Flux Météo en Direct</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs font-mono tabular-nums flex-wrap">
            <span className="text-cyan-700 dark:text-cyan-300 font-bold flex items-center gap-1" title="Vitesse et rafales">
              <Wind className="h-3.5 w-3.5 text-cyan-500" />
              <span>Vent : <strong className="font-black text-slate-900 dark:text-white">{Math.round(weather.windSpeed)} km/h</strong></span>
              <span className="text-amber-600 dark:text-amber-400 text-[11px] font-semibold">(raf. {Math.round(weather.windGust || weather.windSpeed * 1.35)} km/h)</span>
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-sky-700 dark:text-sky-300 font-bold flex items-center gap-1" title="Isotherme 0°C calculé">
              <ThermometerSnowflake className="h-3.5 w-3.5 text-sky-500" />
              <span>Iso 0°C : <strong className="font-black text-slate-900 dark:text-white">{calculatePhysicalIsotherm0({ stationAltitude: station.altitude ?? 80, temperature: weather.temperature, precipitationMm: 0 })} m</strong></span>
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-amber-700 dark:text-amber-300 font-bold flex items-center gap-1" title="Indice UV maximal">
              <Sun className="h-3.5 w-3.5 text-amber-500" />
              <span>UV : <strong className="font-black text-slate-900 dark:text-white">{weather.uvIndex ?? 3}</strong></span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => document.getElementById('remarkable-weather-highlight-card')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 transition active:scale-95 cursor-pointer"
            title="Consulter les coups de vent, rafales et limites pluie-neige"
          >
            <Sparkles className="h-3.5 w-3.5 text-slate-950" />
            <span>Indicateurs Remarquables (Vent &amp; Neige)</span>
          </button>
          <button
            onClick={() => onNavigateTab ? onNavigateTab('radar') : (onOpenGigaRadar ? onOpenGigaRadar() : null)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white text-xs font-black shadow-md shadow-cyan-500/20 transition active:scale-95 cursor-pointer"
          >
            <CloudRain className="h-3.5 w-3.5 text-cyan-200" />
            <span>Radar des Pluies HD</span>
          </button>
          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('auraAI')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 hover:from-purple-700 hover:to-sky-700 text-white text-xs font-black shadow-md shadow-purple-500/20 transition active:scale-95 cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-pulse" />
              <span>IA AURA</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MOBILE EXCLUSIVE HERO & FORECAST (Hyper-Attractif & 100% Complet)         */}
      {/* ========================================================================= */}
      <div className="block sm:hidden space-y-3.5 mb-4">
        {/* 1. Scenic Hero Weather Card with Luminous Glassmorphism */}
        <div className="scenic-hero-card motion-card-enter relative overflow-hidden rounded-3xl border border-sky-500/35 shadow-[0_20px_50px_rgba(2,132,199,0.22)] text-white bg-slate-950">
          {/* Top Luminous Accent Strip */}
          <div className="absolute top-0 inset-x-0 h-1 z-20 bg-gradient-to-r from-sky-400 via-cyan-300 to-indigo-500" />
          {/* Photographic Background Asset */}
          <img 
            src={cityPhotoUrl}
            alt={`Météo à ${station.name}`}
            referrerPolicy="no-referrer"
            onError={() => {
              const fallback = getClientGeographicBackdrop(
                station.name,
                station.region,
                station.department,
                station.altitude
              );
              if (cityPhotoUrl !== fallback) {
                setCityPhotoUrl(fallback);
              }
            }}
            className={`absolute inset-0 w-full h-full object-cover object-center motion-ken-burns transition-all duration-700 filter ${
              effectiveIsDay
                ? 'brightness-[0.88] contrast-[1.08]'
                : 'brightness-[0.65] contrast-[1.15] saturate-[0.9]'
            }`}
          />
          {/* Subtle Atmospheric Gradient Overlay for contrast and readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050b16] via-[#071022]/65 to-slate-950/25" />

          {/* Card Content */}
          <div className="relative z-10 p-4 pt-4 space-y-3.5">
            {/* Top Station & Reference Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="px-2 py-0.5 rounded-full bg-sky-500/25 border border-sky-400/40 text-[9px] font-black uppercase tracking-wider text-sky-200 backdrop-blur-md">
                    {station.isMountain || (station.altitude && station.altitude >= 700)
                      ? `🏔️ Village & Station • ${station.altitude}m`
                      : 'Station Météo de Référence'}
                  </span>
                </div>
                <h2
                  onClick={onOpenSearchModal}
                  className="text-2xl font-black text-white tracking-tight leading-none drop-shadow-md truncate cursor-pointer flex items-center gap-1.5"
                >
                  <span className="truncate">{station.name}</span>
                </h2>
                <div
                  onClick={onOpenSearchModal}
                  className="flex items-center gap-1 text-[11px] text-slate-200 drop-shadow-sm cursor-pointer"
                >
                  <MapPin className="h-3 w-3 text-sky-400 shrink-0" />
                  <span className="truncate">{station.department || '75 - Paris'}</span>
                  <span>•</span>
                  <span className="font-bold text-sky-300">Alt. {station.altitude || 75} m</span>
                  <ChevronDown className="h-3 w-3 text-sky-300" />
                </div>
              </div>

              {/* Top Right Action Pills */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={toggleBubble}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-bold transition active:scale-95 cursor-pointer backdrop-blur-md ${
                    isBubbleActive 
                      ? 'bg-sky-500 text-slate-950 border-sky-300 shadow-sm' 
                      : 'bg-slate-950/60 border-white/20 text-slate-200 hover:text-white'
                  }`}
                  title="Afficher / Masquer la bulle météo flottante"
                >
                  <Plus className="h-3 w-3" />
                  <span>Bulle</span>
                </button>

                {onOpenSearchModal && (
                  <button
                    onClick={onOpenSearchModal}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-sky-500/80 to-blue-600/80 hover:from-sky-400 hover:to-blue-500 border border-sky-300/50 text-[10px] font-black text-white transition active:scale-95 cursor-pointer backdrop-blur-md shadow-sm"
                  >
                    <Search className="h-3 w-3 text-white" />
                    <span>Localité</span>
                  </button>
                )}
              </div>
            </div>

            {/* Tags row: Climat & Min/Max du jour + Pression */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-950/80 border border-slate-700/80 backdrop-blur-md text-[10px] font-bold text-slate-200 shadow-sm">
                <span>🌱</span>
                <span>Climat {station.climateZone || 'Océanique dégradé'}</span>
              </span>
              {daily[0] && (
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-950/80 border border-sky-500/35 backdrop-blur-md text-[10px] font-black text-white shadow-sm">
                  <span className="text-sky-300">Min {formatTemp(daily[0].tempMin)}</span>
                  <span className="text-slate-500">/</span>
                  <span className="text-amber-300">Max {formatTemp(daily[0].tempMax)}</span>
                </span>
              )}
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-950/80 border border-indigo-500/35 backdrop-blur-md text-[10px] font-bold text-indigo-200 shadow-sm">
                <Gauge className="h-3 w-3 text-indigo-400" />
                <span>{weather.pressure} hPa</span>
              </span>
            </div>

            {/* Center: Massive Temperature + Live Badge & Dynamic Sky Artwork */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <div>
                <div className="text-6xl font-black tracking-tighter text-white drop-shadow-[0_6px_24px_rgba(0,0,0,0.65)] leading-none tabular-nums">
                  {formatTemp(weather.temperature)}
                </div>
                <p className="text-xs font-extrabold text-sky-100 mt-1.5 max-w-[210px] leading-snug drop-shadow-sm">
                  {effectiveWeatherDesc}
                </p>
              </div>

              <div className="flex flex-col items-end gap-1.5 shrink-0">
                {isUsingCachedData ? (
                  <div
                    className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-950/85 border border-amber-500/40 text-amber-300 text-[10px] font-bold tracking-wide shadow-sm"
                    title="Connexion interrompue : affichage de la dernière météo enregistrée en cache"
                  >
                    <span className="inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
                    <span>Données en cache{cachedAt ? ` (${cachedAt})` : ''}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-950/90 border border-emerald-500/40 text-emerald-300 text-[10px] font-black tracking-wide shadow-sm">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span>{effectiveIsDay ? 'En direct · Jour' : 'En direct · Nuit'}</span>
                  </div>
                )}

                <DynamicSkyHeroArt 
                  weatherCode={weather.weatherCode} 
                  isDay={effectiveIsDay} 
                  size="sm" 
                />
              </div>
            </div>

            {/* Translucent Glass 6-Metric Strip (2 rows of 3 or 4+2 for complete mobile telemetry at a glance) */}
            <div className="rounded-2xl bg-slate-950/85 border border-white/15 backdrop-blur-xl p-2.5 grid grid-cols-4 divide-x divide-slate-800/90 text-center shadow-xl">
              {/* 1. Ressenti */}
              <div className="flex flex-col items-center px-1">
                <div className="flex items-center gap-1 text-[10px] text-cyan-300 font-bold mb-0.5">
                  <ThermometerSnowflake className="h-3 w-3 text-cyan-400" />
                  <span>Ressenti</span>
                </div>
                <span className="text-xs font-black text-white tabular-nums">{formatTemp(weather.feelsLike)}</span>
              </div>

              {/* 2. Humidité */}
              <div className="flex flex-col items-center px-1">
                <div className="flex items-center gap-1 text-[10px] text-blue-300 font-bold mb-0.5">
                  <Droplets className="h-3 w-3 text-blue-400" />
                  <span>Humidité</span>
                </div>
                <span className="text-xs font-black text-white tabular-nums">{weather.humidity}%</span>
              </div>

              {/* 3. Vent */}
              <div className="flex flex-col items-center px-1">
                <div className="flex items-center gap-1 text-[10px] text-teal-300 font-bold mb-0.5">
                  <Wind className="h-3 w-3 text-teal-400" />
                  <span>Vent</span>
                </div>
                <span className="text-xs font-black text-white tabular-nums">
                  {Math.round(weather.windSpeed)} <span className="text-[9px] text-slate-300 font-bold">km/h</span>
                </span>
              </div>

              {/* 4. UV & Air */}
              <div className="flex flex-col items-center px-1">
                <div className="flex items-center gap-1 text-[10px] text-amber-300 font-bold mb-0.5">
                  <Sun className="h-3 w-3 text-amber-400" />
                  <span>UV / Air</span>
                </div>
                <span className="text-xs font-black text-white tabular-nums">
                  {weather.uvIndex ?? 0} <span className="text-[9px] text-emerald-300 font-bold">• IQA {weather.airQualityAqi}</span>
                </span>
              </div>
            </div>

            {/* Indicateur Remarquable Mobile: Rafales & Alerte Neige/Vent */}
            <div 
              onClick={() => document.getElementById('remarkable-weather-highlight-card')?.scrollIntoView({ behavior: 'smooth' })}
              className="rounded-2xl bg-slate-950/90 border border-amber-500/30 p-2.5 text-[11px] font-mono flex flex-wrap items-center justify-between gap-1.5 cursor-pointer shadow-md active:scale-[0.99] transition"
            >
              <div className="flex items-center gap-1.5 font-sans font-bold text-white text-[10px]">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
                <span>Indicateurs Remarquables :</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap text-[11px]">
                <span className="text-amber-300 font-bold">💨 Rafales {weather.windGust ?? Math.round((weather.windSpeed ?? 15) * 1.35)} km/h</span>
                <span className="text-slate-500">·</span>
                <span className="text-sky-300 font-bold">❄️ Isotherme 0°C {calculatePhysicalIsotherm0({ stationAltitude: station.altitude ?? 80, temperature: weather.temperature, precipitationMm: 0 })}m</span>
              </div>
            </div>

            {/* Bottom 2 Action Buttons (GPS & Voir sur la carte) */}
            <div className="grid grid-cols-2 gap-2 pt-0.5">
              {onLocateGps && (
                <button
                  onClick={onLocateGps}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-gradient-to-r from-emerald-950/90 to-teal-950/90 border border-emerald-400/50 text-emerald-200 font-black text-xs shadow-lg active:scale-95 transition cursor-pointer"
                >
                  <Navigation className="h-3.5 w-3.5 fill-emerald-300/30 text-emerald-300" />
                  <span>Ma position GPS</span>
                </button>
              )}
              <button
                onClick={() => onNavigateTab ? onNavigateTab('radar') : (onOpenGigaRadar ? onOpenGigaRadar() : null)}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-gradient-to-r from-sky-950/90 to-blue-950/90 border border-sky-400/50 text-sky-100 font-black text-xs shadow-lg active:scale-95 transition hover:text-white cursor-pointer"
              >
                <Map className="h-3.5 w-3.5 text-sky-400" />
                <span>Voir sur la carte</span>
              </button>
            </div>

            {/* Bouton de signalement d'observation de terrain */}
            <button
              onClick={() => setIsContradictionModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-200 font-bold text-xs shadow-sm transition active:scale-95 cursor-pointer"
              title="Signaler un écart entre la météo affichée et le temps réel observé dehors"
            >
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              <span>Ajuster le direct (Observation de terrain)</span>
            </button>
          </div>
        </div>

        {/* 2. Aperçu Vigilance Officielle Météo-France */}
        <LiveMeteoFranceVigilanceCard
          station={station}
          onClick={() => onNavigateTab ? onNavigateTab('vigilance') : null}
        />

        {/* Widget Pluie dans l'heure & Comparaison aux Normales de Saison (Météo-France) */}
        <MeteoFrancePluieEtNormalesWidget
          station={station}
          weather={weather}
          hourly={hourly}
          tempUnit={tempUnit}
          onRefresh={onLocateGps}
        />
      </div>

      {/* 1. Hero Current Weather, Map & Detailed Hourly/Daily/Curve Forecast + Soleil & Lune (Desktop Full-Page Grid) */}
      <DesktopWeatherHeroDashboard
        station={station}
        weather={weather}
        hourly={hourly}
        daily={daily}
        anomaly={anomaly}
        tempUnit={tempUnit}
        seniorMode={seniorMode}
        simplifiedMode={simplifiedMode}
        isUsingCachedData={isUsingCachedData}
        cachedAt={cachedAt}
        onSelectStation={onSelectStation}
        onOpenSearchModal={onOpenSearchModal}
        onOpenGigaRadar={onOpenGigaRadar}
        onNavigateTab={onNavigateTab}
        onLocateGps={onLocateGps}
        onOpenContradictionModal={() => setIsContradictionModalOpen(true)}
        onOpenDayAnalyzer={handleOpenDayAnalyzer}
        onRecalibrate={onRecalibrate}
        onResetRecalibration={onResetRecalibration}
      />

      {/* ========================================================================= */}
      {/* 2. CONTENU DU PROFIL SÉLECTIONNÉ (CLASSIQUE / AGRICULTURE / AVIATION / PRO) */}
      {/* ========================================================================= */}

      {/* PROFIL 1 : CHAÎNE MÉTÉO (CLASSIQUE - CLARTÉ & EN UN COUP D'ŒIL) */}
      {activeProfileTab === 'classic' && (
        <div className="space-y-6">
          {/* Mobile only: Prévisions Détaillées de la Journée (24h) & Semaine (7 Jours) (already in Row 2 on Desktop) */}
          <div className="sm:hidden w-full scroll-mt-28 min-w-0">
            <GrandDayAndWeekDetailedForecastCard
              station={station}
              weather={weather}
              hourly={hourly}
              daily={daily}
              seniorMode={seniorMode}
              simplifiedMode={simplifiedMode}
              tempUnit={tempUnit}
              onOpenDayAnalyzer={handleOpenDayAnalyzer}
            />
          </div>

          {/* Bannière d'état Mode Simple / Mode Expert */}
          {simplifiedMode ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-500/30 text-xs shadow-sm">
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 font-black text-sm shrink-0 border border-emerald-500/30">
                  ⚡
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-white text-xs sm:text-sm">Mode Simple Actif (Essentiel Épuré)</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">Léger &amp; Rapide</span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Les 4 blocs avancés (<strong>Bulletin Audio de {station.name}</strong>, <strong>Aujourd'hui vs Hier</strong>, <strong>Aurores Boréales</strong> et <strong>Indices Plein Air</strong>) sont exclusifs au <strong>Mode Expert</strong>.
                  </p>
                </div>
              </div>
              {onToggleSimplifiedMode && (
                <button
                  type="button"
                  onClick={onToggleSimplifiedMode}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xs shadow-md shadow-indigo-600/30 transition active:scale-95 shrink-0 cursor-pointer self-start sm:self-auto"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  <span>Activer le Mode Expert</span>
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-indigo-950/50 via-slate-900 to-purple-950/40 border border-indigo-500/40 text-xs shadow-sm">
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-300 font-black text-sm shrink-0 border border-indigo-400/30">
                  🔬
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-white text-xs sm:text-sm">Mode Expert Actif (Complet &amp; Approfondi)</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">4 Blocs Débloqués</span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Affichage complet : Bulletin Audio, Comparateur 24h, Suivi des Aurores Boréales et Confort Plein Air.
                  </p>
                </div>
              </div>
              {onToggleSimplifiedMode && (
                <button
                  type="button"
                  onClick={onToggleSimplifiedMode}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs border border-slate-700 transition active:scale-95 shrink-0 cursor-pointer self-start sm:self-auto"
                >
                  <span>Passer en Mode Simple</span>
                </button>
              )}
            </div>
          )}

          {/* CHAPITRE 1 : BRIEFING MATINAL AUDIO (SYNTHÈSE VOCALE) & COMPARATEUR AUJOURD'HUI VS HIER (Mode Expert uniquement) */}
          {!simplifiedMode && (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-[10px] font-black text-indigo-300 uppercase tracking-wider">
                    🔬 Mode Expert • Synthèse Vocale &amp; Évolution 24h
                  </span>
                  <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                    Bulletin Audio de {station.name} &amp; Aujourd'hui vs Hier
                  </h3>
                </div>
                <button
                  onClick={() => setIsShareCardModalOpen(true)}
                  className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 underline cursor-pointer hidden sm:inline"
                >
                  Générer une image météo à partager →
                </button>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-stretch">
                <div className="xl:col-span-6 flex [&>div]:flex-1">
                  <MorningAudioBriefingCard
                    station={station}
                    weather={weather}
                    daily={daily}
                    hourly={hourly}
                    tempUnit={tempUnit}
                    onOpenShareCard={() => setIsShareCardModalOpen(true)}
                  />
                </div>
                <div className="xl:col-span-6 flex [&>div]:flex-1">
                  <TodayVsYesterdayCard
                    station={station}
                    weather={weather}
                    tempUnit={tempUnit}
                  />
                </div>
              </div>
            </div>
          )}

          {/* CHAPITRE 2 : LES 7 JAUGES & INDICATEURS SYNOPTIQUES (Humidité, Vent, UV, AQI, Pression, Pluie, Pollen) */}
          <div id="realtime-indicators" className="scroll-mt-28 space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/20 border border-emerald-300 dark:border-emerald-500/35 text-[10px] font-black text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                  7 Capteurs Temps Réel • Santé &amp; Atmosphère
                </span>
                <h3 className={`font-black text-slate-900 dark:text-white ${seniorMode ? 'text-2xl' : 'text-sm sm:text-base'}`}>
                  Indicateurs Temps Réel, Qualité de l'Air &amp; Jauge Pollen
                </h3>
              </div>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hidden sm:inline">Relevé complet en direct</span>
            </div>

            {/* Grille Bento 2 colonnes sur mobile pour un rendu ultra-attractif et compact sans perdre aucune donnée */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-7 gap-2.5 sm:gap-3">
              <WeatherGauge
                title="Humidité Relative"
                value={weather.humidity}
                unit="%"
                subValue={weather.humidity > 70 ? "Humide" : weather.humidity < 40 ? "Air Sec" : "Confortable"}
                icon={Droplets}
                colorClass="text-blue-400"
                bgGradient="bg-blue-600/20"
                description="Teneur en vapeur d'eau de l'atmosphère. Une valeur entre 45% et 65% offre un confort respiratoire optimal."
                seniorMode={seniorMode}
              />

              <WeatherGauge
                title="Vitesse du Vent"
                value={weather.windSpeed}
                unit="km/h"
                subValue={`Rafales : ${weather.windGust} km/h • Dir : ${weather.windDirection}°`}
                icon={Wind}
                colorClass="text-teal-400"
                bgGradient="bg-teal-600/20"
                description="Vitesse moyenne mesurée à 10 mètres du sol avec analyse des rafales instantanées."
                seniorMode={seniorMode}
              />

              <WeatherGauge
                title="Indice UV (Rayonnement)"
                value={weather.uvIndex}
                unit="/ 12"
                subValue={weather.uvIndex >= 8 ? "Très Fort" : weather.uvIndex >= 6 ? "Élevé" : weather.uvIndex >= 3 ? "Modéré" : "Faible"}
                icon={Sun}
                colorClass="text-amber-400"
                bgGradient="bg-amber-600/20"
                description="Intensité des rayons ultraviolets corrigée de l'altitude (+10% / 1000m). Protection solaire conseillée."
                seniorMode={seniorMode}
              />

              <WeatherGauge
                title="Qualité de l'Air (AQI)"
                value={weather.airQualityAqi}
                unit="IQA"
                subValue={weather.airQualityLabel}
                icon={Activity}
                colorClass="text-emerald-400"
                bgGradient="bg-emerald-600/20"
                description="Indice européen de pureté de l'air (PM2.5, PM10, Ozone, NO2). Air pur sans risque respiratoire."
                seniorMode={seniorMode}
              />

              <WeatherGauge
                title="Pression Barométrique"
                value={weather.pressure}
                unit="hPa"
                subValue={weather.pressureMsl ? `QNH (mer) : ${weather.pressureMsl} hPa` : `Station : ${weather.pressure} hPa`}
                icon={Gauge}
                colorClass="text-indigo-400"
                bgGradient="bg-indigo-600/20"
                description={`Pression réelle QFE à ${station.altitude} m d'altitude. Tendance barométrique stable.`}
                seniorMode={seniorMode}
              />

              <WeatherGauge
                title="Précipitations Actuelles"
                value={weather.precipitation}
                unit="mm"
                subValue={weather.precipitation === 0 ? "Temps Sec" : `${weather.precipitation} mm/h`}
                icon={CloudRain}
                colorClass="text-cyan-400"
                bgGradient="bg-cyan-600/20"
                description="Quantité de pluie mesurée sur la dernière heure. Détection radar en temps réel."
                seniorMode={seniorMode}
              />

              {/* Jauge de Pollen de Rouge à Vert (Pleine largeur sur mobile 2-col pour une lisibilité parfaite) */}
              <div className="col-span-2 sm:col-span-2 md:col-span-3 xl:col-span-1 flex [&>div]:flex-1">
                <PollenRealtimeTrackerCard
                  weather={weather}
                  station={station}
                  seniorMode={seniorMode}
                />
              </div>
            </div>
          </div>

          {/* CHAPITRE 3 : AURORES BORÉALES, INDICES DE VIE & SÉCURITÉ (Mode Expert uniquement) */}
          {!simplifiedMode && (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-[10px] font-black text-indigo-300 uppercase tracking-wider">
                    🔬 Mode Expert • Ciel Nocturne &amp; Activités
                  </span>
                  <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                    Suivi des Aurores Boréales &amp; Indices d'Activités Plein Air
                  </h3>
                </div>
              </div>

              {/* Suivi des Aurores Boréales à GAUCHE & Indices Plein Air à DROITE */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
                <div className="lg:col-span-6 flex [&>div]:flex-1 [&>div]:w-full">
                  <AuroraNightSkyCard
                    station={station}
                    weather={weather}
                  />
                </div>
                <div className="lg:col-span-6 flex [&>div]:flex-1 [&>div]:w-full">
                  <OutdoorIndicesCard weather={weather} station={station} seniorMode={seniorMode} />
                </div>
              </div>

              {/* Sécurité Extérieure */}
              <ImouWeatherSecurityBanner
                weather={weather}
                station={station}
                seniorMode={seniorMode}
              />
            </div>
          )}

          {/* CHAPITRE 4 : PRÉCIPITATIONS CHIRURGICALES & NOWCASTING (< 3h & < 24h) */}
          <div id="realtime-precipitation" className="w-full scroll-mt-28 min-w-0 space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-500/20 border border-cyan-300 dark:border-cyan-500/35 text-[10px] font-black text-cyan-700 dark:text-cyan-300 uppercase tracking-wider">
                  Suivi Pluie Minute par Minute
                </span>
                <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                  Nowcasting Chirurgical des Précipitations (&lt; 3h &amp; 24h)
                </h3>
              </div>
            </div>
            <GigaPrecipitationNowcastingCard
              weather={weather}
              station={station}
              hourly={hourly}
              daily={daily}
              seniorMode={seniorMode}
            />
          </div>
        </div>
      )}

      {/* PROFIL 2 : AGRO-MÉTÉO (PULVÉRISATION ΔT, SOLS 4 PROFONDEURS, ET0, GELÉES, GDD) */}
      {activeProfileTab === 'agriculture' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-3.5 items-start">
          <div className="xl:col-span-6 min-w-0">
            <AgricultureWeatherCard
              station={station}
              weather={weather}
              hourly={hourly}
              daily={daily}
              seniorMode={seniorMode}
              tempUnit={tempUnit}
            />
          </div>

          <div className="xl:col-span-6 scroll-mt-28 min-w-0">
            <GrandDayAndWeekDetailedForecastCard
              station={station}
              weather={weather}
              hourly={hourly}
              daily={daily}
              seniorMode={seniorMode}
              simplifiedMode={simplifiedMode}
              tempUnit={tempUnit}
              onOpenDayAnalyzer={handleOpenDayAnalyzer}
            />
          </div>
        </div>
      )}

      {/* PROFIL 3 : MÉTÉO AVIATION (METAR/TAF, VFR/IFR, VENT DE TRAVERS PISTE, ALTITUDE-DENSITÉ) */}
      {activeProfileTab === 'aviation' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-3.5 items-start">
          <div className="xl:col-span-6 min-w-0">
            <AviationWeatherCard
              station={station}
              weather={weather}
              hourly={hourly}
              daily={daily}
              seniorMode={seniorMode}
              tempUnit={tempUnit}
            />
          </div>

          <div id="realtime-precipitation-aviation" className="xl:col-span-6 scroll-mt-28 min-w-0">
            <GigaPrecipitationNowcastingCard
              weather={weather}
              station={station}
              hourly={hourly}
              daily={daily}
              seniorMode={seniorMode}
            />
          </div>
        </div>
      )}

      {/* PROFIL 4 : MÉTÉO PROFESSIONNELLE (THERMODYNAMIQUE CAPE/CIN/LI, CISAILLEMENT, TW STULL, MULTI-MODÈLES) */}
      {activeProfileTab === 'pro' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-3.5 items-start">
          <div className="xl:col-span-6 min-w-0">
            <ProfessionalMeteoCard
              station={station}
              weather={weather}
              hourly={hourly}
              daily={daily}
              seniorMode={seniorMode}
              tempUnit={tempUnit}
            />
          </div>

          <div className="xl:col-span-6 space-y-3.5 min-w-0">
            <div id="realtime-certified-precision-pro" className="scroll-mt-28">
              <CertifiedPrecisionMeteoHub
                weather={weather}
                station={station}
                seniorMode={seniorMode}
                tempUnit={tempUnit}
              />
            </div>

            <div id="realtime-deep-conditions-pro" className="scroll-mt-28">
              <DeepWeatherConditionsCard
                weather={weather}
                station={station}
                seniorMode={seniorMode}
                tempUnit={tempUnit}
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. HUBS DE NAVIGATION RAPIDE & INSTALLATION CÔTE À CÔTE SUR UNE LIGNE      */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-2 items-center pt-1">
        <div id="realtime-more-forecast" className="xl:col-span-7 grid grid-cols-2 lg:grid-cols-4 gap-2 scroll-mt-28">
          <button
            onClick={() => onNavigateTab && onNavigateTab('vigilance')}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-rose-300 dark:border-rose-500/30 bg-white dark:bg-slate-900/90 hover:border-rose-400 transition text-left group shadow-sm cursor-pointer min-w-0"
          >
            <div className="rounded-lg bg-rose-50 dark:bg-rose-500/15 p-1.5 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30 group-hover:bg-rose-600 group-hover:text-white transition shrink-0">
              <ShieldAlert className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-black text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 truncate leading-tight">Vigilances &amp; Alertes</h4>
              <p className="text-[9px] text-slate-500 dark:text-slate-400 truncate leading-tight">Matrice des 12 risques</p>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab && onNavigateTab('thirtyDays')}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-blue-300 dark:border-blue-500/30 bg-white dark:bg-slate-900/90 hover:border-blue-400 transition text-left group shadow-sm cursor-pointer min-w-0"
          >
            <div className="rounded-lg bg-blue-50 dark:bg-blue-500/15 p-1.5 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 group-hover:bg-blue-600 group-hover:text-white transition shrink-0">
              <Calendar className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate leading-tight">Prévisions 30 Jours</h4>
              <p className="text-[9px] text-slate-500 dark:text-slate-400 truncate leading-tight">Calendrier jour par jour</p>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab && onNavigateTab('eightMonths')}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-indigo-300 dark:border-indigo-500/30 bg-white dark:bg-slate-900/90 hover:border-indigo-400 transition text-left group shadow-sm cursor-pointer min-w-0"
          >
            <div className="rounded-lg bg-indigo-50 dark:bg-indigo-500/15 p-1.5 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 group-hover:bg-indigo-600 group-hover:text-white transition shrink-0">
              <Globe className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate leading-tight">Tendances 8 Mois</h4>
              <p className="text-[9px] text-slate-500 dark:text-slate-400 truncate leading-tight">24 Décades • 240 Jours</p>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab && onNavigateTab('radar')}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-cyan-300 dark:border-cyan-500/30 bg-white dark:bg-slate-900/90 hover:border-cyan-400 transition text-left group shadow-sm cursor-pointer min-w-0"
          >
            <div className="rounded-lg bg-cyan-50 dark:bg-cyan-500/15 p-1.5 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/30 group-hover:bg-cyan-600 group-hover:text-white transition shrink-0">
              <Radar className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-black text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 truncate leading-tight">Giga Radar de Pluie</h4>
              <p className="text-[9px] text-slate-500 dark:text-slate-400 truncate leading-tight">ARAMIS &amp; Satellite HD</p>
            </div>
          </button>
        </div>

        {/* Quick Action & Install Banner (Desktop only so mobile never shows a duplicate install bar) */}
        <div id="realtime-download" className="hidden sm:flex xl:col-span-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 px-2.5 py-1.5 items-center justify-between gap-2 shadow-sm scroll-mt-28">
          <div className="flex items-center gap-2 min-w-0">
            <img src="/icon-192.png" alt="Logo Instant Météo" className="h-7 w-7 rounded-lg border border-blue-500/30 object-cover shrink-0" />
            <div className="min-w-0">
              <span className="text-xs font-black text-slate-900 dark:text-white block truncate leading-tight">App Instant Météo</span>
              <span className="text-[9px] text-slate-500 dark:text-slate-400 block truncate leading-tight">Application PWA</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
            <a
              href="/Instant-Meteo-Windows.cmd"
              download="Instant-Meteo-Windows.cmd"
              title="Télécharger le lanceur autonome pour Windows"
              className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] transition shadow-sm active:scale-95 cursor-pointer"
            >
              <Download className="h-3 w-3" />
              <span>Windows</span>
            </a>

            <button
              type="button"
              onClick={async () => {
                const promptEvt = (window as any).__deferredPwaPrompt;
                if (promptEvt) {
                  try {
                    await promptEvt.prompt();
                    return;
                  } catch {}
                }
                window.dispatchEvent(new CustomEvent('instant_meteo_show_add_to_apps_prompt'));
              }}
              title="Installer l'application en PWA"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition shadow-sm active:scale-95 cursor-pointer"
            >
              <img src="/icon-32.png" alt="Logo" className="h-3.5 w-3.5 rounded-sm object-cover" />
              <span>Installer en PWA</span>
            </button>

            {onToggleFullscreen && (
              <button
                onClick={onToggleFullscreen}
                title="Activer ou quitter le mode grand écran (F11)"
                className={`flex items-center gap-1 px-2 py-1 rounded-lg font-bold text-[11px] border transition cursor-pointer ${
                  isFullscreen
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                    : 'bg-slate-800/80 border-slate-700/60 text-slate-300 hover:text-white'
                }`}
              >
                {isFullscreen ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. BLOC FIABILITÉ THERMOMÉTRIQUE & CONTRÔLE STATISTIQUE (SIMPLE & EXPERT) */}
      {/* ========================================================================= */}
      <div id="realtime-thermometric-reliability" className="w-full scroll-mt-28 pt-1">
        <TemperatureReliabilityCalibrationCard
          station={station}
          currentWeather={weather}
          tempUnit={tempUnit}
          onRecalibrate={onRecalibrate}
          onReset={onResetRecalibration}
        />
      </div>

      {/* 4-BIS. FRÉQUENTATION & STATISTIQUES CERTIFIÉES EN TEMPS RÉEL */}
      <div id="realtime-certified-live-stats" className="w-full scroll-mt-28 pt-2">
        <CertifiedLiveSiteStatsCard seniorMode={seniorMode} />
      </div>

      {/* 5. BLOC INDICATEURS REMARQUABLES & ALERTES PHÉNOMÈNES (TOUT EN BAS DE LA PAGE) */}
      <div id="realtime-remarkable-weather-bottom" className="w-full scroll-mt-28 pt-2">
        <RemarkableWeatherHighlightCard
          station={station}
          weather={weather}
          hourly={hourly}
          daily={daily}
          tempUnit={tempUnit}
          onSelectStation={onSelectStation}
          onNavigateTab={onNavigateTab}
        />
      </div>

      {/* 7-Day Day-by-Day Analyzer Modal */}
      <DailyDetailedAnalyzerModal
        isOpen={isDailyAnalyzerOpen}
        onClose={() => setIsDailyAnalyzerOpen(false)}
        dailyList={daily}
        hourlyList={hourly}
        station={station}
        seniorMode={seniorMode}
        tempUnit={tempUnit}
        initialDayIndex={selectedDayIndexForAnalyzer}
      />

      {/* Weather Contradiction & Intense Regeneration Modal */}
      <WeatherContradictionModal
        isOpen={isContradictionModalOpen}
        onClose={() => setIsContradictionModalOpen(false)}
        station={station}
        currentWeather={weather}
        tempUnit={tempUnit}
        onRegenerationStarted={() => {
          if (onWeatherRectified) onWeatherRectified();
        }}
      />

      {/* Shareable Weather Card Generator Modal */}
      <ShareableWeatherCardModal
        isOpen={isShareCardModalOpen}
        onClose={() => setIsShareCardModalOpen(false)}
        station={station}
        weather={weather}
        daily={daily}
        tempUnit={tempUnit}
      />
    </div>
  );
};
