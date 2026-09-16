import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  RefreshCw, 
  Calendar, 
  ChevronRight, 
  Info, 
  Wind, 
  CloudRain, 
  Zap, 
  Thermometer, 
  Eye, 
  Flame, 
  Mountain, 
  CheckCircle2, 
  Sparkles, 
  Activity,
  Layers,
  MapPin,
  HelpCircle,
  TrendingUp,
  AlertCircle,
  Footprints,
  Navigation,
  ChevronDown
} from 'lucide-react';
import { 
  LocationPoint, 
  DailyForecast, 
  HourlyForecast, 
  DailyVigilanceAlertItem, 
  VigilanceLevel, 
  MultiDayVigilanceMatrix, 
  MultiDayVigilanceDay,
  VigilancePhenomenon
} from '../types/weather';
import { computeMultiDayVigilanceMatrix } from '../services/dailyVigilanceService';

interface MultiDayVigilanceMatrixCardProps {
  station: LocationPoint;
  daily?: DailyForecast[];
  dailyForecasts?: DailyForecast[];
  hourly?: HourlyForecast[];
  hourlyForecasts?: HourlyForecast[];
  currentWeather?: any;
  seniorMode?: boolean;
  simplifiedMode?: boolean;
  tempUnit?: 'C' | 'F';
  onForceRefresh?: () => void;
  nextVigilanceRefreshSeconds?: number;
  lastUpdatedTime?: string;
}

const PHENOMENA_CONFIG: Record<VigilancePhenomenon, { label: string; icon: string; bg: string; text: string; description: string }> = {
  ORAGES: { 
    label: 'Orages & Grêle', 
    icon: '⚡', 
    bg: 'bg-amber-950/40 border-amber-500/40', 
    text: 'text-amber-300',
    description: 'Activité électrique, grêle, rafales convectives et intensités pluvieuses sous cumulonimbus.'
  },
  PLUIE_INONDATION: { 
    label: 'Pluie-Inondation', 
    icon: '🌧️', 
    bg: 'bg-blue-950/40 border-blue-500/40', 
    text: 'text-blue-300',
    description: 'Cumuls de précipitations importants, ruissellements de surface et réactions hydrologiques.'
  },
  VENT_VIOLENT_TORNADE: { 
    label: 'Vent Violent', 
    icon: '💨', 
    bg: 'bg-teal-950/40 border-teal-500/40', 
    text: 'text-teal-300',
    description: 'Rafales de vent tempétueuses, risques de chutes d\'arbres et dégâts aux toitures.'
  },
  NEIGE_VERGLAS: { 
    label: 'Neige & Verglas', 
    icon: '❄️', 
    bg: 'bg-indigo-950/40 border-indigo-500/40', 
    text: 'text-indigo-300',
    description: 'Chutes de neige tenant au sol, dépôts de verglas et pluies verglaçantes glissantes.'
  },
  GRAND_FROID_GEL: { 
    label: 'Grand Froid & Gel', 
    icon: '🧊', 
    bg: 'bg-cyan-950/40 border-cyan-500/40', 
    text: 'text-cyan-300',
    description: 'Températures négatives marquées, ressenti éolien glacial et absence de dégel diurne.'
  },
  CANICULE_CHALEUR: { 
    label: 'Canicule & Chaleur', 
    icon: '🔥', 
    bg: 'bg-rose-950/40 border-rose-500/40', 
    text: 'text-rose-300',
    description: 'Forte chaleur diurne et absence de rafraîchissement nocturne sur plusieurs jours consécutifs.'
  },
  BROUILLARD_GIVRANT: { 
    label: 'Brouillard Givrant', 
    icon: '❄️🌫️', 
    bg: 'bg-slate-800/60 border-slate-600/40', 
    text: 'text-slate-300',
    description: 'Visibilité horizontale inférieure à 200 m avec risque de dépôt de givre et verglas sur les chaussées.'
  },
  BROUILLARD_RAYONNEMENT: { 
    label: 'Brouillard de Rayonnement', 
    icon: '🌫️', 
    bg: 'bg-slate-800/60 border-slate-600/40', 
    text: 'text-slate-300',
    description: 'Refroidissement nocturne radiatif du sol par ciel clair sous anticyclone.'
  },
  BROUILLARD_ADVECTION: { 
    label: 'Brouillard d\'Advection', 
    icon: '🌊🌫️', 
    bg: 'bg-slate-800/60 border-slate-600/40', 
    text: 'text-slate-300',
    description: 'Masse d\'air maritime tiède et humide glissant sur un sol ou une eau froide.'
  },
  BROUILLARD_VALLEE: { 
    label: 'Brouillard de Vallée', 
    icon: '⛰️🌫️', 
    bg: 'bg-slate-800/60 border-slate-600/40', 
    text: 'text-slate-300',
    description: 'Inversion thermique et accumulation d\'air froid et humide dans les fonds de vallée.'
  },
  BROUILLARD_OROGRAPHIQUE: { 
    label: 'Brouillard Orographique', 
    icon: '🏔️🌫️', 
    bg: 'bg-slate-800/60 border-slate-600/40', 
    text: 'text-slate-300',
    description: 'Soulèvement d\'air humide le long des pentes montagneuses condensant en stratus.'
  },
  BROUILLARD_DENSE: { 
    label: 'Brouillard Dense', 
    icon: '🌫️', 
    bg: 'bg-slate-800/60 border-slate-600/40', 
    text: 'text-slate-300',
    description: 'Épaisse nappe de brouillard avec visibilité routière inférieure à 150 mètres.'
  },
  AVALANCHES: { 
    label: 'Avalanches', 
    icon: '🏔️', 
    bg: 'bg-purple-950/40 border-purple-500/40', 
    text: 'text-purple-300',
    description: 'Instabilité du manteau neigeux sur les versants raides en haute et moyenne montagne.'
  },
  CALME: { 
    label: 'Temps Calme', 
    icon: '🟢', 
    bg: 'bg-emerald-950/40 border-emerald-500/40', 
    text: 'text-emerald-300',
    description: 'Aucune vigilance météorologique particulière requise.'
  }
};

