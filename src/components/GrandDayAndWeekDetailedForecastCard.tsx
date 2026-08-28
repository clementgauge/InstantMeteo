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

interface GrandDayAndWeekDetailedForecastCardProps {
  station: LocationPoint;
  weather: CurrentWeather;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  seniorMode: boolean;
  tempUnit: 'C' | 'F';
  onOpenDayAnalyzer?: (dayIndex: number) => void;
}

export const GrandDayAndWeekDetailedForecastCard: React.FC<GrandDayAndWeekDetailedForecastCardProps> = ({
  station,
  weather,
  hourly,
  daily,
  seniorMode,
  tempUnit,
  onOpenDayAnalyzer
}) => {
  const [activeTab, setActiveTab] = useState<'day' | 'week' | 'all168h'>('day');
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

  return (
    <div id="grand-day-week-detailed-card" className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 sm:p-7 shadow-2xl backdrop-blur-xl space-y-6">
      {/* Header with 3 main view tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-white">
                Prévisions Détaillées du Jour & de la Semaine
              </h2>
              <span className="rounded-full bg-blue-500/20 px-2.5 py-0.5 text-[10px] font-bold text-blue-300 border border-blue-500/30">
                Haute Précision Heure par Heure
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Station : <strong className="text-slate-200">{station.name}</strong> ({station.altitude} m) • Réactualisation continue
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex rounded-2xl bg-slate-950 p-1 border border-slate-800 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('day')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'day'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Aujourd'hui (24h)</span>
          </button>
          
          <button
            onClick={() => setActiveTab('week')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'week'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Semaine 7 Jours (Jour par Jour)</span>
          </button>

          <button
            onClick={() => setActiveTab('all168h')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'all168h'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Matrice 168h Continu</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1 : AUJOURD'HUI 24H (ROULEAU HEURE PAR HEURE & ANALYSE DÉTAILLÉE)   */}
      {/* ========================================================================= */}
      {activeTab === 'day' && (
        <div className="space-y-6">
          {/* Pedagogical Rain Risk & Probability Explanatory Box */}
          <div className="rounded-2xl border border-cyan-500/30 bg-cyan-950/30 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-cyan-300 font-black text-xs uppercase tracking-wider">
                <CloudRain className="h-4 w-4 text-cyan-400" />
                <span>Guide de Lecture : Probabilité (%) vs Quantité de Pluie (mm ou L/m²)</span>
              </div>
              <button 
                onClick={() => setShowRainRiskExplanation(!showRainRiskExplanation)}
                className="text-[11px] font-bold text-cyan-400 hover:text-cyan-200 underline cursor-pointer"
              >
                {showRainRiskExplanation ? 'Masquer l\'explication' : 'Comment lire ces chiffres ?'}
              </button>
            </div>

            {showRainRiskExplanation && (
              <div className="text-xs text-slate-300 space-y-1.5 pt-2 border-t border-cyan-500/20 leading-relaxed">
                <p>
                  🌧️ <strong className="text-cyan-300">Le Pourcentage (%)</strong> indique la probabilité qu'au moins une averse touche votre position dans l'heure (ex: 80% = forte certitude d'avoir de l'eau).
                </p>
                <p>
                  💧 <strong className="text-cyan-300">Le Cumul (mm / Litres par m²)</strong> indique le volume d'eau attendu au sol. 1 mm de pluie équivaut exactement à 1 Litre d'eau par mètre carré.
                </p>
                <p className="text-[11px] text-slate-400 italic">
                  💡 Exemple : <strong>80% avec 0.3 mm</strong> = bruine presque certaine mais très légère. <strong>20% avec 8 mm</strong> = risque faible mais grosse averse orageuse si elle passe sur la commune.
                </p>
              </div>
            )}
          </div>

          {/* 24-Hour Scrollable Slider */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-400" />
                Déroulé Heure par Heure sur les Prochaines 24 Heures (Icônes, Nuages & Tendances)
              </h3>
              <span className="text-xs text-slate-400">Glissez horizontalement pour tout explorer</span>
            </div>

            <div className="flex gap-2.5 overflow-x-auto pb-3 pt-1 scrollbar-thin scrollbar-thumb-slate-700">
              {next24Hours.map((h, i) => {
                const tier = getThermalTierForTemp(h.temperature);
                const richWeather = getRichWeatherInfo(h.weatherCode, h.isDay, h.rainMm, h.windGust);
                const rainRisk = getRainRiskExplanation(h.precipitationProbability, h.rainMm, 1);
                return (
                  <div
                    key={i}
                    className="min-w-[155px] rounded-2xl border border-slate-800 bg-slate-950/80 p-3 flex flex-col justify-between space-y-2 flex-shrink-0 transition hover:border-blue-500/50 hover:bg-slate-900 shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-white">{h.hourLabel}</span>
                      <span className="text-xl" title={richWeather.detailedLabel}>{richWeather.emoji}</span>
                    </div>

                    <div>
                      <div className="text-lg font-black text-white">{formatTemp(h.temperature)}</div>
                      <span className="text-[10px] text-slate-400 block truncate" title={richWeather.detailedLabel}>
                        {richWeather.shortLabel}
                      </span>
                    </div>

                    {/* Micro-Trend Tag if present */}
                    {h.trendTag && (
                      <div className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-900 border border-slate-700/80 text-blue-300 truncate" title={h.trendText}>
                        {h.trendTag}
                      </div>
                    )}

                    <div className={`px-1.5 py-0.5 rounded text-[9px] font-bold truncate border ${tier.tailwindBg} ${tier.tailwindBorder} ${tier.tailwindText}`}>
                      {tier.iconEmoji} {tier.name.split('/')[0]}
                    </div>

                    <div className="space-y-1 pt-1 border-t border-slate-800 text-[10px]">
                      {/* Cloud Cover */}
                      <div className="flex justify-between text-slate-300" title={`Couverture nuageuse: ${h.cloudCover}% (${Math.round((h.cloudCover ?? 40) / 12.5)}/8 octas) • Bas: ${h.cloudCoverLow ?? 0}%, Moy: ${h.cloudCoverMid ?? 0}%, Hauts: ${h.cloudCoverHigh ?? 0}%`}>
                        <span className="text-slate-400">Nuages</span>
                        <span className="font-semibold text-slate-200">☁️ {h.cloudCover ?? 30}% ({Math.round((h.cloudCover ?? 30) / 12.5)}/8)</span>
                      </div>

                      {/* Rain Risk & Volume */}
                      <div className="flex justify-between text-cyan-300" title={rainRisk.combinedExplanation}>
                        <span>Pluie</span>
                        <span className="font-bold">{h.rainMm} mm ({h.precipitationProbability}%)</span>
                      </div>

                      {/* Wind */}
                      <div className="flex justify-between text-slate-400">
                        <span>Vent</span>
                        <span>{h.windSpeed} km/h {h.windDirectionCompass}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Temperature & Rain Recharts Chart */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Courbe Thermique & Cumuls Horaires (24h)
            </h4>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={next24Hours.map(h => ({ hour: h.hourLabel, temp: h.temperature, rain: h.rainMm }))}>
                  <defs>
                    <linearGradient id="tempColor24h" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                    labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="temp" stroke="#60a5fa" strokeWidth={3} fillOpacity={1} fill="url(#tempColor24h)" name="Température (°C)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2 : SEMAINE 7 JOURS (AVEC TOUTES LES 24 HEURES DU JOUR SÉLECTIONNÉ) */}
      {/* ========================================================================= */}
      {activeTab === 'week' && (
        <div className="space-y-6">
          {/* 7-Day Selector Strip */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-400" />
                Sélectionnez un Jour pour Ouvrir le Rapport Ultra-Précis (24h Détaillées)
              </h3>
              <span className="text-xs text-slate-400">Échéance J+0 à J+6</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
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
                    className={`rounded-2xl border p-3.5 text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                      isSelected
                        ? 'border-blue-400 bg-blue-950/60 ring-2 ring-blue-500/50 shadow-xl'
                        : isToday
                        ? 'border-blue-500/40 bg-slate-900/90'
                        : 'border-slate-800 bg-slate-950/80 hover:border-slate-700 hover:bg-slate-900/70'
                    }`}
                  >
                    <div>
                      {isToday && (
                        <span className="rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 px-1.5 py-0.5 text-[9px] font-black uppercase mb-1 inline-block">
                          Aujourd'hui
                        </span>
                      )}

                      <div className="font-black text-white text-sm">
                        {isToday ? "Aujourd'hui" : d.dayLabel}
                      </div>
                      <span className="text-[11px] text-slate-400 line-clamp-1 mt-0.5" title={richWeather.detailedLabel}>
                        {richWeather.shortLabel}
                      </span>
                    </div>

                    <div className="my-2.5 text-3xl text-center" title={richWeather.detailedLabel}>
                      {richWeather.emoji}
                    </div>

                    <div>
                      <div className="flex justify-between items-baseline text-xs font-bold">
                        <span className="text-blue-300">{formatTemp(d.tempMin)}</span>
                        <span className="text-slate-600">•</span>
                        <span className="text-amber-300">{formatTemp(d.tempMax)}</span>
                      </div>

                      {/* Vigilance pill tag if non-vert */}
                      {d.dominantVigilanceLevel && d.dominantVigilanceLevel !== 'VERT' && (
                        <div className={`mt-1.5 flex items-center justify-between text-[9px] font-black uppercase px-1.5 py-0.5 rounded border ${
                          d.dominantVigilanceLevel === 'ROUGE'
                            ? 'bg-red-600 text-white border-red-400 animate-pulse'
                            : d.dominantVigilanceLevel === 'ORANGE'
                            ? 'bg-orange-500 text-slate-950 border-orange-300'
                            : 'bg-amber-400 text-slate-950 border-amber-300'
                        }`}>
                          <span>{d.dominantVigilanceEmoji || '⚠️'} {d.dominantVigilanceLevel}</span>
                          <span className="text-[8px] font-bold truncate">Alerte</span>
                        </div>
                      )}

                      {/* Cloud cover mean */}
                      <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-300 bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-800">
                        <span className="text-slate-400">Nuages :</span>
                        <span className="font-semibold text-slate-200">☁️ {d.cloudCoverMean ?? 40}%</span>
                      </div>

                      {/* Rain Risk Badge */}
                      <div className="mt-1.5 flex items-center justify-between text-[10px] font-bold text-cyan-300 bg-cyan-950/50 px-1.5 py-0.5 rounded border border-cyan-800/40" title={rainRisk.combinedExplanation}>
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

          {/* Selected Day In-Depth Comprehensive Report */}
          <div className="rounded-2xl border border-blue-500/40 bg-slate-950/95 p-6 space-y-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2.5 py-0.5 text-xs font-bold">
                    Rapport Météorologique & Diagnostique Complet
                  </span>
                  <span className="text-xs text-slate-400">{selectedDay.fullDateFormatted || selectedDay.date}</span>
                </div>
                <h3 className="text-2xl font-black text-white mt-1">
                  {selectedDayIdx === 0 ? "Aujourd'hui" : selectedDay.dayLabel} — {selectedDay.weatherDescription}
                </h3>
              </div>

              {onOpenDayAnalyzer && (
                <button
                  onClick={() => onOpenDayAnalyzer(selectedDayIdx)}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 transition shadow-lg shadow-blue-600/30 active:scale-95 cursor-pointer"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Ouvrir l'Analyseur Expert Détaillé</span>
                </button>
              )}
            </div>

            {/* Vigilance Banner for the Selected Day if any alerts */}
            {selectedDay.vigilanceAlerts && selectedDay.vigilanceAlerts.length > 0 && selectedDay.dominantVigilanceLevel !== 'VERT' && (
              <div className="space-y-3 rounded-2xl bg-slate-900/60 p-4 border border-amber-500/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-amber-400" />
                    Vigilance & Risques Spécifiques ({selectedDay.dayLabel})
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400">
                    {selectedDay.vigilanceAlerts[0]?.lastUpdatedTimestamp || 'Actualisation continue AROME/ECMWF'}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {selectedDay.vigilanceAlerts.map((alert, aIdx) => {
                    const isRouge = alert.level === 'ROUGE';
                    const isOrange = alert.level === 'ORANGE';
                    const borderBg = isRouge
                      ? 'border-red-500/80 bg-red-950/40 text-red-100'
                      : isOrange
                      ? 'border-orange-500/80 bg-orange-950/40 text-orange-100'
                      : 'border-amber-500/70 bg-amber-950/30 text-amber-100';

                    const badgeClass = isRouge
                      ? 'bg-red-600 text-white'
                      : isOrange
                      ? 'bg-orange-500 text-slate-950 font-black'
                      : 'bg-amber-400 text-slate-950 font-black';

                    return (
                      <div key={aIdx} className={`rounded-xl border p-3.5 shadow-md ${borderBg}`}>
                        <div className="flex flex-wrap items-start justify-between gap-2 border-b border-white/10 pb-2.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{alert.emoji}</span>
                            <div>
                              <span className={`rounded px-1.5 py-0.5 text-[9px] uppercase font-black tracking-wider ${badgeClass}`}>
                                Vigilance {alert.level}
                              </span>
                              <h5 className="font-extrabold text-sm text-white mt-0.5">
                                {alert.title}
                              </h5>
                            </div>
                          </div>
                          {alert.severityMetric && (
                            <span className="rounded-lg bg-slate-950/80 px-2.5 py-1 text-[10px] font-bold text-slate-200 border border-white/10">
                              {alert.severityMetric}
                            </span>
                          )}
                        </div>

                        {/* Timing Slot with End of Vigilance */}
                        <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-950/70 p-2.5 rounded-lg border border-white/10 text-xs">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Début</span>
                            <span className="font-extrabold text-white">{alert.startHourFormatted}</span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-amber-300 block">Pic</span>
                            <span className="font-extrabold text-amber-300">{alert.peakHourFormatted}</span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-cyan-300 block">Fin de Vigilance</span>
                            <span className="font-extrabold text-cyan-300">{alert.endHourFormatted}</span>
                          </div>
                        </div>

                        <p className="mt-2 text-xs text-slate-200 leading-relaxed font-medium">
                          {alert.message}
                        </p>

                        {alert.safetyInstructions && alert.safetyInstructions.length > 0 && (
                          <div className="mt-2.5 pt-2 border-t border-white/10 space-y-1">
                            <span className="text-[9px] uppercase font-extrabold tracking-wider text-slate-400 block">
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-xl bg-slate-900/90 p-4 border border-slate-800">
                <span className="text-xs text-slate-400 block">Température Minimale</span>
                <span className="text-xl font-black text-blue-300 mt-1 block">{formatTemp(selectedDay.tempMin)}</span>
                <span className="text-[11px] text-slate-400 mt-0.5 block">
                  Normale : {currentMonthNormal.tMin}°C ({selectedDayAnomalyTMin >= 0 ? `+${selectedDayAnomalyTMin}` : selectedDayAnomalyTMin}°C)
                </span>
              </div>

              <div className="rounded-xl bg-slate-900/90 p-4 border border-slate-800">
                <span className="text-xs text-slate-400 block">Température Maximale</span>
                <span className="text-xl font-black text-amber-300 mt-1 block">{formatTemp(selectedDay.tempMax)}</span>
                <span className="text-[11px] text-slate-400 mt-0.5 block">
                  Normale : {currentMonthNormal.tMax}°C ({selectedDayAnomalyTMax >= 0 ? `+${selectedDayAnomalyTMax}` : selectedDayAnomalyTMax}°C)
                </span>
              </div>

              <div className="rounded-xl bg-slate-900/90 p-4 border border-slate-800">
                <span className="text-xs text-slate-400 block">Précipitations Attendues</span>
                <span className="text-xl font-black text-cyan-300 mt-1 block">
                  {selectedDay.precipitationSumMm ?? selectedDay.rainMm ?? 0} mm (L/m²)
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5 block">
                  Probabilité : {selectedDay.precipitationProbability}%
                </span>
              </div>

              <div className="rounded-xl bg-slate-900/90 p-4 border border-slate-800">
                <span className="text-xs text-slate-400 block">Vent Maximal & Rafales</span>
                <span className="text-xl font-black text-teal-300 mt-1 block">
                  {selectedDay.windSpeedMax} km/h (raf. {selectedDay.windGustMax ?? Math.round(selectedDay.windSpeedMax * 1.35)})
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5 block">
                  Direction : {selectedDay.dominantWindDir || 'SO'}
                </span>
              </div>
            </div>

            {/* Precipitation & Thermal Clarity Notice for Selected Day */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Rain clarity box */}
              <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/30 p-4 space-y-2">
                <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs uppercase tracking-wider">
                  <CloudRain className="h-4 w-4" />
                  <span>Diagnostic Précipitations Fiabilisé</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedDay.rainTimingSummary || "Temps sec stable sur l'ensemble de la journée."}
                </p>
                <div className="text-[11px] text-slate-400 flex items-center gap-2">
                  <span>💧 Équivalent eau : <strong>{selectedDay.precipitationSumMm ?? selectedDay.rainMm ?? 0} Litres / m²</strong></span>
                  <span>•</span>
                  <span>Durée active estimée : <strong>{selectedDay.precipitationHours ?? 0}h</strong></span>
                </div>
              </div>

              {/* Thermal tiers summary box */}
              <div className="rounded-xl border border-amber-500/30 bg-amber-950/30 p-4 space-y-2">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
                  <Thermometer className="h-4 w-4" />
                  <span>Paliers Thermiques de la Journée</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                  {selectedDay.thermalTierSummary || "Douceur de saison."}
                </p>
                <div className="text-[11px] text-slate-400 flex items-center gap-2">
                  <span>Isotherme 0°C moyen : <strong>{selectedDay.isotherm0Altitude || 2500} m</strong></span>
                  <span>•</span>
                  <span>Évapotranspiration : <strong>{selectedDay.et0Mm || 3.5} mm</strong></span>
                </div>
              </div>
            </div>

            {/* Complete 24-Hour Table for the Selected Day */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-400" />
                  Détail Heure par Heure du Jour Sélectionné (00h à 23h • Icônes, Nuages & Tendances)
                </h4>
                <span className="text-[11px] text-slate-400">24 relevés horaires continus</span>
              </div>

              <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700">
                {selectedDayHours.map((h, hIdx) => {
                  const tier = getThermalTierForTemp(h.temperature);
                  const richWeather = getRichWeatherInfo(h.weatherCode, h.isDay, h.rainMm, h.windGust);
                  const rainRisk = getRainRiskExplanation(h.precipitationProbability, h.rainMm, 1);
                  return (
                    <div
                      key={hIdx}
                      className="min-w-[155px] rounded-xl border border-slate-800 bg-slate-900/90 p-3 flex-shrink-0 space-y-2 transition hover:border-blue-500/50"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-white">{h.hourLabel}</span>
                        <span className="text-xl" title={richWeather.detailedLabel}>{richWeather.emoji}</span>
                      </div>

                      <div>
                        <div className="text-base font-black text-white">{formatTemp(h.temperature)}</div>
                        <span className="text-[10px] text-slate-400 block truncate" title={richWeather.detailedLabel}>
                          {richWeather.shortLabel}
                        </span>
                      </div>

                      {/* Micro-Trend Tag */}
                      {h.trendTag && (
                        <div className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-950 border border-slate-800 text-blue-300 truncate" title={h.trendText}>
                          {h.trendTag}
                        </div>
                      )}

                      <div className={`px-1.5 py-0.5 rounded text-[8px] font-bold truncate border ${tier.tailwindBg} ${tier.tailwindBorder} ${tier.tailwindText}`}>
                        {tier.iconEmoji} {tier.name.split('/')[0]}
                      </div>

                      <div className="space-y-1 pt-1 border-t border-slate-800 text-[10px]">
                        {/* Cloud cover */}
                        <div className="flex justify-between text-slate-300" title={`Couverture totale: ${h.cloudCover}% (${Math.round((h.cloudCover ?? 30) / 12.5)}/8 octas)`}>
                          <span className="text-slate-400">Nuages</span>
                          <span className="font-semibold text-slate-200">☁️ {h.cloudCover ?? 30}% ({Math.round((h.cloudCover ?? 30) / 12.5)}/8)</span>
                        </div>

                        {/* Rain */}
                        <div className="flex justify-between text-cyan-300" title={rainRisk.combinedExplanation}>
                          <span>Pluie</span>
                          <span className="font-bold">{h.rainMm} mm ({h.precipitationProbability}%)</span>
                        </div>

                        {/* Wind */}
                        <div className="flex justify-between text-slate-400">
                          <span>Vent</span>
                          <span>{h.windSpeed} km/h {h.windDirectionCompass}</span>
                        </div>

                        {isElevationOver100m && (
                          <div className="text-[9px] text-cyan-300 pt-1 border-t border-slate-800/80 flex items-center justify-between font-mono font-semibold" title={`Altitude station: ${station.altitude} m • Écart: ${h.isothermStationDelta ?? Math.round((h.isotherm0Meters ?? 0) - (station.altitude ?? 0))} m`}>
                            <span className="flex items-center gap-0.5">
                              <Mountain className="h-2.5 w-2.5 text-cyan-400" />
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
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Layers className="h-5 w-5 text-indigo-400" />
                Matrice Intégrale 168 Heures (7 Jours Complets en Continu)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Données ultra-précises heure par heure : Température, Paliers, Précipitations en mm/h, Nuages, Tendances & Risque orageux
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setHourlyMetricFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                  hourlyMetricFilter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Tout Afficher
              </button>
              <button
                onClick={() => setHourlyMetricFilter('temp')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                  hourlyMetricFilter === 'temp' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                🌡️ Thermique & Paliers
              </button>
              <button
                onClick={() => setHourlyMetricFilter('rain')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                  hourlyMetricFilter === 'rain' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                🌧️ Pluie & Risque
              </button>
              <button
                onClick={() => setHourlyMetricFilter('clouds')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                  hourlyMetricFilter === 'clouds' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                ☁️ Nuages & Octas
              </button>
              <button
                onClick={() => setHourlyMetricFilter('trend')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                  hourlyMetricFilter === 'trend' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                📈 Tendances
              </button>
              <button
                onClick={() => setHourlyMetricFilter('convection')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                  hourlyMetricFilter === 'convection' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                ⚡ Orage & CAPE
              </button>
              {isElevationOver100m && (
                <button
                  onClick={() => setHourlyMetricFilter('isotherm')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                    hourlyMetricFilter === 'isotherm' ? 'bg-emerald-600 text-white' : 'text-cyan-400 hover:text-white border border-cyan-500/30'
                  }`}
                >
                  🏔️ Iso 0°C ({station.altitude}m)
                </button>
              )}
            </div>
          </div>

          {/* Full 168-Hour Scrollable Grid Matrix */}
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/90 p-4">
            <div className="min-w-[1200px] space-y-4">
              <div className="grid grid-cols-7 gap-3">
                {Array.from({ length: 7 }).map((_, dIdx) => {
                  const daySlice = hourly.slice(dIdx * 24, (dIdx + 1) * 24);
                  const dayObj = daily[dIdx] || { dayLabel: `J+${dIdx}`, date: '' };
                  return (
                    <div key={dIdx} className="space-y-2">
                      <div className="rounded-xl bg-slate-900 p-2.5 border border-slate-800 text-center">
                        <div className="text-xs font-black text-white">{dayObj.dayLabel}</div>
                        <div className="text-[10px] text-slate-400">{dayObj.date ? dayObj.date.split('T')[0] : ''}</div>
                      </div>

                      <div className="space-y-1.5">
                        {daySlice.map((h, hIdx) => {
                          const tier = getThermalTierForTemp(h.temperature);
                          const richWeather = getRichWeatherInfo(h.weatherCode, h.isDay, h.rainMm, h.windGust);
                          return (
                            <div
                              key={hIdx}
                              className={`rounded-lg p-2 border text-xs transition hover:scale-[1.02] ${
                                h.rainMm > 0.5 
                                   ? 'border-cyan-500/50 bg-cyan-950/40' 
                                   : (h.thunderstormProbability ?? 0) > 40
                                   ? 'border-amber-500/50 bg-amber-950/40'
                                   : 'border-slate-800 bg-slate-900/60'
                              }`}
                            >
                              <div className="flex items-center justify-between font-bold">
                                <span className="text-slate-300">{h.hourLabel}</span>
                                <span className="text-base" title={richWeather.detailedLabel}>{richWeather.emoji}</span>
                                <span className="text-white">{formatTemp(h.temperature)}</span>
                              </div>

                              {(hourlyMetricFilter === 'all' || hourlyMetricFilter === 'temp') && (
                                <div className={`mt-1 px-1 py-0.5 rounded text-[8px] font-bold truncate ${tier.tailwindBg} ${tier.tailwindText}`}>
                                  {tier.iconEmoji} {tier.name.split('/')[0]}
                                </div>
                              )}

                              {(hourlyMetricFilter === 'all' || hourlyMetricFilter === 'rain') && (
                                <div className="mt-1 flex items-center justify-between text-[9px] text-cyan-300">
                                  <span>Pluie : {h.rainMm} mm</span>
                                  <span>{h.precipitationProbability}%</span>
                                </div>
                              )}

                              {(hourlyMetricFilter === 'all' || hourlyMetricFilter === 'clouds') && (
                                <div className="mt-1 flex items-center justify-between text-[9px] text-slate-200 bg-slate-950/80 px-1 py-0.5 rounded border border-slate-800">
                                  <span className="text-slate-400">Nuages :</span>
                                  <span className="font-semibold">☁️ {h.cloudCover ?? 30}% ({Math.round((h.cloudCover ?? 30)/12.5)}/8)</span>
                                </div>
                              )}

                              {(hourlyMetricFilter === 'all' || hourlyMetricFilter === 'trend') && h.trendTag && (
                                <div className="mt-1 px-1 py-0.5 rounded text-[8px] font-bold bg-slate-950 text-blue-300 border border-slate-800 truncate" title={h.trendText}>
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
                                <div className="mt-1 flex items-center justify-between text-[9px] font-mono text-cyan-300 bg-slate-950/70 px-1 py-0.5 rounded">
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
