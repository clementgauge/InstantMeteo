import React, { useState, useEffect } from 'react';
import { Star, Plus, X, MapPin, Sparkles } from 'lucide-react';
import { LocationPoint, CurrentWeather } from '../types/weather';
import { FRENCH_STATIONS } from '../data/frenchStations';
import { getRichWeatherInfo } from '../utils/weatherIcons';

interface FavoriteCitiesBarProps {
  currentStation: LocationPoint;
  currentWeather: CurrentWeather | null;
  tempUnit: 'C' | 'F';
  onSelectStation: (station: LocationPoint) => void;
  onOpenSearchModal?: () => void;
}

interface FavoriteCityQuickSnap {
  tempC: number;
  weatherCode: number;
  isDay: boolean;
}

const STORAGE_KEY = 'instant_meteo_favorite_stations_v1';

const DEFAULT_FAVORITES: LocationPoint[] = [
  FRENCH_STATIONS.find((s) => s.name.toLowerCase().includes('paris')) || FRENCH_STATIONS[0],
  FRENCH_STATIONS.find((s) => s.name.toLowerCase().includes('lyon')) || FRENCH_STATIONS[1],
  FRENCH_STATIONS.find((s) => s.name.toLowerCase().includes('marseille')) || FRENCH_STATIONS[2],
  FRENCH_STATIONS.find((s) => s.name.toLowerCase().includes('bordeaux')) || FRENCH_STATIONS[3],
  FRENCH_STATIONS.find((s) => s.name.toLowerCase().includes('chamonix')) || FRENCH_STATIONS[4]
].filter(Boolean);

