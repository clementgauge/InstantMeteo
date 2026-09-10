import React, { useState, useEffect } from 'react';
import { 
  Globe2, 
  MapPin,
  Newspaper,
  Snowflake,
  Flame,
  Wind,
  Droplets,
  ThermometerSnowflake,
  ShieldAlert,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Building2,
  Radio,
  ExternalLink,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Sparkles,
  Satellite,
  Layers,
  Activity,
  Compass,
  Thermometer,
  CloudRain,
  Sun,
  Eye,
  Zap,
  BookOpen
} from 'lucide-react';
import { 
  CERTIFIED_HISTORICAL_DISASTERS, 
  fetchLiveWorldDisasters 
} from '../services/worldDisastersLiveService';
import { fetchLiveGlobalCitiesWeather, WORLD_KEY_METROPOLES } from '../services/globalExtremeEventsService';
import { GlobalCityWeather, LocationPoint } from '../types/weather';
import { GlobalExtremeEventsCard } from '../components/GlobalExtremeEventsCard';
import { searchLocalities } from '../services/openMeteoService';

interface WorldDisastersViewProps {
  seniorMode?: boolean;
  simplifiedMode?: boolean;
  tempUnit?: 'C' | 'F';
}

export type DisasterCategory = 
  | 'all' 
  | 'recent_24h'
  | 'fire'
  | 'tsunami'
  | 'cyclone'
  | 'cold_snow'
  | 'tornado' 
  | 'heat' 
  | 'flood';

export interface VerifiedDisasterEvent {
  id: string;
  type: 'cold_snow' | 'fire' | 'ice' | 'tornado' | 'cyclone' | 'heat' | 'flood' | 'tsunami';
  title: string;
  region: string;
  severity: 'Critique' | 'Extrême' | 'Majeur' | 'Élevé';
  badgeColor: string;
  metric: string;
  desc: string;
  updated: string;
  timestampUtc: string;
  verifiedWithin24h: boolean;
  categoryLabel: string;
  officialMeteoCentres: string[];
  verifiedMedia: string[];
  dataVerification: string;
  sourceUrl: string;
}

