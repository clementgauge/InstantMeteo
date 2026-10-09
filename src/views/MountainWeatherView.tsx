import React, { useState, useMemo, useEffect } from 'react';
import {
  Mountain,
  Snowflake,
  Wind,
  ThermometerSnowflake,
  Compass,
  AlertTriangle,
  ShieldAlert,
  Sun,
  Layers,
  Activity,
  Radio,
  Sliders,
  Search,
  Globe,
  MapPin,
  Clock,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { CurrentWeather, LocationPoint } from '../types/weather';
import {
  MOUNTAIN_MASSIFS,
  MountainMassif,
  AspectDirection,
  calculateAltitudePhysics,
  calculateMultiAspectAnalysis,
  calculateElevationStages,
  buildDynamicMountainProfileFromLocation,
  searchAndBuildWorldMountainStation
} from '../services/mountainWeatherService';

interface MountainWeatherViewProps {
  station: LocationPoint;
  weather: CurrentWeather;
  isLightMode?: boolean;
}

export const MountainWeatherView: React.FC<MountainWeatherViewProps> = ({
  station,
  weather,
  isLightMode = false
}) => {
  // Génère automatiquement le profil montagne de la localité active de l'utilisateur
  const activeStationProfile = useMemo(
    () => buildDynamicMountainProfileFromLocation(station, weather),
    [station, weather]
  );

  const [customSearchedMassifs, setCustomSearchedMassifs] = useState<MountainMassif[]>([]);
  const [selectedMassifId, setSelectedMassifId] = useState<string>(MOUNTAIN_MASSIFS[0].id);
  const [regionFilter, setRegionFilter] = useState<'ALL' | 'FRANCE' | 'WORLD' | 'LOCAL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [selectedAspect, setSelectedAspect] = useState<AspectDirection>('N');

  // Liste combinée : Localité active + Stations recherchées + Massifs France & Monde
  const allMassifs = useMemo(() => {
    return [activeStationProfile, ...customSearchedMassifs, ...MOUNTAIN_MASSIFS];
  }, [activeStationProfile, customSearchedMassifs]);

  // Si la localité active est en montagne (>= 500m), on la sélectionne automatiquement au changement de ville
  useEffect(() => {
    if ((station.altitude || 0) >= 500 || station.isMountain) {
      setSelectedMassifId(activeStationProfile.id);
    }
  }, [station.id, station.altitude, station.isMountain, activeStationProfile.id]);

  const selectedMassif: MountainMassif = useMemo(() => {
    return allMassifs.find((m) => m.id === selectedMassifId) || activeStationProfile || MOUNTAIN_MASSIFS[0];
  }, [allMassifs, selectedMassifId, activeStationProfile]);

  const [customAltitude, setCustomAltitude] = useState<number>(2200);

  // Ajuste l'altitude du simulateur quand on change de massif
  useEffect(() => {
    const defaultTarget = Math.min(
      selectedMassif.altitudePeak,
      Math.max(selectedMassif.altitudeBase, Math.round((selectedMassif.altitudeBase + selectedMassif.altitudePeak) * 0.62))
    );
    setCustomAltitude(defaultTarget);
    if (selectedMassif.criticalSlopes.length > 0) {
      setSelectedAspect(selectedMassif.criticalSlopes[0]);
    }
  }, [selectedMassif.id]);

  const physics = useMemo(() => {
    return calculateAltitudePhysics(weather, station.altitude || 200, customAltitude);
  }, [weather, station.altitude, customAltitude]);

  // Analyse complète et vérifiée des 8 versants (N, NE, E, SE, S, SW, W, NW) à l'altitude choisie
  const versantsAnalysis = useMemo(() => {
    return calculateMultiAspectAnalysis(selectedMassif, customAltitude, weather);
  }, [selectedMassif, customAltitude, weather]);

  const activeVersantDetail = useMemo(() => {
    return versantsAnalysis.find((v) => v.aspect === selectedAspect) || versantsAnalysis[0];
  }, [versantsAnalysis, selectedAspect]);

  // Profil étagé sur 4 niveaux d'altitude (Base, Forêt, Subalpin, Sommet)
  const elevationStages = useMemo(() => {
    return calculateElevationStages(selectedMassif, weather, station.altitude || 200);
  }, [selectedMassif, weather, station.altitude]);

  const handleSearchWorldMountain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim().length < 2) return;
    setIsSearching(true);
    try {
      const results = await searchAndBuildWorldMountainStation(searchQuery);
      if (results.length > 0) {
        setCustomSearchedMassifs((prev) => {
          const existingIds = new Set(results.map((r) => r.id));
          return [...results, ...prev.filter((p) => !existingIds.has(p.id))].slice(0, 10);
        });
        setSelectedMassifId(results[0].id);
      }
    } finally {
      setIsSearching(false);
    }
  };

  const filteredMassifs = useMemo(() => {
    return allMassifs.filter((m) => {
      if (regionFilter === 'LOCAL') return m.isLiveCustomStation;
      if (regionFilter === 'FRANCE') return m.country.includes('France') && !m.isLiveCustomStation;
      if (regionFilter === 'WORLD') return !m.country.includes('France') && !m.isLiveCustomStation;
      return true;
    });
  }, [allMassifs, regionFilter]);

  const getBeraBadgeColor = (level: number) => {
    switch (level) {
      case 1:
        return { bg: 'bg-lime-500/20 border-lime-500/40 text-lime-400', dot: 'bg-lime-400', name: '1/5 — Faible' };
      case 2:
        return { bg: 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400', dot: 'bg-yellow-400', name: '2/5 — Limité' };
      case 3:
        return { bg: 'bg-amber-500/20 border-amber-500/40 text-amber-400', dot: 'bg-amber-500', name: '3/5 — Marqué' };
      case 4:
        return { bg: 'bg-red-500/20 border-red-500/40 text-red-400', dot: 'bg-red-500', name: '4/5 — Fort' };
      case 5:
        return { bg: 'bg-purple-600/25 border-purple-500/50 text-purple-300', dot: 'bg-purple-500', name: '5/5 — Très Fort' };
      default:
        return { bg: 'bg-slate-800 border-slate-700 text-slate-300', dot: 'bg-slate-400', name: 'Inconnu' };
    }
  };

  const beraStyle = getBeraBadgeColor(selectedMassif.beraRiskLevel);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className={`p-5 sm:p-6 rounded-2xl border shadow-lg relative overflow-hidden ${
        isLightMode
          ? 'bg-gradient-to-br from-sky-50 via-white to-indigo-50 border-sky-200 text-slate-900'
          : 'bg-gradient-to-br from-[#0B1528] via-[#0F1E3A] to-[#16274B] border-sky-500/30 text-white'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-400">
              <Mountain className="w-4 h-4" />
              <span>Observatoire Mondial de Nivologie, Reliefs & Analyse Multi-Versants (N, NE, E, SE, S, SW, W, NW)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Météo Haute Montagne, Stations Mondiales & Étude par Versant
            </h2>
            <p className={`text-xs sm:text-sm max-w-3xl leading-relaxed ${isLightMode ? 'text-slate-600' : 'text-slate-300'}`}>
              Analyse nivologique et thermodynamique vérifiée dans <strong>toutes les stations et localités de France et du Monde</strong> : bilan radiatif par versant (Ubac/Adret), transport éolien (plaques à vent sous le vent vs érosion au vent), étagement hypsométrique et hypoxie.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto shrink-0">
            <div className="px-3.5 py-2 rounded-xl bg-sky-500/15 border border-sky-500/30 text-center">
              <div className="text-[10px] uppercase tracking-wider text-sky-300 font-bold">Isotherme 0°C</div>
              <div className="text-base sm:text-lg font-black text-white">{selectedMassif.isoZeroAltitudeM} m</div>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-center">
              <div className="text-[10px] uppercase tracking-wider text-indigo-300 font-bold">Limite Pluie-Neige</div>
              <div className="text-base sm:text-lg font-black text-white">{selectedMassif.rainSnowLimitM} m</div>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-center">
              <div className="text-[10px] uppercase tracking-wider text-emerald-300 font-bold">Vent Crête ({selectedMassif.ridgeWindDirectionDeg}°)</div>
              <div className="text-base sm:text-lg font-black text-white">{selectedMassif.ridgeWindGustKmh} km/h</div>
            </div>
          </div>
        </div>

        {/* Barre de Recherche Mondiale de Station de Montagne / Sommet / Localité */}
        <div className="mt-5 pt-4 border-t border-slate-700/40 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <form onSubmit={handleSearchWorldMountain} className="flex-1 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-sky-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher n'importe quelle station, sommet ou ville du monde (ex: Val d'Isère, Zermatt, Banff, Niseko, Bariloche, Annecy...)"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700/80 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-sky-400"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs sm:text-sm transition shrink-0 cursor-pointer"
            >
              {isSearching ? 'Calcul...' : 'Analyser ce Relief'}
            </button>
          </form>

          {/* Filtres Géographiques */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {[
              { id: 'ALL', label: '🌍 Tous (France & Monde)' },
              { id: 'LOCAL', label: `📍 Ma Localité (${station.name})` },
              { id: 'FRANCE', label: '🇫🇷 Massifs Français (10)' },
              { id: 'WORLD', label: '🏔️ Grands Massifs Mondiaux (8)' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setRegionFilter(tab.id as any);
                  if (tab.id === 'LOCAL') setSelectedMassifId(activeStationProfile.id);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  regionFilter === tab.id
                    ? 'bg-sky-500 text-slate-950 shadow-sm'
                    : 'bg-slate-900/70 text-slate-300 hover:bg-slate-800 border border-slate-700/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sélecteur de Massifs & Localités */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Compass className="w-4 h-4 text-sky-400" />
            <span>Sélectionner votre Station, Massif ou Localité ({filteredMassifs.length} disponibles)</span>
          </h3>
          <span className="text-[11px] text-slate-400">
            Cliquez sur une localité pour recalculer les 8 versants
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-2.5">
          {filteredMassifs.map((m) => {
            const isSelected = m.id === selectedMassif.id;
            const badge = getBeraBadgeColor(m.beraRiskLevel);
            return (
              <button
                key={m.id}
                onClick={() => setSelectedMassifId(m.id)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-sky-600/20 border-sky-400 ring-1 ring-sky-400/50 shadow-md'
                    : 'bg-[#0F172A]/90 border-slate-800/90 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 truncate">
                      {m.isLiveCustomStation ? '📍 Localité Directe' : m.country} • {m.range}
                    </span>
                    <span className={`w-2 h-2 rounded-full shrink-0 ${badge.dot}`} title={m.beraRiskLabel} />
                  </div>
                  <div className="text-xs font-black text-white mt-1 line-clamp-1">
                    {m.name}
                  </div>
                </div>
                <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                  <span>{m.altitudeBase}m → {m.altitudePeak}m</span>
                  <span className="font-bold text-sky-300">❄️ {m.snowDepthTopCm} cm</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION MAJEURE : ANALYSE ARCHI-VÉRIFIÉE DES 8 VERSANTS (N, NE, E, SE, S, SW, W, NW) */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#0F172A] border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-400">
              <Sparkles className="w-4 h-4" />
              <span>Modélisation Topographique & Nivologique par Orientation de Pente — Altitude d'analyse : {customAltitude} m</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white mt-0.5">
              Diagnostic Approfondi selon les 8 Versants — {selectedMassif.name}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Chaque versant réagit différemment au vent en crête ({selectedMassif.ridgeWindDirectionDeg}° à {selectedMassif.ridgeWindGustKmh} km/h) et à la course du soleil ({selectedMassif.latitude >= 0 ? 'Hémisphère Nord : Ubac au Nord, Adret au Sud' : 'Hémisphère Sud : Ubac au Sud, Adret au Nord'}).
            </p>
          </div>

          <div className={`px-4 py-2 rounded-xl border font-black text-xs sm:text-sm flex items-center gap-2 self-start lg:self-auto ${beraStyle.bg}`}>
            <span className={`w-2.5 h-2.5 rounded-full ${beraStyle.dot} animate-pulse`} />
            <span>Indice Avalanche Global : {beraStyle.name}</span>
          </div>
        </div>

        {/* Grille Interactive des 8 Versants */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {versantsAnalysis.map((v) => {
            const isSelected = v.aspect === selectedAspect;
            const vBadge = getBeraBadgeColor(v.localBeraLevel);
            return (
              <button
                key={v.aspect}
                onClick={() => setSelectedAspect(v.aspect)}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-sky-500/20 border-sky-400 ring-2 ring-sky-400/40 shadow-lg'
                    : v.isCritical
                      ? 'bg-amber-500/10 border-amber-500/40 hover:bg-amber-500/20'
                      : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold">
                    <span>Versant</span>
                    <span className={`w-2 h-2 rounded-full ${vBadge.dot}`} />
                  </div>
                  <div className="text-lg font-black text-white mt-0.5">{v.aspect}</div>
                  <div className="text-[10px] text-sky-300 font-semibold truncate mt-0.5">
                    {v.thermalRegime.split(' (')[0]}
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-800/80 space-y-1 text-[10px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Neige:</span>
                    <span className="font-bold text-white">{v.estimatedSnowDepthCm} cm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Plaque:</span>
                    <span className={`font-bold ${v.windSlabRiskPercent >= 60 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {v.windSlabRiskPercent}%
                    </span>
                  </div>
                  <div className={`mt-1 px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                    v.isCritical ? 'bg-amber-500/25 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {v.isCritical ? 'Vigilance' : 'Stable'}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Panneau Détaillé du Versant Sélectionné */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-sky-500/30 grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-7 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-lg bg-sky-500 text-slate-950 font-black text-sm">
                  Versant {activeVersantDetail.aspectLabel}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-bold text-sky-300">
                  {activeVersantDetail.thermalRegime}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-bold text-indigo-300">
                  {activeVersantDetail.windExposure}
                </span>
              </div>
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Créneau conseillé : {activeVersantDetail.optimalTimeWindow}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
              <div className="text-xs font-bold text-slate-300">
                Structure du Manteau Neigeux : <span className="text-sky-400">{activeVersantDetail.snowpackStructure}</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {activeVersantDetail.tacticalAdvice}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-[10px] uppercase text-slate-400">Insolation Pente 30°</div>
                <div className="text-sm font-black text-amber-400 mt-0.5">{activeVersantDetail.solarIrradianceWm2} W/m²</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-[10px] uppercase text-slate-400">Temp. Surface Neige</div>
                <div className="text-sm font-black text-sky-400 mt-0.5">{activeVersantDetail.surfaceSnowTempC} °C</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-[10px] uppercase text-slate-400">Épaisseur Versant</div>
                <div className="text-sm font-black text-white mt-0.5">{activeVersantDetail.estimatedSnowDepthCm} cm</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-[10px] uppercase text-slate-400">Pente Critique</div>
                <div className="text-sm font-black text-rose-400 mt-0.5">&gt; {activeVersantDetail.criticalSlopeAngleDeg}°</div>
              </div>
            </div>
          </div>

          {/* Jauge des 3 Mécanismes d'Instabilité sur ce Versant */}
          <div className="lg:col-span-5 flex flex-col justify-between p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Mécanismes Nivologiques sur le Versant {activeVersantDetail.aspect}
            </div>

            <div className="space-y-2.5">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">1. Plaques à vent (Accumulation éolienne)</span>
                  <span className="font-black text-amber-400">{activeVersantDetail.windSlabRiskPercent}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-sky-500 via-amber-500 to-red-500 rounded-full"
                    style={{ width: `${activeVersantDetail.windSlabRiskPercent}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">2. Neige humide / Fonte diurne (Radiatif)</span>
                  <span className="font-black text-orange-400">{activeVersantDetail.wetSnowAvalancheRiskPercent}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 via-yellow-500 to-orange-500 rounded-full"
                    style={{ width: `${activeVersantDetail.wetSnowAvalancheRiskPercent}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">3. Couches fragiles persistantes (Faces planes)</span>
                  <span className="font-black text-indigo-400">{activeVersantDetail.persistentWeakLayerRiskPercent}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                    style={{ width: `${activeVersantDetail.persistentWeakLayerRiskPercent}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>Indice BERA spécifique versant {activeVersantDetail.aspect} :</span>
              <span className="font-black text-white">Niveau {activeVersantDetail.localBeraLevel} / 5</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left = BERA & Étagement Hypsométrique (7 cols), Right = Simulateur d'Altitude (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: BERA + Coupe Multi-Étages */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-5 sm:p-6 rounded-2xl bg-[#0F172A] border border-slate-800 shadow-lg space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-sky-400">
                  {selectedMassif.range} • {selectedMassif.department}
                </div>
                <h3 className="text-xl font-black text-white mt-0.5">
                  {selectedMassif.name} ({selectedMassif.altitudeBase}m – {selectedMassif.altitudePeak}m)
                </h3>
              </div>
              <div className={`px-3.5 py-1.5 rounded-full border text-xs font-black uppercase tracking-wider flex items-center gap-2 ${beraStyle.bg}`}>
                <ShieldAlert className="w-4 h-4" />
                <span>{selectedMassif.beraRiskLabel}</span>
              </div>
            </div>

            {/* BERA Official Text Summary */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Synthèse Nivologique & Stabilité du Manteau Neigeux</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {selectedMassif.beraSummary}
              </p>
            </div>

            {/* Coupe Hypsométrique sur 4 Étages d'Altitude */}
            <div className="space-y-2.5">
              <div className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center justify-between">
                <span>Coupe Atmosphérique & Hypsométrique (4 Étages d'Altitude)</span>
                <span className="text-[11px] text-slate-400">Calcul barométrique & adiabatique réel</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {elevationStages.map((st, idx) => (
                  <div
                    key={idx}
                    onClick={() => setCustomAltitude(st.altitudeM)}
                    className="p-3.5 rounded-xl bg-slate-900/70 hover:bg-slate-900 border border-slate-800 hover:border-sky-500/40 transition cursor-pointer space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-white">{st.stageName}</span>
                      <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono text-xs font-bold">
                        {st.altitudeM} m
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Temp / Ressenti</span>
                        <span className="font-bold text-white">{st.tempC}°C <span className="text-indigo-300">({st.windChillC}°C)</span></span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Vent / Raf.</span>
                        <span className="font-bold text-white">{st.windSpeedKmh}/{st.windGustKmh} km/h</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">O₂ / Pression</span>
                        <span className="font-bold text-emerald-400">{st.oxygenPercentSeaLevel}% ({st.qfePressureHpa}hPa)</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[10px] text-slate-400">
                      <span>Cumul neige estimé : <strong className="text-sky-300">{st.snowDepthCm} cm</strong></span>
                      <span className="text-slate-300 font-semibold">{st.precipPhase}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Snow Depths & Quality */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                <div className="text-[10px] uppercase tracking-wider text-slate-400">Neige Sommet</div>
                <div className="text-lg font-black text-sky-400 mt-1">{selectedMassif.snowDepthTopCm} cm</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Vers {selectedMassif.altitudePeak} m</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                <div className="text-[10px] uppercase tracking-wider text-slate-400">Neige Base</div>
                <div className="text-lg font-black text-sky-400 mt-1">{selectedMassif.snowDepthBottomCm} cm</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Vers {selectedMassif.altitudeBase} m</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                <div className="text-[10px] uppercase tracking-wider text-slate-400">Neige Fraîche 24h</div>
                <div className="text-lg font-black text-emerald-400 mt-1">+{selectedMassif.freshSnow24hCm} cm</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Chutes récentes</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                <div className="text-[10px] uppercase tracking-wider text-slate-400">Vent en Crête</div>
                <div className="text-lg font-black text-indigo-300 mt-1">{selectedMassif.ridgeWindGustKmh} km/h</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Dir. {selectedMassif.ridgeWindDirectionDeg}°</div>
              </div>
            </div>

            {/* Quality badge & Nivôse station info */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-2 border-t border-slate-800 text-slate-400">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Qualité de surface dominante :</span>
                <span className="font-bold text-white px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700">
                  {selectedMassif.snowQuality}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400">
                <Radio className="w-3.5 h-3.5 text-emerald-400" />
                <span>Référence : <strong className="text-slate-200">{selectedMassif.nivoseStationName}</strong> ({selectedMassif.nivoseElevationM} m)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Atmospheric Profiler by Altitude (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-5 sm:p-6 rounded-2xl bg-[#0F172A] border border-slate-800 shadow-lg space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider">
                <Sliders className="w-4 h-4" />
                <span>Simulateur d'Altitude & Hypoxie Réel</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-sky-500/20 text-sky-400 border border-sky-500/30">
                {customAltitude} m
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Déplacez le curseur d'altitude pour mettre à jour simultanément les 8 versants ci-dessus, la température sous abri, le refroidissement éolien (Wind Chill) et l'oxygène disponible.
            </p>

            {/* Altitude Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono text-slate-400">
                <span>{Math.min(300, selectedMassif.altitudeBase)} m (Vallée)</span>
                <span className="font-bold text-sky-400">{customAltitude} m</span>
                <span>{selectedMassif.altitudePeak} m (Sommet)</span>
              </div>
              <input
                type="range"
                min={Math.min(300, selectedMassif.altitudeBase)}
                max={selectedMassif.altitudePeak}
                step="50"
                value={customAltitude}
                onChange={(e) => setCustomAltitude(Number(e.target.value))}
                className="w-full accent-sky-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Computed Altitude Cards */}
            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ThermometerSnowflake className="w-5 h-5 text-sky-400" />
                  <div>
                    <div className="text-xs font-bold text-slate-300">Température sous abri</div>
                    <div className="text-[10px] text-slate-500">Gradient standard -0.65°C/100m</div>
                  </div>
                </div>
                <div className={`text-lg font-black ${physics.tempAtAltitude <= 0 ? 'text-sky-400' : 'text-white'}`}>
                  {physics.tempAtAltitude > 0 ? `+${physics.tempAtAltitude}` : physics.tempAtAltitude} °C
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Wind className="w-5 h-5 text-indigo-400" />
                  <div>
                    <div className="text-xs font-bold text-slate-300">Ressenti au vent (Wind Chill)</div>
                    <div className="text-[10px] text-slate-500">Refroidissement éolien réel</div>
                  </div>
                </div>
                <div className="text-lg font-black text-indigo-300">
                  {physics.windChill} °C
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Activity className="w-5 h-5 text-blue-400" />
                  <div>
                    <div className="text-xs font-bold text-slate-300">Vent moyen & Rafales</div>
                    <div className="text-[10px] text-slate-500">Amplification orographique</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-white">{physics.windSpeedAtAltitude} km/h</span>
                  <span className="text-xs text-slate-400 ml-1.5">(raf. {physics.windGustAtAltitude})</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Sun className="w-5 h-5 text-amber-400" />
                  <div>
                    <div className="text-xs font-bold text-slate-300">Indice UV en Altitude</div>
                    <div className="text-[10px] text-slate-500">+12%/1000m + réverbération neige</div>
                  </div>
                </div>
                <div className="text-lg font-black text-amber-300">
                  UV {physics.uvAtAltitude}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Layers className="w-5 h-5 text-emerald-400" />
                  <div>
                    <div className="text-xs font-bold text-slate-300">Pression QFE & Oxygène Disponible</div>
                    <div className="text-[10px] text-slate-500">Hypoxie barométrique réelle</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-base font-black text-emerald-400">{physics.oxygenPercentSeaLevel}% O₂</div>
                  <div className="text-[10px] text-slate-400">{physics.qfePressure} hPa</div>
                </div>
              </div>
            </div>

            {/* Presence of Snow at this elevation */}
            <div className={`p-3 rounded-xl border flex items-center gap-3 ${
              customAltitude >= physics.lpn
                ? 'bg-sky-950/30 border-sky-800/50 text-sky-300'
                : 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
            }`}>
              <Snowflake className="w-5 h-5 shrink-0" />
              <div className="text-xs leading-relaxed">
                {customAltitude >= physics.lpn ? (
                  <span>
                    À <strong>{customAltitude} m</strong>, vous êtes au-dessus de la limite pluie-neige ({physics.lpn} m). Précipitations solides (neige ou grésil).
                  </span>
                ) : (
                  <span>
                    À <strong>{customAltitude} m</strong>, vous êtes en dessous de la limite pluie-neige ({physics.lpn} m). Précipitations liquides en cas d'averse.
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
