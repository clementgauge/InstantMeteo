import React, { useState, useRef } from 'react';
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  CloudRain, 
  Wind, 
  Droplets, 
  Sun, 
  Moon, 
  Activity, 
  Thermometer, 
  Sparkles,
  TrendingUp,
  LineChart as ChartIcon,
  LayoutGrid
} from 'lucide-react';
import { HourlyForecast, CurrentWeather, LocationPoint } from '../types/weather';
import { getRichWeatherInfo } from '../utils/weatherIcons';

interface UnifiedHourly48hTrendProps {
  station: LocationPoint;
  currentWeather: CurrentWeather;
  hourly: HourlyForecast[];
  tempUnit: 'C' | 'F';
  onNavigateTab?: (tabId: string) => void;
}

export const UnifiedHourly48hTrend: React.FC<UnifiedHourly48hTrendProps> = ({
  station,
  currentWeather,
  hourly,
  tempUnit,
  onNavigateTab
}) => {
  const [activeFilter, setActiveFilter] = useState<'all48h' | 'day1' | 'day2' | 'curve'>('all48h');
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const formatTemp = (celsius: number) => {
    if (tempUnit === 'F') {
      return `${Math.round(celsius * 9/5 + 32)}°`;
    }
    const sign = celsius > 0 ? '+' : '';
    return `${sign}${Math.round(celsius * 10) / 10}°`;
  };

  const formatTempSimple = (celsius: number) => {
    if (tempUnit === 'F') {
      return `${Math.round(celsius * 9/5 + 32)}°`;
    }
    return `${Math.round(celsius)}°`;
  };

  // Get full 48 hours (or all available if < 48)
  const all48Slots = hourly.slice(0, 48);

  // Filter slots based on activeFilter
  const displayedSlots = activeFilter === 'day1' 
    ? all48Slots.slice(0, 24)
    : activeFilter === 'day2'
    ? all48Slots.slice(24, 48)
    : all48Slots;

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -380 : 380;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Peak temperature and precipitation over the 48 hours for graph scaling
  const maxTemp = Math.max(...all48Slots.map(s => s.temperature), currentWeather.temperature);
  const minTemp = Math.min(...all48Slots.map(s => s.temperature), currentWeather.temperature);
  const tempRange = Math.max(1, maxTemp - minTemp);
  const maxRain = Math.max(1, ...all48Slots.map(s => s.rainMm || 0));

  return (
    <div id="unified-48h-hourly-trend" className="rounded-[24px] border border-slate-800/90 bg-[#0c1424]/95 p-4 sm:p-5 shadow-xl space-y-4">
      {/* Header with Title and Mode Toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-400/30 text-sky-400 flex items-center justify-center shadow-inner shrink-0">
            <Clock className="w-4 h-4 text-sky-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-black text-white tracking-wide">
                Prévisions Heure par Heure
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-blue-600/20 text-sky-300 border border-blue-400/30 text-[10px] font-black uppercase tracking-wider">
                48 Heures en Continu
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Évolution continue sur 2 jours complets • {station.name}
            </p>
          </div>
        </div>

        {/* View Switcher Controls */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto flex-wrap">
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold shadow-inner">
            <button
              onClick={() => setActiveFilter('all48h')}
              className={`px-3 py-1 rounded-lg transition ${
                activeFilter === 'all48h'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Tout (48h)
            </button>
            <button
              onClick={() => setActiveFilter('day1')}
              className={`px-3 py-1 rounded-lg transition ${
                activeFilter === 'day1'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              24h (J1)
            </button>
            <button
              onClick={() => setActiveFilter('day2')}
              className={`px-3 py-1 rounded-lg transition ${
                activeFilter === 'day2'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              +24h (J2)
            </button>
            <button
              onClick={() => setActiveFilter('curve')}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg transition ${
                activeFilter === 'curve'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ChartIcon className="w-3 h-3" />
              <span>Courbe</span>
            </button>
          </div>

          {/* Desktop Left / Right Scroll Arrows */}
          <div className="hidden sm:flex items-center gap-1">
            <button
              onClick={() => scroll('left')}
              className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition active:scale-95"
              title="Défiler vers la gauche"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition active:scale-95"
              title="Défiler vers la droite"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main 48H Timeline Content */}
      {activeFilter === 'curve' ? (
        /* High-Definition 48h SVG Temperature & Precipitation Curve */
        <div className="space-y-3 pt-2">
          <div className="relative h-44 w-full bg-slate-950/90 rounded-2xl border border-slate-800 p-3 overflow-hidden">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1 px-1">
              <span className="flex items-center gap-1 text-amber-300 font-bold">
                <span className="w-2 h-0.5 bg-amber-400 inline-block rounded" /> Température (°C)
              </span>
              <span className="flex items-center gap-1 text-sky-300 font-bold">
                <span className="w-2 h-2 bg-sky-500 inline-block rounded" /> Précipitations (mm)
              </span>
            </div>

            {/* SVG Interactive Curve */}
            <svg viewBox="0 0 960 120" className="w-full h-28 overflow-visible" preserveAspectRatio="none">
              <defs>
                <linearGradient id="tempGradient48" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Rain Bars at bottom */}
              {all48Slots.map((slot, idx) => {
                const x = (idx / 47) * 940 + 10;
                const rainH = Math.min(40, (slot.rainMm / maxRain) * 40);
                if (rainH <= 0) return null;
                return (
                  <rect
                    key={`rain-${idx}`}
                    x={x - 6}
                    y={110 - rainH}
                    width={12}
                    height={rainH}
                    fill="#38bdf8"
                    opacity="0.65"
                    rx="2"
                  />
                );
              })}

              {/* Temperature Area & Line */}
              {(() => {
                const points = all48Slots.map((slot, idx) => {
                  const x = (idx / 47) * 940 + 10;
                  const y = 95 - ((slot.temperature - minTemp) / tempRange) * 80;
                  return `${x},${y}`;
                });
                const dPath = `M ${points.join(' L ')}`;
                const areaPath = `M ${points[0]} L ${points.join(' L ')} L 950,115 L 10,115 Z`;
                return (
                  <>
                    <path d={areaPath} fill="url(#tempGradient48)" />
                    <path d={dPath} fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    {all48Slots.filter((_, idx) => idx % 4 === 0).map((slot, i) => {
                      const idx = i * 4;
                      const x = (idx / 47) * 940 + 10;
                      const y = 95 - ((slot.temperature - minTemp) / tempRange) * 80;
                      return (
                        <g key={`pt-${idx}`}>
                          <circle cx={x} cy={y} r="3.5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
                          <text x={x} y={y - 8} textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">
                            {formatTempSimple(slot.temperature)}
                          </text>
                        </g>
                      );
                    })}
                  </>
                );
              })()}
            </svg>

            {/* Time labels below graph */}
            <div className="flex justify-between text-[9px] text-slate-400 font-bold px-1 pt-1 border-t border-slate-800">
              {all48Slots.filter((_, idx) => idx % 6 === 0).map((slot, idx) => (
                <span key={idx}>
                  {slot.dayLabel === "Aujourd'hui" ? '' : `${slot.dayLabel} `}{slot.hourLabel}
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Unified 48-Hour Horizontal Scrollable Feed */
        <div className="relative">
          <div
            ref={scrollContainerRef}
            className="flex items-stretch gap-2.5 overflow-x-auto no-scrollbar pb-2 pt-1 px-1 scroll-smooth"
            tabIndex={0}
            role="region"
            aria-label="Défilement des prévisions heure par heure sur 48 heures"
          >
            {/* Slot 0: Maintenant */}
            {activeFilter !== 'day2' && (
              <div className="flex flex-col items-center justify-between min-w-[85px] sm:min-w-[95px] p-3 rounded-2xl bg-gradient-to-b from-blue-600 via-blue-700 to-blue-900 border-2 border-blue-400 shadow-xl shadow-blue-600/30 text-white shrink-0">
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-100">
                    Maintenant
                  </span>
                  <span className="text-[9px] text-blue-200">En direct</span>
                </div>

                <div className="my-1.5 flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-2xl shadow-inner">
                    {getRichWeatherInfo(currentWeather.weatherCode, true, currentWeather.precipitation, currentWeather.windGust).emoji || '☀️'}
                  </div>
                  <span className="text-sm sm:text-base font-black tracking-tight text-white mt-1 tabular-nums">
                    {formatTemp(currentWeather.temperature)}
                  </span>
                </div>

                <div className="flex flex-col items-center text-[10px] text-blue-200 font-medium">
                  <span className="text-center font-bold truncate max-w-[80px]">
                    {getRichWeatherInfo(currentWeather.weatherCode).shortLabel}
                  </span>
                  <span className="text-[9px] opacity-80">Vent {Math.round(currentWeather.windSpeed)} km/h</span>
                </div>
              </div>
            )}

            {/* 48 Hours Cards */}
            {displayedSlots.map((slot, idx) => {
              const hourNum = slot.hourNumber !== undefined 
                ? slot.hourNumber 
                : parseInt(slot.hourLabel.replace('h', '')) || 0;
              const isNight = hourNum >= 22 || hourNum <= 5;
              const richInfo = getRichWeatherInfo(slot.weatherCode, !isNight, slot.rainMm, slot.windGust);
              const isRain = slot.rainMm > 0 || slot.precipitationProbability >= 40;
              const isNewDay = idx === 0 || slot.dayDate !== displayedSlots[idx - 1]?.dayDate;

              return (
                <div
                  key={`h-${idx}`}
                  onClick={() => setSelectedSlotIndex(idx === selectedSlotIndex ? null : idx)}
                  className={`flex flex-col items-center justify-between min-w-[85px] sm:min-w-[95px] p-2.5 sm:p-3 rounded-2xl border transition-all cursor-pointer select-none shrink-0 ${
                    isNight 
                      ? 'bg-[#090e1a] border-slate-800/90 text-slate-200 hover:border-indigo-500/50 hover:bg-[#0c1424]' 
                      : 'bg-[#0c1424] border-slate-800 text-slate-100 hover:border-blue-500/50 hover:bg-[#0e182c]'
                  } ${selectedSlotIndex === idx ? 'ring-2 ring-blue-400 border-transparent shadow-lg shadow-blue-500/20' : ''}`}
                >
                  {/* Top: Day Label & Hour */}
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] font-bold text-slate-400 truncate max-w-[80px]">
                      {slot.dayLabel || (idx < 24 ? "Aujourd'hui" : "Demain")}
                    </span>
                    <span className="text-xs font-black text-white tracking-wide">
                      {slot.hourLabel}
                    </span>
                  </div>

                  {/* Weather Emoji / Icon */}
                  <div className="my-1.5 flex flex-col items-center">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xl shadow-inner ${
                      isNight ? 'bg-indigo-950/50 text-indigo-300' : 'bg-slate-900/80 text-amber-300'
                    }`}>
                      {richInfo.emoji || (isNight ? '🌙' : '☀️')}
                    </div>
                    <span className="text-sm sm:text-base font-black tracking-tight text-white mt-1 tabular-nums">
                      {formatTempSimple(slot.temperature)}
                    </span>
                  </div>

                  {/* Bottom: Rain Probability & Short Weather Label */}
                  <div className="flex flex-col items-center gap-0.5 w-full">
                    {isRain ? (
                      <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-sky-500/20 border border-sky-400/30 text-sky-300 text-[10px] font-bold">
                        <Droplets className="w-2.5 h-2.5 shrink-0" />
                        <span>{slot.precipitationProbability}%</span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-400 truncate max-w-[80px] text-center font-medium">
                        {richInfo.shortLabel}
                      </span>
                    )}

                    {/* Wind Gust / Speed */}
                    <div className="flex items-center gap-0.5 text-[9px] text-slate-400">
                      <Wind className="w-2.5 h-2.5 shrink-0 text-slate-400" />
                      <span>{Math.round(slot.windSpeed)} km/h</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Slot Detailed Panel (if clicked) */}
      {selectedSlotIndex !== null && displayedSlots[selectedSlotIndex] && (
        <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-blue-500/40 text-xs text-slate-300 grid grid-cols-2 sm:grid-cols-4 gap-3 animate-in fade-in duration-150">
          <div>
            <span className="text-slate-400 block text-[10px]">Heure &amp; Ciel</span>
            <span className="font-bold text-white text-sm">
              {displayedSlots[selectedSlotIndex].dayLabel} à {displayedSlots[selectedSlotIndex].hourLabel}
            </span>
            <span className="text-sky-300 block text-[11px]">
              {displayedSlots[selectedSlotIndex].weatherDescription}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Température &amp; Ressenti</span>
            <span className="font-bold text-white text-sm">
              {formatTemp(displayedSlots[selectedSlotIndex].temperature)}
            </span>
            <span className="text-slate-400 block text-[11px]">
              Ressenti {displayedSlots[selectedSlotIndex].feelsLike !== undefined ? formatTemp(displayedSlots[selectedSlotIndex].feelsLike) : '--'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Précipitations &amp; Risque</span>
            <span className="font-bold text-sky-400 text-sm">
              {displayedSlots[selectedSlotIndex].rainMm > 0 ? `${displayedSlots[selectedSlotIndex].rainMm} mm` : '0 mm (Sec)'}
            </span>
            <span className="text-slate-400 block text-[11px]">
              Proba : {displayedSlots[selectedSlotIndex].precipitationProbability}%
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Vent &amp; Rafales</span>
            <span className="font-bold text-white text-sm">
              {Math.round(displayedSlots[selectedSlotIndex].windSpeed)} km/h
            </span>
            <span className="text-amber-300 block text-[11px]">
              Rafales {Math.round(displayedSlots[selectedSlotIndex].windGust || displayedSlots[selectedSlotIndex].windSpeed * 1.3)} km/h
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
