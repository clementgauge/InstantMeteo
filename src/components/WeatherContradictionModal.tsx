import React, { useState } from 'react';
import { 
  AlertTriangle, 
  X, 
  Sun, 
  CloudSun, 
  Cloud, 
  CloudRain, 
  CloudLightning, 
  Snowflake, 
  CloudFog, 
  Zap, 
  Sparkles, 
  Flame, 
  CheckCircle2, 
  Thermometer, 
  Radio,
  Clock,
  Activity
} from 'lucide-react';
import { LocationPoint, CurrentWeather } from '../types/weather';
import { startIntenseRegeneration } from '../services/liveContradictionService';

interface WeatherContradictionModalProps {
  isOpen: boolean;
  onClose: () => void;
  station: LocationPoint;
  currentWeather: CurrentWeather;
  tempUnit?: 'C' | 'F';
  onRegenerationStarted: () => void;
}

const WEATHER_OPTIONS = [
  {
    code: 0,
    label: 'Grand Soleil / Plein Ciel Bleu',
    sub: 'Aucun nuage significatif, franc soleil',
    icon: Sun,
    color: 'text-amber-400 bg-amber-400/10 border-amber-400/30'
  },
  {
    code: 2,
    label: 'Éclaircies & Nuages Épars',
    sub: 'Soleil dominant entrecoupé de cumulus',
    icon: CloudSun,
    color: 'text-amber-300 bg-amber-300/10 border-amber-300/30'
  },
  {
    code: 3,
    label: 'Ciel Couvert / Très Gris',
    sub: 'Ciel bouché, plafond nuageux bas sans pluie',
    icon: Cloud,
    color: 'text-slate-300 bg-slate-400/10 border-slate-400/30'
  },
  {
    code: 61,
    label: 'Pluie / Averses en cours',
    sub: 'Précipitations actives ou bruine continue',
    icon: CloudRain,
    color: 'text-sky-400 bg-sky-400/10 border-sky-400/30'
  },
  {
    code: 95,
    label: 'Orage / Activité Convective',
    sub: 'Tonnerre, éclairs, bourrasques ou forte averse',
    icon: CloudLightning,
    color: 'text-purple-400 bg-purple-400/10 border-purple-400/30'
  },
  {
    code: 71,
    label: 'Neige / Grésil',
    sub: 'Flocons en suspension ou sol blanchissant',
    icon: Snowflake,
    color: 'text-cyan-300 bg-cyan-300/10 border-cyan-300/30'
  },
  {
    code: 45,
    label: 'Brouillard Dense',
    sub: 'Visibilité inférieure à 500m',
    icon: CloudFog,
    color: 'text-indigo-300 bg-indigo-300/10 border-indigo-300/30'
  }
];

