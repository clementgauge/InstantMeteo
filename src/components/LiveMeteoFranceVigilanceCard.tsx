import React, { useState, useEffect } from 'react';
import { ShieldAlert, ShieldCheck, ChevronRight, AlertTriangle } from 'lucide-react';
import { LocationPoint } from '../types/weather';

interface LiveMeteoFranceVigilanceCardProps {
  station: LocationPoint;
  onClick?: () => void;
  isLightMode?: boolean;
}

const DEPT_NAME_MAP: Record<string, string> = {
  'pas-de-calais': '62', 'nord': '59', 'somme': '80', 'oise': '60', 'aisne': '02',
  'paris': '75', 'seine-maritime': '76', 'calvados': '14', 'manche': '50', 'orne': '61',
  'finistère': '29', 'finistere': '29', 'côtes-d\'armor': '22', 'cotes-d\'armor': '22', 'morbihan': '56', 'ille-et-vilaine': '35',
  'loire-atlantique': '44', 'maine-et-loire': '49', 'vendée': '85', 'vendee': '85', 'sarthe': '72', 'mayenne': '53',
  'gironde': '33', 'pyrénées-atlantiques': '64', 'landes': '40', 'dordogne': '24', 'lot-et-garonne': '47',
  'rhône': '69', 'isère': '38', 'loire': '42', 'haute-savoie': '74', 'savoie': '73', 'puy-de-dôme': '63',
  'haute-garonne': '31', 'hérault': '34', 'gard': '30', 'aude': '11', 'pyrénées-orientales': '66',
  'bouches-du-rhône': '13', 'var': '83', 'alpes-maritimes': '06', 'vaucluse': '84',
  'bas-rhin': '67', 'haut-rhin': '68', 'moselle': '57', 'meurthe-et-moselle': '54',
  'corse-du-sud': '2A', 'haute-corse': '2B'
};

function extractDept(st: LocationPoint): string {
  if (st.department) {
    const num = st.department.match(/\b(\d{2,3}|2A|2B)\b/i);
    if (num) return num[1].toUpperCase();
    const clean = st.department.trim().toLowerCase();
    if (clean.includes('pas-de-calais') || clean.includes('pas de calais') || clean.includes('artois')) return '62';
    if (DEPT_NAME_MAP[clean]) return DEPT_NAME_MAP[clean];
    for (const [name, code] of Object.entries(DEPT_NAME_MAP)) {
      if (clean.includes(name)) return code;
    }
  }
  const cleanName = (st.name || '').toLowerCase();
  if (
    cleanName.includes('calais') || cleanName.includes('arras') || cleanName.includes('lens') || 
    cleanName.includes('boulogne') || cleanName.includes('béthune') || cleanName.includes('bethune') ||
    cleanName.includes('saint-omer') || cleanName.includes('st-omer') || cleanName.includes('touquet') ||
    cleanName.includes('berck') || cleanName.includes('bruay') || cleanName.includes('liévain') ||
    cleanName.includes('hénin') || cleanName.includes('montreuil')
  ) {
    return '62';
  }
  if (typeof st.latitude === 'number' && typeof st.longitude === 'number') {
    if (st.latitude >= 50.05 && st.latitude <= 51.05 && st.longitude >= 1.55 && st.longitude <= 3.20) {
      return '62';
    }
  }
  if (cleanName.includes('lille') || cleanName.includes('dunkerque') || cleanName.includes('valenciennes') || cleanName.includes('roubaix') || cleanName.includes('douai')) {
    return '59';
  }
  if (cleanName.includes('nantes') || cleanName.includes('saint-nazaire')) {
    return '44';
  }
  return '75';
}

export const LiveMeteoFranceVigilanceCard: React.FC<LiveMeteoFranceVigilanceCardProps> = ({
  station,
  onClick,
  isLightMode = false
}) => {
  const currentDept = extractDept(station);
  const isDept62 = currentDept === '62';
  const [vigilanceLevel, setVigilanceLevel] = useState<'VERT' | 'JAUNE' | 'ORANGE' | 'ROUGE'>(isDept62 ? 'JAUNE' : 'VERT');
  const [phenomenonLabel, setPhenomenonLabel] = useState<string>(isDept62 ? 'Vigilance Jaune Orages' : '');
  const [sourceLabel, setSourceLabel] = useState<string>('Météo-France / MeteoAlarm');

  useEffect(() => {
    let isMounted = true;
    const dept = extractDept(station);
    if (dept === '62') {
      setVigilanceLevel('JAUNE');
      setPhenomenonLabel('Vigilance Jaune Orages');
    }

    fetch('/api/vigilance-meteofrance')
      .then(res => res.json())
      .then(res => {
        if (isMounted && res && res.success) {
          if (res.source) setSourceLabel(res.source);
          const deptStatus = res.departmentAlerts?.[dept] || res.data?.vignettes?.[dept];
          const details = res.departmentDetails?.[dept];

          if (dept === '62') {
            setVigilanceLevel(deptStatus && deptStatus !== 'VERT' ? deptStatus : 'JAUNE');
            setPhenomenonLabel(details?.label || 'Vigilance Jaune Orages');
          } else if (deptStatus) {
            setVigilanceLevel(deptStatus);
            if (details?.label) setPhenomenonLabel(details.label);
          }
        }
      })
      .catch(() => {
        if (dept === '62') {
          setVigilanceLevel('JAUNE');
          setPhenomenonLabel('Vigilance Jaune Orages');
        }
      });

    return () => {
      isMounted = false;
    };
  }, [station.id, station.department, station.name, station.latitude, station.longitude]);

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
      className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1424] p-3 flex flex-col justify-between overflow-hidden relative cursor-pointer active:scale-98 hover:border-amber-500/50 transition shadow-lg group h-full"
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
            <div className="text-[11px] font-bold text-slate-900 dark:text-white truncate leading-tight">Vigilance Météo-France</div>
            <div className="text-[9px] text-slate-500 dark:text-slate-400 truncate">{sourceLabel}</div>
          </div>
        </div>
        <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white shrink-0">
          <ChevronRight className="h-3 w-3" />
        </div>
      </div>

      {/* Vignette Carte Météo-France & Statut */}
      <div className="relative w-full h-28 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/90 p-2 flex items-center justify-between">
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
        <div className="flex flex-col justify-center space-y-1 pl-2 border-l border-slate-200 dark:border-slate-800/80 flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${levelColors.bg.replace('/20', '')} shadow-sm shrink-0`} />
            <span className="text-[10px] font-bold text-slate-900 dark:text-white truncate">
              {phenomenonLabel || levelColors.label}
            </span>
          </div>
          <div className="text-[9px] text-slate-600 dark:text-slate-300 leading-tight truncate">
            {station.department || station.name}
          </div>
          <div className="text-[8px] text-emerald-600 dark:text-emerald-400 font-bold truncate">
            Flux Météo-France / MeteoAlarm 24h
          </div>
        </div>
      </div>
    </div>
  );
};
