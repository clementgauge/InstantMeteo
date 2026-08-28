import React, { useState } from 'react';
import { 
  Sun, 
  CloudRain, 
  Snowflake, 
  Flower2, 
  Leaf, 
  Thermometer, 
  Calendar, 
  Info, 
  TrendingUp, 
  CheckCircle2,
  Droplets,
  Zap,
  Flame,
  Clock,
  ChevronRight,
  BookOpen,
  Copy,
  Check,
  Compass,
  Sprout,
  BarChart2,
  Layers
} from 'lucide-react';
import { LocationPoint, CurrentWeather } from '../types/weather';
import { 
  getDetailedSeasonalNormals, 
  generateRealtimeSeasonalComparison, 
  BENCHMARK_FRENCH_REGIONS,
  SeasonKey,
  DetailedSeasonData
} from '../services/seasonalNormalsReportService';

interface SeasonalNormalsCardProps {
  currentStation: LocationPoint;
  weather: CurrentWeather;
  seniorMode: boolean;
  tempUnit?: 'C' | 'F';
}

export const SeasonalNormalsCard: React.FC<SeasonalNormalsCardProps> = ({
  currentStation,
  weather,
  seniorMode,
  tempUnit = 'C'
}) => {
  const formatTemp = (valC: number) => {
    if (tempUnit === 'F') {
      const f = (valC * 9/5) + 32;
      return `${f > 0 ? `+${f.toFixed(1)}` : f.toFixed(1)}°F`;
    }
    return `${valC > 0 ? `+${valC}` : valC}°C`;
  };

  const { seasons, annualSummary } = getDetailedSeasonalNormals(currentStation);
  const realtimeComparison = generateRealtimeSeasonalComparison(currentStation, weather);

  const [activeSeason, setActiveSeason] = useState<SeasonKey>(realtimeComparison.currentSeasonId);
  const [selectedSubTab, setSelectedSubTab] = useState<'overview' | 'decades' | 'analogs' | 'indicators' | 'regions'>('overview');
  const [copiedReport, setCopiedReport] = useState<boolean>(false);

  const seasonIcons: Record<SeasonKey, React.ReactNode> = {
    printemps: <Flower2 className="h-5 w-5 text-emerald-400" />,
    ete: <Sun className="h-5 w-5 text-amber-400" />,
    automne: <Leaf className="h-5 w-5 text-orange-400" />,
    hiver: <Snowflake className="h-5 w-5 text-cyan-400" />
  };

  const seasonColors: Record<SeasonKey, { bg: string; border: string; text: string; badge: string; gradient: string }> = {
    printemps: { 
      bg: 'bg-emerald-950/30', 
      border: 'border-emerald-500/40', 
      text: 'text-emerald-400', 
      badge: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
      gradient: 'from-emerald-500/10 to-teal-500/5'
    },
    ete: { 
      bg: 'bg-amber-950/30', 
      border: 'border-amber-500/40', 
      text: 'text-amber-400', 
      badge: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
      gradient: 'from-amber-500/10 to-orange-500/5'
    },
    automne: { 
      bg: 'bg-orange-950/30', 
      border: 'border-orange-500/40', 
      text: 'text-orange-400', 
      badge: 'bg-orange-500/20 text-orange-300 border border-orange-500/30',
      gradient: 'from-orange-500/10 to-amber-500/5'
    },
    hiver: { 
      bg: 'bg-cyan-950/30', 
      border: 'border-cyan-500/40', 
      text: 'text-cyan-400', 
      badge: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30',
      gradient: 'from-cyan-500/10 to-blue-500/5'
    }
  };

  const currentSeasonData: DetailedSeasonData = seasons[activeSeason];

  const handleCopyReport = () => {
    const reportText = `=== ${realtimeComparison.officialDiagnosticReport.reportTitle} ===
Station : ${currentStation.name} (${currentStation.altitude} m)
Date : ${new Date().toLocaleDateString('fr-FR')}

1. SYNTHÈSE GLOBALE :
${realtimeComparison.officialDiagnosticReport.executiveSummary}

2. ANALYSE THERMIQUE & NORMALE 1991-2020 :
${realtimeComparison.officialDiagnosticReport.thermalDetailedAnalysis}

3. BILAN HYDRIQUE & PLUVIOMÉTRIQUE :
${realtimeComparison.officialDiagnosticReport.hydrologicalAnalysis}

4. INDICATEURS ÉNERGÉTIQUES (DJU) :
${realtimeComparison.officialDiagnosticReport.agroEnergyAnalysis}

5. ANALOGUE HISTORIQUE :
${realtimeComparison.officialDiagnosticReport.historicalAnalogMatch}

Source : Modélisation Météo-France Normales 1991-2020 & ClimaFrance Haute Précision.`;

    navigator.clipboard.writeText(reportText);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 3000);
  };

  return (
    <div id="seasonal-normals-master-card" className="space-y-6">
      {/* 1. Main Seasonal Normals Hub Container */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl backdrop-blur sm:p-8">
        
        {/* Hub Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-slate-800 pb-6">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/40">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                  Observatoire & Bilan des 4 Saisons (Normales 1991-2020)
                </span>
                <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs text-slate-300 font-medium">
                  {currentStation.name} ({currentStation.altitude ?? 0} m)
                </span>
              </div>
              <h3 className={`font-black text-white ${seniorMode ? 'text-2xl' : 'text-xl'}`}>
                Rapports Détaillés & Comparatifs aux Moyennes de Saison
              </h3>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Live active season badge */}
            <div className="flex items-center gap-2 rounded-2xl bg-slate-800/90 border border-slate-700/80 px-4 py-2">
              <span className="text-xs text-slate-400">Saison astronomique & météo :</span>
              <span className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
                {seasonIcons[realtimeComparison.currentSeasonId]}
                {realtimeComparison.currentSeasonName}
              </span>
            </div>

            {/* Quick copy official report button */}
            <button
              id="btn-copy-seasonal-report"
              onClick={handleCopyReport}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600/20 border border-indigo-500/40 px-3.5 py-2 text-xs font-bold text-indigo-300 transition hover:bg-indigo-600/30 hover:text-white"
              title="Copier le bulletin climatologique de la saison"
            >
              {copiedReport ? (
                <>
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span>Copié dans le presse-papier !</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Copier le Rapport Officiel</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 4 Season Selector Cards */}
        <div className="mt-6 grid grid-cols-2 gap-3.5 lg:grid-cols-4">
          {(['printemps', 'ete', 'automne', 'hiver'] as SeasonKey[]).map((key) => {
            const season = seasons[key];
            const isSelected = season.id === activeSeason;
            const isLive = season.id === realtimeComparison.currentSeasonId;
            const style = seasonColors[key];

            return (
              <button
                key={season.id}
                id={`btn-select-season-${season.id}`}
                onClick={() => setActiveSeason(season.id)}
                className={`relative flex flex-col items-start rounded-2xl border p-4 transition-all text-left group ${
                  isSelected
                    ? `${style.bg} ${style.border} shadow-lg ring-1 ring-white/20`
                    : 'border-slate-800 bg-slate-950/50 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                {/* Active season pulse indicator */}
                {isLive && (
                  <span className="absolute top-3 right-3 flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">En cours</span>
                  </span>
                )}

                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-xl bg-slate-900/80 border border-slate-800 ${isSelected ? style.text : 'text-slate-400'}`}>
                    {seasonIcons[season.id]}
                  </div>
                  <span className={`font-bold text-sm ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                    {season.name.replace(' Climatologique', '')}
                  </span>
                </div>

                <span className="mt-1 text-[11px] text-slate-400">
                  {season.monthsLabel}
                </span>

                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className="text-xl font-black text-white">
                    {formatTemp(season.tMean)}
                  </span>
                  <span className="text-[11px] text-slate-400">moy. 1991-2020</span>
                </div>

                <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <CloudRain className="h-3 w-3 text-blue-400" />
                    {season.precipitationMm} mm
                  </span>
                  <span className="flex items-center gap-1">
                    <Sun className="h-3 w-3 text-amber-400" />
                    {season.sunHours} h
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="mt-6 flex flex-wrap gap-2 border-b border-slate-800 pb-3">
          <button
            id="subtab-overview"
            onClick={() => setSelectedSubTab('overview')}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
              selectedSubTab === 'overview'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <BarChart2 className="h-3.5 w-3.5" />
            <span>Fiche Synthèse & Seuils</span>
          </button>

          <button
            id="subtab-decades"
            onClick={() => setSelectedSubTab('decades')}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
              selectedSubTab === 'decades'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Les 9 Décades Saisonières</span>
          </button>

          <button
            id="subtab-analogs"
            onClick={() => setSelectedSubTab('analogs')}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
              selectedSubTab === 'analogs'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Saisons Analogues Historiques</span>
          </button>

          <button
            id="subtab-indicators"
            onClick={() => setSelectedSubTab('indicators')}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
              selectedSubTab === 'indicators'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Zap className="h-3.5 w-3.5" />
            <span>Bilan DJU, Énergie & Agro-Climat</span>
          </button>

          <button
            id="subtab-regions"
            onClick={() => setSelectedSubTab('regions')}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
              selectedSubTab === 'regions'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Compass className="h-3.5 w-3.5" />
            <span>Comparateur 8 Régions Françaises</span>
          </button>
        </div>

        {/* Tab 1: Overview and Core Metrics */}
        {selectedSubTab === 'overview' && (
          <div className="mt-6 space-y-6">
            {/* Season Summary Card */}
            <div className={`rounded-2xl border ${seasonColors[activeSeason].border} ${seasonColors[activeSeason].bg} p-5`}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
                    Présentation Climatologique Officielle
                  </span>
                  <h4 className="text-lg font-black text-white flex items-center gap-2">
                    {currentSeasonData.name} ({currentSeasonData.officialTitle})
                  </h4>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="rounded-lg bg-slate-900/80 border border-slate-800 px-3 py-1.5 text-slate-300">
                    Cumul normal : <strong className="text-white">{currentSeasonData.precipitationMm} mm</strong>
                  </span>
                  <span className="rounded-lg bg-slate-900/80 border border-slate-800 px-3 py-1.5 text-slate-300">
                    Insolation : <strong className="text-white">{currentSeasonData.sunHours} h</strong>
                  </span>
                  <span className="rounded-lg bg-slate-900/80 border border-slate-800 px-3 py-1.5 text-slate-300">
                    Rayonnement : <strong className="text-white">{currentSeasonData.solarRadiationKwhM2} kWh/m²</strong>
                  </span>
                </div>
              </div>

              <p className={`mt-3 text-slate-200 leading-relaxed ${seniorMode ? 'text-base' : 'text-sm'}`}>
                {currentSeasonData.climateSummary}
              </p>

              <div className="mt-3 text-xs text-slate-400 flex items-center gap-1.5">
                <Compass className="h-4 w-4 text-indigo-400" />
                <span><strong>Régime synoptique dominant :</strong> {currentSeasonData.synopticDominance}</span>
              </div>
            </div>

            {/* 8 Metric Grid */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-4">
                <span className="text-xs text-slate-400 font-medium">Température Min. (Tn)</span>
                <div className="mt-1 text-2xl font-black text-sky-400">
                  {formatTemp(currentSeasonData.tMin)}
                </div>
                <span className="text-[11px] text-slate-500">Moyenne des nuits</span>
              </div>

              <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-4">
                <span className="text-xs text-slate-400 font-medium">Température Moyenne (Tm)</span>
                <div className="mt-1 text-2xl font-black text-amber-400">
                  {formatTemp(currentSeasonData.tMean)}
                </div>
                <span className="text-[11px] text-slate-500">Moyenne 24h sur 3 mois</span>
              </div>

              <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-4">
                <span className="text-xs text-slate-400 font-medium">Température Max. (Tx)</span>
                <div className="mt-1 text-2xl font-black text-rose-400">
                  {formatTemp(currentSeasonData.tMax)}
                </div>
                <span className="text-[11px] text-slate-500">Moyenne des après-midis</span>
              </div>

              <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-4">
                <span className="text-xs text-slate-400 font-medium">Amplitude Diurne</span>
                <div className="mt-1 text-2xl font-black text-indigo-400">
                  {currentSeasonData.diurnalAmplitude}°C
                </div>
                <span className="text-[11px] text-slate-500">Écart moyen Tx - Tn</span>
              </div>

              <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-4">
                <span className="text-xs text-slate-400 font-medium">Jours de Gel (≤ 0°C)</span>
                <div className="mt-1 text-2xl font-black text-cyan-300">
                  {currentSeasonData.frostDays} j
                </div>
                <span className="text-[11px] text-slate-500">Fortes gelées : {currentSeasonData.severeFrostDays} j</span>
              </div>

              <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-4">
                <span className="text-xs text-slate-400 font-medium">Jours Chaleur (≥ 25°C)</span>
                <div className="mt-1 text-2xl font-black text-orange-400">
                  {currentSeasonData.heatDays} j
                </div>
                <span className="text-[11px] text-slate-500">Fortes chaleurs (≥30°C) : {currentSeasonData.veryHotDays} j</span>
              </div>

              <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-4">
                <span className="text-xs text-slate-400 font-medium">Précipitations & Fréquence</span>
                <div className="mt-1 text-2xl font-black text-blue-400">
                  {currentSeasonData.precipitationMm} mm
                </div>
                <span className="text-[11px] text-slate-500">{currentSeasonData.precipitationDays} jours arrosés (≥ 1mm)</span>
              </div>

              <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-4">
                <span className="text-xs text-slate-400 font-medium">Bilan Hydrique (Pluie - ETP)</span>
                <div className={`mt-1 text-2xl font-black ${currentSeasonData.waterDeficitOrSurplusMm >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {currentSeasonData.waterDeficitOrSurplusMm >= 0 ? `+${currentSeasonData.waterDeficitOrSurplusMm}` : currentSeasonData.waterDeficitOrSurplusMm} mm
                </div>
                <span className="text-[11px] text-slate-500">ETP Penman : {currentSeasonData.etpPenmanMm} mm</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: The 9 Decades Breakdown */}
        {selectedSubTab === 'decades' && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-base font-bold text-white">
                  Découpage en 9 Décades de la Saison ({currentSeasonData.name})
                </h4>
                <p className="text-xs text-slate-400">
                  Évolution progressive par tranches de 10 jours des normales thermiques et du calendrier phénologique.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="border-b border-slate-800 bg-slate-950/90 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="py-3 px-3">Décade</th>
                    <th className="py-3 px-3">Tn Nuit</th>
                    <th className="py-3 px-3">Tx Jour</th>
                    <th className="py-3 px-3">Tm Moyenne</th>
                    <th className="py-3 px-3">Pluie</th>
                    <th className="py-3 px-3">Soleil</th>
                    <th className="py-3 px-3">Stade Phénologique & Végétatif</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {currentSeasonData.decades.map((dec) => (
                    <tr key={dec.decadeNumber} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-3 font-bold text-white flex items-center gap-2">
                        <span className="h-5 w-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-slate-300">
                          {dec.decadeNumber}
                        </span>
                        <span>{dec.label}</span>
                      </td>
                      <td className="py-3 px-3 text-sky-400 font-semibold">{formatTemp(dec.tMin)}</td>
                      <td className="py-3 px-3 text-rose-400 font-semibold">{formatTemp(dec.tMax)}</td>
                      <td className="py-3 px-3 text-amber-300 font-bold">{formatTemp(dec.tMean)}</td>
                      <td className="py-3 px-3 text-blue-300">{dec.precipitationMm} mm</td>
                      <td className="py-3 px-3 text-yellow-300">{dec.sunHours} h</td>
                      <td className="py-3 px-3 text-slate-400 italic flex items-center gap-1.5">
                        <Sprout className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                        {dec.agroPhenology}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Historical Analogs */}
        {selectedSubTab === 'analogs' && (
          <div className="mt-6 space-y-4">
            <div>
              <h4 className="text-base font-bold text-white">
                Saisons Historiques Analogues en France ({currentSeasonData.name})
              </h4>
              <p className="text-xs text-slate-400">
                Comparaison statistique avec les saisons de référence les plus remarquables des archives nationales (1950 - 2026).
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
              {currentSeasonData.historicalAnalogs.map((analog) => (
                <div 
                  key={analog.year}
                  className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-black text-white">{analog.year}</span>
                      <span className="rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-2 py-0.5 text-[10px] font-bold">
                        Similarité {analog.similarityScore}%
                      </span>
                    </div>
                    <span className={`text-xs font-black ${analog.anomalyVsNormal > 0 ? 'text-amber-400' : 'text-cyan-400'}`}>
                      {analog.anomalyVsNormal > 0 ? `+${analog.anomalyVsNormal}` : analog.anomalyVsNormal}°C
                    </span>
                  </div>

                  <p className="text-xs font-bold text-slate-200">
                    {analog.character}
                  </p>

                  <div className="rounded-xl bg-slate-900/80 p-2.5 border border-slate-800/80 text-[11px] text-slate-300">
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span>Pluviométrie :</span>
                      <span className="text-white font-semibold">{analog.precipitationMm} mm ({analog.precipRatioPct > 0 ? `+${analog.precipRatioPct}` : analog.precipRatioPct}%)</span>
                    </div>
                    <p className="mt-1 text-slate-400">
                      <strong>Impacts :</strong> {analog.consequences}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Agro-Climatic & Energy Indicators */}
        {selectedSubTab === 'indicators' && (
          <div className="mt-6 space-y-4">
            <div>
              <h4 className="text-base font-bold text-white">
                Indicateurs Agro-Climatologiques & Bilan Énergétique (DJU)
              </h4>
              <p className="text-xs text-slate-400">
                Calculs des Degrés-Jours Unifiés (DJU), de l'évapotranspiration potentielle et de la réserve utile des sols.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {/* DJU Heating Block */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
                <div className="flex items-center gap-2 text-indigo-400">
                  <Zap className="h-5 w-5" />
                  <span className="font-bold text-sm text-white">DJU Chauffage (Base 18°C)</span>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-indigo-300">
                    {currentSeasonData.djuHeating}
                  </span>
                  <span className="text-xs text-slate-400">DJU normaux</span>
                </div>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  Mesure la rigueur hivernale et la dépense énergétique nécessaire pour maintenir 19°C dans les bâtiments.
                </p>
              </div>

              {/* Water balance Block */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
                <div className="flex items-center gap-2 text-blue-400">
                  <Droplets className="h-5 w-5" />
                  <span className="font-bold text-sm text-white">ETP & Bilan Hydrique</span>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-blue-300">
                    {currentSeasonData.etpPenmanMm} mm
                  </span>
                  <span className="text-xs text-slate-400">ETP Penman</span>
                </div>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  Précipitations normales ({currentSeasonData.precipitationMm} mm) vs évaporation. Bilan saisonnier : <strong className={currentSeasonData.waterDeficitOrSurplusMm >= 0 ? 'text-emerald-400' : 'text-rose-400'}>{currentSeasonData.waterDeficitOrSurplusMm >= 0 ? `+${currentSeasonData.waterDeficitOrSurplusMm}` : currentSeasonData.waterDeficitOrSurplusMm} mm</strong>.
                </p>
              </div>

              {/* Remarkable thresholds */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
                <div className="flex items-center gap-2 text-amber-400">
                  <Flame className="h-5 w-5" />
                  <span className="font-bold text-sm text-white">Jours Remarquables</span>
                </div>
                <div className="mt-3 space-y-1.5 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Jours de gel (Tn ≤ 0°C) :</span>
                    <strong className="text-cyan-300">{currentSeasonData.frostDays} j</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Chaleur (Tx ≥ 25°C) :</span>
                    <strong className="text-amber-300">{currentSeasonData.heatDays} j</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Forte chaleur (Tx ≥ 30°C) :</span>
                    <strong className="text-rose-300">{currentSeasonData.veryHotDays} j</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Nuits tropicales (Tn ≥ 20°C) :</span>
                    <strong className="text-purple-300">{currentSeasonData.tropicalNights} j</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Benchmark 8 French Regions */}
        {selectedSubTab === 'regions' && (
          <div className="mt-6 space-y-4">
            <div>
              <h4 className="text-base font-bold text-white">
                Comparateur Climatologique Régional ({currentSeasonData.name})
              </h4>
              <p className="text-xs text-slate-400">
                Comparez les normales de {currentStation.name} avec les 8 grands repères bio-climatiques de France métropolitaine.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="border-b border-slate-800 bg-slate-950/90 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="py-3 px-3">Station & Zone Climatique</th>
                    <th className="py-3 px-3">Altitude</th>
                    <th className="py-3 px-3">T° Moyenne</th>
                    <th className="py-3 px-3">Pluie</th>
                    <th className="py-3 px-3">Soleil</th>
                    <th className="py-3 px-3">Jours Gel</th>
                    <th className="py-3 px-3">Jours Chaleur</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {/* Current station row */}
                  <tr className="bg-indigo-950/40 font-bold text-white border-l-4 border-indigo-500">
                    <td className="py-3 px-3 flex items-center gap-2">
                      <span>★ {currentStation.name} (Station sélectionnée)</span>
                    </td>
                    <td className="py-3 px-3 text-slate-300">{currentStation.altitude} m</td>
                    <td className="py-3 px-3 text-amber-400">{formatTemp(currentSeasonData.tMean)}</td>
                    <td className="py-3 px-3 text-blue-300">{currentSeasonData.precipitationMm} mm</td>
                    <td className="py-3 px-3 text-yellow-300">{currentSeasonData.sunHours} h</td>
                    <td className="py-3 px-3 text-cyan-300">{currentSeasonData.frostDays} j</td>
                    <td className="py-3 px-3 text-orange-300">{currentSeasonData.heatDays} j</td>
                  </tr>

                  {/* Benchmark regions */}
                  {BENCHMARK_FRENCH_REGIONS.map((bench) => {
                    const benchSeason = bench.seasons[activeSeason];
                    return (
                      <tr key={bench.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-3">
                          <div className="font-semibold text-white">{bench.name}</div>
                          <div className="text-[10px] text-slate-400">{bench.climateZone}</div>
                        </td>
                        <td className="py-3 px-3 text-slate-400">{bench.altitude} m</td>
                        <td className="py-3 px-3 text-amber-300">{formatTemp(benchSeason.tMean)}</td>
                        <td className="py-3 px-3 text-blue-300">{benchSeason.rainMm} mm</td>
                        <td className="py-3 px-3 text-yellow-300">{benchSeason.sunH} h</td>
                        <td className="py-3 px-3 text-slate-300">{benchSeason.frostDays} j</td>
                        <td className="py-3 px-3 text-slate-300">{benchSeason.heatDays} j</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* 2. Real-Time Seasonal Deviation & Official Meteorological Diagnostic Banner */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl backdrop-blur sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Bulletin Officiel de Diagnostic Climatologique
            </span>
            <h3 className={`font-black text-white ${seniorMode ? 'text-2xl' : 'text-xl'}`}>
              Bilan d'Écart aux Moyennes de Saison ({currentStation.name})
            </h3>
          </div>
        </div>

        {/* Narrative Synthesis */}
        <p className={`mt-4 text-slate-300 leading-relaxed ${seniorMode ? 'text-lg' : 'text-sm'}`}>
          {realtimeComparison.officialDiagnosticReport.executiveSummary}
        </p>

        {/* 4 Real-time Deviation Metric Blocks */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
            <span className="text-xs text-slate-400 font-semibold">Écart Température Instantané</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className={`text-3xl font-black ${realtimeComparison.tempAnomalyColor}`}>
                {realtimeComparison.tempAnomaly > 0 ? `+${realtimeComparison.tempAnomaly}` : realtimeComparison.tempAnomaly}°C
              </span>
              <span className="text-xs text-slate-400">vs normale ({realtimeComparison.referenceNormalTemp}°C)</span>
            </div>
            <p className="mt-2 text-xs text-slate-400">
              Statut : <strong className={realtimeComparison.tempAnomalyColor}>{realtimeComparison.tempAnomalyStatus}</strong>.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
            <span className="text-xs text-slate-400 font-semibold">Bilan Pluviométrique</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className={`text-3xl font-black ${realtimeComparison.precipAnomalyColor}`}>
                {realtimeComparison.precipAnomalyPct > 0 ? `+${realtimeComparison.precipAnomalyPct}%` : `${realtimeComparison.precipAnomalyPct}%`}
              </span>
              <span className="text-xs text-slate-400">vs cumul normal</span>
            </div>
            <p className="mt-2 text-xs text-slate-400">
              Statut : <strong className={realtimeComparison.precipAnomalyColor}>{realtimeComparison.precipAnomalyStatus}</strong>.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
            <span className="text-xs text-slate-400 font-semibold">Réserve Utile des Sols</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className={`text-3xl font-black ${realtimeComparison.soilMoistureReservePct < 40 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {realtimeComparison.soilMoistureReservePct}%
              </span>
              <span className="text-xs text-slate-400">Indice SSWI</span>
            </div>
            <p className="mt-2 text-xs text-slate-400">
              État des sols : <strong className="text-slate-300">{realtimeComparison.soilDroughtLabel}</strong>.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
            <span className="text-xs text-slate-400 font-semibold">Impact Facture Énergie (DJU)</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className={`text-3xl font-black ${realtimeComparison.djuHeatingDeltaPct <= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {realtimeComparison.djuHeatingDeltaPct > 0 ? `+${realtimeComparison.djuHeatingDeltaPct}%` : `${realtimeComparison.djuHeatingDeltaPct}%`}
              </span>
              <span className="text-xs text-slate-400">vs normale</span>
            </div>
            <p className="mt-2 text-xs text-slate-400">
              {realtimeComparison.djuHeatingDeltaPct <= 0 ? "Économie sur la consommation de chauffage." : "Surconsommation liée au froid."}
            </p>
          </div>
        </div>

        {/* Actionable Climatological Advisories */}
        <div className="mt-6 rounded-2xl bg-slate-950/60 border border-slate-800/80 p-4">
          <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            Recommandations & Conséquences Agro-Climatologiques
          </h4>
          <ul className="mt-2.5 space-y-1.5 text-xs text-slate-300">
            {realtimeComparison.officialDiagnosticReport.actionableAdvisories.map((adv, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0"></span>
                <span>{adv}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
