import React, { useState, useMemo } from 'react';
import { CloudRain, RefreshCw, TrendingUp, TrendingDown, Droplets, CheckCircle2 } from 'lucide-react';
import { LocationPoint, CurrentWeather, HourlyForecast } from '../types/weather';

interface MeteoFrancePluieEtNormalesWidgetProps {
  station: LocationPoint;
  weather: CurrentWeather;
  hourly?: HourlyForecast[];
  tempUnit?: 'C' | 'F';
  onRefresh?: () => void;
}

export const MeteoFrancePluieEtNormalesWidget: React.FC<MeteoFrancePluieEtNormalesWidgetProps> = ({
  station,
  weather,
  hourly = [],
  tempUnit = 'C',
  onRefresh
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastRefreshedTime, setLastRefreshedTime] = useState<Date>(new Date());

  // Handle refresh click
  const handleUpdate = () => {
    setIsUpdating(true);
    setLastRefreshedTime(new Date());
    if (onRefresh) {
      onRefresh();
    }
    setTimeout(() => {
      setIsUpdating(false);
    }, 600);
  };

  // -------------------------------------------------------------
  // 1. PLUIE DANS L'HEURE (MÉTÉO-FRANCE STYLE)
  // -------------------------------------------------------------
  // Format current start time and end time (+60 min)
  const timeLabels = useMemo(() => {
    const start = lastRefreshedTime;
    const end = new Date(start.getTime() + 60 * 60 * 1000);

    const pad = (n: number) => n.toString().padStart(2, '0');
    return {
      startTime: `${pad(start.getHours())} : ${pad(start.getMinutes())}`,
      endTime: `${pad(end.getHours())} : ${pad(end.getMinutes())}`
    };
  }, [lastRefreshedTime]);

  // Determine precipitation profile for the 6 slots (5, 10, 20, 30, 40, 50 min)
  const rainSlots = useMemo(() => {
    const currentRain = weather.precipitation || 0;
    const currentCondition = (weather.weatherDescription || '').toLowerCase();
    const nextHourRain = hourly[0]?.precipitationMm || hourly[1]?.precipitationMm || 0;
    const pop = hourly[0]?.precipitationProbability || 0;

    const hasRainNow = currentRain > 0.1 || currentCondition.includes('pluie') || currentCondition.includes('averse');
    const hasRainSoon = nextHourRain > 0.2 || pop >= 60;

    // Slot intervals in minutes
    const slots = [
      { label: '5 min', key: 5 },
      { label: '10 min', key: 10 },
      { label: '20 min', key: 20 },
      { label: '30 min', key: 30 },
      { label: '40 min', key: 40 },
      { label: '50 min', key: 50 },
    ];

    return slots.map((s, idx) => {
      let level: 'none' | 'light' | 'moderate' | 'heavy' = 'none';
      if (hasRainNow) {
        if (currentRain > 3) level = 'heavy';
        else if (currentRain > 1) level = 'moderate';
        else level = 'light';
      } else if (hasRainSoon && idx >= 2) {
        level = 'light';
      }
      return {
        ...s,
        level
      };
    });
  }, [weather.precipitation, weather.weatherDescription, hourly]);

  const hasAnyPrecipitation = rainSlots.some(s => s.level !== 'none');
  const rainSummaryText = hasAnyPrecipitation 
    ? 'Risque d’ondées dans l’heure' 
    : 'Pas de précipitations';

  // -------------------------------------------------------------
  // 2. COMPARAISON AUX NORMALES DE SAISON
  // -------------------------------------------------------------
  // Current month in French full lower case
  const currentMonthName = useMemo(() => {
    return new Intl.DateTimeFormat('fr-FR', { month: 'long' }).format(new Date());
  }, []);

  // Compute seasonal normals for the current station & month
  const climateComparison = useMemo(() => {
    const month = new Date().getMonth(); // 0..11
    // Approximate climatic standard normals for temperate France by month
    // Minima & Maxima standard averages (Jan..Dec)
    const franceNormalsMin = [2, 2, 4, 6, 10, 13, 15, 15, 12, 9, 5, 3];
    const franceNormalsMax = [7, 8, 12, 15, 19, 23, 26, 26, 21, 16, 11, 8];

    // Regional adjustments (South is warmer, mountains colder)
    const altitude = station.altitude || 0;
    const isSouth = station.latitude < 45.0;
    const altCorrection = Math.round(altitude / 200);

    const normalMin = franceNormalsMin[month] + (isSouth ? 2 : 0) - altCorrection;
    const normalMax = franceNormalsMax[month] + (isSouth ? 3 : 0) - altCorrection;

    // Today's actual or forecast min & max
    const todayTemp = Math.round(weather.temperature);
    const hourlyTemps = hourly.slice(0, 24).map(h => h.temperature);
    const actualMin = hourlyTemps.length > 0 ? Math.round(Math.min(...hourlyTemps)) : Math.round(todayTemp - 3);
    const actualMax = hourlyTemps.length > 0 ? Math.round(Math.max(...hourlyTemps)) : Math.round(todayTemp + 3);

    const diffMin = actualMin - normalMin;
    const diffMax = actualMax - normalMax;

    return {
      normalMin,
      normalMax,
      actualMin,
      actualMax,
      diffMin,
      diffMax,
      diffMinStr: diffMin > 0 ? `+${diffMin}°` : diffMin === 0 ? `0°` : `${diffMin}°`,
      diffMaxStr: diffMax > 0 ? `+${diffMax}°` : diffMax === 0 ? `0°` : `${diffMax}°`
    };
  }, [station.latitude, station.altitude, weather.temperature, hourly]);

  const cityName = station.name || 'Versailles';

  return (
    <div 
      id="meteo-france-pluie-et-normales-widget" 
      className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 my-4 font-sans text-slate-900 select-none"
    >
      {/* ========================================================= */}
      {/* CARD 1 : PLUIE DANS L'HEURE (Exact clone of user upload)  */}
      {/* ========================================================= */}
      <div className="flex flex-col">
        {/* Title with dark cyan rain icon */}
        <div className="flex items-center gap-2 mb-2">
          <CloudRain className="w-5 h-5 text-[#00609b]" />
          <h3 className="text-[17px] font-extrabold text-[#00609b] tracking-tight">
            Pluie dans l'heure
          </h3>
        </div>

        {/* White Card Frame */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5 flex flex-col justify-between">
          {/* Header row: Status + Button METTRE À JOUR */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-base sm:text-[17px] font-bold text-[#0c2340]">
              {rainSummaryText}
            </span>

            <button
              type="button"
              onClick={handleUpdate}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#00609b] hover:bg-[#004f80] active:scale-95 text-white text-xs font-black tracking-wide uppercase transition shadow-sm cursor-pointer"
            >
              <span>METTRE À JOUR</span>
              <RefreshCw className={`w-3 h-3 ${isUpdating ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Time range: Start (ex: 14 : 55) and End (ex: 15 : 55) */}
          <div className="flex items-center justify-between text-[#00609b] font-bold text-sm mt-4 px-1">
            <span>{timeLabels.startTime}</span>
            <span>{timeLabels.endTime}</span>
          </div>

          {/* 6 Interval Icons Row */}
          <div className="grid grid-cols-6 gap-1.5 sm:gap-2 mt-2">
            {rainSlots.map((slot) => (
              <div 
                key={slot.key} 
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-100/90 border border-slate-200/80 transition"
              >
                {/* Diagonal slashed droplet for 'none', blue droplets for rain */}
                {slot.level === 'none' ? (
                  <div className="relative w-6 h-6 flex items-center justify-center text-slate-500">
                    {/* Droplet outline */}
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-slate-400 stroke-slate-500 stroke-1">
                      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                    </svg>
                    {/* Diagonal Slash */}
                    <div className="absolute w-5 h-0.5 bg-slate-600 rotate-45 rounded-full" />
                  </div>
                ) : (
                  <div className="relative w-6 h-6 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-sky-500 stroke-sky-600 stroke-1">
                      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 6 Interval Time Labels (5 min, 10 min, 20 min, 30 min, 40 min, 50 min) */}
          <div className="grid grid-cols-6 gap-1.5 sm:gap-2 mt-2 text-center">
            {rainSlots.map((slot) => (
              <span key={slot.key} className="text-[11px] font-semibold text-slate-500 leading-tight">
                {slot.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* CARD 2 : COMPARAISON AUX NORMALES (Exact clone of upload)  */}
      {/* ========================================================= */}
      <div className="flex flex-col">
        {/* Title with dark cyan chart icon */}
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-5 h-5 text-[#00609b]" />
          <h3 className="text-[17px] font-extrabold text-[#00609b] tracking-tight">
            Comparaison aux normales
          </h3>
        </div>

        {/* White Card Frame */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5 flex flex-col justify-between">
          {/* Dual Grey Blocks Container */}
          <div className="grid grid-cols-2 gap-3">
            {/* Left Block: Minimale du jour */}
            <div className="bg-[#f4f5f7] rounded-xl p-3 sm:p-3.5 flex flex-col justify-between border border-slate-200/60">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[13px] font-bold text-slate-800 leading-tight">Minimale</div>
                  <div className="text-[11px] text-slate-500 font-medium">du jour</div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-[#009ee3] tracking-tight">
                  {climateComparison.actualMin}°
                </div>
              </div>

              {/* Ecart with colored pill */}
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-200/60">
                <span className="text-xs font-semibold text-slate-600">Écart</span>
                <span 
                  className={`px-2 py-0.5 rounded-full text-xs font-black text-white ${
                    climateComparison.diffMin >= 0 ? 'bg-[#e52424]' : 'bg-[#009ee3]'
                  }`}
                >
                  {climateComparison.diffMinStr}
                </span>
              </div>
            </div>

            {/* Right Block: Maximale du jour */}
            <div className="bg-[#f4f5f7] rounded-xl p-3 sm:p-3.5 flex flex-col justify-between border border-slate-200/60">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[13px] font-bold text-slate-800 leading-tight">Maximale</div>
                  <div className="text-[11px] text-slate-500 font-medium">du jour</div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-[#e52424] tracking-tight">
                  {climateComparison.actualMax}°
                </div>
              </div>

              {/* Ecart with colored pill */}
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-200/60">
                <span className="text-xs font-semibold text-slate-600">Écart</span>
                <span 
                  className={`px-2 py-0.5 rounded-full text-xs font-black text-white ${
                    climateComparison.diffMax >= 0 ? 'bg-[#e52424]' : 'bg-[#009ee3]'
                  }`}
                >
                  {climateComparison.diffMaxStr}
                </span>
              </div>
            </div>
          </div>

          {/* Subtitle Explanatory Text */}
          <div className="mt-4 pt-2 text-center text-xs text-slate-600 leading-relaxed font-medium">
            Écarts avec les moyennes de températures minimales et maximales du mois de{' '}
            <strong className="font-bold text-slate-900">{currentMonthName}</strong> sur{' '}
            <strong className="font-bold text-slate-900">{cityName}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
