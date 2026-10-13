import React, { useState, useRef, useEffect } from 'react';
import { Gamepad2, X, Maximize2, Minimize2, RotateCcw } from 'lucide-react';
import paratonnerreHtml from '../../public/paratonnerre.html?raw';

interface WeatherGameModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WeatherGameModal: React.FC<WeatherGameModalProps> = ({ isOpen, onClose }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        iframeRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen, reloadKey]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-0 sm:p-3 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Paratonnerre 3D — Les gardiens de l'orage"
    >
      <div
        className={`relative flex flex-col bg-[#09141c] border border-slate-700/80 shadow-2xl overflow-hidden transition-all duration-200 ${
          isFullscreen
            ? 'w-screen h-screen rounded-none border-0'
            : 'w-full max-w-[1440px] h-[100dvh] sm:h-[92dvh] rounded-none sm:rounded-2xl'
        }`}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-3 py-2 bg-slate-900/95 border-b border-slate-800/90 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500/25 to-amber-500/20 border border-cyan-400/40 flex items-center justify-center shrink-0">
              <Gamepad2 className="w-4 h-4 text-cyan-300" />
            </div>
            <div className="truncate">
              <h2 className="text-xs sm:text-sm font-black text-white tracking-tight truncate">
                Paratonnerre 3D — Les gardiens de l’orage
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setReloadKey((k) => k + 1)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
              title="Redémarrer le jeu"
            >
              <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Relancer</span>
            </button>

            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer hidden sm:flex items-center justify-center"
              title={isFullscreen ? 'Réduire la fenêtre' : 'Plein écran'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/40 text-xs font-bold transition-colors cursor-pointer"
              title="Fermer le jeu"
            >
              <X className="w-4 h-4" />
              <span>Fermer</span>
            </button>
          </div>
        </div>

        {/* Standalone 3D Game Iframe */}
        <div className="relative flex-1 w-full h-full bg-[#09141c] overflow-hidden">
          <iframe
            key={reloadKey}
            ref={iframeRef}
            srcDoc={paratonnerreHtml}
            title="Paratonnerre — Les gardiens de l’orage"
            className="w-full h-full border-0 block"
            allow="fullscreen; autoplay; gamepad"
          />
        </div>
      </div>
    </div>
  );
};
