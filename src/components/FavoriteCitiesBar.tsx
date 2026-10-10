import React, { useState, useEffect } from 'react';
import { Star, Plus, X } from 'lucide-react';
import { LocationPoint, CurrentWeather } from '../types/weather';
import { FRENCH_STATIONS } from '../data/frenchStations';
import { DynamicSkyHeroArt } from './DynamicSkyHeroArt';

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
    const val = Math.round(celsius);
    return `${val > 0 ? `+${val}` : val}°C`;
  };

  return (
    <div className="rounded-xl border border-slate-800/80 bg-slate-950/55 px-3 py-2">
      <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 shrink-0 pr-3 border-r border-slate-800">
          <span className="text-xs font-semibold text-slate-300 whitespace-nowrap hidden sm:inline">
            Stations favorites
          </span>

          <button
            type="button"
            onClick={toggleCurrentStationFavorite}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer whitespace-nowrap shrink-0 ${
              isCurrentFavorite
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25'
                : 'bg-slate-900 border-slate-700 text-slate-200 hover:border-sky-500/50 hover:text-sky-300'
            }`}
            title={
              isCurrentFavorite
                ? `Retirer ${currentStation.name} de vos favoris`
                : `Épingler ${currentStation.name} dans vos favoris`
            }
          >
            <Star
              className={`h-3.5 w-3.5 ${
                isCurrentFavorite ? 'fill-amber-400 text-amber-400' : 'text-slate-400'
              }`}
            />
            <span>
              {isCurrentFavorite ? 'Épinglée' : `Épingler ${currentStation.name.split(' ')[0]}`}
            </span>
          </button>
        </div>

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

            return (
              <div
                key={fav.id}
                onClick={() => onSelectStation(fav)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') onSelectStation(fav);
                }}
                className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs transition shrink-0 cursor-pointer select-none ${
                  isSelected
                    ? 'bg-sky-600/20 border-sky-400/60 text-white shadow-sm'
                    : 'bg-slate-950/60 border-slate-800/90 hover:border-slate-700 text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                <DynamicSkyHeroArt
                  weatherCode={snap?.weatherCode ?? 1}
                  isDay={snap?.isDay ?? true}
                  size="xs"
                  className="-m-1"
                />
                <span className="font-semibold truncate max-w-[115px]">{fav.name}</span>
                {snap !== undefined && (
                  <span
                    className={`font-bold font-mono tabular-nums text-xs ${
                      isSelected ? 'text-sky-300' : 'text-amber-300'
                    }`}
                  >
                    {formatTemp(snap.tempC)}
                  </span>
                )}
                {favorites.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => removeFavorite(e, fav.id)}
                    className="opacity-50 group-hover:opacity-100 hover:text-rose-400 p-0.5 rounded transition cursor-pointer"
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
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-slate-700 hover:border-sky-400/60 bg-slate-950/40 text-slate-400 hover:text-sky-300 text-xs font-medium shrink-0 transition cursor-pointer whitespace-nowrap"
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
