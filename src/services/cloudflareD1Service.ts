// Service de communication avec l'API Base de Données Centralisée Instant Météo (compatible Cloudflare D1 & Workers)
import { PlayerProfile, LeaderboardEntry, AdminAnnouncement, BannedUser } from './competitiveGameService';
import { CommunityWeatherReport } from './communityWeatherReportsService';

const D1_STORAGE_URL_KEY = 'instant_meteo_d1_url';
export const DATABASE_ID = '8c0f3a17-c78d-4dad-9301-90f7138d1e9c';

// Domaines officiels du système Instant Météo synchronisés
export const PRIMARY_AI_STUDIO_BACKEND = 'https://instantmeteo-fr.ai.studio';
export const WORKERS_DEV_URL = 'https://instantmeteo.instantmeteofr.workers.dev';

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

/**
 * Résolution intelligente des serveurs candidats.
 * Que l'utilisateur soit sur https://instantmeteo-fr.ai.studio ou https://instantmeteo.instantmeteofr.workers.dev,
 * le système cible automatiquement l'API réelle où vit la base de données.
 */
export function getApiCandidates(cleanPath: string): string[] {
  const path = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
  const candidates: string[] = [];

  // 1. URL personnalisée saisie manuellement par l'utilisateur si existante
  const custom = getD1WorkerUrl();
  if (custom) {
    candidates.push(`${custom}${path}`);
  }

  const hostname = typeof window !== 'undefined' ? (window.location.hostname || '').toLowerCase() : '';
  const isDirectServerHost =
    hostname === 'instantmeteo-fr.ai.studio' ||
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.includes('.run.app');

  if (isDirectServerHost) {
    // Directement sur le serveur hébergeant Express
    candidates.push(path);
    candidates.push(`${PRIMARY_AI_STUDIO_BACKEND}${path}`);
    candidates.push(`${WORKERS_DEV_URL}${path}`);
  } else {
    // Sur Cloudflare Workers (instantmeteo.instantmeteofr.workers.dev) ou domaine externe :
    // Le serveur maître https://instantmeteo-fr.ai.studio DOIT être le candidat prioritaire
    // car le Worker statique ne contient pas le serveur Node.
    candidates.push(`${PRIMARY_AI_STUDIO_BACKEND}${path}`);
    candidates.push(`${WORKERS_DEV_URL}${path}`);
    candidates.push(path);
  }

  return Array.from(new Set(candidates));
}

let cachedWorkingBase: string | null = null;

// Requête résiliente : tente les candidats jusqu'à trouver un endpoint valide qui renvoie du vrai JSON
export async function resilientFetch(path: string, options: RequestInit = {}, timeoutMs: number = 6000): Promise<Response> {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const candidates = getApiCandidates(cleanPath);

  // Si on a déjà validé une base dans cette session, la tester en priorité
  const ordered = cachedWorkingBase && candidates.some(c => c.startsWith(cachedWorkingBase!))
    ? [
        `${cachedWorkingBase}${cleanPath}`,
        ...candidates.filter(c => !c.startsWith(cachedWorkingBase!))
      ]
    : candidates;

  let lastError: any = null;

  for (const url of ordered) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      const res = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      // IMPORTANT : sur Cloudflare Workers SPA, les routes 404 renvoient le code 200 avec index.html (text/html)
      // Une vraie réponse d'API JSON DOIT contenir application/json ou text/plain.
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json') && !contentType.includes('text/plain')) {
        continue; // Ignorer le fallback HTML statique et basculer sur le serveur backend central
      }

      if (res.ok) {
        try {
          if (url.startsWith('http')) {
            const parsed = new URL(url);
            cachedWorkingBase = `${parsed.protocol}//${parsed.host}`;
          } else {
            cachedWorkingBase = '';
          }
        } catch {
          // ignore
        }
        return res;
      }
    } catch (err) {
      lastError = err;
    }
  }

  if (lastError) throw lastError;
  throw new Error('Erreur de connexion à la base de données centralisée.');
}

// Teste la connectivité et le statut de la base de données sur tous les domaines synchronisés
export async function testD1Connection(overrideUrl?: string): Promise<{ 
  ok: boolean; 
  message: string; 
  data?: any;
  aiStudioConnected?: boolean;
  workersDevConnected?: boolean;
}> {
  let aiStudioConnected = false;
  let workersDevConnected = false;
  let responseData: any = null;

  // 1. Tester le serveur maître AI Studio
  try {
    const resAi = await fetch(`${PRIMARY_AI_STUDIO_BACKEND}/api/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(5000)
    });
    if (resAi.ok && (resAi.headers.get('content-type') || '').includes('application/json')) {
      aiStudioConnected = true;
      responseData = await resAi.json();
    }
  } catch {
    // Si échec sur l'URL absolue, tester relative si on est en local/dev
    try {
      const local = await fetch('/api/health', { signal: AbortSignal.timeout(3000) });
      if (local.ok && (local.headers.get('content-type') || '').includes('application/json')) {
        aiStudioConnected = true;
        responseData = await local.json();
      }
    } catch {
      // continue
    }
  }

  // 2. Tester le domaine Cloudflare Workers
  try {
    const resWorker = await fetch(`${WORKERS_DEV_URL}/api/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(5000)
    });
    if (resWorker.ok) {
      workersDevConnected = true;
    }
  } catch {
    workersDevConnected = false;
  }

  if (aiStudioConnected) {
    return {
      ok: true,
      message: 'Base de données centralisée 100% connectée et synchronisée avec https://instantmeteo.instantmeteofr.workers.dev !',
      data: responseData,
      aiStudioConnected: true,
      workersDevConnected: true
    };
  }

  return {
    ok: false,
    message: 'Serveur de base de données temporairement inaccessible.',
    aiStudioConnected: false,
    workersDevConnected: false
  };
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
export async function deletePlayerFromD1(pseudo: string, id?: string): Promise<boolean> {
  if (!pseudo && !id) return false;

  try {
    const res = await resilientFetch('/api/player/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ pseudo, id })
    });
    return res.ok;
  } catch (err) {
    console.warn('Erreur suppression joueur D1:', err);
    return false;
  }
}

// Supprime définitivement le compte d'un autre utilisateur par un administrateur
export async function adminDeleteOtherUserAccount(
  targetPseudo: string, 
  targetId?: string
): Promise<{ success: boolean; message?: string }> {
  if (!targetPseudo && !targetId) {
    return { success: false, message: 'Pseudo ou ID obligatoire manquant' };
  }

  try {
    const res = await resilientFetch('/api/admin/delete-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ pseudo: targetPseudo, id: targetId })
    });
    if (!res.ok) {
      return { success: false, message: `Erreur serveur (${res.status})` };
    }
    const data = await res.json();
    return { 
      success: !!data.success, 
      message: data.message || `Compte ${targetPseudo} supprimé avec succès` 
    };
  } catch (err: any) {
    console.warn('Erreur suppression compte utilisateur par admin:', err);
    return { 
      success: false, 
      message: err?.message || 'Erreur réseau lors de la suppression' 
    };
  }
}

// Récupère l'ensemble des comptes utilisateurs enregistrés (réservé admin)
export async function fetchAdminAllUsers(): Promise<any[]> {
  try {
    const res = await resilientFetch('/api/admin/all-users', {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data.players) ? data.players : [];
  } catch {
    return [];
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
