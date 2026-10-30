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
  Filter, 
  RotateCw,
  Compass,
  Sliders,
  Scale,
  Sparkles,
  Info
} from 'lucide-react';
import { 
  getNationalPrefecturesSynthesis, 
  NationalPrefecturesSynthesis, 
  RegionalBulletinAnalysis, 
  PrefectureForecastSummary 
} from '../services/prefecturesBulletinService';
import { ZONE_RELIABILITY_WEIGHTS } from '../utils/robustModelConsensus';

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
          Calcul et agrégation multi-modèles des préfectures et sous-préfectures françaises en cours...
        </p>
        <p className="text-xs text-slate-400">
          Application des coefficients zonaux et neutralisation des 5% de scénarios extrêmes de chaque centre météo
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
                  Consensus Élagué à 90% (Sans 5% Extrêmes)
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  13 Régions • 96 Préfectures &amp; Sous-Préfectures
                </span>
              </div>
              <h2 className={`font-black text-white mt-1 ${seniorMode ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'}`}>
                Bulletin Régional &amp; Analyse des Préfectures
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
                Chaque chef-lieu et sous-préfecture fait l'objet d'un calcul robuste combinant 
                <strong> AROME (1.3 km), ECMWF IFS (9 km), NOAA GFS, DWD ICON et UK Met Office</strong>. 
                Les 5% de scénarios extrêmes de chaque côté sont systématiquement neutralisés pour garantir une concordance maximale.
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

      {/* 2. Barre de Sélection des 13 Régions Métropolitaines */}
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
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Diagnostic Synoptique & Fiche Régionale Sélectionnée */}
      {selectedRegion && (
        <div className="px-5 sm:px-6 space-y-4">
          <div className="rounded-xl border border-slate-700/80 bg-slate-900/90 p-4 sm:p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <div className="text-[10px] font-black uppercase tracking-wider text-sky-400">
                  Chef-lieu régional : {selectedRegion.region.chefLieuRegional}
                </div>
                <h3 className="text-lg font-black text-white">
                  Région {selectedRegion.region.name} ({selectedRegion.region.departmentsCount} départements)
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-800 border border-slate-700 text-slate-200">
                  Fourchette thermique : {toDisplayTemp(selectedRegion.regionalTempRange.min)} à {toDisplayTemp(selectedRegion.regionalTempRange.max)}
                </span>
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                  Concordance : {selectedRegion.averageConcordancePct}%
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300">
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 block mb-1">
                  Masse d'Air &amp; Climatologie Régionale
                </span>
                <p className="leading-relaxed">{selectedRegion.airMassCharacteristics}</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block mb-1">
                  Comportement des Modèles &amp; Accord d'Ensemble
                </span>
                <p className="leading-relaxed">{selectedRegion.expertMeteorologistNote}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-400">
              <span>💨 {selectedRegion.regionalWindSummary}</span>
              <span>•</span>
              <span>🌧️ {selectedRegion.regionalPrecipConsensus}</span>
            </div>
          </div>

          {/* 4. Barre de Filtre & Recherche Locale */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
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

          {/* 5. Liste Détaillée des Préfectures et Sous-Préfectures */}
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

                      <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                        <span>🛡️ <strong>Traitement robuste :</strong> {item.eliminatedExtremesNotice}</span>
                        {onSelectStation && (
                          <button
                            type="button"
                            onClick={() => onSelectStation(item.locality)}
                            className="text-sky-400 hover:underline font-bold"
                          >
                            Sélectionner cette station
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
  );
};