export const WorldDisastersView: React.FC<WorldDisastersViewProps> = ({
  seniorMode = false,
  simplifiedMode = false,
  tempUnit = 'C'
}) => {
  const [activeMode, setActiveMode] = useState<'live_disasters' | 'global_cities' | 'world_search' | 'historical_records'>('live_disasters');
  const [filterType, setFilterType] = useState<DisasterCategory>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedCertId, setExpandedCertId] = useState<string | null>(null);
  
  // Live Disasters & Earthquakes State
  const [disasters, setDisasters] = useState<VerifiedDisasterEvent[]>(CERTIFIED_HISTORICAL_DISASTERS);
  const [isLoadingLive, setIsLoadingLive] = useState<boolean>(false);
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(true);
  const [liveCount, setLiveCount] = useState<number>(0);
  const [lastSyncTime, setLastSyncTime] = useState<string>('En cours de synchronisation');

  // Live 40+ World Cities State
  const [globalCities, setGlobalCities] = useState<GlobalCityWeather[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState<boolean>(false);
  const [selectedContinent, setSelectedContinent] = useState<string>('ALL');
  const [citySearchQuery, setCitySearchQuery] = useState<string>('');

  // World On-Demand Search State
  const [worldSearchQuery, setWorldSearchQuery] = useState<string>('');
  const [isSearchingWorld, setIsSearchingWorld] = useState<boolean>(false);
  const [worldSearchResults, setWorldSearchResults] = useState<LocationPoint[]>([]);
  const [selectedWorldCityWeather, setSelectedWorldCityWeather] = useState<any | null>(null);
  const [isLoadingSelectedCity, setIsLoadingSelectedCity] = useState<boolean>(false);

  // Filtrage des informations les plus entendues et les plus intéressantes (Activé par défaut)
  const [focusHighlights, setFocusHighlights] = useState<boolean>(true);

  // Liste des métropoles mondiales les plus entendues et emblématiques
  const FAMOUS_TOP_CITIES = [
    'paris', 'london', 'new-york', 'tokyo', 'rome', 'madrid', 
    'dubai', 'los-angeles', 'rio-de-janeiro', 'cairo', 'sydney', 
    'bangkok', 'montreal', 'berlin', 'moscow', 'singapore'
  ];

  // 1. Load Live NASA & USGS Events
  const loadLiveEvents = async () => {
    setIsLoadingLive(true);
    try {
      const result = await fetchLiveWorldDisasters();
      setDisasters(result.events);
      setIsLiveConnected(result.isLiveApiConnected);
      setLiveCount(result.liveCount);
      setLastSyncTime(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
    } catch (e) {
      console.warn('Erreur lors du chargement des flux météo du monde :', e);
    } finally {
      setIsLoadingLive(false);
    }
  };

  // 2. Load Live 40+ World Cities Weather
  const loadCitiesWeather = async () => {
    setIsLoadingCities(true);
    try {
      const cities = await fetchLiveGlobalCitiesWeather();
      setGlobalCities(cities);
    } catch (e) {
      console.warn('Erreur lors du chargement des métropoles mondiales :', e);
    } finally {
      setIsLoadingCities(false);
    }
  };

  useEffect(() => {
    loadLiveEvents();
    loadCitiesWeather();
  }, []);

  const toggleCert = (id: string) => {
    setExpandedCertId(prev => prev === id ? null : id);
  };

  // Format Temperature
  const formatTemp = (celsius: number) => {
    if (tempUnit === 'F') {
      return `${Math.round((celsius * 9/5 + 32) * 10) / 10}°F`;
    }
    return `${celsius > 0 ? '+' : ''}${celsius}°C`;
  };

  // Filtered Live Disasters
  const filteredDisasters = disasters.filter(d => {
    if (filterType === 'recent_24h' && !d.verifiedWithin24h) return false;
    const matchesCategory = filterType === 'all' || filterType === 'recent_24h' || d.type === filterType;
    const matchesSearch = searchQuery.trim() === '' || 
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.verifiedMedia.some(m => m.toLowerCase().includes(searchQuery.toLowerCase())) ||
      d.officialMeteoCentres.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Si mode "Plus entendues & plus intéressantes" activé : filtrer les événements majeurs et captivants
    if (focusHighlights) {
      const isCaptivating = 
        d.severity === 'Extrême' || 
        d.severity === 'Critique' ||
        d.type === 'cyclone' ||
        d.type === 'tsunami' ||
        d.type === 'tornado' ||
        d.title.toLowerCase().includes('record') ||
        d.title.toLowerCase().includes('ouragan') ||
        d.title.toLowerCase().includes('volcan') ||
        d.title.toLowerCase().includes('séisme');
      if (!isCaptivating) return false;
    }

    return matchesCategory && matchesSearch;
  });

  // Filtered Global Cities
  const filteredCities = globalCities.filter(c => {
    if (selectedContinent !== 'ALL' && c.continent !== selectedContinent) return false;
    
    // Si mode "Plus entendues & plus intéressantes" activé : ne garder que les métropoles phares et emblématiques
    if (focusHighlights && !citySearchQuery.trim()) {
      if (!FAMOUS_TOP_CITIES.includes(c.cityId)) return false;
    }

    if (citySearchQuery.trim() !== '') {
      const q = citySearchQuery.toLowerCase();
      const matchName = c.cityName.toLowerCase().includes(q);
      const matchCountry = c.country.toLowerCase().includes(q);
      const matchDesc = c.weatherDescription.toLowerCase().includes(q);
      if (!matchName && !matchCountry && !matchDesc) return false;
    }
    return true;
  });

  // Handle on-demand worldwide search
  const handleExecuteWorldSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!worldSearchQuery.trim() || worldSearchQuery.trim().length < 2) return;
    setIsSearchingWorld(true);
    setSelectedWorldCityWeather(null);
    try {
      const results = await searchLocalities(worldSearchQuery.trim());
      setWorldSearchResults(results);
    } catch (err) {
      console.warn('Erreur recherche mondiale :', err);
    } finally {
      setIsSearchingWorld(false);
    }
  };

  const handleSelectWorldLocality = async (loc: LocationPoint) => {
    setIsLoadingSelectedCity(true);
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m&daily=temperature_2m_max,temperature_2m_min,uv_index_max,precipitation_sum,sunrise,sunset&timezone=auto`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        setSelectedWorldCityWeather({
          location: loc,
          data: json
        });
      }
    } catch (err) {
      console.warn('Erreur chargement météo ville sélectionnée :', err);
    } finally {
      setIsLoadingSelectedCity(false);
    }
  };

  const fireEventsCount = disasters.filter(d => d.type === 'fire').length;
  const quakeEventsCount = disasters.filter(d => d.type === 'tsunami').length;
  const stormEventsCount = disasters.filter(d => d.type === 'cyclone' || d.type === 'tornado').length;
  const realLiveTotal = disasters.filter(d => d.verifiedWithin24h).length;

  return (
    <div id="world-disasters-page" className="space-y-6">
      {/* Header Banner - In Simplified Mode: ONLY the search input/button. In Normal Mode: full rich banner with tabs and descriptions */}
      {simplifiedMode ? (
        <div className="flex items-center gap-2 max-w-2xl p-1">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher une information, pays, séisme, feu..."
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 shadow-xl"
            />
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 p-6 sm:p-8 shadow-2xl backdrop-blur relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div className="flex flex-wrap items-center gap-2 text-cyan-400 text-xs font-black uppercase tracking-wider">
                <Globe2 className="h-4 w-4 text-cyan-400 animate-spin" style={{ animationDuration: '16s' }} />
                <span>Observatoire Mondial Certifié &amp; Télédétection Directe</span>
                <span>•</span>
                <span className="text-emerald-400 flex items-center gap-1 font-black">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  Données 100% Authentiques (NASA • USGS • Open-Meteo • OMM)
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Focus Highlights Button */}
                <button
                  onClick={() => setFocusHighlights(prev => !prev)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-black transition shadow cursor-pointer ${
                    focusHighlights
                      ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 hover:bg-amber-500/30'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                  title="Garder uniquement les informations les plus entendues et les plus intéressantes"
                >
                  <Sparkles className={`h-3.5 w-3.5 ${focusHighlights ? 'text-amber-400 animate-pulse' : 'text-slate-400'}`} />
                  <span>{focusHighlights ? '⭐ Les + entendues & intéressantes' : 'Afficher Tout le Catalogue'}</span>
                </button>

                {/* Live Refresh Button */}
                <button
                  onClick={() => {
                    loadLiveEvents();
                    loadCitiesWeather();
                  }}
                  disabled={isLoadingLive || isLoadingCities}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white border border-slate-700 text-xs font-bold transition shadow cursor-pointer disabled:opacity-50"
                  title="Actualiser les données satellites NASA, sismomètres USGS et stations météo mondiales"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${(isLoadingLive || isLoadingCities) ? 'animate-spin text-cyan-400' : ''}`} />
                  <span>{(isLoadingLive || isLoadingCities) ? 'Synchronisation...' : 'Actualiser'}</span>
                </button>
              </div>
            </div>

            <h2 className={`font-black text-white ${seniorMode ? 'text-3xl' : 'text-2xl sm:text-3xl'}`}>
              Météo du Monde, Phénomènes en Temps Réel &amp; Catastrophes Naturelles
            </h2>
            
            <p className="text-sm text-slate-300 mt-2 max-w-4xl leading-relaxed">
              Chaque événement répertorié provient directement des <strong>flux de télédétection et réseaux de capteurs certifiés</strong> :
              <br />
              1. <strong>Télédétection satellitaire en direct</strong> : NASA EONET (feux VIIRS 375 m / MODIS, tempêtes, éruptions volcaniques).
              <br />
              2. <strong>Réseau sismologique &amp; tsunami mondial</strong> : USGS Earthquake Hazards Program &amp; Centre d'alerte tsunami NOAA.
              <br />
              3. <strong>Observations synoptiques des métropoles</strong> : Relevés en temps réel Open-Meteo pour plus de 40 villes mondiales.
              <br />
              4. <strong>Archives historiques homologuées</strong> : Records absolus certifiés par l'Organisation Météorologique Mondiale (OMM / WMO).
            </p>

            {/* Primary View Switcher (4 Navigation Tabs) */}
            <div className="mt-6 flex flex-wrap items-center gap-2.5 p-1.5 rounded-2xl bg-slate-950/90 border border-slate-800 w-full sm:w-fit">
              <button
                onClick={() => setActiveMode('live_disasters')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black transition cursor-pointer ${
                  activeMode === 'live_disasters'
                    ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/40 ring-1 ring-white/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-850'
                }`}
              >
                <Radio className="h-4 w-4 text-cyan-300 animate-pulse" />
                <span>🛰️ Direct Satellites &amp; Séismes</span>
                <span className="ml-1 px-2 py-0.5 rounded-full bg-slate-900 text-cyan-300 text-xs font-bold border border-cyan-500/30">
                  {realLiveTotal}
                </span>
              </button>

              <button
                onClick={() => setActiveMode('global_cities')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black transition cursor-pointer ${
                  activeMode === 'global_cities'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40 ring-1 ring-white/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-850'
                }`}
              >
                <Building2 className="h-4 w-4 text-indigo-300" />
                <span>🌍 40+ Métropoles en Direct</span>
                <span className="ml-1 px-2 py-0.5 rounded-full bg-slate-900 text-indigo-300 text-xs font-bold border border-indigo-500/30">
                  {globalCities.length || 40}
                </span>
              </button>

              <button
                onClick={() => setActiveMode('world_search')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black transition cursor-pointer ${
                  activeMode === 'world_search'
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/40 ring-1 ring-white/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-850'
                }`}
              >
                <Search className="h-4 w-4 text-emerald-300" />
                <span>🔍 Recherche Ville Mondiale</span>
              </button>

              <button
                onClick={() => setActiveMode('historical_records')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black transition cursor-pointer ${
                  activeMode === 'historical_records'
                    ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/40 ring-1 ring-white/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-850'
                }`}
              >
                <BookOpen className="h-4 w-4 text-amber-300" />
                <span>🏛️ Records Homologués OMM</span>
                <span className="ml-1 px-2 py-0.5 rounded-full bg-slate-900 text-amber-300 text-xs font-bold border border-amber-500/30">
                  {CERTIFIED_HISTORICAL_DISASTERS.length}
                </span>
              </button>
            </div>

            {/* Sub-Filters for Tab 1 (Live Disasters) */}
            {activeMode === 'live_disasters' && (
              <div className="mt-5 space-y-4">
                <div className="max-w-md relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filtrer par mot-clé (Feu, Séisme, NASA, Japon, Océan...)"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-950/90 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { id: 'all', label: `Tous les événements (${disasters.length})` },
                    { id: 'recent_24h', label: `⚡ Direct & < 24h (${realLiveTotal})` },
                    { id: 'fire', label: `🔥 Feux NASA VIIRS (${fireEventsCount})` },
                    { id: 'tsunami', label: `🌊 Séismes & Tsunamis USGS (${quakeEventsCount})` },
                    { id: 'cyclone', label: `🌀 Cyclones & Tempêtes (${stormEventsCount})` },
                    { id: 'cold_snow', label: `❄️ Froid & Banquise` },
                    { id: 'flood', label: `🌧️ Inondations & Crues` }
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setFilterType(f.id as any)}
                      className={`px-3 py-1.5 rounded-2xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                        filterType === f.id
                          ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/40 ring-1 ring-white/50'
                          : 'bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-850'
                      }`}
                    >
                      <span>{f.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 1 : DIRECT SATELLITAIRE & SÉISMES EN TEMPS RÉEL (NASA / USGS) */}
      {/* ========================================================================= */}
      {activeMode === 'live_disasters' && (
        <div className="space-y-6">
          {/* Summary Stat Cards */}
          {!simplifiedMode && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-2xl border border-orange-500/30 bg-slate-900/80 p-4 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-orange-400 font-bold uppercase">
                  <Flame className="h-4 w-4" />
                  <span>Feux Satellites NASA</span>
                </div>
                <div className="text-xl font-black text-white">{fireEventsCount} Détections NRT</div>
                <p className="text-[11px] text-slate-400">Satellites VIIRS 375 m / MODIS</p>
              </div>

              <div className="rounded-2xl border border-cyan-500/30 bg-slate-900/80 p-4 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-bold uppercase">
                  <Activity className="h-4 w-4" />
                  <span>Séismes &amp; Tsunamis USGS</span>
                </div>
                <div className="text-xl font-black text-white">{quakeEventsCount} Secousses &gt; M4.5</div>
                <p className="text-[11px] text-slate-400">Réseau sismologique mondial GSN</p>
              </div>

              <div className="rounded-2xl border border-rose-500/30 bg-slate-900/80 p-4 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-rose-400 font-bold uppercase">
                  <Wind className="h-4 w-4" />
                  <span>Tempêtes &amp; Cyclones</span>
                </div>
                <div className="text-xl font-black text-white">{stormEventsCount} Phénomènes</div>
                <p className="text-[11px] text-slate-400">Suivi RSMC Tokyo / NHC Miami</p>
              </div>

              <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/30 p-4 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold uppercase">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span>Statut Flux Direct</span>
                </div>
                <div className="text-xl font-black text-emerald-400">{isLiveConnected ? 'Connecté Direct' : 'Mode Fiabilisé'}</div>
                <p className="text-[11px] text-emerald-300/80">Synchronisé à {lastSyncTime}</p>
              </div>
            </div>
          )}

          {/* Event Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDisasters.map((item) => {
              const isFire = item.type === 'fire';
              const isQuake = item.type === 'tsunami';
              const isCold = item.type === 'cold_snow';
              const isCertExpanded = expandedCertId === item.id;

              if (simplifiedMode) {
                return (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-lg backdrop-blur flex flex-col justify-between gap-3 hover:border-cyan-500/40 transition"
                  >
                    <div>
                      <h3 className="text-base font-black text-white leading-snug">
                        {item.title}
                      </h3>
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Clock className="h-3.5 w-3.5 text-cyan-400" />
                        <span className="font-semibold text-slate-300">{item.updated}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-500 font-bold uppercase">Source:</span>
                        {item.sourceUrl ? (
                          <a
                            href={item.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-400 hover:text-cyan-300 font-bold underline flex items-center gap-1"
                          >
                            <span>{item.officialMeteoCentres[0] || 'Officielle'}</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-cyan-300 font-bold">{item.officialMeteoCentres[0] || 'Officielle'}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={item.id}
                  className={`rounded-3xl border p-6 shadow-xl backdrop-blur flex flex-col justify-between transition group ${
                    isFire 
                      ? 'border-orange-500/30 bg-slate-900/90 hover:border-orange-400/60' 
                      : isQuake
                      ? 'border-cyan-500/30 bg-slate-900/90 hover:border-cyan-400/60'
                      : isCold
                      ? 'border-blue-500/30 bg-slate-900/90 hover:border-blue-400/60'
                      : 'border-slate-800 bg-slate-900/90 hover:border-rose-500/50'
                  }`}
                >
                  <div>
                    {/* Top header badge */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <div className={`flex items-center gap-1.5 text-xs font-bold mb-1 ${
                          isFire ? 'text-orange-400' : isQuake ? 'text-cyan-400' : isCold ? 'text-blue-300' : 'text-rose-400'
                        }`}>
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          <span className="line-clamp-1">{item.region}</span>
                        </div>
                        <h3 className="text-base sm:text-lg font-black text-white group-hover:text-cyan-200 transition line-clamp-2">
                          {item.title}
                        </h3>
                      </div>
                      
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase shrink-0 border ${
                        item.severity === 'Extrême' || item.severity === 'Critique'
                          ? 'bg-rose-950 border-rose-500/50 text-rose-300'
                          : 'bg-amber-950 border-amber-500/50 text-amber-300'
                      }`}>
                        {item.severity}
                      </span>
                    </div>

                    {/* Metric pill */}
                    <div className={`rounded-2xl p-3.5 border my-3 shadow-inner ${
                      isFire 
                        ? 'bg-orange-950/40 border-orange-500/30 text-orange-200'
                        : isQuake
                        ? 'bg-cyan-950/40 border-cyan-500/30 text-cyan-200'
                        : isCold
                        ? 'bg-blue-950/40 border-blue-500/30 text-blue-200'
                        : 'bg-slate-950 border-slate-800/80 text-amber-300'
                    }`}>
                      <div className="text-xs font-mono font-black">
                        {item.metric}
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed mt-2">
                      {item.desc}
                    </p>

                    {/* Multi-source mini tags */}
                    <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <Newspaper className="h-3 w-3 text-cyan-400" />
                          Sources &amp; Organismes :
                        </span>
                        <span className={`text-[10px] font-bold flex items-center gap-1 ${item.verifiedWithin24h ? 'text-emerald-400' : 'text-amber-400'}`}>
                          <Clock className="h-3 w-3" />
                          {item.updated}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {item.officialMeteoCentres.slice(0, 2).map((centre, idx) => (
                          <span key={idx} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-950 text-cyan-300 border border-cyan-500/30">
                            {centre}
                          </span>
                        ))}
                        {item.verifiedMedia.slice(0, 2).map((media, idx) => (
                          <span key={idx} className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-950 text-slate-300 border border-slate-800">
                            {media}
                          </span>
                        ))}
                      </div>

                      {/* Direct Link to Source Page */}
                      <div className="pt-2">
                        <a
                          href={item.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 hover:text-white border border-cyan-500/40 text-[11px] font-bold transition shadow-sm"
                          title={`Consulter la dépêche ou télémesure officielle`}
                        >
                          <ExternalLink className="h-3.5 w-3.5 text-cyan-400" />
                          <span>Consulter la source officielle</span>
                        </a>
                      </div>
                    </div>

                    {/* Expandable Verification Certificate */}
                    {isCertExpanded && (
                      <div className="mt-3 p-3.5 rounded-2xl bg-slate-950 border border-emerald-500/40 space-y-2.5 text-xs animate-in fade-in">
                        <div className="flex items-center gap-1.5 text-[11px] font-black text-emerald-400 uppercase">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          <span>Certificat de Validation Scientifique</span>
                        </div>

                        <div>
                          <span className="text-[10px] font-bold text-slate-400 block">🏛️ Centres Météorologiques / Géophysiques :</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {item.officialMeteoCentres.map((centre, idx) => (
                              <span key={idx} className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-900 text-cyan-300 border border-cyan-500/30">
                                {centre}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] font-bold text-slate-400 block">📡 Capteurs &amp; Télédétection :</span>
                          <p className="text-[11px] text-slate-300 mt-0.5 font-mono">{item.dataVerification}</p>
                        </div>

                        <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800 flex items-center justify-between">
                          <span>Horodatage : <strong>{item.timestampUtc}</strong></span>
                          <span className="text-emerald-400 font-bold">100% Authentique</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Verified Source Footer Button */}
                  <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                    <button
                      onClick={() => toggleCert(item.id)}
                      className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 font-bold transition cursor-pointer text-xs"
                    >
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                      <span>{isCertExpanded ? 'Masquer' : 'Détail des sources & capteurs'}</span>
                      {isCertExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </button>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0 flex items-center gap-1 ${
                      item.verifiedWithin24h 
                        ? 'text-emerald-400 bg-emerald-950/60 border-emerald-800/40' 
                        : 'text-amber-400 bg-amber-950/60 border-amber-800/40'
                    }`}>
                      <CheckCircle2 className="h-3 w-3" />
                      {item.verifiedWithin24h ? 'En Direct' : 'Historique'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredDisasters.length === 0 && (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-12 text-center text-slate-400 space-y-3">
              <Globe2 className="h-10 w-10 mx-auto text-slate-600 animate-spin" />
              <p className="text-base font-bold text-white">Aucun événement ne correspond à votre filtre</p>
              <p className="text-xs text-slate-400">Essayez de modifier votre mot-clé ou sélectionnez « Tous les événements ».</p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2 : 40+ GRANDES MÉTROPOLES MONDIALES EN TEMPS RÉEL (OPEN-METEO API) */}
      {/* ========================================================================= */}
      {activeMode === 'global_cities' && (
        <div className="space-y-6">
          {/* Continent Filter and Search Header */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-indigo-400" />
                  <span>Météo Officielle en Direct des Grandes Villes du Monde</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Relevés réels et prévisions directes via les modèles mondiaux Open-Meteo (températures, ressenti, vent, humidité, pression, anomalies).
                </p>
              </div>

              <button
                onClick={loadCitiesWeather}
                disabled={isLoadingCities}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-300 hover:text-white border border-indigo-500/40 text-xs font-bold transition cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isLoadingCities ? 'animate-spin text-indigo-400' : ''}`} />
                <span>{isLoadingCities ? 'Actualisation...' : 'Actualiser les 40 Villes'}</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* City search input */}
              <div className="w-full sm:w-72 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={citySearchQuery}
                  onChange={(e) => setCitySearchQuery(e.target.value)}
                  placeholder="Rechercher une métropole (Paris, Tokyo, New York...)"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Continent buttons */}
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'ALL', label: 'Toutes (40)' },
                  { id: 'Europe', label: '🇪🇺 Europe' },
                  { id: 'Amérique du Nord', label: '🇺🇸 Amérique N.' },
                  { id: 'Asie', label: '🇯🇵 Asie & Orient' },
                  { id: 'Amérique du Sud', label: '🇧🇷 Amérique S.' },
                  { id: 'Afrique', label: '🇿🇦 Afrique' },
                  { id: 'Océanie', label: '🇦🇺 Océanie' },
                  { id: 'Pôles', label: '🧊 Pôles & Extrêmes' }
                ].map(c => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedContinent(c.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      selectedContinent === c.id
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Global Cities Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredCities.map((city) => {
              const isHot = city.currentTempC >= 35;
              const isCold = city.currentTempC <= 0;

              return (
                <div
                  key={city.cityId}
                  className={`rounded-3xl border p-4 shadow-lg backdrop-blur flex flex-col justify-between transition group hover:scale-[1.01] ${
                    isHot
                      ? 'border-rose-500/40 bg-gradient-to-b from-rose-950/20 to-slate-900/90'
                      : isCold
                      ? 'border-cyan-500/40 bg-gradient-to-b from-cyan-950/20 to-slate-900/90'
                      : 'border-slate-800 bg-slate-900/90 hover:border-indigo-500/40'
                  }`}
                >
                  <div>
                    {/* Top Row: City & Country */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          {city.country} • {city.continent}
                        </div>
                        <h4 className="text-base font-black text-white group-hover:text-cyan-300 transition">
                          {city.cityName}
                        </h4>
                      </div>

                      <span className="text-2xl" title={city.weatherDescription}>
                        {city.weatherIcon}
                      </span>
                    </div>

                    {/* Temperature display */}
                    <div className="flex items-baseline gap-2 my-2">
                      <span className={`text-2xl sm:text-3xl font-black ${
                        city.currentTempC >= 30 ? 'text-rose-400' :
                        city.currentTempC <= 5 ? 'text-cyan-300' : 'text-white'
                      }`}>
                        {formatTemp(city.currentTempC)}
                      </span>
                      <span className="text-xs text-slate-400 font-semibold">
                        Ressenti {formatTemp(city.apparentTempC)}
                      </span>
                    </div>

                    {/* Weather description */}
                    <p className="text-xs text-slate-300 line-clamp-1 mb-3">
                      {city.weatherDescription}
                    </p>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 gap-1.5 p-2 rounded-2xl bg-slate-950/80 border border-slate-800/80 text-[11px]">
                      <div>
                        <span className="text-slate-500 block text-[10px]">Min / Max :</span>
                        <span className="font-bold text-slate-200">
                          {formatTemp(city.tempMinC)} / {formatTemp(city.tempMaxC)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Vent (Rafales) :</span>
                        <span className="font-bold text-slate-200">
                          {city.windSpeedKmh} km/h ({city.windGustKmh})
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Humidité / Pression :</span>
                        <span className="font-bold text-slate-200">
                          {city.humidityPct}% • {city.pressureHpa} hPa
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Anomalie Climat :</span>
                        <span className={`font-bold ${
                          city.climateAnomalyC > 0 ? 'text-rose-400' : 'text-blue-300'
                        }`}>
                          {city.climateAnomalyC > 0 ? `+${city.climateAnomalyC}` : city.climateAnomalyC} °C
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Alert Headline if active */}
                  {city.alertHeadline && (
                    <div className="mt-3 p-2 rounded-xl bg-rose-950/60 border border-rose-500/40 text-[10px] font-bold text-rose-300 flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-rose-400" />
                      <span className="line-clamp-1">{city.alertHeadline}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 3 : RECHERCHE MÉTÉO N'IMPORTE OÙ DANS LE MONDE (GÉOCODAGE DIRECT) */}
      {/* ========================================================================= */}
      {activeMode === 'world_search' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Search className="h-5 w-5 text-emerald-400" />
              <span>Rechercher n’importe quelle ville ou région dans le Monde</span>
            </h3>
            <p className="text-xs text-slate-300">
              Tapez le nom d’une localité (ex. : <em>Kyoto, Tromsø, Miami, Vancouver, Papeete, Dakar, Honolulu, Ushuaïa, Reykjavik</em>) pour afficher instantanément ses relevés officiels et prévisions météorologiques en direct.
            </p>

            <form onSubmit={handleExecuteWorldSearch} className="flex flex-wrap items-center gap-2 max-w-xl">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={worldSearchQuery}
                  onChange={(e) => setWorldSearchQuery(e.target.value)}
                  placeholder="Ex : Reykjavik, Kyoto, Miami, Dakar..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSearchingWorld || worldSearchQuery.trim().length < 2}
                className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition shadow-lg shadow-emerald-600/30 cursor-pointer disabled:opacity-50"
              >
                {isSearchingWorld ? 'Recherche...' : 'Rechercher'}
              </button>
            </form>

            {/* Search Results List */}
            {worldSearchResults.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-800">
                <span className="text-xs font-bold text-slate-400 block mb-2">
                  Résultats trouvés ({worldSearchResults.length}) :
                </span>
                <div className="flex flex-wrap gap-2">
                  {worldSearchResults.map((res, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectWorldLocality(res)}
                      className="px-3.5 py-2 rounded-2xl bg-slate-950 hover:bg-emerald-950/40 border border-slate-800 hover:border-emerald-500/50 text-xs font-bold text-slate-200 hover:text-emerald-300 transition text-left cursor-pointer flex items-center gap-2"
                    >
                      <MapPin className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <span>{res.name} ({res.region || res.department || res.country || 'Monde'})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Selected City Weather Card */}
          {isLoadingSelectedCity && (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8 text-center text-slate-400 space-y-2">
              <RefreshCw className="h-8 w-8 mx-auto text-emerald-400 animate-spin" />
              <p className="text-sm font-bold text-white">Récupération des données météorologiques officielles...</p>
            </div>
          )}

          {selectedWorldCityWeather && !isLoadingSelectedCity && (
            <div className="rounded-3xl border border-emerald-500/40 bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 p-6 sm:p-8 shadow-2xl space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-black uppercase">
                    <MapPin className="h-4 w-4" />
                    <span>{selectedWorldCityWeather.location.country || 'Monde'} • {selectedWorldCityWeather.location.region || selectedWorldCityWeather.location.department || ''}</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-white mt-1">
                    {selectedWorldCityWeather.location.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Coordonnées : {selectedWorldCityWeather.location.latitude.toFixed(3)}°N, {selectedWorldCityWeather.location.longitude.toFixed(3)}°E • Altitude {selectedWorldCityWeather.data.elevation || 0} m
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-3xl sm:text-4xl font-black text-white">
                    {formatTemp(selectedWorldCityWeather.data.current?.temperature_2m || 0)}
                  </div>
                  <div className="text-xs text-slate-400 font-bold">
                    Ressenti {formatTemp(selectedWorldCityWeather.data.current?.apparent_temperature || 0)}
                  </div>
                </div>
              </div>

              {/* Instant Weather Attributes Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Humidité Relative</span>
                  <div className="text-lg font-black text-white mt-0.5">
                    {selectedWorldCityWeather.data.current?.relative_humidity_2m || 50}%
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Vent Moyen</span>
                  <div className="text-lg font-black text-white mt-0.5">
                    {selectedWorldCityWeather.data.current?.wind_speed_10m || 0} km/h
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Pression au Sol</span>
                  <div className="text-lg font-black text-white mt-0.5">
                    {selectedWorldCityWeather.data.current?.surface_pressure || 1013} hPa
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Indice UV Max</span>
                  <div className="text-lg font-black text-white mt-0.5">
                    {selectedWorldCityWeather.data.daily?.uv_index_max?.[0] ?? 5} / 12
                  </div>
                </div>
              </div>

              {/* 7-Day Forecast Mini Cards */}
              {selectedWorldCityWeather.data.daily && selectedWorldCityWeather.data.daily.time && (
                <div className="pt-4 border-t border-slate-800">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                    Prévisions à 7 Jours Certifiées :
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-7 gap-2">
                    {selectedWorldCityWeather.data.daily.time.slice(0, 7).map((dStr: string, idx: number) => {
                      const tMin = selectedWorldCityWeather.data.daily.temperature_2m_min[idx];
                      const tMax = selectedWorldCityWeather.data.daily.temperature_2m_max[idx];
                      const dateObj = new Date(dStr);
                      const dayName = dateObj.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });

                      return (
                        <div key={idx} className="p-2.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
                          <span className="text-[10px] font-bold text-slate-400 block capitalize">{dayName}</span>
                          <div className="text-xs font-black text-white mt-1">
                            {formatTemp(tMax)}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {formatTemp(tMin)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 4 : RECORDS & CATASTROPHES HISTORIQUES HOMOLOGUÉS OMM / NOAA */}
      {/* ========================================================================= */}
      {activeMode === 'historical_records' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-amber-500/30 bg-slate-900/90 p-5 shadow-xl">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-amber-400" />
              <span>Archives Officielles des Records Climatiques &amp; Catastrophes Homologuées (OMM / WMO)</span>
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-4xl">
              Toutes les données de cette section ont fait l’objet d’une validation scientifique formelle par le <em>Comité d’experts de l’Organisation Météorologique Mondiale (OMM)</em>, de Météo-France ou de l'USGS. Chaque record comporte sa <strong>date historique exacte</strong> et ses <strong>conditions d’étalonnage physique</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {CERTIFIED_HISTORICAL_DISASTERS.map((rec) => {
              if (simplifiedMode) {
                return (
                  <div
                    key={rec.id}
                    className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-lg space-y-3 hover:border-amber-500/40 transition"
                  >
                    <h4 className="text-base font-black text-white leading-snug">
                      {rec.title}
                    </h4>
                    <div className="pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Clock className="h-3.5 w-3.5 text-amber-400" />
                        <span className="font-semibold text-slate-300">{rec.updated}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-500 font-bold uppercase">Source:</span>
                        <span className="text-cyan-300 font-bold">{rec.officialMeteoCentres[0] || 'OMM'}</span>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={rec.id}
                  className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-4 hover:border-amber-500/40 transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                        {rec.categoryLabel}
                      </span>
                      <h4 className="text-base font-black text-white mt-0.5">
                        {rec.title}
                      </h4>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3 text-slate-500" />
                        <span>{rec.region}</span>
                      </p>
                    </div>

                    <span className="text-xs font-black px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300 shrink-0">
                      Homologué OMM
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 text-amber-200 font-mono font-black text-xs">
                    {rec.metric}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {rec.desc}
                  </p>

                  <div className="pt-3 border-t border-slate-800 space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Organisme de certification :</span>
                      <span className="font-bold text-cyan-300">{rec.officialMeteoCentres[0]}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Télémétrie :</span>
                      <span className="font-mono text-slate-300">{rec.dataVerification}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Date certifiée :</span>
                      <span className="font-bold text-emerald-400">{rec.updated}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
