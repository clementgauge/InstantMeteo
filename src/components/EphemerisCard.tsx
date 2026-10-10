import React from 'react';
import { CurrentWeather } from '../types/weather';
import { 
  Sun, 
  Moon, 
  Sunrise, 
  Sunset, 
  Waves
} from 'lucide-react';

interface EphemerisCardProps {
  weather: CurrentWeather;
  seniorMode: boolean;
}

export const EphemerisCard: React.FC<EphemerisCardProps> = ({ weather }) => {
  const eph = weather.solarEphemeris;
  const moon = weather.moonPhase;

  if (!eph || !moon) return null;

  return (
    <div id="ephemeris-astronomy-card" className="rounded-xl border border-slate-800/90 bg-[#0a1220]/95 p-5 shadow-md flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 border-b border-slate-800/80 pb-3.5 mb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-400 font-medium">
            <Sun className="h-3.5 w-3.5 shrink-0" />
            <span>Calcul astronomique Jean Meeus</span>
          </div>
          <h3 className="font-bold text-white text-base tracking-tight mt-0.5">
            Éphéméride Solaire &amp; Cycle Lunaire
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Heures solaires vraies, crépuscules civils et révolution synodique
          </p>
        </div>
        <span className="text-xs font-mono tabular-nums font-semibold text-slate-300 shrink-0">
          Midi solaire {eph.solarNoon}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-800/80">
        {/* Solar Section */}
        <div className="space-y-3.5 pt-2 md:pt-0 md:pr-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-400">
              Cycle diurne du Soleil
            </span>
            <span className="text-xs font-mono tabular-nums font-semibold text-emerald-400">
              {eph.dayLengthChangeMinutes > 0 ? `+${eph.dayLengthChangeMinutes} min/j` : `${eph.dayLengthChangeMinutes} min/j`}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-mono tabular-nums">
              <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
                <Sunrise className="h-3.5 w-3.5" />
                <span>{eph.sunrise}</span>
              </div>
              <div className="font-semibold text-white">
                {eph.dayLengthFormatted}
              </div>
              <div className="flex items-center gap-1.5 text-orange-300 font-semibold">
                <Sunset className="h-3.5 w-3.5" />
                <span>{eph.sunset}</span>
              </div>
            </div>

            <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden relative">
              <div
                className="h-full bg-amber-400 transition-transform duration-200 origin-left"
                style={{ width: `${eph.sunProgressPercent}%` }}
              />
            </div>

            <div className="flex justify-between text-[11px] text-slate-400 font-mono tabular-nums">
              <span>Aube {eph.civilTwilightBegin}</span>
              <span>{eph.sunProgressPercent}%</span>
              <span>Crépuscule {eph.civilTwilightEnd}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 divide-x divide-slate-800/80 pt-3 border-t border-slate-800/80 text-xs">
            <div className="pr-2">
              <div className="text-slate-400 text-[11px]">Élévation max</div>
              <div className="font-bold text-white font-mono tabular-nums mt-0.5">
                {eph.currentSolarElevationDeg !== undefined ? `${eph.currentSolarElevationDeg}° / ` : ''}{eph.maxSolarElevationDeg}°
              </div>
            </div>
            <div className="px-2">
              <div className="text-slate-400 text-[11px]">Heure dorée</div>
              <div className="font-bold text-amber-300 font-mono tabular-nums mt-0.5">{eph.goldenHourEvening || eph.sunset}</div>
            </div>
            <div className="pl-2">
              <div className="text-slate-400 text-[11px]">Rayonnement</div>
              <div className="font-bold text-white font-mono tabular-nums mt-0.5">{eph.solarRadiationKwhM2} <span className="text-[10px] font-normal">kWh/m²</span></div>
            </div>
          </div>
        </div>

        {/* Lunar Section */}
        <div className="space-y-3.5 pt-4 md:pt-0 md:pl-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-sky-400 flex items-center gap-1.5">
              <Moon className="h-3.5 w-3.5" />
              <span>Phase &amp; cycle lunaire</span>
            </span>
            <span className="text-xs font-mono tabular-nums font-semibold text-sky-300">
              {moon.illuminationPercent}% éclairée
            </span>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-950 border border-slate-800 text-2xl">
              {moon.phaseCode === 'new_moon'
                ? '🌑'
                : moon.phaseCode === 'waxing_crescent'
                  ? '🌒'
                  : moon.phaseCode === 'first_quarter'
                    ? '🌓'
                    : moon.phaseCode === 'waxing_gibbous'
                      ? '🌔'
                      : moon.phaseCode === 'full_moon'
                        ? '🌕'
                        : moon.phaseCode === 'waning_gibbous'
                          ? '🌖'
                          : moon.phaseCode === 'last_quarter'
                            ? '🌗'
                            : '🌘'}
            </div>
            <div className="min-w-0">
              <div className="font-bold text-white text-sm truncate">{moon.phaseName}</div>
              <div className="text-xs text-slate-400 mt-0.5 font-mono tabular-nums truncate">
                Âge {moon.moonAgeDays}j / 29.5j · {moon.moonSign}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5 font-mono tabular-nums">
                Lever {moon.moonrise || '21:15'} · Coucher {moon.moonset || '10:40'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 divide-x divide-slate-800/80 pt-3 border-t border-slate-800/80 text-xs">
            <div className="pr-2">
              <div className="text-slate-400 text-[11px] flex items-center gap-1">
                <Waves className="h-3 w-3 text-sky-400" />
                <span>Marées</span>
              </div>
              <div className="font-bold text-sky-300 text-xs mt-0.5 truncate">{moon.tideType}</div>
            </div>
            <div className="px-2">
              <div className="text-slate-400 text-[11px]">Pleine lune</div>
              <div className="font-bold text-amber-300 font-mono tabular-nums text-xs mt-0.5 truncate">
                {moon.nextFullMoonDate || 'Dans 12 j'}
              </div>
            </div>
            <div className="pl-2">
              <div className="text-slate-400 text-[11px]">Ciel nocturne</div>
              <div className="font-bold text-white text-xs mt-0.5 truncate">
                {moon.illuminationPercent > 60 ? 'Lumineux' : 'Favorable étoiles'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
