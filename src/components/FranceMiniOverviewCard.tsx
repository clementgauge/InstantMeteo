import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { 
  Compass, 
  RotateCcw,
  Maximize2
} from 'lucide-react';
import { LocationPoint } from '../types/weather';
import { FRENCH_STATIONS } from '../data/frenchStations';

interface FranceMiniOverviewCardProps {
  currentStation: LocationPoint;
  onSelectStation?: (station: LocationPoint) => void;
  tempUnit?: 'C' | 'F';
  onNavigateTab?: (tab: string) => void;
  onOpenSearchModal?: () => void;
}

interface RegionWeather {
  id: string;
  name: string;
  capitalStationId: string;
  lat: number;
  lon: number;
  currentCode: number;
  afternoonCode: number;
  tomorrowCode: number;
  currentTemp: number;
  afternoonTemp: number;
  tomorrowTemp: number;
}

// The 13 Metropolitan Regions of France with representative centroid coordinates
const FRANCE_REGIONS: RegionWeather[] = [
  { id: 'hdf', name: 'Hauts-de-France', capitalStationId: 'lille-lesquin', lat: 50.15, lon: 2.80, currentCode: 1, afternoonCode: 2, tomorrowCode: 1, currentTemp: 17, afternoonTemp: 19, tomorrowTemp: 18 },
  { id: 'nor', name: 'Normandie', capitalStationId: 'caen-carpiquet', lat: 49.18, lon: 0.15, currentCode: 2, afternoonCode: 2, tomorrowCode: 1, currentTemp: 18, afternoonTemp: 20, tomorrowTemp: 19 },
  { id: 'idf', name: 'Île-de-France', capitalStationId: 'paris-montsouris', lat: 48.72, lon: 2.45, currentCode: 0, afternoonCode: 1, tomorrowCode: 0, currentTemp: 21, afternoonTemp: 23, tomorrowTemp: 22 },
  { id: 'ges', name: 'Grand Est', capitalStationId: 'strasbourg-entzheim', lat: 48.70, lon: 5.50, currentCode: 1, afternoonCode: 1, tomorrowCode: 2, currentTemp: 20, afternoonTemp: 22, tomorrowTemp: 21 },
  { id: 'bre', name: 'Bretagne', capitalStationId: 'rennes-saint-jacques', lat: 48.15, lon: -2.80, currentCode: 2, afternoonCode: 3, tomorrowCode: 2, currentTemp: 17, afternoonTemp: 19, tomorrowTemp: 18 },
  { id: 'pdl', name: 'Pays de la Loire', capitalStationId: 'nantes-atlantique', lat: 47.45, lon: -0.65, currentCode: 0, afternoonCode: 1, tomorrowCode: 0, currentTemp: 20, afternoonTemp: 22, tomorrowTemp: 21 },
  { id: 'cvl', name: 'Centre-Val de Loire', capitalStationId: 'bourges', lat: 47.50, lon: 1.75, currentCode: 0, afternoonCode: 1, tomorrowCode: 0, currentTemp: 21, afternoonTemp: 23, tomorrowTemp: 22 },
  { id: 'bfc', name: 'Bourgogne-Franche-Comté', capitalStationId: 'dijon-longvic', lat: 47.10, lon: 4.80, currentCode: 0, afternoonCode: 1, tomorrowCode: 1, currentTemp: 20, afternoonTemp: 22, tomorrowTemp: 21 },
  { id: 'ara', name: 'Auvergne-Rhône-Alpes', capitalStationId: 'lyon-bron', lat: 45.45, lon: 4.30, currentCode: 0, afternoonCode: 0, tomorrowCode: 1, currentTemp: 23, afternoonTemp: 25, tomorrowTemp: 24 },
  { id: 'naq', name: 'Nouvelle-Aquitaine', capitalStationId: 'bordeaux-merignac', lat: 45.30, lon: 0.10, currentCode: 0, afternoonCode: 0, tomorrowCode: 0, currentTemp: 23, afternoonTemp: 25, tomorrowTemp: 24 },
  { id: 'occ', name: 'Occitanie', capitalStationId: 'toulouse-blagnac', lat: 43.60, lon: 2.10, currentCode: 0, afternoonCode: 0, tomorrowCode: 0, currentTemp: 24, afternoonTemp: 26, tomorrowTemp: 25 },
  { id: 'pac', name: "Provence-Alpes-Côte d'Azur", capitalStationId: 'marseille-marignane', lat: 43.90, lon: 6.00, currentCode: 0, afternoonCode: 0, tomorrowCode: 0, currentTemp: 25, afternoonTemp: 27, tomorrowTemp: 26 },
  { id: 'cor', name: 'Corse', capitalStationId: 'ajaccio-campo-dell-oro', lat: 42.15, lon: 9.10, currentCode: 0, afternoonCode: 0, tomorrowCode: 0, currentTemp: 24, afternoonTemp: 26, tomorrowTemp: 25 },
];

