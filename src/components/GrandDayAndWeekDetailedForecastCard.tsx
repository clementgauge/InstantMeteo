import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Sun, 
  CloudRain, 
  Wind, 
  Droplets, 
  Compass, 
  ChevronRight, 
  ChevronDown,
  Sparkles, 
  Info, 
  TrendingUp, 
  Thermometer, 
  Eye, 
  Gauge, 
  ShieldCheck, 
  Activity,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  AlertCircle,
  Zap,
  Mountain,
  Shirt,
  HeartPulse
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  BarChart,
  Bar
} from 'recharts';
import { LocationPoint, CurrentWeather, HourlyForecast, DailyForecast } from '../types/weather';
import { getNormalsForStation } from '../data/climateNormals';
import { getThermalTierForTemp } from '../utils/thermalTiers';
import { getRichWeatherInfo, getRainRiskExplanation, getDetailedCloudCover, getOctasFromPercent } from '../utils/weatherIcons';
import { DynamicSkyHeroArt } from './DynamicSkyHeroArt';

interface GrandDayAndWeekDetailedForecastCardProps {
  station: LocationPoint;
  weather: CurrentWeather;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  seniorMode: boolean;
  simplifiedMode?: boolean;
  tempUnit: 'C' | 'F';
  onOpenDayAnalyzer?: (dayIndex: number) => void;
}

