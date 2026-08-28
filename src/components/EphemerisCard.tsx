import React from 'react';
import { CurrentWeather } from '../types/weather';
import { 
  Sun, 
  Moon, 
  Sunrise, 
  Sunset, 
  Clock, 
  Compass, 
  Sparkles, 
  Flame, 
  ArrowUpRight, 
  Waves,
  Calendar
} from 'lucide-react';

interface EphemerisCardProps {
  weather: CurrentWeather;
  seniorMode: boolean;
}

export const EphemerisCard: React.FC<EphemerisCardProps> = ({ weather, seniorMode }) => {
  const eph = weather.solarEphemeris;
  const moon = weather.moonPhase;

  if (!eph || !moon) return null;

  return (
    <div id="ephemeris-astronomy-card" className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl backdrop-blur">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Sun className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base sm:text-lg">
              Éphéméride Solaire & Astronomie
            </h3>
            <p className="text-xs text-slate-400">
              Heures solaires locales, durée du jour et cycle lunaire synodique
            </p>
          </div>
        </div>
        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-bold text-slate-300">
          Midi solaire : {eph.solarNoon}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Solar Section */}
        <div className="rounded-2xl bg-slate-950 p-5 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <Sun className="h-4 w-4" />
              <span>Cycle Diurne du Soleil</span>
            </div>
            <span className="text-xs font-bold text-amber-300">
              {eph.dayLengthChangeMinutes > 0 ? `+${eph.dayLengthChangeMinutes} min/j` : `${eph.dayLengthChangeMinutes} min/j`}
            </span>
          </div>

          {/* Sunrise / Sunset visual bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                <Sunrise className="h-4 w-4" />
                <span>Lever : {eph.sunrise}</span>
              </div>
              <div className="font-bold text-slate-200">
                Durée : {eph.dayLengthFormatted}
              </div>
              <div className="flex items-center gap-1.5 text-orange-400 font-bold">
                <Sunset className="h-4 w-4" />
                <span>Coucher : {eph.sunset}</span>
              </div>
            </div>

            {/* Sun progress bar */}
            <div className="h-3 w-full rounded-full bg-slate-800 p-0.5 overflow-hidden relative">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-500 transition-all duration-500"
                style={{ width: `${eph.sunProgressPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Aube : {eph.civilTwilightBegin}</span>
              <span>Progression : {eph.sunProgressPercent}%</span>
              <span>Crépuscule : {eph.civilTwilightEnd}</span>
            </div>
          </div>

          {/* Solar details grid */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800/80 text-xs">
            <div className="rounded-xl bg-slate-900/80 p-2.5 border border-slate-800/60">
              <div className="text-slate-400 text-[10px]">Élévation solaire max</div>
              <div className="font-bold text-white text-sm mt-0.5">{eph.maxSolarElevationDeg}°</div>
            </div>
            <div className="rounded-xl bg-slate-900/80 p-2.5 border border-slate-800/60">
              <div className="text-slate-400 text-[10px]">Rayonnement théorique</div>
              <div className="font-bold text-white text-sm mt-0.5">{eph.solarRadiationKwhM2} kWh/m²</div>
            </div>
          </div>
        </div>

        {/* Lunar Section */}
        <div className="rounded-2xl bg-slate-950 p-5 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider">
              <Moon className="h-4 w-4" />
              <span>Phase & Cycle de la Lune</span>
            </div>
            <span className="rounded-lg bg-indigo-950/80 px-2 py-0.5 text-xs font-bold text-indigo-300 border border-indigo-800/50">
              {moon.illuminationPercent}% éclairée
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-indigo-950/50 border border-indigo-500/30 text-indigo-200 text-2xl shadow-lg">
              {moon.phaseCode === 'full_moon' ? '🌕' : moon.phaseCode === 'new_moon' ? '🌑' : moon.phaseCode.includes('crescent') ? '🌙' : '🌓'}
            </div>
            <div>
              <div className="font-bold text-white text-base">{moon.phaseName}</div>
              <div className="text-xs text-slate-400 mt-0.5">
                Âge de la lune : <strong className="text-slate-200">{moon.moonAgeDays} jours</strong> • Constellation : <strong className="text-indigo-300">{moon.moonSign}</strong>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800/80 text-xs">
            <div className="rounded-xl bg-slate-900/80 p-2.5 border border-slate-800/60">
              <div className="text-slate-400 text-[10px] flex items-center gap-1">
                <Waves className="h-3 w-3 text-cyan-400" />
                <span>Régime de Marées</span>
              </div>
              <div className="font-bold text-cyan-300 text-xs mt-1 truncate">{moon.tideType}</div>
            </div>
            <div className="rounded-xl bg-slate-900/80 p-2.5 border border-slate-800/60">
              <div className="text-slate-400 text-[10px]">Visibilité nocturne</div>
              <div className="font-bold text-white text-xs mt-1">
                {moon.illuminationPercent > 60 ? 'Ciel très lumineux' : 'Ciel propice aux étoiles'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
