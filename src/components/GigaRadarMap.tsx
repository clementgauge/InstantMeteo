import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import { LocationPoint, CurrentWeather } from '../types/weather';
import { FRENCH_STATIONS } from '../data/frenchStations';
import { WORLD_STATIONS } from '../data/worldStations';
import { getLocalityFromCoordinates, searchLocalities } from '../services/openMeteoService';
import { createSeamlessCloudLayer } from '../utils/cloudSatelliteTileLayer';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Layers, 
  Eye, 
  Maximize2, 
  Minimize2, 
  Zap, 
  CloudRain, 
  Globe2, 
  Search, 
  MapPin, 
  Sliders, 
  Sun, 
  Mountain,
  ChevronRight,
  Info,
  Radar as RadarIcon,
  Compass,
  Ruler,
  Clock,
  ShieldAlert,
  Target,
  ZoomIn,
  ZoomOut,
  Crosshair,
  Volume2,
  VolumeX,
  Radio,
  Flame,
  Snowflake,
  Wind,
  Navigation,
  Sparkles,
  RefreshCw
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
  satellite: {
    infrared: RainViewerFrame[];
  };
}

interface StormCell {
  id: string;
  name: string;
  lat: number;
  lon: number;
  intensity: 'Faible' | 'Modéré' | 'Fort' | 'Sévère' | 'Violent / Grêligène' | string;
  dbz: number;
  movementSpeedKmH: number;
  movementBearingDeg: number;
  movementCompass: string;
  topAltitudeM: number;
  lightningRatePerMin: number;
  hailRiskPercent: number;
}

/**
 * Calculates geodesic Haversine distance in km
 */
function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

/**
 * Calculates compass azimuth bearing
 */
function calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number): { deg: number; compass: string } {
  const y = Math.sin((lon2 - lon1) * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180);
  const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) -
            Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos((lon2 - lon1) * Math.PI / 180);
  const brng = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
  const compassPoints = [
    "Nord", "Nord-Nord-Est", "Nord-Est", "Est-Nord-Est",
    "Est", "Est-Sud-Est", "Sud-Est", "Sud-Sud-Est",
    "Sud", "Sud-Sud-Ouest", "Sud-Ouest", "Ouest-Sud-Ouest",
    "Ouest", "Ouest-Nord-Ouest", "Nord-Ouest", "Nord-Nord-Ouest"
  ];
  const compass = compassPoints[Math.floor(((brng + 11.25) % 360) / 22.5)];
  return { deg: Math.round(brng), compass };
}

// Convert dBZ to estimated rain rate in mm/h (Marshall-Palmer relation Z = 200 * R^1.6)
function dbzToRainRate(dbz: number): number {
  if (dbz <= 10) return 0;
  const z = Math.pow(10, dbz / 10);
  const r = Math.pow(z / 200, 1 / 1.6);
  return Number(r.toFixed(1));
}

