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

  // Position sur la jauge de Rouge (0% gauche = Risque fort) à Vert (100% droite = Risque faible / Air sain)
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
      className={`rounded-[24px] border border-slate-700/70 bg-[#0c1424]/90 p-5 shadow-xl backdrop-blur-2xl transition-all duration-300 hover:border-slate-600/90 hover:bg-[#0f1a30]/95 hover:shadow-2xl hover:-translate-y-0.5 group ${
        seniorMode ? 'p-6 ring-1 ring-slate-700' : ''
      }`}
    >
      {/* En-tête identique aux autres jauges météo */}
      <div className="flex items-center justify-between">
        <span className={`font-bold text-slate-300 group-hover:text-white transition ${seniorMode ? 'text-lg' : 'text-sm'}`}>
          Taux de Pollen
        </span>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-emerald-600/20 shadow-inner transition-transform group-hover:scale-105">
          <Flower2 className={`h-5 w-5 ${overallColor.text}`} />
        </div>
      </div>

      {/* Uniquement la Jauge de Rouge à Vert */}
      <div className="mt-2 flex flex-col items-center">
        <svg viewBox="0 0 220 120" className="w-full max-w-[210px] overflow-visible">
          <defs>
            <linearGradient id="pollenOnlyRedToGreenGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="25%" stopColor="#f97316" />
              <stop offset="50%" stopColor="#eab308" />
              <stop offset="75%" stopColor="#84cc16" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>

          {/* Piste de fond */}
          <path
            d="M 24 100 A 86 86 0 0 1 196 100"
            fill="none"
            stroke="#1e293b"
            strokeWidth="18"
            strokeLinecap="round"
          />

          {/* Arc gradué de Rouge (gauche) à Vert (droite) */}
          <path
            d="M 24 100 A 86 86 0 0 1 196 100"
            fill="none"
            stroke="url(#pollenOnlyRedToGreenGrad)"
            strokeWidth="16"
            strokeLinecap="round"
          />

          {/* Libellés Rouge ➔ Vert */}
          <text x="16" y="116" fill="#f87171" fontSize="9" fontWeight="800" textAnchor="start">
            ROUGE
          </text>
          <text x="204" y="116" fill="#34d399" fontSize="9" fontWeight="800" textAnchor="end">
            VERT
          </text>

          {/* Aiguille dynamique */}
          <g transform={`translate(110, 100) rotate(${needleAngleDeg})`}>
            <polygon points="-3.5,0 0,-70 3.5,0" fill="#ffffff" />
            <circle cx="0" cy="-70" r="4" fill={overallColor.hex} stroke="#ffffff" strokeWidth="1.5" />
          </g>

          {/* Pivot central */}
          <circle cx="110" cy="100" r="7.5" fill="#0f172a" stroke="#ffffff" strokeWidth="2.5" />
        </svg>

        <div className="flex items-baseline gap-1.5 -mt-1">
          <span className={`font-black tracking-tight text-white ${seniorMode ? 'text-2xl' : 'text-xl'}`}>
            {pollen.overallRiskIndex}/5
          </span>
          <span className={`text-xs font-bold ${overallColor.text}`}>
            ({pollen.totalGrainsM3} gr/m³)
          </span>
        </div>
      </div>
    </div>
  );
};
