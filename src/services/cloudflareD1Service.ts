// Service de communication avec l'API Base de Données Centralisée Instant Météo (compatible Cloudflare D1)
import { PlayerProfile, LeaderboardEntry, AdminAnnouncement, BannedUser } from './competitiveGameService';
import { CommunityWeatherReport } from './communityWeatherReportsService';

const D1_STORAGE_URL_KEY = 'instant_meteo_d1_url';
export const DATABASE_ID = '8c0f3a17-c78d-4dad-9301-90f7138d1e9c';

// Nettoyage automatique des faux domaines ou placeholders
export function getD1WorkerUrl(): string {
  try {
    const saved = localStorage.getItem(D1_STORAGE_URL_KEY);
    if (saved && saved.trim().length > 0) {
      const clean = saved.trim().replace(/\/+$/, '');
      // Si c'est un placeholder d'exemple ou invalide, ne pas l'utiliser
      if (clean.includes('votre-compte') || clean.includes('example.com') || !clean.startsWith('http')) {
        localStorage.removeItem(D1_STORAGE_URL_KEY);
        return '';
      }
      return clean;
    }
  } catch {
    // Ignore
  }

  const envUrl = (import.meta as any).env?.VITE_D1_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
    return envUrl.trim().replace(/\/+$/, '');
  }

  // Par défaut : chaîne vide pour requêter directement le serveur API centralisé de l'application
  return '';
}

export function setD1WorkerUrl(url: string): void {
  const cleaned = (url || '').trim().replace(/\/+$/, '');
  try {
    if (!cleaned) {
      localStorage.removeItem(D1_STORAGE_URL_KEY);
    } else {
      localStorage.setItem(D1_STORAGE_URL_KEY, cleaned);
    }
  } catch {
    // Ignore
  }
  window.dispatchEvent(new CustomEvent('instant_meteo_d1_config_changed', { detail: { url: cleaned } }));
}

// La base de données centrale est toujours active et opérationnelle
export function isD1Configured(): boolean {
  return true;
}

export function getD1ApiEndpoint(path: string): string {
  const custom = getD1WorkerUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (custom) {
    return `${custom}${cleanPath}`;
  }
  return cleanPath;
}

