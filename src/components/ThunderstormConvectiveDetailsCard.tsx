import React, { useState } from 'react';
import { 
  Zap, 
  AlertTriangle, 
  ShieldAlert, 
  CloudRain, 
  Wind, 
  Clock, 
  Activity, 
  Compass, 
  Info, 
  Flame, 
  Sparkles, 
  ChevronRight, 
  CheckCircle,
  HelpCircle,
  Eye
} from 'lucide-react';
import { ThunderstormConvectiveAnalysis, HourlyStormRisk, LocationPoint } from '../types/weather';

interface ThunderstormConvectiveDetailsCardProps {
  thunderstormAnalysis?: ThunderstormConvectiveAnalysis;
  station: LocationPoint;
  seniorMode?: boolean;
}

export const ThunderstormConvectiveDetailsCard: React.FC<ThunderstormConvectiveDetailsCardProps> = ({
  thunderstormAnalysis,
  station,
  seniorMode = false
}) => {
  const [selectedHourIndex, setSelectedHourIndex] = useState<number>(0);
  const [showTheoryGuide, setShowTheoryGuide] = useState<boolean>(false);

  if (!thunderstormAnalysis) return null;

  const {
    globalStormRiskScore,
    globalVigilanceLevel,
    summaryDiagnosis,
    criticalWindow,
    imminentThreatMinutes,
    dominantMechanism,
    convectiveIndices,
    hourlyStormTimeline,
    safetyDirectives,
    radarProximitySummary,
    generatedAt
  } = thunderstormAnalysis;

  const selectedHour: HourlyStormRisk | undefined = hourlyStormTimeline[selectedHourIndex] || hourlyStormTimeline[0];

  const getVigilanceBadgeColor = (level: 'VERT' | 'JAUNE' | 'ORANGE' | 'ROUGE') => {
    switch (level) {
      case 'ROUGE':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-rose-950/40';
      case 'ORANGE':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-amber-950/40';
      case 'JAUNE':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50 shadow-yellow-950/40';
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-emerald-950/40';
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 75) return 'text-rose-400';
    if (score >= 50) return 'text-amber-400';
    if (score >= 25) return 'text-yellow-400';
    return 'text-emerald-400';
  };

  const getRiskBadge = (level: HourlyStormRisk['stormRiskLevel']) => {
    switch (level) {
      case 'TRÈS ÉLEVÉ / VIOLENT':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'ÉLEVÉ':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'MODÉRÉ':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40';
      case 'FAIBLE':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div id="thunderstorm-convective-card" className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/95 to-amber-950/20 p-6 shadow-2xl backdrop-blur">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="rounded-2xl bg-amber-500/20 p-3 text-amber-400 border border-amber-500/30 shadow-inner">
            <Zap className="h-6 w-6 animate-pulse text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
              <span>Physique Convective & Modélisation des Orages</span>
              <span>•</span>
              <span className="text-slate-400">{station.name} ({station.altitude} m)</span>
            </div>
            <h3 className={`font-black text-white ${seniorMode ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'}`}>
              Estimation du Risque d'Orage & Évolution Horaire
            </h3>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <span className={`rounded-xl border px-3.5 py-1.5 text-xs font-black tracking-wide shadow-sm ${getVigilanceBadgeColor(globalVigilanceLevel)}`}>
            Vigilance : {globalVigilanceLevel} ({globalStormRiskScore}%)
          </span>
        </div>
      </div>

      {/* Top Banner: Global Score, Diagnosis & Critical Window */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Risk Score Box */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-amber-400" />
              Risque Orageux Global (24h)
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className={`text-4xl sm:text-5xl font-black ${getRiskScoreColor(globalStormRiskScore)}`}>
                {globalStormRiskScore}%
              </span>
              <span className="text-xs font-bold text-slate-400">
                sur {station.name}
              </span>
            </div>
          </div>
          <div className="mt-3 w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${
                globalStormRiskScore >= 75 ? 'bg-rose-500' :
                globalStormRiskScore >= 50 ? 'bg-amber-500' :
                globalStormRiskScore >= 25 ? 'bg-yellow-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.max(5, globalStormRiskScore)}%` }}
            />
          </div>
        </div>

        {/* Critical Window & Imminent Alert Box */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-cyan-400" />
              Fenêtre Temporelle Critique
            </span>
            <div className="mt-2 text-base font-extrabold text-cyan-300">
              {criticalWindow}
            </div>
          </div>
          <div className="mt-2 text-xs text-slate-300">
            <span className="font-semibold text-slate-400">Menace directe : </span>
            {imminentThreatMinutes !== null ? (
              <span className="font-bold text-amber-300">
                {imminentThreatMinutes === 0 ? "Orage sur le secteur" : `Arrivée estimée dans ~${imminentThreatMinutes} min`}
              </span>
            ) : (
              <span className="text-emerald-300 font-medium">Aucun impact imminent (&gt; 1h)</span>
            )}
          </div>
        </div>

        {/* Convective Mechanism Box */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Flame className="h-3.5 w-3.5 text-orange-400" />
              Mécanisme de Déclenchement
            </span>
            <div className="mt-2 text-xs font-bold text-slate-200 line-clamp-2">
              {dominantMechanism}
            </div>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Mis à jour à {generatedAt} (Open-Meteo HR Convection)
          </div>
        </div>
      </div>

      {/* Written Diagnosis Summary */}
      <div className="mt-4 rounded-2xl border border-slate-800/80 bg-slate-950/60 p-3.5 text-xs text-slate-300 flex items-start gap-2.5">
        <Sparkles className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-amber-300">Diagnostic Convectif : </span>
          <span>{summaryDiagnosis}</span>
        </div>
      </div>

      {/* SECTION: 24-Hour Convective Timeline (Next Few Hours) */}
      <div className="mt-6">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-400" />
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Évolution Heure par Heure du Risque d'Orage sur votre localité
            </h4>
          </div>
          <span className="text-xs text-slate-400">
            Cliquez sur une heure pour inspecter ses paramètres
          </span>
        </div>

        {/* Horizontal Scrollable Timeline */}
        <div className="flex gap-2.5 overflow-x-auto pb-3 pt-1 scrollbar-thin">
          {hourlyStormTimeline.map((item, index) => {
            const isSelected = index === selectedHourIndex;
            return (
              <button
                key={index}
                onClick={() => setSelectedHourIndex(index)}
                className={`flex flex-col items-center rounded-2xl border p-3 min-w-[105px] text-center transition-all text-left ${
                  isSelected 
                    ? 'border-amber-500 bg-amber-500/15 shadow-lg ring-1 ring-amber-500/40' 
                    : 'border-slate-800 bg-slate-950/80 hover:border-slate-700 hover:bg-slate-900/90'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-xs font-bold text-white">
                    {item.isCurrentHour ? 'Maintenant' : item.hourLabel}
                  </span>
                  {item.isCriticalPeak && (
                    <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" title="Pic orageux" />
                  )}
                </div>

                <div className="my-1.5 flex items-center justify-center">
                  <span className="text-2xl">
                    {item.stormRiskPercent >= 60 ? '⛈️' : item.stormRiskPercent >= 35 ? '🌩️' : item.stormRiskPercent >= 15 ? '🌦️' : '🌤️'}
                  </span>
                </div>

                <div className={`text-base font-black ${getRiskScoreColor(item.stormRiskPercent)}`}>
                  {item.stormRiskPercent}%
                </div>

                <span className={`mt-1.5 rounded px-1.5 py-0.5 text-[10px] font-extrabold border ${getRiskBadge(item.stormRiskLevel)}`}>
                  {item.stormRiskLevel.split(' ')[0]}
                </span>

                <div className="mt-2 text-[10px] text-slate-400 space-y-0.5 w-full text-center">
                  <div>CAPE : <strong className="text-amber-300">{item.cape}</strong></div>
                  <div>LI : <strong className="text-cyan-300">{item.liftedIndex}°C</strong></div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Hour Deep Dive Card */}
        {selectedHour && (
          <div className="mt-3 rounded-2xl border border-slate-800 bg-slate-950/90 p-4 animate-fadeIn">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-amber-500/20 p-1.5 text-amber-400 border border-amber-500/30">
                  <Zap className="h-4 w-4" />
                </div>
                <div>
                  <h5 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    Relevé prévisionnel à {selectedHour.hourLabel}
                  </h5>
                  <span className="text-sm font-black text-white">
                    Structure : {selectedHour.expectedStormType}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`rounded-lg border px-2.5 py-1 text-xs font-bold ${getRiskBadge(selectedHour.stormRiskLevel)}`}>
                  Probabilité d'orage : {selectedHour.stormRiskPercent}% ({selectedHour.stormRiskLevel})
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="rounded-xl bg-slate-900/80 p-2.5 border border-slate-800/70">
                <span className="text-slate-400">⚡ Activité Électrique :</span>
                <div className="font-bold text-amber-300 mt-0.5">{selectedHour.lightningActivity}</div>
              </div>
              <div className="rounded-xl bg-slate-900/80 p-2.5 border border-slate-800/70">
                <span className="text-slate-400">🧊 Risque de Grêle :</span>
                <div className="font-bold text-cyan-300 mt-0.5">{selectedHour.hailRisk}</div>
              </div>
              <div className="rounded-xl bg-slate-900/80 p-2.5 border border-slate-800/70">
                <span className="text-slate-400">💨 Rafales Convectives :</span>
                <div className="font-bold text-teal-300 mt-0.5">{selectedHour.maxGustExpectedKmh} km/h</div>
              </div>
              <div className="rounded-xl bg-slate-900/80 p-2.5 border border-slate-800/70">
                <span className="text-slate-400">🌧️ Intensité Pluie :</span>
                <div className="font-bold text-blue-300 mt-0.5">{selectedHour.rainIntensityMmH > 0 ? `${selectedHour.rainIntensityMmH} mm/h` : 'Nulle'}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION: 8 Advanced Atmospheric Convective Parameters Matrix */}
      <div className="mt-6">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="h-4 w-4 text-cyan-400" />
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">
            Matrice des Paramètres Physiques & Indices Convectifs en Direct
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Index 1: CAPE */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-3.5 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400">CAPE (Énergie Convective)</span>
              <span className="text-[10px] font-extrabold rounded bg-amber-500/20 text-amber-300 px-1.5 py-0.5">J/kg</span>
            </div>
            <div className="mt-1 text-2xl font-black text-amber-300">
              {convectiveIndices.capeJkg} <span className="text-xs font-medium text-slate-400">J/kg</span>
            </div>
            <div className="text-[11px] font-medium text-slate-400 mt-0.5">
              {convectiveIndices.capeLevel}
            </div>
          </div>

          {/* Index 2: Lifted Index */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-3.5 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400">Lifted Index (LI)</span>
              <span className="text-[10px] font-extrabold rounded bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5">500 hPa</span>
            </div>
            <div className="mt-1 text-2xl font-black text-cyan-300">
              {convectiveIndices.liftedIndex > 0 ? `+${convectiveIndices.liftedIndex}` : convectiveIndices.liftedIndex} <span className="text-xs font-medium text-slate-400">°C</span>
            </div>
            <div className="text-[11px] font-medium text-slate-400 mt-0.5">
              {convectiveIndices.liftedIndexLevel}
            </div>
          </div>

          {/* Index 3: CIN (Inhibition) */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-3.5 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400">CIN (Inhibition Convective)</span>
              <span className="text-[10px] font-extrabold rounded bg-slate-800 text-slate-300 px-1.5 py-0.5">Couvercle</span>
            </div>
            <div className="mt-1 text-2xl font-black text-slate-200">
              {convectiveIndices.cinJkg} <span className="text-xs font-medium text-slate-400">J/kg</span>
            </div>
            <div className="text-[11px] font-medium text-slate-400 mt-0.5">
              {convectiveIndices.cinLevel}
            </div>
          </div>

          {/* Index 4: Deep Layer Shear */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-3.5 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400">Cisaillement 0-6 km</span>
              <span className="text-[10px] font-extrabold rounded bg-teal-500/20 text-teal-300 px-1.5 py-0.5">{convectiveIndices.deepLayerShearKnots} kt</span>
            </div>
            <div className="mt-1 text-2xl font-black text-teal-300">
              {convectiveIndices.deepLayerShear06kmMs} <span className="text-xs font-medium text-slate-400">m/s</span>
            </div>
            <div className="text-[11px] font-medium text-slate-400 mt-0.5">
              {convectiveIndices.deepLayerShearLevel}
            </div>
          </div>

          {/* Index 5: Hail Threat */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-3.5 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400">Risque de Grêle & Calibre</span>
              <span className="text-[10px] font-extrabold rounded bg-blue-500/20 text-blue-300 px-1.5 py-0.5">Calibre max</span>
            </div>
            <div className="mt-1 text-2xl font-black text-blue-300">
              {convectiveIndices.hailProbabilityPercent}% <span className="text-xs font-medium text-slate-400">{convectiveIndices.hailMaxDiameterCm > 0 ? `(~${convectiveIndices.hailMaxDiameterCm} cm)` : '(Nul)'}</span>
            </div>
            <div className="text-[11px] font-medium text-slate-400 mt-0.5">
              {convectiveIndices.hailMaxDiameterCm >= 3.0 ? "Grêle destructrice possible" : convectiveIndices.hailMaxDiameterCm >= 1.0 ? "Petite grêle ou grésil" : "Pas de grêle détectée"}
            </div>
          </div>

          {/* Index 6: Downburst Gusts (DCAPE) */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-3.5 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400">Micro-rafales / DCAPE</span>
              <span className="text-[10px] font-extrabold rounded bg-orange-500/20 text-orange-300 px-1.5 py-0.5">Downburst</span>
            </div>
            <div className="mt-1 text-2xl font-black text-orange-300">
              {convectiveIndices.maxDownburstGustKmh} <span className="text-xs font-medium text-slate-400">km/h max</span>
            </div>
            <div className="text-[11px] font-medium text-slate-400 mt-0.5">
              Énergie DCAPE : {convectiveIndices.dcapeDownburstJkg} J/kg
            </div>
          </div>

          {/* Index 7: Supercell Potential */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-3.5 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400">Indice Supercellulaire (SCP)</span>
              <span className="text-[10px] font-extrabold rounded bg-purple-500/20 text-purple-300 px-1.5 py-0.5">SCP Index</span>
            </div>
            <div className="mt-1 text-2xl font-black text-purple-300">
              {convectiveIndices.supercellCompositeParameter} <span className="text-xs font-medium text-slate-400">/ 10</span>
            </div>
            <div className="text-[11px] font-medium text-slate-400 mt-0.5">
              Risque supercellulaire : <strong>{convectiveIndices.supercellRisk}</strong>
            </div>
          </div>

          {/* Index 8: Lightning Strike Rate */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-3.5 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400">Activité Électrique & Foudre</span>
              <span className="text-[10px] font-extrabold rounded bg-rose-500/20 text-rose-300 px-1.5 py-0.5">Foudre/min</span>
            </div>
            <div className="mt-1 text-2xl font-black text-rose-300">
              {convectiveIndices.lightningRatePerMinute} <span className="text-xs font-medium text-slate-400">éclairs/min</span>
            </div>
            <div className="text-[11px] font-medium text-slate-400 mt-0.5 truncate">
              {convectiveIndices.flashDensityEstimate}
            </div>
          </div>
        </div>
      </div>

      {/* Safety Directives Box */}
      <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/90 p-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2.5 flex items-center gap-1.5">
          <ShieldAlert className="h-4 w-4 text-amber-400" />
          Consignes de Sécurité & Vigilance Foudre
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
          {safetyDirectives.map((directive, idx) => (
            <div key={idx} className="flex items-start gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/60 text-slate-200">
              <CheckCircle className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
              <span>{directive}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
