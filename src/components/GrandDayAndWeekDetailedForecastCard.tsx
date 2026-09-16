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
  const [activeTab, setActiveTab] = useState<'day' | 'week' | 'all168h'>('week');
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

  // Streamlined view for Simplified Mode
  if (simplifiedMode) {
    return (
      <div id="grand-day-week-detailed-card" className="rounded-md border border-slate-800 bg-slate-950 p-4 sm:p-5 space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-900 border border-slate-800 text-sky-400">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span>Déroulé 24h Heure par Heure</span>
              <span className="rounded bg-sky-950/60 px-2 py-0.5 text-[10px] font-semibold text-sky-300 border border-sky-800/50">
                Mode Simplifié
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Défilement horizontal de la météo des 24 prochaines heures
            </p>
          </div>
        </div>

        {/* 24-Hour Scrollable Slider */}
        <div className="flex gap-2 overflow-x-auto pb-2 pt-1 scrollbar-thin scrollbar-thumb-slate-700">
          {next24Hours.map((h, i) => {
            const tier = getThermalTierForTemp(h.temperature);
            const richWeather = getRichWeatherInfo(h.weatherCode, h.isDay, h.rainMm, h.windGust);
            return (
              <div
                key={i}
                className="min-w-[140px] rounded-md border border-slate-800 bg-slate-900/60 p-2.5 flex flex-col justify-between space-y-2 flex-shrink-0 transition hover:border-slate-700 hover:bg-slate-900"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{h.hourLabel}</span>
                  <span className="text-xl" title={richWeather.detailedLabel}>{richWeather.emoji}</span>
                </div>

                <div>
                  <div className="text-base font-bold text-white">{formatTemp(h.temperature)}</div>
                  <span className="text-[10px] text-slate-400 block truncate" title={richWeather.detailedLabel}>
                    {richWeather.shortLabel}
                  </span>
                </div>

                <div className={`px-1.5 py-0.5 rounded text-[9px] font-semibold truncate border ${tier.tailwindBg} ${tier.tailwindBorder} ${tier.tailwindText}`}>
                  {tier.iconEmoji} {tier.name.split('/')[0]}
                </div>

                <div className="space-y-1 pt-1 border-t border-slate-800 text-[10px]">
                  {/* Rain Risk & Volume */}
                  <div className="flex justify-between text-sky-300">
                    <span>Pluie</span>
                    <span className="font-semibold">{h.rainMm} mm ({h.precipitationProbability}%)</span>
                  </div>

                  {/* Wind */}
                  <div className="flex justify-between text-slate-400">
                    <span>Vent</span>
                    <span>{h.windSpeed} km/h</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div id="grand-day-week-detailed-card" className="rounded-md border border-slate-800 bg-slate-950 p-4 sm:p-5 space-y-5">
      {/* Header with 3 main view tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-900 border border-slate-800 text-sky-400">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white">
                Prévisions Détaillées du Jour &amp; de la Semaine
              </h2>
              <span className="rounded bg-sky-950/60 px-2 py-0.5 text-[10px] font-semibold text-sky-300 border border-sky-800/50">
                Heure par heure
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Station : <strong className="text-slate-200">{station.name}</strong> ({station.altitude} m) • Réactualisation continue
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex rounded-md bg-slate-900 p-1 border border-slate-800 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('day')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition cursor-pointer ${
              activeTab === 'day'
                ? 'bg-[#0284C7] text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Aujourd'hui (24h)</span>
          </button>
          
          <button
            onClick={() => setActiveTab('week')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition cursor-pointer ${
              activeTab === 'week'
                ? 'bg-[#0284C7] text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Semaine 7 Jours</span>
          </button>

          <button
            onClick={() => setActiveTab('all168h')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition cursor-pointer ${
              activeTab === 'all168h'
                ? 'bg-[#0284C7] text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
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

            <div className="flex gap-2 overflow-x-auto pb-2 pt-1 scrollbar-thin scrollbar-thumb-slate-700 touch-pan-x overscroll-x-contain">
              {next24Hours.map((h, i) => {
                const tier = getThermalTierForTemp(h.temperature);
                const richWeather = getRichWeatherInfo(h.weatherCode, h.isDay, h.rainMm, h.windGust);
                const rainRisk = getRainRiskExplanation(h.precipitationProbability, h.rainMm, 1);
                return (
                  <div
                    key={i}
                    className="min-w-[145px] rounded-md border border-slate-800 bg-slate-900/60 p-2.5 flex flex-col justify-between space-y-2 flex-shrink-0 transition hover:border-slate-700 hover:bg-slate-900"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{h.hourLabel}</span>
                      <span className="text-lg" title={richWeather.detailedLabel}>{richWeather.emoji}</span>
                    </div>

                    <div>
                      <div className="text-base font-bold text-white">{formatTemp(h.temperature)}</div>
                      <span className="text-[10px] text-slate-400 block truncate" title={richWeather.detailedLabel}>
                        {richWeather.shortLabel}
                      </span>
                    </div>

                    {/* Micro-Trend Tag if present */}
                    {h.trendTag && (
                      <div className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-slate-950 border border-slate-800 text-sky-300 truncate" title={h.trendText}>
                        {h.trendTag}
                      </div>
                    )}

                    <div className={`px-1.5 py-0.5 rounded text-[9px] font-semibold truncate border ${tier.tailwindBg} ${tier.tailwindBorder} ${tier.tailwindText}`}>
                      {tier.iconEmoji} {tier.name.split('/')[0]}
                    </div>

                    <div className="space-y-1 pt-1 border-t border-slate-800 text-[10px]">
                      {/* Cloud Cover */}
                      <div className="flex justify-between text-slate-300" title={`Couverture nuageuse: ${h.cloudCover}% (${Math.round((h.cloudCover ?? 40) / 12.5)}/8 octas)`}>
                        <span className="text-slate-400">Nuages</span>
                        <span className="font-semibold text-slate-200">☁️ {h.cloudCover ?? 30}% ({Math.round((h.cloudCover ?? 30) / 12.5)}/8)</span>
                      </div>

                      {/* Rain Risk & Volume */}
                      <div className="flex justify-between text-sky-300" title={rainRisk.combinedExplanation}>
                        <span>Pluie</span>
                        <span className="font-semibold">{h.rainMm} mm ({h.precipitationProbability}%)</span>
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

                    <div className="my-2 text-2xl text-center" title={richWeather.detailedLabel}>
                      {richWeather.emoji}
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
                        <span className="text-lg" title={richWeather.detailedLabel}>{richWeather.emoji}</span>
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
