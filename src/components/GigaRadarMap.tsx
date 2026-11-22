import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import L from 'leaflet';
import { LocationPoint, CurrentWeather } from '../types/weather';
import { FRENCH_STATIONS } from '../data/frenchStations';
import { WORLD_STATIONS } from '../data/worldStations';
import { getLocalityFromCoordinates, searchLocalities } from '../services/openMeteoService';
import { createSeamlessCloudLayer } from '../utils/cloudSatelliteTileLayer';
import {
  fetchLiveRadarDetections,
  LiveLightningStrike
} from '../services/radarDetectionApiService';
import {
  WEATHER_MODELS,
  WeatherModelId,
  WeatherLayerMode,
  SpatialGridData,
  PointTelemetry,
  fetchSpatialWeatherGrid,
  samplePointTelemetry,
  findCurrentHourIndex
} from '../services/radarGridService';
import { COLOR_SCALES, getScaleCssGradient } from '../utils/weatherColorScales';
import { WeatherScientificCanvasEngine } from '../utils/weatherContourCanvasLayer';
import {
  Play,
  Pause,
  RotateCcw,
  Layers,
  Maximize2,
  Minimize2,
  Zap,
  CloudRain,
  Globe2,
  Search,
  MapPin,
  Sun,
  Compass,
  Target,
  ZoomIn,
  ZoomOut,
  Crosshair,
  Snowflake,
  Wind,
  Gauge,
  Thermometer,
  ChevronLeft,
  ChevronRight,
  SkipBack,
  SkipForward,
  RefreshCw,
  Grid
} from 'lucide-react';

interface GigaRadarMapProps {
  currentStation: LocationPoint;
  onSelectStation: (station: LocationPoint) => void;
  seniorMode: boolean;
  onOpenSearchModal?: () => void;
  weather?: CurrentWeather;
}

interface RainViewerFrame {
  time: number;
  path: string;
}

interface RainViewerData {
  version: string;
  generated: number;
  host: string;
  radar: {
    past: RainViewerFrame[];
    nowcast: RainViewerFrame[];
  };
  satellite?: {
    infrared: RainViewerFrame[];
  };
}

interface StormCell {
  id: string;
  name: string;
  lat: number;
  lon: number;
  intensity: string;
  dbz: number;
  movementSpeedKmH: number;
  movementBearingDeg: number;
  movementCompass: string;
  topAltitudeM: number;
  lightningRatePerMin: number;
  hailRiskPercent: number;
}

type BaseMapId = 'meteo_light' | 'dark' | 'topo' | 'hybrid';

