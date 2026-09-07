import React, { useState } from 'react';
import { FourteenDayDayDetail } from '../types/weather';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Info, 
  Sparkles, 
  TrendingUp, 
  Layers, 
  Activity,
  Flame,
  Snowflake,
  ChevronRight
} from 'lucide-react';

interface FourteenDayUncertaintyConeChartProps {
  days: FourteenDayDayDetail[];
  selectedDayIdx: number;
  onSelectDay: (dayIdx: number) => void;
  formatTemp: (celsius?: number | null) => string;
  stationName: string;
}

export const FourteenDayUncertaintyConeChart: React.FC<FourteenDayUncertaintyConeChartProps> = ({
  days,
  selectedDayIdx,
  onSelectDay,
  formatTemp,
  stationName
}) => {
  const [metric, setMetric] = useState<'tmax' | 'tmin'>('tmax');
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!days || days.length === 0) return null;

  // Calculate SVG dimensions and scale
  const width = 900;
  const height = 340;
  const padLeft = 55;
  const padRight = 35;
  const padTop = 40;
  const padBottom = 55;

  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  // Gather values for metric
  const points = days.map((d, i) => {
    const isTmax = metric === 'tmax';
    const dominantVal = isTmax ? d.dominantScenario.tempMax : d.dominantScenario.tempMin;
    const upperVal = isTmax 
      ? Math.max(d.dominantScenario.tempMax, d.alternativeScenario2?.tempMax ?? d.dominantScenario.tempMax, d.probableTxRange?.max ?? d.dominantScenario.tempMax)
      : Math.max(d.dominantScenario.tempMin, d.alternativeScenario2?.tempMin ?? d.dominantScenario.tempMin, d.probableTnRange?.max ?? d.dominantScenario.tempMin);
    const lowerVal = isTmax
      ? Math.min(d.dominantScenario.tempMax, d.alternativeScenario1?.tempMax ?? d.dominantScenario.tempMax, d.probableTxRange?.min ?? d.dominantScenario.tempMax)
      : Math.min(d.dominantScenario.tempMin, d.alternativeScenario1?.tempMin ?? d.dominantScenario.tempMin, d.probableTnRange?.min ?? d.dominantScenario.tempMin);
    const normalVal = isTmax ? d.previousYearComparison.normalTMax : d.previousYearComparison.normalTMin;

    return {
      dayIndex: d.dayIndex,
      dayLabel: d.dayLabel,
      dominantVal,
      upperVal,
      lowerVal,
      normalVal,
      uncertaintyMargin: d.uncertaintyMarginC,
      confidenceGrade: d.confidenceGrade,
      confidenceScore: d.modelConsensusScorePct,
      detail: d
    };
  });

  const allVals = points.flatMap(p => [p.dominantVal, p.upperVal, p.lowerVal, p.normalVal]);
  const minVal = Math.floor(Math.min(...allVals) - 2);
  const maxVal = Math.ceil(Math.max(...allVals) + 2);
  const valRange = maxVal - minVal || 1;

  const getX = (idx: number) => padLeft + (idx / (days.length - 1)) * chartW;
  const getY = (val: number) => padTop + chartH - ((val - minVal) / valRange) * chartH;

  // Build SVG polygon for the uncertainty cone
  const upperCoords = points.map((p, i) => `${getX(i)},${getY(p.upperVal)}`);
  const lowerCoordsReversed = [...points].reverse().map((p, i) => {
    const origIdx = days.length - 1 - i;
    return `${getX(origIdx)},${getY(p.lowerVal)}`;
  });
  const conePolygonPath = `${upperCoords.join(' ')} ${lowerCoordsReversed.join(' ')}`;

  // Line for dominant scenario
  const dominantLinePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(p.dominantVal)}`)
    .join(' ');

  // Line for normal climatologique
  const normalLinePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(p.normalVal)}`)
    .join(' ');

  const currentDisplayPoint = hoveredIdx !== null ? points[hoveredIdx] : points.find(p => p.dayIndex === selectedDayIdx) || points[0];

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 sm:p-6 shadow-2xl backdrop-blur space-y-5">
      {/* Header & Metric Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Activity className="h-4 w-4" />
              <span>Transparence Scientifique & Cône de Probabilités Ensemblistes</span>
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              51 Scénarios CEPMMT + 31 GEFS
            </span>
          </div>
          <h3 className="text-xl font-black text-white">
            Plume Thermique & Cône d'Incertitude à 14 Jours ({stationName})
          </h3>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Contrairement aux prévisions déterministes simplistes, ce graphique expose <strong>honnêtement l'élargissement de l'incertitude</strong> (effet papillon). Plus l'échéance s'éloigne, plus l'enveloppe des scénarios s'écarte.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-xl bg-slate-950 border border-slate-800 p-1">
            <button
              onClick={() => setMetric('tmax')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                metric === 'tmax' 
                  ? 'bg-rose-600 text-white shadow' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Flame className="h-3.5 w-3.5" />
              <span>Maximales (Tx)</span>
            </button>
            <button
              onClick={() => setMetric('tmin')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                metric === 'tmin' 
                  ? 'bg-cyan-600 text-white shadow' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Snowflake className="h-3.5 w-3.5" />
              <span>Minimales (Tn)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Legend & Current Point Preview Bar */}
      <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-3.5 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className={`h-3 w-3 rounded-full ${metric === 'tmax' ? 'bg-rose-400' : 'bg-cyan-400'}`}></span>
            <span className="text-slate-200 font-bold">Scénario Médian / Dominant</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-8 rounded-sm bg-gradient-to-r from-indigo-500/40 via-purple-500/30 to-amber-500/40 border border-indigo-400/40"></span>
            <span className="text-slate-300 font-medium">Cône d'Incertitude Réelle (Spread 80%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-0.5 w-6 bg-slate-500 border-b border-dashed border-slate-400"></span>
            <span className="text-slate-400 font-medium">Normale 1991-2020</span>
          </div>
        </div>

        {currentDisplayPoint && (
          <div className="flex items-center gap-3 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-700/80">
            <span className="font-bold text-white">
              {currentDisplayPoint.dayLabel} ({currentDisplayPoint.dayIndex === 0 ? 'Auj.' : `J+${currentDisplayPoint.dayIndex}`}) :
            </span>
            <span className={`font-black font-mono ${metric === 'tmax' ? 'text-rose-400' : 'text-cyan-400'}`}>
              Médiane {formatTemp(currentDisplayPoint.dominantVal)}
            </span>
            <span className="text-slate-400">
              Fourchette : <strong className="text-slate-200 font-mono">{formatTemp(currentDisplayPoint.lowerVal)} à {formatTemp(currentDisplayPoint.upperVal)}</strong>
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              ±{currentDisplayPoint.uncertaintyMargin}°C
            </span>
          </div>
        )}
      </div>

      {/* SVG Chart */}
      <div className="relative w-full overflow-x-auto rounded-2xl bg-slate-950 border border-slate-800 p-2">
        <svg 
          viewBox={`0 0 ${width} ${height}`} 
          className="w-full h-auto min-w-[700px] select-none"
        >
          <defs>
            {/* Cone Gradient */}
            <linearGradient id="uncertaintyConeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.25" />
              <stop offset="35%" stopColor="#3b82f6" stopOpacity="0.22" />
              <stop offset="70%" stopColor="#8b5cf6" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.32" />
            </linearGradient>

            <linearGradient id="dominantLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={metric === 'tmax' ? '#fb7185' : '#38bdf8'} />
              <stop offset="60%" stopColor={metric === 'tmax' ? '#f43f5e' : '#0ea5e9'} />
              <stop offset="100%" stopColor={metric === 'tmax' ? '#e11d48' : '#0284c7'} />
            </linearGradient>
          </defs>

          {/* Horizontal grid lines */}
          {Array.from({ length: 7 }).map((_, i) => {
            const val = minVal + (i / 6) * valRange;
            const y = getY(val);
            return (
              <g key={i}>
                <line 
                  x1={padLeft} 
                  y1={y} 
                  x2={width - padRight} 
                  y2={y} 
                  stroke="#1e293b" 
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
                <text 
                  x={padLeft - 8} 
                  y={y + 4} 
                  textAnchor="end" 
                  className="fill-slate-500 font-mono text-[10px]"
                >
                  {Math.round(val)}°C
                </text>
              </g>
            );
          })}

          {/* 4 Horizon Zone Shading Markers */}
          <rect x={padLeft} y={padTop} width={(chartW * 3) / 14} height={chartH} fill="#10b981" fillOpacity="0.04" />
          <rect x={padLeft + (chartW * 3) / 14} y={padTop} width={(chartW * 4) / 14} height={chartH} fill="#3b82f6" fillOpacity="0.04" />
          <rect x={padLeft + (chartW * 7) / 14} y={padTop} width={(chartW * 3) / 14} height={chartH} fill="#f59e0b" fillOpacity="0.04" />
          <rect x={padLeft + (chartW * 10) / 14} y={padTop} width={(chartW * 4) / 14} height={chartH} fill="#a855f7" fillOpacity="0.04" />

          {/* Horizon Labels at the top */}
          <text x={padLeft + (chartW * 1.5) / 14} y={padTop - 12} textAnchor="middle" className="fill-emerald-400 font-black text-[9px] uppercase tracking-wider">
            J+1-J+3 : Déterministe
          </text>
          <text x={padLeft + (chartW * 5) / 14} y={padTop - 12} textAnchor="middle" className="fill-blue-400 font-black text-[9px] uppercase tracking-wider">
            J+4-J+7 : Tendance Probable
          </text>
          <text x={padLeft + (chartW * 8.5) / 14} y={padTop - 12} textAnchor="middle" className="fill-amber-400 font-black text-[9px] uppercase tracking-wider">
            J+8-J+10 : Bifurcation
          </text>
          <text x={padLeft + (chartW * 12) / 14} y={padTop - 12} textAnchor="middle" className="fill-purple-400 font-black text-[9px] uppercase tracking-wider">
            J+11-J+14 : Faisceau Climatologique
          </text>

          {/* Normal climatologique line */}
          <path 
            d={normalLinePath} 
            fill="none" 
            stroke="#64748b" 
            strokeWidth="1.5" 
            strokeDasharray="4 4"
            opacity="0.7"
          />

          {/* Uncertainty Cone Polygon */}
          <polygon 
            points={conePolygonPath} 
            fill="url(#uncertaintyConeGrad)" 
            stroke="#6366f1"
            strokeWidth="1"
            strokeOpacity="0.4"
          />

          {/* Dominant Line */}
          <path 
            d={dominantLinePath} 
            fill="none" 
            stroke="url(#dominantLineGrad)" 
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Day Vertical lines & Interaction Points */}
          {points.map((p, i) => {
            const x = getX(i);
            const yDominant = getY(p.dominantVal);
            const yUpper = getY(p.upperVal);
            const yLower = getY(p.lowerVal);
            const isSelected = p.dayIndex === selectedDayIdx;
            const isHovered = hoveredIdx === i;

            return (
              <g 
                key={p.dayIndex} 
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                onClick={() => onSelectDay(p.dayIndex)}
              >
                {/* Vertical column highlight on hover / select */}
                {(isSelected || isHovered) && (
                  <rect 
                    x={x - 14} 
                    y={padTop} 
                    width={28} 
                    height={chartH} 
                    fill="#3b82f6" 
                    fillOpacity={isSelected ? "0.15" : "0.08"}
                    rx={6}
                  />
                )}

                {/* Vertical spread bar connecting upper and lower */}
                <line 
                  x1={x} 
                  y1={yUpper} 
                  x2={x} 
                  y2={yLower} 
                  stroke={isSelected ? "#38bdf8" : "#475569"} 
                  strokeWidth={isSelected ? "2" : "1.5"}
                />

                {/* Upper cap */}
                <line x1={x - 3} y1={yUpper} x2={x + 3} y2={yUpper} stroke="#818cf8" strokeWidth="2" />
                {/* Lower cap */}
                <line x1={x - 3} y1={yLower} x2={x + 3} y2={yLower} stroke="#818cf8" strokeWidth="2" />

                {/* Dominant point node */}
                <circle 
                  cx={x} 
                  cy={yDominant} 
                  r={isSelected ? 6 : isHovered ? 5 : 4} 
                  fill={isSelected ? "#ffffff" : metric === 'tmax' ? "#fb7185" : "#38bdf8"}
                  stroke="#0f172a"
                  strokeWidth="2"
                />

                {/* Day label on X Axis */}
                <text 
                  x={x} 
                  y={height - padBottom + 16} 
                  textAnchor="middle" 
                  className={`font-mono text-[9px] font-bold ${
                    isSelected ? 'fill-cyan-400 font-black' : isHovered ? 'fill-white' : 'fill-slate-400'
                  }`}
                >
                  {p.dayIndex === 0 ? "Auj." : `J+${p.dayIndex}`}
                </text>
                <text 
                  x={x} 
                  y={height - padBottom + 28} 
                  textAnchor="middle" 
                  className={`text-[8px] ${
                    isSelected ? 'fill-white font-bold' : 'fill-slate-500'
                  }`}
                >
                  {p.dayLabel.split(' ')[0]}
                </text>

                {/* Spread tag */}
                <text 
                  x={x} 
                  y={height - padBottom + 40} 
                  textAnchor="middle" 
                  className={`text-[8px] font-mono font-bold ${
                    p.uncertaintyMargin <= 1.5 ? 'fill-emerald-400' : p.uncertaintyMargin <= 3 ? 'fill-blue-400' : p.uncertaintyMargin <= 4.5 ? 'fill-amber-400' : 'fill-purple-400'
                  }`}
                >
                  ±{p.uncertaintyMargin}°
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Pedagogical Explanation Box on Uncertainty & Ensemble Modeling */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className="rounded-2xl bg-slate-950/70 border border-slate-800 p-4 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
            <ShieldCheck className="h-4 w-4" />
            <span>Pourquoi ce cône s'élargit-il ?</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            L'atmosphère est un système chaotique non linéaire. Une infime variation initiale (ex: 0.1°C de température de surface en Atlantique) amplifie exponentiellement les scénarios après 7 jours.
          </p>
        </div>

        <div className="rounded-2xl bg-slate-950/70 border border-slate-800 p-4 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
            <AlertTriangle className="h-4 w-4" />
            <span>L'honnêteté contre la fausse précision</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Donner un chiffre fixe de pluie ou de température à J+12 est scientifiquement trompeur. Nous publions ici la <strong>médiane d'ensemble</strong> et les bornes réelles calculées par les 51 membres du CEPMMT.
          </p>
        </div>

        <div className="rounded-2xl bg-slate-950/70 border border-slate-800 p-4 space-y-2">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold">
            <Sparkles className="h-4 w-4" />
            <span>Comment utiliser cette information ?</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Pour planifier un événement à J+8 ou plus, fiez-vous au type de masse d'air (douce vs fraîche) et préparez-vous à la fourchette haute comme à la fourchette basse.
          </p>
        </div>
      </div>
    </div>
  );
};