export const FavoriteCitiesBar: React.FC<FavoriteCitiesBarProps> = ({
  currentStation,
  currentWeather,
  tempUnit,
  onSelectStation,
  onOpenSearchModal
}) => {
  const [favorites, setFavorites] = useState<LocationPoint[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}
    return DEFAULT_FAVORITES.slice(0, 5);
  });

  const [quickSnaps, setQuickSnaps] = useState<Record<string, FavoriteCityQuickSnap>>({});

  const saveFavorites = (next: LocationPoint[]) => {
    setFavorites(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new CustomEvent('instant_meteo_favorites_updated'));
    } catch {}
  };

  const isCurrentFavorite = favorites.some(
    (f) =>
      f.id === currentStation.id ||
      (Math.abs(f.latitude - currentStation.latitude) < 0.01 &&
        Math.abs(f.longitude - currentStation.longitude) < 0.01)
  );

  const toggleCurrentStationFavorite = () => {
    if (isCurrentFavorite) {
      const next = favorites.filter(
        (f) =>
          f.id !== currentStation.id &&
          !(
            Math.abs(f.latitude - currentStation.latitude) < 0.01 &&
            Math.abs(f.longitude - currentStation.longitude) < 0.01
          )
      );
      saveFavorites(next);
    } else {
      const next = [currentStation, ...favorites.slice(0, 9)];
      saveFavorites(next);
    }
  };

  const removeFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const next = favorites.filter((f) => f.id !== id);
    saveFavorites(next);
  };

  // Sync current station live weather into quickSnaps immediately
  useEffect(() => {
    if (currentStation && currentWeather) {
      setQuickSnaps((prev) => ({
        ...prev,
        [currentStation.id]: {
          tempC: currentWeather.temperature,
          weatherCode: currentWeather.weatherCode,
          isDay: currentWeather.isDay ?? true
        }
      }));
    }
  }, [currentStation, currentWeather]);

  // Lightweight background fetch for favorite cities' live temperatures
  useEffect(() => {
    let cancelled = false;
    const fetchMissingSnaps = async () => {
      for (const fav of favorites) {
        if (fav.id === currentStation.id) continue;
        try {
          const url = `https://api.open-meteo.com/v1/forecast?latitude=${fav.latitude}&longitude=${fav.longitude}&current=temperature_2m,weather_code,is_day&timezone=auto`;
          const res = await fetch(url);
          if (!res.ok) continue;
          const data = await res.json();
          if (!cancelled && data?.current) {
            setQuickSnaps((prev) => ({
              ...prev,
              [fav.id]: {
                tempC: Math.round(data.current.temperature_2m * 10) / 10,
                weatherCode: data.current.weather_code ?? 0,
                isDay: data.current.is_day === 1
              }
            }));
          }
        } catch {}
      }
    };
    fetchMissingSnaps();
    return () => {
      cancelled = true;
    };
  }, [favorites.length]);

  const formatTemp = (celsius: number) => {
    if (tempUnit === 'F') {
      return `${Math.round((celsius * 9) / 5 + 32)}°F`;
    }
    return `${Math.round(celsius)}°C`;
  };

  return (
    <div className="rounded-2xl border border-slate-800/90 bg-slate-900/90 backdrop-blur-md px-3 py-2 shadow-lg">
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        {/* Label & Pin Current City Button */}
        <div className="flex items-center gap-1.5 shrink-0 pr-2 border-r border-slate-800">
          <div className="flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-amber-400">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="hidden sm:inline">Villes Favorites</span>
          </div>

          <button
            type="button"
            onClick={toggleCurrentStationFavorite}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold border transition cursor-pointer active:scale-95 ${
              isCurrentFavorite
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30'
                : 'bg-sky-500/15 border-sky-500/40 text-sky-300 hover:bg-sky-500/25'
            }`}
            title={
              isCurrentFavorite
                ? `Retirer ${currentStation.name} de vos villes favorites`
                : `Épingler ${currentStation.name} dans vos villes favorites`
            }
          >
            <Star
              className={`h-3 w-3 ${
                isCurrentFavorite ? 'fill-amber-400 text-amber-400' : 'text-sky-400'
              }`}
            />
            <span>
              {isCurrentFavorite ? 'Épinglée' : `+ Épingler ${currentStation.name.split(' ')[0]}`}
            </span>
          </button>
        </div>

        {/* Favorites Pills */}
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          {favorites.map((fav) => {
            const isSelected =
              fav.id === currentStation.id ||
              (Math.abs(fav.latitude - currentStation.latitude) < 0.01 &&
                Math.abs(fav.longitude - currentStation.longitude) < 0.01);
            const snap =
              isSelected && currentWeather
                ? {
                    tempC: currentWeather.temperature,
                    weatherCode: currentWeather.weatherCode,
                    isDay: currentWeather.isDay ?? true
                  }
                : quickSnaps[fav.id];
            const info = getRichWeatherInfo(snap?.weatherCode ?? 1, snap?.isDay ?? true);

            return (
              <div
                key={fav.id}
                onClick={() => onSelectStation(fav)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') onSelectStation(fav);
                }}
                className={`group flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs transition shrink-0 cursor-pointer select-none ${
                  isSelected
                    ? 'bg-blue-600/25 border-blue-400/60 text-white shadow-sm ring-1 ring-blue-400/30'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <span className="text-sm leading-none" aria-hidden="true">
                  {info.emoji}
                </span>
                <span className="font-bold truncate max-w-[115px]">{fav.name}</span>
                {snap !== undefined && (
                  <span
                    className={`font-black tabular-nums px-1.5 py-0.5 rounded-md text-[11px] ${
                      isSelected
                        ? 'bg-blue-500/30 text-blue-200'
                        : 'bg-slate-900 text-amber-300 border border-slate-800'
                    }`}
                  >
                    {formatTemp(snap.tempC)}
                  </span>
                )}
                {favorites.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => removeFavorite(e, fav.id)}
                    className="opacity-60 group-hover:opacity-100 hover:text-rose-400 p-0.5 rounded transition cursor-pointer"
                    title={`Retirer ${fav.name} des favoris`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            );
          })}

          {onOpenSearchModal && (
            <button
              type="button"
              onClick={onOpenSearchModal}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-dashed border-slate-700 hover:border-sky-400/60 bg-slate-950/50 text-slate-400 hover:text-sky-300 text-xs font-semibold shrink-0 transition cursor-pointer"
              title="Rechercher une autre ville en France ou dans le monde"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Ajouter une ville</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
