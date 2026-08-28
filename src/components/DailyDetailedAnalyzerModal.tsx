import React, { useState } from 'react';
import { DailyForecast, HourlyForecast, LocationPoint, DailyDetailedAnalysis } from '../types/weather';
import { buildDailyDetailedAnalysis } from '../services/seasonalProjectionService';
import { 
  X, 
  Calendar, 
  Clock, 
  Sun, 
  Droplets, 
  Wind, 
  Compass, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  Shirt, 
  Sparkles, 
  Mountain, 
  Trees, 
  Waves, 
  ChevronRight,
  Info,
  Thermometer,
  CloudRain,
  CloudSun,
  ShieldCheck,
  HelpCircle
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Line, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { getRainRiskExplanation, getRichWeatherInfo } from '../utils/weatherIcons';

interface DailyDetailedAnalyzerModalProps {
  isOpen: boolean;
  onClose: () => void;
  dailyList: DailyForecast[];
  hourlyList: HourlyForecast[];
  station: LocationPoint;
  seniorMode: boolean;
  tempUnit?: 'C' | 'F';
  initialDayIndex?: number;
}

export const DailyDetailedAnalyzerModal: React.FC<DailyDetailedAnalyzerModalProps> = ({
  isOpen,
  onClose,
  dailyList,
  hourlyList,
  station,
  seniorMode,
  tempUnit = 'C',
  initialDayIndex = 0
}) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(initialDayIndex);
  const [showRainGuide, setShowRainGuide] = useState<boolean>(false);

  React.useEffect(() => {
    setSelectedDayIndex(initialDayIndex);
  }, [initialDayIndex, isOpen]);

  if (!isOpen) return null;

  const dailyAnalyses: DailyDetailedAnalysis[] = buildDailyDetailedAnalysis(dailyList, hourlyList, station);
  const selectedDay = dailyAnalyses[selectedDayIndex] || dailyAnalyses[0];
  const matchedDaily = dailyList[selectedDayIndex] || dailyList[0];

  const formatTemp = (celsius: number) => {
    if (tempUnit === 'F') {
      return `${Math.round((celsius * 9/5 + 32) * 10) / 10}°F`;
    }
    return `${celsius}°C`;
  };

  const parts = selectedDay.dayParts;
  const partsArray = [
    { key: 'morning', label: 'Matin (08h)', data: parts.morning },
    { key: 'midday', label: 'Midi (12h)', data: parts.midday },
    { key: 'afternoon', label: 'Après-midi (16h)', data: parts.afternoon },
    { key: 'evening', label: 'Soirée (20h)', data: parts.evening },
    { key: 'night', label: 'Nuit (02h)', data: parts.night }
  ];

  // Chart data for 24-hour cycle of this day
  const dayChartData = partsArray.map(p => ({
    name: p.label,
    temperature: p.data.temp,
    feelsLike: p.data.feelsLike,
    rainProb: p.data.rainProb,
    rainMm: p.data.rainMm,
    wind: p.data.windSpeed
  }));

  const rainRiskExplanation = getRainRiskExplanation(
    selectedDay.precipitationProbabilityMax,
    selectedDay.precipitationSumMm,
    selectedDay.precipitationHours
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-3 sm:p-6 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-blue-600/20 p-2.5 text-blue-400 border border-blue-500/30">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400">
                <span>Analyse Journalière Détaillée • Modèle AROME & ECMWF</span>
              </div>
              <h2 className={`font-black text-white ${seniorMode ? 'text-2xl' : 'text-xl'}`}>
                {station.name} — {selectedDay.dayLabel} ({selectedDay.date})
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl border border-slate-800 bg-slate-800/80 p-2 text-slate-400 hover:bg-slate-700 hover:text-white transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Day Selector Navigation Pills */}
        <div className="flex gap-2 overflow-x-auto border-b border-slate-800/80 bg-slate-950/40 p-3 px-6 scrollbar-none">
          {dailyAnalyses.map((day, idx) => {
            const isSelected = selectedDayIndex === idx;
            return (
              <button
                key={idx}
                onClick={() => setSelectedDayIndex(idx)}
                className={`flex flex-col items-center min-w-[110px] rounded-2xl p-2.5 text-center transition border cursor-pointer ${
                  isSelected
                    ? 'border-blue-500/80 bg-blue-600/20 text-white shadow-lg'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <span className="text-xs font-bold">{day.dayLabel}</span>
                <span className="text-lg my-0.5">{day.precipitationProbabilityMax > 40 ? '🌧️' : '☀️'}</span>
                <span className="text-xs font-extrabold text-white">
                  {formatTemp(day.tempMin)} / {formatTemp(day.tempMax)}
                </span>
                <span className="text-[10px] text-cyan-300 font-bold mt-0.5">
                  {day.precipitationSumMm > 0 ? `${day.precipitationSumMm} mm` : 'Sec'} ({day.precipitationProbabilityMax}%)
                </span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Day Overview Summary Card */}
          <div className="rounded-2xl border border-blue-500/30 bg-blue-950/30 p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="rounded-md bg-blue-500/20 px-2.5 py-1 text-xs font-black text-blue-300 border border-blue-400/30">
                  {selectedDay.weatherDescription}
                </span>
                <h3 className={`font-black text-white mt-2 ${seniorMode ? 'text-3xl' : 'text-2xl'}`}>
                  {formatTemp(selectedDay.tempMin)} à {formatTemp(selectedDay.tempMax)} • Moyenne : {formatTemp(selectedDay.tempMean)}
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  {selectedDay.climateComparison.anomalyDescription}
                </p>
              </div>

              {/* Quick Metrics */}
              <div className="flex flex-wrap gap-2.5">
                <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-2.5 text-center min-w-[95px]">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Cumul Pluie</span>
                  <span className="text-sm font-extrabold text-cyan-300">{selectedDay.precipitationSumMm} mm</span>
                  <span className="text-[10px] text-slate-400 block">({selectedDay.precipitationSumMm} L/m²)</span>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-2.5 text-center min-w-[95px]">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Risque Pluie</span>
                  <span className="text-sm font-extrabold text-blue-300">{selectedDay.precipitationProbabilityMax}%</span>
                  <span className="text-[10px] text-slate-400 block">{selectedDay.precipitationHours}h estimées</span>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-2.5 text-center min-w-[95px]">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Vent Rafales</span>
                  <span className="text-sm font-extrabold text-teal-300">{selectedDay.windGustMaxKmh} km/h</span>
                  <span className="text-[10px] text-slate-400 block">{selectedDay.dominantWindDirection}</span>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-2.5 text-center min-w-[95px]">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Indice UV</span>
                  <span className="text-sm font-extrabold text-amber-300">{selectedDay.uvIndexMax} / 12</span>
                  <span className="text-[10px] text-slate-400 block">{selectedDay.sunshineHours}h soleil</span>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-2.5 text-center min-w-[95px]">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Isotherme 0°</span>
                  <span className="text-sm font-extrabold text-blue-300">{selectedDay.isotherm0Meters} m</span>
                  <span className="text-[10px] text-slate-400 block">LPN {selectedDay.snowRainLimitMeters}m</span>
                </div>
              </div>
            </div>

            {/* Comprehensive Vigilance & Severe Weather Alert Dashboard */}
            {selectedDay.vigilanceAlerts && selectedDay.vigilanceAlerts.length > 0 && (
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-amber-400" />
                    Bulletin de Vigilance & Phénomènes Sous Surveillance ({selectedDay.dayLabel})
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400">
                    {selectedDay.vigilanceAlerts[0]?.lastUpdatedTimestamp || 'Actualisé en continu (AROME/ECMWF)'}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {selectedDay.vigilanceAlerts.map((alert, aIdx) => {
                    const isRouge = alert.level === 'ROUGE';
                    const isOrange = alert.level === 'ORANGE';
                    const isJaune = alert.level === 'JAUNE';
                    const isVert = alert.level === 'VERT';

                    const borderBgClass = isRouge
                      ? 'border-red-500/80 bg-red-950/40 text-red-100 shadow-red-950/30'
                      : isOrange
                      ? 'border-orange-500/80 bg-orange-950/40 text-orange-100 shadow-orange-950/30'
                      : isJaune
                      ? 'border-amber-500/70 bg-amber-950/30 text-amber-100 shadow-amber-950/20'
                      : 'border-emerald-500/40 bg-emerald-950/20 text-emerald-100';

                    const badgeLevelClass = isRouge
                      ? 'bg-red-600 text-white'
                      : isOrange
                      ? 'bg-orange-500 text-slate-950 font-black'
                      : isJaune
                      ? 'bg-amber-400 text-slate-950 font-black'
                      : 'bg-emerald-600 text-white';

                    return (
                      <div
                        key={aIdx}
                        className={`rounded-2xl border p-4 shadow-lg transition-all ${borderBgClass}`}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2 border-b border-white/10 pb-3">
                          <div className="flex items-center gap-2.5">
                            <span className="text-2xl">{alert.emoji}</span>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${badgeLevelClass}`}>
                                  Vigilance {alert.level}
                                </span>
                                {alert.isOngoingNow && (
                                  <span className="animate-pulse rounded-md bg-red-600/90 px-2 py-0.5 text-[10px] font-bold text-white uppercase">
                                    En cours
                                  </span>
                                )}
                              </div>
                              <h4 className="font-extrabold text-sm sm:text-base text-white mt-1">
                                {alert.title}
                              </h4>
                            </div>
                          </div>

                          {/* Severe metric badge */}
                          {alert.severityMetric && (
                            <div className="rounded-xl bg-slate-950/80 px-3 py-1.5 border border-white/10 text-[11px] font-bold text-slate-200">
                              {alert.severityMetric}
                            </div>
                          )}
                        </div>

                        {/* Timing & End of Vigilance Slot */}
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-950/70 p-3 rounded-xl border border-white/10 text-xs">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Début Phénomène</span>
                            <span className="font-extrabold text-white">{alert.startHourFormatted}</span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-amber-300 block">Pic d'Intensité</span>
                            <span className="font-extrabold text-amber-300">{alert.peakHourFormatted}</span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-cyan-300 block">Fin de Vigilance</span>
                            <span className="font-extrabold text-cyan-300">{alert.endHourFormatted}</span>
                          </div>
                        </div>

                        {/* Description & Impact */}
                        <p className="mt-2.5 text-xs text-slate-200 leading-relaxed font-medium">
                          {alert.message}
                        </p>

                        {/* Safety instructions */}
                        {alert.safetyInstructions && alert.safetyInstructions.length > 0 && !isVert && (
                          <div className="mt-3 pt-2.5 border-t border-white/10 space-y-1">
                            <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 block">
                              Consignes de Sécurité & Comportement :
                            </span>
                            <ul className="list-disc list-inside text-[11px] text-slate-300 space-y-0.5">
                              {alert.safetyInstructions.map((inst, iIdx) => (
                                <li key={iIdx} className="leading-snug">{inst}</li>
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
          </div>

          {/* Explicit Precipitation Diagnostic Banner */}
          <div className="rounded-2xl border border-cyan-500/40 bg-cyan-950/30 p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
                <CloudRain className="h-4 w-4 text-cyan-400" />
                <span>Diagnostic Précipitations & Probabilité du {selectedDay.dayLabel}</span>
              </div>
              <button
                onClick={() => setShowRainGuide(!showRainGuide)}
                className="text-xs text-cyan-400 hover:text-cyan-200 underline flex items-center gap-1 cursor-pointer"
              >
                <HelpCircle className="h-3.5 w-3.5" />
                <span>{showRainGuide ? 'Masquer explication' : 'Différence Probabilité (%) / Quantité (mm)'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl bg-slate-950/80 p-3 border border-slate-800 space-y-1">
                <span className="font-bold text-slate-400 block text-[11px] uppercase">Interprétation Pluviométrique</span>
                <p className="text-white font-medium leading-relaxed">
                  {rainRiskExplanation.combinedExplanation}
                </p>
              </div>

              <div className="rounded-xl bg-slate-950/80 p-3 border border-slate-800 space-y-1">
                <span className="font-bold text-slate-400 block text-[11px] uppercase">Plage Temporelle & Conseil</span>
                <p className="text-cyan-300 font-semibold leading-relaxed">
                  {matchedDaily.rainTimingSummary || `Risque maximal évalué à ${selectedDay.precipitationProbabilityMax}%.`}
                </p>
                <p className="text-slate-400 text-[11px] italic">
                  {rainRiskExplanation.dailyAdvice}
                </p>
              </div>
            </div>

            {showRainGuide && (
              <div className="p-3 rounded-xl bg-slate-950/90 border border-cyan-500/20 text-xs text-slate-300 space-y-2">
                <p>
                  <strong>Probabilité (%) :</strong> Mesure le risque qu'au moins 0.1 mm d'eau tombe ({selectedDay.precipitationProbabilityMax}% sur cette journée).
                </p>
                <p>
                  <strong>Quantité (mm) :</strong> Mesure le volume d'eau au sol en litres par mètre carré ({selectedDay.precipitationSumMm} mm = {selectedDay.precipitationSumMm} L/m²).
                </p>
              </div>
            )}
          </div>

          {/* 5 Day Parts Breakdown Cards */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-400" />
              Découpage par Tranches Horaires de la Journée
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {partsArray.map((part) => (
                <div
                  key={part.key}
                  className="rounded-2xl border border-slate-800 bg-slate-950/80 p-3.5 space-y-2 shadow-inner"
                >
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-slate-300">{part.label}</span>
                    <span className="text-xl">{part.data.iconEmoji}</span>
                  </div>

                  <div className="text-center py-1">
                    <span className="text-2xl font-black text-white">{formatTemp(part.data.temp)}</span>
                    <span className="text-[11px] text-slate-400 block">Ressenti {formatTemp(part.data.feelsLike)}</span>
                  </div>

                  <div className="space-y-1 text-[11px] border-t border-slate-800/80 pt-2">
                    <div className="flex justify-between text-slate-400">
                      <span>Nuages :</span>
                      <span className="font-bold text-sky-300">☁️ {part.data.cloudCoverPct ?? 35}% ({part.data.cloudCoverOctas ?? 3}/8)</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Pluie :</span>
                      <span className="font-bold text-cyan-300">{part.data.rainProb}% ({part.data.rainMm} mm)</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Vent :</span>
                      <span className="font-bold text-teal-300">{part.data.windSpeed} km/h (raf. {part.data.windGust})</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Indice UV :</span>
                      <span className="font-bold text-amber-300">{part.data.uvIndex}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Rosée :</span>
                      <span className="font-bold text-blue-300">{formatTemp(part.data.dewPoint)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Scores & Lifestyle Recommendations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Activity Scores */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                <Activity className="h-4 w-4 text-emerald-400" />
                Indices & Praticabilité des Activités
              </h4>

              <div className="space-y-3.5 text-xs">
                {/* Sport */}
                <div className="space-y-1">
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-200">🏃 Sports Extérieurs & Cyclisme :</span>
                    <span className="text-emerald-400">{selectedDay.activityScores.outdoorSport.label} ({selectedDay.activityScores.outdoorSport.score}/100)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${selectedDay.activityScores.outdoorSport.score}%` }} />
                  </div>
                  <p className="text-[11px] text-slate-400">{selectedDay.activityScores.outdoorSport.details}</p>
                </div>

                {/* Jardinage */}
                <div className="space-y-1">
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-200">🌿 Jardinage & Arrosage :</span>
                    <span className="text-green-400">{selectedDay.activityScores.gardening.label} ({selectedDay.activityScores.gardening.score}/100)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: `${selectedDay.activityScores.gardening.score}%` }} />
                  </div>
                  <p className="text-[11px] text-slate-400">{selectedDay.activityScores.gardening.details}</p>
                </div>

                {/* Rando */}
                <div className="space-y-1">
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-200">🏔️ Randonnée & Moyenne Montagne :</span>
                    <span className="text-blue-400">{selectedDay.activityScores.mountainHiking.label} ({selectedDay.activityScores.mountainHiking.score}/100)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${selectedDay.activityScores.mountainHiking.score}%` }} />
                  </div>
                  <p className="text-[11px] text-slate-400">{selectedDay.activityScores.mountainHiking.details}</p>
                </div>

                {/* Plage */}
                <div className="space-y-1">
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-200">🏖️ Baignade & Activités Plein Soleil :</span>
                    <span className="text-amber-400">{selectedDay.activityScores.baignadePlage.label} ({selectedDay.activityScores.baignadePlage.score}/100)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${selectedDay.activityScores.baignadePlage.score}%` }} />
                  </div>
                  <p className="text-[11px] text-slate-400">{selectedDay.activityScores.baignadePlage.details}</p>
                </div>
              </div>
            </div>

            {/* Lifestyle & Organization Tips */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-400" />
                Conseils du Quotidien & Tenue Vestimentaire
              </h4>

              <div className="space-y-3 text-xs">
                <div className="rounded-xl bg-slate-900/70 p-3 border border-slate-800">
                  <span className="font-bold text-slate-200 flex items-center gap-1.5 mb-1">
                    <Shirt className="h-4 w-4 text-indigo-400" />
                    Habillement conseillé :
                  </span>
                  <p className="text-slate-300">{selectedDay.lifestyleTips.clothingAdvice}</p>
                </div>

                <div className="rounded-xl bg-slate-900/70 p-3 border border-slate-800">
                  <span className="font-bold text-slate-200 flex items-center gap-1.5 mb-1">
                    <Wind className="h-4 w-4 text-teal-400" />
                    Aération optimale du domicile :
                  </span>
                  <p className="text-slate-300">{selectedDay.lifestyleTips.ventilationOptimalHour}</p>
                </div>

                <div className="rounded-xl bg-slate-900/70 p-3 border border-slate-800">
                  <span className="font-bold text-slate-200 flex items-center gap-1.5 mb-1">
                    <Sun className="h-4 w-4 text-amber-400" />
                    Protection solaire & UV :
                  </span>
                  <p className="text-slate-300">{selectedDay.lifestyleTips.sunProtectionWindow}</p>
                </div>

                <div className="rounded-xl bg-slate-900/70 p-3 border border-slate-800">
                  <span className="font-bold text-slate-200 flex items-center gap-1.5 mb-1">
                    <Droplets className="h-4 w-4 text-cyan-400" />
                    Hydratation & Arrosage :
                  </span>
                  <p className="text-slate-300">{selectedDay.lifestyleTips.hydratationAdvice} {selectedDay.lifestyleTips.gardenAdvice}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Diurnal Cycle Chart */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Profil d'Évolution Diurne (Température & Probabilité de Pluie)
            </h4>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={dayChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                  <YAxis yAxisId="left" stroke="#38bdf8" fontSize={11} unit="°C" />
                  <YAxis yAxisId="right" orientation="right" stroke="#22d3ee" fontSize={11} unit="%" domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  />
                  <Bar yAxisId="right" dataKey="rainProb" fill="#06b6d4" opacity={0.3} name="Risque Pluie (%)" />
                  <Line yAxisId="left" type="monotone" dataKey="temperature" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} name="Température (°C)" />
                  <Line yAxisId="left" type="monotone" dataKey="feelsLike" stroke="#38bdf8" strokeWidth={2} strokeDasharray="4 4" name="Ressenti (°C)" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-800 bg-slate-950/90 px-6 py-3">
          <span className="text-xs text-slate-400">
            Source : Modélisation haute résolution Open-Meteo & Référentiel Climatologique 1991-2020
          </span>
          <button
            onClick={onClose}
            className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 transition cursor-pointer"
          >
            Fermer l'analyse
          </button>
        </div>
      </div>
    </div>
  );
};
