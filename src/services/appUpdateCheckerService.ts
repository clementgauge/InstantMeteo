/**
 * Service de surveillance et de notification des mises à jour du code de l'application.
 * Vérifie périodiquement si une nouvelle version / build du site est disponible et
 * affiche précisément ce qui a été mis à jour (fonctionnalités, correctifs et composants).
 */

export interface AppVersionRelease {
  version: string;
  buildId: string;
  updatedAt: string;
  title?: string;
  changelog?: string;
  changes?: string[];
}

export interface AppVersionInfo {
  version: string;
  buildId: string;
  updatedAt: string;
  title?: string;
  changelog?: string;
  changes?: string[];
  modifiedComponents?: string[];
  history?: AppVersionRelease[];
}

const CHECK_INTERVAL_MS = 20000; // Vérification toutes les 20s
const VERSION_URL = '/version.json';
const LAST_SEEN_BUILD_KEY = 'instant_meteo_last_seen_build_id';
const LAST_SEEN_SIGNATURE_KEY = 'instant_meteo_dismissed_update_signature';
const PENDING_UPDATE_SESSION_KEY = 'instant_meteo_pending_update';

let currentVersionInfo: AppVersionInfo | null = null;
let updateListeners: ((info: AppVersionInfo) => void)[] = [];
let lastNotifiedSignature: string | null = null;

export function getUpdateSignature(info: AppVersionInfo): string {
  return `${info.version || ''}::${info.buildId || ''}::${info.title || ''}::${info.changelog || ''}`;
}

export function isUpdateAlreadyDismissed(info: AppVersionInfo): boolean {
  try {
    const dismissedBuildId = localStorage.getItem(LAST_SEEN_BUILD_KEY);
    const dismissedSig = localStorage.getItem(LAST_SEEN_SIGNATURE_KEY);
    const currentSig = getUpdateSignature(info);
    if (dismissedSig && dismissedSig === currentSig) return true;
    if (dismissedBuildId && dismissedBuildId === info.buildId && !dismissedSig) return true;
  } catch (_) {}
  return false;
}

/**
 * Récupère la version actuelle depuis le serveur en contournant le cache.
 */
