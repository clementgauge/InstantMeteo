import React, { useState } from 'react';
import { 
  FrostAndColdObservatory, 
  LocationPoint, 
  MultiYearFrostSeasonRecord 
} from '../types/weather';
import { generateFrostAndColdObservatory } from '../services/winterObservatoryService';
import { 
  ThermometerSnowflake, 
  Snowflake, 
  Calendar, 
  Search, 
  Flame, 
  Zap, 
  TrendingDown, 
  TrendingUp, 
  ShieldAlert, 
  Award, 
  Info, 
  ChevronRight,
  Activity,
  History,
  Layers
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ReferenceLine,
  Legend 
} from 'recharts';

interface FrostAndColdObservatoryCardProps {
  station: LocationPoint;
  seniorMode: boolean;
  tempUnit?: 'C' | 'F';
}

export const FrostAndColdObservatoryCard: React.FC<FrostAndColdObservatoryCardProps> = ({
  station,
  seniorMode,
  tempUnit = 'C'
}) => {
  const [subTab, setSubTab] = useState<'SEASON_CURRENT' | 'HISTORICAL_TIERS' | 'COLD_WAVES_CATALOG' | 'ALL_TIME_RECORDS'>('SEASON_CURRENT');
  const [searchYear, setSearchYear] = useState<string>('');
  const [selectedSeason, setSelectedSeason] = useState<MultiYearFrostSeasonRecord | null>(null);

  const frostObservatory: FrostAndColdObservatory = generateFrostAndColdObservatory(station);

  const formatTemp = (celsius: number) => {
    if (tempUnit === 'F') {
      return `${Math.round((celsius * 9/5 + 32) * 10) / 10}°F`;
    }
    return `${celsius > 0 ? '+' : ''}${celsius}°C`;
  };

  // Filter historical seasons
  const filteredSeasons = frostObservatory.historicalFrostSeasons.filter(s => 
    s.seasonLabel.includes(searchYear) ||
    s.year.toString().includes(searchYear) ||
    (s.notableColdWaveTag && s.notableColdWaveTag.toLowerCase().includes(searchYear.toLowerCase()))
  );

  // Stacked chart data of frost tiers (sample 30 seasons)
  const chartData = frostObservatory.historicalFrostSeasons.slice(0, 30).reverse().map(s => ({
    name: s.seasonLabel,
    weak: s.frostTiers.weakFrostDays,
    moderate: s.frostTiers.moderateFrostDays,
    hard: s.frostTiers.hardFrostDays,
    extreme: s.frostTiers.extremeFrostDays,
    noThaw: s.frostTiers.noThawDays,
    total: s.frostTiers.totalFrostDays,
    absMin: s.absoluteMinTempC
  }));

  return (
    <div id="frost-cold-observatory-card" className="rounded-3xl border border-indigo-900/50 bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 p-6 shadow-2xl backdrop-blur space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-indigo-600/20 p-3 text-indigo-400 border border-indigo-500/30">
            <ThermometerSnowflake className="h-6 w-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400">
              <span className="flex items-center gap-1.5">
                <Snowflake className="h-3.5 w-3.5" /> Analyseur des Gelées, Intensités & Hivernologie
              </span>
              <span>•</span>
              <span className="text-white font-bold">Archives Multi-Années 1950 - 2026</span>
              <span>•</span>
              <span className="text-cyan-400">5 Paliers d'Intensité</span>
            </div>
            <h3 className={`font-black text-white ${seniorMode ? 'text-3xl' : 'text-2xl sm:text-3xl'} mt-0.5`}>
              Observatoire des Gelées & Grands Froids — {station.name}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Altitude {station.altitude} m • Normale Climatologique 1991-2020 : {frostObservatory.normals1991_2020.avgTotalFrostDays} jours de gel / an
            </p>
          </div>
        </div>

        {/* Sub-tab navigation */}
        <div className="flex items-center gap-1 bg-slate-950/90 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setSubTab('SEASON_CURRENT')}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition flex items-center gap-1 ${
              subTab === 'SEASON_CURRENT' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="h-3 w-3" />
            <span>Saison en Cours</span>
          </button>
          <button
            onClick={() => setSubTab('HISTORICAL_TIERS')}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition flex items-center gap-1 ${
              subTab === 'HISTORICAL_TIERS' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="h-3 w-3" />
            <span>Paliers & Historique (1950-2026)</span>
          </button>
          <button
            onClick={() => setSubTab('COLD_WAVES_CATALOG')}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition flex items-center gap-1 ${
              subTab === 'COLD_WAVES_CATALOG' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <History className="h-3 w-3" />
            <span>Grandes Vagues de Froid</span>
          </button>
          <button
            onClick={() => setSubTab('ALL_TIME_RECORDS')}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition flex items-center gap-1 ${
              subTab === 'ALL_TIME_RECORDS' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Award className="h-3 w-3" />
            <span>Records Absolus</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl bg-slate-950/70 p-3.5 border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-1">
            <ThermometerSnowflake className="h-4 w-4 text-cyan-400" />
            <span>Record Froid Absolu</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-cyan-300">
              {formatTemp(frostObservatory.allTimeColdRecords.absoluteColdRecordC)}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 truncate">
            {frostObservatory.allTimeColdRecords.absoluteColdRecordDate}
          </p>
        </div>

        <div className="rounded-2xl bg-slate-950/70 p-3.5 border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-1">
            <Calendar className="h-4 w-4 text-indigo-400" />
            <span>Gelées Moyennes / An</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-indigo-300">{frostObservatory.normals1991_2020.avgTotalFrostDays}</span>
            <span className="text-xs text-slate-400">jours de gel (Tn ≤ 0°)</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Dont {frostObservatory.normals1991_2020.avgNoThawDays} j sans dégel (Tx ≤ 0°)
          </p>
        </div>

        <div className="rounded-2xl bg-slate-950/70 p-3.5 border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-1">
            <Calendar className="h-4 w-4 text-amber-400" />
            <span>Fenêtre de Gel Moyenne</span>
          </div>
          <div className="text-sm font-bold text-white mt-1">
            1ère : {frostObservatory.normals1991_2020.avgFirstAutumnFrostDate}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Dernière : {frostObservatory.normals1991_2020.avgLastSpringFrostDate}
          </p>
        </div>

        <div className="rounded-2xl bg-slate-950/70 p-3.5 border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-1">
            <Flame className="h-4 w-4 text-rose-400" />
            <span>Besoin Chauffage (DJU)</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-300">{frostObservatory.normals1991_2020.avgAnnualDjuHeating}</span>
            <span className="text-xs text-slate-400">DJU / an</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Indice de sévérité thermique normalisé
          </p>
        </div>
      </div>

      {/* Sub-tab 1: Current Season Progress & Breakdown into the 5 tiers */}
      {subTab === 'SEASON_CURRENT' && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-slate-950/80 p-5 border border-indigo-500/30">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                  Bilan Hivernal {frostObservatory.currentSeasonProgress.seasonLabel}
                </span>
                <h4 className="text-lg font-black text-white mt-0.5">
                  Minimum Saison : {formatTemp(frostObservatory.currentSeasonProgress.currentMinSeasonC)} ({frostObservatory.currentSeasonProgress.currentMinDate})
                </h4>
              </div>
              <span className="px-3 py-1 rounded-xl text-xs font-bold bg-indigo-950/80 text-indigo-300 border border-indigo-500/40">
                1ère Gelée Observée : {frostObservatory.currentSeasonProgress.firstFrostObservedDate}
              </span>
            </div>

            {/* 5 Frost Tiers Visual Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-4 text-xs">
              <div className="rounded-2xl bg-sky-950/40 p-3.5 border border-sky-500/30 space-y-1">
                <span className="text-sky-300 font-bold">1. Gelées Blanches Faibles</span>
                <p className="text-[11px] text-slate-400">-0.1°C à -2.0°C</p>
                <div className="text-2xl font-black text-sky-200 mt-1">
                  {frostObservatory.currentSeasonProgress.currentFrostTiers.weakFrostDays} <span className="text-xs font-normal">jours</span>
                </div>
                <p className="text-[10px] text-slate-400">Normale : {frostObservatory.normals1991_2020.avgWeakFrostDays} j</p>
              </div>

              <div className="rounded-2xl bg-cyan-950/40 p-3.5 border border-cyan-500/30 space-y-1">
                <span className="text-cyan-300 font-bold">2. Gelées Modérées</span>
                <p className="text-[11px] text-slate-400">-2.1°C à -5.0°C</p>
                <div className="text-2xl font-black text-cyan-200 mt-1">
                  {frostObservatory.currentSeasonProgress.currentFrostTiers.moderateFrostDays} <span className="text-xs font-normal">jours</span>
                </div>
                <p className="text-[10px] text-slate-400">Normale : {frostObservatory.normals1991_2020.avgModerateFrostDays} j</p>
              </div>

              <div className="rounded-2xl bg-blue-950/40 p-3.5 border border-blue-500/30 space-y-1">
                <span className="text-blue-300 font-bold">3. Fortes Gelées</span>
                <p className="text-[11px] text-slate-400">-5.1°C à -10.0°C</p>
                <div className="text-2xl font-black text-blue-200 mt-1">
                  {frostObservatory.currentSeasonProgress.currentFrostTiers.hardFrostDays} <span className="text-xs font-normal">jours</span>
                </div>
                <p className="text-[10px] text-slate-400">Normale : {frostObservatory.normals1991_2020.avgHardFrostDays} j</p>
              </div>

              <div className="rounded-2xl bg-indigo-950/40 p-3.5 border border-indigo-500/30 space-y-1">
                <span className="text-indigo-300 font-bold">4. Très Fortes Gelées</span>
                <p className="text-[11px] text-slate-400">&lt; -10.0°C</p>
                <div className="text-2xl font-black text-indigo-200 mt-1">
                  {frostObservatory.currentSeasonProgress.currentFrostTiers.extremeFrostDays} <span className="text-xs font-normal">jours</span>
                </div>
                <p className="text-[10px] text-slate-400">Normale : {frostObservatory.normals1991_2020.avgExtremeFrostDays} j</p>
              </div>

              <div className="rounded-2xl bg-purple-950/50 p-3.5 border border-purple-500/40 space-y-1">
                <span className="text-purple-300 font-bold">5. Sans Dégel (Glace)</span>
                <p className="text-[11px] text-slate-400">Tx ≤ 0.0°C</p>
                <div className="text-2xl font-black text-purple-200 mt-1">
                  {frostObservatory.currentSeasonProgress.currentFrostTiers.noThawDays} <span className="text-xs font-normal">jours</span>
                </div>
                <p className="text-[10px] text-slate-400">Normale : {frostObservatory.normals1991_2020.avgNoThawDays} j</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-tab 2: Historical Tiers & Seasons Table + Stacked Chart */}
      {subTab === 'HISTORICAL_TIERS' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/60 p-2.5 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Calendar className="h-4 w-4 text-indigo-400" />
              <span><strong>{frostObservatory.historicalFrostSeasons.length} Hivers Documentés</strong> (1950 à 2026)</span>
            </div>
            <div className="flex items-center gap-2">
              <Search className="h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher une saison (ex: 1956, 1963, 1985, 2012)..."
                value={searchYear}
                onChange={(e) => setSearchYear(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Stacked Chart */}
          <div className="rounded-2xl bg-slate-950/80 p-4 border border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
              <span>Répartition par Palier de Gelée (1995-2026)</span>
              <span className="text-indigo-400">Nombre de Jours par Saison</span>
            </h4>
            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                  <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 9 }} interval={2} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '12px' }}
                    labelStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
                  />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="weak" name="Gelée Blanche (-0.1 à -2°)" stackId="a" fill="#38bdf8" />
                  <Bar dataKey="moderate" name="Modérée (-2.1 à -5°)" stackId="a" fill="#06b6d4" />
                  <Bar dataKey="hard" name="Forte (-5.1 à -10°)" stackId="a" fill="#3b82f6" />
                  <Bar dataKey="extreme" name="Très Forte (<-10°)" stackId="a" fill="#6366f1" />
                  <Bar dataKey="noThaw" name="Sans Dégel (Tx<=0°)" stackId="a" fill="#a855f7" />
                  <Line type="monotone" dataKey="total" name="Total Gelées" stroke="#f59e0b" strokeWidth={2} dot={{ r: 2 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Historical Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/80 max-h-[500px]">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 bg-slate-900/95 border-b border-slate-800 z-10 text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3">Saison</th>
                  <th className="p-3">Total Gelées</th>
                  <th className="p-3">Faibles (-0.1 à -2°)</th>
                  <th className="p-3">Modérées (-2.1 à -5°)</th>
                  <th className="p-3">Fortes (-5.1 à -10°)</th>
                  <th className="p-3">Très Fortes (&lt;-10°)</th>
                  <th className="p-3">Sans Dégel (Tx&le;0°)</th>
                  <th className="p-3">Min Absolu Saison</th>
                  <th className="p-3">Date Min</th>
                  <th className="p-3">1ère Gelée</th>
                  <th className="p-3">Dernière Gelée</th>
                  <th className="p-3">DJU Chauffage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredSeasons.map((s, idx) => (
                  <tr 
                    key={idx}
                    onClick={() => setSelectedSeason(s)}
                    className={`hover:bg-indigo-950/30 cursor-pointer transition ${
                      s.isRecordCold ? 'bg-indigo-950/40 font-bold text-cyan-200' : ''
                    }`}
                  >
                    <td className="p-3 font-bold text-white flex items-center gap-1.5">
                      <span>{s.seasonLabel}</span>
                      {s.isRecordCold && (
                        <span className="bg-indigo-500/30 text-indigo-200 text-[9px] px-1.5 py-0.2 rounded border border-indigo-400">
                          Grand Froid
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-black text-cyan-300">{s.frostTiers.totalFrostDays} j</td>
                    <td className="p-3 text-sky-300">{s.frostTiers.weakFrostDays} j</td>
                    <td className="p-3 text-cyan-300">{s.frostTiers.moderateFrostDays} j</td>
                    <td className="p-3 text-blue-300">{s.frostTiers.hardFrostDays} j</td>
                    <td className="p-3 font-bold text-indigo-300">{s.frostTiers.extremeFrostDays} j</td>
                    <td className="p-3 font-bold text-purple-300">{s.frostTiers.noThawDays} j</td>
                    <td className="p-3 font-black text-rose-300">{formatTemp(s.absoluteMinTempC)}</td>
                    <td className="p-3 text-slate-400">{s.absoluteMinTempDate}</td>
                    <td className="p-3 text-slate-400">{s.firstAutumnFrostDate}</td>
                    <td className="p-3 text-slate-400">{s.lastSpringFrostDate}</td>
                    <td className="p-3 font-semibold text-amber-300">{s.heatingDegreeDaysDju}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sub-tab 3: Historical Cold Waves Catalog */}
      {subTab === 'COLD_WAVES_CATALOG' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {frostObservatory.historicalColdWavesCatalog.map((cw, i) => (
            <div key={i} className="rounded-2xl bg-slate-950/80 p-5 border border-slate-800 space-y-3">
              <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                    {cw.period}
                  </span>
                  <h4 className="text-base font-black text-white mt-0.5">
                    {cw.name}
                  </h4>
                </div>
                <span className="px-3 py-1 rounded-xl text-xs font-black bg-indigo-950 text-indigo-300 border border-indigo-500/40">
                  {formatTemp(cw.minTempRecorded)}
                </span>
              </div>

              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-xs space-y-1 text-slate-300">
                <p><strong>Jours consécutifs sous gel / sans dégel :</strong> {cw.consecutiveFrostDays} jours</p>
                <p className="text-slate-400 pt-1 leading-relaxed">{cw.nationalImpactDescription}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sub-tab 4: All-Time Records */}
      {subTab === 'ALL_TIME_RECORDS' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-slate-950/70 p-4 border border-slate-800 space-y-2">
            <span className="text-xs font-bold uppercase text-cyan-400">Record Froid Absolu</span>
            <div className="text-2xl font-black text-white">
              {formatTemp(frostObservatory.allTimeColdRecords.absoluteColdRecordC)}
            </div>
            <p className="text-xs text-slate-400">{frostObservatory.allTimeColdRecords.absoluteColdRecordDate}</p>
          </div>

          <div className="rounded-2xl bg-slate-950/70 p-4 border border-slate-800 space-y-2">
            <span className="text-xs font-bold uppercase text-indigo-400">Hiver le Plus Froid</span>
            <div className="text-xl font-black text-white truncate">
              {frostObservatory.allTimeColdRecords.coldestWinterSeason}
            </div>
            <p className="text-xs text-slate-400">Mois le plus froid du XXe siècle</p>
          </div>

          <div className="rounded-2xl bg-slate-950/70 p-4 border border-slate-800 space-y-2">
            <span className="text-xs font-bold uppercase text-purple-400">Plus Longue Vague de Froid</span>
            <div className="text-2xl font-black text-white">
              {frostObservatory.allTimeColdRecords.longestColdWaveDays} Jours
            </div>
            <p className="text-xs text-slate-400">{frostObservatory.allTimeColdRecords.longestColdWaveYear}</p>
          </div>

          <div className="rounded-2xl bg-slate-950/70 p-4 border border-slate-800 space-y-2">
            <span className="text-xs font-bold uppercase text-amber-400">Gelée la Plus Tardive au Printemps</span>
            <div className="text-lg font-black text-white">
              {frostObservatory.allTimeColdRecords.latestSpringFrostRecordDate}
            </div>
            <p className="text-xs text-slate-400">Risque majeur pour le débourrement</p>
          </div>

          <div className="rounded-2xl bg-slate-950/70 p-4 border border-slate-800 space-y-2">
            <span className="text-xs font-bold uppercase text-rose-400">Gelée la Plus Précoce en Automne</span>
            <div className="text-lg font-black text-white">
              {frostObservatory.allTimeColdRecords.earliestAutumnFrostRecordDate}
            </div>
            <p className="text-xs text-slate-400">Fin anticipée de la période sans gel</p>
          </div>
        </div>
      )}
    </div>
  );
};
