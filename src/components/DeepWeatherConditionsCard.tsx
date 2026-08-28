import React, { useState } from 'react';
import { CurrentWeather, LocationPoint } from '../types/weather';
import { 
  Cloud, 
  Eye, 
  Compass, 
  Wind, 
  Thermometer, 
  Sun, 
  Waves, 
  Gauge, 
  Activity, 
  Sparkles, 
  ShieldCheck, 
  Info,
  Layers,
  Zap,
  Droplets,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface DeepWeatherConditionsCardProps {
  weather: CurrentWeather;
  station: LocationPoint;
  seniorMode: boolean;
  tempUnit?: 'C' | 'F';
}

export const DeepWeatherConditionsCard: React.FC<DeepWeatherConditionsCardProps> = ({
  weather,
  station,
  seniorMode,
  tempUnit = 'C'
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const syn = weather.synopticConditions;

  if (!syn) return null;

  const formatTemp = (celsius: number) => {
    if (tempUnit === 'F') {
      return `${Math.round((celsius * 9/5 + 32) * 10) / 10}°F`;
    }
    return `${celsius}°C`;
  };

  const getOctasLabel = (octas: number) => {
    if (octas === 0) return "0/8 (Ciel pur / Clair)";
    if (octas <= 2) return `${octas}/8 (Très peu nuageux)`;
    if (octas <= 4) return `${octas}/8 (Éclaircies)`;
    if (octas <= 6) return `${octas}/8 (Nuageux)`;
    if (octas === 7) return "7/8 (Très nuageux)";
    return "8/8 (Ciel totalement couvert)";
  };

  const beaufort = syn.beaufortScale;

  return (
    <div id="deep-weather-conditions-card" className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 p-6 shadow-xl backdrop-blur">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-blue-600/20 p-2.5 text-blue-400 border border-blue-500/30">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400">
              <span>Synoptique & Aérologie Approfondie</span>
              <span>•</span>
              <span className="text-slate-400">Temps qu'il fait en direct</span>
            </div>
            <h3 className={`font-black text-white ${seniorMode ? 'text-2xl' : 'text-xl'}`}>
              Radiographie Complète des Conditions Atmosphériques
            </h3>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-slate-700 transition"
        >
          <span>{isExpanded ? 'Réduire' : 'Développer'}</span>
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {/* Air Mass & Synoptic Summary Banner */}
      <div className="mt-4 rounded-2xl bg-blue-950/40 border border-blue-500/30 p-4">
        <div className="flex items-start gap-3">
          <Layers className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-300">Masse d'air active :</span>
              <span className="rounded-md bg-blue-500/20 px-2 py-0.5 text-xs font-extrabold text-blue-200 border border-blue-400/30">
                {syn.airMassType}
              </span>
            </div>
            <p className={`text-slate-300 leading-relaxed mt-1.5 ${seniorMode ? 'text-base' : 'text-xs'}`}>
              {syn.synopticSummary}
            </p>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-6 space-y-6">
          {/* 4 Thematic Columns Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Column 1: Nébulosité & Étages Nuageux */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
              <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase mb-3">
                <Cloud className="h-4 w-4" />
                <span>Nébulosité & Étages</span>
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center border-b border-slate-800/80 pb-1.5">
                  <span className="text-slate-400">Couverture totale :</span>
                  <span className="font-bold text-white">{syn.cloudCoverTotalPct}%</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-800/80 pb-1.5">
                  <span className="text-slate-400">Échelle en octas :</span>
                  <span className="font-bold text-sky-300">{getOctasLabel(syn.cloudCoverOctas)}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-800/80 pb-1.5">
                  <span className="text-slate-400">Nuages bas :</span>
                  <span className="font-bold text-slate-200">{syn.cloudCoverLowPct}% (Stratus)</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-800/80 pb-1.5">
                  <span className="text-slate-400">Nuages moyens :</span>
                  <span className="font-bold text-slate-200">{syn.cloudCoverMidPct}% (Altocumulus)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Nuages hauts :</span>
                  <span className="font-bold text-slate-200">{syn.cloudCoverHighPct}% (Cirrus)</span>
                </div>
              </div>
            </div>

            {/* Column 2: Visibilité & Plafond Aéronautique */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase mb-3">
                <Eye className="h-4 w-4" />
                <span>Visibilité & Plafond</span>
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center border-b border-slate-800/80 pb-1.5">
                  <span className="text-slate-400">Portée optique :</span>
                  <span className="font-bold text-indigo-300">{syn.visibilityKm} km</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-800/80 pb-1.5">
                  <span className="text-slate-400">Qualité de vision :</span>
                  <span className="font-bold text-slate-200">{syn.visibilityDescription}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-800/80 pb-1.5">
                  <span className="text-slate-400">Plafond nuageux :</span>
                  <span className="font-bold text-amber-300">{syn.cloudCeilingMeters} m sol</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-800/80 pb-1.5">
                  <span className="text-slate-400">Rayonnement global :</span>
                  <span className="font-bold text-amber-400">{syn.solarRadiationWm2} W/m²</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Limite 0°C (Isotherme) :</span>
                  <span className="font-bold text-cyan-300">{weather.altitudeMetrics?.isotherm0Altitude ?? 2500} m</span>
                </div>
              </div>
            </div>

            {/* Column 3: Bioclimatologie & Stress Thermique */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
              <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase mb-3">
                <Thermometer className="h-4 w-4" />
                <span>Thermique & Bioclimat</span>
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center border-b border-slate-800/80 pb-1.5">
                  <span className="text-slate-400">Indice Humidex :</span>
                  <span className={`font-bold ${syn.humidexIndex >= 30 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {syn.humidexIndex} {syn.humidexIndex >= 30 ? '(Inconfort)' : '(Agréable)'}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-800/80 pb-1.5">
                  <span className="text-slate-400">Thermomètre mouillé :</span>
                  <span className="font-bold text-cyan-300">{formatTemp(syn.wetBulbTemperature)}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-800/80 pb-1.5">
                  <span className="text-slate-400">Refroidissement éolien :</span>
                  <span className="font-bold text-teal-300">{formatTemp(syn.windChill)}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-800/80 pb-1.5">
                  <span className="text-slate-400">Point de rosée :</span>
                  <span className="font-bold text-blue-300">{formatTemp(weather.altitudeMetrics?.dewPoint ?? 12)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Humidité absolue :</span>
                  <span className="font-bold text-slate-200">{syn.absoluteHumidityGm3} g/m³</span>
                </div>
              </div>
            </div>

            {/* Column 4: Échelle Beaufort & Dynamique Éolienne */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
              <div className="flex items-center gap-2 text-teal-400 text-xs font-bold uppercase mb-3">
                <Wind className="h-4 w-4" />
                <span>Échelle de Beaufort</span>
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center border-b border-slate-800/80 pb-1.5">
                  <span className="text-slate-400">Force Beaufort :</span>
                  <span className="font-extrabold text-teal-300 text-sm">Force {beaufort.force} / 12</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-800/80 pb-1.5">
                  <span className="text-slate-400">Appellation :</span>
                  <span className="font-bold text-slate-200">{beaufort.description}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-800/80 pb-1.5">
                  <span className="text-slate-400">Plage de vitesse :</span>
                  <span className="font-bold text-slate-300">{beaufort.windSpeedKmhRange}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-800/80 pb-1.5">
                  <span className="text-slate-400">Orientation précise :</span>
                  <span className="font-bold text-teal-300">{weather.windDirection}°</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">État marin / côtier :</span>
                  <span className="font-medium text-slate-400 truncate max-w-[130px]" title={beaufort.seaDescription}>
                    {beaufort.seaDescription}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
