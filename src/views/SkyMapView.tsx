import React, { useRef, useCallback } from 'react';
import { LocationPoint } from '../types/weather';

interface SkyMapViewProps {
  currentStation: LocationPoint;
  onSelectStation?: (station: LocationPoint) => void;
  isLightMode?: boolean;
}

export const SkyMapView: React.FC<SkyMapViewProps> = ({
  currentStation,
}) => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // URL directe du fichier autonome avec les coordonnées de la station active
  const iframeSrc = `/skymap-embed.html#${currentStation.latitude},${currentStation.longitude},15,${encodeURIComponent(currentStation.name)}`;

  // Détection anti-imbrication de sécurité
  const handleIframeLoad = useCallback(() => {
    try {
      if (iframeRef.current && iframeRef.current.contentDocument) {
        const doc = iframeRef.current.contentDocument;
        const isOuterApp = doc.getElementById('root') || doc.title.includes('Instant Météo —');
        if (isOuterApp) {
          iframeRef.current.contentWindow?.location.replace(iframeSrc);
        }
      }
    } catch (_) {
      // Safe cross-origin
    }
  }, [iframeSrc]);

  return (
    <div className="w-full h-full min-h-screen bg-black overflow-hidden m-0 p-0">
      <iframe
        ref={iframeRef}
        src={iframeSrc}
        title="SkyMap 3D — Carte Ciel & Relief"
        className="w-full h-full min-h-screen border-0 block m-0 p-0"
        allow="geolocation; camera; microphone; fullscreen; accelerometer; gyroscope; display-capture"
        loading="eager"
        onLoad={handleIframeLoad}
      />
    </div>
  );
};
