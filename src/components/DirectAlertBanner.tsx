import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, X, ChevronRight, BellRing, Wind, CloudRain, Flame, Snowflake, Zap } from 'lucide-react';
import { LocationPoint, CurrentWeather } from '../types/weather';

interface DirectAlertBannerProps {
  station: LocationPoint;
  weather: CurrentWeather | null;
  onOpenAlerts: () => void;
  seniorMode?: boolean;
}

export const DirectAlertBanner: React.FC<DirectAlertBannerProps> = ({
  station,
  weather,
  onOpenAlerts,
  seniorMode = false
}) => {
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  if (!weather || isDismissed) return null;

  // Detect active conditions requiring direct on-screen attention
  const isHighWind = (weather.windGust ?? weather.windSpeed) >= 65;
  const isThunderstorm = (weather.weatherCode >= 95 && weather.weatherCode <= 99) || (weather.capeJkg && weather.capeJkg > 900);
  const isHeavyRain = weather.precipitation >= 12 || (weather.weatherCode >= 65 && weather.weatherCode <= 67);
  const isSevereFrost = weather.temperature <= -4;

  const hasAnyAlert = isHighWind || isThunderstorm || isHeavyRain || isSevereFrost;

  if (!hasAnyAlert) return null;

  // Determine severity and message
  let alertTitle = 'Alerte Météorologique Active';
  let alertDesc = '';
  let alertLevel: 'yellow' | 'orange' | 'red' = 'yellow';
  let Icon = AlertTriangle;

  if (isThunderstorm) {
    alertTitle = '⚠️ Risque d\'Orages & Activité Électrique';
    alertDesc = `Instabilité convective marquée sur ${station.name} (${station.department}). Risque de fortes averses et foudre.`;
    alertLevel = weather.capeJkg && weather.capeJkg > 1500 ? 'orange' : 'yellow';
    Icon = Zap;
  } else if (isHighWind) {
    const gusts = Math.round(weather.windGust ?? weather.windSpeed * 1.3);
    alertTitle = `💨 Coup de Vent / Rafales : ${gusts} km/h`;
    alertDesc = `Rafales turbulentes enregistrées ou prévues à court terme à la station de ${station.name}.`;
    alertLevel = gusts >= 90 ? 'orange' : 'yellow';
    Icon = Wind;
  } else if (isHeavyRain) {
    alertTitle = '🌧️ Fortes Précipitations / Risque d\'Accumulation';
    alertDesc = `Précipitations soutenues (${weather.precipitation} mm). Sols sous surveillance.`;
    alertLevel = 'yellow';
    Icon = CloudRain;
  } else if (isSevereFrost) {
    alertTitle = `🧊 Gelée Sévère / Risque de Verglas : ${weather.temperature}°C`;
    alertDesc = `Gel marqué au sol et sur les chaussées à ${station.name} (${station.altitude} m).`;
    alertLevel = weather.temperature <= -7 ? 'orange' : 'yellow';
    Icon = Snowflake;
  }

  const borderClass = alertLevel === 'orange' ? 'border-amber-500 bg-amber-950/90 text-amber-100' : 'border-yellow-500 bg-yellow-950/90 text-yellow-100';
  const badgeClass = alertLevel === 'orange' ? 'bg-amber-500 text-slate-950 font-black' : 'bg-yellow-500 text-slate-950 font-black';

  return (
    <div 
      id="direct-screen-weather-alert"
      className={`rounded-2xl border-2 ${borderClass} p-3.5 sm:px-5 shadow-2xl backdrop-blur-md flex items-center justify-between gap-3 transition-all animate-fadeIn relative z-30`}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-950/60 border border-white/20">
          <Icon className="h-5 w-5 text-amber-300 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] px-2 py-0.5 rounded-md uppercase tracking-wider ${badgeClass}`}>
              Vigilance Directe
            </span>
            <strong className={`font-black text-white ${seniorMode ? 'text-base' : 'text-sm'}`}>
              {alertTitle}
            </strong>
          </div>
          <p className="text-xs text-slate-200 mt-0.5">
            {alertDesc}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onOpenAlerts}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs transition cursor-pointer border border-white/30"
        >
          <span>Détails</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>

        <button
          onClick={() => setIsDismissed(true)}
          className="p-1.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer"
          title="Fermer la notification d'alerte"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
