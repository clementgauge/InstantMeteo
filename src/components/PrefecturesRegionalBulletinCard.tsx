import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  MapPin, 
  TrendingUp, 
  TrendingDown, 
  Wind, 
  Droplet, 
  CloudRain, 
  Sun, 
  CloudSun, 
  CloudFog, 
  Snowflake, 
  ShieldCheck, 
  AlertTriangle, 
  ChevronRight, 
  ChevronDown, 
  Search, 
  RotateCw,
  Compass,
  Scale,
  GitBranch,
  BarChart3,
  Thermometer,
  Layers
} from 'lucide-react';
import { 
  getNationalPrefecturesSynthesis, 
  NationalPrefecturesSynthesis, 
  RegionalBulletinAnalysis, 
  PrefectureForecastSummary 
} from '../services/prefecturesBulletinService';

interface PrefecturesRegionalBulletinCardProps {
  seniorMode?: boolean;
  tempUnit?: 'C' | 'F';
  onSelectStation?: (locality: any) => void;
}

export const PrefecturesRegionalBulletinCard: React.FC<PrefecturesRegionalBulletinCardProps> = ({
  seniorMode = false,
  tempUnit = 'C',
  onSelectStation
}) => {
  const [synthesis, setSynthesis] = useState<NationalPrefecturesSynthesis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRegionId, setSelectedRegionId] = useState<string>('ile-de-france');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'prefectures' | 'sous-prefectures'>('all');
  const [expandedLocalityId, setExpandedLocalityId] = useState<string | null>(null);
  const [activeRegionalView, setActiveRegionalView] = useState<'synthesis' | 'scenarios' | 'localities'>('synthesis');

  useEffect(() => {
    async function loadSynthesis() {
      try {
        const data = await getNationalPrefecturesSynthesis();
        setSynthesis(data);
      } catch (err) {
        console.error('Erreur chargement synthèse préfectures:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadSynthesis();
  }, []);

  const toDisplayTemp = (celsius: number): string => {
    if (tempUnit === 'F') {
      const f = Math.round((celsius * 9) / 5 + 32);
      return `${f}°F`;
    }
    return `${celsius > 0 ? `+${celsius}` : celsius}°C`;
  };

  const selectedRegion = synthesis?.regionsBulletins.find(r => r.region.id === selectedRegionId) 
    || synthesis?.regionsBulletins[0];

  const filteredLocalities = (selectedRegion?.localitiesForecasts || []).filter(item => {
    if (filterType === 'prefectures' && item.locality.status !== 'prefecture') return false;
    if (filterType === 'sous-prefectures' && item.locality.status !== 'sous-prefecture') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.locality.name.toLowerCase().includes(q) ||
        item.locality.departmentName.toLowerCase().includes(q) ||
        item.locality.departmentCode.includes(q)
      );
    }
    return true;
  });

  const getWeatherIcon = (code: number) => {
    if (code === 0 || code === 1) return <Sun className="h-5 w-5 text-amber-400" />;
    if (code === 2) return <CloudSun className="h-5 w-5 text-sky-400" />;
    if (code === 3) return <CloudSun className="h-5 w-5 text-slate-400" />;
    if (code === 45 || code === 48) return <CloudFog className="h-5 w-5 text-slate-300" />;
    if (code >= 71 && code <= 86) return <Snowflake className="h-5 w-5 text-sky-200" />;
    return <CloudRain className="h-5 w-5 text-blue-400" />;
  };

  if (isLoading || !synthesis) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-[#0F172A] p-8 text-center text-slate-400 space-y-3">
        <RotateCw className="h-8 w-8 animate-spin mx-auto text-sky-400" />
        <p className="text-sm font-semibold text-slate-200">
          Calcul et agrégation multi-modèles des préfectures et sous-préfectures en cours...
        </p>
        <p className="text-xs text-slate-400">
          Interrogation en temps réel des 13 chefs-lieux régionaux, comparaison aux normales 1991-2020 et élagage robuste des 5% de scénarios extrêmes.
        </p>
      </div>
    );
  }

  return (
    <div 
      id="prefectures-regional-bulletin-card"
      className="rounded-2xl border border-slate-800 bg-[#0F172A] shadow-2xl overflow-hidden space-y-6"
    >
      {/* 1. En-tête Principal & Télémétrie Nationale */}
      <div className="p-5 sm:p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30 shrink-0">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-500/40">
                  Échelle Nationale • 13 Régions • 96 Préfectures
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  Normales 1991-2020 : {synthesis.nationalThermalAnomalyLabel}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Consensus Élagué à 90%
                </span>
              </div>
              <h2 className={`font-black text-white mt-1 ${seniorMode ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'}`}>
                Bulletin Régional &amp; Analyse des Préfectures et Anomalies
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
                Chaque région, chef-lieu et sous-préfecture fait l'objet d'un calcul robuste combinant 
                <strong> AROME (1.3 km), ECMWF IFS (9 km), NOAA GFS, DWD ICON et UK Met Office</strong>. 
                Les 5% de scénarios extrêmes de chaque côté sont systématiquement neutralisés, et chaque température est comparée aux normales officielles 1991-2020 de Météo-France.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center shrink-0">
            <div className="rounded-xl border border-slate-700 bg-slate-900/90 px-3.5 py-2 text-right">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Concordance Nationale</div>
              <div className="text-lg font-black text-emerald-400 flex items-center justify-end gap-1">
                <ShieldCheck className="h-4 w-4" />
                <span>{synthesis.nationalMeanConcordancePct}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Indicateurs Clés Nationaux */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          <div className="rounded-xl border border-sky-500/20 bg-sky-950/20 p-3">
            <div className="text-[10px] uppercase font-bold text-sky-400 flex items-center gap-1">
              <TrendingDown className="h-3.5 w-3.5" />
              <span>Plus froid (Tn Nationale)</span>
            </div>
            <div className="text-sm font-black text-white mt-1 truncate">
              {synthesis.mostExtremePrefectureCold.name}
            </div>
            <div className="text-xs font-bold text-sky-300">
              {toDisplayTemp(synthesis.mostExtremePrefectureCold.tMin)}
            </div>
          </div>

          <div className="rounded-xl border border-amber-500/20 bg-amber-950/20 p-3">
            <div className="text-[10px] uppercase font-bold text-amber-400 flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Plus chaud (Tx Nationale)</span>
            </div>
            <div className="text-sm font-black text-white mt-1 truncate">
              {synthesis.mostExtremePrefectureWarm.name}
            </div>
            <div className="text-xs font-bold text-amber-300">
              {toDisplayTemp(synthesis.mostExtremePrefectureWarm.tMax)}
            </div>
          </div>

          <div className="rounded-xl border border-indigo-500/20 bg-indigo-950/20 p-3">
            <div className="text-[10px] uppercase font-bold text-indigo-400 flex items-center gap-1">
              <Wind className="h-3.5 w-3.5" />
              <span>Rafale Max Nationale</span>
            </div>
            <div className="text-sm font-black text-white mt-1 truncate">
              {synthesis.mostWindyLocality.name}
            </div>
            <div className="text-xs font-bold text-indigo-300">
              {synthesis.mostWindyLocality.gust} km/h ({synthesis.mostWindyLocality.windName})
            </div>
          </div>

          <div className="rounded-xl border border-blue-500/20 bg-blue-950/20 p-3">
            <div className="text-[10px] uppercase font-bold text-blue-400 flex items-center gap-1">
              <Droplet className="h-3.5 w-3.5" />
              <span>Précipitations Max</span>
            </div>
            <div className="text-sm font-black text-white mt-1 truncate">
              {synthesis.wetterLocality.name}
            </div>
            <div className="text-xs font-bold text-blue-300">
              {synthesis.wetterLocality.precip} mm cumulés
            </div>
          </div>
        </div>
      </div>

      {/* 2. Sélecteur des 13 Régions Métropolitaines */}
      <div className="px-5 sm:px-6 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Compass className="h-4 w-4 text-sky-400" />
            <span>Sélectionner une Région Métropolitaine :</span>
          </label>
          <span className="text-xs text-sky-400 font-semibold">
            {synthesis.regionsBulletins.length} Régions actives
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700">
          {synthesis.regionsBulletins.map(reg => {
            const isSelected = reg.region.id === selectedRegionId;
            return (
              <button
                key={reg.region.id}
                type="button"
                onClick={() => {
                  setSelectedRegionId(reg.region.id);
                  setExpandedLocalityId(null);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition cursor-pointer border ${
                  isSelected
                    ? 'border-blue-400 bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                    : 'border-slate-800 bg-slate-900/80 text-slate-300 hover:border-slate-700 hover:text-white'
                }`}
              >
                <span>{reg.region.name}</span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] ${
                  isSelected ? 'bg-blue-800 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {reg.region.departmentsCount} dépts
                </span>
                <span className={`text-[10px] font-bold ${reg.thermalAnomalyMeanC >= 0 ? 'text-amber-300' : 'text-sky-300'}`}>
                  {reg.thermalAnomalyMeanC >= 0 ? `+${reg.thermalAnomalyMeanC}°C` : `${reg.thermalAnomalyMeanC}°C`}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Onglets Régionaux : Synthèse & Anomalies / Scénarios d'Évolution / Préfectures */}
      {selectedRegion && (
        <div className="px-5 sm:px-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <button
              onClick={() => setActiveRegionalView('synthesis')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeRegionalView === 'synthesis'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Synthèse Régionale &amp; Anomalies</span>
            </button>
            <button
              onClick={() => setActiveRegionalView('scenarios')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeRegionalView === 'scenarios'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>Scénarios d'Évolution (Majoritaire vs Alternatif)</span>
            </button>
            <button
              onClick={() => setActiveRegionalView('localities')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeRegionalView === 'localities'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Préfectures &amp; Sous-Préfectures ({selectedRegion.localitiesForecasts.length})</span>
            </button>
          </div>

          {/* VUE 1 : SYNTHÈSE RÉGIONALE & ANOMALIES */}
          {activeRegionalView === 'synthesis' && (
            <div className="rounded-xl border border-slate-700/80 bg-slate-900/90 p-4 sm:p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                      {selectedRegion.scaleLabel}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      Chef-lieu administratif : {selectedRegion.region.chefLieuRegional}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-white">
                    Bassin Régional {selectedRegion.region.name} ({selectedRegion.region.departmentsCount} départements)
                  </h3>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                    selectedRegion.thermalAnomalyMeanC >= 1
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                      : selectedRegion.thermalAnomalyMeanC <= -1
                        ? 'bg-sky-500/15 border-sky-500/40 text-sky-300'
                        : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                  }`}>
                    {selectedRegion.thermalAnomalyLabel}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-800 border border-slate-700 text-slate-200">
                    Fourchette : {toDisplayTemp(selectedRegion.regionalTempRange.min)} à {toDisplayTemp(selectedRegion.regionalTempRange.max)}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                    Concordance : {selectedRegion.averageConcordancePct}%
                  </span>
                </div>
              </div>

              {/* Analyse Climatologique & Gradients */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300">
                <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                    <Thermometer className="w-3.5 h-3.5" />
                    <span>Masse d'Air &amp; Écart aux Normales 1991-2020 :</span>
                  </span>
                  <p className="leading-relaxed">{selectedRegion.airMassCharacteristics}</p>
                  <div className="pt-1 text-[11px] text-slate-400">
                    Normales régionales de référence (1991-2020) : Tn {toDisplayTemp(selectedRegion.climatologicalNormalRange.normalTMin)} • Tx {toDisplayTemp(selectedRegion.climatologicalNormalRange.normalTMax)}
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Accord des Centres Numériques :</span>
                  </span>
                  <p className="leading-relaxed">{selectedRegion.dominantModelsAgreement}</p>
                  <p className="text-[11px] text-slate-400">{selectedRegion.expertMeteorologistNote}</p>
                </div>
              </div>

              {/* Analyse Neige Régionale */}
              <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center gap-2.5 text-xs text-slate-300">
                <Snowflake className="w-4 h-4 text-sky-400 shrink-0" />
                <div>
                  <strong className="text-sky-300">Analyse Neige &amp; Isotherme :</strong> {selectedRegion.snowRiskSummary}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-400">
                <span>💨 {selectedRegion.regionalWindSummary}</span>
                <span>•</span>
                <span>🌧️ {selectedRegion.regionalPrecipConsensus}</span>
              </div>
            </div>
          )}

          {/* VUE 2 : SCÉNARIOS D'ÉVOLUTION (MAJORITAIRE vs ALTERNATIF) */}
          {activeRegionalView === 'scenarios' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
                <div className="font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-1">
                  <GitBranch className="w-4 h-4 text-purple-400" />
                  <span>Divergence Numérique &amp; Décomposition des Scénarios Météo</span>
                </div>
                <p>
                  Plutôt qu'un bulletin flou à issue unique, la modélisation sépare les trajectoires possibles selon la fiabilité des ensembles : le scénario majoritaire soutenu par le consensus européen à haute résolution, et le scénario alternatif en cas de décrochage dépressionnaire ou d'inversion thermique.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Scénario Majoritaire */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950/40 border border-emerald-500/40 shadow-lg space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                    <div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        Probabilité : {selectedRegion.scenarios.dominant.probabilityPct}%
                      </span>
                      <h4 className="font-black text-white text-base mt-1">
                        {selectedRegion.scenarios.dominant.name}
                      </h4>
                    </div>
                    <span className="text-2xl">🎯</span>
                  </div>

                  <div className="text-xs space-y-2 text-slate-300">
                    <div>
                      <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block">Configuration Synoptique :</span>
                      <p>{selectedRegion.scenarios.dominant.synopticSetup}</p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                      <span className="font-bold text-emerald-300 uppercase tracking-wider text-[10px] block">Ce que ça donne concrètement :</span>
                      <p className="mt-0.5">{selectedRegion.scenarios.dominant.concreteConsequences}</p>
                    </div>

                    <div>
                      <span className="font-bold text-sky-400 uppercase tracking-wider text-[10px] block">Risque de Neige :</span>
                      <p>{selectedRegion.scenarios.dominant.snowOutlook}</p>
                    </div>

                    <div>
                      <span className="font-bold text-indigo-400 uppercase tracking-wider text-[10px] block">Vent &amp; Vigilance :</span>
                      <p>{selectedRegion.scenarios.dominant.windAndVigilance}</p>
                    </div>

                    <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                      🌡️ {selectedRegion.scenarios.dominant.tempImpact}
                    </div>
                  </div>
                </div>

                {/* Scénario Alternatif */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-purple-500/40 shadow-lg space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                    <div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/40">
                        Probabilité : {selectedRegion.scenarios.alternative.probabilityPct}%
                      </span>
                      <h4 className="font-black text-white text-base mt-1">
                        {selectedRegion.scenarios.alternative.name}
                      </h4>
                    </div>
                    <span className="text-2xl">🔀</span>
                  </div>

                  <div className="text-xs space-y-2 text-slate-300">
                    <div>
                      <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block">Hypothèse Synoptique :</span>
                      <p>{selectedRegion.scenarios.alternative.synopticSetup}</p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                      <span className="font-bold text-purple-300 uppercase tracking-wider text-[10px] block">Ce que ça donne concrètement :</span>
                      <p className="mt-0.5">{selectedRegion.scenarios.alternative.concreteConsequences}</p>
                    </div>

                    <div>
                      <span className="font-bold text-sky-400 uppercase tracking-wider text-[10px] block">Risque de Neige :</span>
                      <p>{selectedRegion.scenarios.alternative.snowOutlook}</p>
                    </div>

                    <div>
                      <span className="font-bold text-indigo-400 uppercase tracking-wider text-[10px] block">Vent &amp; Vigilance :</span>
                      <p>{selectedRegion.scenarios.alternative.windAndVigilance}</p>
                    </div>

                    <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                      🌡️ {selectedRegion.scenarios.alternative.tempImpact}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VUE 3 : PRÉFECTURES & SOUS-PRÉFECTURES */}
          {activeRegionalView === 'localities' && (
            <div className="space-y-4">
              {/* Barre de Filtre & Recherche Locale */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                <div className="relative w-full sm:w-72">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Rechercher une préfecture..."
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 pl-9 text-xs font-medium text-white placeholder-slate-500 focus:border-sky-400 focus:outline-none"
                  />
                  <Search className="h-4 w-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>

                <div className="flex items-center gap-1.5 self-start sm:self-center">
                  <button
                    type="button"
                    onClick={() => setFilterType('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      filterType === 'all'
                        ? 'bg-slate-700 text-white'
                        : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    Tous ({selectedRegion.localitiesForecasts.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterType('prefectures')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      filterType === 'prefectures'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    Préfectures
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterType('sous-prefectures')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      filterType === 'sous-prefectures'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    Sous-Préfectures
                  </button>
                </div>
              </div>

              {/* Liste Détaillée des Préfectures et Sous-Préfectures */}
              <div className="space-y-3 pb-6">
                {filteredLocalities.map(item => {
                  const isExpanded = expandedLocalityId === item.locality.id;
                  return (
                    <div
                      key={item.locality.id}
                      className="rounded-xl border border-slate-800 bg-slate-950/80 overflow-hidden transition hover:border-slate-700"
                    >
                      <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 shrink-0 mt-0.5">
                            {getWeatherIcon(item.dominantWeatherCode)}
                          </div>

                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-400/30">
                                [Échelle Locale : {item.locality.name}]
                              </span>
                              <h4 className="font-bold text-white text-base">
                                {item.locality.name}
                              </h4>
                              <span className={`px-2 py-0.2 rounded text-[10px] font-black uppercase tracking-wider ${
                                item.locality.status === 'prefecture'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                  : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                              }`}>
                                {item.locality.status === 'prefecture' ? 'Préfecture' : 'Sous-Préfecture'}
                              </span>
                              <span className="text-xs text-slate-400">
                                {item.locality.departmentCode} - {item.locality.departmentName} ({item.locality.altitude} m)
                              </span>
                              <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                                item.thermalAnomalyC >= 1
                                  ? 'bg-amber-500/20 text-amber-300'
                                  : item.thermalAnomalyC <= -1
                                    ? 'bg-sky-500/20 text-sky-300'
                                    : 'bg-emerald-500/20 text-emerald-300'
                              }`}>
                                {item.thermalAnomalyLabel}
                              </span>
                            </div>

                            <div className="text-xs text-slate-300 mt-1 flex items-center gap-2">
                              <span className="font-semibold">{item.dominantWeatherLabel}</span>
                              <span>•</span>
                              <span className="text-slate-400">{item.locality.elevationStage}</span>
                            </div>

                            <div className="text-[11px] text-slate-400 mt-1">
                              💡 <em>{item.microclimaticNotice}</em>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 self-end md:self-center shrink-0">
                          {/* Températures Tn / Tx */}
                          <div className="text-right">
                            <div className="text-xs text-slate-400 font-medium">Consensus 90%</div>
                            <div className="flex items-center gap-2 text-sm font-black">
                              <span className="text-sky-300">{toDisplayTemp(item.tMinConsensus)}</span>
                              <span className="text-slate-500">/</span>
                              <span className="text-amber-400">{toDisplayTemp(item.tMaxConsensus)}</span>
                            </div>
                            <div className="text-[10px] text-slate-400">
                              Vent : {item.windSpeedMaxConsensus} km/h (raf. {item.windGustMax})
                            </div>
                          </div>

                          {/* Score de concordance */}
                          <div className="text-right pl-3 border-l border-slate-800 hidden sm:block">
                            <div className="text-[10px] text-slate-400 font-medium">Concordance</div>
                            <div className="text-xs font-bold text-emerald-400">
                              {item.concordanceScorePct}%
                            </div>
                            <div className="text-[9px] text-slate-500">
                              Écart : ±{item.spreadCelsius}°C
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setExpandedLocalityId(isExpanded ? null : item.locality.id)}
                            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
                            title={isExpanded ? 'Masquer la comparaison multi-modèles' : 'Voir la comparaison des 5 modèles'}
                          >
                            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Section Dépliée : Comparaison des 5 modèles numériques */}
                      {isExpanded && (
                        <div className="border-t border-slate-800/80 bg-slate-900/50 p-4 space-y-3">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                              <Scale className="h-3.5 w-3.5" />
                              <span>Simulation des 5 Grands Centres Météorologiques pour {item.locality.name} :</span>
                            </span>
                            <span className="text-[11px] text-slate-400">
                              Zone de fiabilité : {item.locality.geographicZone}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                            {/* AROME */}
                            <div className="p-2.5 rounded-lg bg-slate-950/80 border border-sky-500/30">
                              <div className="text-[10px] font-bold text-sky-300 uppercase">Météo-France</div>
                              <div className="text-[9px] text-slate-400">AROME 1.3km</div>
                              <div className="text-sm font-black text-white mt-1">
                                {toDisplayTemp(item.modelsComparison.arome.tMin)} / {toDisplayTemp(item.modelsComparison.arome.tMax)}
                              </div>
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                {item.modelsComparison.arome.precip} mm • {item.modelsComparison.arome.wind} km/h
                              </div>
                            </div>

                            {/* ECMWF */}
                            <div className="p-2.5 rounded-lg bg-slate-950/80 border border-blue-500/30">
                              <div className="text-[10px] font-bold text-blue-300 uppercase">CEP / ECMWF</div>
                              <div className="text-[9px] text-slate-400">IFS 9km</div>
                              <div className="text-sm font-black text-white mt-1">
                                {toDisplayTemp(item.modelsComparison.ecmwf.tMin)} / {toDisplayTemp(item.modelsComparison.ecmwf.tMax)}
                              </div>
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                {item.modelsComparison.ecmwf.precip} mm • {item.modelsComparison.ecmwf.wind} km/h
                              </div>
                            </div>

                            {/* GFS */}
                            <div className="p-2.5 rounded-lg bg-slate-950/80 border border-purple-500/30">
                              <div className="text-[10px] font-bold text-purple-300 uppercase">NOAA GFS</div>
                              <div className="text-[9px] text-slate-400">FV3 13km</div>
                              <div className="text-sm font-black text-white mt-1">
                                {toDisplayTemp(item.modelsComparison.gfs.tMin)} / {toDisplayTemp(item.modelsComparison.gfs.tMax)}
                              </div>
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                {item.modelsComparison.gfs.precip} mm • {item.modelsComparison.gfs.wind} km/h
                              </div>
                            </div>

                            {/* ICON */}
                            <div className="p-2.5 rounded-lg bg-slate-950/80 border border-emerald-500/30">
                              <div className="text-[10px] font-bold text-emerald-300 uppercase">DWD ICON</div>
                              <div className="text-[9px] text-slate-400">ICON-EU 6.5km</div>
                              <div className="text-sm font-black text-white mt-1">
                                {toDisplayTemp(item.modelsComparison.icon.tMin)} / {toDisplayTemp(item.modelsComparison.icon.tMax)}
                              </div>
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                {item.modelsComparison.icon.precip} mm • {item.modelsComparison.icon.wind} km/h
                              </div>
                            </div>

                            {/* UKMO */}
                            <div className="p-2.5 rounded-lg bg-slate-950/80 border border-amber-500/30 col-span-2 sm:col-span-1">
                              <div className="text-[10px] font-bold text-amber-300 uppercase">UK Met Office</div>
                              <div className="text-[9px] text-slate-400">Unified 10km</div>
                              <div className="text-sm font-black text-white mt-1">
                                {toDisplayTemp(item.modelsComparison.ukmo.tMin)} / {toDisplayTemp(item.modelsComparison.ukmo.tMax)}
                              </div>
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                {item.modelsComparison.ukmo.precip} mm • {item.modelsComparison.ukmo.wind} km/h
                              </div>
                            </div>
                          </div>

                          {/* Diagnostic Concret au Quotidien & Risque de Neige */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
                            <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1">
                                <span>🎯</span>
                                <span>Ce que ça donnera concrètement :</span>
                              </span>
                              <p className="text-slate-300 text-[11px] leading-relaxed">
                                {item.tMaxConsensus >= 22
                                  ? "Ambiance très douce et agréable. Tenue légère de mi-saison, conditions très favorables pour vos sorties et activités."
                                  : item.tMaxConsensus <= 5
                                  ? "Atmosphère froide et piquante. Manteau d'hiver, gants et écharpe recommandés. Prudence sur les routes matinales."
                                  : "Temps de saison tempéré. Veste standard pour le matin et après-midi confortable sans excès."}
                              </p>
                            </div>

                            <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-300 flex items-center gap-1">
                                <Snowflake className="h-3 w-3 text-sky-400" />
                                <span>Analyse Neige &amp; Hiver :</span>
                              </span>
                              <p className="text-slate-300 text-[11px] leading-relaxed">
                                {item.tMaxConsensus <= 2.5 && item.locality.altitude < 400 && (item.modelsComparison.arome.precip > 0 || item.modelsComparison.ecmwf.precip > 0)
                                  ? "❄️ Flocons ou pluie-neige mêlée possibles en plaine lors des averses les plus denses."
                                  : item.locality.altitude >= 600 && item.tMaxConsensus <= 6
                                  ? `🏔️ Risque de neige dès ${Math.max(400, Math.round(item.locality.altitude + (item.tMaxConsensus - 1) * 160))} m sur les hauteurs environnantes.`
                                  : "☀️ Rien de spécial / Aucun risque de neige en plaine (température largement positive)."}
                              </p>
                            </div>
                          </div>

                          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                            <span>🛡️ <strong>Traitement robuste :</strong> {item.eliminatedExtremesNotice}</span>
                            {onSelectStation && (
                              <button
                                type="button"
                                onClick={() => onSelectStation(item.locality)}
                                className="text-sky-400 hover:underline font-bold cursor-pointer"
                              >
                                Définir comme station active
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