export const WeatherContradictionModal: React.FC<WeatherContradictionModalProps> = ({
  isOpen,
  onClose,
  station,
  currentWeather,
  tempUnit = 'C',
  onRegenerationStarted
}) => {
  const [selectedCode, setSelectedCode] = useState<number>(0);
  const [tempAdjust, setTempAdjust] = useState<number>(0);
  const [customTemp, setCustomTemp] = useState<string>('');
  const [durationMinutes, setDurationMinutes] = useState<number>(3);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentT = currentWeather.temperature;
  const estimatedT = customTemp !== '' && !isNaN(Number(customTemp))
    ? Number(customTemp)
    : Math.round((currentT + tempAdjust) * 10) / 10;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const exactT = customTemp !== '' && !isNaN(Number(customTemp)) ? Number(customTemp) : undefined;
      const durationSec = durationMinutes * 60;

      await startIntenseRegeneration(
        station,
        selectedCode,
        tempAdjust,
        exactT,
        comment,
        durationSec
      );

      onRegenerationStarted();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-xl rounded-3xl bg-[#0c1427] border border-amber-500/40 shadow-2xl p-5 sm:p-7 text-white overflow-hidden transition-all duration-300 my-auto"
        role="dialog"
        aria-modal="true"
      >
        {/* Background ambient decorative glow */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer border border-slate-700/60"
          aria-label="Fermer la fenêtre"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-3.5 mb-5 pr-8">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 shadow-inner">
            <Zap className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
                Contredire la Météo en Direct
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-[10px] font-black text-amber-300 tracking-wide uppercase">
                Régénération Intense
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Le modèle numérique s’écarte de la réalité à <strong className="text-amber-300">{station.name}</strong> ? 
              Signalez le temps réel pour déclencher une <strong>recalibration profonde de plusieurs minutes</strong> et rectifier immédiatement l’anomalie.
            </p>
          </div>
        </div>

        {/* Current modeled status vs reality reminder */}
        <div className="mb-5 p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Actuellement calculé par le modèle :</span>
            <span className="font-bold text-slate-200">
              {currentWeather.weatherDescription} • {currentWeather.temperature}°{tempUnit} (ressenti {currentWeather.feelsLike}°{tempUnit})
            </span>
          </div>
          <div className="shrink-0 px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700 text-[10px] font-bold text-slate-300">
            Station {station.name}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Step 1: Real Observed Weather */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
              1. Que constatez-vous réellement dehors ?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
              {WEATHER_OPTIONS.map(opt => {
                const isSelected = selectedCode === opt.code;
                const Icon = opt.icon;
                return (
                  <button
                    type="button"
                    key={opt.code}
                    onClick={() => setSelectedCode(opt.code)}
                    className={`flex items-center gap-3 p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-400 text-white ring-2 ring-amber-400/40 shadow-lg'
                        : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className={`p-2 rounded-xl border ${opt.color} shrink-0`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate text-white">{opt.label}</div>
                      <div className="text-[10px] text-slate-400 truncate">{opt.sub}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Temperature correction */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                <span>2. Rectifier la température constatée</span>
              </label>
              <span className="text-sm font-black text-amber-300">
                T° rectifiée : {estimatedT}°{tempUnit}
              </span>
            </div>

            {/* Quick offset buttons */}
            <div className="grid grid-cols-5 gap-1.5 text-xs font-bold">
              {[
                { label: '-3°C', val: -3 },
                { label: '-1.5°C', val: -1.5 },
                { label: 'Exacte (0)', val: 0 },
                { label: '+1.5°C', val: 1.5 },
                { label: '+3°C', val: 3 },
              ].map(item => (
                <button
                  type="button"
                  key={item.label}
                  onClick={() => {
                    setTempAdjust(item.val);
                    setCustomTemp('');
                  }}
                  className={`py-1.5 rounded-xl border text-center transition cursor-pointer ${
                    tempAdjust === item.val && customTemp === ''
                      ? 'bg-blue-600 text-white border-blue-400 font-black'
                      : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Or direct specific number */}
            <div className="flex items-center gap-2 pt-1 text-xs">
              <span className="text-slate-400 text-[11px]">Ou saisir le thermomètre exact :</span>
              <input
                type="number"
                step="0.5"
                placeholder={`${currentT}°C`}
                value={customTemp}
                onChange={(e) => setCustomTemp(e.target.value)}
                className="w-24 px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold text-center focus:border-amber-400 focus:outline-none"
              />
              <span className="text-slate-400">°{tempUnit}</span>
            </div>
          </div>

          {/* Step 3: Intensity & Duration */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-amber-950/20 border border-amber-500/20 text-xs">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-400 animate-pulse" />
              <div>
                <span className="font-bold text-amber-200 block">Mode Haute Intensité Développé</span>
                <span className="text-[10px] text-slate-400">Scan continu AROME 1.3km, satellite MSG et radar Doppler</span>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="bg-slate-900 border border-slate-700 rounded-xl px-2 py-1 text-xs font-bold text-amber-300 focus:outline-none"
              >
                <option value={2}>Pendant 2 minutes</option>
                <option value={3}>Pendant 3 minutes (recommandé)</option>
                <option value={5}>Pendant 5 minutes (intense)</option>
                <option value={10}>Pendant 10 minutes (maximum)</option>
              </select>
            </div>
          </div>

          {/* Submit CTA */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition cursor-pointer disabled:opacity-50"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>{isSubmitting ? 'Lancement...' : 'Valider & Lancer la Régénération Intense'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
