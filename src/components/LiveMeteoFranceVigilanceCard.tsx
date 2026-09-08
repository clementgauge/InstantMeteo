import React, { useState, useEffect } from 'react';
import { ShieldAlert, ShieldCheck, ChevronRight, AlertTriangle } from 'lucide-react';
import { LocationPoint } from '../types/weather';

interface LiveMeteoFranceVigilanceCardProps {
  station: LocationPoint;
  onClick?: () => void;
}

export const LiveMeteoFranceVigilanceCard: React.FC<LiveMeteoFranceVigilanceCardProps> = ({
  station,
  onClick
}) => {
  const [vigilanceLevel, setVigilanceLevel] = useState<'VERT' | 'JAUNE' | 'ORANGE' | 'ROUGE'>('VERT');
  const [sourceLabel, setSourceLabel] = useState<string>('Météo-France');

  useEffect(() => {
    let isMounted = true;
    fetch('/api/vigilance-meteofrance')
      .then(res => res.json())
      .then(res => {
        if (isMounted && res && res.success) {
          if (res.source) setSourceLabel(res.source);
          // Si données du département de la station
          const dept = station.department?.match(/\b(\d{2,3})\b/)?.[1] || '75';
          const deptStatus = res.data?.vignettes?.[dept] || res.departmentAlerts?.[dept];
          if (deptStatus) {
            setVigilanceLevel(deptStatus);
          }
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [station.department]);

  const levelColors = {
    VERT: {
      bg: 'bg-emerald-500/20',
      border: 'border-emerald-500/40',
      text: 'text-emerald-400',
      fill: '#10b981',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      label: 'Niveau Vert (Normal)'
    },
    JAUNE: {
      bg: 'bg-amber-500/20',
      border: 'border-amber-500/40',
      text: 'text-amber-400',
      fill: '#f59e0b',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      label: 'Vigilance Jaune'
    },
    ORANGE: {
      bg: 'bg-orange-500/20',
      border: 'border-orange-500/40',
      text: 'text-orange-400',
      fill: '#f97316',
      badge: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
      label: 'Alerte Orange'
    },
    ROUGE: {
      bg: 'bg-rose-500/20',
      border: 'border-rose-500/40',
      text: 'text-rose-400',
      fill: '#ef4444',
      badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      label: 'Vigilance Rouge'
    }
  }[vigilanceLevel];

  return (
    <div
      id="realtime-mini-vigilance-card"
      onClick={onClick}
      className="rounded-2xl border border-slate-800 bg-[#0c1424] p-3 flex flex-col justify-between overflow-hidden relative cursor-pointer active:scale-98 hover:border-amber-500/50 transition shadow-lg group h-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-1 mb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className={`w-6 h-6 rounded-lg ${levelColors.bg} border ${levelColors.border} ${levelColors.text} flex items-center justify-center shrink-0`}>
            {vigilanceLevel === 'VERT' ? (
              <ShieldCheck className="h-3.5 w-3.5" />
            ) : (
              <ShieldAlert className="h-3.5 w-3.5" />
            )}
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-bold text-white truncate leading-tight">Vigilance Officielle</div>
            <div className="text-[9px] text-slate-400 truncate">{sourceLabel}</div>
          </div>
        </div>
        <div className="w-5 h-5 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-400 group-hover:text-white shrink-0">
          <ChevronRight className="h-3 w-3" />
        </div>
      </div>

      {/* Vignette Carte Météo-France & Statut */}
      <div className="relative w-full h-28 rounded-xl overflow-hidden bg-slate-950 border border-slate-800/90 p-2 flex items-center justify-between">
        {/* Silhouette de la carte de France avec départements et couleur officielle */}
        <div className="relative w-20 h-24 flex items-center justify-center shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
            {/* Contour France */}
            <path
              d="M38 12 L55 16 L68 28 L82 40 L76 60 L80 75 L65 88 L48 85 L35 78 L20 62 L15 42 L25 24 Z"
              fill={levelColors.fill}
              opacity="0.88"
              stroke="#0f172a"
              strokeWidth="1.5"
            />
            {/* Île de France / Bassin */}
            <circle cx="48" cy="36" r="5" fill="#ffffff" opacity="0.8" />
            <circle cx="48" cy="36" r="2.5" fill="#0284c7" />
            {/* Corse */}
            <path
              d="M85 75 L89 78 L87 88 L83 85 Z"
              fill={levelColors.fill}
              stroke="#0f172a"
              strokeWidth="1"
            />
          </svg>
        </div>

        {/* Légende & Statut départemental */}
        <div className="flex flex-col justify-center space-y-1.5 pl-1.5 border-l border-slate-800/80 flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${levelColors.bg.replace('/20', '')}`} />
            <span className="text-[10px] font-bold text-white truncate">
              {levelColors.label}
            </span>
          </div>
          <div className="text-[9px] text-slate-300 leading-tight">
            Secteur {station.name}
          </div>
          <div className="text-[8px] text-emerald-400 font-medium">
            Flux Météo-France 24h
          </div>
        </div>
      </div>
    </div>
  );
};
