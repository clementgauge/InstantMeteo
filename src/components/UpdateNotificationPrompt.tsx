import React, { useEffect, useState } from 'react';
import { Zap, X, UserPlus, Crown, CheckCircle2 } from 'lucide-react';
import {
  AppVersionInfo,
  onAppUpdateDetected,
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
  onOpenPseudoModal,
  onOpenAdminPanel
}) => {
  const [updateInfo, setUpdateInfo] = useState<AppVersionInfo | null>(null);
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [autoDismissTimer, setAutoDismissTimer] = useState<number | null>(null);

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
    // Écoute automatique des changements de code en direct
    const unsubscribe = onAppUpdateDetected((info) => {
      console.log('[UpdateNotificationPrompt] Mise à jour automatique détectée et active:', info);
      setUpdateInfo(info);
      sendSystemUpdateNotification(info);

      // Auto-fermeture de l'information après 12 secondes
      const timer = window.setTimeout(() => {
        setUpdateInfo(null);
      }, 12000);
      setAutoDismissTimer(timer);
    });

    return () => {
      unsubscribe();
      if (autoDismissTimer) clearTimeout(autoDismissTimer);
    };
  }, []);

  // Si aucune mise à jour récente n'est signalée, on ne demande rien à l'utilisateur
  if (!updateInfo) return null;

  return (
    <aside
      aria-label="Information de mise à jour du site"
      className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 max-w-sm sm:max-w-md w-[calc(100%-2rem)] rounded-3xl border border-cyan-500/50 bg-slate-950/95 p-4 sm:p-5 shadow-2xl shadow-cyan-500/20 backdrop-blur-2xl animate-in slide-in-from-bottom-5 duration-300"
    >
      <div className="flex items-start gap-3.5">
        <div className="rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 p-2.5 text-white font-black shadow-lg shadow-cyan-500/30 shrink-0">
          <Zap className="h-5 w-5 animate-pulse text-amber-300" />
        </div>

        <div className="flex-1 space-y-1.5 pr-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40 text-[10px] font-black uppercase tracking-wider">
              <CheckCircle2 className="h-3 w-3 text-emerald-400" />
              Mise à jour automatique appliquée
            </span>
            <span className="text-[11px] font-mono text-slate-400">v{updateInfo.version}</span>
          </div>

          <h4 className="text-sm font-black text-white leading-snug">
            Code du site actualisé en direct
          </h4>

          <p className="text-xs text-slate-300 leading-relaxed">
            Le site s'est mis à jour automatiquement avec les derniers correctifs et améliorations.
          </p>

          {updateInfo.changelog && (
            <div className="text-[11px] text-slate-300 bg-slate-900/90 p-2 rounded-xl border border-slate-800 font-medium">
              ✨ {updateInfo.changelog}
            </div>
          )}

          {/* Mini bouton en bas de la notif pour profil & admin */}
          <div className="pt-2 mt-1 border-t border-slate-800/80 flex items-center justify-between gap-2">
            {onOpenPseudoModal && (
              <button
                type="button"
                onClick={onOpenPseudoModal}
                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-cyan-300 hover:text-cyan-200 transition hover:underline cursor-pointer"
              >
                <UserPlus className="h-3.5 w-3.5 text-cyan-400" />
                <span>{profile?.pseudo ? `Pseudo : ${profile.pseudo}` : 'Mon profil'}</span>
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
          type="button"
          onClick={() => setUpdateInfo(null)}
          className="rounded-full p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition cursor-pointer shrink-0"
          title="Fermer l'information"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
};
