import React, { useState } from 'react';
import { 
  X, 
  Maximize2, 
  Minimize2, 
  ExternalLink, 
  Download, 
  Monitor, 
  HelpCircle,
  CheckCircle2,
  ShieldCheck,
  Zap,
  HardDrive
} from 'lucide-react';
import { triggerPwaInstallPrompt } from '../hooks/usePWAInstall';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({
  isOpen,
  onClose,
  isFullscreen,
  onToggleFullscreen
}) => {
  const [activeTab, setActiveTab] = useState<'pwa' | 'windows' | 'fullscreen'>('pwa');
  const [isDownloadingWindows, setIsDownloadingWindows] = useState(false);
  const [windowsDownloadSuccess, setWindowsDownloadSuccess] = useState(false);

  const appUrl = typeof window !== 'undefined' 
    ? (window.location.origin.includes('run.app') ? window.location.href.split('?')[0] : 'https://ais-pre-fzmulrc57tiqz44s4owlss-510191462762.europe-west2.run.app')
    : 'https://ais-pre-fzmulrc57tiqz44s4owlss-510191462762.europe-west2.run.app';

  if (!isOpen) return null;

  const handleInstallPWA = async () => {
    onClose();
    await triggerPwaInstallPrompt();
  };

  const handleOpenNewTab = () => {
    window.open(appUrl, '_blank', 'noopener,noreferrer');
  };

  const handleTriggerWindowsDownload = async () => {
    setIsDownloadingWindows(true);
    setWindowsDownloadSuccess(false);

    try {
      const response = await fetch('/Instant-Meteo-Windows.cmd');
      if (response.ok) {
        const text = await response.text();
        const blob = new Blob([text], { type: 'application/cmd' });
        const blobUrl = window.URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = 'Instant-Meteo-Windows.cmd';
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        
        setTimeout(() => {
          document.body.removeChild(link);
          window.URL.revokeObjectURL(blobUrl);
        }, 1500);

        setWindowsDownloadSuccess(true);
        setIsDownloadingWindows(false);
        return;
      }
    } catch (e) {
      console.warn('Windows blob download fallback triggered:', e);
    }

    try {
      const link = document.createElement('a');
      link.href = '/Instant-Meteo-Windows.cmd';
      link.download = 'Instant-Meteo-Windows.cmd';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => document.body.removeChild(link), 500);
      setWindowsDownloadSuccess(true);
    } catch (e2) {
      window.location.href = '/Instant-Meteo-Windows.cmd';
      setWindowsDownloadSuccess(true);
    }

    setIsDownloadingWindows(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md sm:max-w-2xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header with Official Logo */}
        <div className="border-b border-slate-800 bg-gradient-to-r from-blue-950/80 via-slate-900 to-indigo-950/80 p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <img
                src="/icon-192.png"
                alt="Logo Officiel Instant Météo"
                className="h-11 w-11 sm:h-12 sm:w-12 rounded-2xl border-2 border-blue-400/50 shadow-lg shadow-blue-500/25 object-cover"
              />
              <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded bg-emerald-600 text-[8px] font-black uppercase text-white ring-2 ring-slate-900">
                PWA
              </span>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">
                Installer Instant Météo
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400">
                Application PWA officielle avec logo
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl border border-slate-800 bg-slate-850 p-2 text-slate-400 hover:border-slate-600 hover:bg-slate-800 hover:text-white transition cursor-pointer"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>

        {/* Navigation Tabs — Uniquement sur PC (sur téléphone, un seul type d'installation : PWA) */}
        <div className="hidden sm:grid grid-cols-3 gap-1.5 p-2 bg-slate-950/90 border-b border-slate-800">
          <button
            onClick={() => setActiveTab('pwa')}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-black transition cursor-pointer ${
              activeTab === 'pwa'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
            }`}
          >
            <img src="/icon-32.png" alt="" className="h-4 w-4 rounded" />
            <span>Application PWA</span>
          </button>

          <button
            onClick={() => setActiveTab('windows')}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-black transition cursor-pointer ${
              activeTab === 'windows'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
            }`}
          >
            <Monitor className="h-4 w-4 text-cyan-300" />
            <span>Windows (PC)</span>
          </button>

          <button
            onClick={() => setActiveTab('fullscreen')}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-black transition cursor-pointer ${
              activeTab === 'fullscreen'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
            }`}
          >
            <Maximize2 className="h-4 w-4" />
            <span>Grand Écran F11</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">

          {/* VUE UNIQUE SUR TÉLÉPHONE + ONGLET PWA : Uniquement le logo et le bouton "Installer en PWA" */}
          <div className={`${activeTab === 'pwa' ? 'block' : 'block sm:hidden'} animate-fadeIn`}>
            <div className="rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-emerald-950/50 via-slate-900 to-slate-950 p-5 text-center space-y-4 shadow-lg">
              <div className="relative inline-block mx-auto">
                <img
                  src="/icon-192.png"
                  alt="Logo Officiel Instant Météo PWA"
                  className="h-20 w-20 rounded-2xl border-2 border-emerald-400/60 shadow-xl shadow-emerald-500/20 object-cover mx-auto"
                />
                <span className="absolute -bottom-1.5 -right-1.5 px-2 py-0.5 rounded-md bg-emerald-600 text-[10px] font-black uppercase text-white ring-2 ring-slate-900 shadow">
                  PWA
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-black text-white">
                  Instant Météo — Application PWA
                </h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto">
                  Installez l’application avec son logo officiel directement sur votre écran d’applis.
                </p>
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleInstallPWA}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-sm transition shadow-xl shadow-emerald-600/30 active:scale-95 cursor-pointer"
                >
                  <img src="/icon-192.png" alt="" className="h-5 w-5 rounded-md object-cover border border-white/30" />
                  <span>Installer en PWA</span>
                </button>
              </div>
            </div>
          </div>

          {/* TAB Windows (PC uniquement) */}
          {activeTab === 'windows' && (
            <div className="hidden sm:block space-y-5 animate-fadeIn">
              <div className="rounded-2xl border border-blue-500/40 bg-gradient-to-br from-blue-950/60 via-slate-900 to-slate-950 p-5 shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="relative shrink-0">
                    <img 
                      src="/icon-128.png" 
                      alt="Logo Nuage Instant Météo" 
                      className="h-16 w-16 rounded-2xl border-2 border-blue-400/40 shadow-xl shadow-blue-500/25 object-cover" 
                    />
                    <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white rounded-full p-1 border border-slate-900 shadow">
                      <Monitor className="h-3.5 w-3.5" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-black text-white">
                        Application Instant Météo pour Bureau Windows
                      </h3>
                      <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[11px] font-bold text-emerald-400 border border-emerald-500/30">
                        ✓ Raccourci Bureau &amp; PWA
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                      Faites apparaître l'application Instant Météo directement sur votre Bureau avec le <strong>logo officiel nuage</strong>.
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <button
                        onClick={handleTriggerWindowsDownload}
                        disabled={isDownloadingWindows}
                        className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs transition shadow-xl shadow-blue-600/30 active:scale-95 cursor-pointer disabled:opacity-50"
                      >
                        <Download className="h-4 w-4" />
                        <span>
                          {isDownloadingWindows
                            ? 'Téléchargement...' 
                            : 'Télécharger le Lanceur Bureau (.cmd)'}
                        </span>
                      </button>

                      <button
                        onClick={handleInstallPWA}
                        className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition shadow-lg shadow-emerald-600/30 active:scale-95 cursor-pointer"
                      >
                        <img src="/icon-32.png" alt="" className="h-4 w-4 rounded" />
                        <span>Installer en PWA</span>
                      </button>

                      <a
                        href="/Instant-Meteo.url"
                        download="Instant-Meteo.url"
                        className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-850 hover:bg-slate-800 text-slate-300 font-bold text-xs border border-slate-700 transition cursor-pointer"
                      >
                        <HardDrive className="h-4 w-4 text-cyan-400" />
                        <span>Raccourci Web (.url)</span>
                      </a>
                    </div>

                    {windowsDownloadSuccess && (
                      <div className="mt-3 p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2.5">
                        <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                        <span>Fichier <strong>Instant-Meteo-Windows.cmd</strong> téléchargé ! Double-cliquez dessus sur votre PC pour placer le raccourci avec le <strong>logo officiel</strong> sur votre Bureau.</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 space-y-3">
                <h4 className="font-black text-xs text-white flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-blue-400" />
                  Installation sur Bureau Windows :
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Cliquez sur <strong>« Installer en PWA »</strong> pour ajouter directement l'application à l'écran Applis, ou sur <strong>« Télécharger le Lanceur Bureau (.cmd) »</strong> pour créer automatiquement le raccourci sur votre Bureau Windows.
                </p>
              </div>
            </div>
          )}

          {/* TAB Grand Écran (PC uniquement) */}
          {activeTab === 'fullscreen' && (
            <div className="hidden sm:block space-y-5 animate-fadeIn">
              <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950 p-5">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                    <Monitor className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-black text-white">
                      Affichage Grand Écran &amp; Mode Observatoire
                    </h3>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      Profitez des cartes radars Doppler en haute résolution et des prévisions complètes en plein écran.
                    </p>

                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        onClick={onToggleFullscreen}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition shadow-lg shadow-amber-500/30 active:scale-95 cursor-pointer"
                      >
                        {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                        <span>{isFullscreen ? 'Quitter le Plein Écran' : 'Activer le Plein Écran (F11)'}</span>
                      </button>

                      <button
                        onClick={handleOpenNewTab}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-white font-black text-xs border border-slate-700 transition cursor-pointer"
                      >
                        <ExternalLink className="h-4 w-4 text-blue-400" />
                        <span>Ouvrir dans un Nouvel Onglet</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 bg-slate-950 p-3.5 px-5 flex items-center justify-between">
          <span className="text-xs text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Instant Météo • Application PWA</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition cursor-pointer"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
};
