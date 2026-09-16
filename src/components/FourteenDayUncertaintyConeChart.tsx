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
    <div className="rounded-lg border border-slate-800 bg-slate-900 p-4 sm:p-5 space-y-4">
      {/* Header & Metric Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5" />
              <span>Modélisation Ensembliste & Cône d'Incertitude</span>
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-950 text-slate-400 border border-slate-800">
              51 scénarios CEPMMT + 31 GEFS
            </span>
          </div>
          <h3 className="text-lg font-bold text-white">
            Plume Thermique à 14 Jours — {stationName}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5 max-w-2xl leading-relaxed">
            Évolution de l'enveloppe prévisionnelle au fil de l'échéance : plus l'horizon s'éloigne, plus la divergence entre scénarios augmente naturellement.
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-md bg-slate-950 border border-slate-800 p-1">
          <button
            onClick={() => setMetric('tmax')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
              metric === 'tmax' 
                ? 'bg-rose-600 text-white' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Flame className="h-3.5 w-3.5" />
            <span>Maximales (Tx)</span>
          </button>
          <button
            onClick={() => setMetric('tmin')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
              metric === 'tmin' 
                ? 'bg-sky-600 text-white' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Snowflake className="h-3.5 w-3.5" />
            <span>Minimales (Tn)</span>
          </button>
        </div>
      </div>

      {/* Interactive Legend & Current Point Preview Bar */}
      <div className="rounded-md bg-slate-950 border border-slate-800 p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${metric === 'tmax' ? 'bg-rose-400' : 'bg-sky-400'}`}></span>
            <span className="text-slate-300 font-medium">Scénario Médian</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-6 rounded-sm bg-sky-500/20 border border-sky-400/40"></span>
            <span className="text-slate-300 font-medium">Cône d'Incertitude (80% des scénarios)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-0.5 w-5 bg-slate-500 border-b border-dashed border-slate-400"></span>
            <span className="text-slate-400 font-medium">Normale 1991-2020</span>
          </div>
        </div>

        {currentDisplayPoint && (
          <div className="flex items-center gap-2.5 bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800 text-xs">
            <span className="font-semibold text-white">
              {currentDisplayPoint.dayLabel} ({currentDisplayPoint.dayIndex === 0 ? 'Auj.' : `J+${currentDisplayPoint.dayIndex}`}) :
            </span>
            <span className={`font-mono font-bold ${metric === 'tmax' ? 'text-rose-400' : 'text-sky-400'}`}>
              Médiane {formatTemp(currentDisplayPoint.dominantVal)}
            </span>
            <span className="text-slate-400">
              Fourchette : <strong className="text-slate-200 font-mono">{formatTemp(currentDisplayPoint.lowerVal)} à {formatTemp(currentDisplayPoint.upperVal)}</strong>
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
              ±{currentDisplayPoint.uncertaintyMargin}°C
            </span>
          </div>
        )}
      </div>

      {/* SVG Chart */}
      <div className="relative w-full overflow-x-auto rounded-md bg-slate-950 border border-slate-800 p-2">
        <svg 
          viewBox={`0 0 ${width} ${height}`} 
          className="w-full h-auto min-w-[700px] select-none"
        >
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
          <rect x={padLeft} y={padTop} width={(chartW * 3) / 14} height={chartH} fill="#10b981" fillOpacity="0.03" />
          <rect x={padLeft + (chartW * 3) / 14} y={padTop} width={(chartW * 4) / 14} height={chartH} fill="#0284c7" fillOpacity="0.03" />
          <rect x={padLeft + (chartW * 7) / 14} y={padTop} width={(chartW * 3) / 14} height={chartH} fill="#f59e0b" fillOpacity="0.03" />
          <rect x={padLeft + (chartW * 10) / 14} y={padTop} width={(chartW * 4) / 14} height={chartH} fill="#64748b" fillOpacity="0.03" />

          {/* Horizon Labels at the top */}
          <text x={padLeft + (chartW * 1.5) / 14} y={padTop - 12} textAnchor="middle" className="fill-emerald-400 font-semibold text-[9px] uppercase tracking-wider">
            J+1 à J+3 : Déterministe
          </text>
          <text x={padLeft + (chartW * 5) / 14} y={padTop - 12} textAnchor="middle" className="fill-sky-400 font-semibold text-[9px] uppercase tracking-wider">
            J+4 à J+7 : Tendance Probable
          </text>
          <text x={padLeft + (chartW * 8.5) / 14} y={padTop - 12} textAnchor="middle" className="fill-amber-400 font-semibold text-[9px] uppercase tracking-wider">
            J+8 à J+10 : Bifurcation
          </text>
          <text x={padLeft + (chartW * 12) / 14} y={padTop - 12} textAnchor="middle" className="fill-slate-400 font-semibold text-[9px] uppercase tracking-wider">
            J+11 à J+14 : Faisceau
          </text>

          {/* Normal climatologique line */}
          <path 
            d={normalLinePath} 
            fill="none" 
            stroke="#64748b" 
            strokeWidth="1.5" 
            strokeDasharray="4 4"
            opacity="0.6"
          />

          {/* Uncertainty Cone Polygon */}
          <polygon 
            points={conePolygonPath} 
            fill="#0284C7"
            fillOpacity="0.12"
            stroke="#0284C7"
            strokeWidth="1"
            strokeOpacity="0.3"
          />

          {/* Dominant Line */}
          <path 
            d={dominantLinePath} 
            fill="none" 
            stroke={metric === 'tmax' ? '#f43f5e' : '#0284c7'} 
            strokeWidth="2.5"
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
                    fill="#0284c7" 
                    fillOpacity={isSelected ? "0.12" : "0.06"}
                    rx={4}
                  />
                )}

                {/* Vertical spread bar connecting upper and lower */}
                <line 
                  x1={x} 
                  y1={yUpper} 
                  x2={x} 
                  y2={yLower} 
                  stroke={isSelected ? "#38bdf8" : "#475569"} 
                  strokeWidth={isSelected ? "2" : "1"}
                />

                {/* Upper cap */}
                <line x1={x - 3} y1={yUpper} x2={x + 3} y2={yUpper} stroke="#64748b" strokeWidth="1.5" />
                {/* Lower cap */}
                <line x1={x - 3} y1={yLower} x2={x + 3} y2={yLower} stroke="#64748b" strokeWidth="1.5" />

                {/* Dominant point node */}
                <circle 
                  cx={x} 
                  cy={yDominant} 
                  r={isSelected ? 5 : isHovered ? 4.5 : 3.5} 
                  fill={isSelected ? "#ffffff" : metric === 'tmax' ? "#f43f5e" : "#0284c7"}
                  stroke="#0f172a"
                  strokeWidth="2"
                />

                {/* Day label on X Axis */}
                <text 
                  x={x} 
                  y={height - padBottom + 16} 
                  textAnchor="middle" 
                  className={`font-mono text-[9px] font-semibold ${
                    isSelected ? 'fill-sky-400 font-bold' : isHovered ? 'fill-white' : 'fill-slate-400'
                  }`}
                >
                  {p.dayIndex === 0 ? "Auj." : `J+${p.dayIndex}`}
                </text>
                <text 
                  x={x} 
                  y={height - padBottom + 28} 
                  textAnchor="middle" 
                  className={`text-[8px] ${
                    isSelected ? 'fill-white font-semibold' : 'fill-slate-500'
                  }`}
                >
                  {p.dayLabel.split(' ')[0]}
                </text>

                {/* Spread tag */}
                <text 
                  x={x} 
                  y={height - padBottom + 40} 
                  textAnchor="middle" 
                  className={`text-[8px] font-mono font-medium ${
                    p.uncertaintyMargin <= 1.5 ? 'fill-emerald-400' : p.uncertaintyMargin <= 3 ? 'fill-sky-400' : p.uncertaintyMargin <= 4.5 ? 'fill-amber-400' : 'fill-slate-400'
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
        <div className="rounded-md bg-slate-950 border border-slate-800 p-3 space-y-1">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Pourquoi ce cône s'élargit-il ?</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            L'atmosphère est un système chaotique. Une infime variation initiale amplifie les écarts entre scénarios après 7 jours.
          </p>
        </div>

        <div className="rounded-md bg-slate-950 border border-slate-800 p-3 space-y-1">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Médiane plutôt que valeur unique</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            À J+12, afficher un chiffre fixe est trompeur. La médiane d'ensemble et les bornes réelles des 51 membres du CEPMMT fournissent un repère fiable.
          </p>
        </div>

        <div className="rounded-md bg-slate-950 border border-slate-800 p-3 space-y-1">
          <div className="flex items-center gap-2 text-sky-400 text-xs font-bold">
            <Info className="h-3.5 w-3.5" />
            <span>Utilisation pratique</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Au-delà de J+8, basez vos décisions sur le type de masse d'air (douce ou fraîche) et anticipez les fourchettes haute et basse.
          </p>
        </div>
      </div>
    </div>
  );
};
