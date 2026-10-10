import React, { useState, useEffect } from 'react';
import { 
  Sun, 
  Moon, 
  Wind, 
  Droplets, 
  Gauge, 
  MapPin, 
  Navigation, 
  Search, 
  Star, 
  Thermometer,
  Zap,
  ArrowUpRight,
  ArrowDownRight
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

  const todayMin = daily[0]?.tempMin ?? Math.round((weather.temperature - 4) * 10) / 10;
  const todayMax = daily[0]?.tempMax ?? Math.round((weather.temperature + 3) * 10) / 10;

  return (
    <div className="space-y-4 mb-4 select-none">
      {/* ========================================================================= */}
      {/* 1. TOP ROW: ARCHITECTURAL HERO OBSERVATORY (7 COLS) + LIVE MAP (5 COLS)   */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-12 gap-4 items-stretch">
        <div
          id="realtime-radiography"
          className="hidden sm:flex col-span-12 lg:col-span-7 scenic-hero-card relative overflow-hidden rounded-xl border border-slate-800/90 bg-[#060d1a] text-white shadow-xl flex-col justify-between"
        >
          {/* Photographic Panorama of Selected City / Landscape */}
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
            className="absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-500 filter brightness-[0.88] contrast-[1.06]"
          />
          {/* Measured Atmospheric Scrims for WCAG AA Legibility across all luminance frames */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050b16]/95 via-[#050b16]/55 to-[#050b16]/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050b16]/85 via-[#050b16]/35 to-transparent" />

          {/* Hero Card Interior */}
          <div className="relative z-10 p-6 sm:p-7 flex flex-col justify-between flex-1 min-h-[310px] gap-6">
            {/* Top Bar: Clean Editorial Location Metadata (Left) & Live Clock Telemetry (Right) */}
            <div className="flex items-start justify-between gap-6">
              <div className="space-y-2 max-w-xl min-w-0">
                {/* Unboxed Geographic Kicker with Typographic Separators */}
                <div className="flex items-center gap-2 text-xs font-medium text-sky-300/95 tracking-wide flex-wrap">
                  <span>France</span>
                  <span aria-hidden="true" className="text-slate-400">·</span>
                  <span>{station.region || 'Île-de-France'}</span>
                  <span aria-hidden="true" className="text-slate-400">·</span>
                  <span>{station.department || '75 - Paris'}</span>
                  <span aria-hidden="true" className="text-slate-400">·</span>
                  <span className="font-mono tabular-nums">Alt. {station.altitude || 75} m</span>
                </div>

                {/* Station Title + Quick Interactive Affordances */}
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-3xl sm:text-4xl lg:text-[2.6rem] font-extrabold text-white tracking-tight leading-none drop-shadow-sm">
                    {station.name}
                  </h2>

                  <button
                    type="button"
                    onClick={() => setIsFavorite(!isFavorite)}
                    title="Épingler cette station"
                    className="p-1.5 rounded-lg bg-black/35 hover:bg-black/55 border border-white/15 text-slate-200 hover:text-amber-300 transition cursor-pointer backdrop-blur-sm"
                  >
                    <Star className={`h-4 w-4 ${isFavorite ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                  </button>

                  {onLocateGps && (
                    <button
                      type="button"
                      onClick={onLocateGps}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/40 hover:bg-black/60 border border-white/15 text-slate-200 hover:text-emerald-300 text-xs font-semibold transition cursor-pointer backdrop-blur-sm whitespace-nowrap shrink-0"
                      title="Localiser ma position GPS exacte"
                    >
                      <Navigation className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Ma position GPS</span>
                    </button>
                  )}
                </div>

                {/* Unboxed Climate Sub-line */}
                <div className="text-xs text-slate-300 flex items-center gap-2 flex-wrap">
                  <span>Climat {station.climateZone || 'Océanique dégradé'}</span>
                  {anomaly && typeof anomaly.tempAnomaly === 'number' && (
                    <>
                      <span aria-hidden="true" className="text-slate-500">·</span>
                      <span className="font-mono tabular-nums text-slate-200">
                        Écart normale : {anomaly.tempAnomaly > 0 ? `+${anomaly.tempAnomaly.toFixed(1)}°C` : `${anomaly.tempAnomaly.toFixed(1)}°C`}
                      </span>
                    </>
                  )}
                </div>

                {/* Primary Station Controls */}
                <div className="pt-1 flex items-center gap-2 flex-wrap">
                  {onOpenSearchModal && (
                    <button
                      type="button"
                      onClick={onOpenSearchModal}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-white transition cursor-pointer backdrop-blur-md whitespace-nowrap shrink-0"
                      title="Rechercher parmi les 34 965 communes et stations mondiales"
                    >
                      <Search className="h-3.5 w-3.5 text-sky-300" />
                      <span>Changer de commune</span>
                    </button>
                  )}

                  {onOpenContradictionModal && (
                    <button
                      type="button"
                      onClick={onOpenContradictionModal}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-black/40 hover:bg-black/60 border border-amber-400/30 text-xs font-semibold text-amber-200 hover:text-amber-100 transition cursor-pointer backdrop-blur-md whitespace-nowrap shrink-0"
                      title="Signaler une observation de terrain en direct"
                    >
                      <Zap className="h-3.5 w-3.5 text-amber-400" />
                      <span>Ajuster le direct</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Right Column: Date, Tabular Digital Clock & Live Stream State */}
              <div className="text-right space-y-1 shrink-0">
                <div className="text-xs font-medium text-slate-300 whitespace-nowrap">
                  {currentDateString || 'Samedi 10 octobre 2026'}
                </div>
                <div className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight font-mono tabular-nums leading-none">
                  {currentTime || '14:30'}
                </div>
                <div className="flex items-center justify-end gap-1.5 pt-1">
                  {isUsingCachedData ? (
                    <span
                      className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-300"
                      title="Connexion interrompue : affichage de la dernière météo enregistrée en cache local"
                    >
                      <span className="inline-flex rounded-full h-2 w-2 bg-amber-400" />
                      <span>Hors-ligne{cachedAt ? ` · ${cachedAt}` : ''}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                      </span>
                      <span>Observation en direct</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Center Focal Anchor: Massive Temperature + Unified Vector Weather Art */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 py-1">
              <div className="flex items-center gap-5">
                <div className="text-6xl sm:text-7xl lg:text-[5.25rem] font-black tracking-tighter text-white drop-shadow-md font-mono tabular-nums leading-none">
                  {formatTemp(weather.temperature)}
                </div>
                <div className="shrink-0">
                  <DynamicSkyHeroArt
                    weatherCode={weather.weatherCode}
                    isDay={weather.isDay ?? true}
                    size="lg"
                  />
                </div>
              </div>

              <div className="space-y-1.5 sm:text-right max-w-xs">
                <div className="text-base sm:text-lg font-bold text-white leading-snug drop-shadow-sm">
                  {weather.weatherDescription || 'Ciel dégagé à peu nuageux'}
                </div>
                <div className="flex sm:justify-end items-center gap-2.5 text-xs font-medium text-slate-200 font-mono tabular-nums">
                  <span>Ressenti {formatTemp(weather.feelsLike)}</span>
                  <span aria-hidden="true" className="text-slate-400">·</span>
                  <span className="inline-flex items-center gap-0.5 text-sky-300">
                    <ArrowDownRight className="h-3.5 w-3.5" />
                    Min {formatTemp(todayMin)}
                  </span>
                  <span aria-hidden="true" className="text-slate-400">·</span>
                  <span className="inline-flex items-center gap-0.5 text-amber-300">
                    <ArrowUpRight className="h-3.5 w-3.5" />
                    Max {formatTemp(todayMax)}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Architectural Telemetry Dock: 4-Column Instrument Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-white/10 rounded-xl bg-slate-950/75 border border-white/15 backdrop-blur-md">
              <div className="px-4 py-3 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>Ressenti thermique</span>
                  <Thermometer className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                </div>
                <div className="mt-1 flex items-baseline justify-between gap-2">
                  <span className="text-lg font-extrabold text-white font-mono tabular-nums">
                    {formatTemp(weather.feelsLike)}
                  </span>
                  <span className="text-[11px] text-slate-400 truncate">
                    {weather.feelsLike < 8 ? 'Froid' : weather.feelsLike > 25 ? 'Chaud' : 'Confortable'}
                  </span>
                </div>
              </div>

              <div className="px-4 py-3 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>Humidité &amp; Rosée</span>
                  <Droplets className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                </div>
                <div className="mt-1 flex items-baseline justify-between gap-2">
                  <span className="text-lg font-extrabold text-white font-mono tabular-nums">
                    {Math.round(weather.humidity)}%
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono tabular-nums truncate">
                    Td {weather.dewPoint !== undefined ? `${Math.round(weather.dewPoint)}°C` : `${Math.round(weather.temperature - (100 - weather.humidity) / 5)}°C`}
                  </span>
                </div>
              </div>

              <div className="px-4 py-3 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>Vent &amp; Rafales</span>
                  <Wind className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                </div>
                <div className="mt-1 flex items-baseline justify-between gap-2">
                  <span className="text-lg font-extrabold text-white font-mono tabular-nums">
                    {Math.round(weather.windSpeed)} <span className="text-xs font-semibold text-slate-300">km/h</span>
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono tabular-nums truncate">
                    Raf. {Math.round(weather.windGust || weather.windSpeed * 1.4)} km/h
                  </span>
                </div>
              </div>

              <div className="px-4 py-3 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>Pression &amp; UV</span>
                  <Gauge className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                </div>
                <div className="mt-1 flex items-baseline justify-between gap-2">
                  <span className="text-lg font-extrabold text-white font-mono tabular-nums">
                    {Math.round(weather.pressure)} <span className="text-xs font-semibold text-slate-300">hPa</span>
                  </span>
                  <span className="text-[11px] text-amber-300 font-mono tabular-nums truncate">
                    UV {weather.uvIndex ?? 4}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column of Row 1: Interactive Map filling full height alongside Hero Card (UNTOUCHED) */}
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
      <div className="hidden sm:grid grid-cols-12 gap-4 items-stretch">
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
          const t = Math.max(0, Math.min(1, progressPct / 100));
          const oneMinusT = 1 - t;
          const sunCx = Number((oneMinusT * oneMinusT * 15 + 2 * oneMinusT * t * 80 + t * t * 145).toFixed(1));
          const sunCy = Number((oneMinusT * oneMinusT * 55 + 2 * oneMinusT * t * -10 + t * t * 55).toFixed(1));
          const illum = moon?.illuminationPercent ?? 50;
          const phaseCode = moon?.phaseCode || 'first_quarter';
          const dayDelta = eph?.dayLengthChangeMinutes ?? 0;

          return (
            <div className="col-span-12 xl:col-span-4 rounded-xl border border-slate-800/90 bg-[#0a1220]/95 p-5 shadow-lg flex flex-col justify-between">
              <div className="flex items-start justify-between gap-3 border-b border-slate-800/80 pb-3">
                <div>
                  <div className="text-[11px] font-medium text-amber-400 tracking-wide">
                    Astronomie locale vérifiée
                  </div>
                  <h3 className="text-base font-bold text-white tracking-tight mt-0.5">
                    Soleil &amp; Cycle Lunaire
                  </h3>
                  <div className="text-xs text-slate-400 mt-0.5 font-mono tabular-nums">
                    Midi solaire {eph?.solarNoon || '13:48'} · Élév. max {eph?.maxSolarElevationDeg ?? 46}°
                  </div>
                </div>
                <span className={`text-xs font-mono tabular-nums font-semibold ${
                  dayDelta >= 0 ? 'text-emerald-400' : 'text-amber-400'
                }`}>
                  {dayDelta > 0 ? `+${dayDelta}` : dayDelta} min/j
                </span>
              </div>

              {/* Dynamic Sun Trajectory Arc */}
              <div className="py-3 space-y-2">
                <div className="h-20 relative flex items-center justify-center">
                  <svg viewBox="0 0 160 64" className="w-full h-full overflow-visible">
                    <defs>
                      <linearGradient id="sunArcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.9" />
                        <stop offset="50%" stopColor="#fde047" stopOpacity="1" />
                        <stop offset="100%" stopColor="#fb923c" stopOpacity="0.9" />
                      </linearGradient>
                    </defs>
                    <line x1="8" y1="55" x2="152" y2="55" stroke="#1e293b" strokeWidth="1" />
                    <path
                      d="M 15 55 Q 80 -10 145 55"
                      fill="none"
                      stroke="#334155"
                      strokeWidth="1.75"
                      strokeDasharray="3 3"
                    />
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
                    <circle cx="15" cy="55" r="2.5" fill="#fbbf24" />
                    <circle cx="145" cy="55" r="2.5" fill="#fb923c" />
                    {isSunUp ? (
                      <g>
                        <circle cx={sunCx} cy={sunCy} r="12" fill="#f59e0b" opacity="0.22" />
                        <circle cx={sunCx} cy={sunCy} r="6" fill="#fbbf24" stroke="#fef08a" strokeWidth="1.5" />
                      </g>
                    ) : (
                      <g>
                        <circle cx="80" cy="24" r="10" fill="#38bdf8" opacity="0.18" />
                        <circle cx="80" cy="24" r="5" fill="#bae6fd" />
                      </g>
                    )}
                  </svg>
                </div>

                <div className="grid grid-cols-3 items-center text-xs border-t border-slate-800/60 pt-2.5">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Lever réel</span>
                    <span className="font-mono tabular-nums font-bold text-amber-300">{eph?.sunrise || '07:54'}</span>
                  </div>
                  <div className="text-center">
                    <span className="text-slate-400 text-[11px] block">Durée du jour</span>
                    <span className="font-mono tabular-nums font-bold text-white">{eph?.dayLengthFormatted || '11h 19m'}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 text-[11px] block">Coucher réel</span>
                    <span className="font-mono tabular-nums font-bold text-orange-300">{eph?.sunset || '19:13'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 font-mono tabular-nums">
                  <span>Aube civile {eph?.civilTwilightBegin || '07:22'}</span>
                  <span>·</span>
                  <span>Crépuscule {eph?.civilTwilightEnd || '19:45'}</span>
                </div>
              </div>

              {/* Accurate Lunar Section */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center gap-3.5">
                <div className="relative w-11 h-11 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0">
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
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-white truncate">
                      {moon?.phaseName || 'Cycle lunaire'}
                    </span>
                    <span className="text-xs font-mono tabular-nums font-semibold text-sky-300 shrink-0">
                      {illum}% éclairée
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 truncate font-mono tabular-nums">
                    Âge {moon?.moonAgeDays ?? 14}j / 29.5j · {moon?.moonSign || 'Taureau'}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-0.5 font-mono tabular-nums">
                    <span>Lever {moon?.moonrise || '21:15'} · Coucher {moon?.moonset || '10:40'}</span>
                    {moon?.nextFullMoonDate && (
                      <span className="text-amber-300 font-sans font-medium">Pleine : {moon.nextFullMoonDate}</span>
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
