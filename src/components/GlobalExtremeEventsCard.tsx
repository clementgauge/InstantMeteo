import React, { useState, useEffect } from 'react';
import { 
  Globe2, 
  Flame, 
  Snowflake, 
  CloudRain, 
  Wind, 
  AlertTriangle, 
  ShieldAlert, 
  Compass, 
  Search, 
  RefreshCw, 
  Info, 
  ExternalLink, 
  Activity, 
  Layers, 
  MapPin, 
  Thermometer, 
  Waves, 
  Eye, 
  Zap, 
  TrendingUp,
  CheckCircle2,
  ChevronRight,
  Filter,
  Mountain
} from 'lucide-react';
import { 
  GlobalExtremeEventsCollection, 
  GlobalExtremeWeatherEvent, 
  GlobalCityWeather, 
  ExtremeEventType 
} from '../types/weather';
import { generateGlobalExtremeEventsObservatory } from '../services/globalExtremeEventsService';

interface GlobalExtremeEventsCardProps {
  seniorMode?: boolean;
  tempUnit?: 'C' | 'F';
}

export const GlobalExtremeEventsCard: React.FC<GlobalExtremeEventsCardProps> = ({
  seniorMode = false,
  tempUnit = 'C'
}) => {
  const [data, setData] = useState<GlobalExtremeEventsCollection | null>(null);
  const [activeTab, setActiveTab] = useState<'events' | 'cities' | 'cryosphere' | 'synthesis'>('events');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('ALL');
  const [selectedContinentFilter, setSelectedContinentFilter] = useState<string>('ALL');
  const [selectedSeverityFilter, setSelectedSeverityFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedEventId, setSelectedEventId] = useState<string>('cyclone-pac-1');
  const [lastRefreshed, setLastRefreshed] = useState<string>('');

  const refreshData = () => {
    const res = generateGlobalExtremeEventsObservatory();
    setData(res);
    setLastRefreshed(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  };

  useEffect(() => {
    refreshData();
  }, []);

  if (!data) return null;

  const formatTemp = (celsius: number) => {
    if (tempUnit === 'F') {
      return `${Math.round((celsius * 9/5 + 32) * 10) / 10}°F`;
    }
    return `${celsius > 0 ? '+' : ''}${celsius}°C`;
  };

  const getEventIcon = (type: ExtremeEventType) => {
    switch (type) {
      case 'CYCLONE_HURRICANE_TYPHOON':
        return <Wind className="h-5 w-5 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />;
      case 'HEAT_DOME_RECORD':
        return <Flame className="h-5 w-5 text-rose-500 animate-pulse" />;
      case 'POLAR_COLD_BLIZZARD':
        return <Snowflake className="h-5 w-5 text-blue-300" />;
      case 'TORRENTIAL_FLOOD_RIVER':
        return <CloudRain className="h-5 w-5 text-blue-400" />;
      case 'MEGA_WILDFIRE_DROUGHT':
        return <Flame className="h-5 w-5 text-amber-500" />;
      case 'SEVERE_CONVECTION_DERECHO':
        return <Zap className="h-5 w-5 text-purple-400" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-amber-400" />;
    }
  };

  const getSeverityBadge = (severity: GlobalExtremeWeatherEvent['severity']) => {
    switch (severity) {
      case 'CRITIQUE_CATASTROPHIQUE':
        return {
          bg: 'bg-rose-950/80 text-rose-300 border-rose-500/50 shadow-lg shadow-rose-900/30 ring-1 ring-rose-400',
          dot: 'bg-rose-500 animate-ping',
          label: 'Alerte Catastrophique Extrême'
        };
      case 'ALERTE_MAXIMALE':
        return {
          bg: 'bg-amber-950/80 text-amber-300 border-amber-500/50 shadow-md shadow-amber-900/20',
          dot: 'bg-amber-400',
          label: 'Alerte Météorologique Majeure'
        };
      case 'VIGILANCE_RENFORCEE':
        return {
          bg: 'bg-purple-950/80 text-purple-300 border-purple-500/50',
          dot: 'bg-purple-400',
          label: 'Vigilance Renforcée'
        };
    }
  };

  // Filtered Extreme Events
  const filteredEvents = data.extremeEvents.filter(ev => {
    if (selectedTypeFilter !== 'ALL' && ev.type !== selectedTypeFilter) return false;
    if (selectedContinentFilter !== 'ALL' && ev.continent !== selectedContinentFilter) return false;
    if (selectedSeverityFilter !== 'ALL' && ev.severity !== selectedSeverityFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = ev.name.toLowerCase().includes(q);
      const matchLoc = ev.locationName.toLowerCase().includes(q);
      const matchType = ev.typeLabel.toLowerCase().includes(q);
      const matchMech = ev.synopticMechanism.toLowerCase().includes(q);
      if (!matchName && !matchLoc && !matchType && !matchMech) return false;
    }
    return true;
  });

  const selectedEvent = data.extremeEvents.find(e => e.id === selectedEventId) || filteredEvents[0] || data.extremeEvents[0];

  // Filtered Cities
  const filteredCities = data.globalCities.filter(c => {
    if (selectedContinentFilter !== 'ALL' && c.continent !== selectedContinentFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = c.cityName.toLowerCase().includes(q);
      const matchCountry = c.country.toLowerCase().includes(q);
      const matchDesc = c.weatherDescription.toLowerCase().includes(q);
      if (!matchName && !matchCountry && !matchDesc) return false;
    }
    return true;
  });

  return (
    <div id="global-extreme-events-card" className="space-y-6">
      {/* Top Banner with Planetary Climate Metrics */}
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-indigo-950/50 to-slate-900 p-6 sm:p-8 shadow-2xl backdrop-blur relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-black uppercase tracking-wider mb-2">
              <Globe2 className="h-4 w-4" />
              <span>Observatoire Planétaire des Temps Globaux & Événements Extrêmes</span>
            </div>
            <h2 className={`font-black text-white ${seniorMode ? 'text-3xl' : 'text-2xl sm:text-3xl'}`}>
              Surveillance Mondiale en Temps Réel des Phénomènes Majeurs
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Cyclones tropicaux majeurs, dômes de chaleur records, descentes polaires, moussons diluviennes, méga-feux boréaux, banquises polaires et météo en direct des grandes métropoles mondiales.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={refreshData}
              className="flex items-center gap-2 rounded-2xl border border-cyan-500/40 bg-cyan-950/40 px-4 py-2.5 text-xs font-bold text-cyan-200 transition hover:bg-cyan-900/60 active:scale-95 shadow"
            >
              <RefreshCw className="h-4 w-4 text-cyan-400" />
              <span>Actualiser le Globe ({lastRefreshed || 'En direct'})</span>
            </button>
          </div>
        </div>

        {/* Real-time Global Climate Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-3.5 text-center">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">Anomalie Globale Terre</span>
            <div className="text-base font-black text-rose-400 mt-1">
              +{data.globalMetrics.globalMeanTempAnomalyC}°C
            </div>
            <span className="text-[10px] text-slate-500 block">vs ère préindustrielle</span>
          </div>

          <div className="rounded-2xl bg-slate-950/80 border border-rose-500/30 p-3.5 text-center">
            <span className="text-[10px] font-bold text-rose-300 block uppercase">Océans Mondiaux (SST)</span>
            <div className="text-base font-black text-rose-400 mt-1 flex items-center justify-center gap-1">
              <Waves className="h-4 w-4" />
              <span>+{data.globalMetrics.globalSstOceansAnomalyC}°C</span>
            </div>
            <span className="text-[10px] text-rose-300/80 block font-semibold">Record historique</span>
          </div>

          <div className="rounded-2xl bg-slate-950/80 border border-amber-500/30 p-3.5 text-center">
            <span className="text-[10px] font-bold text-amber-300 block uppercase">Forçage ENSO Pacifique</span>
            <div className="text-base font-black text-amber-400 mt-1">
              +{data.globalMetrics.ensoPacificNiño34C}°C
            </div>
            <span className="text-[10px] text-amber-300/80 block font-semibold">Fort El Niño Actif</span>
          </div>

          <div className="rounded-2xl bg-slate-950/80 border border-cyan-500/30 p-3.5 text-center">
            <span className="text-[10px] font-bold text-cyan-300 block uppercase">Systèmes Tropicaux</span>
            <div className="text-base font-black text-cyan-400 mt-1">
              {data.globalMetrics.activeTropicalSystemsCount} Actifs
            </div>
            <span className="text-[10px] text-cyan-300/80 block font-semibold">Pacifique / Atlantique</span>
          </div>

          <div className="rounded-2xl bg-slate-950/80 border border-blue-500/30 p-3.5 text-center">
            <span className="text-[10px] font-bold text-blue-300 block uppercase">Banquise Arctique</span>
            <div className="text-base font-black text-blue-300 mt-1">
              {data.cryosphere.arcticSeaIceExtentMillionKm2} M km²
            </div>
            <span className="text-[10px] text-rose-400 block font-semibold">
              {data.cryosphere.arcticAnomalyPct}% vs normale
            </span>
          </div>

          <div className="rounded-2xl bg-slate-950/80 border border-purple-500/30 p-3.5 text-center">
            <span className="text-[10px] font-bold text-purple-300 block uppercase">Oscillation MJO</span>
            <div className="text-sm font-black text-purple-300 mt-1 truncate">
              {data.globalMetrics.mjoPhaseActive.split(' ')[0]}
            </div>
            <span className="text-[10px] text-purple-400 block truncate">
              Pacifique Est
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs for Global Observatory */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('events')}
          className={`flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-black transition ${
            activeTab === 'events'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Flame className="h-4 w-4" />
          <span>1. Événements Extrêmes en Direct ({data.extremeEvents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('cities')}
          className={`flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-black transition ${
            activeTab === 'cities'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Globe2 className="h-4 w-4" />
          <span>2. Météo des Grandes Métropoles Mondiales ({data.globalCities.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('cryosphere')}
          className={`flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-black transition ${
            activeTab === 'cryosphere'
              ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Snowflake className="h-4 w-4" />
          <span>3. Cryosphère & Banquises Polaires (Arctique / Antarctique)</span>
        </button>

        <button
          onClick={() => setActiveTab('synthesis')}
          className={`flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-black transition ${
            activeTab === 'synthesis'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Activity className="h-4 w-4" />
          <span>4. Diagnostic Synoptique Planétaire (Couplage El Niño)</span>
        </button>
      </div>

      {/* TAB 1: REAL-TIME EXTREME WEATHER EVENTS */}
      {activeTab === 'events' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 shadow-xl backdrop-blur space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                <div className="relative w-full max-w-md">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher cyclone, canicule, ville, pays ou région..."
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Continent Filter */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-[11px] font-bold text-slate-400 mr-1">Continent :</span>
                {['ALL', 'Asie', 'Amérique du Nord', 'Amérique du Sud', 'Europe', 'Afrique', 'Océanie'].map((cont) => (
                  <button
                    key={cont}
                    onClick={() => setSelectedContinentFilter(cont)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                      selectedContinentFilter === cont
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    {cont === 'ALL' ? 'Tous' : cont}
                  </button>
                ))}
              </div>
            </div>

            {/* Type Filter Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80 text-xs">
              <span className="text-[11px] font-bold text-slate-400 mr-1">Type de Phénomène :</span>
              {[
                { id: 'ALL', label: 'Tous les Phénomènes' },
                { id: 'CYCLONE_HURRICANE_TYPHOON', label: '🌀 Cyclones / Ouragans / Typhons' },
                { id: 'HEAT_DOME_RECORD', label: '🔥 Dômes de Chaleur / Canicules' },
                { id: 'POLAR_COLD_BLIZZARD', label: '❄️ Vagues de Froid / Blizzards' },
                { id: 'TORRENTIAL_FLOOD_RIVER', label: '🌊 Inondations & Rivières Atmo.' },
                { id: 'MEGA_WILDFIRE_DROUGHT', label: '🌲 Méga-Feux & Sécheresses' },
                { id: 'SEVERE_CONVECTION_DERECHO', label: '⚡ Orages Violents & Derechos' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTypeFilter(t.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                    selectedTypeFilter === t.id
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Master-Detail Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Events List (Left Column) */}
            <div className="lg:col-span-5 space-y-3">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Événements identifiés ({filteredEvents.length})</span>
                <span className="text-[10px] text-cyan-400">Cliquez pour inspecter</span>
              </div>

              <div className="space-y-3 max-h-[750px] overflow-y-auto pr-1">
                {filteredEvents.map((ev) => {
                  const isSelected = ev.id === selectedEvent.id;
                  const sevBadge = getSeverityBadge(ev.severity);

                  return (
                    <button
                      key={ev.id}
                      onClick={() => setSelectedEventId(ev.id)}
                      className={`w-full text-left rounded-2xl border p-4 transition duration-150 flex flex-col justify-between ${
                        isSelected
                          ? 'bg-slate-900 border-rose-500 shadow-xl shadow-rose-950/40 ring-1 ring-rose-400'
                          : 'bg-slate-950/80 border-slate-800 hover:bg-slate-900 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          {getEventIcon(ev.type)}
                          <span className="text-xs font-black text-white">{ev.continent}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${sevBadge.bg}`}>
                          {sevBadge.label}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-white leading-tight mb-1">{ev.name}</h4>
                      <p className="text-xs text-slate-400 mb-2 flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-cyan-400" />
                        <span>{ev.locationName}</span>
                      </p>

                      <div className="rounded-xl bg-slate-900/90 border border-slate-800/80 p-2.5 text-xs space-y-1">
                        <div className="font-bold text-cyan-300 flex items-center justify-between">
                          <span>Valeur de pointe :</span>
                          <span className="text-white">{ev.peakValueFormatted.split('•')[0]}</span>
                        </div>
                        <div className="text-[11px] text-amber-300 flex items-center justify-between">
                          <span>Anomalie :</span>
                          <span>{ev.anomalyVsNormal}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 pt-2 border-t border-slate-800/60">
                        <span>Statut : <strong className="text-emerald-400">{ev.status.replace('_', ' ')}</strong></span>
                        <span>{ev.lastUpdatedFormatted}</span>
                      </div>
                    </button>
                  );
                })}

                {filteredEvents.length === 0 && (
                  <div className="rounded-2xl border border-slate-800 bg-slate-950 p-8 text-center text-slate-400">
                    <AlertTriangle className="h-8 w-8 text-amber-400 mx-auto mb-2" />
                    <p className="text-sm font-bold text-white">Aucun événement ne correspond à vos filtres.</p>
                    <p className="text-xs text-slate-500 mt-1">Réinitialisez les filtres ou la recherche pour voir tous les événements.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Selected Event Deep Diagnostic Card (Right Column) */}
            <div className="lg:col-span-7">
              <div className="sticky top-20 rounded-3xl border border-rose-500/30 bg-slate-900/95 p-6 sm:p-8 shadow-2xl backdrop-blur space-y-6">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        {selectedEvent.continent}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        {selectedEvent.typeLabel}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${getSeverityBadge(selectedEvent.severity).bg}`}>
                        {getSeverityBadge(selectedEvent.severity).label}
                      </span>
                    </div>

                    <h3 className="text-2xl font-black text-white">{selectedEvent.name}</h3>
                    <p className="text-xs text-slate-300 mt-1 flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-cyan-400" />
                      <span>{selectedEvent.locationName}</span>
                      <span>•</span>
                      <span>Coordonnées : {selectedEvent.coordinates.lat}°N, {selectedEvent.coordinates.lon}°E</span>
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-950 border border-slate-800 p-3 text-right">
                    <span className="text-[10px] text-slate-400 block font-semibold">Statut Système</span>
                    <span className="text-xs font-black text-emerald-400 uppercase tracking-wider">
                      ● {selectedEvent.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Key Metrics Highlight Box */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-slate-950 border border-slate-800 p-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Intensité & Valeurs Maximales Relevées :
                    </span>
                    <div className="text-base font-black text-cyan-300 mt-1">
                      {selectedEvent.peakValueFormatted}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-slate-950 border border-rose-500/30 p-4">
                    <span className="text-[10px] font-bold text-rose-300 uppercase tracking-wider block">
                      Écart / Anomalie Climatologique :
                    </span>
                    <div className="text-base font-black text-rose-400 mt-1">
                      {selectedEvent.anomalyVsNormal}
                    </div>
                  </div>
                </div>

                {/* Synoptic Meteorological Mechanism */}
                <div className="rounded-2xl bg-indigo-950/30 border border-indigo-500/30 p-5 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 uppercase tracking-wider">
                    <Activity className="h-4 w-4 text-indigo-400" />
                    <span>Mécanisme Synoptique & Dynamique Atmosphérique :</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-medium">
                    {selectedEvent.synopticMechanism}
                  </p>
                </div>

                {/* Humanitarian & Ecosystem Impacts */}
                <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-5 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                    <AlertTriangle className="h-4 w-4 text-amber-400" />
                    <span>Impacts Territoriaux, Énergétiques & Humains :</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {selectedEvent.impactsDescription}
                  </p>
                  <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/60 mt-2">
                    <span>Population directement exposée :</span>
                    <strong className="text-white">{selectedEvent.affectedPopulationEstimate}</strong>
                  </div>
                </div>

                {/* Multi-Media & Official Meteorological Centers Verification Box (< 24h) */}
                <div className="rounded-2xl bg-emerald-950/30 border border-emerald-500/40 p-5 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-800/40 pb-2">
                    <div className="flex items-center gap-2 text-xs font-black text-emerald-400 uppercase tracking-wider">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      <span>Triple Vérification Certifiée (<span className="text-white font-bold">&lt; 24H</span>)</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-900/60 text-emerald-200 border border-emerald-700/50">
                      {selectedEvent.lastUpdatedFormatted}
                    </span>
                  </div>

                  {selectedEvent.meteorologicalCenters && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">
                        🏛️ Centres Météorologiques & Scientifiques Officiels :
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedEvent.meteorologicalCenters.map((center, idx) => (
                          <span key={idx} className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-slate-900 text-cyan-300 border border-cyan-500/30">
                            {center}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedEvent.verifiedMedia && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">
                        📰 Multiples Médias & Dépêches Indépendantes Vérifiées :
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedEvent.verifiedMedia.map((media, idx) => (
                          <span key={idx} className="text-[11px] font-semibold px-2.5 py-0.5 rounded-lg bg-slate-900 text-slate-200 border border-slate-700">
                            {media}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedEvent.controlledDataTypes && (
                    <div className="text-[11px] text-slate-400 pt-1 flex items-center gap-1.5">
                      <span className="font-bold text-slate-300">📡 Données Physiques Contrôlées :</span>
                      <span>{selectedEvent.controlledDataTypes}</span>
                    </div>
                  )}
                </div>

                {/* Satellite Radar Signature */}
                <div className="rounded-2xl bg-slate-950/60 border border-slate-800 p-4 flex items-start gap-3">
                  <Eye className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                      Signature Imagerie Satellite & Télédétection :
                    </span>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {selectedEvent.satelliteImageHint}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GLOBAL METROPOLISES LIVE WEATHER (24+ CITIES) */}
      {activeTab === 'cities' && (
        <div className="space-y-6">
          {/* City Filter & Search */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 shadow-xl flex flex-wrap items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher une métropole mondiale..."
                className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-[11px] font-bold text-slate-400 mr-1">Continent :</span>
              {['ALL', 'Europe', 'Asie', 'Amérique du Nord', 'Amérique du Sud', 'Afrique', 'Océanie', 'Pôles'].map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedContinentFilter(c)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                    selectedContinentFilter === c
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-950 text-slate-400 hover:text-white'
                  }`}
                >
                  {c === 'ALL' ? 'Tous' : c}
                </button>
              ))}
            </div>
          </div>

          {/* Cities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredCities.map((city) => (
              <div
                key={city.cityId}
                className={`rounded-2xl border p-4 transition hover:border-slate-600 bg-slate-900/90 shadow-lg ${
                  city.isExtremeAlert ? 'border-amber-500/50 ring-1 ring-amber-500/20' : 'border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-[10px] font-black uppercase text-cyan-400 block">{city.continent} • {city.country}</span>
                    <h4 className="text-base font-black text-white">{city.cityName}</h4>
                  </div>
                  <span className="text-2xl">{city.weatherIcon}</span>
                </div>

                {city.isExtremeAlert && (
                  <div className="mb-2 px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-[10px] font-bold text-amber-300 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3 shrink-0" />
                    <span className="truncate">{city.alertHeadline}</span>
                  </div>
                )}

                <div className="flex items-baseline justify-between my-3 pb-3 border-b border-slate-800">
                  <div className="text-3xl font-black text-white">
                    {formatTemp(city.currentTempC)}
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Ressenti {formatTemp(city.apparentTempC)}</span>
                    <span className="text-xs font-bold text-slate-300">
                      Tn {formatTemp(city.tempMinC)} / Tx {formatTemp(city.tempMaxC)}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-300 font-medium mb-3 line-clamp-1">
                  {city.weatherDescription}
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                  <div className="rounded-lg bg-slate-950 p-2">
                    <span>Vent : </span>
                    <strong className="text-white">{city.windSpeedKmh} km/h</strong>
                  </div>
                  <div className="rounded-lg bg-slate-950 p-2">
                    <span>Humidité : </span>
                    <strong className="text-white">{city.humidityPct}%</strong>
                  </div>
                  <div className="rounded-lg bg-slate-950 p-2">
                    <span>Pression : </span>
                    <strong className="text-white">{city.pressureHpa} hPa</strong>
                  </div>
                  <div className="rounded-lg bg-slate-950 p-2">
                    <span>Anomalie : </span>
                    <strong className={city.climateAnomalyC > 0 ? 'text-rose-400' : 'text-blue-400'}>
                      {city.climateAnomalyC > 0 ? `+${city.climateAnomalyC}` : city.climateAnomalyC}°C
                    </strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CRYOSPHERE & POLAR SEA ICE */}
      {activeTab === 'cryosphere' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-cyan-500/30 bg-slate-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                  Cryosphère & Bilan Glaciaire Global
                </span>
                <h3 className="text-2xl font-black text-white mt-1">
                  Observatoire des Banquises Arctique & Antarctique
                </h3>
              </div>

              <div className="rounded-2xl bg-slate-950 border border-slate-800 px-4 py-2 text-right">
                <span className="text-[10px] text-slate-400 block font-semibold">Vortex Polaire Stratosphérique</span>
                <span className="text-xs font-black text-cyan-300">
                  {data.cryosphere.polarVortexStrengthIndex}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-2xl bg-slate-950 border border-slate-800 p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-300 uppercase">Banquise Arctique (Nord)</span>
                  <Snowflake className="h-4 w-4 text-cyan-400" />
                </div>
                <div className="text-3xl font-black text-white mt-2">
                  {data.cryosphere.arcticSeaIceExtentMillionKm2} M km²
                </div>
                <div className="text-xs font-bold text-rose-400">
                  {data.cryosphere.arcticAnomalyPct}% sous la normale 1981-2010
                </div>
                <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                  Période de fonte estivale : recul marqué dans les mers de Beaufort et des Tchouktches.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-950 border border-slate-800 p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-300 uppercase">Banquise Antarctique (Sud)</span>
                  <Waves className="h-4 w-4 text-blue-400" />
                </div>
                <div className="text-3xl font-black text-white mt-2">
                  {data.cryosphere.antarcticSeaIceExtentMillionKm2} M km²
                </div>
                <div className="text-xs font-bold text-rose-400">
                  {data.cryosphere.antarcticAnomalyPct}% sous la normale 1981-2010
                </div>
                <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                  Période d'englacement hivernal austral avec anomalies négatives dans la mer de Weddell.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-950 border border-slate-800 p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-300 uppercase">Calotte du Groenland</span>
                  <Mountain className="h-4 w-4 text-purple-400" />
                </div>
                <div className="text-3xl font-black text-white mt-2">
                  {(data.cryosphere.greenlandMeltSurfaceKm2 / 1000).toFixed(0)}k km²
                </div>
                <div className="text-xs font-bold text-amber-400">
                  Surface en fonte active diurne
                </div>
                <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                  Pics de fonte sous l'effet des advections douces subtropicales atlantiques.
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-indigo-950/30 border border-indigo-500/30 p-5 space-y-2">
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider block">
                Synthèse Glaciologique & Téléconnexions Polaires :
              </span>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                {data.cryosphere.cryosphereSynthesis}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PLANETARY SYNOPTIC SYNTHESIS */}
      {activeTab === 'synthesis' && (
        <div className="rounded-3xl border border-purple-500/30 bg-slate-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
            <Activity className="h-6 w-6 text-purple-400" />
            <div>
              <h3 className="text-2xl font-black text-white">
                Synthèse Météorologique & Synoptique Planétaire
              </h3>
              <p className="text-xs text-slate-400">
                Couplage des téléconnexions mondiales (ENSO El Niño, MJO, QBO, NAO, Jet-Streams)
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-950 border border-slate-800 p-6 space-y-4">
            <p className="text-sm text-slate-200 leading-relaxed">
              {data.planetaryExecutiveSynthesis}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
