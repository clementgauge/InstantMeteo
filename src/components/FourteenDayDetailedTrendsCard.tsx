import React, { useMemo, useState } from 'react';
import {
  LocationPoint,
  DailyForecast,
  CurrentWeather
} from '../types/weather';

export interface FourteenDayDetailedTrendsCardProps {
  station: LocationPoint;
  currentTemp?: number;
  currentAnomaly?: number;
  dailyForecasts?: DailyForecast[];
  currentWeather?: CurrentWeather;
  seniorMode?: boolean;
  tempUnit?: 'C' | 'F';
  simplifiedMode?: boolean;
}

export const FourteenDayDetailedTrendsCard: React.FC<FourteenDayDetailedTrendsCardProps> = ({
  station
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  const iframeSrc = useMemo(() => {
    const params = new URLSearchParams();
    params.set('lat', String(station.latitude));
    params.set('lon', String(station.longitude));
    if (station.name) params.set('name', station.name);
    if (station.department) params.set('admin', station.department);
    if (station.country) params.set('country', station.country);
    return `/assets/aistudio/tendances-14-jours__1__fde09a2a.html?${params.toString()}`;
  }, [station.latitude, station.longitude, station.name, station.department, station.country]);

  return (
    <div className="relative w-full h-[calc(100vh-120px)] min-h-[780px] rounded-2xl overflow-hidden border border-slate-700/60 shadow-2xl bg-[#eef3fa]">
      {!isLoaded && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#eef3fa] text-slate-700 pointer-events-none">
          <div className="h-9 w-9 rounded-full border-3 border-blue-600 border-t-transparent animate-spin mb-3" />
          <span className="text-xs font-semibold tracking-wide text-slate-600">
            Chargement des tendances météo 14 jours — {station.name}…
          </span>
        </div>
      )}

      <iframe
        key={iframeSrc}
        src={iframeSrc}
        title={`Tendances météo 14 jours — ${station.name}`}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        style={{ width: '100%', height: '100%', border: 0 }}
        className="block bg-[#eef3fa]"
        allow="geolocation; fullscreen"
      />
    </div>
  );
};
