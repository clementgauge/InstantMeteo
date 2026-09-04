/**
 * Service de surveillance et de notification obligatoire des mises à jour du code de l'application.
 * Vérifie périodiquement si une nouvelle version / build du site est disponible.
 */

export interface AppVersionInfo {
  version: string;
  buildId: string;
  updatedAt: string;
  changelog?: string;
}

const CHECK_INTERVAL_MS = 25000; // Vérification toutes les 25s
const VERSION_URL = '/version.json';

let currentVersionInfo: AppVersionInfo | null = null;
let updateListeners: ((info: AppVersionInfo) => void)[] = [];
let hasTriggeredUpdate = false;

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
 * Envoie une notification système native obligatoire si autorisée
 */
export function sendSystemUpdateNotification(info: AppVersionInfo) {
  try {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notif = new Notification('⚡ Mise à jour Instant Météo disponible !', {
        body: `Une nouvelle version (${info.version}) du code du site est en ligne. Cliquez pour recharger l'application immédiatement.`,
        icon: '/favicon.svg',
        badge: '/favicon.svg',
        tag: 'instant-meteo-code-update',
        requireInteraction: true
      });

      notif.onclick = () => {
        window.focus();
        applyAppUpdate();
      };
    }
  } catch (e) {
    console.warn('[AppUpdateChecker] Erreur notification système:', e);
  }
}

/**
 * Déclenche l'événement d'alerte de mise à jour auprès de tous les composants
 */
function notifyUpdateAvailable(newInfo: AppVersionInfo) {
  if (hasTriggeredUpdate) return;
  hasTriggeredUpdate = true;

  try {
    sessionStorage.setItem('instant_meteo_pending_update', JSON.stringify(newInfo));
  } catch (e) {}

  // Envoi notification système
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
  // 1. Charger la version initiale
  const initial = await fetchServerVersion();
  if (initial) {
    currentVersionInfo = initial;
  }

  // 2. Écouter les mises à jour Service Worker s'il est actif
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(registration => {
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('[AppUpdateChecker] Nouveau Service Worker installé, mise à jour disponible !');
              fetchServerVersion().then(info => {
                notifyUpdateAvailable(info || {
                  version: 'Nouvelle version',
                  buildId: Date.now().toString(),
                  updatedAt: new Date().toISOString()
                });
              });
            }
          });
        }
      });
    }).catch(() => {});
  }

  // 3. Boucle périodique de vérification (toutes les 25s)
  setInterval(async () => {
    if (hasTriggeredUpdate) return;
    const latest = await fetchServerVersion();
    if (!latest) return;

    if (!currentVersionInfo) {
      currentVersionInfo = latest;
      return;
    }

    if (latest.buildId !== currentVersionInfo.buildId || latest.version !== currentVersionInfo.version) {
      console.log('[AppUpdateChecker] 🚀 Mise à jour détectée ! Version serveur:', latest.version, 'Locale:', currentVersionInfo.version);
      notifyUpdateAvailable(latest);
    }
  }, CHECK_INTERVAL_MS);

  // 4. Vérification immédiate lors du retour sur l'onglet
  window.addEventListener('focus', async () => {
    if (hasTriggeredUpdate) return;
    const latest = await fetchServerVersion();
    if (latest && currentVersionInfo && (latest.buildId !== currentVersionInfo.buildId || latest.version !== currentVersionInfo.version)) {
      notifyUpdateAvailable(latest);
    }
  });

  document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState === 'visible' && !hasTriggeredUpdate) {
      const latest = await fetchServerVersion();
      if (latest && currentVersionInfo && (latest.buildId !== currentVersionInfo.buildId || latest.version !== currentVersionInfo.version)) {
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

  // Si une mise à jour a déjà été détectée
  if (hasTriggeredUpdate && currentVersionInfo) {
    callback(currentVersionInfo);
  } else {
    try {
      const saved = sessionStorage.getItem('instant_meteo_pending_update');
      if (saved) {
        const parsed = JSON.parse(saved);
        callback(parsed);
      }
    } catch (e) {}
  }

  return () => {
    updateListeners = updateListeners.filter(cb => cb !== callback);
  };
}

/**
 * Recharge l'application pour appliquer la mise à jour
 */
export async function applyAppUpdate(): Promise<void> {
  try {
    sessionStorage.removeItem('instant_meteo_pending_update');
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
 * Fonction de test pour déclencher immédiatement la notification de mise à jour
 */
export function simulateAppUpdateForTest(): void {
  notifyUpdateAvailable({
    version: '2.4.2 (Test)',
    buildId: 'test-update-' + Date.now(),
    updatedAt: new Date().toISOString(),
    changelog: 'Mise à jour de test du code et des fonctionnalités.'
  });
}
