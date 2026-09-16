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
  Radio,
  RotateCcw,
  Trash2,
  AlertTriangle
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
  resetPlayerPoints,
  deletePlayerProfile,
  LeaderboardEntry,
  WEATHER_BADGES_CATALOG,
  addActiveMinute,
  getPlayerClass,
  PLAYER_CLASSES,
  PlayerClassTier
} from '../services/competitiveGameService';
import {
  getD1WorkerUrl,
  setD1WorkerUrl,
  isD1Configured,
  testD1Connection,
  fetchLeaderboardFromD1,
  syncPlayerProfileToD1,
  resetPlayerPointsInD1,
  deletePlayerFromD1,
  adminDeleteOtherUserAccount
} from '../services/cloudflareD1Service';
import { FRENCH_STATIONS } from '../data/frenchStations';
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
  Code,
  Crown
} from 'lucide-react';
import { LocationPoint, CurrentWeather } from '../types/weather';
import { AMAZON_AFFILIATE_LINKS } from '../config/affiliateLinks';

interface CompetitiveGamingViewProps {
  currentStation: LocationPoint;
  weather?: CurrentWeather | null;
  onNavigateToTab?: (tab: string) => void;
  seniorMode?: boolean;
  onOpenSearchModal?: () => void;
  onOpenAdminPanel?: () => void;
}