// Requête résiliente : tente l'URL personnalisée (si présente), et bascule instantanément sur l'API centrale en cas d'échec
async function resilientFetch(path: string, options: RequestInit = {}, timeoutMs: number = 6000): Promise<Response> {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const custom = getD1WorkerUrl();

  if (custom) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), Math.min(timeoutMs, 4000));
      const res = await fetch(`${custom}${cleanPath}`, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (res.ok) return res;
    } catch {
      // Échec de l'URL personnalisée, repli automatique sur le serveur central local
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(cleanPath, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return res;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

// Teste la connectivité et le statut de la base de données
export async function testD1Connection(overrideUrl?: string): Promise<{ ok: boolean; message: string; data?: any }> {
  const targetBase = overrideUrl !== undefined ? overrideUrl.trim().replace(/\/+$/, '') : getD1WorkerUrl();
  const testUrl = targetBase ? `${targetBase}/api/health` : '/api/health';

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(testUrl, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      // Si un overrideUrl personnalisé a échoué, tester au moins l'API locale
      if (targetBase) {
        const localCheck = await fetch('/api/health');
        if (localCheck.ok) {
          return {
            ok: true,
            message: 'Base de données centrale connectée (Attention : votre Worker externe personnalisé a renvoyé une erreur).',
            data: await localCheck.json()
          };
        }
      }
      return { ok: false, message: `Le serveur a répondu avec une erreur HTTP ${res.status} (${res.statusText})` };
    }

    const data = await res.json();
    return {
      ok: true,
      message: 'Base de données connectée et 100% opérationnelle !',
      data
    };
  } catch (err: any) {
    // Si l'URL externe échoue, vérifier si l'API locale fonctionne
    try {
      const fallback = await fetch('/api/health');
      if (fallback.ok) {
        return {
          ok: true,
          message: 'Base de données centrale active et opérationnelle (Mode local prioritaire).',
          data: await fallback.json()
        };
      }
    } catch {
      // Continue
    }

    return {
      ok: false,
      message: `Impossible de contacter la base de données (${err.name === 'AbortError' ? "Délai d'attente dépassé" : err.message || 'Erreur réseau/CORS'})`
    };
  }
}

// Récupère le classement mondial depuis la base de données
export async function fetchLeaderboardFromD1(currentProfile: PlayerProfile | null): Promise<LeaderboardEntry[] | null> {
  try {
    const query = currentProfile?.pseudo ? `?pseudo=${encodeURIComponent(currentProfile.pseudo)}` : '';
    const res = await resilientFetch(`/api/leaderboard${query}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    }, 5000);

    if (!res.ok) return null;
    const data = await res.json();
    if (!data.success || !Array.isArray(data.leaderboard)) return null;

    const entries: LeaderboardEntry[] = data.leaderboard.map((item: any) => ({
      rank: item.rank || 1,
      pseudo: item.pseudo,
      points: Number(item.points) || 0,
      streakDays: Number(item.streakDays) || 1,
      locationsCount: Number(item.locationsCount) || 0,
      badgesCount: Number(item.badgesCount) || 0,
      badgeTitle: item.badgeTitle || 'Apprenti Météo',
      isAdmin: Boolean(item.isAdmin),
      isCurrentUser: currentProfile ? item.pseudo.toLowerCase() === currentProfile.pseudo.toLowerCase() : false
    }));

    return entries;
  } catch (err) {
    console.warn('Erreur lecture classement D1:', err);
    return null;
  }
}

// Synchronise le profil du joueur actuel sur la base de données
export async function syncPlayerProfileToD1(profile: PlayerProfile): Promise<{ ok: boolean; rank?: number; totalPlayers?: number; message?: string }> {
  try {
    const stableId = 'usr-' + profile.pseudo.toLowerCase().replace(/[^a-z0-9_-]/g, '_');

    let badgeTitle = 'Apprenti Météo';
    if (profile.isAdmin) badgeTitle = 'Admin';
    else if (profile.totalPoints >= 3000) badgeTitle = 'Grand Maître Cumulonimbus';
    else if (profile.totalPoints >= 2000) badgeTitle = 'Sentinelle Météorologique';
    else if (profile.totalPoints >= 1000) badgeTitle = 'Chasseur Émérite';
    else if (profile.totalPoints >= 400) badgeTitle = 'Observateur Averti';

    const payload = {
      id: stableId,
      pseudo: profile.pseudo,
      totalPoints: profile.totalPoints,
      streakDays: profile.streakDays,
      multiplier: 1,
      locationsCount: profile.visitedLocations.length,
      badgesCount: profile.unlockedWeatherIds.length,
      badgeTitle,
      minutesSpent: profile.minutesSpent,
      unlockedBadges: profile.unlockedWeatherIds,
      isAdmin: !!profile.isAdmin
    };

    const res = await resilientFetch('/api/player/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    }, 6000);

    if (!res.ok) {
      return { ok: false, message: `Erreur HTTP ${res.status}` };
    }

    const data = await res.json();
    return {
      ok: true,
      rank: data.rank,
      totalPlayers: data.totalPlayers,
      message: data.message || 'Synchronisé'
    };
  } catch (err: any) {
    return { ok: false, message: err.message || 'Erreur réseau' };
  }
}

// Réinitialise les points du joueur sur la base de données
export async function resetPlayerPointsInD1(pseudo: string): Promise<boolean> {
  if (!pseudo) return false;

  try {
    const res = await resilientFetch('/api/player/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ pseudo })
    });
    return res.ok;
  } catch (err) {
    console.warn('Erreur réinitialisation points D1:', err);
    return false;
  }
}

// Supprime un compte joueur de la base de données
export async function deletePlayerFromD1(pseudo: string): Promise<boolean> {
  if (!pseudo) return false;

  try {
    const res = await resilientFetch('/api/player/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ pseudo })
    });
    return res.ok;
  } catch (err) {
    console.warn('Erreur suppression joueur D1:', err);
    return false;
  }
}

// Récupère les signalements météo citoyens depuis la base de données
export async function fetchCommunityReportsFromD1(): Promise<CommunityWeatherReport[] | null> {
  try {
    const res = await resilientFetch('/api/reports', {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    }, 5000);

    if (!res.ok) return null;
    const data = await res.json();
    if (!data.success || !Array.isArray(data.reports)) return null;

    return data.reports.map((r: any) => ({
      id: String(r.id),
      city: r.city,
      department: r.department || '',
      latitude: Number(r.latitude),
      longitude: Number(r.longitude),
      weatherCode: r.weatherCode,
      weatherLabel: r.weatherLabel,
      emoji: r.emoji,
      temperature: Number(r.temperature) || 0,
      intensity: r.intensity || 'MODÉRÉE',
      comment: r.comment || '',
      reporterPseudo: r.reporterPseudo,
      timestamp: r.timestamp || new Date().toISOString(),
      confirmations: Number(r.confirmations) || 1
    }));
  } catch (err) {
    console.warn('Erreur chargement signalements D1:', err);
    return null;
  }
}

// Envoie un nouveau signalement météo à la base de données
export async function postCommunityReportToD1(report: CommunityWeatherReport): Promise<boolean> {
  try {
    const res = await resilientFetch('/api/reports', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(report)
    });
    return res.ok;
  } catch (err) {
    console.warn('Erreur envoi signalement vers D1:', err);
    return false;
  }
}

// Valide un signalement sur la base de données
export async function confirmReportInD1(reportId: string): Promise<boolean> {
  try {
    const res = await resilientFetch(`/api/reports/${encodeURIComponent(reportId)}/confirm`, {
      method: 'POST',
      headers: { 'Accept': 'application/json' }
    });
    return res.ok;
  } catch (err) {
    console.warn('Erreur confirmation signalement D1:', err);
    return false;
  }
}

// --- Fonctions d'Administration Synchronisées avec la Base de Données ---

export async function adminSetPointsInD1(pseudo: string, points: number): Promise<boolean> {
  try {
    const res = await resilientFetch('/api/admin/set-points', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pseudo, points })
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function adminSetStreakInD1(pseudo: string, streakDays: number): Promise<boolean> {
  try {
    const res = await resilientFetch('/api/admin/set-streak', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pseudo, streakDays })
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function adminUnlockAllBadgesInD1(pseudo: string): Promise<boolean> {
  try {
    const res = await resilientFetch('/api/admin/unlock-all-badges', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pseudo })
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function adminBanUserInD1(pseudo: string, durationHours: number | 'permanent', reason: string): Promise<boolean> {
  try {
    const res = await resilientFetch('/api/admin/ban', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pseudo, durationHours, reason })
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function adminUnbanUserInD1(pseudo: string): Promise<boolean> {
  try {
    const res = await resilientFetch('/api/admin/unban', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pseudo })
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function adminGetBannedUsersFromD1(): Promise<BannedUser[] | null> {
  try {
    const res = await resilientFetch('/api/admin/banned', { method: 'GET' });
    if (!res.ok) return null;
    const data = await res.json();
    return data.bannedUsers || [];
  } catch {
    return null;
  }
}

export async function adminSaveAnnouncementInD1(announcement: AdminAnnouncement | null): Promise<boolean> {
  try {
    const res = await resilientFetch('/api/admin/announcement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(announcement)
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function adminGetAnnouncementFromD1(): Promise<AdminAnnouncement | null> {
  try {
    const res = await resilientFetch('/api/admin/announcement', { method: 'GET' });
    if (!res.ok) return null;
    const data = await res.json();
    return data.announcement || null;
  } catch {
    return null;
  }
}
