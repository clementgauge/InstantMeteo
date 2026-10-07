import React, { useMemo, useState } from 'react';
import {
  Flower2,
  ShieldCheck,
  Wind,
  Droplets,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Eye,
  Home,
  HeartPulse
} from 'lucide-react';
import { CurrentWeather, LocationPoint, PollenSpeciesReading } from '../types/weather';
import { computeRealtimePollenTracking } from '../services/pollenService';

interface PollenRealtimeTrackerCardProps {
  weather: CurrentWeather;
  station: LocationPoint;
  seniorMode?: boolean;
}

export const PollenRealtimeTrackerCard: React.FC<PollenRealtimeTrackerCardProps> = ({
  weather,
  station,
  seniorMode = false,
}) => {
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<string | null>(null);

  const pollen = useMemo(() => {
    if (weather.pollenData) return weather.pollenData;
    if (weather.airQualityDetails?.pollenData) return weather.airQualityDetails.pollenData;
    return computeRealtimePollenTracking(station, {
      temperature: weather.temperature,
      humidity: weather.humidity,
      windSpeed: weather.windSpeed,
      precipitation: weather.precipitation,
      uvIndex: weather.uvIndex,
      isDay: weather.isDay,
    });
  }, [weather, station]);

  // Sur la jauge de Rouge (0% = Alerte allergique maximale à gauche) à Vert (100% = Air sain sans pollen à droite) :
  // Plus le risque pollinique est faible, plus le curseur se situe vers le VERT (droite).
  // Plus le risque pollinique est élevé, plus le curseur se situe vers le ROUGE (gauche).
  const redToGreenPositionPct = Math.max(3, Math.min(97, 100 - pollen.overallScore100));
  // Angle de l'aiguille sur le demi-cercle (-90° = extrême gauche ROUGE, +90° = extrême droite VERT)
  const needleAngleDeg = -90 + (redToGreenPositionPct / 100) * 180;

  const getRiskBadgeStyle = (riskIndex: number) => {
    switch (riskIndex) {
      case 0:
      case 1:
        return {
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          text: 'text-emerald-400',
          dot: 'bg-emerald-400',
          hex: '#10b981',
        };
      case 2:
        return {
          badge: 'bg-lime-500/20 text-lime-300 border-lime-500/40',
          text: 'text-lime-400',
          dot: 'bg-lime-400',
          hex: '#84cc16',
        };
      case 3:
        return {
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          text: 'text-amber-400',
          dot: 'bg-amber-400',
          hex: '#f59e0b',
        };
      case 4:
        return {
          badge: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
          text: 'text-orange-400',
          dot: 'bg-orange-500',
          hex: '#f97316',
        };
      default:
        return {
          badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          text: 'text-rose-400',
          dot: 'bg-rose-500',
          hex: '#ef4444',
        };
    }
  };

  const overallStyle = getRiskBadgeStyle(pollen.overallRiskIndex);
  const selectedSpecies: PollenSpeciesReading =
    pollen.species.find((s) => s.id === selectedSpeciesId) || pollen.species[0];

  const getCategoryIcon = (category: 'Domicile' | 'Extérieur' | 'Hygiène' | 'Traitement') => {
    switch (category) {
      case 'Domicile':
        return <Home className="h-4 w-4 text-sky-400 shrink-0" />;
      case 'Extérieur':
        return <Eye className="h-4 w-4 text-amber-400 shrink-0" />;
      case 'Hygiène':
        return <Sparkles className="h-4 w-4 text-emerald-400 shrink-0" />;
      case 'Traitement':
        return <HeartPulse className="h-4 w-4 text-rose-400 shrink-0" />;
    }
  };

  return (
    <div
      id="pollen-realtime-tracker-card"
      className="mt-4 rounded-2xl border border-slate-800 bg-gradient-to-br from-[#0c1424] via-slate-900/95 to-slate-950 p-4 sm:p-6 shadow-xl backdrop-blur-xl"
    >
      {/* En-tête du module Pollen */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/90 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shadow-inner shrink-0">
            <Flower2 className="h-5 w-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300">
                Aérobiologie &amp; Allergies en Direct
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                {station.name} ({station.altitude ?? 0} m)
              </span>
            </div>
            <h4 className={`font-black text-white mt-0.5 ${seniorMode ? 'text-xl sm:text-2xl' : 'text-base sm:text-lg'}`}>
              Suivi des Taux de Pollen en Temps Réel &amp; Prévention Allergique
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-black ${overallStyle.badge}`}>
            <span className={`h-2 w-2 rounded-full ${overallStyle.dot} animate-pulse`} />
            <span>{pollen.overallStatusLabel} (Indice {pollen.overallRiskIndex}/5)</span>
          </span>
        </div>
      </div>

      {/* Grille principale : Colonne 1 = Jauge de Rouge à Vert + Météo Pollinique | Colonne 2 = Taux par espèce | Colonne 3 = Conseils de prévention */}
      <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* COLONNE 1 (4 cols) : JAUGE DE ROUGE À VERT */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-800 bg-slate-950/90 p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-300">
                Jauge Pollinique (Rouge ➔ Vert)
              </span>
              <span className="text-[11px] font-bold text-slate-400">
                Total : <strong className="text-white">{pollen.totalGrainsM3} grains/m³</strong>
              </span>
            </div>

            {/* Demi-cercle SVG : Jauge de Rouge (Gauche) à Vert (Droite) */}
            <div className="relative mx-auto w-full max-w-[250px] pt-2 pb-1 flex flex-col items-center">
              <svg viewBox="0 0 220 128" className="w-full overflow-visible">
                <defs>
                  {/* Dégradé de ROUGE (gauche : x1="0%") vers VERT (droite : x2="100%") */}
                  <linearGradient id="pollenRedToGreenGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="25%" stopColor="#f97316" />
                    <stop offset="50%" stopColor="#eab308" />
                    <stop offset="75%" stopColor="#84cc16" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>

                {/* Piste de fond */}
                <path
                  d="M 24 105 A 86 86 0 0 1 196 105"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="18"
                  strokeLinecap="round"
                />

                {/* Arc principal gradué de ROUGE (gauche) à VERT (droite) */}
                <path
                  d="M 24 105 A 86 86 0 0 1 196 105"
                  fill="none"
                  stroke="url(#pollenRedToGreenGrad)"
                  strokeWidth="16"
                  strokeLinecap="round"
                />

                {/* Repères de graduation */}
                <text x="14" y="122" fill="#f87171" fontSize="9" fontWeight="800" textAnchor="start">
                  ROUGE (Fort)
                </text>
                <text x="110" y="12" fill="#facc15" fontSize="8" fontWeight="700" textAnchor="middle">
                  MODÉRÉ
                </text>
                <text x="206" y="122" fill="#34d399" fontSize="9" fontWeight="800" textAnchor="end">
                  VERT (Faible)
                </text>

                {/* Aiguille dynamique */}
                <g transform={`translate(110, 105) rotate(${needleAngleDeg})`}>
                  <polygon points="-3.5,0 0,-74 3.5,0" fill="#ffffff" />
                  <circle cx="0" cy="-74" r="4" fill={overallStyle.hex} stroke="#ffffff" strokeWidth="1.5" />
                </g>

                {/* Pivot central */}
                <circle cx="110" cy="105" r="8" fill="#0f172a" stroke="#ffffff" strokeWidth="2.5" />
              </svg>

              {/* Valeur centrale sous la jauge */}
              <div className="text-center -mt-1">
                <div className="text-2xl font-black text-white leading-tight">
                  Indice {pollen.overallRiskIndex} <span className="text-sm font-bold text-slate-400">/ 5</span>
                </div>
                <div className={`text-xs font-extrabold mt-0.5 ${overallStyle.text}`}>
                  {pollen.overallStatusLabel} • Dominant : {pollen.dominantPollenName}
                </div>
              </div>
            </div>

            {/* Barre linéaire complémentaire de Rouge à Vert avec curseur */}
            <div className="mt-3 space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider">
                <span className="text-rose-400">🔴 Rouge : Alerte / Très élevé</span>
                <span className="text-emerald-400">🟢 Vert : Air sain / Faible</span>
              </div>
              <div
                className="relative h-3.5 w-full rounded-full p-0.5 shadow-inner border border-slate-700/80"
                style={{
                  background: 'linear-gradient(90deg, #ef4444 0%, #f97316 25%, #eab308 50%, #84cc16 75%, #10b981 100%)',
                }}
              >
                <div
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-5 w-5 rounded-full bg-white border-2 border-slate-950 shadow-lg transition-all duration-500 flex items-center justify-center"
                  style={{ left: `${redToGreenPositionPct}%` }}
                  title={`Position sur la jauge Rouge ➔ Vert : ${pollen.overallStatusLabel}`}
                >
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: overallStyle.hex }} />
                </div>
              </div>
            </div>
          </div>

          {/* Encadré Météo & Dispersion Aérobiologique */}
          <div className="mt-4 rounded-xl bg-slate-900/90 border border-slate-800 p-3 space-y-2 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                {pollen.isWashoutActive ? (
                  <Droplets className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                ) : (
                  <Wind className="h-3.5 w-3.5 text-teal-400 shrink-0" />
                )}
                <span>{pollen.dispersionFactorLabel}</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {pollen.dispersionFactorDetail}
            </p>
            <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between gap-2 text-[11px]">
              <span className="text-slate-400 flex items-center gap-1">
                <Clock className="h-3 w-3 text-emerald-400" />
                <span>Aération conseillée :</span>
              </span>
              <span className="font-bold text-emerald-300 text-right">{pollen.optimalVentilationWindow}</span>
            </div>
          </div>
        </div>

        {/* COLONNE 2 (4 cols) : TAUX EN TEMPS RÉEL PAR ESPÈCE DE POLLEN */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-800 bg-slate-950/90 p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs font-black uppercase tracking-wider text-slate-300">
                Concentrations par Taxon (grains/m³)
              </span>
              <span className="text-[10px] text-slate-400">Cliquez pour détailler</span>
            </div>

            <div className="space-y-2.5">
              {pollen.species.map((sp) => {
                const spStyle = getRiskBadgeStyle(sp.riskIndex);
                // Position sur la jauge Rouge (0% gauche) ➔ Vert (100% droite)
                const spRedToGreenPct = Math.max(4, Math.min(96, 100 - sp.riskScore100));
                const isSelected = selectedSpecies.id === sp.id;

                return (
                  <button
                    key={sp.id}
                    type="button"
                    onClick={() => setSelectedSpeciesId(sp.id)}
                    className={`w-full text-left rounded-xl border p-2.5 transition cursor-pointer ${
                      isSelected
                        ? 'border-emerald-500/50 bg-slate-900 shadow-md'
                        : 'border-slate-800/90 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-900/80'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-white truncate">{sp.name}</span>
                          <span className="text-[10px] text-slate-400 truncate hidden sm:inline">
                            ({sp.category})
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-mono font-bold text-slate-200">
                          {sp.concentrationGrainsM3} <span className="text-[10px] text-slate-400">gr/m³</span>
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${spStyle.badge}`}>
                          {sp.levelLabel} ({sp.riskIndex}/5)
                        </span>
                      </div>
                    </div>

                    {/* Mini jauge Rouge ➔ Vert par espèce */}
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-[9px] font-bold text-rose-400 uppercase">Rouge</span>
                      <div
                        className="relative flex-1 h-2 rounded-full"
                        style={{
                          background:
                            'linear-gradient(90deg, #ef4444 0%, #f97316 25%, #eab308 50%, #84cc16 75%, #10b981 100%)',
                        }}
                      >
                        <div
                          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-3.5 w-3.5 rounded-full bg-white border-2 border-slate-950 shadow"
                          style={{ left: `${spRedToGreenPct}%` }}
                        />
                      </div>
                      <span className="text-[9px] font-bold text-emerald-400 uppercase">Vert</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Fiche clinique du taxon sélectionné */}
          <div className="mt-3 rounded-xl bg-slate-900/90 border border-slate-800 p-3 text-xs">
            <div className="flex items-center justify-between gap-2 font-bold text-white">
              <span>Focus : {selectedSpecies.name}</span>
              <span className="text-[10px] text-emerald-300 font-semibold">
                Saison : {selectedSpecies.seasonWindow}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              <strong>Potentiel allergisant :</strong> {selectedSpecies.allergenicity} •{' '}
              <strong>Symptômes typiques :</strong> {selectedSpecies.symptoms}.
            </p>
          </div>
        </div>

        {/* COLONNE 3 (4 cols) : CONSEILS DE PRÉVENTION POUR LES PERSONNES ALLERGIQUES */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-800 bg-slate-950/90 p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-200">
                  Conseils de Prévention Allergiques
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                Adaptés au direct
              </span>
            </div>

            <div className="space-y-2.5">
              {pollen.preventionTips.map((tip, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-slate-800/90 bg-slate-900/75 p-3 space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 font-bold text-xs text-white">
                      {getCategoryIcon(tip.category)}
                      <span>{tip.title}</span>
                    </div>
                    <span
                      className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                        tip.priority === 'Haute'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : tip.priority === 'Recommandée'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {tip.priority}
                    </span>
                  </div>
                  <p className={`text-slate-300 leading-relaxed ${seniorMode ? 'text-sm' : 'text-[11px]'}`}>
                    {tip.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2 text-[10px] text-slate-400">
            <span className="flex items-center gap-1">
              {pollen.overallRiskIndex >= 3 ? (
                <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              )}
              <span>Source : {pollen.sourceLabel}</span>
            </span>
            <span className="font-semibold text-slate-300">Temps réel</span>
          </div>
        </div>
      </div>
    </div>
  );
};