export const CompetitiveGamingView: React.FC<CompetitiveGamingViewProps> = ({
  currentStation,
  weather = null,
  onNavigateToTab,
  seniorMode = false,
  onOpenSearchModal,
  onOpenAdminPanel
}) => {
  const [profile, setProfile] = useState<PlayerProfile | null>(() => loadPlayerProfile());
  const [pseudoInput, setPseudoInput] = useState<string>('');
  const [isEditingPseudo, setIsEditingPseudo] = useState<boolean>(false);
  const [newPseudo, setNewPseudo] = useState<string>('');
  const [notificationToast, setNotificationToast] = useState<{ message: string; points: number } | null>(null);

  // Account Management Dialog States
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState<boolean>(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<boolean>(false);
  const [isClassesModalOpen, setIsClassesModalOpen] = useState<boolean>(false);
  const [secondsUntilNextPoint, setSecondsUntilNextPoint] = useState<number>(60);

  // Admin Account Deletion States
  const [adminDeletingPseudo, setAdminDeletingPseudo] = useState<string | null>(null);
  const [adminUserToDelete, setAdminUserToDelete] = useState<{ pseudo: string; id?: string } | null>(null);

  // Vraie géolocalisation GPS physique de l'appareil (fixée et indépendante des recherches de station)
  const [deviceGpsLocation, setDeviceGpsLocation] = useState<{
    name: string;
    department?: string;
    region?: string;
    latitude: number;
    longitude: number;
    altitude?: number;
  } | null>(() => {
    try {
      const saved = localStorage.getItem('instant_meteo_device_real_gps');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  });
  const [isLocatingDevice, setIsLocatingDevice] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const acquireDeviceGps = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setGpsError('La géolocalisation n\'est pas supportée par votre navigateur.');
      return;
    }
    setIsLocatingDevice(true);
    setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const uLat = pos.coords.latitude;
        const uLon = pos.coords.longitude;
        const uAlt = pos.coords.altitude ? Math.round(pos.coords.altitude) : 150;

        let detectedName = '';
        let detectedDept = '';
        let detectedReg = '';

        // Tentative de géocodage inverse précis
        try {
          const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${uLat}&longitude=${uLon}&localityLanguage=fr`);
          if (res.ok) {
            const data = await res.json();
            if (data.locality || data.city) {
              detectedName = data.locality || data.city;
              detectedDept = data.principalSubdivision || '';
              detectedReg = data.countryName || 'France';
            }
          }
        } catch (e) {
          console.warn('Geocoding notice:', e);
        }

        if (!detectedName) {
          let closest = FRENCH_STATIONS[0];
          let minDist = Number.MAX_VALUE;
          for (const st of FRENCH_STATIONS) {
            const dLat = st.latitude - uLat;
            const dLon = st.longitude - uLon;
            const d = Math.sqrt(dLat * dLat + dLon * dLon);
            if (d < minDist) {
              minDist = d;
              closest = st;
            }
          }
          detectedName = closest.name;
          detectedDept = closest.department || '';
          detectedReg = closest.region || '';
        }

        const realLoc = {
          name: detectedName,
          department: detectedDept,
          region: detectedReg,
          latitude: Number(uLat.toFixed(4)),
          longitude: Number(uLon.toFixed(4)),
          altitude: uAlt
        };

        try {
          localStorage.setItem('instant_meteo_device_real_gps', JSON.stringify(realLoc));
        } catch (e) {}

        setDeviceGpsLocation(realLoc);
        setIsLocatingDevice(false);
      },
      (err) => {
        console.warn('Erreur GPS appareil:', err);
        setGpsError('Autorisation GPS nécessaire pour détecter votre commune physique.');
        setIsLocatingDevice(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  };

  useEffect(() => {
    acquireDeviceGps();
  }, []);

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

  // Synchronisation avec Cloudflare D1 & Base de Données Centralisée
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

  // Chargement initial et synchronisation en direct toutes les 3.5 secondes
  // Permet de voir instantanément les joueurs créés sur d'autres appareils (PC <-> Téléphone)
  useEffect(() => {
    let isMounted = true;
    const fetchLatest = async () => {
      try {
        const remote = await fetchLeaderboardFromD1(profile);
        if (isMounted && remote !== null) {
          setRemoteLeaderboard(remote);
        }
      } catch (err) {
        // Silencieux
      }
    };

    fetchLatest();
    const interval = setInterval(fetchLatest, 3500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [profile?.pseudo]);

  useEffect(() => {
    if (profile) {
      syncWithD1(profile);
    }
  }, [profile?.totalPoints, profile?.pseudo, profile?.streakDays]);

  // Minuteur de gain de points par minute passée sur l'application (+10 pts x multiplicateur)
  useEffect(() => {
    if (!profile) return;

    const timer = setInterval(() => {
      if (document.hidden) return; // Ne pas compter si l'onglet est masqué

      setSecondsUntilNextPoint(prev => {
        if (prev <= 1) {
          const updated = addActiveMinute(profile);
          setProfile(updated);
          const { multiplier } = getMultiplier(updated.streakDays);
          const earned = 10 * multiplier;
          showToast(`⏱️ +${earned} pts gagnés pour 1 minute passée sur Instant Météo !`, earned);
          syncPlayerProfileToD1(updated).catch(() => {});
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [profile?.pseudo, profile?.totalPoints, profile?.streakDays]);

  const handleTestD1Connection = async () => {
    setD1Testing(true);
    setD1TestFeedback(null);
    const res = await testD1Connection(d1UrlInput.trim() || undefined);
    setD1Testing(false);
    setD1TestFeedback(res);
  };

  const handleSaveD1Config = async () => {
    setD1WorkerUrl(d1UrlInput);
    setIsD1Active(true);
    if (profile) {
      await syncWithD1(profile);
    }
    showToast('Base de données synchronisée et active !', 0);
    setIsD1ConfigOpen(false);
  };

  const handleCopyCommands = () => {
    const text = `# 1. Ouvrir le dossier cloudflare-d1\ncd cloudflare-d1\n\n# 2. Créer la base de données SQL D1\nnpx wrangler d1 create meteo-competitive-db\n\n# 3. Exécuter la création des tables\nnpx wrangler d1 execute meteo-competitive-db --remote --file=./schema.sql\n\n# 4. Déployer l'API Worker\nnpx wrangler deploy`;
    navigator.clipboard.writeText(text);
    setCopiedCommands(true);
    setTimeout(() => setCopiedCommands(false), 2500);
  };

  const handleAdminDeleteUser = async (targetPseudo: string, targetId?: string) => {
    setAdminDeletingPseudo(targetPseudo);
    try {
      const res = await adminDeleteOtherUserAccount(targetPseudo, targetId);
      if (res.success) {
        showToast(`Compte « ${targetPseudo} » supprimé de la base de données.`, 0);
        setRemoteLeaderboard(prev => prev ? prev.filter(p => p.pseudo.toLowerCase() !== targetPseudo.toLowerCase()) : []);
        setAdminUserToDelete(null);
        window.dispatchEvent(new CustomEvent('instant_meteo_score_updated'));
      } else {
        showToast(res.message || 'Erreur lors de la suppression.', 0);
      }
    } catch (e: any) {
      showToast(e?.message || 'Erreur lors de la suppression.', 0);
    } finally {
      setAdminDeletingPseudo(null);
    }
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
  const handleStartAdventure = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pseudoInput.trim()) return;
    const newProf = initPlayerProfile(pseudoInput.trim());
    setProfile(newProf);
    showToast('Bienvenue dans la Chasse Météo ! +100 points de bienvenue offerts', 100);
    await syncWithD1(newProf);
  };

  // Rename pseudo
  const handleUpdatePseudo = async () => {
    if (!profile || !newPseudo.trim()) return;
    const updated = { ...profile, pseudo: newPseudo.trim() };
    savePlayerProfile(updated);
    setProfile(updated);
    setIsEditingPseudo(false);
    showToast('Pseudo mis à jour avec succès !', 0);
    await syncWithD1(updated);
  };

  // Réinitialiser les points du joueur
  const handleResetPoints = async () => {
    if (!profile) return;
    const updated = resetPlayerPoints(profile);
    setProfile(updated);
    if (isD1Configured()) {
      await resetPlayerPointsInD1(profile.pseudo);
      await syncWithD1(updated);
    }
    setIsResetConfirmOpen(false);
    showToast('Vos points et votre progression ont été réinitialisés à 0.', 0);
  };

  // Supprimer le compte joueur
  const handleDeleteAccount = async () => {
    if (!profile) return;
    const oldPseudo = profile.pseudo;
    const oldId = profile.id;
    deletePlayerProfile();
    if (isD1Configured()) {
      await deletePlayerFromD1(oldPseudo, oldId);
      const remote = await fetchLeaderboardFromD1(null);
      if (remote) setRemoteLeaderboard(remote);
    }
    setProfile(null);
    setIsDeleteConfirmOpen(false);
    showToast('Compte supprimé avec succès. Vous pouvez créer un nouveau profil !', 0);
  };

  // Register current real GPS location for points (indépendant des recherches d'autres communes)
  const handleRegisterLocation = async () => {
    if (!profile) return;
    if (!deviceGpsLocation) {
      acquireDeviceGps();
      showToast('Veuillez activer votre géolocalisation pour valider votre commune réelle.', 0);
      return;
    }
    const result = registerVisitedLocation(profile, deviceGpsLocation as any);
    if (result.added) {
      setProfile(result.profile);
      showToast(`Nouveau lieu physique découvert : ${deviceGpsLocation.name} !`, result.points);
      await syncWithD1(result.profile);
    } else {
      showToast(`Vous avez déjà enregistré votre position réelle (${deviceGpsLocation.name}) !`, 0);
    }
  };

  // Claim Amazon partner bonus
  const handleClaimAmazonBonus = async () => {
    if (!profile) return;
    const res = claimAmazonBonus(profile);
    setProfile(res.profile);
    showToast('Bonus Découverte Équipement Amazon validé !', res.points);
    await syncWithD1(res.profile);
  };

  // Leaderboard data (Cloudflare D1 priority if connected, local fallback otherwise)
  const localLeaderboard = getLeaderboard(profile);
  const leaderboard = remoteLeaderboard !== null ? remoteLeaderboard : localLeaderboard;
  const currentRank = d1RankBadge?.rank || leaderboard.find(l => l.isCurrentUser)?.rank || 1;
  const totalPlayersCount = d1RankBadge?.total || leaderboard.length;
  const multiplierInfo = profile ? getMultiplier(profile.streakDays) : { multiplier: 1, label: 'x1', nextTier: '' };

  // If user has no pseudo yet, show onboarding card + live leaderboard below
  if (!profile) {
    return (
      <div className="space-y-4 max-w-4xl mx-auto">
        <div className="relative w-full rounded-lg border border-slate-800 bg-[#0F172A] p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-slate-800 text-amber-400 border border-slate-700 mb-4">
            <Trophy className="h-6 w-6" />
          </div>

          <h2 className="text-xl font-bold text-white mb-2">
            Arène Compétitive Chasse Météo
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mb-5 leading-relaxed max-w-lg mx-auto">
            Rejoignez le classement national. Remportez des points grâce à la géolocalisation des lieux visités, aux types de météos rencontrés, à vos flammes quotidiennes et aux signalements.
          </p>

          <form onSubmit={handleStartAdventure} className="space-y-3 max-w-md mx-auto">
            <div className="text-left">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Choisissez votre Pseudo Chasseur :
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  autoFocus
                  maxLength={24}
                  value={pseudoInput}
                  onChange={(e) => setPseudoInput(e.target.value)}
                  placeholder="Ex: teste1, teste2, AltiMétéo_64..."
                  className="w-full rounded-md border border-slate-700 bg-slate-900 pl-9 pr-3 py-2 text-sm font-semibold text-white placeholder-slate-500 focus:border-[#0284C7] focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-md bg-[#0284C7] hover:bg-sky-600 text-white font-semibold py-2.5 px-4 transition cursor-pointer text-xs"
            >
              <span>Démarrer l'aventure (+100 pts offerts)</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </form>

          {/* Live Network connection indicator */}
          <div className="mt-5 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-0.5 rounded-md text-[11px]">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Réseau Connecté
              </span>
              <span>Synchronisation en direct</span>
            </div>

            {onOpenAdminPanel && (
              <button
                type="button"
                onClick={onOpenAdminPanel}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-amber-500/30 bg-amber-950/30 hover:bg-amber-900/40 text-amber-300 font-semibold text-xs cursor-pointer"
                title="Accès Administrateur / Code Secret"
              >
                <Crown className="h-3.5 w-3.5 text-amber-400" />
                <span>Code Secret Admin</span>
              </button>
            )}
          </div>
        </div>

        {/* Live National Leaderboard Preview */}
        <div className="rounded-lg border border-slate-800 bg-[#0F172A] p-5 space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-800 text-amber-400 border border-slate-700">
                <Trophy className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-white">Classement National des Chasseurs Météo</h3>
                  <span className="px-2 py-0.5 rounded-md bg-sky-950 text-sky-300 border border-sky-500/30 text-[10px] font-semibold flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                    En Direct
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {leaderboard.length} observateur(s) actuellement en compétition.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                fetchLeaderboardFromD1(null).then(res => {
                  if (res) setRemoteLeaderboard(res);
                });
              }}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 px-3 py-1.5 rounded-md border border-slate-800 transition cursor-pointer"
            >
              <RefreshCw className="h-3 w-3 text-sky-400" />
              <span>Actualiser</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-semibold uppercase text-slate-400">
                  <th className="py-2.5 px-3">Rang</th>
                  <th className="py-2.5 px-3">Chasseur</th>
                  <th className="py-2.5 px-3">Flammes</th>
                  <th className="py-2.5 px-3">Lieux</th>
                  <th className="py-2.5 px-3">Trophées</th>
                  <th className="py-2.5 px-3 text-right">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {leaderboard.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-400">
                      {remoteLeaderboard === null 
                        ? 'Chargement des joueurs depuis la base de données...' 
                        : 'Aucun joueur enregistré pour le moment. Créez votre pseudo ci-dessus pour figurer en 1ère place !'}
                    </td>
                  </tr>
                ) : (
                  leaderboard.map(entry => (
                    <tr key={entry.pseudo} className="hover:bg-slate-900/60 transition">
                      <td className="py-2.5 px-3">
                        <span className={`inline-flex items-center justify-center h-5 w-5 rounded-full font-bold text-xs ${
                          entry.rank === 1 ? 'bg-amber-500 text-slate-950' :
                          entry.rank === 2 ? 'bg-slate-300 text-slate-950' :
                          entry.rank === 3 ? 'bg-amber-700 text-white' : 'text-slate-400'
                        }`}>
                          {entry.rank}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">{entry.pseudo}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 hidden sm:inline">
                            {entry.badgeTitle}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-amber-400">🔥 {entry.streakDays} j</td>
                      <td className="py-2.5 px-3 text-slate-300">📍 {entry.locationsCount}</td>
                      <td className="py-2.5 px-3 text-slate-300">🎖️ {entry.badgesCount}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-amber-300 text-xs tabular-nums">
                        {entry.points.toLocaleString()} pts
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {notificationToast && (
        <div className="fixed top-16 right-4 z-50 flex items-center gap-2.5 rounded-md border border-amber-500/40 bg-slate-900 px-3.5 py-2.5 shadow-lg">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-800 text-amber-400">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-white">{notificationToast.message}</div>
            {notificationToast.points > 0 && (
              <div className="text-[11px] font-bold text-amber-300">+{notificationToast.points} Points Chasseur Météo !</div>
            )}
          </div>
        </div>
      )}

      {/* 1. Hero Player Profile Card */}
      <div className="rounded-lg border border-slate-800 bg-[#0F172A] p-5">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div className="flex items-center gap-3.5">
            <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-slate-800 border border-slate-700 text-slate-100 font-bold text-xl">
              🏆
              <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#0284C7] text-[10px] text-white font-bold border border-slate-900">
                #{leaderboard.find(l => l.isCurrentUser)?.rank || 1}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                {isEditingPseudo ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={newPseudo}
                      onChange={(e) => setNewPseudo(e.target.value)}
                      className="rounded-md border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white focus:outline-none focus:border-[#0284C7]"
                    />
                    <button
                      onClick={handleUpdatePseudo}
                      className="p-1 rounded-md bg-emerald-600 text-white hover:bg-emerald-500 cursor-pointer"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-white">
                      {profile.pseudo}
                    </h2>
                    <button
                      onClick={() => {
                        setNewPseudo(profile.pseudo);
                        setIsEditingPseudo(true);
                      }}
                      className="text-slate-400 hover:text-white p-0.5 transition cursor-pointer"
                      title="Modifier le pseudo"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
                {/* Classe Météo Dynamique */}
                {(() => {
                  const currentClass = getPlayerClass(profile?.totalPoints || 0);
                  return (
                    <button
                      type="button"
                      onClick={() => setIsClassesModalOpen(true)}
                      className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold border flex items-center gap-1.5 transition cursor-pointer hover:bg-slate-850 ${currentClass.color}`}
                      title="Voir toutes les classes météorologiques"
                    >
                      <span>{currentClass.emoji}</span>
                      <span>{currentClass.name}</span>
                      <ChevronRight className="h-3 w-3 opacity-60" />
                    </button>
                  );
                })()}

                {onOpenAdminPanel && (
                  <button
                    type="button"
                    onClick={onOpenAdminPanel}
                    className="flex items-center gap-1.5 px-2 py-0.5 rounded-md border border-amber-500/30 bg-amber-950/30 hover:bg-amber-900/40 text-amber-300 font-semibold text-[10px] cursor-pointer"
                    title="Accès Administrateur / Code Secret"
                  >
                    <Crown className="h-3 w-3 text-amber-400" />
                    <span>{profile?.isAdmin ? 'Panneau Admin' : 'Code Secret Admin'}</span>
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2.5 mt-1.5 text-xs text-slate-300">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                  <strong>{profile.visitedLocations.length}</strong> lieux
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Award className="h-3.5 w-3.5 text-amber-400" />
                  <strong>{profile.unlockedWeatherIds.length}</strong> trophées
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-sky-200">
                  <Clock className="h-3 w-3 text-sky-400" />
                  <strong>{profile.minutesSpent} min</strong> actives
                  <span className="text-[10px] text-amber-300 font-mono font-semibold ml-1">
                    ({secondsUntilNextPoint}s)
                  </span>
                </span>
              </div>

              {/* Barre de progression vers le rang suivant */}
              {(() => {
                const currentClass = getPlayerClass(profile?.totalPoints || 0);
                const currentClassIdx = PLAYER_CLASSES.findIndex(c => c.id === currentClass.id);
                const nextClass = currentClassIdx < PLAYER_CLASSES.length - 1 ? PLAYER_CLASSES[currentClassIdx + 1] : null;
                if (!nextClass) {
                  return (
                    <div className="mt-1.5 text-[10px] font-semibold text-amber-300 flex items-center gap-1">
                      👑 Rang Maximum atteint : Légende Climatologique !
                    </div>
                  );
                }
                const ptsDiff = nextClass.minPoints - currentClass.minPoints;
                const ptsProgress = Math.max(0, (profile?.totalPoints || 0) - currentClass.minPoints);
                const pct = Math.min(100, Math.round((ptsProgress / ptsDiff) * 100));
                return (
                  <div className="mt-2 max-w-md">
                    <div className="flex items-center justify-between text-[10px] font-semibold text-slate-300 mb-0.5">
                      <span>Prochain : <strong className="text-white">{nextClass.name} {nextClass.emoji}</strong></span>
                      <span className="text-amber-300">{profile?.totalPoints} / {nextClass.minPoints} pts ({pct}%)</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                      <div 
                        className="h-full bg-[#0284C7] transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Points & Flammes Streak Badges */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            {/* Flammes de connexion */}
            <div className="flex-1 sm:flex-initial flex items-center gap-2.5 rounded-md border border-slate-800 bg-slate-900 px-3.5 py-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-800 text-amber-400">
                <Flame className="h-4 w-4 text-amber-400" />
              </div>
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Flammes
                </div>
                <div className="text-sm font-bold text-white">
                  🔥 {profile.streakDays} j
                </div>
              </div>
            </div>

            {/* Total Points */}
            <div className="flex-1 sm:flex-initial flex items-center gap-2.5 rounded-md border border-slate-800 bg-slate-900 px-4 py-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-800 text-sky-400">
                <Sparkles className="h-4 w-4 text-sky-400" />
              </div>
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Score Total
                </div>
                <div className="text-base font-bold text-amber-300 tabular-nums">
                  {profile.totalPoints} <span className="text-xs font-normal text-slate-400">pts</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Multiplier Progress Banner */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5 text-xs">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-slate-800 font-semibold text-sky-300 text-[10px]">
              Multiplicateur : {multiplierInfo.label}
            </span>
            <span className="text-slate-400 text-xs">
              {multiplierInfo.nextTier}
            </span>
          </div>
          <div className="text-[10px] text-slate-500">
            Paliers : 30j = x2 • 365j = x3 • 1460j = x10
          </div>
        </div>

        {/* Account Management Bar */}
        <div className="mt-3 pt-2.5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <User className="h-3 w-3 text-slate-400" />
            <span>Gestion du profil</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsResetConfirmOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-amber-300 text-xs font-medium transition border border-slate-800 cursor-pointer"
              title="Remettre vos points à zéro"
            >
              <RotateCcw className="h-3 w-3 text-amber-400" />
              <span>Réinitialiser les points</span>
            </button>
            <button
              onClick={() => setIsDeleteConfirmOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-rose-300 text-xs font-medium transition border border-slate-800 cursor-pointer"
              title="Supprimer mon compte"
            >
              <Trash2 className="h-3 w-3 text-rose-400" />
              <span>Supprimer mon compte</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Quick Action Panels: Geolocation Discovery, Community & Amazon Bonus */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Geo Discovery */}
        <div className="rounded-lg border border-slate-800 bg-[#0F172A] p-4 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-800 text-emerald-400">
              <Navigation className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-xs text-white">Géolocalisation</h3>
              <p className="text-[11px] text-slate-400">Enregistrez votre commune réelle (+75 pts)</p>
            </div>
          </div>

          <div className="bg-slate-900 p-2.5 rounded-md border border-slate-800 text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Position GPS :</span>
              <button
                onClick={acquireDeviceGps}
                disabled={isLocatingDevice}
                className="text-[10px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold cursor-pointer"
                title="Actualiser ma position GPS"
              >
                <RefreshCw className={`h-2.5 w-2.5 ${isLocatingDevice ? 'animate-spin' : ''}`} />
                <span>Actualiser</span>
              </button>
            </div>
            {deviceGpsLocation ? (
              <>
                <span className="font-semibold text-white text-xs block">
                  📍 {deviceGpsLocation.name} {deviceGpsLocation.department ? `(${deviceGpsLocation.department})` : ''}
                </span>
                <span className="text-slate-400 block text-[10px]">
                  {deviceGpsLocation.latitude.toFixed(3)}°, {deviceGpsLocation.longitude.toFixed(3)}° • Alt. {deviceGpsLocation.altitude || 0}m
                </span>
              </>
            ) : (
              <div className="py-1">
                <span className="text-amber-400 text-xs block">
                  {gpsError || 'Recherche de votre commune physique...'}
                </span>
                <button
                  onClick={acquireDeviceGps}
                  className="mt-1 px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[10px] font-semibold border border-emerald-500/40 cursor-pointer"
                >
                  Activer la géolocalisation
                </button>
              </div>
            )}
          </div>

          <button
            onClick={handleRegisterLocation}
            disabled={!deviceGpsLocation || isLocatingDevice}
            className={`w-full flex items-center justify-center gap-1.5 rounded-md font-semibold py-2 text-xs transition cursor-pointer ${
              deviceGpsLocation 
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white' 
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Navigation className="h-3.5 w-3.5" />
            <span>Enregistrer ma position (+75 pts)</span>
          </button>
        </div>

        {/* Community Weather Reporting */}
        <div className="rounded-lg border border-slate-800 bg-[#0F172A] p-4 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-800 text-[#0284C7]">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-xs text-white">Carte Collaborative</h3>
              <p className="text-[11px] text-slate-400">Partagez vos constats météo</p>
            </div>
          </div>

          <div className="bg-slate-900 p-2.5 rounded-md border border-slate-800 text-xs">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Vos Signalements :</span>
            <span className="font-bold text-white text-xs">{profile.communityReportsCount} observation(s)</span>
            <span className="text-sky-300 block text-[10px] mt-0.5">
              Chaque observation validée rapporte +150 points
            </span>
          </div>

          <button
            onClick={() => onNavigateToTab && onNavigateToTab('communityReports')}
            className="w-full flex items-center justify-center gap-1.5 rounded-md bg-[#0284C7] hover:bg-sky-600 text-white font-semibold py-2 text-xs transition cursor-pointer"
          >
            <Radio className="h-3.5 w-3.5" />
            <span>Ouvrir la Carte Collaborative</span>
          </button>
        </div>

        {/* Amazon Partner Bonus */}
        <div className="rounded-lg border border-slate-800 bg-[#0F172A] p-4 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-800 text-amber-400">
              <Gift className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-xs text-white">Bonus Matériel Météo</h3>
              <p className="text-[11px] text-slate-400">Consultez les équipements météo</p>
            </div>
          </div>

          <div className="bg-slate-900 p-2.5 rounded-md border border-slate-800 text-xs">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Bonus Réclamés :</span>
            <span className="font-bold text-amber-300 text-xs">{profile.amazonBonusesClaimed} bonus</span>
            <span className="text-slate-400 block text-[10px] mt-0.5">
              +50 pts bonus par découverte
            </span>
          </div>

          <a
            href={AMAZON_AFFILIATE_LINKS.QXMCOV_WEATHER_STATION}
            target="_blank"
            rel="noopener noreferrer sponsored"
            onClick={handleClaimAmazonBonus}
            className="w-full flex items-center justify-center gap-1.5 rounded-md bg-amber-600 hover:bg-amber-500 text-white font-semibold py-2 text-xs transition cursor-pointer"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>Découvrir sur Amazon (+50 pts)</span>
          </a>
        </div>
      </div>

      {/* 3. Weather Conditions & Badges Catalog */}
      <div className="rounded-lg border border-slate-800 bg-[#0F172A] p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-800 text-amber-400">
              <Award className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Trophées Météo (10 Phénomènes)</h3>
              <p className="text-xs text-slate-400">
                Débloqués automatiquement selon les relevés météo réels de votre position.
              </p>
            </div>
          </div>

          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
            {profile.unlockedWeatherIds.length} / {WEATHER_BADGES_CATALOG.length} Débloqués
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {WEATHER_BADGES_CATALOG.map(badge => {
            const isUnlocked = profile.unlockedWeatherIds.includes(badge.id);
            return (
              <div
                key={badge.id}
                className={`flex flex-col justify-between p-3 rounded-md border transition ${
                  isUnlocked
                    ? 'bg-slate-900 border-sky-500/40 text-white'
                    : 'bg-slate-950 border-slate-800 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xl">{badge.emoji}</span>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                    isUnlocked ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-800 text-slate-400'
                  }`}>
                    +{badge.points} pts
                  </span>
                </div>

                <div>
                  <h4 className="font-semibold text-xs text-white leading-tight mb-1">{badge.name}</h4>
                  <p className="text-[10px] text-slate-400 line-clamp-2 leading-tight">{badge.description}</p>
                </div>

                <div className="mt-2 pt-1.5 border-t border-slate-800 text-[10px] font-medium">
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
        <div className="rounded-lg border border-slate-800 bg-[#0F172A] p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <MapPin className="h-4 w-4 text-emerald-400" />
              <span>Carnet d'Explorateur ({profile.visitedLocations.length} communes visitées)</span>
            </h3>
            <span className="text-xs text-slate-400">Enregistré dans votre profil</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {profile.visitedLocations.map(loc => (
              <div
                key={loc.id}
                className="shrink-0 bg-slate-900 border border-slate-800 p-2.5 rounded-md min-w-[150px] text-xs space-y-0.5"
              >
                <div className="font-semibold text-white truncate">📍 {loc.name}</div>
                <div className="text-[10px] text-slate-400">
                  {loc.latitude.toFixed(2)}°, {loc.longitude.toFixed(2)}°
                </div>
                <div className="text-[10px] text-emerald-400 font-medium">
                  +{loc.pointsEarned} pts gagnés
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. National Leaderboard Table */}
      <div className="rounded-lg border border-slate-800 bg-[#0F172A] p-5 space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-800 text-amber-400">
              <Trophy className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white">Classement National des Chasseurs Météo</h3>
                {isD1Active && (
                  <span className="px-2 py-0.5 rounded-md bg-sky-950 text-sky-300 border border-sky-500/30 text-[10px] font-semibold flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                    En Direct
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Classement en temps réel des observateurs et passionnés de météorologie.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isD1Active && (
              <button
                onClick={() => syncWithD1(profile)}
                disabled={isSyncingD1}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-800 transition cursor-pointer"
                title="Actualiser le classement D1"
              >
                <RefreshCw className={`h-3 w-3 ${isSyncingD1 ? 'animate-spin text-sky-400' : ''}`} />
                <span>Actualiser</span>
              </button>
            )}

            <div className="text-xs font-semibold text-slate-300 bg-slate-900 px-3 py-1 rounded-md border border-slate-800">
              Votre rang : <strong className="text-amber-400">#{currentRank}</strong> sur {totalPlayersCount}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-semibold uppercase text-slate-400">
                <th className="py-2.5 px-3">Rang</th>
                <th className="py-2.5 px-3">Chasseur</th>
                <th className="py-2.5 px-3">Flammes</th>
                <th className="py-2.5 px-3">Lieux</th>
                <th className="py-2.5 px-3">Trophées</th>
                <th className="py-2.5 px-3 text-right">Points</th>
                {profile?.isAdmin && <th className="py-2.5 px-3 text-right">Admin</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {leaderboard.length === 0 ? (
                <tr>
                  <td colSpan={profile?.isAdmin ? 7 : 6} className="py-6 text-center text-slate-400">
                    <p className="text-xs font-semibold text-slate-300">Aucun joueur enregistré pour le moment.</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Créez votre pseudo ci-dessus pour figurer en 1ère place du classement.</p>
                  </td>
                </tr>
              ) : (
                leaderboard.map(entry => (
                  <tr
                    key={entry.pseudo}
                    className={`transition ${
                      entry.isCurrentUser
                        ? 'bg-sky-950/40 border-l-2 border-l-[#0284C7] font-semibold'
                        : 'hover:bg-slate-900/60'
                    }`}
                  >
                    <td className="py-2.5 px-3">
                      <span className={`inline-flex items-center justify-center h-5 w-5 rounded-full font-bold text-xs ${
                        entry.rank === 1 ? 'bg-amber-500 text-slate-950' :
                        entry.rank === 2 ? 'bg-slate-300 text-slate-950' :
                        entry.rank === 3 ? 'bg-amber-700 text-white' : 'text-slate-400'
                      }`}>
                        {entry.rank}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">
                          {entry.pseudo} {entry.isCurrentUser && '⭐ (Vous)'}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 hidden sm:inline">
                          {entry.badgeTitle}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-amber-400">
                      🔥 {entry.streakDays} j
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">
                      📍 {entry.locationsCount}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">
                      🎖️ {entry.badgesCount}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-amber-300 text-xs tabular-nums">
                      {entry.points.toLocaleString()} pts
                    </td>
                    {profile?.isAdmin && (
                      <td className="py-2.5 px-3 text-right">
                        {!entry.isCurrentUser && (
                          <button
                            type="button"
                            onClick={() => setAdminUserToDelete({ pseudo: entry.pseudo })}
                            disabled={adminDeletingPseudo === entry.pseudo}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-950 hover:bg-red-900 border border-red-500/40 text-red-300 text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                            title={`Supprimer le compte de ${entry.pseudo}`}
                          >
                            <Trash2 className="h-3 w-3 text-red-400" />
                            <span>Supprimer</span>
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Cloudflare D1 Interactive Configuration Modal */}
      {isD1ConfigOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl rounded-lg border border-slate-700 bg-[#0F172A] p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-800 text-sky-300 border border-slate-700">
                  <Database className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    Configuration Base Centralisée
                    <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-500/30">
                      Cloudflare D1
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300">
                    Synchronisez vos points, flammes et trophées météo à l'échelle nationale.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsD1ConfigOpen(false)}
                className="rounded-md p-1 text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Input URL */}
            <div className="space-y-2 bg-slate-900 p-3.5 rounded-md border border-slate-800">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                URL de votre API Cloudflare Worker (D1) :
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="url"
                  value={d1UrlInput}
                  onChange={(e) => {
                    setD1UrlInput(e.target.value);
                    setD1TestFeedback(null);
                  }}
                  placeholder="https://instant-meteo-d1-api.votre-compte.workers.dev"
                  className="w-full rounded-md border border-slate-700 bg-slate-950 pl-9 pr-3 py-2 text-xs sm:text-sm font-semibold text-white placeholder-slate-500 focus:border-[#0284C7] focus:outline-none"
                />
              </div>

              {/* Feedback messages */}
              {d1TestFeedback && (
                <div className={`mt-2 p-2.5 rounded-md text-xs font-semibold flex items-center gap-2 border ${
                  d1TestFeedback.ok 
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40' 
                    : 'bg-rose-950 text-rose-300 border-rose-500/40'
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
              <div className="flex flex-wrap items-center gap-2 pt-1.5">
                <button
                  onClick={handleTestD1Connection}
                  disabled={d1Testing}
                  className="flex items-center gap-1.5 rounded-md bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 font-semibold px-3 py-1.5 text-xs transition border border-slate-700 cursor-pointer"
                >
                  <Wifi className="h-3.5 w-3.5 text-sky-400" />
                  <span>{d1Testing ? 'Test en cours...' : (d1UrlInput.trim() ? 'Tester le Worker' : 'Tester la Base Centrale')}</span>
                </button>

                <button
                  onClick={handleSaveD1Config}
                  className="flex items-center gap-1.5 rounded-md bg-[#0284C7] hover:bg-sky-600 text-white font-semibold px-4 py-1.5 text-xs transition cursor-pointer ml-auto"
                >
                  <Check className="h-4 w-4" />
                  <span>Enregistrer & Synchroniser</span>
                </button>

                {d1UrlInput.trim() && (
                  <button
                    onClick={() => {
                      setD1UrlInput('');
                      setD1WorkerUrl('');
                      setIsD1Active(true);
                      syncWithD1(profile);
                      setIsD1ConfigOpen(false);
                      showToast('Base réinitialisée sur le serveur central.', 0);
                    }}
                    className="text-[11px] text-slate-400 hover:text-sky-300 transition cursor-pointer px-2"
                  >
                    Réinitialiser sur le serveur central
                  </button>
                )}
              </div>
            </div>

            {/* Quick Terminal Guide */}
            <div className="space-y-2.5 bg-slate-900 p-3.5 rounded-md border border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                  <Terminal className="h-4 w-4 text-amber-400" />
                  <span>Commandes D1 (Dossier <code className="text-sky-300 font-mono">cloudflare-d1/</code>)</span>
                </div>
                <button
                  onClick={handleCopyCommands}
                  className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-750 text-[11px] font-semibold text-slate-300 border border-slate-700 transition cursor-pointer"
                >
                  {copiedCommands ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copié</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-slate-400" />
                      <span>Copier</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="p-2.5 rounded bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto leading-relaxed">
{`cd cloudflare-d1
npx wrangler d1 create meteo-competitive-db
npx wrangler d1 execute meteo-competitive-db --remote --file=./schema.sql
npx wrangler deploy`}
              </pre>

              <div className="text-[11px] text-slate-400 leading-relaxed">
                Collez l'URL finale fournie par Wrangler dans le champ ci-dessus. Tout le code est disponible dans le dossier <strong>cloudflare-d1/</strong>.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmation : Réinitialiser ses points */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-lg border border-amber-500/40 bg-[#0F172A] p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-800 text-amber-400 border border-slate-700">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Réinitialiser vos points ?</h3>
                <p className="text-xs text-slate-400">Cette action remettra votre score à zéro.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 bg-slate-900 p-3 rounded-md border border-slate-800 leading-relaxed">
              Vos points, lieux enregistrés et trophées seront remis à zéro. Votre pseudo ({profile?.pseudo}) et vos flammes quotidiennes seront conservés.
            </p>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={handleResetPoints}
                className="px-3 py-1.5 rounded-md bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition cursor-pointer"
              >
                Confirmer la réinitialisation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmation : Supprimer son compte */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-lg border border-rose-500/40 bg-[#0F172A] p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-800 text-rose-400 border border-slate-700">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Supprimer votre compte ?</h3>
                <p className="text-xs text-slate-400">Suppression définitive du profil joueur.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 bg-slate-900 p-3 rounded-md border border-slate-800 leading-relaxed">
              Votre compte actuel <strong>{profile?.pseudo}</strong>, tous vos points, flammes et badges seront totalement supprimés. Vous pourrez créer un nouveau profil avec un nouveau pseudo.
            </p>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteAccount}
                className="px-3 py-1.5 rounded-md bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition cursor-pointer"
              >
                Supprimer le compte
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmation : Supprimer le compte d'un autre joueur (Admin) */}
      {adminUserToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-lg border border-rose-500/40 bg-[#0F172A] p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-800 text-rose-400 border border-slate-700">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Supprimer ce joueur ?</h3>
                <p className="text-xs text-rose-300 font-semibold">Action Administrateur</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 bg-slate-900 p-3 rounded-md border border-slate-800 leading-relaxed">
              Êtes-vous sûr de vouloir supprimer définitivement le compte de <strong>« {adminUserToDelete.pseudo} »</strong> ? Ses points et trophées seront effacés de la base.
            </p>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setAdminUserToDelete(null)}
                className="px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={adminDeletingPseudo === adminUserToDelete.pseudo}
                onClick={() => handleAdminDeleteUser(adminUserToDelete.pseudo, adminUserToDelete.id)}
                className="px-3 py-1.5 rounded-md bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {adminDeletingPseudo === adminUserToDelete.pseudo ? (
                  <>
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    <span>Suppression...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3 w-3" />
                    <span>Supprimer</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal : Tableau des Classes Météo */}
      {isClassesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg max-h-[85vh] flex flex-col rounded-lg border border-slate-700 bg-[#0F172A] p-5 space-y-4 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-800 text-amber-400 border border-slate-700 text-xl">
                  🏆
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Rangs &amp; Classes Météorologiques</h3>
                  <p className="text-xs text-slate-400">Paliers basés sur vos points d'activité &amp; observations</p>
                </div>
              </div>
              <button
                onClick={() => setIsClassesModalOpen(false)}
                className="p-1 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-y-auto pr-1 space-y-2 flex-1">
              {PLAYER_CLASSES.map((cls) => {
                const isCurrent = getPlayerClass(profile?.totalPoints || 0).id === cls.id;
                const isUnlocked = (profile?.totalPoints || 0) >= cls.minPoints;

                return (
                  <div
                    key={cls.id}
                    className={`p-3 rounded-md border transition flex items-center justify-between gap-3 ${
                      isCurrent
                        ? 'bg-sky-950/60 border-amber-400/80'
                        : isUnlocked
                        ? 'bg-slate-900 border-slate-800'
                        : 'bg-slate-950 border-slate-900 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="text-2xl shrink-0">
                        {cls.emoji}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{cls.name}</span>
                          {isCurrent && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 font-bold">
                              Actuel
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{cls.description}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold text-amber-300">
                        {cls.minPoints.toLocaleString()} pts
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {isUnlocked ? 'Débloqué' : 'Verrouillé'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Points gagnés par présence et observations.</span>
              <button
                type="button"
                onClick={() => setIsClassesModalOpen(false)}
                className="px-3 py-1.5 rounded-md bg-[#0284C7] hover:bg-sky-600 text-white font-semibold transition cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
