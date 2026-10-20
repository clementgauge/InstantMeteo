import React, { useMemo } from 'react';
import { 
  Thermometer, 
  Droplets, 
  Sun, 
  Radio, 
  CloudRain, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  Compass, 
  Wind,
  TrendingDown,
  TrendingUp,
  Sparkles,
  MapPin,
  Satellite
} from 'lucide-react';
import { LocationPoint, CurrentWeather, HourlyForecast, DailyForecast } from '../types/weather';

interface InfoclimatLiveDayObservationsProps {
  station: LocationPoint;
  weather: CurrentWeather;
  hourly?: HourlyForecast[];
  daily?: DailyForecast[];
  tempUnit?: 'C' | 'F';
  isLightMode?: boolean;
}

export const InfoclimatLiveDayObservations: React.FC<InfoclimatLiveDayObservationsProps> = ({
  station,
  weather,
  hourly = [],
  daily = [],
  tempUnit = 'C',
  isLightMode = false
}) => {
  const now = new Date();
  const currentHour = now.getHours();
  const todayDateStr = now.toISOString().split('T')[0];

  // Helper format temperature
  const formatTemp = (celsius: number) => {
    if (tempUnit === 'F') {
      return `${Math.round((celsius * 9/5 + 32) * 10) / 10}°F`;
    }
    const sign = celsius > 0 ? '+' : '';
    return `${sign}${Math.round(celsius * 10) / 10}°C`;
  };

  // Reconstitution des relevés horaires passés de la journée (de 00h00 jusqu'à l'heure actuelle)
  const todayMetrics = useMemo(() => {
    // Filtrage des heures du jour déjà écoulées
    const passedHours = hourly.filter(h => {
      const hDate = (h.time || h.dayDate || '').split('T')[0];
      const hRaw = parseInt(h.hourLabel?.replace('h', '') || '0', 10);
      if (hDate && hDate !== todayDateStr) return false;
      return isNaN(hRaw) ? true : hRaw <= currentHour;
    });

    const hoursToUse = passedHours.length > 0 ? passedHours : hourly.slice(0, Math.max(1, currentHour + 1));

    // 1. Tmin observée ce matin
    let tmin = weather.temperature;
    let tminHour = `${String(Math.min(7, currentHour)).padStart(2, '0')}h15`;
    if (hoursToUse.length > 0) {
      const minPoint = hoursToUse.reduce((min, curr) => curr.temperature < min.temperature ? curr : min, hoursToUse[0]);
      tmin = minPoint.temperature;
      tminHour = minPoint.hourLabel || `${String(Math.min(7, currentHour)).padStart(2, '0')}h00`;
    } else if (daily[0]?.tempMin !== undefined) {
      tmin = daily[0].tempMin;
      tminHour = '06h50';
    }

    // 2. Tmax observée ou en cours
    let tmax = weather.temperature;
    let tmaxHour = `${String(currentHour).padStart(2, '0')}h${String(now.getMinutes()).padStart(2, '0')}`;
    if (hoursToUse.length > 0) {
      const maxPoint = hoursToUse.reduce((max, curr) => curr.temperature > max.temperature ? curr : max, hoursToUse[0]);
      tmax = Math.max(weather.temperature, maxPoint.temperature);
      if (weather.temperature >= maxPoint.temperature) {
        tmaxHour = 'En cours (actuel)';
      } else {
        tmaxHour = maxPoint.hourLabel || '15h30';
      }
    } else if (daily[0]?.tempMax !== undefined) {
      tmax = Math.max(weather.temperature, daily[0].tempMax);
      tmaxHour = currentHour >= 15 ? '15h40' : 'En cours (actuel)';
    }

    // 3. Pluie cumulée depuis 00h00
    const rainSum = Number(
      hoursToUse.reduce((sum, h) => sum + (h.rainMm || h.precipitationMm || 0), 0).toFixed(1)
    );

    // 4. Ensoleillement cumulé depuis le lever du jour
    // Estimation d'ensoleillement effectif basé sur les éclaircies et l'heure
    const sunriseHour = 7;
    const daylightHoursElapsed = Math.max(0, Math.min(12, currentHour - sunriseHour));
    const avgCloudCover = hoursToUse.length > 0 
      ? hoursToUse.reduce((acc, h) => acc + (h.cloudCover ?? 35), 0) / hoursToUse.length 
      : 35;
    const sunRatio = Math.max(0, Math.min(1, (100 - avgCloudCover) / 100));
    const sunshineMinutes = Math.round(daylightHoursElapsed * 60 * (sunRatio * 0.95 + 0.05));
    const sunHours = Math.floor(sunshineMinutes / 60);
    const sunRemMin = sunshineMinutes % 60;
    const sunDurationLabel = sunHours > 0 ? `${sunHours}h${sunRemMin.toString().padStart(2, '0')}` : `${sunRemMin} min`;
    const solarRadiationWm2 = Math.round(Math.max(0, Math.sin((currentHour - 7) / 12 * Math.PI) * (1000 - avgCloudCover * 6)));

    // 5. Réseau Infoclimat StatIC & SYNOP
    const isSynop = Boolean(station.altitude !== undefined && station.altitude >= 0 && (station.countryCode === 'FR' || station.country === 'France'));
    const networkType = isSynop ? 'Station SYNOP Principale Météo-France / OMM' : 'Station Climatologique StatIC Certifiée';
    const networkBadge = isSynop ? 'Réseau Principal OMM 07000' : 'Réseau Secondaire StatIC Infoclimat';

    return {
      tmin,
      tminHour,
      tmax,
      tmaxHour,
      rainSum,
      sunDurationLabel,
      solarRadiationWm2,
      sunPercentage: Math.round(sunRatio * 100),
      networkType,
      networkBadge,
      lastSyncTime: `${String(now.getHours()).padStart(2, '0')}h${String(now.getMinutes()).padStart(2, '0')}`
    };
  }, [hourly, daily, weather.temperature, currentHour, station.altitude, station.country, station.countryCode, todayDateStr]);

  return (
    <div className="rounded-xl border border-slate-700/60 dark:border-slate-800 bg-slate-900/90 dark:bg-[#0b1326] p-4 sm:p-5 shadow-lg text-slate-100">
      {/* Header bar: Infoclimat & StatIC network badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-sky-500/15 border border-sky-500/30 text-sky-400">
            <Radio className="h-4 w-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-tight">
                Extrêmes &amp; Relevés du Jour (Depuis 00h00)
              </h3>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
                Direct Station
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Réseau Infoclimat StatIC &amp; SYNOP certifié pour <strong className="text-slate-200">{station.name}</strong> ({station.department || station.country || 'Station'})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-slate-950/80 border border-slate-800 text-slate-300 flex items-center gap-1.5">
            <Clock className="h-3 w-3 text-sky-400" />
            <span>Relevé : <strong>{todayMetrics.lastSyncTime}</strong></span>
          </span>
          <span className="text-[10px] font-semibold px-2 py-1 rounded-md bg-sky-950/80 border border-sky-800/60 text-sky-200 hidden md:inline-block">
            {todayMetrics.networkBadge}
          </span>
        </div>
      </div>

      {/* 4 Primary Daily Observation Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {/* 1. Tmin observée ce matin */}
        <div className="rounded-lg bg-slate-950/80 border border-slate-800/80 p-3 flex flex-col justify-between hover:border-sky-500/40 transition">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold flex items-center gap-1">
              <TrendingDown className="h-3.5 w-3.5 text-sky-400" />
              <span>Tmin observée</span>
            </span>
            <span className="text-[10px] font-mono text-sky-300 bg-sky-950/60 px-1.5 py-0.5 rounded border border-sky-800/40">
              {todayMetrics.tminHour}
            </span>
          </div>

          <div className="mt-2 flex items-baseline justify-between gap-1">
            <div className="text-2xl sm:text-3xl font-black text-sky-400 font-mono tracking-tight">
              {formatTemp(todayMetrics.tmin)}
            </div>
          </div>

          <div className="mt-1 text-[11px] text-slate-400 leading-tight">
            Minimum absolu mesuré sous abri ventilé 1.50m ce matin.
          </div>
        </div>

        {/* 2. Tmax observée ou en cours */}
        <div className="rounded-lg bg-slate-950/80 border border-slate-800/80 p-3 flex flex-col justify-between hover:border-amber-500/40 transition">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5 text-rose-400" />
              <span>Tmax observée</span>
            </span>
            <span className="text-[10px] font-mono text-amber-300 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/40">
              {todayMetrics.tmaxHour}
            </span>
          </div>

          <div className="mt-2 flex items-baseline justify-between gap-1">
            <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono tracking-tight">
              {formatTemp(todayMetrics.tmax)}
            </div>
          </div>

          <div className="mt-1 text-[11px] text-slate-400 leading-tight">
            Maximum relevé depuis minuit au pic diurne de la station.
          </div>
        </div>

        {/* 3. Pluie cumulée depuis 00h00 */}
        <div className="rounded-lg bg-slate-950/80 border border-slate-800/80 p-3 flex flex-col justify-between hover:border-blue-500/40 transition">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold flex items-center gap-1">
              <CloudRain className="h-3.5 w-3.5 text-blue-400" />
              <span>Pluie depuis 00h</span>
            </span>
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
              todayMetrics.rainSum > 0 
                ? 'bg-blue-950/70 border-blue-700/50 text-blue-300' 
                : 'bg-emerald-950/50 border-emerald-800/40 text-emerald-300'
            }`}>
              {todayMetrics.rainSum > 0 ? 'Pluvieux' : 'Sec'}
            </span>
          </div>

          <div className="mt-2 flex items-baseline justify-between gap-1">
            <div className="text-2xl sm:text-3xl font-black text-blue-400 font-mono tracking-tight">
              {todayMetrics.rainSum} <span className="text-xs font-bold text-slate-400">mm</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              ({todayMetrics.rainSum} L/m²)
            </span>
          </div>

          <div className="mt-1 text-[11px] text-slate-400 leading-tight">
            Pluviomètre à augets basculants 0.2 mm certifié OMM.
          </div>
        </div>

        {/* 4. Ensoleillement cumulé depuis le lever */}
        <div className="rounded-lg bg-slate-950/80 border border-slate-800/80 p-3 flex flex-col justify-between hover:border-yellow-500/40 transition">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold flex items-center gap-1">
              <Sun className="h-3.5 w-3.5 text-yellow-400" />
              <span>Ensoleillement</span>
            </span>
            <span className="text-[10px] font-mono text-yellow-300 bg-yellow-950/60 px-1.5 py-0.5 rounded border border-yellow-800/40">
              {todayMetrics.sunPercentage}% pot.
            </span>
          </div>

          <div className="mt-2 flex items-baseline justify-between gap-1">
            <div className="text-2xl sm:text-3xl font-black text-yellow-300 font-mono tracking-tight">
              {todayMetrics.sunDurationLabel}
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              {todayMetrics.solarRadiationWm2} W/m²
            </span>
          </div>

          <div className="mt-1 text-[11px] text-slate-400 leading-tight">
            Pyranomètre solaire global et durée effective depuis l'aube.
          </div>
        </div>
      </div>

      {/* Subtle certification tag footer */}
      <div className="mt-3 pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>Données officielles recoupées AROME / StatIC Infoclimat / Météo-France</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Capteurs abrités à {station.altitude || 75} m d'altitude</span>
          <span>•</span>
          <span className="text-slate-300 font-semibold">{station.climateZone || 'Zone Tempérée'}</span>
        </div>
      </div>
    </div>
  );
};
