import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Flame, 
  MapPin, 
  Navigation, 
  Clock, 
  Sparkles, 
  ShieldCheck, 
  Gift, 
  Award, 
  Users, 
  ChevronRight, 
  User, 
  Zap, 
  ExternalLink,
  Edit2,
  Check,
  TrendingUp,
  Radio
} from 'lucide-react';
import { 
  PlayerProfile, 
  loadPlayerProfile, 
  initPlayerProfile, 
  savePlayerProfile, 
  refreshDailyStreak, 
  registerVisitedLocation, 
  checkAndUnlockWeatherConditions, 
  claimAmazonBonus, 
  getLeaderboard, 
  getMultiplier, 
  LeaderboardEntry,
  WEATHER_BADGES_CATALOG 
} from '../services/competitiveGameService';
import {
  getD1WorkerUrl,
  setD1WorkerUrl,
  isD1Configured,
  testD1Connection,
  fetchLeaderboardFromD1,
  syncPlayerProfileToD1
} from '../services/cloudflareD1Service';
import { 
  Database, 
  Server, 
  Wifi, 
  RefreshCw, 
  Globe, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Terminal, 
  X,
  Code
} from 'lucide-react';
import { LocationPoint, CurrentWeather } from '../types/weather';
import { AMAZON_AFFILIATE_LINKS } from '../config/affiliateLinks';

interface CompetitiveGamingViewProps {
  currentStation: LocationPoint;
  weather?: CurrentWeather | null;
  onNavigateToTab?: (tab: string) => void;
  seniorMode?: boolean;
  onOpenSearchModal?: () => void;
}

