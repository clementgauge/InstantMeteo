import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  ShieldCheck, 
  Compass, 
  Wind, 
  CloudRain, 
  Sun, 
  Thermometer, 
  Layers, 
  Clock, 
  ChevronRight, 
  Info, 
  RefreshCw, 
  Sliders, 
  History, 
  CheckCircle2, 
  HelpCircle,
  Mountain,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Split
} from 'lucide-react';
import { 
  LocationPoint, 
  FourteenDayScenariosCollection, 
  FourteenDayDayDetail, 
  FourteenDayMilestoneSynthesis,
  DailyForecast,
  CurrentWeather
} from '../types/weather';
import { generateFourteenDayScenarios } from '../services/fourteenDayScenariosService';

interface FourteenDayDetailedTrendsCardProps {
  station: LocationPoint;
  currentTemp?: number;
  currentAnomaly?: number;
  dailyForecasts?: DailyForecast[];
  currentWeather?: CurrentWeather;
  seniorMode?: boolean;
  tempUnit?: 'C' | 'F';
}

export const FourteenDayDetailedTrendsCard: React.FC<FourteenDayDetailedTrendsCardProps> = ({
  station,
  currentTemp,
  currentAnomaly,
  dailyForecasts,
  currentWeather,
  seniorMode = false,
  tempUnit = 'C'
}) => {
  const [data, setData] = useState<FourteenDayScenariosCollection | null>(null);
  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(1);
  const [selectedMilestoneIdx, setSelectedMilestoneIdx] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'dayDetail' | 'milestones' | 'n1Compare' | 'divergenceSynthesis'>('dayDetail');
  const [horizonFilter, setHorizonFilter] = useState<'ALL' | 'SHORT' | 'MEDIUM' | 'LONG'>('ALL');
  const [activeScenarioType, setActiveScenarioType] = useState<'dominant' | 'alt1' | 'alt2'>('dominant');
  const [lastRefreshed, setLastRefreshed] = useState<string>('');

  const refreshData = () => {
    const res = generateFourteenDayScenarios(station, currentTemp, currentAnomaly, dailyForecasts, currentWeather);
    setData(res);
    setLastRefreshed(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  };

  useEffect(() => {
    refreshData();
  }, [station, currentTemp, currentAnomaly, dailyForecasts, currentWeather]);

  if (!data) return null;

  const formatTemp = (celsius: number) => {
    if (tempUnit === 'F') {
      return `${Math.round((celsius * 9/5 + 32) * 10) / 10}°F`;
    }
    return `${celsius > 0 ? '+' : ''}${celsius}°C`;
  };

  const selectedDay: FourteenDayDayDetail = data.days.find(d => d.dayIndex === selectedDayIdx) || data.days[1] || data.days[0];
  const selectedMilestone: FourteenDayMilestoneSynthesis = data.milestones[selectedMilestoneIdx] || data.milestones[0];

  const filteredDays = data.days.filter((d) => {
    if (horizonFilter === 'SHORT') return d.dayIndex >= 1 && d.dayIndex <= 3;
    if (horizonFilter === 'MEDIUM') return d.dayIndex >= 4 && d.dayIndex <= 7;
    if (horizonFilter === 'LONG') return d.dayIndex >= 8 && d.dayIndex <= 14;
    return true;
  });

  const getDivergenceBadge = (level: FourteenDayDayDetail['divergenceLevel']) => {
    switch (level) {
      case 'FAIBLE_CONSENSUS':
        return {
          bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          dot: 'bg-emerald-400',
          label: 'Très faible divergence • Consensus élevé'
        };
      case 'MODEREE':
        return {
          bg: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
          dot: 'bg-blue-400',
          label: 'Divergence modérée • Timing frontal'
        };
      case 'FORTE_DIVERGENCE':
        return {
          bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          dot: 'bg-amber-400',
          label: 'Forte divergence • 2 branches ensemblistes'
        };
      case 'DIVERGENCE_MAXIMALE':
        return {
          bg: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
          dot: 'bg-purple-400',
          label: 'Divergence maximale • Analyse probabiliste'
        };
    }
  };

  return (
    <div id="fourteen-day-scenarios-trends-card" className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 p-6 sm:p-8 shadow-2xl backdrop-blur relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-black uppercase tracking-wider mb-2">
              <Split className="h-4 w-4" />
              <span>Analyseur Détaillé des Tendances à 14 Jours & Divergences Ensemblistes</span>
            </div>
            <h2 className={`font-black text-white ${seniorMode ? 'text-3xl' : 'text-2xl sm:text-3xl'}`}>
              Trajectoires Synoptiques, Scénarios Probabilistes & Comparatif N-1
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Diagnostic atmosphérique précis pour <strong>{station.name}</strong> ({station.altitude} m) • Explications détaillées des divergences multi-modèles (ECMWF, GFS, ICON, ARPEGE, GEM) et comparaison jour par jour avec l'an passé.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="text-[10px] text-slate-400 block font-semibold">Génération Ensembliste</span>
              <span className="text-xs font-bold text-cyan-400 flex items-center gap-1 justify-end">
                <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></span>
                {lastRefreshed || data.lastRunTime}
              </span>
            </div>
            <button
              onClick={refreshData}
              className="flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 px-3.5 py-2 text-xs font-bold transition shadow"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Actualiser</span>
            </button>
          </div>
        </div>

        {/* Global Executive Summary */}
        <div className="mt-5 rounded-2xl bg-slate-950/80 border border-slate-800/80 p-4 text-xs text-slate-200 leading-relaxed">
          <p className="font-semibold text-cyan-200 flex items-center gap-1.5 mb-1">
            <Sparkles className="h-4 w-4 text-cyan-400" />
            <span>Synthèse de l'évolution à 14 jours :</span>
          </p>
          <p>{data.overallSummary}</p>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('dayDetail')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === 'dayDetail'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'bg-slate-950/70 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>1. Tendances Jour par Jour & Scénarios (J+0 à J+14)</span>
          </button>

          <button
            onClick={() => setActiveTab('milestones')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === 'milestones'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-slate-950/70 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>2. Synthèse par Grandes Phases (4 Horizons)</span>
          </button>

          <button
            onClick={() => setActiveTab('n1Compare')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === 'n1Compare'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'bg-slate-950/70 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <History className="h-3.5 w-3.5" />
            <span>3. Comparatif Thermique avec l'Année Dernière (N-1)</span>
          </button>

          <button
            onClick={() => setActiveTab('divergenceSynthesis')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === 'divergenceSynthesis'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-slate-950/70 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            <span>4. Matrice de Vote des Modèles (ECMWF, GFS, ICON...)</span>
          </button>
        </div>
      </div>

      {/* TAB 1: DAY BY DAY EXPLORER */}
      {activeTab === 'dayDetail' && (
        <div className="space-y-6">
          {/* Day Horizon Selector Bar */}
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 shadow-xl backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <span>Filtrer l'horizon d'échéance :</span>
                <button
                  onClick={() => setHorizonFilter('ALL')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                    horizonFilter === 'ALL' ? 'bg-blue-600 text-white' : 'bg-slate-950 text-slate-400 hover:text-white'
                  }`}
                >
                  Tous (14 Jours)
                </button>
                <button
                  onClick={() => setHorizonFilter('SHORT')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                    horizonFilter === 'SHORT' ? 'bg-emerald-600 text-white' : 'bg-slate-950 text-slate-400 hover:text-white'
                  }`}
                >
                  J+1 à J+3 (Haute Fiabilité)
                </button>
                <button
                  onClick={() => setHorizonFilter('MEDIUM')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                    horizonFilter === 'MEDIUM' ? 'bg-amber-600 text-white' : 'bg-slate-950 text-slate-400 hover:text-white'
                  }`}
                >
                  J+4 à J+7 (Moyen Terme)
                </button>
                <button
                  onClick={() => setHorizonFilter('LONG')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                    horizonFilter === 'LONG' ? 'bg-purple-600 text-white' : 'bg-slate-950 text-slate-400 hover:text-white'
                  }`}
                >
                  J+8 à J+14 (Longue Échéance)
                </button>
              </div>

              <span className="text-[11px] text-slate-400">
                Cliquez sur un jour pour ouvrir l'analyse synoptique complète :
              </span>
            </div>

            {/* Horizontal Scrollable Days Slider */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1">
              {filteredDays.map((d) => {
                const isSel = d.dayIndex === selectedDayIdx;
                const badge = getDivergenceBadge(d.divergenceLevel);
                return (
                  <button
                    key={d.dayIndex}
                    onClick={() => setSelectedDayIdx(d.dayIndex)}
                    className={`rounded-xl border p-3 min-w-[125px] text-left transition shrink-0 ${
                      isSel
                        ? 'bg-blue-600/20 border-blue-500 shadow-lg shadow-blue-500/20 ring-1 ring-blue-400'
                        : 'bg-slate-950/80 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mb-1">
                      <span>{d.dayIndex === 0 ? "Auj." : `J+${d.dayIndex}`}</span>
                      <span className={`h-2 w-2 rounded-full ${badge.dot}`}></span>
                    </div>
                    <div className="text-xs font-black text-white truncate">{d.dayLabel}</div>
                    
                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-800/80">
                      <span className="px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-[11px] font-black text-cyan-300">
                        Tn {d.dominantScenario.tempMin}°
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-rose-950/80 border border-rose-500/40 text-[11px] font-black text-rose-300">
                        Tx {d.dominantScenario.tempMax}°
                      </span>
                    </div>

                    <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400 font-semibold pt-1">
                      <span>Confiance :</span>
                      <span className="text-white font-bold">{d.modelConsensusScorePct}%</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Day Deep Scenario & Divergence Inspector */}
          <div className="rounded-3xl border border-blue-500/30 bg-slate-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur space-y-6">
            {/* Header of Selected Day */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    {selectedDay.dayIndex === 0 ? "Observation & Court Terme Immédiat" : `Échéance J+${selectedDay.dayIndex}`}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${getDivergenceBadge(selectedDay.divergenceLevel).bg}`}>
                    {getDivergenceBadge(selectedDay.divergenceLevel).label}
                  </span>
                </div>
                <h3 className="text-2xl font-black text-white">{selectedDay.fullDateFormatted}</h3>
                <p className="text-xs text-slate-300 mt-1">
                  Station de <strong>{station.name}</strong> • Altitude : {station.altitude} m
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-center">
                  <span className="text-[10px] text-slate-400 block font-semibold">Indice de Consensus Modèles</span>
                  <div className="flex items-center justify-center gap-1.5 mt-0.5">
                    <div className="h-2 w-16 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        style={{ width: `${selectedDay.modelConsensusScorePct}%` }}
                        className={`h-full ${
                          selectedDay.modelConsensusScorePct >= 80 ? 'bg-emerald-400' : selectedDay.modelConsensusScorePct >= 60 ? 'bg-blue-400' : 'bg-amber-400'
                        }`}
                      ></div>
                    </div>
                    <span className="text-sm font-black text-white">{selectedDay.modelConsensusScorePct}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Divergence Synoptic Diagnostic Alert Box */}
            <div className="rounded-2xl bg-indigo-950/30 border border-indigo-500/30 p-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider block">
                    Diagnostic d'Incertitude & Divergence Synoptique :
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {selectedDay.divergenceSummary}
                  </p>
                </div>
              </div>
            </div>

            {/* Scenario Switcher Buttons */}
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase mb-2">Sélectionnez le scénario atmosphérique à inspecter :</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* DOMINANT SCENARIO */}
                <button
                  onClick={() => setActiveScenarioType('dominant')}
                  className={`rounded-2xl border p-4 text-left transition flex flex-col justify-between ${
                    activeScenarioType === 'dominant'
                      ? 'bg-blue-600/20 border-blue-500 shadow-md ring-1 ring-blue-400'
                      : 'bg-slate-950/80 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      Scénario Principal
                    </span>
                    <span className="text-xs font-black text-blue-400">{selectedDay.dominantScenario.probabilityPct}% prob.</span>
                  </div>
                  <h4 className="font-bold text-white text-xs line-clamp-1">{selectedDay.dominantScenario.name}</h4>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-sm font-black text-cyan-400">{formatTemp(selectedDay.dominantScenario.tempMin)}</span>
                    <span className="text-slate-500">/</span>
                    <span className="text-sm font-black text-rose-400">{formatTemp(selectedDay.dominantScenario.tempMax)}</span>
                    <span className="text-[11px] text-slate-400 ml-auto">{selectedDay.dominantScenario.precipitationMm} mm</span>
                  </div>
                </button>

                {/* ALT 1 SCENARIO */}
                <button
                  onClick={() => setActiveScenarioType('alt1')}
                  className={`rounded-2xl border p-4 text-left transition flex flex-col justify-between ${
                    activeScenarioType === 'alt1'
                      ? 'bg-amber-600/20 border-amber-500 shadow-md ring-1 ring-amber-400'
                      : 'bg-slate-950/80 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Scénario Alternatif 1
                    </span>
                    <span className="text-xs font-black text-amber-400">{selectedDay.alternativeScenario1.probabilityPct}% prob.</span>
                  </div>
                  <h4 className="font-bold text-white text-xs line-clamp-1">{selectedDay.alternativeScenario1.name}</h4>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-sm font-black text-cyan-400">{formatTemp(selectedDay.alternativeScenario1.tempMin)}</span>
                    <span className="text-slate-500">/</span>
                    <span className="text-sm font-black text-rose-400">{formatTemp(selectedDay.alternativeScenario1.tempMax)}</span>
                    <span className="text-[11px] text-slate-400 ml-auto">{selectedDay.alternativeScenario1.precipitationMm} mm</span>
                  </div>
                </button>

                {/* ALT 2 SCENARIO */}
                {selectedDay.alternativeScenario2 && (
                  <button
                    onClick={() => setActiveScenarioType('alt2')}
                    className={`rounded-2xl border p-4 text-left transition flex flex-col justify-between ${
                      activeScenarioType === 'alt2'
                        ? 'bg-purple-600/20 border-purple-500 shadow-md ring-1 ring-purple-400'
                        : 'bg-slate-950/80 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        Scénario Alternatif 2
                      </span>
                      <span className="text-xs font-black text-purple-400">{selectedDay.alternativeScenario2.probabilityPct}% prob.</span>
                    </div>
                    <h4 className="font-bold text-white text-xs line-clamp-1">{selectedDay.alternativeScenario2.name}</h4>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-sm font-black text-cyan-400">{formatTemp(selectedDay.alternativeScenario2.tempMin)}</span>
                      <span className="text-slate-500">/</span>
                      <span className="text-sm font-black text-rose-400">{formatTemp(selectedDay.alternativeScenario2.tempMax)}</span>
                      <span className="text-[11px] text-slate-400 ml-auto">{selectedDay.alternativeScenario2.precipitationMm} mm</span>
                    </div>
                  </button>
                )}
              </div>
            </div>

            {/* Active Scenario Detail Card */}
            {(() => {
              const activeBranch = activeScenarioType === 'dominant' 
                ? selectedDay.dominantScenario 
                : activeScenarioType === 'alt1' 
                ? selectedDay.alternativeScenario1 
                : selectedDay.alternativeScenario2 || selectedDay.dominantScenario;

              return (
                <div className="rounded-2xl bg-slate-950/90 border border-slate-800 p-6 space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-800">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                        Configuration Synoptique du Scénario
                      </span>
                      <h4 className="text-lg font-black text-white mt-0.5">{activeBranch.name}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Schéma barométrique : <strong className="text-cyan-300">{activeBranch.synopticPattern}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-1.5 text-center">
                        <span className="text-[10px] text-slate-400 block font-semibold">Probabilité</span>
                        <span className="text-base font-black text-emerald-400">{activeBranch.probabilityPct} %</span>
                      </div>
                    </div>
                  </div>

                  {/* Weather Metrics Grid with Prominent Tmin & Tmax */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
                    <div className="rounded-xl bg-cyan-950/40 border border-cyan-500/40 p-3 shadow">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-cyan-300 uppercase tracking-wider block">T° Minimale (Tn)</span>
                        <Thermometer className="h-3.5 w-3.5 text-cyan-400" />
                      </div>
                      <div className="text-xl font-black text-cyan-300 mt-1">
                        {formatTemp(activeBranch.tempMin)}
                      </div>
                      <div className="text-[10px] font-bold text-cyan-400 mt-0.5">
                        {activeBranch.tempMin <= 0 
                          ? '❄️ Risque de Gelée' 
                          : activeBranch.tempMin >= 20 
                          ? '🌴 Nuit Tropicale' 
                          : 'Aube & Fin de Nuit'}
                      </div>
                    </div>

                    <div className="rounded-xl bg-rose-950/40 border border-rose-500/40 p-3 shadow">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-rose-300 uppercase tracking-wider block">T° Maximale (Tx)</span>
                        <Thermometer className="h-3.5 w-3.5 text-rose-400" />
                      </div>
                      <div className="text-xl font-black text-rose-300 mt-1">
                        {formatTemp(activeBranch.tempMax)}
                      </div>
                      <div className="text-[10px] font-bold text-rose-400 mt-0.5">
                        {activeBranch.tempMax >= 30 
                          ? '🔥 Forte Chaleur' 
                          : activeBranch.tempMax <= 0 
                          ? '🧊 Sans Dégel' 
                          : 'Après-midi Diurne'}
                      </div>
                    </div>

                    <div className="rounded-xl bg-slate-900 border border-slate-800 p-3">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Amplitude (ΔT)</span>
                      <div className="text-xl font-black text-indigo-300 mt-1">
                        {(activeBranch.tempMax - activeBranch.tempMin).toFixed(1)}°C
                      </div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Écart Jour/Nuit</span>
                    </div>

                    <div className="rounded-xl bg-slate-900 border border-slate-800 p-3">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Précipitations 24h</span>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-xl font-black text-blue-400">{activeBranch.precipitationMm}</span>
                        <span className="text-xs font-bold text-blue-300">mm</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Cumul Modélisé</span>
                    </div>

                    <div className="rounded-xl bg-slate-900 border border-slate-800 p-3 col-span-2 sm:col-span-1">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Isotherme 0°C</span>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-xl font-black text-cyan-300">{activeBranch.isotherm0Meters ?? 3200}</span>
                        <span className="text-xs font-bold text-cyan-400">m</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Altitude de gelée</span>
                    </div>
                  </div>

                  {/* Detailed Synoptic Text */}
                  <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 space-y-2">
                    <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block">
                      Description Détaillée du Scénario Atmosphérique :
                    </span>
                    <p className="text-xs text-slate-200 leading-relaxed font-medium">
                      {activeBranch.description}
                    </p>
                  </div>
                </div>
              );
            })()}

            {/* Side-by-side N-1 Comparison Card for this specific day */}
            <div className="rounded-2xl bg-slate-950/90 border border-emerald-500/30 p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <History className="h-5 w-5 text-emerald-400" />
                  <div>
                    <h4 className="text-sm font-bold text-white">Comparatif avec la Même Date l'Année Dernière (N-1)</h4>
                    <span className="text-xs text-slate-400">
                      Observation réelle enregistrée le {selectedDay.previousYearComparison.datePreviousYear}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-xl text-xs font-black border ${
                    selectedDay.previousYearComparison.isWarmerThanLastYear
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                  }`}>
                    {selectedDay.previousYearComparison.isWarmerThanLastYear ? 'Plus chaud qu\'en 2025' : 'Plus frais qu\'en 2025'} : {selectedDay.previousYearComparison.deltaTMaxVsN1 > 0 ? `+${selectedDay.previousYearComparison.deltaTMaxVsN1}` : selectedDay.previousYearComparison.deltaTMaxVsN1}°C
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="rounded-xl bg-slate-900 p-3 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-semibold">2026 (Prévu)</span>
                  <div className="text-sm font-black text-white mt-1">
                    Tx {formatTemp(selectedDay.dominantScenario.tempMax)} • Tn {formatTemp(selectedDay.dominantScenario.tempMin)}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Pluie : {selectedDay.dominantScenario.precipitationMm} mm
                  </span>
                </div>

                <div className="rounded-xl bg-slate-900 p-3 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-semibold">2025 (Observé N-1)</span>
                  <div className="text-sm font-black text-emerald-300 mt-1">
                    Tx {formatTemp(selectedDay.previousYearComparison.tempMaxN1)} • Tn {formatTemp(selectedDay.previousYearComparison.tempMinN1)}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {selectedDay.previousYearComparison.weatherDescriptionN1} • {selectedDay.previousYearComparison.rainMmN1} mm
                  </span>
                </div>

                <div className="rounded-xl bg-slate-900 p-3 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-semibold">Normale Climatologique 1991-2020</span>
                  <div className="text-sm font-black text-blue-300 mt-1">
                    Tx {formatTemp(selectedDay.previousYearComparison.normalTMax)} • Tn {formatTemp(selectedDay.previousYearComparison.normalTMin)}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Écart normal : {selectedDay.previousYearComparison.deltaTMeanVsNormal > 0 ? `+${selectedDay.previousYearComparison.deltaTMeanVsNormal}` : selectedDay.previousYearComparison.deltaTMeanVsNormal}°C
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed italic bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                "{selectedDay.previousYearComparison.climaticSummaryN1}"
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MILESTONES SYNTHESIS (4 PHASES) */}
      {activeTab === 'milestones' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl backdrop-blur">
            <div className="mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Progression Synoptique par Paliers de Prévisibilité</span>
              <h3 className="text-xl font-bold text-white mt-0.5">Synthèse des 4 Grandes Phases d'Échéance</h3>
              <p className="text-xs text-slate-300 mt-1">Évolution de la fiabilité et des points de divergence majeurs au fil des 14 jours :</p>
            </div>

            {/* Milestones Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              {data.milestones.map((m, idx) => {
                const isSel = idx === selectedMilestoneIdx;
                return (
                  <button
                    key={m.milestoneId}
                    onClick={() => setSelectedMilestoneIdx(idx)}
                    className={`rounded-2xl border p-4 text-left transition flex flex-col justify-between ${
                      isSel
                        ? 'bg-indigo-600/20 border-indigo-500 shadow-lg shadow-indigo-500/20 ring-1 ring-indigo-400'
                        : 'bg-slate-950/70 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black text-indigo-400">Phase {idx + 1}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          {m.confidenceIndexPct}% fiab.
                        </span>
                      </div>
                      <h4 className="font-bold text-white text-xs leading-snug">{m.title}</h4>
                      <span className="text-[11px] text-slate-400 mt-1 block">{m.daysRangeLabel}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected Milestone Detailed Card */}
            <div className="rounded-2xl border border-indigo-500/30 bg-slate-950/90 p-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                    {selectedMilestone.daysRangeLabel}
                  </span>
                  <h4 className="text-xl font-black text-white mt-0.5">{selectedMilestone.title}</h4>
                  <p className="text-xs text-slate-300 mt-1">
                    Régime synoptique directeur : <strong className="text-cyan-300">{selectedMilestone.dominantRegimeName}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Indice de confiance global :</span>
                  <span className="text-lg font-black text-emerald-400 px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/40">
                    {selectedMilestone.confidenceIndexPct} %
                  </span>
                </div>
              </div>

              {/* Consensus and Divergences */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 space-y-2">
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block">
                    Consensus Atmosphérique Général
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed">{selectedMilestone.synopticConsensusOverview}</p>
                </div>

                <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 space-y-2">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                    Points de Divergence et Incertitudes Modèles
                  </span>
                  <ul className="space-y-1.5">
                    {selectedMilestone.keyDivergencePoints.map((pt, i) => (
                      <li key={i} className="text-xs text-slate-200 flex items-start gap-1.5">
                        <span className="text-amber-400 shrink-0">•</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Overview Temperature & Precip */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="rounded-xl bg-slate-900 p-3.5 border border-slate-800 text-xs">
                  <span className="text-slate-400 font-bold block mb-1">🌡️ Évolution des Températures :</span>
                  <p className="text-slate-200">{selectedMilestone.temperatureTrendOverview}</p>
                </div>

                <div className="rounded-xl bg-slate-900 p-3.5 border border-slate-800 text-xs">
                  <span className="text-slate-400 font-bold block mb-1">🌧️ Précipitations & Instabilité :</span>
                  <p className="text-slate-200">{selectedMilestone.precipitationOverview}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FULL N-1 PREVIOUS YEAR COMPARISON TABLE */}
      {activeTab === 'n1Compare' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Comparatif Année N vs Année N-1</span>
                <h3 className="text-xl font-bold text-white mt-0.5">Tableau Comparatif Jour par Jour : 2026 vs 2025</h3>
                <p className="text-xs text-slate-300 mt-1">
                  Mise en perspective des températures prévues par rapport aux relevés exacts de l'an dernier à {station.name} :
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="py-3 px-3">Date (2026)</th>
                    <th className="py-3 px-3 text-cyan-400">Tn 2026</th>
                    <th className="py-3 px-3 text-rose-400">Tx 2026</th>
                    <th className="py-3 px-3">Date (2025 - N-1)</th>
                    <th className="py-3 px-3 text-cyan-300">Tn 2025</th>
                    <th className="py-3 px-3 text-rose-300">Tx 2025</th>
                    <th className="py-3 px-3 text-center">Écart Tx vs 2025</th>
                    <th className="py-3 px-3">Temps Observé 2025</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {data.days.map((d) => {
                    const comp = d.previousYearComparison;
                    const isWarmer = comp.deltaTMaxVsN1 > 0;
                    return (
                      <tr key={d.dayIndex} className="hover:bg-slate-800/50 transition">
                        <td className="py-3 px-3 font-bold text-white">
                          {d.dayLabel} <span className="text-slate-500 font-normal">({d.dayIndex === 0 ? "Auj." : `J+${d.dayIndex}`})</span>
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-cyan-400">{d.dominantScenario.tempMin}°C</td>
                        <td className="py-3 px-3 font-mono font-bold text-rose-400">{d.dominantScenario.tempMax}°C</td>
                        <td className="py-3 px-3 text-slate-300">{comp.datePreviousYear}</td>
                        <td className="py-3 px-3 font-mono text-cyan-300">{comp.tempMinN1}°C</td>
                        <td className="py-3 px-3 font-mono text-rose-300">{comp.tempMaxN1}°C</td>
                        <td className="py-3 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded font-black text-[11px] ${
                            isWarmer ? 'bg-rose-500/20 text-rose-300' : 'bg-cyan-500/20 text-cyan-300'
                          }`}>
                            {comp.deltaTMaxVsN1 > 0 ? `+${comp.deltaTMaxVsN1}` : comp.deltaTMaxVsN1}°C
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-400">{comp.weatherDescriptionN1}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: MULTI-MODEL VOTING CLUSTERS */}
      {activeTab === 'divergenceSynthesis' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl backdrop-blur">
            <div className="mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Intelligence Multi-Modèles & Consensus</span>
              <h3 className="text-xl font-bold text-white mt-0.5">Matrice de Vote des Grands Centres Météorologiques</h3>
              <p className="text-xs text-slate-300 mt-1">Comparaison des orientations synoptiques des modèles ECMWF (Europe), GFS (USA), ICON (Allemagne), ARPEGE (France) et GEM (Canada) :</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.days.filter(d => d.dayIndex >= 1 && d.dayIndex <= 10).map((d) => (
                <div key={d.dayIndex} className="rounded-2xl bg-slate-950/80 border border-slate-800 p-4 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="font-black text-white text-xs">{d.fullDateFormatted.split(' ').slice(0, 3).join(' ')} (J+{d.dayIndex})</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                      Accord : {d.modelConsensusScorePct}%
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-blue-400">ECMWF (Europe) :</span>
                      <span className="text-slate-200 text-[11px] truncate max-w-[170px]">{d.modelClusters.ecmwfVote}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-400">ARPEGE (France) :</span>
                      <span className="text-slate-200 text-[11px] truncate max-w-[170px]">{d.modelClusters.arpegeVote}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-400">GFS (USA) :</span>
                      <span className="text-slate-200 text-[11px] truncate max-w-[170px]">{d.modelClusters.gfsVote}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-cyan-400">ICON (Allemagne) :</span>
                      <span className="text-slate-200 text-[11px] truncate max-w-[170px]">{d.modelClusters.iconVote}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-purple-400">GEM (Canada) :</span>
                      <span className="text-slate-200 text-[11px] truncate max-w-[170px]">{d.modelClusters.gemVote}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
