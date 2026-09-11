import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  RotateCcw, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Activity, 
  Radio, 
  Clock, 
  ShieldCheck,
  Edit3
} from 'lucide-react';
import { LocationPoint } from '../types/weather';
import { 
  getActiveContradiction, 
  computeIntenseRegenerationState, 
  cancelContradiction, 
  IntenseRegenerationState 
} from '../services/liveContradictionService';

interface IntenseRegenerationBannerProps {
  station: LocationPoint;
  tempUnit?: 'C' | 'F';
  onOpenContradictionModal: () => void;
  onStateChanged: () => void;
}

export const IntenseRegenerationBanner: React.FC<IntenseRegenerationBannerProps> = ({
  station,
  tempUnit = 'C',
  onOpenContradictionModal,
  onStateChanged
}) => {
  const [regenState, setRegenState] = useState<IntenseRegenerationState | null>(null);
  const [showLogs, setShowLogs] = useState<boolean>(false);

  // Poll state every second while active
  useEffect(() => {
    const update = () => {
      const active = getActiveContradiction(station.id);
      if (active) {
        const state = computeIntenseRegenerationState(active);
        setRegenState(state);
      } else {
        setRegenState(null);
      }
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [station.id]);

  if (!regenState) return null;

  const { report, secondsRemaining, progressPercent, currentPhaseText, logs } = regenState;
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const handleCancel = () => {
    cancelContradiction(station.id);
    setRegenState(null);
    onStateChanged();
  };

  return (
    <div className="w-full rounded-2xl bg-gradient-to-r from-amber-950/90 via-orange-950/80 to-slate-900/90 border border-amber-500/50 shadow-xl backdrop-blur-md p-3.5 sm:p-4 text-white transition-all duration-300 relative overflow-hidden">
      {/* Top glowing line */}
      <div 
        className="absolute top-0 left-0 h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 transition-all duration-1000"
        style={{ width: `${progressPercent}%` }}
      />

      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300">
            <Zap className="h-5 w-5 animate-pulse" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs sm:text-sm font-black tracking-tight text-white flex items-center gap-1.5">
                <span>Régénération Haute Intensité Active</span>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/30 text-[10px] font-black text-amber-300">
                Temps Rectifié : {report.observedWeatherDesc}
              </span>
            </div>

            <p className="text-[11px] text-amber-200/80 truncate mt-0.5">
              {currentPhaseText}
            </p>
          </div>
        </div>

        {/* Timer, Progress & Controls */}
        <div className="flex items-center gap-2 ml-auto shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/40 border border-amber-500/30 text-amber-300 font-mono font-black text-xs">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>{formattedTime}</span>
          </div>

          <button
            onClick={() => setShowLogs(!showLogs)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition cursor-pointer"
            title="Détails scientifiques de la recalibration"
          >
            <Activity className="w-3 h-3 text-sky-400" />
            <span className="hidden sm:inline">Diagnostic</span>
            {showLogs ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          <button
            onClick={onOpenContradictionModal}
            className="p-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 transition cursor-pointer"
            title="Ajuster le signalement"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleCancel}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-200 border border-slate-700 hover:border-rose-500/50 text-xs font-bold transition cursor-pointer"
            title="Rétablir les données brutes du modèle"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden md:inline">Modèle initial</span>
          </button>
        </div>
      </div>

      {/* Collapsible Scientific Traceability Logs */}
      {showLogs && (
        <div className="mt-3 pt-3 border-t border-amber-500/20 text-xs space-y-1.5">
          <div className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Journal d’assimilation météorologique en direct ({station.name}) :</span>
          </div>
          <div className="bg-slate-950/70 rounded-xl p-2.5 border border-slate-800 font-mono text-[10px] space-y-1 max-h-36 overflow-y-auto">
            {logs.map((log, i) => (
              <div key={i} className="flex items-start gap-2 text-slate-300">
                <span className="text-amber-400 font-bold shrink-0">{log.time}</span>
                <span className="text-sky-400 font-semibold shrink-0">[{log.source}]</span>
                <span className="text-slate-200">{log.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