function escapeHtml(raw: string | undefined | null): string {
  if (!raw) return '';
  return String(raw)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

function calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number): { deg: number; compass: string } {
  const y = Math.sin(((lon2 - lon1) * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.cos(((lon2 - lon1) * Math.PI) / 180);
  const brng = ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
  const compassPoints = [
    'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
    'S', 'SSO', 'SO', 'OSO', 'O', 'ONO', 'NO', 'NNO'
  ];
  const compass = compassPoints[Math.floor(((brng + 11.25) % 360) / 22.5)];
  return { deg: Math.round(brng), compass };
}

function degToCompassShort(deg: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
  return dirs[Math.round(deg / 45) % 8];
}

function formatUtcIsoToLocalLabel(iso: string): string {
  const d = new Date(iso + 'Z');
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
}

const LAYER_MENU: {
  id: WeatherLayerMode;
  label: string;
  shortDesc: string;
  icon: React.FC<{ className?: string }>;
  accentClass: string;
}[] = [
  { id: 'radar', label: 'Précipitations & Radar', shortDesc: 'Doppler HD + cumuls mm/h', icon: CloudRain, accentClass: 'text-sky-400' },
  { id: 'temperatures', label: 'Températures 2 m', shortDesc: 'Champ lissé + isothermes', icon: Thermometer, accentClass: 'text-amber-400' },
  { id: 'temp850', label: 'Masse d’Air 850 hPa', shortDesc: 'Altitude ~1500 m (ECMWF)', icon: Sun, accentClass: 'text-orange-400' },
  { id: 'wind', label: 'Vent & Flux Animés', shortDesc: 'Particules + rafales km/h', icon: Wind, accentClass: 'text-teal-400' },
  { id: 'pressure', label: 'Pression & Isobares', shortDesc: 'MSLP hPa + centres D / A', icon: Gauge, accentClass: 'text-indigo-400' },
  { id: 'lightning', label: 'Orages (CAPE) & Foudre', shortDesc: 'Instabilité J/kg + éclairs', icon: Zap, accentClass: 'text-yellow-400' },
  { id: 'snow', label: 'Neige & Massifs', shortDesc: 'Chutes cm/h + LPN', icon: Snowflake, accentClass: 'text-cyan-300' },
  { id: 'satellite', label: 'Nébulosité Satellite', shortDesc: 'Couverture nuageuse %', icon: Globe2, accentClass: 'text-slate-300' }
];

export const GigaRadarMap: React.FC<GigaRadarMapProps> = ({
  currentStation,
  onSelectStation,
  seniorMode,
  weather
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const fullscreenWrapperRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const canvasEngineRef = useRef<WeatherScientificCanvasEngine | null>(null);

  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const labelsLayerRef = useRef<L.TileLayer | null>(null);
  const bordersGroupRef = useRef<L.LayerGroup | null>(null);
  const satelliteOverlayRef = useRef<L.Layer | null>(null);
  const markerGroupRef = useRef<L.LayerGroup | null>(null);
  const lightningGroupRef = useRef<L.LayerGroup | null>(null);
  const stormCellsGroupRef = useRef<L.LayerGroup | null>(null);
  const rangeRingsGroupRef = useRef<L.LayerGroup | null>(null);
  const measurementLineGroupRef = useRef<L.LayerGroup | null>(null);
  const probeMarkerRef = useRef<L.Marker | null>(null);
  const windStationsGroupRef = useRef<L.LayerGroup | null>(null);
  const snowGroupRef = useRef<L.LayerGroup | null>(null);
  const radarTileLayersPoolRef = useRef<Map<number, L.TileLayer>>(new Map());

  // Core View & Layer State
  const [baseMap, setBaseMap] = useState<BaseMapId>('meteo_light');
  const [activeLayerMode, setActiveLayerMode] = useState<WeatherLayerMode>('radar');
  const [activeModel, setActiveModel] = useState<WeatherModelId>('meteofrance_seamless');
  const [precipSource, setPrecipSource] = useState<'live' | 'model'>('live');

  // Floating HUD Drawer & Display Options
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
  );
  const [showColorField, setShowColorField] = useState<boolean>(true);
  const [showIsolines, setShowIsolines] = useState<boolean>(true);
  const [showWindParticles, setShowWindParticles] = useState<boolean>(false);
  const [showBorders, setShowBorders] = useState<boolean>(true);
  const [showStations, setShowStations] = useState<boolean>(true);
  const [showGraticule, setShowGraticule] = useState<boolean>(false);
  const [showDistanceRings, setShowDistanceRings] = useState<boolean>(false);
  const [overlayOpacity, setOverlayOpacity] = useState<number>(0.82);

  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [currentZoomLevel, setCurrentZoomLevel] = useState<number>(6.5);

  // Spatial Open-Meteo Multi-Model Grid State
  const [spatialGrid, setSpatialGrid] = useState<SpatialGridData | null>(null);
  const [isGridLoading, setIsGridLoading] = useState<boolean>(false);
  const [gridHourIndex, setGridHourIndex] = useState<number>(0);
  const [baseNowHourIndex, setBaseNowHourIndex] = useState<number>(0);
  const [isModelPlaying, setIsModelPlaying] = useState<boolean>(false);
  const [lastUpdatedLabel, setLastUpdatedLabel] = useState<string>(() =>
    new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  );

  // RainViewer Live Radar State
  const [rvData, setRvData] = useState<RainViewerData | null>(null);
  const [rvFrames, setRvFrames] = useState<RainViewerFrame[]>([]);
  const [rvFrameIndex, setRvFrameIndex] = useState<number>(0);
  const [isRvPlaying, setIsRvPlaying] = useState<boolean>(true);
  const [playbackSpeedMs, setPlaybackSpeedMs] = useState<number>(750);

  // Live Lightning & Storm Cells
  const [liveStrikes, setLiveStrikes] = useState<LiveLightningStrike[]>([]);
  const [activeStormsList, setActiveStormsList] = useState<StormCell[]>([]);
  const [lightningCount, setLightningCount] = useState<number>(0);

  // Live Stations Temperatures & Probe State
  const [liveStationTemps, setLiveStationTemps] = useState<Record<string, number>>({});
  const [hoverProbe, setHoverProbe] = useState<{
    lat: number;
    lon: number;
    telemetry: PointTelemetry | null;
  } | null>(null);
  const [measuredTarget, setMeasuredTarget] = useState<{
    lat: number;
    lon: number;
    distanceKm: number;
    bearingDeg: number;
    bearingCompass: string;
    localityName: string;
    telemetry: PointTelemetry | null;
    liveTemp?: number;
    livePrecip?: number;
  } | null>(null);

  // GeoJSON Borders Cache
  const [franceGeoJson, setFranceGeoJson] = useState<any>(null);
  const [worldGeoJson, setWorldGeoJson] = useState<any>(null);

  // GPS & Search State
  const [isLocatingUser, setIsLocatingUser] = useState<boolean>(false);
  const [userLocationError, setUserLocationError] = useState<string | null>(null);
  const [mapSearchQuery, setMapSearchQuery] = useState<string>('');
  const [mapSearchResults, setMapSearchResults] = useState<LocationPoint[]>([]);

  const gridRef = useRef<SpatialGridData | null>(null);
  const hourIdxRef = useRef<number>(0);
  const currentStationRef = useRef<LocationPoint>(currentStation);

  useEffect(() => {
    gridRef.current = spatialGrid;
  }, [spatialGrid]);

  useEffect(() => {
    hourIdxRef.current = gridHourIndex;
  }, [gridHourIndex]);

  useEffect(() => {
    currentStationRef.current = currentStation;
  }, [currentStation]);

  // 1. Load local static GeoJSON boundaries once for crisp Meteociel borders
  useEffect(() => {
    let active = true;
    fetch('/data/france-departements.geojson')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (active && data) setFranceGeoJson(data);
      })
      .catch(() => {});

    fetch('/data/world-countries.geojson')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (active && data) setWorldGeoJson(data);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  // 2. Fetch RainViewer Live Doppler Frames
  const fetchRainViewer = useCallback(async () => {
    try {
      const res = await fetch('https://api.rainviewer.com/public/weather-maps.json');
      if (!res.ok) throw new Error('RainViewer unavailable');
      const data: RainViewerData = await res.json();
      setRvData(data);

      const allFrames = [...(data.radar?.past || []), ...(data.radar?.nowcast || [])];
      if (allFrames.length > 0) {
        setRvFrames(allFrames);
        const lastObserved = Math.max(0, (data.radar?.past?.length || 1) - 1);
        setRvFrameIndex(lastObserved);
      }
      setLastUpdatedLabel(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
    } catch {
      const now = Math.floor(Date.now() / 1000);
      const fallback: RainViewerFrame[] = Array.from({ length: 12 }).map((_, i) => ({
        time: now - (11 - i) * 600,
        path: `/v2/radar/${now - (11 - i) * 600}`
      }));
      setRvFrames(fallback);
      setRvFrameIndex(fallback.length - 3);
    }
  }, []);

  useEffect(() => {
    fetchRainViewer();
    const interval = setInterval(fetchRainViewer, 300000);
    return () => clearInterval(interval);
  }, [fetchRainViewer]);

  // 3. Fetch Live Convective Storms & Lightning Detections
  const loadDetections = useCallback(async () => {
    try {
      const res = await fetchLiveRadarDetections(currentStation.latitude, currentStation.longitude);
      const mappedStorms: StormCell[] = res.storms.map((s) => ({
        id: s.id,
        name: s.name,
        lat: s.latitude,
        lon: s.longitude,
        intensity: s.intensity,
        dbz: s.dbz || 48,
        movementSpeedKmH: 42,
        movementBearingDeg: 55,
        movementCompass: 'NE',
        topAltitudeM: s.intensity === 'VIOLENT' ? 12800 : 10200,
        lightningRatePerMin: s.lightningRateMin,
        hailRiskPercent: s.hailProbabilityPct
      }));
      setActiveStormsList(mappedStorms);
      setLiveStrikes(res.strikes);
      setLightningCount(res.strikeCount);
    } catch {
      // silent fallback
    }
  }, [currentStation.latitude, currentStation.longitude]);

  useEffect(() => {
    loadDetections();
    const interval = setInterval(loadDetections, 180000);
    return () => clearInterval(interval);
  }, [loadDetections]);

  // 4. Fetch Live French Station Temperatures for crisp map readouts
  useEffect(() => {
    let mounted = true;
    const loadStations = async () => {
      try {
        const subset = FRENCH_STATIONS.slice(0, 32);
        const lats = subset.map((s) => s.latitude.toFixed(2)).join(',');
        const lons = subset.map((s) => s.longitude.toFixed(2)).join(',');
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}&current=temperature_2m&timezone=auto`
        );
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data) && mounted) {
          const mapped: Record<string, number> = {};
          data.forEach((item, idx) => {
            if (item?.current?.temperature_2m !== undefined && subset[idx]) {
              mapped[subset[idx].id] = Number(item.current.temperature_2m.toFixed(1));
            }
          });
          setLiveStationTemps(mapped);
        }
      } catch {
        // fallback handled dynamically
      }
    };
    loadStations();
    const interval = setInterval(loadStations, 300000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // 5. Load Spatial Open-Meteo Grid for current viewport & active model
  const refreshGridForMap = useCallback(
    async (modelToFetch: WeatherModelId) => {
      const map = mapInstanceRef.current;
      if (!map) return;
      const b = map.getBounds();
      setIsGridLoading(true);
      try {
        const grid = await fetchSpatialWeatherGrid(modelToFetch, {
          south: b.getSouth(),
          north: b.getNorth(),
          west: b.getWest(),
          east: b.getEast()
        });
        setSpatialGrid(grid);
        const nowIdx = findCurrentHourIndex(grid.times);
        setBaseNowHourIndex(nowIdx);
        setGridHourIndex((prev) => (prev === 0 || prev >= grid.times.length ? nowIdx : prev));
        setLastUpdatedLabel(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
      } catch (err) {
        console.warn('[GigaRadarMap] Spatial grid fetch notice:', err);
      } finally {
        setIsGridLoading(false);
      }
    },
    []
  );

  // Fullscreen handlers
  useEffect(() => {
    const handleFsChange = () => {
      const fsEl =
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement;
      if (!fsEl) {
        setIsFullscreen(false);
      } else if (fsEl === fullscreenWrapperRef.current || fsEl === document.documentElement) {
        setIsFullscreen(true);
      }
      setTimeout(() => mapInstanceRef.current?.invalidateSize(), 120);
    };

    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
    };
  }, []);

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

    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) setIsFullscreen(false);
    };
    window.addEventListener('keydown', onEsc);
    const t = setTimeout(() => mapInstanceRef.current?.invalidateSize(), 100);

    return () => {
      window.removeEventListener('keydown', onEsc);
      clearTimeout(t);
      document.body.removeAttribute('data-radar-fullscreen');
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isFullscreen]);

  const handleToggleTrueFullscreen = async () => {
    const nextState = !isFullscreen;
    setIsFullscreen(nextState);
    try {
      const isNativeFs = !!(document.fullscreenElement || (document as any).webkitFullscreenElement);
      if (nextState && !isNativeFs) {
        const el = fullscreenWrapperRef.current || document.documentElement;
        await el.requestFullscreen?.();
      } else if (!nextState && isNativeFs) {
        await document.exitFullscreen?.();
      }
    } catch {
      // CSS fullscreen remains active
    }
    setTimeout(() => mapInstanceRef.current?.invalidateSize(), 150);
  };

  // 6. Initialize Leaflet Map & Scientific Canvas Engine
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Default centered cleanly over France (or selected international city) so the full synoptic panorama shines immediately
    const isFrance = !currentStation.countryCode || currentStation.countryCode === 'FR';
    const initCenter: [number, number] = isFrance
      ? [46.65, 2.35]
      : [currentStation.latitude || 46.65, currentStation.longitude || 2.35];
    const initZoom = isFrance ? 6.0 : 5.5;

    const map = L.map(mapContainerRef.current, {
      center: initCenter,
      zoom: initZoom,
      minZoom: 2,
      maxZoom: 18,
      worldCopyJump: true,
      zoomControl: false,
      attributionControl: false,
      zoomSnap: 0.5,
      zoomDelta: 0.5,
      wheelPxPerZoomLevel: 90
    });

    // Dedicated crisp border pane above weather color contours
    const bordersPane = map.createPane('bordersPane');
    bordersPane.style.zIndex = '420';
    bordersPane.style.pointerEvents = 'none';

    bordersGroupRef.current = L.layerGroup().addTo(map);
    markerGroupRef.current = L.layerGroup().addTo(map);
    snowGroupRef.current = L.layerGroup().addTo(map);
    windStationsGroupRef.current = L.layerGroup().addTo(map);
    lightningGroupRef.current = L.layerGroup().addTo(map);
    stormCellsGroupRef.current = L.layerGroup().addTo(map);
    rangeRingsGroupRef.current = L.layerGroup().addTo(map);
    measurementLineGroupRef.current = L.layerGroup().addTo(map);

    // Mount native HTML5 Canvas meteorological field / isoline / wind particle engine
    canvasEngineRef.current = new WeatherScientificCanvasEngine(map, {
      grid: null,
      hourIndex: 0,
      scale: COLOR_SCALES.radar,
      opacity: 0.82,
      showColorField: false,
      showIsolines: true,
      showGraticule: false,
      showWindParticles: false,
      darkBasemap: false
    });

    let moveDebounce: ReturnType<typeof setTimeout> | null = null;
    map.on('moveend zoomend', () => {
      setCurrentZoomLevel(Number(map.getZoom().toFixed(1)));
      if (moveDebounce) clearTimeout(moveDebounce);
      moveDebounce = setTimeout(() => {
        refreshGridForMap(activeModel);
      }, 280);
    });

    map.on('mousemove', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      const g = gridRef.current;
      const t = g ? samplePointTelemetry(g, hourIdxRef.current, lat, lng) : null;
      setHoverProbe({ lat, lon: lng, telemetry: t });
    });

    map.on('mouseout', () => {
      setHoverProbe(null);
    });

    map.on('click', async (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      const refSt = currentStationRef.current;
      const distance = calculateHaversineDistance(refSt.latitude, refSt.longitude, lat, lng);
      const bearing = calculateBearing(refSt.latitude, refSt.longitude, lat, lng);

      const g = gridRef.current;
      const gridTelem = g ? samplePointTelemetry(g, hourIdxRef.current, lat, lng) : null;

      setMeasuredTarget({
        lat,
        lon: lng,
        distanceKm: distance,
        bearingDeg: bearing.deg,
        bearingCompass: bearing.compass,
        localityName: `${lat.toFixed(2)}°N, ${lng.toFixed(2)}°E`,
        telemetry: gridTelem
      });

      if (probeMarkerRef.current) {
        map.removeLayer(probeMarkerRef.current);
      }

      const probeIcon = L.divIcon({
        html: `
          <div class="relative flex items-center justify-center pointer-events-none">
            <div class="h-4 w-4 rounded-full bg-sky-500 border-2 border-white shadow-lg flex items-center justify-center">
              <div class="h-1.5 w-1.5 rounded-full bg-white"></div>
            </div>
          </div>
        `,
        className: 'probe-pin',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });
      probeMarkerRef.current = L.marker([lat, lng], { icon: probeIcon }).addTo(map);

      try {
        const [point, liveJson] = await Promise.all([
          getLocalityFromCoordinates(lat, lng),
          fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(4)}&longitude=${lng.toFixed(4)}&current=temperature_2m,precipitation&timezone=auto`
          )
            .then((r) => r.json())
            .catch(() => null)
        ]);

        const liveTemp =
          liveJson?.current?.temperature_2m !== undefined
            ? Number(liveJson.current.temperature_2m.toFixed(1))
            : undefined;
        const livePrecip =
          liveJson?.current?.precipitation !== undefined
            ? Number(liveJson.current.precipitation.toFixed(1))
            : undefined;

        setMeasuredTarget({
          lat,
          lon: lng,
          distanceKm: distance,
          bearingDeg: bearing.deg,
          bearingCompass: bearing.compass,
          localityName: point.name,
          telemetry: gridTelem,
          liveTemp,
          livePrecip
        });
      } catch {
        // Keep coordinate telemetry cleanly displayed
      }
    });

    mapInstanceRef.current = map;
    refreshGridForMap(activeModel);

    return () => {
      if (moveDebounce) clearTimeout(moveDebounce);
      canvasEngineRef.current?.destroy();
      canvasEngineRef.current = null;
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Trigger model grid reload whenever activeModel changes
  useEffect(() => {
    refreshGridForMap(activeModel);
  }, [activeModel, refreshGridForMap]);

  // 7. Update Base Map Tiles cleanly
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
      tileLayerRef.current = null;
    }
    if (labelsLayerRef.current) {
      map.removeLayer(labelsLayerRef.current);
      labelsLayerRef.current = null;
    }

    const configs: Record<BaseMapId, { url: string; maxNativeZoom: number; subdomains?: string }> = {
      meteo_light: {
        url: 'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png',
        maxNativeZoom: 18,
        subdomains: 'abcd'
      },
      dark: {
        url: 'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png',
        maxNativeZoom: 18,
        subdomains: 'abcd'
      },
      topo: {
        url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        maxNativeZoom: 19,
        subdomains: 'abc'
      },
      hybrid: {
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        maxNativeZoom: 18
      }
    };

    const cfg = configs[baseMap];
    tileLayerRef.current = L.tileLayer(cfg.url, {
      maxNativeZoom: cfg.maxNativeZoom,
      maxZoom: 18,
      subdomains: (cfg.subdomains as any) || 'abc'
    }).addTo(map);

    // Subtle city labels layer above borders
    if (baseMap === 'meteo_light') {
      labelsLayerRef.current = L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png',
        { maxNativeZoom: 18, maxZoom: 18, subdomains: 'abcd', pane: 'bordersPane', opacity: 0.72 }
      ).addTo(map);
    } else if (baseMap === 'dark') {
      labelsLayerRef.current = L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png',
        { maxNativeZoom: 18, maxZoom: 18, subdomains: 'abcd', pane: 'bordersPane', opacity: 0.78 }
      ).addTo(map);
    } else if (baseMap === 'hybrid') {
      labelsLayerRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
        { maxNativeZoom: 16, maxZoom: 18, pane: 'bordersPane', opacity: 0.85 }
      ).addTo(map);
    }
  }, [baseMap]);

  // 8. Render Crisp French Departements & Country Borders above weather field
  useEffect(() => {
    const group = bordersGroupRef.current;
    if (!group) return;
    group.clearLayers();
    if (!showBorders) return;

    const isDarkSurface = baseMap === 'dark' || baseMap === 'hybrid';
    const countryStroke = isDarkSurface ? 'rgba(226, 232, 240, 0.55)' : 'rgba(15, 23, 42, 0.65)';
    const deptStroke = isDarkSurface ? 'rgba(203, 213, 225, 0.42)' : 'rgba(30, 41, 59, 0.48)';

    if (worldGeoJson) {
      const worldLayer = L.geoJSON(worldGeoJson, {
        pane: 'bordersPane',
        interactive: false,
        style: {
          color: countryStroke,
          weight: 1.25,
          fill: false
        }
      });
      group.addLayer(worldLayer);
    }

    if (franceGeoJson) {
      const frLayer = L.geoJSON(franceGeoJson, {
        pane: 'bordersPane',
        interactive: false,
        style: {
          color: deptStroke,
          weight: 0.85,
          fill: false
        }
      });
      group.addLayer(frLayer);
    }
  }, [showBorders, franceGeoJson, worldGeoJson, baseMap]);

  // 9. Sync Native Scientific Canvas Engine with Active Mode / Grid / Isolines / Wind Particles
  useEffect(() => {
    if (!canvasEngineRef.current) return;
    const scale = COLOR_SCALES[activeLayerMode];

    // In live Doppler mode on 'radar', RainViewer tiles provide crisp observed echoes on top,
    // while in 'model' mode (or any other layer) our bicubic continuous contour field draws smoothly!
    const renderModelColorField =
      showColorField && (activeLayerMode !== 'radar' || precipSource === 'model');

    const enableWindParticles =
      showWindParticles || activeLayerMode === 'wind';

    const enableIsolines =
      showIsolines &&
      (activeLayerMode === 'temperatures' ||
        activeLayerMode === 'temp850' ||
        activeLayerMode === 'pressure' ||
        activeLayerMode === 'lightning' ||
        (activeLayerMode === 'radar' && precipSource === 'model'));

    canvasEngineRef.current.updateConfig({
      grid: spatialGrid,
      hourIndex: gridHourIndex,
      scale,
      opacity: overlayOpacity,
      showColorField: renderModelColorField,
      showIsolines: enableIsolines,
      showGraticule,
      showWindParticles: enableWindParticles,
      darkBasemap: baseMap === 'dark' || baseMap === 'hybrid'
    });
  }, [
    spatialGrid,
    gridHourIndex,
    activeLayerMode,
    precipSource,
    showColorField,
    showIsolines,
    showWindParticles,
    showGraticule,
    overlayOpacity,
    baseMap
  ]);

  // 10. RainViewer Live Doppler Tiles Pool (Active only when on 'radar' + 'live')
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    radarTileLayersPoolRef.current.forEach((layer) => map.removeLayer(layer));
    radarTileLayersPoolRef.current.clear();

    const isLiveRain = activeLayerMode === 'radar' && precipSource === 'live';
    if (!isLiveRain || rvFrames.length === 0) return;

    const host = rvData?.host || 'https://tilecache.rainviewer.com';
    // RainViewer color scheme 2 = Universal Blue, 4 = Meteociel-like Spectrum
    const colorScheme = 4;

    rvFrames.forEach((frame, idx) => {
      const url = `${host}${frame.path}/256/{z}/{x}/{y}/${colorScheme}/1_1.png`;
      const layer = L.tileLayer(url, {
        opacity: idx === rvFrameIndex ? overlayOpacity : 0,
        zIndex: 365,
        tileSize: 256,
        maxNativeZoom: 12,
        maxZoom: 18,
        keepBuffer: 2,
        updateWhenIdle: false,
        className: 'radar-tile-smooth'
      }).addTo(map);
      radarTileLayersPoolRef.current.set(idx, layer);
    });

    return () => {
      radarTileLayersPoolRef.current.forEach((layer) => map.removeLayer(layer));
      radarTileLayersPoolRef.current.clear();
    };
  }, [rvFrames, rvData, activeLayerMode, precipSource]);

  // Fast RainViewer frame opacity switcher
  useEffect(() => {
    const isLiveRain = activeLayerMode === 'radar' && precipSource === 'live';
    radarTileLayersPoolRef.current.forEach((layer, idx) => {
      layer.setOpacity(isLiveRain && idx === rvFrameIndex ? overlayOpacity : 0);
    });
  }, [rvFrameIndex, overlayOpacity, activeLayerMode, precipSource]);

  // 11. Satellite Seamless Cloud Cover Layer (Active in 'satellite' mode)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (satelliteOverlayRef.current) {
      map.removeLayer(satelliteOverlayRef.current);
      satelliteOverlayRef.current = null;
    }

    if (activeLayerMode === 'satellite') {
      const hourIso = spatialGrid?.times?.[gridHourIndex];
      const ts = hourIso ? Math.floor(Date.parse(hourIso + 'Z') / 1000) : Math.floor(Date.now() / 1000);
      satelliteOverlayRef.current = createSeamlessCloudLayer({
        opacity: overlayOpacity * 0.72,
        zIndex: 360,
        timestamp: ts
      }).addTo(map);
    }
  }, [activeLayerMode, overlayOpacity, gridHourIndex, spatialGrid]);

  // 12. Playback Animation Loops (RainViewer Live vs Model Timeline)
  useEffect(() => {
    const isLiveRain = activeLayerMode === 'radar' && precipSource === 'live';
    if (isLiveRain) {
      if (!isRvPlaying || rvFrames.length <= 1) return;
      const timer = setInterval(() => {
        setRvFrameIndex((prev) => (prev + 1) % rvFrames.length);
      }, playbackSpeedMs);
      return () => clearInterval(timer);
    } else {
      const maxSteps = spatialGrid?.times?.length || 0;
      if (!isModelPlaying || maxSteps <= 1) return;
      const timer = setInterval(() => {
        setGridHourIndex((prev) => (prev + 1 >= maxSteps ? baseNowHourIndex : prev + 1));
      }, playbackSpeedMs);
      return () => clearInterval(timer);
    }
  }, [activeLayerMode, precipSource, isRvPlaying, rvFrames.length, isModelPlaying, spatialGrid, baseNowHourIndex, playbackSpeedMs]);

  // 13. City / Station Markers Layer (Clean typography badges, non-cluttered)
  useEffect(() => {
    const group = markerGroupRef.current;
    if (!group) return;
    group.clearLayers();
    if (!showStations) return;

    // Show concise key stations on French/European zoom without overflowing map
    const keyStations: LocationPoint[] = [
      currentStation,
      ...FRENCH_STATIONS.filter((s) => s.id !== currentStation.id).slice(0, currentZoomLevel >= 7 ? 28 : 16),
      ...(currentZoomLevel <= 5 ? WORLD_STATIONS.slice(0, 12) : [])
    ];

    keyStations.forEach((st) => {
      const isSelected = st.id === currentStation.id;
      const g = gridRef.current;
      let displayVal = '';
      if (activeLayerMode === 'temperatures') {
        const t =
          isSelected && weather?.temperature !== undefined
            ? Number(weather.temperature.toFixed(1))
            : liveStationTemps[st.id] !== undefined
              ? liveStationTemps[st.id]
              : g
                ? Number(samplePointTelemetry(g, gridHourIndex, st.latitude, st.longitude).temp2m.toFixed(0))
                : null;
        if (t !== null) displayVal = `${t}°`;
      } else if (g) {
        const telem = samplePointTelemetry(g, gridHourIndex, st.latitude, st.longitude);
        if (activeLayerMode === 'wind') displayVal = `${telem.windSpeed} km/h`;
        else if (activeLayerMode === 'pressure') displayVal = `${telem.pressure}`;
        else if (activeLayerMode === 'temp850') displayVal = `${telem.temp850.toFixed(0)}°`;
        else if (activeLayerMode === 'radar') displayVal = telem.precip > 0.1 ? `${telem.precip}mm` : '';
      }

      const cityShort = escapeHtml(st.name.split(' ')[0]);
      const valEsc = escapeHtml(displayVal);

      const html = `
        <div class="cursor-pointer flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold shadow border whitespace-nowrap ${
          isSelected
            ? 'bg-sky-600 border-white text-white ring-2 ring-sky-400/60'
            : 'bg-slate-950/88 border-slate-700/80 text-slate-100 hover:bg-slate-900'
        }">
          <span>${cityShort}</span>
          ${valEsc ? `<span class="font-mono text-amber-300">${valEsc}</span>` : ''}
        </div>
      `;

      const icon = L.divIcon({
        html,
        className: 'meteo-station-chip',
        iconSize: [72, 20],
        iconAnchor: [36, 10]
      });

      const marker = L.marker([st.latitude, st.longitude], { icon, zIndexOffset: isSelected ? 900 : 10 });
      marker.on('click', () => onSelectStation(st));
      group.addLayer(marker);
    });
  }, [showStations, currentStation, activeLayerMode, weather, liveStationTemps, spatialGrid, gridHourIndex, currentZoomLevel, onSelectStation]);

  // 14. Lightning Strikes & Storm Cells (Active in 'lightning' mode)
  useEffect(() => {
    const lGroup = lightningGroupRef.current;
    const sGroup = stormCellsGroupRef.current;
    if (!lGroup || !sGroup) return;
    lGroup.clearLayers();
    sGroup.clearLayers();

    if (activeLayerMode !== 'lightning') return;

    liveStrikes.forEach((strike) => {
      const icon = L.divIcon({
        html: `<div class="h-5 w-5 rounded-full bg-yellow-400 border border-white shadow-lg flex items-center justify-center text-slate-950 text-[10px] font-black">⚡</div>`,
        className: 'lightning-icon',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });
      const m = L.marker([strike.lat, strike.lon], { icon });
      m.bindTooltip(
        `<div class="p-2 text-xs text-slate-100"><div class="font-bold text-yellow-300">Impact ${strike.ampKa > 0 ? `+${strike.ampKa}` : strike.ampKa} kA</div><div>${escapeHtml(strike.nearestLocationName)} · il y a ${strike.timeMinutesAgo} min</div></div>`
      );
      lGroup.addLayer(m);
    });

    activeStormsList.forEach((storm) => {
      const coreColor = storm.dbz >= 55 ? '#dc2626' : '#f97316';
      const circle = L.circle([storm.lat, storm.lon], {
        radius: 14000,
        color: coreColor,
        weight: 2,
        fillColor: coreColor,
        fillOpacity: 0.22
      });
      const badgeIcon = L.divIcon({
        html: `<div class="rounded bg-slate-950/90 border border-amber-400/80 px-1.5 py-0.5 text-[10px] font-mono font-bold text-white whitespace-nowrap shadow">${storm.dbz} dBZ · ${storm.movementCompass}</div>`,
        className: 'storm-cell-badge',
        iconSize: [110, 20],
        iconAnchor: [55, 10]
      });
      const marker = L.marker([storm.lat, storm.lon], { icon: badgeIcon });
      marker.bindTooltip(
        `<div class="p-2 text-xs text-slate-100 space-y-0.5"><div class="font-bold text-amber-300">${escapeHtml(storm.name)}</div><div>Réflectivité : ${storm.dbz} dBZ</div><div>Risque grêle : ${storm.hailRiskPercent}%</div></div>`
      );
      sGroup.addLayer(circle);
      sGroup.addLayer(marker);
    });
  }, [activeLayerMode, liveStrikes, activeStormsList]);

  // 15. Range Rings & Measurement Line
  useEffect(() => {
    const group = rangeRingsGroupRef.current;
    if (!group) return;
    group.clearLayers();
    if (!showDistanceRings || !currentStation) return;

    const center: [number, number] = [currentStation.latitude, currentStation.longitude];
    [25000, 50000, 100000, 200000].forEach((radiusMeters) => {
      const km = Math.round(radiusMeters / 1000);
      group.addLayer(
        L.circle(center, {
          radius: radiusMeters,
          color: '#0ea5e9',
          weight: 1.25,
          dashArray: '5, 5',
          fill: false,
          interactive: false
        })
      );
      const tagLat = currentStation.latitude + radiusMeters / 111320;
      const icon = L.divIcon({
        html: `<div class="rounded bg-slate-950/90 border border-sky-500/60 px-1.5 py-0.5 text-[9px] font-mono font-bold text-sky-300 whitespace-nowrap">${km} km</div>`,
        className: 'ring-label',
        iconSize: [44, 16],
        iconAnchor: [22, 8]
      });
      group.addLayer(L.marker([tagLat, currentStation.longitude], { icon, interactive: false }));
    });
  }, [showDistanceRings, currentStation]);

  useEffect(() => {
    const group = measurementLineGroupRef.current;
    if (!group) return;
    group.clearLayers();
    if (!measuredTarget || !currentStation) return;

    group.addLayer(
      L.polyline(
        [
          [currentStation.latitude, currentStation.longitude],
          [measuredTarget.lat, measuredTarget.lon]
        ],
        { color: '#0284c7', weight: 2, dashArray: '5, 5' }
      )
    );
  }, [measuredTarget, currentStation]);

  // Helper Controls
  const handleLocateUser = () => {
    if (!navigator.geolocation) {
      setUserLocationError('Géolocalisation non disponible.');
      return;
    }
    setIsLocatingUser(true);
    setUserLocationError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setIsLocatingUser(false);
        const { latitude, longitude } = pos.coords;
        mapInstanceRef.current?.flyTo([latitude, longitude], 10, { duration: 1.2 });
        try {
          const st = await getLocalityFromCoordinates(latitude, longitude);
          onSelectStation(st);
        } catch {
          // ignore geocode failure
        }
      },
      () => {
        setIsLocatingUser(false);
        setUserLocationError('Autorisation GPS refusée.');
      },
      { enableHighAccuracy: true, timeout: 9000 }
    );
  };

  const handleMapSearch = async (val: string) => {
    setMapSearchQuery(val);
    if (val.trim().length >= 2) {
      const res = await searchLocalities(val);
      setMapSearchResults(res.slice(0, 6));
    } else {
      setMapSearchResults([]);
    }
  };

  const handleSelectSearchResult = (st: LocationPoint) => {
    onSelectStation(st);
    setMapSearchQuery('');
    setMapSearchResults([]);
    mapInstanceRef.current?.flyTo([st.latitude, st.longitude], 9, { duration: 1.2 });
  };

  // Active Scale, Gradient & Timeline Readouts
  const activeScale = COLOR_SCALES[activeLayerMode];
  const colorbarGradient = useMemo(() => getScaleCssGradient(activeScale), [activeScale]);
  const activeModelMeta = WEATHER_MODELS.find((m) => m.id === activeModel) || WEATHER_MODELS[0];

  const isLiveDopplerMode = activeLayerMode === 'radar' && precipSource === 'live';
  const currentRvTime = rvFrames[rvFrameIndex]?.time;
  const isNowcastFrame = rvData?.radar?.nowcast?.some((f) => f.time === currentRvTime);

  const validTimeLabel = useMemo(() => {
    if (isLiveDopplerMode && currentRvTime) {
      const d = new Date(currentRvTime * 1000);
      return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }
    const iso = spatialGrid?.times?.[gridHourIndex];
    return iso ? formatUtcIsoToLocalLabel(iso) : 'Chargement...';
  }, [isLiveDopplerMode, currentRvTime, spatialGrid, gridHourIndex]);

  const offsetHours = gridHourIndex - baseNowHourIndex;
  const offsetHoursLabel = offsetHours === 0 ? 'Échéance +0h' : offsetHours > 0 ? `+${offsetHours}h` : `${offsetHours}h`;

  // Telemetry values displayed in Sonde Drawer
  const activeSondeTelemetry = useMemo(() => {
    if (hoverProbe?.telemetry) {
      return {
        title: `${hoverProbe.lat.toFixed(2)}°N, ${hoverProbe.lon.toFixed(2)}°E`,
        subtitle: 'Sonde curseur en direct',
        data: hoverProbe.telemetry,
        distance: null as number | null,
        bearing: null as string | null
      };
    }
    if (measuredTarget?.telemetry) {
      return {
        title: measuredTarget.localityName,
        subtitle: `${measuredTarget.distanceKm} km · ${measuredTarget.bearingDeg}° ${measuredTarget.bearingCompass}`,
        data: measuredTarget.telemetry,
        distance: measuredTarget.distanceKm,
        bearing: measuredTarget.bearingCompass
      };
    }
    if (spatialGrid) {
      const stTelem = samplePointTelemetry(
        spatialGrid,
        gridHourIndex,
        currentStation.latitude,
        currentStation.longitude
      );
      return {
        title: currentStation.name,
        subtitle: `${currentStation.department || currentStation.country || 'Station active'} · ${currentStation.altitude ?? 100} m`,
        data: stTelem,
        distance: null,
        bearing: null
      };
    }
    return null;
  }, [hoverProbe, measuredTarget, spatialGrid, gridHourIndex, currentStation]);

  return (
    <div
      id="giga-radar-map"
      ref={fullscreenWrapperRef}
      className={`rounded-xl border border-slate-800 bg-slate-950 shadow-xl overflow-hidden transition-all duration-300 flex flex-col ${
        isFullscreen
          ? '!fixed !inset-0 !z-[99999] !rounded-none !border-0 !m-0 !h-[100dvh] !w-screen overscroll-none'
          : 'relative h-[600px] sm:h-[680px] lg:h-[780px]'
      }`}
    >
      {/* 1. TOP METEOCIEL + SKYMAP FLOATING HEADER BAR */}
      <div className="absolute top-2.5 left-2.5 right-2.5 z-30 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Left: Model Switcher & Synoptic Run Timestamp */}
        <div className="radar-hud-panel flex items-center gap-2 rounded-lg border px-2.5 py-1.5 shadow-lg pointer-events-auto max-w-full overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1 shrink-0">
            {WEATHER_MODELS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setActiveModel(m.id)}
                className={`px-2 py-1 rounded text-[11px] font-bold transition whitespace-nowrap shrink-0 cursor-pointer ${
                  activeModel === m.id
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
                title={`${m.label} (${m.provider} · ${m.resolution})`}
              >
                {m.shortName}
              </button>
            ))}
          </div>

          <span className="hidden sm:inline text-slate-600" aria-hidden="true">|</span>

          <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono tabular-nums text-slate-300 whitespace-nowrap shrink-0">
            <span className="font-semibold text-sky-300">{spatialGrid?.runLabel || 'Run Live'}</span>
            <span aria-hidden="true">·</span>
            <span className="font-bold text-white">{validTimeLabel}</span>
            {!isLiveDopplerMode && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-amber-300">{offsetHoursLabel}</span>
              </>
            )}
          </div>
        </div>

        {/* Center: Quick Locality Search */}
        <div className="relative flex-1 max-w-xs hidden xl:block pointer-events-auto">
          <div className="radar-hud-panel relative rounded-lg border">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Zoomer sur une commune ou un massif..."
              value={mapSearchQuery}
              onChange={(e) => handleMapSearch(e.target.value)}
              className="w-full rounded-lg bg-transparent pl-8 pr-7 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none"
            />
            {mapSearchQuery && (
              <button
                type="button"
                onClick={() => {
                  setMapSearchQuery('');
                  setMapSearchResults([]);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ×
              </button>
            )}
          </div>

          {mapSearchResults.length > 0 && (
            <div className="radar-hud-panel absolute top-full left-0 right-0 mt-1 rounded-lg border p-1 shadow-2xl z-40 max-h-56 overflow-y-auto">
              {mapSearchResults.map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => handleSelectSearchResult(st)}
                  className="w-full flex items-center justify-between rounded px-2.5 py-1.5 text-left text-xs hover:bg-slate-800/80 transition cursor-pointer"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <MapPin className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                    <div className="truncate">
                      <div className="font-semibold text-white truncate">{st.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{st.department || st.country}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono tabular-nums text-sky-300 shrink-0 ml-2">
                    {st.altitude} m
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Actualisation, Basemap Style & Fullscreen */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          <div className="radar-hud-panel hidden md:flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-mono tabular-nums text-slate-300">
            {isGridLoading ? (
              <RefreshCw className="h-3 w-3 text-sky-400 animate-spin" />
            ) : (
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
            )}
            <span>Actualisé à {lastUpdatedLabel}</span>
          </div>

          <div className="radar-hud-panel flex items-center rounded-lg border p-1 text-[11px] font-semibold">
            {(
              [
                { id: 'meteo_light', label: 'Épurée' },
                { id: 'dark', label: 'Sombre' },
                { id: 'topo', label: 'Topo' },
                { id: 'hybrid', label: 'Sat HD' }
              ] as { id: BaseMapId; label: string }[]
            ).map((bm) => (
              <button
                key={bm.id}
                type="button"
                onClick={() => setBaseMap(bm.id)}
                className={`px-2 py-1 rounded transition whitespace-nowrap shrink-0 cursor-pointer ${
                  baseMap === bm.id ? 'bg-sky-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                {bm.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleToggleTrueFullscreen}
            className={`radar-hud-panel rounded-lg border p-2 transition cursor-pointer ${
              isFullscreen ? '!bg-rose-600 text-white' : 'text-slate-200 hover:text-white'
            }`}
            title={isFullscreen ? 'Quitter le plein écran' : 'Plein écran'}
            aria-label="Basculer le mode plein écran"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* 2. LEFT FLOATING SKYMAP INSPECTOR & LAYER DRAWER */}
      <div
        className={`absolute left-2.5 top-14 z-20 transition-transform duration-200 pointer-events-none ${
          isDrawerOpen ? 'translate-x-0' : '-translate-x-[115%]'
        }`}
      >
        <div className="radar-hud-panel w-64 sm:w-72 rounded-xl border shadow-2xl pointer-events-auto flex flex-col max-h-[calc(100vh-230px)] lg:max-h-[540px] overflow-y-auto no-scrollbar">
          {/* Drawer Header */}
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-700/70">
            <div>
              <div className="text-xs font-bold text-white">Couches Météorologiques</div>
              <div className="text-[11px] text-slate-400">
                {activeModelMeta.label} · {activeModelMeta.resolution}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsDrawerOpen(false)}
              className="rounded p-1 text-slate-400 hover:text-white hover:bg-slate-800/80 cursor-pointer"
              title="Replier le panneau"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>

          {/* Meteorological Layer List */}
          <div className="p-2 space-y-1">
            {LAYER_MENU.map((item) => {
              const Icon = item.icon;
              const active = activeLayerMode === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveLayerMode(item.id)}
                  className={`w-full flex items-center justify-between rounded-lg px-2.5 py-2 text-left transition cursor-pointer ${
                    active
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'text-slate-200 hover:bg-slate-800/75'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-white' : item.accentClass}`} />
                    <div className="min-w-0">
                      <div className="text-xs font-semibold truncate">{item.label}</div>
                      <div className={`text-[10px] truncate ${active ? 'text-sky-100' : 'text-slate-400'}`}>
                        {item.shortDesc}
                      </div>
                    </div>
                  </div>
                  {item.id === 'lightning' && lightningCount > 0 && (
                    <span className="font-mono tabular-nums text-[10px] font-bold text-yellow-300 ml-1">
                      {lightningCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Visual Layer Toggles */}
          <div className="px-3 py-2.5 border-t border-slate-700/70 space-y-2 text-[11px]">
            <div className="font-semibold text-slate-300">Affichage cartographique</div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setShowIsolines(!showIsolines)}
                className={`px-2 py-1.5 rounded text-left font-medium transition cursor-pointer ${
                  showIsolines ? 'bg-sky-600/30 text-sky-200 border border-sky-500/50' : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}
              >
                Isolignes
              </button>
              <button
                type="button"
                onClick={() => setShowWindParticles(!showWindParticles)}
                className={`px-2 py-1.5 rounded text-left font-medium transition cursor-pointer ${
                  showWindParticles || activeLayerMode === 'wind'
                    ? 'bg-teal-600/30 text-teal-200 border border-teal-500/50'
                    : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}
              >
                Flux de vent
              </button>
              <button
                type="button"
                onClick={() => setShowBorders(!showBorders)}
                className={`px-2 py-1.5 rounded text-left font-medium transition cursor-pointer ${
                  showBorders ? 'bg-sky-600/30 text-sky-200 border border-sky-500/50' : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}
              >
                Départements
              </button>
              <button
                type="button"
                onClick={() => setShowStations(!showStations)}
                className={`px-2 py-1.5 rounded text-left font-medium transition cursor-pointer ${
                  showStations ? 'bg-sky-600/30 text-sky-200 border border-sky-500/50' : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}
              >
                Villes & T°
              </button>
              <button
                type="button"
                onClick={() => setShowGraticule(!showGraticule)}
                className={`px-2 py-1.5 rounded text-left font-medium transition cursor-pointer ${
                  showGraticule ? 'bg-sky-600/30 text-sky-200 border border-sky-500/50' : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}
              >
                Grille Lat/Lon
              </button>
              <button
                type="button"
                onClick={() => setShowColorField(!showColorField)}
                className={`px-2 py-1.5 rounded text-left font-medium transition cursor-pointer ${
                  showColorField ? 'bg-sky-600/30 text-sky-200 border border-sky-500/50' : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}
              >
                Nappes couleur
              </button>
            </div>
          </div>

          {/* Interactive Sonde Readout (Cursor Hover / Clicked Point / Current Station) */}
          {activeSondeTelemetry && (
            <div className="px-3 py-2.5 border-t border-slate-700/70 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">{activeSondeTelemetry.title}</div>
                  <div className="text-[10px] font-mono tabular-nums text-sky-300 truncate">
                    {activeSondeTelemetry.subtitle}
                  </div>
                </div>
                {measuredTarget && !hoverProbe && (
                  <button
                    type="button"
                    onClick={() => {
                      setMeasuredTarget(null);
                      if (probeMarkerRef.current && mapInstanceRef.current) {
                        mapInstanceRef.current.removeLayer(probeMarkerRef.current);
                        probeMarkerRef.current = null;
                      }
                    }}
                    className="text-[10px] text-slate-400 hover:text-white cursor-pointer"
                  >
                    Effacer
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px] font-mono tabular-nums">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-sans">T° 2m</span>
                  <span className="font-bold text-amber-300">{activeSondeTelemetry.data.temp2m}°C</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-sans">850 hPa</span>
                  <span className="font-bold text-orange-300">{activeSondeTelemetry.data.temp850}°C</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-sans">Pluie</span>
                  <span className="font-bold text-sky-300">{activeSondeTelemetry.data.precip} mm/h</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-sans">Vent</span>
                  <span className="font-bold text-teal-300">
                    {activeSondeTelemetry.data.windSpeed} {degToCompassShort(activeSondeTelemetry.data.windDir)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-sans">Rafales</span>
                  <span className="font-bold text-slate-100">{activeSondeTelemetry.data.windGust} km/h</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-sans">Pression</span>
                  <span className="font-bold text-indigo-300">{activeSondeTelemetry.data.pressure} hPa</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-sans">CAPE</span>
                  <span className="font-bold text-yellow-300">{activeSondeTelemetry.data.cape} J/kg</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-sans">Nuages</span>
                  <span className="font-bold text-slate-200">{activeSondeTelemetry.data.clouds}%</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Collapsed Drawer Re-open Trigger */}
      {!isDrawerOpen && (
        <button
          type="button"
          onClick={() => setIsDrawerOpen(true)}
          className="radar-hud-panel absolute left-2.5 top-14 z-20 flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold text-white shadow-lg cursor-pointer hover:bg-slate-900"
        >
          <Layers className="h-4 w-4 text-sky-400" />
          <span>Couches & Sonde</span>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
        </button>
      )}

      {/* 3. RIGHT FLOATING SKYMAP CONTROL RAIL */}
      <div className="absolute right-2.5 top-16 z-20 flex flex-col gap-1.5 pointer-events-auto">
        <div className="radar-hud-panel flex flex-col rounded-lg border overflow-hidden shadow-lg">
          <button
            type="button"
            onClick={() => mapInstanceRef.current?.zoomIn(1)}
            className="p-2 text-slate-200 hover:text-white hover:bg-slate-800/80 transition cursor-pointer"
            title="Zoomer"
            aria-label="Zoom avant"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <div className="border-y border-slate-700/70 py-1 text-center text-[10px] font-mono tabular-nums text-slate-300">
            z{currentZoomLevel}
          </div>
          <button
            type="button"
            onClick={() => mapInstanceRef.current?.zoomOut(1)}
            className="p-2 text-slate-200 hover:text-white hover:bg-slate-800/80 transition cursor-pointer"
            title="Dézoomer"
            aria-label="Zoom arrière"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={handleLocateUser}
          disabled={isLocatingUser}
          className={`radar-hud-panel rounded-lg border p-2 shadow-lg transition cursor-pointer ${
            isLocatingUser ? 'text-sky-300' : 'text-slate-200 hover:text-white'
          }`}
          title="Ma position GPS"
          aria-label="Centrer sur ma position GPS"
        >
          <Crosshair className={`h-4 w-4 ${isLocatingUser ? 'animate-spin' : ''}`} />
        </button>

        <button
          type="button"
          onClick={() => mapInstanceRef.current?.flyTo([46.65, 2.35], 6.0, { duration: 1.0 })}
          className="radar-hud-panel rounded-lg border p-2 text-slate-200 hover:text-white shadow-lg transition cursor-pointer"
          title="Vue France entière"
          aria-label="Recentrer sur la France"
        >
          <Compass className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => mapInstanceRef.current?.flyTo([48.5, 6.0], 4.5, { duration: 1.0 })}
          className="radar-hud-panel rounded-lg border p-2 text-slate-200 hover:text-white shadow-lg transition cursor-pointer"
          title="Vue Europe synoptique"
          aria-label="Vue Europe synoptique"
        >
          <Globe2 className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => setShowDistanceRings(!showDistanceRings)}
          className={`radar-hud-panel rounded-lg border p-2 shadow-lg transition cursor-pointer ${
            showDistanceRings ? '!border-sky-400 text-sky-300' : 'text-slate-300 hover:text-white'
          }`}
          title="Anneaux de portée radar (25–200 km)"
          aria-label="Afficher les anneaux de portée"
        >
          <Target className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => setShowGraticule(!showGraticule)}
          className={`radar-hud-panel rounded-lg border p-2 shadow-lg transition cursor-pointer ${
            showGraticule ? '!border-sky-400 text-sky-300' : 'text-slate-300 hover:text-white'
          }`}
          title="Grille Lat/Lon"
          aria-label="Afficher la grille géographique"
        >
          <Grid className="h-4 w-4" />
        </button>
      </div>

      {/* GPS Warning Toast if denied */}
      {userLocationError && (
        <div className="radar-hud-panel absolute top-14 right-14 z-30 rounded-lg border border-rose-500/60 px-3 py-1.5 text-xs text-rose-300 shadow-xl">
          {userLocationError}
        </div>
      )}

      {/* 4. MAIN LEAFLET MAP CANVAS STAGE */}
      <div ref={mapContainerRef} className="flex-1 w-full h-full z-0 cursor-crosshair" />

      {/* 5. BOTTOM TIMELINE PLAYER + METEOCIEL CONTINUOUS GRADUATED COLORBAR */}
      <div className="absolute bottom-2.5 left-2.5 right-2.5 z-20 pointer-events-none">
        <div className="radar-hud-panel mx-auto max-w-5xl rounded-xl border px-3 py-2.5 shadow-2xl pointer-events-auto space-y-2">
          {/* Top Timeline Strip */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            {/* Active Mode & Radar Source Toggle */}
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-bold text-white truncate">{activeScale.title}</span>

              {activeLayerMode === 'radar' && (
                <div className="flex items-center rounded-md bg-slate-900 p-0.5 border border-slate-700/80 text-[11px] font-semibold shrink-0">
                  <button
                    type="button"
                    onClick={() => setPrecipSource('live')}
                    className={`px-2 py-0.5 rounded transition cursor-pointer ${
                      precipSource === 'live' ? 'bg-sky-600 text-white' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Doppler Live
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrecipSource('model')}
                    className={`px-2 py-0.5 rounded transition cursor-pointer ${
                      precipSource === 'model' ? 'bg-sky-600 text-white' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Modèle +72h
                  </button>
                </div>
              )}

              <span className="hidden md:inline font-mono tabular-nums text-[11px] text-sky-300 shrink-0">
                {validTimeLabel}
                {isLiveDopplerMode ? (isNowcastFrame ? ' (Nowcast)' : ' (Direct)') : ` (${offsetHoursLabel})`}
              </span>
            </div>

            {/* Scrubber & Opacity Controls */}
            <div className="flex items-center gap-2 flex-1 max-w-xl">
              <button
                type="button"
                onClick={() =>
                  isLiveDopplerMode ? setIsRvPlaying(!isRvPlaying) : setIsModelPlaying(!isModelPlaying)
                }
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-sky-600 text-white hover:bg-sky-500 transition cursor-pointer"
                title="Lecture / Pause"
                aria-label="Lecture ou pause de l'animation"
              >
                {(isLiveDopplerMode ? isRvPlaying : isModelPlaying) ? (
                  <Pause className="h-3.5 w-3.5" />
                ) : (
                  <Play className="h-3.5 w-3.5 ml-0.5" />
                )}
              </button>

              {!isLiveDopplerMode && (
                <button
                  type="button"
                  onClick={() => {
                    setIsModelPlaying(false);
                    setGridHourIndex((p) => Math.max(0, p - 1));
                  }}
                  className="p-1 rounded bg-slate-800 text-slate-200 hover:bg-slate-700 cursor-pointer"
                  title="-1 heure"
                >
                  <SkipBack className="h-3.5 w-3.5" />
                </button>
              )}

              <input
                type="range"
                min={0}
                max={
                  isLiveDopplerMode
                    ? Math.max(0, rvFrames.length - 1)
                    : Math.max(0, (spatialGrid?.times?.length || 1) - 1)
                }
                value={isLiveDopplerMode ? rvFrameIndex : gridHourIndex}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (isLiveDopplerMode) {
                    setIsRvPlaying(false);
                    setRvFrameIndex(val);
                  } else {
                    setIsModelPlaying(false);
                    setGridHourIndex(val);
                  }
                }}
                className="flex-1 accent-sky-500 h-2 rounded bg-slate-800 cursor-pointer"
              />

              {!isLiveDopplerMode && (
                <button
                  type="button"
                  onClick={() => {
                    setIsModelPlaying(false);
                    const max = Math.max(0, (spatialGrid?.times?.length || 1) - 1);
                    setGridHourIndex((p) => Math.min(max, p + 1));
                  }}
                  className="p-1 rounded bg-slate-800 text-slate-200 hover:bg-slate-700 cursor-pointer"
                  title="+1 heure"
                >
                  <SkipForward className="h-3.5 w-3.5" />
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  if (isLiveDopplerMode) {
                    const lastPast = Math.max(0, (rvData?.radar?.past?.length || 1) - 1);
                    setRvFrameIndex(lastPast);
                  } else {
                    setGridHourIndex(baseNowHourIndex);
                  }
                }}
                className="rounded bg-emerald-600/90 hover:bg-emerald-500 px-2 py-1 text-[10px] font-bold text-white shrink-0 cursor-pointer"
                title="Revenir à l'instant présent"
              >
                Direct
              </button>

              <button
                type="button"
                onClick={() =>
                  setPlaybackSpeedMs((s) => (s === 750 ? 380 : s === 380 ? 1300 : 750))
                }
                className="hidden sm:inline-block rounded bg-slate-800 px-2 py-1 text-[10px] font-mono font-bold text-slate-200 hover:bg-slate-700 shrink-0 cursor-pointer"
                title="Vitesse d'animation"
              >
                {playbackSpeedMs === 380 ? '2x' : playbackSpeedMs === 1300 ? '0.5x' : '1x'}
              </button>

              <div className="hidden lg:flex items-center gap-1.5 text-[10px] text-slate-300 shrink-0 pl-1 border-l border-slate-700/70">
                <span>Opacité</span>
                <input
                  type="range"
                  min={0.25}
                  max={1}
                  step={0.05}
                  value={overlayOpacity}
                  onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
                  className="w-14 accent-sky-500 h-1.5 cursor-pointer"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  if (isLiveDopplerMode) setRvFrameIndex(0);
                  else setGridHourIndex(baseNowHourIndex);
                }}
                className="hidden sm:inline-flex rounded bg-slate-800 p-1 text-slate-300 hover:text-white cursor-pointer"
                title="Réinitialiser la chronologie"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Continuous Meteociel Graduated Horizontal Colorbar Legend */}
          <div className="pt-1 border-t border-slate-700/60 flex flex-col gap-1">
            <div
              className="w-full h-2.5 rounded border border-slate-700/70"
              style={{ background: colorbarGradient }}
            />
            <div className="flex items-center justify-between text-[10px] font-mono tabular-nums text-slate-300 px-0.5">
              {activeScale.ticks.map((tk) => (
                <span key={tk.label}>{tk.label}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
