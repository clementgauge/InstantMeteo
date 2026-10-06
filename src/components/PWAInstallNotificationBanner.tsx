import React, { useEffect, useState } from 'react';
import { Download, Smartphone, Monitor, X, Share2, CheckCircle2, BellRing, Sparkles, MoreVertical } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { getCurrentVersionSignature, getUpdateSignature, AppVersionInfo } from '../services/appUpdateCheckerService';

interface PWAInstallNotificationBannerProps {
  onOpenInstallModal?: () => void;
}

const DISMISSED_INSTALL_SIG_KEY = 'instant_meteo_install_notif_dismissed_sig';

export const PWAInstallNotificationBanner: React.FC<PWAInstallNotificationBannerProps> = ({
  onOpenInstallModal,
}) => {
  const { isInstallable, isInstalled, isIOS, deviceProfile, install } = usePWAInstall();
  const [visible, setVisible] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showAndroidGuide, setShowAndroidGuide] = useState(false);
  const [downloadTriggered, setDownloadTriggered] = useState(false);
  const [currentVersionSig, setCurrentVersionSig] = useState<string>('default-v2.5.0');

  useEffect(() => {
    if (isInstalled) {
      setVisible(false);
      return;
    }

    let cancelled = false;
    let timer: number | null = null;

    getCurrentVersionSignature().then((sig) => {
      if (cancelled) return;
      setCurrentVersionSig(sig);

      try {
        const dismissedSig = localStorage.getItem(DISMISSED_INSTALL_SIG_KEY);
        // Si l'utilisateur a déjà cliqué sur OK pour cette version précise, on n'affiche plus la notif
        // sauf s'il y a une mise à jour différente (nouvelle signature de version)
        if (dismissedSig && dismissedSig === sig) {
          return;
        }
      } catch {
        // ignore storage restriction
      }

      timer = window.setTimeout(() => {
        if (cancelled) return;
        setVisible(true);

        try {
          if (
            typeof window !== 'undefined' &&
            'Notification' in window &&
            Notification.permission === 'granted' &&
            localStorage.getItem('instant_meteo_native_install_sig') !== sig
          ) {
            localStorage.setItem('instant_meteo_native_install_sig', sig);
            const n = new Notification('Instant Météo — Application PWA disponible', {
              body: deviceProfile.isMobile
                ? `Installez l'application PWA Instant Météo avec son logo officiel sur votre téléphone (${deviceProfile.osName}).`
                : `Installez l'application Instant Météo sur votre ordinateur (${deviceProfile.osName}) via ${deviceProfile.browserName}.`,
              icon: '/icon-192.png',
              badge: '/icon-192.png',
              tag: 'instant-meteo-install-offer',
            });
            n.onclick = () => {
              window.focus();
              handlePrimaryInstallAction();
              n.close();
            };
          }
        } catch {
          // Ignore if native Notification constructor is restricted
        }
      }, 1500);
    });

    // Si une nouvelle mise à jour différente arrive en direct, réautoriser la proposition si l'app n'est pas installée
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
  }, [isInstalled, deviceProfile]);

  const handleDismiss = () => {
    setVisible(false);
    setShowAndroidGuide(false);
    setShowIOSGuide(false);
    try {
      localStorage.setItem(DISMISSED_INSTALL_SIG_KEY, currentVersionSig);
    } catch {
      // ignore
    }
  };

  const triggerDirectFileDownload = (url: string, filename: string) => {
    try {
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => document.body.removeChild(a), 500);
      setDownloadTriggered(true);
      setTimeout(() => {
        handleDismiss();
      }, 2200);
    } catch {
      if (onOpenInstallModal) onOpenInstallModal();
    }
  };

  const handlePrimaryInstallAction = async () => {
    // 1. Native Chromium / Android / Desktop PWA prompt (Chrome, Edge, Brave, Opera when beforeinstallprompt is ready)
    if (isInstallable) {
      const accepted = await install();
      if (accepted) {
        setDownloadTriggered(true);
        setTimeout(() => handleDismiss(), 1500);
        return;
      }
    }

    // 2. iOS Safari / iPhone / iPad (PWA)
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }

    // 3. Android / Téléphone (PWA officielle avec logo sur l'écran d'accueil)
    if (deviceProfile.isAndroid || deviceProfile.isMobile) {
      setShowAndroidGuide(true);
      return;
    }

    // 4. PC Firefox -> Direct Firefox/Windows launcher download + open modal
    if (deviceProfile.isFirefox && !deviceProfile.isMobile) {
      triggerDirectFileDownload('/Instant-Meteo-Firefox.cmd', 'Instant-Meteo-Firefox.cmd');
      if (onOpenInstallModal) onOpenInstallModal();
      return;
    }

    // 5. PC Windows / Mac / Other browsers -> Direct Windows launcher download + open modal
    if (!deviceProfile.isMobile) {
      triggerDirectFileDownload('/Instant-Meteo-Windows.cmd', 'Instant-Meteo-Windows.cmd');
      if (onOpenInstallModal) onOpenInstallModal();
      return;
    }

    if (onOpenInstallModal) {
      onOpenInstallModal();
    }
  };

  if (isInstalled || !visible) return null;

  return (
    <>
      {/* Browser & System Style Notification Banner (Top-Right on PC, Top Floating on Mobile) */}
      <div
        role="region"
        aria-label="Notification d'installation de l'application PWA Instant Météo"
        className="fixed top-16 sm:top-20 right-2.5 sm:right-5 left-2.5 sm:left-auto z-[9990] sm:w-[420px] rounded-2xl border border-blue-500/40 bg-slate-950/95 dark:bg-slate-950/95 text-white p-3.5 sm:p-4 shadow-2xl shadow-blue-950/60 backdrop-blur-2xl animate-in slide-in-from-top-4 duration-300"
      >
        <div className="flex items-start gap-3">
          {/* Official App Logo with PWA Badge */}
          <div className="relative shrink-0">
            <img
              src="/icon-192.png"
              alt="Logo Officiel Instant Météo PWA"
              className="w-12 h-12 rounded-2xl border-2 border-blue-400/50 shadow-lg shadow-blue-500/20 object-cover bg-slate-900"
            />
            <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-md bg-gradient-to-r from-emerald-500 to-teal-500 text-[8px] font-black uppercase text-white ring-2 ring-slate-950 shadow">
              PWA
            </span>
            <span className="absolute -top-1 -left-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-white ring-2 ring-slate-950">
              <BellRing className="w-2.5 h-2.5 animate-bounce" />
            </span>
          </div>

          {/* Notification Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-sky-400">
                {deviceProfile.isMobile ? (
                  <Smartphone className="w-3 h-3 text-sky-400" />
                ) : (
                  <Monitor className="w-3 h-3 text-sky-400" />
                )}
                <span>
                  {deviceProfile.browserName} &bull; {deviceProfile.osName} &bull; Application PWA
                </span>
              </span>
              <button
                type="button"
                onClick={handleDismiss}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition cursor-pointer"
                title="Fermer jusqu'à la prochaine mise à jour"
                aria-label="Fermer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <h4 className="text-xs sm:text-sm font-black text-white leading-snug mt-0.5">
              {deviceProfile.isMobile
                ? 'Installer l’application PWA Instant Météo'
                : 'Installer l’application Instant Météo'}
            </h4>
            <p className="text-[11px] text-slate-300 leading-snug mt-0.5">
              {deviceProfile.isMobile
                ? `Ajoutez l'application PWA officielle avec le logo Instant Météo sur l'écran d'accueil de votre téléphone (${deviceProfile.browserName}) en 1 clic, sans fichier APK.`
                : isInstallable
                ? `Installez l'application PWA avec le logo officiel depuis ${deviceProfile.browserName} (${deviceProfile.osName}) pour un accès direct.`
                : `Téléchargez et installez l'application Instant Météo avec son logo officiel sur ${deviceProfile.osName} (${deviceProfile.browserName}).`}
            </p>

            {/* Action Buttons: Installer PWA + Bouton OK + Options */}
            <div className="flex items-center gap-2 mt-2.5">
              <button
                type="button"
                onClick={handlePrimaryInstallAction}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 px-3 py-1.5 text-xs font-black text-white shadow-md shadow-blue-600/30 transition active:scale-95 cursor-pointer"
              >
                {downloadTriggered ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
                    <span>Installation PWA lancée !</span>
                  </>
                ) : (
                  <>
                    <img src="/icon-192.png" alt="" className="w-4 h-4 rounded-md object-cover border border-white/30" />
                    <span>
                      {deviceProfile.isMobile
                        ? 'Installer la PWA'
                        : isInstallable
                        ? 'Installer l’application PWA'
                        : 'Télécharger sur PC'}
                    </span>
                  </>
                )}
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
                  <span>Guide</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Téléphone Android (Brave / Chrome / Firefox / Samsung) — Installation PWA Officielle avec Logo */}
      {showAndroidGuide && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-emerald-500/40 bg-slate-900 p-5 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <img
                    src="/icon-192.png"
                    alt="Logo Officiel Instant Météo"
                    className="w-12 h-12 rounded-2xl border-2 border-emerald-400/50 shadow-lg object-cover"
                  />
                  <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded bg-emerald-600 text-[9px] font-black text-white">
                    PWA
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">
                    Application PWA Instant Météo ({deviceProfile.browserName})
                  </h3>
                  <p className="text-[11px] text-emerald-400 font-semibold">
                    Installation directe avec le logo officiel sur votre écran d’accueil
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAndroidGuide(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Aperçu visuel de l'icône PWA avec le logo sur le téléphone */}
            <div className="flex items-center gap-3.5 rounded-xl bg-slate-950/90 border border-slate-800 p-3">
              <img
                src="/icon-512.png"
                alt="Icône Instant Météo"
                className="w-14 h-14 rounded-2xl border border-blue-400/40 shadow-md object-cover shrink-0"
              />
              <div className="space-y-0.5">
                <div className="inline-flex items-center gap-1.5 text-xs font-black text-white">
                  <span>Logo officiel Instant Météo</span>
                  <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-bold">
                    Sans fichier APK
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-snug">
                  L’application <strong>PWA</strong> s’installe instantanément avec son vrai logo sur votre téléphone, en plein écran et sans erreur d’analyse de package.
                </p>
              </div>
            </div>

            {isInstallable && (
              <button
                type="button"
                onClick={async () => {
                  const ok = await install();
                  if (ok) handleDismiss();
                }}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 py-3 px-4 text-xs font-black text-white shadow-lg shadow-emerald-600/30 transition cursor-pointer"
              >
                <img src="/icon-192.png" alt="" className="w-4 h-4 rounded object-cover" />
                <span>Installer la PWA maintenant (1 clic)</span>
              </button>
            )}

            {/* Étapes d'installation PWA sur Brave, Chrome, Firefox */}
            <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/30 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Installation PWA sur {deviceProfile.browserName}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                  100% Compatible
                </span>
              </div>
              <div className="space-y-2 text-xs text-slate-100 bg-slate-950/80 p-3 rounded-lg border border-slate-800">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-black text-white">
                    1
                  </span>
                  <span>
                    Appuyez sur le menu{' '}
                    <strong className="inline-flex items-center px-1.5 py-0.5 rounded bg-slate-800 text-amber-300">
                      <MoreVertical className="w-3.5 h-3.5" /> (3 points)
                    </strong>{' '}
                    en bas ou en haut à droite de <strong>{deviceProfile.browserName}</strong>.
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-black text-white">
                    2
                  </span>
                  <span>
                    Appuyez sur <strong>« Installer l’application »</strong> ou <strong>« Ajouter à l’écran d’accueil »</strong> pour placer le logo <strong>Instant Météo</strong> sur votre téléphone.
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDismiss}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 py-2.5 text-xs font-black text-white transition cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>OK</span>
              </button>
              <button
                type="button"
                onClick={() => setShowAndroidGuide(false)}
                className="rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-2.5 text-xs font-bold text-slate-200 transition cursor-pointer"
              >
                Retour
              </button>
            </div>
          </div>
        </div>
      )}

      {/* iOS Safari Guided PWA Install Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-900 p-5 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img src="/icon-192.png" alt="Logo Officiel Instant Météo" className="w-11 h-11 rounded-2xl border border-blue-400/40" />
                <div>
                  <h3 className="text-sm font-black text-white">Installer la PWA sur iPhone / iPad</h3>
                  <p className="text-[11px] text-sky-400 font-semibold">Application PWA avec logo officiel</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-slate-200 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[11px] font-black text-white">
                  1
                </span>
                <span>
                  Appuyez sur le bouton <strong>Partager</strong>{' '}
                  <Share2 className="inline w-3.5 h-3.5 text-sky-400 mx-0.5" /> dans la barre de votre navigateur.
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[11px] font-black text-white">
                  2
                </span>
                <span>
                  Appuyez sur <strong>« Sur l’écran d’accueil »</strong> pour installer la PWA avec le logo <strong>Instant Météo</strong>.
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDismiss}
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 py-2.5 text-xs font-black text-white transition cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>OK</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};
