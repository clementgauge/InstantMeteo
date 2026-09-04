import React, { useState, useEffect } from 'react';
import { 
  User, 
  ShieldCheck, 
  KeyRound, 
  Check, 
  X, 
  Sparkles, 
  Crown, 
  Flame,
  Award,
  Sliders
} from 'lucide-react';
import { 
  loadPlayerProfile, 
  savePlayerProfile, 
  initPlayerProfile, 
  verifyAdminCode, 
  PlayerProfile 
} from '../services/competitiveGameService';
import { syncPlayerProfileToD1 } from '../services/cloudflareD1Service';

interface PseudoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAdminPanel?: () => void;
}

export const PseudoModal: React.FC<PseudoModalProps> = ({
  isOpen,
  onClose,
  onOpenAdminPanel
}) => {
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [pseudoInput, setPseudoInput] = useState('');
  const [secretCodeInput, setSecretCodeInput] = useState('');
  const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'error' | 'admin' } | null>(null);

  useEffect(() => {
    if (isOpen) {
      const p = loadPlayerProfile();
      setProfile(p);
      if (p?.pseudo) {
        setPseudoInput(p.pseudo);
      }
      setSecretCodeInput('');
      setFeedback(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPseudo = pseudoInput.trim();
    const cleanSecret = secretCodeInput.trim();

    // Vérification du code admin secret (ne doit jamais être affiché)
    const isAdminTriggered = verifyAdminCode(cleanSecret) || verifyAdminCode(cleanPseudo);

    let current = profile || initPlayerProfile(cleanPseudo || 'Chasseur Météo');

    if (isAdminTriggered) {
      // Activer les super-pouvoirs Admin
      current = {
        ...current,
        pseudo: (cleanPseudo && !verifyAdminCode(cleanPseudo)) ? cleanPseudo : (current.pseudo || 'Admin Météo'),
        isAdmin: true
      };
      savePlayerProfile(current);
      setProfile(current);
      syncPlayerProfileToD1(current).catch(() => {});
      setFeedback({
        text: '👑 Statut Administrateur débloqué ! Votre rang est désormais Admin.',
        type: 'admin'
      });
      setTimeout(() => {
        onClose();
        if (onOpenAdminPanel) onOpenAdminPanel();
      }, 1500);
      return;
    }

    if (!cleanPseudo) {
      setFeedback({ text: 'Veuillez saisir un pseudo valide.', type: 'error' });
      return;
    }

    current = {
      ...current,
      pseudo: cleanPseudo
    };
    savePlayerProfile(current);
    setProfile(current);
    syncPlayerProfileToD1(current).catch(() => {});
    setFeedback({ text: '✅ Pseudo enregistré avec succès !', type: 'success' });
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pseudo-modal-title"
    >
      <div className="relative w-full max-w-md rounded-3xl border border-slate-700 bg-slate-900/98 p-6 shadow-2xl text-slate-100 ring-1 ring-white/10">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
          title="Fermer"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 pb-4 border-b border-slate-800">
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20 shrink-0">
            <User className="h-6 w-6" />
          </div>
          <div>
            <h2 id="pseudo-modal-title" className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              Mon Profil &amp; Pseudo
              {profile?.isAdmin && (
                <span className="px-2 py-0.5 rounded-full bg-red-950 border border-red-500/50 text-red-300 text-[10px] font-black uppercase flex items-center gap-1">
                  <Crown className="h-3 w-3 text-amber-400" />
                  Admin
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400">
              Identifiant pour le concours, le classement et les échanges
            </p>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className={`mt-4 p-3 rounded-2xl text-xs font-bold flex items-center gap-2 ${
            feedback.type === 'admin' 
              ? 'bg-amber-950/50 border border-amber-500/50 text-amber-200'
              : feedback.type === 'success'
              ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-200'
              : 'bg-rose-950/40 border border-rose-500/40 text-rose-200'
          }`}>
            {feedback.type === 'admin' && <Crown className="h-4 w-4 text-amber-400 shrink-0" />}
            {feedback.type === 'success' && <Check className="h-4 w-4 text-emerald-400 shrink-0" />}
            {feedback.type === 'error' && <X className="h-4 w-4 text-rose-400 shrink-0" />}
            <span>{feedback.text}</span>
          </div>
        )}

        {/* Status Info if Admin */}
        {profile?.isAdmin && (
          <div className="mt-4 p-3.5 rounded-2xl bg-gradient-to-r from-red-950/40 via-amber-950/30 to-slate-900 border border-red-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="h-5 w-5 text-amber-400 shrink-0" />
              <div>
                <p className="text-xs font-black text-white">Privilèges Administrateur Actifs</p>
                <p className="text-[10px] text-amber-300/80">Rang affiché : Admin (remplace Observateur Averti)</p>
              </div>
            </div>
            {onOpenAdminPanel && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAdminPanel();
                }}
                className="px-2.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs shadow-md transition cursor-pointer flex items-center gap-1"
              >
                <Sliders className="h-3 w-3" />
                Panel Admin
              </button>
            )}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1.5">
              Votre Pseudo
            </label>
            <input
              type="text"
              value={pseudoInput}
              onChange={(e) => setPseudoInput(e.target.value)}
              placeholder="Ex: AlexandreMétéo"
              maxLength={25}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 text-sm font-semibold transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <KeyRound className="h-3.5 w-3.5 text-slate-400" />
                Code privilège ou d'invitation (optionnel)
              </span>
              <span className="text-[10px] text-slate-500">Accès spécial</span>
            </label>
            <input
              type="password"
              value={secretCodeInput}
              onChange={(e) => setSecretCodeInput(e.target.value)}
              placeholder="Code d'accès..."
              className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 text-xs font-mono transition"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition cursor-pointer"
            >
              Valider &amp; Enregistrer
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
