import React from 'react';
import { TrendingUp, TrendingDown, CheckCircle, AlertTriangle, Flame, Snowflake } from 'lucide-react';
import { ClimateAnomaly } from '../types/weather';

interface AnomalyBadgeProps {
  anomaly: ClimateAnomaly;
  seniorMode?: boolean;
}

export const AnomalyBadge: React.FC<AnomalyBadgeProps> = ({ anomaly, seniorMode }) => {
  const isWarm = anomaly.isWarmAnomaly;
  const delta = anomaly.tempAnomaly;
  const absDelta = Math.abs(delta);

  let bgClass = "bg-emerald-950/50 border-emerald-500/40 text-emerald-300";
  let Icon = CheckCircle;
  let label = "Conforme aux normales 1991-2020";

  if (anomaly.severity === 'CRITICAL') {
    bgClass = isWarm 
      ? "bg-rose-950/80 border-rose-500 text-rose-200 animate-pulse" 
      : "bg-cyan-950/80 border-cyan-500 text-cyan-200 animate-pulse";
    Icon = isWarm ? Flame : Snowflake;
    label = isWarm ? "Alerte Chaleur / Canicule extrême" : "Alerte Grand Froid sévère";
  } else if (anomaly.severity === 'SEVERE') {
    bgClass = isWarm 
      ? "bg-amber-950/60 border-amber-500/60 text-amber-200" 
      : "bg-blue-950/60 border-blue-500/60 text-blue-200";
    Icon = isWarm ? TrendingUp : TrendingDown;
    label = isWarm ? "Anomalie Chaude marquée" : "Anomalie Froide marquée";
  } else if (anomaly.severity === 'MODERATE') {
    bgClass = isWarm 
      ? "bg-amber-950/40 border-amber-500/30 text-amber-300" 
      : "bg-blue-950/40 border-blue-500/30 text-blue-300";
    Icon = isWarm ? TrendingUp : TrendingDown;
    label = isWarm ? "Léger excédent thermique" : "Léger déficit thermique";
  }

  return (
    <div
      id="anomaly-badge"
      className={`inline-flex flex-wrap items-center gap-3 rounded-2xl border px-4 py-2.5 shadow-md backdrop-blur ${bgClass} ${
        seniorMode ? 'text-lg px-5 py-3' : 'text-sm'
      }`}
    >
      <Icon className={`shrink-0 ${seniorMode ? 'h-6 w-6' : 'h-5 w-5'}`} />
      
      <div className="flex items-baseline gap-2">
        <span className="font-extrabold tracking-wide">
          {delta > 0 ? `+${delta}°C` : `${delta}°C`}
        </span>
        <span className="font-medium opacity-90">
          vs Normale ({anomaly.normalTemp}°C)
        </span>
      </div>

      <span className={`rounded-full bg-black/20 px-2.5 py-0.5 font-semibold ${seniorMode ? 'text-sm' : 'text-xs'}`}>
        {label}
      </span>
    </div>
  );
};
