import React, { useEffect, useRef, useState } from 'react';
import { ExternalLink, Maximize2, Minimize2, RotateCw } from 'lucide-react';

interface WorldDisastersViewProps {
  seniorMode?: boolean;
  simplifiedMode?: boolean;
  tempUnit?: 'C' | 'F';
}

export type DisasterCategory =
  | 'all'
  | 'recent_24h'
  | 'fire'
  | 'tsunami'
  | 'cyclone'
  | 'cold_snow'
  | 'tornado'
  | 'heat'
  | 'flood';

export interface VerifiedDisasterEvent {
  id: string;
  type: 'cold_snow' | 'fire' | 'ice' | 'tornado' | 'cyclone' | 'heat' | 'flood' | 'tsunami';
  title: string;
  region: string;
  severity: 'Critique' | 'Extrême' | 'Majeur' | 'Élevé';
  badgeColor: string;
  metric: string;
  desc: string;
  updated: string;
  timestampUtc: string;
  verifiedWithin24h: boolean;
  categoryLabel: string;
  officialMeteoCentres: string[];
  verifiedMedia: string[];
  dataVerification: string;
  sourceUrl: string;
}

const ATLAS_URL = '/assets/aistudio/carte-catastrophes_6__98caa0f3.html';

export const WorldDisastersView: React.FC<WorldDisastersViewProps> = ({
  seniorMode = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const handleToggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement && containerRef.current?.requestFullscreen) {
        await containerRef.current.requestFullscreen();
      } else if (document.fullscreenElement && document.exitFullscreen) {
        await document.exitFullscreen();
      }
    } catch {
      // Fallback silencieux si plein écran refusé par le navigateur
    }
  };

  const handleReloadIframe = () => {
    if (iframeRef.current) {
      setIsLoaded(false);
      iframeRef.current.src = ATLAS_URL;
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full bg-[#070b13] border border-slate-800/90 shadow-2xl overflow-hidden flex flex-col ${
        isFullscreen ? 'rounded-none h-screen' : 'rounded-2xl'
      }`}
    >
      {/* Barre discrète de contrôle d'affichage */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 py-2 bg-[#0b111d] border-b border-slate-800/80 text-xs text-slate-300">
        <div className="flex items-center gap-2 min-w-0">
          <span className="inline-block w-2 h-2 rounded-full bg-rose-500 shrink-0" />
          <span className={`font-bold text-slate-100 truncate ${seniorMode ? 'text-sm' : 'text-xs sm:text-sm'}`}>
            Atlas des catastrophes — Surveillance mondiale en temps réel
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleReloadIframe}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-200 font-semibold transition cursor-pointer"
            title="Recharger la page"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Recharger</span>
          </button>

          <button
            type="button"
            onClick={handleToggleFullscreen}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-200 font-semibold transition cursor-pointer"
            title={isFullscreen ? 'Quitter le plein écran' : 'Afficher en plein écran'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isFullscreen ? 'Réduire' : 'Plein écran'}</span>
          </button>

          <a
            href={ATLAS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-600/90 hover:bg-rose-500 text-white font-semibold transition"
            title="Ouvrir dans un nouvel onglet"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Nouvel onglet</span>
          </a>
        </div>
      </div>

      {/* Conteneur de l'Atlas des catastrophes */}
      <div
        className={`relative w-full bg-[#070b13] ${isFullscreen ? 'flex-1' : ''}`}
        style={isFullscreen ? undefined : { height: 'clamp(760px, 84vh, 1100px)' }}
      >
        {!isLoaded && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#070b13] text-slate-300 pointer-events-none">
            <div className="h-9 w-9 rounded-full border-3 border-rose-500 border-t-transparent animate-spin mb-3" />
            <span className="text-xs font-semibold tracking-wide text-slate-400">
              Chargement de l&apos;Atlas des catastrophes…
            </span>
          </div>
        )}

        <iframe
          ref={iframeRef}
          src="/assets/aistudio/carte-catastrophes_6__98caa0f3.html"
          title="Atlas des catastrophes"
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          style={{ width: '100%', height: '100%', border: 0 }}
          className="block bg-[#070b13]"
          allow="geolocation; fullscreen"
        />
      </div>
    </div>
  );
};
