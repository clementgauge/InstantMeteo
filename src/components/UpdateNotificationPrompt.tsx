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
  const [showMobileDetails, setShowMobileDetails] = useState<boolean>(false);

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
      className="fixed bottom-16 sm:bottom-6 right-2 sm:right-6 left-2 sm:left-auto z-50 sm:max-w-md sm:w-[calc(100%-2rem)] rounded-xl sm:rounded-2xl border border-cyan-500/50 bg-slate-950/95 px-2.5 py-1.5 sm:p-4 shadow-xl shadow-cyan-500/20 backdrop-blur-2xl animate-in slide-in-from-bottom-5 duration-300"
    >
      {/* Version Mobile ultra-compacte (1 seule ligne par défaut + détails dépliables) */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <div className="rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 p-1 text-white shrink-0">
              <Zap className="h-3.5 w-3.5 text-amber-300" />
            </div>
            <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 text-[9px] font-black uppercase shrink-0">
              v{updateInfo.version}
            </span>
            <button
              type="button"
              onClick={() => setShowMobileDetails((v) => !v)}
              className="text-[11px] font-bold text-white truncate text-left flex-1 cursor-pointer"
              title="Voir le détail de la mise à jour"
            >
              {updateInfo.title || changesList[0] || updateInfo.changelog || 'Nouveautés déployées'}
            </button>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {changesList.length > 0 && (
              <button
                type="button"
                onClick={() => setShowMobileDetails((v) => !v)}
                className="px-1.5 py-1 rounded-md bg-slate-800/90 border border-slate-700 text-[9px] font-bold text-cyan-300 cursor-pointer"
              >
                {showMobileDetails ? 'Masquer' : 'Détails'}
              </button>
            )}
            <button
              type="button"
              onClick={handleDismiss}
              className="inline-flex items-center gap-0.5 px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] shadow transition active:scale-95 cursor-pointer"
              title="OK — Ne plus afficher sauf mise à jour différente"
            >
              <CheckCircle2 className="h-3 w-3 text-white" />
              <span>OK</span>
            </button>
            <button
              type="button"
              onClick={() => applyAppUpdate(updateInfo)}
              className="p-1 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-200 cursor-pointer"
              title="Actualiser"
            >
              <RefreshCw className="h-3 w-3 text-cyan-300" />
            </button>
          </div>
        </div>

        {showMobileDetails && (
          <div className="mt-1.5 pt-1.5 border-t border-slate-800/90 space-y-1.5">
            <p className="text-[10px] font-bold text-cyan-300 leading-snug">
              {updateInfo.title || `Mise à jour v${updateInfo.version}`}
            </p>
            {changesList.length > 0 && (
              <ul className="bg-slate-900/95 p-2 rounded-lg border border-slate-800 space-y-1 max-h-28 overflow-y-auto">
                {changesList.map((item, idx) => (
                  <li key={idx} className="text-[10px] text-slate-200 leading-tight flex items-start gap-1">
                    <span className="text-cyan-400 font-black shrink-0">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex items-center justify-between gap-2 pt-0.5">
              {onOpenPseudoModal && (
                <button
                  type="button"
                  onClick={onOpenPseudoModal}
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-cyan-300 cursor-pointer"
                >
                  <UserPlus className="h-3 w-3 text-cyan-400" />
                  <span>{profile?.pseudo ? `Pseudo : ${profile.pseudo}` : 'Mon profil'}</span>
                </button>
              )}
              {profile?.isAdmin && onOpenAdminPanel && (
                <button
                  type="button"
                  onClick={onOpenAdminPanel}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-600 text-white font-black text-[9px] uppercase cursor-pointer"
                >
                  <Crown className="h-2.5 w-2.5 text-amber-300" />
                  <span>Admin</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Version PC (sm et +) : Carte complète détaillée */}
      <div className="hidden sm:flex items-start gap-3.5">
        <div className="rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 p-2.5 text-white font-black shadow-md shadow-cyan-500/30 shrink-0 mt-0.5">
          <Zap className="h-5 w-5 animate-pulse text-amber-300" />
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40 text-[10px] font-black uppercase tracking-wider shrink-0">
                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                <span>MàJ v{updateInfo.version}</span>
              </span>
              {formattedTime && (
                <span className="text-[10px] text-slate-400 font-medium shrink-0">
                  {formattedTime}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={handleDismiss}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow transition active:scale-95 cursor-pointer"
                title="Valider et ne plus afficher cette notification jusqu'à la prochaine mise à jour différente"
              >
                <CheckCircle2 className="h-3 w-3 text-white" />
                <span>OK</span>
              </button>
              <button
                type="button"
                onClick={() => applyAppUpdate(updateInfo)}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-200 font-bold text-[10px] transition cursor-pointer"
                title="Actualiser"
              >
                <RefreshCw className="h-3 w-3 text-cyan-300" />
                <span>Actualiser</span>
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition cursor-pointer"
                title="Fermer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <h4 className="text-sm font-black text-white leading-snug">
            {updateInfo.title || updateInfo.changelog || `Mise à jour v${updateInfo.version} déployée`}
          </h4>

          {changesList.length > 0 && (
            <div className="bg-slate-900/95 p-2.5 rounded-xl border border-slate-800 space-y-1.5 max-h-40 overflow-y-auto">
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-amber-300">
                <Sparkles className="h-3 w-3 text-amber-400 shrink-0" />
                <span>Ce qui vient d'être mis à jour :</span>
              </div>
              <ul className="space-y-1">
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

          <div className="flex pt-1 border-t border-slate-800/80 flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              {onOpenPseudoModal && (
                <button
                  type="button"
                  onClick={onOpenPseudoModal}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-300 hover:text-cyan-200 transition hover:underline cursor-pointer"
                >
                  <UserPlus className="h-3 w-3 text-cyan-400" />
                  <span>{profile?.pseudo ? `Pseudo : ${profile.pseudo}` : 'Mon profil'}</span>
                </button>
              )}

              {updateInfo.history && updateInfo.history.length > 1 && (
                <button
                  type="button"
                  onClick={() => setShowHistory((prev) => !prev)}
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-cyan-300 transition cursor-pointer"
                >
                  <History className="h-3 w-3" />
                  <span>{showHistory ? 'Masquer historique' : 'Historique'}</span>
                  {showHistory ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
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

          {showHistory && updateInfo.history && updateInfo.history.length > 1 && (
            <div className="mt-1 space-y-1.5 rounded-xl bg-slate-900/70 border border-slate-800/80 p-2 max-h-28 overflow-y-auto">
              {updateInfo.history.slice(1).map((rel) => (
                <div key={rel.buildId} className="border-b border-slate-800/60 last:border-0 pb-1 last:pb-0">
                  <div className="text-[10px] font-bold text-cyan-300">
                    v{rel.version} — {rel.title || 'Mise à jour'}
                  </div>
                  <p className="text-[9px] text-slate-400 leading-snug">{rel.changelog}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