const OFFICIAL_PHENOMENA_LIST: VigilancePhenomenon[] = [
  'ORAGES',
  'PLUIE_INONDATION',
  'VENT_VIOLENT_TORNADE',
  'NEIGE_VERGLAS',
  'GRAND_FROID_GEL',
  'CANICULE_CHALEUR',
  'BROUILLARD_GIVRANT',
  'AVALANCHES'
];

export const MultiDayVigilanceMatrixCard: React.FC<MultiDayVigilanceMatrixCardProps> = ({
  station,
  daily,
  dailyForecasts,
  hourly,
  hourlyForecasts,
  seniorMode = false,
  simplifiedMode = false,
  tempUnit = 'C',
  onForceRefresh,
  lastUpdatedTime
}) => {
  const actualDaily = daily || dailyForecasts || [];
  const actualHourly = hourly || hourlyForecasts || [];

  const matrix: MultiDayVigilanceMatrix = React.useMemo(() => {
    return computeMultiDayVigilanceMatrix(station, actualDaily, actualHourly);
  }, [station, actualDaily, actualHourly]);

  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [selectedPhenomenon, setSelectedPhenomenon] = useState<VigilancePhenomenon | null>(null);
  const [viewMode, setViewMode] = useState<'bilan_phenomenes' | 'matrix_overview' | 'day_chronogram' | 'criteria_guide'>('bilan_phenomenes');
  const [selectedCriteriaPhenom, setSelectedCriteriaPhenom] = useState<string>('ORAGES');

  const selectedDay: MultiDayVigilanceDay = matrix.days[selectedDayIndex] || matrix.days[0];
  const activeAlerts: DailyVigilanceAlertItem[] = selectedDay?.alerts || [];

  const isMountainStation = (station.altitude || 0) >= 600 || station.isMountain;

  const getLevelBadge = (level: VigilanceLevel) => {
    switch (level) {
      case 'ROUGE':
        return {
          bg: 'bg-rose-950/80 border-rose-600 text-rose-200',
          dot: 'bg-rose-500',
          badgeBg: 'bg-rose-600 text-white font-bold',
          label: 'VIGILANCE ROUGE — ALERTE ABSOLUE',
          shortLabel: 'ROUGE',
          glow: 'bg-slate-900'
        };
      case 'ORANGE':
        return {
          bg: 'bg-amber-950/80 border-amber-500 text-amber-200',
          dot: 'bg-amber-400',
          badgeBg: 'bg-amber-500 text-slate-950 font-bold',
          label: 'VIGILANCE ORANGE — SOYEZ TRÈS VIGILANT',
          shortLabel: 'ORANGE',
          glow: 'bg-slate-900'
        };
      case 'JAUNE':
        return {
          bg: 'bg-yellow-950/60 border-yellow-500/60 text-yellow-200',
          dot: 'bg-yellow-400',
          badgeBg: 'bg-yellow-400 text-slate-950 font-bold',
          label: 'VIGILANCE JAUNE — SOYEZ ATTENTIF',
          shortLabel: 'JAUNE',
          glow: 'bg-slate-900'
        };
      case 'VERT':
      default:
        return {
          bg: 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300',
          dot: 'bg-emerald-400',
          badgeBg: 'bg-emerald-950 text-emerald-300 border border-emerald-500/40',
          label: 'VIGILANCE VERTE — AUCUN RISQUE MAJEUR',
          shortLabel: 'VERT',
          glow: 'bg-slate-900'
        };
    }
  };

  const activeLevelStyle = getLevelBadge(selectedDay.maxLevel);
  const isCurrentThreatSevere = matrix.currentActiveLevel === 'ORANGE' || matrix.currentActiveLevel === 'ROUGE';

  // Count active non-green vigilances for selected day
  const nonGreenAlerts = activeAlerts.filter(a => a.level !== 'VERT');

  return (
    <div className="space-y-4">
      {/* 1. TOP LIVE VIGILANCE STATUS BANNER */}
      <div className={`rounded-lg border ${
        isCurrentThreatSevere ? 'border-rose-600 bg-slate-900' : 'border-slate-800 bg-slate-900'
      } p-4 sm:p-5`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="flex h-3 w-3 items-center justify-center">
                <span className={`h-2.5 w-2.5 rounded-full ${
                  matrix.currentActiveLevel === 'ROUGE' ? 'bg-rose-500 animate-ping' :
                  matrix.currentActiveLevel === 'ORANGE' ? 'bg-amber-400' :
                  matrix.currentActiveLevel === 'JAUNE' ? 'bg-yellow-400' : 'bg-emerald-400'
                }`} />
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-amber-400" />
                <span>Bilan de Vigilance Météorologique par Risque &amp; par Jour</span>
              </h2>
              <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded border border-sky-500/40 bg-sky-500/10 text-sky-300">
                15 Jours (J à J+14)
              </span>
            </div>
            
            <p className="text-xs sm:text-sm text-slate-400">
              Diagnostic officiel et coordination des 8 risques météo pour <strong className="text-white">{station.name} ({station.department})</strong> — Données consolidées AROME &amp; ECMWF.
            </p>
          </div>

          {/* Sync & Refresh Pill */}
          <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 rounded-md p-2 sm:px-3">
            <div className="text-right">
              <div className="flex items-center justify-end gap-1.5 text-[11px] font-semibold text-slate-300">
                <Clock className="h-3.5 w-3.5 text-sky-400" />
                <span>Niveau Actuel : <strong className={`font-mono px-1.5 py-0.5 rounded text-xs ${getLevelBadge(matrix.currentActiveLevel).badgeBg}`}>{matrix.currentActiveLevel}</strong></span>
              </div>
              <div className="text-[10px] text-slate-400 flex items-center gap-1.5 justify-end mt-0.5">
                <span>Actualisé en direct</span>
                {lastUpdatedTime && <span className="font-mono text-slate-400">({lastUpdatedTime})</span>}
              </div>
            </div>

            {onForceRefresh && (
              <button
                onClick={onForceRefresh}
                title="Actualiser les alertes de vigilance"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-[#0284C7] hover:bg-sky-500 text-white text-xs font-semibold transition cursor-pointer"
              >
                <RefreshCw className="h-3 w-3" />
                <span className="hidden sm:inline">Actualiser</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. CHRONO-CALENDAR STRIP (J+0 À J+14) */}
      <div className="rounded-lg border border-slate-800 bg-slate-900 p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-sky-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              1. Choisissez un Jour pour Consulter son Bilan Détaillé :
            </h3>
          </div>

          {!simplifiedMode && (
            <div className="flex flex-wrap items-center gap-1 bg-slate-950 p-1 rounded-md border border-slate-800 text-xs">
              <button
                onClick={() => setViewMode('bilan_phenomenes')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'bilan_phenomenes' ? 'bg-[#0284C7] text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <ShieldAlert className="h-3.5 w-3.5" />
                <span>Bilan par Risque (Par Jour)</span>
              </button>
              <button
                onClick={() => setViewMode('matrix_overview')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'matrix_overview' ? 'bg-[#0284C7] text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                <span>Matrice Globale 15 Jours</span>
              </button>
              <button
                onClick={() => setViewMode('day_chronogram')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'day_chronogram' ? 'bg-[#0284C7] text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Footprints className="h-3.5 w-3.5" />
                <span>Chronogramme 24h &amp; Outdoor</span>
              </button>
              <button
                onClick={() => setViewMode('criteria_guide')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'criteria_guide' ? 'bg-[#0284C7] text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <HelpCircle className="h-3.5 w-3.5" />
                <span>Guide des Seuils &amp; Consignes</span>
              </button>
            </div>
          )}
        </div>

        {/* Horizontal scrollable Day Tiles */}
        <div className="flex gap-2 overflow-x-auto pb-1 pt-1">
          {matrix.days.map((day, idx) => {
            const isSelected = idx === selectedDayIndex;
            const badge = getLevelBadge(day.maxLevel);
            
            return (
              <button
                key={day.date + idx}
                onClick={() => {
                  setSelectedDayIndex(idx);
                  setSelectedPhenomenon(null);
                }}
                className={`flex-shrink-0 w-24 sm:w-28 rounded-md p-2.5 text-center transition cursor-pointer border ${
                  isSelected 
                    ? 'border-[#0284C7] bg-slate-950' 
                    : 'border-slate-800 bg-slate-950/60 hover:bg-slate-950 hover:border-slate-700'
                }`}
              >
                <div className="text-[10px] font-bold uppercase text-slate-400 truncate">
                  {idx === 0 ? "Aujourd'hui" : idx === 1 ? "Demain" : `J+${idx}`}
                </div>
                <div className="text-xs font-semibold text-slate-200 mt-0.5 truncate">
                  {day.dayLabel.split('(')[1]?.replace(')', '') || day.dayLabel}
                </div>

                {/* Level badge pill */}
                <div className={`mt-1.5 flex items-center justify-center gap-1 rounded py-0.5 px-1.5 text-[10px] font-bold border ${badge.bg}`}>
                  <span>{day.dominantEmoji}</span>
                  <span>{day.maxLevel}</span>
                </div>

                {/* Status indicator */}
                <div className={`mt-1 text-[9px] font-mono font-medium truncate px-1 py-0.5 rounded border ${
                  day.maxLevel === 'VERT' 
                    ? 'text-emerald-300 bg-emerald-950/30 border-emerald-500/30' 
                    : 'text-amber-300 bg-slate-900 border-slate-800'
                }`}>
                  {day.maxLevel === 'VERT' 
                    ? '🟢 24h Calme' 
                    : `${day.alerts.filter(a => a.level !== 'VERT').length} Risque(s)`}
                </div>

                {/* Temp Indicator */}
                <div className="mt-1 text-[11px] font-medium text-slate-300 flex items-center justify-center gap-1">
                  <span className="text-sky-300">{Math.round(day.tempMin)}°</span>
                  <span className="text-slate-600">/</span>
                  <span className="text-amber-300">{Math.round(day.tempMax)}°</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. MAIN VIEW: BILAN VIGILANCE MÉTEO PAR TYPE DE RISQUE (PAR JOUR) */}
      {viewMode === 'bilan_phenomenes' && (
        <div className="space-y-4">
          {/* Day Global Synthesis Card */}
          <div className={`rounded-lg border ${activeLevelStyle.bg} bg-slate-900 p-4 sm:p-5 space-y-4`}>
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-md bg-slate-950 border border-slate-800">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-md bg-slate-900 border border-slate-800 flex items-center justify-center text-sky-400 font-bold shrink-0 text-lg">
                  {selectedDay.dominantEmoji}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-sky-500/10 text-sky-300 border border-sky-500/30">
                      {selectedDayIndex === 0 ? "AUJOURD'HUI" : selectedDayIndex === 1 ? "DEMAIN (J+1)" : `JOURNÉE J+${selectedDayIndex}`}
                    </span>
                    <span className="text-xs text-slate-400">
                      {selectedDay.dayLabel}
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-white mt-0.5">
                    Bilan de Vigilance Météo à <span className="text-sky-300">{station.name}</span> ({station.department})
                  </h3>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className={`px-2.5 py-1 rounded-md border text-xs font-bold flex items-center gap-1.5 ${activeLevelStyle.bg}`}>
                  <span>Niveau Global :</span>
                  <span>{selectedDay.maxLevel}</span>
                </div>
                <div className="px-2.5 py-1 rounded-md border border-slate-800 bg-slate-900 text-slate-300 text-xs font-medium">
                  {nonGreenAlerts.length === 0 
                    ? "🟢 Tous les risques sont au VERT" 
                    : `⚠️ ${nonGreenAlerts.length} type(s) de vigilance actif(s)`}
                </div>
              </div>
            </div>

            {/* Validation & Synthesis Notice */}
            {selectedDay.unifiedSynthesisNotice && (
              <div className="rounded-md border border-slate-800 bg-slate-950 p-3 space-y-1 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-slate-200">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Synthèse &amp; Cohérence Météorologique :</span>
                </div>
                <p className="text-slate-400 leading-relaxed pl-5">
                  {selectedDay.unifiedSynthesisNotice}
                </p>
              </div>
            )}

            {/* GRID OF THE 8 OFFICIAL PHENOMENA */}
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-300">
                <span>Tableau des 8 Risques de Vigilance pour cette journée :</span>
                <span className="text-[11px] text-slate-400 font-normal">Cliquez sur un risque pour afficher ses détails</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {OFFICIAL_PHENOMENA_LIST.map((phenom) => {
                  const isAvalanche = phenom === 'AVALANCHES';
                  const isPlainStation = !isMountainStation;

                  // Match either the exact phenomenon or any specific fog diagnosis
                  const alertItem = selectedDay.alerts.find(a => 
                    a.phenomenon === phenom || 
                    (phenom === 'BROUILLARD_GIVRANT' && a.phenomenon.startsWith('BROUILLARD'))
                  );

                  const cfg = alertItem && PHENOMENA_CONFIG[alertItem.phenomenon]
                    ? PHENOMENA_CONFIG[alertItem.phenomenon]
                    : PHENOMENA_CONFIG[phenom];

                  const displayLabel = alertItem?.phenomenonLabel || cfg.label;
                  const displayIcon = alertItem?.emoji || cfg.icon;

                  // If avalanche for plain station, show plain status
                  const level: VigilanceLevel = (isAvalanche && isPlainStation) 
                    ? 'VERT' 
                    : (alertItem ? alertItem.level : 'VERT');

                  const badge = getLevelBadge(level);
                  const isSelected = selectedPhenomenon === phenom;
                  const isActiveWarning = level !== 'VERT';

                  return (
                    <div
                      key={phenom}
                      onClick={() => setSelectedPhenomenon(isSelected ? null : phenom)}
                      className={`rounded-md p-3 border transition cursor-pointer flex flex-col justify-between space-y-2.5 relative ${
                        isSelected 
                          ? 'bg-slate-950 border-[#0284C7]' 
                          : isActiveWarning
                          ? 'bg-slate-950 border-amber-500/50 hover:border-amber-400'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {/* Top status bar */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl p-1 rounded bg-slate-900 border border-slate-800 shrink-0">
                            {displayIcon}
                          </span>
                          <div>
                            <h4 className="text-xs font-bold text-white leading-tight">
                              {displayLabel}
                            </h4>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              {isAvalanche && isPlainStation ? 'Zone de plaine' : (isActiveWarning ? 'Vigilance en cours' : 'Situation calme')}
                            </p>
                          </div>
                        </div>

                        {/* Level pill */}
                        <div className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${badge.bg} shrink-0`}>
                          {level}
                        </div>
                      </div>

                      {/* Middle description / active hours */}
                      <div className="text-[11px] text-slate-300 leading-relaxed">
                        {isActiveWarning && alertItem ? (
                          <div className="space-y-1 font-medium">
                            <div className="text-amber-300 font-mono font-bold flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{alertItem.eventStartHour || alertItem.startHourFormatted} ➔ {alertItem.eventEndHour || alertItem.endHourFormatted}</span>
                            </div>
                            <p className="text-slate-300 line-clamp-2">{alertItem.message}</p>
                          </div>
                        ) : isAvalanche && isPlainStation ? (
                          <p className="text-slate-500 italic text-[10px]">
                            Non concerné : relief de plaine hors zone avalancheuse ({station.altitude || 130} m).
                          </p>
                        ) : (
                          <p className="text-slate-400 text-[10px]">
                            Aucun risque particulier prévu sur la commune. Conditions stables.
                          </p>
                        )}
                      </div>

                      {/* Bottom action indicator */}
                      <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between text-[10px] font-medium text-slate-400">
                        <span>{isActiveWarning ? 'Consulter détails' : 'Niveau normal'}</span>
                        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isSelected ? 'rotate-180 text-sky-400' : ''}`} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* EXPANDED DETAILS FOR SELECTED PHENOMENON */}
            {selectedPhenomenon && (() => {
              // Match exact or general fog
              const alertItem = selectedDay.alerts.find(a => 
                a.phenomenon === selectedPhenomenon || 
                (selectedPhenomenon === 'BROUILLARD_GIVRANT' && a.phenomenon.startsWith('BROUILLARD'))
              );

              const cfg = alertItem && PHENOMENA_CONFIG[alertItem.phenomenon]
                ? PHENOMENA_CONFIG[alertItem.phenomenon]
                : PHENOMENA_CONFIG[selectedPhenomenon];

              const isAvalanche = selectedPhenomenon === 'AVALANCHES';
              const isPlainStation = !isMountainStation;
              const level: VigilanceLevel = (isAvalanche && isPlainStation) ? 'VERT' : (alertItem ? alertItem.level : 'VERT');
              const badge = getLevelBadge(level);

              const displayLabel = alertItem?.phenomenonLabel || cfg.label;
              const displayIcon = alertItem?.emoji || cfg.icon;

              return (
                <div className="rounded-md border border-slate-800 bg-slate-950 p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl p-1.5 rounded-md bg-slate-900 border border-slate-800">{displayIcon}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">
                            Détails &amp; Consignes : {displayLabel}
                          </h4>
                          <span className={`px-1.5 py-0.5 rounded text-xs font-bold border ${badge.bg}`}>
                            {level}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {selectedDay.dayLabel} à {station.name} ({station.department})
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedPhenomenon(null)}
                      className="px-2 py-1 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 transition cursor-pointer"
                    >
                      Fermer Détails ✕
                    </button>
                  </div>

                  {level !== 'VERT' && alertItem ? (
                    <div className="space-y-3 text-xs">
                      {/* Grid 1: Timing & Instructions */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        {/* Left: Timing and Mechanics */}
                        <div className="space-y-2 bg-slate-900 p-3 rounded-md border border-slate-800">
                          <h5 className="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-amber-400" />
                            Créneau Horaire &amp; Description
                          </h5>
                          <div className="p-2 rounded bg-slate-950 border border-slate-800 text-amber-300 font-mono text-xs">
                            Début : {alertItem.eventStartHour || alertItem.startHourFormatted} • Pic : {alertItem.eventPeakHour || alertItem.peakHourFormatted} • Fin : {alertItem.eventEndHour || alertItem.endHourFormatted}
                          </div>
                          <p className="text-slate-300 leading-relaxed">
                            {alertItem.eventDescription || alertItem.message}
                          </p>
                          {alertItem.severityMetric && (
                            <div className="p-2 rounded bg-slate-950 border border-slate-800 text-slate-300">
                              <strong>Métriques : </strong> <span className="text-amber-300 font-mono">{alertItem.severityMetric}</span>
                            </div>
                          )}
                        </div>

                        {/* Right: Official Safety Instructions */}
                        <div className="space-y-2 bg-slate-900 p-3 rounded-md border border-slate-800">
                          <h5 className="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                            Consignes de Sécurité Officielles
                          </h5>
                          <ul className="space-y-1.5">
                            {alertItem.safetyInstructions.map((inst, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-slate-300">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                <span>{inst}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Specialized Box 1: Local Climatological Adaptation */}
                      {(alertItem.localityProfileName || alertItem.localityClimatologyContext || alertItem.triggerThresholdCriteria) && (
                        <div className="p-3 rounded-md bg-slate-900 border border-slate-800 space-y-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2 text-sky-300 font-semibold">
                              <span>Vigilance Adaptée au Contexte Local : <strong className="text-white">{alertItem.localityProfileName || station.name}</strong></span>
                            </div>
                            {alertItem.triggerThresholdCriteria && (
                              <span className="text-[11px] font-mono bg-slate-950 text-sky-300 px-2 py-0.5 rounded border border-slate-800">
                                {alertItem.triggerThresholdCriteria}
                              </span>
                            )}
                          </div>
                          {alertItem.localityClimatologyContext && (
                            <p className="text-slate-400 text-[11px] leading-relaxed">
                              {alertItem.localityClimatologyContext}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Specialized Box 2: Scientific Fog Diagnosis Details */}
                      {alertItem.fogDiagnosis && (
                        <div className="p-3 rounded-md bg-slate-900 border border-slate-800 space-y-1.5">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2 text-amber-300 font-semibold">
                              <span>Diagnostic Micrométéorologique : {alertItem.fogDiagnosis.label}</span>
                            </div>
                            <span className="text-[11px] bg-slate-950 text-slate-300 px-2 py-0.5 rounded border border-slate-800">
                              Dissipation : ~{alertItem.fogDiagnosis.dissipationExpectedHour}
                            </span>
                          </div>
                          <p className="text-slate-300 text-[11px] leading-relaxed">
                            <strong className="text-slate-200">Mécanisme physique : </strong>{alertItem.fogDiagnosis.scientificMechanism}
                          </p>
                          <p className="text-slate-400 text-[11px]">
                            <strong className="text-slate-300">Conditions favorables : </strong>{alertItem.fogDiagnosis.associatedConditions}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-md bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-1.5">
                      <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        <span>Risque Inexistant ou Inférieur aux Seuils d'Alerte (Niveau VERT)</span>
                      </div>
                      <p className="leading-relaxed text-slate-400">
                        Pour cette journée ({selectedDay.dayLabel}), les paramètres météorologiques prévus pour <strong>{station.name}</strong> restent dans les normes habituelles pour le phénomène <strong>{cfg.label}</strong>. Aucune restriction particulière d'activité n'est requise.
                      </p>
                    </div>
                  )}
                </div>
              );
            })()}

          </div>
        </div>
      )}

      {/* 4. VIEW 2: MATRICE 15 JOURS */}
      {viewMode === 'matrix_overview' && (
        <div className="rounded-lg border border-slate-800 bg-slate-900 p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Matrice Complète des 8 Vigilances Météo (J à J+14)
              </h3>
              <p className="text-xs text-slate-400">
                Visualisation consolidée des risques pour la commune de <strong className="text-white">{station.name}</strong>.
              </p>
            </div>
            <div className="text-xs text-slate-400">
              Département : <strong className="text-white">{station.department}</strong>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                  <th className="py-2.5 px-3 bg-slate-950 sticky left-0 z-20">Type de Vigilance</th>
                  {matrix.days.map((d, i) => (
                    <th key={d.date + i} className="py-2.5 px-2 text-center">
                      <div className="text-[10px] text-slate-400 font-normal">
                        {i === 0 ? "Auj." : i === 1 ? "Dem." : `J+${i}`}
                      </div>
                      <div className="font-semibold text-slate-200">
                        {d.dayLabel.split('(')[1]?.replace(')', '').split(' ')[0] || `J+${i}`}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {OFFICIAL_PHENOMENA_LIST.map((phenom) => {
                  const cfg = PHENOMENA_CONFIG[phenom];
                  const isAvalanche = phenom === 'AVALANCHES';
                  const isPlainStation = !isMountainStation;

                  return (
                    <tr key={phenom} className="hover:bg-slate-800/40 transition">
                      <td className="py-2 px-3 font-medium text-slate-200 bg-slate-950 sticky left-0 z-10 flex items-center gap-1.5 whitespace-nowrap">
                        <span>{cfg.icon}</span>
                        <span>{cfg.label}</span>
                      </td>
                      {matrix.days.map((day, dIdx) => {
                        const alertItem = day.alerts.find(a => a.phenomenon === phenom);
                        const level = (isAvalanche && isPlainStation) ? 'VERT' : (alertItem ? alertItem.level : 'VERT');
                        
                        let bg = 'bg-slate-950 text-slate-600';
                        if (level === 'ROUGE') bg = 'bg-rose-600 text-white font-bold';
                        else if (level === 'ORANGE') bg = 'bg-amber-500 text-slate-950 font-bold';
                        else if (level === 'JAUNE') bg = 'bg-yellow-400 text-slate-950 font-bold';

                        return (
                          <td 
                            key={day.date + phenom + dIdx} 
                            className="py-1.5 px-1 text-center cursor-pointer hover:opacity-80"
                            onClick={() => {
                              setSelectedDayIndex(dIdx);
                              setSelectedPhenomenon(phenom);
                              setViewMode('bilan_phenomenes');
                            }}
                            title={`${cfg.label} - ${day.dayLabel}: ${level}`}
                          >
                            <div className={`mx-auto w-6 h-6 rounded flex items-center justify-center text-[10px] ${bg} transition`}>
                              {level === 'ROUGE' ? '🔴' : level === 'ORANGE' ? '🟠' : level === 'JAUNE' ? '🟡' : '—'}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. VIEW 3: CHRONOGRAMME 24H & PLANNING OUTDOOR */}
      {viewMode === 'day_chronogram' && (
        <div className="rounded-lg border border-slate-800 bg-slate-900 p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <Footprints className="h-4 w-4 text-amber-400" />
                <span>Chronogramme 24h &amp; Sécurité Extérieure ({selectedDay.dayLabel})</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Créneaux conseillés pour sorties, randonnée et activités extérieures à <strong>{station.name}</strong>.
              </p>
            </div>
          </div>

          {/* 4 Time Slots Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
            <div className="p-3.5 rounded-md border bg-slate-950 border-emerald-500/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-white">06h00 ➔ 12h00</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/50">
                  MATINÉE
                </span>
              </div>
              <p className="text-slate-300 leading-tight">
                Période généralement la plus stable de la journée. Températures fraîches.
              </p>
              <div className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/40 p-1 rounded border border-emerald-500/30">
                Sorties Conseillées
              </div>
            </div>

            <div className="p-3.5 rounded-md border bg-slate-950 border-sky-500/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-white">12h00 ➔ 16h00</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-sky-300 border border-sky-500/50">
                  MI-JOURNÉE
                </span>
              </div>
              <p className="text-slate-300 leading-tight">
                Hausse diurne de température. Évolution des nuages et brises locales.
              </p>
              <div className="text-[10px] font-semibold text-sky-300 bg-slate-900 p-1 rounded border border-sky-500/30">
                Activité Normale
              </div>
            </div>

            <div className="p-3.5 rounded-md border bg-slate-950 border-amber-500/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-white">16h00 ➔ 20h00</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-500/50">
                  APRÈS-MIDI / SOIR
                </span>
              </div>
              <p className="text-slate-300 leading-tight">
                Créneau de pic thermique et d'instabilité potentielle en saison chaude.
              </p>
              <div className="text-[10px] font-semibold text-amber-300 bg-amber-950/40 p-1 rounded border border-amber-500/30">
                Surveiller l'Évolution
              </div>
            </div>

            <div className="p-3.5 rounded-md border bg-slate-950 border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-white">20h00 ➔ 24h00</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-slate-300 border border-slate-700">
                  NUIT
                </span>
              </div>
              <p className="text-slate-300 leading-tight">
                Refroidissement nocturne. Baisse du vent et stabilisation atmosphérique.
              </p>
              <div className="text-[10px] font-semibold text-slate-300 bg-slate-900 p-1 rounded border border-slate-800">
                Période Calme
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. VIEW 4: GUIDE DES SEUILS ET CONSIGNES */}
      {viewMode === 'criteria_guide' && (
        <div className="rounded-lg border border-slate-800 bg-slate-900 p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-sky-400" />
                <span>Guide Officiel des Seuils de Vigilance Météo-France &amp; Consignes</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Critères physiques de déclenchement pour <strong>{station.name} ({station.department})</strong>.
              </p>
            </div>
          </div>

          {/* Phenomenon Selector for Thresholds */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'ORAGES', label: '⚡ Orages & Grêle' },
              { id: 'VENT_VIOLENT_TORNADE', label: '💨 Vent & Tempête' },
              { id: 'PLUIE_INONDATION', label: '🌧️ Pluie & Inondation' },
              { id: 'CANICULE_CHALEUR', label: '🔥 Canicule & Chaleur' },
              { id: 'NEIGE_VERGLAS', label: '❄️ Neige & Verglas' },
              { id: 'GRAND_FROID_GEL', label: '🧊 Grand Froid' },
              { id: 'AVALANCHES', label: '🏔️ Avalanches' },
              { id: 'BROUILLARD_GIVRANT', label: '🌫️ Brouillard Givrant' }
            ].map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedCriteriaPhenom(p.id)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition cursor-pointer ${
                  selectedCriteriaPhenom === p.id
                    ? 'bg-[#0284C7] text-white'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Thresholds Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Jaune */}
            <div className="rounded-md border border-yellow-500/50 bg-yellow-950/20 p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-yellow-400 text-slate-950">
                  VIGILANCE JAUNE
                </span>
                <span className="text-[10px] text-yellow-300 font-semibold">Soyez Attentif</span>
              </div>
              <div className="text-xs text-slate-200 space-y-1.5">
                <div>
                  <strong className="text-yellow-300 block mb-0.5">Seuils Déclencheurs :</strong>
                  {selectedCriteriaPhenom === 'ORAGES' && "Orages modérés, activité électrique locale, grêle fine (< 1cm) ou rafales de 60 à 80 km/h."}
                  {selectedCriteriaPhenom === 'VENT_VIOLENT_TORNADE' && "Rafales de 70 à 90 km/h en plaine ou 100 km/h sur les caps exposés."}
                  {selectedCriteriaPhenom === 'PLUIE_INONDATION' && "Cumuls de 30 à 50 mm en 24h ou ruissellements locaux sur sols saturés."}
                  {selectedCriteriaPhenom === 'CANICULE_CHALEUR' && "Pic de chaleur de 1 à 2 jours avec TMax > 34°C et TMin > 20°C sans persistance 72h."}
                  {selectedCriteriaPhenom === 'NEIGE_VERGLAS' && "1 à 3 cm de neige en plaine ou formation de plaques de verglas matinales."}
                  {selectedCriteriaPhenom === 'GRAND_FROID_GEL' && "Gelées de -5°C à -8°C avec dégel en journée."}
                  {selectedCriteriaPhenom === 'AVALANCHES' && "Risque 2 (Limité) à 3 (Marqué) sur l'échelle européenne BERA."}
                  {selectedCriteriaPhenom === 'BROUILLARD_GIVRANT' && "Visibilité < 200m avec température négative."}
                </div>
              </div>
            </div>

            {/* Orange */}
            <div className="rounded-md border border-amber-500 bg-amber-950/30 p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-500 text-slate-950">
                  VIGILANCE ORANGE
                </span>
                <span className="text-[10px] text-amber-300 font-semibold">Soyez Très Vigilant</span>
              </div>
              <div className="text-xs text-slate-200 space-y-1.5">
                <div>
                  <strong className="text-amber-300 block mb-0.5">Seuils Déclencheurs :</strong>
                  {selectedCriteriaPhenom === 'ORAGES' && "Orages violents, grêlons de 2 à 4 cm, rafales de 90 à 120 km/h, pluies torrentielles > 30 à 50 mm/h."}
                  {selectedCriteriaPhenom === 'VENT_VIOLENT_TORNADE' && "Tempête avec rafales de 100 à 120 km/h en plaine ou 130-140 km/h sur le littoral."}
                  {selectedCriteriaPhenom === 'PLUIE_INONDATION' && "Cumuls exceptionnels de 60 à 100 mm en 24h ou crues débordantes."}
                  {selectedCriteriaPhenom === 'CANICULE_CHALEUR' && "Dépassement conjoint des seuils biométéorologiques jour et nuit pendant au moins 3 jours consécutifs."}
                  {selectedCriteriaPhenom === 'NEIGE_VERGLAS' && "5 à 15 cm de neige en plaine ou pluies verglaçantes bloquant la circulation."}
                  {selectedCriteriaPhenom === 'GRAND_FROID_GEL' && "Grand froid durable avec TMin < -10°C à -15°C et journées complètes sans dégel."}
                  {selectedCriteriaPhenom === 'AVALANCHES' && "Risque 4 (Fort) : départs spontanés d'avalanches de grande ampleur."}
                  {selectedCriteriaPhenom === 'BROUILLARD_GIVRANT' && "Brouillard épais généralisé, visibilité < 50m et verglas au sol."}
                </div>
              </div>
            </div>

            {/* Rouge */}
            <div className="rounded-md border border-rose-600 bg-rose-950/40 p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-rose-600 text-white">
                  VIGILANCE ROUGE
                </span>
                <span className="text-[10px] text-rose-300 font-semibold">Vigilance Absolue</span>
              </div>
              <div className="text-xs text-slate-200 space-y-1.5">
                <div>
                  <strong className="text-rose-300 block mb-0.5">Seuils Déclencheurs :</strong>
                  {selectedCriteriaPhenom === 'ORAGES' && "Phénomène orageux historique : rafales > 130 km/h, tornades destructrices, inondations soudaines."}
                  {selectedCriteriaPhenom === 'VENT_VIOLENT_TORNADE' && "Tempête ou ouragan majeur avec rafales généralisées > 130 à 160 km/h."}
                  {selectedCriteriaPhenom === 'PLUIE_INONDATION' && "Pluies diluviennes > 150 à 250 mm/24h (épisode méditerranéen majeur)."}
                  {selectedCriteriaPhenom === 'CANICULE_CHALEUR' && "Canicule extrême record, surmortalité potentielle, températures > 40°C à 44°C."}
                  {selectedCriteriaPhenom === 'NEIGE_VERGLAS' && "Blizzard majeur > 20 à 40 cm en plaine avec congères et paralysie totale."}
                  {selectedCriteriaPhenom === 'GRAND_FROID_GEL' && "Froid polaire extrême, TMin < -20°C."}
                  {selectedCriteriaPhenom === 'AVALANCHES' && "Risque 5 (Très Fort) : menace directe pour les habitations en vallée."}
                  {selectedCriteriaPhenom === 'BROUILLARD_GIVRANT' && "Dépôt de glace massif sur câbles électriques et réseaux routiers."}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
