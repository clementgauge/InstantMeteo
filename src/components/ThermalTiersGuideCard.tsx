import React, { useState } from 'react';
import { Thermometer, ShieldAlert, CheckCircle2, ChevronDown, ChevronUp, Sparkles, Shirt, HeartPulse, Sprout } from 'lucide-react';
import { THERMAL_TIERS, getThermalTierForTemp } from '../utils/thermalTiers';
import { HourlyForecast } from '../types/weather';

interface ThermalTiersGuideCardProps {
  currentTemp: number;
  hourlyList?: HourlyForecast[];
  tempUnit: 'C' | 'F';
}

export const ThermalTiersGuideCard: React.FC<ThermalTiersGuideCardProps> = ({
  currentTemp,
  hourlyList = [],
  tempUnit
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTierId, setActiveTierId] = useState<string | null>(null);

  const currentTier = getThermalTierForTemp(currentTemp);

  const formatT = (c: number) => {
    if (tempUnit === 'F') return `${Math.round((c * 9/5 + 32) * 10) / 10}°F`;
    return `${c > 0 ? `+${c}` : c}°C`;
  };

  // Count hours in each tier across the next 24 or 168 hours
  const tierHourDistribution = THERMAL_TIERS.map(tier => {
    const hoursInTier = hourlyList.filter(h => {
      const t = h.temperature;
      return t >= tier.minTemp && t <= tier.maxTemp;
    }).length;
    return {
      tier,
      hoursCount: hoursInTier
    };
  });

  return (
    <div id="thermal-tiers-guide-card" className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 sm:p-7 shadow-2xl backdrop-blur-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-2xl shadow-lg">
            🌡️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-white">
                Paliers Thermiques & Confort Physiologique
              </h2>
              <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/30">
                Échelle 9 Paliers
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Classification bioclimatique standardisée pour l'habillement, la santé et l'agriculture
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2.5 px-3.5 py-2 rounded-2xl border ${currentTier.tailwindBg} ${currentTier.tailwindBorder}`}>
            <span className="text-xl">{currentTier.iconEmoji}</span>
            <div className="text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Palier Actuel ({formatT(currentTemp)})</span>
              <span className={`text-xs font-black ${currentTier.tailwindText}`}>{currentTier.name}</span>
            </div>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition border border-slate-700 cursor-pointer"
          >
            <span>{isExpanded ? 'Réduire' : 'Guide Complet'}</span>
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Active Palier Focus Summary */}
      <div className={`rounded-2xl border p-4 sm:p-5 ${currentTier.tailwindBg} ${currentTier.tailwindBorder} transition-all`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{currentTier.iconEmoji}</span>
              <h3 className={`text-base sm:text-lg font-black ${currentTier.tailwindText}`}>
                {currentTier.name} ({currentTier.tempRangeLabel})
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
              {currentTier.description}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="rounded-xl bg-black/40 p-3 border border-white/5 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-300">
                <Shirt className="h-3.5 w-3.5" />
                <span>Habillement Conseillé</span>
              </div>
              <p className="text-[11px] text-slate-300 line-clamp-2">{currentTier.clothingAdvice}</p>
            </div>

            <div className="rounded-xl bg-black/40 p-3 border border-white/5 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-rose-300">
                <HeartPulse className="h-3.5 w-3.5" />
                <span>Impact Santé & Confort</span>
              </div>
              <p className="text-[11px] text-slate-300 line-clamp-2">{currentTier.healthComfortNotice}</p>
            </div>

            <div className="rounded-xl bg-black/40 p-3 border border-white/5 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-emerald-300">
                <Sprout className="h-3.5 w-3.5" />
                <span>Agriculture & Jardins</span>
              </div>
              <p className="text-[11px] text-slate-300 line-clamp-2">{currentTier.agriculturalImpact}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 9-tier visual horizontal gradient strip */}
      <div>
        <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2">
          <span>Échelle des 9 Paliers Thermiques</span>
          <span>Distribution sur la prévision</span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-1.5">
          {tierHourDistribution.map(({ tier, hoursCount }) => {
            const isCurrent = tier.tierId === currentTier.tierId;
            const isSelected = activeTierId === tier.tierId;
            return (
              <button
                key={tier.tierId}
                onClick={() => setActiveTierId(isSelected ? null : tier.tierId)}
                className={`rounded-xl p-2.5 text-center transition-all cursor-pointer border relative text-left ${
                  isCurrent
                    ? 'ring-2 ring-white border-white bg-slate-800'
                    : isSelected
                    ? 'border-blue-400 bg-slate-800 ring-1 ring-blue-400'
                    : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900/60'
                }`}
              >
                {isCurrent && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-white text-slate-950 px-1.5 py-0.2 text-[8px] font-black uppercase">
                    Actuel
                  </span>
                )}
                <div className="text-xl text-center mb-1">{tier.iconEmoji}</div>
                <div className={`text-[10px] font-black leading-tight truncate text-center ${tier.tailwindText}`}>
                  {tier.name.split('/')[0]}
                </div>
                <div className="text-[9px] text-slate-400 text-center font-mono mt-0.5">
                  {tier.tempRangeLabel}
                </div>
                {hoursCount > 0 && (
                  <div className="mt-1.5 text-center">
                    <span className="rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30 px-1.5 py-0.5 text-[9px] font-bold">
                      {hoursCount}h prévues
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Expanded Table of All 9 Tiers */}
      {isExpanded && (
        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-400" />
            Répertoire Exhaustif des 9 Paliers Thermiques
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {THERMAL_TIERS.map(t => (
              <div
                key={t.tierId}
                className={`rounded-xl border p-3.5 space-y-2 ${t.tailwindBg} ${t.tailwindBorder}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{t.iconEmoji}</span>
                    <span className={`text-xs font-black ${t.tailwindText}`}>{t.name}</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-300 bg-black/40 px-2 py-0.5 rounded">
                    {t.tempRangeLabel}
                  </span>
                </div>

                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {t.description}
                </p>

                <div className="text-[10px] space-y-1 pt-1 border-t border-white/10 text-slate-300">
                  <div><strong className="text-amber-300">Vêtements :</strong> {t.clothingAdvice}</div>
                  <div><strong className="text-rose-300">Santé :</strong> {t.healthComfortNotice}</div>
                  <div><strong className="text-emerald-300">Jardin :</strong> {t.agriculturalImpact}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
