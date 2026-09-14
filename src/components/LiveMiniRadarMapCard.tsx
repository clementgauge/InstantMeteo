import React, { useState, useEffect, useRef } from 'react';
import { Radio, Maximize2, Globe2, Layers, ZoomIn, ZoomOut, Play, Pause, MapPin } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LocationPoint } from '../types/weather';

interface LiveMiniRadarMapCardProps {
  station: LocationPoint;
  onClick?: () => void;
}

interface RainViewerFrame {
  time: number;
  path: string;
}

export const LiveMiniRadarMapCard: React.FC<LiveMiniRadarMapCardProps> = ({
  station,
  onClick
}) => {
  const isFrench = station.countryCode === 'FR' || station.isFrench || Boolean(station.department?.match(/\b(\d{2,3})\b/));
  const [viewMode, setViewMode] = useState<'world' | 'country' | 'local'>('country');
  const [mapEngine, setMapEngine] = useState<'topo' | 'satellite'>('topo');
  const [radarFrames, setRadarFrames] = useState<RainViewerFrame[]>([]);
  const [radarHost, setRadarHost] = useState<string>('https://tilecache.rainviewer.com');
  const [currentFrameIndex, setCurrentFrameIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isInteractive] = useState<boolean>(true);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const baseLayerRef = useRef<L.TileLayer | null>(null);
  const radarLayerRef = useRef<L.TileLayer | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const animationTimerRef = useRef<any>(null);

  // 1. Initialisation de la carte Leaflet avec la même API que Radar HD (Esri ArcGIS World Topo)
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initialLat = isFrench ? 46.6 : station.latitude;
    const initialLon = isFrench ? 2.4 : station.longitude;
    const initialZoom = 5;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLon],
      zoom: initialZoom,
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: isInteractive,
      dragging: isInteractive,
      touchZoom: isInteractive
    });

    // Même API que Radar HD (PrecisionRadarMap) : Esri ArcGIS World Topo
    const baseLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 19,
        maxNativeZoom: 18,
        attribution: 'Esri ArcGIS'
      }
    ).addTo(map);
    baseLayerRef.current = baseLayer;

    // Même repère Google Maps haute précision que Radar HD
    const googlePinHtml = `
      <div style="position: relative; width: 0; height: 0; pointer-events: none;">
        <div style="position: absolute; left: -14px; bottom: 0px; width: 28px; height: 36px; pointer-events: auto; filter: drop-shadow(0 2px 5px rgba(0,0,0,0.5)); cursor: pointer;">
          <svg viewBox="0 0 24 36" width="28" height="36" style="display: block;">
            <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 24 12 24s12-15 12-24c0-6.627-5.373-12-12-12z" fill="#ea4335" stroke="#ffffff" stroke-width="1.2"/>
            <circle cx="12" cy="12" r="4.5" fill="#ffffff"/>
            <circle cx="12" cy="12" r="2.2" fill="#ea4335"/>
          </svg>
        </div>
        <div style="position: absolute; left: 0px; bottom: 38px; transform: translateX(-50%); white-space: nowrap; pointer-events: auto;">
          <div style="background: rgba(15, 23, 42, 0.92); color: #ffffff; padding: 2px 7px; border-radius: 5px; font-size: 10px; font-weight: 800; border: 1px solid rgba(239, 68, 68, 0.6); box-shadow: 0 3px 10px rgba(0,0,0,0.4); display: flex; align-items: center; gap: 3px;">
            <span style="color: #ef4444;">📍</span>
            <span>${station.name}</span>
          </div>
        </div>
        <div style="position: absolute; left: -2px; top: -2px; width: 4px; height: 4px; border-radius: 50%; background: #ea4335; border: 1px solid #ffffff; pointer-events: none;"></div>
      </div>
    `;

    const pinIcon = L.divIcon({
      className: 'google-maps-radar-mini-pin',
      html: googlePinHtml,
      iconSize: [0, 0],
      iconAnchor: [0, 0]
    });

    const marker = L.marker([station.latitude, station.longitude], { icon: pinIcon }).addTo(map);
    markerRef.current = marker;

    mapInstanceRef.current = map;

    // Chargement de l'API RainViewer (exactement identique à Radar HD)
    fetch('https://api.rainviewer.com/public/weather-maps.json')
      .then(res => res.json())
      .then(data => {
        if (data && data.radar) {
          const host = data.host || 'https://tilecache.rainviewer.com';
          setRadarHost(host);

          const frames: RainViewerFrame[] = [
            ...(data.radar.past || []),
            ...(data.radar.nowcast || [])
          ];

          setRadarFrames(frames);

          if (frames.length > 0) {
            // Index de l'écho radar le plus récent observé
            const latestPastIndex = data.radar.past ? Math.max(0, data.radar.past.length - 1) : 0;
            setCurrentFrameIndex(latestPastIndex);

            const activeFrame = frames[latestPastIndex];
            const radarUrl = `${host}${activeFrame.path}/256/{z}/{x}/{y}/2/1_1.png`;

            const radarTileLayer = L.tileLayer(radarUrl, {
              opacity: 0.85,
              zIndex: 10,
              maxZoom: 19,
              maxNativeZoom: 18
            });

            if (mapInstanceRef.current) {
              radarTileLayer.addTo(mapInstanceRef.current);
              radarLayerRef.current = radarTileLayer;
            }
          }
        }
      })
      .catch(e => {
        console.warn('[LiveMiniRadarMapCard] Chargement échos radar:', e);
      });

    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      clearTimeout(timer);
      if (animationTimerRef.current) clearInterval(animationTimerRef.current);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Bascule du fond de carte (Topo ArcGIS vs Satellite ArcGIS, comme dans Radar HD)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (baseLayerRef.current) {
      map.removeLayer(baseLayerRef.current);
      baseLayerRef.current = null;
    }

    const tileUrl = mapEngine === 'satellite'
      ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      : 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}';

    const newBaseLayer = L.tileLayer(tileUrl, {
      maxZoom: 19,
      maxNativeZoom: 18,
      attribution: 'Esri ArcGIS'
    }).addTo(map);

    baseLayerRef.current = newBaseLayer;

    // Si le radar est présent, s'assurer qu'il reste au-dessus du fond
    if (radarLayerRef.current) {
      radarLayerRef.current.bringToFront();
    }
  }, [mapEngine]);

  // 3. Mise à jour de la tuile radar quand la frame active change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || currentFrameIndex < 0 || !radarFrames[currentFrameIndex]) return;

    const frame = radarFrames[currentFrameIndex];
    const radarUrl = `${radarHost}${frame.path}/256/{z}/{x}/{y}/2/1_1.png`;

    if (radarLayerRef.current) {
      map.removeLayer(radarLayerRef.current);
      radarLayerRef.current = null;
    }

    const newRadarLayer = L.tileLayer(radarUrl, {
      opacity: 0.85,
      zIndex: 10,
      maxZoom: 19,
      maxNativeZoom: 18
    });

    newRadarLayer.addTo(map);
    radarLayerRef.current = newRadarLayer;
  }, [currentFrameIndex, radarFrames, radarHost]);

  // 4. Animation en boucle Play / Pause
  useEffect(() => {
    if (isPlaying && radarFrames.length > 1) {
      animationTimerRef.current = setInterval(() => {
        setCurrentFrameIndex(prev => (prev + 1) % radarFrames.length);
      }, 750);
    } else {
      if (animationTimerRef.current) {
        clearInterval(animationTimerRef.current);
        animationTimerRef.current = null;
      }
    }

    return () => {
      if (animationTimerRef.current) clearInterval(animationTimerRef.current);
    };
  }, [isPlaying, radarFrames]);

  // 5. Mise à jour de la position selon le mode de vue (Terre, Pays, Local)
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (viewMode === 'world') {
      map.setView([20, 0], 2, { animate: true });
    } else if (viewMode === 'country') {
      const lat = isFrench ? 46.6 : station.latitude;
      const lon = isFrench ? 2.4 : station.longitude;
      map.setView([lat, lon], 5, { animate: true });
    } else {
      map.setView([station.latitude, station.longitude], 9, { animate: true });
    }
  }, [viewMode, station.latitude, station.longitude, isFrench]);

  // 6. Mettre à jour le marqueur si la station change
  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setLatLng([station.latitude, station.longitude]);
    }
  }, [station.latitude, station.longitude]);

  const countryLabel = isFrench ? 'France' : (station.country ? station.country.slice(0, 8) : 'Pays');
  const activeFrame = radarFrames[currentFrameIndex];
  const frameTimeStr = activeFrame
    ? new Date(activeFrame.time * 1000).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <div
      id="realtime-mini-radar-card"
      className="rounded-2xl border border-slate-700/60 bg-gradient-to-b from-[#0c1424] to-[#070d18] p-3 flex flex-col justify-between overflow-hidden relative shadow-lg group h-full"
    >
      {/* Header avec sélecteur de portée et API Radar HD */}
      <div className="flex items-center justify-between gap-1 mb-2">
        <div className="flex items-center gap-1.5 min-w-0" onClick={onClick} role="button" tabIndex={0}>
          <div className="w-6 h-6 rounded-lg bg-sky-500/20 border border-sky-400/40 text-sky-400 flex items-center justify-center shrink-0">
            <Radio className="h-3.5 w-3.5 text-sky-400" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-bold text-white truncate leading-tight flex items-center gap-1.5">
              <span>Radar Pluie HD Direct</span>
              <span className="text-[9px] font-medium text-sky-300 bg-sky-950/80 px-1.5 py-0.2 rounded border border-sky-600/40">
                Esri ArcGIS
              </span>
            </div>
            <div className="text-[9px] text-slate-400 truncate">
              {viewMode === 'world' 
                ? 'Couverture radar planétaire complète' 
                : viewMode === 'country' 
                  ? `Échelle nationale (${isFrench ? 'France métropolitaine' : station.country || 'Pays'})` 
                  : `Secteur local (${station.name})`}
            </div>
          </div>
        </div>

        {/* Boutons d'échelle (Terre, Pays, Local) & Couche Topo / Satellite */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Topo / Satellite Switcher */}
          <button
            type="button"
            title={mapEngine === 'topo' ? 'Passer en vue Satellite ArcGIS' : 'Passer en vue Topographique ArcGIS'}
            onClick={() => setMapEngine(prev => prev === 'topo' ? 'satellite' : 'topo')}
            className={`px-1.5 py-0.5 rounded text-[9px] font-bold border transition flex items-center gap-1 cursor-pointer ${
              mapEngine === 'satellite'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white'
            }`}
          >
            <Layers className="w-2.5 h-2.5" />
            <span className="capitalize">{mapEngine}</span>
          </button>

          {/* Scope Switcher */}
          <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[9px] font-bold">
            <button
              type="button"
              title="Vue Terre complète"
              onClick={() => setViewMode('world')}
              className={`px-1.5 py-0.5 rounded transition flex items-center gap-0.5 cursor-pointer ${
                viewMode === 'world' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Globe2 className="w-2.5 h-2.5" />
              <span>Terre</span>
            </button>
            <button
              type="button"
              title={`Centrer sur ${countryLabel}`}
              onClick={() => setViewMode('country')}
              className={`px-1.5 py-0.5 rounded transition cursor-pointer ${
                viewMode === 'country' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              {countryLabel}
            </button>
            <button
              type="button"
              title={`Centrer sur ${station.name}`}
              onClick={() => setViewMode('local')}
              className={`px-1.5 py-0.5 rounded transition cursor-pointer ${
                viewMode === 'local' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Local
            </button>
          </div>
        </div>
      </div>

      {/* Carte Radar Native Leaflet propulsée par la même API ArcGIS & RainViewer */}
      <div 
        className="relative w-full h-36 sm:h-44 md:h-52 lg:h-60 rounded-xl overflow-hidden bg-slate-950 border border-slate-800/90 shadow-inner"
      >
        <div 
          ref={mapContainerRef} 
          className="w-full h-full z-0 cursor-grab active:cursor-grabbing"
          style={{ background: '#0b1329' }}
        />

        {/* Repère station sélectionnée + Horodatage de l'écho radar */}
        <div className="absolute bottom-2 left-2 z-[400] flex items-center gap-1.5 bg-slate-950/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700/80 text-[10px] font-medium text-slate-200 shadow-md pointer-events-none">
          {viewMode === 'world' ? (
            <>
              <Globe2 className="w-2.5 h-2.5 text-indigo-400" />
              <span className="font-bold text-indigo-300">Terre Entière</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span className="max-w-[120px] truncate font-bold text-white">{station.name}</span>
            </>
          )}
          {frameTimeStr && (
            <span className="text-[9px] text-sky-400 font-bold ml-1 pl-1 border-l border-slate-700">
              {frameTimeStr}
            </span>
          )}
        </div>

        {/* Contrôles de lecture radar & Zoom (Play/Pause, Zoom In/Out, Agrandir) */}
        <div className="absolute top-2 right-2 z-[400] flex items-center gap-1.5">
          {/* Lecture / Pause de la boucle radar */}
          {radarFrames.length > 1 && (
            <button
              type="button"
              onClick={() => setIsPlaying(prev => !prev)}
              title={isPlaying ? 'Mettre en pause' : 'Lancer l\'animation radar'}
              className="bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-sky-300 p-1 rounded-lg shadow cursor-pointer transition active:scale-95 flex items-center gap-1 text-[9px] font-bold px-1.5"
            >
              {isPlaying ? <Pause className="w-3 h-3 text-amber-400" /> : <Play className="w-3 h-3 text-emerald-400" />}
              <span className="hidden xs:inline">{isPlaying ? 'Pause' : 'Animer'}</span>
            </button>
          )}

          {/* Zoom +/- */}
          <div className="flex items-center bg-slate-900/90 rounded-lg border border-slate-700 p-0.5 shadow">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
              }}
              title="Zoom avant"
              className="w-6 h-6 flex items-center justify-center text-slate-300 hover:text-white rounded hover:bg-slate-800 transition cursor-pointer"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
              }}
              title="Zoom arrière"
              className="w-6 h-6 flex items-center justify-center text-slate-300 hover:text-white rounded hover:bg-slate-800 transition cursor-pointer"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Agrandir vers Radar HD complet */}
          <button
            type="button"
            onClick={onClick}
            title="Ouvrir le radar haute définition grand format"
            className="bg-sky-600 hover:bg-sky-500 text-white px-2 py-1 rounded-lg shadow flex items-center gap-1 text-[10px] font-bold border border-sky-400/40 cursor-pointer transition active:scale-95"
          >
            <Maximize2 className="w-3 h-3" />
            <span className="hidden sm:inline">Grand écran</span>
          </button>
        </div>
      </div>
    </div>
  );
};
