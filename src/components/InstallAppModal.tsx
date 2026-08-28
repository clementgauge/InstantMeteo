import React, { useState, useEffect } from 'react';
import { 
  X, 
  Smartphone, 
  Maximize2, 
  Minimize2, 
  ExternalLink, 
  Download, 
  Share2, 
  Copy, 
  Check, 
  Sparkles, 
  Apple, 
  Monitor, 
  QrCode, 
  HelpCircle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe,
  FileCheck2,
  AlertCircle,
  HardDrive,
  Flame
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

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
  const [activeTab, setActiveTab] = useState<'windows' | 'apk' | 'android' | 'ios' | 'fullscreen'>('windows');
  const [copied, setCopied] = useState(false);
  const [copiedApkUrl, setCopiedApkUrl] = useState(false);
  const [copiedWindowsCmdUrl, setCopiedWindowsCmdUrl] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isDownloadingApk, setIsDownloadingApk] = useState(false);
  const [apkDownloadSuccess, setApkDownloadSuccess] = useState(false);
  const [isDownloadingWindows, setIsDownloadingWindows] = useState(false);
  const [windowsDownloadSuccess, setWindowsDownloadSuccess] = useState(false);

  // Determine the best clean share URL
  const appUrl = typeof window !== 'undefined' 
    ? (window.location.origin.includes('run.app') ? window.location.href.split('?')[0] : 'https://ais-pre-fzmulrc57tiqz44s4owlss-510191462762.europe-west2.run.app')
    : 'https://ais-pre-fzmulrc57tiqz44s4owlss-510191462762.europe-west2.run.app';

  const apkUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/Instant-Meteo.apk`
    : 'https://ais-pre-fzmulrc57tiqz44s4owlss-510191462762.europe-west2.run.app/Instant-Meteo.apk';

  const windowsCmdUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/Instant-Meteo-Windows.cmd`
    : 'https://ais-pre-fzmulrc57tiqz44s4owlss-510191462762.europe-west2.run.app/Instant-Meteo-Windows.cmd';

  // Listen for PWA beforeinstallprompt
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(appUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      }
    } catch (err) {
      console.error('Erreur copie:', err);
    }
  };

  const handleCopyApkLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(apkUrl);
        setCopiedApkUrl(true);
        setTimeout(() => setCopiedApkUrl(false), 3000);
      }
    } catch (err) {
      console.error('Erreur copie APK URL:', err);
    }
  };

  const handleCopyWindowsCmdLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(windowsCmdUrl);
        setCopiedWindowsCmdUrl(true);
        setTimeout(() => setCopiedWindowsCmdUrl(false), 3000);
      }
    } catch (err) {
      console.error('Erreur copie Windows Cmd URL:', err);
    }
  };

  const handleShareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Instant Météo - Prévisions & Radar HD',
          text: 'Téléchargez et installez l\'application Instant Météo sur votre ordinateur ou téléphone !',
          url: appUrl,
        });
      } catch (err) {
        console.log('Share dismissed');
      }
    } else {
      handleCopyLink();
    }
  };

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstallable(false);
        setDeferredPrompt(null);
      }
    }
  };

  const handleOpenNewTab = () => {
    window.open(appUrl, '_blank', 'noopener,noreferrer');
  };

  // Robust multi-tier Windows launcher downloader
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

  // Robust multi-tier APK downloader
  const handleTriggerApkDownload = async () => {
    setIsDownloadingApk(true);
    setApkDownloadSuccess(false);

    try {
      // Strategy 1: Fetch as blob with explicit APK MIME type and trigger programmatic object URL download
      const response = await fetch('/Instant-Meteo.apk');
      if (response.ok) {
        const blob = await response.blob();
        const apkBlob = new Blob([blob], { type: 'application/vnd.android.package-archive' });
        const blobUrl = window.URL.createObjectURL(apkBlob);
        
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = 'Instant-Meteo.apk';
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        
        setTimeout(() => {
          document.body.removeChild(link);
          window.URL.revokeObjectURL(blobUrl);
        }, 1500);

        setApkDownloadSuccess(true);
        setIsDownloadingApk(false);
        return;
      }
    } catch (e) {
      console.warn('Blob download fallback triggered:', e);
    }

    // Strategy 2: Direct anchor download
    try {
      const link = document.createElement('a');
      link.href = '/Instant-Meteo.apk';
      link.download = 'Instant-Meteo.apk';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => document.body.removeChild(link), 500);
      setApkDownloadSuccess(true);
    } catch (e2) {
      // Strategy 3: Window location or direct opening
      window.location.href = '/Instant-Meteo.apk';
      setApkDownloadSuccess(true);
    }

    setIsDownloadingApk(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="border-b border-slate-800 bg-gradient-to-r from-blue-950/80 via-slate-900 to-indigo-950/80 p-5 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 border border-blue-400/30 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 shrink-0">
              <Monitor className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-black text-white">
                  Télécharger &amp; Installer Instant Météo
                </h2>
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> Windows, Android &amp; iOS
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Installation directe sur Windows (PC/Bureau), Android (Package APK direct &amp; PWA), iPhone / iPad (iOS) &amp; Mode Grand Écran
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-2xl border border-slate-800 bg-slate-850 p-2.5 text-slate-400 hover:border-slate-600 hover:bg-slate-800 hover:text-white transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Quick Action Bar: Grand Écran & Ouvrir sans cadre */}
        <div className="bg-slate-950/70 border-b border-slate-800/80 p-3 sm:px-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-amber-400" />
              Affichage Grand Écran :
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onToggleFullscreen}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition border shadow cursor-pointer ${
                isFullscreen
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                  : 'bg-blue-600 hover:bg-blue-500 text-white border-blue-400/40 shadow-blue-600/30'
              }`}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              <span>{isFullscreen ? 'Quitter le Plein Écran' : 'Activer le Plein Écran (Grand Écran)'}</span>
            </button>

            <button
              onClick={handleOpenNewTab}
              title="Ouvrir l'application dans un nouvel onglet plein écran sans cadre"
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-850 hover:bg-slate-800 text-slate-200 border border-slate-700 transition cursor-pointer"
            >
              <ExternalLink className="h-4 w-4 text-blue-400" />
              <span>Ouvrir en Plein Écran (Nouvel Onglet)</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1 p-2 bg-slate-950/90 border-b border-slate-800">
          <button
            onClick={() => setActiveTab('windows')}
            className={`flex items-center justify-center gap-2 py-2.5 px-2.5 rounded-xl text-xs font-black transition cursor-pointer ${
              activeTab === 'windows'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
            }`}
          >
            <Monitor className="h-4 w-4 text-cyan-300" />
            <span>Windows (PC)</span>
          </button>

          <button
            onClick={() => setActiveTab('apk')}
            className={`flex items-center justify-center gap-2 py-2.5 px-2.5 rounded-xl text-xs font-black transition cursor-pointer ${
              activeTab === 'apk'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
            }`}
          >
            <Download className="h-4 w-4" />
            <span>Android APK (.apk)</span>
          </button>

          <button
            onClick={() => setActiveTab('android')}
            className={`flex items-center justify-center gap-2 py-2.5 px-2.5 rounded-xl text-xs font-black transition cursor-pointer ${
              activeTab === 'android'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
            }`}
          >
            <Smartphone className="h-4 w-4" />
            <span>Android (PWA)</span>
          </button>

          <button
            onClick={() => setActiveTab('ios')}
            className={`flex items-center justify-center gap-2 py-2.5 px-2.5 rounded-xl text-xs font-black transition cursor-pointer ${
              activeTab === 'ios'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
            }`}
          >
            <Apple className="h-4 w-4" />
            <span>iPhone / iPad</span>
          </button>

          <button
            onClick={() => setActiveTab('fullscreen')}
            className={`flex items-center justify-center gap-2 py-2.5 px-2.5 rounded-xl text-xs font-black transition cursor-pointer ${
              activeTab === 'fullscreen'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
            }`}
          >
            <Maximize2 className="h-4 w-4" />
            <span>Grand Écran F11</span>
          </button>
        </div>

        {/* Modal Body with scroll */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">

          {/* TAB 0: Windows Download & Installation */}
          {activeTab === 'windows' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="rounded-2xl border border-blue-500/40 bg-gradient-to-br from-blue-950/60 via-slate-900 to-slate-950 p-5 shadow-lg">
                <div className="flex flex-col sm:flex-row items-start gap-4">
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
                        ✓ Compatible Windows, Edge &amp; Chrome
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                      Faites apparaître l'application Instant Météo directement sur votre Bureau avec le <strong>logo officiel nuage</strong>. Compatible avec Microsoft Edge, Google Chrome et tous les navigateurs Windows.
                    </p>

                    {/* Technical badges */}
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                      <span className="rounded-lg bg-slate-950 px-2.5 py-1 border border-slate-800 font-mono text-cyan-300">
                        Windows 11 / Windows 10
                      </span>
                      <span className="rounded-lg bg-slate-950 px-2.5 py-1 border border-slate-800 text-slate-300 flex items-center gap-1.5">
                        <img src="/icon-32.png" alt="icon" className="w-3.5 h-3.5 rounded" />
                        Icône Nuage HD (.ico / .png)
                      </span>
                      <span className="rounded-lg bg-slate-950 px-2.5 py-1 border border-slate-800 text-emerald-300 flex items-center gap-1">
                        <ShieldCheck className="h-3.5 w-3.5" /> Raccourci Bureau 1 clic
                      </span>
                    </div>

                    {/* Main Download and Action Buttons for Windows */}
                    <div className="mt-5 flex flex-wrap items-center gap-3">
                      <button
                        onClick={handleTriggerWindowsDownload}
                        disabled={isDownloadingWindows}
                        className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm transition shadow-xl shadow-blue-600/30 active:scale-95 cursor-pointer disabled:opacity-50"
                      >
                        <Download className="h-5 w-5" />
                        <span>
                          {isDownloadingWindows
                            ? 'Téléchargement...' 
                            : 'Télécharger le Lanceur Bureau (.cmd)'}
                        </span>
                      </button>

                      <a
                        href="/Instant-Meteo.ico"
                        download="Instant-Meteo.ico"
                        className="flex items-center gap-2 px-4 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold text-xs border border-slate-700 transition cursor-pointer"
                      >
                        <img src="/icon-32.png" alt="ico" className="h-4 w-4 rounded shrink-0" />
                        <span>Télécharger l'Icône Nuage (.ico)</span>
                      </a>

                      <a
                        href="/Instant-Meteo.url"
                        download="Instant-Meteo.url"
                        className="flex items-center gap-2 px-4 py-3.5 rounded-2xl bg-slate-850 hover:bg-slate-800 text-slate-300 font-bold text-xs border border-slate-755 transition cursor-pointer"
                      >
                        <HardDrive className="h-4 w-4 text-cyan-400" />
                        <span>Raccourci Web (.url)</span>
                      </a>

                      {isInstallable && (
                        <button
                          onClick={handleInstallPWA}
                          className="flex items-center gap-2 px-4 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition shadow-lg shadow-emerald-600/30 active:scale-95 cursor-pointer"
                        >
                          <Download className="h-4 w-4" />
                          <span>Installer Directement (Edge/Chrome)</span>
                        </button>
                      )}
                    </div>

                    {windowsDownloadSuccess && (
                      <div className="mt-3 p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2.5">
                        <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                        <span>Fichier <strong>Instant-Meteo-Windows.cmd</strong> téléchargé ! Double-cliquez dessus sur votre PC : il placera automatiquement le raccourci avec le <strong>logo nuage</strong> sur votre Bureau et ouvrira l'application.</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Step by step installation guide for Windows */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5 space-y-4">
                <h4 className="font-black text-sm text-white flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-blue-400" />
                  Comment faire apparaître le raccourci nuage sur votre Bureau Windows :
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
                  {/* Method 1: Script Universel */}
                  <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-950/20 space-y-2 ring-1 ring-blue-500/20">
                    <div className="flex items-center justify-between">
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-600 text-white font-black text-xs">1</span>
                      <strong className="text-blue-300">Lanceur Universel (.cmd)</strong>
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      Cliquez sur <strong>« Télécharger le Lanceur Bureau »</strong>. Double-cliquez sur le fichier : il installe automatiquement le raccourci avec l'icône nuage sur votre Bureau Windows.
                    </p>
                  </div>

                  {/* Method 2: Edge PWA */}
                  <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-600 text-white font-black text-xs">2</span>
                      <strong className="text-indigo-300">Microsoft Edge</strong>
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      Dans Edge, ouvrez le menu <strong>...</strong> ➔ <strong>Applications</strong> ➔ <strong>« Installer Instant Météo »</strong>. Cochez <em>« Raccourci sur le Bureau »</em>.
                    </p>
                  </div>

                  {/* Method 3: Chrome PWA */}
                  <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-600 text-white font-black text-xs">3</span>
                      <strong className="text-emerald-300">Google Chrome</strong>
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      Dans Chrome, cliquez sur l'icône <strong>Installer l'application</strong> dans la barre d'adresse (ou menu ⋮ ➔ <em>Enregistrer et partager</em> ➔ <em>Installer</em>).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: APK Android Download */}
          {activeTab === 'apk' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="rounded-2xl border border-purple-500/40 bg-gradient-to-br from-purple-950/50 via-slate-900 to-slate-950 p-5 shadow-lg">
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0">
                    <HardDrive className="h-7 w-7" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-black text-white">
                        Package Natif Android Instant Météo (.APK)
                      </h3>
                      <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[11px] font-bold text-emerald-400 border border-emerald-500/30">
                        ✓ Compilé & Signé (29 Ko)
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                      Fichier package universel standalone pour <strong>tous les smartphones Android</strong> (Samsung Galaxy, Google Pixel, Xiaomi, Redmi, Huawei, Sony, OnePlus, Oppo, etc.).
                    </p>

                    {/* Technical badges */}
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                      <span className="rounded-lg bg-slate-950 px-2.5 py-1 border border-slate-800 font-mono text-purple-300">
                        Package: com.instantmeteo.app
                      </span>
                      <span className="rounded-lg bg-slate-950 px-2.5 py-1 border border-slate-800 text-slate-300">
                        Cible: Android 5.0 à Android 15+ (API 21-34)
                      </span>
                      <span className="rounded-lg bg-slate-950 px-2.5 py-1 border border-slate-800 text-emerald-300 flex items-center gap-1">
                        <FileCheck2 className="h-3.5 w-3.5" /> Signatures v1, v2 & v3 valides
                      </span>
                    </div>

                    {/* Main Download Button */}
                    <div className="mt-5 flex flex-wrap items-center gap-3">
                      <button
                        onClick={handleTriggerApkDownload}
                        disabled={isDownloadingApk}
                        className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-black text-sm transition shadow-xl shadow-purple-600/30 active:scale-95 cursor-pointer disabled:opacity-50"
                      >
                        <Download className="h-5 w-5" />
                        <span>
                          {isDownloadingApk 
                            ? 'Téléchargement en cours...' 
                            : 'Télécharger Instant-Meteo.apk (29 Ko)'}
                        </span>
                      </button>

                      <a
                        href="/Instant-Meteo.apk"
                        download="Instant-Meteo.apk"
                        className="flex items-center gap-2 px-4 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold text-xs border border-slate-700 transition cursor-pointer"
                      >
                        <ExternalLink className="h-4 w-4 text-purple-400" />
                        <span>Lien de secours direct</span>
                      </a>

                      <button
                        onClick={handleCopyApkLink}
                        className="flex items-center gap-2 px-4 py-3.5 rounded-2xl bg-slate-850 hover:bg-slate-800 text-slate-300 font-bold text-xs border border-slate-750 transition cursor-pointer"
                      >
                        {copiedApkUrl ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4 text-purple-400" />}
                        <span>{copiedApkUrl ? 'Lien copié !' : 'Copier l\'adresse du fichier APK'}</span>
                      </button>
                    </div>

                    {apkDownloadSuccess && (
                      <div className="mt-3 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span>Téléchargement initié avec succès ! Ouvrez le fichier téléchargé sur votre smartphone pour lancer l'installation.</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Step by step installation guide */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5 space-y-4">
                <h4 className="font-black text-sm text-white flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-purple-400" />
                  Guide d'installation pas à pas sur votre téléphone Android :
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="h-6 w-6 rounded-lg bg-purple-600 text-white font-black text-xs flex items-center justify-center">1</span>
                      <strong className="text-white">Télécharger le fichier</strong>
                    </div>
                    <p className="text-slate-400 leading-relaxed">
                      Cliquez sur le bouton violet ci-dessus. Le fichier <code className="text-purple-300">Instant-Meteo.apk</code> se télécharge en 1 seconde.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="h-6 w-6 rounded-lg bg-purple-600 text-white font-black text-xs flex items-center justify-center">2</span>
                      <strong className="text-white">Autoriser la source</strong>
                    </div>
                    <p className="text-slate-400 leading-relaxed">
                      Touchez la notification. Si Android affiche <em>« Fichier potentiellement dangereux »</em> ou <em>« Bloqué par Play Protect »</em>, cliquez sur <strong>Détails ➔ Installer quand même</strong> (ou activez « Autoriser cette source »).
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="h-6 w-6 rounded-lg bg-emerald-600 text-white font-black text-xs flex items-center justify-center">3</span>
                      <strong className="text-white">Installer & Lancer</strong>
                    </div>
                    <p className="text-slate-400 leading-relaxed">
                      Validez <strong>« Installer »</strong>. L'icône <em>Instant Météo</em> s'ajoute sur votre écran d'accueil avec son affichage fluide et ses alertes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Android Chrome PWA */}
          {activeTab === 'android' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 p-4 sm:p-5">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                    <Smartphone className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-black text-white">
                      Installer sur Smartphone Android via le Navigateur (PWA)
                    </h3>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      Installez l'application en 1 clic sans passer par le Play Store. Elle fonctionne en <strong>mode autonome plein écran</strong> et se met à jour automatiquement en temps réel.
                    </p>

                    {isInstallable && (
                      <button
                        onClick={handleInstallPWA}
                        className="mt-3.5 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition shadow-lg shadow-emerald-600/30 active:scale-95 cursor-pointer"
                      >
                        <Download className="h-4 w-4" />
                        <span>Installer Instant Météo directement sur cet appareil Android</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Step by step cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-600 text-white font-black text-xs">1</span>
                    <Globe className="h-5 w-5 text-emerald-400" />
                  </div>
                  <h4 className="font-black text-sm text-white">Ouvrir dans Chrome</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Ouvrez le lien dans le navigateur <strong>Google Chrome</strong> ou <strong>Samsung Internet</strong> sur votre téléphone Android.
                  </p>
                </div>

                <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/20 p-4 space-y-3 ring-1 ring-emerald-500/20">
                  <div className="flex items-center justify-between">
                    <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-500 text-white font-black text-xs">2</span>
                    <span className="text-emerald-300 font-bold text-sm">⋮</span>
                  </div>
                  <h4 className="font-black text-sm text-white">Menu Options (3 points)</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Appuyez sur les <strong>3 petits points verticaux ⋮</strong> en haut à droite de l'écran du navigateur.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-600 text-white font-black text-xs">3</span>
                    <CheckCircle2 className="h-5 w-5 text-blue-400" />
                  </div>
                  <h4 className="font-black text-sm text-white">« Installer l'application »</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Sélectionnez <strong>« Installer l'application »</strong> (ou « Ajouter à l'écran d'accueil »). L'icône est créée instantanément.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: iOS iPhone & iPad */}
          {activeTab === 'ios' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-950/40 via-slate-900 to-indigo-950/40 p-4 sm:p-5">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                    <Apple className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">
                      Installer sur iPhone ou iPad (Sans passer par l'App Store)
                    </h3>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      L'application utilise la technologie officielle <strong>Apple Progressive Web App (PWA)</strong>. Une fois ajoutée, elle s'ouvre directement en <strong>plein écran complet</strong>, sans barre d'adresse Safari, avec son icône dédiée sur votre écran d'accueil et des performances ultra-rapides.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step by step cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 space-y-3 relative">
                  <div className="flex items-center justify-between">
                    <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-600 text-white font-black text-xs">1</span>
                    <Share2 className="h-5 w-5 text-blue-400" />
                  </div>
                  <h4 className="font-black text-sm text-white">Ouvrir dans Safari & Partager</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Ouvrez le lien dans <strong>Safari</strong> sur votre iPhone, puis touchez le bouton <strong>Partager</strong> en bas de l'écran (le carré avec la flèche vers le haut <span className="text-blue-400 font-bold">⎋</span>).
                  </p>
                </div>

                <div className="rounded-2xl border border-blue-500/40 bg-blue-950/20 p-4 space-y-3 relative ring-1 ring-blue-500/20">
                  <div className="flex items-center justify-between">
                    <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-500 text-white font-black text-xs">2</span>
                    <Sparkles className="h-5 w-5 text-blue-300" />
                  </div>
                  <h4 className="font-black text-sm text-white">« Sur l'écran d'accueil »</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Faites défiler le menu vers le bas et touchez l'option <strong>« Sur l'écran d'accueil »</strong> (icône <strong className="text-blue-300">➕</strong>).
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 space-y-3 relative">
                  <div className="flex items-center justify-between">
                    <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-600 text-white font-black text-xs">3</span>
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  </div>
                  <h4 className="font-black text-sm text-white">Confirmer & Profiter</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Touchez <strong>« Ajouter »</strong> en haut à droite. Instant Météo est désormais installée sur votre iPhone en grand écran natif !
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PC & Grand Écran */}
          {activeTab === 'fullscreen' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950 p-4 sm:p-5">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                    <Monitor className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-black text-white">
                      Affichage Grand Écran & Mode Observatoire
                    </h3>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      Profitez des cartes radars Doppler en ultra haute résolution, des synoptiques 14 jours et des bulletins sur grand moniteur, télévision connectée ou ordinateur portable.
                    </p>

                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        onClick={onToggleFullscreen}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition shadow-lg shadow-amber-500/30 active:scale-95 cursor-pointer"
                      >
                        <Maximize2 className="h-4 w-4" />
                        <span>Bascule Plein Écran (Touche F11)</span>
                      </button>

                      <button
                        onClick={handleOpenNewTab}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-white font-black text-xs border border-slate-700 transition cursor-pointer"
                      >
                        <ExternalLink className="h-4 w-4 text-blue-400" />
                        <span>Ouvrir dans un Nouvel Onglet dédié</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl border border-slate-800 bg-slate-950/70">
                  <h4 className="font-bold text-white mb-1">Raccourci Clavier Universel</h4>
                  <p className="text-slate-400">
                    Appuyez sur la touche <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-white font-mono">F11</kbd> de votre clavier pour passer ou quitter le plein écran à tout moment.
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl border border-slate-800 bg-slate-950/70">
                  <h4 className="font-bold text-white mb-1">Télévision & Chromecast</h4>
                  <p className="text-slate-400">
                    Vous pouvez caster l'onglet ou l'ouvrir directement sur le navigateur de votre Smart TV pour un affichage continu en direct 24h/24.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* QR Code & Direct Phone Sharing Section */}
          <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <QrCode className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">
                    Scanner avec l'appareil photo de votre téléphone
                  </h4>
                  <p className="text-xs text-slate-400">
                    Pointez l'appareil photo de votre smartphone vers ce code pour ouvrir l'application immédiatement
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyLink}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
                    copied
                      ? 'bg-emerald-600 text-white border-emerald-500'
                      : 'bg-slate-850 hover:bg-slate-800 text-slate-200 border-slate-700'
                  }`}
                >
                  {copied ? <Check className="h-4 w-4 text-white" /> : <Copy className="h-4 w-4 text-blue-400" />}
                  <span>{copied ? 'Lien copié !' : 'Copier le lien direct'}</span>
                </button>

                <button
                  onClick={handleShareNative}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition shadow shadow-blue-600/30 cursor-pointer"
                >
                  <Share2 className="h-4 w-4" />
                  <span>Partager</span>
                </button>
              </div>
            </div>

            {/* QR Code container & link display */}
            <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-900/90 rounded-2xl p-4 border border-slate-800">
              <div className="p-3 bg-white rounded-2xl shadow-md shrink-0">
                <QRCodeSVG
                  value={appUrl}
                  size={110}
                  level="M"
                  includeMargin={false}
                />
              </div>

              <div className="space-y-1.5 flex-1 text-center sm:text-left overflow-hidden w-full">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Adresse URL Web Mobile :
                </span>
                <div className="font-mono text-xs text-blue-300 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 truncate select-all">
                  {appUrl}
                </div>
                <p className="text-[11px] text-slate-400">
                  ⚡ Compatible tous téléphones : Apple iOS (iPhone/iPad), Android (Samsung, Xiaomi, Google Pixel, etc.) et tablettes.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 bg-slate-950 p-4 px-6 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Instant Météo • Haute Disponibilité
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow-md shadow-blue-600/30 cursor-pointer"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
};
