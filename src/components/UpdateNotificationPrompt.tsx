import React, { useEffect, useState } from 'react';
import { Zap, X, UserPlus, Crown, CheckCircle2, Sparkles, RefreshCw, History, ChevronDown, ChevronUp } from 'lucide-react';
import {
  AppVersionInfo,
  onAppUpdateDetected,
  markUpdateAsSeen,
  applyAppUpdate
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
  const [showHistory, setShowHistory] = useState<boolean>(false);

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
      console.log('[UpdateNotificationPrompt] Mise à jour détectée:', info);
      setUpdateInfo(info);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleDismiss = () => {
    if (updateInfo) {
      markUpdateAsSeen(updateInfo);
    }
    setUpdateInfo(null);
  };

  // Si aucune mise à jour récente n'est signalée, on ne demande rien à l'utilisateur
  if (!updateInfo) return null;

  const formattedTime = (() => {
    try {
      const d = new Date(updateInfo.updatedAt);
      if (isNaN(d.getTime())) return '';
      return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  })();

  const changesList: string[] =
    Array.isArray(updateInfo.changes) && updateInfo.changes.length > 0
      ? updateInfo.changes
      : updateInfo.changelog
        ? updateInfo.changelog.split(/\s*•\s*|\.\s+(?=[A-ZÀ-Ÿ])/).filter(Boolean)
        : [];

  return (
    <aside
      aria-label="Détail de la mise à jour du site"
      className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 max-w-sm sm:max-w-md w-[calc(100%-2rem)] rounded-2xl border border-cyan-500/50 bg-slate-950/95 p-4 sm:p-5 shadow-2xl shadow-cyan-500/20 backdrop-blur-2xl animate-in slide-in-from-bottom-5 duration-300"
    >
      <div className="flex items-start gap-3.5">
        <div className="rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 p-2.5 text-white font-black shadow-lg shadow-cyan-500/30 shrink-0">
          <Zap className="h-5 w-5 animate-pulse text-amber-300" />
        </div>

        <div className="flex-1 min-w-0 space-y-2 pr-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40 text-[10px] font-black uppercase tracking-wider">
              <CheckCircle2 className="h-3 w-3 text-emerald-400" />
              Nouveautés mises à jour
            </span>
            <span className="text-[11px] font-mono font-bold text-cyan-400">
              v{updateInfo.version}
            </span>
            {formattedTime && (
              <span className="text-[10px] text-slate-400 font-medium">
                • {formattedTime}
              </span>
            )}
          </div>

          {/* Titre réel de ce qui a été mis à jour */}
          <h4 className="text-sm font-black text-white leading-snug">
            {updateInfo.title || updateInfo.changelog || `Mise à jour v${updateInfo.version} déployée`}
          </h4>

          {/* Liste détaillée et concrète des modifications appliquées */}
          {changesList.length > 0 && (
            <div className="bg-slate-900/95 p-2.5 rounded-xl border border-slate-800 space-y-1.5 max-h-48 overflow-y-auto">
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-amber-300">
                <Sparkles className="h-3 w-3 text-amber-400 shrink-0" />
                <span>Ce qui vient d'être mis à jour :</span>
              </div>
              <ul className="space-y-1.5">
                {changesList.map((item, idx) => (
                  <li
                    key={idx}
                    className="text-[11px] text-slate-200 leading-snug flex items-start gap-1.5 font-medium"
                  >
                    <span className="text-cyan-400 font-black shrink-0 mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Composants / fichiers touchés si disponibles */}
          {updateInfo.modifiedComponents && updateInfo.modifiedComponents.length > 0 && (
            <div className="flex flex-wrap items-center gap-1 pt-0.5">
              <span className="text-[9px] uppercase tracking-wider font-bold text-slate-500 mr-0.5">
                Modules actualisés :
              </span>
              {updateInfo.modifiedComponents.slice(0, 4).map((comp) => (
                <span
                  key={comp}
                  className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[9px] font-mono text-cyan-300/90"
                >
                  {comp.replace(/\.(tsx|ts|js|html)$/, '')}
                </span>
              ))}
            </div>
          )}

          {/* Historique des versions précédentes */}
          {updateInfo.history && updateInfo.history.length > 1 && (
            <div className="pt-0.5">
              <button
                type="button"
                onClick={() => setShowHistory((prev) => !prev)}
                className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-cyan-300 transition cursor-pointer"
              >
                <History className="h-3 w-3" />
                <span>
                  {showHistory ? 'Masquer les mises à jour précédentes' : 'Voir les mises à jour précédentes'}
                </span>
                {showHistory ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>

              {showHistory && (
                <div className="mt-1.5 space-y-2 rounded-xl bg-slate-900/70 border border-slate-800/80 p-2.5 max-h-36 overflow-y-auto">
                  {updateInfo.history.slice(1).map((rel) => (
                    <div key={rel.buildId} className="border-b border-slate-800/60 last:border-0 pb-1.5 last:pb-0">
                      <div className="flex items-center justify-between text-[10px] font-bold text-cyan-300">
                        <span>v{rel.version} — {rel.title || 'Mise à jour'}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                        {rel.changelog}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Actions en bas de la notif : Bouton OK + Actualiser + Profil + Admin */}
          <div className="pt-2 mt-1 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDismiss}
                className="inline-flex items-center gap-1 px-3.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md shadow-emerald-600/30 transition active:scale-95 cursor-pointer"
                title="Valider et ne plus afficher cette notification jusqu'à la prochaine mise à jour différente"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                <span>OK</span>
              </button>

              <button
                type="button"
                onClick={() => applyAppUpdate(updateInfo)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-200 font-bold text-[10px] transition cursor-pointer"
              >
                <RefreshCw className="h-3 w-3 text-cyan-300" />
                <span>Actualiser</span>
              </button>

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
            </div>

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
          onClick={handleDismiss}
          className="rounded-full p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition cursor-pointer shrink-0"
          title="Fermer l'information"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
};
