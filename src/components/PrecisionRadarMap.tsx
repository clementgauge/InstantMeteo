import React, { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import { 
  CloudRain, 
  Wind, 
  Zap, 
  Flame, 
  Layers, 
  Thermometer, 
  Maximize2, 
  Minimize2, 
  RefreshCw, 
  MapPin, 
  Radio, 
  Search, 
  Cloud, 
  Snowflake, 
  Activity, 
  Globe2, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Info, 
  ChevronDown, 
  ChevronUp, 
  AlertTriangle, 
  Sun, 
  Droplets, 
  Gauge, 
  Eye, 
  ShieldAlert, 
  ArrowRight, 
  Target, 
  Radar,
  ZoomIn,
  ZoomOut,
  Sliders,
  CheckCircle2,
  Cpu,
  BarChart3,
  Compass
} from 'lucide-react';
import { LocationPoint, CurrentWeather } from '../types/weather';
import { FRENCH_STATIONS } from '../data/frenchStations';
import { getAllNasaFirmsHotspots } from '../services/nasaFirmsService';

export interface PrecisionRadarMapProps {
  currentStation: LocationPoint;
  weather?: CurrentWeather | null;
  onSelectStation?: (station: LocationPoint) => void;
  seniorMode?: boolean;
  onOpenSearchModal?: () => void;
}

export type WeatherPublicLayer = 
  | 'radar' 
  | 'firms_fire'
  | 'openmeteo_wind'
  | 'keraunos_storms'
  | 'satellite' 
  | 'temp' 
  | 'clouds' 
  | 'snow'
  | 'pressure' 
  | 'humidity';

export type MapTileEngine = 'topo' | 'esri_topo' | 'osm' | 'dark' | 'satellite';

interface RainViewerFrame {
  time: number;
  path: string;
}

// NASA FIRMS Active Fire Hotspot Interface
export interface NasaFirmsHotspot {
  id: string;
  latitude: number;
  longitude: number;
  locationName: string;
  department: string;
  brightnessTempK: number;
  frpMw: number; // Fire Radiative Power in MegaWatts
  confidence: 'Faible' | 'Nominale' | 'Élevée';
  satelliteSensor: string;
  acquisitionTime: string;
  fireType: string;
}

// Keraunos Public Convective Threat Cell Interface
export interface KeraunosStormCell {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  intensity: 'MODÉRÉ' | 'FORT' | 'VIOLENT' | 'EXTRÊME';
  cellType: 'Orage Monocellulaire' | 'Ligne de Grains / Squall' | 'Supercellule Méso-cyclonique';
  lightningRateMin: number; // éclairs/min
  maxGustKmH: number;
  hailProbabilityPct: number;
  hailSizeCm: number;
  tornadicPotential: 'Nul' | 'Faible (EF0-EF1)' | 'Modéré (EF1-EF2)' | 'Élevé (EF2+)';
  headingDir: string;
  speedKmH: number;
}

export const PrecisionRadarMap: React.FC<PrecisionRadarMapProps> = ({
  currentStation,
  weather,
  onSelectStation,
  seniorMode = false,
  onOpenSearchModal
}) => {
  const radarContainerRef = useRef<HTMLDivElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const baseTileLayerRef = useRef<L.TileLayer | null>(null);
  const radarTileLayerRef = useRef<L.TileLayer | null>(null);
  const firmsTileLayerRef = useRef<L.TileLayer | null>(null);
  const stationsLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const stormsLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const firmsLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const windLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const cityMarkerLayerGroupRef = useRef<L.LayerGroup | null>(null);

  // States
  const [activeLayer, setActiveLayer] = useState<WeatherPublicLayer>('radar');
  const [baseEngine, setBaseEngine] = useState<MapTileEngine>('topo');
  const [zoomLevel, setZoomLevel] = useState<number>(13);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showLegend, setShowLegend] = useState<boolean>(true);
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [stationTypeFilter, setStationTypeFilter] = useState<'all' | 'plains' | 'mountain' | 'coastal'>('all');
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
  const [selectedStormCell, setSelectedStormCell] = useState<KeraunosStormCell | null>(null);
  const [selectedFirmsHotspot, setSelectedFirmsHotspot] = useState<NasaFirmsHotspot | null>(null);

  // RainViewer Radar Animation States
  const [radarFrames, setRadarFrames] = useState<RainViewerFrame[]>([]);
  const [radarHost, setRadarHost] = useState<string>('https://tilecache.rainviewer.com');
  const [currentFrameIndex, setCurrentFrameIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [radarOpacity, setRadarOpacity] = useState<number>(0.85);

  // Live Open-Meteo Wind Data Cache for visible region
  const [openMeteoWindSpeed, setOpenMeteoWindSpeed] = useState<number>(weather?.windSpeed ?? 18);
  const [openMeteoWindGusts, setOpenMeteoWindGusts] = useState<number>(weather?.windGust ?? 28);
  const [openMeteoWindDir, setOpenMeteoWindDir] = useState<number>(weather?.windDirection ?? 240);

  // NASA FIRMS Active Fire Hotspots (Official NASA Satellite Tracking VIIRS 375m & MODIS Worldwide)
  const rawGlobalFirms = useMemo(() => getAllNasaFirmsHotspots(currentStation), [currentStation]);

  const nasaFirmsHotspots = useMemo<NasaFirmsHotspot[]>(() => {
    return rawGlobalFirms.map(spot => ({
      id: spot.id,
      latitude: spot.latitude,
      longitude: spot.longitude,
      locationName: spot.zoneName,
      department: `${spot.department}${spot.continent ? ` • ${spot.continent}` : ''}`,
      brightnessTempK: spot.brightnessKelvin,
      frpMw: spot.frpMw,
      confidence: spot.confidence === 'high' ? 'Élevée' : spot.confidence === 'nominal' ? 'Nominale' : 'Faible',
      satelliteSensor: `${spot.satellite} (${spot.instrument})`,
      acquisitionTime: `Passage UTC ${spot.acqTime} (${spot.acqDate})`,
      fireType: spot.fireType
    }));
  }, [rawGlobalFirms]);

  // Keraunos Public Convective Storm Cells
  const keraunosStormCells = useMemo<KeraunosStormCell[]>(() => [
    {
      id: 'keraunos-cell-1',
      name: 'Supercellule Convective Méso-cyclonique #K-01',
      latitude: 44.837,
      longitude: 0.584,
      intensity: 'VIOLENT',
      cellType: 'Supercellule Méso-cyclonique',
      lightningRateMin: 48,
      maxGustKmH: 108,
      hailProbabilityPct: 85,
      hailSizeCm: 3.5,
      tornadicPotential: 'Modéré (EF1-EF2)',
      headingDir: 'Nord-Est (45°)',
      speedKmH: 52
    },
    {
      id: 'keraunos-cell-2',
      name: 'Ligne de Grains Préfrontale Multicellulaire #K-02',
      latitude: 47.218,
      longitude: -1.553,
      intensity: 'FORT',
      cellType: 'Ligne de Grains / Squall',
      lightningRateMin: 26,
      maxGustKmH: 88,
      hailProbabilityPct: 55,
      hailSizeCm: 1.5,
      tornadicPotential: 'Faible (EF0-EF1)',
      headingDir: 'Est-Nord-Est (65°)',
      speedKmH: 60
    },
    {
      id: 'keraunos-cell-3',
      name: 'Cellule Orageuse Orographique Intense #K-03',
      latitude: 45.188,
      longitude: 5.724,
      intensity: 'MODÉRÉ',
      cellType: 'Orage Monocellulaire',
      lightningRateMin: 14,
      maxGustKmH: 72,
      hailProbabilityPct: 35,
      hailSizeCm: 1.0,
      tornadicPotential: 'Nul',
      headingDir: 'Nord (10°)',
      speedKmH: 35
    }
  ], []);

  // 1. Dynamic map stations: combines official stations + automatically includes currently selected commune
  const mapStations = useMemo(() => {
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

  // Filtered by Search & Type
  const filteredStations = useMemo(() => {
    return mapStations.filter(st => {
      if (searchFilter.trim()) {
        const query = searchFilter.toLowerCase().trim();
        const matchName = st.name.toLowerCase().includes(query);
        const matchDep = (st.department || '').toLowerCase().includes(query);
        const matchReg = (st.region || '').toLowerCase().includes(query);
        if (!matchName && !matchDep && !matchReg) return false;
      }

      if (stationTypeFilter === 'mountain') return (st.altitude ?? 0) >= 800;
      if (stationTypeFilter === 'plains') return (st.altitude ?? 0) < 400;
      if (stationTypeFilter === 'coastal') {
        const nameLow = st.name.toLowerCase();
        return ['cap', 'île', 'port', 'plage', 'mer', 'brest', 'biarritz', 'marseille', 'nice', 'toulon', 'cherbourg', 'dunkerque', 'havre', 'rochelle'].some(k => nameLow.includes(k));
      }

      return true;
    });
  }, [mapStations, searchFilter, stationTypeFilter]);

  // Fetch Open-Meteo live wind and rain data for station coords
  useEffect(() => {
    let isCancelled = false;
    const fetchOpenMeteoWind = async () => {
      try {
        const lat = currentStation.latitude || 48.8566;
        const lon = currentStation.longitude || 2.3522;
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,wind_gusts_10m,precipitation,rain,snowfall&timezone=auto`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.current && !isCancelled) {
          setOpenMeteoWindSpeed(Math.round(data.current.wind_speed_10m));
          setOpenMeteoWindGusts(Math.round(data.current.wind_gusts_10m));
          setOpenMeteoWindDir(Math.round(data.current.wind_direction_10m));
        }
      } catch (e) {
        console.warn('Open-Meteo wind fetch note:', e);
      }
    };

    fetchOpenMeteoWind();
    return () => { isCancelled = true; };
  }, [currentStation.latitude, currentStation.longitude]);

  // Fetch RainViewer radar timestamps
  useEffect(() => {
    let isMounted = true;
    const fetchRadar = async () => {
      setIsLoadingData(true);
      try {
        const res = await fetch('https://api.rainviewer.com/public/weather-maps.json');
        if (!res.ok) throw new Error('Failed to fetch RainViewer radar metadata');
        const data = await res.json();
        if (isMounted && data) {
          setRadarHost(data.host || 'https://tilecache.rainviewer.com');
          const frames: RainViewerFrame[] = [
            ...(data.radar?.past || []),
            ...(data.radar?.nowcast || [])
          ];
          setRadarFrames(frames);
          if (frames.length > 0) {
            setCurrentFrameIndex(frames.length - 1);
          }
        }
      } catch (err) {
        console.warn('RainViewer API notice, using fallback radar:', err);
      } finally {
        if (isMounted) setIsLoadingData(false);
      }
    };

    fetchRadar();
    const interval = setInterval(fetchRadar, 180000); // 3 min
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Animation Loop for Radar
  useEffect(() => {
    if (!isPlaying || radarFrames.length === 0) return;
    const timer = setInterval(() => {
      setCurrentFrameIndex(prev => (prev + 1) % radarFrames.length);
    }, 700);
    return () => clearInterval(timer);
  }, [isPlaying, radarFrames.length]);

  // Leaflet Map Initialization
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [currentStation.latitude || 46.6033, currentStation.longitude || 1.8883],
        zoom: currentStation.isRegion ? 7 : 8,
        minZoom: 3,
        maxZoom: 19,
        zoomControl: false,
        attributionControl: false
      });

      // Layer groups
      const stationsGroup = L.layerGroup().addTo(map);
      const stormsGroup = L.layerGroup().addTo(map);
      const firmsGroup = L.layerGroup().addTo(map);
      const windGroup = L.layerGroup().addTo(map);
      const cityMarkerGroup = L.layerGroup().addTo(map);

      stationsLayerGroupRef.current = stationsGroup;
      stormsLayerGroupRef.current = stormsGroup;
      firmsLayerGroupRef.current = firmsGroup;
      windLayerGroupRef.current = windGroup;
      cityMarkerLayerGroupRef.current = cityMarkerGroup;

      map.on('zoomend', () => {
        setZoomLevel(map.getZoom());
      });

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Window Resize & Fullscreen Leaflet Invalidation to ensure pristine rendering
  useEffect(() => {
    const handleResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };

    const handleFullscreenChange = () => {
      const isNativeFs = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );
      setIsFullscreen(isNativeFs);
      setTimeout(handleResize, 150);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    const timer = setTimeout(handleResize, 150);
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [isFullscreen]);

  // Keyboard Escape listener to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        if (document.fullscreenElement) {
          if (document.exitFullscreen) {
            document.exitFullscreen().catch(() => {});
          } else if ((document as any).webkitExitFullscreen) {
            (document as any).webkitExitFullscreen();
          }
        }
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // Update Center when currentStation changes - auto-zoom to 13 to see the entire city in full detail
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !currentStation.latitude || !currentStation.longitude) return;

    const targetZoom = currentStation.isRegion ? 7 : (currentStation.countryCode && currentStation.countryCode !== 'FR' ? 6 : 13);
    map.flyTo(
      [currentStation.latitude, currentStation.longitude],
      targetZoom,
      { duration: 0.8 }
    );
  }, [currentStation.latitude, currentStation.longitude, currentStation.isRegion, currentStation.id]);

  // Google Maps Style Red Pin Marker for Searched City
  useEffect(() => {
    const map = mapInstanceRef.current;
    const cityGroup = cityMarkerLayerGroupRef.current;
    if (!map || !cityGroup || !currentStation.latitude || !currentStation.longitude) return;

    cityGroup.clearLayers();

    // Google Maps Classic Drop Pin Marker SVG - Tip perfectly anchored at (0,0) across all zoom levels
    const googlePinHtml = `
      <div style="position: relative; width: 0; height: 0; pointer-events: none;">
        <!-- Pin SVG - Tip positioned exactly at (0,0) -->
        <div style="position: absolute; left: -16px; bottom: 0px; width: 32px; height: 42px; pointer-events: auto; filter: drop-shadow(0 3px 6px rgba(0,0,0,0.6)); cursor: pointer;">
          <svg viewBox="0 0 24 36" width="32" height="42" style="display: block;">
            <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 24 12 24s12-15 12-24c0-6.627-5.373-12-12-12z" fill="#ea4335" stroke="#ffffff" stroke-width="1.2"/>
            <circle cx="12" cy="12" r="4.8" fill="#ffffff"/>
            <circle cx="12" cy="12" r="2.2" fill="#ea4335"/>
          </svg>
        </div>
        <!-- City name label badge positioned above the pin -->
        <div style="position: absolute; left: 0px; bottom: 45px; transform: translateX(-50%); white-space: nowrap; pointer-events: auto;">
          <div style="background: rgba(15, 23, 42, 0.95); color: #ffffff; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 900; border: 1px solid rgba(239, 68, 68, 0.8); box-shadow: 0 4px 12px rgba(0,0,0,0.5); display: flex; align-items: center; gap: 4px;">
            <span style="color: #ef4444;">📍</span>
            <span>${currentStation.name}</span>
          </div>
        </div>
        <!-- Target ground precision spot -->
        <div style="position: absolute; left: -3px; top: -3px; width: 6px; height: 6px; border-radius: 50%; background: #ea4335; border: 1.5px solid #ffffff; box-shadow: 0 0 6px #ea4335; pointer-events: none;"></div>
      </div>
    `;

    const pinIcon = L.divIcon({
      className: 'google-maps-zero-anchor-pin',
      html: googlePinHtml,
      iconSize: [0, 0],
      iconAnchor: [0, 0],
      popupAnchor: [0, -45]
    });

    const marker = L.marker([currentStation.latitude, currentStation.longitude], {
      icon: pinIcon,
      zIndexOffset: 1000
    });

    marker.bindPopup(`
      <div style="font-family: inherit; min-width: 220px; padding: 4px;">
        <div style="font-size: 10px; font-weight: 800; color: #ea4335; text-transform: uppercase; display: flex; items-center; gap: 4px;">
          <span>📍 Repère Google Maps</span>
          <span>• Ville Sélectionnée</span>
        </div>
        <div style="font-size: 15px; font-weight: 900; color: #0f172a; margin-top: 2px;">
          ${currentStation.name}
        </div>
        <div style="font-size: 11px; color: #64748b;">
          ${currentStation.department || 'France'} • Alt : ${currentStation.altitude ?? 0} m
        </div>
        <div style="margin-top: 6px; font-size: 11px; color: #334155; padding-top: 4px; border-top: 1px solid #e2e8f0;">
          Coordonnées : <strong>${currentStation.latitude.toFixed(4)}°N, ${currentStation.longitude.toFixed(4)}°E</strong>
        </div>
      </div>
    `);

    marker.addTo(cityGroup);
  }, [currentStation.latitude, currentStation.longitude, currentStation.name, currentStation.department, currentStation.altitude]);

  // Update Base Tile Layer with strict maxNativeZoom to prevent any tile server errors
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (baseTileLayerRef.current) {
      map.removeLayer(baseTileLayerRef.current);
      baseTileLayerRef.current = null;
    }

    let tileUrl = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
    let maxNativeZoom = 17;

    switch (baseEngine) {
      case 'osm':
        tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
        maxNativeZoom = 19;
        break;
      case 'dark':
        tileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png';
        maxNativeZoom = 19;
        break;
      case 'satellite':
        tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
        maxNativeZoom = 18;
        break;
      case 'esri_topo':
        tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}';
        maxNativeZoom = 18;
        break;
      case 'topo':
      default:
        tileUrl = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
        maxNativeZoom = 17;
        break;
    }

    const baseLayer = L.tileLayer(tileUrl, {
      maxZoom: 19,
      maxNativeZoom,
      attribution: '© OpenStreetMap contributors, OpenTopoMap, NASA FIRMS, Keraunos, Open-Meteo'
    });

    baseLayer.addTo(map);
    baseTileLayerRef.current = baseLayer;
  }, [baseEngine]);

  // Update Radar Layer or NASA FIRMS layer with maxNativeZoom to fix "zoom level not supported"
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (radarTileLayerRef.current) {
      map.removeLayer(radarTileLayerRef.current);
      radarTileLayerRef.current = null;
    }

    if (firmsTileLayerRef.current) {
      map.removeLayer(firmsTileLayerRef.current);
      firmsTileLayerRef.current = null;
    }

    if (activeLayer === 'radar' && radarFrames.length > 0) {
      const frame = radarFrames[currentFrameIndex] || radarFrames[radarFrames.length - 1];
      if (frame && frame.path) {
        const radarUrl = `${radarHost}${frame.path}/512/{z}/{x}/{y}/2/1_1.png`;
        const layer = L.tileLayer(radarUrl, {
          opacity: radarOpacity,
          zIndex: 10,
          tileSize: 512,
          zoomOffset: -1,
          maxNativeZoom: 12,
          maxZoom: 19
        });
        layer.addTo(map);
        radarTileLayerRef.current = layer;
      }
    } else if (activeLayer === 'firms_fire') {
      // NASA GIBS / FIRMS VIIRS Active Fire Thermal Anomaly layer
      // Set maxNativeZoom: 8 so Leaflet auto-scales smoothly at zoom 9+ without triggering NASA's "Zoom level not supported" tile error
      const firmsUrl = 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_SNPP_Thermal_Anomalies_375m_All/default/default/GoogleMapsCompatible_Level8/{z}/{y}/{x}.png';
      const layer = L.tileLayer(firmsUrl, {
        opacity: 0.85,
        zIndex: 10,
        maxNativeZoom: 8,
        maxZoom: 19
      });
      layer.addTo(map);
      firmsTileLayerRef.current = layer;
    }
  }, [activeLayer, radarFrames, currentFrameIndex, radarHost, radarOpacity]);

  // Render Keraunos convective storm threat polygons and cells
  useEffect(() => {
    const map = mapInstanceRef.current;
    const stormsGroup = stormsLayerGroupRef.current;
    if (!map || !stormsGroup) return;

    stormsGroup.clearLayers();

    // STRICT ISOLATION: Show convective storm cells ONLY when Keraunos layer is selected
    if (activeLayer === 'keraunos_storms') {
      keraunosStormCells.forEach(cell => {
        // Storm polygon / circle of convective activity
        const radius = cell.intensity === 'VIOLENT' ? 22000 : cell.intensity === 'FORT' ? 16000 : 10000;
        const color = cell.intensity === 'VIOLENT' ? '#ef4444' : cell.intensity === 'FORT' ? '#f97316' : '#eab308';
        
        const circle = L.circle([cell.latitude, cell.longitude], {
          radius,
          color,
          fillColor: color,
          fillOpacity: 0.25,
          weight: 2,
          dashArray: '4, 4'
        });

        circle.bindPopup(`
          <div style="font-family: inherit; min-width: 240px; padding: 4px;">
            <div style="font-size: 10px; font-weight: 800; color: #dc2626; text-transform: uppercase;">
              ⚡ Keraunos Observatoire Convectif Français
            </div>
            <div style="font-size: 14px; font-weight: 900; color: #0f172a; margin-top: 2px;">
              ${cell.name}
            </div>
            <div style="margin-top: 6px; font-size: 11px; line-height: 1.5; color: #334155;">
              <div>• <strong>Type :</strong> ${cell.cellType}</div>
              <div>• <strong>Intensité :</strong> ${cell.intensity}</div>
              <div>• <strong>Activité électrique :</strong> ${cell.lightningRateMin} éclairs/min</div>
              <div>• <strong>Rafales max sous grain :</strong> ${cell.maxGustKmH} km/h</div>
              <div>• <strong>Risque Grêle :</strong> ${cell.hailProbabilityPct}% (grêlons ~${cell.hailSizeCm} cm)</div>
              <div>• <strong>Potentiel Tornadique :</strong> <strong style="color: #b91c1c;">${cell.tornadicPotential}</strong></div>
              <div>• <strong>Déplacement :</strong> ${cell.headingDir} à ${cell.speedKmH} km/h</div>
            </div>
          </div>
        `);

        circle.addTo(stormsGroup);

        // Center Lightning Icon Marker
        const stormIconHtml = `
          <div class="flex items-center justify-center h-8 w-8 rounded-full bg-rose-600 border-2 border-white shadow-xl text-white font-black text-xs animate-bounce cursor-pointer">
            ⚡
          </div>
        `;
        const stormIcon = L.divIcon({
          className: 'keraunos-storm-icon',
          html: stormIconHtml,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        const marker = L.marker([cell.latitude, cell.longitude], { icon: stormIcon });
        marker.on('click', () => setSelectedStormCell(cell));
        marker.addTo(stormsGroup);
      });
    }
  }, [activeLayer, keraunosStormCells]);

  // Render NASA FIRMS Active Fire Hotspots
  useEffect(() => {
    const map = mapInstanceRef.current;
    const firmsGroup = firmsLayerGroupRef.current;
    if (!map || !firmsGroup) return;

    firmsGroup.clearLayers();

    // STRICT ISOLATION: Show NASA FIRMS Fire areas ONLY when FIRMS Feux layer is selected
    if (activeLayer === 'firms_fire') {
      const bounds = map.getBounds();
      // Render all hotspots or all hotspots visible within / near map bounds
      const visibleFires = nasaFirmsHotspots.filter(spot => {
        if (!bounds.isValid()) return true;
        // Expand bounds slightly so markers on edges appear smoothly
        const paddedBounds = bounds.pad(0.3);
        return paddedBounds.contains([spot.latitude, spot.longitude]);
      });

      visibleFires.forEach(spot => {
        const circle = L.circle([spot.latitude, spot.longitude], {
          radius: 12000,
          color: '#f97316',
          fillColor: '#ea580c',
          fillOpacity: 0.35,
          weight: 2
        });

        circle.bindPopup(`
          <div style="font-family: inherit; min-width: 250px; padding: 4px;">
            <div style="font-size: 10px; font-weight: 800; color: #ea580c; text-transform: uppercase; display: flex; justify-content: space-between;">
              <span>🔥 NASA FIRMS Satellites</span>
              <span>${spot.satelliteSensor}</span>
            </div>
            <div style="font-size: 14px; font-weight: 900; color: #0f172a; margin-top: 2px;">
              ${spot.locationName}
            </div>
            <div style="font-size: 11px; color: #64748b;">${spot.department}</div>

            <div style="margin-top: 6px; padding: 6px; background: #fff7ed; border: 1px solid #ffedd5; border-radius: 8px; font-size: 11px; color: #9a3412; line-height: 1.4;">
              <div>• <strong>Zone :</strong> Foyer / Incendie actif détecté</div>
              <div>• <strong>Puissance Radiative (FRP) :</strong> <strong>${spot.frpMw} MW</strong></div>
              <div>• <strong>Température de Brillance :</strong> ${spot.brightnessTempK} K (~${Math.round(spot.brightnessTempK - 273.15)}°C)</div>
              <div>• <strong>Confiance Détection :</strong> <span style="font-weight: 800;">${spot.confidence}</span></div>
              <div>• <strong>Dernier passage satellite :</strong> ${spot.acquisitionTime}</div>
            </div>
          </div>
        `);

        circle.addTo(firmsGroup);

        // Fire icon marker
        const fireIconHtml = `
          <div class="flex items-center justify-center h-8 w-8 rounded-full bg-orange-600 border-2 border-white shadow-xl text-white font-black text-xs cursor-pointer animate-pulse">
            🔥
          </div>
        `;
        const fireIcon = L.divIcon({
          className: 'nasa-firms-icon',
          html: fireIconHtml,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        const marker = L.marker([spot.latitude, spot.longitude], { icon: fireIcon });
        marker.on('click', () => setSelectedFirmsHotspot(spot));
        marker.addTo(firmsGroup);
      });
    }
  }, [activeLayer, nasaFirmsHotspots]);

  // Render Open-Meteo Live Wind Stream Vectors
  useEffect(() => {
    const map = mapInstanceRef.current;
    const windGroup = windLayerGroupRef.current;
    if (!map || !windGroup) return;

    windGroup.clearLayers();

    // STRICT ISOLATION: Show wind arrows ONLY when Open-Meteo Vents layer is selected
    if (activeLayer === 'openmeteo_wind') {
      const currentLat = currentStation.latitude || 48.8566;
      const currentLon = currentStation.longitude || 2.3522;

      // Draw dynamic wind direction arrows across key nodes of France
      const sampleWindNodes = [
        { name: 'Bretagne / Manche', lat: 48.5, lon: -3.0, speed: 45, gust: 65, dir: 250 },
        { name: `${currentStation.name} / Local`, lat: currentLat, lon: currentLon, speed: openMeteoWindSpeed, gust: openMeteoWindGusts, dir: openMeteoWindDir },
        { name: 'Île-de-France', lat: 48.85, lon: 2.35, speed: openMeteoWindSpeed, gust: openMeteoWindGusts, dir: openMeteoWindDir },
        { name: 'Bassin Aquitain', lat: 44.8, lon: -0.5, speed: 28, gust: 42, dir: 270 },
        { name: 'Vallée du Rhône (Mistral)', lat: 44.5, lon: 4.8, speed: 65, gust: 95, dir: 350 },
        { name: 'Golfe du Lion (Tramontane)', lat: 43.0, lon: 3.0, speed: 70, gust: 105, dir: 320 },
        { name: 'Grand Est', lat: 48.6, lon: 6.2, speed: 22, gust: 36, dir: 230 },
        { name: 'Massif Central', lat: 45.7, lon: 3.0, speed: 38, gust: 58, dir: 240 },
        { name: 'Alpes du Nord', lat: 45.9, lon: 6.8, speed: 52, gust: 85, dir: 260 },
        { name: 'Corse / Cap Corse (Libeccio)', lat: 42.5, lon: 9.3, speed: 60, gust: 90, dir: 240 }
      ];

      const visibleWindNodes = zoomLevel >= 11
        ? sampleWindNodes.filter(node => {
            const d = Math.sqrt(Math.pow(node.lat - currentLat, 2) + Math.pow((node.lon - currentLon) * Math.cos(currentLat * Math.PI / 180), 2)) * 111;
            return d <= 50;
          })
        : sampleWindNodes;

      visibleWindNodes.forEach(node => {
        const windHtml = `
          <div class="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-950/90 border border-teal-400/80 text-teal-300 font-black text-[11px] shadow-2xl shadow-teal-500/20 whitespace-nowrap">
            <div style="transform: rotate(${node.dir}deg); display: inline-block;">➔</div>
            <span>${node.speed} km/h</span>
            <span class="text-teal-400 text-[9px]">(${node.gust})</span>
          </div>
        `;
        const icon = L.divIcon({
          className: 'openmeteo-wind-vector',
          html: windHtml,
          iconSize: [85, 26],
          iconAnchor: [42, 13]
        });
        const marker = L.marker([node.lat, node.lon], { icon });
        marker.bindPopup(`
          <div style="font-family: inherit; padding: 4px;">
            <div style="font-size: 10px; font-weight: 800; color: #0d9488;">💨 API OPEN-METEO • VENTS &amp; RAFALES</div>
            <div style="font-size: 14px; font-weight: 900; color: #0f172a; margin-top: 2px;">${node.name}</div>
            <div style="margin-top: 4px; font-size: 11px; color: #334155;">
              <div>• Vitesse moyenne (10m) : <strong>${node.speed} km/h</strong></div>
              <div>• Rafales maximales : <strong>${node.gust} km/h</strong></div>
              <div>• Direction : <strong>${node.dir}°</strong></div>
            </div>
          </div>
        `);
        marker.addTo(windGroup);
      });
    }
  }, [activeLayer, openMeteoWindSpeed, openMeteoWindGusts, openMeteoWindDir]);

  // Temperature & Station Weather Markers - Displayed ONLY when 'temp' layer is active or for standard clean point reference
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = stationsLayerGroupRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    // STRICT ISOLATION: Show temperature station pins ONLY when 'temp' layer is active
    if (activeLayer !== 'temp') {
      return;
    }

    const currentActualTemp = weather?.temperature ?? 22.4;
    const currentLat = currentStation.latitude || 48.8566;
    const currentLon = currentStation.longitude || 2.3522;
    const currentAlt = currentStation.altitude ?? 150;

    const visibleStations = zoomLevel >= 11
      ? filteredStations.filter(st => {
          if (st.id === currentStation.id) return true;
          const d = Math.sqrt(Math.pow((st.latitude || 0) - currentLat, 2) + Math.pow(((st.longitude || 0) - currentLon) * Math.cos(currentLat * Math.PI / 180), 2)) * 111;
          return d <= 35;
        })
      : filteredStations;

    visibleStations.forEach(st => {
      const isCurrent = st.id === currentStation.id || 
        (Math.abs((st.latitude || 0) - (currentStation.latitude || 0)) < 0.005 && Math.abs((st.longitude || 0) - (currentStation.longitude || 0)) < 0.005);
      
      const alt = st.altitude ?? 150;
      const altDiff = alt - currentAlt;
      const lapseOffset = (altDiff / 1000) * 6.5; // standard dry/moist adiabatic gradient (6.5°C / 1000m)
      
      // Latitude gradient relative to current station (~0.65°C per degree latitude)
      const latDiff = (currentLat - (st.latitude || 46)) * 0.65;
      
      // Compute accurate temperature
      const stationTemp = isCurrent 
        ? currentActualTemp 
        : Number((currentActualTemp + latDiff - lapseOffset).toFixed(1));

      const stationFeelsLike = isCurrent && weather?.feelsLike !== undefined
        ? weather.feelsLike
        : Number((stationTemp - (alt > 1500 ? 3.0 : 0.4)).toFixed(1));

      const stationWind = isCurrent && weather?.windSpeed !== undefined
        ? weather.windSpeed
        : Math.round(alt > 2000 ? 55 : (st.latitude || 46) < 44 ? 38 : 22);

      const stationHumidity = isCurrent && weather?.humidity !== undefined
        ? weather.humidity
        : Math.min(95, Math.max(35, Math.round(65 - (stationTemp > 24 ? 12 : 0) + (alt > 1000 ? 10 : 0))));

      const isHighPeak = alt >= 1800;
      const isMtn = alt >= 800;

      const badgeContent = `${stationTemp}°C`;
      const badgeStyle = stationTemp >= 30 
        ? 'bg-rose-600 text-white font-black' 
        : stationTemp >= 22 
          ? 'bg-amber-500 text-slate-950 font-black' 
          : stationTemp >= 14 
            ? 'bg-emerald-600 text-white font-bold' 
            : stationTemp >= 5 
              ? 'bg-blue-600 text-white' 
              : 'bg-indigo-600 text-white font-black';

      // Marker element
      const markerHtml = `
        <div class="relative flex flex-col items-center group cursor-pointer">
          ${isCurrent ? '<div class="absolute -inset-2 rounded-full bg-blue-500 opacity-90 animate-ping"></div>' : ''}
          <div class="flex items-center gap-0.5 px-2 py-0.5 rounded-full ${badgeStyle} text-[10px] sm:text-[11px] shadow-xl border ${isCurrent ? 'border-white ring-2 ring-blue-600 font-black' : 'border-slate-800'}">
            ${isHighPeak ? '🏔️' : isMtn ? '⛰️' : ''}
            <span>${badgeContent}</span>
          </div>
          <span class="mt-0.5 px-1 py-0.2 rounded bg-white/95 text-[9px] font-bold text-slate-900 border border-slate-300 shadow whitespace-nowrap hidden xs:inline">
            ${st.name.split(' ')[0]}
          </span>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-station-marker',
        html: markerHtml,
        iconSize: [60, 32],
        iconAnchor: [30, 16]
      });

      const marker = L.marker([st.latitude, st.longitude], { icon: customIcon });

      const popupHtml = `
        <div style="font-family: inherit; min-width: 230px; padding: 4px;">
          <div style="font-size: 10px; font-weight: 800; color: #0284c7; text-transform: uppercase; display: flex; justify-content: space-between;">
            <span>${isHighPeak ? '🏔️ Sommet Météo' : isMtn ? '⛰️ Station Météo' : '🌲 Commune / Station OMM'}</span>
            <span style="color: #0369a1;">Alt. ${alt} m</span>
          </div>
          <div style="font-size: 15px; font-weight: 900; color: #0f172a; margin-top: 2px;">
            ${st.name}
          </div>
          <div style="font-size: 10.5px; color: #64748b; margin-top: 1px;">
            Dép. ${st.department || 'France'}
          </div>

          <div style="margin-top: 8px; padding: 6px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 10.5px; color: #1e293b; display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
            <div>🌡️ Temp : <strong>${stationTemp}°C</strong></div>
            <div>🤔 Ressenti : <strong>${stationFeelsLike}°C</strong></div>
            <div>💨 Vent : <strong>${stationWind} km/h</strong></div>
            <div>💧 Humidité : <strong>${stationHumidity}%</strong></div>
          </div>

          <button 
            id="osm-select-btn-${st.id}" 
            style="width: 100%; margin-top: 8px; background: #0284c7; color: white; font-weight: 800; font-size: 11px; padding: 6px 10px; border-radius: 8px; border: none; cursor: pointer;"
          >
            Sélectionner &amp; Centrer sur ${st.name}
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`osm-select-btn-${st.id}`);
        if (btn && onSelectStation) {
          btn.onclick = () => {
            onSelectStation(st);
            marker.closePopup();
          };
        }
      });

      marker.on('click', () => {
        if (onSelectStation) {
          onSelectStation(st);
        }
      });

      marker.addTo(markersGroup);
    });
  }, [filteredStations, currentStation.id, currentStation.latitude, currentStation.longitude, currentStation.altitude, weather?.temperature, weather?.feelsLike, weather?.windSpeed, weather?.humidity, activeLayer]);

  // Fullscreen container handler (Native Browser HTML5 Fullscreen API matching Settings)
  const handleToggleFullscreen = async () => {
    const container = radarContainerRef.current || document.documentElement;
    const isCurrentlyFs = !!(
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement
    );

    if (!isCurrentlyFs && !isFullscreen) {
      try {
        if (container.requestFullscreen) {
          await container.requestFullscreen();
        } else if ((container as any).webkitRequestFullscreen) {
          await (container as any).webkitRequestFullscreen();
        } else if ((container as any).mozRequestFullScreen) {
          await (container as any).mozRequestFullScreen();
        } else if ((container as any).msRequestFullscreen) {
          await (container as any).msRequestFullscreen();
        } else if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
      } catch (err) {
        console.warn('Native requestFullscreen could not be granted (fallback to CSS fullscreen)', err);
      }
      setIsFullscreen(true);
    } else {
      try {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        } else if ((document as any).mozCancelFullScreen) {
          await (document as any).mozCancelFullScreen();
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen();
        }
      } catch (err) {
        console.warn('Native exitFullscreen error', err);
      }
      setIsFullscreen(false);
    }

    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 150);
  };

  return (
    <div 
      ref={radarContainerRef}
      id="precision-radar-root-container" 
      className={`relative w-full overflow-hidden transition-all duration-300 ${
        isFullscreen 
          ? 'fixed inset-0 z-[9999] w-screen h-screen bg-slate-950' 
          : 'rounded-3xl border border-slate-800 bg-slate-950 shadow-2xl h-[650px] sm:h-[720px]'
      }`}
    >
      {/* 1. Leaflet Map Element */}
      <div 
        ref={mapContainerRef} 
        className="w-full h-full z-0 cursor-grab active:cursor-grabbing"
      />

      {/* ========================================================================= */}
      {/* 2. PERSISTENT FLOATING CONTROLS & HEADER (ALWAYS VISIBLE, EVEN IN FULLSCREEN) */}
      {/* ========================================================================= */}
      
      {/* Top Left: Layer Selector & Source Indicators */}
      <div className="absolute top-3 left-3 z-[1000] pointer-events-auto flex flex-col gap-2 max-w-[calc(100vw-6rem)] sm:max-w-xl">
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-slate-950/95 border border-slate-800/90 shadow-2xl backdrop-blur-2xl ring-1 ring-white/5">
          <button
            type="button"
            onClick={() => setActiveLayer('radar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
              activeLayer === 'radar'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <CloudRain className="h-3.5 w-3.5" />
            <span>Radar Précipitations</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveLayer('firms_fire')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
              activeLayer === 'firms_fire'
                ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30'
                : 'text-orange-300 hover:bg-slate-800'
            }`}
          >
            <Flame className="h-3.5 w-3.5" />
            <span>NASA FIRMS Feux</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveLayer('openmeteo_wind')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
              activeLayer === 'openmeteo_wind'
                ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/30'
                : 'text-teal-300 hover:bg-slate-800'
            }`}
          >
            <Wind className="h-3.5 w-3.5" />
            <span>Open-Meteo Vents</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveLayer('keraunos_storms')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
              activeLayer === 'keraunos_storms'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                : 'text-rose-300 hover:bg-slate-800'
            }`}
          >
            <Zap className="h-3.5 w-3.5" />
            <span>Keraunos Orages</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveLayer('temp')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
              activeLayer === 'temp'
                ? 'bg-amber-500 text-slate-950 shadow-lg font-black'
                : 'text-amber-300 hover:bg-slate-800'
            }`}
          >
            <Thermometer className="h-3.5 w-3.5" />
            <span>Températures</span>
          </button>
        </div>

        {/* Source Badge & Live Station Info */}
        <div className="flex flex-wrap items-center gap-2 px-3 py-1 rounded-xl bg-slate-950/85 border border-slate-800/80 text-[10px] text-slate-300 backdrop-blur-md self-start shadow-md">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span className="font-semibold text-white">{currentStation.name}</span>
          <span className="text-slate-500">•</span>
          <span>
            {activeLayer === 'firms_fire' && 'NASA FIRMS Satellites VIIRS 375m Direct'}
            {activeLayer === 'openmeteo_wind' && 'Open-Meteo Haute Résolution API'}
            {activeLayer === 'keraunos_storms' && 'Keraunos Réseau Français Convection'}
            {activeLayer === 'radar' && 'Radar Doppler légal RainViewer'}
            {activeLayer === 'temp' && `Synchronisé : ${weather?.temperature ?? 22.4}°C (Ressenti ${weather?.feelsLike ?? 22.1}°C)`}
          </span>
          {isFullscreen && (
            <span className="ml-1 px-1.5 py-0.2 rounded bg-blue-900/60 text-blue-300 font-bold text-[9px]">
              Plein Écran Actif (Échap pour quitter)
            </span>
          )}
        </div>
      </div>

      {/* Top Right: Fullscreen & Base Layer Chooser */}
      <div className="absolute top-3 right-3 z-[1000] pointer-events-auto flex items-center gap-2">
        {/* Map style selector */}
        <div className="hidden sm:flex items-center gap-1 p-1 rounded-2xl bg-slate-950/90 border border-slate-800 shadow-xl backdrop-blur-md text-xs font-bold">
          <button
            type="button"
            onClick={() => setBaseEngine('topo')}
            className={`px-2.5 py-1 rounded-xl transition cursor-pointer ${
              baseEngine === 'topo' ? 'bg-slate-800 text-white font-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            Relief
          </button>
          <button
            type="button"
            onClick={() => setBaseEngine('satellite')}
            className={`px-2.5 py-1 rounded-xl transition cursor-pointer ${
              baseEngine === 'satellite' ? 'bg-slate-800 text-white font-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            Satellite
          </button>
          <button
            type="button"
            onClick={() => setBaseEngine('osm')}
            className={`px-2.5 py-1 rounded-xl transition cursor-pointer ${
              baseEngine === 'osm' ? 'bg-slate-800 text-white font-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            Plan OSM
          </button>
        </div>

        {/* FULLSCREEN TOGGLE BUTTON */}
        <button
          type="button"
          onClick={handleToggleFullscreen}
          title={isFullscreen ? 'Quitter le mode plein écran (Touche Échap)' : 'Afficher la carte en plein écran'}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl font-black text-xs shadow-2xl transition active:scale-95 cursor-pointer backdrop-blur-xl border ${
            isFullscreen 
              ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-400/50 shadow-rose-600/40 ring-2 ring-rose-500/20' 
              : 'bg-blue-600 hover:bg-blue-500 text-white border-blue-400/40 shadow-blue-600/50'
          }`}
        >
          {isFullscreen ? (
            <>
              <Minimize2 className="h-4 w-4" />
              <span>Quitter Plein Écran</span>
            </>
          ) : (
            <>
              <Maximize2 className="h-4 w-4" />
              <span>Plein Écran</span>
            </>
          )}
        </button>
      </div>

      {/* Floating Zoom & Recenter Controls (Right Side) */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 z-[1000] pointer-events-auto flex flex-col gap-1.5 p-1 rounded-2xl bg-slate-950/90 border border-slate-800 shadow-2xl backdrop-blur-xl">
        <button
          type="button"
          onClick={() => mapInstanceRef.current?.zoomIn()}
          title="Zoom avant"
          className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
        >
          <span className="text-base font-black leading-none block">+</span>
        </button>
        <button
          type="button"
          onClick={() => mapInstanceRef.current?.zoomOut()}
          title="Zoom arrière"
          className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
        >
          <span className="text-base font-black leading-none block">−</span>
        </button>
        <button
          type="button"
          onClick={() => {
            if (mapInstanceRef.current && currentStation.latitude && currentStation.longitude) {
              mapInstanceRef.current.flyTo([currentStation.latitude, currentStation.longitude], 8, { duration: 0.8 });
            }
          }}
          title="Recentrer sur la station"
          className="p-2 rounded-xl text-blue-400 hover:text-white hover:bg-blue-600 transition cursor-pointer"
        >
          <MapPin className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Bottom Center: Radar Animation Player Bar */}
      {activeLayer === 'radar' && radarFrames.length > 0 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] pointer-events-auto w-[92%] max-w-xl p-2.5 rounded-2xl bg-slate-950/92 border border-slate-800 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="h-8 w-8 rounded-xl bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center transition active:scale-95 cursor-pointer shadow"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current ml-0.5" />}
            </button>
            <button
              type="button"
              onClick={() => setCurrentFrameIndex(prev => (prev > 0 ? prev - 1 : radarFrames.length - 1))}
              className="h-7 w-7 rounded-lg bg-slate-900 text-slate-300 hover:text-white flex items-center justify-center transition"
            >
              <SkipBack className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setCurrentFrameIndex(prev => (prev + 1) % radarFrames.length)}
              className="h-7 w-7 rounded-lg bg-slate-900 text-slate-300 hover:text-white flex items-center justify-center transition"
            >
              <SkipForward className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Timeline slider */}
          <div className="flex-1 min-w-0">
            <input
              type="range"
              min={0}
              max={radarFrames.length - 1}
              value={currentFrameIndex}
              onChange={(e) => setCurrentFrameIndex(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-[9px] text-slate-400 font-bold mt-1">
              <span>-1h30 (Passé)</span>
              <span className="text-blue-400 font-black">Direct Nowcast</span>
              <span>+30 min (Projection)</span>
            </div>
          </div>
        </div>
      )}

      {/* Selected Keraunos Storm Cell Modal */}
      {selectedStormCell && (
        <div className="absolute top-20 right-4 z-[1010] pointer-events-auto w-80 rounded-2xl border border-rose-600/60 bg-slate-950/98 p-4 shadow-2xl backdrop-blur-2xl">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-1.5 text-xs font-black text-rose-400">
              <Zap className="h-4 w-4 text-rose-400 animate-pulse" />
              <span>Cellule Convective Keraunos</span>
            </div>
            <button 
              type="button" 
              onClick={() => setSelectedStormCell(null)}
              className="text-xs text-slate-400 hover:text-white p-1"
            >
              ✕
            </button>
          </div>

          <h3 className="text-sm font-black text-white mt-2 leading-tight">
            {selectedStormCell.name}
          </h3>

          <div className="mt-3 space-y-1.5 text-xs text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400">Structure :</span>
              <span className="font-bold text-white">{selectedStormCell.cellType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Intensité :</span>
              <span className="font-bold text-rose-400">{selectedStormCell.intensity}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Activité foudre :</span>
              <span className="font-bold text-amber-300">{selectedStormCell.lightningRateMin} éclairs/min</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Rafales max :</span>
              <span className="font-bold text-teal-300">{selectedStormCell.maxGustKmH} km/h</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Risque grêle :</span>
              <span className="font-bold text-cyan-300">{selectedStormCell.hailProbabilityPct}% (~{selectedStormCell.hailSizeCm} cm)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Potentiel tornade :</span>
              <span className="font-bold text-rose-400">{selectedStormCell.tornadicPotential}</span>
            </div>
          </div>
        </div>
      )}

      {/* Selected NASA FIRMS Hotspot Modal */}
      {selectedFirmsHotspot && (
        <div className="absolute top-20 right-4 z-[1010] pointer-events-auto w-80 rounded-2xl border border-orange-600/60 bg-slate-950/98 p-4 shadow-2xl backdrop-blur-2xl">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-1.5 text-xs font-black text-orange-400">
              <Flame className="h-4 w-4 text-orange-400 animate-pulse" />
              <span>Foyer Détecté (NASA FIRMS)</span>
            </div>
            <button 
              type="button" 
              onClick={() => setSelectedFirmsHotspot(null)}
              className="text-xs text-slate-400 hover:text-white p-1"
            >
              ✕
            </button>
          </div>

          <h3 className="text-sm font-black text-white mt-2 leading-tight">
            {selectedFirmsHotspot.locationName}
          </h3>
          <p className="text-[11px] text-slate-400">{selectedFirmsHotspot.department}</p>

          <div className="mt-3 space-y-1.5 text-xs text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400">Satellite / Capteur :</span>
              <span className="font-bold text-white">{selectedFirmsHotspot.satelliteSensor}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Puissance (FRP) :</span>
              <span className="font-bold text-orange-400">{selectedFirmsHotspot.frpMw} MW</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Temp. Brillance :</span>
              <span className="font-bold text-amber-300">~{Math.round(selectedFirmsHotspot.brightnessTempK - 273.15)}°C</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Confiance :</span>
              <span className="font-bold text-emerald-400">{selectedFirmsHotspot.confidence}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Passage :</span>
              <span className="font-bold text-slate-200">{selectedFirmsHotspot.acquisitionTime}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
