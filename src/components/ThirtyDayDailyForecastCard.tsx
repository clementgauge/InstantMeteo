import React, { useState, useEffect } from 'react';
import { 
  ThirtyDayForecastCollection, 
  DailyThirtyDayForecastItem, 
  LocationPoint, 
  FrostCategory,
  DailyForecast,
  CurrentWeather 
} from '../types/weather';
import { generateThirtyDayForecast } from '../services/thirtyDayForecastService';
import { getRichWeatherInfo, getRainRiskExplanation } from '../utils/weatherIcons';
import { 
  Calendar, 
  Sparkles, 
  CloudSnow, 
  ThermometerSnowflake, 
  CloudRain, 
  Wind, 
  Compass, 
  Sun, 
  RefreshCw, 
  Clock, 
  ChevronRight, 
  AlertTriangle, 
  Layers, 
  Sliders, 
  TrendingDown, 
  TrendingUp, 
  ShieldCheck, 
  Mountain,
  Snowflake,
  Droplets,
  Eye,
  Info,
  Cloud
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Line, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ReferenceLine, 
  Area 
} from 'recharts';

interface ThirtyDayDailyForecastCardProps {
  station: LocationPoint;
  currentTemp?: number;
  currentAnomaly?: number;
  dailyForecasts?: DailyForecast[];
  currentWeather?: CurrentWeather;
  seniorMode: boolean;
  tempUnit?: 'C' | 'F';
}

