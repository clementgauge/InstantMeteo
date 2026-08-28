import React, { useState, useEffect } from 'react';
import { 
  Globe2, 
  TrendingUp, 
  Wind, 
  Compass, 
  Calendar, 
  ShieldAlert, 
  Sparkles, 
  ChevronRight, 
  Layers, 
  RefreshCw, 
  Thermometer, 
  CloudRain, 
  Snowflake, 
  Info,
  Waves,
  Zap,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Sun,
  Clock,
  Sliders,
  Radio,
  BarChart3,
  Gauge
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ReferenceLine 
} from 'recharts';
import { LocationPoint, EnsoAndTeleconnectionsObservatoryData } from '../types/weather';
import { generateEnsoAndTeleconnectionsObservatory, EnsoCustomIntensity } from '../services/ensoAndRegimesService';

interface EnsoAndSeasonalRegimesCardProps {
  station: LocationPoint;
  currentTemp?: number;
  currentAnomaly?: number;
  seniorMode?: boolean;
}

export const EnsoAndSeasonalRegimesCard: React.FC<EnsoAndSeasonalRegimesCardProps> = ({
  station,
  currentTemp,
  currentAnomaly,
  seniorMode = false
}) => {
  const [data, setData] = useState<EnsoAndTeleconnectionsObservatoryData | null>(null);
  const [selectedMonthOffset, setSelectedMonthOffset] = useState<number>(1);
  const [selectedRegimeId, setSelectedRegimeId] = useState<string>('SCAND_BLOCK');
  const [activeSubTab, setActiveSubTab] = useState<'enso' | 'daily_tracking' | 'regimes' | 'teleconnections' | 'synthesis6m'>('enso');
  const [selectedDailyMetric, setSelectedDailyMetric] = useState<'nino34' | 'soi' | 'iod' | 'mjo' | 'nao_ao'>('nino34');
  const [forcedIntensity, setForcedIntensity] = useState<EnsoCustomIntensity>('STRONG_EL_NINO');
  const [lastRefreshedTime, setLastRefreshedTime] = useState<string>('');

  const refreshObservatory = (intensity: EnsoCustomIntensity = forcedIntensity) => {
    const res = generateEnsoAndTeleconnectionsObservatory(station, currentTemp, currentAnomaly, intensity);
    setData(res);
    setLastRefreshedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  };

  useEffect(() => {
    refreshObservatory(forcedIntensity);
  }, [station, currentTemp, currentAnomaly, forcedIntensity]);

  if (!data) return null;

  const currentEnso = data.currentEnsoStatus;
  const selectedSynthesis = data.sixMonthSyntheses.find(s => s.monthOffset === selectedMonthOffset) || data.sixMonthSyntheses[0];
  const selectedRegime = data.europeanRegimes.find(r => r.regimeId === selectedRegimeId) || data.europeanRegimes[0];

  return (
    <div id="enso-regimes-observatory" className="space-y-6">
      {/* Hero Header Banner */}
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 p-6 sm:p-8 shadow-2xl backdrop-blur relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-black uppercase tracking-wider mb-2">
              <Globe2 className="h-4 w-4" />
              <span>Observatoire ENSO & Régimes Synoptiques Européens (Court, Moyen & Long Terme jusqu'à 6 Mois)</span>
            </div>
            <h2 className={`font-black text-white ${seniorMode ? 'text-3xl' : 'text-2xl sm:text-3xl'}`}>
              Évolution El Niño / La Niña & Grands Régimes Météo
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Diagnostic dynamique couplé Pacifique-Atlantique pour <strong>{station.name}</strong> ({station.altitude} m) • Réactualisé quotidiennement • Suivi des 4 zones Niño, SOI, IOD, MJO, QBO, NAO, AO & Projections 8 mois.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="text-[10px] text-slate-400 block font-semibold">Mise à jour quotidienne automatique</span>
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 justify-end">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                {lastRefreshedTime || data.dailyParamsUpdateTimestamp || data.generatedAt}
              </span>
            </div>
            <button
              onClick={() => refreshObservatory(forcedIntensity)}
              className="flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 px-3.5 py-2 text-xs font-bold transition shadow"
              title="Forcer la réactualisation"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Actualiser</span>
            </button>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveSubTab('enso')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeSubTab === 'enso'
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
                : 'bg-slate-950/70 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Waves className="h-3.5 w-3.5" />
            <span>1. Diagnostic Océanique Global</span>
          </button>

          <button
            onClick={() => setActiveSubTab('daily_tracking')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeSubTab === 'daily_tracking'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30 ring-1 ring-amber-400'
                : 'bg-slate-950/70 border border-amber-500/30 text-amber-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>📅 2. Suivi Quotidien & Évolution d'El Niño (J-60 à J+180)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('regimes')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeSubTab === 'regimes'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'bg-slate-950/70 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Compass className="h-3.5 w-3.5" />
            <span>3. Régimes Météo Européens (Court, Moyen, 6M)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('teleconnections')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeSubTab === 'teleconnections'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-slate-950/70 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            <span>4. Matrice des Téléconnexions Majeures</span>
          </button>

          <button
            onClick={() => setActiveSubTab('synthesis6m')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeSubTab === 'synthesis6m'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'bg-slate-950/70 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>5. Synthèse Synoptique Semestrielle</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: ENSO REAL-TIME & 6-MONTH EVOLUTION */}
      {activeSubTab === 'enso' && (
        <div className="space-y-6">
          {/* Current Pacific Teleconnection Status Card */}
          <div className="rounded-3xl border border-cyan-500/30 bg-slate-900/90 p-6 shadow-xl backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Diagnostic Océan-Atmosphère Pacifique en Temps Réel</span>
                <h3 className="text-xl font-bold text-white mt-0.5">{currentEnso.phaseLabel}</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  Indice ONI : {currentEnso.oniIndex > 0 ? `+${currentEnso.oniIndex}` : currentEnso.oniIndex} °C
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  SOI : +{currentEnso.soiSouthernOscillationIndex} σ
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
              <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-4">
                <span className="text-[11px] font-bold text-slate-400 block">Indice Océanique Niño 3.4 (ONI)</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-black text-cyan-400">{currentEnso.oniIndex} °C</span>
                  <span className="text-xs font-semibold text-cyan-300">Anomalie SST</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-2">Seuil La Niña : ≤ -0.5°C sur 3 mois consécutifs.</p>
              </div>

              <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-4">
                <span className="text-[11px] font-bold text-slate-400 block">Oscillation Australe (SOI)</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-black text-emerald-400">+{currentEnso.soiSouthernOscillationIndex}</span>
                  <span className="text-xs font-semibold text-emerald-300">Pression Tahiti - Darwin</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-2">Couplage atmosphérique actif favorable à La Niña.</p>
              </div>

              <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-4">
                <span className="text-[11px] font-bold text-slate-400 block">Régime des Vents Alizés</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-lg font-black text-blue-400">{currentEnso.tradeWindsStrength}</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-2">Upwelling d'eaux profondes froides le long de l'Équateur.</p>
              </div>

              <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-4">
                <span className="text-[11px] font-bold text-slate-400 block">Années Analogues Historiques</span>
                <div className="space-y-1 mt-1">
                  {currentEnso.historicalAnalogs.slice(0, 2).map((a, i) => (
                    <span key={i} className="text-xs font-semibold text-amber-300 block">• {a}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-cyan-950/30 border border-cyan-800/40 p-4 text-xs text-cyan-100 leading-relaxed">
              <p className="font-semibold">{currentEnso.diagnosticSummary}</p>
            </div>
          </div>

          {/* 6-Month Trajectory Table & Probability Bars */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl backdrop-blur">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-blue-400" />
              <h3 className="text-lg font-bold text-white">Trajectoire & Probabilités ENSO à Échéance 6 Mois (M+1 à M+6)</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.sixMonthEnsoProjections.map((proj) => (
                <div 
                  key={proj.monthIndex} 
                  className={`rounded-2xl border p-4 transition ${
                    proj.phase === 'LA_NINA'
                      ? 'bg-slate-950/90 border-cyan-500/30 hover:border-cyan-500/60'
                      : 'bg-slate-950/90 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-800">
                    <span className="text-sm font-black text-white">Mois M+{proj.monthIndex} : {proj.monthName}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                      proj.phase === 'LA_NINA' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {proj.oniSstAnomalyC > 0 ? `+${proj.oniSstAnomalyC}` : proj.oniSstAnomalyC}°C
                    </span>
                  </div>

                  <div className="text-xs font-bold text-cyan-300 mb-2">{proj.phaseLabel}</div>

                  {/* Probabilities Triple Bar */}
                  <div className="space-y-1.5 mb-3">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-cyan-400 font-semibold">La Niña</span>
                      <span className="font-bold text-white">{proj.probLaNina}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden flex">
                      <div style={{ width: `${proj.probLaNina}%` }} className="bg-cyan-400 h-full"></div>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-semibold">Neutre</span>
                      <span className="font-bold text-white">{proj.probNeutral}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden flex">
                      <div style={{ width: `${proj.probNeutral}%` }} className="bg-slate-400 h-full"></div>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-amber-400 font-semibold">El Niño</span>
                      <span className="font-bold text-white">{proj.probElNino}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden flex">
                      <div style={{ width: `${proj.probElNino}%` }} className="bg-amber-400 h-full"></div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-300 space-y-1">
                    <p><strong className="text-blue-300">Impact Jet-Stream :</strong> {proj.jetStreamPosition}</p>
                    <p><strong className="text-emerald-300">Effet France/Europe :</strong> {proj.teleconnectionEuropeEffect}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: DAILY ENSO & TELECONNECTIONS TRACKING (J-60 to J+180) */}
      {activeSubTab === 'daily_tracking' && (
        <div className="space-y-6">
          {/* Header & Simulator Control */}
          <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-br from-slate-900 via-amber-950/20 to-slate-900 p-6 shadow-xl backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
                  <Radio className="h-4 w-4 animate-pulse text-amber-400" />
                  <span>Surveillance Quotidienne Continue & Évolution Multi-Paramètres</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  Évolution Journalière des Indices Pacifique & Téléconnexions Mondiales
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  Mise à jour quotidienne automatique des anomalies de température océanique (SST), pression atmosphérique tropicale (SOI) et forçages planétaires.
                </p>
              </div>

              {/* Real-time Scenario Simulator Toggle */}
              <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3">
                <span className="text-[11px] font-bold text-slate-400 block mb-2">Simulateur d'Intensité ENSO :</span>
                <div className="flex flex-wrap gap-1.5">
                  {(['SUPER_EL_NINO', 'STRONG_EL_NINO', 'MODERATE_EL_NINO', 'NEUTRAL', 'LA_NINA'] as EnsoCustomIntensity[]).map((mode) => {
                    const isCur = forcedIntensity === mode;
                    const label = mode === 'SUPER_EL_NINO' ? 'Super El Niño (+2.4°)' :
                                  mode === 'STRONG_EL_NINO' ? 'Fort El Niño (+1.95°)' :
                                  mode === 'MODERATE_EL_NINO' ? 'El Niño Modéré (+1.2°)' :
                                  mode === 'NEUTRAL' ? 'Neutre (+0.15°)' : 'La Niña (-0.85°)';
                    return (
                      <button
                        key={mode}
                        onClick={() => {
                          setForcedIntensity(mode);
                          refreshObservatory(mode);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                          isCur
                            ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                            : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Real-time 4-Region Niño Live Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-800">
              {Object.entries(data.ninoRegionsSummary).map(([key, reg]) => (
                <div key={key} className="rounded-2xl bg-slate-950/80 border border-slate-800 p-4">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-400">{reg.label.split('(')[0]}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      {reg.trend7d}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 my-1">
                    <span className="text-2xl font-black text-white font-mono">
                      {reg.current > 0 ? `+${reg.current}` : reg.current}°C
                    </span>
                    <span className="text-[11px] text-slate-400 font-semibold">anomalie SST</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-tight mt-1 font-medium">{reg.status}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Daily Time Series Chart (J-60 à J+180) */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Courbes d'Évolution Quotidienne (240 Jours)</span>
                <h4 className="text-lg font-bold text-white mt-0.5">Chronologie Journalière : Passé Observé & Projections Futures</h4>
              </div>

              {/* Metric Selector Tabs */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedDailyMetric('nino34')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    selectedDailyMetric === 'nino34' ? 'bg-amber-600 text-white shadow' : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  🌡️ Niño 3.4 & 1+2 (°C)
                </button>
                <button
                  onClick={() => setSelectedDailyMetric('soi')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    selectedDailyMetric === 'soi' ? 'bg-blue-600 text-white shadow' : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  ⚖️ Indice SOI (Tahiti-Darwin)
                </button>
                <button
                  onClick={() => setSelectedDailyMetric('iod')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    selectedDailyMetric === 'iod' ? 'bg-emerald-600 text-white shadow' : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  🌊 Dipôle Indien (IOD)
                </button>
                <button
                  onClick={() => setSelectedDailyMetric('mjo')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    selectedDailyMetric === 'mjo' ? 'bg-purple-600 text-white shadow' : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  🌀 MJO (Phase & Amplitude)
                </button>
                <button
                  onClick={() => setSelectedDailyMetric('nao_ao')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    selectedDailyMetric === 'nao_ao' ? 'bg-cyan-600 text-white shadow' : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  🇪🇺 Indices NAO & AO
                </button>
              </div>
            </div>

            {/* Recharts Daily Time Series */}
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                {selectedDailyMetric === 'nino34' ? (
                  <AreaChart data={data.dailyEnsoHistoryAndProjections} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorNino34" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.5}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="dateFormatted" stroke="#94a3b8" fontSize={10} interval={30} />
                    <YAxis stroke="#94a3b8" fontSize={11} domain={[-2.0, 3.0]} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                      formatter={(val: any, name: string) => [
                        `${val}°C`, 
                        name === 'nino34AnomalyC' ? 'Anomalie Niño 3.4 (ONI)' : 'Anomalie Niño 1+2 (Côtes)'
                      ]}
                      labelFormatter={(label, payload) => {
                        const pt = payload?.[0]?.payload;
                        return `${pt?.dateFormatted || label} (${pt?.isForecast ? 'Projection Future' : 'Observation Réelle'})`;
                      }}
                    />
                    <ReferenceLine y={0.5} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Seuil El Niño (+0.5°C)', fill: '#f59e0b', fontSize: 10 }} />
                    <ReferenceLine y={-0.5} stroke="#38bdf8" strokeDasharray="3 3" label={{ value: 'Seuil La Niña (-0.5°C)', fill: '#38bdf8', fontSize: 10 }} />
                    <ReferenceLine x={data.dailyEnsoHistoryAndProjections.find(p => p.dayOffset === 0)?.dateFormatted} stroke="#10b981" strokeWidth={2} label={{ value: "Aujourd'hui", fill: '#10b981', fontSize: 11 }} />
                    <Legend wrapperStyle={{ paddingTop: '8px' }} />
                    <Area type="monotone" name="nino34AnomalyC" dataKey="nino34AnomalyC" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorNino34)" />
                    <Line type="monotone" name="nino12AnomalyC" dataKey="nino12AnomalyC" stroke="#ef4444" strokeWidth={2} dot={false} />
                  </AreaChart>
                ) : selectedDailyMetric === 'soi' ? (
                  <LineChart data={data.dailyEnsoHistoryAndProjections} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="dateFormatted" stroke="#94a3b8" fontSize={10} interval={30} />
                    <YAxis stroke="#94a3b8" fontSize={11} domain={[-25, 25]} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                      formatter={(val: any) => [`${val} σ`, 'Indice d\'Oscillation Australe (SOI)']}
                    />
                    <ReferenceLine y={-7} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Seuil Couplage El Niño (-7 σ)', fill: '#ef4444', fontSize: 10 }} />
                    <ReferenceLine y={+7} stroke="#38bdf8" strokeDasharray="3 3" label={{ value: 'Seuil La Niña (+7 σ)', fill: '#38bdf8', fontSize: 10 }} />
                    <ReferenceLine x={data.dailyEnsoHistoryAndProjections.find(p => p.dayOffset === 0)?.dateFormatted} stroke="#10b981" strokeWidth={2} />
                    <Line type="monotone" dataKey="soiIndex" stroke="#3b82f6" strokeWidth={2.5} dot={false} />
                  </LineChart>
                ) : selectedDailyMetric === 'iod' ? (
                  <LineChart data={data.dailyEnsoHistoryAndProjections} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="dateFormatted" stroke="#94a3b8" fontSize={10} interval={30} />
                    <YAxis stroke="#94a3b8" fontSize={11} domain={[-1.0, 1.5]} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                      formatter={(val: any) => [`${val}°C`, 'Dipôle de l\'Océan Indien (DMI)']}
                    />
                    <ReferenceLine y={+0.4} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Phase Positive IOD (+0.4°C)', fill: '#10b981', fontSize: 10 }} />
                    <ReferenceLine x={data.dailyEnsoHistoryAndProjections.find(p => p.dayOffset === 0)?.dateFormatted} stroke="#10b981" strokeWidth={2} />
                    <Line type="monotone" dataKey="iodDipoleIndexC" stroke="#10b981" strokeWidth={3} dot={false} />
                  </LineChart>
                ) : selectedDailyMetric === 'mjo' ? (
                  <LineChart data={data.dailyEnsoHistoryAndProjections} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="dateFormatted" stroke="#94a3b8" fontSize={10} interval={30} />
                    <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 9]} ticks={[1, 2, 3, 4, 5, 6, 7, 8]} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                      formatter={(val: any, name: string) => [
                        name === 'mjoPhase' ? `Phase ${val}` : `${val} (RMM)`, 
                        name === 'mjoPhase' ? 'Phase Convective MJO' : 'Amplitude'
                      ]}
                    />
                    <ReferenceLine x={data.dailyEnsoHistoryAndProjections.find(p => p.dayOffset === 0)?.dateFormatted} stroke="#10b981" strokeWidth={2} />
                    <Line type="stepAfter" name="mjoPhase" dataKey="mjoPhase" stroke="#a855f7" strokeWidth={2.5} />
                  </LineChart>
                ) : (
                  <LineChart data={data.dailyEnsoHistoryAndProjections} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="dateFormatted" stroke="#94a3b8" fontSize={10} interval={30} />
                    <YAxis stroke="#94a3b8" fontSize={11} domain={[-2.5, 2.5]} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                      formatter={(val: any, name: string) => [`${val} σ`, name === 'naoIndex' ? 'Oscillation Nord-Atlantique (NAO)' : 'Oscillation Arctique (AO)']}
                    />
                    <ReferenceLine y={0} stroke="#64748b" />
                    <ReferenceLine x={data.dailyEnsoHistoryAndProjections.find(p => p.dayOffset === 0)?.dateFormatted} stroke="#10b981" strokeWidth={2} />
                    <Legend wrapperStyle={{ paddingTop: '8px' }} />
                    <Line type="monotone" name="naoIndex" dataKey="naoIndex" stroke="#06b6d4" strokeWidth={2.5} dot={false} />
                    <Line type="monotone" name="aoIndex" dataKey="aoIndex" stroke="#3b82f6" strokeWidth={2} dot={false} strokeDasharray="4 4" />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Daily Coupled Teleconnections Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400">Oscillation Australe (SOI)</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300">
                  {data.dailyTeleconnectionMetrics.soiDaily.value} σ
                </span>
              </div>
              <p className="text-xs text-white font-bold mb-1">{data.dailyTeleconnectionMetrics.soiDaily.label}</p>
              <p className="text-[11px] text-slate-400 leading-tight">{data.dailyTeleconnectionMetrics.soiDaily.trend}</p>
            </div>

            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400">Dipôle Indien (IOD)</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                  +{data.dailyTeleconnectionMetrics.iodDaily.value}°C
                </span>
              </div>
              <p className="text-xs text-white font-bold mb-1">{data.dailyTeleconnectionMetrics.iodDaily.label}</p>
              <p className="text-[11px] text-slate-400 leading-tight">{data.dailyTeleconnectionMetrics.iodDaily.trend}</p>
            </div>

            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400">Oscillation Madden-Julian (MJO)</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300">
                  Phase {data.dailyTeleconnectionMetrics.mjoDaily.phase} (Amp: {data.dailyTeleconnectionMetrics.mjoDaily.amplitude})
                </span>
              </div>
              <p className="text-xs text-white font-bold mb-1">{data.dailyTeleconnectionMetrics.mjoDaily.convectiveCenter}</p>
              <p className="text-[11px] text-slate-400 leading-tight">{data.dailyTeleconnectionMetrics.mjoDaily.trajectory}</p>
            </div>

            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400">Oscillation Nord-Atlantique (NAO)</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300">
                  {data.dailyTeleconnectionMetrics.naoDaily.value > 0 ? `+${data.dailyTeleconnectionMetrics.naoDaily.value}` : data.dailyTeleconnectionMetrics.naoDaily.value} σ
                </span>
              </div>
              <p className="text-xs text-white font-bold mb-1">{data.dailyTeleconnectionMetrics.naoDaily.label}</p>
              <p className="text-[11px] text-slate-400 leading-tight">{data.dailyTeleconnectionMetrics.naoDaily.spread}</p>
            </div>

            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400">Oscillation Arctique (AO)</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300">
                  {data.dailyTeleconnectionMetrics.aoDaily.value > 0 ? `+${data.dailyTeleconnectionMetrics.aoDaily.value}` : data.dailyTeleconnectionMetrics.aoDaily.value} σ
                </span>
              </div>
              <p className="text-xs text-white font-bold mb-1">{data.dailyTeleconnectionMetrics.aoDaily.label}</p>
              <p className="text-[11px] text-slate-400 leading-tight">{data.dailyTeleconnectionMetrics.aoDaily.vortexCoupling}</p>
            </div>

            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400">QBO Stratosphérique (30 & 50 hPa)</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300">
                  +{data.dailyTeleconnectionMetrics.qboDaily.wind30hpa} m/s
                </span>
              </div>
              <p className="text-xs text-white font-bold mb-1">{data.dailyTeleconnectionMetrics.qboDaily.phase}</p>
              <p className="text-[11px] text-slate-400 leading-tight">Vents d'Ouest à 50 hPa : +{data.dailyTeleconnectionMetrics.qboDaily.wind50hpa} m/s</p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: 5 EUROPEAN WEATHER REGIMES EXPLORER */}
      {activeSubTab === 'regimes' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl backdrop-blur">
            <div className="mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Classification Synoptique Multiscalaire (Court, Moyen & Long Terme)</span>
              <h3 className="text-xl font-bold text-white mt-0.5">Les 5 Grands Régimes Météorologiques Européens</h3>
              <p className="text-xs text-slate-300 mt-1">Sélectionnez un régime pour inspecter son mécanisme physique et son impact attendu sur la France :</p>
            </div>

            {/* Regime Selector Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
              {data.europeanRegimes.map((reg) => {
                const isSel = reg.regimeId === selectedRegimeId;
                return (
                  <button
                    key={reg.regimeId}
                    onClick={() => setSelectedRegimeId(reg.regimeId)}
                    className={`rounded-2xl border p-4 text-left transition flex flex-col justify-between ${
                      isSel
                        ? 'bg-blue-600/20 border-blue-500 shadow-lg shadow-blue-500/20 ring-1 ring-blue-400'
                        : 'bg-slate-950/70 border-slate-800 hover:bg-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xl">{reg.icon}</span>
                        <span className="px-2 py-0.5 rounded text-[11px] font-black bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          {reg.currentProbabilityPct}%
                        </span>
                      </div>
                      <h4 className="font-bold text-white text-xs leading-snug">{reg.shortName}</h4>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-2 block">Cliquez pour le détail</span>
                  </button>
                );
              })}
            </div>

            {/* Selected Regime Deep Detail View */}
            <div className="rounded-2xl border border-blue-500/30 bg-slate-950/90 p-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{selectedRegime.icon}</span>
                  <div>
                    <h4 className="text-lg font-black text-white">{selectedRegime.name}</h4>
                    <span className="text-xs text-blue-400 font-semibold">{selectedRegime.typicalSeasonality}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Probabilité d'occurrence actuelle :</span>
                  <span className="text-lg font-black text-blue-400 px-3 py-1 rounded-xl bg-blue-500/20 border border-blue-500/40">
                    {selectedRegime.currentProbabilityPct} %
                  </span>
                </div>
              </div>

              {/* Time Scales Grid: Short, Medium, Long-Term (6 Months) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 mb-1">
                    <Clock className="h-4 w-4" />
                    <span>Court Terme (1 à 7 Jours)</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-semibold">{selectedRegime.shortTermTrend}</p>
                </div>

                <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-1">
                    <Calendar className="h-4 w-4" />
                    <span>Moyen Terme (1 à 4 Semaines)</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-semibold">{selectedRegime.mediumTermTrend}</p>
                </div>

                <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 mb-1">
                    <Globe2 className="h-4 w-4" />
                    <span>Long Terme (1 à 6 Mois)</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-semibold">{selectedRegime.longTermTrend6M}</p>
                </div>
              </div>

              {/* Physical mechanism & Impacts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Mécanisme Physique Aérologique</span>
                  <p className="text-xs text-slate-300 leading-relaxed">{selectedRegime.synopticMechanism}</p>
                </div>

                <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 space-y-3">
                  <div>
                    <span className="text-[11px] font-bold text-amber-300 block flex items-center gap-1">
                      <Thermometer className="h-3.5 w-3.5" /> Impact Températures France :
                    </span>
                    <p className="text-xs text-slate-200 mt-0.5">{selectedRegime.impactFranceTemperature}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-800">
                    <span className="text-[11px] font-bold text-blue-300 block flex items-center gap-1">
                      <CloudRain className="h-3.5 w-3.5" /> Impact Précipitations & Neige France :
                    </span>
                    <p className="text-xs text-slate-200 mt-0.5">{selectedRegime.impactFrancePrecipitation}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: MAJOR TELECONNECTIONS MATRIX */}
      {activeSubTab === 'teleconnections' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl backdrop-blur">
            <div className="mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Moteurs Téléconnectifs Globaux</span>
              <h3 className="text-xl font-bold text-white mt-0.5">Matrice des 6 Indices Climatologiques Majeurs</h3>
              <p className="text-xs text-slate-300 mt-1">Surveillance des oscillations atmosphériques et stratosphériques guidant le temps en France :</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.majorTeleconnections.map((item) => (
                <div key={item.code} className="rounded-2xl bg-slate-950/80 border border-slate-800 p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-800">
                      <span className="text-xs font-black text-purple-400">{item.code}</span>
                      <span className="text-xs font-bold text-white">{item.phaseLabel}</span>
                    </div>

                    <h4 className="font-bold text-white text-sm mb-1">{item.name}</h4>
                    <div className="text-xs font-black text-cyan-300 mb-3">{item.currentValueFormatted}</div>

                    <p className="text-xs text-slate-300 leading-relaxed mb-3">
                      {item.trendDescription}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 space-y-1.5 text-[11px]">
                    <div className="rounded bg-slate-900 p-2 border border-slate-800">
                      <span className="font-bold text-emerald-300 block">Perspective 6 Mois :</span>
                      <span className="text-slate-300">{item.sixMonthProjection}</span>
                    </div>
                    <div className="rounded bg-slate-900 p-2 border border-slate-800">
                      <span className="font-bold text-blue-300 block">Impact direct France :</span>
                      <span className="text-slate-300">{item.impactFranceSummary}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: 6-MONTH SYNOPTIC SYNTHESIS (M+1 to M+6) */}
      {activeSubTab === 'synthesis6m' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Modélisation Saisonnière Multi-Systèmes (ECMWF, UKMO, Météo-France)</span>
                <h3 className="text-xl font-bold text-white mt-0.5">Synthèse Synoptique Mois par Mois (M+1 à M+6)</h3>
                <p className="text-xs text-slate-300 mt-1">Scénarios météorologiques détaillés pour {station.name} ({station.altitude} m) :</p>
              </div>

              {/* Month Selector Buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {data.sixMonthSyntheses.map((s) => (
                  <button
                    key={s.monthOffset}
                    onClick={() => setSelectedMonthOffset(s.monthOffset)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                      selectedMonthOffset === s.monthOffset
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                        : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    M+{s.monthOffset} : {s.monthName.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Month Detailed Card */}
            <div className="rounded-2xl border border-emerald-500/30 bg-slate-950/90 p-6 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    {selectedSynthesis.season} • Échéance M+{selectedSynthesis.monthOffset}
                  </span>
                  <h4 className="text-2xl font-black text-white mt-0.5">{selectedSynthesis.monthName}</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Régime dominant projeté : <strong className="text-blue-300">{selectedSynthesis.dominantRegime}</strong>
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="rounded-2xl bg-slate-900 border border-slate-800 px-4 py-2 text-center">
                    <span className="text-[10px] text-slate-400 block font-semibold">Anomalie T°C</span>
                    <span className={`text-lg font-black ${
                      selectedSynthesis.tempAnomalyForecastC > 0 ? 'text-rose-400' : 'text-cyan-400'
                    }`}>
                      {selectedSynthesis.tempAnomalyForecastC > 0 ? `+${selectedSynthesis.tempAnomalyForecastC}` : selectedSynthesis.tempAnomalyForecastC}°C
                    </span>
                  </div>

                  <div className="rounded-2xl bg-slate-900 border border-slate-800 px-4 py-2 text-center">
                    <span className="text-[10px] text-slate-400 block font-semibold">Précipitations</span>
                    <span className={`text-lg font-black ${
                      selectedSynthesis.precipAnomalyForecastPct > 0 ? 'text-blue-400' : 'text-amber-400'
                    }`}>
                      {selectedSynthesis.precipAnomalyForecastPct > 0 ? `+${selectedSynthesis.precipAnomalyForecastPct}` : selectedSynthesis.precipAnomalyForecastPct}%
                    </span>
                  </div>

                  <div className="rounded-2xl bg-slate-900 border border-slate-800 px-4 py-2 text-center">
                    <span className="text-[10px] text-slate-400 block font-semibold">Indice de Confiance</span>
                    <span className="text-lg font-black text-emerald-400">{selectedSynthesis.confidenceScorePct}%</span>
                  </div>
                </div>
              </div>

              {/* Scenario Description */}
              <div className="space-y-4">
                <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block mb-1">
                    Scénario Météorologique & Synoptique Global
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed font-medium">
                    {selectedSynthesis.synopticScenario}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                    Impact Hydrologique, Agricole & Montagne ({station.name} - {station.altitude} m)
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed font-medium">
                    {selectedSynthesis.agriculturalAndHydricOutlook}
                  </p>
                </div>
              </div>
            </div>

            {/* Complete 6-Month Comparison Matrix Grid */}
            <div className="mt-6 pt-6 border-t border-slate-800">
              <h4 className="text-sm font-bold text-slate-300 mb-3">Vue d'ensemble du semestre à venir :</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {data.sixMonthSyntheses.map((s) => {
                  const isCurrentSel = s.monthOffset === selectedMonthOffset;
                  return (
                    <button
                      key={s.monthOffset}
                      onClick={() => setSelectedMonthOffset(s.monthOffset)}
                      className={`rounded-xl border p-3 text-left transition ${
                        isCurrentSel
                          ? 'bg-emerald-600/20 border-emerald-500 shadow-md ring-1 ring-emerald-400'
                          : 'bg-slate-950 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      <span className="text-[10px] text-slate-400 font-semibold block">M+{s.monthOffset}</span>
                      <span className="text-xs font-bold text-white block truncate">{s.monthName.split(' ')[0]}</span>
                      <div className="flex items-center justify-between mt-2 text-[11px] font-bold">
                        <span className={s.tempAnomalyForecastC > 0 ? 'text-rose-400' : 'text-cyan-400'}>
                          {s.tempAnomalyForecastC > 0 ? `+${s.tempAnomalyForecastC}` : s.tempAnomalyForecastC}°
                        </span>
                        <span className={s.precipAnomalyForecastPct > 0 ? 'text-blue-400' : 'text-amber-400'}>
                          {s.precipAnomalyForecastPct > 0 ? `+${s.precipAnomalyForecastPct}` : s.precipAnomalyForecastPct}%
                        </span>
                      </div>
                    </button>
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
