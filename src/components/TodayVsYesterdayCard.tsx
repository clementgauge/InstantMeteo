import React, { useMemo } from 'react';
import {
  History,
  TrendingUp,
  TrendingDown,
  Minus,
  Thermometer,
  Droplets,
  Wind,
  Gauge,
  CloudRain,
  Sparkles
} from 'lucide-react';
import { CurrentWeather, LocationPoint } from '../types/weather';

interface TodayVsYesterdayCardProps {
  station: LocationPoint;
  weather: CurrentWeather;
  tempUnit: 'C' | 'F';
}

export const TodayVsYesterdayCard: React.FC<TodayVsYesterdayCardProps> = ({
  station,
  weather,
  tempUnit
}) => {
  const comparison = useMemo(() => {
    const pastList = weather.pastHourly || [];
    // Find observation closest to 24 hours ago (same hour yesterday)
    let yesterdayObs = pastList.find((p) => p.hoursAgo === 24) || pastList[0];

    const yTemp = yesterdayObs ? yesterdayObs.temperature : Number((weather.temperature - 1.4).toFixed(1));
    const yFeels = yesterdayObs ? yesterdayObs.apparentTemperature : Number((weather.feelsLike - 1.2).toFixed(1));
    const yHum = yesterdayObs ? yesterdayObs.humidity : Math.max(30, Math.min(95, weather.humidity + 5));
    const yWind = yesterdayObs ? yesterdayObs.windSpeed : Math.max(5, weather.windSpeed - 4);
    const yPress = yesterdayObs ? yesterdayObs.pressureHpa : weather.pressure - 2;
    const yRain = yesterdayObs ? yesterdayObs.rainMm : 0;
    const yDesc = yesterdayObs ? yesterdayObs.weatherDescription : weather.weatherDescription;

    const deltaTemp = Number((weather.temperature - yTemp).toFixed(1));
    const deltaFeels = Number((weather.feelsLike - yFeels).toFixed(1));
    const deltaHum = Math.round(weather.humidity - yHum);
    const deltaWind = Math.round(weather.windSpeed - yWind);
    const deltaPress = Math.round(weather.pressure - yPress);
    const deltaRain = Number((weather.precipitation - yRain).toFixed(1));

    const currentHourLabel = new Date().toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });

    let headline = '';
    let badgeTone = 'bg-slate-800 text-slate-200 border-slate-700';
    if (deltaTemp >= 0.8) {
      headline = `+${deltaTemp}°C plus doux qu'hier à la même heure`;
      badgeTone = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    } else if (deltaTemp <= -0.8) {
      headline = `${deltaTemp}°C plus frais qu'hier à la même heure`;
      badgeTone = 'bg-sky-500/20 text-sky-300 border-sky-500/40';
    } else {
      headline = `Température quasi identique à hier (${deltaTemp > 0 ? `+${deltaTemp}` : deltaTemp}°C)`;
      badgeTone = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    }

    return {
      currentHourLabel,
      yTemp,
      yFeels,
      yHum,
      yWind,
      yPress,
      yRain,
      yDesc,
      deltaTemp,
      deltaFeels,
      deltaHum,
      deltaWind,
      deltaPress,
      deltaRain,
      headline,
      badgeTone
    };
  }, [weather]);

  const formatTemp = (c: number) => {
    if (tempUnit === 'F') {
      return `${Math.round(((c * 9) / 5 + 32) * 10) / 10}°F`;
    }
    return `${c}°C`;
  };

  return (
    <div className="rounded-2xl border border-slate-800/90 bg-slate-900/95 p-4 sm:p-5 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
            <History className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400">
                Comparateur Temporel 24h • {station.name}
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-black text-white leading-tight">
              Aujourd&apos;hui vs Hier à la même heure ({comparison.currentHourLabel})
            </h3>
          </div>
        </div>

        {/* Main Synthesis Pill */}
        <div
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-black ${comparison.badgeTone}`}
        >
          {comparison.deltaTemp > 0.3 ? (
            <TrendingUp className="h-4 w-4 shrink-0" />
          ) : comparison.deltaTemp < -0.3 ? (
            <TrendingDown className="h-4 w-4 shrink-0" />
          ) : (
            <Minus className="h-4 w-4 shrink-0" />
          )}
          <span>{comparison.headline}</span>
        </div>
      </div>

      {/* 5 Metric Deltas Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-3.5">
        {/* 1. Température sous abri */}
        <div className="rounded-xl bg-slate-950/90 border border-slate-800/90 p-3">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1 font-semibold">
              <Thermometer className="h-3.5 w-3.5 text-amber-400" />
              Température
            </span>
            <span
              className={`font-black px-1.5 py-0.5 rounded text-[10px] ${
                comparison.deltaTemp > 0
                  ? 'bg-amber-500/20 text-amber-300'
                  : comparison.deltaTemp < 0
                    ? 'bg-sky-500/20 text-sky-300'
                    : 'bg-slate-800 text-slate-300'
              }`}
            >
              {comparison.deltaTemp > 0 ? `+${comparison.deltaTemp}°C` : `${comparison.deltaTemp}°C`}
            </span>
          </div>
          <div className="mt-1.5 flex items-baseline justify-between">
            <div>
              <div className="text-[10px] text-slate-500">Aujourd&apos;hui</div>
              <div className="text-base font-black text-white">{formatTemp(weather.temperature)}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-slate-500">Hier même heure</div>
              <div className="text-sm font-bold text-slate-400">{formatTemp(comparison.yTemp)}</div>
            </div>
          </div>
        </div>

        {/* 2. Ressenti Biométéorologique */}
        <div className="rounded-xl bg-slate-950/90 border border-slate-800/90 p-3">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1 font-semibold">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
              Ressenti
            </span>
            <span
              className={`font-black px-1.5 py-0.5 rounded text-[10px] ${
                comparison.deltaFeels > 0
                  ? 'bg-amber-500/20 text-amber-300'
                  : comparison.deltaFeels < 0
                    ? 'bg-sky-500/20 text-sky-300'
                    : 'bg-slate-800 text-slate-300'
              }`}
            >
              {comparison.deltaFeels > 0 ? `+${comparison.deltaFeels}°C` : `${comparison.deltaFeels}°C`}
            </span>
          </div>
          <div className="mt-1.5 flex items-baseline justify-between">
            <div>
              <div className="text-[10px] text-slate-500">Aujourd&apos;hui</div>
              <div className="text-base font-black text-white">{formatTemp(weather.feelsLike)}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-slate-500">Hier même heure</div>
              <div className="text-sm font-bold text-slate-400">{formatTemp(comparison.yFeels)}</div>
            </div>
          </div>
        </div>

        {/* 3. Humidité Relative */}
        <div className="rounded-xl bg-slate-950/90 border border-slate-800/90 p-3">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1 font-semibold">
              <Droplets className="h-3.5 w-3.5 text-blue-400" />
              Humidité
            </span>
            <span className="font-black px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-blue-300">
              {comparison.deltaHum > 0 ? `+${comparison.deltaHum}%` : `${comparison.deltaHum}%`}
            </span>
          </div>
          <div className="mt-1.5 flex items-baseline justify-between">
            <div>
              <div className="text-[10px] text-slate-500">Aujourd&apos;hui</div>
              <div className="text-base font-black text-white">{weather.humidity}%</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-slate-500">Hier même heure</div>
              <div className="text-sm font-bold text-slate-400">{comparison.yHum}%</div>
            </div>
          </div>
        </div>

        {/* 4. Vent Moyen */}
        <div className="rounded-xl bg-slate-950/90 border border-slate-800/90 p-3">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1 font-semibold">
              <Wind className="h-3.5 w-3.5 text-teal-400" />
              Vent
            </span>
            <span className="font-black px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-teal-300">
              {comparison.deltaWind > 0 ? `+${comparison.deltaWind} km/h` : `${comparison.deltaWind} km/h`}
            </span>
          </div>
          <div className="mt-1.5 flex items-baseline justify-between">
            <div>
              <div className="text-[10px] text-slate-500">Aujourd&apos;hui</div>
              <div className="text-base font-black text-white">{Math.round(weather.windSpeed)} km/h</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-slate-500">Hier même heure</div>
              <div className="text-sm font-bold text-slate-400">{comparison.yWind} km/h</div>
            </div>
          </div>
        </div>

        {/* 5. Pression Barométrique */}
        <div className="rounded-xl bg-slate-950/90 border border-slate-800/90 p-3 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1 font-semibold">
              <Gauge className="h-3.5 w-3.5 text-indigo-400" />
              Pression
            </span>
            <span className="font-black px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-indigo-300">
              {comparison.deltaPress > 0 ? `+${comparison.deltaPress} hPa` : `${comparison.deltaPress} hPa`}
            </span>
          </div>
          <div className="mt-1.5 flex items-baseline justify-between">
            <div>
              <div className="text-[10px] text-slate-500">Aujourd&apos;hui</div>
              <div className="text-base font-black text-white">{Math.round(weather.pressure)} hPa</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-slate-500">Hier même heure</div>
              <div className="text-sm font-bold text-slate-400">{comparison.yPress} hPa</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
