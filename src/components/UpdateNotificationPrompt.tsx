import React, { useState, useEffect } from 'react';
import { Bell, BellRing, Check, X, Sparkles, RefreshCw, Zap, ArrowRight, UserPlus, Crown, ShieldCheck } from 'lucide-react';
import { 
  onAppUpdateDetected, 
  applyAppUpdate, 
  AppVersionInfo, 
  sendSystemUpdateNotification 
} from '../services/appUpdateCheckerService';
import { loadPlayerProfile, PlayerProfile } from '../services/competitiveGameService';

interface UpdateNotificationPromptProps {
  onEnableNotifications?: () => void;
  isDirectPage?: boolean;
  onOpenPseudoModal?: () => void;
  onOpenAdminPanel?: () => void;
}

export const UpdateNotificationPrompt: React.FC<UpdateNotificationPromptProps> = ({
  onEnableNotifications,
  isDirectPage = true,
  onOpenPseudoModal,
  onOpenAdminPanel
}) => {
  const [detectedUpdate, setDetectedUpdate] = useState<AppVersionInfo | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isPromptVisible, setIsPromptVisible] = useState<boolean>(false);
  const [isGranted, setIsGranted] = useState<boolean>(false);
  const [profile, setProfile] = useState<PlayerProfile | null>(null);

  useEffect(() => {
    setProfile(loadPlayerProfile());
    const handleScoreUpdate = () => {
      setProfile(loadPlayerProfile());
    };
    window.addEventListener('instant_meteo_score_updated', handleScoreUpdate);
    return () => {
      window.removeEventListener('instant_meteo_score_updated', handleScoreUpdate);
    };
  }, []);

  useEffect(() => {
    // 1. Écoute obligatoire des mises à jour du code en direct
    const unsubscribe = onAppUpdateDetected((info) => {
      console.log('[UpdateNotificationPrompt] Détection mise à jour obligatoire:', info);
      setDetectedUpdate(info);
      // Tentative de notification système native si permise
      sendSystemUpdateNotification(info);
    });

    // 2. Vérification prompt initial pour autoriser les notifications
    try {
      const status = localStorage.getItem('instant_meteo_notif_prompt_status');
      if (!status && isDirectPage) {
        const timer = setTimeout(() => {
          setIsPromptVisible(true);
        }, 2500);
        return () => {
          clearTimeout(timer);
          unsubscribe();
        };
      }
    } catch (e) {
      console.warn('Notification prompt note:', e);
    }

    return () => unsubscribe();
  }, [isDirectPage]);

  // Si une mise à jour est détectée : affichage OBLIGATOIRE
  if (detectedUpdate) {
    return (
      <aside
        aria-label="Mise à jour du site disponible"
        className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 max-w-sm sm:max-w-md w-[calc(100%-2rem)] rounded-3xl border-2 border-cyan-400 bg-slate-950/95 p-5 shadow-2xl shadow-cyan-500/20 backdrop-blur-2xl animate-in slide-in-from-bottom-5 duration-300 ring-4 ring-cyan-500/20"
      >
        <div className="flex items-start gap-3.5">
          <div className="rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 p-2.5 text-white font-black shadow-lg shadow-cyan-500/30 shrink-0">
            <Zap className="h-6 w-6 animate-pulse text-amber-300" />
          </div>

          <div className="flex-1 space-y-2 pr-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40 text-[10px] font-black uppercase tracking-wider">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
                Mise à jour du code détectée
              </span>
              <span className="text-[11px] font-mono text-slate-400">v{detectedUpdate.version}</span>
            </div>

            <h4 className="text-sm font-black text-white leading-snug">
              Une nouvelle version du site est disponible !
            </h4>

            <p className="text-xs text-slate-300 leading-relaxed">
              Le code a été actualisé en direct sur les serveurs. Cliquez ci-dessous pour recharger l'application et appliquer immédiatement les nouveautés.
            </p>

            {detectedUpdate.changelog && (
              <div className="text-[11px] text-slate-400 bg-slate-900 p-2 rounded-xl border border-slate-800">
                ✨ {detectedUpdate.changelog}
              </div>
            )}

            <div className="pt-2 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={async () => {
                  setIsUpdating(true);
                  await applyAppUpdate();
                }}
                disabled={isUpdating}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-xs shadow-lg shadow-cyan-600/30 transition cursor-pointer active:scale-95"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isUpdating ? 'animate-spin' : ''}`} />
                <span>{isUpdating ? 'Actualisation...' : 'Actualiser le site maintenant'}</span>
              </button>

              <button
                type="button"
                onClick={() => setDetectedUpdate(null)}
                className="text-[11px] text-slate-400 hover:text-white px-2 py-1 transition cursor-pointer"
              >
                Ignorer pour l'instant
              </button>
            </div>

            {/* Mini bouton en bas de la notif pour créer son pseudo & accès admin */}
            <div className="pt-2 mt-1 border-t border-slate-800/80 flex items-center justify-between gap-2">
              {onOpenPseudoModal && (
                <button
                  type="button"
                  onClick={onOpenPseudoModal}
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold text-cyan-300 hover:text-cyan-200 transition hover:underline cursor-pointer"
                >
                  <UserPlus className="h-3.5 w-3.5 text-cyan-400" />
                  <span>{profile?.pseudo ? `Pseudo : ${profile.pseudo}` : 'Créer mon pseudo'}</span>
                </button>
              )}

              {profile?.isAdmin && onOpenAdminPanel && (
                <button
                  type="button"
                  onClick={onOpenAdminPanel}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-black text-[10px] uppercase shadow transition cursor-pointer"
                >
                  <Crown className="h-3 w-3 text-amber-300" />
                  <span>Panel Admin</span>
                </button>
              )}
            </div>
          </div>

          <button
            onClick={() => setDetectedUpdate(null)}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition cursor-pointer shrink-0"
            title="Masquer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </aside>
    );
  }

  // Si pas de mise à jour en cours, prompt de souscription
  if (!isPromptVisible) return null;

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
        setIsPromptVisible(false);
      }, 1500);
    } catch (err) {
      console.warn('Notification request error:', err);
      localStorage.setItem('instant_meteo_notif_prompt_status', 'accepted');
      setIsPromptVisible(false);
    }
  };

  const handleDismiss = () => {
    try {
      localStorage.setItem('instant_meteo_notif_prompt_status', 'dismissed');
    } catch (e) {}
    setIsPromptVisible(false);
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
              "Voulez-vous recevoir une notification lorsqu’il y a une mise à jour, un changement ou une amélioration du code pour être averti obligatoirement des nouveautés ?"
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

          {/* Mini bouton en bas de la notif pour créer son pseudo & accès admin */}
          <div className="pt-2.5 mt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
            {onOpenPseudoModal && (
              <button
                type="button"
                onClick={onOpenPseudoModal}
                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-300 hover:text-amber-200 transition hover:underline cursor-pointer"
              >
                <UserPlus className="h-3.5 w-3.5 text-amber-400" />
                <span>{profile?.pseudo ? `Pseudo : ${profile.pseudo}` : 'Créer mon pseudo'}</span>
              </button>
            )}

            {profile?.isAdmin && onOpenAdminPanel && (
              <button
                type="button"
                onClick={onOpenAdminPanel}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-black text-[10px] uppercase shadow transition cursor-pointer"
              >
                <Crown className="h-3 w-3 text-amber-300" />
                <span>Panel Admin</span>
              </button>
            )}
          </div>
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
