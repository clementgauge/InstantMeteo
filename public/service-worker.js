// Service Worker for Instant Météo (PWA & Offline Resilience)
const CACHE_NAME = 'instant-meteo-v7';
const DB_NAME = 'instant-meteo-offline-db';
const DB_VERSION = 2;
const STORE_RAW_API = 'raw_api_responses';
const STORE_FORECASTS = 'weather_forecasts';

const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/favicon.ico',
  '/icon-192.png',
  '/icon-512.png'
];

/**
 * Gestionnaire d'ouverture IndexedDB natif dans le Service Worker
 */
function openOfflineDB() {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in self)) {
      return reject(new Error('IndexedDB non disponible dans ce Worker'));
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_RAW_API)) {
        const rawStore = db.createObjectStore(STORE_RAW_API, { keyPath: 'url' });
        rawStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
      if (!db.objectStoreNames.contains(STORE_FORECASTS)) {
        const forecastStore = db.createObjectStore(STORE_FORECASTS, { keyPath: 'key' });
        forecastStore.createIndex('stationId', 'stationId', { unique: false });
        forecastStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
      if (!db.objectStoreNames.contains('cached_stations')) {
        const stationStore = db.createObjectStore('cached_stations', { keyPath: 'id' });
        stationStore.createIndex('lastAccessed', 'lastAccessed', { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Sauvegarde une réponse API dans IndexedDB depuis le Service Worker
 */
async function saveApiResponseToIDB(url, payload) {
  try {
    const db = await openOfflineDB();
    const tx = db.transaction(STORE_RAW_API, 'readwrite');
    const store = tx.objectStore(STORE_RAW_API);
    store.put({
      url,
      timestamp: Date.now(),
      payload
    });
  } catch (err) {
    // Silencieux
  }
}

/**
 * Récupère une réponse API depuis IndexedDB lors d'une perte totale de connexion
 */
async function getApiResponseFromIDB(url) {
  try {
    const db = await openOfflineDB();
    const tx = db.transaction(STORE_RAW_API, 'readonly');
    const store = tx.objectStore(STORE_RAW_API);

    return new Promise((resolve) => {
      const req = store.get(url);
      req.onsuccess = () => {
        if (req.result && req.result.payload) {
          return resolve(req.result);
        }
        // Recherche partielle (si les timestamps dans les query params changent légèrement)
        const targetClean = url.split('&current=')[0] || url.split('?')[0];
        const cursorReq = store.openCursor();
        cursorReq.onsuccess = () => {
          const cursor = cursorReq.result;
          if (cursor) {
            if (cursor.value.url && cursor.value.url.startsWith(targetClean)) {
              return resolve(cursor.value);
            }
            cursor.continue();
          } else {
            resolve(null);
          }
        };
        cursorReq.onerror = () => resolve(null);
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

/**
 * Récupère la dernière prévision globale enregistrée dans le store des prévisions
 */
async function getLatestForecastFromIDB() {
  try {
    const db = await openOfflineDB();
    const tx = db.transaction(STORE_FORECASTS, 'readonly');
    const store = tx.objectStore(STORE_FORECASTS);
    const index = store.index('timestamp');

    return new Promise((resolve) => {
      const req = index.openCursor(null, 'prev');
      req.onsuccess = () => {
        if (req.result && req.result.value) {
          resolve(req.result.value);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(STATIC_ASSETS).catch((err) => {
          console.warn('ServiceWorker static assets precache warning:', err);
        });
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. Pour les navigations HTML (pages complètes) :
  // Réseau en priorité, puis fallback vers le shell de l'application en cache
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(async () => {
        const cached = await caches.match('/');
        if (cached) return cached;
        const matched = await caches.match(event.request);
        if (matched) return matched;
        return new Response(
          '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Mode Hors-Ligne - Instant Météo</title></head><body style="font-family:sans-serif;background:#020617;color:white;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;"><h2>Connexion perdue — Les données en cache IndexedDB se chargent...</h2><script>location.reload()</script></body></html>',
          { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
        );
      })
    );
    return;
  }

  // 2. Gestion ultra-robuste des requêtes API Météo (Open-Meteo, /api/weather, /api/...)
  const isWeatherApi =
    url.hostname.includes('open-meteo.com') ||
    url.pathname.startsWith('/api/weather') ||
    url.pathname.startsWith('/api/');

  if (isWeatherApi) {
    event.respondWith(
      fetch(event.request)
        .then(async (response) => {
          // Si le réseau répond avec succès, sauvegarder dans IndexedDB en arrière-plan
          if (response && response.status === 200) {
            try {
              const clone = response.clone();
              const json = await clone.json();
              saveApiResponseToIDB(event.request.url, json);
            } catch (e) {
              // Ignore les flux non JSON
            }
          }
          return response;
        })
        .catch(async () => {
          // PERTE TOTALE DE CONNEXION : récupération depuis IndexedDB
          const cachedEntry = await getApiResponseFromIDB(event.request.url);
          if (cachedEntry && cachedEntry.payload) {
            return new Response(JSON.stringify(cachedEntry.payload), {
              status: 200,
              headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'X-Instant-Meteo-Offline': 'true',
                'X-Offline-Storage': 'IndexedDB',
                'X-Offline-Saved-At': String(cachedEntry.timestamp || Date.now())
              }
            });
          }

          // Deuxième tentative : prévision globale enregistrée
          const fallbackForecast = await getLatestForecastFromIDB();
          if (fallbackForecast && fallbackForecast.data) {
            return new Response(JSON.stringify(fallbackForecast.data), {
              status: 200,
              headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'X-Instant-Meteo-Offline': 'true',
                'X-Offline-Storage': 'IndexedDB-Fallback'
              }
            });
          }

          // Échec ultime si aucun cache
          return new Response(
            JSON.stringify({
              error: 'Offline - Aucune donnée météo disponible en cache local',
              isOffline: true
            }),
            {
              status: 503,
              headers: { 'Content-Type': 'application/json; charset=utf-8' }
            }
          );
        })
    );
    return;
  }

  // 3. Ne pas mettre en cache le sitemap dynamique ni robots.txt
  if (url.pathname.includes('sitemap.xml') || url.pathname.includes('robots.txt')) {
    event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
    return;
  }

  // 4. Stratégie Réseau avec repli Cache pour les ressources statiques de l'application (JS, CSS, images)
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(async () => {
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) return cachedResponse;
        if (event.request.headers.get('accept')?.includes('text/html')) {
          return caches.match('/');
        }
      })
  );
});
