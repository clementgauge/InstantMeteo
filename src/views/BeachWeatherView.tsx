import React, { useState, useMemo, useEffect } from 'react';
import {
  Waves,
  Sun,
  Wind,
  Compass,
  Anchor,
  ShieldAlert,
  AlertTriangle,
  Thermometer,
  Droplets,
  CheckCircle2,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  MapPin,
  Sparkles,
  Activity
} from 'lucide-react';
import { CurrentWeather, LocationPoint } from '../types/weather';
import {
  BEACH_SPOTS,
  BeachSpot,
  calculateAstronomicalShomTides,
  fetchLiveMarineSpotForCoordinates,
  searchAndBuildCoastalSpots,
  findNearestCoastalSpot
} from '../services/beachWeatherService';

interface BeachWeatherViewProps {
  station: LocationPoint;
  weather: CurrentWeather;
  isLightMode?: boolean;
}

export const BeachWeatherView: React.FC<BeachWeatherViewProps> = ({
  station,
  weather,
  isLightMode = false
}) => {
  const [liveLocalSpot, setLiveLocalSpot] = useState<BeachSpot | null>(null);
  const [customSearchedSpots, setCustomSearchedSpots] = useState<BeachSpot[]>([]);
  const [selectedSpotId, setSelectedSpotId] = useState<string>(BEACH_SPOTS[2].id);
  const [coastFilter, setCoastFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);

  const nearestCoastalRef = useMemo(() => findNearestCoastalSpot(station), [station]);

  // Charge en temps réel le profil marin de la localité active (ou de sa façade côtière immédiate)
  useEffect(() => {
    let isMounted = true;
    const isNearCoast = nearestCoastalRef.distanceKm <= 95;
    const targetLat = isNearCoast ? station.latitude : nearestCoastalRef.spot.latitude;
    const targetLon = isNearCoast ? station.longitude : nearestCoastalRef.spot.longitude;
    const labelName = isNearCoast
      ? `${station.name} (Littoral Direct)`
      : `${station.name} → Façade ${nearestCoastalRef.spot.name.split(',')[0]}`;

    fetchLiveMarineSpotForCoordinates(
      labelName,
      `${station.department || station.region || 'Littoral'}`,
      targetLat,
      targetLon,
      weather.temperature,
      weather.windSpeed,
      weather.windDirection,
      weather.uvIndex
    ).then((spot) => {
      if (isMounted) {
        setLiveLocalSpot(spot);
        if (isNearCoast) {
          setSelectedSpotId(spot.id);
        }
      }
    });

    return () => {
      isMounted = false;
    };
  }, [station.id, station.latitude, station.longitude, weather.temperature, weather.windSpeed]);

  const allSpots = useMemo(() => {
    const list: BeachSpot[] = [];
    if (liveLocalSpot) list.push(liveLocalSpot);
    return [...list, ...customSearchedSpots, ...BEACH_SPOTS];
  }, [liveLocalSpot, customSearchedSpots]);

  const selectedBeach: BeachSpot = useMemo(() => {
    return allSpots.find((b) => b.id === selectedSpotId) || liveLocalSpot || BEACH_SPOTS[0];
  }, [allSpots, selectedSpotId, liveLocalSpot]);

  const liveTides = useMemo(() => {
    return calculateAstronomicalShomTides(selectedBeach, new Date());
  }, [selectedBeach]);

  const filteredBeaches = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allSpots.filter((b) => {
      const matchesCoast =
        coastFilter === 'ALL'
          ? true
          : coastFilter === 'LOCAL'
            ? Boolean(b.isLiveCustomSpot)
            : b.coastline === coastFilter;
      if (!matchesCoast) return false;
      if (!q) return true;
      return (
        b.name.toLowerCase().includes(q) ||
        b.department.toLowerCase().includes(q) ||
        b.coastline.toLowerCase().includes(q) ||
        (b.country || '').toLowerCase().includes(q)
      );
    });
  }, [allSpots, coastFilter, searchQuery]);

  const handleSearchCoastalLocality = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim().length < 2) return;
    setIsSearching(true);
    try {
      const results = await searchAndBuildCoastalSpots(searchQuery);
      if (results.length > 0) {
        setCustomSearchedSpots((prev) => {
          const ids = new Set(results.map((r) => r.id));
          return [...results, ...prev.filter((p) => !ids.has(p.id))].slice(0, 10);
        });
        setSelectedSpotId(results[0].id);
      }
    } finally {
      setIsSearching(false);
    }
  };

  // Calcul des scores par discipline nautique (sur 10)
  const nauticalDisciplines = useMemo(() => {
    const w = selectedBeach.waveHeightM;
    const p = selectedBeach.wavePeriodSec;
    const kts = selectedBeach.windSpeedKnots;
    const sst = selectedBeach.waterTempC;

    const swimScore = Math.max(1, Math.min(10, Math.round(selectedBeach.bathingComfortScore)));
    const surfScore = Math.max(2, Math.min(10, Math.round((w >= 0.8 && w <= 3.0 ? 7.5 : 4.5) + (p >= 10 ? 2.2 : 0.5))));
    const kiteSailScore = Math.max(2, Math.min(10, Math.round(kts >= 12 && kts <= 28 ? 9.2 : kts >= 8 ? 7.0 : 4.0)));
    const paddleDiveScore = Math.max(1, Math.min(10, Math.round(w <= 0.7 && kts <= 12 ? 9.4 : w <= 1.2 ? 6.8 : 3.5)));

    return [
      {
        name: 'Baignade & Plage',
        score: swimScore,
        status: swimScore >= 8 ? 'Conditions Idéales' : swimScore >= 6 ? 'Agréable' : 'Fraîche / Agitée',
        detail: `Eau ${sst}°C • Air ${selectedBeach.airTempC}°C`
      },
      {
        name: 'Surf & Bodyboard',
        score: surfScore,
        status: surfScore >= 8 ? 'Session Excellente' : surfScore >= 6 ? 'Vagues Surfables' : 'Plan d\'eau plat / Clapot',
        detail: `Houle ${w}m • Période ${p}s`
      },
      {
        name: 'Voile, Kite & Windsurf',
        score: kiteSailScore,
        status: kiteSailScore >= 8 ? 'Thermique Optimal' : kiteSailScore >= 6 ? 'Navigation Plaisante' : 'Pétole / Vent fort',
        detail: `Vent ${kts} nœuds (${selectedBeach.windDirectionCompass})`
      },
      {
        name: 'Paddle, Kayak & Plongée',
        score: paddleDiveScore,
        status: paddleDiveScore >= 8 ? 'Mer d\'Huile / Clair' : paddleDiveScore >= 6 ? 'Praticable' : 'Plan d\'eau formé',
        detail: `Courant ${selectedBeach.oceanCurrentKnots ?? 1.1} nds`
      }
    ];
  }, [selectedBeach]);

  const getFlagStyle = (flag: BeachSpot['swimFlag']) => {
    switch (flag) {
      case 'VERT':
        return {
          bg: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400',
          dot: 'bg-emerald-400',
          label: 'Drapeau Vert — Baignade surveillée, absence de danger particulier'
        };
      case 'JAUNE':
        return {
          bg: 'bg-amber-500/20 border-amber-500/40 text-amber-400',
          dot: 'bg-amber-400',
          label: 'Drapeau Jaune — Baignade dangereuse mais surveillée (Houle / Courants)'
        };
      case 'ROUGE':
        return {
          bg: 'bg-red-500/20 border-red-500/40 text-red-400',
          dot: 'bg-red-500',
          label: 'Drapeau Rouge — Interdiction de se baigner (Danger majeur)'
        };
    }
  };

  const flagStyle = getFlagStyle(selectedBeach.swimFlag);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className={`p-5 sm:p-6 rounded-2xl border shadow-lg relative overflow-hidden ${
        isLightMode
          ? 'bg-gradient-to-br from-cyan-50 via-white to-blue-50 border-cyan-200 text-slate-900'
          : 'bg-gradient-to-br from-[#071929] via-[#0B253C] to-[#0E3150] border-cyan-500/30 text-white'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
              <Waves className="w-4 h-4" />
              <span>Observatoire Balnéaire & Marin Universel • France, Europe & Monde</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Stations Balnéaires (France, Europe & Monde), Marées SHOM, Houle & Température de l'Eau
            </h2>
            <p className={`text-xs sm:text-sm max-w-3xl leading-relaxed ${isLightMode ? 'text-slate-600' : 'text-slate-300'}`}>
              L'ensemble des stations balnéaires de <strong>France</strong> (Manche, Bretagne, Atlantique, Méditerranée, Corse, Outre-Mer), d'<strong>Europe</strong> (Espagne, Baléares, Canaries, Portugal, Italie, Sardaigne, Grèce, Croatie, Mer du Nord) et du <strong>Monde</strong> sont recherchables en direct avec houle, température de l'eau (SST) et marées SHOM.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto shrink-0">
            <div className="px-3.5 py-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-center">
              <div className="text-[10px] uppercase tracking-wider text-cyan-300 font-bold">Temp. Eau (SST)</div>
              <div className="text-base sm:text-lg font-black text-white">{selectedBeach.waterTempC} °C</div>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-blue-500/15 border border-blue-500/30 text-center">
              <div className="text-[10px] uppercase tracking-wider text-blue-300 font-bold">Houle / Période</div>
              <div className="text-base sm:text-lg font-black text-white">{selectedBeach.waveHeightM} m ({selectedBeach.wavePeriodSec}s)</div>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-center">
              <div className="text-[10px] uppercase tracking-wider text-emerald-300 font-bold">Coeff. Marée</div>
              <div className="text-base sm:text-lg font-black text-white">
                {liveTides.isMicroTide ? 'Micro-marée' : liveTides.tideCoefficient}
              </div>
            </div>
          </div>
        </div>

        {/* Barre de Recherche de Commune Littorale / Port / Plage / Île */}
        <div className="mt-5 pt-4 border-t border-slate-700/40 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <form onSubmit={handleSearchCoastalLocality} className="flex-1 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher n'importe quelle station balnéaire de France, d'Europe ou du Monde (ex: Deauville, Biarritz, Cassis, Calvi, Majorque, Marbella, Algarve, Nazaré, Capri, Mykonos, Miami, Bali...)"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700/80 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs sm:text-sm transition shrink-0 cursor-pointer"
            >
              {isSearching ? 'Chargement...' : 'Analyser ce Littoral'}
            </button>
          </form>

          {/* Filtres Façades Maritimes */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'ALL', label: '🌊 Toutes Stations (France, Europe & Monde)' },
              { id: 'LOCAL', label: `📍 Mon Littoral (${station.name})` },
              { id: 'Manche & Mer du Nord', label: '🇫🇷 Manche & Nord' },
              { id: 'Bretagne & Celtique', label: '🇫🇷 Bretagne' },
              { id: 'Océan Atlantique', label: '🇫🇷 Atlantique' },
              { id: 'Mer Méditerranée & Corse', label: '🇫🇷 Méditerranée & Corse' },
              { id: 'Europe — Espagne & Portugal', label: '🇪🇸🇵🇹 Espagne & Portugal' },
              { id: 'Europe — Italie, Grèce & Adriatique', label: '🇮🇹🇬🇷🇭🇷 Italie, Grèce & Croatie' },
              { id: 'Europe — Nord, UK & Baltique', label: '🇧🇪🇬🇧 Europe du Nord & UK' },
              { id: 'Outre-Mer & Monde', label: '🌴 Outre-Mer & Monde' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setCoastFilter(tab.id);
                  if (tab.id === 'LOCAL' && liveLocalSpot) setSelectedSpotId(liveLocalSpot.id);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  coastFilter === tab.id
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'bg-slate-900/70 text-slate-300 hover:bg-slate-800 border border-slate-700/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Beach Spot Selector Grid */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Compass className="w-4 h-4 text-cyan-400" />
            <span>Sélectionner votre Station Balnéaire, Port ou Commune Côtière ({filteredBeaches.length})</span>
          </h3>
          <span className="text-[11px] text-cyan-400">
            Données couplées Modèle Vagues MFWAM / Open-Meteo Marine & SHOM
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {filteredBeaches.map((b) => {
            const isSelected = b.id === selectedBeach.id;
            const flag = getFlagStyle(b.swimFlag);
            return (
              <button
                key={b.id}
                onClick={() => setSelectedSpotId(b.id)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-cyan-600/20 border-cyan-400 ring-1 ring-cyan-400/50 shadow-md'
                    : 'bg-[#0F172A]/90 border-slate-800/90 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 truncate">
                      {b.isLiveCustomSpot ? '📍 Littoral Actif' : b.coastline}
                    </span>
                    <span className={`w-2 h-2 rounded-full shrink-0 ${flag.dot}`} title={`Drapeau ${b.swimFlag}`} />
                  </div>
                  <div className="text-xs font-black text-white mt-1 line-clamp-1">
                    {b.name}
                  </div>
                </div>
                <div className="mt-2.5 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                  <span>Eau : <strong className="text-cyan-300">{b.waterTempC}°C</strong></span>
                  <span className="font-bold text-blue-300">🌊 {b.waveHeightM} m</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* BARRE DES 4 DISCIPLINES NAUTIQUES & BALNÉAIRES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {nauticalDisciplines.map((disc, idx) => (
          <div
            key={idx}
            className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 shadow-md flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-white">{disc.name}</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                disc.score >= 8
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : disc.score >= 6
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                {disc.score}/10
              </span>
            </div>
            <div className="mt-2">
              <div className="text-xs font-bold text-cyan-400">{disc.status}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">{disc.detail}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Official Lifeguard Flag, Tides & Safety (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-5 sm:p-6 rounded-2xl bg-[#0F172A] border border-slate-800 shadow-lg space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                  {selectedBeach.coastline} • {selectedBeach.department}
                </div>
                <h3 className="text-xl font-black text-white mt-0.5">
                  {selectedBeach.name}
                </h3>
              </div>

              <div className={`px-3.5 py-1.5 rounded-full border text-xs font-black uppercase tracking-wider flex items-center gap-2 ${flagStyle.bg}`}>
                <span className={`w-2.5 h-2.5 rounded-full ${flagStyle.dot}`} />
                <span>Drapeau {selectedBeach.swimFlag}</span>
              </div>
            </div>

            {/* Swim Flag & Safety Explanation */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" />
                <span>{flagStyle.label}</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {selectedBeach.swimFlagReason}
              </p>
            </div>

            {/* Décomposition Spectrale : Houle Primaire vs Mer du Vent & Courants */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-center">
                <div className="text-[10px] uppercase tracking-wider text-slate-400">Houle Primaire</div>
                <div className="text-base font-black text-cyan-400 mt-1">
                  {selectedBeach.swellHeightM ?? Number((selectedBeach.waveHeightM * 0.8).toFixed(1))} m
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Train de houle au large</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-center">
                <div className="text-[10px] uppercase tracking-wider text-slate-400">Mer du Vent (Clapot)</div>
                <div className="text-base font-black text-blue-400 mt-1">
                  {selectedBeach.windWaveHeightM ?? Number((selectedBeach.waveHeightM * 0.45).toFixed(1))} m
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Vagues générées par le vent</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-center">
                <div className="text-[10px] uppercase tracking-wider text-slate-400">Courant Côtier</div>
                <div className="text-base font-black text-emerald-400 mt-1">
                  {selectedBeach.oceanCurrentKnots ?? 1.2} nds
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Dérive littorale</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-center">
                <div className="text-[10px] uppercase tracking-wider text-slate-400">Période de Houle</div>
                <div className="text-base font-black text-amber-400 mt-1">
                  {selectedBeach.wavePeriodSec} sec
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Énergie des trains d'onde</div>
              </div>
            </div>

            {/* Baïne Danger Alert Banner */}
            {selectedBeach.baineWarning && (
              <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-600/40 text-amber-200 text-xs space-y-1.5">
                <div className="flex items-center gap-2 font-black uppercase tracking-wider text-amber-400">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Alerte Courants d'Arrachement de Baïnes (Littoral Exposé)</span>
                </div>
                <p className="leading-relaxed text-slate-300">
                  Sur le littoral océanique, les baïnes créent de puissants courants aspirant vers le large, particulièrement entre la mi-marée et la marée basse. En cas d'entraînement, <strong>ne luttez jamais à contre-courant</strong> : laissez-vous porter et nagez parallèlement à la plage pour regagner le banc de sable.
                </p>
              </div>
            )}

            {/* Astronomical SHOM Tides Card */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400">
                  <Anchor className="w-4 h-4" />
                  <span>Annuaire des Marées SHOM (Calcul Astronomique Aujourd'hui)</span>
                </div>
                <span className="text-[11px] font-bold text-slate-400 px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                  Régime semi-diurne
                </span>
              </div>

              {liveTides.isMicroTide ? (
                <div className="p-3 rounded-lg bg-slate-950/50 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                  Bassin Méditerranéen : <strong>Micro-marée négligeable (&lt; 25 cm de marnage)</strong>. Les courants de marée sont quasi nuls. La hauteur d'eau dépend principalement des vents synoptiques et de la pression atmosphérique (surcote/décote).
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                    <div className="text-[10px] uppercase tracking-wider text-slate-400 flex items-center justify-center gap-1">
                      <ArrowUpRight className="w-3.5 h-3.5 text-blue-400" />
                      <span>Pleine Mer (PM)</span>
                    </div>
                    <div className="text-lg font-black text-blue-400 mt-1">{liveTides.tideHighTime}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Haute mer</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                    <div className="text-[10px] uppercase tracking-wider text-slate-400 flex items-center justify-center gap-1">
                      <ArrowDownRight className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Basse Mer (BM)</span>
                    </div>
                    <div className="text-lg font-black text-indigo-400 mt-1">{liveTides.tideLowTime}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Basse mer</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                    <div className="text-[10px] uppercase tracking-wider text-slate-400">Coeff. Marée</div>
                    <div className="text-lg font-black text-cyan-400 mt-1">{liveTides.tideCoefficient}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{liveTides.tideType}</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                    <div className="text-[10px] uppercase tracking-wider text-slate-400">État Actuel</div>
                    <div className="text-xs font-black text-emerald-400 mt-2 truncate">{liveTides.tideStatus.split(' (')[0]}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Marnage ~{liveTides.rangeMeters} m</div>
                  </div>
                </div>
              )}
            </div>

            {/* Water Quality & Pavillon Bleu */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-2 border-t border-slate-800 text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Qualité des Eaux de Baignade (ARS) :</span>
                <strong className="text-slate-200">{selectedBeach.waterQuality}</strong>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400">
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                <span>Régime : <strong className="text-slate-200">{selectedBeach.windThermalBreeze}</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Physical Marine Variables (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-5 sm:p-6 rounded-2xl bg-[#0F172A] border border-slate-800 shadow-lg space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
                <Waves className="w-4 h-4" />
                <span>Paramètres Océanographiques Directs</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                Confort {selectedBeach.bathingComfortScore}/10
              </span>
            </div>

            {/* Variables List */}
            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Thermometer className="w-5 h-5 text-cyan-400" />
                  <div>
                    <div className="text-xs font-bold text-slate-300">Température de l'Eau (SST)</div>
                    <div className="text-[10px] text-slate-500">Bouées côtières & Satellite Copernicus</div>
                  </div>
                </div>
                <div className="text-lg font-black text-cyan-400">
                  {selectedBeach.waterTempC} °C
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Sun className="w-5 h-5 text-amber-400" />
                  <div>
                    <div className="text-xs font-bold text-slate-300">Température de l'Air Littoral</div>
                    <div className="text-[10px] text-slate-500">Ambiance thermique sous abri côtier</div>
                  </div>
                </div>
                <div className="text-lg font-black text-amber-300">
                  {selectedBeach.airTempC} °C
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Waves className="w-5 h-5 text-blue-400" />
                  <div>
                    <div className="text-xs font-bold text-slate-300">Hauteur Totale & Période de Houle</div>
                    <div className="text-[10px] text-slate-500">Modèle vagues MFWAM / Open-Meteo Marine</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-white">{selectedBeach.waveHeightM} m</span>
                  <span className="text-xs text-slate-400 ml-1.5">(période {selectedBeach.wavePeriodSec}s)</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Wind className="w-5 h-5 text-indigo-400" />
                  <div>
                    <div className="text-xs font-bold text-slate-300">Vent Côtier & Orientation</div>
                    <div className="text-[10px] text-slate-500">Secteur {selectedBeach.windDirectionCompass}</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-white">{selectedBeach.windSpeedKnots} kts</span>
                  <span className="text-xs text-slate-400 ml-1.5">({Math.round(selectedBeach.windSpeedKnots * 1.852)} km/h)</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Layers className="w-5 h-5 text-slate-400" />
                  <div>
                    <div className="text-xs font-bold text-slate-300">État de la Mer (Échelle Douglas)</div>
                    <div className="text-[10px] text-slate-500">Agitation de surface</div>
                  </div>
                </div>
                <div className="text-xs font-black text-slate-200">
                  {selectedBeach.seaStateDouglas}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Sun className="w-5 h-5 text-amber-500" />
                  <div>
                    <div className="text-xs font-bold text-slate-300">Rayonnement UV Plage</div>
                    <div className="text-[10px] text-slate-500">Réverbération sable et écume (+15%)</div>
                  </div>
                </div>
                <div className="text-base font-black text-amber-400">
                  Indice UV {selectedBeach.beachUvIndex}
                </div>
              </div>
            </div>

            {/* Bathing Advice Box */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 leading-relaxed">
              <strong className="text-white">Conseil Baignade & Sécurité : </strong>
              Écart eau-air de <strong>{Math.abs(Number((selectedBeach.airTempC - selectedBeach.waterTempC).toFixed(1)))}°C</strong>. Mouillez-vous progressivement la nuque et le thorax avant l'immersion pour prévenir tout risque d'hydrocution.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
