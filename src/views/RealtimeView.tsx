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
  Radio
} from 'lucide-react';
import { LocationPoint, CurrentWeather, HourlyForecast, DailyForecast, ClimateAnomaly } from '../types/weather';
import { WeatherGauge } from '../components/WeatherGauge';
import { AnomalyBadge } from '../components/AnomalyBadge';
import { AltitudeMeteorologyCard } from '../components/AltitudeMeteorologyCard';
import { EphemerisCard } from '../components/EphemerisCard';
import { OutdoorIndicesCard } from '../components/OutdoorIndicesCard';
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
import { TemperatureReliabilityCalibrationCard } from '../components/TemperatureReliabilityCalibrationCard';
import { ImouWeatherSecurityBanner } from '../components/ImouWeatherSecurityBanner';
import { AgricultureWeatherCard } from '../components/AgricultureWeatherCard';
import { AviationWeatherCard } from '../components/AviationWeatherCard';
import { ProfessionalMeteoCard } from '../components/ProfessionalMeteoCard';
import { isBlockVisible } from '../services/displayPreferencesService';

interface RealtimeViewProps {
  station: LocationPoint;
  weather: CurrentWeather;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  anomaly: ClimateAnomaly;
  seniorMode: boolean;
  simplifiedMode?: boolean;
  tempUnit: 'C' | 'F';
  onOpenSearchModal?: () => void;
  onOpenGigaRadar?: () => void;
  onNavigateTab?: (tab: string) => void;
  onLocateGps?: () => void;
  onOpenInstallModal?: () => void;
  onToggleFullscreen?: () => void;
  isFullscreen?: boolean;
  onRecalibrate?: (offset: number) => void;
  onResetRecalibration?: () => void;
}

