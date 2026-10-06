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
const PENDING_UPDATE_SESSION_KEY = 'instant_meteo_pending_update';

let currentVersionInfo: AppVersionInfo | null = null;
let updateListeners: ((info: AppVersionInfo) => void)[] = [];
let lastNotifiedBuildId: string | null = null;

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
 * Marque une mise à jour comme vue/fermée pour ne pas réafficher la même notification en boucle
 */
export function markUpdateAsSeen(buildId?: string): void {
  try {
    const targetId = buildId || currentVersionInfo?.buildId;
    if (targetId) {
      localStorage.setItem(LAST_SEEN_BUILD_KEY, targetId);
    }
    sessionStorage.removeItem(PENDING_UPDATE_SESSION_KEY);
  } catch (_) {}
}

/**
 * Déclenche l'événement d'alerte de mise à jour auprès de tous les composants
 */
function notifyUpdateAvailable(newInfo: AppVersionInfo) {
  if (lastNotifiedBuildId === newInfo.buildId) return;
  lastNotifiedBuildId = newInfo.buildId;
  currentVersionInfo = newInfo;

  try {
    sessionStorage.setItem(PENDING_UPDATE_SESSION_KEY, JSON.stringify(newInfo));
    localStorage.setItem(LAST_SEEN_BUILD_KEY, newInfo.buildId);
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
  // Nettoyage d'une éventuelle ancienne notification figée en sessionStorage (ex: v2.4.1)
  try {
    const savedPending = sessionStorage.getItem(PENDING_UPDATE_SESSION_KEY);
    if (savedPending) {
      const parsed = JSON.parse(savedPending);
      if (parsed?.buildId === 'build-20260903-241') {
        sessionStorage.removeItem(PENDING_UPDATE_SESSION_KEY);
      }
    }
  } catch (_) {}

  // 1. Charger la version initiale du serveur
  const initial = await fetchServerVersion();
  if (initial) {
    currentVersionInfo = initial;
    try {
      const lastSeenBuildId = localStorage.getItem(LAST_SEEN_BUILD_KEY);
      // Si l'utilisateur n'a encore jamais vu cette version (nouveau déploiement), on lui affiche ce qui a été mis à jour
      if (lastSeenBuildId !== initial.buildId) {
        notifyUpdateAvailable(initial);
      }
    } catch (_) {}
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
                if (info) {
                  lastNotifiedBuildId = null; // Forcer l'affichage de la nouvelle version
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
      console.log('[AppUpdateChecker] 🚀 Nouvelle mise à jour détectée :', latest.title || latest.changelog);
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
      if (parsed && parsed.buildId !== 'build-20260903-241') {
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
export async function applyAppUpdate(buildId?: string): Promise<void> {
  try {
    markUpdateAsSeen(buildId);
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
  lastNotifiedBuildId = null;
  if (liveInfo) {
    notifyUpdateAvailable(liveInfo);
  } else {
    notifyUpdateAvailable({
      version: '2.5.0',
      buildId: 'test-update-' + Date.now(),
      updatedAt: new Date().toISOString(),
      title: 'APK Android signé v2, Zones Météo Mondiales & Jeu 3D',
      changelog: 'Correction APK Android sur Brave/Chrome, météo par zones pour le Royaume-Uni et le monde, et réparation du jeu Paratonnerre 3D.',
      changes: [
        '📱 Android (Brave, Chrome, Firefox) : Nouvel APK signé v1 + v2 sans erreur d’analyse du package',
        '🇬🇧 Météo par zones pour le Royaume-Uni (11 régions) et tous les pays du monde',
        '🎮 Jeu Paratonnerre 3D : Chargement direct intégré sans blocage SEO'
      ]
    });
  }
}
