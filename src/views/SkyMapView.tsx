import React, { useEffect } from 'react';
import { LocationPoint } from '../types/weather';

interface SkyMapViewProps {
  currentStation?: LocationPoint;
  onSelectStation?: (station: LocationPoint) => void;
  isLightMode?: boolean;
}

export const SkyMapView: React.FC<SkyMapViewProps> = ({ currentStation }) => {
  useEffect(() => {
    const hash = currentStation ? `#${currentStation.latitude},${currentStation.longitude},15,${encodeURIComponent(currentStation.name)}` : '';
    window.location.replace('/skymap' + hash);
  }, [currentStation]);

  return (
    <div className="fixed inset-0 z-50 w-screen h-screen bg-black flex flex-col items-center justify-center text-white m-0 p-0">
      <div className="text-cyan-400 font-bold text-base mb-2 animate-pulse">Ouverture de SkyMap 3D...</div>
      <p className="text-xs text-slate-400">Redirection vers la carte 3D autonome...</p>
    </div>
  );
};
