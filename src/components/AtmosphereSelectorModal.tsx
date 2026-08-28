import React from 'react';
import { 
  Sun, 
  Moon, 
  Sunrise, 
  Sunset, 
  Sparkles, 
  Leaf, 
  Snowflake, 
  Compass, 
  Clock, 
  Calendar, 
  Check, 
  X, 
  RotateCcw, 
  Info,
  Flame,
  CloudSun
} from 'lucide-react';
import { TimeOfDay, Season, AtmosphereMode, AtmosphereThemeConfig } from '../types/atmosphere';
import { LocationPoint } from '../types/weather';
import { computeEphemeris, ATMOSPHERE_THEMES } from '../utils/atmosphereTheme';

interface AtmosphereSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStation: LocationPoint;
  atmosphereMode: AtmosphereMode;
  onSetAtmosphereMode: (mode: AtmosphereMode) => void;
  selectedTimeOfDay: TimeOfDay;
  onSelectTimeOfDay: (time: TimeOfDay) => void;
  selectedSeason: Season;
  onSelectSeason: (season: Season) => void;
  currentTheme: AtmosphereThemeConfig;
  autoTimeOfDay: TimeOfDay;
  autoSeason: Season;
  isChristmasActive?: boolean;
  onTriggerCode?: (code: string) => boolean;
}

