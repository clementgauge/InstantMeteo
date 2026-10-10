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
import { GrandDayAndWeekDetailedForecastCard } from './GrandDayAndWeekDetailedForecastCard';
import { FranceMiniOverviewCard } from './FranceMiniOverviewCard';

interface DesktopWeatherHeroDashboardProps {
  station: LocationPoint;
  weather: CurrentWeather;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  anomaly: ClimateAnomaly;
  tempUnit: 'C' | 'F';
  seniorMode?: boolean;
  simplifiedMode?: boolean;
  isUsingCachedData?: boolean;
  cachedAt?: string;
  onSelectStation?: (station: LocationPoint) => void;
  onOpenSearchModal?: () => void;
  onOpenGigaRadar?: () => void;
  onNavigateTab?: (tab: string) => void;
  onLocateGps?: () => void;
  onOpenContradictionModal?: () => void;
  onOpenDayAnalyzer?: (dayIndex: number) => void;
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
  seniorMode = false,
  simplifiedMode = false,
  isUsingCachedData = false,
  cachedAt,
  onSelectStation,
  onOpenSearchModal,
  onOpenGigaRadar,
  onNavigateTab,
  onLocateGps,
  onOpenContradictionModal,
  onOpenDayAnalyzer,
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
    <div className="space-y-3.5 mb-3.5 select-none">
      {/* ========================================================================= */}
      {/* 1. TOP ROW: HERO CARD (7 COLS) + LIVE MAP & CALIBRATION (5 COLS)          */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-12 gap-3.5 items-stretch">
        <div className="hidden sm:flex col-span-12 lg:col-span-7 scenic-hero-card relative overflow-hidden rounded-[28px] border border-slate-700/70 bg-[#071120] text-white shadow-2xl flex-col">
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
              {/* Palette fonctionnelle stricte : Vert = flux en direct sain / Ambre discret = Données en cache */}
              <div className="flex items-center justify-end gap-1.5 pt-0.5">
                {isUsingCachedData ? (
                  <div
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-950/75 border border-amber-500/40 text-amber-300 shadow-sm backdrop-blur-sm"
                    title="Connexion interrompue : affichage de la dernière météo enregistrée en cache local"
                  >
                    <span className="inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
                    <span className="text-[10px] font-bold tracking-wide">
                      Données en cache{cachedAt ? ` (${cachedAt})` : ''}
                    </span>
                  </div>
                ) : (
                  <>
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                      EN DIRECT
                    </span>
                  </>
                )}
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

        {/* Right Column of Row 1: Interactive Map filling full height alongside Hero Card */}
        <div className="col-span-12 lg:col-span-5 flex flex-col justify-between">
          <div id="realtime-national-overview-mini" className="scroll-mt-28 w-full flex-1 flex flex-col [&>div]:flex-1 [&>div]:flex [&>div]:flex-col [&>div]:justify-between">
            <FranceMiniOverviewCard
              currentStation={station}
              tempUnit={tempUnit}
              onSelectStation={onSelectStation}
              onOpenSearchModal={onOpenSearchModal}
              onNavigateTab={onNavigateTab}
            />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SECOND ROW: PRÉVISIONS HEURE PAR HEURE (8 COLS) + SOLEIL & LUNE (4 COLS) */}
      {/* ========================================================================= */}
      <div className="hidden sm:grid grid-cols-12 gap-3.5 items-stretch">
        <div id="realtime-forecast-week" className="col-span-12 xl:col-span-8 flex flex-col [&>div]:flex-1 min-w-0 scroll-mt-28">
          <GrandDayAndWeekDetailedForecastCard
            station={station}
            weather={weather}
            hourly={hourly}
            daily={daily}
            seniorMode={seniorMode}
            simplifiedMode={simplifiedMode}
            tempUnit={tempUnit}
            onOpenDayAnalyzer={onOpenDayAnalyzer}
          />
        </div>

