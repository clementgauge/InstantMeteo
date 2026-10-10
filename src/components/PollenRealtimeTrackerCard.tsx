import React, { useMemo } from 'react';
import { Flower2 } from 'lucide-react';
import { CurrentWeather, LocationPoint } from '../types/weather';
import { computeRealtimePollenTracking } from '../services/pollenService';

interface PollenRealtimeTrackerCardProps {
  weather: CurrentWeather;
  station: LocationPoint;
  seniorMode?: boolean;
}

export const PollenRealtimeTrackerCard: React.FC<PollenRealtimeTrackerCardProps> = ({
  weather,
  station,
  seniorMode = false,
}) => {
  const pollen = useMemo(() => {
    if (weather.pollenData) return weather.pollenData;
    if (weather.airQualityDetails?.pollenData) return weather.airQualityDetails.pollenData;
    return computeRealtimePollenTracking(station, {
      temperature: weather.temperature,
      humidity: weather.humidity,
      windSpeed: weather.windSpeed,
      precipitation: weather.precipitation,
      uvIndex: weather.uvIndex,
      isDay: weather.isDay,
    });
  }, [weather, station]);

  const redToGreenPositionPct = Math.max(3, Math.min(97, 100 - pollen.overallScore100));
  const needleAngleDeg = -90 + (redToGreenPositionPct / 100) * 180;

  const getRiskColor = (riskIndex: number) => {
    switch (riskIndex) {
      case 0:
      case 1:
        return { text: 'text-emerald-400', hex: '#10b981' };
      case 2:
        return { text: 'text-lime-400', hex: '#84cc16' };
      case 3:
        return { text: 'text-amber-400', hex: '#f59e0b' };
      case 4:
        return { text: 'text-orange-400', hex: '#f97316' };
      default:
        return { text: 'text-rose-400', hex: '#ef4444' };
    }
  };

  const overallColor = getRiskColor(pollen.overallRiskIndex);

  return (
    <div
      id="gauge-pollen"
      className={`rounded-xl border border-slate-800/90 bg-[#0a1220]/95 p-4 sm:p-5 shadow-md transition-colors duration-200 hover:border-slate-700 hover:bg-[#0d1729] flex flex-col justify-between ${
        seniorMode ? 'p-6 ring-1 ring-slate-700' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className={`font-semibold text-slate-300 tracking-tight ${seniorMode ? 'text-base' : 'text-xs sm:text-sm'}`}>
          Taux de Pollen
        </span>
        <Flower2 className={`h-4 w-4 shrink-0 ${overallColor.text}`} />
      </div>

      <div className="mt-1 flex flex-col items-center">
        <svg viewBox="0 0 220 118" className="w-full max-w-[195px] overflow-visible">
          <defs>
            <linearGradient id="pollenOnlyRedToGreenGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="25%" stopColor="#f97316" />
              <stop offset="50%" stopColor="#eab308" />
              <stop offset="75%" stopColor="#84cc16" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>

          <path
            d="M 24 98 A 86 86 0 0 1 196 98"
            fill="none"
            stroke="#1e293b"
            strokeWidth="16"
            strokeLinecap="round"
          />

          <path
            d="M 24 98 A 86 86 0 0 1 196 98"
            fill="none"
            stroke="url(#pollenOnlyRedToGreenGrad)"
            strokeWidth="14"
            strokeLinecap="round"
          />

          <text x="16" y="114" fill="#f87171" fontSize="9" fontWeight="700" textAnchor="start">
            ROUGE
          </text>
          <text x="204" y="114" fill="#34d399" fontSize="9" fontWeight="700" textAnchor="end">
            VERT
          </text>

          <g transform={`translate(110, 98) rotate(${needleAngleDeg})`}>
            <polygon points="-3,0 0,-68 3,0" fill="#ffffff" />
            <circle cx="0" cy="-68" r="3.5" fill={overallColor.hex} stroke="#ffffff" strokeWidth="1.5" />
          </g>

          <circle cx="110" cy="98" r="6.5" fill="#0f172a" stroke="#ffffff" strokeWidth="2" />
        </svg>

        <div className="flex items-baseline gap-1.5 -mt-1 font-mono tabular-nums">
          <span className={`font-extrabold tracking-tight text-white ${seniorMode ? 'text-2xl' : 'text-lg'}`}>
            {pollen.overallRiskIndex}/5
          </span>
          <span className={`text-xs font-semibold ${overallColor.text}`}>
            · {pollen.totalGrainsM3} gr/m³
          </span>
        </div>
      </div>
    </div>
  );
};
