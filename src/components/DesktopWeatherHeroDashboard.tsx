import React, { useState, useEffect } from 'react';
import { 
  Sun, 
  Moon, 
  CloudRain, 
  Wind, 
  Droplets, 
  Gauge, 
  MapPin, 
  Navigation, 
  Search, 
  ChevronRight, 
  Radio, 
  Activity, 
  Calendar, 
  Compass, 
  TrendingUp, 
  Leaf, 
  ArrowDown, 
  ArrowUp, 
  User, 
  Star, 
  ZoomIn, 
  ZoomOut, 
  Crosshair,
  Thermometer,
  Flame,
  Check,
  Zap
} from 'lucide-react';
import { LocationPoint, CurrentWeather, HourlyForecast, DailyForecast, ClimateAnomaly } from '../types/weather';
import { getClientGeographicBackdrop, fetchCityRealPhoto } from '../utils/geoBackdrops';
import { DynamicSkyHeroArt } from './DynamicSkyHeroArt';
import { UnifiedHourly48hTrend } from './UnifiedHourly48hTrend';
import { FranceMiniOverviewCard } from './FranceMiniOverviewCard';
import { TemperatureReliabilityCalibrationCard } from './TemperatureReliabilityCalibrationCard';

interface DesktopWeatherHeroDashboardProps {
  station: LocationPoint;
  weather: CurrentWeather;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  anomaly: ClimateAnomaly;
  tempUnit: 'C' | 'F';
  onSelectStation?: (station: LocationPoint) => void;
  onOpenSearchModal?: () => void;
  onOpenGigaRadar?: () => void;
  onNavigateTab?: (tab: string) => void;
  onLocateGps?: () => void;
  onOpenContradictionModal?: () => void;
  onRecalibrate?: (offset: number) => void;
  onResetRecalibration?: () => void;
}

