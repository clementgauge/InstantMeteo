import React, { useState } from 'react';
import { 
  Globe, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Wind, 
  CloudRain, 
  Sun, 
  Thermometer, 
  ShieldAlert, 
  Sparkles, 
  RefreshCw, 
  MapPin, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronRight, 
  Droplet, 
  Zap, 
  Activity, 
  Compass,
  Flame,
  Info
} from 'lucide-react';
import { 
  NationalFourWeekBulletinCollection, 
  NationalFourWeekBulletinWeek, 
  NationalBulletinScenario, 
  NationalRegionalDetail 
} from '../types/weather';
import { generateNationalFourWeekBulletin } from '../services/nationalFourWeekBulletinService';

interface GigaNationalFourWeekBulletinCardProps {
  seniorMode?: boolean;
  tempUnit?: 'C' | 'F';
}

export const GigaNationalFourWeekBulletinCard: React.FC<GigaNationalFourWeekBulletinCardProps> = ({
  seniorMode = false,
  tempUnit = 'C'
}) => {
  const [data, setData] = useState<NationalFourWeekBulletinCollection>(() => generateNationalFourWeekBulletin());
  const [selectedWeekIndex, setSelectedWeekIndex] = useState<number>(1);
  const [selectedRegionCode, setSelectedRegionCode] = useState<string>('NO');
  const [activeSubTab, setActiveSubTab] = useState<'scenarios' | 'regions' | 'impacts' | 'drivers'>('scenarios');
  const [lastRefreshed, setLastRefreshed] = useState<string>('');

  const refreshBulletin = () => {
    const res = generateNationalFourWeekBulletin();
    setData(res);
    setLastRefreshed(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  };

  const selectedWeek: NationalFourWeekBulletinWeek = data.weeks.find(w => w.weekIndex === selectedWeekIndex) || data.weeks[0];
  const selectedRegion: NationalRegionalDetail = selectedWeek.regions.find(r => r.regionCode === selectedRegionCode) || selectedWeek.regions[0];

  return (
    <div id="giga-national-four-week-bulletin" className="space-y-6">
      {/* Hero Header Banner */}
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-blue-950/40 to-slate-900 p-6 sm:p-8 shadow-2xl backdrop-blur relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-black uppercase tracking-wider mb-2">
              <Globe className="h-4 w-4" />
              <span>Observatoire Climatologique Officiel • Échéance 4 Semaines (S+1 à S+4)</span>
            </div>
            <h2 className={`font-black text-white ${seniorMode ? 'text-3xl' : 'text-2xl sm:text-3xl'}`}>
              Giga Bulletin National à 4 Semaines pour la France
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Grand diagnostic synoptique et probabiliste multi-systèmes (ECMWF C3S, Météo-France, UK MetOffice) • Scénarios comparés, découpage par grandes régions françaises et bilans hydriques/agricoles.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="text-[10px] text-slate-400 block font-semibold">Réactualisation Mensuelle Continue</span>
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 justify-end">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                {lastRefreshed || data.generatedAt}
              </span>
            </div>
            <button
              onClick={refreshBulletin}
              className="flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 px-3.5 py-2 text-xs font-bold transition shadow"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Actualiser</span>
            </button>
          </div>
        </div>

        {/* Executive National Synthesis Box */}
        <div className="mt-5 rounded-2xl bg-slate-950/80 border border-emerald-500/30 p-4 space-y-1 text-xs text-slate-200 leading-relaxed">
          <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase tracking-wider">
            <Sparkles className="h-4 w-4" />
            <span>Synthèse Nationale Exécutive :</span>
          </div>
          <p className="text-slate-100 font-medium">{data.executiveSynthesis}</p>
        </div>

        {/* Global Drivers Ticker */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap gap-3 text-[11px] text-slate-400">
          <span className="text-cyan-300 font-bold">Moteurs Téléconnectifs :</span>
          <span>• <strong>MJO :</strong> {data.teleconnectionDriversSummary.mjoPhase}</span>
          <span>• <strong>NAO :</strong> {data.teleconnectionDriversSummary.naoTrend}</span>
          <span>• <strong>ENSO :</strong> {data.teleconnectionDriversSummary.ensoPhase}</span>
        </div>
      </div>

      {/* Week Selector Bar */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 shadow-xl backdrop-blur space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-bold text-slate-400 uppercase">Sélectionnez la Semaine d'Échéance :</span>
          <span className="text-xs text-emerald-400 font-bold">Période couverte : {data.dateRangeFormatted}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {data.weeks.map((w) => {
            const isSel = w.weekIndex === selectedWeekIndex;
            return (
              <button
                key={w.weekIndex}
                onClick={() => setSelectedWeekIndex(w.weekIndex)}
                className={`rounded-2xl border p-4 text-left transition flex flex-col justify-between ${
                  isSel
                    ? 'bg-emerald-600/20 border-emerald-500 shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-400'
                    : 'bg-slate-950/80 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-black text-emerald-400">Semaine S+{w.weekIndex}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {w.confidenceIndexPct}% fiab.
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-xs">{w.shortDateRange}</h4>
                </div>

                <div className="mt-2 text-[11px] text-slate-300 line-clamp-1">
                  Scénario dominant : <strong className="text-cyan-300">{w.scenarios.dominant.regimeType}</strong>
                </div>
              </button>
            );
          })}
        </div>

        {/* Sub Navigation Bar for Selected Week */}
        <div className="pt-3 border-t border-slate-800 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveSubTab('scenarios')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeSubTab === 'scenarios'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Compass className="h-3.5 w-3.5" />
            <span>1. Les 3 Scénarios Probabilistes ({selectedWeek.shortDateRange})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('regions')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeSubTab === 'regions'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <MapPin className="h-3.5 w-3.5" />
            <span>2. Zoom Régional France (6 Grandes Régions)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('impacts')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeSubTab === 'impacts'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Droplet className="h-3.5 w-3.5" />
            <span>3. Risques, Bilan Hydrique & Énergie</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: 3 PROBABILISTIC SCENARIOS COMPARISON */}
      {activeSubTab === 'scenarios' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-xl backdrop-blur space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  {selectedWeek.weekLabel}
                </span>
                <h3 className="text-2xl font-black text-white mt-0.5">Scénarios Synoptiques Probabilistes</h3>
                <p className="text-xs text-slate-300 mt-1">{selectedWeek.generalAtmosphericContext}</p>
              </div>

              <div className="rounded-2xl bg-slate-950 border border-slate-800 px-4 py-2 text-center">
                <span className="text-[10px] text-slate-400 block font-semibold">Indice de Confiance Semaine</span>
                <span className="text-xl font-black text-emerald-400">{selectedWeek.confidenceIndexPct} %</span>
              </div>
            </div>

            {/* 3 Scenarios Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* DOMINANT */}
              <div className="rounded-2xl bg-slate-950/90 border-2 border-emerald-500/50 p-6 flex flex-col justify-between shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-emerald-500 text-slate-950 text-[10px] font-black uppercase px-3 py-1 rounded-bl-xl">
                  Scénario Dominant • {selectedWeek.scenarios.dominant.probabilityPct}%
                </div>

                <div className="space-y-4">
                  <div className="pt-2">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                      Régime : {selectedWeek.scenarios.dominant.regimeType}
                    </span>
                    <h4 className="text-lg font-black text-white mt-1 leading-snug">
                      {selectedWeek.scenarios.dominant.name}
                    </h4>
                  </div>

                  {/* Anomalies Badge */}
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      T°C : {selectedWeek.scenarios.dominant.temperatureAnomalyC > 0 ? `+${selectedWeek.scenarios.dominant.temperatureAnomalyC}` : selectedWeek.scenarios.dominant.temperatureAnomalyC}°C
                    </span>
                    <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      Pluie : {selectedWeek.scenarios.dominant.precipitationAnomalyPct > 0 ? `+${selectedWeek.scenarios.dominant.precipitationAnomalyPct}` : selectedWeek.scenarios.dominant.precipitationAnomalyPct}%
                    </span>
                  </div>

                  <div className="space-y-2 text-xs text-slate-300">
                    <div className="rounded-xl bg-slate-900 p-3 border border-slate-800">
                      <span className="font-bold text-slate-400 block mb-0.5">Mécanisme Synoptique :</span>
                      <span>{selectedWeek.scenarios.dominant.synopticMechanism}</span>
                    </div>

                    <div className="rounded-xl bg-slate-900 p-3 border border-slate-800">
                      <span className="font-bold text-emerald-300 block mb-0.5">Temps Sensible Attendu :</span>
                      <span>{selectedWeek.scenarios.dominant.description}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ALTERNATIVE */}
              <div className="rounded-2xl bg-slate-950/90 border border-amber-500/40 p-6 flex flex-col justify-between shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-amber-500/20 text-amber-300 border-b border-l border-amber-500/40 text-[10px] font-black uppercase px-3 py-1 rounded-bl-xl">
                  Scénario Alternatif • {selectedWeek.scenarios.alternative.probabilityPct}%
                </div>

                <div className="space-y-4">
                  <div className="pt-2">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                      Régime : {selectedWeek.scenarios.alternative.regimeType}
                    </span>
                    <h4 className="text-lg font-black text-white mt-1 leading-snug">
                      {selectedWeek.scenarios.alternative.name}
                    </h4>
                  </div>

                  {/* Anomalies Badge */}
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-slate-800 text-slate-200 border border-slate-700">
                      T°C : {selectedWeek.scenarios.alternative.temperatureAnomalyC > 0 ? `+${selectedWeek.scenarios.alternative.temperatureAnomalyC}` : selectedWeek.scenarios.alternative.temperatureAnomalyC}°C
                    </span>
                    <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      Pluie : {selectedWeek.scenarios.alternative.precipitationAnomalyPct > 0 ? `+${selectedWeek.scenarios.alternative.precipitationAnomalyPct}` : selectedWeek.scenarios.alternative.precipitationAnomalyPct}%
                    </span>
                  </div>

                  <div className="space-y-2 text-xs text-slate-300">
                    <div className="rounded-xl bg-slate-900 p-3 border border-slate-800">
                      <span className="font-bold text-slate-400 block mb-0.5">Mécanisme Synoptique :</span>
                      <span>{selectedWeek.scenarios.alternative.synopticMechanism}</span>
                    </div>

                    <div className="rounded-xl bg-slate-900 p-3 border border-slate-800">
                      <span className="font-bold text-amber-300 block mb-0.5">Temps Sensible Attendu :</span>
                      <span>{selectedWeek.scenarios.alternative.description}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* MINORITY */}
              <div className="rounded-2xl bg-slate-950/90 border border-purple-500/30 p-6 flex flex-col justify-between shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-purple-500/20 text-purple-300 border-b border-l border-purple-500/40 text-[10px] font-black uppercase px-3 py-1 rounded-bl-xl">
                  Scénario Minoritaire • {selectedWeek.scenarios.minority.probabilityPct}%
                </div>

                <div className="space-y-4">
                  <div className="pt-2">
                    <span className="text-xs font-bold text-purple-400 uppercase tracking-wider block">
                      Régime : {selectedWeek.scenarios.minority.regimeType}
                    </span>
                    <h4 className="text-lg font-black text-white mt-1 leading-snug">
                      {selectedWeek.scenarios.minority.name}
                    </h4>
                  </div>

                  {/* Anomalies Badge */}
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-slate-800 text-slate-200 border border-slate-700">
                      T°C : {selectedWeek.scenarios.minority.temperatureAnomalyC > 0 ? `+${selectedWeek.scenarios.minority.temperatureAnomalyC}` : selectedWeek.scenarios.minority.temperatureAnomalyC}°C
                    </span>
                    <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      Pluie : {selectedWeek.scenarios.minority.precipitationAnomalyPct > 0 ? `+${selectedWeek.scenarios.minority.precipitationAnomalyPct}` : selectedWeek.scenarios.minority.precipitationAnomalyPct}%
                    </span>
                  </div>

                  <div className="space-y-2 text-xs text-slate-300">
                    <div className="rounded-xl bg-slate-900 p-3 border border-slate-800">
                      <span className="font-bold text-slate-400 block mb-0.5">Mécanisme Synoptique :</span>
                      <span>{selectedWeek.scenarios.minority.synopticMechanism}</span>
                    </div>

                    <div className="rounded-xl bg-slate-900 p-3 border border-slate-800">
                      <span className="font-bold text-purple-300 block mb-0.5">Temps Sensible Attendu :</span>
                      <span>{selectedWeek.scenarios.minority.description}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: REGIONAL BREAKDOWN (6 GEOGRAPHIC ZONES) */}
      {activeSubTab === 'regions' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl backdrop-blur">
            <div className="mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Découpage Géographique National</span>
              <h3 className="text-xl font-bold text-white mt-0.5">Impacts Météorologiques par Grande Région Française</h3>
              <p className="text-xs text-slate-300 mt-1">Sélectionnez une région pour explorer le bulletin dédié à {selectedWeek.shortDateRange} :</p>
            </div>

            {/* Region Selector Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mb-6">
              {selectedWeek.regions.map((reg) => {
                const isSel = reg.regionCode === selectedRegionCode;
                return (
                  <button
                    key={reg.regionCode}
                    onClick={() => setSelectedRegionCode(reg.regionCode)}
                    className={`rounded-xl border p-3 text-left transition ${
                      isSel
                        ? 'bg-blue-600/20 border-blue-500 shadow-md ring-1 ring-blue-400'
                        : 'bg-slate-950/80 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-[10px] font-bold text-slate-400 block">{reg.regionCode}</span>
                    <h4 className="font-bold text-white text-xs truncate mt-0.5">{reg.regionName.split('(')[0]}</h4>
                    <span className="text-[10px] font-bold text-cyan-400 mt-1 block">
                      {reg.tempAnomalyC > 0 ? `+${reg.tempAnomalyC}` : reg.tempAnomalyC}°C
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selected Region Detailed Card */}
            <div className="rounded-2xl border border-blue-500/30 bg-slate-950/90 p-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                    Zoom Régional • {selectedWeek.weekLabel.split(':')[0]}
                  </span>
                  <h4 className="text-xl font-black text-white mt-0.5">{selectedRegion.regionName}</h4>
                  <p className="text-xs text-slate-300 mt-1 font-semibold">{selectedRegion.dominantWeather}</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-slate-900 border border-slate-800 px-3 py-1.5 text-center">
                    <span className="text-[10px] text-slate-400 block">Anomalie T°C</span>
                    <span className={`text-base font-black ${
                      selectedRegion.tempAnomalyC > 0 ? 'text-rose-400' : 'text-cyan-400'
                    }`}>
                      {selectedRegion.tempAnomalyC > 0 ? `+${selectedRegion.tempAnomalyC}` : selectedRegion.tempAnomalyC}°C
                    </span>
                  </div>

                  <div className="rounded-xl bg-slate-900 border border-slate-800 px-3 py-1.5 text-center">
                    <span className="text-[10px] text-slate-400 block">Pluviométrie</span>
                    <span className={`text-base font-black ${
                      selectedRegion.precipAnomalyPct > 0 ? 'text-blue-400' : 'text-amber-400'
                    }`}>
                      {selectedRegion.precipAnomalyPct > 0 ? `+${selectedRegion.precipAnomalyPct}` : selectedRegion.precipAnomalyPct}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Narrative & Risks */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 space-y-2">
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block">
                    Synthèse Météorologique Régionale
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed font-medium">
                    {selectedRegion.summaryText}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 space-y-2">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                    Points de Vigilance & Risques Notables
                  </span>
                  <ul className="space-y-1.5">
                    {selectedRegion.riskHighlights.map((r, idx) => (
                      <li key={idx} className="text-xs text-slate-200 flex items-start gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: RISKS, HYDROLOGY & ENERGY */}
      {activeSubTab === 'impacts' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl backdrop-blur space-y-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Analyses Sectorielles Clés</span>
              <h3 className="text-xl font-bold text-white mt-0.5">Bilan Hydrique, Agricole & Énergétique National</h3>
              <p className="text-xs text-slate-300 mt-1">Évaluation des conséquences environnementales pour {selectedWeek.shortDateRange} :</p>
            </div>

            {/* National Risks Banner */}
            <div className="rounded-2xl bg-amber-950/30 border border-amber-500/40 p-5 space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                <ShieldAlert className="h-4 w-4" />
                <span>Principaux Risques Météorologiques Identifiés à l'Échelle Nationale :</span>
              </div>
              <ul className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {selectedWeek.keyNationalRisks.map((risk, i) => (
                  <li key={i} className="rounded-xl bg-slate-900/80 p-3 border border-slate-800 text-xs text-slate-200 leading-snug flex items-start gap-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Sectorial Impact Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-5 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                  <Droplet className="h-4 w-4" />
                  <span>Perspective Hydrologique & Agricole :</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedWeek.hydricAndAgriculturalOutlook}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-5 space-y-3">
                <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-wider">
                  <Zap className="h-4 w-4" />
                  <span>Perspective Énergétique & Réseau :</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedWeek.energyAndConsumptionOutlook}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
