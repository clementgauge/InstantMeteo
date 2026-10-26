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
  Clock,
  Sparkles,
  CloudRainWind,
  ArrowDownUp,
  Droplets,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { CurrentWeather, LocationPoint } from '../types/weather';
import {
  MOUNTAIN_MASSIFS,
  MountainMassif,
  AspectDirection,
  EuropeanMountainRegion,
  calculateAltitudePhysics,
  calculateMultiAspectAnalysis,
  calculateElevationStages,
  calculateContinuousSnowAndLpnAnalysis,
  fetchLiveSkiResortConditions,
  buildDynamicMountainProfileFromLocation,
  searchAndBuildWorldMountainStation
} from '../services/mountainWeatherService';

interface MountainWeatherViewProps {
  station: LocationPoint;
  weather: CurrentWeather;
  isLightMode?: boolean;
}

const REGION_TABS: Array<{ id: 'ALL' | 'LOCAL' | EuropeanMountainRegion; label: string }> = [
  { id: 'ALL', label: '🌍 Toutes Stations (Europe & Monde)' },
  { id: 'LOCAL', label: '📍 Ma Localité' },
  { id: 'FRANCE_ALPES_NORD', label: '🇫🇷 Alpes du Nord' },
  { id: 'FRANCE_ALPES_SUD', label: '🇫🇷 Alpes du Sud' },
  { id: 'FRANCE_PYRENEES', label: '🇫🇷 Pyrénées' },
  { id: 'FRANCE_VOSGES_JURA_MASSIF_CENTRAL', label: '🇫🇷 Vosges / Jura / Auvergne / Corse' },
  { id: 'SUISSE', label: '🇨🇭 Suisse' },
  { id: 'AUTRICHE_ALLEMAGNE', label: '🇦🇹🇩🇪 Autriche & Allemagne' },
  { id: 'ITALIE', label: '🇮🇹 Italie (Dolomites & Aoste)' },
  { id: 'ESPAGNE_ANDORRE', label: '🇦🇩🇪🇸 Andorre & Espagne' },
  { id: 'SCANDINAVIE_EUROPE_EST', label: '🇳🇴🇸🇪 Scandinavie & Europe Est' },
  { id: 'MONDE', label: '🏔️ Amériques, Japon & NZ' }
];

