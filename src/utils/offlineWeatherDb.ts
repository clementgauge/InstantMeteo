/**
 * Système de stockage IndexedDB robuste pour Instant Météo
 * Permet la consultation intégrale et hors-ligne des dernières prévisions météo,
 * stations favorites, relevés horaires, alertes et données montagne.
 */

const DB_NAME = 'instant-meteo-offline-db';
const DB_VERSION = 2;
const STORE_FORECASTS = 'weather_forecasts';
const STORE_STATIONS = 'cached_stations';
const STORE_RAW_API = 'raw_api_responses';

export interface StoredForecastEntry {
  key: string;
  stationId: string;
  stationName: string;
  latitude: number;
  longitude: number;
  altitude?: number;
  timestamp: number;
  savedAtFormatted: string;
  data: any;
}

export interface StoredStationEntry {
  id: string;
  name: string;
  department?: string;
  region?: string;
  country?: string;
  latitude: number;
  longitude: number;
  altitude?: number;
  lastAccessed: number;
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      return reject(new Error('IndexedDB non supporté'));
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_FORECASTS)) {
        const forecastStore = db.createObjectStore(STORE_FORECASTS, { keyPath: 'key' });
        forecastStore.createIndex('stationId', 'stationId', { unique: false });
        forecastStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
      if (!db.objectStoreNames.contains(STORE_STATIONS)) {
        const stationStore = db.createObjectStore(STORE_STATIONS, { keyPath: 'id' });
        stationStore.createIndex('lastAccessed', 'lastAccessed', { unique: false });
      }
      if (!db.objectStoreNames.contains(STORE_RAW_API)) {
        const rawStore = db.createObjectStore(STORE_RAW_API, { keyPath: 'url' });
        rawStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Sauvegarde les prévisions météo complètes pour une station dans IndexedDB
 */
export async function saveWeatherToIndexedDB(
  cacheKey: string,
  station: { id: string; name: string; latitude: number; longitude: number; altitude?: number; department?: string; region?: string; country?: string },
  data: any
): Promise<void> {
  try {
    const db = await openDatabase();
    const tx = db.transaction([STORE_FORECASTS, STORE_STATIONS], 'readwrite');
    const forecastStore = tx.objectStore(STORE_FORECASTS);
    const stationStore = tx.objectStore(STORE_STATIONS);

    const now = Date.now();
    const entry: StoredForecastEntry = {
      key: cacheKey,
      stationId: station.id,
      stationName: station.name,
      latitude: station.latitude,
      longitude: station.longitude,
      altitude: station.altitude,
      timestamp: now,
      savedAtFormatted: new Intl.DateTimeFormat('fr-FR', {
        dateStyle: 'short',
        timeStyle: 'medium'
      }).format(now),
      data
    };

    forecastStore.put(entry);

    const stationEntry: StoredStationEntry = {
      id: station.id,
      name: station.name,
      department: station.department,
      region: station.region,
      country: station.country,
      latitude: station.latitude,
      longitude: station.longitude,
      altitude: station.altitude,
      lastAccessed: now
    };

    stationStore.put(stationEntry);

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Erreur sauvegarde IndexedDB météo:', err);
  }
}

/**
 * Récupère les dernières prévisions enregistrées depuis IndexedDB pour une clé ou station
 */
export async function getWeatherFromIndexedDB(
  cacheKey: string,
  stationId?: string
): Promise<StoredForecastEntry | null> {
  try {
    const db = await openDatabase();
    const tx = db.transaction(STORE_FORECASTS, 'readonly');
    const store = tx.objectStore(STORE_FORECASTS);

    return new Promise((resolve) => {
      const getReq = store.get(cacheKey);
      getReq.onsuccess = () => {
        if (getReq.result) {
          return resolve(getReq.result);
        }
        // Fallback par stationId si la clé exacte a varié (ex: micro-décimales)
        if (stationId) {
          const index = store.index('stationId');
          const cursorReq = index.openCursor(IDBKeyRange.only(stationId), 'prev');
          cursorReq.onsuccess = () => {
            if (cursorReq.result) {
              resolve(cursorReq.result.value);
            } else {
              resolve(null);
            }
          };
          cursorReq.onerror = () => resolve(null);
        } else {
          resolve(null);
        }
      };
      getReq.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

/**
 * Récupère la toute dernière prévision enregistrée (toutes stations confondues)
 * Utile lors d'un démarrage direct hors-ligne
 */
export async function getLatestAnyWeatherFromIndexedDB(): Promise<StoredForecastEntry | null> {
  try {
    const db = await openDatabase();
    const tx = db.transaction(STORE_FORECASTS, 'readonly');
    const store = tx.objectStore(STORE_FORECASTS);
    const index = store.index('timestamp');

    return new Promise((resolve) => {
      const cursorReq = index.openCursor(null, 'prev');
      cursorReq.onsuccess = () => {
        if (cursorReq.result) {
          resolve(cursorReq.result.value);
        } else {
          resolve(null);
        }
      };
      cursorReq.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

/**
 * Récupère la liste des stations enregistrées en cache local pour consultation hors-ligne
 */
export async function getOfflineAvailableStations(): Promise<StoredStationEntry[]> {
  try {
    const db = await openDatabase();
    const tx = db.transaction(STORE_STATIONS, 'readonly');
    const store = tx.objectStore(STORE_STATIONS);
    const index = store.index('lastAccessed');

    return new Promise((resolve) => {
      const stations: StoredStationEntry[] = [];
      const cursorReq = index.openCursor(null, 'prev');
      cursorReq.onsuccess = () => {
        const cursor = cursorReq.result;
        if (cursor && stations.length < 25) {
          stations.push(cursor.value);
          cursor.continue();
        } else {
          resolve(stations);
        }
      };
      cursorReq.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

/**
 * Sauvegarde la réponse brute d'un appel API (ex: Open-Meteo, Nivôse, etc.)
 */
export async function saveRawApiResponseToIndexedDB(url: string, json: any): Promise<void> {
  try {
    const db = await openDatabase();
    const tx = db.transaction(STORE_RAW_API, 'readwrite');
    const store = tx.objectStore(STORE_RAW_API);
    store.put({
      url,
      timestamp: Date.now(),
      payload: json
    });
  } catch {
    // Silencieux
  }
}

/**
 * Récupère la réponse brute d'un appel API sauvegardé
 */
export async function getRawApiResponseFromIndexedDB(url: string): Promise<any | null> {
  try {
    const db = await openDatabase();
    const tx = db.transaction(STORE_RAW_API, 'readonly');
    const store = tx.objectStore(STORE_RAW_API);

    return new Promise((resolve) => {
      const req = store.get(url);
      req.onsuccess = () => {
        if (req.result && req.result.payload) {
          resolve(req.result.payload);
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
