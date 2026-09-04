// Service de communication avec l'API Cloudflare D1 & Base de Données Centralisée Instant Météo
import { PlayerProfile, LeaderboardEntry } from './competitiveGameService';
import { CommunityWeatherReport } from './communityWeatherReportsService';

const D1_STORAGE_URL_KEY = 'instant_meteo_d1_url';
export const DATABASE_ID = '8c0f3a17-c78d-4dad-9301-90f7138d1e9c';

export function getD1WorkerUrl(): string {
  // 1. Valeur enregistrée par l'utilisateur dans l'interface (si Worker externe spécifique)
  const saved = localStorage.getItem(D1_STORAGE_URL_KEY);
  if (saved && saved.trim().length > 0) {
    return saved.trim().replace(/\/+$/, '');
  }
  // 2. Variable d'environnement Vite
  const envUrl = (import.meta as any).env?.VITE_D1_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
    return envUrl.trim().replace(/\/+$/, '');
  }
  // 3. Par défaut : chaîne vide pour requêter directement le serveur API centralisé de l'application
  return '';
}

export function setD1WorkerUrl(url: string): void {
  const cleaned = (url || '').trim().replace(/\/+$/, '');
  if (!cleaned) {
    localStorage.removeItem(D1_STORAGE_URL_KEY);
  } else {
    localStorage.setItem(D1_STORAGE_URL_KEY, cleaned);
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

// Teste la connectivité et le statut D1
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
      return { ok: false, message: `Le serveur a répondu avec une erreur HTTP ${res.status} (${res.statusText})` };
    }

    const data = await res.json();
    return {
      ok: true,
      message: 'Connexion à la base de données réussie !',
      data
    };
  } catch (err: any) {
    return {
      ok: false,
      message: `Impossible de contacter la base de données (${err.name === 'AbortError' ? "Délai d'attente dépassé (timeout 6s)" : err.message || 'Erreur réseau/CORS'})`
    };
  }
}

// Récupère le classement mondial depuis la base de données
export async function fetchLeaderboardFromD1(currentProfile: PlayerProfile | null): Promise<LeaderboardEntry[] | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const query = currentProfile?.pseudo ? `?pseudo=${encodeURIComponent(currentProfile.pseudo)}` : '';
    const res = await fetch(getD1ApiEndpoint(`/api/leaderboard${query}`), {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

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

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(getD1ApiEndpoint('/api/player/sync'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

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
    const res = await fetch(getD1ApiEndpoint('/api/player/reset'), {
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
    const res = await fetch(getD1ApiEndpoint('/api/player/delete'), {
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
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(getD1ApiEndpoint('/api/reports'), {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

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
    const res = await fetch(getD1ApiEndpoint('/api/reports'), {
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
    const res = await fetch(getD1ApiEndpoint(`/api/reports/${encodeURIComponent(reportId)}/confirm`), {
      method: 'POST',
      headers: { 'Accept': 'application/json' }
    });
    return res.ok;
  } catch (err) {
    console.warn('Erreur confirmation signalement D1:', err);
    return false;
  }
}
