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
    station.country,
    station.longitude
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
    <div className="space-y-4">
      {/* 1. Header Banner */}
      <div className="rounded-lg border border-slate-800 bg-[#0F172A] p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-800 text-amber-400 border border-slate-700">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#0284C7]">
                  Normales Climatologiques (1991-2020)
                </span>
                <span className="rounded bg-slate-800 px-2 py-0.5 text-[11px] text-slate-300 font-medium border border-slate-700">
                  {station.name} ({station.altitude} m)
                </span>
              </div>
              <h2 className={`font-bold text-white ${seniorMode ? 'text-2xl' : 'text-xl'}`}>
                Rapports aux Moyennes de Saison &amp; Normales
              </h2>
            </div>
          </div>

          <button
            id="btn-toggle-methodology"
            onClick={() => setShowMethodology(!showMethodology)}
            className="flex items-center gap-1.5 rounded-md bg-slate-800 border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white cursor-pointer"
          >
            <HelpCircle className="h-3.5 w-3.5 text-slate-400" />
            <span>{showMethodology ? 'Masquer la méthode' : 'Méthode OMM (1991-2020)'}</span>
          </button>
        </div>

        {/* Methodology explainer collapse */}
        {showMethodology && (
          <div className="mt-4 rounded-md bg-slate-900 border border-slate-800 p-4 space-y-2.5 text-xs text-slate-300">
            <h4 className="font-bold text-white uppercase tracking-wider flex items-center gap-1.5 text-xs">
              <Info className="h-3.5 w-3.5 text-[#0284C7]" />
              Référentiel Climatologique Trentenaire (1991-2020)
            </h4>
            <p className="leading-relaxed text-slate-400">
              Conformément aux normes de l'<strong>Organisation Météorologique Mondiale (OMM)</strong>, les normales climatologiques correspondent aux moyennes trentenaires arrêtées sur <strong>1991-2020</strong>.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              <div className="rounded bg-[#0F172A] p-2.5 border border-slate-800">
                <strong className="text-amber-400 text-xs">Écart Thermique (Anomalie)</strong>
                <p className="mt-0.5 text-[11px] text-slate-400">
                  Différence en °C par rapport à la moyenne trentenaire. Un écart supérieur à +4°C caractérise une anomalie majeure.
                </p>
              </div>
              <div className="rounded bg-[#0F172A] p-2.5 border border-slate-800">
                <strong className="text-sky-400 text-xs">Rapport Pluviométrique (%)</strong>
                <p className="mt-0.5 text-[11px] text-slate-400">
                  Cumul de précipitations comparé à la normale attendue. Un déficit &gt; 50% indique une sécheresse météorologique.
                </p>
              </div>
              <div className="rounded bg-[#0F172A] p-2.5 border border-slate-800">
                <strong className="text-indigo-300 text-xs">DJU (Degrés-Jours)</strong>
                <p className="mt-0.5 text-[11px] text-slate-400">
                  Écart sous 18°C pour quantifier les besoins de chauffage des logements.
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
      <div className="rounded-lg border border-slate-800 bg-[#0F172A] p-4 sm:p-5">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between mb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-[#0284C7]" />
            <h3 className={`font-bold text-white ${seniorMode ? 'text-lg' : 'text-base'}`}>
              Tableau des 12 Normales Mensuelles 1991-2020 ({station.name})
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            Moyennes trentenaires officielles
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="border-b border-slate-800 bg-slate-900 text-[11px] font-semibold text-slate-400">
              <tr>
                <th className="py-2.5 px-3">Mois</th>
                <th className="py-2.5 px-2.5">Tn (°C)</th>
                <th className="py-2.5 px-2.5">Tx (°C)</th>
                <th className="py-2.5 px-2.5">Moyenne</th>
                <th className="py-2.5 px-2.5">Amplitude</th>
                <th className="py-2.5 px-2.5">Pluie (mm)</th>
                <th className="py-2.5 px-2.5">Soleil (h)</th>
                <th className="py-2.5 px-2.5">Gel (j)</th>
                <th className="py-2.5 px-2.5">Chaleur &gt;25°C</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {normals.monthly.map((m) => {
                const isCurrent = m.month === currentMonthIdx + 1;
                const amplitude = Number((m.tMax - m.tMin).toFixed(1));
                return (
                  <tr
                    key={m.month}
                    className={`transition hover:bg-slate-800/40 ${
                      isCurrent ? 'bg-slate-800/70 font-semibold text-white' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 flex items-center gap-2">
                      <span>{m.monthName}</span>
                      {isCurrent && (
                        <span className="rounded bg-[#0284C7] px-1.5 py-0.2 text-[10px] text-white font-medium">
                          Actuel
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-2.5 text-sky-300">{formatTemp(m.tMin)}</td>
                    <td className="py-2.5 px-2.5 text-rose-300">{formatTemp(m.tMax)}</td>
                    <td className="py-2.5 px-2.5 font-bold text-amber-300">{formatTemp(m.tMean)}</td>
                    <td className="py-2.5 px-2.5 text-slate-400">{amplitude}°C</td>
                    <td className="py-2.5 px-2.5 text-sky-300">{m.precipitationMm} mm</td>
                    <td className="py-2.5 px-2.5 text-amber-200">{m.sunHours} h</td>
                    <td className="py-2.5 px-2.5 text-slate-300">{m.frostDays} j</td>
                    <td className="py-2.5 px-2.5 text-orange-300">{m.heatDays} j</td>
                  </tr>
                );
              })}
            </tbody>
            {/* Annual Row */}
            <tfoot className="border-t-2 border-slate-700 bg-slate-900/90 font-semibold text-white">
              <tr>
                <td className="py-2.5 px-3 text-slate-300">Total / Moyenne Annuelle</td>
                <td className="py-2.5 px-2.5 text-sky-300">
                  {formatTemp(Number((normals.monthly.reduce((a, b) => a + b.tMin, 0) / 12).toFixed(1)))}
                </td>
                <td className="py-2.5 px-2.5 text-rose-300">
                  {formatTemp(Number((normals.monthly.reduce((a, b) => a + b.tMax, 0) / 12).toFixed(1)))}
                </td>
                <td className="py-2.5 px-2.5 text-amber-400 font-bold">
                  {formatTemp(normals.annualTMean)}
                </td>
                <td className="py-2.5 px-2.5 text-slate-400">-</td>
                <td className="py-2.5 px-2.5 text-sky-400 font-bold">
                  {normals.annualPrecipitation} mm
                </td>
                <td className="py-2.5 px-2.5 text-amber-300 font-bold">
                  {Math.round(normals.monthly.reduce((a, b) => a + b.sunHours, 0))} h
                </td>
                <td className="py-2.5 px-2.5 text-slate-300">
                  {Math.round(normals.monthly.reduce((a, b) => a + b.frostDays, 0))} j
                </td>
                <td className="py-2.5 px-2.5 text-orange-400">
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
