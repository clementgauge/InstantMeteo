import React, { useState, useEffect } from 'react';
import { X, MapPin, ChevronUp, Sparkles } from 'lucide-react';
import { LocationPoint, CurrentWeather } from '../types/weather';
import { getRichWeatherInfo } from '../utils/weatherIcons';

interface FloatingWeatherBubbleProps {
  station: LocationPoint;
  weather: CurrentWeather;
  tempUnit: 'C' | 'F';
  onClose: () => void;
  onOpenDetails?: () => void;
  onClick?: () => void;
}

export const FloatingWeatherBubble: React.FC<FloatingWeatherBubbleProps> = ({
  station,
  weather,
  tempUnit,
  onClose,
  onOpenDetails,
  onClick
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false);

  const weatherInfo = getRichWeatherInfo(weather.weatherCode, true, weather.precipitation, weather.windGust);

  const formatTemp = (celsius: number) => {
    if (tempUnit === 'F') {
      return `${Math.round((celsius * 9/5 + 32) * 10) / 10}°F`;
    }
    const sign = celsius > 0 ? '+' : '';
    return `${sign}${Math.round(celsius * 10) / 10}°C`;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
    setHasMoved(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    const newX = touch.clientX - dragStart.x;
    const newY = touch.clientY - dragStart.y;
    setPosition({ x: newX, y: newY });
    setHasMoved(true);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (hasMoved) {
      e.preventDefault();
      return;
    }
    if (onOpenDetails) {
      onOpenDetails();
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <aside
      role="complementary"
      aria-label="Bulle météo interactive flottante"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        touchAction: 'none'
      }}
      className="fixed bottom-24 right-4 z-50 select-none animate-in fade-in zoom-in-95 duration-200"
    >
      <div
        id="floating-weather-bubble-card"
        onClick={handleClick}
        className="group relative flex items-center gap-2.5 px-3.5 py-2.5 rounded-full bg-gradient-to-r from-slate-950/95 via-blue-950/90 to-slate-900/95 border-2 border-sky-400/70 shadow-2xl shadow-sky-500/30 backdrop-blur-xl cursor-pointer active:scale-95 transition-transform"
      >
        {/* Glow ambient background */}
        <div className="absolute inset-0 rounded-full bg-sky-400/15 blur-md -z-10" />

        {/* Weather Emoji / Icon Orb */}
        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-200 border border-yellow-200/60 flex items-center justify-center text-lg shadow-md shrink-0">
          <span className="leading-none drop-shadow">{weatherInfo.emoji || '☀️'}</span>
        </div>

        {/* Text Container: City and Temperature */}
        <div className="flex flex-col text-left pr-1 min-w-[70px] max-w-[130px]">
          <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-sky-300 truncate">
            <MapPin className="w-2.5 h-2.5 text-sky-400 shrink-0" />
            <span className="truncate">{station.name}</span>
          </div>
          <div className="text-sm font-black text-white leading-tight tabular-nums flex items-baseline gap-1">
            <span>{formatTemp(weather.temperature)}</span>
            <span className="text-[10px] text-slate-300 font-semibold truncate hidden xs:inline">
              • {weatherInfo.shortLabel}
            </span>
          </div>
        </div>

        {/* Action / Dismiss Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="w-5 h-5 rounded-full bg-slate-800/80 hover:bg-rose-500/80 text-slate-300 hover:text-white flex items-center justify-center transition border border-slate-700/60 shadow shrink-0"
          title="Fermer la bulle météo"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </aside>
  );
};
