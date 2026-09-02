// Service de Compétition, Gamification & Chasse Météo pour Instant Météo
import { LocationPoint, CurrentWeather } from '../types/weather';

export interface VisitedLocation {
  id: string;
  name: string;
  department?: string;
  region?: string;
  latitude: number;
  longitude: number;
  altitude?: number;
  visitedAt: string;
  pointsEarned: number;
}

export interface WeatherBadge {
  id: string;
  name: string;
  emoji: string;
  description: string;
  points: number;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface PlayerProfile {
  pseudo: string;
  totalPoints: number;
  streakDays: number; // Flammes consécutives 🔥
  lastActiveDate: string; // YYYY-MM-DD
  minutesSpent: number;
  visitedLocations: VisitedLocation[];
  unlockedWeatherIds: string[];
  amazonBonusesClaimed: number;
  communityReportsCount: number;
  createdAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  pseudo: string;
  points: number;
  streakDays: number;
  locationsCount: number;
  badgesCount: number;
  isCurrentUser?: boolean;
  badgeTitle: string;
}

const STORAGE_KEY = 'instant_meteo_competitive_profile';

export const WEATHER_BADGES_CATALOG: WeatherBadge[] = [
  { id: 'sun', name: 'Plein Soleil', emoji: '☀️', description: 'Ciel limpide & fort ensoleillement', points: 50, unlocked: false },
  { id: 'rain', name: 'Pluie & Averse', emoji: '🌧️', description: 'Précipitation mesurable supérieure à 1 mm/h', points: 60, unlocked: false },
  { id: 'storm', name: 'Orage & Foudre', emoji: '⚡', description: 'Activité orageuse détectée ou observée', points: 150, unlocked: false },
  { id: 'snow', name: 'Chute de Neige', emoji: '❄️', description: 'Précipitations neigeuses en direct', points: 120, unlocked: false },
  { id: 'frost', name: 'Grand Froid / Gelée', emoji: '🧊', description: 'Température sous 0°C', points: 80, unlocked: false },
  { id: 'fog', name: 'Brouillard Dense', emoji: '🌫️', description: 'Visibilité inférieure à 1000 mètres', points: 90, unlocked: false },
  { id: 'gale', name: 'Coup de Vent', emoji: '💨', description: 'Rafales supérieures à 60 km/h', points: 100, unlocked: false },
  { id: 'heat', name: 'Vague de Chaleur', emoji: '🌡️', description: 'Température supérieure à 32°C', points: 110, unlocked: false },
  { id: 'altitude', name: 'Sommet / Haute Altitude', emoji: '⛰️', description: 'Relevé à plus de 1000m d\'altitude', points: 140, unlocked: false },
  { id: 'night_stars', name: 'Nuit Étoilée', emoji: '🌌', description: 'Ciel nocturne avec 0 octas de nébulosité', points: 70, unlocked: false }
];

export function getMultiplier(streakDays: number): { multiplier: number; label: string; nextTier: string } {
  if (streakDays >= 1460) {
    return { multiplier: 10, label: 'x10 (Légende 4 Ans !)', nextTier: 'Niveau Maximum Atteint' };
  }
  if (streakDays >= 365) {
    return { multiplier: 3, label: 'x3 (Vétéran 1 An !)', nextTier: 'Prochain palier : x10 à 4 ans (1460 j)' };
  }
  if (streakDays >= 30) {
    return { multiplier: 2, label: 'x2 (Explorateur 1 Mois !)', nextTier: 'Prochain palier : x3 à 1 an (365 j)' };
  }
  const remainingForMonth = 30 - streakDays;
  return { multiplier: 1, label: 'x1 (Standard)', nextTier: `Bonus x2 dans ${remainingForMonth} jour(s) de flammes 🔥` };
}

export function loadPlayerProfile(): PlayerProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const profile = JSON.parse(raw) as PlayerProfile;
    return profile;
  } catch (err) {
    console.warn('Erreur lecture profil joueur:', err);
    return null;
  }
}

