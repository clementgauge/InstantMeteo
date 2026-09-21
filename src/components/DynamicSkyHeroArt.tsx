import React from 'react';
import { Sun, Cloud, CloudRain, CloudLightning, CloudSnow, Moon, CloudSun, CloudFog, CloudDrizzle } from 'lucide-react';

interface DynamicSkyHeroArtProps {
  weatherCode: number;
  isDay?: boolean;
  size?: 'sm' | 'lg';
}

export const DynamicSkyHeroArt: React.FC<DynamicSkyHeroArtProps> = ({
  weatherCode,
  isDay = true,
  size = 'lg'
}) => {
  // Classification météorologique normalisée WMO
  const isClear = weatherCode === 0;
  const isPartlyCloudy = weatherCode === 1 || weatherCode === 2;
  const isOvercast = weatherCode === 3;
  const isFog = weatherCode === 45 || weatherCode === 48;
  const isDrizzle = weatherCode >= 51 && weatherCode <= 57;
  const isRain = (weatherCode >= 61 && weatherCode <= 67) || (weatherCode >= 80 && weatherCode <= 82);
  const isSnow = (weatherCode >= 71 && weatherCode <= 77) || (weatherCode >= 85 && weatherCode <= 86);
  const isStorm = weatherCode >= 95;

  if (size === 'sm') {
    // Format compact pour mobile (60x60) avec icônes vectorielles nettes et lueur d'ambiance
    return (
      <div className="relative w-14 h-14 flex items-center justify-center select-none" aria-hidden="true">
        {isClear && isDay && (
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 w-12 h-12 rounded-full bg-amber-400/30 blur-md animate-pulse" />
            <div className="relative w-11 h-11 rounded-2xl bg-amber-500/25 border border-amber-300/40 backdrop-blur-md flex items-center justify-center shadow-lg">
              <Sun className="h-6 w-6 text-amber-300 drop-shadow-[0_2px_8px_rgba(245,158,11,0.6)]" />
            </div>
          </div>
        )}

        {isClear && !isDay && (
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 w-12 h-12 rounded-full bg-indigo-500/25 blur-md animate-pulse" />
            <div className="relative w-11 h-11 rounded-2xl bg-indigo-950/40 border border-indigo-300/40 backdrop-blur-md flex items-center justify-center shadow-lg">
              <Moon className="h-6 w-6 text-indigo-200 drop-shadow-[0_2px_8px_rgba(99,102,241,0.5)]" />
            </div>
          </div>
        )}

        {isPartlyCloudy && (
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 w-12 h-12 rounded-full bg-amber-400/20 blur-md" />
            <div className="relative w-11 h-11 rounded-2xl bg-slate-900/60 border border-white/20 backdrop-blur-md flex items-center justify-center shadow-lg">
              {isDay ? (
                <CloudSun className="h-6 w-6 text-amber-300 drop-shadow-[0_2px_8px_rgba(245,158,11,0.5)]" />
              ) : (
                <Moon className="h-6 w-6 text-indigo-200 drop-shadow-[0_2px_8px_rgba(99,102,241,0.5)]" />
              )}
            </div>
          </div>
        )}

        {isOvercast && (
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 w-12 h-12 rounded-full bg-slate-400/20 blur-md" />
            <div className="relative w-11 h-11 rounded-2xl bg-slate-900/60 border border-slate-400/30 backdrop-blur-md flex items-center justify-center shadow-lg">
              <Cloud className="h-6 w-6 text-slate-200 drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]" />
            </div>
          </div>
        )}

        {isDrizzle && (
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 w-12 h-12 rounded-full bg-sky-400/25 blur-md" />
            <div className="relative w-11 h-11 rounded-2xl bg-slate-900/60 border border-sky-400/40 backdrop-blur-md flex items-center justify-center shadow-lg">
              <CloudDrizzle className="h-6 w-6 text-sky-300 drop-shadow-[0_2px_8px_rgba(56,189,248,0.5)]" />
            </div>
          </div>
        )}

        {isRain && (
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 w-12 h-12 rounded-full bg-sky-500/30 blur-md animate-pulse" />
            <div className="relative w-11 h-11 rounded-2xl bg-slate-900/60 border border-sky-400/50 backdrop-blur-md flex items-center justify-center shadow-lg">
              <CloudRain className="h-6 w-6 text-sky-300 drop-shadow-[0_2px_8px_rgba(56,189,248,0.6)]" />
            </div>
          </div>
        )}

        {isSnow && (
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 w-12 h-12 rounded-full bg-cyan-300/30 blur-md" />
            <div className="relative w-11 h-11 rounded-2xl bg-slate-900/60 border border-cyan-200/50 backdrop-blur-md flex items-center justify-center shadow-lg">
              <CloudSnow className="h-6 w-6 text-cyan-200 drop-shadow-[0_2px_8px_rgba(103,232,249,0.6)]" />
            </div>
          </div>
        )}

        {isStorm && (
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 w-12 h-12 rounded-full bg-amber-500/30 blur-md animate-pulse" />
            <div className="relative w-11 h-11 rounded-2xl bg-purple-950/50 border border-amber-400/50 backdrop-blur-md flex items-center justify-center shadow-lg">
              <CloudLightning className="h-6 w-6 text-amber-300 drop-shadow-[0_2px_8px_rgba(251,191,36,0.7)]" />
            </div>
          </div>
        )}

        {isFog && (
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 w-12 h-12 rounded-full bg-slate-400/20 blur-md" />
            <div className="relative w-11 h-11 rounded-2xl bg-slate-900/60 border border-slate-400/30 backdrop-blur-md flex items-center justify-center shadow-lg">
              <CloudFog className="h-6 w-6 text-slate-300 drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]" />
            </div>
          </div>
        )}
      </div>
    );
  }

  // Format Desktop (lg) : Badge météo élégant, vectoriel et épuré avec aura lumineuse optique
  return (
    <div className="relative flex items-center justify-center w-28 h-28 select-none" aria-hidden="true">
      {/* 1. Ciel dégagé / Ensoleillé */}
      {isClear && isDay && (
        <div className="relative flex items-center justify-center">
          <div className="absolute w-24 h-24 rounded-full bg-amber-400/30 blur-2xl animate-pulse" />
          <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-500/20 via-yellow-500/10 to-transparent border border-amber-300/40 backdrop-blur-md shadow-2xl flex items-center justify-center">
            <Sun className="w-12 h-12 text-amber-300 drop-shadow-[0_0_20px_rgba(251,191,36,0.7)]" />
          </div>
        </div>
      )}

      {/* 2. Ciel dégagé nocturne */}
      {isClear && !isDay && (
        <div className="relative flex items-center justify-center">
          <div className="absolute w-24 h-24 rounded-full bg-indigo-500/25 blur-2xl animate-pulse" />
          <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500/20 via-blue-500/10 to-transparent border border-indigo-300/40 backdrop-blur-md shadow-2xl flex items-center justify-center">
            <Moon className="w-11 h-11 text-indigo-200 drop-shadow-[0_0_18px_rgba(129,140,248,0.6)]" />
          </div>
        </div>
      )}

      {/* 3. Éclaircies / Nuageux avec soleil - Remplacement propre et élégant du symbole nuage */}
      {isPartlyCloudy && (
        <div className="relative flex items-center justify-center">
          <div className="absolute w-24 h-24 rounded-full bg-amber-400/20 blur-2xl" />
          <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-slate-900/70 via-slate-900/50 to-amber-950/20 border border-white/20 backdrop-blur-md shadow-2xl flex items-center justify-center">
            {isDay ? (
              <CloudSun className="w-12 h-12 text-amber-300 drop-shadow-[0_0_18px_rgba(251,191,36,0.6)]" />
            ) : (
              <div className="relative flex items-center justify-center">
                <Cloud className="w-12 h-12 text-slate-300 drop-shadow-[0_0_12px_rgba(0,0,0,0.5)]" />
                <Moon className="absolute -top-1 -right-1 w-6 h-6 text-indigo-200" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. Ciel couvert */}
      {isOvercast && (
        <div className="relative flex items-center justify-center">
          <div className="absolute w-24 h-24 rounded-full bg-slate-400/15 blur-xl" />
          <div className="relative w-20 h-20 rounded-3xl bg-slate-900/70 border border-slate-500/30 backdrop-blur-md shadow-2xl flex items-center justify-center">
            <Cloud className="w-12 h-12 text-slate-200 drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)]" />
          </div>
        </div>
      )}

      {/* 5. Bruine ou petites pluies */}
      {isDrizzle && (
        <div className="relative flex items-center justify-center">
          <div className="absolute w-24 h-24 rounded-full bg-sky-400/20 blur-xl" />
          <div className="relative w-20 h-20 rounded-3xl bg-slate-900/70 border border-sky-400/35 backdrop-blur-md shadow-2xl flex items-center justify-center">
            <CloudDrizzle className="w-12 h-12 text-sky-300 drop-shadow-[0_0_16px_rgba(56,189,248,0.5)]" />
          </div>
        </div>
      )}

      {/* 6. Pluie continue / Averses */}
      {isRain && (
        <div className="relative flex items-center justify-center">
          <div className="absolute w-24 h-24 rounded-full bg-sky-500/25 blur-2xl animate-pulse" />
          <div className="relative w-20 h-20 rounded-3xl bg-slate-900/75 border border-sky-400/40 backdrop-blur-md shadow-2xl flex items-center justify-center">
            <CloudRain className="w-12 h-12 text-sky-300 drop-shadow-[0_0_18px_rgba(56,189,248,0.6)]" />
          </div>
        </div>
      )}

      {/* 7. Chutes de neige */}
      {isSnow && (
        <div className="relative flex items-center justify-center">
          <div className="absolute w-24 h-24 rounded-full bg-cyan-300/25 blur-2xl" />
          <div className="relative w-20 h-20 rounded-3xl bg-slate-900/75 border border-cyan-200/40 backdrop-blur-md shadow-2xl flex items-center justify-center">
            <CloudSnow className="w-12 h-12 text-cyan-200 drop-shadow-[0_0_18px_rgba(103,232,249,0.6)]" />
          </div>
        </div>
      )}

      {/* 8. Orages & Foudre */}
      {isStorm && (
        <div className="relative flex items-center justify-center">
          <div className="absolute w-24 h-24 rounded-full bg-amber-500/25 blur-2xl animate-pulse" />
          <div className="relative w-20 h-20 rounded-3xl bg-purple-950/60 border border-amber-400/45 backdrop-blur-md shadow-2xl flex items-center justify-center">
            <CloudLightning className="w-12 h-12 text-amber-300 drop-shadow-[0_0_20px_rgba(251,191,36,0.8)]" />
          </div>
        </div>
      )}

      {/* 9. Brouillard & Brume */}
      {isFog && (
        <div className="relative flex items-center justify-center">
          <div className="absolute w-24 h-24 rounded-full bg-slate-400/20 blur-xl" />
          <div className="relative w-20 h-20 rounded-3xl bg-slate-900/70 border border-slate-400/30 backdrop-blur-md shadow-2xl flex items-center justify-center">
            <CloudFog className="w-12 h-12 text-slate-300 drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)]" />
          </div>
        </div>
      )}
    </div>
  );
};
