import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Navigation, 
  MapPin, 
  Compass, 
  Maximize2, 
  Minimize2, 
  ExternalLink, 
  RotateCw, 
  Layers, 
  ShieldCheck, 
  Info, 
  Sparkles,
  Crosshair,
  AlertCircle
} from 'lucide-react';
import { LocationPoint } from '../types/weather';
import { getLocalityFromCoordinates } from '../services/openMeteoService';

interface SkyMapViewProps {
  currentStation: LocationPoint;
  onSelectStation?: (station: LocationPoint) => void;
  isLightMode?: boolean;
}

export const SkyMapView: React.FC<SkyMapViewProps> = ({
  currentStation,
  onSelectStation,
  isLightMode = false,
}) => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [gpsFix, setGpsFix] = useState<{ lat: number; lon: number; accuracy: number; timestamp: number } | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  // Construct iframe URL with active station coordinates and auto-locate hint
  const iframeSrc = `/assets/aistudio/SkyMap-ligne-bleue-reparee_a36eb9c7.html#${currentStation.latitude},${currentStation.longitude},15.2,${encodeURIComponent(currentStation.name)}`;

  // Post message helper
  const postToSkyMap = useCallback((message: any) => {
    try {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.postMessage(message, '*');
      }
    } catch (err) {
      console.warn('[SkyMap] Erreur envoi postMessage:', err);
    }
  }, []);

  // Listen for messages from SkyMap iframe
  useEffect(() => {
    const handleWindowMessage = async (event: MessageEvent) => {
      if (!event || !event.data) return;

      if (event.data.type === 'SKYMAP_GPS_FIX') {
        const { lat, lon, accuracy } = event.data;
        if (typeof lat === 'number' && typeof lon === 'number') {
          setGpsFix({
            lat,
            lon,
            accuracy: accuracy || 15,
            timestamp: Date.now(),
          });
          setIsLocating(false);
          setGpsError(null);

          // Propose updating currentStation if user has moved significantly
          if (onSelectStation) {
            try {
              const locality = await getLocalityFromCoordinates(lat, lon);
              if (locality && locality.name) {
                onSelectStation(locality);
              }
            } catch (_) {}
          }
        }
      } else if (event.data.type === 'SKYMAP_GPS_ERROR') {
        setGpsError(event.data.message || 'Signal GPS introuvable.');
        setIsLocating(false);
      }
    };

    window.addEventListener('message', handleWindowMessage);
    return () => window.removeEventListener('message', handleWindowMessage);
  }, [onSelectStation]);

  // Trigger high-precision geolocation
  const handleLocateMe = useCallback(() => {
    setIsLocating(true);
    setGpsError(null);

    // 1. Send locate order to iframe
    postToSkyMap({ type: 'SKYMAP_LOCATE' });

    // 2. Perform native parent geolocation in parallel (ensures instant permission prompt and fast fallback)
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const accuracy = pos.coords.accuracy || 15;

          setGpsFix({ lat, lon, accuracy, timestamp: Date.now() });
          setIsLocating(false);
          setGpsError(null);

          // Transmit directly into iframe
          postToSkyMap({
            type: 'SKYMAP_SET_POSITION',
            lat,
            lon,
            accuracy,
            name: 'Ma position GPS',
          });

          // Sync with parent applet
          if (onSelectStation) {
            try {
              const locality = await getLocalityFromCoordinates(lat, lon);
              if (locality && locality.name) {
                onSelectStation(locality);
              }
            } catch (_) {}
          }
        },
        (err) => {
          console.warn('[SkyMap Parent Geolocation] Fallback to iframe listener:', err.message);
          // Let iframe's internal geolocation attempt continue
          setTimeout(() => {
            setIsLocating(false);
          }, 4000);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    } else {
      setIsLocating(false);
      setGpsError('La géolocalisation n\'est pas prise en charge par ce navigateur.');
    }
  }, [postToSkyMap, onSelectStation]);

  // Center on current station
  const handleCenterOnStation = useCallback(() => {
    postToSkyMap({
      type: 'SKYMAP_FLY_TO',
      lat: currentStation.latitude,
      lon: currentStation.longitude,
      zoom: 15.2,
      name: currentStation.name,
    });
  }, [postToSkyMap, currentStation]);

  // Toggle internal fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().then(() => {
        setIsFullscreen(true);
      }).catch(() => {
        setIsFullscreen(!isFullscreen);
      });
    } else {
      document.exitFullscreen?.().then(() => {
        setIsFullscreen(false);
      }).catch(() => {
        setIsFullscreen(false);
      });
    }
  };

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`relative w-full rounded-3xl overflow-hidden transition-all duration-300 ${
        isFullscreen 
          ? 'fixed inset-0 z-50 rounded-none bg-black h-screen' 
          : 'bg-black border border-slate-800/80 shadow-2xl min-h-[750px] flex flex-col'
      }`}
    >
      {/* Top Bar Controls */}
      <div className="bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-white z-10">
        {/* Left: Branding & Station */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
            <Compass className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm md:text-base tracking-tight text-white flex items-center gap-1.5">
                SkyMap 3D
                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Relief & Ciel
                </span>
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-rose-400" />
              <span>{currentStation.name} ({currentStation.department})</span>
              {gpsFix && (
                <span className="text-emerald-400 font-semibold ml-1.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                  GPS actif (±{Math.round(gpsFix.accuracy)}m)
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Center/Right: Interactive Actions */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Primary Geolocation Button */}
          <button
            type="button"
            onClick={handleLocateMe}
            disabled={isLocating}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer ${
              isLocating
                ? 'bg-amber-600 text-white cursor-wait animate-pulse'
                : gpsFix
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20'
                : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-blue-500/25'
            }`}
            title="Activer la géolocalisation et centrer la carte 3D sur ma position en direct"
          >
            {isLocating ? (
              <>
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
                <span>Recherche GPS...</span>
              </>
            ) : (
              <>
                <Crosshair className="w-3.5 h-3.5" />
                <span>{gpsFix ? 'Actualiser mon GPS' : 'Ma position GPS'}</span>
              </>
            )}
          </button>

          {/* Center on Current Station Button */}
          <button
            type="button"
            onClick={handleCenterOnStation}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium border border-slate-700/80 transition cursor-pointer active:scale-95"
            title={`Centrer la caméra sur ${currentStation.name}`}
          >
            <Navigation className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Centrer sur</span>
            <span className="font-semibold">{currentStation.name}</span>
          </button>

          {/* Guide / Info Toggle */}
          <button
            type="button"
            onClick={() => setShowGuide(!showGuide)}
            className={`p-2 rounded-xl text-xs font-medium border transition cursor-pointer ${
              showGuide 
                ? 'bg-blue-600 text-white border-blue-500' 
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700/80'
            }`}
            title="Aide & Fonctionnalités SkyMap 3D"
          >
            <Info className="w-3.5 h-3.5" />
          </button>

          {/* Refresh Iframe */}
          <button
            type="button"
            onClick={() => setIframeKey((prev) => prev + 1)}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 transition cursor-pointer"
            title="Recharger la carte 3D"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          {/* Fullscreen Button */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 transition cursor-pointer"
            title={isFullscreen ? 'Quitter le plein écran' : 'Passer en plein écran'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          {/* Open Standalone in New Tab */}
          <a
            href={iframeSrc}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 transition cursor-pointer inline-flex items-center"
            title="Ouvrir dans un nouvel onglet pleine page"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* GPS Error Notification if any */}
      {gpsError && (
        <div className="bg-rose-950/80 border-b border-rose-800 px-4 py-2 text-rose-200 text-xs flex items-center justify-between gap-2 z-10 animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{gpsError}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setGpsError(null)}
            className="text-rose-400 hover:text-rose-200 underline font-semibold"
          >
            Ignorer
          </button>
        </div>
      )}

      {/* Collapsible Quick Guide / Features */}
      {showGuide && (
        <div className="bg-slate-900/95 border-b border-slate-800 p-4 text-xs text-slate-300 grid grid-cols-1 md:grid-cols-3 gap-4 z-10 animate-fade-in">
          <div className="space-y-1">
            <h4 className="font-bold text-cyan-400 flex items-center gap-1.5">
              <Compass className="w-4 h-4" /> 1. Carte 3D & Relief
            </h4>
            <p className="text-slate-400 leading-relaxed">
              Maintenez le clic droit ou deux doigts sur mobile pour incliner la caméra. Activez le bouton 3D en bas pour extruder les bâtiments urbains et le relief topographique.
            </p>
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-blue-400 flex items-center gap-1.5">
              <Crosshair className="w-4 h-4" /> 2. Géolocalisation & Guidage
            </h4>
            <p className="text-slate-400 leading-relaxed">
              Le bouton <strong>Ma position GPS</strong> active le suivi permanent avec cône d'orientation et cercle de précision. Vos données météo s'actualisent le long de vos déplacements.
            </p>
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-amber-400 flex items-center gap-1.5">
              <Layers className="w-4 h-4" /> 3. Itinéraires & Météo Réelle
            </h4>
            <p className="text-slate-400 leading-relaxed">
              Calculez des trajets routiers avec la ligne bleue réparée (OSRM), visualisez le radar de pluie Doppler en superposition et basculez entre les fonds Satellite, Relief et Sombre.
            </p>
          </div>
        </div>
      )}

      {/* Main Interactive Map Iframe */}
      <div className="relative flex-1 w-full h-[650px] md:h-[780px] bg-black">
        <iframe
          key={iframeKey}
          ref={iframeRef}
          src={iframeSrc}
          title="SkyMap 3D — Carte Ciel & Relief"
          className="w-full h-full border-0 block"
          allow="geolocation; camera; microphone; fullscreen; accelerometer; gyroscope; display-capture"
          loading="eager"
        />
      </div>

      {/* Footer bar with attribution and status */}
      <div className="bg-slate-950 px-4 py-2 text-[11px] text-slate-400 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Données libres : OpenFreeMap · MapLibre GL 3D · Open-Meteo · RainViewer</span>
        </div>
        <div className="flex items-center gap-3">
          <span>Inclinaison max : 65°</span>
          <span>•</span>
          <span>Bâtiments 3D & Relief DEM</span>
          {gpsFix && (
            <>
              <span>•</span>
              <span className="text-cyan-400">
                Lat: {gpsFix.lat.toFixed(4)}°, Lon: {gpsFix.lon.toFixed(4)}°
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