export async function fetchServerVersion(): Promise<AppVersionInfo | null> {
  try {
    const res = await fetch(`${VERSION_URL}?_t=${Date.now()}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });
    if (!res.ok) return null;
    const data: AppVersionInfo = await res.json();
    return data;
  } catch (err) {
    console.warn('[AppUpdateChecker] Impossible de vérifier la version:', err);
    return null;
  }
}

/**
 * Envoie une notification système native décrivant précisément ce qui a été mis à jour
 */
export function sendSystemUpdateNotification(info: AppVersionInfo) {
  try {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notifTitle = info.title
        ? `⚡ Mise à jour v${info.version} : ${info.title}`
        : `⚡ Mise à jour Instant Météo v${info.version}`;

      const notifBody =
        info.changes && info.changes.length > 0
          ? info.changes.slice(0, 3).join('\n')
          : info.changelog || `Nouvelle version (${info.version}) déployée en direct.`;

      const notif = new Notification(notifTitle, {
        body: notifBody,
        icon: '/icon-192.png',
        badge: '/favicon.svg',
        tag: `instant-meteo-update-${info.buildId}`,
        requireInteraction: false
      });

      notif.onclick = () => {
        window.focus();
        applyAppUpdate(info.buildId);
      };
    }
  } catch (e) {
    console.warn('[AppUpdateChecker] Erreur notification système:', e);
  }
}

/**
 * Marque une mise à jour comme vue/acceptée (bouton OK) pour ne plus afficher de notification
 * sauf s'il y a une mise à jour différente par la suite.
 */
export function markUpdateAsSeen(infoOrBuildId?: AppVersionInfo | string): void {
  try {
    const targetInfo =
      typeof infoOrBuildId === 'object' && infoOrBuildId !== null
        ? infoOrBuildId
        : currentVersionInfo;
    const targetBuildId =
      typeof infoOrBuildId === 'string'
        ? infoOrBuildId
        : targetInfo?.buildId;

    if (targetBuildId) {
      localStorage.setItem(LAST_SEEN_BUILD_KEY, targetBuildId);
    }
    if (targetInfo) {
      localStorage.setItem(LAST_SEEN_SIGNATURE_KEY, getUpdateSignature(targetInfo));
    }
    sessionStorage.removeItem(PENDING_UPDATE_SESSION_KEY);
  } catch (_) {}
}

/**
 * Retourne la version courante connue du client (ou récupère celle du serveur)
 */
export async function getCurrentVersionSignature(): Promise<string> {
  if (currentVersionInfo) {
    return getUpdateSignature(currentVersionInfo);
  }
  const fetched = await fetchServerVersion();
  if (fetched) {
    currentVersionInfo = fetched;
    return getUpdateSignature(fetched);
  }
  return 'default-v2.5.0';
}

/**
 * Déclenche l'événement d'alerte de mise à jour auprès de tous les composants
 */
function notifyUpdateAvailable(newInfo: AppVersionInfo, forceShow = false) {
  const sig = getUpdateSignature(newInfo);
  if (!forceShow && (lastNotifiedSignature === sig || isUpdateAlreadyDismissed(newInfo))) {
    return;
  }
  lastNotifiedSignature = sig;
  currentVersionInfo = newInfo;

  try {
    sessionStorage.setItem(PENDING_UPDATE_SESSION_KEY, JSON.stringify(newInfo));
  } catch (e) {}

  // Envoi notification système avec le vrai contenu
  sendSystemUpdateNotification(newInfo);

  // Événement DOM global
  const event = new CustomEvent('instant_meteo_code_update_available', {
    detail: newInfo
  });
  window.dispatchEvent(event);

  // Listeners internes
  updateListeners.forEach(cb => cb(newInfo));
}

/**
 * Initialise la surveillance des mises à jour du code
 */
export async function initAppUpdateChecker(): Promise<void> {
  // Nettoyage d'une éventuelle ancienne notification figée ou déjà validée avec "OK"
  try {
    const savedPending = sessionStorage.getItem(PENDING_UPDATE_SESSION_KEY);
    if (savedPending) {
      const parsed: AppVersionInfo = JSON.parse(savedPending);
      if (parsed?.buildId === 'build-20260903-241' || isUpdateAlreadyDismissed(parsed)) {
        sessionStorage.removeItem(PENDING_UPDATE_SESSION_KEY);
      }
    }
  } catch (_) {}

  // 1. Charger la version initiale du serveur
  const initial = await fetchServerVersion();
  if (initial) {
    currentVersionInfo = initial;
    if (!isUpdateAlreadyDismissed(initial)) {
      notifyUpdateAvailable(initial);
    }
  }

  // 2. Écouter les mises à jour Service Worker s'il est actif
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(registration => {
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('[AppUpdateChecker] Nouveau Service Worker installé, récupération des nouveautés...');
              fetchServerVersion().then(info => {
                if (info && !isUpdateAlreadyDismissed(info)) {
                  notifyUpdateAvailable(info);
                }
              });
            }
          });
        }
      });
    }).catch(() => {});
  }

  // 3. Boucle périodique de vérification (toutes les 20s)
  setInterval(async () => {
    const latest = await fetchServerVersion();
    if (!latest) return;

    if (!currentVersionInfo) {
      currentVersionInfo = latest;
      return;
    }

    if (
      latest.buildId !== currentVersionInfo.buildId ||
      latest.version !== currentVersionInfo.version ||
      latest.changelog !== currentVersionInfo.changelog
    ) {
      console.log('[AppUpdateChecker] 🚀 Nouvelle mise à jour différente détectée :', latest.title || latest.changelog);
      notifyUpdateAvailable(latest);
    }
  }, CHECK_INTERVAL_MS);

  // 4. Vérification immédiate lors du retour sur l'onglet
  window.addEventListener('focus', async () => {
    const latest = await fetchServerVersion();
    if (
      latest &&
      currentVersionInfo &&
      (latest.buildId !== currentVersionInfo.buildId ||
        latest.version !== currentVersionInfo.version ||
        latest.changelog !== currentVersionInfo.changelog)
    ) {
      notifyUpdateAvailable(latest);
    }
  });

  document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState === 'visible') {
      const latest = await fetchServerVersion();
      if (
        latest &&
        currentVersionInfo &&
        (latest.buildId !== currentVersionInfo.buildId ||
          latest.version !== currentVersionInfo.version ||
          latest.changelog !== currentVersionInfo.changelog)
      ) {
        notifyUpdateAvailable(latest);
      }
    }
  });
}

/**
 * Souscription à la détection d'une mise à jour
 */
export function onAppUpdateDetected(callback: (info: AppVersionInfo) => void): () => void {
  updateListeners.push(callback);

  try {
    const saved = sessionStorage.getItem(PENDING_UPDATE_SESSION_KEY);
    if (saved) {
      const parsed: AppVersionInfo = JSON.parse(saved);
      if (parsed && parsed.buildId !== 'build-20260903-241' && !isUpdateAlreadyDismissed(parsed)) {
        callback(parsed);
      }
    }
  } catch (e) {}

  return () => {
    updateListeners = updateListeners.filter(cb => cb !== callback);
  };
}

/**
 * Recharge l'application pour appliquer la mise à jour
 */
export async function applyAppUpdate(infoOrBuildId?: AppVersionInfo | string): Promise<void> {
  try {
    markUpdateAsSeen(infoOrBuildId);
    // Vider les caches du Service Worker
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
    }
  } catch (e) {
    console.warn('[AppUpdateChecker] Erreur purge cache:', e);
  }
  // Forcer rechargement sans cache
  window.location.reload();
}

/**
 * Fonction de test pour déclencher immédiatement la notification avec les vraies nouveautés actuelles
 */
export async function simulateAppUpdateForTest(): Promise<void> {
  const liveInfo = await fetchServerVersion();
  lastNotifiedSignature = null;
  if (liveInfo) {
    notifyUpdateAvailable(liveInfo, true);
  } else {
    notifyUpdateAvailable({
      version: '2.5.1',
      buildId: 'test-update-' + Date.now(),
      updatedAt: new Date().toISOString(),
      title: 'Application PWA avec Logo Officiel, Zones Météo Mondiales & Jeu 3D',
      changelog: 'Installation directe en PWA avec le logo officiel sur téléphone, météo par zones pour le Royaume-Uni et le monde, et bouton OK de confirmation des notifications.',
      changes: [
        '📱 Téléphone (Android & iOS) : Installation directe en PWA avec le logo officiel Instant Météo',
        '🇬🇧 Météo par zones pour le Royaume-Uni (11 régions) et tous les pays du monde',
        '✅ Bouton OK sur les notifications (mise à jour et installation) pour ne plus les réafficher sauf nouvelle mise à jour'
      ]
    }, true);
  }
}
