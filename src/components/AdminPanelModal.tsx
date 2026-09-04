import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Crown, 
  UserX, 
  Trophy, 
  Flame, 
  Sparkles, 
  Megaphone, 
  X, 
  Check, 
  RotateCcw, 
  Plus, 
  Trash2, 
  Sliders, 
  Lock, 
  Radio,
  UserCheck,
  AlertTriangle,
  Key
} from 'lucide-react';
import { 
  loadPlayerProfile, 
  savePlayerProfile, 
  adminUpdatePoints, 
  adminUpdateStreak, 
  adminUnlockAllBadges, 
  adminToggleAdminStatus,
  banUser, 
  unbanUser, 
  getBannedUsers, 
  BannedUser, 
  setAdminAnnouncement, 
  getAdminAnnouncement, 
  AdminAnnouncement,
  PlayerProfile,
  verifyAdminCode,
  initPlayerProfile
} from '../services/competitiveGameService';
import { 
  syncPlayerProfileToD1,
  adminSetPointsInD1,
  adminSetStreakInD1,
  adminUnlockAllBadgesInD1,
  adminBanUserInD1,
  adminUnbanUserInD1,
  adminSaveAnnouncementInD1,
  adminGetAnnouncementFromD1,
  adminGetBannedUsersFromD1
} from '../services/cloudflareD1Service';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated?: (profile: PlayerProfile) => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  onProfileUpdated
}) => {
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'points' | 'bans' | 'powers' | 'broadcast'>('points');
  
  // Secret code authentication
  const [secretCodeInput, setSecretCodeInput] = useState<string>('');
  const [codeError, setCodeError] = useState<string | null>(null);

  // Points tab
  const [newPointsInput, setNewPointsInput] = useState<string>('');
  
  // Bans tab
  const [banPseudoInput, setBanPseudoInput] = useState<string>('');
  const [banDuration, setBanDuration] = useState<number | 'permanent'>(24);
  const [banReasonInput, setBanReasonInput] = useState<string>('');
  const [bannedList, setBannedList] = useState<BannedUser[]>([]);
  
  // Broadcast tab
  const [announcementTitle, setAnnouncementTitle] = useState<string>('');
  const [announcementMessage, setAnnouncementMessage] = useState<string>('');
  const [activeAnnouncement, setActiveAnnouncement] = useState<AdminAnnouncement | null>(null);

  // Streak tab
  const [streakInput, setStreakInput] = useState<string>('');

  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'warn' } | null>(null);

  const refreshData = () => {
    const p = loadPlayerProfile();
    setProfile(p);
    if (p) {
      setNewPointsInput(p.totalPoints.toString());
      setStreakInput(p.streakDays.toString());
    }
    setBannedList(getBannedUsers());
    const ann = getAdminAnnouncement();
    setActiveAnnouncement(ann);
    if (ann) {
      setAnnouncementTitle(ann.title);
      setAnnouncementMessage(ann.message);
    }
  };

  useEffect(() => {
    if (isOpen) {
      refreshData();
      setNotification(null);
      setCodeError(null);
      setSecretCodeInput('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const showToast = (text: string, type: 'success' | 'warn' = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // Secret code verification handler
  const handleUnlockWithCode = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = secretCodeInput.trim().toLowerCase();
    if (verifyAdminCode(clean)) {
      let current = profile;
      if (!current) {
        current = initPlayerProfile('Administrateur');
      }
      const updated = adminToggleAdminStatus(current, true);
      setProfile(updated);
      syncPlayerProfileToD1(updated).catch(() => {});
      if (onProfileUpdated) onProfileUpdated(updated);
      window.dispatchEvent(new CustomEvent('instant_meteo_score_updated'));
      setCodeError(null);
      setSecretCodeInput('');
      showToast('👑 Code secret validé avec succès ! Mode Administrateur activé.');
    } else {
      setCodeError('Code secret incorrect. Veuillez vérifier la saisie.');
    }
  };

  // Points handlers
  const handleSavePoints = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    const pts = parseInt(newPointsInput, 10);
    if (isNaN(pts)) return;
    const updated = adminUpdatePoints(profile, pts);
    setProfile(updated);
    syncPlayerProfileToD1(updated).catch(() => {});
    adminSetPointsInD1(profile.pseudo, pts).catch(() => {});
    if (onProfileUpdated) onProfileUpdated(updated);
    showToast(`✅ Points modifiés avec succès : ${pts.toLocaleString()} pts`);
  };

  const handleQuickAddPoints = (amount: number) => {
    if (!profile) return;
    const current = profile.totalPoints || 0;
    const target = Math.max(0, current + amount);
    const updated = adminUpdatePoints(profile, target);
    setProfile(updated);
    setNewPointsInput(target.toString());
    syncPlayerProfileToD1(updated).catch(() => {});
    adminSetPointsInD1(profile.pseudo, target).catch(() => {});
    if (onProfileUpdated) onProfileUpdated(updated);
    showToast(`⚡ +${amount.toLocaleString()} points ajoutés ! (Nouveau total: ${target.toLocaleString()} pts)`);
  };

  // Streak handler
  const handleSaveStreak = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    const days = parseInt(streakInput, 10);
    if (isNaN(days) || days < 1) return;
    const updated = adminUpdateStreak(profile, days);
    setProfile(updated);
    syncPlayerProfileToD1(updated).catch(() => {});
    adminSetStreakInD1(profile.pseudo, days).catch(() => {});
    if (onProfileUpdated) onProfileUpdated(updated);
    showToast(`🔥 Flammes consécutives mises à jour : ${days} jours`);
  };

  // Badges unlocker
  const handleUnlockAllBadges = () => {
    if (!profile) return;
    const updated = adminUnlockAllBadges(profile);
    setProfile(updated);
    syncPlayerProfileToD1(updated).catch(() => {});
    adminUnlockAllBadgesInD1(profile.pseudo).catch(() => {});
    if (onProfileUpdated) onProfileUpdated(updated);
    showToast('🏆 Les 10 trophées météorologiques ont été débloqués instantanément !');
  };

  // Ban handlers
  const handleBanUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPseudo = banPseudoInput.trim();
    if (!cleanPseudo) return;

    banUser(cleanPseudo, banDuration, banReasonInput);
    adminBanUserInD1(cleanPseudo, banDuration, banReasonInput).catch(() => {});
    setBannedList(getBannedUsers());
    setBanPseudoInput('');
    setBanReasonInput('');
    showToast(`⛔ L'utilisateur "${cleanPseudo}" a été banni du concours avec succès !`, 'warn');
  };

  const handleUnban = (pseudo: string) => {
    unbanUser(pseudo);
    adminUnbanUserInD1(pseudo).catch(() => {});
    setBannedList(getBannedUsers());
    showToast(`✅ L'utilisateur "${pseudo}" a été débanni du concours.`);
  };

  // Broadcast handlers
  const handlePublishAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementTitle.trim() || !announcementMessage.trim()) return;

    const ann: AdminAnnouncement = {
      title: announcementTitle.trim(),
      message: announcementMessage.trim(),
      author: profile?.pseudo || 'Direction Administrateur',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      active: true
    };

    setAdminAnnouncement(ann);
    adminSaveAnnouncementInD1(ann).catch(() => {});
    setActiveAnnouncement(ann);
    showToast('📢 Annonce officielle d\'administrateur diffusée sur tout le site !');
  };

  const handleClearAnnouncement = () => {
    setAdminAnnouncement(null);
    adminSaveAnnouncementInD1(null).catch(() => {});
    setActiveAnnouncement(null);
    setAnnouncementTitle('');
    setAnnouncementMessage('');
    showToast('🗑️ Annonce admin retirée avec succès.');
  };

  // Revoke admin
  const handleToggleAdminMode = () => {
    if (!profile) return;
    const nextState = !profile.isAdmin;
    const updated = adminToggleAdminStatus(profile, nextState);
    setProfile(updated);
    if (onProfileUpdated) onProfileUpdated(updated);
    showToast(nextState ? '👑 Mode Admin réactivé.' : '🛡️ Mode Admin désactivé temporairement.');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-panel-title"
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-red-500/40 bg-slate-900/98 p-5 sm:p-6 shadow-2xl text-slate-100 ring-2 ring-red-500/20">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-red-600 via-red-500 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-red-600/30 shrink-0">
              <Crown className="h-6 w-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="admin-panel-title" className="text-base sm:text-lg font-black text-white">
                  Panneau d'Administration
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-red-950 border border-red-500/50 text-red-300 text-[10px] font-black uppercase">
                  Accès Total
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Outils d'administration exclusifs • Gestion concours, bannissements et points
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            title="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Toast feedback */}
        {notification && (
          <div className={`mt-3 p-3 rounded-2xl text-xs font-bold flex items-center gap-2 ${
            notification.type === 'warn'
              ? 'bg-amber-950/50 border border-amber-500/50 text-amber-200'
              : 'bg-emerald-950/50 border border-emerald-500/50 text-emerald-200'
          }`}>
            <Check className="h-4 w-4 shrink-0" />
            <span>{notification.text}</span>
          </div>
        )}

        {/* Content: If not Admin, show Secret Code Unlock screen. Otherwise show Admin Panel */}
        {(!profile || !profile.isAdmin) ? (
          <div className="mt-5 space-y-5">
            <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950 p-6 text-center space-y-4 shadow-xl">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 shadow-lg border border-amber-500/30">
                <Lock className="h-7 w-7 text-amber-400" />
              </div>
              
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-black text-white">
                  Déverrouiller l'Accès Administrateur
                </h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                  Saisissez le code secret pour débloquer les super-pouvoirs de gestion météo, l'ajustement des points, flammes, trophées et les annonces flash.
                </p>
              </div>

              <form onSubmit={handleUnlockWithCode} className="max-w-md mx-auto space-y-3 pt-2">
                <div className="relative">
                  <input
                    type="password"
                    value={secretCodeInput}
                    onChange={(e) => {
                      setSecretCodeInput(e.target.value);
                      if (codeError) setCodeError(null);
                    }}
                    placeholder="Entrez le code secret..."
                    className="w-full pl-4 pr-12 py-3 rounded-2xl bg-slate-950 border border-slate-700 text-white font-mono text-sm placeholder-slate-500 focus:outline-none focus:border-amber-400 shadow-inner"
                    autoFocus
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Key className="h-4 w-4 text-amber-400" />
                  </div>
                </div>

                {codeError && (
                  <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-rose-400">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span>{codeError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm shadow-xl shadow-amber-950/50 transition active:scale-95 cursor-pointer"
                >
                  <Crown className="h-4 w-4" />
                  <span>Valider le Code Secret</span>
                </button>
              </form>

              <div className="pt-3 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-left text-[11px] text-slate-400">
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                  <Sparkles className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  <span>Modification des points &amp; flammes</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                  <Trophy className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  <span>Déblocage instantané des trophées</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                  <Megaphone className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  <span>Publication d'alertes &amp; flashs</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                  <UserX className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                  <span>Modération &amp; sanctions concours</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Navigation Tabs */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('points')}
            className={`py-2 px-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'points'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Trophy className="h-3.5 w-3.5" />
            <span>Mes Points</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('bans')}
            className={`py-2 px-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'bans'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <UserX className="h-3.5 w-3.5" />
            <span>Bannissements ({bannedList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('powers')}
            className={`py-2 px-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'powers'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Super-Pouvoirs</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('broadcast')}
            className={`py-2 px-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'broadcast'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Megaphone className="h-3.5 w-3.5" />
            <span>Annonce Flash</span>
          </button>
        </div>

        {/* TAB 1: POINTS & STATUT */}
        {activeTab === 'points' && (
          <div className="mt-5 space-y-5">
            {/* Current status card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Compte Administrateur</p>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  {profile?.pseudo || 'Admin Météo'}
                  <span className="px-2 py-0.5 rounded-full bg-red-950 border border-red-500/40 text-red-300 text-[10px] font-black">
                    Admin
                  </span>
                </h3>
                <p className="text-xs text-amber-300 mt-1 font-semibold">
                  Points actuels : <strong className="text-white text-base">{profile?.totalPoints.toLocaleString() || 0} pts</strong>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickAddPoints(500)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer"
                >
                  +500 pts
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAddPoints(2000)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer"
                >
                  +2 000 pts
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAddPoints(10000)}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-xs font-black transition cursor-pointer shadow"
                >
                  +10 000 pts ⚡
                </button>
              </div>
            </div>

            {/* Custom points edit form */}
            <form onSubmit={handleSavePoints} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-300">
                Changer précisément le nombre total de points
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="9999999"
                  value={newPointsInput}
                  onChange={(e) => setNewPointsInput(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono font-bold text-sm focus:outline-none focus:border-red-500"
                  placeholder="Ex: 5000"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs transition cursor-pointer shadow-md"
                >
                  Appliquer les points
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                Vous pouvez définir la valeur de votre choix. La mise à jour est immédiatement prise en compte dans le classement national.
              </p>
            </form>
          </div>
        )}

        {/* TAB 2: BANNISSEMENTS CONCOURS */}
        {activeTab === 'bans' && (
          <div className="mt-5 space-y-5">
            {/* Formulaire de ban */}
            <form onSubmit={handleBanUserSubmit} className="p-4 rounded-2xl bg-slate-950/60 border border-red-500/30 space-y-3">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-red-400">
                <UserX className="h-4 w-4" />
                <span>Bannir un utilisateur du concours météo</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Pseudo de l'utilisateur à bannir
                  </label>
                  <input
                    type="text"
                    value={banPseudoInput}
                    onChange={(e) => setBanPseudoInput(e.target.value)}
                    placeholder="Ex: Tricheur123"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Durée du bannissement
                  </label>
                  <select
                    value={banDuration}
                    onChange={(e) => {
                      const val = e.target.value;
                      setBanDuration(val === 'permanent' ? 'permanent' : parseInt(val, 10));
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:border-red-500"
                  >
                    <option value={1}>1 heure</option>
                    <option value={24}>24 heures (1 jour)</option>
                    <option value={168}>7 jours (1 semaine)</option>
                    <option value={720}>30 jours (1 mois)</option>
                    <option value="permanent">Bannissement Définitif</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Motif du bannissement (visible dans le registre admin)
                </label>
                <input
                  type="text"
                  value={banReasonInput}
                  onChange={(e) => setBanReasonInput(e.target.value)}
                  placeholder="Ex: Faux relevés, comportement irrespectueux, spoofing..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="pt-1 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-black text-xs shadow-lg shadow-red-600/30 transition cursor-pointer"
                >
                  Bannir l'utilisateur du concours
                </button>
              </div>
            </form>

            {/* Banned Users Table */}
            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                Utilisateurs actuellement bannis ({bannedList.length})
              </h4>

              {bannedList.length === 0 ? (
                <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800 text-center text-xs text-slate-400">
                  Aucun utilisateur n'est actuellement banni du concours météo.
                </div>
              ) : (
                <div className="space-y-2">
                  {bannedList.map((item) => (
                    <div
                      key={item.pseudo}
                      className="p-3 rounded-2xl bg-slate-950/80 border border-red-500/20 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-white text-xs">{item.pseudo}</span>
                          <span className="px-2 py-0.5 rounded-full bg-red-950 text-red-300 border border-red-500/30 text-[10px] font-bold">
                            {item.durationLabel}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                          Motif : {item.reason}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleUnban(item.pseudo)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white font-bold text-xs transition cursor-pointer flex items-center gap-1 shrink-0"
                      >
                        <UserCheck className="h-3.5 w-3.5" />
                        <span>Débannir</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: SUPER-POUVOIRS ADMIN */}
        {activeTab === 'powers' && (
          <div className="mt-5 space-y-4">
            {/* Trophies unlock */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                  <Trophy className="h-4 w-4 text-amber-400" />
                  Débloquer tous les Trophées Météo
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Attribue instantanément les 10 badges météo (Soleil, Orage, Neige, Grand Froid, Coup de Vent, etc.)
                </p>
              </div>
              <button
                type="button"
                onClick={handleUnlockAllBadges}
                className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition cursor-pointer shadow shrink-0"
              >
                Débloquer les 10 badges
              </button>
            </div>

            {/* Streak modifier */}
            <form onSubmit={handleSaveStreak} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                  <Flame className="h-4 w-4 text-orange-400" />
                  Modifier la série de flammes (Jours consécutifs)
                </h4>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setStreakInput('30');
                      if (profile) adminUpdateStreak(profile, 30);
                    }}
                    className="px-2 py-0.5 rounded-lg bg-slate-800 text-[10px] font-bold text-amber-300"
                  >
                    x2 (30j)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStreakInput('365');
                      if (profile) adminUpdateStreak(profile, 365);
                    }}
                    className="px-2 py-0.5 rounded-lg bg-slate-800 text-[10px] font-bold text-orange-300"
                  >
                    x3 (1 an)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStreakInput('1460');
                      if (profile) adminUpdateStreak(profile, 1460);
                    }}
                    className="px-2 py-0.5 rounded-lg bg-slate-800 text-[10px] font-bold text-red-300"
                  >
                    x10 (4 ans)
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="9999"
                  value={streakInput}
                  onChange={(e) => setStreakInput(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono font-bold text-xs"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-black text-xs transition cursor-pointer"
                >
                  Appliquer Flammes
                </button>
              </div>
            </form>

            {/* Toggle admin status */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-black text-white">Basculer le statut Administrateur</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Permet de tester l'application en mode utilisateur standard ou réactiver le mode Admin.
                </p>
              </div>
              <button
                type="button"
                onClick={handleToggleAdminMode}
                className={`px-3 py-2 rounded-xl font-black text-xs transition cursor-pointer ${
                  profile?.isAdmin
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    : 'bg-red-600 hover:bg-red-500 text-white'
                }`}
              >
                {profile?.isAdmin ? 'Désactiver Admin' : 'Réactiver Admin'}
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: DIFFUSION ANNONCE FLASH */}
        {activeTab === 'broadcast' && (
          <div className="mt-5 space-y-5">
            <form onSubmit={handlePublishAnnouncement} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-400">
                <Megaphone className="h-4 w-4" />
                <span>Diffuser un Flash Info / Alerte Officielle Admin</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Titre du message flash
                </label>
                <input
                  type="text"
                  value={announcementTitle}
                  onChange={(e) => setAnnouncementTitle(e.target.value)}
                  placeholder="Ex: 🚨 ALERTE SPÉCIALE : Vague orageuse sur le nord-ouest"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Contenu détaillé du communiqué
                </label>
                <textarea
                  rows={3}
                  value={announcementMessage}
                  onChange={(e) => setAnnouncementMessage(e.target.value)}
                  placeholder="Ex: Le réseau de capteurs et les radars signalent des rafales convectives supérieures à 95 km/h. Merci de sécuriser vos équipements et de partager vos signalements."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              <div className="pt-1 flex items-center justify-between">
                {activeAnnouncement && (
                  <button
                    type="button"
                    onClick={handleClearAnnouncement}
                    className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 font-bold transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Supprimer l'annonce en cours
                  </button>
                )}
                <button
                  type="submit"
                  className="ml-auto px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-md transition cursor-pointer"
                >
                  Publier l'annonce officielle
                </button>
              </div>
            </form>

            {activeAnnouncement && (
              <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                    Actuellement diffusée sur le site • {activeAnnouncement.createdAt}
                  </span>
                </div>
                <h5 className="text-sm font-black text-white">{activeAnnouncement.title}</h5>
                <p className="text-xs text-slate-200">{activeAnnouncement.message}</p>
              </div>
            )}
          </div>
        )}
      </>
    )}

      </div>
    </div>
  );
};
