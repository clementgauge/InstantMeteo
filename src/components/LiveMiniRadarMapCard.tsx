import React, { useState } from 'react';
import { Radio, ChevronRight, Maximize2 } from 'lucide-react';
import { LocationPoint } from '../types/weather';

interface LiveMiniRadarMapCardProps {
  station: LocationPoint;
  onClick?: () => void;
}

export const LiveMiniRadarMapCard: React.FC<LiveMiniRadarMapCardProps> = ({
  station,
  onClick
}) => {
  const isFrench = station.countryCode === 'FR' || station.isFrench;
  // Centrage précis sur la station ou le territoire national
  const radarLat = isFrench ? 46.8 : station.latitude;
  const radarLon = isFrench ? 2.3 : station.longitude;
  const zoom = isFrench ? 5 : 7;

  // Radar Doppler 100% légal et ouvert RainViewer & OpenStreetMap (aucun service non autorisé)
  const radarEmbedUrl = `https://www.rainviewer.com/map.html?loc=${radarLat},${radarLon},${zoom}&oFa=0&oc=1&layer=radar&sm=1&sn=1`;

  return (
    <div
      id="realtime-mini-radar-card"
      onClick={onClick}
      className="rounded-2xl border border-slate-800 bg-[#0c1424] p-3 flex flex-col justify-between overflow-hidden relative cursor-pointer active:scale-98 hover:border-blue-500/50 transition shadow-lg group h-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-1 mb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-blue-500/20 border border-blue-400/40 text-sky-400 flex items-center justify-center shrink-0">
            <Radio className="h-3.5 w-3.5 text-sky-400 animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-bold text-white truncate leading-tight flex items-center gap-1">
              <span>Radar Pluie HD</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <div className="text-[9px] text-slate-400 truncate">
              {isFrench ? 'Réseau radar ouvert' : `${station.name} direct`}
            </div>
          </div>
        </div>
        <div className="w-5 h-5 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-400 group-hover:text-white shrink-0">
          <ChevronRight className="h-3 w-3" />
        </div>
      </div>

      {/* Carte Radar en direct intégrée dans la page avec source ouverte légale */}
      <div className="relative w-full h-28 rounded-xl overflow-hidden bg-slate-950 border border-slate-800/90 shadow-inner">
        <iframe
          title="Radar Pluie Ouvert RainViewer"
          src={radarEmbedUrl}
          className="w-full h-full border-0 pointer-events-none scale-105"
          loading="lazy"
        />

        {/* Repère station sélectionnée */}
        <div className="absolute bottom-1.5 left-1.5 z-10 flex items-center gap-1 bg-slate-950/80 backdrop-blur-md px-1.5 py-0.5 rounded-md border border-slate-700/80 text-[8px] font-medium text-slate-200">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
          <span className="max-w-[70px] truncate">{station.name}</span>
        </div>

        {/* Bouton Agrandir au survol */}
        <div className="absolute top-1.5 right-1.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-blue-600/90 text-white p-1 rounded-md shadow flex items-center gap-1 text-[9px] font-bold">
          <Maximize2 className="w-2.5 h-2.5" />
          <span>Ouvrir Radar HD</span>
        </div>
      </div>
    </div>
  );
};