export const CompetitiveGamingView: React.FC<CompetitiveGamingViewProps> = ({
  currentStation,
  weather = null,
  onNavigateToTab,
  seniorMode = false,
  onOpenSearchModal
}) => {
  const [profile, setProfile] = useState<PlayerProfile | null>(() => loadPlayerProfile());
  const [pseudoInput, setPseudoInput] = useState<string>('');
  const [isEditingPseudo, setIsEditingPseudo] = useState<boolean>(false);
  const [newPseudo, setNewPseudo] = useState<string>('');
  const [notificationToast, setNotificationToast] = useState<{ message: string; points: number } | null>(null);

  // Cloudflare D1 State
  const [isD1ConfigOpen, setIsD1ConfigOpen] = useState<boolean>(false);
  const [d1UrlInput, setD1UrlInput] = useState<string>(() => getD1WorkerUrl());
  const [isD1Active, setIsD1Active] = useState<boolean>(() => isD1Configured());
  const [d1Testing, setD1Testing] = useState<boolean>(false);
  const [d1TestFeedback, setD1TestFeedback] = useState<{ ok: boolean; message: string } | null>(null);
  const [isSyncingD1, setIsSyncingD1] = useState<boolean>(false);
  const [remoteLeaderboard, setRemoteLeaderboard] = useState<LeaderboardEntry[] | null>(null);
  const [d1RankBadge, setD1RankBadge] = useState<{ rank: number; total: number } | null>(null);
  const [copiedCommands, setCopiedCommands] = useState<boolean>(false);

  // Synchronisation avec Cloudflare D1
  const syncWithD1 = async (prof: PlayerProfile) => {
    if (!isD1Configured()) return;
    setIsSyncingD1(true);
    try {
      const syncRes = await syncPlayerProfileToD1(prof);
      if (syncRes.ok && syncRes.rank) {
        setD1RankBadge({ rank: syncRes.rank, total: syncRes.totalPlayers || 1 });
      }
      const remote = await fetchLeaderboardFromD1(prof);
      if (remote && remote.length > 0) {
        setRemoteLeaderboard(remote);
      }
    } catch (e) {
      console.warn('Erreur synchro D1:', e);
    } finally {
      setIsSyncingD1(false);
    }
  };

  useEffect(() => {
    if (profile && isD1Configured()) {
      syncWithD1(profile);
    }
  }, [profile?.totalPoints, profile?.pseudo, profile?.streakDays]);

  const handleTestD1Connection = async () => {
    setD1Testing(true);
    setD1TestFeedback(null);
    const res = await testD1Connection(d1UrlInput);
    setD1Testing(false);
    setD1TestFeedback(res);
  };

  const handleSaveD1Config = async () => {
    setD1WorkerUrl(d1UrlInput);
    const configured = d1UrlInput.trim().length > 0;
    setIsD1Active(configured);
    if (configured && profile) {
      syncWithD1(profile);
      showToast('API Cloudflare D1 connectée avec succès !', 0);
    } else {
      setRemoteLeaderboard(null);
      setD1RankBadge(null);
      showToast('Mode local activé (Cloudflare D1 désactivé).', 0);
    }
    setIsD1ConfigOpen(false);
  };

  const handleCopyCommands = () => {
    const text = `# 1. Ouvrir le dossier cloudflare-d1\ncd cloudflare-d1\n\n# 2. Créer la base de données SQL D1\nnpx wrangler d1 create meteo-competitive-db\n\n# 3. Exécuter la création des tables\nnpx wrangler d1 execute meteo-competitive-db --remote --file=./schema.sql\n\n# 4. Déployer l'API Worker\nnpx wrangler deploy`;
    navigator.clipboard.writeText(text);
    setCopiedCommands(true);
    setTimeout(() => setCopiedCommands(false), 2500);
  };

  // Check and update daily streak
  useEffect(() => {
    if (profile) {
      const refreshed = refreshDailyStreak(profile);
      if (refreshed.streakDays !== profile.streakDays || refreshed.lastActiveDate !== profile.lastActiveDate) {
        setProfile(refreshed);
      }
    }
  }, []);

  // Listen to external score events (e.g. Amazon clicks, community reports, timer)
  useEffect(() => {
    const handleScoreUpdate = (e: any) => {
      if (e.detail) {
        setProfile({ ...e.detail });
      }
    };
    window.addEventListener('instant_meteo_score_updated', handleScoreUpdate);
    return () => window.removeEventListener('instant_meteo_score_updated', handleScoreUpdate);
  }, []);

  // Auto-check current weather conditions when page opens
  useEffect(() => {
    if (profile && weather) {
      const result = checkAndUnlockWeatherConditions(profile, weather, currentStation);
      if (result.newBadges.length > 0) {
        setProfile(result.profile);
        const pts = result.newBadges.reduce((sum, b) => sum + b.points, 0);
        showToast(`Trophée météo débloqué : ${result.newBadges.map(b => b.name).join(', ')} !`, pts);
      }
    }
  }, [weather?.weatherCode, weather?.temperature]);

  const showToast = (message: string, points: number) => {
    setNotificationToast({ message, points });
    setTimeout(() => {
      setNotificationToast(null);
    }, 4500);
  };

  // Initial username setup
  const handleStartAdventure = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pseudoInput.trim()) return;
    const newProf = initPlayerProfile(pseudoInput.trim());
    setProfile(newProf);
    showToast('Bienvenue dans la Chasse Météo ! +100 points de bienvenue offerts', 100);
  };

  // Rename pseudo
  const handleUpdatePseudo = () => {
    if (!profile || !newPseudo.trim()) return;
    const updated = { ...profile, pseudo: newPseudo.trim() };
    savePlayerProfile(updated);
    setProfile(updated);
    setIsEditingPseudo(false);
    showToast('Pseudo mis à jour avec succès !', 0);
  };

  // Register current GPS location for points
  const handleRegisterLocation = () => {
    if (!profile) return;
    const result = registerVisitedLocation(profile, currentStation);
    if (result.added) {
      setProfile(result.profile);
      showToast(`Nouveau lieu découvert : ${currentStation.name} !`, result.points);
    } else {
      showToast(`Vous avez déjà enregistré ${currentStation.name} dans votre carnet d'explorateur !`, 0);
    }
  };

  // Claim Amazon partner bonus
  const handleClaimAmazonBonus = () => {
    if (!profile) return;
    const res = claimAmazonBonus(profile);
    setProfile(res.profile);
    showToast('Bonus Découverte Équipement Amazon validé !', res.points);
  };

  // Leaderboard data (Cloudflare D1 priority if connected, local fallback otherwise)
  const localLeaderboard = getLeaderboard(profile);
  const leaderboard = (remoteLeaderboard && remoteLeaderboard.length > 0) ? remoteLeaderboard : localLeaderboard;
  const currentRank = d1RankBadge?.rank || leaderboard.find(l => l.isCurrentUser)?.rank || 1;
  const totalPlayersCount = d1RankBadge?.total || leaderboard.length;
  const multiplierInfo = profile ? getMultiplier(profile.streakDays) : { multiplier: 1, label: 'x1', nextTier: '' };

  // If user has no pseudo yet, force onboarding modal
  if (!profile) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="relative w-full max-w-md rounded-3xl border border-blue-500/40 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 p-7 sm:p-8 shadow-2xl backdrop-blur-xl text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 shadow-xl shadow-amber-500/30 mb-5">
            <Trophy className="h-8 w-8" />
          </div>

          <h2 className="text-2xl font-black text-white mb-2">
            Arène Compétitive Chasse Météo
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed">
            Rejoignez le classement national ! Remportez des points grâce à la géolocalisation des lieux visités, aux types de météos rencontrés, à vos flammes quotidiennes et aux signalements.
          </p>

          <form onSubmit={handleStartAdventure} className="space-y-4">
            <div className="text-left">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1.5">
                Choisissez votre Pseudo Chasseur :
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  autoFocus
                  maxLength={24}
                  value={pseudoInput}
                  onChange={(e) => setPseudoInput(e.target.value)}
                  placeholder="Ex: AltiMétéo_64, StormChaser75..."
                  className="w-full rounded-2xl border border-slate-700 bg-slate-900/90 pl-10 pr-4 py-3 text-sm font-bold text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black py-3.5 px-6 shadow-xl shadow-blue-600/40 transition-all duration-200 active:scale-95 cursor-pointer text-sm"
            >
              <span>Démarrer l'aventure (+100 pts offerts)</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notificationToast && (
        <div className="fixed top-20 right-4 z-50 flex items-center gap-3 rounded-2xl border border-amber-500/50 bg-slate-950/95 px-4 py-3 shadow-2xl backdrop-blur-md animate-in slide-in-from-top duration-300">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
            <Sparkles className="h-5 w-5 animate-spin" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">{notificationToast.message}</div>
            {notificationToast.points > 0 && (
              <div className="text-[11px] font-black text-amber-300">+{notificationToast.points} Points Chasseur Météo !</div>
            )}
          </div>
        </div>
      )}

      {/* 1. Hero Player Profile Card */}
      <div className="relative overflow-hidden rounded-3xl border border-blue-500/30 bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 p-6 sm:p-8 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-500 to-amber-300 text-slate-950 shadow-xl shadow-amber-500/30 font-black text-2xl">
              🏆
              <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-[10px] text-white font-black border-2 border-slate-900">
                #{leaderboard.find(l => l.isCurrentUser)?.rank || 1}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                {isEditingPseudo ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newPseudo}
                      onChange={(e) => setNewPseudo(e.target.value)}
                      className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-1 text-sm font-bold text-white focus:outline-none focus:border-blue-400"
                    />
                    <button
                      onClick={handleUpdatePseudo}
                      className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 cursor-pointer"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-black text-white">
                      {profile.pseudo}
                    </h2>
                    <button
                      onClick={() => {
                        setNewPseudo(profile.pseudo);
                        setIsEditingPseudo(true);
                      }}
                      className="text-slate-400 hover:text-white p-1 transition cursor-pointer"
                      title="Modifier le pseudo"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] font-bold">
                  {leaderboard.find(l => l.isCurrentUser)?.badgeTitle || 'Chasseur Météo'}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-300">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                  <strong>{profile.visitedLocations.length}</strong> lieux découverts
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Award className="h-3.5 w-3.5 text-amber-400" />
                  <strong>{profile.unlockedWeatherIds.length}</strong> trophées météo
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-sky-400" />
                  <strong>{profile.minutesSpent}</strong> min actives (+10 pts/min)
                </span>
              </div>
            </div>
          </div>

          {/* Points & Flammes Streak Badges */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Flammes de connexion */}
            <div className="flex-1 sm:flex-initial flex items-center gap-3 rounded-2xl border border-amber-500/30 bg-amber-950/40 px-4 py-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
                <Flame className="h-6 w-6 text-amber-400 animate-bounce" />
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                  Flammes de Connexion
                </div>
                <div className="text-base sm:text-lg font-black text-white">
                  🔥 {profile.streakDays} jour{profile.streakDays > 1 ? 's' : ''} de suite
                </div>
              </div>
            </div>

            {/* Total Points */}
            <div className="flex-1 sm:flex-initial flex items-center gap-3 rounded-2xl border border-blue-500/40 bg-blue-950/40 px-5 py-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400">
                <Sparkles className="h-6 w-6 text-cyan-300" />
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-wider text-blue-300">
                  Score Total
                </div>
                <div className="text-xl sm:text-2xl font-black text-amber-300 tabular-nums">
                  {profile.totalPoints} <span className="text-xs font-normal text-slate-300">pts</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Multiplier Progress Banner */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-indigo-600 font-black text-white text-[11px] shadow-sm">
              Multiplicateur Actif : {multiplierInfo.label}
            </span>
            <span className="text-slate-300 font-medium">
              {multiplierInfo.nextTier}
            </span>
          </div>
          <div className="text-[11px] text-slate-400">
            Paliers : 1 mois (30j) = <strong>x2</strong> • 1 an (365j) = <strong>x3</strong> • 4 ans (1460j) = <strong>x10</strong>
          </div>
        </div>

        {/* Cloudflare D1 Live Sync Bar */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              Base de Données Cloudflare :
            </span>
            {isD1Active ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 text-[11px] font-black">
                <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
                Cloudflare D1 (SQL Connecté)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950 text-amber-300 border border-amber-500/30 text-[11px] font-bold">
                <Server className="h-3 w-3 text-amber-400" />
                Mode Local (Prêt pour D1)
              </span>
            )}
            {isSyncingD1 && (
              <span className="text-[10px] text-cyan-400 animate-pulse flex items-center gap-1">
                <RefreshCw className="h-3 w-3 animate-spin" /> Synchronisation D1...
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isD1Active && (
              <button
                onClick={() => syncWithD1(profile)}
                disabled={isSyncingD1}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold transition border border-slate-700 cursor-pointer active:scale-95"
                title="Synchroniser immédiatement mes points avec Cloudflare D1"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isSyncingD1 ? 'animate-spin' : ''}`} />
                <span>Synchroniser D1</span>
              </button>
            )}
            <button
              onClick={() => setIsD1ConfigOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 text-xs font-black transition border border-blue-500/40 cursor-pointer active:scale-95"
            >
              <Database className="h-3.5 w-3.5 text-blue-400" />
              <span>{isD1Active ? 'Paramètres D1' : '📡 Configurer Cloudflare D1'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Quick Action Panels: Geolocation Discovery, Community & Amazon Bonus */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Geo Discovery */}
        <div className="rounded-3xl border border-emerald-500/30 bg-slate-900/90 p-5 shadow-xl space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
              <Navigation className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-black text-sm text-white">Géolocalisation & Lieux</h3>
              <p className="text-[11px] text-slate-400">Visitez de nouvelles communes pour remporter +75 pts</p>
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Position Actuelle :</span>
            <span className="font-black text-white text-sm">📍 {currentStation.name}</span>
            <span className="text-slate-400 block text-[11px]">
              {currentStation.latitude.toFixed(3)}°, {currentStation.longitude.toFixed(3)}° • Alt. {currentStation.altitude || 0}m
            </span>
          </div>

          <button
            onClick={handleRegisterLocation}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 text-xs shadow-lg shadow-emerald-600/30 transition cursor-pointer active:scale-95"
          >
            <Navigation className="h-3.5 w-3.5" />
            <span>Enregistrer ce lieu (+75 pts)</span>
          </button>
        </div>

        {/* Community Weather Reporting */}
        <div className="rounded-3xl border border-blue-500/30 bg-slate-900/90 p-5 shadow-xl space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-black text-sm text-white">Carte Collaborative</h3>
              <p className="text-[11px] text-slate-400">Partagez vos constats météo sur la carte publique</p>
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Vos Signalements :</span>
            <span className="font-black text-white text-sm">{profile.communityReportsCount} observation(s)</span>
            <span className="text-blue-300 block text-[11px]">
              Chaque observation validée rapporte +150 points !
            </span>
          </div>

          <button
            onClick={() => onNavigateToTab && onNavigateToTab('communityReports')}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 text-xs shadow-lg shadow-blue-600/30 transition cursor-pointer active:scale-95"
          >
            <Radio className="h-3.5 w-3.5" />
            <span>Ouvrir la Carte Collaborative</span>
          </button>
        </div>

        {/* Amazon Partner Bonus */}
        <div className="rounded-3xl border border-amber-500/30 bg-slate-900/90 p-5 shadow-xl space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
              <Gift className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-black text-sm text-white">Bonus Partenaire Amazon</h3>
              <p className="text-[11px] text-slate-400">Consultez les équipements météo en bas de page</p>
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Récompenses Réclamées :</span>
            <span className="font-black text-amber-300 text-sm">{profile.amazonBonusesClaimed} bonus</span>
            <span className="text-slate-400 block text-[11px]">
              +50 pts bonus par découverte d'équipement météo !
            </span>
          </div>

          <a
            href={AMAZON_AFFILIATE_LINKS.QXMCOV_WEATHER_STATION}
            target="_blank"
            rel="noopener noreferrer sponsored"
            onClick={handleClaimAmazonBonus}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold py-2.5 text-xs shadow-lg shadow-amber-600/30 transition cursor-pointer active:scale-95"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>Découvrir sur Amazon (+50 pts)</span>
          </a>
        </div>
      </div>

      {/* 3. Weather Conditions & Badges Catalog */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/30 text-indigo-400">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-white">Trophées Météo Rencontrés (10 Phénomènes)</h3>
              <p className="text-xs text-slate-400">
                Débloqués automatiquement lors de vos déplacements selon les relevés météo réels.
              </p>
            </div>
          </div>

          <span className="text-xs font-black px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-indigo-300">
            {profile.unlockedWeatherIds.length} / {WEATHER_BADGES_CATALOG.length} Débloqués
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {WEATHER_BADGES_CATALOG.map(badge => {
            const isUnlocked = profile.unlockedWeatherIds.includes(badge.id);
            return (
              <div
                key={badge.id}
                className={`relative flex flex-col justify-between p-3.5 rounded-2xl border transition-all ${
                  isUnlocked
                    ? 'bg-gradient-to-b from-indigo-950/60 to-slate-950 border-indigo-500/50 shadow-lg shadow-indigo-950/50'
                    : 'bg-slate-950/70 border-slate-800/80 opacity-60 grayscale hover:opacity-80'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{badge.emoji}</span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                    isUnlocked ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-800 text-slate-400'
                  }`}>
                    +{badge.points} pts
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-xs text-white leading-tight mb-1">{badge.name}</h4>
                  <p className="text-[10px] text-slate-400 line-clamp-2 leading-tight">{badge.description}</p>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-800/80 text-[10px] font-bold">
                  {isUnlocked ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" /> Validé
                    </span>
                  ) : (
                    <span className="text-slate-500">À rencontrer</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Visited Locations Log */}
      {profile.visitedLocations.length > 0 && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-sm text-white flex items-center gap-2">
              <MapPin className="h-4 w-4 text-emerald-400" />
              <span>Carnet d'Explorateur ({profile.visitedLocations.length} communes visitées)</span>
            </h3>
            <span className="text-xs text-slate-400">Enregistré dans votre base locale</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {profile.visitedLocations.map(loc => (
              <div
                key={loc.id}
                className="shrink-0 bg-slate-950 border border-slate-800 p-3 rounded-2xl min-w-[160px] text-xs space-y-1"
              >
                <div className="font-black text-white truncate">📍 {loc.name}</div>
                <div className="text-[10px] text-slate-400">
                  {loc.latitude.toFixed(2)}°, {loc.longitude.toFixed(2)}°
                </div>
                <div className="text-[10px] text-emerald-400 font-bold">
                  +{loc.pointsEarned} pts gagnés
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. National Leaderboard Table */}
      <div className="rounded-3xl border border-blue-500/30 bg-slate-900/90 p-6 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base text-white">Classement National des Chasseurs Météo</h3>
                {isD1Active ? (
                  <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40 text-[10px] font-black flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
                    Cloudflare D1 En Direct
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-bold">
                    Mode Local
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                {isD1Active 
                  ? 'Synchronisé en continu sur la base SQL Cloudflare D1 mondiale.' 
                  : 'Scores sauvegardés localement. Connectez Cloudflare D1 pour affronter les joueurs en ligne.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isD1Active && (
              <button
                onClick={() => syncWithD1(profile)}
                disabled={isSyncingD1}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-300 bg-slate-950 hover:bg-slate-850 px-3 py-1.5 rounded-xl border border-slate-800 transition cursor-pointer"
                title="Actualiser le classement D1"
              >
                <RefreshCw className={`h-3 w-3 ${isSyncingD1 ? 'animate-spin text-cyan-400' : ''}`} />
                <span>Actualiser</span>
              </button>
            )}

            <div className="text-xs font-bold text-slate-300 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
              Votre rang : <strong className="text-amber-400">#{currentRank}</strong> sur {totalPlayersCount}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-black uppercase text-slate-400">
                <th className="py-3 px-3">Rang</th>
                <th className="py-3 px-3">Chasseur</th>
                <th className="py-3 px-3">Flammes</th>
                <th className="py-3 px-3">Lieux</th>
                <th className="py-3 px-3">Trophées</th>
                <th className="py-3 px-3 text-right">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {leaderboard.map(entry => (
                <tr
                  key={entry.pseudo}
                  className={`transition ${
                    entry.isCurrentUser
                      ? 'bg-blue-600/20 border-l-4 border-l-blue-500 font-bold'
                      : 'hover:bg-slate-850'
                  }`}
                >
                  <td className="py-3 px-3">
                    <span className={`inline-flex items-center justify-center h-6 w-6 rounded-full font-black text-xs ${
                      entry.rank === 1 ? 'bg-amber-500 text-slate-950 shadow-md' :
                      entry.rank === 2 ? 'bg-slate-300 text-slate-950' :
                      entry.rank === 3 ? 'bg-amber-700 text-white' : 'text-slate-400'
                    }`}>
                      {entry.rank}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">
                        {entry.pseudo} {entry.isCurrentUser && '⭐ (Vous)'}
                      </span>
                      <span className="text-[9px] px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-slate-400 hidden sm:inline">
                        {entry.badgeTitle}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-bold text-amber-400">
                    🔥 {entry.streakDays} j
                  </td>
                  <td className="py-3 px-3 text-slate-300">
                    📍 {entry.locationsCount}
                  </td>
                  <td className="py-3 px-3 text-slate-300">
                    🎖️ {entry.badgesCount}
                  </td>
                  <td className="py-3 px-3 text-right font-black text-amber-300 text-sm tabular-nums">
                    {entry.points.toLocaleString()} pts
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Cloudflare D1 Interactive Configuration Modal */}
      {isD1ConfigOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl rounded-3xl border border-cyan-500/40 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  <Database className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white flex items-center gap-2">
                    Configuration Cloudflare D1
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                      SQL Serverless
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300">
                    Synchronisez vos points, flammes, trophées et signalements météo à l'échelle mondiale avec Cloudflare D1.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsD1ConfigOpen(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Input URL */}
            <div className="space-y-2 bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-300">
                URL de votre API Cloudflare Worker (D1) :
              </label>
              <div className="relative">
                <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="url"
                  value={d1UrlInput}
                  onChange={(e) => {
                    setD1UrlInput(e.target.value);
                    setD1TestFeedback(null);
                  }}
                  placeholder="https://instant-meteo-d1-api.votre-compte.workers.dev"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-4 py-3 text-xs sm:text-sm font-bold text-white placeholder-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30 focus:outline-none"
                />
              </div>

              {/* Feedback messages */}
              {d1TestFeedback && (
                <div className={`mt-2.5 p-3 rounded-xl text-xs font-bold flex items-center gap-2.5 border ${
                  d1TestFeedback.ok 
                    ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40' 
                    : 'bg-rose-950/60 text-rose-300 border-rose-500/40'
                }`}>
                  {d1TestFeedback.ok ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  ) : (
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                  )}
                  <span>{d1TestFeedback.message}</span>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <button
                  onClick={handleTestD1Connection}
                  disabled={d1Testing || !d1UrlInput.trim()}
                  className="flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-750 disabled:opacity-50 text-slate-200 font-bold px-4 py-2.5 text-xs transition border border-slate-700 cursor-pointer active:scale-95"
                >
                  <Wifi className="h-3.5 w-3.5 text-cyan-400" />
                  <span>{d1Testing ? 'Test en cours...' : 'Tester la connexion'}</span>
                </button>

                <button
                  onClick={handleSaveD1Config}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black px-5 py-2.5 text-xs transition shadow-lg shadow-cyan-600/30 cursor-pointer active:scale-95 ml-auto"
                >
                  <Check className="h-4 w-4" />
                  <span>Enregistrer & Activer D1</span>
                </button>

                {isD1Active && (
                  <button
                    onClick={() => {
                      setD1UrlInput('');
                      setD1WorkerUrl('');
                      setIsD1Active(false);
                      setRemoteLeaderboard(null);
                      setD1RankBadge(null);
                      setIsD1ConfigOpen(false);
                      showToast('D1 déconnecté (retour au mode local).', 0);
                    }}
                    className="text-[11px] text-slate-400 hover:text-rose-400 transition cursor-pointer px-2"
                  >
                    Désactiver D1 (Mode Local)
                  </button>
                )}
              </div>
            </div>

            {/* Quick Terminal Guide */}
            <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800/80">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-black text-slate-300">
                  <Terminal className="h-4 w-4 text-amber-400" />
                  <span>Déploiement D1 en 4 commandes (Dossier <code className="text-cyan-300 font-mono">cloudflare-d1/</code>)</span>
                </div>
                <button
                  onClick={handleCopyCommands}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-850 hover:bg-slate-800 text-[11px] font-bold text-slate-300 border border-slate-700 transition cursor-pointer"
                >
                  {copiedCommands ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copié !</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-slate-400" />
                      <span>Copier les commandes</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto leading-relaxed">
{`# 1. Aller dans le dossier cloudflare-d1
cd cloudflare-d1

# 2. Créer votre base SQL D1 gratuite sur Cloudflare
npx wrangler d1 create meteo-competitive-db
# (Collez l'ID retourné dans wrangler.toml)

# 3. Créer les tables SQL (Joueurs & Signalements)
npx wrangler d1 execute meteo-competitive-db --remote --file=./schema.sql

# 4. Déployer votre API Worker mondial
npx wrangler deploy`}
              </pre>

              <div className="text-[11px] text-slate-400 leading-relaxed">
                💡 Une fois déployé, collez l'URL finale fournie par Wrangler dans le champ ci-dessus. Tout le code prêt à l'emploi est déjà généré dans le dossier <strong>cloudflare-d1/</strong> !
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
