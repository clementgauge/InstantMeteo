import React, { useState } from 'react';
import { 
  SeasonalFourMonthTrends, 
  FortnightProjection, 
  LocationPoint, 
  CurrentWeather, 
  ClimateAnomaly 
} from '../types/weather';
import { generateFourMonthSeasonalTrends } from '../services/seasonalProjectionService';
import { 
  Calendar, 
  Sparkles, 
  TrendingUp, 
  Droplets, 
  Sun, 
  ShieldAlert, 
  Layers, 
  Activity, 
  ChevronRight, 
  Info, 
  Flame, 
  ThermometerSnowflake, 
  CloudRain, 
  RefreshCw,
  Sliders,
  CheckCircle2,
  Mountain,
  Compass
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
  Area,
  ReferenceLine 
} from 'recharts';

interface SeasonalFourMonthTrendsCardProps {
  station: LocationPoint;
  weather: CurrentWeather;
  anomaly: ClimateAnomaly;
  seniorMode: boolean;
  tempUnit?: 'C' | 'F';
}

export const SeasonalFourMonthTrendsCard: React.FC<SeasonalFourMonthTrendsCardProps> = ({
  station,
  weather,
  anomaly,
  seniorMode,
  tempUnit = 'C'
}) => {
  const [scenario, setScenario] = useState<'MEDIAN' | 'WARM_DRY' | 'COOL_WET'>('MEDIAN');
  const [selectedFortnightIndex, setSelectedFortnightIndex] = useState<number>(0);

  const fourMonthData: SeasonalFourMonthTrends = generateFourMonthSeasonalTrends(
    station,
    weather.temperature,
    anomaly.tempAnomaly
  );

  const formatTemp = (celsius: number) => {
    if (tempUnit === 'F') {
      return `${Math.round((celsius * 9/5 + 32) * 10) / 10}°F`;
    }
    return `${celsius}°C`;
  };

  const getAnomalyColor = (val: number) => {
    if (val >= 1.5) return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
    if (val > 0) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    if (val <= -1.5) return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
    return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
  };

  // Adjust data according to selected scenario
  const displayedFortnights = fourMonthData.fortnights.map((f) => {
    let tempDelta = f.tempAnomalyVsNormal;
    let precipDelta = f.precipAnomalyPct;
    if (scenario === 'WARM_DRY') {
      tempDelta = Number((tempDelta + 0.9).toFixed(1));
      precipDelta = Math.max(-50, precipDelta - 18);
    } else if (scenario === 'COOL_WET') {
      tempDelta = Number((tempDelta - 0.9).toFixed(1));
      precipDelta = Math.min(60, precipDelta + 22);
    }
    const expectedT = Number((f.expectedTMean + (tempDelta - f.tempAnomalyVsNormal)).toFixed(1));
    return {
      ...f,
      tempAnomalyVsNormal: tempDelta,
      expectedTMean: expectedT,
      precipAnomalyPct: precipDelta
    };
  });

  const selectedFortnight: FortnightProjection = displayedFortnights[selectedFortnightIndex] || displayedFortnights[0];

  // Chart data
  const chartData = displayedFortnights.map((f) => ({
    name: `Q${f.fortnightNumber}`,
    fullLabel: f.fortnightTitle,
    tempAnomaly: f.tempAnomalyVsNormal,
    tempMean: f.expectedTMean,
    precipAnomaly: f.precipAnomalyPct,
    confidence: f.confidenceScore,
    soilMoisture: f.groundMoistureForecast
  }));

  return (
    <div id="seasonal-four-month-trends-card" className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 p-6 shadow-2xl backdrop-blur space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-indigo-600/20 p-3 text-indigo-400 border border-indigo-500/30">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400">
              <span>Projections Saisonnières par Quinzaine • 4 Mois (120 Jours)</span>
              <span>•</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <RefreshCw className="h-3 w-3" /> Réactualisation Quotidienne
              </span>
            </div>
            <h3 className={`font-black text-white ${seniorMode ? 'text-3xl' : 'text-2xl'}`}>
              Tendances Saisonnières à 4 Mois pour {station.name}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Ensemble multi-systèmes Copernicus C3S (ECMWF SEAS5, NCEP CFSv2, Météo-France System 8)
            </p>
          </div>
        </div>

        {/* Ensemble Scenario Switcher */}
        <div className="flex items-center gap-1 rounded-2xl bg-slate-950/90 p-1.5 border border-slate-800 shadow-inner">
          <button
            onClick={() => setScenario('MEDIAN')}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
              scenario === 'MEDIAN' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            Scénario Médian
          </button>
          <button
            onClick={() => setScenario('WARM_DRY')}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
              scenario === 'WARM_DRY' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            Chaud & Sec (+0.9°)
          </button>
          <button
            onClick={() => setScenario('COOL_WET')}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
              scenario === 'COOL_WET' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            Frais & Humide (-0.9°)
          </button>
        </div>
      </div>

      {/* Synthesis Banner */}
      <div className="rounded-2xl border border-indigo-500/30 bg-indigo-950/30 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-indigo-500/20 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
              Synthèse Climatologique des 4 Prochains Mois :
            </span>
          </div>
          <span className="rounded-lg bg-indigo-500/20 px-2.5 py-1 text-xs font-extrabold text-indigo-200 border border-indigo-400/30">
            Initialisation : {fourMonthData.lastDailyRunTimestamp}
          </span>
        </div>
        <p className={`text-slate-200 leading-relaxed ${seniorMode ? 'text-lg' : 'text-sm'}`}>
          {fourMonthData.fourMonthSynthesis}
        </p>
      </div>

      {/* Fortnight Grid (8 Quinzaines) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Découpage par Quinzaine (Cliquez sur une quinzaine pour le diagnostic détaillé)
          </h4>
          <span className="text-[11px] text-slate-500">8 Quinzaines (120 jours)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {displayedFortnights.map((f, idx) => {
            const isSelected = selectedFortnightIndex === idx;
            const anomalyClass = getAnomalyColor(f.tempAnomalyVsNormal);
            return (
              <button
                key={f.fortnightNumber}
                onClick={() => setSelectedFortnightIndex(idx)}
                className={`rounded-2xl border p-3.5 text-left transition relative flex flex-col justify-between ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-950/50 shadow-xl ring-2 ring-indigo-500/30'
                    : 'border-slate-800 bg-slate-950/80 hover:border-slate-700 hover:bg-slate-900/80'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-white">Q{f.fortnightNumber} • {f.monthName}</span>
                    <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-300">
                      Conf. {f.confidenceScore}%
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mb-2">{f.dateRangeFormatted}</div>

                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-lg font-black text-white">{formatTemp(f.expectedTMean)}</span>
                      <span className="text-[10px] text-slate-400 block">{f.tempAnomalyStatus}</span>
                    </div>
                    <span className={`rounded-lg border px-2 py-0.5 text-xs font-black ${anomalyClass}`}>
                      {f.tempAnomalyVsNormal > 0 ? `+${f.tempAnomalyVsNormal}` : f.tempAnomalyVsNormal}°C
                    </span>
                  </div>
                </div>

                <div className="mt-3 border-t border-slate-800/80 pt-2 text-[11px] space-y-1">
                  <div className="flex justify-between text-slate-300">
                    <span>Précipitations :</span>
                    <span className={`font-bold ${f.precipAnomalyPct >= 0 ? 'text-cyan-400' : 'text-amber-400'}`}>
                      {f.precipAnomalyPct > 0 ? `+${f.precipAnomalyPct}` : f.precipAnomalyPct}%
                    </span>
                  </div>
                  <div className="text-[10px] text-indigo-300 font-medium truncate">
                    Régime : {f.dominantSynopticRegime}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* In-depth Details of Selected Fortnight */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/90 p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              Analyse Approfondie de la Quinzaine
            </span>
            <h4 className="text-xl font-bold text-white">
              {selectedFortnight.fortnightTitle} ({selectedFortnight.dateRangeFormatted})
            </h4>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Régime synoptique :</span>
            <span className="rounded-lg bg-indigo-600/20 border border-indigo-500/30 px-3 py-1 text-xs font-bold text-indigo-200">
              {selectedFortnight.dominantSynopticRegime}
            </span>
          </div>
        </div>

        {/* 3 Metric Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Column 1: Thermique */}
          <div className="rounded-xl bg-slate-900/80 p-4 border border-slate-800 space-y-2 text-xs">
            <div className="font-bold text-slate-200 flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-rose-400" />
              Bilan Thermique Quinzaine
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-1 text-slate-300">
              <span>Moyenne projetée :</span>
              <span className="font-bold text-white">{formatTemp(selectedFortnight.expectedTMean)}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-1 text-slate-300">
              <span>Qualification :</span>
              <span className="font-bold text-slate-300">{selectedFortnight.tempAnomalyStatus}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Écart climatique :</span>
              <span className={`font-bold ${selectedFortnight.tempAnomalyVsNormal > 0 ? 'text-rose-400' : 'text-cyan-400'}`}>
                {selectedFortnight.tempAnomalyVsNormal > 0 ? `+${selectedFortnight.tempAnomalyVsNormal}` : selectedFortnight.tempAnomalyVsNormal}°C
              </span>
            </div>
          </div>

          {/* Column 2: Hydrométéorologie & Nappes */}
          <div className="rounded-xl bg-slate-900/80 p-4 border border-slate-800 space-y-2 text-xs">
            <div className="font-bold text-slate-200 flex items-center gap-1.5">
              <Droplets className="h-4 w-4 text-cyan-400" />
              Hydrologie & Humidité des Sols
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-1 text-slate-300">
              <span>Cumul précipitations :</span>
              <span className="font-bold text-cyan-300">{selectedFortnight.expectedPrecipMm} mm (Normale {selectedFortnight.normalPrecipMm} mm)</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-1 text-slate-300">
              <span>Indice humidité sol :</span>
              <span className="font-bold text-emerald-300">{selectedFortnight.groundMoistureForecast} %</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Niveau nappes phréatiques :</span>
              <span className="font-bold text-blue-300">{selectedFortnight.waterTableImpact}</span>
            </div>
          </div>

          {/* Column 3: Vigilances Saisonnières */}
          <div className="rounded-xl bg-slate-900/80 p-4 border border-slate-800 space-y-2 text-xs">
            <div className="font-bold text-slate-200 flex items-center gap-1.5">
              <ShieldAlert className="h-4 w-4 text-amber-400" />
              Risques Climatologiques Majeurs
            </div>
            <div className="space-y-1 text-slate-300">
              <div className="flex justify-between">
                <span>🔥 Risque canicule :</span>
                <span className="font-bold text-amber-300">{selectedFortnight.heatwaveRisk}</span>
              </div>
              <div className="flex justify-between">
                <span>🌾 Sécheresse des sols :</span>
                <span className="font-bold text-amber-300">{selectedFortnight.droughtRisk}</span>
              </div>
              <div className="flex justify-between">
                <span>❄️ Risque gel tardif :</span>
                <span className="font-bold text-cyan-300">{selectedFortnight.earlyFrostRisk}</span>
              </div>
              <div className="flex justify-between">
                <span>🌊 Inondation cévenole :</span>
                <span className="font-bold text-blue-300">{selectedFortnight.mediterraneanFloodRisk}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Agricultural & Practical Guidance */}
        <div className="rounded-xl bg-slate-900/60 p-4 border border-slate-800/80 text-xs text-slate-300 space-y-2">
          <div className="font-bold text-indigo-300 flex items-center gap-1.5">
            <Activity className="h-4 w-4 text-indigo-400" />
            Impacts pour l'Agriculture, l'Énergie et la Gestion de l'Eau :
          </div>
          <p className="leading-relaxed">
            {selectedFortnight.agriculturalGuidance}
          </p>
        </div>
      </div>

      {/* Long-range 4-Month Chart */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center justify-between">
          <span>Trajectoire d'Anomalie Thermique & Précipitations sur 4 Mois</span>
          <span className="text-[11px] text-slate-500">Ensemble Copernicus C3S / ECMWF SEAS5</span>
        </h4>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
              <YAxis yAxisId="left" stroke="#f59e0b" fontSize={11} unit="°C" domain={[-4, 5]} />
              <YAxis yAxisId="right" orientation="right" stroke="#06b6d4" fontSize={11} unit="%" domain={[-60, 60]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
              />
              <ReferenceLine yAxisId="left" y={0} stroke="#475569" strokeDasharray="3 3" />
              <Bar yAxisId="right" dataKey="precipAnomaly" fill="#06b6d4" opacity={0.35} radius={[4, 4, 0, 0]} name="Écart Précipitations (%)" />
              <Line yAxisId="left" type="monotone" dataKey="tempAnomaly" stroke="#f43f5e" strokeWidth={3} dot={{ r: 5 }} name="Anomalie Température (°C)" />
              <Line yAxisId="left" type="monotone" dataKey="tempMean" stroke="#fbbf24" strokeWidth={2} strokeDasharray="3 3" name="Moyenne Attendue (°C)" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
