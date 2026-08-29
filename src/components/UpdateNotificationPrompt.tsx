import React, { useState, useEffect } from 'react';
import { Bell, BellRing, Check, X, Sparkles, ShieldCheck } from 'lucide-react';

interface UpdateNotificationPromptProps {
  onEnableNotifications?: () => void;
  isDirectPage?: boolean;
}

export const UpdateNotificationPrompt: React.FC<UpdateNotificationPromptProps> = ({
  onEnableNotifications,
  isDirectPage = true
}) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isGranted, setIsGranted] = useState<boolean>(false);

  useEffect(() => {
    // Check if user already dismissed or granted notifications
    try {
      const status = localStorage.getItem('instant_meteo_notif_prompt_status');
      if (!status && isDirectPage) {
        // Show banner smoothly after 2 seconds on the direct page
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 2200);
        return () => clearTimeout(timer);
      }
    } catch (e) {
      console.warn('Notification prompt check note:', e);
    }
  }, [isDirectPage]);

  if (!isVisible) return null;

  const handleAccept = async () => {
    try {
      if ('Notification' in window) {
        const perm = await Notification.requestPermission();
        if (perm === 'granted') {
          setIsGranted(true);
        }
      }
      localStorage.setItem('instant_meteo_notif_prompt_status', 'accepted');
      if (onEnableNotifications) {
        onEnableNotifications();
      }
      setTimeout(() => {
        setIsVisible(false);
      }, 1500);
    } catch (err) {
      console.warn('Notification request error:', err);
      localStorage.setItem('instant_meteo_notif_prompt_status', 'accepted');
      setIsVisible(false);
    }
  };

  const handleDismiss = () => {
    try {
      localStorage.setItem('instant_meteo_notif_prompt_status', 'dismissed');
    } catch (e) {}
    setIsVisible(false);
  };

  return (
    <aside
      aria-label="Notification de mise à jour"
      className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 max-w-sm sm:max-w-md w-[calc(100%-2rem)] rounded-3xl border border-amber-500/40 bg-slate-900/95 p-4 sm:p-5 shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-5 duration-300"
    >
      <div className="flex items-start gap-3.5">
        <div className="rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 p-2.5 text-slate-950 font-black shadow-lg shadow-amber-500/20 shrink-0">
          <BellRing className="h-5 w-5 animate-bounce" />
        </div>

        <div className="flex-1 space-y-1.5 pr-4">
          <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Alertes &amp; Mises à jour en direct</span>
          </div>

          <h4 className="text-sm font-black text-white leading-snug">
            Recevoir les alertes de mise à jour &amp; améliorations du site ?
          </h4>

          <p className="text-xs text-slate-300 leading-relaxed">
            {isGranted ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <Check className="h-3.5 w-3.5" /> Notifications de mise à jour activées avec succès !
              </span>
            ) : (
              "Voulez-vous recevoir une notification lorsqu’il y a une mise à jour, un changement ou une amélioration du site pour être averti des nouveautés et des alertes météo en direct ?"
            )}
          </p>

          {!isGranted && (
            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={handleAccept}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition active:scale-95 cursor-pointer"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Oui, m'alerter</span>
              </button>

              <button
                type="button"
                onClick={handleDismiss}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
              >
                Plus tard
              </button>
            </div>
          )}
        </div>

        {/* Close */}
        <button
          onClick={handleDismiss}
          className="rounded-full p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition cursor-pointer"
          title="Fermer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
};
