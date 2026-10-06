import React, { useEffect, useState } from 'react';
import { Download, Smartphone, Monitor, X, Share2, CheckCircle2, BellRing, Sparkles, MoreVertical } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallNotificationBannerProps {
  onOpenInstallModal?: () => void;
}

const DISMISS_SESSION_KEY = 'instant_meteo_install_notif_dismissed_session';

export const PWAInstallNotificationBanner: React.FC<PWAInstallNotificationBannerProps> = ({
  onOpenInstallModal,
}) => {
  const { isInstallable, isInstalled, isIOS, deviceProfile, install } = usePWAInstall();
  const [visible, setVisible] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showAndroidGuide, setShowAndroidGuide] = useState(false);
  const [downloadTriggered, setDownloadTriggered] = useState(false);

  useEffect(() => {
    if (isInstalled) {
      setVisible(false);
      return;
    }

    try {
      if (sessionStorage.getItem(DISMISS_SESSION_KEY) === '1') {
        return;
      }
    } catch {
      // ignore storage restriction
    }

    // Show the browser/system-style download notification after 1.5s on PC and Mobile (Chrome, Firefox, Brave, Edge, Safari, etc.)
    const timer = window.setTimeout(() => {
      setVisible(true);

      // If Web Notification permission is already granted by the browser, also fire a native system notification
      try {
        if (
          typeof window !== 'undefined' &&
          'Notification' in window &&
          Notification.permission === 'granted' &&
          !sessionStorage.getItem('instant_meteo_native_install_notified')
        ) {
          sessionStorage.setItem('instant_meteo_native_install_notified', '1');
          const n = new Notification('Instant Météo — Application disponible', {
            body: `Installez l'application Instant Météo sur votre ${
              deviceProfile.isMobile ? `téléphone (${deviceProfile.osName})` : `ordinateur (${deviceProfile.osName})`
            } via ${deviceProfile.browserName}.`,
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

    return () => clearTimeout(timer);
  }, [isInstalled, deviceProfile]);

  const handleDismiss = () => {
    setVisible(false);
    try {
      sessionStorage.setItem(DISMISS_SESSION_KEY, '1');
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
        setVisible(false);
        setShowAndroidGuide(false);
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
        setTimeout(() => setVisible(false), 1500);
        return;
      }
    }

    // 2. iOS Safari / iPhone / iPad
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }

    // 3. Android (Brave, Firefox, Chrome, Samsung Internet when beforeinstallprompt wasn't exposed)
    // Open the dedicated Android install helper (PWA 1-click via browser menu + direct signed APK option)
    if (deviceProfile.isAndroid) {
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
        aria-label="Notification d'installation de l'application Instant Météo"
        className="fixed top-16 sm:top-20 right-2.5 sm:right-5 left-2.5 sm:left-auto z-[9990] sm:w-[410px] rounded-2xl border border-blue-500/40 bg-slate-950/95 dark:bg-slate-950/95 text-white p-3.5 sm:p-4 shadow-2xl shadow-blue-950/60 backdrop-blur-2xl animate-in slide-in-from-top-4 duration-300"
      >
        <div className="flex items-start gap-3">
          {/* App Icon with Notification Badge */}
          <div className="relative shrink-0">
            <img
              src="/icon-192.png"
              alt="Instant Météo"
              className="w-11 h-11 rounded-xl border border-blue-400/40 shadow-md object-cover bg-slate-900"
            />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-white ring-2 ring-slate-950">
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
                  {deviceProfile.browserName} &bull; {deviceProfile.osName}
                </span>
              </span>
              <button
                type="button"
                onClick={handleDismiss}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition cursor-pointer"
                title="Fermer la notification"
                aria-label="Fermer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <h4 className="text-xs sm:text-sm font-black text-white leading-snug mt-0.5">
              Installer l’application Instant Météo
            </h4>
            <p className="text-[11px] text-slate-300 leading-snug mt-0.5">
              {isInstallable
                ? `Installez l'application en 1 clic depuis ${deviceProfile.browserName} (${deviceProfile.osName}) pour un accès direct et hors-ligne.`
                : deviceProfile.isAndroid
                ? `Installez l'application Instant Météo sur votre téléphone Android (${deviceProfile.browserName}) sans passer par le Play Store.`
                : isIOS
                ? `Ajoutez l'application Instant Météo sur l'écran d'accueil de votre ${deviceProfile.osName}.`
                : `Téléchargez l'application bureau Instant Météo pour ${deviceProfile.osName} (${deviceProfile.browserName}).`}
            </p>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 mt-2.5">
              <button
                type="button"
                onClick={handlePrimaryInstallAction}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 px-3 py-1.5 text-xs font-black text-white shadow-md shadow-blue-600/30 transition active:scale-95 cursor-pointer"
              >
                {downloadTriggered ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
                    <span>Installation lancée !</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>
                      {isInstallable
                        ? 'Installer l’application'
                        : deviceProfile.isAndroid
                        ? 'Installer sur Android'
                        : isIOS
                        ? 'Installer sur iPhone/iPad'
                        : 'Télécharger sur PC'}
                    </span>
                  </>
                )}
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

      {/* Android (Brave / Chrome / Firefox) Instant Install Modal */}
      {showAndroidGuide && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-blue-500/40 bg-slate-900 p-5 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img src="/icon-192.png" alt="Instant Météo" className="w-10 h-10 rounded-xl border border-blue-400/30" />
                <div>
                  <h3 className="text-sm font-black text-white">
                    Installer sur Android ({deviceProfile.browserName})
                  </h3>
                  <p className="text-[11px] text-sky-400 font-semibold">
                    2 méthodes rapides disponibles
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

            {/* Method 1: Direct Browser WebApp Install (Works 100% on Brave, Chrome, Firefox without APK parsing issues) */}
            <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/30 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Méthode 1 (Recommandée sur {deviceProfile.browserName})
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                  Sans erreur de package
                </span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                Installe directement l’application officielle depuis <strong>{deviceProfile.browserName}</strong> sans aucun blocage de sécurité Android :
              </p>
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
                    Appuyez sur <strong>« Installer l’application »</strong> ou <strong>« Ajouter à l’écran d’accueil »</strong>.
                  </span>
                </div>
              </div>
            </div>

            {/* Method 2: Signed Native APK Download */}
            <div className="rounded-xl border border-slate-700 bg-slate-950/70 p-3.5 space-y-2">
              <div className="text-[11px] font-bold text-slate-300">
                Méthode 2 : Télécharger le paquet APK Android signé (23 Mo)
              </div>
              <button
                type="button"
                onClick={() => triggerDirectFileDownload('/Instant-Meteo.apk', 'Instant-Meteo.apk')}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 py-2.5 px-4 text-xs font-black text-white shadow-md transition cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Télécharger Instant-Meteo.apk (v2 signé)</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowAndroidGuide(false);
                handleDismiss();
              }}
              className="w-full rounded-xl bg-slate-800 hover:bg-slate-700 py-2 text-xs font-bold text-slate-200 transition cursor-pointer"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* iOS Safari Guided Install Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-900 p-5 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img src="/icon-192.png" alt="Instant Météo" className="w-9 h-9 rounded-xl" />
                <div>
                  <h3 className="text-sm font-black text-white">Installer sur iPhone / iPad</h3>
                  <p className="text-[11px] text-slate-400">Application Instant Météo (iOS)</p>
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
                  Faites défiler et appuyez sur <strong>« Sur l’écran d’accueil »</strong>.
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowIOSGuide(false);
                handleDismiss();
              }}
              className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 py-2.5 text-xs font-black text-white transition cursor-pointer"
            >
              J’ai compris
            </button>
          </div>
        </div>
      )}
    </>
  );
};
