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
  const isRadarReconciledPrecip = Boolean(weather.isRadarReconciled || ((weather.radarDetectedPrecipRateMmH || 0) > 0));

  const hasAnyAlert = isHighWind || isThunderstorm || isHeavyRain || isSevereFrost || isRadarReconciledPrecip;

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
  } else if (isRadarReconciledPrecip) {
    const rate = weather.radarDetectedPrecipRateMmH || weather.precipitation || 0.5;
    alertTitle = `🌧️ Écho Radar Doppler ARAMIS : Précipitations Actives (${rate} mm/h)`;
    alertDesc = weather.radarReconciliationNotice || `Écho radar en temps réel sur ${station.name} : précipitations confirmées remplaçant le temps sec. Prévisions actualisées.`;
    alertLevel = 'yellow';
    Icon = CloudRain;
  }

  const borderClass = alertLevel === 'orange' ? 'border-amber-500 bg-amber-950/90 text-amber-100' : 'border-yellow-500 bg-yellow-950/90 text-yellow-100';
  const badgeClass = alertLevel === 'orange' ? 'bg-amber-500 text-slate-950 font-black' : 'bg-yellow-500 text-slate-950 font-black';

  return (
    <div 
      id="direct-screen-weather-alert"
      className={`rounded-xl sm:rounded-2xl border sm:border-2 ${borderClass} px-2.5 py-1.5 sm:p-3.5 sm:px-5 shadow-lg sm:shadow-2xl backdrop-blur-md flex items-center justify-between gap-2 sm:gap-3 transition-all animate-fadeIn relative z-30`}
    >
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        <div className="flex h-7 w-7 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-slate-950/60 border border-white/20">
          <Icon className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-amber-300 animate-pulse" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className={`hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-md uppercase tracking-wider shrink-0 ${badgeClass}`}>
              Vigilance Directe
            </span>
            <strong className={`font-black text-white truncate block ${seniorMode ? 'text-xs sm:text-base' : 'text-[11px] sm:text-sm'}`}>
              {alertTitle}
            </strong>
          </div>
          <p className="hidden sm:block text-xs text-slate-200 mt-0.5">
            {alertDesc}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        <button
          onClick={onOpenAlerts}
          className="flex items-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-[10px] sm:text-xs transition cursor-pointer border border-white/30"
        >
          <span>Détails</span>
          <ChevronRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
        </button>

        <button
          onClick={() => setIsDismissed(true)}
          className="px-2 py-1 sm:p-1.5 rounded-lg sm:rounded-xl bg-emerald-600/90 sm:bg-transparent hover:bg-emerald-500 sm:hover:bg-white/10 text-white sm:text-slate-300 font-black text-[10px] sm:text-xs transition cursor-pointer"
          title="Fermer la notification d'alerte"
        >
          <span className="sm:hidden">OK</span>
          <X className="hidden sm:block h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