export function savePlayerProfile(profile: PlayerProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    window.dispatchEvent(new CustomEvent('instant_meteo_score_updated', { detail: profile }));
  } catch (err) {
    console.warn('Erreur sauvegarde profil:', err);
  }
}

export function initPlayerProfile(pseudo: string): PlayerProfile {
  const today = new Date().toISOString().split('T')[0];
  const newProfile: PlayerProfile = {
    pseudo: pseudo.trim() || 'Chasseur Météo',
    totalPoints: 100, // Points de bienvenue
    streakDays: 1,
    lastActiveDate: today,
    minutesSpent: 0,
    visitedLocations: [],
    unlockedWeatherIds: [],
    amazonBonusesClaimed: 0,
    communityReportsCount: 0,
    createdAt: new Date().toISOString()
  };
  savePlayerProfile(newProfile);
  return newProfile;
}

// Actualisation quotidienne des flammes de connexion consécutive
export function refreshDailyStreak(profile: PlayerProfile): PlayerProfile {
  const today = new Date().toISOString().split('T')[0];
  if (profile.lastActiveDate === today) {
    return profile;
  }

  const last = new Date(profile.lastActiveDate);
  const now = new Date(today);
  const diffTime = Math.abs(now.getTime() - last.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let updatedStreak = profile.streakDays;
  if (diffDays === 1) {
    // Jour consécutif
    updatedStreak += 1;
  } else if (diffDays > 1) {
    // Jour manqué : redémarrage à 1
    updatedStreak = 1;
  }

  const updated: PlayerProfile = {
    ...profile,
    streakDays: updatedStreak,
    lastActiveDate: today
  };
  savePlayerProfile(updated);
  return updated;
}

// Ajout de minutes passées sur l'application (1 min = points)
export function addActiveMinute(profile: PlayerProfile): PlayerProfile {
  const { multiplier } = getMultiplier(profile.streakDays);
  const pts = 10 * multiplier;
  const updated: PlayerProfile = {
    ...profile,
    minutesSpent: profile.minutesSpent + 1,
    totalPoints: profile.totalPoints + pts
  };
  savePlayerProfile(updated);
  return updated;
}

// Enregistrement d'un nouveau lieu visité via géolocalisation
export function registerVisitedLocation(profile: PlayerProfile, station: LocationPoint): { profile: PlayerProfile; added: boolean; points: number } {
  const locationKey = `${station.latitude.toFixed(2)}_${station.longitude.toFixed(2)}`;
  const alreadyVisited = profile.visitedLocations.some(l => 
    `${l.latitude.toFixed(2)}_${l.longitude.toFixed(2)}` === locationKey ||
    l.name.toLowerCase() === station.name.toLowerCase()
  );

  if (alreadyVisited) {
    return { profile, added: false, points: 0 };
  }

  const { multiplier } = getMultiplier(profile.streakDays);
  const earned = 75 * multiplier;

  const newLoc: VisitedLocation = {
    id: `loc_${Date.now()}`,
    name: station.name,
    department: station.department,
    region: station.region,
    latitude: station.latitude,
    longitude: station.longitude,
    altitude: station.altitude,
    visitedAt: new Date().toISOString(),
    pointsEarned: earned
  };

  const updated: PlayerProfile = {
    ...profile,
    visitedLocations: [newLoc, ...profile.visitedLocations],
    totalPoints: profile.totalPoints + earned
  };
  savePlayerProfile(updated);
  return { profile: updated, added: true, points: earned };
}

// Détection et déblocage de condition météo rencontrée
export function checkAndUnlockWeatherConditions(profile: PlayerProfile, weather: CurrentWeather, station: LocationPoint): { profile: PlayerProfile; newBadges: WeatherBadge[] } {
  const newlyUnlocked: WeatherBadge[] = [];
  const { multiplier } = getMultiplier(profile.streakDays);
  let pointsToAdd = 0;
  const currentUnlocked = new Set(profile.unlockedWeatherIds);

  const testCondition = (id: string, met: boolean) => {
    if (met && !currentUnlocked.has(id)) {
      currentUnlocked.add(id);
      const badge = WEATHER_BADGES_CATALOG.find(b => b.id === id);
      if (badge) {
        newlyUnlocked.push(badge);
        pointsToAdd += (badge.points * multiplier);
      }
    }
  };

  // Logique de détection météo réelle
  testCondition('sun', weather.weatherCode <= 1 && (weather.synopticConditions?.cloudCoverTotalPct ?? 0) < 25);
  testCondition('rain', (weather.precipitation ?? 0) > 0.5 || [51, 53, 55, 61, 63, 65, 80, 81, 82].includes(weather.weatherCode));
  testCondition('storm', [95, 96, 99].includes(weather.weatherCode) || (weather.thunderstormAnalysis?.globalStormRiskScore ?? 0) >= 60);
  testCondition('snow', [71, 73, 75, 77, 85, 86].includes(weather.weatherCode));
  testCondition('frost', weather.temperature < 0);
  testCondition('fog', [45, 48].includes(weather.weatherCode) || (weather.visibilityKm ?? 10) < 1);
  testCondition('gale', (weather.windGust ?? weather.windSpeed) > 60);
  testCondition('heat', weather.temperature >= 32);
  testCondition('altitude', (station.altitude ?? 0) >= 1000);
  testCondition('night_stars', !weather.isDay && (weather.synopticConditions?.cloudCoverTotalPct ?? 0) === 0);

  if (newlyUnlocked.length > 0) {
    const updated: PlayerProfile = {
      ...profile,
      unlockedWeatherIds: Array.from(currentUnlocked),
      totalPoints: profile.totalPoints + pointsToAdd
    };
    savePlayerProfile(updated);
    return { profile: updated, newBadges: newlyUnlocked };
  }

  return { profile, newBadges: [] };
}

// Clic ou consultation d'offre Amazon (bonus équipement météo)
export function claimAmazonBonus(profile: PlayerProfile): { profile: PlayerProfile; points: number } {
  const { multiplier } = getMultiplier(profile.streakDays);
  const earned = 50 * multiplier;
  const updated: PlayerProfile = {
    ...profile,
    amazonBonusesClaimed: profile.amazonBonusesClaimed + 1,
    totalPoints: profile.totalPoints + earned
  };
  savePlayerProfile(updated);
  return { profile: updated, points: earned };
}

// Soumission d'une observation météo citoyenne sur la carte
export function rewardCommunityReport(profile: PlayerProfile): { profile: PlayerProfile; points: number } {
  const { multiplier } = getMultiplier(profile.streakDays);
  const earned = 150 * multiplier;
  const updated: PlayerProfile = {
    ...profile,
    communityReportsCount: profile.communityReportsCount + 1,
    totalPoints: profile.totalPoints + earned
  };
  savePlayerProfile(updated);
  return { profile: updated, points: earned };
}

// Génération du classement compétitif (uniquement les vrais utilisateurs inscrits)
export function getLeaderboard(currentProfile: PlayerProfile | null): LeaderboardEntry[] {
  const allEntries: (Omit<LeaderboardEntry, 'rank'> & { isCurrentUser: boolean })[] = [];

  if (currentProfile && currentProfile.pseudo) {
    const userBadgeCount = currentProfile.unlockedWeatherIds.length;
    let badgeTitle = 'Apprenti Météo';
    if (currentProfile.totalPoints >= 3000) badgeTitle = 'Grand Maître Cumulonimbus';
    else if (currentProfile.totalPoints >= 2000) badgeTitle = 'Sentinelle Météorologique';
    else if (currentProfile.totalPoints >= 1000) badgeTitle = 'Chasseur Émérite';
    else if (currentProfile.totalPoints >= 400) badgeTitle = 'Observateur Averti';

    allEntries.push({
      pseudo: currentProfile.pseudo,
      points: currentProfile.totalPoints,
      streakDays: currentProfile.streakDays,
      locationsCount: currentProfile.visitedLocations.length,
      badgesCount: userBadgeCount,
      isCurrentUser: true,
      badgeTitle
    });
  }

  // Tri par points décroissants
  allEntries.sort((a, b) => b.points - a.points);

  return allEntries.map((item, index) => ({
    ...item,
    rank: index + 1
  }));
}
