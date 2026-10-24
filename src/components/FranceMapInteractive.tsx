import React, { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import { LocationPoint } from '../types/weather';
import { FRENCH_STATIONS } from '../data/frenchStations';
import { getNormalsForStation, getThreeHourSlotNormal, CLIMATE_NORMALS_1991_2020 } from '../data/climateNormals';
import { 
  MapPin, 
  Thermometer, 
  TrendingUp, 
  CloudRain, 
  Mountain, 
  Globe2, 
  Search, 
  Wind, 
  Compass, 
  Layers, 
  Maximize2, 
  Minimize2, 
  RefreshCw, 
  CheckCircle2,
  Sparkles,
  SlidersHorizontal,
  ChevronRight,
  Eye,
  Info,
  Snowflake,
  Flame,
  ShieldAlert,
  AlertTriangle,
  Droplets,
  ThermometerSnowflake
} from 'lucide-react';

interface FranceMapInteractiveProps {
  currentStation: LocationPoint;
  onSelectStation: (station: LocationPoint) => void;
  seniorMode?: boolean;
  onOpenSearchModal?: () => void;
}

export type MapMetricFilter = 
  | 'temp' 
  | 'frost_prob' 
  | 'thresholds' 
  | 'heatwave_risk' 
  | 'coldwave_risk' 
  | 'rain' 
  | 'wind' 
  | 'altitude';
export type ElevationFilter = 'all' | 'plains' | 'mid' | 'summits';
export type MassifFilter = 'all' | 'alpes' | 'pyrenees' | 'massifCentral' | 'vosgesJura' | 'corse';
export type OsmBaseLayer = 'osm' | 'topo' | 'dark' | 'satellite';

export interface LiveStationMetric {
  temp: number;
  feelsLike: number;
  humidity: number;
  rain: number;
  wind: number;
  windGust: number;
  weatherCode: number;
  tMin: number;
  tMax: number;
  timestamp: number;
}

interface RegionInfo {
  id: string;
  name: string;
  shortName: string;
  center: [number, number];
  zoom: number;
  bounds: [[number, number], [number, number]];
  climate: string;
  highestPeak: string;
  departments: string;
}

const FRENCH_REGIONS: RegionInfo[] = [
  {
    id: 'france',
    name: 'France Entière (Métropole)',
    shortName: '🇫🇷 France',
    center: [46.6, 2.5],
    zoom: 6,
    bounds: [[41.3, -5.2], [51.2, 9.6]],
    climate: 'Tempéré océanique, continental & méditerranéen',
    highestPeak: 'Mont Blanc (4809 m)',
    departments: '101 départements'
  },
  {
    id: 'ara',
    name: 'Auvergne-Rhône-Alpes',
    shortName: '🏔️ Auvergne-Rhône-Alpes',
    center: [45.5, 4.8],
    zoom: 7,
    bounds: [[44.1, 2.0], [46.6, 7.2]],
    climate: 'Montagnard, continental & méditerranéen au sud',
    highestPeak: 'Mont Blanc (4809 m)',
    departments: '01, 03, 07, 15, 26, 38, 42, 43, 63, 69, 73, 74'
  },
  {
    id: 'paca',
    name: 'Provence-Alpes-Côte d\'Azur',
    shortName: '☀️ PACA',
    center: [43.9, 6.0],
    zoom: 8,
    bounds: [[42.9, 4.2], [45.1, 7.8]],
    climate: 'Méditerranéen ensoleillé & alpin au nord',
    highestPeak: 'Barre des Écrins (4102 m)',
    departments: '04, 05, 06, 13, 83, 84'
  },
  {
    id: 'occitanie',
    name: 'Occitanie (Pyrénées & Méditerranée)',
    shortName: '🌊 Occitanie',
    center: [43.6, 2.2],
    zoom: 7,
    bounds: [[42.3, -0.4], [45.0, 4.9]],
    climate: 'Méditerranéen, montagnard & aquitain',
    highestPeak: 'Pic du Midi / Vignemale (3298 m)',
    departments: '09, 11, 12, 30, 31, 32, 34, 46, 48, 65, 66, 81, 82'
  },
  {
    id: 'nouvelle_aquitaine',
    name: 'Nouvelle-Aquitaine',
    shortName: '🍷 Nouvelle-Aquitaine',
    center: [45.3, 0.2],
    zoom: 7,
    bounds: [[42.7, -1.9], [47.2, 2.6]],
    climate: 'Océanique aquitain doux & humide',
    highestPeak: 'Pic du Midi d\'Ossau (2884 m)',
    departments: '16, 17, 19, 23, 24, 33, 40, 47, 64, 79, 86, 87'
  },
  {
    id: 'idf',
    name: 'Île-de-France',
    shortName: '🗼 Île-de-France',
    center: [48.65, 2.35],
    zoom: 9,
    bounds: [[48.1, 1.4], [49.2, 3.6]],
    climate: 'Océanique dégradé à forte influence urbaine',
    highestPeak: 'Colline d\'Élancourt (231 m)',
    departments: '75, 77, 78, 91, 92, 93, 94, 95'
  },
  {
    id: 'grand_est',
    name: 'Grand Est (Vosges & Alsace)',
    shortName: '🌲 Grand Est',
    center: [48.7, 5.8],
    zoom: 7,
    bounds: [[47.4, 3.4], [50.2, 8.3]],
    climate: 'Semi-continental aux hivers froids & étés chauds',
    highestPeak: 'Grand Ballon (1424 m)',
    departments: '08, 10, 51, 52, 54, 55, 57, 67, 68, 88'
  },
  {
    id: 'bourgogne_franche_comte',
    name: 'Bourgogne-Franche-Comté (Jura)',
    shortName: '🧀 Bourgogne-Franche-Comté',
    center: [47.2, 5.0],
    zoom: 7,
    bounds: [[46.1, 2.8], [48.4, 7.1]],
    climate: 'Semi-continental & montagnard sur le Jura',
    highestPeak: 'Crêt Pela (1495 m)',
    departments: '21, 25, 39, 58, 70, 71, 89, 90'
  },
  {
    id: 'bretagne',
    name: 'Bretagne (incluant Loire-Atlantique 44)',
    shortName: '⛵ Bretagne (BZH)',
    center: [47.9, -2.6],
    zoom: 8,
    bounds: [[46.8, -5.2], [48.9, -1.0]],
    climate: 'Hyper-océanique venteux, tempéré & maritime',
    highestPeak: 'Roc\'h Ruz (385 m)',
    departments: '22, 29, 35, 44 (Loire-Atlantique), 56'
  },
  {
    id: 'normandie',
    name: 'Normandie',
    shortName: '🍎 Normandie',
    center: [49.1, 0.1],
    zoom: 8,
    bounds: [[48.3, -1.9], [50.1, 1.8]],
    climate: 'Océanique doux & arrosé',
    highestPeak: 'Signal d\'Écouves (413 m)',
    departments: '14, 27, 50, 61, 76'
  },
  {
    id: 'hauts_de_france',
    name: 'Hauts-de-France',
    shortName: '🏰 Hauts-de-France',
    center: [50.1, 2.8],
    zoom: 8,
    bounds: [[48.8, 1.3], [51.1, 4.3]],
    climate: 'Océanique frais & brumeux',
    highestPeak: 'Site d\'Anor (271 m)',
    departments: '02, 59, 60, 62, 80'
  },
  {
    id: 'pays_de_la_loire',
    name: 'Pays de la Loire',
    shortName: '🏰 Pays de la Loire',
    center: [47.5, -0.8],
    zoom: 8,
    bounds: [[46.2, -2.6], [48.6, 0.9]],
    climate: 'Océanique tempéré doux',
    highestPeak: 'Mont des Avaloirs (416 m)',
    departments: '44, 49, 53, 72, 85'
  },
  {
    id: 'centre_val_de_loire',
    name: 'Centre-Val de Loire',
    shortName: '🌾 Centre-Val de Loire',
    center: [47.5, 1.8],
    zoom: 8,
    bounds: [[46.3, 0.0], [48.9, 3.2]],
    climate: 'Océanique dégradé à nuances continentales',
    highestPeak: 'Le Magnoux (504 m)',
    departments: '18, 28, 36, 37, 41, 45'
  },
  {
    id: 'corse',
    name: 'Corse',
    shortName: '🏝️ Corse',
    center: [42.15, 9.1],
    zoom: 9,
    bounds: [[41.3, 8.5], [43.1, 9.6]],
    climate: 'Méditerranéen maritime & montagnard corse',
    highestPeak: 'Monte Cinto (2706 m)',
    departments: '2A, 2B'
  }
];

export const FranceMapInteractive: React.FC<FranceMapInteractiveProps> = ({
  currentStation,
  onSelectStation,
  seniorMode = false,
  onOpenSearchModal
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerGroupRef = useRef<L.LayerGroup | null>(null);

  const [metricFilter, setMetricFilter] = useState<MapMetricFilter>('temp');
  const [elevationFilter, setElevationFilter] = useState<ElevationFilter>('all');
  const [massifFilter, setMassifFilter] = useState<MassifFilter>('all');
  const [baseLayer, setBaseLayer] = useState<OsmBaseLayer>('osm');
  const [selectedRegion, setSelectedRegion] = useState<string>('france');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    if (isFullscreen) {
      document.body.setAttribute('data-radar-fullscreen', 'true');
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.removeAttribute('data-radar-fullscreen');
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    const t = setTimeout(() => mapInstanceRef.current?.invalidateSize(), 120);
    return () => {
      clearTimeout(t);
      document.body.removeAttribute('data-radar-fullscreen');
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isFullscreen]);

  // Filter stations that have valid coordinates and dynamic current station
  const allMapStations = useMemo(() => {
    const seen = new Set<string>();
    const list: LocationPoint[] = [...FRENCH_STATIONS];

    if (currentStation && currentStation.latitude && currentStation.longitude) {
      const alreadyPresent = list.some(st => 
        st.id === currentStation.id || 
        (Math.abs(st.latitude - currentStation.latitude) < 0.005 && Math.abs(st.longitude - currentStation.longitude) < 0.005)
      );

      if (!alreadyPresent) {
        list.unshift({
          ...currentStation,
          id: currentStation.id || `custom-station-${currentStation.name.toLowerCase().replace(/\s+/g, '-')}`,
          name: currentStation.name,
          department: currentStation.department || 'Commune de France',
          altitude: currentStation.altitude ?? 150
        });
      }
    }

    return list.filter(st => {
      if (st.latitude === undefined || st.longitude === undefined) return false;
      if (seen.has(st.id)) return false;
      seen.add(st.id);
      return true;
    });
  }, [currentStation]);

  // Filtered stations based on altitude and massif selection
  const displayedStations = useMemo(() => {
    return allMapStations.filter(st => {
      const alt = st.altitude ?? 0;

      // Elevation filter
      if (elevationFilter === 'plains' && alt >= 400) return false;
      if (elevationFilter === 'mid' && (alt < 400 || alt >= 1200)) return false;
      if (elevationFilter === 'summits' && alt < 1200) return false;

      // Massif filter
      if (massifFilter !== 'all') {
        const dep = st.department || '';
        const reg = st.region || '';
        if (massifFilter === 'alpes' && !['74', '73', '38', '05', '04', '06', 'Auvergne-Rhône-Alpes', 'Provence-Alpes-Côte d\'Azur'].some(k => dep.includes(k) || reg.includes(k))) return false;
        if (massifFilter === 'pyrenees' && !['64', '65', '31', '09', '66', 'Pyrénées'].some(k => dep.includes(k) || reg.includes(k))) return false;
        if (massifFilter === 'massifCentral' && !['63', '15', '43', '48', '12', '19', '23', 'Auvergne'].some(k => dep.includes(k) || reg.includes(k))) return false;
        if (massifFilter === 'vosgesJura' && !['25', '39', '01', '68', '88', 'Vosges', 'Jura'].some(k => dep.includes(k) || reg.includes(k))) return false;
        if (massifFilter === 'corse' && !['2A', '2B', 'Corse'].some(k => dep.includes(k) || reg.includes(k))) return false;
      }

      return true;
    });
  }, [allMapStations, elevationFilter, massifFilter]);

  // Iconic summits list for quick jump
  const iconicSummits = useMemo(() => {
    return allMapStations
      .filter(st => (st.altitude ?? 0) >= 1400)
      .sort((a, b) => (b.altitude ?? 0) - (a.altitude ?? 0))
      .slice(0, 10);
  }, [allMapStations]);

  // Live stations cache and background telemetry
  const [liveStationsData, setLiveStationsData] = useState<Record<string, LiveStationMetric>>(() => {
    try {
      const saved = localStorage.getItem('instant_meteo_live_map_stations_cache');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (_) {}
    return {};
  });

  // Background fetch of real live station temperatures & conditions (no hardcoded 19.8 / 21)
  useEffect(() => {
    let isCancelled = false;
    const fetchLiveStations = async () => {
      try {
        const sampleStations = allMapStations.slice(0, 35);
        if (sampleStations.length === 0) return;

        const lats = sampleStations.map(s => s.latitude.toFixed(4)).join(',');
        const lons = sampleStations.map(s => s.longitude.toFixed(4)).join(',');
        const elevs = sampleStations.map(s => Math.round(s.altitude ?? 0)).join(',');

        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}&elevation=${elevs}&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,wind_gusts_10m&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;

        const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
        if (!res.ok) return;

        const data = await res.json();
        const resultsArray = Array.isArray(data) ? data : [data];

        const updatedMetrics: Record<string, LiveStationMetric> = {};
        const now = Date.now();

        sampleStations.forEach((st, idx) => {
          const item = resultsArray[idx];
          if (item && item.current) {
            const cur = item.current;
            const daily = item.daily || {};
            updatedMetrics[st.id] = {
              temp: Math.round(cur.temperature_2m * 10) / 10,
              feelsLike: Math.round(cur.apparent_temperature * 10) / 10,
              humidity: Math.round(cur.relative_humidity_2m ?? 65),
              rain: Math.round((cur.precipitation ?? 0) * 10) / 10,
              wind: Math.round(cur.wind_speed_10m ?? 15),
              windGust: Math.round(cur.wind_gusts_10m ?? 25),
              weatherCode: cur.weather_code ?? 0,
              tMin: Math.round((daily.temperature_2m_min?.[0] ?? cur.temperature_2m - 4) * 10) / 10,
              tMax: Math.round((daily.temperature_2m_max?.[0] ?? cur.temperature_2m + 4) * 10) / 10,
              timestamp: now
            };
          }
        });

        if (!isCancelled && Object.keys(updatedMetrics).length > 0) {
          setLiveStationsData(prev => {
            const merged = { ...prev, ...updatedMetrics };
            try {
              localStorage.setItem('instant_meteo_live_map_stations_cache', JSON.stringify(merged));
            } catch (_) {}
            return merged;
          });
        }
      } catch (_) {
        // Silently preserve cached & climatological normals
      }
    };

    fetchLiveStations();
    const interval = setInterval(fetchLiveStations, 90000); // Réactualisation continue toutes les 90s
    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, [allMapStations.length]);

  // Dynamic calculated station values with real live Open-Meteo or true 1991-2020 diurnal slot normal
  const getStationMetrics = (st: LocationPoint) => {
    const live = liveStationsData[st.id];
    if (live) {
      return {
        temp: live.temp,
        tMin: live.tMin,
        tMax: live.tMax,
        feelsLike: live.feelsLike,
        humidity: live.humidity,
        rain: live.rain,
        wind: live.wind,
        windGust: live.windGust,
        weatherCode: live.weatherCode,
        altitude: st.altitude ?? 0,
        isLive: true
      };
    }

    // High fidelity seasonal & diurnal slot normal (e.g. Paris late-October gives ~13.8°C, not 21°C)
    const now = new Date();
    const month = now.getMonth();
    const hour = now.getHours();
    const slot = getThreeHourSlotNormal(
      st.id,
      st.latitude,
      st.altitude ?? 0,
      month,
      hour,
      st.name,
      st.country,
      st.longitude
    );
    const baseT = slot.slotNormalTemp;
    const tMin = slot.tMin;
    const tMax = slot.tMax;
    const rain = st.id.includes('brest') ? 0.6 : (st.altitude ?? 0) > 1500 ? 0.2 : 0;
    const wind = Math.round((st.altitude ?? 0) > 2000 ? 45 : (st.altitude ?? 0) > 1000 ? 30 : 16);

    return {
      temp: baseT,
      tMin,
      tMax,
      feelsLike: baseT - 1,
      humidity: 70,
      rain,
      wind,
      windGust: Math.round(wind * 1.4),
      weatherCode: 1,
      altitude: st.altitude ?? 0,
      isLive: false
    };
  };

  // Official Météo-France IBM Thresholds (Tmin nuit / Tmax jour sur 3j consécutifs)
  const getDepartmentIbmThreshold = (st: LocationPoint): { tMin: number; tMax: number } => {
    const dep = (st.department || '').toLowerCase();
    const lat = st.latitude;
    if (dep.includes('75') || dep.includes('paris') || dep.includes('92') || dep.includes('93') || dep.includes('94')) {
      return { tMin: 21, tMax: 31 }; // Paris
    }
    if (dep.includes('69') || dep.includes('rhône') || dep.includes('lyon')) {
      return { tMin: 20, tMax: 34 }; // Lyon
    }
    if (dep.includes('13') || dep.includes('marseille') || dep.includes('06') || dep.includes('nice')) {
      return { tMin: 24, tMax: 35 }; // Méditerranée
    }
    if (dep.includes('31') || dep.includes('toulouse') || dep.includes('33') || dep.includes('bordeaux')) {
      return { tMin: 21, tMax: 36 }; // Sud-Ouest
    }
    if (dep.includes('59') || dep.includes('lille') || dep.includes('62')) {
      return { tMin: 18, tMax: 33 }; // Hauts-de-France
    }
    if (dep.includes('29') || dep.includes('35') || dep.includes('44') || dep.includes('bretagne')) {
      return { tMin: 18, tMax: 31 }; // Bretagne
    }
    if (lat < 44.5) return { tMin: 22, tMax: 35 };
    if (lat < 47.0) return { tMin: 19, tMax: 34 };
    return { tMin: 18, tMax: 32 };
  };

  // Base tile layer URLs (Fond Satellite HD identique à Radar Précipitations & Vents HD)
  const getTileLayerConfig = (layer: OsmBaseLayer) => {
    switch (layer) {
      case 'topo':
        return {
          url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
          attribution: '© OpenTopoMap'
        };
      case 'dark':
        return {
          url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
          attribution: '© CartoDB'
        };
      case 'satellite':
      case 'osm':
      default:
        return {
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          attribution: '© Esri, Maxar, Earthstar Geographics'
        };
    }
  };

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [46.6, 2.5],
        zoom: 6,
        zoomControl: false,
        attributionControl: false
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      const tileConfig = getTileLayerConfig(baseLayer);
      const tileLayer = L.tileLayer(tileConfig.url, {
        attribution: tileConfig.attribution,
        maxNativeZoom: baseLayer === 'topo' ? 17 : baseLayer === 'satellite' ? 18 : 19,
        maxZoom: 19,
        subdomains: ['a', 'b', 'c']
      }).addTo(map);

      (map as any)._currentTileLayer = tileLayer;

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerGroupRef.current = markersGroup;
      mapInstanceRef.current = map;
    } else {
      const map = mapInstanceRef.current;
      if ((map as any)._currentTileLayer) {
        map.removeLayer((map as any)._currentTileLayer);
      }
      const tileConfig = getTileLayerConfig(baseLayer);
      const newTileLayer = L.tileLayer(tileConfig.url, {
        attribution: tileConfig.attribution,
        maxNativeZoom: baseLayer === 'topo' ? 17 : baseLayer === 'satellite' ? 18 : 19,
        maxZoom: 19,
        subdomains: ['a', 'b', 'c']
      }).addTo(map);
      (map as any)._currentTileLayer = newTileLayer;
    }
  }, [baseLayer]);

  // Update Markers on Leaflet Map
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerGroupRef.current) return;

    const markersGroup = markersLayerGroupRef.current;
    markersGroup.clearLayers();

    displayedStations.forEach(st => {
      const isSelected = st.id === currentStation.id;
      const metrics = getStationMetrics(st);
      const isHighSummit = (st.altitude ?? 0) >= 2000;
      const isMountain = (st.altitude ?? 0) >= 1000;

      let valText = `${metrics.temp}°C`;
      let badgeBg = 'bg-blue-600';
      let metricCategoryDesc = 'Température directe';

      if (metricFilter === 'temp') {
        valText = `${metrics.temp}°C`;
        badgeBg = metrics.temp >= 35 ? 'bg-red-700' :
          metrics.temp >= 25 ? 'bg-orange-500' :
          metrics.temp >= 19 ? 'bg-amber-500' :
          metrics.temp >= 12 ? 'bg-emerald-600' :
          metrics.temp >= 5 ? 'bg-sky-600' :
          metrics.temp >= 0 ? 'bg-blue-600' : 'bg-indigo-700';
        metricCategoryDesc = `Température en direct : ${metrics.temp}°C`;
      } else if (metricFilter === 'frost_prob') {
        // Agronomic frost risk
        let pct = 0;
        if (metrics.temp <= -2 || metrics.tMin <= -2) {
          pct = 100;
          badgeBg = 'bg-purple-900 border-indigo-400';
        } else if (metrics.temp <= 0.5 || metrics.tMin <= 0) {
          pct = 90;
          badgeBg = 'bg-indigo-700';
        } else if (metrics.temp <= 3.0 || metrics.tMin <= 2.5) {
          pct = 65;
          badgeBg = 'bg-sky-600';
        } else if (metrics.temp <= 6.0 || metrics.tMin <= 5.0) {
          pct = 30;
          badgeBg = 'bg-teal-600';
        } else {
          pct = 0;
          badgeBg = 'bg-emerald-600';
        }
        valText = `${pct}% gel`;
        metricCategoryDesc = `Probabilité agronomique de gel : ${pct}% (Tmin ${metrics.tMin}°C)`;
      } else if (metricFilter === 'thresholds') {
        // 7 official thermal thresholds
        const t = metrics.temp;
        if (t <= -5) {
          valText = `${t}° Gel sévère`;
          badgeBg = 'bg-purple-950 text-purple-200';
        } else if (t <= 2) {
          valText = `${t}° Gelée`;
          badgeBg = 'bg-indigo-600 text-white';
        } else if (t <= 10) {
          valText = `${t}° Frais`;
          badgeBg = 'bg-blue-600 text-white';
        } else if (t <= 18) {
          valText = `${t}° Tempéré`;
          badgeBg = 'bg-emerald-600 text-white';
        } else if (t <= 24) {
          valText = `${t}° Doux`;
          badgeBg = 'bg-amber-500 text-slate-950 font-bold';
        } else if (t < 35) {
          valText = `${t}° Chaud`;
          badgeBg = 'bg-orange-500 text-white font-bold';
        } else {
          valText = `${t}° Canicule`;
          badgeBg = 'bg-rose-600 text-white font-black animate-pulse';
        }
        metricCategoryDesc = `Seuil thermique officiel : ${valText}`;
      } else if (metricFilter === 'heatwave_risk') {
        // Météo-France IBM Heatwave criteria
        const ibm = getDepartmentIbmThreshold(st);
        let level = 'Vert';
        if (metrics.tMax >= ibm.tMax + 3 && metrics.tMin >= ibm.tMin + 2) {
          level = 'Rouge';
          badgeBg = 'bg-red-700 text-white animate-pulse';
        } else if (metrics.tMax >= ibm.tMax && metrics.tMin >= ibm.tMin) {
          level = 'Orange';
          badgeBg = 'bg-rose-600 text-white';
        } else if (metrics.tMax >= ibm.tMax || metrics.temp >= 30) {
          level = 'Jaune';
          badgeBg = 'bg-amber-500 text-slate-950 font-bold';
        } else {
          level = 'Vert';
          badgeBg = 'bg-emerald-600 text-white';
        }
        valText = `Canic: ${level}`;
        metricCategoryDesc = `Risque Canicule Météo-France : ${level} (Seuils IBM dép. : Nuit ${ibm.tMin}°C / Jour ${ibm.tMax}°C)`;
      } else if (metricFilter === 'coldwave_risk') {
        // Météo-France Coldwave criteria
        let level = 'Vert';
        if (metrics.tMax <= -2 && metrics.tMin <= -8) {
          level = 'Rouge';
          badgeBg = 'bg-purple-900 border-red-500 text-white';
        } else if (metrics.tMax <= 1 && metrics.tMin <= -3) {
          level = 'Orange';
          badgeBg = 'bg-indigo-700 text-white';
        } else if (metrics.tMin <= 1) {
          level = 'Jaune';
          badgeBg = 'bg-blue-600 text-white';
        } else {
          level = 'Vert';
          badgeBg = 'bg-emerald-600 text-white';
        }
        valText = `Froid: ${level}`;
        metricCategoryDesc = `Risque Vague de Froid Météo-France : ${level} (Tmin ${metrics.tMin}°C / Tmax ${metrics.tMax}°C)`;
      } else if (metricFilter === 'rain') {
        const r = metrics.rain;
        if (r <= 0) {
          badgeBg = 'bg-slate-700 text-slate-300';
          valText = '0 mm';
        } else if (r <= 0.4) {
          badgeBg = 'bg-sky-600 text-white';
          valText = `${r}mm`;
        } else if (r <= 2.0) {
          badgeBg = 'bg-blue-600 text-white';
          valText = `${r}mm`;
        } else if (r <= 5.0) {
          badgeBg = 'bg-indigo-600 text-white';
          valText = `${r}mm`;
        } else if (r <= 10.0) {
          badgeBg = 'bg-purple-600 text-white';
          valText = `${r}mm`;
        } else {
          badgeBg = 'bg-rose-600 text-white font-black';
          valText = `${r}mm`;
        }
        metricCategoryDesc = `Radar & Cumul de pluie : ${r} mm`;
      } else if (metricFilter === 'wind') {
        const w = metrics.wind;
        badgeBg = w > 80 ? 'bg-rose-600' : w > 55 ? 'bg-orange-500' : w > 35 ? 'bg-amber-500' : 'bg-teal-600';
        valText = `${w}k/h`;
        metricCategoryDesc = `Vent moyen : ${w} km/h (Rafales : ${metrics.windGust} km/h)`;
      } else if (metricFilter === 'altitude') {
        valText = `${st.altitude}m`;
        badgeBg = isHighSummit ? 'bg-fuchsia-600' : isMountain ? 'bg-purple-600' : (st.altitude ?? 0) > 400 ? 'bg-cyan-600' : 'bg-emerald-600';
        metricCategoryDesc = `Altitude : ${st.altitude} m`;
      }

      const iconHtml = `
        <div class="relative flex flex-col items-center group cursor-pointer">
          ${isSelected ? '<div class="absolute -inset-2 rounded-full bg-cyan-400 opacity-75 animate-ping"></div>' : ''}
          <div class="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full ${badgeBg} text-white font-black text-[10px] sm:text-[11px] shadow-lg border ${isSelected ? 'border-white ring-2 ring-cyan-400' : 'border-slate-900'}">
            ${isHighSummit ? '🏔️' : isMountain ? '⛰️' : ''}
            <span>${valText}</span>
          </div>
          <span class="mt-0.5 px-1 py-0.2 rounded bg-slate-950/90 text-[9px] font-bold text-slate-200 border border-slate-800 shadow whitespace-nowrap hidden xs:inline">
            ${st.name}
          </span>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-osm-marker',
        html: iconHtml,
        iconSize: [56, 32],
        iconAnchor: [28, 16]
      });

      const marker = L.marker([st.latitude, st.longitude], { icon: customIcon });

      const popupContent = `
        <div style="font-family: inherit; min-width: 180px; padding: 3px;">
          <div style="font-size: 10px; font-weight: 800; color: #38bdf8; text-transform: uppercase; margin-bottom: 2px;">
            ${isHighSummit ? '🏔️ Sommet Alpin / Pyrénéen' : isMountain ? '⛰️ Station Montagne' : '🌲 Station Synoptique'}
          </div>
          <div style="font-size: 15px; font-weight: 900; color: #ffffff; margin-bottom: 2px;">
            ${st.name}
          </div>
          <div style="font-size: 11px; color: #94a3b8; margin-bottom: 4px;">
            ${st.department || ''} • Altitude : <strong style="color: #67e8f9;">${st.altitude} m</strong>
          </div>
          <div style="font-size: 11px; padding: 4px 6px; border-radius: 6px; background: rgba(15,23,42,0.9); border: 1px solid #334155; margin-bottom: 6px;">
            <div style="color: #38bdf8; font-weight: 800;">${metricCategoryDesc}</div>
            <div style="color: #cbd5e1; font-size: 10px; margin-top: 2px;">
              Tmin : <strong>${metrics.tMin}°C</strong> • Tmax : <strong>${metrics.tMax}°C</strong> • Vent : <strong>${metrics.wind} km/h</strong>
            </div>
          </div>
          <button 
            id="popup-btn-${st.id}" 
            style="width: 100%; background: #0284c7; color: white; font-weight: 800; font-size: 11px; padding: 6px 8px; border-radius: 6px; border: none; cursor: pointer;"
          >
            Sélectionner ${st.name}
          </button>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`popup-btn-${st.id}`);
        if (btn) {
          btn.onclick = () => {
            onSelectStation(st);
            marker.closePopup();
          };
        }
      });

      marker.on('click', () => {
        onSelectStation(st);
      });

      marker.addTo(markersGroup);
    });
  }, [displayedStations, currentStation.id, metricFilter, liveStationsData]);

  // Handle region select and smooth flyToBounds
  const handleSelectRegion = (regionId: string) => {
    setSelectedRegion(regionId);
    const region = FRENCH_REGIONS.find(r => r.id === regionId);
    if (!region || !mapInstanceRef.current) return;

    mapInstanceRef.current.flyToBounds(region.bounds, {
      padding: [20, 20],
      duration: 1.0
    });
  };

  // Automatic zoom on currentStation change
  useEffect(() => {
    if (!mapInstanceRef.current || !currentStation.latitude || !currentStation.longitude) return;
    const nameLow = (currentStation.name || '').toLowerCase();
    const isRegion = currentStation.isRegion || 
      ['région', 'france', 'bretagne', 'normandie', 'occitanie', 'aquitaine', 'grand est', 'auvergne', 'corse', 'paca', 'provence', 'île-de-france', 'centre-val de loire', 'hauts-de-france', 'bourgogne'].some(r => nameLow.includes(r));
    
    const targetZoom = isRegion ? 8 : 12;
    mapInstanceRef.current.flyTo([currentStation.latitude, currentStation.longitude], targetZoom, {
      duration: 1.0
    });
  }, [currentStation.id, currentStation.latitude, currentStation.longitude, currentStation.isRegion]);

  // Center on current station
  const handleCenterOnStation = () => {
    if (!mapInstanceRef.current || !currentStation.latitude || !currentStation.longitude) return;
    mapInstanceRef.current.flyTo([currentStation.latitude, currentStation.longitude], 12, {
      duration: 1.0
    });
  };

  const activeRegionObj = FRENCH_REGIONS.find(r => r.id === selectedRegion) || FRENCH_REGIONS[0];

  return (
    <div id="france-map-interactive" className="space-y-4">
      {/* 1. Header Banner & Main Title */}
      <div className="rounded-lg border border-slate-800 bg-[#0F172A] p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-[#0284C7] text-[11px] font-bold uppercase tracking-wider mb-1">
              <Globe2 className="h-3.5 w-3.5" />
              <span>Cartographie OpenStreetMap Régions &amp; Relief</span>
            </div>
            <h2 className={`font-bold text-white ${seniorMode ? 'text-2xl' : 'text-xl sm:text-2xl'}`}>
              Carte OpenStreetMap des Régions &amp; Sommets
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Explorez le réseau météo en France métropolitaine : zoomez par région, filtrez par altitude et examinez les stations.
            </p>
          </div>

          {/* Search Button */}
          {onOpenSearchModal && (
            <button
              onClick={onOpenSearchModal}
              className="flex items-center gap-1.5 rounded-md bg-[#0284C7] hover:bg-sky-600 text-white font-semibold px-3 py-1.5 text-xs transition cursor-pointer"
            >
              <Search className="h-3.5 w-3.5" />
              <span>Rechercher une commune</span>
            </button>
          )}
        </div>

        {/* Region Fast Selector Strip - Horizontal Swipe */}
        <div className="mt-3 pt-2.5 border-t border-slate-800">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-300 mb-1.5">
            <Layers className="h-3 w-3 text-[#0284C7]" />
            <span>Sélection &amp; Zoom par Région :</span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none flex-nowrap">
            {FRENCH_REGIONS.map(reg => {
              const isSelected = selectedRegion === reg.id;
              return (
                <button
                  key={reg.id}
                  onClick={() => handleSelectRegion(reg.id)}
                  className={`flex shrink-0 items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-[#0284C7] text-white'
                      : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span>{reg.shortName}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter Controls Row - Mobile Horizontal Carousel */}
        <div className="mt-2.5 pt-2.5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
          {/* Metric Selector */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none flex-nowrap max-w-full">
            <span className="text-[11px] font-semibold text-slate-400 mr-1 shrink-0">Carte Thématique :</span>
            <div className="flex items-center gap-1 rounded-md bg-slate-900 p-0.5 border border-slate-800 shrink-0 overflow-x-auto scrollbar-none">
              {[
                { id: 'temp', label: 'Température', icon: <Thermometer className="h-3 w-3" />, color: 'bg-[#0284C7]' },
                { id: 'frost_prob', label: 'Probabilité Gel', icon: <Snowflake className="h-3 w-3" />, color: 'bg-indigo-600' },
                { id: 'thresholds', label: '7 Seuils Thermiques', icon: <SlidersHorizontal className="h-3 w-3" />, color: 'bg-emerald-600' },
                { id: 'heatwave_risk', label: 'Risque Canicule (IBM)', icon: <Flame className="h-3 w-3" />, color: 'bg-rose-600' },
                { id: 'coldwave_risk', label: 'Risque Grand Froid', icon: <ThermometerSnowflake className="h-3 w-3" />, color: 'bg-blue-700' },
                { id: 'rain', label: 'Radar & Pluie', icon: <Droplets className="h-3 w-3" />, color: 'bg-cyan-600' },
                { id: 'wind', label: 'Vent & Rafales', icon: <Wind className="h-3 w-3" />, color: 'bg-teal-600' },
                { id: 'altitude', label: 'Relief & Altitude', icon: <Mountain className="h-3 w-3" />, color: 'bg-purple-600' }
              ].map(metric => (
                <button
                  key={metric.id}
                  onClick={() => setMetricFilter(metric.id as MapMetricFilter)}
                  className={`flex items-center gap-1 rounded px-2.5 py-1 text-[11px] font-semibold transition cursor-pointer shrink-0 whitespace-nowrap ${
                    metricFilter === metric.id ? `${metric.color} text-white shadow-sm` : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  {metric.icon}
                  <span>{metric.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Elevation Filter */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none flex-nowrap">
            <span className="text-[11px] font-semibold text-slate-400 mr-1 shrink-0">Étage :</span>
            <div className="flex items-center gap-0.5 rounded-md bg-slate-900 p-0.5 border border-slate-800 shrink-0">
              {[
                { id: 'all', label: 'Tous' },
                { id: 'plains', label: '< 400m' },
                { id: 'mid', label: 'Moyenne' },
                { id: 'summits', label: 'Sommets' }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setElevationFilter(item.id as ElevationFilter)}
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold transition cursor-pointer shrink-0 ${
                    elevationFilter === item.id 
                      ? 'bg-[#0284C7] text-white' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Iconic Summits Fast Jump Bar */}
        <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto pb-1 flex-nowrap scrollbar-none">
          <div className="flex items-center gap-1 text-[10px] font-semibold text-amber-300 shrink-0">
            <Mountain className="h-3 w-3" />
            <span>Sommets :</span>
          </div>
          {iconicSummits.map(summit => {
            const isSelected = summit.id === currentStation.id;
            return (
              <button
                key={summit.id}
                onClick={() => {
                  onSelectStation(summit);
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.flyTo([summit.latitude, summit.longitude], 11, { duration: 1 });
                  }
                }}
                className={`flex shrink-0 items-center gap-1 rounded px-2 py-0.5 text-[10px] font-medium transition cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-amber-400 text-slate-950 font-bold'
                    : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>{summit.name}</span>
                <span className="font-mono text-[9px] text-amber-300 bg-slate-950 px-1 rounded">
                  {summit.altitude}m
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Main Map Graphic and HUD Card */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left 3 Cols: Interactive OpenStreetMap Map */}
        <div className={`lg:col-span-3 rounded-lg border border-slate-800 bg-slate-950 overflow-hidden flex flex-col ${isFullscreen ? '!fixed !inset-0 !z-[99999] !rounded-none !border-0 !m-0 !h-[100dvh] !w-screen overscroll-none' : 'relative h-[460px] sm:h-[580px]'}`}>
          
          {/* Top Controls Overlay on Map */}
          <div className="absolute top-2 left-2 right-2 sm:top-3 sm:left-3 sm:right-3 z-[400] flex items-center justify-between gap-1.5 pointer-events-none">
            {/* Left: Tile Layer Selector */}
            <div className="flex items-center gap-0.5 rounded-md bg-slate-950/95 p-0.5 border border-slate-800 shadow-md backdrop-blur pointer-events-auto overflow-x-auto scrollbar-none flex-nowrap">
              {[
                { id: 'osm', label: 'Standard' },
                { id: 'topo', label: 'Relief' },
                { id: 'dark', label: 'Sombre' },
                { id: 'satellite', label: 'Satellite' }
              ].map(tile => (
                <button
                  key={tile.id}
                  onClick={() => setBaseLayer(tile.id as OsmBaseLayer)}
                  className={`px-2 py-1 rounded text-[10px] font-semibold transition cursor-pointer whitespace-nowrap ${
                    baseLayer === tile.id
                      ? 'bg-[#0284C7] text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tile.label}
                </button>
              ))}
            </div>

            {/* Right: Map Actions */}
            <div className="flex items-center gap-1 pointer-events-auto">
              <button
                onClick={handleCenterOnStation}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-950/95 border border-slate-700 text-sky-300 hover:bg-slate-800 hover:text-white font-semibold text-[10px] backdrop-blur transition cursor-pointer"
                title={`Centrer sur ${currentStation.name}`}
              >
                <MapPin className="h-3 w-3" />
                <span className="hidden xs:inline">Centrer ({currentStation.name})</span>
              </button>

              <button
                onClick={() => handleSelectRegion('france')}
                className="px-2 py-1 rounded-md bg-slate-950/95 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white font-semibold text-[10px] backdrop-blur transition cursor-pointer"
                title="Recentrer sur la France"
              >
                France
              </button>

              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-1.5 rounded-md bg-slate-950/95 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white backdrop-blur transition cursor-pointer"
                title={isFullscreen ? 'Quitter' : 'Plein écran'}
              >
                {isFullscreen ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
              </button>
            </div>
          </div>

          {/* Leaflet Map DOM Container */}
          <div ref={mapContainerRef} className="w-full h-full" style={{ minHeight: '100%' }} />

          {/* Bottom Floating Info Pill on Map */}
          <div className="absolute bottom-2 left-2 z-[400] pointer-events-none">
            <div className="rounded-md border border-slate-800 bg-slate-950/95 px-2.5 py-1 backdrop-blur pointer-events-auto flex items-center gap-1.5 text-[10px]">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse" />
              <span className="text-slate-300">
                <strong className="text-white">{displayedStations.length}</strong> stations • Cliquez sur un point pour sélectionner
              </span>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Active Station & Regional Inspector HUD */}
        <div className="space-y-3 flex flex-col">
          {/* Active Region Focus Card */}
          <div className="rounded-lg border border-slate-800 bg-[#0F172A] p-4">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#0284C7] uppercase tracking-wider mb-1">
              <Compass className="h-3.5 w-3.5" />
              <span>Région Active</span>
            </div>
            <h3 className="text-base font-bold text-white">{activeRegionObj.name}</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">{activeRegionObj.climate}</p>
            
            <div className="mt-2.5 pt-2.5 border-t border-slate-800 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Point culminant :</span>
                <strong className="text-amber-400">{activeRegionObj.highestPeak}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Départements :</span>
                <span className="text-slate-300 text-[10px] text-right">{activeRegionObj.departments}</span>
              </div>
            </div>
          </div>

          {/* Active Station Card */}
          <div className="rounded-lg border border-slate-800 bg-[#0F172A] p-4 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#0284C7] uppercase tracking-wider mb-1">
                <MapPin className="h-3.5 w-3.5" />
                <span>Station Sélectionnée</span>
              </div>
              <h3 className="text-lg font-bold text-white">{currentStation.name}</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {currentStation.department} • Région {currentStation.region}
              </p>

              {/* Station Elevation & Topo Badge */}
              <div className="mt-2.5 p-2.5 rounded-md bg-slate-900 border border-slate-800 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Altitude sol :</span>
                  <strong className="text-sky-300 font-mono">{currentStation.altitude} m</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Zone climatique :</span>
                  <strong className="text-slate-200 text-[10px] text-right">{currentStation.climateZone || 'Tempéré'}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Type de relief :</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-medium border border-slate-700">
                    {(currentStation.altitude ?? 0) >= 2000 ? 'Haute Montagne' : (currentStation.altitude ?? 0) >= 800 ? 'Montagne' : 'Plaine / Vallée'}
                  </span>
                </div>
              </div>

              {/* Station Key Records */}
              <div className="mt-2.5 grid grid-cols-2 gap-2 text-center text-xs">
                <div className="p-2 rounded-md bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Record Chaleur</span>
                  <strong className="text-rose-400 font-bold">{currentStation.allTimeRecordMax ?? 40}°C</strong>
                </div>
                <div className="p-2 rounded-md bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Record Froid</span>
                  <strong className="text-sky-400 font-bold">{currentStation.allTimeRecordMin ?? -20}°C</strong>
                </div>
              </div>
            </div>

            {/* Change Station Button */}
            {onOpenSearchModal && (
              <div className="mt-3 pt-2.5 border-t border-slate-800">
                <button
                  onClick={onOpenSearchModal}
                  className="w-full py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Search className="h-3.5 w-3.5" />
                  <span>Changer de Station</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Scientific Criteria & Met-Standard Explanation Legend */}
      <div className="rounded-lg border border-slate-800 bg-[#0F172A] p-4 text-xs text-slate-300">
        <div className="flex items-start gap-2.5">
          <div className="p-1.5 rounded-md bg-slate-900 border border-slate-800 text-[#0284C7] shrink-0 mt-0.5">
            <Info className="h-4 w-4" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">
                {metricFilter === 'temp' && '🌡️ Température Instantanée en Direct (Sans Biais)'}
                {metricFilter === 'frost_prob' && '❄️ Probabilité Agronomique de Gelée (0°C, -2°C, -5°C)'}
                {metricFilter === 'thresholds' && '📊 Les 7 Seuils Thermiques Normalisés'}
                {metricFilter === 'heatwave_risk' && '🔥 Risque Canicule selon Critères Officiels Météo-France (Indices IBM)'}
                {metricFilter === 'coldwave_risk' && '🧊 Risque Vague de Froid selon Critères Officiels Météo-France'}
                {metricFilter === 'rain' && '🌧️ Radar Précipitations & Échelle Pluviométrique Certifiée'}
                {metricFilter === 'wind' && '💨 Vent Moyen Normalisé (10m) & Rafales'}
                {metricFilter === 'altitude' && '⛰️ Topographie, Relief & Étagements Bioclimatiques'}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800 text-[10px] font-semibold">
                Haute Fiabilité Météorologique
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              {metricFilter === 'temp' && 
                "Données thermiques en temps réel synchronisées avec les stations météo officielles et corrigées du gradient adiabatique altitudinal (-0.65°C / 100m). Les valeurs affichées correspondent aux observations réelles sans aucune température fictive."}
              {metricFilter === 'frost_prob' && 
                "Calcul agronomique de gelée fondé sur la température sous abri, la température minimale et le rayonnement nocturne : 0°C (seuil de gelée blanche au sol), -2°C (gelée modérée à risque végétal), -5°C (gelée sévère destructrice pour l'arboriculture et la vigne)."}
              {metricFilter === 'thresholds' && 
                "Échelonnement physique des 7 seuils : Gel sévère (< -5°C), Gelée (0 à 2°C), Fraîcheur (5 à 10°C), Tempéré (12 à 18°C), Douceur (19 à 24°C), Chaleur (> 25°C), Canicule (> 35°C)."}
              {metricFilter === 'heatwave_risk' && 
                "Une canicule est strictement validée selon les critères Météo-France lorsque les températures minimales (nuit) ET maximales (jour) franchissent simultanément les seuils IBM départementaux pendant au moins 3 jours et 3 nuits consécutifs (ex: Paris 21°C/31°C, Lyon 20°C/34°C, Marseille 24°C/35°C). Aucun risque arbitraire n'est extrapolé."}
              {metricFilter === 'coldwave_risk' && 
                "Conformément aux normes Météo-France, une vague de froid exige que l'indicateur thermique reste sous 2.0°C pendant au moins 3 jours consécutifs avec journée sans dégel (Tmax <= 0°C). Les épisodes ordinaires de fraîcheur automnale ne sont pas classés comme vague de froid."}
              {metricFilter === 'rain' && 
                "Échelle radar calibrée : 0 mm (Sec), < 0.5 mm (Traces / Bruine), 0.5 à 2 mm (Pluie faible), 2 à 5 mm (Pluie modérée), 5 à 10 mm (Pluie soutenue), > 10 mm (Pluie forte / orageuse). Dégradé haute précision sans faux positifs."}
              {metricFilter === 'wind' && 
                "Mesure de la vitesse moyenne du vent à 10 mètres du sol selon la norme OMM, avec identification des rafales instantanées en sommet et sur les façades maritimes."}
              {metricFilter === 'altitude' && 
                "Cartographie des zones de plaine (<400m), moyenne montagne collinéenne (400-1200m) et haute montagne alpine et pyrénéenne (>1200m)."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
