import React, { useState, useEffect } from 'react';
import { 
  Droplets, 
  Wind, 
  Sun, 
  Gauge, 
  CloudRain, 
  Activity, 
  Calendar, 
  ThermometerSnowflake, 
  ShieldAlert, 
  Mountain, 
  Search, 
  ChevronRight, 
  Radar, 
  Navigation, 
  Globe, 
  Maximize2, 
  Minimize2, 
  Download, 
  Layers,
  Sprout,
  Plane,
  Tv,
  MapPin,
  Map,
  Zap,
  Plus,
  Waves,
  Flame,
  Share2
} from 'lucide-react';
import { LocationPoint, CurrentWeather, HourlyForecast, DailyForecast, ClimateAnomaly } from '../types/weather';
import { getClientGeographicBackdrop, fetchCityRealPhoto } from '../utils/geoBackdrops';
import { DynamicSkyHeroArt } from '../components/DynamicSkyHeroArt';
import { UnifiedHourly48hTrend } from '../components/UnifiedHourly48hTrend';
import { WeatherGauge } from '../components/WeatherGauge';
import { EphemerisCard } from '../components/EphemerisCard';
import { OutdoorIndicesCard } from '../components/OutdoorIndicesCard';
import { PollenRealtimeTrackerCard } from '../components/PollenRealtimeTrackerCard';
import { DeepWeatherConditionsCard } from '../components/DeepWeatherConditionsCard';
import { DailyDetailedAnalyzerModal } from '../components/DailyDetailedAnalyzerModal';
import { GrandDayAndWeekDetailedForecastCard } from '../components/GrandDayAndWeekDetailedForecastCard';
import { GigaPrecipitationNowcastingCard } from '../components/GigaPrecipitationNowcastingCard';
import { CertifiedPrecisionMeteoHub } from '../components/CertifiedPrecisionMeteoHub';
import { DesktopWeatherHeroDashboard } from '../components/DesktopWeatherHeroDashboard';
import { TemperatureReliabilityCalibrationCard } from '../components/TemperatureReliabilityCalibrationCard';
import { ImouWeatherSecurityBanner } from '../components/ImouWeatherSecurityBanner';
import { AgricultureWeatherCard } from '../components/AgricultureWeatherCard';
import { AviationWeatherCard } from '../components/AviationWeatherCard';
import { ProfessionalMeteoCard } from '../components/ProfessionalMeteoCard';
import { LiveMeteoFranceVigilanceCard } from '../components/LiveMeteoFranceVigilanceCard';
import { MeteoFrancePluieEtNormalesWidget } from '../components/MeteoFrancePluieEtNormalesWidget';
import { WeatherContradictionModal } from '../components/WeatherContradictionModal';
import { IntenseRegenerationBanner } from '../components/IntenseRegenerationBanner';
import { FavoriteCitiesBar } from '../components/FavoriteCitiesBar';
import { TodayVsYesterdayCard } from '../components/TodayVsYesterdayCard';
import { MorningAudioBriefingCard } from '../components/MorningAudioBriefingCard';
import { ShareableWeatherCardModal } from '../components/ShareableWeatherCardModal';
import { AuroraNightSkyCard } from '../components/AuroraNightSkyCard';

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

  useEffect(() => {
    if (simplifiedMode && activeProfileTab !== 'classic') {
      setActiveProfileTab('classic');
    }
  }, [simplifiedMode, activeProfileTab]);

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

  return (
    <div className="space-y-5">
      {/* ========================================================================= */}
      {/* BARRE D'EXPÉRIENCE ÉDITORIALE (Desktop uniquement - pas de doublon mobile) */}
      {/* ========================================================================= */}
      <div className="hidden sm:flex px-4 py-3 rounded-xl bg-[#0a1220]/95 border border-slate-800/90 shadow-md flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 border ${
            simplifiedMode
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-sky-500/10 border-sky-500/30 text-sky-400'
          }`}>
            {simplifiedMode ? <Sun className="h-4 w-4" /> : <Layers className="h-4 w-4" />}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-sm font-bold text-white flex-wrap">
              <span>{simplifiedMode ? 'Mode Lecture Rapide & Essentielle' : 'Mode Observatoire Développé & Expert'}</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-xs font-medium text-slate-400">
                {simplifiedMode ? 'Synthèse immédiate 7 jours' : 'Modèles AROME / ECMWF, 4 profils métiers & télémétrie'}
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate mt-0.5">
              {simplifiedMode
                ? 'Interface épurée centrée sur le temps réel, le radar de pluie et les prévisions horaires et hebdomadaires.'
                : 'Accès intégral aux analyses synoptiques, briefing vocal, comparateur 24h, aurores boréales et observatoires.'}
            </p>
          </div>
        </div>

        {onToggleSimplifiedMode && (
          <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-slate-950 border border-slate-800 shrink-0">
            <button
              type="button"
              onClick={() => {
                if (!simplifiedMode) onToggleSimplifiedMode();
              }}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer whitespace-nowrap shrink-0 ${
                simplifiedMode
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Lecture Rapide
            </button>
            <button
              type="button"
              onClick={() => {
                if (simplifiedMode) onToggleSimplifiedMode();
              }}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer whitespace-nowrap shrink-0 ${
                !simplifiedMode
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Profil Développé
            </button>
          </div>
        )}
      </div>

      {/* SYNTHÈSE DÉCISIONNELLE & ACCÈS RAPIDES (Mode Lecture Rapide) */}
      {simplifiedMode && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          <div className="lg:col-span-7 px-4 py-3 rounded-xl bg-[#0a1220]/95 border border-slate-800/90 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-emerald-400 tracking-wide whitespace-nowrap">
                Synthèse immédiate
              </span>
              <span aria-hidden="true" className="text-slate-700">|</span>
              <div className="text-xs text-slate-200 flex items-center gap-2 flex-wrap">
                <strong className="font-semibold text-white">
                  {(weather.precipitation || 0) > 0.2 ? 'Parapluie recommandé' : 'Aucune pluie immédiate'}
                </strong>
                <span aria-hidden="true" className="text-slate-500">·</span>
                <span>
                  {weather.feelsLike < 8
                    ? 'Manteau chaud conseillé'
                    : weather.feelsLike < 16
                      ? 'Veste ou pull léger'
                      : 'Tenue légère confortable'}
                </span>
              </div>
            </div>
            <span className="text-xs font-mono tabular-nums font-semibold text-sky-300">
              Max {daily[0] ? formatTemp(daily[0].tempMax) : formatTemp(weather.temperature)} · Min {daily[0] ? formatTemp(daily[0].tempMin) : formatTemp(weather.temperature - 4)}
            </span>
          </div>

          <div className="lg:col-span-5 grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => onNavigateTab && onNavigateTab('mountain')}
              className="px-3 py-2.5 rounded-xl bg-[#0a1220]/95 hover:bg-slate-900 border border-slate-800/90 hover:border-slate-700 text-left transition cursor-pointer flex items-center justify-between gap-2"
            >
              <div className="min-w-0">
                <div className="text-[11px] font-medium text-sky-400 truncate">Ski &amp; Neige</div>
                <div className="text-xs font-bold text-white truncate">Montagne</div>
              </div>
              <Mountain className="h-3.5 w-3.5 text-slate-500 shrink-0" />
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab && onNavigateTab('beaches')}
              className="px-3 py-2.5 rounded-xl bg-[#0a1220]/95 hover:bg-slate-900 border border-slate-800/90 hover:border-slate-700 text-left transition cursor-pointer flex items-center justify-between gap-2"
            >
              <div className="min-w-0">
                <div className="text-[11px] font-medium text-cyan-400 truncate">Mer &amp; Houle</div>
                <div className="text-xs font-bold text-white truncate">Plages</div>
              </div>
              <Waves className="h-3.5 w-3.5 text-slate-500 shrink-0" />
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab && onNavigateTab('radar')}
              className="px-3 py-2.5 rounded-xl bg-[#0a1220]/95 hover:bg-slate-900 border border-slate-800/90 hover:border-slate-700 text-left transition cursor-pointer flex items-center justify-between gap-2"
            >
              <div className="min-w-0">
                <div className="text-[11px] font-medium text-indigo-400 truncate">Carte Radar</div>
                <div className="text-xs font-bold text-white truncate">Pluie HD</div>
              </div>
              <Radar className="h-3.5 w-3.5 text-slate-500 shrink-0" />
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab && onNavigateTab('scenarios14d')}
              className="px-3 py-2.5 rounded-xl bg-[#0a1220]/95 hover:bg-slate-900 border border-slate-800/90 hover:border-slate-700 text-left transition cursor-pointer flex items-center justify-between gap-2"
            >
              <div className="min-w-0">
                <div className="text-[11px] font-medium text-emerald-400 truncate">Horizon 14j</div>
                <div className="text-xs font-bold text-white truncate">Tendances</div>
              </div>
              <Calendar className="h-3.5 w-3.5 text-slate-500 shrink-0" />
            </button>
          </div>
        </div>
      )}

      {/* BARRE DES VILLES FAVORITES (Mode Expert uniquement) */}
      {!simplifiedMode && (
        <FavoriteCitiesBar
          currentStation={station}
          currentWeather={weather}
          tempUnit={tempUnit}
          onSelectStation={(st) => onSelectStation && onSelectStation(st)}
          onOpenSearchModal={onOpenSearchModal}
        />
      )}

      {/* SÉLECTEUR DES 4 PROFILS MÉTIERS (Mode Expert uniquement) */}
      {!simplifiedMode && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 p-1.5 rounded-xl bg-[#0a1220]/95 border border-slate-800/90 shadow-md">
          <button
            id="realtime-tab-classic"
            type="button"
            onClick={() => setActiveProfileTab('classic')}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-left transition cursor-pointer min-w-0 ${
              activeProfileTab === 'classic'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Tv className={`h-4 w-4 shrink-0 ${activeProfileTab === 'classic' ? 'text-white' : 'text-sky-400'}`} />
            <div className="min-w-0">
              <div className="text-xs font-bold tracking-tight truncate">
                Chaîne Météo (Classique)
              </div>
              <div className={`text-[11px] truncate ${activeProfileTab === 'classic' ? 'text-sky-100' : 'text-slate-400'}`}>
                Vue générale &amp; prévisions
              </div>
            </div>
          </button>

          <button
            id="realtime-tab-agriculture"
            type="button"
            onClick={() => setActiveProfileTab('agriculture')}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-left transition cursor-pointer min-w-0 ${
              activeProfileTab === 'agriculture'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Sprout className={`h-4 w-4 shrink-0 ${activeProfileTab === 'agriculture' ? 'text-white' : 'text-emerald-400'}`} />
            <div className="min-w-0">
              <div className="text-xs font-bold tracking-tight truncate">
                Agro-Météo &amp; Sols
              </div>
              <div className={`text-[11px] truncate ${activeProfileTab === 'agriculture' ? 'text-emerald-100' : 'text-slate-400'}`}>
                ET0, gelées, humidité &amp; ΔT
              </div>
            </div>
          </button>

          <button
            id="realtime-tab-aviation"
            type="button"
            onClick={() => setActiveProfileTab('aviation')}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-left transition cursor-pointer min-w-0 ${
              activeProfileTab === 'aviation'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Plane className={`h-4 w-4 shrink-0 ${activeProfileTab === 'aviation' ? 'text-white' : 'text-blue-400'}`} />
            <div className="min-w-0">
              <div className="text-xs font-bold tracking-tight truncate">
                Météo Aéronautique
              </div>
              <div className={`text-[11px] truncate ${activeProfileTab === 'aviation' ? 'text-blue-100' : 'text-slate-400'}`}>
                METAR, VFR/IFR &amp; vent piste
              </div>
            </div>
          </button>

          <button
            id="realtime-tab-pro"
            type="button"
            onClick={() => setActiveProfileTab('pro')}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-left transition cursor-pointer min-w-0 ${
              activeProfileTab === 'pro'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Activity className={`h-4 w-4 shrink-0 ${activeProfileTab === 'pro' ? 'text-white' : 'text-indigo-400'}`} />
            <div className="min-w-0">
              <div className="text-xs font-bold tracking-tight truncate">
                Météo Pro &amp; Modèles
              </div>
              <div className={`text-[11px] truncate ${activeProfileTab === 'pro' ? 'text-indigo-100' : 'text-slate-400'}`}>
                CAPE, cisaillement &amp; AROME
              </div>
            </div>
          </button>
        </div>
      )}

      {/* BANNIÈRE DE RÉGÉNÉRATION HAUTE INTENSITÉ (Si contradiction active) */}
      <IntenseRegenerationBanner
        station={station}
        tempUnit={tempUnit}
        onOpenContradictionModal={() => setIsContradictionModalOpen(true)}
        onStateChanged={() => {
          if (onWeatherRectified) onWeatherRectified();
        }}
      />

      {/* ========================================================================= */}
      {/* MOBILE EXCLUSIVE HERO & FORECAST                                          */}
      {/* ========================================================================= */}
      <div className="block sm:hidden space-y-3.5 mb-4">
        <div className="scenic-hero-card relative overflow-hidden rounded-xl border border-slate-800/90 shadow-xl text-white bg-[#060d1a]">
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
            className="absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-500 filter brightness-[0.86] contrast-[1.06]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050b16]/95 via-[#050b16]/65 to-[#050b16]/30" />

          <div className="relative z-10 p-4 space-y-4">
            {/* Top Station & Controls */}
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-sky-300 truncate">
                  <MapPin className="h-3 w-3 text-sky-400 shrink-0" />
                  <span>{station.department || '75 - Paris'}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">Alt. {station.altitude || 75} m</span>
                </div>
                <h2 className="text-2xl font-extrabold text-white tracking-tight leading-none drop-shadow-sm truncate">
                  {station.name}
                </h2>
                <div className="text-[11px] text-slate-300 truncate">
                  Climat {station.climateZone || 'Océanique dégradé'}
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={toggleBubble}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition cursor-pointer backdrop-blur-sm ${
                    isBubbleActive 
                      ? 'bg-sky-600/80 text-white border-sky-400' 
                      : 'bg-black/40 border-white/15 text-slate-200 hover:text-white'
                  }`}
                >
                  <Plus className="h-3 w-3" />
                  <span>Bulle</span>
                </button>

                {onOpenSearchModal && (
                  <button
                    type="button"
                    onClick={onOpenSearchModal}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/40 hover:bg-black/60 border border-white/15 text-[11px] font-semibold text-white transition cursor-pointer backdrop-blur-sm"
                  >
                    <Search className="h-3 w-3 text-sky-300" />
                    <span>Changer</span>
                  </button>
                )}
              </div>
            </div>

            {/* Center: Massive Temperature + Unified Weather Symbol */}
            <div className="flex items-center justify-between gap-3 pt-1">
              <div>
                <div className="text-5xl font-black tracking-tighter text-white drop-shadow-md font-mono tabular-nums leading-none">
                  {formatTemp(weather.temperature)}
                </div>
                <p className="text-xs font-medium text-slate-200 mt-1.5 max-w-[210px] leading-snug">
                  {weather.weatherDescription || 'Ciel principalement clair'}
                </p>
              </div>

              <div className="flex flex-col items-end gap-1.5 shrink-0">
                {isUsingCachedData ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-300">
                    <span className="inline-flex rounded-full h-1.5 w-1.5 bg-amber-400" />
                    <span>Cache{cachedAt ? ` (${cachedAt})` : ''}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-emerald-400">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                    <span>En direct</span>
                  </span>
                )}

                <DynamicSkyHeroArt 
                  weatherCode={weather.weatherCode} 
                  isDay={weather.isDay ?? true} 
                  size="sm" 
                />
              </div>
            </div>

            {/* 4-Metric Architectural Strip */}
            <div className="rounded-xl bg-slate-950/80 border border-white/15 backdrop-blur-md p-2.5 grid grid-cols-4 divide-x divide-white/10 text-center">
              <div className="flex flex-col items-center px-1">
                <div className="flex items-center gap-1 text-[10px] text-slate-300 font-medium mb-0.5">
                  <ThermometerSnowflake className="h-3 w-3 text-cyan-400" />
                  <span>Ressenti</span>
                </div>
                <span className="text-xs font-extrabold text-white font-mono tabular-nums">{formatTemp(weather.feelsLike)}</span>
              </div>

              <div className="flex flex-col items-center px-1">
                <div className="flex items-center gap-1 text-[10px] text-slate-300 font-medium mb-0.5">
                  <Droplets className="h-3 w-3 text-blue-400" />
                  <span>Humidité</span>
                </div>
                <span className="text-xs font-extrabold text-white font-mono tabular-nums">{weather.humidity}%</span>
              </div>

              <div className="flex flex-col items-center px-1">
                <div className="flex items-center gap-1 text-[10px] text-slate-300 font-medium mb-0.5">
                  <Wind className="h-3 w-3 text-sky-400" />
                  <span>Vent</span>
                </div>
                <span className="text-xs font-extrabold text-white font-mono tabular-nums">
                  {Math.round(weather.windSpeed)} <span className="text-[10px] font-normal">km/h</span>
                </span>
              </div>

              <div className="flex flex-col items-center px-1">
                <div className="flex items-center gap-1 text-[10px] text-slate-300 font-medium mb-0.5">
                  <Sun className="h-3 w-3 text-amber-400" />
                  <span>UV</span>
                </div>
                <span className="text-xs font-extrabold text-white font-mono tabular-nums">
                  {weather.uvIndex || 5}
                </span>
              </div>
            </div>

            {/* Bottom Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              {onLocateGps && (
                <button
                  type="button"
                  onClick={onLocateGps}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-semibold text-xs transition cursor-pointer"
                >
                  <Navigation className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Ma position GPS</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => onNavigateTab ? onNavigateTab('radar') : (onOpenGigaRadar ? onOpenGigaRadar() : null)}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-900/90 border border-white/15 text-slate-200 font-semibold text-xs transition hover:text-white cursor-pointer"
              >
                <Map className="h-3.5 w-3.5 text-sky-400" />
                <span>Voir sur la carte</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsContradictionModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-black/40 hover:bg-black/60 border border-amber-400/30 text-amber-200 font-semibold text-xs transition cursor-pointer"
            >
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              <span>Ajuster le direct (Observation de terrain)</span>
            </button>
          </div>
        </div>

        <LiveMeteoFranceVigilanceCard
          station={station}
          onClick={() => onNavigateTab ? onNavigateTab('vigilance') : null}
        />

        <MeteoFrancePluieEtNormalesWidget
          station={station}
          weather={weather}
          hourly={hourly}
          tempUnit={tempUnit}
          onRefresh={onLocateGps}
        />

        <UnifiedHourly48hTrend
          station={station}
          currentWeather={weather}
          hourly={hourly}
          tempUnit={tempUnit}
          onNavigateTab={onNavigateTab}
        />
      </div>

      {/* 1. Desktop Hero Weather, Map & Detailed Hourly/Daily Forecast + Soleil & Lune */}
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

      {activeProfileTab === 'classic' && (
        <div className="space-y-6">
          {/* Mobile only: Prévisions Détaillées de la Journée (24h) & Semaine (7 Jours) */}
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

          {/* BARRE DE FILTRAGE THÉMATIQUE & CHAPITRE 01 (Mode Expert uniquement) */}
          {!simplifiedMode && (
            <>
              <div className="px-4 py-3 rounded-xl bg-[#0a1220]/95 border border-slate-800/90 shadow-md flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Navigation par rubrique d&apos;analyse
                  </h3>
                  <p className="text-xs text-slate-400">
                    Filtrez les sections de l&apos;observatoire ou affichez l&apos;intégralité des modules
                  </p>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 no-scrollbar">
                  {[
                    { id: 'ALL', label: 'Tout afficher' },
                    { id: 'ESSENTIAL', label: '01. Briefing & 24h' },
                    { id: 'INDICATORS', label: '02. Air & Pollen' },
                    { id: 'SKY_AURORA', label: '03. Astronomie & Aurores' },
                    { id: 'RAIN_RADAR', label: '04. Nowcasting Pluie' }
                  ].map((ch) => (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => setPublicChapterFilter(ch.id as any)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition cursor-pointer ${
                        publicChapterFilter === ch.id
                          ? 'bg-sky-600 text-white shadow-sm'
                          : 'bg-slate-950 text-slate-300 hover:text-white hover:bg-slate-900 border border-slate-800'
                      }`}
                    >
                      {ch.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setIsShareCardModalOpen(true)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    <span>Carte partageable</span>
                  </button>
                </div>
              </div>

              {/* CHAPITRE 01 : BRIEFING AUDIO & COMPARATEUR 24H */}
              {(publicChapterFilter === 'ALL' || publicChapterFilter === 'ESSENTIAL') && (
                <div className="space-y-3">
                  <div className="flex items-baseline justify-between border-b border-slate-800/80 pb-2">
                    <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                      01. Synthèse Vocale &amp; Comparateur Temporel 24h
                    </h3>
                    <button
                      type="button"
                      onClick={() => setIsShareCardModalOpen(true)}
                      className="text-xs font-medium text-sky-400 hover:text-sky-300 hover:underline cursor-pointer hidden sm:inline"
                    >
                      Exporter une carte météo partageable →
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

          {/* CHAPITRE 02 : LES 7 JAUGES & INDICATEURS SYNOPTIQUES */}
          {(simplifiedMode || publicChapterFilter === 'ALL' || publicChapterFilter === 'INDICATORS') && (
            <div id="realtime-indicators" className="scroll-mt-28 space-y-3">
              <div className="flex items-baseline justify-between border-b border-slate-800/80 pb-2">
                <h3 className={`font-bold text-white tracking-tight ${seniorMode ? 'text-xl' : 'text-sm sm:text-base'}`}>
                  {simplifiedMode
                    ? "Indicateurs Atmosphériques, Qualité de l'Air & Pollen"
                    : "02. Indicateurs Atmosphériques, Qualité de l'Air & Pollen"}
                </h3>
                <span className="text-xs text-slate-400">Télémétrie temps réel</span>
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
                  subValue={`Raf. ${weather.windGust} km/h`}
                  icon={Wind}
                  colorClass="text-teal-400"
                  bgGradient="bg-teal-600/20"
                  description="Vitesse moyenne mesurée à 10 mètres du sol avec analyse des rafales instantanées."
                  seniorMode={seniorMode}
                />

                <WeatherGauge
                  title="Indice UV"
                  value={weather.uvIndex}
                  unit="/12"
                  subValue={weather.uvIndex >= 8 ? "Très Fort" : weather.uvIndex >= 6 ? "Élevé" : weather.uvIndex >= 3 ? "Modéré" : "Faible"}
                  icon={Sun}
                  colorClass="text-amber-400"
                  bgGradient="bg-amber-600/20"
                  description="Intensité des rayons ultraviolets corrigée de l'altitude (+10% / 1000m)."
                  seniorMode={seniorMode}
                />

                <WeatherGauge
                  title="Qualité de l'Air"
                  value={weather.airQualityAqi}
                  unit="IQA"
                  subValue={weather.airQualityLabel}
                  icon={Activity}
                  colorClass="text-emerald-400"
                  bgGradient="bg-emerald-600/20"
                  description="Indice européen de pureté de l'air (PM2.5, PM10, Ozone, NO2)."
                  seniorMode={seniorMode}
                />

                <WeatherGauge
                  title="Pression"
                  value={weather.pressure}
                  unit="hPa"
                  subValue={weather.pressureMsl ? `QNH ${weather.pressureMsl}` : `QFE ${weather.pressure}`}
                  icon={Gauge}
                  colorClass="text-indigo-400"
                  bgGradient="bg-indigo-600/20"
                  description={`Pression barométrique à ${station.altitude} m d'altitude.`}
                  seniorMode={seniorMode}
                />

                {!simplifiedMode && (
                  <WeatherGauge
                    title="Précipitations"
                    value={weather.precipitation}
                    unit="mm"
                    subValue={weather.precipitation === 0 ? "Temps Sec" : `${weather.precipitation} mm/h`}
                    icon={CloudRain}
                    colorClass="text-cyan-400"
                    bgGradient="bg-cyan-600/20"
                    description="Cumul de pluie mesuré sur la dernière heure."
                    seniorMode={seniorMode}
                  />
                )}

                <PollenRealtimeTrackerCard
                  weather={weather}
                  station={station}
                  seniorMode={seniorMode}
                />
              </div>
            </div>
          )}

          {/* CHAPITRE 03 : ASTRONOMIE VÉRIFIÉE, AURORES BORÉALES & VIE QUOTIDIENNE */}
          {(simplifiedMode || publicChapterFilter === 'ALL' || publicChapterFilter === 'SKY_AURORA' || publicChapterFilter === 'INDICATORS') && (
            <div className="space-y-3.5">
              {!simplifiedMode && (
                <div className="flex items-baseline justify-between border-b border-slate-800/80 pb-2">
                  <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                    03. Astronomie Vérifiée, Aurores Boréales (Kp) &amp; Indices d&apos;Activités
                  </h3>
                  <span className="text-xs text-slate-400">Calculs astronomiques &amp; biométéorologie</span>
                </div>
              )}

              <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-stretch">
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

              {!simplifiedMode && (
                <AuroraNightSkyCard
                  station={station}
                  weather={weather}
                />
              )}
            </div>
          )}

          {/* CHAPITRE 04 : PRÉCIPITATIONS CHIRURGICALES & NOWCASTING (< 3h & < 24h) */}
          {(simplifiedMode || publicChapterFilter === 'ALL' || publicChapterFilter === 'RAIN_RADAR') && (
            <div id="realtime-precipitation" className="w-full scroll-mt-28 min-w-0 space-y-3">
              {!simplifiedMode && (
                <div className="flex items-baseline justify-between border-b border-slate-800/80 pb-2">
                  <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                    04. Nowcasting Chirurgical des Précipitations (&lt; 3h &amp; 24h)
                  </h3>
                  <span className="text-xs text-slate-400">Suivi radar minute par minute</span>
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

          {/* CHAPITRE 05 : PORTAIL DES 4 GRANDS UNIVERS TERRITORIAUX (Mode Expert uniquement) */}
          {!simplifiedMode && (
            <div className="rounded-xl bg-[#0a1220]/95 border border-slate-800/90 p-5 shadow-md space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-slate-800/80 pb-3">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                    05. Observatoires Territoriaux Spécialisés — {station.name} &amp; Monde
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Analyses dédiées par massif, littoral, bassin hydrographique et risque feux de forêts
                  </p>
                </div>
                <span className="text-xs text-slate-400">
                  Accès direct aux 4 observatoires
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <button
                  type="button"
                  onClick={() => onNavigateTab && onNavigateTab('mountain')}
                  className="p-4 rounded-xl bg-slate-950/70 hover:bg-slate-900 border border-slate-800/90 hover:border-sky-500/50 text-left transition group cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold text-sky-400">
                      <span className="inline-flex items-center gap-1.5">
                        <Mountain className="h-3.5 w-3.5" />
                        <span>Montagne &amp; 8 Versants</span>
                      </span>
                      <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-sky-400 transition" />
                    </div>
                    <div className="text-sm font-bold text-white mt-2">
                      Neige par altitude &amp; LPN
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Analyse N, NE, E, SE, S, SW, W, NW, limite pluie-neige dynamique et stations d&apos;Europe.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigateTab && onNavigateTab('beaches')}
                  className="p-4 rounded-xl bg-slate-950/70 hover:bg-slate-900 border border-slate-800/90 hover:border-cyan-500/50 text-left transition group cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold text-cyan-400">
                      <span className="inline-flex items-center gap-1.5">
                        <Waves className="h-3.5 w-3.5" />
                        <span>Mer, Plages &amp; SHOM</span>
                      </span>
                      <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-cyan-400 transition" />
                    </div>
                    <div className="text-sm font-bold text-white mt-2">
                      Stations Balnéaires Monde
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Température de l&apos;eau, houle primaire vs clapot, marées SHOM et indice baignade/surf.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigateTab && onNavigateTab('watercourses')}
                  className="p-4 rounded-xl bg-slate-950/70 hover:bg-slate-900 border border-slate-800/90 hover:border-blue-500/50 text-left transition group cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold text-blue-400">
                      <span className="inline-flex items-center gap-1.5">
                        <Droplets className="h-3.5 w-3.5" />
                        <span>Cours d&apos;Eau &amp; Crues</span>
                      </span>
                      <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-blue-400 transition" />
                    </div>
                    <div className="text-sm font-bold text-white mt-2">
                      Hub&apos;Eau &amp; GloFAS 7j
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Surveillance des rivières dans un rayon de 28 km, débits m³/s et seuils Vigicrues.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigateTab && onNavigateTab('droughtFire')}
                  className="p-4 rounded-xl bg-slate-950/70 hover:bg-slate-900 border border-slate-800/90 hover:border-amber-500/50 text-left transition group cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold text-amber-400">
                      <span className="inline-flex items-center gap-1.5">
                        <Flame className="h-3.5 w-3.5" />
                        <span>Sécheresse &amp; Forêts</span>
                      </span>
                      <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-amber-400 transition" />
                    </div>
                    <div className="text-sm font-bold text-white mt-2">
                      Sols 4 Profondeurs &amp; FWI
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Humidité des sols 0–27 cm, VPD, indice incendie et arrêtés préfectoraux VigiEau.
                    </p>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PROFIL 2 : AGRO-MÉTÉO */}
      {activeProfileTab === 'agriculture' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
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

      {/* PROFIL 3 : MÉTÉO AVIATION */}
      {activeProfileTab === 'aviation' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
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

      {/* PROFIL 4 : MÉTÉO PROFESSIONNELLE */}
      {activeProfileTab === 'pro' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
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

          <div className="xl:col-span-6 space-y-4 min-w-0">
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
      {/* 3. ACCÈS RAPIDE AUX HORIZONS TEMPORELS & APPLICATION PWA                  */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3 items-center pt-1">
        <div id="realtime-more-forecast" className="xl:col-span-7 grid grid-cols-2 lg:grid-cols-4 gap-2.5 scroll-mt-28">
          <button
            type="button"
            onClick={() => onNavigateTab && onNavigateTab('vigilance')}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-slate-800/90 bg-[#0a1220]/95 hover:border-rose-500/40 hover:bg-slate-900 transition text-left group cursor-pointer min-w-0"
          >
            <ShieldAlert className="h-4 w-4 text-rose-400 shrink-0" />
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-white group-hover:text-rose-300 truncate">Vigilances &amp; Alertes</h4>
              <p className="text-[10px] text-slate-400 truncate">Matrice des 12 risques</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab && onNavigateTab('thirtyDays')}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-slate-800/90 bg-[#0a1220]/95 hover:border-sky-500/40 hover:bg-slate-900 transition text-left group cursor-pointer min-w-0"
          >
            <Calendar className="h-4 w-4 text-sky-400 shrink-0" />
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-white group-hover:text-sky-300 truncate">Prévisions 30 Jours</h4>
              <p className="text-[10px] text-slate-400 truncate">Calendrier quotidien</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab && onNavigateTab('eightMonths')}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-slate-800/90 bg-[#0a1220]/95 hover:border-indigo-500/40 hover:bg-slate-900 transition text-left group cursor-pointer min-w-0"
          >
            <Globe className="h-4 w-4 text-indigo-400 shrink-0" />
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-white group-hover:text-indigo-300 truncate">Tendances 8 Mois</h4>
              <p className="text-[10px] text-slate-400 truncate">24 Décades · 240 Jours</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab && onNavigateTab('radar')}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-slate-800/90 bg-[#0a1220]/95 hover:border-cyan-500/40 hover:bg-slate-900 transition text-left group cursor-pointer min-w-0"
          >
            <Radar className="h-4 w-4 text-cyan-400 shrink-0" />
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 truncate">Giga Radar de Pluie</h4>
              <p className="text-[10px] text-slate-400 truncate">ARAMIS &amp; Satellite HD</p>
            </div>
          </button>
        </div>

        {/* Quick Action & Install Banner (Desktop only) */}
        <div id="realtime-download" className="hidden sm:flex xl:col-span-5 rounded-xl border border-slate-800/90 bg-[#0a1220]/95 px-3.5 py-2 items-center justify-between gap-2 shadow-sm scroll-mt-28">
          <div className="flex items-center gap-2.5 min-w-0">
            <img src="/icon-192.png" alt="Logo Instant Météo" referrerPolicy="no-referrer" className="h-7 w-7 rounded-lg border border-slate-700 object-cover shrink-0" />
            <div className="min-w-0">
              <span className="text-xs font-bold text-white block truncate">Application Instant Météo</span>
              <span className="text-[10px] text-slate-400 block truncate">Accès direct hors-ligne &amp; bureau</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <a
              href="/Instant-Meteo-Windows.cmd"
              download="Instant-Meteo-Windows.cmd"
              title="Télécharger le lanceur autonome pour Windows"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white font-semibold text-xs transition cursor-pointer whitespace-nowrap shrink-0"
            >
              <Download className="h-3.5 w-3.5 text-sky-400" />
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
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition cursor-pointer whitespace-nowrap shrink-0"
            >
              <span>Installer l&apos;App</span>
            </button>

            {onToggleFullscreen && (
              <button
                type="button"
                onClick={onToggleFullscreen}
                title="Activer ou quitter le mode plein écran (F11)"
                className={`p-1.5 rounded-lg border transition cursor-pointer ${
                  isFullscreen
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
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
