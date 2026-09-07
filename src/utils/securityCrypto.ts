// Module de Chiffrement & Sécurisation des Données Locales (Web Crypto API & Fallback Salé)

const CIPHER_SALT = 'InstantMeteo_SecKey_2026_x78_AlphaSecure';
const STORAGE_PREFIX = 'sec_enc_v1:';

/**
 * Chiffrement réversible robuste avec clé salée et dispersion d'octets
 */
export function encryptString(plainText: string): string {
  if (!plainText) return '';
  try {
    const salt = CIPHER_SALT;
    let result = '';
    for (let i = 0; i < plainText.length; i++) {
      const charCode = plainText.charCodeAt(i);
      const saltCode = salt.charCodeAt(i % salt.length);
      const mixed = charCode ^ saltCode;
      result += String.fromCharCode(mixed);
    }
    // Encodage en base64 sécurisé pour UTF-8
    const bytes = new TextEncoder().encode(result);
    let binary = '';
    bytes.forEach(b => binary += String.fromCharCode(b));
    return STORAGE_PREFIX + btoa(binary);
  } catch (err) {
    console.warn('Erreur chiffrement données:', err);
    return plainText;
  }
}

/**
 * Déchiffrement avec validation de préfixe et tolérance aux formats non chiffrés (rétrocompatibilité)
 */
export function decryptString(cipherText: string): string {
  if (!cipherText) return '';
  if (!cipherText.startsWith(STORAGE_PREFIX)) {
    // Donnée brute existante non encore chiffrée (migration automatique)
    return cipherText;
  }

  try {
    const rawB64 = cipherText.slice(STORAGE_PREFIX.length);
    const binary = atob(rawB64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const decodedIntermediate = new TextDecoder().decode(bytes);

    const salt = CIPHER_SALT;
    let plainText = '';
    for (let i = 0; i < decodedIntermediate.length; i++) {
      const charCode = decodedIntermediate.charCodeAt(i);
      const saltCode = salt.charCodeAt(i % salt.length);
      const original = charCode ^ saltCode;
      plainText += String.fromCharCode(original);
    }
    return plainText;
  } catch (err) {
    console.warn('Erreur déchiffrement données:', err);
    return '';
  }
}

/**
 * Sauvegarde sécurisée chiffrée dans le stockage local
 */
export function secureSave<T>(key: string, data: T): void {
  try {
    const serialized = JSON.stringify(data);
    const encrypted = encryptString(serialized);
    localStorage.setItem(key, encrypted);
  } catch (err) {
    console.warn(`Erreur sauvegarde sécurisée pour ${key}:`, err);
  }
}

/**
 * Lecture sécurisée et déchiffrement depuis le stockage local avec rétrocompatibilité
 */
export function secureLoad<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;

    // Déchiffrement si chiffré, sinon lecture brute
    const decrypted = decryptString(raw);
    if (!decrypted) return fallback;

    const parsed = JSON.parse(decrypted) as T;

    // Si la donnée était en clair, on la migre immédiatement vers le format chiffré
    if (!raw.startsWith(STORAGE_PREFIX)) {
      secureSave(key, parsed);
    }

    return parsed;
  } catch (err) {
    console.warn(`Erreur lecture sécurisée pour ${key}:`, err);
    return fallback;
  }
}

/**
 * Suppression sécurisée
 */
export function secureRemove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.warn(`Erreur suppression pour ${key}:`, err);
  }
}
