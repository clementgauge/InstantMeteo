import React, { useState, useEffect, useRef } from 'react';
import { LocationPoint, CurrentWeather } from '../types/weather';
import { X, ExternalLink } from 'lucide-react';

interface FloatingWeatherBubbleProps {
  station: LocationPoint;
  weather: CurrentWeather | null;
  tempUnit?: 'C' | 'F';
  onOpenSearch?: () => void;
  onScrollToTop?: () => void;
}

export const FloatingWeatherBubble: React.FC<FloatingWeatherBubbleProps> = ({
  station,
  weather,
  tempUnit = 'C',
  onOpenSearch,
  onScrollToTop
}) => {
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 16, y: 120 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ startX: number; startY: number; posX: number; posY: number }>({
    startX: 0,
    startY: 0,
    posX: 16,
    posY: 120
  });

  // Ne rien afficher si pas de météo
  if (!weather || !isVisible) return null;

  const tempDisplay = tempUnit === 'F' 
    ? `${Math.round(weather.temperature * 9/5 + 32)}°`
    : `${Math.round(weather.temperature)}°`;

  // Gestion du glisser-déposer tactile sur mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    dragStartRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      posX: position.x,
      posY: position.y
    };
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - dragStartRef.current.startX;
    const deltaY = touch.clientY - dragStartRef.current.startY;
    
    // Contraintes écran
    const maxX = window.innerWidth - 180;
    const maxY = window.innerHeight - 100;
    
    setPosition({
      x: Math.max(10, Math.min(maxX, dragStartRef.current.posX + deltaX)),
      y: Math.max(70, Math.min(maxY, dragStartRef.current.posY + deltaY))
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <div
      id="mobile-floating-weather-bubble"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 48,
        touchAction: 'none'
      }}
      className="block sm:hidden transition-transform duration-75 select-none animate-in fade-in zoom-in-95 duration-200"
    >
      {/* Capsule flottante pixel-perfect inspirée de la référence utilisateur */}
      <div 
        onClick={() => {
          if (!isDragging && onScrollToTop) {
            onScrollToTop();
          }
        }}
        className="relative group flex items-center gap-3 px-4 py-2.5 rounded-full bg-[#2563eb] text-white shadow-2xl shadow-blue-600/60 border border-blue-400/40 backdrop-blur-md cursor-pointer active:scale-95"
      >
        {/* Bouton fermeture discret */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsVisible(false);
          }}
          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-slate-900/90 text-slate-300 border border-white/20 flex items-center justify-center hover:text-white"
          title="Fermer la bulle"
        >
          <X className="w-3 h-3" />
        </button>

        {/* Logo Météo : Soleil doré derrière nuage blanc éclatant */}
        <div className="relative w-9 h-9 shrink-0 flex items-center justify-center">
          <svg viewBox="0 0 64 64" className="w-full h-full drop-shadow-md">
            {/* Soleil */}
            <circle cx="26" cy="24" r="13" fill="#f59e0b" />
            <circle cx="26" cy="24" r="10" fill="#fbbf24" />
            {/* Rayons solaires discrets */}
            <path d="M26 6v4M26 38v4M12 24H8M44 24h-4M16 14l3 3M33 31l3 3M36 14l-3 3M19 31l-3 3" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
            {/* Nuage blanc stylisé en relief */}
            <path
              d="M20 44h26a11 11 0 0 0 2-21.8 14 14 0 0 0-26.6-4.2A11 11 0 0 0 20 44z"
              fill="#ffffff"
            />
            {/* Nuance subtile de gris/bleu à la base du nuage */}
            <path
              d="M22 42h22a9 9 0 0 0 1.5-17.8 12 12 0 0 0-22.3-3.2A9 9 0 0 0 22 42z"
              fill="#f1f5f9"
            />
          </svg>
        </div>

        {/* Données : Température en grand + Nom de la ville */}
        <div className="flex flex-col leading-none pr-1">
          <span className="text-2xl font-black text-white tracking-tight">
            {tempDisplay}
          </span>
          <span className="text-xs font-semibold text-blue-100 max-w-[100px] truncate mt-0.5">
            {station.name}
          </span>
        </div>
      </div>
    </div>
  );
};
