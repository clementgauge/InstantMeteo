import React, { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import { LocationPoint } from '../types/weather';
import { FRENCH_STATIONS } from '../data/frenchStations';
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
  Info
} from 'lucide-react';

interface FranceMapInteractiveProps {
  currentStation: LocationPoint;
  onSelectStation: (station: LocationPoint) => void;
  seniorMode?: boolean;
  onOpenSearchModal?: () => void;
}

export type MapMetricFilter = 'temp' | 'altitude' | 'anomaly' | 'rain' | 'wind';
export type ElevationFilter = 'all' | 'plains' | 'mid' | 'summits';
export type MassifFilter = 'all' | 'alpes' | 'pyrenees' | 'massifCentral' | 'vosgesJura' | 'corse';
export type OsmBaseLayer = 'osm' | 'topo' | 'dark' | 'satellite';

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
    name: 'Bretagne',
    shortName: '⛵ Bretagne',
    center: [48.2, -2.9],
    zoom: 8,
    bounds: [[47.2, -4.9], [48.9, -1.0]],
    climate: 'Hyper-océanique venteux & très tempéré',
    highestPeak: 'Roc\'h Ruz (385 m)',
    departments: '22, 29, 35, 56'
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

  // Dynamic calculated station values
  const getStationMetrics = (st: LocationPoint) => {
    const isSouth = st.latitude < 45.0;
    const lapse = (st.altitude / 1000) * 6.5;
    const baseT = Number(((isSouth ? 23.5 : 19.8) - lapse).toFixed(1));
    const anomaly = Number((isSouth ? +1.8 : +1.2).toFixed(1));
    const rain = st.id.includes('brest') ? 3.8 : st.id.includes('nice') ? 0 : isSouth ? 0.4 : 1.2;
    const wind = Math.round(st.altitude > 2000 ? 55 : st.latitude < 44 ? 42 : 25);
    return { temp: baseT, anomaly, rain, wind, altitude: st.altitude };
  };

  // Base tile layer URLs
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
        return {
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          attribution: '© ESRI'
        };
      case 'osm':
      default:
        return {
          url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          attribution: '© OpenStreetMap'
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

      if (metricFilter === 'temp') {
        valText = `${metrics.temp}°C`;
        badgeBg = metrics.temp >= 25 ? 'bg-orange-500' : metrics.temp >= 15 ? 'bg-amber-500' : metrics.temp >= 0 ? 'bg-blue-600' : 'bg-indigo-600';
      } else if (metricFilter === 'altitude') {
        valText = `${st.altitude}m`;
        badgeBg = isHighSummit ? 'bg-fuchsia-600' : isMountain ? 'bg-purple-600' : (st.altitude ?? 0) > 400 ? 'bg-cyan-600' : 'bg-emerald-600';
      } else if (metricFilter === 'anomaly') {
        valText = `+${metrics.anomaly}°`;
        badgeBg = metrics.anomaly >= 2 ? 'bg-red-500' : 'bg-amber-500';
      } else if (metricFilter === 'rain') {
        valText = `${metrics.rain}mm`;
        badgeBg = metrics.rain > 0 ? 'bg-indigo-600' : 'bg-emerald-600';
      } else if (metricFilter === 'wind') {
        valText = `${metrics.wind}k/h`;
        badgeBg = metrics.wind > 50 ? 'bg-rose-600' : metrics.wind > 35 ? 'bg-amber-500' : 'bg-teal-600';
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
        iconSize: [50, 32],
        iconAnchor: [25, 16]
      });

      const marker = L.marker([st.latitude, st.longitude], { icon: customIcon });

      const popupContent = `
        <div style="font-family: inherit; min-width: 170px; padding: 2px;">
          <div style="font-size: 10px; font-weight: 800; color: #38bdf8; text-transform: uppercase; margin-bottom: 2px;">
            ${isHighSummit ? '🏔️ Sommet Alpin / Pyrénéen' : isMountain ? '⛰️ Station Montagne' : '🌲 Station Synoptique'}
          </div>
          <div style="font-size: 15px; font-weight: 900; color: #ffffff; margin-bottom: 2px;">
            ${st.name}
          </div>
          <div style="font-size: 11px; color: #94a3b8; margin-bottom: 6px;">
            Altitude : <strong style="color: #67e8f9;">${st.altitude} m</strong> • Dép. ${st.department || ''}
          </div>
          <button 
            id="popup-btn-${st.id}" 
            style="width: 100%; background: #2563eb; color: white; font-weight: 800; font-size: 11px; padding: 5px 8px; border-radius: 8px; border: none; cursor: pointer;"
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
  }, [displayedStations, currentStation.id, metricFilter]);

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
    <div id="france-map-interactive" className="space-y-4 sm:space-y-6">
      {/* 1. Header Banner & Main Title */}
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-blue-950/40 to-slate-900 p-4 sm:p-7 shadow-2xl backdrop-blur relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-blue-400 text-[11px] font-black uppercase tracking-wider mb-1">
              <Globe2 className="h-3.5 w-3.5 text-cyan-400" />
              <span>Cartographie OpenStreetMap Régions &amp; Relief</span>
            </div>
            <h2 className={`font-black text-white ${seniorMode ? 'text-2xl' : 'text-xl sm:text-3xl'}`}>
              Carte OpenStreetMap des Régions &amp; Sommets
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Explorez le réseau synoptique de France : zoomez par région, comparez plaines et sommets de montagne.
            </p>
          </div>

          {/* Search Button */}
          {onOpenSearchModal && (
            <button
              onClick={onOpenSearchModal}
              className="flex items-center gap-1.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-2 text-xs shadow-lg shadow-blue-600/30 transition active:scale-95 cursor-pointer"
            >
              <Search className="h-3.5 w-3.5" />
              <span>35 000 communes</span>
            </button>
          )}
        </div>

        {/* Region Fast Selector Strip - Horizontal Swipe */}
        <div className="mt-3.5 pt-3 border-t border-slate-800/80">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-300 mb-1.5">
            <Layers className="h-3 w-3 text-cyan-400" />
            <span>Sélection &amp; Zoom par Région :</span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none flex-nowrap">
            {FRENCH_REGIONS.map(reg => {
              const isSelected = selectedRegion === reg.id;
              return (
                <button
                  key={reg.id}
                  onClick={() => handleSelectRegion(reg.id)}
                  className={`flex shrink-0 items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-cyan-500 text-slate-950 font-black shadow-md ring-1 ring-white/60'
                      : 'bg-slate-950/80 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span>{reg.shortName}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter Controls Row - Mobile Horizontal Carousel */}
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
          {/* Metric Selector */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none flex-nowrap">
            <span className="text-[11px] font-bold text-slate-400 mr-1 shrink-0">Grandeur :</span>
            <div className="flex items-center gap-1 rounded-xl bg-slate-950 p-0.5 border border-slate-800 shrink-0">
              {[
                { id: 'temp', label: 'Température', icon: <Thermometer className="h-3 w-3" />, color: 'bg-blue-600' },
                { id: 'altitude', label: 'Altitude', icon: <Mountain className="h-3 w-3" />, color: 'bg-purple-600' },
                { id: 'anomaly', label: 'Anomalies', icon: <TrendingUp className="h-3 w-3" />, color: 'bg-amber-600' },
                { id: 'rain', label: 'Pluie', icon: <CloudRain className="h-3 w-3" />, color: 'bg-indigo-600' },
                { id: 'wind', label: 'Vent', icon: <Wind className="h-3 w-3" />, color: 'bg-teal-600' }
              ].map(metric => (
                <button
                  key={metric.id}
                  onClick={() => setMetricFilter(metric.id as MapMetricFilter)}
                  className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold transition cursor-pointer shrink-0 ${
                    metricFilter === metric.id ? `${metric.color} text-white shadow` : 'text-slate-400 hover:text-slate-200'
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
            <span className="text-[11px] font-bold text-slate-400 mr-1 shrink-0">Étage :</span>
            <div className="flex items-center gap-0.5 rounded-xl bg-slate-950 p-0.5 border border-slate-800 shrink-0">
              {[
                { id: 'all', label: 'Tous' },
                { id: 'plains', label: '< 400m' },
                { id: 'mid', label: 'Moyenne' },
                { id: 'summits', label: '⛰️ Sommets' }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setElevationFilter(item.id as ElevationFilter)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition cursor-pointer shrink-0 ${
                    elevationFilter === item.id 
                      ? 'bg-cyan-500 text-slate-950 font-black shadow' 
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
        <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center gap-1.5 overflow-x-auto pb-1 flex-nowrap scrollbar-none">
          <div className="flex items-center gap-1 text-[10px] font-bold text-amber-300 shrink-0">
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
                className={`flex shrink-0 items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] font-bold transition cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-amber-400 text-slate-950 font-black shadow-md ring-1 ring-white/60'
                    : 'bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>{summit.name}</span>
                <span className="font-mono text-[9px] text-amber-400 bg-amber-950/60 px-1 rounded">
                  {summit.altitude}m
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Main Map Graphic and HUD Card */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Left 3 Cols: Interactive OpenStreetMap Map */}
        <div className={`lg:col-span-3 rounded-3xl border border-slate-800 bg-slate-950 shadow-2xl relative overflow-hidden flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 rounded-none h-screen w-screen' : 'h-[460px] sm:h-[600px]'}`}>
          
          {/* Top Controls Overlay on Map */}
          <div className="absolute top-2 left-2 right-2 sm:top-3 sm:left-3 sm:right-3 z-[400] flex items-center justify-between gap-1.5 pointer-events-none">
            {/* Left: Tile Layer Selector */}
            <div className="flex items-center gap-0.5 rounded-2xl bg-slate-950/95 p-0.5 border border-slate-800/90 shadow-xl backdrop-blur pointer-events-auto overflow-x-auto scrollbar-none flex-nowrap">
              {[
                { id: 'osm', label: 'Standard' },
                { id: 'topo', label: '⛰️ Relief' },
                { id: 'dark', label: '🌙 Sombre' },
                { id: 'satellite', label: '🛰️ Sat' }
              ].map(tile => (
                <button
                  key={tile.id}
                  onClick={() => setBaseLayer(tile.id as OsmBaseLayer)}
                  className={`px-2 py-1 rounded-xl text-[10px] font-bold transition cursor-pointer whitespace-nowrap ${
                    baseLayer === tile.id
                      ? 'bg-blue-600 text-white shadow ring-1 ring-white/40'
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
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-950/95 border border-blue-500/40 text-blue-300 hover:bg-blue-600 hover:text-white font-bold text-[10px] shadow-xl backdrop-blur transition cursor-pointer"
                title={`Centrer sur ${currentStation.name}`}
              >
                <MapPin className="h-3 w-3" />
                <span className="hidden xs:inline">Centrer ({currentStation.name})</span>
              </button>

              <button
                onClick={() => handleSelectRegion('france')}
                className="px-2 py-1 rounded-xl bg-slate-950/95 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white font-bold text-[10px] shadow-xl backdrop-blur transition cursor-pointer"
                title="Recentrer sur la France"
              >
                🇫🇷 France
              </button>

              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-1.5 rounded-xl bg-slate-950/95 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white shadow-xl backdrop-blur transition cursor-pointer"
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
            <div className="rounded-xl border border-slate-800/90 bg-slate-950/95 px-2.5 py-1 shadow-xl backdrop-blur pointer-events-auto flex items-center gap-1.5 text-[10px]">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-slate-300">
                <strong className="text-white">{displayedStations.length}</strong> stations • Touchez un point pour voir sa météo
              </span>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Active Station & Regional Inspector HUD */}
        <div className="space-y-3 sm:space-y-4 flex flex-col">
          {/* Active Region Focus Card */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-4 sm:p-5 shadow-xl backdrop-blur">
            <div className="flex items-center gap-1.5 text-[11px] font-black text-cyan-400 uppercase tracking-wider mb-1">
              <Compass className="h-3.5 w-3.5 text-cyan-400" />
              <span>Région Active</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-white">{activeRegionObj.name}</h3>
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
          <div className="rounded-3xl border-2 border-blue-500/40 bg-slate-900/90 p-4 sm:p-5 shadow-2xl backdrop-blur flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-black text-blue-400 uppercase tracking-wider mb-1.5">
                <MapPin className="h-3.5 w-3.5 text-blue-400 animate-bounce" />
                <span>Station Sélectionnée</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white">{currentStation.name}</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {currentStation.department} • Région {currentStation.region}
              </p>

              {/* Station Elevation & Topo Badge */}
              <div className="mt-3 p-2.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Altitude sol :</span>
                  <strong className="text-cyan-300 font-mono">{currentStation.altitude} m</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Zone climatique :</span>
                  <strong className="text-slate-200 text-[10px] text-right">{currentStation.climateZone || 'Tempéré'}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Type de relief :</span>
                  <span className="px-1.5 py-0.5 rounded bg-blue-950/80 text-blue-300 text-[10px] font-bold">
                    {(currentStation.altitude ?? 0) >= 2000 ? '🏔️ Haute Montagne' : (currentStation.altitude ?? 0) >= 800 ? '⛰️ Montagne' : '🌲 Plaine / Vallée'}
                  </span>
                </div>
              </div>

              {/* Station Key Records */}
              <div className="mt-3 grid grid-cols-2 gap-2 text-center text-xs">
                <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Record Chaleur</span>
                  <strong className="text-rose-400 font-black">{currentStation.allTimeRecordMax ?? 40}°C</strong>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Record Froid</span>
                  <strong className="text-sky-400 font-black">{currentStation.allTimeRecordMin ?? -20}°C</strong>
                </div>
              </div>
            </div>

            {/* Change Station Button */}
            {onOpenSearchModal && (
              <div className="mt-3 pt-2.5 border-t border-slate-800">
                <button
                  onClick={onOpenSearchModal}
                  className="w-full py-2 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-blue-600/30"
                >
                  <Search className="h-3.5 w-3.5" />
                  <span>Changer de Station</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