export const ThirtyDayDailyForecastCard: React.FC<ThirtyDayDailyForecastCardProps> = ({
  station,
  currentTemp,
  currentAnomaly,
  dailyForecasts,
  currentWeather,
  seniorMode,
  tempUnit = 'C'
}) => {
  const [scenario, setScenario] = useState<'median' | 'coldSnowy' | 'mildDry'>('median');
  const [filterType, setFilterType] = useState<'ALL' | 'FROST' | 'NO_THAW' | 'SNOW' | 'RAIN'>('ALL');
  const [viewMode, setViewMode] = useState<'GRID' | 'TABLE' | 'CHART'>('GRID');
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [countdown, setCountdown] = useState<number>(3600);

  // Generate 30-day forecast dataset
  const [forecastData, setForecastData] = useState<ThirtyDayForecastCollection>(() => 
    generateThirtyDayForecast(station, currentTemp, currentAnomaly, dailyForecasts, currentWeather)
  );

  // Update on station change
  useEffect(() => {
    const updated = generateThirtyDayForecast(station, currentTemp, currentAnomaly, dailyForecasts, currentWeather);
    setForecastData(updated);
    setCountdown(updated.refreshCountdownSec);
  }, [station, currentTemp, currentAnomaly, dailyForecasts, currentWeather]);

  // Real-time hourly countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Re-generate next hourly cycle
          setForecastData(generateThirtyDayForecast(station, currentTemp, currentAnomaly, dailyForecasts, currentWeather));
          return 3600;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [station, currentTemp, currentAnomaly, dailyForecasts, currentWeather]);

  const formatCountdown = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatTemp = (celsius: number) => {
    if (tempUnit === 'F') {
      return `${Math.round((celsius * 9/5 + 32) * 10) / 10}°F`;
    }
    return `${celsius > 0 ? '+' : ''}${celsius}°C`;
  };

  // Adjust dataset according to active ensemble scenario with physical horizon spread scaling
  const displayedDays = forecastData.days.map((day) => {
    const scen = forecastData.scenarios[scenario];
    // Uncertainty cone: spreads progressively from J+1 (tight multi-model consensus) to J+10+ (full ensemble spread)
    const horizonSpreadFactor = Math.min(1, Math.max(0.05, (day.dayIndex - 1) / 8));
    const effectiveTempDelta = scen.tempDelta * horizonSpreadFactor;
    const effectivePrecipDeltaPct = scen.precipDeltaPct * horizonSpreadFactor;
    const effectiveSnowDeltaPct = scen.snowDeltaPct * horizonSpreadFactor;

    const tMin = Number((day.tempMin + effectiveTempDelta).toFixed(1));
    const tMax = Number((day.tempMax + effectiveTempDelta).toFixed(1));
    const tMean = Number(((tMin + tMax) / 2).toFixed(1));
    const precipMm = Number((day.precipitationMm * (1 + effectivePrecipDeltaPct / 100)).toFixed(1));
    const snowfallCm = Number((day.snowfallCm * (1 + effectiveSnowDeltaPct / 100)).toFixed(1));

    return {
      ...day,
      tempMin: tMin,
      tempMax: tMax,
      tempMean: tMean,
      precipitationMm: precipMm,
      snowfallCm: snowfallCm,
      tempAnomalyVsNormal: Number((day.tempAnomalyVsNormal + effectiveTempDelta).toFixed(1))
    };
  });

  // Filter days
  const filteredDays = displayedDays.filter((day) => {
    if (filterType === 'FROST') return day.tempMin <= 0;
    if (filterType === 'NO_THAW') return day.tempMax <= 0;
    if (filterType === 'SNOW') return day.snowfallCm > 0 || day.snowDepthCm > 0;
    if (filterType === 'RAIN') return day.precipitationMm > 0 && day.snowfallCm === 0;
    return true;
  });

  const selectedDay = displayedDays[selectedDayIndex] || displayedDays[0];

  // Recharts chart dataset
  const chartData = displayedDays.map((d) => ({
    name: `J+${d.dayIndex}`,
    label: d.dayLabel,
    tMin: d.tempMin,
    tMax: d.tempMax,
    tMean: d.tempMean,
    rainMm: d.precipitationMm,
    snowCm: d.snowfallCm,
    snowDepth: d.snowDepthCm,
    isotherm0: d.isotherm0Meters,
    confidence: d.modelConfidence
  }));

  const getFrostBadgeClass = (category: FrostCategory) => {
    switch (category) {
      case 'SANS_DÉGEL':
        return 'bg-purple-950/80 text-purple-300 border-purple-500/50 shadow-purple-900/30';
      case 'TRÈS_FORTE_GELÉE':
        return 'bg-indigo-950/80 text-indigo-300 border-indigo-500/50';
      case 'FORTE_GELÉE':
        return 'bg-blue-950/80 text-blue-300 border-blue-500/40';
      case 'GELÉE_MODÉRÉE':
        return 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40';
      case 'GELÉE_BLANCHE':
        return 'bg-sky-950/60 text-sky-300 border-sky-500/30';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div id="thirty-day-forecast-card" className="rounded-lg border border-slate-800 bg-slate-900 p-4 sm:p-6 space-y-5">
      {/* Header & Hourly Countdown Sync */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-md bg-slate-950 p-2.5 text-blue-400 border border-slate-800">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400">
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-blue-400" /> Prévisions Jour par Jour à 30 Jours
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded text-[11px] border border-emerald-800">
                <RefreshCw className="h-3 w-3" /> Actualisation horaire (dans {formatCountdown(countdown)})
              </span>
            </div>
            <h3 className={`font-bold text-white ${seniorMode ? 'text-2xl' : 'text-xl sm:text-2xl'} mt-0.5`}>
              30 Jours de Prévisions pour {station.name}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Altitude {station.altitude} m • {forecastData.summaryPeriod} • Dernière mise à jour à {forecastData.lastHourlyRun}
            </p>
          </div>
        </div>

        {/* Ensemble Scenario Selector */}
        <div className="flex items-center gap-1 rounded-md bg-slate-950 p-1 border border-slate-800">
          <button
            onClick={() => setScenario('median')}
            className={`rounded px-2.5 py-1 text-xs font-semibold transition ${
              scenario === 'median' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Médian
          </button>
          <button
            onClick={() => setScenario('coldSnowy')}
            className={`rounded px-2.5 py-1 text-xs font-semibold transition flex items-center gap-1 ${
              scenario === 'coldSnowy' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-indigo-300'
            }`}
          >
            <Snowflake className="h-3 w-3" />
            <span>Froid (-2.4°)</span>
          </button>
          <button
            onClick={() => setScenario('mildDry')}
            className={`rounded px-2.5 py-1 text-xs font-semibold transition flex items-center gap-1 ${
              scenario === 'mildDry' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-amber-300'
            }`}
          >
            <Sun className="h-3 w-3" />
            <span>Doux (+2.1°)</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Metric Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-md bg-slate-950 p-3 border border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-1">
            <ThermometerSnowflake className="h-4 w-4 text-cyan-400" />
            <span>Jours de Gelée (Tn ≤ 0°)</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-cyan-300">{forecastData.frostDaysCount}</span>
            <span className="text-xs text-slate-400">sur 30 jours ({Math.round(forecastData.frostDaysCount / 30 * 100)}%)</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Max consécutifs : <strong className="text-white">{forecastData.maxConsecutiveFrostDays} j</strong>
          </p>
        </div>

        <div className="rounded-md bg-slate-950 p-3 border border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-1">
            <Snowflake className="h-4 w-4 text-purple-400" />
            <span>Sans Dégel (Tx ≤ 0°)</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-purple-300">{forecastData.noThawDaysCount}</span>
            <span className="text-xs text-slate-400">jours de glace continue</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Froid polaire permanent
          </p>
        </div>

        <div className="rounded-md bg-slate-950 p-3 border border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-1">
            <CloudSnow className="h-4 w-4 text-blue-400" />
            <span>Cumul Neige Projeté</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-blue-300">{forecastData.totalExpectedSnowCm}</span>
            <span className="text-xs text-slate-400">cm de neige fraîche</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {forecastData.snowDaysCount} jours avec saupoudrage/chute
          </p>
        </div>

        <div className="rounded-md bg-slate-950 p-3 border border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-1">
            <Droplets className="h-4 w-4 text-emerald-400" />
            <span>Précipitations Totales</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-300">{forecastData.totalExpectedPrecipMm}</span>
            <span className="text-xs text-slate-400">mm (eau + neige fondue)</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Moy. {formatTemp(forecastData.meanTMin)} / {formatTemp(forecastData.meanTMax)}
          </p>
        </div>
      </div>

      {/* Controls Bar: Filters & View Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 bg-slate-950 p-2 rounded-md border border-slate-800">
        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-1">
          <button
            onClick={() => setFilterType('ALL')}
            className={`rounded px-2.5 py-1 text-xs font-medium transition ${
              filterType === 'ALL' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Tous les 30 Jours
          </button>
          <button
            onClick={() => setFilterType('FROST')}
            className={`rounded px-2.5 py-1 text-xs font-medium transition flex items-center gap-1 ${
              filterType === 'FROST' ? 'bg-cyan-700 text-white' : 'text-slate-400 hover:text-cyan-300'
            }`}
          >
            <ThermometerSnowflake className="h-3 w-3" />
            <span>Gelées ({forecastData.frostDaysCount})</span>
          </button>
          <button
            onClick={() => setFilterType('NO_THAW')}
            className={`rounded px-2.5 py-1 text-xs font-medium transition flex items-center gap-1 ${
              filterType === 'NO_THAW' ? 'bg-purple-700 text-white' : 'text-slate-400 hover:text-purple-300'
            }`}
          >
            <Snowflake className="h-3 w-3" />
            <span>Sans Dégel ({forecastData.noThawDaysCount})</span>
          </button>
          <button
            onClick={() => setFilterType('SNOW')}
            className={`rounded px-2.5 py-1 text-xs font-medium transition flex items-center gap-1 ${
              filterType === 'SNOW' ? 'bg-blue-700 text-white' : 'text-slate-400 hover:text-blue-300'
            }`}
          >
            <CloudSnow className="h-3 w-3" />
            <span>Chutes de Neige ({forecastData.snowDaysCount})</span>
          </button>
          <button
            onClick={() => setFilterType('RAIN')}
            className={`rounded px-2.5 py-1 text-xs font-medium transition flex items-center gap-1 ${
              filterType === 'RAIN' ? 'bg-emerald-700 text-white' : 'text-slate-400 hover:text-emerald-300'
            }`}
          >
            <CloudRain className="h-3 w-3" />
            <span>Pluie liquide</span>
          </button>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded border border-slate-800">
          <button
            onClick={() => setViewMode('GRID')}
            className={`rounded px-2.5 py-1 text-xs font-medium transition ${
              viewMode === 'GRID' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Cartes 30j
          </button>
          <button
            onClick={() => setViewMode('TABLE')}
            className={`rounded px-2.5 py-1 text-xs font-medium transition ${
              viewMode === 'TABLE' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Tableau Détaillé
          </button>
          <button
            onClick={() => setViewMode('CHART')}
            className={`rounded px-2.5 py-1 text-xs font-medium transition ${
              viewMode === 'CHART' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Courbes 30 Jours
          </button>
        </div>
      </div>

      {/* Main Content according to view mode */}
      {viewMode === 'GRID' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2">
          {filteredDays.map((d) => {
            const isSelected = selectedDay.dayIndex === d.dayIndex;
            const richWeather = getRichWeatherInfo(d.weatherCode, true, d.precipitationMm);
            const rainRisk = getRainRiskExplanation(d.precipitationProb, d.precipitationMm, 1);
            return (
              <button
                key={d.dayIndex}
                onClick={() => setSelectedDayIndex(d.dayIndex - 1)}
                className={`flex flex-col justify-between text-left p-2.5 rounded-md border transition cursor-pointer ${
                  isSelected
                    ? 'border-blue-500 bg-blue-950/40 ring-1 ring-blue-500'
                    : 'border-slate-800 bg-slate-950 hover:bg-slate-900'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 font-bold mb-1">
                    <span>J+{d.dayIndex}</span>
                    <span className="text-[10px] text-slate-500">{d.modelConfidence}% conf.</span>
                  </div>
                  <div className="font-bold text-white text-xs truncate mb-1">
                    {d.dayLabel}
                  </div>
                  <div className="flex items-center gap-1.5 my-1">
                    <span className="text-xl" title={richWeather.detailedLabel}>{richWeather.emoji}</span>
                    <span className="text-[10px] text-slate-400 truncate leading-tight" title={richWeather.detailedLabel}>
                      {richWeather.shortLabel}
                    </span>
                  </div>
                </div>

                <div>
                  {/* Min / Max Temp */}
                  <div className="flex items-baseline justify-between mb-1 text-xs font-bold">
                    <span className={d.tempMin <= 0 ? 'text-cyan-400' : 'text-blue-300'}>
                      {formatTemp(d.tempMin)}
                    </span>
                    <span className="text-slate-600 font-normal">•</span>
                    <span className="text-amber-400">
                      {formatTemp(d.tempMax)}
                    </span>
                  </div>

                  {/* Cloud cover pill */}
                  <div className="flex items-center justify-between text-[10px] text-slate-300 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 mb-1" title={`Couverture nuageuse: ${d.cloudCoverPct ?? 35}% (${d.cloudCoverOctas ?? 3}/8 octas)`}>
                    <span className="text-slate-400">Nuages :</span>
                    <span className="font-medium text-slate-200">{d.cloudCoverPct ?? 35}%</span>
                  </div>

                  {/* Dominant Vigilance if non-vert */}
                  {d.dominantVigilanceLevel && d.dominantVigilanceLevel !== 'VERT' && (
                    <div className={`mb-1 flex items-center justify-between text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${
                      d.dominantVigilanceLevel === 'ROUGE'
                        ? 'bg-red-600 text-white border-red-500'
                        : d.dominantVigilanceLevel === 'ORANGE'
                        ? 'bg-orange-500 text-slate-950 border-orange-400'
                        : 'bg-amber-400 text-slate-950 border-amber-300'
                    }`}>
                      <span>{d.dominantVigilanceEmoji || '⚠️'} {d.dominantVigilanceLevel}</span>
                      <span className="text-[8px] font-medium truncate">{d.vigilanceAlerts?.[0]?.phenomenonLabel || 'Alerte'}</span>
                    </div>
                  )}

                  {/* Weather & Snow / Rain Tags */}
                  <div className="flex flex-wrap items-center gap-1">
                    {d.snowfallCm > 0 ? (
                      <span className="flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800" title={`${d.snowfallCm} cm de neige (${d.precipitationProb}%)`}>
                        <CloudSnow className="h-2.5 w-2.5" />
                        <span>{d.snowfallCm} cm</span>
                      </span>
                    ) : d.precipitationMm > 0 ? (
                      <span className="flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800" title={rainRisk.combinedExplanation}>
                        <Droplets className="h-2.5 w-2.5" />
                        <span>{d.precipitationMm} mm</span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                        <Sun className="h-2.5 w-2.5 text-amber-400" /> Sec ({d.precipitationProb}%)
                      </span>
                    )}

                    {d.frostCategory !== 'AUCUN' && (
                      <span className={`text-[9px] font-bold px-1 py-0.2 rounded border ${getFrostBadgeClass(d.frostCategory)}`}>
                        {d.frostCategory === 'SANS_DÉGEL' ? 'Glace' : 'Gel'}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {viewMode === 'TABLE' && (
        <div className="overflow-x-auto rounded-md border border-slate-800 bg-slate-950">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-400 font-bold uppercase tracking-wider">
                <th className="p-3">Échéance</th>
                <th className="p-3">Date</th>
                <th className="p-3">Ciel & Météo</th>
                <th className="p-3">Vigilance</th>
                <th className="p-3">Nuages</th>
                <th className="p-3">Tn (°C)</th>
                <th className="p-3">Tx (°C)</th>
                <th className="p-3">Type de Gel</th>
                <th className="p-3">Précipitations (mm & %)</th>
                <th className="p-3">Chute Neige</th>
                <th className="p-3">Manteau Neige</th>
                <th className="p-3">Isotherme 0°C</th>
                <th className="p-3">Vent / Rafales</th>
                <th className="p-3">Régime Synoptique</th>
                <th className="p-3">Confiance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredDays.map((d) => {
                const richWeather = getRichWeatherInfo(d.weatherCode, true, d.precipitationMm);
                return (
                  <tr 
                    key={d.dayIndex} 
                    onClick={() => setSelectedDayIndex(d.dayIndex - 1)}
                    className={`hover:bg-blue-950/20 cursor-pointer transition ${
                      selectedDay.dayIndex === d.dayIndex ? 'bg-blue-950/30' : ''
                    }`}
                  >
                    <td className="p-3 font-bold text-blue-400">J+{d.dayIndex}</td>
                    <td className="p-3 font-semibold text-white">{d.fullDateFormatted}</td>
                    <td className="p-3">
                      <span className="flex items-center gap-1.5" title={richWeather.detailedLabel}>
                        <span className="text-lg">{richWeather.emoji}</span>
                        <span className="text-slate-200 truncate max-w-[130px]">{richWeather.shortLabel}</span>
                      </span>
                    </td>
                    <td className="p-3">
                      {d.dominantVigilanceLevel && d.dominantVigilanceLevel !== 'VERT' ? (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase inline-flex items-center gap-1 ${
                          d.dominantVigilanceLevel === 'ROUGE' ? 'bg-red-600 text-white' : d.dominantVigilanceLevel === 'ORANGE' ? 'bg-orange-500 text-slate-950' : 'bg-amber-400 text-slate-950'
                        }`}>
                          <span>{d.dominantVigilanceEmoji || '⚠️'}</span>
                          <span>{d.dominantVigilanceLevel}</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-800/40">
                          🟢 Vert
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-semibold text-slate-300">
                      ☁️ {d.cloudCoverPct ?? 35}% ({d.cloudCoverOctas ?? 3}/8)
                    </td>
                    <td className={`p-3 font-black ${d.tempMin <= 0 ? 'text-cyan-400' : 'text-slate-200'}`}>
                      {formatTemp(d.tempMin)}
                    </td>
                    <td className="p-3 font-bold text-amber-400">{formatTemp(d.tempMax)}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getFrostBadgeClass(d.frostCategory)}`}>
                        {d.frostLabel}
                      </span>
                    </td>
                    <td className="p-3">
                      {d.precipitationMm > 0 ? (
                        <span className="font-bold text-cyan-300">{d.precipitationMm} mm ({d.precipitationProb}%)</span>
                      ) : (
                        <span className="text-slate-500">0.0 mm ({d.precipitationProb}%)</span>
                      )}
                    </td>
                    <td className="p-3">
                      {d.snowfallCm > 0 ? (
                        <span className="font-black text-blue-300 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-700/40">
                          {d.snowfallCm} cm
                        </span>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                    <td className="p-3 font-semibold text-slate-300">{d.snowDepthCm} cm</td>
                    <td className="p-3 font-semibold text-indigo-300">{d.isotherm0Meters} m</td>
                    <td className="p-3 text-slate-400">{d.windSpeedKmh} km/h (raf. {d.windGustKmh} {d.windDirection})</td>
                    <td className="p-3 text-slate-400 truncate max-w-[180px]">{d.synopticRegime}</td>
                    <td className="p-3 font-bold text-blue-400">{d.modelConfidence}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {viewMode === 'CHART' && (
        <div className="space-y-4">
          <div className="rounded-md bg-slate-950 p-4 border border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
              <span>Évolution des Températures Minimales / Maximales sur 30 Jours</span>
              <span className="text-blue-400">Échéance J+1 à J+30</span>
            </h4>
            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                  <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} unit="°C" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '6px' }}
                    labelStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
                  />
                  <ReferenceLine y={0} stroke="#38bdf8" strokeWidth={1.5} strokeDasharray="3 3" label={{ value: 'Seuil de Gel 0°C', fill: '#38bdf8', fontSize: 10 }} />
                  <Line type="monotone" dataKey="tMax" name="Température Max" stroke="#f59e0b" strokeWidth={2} dot={{ r: 2 }} />
                  <Line type="monotone" dataKey="tMin" name="Température Min" stroke="#38bdf8" strokeWidth={2} dot={{ r: 2 }} />
                  <Line type="monotone" dataKey="tMean" name="Moyenne Journalière" stroke="#a855f7" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-md bg-slate-950 p-4 border border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
              <span>Chutes de Neige (cm) et Précipitations Liquides (mm) projetées</span>
              <span className="text-cyan-400">Total Neige {forecastData.totalExpectedSnowCm} cm</span>
            </h4>
            <div className="h-48 sm:h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                  <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '6px' }}
                    labelStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="snowCm" name="Neige Fraîche (cm)" fill="#60a5fa" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="rainMm" name="Pluie Liquide (mm)" fill="#34d399" radius={[2, 2, 0, 0]} />
                  <Line type="monotone" dataKey="snowDepth" name="Épaisseur Manteau Sol (cm)" stroke="#c084fc" strokeWidth={1.5} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Focus Card for Selected Day */}
      {(() => {
        const selRichWeather = getRichWeatherInfo(selectedDay.weatherCode, true, selectedDay.precipitationMm);
        const selRainRisk = getRainRiskExplanation(selectedDay.precipitationProb, selectedDay.precipitationMm, 1);
        return (
          <div className="rounded-md bg-slate-950 border border-slate-800 p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl" title={selRichWeather.detailedLabel}>{selRichWeather.emoji}</span>
                <div>
                  <span className="text-xs font-bold uppercase text-blue-400 tracking-wider">
                    Focus Approfondi • Échéance J+{selectedDay.dayIndex} ({selectedDay.modelConfidence}% indice de confiance)
                  </span>
                  <h4 className="text-base font-bold text-white mt-0.5">
                    {selectedDay.fullDateFormatted} — {selRichWeather.detailedLabel}
                  </h4>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded text-xs font-bold border ${getFrostBadgeClass(selectedDay.frostCategory)}`}>
                {selectedDay.frostLabel}
              </span>
            </div>

            {/* Vigilance Alerts for Selected Day */}
            {selectedDay.vigilanceAlerts && selectedDay.vigilanceAlerts.length > 0 && selectedDay.dominantVigilanceLevel !== 'VERT' && (
              <div className="space-y-2 rounded bg-slate-900 p-3 border border-amber-800/60">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase text-amber-300 flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
                    Vigilance & Risque — J+{selectedDay.dayIndex}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {selectedDay.vigilanceSlotSummary}
                  </span>
                </div>
                {selectedDay.vigilanceAlerts.filter(a => a.level !== 'VERT').map((alert, aIdx) => (
                  <div key={aIdx} className="rounded bg-slate-950 p-2.5 border border-slate-800 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-white">
                        <span>{alert.emoji}</span>
                        <span>{alert.title}</span>
                      </div>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                        alert.level === 'ROUGE' ? 'bg-red-600 text-white' : alert.level === 'ORANGE' ? 'bg-orange-500 text-slate-950' : 'bg-amber-400 text-slate-950'
                      }`}>
                        {alert.level}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1">{alert.message}</p>
                    <div className="mt-1.5 flex flex-wrap gap-2 text-[10px] text-slate-400">
                      <span>Créneau : <strong className="text-white">{alert.startHourFormatted} à {alert.endHourFormatted}</strong></span>
                      {alert.peakHourFormatted && <span>(Pic : <strong className="text-amber-300">{alert.peakHourFormatted}</strong>)</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                <span className="text-slate-400 font-medium">Températures :</span>
                <div className="text-xs font-bold text-white mt-1">
                  Min {formatTemp(selectedDay.tempMin)} • Max {formatTemp(selectedDay.tempMax)}
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Ressenti : {formatTemp(selectedDay.feelsLikeMin)} à {formatTemp(selectedDay.feelsLikeMax)}
                </p>
              </div>

              <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                <span className="text-slate-400 font-medium">Couverture Nuageuse :</span>
                <div className="text-xs font-bold text-slate-200 mt-1">
                  {selectedDay.cloudCoverPct ?? 35}% ({selectedDay.cloudCoverOctas ?? 3}/8 octas)
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Soleil : {selectedDay.sunshineHours} h • UV Max : {selectedDay.uvIndexMax}
                </p>
              </div>

              <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                <span className="text-slate-400 font-medium">Précipitations :</span>
                <div className="text-xs font-bold text-cyan-300 mt-1">
                  {selectedDay.precipitationMm > 0 ? `${selectedDay.precipitationMm} mm (${selectedDay.precipitationProb}%)` : `0.0 mm (${selectedDay.precipitationProb}%)`}
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5 truncate" title={selRainRisk.combinedExplanation}>
                  {selRainRisk.riskShortBadge}
                </p>
              </div>

              <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                <span className="text-slate-400 font-medium">Nivologie & LPN :</span>
                <div className="text-xs font-bold text-blue-300 mt-1">
                  {selectedDay.snowfallCm > 0 ? `${selectedDay.snowfallCm} cm de neige` : '0 cm (sec / liquide)'}
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Isotherme 0°C à {selectedDay.isotherm0Meters} m
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs pt-1">
              <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                <span className="text-slate-400 font-medium">Vent, Rafales & Pression :</span>
                <div className="text-xs font-bold text-white mt-1">
                  {selectedDay.windSpeedKmh} km/h (Raf. {selectedDay.windGustKmh} km/h) • Dir. {selectedDay.windDirection}
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Pression : {selectedDay.pressureHpa} hPa • Humidité : {selectedDay.humidityMeanPct}%
                </p>
              </div>

              <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                <span className="text-slate-400 font-medium">Masse d'air :</span>
                <div className="text-xs font-semibold text-amber-300 mt-1 truncate">
                  {selectedDay.airMassOrigin}
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                  {selectedDay.synopticRegime}
                </p>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
