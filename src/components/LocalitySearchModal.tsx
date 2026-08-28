import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Search, 
  MapPin, 
  Compass, 
  Mountain, 
  Globe2, 
  Palmtree, 
  Waves, 
  Loader2, 
  Check, 
  History, 
  TrendingUp, 
  Sliders,
  Sparkles
} from 'lucide-react';
import { LocationPoint } from '../types/weather';
import { searchLocalities, getLocalityFromCoordinates } from '../services/openMeteoService';
import { FRENCH_STATIONS } from '../data/frenchStations';
import { WORLD_STATIONS } from '../data/worldStations';

interface LocalitySearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStation: LocationPoint;
  onSelectStation: (station: LocationPoint) => void;
  seniorMode: boolean;
}

type FilterCategory = 'ALL' | 'FRANCE' | 'MOUNTAIN' | 'WORLD' | 'DOMTOM' | 'COASTAL';

export const LocalitySearchModal: React.FC<LocalitySearchModalProps> = ({
  isOpen,
  onClose,
  currentStation,
  onSelectStation,
  seniorMode
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<LocationPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [category, setCategory] = useState<FilterCategory>('ALL');
  const [gpsLoading, setGpsLoading] = useState(false);
  const [recentLocations, setRecentLocations] = useState<LocationPoint[]>([]);
  
  // Custom manual coordinate input state
  const [showCustomCoords, setShowCustomCoords] = useState(false);
  const [customLat, setCustomLat] = useState('45.832');
  const [customLon, setCustomLon] = useState('6.865');
  const [customAlt, setCustomAlt] = useState('4809');
  const [customName, setCustomName] = useState('Point Personnalisé');

  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('climafrance_recent_localities');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const seen = new Set<string>();
          const deduped = parsed.filter((item: LocationPoint) => {
            if (!item || !item.id || seen.has(item.id)) return false;
            seen.add(item.id);
            return true;
          });
          setRecentLocations(deduped);
        }
      }
    } catch (e) {
      console.warn(e);
    }
  }, []);

  // Save to recent
  const saveToRecent = (loc: LocationPoint) => {
    try {
      const updated = [loc, ...recentLocations.filter(r => r.id !== loc.id && r.name !== loc.name)].slice(0, 10);
      setRecentLocations(updated);
      localStorage.setItem('climafrance_recent_localities', JSON.stringify(updated));
      localStorage.setItem('instant_meteo_last_station', JSON.stringify(loc));
      localStorage.setItem('climafrance_last_selected_locality', JSON.stringify(loc));
    } catch (e) {
      console.warn(e);
    }
  };

  // Focus on input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      performSearch(searchQuery);
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(searchQuery);
    }, 280);
    return () => clearTimeout(timer);
  }, [searchQuery, category]);

  const performSearch = async (query: string) => {
    setIsLoading(true);
    try {
      let data: LocationPoint[] = [];
      const trimmed = query.trim().toLowerCase();
      if (!trimmed) {
        if (category === 'WORLD') {
          data = [...WORLD_STATIONS];
        } else {
          data = [...FRENCH_STATIONS, ...WORLD_STATIONS];
        }
      } else {
        const localMatches = [...FRENCH_STATIONS, ...WORLD_STATIONS].filter(s => 
          s.name.toLowerCase().includes(trimmed) || 
          s.department.toLowerCase().includes(trimmed) ||
          (s.region && s.region.toLowerCase().includes(trimmed)) ||
          (s.country && s.country.toLowerCase().includes(trimmed))
        );
        const remoteMatches = await searchLocalities(query);
        data = [...localMatches, ...remoteMatches];
      }

      // Filter by category
      if (category === 'MOUNTAIN') {
        data = data.filter(d => (d.altitude ?? 0) >= 800 || d.isMountain);
      } else if (category === 'FRANCE') {
        data = data.filter(d => d.isFrench || d.country === 'France');
      } else if (category === 'WORLD') {
        data = data.filter(d => d.isWorldLocation || (d.country && d.country !== 'France'));
      } else if (category === 'DOMTOM') {
        data = data.filter(d => d.department.includes('97') || d.department.includes('98'));
      } else if (category === 'COASTAL') {
        data = data.filter(d => (d.altitude ?? 0) <= 50);
      }

      // Deduplicate results by unique ID
      const seenIds = new Set<string>();
      const deduplicated = data.filter(item => {
        if (seenIds.has(item.id)) {
          return false;
        }
        seenIds.add(item.id);
        return true;
      });

      setResults(deduplicated);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (loc: LocationPoint) => {
    saveToRecent(loc);
    onSelectStation(loc);
    onClose();
  };

  const handleUseGps = () => {
    if (!navigator.geolocation) {
      alert("La géolocalisation n'est pas supportée par votre navigateur.");
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const point = await getLocalityFromCoordinates(lat, lon);
          handleSelect(point);
        } catch (e) {
          console.error(e);
        } finally {
          setGpsLoading(false);
        }
      },
      (err) => {
        console.warn(err);
        setGpsLoading(false);
        alert("Impossible de récupérer la position GPS. Vérifiez les autorisations.");
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleApplyCustomCoords = () => {
    const lat = parseFloat(customLat);
    const lon = parseFloat(customLon);
    const alt = parseInt(customAlt, 10) || 0;
    if (isNaN(lat) || isNaN(lon)) {
      alert("Veuillez saisir des coordonnées valides.");
      return;
    }
    const customPoint: LocationPoint = {
      id: `custom-${Date.now()}`,
      name: customName || `Point (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`,
      department: "Coordonnées personnalisées",
      region: `Altitude ${alt} m`,
      country: "Personnalisé",
      latitude: lat,
      longitude: lon,
      altitude: alt,
      climateZone: alt >= 1500 ? "Montagnard d'altitude" : "Plaine",
      allTimeRecordMax: alt > 2000 ? 25.0 : 41.0,
      allTimeRecordMin: alt > 2000 ? -35.0 : -20.0,
      allTimeRecordRain24h: 120.0,
      isMountain: alt >= 800,
      isHighAltitude: alt >= 1500
    };
    handleSelect(customPoint);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-4 backdrop-blur-md">
      <div
        id="locality-search-modal"
        className="relative flex max-h-[92vh] w-full max-w-4xl flex-col rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Globe2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className={`font-black text-white ${seniorMode ? 'text-2xl' : 'text-lg'}`}>
                Recherche de Localités (France & Monde)
              </h2>
              <p className="text-xs text-slate-400">
                Accédez à toutes les 35 000 communes françaises, sommets & villes du monde à toute altitude
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-slate-800 p-2 text-slate-400 hover:bg-slate-700 hover:text-white transition"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search Bar & GPS Button */}
        <div className="p-4 sm:p-6 bg-slate-900 border-b border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                ref={inputRef}
                type="text"
                id="locality-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tapez un nom de ville, village, code postal (74400), sommet (Mont Blanc, Everest)..."
                className={`w-full rounded-2xl border border-slate-700 bg-slate-950 pl-11 pr-10 text-white placeholder-slate-500 shadow-inner focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
                  seniorMode ? 'py-3.5 text-base' : 'py-3 text-sm'
                }`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* GPS Geolocation Button */}
            <button
              onClick={handleUseGps}
              disabled={gpsLoading}
              title="Obtenir la météo de ma position actuelle"
              className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-xs sm:text-sm font-bold text-white shadow-lg shadow-blue-600/30 hover:from-blue-500 hover:to-indigo-500 transition active:scale-95 disabled:opacity-50 shrink-0"
            >
              {gpsLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Compass className="h-4 w-4 text-blue-200" />
              )}
              <span>Position GPS</span>
            </button>

            {/* Custom Coordinates toggle */}
            <button
              onClick={() => setShowCustomCoords(!showCustomCoords)}
              title="Saisir des coordonnées personnalisées"
              className={`flex items-center justify-center gap-1.5 rounded-2xl border px-3 py-3 text-xs font-bold transition shrink-0 ${
                showCustomCoords 
                  ? 'border-amber-500 bg-amber-500/20 text-amber-300' 
                  : 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Sliders className="h-4 w-4" />
              <span className="hidden md:inline">Coordonnées</span>
            </button>
          </div>

          {/* Custom Coordinate Panel */}
          {showCustomCoords && (
            <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4 text-amber-200 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                <Sliders className="h-4 w-4" />
                <span>Saisie directe des coordonnées & altitude exacte :</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <input
                  type="text"
                  placeholder="Nom du lieu"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white"
                />
                <input
                  type="text"
                  placeholder="Latitude (ex: 45.832)"
                  value={customLat}
                  onChange={(e) => setCustomLat(e.target.value)}
                  className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white"
                />
                <input
                  type="text"
                  placeholder="Longitude (ex: 6.865)"
                  value={customLon}
                  onChange={(e) => setCustomLon(e.target.value)}
                  className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white"
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Altitude m (ex: 4809)"
                    value={customAlt}
                    onChange={(e) => setCustomAlt(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white"
                  />
                  <button
                    onClick={handleApplyCustomCoords}
                    className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 transition"
                  >
                    Valider
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Quick Filter Categories */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 overflow-x-auto pb-1">
            <button
              onClick={() => setCategory('ALL')}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                category === 'ALL'
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Tous</span>
            </button>
            <button
              onClick={() => setCategory('FRANCE')}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                category === 'FRANCE'
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>🇫🇷 France Métropolitaine</span>
            </button>
            <button
              onClick={() => setCategory('MOUNTAIN')}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                category === 'MOUNTAIN'
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Mountain className="h-3.5 w-3.5 text-amber-400" />
              <span>🏔️ Montagne & Altitude (&gt; 800m)</span>
            </button>
            <button
              onClick={() => setCategory('WORLD')}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                category === 'WORLD'
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Globe2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>🌍 Monde Entier</span>
            </button>
            <button
              onClick={() => setCategory('DOMTOM')}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                category === 'DOMTOM'
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Palmtree className="h-3.5 w-3.5 text-teal-400" />
              <span>🌴 Outre-Mer (DOM-TOM)</span>
            </button>
            <button
              onClick={() => setCategory('COASTAL')}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                category === 'COASTAL'
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Waves className="h-3.5 w-3.5 text-cyan-400" />
              <span>🌊 Littoral & Plaines</span>
            </button>
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Recent Searches */}
          {!searchQuery && recentLocations.length > 0 && category === 'ALL' && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                <History className="h-4 w-4 text-blue-400" />
                <span>Dernières localités consultées :</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {recentLocations.map((loc) => (
                  <button
                    key={`recent-${loc.id}`}
                    onClick={() => handleSelect(loc)}
                    className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-800/60 p-3 text-left hover:border-blue-500 hover:bg-slate-800 transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <MapPin className="h-4 w-4 text-blue-400 shrink-0" />
                      <div>
                        <div className="font-bold text-white text-sm">{loc.name}</div>
                        <div className="text-xs text-slate-400">{loc.department}</div>
                      </div>
                    </div>
                    <span className="rounded-lg bg-slate-900 px-2 py-0.5 text-xs font-bold text-slate-300 border border-slate-700">
                      {loc.altitude} m
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results Header */}
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 pt-2 border-t border-slate-800">
            <span>
              {isLoading ? 'Recherche en cours...' : `${results.length} localité(s) trouvée(s)`}
            </span>
            {isLoading && <Loader2 className="h-4 w-4 animate-spin text-blue-400" />}
          </div>

          {/* Location Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {results.map((loc) => {
              const isSelected = loc.id === currentStation.id;
              const isHigh = (loc.altitude ?? 0) >= 1500;
              const isMountain = (loc.altitude ?? 0) >= 800;

              return (
                <button
                  key={loc.id}
                  onClick={() => handleSelect(loc)}
                  className={`flex items-start justify-between rounded-2xl border p-3.5 text-left transition group ${
                    isSelected
                      ? 'border-blue-500 bg-blue-600/20 shadow-lg shadow-blue-500/10'
                      : 'border-slate-800 bg-slate-950/60 hover:border-blue-500 hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-bold text-sm ${
                        isHigh
                          ? 'bg-purple-900/40 text-purple-300 border border-purple-700/50'
                          : isMountain
                          ? 'bg-amber-900/40 text-amber-300 border border-amber-700/50'
                          : 'bg-blue-900/40 text-blue-300 border border-blue-700/50'
                      }`}
                    >
                      {isHigh ? '🗻' : isMountain ? '🏔️' : '📍'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-white ${seniorMode ? 'text-base' : 'text-sm'}`}>
                          {loc.name}
                        </span>
                        {isSelected && <Check className="h-4 w-4 text-blue-400" />}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {loc.department} {loc.region && loc.region !== loc.department ? `• ${loc.region}` : ''}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px]">
                        <span
                          className={`rounded px-1.5 py-0.5 font-bold ${
                            isHigh
                              ? 'bg-purple-950 text-purple-300 border border-purple-800'
                              : isMountain
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          Alt : {loc.altitude.toLocaleString('fr-FR')} m
                        </span>
                        <span className="text-slate-500 text-[10px]">
                          ({loc.latitude.toFixed(2)}°, {loc.longitude.toFixed(2)}°)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-semibold text-blue-400 opacity-0 group-hover:opacity-100 transition">
                      Choisir →
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {results.length === 0 && !isLoading && (
            <div className="py-12 text-center text-slate-400 space-y-3">
              <Mountain className="h-12 w-12 mx-auto text-slate-600" />
              <p className="text-sm font-semibold">
                Aucune localité trouvée pour « {searchQuery} »
              </p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Essayez d'orthographier le nom sans accents ou utilisez le bouton <strong>Position GPS</strong> pour détecter automatiquement votre lieu.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 bg-slate-950 px-6 py-3 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-2">
          <span>
            Station active : <strong className="text-white">{currentStation.name}</strong> ({currentStation.altitude} m)
          </span>
          <span className="text-blue-400">
            Données Open-Meteo & Météo France certifiées
          </span>
        </div>
      </div>
    </div>
  );
};
