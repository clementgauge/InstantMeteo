import React, { useState, useEffect, useRef } from 'react';
import { Radio, Maximize2, Globe2, Layers, ZoomIn, ZoomOut } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LocationPoint } from '../types/weather';

interface LiveMiniRadarMapCardProps {
  station: LocationPoint;
  onClick?: () => void;
}

export const LiveMiniRadarMapCard: React.FC<LiveMiniRadarMapCardProps> = ({
  station,
  onClick
}) => {
  const isFrench = station.countryCode === 'FR' || station.isFrench || Boolean(station.department?.match(/\b(\d{2,3})\b/));
  const [viewMode, setViewMode] = useState<'world' | 'country' | 'local'>('country');
  const [radarTimestamp, setRadarTimestamp] = useState<string | null>(null);
  const [isInteractive, setIsInteractive] = useState<boolean>(true);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const baseLayerRef = useRef<L.TileLayer | null>(null);
  const radarLayerRef = useRef<L.TileLayer | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // 1. Initialiser la carte Leaflet native sans aucun iframe ni clé requise
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

    // Fond de carte libre, ultra-rapide et net (CartoDB Voyager - 0 clé requise)
    const baseLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 18,
      subdomains: 'abcd'
    }).addTo(map);
    baseLayerRef.current = baseLayer;

    // Marqueur de la station
    const pinIcon = L.divIcon({
      className: 'station-live-marker',
      html: `
        <div style="position:relative;display:flex;align-items:center;justify-content:center;width:24px;height:24px;">
          <div style="position:absolute;width:24px;height:24px;border-radius:50%;background:#0284c7;opacity:0.4;animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>
          <div style="width:12px;height:12px;border-radius:50%;background:#0ea5e9;border:2px solid #ffffff;box-shadow:0 0 8px rgba(14,165,233,0.8);"></div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    const marker = L.marker([station.latitude, station.longitude], { icon: pinIcon }).addTo(map);
    markerRef.current = marker;

    mapInstanceRef.current = map;

    // Charger les échos radar RainViewer via API libre de tuiles
    fetch('https://api.rainviewer.com/public/weather-maps.json')
      .then(res => res.json())
      .then(data => {
        if (data && data.radar && data.radar.past && data.radar.past.length > 0) {
          const latestRadar = data.radar.past[data.radar.past.length - 1];
          const radarUrl = `https://tilecache.rainviewer.com${latestRadar.path}/256/{z}/{x}/{y}/2/1_1.png`;
          
          if (radarLayerRef.current && mapInstanceRef.current) {
            mapInstanceRef.current.removeLayer(radarLayerRef.current);
          }

          const radarTileLayer = L.tileLayer(radarUrl, {
            opacity: 0.82,
            zIndex: 10,
            maxZoom: 18
          });

          if (mapInstanceRef.current) {
            radarTileLayer.addTo(mapInstanceRef.current);
            radarLayerRef.current = radarTileLayer;
            setRadarTimestamp(new Date(latestRadar.time * 1000).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
          }
        }
      })
      .catch(e => {
        console.warn('[LiveMiniRadarMapCard] Erreur chargement tuiles radar:', e);
      });

    // Invalider la taille de la carte après montage
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Mettre à jour l'interactivité
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    if (isInteractive) {
      map.dragging.enable();
      map.touchZoom.enable();
      map.scrollWheelZoom.enable();
    } else {
      map.dragging.disable();
      map.touchZoom.disable();
      map.scrollWheelZoom.disable();
    }
  }, [isInteractive]);

  // 3. Mise à jour de la position selon le mode de vue (Terre, Pays, Local)
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
      map.setView([station.latitude, station.longitude], 8, { animate: true });
    }
  }, [viewMode, station.latitude, station.longitude, isFrench]);

  // 4. Mettre à jour le marqueur si la station change
  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setLatLng([station.latitude, station.longitude]);
    }
  }, [station.latitude, station.longitude]);

  const countryLabel = isFrench ? 'France' : (station.country ? station.country.slice(0, 8) : 'Pays');

  return (
    <div
      id="realtime-mini-radar-card"
      className="rounded-2xl border border-slate-800 bg-[#0c1424] p-3 flex flex-col justify-between overflow-hidden relative shadow-lg group h-full"
    >
      {/* Header avec sélecteur de portée */}
      <div className="flex items-center justify-between gap-1 mb-2">
        <div className="flex items-center gap-1.5 min-w-0" onClick={onClick} role="button" tabIndex={0}>
          <div className="w-6 h-6 rounded-lg bg-blue-500/20 border border-blue-400/40 text-sky-400 flex items-center justify-center shrink-0">
            <Radio className="h-3.5 w-3.5 text-sky-400 animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-bold text-white truncate leading-tight flex items-center gap-1">
              <span>Radar Pluie &amp; Vents HD</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <div className="text-[9px] text-slate-400 truncate">
              {viewMode === 'world' 
                ? '🌍 Couverture planétaire complète en direct' 
                : viewMode === 'country' 
                  ? `🌐 Échelle nationale (${isFrench ? 'France entière' : station.country || 'Pays'})` 
                  : `📍 Secteur local (${station.name})`}
            </div>
          </div>
        </div>

        {/* Global Earth / Country / Local Pill Switcher */}
        <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[9px] font-bold shrink-0">
          <button
            type="button"
            title="Activer la vue globale sur toute la Terre"
            onClick={(e) => {
              e.stopPropagation();
              setViewMode('world');
            }}
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
            onClick={(e) => {
              e.stopPropagation();
              setViewMode('country');
            }}
            className={`px-1.5 py-0.5 rounded transition cursor-pointer ${
              viewMode === 'country' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            {countryLabel}
          </button>
          <button
            type="button"
            title={`Centrer sur ${station.name}`}
            onClick={(e) => {
              e.stopPropagation();
              setViewMode('local');
            }}
            className={`px-1.5 py-0.5 rounded transition cursor-pointer ${
              viewMode === 'local' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Local
          </button>
        </div>
      </div>

      {/* Carte Radar Native Leaflet sans iframe, 100% sans clé requise */}
      <div 
        className="relative w-full h-36 sm:h-44 md:h-52 lg:h-60 rounded-xl overflow-hidden bg-slate-950 border border-slate-800/90 shadow-inner"
      >
        <div 
          ref={mapContainerRef} 
          className="w-full h-full z-0 cursor-grab active:cursor-grabbing"
          style={{ background: '#0b1329' }}
        />

        {/* Repère station sélectionnée ou indicateur Monde */}
        <div className="absolute bottom-2 left-2 z-[400] flex items-center gap-1.5 bg-slate-950/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700/80 text-[10px] font-medium text-slate-200 shadow-md pointer-events-none">
          {viewMode === 'world' ? (
            <>
              <Globe2 className="w-2.5 h-2.5 text-indigo-400 animate-spin" />
              <span className="font-bold text-indigo-300">Terre Entière Active</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
              <span className="max-w-[120px] truncate font-black">{station.name}</span>
              {viewMode === 'country' && (
                <span className="text-[8px] text-emerald-400 font-bold bg-emerald-500/20 px-1.5 py-0.5 rounded border border-emerald-500/30">
                  {isFrench ? 'France' : station.country || 'Direct'}
                </span>
              )}
            </>
          )}
          {radarTimestamp && (
            <span className="text-[8px] text-sky-400 font-bold ml-1 pl-1 border-l border-slate-700">
              ● {radarTimestamp}
            </span>
          )}
        </div>

        {/* Contrôles interactifs (Zoom +/- & Agrandir) */}
        <div className="absolute top-2 right-2 z-[400] flex items-center gap-1.5">
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

          <button
            type="button"
            onClick={onClick}
            title="Ouvrir le radar haute définition grand format"
            className="bg-blue-600/95 hover:bg-blue-500 text-white px-2.5 py-1 rounded-lg shadow-lg flex items-center gap-1.5 text-[10px] font-black border border-blue-400/50 cursor-pointer transition active:scale-95"
          >
            <Maximize2 className="w-3 h-3" />
            <span className="hidden sm:inline">Agrandir</span>
          </button>
        </div>
      </div>
    </div>
  );
};
