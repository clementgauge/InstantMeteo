import React from 'react';

interface DynamicSkyHeroArtProps {
  weatherCode: number;
  isDay?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Symbole météo vectoriel multi-couleurs haute visibilité (identique sur l'image de la ville,
 * sur les cartes météo interactives et dans le déroulé heure par heure).
 */
export const DynamicSkyHeroArt: React.FC<DynamicSkyHeroArtProps> = ({
  weatherCode,
  isDay = true,
  size = 'lg',
  className = '',
}) => {
  const isClear = weatherCode === 0;
  const isMostlyClear = weatherCode === 1;
  const isPartlyCloudy = weatherCode === 2;
  const isOvercast = weatherCode === 3;
  const isFog = weatherCode === 45 || weatherCode === 48;
  const isDrizzle = weatherCode >= 51 && weatherCode <= 57;
  const isShowers = weatherCode === 80 || weatherCode === 81;
  const isRain = (weatherCode >= 61 && weatherCode <= 67) || weatherCode === 82;
  const isSnow = (weatherCode >= 71 && weatherCode <= 77) || (weatherCode >= 85 && weatherCode <= 86);
  const isStorm = weatherCode >= 95;

  const renderWeatherSvg = (svgClass: string) => {
    // 1. Plein Soleil (Jour)
    if (isClear && isDay) {
      return (
        <svg className={svgClass} viewBox="0 0 28 28" fill="none">
          <circle cx="14" cy="14" r="10.5" fill="#fbbf24" fillOpacity="0.24" />
          <g stroke="#fbbf24" strokeWidth="2.1" strokeLinecap="round">
            <line x1="14" y1="2.2" x2="14" y2="5" />
            <line x1="14" y1="23" x2="14" y2="25.8" />
            <line x1="2.2" y1="14" x2="5" y2="14" />
            <line x1="23" y1="14" x2="25.8" y2="14" />
            <line x1="5.6" y1="5.6" x2="7.6" y2="7.6" />
            <line x1="20.4" y1="20.4" x2="22.4" y2="22.4" />
            <line x1="22.4" y1="5.6" x2="20.4" y2="7.6" />
            <line x1="7.6" y1="20.4" x2="5.6" y2="22.4" />
          </g>
          <circle cx="14" cy="14" r="6.4" fill="#facc15" stroke="#f59e0b" strokeWidth="1.2" />
          <circle cx="12.1" cy="12.1" r="2.1" fill="#fef9c3" fillOpacity="0.75" />
        </svg>
      );
    }

    // 2. Ciel dégagé nocturne (Nuit)
    if (isClear && !isDay) {
      return (
        <svg className={svgClass} viewBox="0 0 28 28" fill="none">
          <circle cx="14" cy="14" r="10" fill="#818cf8" fillOpacity="0.18" />
          <path
            d="M18.8 18.2C14.7 18.2 11.4 14.9 11.4 10.8C11.4 8.7 12.3 6.8 13.7 5.5C9.8 6.1 6.8 9.5 6.8 13.6C6.8 18.1 10.5 21.8 15 21.8C18.2 21.8 20.9 20 22.3 17.3C21.2 17.9 20 18.2 18.8 18.2Z"
            fill="#fde68a"
            stroke="#f59e0b"
            strokeWidth="1.1"
          />
          <circle cx="20.5" cy="8" r="1" fill="#fef08a" />
          <circle cx="23" cy="11.5" r="0.8" fill="#e0e7ff" />
        </svg>
      );
    }

    // 3. Peu nuageux / Belles éclaircies (Codes 1 et 2)
    if (isMostlyClear || isPartlyCloudy) {
      if (!isDay) {
        return (
          <svg className={svgClass} viewBox="0 0 28 28" fill="none">
            <path
              d="M14.2 12.2C11.7 12.2 9.7 10.2 9.7 7.7C9.7 6.4 10.2 5.3 11.1 4.5C8.7 4.9 6.9 7 6.9 9.5C6.9 12.3 9.2 14.5 12 14.5C13.9 14.5 15.6 13.4 16.4 11.8C15.7 12.1 15 12.2 14.2 12.2Z"
              fill="#fde68a"
              stroke="#f59e0b"
              strokeWidth="1"
            />
            <path
              d="M10.5 22.5H20.5C23 22.5 25 20.6 25 18.2C25 16 23.3 14.2 21.1 14C20.4 10.9 17.6 8.8 14.4 8.8C11.1 8.8 8.3 11.2 7.8 14.4C5.9 14.8 4.5 16.4 4.5 18.4C4.5 20.7 6.4 22.5 8.8 22.5H10.5Z"
              fill="#e2e8f0"
              stroke="#94a3b8"
              strokeWidth="1.1"
            />
          </svg>
        );
      }
      return (
        <svg className={svgClass} viewBox="0 0 28 28" fill="none">
          <g stroke="#fbbf24" strokeWidth="1.9" strokeLinecap="round">
            <line x1="9.5" y1="2.8" x2="9.5" y2="5" />
            <line x1="2.8" y1="9.5" x2="5" y2="9.5" />
            <line x1="4.7" y1="4.7" x2="6.3" y2="6.3" />
            <line x1="14.3" y1="4.7" x2="12.7" y2="6.3" />
          </g>
          <circle cx="10" cy="10.5" r="5" fill="#facc15" stroke="#f59e0b" strokeWidth="1.1" />
          <path
            d="M10.5 22.5H20.5C23 22.5 25 20.6 25 18.2C25 16 23.3 14.2 21.1 14C20.4 10.9 17.6 8.8 14.4 8.8C11.1 8.8 8.3 11.2 7.8 14.4C5.9 14.8 4.5 16.4 4.5 18.4C4.5 20.7 6.4 22.5 8.8 22.5H10.5Z"
            fill="#f8fafc"
            stroke="#cbd5e1"
            strokeWidth="1.15"
          />
        </svg>
      );
    }

    // 4. Couvert / Nuageux (Code 3)
    if (isOvercast) {
      return (
        <svg className={svgClass} viewBox="0 0 28 28" fill="none">
          <path
            d="M11 19.5H21.5C23.7 19.5 25.5 17.8 25.5 15.6C25.5 13.6 23.9 11.9 21.9 11.7C21.2 9 18.7 7 15.8 7C12.7 7 10.2 9.2 9.7 12.1C8 12.5 6.8 14 6.8 15.8C6.8 17.9 8.5 19.5 10.6 19.5H11Z"
            fill="#94a3b8"
            fillOpacity="0.8"
          />
          <path
            d="M8.5 22.5H19.5C22 22.5 24 20.6 24 18.2C24 16 22.3 14.2 20.1 14C19.4 11 16.7 9 13.5 9C10.2 9 7.5 11.3 7 14.5C5.1 14.9 3.8 16.5 3.8 18.5C3.8 20.7 5.7 22.5 8.5 22.5Z"
            fill="#f1f5f9"
            stroke="#94a3b8"
            strokeWidth="1.15"
          />
        </svg>
      );
    }

    // 5. Brouillard & Brume (Codes 45, 48)
    if (isFog) {
      return (
        <svg className={svgClass} viewBox="0 0 28 28" fill="none">
          <path
            d="M8.5 16.5H19.5C21.5 16.5 23 15 23 13C23 11.1 21.5 9.6 19.7 9.5C19 7.2 16.8 5.5 14.2 5.5C11.4 5.5 9.1 7.5 8.7 10.2C7.1 10.5 6 11.8 6 13.5C6 15.2 7.1 16.5 8.5 16.5Z"
            fill="#e2e8f0"
            stroke="#94a3b8"
            strokeWidth="1"
          />
          <g stroke="#94a3b8" strokeWidth="2" strokeLinecap="round">
            <line x1="5" y1="19.5" x2="23" y2="19.5" />
            <line x1="7" y1="23" x2="21" y2="23" />
          </g>
        </svg>
      );
    }

    // 6. Averses / Bruine avec éclaircies (Codes 51-57, 80-81)
    if (isDrizzle || isShowers) {
      return (
        <svg className={svgClass} viewBox="0 0 28 28" fill="none">
          {isDay && (
            <circle cx="9.5" cy="9.5" r="4.2" fill="#facc15" stroke="#f59e0b" strokeWidth="1" />
          )}
          <path
            d="M8.5 18.5H19.5C21.8 18.5 23.6 16.8 23.6 14.6C23.6 12.6 22 10.9 20 10.7C19.3 8 16.8 6 13.8 6C10.6 6 8 8.3 7.5 11.3C5.7 11.7 4.4 13.2 4.4 15C4.4 17 6.2 18.5 8.5 18.5Z"
            fill="#e2e8f0"
            stroke="#64748b"
            strokeWidth="1.05"
          />
          <g stroke="#38bdf8" strokeWidth="2.1" strokeLinecap="round">
            <line x1="10" y1="20.5" x2="8.6" y2="24.8" />
            <line x1="14.5" y1="20.5" x2="13.1" y2="24.8" />
            <line x1="19" y1="20.5" x2="17.6" y2="24.8" />
          </g>
        </svg>
      );
    }

    // 7. Pluie continue ou soutenue (Codes 61-67, 82)
    if (isRain) {
      return (
        <svg className={svgClass} viewBox="0 0 28 28" fill="none">
          <path
            d="M8.5 18.5H19.5C21.8 18.5 23.6 16.8 23.6 14.6C23.6 12.6 22 10.9 20 10.7C19.3 8 16.8 6 13.8 6C10.6 6 8 8.3 7.5 11.3C5.7 11.7 4.4 13.2 4.4 15C4.4 17 6.2 18.5 8.5 18.5Z"
            fill="#cbd5e1"
            stroke="#64748b"
            strokeWidth="1.1"
          />
          <g stroke="#38bdf8" strokeWidth="2.2" strokeLinecap="round">
            <line x1="9.5" y1="20.5" x2="8" y2="25.2" />
            <line x1="14" y1="20.5" x2="12.5" y2="25.2" />
            <line x1="18.5" y1="20.5" x2="17" y2="25.2" />
          </g>
        </svg>
      );
    }

    // 8. Neige (Codes 71-77, 85-86)
    if (isSnow) {
      return (
        <svg className={svgClass} viewBox="0 0 28 28" fill="none">
          <path
            d="M8.5 18H19.5C21.8 18 23.6 16.3 23.6 14.1C23.6 12.1 22 10.4 20 10.2C19.3 7.5 16.8 5.5 13.8 5.5C10.6 5.5 8 7.8 7.5 10.8C5.7 11.2 4.4 12.7 4.4 14.5C4.4 16.5 6.2 18 8.5 18Z"
            fill="#f1f5f9"
            stroke="#94a3b8"
            strokeWidth="1.1"
          />
          <circle cx="9.5" cy="22" r="1.7" fill="#7dd3fc" />
          <circle cx="14" cy="24" r="1.7" fill="#38bdf8" />
          <circle cx="18.5" cy="22" r="1.7" fill="#7dd3fc" />
        </svg>
      );
    }

    // 9. Orages & Foudre (Codes 95-99)
    if (isStorm) {
      return (
        <svg className={svgClass} viewBox="0 0 28 28" fill="none">
          <path
            d="M8.5 18H19.5C21.8 18 23.6 16.3 23.6 14.1C23.6 12.1 22 10.4 20 10.2C19.3 7.5 16.8 5.5 13.8 5.5C10.6 5.5 8 7.8 7.5 10.8C5.7 11.2 4.4 12.7 4.4 14.5C4.4 16.5 6.2 18 8.5 18Z"
            fill="#64748b"
            stroke="#475569"
            strokeWidth="1.1"
          />
          <polygon
            points="15,15 10.5,21 14,21 12.5,26.5 18.5,19.5 14.8,19.5"
            fill="#facc15"
            stroke="#f59e0b"
            strokeWidth="0.7"
          />
        </svg>
      );
    }

    // Fallback : Soleil / Lune
    return (
      <svg className={svgClass} viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="6.2" fill="#facc15" stroke="#f59e0b" strokeWidth="1.2" />
      </svg>
    );
  };

  if (size === 'xs') {
    return (
      <div className={`inline-flex items-center justify-center select-none ${className}`} aria-hidden="true">
        {renderWeatherSvg('w-6 h-6 shrink-0 drop-shadow-[0_2px_4px_rgba(0,0,0,0.45)]')}
      </div>
    );
  }

  if (size === 'md') {
    return (
      <div className={`inline-flex items-center justify-center select-none ${className}`} aria-hidden="true">
        {renderWeatherSvg('w-8 h-8 shrink-0 drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]')}
      </div>
    );
  }

  if (size === 'sm') {
    return (
      <div className={`relative w-14 h-14 flex items-center justify-center select-none ${className}`} aria-hidden="true">
        <div className="absolute inset-0 w-12 h-12 m-auto rounded-full bg-sky-400/20 blur-md" />
        <div className="relative w-12 h-12 rounded-2xl bg-slate-900/75 border border-white/25 backdrop-blur-md flex items-center justify-center shadow-lg">
          {renderWeatherSvg('w-9 h-9 shrink-0 drop-shadow-[0_2px_6px_rgba(0,0,0,0.55)]')}
        </div>
      </div>
    );
  }

  // Format Desktop (lg) sur l'image de la ville
  return (
    <div className={`relative flex items-center justify-center w-28 h-28 select-none ${className}`} aria-hidden="true">
      <div className="absolute w-24 h-24 rounded-full bg-amber-400/20 blur-2xl" />
      <div className="relative w-22 h-22 rounded-2xl bg-slate-900/75 border border-white/25 backdrop-blur-md shadow-2xl flex items-center justify-center p-2">
        {renderWeatherSvg('w-16 h-16 shrink-0 drop-shadow-[0_4px_12px_rgba(0,0,0,0.55)]')}
      </div>
    </div>
  );
};
