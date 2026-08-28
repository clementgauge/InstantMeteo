import React, { useState, useEffect } from 'react';
import { LocationPoint, CurrentWeather } from '../types/weather';
import { FRENCH_STATIONS } from '../data/frenchStations';
import { fetchWeatherData, searchLocalities } from '../services/openMeteoService';
import { generateFourWeekTrends } from '../services/fourWeekTrendsService';
import { 
  X, 
  Plus, 
  ArrowRightLeft, 
  MapPin, 
  Thermometer, 
  Wind, 
  Droplets, 
  Sun, 
  Mountain, 
  TrendingUp, 
  Trash2,
  Calendar,
  Sparkles
} from 'lucide-react';

interface MultiStationComparatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  baseStation: LocationPoint;
  seniorMode: boolean;
}

interface StationComparisonItem {
  station: LocationPoint;
  weather?: CurrentWeather;
  loading: boolean;
}

export const MultiStationComparatorModal: React.FC<MultiStationComparatorModalProps> = ({
  isOpen,
  onClose,
  baseStation,
  seniorMode
}) => {
  const [selectedStations, setSelectedStations] = useState<LocationPoint[]>([
    baseStation,
    FRENCH_STATIONS.find(s => s.id === 'nice') || FRENCH_STATIONS[1],
    FRENCH_STATIONS.find(s => s.id === 'chamonix-aiguille-midi') || FRENCH_STATIONS[4]
  ]);

  const [stationsData, setStationsData] = useState<StationComparisonItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<LocationPoint[]>([]);

  // Fetch weather for all selected stations
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const loadAll = async () => {
      const initial: StationComparisonItem[] = selectedStations.map(s => ({
        station: s,
        loading: true
      }));
      setStationsData(initial);

      const results = await Promise.all(
        selectedStations.map(async (s) => {
          try {
            const data = await fetchWeatherData(s);
            return { station: s, weather: data.current, loading: false };
          } catch (e) {
            return { station: s, loading: false };
          }
        })
      );

      if (isMounted) {
        setStationsData(results);
      }
    };

    loadAll();
    return () => { isMounted = false; };
  }, [isOpen, selectedStations]);

  if (!isOpen) return null;

  const handleAddStation = (st: LocationPoint) => {
    if (selectedStations.some(s => s.id === st.id)) return;
    if (selectedStations.length >= 3) {
      setSelectedStations([selectedStations[0], selectedStations[1], st]);
    } else {
      setSelectedStations([...selectedStations, st]);
    }
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleRemoveStation = (id: string) => {
    if (selectedStations.length <= 1) return;
    setSelectedStations(selectedStations.filter(s => s.id !== id));
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length >= 2) {
      const res = await searchLocalities(query);
      setSearchResults(res.slice(0, 5));
    } else {
      setSearchResults([]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl p-6 sm:p-8 my-8 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-5 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <ArrowRightLeft className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Comparateur Multi-Localités & Sommets
              </h2>
              <p className="text-xs text-slate-400">
                Comparez jusqu'à 3 localités en direct : météo actuelle, altitude, confort et tendances à 4 semaines
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-2xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Add Station Bar */}
        <div className="relative mb-6">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Ajouter une commune, station ou sommet au comparateur..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="flex-1 rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Search suggestions */}
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 rounded-2xl border border-slate-700 bg-slate-950 p-2 shadow-2xl z-20">
              {searchResults.map((st) => (
                <button
                  key={st.id}
                  onClick={() => handleAddStation(st)}
                  className="w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs hover:bg-slate-800 transition"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-blue-400" />
                    <div>
                      <div className="font-bold text-white">{st.name}</div>
                      <div className="text-[10px] text-slate-400">{st.department}</div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-blue-300">{st.altitude} m</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Side-by-Side Comparison Grid */}
        <div className={`grid grid-cols-1 md:grid-cols-${Math.min(3, stationsData.length)} gap-5`}>
          {stationsData.map(({ station, weather, loading }) => {
            const isMountain = (station.altitude ?? 0) >= 800;
            const trend = generateFourWeekTrends(station, weather?.temperature);

            return (
              <div
                key={station.id}
                className="rounded-3xl border border-slate-800 bg-slate-950 p-6 flex flex-col justify-between relative shadow-xl"
              >
                {/* Station Title & Remove Button */}
                <div>
                  <div className="flex items-start justify-between gap-2 border-b border-slate-800/80 pb-4 mb-4">
                    <div>
                      <div className="flex items-center gap-1.5 text-blue-400 text-[10px] font-bold uppercase tracking-wider">
                        {isMountain ? <Mountain className="h-3.5 w-3.5 text-amber-400" /> : <MapPin className="h-3.5 w-3.5" />}
                        <span>{station.department}</span>
                      </div>
                      <h3 className="text-lg font-black text-white mt-0.5">{station.name}</h3>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Altitude : <strong className="text-blue-300">{station.altitude} m</strong>
                      </div>
                    </div>

                    {stationsData.length > 1 && (
                      <button
                        onClick={() => handleRemoveStation(station.id)}
                        className="rounded-xl p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-900 transition"
                        title="Retirer du comparateur"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Temperature & Live Conditions */}
                  {loading ? (
                    <div className="py-8 text-center text-xs text-slate-400 animate-pulse">
                      Chargement des métriques...
                    </div>
                  ) : weather ? (
                    <div className="space-y-4">
                      <div className="flex items-baseline justify-between">
                        <div>
                          <div className="text-4xl font-black text-white">{weather.temperature}°C</div>
                          <div className="text-xs text-slate-400">Ressenti : {weather.feelsLike}°C</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-bold text-slate-300">{weather.weatherDescription}</div>
                          <div className="text-[11px] text-slate-400">Min: {weather.tempMin}° / Max: {weather.tempMax}°</div>
                        </div>
                      </div>

                      {/* Detail list */}
                      <div className="rounded-2xl bg-slate-900/80 p-3 border border-slate-800 space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Vent & Rafales :</span>
                          <span className="font-bold text-white">{weather.windSpeed} km/h (raf. {weather.windGust})</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Indice UV réel :</span>
                          <span className="font-bold text-amber-400">{weather.uvIndex}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Qualité de l'air :</span>
                          <span className="font-bold text-emerald-400">{weather.airQualityLabel}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Pression locale (QFE) :</span>
                          <span className="font-bold text-slate-300">{weather.pressure} hPa</span>
                        </div>
                      </div>

                      {/* 4-Week Outlook Snapshot */}
                      <div className="rounded-2xl bg-blue-950/30 p-3 border border-blue-500/20">
                        <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Tendance 4 Semaines (S1-S4)</span>
                        </div>
                        <div className="text-xs font-bold text-white">
                          Anomalie moyenne : <span className={trend.scenarios.median.tempAnomaly > 0 ? 'text-amber-400' : 'text-cyan-400'}>
                            {trend.scenarios.median.tempAnomaly > 0 ? '+' : ''}{trend.scenarios.median.tempAnomaly}°C
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-300 mt-1 line-clamp-2">
                          {trend.overallMonthTrend}
                        </p>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
