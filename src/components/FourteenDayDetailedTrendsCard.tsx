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
  Split,
  Globe,
  BarChart3,
  Shirt,
  Car,
  Home,
  Sprout,
  Umbrella,
  Flame,
  Droplets,
  Zap,
  Check,
  Target,
  Scale
} from 'lucide-react';
import { FourteenDayUncertaintyConeChart } from './FourteenDayUncertaintyConeChart';
import { 
  LocationPoint, 
  FourteenDayScenariosCollection, 
  FourteenDayDayDetail, 
  FourteenDayMilestoneSynthesis,
  DailyForecast,
  CurrentWeather,
  DayMultiModelConsensus
} from '../types/weather';
import { 
  generateFourteenDayScenarios, 
  fetchAndGenerateFourteenDayMultiModelScenarios 
} from '../services/fourteenDayScenariosService';

interface FourteenDayDetailedTrendsCardProps {
  station: LocationPoint;
  currentTemp?: number;
  currentAnomaly?: number;
  dailyForecasts?: DailyForecast[];
  currentWeather?: CurrentWeather;
  seniorMode?: boolean;
  tempUnit?: 'C' | 'F';
  simplifiedMode?: boolean;
}

export const FourteenDayDetailedTrendsCard: React.FC<FourteenDayDetailedTrendsCardProps> = ({
  station,
  currentTemp,
  currentAnomaly,
  dailyForecasts,
  currentWeather,
  seniorMode = false,
  tempUnit = 'C',
  simplifiedMode = false
}) => {
  const [data, setData] = useState<FourteenDayScenariosCollection | null>(() => {
    try {
      return generateFourteenDayScenarios(station, currentTemp, currentAnomaly, dailyForecasts, currentWeather);
    } catch {
      return null;
    }
  });
  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(1);
  const [selectedMilestoneIdx, setSelectedMilestoneIdx] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'dayDetail' | 'uncertaintyCone' | 'multiModels' | 'milestones' | 'n1Compare' | 'divergenceSynthesis'>('dayDetail');
  const [isLoadingMultiModel, setIsLoadingMultiModel] = useState<boolean>(false);
  const [multiModelMetric, setMultiModelMetric] = useState<'tmax' | 'tmin' | 'precip'>('tmax');

  useEffect(() => {
    if (simplifiedMode && activeTab !== 'dayDetail') {
      setActiveTab('dayDetail');
    }
  }, [simplifiedMode, activeTab]);
  const [horizonFilter, setHorizonFilter] = useState<'ALL' | 'SHORT' | 'MEDIUM' | 'LONG'>('ALL');
  const [activeScenarioType, setActiveScenarioType] = useState<'dominant' | 'alt1' | 'alt2'>('dominant');
  const [lastRefreshed, setLastRefreshed] = useState<string>('');

  const refreshData = async () => {
    const res = generateFourteenDayScenarios(station, currentTemp, currentAnomaly, dailyForecasts, currentWeather);
    setData(res);
    setLastRefreshed(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

    try {
      setIsLoadingMultiModel(true);
      const multi = await fetchAndGenerateFourteenDayMultiModelScenarios(station, currentTemp, currentAnomaly, dailyForecasts, currentWeather);
      setData(multi);
    } catch (e) {
      console.warn("Async multi-model error:", e);
    } finally {
      setIsLoadingMultiModel(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [station, currentTemp, currentAnomaly, dailyForecasts, currentWeather]);

  const stats14Day = React.useMemo(() => {
    if (!data?.days || data.days.length === 0) return null;
    let warmest = data.days[0];
    let coldest = data.days[0];
    let wettest = data.days[0];
    let totalTx = 0;
    let rainDays = 0;
    let highConfDays = 0;

    for (const d of data.days) {
      totalTx += d.dominantScenario.tempMax;
      if (d.dominantScenario.tempMax > warmest.dominantScenario.tempMax) warmest = d;
      if (d.dominantScenario.tempMin < coldest.dominantScenario.tempMin) coldest = d;
      if (d.dominantScenario.precipitationMm > wettest.dominantScenario.precipitationMm) wettest = d;
      if (d.dominantScenario.precipitationMm >= 1.0) rainDays++;
      if (d.modelConsensusScorePct >= 75) highConfDays++;
    }

    const avgTx = (totalTx / data.days.length).toFixed(1);
    return { warmest, coldest, wettest, avgTx, rainDays, highConfDays };
  }, [data]);

  if (!data) return null;

  const formatTemp = (celsius?: number | null) => {
    if (celsius === undefined || celsius === null || isNaN(celsius)) return '--';
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

  const getWeatherEmoji = (d: FourteenDayDayDetail): string => {
    const rain = d.dominantScenario.precipitationMm || 0;
    const tmax = d.dominantScenario.tempMax;
    const tmin = d.dominantScenario.tempMin;
    const snow = (tmax <= 2.5) ? (d.dominantScenario.snowfallCm ?? 0) : 0;
    const textDesc = `${d.dominantScenario.name} ${d.dominantScenario.title || ''} ${d.dominantScenario.precipitationType || ''} ${d.dominantScenario.description || ''}`.toLowerCase();

    // Priorité absolue aux orages
    if (textDesc.includes('orage') || textDesc.includes('tonnerre') || textDesc.includes('foudre')) {
      return '⛈️';
    }

    // SÉCURITÉ PHYSIQUE STRICTE NEIGE :
    // La neige ou les flocons ne peuvent se produire QUE si la température maximale est proche ou sous le gel (<= 2.5°C)
    const isColdEnoughForSnow = tmax <= 2.5;
    const mentionsSnow = (textDesc.includes('chute de neige') || textDesc.includes('flocon') || textDesc.includes('averses de neige') || textDesc.includes('neige modérée') || textDesc.includes('neige forte')) &&
      !textDesc.includes('pas de neige') &&
      !textDesc.includes('absence de neige') &&
      !textDesc.includes('aucun flocon');

    if (isColdEnoughForSnow && (snow > 0 || (rain > 0 && tmax <= 1.2) || mentionsSnow)) {
      return '❄️';
    }

    if (textDesc.includes('brouillard') || textDesc.includes('brume dense')) {
      return '🌫️';
    }
    if (rain >= 5) {
      return '🌧️';
    }
    if (rain >= 1.5) {
      return '🌧️';
    }
    if (rain > 0.2) {
      return '🌦️';
    }

    // 1. Chercher le code WMO du scénario ou de la prévision réelle
    let wmoCode = d.dominantScenario.weatherCode;
    if (wmoCode === undefined && dailyForecasts) {
      const match = dailyForecasts.find(df => df.date === d.date);
      if (match && typeof match.weatherCode === 'number') {
        wmoCode = match.weatherCode;
      }
    }

    if (typeof wmoCode === 'number') {
      // Si le code WMO indiquait de la neige mais que la température est douce (> 2.5°C), requalifier en pluie ou éclaircies
      if ([71, 73, 75, 77, 85, 86].includes(wmoCode)) {
        if (!isColdEnoughForSnow) {
          return rain > 0.2 ? '🌧️' : '⛅';
        }
        return '❄️';
      }

      // Si wmoCode indique du soleil mais que de la pluie résiduelle est notée
      if (wmoCode <= 1 && rain > 0.2) return '🌦️';
      switch (wmoCode) {
        case 0: return '☀️';
        case 1: return '🌤️';
        case 2: return '⛅';
        case 3: return '☁️';
        case 45:
        case 48: return '🌫️';
        case 51:
        case 53:
        case 55:
        case 56:
        case 57: return '🌦️';
        case 61:
        case 63:
        case 65:
        case 66:
        case 67: return '🌧️';
        case 80:
        case 81:
        case 82: return '🌦️';
        case 95:
        case 96:
        case 99: return '⛈️';
      }
    }

    // Temps sec
    if (textDesc.includes('couvert') || textDesc.includes('gris') || textDesc.includes('très nuageux') || textDesc.includes('bouché')) {
      return '☁️';
    }
    if (textDesc.includes('éclaircie') || textDesc.includes('variable') || textDesc.includes('mitigé') || textDesc.includes('nuage') || textDesc.includes('voile')) {
      return '⛅';
    }
    if (textDesc.includes('soleil') || textDesc.includes('ensoleillé') || textDesc.includes('dégagé') || textDesc.includes('lumineux')) {
      return '☀️';
    }

    return '⛅';
  };

  const getBranchWeatherEmoji = (b: { weatherCode?: number; precipitationMm: number; snowfallCm?: number; tempMax: number; name: string; title?: string; precipitationType?: string; description?: string }): string => {
    const rain = b.precipitationMm || 0;
    const tmax = b.tempMax;
    const isColdEnoughForSnow = tmax <= 2.5;
    const snow = isColdEnoughForSnow ? (b.snowfallCm ?? 0) : 0;
    const textDesc = `${b.name} ${b.title || ''} ${b.precipitationType || ''} ${b.description || ''}`.toLowerCase();

    if (textDesc.includes('orage') || textDesc.includes('tonnerre') || textDesc.includes('foudre')) return '⛈️';

    if (typeof b.weatherCode === 'number') {
      if ([71, 73, 75, 77, 85, 86].includes(b.weatherCode)) {
        if (!isColdEnoughForSnow) {
          return rain > 0.2 ? '🌧️' : '⛅';
        }
        return '❄️';
      }
      switch (b.weatherCode) {
        case 0: return '☀️';
        case 1: return '🌤️';
        case 2: return '⛅';
        case 3: return '☁️';
        case 45:
        case 48: return '🌫️';
        case 51:
        case 53:
        case 55:
        case 56:
        case 57: return '🌦️';
        case 61:
        case 63:
        case 65:
        case 66:
        case 67: return '🌧️';
        case 80:
        case 81:
        case 82: return '🌦️';
        case 95:
        case 96:
        case 99: return '⛈️';
      }
    }

    const mentionsSnow = (textDesc.includes('chute de neige') || textDesc.includes('flocon') || textDesc.includes('averses de neige')) &&
      !textDesc.includes('pas de neige') &&
      !textDesc.includes('aucun');

    if (isColdEnoughForSnow && (snow > 0 || (rain > 0 && tmax <= 1.2) || mentionsSnow)) return '❄️';
    if (rain >= 5) return '🌧️';
    if (rain >= 1.5) return '🌧️';
    if (rain > 0.1) return '🌦️';
    if (textDesc.includes('couvert') || textDesc.includes('gris')) return '☁️';
    if (textDesc.includes('éclaircie') || textDesc.includes('variable')) return '⛅';
    if (textDesc.includes('soleil') || textDesc.includes('dégagé') || textDesc.includes('sec')) return '☀️';
    return '🌤️';
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

        {/* Sub-Navigation Tabs - Hidden in Simplified Mode */}
        {!simplifiedMode && (
          <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('dayDetail')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                activeTab === 'dayDetail'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 ring-1 ring-blue-400'
                  : 'bg-slate-950/70 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>1. Tendances Quotidiennes & Scénarios</span>
            </button>

            <button
              onClick={() => setActiveTab('uncertaintyCone')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                activeTab === 'uncertaintyCone'
                  ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-1 ring-cyan-400'
                  : 'bg-slate-950/70 border border-cyan-500/30 text-cyan-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Activity className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
              <span className="flex items-center gap-1.5">
                <span>2. 📈 Cône d'Incertitude & Plume (Honnêteté)</span>
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-cyan-400/20 text-cyan-200 border border-cyan-400/40">NOUVEAU</span>
              </span>
            </button>

            <button
              onClick={() => setActiveTab('multiModels')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                activeTab === 'multiModels'
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30 ring-1 ring-amber-400'
                  : 'bg-slate-950/70 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Globe className="h-3.5 w-3.5 text-amber-400" />
              <span>3. 🌐 Comparatif 10 Modèles Mondiaux</span>
            </button>

            <button
              onClick={() => setActiveTab('milestones')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                activeTab === 'milestones'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-1 ring-indigo-400'
                  : 'bg-slate-950/70 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>4. Synthèse des 4 Grandes Phases</span>
            </button>

            <button
              onClick={() => setActiveTab('n1Compare')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                activeTab === 'n1Compare'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 ring-1 ring-emerald-400'
                  : 'bg-slate-950/70 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <History className="h-3.5 w-3.5" />
              <span>5. Comparatif Année N vs N-1</span>
            </button>

            <button
              onClick={() => setActiveTab('divergenceSynthesis')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                activeTab === 'divergenceSynthesis'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 ring-1 ring-purple-400'
                  : 'bg-slate-950/70 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Scale className="h-3.5 w-3.5" />
              <span>6. Vote & Convergence des Centres</span>
            </button>
          </div>
        )}
      </div>

      {/* TAB 1: DAY BY DAY EXPLORER */}
      {activeTab === 'dayDetail' && (
        <div className="space-y-6">
          {/* Visual Trend Synthesis Module (Hyper-Clear & Scannable 14-Day Trajectory) */}
          {stats14Day && (
            <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-indigo-950/30 to-slate-900 p-5 sm:p-6 shadow-xl backdrop-blur space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                      <BarChart3 className="h-4 w-4" />
                      Synthèse Visuelle des Tendances (14 Jours)
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      10 Modèles Synoptiques
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-white">Trajectoire Thermique & Chronologie Météorologique</h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Vue d'ensemble synthétique pour <strong>{station.name}</strong> • Cliquez sur une journée pour inspecter ses scénarios et impacts détaillés :
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800 font-mono">
                    Moyenne Tx : <strong className="text-white">{stats14Day.avgTx}°C</strong>
                  </span>
                </div>
              </div>

              {/* 4 Macro Indicator Pillars */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {/* 1. Warmest Day */}
                <button
                  onClick={() => setSelectedDayIdx(stats14Day.warmest.dayIndex)}
                  className="rounded-2xl bg-rose-950/30 border border-rose-500/30 p-3.5 text-left hover:bg-rose-950/50 transition group"
                >
                  <div className="flex items-center justify-between text-rose-400 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-wider">Pic de Chaleur 14J</span>
                    <Flame className="h-4 w-4" />
                  </div>
                  <div className="text-xl font-black text-rose-300">
                    {formatTemp(stats14Day.warmest.dominantScenario.tempMax)}
                  </div>
                  <div className="text-xs font-bold text-slate-200 mt-0.5">
                    {stats14Day.warmest.dayLabel} ({stats14Day.warmest.dayIndex === 0 ? "Auj." : `J+${stats14Day.warmest.dayIndex}`})
                  </div>
                  <span className="text-[10px] text-rose-400/90 block mt-1">
                    {stats14Day.warmest.multiModelConsensus?.warmestModelName ? `Modèle : ${stats14Day.warmest.multiModelConsensus.warmestModelName}` : 'Après-midi le plus chaud'}
                  </span>
                </button>

                {/* 2. Coldest Night */}
                <button
                  onClick={() => setSelectedDayIdx(stats14Day.coldest.dayIndex)}
                  className="rounded-2xl bg-cyan-950/30 border border-cyan-500/30 p-3.5 text-left hover:bg-cyan-950/50 transition group"
                >
                  <div className="flex items-center justify-between text-cyan-400 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-wider">Nuit la Plus Fraîche</span>
                    <Thermometer className="h-4 w-4" />
                  </div>
                  <div className="text-xl font-black text-cyan-300">
                    {formatTemp(stats14Day.coldest.dominantScenario.tempMin)}
                  </div>
                  <div className="text-xs font-bold text-slate-200 mt-0.5">
                    {stats14Day.coldest.dayLabel} ({stats14Day.coldest.dayIndex === 0 ? "Auj." : `J+${stats14Day.coldest.dayIndex}`})
                  </div>
                  <span className="text-[10px] text-cyan-400/90 block mt-1">
                    {stats14Day.coldest.dominantScenario.tempMin <= 0 ? '⚠️ Risque de gelée matinale' : 'Aube la plus fraîche'}
                  </span>
                </button>

                {/* 3. Wettest Day */}
                <button
                  onClick={() => setSelectedDayIdx(stats14Day.wettest.dayIndex)}
                  className="rounded-2xl bg-blue-950/30 border border-blue-500/30 p-3.5 text-left hover:bg-blue-950/50 transition group"
                >
                  <div className="flex items-center justify-between text-blue-400 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-wider">Front le Plus Arrosé</span>
                    <CloudRain className="h-4 w-4" />
                  </div>
                  <div className="text-xl font-black text-blue-300 flex items-baseline gap-1">
                    <span>{stats14Day.wettest.dominantScenario.precipitationMm}</span>
                    <span className="text-xs font-bold">mm</span>
                  </div>
                  <div className="text-xs font-bold text-slate-200 mt-0.5">
                    {stats14Day.wettest.dayLabel} ({stats14Day.wettest.dayIndex === 0 ? "Auj." : `J+${stats14Day.wettest.dayIndex}`})
                  </div>
                  <span className="text-[10px] text-blue-400/90 block mt-1">
                    {stats14Day.rainDays} jour{stats14Day.rainDays > 1 ? 's' : ''} avec pluie sur 14j
                  </span>
                </button>

                {/* 4. High Confidence Window */}
                <div className="rounded-2xl bg-emerald-950/30 border border-emerald-500/30 p-3.5">
                  <div className="flex items-center justify-between text-emerald-400 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-wider">Fenêtre Haute Certitude</span>
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div className="text-xl font-black text-emerald-300">
                    J+1 à J+4
                  </div>
                  <div className="text-xs font-bold text-slate-200 mt-0.5">
                    {stats14Day.highConfDays} jours à fort accord
                  </div>
                  <span className="text-[10px] text-emerald-400/90 block mt-1">
                    Run déterministe haute résolution
                  </span>
                </div>
              </div>

              {/* SINGLE UNIFIED 14-DAY FORECAST & RELIABILITY RIBBON */}
              <div className="pt-2 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-white uppercase tracking-wide flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                      Ligne unique de tendances & fiabilité (14 jours) :
                    </span>
                    <span className="text-[11px] text-slate-400 hidden sm:inline">• Touchez un jour pour ouvrir l'analyse</span>
                  </div>

                  {/* Horizon filter buttons directly on the single line */}
                  <div className="flex items-center gap-1 overflow-x-auto pb-1">
                    <button
                      onClick={() => setHorizonFilter('ALL')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                        horizonFilter === 'ALL' ? 'bg-blue-600 text-white shadow' : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      Tous (14J)
                    </button>
                    <button
                      onClick={() => setHorizonFilter('SHORT')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                        horizonFilter === 'SHORT' ? 'bg-emerald-600 text-white shadow' : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      J+1 à J+3 (Haute Fiabilité)
                    </button>
                    <button
                      onClick={() => setHorizonFilter('MEDIUM')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                        horizonFilter === 'MEDIUM' ? 'bg-amber-600 text-white shadow' : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      J+4 à J+7 (Moyen Terme)
                    </button>
                    <button
                      onClick={() => setHorizonFilter('LONG')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                        horizonFilter === 'LONG' ? 'bg-purple-600 text-white shadow' : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      J+8 à J+14 (Tendances)
                    </button>
                  </div>
                </div>

                {/* Mobile-optimized single line horizontal carousel */}
                <div className="flex items-stretch gap-2.5 overflow-x-auto pb-3 pt-1 scrollbar-thin snap-x snap-mandatory">
                  {filteredDays.map((d) => {
                    const isSelected = d.dayIndex === selectedDayIdx;
                    const badge = getDivergenceBadge(d.divergenceLevel);
                    const hasRain = d.dominantScenario.precipitationMm >= 0.5;
                    const weatherEmoji = getWeatherEmoji(d);

                    return (
                      <button
                        key={d.dayIndex}
                        onClick={() => setSelectedDayIdx(d.dayIndex)}
                        className={`snap-start min-w-[115px] sm:min-w-[130px] rounded-2xl p-3 text-left transition relative border flex flex-col justify-between cursor-pointer shrink-0 ${
                          isSelected
                            ? 'bg-gradient-to-b from-blue-600/30 via-indigo-950/60 to-slate-900 border-blue-400 ring-2 ring-blue-500 shadow-xl shadow-blue-500/25'
                            : 'bg-slate-950/85 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                        }`}
                      >
                        {/* Day offset & Symbol */}
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                            isSelected ? 'bg-blue-500 text-white' : 'bg-slate-900 text-slate-400 border border-slate-800'
                          }`}>
                            {d.dayIndex === 0 ? "Auj." : d.dayIndex === 1 ? "Dem." : `J+${d.dayIndex}`}
                          </span>
                          <span className="text-xl" title={d.dominantScenario.name}>
                            {weatherEmoji}
                          </span>
                        </div>

                        {/* Day Label */}
                        <div className="text-xs font-black text-white truncate">
                          {d.dayLabel}
                        </div>

                        {/* Thermal Range */}
                        <div className="my-2 py-1 px-2 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                          <span className="text-[11px] font-bold text-cyan-300 font-mono">
                            {d.dominantScenario.tempMin}°
                          </span>
                          <span className="text-slate-600 font-bold">•</span>
                          <span className="text-xs font-black text-rose-400 font-mono">
                            {d.dominantScenario.tempMax}°
                          </span>
                        </div>

                        {/* Precipitation */}
                        <div className="text-[11px] font-semibold mb-2 flex items-center justify-between">
                          <span className="text-[10px] text-slate-500">Pluie :</span>
                          {hasRain ? (
                            <span className="text-blue-400 font-bold font-mono flex items-center gap-0.5 text-[11px]">
                              <Droplets className="h-2.5 w-2.5" />
                              {d.dominantScenario.precipitationMm} mm
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[10px]">Sec</span>
                          )}
                        </div>

                        {/* Single unified reliability & uncertainty badge */}
                        <div className="pt-1.5 border-t border-slate-800/80">
                          <div className="flex items-center justify-between text-[10px] font-bold mb-1">
                            <div className="flex items-center gap-1">
                              <span className={`h-2 w-2 rounded-full ${badge.dot}`}></span>
                              <span className="text-slate-300">{d.modelConsensusScorePct}%</span>
                            </div>
                            <span className="text-[9px] font-mono font-bold text-cyan-300">
                              ±{d.uncertaintyMarginC}°
                            </span>
                          </div>
                          {/* Mini reliability bar */}
                          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                d.modelConsensusScorePct >= 80 ? 'bg-emerald-400' :
                                d.modelConsensusScorePct >= 65 ? 'bg-amber-400' :
                                'bg-purple-400'
                              }`}
                              style={{ width: `${d.modelConsensusScorePct}%` }}
                            />
                          </div>
                        </div>

                        {/* Bottom selection indicator */}
                        {isSelected && (
                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-blue-400 rounded-full shadow-lg shadow-blue-400"></div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

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

            {/* Scientific Honesty & Uncertainty Transparency Dashboard */}
            <div className="rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40 p-5 sm:p-6 space-y-5 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-cyan-400">
                      <Scale className="h-4 w-4" />
                      Honnêteté Scientifique & Fiabilisation Météorologique
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                      selectedDay.confidenceGrade === 'EXCELLENTE'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : selectedDay.confidenceGrade === 'BONNE'
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                        : selectedDay.confidenceGrade === 'MOYENNE'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                    }`}>
                      {selectedDay.confidenceGradeLabel || selectedDay.confidenceGrade}
                    </span>
                  </div>
                  <h4 className="text-lg font-black text-white">
                    Analyse des Incertitudes & Fourchette Réelle pour {selectedDay.fullDateFormatted}
                  </h4>
                </div>

                <button
                  onClick={() => setActiveTab('uncertaintyCone')}
                  className="flex items-center gap-1.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-200 px-3 py-1.5 text-xs font-bold transition"
                >
                  <Activity className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Voir la Plume & Cône 14J</span>
                </button>
              </div>

              {/* Realistic Temperature Span Bar (Avoiding False Precision) */}
              <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-4 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="font-bold text-slate-300 flex items-center gap-1.5">
                    <Thermometer className="h-4 w-4 text-cyan-400" />
                    <span>Fourchettes Probables Réelles (Marge de dispersion : ±{selectedDay.uncertaintyMarginC}°C)</span>
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Refus des chiffres illusoires fixes
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* Tx Range */}
                  <div className="rounded-xl bg-slate-900/90 border border-rose-500/20 p-3 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-black tracking-wider text-rose-400 block">
                        Tx Après-Midi Probable
                      </span>
                      <div className="text-sm font-black text-white font-mono mt-0.5">
                        {selectedDay.probableTxRange ? `${selectedDay.probableTxRange.min}°C à ${selectedDay.probableTxRange.max}°C` : `${selectedDay.dominantScenario.tempMax}°C`}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-semibold">Médiane Dominante</span>
                      <span className="text-sm font-black text-rose-300 font-mono">{selectedDay.dominantScenario.tempMax}°C</span>
                    </div>
                  </div>

                  {/* Tn Range */}
                  <div className="rounded-xl bg-slate-900/90 border border-cyan-500/20 p-3 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-black tracking-wider text-cyan-400 block">
                        Tn Nuit / Aube Probable
                      </span>
                      <div className="text-sm font-black text-white font-mono mt-0.5">
                        {selectedDay.probableTnRange ? `${selectedDay.probableTnRange.min}°C à ${selectedDay.probableTnRange.max}°C` : `${selectedDay.dominantScenario.tempMin}°C`}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-semibold">Médiane Dominante</span>
                      <span className="text-sm font-black text-cyan-300 font-mono">{selectedDay.dominantScenario.tempMin}°C</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3 Honesty Pillars */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {/* 1. What is Certain */}
                <div className="rounded-2xl bg-emerald-950/20 border border-emerald-500/30 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <ShieldCheck className="h-4 w-4 shrink-0" />
                    <span className="text-xs font-black uppercase tracking-wider">Ce qui est Acquis</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-medium">
                    {selectedDay.whatIsCertain}
                  </p>
                </div>

                {/* 2. What is Uncertain */}
                <div className="rounded-2xl bg-amber-950/20 border border-amber-500/30 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span className="text-xs font-black uppercase tracking-wider">Ce qui Reste Indécis</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-medium">
                    {selectedDay.whatIsUncertain}
                  </p>
                </div>

                {/* 3. Synoptic Pivot Point */}
                <div className="rounded-2xl bg-indigo-950/20 border border-indigo-500/30 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-400">
                    <Split className="h-4 w-4 shrink-0" />
                    <span className="text-xs font-black uppercase tracking-wider">Point de Bascule</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-medium">
                    {selectedDay.synopticPivot}
                  </p>
                </div>
              </div>
            </div>

            {/* Scenario Switcher Buttons */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase">
                  Faisceau de Scénarios Ensemblistes Alternatifs (Cliquez pour détailler) :
                </span>
                <span className="text-[11px] text-slate-500">
                  Somme des probabilités = 100%
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* DOMINANT SCENARIO */}
                <button
                  onClick={() => setActiveScenarioType('dominant')}
                  className={`rounded-2xl border p-4 text-left transition flex flex-col justify-between relative overflow-hidden ${
                    activeScenarioType === 'dominant'
                      ? 'bg-blue-600/20 border-blue-500 shadow-md ring-2 ring-blue-400'
                      : 'bg-slate-950/80 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
                      <span>{getBranchWeatherEmoji(selectedDay.dominantScenario)}</span>
                      <span>Scénario Principal</span>
                    </span>
                    <span className="text-xs font-black text-blue-400 font-mono">{selectedDay.dominantScenario.probabilityPct}% prob.</span>
                  </div>
                  {/* Probability mini bar */}
                  <div className="w-full h-1 bg-slate-800 rounded-full mb-2 overflow-hidden">
                    <div className="h-full bg-blue-400" style={{ width: `${selectedDay.dominantScenario.probabilityPct}%` }}></div>
                  </div>
                  <h4 className="font-bold text-white text-xs line-clamp-1">{selectedDay.dominantScenario.name}</h4>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-sm font-black text-cyan-400 font-mono">{formatTemp(selectedDay.dominantScenario.tempMin)}</span>
                    <span className="text-slate-500">/</span>
                    <span className="text-sm font-black text-rose-400 font-mono">{formatTemp(selectedDay.dominantScenario.tempMax)}</span>
                    <span className="text-[11px] text-slate-400 ml-auto font-mono">{selectedDay.dominantScenario.precipitationMm} mm</span>
                  </div>
                </button>

                {/* ALT 1 SCENARIO */}
                <button
                  onClick={() => setActiveScenarioType('alt1')}
                  className={`rounded-2xl border p-4 text-left transition flex flex-col justify-between relative overflow-hidden ${
                    activeScenarioType === 'alt1'
                      ? 'bg-amber-600/20 border-amber-500 shadow-md ring-2 ring-amber-400'
                      : 'bg-slate-950/80 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                      <span>{getBranchWeatherEmoji(selectedDay.alternativeScenario1)}</span>
                      <span>Scénario Alternatif 1</span>
                    </span>
                    <span className="text-xs font-black text-amber-400 font-mono">{selectedDay.alternativeScenario1.probabilityPct}% prob.</span>
                  </div>
                  {/* Probability mini bar */}
                  <div className="w-full h-1 bg-slate-800 rounded-full mb-2 overflow-hidden">
                    <div className="h-full bg-amber-400" style={{ width: `${selectedDay.alternativeScenario1.probabilityPct}%` }}></div>
                  </div>
                  <h4 className="font-bold text-white text-xs line-clamp-1">{selectedDay.alternativeScenario1.name}</h4>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-sm font-black text-cyan-400 font-mono">{formatTemp(selectedDay.alternativeScenario1.tempMin)}</span>
                    <span className="text-slate-500">/</span>
                    <span className="text-sm font-black text-rose-400 font-mono">{formatTemp(selectedDay.alternativeScenario1.tempMax)}</span>
                    <span className="text-[11px] text-slate-400 ml-auto font-mono">{selectedDay.alternativeScenario1.precipitationMm} mm</span>
                  </div>
                </button>

                {/* ALT 2 SCENARIO */}
                {selectedDay.alternativeScenario2 && (
                  <button
                    onClick={() => setActiveScenarioType('alt2')}
                    className={`rounded-2xl border p-4 text-left transition flex flex-col justify-between relative overflow-hidden ${
                      activeScenarioType === 'alt2'
                        ? 'bg-purple-600/20 border-purple-500 shadow-md ring-2 ring-purple-400'
                        : 'bg-slate-950/80 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                        <span>{getBranchWeatherEmoji(selectedDay.alternativeScenario2)}</span>
                        <span>Scénario Alternatif 2</span>
                      </span>
                      <span className="text-xs font-black text-purple-400 font-mono">{selectedDay.alternativeScenario2.probabilityPct}% prob.</span>
                    </div>
                    {/* Probability mini bar */}
                    <div className="w-full h-1 bg-slate-800 rounded-full mb-2 overflow-hidden">
                      <div className="h-full bg-purple-400" style={{ width: `${selectedDay.alternativeScenario2.probabilityPct}%` }}></div>
                    </div>
                    <h4 className="font-bold text-white text-xs line-clamp-1">{selectedDay.alternativeScenario2.name}</h4>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-sm font-black text-cyan-400 font-mono">{formatTemp(selectedDay.alternativeScenario2.tempMin)}</span>
                      <span className="text-slate-500">/</span>
                      <span className="text-sm font-black text-rose-400 font-mono">{formatTemp(selectedDay.alternativeScenario2.tempMax)}</span>
                      <span className="text-[11px] text-slate-400 ml-auto font-mono">{selectedDay.alternativeScenario2.precipitationMm} mm</span>
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
                <div className="rounded-2xl bg-slate-950/90 border border-slate-800 p-6 space-y-6">
                  {/* Scenario Header with Supporting Models */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                          Configuration Synoptique du Scénario
                        </span>
                        {activeBranch.title && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            {activeBranch.title}
                          </span>
                        )}
                      </div>
                      <h4 className="text-xl font-black text-white">{activeBranch.name}</h4>
                      <p className="text-xs text-slate-300">
                        Schéma barométrique : <strong className="text-cyan-300">{activeBranch.synopticPattern}</strong>
                      </p>
                    </div>

                      <div className="flex items-center gap-3">
                        <span className="text-3xl" title={activeBranch.weatherDescription || activeBranch.name}>
                          {getBranchWeatherEmoji(activeBranch)}
                        </span>
                        <div className="rounded-xl bg-slate-900 border border-slate-800 px-4 py-2 text-center">
                          <span className="text-[10px] text-slate-400 block font-semibold">Probabilité</span>
                          <span className="text-lg font-black text-emerald-400">{activeBranch.probabilityPct} %</span>
                        </div>
                      </div>
                  </div>

                  {/* Supporting Models Pills */}
                  {activeBranch.supportingModels && activeBranch.supportingModels.length > 0 && (
                    <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-3 flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5 shrink-0">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Modèles appuyant ce scénario :</span>
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {activeBranch.supportingModels.map((mName, idx) => (
                          <span 
                            key={idx} 
                            className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-950 border border-slate-700 text-slate-200 shadow-sm"
                          >
                            {mName}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Physical Synoptic Trigger Box */}
                  {activeBranch.synopticTrigger && (
                    <div className="rounded-xl bg-blue-950/30 border border-blue-500/30 p-4 space-y-1.5">
                      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-cyan-300">
                        <Zap className="h-4 w-4 text-cyan-400" />
                        <span>Déclencheur Synoptique & Mécanisme Atmosphérique Précis :</span>
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed font-medium">
                        {activeBranch.synopticTrigger}
                      </p>
                    </div>
                  )}

                  {/* Hyper-Precise Weather Metrics Grid */}
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                      <BarChart3 className="h-3.5 w-3.5 text-blue-400" />
                      <span>Paramètres Physiques Détaillés pour {selectedDay.dayLabel} :</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                      {/* Tn */}
                      <div className="rounded-xl bg-cyan-950/40 border border-cyan-500/40 p-3 shadow">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-cyan-300 uppercase tracking-wider block">Tn (Aube)</span>
                          <Thermometer className="h-3.5 w-3.5 text-cyan-400" />
                        </div>
                        <div className="text-xl font-black text-cyan-300 mt-1">
                          {formatTemp(activeBranch.tempMin)}
                        </div>
                        <div className="text-[10px] font-bold text-cyan-400 mt-0.5">
                          {activeBranch.tempMin <= 0 ? '❄️ Risque de gelée' : 'Fraîcheur matinale'}
                        </div>
                      </div>

                      {/* Tx */}
                      <div className="rounded-xl bg-rose-950/40 border border-rose-500/40 p-3 shadow">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-rose-300 uppercase tracking-wider block">Tx (Après-midi)</span>
                          <Thermometer className="h-3.5 w-3.5 text-rose-400" />
                        </div>
                        <div className="text-xl font-black text-rose-300 mt-1">
                          {formatTemp(activeBranch.tempMax)}
                        </div>
                        <div className="text-[10px] font-bold text-rose-400 mt-0.5">
                          {activeBranch.tempMax >= 30 ? '🔥 Forte chaleur' : 'Température diurne'}
                        </div>
                      </div>

                      {/* Ressenti Max */}
                      <div className="rounded-xl bg-amber-950/30 border border-amber-500/30 p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-amber-300 uppercase block">Ressenti Max</span>
                          <Flame className="h-3.5 w-3.5 text-amber-400" />
                        </div>
                        <div className="text-xl font-black text-amber-300 mt-1">
                          {formatTemp(activeBranch.feelsLikeMax ?? activeBranch.tempMax)}
                        </div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Vent & humidité</span>
                      </div>

                      {/* Précipitations */}
                      <div className="rounded-xl bg-blue-950/30 border border-blue-500/30 p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-blue-300 uppercase block">Pluie 24h</span>
                          <CloudRain className="h-3.5 w-3.5 text-blue-400" />
                        </div>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-xl font-black text-blue-400">{activeBranch.precipitationMm}</span>
                          <span className="text-xs font-bold text-blue-300">mm</span>
                        </div>
                        <span className="text-[10px] text-slate-300 block truncate">
                          {activeBranch.precipitationType ?? (activeBranch.precipitationMm > 0 ? "Ondée" : "Sec")}
                        </span>
                      </div>

                      {/* Vent */}
                      <div className="rounded-xl bg-slate-900 border border-slate-800 p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">Vent Max</span>
                          <Wind className="h-3.5 w-3.5 text-slate-400" />
                        </div>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-xl font-black text-white">{activeBranch.windGustKmh ?? 30}</span>
                          <span className="text-xs font-bold text-slate-400">km/h</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block truncate font-semibold">
                          {activeBranch.windDirection ?? "Ouest"}
                        </span>
                      </div>

                      {/* Soleil ou Isotherme */}
                      <div className="rounded-xl bg-slate-900 border border-slate-800 p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">Soleil Prévu</span>
                          <Sun className="h-3.5 w-3.5 text-amber-400" />
                        </div>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-xl font-black text-amber-300">{activeBranch.sunshineHours ?? 8}</span>
                          <span className="text-xs font-bold text-slate-400">h</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block font-semibold truncate">
                          Iso 0° : {activeBranch.isotherm0Meters ?? 3000}m
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Practical Daily Impacts (Hyper-Precise User Guidance) */}
                  {activeBranch.practicalImpacts && (
                    <div className="space-y-3 pt-2">
                      <div className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="h-4 w-4 text-cyan-400" />
                        <span>Conséquences Pratiques & Recommandations au Quotidien :</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* 1. Habillement */}
                        <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-3.5 flex items-start gap-3">
                          <div className="h-8 w-8 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0 mt-0.5">
                            <Shirt className="h-4 w-4" />
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-xs font-bold text-white block">Tenue & Vêtements Conseillés</span>
                            <p className="text-xs text-slate-300 leading-relaxed">
                              {activeBranch.practicalImpacts.clothing}
                            </p>
                          </div>
                        </div>

                        {/* 2. Activités Extérieures & Agriculture */}
                        <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-3.5 flex items-start gap-3">
                          <div className="h-8 w-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                            <Sprout className="h-4 w-4" />
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-xs font-bold text-white block">Jardinage, Chantiers & Sports Extérieurs</span>
                            <p className="text-xs text-slate-300 leading-relaxed">
                              {activeBranch.practicalImpacts.agricultureOutdoor}
                            </p>
                          </div>
                        </div>

                        {/* 3. Conduite & Transports */}
                        <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-3.5 flex items-start gap-3">
                          <div className="h-8 w-8 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0 mt-0.5">
                            <Car className="h-4 w-4" />
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-xs font-bold text-white block">Conduite & Sécurité Routière</span>
                            <p className="text-xs text-slate-300 leading-relaxed">
                              {activeBranch.practicalImpacts.drivingTransit}
                            </p>
                          </div>
                        </div>

                        {/* 4. Confort Intérieur & Énergie */}
                        <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-3.5 flex items-start gap-3">
                          <div className="h-8 w-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 mt-0.5">
                            <Home className="h-4 w-4" />
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-xs font-bold text-white block">Habitat, Aération & Confort Domestique</span>
                            <p className="text-xs text-slate-300 leading-relaxed">
                              {activeBranch.practicalImpacts.homeComfort}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Detailed Synoptic Narrative */}
                  <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 space-y-1.5">
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

            {/* Multi-Model 10-Agency Live Consensus on this specific selected day */}
            {selectedDay.multiModelConsensus && (
              <div className="rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40 border border-indigo-500/30 p-5 space-y-4 shadow-xl">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                      <Globe className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white flex items-center gap-2">
                        Consensus Multi-Modèles (10 Modèles Mondiaux Interrogés)
                        {isLoadingMultiModel && (
                          <span className="text-[10px] font-normal text-amber-300 flex items-center gap-1 animate-pulse">
                            <RefreshCw className="h-3 w-3 animate-spin" /> Actualisation live...
                          </span>
                        )}
                      </h4>
                      <span className="text-xs text-slate-400">
                        Comparaison directe des centres mondiaux pour le {selectedDay.fullDateFormatted}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-xl text-xs font-black border ${
                      selectedDay.multiModelConsensus.agreementStatus === 'UNANIME' 
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : selectedDay.multiModelConsensus.agreementStatus === 'BON_ACCORD'
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                        : selectedDay.multiModelConsensus.agreementStatus === 'DIVERGENCE_MODEREE'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                    }`}>
                      {selectedDay.multiModelConsensus.agreementLabel}
                    </span>
                  </div>
                </div>

                {/* Thermal Dispersion Summary Bar with Warmest and Coldest Models */}
                <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-3.5 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xs font-bold text-slate-400">Médiane Tx mondiale :</span>
                    <span className="text-lg font-black text-rose-400 font-mono">
                      {formatTemp(selectedDay.multiModelConsensus.tempMaxMedian)}
                    </span>
                    <span className="text-slate-600">|</span>
                    <span className="text-xs font-bold text-slate-400">Fourchette Tx :</span>
                    <span className="text-xs font-mono font-bold text-slate-300">
                      {formatTemp(selectedDay.multiModelConsensus.tempMaxMin)} à {formatTemp(selectedDay.multiModelConsensus.tempMaxMax)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    {selectedDay.multiModelConsensus.warmestModelName && (
                      <span className="text-rose-300">
                        Plus chaud : <strong>{selectedDay.multiModelConsensus.warmestModelName}</strong> ({formatTemp(selectedDay.multiModelConsensus.tempMaxMax)})
                      </span>
                    )}
                    {selectedDay.multiModelConsensus.coldestModelName && (
                      <span className="text-cyan-300">
                        Plus frais : <strong>{selectedDay.multiModelConsensus.coldestModelName}</strong> ({formatTemp(selectedDay.multiModelConsensus.tempMaxMin)})
                      </span>
                    )}
                    <span className="text-amber-400 font-mono font-bold">
                      Δ {selectedDay.multiModelConsensus.tempMaxSpread}°C
                    </span>
                  </div>
                </div>

                {/* Grid of the 10 Models */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                  {Object.entries(selectedDay.multiModelConsensus.models).map(([key, model]) => {
                    if (!model.isAvailable || model.tempMax === null) return null;
                    const deltaVsMed = Number((model.tempMax - (selectedDay.multiModelConsensus?.tempMaxMedian ?? 0)).toFixed(1));
                    return (
                      <div key={key} className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 hover:border-slate-700 transition">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 mb-1">
                          <span className="truncate pr-1 flex items-center gap-1">
                            <span>{model.flag ?? '🌐'}</span>
                            <span className="truncate">{model.shortName ?? model.name}</span>
                          </span>
                          <span className="text-[9px] text-slate-400 font-mono shrink-0">{model.resolutionKm ?? ''}</span>
                        </div>
                        <div className="flex items-baseline justify-between mt-1">
                          <span className="text-base font-black text-white font-mono">
                            {formatTemp(model.tempMax)}
                          </span>
                          <span className={`text-[10px] font-mono font-bold ${
                            deltaVsMed > 0.5 ? 'text-rose-400' : deltaVsMed < -0.5 ? 'text-cyan-400' : 'text-slate-400'
                          }`}>
                            {deltaVsMed > 0 ? `+${deltaVsMed}` : deltaVsMed}°C
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1 pt-1 border-t border-slate-800/80">
                          <span>Tn : <strong className="text-cyan-300 font-mono">{formatTemp(model.tempMin ?? undefined)}</strong></span>
                          <span>{model.precipitationMm ?? 0} mm</span>
                        </div>
                        {model.runStatus && (
                          <div className="mt-1 text-[9px] font-semibold text-slate-500">
                            {model.runStatus === 'DIRECT_RUN' ? (
                              <span className="text-emerald-400/90">✓ Run Direct</span>
                            ) : (
                              <span className="text-indigo-400/90">~ Tendance Ens.</span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Synoptic Discrepancy Insight */}
                <div className="rounded-xl bg-indigo-950/30 border border-indigo-500/20 p-3 flex items-start gap-2.5">
                  <Info className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong>Explication synoptique de la divergence :</strong> {selectedDay.multiModelConsensus.synopticDiscrepancyReason}
                  </p>
                </div>
              </div>
            )}

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

      {/* TAB 2: CÔNE D'INCERTITUDE & PLUME ENSEMBLISTE 14 JOURS (HONNÊTETÉ SCIENTIFIQUE) */}
      {activeTab === 'uncertaintyCone' && (
        <FourteenDayUncertaintyConeChart
          days={data.days}
          selectedDayIdx={selectedDayIdx}
          onSelectDay={(idx) => {
            setSelectedDayIdx(idx);
            setActiveTab('dayDetail');
          }}
          formatTemp={formatTemp}
          stationName={station.name}
        />
      )}

      {/* TAB 3: GRAND COMPARATIF MULTI-MODÈLES 14 JOURS (10 MODÈLES) */}
      {activeTab === 'multiModels' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Globe className="h-4 w-4" />
                    Grand Comparatif Multi-Modèles (10 Centres Mondiaux)
                  </span>
                  {isLoadingMultiModel && (
                    <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1 animate-pulse">
                      <RefreshCw className="h-3 w-3 animate-spin" />
                      Interrogation ECMWF / AROME / ICON / GFS / UKMO...
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-black text-white mt-0.5">
                  Matrice Multi-Modèles Haute Précision sur 14 Jours à {station.name}
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Confrontation en direct de 10 modèles météorologiques mondiaux pour cerner précisément les fenêtres de certitude et les biais thermiques relatifs :
                </p>
              </div>

              {/* Metric selector */}
              <div className="flex items-center gap-1.5 rounded-xl bg-slate-950 border border-slate-800 p-1">
                <button
                  onClick={() => setMultiModelMetric('tmax')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    multiModelMetric === 'tmax' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🔥 Maximales (Tx)
                </button>
                <button
                  onClick={() => setMultiModelMetric('tmin')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    multiModelMetric === 'tmin' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ❄️ Minimales (Tn)
                </button>
                <button
                  onClick={() => setMultiModelMetric('precip')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    multiModelMetric === 'precip' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🌧️ Pluie (mm)
                </button>
              </div>
            </div>

            {/* Model Agency Cards Header (10 Models with European & American Ensembles) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-2 mb-4">
              {[
                { name: 'ECMWF IFS', res: '9 km', org: 'Europe', flag: '🇪🇺', desc: 'Référence mondiale CEPMMT' },
                { name: 'ECMWF EPS', res: '51 membres', org: 'Europe', flag: '🇪🇺', desc: 'Ensemble probabiliste' },
                { name: 'AROME', res: '1.3 km', org: 'France', flag: '🇫🇷', desc: 'Ultra-haute résolution' },
                { name: 'ARPEGE', res: '5 km', org: 'France', flag: '🇫🇷', desc: 'Maille fine Météo-France' },
                { name: 'ICON-EU', res: '6.5 km', org: 'Allemagne', flag: '🇩🇪', desc: 'DWD haute résolution' },
                { name: 'ICON Global', res: '13 km', org: 'Allemagne', flag: '🇩🇪', desc: 'Physique globale DWD' },
                { name: 'NOAA GFS', res: '25 km', org: 'USA', flag: '🇺🇸', desc: 'Modèle américain NCEP' },
                { name: 'NOAA GEFS', res: '31 membres', org: 'USA', flag: '🇺🇸', desc: 'Ensemble américain' },
                { name: 'UKMO Unified', res: '10 km', org: 'Royaume-Uni', flag: '🇬🇧', desc: 'Dynamique atlantique' },
                { name: 'CMC GEM', res: '15 km', org: 'Canada', flag: '🇨🇦', desc: 'Flux arctiques & polaires' }
              ].map(m => (
                <div key={m.name} className="rounded-xl border border-slate-800 bg-slate-950/70 p-2.5">
                  <div className="flex items-center gap-1 text-xs font-bold text-white mb-0.5">
                    <span>{m.flag}</span>
                    <span className="truncate">{m.name}</span>
                  </div>
                  <div className="text-[10px] text-blue-400 font-mono">{m.res}</div>
                  <div className="text-[9px] text-slate-400 line-clamp-1 mt-0.5">{m.desc}</div>
                </div>
              ))}
            </div>

            {/* Region Calibration & Exclusion Notice Banner */}
            <div className="rounded-xl bg-blue-950/40 border border-blue-500/30 p-3 mb-5 flex items-start gap-3 text-xs text-slate-300">
              <span className="text-base">🛡️</span>
              <div>
                <strong className="text-blue-300 font-semibold">Exclusion méthodologique des modèles asiatiques (JMA, CMA) hors Asie :</strong>
                <p className="mt-0.5 text-slate-400 leading-relaxed">
                  Conformément aux standards prévisionnels de l'OMM et à votre consigne, les modèles japonais (JMA) et chinois (CMA) sont exclus de la légitimité décisionnelle en Europe, Afrique et Amériques. Ils présentent des biais systématiques sans intégration fine des radiosondages régionaux. Les ensembles occidentaux (ECMWF EPS 51 membres, NOAA GEFS 31 membres) garantissent une fiabilité maximale.
                </p>
              </div>
            </div>

            {/* 14-Day Comparative Matrix Table with 10 Columns and Heat-Coloring */}
            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="py-3 px-3">Date / Échéance</th>
                    <th className="py-3 px-3">Accord</th>
                    <th className="py-3 px-2 text-center text-slate-300">Médiane</th>
                    <th className="py-3 px-2 text-center text-amber-300">Écart</th>
                    <th className="py-3 px-2 text-center text-blue-300" title="ECMWF IFS (9 km)">🇪🇺 ECMWF</th>
                    <th className="py-3 px-2 text-center text-blue-400" title="ECMWF EPS (51 membres)">🇪🇺 EPS 51m</th>
                    <th className="py-3 px-2 text-center text-emerald-300" title="Météo-France AROME (1.3 km)">🇫🇷 AROME</th>
                    <th className="py-3 px-2 text-center text-emerald-400" title="Météo-France ARPEGE (5 km)">🇫🇷 ARPEGE</th>
                    <th className="py-3 px-2 text-center text-cyan-300" title="DWD ICON-EU (6.5 km)">🇩🇪 ICON-EU</th>
                    <th className="py-3 px-2 text-center text-cyan-400" title="DWD ICON Global (13 km)">🇩🇪 ICON</th>
                    <th className="py-3 px-2 text-center text-amber-300" title="NOAA GFS (25 km)">🇺🇸 GFS</th>
                    <th className="py-3 px-2 text-center text-amber-400" title="NOAA GEFS (31 membres)">🇺🇸 GEFS 31m</th>
                    <th className="py-3 px-2 text-center text-rose-300" title="UK Met Office (10 km)">🇬🇧 UKMO</th>
                    <th className="py-3 px-2 text-center text-purple-300" title="CMC GEM (15 km)">🇨🇦 GEM</th>
                    <th className="py-3 px-3">Extrêmes Modélisés</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 bg-slate-900/40">
                  {data.days.map((d) => {
                    const mm = d.multiModelConsensus;
                    if (!mm) return null;

                    const renderCell = (mKey: keyof typeof mm.models) => {
                      const m = mm.models[mKey];
                      if (!m || !m.isAvailable) return <span className="text-slate-600 font-mono">--</span>;

                      let valStr = '';
                      let delta = 0;
                      if (multiModelMetric === 'tmax') {
                        valStr = formatTemp(m.tempMax ?? undefined);
                        if (m.tempMax !== null && mm.tempMaxMedian !== null) {
                          delta = Number((m.tempMax - mm.tempMaxMedian).toFixed(1));
                        }
                      } else if (multiModelMetric === 'tmin') {
                        valStr = formatTemp(m.tempMin ?? undefined);
                        if (m.tempMin !== null && mm.tempMinMedian !== null) {
                          delta = Number((m.tempMin - mm.tempMinMedian).toFixed(1));
                        }
                      } else {
                        return <span className="font-mono text-blue-300">{m.precipitationMm ?? 0}m</span>;
                      }

                      const isWarm = delta >= 0.7;
                      const isCold = delta <= -0.7;

                      return (
                        <span className={`px-1.5 py-0.5 rounded font-mono font-bold ${
                          isWarm 
                            ? 'bg-rose-500/20 text-rose-300' 
                            : isCold 
                            ? 'bg-cyan-500/20 text-cyan-300' 
                            : 'text-slate-200'
                        }`}>
                          {valStr}
                        </span>
                      );
                    };

                    return (
                      <tr 
                        key={d.dayIndex} 
                        onClick={() => {
                          setSelectedDayIdx(d.dayIndex);
                          setActiveTab('dayDetail');
                        }}
                        className="hover:bg-slate-800/60 transition cursor-pointer"
                      >
                        <td className="py-3 px-3 font-bold text-white whitespace-nowrap">
                          {d.dayLabel} <span className="text-slate-500 font-normal">({d.dayIndex === 0 ? "Auj." : `J+${d.dayIndex}`})</span>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            mm.agreementStatus === 'UNANIME'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : mm.agreementStatus === 'BON_ACCORD'
                              ? 'bg-blue-500/20 text-blue-300'
                              : mm.agreementStatus === 'DIVERGENCE_MODEREE'
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-rose-500/20 text-rose-300'
                          }`}>
                            {mm.agreementLabel.split('(')[0].trim()}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center font-mono font-bold text-white">
                          {multiModelMetric === 'tmax' 
                            ? formatTemp(mm.tempMaxMedian) 
                            : multiModelMetric === 'tmin' 
                            ? formatTemp(mm.tempMinMedian) 
                            : `${d.dominantScenario.precipitationMm}m`}
                        </td>
                        <td className="py-3 px-2 text-center font-mono font-bold text-amber-400 whitespace-nowrap">
                          {mm.tempMaxSpread}°C
                        </td>
                        <td className="py-3 px-2 text-center">{renderCell('ecmwf')}</td>
                        <td className="py-3 px-2 text-center">{renderCell('ecmwf_eps')}</td>
                        <td className="py-3 px-2 text-center">{renderCell('arome')}</td>
                        <td className="py-3 px-2 text-center">{renderCell('meteofrance')}</td>
                        <td className="py-3 px-2 text-center">{renderCell('iconEu')}</td>
                        <td className="py-3 px-2 text-center">{renderCell('icon')}</td>
                        <td className="py-3 px-2 text-center">{renderCell('gfs')}</td>
                        <td className="py-3 px-2 text-center">{renderCell('gefs')}</td>
                        <td className="py-3 px-2 text-center">{renderCell('ukmo')}</td>
                        <td className="py-3 px-2 text-center">{renderCell('gem')}</td>
                        <td className="py-3 px-3 text-[11px] whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {mm.warmestModelName && (
                              <span className="text-rose-300 font-semibold" title="Modèle le plus chaud">
                                🔥 {mm.warmestModelName}
                              </span>
                            )}
                            {mm.coldestModelName && (
                              <span className="text-cyan-300 font-semibold" title="Modèle le plus frais">
                                ❄️ {mm.coldestModelName}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Model Bias & Horizon Reliability Diagnostic */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-4 space-y-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                  J+1 à J+4 : Période Déterministe
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  L'accord entre modèles est généralement supérieur à 85%. Les écarts thermiques dépassent rarement 1.5°C. Les prévisions AROME et ECMWF sont privilégiées pour les maximales diurnes.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-4 space-y-2">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                  J+5 à J+8 : Divergence de Calage Frontal
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Les ondulations du jet stream induisent des décalages chronologiques de 6h à 18h sur les fronts pluvieux. Surveiller le comportement du modèle ICON qui affine souvent les creusements secondaires.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-4 space-y-2">
                <span className="text-xs font-bold text-rose-400 uppercase tracking-wider block">
                  J+9 à J+14 : Faisceaux Ensemblistes & Régimes
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  La dispersion multi-modèles s'élargit naturellement (3°C à 7°C d'écart). C'est la moyenne d'ensemble (EPS CEPMMT / GEFS) et les régimes NAO/Scand-Block qui dictent la tendance de fond.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MILESTONES SYNTHESIS (4 PHASES) */}
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
