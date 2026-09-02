// Service de Collecte & Carte Collaborative des Météos Observées par les Utilisateurs

export interface CommunityWeatherReport {
  id: string;
  city: string;
  department?: string;
  latitude: number;
  longitude: number;
  weatherCode: string; // 'sun' | 'cloud' | 'rain' | 'storm' | 'snow' | 'fog' | 'wind' | 'hail'
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

export const PHENOMENA_OPTIONS = [
  { code: 'storm', label: 'Orage violent & Foudre', emoji: '⚡', color: '#f59e0b' },
  { code: 'hail', label: 'Chute de Grêle', emoji: '⚪', color: '#ef4444' },
  { code: 'rain', label: 'Pluie battante / Averse', emoji: '🌧️', color: '#3b82f6' },
  { code: 'snow', label: 'Chute de Neige au sol', emoji: '❄️', color: '#38bdf8' },
  { code: 'wind', label: 'Violentes Rafales de vent', emoji: '💨', color: '#14b8a6' },
  { code: 'fog', label: 'Brouillard givrant / opaque', emoji: '🌫️', color: '#94a3b8' },
  { code: 'sun', label: 'Grand Soleil & Chaleur', emoji: '☀️', color: '#eab308' },
  { code: 'cloud', label: 'Ciel très couvert / Menace', emoji: '☁️', color: '#64748b' }
];

// Vérifie si un signalement a été posté aujourd'hui (réinitialisation quotidienne)
function isReportFromToday(isoTimestamp: string): boolean {
  try {
    const reportDate = new Date(isoTimestamp);
    const now = new Date();
    return (
      reportDate.getFullYear() === now.getFullYear() &&
      reportDate.getMonth() === now.getMonth() &&
      reportDate.getDate() === now.getDate()
    );
  } catch {
    return false;
  }
}

export function getCommunityReports(): CommunityWeatherReport[] {
  try {
    // Nettoyer l'ancienne clé avec les données de démonstration
    localStorage.removeItem('instant_meteo_community_reports_v1');

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed: CommunityWeatherReport[] = JSON.parse(raw);
    
    // Filtrage strict : uniquement les signalements réels des utilisateurs postés AUJOURD'HUI
    const todayReports = (Array.isArray(parsed) ? parsed : []).filter(
      r => r && !r.id.startsWith('rep-init-') && isReportFromToday(r.timestamp)
    );

    // Mettre à jour le stockage si des signalements de la veille ont été purgés
    if (todayReports.length !== parsed.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todayReports));
    }

    return todayReports;
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Erreur confirmation report:', err);
  }
  return updated;
}
