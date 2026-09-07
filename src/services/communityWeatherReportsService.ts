// Service de Collecte & Carte Collaborative des Météos Observées par les Utilisateurs
import { secureSave, secureLoad } from '../utils/securityCrypto';

export interface CommunityWeatherReport {
  id: string;
  city: string;
  department?: string;
  latitude: number;
  longitude: number;
  weatherCode: string;
  weatherLabel: string;
  emoji: string;
  temperature: number;
  intensity: 'FAIBLE' | 'MODÉRÉE' | 'FORTE' | 'EXTRÊME';
  comment?: string;
  reporterPseudo: string;
  timestamp: string; // ISO date
  confirmations: number;
}

const STORAGE_KEY = 'instant_meteo_community_reports_v2';
export const REPORT_LIFETIME_MS = 60 * 60 * 1000; // Exactement 1 heure d'affichage sur la carte

export const PHENOMENA_OPTIONS = [
  { code: 'sun_cloud', label: 'Nuageux et soleil / Belles éclaircies', emoji: '⛅', color: '#f59e0b' },
  { code: 'sun', label: 'Plein Soleil & Ciel limpide', emoji: '☀️', color: '#eab308' },
  { code: 'partly_cloudy', label: 'Ciel voilé / Cirrus légers', emoji: '🌤️', color: '#38bdf8' },
  { code: 'cloud', label: 'Ciel très nuageux / Couvert', emoji: '☁️', color: '#64748b' },
  { code: 'fog', label: 'Brouillard dense / Brume opaque', emoji: '🌫️', color: '#94a3b8' },
  { code: 'drizzle', label: 'Bruine fine / Crachin', emoji: '🌦️', color: '#06b6d4' },
  { code: 'rain', label: 'Pluie continue modérée', emoji: '🌧️', color: '#3b82f6' },
  { code: 'heavy_rain', label: 'Averse forte / Pluie battante', emoji: '⛈️', color: '#1d4ed8' },
  { code: 'storm', label: 'Orage violent & Foudre', emoji: '⚡', color: '#f59e0b' },
  { code: 'dry_storm', label: 'Orage sec / Éclairs sans pluie', emoji: '🌩️', color: '#d97706' },
  { code: 'hail', label: 'Chute de Grêle / Grésil', emoji: '⚪', color: '#ef4444' },
  { code: 'snow', label: 'Chute de Neige au sol', emoji: '❄️', color: '#0284c7' },
  { code: 'sleet', label: 'Neige fondue / Pluie verglaçante', emoji: '🌨️', color: '#6366f1' },
  { code: 'wind', label: 'Violentes Rafales de vent / Coup de vent', emoji: '💨', color: '#14b8a6' },
  { code: 'rainbow', label: 'Arc-en-ciel après averse', emoji: '🌈', color: '#a855f7' }
];

// Vérifie si un signalement a été posté depuis moins d'une heure
export function isReportValidWithinOneHour(isoTimestamp: string): boolean {
  try {
    const reportTime = new Date(isoTimestamp).getTime();
    const now = Date.now();
    const elapsed = now - reportTime;
    return elapsed >= 0 && elapsed <= REPORT_LIFETIME_MS;
  } catch {
    return false;
  }
}

// Calcule le temps restant en minutes pour l'affichage du signalement sur la carte
export function getRemainingMinutesOnMap(isoTimestamp: string): number {
  try {
    const reportTime = new Date(isoTimestamp).getTime();
    const now = Date.now();
    const remainingMs = REPORT_LIFETIME_MS - (now - reportTime);
    return Math.max(0, Math.ceil(remainingMs / (60 * 1000)));
  } catch {
    return 0;
  }
}

export function getCommunityReports(): CommunityWeatherReport[] {
  try {
    // Nettoyage rétrocompatible
    localStorage.removeItem('instant_meteo_community_reports_v1');

    const parsed = secureLoad<CommunityWeatherReport[]>(STORAGE_KEY, []);
    
    // Filtrage strict : données valides depuis moins de 1 heure uniquement
    const validReports = (Array.isArray(parsed) ? parsed : []).filter(
      r => r && !r.id.startsWith('rep-init-') && isReportValidWithinOneHour(r.timestamp)
    );

    // Mettre à jour le stockage sécurisé si des signalements expirés (> 1h) ont été purgés
    if (validReports.length !== parsed.length) {
      secureSave(STORAGE_KEY, validReports);
    }

    return validReports;
  } catch (err) {
    console.warn('Erreur lecture community reports:', err);
    return [];
  }
}

export function addCommunityReport(report: Omit<CommunityWeatherReport, 'id' | 'timestamp' | 'confirmations'>): CommunityWeatherReport {
  const current = getCommunityReports();
  const newReport: CommunityWeatherReport = {
    ...report,
    id: `rep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    confirmations: 1
  };

  const updated = [newReport, ...current];
  try {
    secureSave(STORAGE_KEY, updated);
    window.dispatchEvent(new CustomEvent('instant_meteo_community_report_added', { detail: newReport }));
  } catch (err) {
    console.warn('Erreur sauvegarde report:', err);
  }
  return newReport;
}

export function confirmCommunityReport(reportId: string): CommunityWeatherReport[] {
  const current = getCommunityReports();
  const updated = current.map(r => {
    if (r.id === reportId) {
      return { ...r, confirmations: r.confirmations + 1 };
    }
    return r;
  });

  try {
    secureSave(STORAGE_KEY, updated);
  } catch (err) {
    console.warn('Erreur confirmation report:', err);
  }
  return updated;
}
