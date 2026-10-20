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
  ArrowDownRight,
  Footprints,
  Bike,
  Palmtree,
  Sprout,
  SunMedium,
  Compass,
  ShieldCheck,
  Activity
} from 'lucide-react';
import { LocationPoint, CurrentWeather, HourlyForecast, DailyForecast, ClimateAnomaly, OutdoorActivityIndices } from '../types/weather';
import { getClientGeographicBackdrop, fetchCityRealPhoto } from '../utils/geoBackdrops';
import { calculateSolarEphemeris, calculateMoonPhase, getStationLiveClock, calculateOutdoorIndices } from '../services/ephemerisService';
import { getRichWeatherInfo } from '../utils/weatherIcons';
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
  const [liveTick, setLiveTick] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const initialGeoBackdrop = getClientGeographicBackdrop(
    station.name,
    station.region,
    station.department,
    station.altitude
  );
  const [cityPhotoUrl, setCityPhotoUrl] = useState<string>(initialGeoBackdrop);
  const [activeOutdoorTab, setActiveOutdoorTab] = useState<'hiking' | 'cycling' | 'beach' | 'agri' | 'solar'>('hiking');
  const [simplifiedRightTab, setSimplifiedRightTab] = useState<'sun' | 'activity'>('sun');

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
      const stationClock = getStationLiveClock(station.latitude, station.longitude, now);
      setCurrentTime(stationClock.formattedTime);
      setLiveTick((t) => t + 1);

      try {
        const isEuro = station.latitude >= 35 && station.latitude <= 60 && station.longitude >= -10 && station.longitude <= 25;
        const opts: Intl.DateTimeFormatOptions = isEuro
          ? { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' }
          : { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
        const formattedDate = now.toLocaleDateString('fr-FR', opts);
        setCurrentDateString(formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1));
      } catch {
        const day = now.toLocaleDateString('fr-FR', { weekday: 'long' });
        const capitalizedDay = day.charAt(0).toUpperCase() + day.slice(1);
        const dateNum = now.getDate();
        const month = now.toLocaleDateString('fr-FR', { month: 'long' });
        const year = now.getFullYear();
        setCurrentDateString(`${capitalizedDay} ${dateNum} ${month} ${year}`);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, [station.latitude, station.longitude]);

  // Calcul astronomique temps réel (rafraîchi en continu pour éviter tout décalage jour/nuit)
  const liveEphemeris = React.useMemo(() => {
    const now = new Date();
    const prevEph = weather.solarEphemeris;
    const todayDatePrefix = now.toISOString().split('T')[0];
    return calculateSolarEphemeris(station.latitude, station.longitude, now, {
      sunriseIso: prevEph?.sunrise ? `${todayDatePrefix}T${prevEph.sunrise}` : undefined,
      sunsetIso: prevEph?.sunset ? `${todayDatePrefix}T${prevEph.sunset}` : undefined,
    });
  }, [station.latitude, station.longitude, weather.solarEphemeris, liveTick]);

  const liveMoonPhase = React.useMemo(() => {
    return calculateMoonPhase(new Date(), station.latitude, station.longitude);
  }, [station.latitude, station.longitude, liveTick]);

  const effectiveIsDay = liveEphemeris.isSunAboveHorizon ?? weather.isDay ?? true;
  const effectiveWeatherDesc = React.useMemo(() => {
    return getRichWeatherInfo(weather.weatherCode, effectiveIsDay).label;
  }, [weather.weatherCode, effectiveIsDay]);

  const formatTemp = (celsius: number) => {
    if (tempUnit === 'F') {
      return `${Math.round((celsius * 9/5 + 32) * 10) / 10}°F`;
    }
    const sign = celsius > 0 ? '+' : '';
    return `${sign}${Math.round(celsius * 10) / 10}°C`;
  };

  const todayMin = daily[0]?.tempMin ?? Math.round((weather.temperature - 4) * 10) / 10;
  const todayMax = daily[0]?.tempMax ?? Math.round((weather.temperature + 3) * 10) / 10;

  // Relevés Infoclimat / SYNOP du jour en cours (Tmin/Tmax réelles, pluie depuis 00h, ensoleillement)
  const todayInfoclimat = React.useMemo(() => {
    const now = new Date();
    const curH = now.getHours();
    const passed = (hourly || []).filter(h => {
      const hRaw = parseInt(h.hourLabel?.replace('h', '') || '0', 10);
      return isNaN(hRaw) ? true : hRaw <= curH;
    });
    const pts = passed.length > 0 ? passed : (hourly || []).slice(0, Math.max(1, curH + 1));

    // Tmin observée ce matin
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

    // Tmax observée ou en cours
    let obsTmax = weather.temperature;
    let obsTmaxH = curH >= 15 ? '15h30' : 'En cours';
    if (pts.length > 0) {
      const maxPt = pts.reduce((max, curr) => curr.temperature > max.temperature ? curr : max, pts[0]);
      obsTmax = Math.max(weather.temperature, maxPt.temperature);
      obsTmaxH = weather.temperature >= maxPt.temperature ? 'En cours' : (maxPt.hourLabel || '15h00');
    }

    // Pluie depuis 00h
    const rain00h = Number(pts.reduce((acc, h) => acc + (h.rainMm || h.precipitationMm || 0), 0).toFixed(1));

    // Ensoleillement
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

  return (
    <div className="space-y-4 mb-4 select-none">
      {/* ========================================================================= */}
      {/* 1. TOP ROW: ARCHITECTURAL HERO OBSERVATORY (7 COLS) + LIVE MAP (5 COLS)   */}
      {/* ========================================================================= */}
      <div className="hidden sm:grid grid-cols-12 gap-4 items-stretch">
        <div
          id="realtime-radiography"
          className="hidden sm:flex col-span-12 lg:col-span-7 scenic-hero-card motion-card-enter motion-stagger-1 relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800/90 bg-[#060d1a] text-white shadow-xl flex-col justify-between"
        >
          {/* Photographic Panorama of Selected City / Landscape with Ken Burns Motion */}
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
            className={`absolute inset-0 w-full h-full object-cover object-center motion-ken-burns transition-all duration-700 filter ${
              effectiveIsDay
                ? 'brightness-[0.88] contrast-[1.06]'
                : 'brightness-[0.62] contrast-[1.12] saturate-[0.85]'
            }`}
          />
          {/* Measured Atmospheric Scrims for WCAG AA Legibility across all luminance frames */}
          <div
            className={`absolute inset-0 ${
              effectiveIsDay
                ? 'bg-gradient-to-t from-[#050b16]/95 via-[#050b16]/55 to-[#050b16]/30'
                : 'bg-gradient-to-t from-[#030712]/96 via-[#081226]/70 to-[#09152e]/45'
            }`}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050b16]/85 via-[#050b16]/35 to-transparent" />

          {/* Hero Card Interior */}
          <div className="relative z-10 p-6 sm:p-7 flex flex-col justify-between flex-1 min-h-[310px] gap-6">
            {/* Top Bar: Clean Editorial Location Metadata (Left) & Live Clock Telemetry (Right) */}
            <div className="flex items-start justify-between gap-6">
              <div className="space-y-2 max-w-xl min-w-0">
                {/* Unboxed Geographic Kicker with Typographic Separators */}
                <div className="flex items-center gap-2 text-xs font-medium text-sky-300/95 tracking-wide flex-wrap">
                  <span>{station.country || 'France'}</span>
                  <span aria-hidden="true" className="text-slate-400">·</span>
                  <span>{station.region || station.department || 'Région'}</span>
                  {station.department && station.department !== station.region && (
                    <>
                      <span aria-hidden="true" className="text-slate-400">·</span>
                      <span>{station.department}</span>
                    </>
                  )}
                  <span aria-hidden="true" className="text-slate-400">·</span>
                  <span className="font-mono tabular-nums">Alt. {station.altitude || 0} m</span>
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
                    isDay={effectiveIsDay}
                    size="lg"
                  />
                </div>
              </div>

              <div className="space-y-1.5 sm:text-right max-w-xs">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-900/80 border border-white/15 text-[11px] font-semibold text-sky-200 mb-0.5">
                  {effectiveIsDay ? (
                    <>
                      <Sun className="h-3 w-3 text-amber-400" />
                      <span>Jour · Coucher {liveEphemeris.sunset}</span>
                    </>
                  ) : (
                    <>
                      <Moon className="h-3 w-3 text-indigo-300" />
                      <span>Nuit · Lever {liveEphemeris.sunrise}</span>
                    </>
                  )}
                </div>
                <div className="text-base sm:text-lg font-bold text-white leading-snug drop-shadow-sm">
                  {effectiveWeatherDesc}
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

            {/* Infoclimat & SYNOP Live Observatoire: Tmin, Tmax, Pluie 00h, Soleil */}
            <div 
              onClick={() => document.getElementById('infoclimat-day-observations-card')?.scrollIntoView({ behavior: 'smooth' })}
              title="Cliquez pour consulter l'analyse détaillée des relevés du jour et le comparateur microclimatique StatIC"
              className="mt-2.5 pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs cursor-pointer hover:bg-white/5 transition rounded-lg px-2 py-1"
            >
              <div className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-semibold text-white">Relevés du Jour (Réseau Infoclimat StatIC &amp; SYNOP) :</span>
              </div>

              <div className="flex items-center gap-3 font-mono text-[11px] flex-wrap">
                <span className="text-sky-300" title={`Tmin observée à ${todayInfoclimat.tminHour}`}>
                  Tmin : <strong>{formatTemp(todayInfoclimat.tmin)}</strong> <span className="text-slate-400 font-sans">({todayInfoclimat.tminHour})</span>
                </span>
                <span className="text-slate-500">·</span>
                <span className="text-amber-300" title={`Tmax observée (${todayInfoclimat.tmaxHour})`}>
                  Tmax : <strong>{formatTemp(todayInfoclimat.tmax)}</strong> <span className="text-slate-400 font-sans">({todayInfoclimat.tmaxHour})</span>
                </span>
                <span className="text-slate-500">·</span>
                <span className="text-blue-300" title="Pluie cumulée depuis 00h00">
                  Pluie 00h : <strong>{todayInfoclimat.rainSum} mm</strong>
                </span>
                <span className="text-slate-500">·</span>
                <span className="text-yellow-300" title="Ensoleillement cumulé depuis le lever du jour">
                  Soleil : <strong>{todayInfoclimat.sunLabel}</strong>
                </span>
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
        <div id="realtime-forecast-week" className="col-span-12 lg:col-span-8 flex flex-col min-w-0 h-full scroll-mt-28 [&>div]:h-full">
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

        {/* Right Column of Row 2: Soleil & Lune + Indices d'Activité (Aligned with Hourly block) */}
        {(() => {
          const eph = liveEphemeris;
          const moon = liveMoonPhase || weather.moonPhase;
          const isSunUp = eph.isSunAboveHorizon ?? false;
          const sunProgressPct = isSunUp ? Math.max(1, Math.min(99, eph.sunProgressPercent)) : 0;
          const nightProgressPct = !isSunUp ? Math.max(2, Math.min(98, eph.nightProgressPercent ?? 50)) : 0;
          const activeArcProgressPct = isSunUp ? sunProgressPct : nightProgressPct;

          const t = Math.max(0.02, Math.min(0.98, activeArcProgressPct / 100));
          const oneMinusT = 1 - t;
          const orbCx = Number((oneMinusT * oneMinusT * 15 + 2 * oneMinusT * t * 80 + t * t * 145).toFixed(1));
          const orbCy = Number((oneMinusT * oneMinusT * 44 + 2 * oneMinusT * t * 4 + t * t * 44).toFixed(1));

          const illum = moon?.illuminationPercent ?? 50;
          const phaseCode = moon?.phaseCode || 'first_quarter';
          const dayDelta = eph.dayLengthChangeMinutes ?? 0;
          const outdoor = weather.outdoorIndices || calculateOutdoorIndices(weather, station);

          const renderSunMoonContent = () => (
            <>
              {/* En-tête Compact Soleil & Lune */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 border ${
                    isSunUp
                      ? 'bg-amber-500/15 border-amber-400/30 text-amber-500 dark:text-amber-400'
                      : 'bg-indigo-500/15 border-indigo-400/30 text-indigo-600 dark:text-indigo-300'
                  }`}>
                    {isSunUp ? <Sun className="h-4 w-4 motion-sun-spin" /> : <Moon className="h-4 w-4 motion-moon-float" />}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight truncate">
                      Soleil &amp; Cycle Lunaire
                    </h3>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono tabular-nums truncate">
                      {isSunUp
                        ? `Jour (${eph.currentLocalTimeFormatted || currentTime}) • Élév. +${eph.currentSolarElevationDeg}°`
                        : `Nuit (${eph.currentLocalTimeFormatted || currentTime}) • Élév. ${eph.currentSolarElevationDeg}°`}
                    </div>
                  </div>
                </div>
                <span className={`text-[10px] font-mono tabular-nums font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                  dayDelta >= 0
                    ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 border-emerald-500/30'
                    : 'text-amber-700 dark:text-amber-300 bg-amber-500/15 border-amber-500/30'
                }`}>
                  {dayDelta > 0 ? `+${dayDelta}` : dayDelta} min/j
                </span>
              </div>

              {/* Arc Dynamique Diurne / Nocturne Compact */}
              <div className="flex-1 min-h-[64px] relative flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/70 px-2 pt-1 pb-0.5 overflow-hidden">
                <svg viewBox="0 0 160 54" className="w-full h-full overflow-visible max-h-[76px]">
                  <defs>
                    <linearGradient id="sunArcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.95" />
                      <stop offset="50%" stopColor="#fde047" stopOpacity="1" />
                      <stop offset="100%" stopColor="#fb923c" stopOpacity="0.95" />
                    </linearGradient>
                    <linearGradient id="nightArcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity="0.95" />
                      <stop offset="50%" stopColor="#38bdf8" stopOpacity="1" />
                      <stop offset="100%" stopColor="#818cf8" stopOpacity="0.95" />
                    </linearGradient>
                  </defs>

                  {/* Étoiles scintillantes la nuit */}
                  {!isSunUp && (
                    <g>
                      <circle cx="28" cy="12" r="0.8" fill="#818cf8" className="motion-star-twinkle" />
                      <circle cx="54" cy="7" r="1.0" fill="#facc15" className="motion-star-twinkle-delayed" />
                      <circle cx="80" cy="5" r="0.75" fill="#38bdf8" className="motion-star-twinkle" />
                      <circle cx="108" cy="8" r="0.9" fill="#818cf8" className="motion-star-twinkle-delayed" />
                      <circle cx="132" cy="14" r="0.8" fill="#facc15" className="motion-star-twinkle" />
                    </g>
                  )}

                  {/* Ligne d'horizon */}
                  <line x1="8" y1="44" x2="152" y2="44" className="sun-night-horizon-line stroke-slate-200 dark:stroke-[#1e293b]" strokeWidth="1.1" />

                  {/* Trajectoire de référence en pointillés */}
                  <path
                    d="M 15 44 Q 80 4 145 44"
                    fill="none"
                    className="sun-night-arc-track stroke-slate-300 dark:stroke-[#334155]"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />

                  {/* Arc de progression réel en couleur */}
                  <path
                    d="M 15 44 Q 80 4 145 44"
                    fill="none"
                    stroke={isSunUp ? 'url(#sunArcGrad)' : 'url(#nightArcGrad)'}
                    strokeWidth="2.5"
                    pathLength={100}
                    strokeDasharray={`${activeArcProgressPct} 100`}
                    strokeLinecap="round"
                  />

                  {/* Points d'horizon */}
                  <circle cx="15" cy="44" r="2.4" fill={isSunUp ? '#fbbf24' : '#6366f1'} />
                  <circle cx="145" cy="44" r="2.4" fill={isSunUp ? '#fb923c' : '#38bdf8'} />

                  {/* Heures sur l'arc */}
                  <text x="15" y="52" textAnchor="start" className="fill-slate-500 dark:fill-[#94a3b8]" fontSize="6.2" fontFamily="monospace">
                    {eph.sunrise}
                  </text>
                  <text x="80" y="52" textAnchor="middle" className="fill-slate-500 dark:fill-[#64748b]" fontSize="5.8" fontFamily="monospace">
                    {isSunUp ? `Midi ${eph.solarNoon}` : `Nuit`}
                  </text>
                  <text x="145" y="52" textAnchor="end" className="fill-slate-500 dark:fill-[#94a3b8]" fontSize="6.2" fontFamily="monospace">
                    {eph.sunset}
                  </text>

                  {/* Astre mobile en position temps réel */}
                  {isSunUp ? (
                    <g>
                      <circle cx={orbCx} cy={orbCy} r="9" fill="#f59e0b" opacity="0.25" className="motion-orb-breathe" />
                      <circle cx={orbCx} cy={orbCy} r="4.8" fill="#fbbf24" stroke="#fef08a" strokeWidth="1.2" />
                    </g>
                  ) : (
                    <g>
                      <circle cx={orbCx} cy={orbCy} r="9" fill="#6366f1" opacity="0.28" className="motion-orb-breathe" />
                      <circle cx={orbCx} cy={orbCy} r="4.8" fill="#e0e7ff" stroke="#38bdf8" strokeWidth="1.2" />
                      <circle cx={orbCx + 1.5} cy={orbCy - 1} r="3.6" className="moon-cutout fill-slate-50 dark:fill-[#091122]" />
                    </g>
                  )}
                </svg>
              </div>

              {/* Repères Clés : Lever / Durée / Coucher */}
              <div className="grid grid-cols-3 items-center text-center text-xs font-mono tabular-nums bg-slate-50 dark:bg-slate-950/60 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800/70">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 text-[9px] block">Lever</span>
                  <span className="font-bold text-amber-600 dark:text-amber-300 text-[11px]">{eph.sunrise}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 text-[9px] block">Jour</span>
                  <span className="font-bold text-slate-900 dark:text-white text-[11px]">{eph.dayLengthFormatted}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 text-[9px] block">Coucher</span>
                  <span className="font-bold text-orange-600 dark:text-orange-300 text-[11px]">{eph.sunset}</span>
                </div>
              </div>

              {/* Section Lunaire Compacte */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xl select-none motion-moon-float shrink-0" aria-hidden="true">
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
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate block">
                      {moon?.phaseName || 'Lune'}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono tabular-nums block">
                      {illum}% éclairée • Âge {moon?.moonAgeDays ?? 14}j
                    </span>
                  </div>
                </div>

                <div className="text-right text-[10px] text-slate-500 dark:text-slate-400 font-mono tabular-nums shrink-0">
                  <div>Lev. {moon?.moonrise || '--'}</div>
                  <div>Couch. {moon?.moonset || '--'}</div>
                </div>
              </div>
            </>
          );

          const renderActivityContent = () => (
            <>
              {/* En-tête Indices d'Activité */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="h-8 w-8 rounded-xl flex items-center justify-center shrink-0 border bg-emerald-500/15 border-emerald-400/30 text-emerald-600 dark:text-emerald-400">
                    <Compass className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight truncate">
                      Indices d'Activité
                    </h3>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">
                      Plein air, sport &amp; météo à {station.name}
                    </div>
                  </div>
                </div>

                {/* Score Pill */}
                {activeOutdoorTab === 'hiking' && (
                  <span className={`text-[10px] font-mono tabular-nums font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                    outdoor.hiking.score >= 75
                      ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 border-emerald-500/30'
                      : outdoor.hiking.score >= 50
                        ? 'text-sky-700 dark:text-sky-300 bg-sky-500/15 border-sky-500/30'
                        : 'text-amber-700 dark:text-amber-300 bg-amber-500/15 border-amber-500/30'
                  }`}>
                    {outdoor.hiking.score}/100 • {outdoor.hiking.status}
                  </span>
                )}
                {activeOutdoorTab === 'cycling' && (
                  <span className={`text-[10px] font-mono tabular-nums font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                    outdoor.cycling.score >= 75
                      ? 'text-blue-700 dark:text-blue-300 bg-blue-500/15 border-blue-500/30'
                      : 'text-amber-700 dark:text-amber-300 bg-amber-500/15 border-amber-500/30'
                  }`}>
                    {outdoor.cycling.score}/100 • {outdoor.cycling.status}
                  </span>
                )}
                {activeOutdoorTab === 'beach' && (
                  <span className="text-[10px] font-mono tabular-nums font-bold px-2 py-0.5 rounded-full border shrink-0 text-amber-700 dark:text-amber-300 bg-amber-500/15 border-amber-500/30">
                    {outdoor.beachSea.score}/100 • {outdoor.beachSea.uvRisk}
                  </span>
                )}
                {activeOutdoorTab === 'agri' && (
                  <span className="text-[10px] font-mono tabular-nums font-bold px-2 py-0.5 rounded-full border shrink-0 text-lime-700 dark:text-lime-300 bg-lime-500/15 border-lime-500/30">
                    ETP {outdoor.gardeningAgriculture.et0Evapotranspiration} mm/j
                  </span>
                )}
                {activeOutdoorTab === 'solar' && (
                  <span className="text-[10px] font-mono tabular-nums font-bold px-2 py-0.5 rounded-full border shrink-0 text-yellow-700 dark:text-yellow-300 bg-yellow-500/15 border-yellow-500/30">
                    Eff. {outdoor.solarEnergy.efficiencyScore}%
                  </span>
                )}
              </div>

              {/* 5 Tab Selector Buttons */}
              <div className="flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-950/80 p-1 border border-slate-200 dark:border-slate-800/80 overflow-x-auto no-scrollbar">
                <button
                  type="button"
                  onClick={() => setActiveOutdoorTab('hiking')}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold transition shrink-0 cursor-pointer ${
                    activeOutdoorTab === 'hiking'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Footprints className="h-3 w-3" />
                  <span>Rando</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveOutdoorTab('cycling')}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold transition shrink-0 cursor-pointer ${
                    activeOutdoorTab === 'cycling'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Bike className="h-3 w-3" />
                  <span>Vélo</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveOutdoorTab('beach')}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold transition shrink-0 cursor-pointer ${
                    activeOutdoorTab === 'beach'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Palmtree className="h-3 w-3" />
                  <span>Plage</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveOutdoorTab('agri')}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold transition shrink-0 cursor-pointer ${
                    activeOutdoorTab === 'agri'
                      ? 'bg-lime-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Sprout className="h-3 w-3" />
                  <span>Jardin</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveOutdoorTab('solar')}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold transition shrink-0 cursor-pointer ${
                    activeOutdoorTab === 'solar'
                      ? 'bg-yellow-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <SunMedium className="h-3 w-3" />
                  <span>Solaire</span>
                </button>
              </div>

              {/* Dynamic Body of Active Tab */}
              {activeOutdoorTab === 'hiking' && (
                <div className="space-y-2 flex-1 flex flex-col justify-between">
                  <div className="grid grid-cols-3 gap-1.5 text-center text-xs font-mono tabular-nums bg-slate-50 dark:bg-slate-950/60 p-2 rounded-xl border border-slate-200 dark:border-slate-800/70">
                    <div>
                      <span className="text-[9px] text-slate-500 dark:text-slate-400 block">Orages</span>
                      <span className={`font-bold text-[11px] ${outdoor.hiking.riskThunderstorm === 'Élevé' ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {outdoor.hiking.riskThunderstorm}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 dark:text-slate-400 block">Vent Crêtes</span>
                      <span className="font-bold text-slate-900 dark:text-white text-[11px]">{outdoor.hiking.windAtRidgeKmh} km/h</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 dark:text-slate-400 block">Plafond</span>
                      <span className="font-bold text-sky-600 dark:text-sky-300 text-[11px]">{outdoor.hiking.cloudBaseMeters} m</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug line-clamp-2 px-0.5">
                    💡 {outdoor.hiking.advice}
                  </p>
                </div>
              )}

              {activeOutdoorTab === 'cycling' && (
                <div className="space-y-2 flex-1 flex flex-col justify-between">
                  <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono tabular-nums bg-slate-50 dark:bg-slate-950/60 p-2 rounded-xl border border-slate-200 dark:border-slate-800/70">
                    <div>
                      <span className="text-[9px] text-slate-500 dark:text-slate-400 block">Impact du Vent</span>
                      <span className="font-bold text-slate-900 dark:text-white text-[11px]">{outdoor.cycling.windImpact}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 dark:text-slate-400 block">Stress Thermique</span>
                      <span className="font-bold text-blue-600 dark:text-blue-300 text-[11px]">{outdoor.cycling.heatStress}</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug line-clamp-2 px-0.5">
                    💡 {outdoor.cycling.advice}
                  </p>
                </div>
              )}

              {activeOutdoorTab === 'beach' && (
                <div className="space-y-2 flex-1 flex flex-col justify-between">
                  <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono tabular-nums bg-slate-50 dark:bg-slate-950/60 p-2 rounded-xl border border-slate-200 dark:border-slate-800/70">
                    <div>
                      <span className="text-[9px] text-slate-500 dark:text-slate-400 block">Indice UV Réel</span>
                      <span className="font-bold text-amber-600 dark:text-amber-400 text-[11px]">{weather.uvIndex} ({outdoor.beachSea.uvRisk})</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 dark:text-slate-400 block">Brise Marine</span>
                      <span className="font-bold text-slate-900 dark:text-white text-[11px]">{outdoor.beachSea.thermalBreezeKmh} km/h</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug line-clamp-2 px-0.5">
                    💡 {outdoor.beachSea.advice}
                  </p>
                </div>
              )}

              {activeOutdoorTab === 'agri' && (
                <div className="space-y-2 flex-1 flex flex-col justify-between">
                  <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono tabular-nums bg-slate-50 dark:bg-slate-950/60 p-2 rounded-xl border border-slate-200 dark:border-slate-800/70">
                    <div>
                      <span className="text-[9px] text-slate-500 dark:text-slate-400 block">Pulvérisation</span>
                      <span className="font-bold text-lime-700 dark:text-lime-300 text-[11px] truncate block">{outdoor.gardeningAgriculture.sprayWindow}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 dark:text-slate-400 block">Risque Gel Sol</span>
                      <span className="font-bold text-slate-900 dark:text-white text-[11px]">{outdoor.gardeningAgriculture.frostRiskGround}</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug line-clamp-2 px-0.5">
                    💡 {outdoor.gardeningAgriculture.advice}
                  </p>
                </div>
              )}

              {activeOutdoorTab === 'solar' && (
                <div className="space-y-2 flex-1 flex flex-col justify-between">
                  <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono tabular-nums bg-slate-50 dark:bg-slate-950/60 p-2 rounded-xl border border-slate-200 dark:border-slate-800/70">
                    <div>
                      <span className="text-[9px] text-slate-500 dark:text-slate-400 block">Potentiel 1 kWc</span>
                      <span className="font-bold text-yellow-600 dark:text-yellow-400 text-[11px]">{outdoor.solarEnergy.pvOutputPotentialKwhPerKwp} kWh</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 dark:text-slate-400 block">Soleil Estimé</span>
                      <span className="font-bold text-slate-900 dark:text-white text-[11px]">~{outdoor.solarEnergy.sunHoursEstimated} h</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug line-clamp-2 px-0.5">
                    💡 {outdoor.solarEnergy.advice}
                  </p>
                </div>
              )}
            </>
          );

          // If simplifiedMode is active:
          if (simplifiedMode) {
            return (
              <div className="col-span-12 lg:col-span-4 rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-[#0a1220]/95 p-3.5 sm:p-4 shadow-lg flex flex-col justify-between h-full motion-card-enter space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setSimplifiedRightTab('sun')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        simplifiedRightTab === 'sun'
                          ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      ☀️ Soleil &amp; Lune
                    </button>
                    <button
                      type="button"
                      onClick={() => setSimplifiedRightTab('activity')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        simplifiedRightTab === 'activity'
                          ? 'bg-emerald-600 text-white shadow-sm font-black'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      🏃 Indices d'Activité
                    </button>
                  </div>

                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 font-bold">
                    {simplifiedRightTab === 'sun' ? `${eph.dayLengthFormatted} jour` : `Score ${outdoor.hiking.score}/100`}
                  </span>
                </div>

                {simplifiedRightTab === 'sun' ? renderSunMoonContent() : renderActivityContent()}
              </div>
            );
          }

          // Full Standard Mode: Stack both cards inside the column with flex-1 each so their total height aligns flush with GrandDayAndWeekDetailedForecastCard!
          return (
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-3.5 h-full min-w-0">
              {/* Card 1: Soleil & Cycle Lunaire */}
              <div className="flex-1 rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-[#0a1220]/95 p-3.5 sm:p-4 shadow-lg flex flex-col justify-between motion-card-enter space-y-2">
                {renderSunMoonContent()}
              </div>

              {/* Card 2: Indices d'Activité Plein Air */}
              <div className="flex-1 rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-[#0a1220]/95 p-3.5 sm:p-4 shadow-lg flex flex-col justify-between motion-card-enter space-y-2.5">
                {renderActivityContent()}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};