// Tight, perfect bounding box for all France regions including Corsica
const FRANCE_BOUNDS: L.LatLngBoundsLiteral = [
  [41.3, -5.2], // Southwest (Corsica south / Brittany west)
  [51.1, 9.6]   // Northeast (Dunkirk north / Alsace east)
];

export const FranceMiniOverviewCard: React.FC<FranceMiniOverviewCardProps> = ({
  currentStation,
  onSelectStation,
  onNavigateTab
}) => {
  const [selectedSlot, setSelectedSlot] = useState<'current' | 'afternoon' | 'tomorrow'>('current');
  const [regionsData, setRegionsData] = useState<RegionWeather[]>(FRANCE_REGIONS);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Fetch live weather codes for all 13 regions in a single request
  useEffect(() => {
    let isCancelled = false;

    const fetchLiveRegions = async () => {
      try {
        const lats = FRANCE_REGIONS.map(r => r.lat).join(',');
        const lons = FRANCE_REGIONS.map(r => r.lon).join(',');
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}&current=temperature_2m,weather_code&daily=temperature_2m_max,weather_code&timezone=Europe%2FParis`;
        
        const res = await fetch(url);
        if (!res.ok) return;
        const data = await res.json();

        if (Array.isArray(data) && !isCancelled) {
          const updated = FRANCE_REGIONS.map((reg, idx) => {
            const item = data[idx];
            if (!item) return reg;
            const curCode = item.current?.weather_code ?? reg.currentCode;
            const curT = item.current?.temperature_2m ?? reg.currentTemp;
            const dailyCodes = item.daily?.weather_code ?? [];
            const dailyMax = item.daily?.temperature_2m_max ?? [];

            return {
              ...reg,
              currentCode: curCode,
              afternoonCode: dailyCodes[0] ?? curCode,
              tomorrowCode: dailyCodes[1] ?? dailyCodes[0] ?? curCode,
              currentTemp: Math.round(curT),
              afternoonTemp: Math.round(dailyMax[0] ?? curT + 2),
              tomorrowTemp: Math.round(dailyMax[1] ?? curT + 1)
            };
          });
          setRegionsData(updated);
        }
      } catch (err) {
        // Retain fallback data smoothly
      }
    };

    fetchLiveRegions();
    return () => { isCancelled = true; };
  }, []);

  // Pure Meteorological Pictograms (Only symbols: sun, partly cloudy, cloudy, rain, storm, snow, fog)
  const getWeatherSymbolSvg = (code: number) => {
    // 0 = Ensoleillé pur
    if (code === 0) {
      return `<svg class="w-5 h-5 text-amber-400 fill-amber-400 drop-shadow" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`;
    }
    // 1, 2 = Éclaircies / Peu nuageux
    if (code === 1 || code === 2) {
      return `<svg class="w-5 h-5 text-amber-400 drop-shadow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="M20 12h2"/><path d="m19.07 4.93-1.41 1.41"/><path d="M15.947 12.65a4 4 0 0 0-5.925-4.128"/><path d="M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6Z" fill="#93c5fd" fill-opacity="0.3" stroke="#38bdf8"/></svg>`;
    }
    // 3 = Couvert / Nuageux
    if (code === 3) {
      return `<svg class="w-5 h-5 text-slate-300 drop-shadow" viewBox="0 0 24 24" fill="#64748b" fill-opacity="0.3" stroke="currentColor" stroke-width="2"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>`;
    }
    // 45, 48 = Brouillard
    if (code === 45 || code === 48) {
      return `<svg class="w-5 h-5 text-slate-400 drop-shadow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 10h16"/><path d="M4 14h16"/><path d="M7 18h10"/></svg>`;
    }
    // 51 to 67, 80 to 82 = Pluie / Averses
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
      return `<svg class="w-5 h-5 text-sky-400 drop-shadow" viewBox="0 0 24 24" fill="#0284c7" fill-opacity="0.25" stroke="currentColor" stroke-width="2"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 14v6" stroke-dasharray="2 2"/><path d="M8 14v6" stroke-dasharray="2 2"/><path d="M12 16v6" stroke-dasharray="2 2"/></svg>`;
    }
    // 71 to 77, 85 to 86 = Neige
    if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) {
      return `<svg class="w-5 h-5 text-cyan-300 drop-shadow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="2" x2="22" y1="12" y2="12"/><line x1="12" x2="12" y1="2" y2="22"/><path d="m20 16-4-4 4-4"/><path d="m4 8 4 4-4 4"/><path d="m16 4-4 4-4-4"/><path d="m8 20 4-4 4 4"/></svg>`;
    }
    // 95 to 99 = Orage
    if (code >= 95) {
      return `<svg class="w-5 h-5 text-amber-400 drop-shadow" viewBox="0 0 24 24" fill="#d97706" fill-opacity="0.3" stroke="currentColor" stroke-width="2"><path d="M6 16.326A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 .5 8.973"/><path d="m13 11-3 5h4l-3 5" fill="#f59e0b" stroke="#f59e0b"/></svg>`;
    }
    return `<svg class="w-5 h-5 text-amber-400 fill-amber-400 drop-shadow" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M2 12h2"/><path d="M20 12h2"/></svg>`;
  };

  const getWeatherLabel = (code: number) => {
    if (code === 0) return 'Plein Soleil';
    if (code === 1) return 'Ensoleillé';
    if (code === 2) return 'Éclaircies';
    if (code === 3) return 'Couvert';
    if (code === 45 || code === 48) return 'Brouillard';
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'Pluie';
    if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return 'Neige';
    if (code >= 95) return 'Orage';
    return 'Ensoleillé';
  };

  // Initialize Leaflet Map with OpenStreetMap
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [46.5, 2.5],
        zoom: 5.5,
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: false,
        doubleClickZoom: true,
        touchZoom: true
      });

      // OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        subdomains: ['a', 'b', 'c']
      }).addTo(map);

      // Attribution discreet
      L.control.attribution({ position: 'bottomright', prefix: false })
        .addAttribution('&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OSM</a>')
        .addTo(map);

      // Markers Layer Group
      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;

      mapInstanceRef.current = map;

      // Fit France bounds tightly so it fits in the smaller compact container
      map.fitBounds(FRANCE_BOUNDS, { padding: [6, 6] });
    }

    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
        mapInstanceRef.current.fitBounds(FRANCE_BOUNDS, { padding: [6, 6] });
      }
    }, 150);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  // Update Markers: ONLY Weather Symbols for each region!
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    const markersGroup = markersLayerRef.current;
    markersGroup.clearLayers();

    regionsData.forEach(reg => {
      const isCurrentRegion = currentStation.region && 
        (reg.name.toLowerCase().includes(currentStation.region.toLowerCase()) || 
         currentStation.region.toLowerCase().includes(reg.name.toLowerCase()));

      const code = selectedSlot === 'current' 
        ? reg.currentCode 
        : selectedSlot === 'afternoon' 
        ? reg.afternoonCode 
        : reg.tomorrowCode;

      const temp = selectedSlot === 'current' 
        ? reg.currentTemp 
        : selectedSlot === 'afternoon' 
        ? reg.afternoonTemp 
        : reg.tomorrowTemp;

      const symbolSvg = getWeatherSymbolSvg(code);
      const labelDesc = getWeatherLabel(code);

      // ONLY THE WEATHER SYMBOL: pure, elegant floating pictogram disc
      const html = `
        <div class="group cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-200 hover:scale-125" title="${reg.name} : ${labelDesc} (${temp}°C)">
          <div class="flex items-center justify-center w-8 h-8 rounded-full shadow-md backdrop-blur-md transition-all ${
            isCurrentRegion
              ? 'bg-blue-600/90 text-white ring-2 ring-blue-400 scale-110 shadow-blue-500/40'
              : 'bg-white/90 dark:bg-slate-900/90 hover:bg-white text-slate-800 dark:text-white border border-slate-300 dark:border-slate-700/80'
          }">
            ${symbolSvg}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'france-region-symbol-marker',
        html,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([reg.lat, reg.lon], { icon: customIcon });

      marker.bindTooltip(`<strong>${reg.name}</strong><br/>${labelDesc} • ${temp}°C`, {
        direction: 'top',
        offset: [0, -10],
        opacity: 0.95
      });

      marker.on('click', () => {
        handleRegionClick(reg);
      });

      marker.addTo(markersGroup);
    });
  }, [regionsData, selectedSlot, currentStation]);

  const handleRegionClick = (reg: RegionWeather) => {
    if (!onSelectStation) return;
    const found = FRENCH_STATIONS.find(s => s.id === reg.capitalStationId) ||
      FRENCH_STATIONS.find(s => s.region?.toLowerCase() === reg.name.toLowerCase());
    
    if (found) {
      onSelectStation(found);
    }
  };

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.fitBounds(FRANCE_BOUNDS, { padding: [6, 6] });
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-[#0c1424]/90 p-2.5 sm:p-3 shadow-md backdrop-blur-xl relative overflow-hidden transition-all duration-200">
      {/* Sleek Compact Header */}
      <div className="flex items-center justify-between gap-2 pb-2 mb-1.5 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-500 shrink-0">
            <Compass className="h-4 w-4" />
          </div>
          <div className="truncate">
            <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white tracking-tight leading-none truncate">
              France Météo Régions
            </h3>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              Symboles du temps par région
            </span>
          </div>
        </div>

        {/* Compact Slot Controls */}
        <div className="flex items-center gap-1 shrink-0">
          <div className="flex items-center bg-slate-100 dark:bg-slate-900 rounded-lg p-0.5 border border-slate-200 dark:border-slate-800 text-[11px]">
            <button
              onClick={() => setSelectedSlot('current')}
              className={`px-2 py-0.5 rounded-md font-bold transition cursor-pointer ${
                selectedSlot === 'current'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Direct
            </button>
            <button
              onClick={() => setSelectedSlot('afternoon')}
              className={`px-2 py-0.5 rounded-md font-bold transition cursor-pointer ${
                selectedSlot === 'afternoon'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Après-midi
            </button>
            <button
              onClick={() => setSelectedSlot('tomorrow')}
              className={`px-2 py-0.5 rounded-md font-bold transition cursor-pointer ${
                selectedSlot === 'tomorrow'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Demain
            </button>
          </div>

          <button
            onClick={handleRecenter}
            title="Recentrer la carte"
            className="flex items-center justify-center h-6 w-6 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" />
          </button>

          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('franceMap')}
              title="Agrandir la carte"
              className="flex items-center justify-center h-6 w-6 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
            >
              <Maximize2 className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Much Smaller Compact Map Container */}
      <div className="relative w-full h-[185px] sm:h-[210px] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950">
        <div 
          ref={mapContainerRef} 
          className="w-full h-full z-0"
        />
      </div>
    </div>
  );
};
