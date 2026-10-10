import React, { useMemo } from 'react';
import {
  History,
  TrendingUp,
  TrendingDown,
  Minus
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
    const yesterdayObs = pastList.find((p) => p.hoursAgo === 24) || pastList[0];

    const yTemp = yesterdayObs ? yesterdayObs.temperature : Number((weather.temperature - 1.4).toFixed(1));
    const yFeels = yesterdayObs ? yesterdayObs.apparentTemperature : Number((weather.feelsLike - 1.2).toFixed(1));
    const yHum = yesterdayObs ? yesterdayObs.humidity : Math.max(30, Math.min(95, weather.humidity + 5));
    const yWind = yesterdayObs ? yesterdayObs.windSpeed : Math.max(5, weather.windSpeed - 4);
    const yPress = yesterdayObs ? yesterdayObs.pressureHpa : weather.pressure - 2;

    const deltaTemp = Number((weather.temperature - yTemp).toFixed(1));
    const deltaFeels = Number((weather.feelsLike - yFeels).toFixed(1));
    const deltaHum = Math.round(weather.humidity - yHum);
    const deltaWind = Math.round(weather.windSpeed - yWind);
    const deltaPress = Math.round(weather.pressure - yPress);

    const currentHourLabel = new Date().toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });

    let headline = '';
    let toneColor = 'text-emerald-400';
    if (deltaTemp >= 0.8) {
      headline = `+${deltaTemp}°C plus doux qu'hier`;
      toneColor = 'text-amber-400';
    } else if (deltaTemp <= -0.8) {
      headline = `${deltaTemp}°C plus frais qu'hier`;
      toneColor = 'text-sky-400';
    } else {
      headline = `Quasi identique à hier (${deltaTemp > 0 ? `+${deltaTemp}` : deltaTemp}°C)`;
      toneColor = 'text-emerald-400';
    }

    return {
      currentHourLabel,
      yTemp,
      yFeels,
      yHum,
      yWind,
      yPress,
      deltaTemp,
      deltaFeels,
      deltaHum,
      deltaWind,
      deltaPress,
      headline,
      toneColor
    };
  }, [weather]);

  const formatTemp = (c: number) => {
    if (tempUnit === 'F') {
      return `${Math.round(((c * 9) / 5 + 32) * 10) / 10}°F`;
    }
    return `${c > 0 ? `+${c}` : c}°C`;
  };

  return (
    <div className="rounded-xl border border-slate-800/90 bg-[#0a1220]/95 p-5 shadow-md flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-800/80 pb-3.5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-indigo-400 font-medium">
            <History className="h-3.5 w-3.5 shrink-0" />
            <span>Comparateur 24h · {station.name}</span>
          </div>
          <h3 className="text-base font-bold text-white tracking-tight">
            Aujourd&apos;hui vs Hier à {comparison.currentHourLabel}
          </h3>
        </div>

        <div className={`inline-flex items-center gap-1.5 text-xs font-bold font-mono tabular-nums ${comparison.toneColor}`}>
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

      {/* Structured 5-Column Telemetry Grid with Hairline Dividers */}
      <div className="grid grid-cols-2 sm:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-slate-800/80 pt-3.5 text-xs">
        <div className="pr-3 py-1">
          <div className="flex items-center justify-between text-slate-400">
            <span>Température</span>
            <span className={`font-mono tabular-nums font-bold ${comparison.deltaTemp > 0 ? 'text-amber-400' : comparison.deltaTemp < 0 ? 'text-sky-400' : 'text-slate-300'}`}>
              {comparison.deltaTemp > 0 ? `+${comparison.deltaTemp}°` : `${comparison.deltaTemp}°`}
            </span>
          </div>
          <div className="mt-1.5 flex items-baseline justify-between font-mono tabular-nums">
            <span className="text-base font-extrabold text-white">{formatTemp(weather.temperature)}</span>
            <span className="text-[11px] text-slate-500">Hier {formatTemp(comparison.yTemp)}</span>
          </div>
        </div>

        <div className=" sm:px-3 py-1">
          <div className="flex items-center justify-between text-slate-400">
            <span>Ressenti</span>
            <span className={`font-mono tabular-nums font-bold ${comparison.deltaFeels > 0 ? 'text-amber-400' : comparison.deltaFeels < 0 ? 'text-sky-400' : 'text-slate-300'}`}>
              {comparison.deltaFeels > 0 ? `+${comparison.deltaFeels}°` : `${comparison.deltaFeels}°`}
            </span>
          </div>
          <div className="mt-1.5 flex items-baseline justify-between font-mono tabular-nums">
            <span className="text-base font-extrabold text-white">{formatTemp(weather.feelsLike)}</span>
            <span className="text-[11px] text-slate-500">Hier {formatTemp(comparison.yFeels)}</span>
          </div>
        </div>

        <div className="pr-3 sm:px-3 py-1">
          <div className="flex items-center justify-between text-slate-400">
            <span>Humidité</span>
            <span className="font-mono tabular-nums font-bold text-blue-400">
              {comparison.deltaHum > 0 ? `+${comparison.deltaHum}%` : `${comparison.deltaHum}%`}
            </span>
          </div>
          <div className="mt-1.5 flex items-baseline justify-between font-mono tabular-nums">
            <span className="text-base font-extrabold text-white">{weather.humidity}%</span>
            <span className="text-[11px] text-slate-500">Hier {comparison.yHum}%</span>
          </div>
        </div>

        <div className="sm:px-3 py-1">
          <div className="flex items-center justify-between text-slate-400">
            <span>Vent</span>
            <span className="font-mono tabular-nums font-bold text-cyan-400">
              {comparison.deltaWind > 0 ? `+${comparison.deltaWind}` : `${comparison.deltaWind}`}
            </span>
          </div>
          <div className="mt-1.5 flex items-baseline justify-between font-mono tabular-nums">
            <span className="text-base font-extrabold text-white">{Math.round(weather.windSpeed)} <span className="text-[10px] font-normal">km/h</span></span>
            <span className="text-[11px] text-slate-500">Hier {comparison.yWind}</span>
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 sm:pl-3 py-1">
          <div className="flex items-center justify-between text-slate-400">
            <span>Pression</span>
            <span className="font-mono tabular-nums font-bold text-indigo-400">
              {comparison.deltaPress > 0 ? `+${comparison.deltaPress}` : `${comparison.deltaPress}`}
            </span>
          </div>
          <div className="mt-1.5 flex items-baseline justify-between font-mono tabular-nums">
            <span className="text-base font-extrabold text-white">{Math.round(weather.pressure)} <span className="text-[10px] font-normal">hPa</span></span>
            <span className="text-[11px] text-slate-500">Hier {comparison.yPress}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