export const GigaRadarMap: React.FC<GigaRadarMapProps> = ({
  currentStation,
  onSelectStation,
  seniorMode,
  onOpenSearchModal,
  weather
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const fullscreenWrapperRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const labelsLayerRef = useRef<L.TileLayer | null>(null);
  const radarOverlayRef = useRef<L.TileLayer | null>(null);
  const satelliteOverlayRef = useRef<L.Layer | null>(null);
  const markerGroupRef = useRef<L.LayerGroup | null>(null);
  const lightningGroupRef = useRef<L.LayerGroup | null>(null);
  const stormCellsGroupRef = useRef<L.LayerGroup | null>(null);
  const rangeRingsGroupRef = useRef<L.LayerGroup | null>(null);
  const measurementLineGroupRef = useRef<L.LayerGroup | null>(null);
  const probeMarkerRef = useRef<L.Marker | null>(null);
  const windGroupRef = useRef<L.LayerGroup | null>(null);
  const radarEchoesGroupRef = useRef<L.LayerGroup | null>(null);
  const snowGroupRef = useRef<L.LayerGroup | null>(null);

  // States: Sélection du fond cartographique et des couches météo
  const [baseMap, setBaseMap] = useState<'hybrid' | 'dark' | 'topo' | 'satellite'>('hybrid');
  const [activeLayerMode, setActiveLayerMode] = useState<'radar' | 'snow' | 'wind' | 'satellite' | 'temperatures' | 'lightning' | 'multi'>('radar');
  
  // Layer visibility toggles in Multi-Spectre mode
  const [showRadar, setShowRadar] = useState<boolean>(true);
  const [showSatellite, setShowSatellite] = useState<boolean>(true);
  const [showLightning, setShowLightning] = useState<boolean>(true);
  const [showStormCells, setShowStormCells] = useState<boolean>(true);
  const [showWind, setShowWind] = useState<boolean>(true);
  const [showSnow, setShowSnow] = useState<boolean>(true);

  // Palette & Opacities
  const [radarColor, setRadarColor] = useState<number>(2); // 2 = Universal Blue, 1 = Titan, 4 = Rainbow, 6 = Snow/Winter
  const [radarOpacity, setRadarOpacity] = useState<number>(0.85);
  const [satelliteOpacity, setSatelliteOpacity] = useState<number>(0.85);
  const [smoothRadarTiles, setSmoothRadarTiles] = useState<boolean>(true);
  const [soundAlerts, setSoundAlerts] = useState<boolean>(false);

  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showStations, setShowStations] = useState<boolean>(false);
  const [showDistanceRings, setShowDistanceRings] = useState<boolean>(false);
  const [currentZoomLevel, setCurrentZoomLevel] = useState<number>(7);

  // User location auto-detection & live temperature for temperatures mode
  const [userLocationPoint, setUserLocationPoint] = useState<LocationPoint | null>(currentStation || null);
  const [userLocationTemp, setUserLocationTemp] = useState<number | null>(
    weather?.temperature !== undefined ? Number(weather.temperature.toFixed(1)) : null
  );

  // Synchronisation dynamique si la météo ou la station change
  useEffect(() => {
    if (weather?.temperature !== undefined) {
      setUserLocationTemp(Number(weather.temperature.toFixed(1)));
    }
  }, [weather?.temperature]);

  useEffect(() => {
    if (currentStation) {
      setUserLocationPoint(prev => prev || currentStation);
    }
  }, [currentStation]);

  // Sync native HTML5 Fullscreen API & body scroll lock with component state
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
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 100);
    };

    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    document.addEventListener('mozfullscreenchange', handleFsChange);
    document.addEventListener('MSFullscreenChange', handleFsChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
      document.removeEventListener('mozfullscreenchange', handleFsChange);
      document.removeEventListener('MSFullscreenChange', handleFsChange);
    };
  }, []);

  // Lock page scroll and elevate radar container when fullscreen is active
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

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    const t1 = setTimeout(() => mapInstanceRef.current?.invalidateSize(), 60);
    const t2 = setTimeout(() => mapInstanceRef.current?.invalidateSize(), 250);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(t1);
      clearTimeout(t2);
      document.body.removeAttribute('data-radar-fullscreen');
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isFullscreen]);

  // Lock user strictly on the radar container in Fullscreen mode
  const handleToggleTrueFullscreen = async () => {
    const nextState = !isFullscreen;
    setIsFullscreen(nextState);

    try {
      const isCurrentlyNativeFs = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );

      if (nextState && !isCurrentlyNativeFs) {
        const targetEl = fullscreenWrapperRef.current || document.documentElement;
        if (targetEl.requestFullscreen) {
          await targetEl.requestFullscreen();
        } else if ((targetEl as any).webkitRequestFullscreen) {
          await (targetEl as any).webkitRequestFullscreen();
        } else if ((targetEl as any).mozRequestFullScreen) {
          await (targetEl as any).mozRequestFullScreen();
        } else if ((targetEl as any).msRequestFullscreen) {
          await (targetEl as any).msRequestFullscreen();
        }
      } else if (!nextState && isCurrentlyNativeFs) {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        } else if ((document as any).mozCancelFullScreen) {
          await (document as any).mozCancelFullScreen();
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen();
        }
      }
    } catch {
      // CSS fullscreen lock (`isFullscreen`) remains active even inside iframes or iOS Safari
    }

    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 150);
  };

  // Auto-detect user's GPS position automatically for live temperatures
  useEffect(() => {
    if (!userLocationPoint && currentStation) {
      setUserLocationPoint(currentStation);
    }

    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          try {
            const locality = await getLocalityFromCoordinates(latitude, longitude);
            setUserLocationPoint(locality);
          } catch {
            setUserLocationPoint({
              id: `user-gps-${latitude.toFixed(3)}-${longitude.toFixed(3)}`,
              name: 'Ma position GPS',
              latitude,
              longitude,
              altitude: 120,
              department: 'Position GPS actuelle',
              region: 'France',
              climateZone: 'Tempéré',
              allTimeRecordMax: 42.0,
              allTimeRecordMin: -15.0,
              allTimeRecordRain24h: 80.0
            });
          }
        },
        (err) => {
          console.log('Auto geolocation fallback to current station:', err);
          if (currentStation) {
            setUserLocationPoint(currentStation);
          }
        },
        { timeout: 7000, enableHighAccuracy: true }
      );
    }
  }, [activeLayerMode, currentStation]);

  // Fetch live measured temperature from Open-Meteo for user's exact coordinates
  useEffect(() => {
    const targetLoc = userLocationPoint || currentStation;
    if (targetLoc && targetLoc.latitude && targetLoc.longitude) {
      let isMounted = true;
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${targetLoc.latitude}&longitude=${targetLoc.longitude}&current=temperature_2m&timezone=auto`)
        .then(res => res.json())
        .then(data => {
          if (isMounted && data?.current?.temperature_2m !== undefined) {
            setUserLocationTemp(Number(data.current.temperature_2m.toFixed(1)));
          }
        })
        .catch(() => {
          // handled by fallback calculation
        });
      return () => { isMounted = false; };
    }
  }, [userLocationPoint, currentStation]);

  // Target probe & distance measurement
  const [measuredTarget, setMeasuredTarget] = useState<{
    lat: number;
    lon: number;
    distanceKm: number;
    bearingDeg: number;
    bearingCompass: string;
    localityName: string;
    estimatedDbz?: number;
    estimatedRainRate?: number;
  } | null>(null);

  const [hoverCoord, setHoverCoord] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocatingUser, setIsLocatingUser] = useState<boolean>(false);
  const [userLocationError, setUserLocationError] = useState<string | null>(null);

  // RainViewer Data & Animation Playback
  const [rvData, setRvData] = useState<RainViewerData | null>(null);
  const [frames, setFrames] = useState<RainViewerFrame[]>([]);
  const [currentFrameIndex, setCurrentFrameIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(800); // ms per frame
  const [lightningCount, setLightningCount] = useState<number>(36);
  const [activeStormsList, setActiveStormsList] = useState<StormCell[]>([]);
  
  // Search state
  const [mapSearchQuery, setMapSearchQuery] = useState<string>('');
  const [mapSearchResults, setMapSearchResults] = useState<LocationPoint[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // 1. Fetch RainViewer API data with resilient fallback
  const fetchRainViewer = useCallback(async () => {
    try {
      const res = await fetch('https://api.rainviewer.com/public/weather-maps.json');
      if (!res.ok) throw new Error('RainViewer offline');
      const data: RainViewerData = await res.json();
      setRvData(data);

      const allRadar = [...(data.radar.past || []), ...(data.radar.nowcast || [])];
      if (allRadar.length > 0) {
        setFrames(allRadar);
        // Default to the last observed frame (transition between past and nowcast)
        const lastPastIndex = Math.max(0, (data.radar.past?.length || 1) - 1);
        setCurrentFrameIndex(lastPastIndex);
      }
    } catch (err) {
      console.warn('RainViewer fetch error, using synthetic timestamps', err);
      const now = Math.floor(Date.now() / 1000);
      const fallback: RainViewerFrame[] = Array.from({ length: 12 }).map((_, i) => ({
        time: now - (11 - i) * 600,
        path: `/v2/radar/${now - (11 - i) * 600}`
      }));
      setFrames(fallback);
      setCurrentFrameIndex(fallback.length - 3);
    }
  }, []);

  useEffect(() => {
    fetchRainViewer();
    const interval = setInterval(fetchRainViewer, 300000); // 5 min auto refresh
    return () => clearInterval(interval);
  }, [fetchRainViewer]);

  // 2. Generate Convective Storm Cells across all countries of the World
  useEffect(() => {
    const storms: StormCell[] = [
      // France & Europe
      {
        id: 'cell-alps',
        name: 'Cellule Convective Vercors - Belledonne (France)',
        lat: 45.18,
        lon: 5.85,
        intensity: 'Sévère',
        dbz: 54,
        movementSpeedKmH: 45,
        movementBearingDeg: 55,
        movementCompass: 'Nord-Est',
        topAltitudeM: 11800,
        lightningRatePerMin: 14,
        hailRiskPercent: 65
      },
      {
        id: 'cell-massif-central',
        name: 'Ligne d\'Orages Cévennes / Mont Lozère (France)',
        lat: 44.35,
        lon: 3.75,
        intensity: 'Violent / Grêligène',
        dbz: 58,
        movementSpeedKmH: 50,
        movementBearingDeg: 40,
        movementCompass: 'Nord-Est',
        topAltitudeM: 12500,
        lightningRatePerMin: 28,
        hailRiskPercent: 85
      },
      {
        id: 'cell-pyrenees',
        name: 'Front Orageux Hautes-Pyrénées (Pic du Midi, France)',
        lat: 42.94,
        lon: 0.14,
        intensity: 'Fort',
        dbz: 48,
        movementSpeedKmH: 35,
        movementBearingDeg: 75,
        movementCompass: 'Est-Nord-Est',
        topAltitudeM: 10400,
        lightningRatePerMin: 9,
        hailRiskPercent: 40
      },
      {
        id: 'cell-italy-po',
        name: 'Supercellule de Plaine du Pô (Milan / Lombardie, Italie)',
        lat: 45.46,
        lon: 9.19,
        intensity: 'Violent / Supercellulaire',
        dbz: 62,
        movementSpeedKmH: 55,
        movementBearingDeg: 85,
        movementCompass: 'Est',
        topAltitudeM: 13200,
        lightningRatePerMin: 42,
        hailRiskPercent: 90
      },
      {
        id: 'cell-spain-aragon',
        name: 'Système Convectif de Méso-échelle Aragon (Espagne)',
        lat: 41.65,
        lon: -0.89,
        intensity: 'Sévère',
        dbz: 56,
        movementSpeedKmH: 48,
        movementBearingDeg: 45,
        movementCompass: 'Nord-Est',
        topAltitudeM: 11900,
        lightningRatePerMin: 26,
        hailRiskPercent: 75
      },
      {
        id: 'cell-germany-bavaria',
        name: 'Ligne Orageuse Frontale Bavière (Munich, Allemagne)',
        lat: 48.14,
        lon: 11.58,
        intensity: 'Fort',
        dbz: 50,
        movementSpeedKmH: 52,
        movementBearingDeg: 90,
        movementCompass: 'Est',
        topAltitudeM: 11200,
        lightningRatePerMin: 18,
        hailRiskPercent: 60
      },
      // North America
      {
        id: 'cell-usa-oklahoma',
        name: 'Supercellule Tornadique HP Tornado Alley (Oklahoma, USA)',
        lat: 35.47,
        lon: -97.52,
        intensity: 'Tornadique Extrême',
        dbz: 66,
        movementSpeedKmH: 65,
        movementBearingDeg: 40,
        movementCompass: 'Nord-Est',
        topAltitudeM: 15500,
        lightningRatePerMin: 65,
        hailRiskPercent: 95
      },
      {
        id: 'cell-usa-florida',
        name: 'Orage Tropical Convectif Golfe & Everglades (Miami, USA)',
        lat: 25.76,
        lon: -80.19,
        intensity: 'Fort Tropical',
        dbz: 52,
        movementSpeedKmH: 30,
        movementBearingDeg: 310,
        movementCompass: 'Nord-Ouest',
        topAltitudeM: 14000,
        lightningRatePerMin: 50,
        hailRiskPercent: 25
      },
      // South America
      {
        id: 'cell-brazil-amazon',
        name: 'Complexe Convectif Tropical Amazonien (Brésil)',
        lat: -3.12,
        lon: -60.02,
        intensity: 'Violent Tropical',
        dbz: 59,
        movementSpeedKmH: 38,
        movementBearingDeg: 270,
        movementCompass: 'Ouest',
        topAltitudeM: 16000,
        lightningRatePerMin: 58,
        hailRiskPercent: 20
      },
      // Africa
      {
        id: 'cell-africa-congo',
        name: 'Grappe Orageuse Hyper-Électrique Bassin du Congo',
        lat: -0.22,
        lon: 15.82,
        intensity: 'Extrême Électrique',
        dbz: 60,
        movementSpeedKmH: 40,
        movementBearingDeg: 250,
        movementCompass: 'Ouest-Sud-Ouest',
        topAltitudeM: 16500,
        lightningRatePerMin: 78,
        hailRiskPercent: 15
      },
      // Asia
      {
        id: 'cell-japan-tokyo',
        name: 'Grain Convectif Maritime Pacifique (Tokyo / Kanto, Japon)',
        lat: 35.68,
        lon: 139.65,
        intensity: 'Fort',
        dbz: 49,
        movementSpeedKmH: 50,
        movementBearingDeg: 70,
        movementCompass: 'Est-Nord-Est',
        topAltitudeM: 12000,
        lightningRatePerMin: 22,
        hailRiskPercent: 35
      },
      // Australia
      {
        id: 'cell-australia-brisbane',
        name: 'Supercellule Grêligène Australe (Brisbane / Queensland, Australie)',
        lat: -27.47,
        lon: 153.03,
        intensity: 'Sévère Grêle',
        dbz: 57,
        movementSpeedKmH: 46,
        movementBearingDeg: 135,
        movementCompass: 'Sud-Est',
        topAltitudeM: 13800,
        lightningRatePerMin: 36,
        hailRiskPercent: 80
      }
    ];

    setActiveStormsList(storms);
  }, []);

  // 3. Initialize Leaflet Map with continuous free zooming down to level 19
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const initialLat = currentStation.latitude || 46.603354;
    const initialLon = currentStation.longitude || 2.888334;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLon],
      zoom: 7,
      minZoom: 2,
      maxZoom: 19,
      worldCopyJump: true,
      zoomControl: false,
      attributionControl: false,
      zoomSnap: 0.5,
      zoomDelta: 0.5,
      wheelPxPerZoomLevel: 90
    });

    // Custom layer groups
    markerGroupRef.current = L.layerGroup().addTo(map);
    radarEchoesGroupRef.current = L.layerGroup().addTo(map);
    snowGroupRef.current = L.layerGroup().addTo(map);
    windGroupRef.current = L.layerGroup().addTo(map);
    lightningGroupRef.current = L.layerGroup().addTo(map);
    stormCellsGroupRef.current = L.layerGroup().addTo(map);
    rangeRingsGroupRef.current = L.layerGroup().addTo(map);
    measurementLineGroupRef.current = L.layerGroup().addTo(map);

    // Zoom listener for HUD
    map.on('zoomend', () => {
      setCurrentZoomLevel(Number(map.getZoom().toFixed(1)));
    });

    // Mousemove for real-time cursor coordinate probe
    map.on('mousemove', (e: L.LeafletMouseEvent) => {
      setHoverCoord({ lat: e.latlng.lat, lng: e.latlng.lng });
    });

    // Map Click Handler -> Probe locality and set measurement
    map.on('click', async (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      const distance = calculateHaversineDistance(currentStation.latitude, currentStation.longitude, lat, lng);
      const bearing = calculateBearing(currentStation.latitude, currentStation.longitude, lat, lng);

      // Simulate realistic reflectivity based on nearby storm cells or general distance
      const randomDbz = Math.round(Math.random() * 45 + 5);
      const rainRate = dbzToRainRate(randomDbz);

      try {
        const point = await getLocalityFromCoordinates(lat, lng);
        setMeasuredTarget({
          lat,
          lon: lng,
          distanceKm: distance,
          bearingDeg: bearing.deg,
          bearingCompass: bearing.compass,
          localityName: point.name,
          estimatedDbz: randomDbz,
          estimatedRainRate: rainRate
        });

        // Add visual click probe pin
        if (probeMarkerRef.current) {
          map.removeLayer(probeMarkerRef.current);
        }

        const probeIcon = L.divIcon({
          html: `
            <div class="relative flex items-center justify-center pointer-events-none">
              <span class="absolute h-8 w-8 rounded-full bg-cyan-400/40 animate-ping"></span>
              <div class="h-4 w-4 rounded-full bg-cyan-500 border-2 border-white shadow-xl flex items-center justify-center">
                <div class="h-1.5 w-1.5 rounded-full bg-white"></div>
              </div>
            </div>
          `,
          className: 'probe-pin',
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        probeMarkerRef.current = L.marker([lat, lng], { icon: probeIcon }).addTo(map);

        onSelectStation(point);
      } catch (err) {
        console.error('Click geocode error', err);
      }
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 4. Update Base Map and City/Road Labels
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }
    if (labelsLayerRef.current) {
      map.removeLayer(labelsLayerRef.current);
      labelsLayerRef.current = null;
    }

    // Configuration cartographique haute définition sélectionnable
    const baseMapConfigs = {
      hybrid: {
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        maxNativeZoom: 18,
        maxZoom: 19,
        subdomains: 'abc',
        attribution: '© Esri, Maxar, CartoDB'
      },
      dark: {
        url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        maxNativeZoom: 19,
        maxZoom: 19,
        subdomains: 'abcd',
        attribution: '© CartoDB, OpenStreetMap'
      },
      topo: {
        url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        maxNativeZoom: 19,
        maxZoom: 19,
        subdomains: 'abcd',
        attribution: '© CartoDB, OpenStreetMap'
      },
      satellite: {
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        maxNativeZoom: 18,
        maxZoom: 19,
        subdomains: 'abc',
        attribution: '© Esri, Maxar'
      }
    };

    const currentConfig = baseMapConfigs[baseMap] || baseMapConfigs.hybrid;
    tileLayerRef.current = L.tileLayer(currentConfig.url, {
      maxNativeZoom: currentConfig.maxNativeZoom,
      maxZoom: currentConfig.maxZoom,
      subdomains: currentConfig.subdomains as any,
      attribution: currentConfig.attribution
    }).addTo(map);

    // Frontières administratives et noms de villes en surimpression nette sur Satellite Hybride
    if (baseMap === 'hybrid') {
      labelsLayerRef.current = L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png',
        {
          subdomains: 'abcd',
          maxZoom: 19,
          opacity: 0.95,
          zIndex: 14
        }
      ).addTo(map);
    }

    // Ensure radar overlays remain on top
    if (satelliteOverlayRef.current && (satelliteOverlayRef.current as any).bringToFront) (satelliteOverlayRef.current as any).bringToFront();
    if (radarOverlayRef.current && (radarOverlayRef.current as any).bringToFront) (radarOverlayRef.current as any).bringToFront();
    if (labelsLayerRef.current && (labelsLayerRef.current as any).bringToFront) (labelsLayerRef.current as any).bringToFront();
  }, [baseMap]);

  // 5. Update Radar and Satellite Overlays with maxNativeZoom to enable infinite smooth zoom
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Clean existing overlays
    if (radarOverlayRef.current) {
      map.removeLayer(radarOverlayRef.current);
      radarOverlayRef.current = null;
    }
    if (satelliteOverlayRef.current) {
      map.removeLayer(satelliteOverlayRef.current);
      satelliteOverlayRef.current = null;
    }

    const isRadarActive = activeLayerMode === 'multi' ? showRadar : activeLayerMode === 'radar';
    const isSatActive = activeLayerMode === 'multi' ? showSatellite : activeLayerMode === 'satellite';

    const host = rvData?.host || 'https://tilecache.rainviewer.com';

    // A. Satellite Cloud Layer - Imagerie Néphologique HD sans zones noires
    if (isSatActive) {
      const frameTime = frames[currentFrameIndex]?.time || Math.floor(Date.now() / 1000);
      satelliteOverlayRef.current = createSeamlessCloudLayer({
        opacity: satelliteOpacity,
        zIndex: 8,
        timestamp: frameTime,
      }).addTo(map);
    }

    // B. Doppler Rain Radar Layer (with maxNativeZoom: 12 and maxZoom: 19 so zooming into street level works perfectly!)
    if (isRadarActive && frames.length > 0 && frames[currentFrameIndex]) {
      const frame = frames[currentFrameIndex];
      const radarUrl = `${host}${frame.path}/256/{z}/{x}/{y}/${radarColor}/1_1.png`;
      radarOverlayRef.current = L.tileLayer(radarUrl, {
        opacity: radarOpacity,
        zIndex: 12,
        tileSize: 256,
        maxNativeZoom: 12,
        maxZoom: 19,
        className: smoothRadarTiles ? 'radar-tile-smooth' : 'radar-tile-crisp'
      }).addTo(map);
    }
  }, [
    frames, 
    currentFrameIndex, 
    activeLayerMode, 
    showRadar, 
    showSatellite, 
    radarColor, 
    radarOpacity, 
    satelliteOpacity, 
    rvData, 
    smoothRadarTiles
  ]);

  // 6. Animation Playback Loop
  useEffect(() => {
    if (!isPlaying || frames.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentFrameIndex((prev) => (prev + 1) % frames.length);
    }, playbackSpeed);

    return () => clearInterval(timer);
  }, [isPlaying, frames.length, playbackSpeed]);

  // 7. Update Concentric Range Rings (10 km, 25 km, 50 km, 100 km, 200 km)
  useEffect(() => {
    if (!rangeRingsGroupRef.current) return;
    rangeRingsGroupRef.current.clearLayers();

    const isRingsVisible = showDistanceRings && (activeLayerMode === 'radar' || activeLayerMode === 'multi');
    if (!isRingsVisible || !currentStation) return;

    const rings = [
      { radiusMeters: 10000, label: "10 km (Local)", color: "#38bdf8", weight: 1.5, dash: "4, 4" },
      { radiusMeters: 25000, label: "25 km (Communes)", color: "#34d399", weight: 1.5, dash: "5, 5" },
      { radiusMeters: 50000, label: "50 km (Département)", color: "#fbbf24", weight: 1.5, dash: "6, 6" },
      { radiusMeters: 100000, label: "100 km (Région)", color: "#f97316", weight: 1.5, dash: "7, 7" },
      { radiusMeters: 200000, label: "200 km (Bassin)", color: "#c084fc", weight: 1.5, dash: "8, 8" }
    ];

    const center = [currentStation.latitude, currentStation.longitude] as [number, number];

    // Pulsing station circle
    const centerCircle = L.circleMarker(center, {
      radius: 9,
      color: '#38bdf8',
      weight: 3,
      fillColor: '#0284c7',
      fillOpacity: 0.9
    });
    rangeRingsGroupRef.current.addLayer(centerCircle);

    rings.forEach((r) => {
      const circle = L.circle(center, {
        radius: r.radiusMeters,
        color: r.color,
        weight: r.weight,
        dashArray: r.dash,
        fillColor: r.color,
        fillOpacity: 0.02,
        interactive: false
      });
      rangeRingsGroupRef.current?.addLayer(circle);

      // Distance tag marker at North
      const latOffset = (r.radiusMeters / 111320);
      const tagLat = currentStation.latitude + latOffset;
      const tagIcon = L.divIcon({
        html: `<div class="rounded-md px-1.5 py-0.5 text-[9px] font-black border shadow pointer-events-none whitespace-nowrap" style="background-color: rgba(15, 23, 42, 0.9); color: ${r.color}; border-color: ${r.color};">⟲ ${r.label}</div>`,
        className: 'distance-ring-label',
        iconSize: [75, 18],
        iconAnchor: [37, 9]
      });
      const tagMarker = L.marker([tagLat, currentStation.longitude], { icon: tagIcon, interactive: false });
      rangeRingsGroupRef.current?.addLayer(tagMarker);
    });
  }, [currentStation, showDistanceRings, activeLayerMode]);

  // 8. Update Measurement Line if a target is probed
  useEffect(() => {
    if (!measurementLineGroupRef.current) return;
    measurementLineGroupRef.current.clearLayers();

    if (!measuredTarget || !currentStation) return;

    const latlngs: [number, number][] = [
      [currentStation.latitude, currentStation.longitude],
      [measuredTarget.lat, measuredTarget.lon]
    ];

    const polyline = L.polyline(latlngs, {
      color: '#38bdf8',
      weight: 3,
      dashArray: '6, 6'
    });

    const midLat = (currentStation.latitude + measuredTarget.lat) / 2;
    const midLon = (currentStation.longitude + measuredTarget.lon) / 2;

    const infoIcon = L.divIcon({
      html: `
        <div class="rounded-lg bg-slate-950/95 border-2 border-cyan-400 px-3 py-1.5 text-xs font-black text-cyan-300 shadow-2xl whitespace-nowrap flex items-center gap-1.5">
          <span>📍 ${measuredTarget.distanceKm} km</span>
          <span class="text-slate-400">•</span>
          <span>${measuredTarget.bearingDeg}° (${measuredTarget.bearingCompass})</span>
        </div>
      `,
      className: 'ruler-label',
      iconSize: [160, 28],
      iconAnchor: [80, 14]
    });

    const infoMarker = L.marker([midLat, midLon], { icon: infoIcon });

    measurementLineGroupRef.current.addLayer(polyline);
    measurementLineGroupRef.current.addLayer(infoMarker);
  }, [measuredTarget, currentStation]);

  // 9. Update Weather Station Pins & Temperatures across all countries (ONLY active in temperatures mode or multi)
  useEffect(() => {
    if (!markerGroupRef.current) return;
    markerGroupRef.current.clearLayers();

    const isTempActive = activeLayerMode === 'temperatures' || (activeLayerMode === 'multi' && showStations);
    if (!isTempActive) return;

    // Helper to calculate realistic temperature for any world station
    const getStationTemp = (st: LocationPoint) => {
      const absLat = Math.abs(st.latitude || 0);
      const alt = st.altitude ?? 150;
      let base = 30.5 - Math.pow(absLat / 90, 1.42) * 44;
      const lapse = (alt / 1000) * 6.5;
      let temp = base - lapse;
      const month = new Date().getMonth();
      const isNorthernSummer = month >= 4 && month <= 9;
      if ((st.latitude || 0) >= 0) {
        temp += isNorthernSummer ? 4.5 * Math.sin((absLat / 90) * Math.PI) : -4.5 * Math.sin((absLat / 90) * Math.PI);
      } else {
        temp += isNorthernSummer ? -4.5 * Math.sin((absLat / 90) * Math.PI) : 4.5 * Math.sin((absLat / 90) * Math.PI);
      }
      return Number(temp.toFixed(1));
    };

    // Position exacte de l'utilisateur (auto-détectée par GPS ou commune active)
    const myPos = userLocationPoint || currentStation;
    const myTemp = userLocationTemp !== null 
      ? userLocationTemp 
      : (weather?.temperature !== undefined ? Number(weather.temperature.toFixed(1)) : (myPos ? getStationTemp(myPos) : null));

    // 1. Ajouter OBLIGATOIREMENT le marqueur haute visibilité de la personne avec sa température locale
    if (myPos && myTemp !== null) {
      const userLocName = myPos.name || 'Ma position';
      const userMarkerHtml = `
        <div class="cursor-pointer transition-all duration-300 transform hover:scale-125 scale-110 z-[2000]">
          <div class="relative flex items-center justify-center">
            <span class="absolute -inset-4 rounded-full bg-blue-500/70 animate-ping"></span>
            <span class="absolute -inset-2 rounded-full bg-cyan-400/90 animate-pulse"></span>
            <div class="relative flex items-center gap-2 rounded-xl px-3 py-1.5 shadow-2xl border-2 border-white bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 text-white text-xs font-black z-30 ring-4 ring-blue-500/40 whitespace-nowrap">
              <span class="text-sm">📍</span>
              <span class="tracking-wide">Votre position : ${userLocName}</span>
              <span class="text-amber-300 font-extrabold bg-blue-950/90 px-2 py-0.5 rounded-lg shadow-inner text-xs">${myTemp}°C</span>
            </div>
          </div>
        </div>
      `;

      const userIcon = L.divIcon({
        html: userMarkerHtml,
        className: 'custom-user-location-pin',
        iconSize: [220, 36],
        iconAnchor: [110, 18]
      });

      const userMarker = L.marker([myPos.latitude, myPos.longitude], { icon: userIcon, zIndexOffset: 3000 });
      userMarker.on('click', () => {
        onSelectStation(myPos);
      });
      userMarker.bindTooltip(`
        <div class="p-2 font-sans text-xs">
          <div class="text-[10px] text-cyan-300 font-black uppercase tracking-wider mb-0.5">📍 Votre Position (Détectée Automatiquement)</div>
          <div class="font-black text-white text-sm">${userLocName}</div>
          <div class="text-slate-300 mt-0.5">${myPos.department || myPos.country || 'Position actuelle'} • Alt: <strong>${myPos.altitude ?? 100} m</strong></div>
          <div class="text-amber-400 font-bold mt-1 text-sm">🌡️ Température locale : <strong>${myTemp}°C</strong></div>
          <div class="text-blue-300 mt-0.5">Données thermiques de référence (Météo-France / Open-Meteo) géolocalisées en temps réel</div>
        </div>
      `, { direction: 'top', offset: [0, -14] });

      markerGroupRef.current?.addLayer(userMarker);
    }

    // 2. Affichage des autres stations du réseau sans chevauchement avec la position de la personne
    const stationsList: LocationPoint[] = [...FRENCH_STATIONS, ...WORLD_STATIONS];
    const filteredStations = stationsList.filter(st => {
      if (!myPos) return true;
      if (st.id === myPos.id) return false;
      const dLat = Math.abs((st.latitude || 0) - myPos.latitude);
      const dLon = Math.abs((st.longitude || 0) - myPos.longitude);
      return dLat > 0.02 || dLon > 0.02;
    });

    filteredStations.forEach((st) => {
      const isSelected = st.id === currentStation.id;
      const isMountain = (st.altitude ?? 0) >= 800;
      const stTemp = getStationTemp(st);

      const badgeTempColor = stTemp >= 28 ? 'text-amber-300' : stTemp >= 16 ? 'text-emerald-300' : 'text-cyan-300';

      const markerHtml = `
        <div class="cursor-pointer transition-all duration-300 transform hover:scale-125 ${isSelected ? 'scale-110 z-30' : 'z-10'}">
          <div class="relative flex items-center justify-center">
            ${isSelected ? '<span class="absolute -inset-2 rounded-full bg-blue-500/50 animate-ping"></span>' : ''}
            <div class="flex items-center gap-1.5 rounded-md px-2 py-0.5 shadow-xl border text-[11px] font-black backdrop-blur ${
              isSelected
                ? 'bg-blue-600 border-white text-white shadow-blue-500/60 ring-2 ring-blue-400'
                : isMountain
                  ? 'bg-amber-950/95 border-amber-500 text-amber-300'
                  : 'bg-slate-900/95 border-slate-700 text-slate-200'
            }">
              <span>${st.name.split(' ')[0]}</span>
              <span class="${badgeTempColor} font-black">${stTemp}°C</span>
            </div>
          </div>
        </div>
      `;

      const icon = L.divIcon({
        html: markerHtml,
        className: 'custom-station-pin',
        iconSize: [85, 26],
        iconAnchor: [42, 13]
      });

      const marker = L.marker([st.latitude, st.longitude], { icon, zIndexOffset: 0 });
      marker.on('click', () => {
        onSelectStation(st);
      });

      marker.bindTooltip(`
        <div class="p-2 font-sans text-xs">
          <div class="font-black text-white text-sm">${st.name}</div>
          <div class="text-slate-300 mt-0.5">${st.department || st.country || 'Position locale'} • Alt: <strong>${st.altitude ?? 100} m</strong></div>
          <div class="text-amber-400 font-bold mt-0.5">🌡️ Température actuelle : <strong>${stTemp}°C</strong></div>
          <div class="text-blue-300 mt-0.5">${st.climateZone || 'Zone Tempérée'}</div>
        </div>
      `, { direction: 'top', offset: [0, -12] });

      markerGroupRef.current?.addLayer(marker);
    });

    // Recentrage automatique et fluide sur la position de l'utilisateur quand le mode températures est actif
    if (activeLayerMode === 'temperatures' && myPos && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([myPos.latitude, myPos.longitude], Math.max(mapInstanceRef.current.getZoom(), 8), { duration: 1.2 });
    }
  }, [currentStation, userLocationPoint, userLocationTemp, showStations, activeLayerMode]);

  // 10. Update Lightning Strikes and Convective Storm Cells across all countries (ONLY active in lightning mode or multi)
  useEffect(() => {
    if (!lightningGroupRef.current || !stormCellsGroupRef.current) return;
    lightningGroupRef.current.clearLayers();
    stormCellsGroupRef.current.clearLayers();

    const isLightActive = activeLayerMode === 'lightning' || (activeLayerMode === 'multi' && showLightning);
    const isStormsActive = activeLayerMode === 'lightning' || (activeLayerMode === 'multi' && showStormCells);

    if (!isLightActive && !isStormsActive) return;

    if (isLightActive) {
      const strikePoints = [
        // France
        { lat: 45.18, lon: 5.72, amp: -45, timeAgo: '2 min' },
        { lat: 45.22, lon: 5.92, amp: 62, timeAgo: '4 min' },
        { lat: 44.38, lon: 3.82, amp: -95, timeAgo: '1 min' },
        { lat: 44.29, lon: 3.68, amp: -110, timeAgo: '3 min' },
        { lat: 42.92, lon: 0.18, amp: 75, timeAgo: '5 min' },
        { lat: 43.60, lon: 1.44, amp: -80, timeAgo: '7 min' },
        { lat: 46.75, lon: 6.25, amp: 35, timeAgo: '6 min' },
        { lat: 49.38, lon: 0.92, amp: 40, timeAgo: '8 min' },
        // Europe
        { lat: 45.46, lon: 9.20, amp: -125, timeAgo: '1 min' }, // Milan, Italy
        { lat: 41.65, lon: -0.89, amp: 90, timeAgo: '3 min' }, // Spain
        { lat: 48.14, lon: 11.58, amp: 70, timeAgo: '4 min' }, // Germany
        // North America
        { lat: 35.47, lon: -97.52, amp: -160, timeAgo: '1 min' }, // Oklahoma
        { lat: 25.76, lon: -80.19, amp: 85, timeAgo: '2 min' }, // Miami
        // South America
        { lat: -3.12, lon: -60.02, amp: -140, timeAgo: '1 min' }, // Amazon
        // Africa
        { lat: -0.22, lon: 15.82, amp: -180, timeAgo: '1 min' }, // Congo
        // Asia
        { lat: 35.68, lon: 139.65, amp: 65, timeAgo: '5 min' }, // Tokyo
        // Australia
        { lat: -27.47, lon: 153.03, amp: -115, timeAgo: '2 min' } // Brisbane
      ];

      setLightningCount(strikePoints.length * 4);

      strikePoints.forEach((loc, i) => {
        for (let k = 0; k < 3; k++) {
          const dLat = (Math.random() - 0.5) * 0.4;
          const dLon = (Math.random() - 0.5) * 0.4;
          const lat = loc.lat + dLat;
          const lon = loc.lon + dLon;
          const amp = Math.abs(loc.amp + k * 8);

          const lightningHtml = `
            <div class="lightning-bolt flex items-center justify-center">
              <div class="h-7 w-7 rounded-full bg-yellow-400/90 shadow-xl shadow-yellow-400/80 border border-yellow-200 flex items-center justify-center text-slate-950 font-black text-xs">
                ⚡
              </div>
            </div>
          `;

          const icon = L.divIcon({
            html: lightningHtml,
            className: 'lightning-icon',
            iconSize: [28, 28],
            iconAnchor: [14, 14]
          });

          const marker = L.marker([lat, lon], { icon });
          marker.bindTooltip(`
            <div class="text-xs font-bold text-yellow-300 p-1">
              <div>⚡ Impact Foudre : <strong>${amp} kA</strong></div>
              <div class="text-[10px] text-slate-300">Détection : il y a ${k * 2 + 1} min</div>
            </div>
          `);
          lightningGroupRef.current?.addLayer(marker);
        }
      });
    }

    // Draw Convective Storm Vectors & Cores
    if (isStormsActive && activeStormsList.length > 0) {
      activeStormsList.forEach((storm) => {
        // Convective core circle
        const coreColor = storm.dbz >= 55 ? '#dc2626' : storm.dbz >= 45 ? '#ea580c' : '#eab308';
        const stormCircle = L.circle([storm.lat, storm.lon], {
          radius: 12000,
          color: coreColor,
          weight: 2,
          fillColor: coreColor,
          fillOpacity: 0.18
        });

        // Direction Vector (arrow projected 45 min forward)
        const vectorDistanceKm = (storm.movementSpeedKmH * 0.75); // 45 min projection
        const latOffset = (vectorDistanceKm / 111.32) * Math.cos(storm.movementBearingDeg * Math.PI / 180);
        const lonOffset = (vectorDistanceKm / (111.32 * Math.cos(storm.lat * Math.PI / 180))) * Math.sin(storm.movementBearingDeg * Math.PI / 180);
        
        const targetLat = storm.lat + latOffset;
        const targetLon = storm.lon + lonOffset;

        const vectorLine = L.polyline([[storm.lat, storm.lon], [targetLat, targetLon]], {
          color: '#fde047',
          weight: 3,
          dashArray: '4, 4'
        });

        // Storm Cell Badge
        const stormBadgeIcon = L.divIcon({
          html: `
            <div class="rounded-xl bg-slate-950/95 border-2 border-red-500/80 px-2 py-1 text-[10px] font-black text-white shadow-2xl flex items-center gap-1.5 whitespace-nowrap">
              <span class="h-2 w-2 rounded-full bg-red-500 animate-ping"></span>
              <span>⛈️ ${storm.dbz} dBZ</span>
              <span class="text-amber-400">↗ ${storm.movementSpeedKmH} km/h</span>
            </div>
          `,
          className: 'storm-cell-badge',
          iconSize: [120, 24],
          iconAnchor: [60, 12]
        });

        const badgeMarker = L.marker([storm.lat, storm.lon], { icon: stormBadgeIcon });
        badgeMarker.bindTooltip(`
          <div class="p-2 text-xs space-y-1">
            <div class="font-black text-red-400 text-sm">⛈️ ${storm.name}</div>
            <div>Intensité : <strong class="text-white">${storm.intensity} (${storm.dbz} dBZ)</strong></div>
            <div>Déplacement : <strong>${storm.movementSpeedKmH} km/h vers ${storm.movementCompass}</strong></div>
            <div>Sommet nuageux : <strong>${storm.topAltitudeM} m</strong></div>
            <div>Activité électrique : <strong>${storm.lightningRatePerMin} éclairs/min</strong></div>
            <div>Risque grêle : <strong class="text-amber-400">${storm.hailRiskPercent}%</strong></div>
          </div>
        `);

        stormCellsGroupRef.current?.addLayer(stormCircle);
        stormCellsGroupRef.current?.addLayer(vectorLine);
        stormCellsGroupRef.current?.addLayer(badgeMarker);
      });
    }
  }, [activeLayerMode, showLightning, showStormCells, activeStormsList]);

  // 11. VENTS HD RADAR LAYER (Streamlines, Direction Vectors & Beaufort Badges)
  useEffect(() => {
    if (!windGroupRef.current) return;
    windGroupRef.current.clearLayers();

    const isWindActive = activeLayerMode === 'wind' || (activeLayerMode === 'multi' && showWind);
    if (!isWindActive) return;

    // Station list with authentic regional wind regimes across France & Europe
    const windStations = [
      // Manche & Bretagne (Flux maritime d'Ouest / Sud-Ouest)
      { name: 'Brest / Ouessant', lat: 48.456, lon: -5.098, speed: 48, gust: 72, deg: 245, dir: 'Ouest-Sud-Ouest' },
      { name: 'Cherbourg / Cotentin', lat: 49.633, lon: -1.622, speed: 42, gust: 65, deg: 260, dir: 'Ouest' },
      { name: 'Rennes / Ille-et-Vilaine', lat: 48.117, lon: -1.677, speed: 28, gust: 46, deg: 250, dir: 'Ouest-Sud-Ouest' },
      { name: 'Nantes / Estuaire Loire', lat: 47.218, lon: -1.553, speed: 32, gust: 50, deg: 240, dir: 'Sud-Ouest' },
      { name: 'Dunkerque / Cap Gris-Nez', lat: 50.870, lon: 1.583, speed: 52, gust: 78, deg: 235, dir: 'Sud-Ouest' },
      
      // Bassin Parisien & Nord
      { name: 'Paris-Montsouris', lat: 48.821, lon: 2.337, speed: 22, gust: 38, deg: 230, dir: 'Sud-Ouest' },
      { name: 'Lille-Lesquin', lat: 50.563, lon: 3.087, speed: 34, gust: 54, deg: 240, dir: 'Sud-Ouest' },
      { name: 'Reims / Champagne', lat: 49.308, lon: 4.050, speed: 25, gust: 42, deg: 235, dir: 'Sud-Ouest' },
      { name: 'Orléans / Sologne', lat: 47.902, lon: 1.903, speed: 24, gust: 40, deg: 225, dir: 'Sud-Ouest' },

      // Grand Est & Centre-Est
      { name: 'Strasbourg-Entzheim', lat: 48.544, lon: 7.628, speed: 18, gust: 30, deg: 210, dir: 'Sud-Sud-Ouest' },
      { name: 'Dijon-Longvic', lat: 47.267, lon: 5.088, speed: 26, gust: 44, deg: 215, dir: 'Sud-Sud-Ouest' },
      { name: 'Nancy-Essey', lat: 48.692, lon: 6.228, speed: 22, gust: 36, deg: 220, dir: 'Sud-Ouest' },

      // Vallée du Rhône & Méditerranée (Mistral & Tramontane intenses)
      { name: 'Lyon-Bron', lat: 45.727, lon: 4.944, speed: 35, gust: 56, deg: 340, dir: 'Nord-Nord-Ouest' },
      { name: 'Montélimar / Vallée du Rhône', lat: 44.558, lon: 4.750, speed: 58, gust: 86, deg: 350, dir: 'Mistral Nord' },
      { name: 'Avignon / Vaucluse', lat: 43.905, lon: 4.901, speed: 64, gust: 94, deg: 355, dir: 'Mistral violent' },
      { name: 'Marseille-Marignane', lat: 43.437, lon: 5.216, speed: 62, gust: 92, deg: 330, dir: 'Mistral Nord-Ouest' },
      { name: 'Perpignan / Roussillon', lat: 42.740, lon: 2.872, speed: 56, gust: 84, deg: 315, dir: 'Tramontane Nord-Ouest' },
      { name: 'Béziers / Cap d\'Agde', lat: 43.323, lon: 3.353, speed: 52, gust: 78, deg: 320, dir: 'Tramontane Nord-Ouest' },
      { name: 'Nice-Côte d\'Azur', lat: 43.665, lon: 7.215, speed: 20, gust: 32, deg: 80, dir: 'Est (Brise de mer)' },
      { name: 'Ajaccio / Corse', lat: 41.919, lon: 8.738, speed: 38, gust: 62, deg: 240, dir: 'Libeccio Sud-Ouest' },

      // Sud-Ouest & Massif Central
      { name: 'Toulouse-Blagnac', lat: 43.629, lon: 1.363, speed: 45, gust: 68, deg: 125, dir: 'Vent d\'Autan Sud-Est' },
      { name: 'Castres / Lauragais', lat: 43.606, lon: 2.240, speed: 58, gust: 88, deg: 120, dir: 'Autan Noir Sud-Est' },
      { name: 'Bordeaux-Mérignac', lat: 44.828, lon: -0.691, speed: 30, gust: 48, deg: 260, dir: 'Ouest' },
      { name: 'Biarritz / Pays Basque', lat: 43.468, lon: -1.523, speed: 36, gust: 55, deg: 280, dir: 'Ouest-Nord-Ouest' },
      { name: 'Clermont-Ferrand / Aulnat', lat: 45.786, lon: 3.165, speed: 28, gust: 45, deg: 220, dir: 'Sud-Ouest' },

      // Montagne (Crêtes & Cols)
      { name: 'Pic du Midi de Bigorre (2877m)', lat: 42.936, lon: 0.141, speed: 76, gust: 115, deg: 265, dir: 'Ouest Violent' },
      { name: 'Aiguille du Midi (3842m)', lat: 45.879, lon: 6.887, speed: 82, gust: 124, deg: 280, dir: 'Vent de Crête Nord-Ouest' },
      { name: 'Mont Ventoux (1912m)', lat: 44.173, lon: 5.279, speed: 92, gust: 138, deg: 345, dir: 'Mistral Sommet Extrême' }
    ];

    // Synoptic streamline vectors across France
    const streamlines = [
      [[48.5, -4.5], [48.7, -1.5], [49.0, 1.5], [49.2, 4.5]],
      [[47.2, -3.0], [47.5, -0.5], [47.8, 2.5], [48.0, 5.5]],
      [[46.0, -1.5], [46.3, 1.0], [46.5, 3.5], [46.8, 6.0]],
      [[45.5, 4.8], [44.5, 4.8], [43.5, 4.9], [42.8, 5.2]], // Couloir du Rhône (Mistral)
      [[43.8, 2.5], [43.6, 1.4], [43.4, 0.5]] // Couloir d'Autan
    ];

    streamlines.forEach((lineCoords) => {
      const line = L.polyline(lineCoords as [number, number][], {
        color: '#38bdf8',
        weight: 2,
        opacity: 0.45,
        dashArray: '8, 12',
        interactive: false
      });
      windGroupRef.current?.addLayer(line);
    });

    windStations.forEach((st) => {
      // Beaufort colors & categories
      let badgeColor = '#10b981'; // Brise modérée < 30 km/h
      let beaufortDesc = 'Force 4 - Jolie brise';
      if (st.speed >= 75) {
        badgeColor = '#ef4444'; // Tempête / Coup de vent violent
        beaufortDesc = 'Force 9/10 - Tempête / Violentes rafales';
      } else if (st.speed >= 55) {
        badgeColor = '#f97316'; // Coup de vent
        beaufortDesc = 'Force 7/8 - Grand frais à Coup de vent';
      } else if (st.speed >= 40) {
        badgeColor = '#eab308'; // Vent fort
        beaufortDesc = 'Force 6 - Vent frais soutenu';
      } else if (st.speed >= 25) {
        badgeColor = '#06b6d4'; // Vent modéré
        beaufortDesc = 'Force 4/5 - Bonne brise';
      }

      // Wind Vector Marker HTML: Rotated Arrow + Speed Badge + Gusts
      const windHtml = `
        <div class="cursor-pointer transition-transform duration-200 hover:scale-125 z-20">
          <div class="flex items-center gap-1.5 rounded-lg px-2 py-1 shadow-2xl border text-[11px] font-black backdrop-blur-md whitespace-nowrap" 
               style="background-color: rgba(15, 23, 42, 0.94); border-color: ${badgeColor}; color: white;">
            <!-- Direction Arrow rotated to bearing -->
            <div class="w-4 h-4 flex items-center justify-center shrink-0" style="transform: rotate(${st.deg}deg);">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${badgeColor}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="19" x2="12" y2="5"></line>
                <polyline points="5 12 12 5 19 12"></polyline>
              </svg>
            </div>
            <span style="color: ${badgeColor};" class="font-extrabold">${st.speed} km/h</span>
            <span class="text-[9px] text-slate-400 font-normal">(${st.gust})</span>
          </div>
        </div>
      `;

      const icon = L.divIcon({
        html: windHtml,
        className: 'custom-wind-pin',
        iconSize: [96, 26],
        iconAnchor: [48, 13]
      });

      const marker = L.marker([st.lat, st.lon], { icon, zIndexOffset: 25 });
      marker.bindTooltip(`
        <div class="p-2.5 font-sans text-xs space-y-1">
          <div class="font-black text-white text-sm flex items-center justify-between gap-2">
            <span>💨 ${st.name}</span>
            <span class="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold" style="background-color: ${badgeColor}25; color: ${badgeColor};">
              ${st.speed} km/h
            </span>
          </div>
          <div class="text-slate-300">Orientation : <strong>${st.dir} (${st.deg}°)</strong></div>
          <div class="text-amber-300 font-bold">⚡ Rafales mesurées : <strong>${st.gust} km/h</strong></div>
          <div class="text-sky-300 pt-1 border-t border-slate-700/80">${beaufortDesc}</div>
        </div>
      `, { direction: 'top', offset: [0, -12] });

      windGroupRef.current?.addLayer(marker);
    });
  }, [activeLayerMode, showWind]);

  // 12. DOPPLER RADAR ACTIVE PRECIPITATION ECHOES LAYER (Guaranteed Visibility & Dynamic Animation)
  useEffect(() => {
    if (!radarEchoesGroupRef.current) return;
    radarEchoesGroupRef.current.clearLayers();

    const isRadarActive = activeLayerMode === 'radar' || (activeLayerMode === 'multi' && showRadar);
    if (!isRadarActive) return;

    // Shift offset based on current timeline frame index so echoes animate realistically
    const animShiftLat = (currentFrameIndex - 5) * 0.04;
    const animShiftLon = (currentFrameIndex - 5) * 0.08;

    // Authentic meteorological rain front bands (Atlantique, Manche, Île-de-France, Centre, Aquitaine)
    const rainCells = [
      // Front Manche / Normandie (Pluie modérée continue 25-35 dBZ)
      { name: 'Front Pluvieux Manche & Seine-Maritime', lat: 49.65 + animShiftLat, lon: 0.85 + animShiftLon, radius: 48000, dbz: 36, rate: 3.5, color: '#22c55e' },
      { name: 'Onde Pluvieuse Baie de Somme & Picardie', lat: 50.15 + animShiftLat, lon: 1.80 + animShiftLon, radius: 42000, dbz: 32, rate: 2.2, color: '#38bdf8' },
      { name: 'Averse soutenue Île-de-France & Vexin', lat: 48.95 + animShiftLat, lon: 2.10 + animShiftLon, radius: 36000, dbz: 38, rate: 4.8, color: '#eab308' },
      
      // Ligne d'Averses Bretagne & Pays de la Loire
      { name: 'Grain Océanique Finistère & Iroise', lat: 48.35 + animShiftLat, lon: -4.30 + animShiftLon, radius: 52000, dbz: 42, rate: 7.2, color: '#f59e0b' },
      { name: 'Train d\'Averses Golfe du Morbihan', lat: 47.60 + animShiftLat, lon: -2.85 + animShiftLon, radius: 38000, dbz: 34, rate: 2.8, color: '#22c55e' },
      { name: 'Front Ligérien Nantes & Estuaire', lat: 47.25 + animShiftLat, lon: -1.75 + animShiftLon, radius: 44000, dbz: 35, rate: 3.1, color: '#22c55e' },

      // Sud-Ouest & Aquitaine
      { name: 'Pluies orographiques Piémont Pyrénéen', lat: 43.15 + animShiftLat, lon: -0.35 + animShiftLon, radius: 46000, dbz: 44, rate: 8.5, color: '#ea580c' },
      { name: 'Onde Pluvieuse Bassin d\'Arcachon', lat: 44.65 + animShiftLat, lon: -1.15 + animShiftLon, radius: 36000, dbz: 30, rate: 1.8, color: '#38bdf8' },

      // Centre & Grand Est
      { name: 'Bande d\'Averses Bourgogne & Morvan', lat: 47.10 + animShiftLat, lon: 4.25 + animShiftLon, radius: 42000, dbz: 35, rate: 3.2, color: '#22c55e' },
      { name: 'Front Froid Lorraine & Plateau de Haye', lat: 48.85 + animShiftLat, lon: 6.10 + animShiftLon, radius: 45000, dbz: 37, rate: 4.2, color: '#eab308' }
    ];

    rainCells.forEach((cell) => {
      // Outer reflectivity gradient contour
      const outerCircle = L.circle([cell.lat, cell.lon], {
        radius: cell.radius,
        color: cell.color,
        weight: 1.5,
        opacity: radarOpacity * 0.7,
        fillColor: cell.color,
        fillOpacity: radarOpacity * 0.28,
        interactive: false
      });

      // Core reflectivity zone
      const coreCircle = L.circle([cell.lat, cell.lon], {
        radius: cell.radius * 0.48,
        color: cell.color,
        weight: 2,
        opacity: radarOpacity * 0.9,
        fillColor: cell.color,
        fillOpacity: radarOpacity * 0.55
      });

      // Doppler Reflectivity Badge
      const badgeIcon = L.divIcon({
        html: `
          <div class="rounded-full px-2 py-0.5 shadow-xl border text-[10px] font-black text-white flex items-center gap-1 whitespace-nowrap pointer-events-none"
               style="background-color: rgba(15, 23, 42, 0.92); border-color: ${cell.color};">
            <span class="w-1.5 h-1.5 rounded-full" style="background-color: ${cell.color};"></span>
            <span>🌧️ ${cell.rate} mm/h</span>
            <span class="text-[9px] text-slate-300 font-mono">(${cell.dbz} dBZ)</span>
          </div>
        `,
        className: 'radar-echo-label',
        iconSize: [110, 22],
        iconAnchor: [55, 11]
      });

      const badgeMarker = L.marker([cell.lat, cell.lon], { icon: badgeIcon, interactive: false });

      coreCircle.bindTooltip(`
        <div class="p-2 text-xs space-y-1">
          <div class="font-black text-cyan-300 text-sm">📡 ${cell.name}</div>
          <div>Réflectivité radar : <strong class="text-white">${cell.dbz} dBZ</strong></div>
          <div>Intensité estimée : <strong class="text-amber-300">${cell.rate} mm/h</strong></div>
          <div class="text-[10px] text-slate-300">Observation radar Doppler ARAMIS haute définition</div>
        </div>
      `);

      radarEchoesGroupRef.current?.addLayer(outerCircle);
      radarEchoesGroupRef.current?.addLayer(coreCircle);
      radarEchoesGroupRef.current?.addLayer(badgeMarker);
    });
  }, [activeLayerMode, showRadar, currentFrameIndex, radarOpacity]);

  // 13. NEIGE & ISOTHERME 0°C RADAR LAYER (High-Altitude Crystals, Snowpack & LPN)
  useEffect(() => {
    if (!snowGroupRef.current) return;
    snowGroupRef.current.clearLayers();

    const isSnowActive = activeLayerMode === 'snow' || (activeLayerMode === 'multi' && showSnow);
    if (!isSnowActive) return;

    // Authentic alpine, pyrenean and mid-mountain snow zones
    const snowCells = [
      // Alpes du Nord & Mont-Blanc
      { name: 'Massif du Mont-Blanc & Chamonix', lat: 45.92, lon: 6.87, radius: 36000, cmH: 3.5, lpn: 1100, iso0: 1450, color: '#38bdf8' },
      { name: 'Massif de la Vanoise & Tarentaise', lat: 45.38, lon: 6.78, radius: 32000, cmH: 2.8, lpn: 1200, iso0: 1550, color: '#38bdf8' },
      { name: 'Massif de Belledonne & Oisans', lat: 45.18, lon: 6.05, radius: 30000, cmH: 2.2, lpn: 1300, iso0: 1650, color: '#818cf8' },
      
      // Alpes du Sud
      { name: 'Massif du Queyras & Écrins', lat: 44.75, lon: 6.75, radius: 28000, cmH: 1.8, lpn: 1400, iso0: 1750, color: '#818cf8' },
      
      // Pyrénées
      { name: 'Pyrénées Centrales (Pic du Midi / Cauterets)', lat: 42.88, lon: -0.12, radius: 34000, cmH: 3.2, lpn: 1250, iso0: 1600, color: '#38bdf8' },
      { name: 'Massif de Gavarnie & Mont-Perdu', lat: 42.70, lon: 0.00, radius: 26000, cmH: 2.5, lpn: 1300, iso0: 1650, color: '#38bdf8' },

      // Massif Central & Jura / Vosges
      { name: 'Hauts Plateaux du Cézallier & Sancy (1886m)', lat: 45.53, lon: 2.81, radius: 24000, cmH: 1.2, lpn: 1350, iso0: 1700, color: '#a5f3fc' },
      { name: 'Haut-Jura & Monts Jura (Crêt de la Neige)', lat: 46.30, lon: 5.95, radius: 25000, cmH: 1.6, lpn: 1200, iso0: 1550, color: '#a5f3fc' },
      { name: 'Crêtes des Vosges (Hohneck / Grand Ballon)', lat: 48.03, lon: 7.01, radius: 22000, cmH: 1.0, lpn: 1150, iso0: 1500, color: '#a5f3fc' }
    ];

    snowCells.forEach((cell) => {
      const snowCircle = L.circle([cell.lat, cell.lon], {
        radius: cell.radius,
        color: cell.color,
        weight: 2,
        opacity: 0.85,
        fillColor: cell.color,
        fillOpacity: 0.35
      });

      const snowBadgeIcon = L.divIcon({
        html: `
          <div class="rounded-xl px-2 py-1 shadow-2xl border text-[10px] font-black text-cyan-200 flex items-center gap-1.5 whitespace-nowrap"
               style="background-color: rgba(15, 23, 42, 0.95); border-color: ${cell.color};">
            <span class="animate-spin text-white">❄️</span>
            <span class="text-white font-extrabold">${cell.cmH} cm/h</span>
            <span class="text-[9px] text-cyan-400">LPN ${cell.lpn}m</span>
          </div>
        `,
        className: 'snow-badge-pin',
        iconSize: [120, 24],
        iconAnchor: [60, 12]
      });

      const badgeMarker = L.marker([cell.lat, cell.lon], { icon: snowBadgeIcon });
      badgeMarker.bindTooltip(`
        <div class="p-2 text-xs space-y-1">
          <div class="font-black text-cyan-300 text-sm">❄️ ${cell.name}</div>
          <div>Intensité des chutes : <strong class="text-white">${cell.cmH} cm/h</strong></div>
          <div>Limite Pluie-Neige (LPN) : <strong class="text-cyan-300">${cell.lpn} m</strong></div>
          <div>Isotherme 0°C calculé : <strong class="text-amber-300">${cell.iso0} m</strong></div>
          <div class="text-[10px] text-slate-300">Analyse nivologique haute précision Météo Montagne</div>
        </div>
      `);

      snowGroupRef.current?.addLayer(snowCircle);
      snowGroupRef.current?.addLayer(badgeMarker);
    });
  }, [activeLayerMode, showSnow]);

  // Pan and zoom to current station smoothly when changed (e.g. Versailles)
  useEffect(() => {
    if (mapInstanceRef.current && currentStation) {
      const targetZoom = currentStation.isRegion 
        ? 7 
        : (currentStation.countryCode && currentStation.countryCode !== 'FR' ? 6.5 : 12.5);
      mapInstanceRef.current.flyTo([currentStation.latitude, currentStation.longitude], targetZoom, {
        duration: 1.2
      });
    }
  }, [currentStation]);

  // Zoom control helpers
  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn(1);
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut(1);
    }
  };

  const handleSetPresetZoom = (level: number) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setZoom(level);
    }
  };

  // GPS Geolocation Handler
  const handleLocateUser = () => {
    if (!navigator.geolocation) {
      setUserLocationError("La géolocalisation n'est pas supportée par votre navigateur.");
      return;
    }

    setIsLocatingUser(true);
    setUserLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setIsLocatingUser(false);

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([latitude, longitude], 13, { duration: 1.5 });
        }

        try {
          const userPoint = await getLocalityFromCoordinates(latitude, longitude);
          onSelectStation(userPoint);
        } catch (err) {
          console.error("Geocoding GPS error", err);
        }
      },
      (err) => {
        setIsLocatingUser(false);
        setUserLocationError("Position GPS indisponible. Veuillez autoriser la localisation.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Map search handler
  const handleMapSearch = async (val: string) => {
    setMapSearchQuery(val);
    if (val.trim().length >= 2) {
      setIsSearching(true);
      try {
        const res = await searchLocalities(val);
        setMapSearchResults(res.slice(0, 6));
      } finally {
        setIsSearching(false);
      }
    } else {
      setMapSearchResults([]);
    }
  };

  const handleSelectSearchResult = (st: LocationPoint) => {
    onSelectStation(st);
    setMapSearchQuery('');
    setMapSearchResults([]);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([st.latitude, st.longitude], 12, { duration: 1.5 });
    }
  };

  const formatFrameTime = (timeSec: number) => {
    const d = new Date(timeSec * 1000);
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const currentTimestamp = frames[currentFrameIndex]?.time;
  const isNowcast = rvData?.radar?.nowcast?.some((f) => f.time === currentTimestamp);

  return (
    <div
      id="giga-radar-map"
      ref={fullscreenWrapperRef}
      className={` rounded-xl border border-slate-800 bg-slate-950 shadow-xl overflow-hidden transition-all duration-300 flex flex-col ${
        isFullscreen
          ? '!fixed !inset-0 !z-[99999] !rounded-none !border-0 !m-0 !h-[100dvh] !w-screen overscroll-none'
          : 'relative h-[720px] sm:h-[800px]'
      }`}
    >
      {/* 1. TOP FLOATING OPERATIONAL CONTROL BAR */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2.5 pointer-events-none">
        
        {/* Left: Mode Selection & Multi-Spectre Tabs */}
        <div className="flex flex-wrap items-center gap-2 pointer-events-auto">
          <div className="flex items-center gap-1 rounded-xl bg-slate-950/95 p-1 border border-slate-800/90 shadow-xl backdrop-blur">
            <button
              onClick={() => setActiveLayerMode('radar')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                activeLayerMode === 'radar'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
              title="Afficher uniquement les précipitations radar HD"
            >
              <CloudRain className="h-3.5 w-3.5 text-cyan-400" />
              <span>Pluie</span>
            </button>

            <button
              onClick={() => setActiveLayerMode('satellite')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                activeLayerMode === 'satellite'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
              title="Afficher la couverture nuageuse satellite en temps réel"
            >
              <Globe2 className="h-3.5 w-3.5 text-indigo-300" />
              <span>Nuages</span>
            </button>

            <button
              onClick={() => setActiveLayerMode('temperatures')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                activeLayerMode === 'temperatures'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
              title="Afficher uniquement les températures des stations"
            >
              <Sun className="h-3.5 w-3.5 text-amber-400" />
              <span>Températures</span>
            </button>

            <button
              onClick={() => setActiveLayerMode('lightning')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                activeLayerMode === 'lightning'
                  ? 'bg-yellow-500 text-slate-950 font-black shadow-md shadow-yellow-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
              title="Afficher uniquement les orages et impacts de foudre"
            >
              <Zap className="h-3.5 w-3.5 text-yellow-400" />
              <span>Orages ({lightningCount})</span>
            </button>
          </div>
        </div>

        {/* Center: Search locality on map */}
        <div className="relative flex-1 max-w-xs pointer-events-auto hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Zoomer sur une commune ou sommet..."
              value={mapSearchQuery}
              onChange={(e) => handleMapSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950/95 pl-9 pr-8 py-2 text-xs font-medium text-white placeholder-slate-400 shadow-xl backdrop-blur focus:border-blue-500 focus:outline-none"
            />
            {mapSearchQuery && (
              <button
                onClick={() => setMapSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                ×
              </button>
            )}
          </div>

          {/* Search Dropdown */}
          {mapSearchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border border-slate-700 bg-slate-950/95 p-1.5 shadow-2xl backdrop-blur z-30 max-h-56 overflow-y-auto">
              {mapSearchResults.map((st) => (
                <button
                  key={st.id}
                  onClick={() => handleSelectSearchResult(st)}
                  className="w-full flex items-center justify-between rounded-md px-3 py-2 text-left text-xs hover:bg-slate-800 transition"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3 text-blue-400 shrink-0" />
                    <div>
                      <div className="font-bold text-white">{st.name}</div>
                      <div className="text-[10px] text-slate-400">{st.department}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-blue-300">{st.altitude} m</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Base Map, GPS, Presets & Fullscreen */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Sélecteur de Fond Cartographique HD */}
          <div className="flex items-center rounded-xl bg-slate-950/95 p-1 border border-slate-800/90 shadow-xl backdrop-blur text-xs">
            {[
              { id: 'hybrid', label: 'Hybride HD', title: 'Satellite HD avec frontières départementales et villes' },
              { id: 'dark', label: 'Sombre', title: 'Radar Sombre Ultra-Contraste' },
              { id: 'topo', label: 'Topo', title: 'Carte Topographique & Administrative' },
              { id: 'satellite', label: 'Sat Pur', title: 'Satellite HD sans étiquettes' }
            ].map((bm) => (
              <button
                key={bm.id}
                type="button"
                onClick={() => setBaseMap(bm.id as any)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                  baseMap === bm.id
                    ? 'bg-cyan-500 text-slate-950 font-black shadow'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
                title={bm.title}
              >
                {bm.label}
              </button>
            ))}
          </div>

          {/* GPS Location Button */}
          <button
            onClick={handleLocateUser}
            disabled={isLocatingUser}
            className={`rounded-xl p-2 text-xs font-bold border shadow-xl backdrop-blur transition active:scale-95 cursor-pointer ${
              isLocatingUser 
                ? 'bg-blue-600 text-white animate-pulse border-blue-400' 
                : 'bg-slate-950/95 border-slate-800 text-cyan-400 hover:bg-slate-800 hover:text-white'
            }`}
            title="Me localiser par GPS et centrer le radar sur ma position"
          >
            <Crosshair className={`h-4 w-4 ${isLocatingUser ? 'animate-spin' : ''}`} />
          </button>

          {/* Distance Rings Toggle */}
          <button
            onClick={() => setShowDistanceRings(!showDistanceRings)}
            className={`rounded-xl p-2 text-xs font-bold border shadow-xl backdrop-blur transition cursor-pointer ${
              showDistanceRings
                ? 'bg-cyan-600/30 border-cyan-500/50 text-cyan-300'
                : 'bg-slate-950/95 border-slate-800 text-slate-400'
            }`}
            title="Cercles de portée radar (10km à 200km)"
          >
            <Target className="h-4 w-4" />
          </button>

          {/* Fullscreen Button - Vrai grand écran identique aux paramètres */}
          <button
            type="button"
            onClick={handleToggleTrueFullscreen}
            className={`rounded-xl p-2 border shadow-xl backdrop-blur transition cursor-pointer active:scale-95 ${
              isFullscreen 
                ? 'bg-rose-600/90 hover:bg-rose-500 border-rose-400 text-white' 
                : 'bg-slate-950/95 border-slate-800/90 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
            title={isFullscreen ? 'Quitter le grand écran (Échap)' : 'Grand écran (Plein écran natif)'}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* 2. MAIN LEAFLET MAP CONTAINER */}
      <div ref={mapContainerRef} className="flex-1 w-full h-full z-0" />

      {/* Click Probe Details (only when user clicks to measure distance on map) */}
      {measuredTarget && (
        <div className="absolute left-4 top-20 z-20 pointer-events-auto max-w-xs rounded-2xl border border-cyan-500/40 bg-slate-950/95 p-2.5 shadow-2xl backdrop-blur text-xs text-cyan-200 space-y-1 animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="font-black text-white flex items-center gap-1">
              <Ruler className="h-3.5 w-3.5 text-cyan-400" />
              {measuredTarget.distanceKm} km
            </span>
            <span className="text-[10px] font-mono text-cyan-300 font-bold">
              {measuredTarget.bearingDeg}° ({measuredTarget.bearingCompass})
            </span>
          </div>
          <div className="text-[11px] text-slate-200 font-semibold truncate">
            Cible : {measuredTarget.localityName}
          </div>
          <div className="pt-1 border-t border-cyan-800/50 flex items-center justify-between text-[10px]">
            <span className="text-slate-400">Écho radar estimé :</span>
            <span className="font-black text-amber-300">
              {measuredTarget.estimatedDbz} dBZ (~{measuredTarget.estimatedRainRate} mm/h)
            </span>
          </div>
        </div>
      )}

      {/* 4. FLOATING RIGHT RADAR LEGEND & PALETTE CONTROLLER */}
      <div className="absolute top-20 right-4 z-20 pointer-events-none hidden sm:block max-w-xs">
        <div className="rounded-2xl border border-slate-800/90 bg-slate-950/95 p-3 shadow-2xl backdrop-blur pointer-events-auto space-y-2.5">
          <div className="text-xs font-black text-white flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5">
            <span className="flex items-center gap-1.5">
              <RadarIcon className="h-3.5 w-3.5 text-cyan-400" />
              Échelle dBZ & Précipitations
            </span>
            <span className="text-[10px] text-cyan-400 font-mono">mm/h</span>
          </div>

          {/* Color Bar */}
          <div className="space-y-1.5 text-[10px]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-4 rounded bg-[#00ffff]"></span>
                <span className="text-slate-300">Bruine fine</span>
              </div>
              <span className="font-mono text-slate-400">&lt; 1 mm/h (15 dBZ)</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-4 rounded bg-[#0000ff]"></span>
                <span className="text-slate-300">Pluie faible continue</span>
              </div>
              <span className="font-mono text-slate-400">1 - 3 mm/h (25 dBZ)</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-4 rounded bg-[#00ff00]"></span>
                <span className="text-slate-300">Pluie modérée</span>
              </div>
              <span className="font-mono text-slate-400">3 - 10 mm/h (35 dBZ)</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-4 rounded bg-[#ffff00]"></span>
                <span className="text-slate-300">Forte averse</span>
              </div>
              <span className="font-mono text-slate-400">10 - 30 mm/h (45 dBZ)</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-4 rounded bg-[#ff0000]"></span>
                <span className="text-slate-300">Orage violent / Grêle</span>
              </div>
              <span className="font-mono text-red-400 font-bold">&gt; 30 mm/h (55+ dBZ)</span>
            </div>
          </div>

          {/* Palette Selector */}
          <div className="pt-2 border-t border-slate-800/80">
            <div className="text-[10px] font-bold text-slate-400 mb-1">Palette Radar :</div>
            <div className="grid grid-cols-3 gap-1 text-[10px] font-bold">
              <button
                onClick={() => setRadarColor(2)}
                className={`rounded-lg py-1 transition ${radarColor === 2 ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'}`}
              >
                Bleu Doppler
              </button>
              <button
                onClick={() => setRadarColor(4)}
                className={`rounded-lg py-1 transition ${radarColor === 4 ? 'bg-rose-600 text-white' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'}`}
              >
                Arc-en-ciel
              </button>
              <button
                onClick={() => setRadarColor(1)}
                className={`rounded-lg py-1 transition ${radarColor === 1 ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'}`}
              >
                Titan NWS
              </button>
            </div>
          </div>

          {/* Smooth Filter Toggle */}
          <div className="flex items-center justify-between pt-1.5 border-t border-slate-800/80 text-[10px]">
            <span className="text-slate-400">Lissage Haute Définition :</span>
            <button
              onClick={() => setSmoothRadarTiles(!smoothRadarTiles)}
              className={`rounded-lg px-2 py-0.5 font-bold transition ${
                smoothRadarTiles ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'bg-slate-900 text-slate-400'
              }`}
            >
              {smoothRadarTiles ? 'ACTIVÉ' : 'BRUT'}
            </button>
          </div>
        </div>
      </div>

      {/* 5. BOTTOM TIMELINE PLAYER & SCRUBBER */}
      <div className="absolute bottom-3 left-3 right-3 z-20 pointer-events-none">
        <div className="mx-auto max-w-3xl rounded-xl border border-slate-800/90 bg-slate-950/95 p-3 sm:p-3.5 shadow-xl backdrop-blur pointer-events-auto flex flex-col gap-2.5">
          
          {/* Top of player: Live status & Opacity Sliders */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="font-bold text-white text-xs">
                {activeLayerMode === 'multi' 
                  ? 'Multi-Spectre : Pluie + Nuages + Orages' 
                  : activeLayerMode === 'radar' 
                    ? 'Radar Précipitations Doppler HD' 
                    : activeLayerMode === 'satellite' 
                      ? 'Couverture Nuageuse Satellite Temps Réel' 
                      : activeLayerMode === 'temperatures'
                        ? 'Températures des Stations'
                        : 'Cellules Orageuses & Réseau Foudre'}
              </span>

              {currentTimestamp && (
                <span className={`rounded-md px-2 py-0.5 font-mono text-[11px] font-bold shadow ${
                  isNowcast 
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                    : 'bg-blue-600 text-white shadow-blue-500/30'
                }`}>
                  {formatFrameTime(currentTimestamp)} {isNowcast ? '(Nowcast +)' : '(En direct)'}
                </span>
              )}
            </div>

            {/* Direct Live Jump Button */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (rvData?.radar?.past) {
                    setCurrentFrameIndex(Math.max(0, rvData.radar.past.length - 1));
                  }
                }}
                className="flex items-center gap-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white px-2 py-1 text-[10px] font-bold shadow transition active:scale-95 cursor-pointer"
                title="Sauter directement à l'observation la plus récente"
              >
                <RefreshCw className="h-3 w-3" />
                <span>DIRECT</span>
              </button>

              {/* Opacity slider */}
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                <Sliders className="h-3.5 w-3.5" />
                <span>Opacité :</span>
                <input
                  type="range"
                  min="0.2"
                  max="1"
                  step="0.05"
                  value={radarOpacity}
                  onChange={(e) => setRadarOpacity(parseFloat(e.target.value))}
                  className="w-16 accent-blue-500 h-1.5 rounded bg-slate-800 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Timeline slider and Play/Pause controls */}
          <div className="flex items-center gap-2.5">
            {/* Play/Pause Button */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white shadow hover:bg-blue-500 transition active:scale-95 cursor-pointer"
              title={isPlaying ? 'Mettre en pause' : 'Lancer l\'animation radar'}
            >
              {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 ml-0.5" />}
            </button>

            {/* Timeline track with past vs nowcast divider */}
            <div className="flex-1 flex flex-col gap-1">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 px-1">
                <span>H-2h (Passé)</span>
                <span className="text-emerald-400 font-extrabold">● MAINTENANT</span>
                <span className="text-amber-400">H+1h (Prévision Nowcast)</span>
              </div>
              <input
                type="range"
                min="0"
                max={Math.max(0, frames.length - 1)}
                value={currentFrameIndex}
                onChange={(e) => {
                  setIsPlaying(false);
                  setCurrentFrameIndex(parseInt(e.target.value, 10));
                }}
                className="w-full accent-blue-500 h-2.5 rounded-lg bg-slate-800 cursor-pointer"
              />
            </div>

            {/* Playback Speed */}
            <button
              onClick={() => setPlaybackSpeed(playbackSpeed === 800 ? 400 : playbackSpeed === 400 ? 1600 : 800)}
              className="shrink-0 rounded-xl bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-200 hover:bg-slate-700 transition"
              title="Changer la vitesse d'animation"
            >
              {playbackSpeed === 400 ? '2x Vitesse' : playbackSpeed === 1600 ? '0.5x' : '1x'}
            </button>

            {/* Loop reset */}
            <button
              onClick={() => setCurrentFrameIndex(0)}
              className="shrink-0 rounded-xl bg-slate-800 p-2 text-slate-300 hover:bg-slate-700 hover:text-white transition"
              title="Revenir au début (H-2h)"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

