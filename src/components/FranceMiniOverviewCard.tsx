import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { 
  Compass, 
  RotateCcw,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut
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

// Configuration des icônes Leaflet pour éviter toute tentative de résolution d'URL relative
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

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

// Country bounding boxes & French display names for automatic country map framing
const COUNTRY_MAP_PROFILES: Record<string, { labelFr: string; bounds: L.LatLngBoundsLiteral }> = {
  'france': { labelFr: 'France', bounds: FRANCE_BOUNDS },
  'united kingdom': { labelFr: 'Royaume-Uni', bounds: [[49.8, -8.6], [58.7, 1.8]] },
  'royaume-uni': { labelFr: 'Royaume-Uni', bounds: [[49.8, -8.6], [58.7, 1.8]] },
  'uk': { labelFr: 'Royaume-Uni', bounds: [[49.8, -8.6], [58.7, 1.8]] },
  'great britain': { labelFr: 'Royaume-Uni', bounds: [[49.8, -8.6], [58.7, 1.8]] },
  'england': { labelFr: 'Royaume-Uni', bounds: [[49.8, -8.6], [58.7, 1.8]] },
  'spain': { labelFr: 'Espagne', bounds: [[36.0, -9.3], [43.8, 3.3]] },
  'espagne': { labelFr: 'Espagne', bounds: [[36.0, -9.3], [43.8, 3.3]] },
  'italy': { labelFr: 'Italie', bounds: [[36.6, 6.6], [47.1, 18.5]] },
  'italie': { labelFr: 'Italie', bounds: [[36.6, 6.6], [47.1, 18.5]] },
  'germany': { labelFr: 'Allemagne', bounds: [[47.2, 5.8], [55.1, 15.0]] },
  'allemagne': { labelFr: 'Allemagne', bounds: [[47.2, 5.8], [55.1, 15.0]] },
  'switzerland': { labelFr: 'Suisse', bounds: [[45.8, 5.9], [47.8, 10.5]] },
  'suisse': { labelFr: 'Suisse', bounds: [[45.8, 5.9], [47.8, 10.5]] },
  'belgium': { labelFr: 'Belgique', bounds: [[49.5, 2.5], [51.5, 6.4]] },
  'belgique': { labelFr: 'Belgique', bounds: [[49.5, 2.5], [51.5, 6.4]] },
  'netherlands': { labelFr: 'Pays-Bas', bounds: [[50.7, 3.3], [53.5, 7.2]] },
  'pays-bas': { labelFr: 'Pays-Bas', bounds: [[50.7, 3.3], [53.5, 7.2]] },
  'portugal': { labelFr: 'Portugal', bounds: [[36.9, -9.5], [42.2, -6.2]] },
  'austria': { labelFr: 'Autriche', bounds: [[46.3, 9.5], [49.0, 17.2]] },
  'autriche': { labelFr: 'Autriche', bounds: [[46.3, 9.5], [49.0, 17.2]] },
  'ireland': { labelFr: 'Irlande', bounds: [[51.4, -10.5], [55.4, -6.0]] },
  'irlande': { labelFr: 'Irlande', bounds: [[51.4, -10.5], [55.4, -6.0]] },
  'greece': { labelFr: 'Grèce', bounds: [[34.8, 19.3], [41.7, 28.2]] },
  'grèce': { labelFr: 'Grèce', bounds: [[34.8, 19.3], [41.7, 28.2]] },
  'morocco': { labelFr: 'Maroc', bounds: [[27.6, -13.2], [35.9, -1.0]] },
  'maroc': { labelFr: 'Maroc', bounds: [[27.6, -13.2], [35.9, -1.0]] },
  'algeria': { labelFr: 'Algérie', bounds: [[28.0, -2.2], [37.1, 8.7]] },
  'algérie': { labelFr: 'Algérie', bounds: [[28.0, -2.2], [37.1, 8.7]] },
  'tunisia': { labelFr: 'Tunisie', bounds: [[32.0, 7.5], [37.5, 11.6]] },
  'tunisie': { labelFr: 'Tunisie', bounds: [[32.0, 7.5], [37.5, 11.6]] },
  'united states': { labelFr: 'États-Unis', bounds: [[24.5, -125.0], [49.4, -66.9]] },
  'états-unis': { labelFr: 'États-Unis', bounds: [[24.5, -125.0], [49.4, -66.9]] },
  'usa': { labelFr: 'États-Unis', bounds: [[24.5, -125.0], [49.4, -66.9]] },
  'canada': { labelFr: 'Canada', bounds: [[42.0, -141.0], [65.0, -52.6]] },
  'japan': { labelFr: 'Japon', bounds: [[30.0, 129.5], [45.5, 145.8]] },
  'japon': { labelFr: 'Japon', bounds: [[30.0, 129.5], [45.5, 145.8]] },
  'australia': { labelFr: 'Australie', bounds: [[-43.6, 113.3], [-10.7, 153.6]] },
  'australie': { labelFr: 'Australie', bounds: [[-43.6, 113.3], [-10.7, 153.6]] },
  'brazil': { labelFr: 'Brésil', bounds: [[-33.7, -73.9], [5.2, -34.7]] },
  'brésil': { labelFr: 'Brésil', bounds: [[-33.7, -73.9], [5.2, -34.7]] },
  'poland': { labelFr: 'Pologne', bounds: [[49.0, 14.1], [54.8, 24.1]] },
  'pologne': { labelFr: 'Pologne', bounds: [[49.0, 14.1], [54.8, 24.1]] },
  'norway': { labelFr: 'Norvège', bounds: [[57.9, 4.6], [71.2, 31.1]] },
  'norvège': { labelFr: 'Norvège', bounds: [[57.9, 4.6], [71.2, 31.1]] },
  'sweden': { labelFr: 'Suède', bounds: [[55.3, 11.1], [69.1, 24.2]] },
  'suède': { labelFr: 'Suède', bounds: [[55.3, 11.1], [69.1, 24.2]] },
};

function resolveStationCountryProfile(station: LocationPoint): { isFrance: boolean; labelFr: string; bounds?: L.LatLngBoundsLiteral } {
  const rawCountry = (station.country || '').trim();
  const lowerCountry = rawCountry.toLowerCase();
  const lowerName = (station.name || '').toLowerCase();

  // Check explicit London / UK / foreign station names if country was not set
  if (lowerName.includes('londres') || lowerName === 'london') {
    return { isFrance: false, labelFr: 'Royaume-Uni', bounds: COUNTRY_MAP_PROFILES['royaume-uni'].bounds };
  }

  if (!rawCountry || lowerCountry === 'france' || lowerCountry === 'fr') {
    return { isFrance: true, labelFr: 'France', bounds: FRANCE_BOUNDS };
  }

  if (COUNTRY_MAP_PROFILES[lowerCountry]) {
    return {
      isFrance: lowerCountry === 'france',
      labelFr: COUNTRY_MAP_PROFILES[lowerCountry].labelFr,
      bounds: COUNTRY_MAP_PROFILES[lowerCountry].bounds,
    };
  }

  // Fallback for any other country on Earth: build a national bounding box around the city
  const lat = station.latitude || 46.5;
  const lon = station.longitude || 2.5;
  return {
    isFrance: false,
    labelFr: rawCountry,
    bounds: [
      [Math.max(-85, lat - 4.2), lon - 5.5],
      [Math.min(85, lat + 4.2), lon + 5.5],
    ],
  };
}

export const FranceMiniOverviewCard: React.FC<FranceMiniOverviewCardProps> = ({
  currentStation,
  onSelectStation,
  onNavigateTab
}) => {
  const [selectedSlot, setSelectedSlot] = useState<'current' | 'afternoon' | 'tomorrow'>('current');
  const [regionsData, setRegionsData] = useState<RegionWeather[]>(FRANCE_REGIONS);
  const [isExpandedPc, setIsExpandedPc] = useState<boolean>(false);
  // Par défaut, affiche directement le pays en global (France ou le pays de la ville demandée comme Royaume-Uni)
  const [mapScope, setMapScope] = useState<'country' | 'city' | 'world'>('country');

  const countryProfile = resolveStationCountryProfile(currentStation);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Quand l'utilisateur change de ville (ex: demande Londres -> affiche automatiquement le Royaume-Uni)
  useEffect(() => {
    setMapScope('country');
  }, [currentStation.id, currentStation.name, currentStation.country]);

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

  // Initialize Leaflet Map with High-Definition Clean Cartography (No raw OpenStreetMap)
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      try {
        const map = L.map(mapContainerRef.current, {
          center: [46.5, 2.5],
          zoom: 5.5,
          zoomControl: false,
          attributionControl: false,
          scrollWheelZoom: false,
          doubleClickZoom: true,
          touchZoom: true
        });

        // Fond cartographique Satellite HD identique à Radar Précipitations & Vents HD
        const baseTileLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          maxNativeZoom: 18,
          maxZoom: 19,
          subdomains: 'abc',
          attribution: '© Esri, Maxar, Earthstar Geographics'
        });
        baseTileLayer.on('tileerror', () => {
          // Tolérance aux pannes réseau
        });
        baseTileLayer.addTo(map);

        // Markers Layer Group
        const markersGroup = L.layerGroup().addTo(map);
        markersLayerRef.current = markersGroup;

        mapInstanceRef.current = map;

        // Initial View: Center on country in global view (France or the station's country)
        const sz = map.getSize();
        if (countryProfile.bounds && sz.x > 0 && sz.y > 0) {
          map.fitBounds(countryProfile.bounds, { padding: [8, 8], animate: false });
        } else if (currentStation && currentStation.latitude && currentStation.longitude) {
          map.setView([currentStation.latitude, currentStation.longitude], 5.5, { animate: false });
        } else {
          map.setView([46.5, 2.5], 5.5, { animate: false });
        }
      } catch (err) {
        console.warn('[FranceMiniOverviewCard] Map init warning:', err);
      }
    }

    const refreshMapLayout = () => {
      if (!mapInstanceRef.current || !mapContainerRef.current) return;
      if (mapContainerRef.current.clientWidth === 0 || mapContainerRef.current.clientHeight === 0) return;
      try {
        mapInstanceRef.current.invalidateSize();
        if (mapScope === 'city' && currentStation?.latitude && currentStation?.longitude) {
          mapInstanceRef.current.setView([currentStation.latitude, currentStation.longitude], 9, { animate: false });
        } else if (mapScope === 'country') {
          if (countryProfile.bounds) {
            mapInstanceRef.current.fitBounds(countryProfile.bounds, { padding: [8, 8], animate: false });
          } else {
            mapInstanceRef.current.setView([currentStation?.latitude || 46.5, currentStation?.longitude || 2.5], 5.5, { animate: false });
          }
        } else {
          mapInstanceRef.current.setView([20, currentStation?.longitude || 0], 2, { animate: false });
        }
      } catch {
        // Ignore transient layout errors
      }
    };

    // ResizeObserver so Leaflet always fills its full flex container height
    let resizeObs: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && mapContainerRef.current) {
      resizeObs = new ResizeObserver(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      });
      resizeObs.observe(mapContainerRef.current);
    }

    const timer1 = setTimeout(refreshMapLayout, 100);
    const timer2 = setTimeout(refreshMapLayout, 400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      if (resizeObs) resizeObs.disconnect();
    };
  }, []);

  // Update View when station changes or scope changes
  useEffect(() => {
    if (!mapInstanceRef.current || !mapContainerRef.current) return;
    const map = mapInstanceRef.current;
    const isVisible = mapContainerRef.current.clientWidth > 0 && mapContainerRef.current.clientHeight > 0;

    try {
      if (mapScope === 'city' && currentStation?.latitude && currentStation?.longitude) {
        if (isVisible) {
          map.flyTo([currentStation.latitude, currentStation.longitude], 9, { duration: 0.8 });
        } else {
          map.setView([currentStation.latitude, currentStation.longitude], 9, { animate: false });
        }
      } else if (mapScope === 'country') {
        if (countryProfile.bounds) {
          if (isVisible) {
            map.fitBounds(countryProfile.bounds, { padding: [8, 8] });
          } else {
            map.fitBounds(countryProfile.bounds, { padding: [8, 8], animate: false });
          }
        } else {
          map.setView([currentStation?.latitude || 46.5, currentStation?.longitude || 2.5], 5.5, { animate: false });
        }
      } else if (mapScope === 'world') {
        if (isVisible) {
          map.flyTo([20, currentStation?.longitude || 0], 2, { duration: 0.8 });
        } else {
          map.setView([20, currentStation?.longitude || 0], 2, { animate: false });
        }
      }
    } catch {
      // Fallback if container was resizing during flyTo
    }
  }, [currentStation.latitude, currentStation.longitude, currentStation.id, currentStation.country, mapScope]);

  // Update Markers: Weather Symbols for regions + Active Marker for currentStation!
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    const markersGroup = markersLayerRef.current;
    markersGroup.clearLayers();

    // 1. Regional Weather Symbols (displayed when viewing France or World)
    if (countryProfile.isFrance || mapScope === 'world') {
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
    }

    // 2. Active Pulse Marker for the selected station anywhere in France or on Earth
    if (currentStation && currentStation.latitude && currentStation.longitude) {
      const isMacroScope = (mapScope === 'country' && countryProfile.isFrance) || mapScope === 'world';

      const currentStationHtml = isMacroScope
        ? `
          <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2 cursor-pointer group" title="${currentStation.name} (${currentStation.altitude}m)">
            <span class="absolute inline-flex h-3 w-3 animate-ping rounded-full bg-blue-500 opacity-75"></span>
            <div class="relative h-2.5 w-2.5 rounded-full bg-blue-600 border border-white shadow-sm ring-1 ring-blue-400"></div>
          </div>
        `
        : `
          <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2 cursor-pointer group">
            <span class="absolute inline-flex h-7 w-7 animate-ping rounded-full bg-blue-500 opacity-50"></span>
            <div class="relative flex items-center gap-1.5 rounded-md bg-blue-600 px-2 py-0.5 text-white shadow-lg border border-white ring-1 ring-blue-400 font-bold text-xs whitespace-nowrap">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>${currentStation.name}</span>
              <span class="text-[10px] text-blue-200">(${currentStation.altitude}m)</span>
            </div>
          </div>
        `;

      const currentIcon = L.divIcon({
        className: 'current-station-marker',
        html: currentStationHtml,
        iconSize: isMacroScope ? [12, 12] : [100, 28],
        iconAnchor: isMacroScope ? [6, 6] : [50, 14]
      });

      const currentMarker = L.marker([currentStation.latitude, currentStation.longitude], {
        icon: currentIcon,
        zIndexOffset: 1000
      });

      currentMarker.bindTooltip(`<strong>${currentStation.name}</strong><br/>Altitude: ${currentStation.altitude}m<br/>${currentStation.department || currentStation.country || ''}`, {
        direction: 'top',
        offset: [0, isMacroScope ? -6 : -14],
        opacity: 0.95
      });

      currentMarker.addTo(markersGroup);
    }
  }, [regionsData, selectedSlot, currentStation, mapScope]);

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
      if (mapScope === 'city') {
        mapInstanceRef.current.flyTo([currentStation.latitude, currentStation.longitude], 9);
      } else if (mapScope === 'country') {
        if (countryProfile.bounds) {
          mapInstanceRef.current.fitBounds(countryProfile.bounds, { padding: [8, 8] });
        } else {
          mapInstanceRef.current.setView([currentStation.latitude, currentStation.longitude], 5.5);
        }
      } else {
        mapInstanceRef.current.setView([20, currentStation?.longitude || 0], 2);
      }
    }
  };

  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    }
  };

  const handleToggleExpandPc = () => {
    setIsExpandedPc(prev => !prev);
    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
        if (!isExpandedPc) {
          mapInstanceRef.current.setZoom(mapInstanceRef.current.getZoom() + 0.5);
        }
      }
    }, 200);
  };

  return (
    <div className={`h-full flex flex-col rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-[#0c1424]/90 p-2.5 sm:p-3 shadow-md backdrop-blur-xl relative overflow-hidden transition-all duration-300 ${
      isExpandedPc ? 'ring-2 ring-blue-500/50 shadow-xl' : ''
    }`}>
      {/* Sleek Compact Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-1.5 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-500 shrink-0">
            <Compass className="h-4 w-4" />
          </div>
          <div className="truncate">
            <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white tracking-tight leading-none truncate">
              {mapScope === 'country' 
                ? `Carte Météo Direct • ${countryProfile.labelFr}` 
                : mapScope === 'world' 
                ? 'Carte Météo Direct • Monde' 
                : `Carte Météo Direct • ${currentStation.name}`}
            </h3>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              {mapScope === 'country'
                ? countryProfile.isFrance
                  ? 'Synthèse météo des régions françaises'
                  : `Vue nationale (${countryProfile.labelFr}) • ${currentStation.name}`
                : mapScope === 'world'
                ? 'Vue atmosphérique globale'
                : `${currentStation.name} (${countryProfile.labelFr}) • ${currentStation.altitude}m`}
            </span>
          </div>
        </div>

        {/* Scope Selector: Pays (France / Royaume-Uni / etc.) en premier, puis Ma Ville, puis Monde */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="flex items-center bg-slate-100 dark:bg-slate-900 rounded-lg p-0.5 border border-slate-200 dark:border-slate-800 text-[11px]">
            <button
              onClick={() => setMapScope('country')}
              className={`px-2 py-0.5 rounded-md font-bold transition cursor-pointer ${
                mapScope === 'country'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title={`Vue d'ensemble (${countryProfile.labelFr})`}
            >
              {countryProfile.labelFr}
            </button>
            <button
              onClick={() => setMapScope('city')}
              className={`px-2 py-0.5 rounded-md font-bold transition cursor-pointer ${
                mapScope === 'city'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Centrer sur ma ville sélectionnée"
            >
              Ma Ville
            </button>
            <button
              onClick={() => setMapScope('world')}
              className={`px-2 py-0.5 rounded-md font-bold transition cursor-pointer ${
                mapScope === 'world'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Vue d'ensemble de la Terre entière"
            >
              Monde
            </button>
          </div>

          {/* Time Slot Controls */}
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

          {/* PC Zoom Buttons */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800">
            <button
              onClick={handleZoomIn}
              title="Zoomer sur la carte (PC)"
              aria-label="Zoomer"
              className="flex items-center justify-center h-6 w-6 rounded-md bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/40 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 shadow-xs border border-slate-200 dark:border-slate-700 transition active:scale-95 cursor-pointer"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleZoomOut}
              title="Dézoomer de la carte (PC)"
              aria-label="Dézoomer"
              className="flex items-center justify-center h-6 w-6 rounded-md bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/40 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 shadow-xs border border-slate-200 dark:border-slate-700 transition active:scale-95 cursor-pointer"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleToggleExpandPc}
              title={isExpandedPc ? "Réduire la vue" : "Agrandir le bloc (Vue HD)"}
              className={`hidden md:flex items-center gap-1 px-1.5 h-6 rounded-md text-[10px] font-bold border transition cursor-pointer ${
                isExpandedPc 
                  ? 'bg-blue-600 text-white border-blue-500' 
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              {isExpandedPc ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
              <span>{isExpandedPc ? 'Réduire' : 'Zoomer'}</span>
            </button>
          </div>

          <button
            onClick={handleRecenter}
            title="Recentrer sur la sélection"
            className="flex items-center justify-center h-6 w-6 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Map Container (Fills the entire remaining height of the card block) */}
      <div className={`relative w-full flex-1 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 transition-all duration-300 ${
        isExpandedPc ? 'min-h-[380px] sm:min-h-[440px]' : 'min-h-[240px] sm:min-h-[285px]'
      }`}>
        <div 
          ref={mapContainerRef} 
          className="absolute inset-0 w-full h-full z-0"
        />

        {/* Floating Zoom Overlay Badge (only in city mode, discreet) */}
        {mapScope === 'city' && (
          <div className="absolute bottom-2 left-2 z-[400] flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md px-2 py-1 rounded-md text-[10px] text-slate-300 border border-slate-700/60 pointer-events-none">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{currentStation.name}</span>
          </div>
        )}
      </div>
    </div>
  );
};