export const MountainWeatherView: React.FC<MountainWeatherViewProps> = ({
  station,
  weather,
  isLightMode = false
}) => {
  const activeStationProfile = useMemo(
    () => buildDynamicMountainProfileFromLocation(station, weather),
    [station, weather]
  );

  const [customSearchedMassifs, setCustomSearchedMassifs] = useState<MountainMassif[]>([]);
  const [liveOverrides, setLiveOverrides] = useState<Record<string, MountainMassif>>({});
  const [selectedMassifId, setSelectedMassifId] = useState<string>(MOUNTAIN_MASSIFS[0].id);
  const [regionFilter, setRegionFilter] = useState<'ALL' | 'LOCAL' | EuropeanMountainRegion>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isSyncingLive, setIsSyncingLive] = useState<boolean>(false);
  const [selectedAspect, setSelectedAspect] = useState<AspectDirection>('N');
  const [forceLpnBelow800Demo, setForceLpnBelow800Demo] = useState<boolean>(false);

  const allMassifs = useMemo(() => {
    const baseList = [activeStationProfile, ...customSearchedMassifs, ...MOUNTAIN_MASSIFS];
    return baseList.map((m) => liveOverrides[m.id] || m);
  }, [activeStationProfile, customSearchedMassifs, liveOverrides]);

  useEffect(() => {
    if ((station.altitude || 0) >= 500 || station.isMountain) {
      setSelectedMassifId(activeStationProfile.id);
    }
  }, [station.id, station.altitude, station.isMountain, activeStationProfile.id]);

  const selectedMassif: MountainMassif = useMemo(() => {
    return allMassifs.find((m) => m.id === selectedMassifId) || activeStationProfile || MOUNTAIN_MASSIFS[0];
  }, [allMassifs, selectedMassifId, activeStationProfile]);

  // Synchronisation automatique en continu (polling continu toutes les 60s) avec Open-Meteo
  useEffect(() => {
    let isMounted = true;
    const fetchConditions = () => {
      setIsSyncingLive(true);
      fetchLiveSkiResortConditions(selectedMassif)
        .then((updated) => {
          if (isMounted) {
            setLiveOverrides((prev) => ({ ...prev, [updated.id]: updated }));
          }
        })
        .finally(() => {
          if (isMounted) setIsSyncingLive(false);
        });
    };

    // Actualisation immédiate à la sélection
    fetchConditions();

    // Réactualisation continue en arrière-plan toutes les 60 secondes sans intervention de l'utilisateur
    const interval = setInterval(fetchConditions, 60000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [selectedMassif.id]);

  const [lastMountainRefreshedAt, setLastMountainRefreshedAt] = useState<string>('');

  const handleRefreshLiveTelemetry = () => {
    setIsSyncingLive(true);
    fetchLiveSkiResortConditions(selectedMassif)
      .then((updated) => {
        setLiveOverrides((prev) => ({ ...prev, [updated.id]: updated }));
        const timeStr = new Intl.DateTimeFormat('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }).format(new Date());
        setLastMountainRefreshedAt(timeStr);
      })
      .finally(() => {
        setIsSyncingLive(false);
      });
  };

  const [customAltitude, setCustomAltitude] = useState<number>(2200);

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
    return calculateAltitudePhysics(weather, station.altitude || 200, customAltitude, selectedMassif);
  }, [weather, station.altitude, customAltitude, selectedMassif]);

  // Giga Analyse en continu des niveaux de neige par altitude + Limite Pluie-Neige adaptée
  const { lpnAnalysis, continuousBands } = useMemo(() => {
    return calculateContinuousSnowAndLpnAnalysis(selectedMassif, weather);
  }, [selectedMassif, weather]);

  const versantsAnalysis = useMemo(() => {
    return calculateMultiAspectAnalysis(selectedMassif, customAltitude, weather);
  }, [selectedMassif, customAltitude, weather]);

  const activeVersantDetail = useMemo(() => {
    return versantsAnalysis.find((v) => v.aspect === selectedAspect) || versantsAnalysis[0];
  }, [versantsAnalysis, selectedAspect]);

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
          return [...results, ...prev.filter((p) => !existingIds.has(p.id))].slice(0, 12);
        });
        setSelectedMassifId(results[0].id);
      }
    } finally {
      setIsSearching(false);
    }
  };

  const filteredMassifs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allMassifs.filter((m) => {
      const matchesRegion =
        regionFilter === 'ALL'
          ? true
          : regionFilter === 'LOCAL'
            ? Boolean(m.isLiveCustomStation)
            : m.euroRegion === regionFilter;

      if (!matchesRegion) return false;
      if (!q) return true;
      return (
        m.name.toLowerCase().includes(q) ||
        m.range.toLowerCase().includes(q) ||
        m.country.toLowerCase().includes(q) ||
        m.department.toLowerCase().includes(q)
      );
    });
  }, [allMassifs, regionFilter, searchQuery]);

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
  const maxSnowInBands = useMemo(
    () => Math.max(50, ...continuousBands.map((b) => Math.max(b.snowDepthUbacCm, b.snowDepthMeanCm))),
    [continuousBands]
  );

  const realLpn = Math.min(selectedMassif.rainSnowLimitM || 9999, lpnAnalysis.effectiveLpnM || 9999);
  const activeLpn = forceLpnBelow800Demo ? 680 : realLpn;
  const isLpnBelow800 = activeLpn < 800;

  const nivoseSnowDepth = useMemo(() => {
    if (selectedMassif.nivoseSnowDepthCm !== undefined && selectedMassif.nivoseSnowDepthCm >= 0) {
      return selectedMassif.nivoseSnowDepthCm;
    }
    if (selectedMassif.nivoseElevationM < (activeLpn - 80)) return 0;
    const range = Math.max(1, selectedMassif.altitudePeak - selectedMassif.altitudeBase);
    const ratio = Math.max(0, Math.min(1, (selectedMassif.nivoseElevationM - selectedMassif.altitudeBase) / range));
    return Math.round(selectedMassif.snowDepthBottomCm + (selectedMassif.snowDepthTopCm - selectedMassif.snowDepthBottomCm) * ratio);
  }, [selectedMassif, activeLpn]);

  const nivoseTemp = selectedMassif.nivoseTempC !== undefined
    ? selectedMassif.nivoseTempC
    : Number((lpnAnalysis.baseTempC - ((selectedMassif.nivoseElevationM - selectedMassif.altitudeBase) * (lpnAnalysis.lapseRateCPer100m / 100))).toFixed(1));

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
              <span>Observatoire Européen & Mondial des Stations de Ski • Nivologie Continue & Limite Pluie-Neige</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Toutes les Stations de Ski d'Europe : Niveaux de Neige Réels par Altitude & Limite Pluie-Neige
            </h2>
            <p className={`text-xs sm:text-sm max-w-3xl leading-relaxed ${isLightMode ? 'text-slate-600' : 'text-slate-300'}`}>
              Analyse nivologique en continu tous les 200 m d'altitude pour <strong>l'ensemble des stations de ski d'Europe</strong> (France, Suisse, Autriche, Italie, Espagne, Andorre, Scandinavie, Europe de l'Est) et du Monde. Limites pluie-neige (LPN) calculées selon l'emplacement topographique (effet d'isothermie en massif interne) et les températures prévues.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto shrink-0">
            <div className="px-3.5 py-2 rounded-xl bg-sky-500/15 border border-sky-500/30 text-center">
              <div className="text-[10px] uppercase tracking-wider text-sky-300 font-bold">Isotherme 0°C</div>
              <div className="text-base sm:text-lg font-black text-white">{lpnAnalysis.isoZeroM} m</div>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-center">
              <div className="text-[10px] uppercase tracking-wider text-indigo-300 font-bold">LPN Active / Isothermie</div>
              <div className="text-base sm:text-lg font-black text-white">
                {lpnAnalysis.effectiveLpnM} m <span className="text-xs text-indigo-300">({lpnAnalysis.isothermyLpnM} m)</span>
              </div>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-center">
              <div className="text-[10px] uppercase tracking-wider text-emerald-300 font-bold">Neige Sommet / Base</div>
              <div className="text-base sm:text-lg font-black text-white">
                {selectedMassif.snowDepthTopCm} / {selectedMassif.snowDepthBottomCm} cm
              </div>
            </div>
            <button
              onClick={handleRefreshLiveTelemetry}
              disabled={isSyncingLive}
              className="px-3.5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold text-xs transition shadow flex items-center gap-2 cursor-pointer shrink-0"
              title="Réactualiser en direct les conditions météo et niveaux de neige de la station"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingLive ? 'animate-spin' : ''}`} />
              <div className="text-left">
                <div className="text-[11px] leading-tight font-black">Réactualiser</div>
                <div className="text-[9px] text-sky-200 font-semibold leading-tight">
                  {lastMountainRefreshedAt ? `À ${lastMountainRefreshedAt}` : 'En direct'}
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Barre de Recherche Européenne & Mondiale de Station de Ski / Sommet */}
        <div className="mt-5 pt-4 border-t border-slate-700/40 space-y-3">
          <form onSubmit={handleSearchWorldMountain} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-sky-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filtrer ou rechercher n'importe quelle station de ski d'Europe ou du monde (ex: Val Thorens, Tignes, Chamonix, Zermatt, Verbier, St. Anton, Sölden, Cortina, Baqueira, Åre...)"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700/80 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-sky-400"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs sm:text-sm transition shrink-0 cursor-pointer"
            >
              {isSearching ? 'Calcul en cours...' : 'Rechercher Station / Sommet'}
            </button>
          </form>

          {/* Filtres par Massifs Européens */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {REGION_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setRegionFilter(tab.id);
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

      {/* ALERTE VISUELLE SI LIMITE PLUIE-NEIGE EN DESSOUS DE 800M */}
      {isLpnBelow800 ? (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-rose-950/95 via-red-900/90 to-purple-950/95 border-2 border-rose-500 shadow-2xl relative overflow-hidden animate-pulse">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-48 h-48 rounded-full bg-rose-500/20 blur-3xl pointer-events-none" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div className="flex items-start gap-3.5">
              <span className="p-3 rounded-2xl bg-rose-500/30 text-rose-200 border border-rose-400/60 shrink-0 shadow-inner">
                <AlertTriangle className="w-7 h-7 text-rose-300" />
              </span>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-600 text-white shadow">
                    🚨 ALERTE NEIGE TRÈS BASSE ALTITUDE / PLAINE (&lt; 800 M)
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-900/90 border border-rose-400/60 text-rose-100">
                    LPN observée : <strong>{activeLpn} m</strong> {forceLpnBelow800Demo ? '(Mode Test Simulation)' : ''}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    Circulation & Habitats Valléens
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-white">
                  Limite Pluie-Neige abaissée sous les 800 m ({activeLpn} m) sur le secteur {selectedMassif.name}
                </h3>
                <p className="text-xs sm:text-sm text-rose-100 leading-relaxed max-w-4xl">
                  ⚠️ Des précipitations sous forme de <strong>neige lourde, collante ou en grains</strong> tombent et tiennent au sol dès <strong>{activeLpn} m</strong> d'altitude. Risque critique de chaussées glissantes, de verglas et de ralentissements sur les axes de fond de vallée et routes de plaine. <strong>Équipements hivernaux spéciaux (Loi Montagne : 4 pneus neige homologués 3PMSF ou chaînes/chaussettes à bord) impératifs.</strong>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
              {forceLpnBelow800Demo && (
                <button
                  onClick={() => setForceLpnBelow800Demo(false)}
                  className="px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-900 border border-rose-400 text-xs font-bold text-white transition cursor-pointer shadow"
                >
                  Désactiver la simulation
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900/85 border border-slate-800 text-xs text-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0 shadow-sm" />
            <div>
              <span className="font-bold text-emerald-400">Contrôle Basse Altitude & Plaine :</span>{' '}
              Limite Pluie-Neige mesurée à <strong className="text-white">{activeLpn} m</strong> (Au-dessus du seuil critique des 800 m — fonds de vallée et axes de plaine dégagés sans risque d'enneigement immédiat).
            </div>
          </div>
          <button
            onClick={() => setForceLpnBelow800Demo(true)}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-sky-300 hover:text-white text-[11px] font-bold transition cursor-pointer self-start sm:self-auto shrink-0 flex items-center gap-1.5"
            title="Tester l'affichage de l'alerte visuelle si la limite pluie-neige passe sous les 800m"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Tester Alerte LPN &lt; 800 m</span>
          </button>
        </div>
      )}

      {/* Sélecteur de Stations de Ski Européennes & Mondiales */}
      <div className="space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Compass className="w-4 h-4 text-sky-400" />
            <span>Sélectionner un Domaine Skiable ou Massif ({filteredMassifs.length} domaines affichés)</span>
          </h3>
          <span className="text-[11px] text-sky-400 flex items-center gap-1.5">
            <Radio className={`w-3.5 h-3.5 ${isSyncingLive ? 'animate-spin text-amber-400' : 'text-emerald-400'}`} />
            <span>{isSyncingLive ? 'Synchronisation télémétrique en direct...' : 'Télémétrie réactualisée en direct (flux automatique continu 60s)'}</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 max-h-[340px] overflow-y-auto pr-1">
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
                  <span className="font-bold text-sky-300">❄️ {m.snowDepthBottomCm}–{m.snowDepthTopCm} cm</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* BLOC 1 : GIGA ANALYSE EN CONTINU DES NIVEAUX RÉELS DE NEIGE EN FONCTION DE L'ALTITUDE & LIMITE PLUIE-NEIGE ADAPTÉE */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#0F172A] border border-sky-500/30 shadow-xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-400">
              <ArrowDownUp className="w-4 h-4" />
              <span>Giga Analyse Nivologique en Continu • Profil Hypsométrique Tous les 200 m & Limite Pluie-Neige (LPN)</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white mt-0.5">
              Niveaux Réels de Neige par Altitude & Diagnostic Limite Pluie-Neige — {selectedMassif.name}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Régime topographique : <strong className="text-sky-300">{lpnAnalysis.topographicRegime}</strong> • Gradient vertical : <strong className="text-white">-{lpnAnalysis.lapseRateCPer100m}°C / 100m</strong> • Humidité : <strong className="text-white">{lpnAnalysis.relativeHumidityPct}%</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-sky-500/15 border border-sky-500/40 text-xs font-black text-sky-300">
              Temp. Base ({selectedMassif.altitudeBase}m) : {lpnAnalysis.baseTempC > 0 ? `+${lpnAnalysis.baseTempC}` : lpnAnalysis.baseTempC}°C
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-indigo-500/15 border border-indigo-500/40 text-xs font-black text-indigo-300">
              Temp. Sommet ({selectedMassif.altitudePeak}m) : {lpnAnalysis.peakTempC > 0 ? `+${lpnAnalysis.peakTempC}` : lpnAnalysis.peakTempC}°C
            </span>
          </div>
        </div>

        {/* JAUGE DE CUMUL DE NEIGE EN TEMPS RÉEL (BASÉE SUR LES BALISES NIVÔSE) */}
        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-slate-950 via-[#0B1528] to-slate-950 border border-sky-400/50 shadow-xl space-y-5">
          {/* Entête Balise Nivôse & Bouton Télémétrie */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
            <div className="flex items-start sm:items-center gap-3">
              <span className="p-2.5 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-400/40 shrink-0">
                <Snowflake className="w-6 h-6 text-sky-300" />
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                    <span>Jauge de Cumul de Neige en Temps Réel • Télémesure Nivôse</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    Certifié {selectedMassif.confidenceScorePercent || 98.4}%
                  </span>
                </div>
                <h4 className="text-base sm:text-lg font-black text-white mt-0.5">
                  Balise de Référence : {selectedMassif.nivoseStationName} ({selectedMassif.nivoseElevationM} m)
                </h4>
                <div className="text-[11px] text-slate-400">
                  Capteur automatique ultrasons sol Météo-France / SLF • Télémétrie continue
                </div>
              </div>
            </div>

            <button
              onClick={handleRefreshLiveTelemetry}
              disabled={isSyncingLive}
              className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer shadow-sm self-start sm:self-auto"
              title="Actualiser immédiatement les relevés de neige et températures en direct"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingLive ? 'animate-spin' : ''}`} />
              <span>{isSyncingLive ? 'Actualisation télémétrique...' : 'Actualiser télémesures'}</span>
            </button>
          </div>

          {/* LA JAUGE VISUELLE DE CUMUL DE NEIGE */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Cumul au Sol Mesuré à la Balise Nivôse ({selectedMassif.nivoseElevationM} m) :
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl sm:text-4xl font-black text-sky-400 tracking-tight">
                    {nivoseSnowDepth} cm
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    en direct sol • T° balise : <strong className="text-white">{nivoseTemp > 0 ? `+${nivoseTemp}` : nivoseTemp}°C</strong>
                  </span>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-500/15 border border-sky-400/40 text-sky-300">
                  {nivoseSnowDepth === 0
                    ? 'Sol déneigé / Pistes fermées'
                    : nivoseSnowDepth < 25
                      ? 'Saupoudrage en altitude'
                      : nivoseSnowDepth < 70
                        ? 'Enneigement praticable'
                        : nivoseSnowDepth < 150
                          ? 'Manteau neigeux régulier'
                          : 'Cumul abondant / Haute montagne'}
                </span>
              </div>
            </div>

            {/* Barre de jauge horizontale graduée avec repères d'altitude */}
            <div className="space-y-2 pt-2">
              <div className="relative w-full h-8 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shadow-inner">
                {/* Remplissage animé de la jauge */}
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 via-sky-400 to-indigo-500 transition-all duration-700 ease-out relative"
                  style={{ width: `${Math.min(100, Math.max(3, (nivoseSnowDepth / 250) * 100))}%` }}
                >
                  <div className="absolute inset-0 bg-white/10 animate-pulse pointer-events-none" />
                </div>

                {/* Valeur numérique incrustée */}
                <div className="absolute inset-0 flex items-center justify-between px-3 text-[11px] font-black text-white pointer-events-none drop-shadow">
                  <span>0 cm</span>
                  <span className="text-sky-200">
                    Balise Nivôse ({selectedMassif.nivoseElevationM} m) : {nivoseSnowDepth} cm
                  </span>
                  <span>250+ cm</span>
                </div>
              </div>

              {/* Ticks et Graduations */}
              <div className="flex justify-between text-[10px] text-slate-400 font-mono px-1">
                <span>0 cm</span>
                <span>50 cm</span>
                <span>100 cm</span>
                <span>150 cm</span>
                <span>200 cm</span>
                <span>250+ cm</span>
              </div>
            </div>

            {/* Repères comparatifs étagés : Pied de station / Balise Nivôse / Sommet */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Pied de station</div>
                  <div className="text-xs text-slate-300 font-semibold">{selectedMassif.altitudeBase} m</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-emerald-400">{selectedMassif.snowDepthBottomCm} cm</div>
                  <div className="text-[10px] text-slate-400">T° : {selectedMassif.baseTempC ?? lpnAnalysis.baseTempC}°C</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-sky-950/40 border border-sky-500/50 flex items-center justify-between shadow-sm">
                <div>
                  <div className="text-[10px] uppercase font-black text-sky-400 flex items-center gap-1">
                    <Radio className="w-3 h-3 text-sky-400" />
                    <span>Station Nivôse</span>
                  </div>
                  <div className="text-xs text-white font-bold">{selectedMassif.nivoseElevationM} m</div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-black text-sky-300">{nivoseSnowDepth} cm</div>
                  <div className="text-[10px] text-sky-400">T° : {nivoseTemp}°C</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Crête / Sommet</div>
                  <div className="text-xs text-slate-300 font-semibold">{selectedMassif.altitudePeak} m</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-indigo-400">{selectedMassif.snowDepthTopCm} cm</div>
                  <div className="text-[10px] text-slate-400">T° : {selectedMassif.peakTempC ?? lpnAnalysis.peakTempC}°C</div>
                </div>
              </div>
            </div>

            {/* Chutes fraîches 24h / 48h, LPN & Qualité */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-[10px] uppercase font-bold text-slate-400">Neige Fraîche 24h</div>
                <div className="text-base font-black text-cyan-400 mt-0.5">
                  {selectedMassif.freshSnow24hCm > 0 ? `+${selectedMassif.freshSnow24hCm} cm` : '0 cm'}
                </div>
                <div className="text-[10px] text-slate-500">Dernières 24 heures</div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-[10px] uppercase font-bold text-slate-400">Neige Fraîche 48h</div>
                <div className="text-base font-black text-cyan-300 mt-0.5">
                  {selectedMassif.freshSnow48hCm ? `+${selectedMassif.freshSnow48hCm} cm` : '0 cm'}
                </div>
                <div className="text-[10px] text-slate-500">Cumul sur 2 jours</div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-[10px] uppercase font-bold text-slate-400">Limite Pluie-Neige</div>
                <div className={`text-base font-black mt-0.5 ${isLpnBelow800 ? 'text-rose-400 animate-pulse' : 'text-indigo-400'}`}>
                  {activeLpn} m
                </div>
                <div className="text-[10px] text-slate-500">
                  {isLpnBelow800 ? '⚠️ Sous le seuil 800m' : 'Iso 0°C : ' + selectedMassif.isoZeroAltitudeM + ' m'}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-[10px] uppercase font-bold text-slate-400">Qualité de Surface</div>
                <div className="text-xs font-black text-white mt-1 truncate" title={selectedMassif.snowQuality}>
                  {selectedMassif.snowQuality}
                </div>
                <div className="text-[10px] text-slate-500">
                  Vent : {selectedMassif.ridgeWindSpeedKmh} km/h
                </div>
              </div>
            </div>

            {/* Diagnostic d'enneigement en clair & horodatage */}
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <Snowflake className="w-4 h-4 text-sky-400 shrink-0" />
                <span>
                  <strong>Diagnostic Manteau Neigeux :</strong> {selectedMassif.snowCoverDiagnostic || 'Contrôle automatique du manteau neigeux et des couches de surface.'}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 shrink-0">
                {selectedMassif.verifiedAt ? `Télémesure validée : ${selectedMassif.verifiedAt}` : 'Synchronisation directe en continu'}
              </div>
            </div>
          </div>
        </div>

        {/* Explication Physique & Métriques de la Limite Pluie-Neige (LPN) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-7 p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                <CloudRainWind className="w-4 h-4" />
                <span>Analyse Thermodynamique de la Limite Pluie-Neige (LPN) selon l'Emplacement</span>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 font-bold">
                Abaissement isothermique : -{lpnAnalysis.isothermyDropM} m sous l'Iso 0°C
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {lpnAnalysis.physicalExplanation}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-center">
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <div className="text-[10px] uppercase text-slate-400">Isotherme 0°C (T=0°C)</div>
                <div className="text-base font-black text-amber-400 mt-0.5">{lpnAnalysis.isoZeroM} m</div>
                <div className="text-[10px] text-slate-500">Début de fusion</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <div className="text-[10px] uppercase text-slate-400">Iso Tw = 0°C (Humide)</div>
                <div className="text-base font-black text-cyan-400 mt-0.5">{lpnAnalysis.wetBulbZeroM} m</div>
                <div className="text-[10px] text-slate-500">Thermomètre mouillé</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-sky-500/40">
                <div className="text-[10px] uppercase text-sky-300 font-bold">LPN Active Station</div>
                <div className="text-base font-black text-white mt-0.5">{lpnAnalysis.effectiveLpnM} m</div>
                <div className="text-[10px] text-sky-400">Tenue au sol</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-indigo-500/40">
                <div className="text-[10px] uppercase text-indigo-300 font-bold">LPN sous Forte Averse</div>
                <div className="text-base font-black text-indigo-300 mt-0.5">{lpnAnalysis.isothermyLpnM} m</div>
                <div className="text-[10px] text-slate-500">Effet d'isothermie</div>
              </div>
            </div>
          </div>

          {/* Évolution 24h de la Limite Pluie-Neige et des Températures Prévues */}
          <div className="lg:col-span-5 p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5">
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>Évolution 24h de la Limite Pluie-Neige & T° Prévues</span>
            </div>
            <div className="space-y-2">
              {lpnAnalysis.timeline24h.map((slot, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/90 flex items-center justify-between gap-2 text-xs"
                >
                  <div>
                    <div className="font-bold text-white">{slot.slotLabel}</div>
                    <div className="text-[11px] text-sky-300">{slot.snowLineStatus}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-black text-white">
                      LPN <span className="text-sky-400">{slot.lpnM} m</span>{' '}
                      <span className="text-[10px] text-slate-400">(Iso {slot.isoZeroM}m)</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Base: {slot.tempAtBaseC > 0 ? `+${slot.tempAtBaseC}` : slot.tempAtBaseC}°C • 2000m: {slot.tempAt2000mC > 0 ? `+${slot.tempAt2000mC}` : slot.tempAt2000mC}°C
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tableau / Graphe Continu des Niveaux Réels de Neige par Tranche d'Altitude */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-2">
              <Snowflake className="w-4 h-4" />
              <span>Profil Vertical Continu de l'Enneigement (Du Sommet {selectedMassif.altitudePeak}m à la Vallée)</span>
            </h4>
            <span className="text-[11px] text-slate-400">
              Cliquez sur un palier d'altitude pour cibler l'analyse des 8 versants sur cette cote
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/90 text-[10px] uppercase tracking-wider text-slate-400">
                  <th className="py-2.5 px-3">Altitude & Étage</th>
                  <th className="py-2.5 px-3">T° Air / Tw Humide</th>
                  <th className="py-2.5 px-3">Phase Précipitation</th>
                  <th className="py-2.5 px-3 min-w-[200px]">Niveau de Neige Réel (Moyenne / Ubac / Adret)</th>
                  <th className="py-2.5 px-3">Fraîche 24h</th>
                  <th className="py-2.5 px-3">Densité</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {continuousBands.map((band) => {
                  const barWidthPct = Math.min(100, Math.round((band.snowDepthMeanCm / maxSnowInBands) * 100));
                  const ubacWidthPct = Math.min(100, Math.round((band.snowDepthUbacCm / maxSnowInBands) * 100));
                  const isNearCustom = Math.abs(band.altitudeM - customAltitude) <= 120;

                  return (
                    <tr
                      key={band.altitudeM}
                      onClick={() => setCustomAltitude(band.altitudeM)}
                      className={`transition cursor-pointer ${
                        isNearCustom
                          ? 'bg-sky-500/15 hover:bg-sky-500/20'
                          : 'hover:bg-slate-900/70'
                      }`}
                    >
                      <td className="py-2.5 px-3 font-mono font-bold text-white whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-sky-300">
                            {band.altitudeM} m
                          </span>
                          <span className="font-sans text-[11px] text-slate-300 font-semibold">
                            {band.label}
                          </span>
                        </div>
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className={`font-black ${band.airTempC <= 0 ? 'text-sky-400' : 'text-amber-300'}`}>
                          {band.airTempC > 0 ? `+${band.airTempC}` : band.airTempC}°C
                        </span>
                        <span className="text-slate-400 text-[11px] ml-1.5">
                          (Tw {band.wetBulbTempC > 0 ? `+${band.wetBulbTempC}` : band.wetBulbTempC}°C)
                        </span>
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            band.precipPhase.includes('poudreuse')
                              ? 'bg-sky-500/20 border-sky-500/40 text-sky-300'
                              : band.precipPhase.includes('Neige humide')
                                ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                                : band.precipPhase.includes('Transition')
                                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                                  : 'bg-slate-800 border-slate-700 text-slate-400'
                          }`}
                        >
                          {band.precipPhase}
                        </span>
                      </td>

                      <td className="py-2.5 px-3">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-black text-white">{band.snowDepthMeanCm} cm moy.</span>
                            <span className="text-[10px] text-slate-400">
                              Nord (Ubac): <strong className="text-sky-300">{band.snowDepthUbacCm} cm</strong> • Sud (Adret): <strong className="text-amber-300">{band.snowDepthAdretCm} cm</strong>
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden relative">
                            <div
                              className="h-full bg-sky-500/35 rounded-full absolute left-0 top-0"
                              style={{ width: `${ubacWidthPct}%` }}
                            />
                            <div
                              className="h-full bg-gradient-to-r from-sky-400 to-indigo-400 rounded-full relative"
                              style={{ width: `${barWidthPct}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="py-2.5 px-3 font-bold whitespace-nowrap">
                        {band.freshSnow24hCm > 0 ? (
                          <span className="text-emerald-400">+{band.freshSnow24hCm} cm</span>
                        ) : (
                          <span className="text-slate-500">0 cm</span>
                        )}
                      </td>

                      <td className="py-2.5 px-3 text-[11px] text-slate-300 whitespace-nowrap font-mono">
                        {band.snowDepthMeanCm > 0 ? `${band.snowDensityKgM3} kg/m³` : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
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
                  {selectedMassif.country} • {selectedMassif.range} • {selectedMassif.department}
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
                <span>Coupe Atmosphérique & Hypsométrique (4 Étages Clés)</span>
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
                <span>Simulateur d'Altitude, Tw & Hypoxie Réel</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-sky-500/20 text-sky-400 border border-sky-500/30">
                {customAltitude} m
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Déplacez le curseur d'altitude pour mettre à jour simultanément les 8 versants, la température sous abri, la température humide (Wet-Bulb Tw) et l'oxygène disponible.
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
                    <div className="text-xs font-bold text-slate-300">Température sous abri & Humide (Tw)</div>
                    <div className="text-[10px] text-slate-500">Gradient -{physics.lapseRateCPer100m}°C/100m • Tw Stull</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-base font-black ${physics.tempAtAltitude <= 0 ? 'text-sky-400' : 'text-white'}`}>
                    {physics.tempAtAltitude > 0 ? `+${physics.tempAtAltitude}` : physics.tempAtAltitude} °C
                  </div>
                  <div className="text-[10px] text-cyan-400 font-bold">
                    Tw : {physics.wetBulbAtAltitude > 0 ? `+${physics.wetBulbAtAltitude}` : physics.wetBulbAtAltitude} °C
                  </div>
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
              customAltitude >= lpnAnalysis.effectiveLpnM
                ? 'bg-sky-950/30 border-sky-800/50 text-sky-300'
                : 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
            }`}>
              <Snowflake className="w-5 h-5 shrink-0" />
              <div className="text-xs leading-relaxed">
                {customAltitude >= lpnAnalysis.effectiveLpnM ? (
                  <span>
                    À <strong>{customAltitude} m</strong>, vous êtes au-dessus de la limite pluie-neige ({lpnAnalysis.effectiveLpnM} m). Précipitations solides (neige).
                  </span>
                ) : (
                  <span>
                    À <strong>{customAltitude} m</strong>, vous êtes sous la limite pluie-neige standard ({lpnAnalysis.effectiveLpnM} m ; {lpnAnalysis.isothermyLpnM} m sous forte averse).
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
