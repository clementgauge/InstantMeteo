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
import { DynamicSkyHeroArt } from '../components/DynamicSkyHeroArt';
import { FloatingWeatherBubble } from '../components/FloatingWeatherBubble';
import { UnifiedHourly48hTrend } from '../components/UnifiedHourly48hTrend';
import { WeatherGauge } from '../components/WeatherGauge';
import { AnomalyBadge } from '../components/AnomalyBadge';
import { AltitudeMeteorologyCard } from '../components/AltitudeMeteorologyCard';
import { EphemerisCard } from '../components/EphemerisCard';
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
  const [publicChapterFilter, setPublicChapterFilter] = useState<'ALL' | 'ESSENTIAL' | 'INDICATORS' | 'SKY_AURORA' | 'RAIN_RADAR'>('ALL');
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

  // Actualisation réactive des blocs masqués / affichés selon les préférences
  const [, setDisplayTick] = useState(0);
  useEffect(() => {
    const handlePreferencesUpdate = () => {
      setDisplayTick((t) => t + 1);
    };
    window.addEventListener('instant_meteo_display_preferences_updated', handlePreferencesUpdate);
    return () => window.removeEventListener('instant_meteo_display_preferences_updated', handlePreferencesUpdate);
  }, []);

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

  const isGpsPosition = station.id.startsWith('gps');

  return (
    <div className="space-y-5">
      {/* ========================================================================= */}
      {/* BLOC MAÎTRE UNIFIÉ AVEC LE HEADER : BARRES DE NAVIGATION + HÉRO & CARTE   */}
      {/* ========================================================================= */}
      <div className="rounded-b-2xl border border-t-0 border-slate-800/90 bg-[#08101f]/95 p-3 sm:p-4 shadow-2xl space-y-3">
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
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 p-1 rounded-xl bg-slate-950/65 border border-slate-800/80">
            <button
              id="realtime-tab-classic"
              onClick={() => setActiveProfileTab('classic')}
              className={`flex items-center justify-between gap-2.5 px-3 py-2 rounded-lg text-left transition cursor-pointer min-w-0 ${
                activeProfileTab === 'classic'
                  ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-400/50'
                  : 'bg-slate-950/50 text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent hover:border-slate-700/70'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border ${
                  activeProfileTab === 'classic'
                    ? 'bg-white/15 border-white/25 text-white'
                    : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                }`}>
                  <Tv className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-black tracking-tight truncate leading-tight">
                    Chaîne Météo (Classique)
                  </div>
                  <div className={`text-[10px] truncate leading-tight ${
                    activeProfileTab === 'classic' ? 'text-blue-100 font-medium' : 'text-slate-400'
                  }`}>
                    Vue générale &amp; prévisions
                  </div>
                </div>
              </div>
              <span className={`hidden sm:inline-block h-1.5 w-1.5 rounded-full shrink-0 ${
                activeProfileTab === 'classic' ? 'bg-white' : 'bg-slate-700'
              }`} />
            </button>

            <button
              id="realtime-tab-agriculture"
              onClick={() => setActiveProfileTab('agriculture')}
              className={`flex items-center justify-between gap-2.5 px-3 py-2 rounded-lg text-left transition cursor-pointer min-w-0 ${
                activeProfileTab === 'agriculture'
                  ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400/50'
                  : 'bg-slate-950/50 text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent hover:border-slate-700/70'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border ${
                  activeProfileTab === 'agriculture'
                    ? 'bg-white/15 border-white/25 text-white'
                    : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                }`}>
                  <Sprout className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-black tracking-tight truncate leading-tight">
                    Agro-Météo
                  </div>
                  <div className={`text-[10px] truncate leading-tight ${
                    activeProfileTab === 'agriculture' ? 'text-emerald-100 font-medium' : 'text-slate-400'
                  }`}>
                    Sols, ET0, gelées &amp; ΔT
                  </div>
                </div>
              </div>
              <span className={`hidden sm:inline-block h-1.5 w-1.5 rounded-full shrink-0 ${
                activeProfileTab === 'agriculture' ? 'bg-white' : 'bg-slate-700'
              }`} />
            </button>

            <button
              id="realtime-tab-aviation"
              onClick={() => setActiveProfileTab('aviation')}
              className={`flex items-center justify-between gap-2.5 px-3 py-2 rounded-lg text-left transition cursor-pointer min-w-0 ${
                activeProfileTab === 'aviation'
                  ? 'bg-sky-600 text-white shadow-sm ring-1 ring-sky-400/50'
                  : 'bg-slate-950/50 text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent hover:border-slate-700/70'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border ${
                  activeProfileTab === 'aviation'
                    ? 'bg-white/15 border-white/25 text-white'
                    : 'bg-sky-500/10 border-sky-500/20 text-sky-400'
                }`}>
                  <Plane className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-black tracking-tight truncate leading-tight">
                    Météo Aviation
                  </div>
                  <div className={`text-[10px] truncate leading-tight ${
                    activeProfileTab === 'aviation' ? 'text-sky-100 font-medium' : 'text-slate-400'
                  }`}>
                    METAR, VFR/IFR &amp; vent piste
                  </div>
                </div>
              </div>
              <span className={`hidden sm:inline-block h-1.5 w-1.5 rounded-full shrink-0 ${
                activeProfileTab === 'aviation' ? 'bg-white' : 'bg-slate-700'
              }`} />
            </button>

            <button
              id="realtime-tab-pro"
              onClick={() => setActiveProfileTab('pro')}
              className={`flex items-center justify-between gap-2.5 px-3 py-2 rounded-lg text-left transition cursor-pointer min-w-0 ${
                activeProfileTab === 'pro'
                  ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400/50'
                  : 'bg-slate-950/50 text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent hover:border-slate-700/70'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border ${
                  activeProfileTab === 'pro'
                    ? 'bg-white/15 border-white/25 text-white'
                    : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
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
                    CAPE, cisaillement &amp; AROME
                  </div>
                </div>
              </div>
              <span className={`hidden sm:inline-block h-1.5 w-1.5 rounded-full shrink-0 ${
                activeProfileTab === 'pro' ? 'bg-white' : 'bg-slate-700'
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
      {/* MOBILE EXCLUSIVE HERO CARD (Intégré dans le bloc complet avec le Header)  */}
      {/* ========================================================================= */}
      <div className="block sm:hidden">
        {/* 1. Scenic Hero Weather Card with Parisian / Park Landscape */}
        <div className="scenic-hero-card relative overflow-hidden rounded-xl border border-slate-700/60 shadow-xl text-white bg-slate-950">
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
            className="absolute inset-0 w-full h-full object-cover object-center transition-all duration-700 filter brightness-[0.85] contrast-[1.05]"
          />
          {/* Subtle Atmospheric Gradient Overlay for contrast and readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/30" />

          {/* Card Content */}
          <div className="relative z-10 p-4 pt-4 space-y-3.5">
            {/* Top Station & Reference Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-300 drop-shadow-sm block">
                  Station Météo de Référence
                </span>
                <h2 className="text-2xl font-black text-white tracking-tight leading-none drop-shadow-md">
                  {station.name}
                </h2>
                <div className="flex items-center gap-1 text-[11px] text-slate-300 drop-shadow-sm">
                  <MapPin className="h-3 w-3 text-sky-400 shrink-0" />
                  <span>{station.department || '75 - Paris'}</span>
                  <span>•</span>
                  <span>Altitude : {station.altitude || 75} m</span>
                  <ChevronDown className="h-3 w-3 text-slate-400" />
                </div>
              </div>

              {/* Top Right Action Pills - Allégés pour laisser la primauté à la météo */}
              <div className="flex items-center gap-1 shrink-0">
                {/* Mobile & Desktop Floating Weather Bubble Toggle */}
                <button
                  onClick={toggleBubble}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-medium transition active:scale-95 cursor-pointer backdrop-blur-sm ${
                    isBubbleActive 
                      ? 'bg-sky-500/80 text-white border-sky-400' 
                      : 'bg-black/35 border-white/15 text-slate-300 hover:text-white'
                  }`}
                  title="Afficher / Masquer la bulle météo flottante (détachable sur l'écran d'accueil)"
                >
                  <Plus className="h-3 w-3" />
                  <span>Bulle</span>
                </button>

                {/* Top Right "Changer de station" pill */}
                {onOpenSearchModal && (
                  <button
                    onClick={onOpenSearchModal}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/35 hover:bg-black/55 border border-white/15 text-[10px] font-medium text-slate-300 hover:text-white transition active:scale-95 cursor-pointer backdrop-blur-sm"
                  >
                    <Search className="h-3 w-3 text-sky-400" />
                    <span>Changer</span>
                  </button>
                )}
              </div>
            </div>

            {/* Tags row: Climat & ICU */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-950/75 border border-slate-700/70 backdrop-blur-md text-[10px] font-semibold text-slate-200 shadow-sm">
                <span>🌱</span>
                <span>Climat {station.climateZone || 'Océanique dégradé'}</span>
              </span>
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-950/75 border border-slate-700/70 backdrop-blur-md text-[10px] font-semibold text-slate-200 shadow-sm">
                <span>🏢</span>
                <span>Îlot de chaleur urbain</span>
              </span>
            </div>

            {/* Center: Massive Temperature + Live Badge & Dynamic Sky Artwork */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <div>
                <div className="text-5xl font-black tracking-tighter text-white drop-shadow-lg leading-none">
                  {formatTemp(weather.temperature)}
                </div>
                <p className="text-xs font-medium text-slate-200 mt-1.5 max-w-[200px] leading-snug drop-shadow-sm">
                  {weather.weatherDescription || 'Ciel principalement clair avec quelques cirrus / voiles'}
                </p>
              </div>

              <div className="flex flex-col items-end gap-1 shrink-0">
                {/* En Direct / Données en cache Badge */}
                {isUsingCachedData ? (
                  <div
                    className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-950/85 border border-amber-500/40 text-amber-300 text-[10px] font-bold tracking-wide shadow-sm"
                    title="Connexion interrompue : affichage de la dernière météo enregistrée en cache"
                  >
                    <span className="inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
                    <span>Données en cache{cachedAt ? ` (${cachedAt})` : ''}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-950/85 border border-slate-700 text-emerald-400 text-[10px] font-black tracking-wide shadow-sm">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span>En direct</span>
                  </div>
                )}

                {/* Dynamic Sky Artwork (Sun, Cloud+Sun, Rain, etc.) */}
                <DynamicSkyHeroArt 
                  weatherCode={weather.weatherCode} 
                  isDay={weather.isDay ?? true} 
                  size="sm" 
                />
              </div>
            </div>

            {/* Translucent Glass 4-Metric Strip */}
            <div className="rounded-2xl bg-slate-950/85 border border-slate-800/80 backdrop-blur-md p-2.5 grid grid-cols-4 divide-x divide-slate-800/90 text-center shadow-lg">
              {/* 1. Ressenti */}
              <div className="flex flex-col items-center px-1">
                <div className="flex items-center gap-1 text-[10px] text-cyan-400 font-bold mb-0.5">
                  <ThermometerSnowflake className="h-3 w-3 text-cyan-400" />
                  <span>Ressenti</span>
                </div>
                <span className="text-xs font-black text-white">{formatTemp(weather.feelsLike)}</span>
              </div>

              {/* 2. Humidité */}
              <div className="flex flex-col items-center px-1">
                <div className="flex items-center gap-1 text-[10px] text-blue-400 font-bold mb-0.5">
                  <Droplets className="h-3 w-3 text-blue-400" />
                  <span>Humidité</span>
                </div>
                <span className="text-xs font-black text-white">{weather.humidity}%</span>
              </div>

              {/* 3. Vent */}
              <div className="flex flex-col items-center px-1">
                <div className="flex items-center gap-1 text-[10px] text-sky-400 font-bold mb-0.5">
                  <Wind className="h-3 w-3 text-sky-400" />
                  <span>Vent</span>
                </div>
                <span className="text-xs font-black text-white">
                  {Math.round(weather.windSpeed)} km/h <span className="text-[9px] text-slate-400 font-normal">{weather.windDirection !== undefined ? `${Math.round(weather.windDirection)}°` : 'SO'}</span>
                </span>
              </div>

              {/* 4. UV */}
              <div className="flex flex-col items-center px-1">
                <div className="flex items-center gap-1 text-[10px] text-amber-400 font-bold mb-0.5">
                  <Sun className="h-3 w-3 text-amber-400" />
                  <span>UV</span>
                </div>
                <span className="text-xs font-black text-white">
                  {weather.uvIndex || 5} <span className="text-[9px] text-slate-400 font-normal">{weather.uvIndex && weather.uvIndex >= 6 ? 'Élevé' : 'Modéré'}</span>
                </span>
              </div>
            </div>

            {/* Bottom 2 Action Buttons (GPS & Voir sur la carte) */}
            <div className="grid grid-cols-2 gap-2 pt-0.5">
              {onLocateGps && (
                <button
                  onClick={onLocateGps}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 font-bold text-xs shadow-lg active:scale-95 transition cursor-pointer"
                >
                  <Navigation className="h-3.5 w-3.5 fill-emerald-300/30 text-emerald-300" />
                  <span>Ma position GPS</span>
                </button>
              )}
              <button
                onClick={() => onNavigateTab ? onNavigateTab('radar') : (onOpenGigaRadar ? onOpenGigaRadar() : null)}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-slate-200 font-bold text-xs shadow-lg active:scale-95 transition hover:text-white cursor-pointer"
              >
                <Map className="h-3.5 w-3.5 text-sky-400" />
                <span>Voir sur la carte</span>
              </button>
            </div>

            {/* Bouton de signalement d'observation de terrain */}
            <button
              onClick={() => setIsContradictionModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 font-bold text-xs shadow-sm transition active:scale-95 cursor-pointer"
              title="Signaler un écart entre la météo affichée et le temps réel observé dehors"
            >
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              <span>Ajuster le direct (Observation de terrain)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1a. Desktop Row 1: Hero Current Weather & Live France Map (Intégré dans le bloc complet avec le Header) */}
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
        sectionMode="hero-only"
      />
      </div>

      {/* Suite des cartes Mobile (Vigilance, Pluie dans l'heure, Tendance 48h) */}
      <div className="block sm:hidden space-y-3.5 mb-4">
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

        {/* 3. Unique & Ultra-Clair Fil de Tendance Heure par Heure 48h (Remplaçant l'ancien doublon) */}
        <UnifiedHourly48hTrend
          station={station}
          currentWeather={weather}
          hourly={hourly}
          tempUnit={tempUnit}
          onNavigateTab={onNavigateTab}
        />
      </div>

      {/* 1b. Desktop Row 2: Detailed Hourly/Daily/Curve Forecast + Soleil & Lune */}
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
        sectionMode="forecast-only"
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

          {/* BARRE DE NAVIGATION CLAIRE TOUT PUBLIC & CHAPITRE 1 (Mode Expert uniquement) */}
          {!simplifiedMode && (
            <>
              <div className="p-3 sm:p-4 rounded-2xl bg-slate-900/95 border border-slate-800/90 shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-black text-white flex items-center gap-2">
                      <span>Parcours Guidé &amp; Organisation Tout Public</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Mode Expert Complet
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Affichez l'intégralité du tableau de bord ou filtrez par rubrique thématique en un clic
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
                  {[
                    { id: 'ALL', label: '✨ Tout Afficher (Complet)' },
                    { id: 'ESSENTIAL', label: '🎙️ Briefing & Hier vs Auj.' },
                    { id: 'INDICATORS', label: '🌡️ Indicateurs & Pollen' },
                    { id: 'SKY_AURORA', label: '🌌 Soleil, Lune & Aurores' },
                    { id: 'RAIN_RADAR', label: '🌧️ Pluie & Nowcasting' }
                  ].map((ch) => (
                    <button
                      key={ch.id}
                      onClick={() => setPublicChapterFilter(ch.id as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                        publicChapterFilter === ch.id
                          ? 'bg-sky-500 text-slate-950 font-black shadow-sm'
                          : 'bg-slate-950/70 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
                      }`}
                    >
                      {ch.label}
                    </button>
                  ))}
                  <button
                    onClick={() => setIsShareCardModalOpen(true)}
                    className="px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white shadow-sm transition cursor-pointer flex items-center gap-1.5"
                  >
                    <span>📸 Carte Partageable</span>
                  </button>
                </div>
              </div>

              {/* CHAPITRE 1 : BRIEFING MATINAL AUDIO (SYNTHÈSE VOCALE) & COMPARATEUR AUJOURD'HUI VS HIER */}
              {(publicChapterFilter === 'ALL' || publicChapterFilter === 'ESSENTIAL') && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-sky-500/20 border border-sky-500/30 text-[10px] font-black text-sky-300 uppercase tracking-wider">
                        Étape 1 • Synthèse &amp; Évolution 24h
                      </span>
                      <h3 className="text-sm sm:text-base font-black text-white">
                        Bulletin Audio Intelligent &amp; Comparateur Aujourd'hui vs Hier
                      </h3>
                    </div>
                    <button
                      onClick={() => setIsShareCardModalOpen(true)}
                      className="text-xs font-bold text-sky-400 hover:text-sky-300 underline cursor-pointer hidden sm:inline"
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
            </>
          )}

          {/* CHAPITRE 2 : LES 7 JAUGES & INDICATEURS SYNOPTIQUES (Humidité, Vent, UV, AQI, Pression, Pluie, Pollen) */}
          {(simplifiedMode || publicChapterFilter === 'ALL' || publicChapterFilter === 'INDICATORS') && (
            <div id="realtime-indicators" className="scroll-mt-28 space-y-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  {!simplifiedMode && (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/30 text-[10px] font-black text-emerald-300 uppercase tracking-wider">
                      Étape 2 • Santé, Air &amp; Atmosphère
                    </span>
                  )}
                  <h3 className={`font-black text-white ${seniorMode ? 'text-2xl' : 'text-sm sm:text-base'}`}>
                    Indicateurs Temps Réel, Qualité de l'Air &amp; Jauge Pollen
                  </h3>
                </div>
                <span className="text-xs text-slate-400">Relevé mis à jour en direct</span>
              </div>

              <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 ${simplifiedMode ? 'xl:grid-cols-6' : 'xl:grid-cols-7'} gap-3`}>
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

                {!simplifiedMode && (
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
                )}

                {/* Jauge de Pollen de Rouge à Vert uniquement */}
                <PollenRealtimeTrackerCard
                  weather={weather}
                  station={station}
                  seniorMode={seniorMode}
                />
              </div>
            </div>
          )}

          {/* CHAPITRE 3 : ASTRONOMIE VÉRIFIÉE, AURORES BORÉALES & VIE QUOTIDIENNE */}
          {(simplifiedMode || publicChapterFilter === 'ALL' || publicChapterFilter === 'SKY_AURORA' || publicChapterFilter === 'INDICATORS') && (
            <div className="space-y-4">
              {!simplifiedMode && (
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-purple-500/20 border border-purple-500/30 text-[10px] font-black text-purple-300 uppercase tracking-wider">
                      Étape 3 • Astronomie, Aurores Boréales &amp; Plein Air
                    </span>
                    <h3 className="text-sm sm:text-base font-black text-white">
                      Éphéméride Solaire &amp; Lunaire Vérifiée, Aurores Boréales (Kp) &amp; Indices Quotidiens
                    </h3>
                  </div>
                </div>
              )}

              {/* Row 5A: Éphéméride + Indices Plein Air + Sécurité Extérieure IMOU côte à côte */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-3.5 items-stretch">
                <div className={simplifiedMode ? 'xl:col-span-6 flex [&>div]:flex-1' : 'xl:col-span-4 flex [&>div]:flex-1'}>
                  <EphemerisCard weather={weather} seniorMode={seniorMode} />
                </div>
                <div className={simplifiedMode ? 'xl:col-span-6 flex [&>div]:flex-1' : 'xl:col-span-5 flex [&>div]:flex-1'}>
                  <OutdoorIndicesCard weather={weather} station={station} seniorMode={seniorMode} />
                </div>
                {!simplifiedMode && (
                  <div className="xl:col-span-3 flex [&>div]:flex-1">
                    <ImouWeatherSecurityBanner
                      weather={weather}
                      station={station}
                      seniorMode={seniorMode}
                    />
                  </div>
                )}
              </div>

              {/* Row 5B: Observatoire des Aurores Boréales & Ciel Nocturne (Mode Expert uniquement) */}
              {!simplifiedMode && (
                <AuroraNightSkyCard
                  station={station}
                  weather={weather}
                />
              )}
            </div>
          )}

          {/* CHAPITRE 4 : PRÉCIPITATIONS CHIRURGICALES & NOWCASTING (< 3h & < 24h) */}
          {(simplifiedMode || publicChapterFilter === 'ALL' || publicChapterFilter === 'RAIN_RADAR') && (
            <div id="realtime-precipitation" className="w-full scroll-mt-28 min-w-0 space-y-2.5">
              {!simplifiedMode && (
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 border border-cyan-500/30 text-[10px] font-black text-cyan-300 uppercase tracking-wider">
                      Étape 4 • Suivi Pluie Minute par Minute
                    </span>
                    <h3 className="text-sm sm:text-base font-black text-white">
                      Nowcasting Chirurgical des Précipitations (&lt; 3h &amp; 24h)
                    </h3>
                  </div>
                </div>
              )}
              <GigaPrecipitationNowcastingCard
                weather={weather}
                station={station}
                hourly={hourly}
                daily={daily}
                seniorMode={seniorMode}
              />
            </div>
          )}

          {/* CHAPITRE 5 : PORTAIL DES 4 GRANDS UNIVERS TERRITORIAUX (Mode Expert uniquement) */}
          {!simplifiedMode && (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-[#0c1629] to-slate-900 border border-slate-800 shadow-xl space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-wider text-sky-400">
                    Exploration Thématique Approfondie • France &amp; Monde Entier
                  </div>
                  <h3 className="text-sm sm:text-base font-black text-white mt-0.5">
                    Observatoires Spécialisés pour {station.name} et toutes les localités du monde
                  </h3>
                </div>
                <span className="text-[11px] text-slate-400">
                  Cliquez sur un univers pour ouvrir l'analyse locale dédiée
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <button
                  onClick={() => onNavigateTab && onNavigateTab('mountain')}
                  className="p-3.5 rounded-xl bg-slate-950/80 hover:bg-sky-950/40 border border-sky-500/30 hover:border-sky-400 text-left transition group cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-sky-400 uppercase tracking-wider">🏔️ Montagne &amp; 8 Versants</span>
                    <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-sky-400 transition" />
                  </div>
                  <div className="text-xs font-bold text-white mt-1.5">
                    Analyse N, NE, E, SE, S, SW, W, NW
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                    Plaques à vent, bilan radiatif Ubac/Adret, coupe hypsométrique et recherche mondiale de stations.
                  </p>
                </button>

                <button
                  onClick={() => onNavigateTab && onNavigateTab('beaches')}
                  className="p-3.5 rounded-xl bg-slate-950/80 hover:bg-cyan-950/40 border border-cyan-500/30 hover:border-cyan-400 text-left transition group cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-cyan-400 uppercase tracking-wider">🏖️ Mer, Plages &amp; SHOM</span>
                    <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-cyan-400 transition" />
                  </div>
                  <div className="text-xs font-bold text-white mt-1.5">
                    Toutes Communes Littorales
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                    Température de l'eau, houle primaire vs clapot, marées SHOM et scores surf/voile/baignade.
                  </p>
                </button>

                <button
                  onClick={() => onNavigateTab && onNavigateTab('watercourses')}
                  className="p-3.5 rounded-xl bg-slate-950/80 hover:bg-blue-950/40 border border-blue-500/30 hover:border-blue-400 text-left transition group cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-blue-400 uppercase tracking-wider">💧 Cours d'Eau &amp; Crues</span>
                    <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-blue-400 transition" />
                  </div>
                  <div className="text-xs font-bold text-white mt-1.5">
                    Hub'Eau Local &amp; GloFAS 7j
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                    Rivières dans un rayon de 28 km autour de chaque commune, débits m³/s et seuils Vigicrues.
                  </p>
                </button>

                <button
                  onClick={() => onNavigateTab && onNavigateTab('droughtFire')}
                  className="p-3.5 rounded-xl bg-slate-950/80 hover:bg-amber-950/40 border border-amber-500/30 hover:border-amber-400 text-left transition group cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-amber-400 uppercase tracking-wider">🔥 Sécheresse &amp; Feux</span>
                    <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-amber-400 transition" />
                  </div>
                  <div className="text-xs font-bold text-white mt-1.5">
                    Sols 4 Profondeurs &amp; FWI
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                    Humidité des sols 0-27 cm, VPD, vitesse de propagation sur pente et restrictions VigiEau.
                  </p>
                </button>
              </div>
            </div>
          )}
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
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-rose-500/30 bg-slate-900/90 hover:border-rose-400 transition text-left group shadow-sm cursor-pointer min-w-0"
          >
            <div className="rounded-lg bg-rose-500/15 p-1.5 text-rose-400 border border-rose-500/30 group-hover:bg-rose-600 group-hover:text-white transition shrink-0">
              <ShieldAlert className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-black text-white group-hover:text-rose-400 truncate leading-tight">Vigilances &amp; Alertes</h4>
              <p className="text-[9px] text-slate-400 truncate leading-tight">Matrice des 12 risques</p>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab && onNavigateTab('thirtyDays')}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-blue-500/30 bg-slate-900/90 hover:border-blue-400 transition text-left group shadow-sm cursor-pointer min-w-0"
          >
            <div className="rounded-lg bg-blue-500/15 p-1.5 text-blue-400 border border-blue-500/30 group-hover:bg-blue-600 group-hover:text-white transition shrink-0">
              <Calendar className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-black text-white group-hover:text-blue-400 truncate leading-tight">Prévisions 30 Jours</h4>
              <p className="text-[9px] text-slate-400 truncate leading-tight">Calendrier jour par jour</p>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab && onNavigateTab('eightMonths')}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-indigo-500/30 bg-slate-900/90 hover:border-indigo-400 transition text-left group shadow-sm cursor-pointer min-w-0"
          >
            <div className="rounded-lg bg-indigo-500/15 p-1.5 text-indigo-400 border border-indigo-500/30 group-hover:bg-indigo-600 group-hover:text-white transition shrink-0">
              <Globe className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-black text-white group-hover:text-indigo-400 truncate leading-tight">Tendances 8 Mois</h4>
              <p className="text-[9px] text-slate-400 truncate leading-tight">24 Décades • 240 Jours</p>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab && onNavigateTab('radar')}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-cyan-500/30 bg-slate-900/90 hover:border-cyan-400 transition text-left group shadow-sm cursor-pointer min-w-0"
          >
            <div className="rounded-lg bg-cyan-500/15 p-1.5 text-cyan-400 border border-cyan-500/30 group-hover:bg-cyan-600 group-hover:text-white transition shrink-0">
              <Radar className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-black text-white group-hover:text-cyan-400 truncate leading-tight">Giga Radar de Pluie</h4>
              <p className="text-[9px] text-slate-400 truncate leading-tight">ARAMIS &amp; Satellite HD</p>
            </div>
          </button>
        </div>

        {/* Quick Action & Install Banner (Desktop only so mobile never shows a duplicate install bar) */}
        <div id="realtime-download" className="hidden sm:flex xl:col-span-5 rounded-xl border border-slate-800 bg-slate-900/90 px-2.5 py-1.5 items-center justify-between gap-2 shadow-sm scroll-mt-28">
          <div className="flex items-center gap-2 min-w-0">
            <img src="/icon-192.png" alt="Logo Instant Météo" className="h-7 w-7 rounded-lg border border-blue-500/30 object-cover shrink-0" />
            <div className="min-w-0">
              <span className="text-xs font-black text-white block truncate leading-tight">App Instant Météo</span>
              <span className="text-[9px] text-slate-400 block truncate leading-tight">Application PWA</span>
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
      {/* 4. BLOC FIABILITÉ THERMOMÉTRIQUE & CONTRÔLE STATISTIQUE (MODE EXPERT)     */}
      {/* ========================================================================= */}
      {!simplifiedMode && (
        <div id="realtime-thermometric-reliability" className="w-full scroll-mt-28 pt-1">
          <TemperatureReliabilityCalibrationCard
            station={station}
            currentWeather={weather}
            tempUnit={tempUnit}
            onRecalibrate={onRecalibrate}
            onReset={onResetRecalibration}
          />
        </div>
      )}

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
