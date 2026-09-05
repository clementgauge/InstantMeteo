import React, { useState } from 'react';
import { 
  Thermometer, 
  Sliders, 
  RefreshCw, 
  Check, 
  AlertCircle, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  Sparkles,
  Scale
} from 'lucide-react';
import { CurrentWeather, LocationPoint } from '../types/weather';
import { 
  applyDirectTemperatureOffset, 
  clearActiveRecalibration, 
  getActiveRecalibration 
} from '../services/userObservationService';

interface TemperatureReliabilityCalibrationCardProps {
  station: LocationPoint;
  weather?: CurrentWeather;
  currentWeather?: CurrentWeather;
  tempUnit?: 'C' | 'F';
  onRecalibrate?: (newOffset: number) => void;
  onResetRecalibration?: () => void;
  onReset?: () => void;
  defaultExpanded?: boolean;
}

export const TemperatureReliabilityCalibrationCard: React.FC<TemperatureReliabilityCalibrationCardProps> = ({
  station,
  weather: weatherProp,
  currentWeather: currentWeatherProp,
  tempUnit = 'C',
  onRecalibrate,
  onResetRecalibration,
  onReset,
  defaultExpanded = false
}) => {
  const weather = weatherProp || currentWeatherProp!;
  const handleResetAction = onResetRecalibration || onReset;
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);
  const [manualInputTemp, setManualInputTemp] = useState<string>('');
  const [justApplied, setJustApplied] = useState<boolean>(false);

  const activeRecalib = getActiveRecalibration();
  const isCurrentlyCalibrated = !!(activeRecalib && activeRecalib.stationId === station.id && activeRecalib.tempOffset !== 0);
  const activeOffset = isCurrentlyCalibrated ? activeRecalib.tempOffset : (weather.recalibrationOffsetApplied || 0);

  const mm = weather.multiModelRealtime;

  const handleApplyOffset = (offset: number) => {
    applyDirectTemperatureOffset(station.id, station.name, offset, 12);
    if (onRecalibrate) {
      onRecalibrate(offset);
    }
    setJustApplied(true);
    setTimeout(() => setJustApplied(false), 3000);
  };

  const handleApplyManualTemp = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(manualInputTemp.replace(',', '.'));
    if (isNaN(parsed)) return;

    // Base temperature before any current offset
    const rawBaseTemp = weather.temperature - activeOffset;
    const computedOffset = Number((parsed - rawBaseTemp).toFixed(1));
    handleApplyOffset(computedOffset);
    setManualInputTemp('');
  };

  const handleReset = () => {
    clearActiveRecalibration();
    if (handleResetAction) {
      handleResetAction();
    }
  };

  const formatTemp = (celsius?: number) => {
    if (celsius === undefined || isNaN(celsius)) return '--';
    if (tempUnit === 'F') {
      return `${Math.round((celsius * 9/5 + 32) * 10) / 10}°F`;
    }
    return `${celsius > 0 ? '+' : ''}${celsius}°C`;
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl overflow-hidden backdrop-blur">
      {/* Header bar */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex flex-wrap items-center justify-between gap-3 p-3.5 sm:p-4 cursor-pointer hover:bg-slate-800/60 transition select-none"
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Thermometer className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-black text-white">
                Fiabilité Thermométrique &amp; Étalonnage Réel
              </span>
              {isCurrentlyCalibrated ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <Check className="h-3 w-3" />
                  Calibré {activeOffset > 0 ? `+${activeOffset}` : activeOffset}°C
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Consensus Multi-Modèles
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              {mm?.spreadC !== undefined ? (
                <span>Dispersion modèles : <strong>{mm.spreadC}°C</strong> • Comparaison AROME, ECMWF, ICON, GFS</span>
              ) : (
                <span>Ajustement direct selon vos relevés de thermomètre ou station personnelle</span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isCurrentlyCalibrated && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleReset();
              }}
              className="px-2.5 py-1 rounded-lg text-xs font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition"
              title="Réinitialiser le calibrage manuel"
            >
              Réinitialiser
            </button>
          )}
          <button 
            type="button"
            className="p-1 text-slate-400 hover:text-white"
            aria-label={isExpanded ? "Replier" : "Déplier"}
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="p-4 sm:p-5 border-t border-slate-800 space-y-4 bg-slate-950/40">
          {/* Multi-Model Live Comparison */}
          {mm && (
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 font-bold mb-2">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Scale className="h-3.5 w-3.5 text-blue-400" />
                  Température observée par modèle en temps réel à {station.name} :
                </span>
                <span className="text-[11px] text-slate-400">
                  Écart inter-modèles : <strong className="text-amber-300">{mm.spreadC}°C</strong>
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {/* Météo France */}
                <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-2.5">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold mb-1">
                    <span>🇫🇷 Météo-France</span>
                    <span className="text-blue-400 text-[9px]">AROME (1.3km)</span>
                  </div>
                  <div className="text-base font-black text-white">
                    {formatTemp(mm.meteoFrance)}
                  </div>
                </div>

                {/* ECMWF */}
                <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-2.5">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold mb-1">
                    <span>🇪🇺 ECMWF IFS</span>
                    <span className="text-blue-400 text-[9px]">Europe (9km)</span>
                  </div>
                  <div className="text-base font-black text-white">
                    {formatTemp(mm.ecmwf)}
                  </div>
                </div>

                {/* ICON */}
                <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-2.5">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold mb-1">
                    <span>🇩🇪 DWD ICON</span>
                    <span className="text-blue-400 text-[9px]">DWD (13km)</span>
                  </div>
                  <div className="text-base font-black text-white">
                    {formatTemp(mm.icon)}
                  </div>
                </div>

                {/* GFS */}
                <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-2.5">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold mb-1">
                    <span>🇺🇸 NOAA GFS</span>
                    <span className="text-blue-400 text-[9px]">Global (25km)</span>
                  </div>
                  <div className="text-base font-black text-white">
                    {formatTemp(mm.gfs)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Microclimate / Morning Inversion Alert */}
          {mm?.morningInversionEffect ? (
            <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-3 flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-200">
                <strong className="text-amber-300 font-bold">Inversion thermique matinale détectée :</strong>
                <p className="mt-0.5 text-slate-300 text-[11px] leading-relaxed">
                  {mm.morningInversionEffect} Au lever du jour, le refroidissement radiatif nocturne crée de forts gradients thermiques (souvent 1.5°C à 3°C de différence entre votre abri de jardin et la maille régionale).
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-3 flex items-start gap-2.5">
              <Sparkles className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-300 leading-relaxed text-[11px]">
                <strong>Précision du thermomètre réel :</strong> Si votre thermomètre ou station météo personnelle relève un écart (ex: +2°C ce matin dû à une exposition spécifique ou microclimat), vous pouvez l'appliquer ci-dessous en 1 clic pour calibrer l'application sur votre mesure exacte.
              </div>
            </div>
          )}

          {/* Quick 1-Click Calibration Buttons */}
          <div>
            <div className="text-xs font-bold text-slate-300 mb-2 flex items-center justify-between">
              <span>Ajustement rapide du décalage observé :</span>
              {justApplied && (
                <span className="text-emerald-400 font-bold text-[11px] flex items-center gap-1 animate-pulse">
                  <Check className="h-3.5 w-3.5" /> Calibrage appliqué !
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { label: '-2°C', val: -2.0 },
                { label: '-1°C', val: -1.0 },
                { label: '+1°C', val: 1.0 },
                { label: '+2°C (ex: relevé matinal)', val: 2.0 },
                { label: '+3°C', val: 3.0 }
              ].map(btn => (
                <button
                  key={btn.val}
                  onClick={() => handleApplyOffset(btn.val)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    activeOffset === btn.val && isCurrentlyCalibrated
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                      : 'bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-700'
                  }`}
                >
                  {btn.label}
                  {activeOffset === btn.val && isCurrentlyCalibrated && <Check className="h-3 w-3" />}
                </button>
              ))}
            </div>
          </div>

          {/* Manual exact temperature input */}
          <form onSubmit={handleApplyManualTemp} className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-3">
            <div className="text-xs text-slate-400 font-medium">
              Ou entrez votre température exacte relevée :
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="ex: 21.5"
                value={manualInputTemp}
                onChange={(e) => setManualInputTemp(e.target.value)}
                className="w-24 rounded-lg bg-slate-900 border border-slate-700 px-2.5 py-1 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 font-mono text-center"
              />
              <span className="text-xs text-slate-400 font-bold">°C</span>
              <button
                type="submit"
                className="px-3 py-1 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition"
              >
                Calibrer
              </button>
            </div>
          </form>

          {/* Calibration expiration info */}
          {isCurrentlyCalibrated && activeRecalib && (
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-slate-400" />
                Calibrage actif pendant 12 heures (recalcule automatiquement à l'échéance).
              </span>
              <button
                onClick={handleReset}
                className="text-rose-400 hover:text-rose-300 font-bold underline"
              >
                Annuler et revenir au modèle brut
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
