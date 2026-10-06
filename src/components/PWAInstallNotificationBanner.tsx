import React, { useEffect, useState } from 'react';
import { Monitor, X, CheckCircle2, Sparkles } from 'lucide-react';
import { usePWAInstall, waitForNativePwaPrompt } from '../hooks/usePWAInstall';
import { getCurrentVersionSignature, getUpdateSignature, AppVersionInfo } from '../services/appUpdateCheckerService';

interface PWAInstallNotificationBannerProps {
  onOpenInstallModal?: () => void;
}

const DISMISSED_INSTALL_SIG_KEY = 'instant_meteo_install_notif_dismissed_sig';

export const PWAInstallNotificationBanner: React.FC<PWAInstallNotificationBannerProps> = ({
  onOpenInstallModal,
}) => {
  const { isInstalled } = usePWAInstall();
  const [visible, setVisible] = useState(false);
  const [showAddToAppsPrompt, setShowAddToAppsPrompt] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [downloadTriggered, setDownloadTriggered] = useState(false);
  const [currentVersionSig, setCurrentVersionSig] = useState<string>('default-v2.5.2');

  useEffect(() => {
    const handleOpenAddToApps = () => {
      // Masquer la bannière du haut pour ne jamais avoir 2 notifications affichées en même temps sur téléphone
      setVisible(false);
      setShowAddToAppsPrompt(true);
    };
    window.addEventListener('instant_meteo_show_add_to_apps_prompt', handleOpenAddToApps);
    return () => {
      window.removeEventListener('instant_meteo_show_add_to_apps_prompt', handleOpenAddToApps);
    };
  }, []);

  useEffect(() => {
    if (isInstalled) {
      setVisible(false);
      setShowAddToAppsPrompt(false);
      return;
    }

    let cancelled = false;
    let timer: number | null = null;

    getCurrentVersionSignature().then((sig) => {
      if (cancelled) return;
      setCurrentVersionSig(sig);

      try {
        const dismissedSig = localStorage.getItem(DISMISSED_INSTALL_SIG_KEY);
        if (dismissedSig && dismissedSig === sig) {
          return;
        }
      } catch {
        // ignore storage restriction
      }

      timer = window.setTimeout(() => {
        if (cancelled) return;
        // Une seule notification d'installation (pas de new Notification() système en doublon)
        setVisible(true);
      }, 1200);
    });

    const handleNewUpdate = (e: Event) => {
      const info = (e as CustomEvent<AppVersionInfo>).detail;
      if (info && !isInstalled) {
        const newSig = getUpdateSignature(info);
        setCurrentVersionSig(newSig);
        try {
          const dismissedSig = localStorage.getItem(DISMISSED_INSTALL_SIG_KEY);
          if (dismissedSig !== newSig) {
            setVisible(true);
          }
        } catch {
          setVisible(true);
        }
      }
    };

    window.addEventListener('instant_meteo_code_update_available', handleNewUpdate as EventListener);

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      window.removeEventListener('instant_meteo_code_update_available', handleNewUpdate as EventListener);
    };
  }, [isInstalled]);

  const handleDismiss = () => {
    setVisible(false);
    setShowAddToAppsPrompt(false);
    try {
      localStorage.setItem(DISMISSED_INSTALL_SIG_KEY, currentVersionSig);
    } catch {
      // ignore
    }
  };

  const handlePrimaryInstallAction = async () => {
    // Masquer immédiatement la bannière pour qu'il n'y ait jamais 2 notifications d'installation en même temps
    setVisible(false);

    // 1. Sur Chrome, Brave, Samsung Internet, Edge et Opera : utiliser l'invite native beforeinstallprompt
    // ("Ajouter ce site Web à l'écran Applis ?") dès qu'elle est disponible
    const nativePrompt =
      (typeof window !== 'undefined' ? window.__deferredPwaPrompt : null) ||
      (await waitForNativePwaPrompt(600));

    if (nativePrompt) {
      try {
        await nativePrompt.prompt();
        const { outcome } = await nativePrompt.userChoice;
        if (outcome === 'accepted') {
          window.__deferredPwaPrompt = null;
          setDownloadTriggered(true);
          handleDismiss();
          return;
        }
        return;
      } catch {
        // En cas d'erreur de prompt natif, basculer sur la boîte de dialogue "Ajouter ce site Web à l'écran Applis ?"
      }
    }

    // 2. Sinon, afficher la boîte de dialogue "Ajouter ce site Web à l'écran Applis ?"
    setShowAddToAppsPrompt(true);
  };

  const handleConfirmAddToApps = async () => {
    const nativePrompt =
      (typeof window !== 'undefined' ? window.__deferredPwaPrompt : null) ||
      (await waitForNativePwaPrompt(400));

    if (nativePrompt) {
      try {
        await nativePrompt.prompt();
        const { outcome } = await nativePrompt.userChoice;
        if (outcome === 'accepted') {
          window.__deferredPwaPrompt = null;
          setAddedSuccess(true);
          setDownloadTriggered(true);
          setTimeout(() => {
            setAddedSuccess(false);
            handleDismiss();
          }, 1000);
          return;
        }
      } catch {
        // ignore
      }
    }

    try {
      if ('serviceWorker' in navigator) {
        await navigator.serviceWorker.register('/service-worker.js', { scope: '/' });
      }
    } catch {
      // ignore
    }

    setAddedSuccess(true);
    setDownloadTriggered(true);
    setTimeout(() => {
      setAddedSuccess(false);
      handleDismiss();
    }, 1200);
  };

  return (
    <>
      {!isInstalled && visible && !showAddToAppsPrompt && (
        <div
          role="region"
          aria-label="Notification d'installation de l'application PWA Instant Météo"
          className="fixed top-12 sm:top-20 right-2 sm:right-5 left-2 sm:left-auto z-[9990] sm:w-[390px] rounded-xl sm:rounded-2xl border border-blue-500/40 bg-slate-950/95 text-white px-2 py-1.5 sm:p-3.5 shadow-xl shadow-blue-950/60 backdrop-blur-2xl animate-in slide-in-from-top-4 duration-300"
        >
          <div className="flex items-center sm:items-start gap-2 sm:gap-3">
            {/* Official App Logo with PWA Badge */}
            <div className="relative shrink-0">
              <img
                src="/icon-192.png"
                alt="Logo Officiel Instant Météo PWA"
                className="w-7 h-7 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl border border-blue-400/50 shadow-md object-cover bg-slate-900"
              />
              <span className="absolute -bottom-0.5 -right-0.5 px-1 py-0 rounded bg-gradient-to-r from-emerald-500 to-teal-500 text-[6px] sm:text-[8px] font-black uppercase text-white ring-1 ring-slate-950 shadow">
                PWA
              </span>
            </div>

            {/* Notification Content */}
            <div className="flex-1 min-w-0">
              <div className="hidden sm:flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-sky-400">
                  <Monitor className="w-3 h-3 text-sky-400" />
                  <span>Application PWA Instant Météo</span>
                </span>
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="rounded-lg p-0.5 text-slate-400 hover:bg-slate-800 hover:text-white transition cursor-pointer"
                  title="Fermer jusqu'à la prochaine mise à jour"
                  aria-label="Fermer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center justify-between gap-1.5 sm:block">
                <div className="min-w-0 flex-1">
                  <h4 className="text-[11px] sm:text-xs font-black text-white leading-tight truncate">
                    Installer l’application en PWA
                  </h4>
                  <p className="hidden sm:block text-[11px] text-slate-300 leading-tight mt-0.5">
                    Ajoutez Instant Météo avec son logo officiel sur votre écran d’applis.
                  </p>
                </div>

                {/* Mobile inline compact buttons (1 single slim line) */}
                <div className="flex sm:hidden items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={handlePrimaryInstallAction}
                    className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-blue-600 to-sky-500 px-2.5 py-1 text-[10px] font-black text-white shadow cursor-pointer active:scale-95"
                  >
                    <img src="/icon-192.png" alt="" className="w-3 h-3 rounded-sm object-cover" />
                    <span>{downloadTriggered ? 'Ajouté' : 'Installer en PWA'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDismiss}
                    className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-2 py-1 text-[10px] font-black text-white shadow cursor-pointer active:scale-95"
                    title="OK — Ne plus afficher sauf mise à jour différente"
                  >
                    OK
                  </button>
                </div>
              </div>

              {/* Desktop Action Buttons */}
              <div className="hidden sm:flex items-center gap-2 mt-2">
                <button
                  type="button"
                  onClick={handlePrimaryInstallAction}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 px-3 py-1.5 text-xs font-black text-white shadow-md shadow-blue-600/30 transition active:scale-95 cursor-pointer"
                >
                  <img src="/icon-192.png" alt="" className="w-4 h-4 rounded-md object-cover border border-white/30" />
                  <span>{downloadTriggered ? 'Application PWA ajoutée !' : 'Installer en PWA'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDismiss}
                  className="inline-flex items-center justify-center gap-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-xs font-black text-white shadow-md shadow-emerald-600/25 transition active:scale-95 cursor-pointer shrink-0"
                  title="OK — Ne plus afficher cette notification sauf lors d'une prochaine mise à jour différente"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>OK</span>
                </button>

                {onOpenInstallModal && (
                  <button
                    type="button"
                    onClick={() => {
                      handleDismiss();
                      onOpenInstallModal();
                    }}
                    className="inline-flex items-center justify-center gap-1 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 px-2.5 py-1.5 text-[11px] font-bold text-slate-200 transition cursor-pointer shrink-0"
                  >
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>Options</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Boîte de dialogue système : "Ajouter ce site Web à l'écran Applis ?" */}
      {showAddToAppsPrompt && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="pwa-add-to-apps-title"
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="w-full max-w-sm rounded-2xl border border-slate-700/80 bg-slate-900 p-5 text-white shadow-2xl space-y-4">
            <h3 id="pwa-add-to-apps-title" className="text-base font-black text-white leading-snug">
              Ajouter ce site Web à l'écran Applis ?
            </h3>

            <div className="flex items-center gap-3.5 rounded-xl bg-slate-950/90 border border-slate-800 p-3">
              <img
                src="/icon-192.png"
                alt="Logo Officiel Instant Météo"
                className="w-12 h-12 rounded-xl border border-blue-400/40 shadow-md object-cover shrink-0 bg-slate-900"
              />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-black text-white truncate">
                  Instant Météo
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  {typeof window !== 'undefined' ? window.location.host : 'instantmeteo.instantmeteofr.workers.dev'}
                </div>
              </div>
            </div>

            {addedSuccess ? (
              <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-950/80 border border-emerald-500/40 p-2.5 text-xs font-bold text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Application PWA ajoutée à l'écran Applis !</span>
              </div>
            ) : (
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddToAppsPrompt(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-800 transition cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAddToApps}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-black text-white shadow-lg shadow-blue-600/30 transition active:scale-95 cursor-pointer"
                >
                  <img src="/icon-192.png" alt="" className="w-3.5 h-3.5 rounded-sm object-cover" />
                  <span>Ajouter</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
