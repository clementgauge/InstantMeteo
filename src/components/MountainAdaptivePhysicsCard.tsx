import React, { useState } from 'react';
import { 
  Mountain, 
  Wind, 
  Thermometer, 
  CloudSnow, 
  CloudRain, 
  Activity, 
  AlertTriangle, 
  ArrowDown, 
  Layers, 
  Zap, 
  Compass, 
  Info,
  ShieldCheck,
  Snowflake
} from 'lucide-react';
import { 
  FRENCH_MOUNTAIN_MASSIFS_PROFILES, 
  calculateAdaptiveMassifDiagnosis,
  MassifPhysicalProfile,
  MountainAltitudeStageCalculation
} from '../services/mountainAdaptivePhysicsService';

interface MountainAdaptivePhysicsCardProps {
  seniorMode?: boolean;
  tempUnit?: 'C' | 'F';
}

export const MountainAdaptivePhysicsCard: React.FC<MountainAdaptivePhysicsCardProps> = ({
  seniorMode = false,
  tempUnit = 'C'
}) => {
  const [selectedMassifId, setSelectedMassifId] = useState<string>('alpes-nord-montblanc');

  // Paramètres interactifs de simulation pour tester différentes conditions météo de montagne
  const [baseTempC, setBaseTempC] = useState<number>(8.0);
  const [baseWindKmh, setBaseWindKmh] = useState<number>(25);
  const [precipIntensityMm, setPrecipIntensityMm] = useState<number>(3.5);
  const [humidityPct, setHumidityPct] = useState<number>(80);

  const diagnosis = calculateAdaptiveMassifDiagnosis(
    selectedMassifId,
    baseTempC,
    500, // altitude base plaine de référence
    baseWindKmh,
    humidityPct,
    precipIntensityMm,
    false
  );

  const toDisplayTemp = (celsius: number): string => {
    if (tempUnit === 'F') {
      const f = Math.round((celsius * 9) / 5 + 32);
      return `${f}°F`;
    }
    return `${celsius > 0 ? `+${celsius}` : celsius}°C`;
  };

  return (
    <div 
      id="mountain-adaptive-physics-card"
      className="rounded-2xl border border-slate-800 bg-[#0F172A] shadow-2xl overflow-hidden space-y-6"
    >
      {/* 1. En-tête Principal */}
      <div className="p-5 sm:p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-sky-950/40 to-slate-900 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-500/30 shrink-0">
              <Mountain className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-500/40">
                  Modélisation Orographique Haute Résolution
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Physique des Massifs &amp; Isothermie
                </span>
              </div>
              <h2 className={`font-black text-white mt-1 ${seniorMode ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'}`}>
                Physique &amp; Météo de Montagne par Massif
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
                Calcul précis des phénomènes spécifiques au relief : <strong>gradient vertical des températures, 
                inversions thermiques de combe, effet Venturi sur les crêtes</strong>, et calcul dynamique de la 
                <strong> Limite Pluie-Neige (LPN) avec abaissement par isothermie</strong> lors de fortes précipitations.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center shrink-0">
            <div className="rounded-xl border border-sky-500/30 bg-sky-950/50 px-3.5 py-2 text-right">
              <div className="text-[10px] font-bold uppercase tracking-wider text-sky-400">Sommet Témoin</div>
              <div className="text-sm font-black text-white truncate max-w-[180px]">
                {diagnosis.massif.representativePeak}
              </div>
              <div className="text-xs font-bold text-sky-300">
                {diagnosis.massif.peakAltitudeM} m • {toDisplayTemp(diagnosis.peakTempC)}
              </div>
            </div>
          </div>
        </div>

        {/* 4 Indicateurs Clés Physiques */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {/* LPN Dynamique */}
          <div className="rounded-xl border border-blue-500/30 bg-blue-950/30 p-3.5 space-y-1">
            <div className="text-[10px] uppercase font-bold text-blue-400 flex items-center justify-between">
              <span>Limite Pluie-Neige (LPN)</span>
              <CloudSnow className="h-3.5 w-3.5" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">
              {diagnosis.effectiveLpnM} m
            </div>
            <div className="text-[11px] text-blue-300 font-medium">
              {diagnosis.isothermyDropM > 0 ? (
                <span className="text-amber-400">
                  Chute de -{diagnosis.isothermyDropM} m par isothermie
                </span>
              ) : (
                'Régime standard sans isothermie'
              )}
            </div>
          </div>

          {/* Isotherme 0°C Synoptique */}
          <div className="rounded-xl border border-sky-500/30 bg-sky-950/30 p-3.5 space-y-1">
            <div className="text-[10px] uppercase font-bold text-sky-400 flex items-center justify-between">
              <span>Isotherme 0°C Libre</span>
              <Thermometer className="h-3.5 w-3.5" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">
              {diagnosis.synopticIsoZeroM} m
            </div>
            <div className="text-[11px] text-sky-300 font-medium">
              Thermomètre mouillé (Tw=0) : {diagnosis.wetBulbZeroM} m
            </div>
          </div>

          {/* Vent de Crête & Effet Venturi */}
          <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/30 p-3.5 space-y-1">
            <div className="text-[10px] uppercase font-bold text-indigo-400 flex items-center justify-between">
              <span>Vent Crêtes (Effet Venturi)</span>
              <Wind className="h-3.5 w-3.5" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">
              {diagnosis.crestWindKmh} km/h
            </div>
            <div className="text-[11px] text-indigo-300 font-medium">
              Rafales max : {diagnosis.crestGustKmh} km/h (+{diagnosis.venturiAccelerationPct}%)
            </div>
          </div>

          {/* Gradient Vertical Réel */}
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-3.5 space-y-1">
            <div className="text-[10px] uppercase font-bold text-emerald-400 flex items-center justify-between">
              <span>Gradient Thermique</span>
              <Activity className="h-3.5 w-3.5" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">
              -{diagnosis.verticalLapseRateCPer100m}°C / 100m
            </div>
            <div className="text-[11px] text-emerald-300 font-medium">
              {diagnosis.isInversionActive ? 'Inversion active en cuvette' : 'Gradient atmosphérique standard'}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Sélecteur de Massif Montagneux */}
      <div className="px-5 sm:px-6 space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Compass className="h-4 w-4 text-sky-400" />
          <span>Sélectionner le Massif Montagneux :</span>
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {FRENCH_MOUNTAIN_MASSIFS_PROFILES.map(m => {
            const isSelected = m.id === selectedMassifId;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedMassifId(m.id)}
                className={`p-3 rounded-xl text-left border transition cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-sky-400 bg-sky-950/60 shadow-lg shadow-sky-500/20 text-white'
                    : 'border-slate-800 bg-slate-900/70 text-slate-300 hover:border-slate-700 hover:text-white'
                }`}
              >
                <div>
                  <div className="text-[10px] font-bold uppercase text-sky-400">{m.domain}</div>
                  <div className="text-xs font-black mt-0.5 truncate">{m.name}</div>
                </div>
                <div className="text-[10px] text-slate-400 mt-2 flex items-center justify-between">
                  <span>Pic : {m.peakAltitudeM} m</span>
                  <span className="text-sky-300 font-semibold">{m.typicalWindName.split('/')[0]}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Synthèse Physique & Conseil Tactique du Massif */}
      <div className="px-5 sm:px-6">
        <div className="rounded-xl border border-sky-500/20 bg-gradient-to-r from-sky-950/30 to-indigo-950/20 p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wider">
            <Info className="h-4 w-4 shrink-0" />
            <span>Régime Topographique : {diagnosis.massif.topographicRegime}</span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed font-medium">
            {diagnosis.tacticalAdvice}
          </p>
          <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-4 text-[11px] text-slate-400">
            <span>🌬️ Vent caractéristique : <strong className="text-slate-200">{diagnosis.massif.typicalWindName}</strong></span>
            <span>•</span>
            <span>🏔️ Sensibilité à l'isothermie : <strong className="text-slate-200">{diagnosis.massif.isothermySensitivity}</strong></span>
            <span>•</span>
            <span>🌡️ Amplitude max d'inversion : <strong className="text-slate-200">+{diagnosis.massif.combeMaxInversionDeltaC}°C</strong></span>
          </div>
        </div>
      </div>

      {/* 4. Tableau Détaillé des Étages Altitudinaux */}
      <div className="px-5 sm:px-6 pb-6 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Layers className="h-4 w-4 text-sky-400" />
            <span>Profil Altimétrique Continu par Paliers (1000 m à {diagnosis.massif.peakAltitudeM} m) :</span>
          </h3>
          <span className="text-xs text-slate-400">
            LPN effective : <strong className="text-blue-300">{diagnosis.effectiveLpnM} m</strong>
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              <tr>
                <th className="p-3">Altitude</th>
                <th className="p-3">Étage</th>
                <th className="p-3">Temp. Air</th>
                <th className="p-3">Ressenti (Wind Chill)</th>
                <th className="p-3">Vent Moyen (Raf.)</th>
                <th className="p-3">Phase Précipitations</th>
                <th className="p-3">Chute Neige</th>
                <th className="p-3">Diagnostic Local</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-950/60">
              {diagnosis.altitudeStages.map((stage) => {
                const isSnowing = stage.precipPhase.includes('Neige');
                return (
                  <tr 
                    key={stage.altitudeM}
                    className={`transition hover:bg-slate-900/60 ${
                      stage.altitudeM >= diagnosis.effectiveLpnM ? 'bg-sky-950/10' : ''
                    }`}
                  >
                    <td className="p-3 font-black text-white flex items-center gap-1.5">
                      <Mountain className="h-3.5 w-3.5 text-sky-400" />
                      <span>{stage.altitudeM} m</span>
                    </td>
                    <td className="p-3 text-slate-300 font-medium">
                      {stage.stageLabel}
                    </td>
                    <td className="p-3 font-bold text-white">
                      <span className={stage.temperatureC <= 0 ? 'text-sky-300' : 'text-amber-300'}>
                        {toDisplayTemp(stage.temperatureC)}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-slate-300">
                      {toDisplayTemp(stage.windChillC)}
                    </td>
                    <td className="p-3 text-slate-200">
                      <div className="flex items-center gap-1">
                        <Wind className="h-3 w-3 text-indigo-400" />
                        <span>{stage.windSpeedKmh} km/h</span>
                        <span className="text-[10px] text-slate-400">({stage.windGustKmh})</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isSnowing 
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : stage.precipPhase === 'Pluie & Neige mêlées'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : 'bg-slate-800 text-slate-300'
                      }`}>
                        {stage.precipPhase}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-white">
                      {stage.snowRatePerHourCm > 0 ? (
                        <span className="text-sky-300 flex items-center gap-1">
                          <Snowflake className="h-3 w-3" />
                          <span>{stage.snowRatePerHourCm} cm/h</span>
                        </span>
                      ) : (
                        <span className="text-slate-500">--</span>
                      )}
                    </td>
                    <td className="p-3 text-[11px] text-slate-400 italic">
                      {stage.microclimaticNote}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