        {/* Right Column of Row 2: Soleil & Lune (Astronomie Vérifiée & Temps Réel) */}
        {(() => {
          const eph = weather.solarEphemeris;
          const moon = weather.moonPhase;
          const progressPct = eph?.sunProgressPercent ?? (weather.isDay ? 55 : 100);
          const isSunUp = eph?.isSunAboveHorizon ?? (weather.isDay ?? true);
          // Quadratic Bezier curve M 15 55 Q 80 -10 145 55 parameter t in [0, 1]
          const t = Math.max(0, Math.min(1, progressPct / 100));
          const oneMinusT = 1 - t;
          const sunCx = Number((oneMinusT * oneMinusT * 15 + 2 * oneMinusT * t * 80 + t * t * 145).toFixed(1));
          const sunCy = Number((oneMinusT * oneMinusT * 55 + 2 * oneMinusT * t * -10 + t * t * 55).toFixed(1));
          const illum = moon?.illuminationPercent ?? 50;
          const phaseCode = moon?.phaseCode || 'first_quarter';
          const dayDelta = eph?.dayLengthChangeMinutes ?? 0;

          return (
            <div className="col-span-12 xl:col-span-4 rounded-[24px] border border-slate-800/90 bg-[#0c1424]/95 p-5 shadow-xl flex flex-col justify-between">
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                    <Sun className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white tracking-wide leading-tight">
                      Soleil &amp; Lune
                    </h3>
                    <span className="text-[10px] text-slate-400 block">
                      Midi solaire : {eph?.solarNoon || '13:48'} • Élév. max {eph?.maxSolarElevationDeg ?? 46}°
                    </span>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  dayDelta >= 0
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                }`}>
                  {dayDelta > 0 ? `+${dayDelta}` : dayDelta} min/j
                </span>
              </div>

              {/* Top Half: Dynamic Sun Trajectory Arc */}
              <div className="relative py-1.5">
                <div className="h-16 relative flex items-center justify-center">
                  <svg viewBox="0 0 160 64" className="w-full h-full overflow-visible">
                    <defs>
                      <linearGradient id="sunArcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.9" />
                        <stop offset="50%" stopColor="#fde047" stopOpacity="1" />
                        <stop offset="100%" stopColor="#fb923c" stopOpacity="0.9" />
                      </linearGradient>
                    </defs>
                    {/* Horizon baseline */}
                    <line x1="8" y1="55" x2="152" y2="55" stroke="#1e293b" strokeWidth="1" />
                    {/* Full Dotted Arch */}
                    <path
                      d="M 15 55 Q 80 -10 145 55"
                      fill="none"
                      stroke="#475569"
                      strokeWidth="1.75"
                      strokeDasharray="3 3"
                    />
                    {/* Illuminated Progressed Arc */}
                    {progressPct > 0 && (
                      <path
                        d="M 15 55 Q 80 -10 145 55"
                        fill="none"
                        stroke="url(#sunArcGrad)"
                        strokeWidth="2.5"
                        pathLength={100}
                        strokeDasharray={`${progressPct} 100`}
                        strokeLinecap="round"
                      />
                    )}
                    {/* Sunrise & Sunset Horizon Nodes */}
                    <circle cx="15" cy="55" r="2.5" fill="#fbbf24" />
                    <circle cx="145" cy="55" r="2.5" fill="#fb923c" />
                    {/* Active Sun / Night Moon Position along the exact trajectory */}
                    {isSunUp ? (
                      <g>
                        <circle cx={sunCx} cy={sunCy} r="12" fill="#f59e0b" opacity="0.25" />
                        <circle cx={sunCx} cy={sunCy} r="6.5" fill="#fbbf24" stroke="#fef08a" strokeWidth="1.5" />
                      </g>
                    ) : (
                      <g>
                        <circle cx="80" cy="24" r="10" fill="#38bdf8" opacity="0.18" />
                        <circle cx="80" cy="24" r="5.5" fill="#bae6fd" />
                      </g>
                    )}
                  </svg>
                </div>

                <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 px-1">
                  <div>
                    <span className="text-slate-400 text-[9px] block">Lever réel</span>
                    <span className="font-mono text-amber-300">{eph?.sunrise || '07:54'}</span>
                  </div>
                  <div className="text-center px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/30 text-[10px] text-amber-300 font-bold">
                    ☀️ {eph?.dayLengthFormatted || '11h 19min'} ({progressPct}%)
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 text-[9px] block">Coucher réel</span>
                    <span className="font-mono text-orange-300">{eph?.sunset || '19:13'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 px-1 mt-1 font-mono">
                  <span>🌅 Aube : {eph?.civilTwilightBegin || '07:22'}</span>
                  <span>✨ Crépuscule : {eph?.civilTwilightEnd || '19:45'}</span>
                </div>
              </div>

              {/* Bottom Half: Accurate Lunar Section */}
              <div className="pt-2.5 border-t border-slate-800/80 flex items-center gap-3">
                {/* Accurate Dynamic Moon Phase Visual */}
                <div className="relative w-12 h-12 rounded-full bg-slate-950 border border-slate-700/80 flex items-center justify-center shrink-0 shadow-inner">
                  <span className="text-2xl select-none" aria-hidden="true">
                    {phaseCode === 'new_moon'
                      ? '🌑'
                      : phaseCode === 'waxing_crescent'
                        ? '🌒'
                        : phaseCode === 'first_quarter'
                          ? '🌓'
                          : phaseCode === 'waxing_gibbous'
                            ? '🌔'
                            : phaseCode === 'full_moon'
                              ? '🌕'
                              : phaseCode === 'waning_gibbous'
                                ? '🌖'
                                : phaseCode === 'last_quarter'
                                  ? '🌗'
                                  : '🌘'}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-black text-white truncate">
                      {moon?.phaseName || 'Cycle lunaire'}
                    </span>
                    <span className="text-[10px] font-bold text-sky-300 bg-sky-500/15 border border-sky-500/30 px-1.5 py-0.5 rounded-md shrink-0">
                      {illum}% éclairée
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                    Âge : <strong className="text-slate-200">{moon?.moonAgeDays ?? 14} j</strong> / 29.5j • Signe : <strong className="text-sky-300">{moon?.moonSign || 'Taureau'}</strong>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-0.5 font-mono">
                    <span>🌙 Lever {moon?.moonrise || '21:15'} • Coucher {moon?.moonset || '10:40'}</span>
                    {moon?.nextFullMoonDate && (
                      <span className="text-amber-300 font-sans font-semibold">🌕 Pleine : {moon.nextFullMoonDate}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};
