import React from 'react';
import { Sun, Cloud, CloudRain, CloudLightning, CloudSnow, Moon, CloudSun, CloudFog } from 'lucide-react';

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
  // Classification
  const isClear = weatherCode === 0;
  const isPartlyCloudy = weatherCode === 1 || weatherCode === 2;
  const isOvercast = weatherCode === 3;
  const isFog = weatherCode === 45 || weatherCode === 48;
  const isRain = (weatherCode >= 51 && weatherCode <= 67) || (weatherCode >= 80 && weatherCode <= 82);
  const isSnow = (weatherCode >= 71 && weatherCode <= 77) || (weatherCode >= 85 && weatherCode <= 86);
  const isStorm = weatherCode >= 95;

  if (size === 'sm') {
    // Mobile compact format (64px)
    return (
      <div className="relative w-16 h-16 flex items-center justify-center select-none">
        {isClear && isDay && (
          <>
            <div className="absolute inset-0 bg-amber-400/30 rounded-full blur-lg animate-pulse" />
            <div className="relative w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-200 shadow-xl shadow-amber-500/40 border border-yellow-200/70 flex items-center justify-center">
              <Sun className="h-7 w-7 text-amber-950" />
            </div>
          </>
        )}

        {isClear && !isDay && (
          <>
            <div className="absolute inset-0 bg-indigo-500/25 rounded-full blur-lg animate-pulse" />
            <div className="relative w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 via-blue-400 to-slate-200 shadow-xl shadow-indigo-500/40 border border-indigo-200/60 flex items-center justify-center">
              <Moon className="h-6 w-6 text-indigo-950" />
            </div>
          </>
        )}

        {isPartlyCloudy && (
          <>
            <div className="absolute inset-0 bg-amber-400/20 rounded-full blur-lg" />
            {isDay ? (
              <div className="relative w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 shadow-lg border border-yellow-200/60 flex items-center justify-center">
                <CloudSun className="h-7 w-7 text-amber-950" />
              </div>
            ) : (
              <div className="relative w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-700 to-slate-400 shadow-lg border border-indigo-200/60 flex items-center justify-center">
                <Moon className="h-6 w-6 text-indigo-950" />
              </div>
            )}
          </>
        )}

        {isOvercast && (
          <>
            <div className="absolute inset-0 bg-slate-500/20 rounded-full blur-lg" />
            <div className="relative w-12 h-12 rounded-full bg-gradient-to-tr from-slate-600 via-slate-400 to-slate-200 shadow-lg border border-slate-300/60 flex items-center justify-center">
              <Cloud className="h-7 w-7 text-slate-900" />
            </div>
          </>
        )}

        {isRain && (
          <>
            <div className="absolute inset-0 bg-sky-500/30 rounded-full blur-lg animate-pulse" />
            <div className="relative w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 via-sky-400 to-cyan-200 shadow-lg shadow-sky-500/40 border border-sky-200/70 flex items-center justify-center">
              <CloudRain className="h-7 w-7 text-sky-950" />
            </div>
          </>
        )}

        {isSnow && (
          <>
            <div className="absolute inset-0 bg-cyan-300/30 rounded-full blur-lg" />
            <div className="relative w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-600 via-sky-300 to-white shadow-lg border border-white/80 flex items-center justify-center">
              <CloudSnow className="h-7 w-7 text-sky-950" />
            </div>
          </>
        )}

        {isStorm && (
          <>
            <div className="absolute inset-0 bg-amber-500/30 rounded-full blur-lg animate-pulse" />
            <div className="relative w-12 h-12 rounded-full bg-gradient-to-tr from-purple-800 via-indigo-600 to-amber-300 shadow-lg shadow-purple-500/40 border border-amber-300/80 flex items-center justify-center">
              <CloudLightning className="h-7 w-7 text-yellow-300" />
            </div>
          </>
        )}

        {isFog && (
          <>
            <div className="absolute inset-0 bg-slate-400/20 rounded-full blur-lg" />
            <div className="relative w-12 h-12 rounded-full bg-gradient-to-tr from-slate-700 via-slate-400 to-slate-200 shadow-lg border border-slate-300/60 flex items-center justify-center">
              <CloudFog className="h-7 w-7 text-slate-900" />
            </div>
          </>
        )}
      </div>
    );
  }

  // Desktop large 3D Artwork (144px)
  return (
    <div className="relative flex items-center justify-center w-36 h-36 select-none">
      {/* 1. Clear Day */}
      {isClear && isDay && (
        <>
          <div className="absolute w-28 h-28 rounded-full bg-amber-400/40 blur-2xl animate-pulse" />
          <div className="relative z-10 w-22 h-22 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-yellow-100 shadow-[0_0_45px_rgba(245,158,11,0.75)] border border-yellow-200/90 flex items-center justify-center">
            <Sun className="w-12 h-12 text-amber-900/60" />
          </div>
        </>
      )}

      {/* 2. Clear Night */}
      {isClear && !isDay && (
        <>
          <div className="absolute w-28 h-28 rounded-full bg-indigo-500/30 blur-2xl animate-pulse" />
          <div className="relative z-10 w-22 h-22 rounded-full bg-gradient-to-tr from-indigo-600 via-slate-400 to-slate-100 shadow-[0_0_40px_rgba(99,102,241,0.6)] border border-indigo-200/80 flex items-center justify-center">
            <Moon className="w-12 h-12 text-indigo-950" />
          </div>
        </>
      )}

      {/* 3. Partly Cloudy (Nuageux avec soleil / Éclaircies) - Exactly what user wanted */}
      {isPartlyCloudy && (
        <>
          {/* Sun Glow Behind */}
          <div className="absolute -top-1 -right-1 w-24 h-24 rounded-full bg-amber-400/45 blur-2xl animate-pulse" />
          
          {/* 3D Sun Orb */}
          <div className="absolute top-3 right-6 z-10 w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-yellow-100 shadow-[0_0_35px_rgba(245,158,11,0.7)] border border-yellow-200/80" />
          
          {/* Fluffy Translucent Cloud Overlapping Front */}
          <div className="absolute z-20 bottom-3 left-4 w-28 h-16 rounded-full bg-white/85 backdrop-blur-md shadow-2xl border border-white/70 flex items-center justify-center">
            <div className="w-18 h-12 -mt-5 ml-4 rounded-full bg-white/95" />
          </div>
        </>
      )}

      {/* 4. Overcast (Couvert) */}
      {isOvercast && (
        <>
          <div className="absolute w-28 h-28 rounded-full bg-slate-400/20 blur-xl" />
          <div className="relative z-10 w-28 h-16 rounded-full bg-slate-200/90 backdrop-blur-md shadow-2xl border border-white/70 flex items-center justify-center">
            <div className="w-18 h-12 -mt-5 ml-3 rounded-full bg-slate-100/95" />
          </div>
          <div className="absolute z-20 bottom-4 right-5 w-24 h-14 rounded-full bg-slate-300/85 backdrop-blur-sm shadow-lg border border-white/60" />
        </>
      )}

      {/* 5. Rain / Showers */}
      {isRain && (
        <>
          <div className="absolute w-28 h-28 rounded-full bg-sky-500/25 blur-2xl animate-pulse" />
          <div className="relative z-10 w-28 h-16 rounded-full bg-gradient-to-tr from-slate-400 via-slate-200 to-sky-100 backdrop-blur-md shadow-2xl border border-sky-300/60 flex items-center justify-center">
            <div className="w-18 h-12 -mt-5 ml-3 rounded-full bg-slate-100/95" />
          </div>
          {/* Animated Raindrops below cloud */}
          <div className="absolute z-20 bottom-1 left-8 flex gap-3 text-sky-400 font-black text-sm animate-bounce">
            <span>💧</span>
            <span className="delay-100">💧</span>
            <span className="delay-200">💧</span>
          </div>
        </>
      )}

      {/* 6. Snow */}
      {isSnow && (
        <>
          <div className="absolute w-28 h-28 rounded-full bg-cyan-300/30 blur-2xl" />
          <div className="relative z-10 w-28 h-16 rounded-full bg-white/95 backdrop-blur-md shadow-2xl border border-sky-100 flex items-center justify-center">
            <div className="w-18 h-12 -mt-5 ml-3 rounded-full bg-white" />
          </div>
          <div className="absolute z-20 bottom-1 left-8 flex gap-3 text-cyan-200 text-sm animate-pulse">
            <span>❄️</span>
            <span>❄️</span>
            <span>❄️</span>
          </div>
        </>
      )}

      {/* 7. Storm */}
      {isStorm && (
        <>
          <div className="absolute w-28 h-28 rounded-full bg-purple-600/30 blur-2xl animate-pulse" />
          <div className="relative z-10 w-28 h-16 rounded-full bg-gradient-to-tr from-slate-800 via-indigo-900 to-slate-700 shadow-2xl border border-amber-400/50 flex items-center justify-center">
            <div className="w-18 h-12 -mt-5 ml-3 rounded-full bg-slate-900" />
          </div>
          <div className="absolute z-20 bottom-1 left-12 text-yellow-300 text-xl drop-shadow-[0_0_12px_rgba(253,224,71,0.9)] animate-pulse">
            ⚡
          </div>
        </>
      )}

      {/* 8. Fog */}
      {isFog && (
        <>
          <div className="absolute w-28 h-28 rounded-full bg-slate-400/20 blur-xl" />
          <div className="flex flex-col gap-2 z-10">
            <div className="w-28 h-3 rounded-full bg-slate-300/80 shadow blur-[1px]" />
            <div className="w-32 h-3.5 rounded-full bg-slate-200/90 shadow blur-[1px]" />
            <div className="w-24 h-3 rounded-full bg-slate-300/75 shadow blur-[1px]" />
          </div>
        </>
      )}
    </div>
  );
};
