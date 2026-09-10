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
  const isFrench = station.countryCode === 'FR' || station.isFrench || Boolean(station.department?.match(/\b(\d{2,3})\b/));
  const [viewMode, setViewMode] = useState<'france' | 'local'>(isFrench ? 'france' : 'local');

  // Centrage précis : France entière (46.6, 2.4 zoom 5.1) ou secteur local
  const radarLat = viewMode === 'france' ? 46.6 : station.latitude;
  const radarLon = viewMode === 'france' ? 2.4 : station.longitude;
  const zoom = viewMode === 'france' ? 5 : 8;

  // Radar Doppler 100% légal et ouvert RainViewer & OpenStreetMap (aucun service non autorisé)
  const radarEmbedUrl = `https://www.rainviewer.com/map.html?loc=${radarLat},${radarLon},${zoom}&oFa=0&oc=1&layer=radar&sm=1&sn=1`;

  return (
    <div
      id="realtime-mini-radar-card"
      className="rounded-2xl border border-slate-800 bg-[#0c1424] p-3 flex flex-col justify-between overflow-hidden relative shadow-lg group h-full"
    >
      {/* Header with Switcher */}
      <div className="flex items-center justify-between gap-1 mb-2">
        <div className="flex items-center gap-1.5 min-w-0" onClick={onClick} role="button" tabIndex={0}>
          <div className="w-6 h-6 rounded-lg bg-blue-500/20 border border-blue-400/40 text-sky-400 flex items-center justify-center shrink-0">
            <Radio className="h-3.5 w-3.5 text-sky-400 animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-bold text-white truncate leading-tight flex items-center gap-1">
              <span>Radar Pluie HD</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <div className="text-[9px] text-slate-400 truncate">
              {viewMode === 'france' ? '🇫🇷 Carte France entière en direct' : `Secteur ${station.name}`}
            </div>
          </div>
        </div>

        {/* France / Local Pill Switcher if in France */}
        {isFrench ? (
          <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[9px] font-bold shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setViewMode('france');
              }}
              className={`px-1.5 py-0.5 rounded transition ${
                viewMode === 'france' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              France
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setViewMode('local');
              }}
              className={`px-1.5 py-0.5 rounded transition ${
                viewMode === 'local' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Local
            </button>
          </div>
        ) : (
          <div 
            onClick={onClick}
            className="w-5 h-5 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-400 group-hover:text-white shrink-0 cursor-pointer"
          >
            <ChevronRight className="h-3 w-3" />
          </div>
        )}
      </div>

      {/* Carte Radar en direct intégrée dans la page avec source ouverte légale */}
      <div 
        onClick={onClick}
        className="relative w-full h-32 sm:h-40 md:h-52 lg:h-60 rounded-xl overflow-hidden bg-slate-950 border border-slate-800/90 shadow-inner cursor-pointer"
      >
        <iframe
          title="Radar Pluie Ouvert RainViewer"
          src={radarEmbedUrl}
          className="w-full h-full border-0 pointer-events-none scale-105"
          loading="lazy"
        />

        {/* Repère station sélectionnée */}
        <div className="absolute bottom-2 left-2 z-10 flex items-center gap-1.5 bg-slate-950/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700/80 text-[10px] font-medium text-slate-200 shadow-md">
          <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
          <span className="max-w-[120px] truncate font-black">{station.name}</span>
          {viewMode === 'france' && (
            <span className="text-[8px] text-emerald-400 font-bold bg-emerald-500/20 px-1.5 py-0.5 rounded border border-emerald-500/30">Direct National</span>
          )}
        </div>

        {/* Bouton Agrandir au survol */}
        <div className="absolute top-2 right-2 z-10 opacity-90 group-hover:opacity-100 transition-opacity bg-blue-600/95 hover:bg-blue-500 text-white px-2.5 py-1 rounded-lg shadow-lg flex items-center gap-1.5 text-[10px] font-black border border-blue-400/50">
          <Maximize2 className="w-3 h-3" />
          <span>Agrandir Radar HD</span>
        </div>
      </div>
    </div>
  );
};