export const GrandDayAndWeekDetailedForecastCard: React.FC<GrandDayAndWeekDetailedForecastCardProps> = ({
  station,
  weather,
  hourly,
  daily,
  seniorMode,
  simplifiedMode = false,
  tempUnit,
  onOpenDayAnalyzer
}) => {
  const [activeTab, setActiveTab] = useState<'day' | 'week' | 'curve' | 'all168h'>('day');
  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(0);
  const [selectedHourIdx, setSelectedHourIdx] = useState<number>(0);
  const [hourlyMetricFilter, setHourlyMetricFilter] = useState<'all' | 'temp' | 'rain' | 'wind' | 'convection' | 'clouds' | 'trend' | 'isotherm'>('all');
  const [showRainRiskExplanation, setShowRainRiskExplanation] = useState<boolean>(false);
  const isElevationOver100m = (station.altitude ?? 0) >= 100;

  const formatTemp = (celsius: number) => {
    if (tempUnit === 'F') {
      return `${Math.round((celsius * 9/5 + 32) * 10) / 10}°F`;
    }
    return `${celsius > 0 ? `+${celsius}` : celsius}°C`;
  };

  const formatTempSimple = (celsius: number) => {
    if (tempUnit === 'F') {
      return `${Math.round(celsius * 9/5 + 32)}°`;
    }
    return `${Math.round(celsius)}°`;
  };

  const normals = getNormalsForStation(station.id, station.latitude, station.altitude, station.name, station.country);
  const currentMonthIdx = new Date().getMonth();
  const currentMonthNormal = normals.monthly[currentMonthIdx];

  // Helper to extract exact 0-23 hour number
  const getHourNumber = (h: HourlyForecast): number => {
    if (typeof h.hourNumber === 'number' && h.hourNumber >= 0 && h.hourNumber <= 23) return h.hourNumber;
    if (h.hourLabel) {
      const match = h.hourLabel.match(/^(\d{1,2})/);
      if (match) {
        const parsed = parseInt(match[1], 10);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 23) return parsed;
      }
    }
    if (h.time) {
      const d = new Date(h.time);
      if (!isNaN(d.getTime())) return d.getHours();
    }
    return 0;
  };

  // 24-hour window from hourly forecast for rolling 24h
  const next24Hours: HourlyForecast[] = hourly.slice(0, 24);

  // Full 24-hour cycle for the current day (today)
  const today24Hours: HourlyForecast[] = (daily[0]?.hourlyList && daily[0].hourlyList.length > 0)
    ? daily[0].hourlyList
    : hourly.slice(0, 24);

  // Selected Day data
  const selectedDay: DailyForecast = daily[selectedDayIdx] || daily[0];
  const selectedDayHours: HourlyForecast[] = selectedDay.hourlyList && selectedDay.hourlyList.length > 0 
    ? selectedDay.hourlyList 
    : hourly.slice(selectedDayIdx * 24, (selectedDayIdx + 1) * 24);

  const selectedDayAnomalyTMin = Math.round((selectedDay.tempMin - currentMonthNormal.tMin) * 10) / 10;
  const selectedDayAnomalyTMax = Math.round((selectedDay.tempMax - currentMonthNormal.tMax) * 10) / 10;

  // =========================================================================
  // MODE SIMPLIFIÉ : BLOC ULTRA-COMPACT ET PROPORTIONNÉ (ZÉRO ESPACE VIDE EN DESSOUS)
  // =========================================================================
  if (simplifiedMode) {
    return (
      <div id="grand-day-week-detailed-card" className="h-full rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-gradient-to-b dark:from-[#0d182e]/95 dark:via-[#091224]/95 dark:to-[#070e1c]/95 p-3.5 sm:p-4 shadow-xl flex flex-col justify-between space-y-3 motion-card-enter">
        {/* En-tête épuré et fidèle */}
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sky-50 dark:bg-gradient-to-br dark:from-sky-500/25 dark:to-blue-600/20 border border-sky-300 dark:border-sky-400/40 text-sky-600 dark:text-sky-400 shadow-sm">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight">
                Déroulé 24h Heure par Heure
              </h2>
              <span className="rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider border bg-sky-50 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-400/40">
                Mode Simplifié
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Défilement horizontal de la météo des 24 prochaines heures
            </p>
          </div>
        </div>

        {/* Déroulé 24h Heure par Heure (Taille ajustée aux cartes, zéro espace vide sous les blocs) */}
        <div className="w-full">
          <div className="flex gap-2.5 overflow-x-auto pb-1.5 pt-0.5 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 touch-pan-x overscroll-x-contain snap-x">
            {next24Hours.map((h, i) => {
              const tier = getThermalTierForTemp(h.temperature);
              const richWeather = getRichWeatherInfo(h.weatherCode, h.isDay, h.rainMm, h.windGust);
              const isRainy = (h.rainMm ?? 0) > 0.1 || (h.precipitationProbability ?? 0) >= 45;
              return (
                <div
                  key={i}
                  className={`snap-start min-w-[144px] sm:min-w-[150px] rounded-2xl border p-3 flex flex-col justify-between space-y-2 flex-shrink-0 transition-all duration-200 ${
                    i === 0
                      ? 'border-sky-400 bg-sky-50/90 dark:border-sky-400/70 dark:bg-gradient-to-b dark:from-sky-950/60 dark:via-slate-900/90 dark:to-slate-950 shadow-md ring-1 ring-sky-400/30'
                      : isRainy
                        ? 'border-blue-300 bg-blue-50/70 dark:border-blue-500/40 dark:bg-gradient-to-b dark:from-blue-950/35 dark:to-slate-900/80 hover:border-blue-400'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100/80 dark:border-slate-800/90 dark:bg-gradient-to-b dark:from-slate-900/80 dark:to-slate-950/90 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-black px-2 py-0.5 rounded-lg ${
                      i === 0 ? 'bg-sky-500 text-white' : 'bg-white dark:bg-slate-950/80 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-800'
                    }`}>
                      {i === 0 ? 'Direct' : h.hourLabel}
                    </span>
                    <span title={richWeather.detailedLabel}>
                      <DynamicSkyHeroArt weatherCode={h.weatherCode} isDay={h.isDay ?? true} size="xs" />
                    </span>
                  </div>

                  <div>
                    <div className="flex items-baseline justify-between">
                      <div className="text-lg font-black text-slate-900 dark:text-white font-mono tabular-nums">{formatTemp(h.temperature)}</div>
                      {h.feelsLike !== undefined && (
                        <span className="text-[10px] font-semibold text-sky-700 dark:text-sky-300 font-mono">
                          Ress. {formatTempSimple(h.feelsLike)}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-medium text-slate-600 dark:text-slate-300 block truncate mt-0.5" title={richWeather.detailedLabel}>
                      {richWeather.shortLabel}
                    </span>
                  </div>

                  <div className={`px-2 py-0.5 rounded-lg text-[9px] font-bold truncate border ${tier.tailwindBg} ${tier.tailwindBorder} ${tier.tailwindText}`}>
                    {tier.iconEmoji} {tier.name.split('/')[0]}
                  </div>

                  <div className="space-y-1 pt-1.5 border-t border-slate-200 dark:border-slate-800/80 text-[10px]">
                    <div className="flex justify-between text-sky-700 dark:text-sky-300">
                      <span>Pluie</span>
                      <span className="font-bold font-mono">{h.rainMm} mm ({h.precipitationProbability}%)</span>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-300">
                      <span>Vent</span>
                      <span className="font-semibold text-teal-700 dark:text-teal-300 font-mono">
                        {h.windSpeed} km/h
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="grand-day-week-detailed-card" className="h-full rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-gradient-to-b dark:from-[#0d182e]/95 dark:via-[#091224]/95 dark:to-[#070e1c]/95 p-3.5 sm:p-5 shadow-2xl space-y-4 sm:space-y-5 motion-card-enter">
      {/* Header with 4 main view tabs — Hyper-attractive on Mobile & Simple Mode with 100% of data */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5 border-b border-slate-800/90 pb-3.5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500/25 to-blue-600/20 border border-sky-400/40 text-sky-400 shadow-lg shadow-sky-500/10">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <h2 className="text-sm sm:text-lg font-black text-white tracking-tight">
                Prévisions Heure par Heure &amp; 7 Jours
              </h2>
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider border ${
                simplifiedMode
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                  : 'bg-sky-500/20 text-sky-300 border-sky-400/40'
              }`}>
                {simplifiedMode ? '✨ Vue Visuelle Clarifiée • 100% Données' : '24h • 7 Jours • Courbe • 168h'}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
              Station : <strong className="text-slate-200">{station.name}</strong> ({station.altitude} m) • Toutes les données horaires et quotidiennes
            </p>
          </div>
        </div>

        {/* View Switcher Tabs - Grid on mobile so all 4 tabs are thumb-friendly & visible without scrolling */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap rounded-xl bg-slate-950/90 p-1 border border-slate-800/90 w-full md:w-auto gap-1 shadow-inner">
          <button
            onClick={() => setActiveTab('day')}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg text-xs font-black transition cursor-pointer ${
              activeTab === 'day'
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span>Aujourd'hui (24h)</span>
          </button>
          
          <button
            onClick={() => setActiveTab('week')}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg text-xs font-black transition cursor-pointer ${
              activeTab === 'week'
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span>Semaine 7 Jours</span>
          </button>

          <button
            onClick={() => setActiveTab('curve')}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg text-xs font-black transition cursor-pointer ${
              activeTab === 'curve'
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5 shrink-0" />
            <span>Courbe &amp; Tendance</span>
          </button>

          <button
            onClick={() => setActiveTab('all168h')}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg text-xs font-black transition cursor-pointer ${
              activeTab === 'all168h'
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <Layers className="h-3.5 w-3.5 shrink-0" />
            <span>Matrice 168h</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1 : AUJOURD'HUI 24H (ROULEAU HEURE PAR HEURE & ANALYSE DÉTAILLÉE)   */}
      {/* ========================================================================= */}
      {activeTab === 'day' && (
        <div className="space-y-4">
          {/* Pedagogical Rain Risk & Probability Explanatory Box */}
          <div className="rounded-md border border-slate-800 bg-slate-900/60 p-3.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sky-400 font-semibold text-xs uppercase tracking-wider">
                <CloudRain className="h-3.5 w-3.5" />
                <span>Guide de Lecture : Probabilité (%) vs Quantité de Pluie (mm ou L/m²)</span>
              </div>
              <button 
                onClick={() => setShowRainRiskExplanation(!showRainRiskExplanation)}
                className="text-[11px] font-semibold text-sky-400 hover:text-sky-300 underline cursor-pointer"
              >
                {showRainRiskExplanation ? 'Masquer' : 'Comprendre ces valeurs'}
              </button>
            </div>

            {showRainRiskExplanation && (
              <div className="text-xs text-slate-300 space-y-1 pt-2 border-t border-slate-800 leading-relaxed">
                <p>
                  🌧️ <strong className="text-sky-300">Le Pourcentage (%)</strong> indique la probabilité qu'au moins une averse touche votre position dans l'heure.
                </p>
                <p>
                  💧 <strong className="text-sky-300">Le Cumul (mm / Litres par m²)</strong> indique le volume d'eau attendu au sol. 1 mm = 1 Litre d'eau / m².
                </p>
                <p className="text-[11px] text-slate-400">
                  Exemple : <strong>80% avec 0.3 mm</strong> = bruine quasi certaine mais faible. <strong>20% avec 8 mm</strong> = risque faible mais averse ponctuelle potentiellement soutenue.
                </p>
              </div>
            )}
          </div>

          {/* 24-Hour Scrollable Slider */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-sky-400" />
                Déroulé Heure par Heure sur 24 Heures
              </h3>
              <span className="text-xs text-slate-400">Défilement horizontal</span>
            </div>

            <div className="flex gap-2.5 overflow-x-auto pb-2.5 pt-1 scrollbar-thin scrollbar-thumb-slate-700 touch-pan-x overscroll-x-contain snap-x">
              {next24Hours.map((h, i) => {
                const tier = getThermalTierForTemp(h.temperature);
                const richWeather = getRichWeatherInfo(h.weatherCode, h.isDay, h.rainMm, h.windGust);
                const rainRisk = getRainRiskExplanation(h.precipitationProbability, h.rainMm, 1);
                const isRainy = (h.rainMm ?? 0) > 0.1 || (h.precipitationProbability ?? 0) >= 45;
                return (
                  <div
                    key={i}
                    className={`snap-start min-w-[152px] rounded-2xl border p-3 flex flex-col justify-between space-y-2 flex-shrink-0 transition-all duration-200 ${
                      i === 0
                        ? 'border-sky-400/70 bg-gradient-to-b from-sky-950/60 via-slate-900/90 to-slate-950 shadow-lg shadow-sky-500/15 ring-1 ring-sky-400/30'
                        : isRainy
                          ? 'border-blue-500/40 bg-gradient-to-b from-blue-950/35 to-slate-900/80 hover:border-blue-400/60'
                          : 'border-slate-800/90 bg-gradient-to-b from-slate-900/80 to-slate-950/90 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-black px-2 py-0.5 rounded-lg ${
                        i === 0 ? 'bg-sky-500 text-slate-950' : 'bg-slate-950/80 text-white border border-slate-800'
                      }`}>
                        {i === 0 ? 'Direct' : h.hourLabel}
                      </span>
                      <span title={richWeather.detailedLabel}>
                        <DynamicSkyHeroArt weatherCode={h.weatherCode} isDay={h.isDay ?? true} size="xs" />
                      </span>
                    </div>

                    <div>
                      <div className="flex items-baseline justify-between">
                        <div className="text-lg font-black text-white font-mono tabular-nums">{formatTemp(h.temperature)}</div>
                        {h.feelsLike !== undefined && (
                          <span className="text-[10px] font-semibold text-sky-300 font-mono">
                            Ress. {formatTempSimple(h.feelsLike)}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-medium text-slate-300 block truncate mt-0.5" title={richWeather.detailedLabel}>
                        {richWeather.shortLabel}
                      </span>
                    </div>

                    {/* Micro-Trend Tag if present */}
                    {h.trendTag && (
                      <div className="px-1.5 py-0.5 rounded-lg text-[9px] font-bold bg-slate-950/90 border border-slate-800 text-sky-300 truncate" title={h.trendText}>
                        {h.trendTag}
                      </div>
                    )}

                    <div className={`px-2 py-0.5 rounded-lg text-[9px] font-bold truncate border ${tier.tailwindBg} ${tier.tailwindBorder} ${tier.tailwindText}`}>
                      {tier.iconEmoji} {tier.name.split('/')[0]}
                    </div>

                    <div className="space-y-1.5 pt-1.5 border-t border-slate-800/80 text-[10px]">
                      {/* Rain Risk & Volume with mini bar */}
                      <div title={rainRisk.combinedExplanation}>
                        <div className="flex justify-between text-sky-300">
                          <span>💧 Pluie</span>
                          <span className="font-bold font-mono">{h.rainMm} mm ({h.precipitationProbability}%)</span>
                        </div>
                        <div className="mt-0.5 h-1 w-full rounded-full bg-slate-950 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-sky-400 to-blue-500"
                            style={{ width: `${Math.max(4, h.precipitationProbability ?? 0)}%` }}
                          />
                        </div>
                      </div>

                      {/* Cloud Cover */}
                      <div className="flex justify-between text-slate-300" title={`Couverture nuageuse: ${h.cloudCover}% (${Math.round((h.cloudCover ?? 40) / 12.5)}/8 octas)`}>
                        <span className="text-slate-400">☁️ Nuages</span>
                        <span className="font-semibold text-slate-200 font-mono">{h.cloudCover ?? 30}% ({Math.round((h.cloudCover ?? 30) / 12.5)}/8)</span>
                      </div>

                      {/* Wind & Gusts */}
                      <div className="flex justify-between text-slate-300">
                        <span className="text-slate-400">💨 Vent</span>
                        <span className="font-semibold text-teal-300 font-mono">
                          {h.windSpeed} <span className="text-[9px] text-slate-400">(raf.{h.windGust ?? Math.round(h.windSpeed * 1.3)})</span> {h.windDirectionCompass}
                        </span>
                      </div>

                      {isElevationOver100m && (
                        <div className="flex justify-between text-indigo-300 pt-0.5 border-t border-slate-800/60 font-mono text-[9px]">
                          <span>🏔️ Iso 0°C</span>
                          <span className="font-bold text-white">
                            {h.isotherm0Meters ?? Math.round(Math.max(station.altitude ?? 0, (station.altitude ?? 0) + (h.temperature / 0.0065)))} m
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Aperçu Rapide 7 Jours directement visible sous le 24h (Idéal Mobile & Mode Simple) */}
          <div className="rounded-2xl border border-slate-800/90 bg-slate-950/70 p-3 sm:p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-sky-400" />
                <h4 className="text-xs sm:text-sm font-black text-white">
                  Synthèse des 7 Prochains Jours (J+0 à J+6)
                </h4>
              </div>
              <button
                onClick={() => setActiveTab('week')}
                className="text-[11px] font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer"
              >
                <span>Détail 24h par jour</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {daily.slice(0, 7).map((d, dIdx) => {
                const isToday = dIdx === 0;
                const richW = getRichWeatherInfo(d.weatherCode, true, d.precipitationSumMm ?? d.rainMm ?? 0);
                return (
                  <button
                    key={dIdx}
                    onClick={() => {
                      setSelectedDayIdx(dIdx);
                      setActiveTab('week');
                    }}
                    className={`rounded-xl border p-2.5 text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isToday
                        ? 'border-sky-500/50 bg-sky-950/30 hover:border-sky-400'
                        : 'border-slate-800/90 bg-slate-900/70 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-black text-white truncate">
                        {isToday ? "Aujourd'hui" : d.dayLabel}
                      </span>
                      <DynamicSkyHeroArt weatherCode={d.weatherCode} isDay={true} size="xs" />
                    </div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">{richW.shortLabel}</div>
                    <div className="mt-2 flex items-center justify-between text-xs font-black font-mono">
                      <span className="text-blue-300">{formatTempSimple(d.tempMin)}</span>
                      <div className="flex-1 mx-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-500 via-emerald-400 to-amber-400 opacity-85" />
                      <span className="text-amber-300">{formatTempSimple(d.tempMax)}</span>
                    </div>
                    <div className="mt-1.5 flex items-center justify-between text-[10px] text-sky-300 font-mono">
                      <span>💧 {d.precipitationProbability}%</span>
                      <span>{d.precipitationSumMm ?? d.rainMm ?? 0} mm</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Temperature & Rain Recharts Chart */}
          <div className="rounded-md border border-slate-800 bg-slate-900/60 p-3.5 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Courbe Thermique (24h)
            </h4>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={next24Hours.map(h => ({ hour: h.hourLabel, temp: h.temperature, rain: h.rainMm }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                  <XAxis dataKey="hour" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" fontSize={10} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '6px', fontSize: '11px' }}
                    labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="temp" stroke="#0284C7" strokeWidth={2} fill="#0284C7" fillOpacity={0.15} name="Température (°C)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tendance de la journée placée directement après la courbe */}
          <div className="rounded-md border border-slate-800 bg-slate-900/60 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-500/20 text-sky-400">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <h4 className="text-sm font-black text-white tracking-wide">
                  Tendance de la journée
                </h4>
              </div>
              <div className="flex items-center gap-4 text-[10px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  <span>Température (°{tempUnit})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-sky-500" />
                  <span>Ressenti (°{tempUnit})</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-12 sm:col-span-8 relative h-32 flex flex-col justify-between">
                <div className="absolute left-0 top-0 bottom-5 flex flex-col justify-between text-[9px] text-slate-500 font-mono">
                  <span>{formatTempSimple((daily[0]?.tempMax ?? weather.temperature) + 2)}</span>
                  <span>{formatTempSimple(((daily[0]?.tempMax ?? weather.temperature) + (daily[0]?.tempMin ?? weather.temperature)) / 2)}</span>
                  <span>{formatTempSimple((daily[0]?.tempMin ?? weather.temperature) - 2)}</span>
                </div>

                <div className="ml-8 mr-1 h-24 relative">
                  <svg viewBox="0 0 200 90" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                    <line x1="0" y1="15" x2="200" y2="15" stroke="#1e293b" strokeDasharray="3 3" />
                    <line x1="0" y1="45" x2="200" y2="45" stroke="#1e293b" strokeDasharray="3 3" />
                    <line x1="0" y1="75" x2="200" y2="75" stroke="#1e293b" strokeDasharray="3 3" />
                    <line x1="140" y1="0" x2="140" y2="85" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="2 2" />
                    <path d="M 0 65 Q 40 60 70 45 T 140 25 T 200 40" fill="none" stroke="#f59e0b" strokeWidth="2.5" />
                    <path d="M 0 75 Q 40 70 70 55 T 140 35 T 200 50" fill="none" stroke="#0284c7" strokeWidth="2" />
                    <circle cx="140" cy="25" r="4" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
                    <circle cx="140" cy="35" r="3.5" fill="#0284c7" stroke="#ffffff" strokeWidth="1" />
                  </svg>

                  <div className="absolute -top-3 left-[68%] -translate-x-1/2 px-2 py-0.5 rounded-full bg-blue-600 text-white text-[9px] font-bold shadow">
                    Maintenant
                  </div>
                </div>

                <div className="ml-8 flex items-center justify-between text-[9px] text-slate-400 font-mono">
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

              <div className="col-span-12 sm:col-span-4 grid grid-cols-2 sm:grid-cols-1 gap-2 border-t sm:border-t-0 sm:border-l border-slate-800/80 pt-3 sm:pt-0 sm:pl-4">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-slate-400">Temp. actuelle</span>
                  <span className="text-sm font-black text-white">{formatTemp(weather.temperature)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-slate-400">Ressenti</span>
                  <span className="text-sm font-black text-sky-400">{formatTemp(weather.feelsLike)}</span>
                </div>
                <div className="flex justify-between items-center col-span-2 sm:col-span-1">
                  <span className="text-[11px] text-slate-400">Min / Max</span>
                  <span className="text-xs font-black">
                    <span className="text-blue-400">{formatTemp(daily[0]?.tempMin ?? weather.temperature)}</span>
                    <span className="text-slate-600 mx-1">/</span>
                    <span className="text-amber-400">{formatTemp(daily[0]?.tempMax ?? weather.temperature)}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2.5 : COURBE & TENDANCE DE LA JOURNÉE                                */}
      {/* ========================================================================= */}
      {activeTab === 'curve' && (
        <div className="space-y-4">
          <div className="rounded-md border border-slate-800 bg-slate-900/60 p-3.5 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Courbe Thermique &amp; Précipitations (24h)
            </h4>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={next24Hours.map(h => ({ hour: h.hourLabel, temp: h.temperature, rain: h.rainMm }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                  <XAxis dataKey="hour" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" fontSize={10} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '6px', fontSize: '11px' }}
                    labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="temp" stroke="#0284C7" strokeWidth={2.5} fill="#0284C7" fillOpacity={0.18} name="Température (°C)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tendance de la journée placée après la courbe */}
          <div className="rounded-md border border-slate-800 bg-slate-900/60 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-500/20 text-sky-400">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <h4 className="text-sm font-black text-white tracking-wide">
                  Tendance de la journée
                </h4>
              </div>
              <div className="flex items-center gap-4 text-[10px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  <span>Température (°{tempUnit})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-sky-500" />
                  <span>Ressenti (°{tempUnit})</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-12 sm:col-span-8 relative h-32 flex flex-col justify-between">
                <div className="ml-2 mr-1 h-24 relative">
                  <svg viewBox="0 0 200 90" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                    <line x1="0" y1="15" x2="200" y2="15" stroke="#1e293b" strokeDasharray="3 3" />
                    <line x1="0" y1="45" x2="200" y2="45" stroke="#1e293b" strokeDasharray="3 3" />
                    <line x1="0" y1="75" x2="200" y2="75" stroke="#1e293b" strokeDasharray="3 3" />
                    <line x1="140" y1="0" x2="140" y2="85" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="2 2" />
                    <path d="M 0 65 Q 40 60 70 45 T 140 25 T 200 40" fill="none" stroke="#f59e0b" strokeWidth="2.5" />
                    <path d="M 0 75 Q 40 70 70 55 T 140 35 T 200 50" fill="none" stroke="#0284c7" strokeWidth="2" />
                    <circle cx="140" cy="25" r="4" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
                    <circle cx="140" cy="35" r="3.5" fill="#0284c7" stroke="#ffffff" strokeWidth="1" />
                  </svg>
                </div>
                <div className="ml-2 flex items-center justify-between text-[9px] text-slate-400 font-mono">
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

              <div className="col-span-12 sm:col-span-4 grid grid-cols-2 sm:grid-cols-1 gap-2 border-t sm:border-t-0 sm:border-l border-slate-800/80 pt-3 sm:pt-0 sm:pl-4">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-slate-400">Temp. actuelle</span>
                  <span className="text-sm font-black text-white">{formatTemp(weather.temperature)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-slate-400">Ressenti</span>
                  <span className="text-sm font-black text-sky-400">{formatTemp(weather.feelsLike)}</span>
                </div>
                <div className="flex justify-between items-center col-span-2 sm:col-span-1">
                  <span className="text-[11px] text-slate-400">Min / Max</span>
                  <span className="text-xs font-black">
                    <span className="text-blue-400">{formatTemp(daily[0]?.tempMin ?? weather.temperature)}</span>
                    <span className="text-slate-600 mx-1">/</span>
                    <span className="text-amber-400">{formatTemp(daily[0]?.tempMax ?? weather.temperature)}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2 : SEMAINE 7 JOURS (AVEC TOUTES LES 24 HEURES DU JOUR SÉLECTIONNÉ) */}
      {/* ========================================================================= */}
      {activeTab === 'week' && (
        <div className="space-y-5">
          {/* 7-Day Selector Strip */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-sky-400" />
                Sélection du jour (J+0 à J+6)
              </h3>
              <span className="text-xs text-slate-400">Cliquez pour afficher le détail 24h</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
              {daily.slice(0, 7).map((d, dIdx) => {
                const isSelected = dIdx === selectedDayIdx;
                const isToday = dIdx === 0;
                const minTier = getThermalTierForTemp(d.tempMin);
                const maxTier = getThermalTierForTemp(d.tempMax);
                const richWeather = getRichWeatherInfo(d.weatherCode, true, d.precipitationSumMm ?? d.rainMm ?? 0);
                const rainRisk = getRainRiskExplanation(d.precipitationProbability, d.precipitationSumMm ?? d.rainMm ?? 0, d.precipitationHours ?? 1);
                return (
                  <button
                    key={dIdx}
                    onClick={() => setSelectedDayIdx(dIdx)}
                    className={`rounded-md border p-3 text-left transition cursor-pointer relative flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#0284C7] bg-slate-900 ring-1 ring-[#0284C7]'
                        : isToday
                        ? 'border-slate-700 bg-slate-900/60'
                        : 'border-slate-800 bg-slate-950 hover:border-slate-700 hover:bg-slate-900/50'
                    }`}
                  >
                    <div>
                      {isToday && (
                        <span className="rounded bg-sky-950/80 text-sky-300 border border-sky-800/50 px-1.5 py-0.5 text-[9px] font-bold uppercase mb-1 inline-block">
                          Aujourd'hui
                        </span>
                      )}

                      <div className="font-bold text-white text-xs">
                        {isToday ? "Aujourd'hui" : d.dayLabel}
                      </div>
                      <span className="text-[10px] text-slate-400 line-clamp-1 mt-0.5" title={richWeather.detailedLabel}>
                        {richWeather.shortLabel}
                      </span>
                    </div>

                    <div className="my-2 flex justify-center" title={richWeather.detailedLabel}>
                      <DynamicSkyHeroArt weatherCode={d.weatherCode} isDay={true} size="sm" />
                    </div>

                    <div>
                      <div className="flex justify-between items-baseline text-xs font-semibold">
                        <span className="text-blue-300">{formatTemp(d.tempMin)}</span>
                        <span className="text-slate-600">•</span>
                        <span className="text-amber-300">{formatTemp(d.tempMax)}</span>
                      </div>

                      {/* Vigilance pill tag if non-vert */}
                      {d.dominantVigilanceLevel && d.dominantVigilanceLevel !== 'VERT' && (
                        <div className={`mt-1.5 flex items-center justify-between text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${
                          d.dominantVigilanceLevel === 'ROUGE'
                            ? 'bg-red-600 text-white border-red-400'
                            : d.dominantVigilanceLevel === 'ORANGE'
                            ? 'bg-orange-500 text-slate-950 border-orange-300'
                            : 'bg-amber-400 text-slate-950 border-amber-300'
                        }`}>
                          <span>{d.dominantVigilanceEmoji || '⚠️'} {d.dominantVigilanceLevel}</span>
                          <span className="text-[8px] font-medium truncate">Alerte</span>
                        </div>
                      )}

                      {/* Cloud cover mean */}
                      <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-300 bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-800">
                        <span className="text-slate-400">Nuages :</span>
                        <span className="font-semibold text-slate-200">☁️ {d.cloudCoverMean ?? 40}%</span>
                      </div>

                      {/* Rain Risk Badge */}
                      <div className="mt-1.5 flex items-center justify-between text-[10px] font-semibold text-sky-300 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800" title={rainRisk.combinedExplanation}>
                        <span>{d.precipitationProbability}%</span>
                        <span>{d.precipitationSumMm ?? d.rainMm ?? 0} mm</span>
                      </div>

                      <div className="mt-2 pt-1 border-t border-slate-800 text-[9px] text-slate-400 truncate">
                        {maxTier.iconEmoji} {maxTier.name.split('/')[0]}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Day In-Depth Report */}
          <div className="rounded-md border border-slate-800 bg-slate-900/40 p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-sky-950/60 text-sky-300 border border-sky-800/50 px-2 py-0.5 text-xs font-semibold">
                    Détail de la journée
                  </span>
                  <span className="text-xs text-slate-400">{selectedDay.fullDateFormatted || selectedDay.date}</span>
                </div>
                <h3 className="text-lg font-bold text-white mt-1">
                  {selectedDayIdx === 0 ? "Aujourd'hui" : selectedDay.dayLabel} — {selectedDay.weatherDescription}
                </h3>
              </div>

              {onOpenDayAnalyzer && (
                <button
                  onClick={() => onOpenDayAnalyzer(selectedDayIdx)}
                  className="flex items-center gap-1.5 rounded bg-[#0284C7] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-sky-600 transition cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Analyseur détaillé</span>
                </button>
              )}
            </div>

            {/* Vigilance Banner for the Selected Day if any alerts */}
            {selectedDay.vigilanceAlerts && selectedDay.vigilanceAlerts.length > 0 && selectedDay.dominantVigilanceLevel !== 'VERT' && (
              <div className="space-y-2.5 rounded-md bg-slate-900/60 p-3.5 border border-amber-500/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
                    Vigilance ({selectedDay.dayLabel})
                  </span>
                  <span className="text-[11px] font-medium text-slate-400">
                    {selectedDay.vigilanceAlerts[0]?.lastUpdatedTimestamp || 'Actualisation AROME/ECMWF'}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {selectedDay.vigilanceAlerts.map((alert, aIdx) => {
                    const isRouge = alert.level === 'ROUGE';
                    const isOrange = alert.level === 'ORANGE';
                    const borderBg = isRouge
                      ? 'border-red-500/60 bg-red-950/30 text-red-100'
                      : isOrange
                      ? 'border-orange-500/60 bg-orange-950/30 text-orange-100'
                      : 'border-amber-500/50 bg-amber-950/20 text-amber-100';

                    const badgeClass = isRouge
                      ? 'bg-red-600 text-white'
                      : isOrange
                      ? 'bg-orange-500 text-slate-950 font-bold'
                      : 'bg-amber-400 text-slate-950 font-bold';

                    return (
                      <div key={aIdx} className={`rounded-md border p-3 ${borderBg}`}>
                        <div className="flex flex-wrap items-start justify-between gap-2 border-b border-white/10 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{alert.emoji}</span>
                            <div>
                              <span className={`rounded px-1.5 py-0.5 text-[9px] uppercase font-bold tracking-wider ${badgeClass}`}>
                                Vigilance {alert.level}
                              </span>
                              <h5 className="font-bold text-xs text-white mt-0.5">
                                {alert.title}
                              </h5>
                            </div>
                          </div>
                          {alert.severityMetric && (
                            <span className="rounded bg-slate-950/80 px-2 py-0.5 text-[10px] font-semibold text-slate-200 border border-white/10">
                              {alert.severityMetric}
                            </span>
                          )}
                        </div>

                        {/* Timing Slot */}
                        <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-950/70 p-2 rounded border border-white/10 text-xs">
                          <div>
                            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Début</span>
                            <span className="font-bold text-white">{alert.startHourFormatted}</span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-semibold text-amber-300 block">Pic</span>
                            <span className="font-bold text-amber-300">{alert.peakHourFormatted}</span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-semibold text-sky-300 block">Fin</span>
                            <span className="font-bold text-sky-300">{alert.endHourFormatted}</span>
                          </div>
                        </div>

                        <p className="mt-2 text-xs text-slate-200 leading-relaxed font-normal">
                          {alert.message}
                        </p>

                        {alert.safetyInstructions && alert.safetyInstructions.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-white/10 space-y-1">
                            <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block">
                              Consignes de Prudence :
                            </span>
                            <ul className="list-disc list-inside text-[10px] text-slate-300 space-y-0.5">
                              {alert.safetyInstructions.map((inst, iIdx) => (
                                <li key={iIdx}>{inst}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Core Thermal & Climate comparison for selected day */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="rounded-md bg-slate-900/70 p-3 border border-slate-800">
                <span className="text-xs text-slate-400 block">Température Minimale</span>
                <span className="text-lg font-bold text-blue-300 mt-1 block">{formatTemp(selectedDay.tempMin)}</span>
                <span className="text-[11px] text-slate-400 mt-0.5 block">
                  Normale : {currentMonthNormal.tMin}°C ({selectedDayAnomalyTMin >= 0 ? `+${selectedDayAnomalyTMin}` : selectedDayAnomalyTMin}°C)
                </span>
              </div>

              <div className="rounded-md bg-slate-900/70 p-3 border border-slate-800">
                <span className="text-xs text-slate-400 block">Température Maximale</span>
                <span className="text-lg font-bold text-amber-300 mt-1 block">{formatTemp(selectedDay.tempMax)}</span>
                <span className="text-[11px] text-slate-400 mt-0.5 block">
                  Normale : {currentMonthNormal.tMax}°C ({selectedDayAnomalyTMax >= 0 ? `+${selectedDayAnomalyTMax}` : selectedDayAnomalyTMax}°C)
                </span>
              </div>

              <div className="rounded-md bg-slate-900/70 p-3 border border-slate-800">
                <span className="text-xs text-slate-400 block">Précipitations Attendues</span>
                <span className="text-lg font-bold text-sky-300 mt-1 block">
                  {selectedDay.precipitationSumMm ?? selectedDay.rainMm ?? 0} mm (L/m²)
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5 block">
                  Probabilité : {selectedDay.precipitationProbability}%
                </span>
              </div>

              <div className="rounded-md bg-slate-900/70 p-3 border border-slate-800">
                <span className="text-xs text-slate-400 block">Vent Maximal & Rafales</span>
                <span className="text-lg font-bold text-teal-300 mt-1 block">
                  {selectedDay.windSpeedMax} km/h (raf. {selectedDay.windGustMax ?? Math.round(selectedDay.windSpeedMax * 1.35)})
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5 block">
                  Direction : {selectedDay.dominantWindDir || 'SO'}
                </span>
              </div>
            </div>

            {/* Precipitation & Thermal Clarity Notice for Selected Day */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Rain clarity box */}
              <div className="rounded-md border border-slate-800 bg-slate-900/60 p-3.5 space-y-1.5">
                <div className="flex items-center gap-2 text-sky-400 font-semibold text-xs uppercase tracking-wider">
                  <CloudRain className="h-3.5 w-3.5" />
                  <span>Diagnostic Précipitations</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedDay.rainTimingSummary || "Temps sec stable sur l'ensemble de la journée."}
                </p>
                <div className="text-[11px] text-slate-400 flex items-center gap-2">
                  <span>Équivalent eau : <strong className="text-slate-200">{selectedDay.precipitationSumMm ?? selectedDay.rainMm ?? 0} L/m²</strong></span>
                  <span>•</span>
                  <span>Durée active : <strong className="text-slate-200">{selectedDay.precipitationHours ?? 0}h</strong></span>
                </div>
              </div>

              {/* Thermal tiers summary box */}
              <div className="rounded-md border border-slate-800 bg-slate-900/60 p-3.5 space-y-1.5">
                <div className="flex items-center gap-2 text-amber-300 font-semibold text-xs uppercase tracking-wider">
                  <Thermometer className="h-3.5 w-3.5" />
                  <span>Paliers Thermiques</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  {selectedDay.thermalTierSummary || "Douceur de saison."}
                </p>
                <div className="text-[11px] text-slate-400 flex items-center gap-2">
                  <span>Isotherme 0°C : <strong className="text-slate-200">{selectedDay.isotherm0Altitude || 2500} m</strong></span>
                  <span>•</span>
                  <span>Évapotranspiration : <strong className="text-slate-200">{selectedDay.et0Mm || 3.5} mm</strong></span>
                </div>
              </div>
            </div>

            {/* Complete 24-Hour Table for the Selected Day */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-sky-400" />
                  Détail Heure par Heure du Jour Sélectionné (00h à 23h)
                </h4>
                <span className="text-[11px] text-slate-400">24 relevés horaires continus</span>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700">
                {selectedDayHours.map((h, hIdx) => {
                  const tier = getThermalTierForTemp(h.temperature);
                  const richWeather = getRichWeatherInfo(h.weatherCode, h.isDay, h.rainMm, h.windGust);
                  const rainRisk = getRainRiskExplanation(h.precipitationProbability, h.rainMm, 1);
                  return (
                    <div
                      key={hIdx}
                      className="min-w-[145px] rounded-md border border-slate-800 bg-slate-900/80 p-2.5 flex-shrink-0 space-y-2 transition hover:border-slate-700"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{h.hourLabel}</span>
                        <span title={richWeather.detailedLabel}>
                          <DynamicSkyHeroArt weatherCode={h.weatherCode} isDay={h.isDay ?? true} size="xs" />
                        </span>
                      </div>

                      <div>
                        <div className="text-base font-bold text-white">{formatTemp(h.temperature)}</div>
                        <span className="text-[10px] text-slate-400 block truncate" title={richWeather.detailedLabel}>
                          {richWeather.shortLabel}
                        </span>
                      </div>

                      {/* Micro-Trend Tag */}
                      {h.trendTag && (
                        <div className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-slate-950 border border-slate-800 text-sky-300 truncate" title={h.trendText}>
                          {h.trendTag}
                        </div>
                      )}

                      <div className={`px-1.5 py-0.5 rounded text-[8px] font-semibold truncate border ${tier.tailwindBg} ${tier.tailwindBorder} ${tier.tailwindText}`}>
                        {tier.iconEmoji} {tier.name.split('/')[0]}
                      </div>

                      <div className="space-y-1 pt-1 border-t border-slate-800 text-[10px]">
                        {/* Cloud cover */}
                        <div className="flex justify-between text-slate-300" title={`Couverture totale: ${h.cloudCover}% (${Math.round((h.cloudCover ?? 30) / 12.5)}/8 octas)`}>
                          <span className="text-slate-400">Nuages</span>
                          <span className="font-semibold text-slate-200">☁️ {h.cloudCover ?? 30}% ({Math.round((h.cloudCover ?? 30) / 12.5)}/8)</span>
                        </div>

                        {/* Rain */}
                        <div className="flex justify-between text-sky-300" title={rainRisk.combinedExplanation}>
                          <span>Pluie</span>
                          <span className="font-semibold">{h.rainMm} mm ({h.precipitationProbability}%)</span>
                        </div>

                        {/* Wind */}
                        <div className="flex justify-between text-slate-400">
                          <span>Vent</span>
                          <span>{h.windSpeed} km/h {h.windDirectionCompass}</span>
                        </div>

                        {isElevationOver100m && (
                          <div className="text-[9px] text-sky-300 pt-1 border-t border-slate-800/80 flex items-center justify-between font-mono font-semibold" title={`Altitude station: ${station.altitude} m • Écart: ${h.isothermStationDelta ?? Math.round((h.isotherm0Meters ?? 0) - (station.altitude ?? 0))} m`}>
                            <span className="flex items-center gap-0.5">
                              <Mountain className="h-2.5 w-2.5 text-sky-400" />
                              <span>Iso 0°C</span>
                            </span>
                            <span className="font-bold text-white">
                              {h.isotherm0Meters ?? Math.round(Math.max(station.altitude ?? 0, (station.altitude ?? 0) + (h.temperature / 0.0065)))} m
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3 : MATRICE 168H CONTINU (TOUTE LA SEMAINE HEURE PAR HEURE)           */}
      {/* ========================================================================= */}
      {activeTab === 'all168h' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-sky-400" />
                Matrice 168 Heures (7 Jours en Continu)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Données heure par heure : Température, précipitations, nébulosité et risques
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap gap-1 bg-slate-900 p-1 rounded-md border border-slate-800 text-xs">
              <button
                onClick={() => setHourlyMetricFilter('all')}
                className={`px-2.5 py-1 rounded font-semibold transition cursor-pointer ${
                  hourlyMetricFilter === 'all' ? 'bg-[#0284C7] text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Tout Afficher
              </button>
              <button
                onClick={() => setHourlyMetricFilter('temp')}
                className={`px-2.5 py-1 rounded font-semibold transition cursor-pointer ${
                  hourlyMetricFilter === 'temp' ? 'bg-[#0284C7] text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                🌡️ Thermique
              </button>
              <button
                onClick={() => setHourlyMetricFilter('rain')}
                className={`px-2.5 py-1 rounded font-semibold transition cursor-pointer ${
                  hourlyMetricFilter === 'rain' ? 'bg-[#0284C7] text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                🌧️ Pluie
              </button>
              <button
                onClick={() => setHourlyMetricFilter('clouds')}
                className={`px-2.5 py-1 rounded font-semibold transition cursor-pointer ${
                  hourlyMetricFilter === 'clouds' ? 'bg-[#0284C7] text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                ☁️ Nuages
              </button>
              <button
                onClick={() => setHourlyMetricFilter('trend')}
                className={`px-2.5 py-1 rounded font-semibold transition cursor-pointer ${
                  hourlyMetricFilter === 'trend' ? 'bg-[#0284C7] text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                📈 Tendances
              </button>
              <button
                onClick={() => setHourlyMetricFilter('convection')}
                className={`px-2.5 py-1 rounded font-semibold transition cursor-pointer ${
                  hourlyMetricFilter === 'convection' ? 'bg-[#0284C7] text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                ⚡ Orage
              </button>
              {isElevationOver100m && (
                <button
                  onClick={() => setHourlyMetricFilter('isotherm')}
                  className={`px-2.5 py-1 rounded font-semibold transition cursor-pointer ${
                    hourlyMetricFilter === 'isotherm' ? 'bg-[#0284C7] text-white' : 'text-sky-400 hover:text-white border border-sky-800/40'
                  }`}
                >
                  🏔️ Iso 0°C ({station.altitude}m)
                </button>
              )}
            </div>
          </div>

          {/* Full 168-Hour Scrollable Grid Matrix */}
          <div className="overflow-x-auto rounded-md border border-slate-800 bg-slate-950 p-3.5">
            <div className="min-w-[1100px] space-y-3">
              <div className="grid grid-cols-7 gap-2.5">
                {Array.from({ length: 7 }).map((_, dIdx) => {
                  const daySlice = hourly.slice(dIdx * 24, (dIdx + 1) * 24);
                  const dayObj = daily[dIdx] || { dayLabel: `J+${dIdx}`, date: '' };
                  return (
                    <div key={dIdx} className="space-y-1.5">
                      <div className="rounded-md bg-slate-900 p-2 border border-slate-800 text-center">
                        <div className="text-xs font-bold text-white">{dayObj.dayLabel}</div>
                        <div className="text-[10px] text-slate-400">{dayObj.date ? dayObj.date.split('T')[0] : ''}</div>
                      </div>

                      <div className="space-y-1">
                        {daySlice.map((h, hIdx) => {
                          const tier = getThermalTierForTemp(h.temperature);
                          const richWeather = getRichWeatherInfo(h.weatherCode, h.isDay, h.rainMm, h.windGust);
                          return (
                            <div
                              key={hIdx}
                              className={`rounded p-1.5 border text-xs transition ${
                                h.rainMm > 0.5 
                                   ? 'border-sky-500/40 bg-sky-950/30' 
                                   : (h.thunderstormProbability ?? 0) > 40
                                   ? 'border-amber-500/40 bg-amber-950/30'
                                   : 'border-slate-800 bg-slate-900/60'
                              }`}
                            >
                              <div className="flex items-center justify-between font-semibold">
                                <span className="text-slate-300">{h.hourLabel}</span>
                                <span className="text-sm" title={richWeather.detailedLabel}>{richWeather.emoji}</span>
                                <span className="text-white">{formatTemp(h.temperature)}</span>
                              </div>

                              {(hourlyMetricFilter === 'all' || hourlyMetricFilter === 'temp') && (
                                <div className={`mt-1 px-1 py-0.5 rounded text-[8px] font-semibold truncate ${tier.tailwindBg} ${tier.tailwindText}`}>
                                  {tier.iconEmoji} {tier.name.split('/')[0]}
                                </div>
                              )}

                              {(hourlyMetricFilter === 'all' || hourlyMetricFilter === 'rain') && (
                                <div className="mt-1 flex items-center justify-between text-[9px] text-sky-300">
                                  <span>Pluie : {h.rainMm} mm</span>
                                  <span>{h.precipitationProbability}%</span>
                                </div>
                              )}

                              {(hourlyMetricFilter === 'all' || hourlyMetricFilter === 'clouds') && (
                                <div className="mt-1 flex items-center justify-between text-[9px] text-slate-200 bg-slate-950 px-1 py-0.5 rounded border border-slate-800">
                                  <span className="text-slate-400">Nuages :</span>
                                  <span className="font-semibold">☁️ {h.cloudCover ?? 30}% ({Math.round((h.cloudCover ?? 30)/12.5)}/8)</span>
                                </div>
                              )}

                              {(hourlyMetricFilter === 'all' || hourlyMetricFilter === 'trend') && h.trendTag && (
                                <div className="mt-1 px-1 py-0.5 rounded text-[8px] font-semibold bg-slate-950 text-sky-300 border border-slate-800 truncate" title={h.trendText}>
                                  {h.trendTag}
                                </div>
                              )}

                              {(hourlyMetricFilter === 'all' || hourlyMetricFilter === 'convection') && (
                                <div className="mt-1 flex items-center justify-between text-[9px] text-amber-300">
                                  <span>Orage : {h.thunderstormProbability ?? 0}%</span>
                                  <span>CAPE : {h.convectiveCape ?? 0}</span>
                                </div>
                              )}

                              {(hourlyMetricFilter === 'all' || hourlyMetricFilter === 'isotherm') && isElevationOver100m && (
                                <div className="mt-1 flex items-center justify-between text-[9px] font-mono text-sky-300 bg-slate-950 px-1 py-0.5 rounded">
                                  <span>Iso 0°C :</span>
                                  <span className="font-bold text-white">
                                    {h.isotherm0Meters ?? Math.round(Math.max(station.altitude ?? 0, (station.altitude ?? 0) + (h.temperature / 0.0065)))}m
                                  </span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
