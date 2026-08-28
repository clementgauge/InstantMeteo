import React, { useState } from 'react';
import { 
  TrendingUp, 
  Flame, 
  Snowflake, 
  CloudRain, 
  Sun, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  BarChart3,
  ShieldCheck,
  HelpCircle,
  Layers,
  ArrowUpDown,
  Download,
  Info
} from 'lucide-react';
import { LocationPoint, CurrentWeather, ClimateAnomaly } from '../types/weather';
import { getNormalsForStation } from '../data/climateNormals';
import { SeasonalNormalsCard } from '../components/SeasonalNormalsCard';

interface AnomaliesViewProps {
  station: LocationPoint;
  weather: CurrentWeather;
  anomaly: ClimateAnomaly;
  seniorMode: boolean;
  tempUnit?: 'C' | 'F';
}

export const AnomaliesView: React.FC<AnomaliesViewProps> = ({
  station,
  weather,
  anomaly,
  seniorMode,
  tempUnit = 'C'
}) => {
  const normals = getNormalsForStation(
    station.id, 
    station.latitude, 
    station.altitude, 
    station.name, 
    station.country
  );

  const currentMonthIdx = new Date().getMonth();
  const currentMonthNormal = normals.monthly[currentMonthIdx];
  const [showMethodology, setShowMethodology] = useState<boolean>(false);

  const formatTemp = (valC: number) => {
    if (tempUnit === 'F') {
      const f = (valC * 9/5) + 32;
      return `${f > 0 ? `+${f.toFixed(1)}` : f.toFixed(1)}°F`;
    }
    return `${valC > 0 ? `+${valC}` : valC}°C`;
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl backdrop-blur sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Centre Climatologique Officiel (Normales 1991-2020)
                </span>
                <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs text-slate-300 font-medium">
                  {station.name} ({station.altitude} m)
                </span>
              </div>
              <h2 className={`font-black text-white ${seniorMode ? 'text-3xl' : 'text-2xl'}`}>
                Rapports aux Moyennes de Saison & Normales Climatologiques
              </h2>
            </div>
          </div>

          <button
            id="btn-toggle-methodology"
            onClick={() => setShowMethodology(!showMethodology)}
            className="flex items-center gap-1.5 rounded-xl bg-slate-800/80 border border-slate-700/70 px-3.5 py-2 text-xs font-bold text-slate-300 transition hover:bg-slate-800 hover:text-white"
          >
            <HelpCircle className="h-4 w-4 text-indigo-400" />
            <span>{showMethodology ? 'Masquer la méthodologie' : 'Méthodologie & Définitions'}</span>
          </button>
        </div>

        {/* Methodology explainer collapse */}
        {showMethodology && (
          <div className="mt-6 rounded-2xl bg-slate-950/80 border border-slate-800 p-5 space-y-3 text-xs text-slate-300">
            <h4 className="font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Info className="h-4 w-4 text-indigo-400" />
              Référentiel Climatologique Météo-France (1991-2020)
            </h4>
            <p className="leading-relaxed">
              Conformément aux normes de l'<strong>Organisation Météorologique Mondiale (OMM)</strong>, les normales climatologiques correspondent aux moyennes calculées sur la période de référence trentenaire <strong>1991-2020</strong>.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="rounded-xl bg-slate-900/80 p-3 border border-slate-800/80">
                <strong className="text-amber-400">Écart Thermique (Anomalie)</strong>
                <p className="mt-1 text-[11px] text-slate-400">
                  Différence en °C entre la température observée et la normale du créneau ou du mois. Un écart de +1°C à +3°C est modéré, au-delà de +5°C il s'agit d'une anomalie extrême.
                </p>
              </div>
              <div className="rounded-xl bg-slate-900/80 p-3 border border-slate-800/80">
                <strong className="text-blue-400">Rapport Pluviométrique (%)</strong>
                <p className="mt-1 text-[11px] text-slate-400">
                  Pourcentage de pluie cumulée par rapport à la normale trentenaire attendue à la même date. Un déficit &gt; 50% caractérise une sécheresse météorologique.
                </p>
              </div>
              <div className="rounded-xl bg-slate-900/80 p-3 border border-slate-800/80">
                <strong className="text-indigo-400">DJU (Degrés-Jours Unifiés)</strong>
                <p className="mt-1 text-[11px] text-slate-400">
                  Somme quotidienne des écarts sous 18°C (base chauffage). Permet d'estimer directement les besoins énergétiques et l'impact thermique sur les habitations.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Comprehensive 4-Seasons Hub Component */}
      <SeasonalNormalsCard
        currentStation={station}
        weather={weather}
        seniorMode={seniorMode}
        tempUnit={tempUnit}
      />

      {/* 3. Reference 12-Month Table 1991-2020 */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl backdrop-blur sm:p-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-400" />
            <h3 className={`font-bold text-white ${seniorMode ? 'text-2xl' : 'text-lg'}`}>
              Tableau Officiel des 12 Normales Mensuelles 1991-2020 ({station.name})
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Source officielle : Réseau Climatologique d'État Météo-France
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="border-b border-slate-800 bg-slate-950/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-3 px-4">Mois</th>
                <th className="py-3 px-3">T° Min (Tn)</th>
                <th className="py-3 px-3">T° Max (Tx)</th>
                <th className="py-3 px-3">T° Moyenne (Tm)</th>
                <th className="py-3 px-3">Amplitude</th>
                <th className="py-3 px-3">Pluie (mm)</th>
                <th className="py-3 px-3">Soleil (h)</th>
                <th className="py-3 px-3">Jours de Gel</th>
                <th className="py-3 px-3">Chaleur (&gt;25°C)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {normals.monthly.map((m) => {
                const isCurrent = m.month === currentMonthIdx + 1;
                const amplitude = Number((m.tMax - m.tMin).toFixed(1));
                return (
                  <tr
                    key={m.month}
                    className={`transition hover:bg-slate-800/50 ${
                      isCurrent ? 'bg-blue-950/50 font-bold text-white border-l-4 border-blue-500' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 flex items-center gap-2">
                      <span className="font-semibold">{m.monthName}</span>
                      {isCurrent && (
                        <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] text-white uppercase font-bold tracking-wider">
                          Mois en cours
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-cyan-300 font-semibold">{formatTemp(m.tMin)}</td>
                    <td className="py-3.5 px-3 text-rose-300 font-semibold">{formatTemp(m.tMax)}</td>
                    <td className="py-3.5 px-3 font-black text-amber-300">{formatTemp(m.tMean)}</td>
                    <td className="py-3.5 px-3 text-slate-400">{amplitude}°C</td>
                    <td className="py-3.5 px-3 text-blue-300">{m.precipitationMm} mm</td>
                    <td className="py-3.5 px-3 text-yellow-300">{m.sunHours} h</td>
                    <td className="py-3.5 px-3 text-slate-300">{m.frostDays} j</td>
                    <td className="py-3.5 px-3 text-orange-300">{m.heatDays} j</td>
                  </tr>
                );
              })}
            </tbody>
            {/* Annual Row */}
            <tfoot className="border-t-2 border-slate-700 bg-slate-950/90 font-bold text-white">
              <tr>
                <td className="py-3.5 px-4 uppercase text-slate-300">Total / Moyenne Annuelle</td>
                <td className="py-3.5 px-3 text-cyan-300">
                  {formatTemp(Number((normals.monthly.reduce((a, b) => a + b.tMin, 0) / 12).toFixed(1)))}
                </td>
                <td className="py-3.5 px-3 text-rose-300">
                  {formatTemp(Number((normals.monthly.reduce((a, b) => a + b.tMax, 0) / 12).toFixed(1)))}
                </td>
                <td className="py-3.5 px-3 text-amber-400 font-black">
                  {formatTemp(normals.annualTMean)}
                </td>
                <td className="py-3.5 px-3 text-slate-400">-</td>
                <td className="py-3.5 px-3 text-blue-400 font-black">
                  {normals.annualPrecipitation} mm
                </td>
                <td className="py-3.5 px-3 text-yellow-400 font-black">
                  {Math.round(normals.monthly.reduce((a, b) => a + b.sunHours, 0))} h
                </td>
                <td className="py-3.5 px-3 text-slate-300">
                  {Math.round(normals.monthly.reduce((a, b) => a + b.frostDays, 0))} j
                </td>
                <td className="py-3.5 px-3 text-orange-400">
                  {Math.round(normals.monthly.reduce((a, b) => a + b.heatDays, 0))} j
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
