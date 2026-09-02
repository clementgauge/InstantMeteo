// Service de communication avec l'API Cloudflare D1
import { PlayerProfile, LeaderboardEntry } from './competitiveGameService';
import { CommunityWeatherReport } from './communityWeatherReportsService';

const D1_STORAGE_URL_KEY = 'instant_meteo_d1_url';

export function getD1WorkerUrl(): string {
  // 1. Valeur enregistrée par l'utilisateur dans l'interface
  const saved = localStorage.getItem(D1_STORAGE_URL_KEY);
  if (saved && saved.trim().length > 0) {
    return saved.trim().replace(/\/+$/, '');
  }
  // 2. Variable d'environnement Vite
  const envUrl = (import.meta as any).env?.VITE_D1_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
    return envUrl.trim().replace(/\/+$/, '');
  }
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

export function isD1Configured(): boolean {
  return getD1WorkerUrl().length > 0;
}

// Teste la connectivité et le statut D1
export async function testD1Connection(overrideUrl?: string): Promise<{ ok: boolean; message: string; data?: any }> {
  const targetUrl = (overrideUrl !== undefined ? overrideUrl : getD1WorkerUrl()).trim().replace(/\/+$/, '');
  if (!targetUrl) {
    return { ok: false, message: 'Aucune URL de Worker Cloudflare D1 fournie.' };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(`${targetUrl}/api/health`, {
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
      message: 'Connexion à Cloudflare D1 réussie avec succès !',
      data
    };
  } catch (err: any) {
    return {
      ok: false,
      message: `Impossible de contacter le Worker (${err.name === 'AbortError' ? 'Délai d\'attente dépassé (timeout 6s)' : err.message || 'Erreur réseau/CORS'})`
    };
  }
}

// Récupère le classement mondial depuis Cloudflare D1
export async function fetchLeaderboardFromD1(currentProfile: PlayerProfile | null): Promise<LeaderboardEntry[] | null> {
  const url = getD1WorkerUrl();
  if (!url) return null;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(`${url}/api/leaderboard`, {
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
      isCurrentUser: currentProfile ? item.pseudo.toLowerCase() === currentProfile.pseudo.toLowerCase() : false
    }));

    return entries;
  } catch (err) {
    console.warn('Erreur lecture classement D1:', err);
    return null;
  }
}

// Synchronise le profil du joueur actuel sur Cloudflare D1
export async function syncPlayerProfileToD1(profile: PlayerProfile): Promise<{ ok: boolean; rank?: number; totalPlayers?: number; message?: string }> {
  const url = getD1WorkerUrl();
  if (!url) return { ok: false, message: 'D1 non configuré' };

  try {
    // Calcul de l'ID stable basé sur le pseudo ou profil
    const stableId = 'usr-' + profile.pseudo.toLowerCase().replace(/[^a-z0-9_-]/g, '_');

    let badgeTitle = 'Apprenti Météo';
    if (profile.totalPoints >= 3000) badgeTitle = 'Grand Maître Cumulonimbus';
    else if (profile.totalPoints >= 2000) badgeTitle = 'Sentinelle Météorologique';
    else if (profile.totalPoints >= 1000) badgeTitle = 'Chasseur Émérite';
    else if (profile.totalPoints >= 400) badgeTitle = 'Observateur Averti';

    const payload = {
      id: stableId,
      pseudo: profile.pseudo,
      totalPoints: profile.totalPoints,
      streakDays: profile.streakDays,
      multiplier: 1, // sera calculé côté worker/game
      locationsCount: profile.visitedLocations.length,
      badgesCount: profile.unlockedWeatherIds.length,
      badgeTitle,
      minutesSpent: profile.minutesSpent,
      unlockedBadges: profile.unlockedWeatherIds
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(`${url}/api/player/sync`, {
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

// Récupère les signalements météo citoyens depuis Cloudflare D1
export async function fetchCommunityReportsFromD1(): Promise<CommunityWeatherReport[] | null> {
  const url = getD1WorkerUrl();
  if (!url) return null;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(`${url}/api/reports`, {
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

// Envoie un nouveau signalement météo à Cloudflare D1
export async function postCommunityReportToD1(report: CommunityWeatherReport): Promise<boolean> {
  const url = getD1WorkerUrl();
  if (!url) return false;

  try {
    const res = await fetch(`${url}/api/reports`, {
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

// Valide un signalement sur Cloudflare D1
export async function confirmReportInD1(reportId: string): Promise<boolean> {
  const url = getD1WorkerUrl();
  if (!url) return false;

  try {
    const res = await fetch(`${url}/api/reports/${encodeURIComponent(reportId)}/confirm`, {
      method: 'POST',
      headers: { 'Accept': 'application/json' }
    });
    return res.ok;
  } catch (err) {
    console.warn('Erreur confirmation signalement D1:', err);
    return false;
  }
}