export const DesktopWeatherHeroDashboard: React.FC<DesktopWeatherHeroDashboardProps> = ({
  station,
  weather,
  hourly,
  daily,
  anomaly,
  tempUnit,
  onSelectStation,
  onOpenSearchModal,
  onOpenGigaRadar,
  onNavigateTab,
  onLocateGps,
  onOpenContradictionModal,
  onRecalibrate,
  onResetRecalibration
}) => {
  const [currentTime, setCurrentTime] = useState('');
  const [currentDateString, setCurrentDateString] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
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

    // Résolution multi-source asynchrone (Wikipedia REST API + Wikimedia + backend + terroir)
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
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
      
      const day = now.toLocaleDateString('fr-FR', { weekday: 'long' });
      const capitalizedDay = day.charAt(0).toUpperCase() + day.slice(1);
      const dateNum = now.getDate();
      const month = now.toLocaleDateString('fr-FR', { month: 'long' });
      const year = now.getFullYear();
      setCurrentDateString(`${capitalizedDay} ${dateNum} ${month} ${year}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  const formatTemp = (celsius: number) => {
    if (tempUnit === 'F') {
      return `${Math.round((celsius * 9/5 + 32) * 10) / 10}°F`;
    }
    const sign = celsius > 0 ? '+' : '';
    return `${sign}${Math.round(celsius * 10) / 10}°C`;
  };

  const formatSimpleTemp = (celsius: number) => {
    if (tempUnit === 'F') {
      return `${Math.round(celsius * 9/5 + 32)}°`;
    }
    const sign = celsius > 0 ? '+' : '';
    return `${sign}${Math.round(celsius * 10) / 10}°`;
  };

  const todayMin = daily[0]?.tempMin ?? Math.round((weather.temperature - 4) * 10) / 10;
  const todayMax = daily[0]?.tempMax ?? Math.round((weather.temperature + 3) * 10) / 10;

  // Radar region label
  const regionLabel = station.department?.split(' - ')[1] || station.region || 'Île-de-France';

  return (
    <div className="hidden sm:block space-y-3.5 mb-3.5 select-none">
      {/* ========================================================================= */}
      {/* 1. TOP ROW: HERO CARD (7 COLS) + LIVE MAP & CALIBRATION (5 COLS)          */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-12 gap-3.5 items-stretch">
        <div className="col-span-12 lg:col-span-7 scenic-hero-card relative overflow-hidden rounded-[28px] border border-slate-700/70 bg-[#071120] text-white shadow-2xl flex flex-col">
        {/* Photographic Panorama of Selected City / Landscape with no-referrer to prevent hotlinking blocks */}
        <img
          key={cityPhotoUrl}
          src={cityPhotoUrl}
          alt={`Panorama météo de ${station.name}`}
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
          className="absolute inset-0 w-full h-full object-cover object-center transition-all duration-700 filter brightness-[0.92] contrast-[1.05]"
        />
        {/* Soft, natural atmospheric vignette for optical depth and crisp text legibility - Never pitch black */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#071120]/95 via-[#071120]/45 to-[#071120]/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#071120]/85 via-transparent to-[#071120]/50" />

        {/* Hero Card Interior */}
        <div className="relative z-10 p-5 sm:p-6 flex flex-col justify-between flex-1 min-h-[270px]">
          {/* Top Row: Location & Actions (Left) / Date & Live Digital Clock (Right) */}
          <div className="flex items-start justify-between gap-4">
            {/* Left Header Group */}
            <div className="space-y-1.5 max-w-xl">
              {/* Region Pill */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-950/70 border border-blue-500/30 text-[10px] font-black uppercase tracking-wider text-sky-300">
                <span>🇫🇷 FRANCE ({station.region ? station.region.toUpperCase() : 'ÎLE-DE-FRANCE'})</span>
              </div>

              {/* Station Name + Favorite Star + GPS Button */}
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight drop-shadow-md">
                  {station.name}
                </h2>
                
                {/* Favorite Star */}
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  title="Ajouter aux favoris"
                  className="p-1 rounded-full text-slate-300 hover:text-amber-300 transition active:scale-95"
                >
                  <Star className={`h-5 w-5 ${isFavorite ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                </button>

                {/* GPS Button */}
                {onLocateGps && (
                  <button
                    onClick={onLocateGps}
                    className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/40 hover:bg-black/60 border border-white/15 text-slate-300 hover:text-emerald-300 text-[11px] font-medium transition active:scale-95"
                    title="Se localiser via le GPS"
                  >
                    <Navigation className="h-3 w-3 text-emerald-400 fill-emerald-400/20" />
                    <span>GPS</span>
                  </button>
                )}
              </div>

              {/* Sub-info: Department & Altitude */}
              <div className="text-xs text-slate-300 flex items-center gap-2">
                <span>{station.department || '75 - Paris'}</span>
                <span>•</span>
                <span>Altitude : {station.altitude || 75} m</span>
              </div>

              {/* Sub-info: Climate Zone */}
              <div className="text-xs text-slate-400">
                Climat : {station.climateZone || 'Océanique dégradé / Îlot de chaleur urbain'}
              </div>

              {/* Changer de station and Contredire buttons - Boutons secondaires allégés */}
              <div className="pt-1 flex items-center gap-1.5 flex-wrap">
                {onOpenSearchModal && (
                  <button
                    onClick={onOpenSearchModal}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/35 hover:bg-black/55 border border-white/15 text-[11px] font-medium text-slate-300 hover:text-white transition active:scale-95 cursor-pointer backdrop-blur-sm"
                    title="Rechercher une autre commune ou station"
                  >
                    <Search className="h-3 w-3 text-sky-400" />
                    <span>Changer de commune</span>
                  </button>
                )}

                {onOpenContradictionModal && (
                  <button
                    onClick={onOpenContradictionModal}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/35 hover:bg-black/55 border border-white/15 text-[11px] font-medium text-slate-300 hover:text-amber-200 transition active:scale-95 cursor-pointer backdrop-blur-sm"
                    title="Signaler un écart avec la météo observée et affiner les données avec votre observation de terrain"
                  >
                    <Zap className="h-3 w-3 text-amber-400" />
                    <span>Ajuster le direct</span>
                  </button>
                )}
              </div>
            </div>

            {/* Right Header Group: Date, Live Clock & Status */}
            <div className="text-right space-y-0.5 shrink-0">
              <div className="text-xs sm:text-sm font-medium text-slate-300">
                {currentDateString || 'Samedi 5 octobre 2024'}
              </div>
              <div className="text-4xl sm:text-5xl font-black text-white tracking-tight font-mono">
                {currentTime || '17:42'}
              </div>
              {/* Palette fonctionnelle stricte : Vert = statut positif / flux en direct sain */}
              <div className="flex items-center justify-end gap-1.5 pt-0.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                  EN DIRECT
                </span>
              </div>
            </div>
          </div>

          {/* Middle Row: Massive Temperature + 3D Sun Artwork + Stacked Right Metrics */}
          <div className="grid grid-cols-12 items-center gap-4 py-2">
            {/* Left: Huge Temperature and Description */}
            <div className="col-span-12 sm:col-span-5 space-y-1">
              <div className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white drop-shadow-lg tabular-nums">
                {formatTemp(weather.temperature)}
              </div>
              <div className="text-sm sm:text-base font-medium text-slate-200 max-w-sm drop-shadow-sm">
                {weather.weatherDescription || 'Ciel principalement clair avec quelques cirrus / voiles'}
              </div>
            </div>

            {/* Center: Dynamic Responsive 3D Sky Artwork matching exact condition */}
            <div className="hidden sm:flex col-span-3 items-center justify-center">
              <DynamicSkyHeroArt 
                weatherCode={weather.weatherCode} 
                isDay={weather.isDay ?? true} 
                size="lg" 
              />
            </div>

            {/* Right: Vertical Metric Stack */}
            <div className="col-span-12 sm:col-span-4 flex flex-col items-end justify-center space-y-2">
              {/* Humidité */}
              <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-slate-900/70 border border-slate-700/60 backdrop-blur-md min-w-[190px] justify-between shadow-sm">
                <div className="flex items-center gap-2 text-sky-400">
                  <Droplets className="h-4 w-4" />
                  <span className="text-xs text-slate-300">Humidité</span>
                </div>
                <span className="text-xs font-black text-white">{Math.round(weather.humidity)}%</span>
              </div>

              {/* Pression */}
              <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-slate-900/70 border border-slate-700/60 backdrop-blur-md min-w-[190px] justify-between shadow-sm">
                <div className="flex items-center gap-2 text-indigo-400">
                  <Gauge className="h-4 w-4" />
                  <span className="text-xs text-slate-300">Pression</span>
                </div>
                <span className="text-xs font-black text-white">{Math.round(weather.pressure)} hPa</span>
              </div>

              {/* Vent */}
              <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-slate-900/70 border border-slate-700/60 backdrop-blur-md min-w-[190px] justify-between shadow-sm">
                <div className="flex items-center gap-2 text-cyan-400">
                  <Wind className="h-4 w-4" />
                  <span className="text-xs text-slate-300">Vent</span>
                </div>
                <span className="text-xs font-black text-white">{Math.round(weather.windSpeed)} km/h {weather.windDirection || 'NNO'}</span>
              </div>
            </div>
          </div>

          {/* Bottom Row: 3 Metrics Pills (Ressenti / Min / Max) centered - Palette stricte : Rouge réservé aux alertes/dangers */}
          <div className="pt-2 flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
            {/* Ressenti - Neutre / Info */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/70 text-xs shadow-sm">
              <Thermometer className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-slate-400">Ressenti</span>
              <span className="font-bold text-slate-200">{formatTemp(weather.feelsLike)}</span>
            </div>

            {/* Min - Froid / Bleu */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-sky-500/40 text-xs shadow-sm">
              <Droplets className="h-3.5 w-3.5 text-sky-400" />
              <span className="text-slate-300">Min</span>
              <span className="font-bold text-sky-300">{formatTemp(todayMin)}</span>
            </div>

            {/* Max - Chaud / Ambre */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-amber-500/40 text-xs shadow-sm">
              <Flame className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-slate-300">Max</span>
              <span className="font-bold text-amber-300">{formatTemp(todayMax)}</span>
            </div>
          </div>
        </div>
        </div>

        {/* Right Column of Row 1: Interactive Map + Temperature Reliability Calibration */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-3 justify-between">
          <div id="realtime-national-overview-mini" className="scroll-mt-28 w-full flex-1 flex flex-col [&>div]:flex-1 [&>div]:flex [&>div]:flex-col [&>div]:justify-between">
            <FranceMiniOverviewCard
              currentStation={station}
              tempUnit={tempUnit}
              onSelectStation={onSelectStation}
              onOpenSearchModal={onOpenSearchModal}
              onNavigateTab={onNavigateTab}
            />
          </div>

          <TemperatureReliabilityCalibrationCard
            station={station}
            currentWeather={weather}
            tempUnit={tempUnit}
            onRecalibrate={onRecalibrate}
            onReset={onResetRecalibration}
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SECOND ROW: 48H FORECAST (5 COLS) + TENDANCE / SOLEIL / AIR (7 COLS)   */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-12 gap-3.5 items-stretch">
        <div className="col-span-12 xl:col-span-5 flex flex-col [&>div]:flex-1">
          {/* Unified 48h Hourly Forecast Card */}
          <UnifiedHourly48hTrend
            station={station}
            currentWeather={weather}
            hourly={hourly}
            tempUnit={tempUnit}
            onNavigateTab={onNavigateTab}
          />
        </div>

        <div className="col-span-12 xl:col-span-7 grid grid-cols-12 gap-3.5 items-stretch">
          {/* Card 1: Tendance de la journée */}
          <div className="col-span-12 lg:col-span-5 rounded-[24px] border border-slate-800/90 bg-[#0c1424]/95 p-4 sm:p-5 shadow-xl flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg bg-blue-500/20 text-sky-400">
              <TrendingUp className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-black text-white tracking-wide">
              Tendance de la journée
            </h3>
          </div>

          <div className="grid grid-cols-12 gap-3 items-center">
            {/* SVG Line Graph */}
            <div className="col-span-7 relative h-36 flex flex-col justify-between">
              {/* Y-axis marks */}
              <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[9px] text-slate-500 font-mono">
                <span>28°</span>
                <span>24°</span>
                <span>20°</span>
                <span>16°</span>
                <span>12°</span>
              </div>

              {/* Chart Canvas */}
              <div className="ml-6 mr-1 h-28 relative">
                <svg viewBox="0 0 200 90" className="w-full h-full overflow-visible">
                  {/* Horizontal grid lines */}
                  <line x1="0" y1="10" x2="200" y2="10" stroke="#1e293b" strokeDasharray="3 3" />
                  <line x1="0" y1="30" x2="200" y2="30" stroke="#1e293b" strokeDasharray="3 3" />
                  <line x1="0" y1="50" x2="200" y2="50" stroke="#1e293b" strokeDasharray="3 3" />
                  <line x1="0" y1="70" x2="200" y2="70" stroke="#1e293b" strokeDasharray="3 3" />

                  {/* Vertical "Maintenant" indicator */}
                  <line x1="140" y1="0" x2="140" y2="85" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="2 2" />

                  {/* Orange Curve: Température */}
                  <path
                    d="M 0 65 Q 40 60 70 45 T 140 25 T 200 40"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="2.5"
                  />
                  {/* Cyan Curve: Ressenti */}
                  <path
                    d="M 0 75 Q 40 70 70 55 T 140 35 T 200 50"
                    fill="none"
                    stroke="#0284c7"
                    strokeWidth="2"
                  />

                  {/* Points */}
                  <circle cx="140" cy="25" r="4" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
                  <circle cx="140" cy="35" r="3.5" fill="#0284c7" stroke="#ffffff" strokeWidth="1" />
                </svg>

                {/* Badge Maintenant */}
                <div className="absolute -top-3 left-[62%] -translate-x-1/2 px-2 py-0.5 rounded-full bg-blue-600 text-white text-[9px] font-bold shadow">
                  Maintenant
                </div>
              </div>

              {/* X-axis hours */}
              <div className="ml-6 flex items-center justify-between text-[9px] text-slate-400 font-mono">
                <span>00h</span>
                <span>03h</span>
                <span>06h</span>
                <span>09h</span>
                <span>12h</span>
                <span>15h</span>
                <span>18h</span>
                <span>21h</span>
              </div>
            </div>

            {/* Right Summary Metrics */}
            <div className="col-span-5 space-y-2 border-l border-slate-800/80 pl-3">
              <div>
                <div className="text-[10px] text-slate-400">Temp. actuelle</div>
                <div className="text-sm font-black text-white">{formatTemp(weather.temperature)}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400">Ressenti</div>
                <div className="text-sm font-black text-sky-400">{formatTemp(weather.feelsLike)}</div>
              </div>
              <div className="flex items-center gap-3">
                <div>
                  <div className="text-[10px] text-slate-400">Min</div>
                  <div className="text-xs font-black text-blue-400">{formatTemp(todayMin)}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Max</div>
                  <div className="text-xs font-black text-amber-400">{formatTemp(todayMax)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Legend */}
          <div className="mt-2 flex items-center gap-4 text-[10px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              <span>Température (°C)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-sky-500" />
              <span>Ressenti (°C)</span>
            </div>
          </div>
        </div>

        {/* Card 2: Soleil & Lune */}
        <div className="col-span-12 lg:col-span-4 rounded-[24px] border border-slate-800/90 bg-[#0c1424]/95 p-5 shadow-xl flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <Sun className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-black text-white tracking-wide">
              Soleil &amp; Lune
            </h3>
          </div>

          {/* Top Half: Sun Trajectory Arc */}
          <div className="relative py-2">
            <div className="h-16 relative flex items-center justify-center">
              <svg viewBox="0 0 160 60" className="w-full h-full overflow-visible">
                {/* Dotted Arch */}
                <path
                  d="M 15 55 Q 80 -10 145 55"
                  fill="none"
                  stroke="#475569"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />
                {/* Active Sun position */}
                <circle cx="110" cy="18" r="7" fill="#f59e0b" className="animate-pulse" />
                <circle cx="110" cy="18" r="12" fill="#f59e0b" opacity="0.25" />
              </svg>
            </div>

            <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 px-1">
              <div>
                <span className="text-slate-400 text-[9px] block">Lever</span>
                <span>07:54</span>
              </div>
              <div className="text-center px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/30 text-[10px] text-amber-300 font-bold">
                ☀️ 11h 19min
              </div>
              <div className="text-right">
                <span className="text-slate-400 text-[9px] block">Coucher</span>
                <span>19:13</span>
              </div>
            </div>
          </div>

          {/* Bottom Half: Moon Section */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center gap-3">
            {/* Crescent Moon Visual */}
            <div className="relative w-12 h-12 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0 overflow-hidden shadow-inner">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-400 to-slate-200 shadow-md" />
              <div className="absolute -top-1 -right-1 w-9 h-9 rounded-full bg-slate-900" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-white">Lune : 20% illuminée</div>
              <div className="text-[10px] text-slate-400">Dernier quartier</div>
              <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-0.5 font-mono">
                <span>🌅 02:18</span>
                <span>🌄 16:43</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Indices & Qualité de l'air */}
        <div className="col-span-12 lg:col-span-3 rounded-[24px] border border-slate-800/90 bg-[#0c1424]/95 p-5 shadow-xl flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Leaf className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-black text-white tracking-wide">
              Indices &amp; Qualité de l'air
            </h3>
          </div>

          {/* Circular AQI Gauge */}
          <div className="flex items-center gap-3 py-1">
            <div className="relative w-16 h-16 rounded-full border-4 border-emerald-500 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20 bg-emerald-950/20">
              <span className="text-xl font-black text-emerald-400">42</span>
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-slate-400">Qualité de l'air</div>
              <div className="text-sm font-black text-emerald-400 leading-tight">Bonne</div>
              <div className="text-[10px] text-slate-400 leading-snug">Peu de risque pour la santé</div>
            </div>
          </div>

          {/* 3 Metric Pills */}
          <div className="grid grid-cols-3 gap-1.5 pt-2">
            <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800/80 text-center">
              <span className="text-[9px] text-slate-400 block">UV</span>
              <span className="text-xs font-black text-amber-300">5.6</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800/80 text-center">
              <span className="text-[9px] text-slate-400 block">Rafales</span>
              <span className="text-xs font-black text-cyan-300">30 km/h</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800/80 text-center">
              <span className="text-[9px] text-slate-400 block">Pluie</span>
              <span className="text-xs font-black text-sky-300">0 mm</span>
            </div>
          </div>

          {/* Footer Link */}
          <div className="pt-2 text-center">
            <button
              onClick={() => onNavigateTab ? onNavigateTab('sportsActivities') : null}
              className="text-xs font-bold text-sky-400 hover:text-sky-300 transition"
            >
              Voir tous les indices →
            </button>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};