export const AtmosphereSelectorModal: React.FC<AtmosphereSelectorModalProps> = ({
  isOpen,
  onClose,
  currentStation,
  atmosphereMode,
  onSetAtmosphereMode,
  selectedTimeOfDay,
  onSelectTimeOfDay,
  selectedSeason,
  onSelectSeason,
  currentTheme,
  autoTimeOfDay,
  autoSeason,
  isChristmasActive = false,
  onTriggerCode,
}) => {
  if (!isOpen) return null;

  const now = new Date();
  const ephemeris = computeEphemeris(now, currentStation.latitude, currentStation.longitude);

  const timesOfDay: { id: TimeOfDay; label: string; icon: any; timeRange: string; desc: string }[] = [
    { id: 'DAWN', label: 'Aube & Aurore', icon: Sunrise, timeRange: '05h30 - 08h30', desc: 'Lueurs douces matinales, rosée et éveil' },
    { id: 'DAY', label: 'Plein Jour & Zénith', icon: Sun, timeRange: '08h30 - 19h30', desc: 'Ciel azuré, clarté vive et lumière franche' },
    { id: 'DUSK', label: 'Crépuscule & Coucher', icon: Sunset, timeRange: '19h30 - 22h00', desc: 'Couleurs flamboyantes pourpres et dorées' },
    { id: 'NIGHT', label: 'Nuit & Voie Lactée', icon: Moon, timeRange: '22h00 - 05h30', desc: 'Voûte étoilée sombre, calme et aurores' },
  ];

  const seasons: { id: Season; label: string; icon: any; months: string; desc: string }[] = [
    { id: 'SPRING', label: 'Printemps', icon: Leaf, months: 'Mars - Mai', desc: 'Teintes émeraude, rosée fraîche et floraisons' },
    { id: 'SUMMER', label: 'Été', icon: Flame, months: 'Juin - Août', desc: 'Soleil ardent, ciel azur profond et chaleur dorée' },
    { id: 'AUTUMN', label: 'Automne', icon: Sparkles, months: 'Sept. - Nov.', desc: 'Teintes ambrées, cuivrées et brumes de vallée' },
    { id: 'WINTER', label: 'Hiver', icon: Snowflake, months: 'Déc. - Fév.', desc: 'Bleu acier pur, givre cristallin et lueurs polaires' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-700 bg-slate-900/95 p-6 shadow-2xl text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
              <Sparkles className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                Atmosphère & Fond Dynamique
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                  {currentStation.name}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Design et éclairage ambiant adaptatif selon le moment du jour et la saison
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Mode Switch: Auto vs Custom */}
        <div className="my-5 p-1 bg-slate-950 rounded-2xl border border-slate-800 flex gap-2">
          <button
            onClick={() => onSetAtmosphereMode('AUTO')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition ${
              atmosphereMode === 'AUTO'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="h-4 w-4" />
            <span>Mode Automatique (Heure Réelle & Saison)</span>
          </button>
          <button
            onClick={() => onSetAtmosphereMode('CUSTOM')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition ${
              atmosphereMode === 'CUSTOM'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            <span>Mode Libre / Découverte Personnalisée</span>
          </button>
        </div>

        {/* Current Active Theme Highlight Banner */}
        <div 
          className="rounded-2xl p-4 border mb-5 transition-all duration-500 relative overflow-hidden"
          style={{
            borderColor: currentTheme.glowAccentColor,
            background: `linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))`
          }}
        >
          <div className="flex items-center justify-between relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-md border ${currentTheme.badgeStyle.bg} ${currentTheme.badgeStyle.text} ${currentTheme.badgeStyle.border}`}>
                  {currentTheme.skyToneLabel}
                </span>
                {atmosphereMode === 'AUTO' && (
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                    ● En direct de la station
                  </span>
                )}
              </div>
              <h3 className="text-base font-black text-white">{currentTheme.name}</h3>
              <p className="text-xs text-slate-300 mt-0.5">{currentTheme.subtitle}</p>
            </div>
            <div 
              className="h-12 w-12 rounded-2xl border flex items-center justify-center shadow-lg"
              style={{
                borderColor: currentTheme.glowAccentColor,
                backgroundColor: `${currentTheme.glowAccentColor}25`
              }}
            >
              <Sun className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        {/* Ephemeris Bar */}
        <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-4 mb-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
              <Compass className="h-3.5 w-3.5 text-blue-400" />
              Éphémérides Solaires du Jour ({currentStation.name})
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              Élévation : {ephemeris.sunElevationDeg}°
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Lever</span>
              <span className="font-black text-amber-400 font-mono">{ephemeris.sunrise}</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Midi Solaire</span>
              <span className="font-black text-yellow-300 font-mono">{ephemeris.solarNoon}</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Coucher</span>
              <span className="font-black text-rose-400 font-mono">{ephemeris.sunset}</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Durée du Jour</span>
              <span className="font-black text-indigo-300 font-mono">{ephemeris.dayLengthFormatted}</span>
            </div>
          </div>
        </div>

        {/* Time of Day Chooser */}
        <div className="mb-5">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
            1. Moment de la Journée
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {timesOfDay.map((t) => {
              const Icon = t.icon;
              const isSelected = (atmosphereMode === 'AUTO' ? autoTimeOfDay : selectedTimeOfDay) === t.id;
              const isRealNow = autoTimeOfDay === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    onSetAtmosphereMode('CUSTOM');
                    onSelectTimeOfDay(t.id);
                  }}
                  className={`flex items-start gap-3 p-3 rounded-2xl border text-left transition relative ${
                    isSelected
                      ? 'bg-slate-800/90 border-blue-500 text-white shadow-md'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className={`p-2 rounded-xl ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-black truncate">{t.label}</span>
                      {isRealNow && (
                        <span className="text-[9px] font-bold text-amber-400 bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-500/30">
                          Heure actuelle
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono block">{t.timeRange}</span>
                    <span className="text-[11px] text-slate-400 line-clamp-1">{t.desc}</span>
                  </div>
                  {isSelected && (
                    <div className="h-5 w-5 rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Season Chooser */}
        <div className="mb-6">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
            2. Saison Météorologique
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {seasons.map((s) => {
              const Icon = s.icon;
              const isSelected = (atmosphereMode === 'AUTO' ? autoSeason : selectedSeason) === s.id;
              const isRealNow = autoSeason === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => {
                    onSetAtmosphereMode('CUSTOM');
                    onSelectSeason(s.id);
                  }}
                  className={`flex items-start gap-3 p-3 rounded-2xl border text-left transition relative ${
                    isSelected
                      ? 'bg-slate-800/90 border-purple-500 text-white shadow-md'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className={`p-2 rounded-xl ${isSelected ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-black truncate">{s.label}</span>
                      {isRealNow && (
                        <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-500/30">
                          Saison en cours
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 block">{s.months}</span>
                    <span className="text-[11px] text-slate-400 line-clamp-1">{s.desc}</span>
                  </div>
                  {isSelected && (
                    <div className="h-5 w-5 rounded-full bg-purple-600 flex items-center justify-center text-white shrink-0">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Special Holiday / Event Section */}
        <div className="mb-6 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Événement Spécial : Féerie de Noël
              </span>
            </div>
            {isChristmasActive ? (
              <span className="text-[10px] bg-rose-900/60 text-rose-300 px-2 py-0.5 rounded-full border border-rose-700/60 font-bold">
                Actif ❄️
              </span>
            ) : (
              <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700 font-bold">
                24 &amp; 25 Décembre (Automatique)
              </span>
            )}
          </div>
          
          <p className="text-xs text-slate-300 leading-relaxed">
            L'événement féerique de Noël s'active <strong>automatiquement les 24 et 25 décembre de chaque année</strong> avec un ciel nocturne rouge carmin, des lueurs dorées et une chute de flocons de neige.
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            {!isChristmasActive ? (
              <button
                type="button"
                onClick={() => onTriggerCode?.('noel')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Tester le thème Noël (« noel »)</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onTriggerCode?.('clear')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950 hover:bg-rose-900 border border-rose-600/60 text-rose-200 font-black text-xs transition cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
                <span>Désactiver l'événement (« clear »)</span>
              </button>
            )}
            <span className="text-[11px] text-slate-400 italic">
              Vous pouvez aussi taper « clear » dans la barre latérale gauche.
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            onClick={() => {
              onSetAtmosphereMode('AUTO');
              onSelectTimeOfDay(autoTimeOfDay);
              onSelectSeason(autoSeason);
            }}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Réinitialiser en Temps Réel</span>
          </button>
          
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition"
          >
            Appliquer & Fermer
          </button>
        </div>

      </div>
    </div>
  );
};
