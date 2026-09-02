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

const STORAGE_KEY = 'instant_meteo_community_reports_v1';

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

const INITIAL_SEED_REPORTS: CommunityWeatherReport[] = [
  {
    id: 'rep-init-1',
    city: 'Lyon',
    department: 'Rhône (69)',
    latitude: 45.7640,
    longitude: 4.8357,
    weatherCode: 'storm',
    weatherLabel: 'Orage violent & Foudre',
    emoji: '⚡',
    temperature: 18.5,
    intensity: 'FORTE',
    comment: 'Fort coup de tonnerre au-dessus de Fourvière avec grêle ponctuelle de 1 cm.',
    reporterPseudo: 'ChasseurDOrages_31',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    confirmations: 12
  },
  {
    id: 'rep-init-2',
    city: 'Bordeaux',
    department: 'Gironde (33)',
    latitude: 44.8378,
    longitude: -0.5792,
    weatherCode: 'rain',
    weatherLabel: 'Pluie battante / Averse',
    emoji: '🌧️',
    temperature: 14.2,
    intensity: 'MODÉRÉE',
    comment: 'Ligne de grains active arrivant de l\'Atlantique, chaussées détrempées.',
    reporterPseudo: 'AquitaineMétéo',
    timestamp: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    confirmations: 8
  },
  {
    id: 'rep-init-3',
    city: 'Brest',
    department: 'Finistère (29)',
    latitude: 48.3904,
    longitude: -4.4861,
    weatherCode: 'wind',
    weatherLabel: 'Violentes Rafales de vent',
    emoji: '💨',
    temperature: 12.0,
    intensity: 'FORTE',
    comment: 'Vent de sud-ouest mesuré à 78 km/h sur le port de commerce.',
    reporterPseudo: 'VigilanceBreizh_29',
    timestamp: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
    confirmations: 15
  },
  {
    id: 'rep-init-4',
    city: 'Chamonix-Mont-Blanc',
    department: 'Haute-Savoie (74)',
    latitude: 45.9237,
    longitude: 6.8694,
    weatherCode: 'snow',
    weatherLabel: 'Chute de Neige au sol',
    emoji: '❄️',
    temperature: -1.5,
    intensity: 'MODÉRÉE',
    comment: 'Neige tenant dès 1100m, 4 cm de neige fraîche dans la vallée.',
    reporterPseudo: 'AltiMétéo_Chamonix',
    timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    confirmations: 21
  },
  {
    id: 'rep-init-5',
    city: 'Marseille',
    department: 'Bouches-du-Rhône (13)',
    latitude: 43.2965,
    longitude: 5.3698,
    weatherCode: 'sun',
    weatherLabel: 'Grand Soleil & Chaleur',
    emoji: '☀️',
    temperature: 24.5,
    intensity: 'FAIBLE',
    comment: 'Ciel bleu pur sur les Calanques, mer calme et légère brise marine.',
    reporterPseudo: 'MistralGagnant_13',
    timestamp: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
    confirmations: 19
  },
  {
    id: 'rep-init-6',
    city: 'Strasbourg',
    department: 'Bas-Rhin (67)',
    latitude: 48.5734,
    longitude: 7.7521,
    weatherCode: 'fog',
    weatherLabel: 'Brouillard givrant / opaque',
    emoji: '🌫️',
    temperature: 4.8,
    intensity: 'FORTE',
    comment: 'Visibilité réduite à moins de 200m en plaine d\'Alsace le long du Rhin.',
    reporterPseudo: 'AlsaceClimat',
    timestamp: new Date(Date.now() - 140 * 60 * 1000).toISOString(),
    confirmations: 6
  },
  {
    id: 'rep-init-7',
    city: 'Paris',
    department: 'Paris (75)',
    latitude: 48.8566,
    longitude: 2.3522,
    weatherCode: 'cloud',
    weatherLabel: 'Ciel très couvert / Menace',
    emoji: '☁️',
    temperature: 15.0,
    intensity: 'FAIBLE',
    comment: 'Plafond bas de stratocumulus, quelques gouttes éparses.',
    reporterPseudo: 'Nephologue_Paris',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    confirmations: 14
  }
];

export function getCommunityReports(): CommunityWeatherReport[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SEED_REPORTS));
      return INITIAL_SEED_REPORTS;
    }
    const parsed: CommunityWeatherReport[] = JSON.parse(raw);
    return parsed;
  } catch (err) {
    console.warn('Erreur lecture community reports:', err);
    return INITIAL_SEED_REPORTS;
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