export const RealtimeView: React.FC<RealtimeViewProps> = ({
  station,
  weather,
  hourly,
  daily,
  anomaly,
  seniorMode,
  simplifiedMode = false,
  tempUnit,
  onOpenSearchModal,
  onOpenGigaRadar,
  onNavigateTab,
  onLocateGps,
  onOpenInstallModal,
  onToggleFullscreen,
  isFullscreen,
  onRecalibrate,
  onResetRecalibration
}) => {
  const [activeProfileTab, setActiveProfileTab] = useState<'classic' | 'agriculture' | 'aviation' | 'pro'>('classic');
  const [isDailyAnalyzerOpen, setIsDailyAnalyzerOpen] = useState<boolean>(false);
  const [selectedDayIndexForAnalyzer, setSelectedDayIndexForAnalyzer] = useState<number>(0);
  const [activeWinterModule, setActiveWinterModule] = useState<'NONE' | 'CLOUD' | 'SNOW' | 'FROST' | 'ALTITUDE'>('CLOUD');
  const [showMoreObservatories, setShowMoreObservatories] = useState<boolean>(false);

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
    <div className="space-y-6">
      {/* 4 Profils Météo Spécialisés : Chaîne Météo Classique, Agro-Météo, Aviation, Météo Pro (Masqués en Mode Simple) */}
      {!simplifiedMode && (
        <div className="sticky top-0 z-20 py-2 -my-2 bg-slate-950/85 backdrop-blur-md">
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-x-auto scrollbar-none overscroll-x-contain touch-pan-x scroll-smooth">
            <button
              id="realtime-tab-classic"
              onClick={() => setActiveProfileTab('classic')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm transition cursor-pointer whitespace-nowrap shrink-0 ${
                activeProfileTab === 'classic'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 ring-1 ring-white/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <Tv className="h-4 w-4 text-blue-300" />
              <span>📺 Chaîne Météo (Classique)</span>
            </button>

            <button
              id="realtime-tab-agriculture"
              onClick={() => setActiveProfileTab('agriculture')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm transition cursor-pointer whitespace-nowrap shrink-0 ${
                activeProfileTab === 'agriculture'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 ring-1 ring-white/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <Sprout className="h-4 w-4 text-emerald-300" />
              <span>🌾 Agro-Météo</span>
            </button>

            <button
              id="realtime-tab-aviation"
              onClick={() => setActiveProfileTab('aviation')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm transition cursor-pointer whitespace-nowrap shrink-0 ${
                activeProfileTab === 'aviation'
                  ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30 ring-1 ring-white/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <Plane className="h-4 w-4 text-sky-300" />
              <span>✈️ Météo Aviation</span>
            </button>

            <button
              id="realtime-tab-pro"
              onClick={() => setActiveProfileTab('pro')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm transition cursor-pointer whitespace-nowrap shrink-0 ${
                activeProfileTab === 'pro'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-1 ring-white/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <Activity className="h-4 w-4 text-indigo-300" />
              <span>🔬 Météo Pro &amp; Modèles</span>
            </button>
          </div>
          {/* Mobile Swipe Navigation Hint */}
          <div className="flex sm:hidden items-center justify-between px-2 pt-1 text-[10px] text-slate-400 font-medium">
            <span>👈 Glissez pour défiler</span>
            <span className="text-blue-400 font-bold">4 modes météo</span>
            <span>Glissez l'écran pour changer 👉</span>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MOBILE EXCLUSIVE HERO & FORECAST (Exact 1:1 match with user reference)    */}
      {/* ========================================================================= */}
      <div className="block sm:hidden space-y-3.5 mb-4">
        {/* 1. Scenic Hero Weather Card with Parisian / Park Landscape */}
        <div className="relative overflow-hidden rounded-[28px] border border-slate-700/60 shadow-2xl text-white bg-slate-950">
          {/* Photographic Background Asset */}
          <div 
            className="absolute inset-0 bg-cover bg-center transition-all duration-700 filter brightness-[0.82] contrast-[1.05]"
            style={{
              backgroundImage: 'url(/paris_weather_hero_bg.jpg)',
              backgroundPosition: 'center 35%'
            }}
          />
          {/* Subtle Atmospheric Gradient Overlay for contrast and readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-950/40" />

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

              {/* Top Right "Changer de station" pill */}
              {onOpenSearchModal && (
                <button
                  onClick={onOpenSearchModal}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-950/80 border border-slate-700/80 backdrop-blur-md text-[11px] font-bold text-slate-200 hover:text-white shadow-lg active:scale-95 transition cursor-pointer shrink-0"
                >
                  <Search className="h-3 w-3 text-sky-400" />
                  <span>Changer</span>
                </button>
              )}
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

            {/* Center: Massive Temperature + Live Badge & Radiant Sun Graphic */}
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
                {/* En Direct Badge */}
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-950/85 border border-slate-700 text-emerald-400 text-[10px] font-black tracking-wide shadow-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span>En direct</span>
                </div>

                {/* Radiant Glowing Sun Graphic */}
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <div className="absolute inset-0 bg-amber-400/25 rounded-full blur-lg animate-pulse" />
                  <div className="relative w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-200 shadow-xl shadow-amber-500/40 border border-yellow-200/60 flex items-center justify-center">
                    <Sun className="h-7 w-7 text-amber-950" />
                  </div>
                </div>
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
          </div>
        </div>

        {/* 2. Hourly Forecast Row ("Prévisions à {station.name}") */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-black text-white tracking-wide">
              Prévisions à {station.name}
            </h3>
            <button
              onClick={() => onNavigateTab ? onNavigateTab('scenarios14d') : null}
              className="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center gap-0.5 transition"
            >
              <span>Voir plus</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 pt-0.5 px-0.5">
            {/* Active Card: Maintenant (Glowing Blue) */}
            <div className="flex flex-col items-center justify-between min-w-[72px] h-[96px] rounded-2xl p-2 bg-gradient-to-b from-blue-600 to-blue-700 border-2 border-blue-400 shadow-lg shadow-blue-600/35 text-white shrink-0">
              <span className="text-[10px] font-black text-blue-100 uppercase tracking-tight">Maintenant</span>
              <Sun className="h-6 w-6 text-amber-300 drop-shadow" />
              <span className="text-xs font-black text-white tracking-tight">{formatTemp(weather.temperature)}</span>
            </div>

            {/* Next Hours from hourly dataset */}
            {hourly.slice(0, 8).map((slot, idx) => {
              const label = slot.hourLabel || (slot.time ? slot.time.slice(11, 16) : `${idx + 1}h`);
              return (
                <div
                  key={idx}
                  className="flex flex-col items-center justify-between min-w-[70px] h-[96px] rounded-2xl p-2 bg-[#0c1424] border border-slate-800 text-slate-200 shrink-0 shadow-sm"
                >
                  <span className="text-[10px] font-bold text-slate-400">{label}</span>
                  {slot.precipitationProbability > 40 || slot.rainMm > 0 ? (
                    <CloudRain className="h-6 w-6 text-sky-400" />
                  ) : slot.hourNumber !== undefined && (slot.hourNumber >= 21 || slot.hourNumber <= 5) ? (
                    <Moon className="h-6 w-6 text-indigo-300" />
                  ) : (
                    <Sun className="h-6 w-6 text-amber-400" />
                  )}
                  <span className="text-xs font-black text-white">{Math.round(slot.temperature)}°</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Two Live Interactive Preview Cards (Radar Pluie HD & Vigilance Météo) */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Card 1: Radar Pluie HD */}
          <div
            onClick={() => onNavigateTab ? onNavigateTab('radar') : (onOpenGigaRadar ? onOpenGigaRadar() : null)}
            className="rounded-2xl border border-slate-800 bg-[#0c1424] p-3 flex flex-col justify-between overflow-hidden relative cursor-pointer active:scale-98 hover:border-blue-500/50 transition shadow-lg group"
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-1 mb-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <div className="w-6 h-6 rounded-lg bg-blue-500/20 border border-blue-400/40 text-sky-400 flex items-center justify-center shrink-0">
                  <Radio className="h-3.5 w-3.5 text-sky-400" />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-bold text-white truncate leading-tight">Radar Pluie HD</div>
                  <div className="text-[9px] text-slate-400 truncate">Suivi en temps réel</div>
                </div>
              </div>
              <div className="w-5 h-5 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-400 group-hover:text-white shrink-0">
                <ChevronRight className="h-3 w-3" />
              </div>
            </div>

            {/* Radar Map Graphic with rain echoes and central glowing Play button */}
            <div className="relative w-full h-24 rounded-xl overflow-hidden bg-slate-950 border border-slate-800/80 flex items-center justify-center">
              {/* Radar echo circles / rain pattern */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-950 via-[#071328] to-slate-950" />
              {/* Simulated radar sweep / echoes */}
              <div className="absolute w-20 h-20 rounded-full bg-emerald-500/20 blur-md top-1 left-2" />
              <div className="absolute w-14 h-14 rounded-full bg-amber-500/25 blur-md bottom-2 right-4" />
              <div className="absolute w-10 h-10 rounded-full bg-rose-500/30 blur-sm top-3 right-6" />

              {/* Grid radar rings */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-20 h-20 rounded-full border border-sky-500/20" />
                <div className="w-12 h-12 rounded-full border border-sky-500/30 absolute" />
              </div>

              {/* Glowing circular Play button in the center */}
              <div className="relative z-10 w-8 h-8 rounded-full bg-blue-600 border border-blue-300 text-white flex items-center justify-center shadow-lg shadow-blue-600/50 group-hover:scale-110 transition">
                <Play className="h-3.5 w-3.5 fill-white ml-0.5" />
              </div>
            </div>
          </div>

          {/* Card 2: Vigilance Météo */}
          <div
            onClick={() => onNavigateTab ? onNavigateTab('vigilance') : null}
            className="rounded-2xl border border-slate-800 bg-[#0c1424] p-3 flex flex-col justify-between overflow-hidden relative cursor-pointer active:scale-98 hover:border-amber-500/50 transition shadow-lg group"
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-1 mb-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-400/40 text-amber-400 flex items-center justify-center shrink-0">
                  <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-bold text-white truncate leading-tight">Vigilance Météo</div>
                  <div className="text-[9px] text-slate-400 truncate">Météo-France</div>
                </div>
              </div>
              <div className="w-5 h-5 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-400 group-hover:text-white shrink-0">
                <ChevronRight className="h-3 w-3" />
              </div>
            </div>

            {/* Vigilance Map Graphic & Legend */}
            <div className="relative w-full h-24 rounded-xl overflow-hidden bg-slate-950 border border-slate-800/80 p-2 flex items-center justify-between">
              {/* Simulated stylized France contour with vigilance colors */}
              <div className="relative w-16 h-20 flex items-center justify-center shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow">
                  <path d="M45,10 L70,25 L85,45 L75,75 L60,90 L35,85 L15,60 L20,30 Z" fill="#10b981" opacity="0.85" />
                  <path d="M50,30 L75,45 L65,70 L45,55 Z" fill="#f59e0b" opacity="0.9" />
                  <path d="M30,40 L45,55 L35,70 L20,55 Z" fill="#ef4444" opacity="0.85" />
                </svg>
              </div>

              {/* Legend List */}
              <div className="space-y-0.5 text-[8px] font-bold pl-1 border-l border-slate-800/80">
                <div className="flex items-center gap-1 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Aucune</span>
                </div>
                <div className="flex items-center gap-1 text-amber-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>Modérée</span>
                </div>
                <div className="flex items-center gap-1 text-orange-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                  <span>Marquée</span>
                </div>
                <div className="flex items-center gap-1 text-rose-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  <span>Sévère</span>
                </div>
                <div className="flex items-center gap-1 text-purple-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  <span>Extrême</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 1. Hero Current Weather & Active GPS Localization Banner (Desktop) */}
      <div
        id="realtime-radiography"
        className={`hidden sm:block relative overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-900/70 p-6 shadow-xl backdrop-blur-md sm:p-8 scroll-mt-28 ${
          seniorMode ? 'p-8 ring-1 ring-blue-500/30' : ''
        }`}
      >
        {/* GPS Live Notification if Active */}
        {isGpsPosition && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 px-4 py-2 text-xs text-emerald-300">
            <div className="flex items-center gap-2">
              <Navigation className="h-4 w-4 text-emerald-400 fill-emerald-400/20" />
              <span className="font-bold">
                📍 Position GPS Locale Active : {station.latitude}°, {station.longitude}° • Altitude : {station.altitude} m
              </span>
            </div>
            {onLocateGps && (
              <button
                onClick={onLocateGps}
                className="font-bold underline hover:text-emerald-200 transition cursor-pointer"
              >
                Actualiser position
              </button>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch w-full">
          {/* Main Temperature & Location Info */}
          <div className="lg:col-span-5 xl:col-span-5 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2 text-blue-400 font-semibold text-xs uppercase tracking-wider">
                <span>Station Météo de Référence</span>
                <span>•</span>
                <span>{station.country || 'France'} ({station.region})</span>
              </div>
              
              <div className="mt-1 flex flex-wrap items-center gap-3">
                <h2 className={`font-black text-white ${seniorMode ? 'text-4xl' : 'text-3xl sm:text-4xl'}`}>
                  {station.name}
                </h2>

                {onLocateGps && !isGpsPosition && (
                  <button
                    onClick={onLocateGps}
                    className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500/20 transition active:scale-95 cursor-pointer"
                  >
                    <Navigation className="h-3.5 w-3.5" />
                    <span>Ma Position GPS</span>
                  </button>
                )}

                {onOpenSearchModal && (
                  <button
                    onClick={onOpenSearchModal}
                    className="flex items-center gap-1.5 rounded-xl border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-xs font-bold text-blue-300 hover:bg-blue-500/20 transition active:scale-95 cursor-pointer"
                  >
                    <Search className="h-3.5 w-3.5" />
                    <span>Changer de station</span>
                  </button>
                )}
              </div>
              
              <p className="mt-1 text-sm text-slate-400">
                {station.department} — Altitude : <strong className="text-slate-200">{station.altitude} m</strong> — Climat : {station.climateZone}
              </p>
            </div>

            {/* Temperature & Thermal Metrics Display */}
            <div className="space-y-3 w-full">
              {/* Massive Current Temperature Display */}
              <div className="relative overflow-hidden rounded-3xl border border-slate-700/80 bg-slate-950/95 p-5 sm:p-6 shadow-2xl ring-1 ring-white/10">
                <div className="flex items-center justify-between gap-2 mb-2 border-b border-slate-800/80 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-xl border border-emerald-500/40">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      En direct
                    </span>
                    {weather.isUserRecalibrated && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded-lg border border-amber-500/30">
                        Ajusté {weather.recalibrationOffset && weather.recalibrationOffset > 0 ? `+${weather.recalibrationOffset}` : weather.recalibrationOffset}°C
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Température Actuelle
                  </span>
                </div>

                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <span className={`font-black tracking-tight text-white tabular-nums leading-none ${seniorMode ? 'text-6xl sm:text-7xl md:text-8xl' : 'text-5xl sm:text-6xl md:text-7xl'}`}>
                    {formatTemp(weather.temperature)}
                  </span>
                  <div className="text-right">
                    <span className={`inline-block rounded-xl bg-blue-600/20 border border-blue-500/30 px-3 py-1.5 font-bold text-blue-200 ${
                      seniorMode ? 'text-sm' : 'text-xs'
                    }`}>
                      {weather.weatherDescription}
                    </span>
                  </div>
                </div>
              </div>

              {/* Secondary Thermal Metrics: Feels Like & Tmin/Tmax in a 2-column balanced grid */}
              <div className="grid grid-cols-2 gap-3 w-full">
                {/* Feels Like Card */}
                <div className="flex flex-col justify-between rounded-2xl border border-cyan-500/40 bg-cyan-950/40 p-3.5 sm:p-4 shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400/90">
                      Ressenti
                    </span>
                    <span className="text-[10px] text-cyan-300/90 font-bold px-1.5 py-0.5 rounded bg-cyan-900/60">
                      {weather.windSpeed > 20 ? 'Ventilée' : weather.humidity > 70 ? 'Humidex' : 'Confort'}
                    </span>
                  </div>
                  <div className="mt-1">
                    <span className="text-2xl sm:text-3xl font-black text-cyan-300 tabular-nums leading-tight">
                      {formatTemp(weather.feelsLike)}
                    </span>
                  </div>
                </div>

                {/* Tmin & Tmax Highlights */}
                <div className="flex flex-col justify-center gap-1.5 rounded-2xl border border-slate-700/80 bg-slate-950/80 p-3 sm:p-3.5 shadow-sm">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-800/90 pb-1">
                    <span className="text-xs font-bold text-blue-300 flex items-center gap-1">
                      ❄️ Tmin :
                    </span>
                    <strong className="text-sm sm:text-base font-black text-blue-200 tabular-nums">
                      {formatTemp(weather.tempMin)}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between gap-2 pt-0.5">
                    <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                      🔥 Tmax :
                    </span>
                    <strong className="text-sm sm:text-base font-black text-amber-200 tabular-nums">
                      {formatTemp(weather.tempMax)}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Condition badge & Live Physical Tags */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {weather.dewPoint !== undefined && (
                <span className="text-xs px-2.5 py-1 rounded-lg bg-cyan-950/40 border border-cyan-800/60 text-cyan-300 font-medium whitespace-nowrap">
                  Point de rosée : <strong className="tabular-nums">{formatTemp(weather.dewPoint)}</strong>
                </span>
              )}
              {weather.pressureMsl && (
                <span className="text-xs px-2.5 py-1 rounded-lg bg-indigo-950/40 border border-indigo-800/60 text-indigo-300 font-medium whitespace-nowrap">
                  QNH : <strong className="tabular-nums">{weather.pressureMsl} hPa</strong>
                </span>
              )}
              {weather.windSpeed !== undefined && (
                <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-800/60 border border-slate-700/60 text-slate-300 font-medium whitespace-nowrap">
                  Vent : <strong className="tabular-nums">{Math.round(weather.windSpeed)} km/h</strong>
                </span>
              )}
            </div>
          </div>

          {/* Representative Day Weather & Key Slots Overview */}
          <div className="lg:col-span-7 xl:col-span-7 flex flex-col w-full h-full">
            <DayWeatherOverviewCard
              weather={weather}
              daily={daily}
              hourly={hourly}
              tempUnit={tempUnit}
              seniorMode={seniorMode}
            />
          </div>
        </div>
      </div>

      {/* Module de Fiabilisation & Calibrage Température Observée en Temps Réel */}
      <TemperatureReliabilityCalibrationCard
        station={station}
        currentWeather={weather}
        tempUnit={tempUnit}
        onRecalibrate={onRecalibrate}
        onReset={onResetRecalibration}
      />

      {/* ========================================================================= */}
      {/* 2. CONTENU DU PROFIL SÉLECTIONNÉ (CLASSIQUE / AGRICULTURE / AVIATION / PRO) */}
      {/* ========================================================================= */}

      {/* PROFIL 1 : CHAÎNE MÉTÉO (CLASSIQUE - CLARTÉ & EN UN COUP D'ŒIL) */}
      {activeProfileTab === 'classic' && (
        <div className="space-y-6">
          {/* Prévisions du jour et à 7 jours */}
          <div id="realtime-forecast-week" className="scroll-mt-28">
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

          {/* Jauges & indicateurs synoptiques (Humidité, Vent, UV, AQI, Pression, Pluie) */}
          <div id="realtime-indicators" className="scroll-mt-28">
            <div className="mb-4 flex items-center justify-between">
              <h3 className={`font-bold text-slate-200 ${seniorMode ? 'text-2xl' : 'text-lg'}`}>
                Indicateurs &amp; Précision Météorologique
              </h3>
              <span className="text-xs text-slate-400">Relevé mis à jour en direct</span>
            </div>

            <div className={`grid grid-cols-1 sm:grid-cols-2 ${simplifiedMode ? 'lg:grid-cols-5' : 'lg:grid-cols-3'} gap-4`}>
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
            </div>
          </div>

          {/* Éphéméride & Vie Quotidienne */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <EphemerisCard weather={weather} seniorMode={seniorMode} />
            <OutdoorIndicesCard weather={weather} station={station} seniorMode={seniorMode} />
          </div>

          {/* Nowcasting précipitations direct */}
          <div id="realtime-precipitation" className="scroll-mt-28">
            <GigaPrecipitationNowcastingCard
              weather={weather}
              station={station}
              hourly={hourly}
              daily={daily}
              seniorMode={seniorMode}
            />
          </div>

          {/* Partenaire Météo & Sécurité Extérieure IMOU (Masqué en mode simplifié) */}
          {!simplifiedMode && (
            <ImouWeatherSecurityBanner
              weather={weather}
              station={station}
              seniorMode={seniorMode}
            />
          )}

          {/* Blocs experts avancés (collapsibles via "Voir plus" en mode standard) */}
          {!simplifiedMode && (
            <div className="space-y-6 pt-2">
              <div className="flex justify-center">
                <button
                  id="realtime-see-more-toggle-btn"
                  onClick={() => setShowMoreObservatories(!showMoreObservatories)}
                  className="flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-900/60 via-slate-900 to-indigo-900/60 border border-blue-500/40 text-blue-200 hover:text-white hover:border-blue-400 hover:scale-[1.02] shadow-xl transition active:scale-95 cursor-pointer font-bold text-sm"
                >
                  <span>
                    {showMoreObservatories
                      ? "Masquer les données & observatoires détaillés"
                      : "Voir plus (Radiographie certifiée, Nuages 48h, Gelées, Gradient vertical)"}
                  </span>
                  <ChevronDown 
                    className={`h-5 w-5 transition-transform duration-300 ${
                      showMoreObservatories ? 'rotate-180 text-cyan-300' : 'text-blue-400 animate-bounce'
                    }`} 
                  />
                </button>
              </div>

              {showMoreObservatories && (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300 border-t border-slate-800/80 pt-6">
                  {/* Radiographie complète des données météorologiques certifiées */}
                  <div id="realtime-certified-precision" className="scroll-mt-28">
                    <CertifiedPrecisionMeteoHub
                      weather={weather}
                      station={station}
                      seniorMode={seniorMode}
                      tempUnit={tempUnit}
                    />
                  </div>

                  {/* Observatoires Spécialisés */}
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Observatoires Spécialisés :</span>
                      <button
                        onClick={() => setActiveWinterModule(activeWinterModule === 'CLOUD' ? 'NONE' : 'CLOUD')}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer border ${
                          activeWinterModule === 'CLOUD'
                            ? 'bg-sky-500 text-slate-950 border-sky-400 shadow-md shadow-sky-500/20'
                            : 'bg-slate-900/80 text-sky-300 border-sky-800/40 hover:bg-slate-800'
                        }`}
                      >
                        ☁️ Observatoire Néphologique &amp; Nuages 48h
                      </button>

                      <button
                        onClick={() => setActiveWinterModule(activeWinterModule === 'FROST' ? 'NONE' : 'FROST')}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer border ${
                          activeWinterModule === 'FROST'
                            ? 'bg-indigo-500 text-slate-950 border-indigo-400 shadow-md shadow-indigo-500/20'
                            : 'bg-slate-900/80 text-indigo-300 border-indigo-800/40 hover:bg-slate-800'
                        }`}
                      >
                        🧊 Gelées &amp; Grands Froids (5 Paliers)
                      </button>

                      <button
                        onClick={() => setActiveWinterModule(activeWinterModule === 'ALTITUDE' ? 'NONE' : 'ALTITUDE')}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer border ${
                          activeWinterModule === 'ALTITUDE'
                            ? 'bg-blue-500 text-slate-950 border-blue-400 shadow-md shadow-blue-500/20'
                            : 'bg-slate-900/80 text-blue-300 border-blue-800/40 hover:bg-slate-800'
                        }`}
                      >
                        ⛰️ Isotherme 0°C &amp; Gradient Vertical
                      </button>
                    </div>

                    {activeWinterModule === 'CLOUD' && (
                      <div className="animate-in fade-in duration-200">
                        <CloudNephologyObservatoryCard
                          station={station}
                          weather={weather}
                          hourlyForecasts={hourly}
                          seniorMode={seniorMode}
                          tempUnit={tempUnit}
                          simplifiedMode={simplifiedMode}
                        />
                      </div>
                    )}

                    {activeWinterModule === 'FROST' && (
                      <div className="animate-in fade-in duration-200">
                        <FrostAndColdObservatoryCard
                          station={station}
                          seniorMode={seniorMode}
                          tempUnit={tempUnit}
                        />
                      </div>
                    )}

                    {activeWinterModule === 'ALTITUDE' && (
                      <div className="animate-in fade-in duration-200">
                        <AltitudeMeteorologyCard
                          station={station}
                          weather={weather}
                          seniorMode={seniorMode}
                        />
                      </div>
                    )}
                  </div>

                  {/* Radiographie complète des conditions atmosphériques */}
                  <div id="realtime-deep-conditions" className="scroll-mt-28">
                    <DeepWeatherConditionsCard
                      weather={weather}
                      station={station}
                      seniorMode={seniorMode}
                      tempUnit={tempUnit}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* PROFIL 2 : AGRO-MÉTÉO (PULVÉRISATION ΔT, SOLS 4 PROFONDEURS, ET0, GELÉES, GDD) */}
      {activeProfileTab === 'agriculture' && (
        <div className="space-y-6">
          <AgricultureWeatherCard
            station={station}
            weather={weather}
            hourly={hourly}
            daily={daily}
            seniorMode={seniorMode}
            tempUnit={tempUnit}
          />

          <div className="scroll-mt-28">
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
        <div className="space-y-6">
          <AviationWeatherCard
            station={station}
            weather={weather}
            hourly={hourly}
            daily={daily}
            seniorMode={seniorMode}
            tempUnit={tempUnit}
          />

          <div id="realtime-precipitation-aviation" className="scroll-mt-28">
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
        <div className="space-y-6">
          <ProfessionalMeteoCard
            station={station}
            weather={weather}
            hourly={hourly}
            daily={daily}
            seniorMode={seniorMode}
            tempUnit={tempUnit}
          />

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
      )}

      {/* ========================================================================= */}
      {/* 3. HUBS DE NAVIGATION RAPIDE & INSTALLATION (DISPONIBLES SUR TOUS PROFILS) */}
      {/* ========================================================================= */}
      <div id="realtime-more-forecast" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 scroll-mt-28 pt-2">
        <button
          onClick={() => onNavigateTab && onNavigateTab('vigilance')}
          className="flex items-center gap-3 p-4 rounded-2xl border border-rose-500/30 bg-gradient-to-br from-rose-950/40 to-slate-900/80 hover:border-rose-400 hover:scale-[1.01] transition text-left group shadow-lg cursor-pointer"
        >
          <div className="rounded-xl bg-rose-600/20 p-2.5 text-rose-400 border border-rose-500/30 group-hover:bg-rose-600 group-hover:text-white transition">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Météo-France (5 min)</span>
            <h4 className="text-sm font-black text-white group-hover:text-rose-300">Vigilances &amp; Alertes</h4>
            <p className="text-[11px] text-slate-400">Matrice des 12 risques</p>
          </div>
        </button>

        <button
          onClick={() => onNavigateTab && onNavigateTab('thirtyDays')}
          className="flex items-center gap-3 p-4 rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-950/40 to-slate-900/80 hover:border-blue-400 hover:scale-[1.01] transition text-left group shadow-lg cursor-pointer"
        >
          <div className="rounded-xl bg-blue-600/20 p-2.5 text-blue-400 border border-blue-500/30 group-hover:bg-blue-600 group-hover:text-white transition">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">Sub-saisonnier</span>
            <h4 className="text-sm font-black text-white group-hover:text-blue-300">Prévisions 30 Jours</h4>
            <p className="text-[11px] text-slate-400">Calendrier jour par jour</p>
          </div>
        </button>

        <button
          onClick={() => onNavigateTab && onNavigateTab('eightMonths')}
          className="flex items-center gap-3 p-4 rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/50 to-slate-900/80 hover:border-indigo-400 hover:scale-[1.01] transition text-left group shadow-lg cursor-pointer"
        >
          <div className="rounded-xl bg-indigo-600/20 p-2.5 text-indigo-400 border border-indigo-500/30 group-hover:bg-indigo-600 group-hover:text-white transition">
            <Globe className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">24 Décades • 240 Jours</span>
            <h4 className="text-sm font-black text-white group-hover:text-indigo-300">Tendances 8 Mois</h4>
            <p className="text-[11px] text-slate-400">Département / Région / Pays</p>
          </div>
        </button>

        <button
          onClick={() => onNavigateTab && onNavigateTab('radar')}
          className="flex items-center gap-3 p-4 rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/40 to-slate-900/80 hover:border-cyan-400 hover:scale-[1.01] transition text-left group shadow-lg cursor-pointer"
        >
          <div className="rounded-xl bg-cyan-600/20 p-2.5 text-cyan-400 border border-cyan-500/30 group-hover:bg-cyan-600 group-hover:text-white transition">
            <Radar className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">ARAMIS &amp; Satellite HD</span>
            <h4 className="text-sm font-black text-white group-hover:text-cyan-300">Giga Radar de Pluie</h4>
            <p className="text-[11px] text-slate-400">Échos précipitations direct</p>
          </div>
        </button>
      </div>

      {/* Quick Action & Windows/Mobile Install / Fullscreen Banner */}
      <div id="realtime-download" className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:px-5 flex flex-wrap items-center justify-between gap-4 shadow-md scroll-mt-28">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <Monitor className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">Application Instant Météo</span>
              <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                Windows, Android &amp; iOS
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Installation sur PC Windows, package APK Android ou application mobile progressive.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <a
            href="/Instant-Meteo-Windows.cmd"
            download="Instant-Meteo-Windows.cmd"
            title="Télécharger le lanceur autonome pour Windows"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow-sm active:scale-95 cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Windows (.cmd)</span>
          </a>

          <a
            href="/Instant-Meteo.apk"
            download="Instant-Meteo.apk"
            title="Télécharger le package APK direct pour smartphone Android"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition shadow-sm active:scale-95 cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Android APK</span>
          </a>

          {onOpenInstallModal && (
            <button
              onClick={onOpenInstallModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-slate-300 font-medium text-xs border border-slate-700/60 transition cursor-pointer"
            >
              <QrCode className="h-3.5 w-3.5 text-blue-400" />
              <span>Guide &amp; Options</span>
            </button>
          )}

          {onToggleFullscreen && (
            <button
              onClick={onToggleFullscreen}
              title="Activer ou quitter le mode grand écran (F11)"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs border transition cursor-pointer ${
                isFullscreen
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                  : 'bg-slate-800/80 border-slate-700/60 text-slate-300 hover:text-white'
              }`}
            >
              {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
              <span className="hidden md:inline">{isFullscreen ? 'Quitter Plein Écran' : 'Plein Écran'}</span>
            </button>
          )}
        </div>
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
    </div>
  );
};
