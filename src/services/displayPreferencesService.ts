// Service de personnalisation de l'affichage des pages et des blocs
export interface DisplayPreferences {
  visiblePages: Record<string, boolean>;
  visibleBlocks: Record<string, boolean>; // key format: `${pageId}:${blockId}`
}

const STORAGE_KEY = 'instant_meteo_display_preferences';

export interface PageDefinition {
  id: string;
  number: number;
  label: string;
  description: string;
  blocks: { id: string; label: string; description: string }[];
}

export const ALL_PAGE_DEFINITIONS: PageDefinition[] = [
  {
    id: 'realtime',
    number: 1,
    label: '1. Temps Réel & Observatoire Direct',
    description: 'Conditions en direct, thermomètre, vent, pression et profils spécialisés',
    blocks: [
      { id: 'profiles', label: '4 Profils Spécialisés', description: 'Boutons de sélection (Chaîne Météo, Agro, Aviation, Pro)' },
      { id: 'hero', label: 'Radiographie Météo & Climat', description: 'Température principale, ressenti, soleil/lune et relevés instantanés' },
      { id: 'hourly_daily', label: 'Prévisions Jour & Semaine', description: 'Défilement heure par heure et tendance 7 jours' },
      { id: 'indicators', label: 'Indicateurs & Précision', description: 'Vent, humidité, pression barométrique, UV et point de rosée' },
      { id: 'precipitation', label: 'Précipitations & Nowcasting', description: 'Radar pluie minute par minute et cumul 24h' },
      { id: 'precision_hub', label: 'Observatoire de Précision Certifié', description: 'Capteurs certifiés, sondage et thermo-hygrométrie avancée' },
      { id: 'deep_conditions', label: 'Conditions Approfondies', description: 'Nébulosité, indices atmosphériques et strates' },
      { id: 'shortcuts', label: 'Raccourcis & Téléchargement', description: 'Cartes d\'accès direct et installation' }
    ]
  },
  {
    id: 'skymap',
    number: 2,
    label: '2. SkyMap 3D — Navigation, Ciel & Relief',
    description: 'Carte 3D vectorielle interactive, météo en direct, guidage GPS, relief et itinéraires',
    blocks: [
      { id: 'skymap_viewer', label: 'Visualiseur SkyMap 3D', description: 'Vue vectorielle 3D avec météo en temps réel et radar' },
      { id: 'skymap_gps', label: 'Géolocalisation & Guidage GPS', description: 'Suivi de position en direct et orientation' }
    ]
  },
  {
    id: 'cloudNephology',
    number: 2,
    label: '2. Nuages & Observatoire Néphologique 48h',
    description: 'Sondage vertical 0-12000m, étages nuageux, base/sommet et atlas OMM',
    blocks: [
      { id: 'vertical_profile', label: 'Sondage vertical de l\'atmosphère', description: 'Strates basses, moyennes et hautes' },
      { id: 'cloud_atlas', label: 'Atlas mondial des nuages OMM', description: 'Classification morphologique des genres nuageux' }
    ]
  },
  {
    id: 'vigilance',
    number: 3,
    label: '3. Vigilances & Alertes Multi-Jours',
    description: 'Matrice 12 risques météo actualisée toutes les 5 minutes',
    blocks: [
      { id: 'vigilance_matrix', label: 'Matrice des 12 risques', description: 'Vent violent, pluie-inondation, orages, canicule, grand froid...' },
      { id: 'multiday_timeline', label: 'Chronologie multi-jours', description: 'Évolution du niveau de risque jour après jour' }
    ]
  },
  {
    id: 'scenarios14d',
    number: 4,
    label: '4. Tendances & Scénarios 14 Jours',
    description: 'Faisceaux probabilistes, indices de confiance et modélisation',
    blocks: [
      { id: 'scenarios_chart', label: 'Graphique des faisceaux d\'ensembles', description: 'Courbes de probabilités multi-modèles' },
      { id: 'daily_scenarios', label: 'Détail quotidien des scénarios', description: 'Scénario médian, pessimiste et optimiste' }
    ]
  },
  {
    id: 'radar',
    number: 5,
    label: '5. Radar Précipitations, Feux NASA & Vents',
    description: 'Imagerie Doppler légale, feux de forêt et flux de vents mondiaux',
    blocks: [
      { id: 'radar_map', label: 'Carte interactive Doppler & Vents', description: 'Couches précipitations, nuages et anomalies' },
      { id: 'nasa_fires', label: 'Détection feux NASA FIRMS', description: 'Points chauds thermiques par satellite' }
    ]
  },
  {
    id: 'eightMonths',
    number: 6,
    label: '6. Tendances 8 Mois (Dép / Région / Pays)',
    description: '24 décades saisonnières spatialisées par département et région',
    blocks: [
      { id: 'seasonal_decades', label: '24 Décades saisonnières', description: 'Anomalies de température et précipitations' }
    ]
  },
  {
    id: 'historicalTrends',
    number: 7,
    label: '7. Évolution 2000, Temps Réel & Archives Météo',
    description: 'Trajectoire climatique 2000-présent, courbe minute par minute et archives depuis 1950',
    blocks: [
      { id: 'history_since_2000', label: 'Tendances pluriannuelles depuis 2000', description: 'Réchauffement local et records' },
      { id: 'minute_chart', label: 'Relevé haute fréquence à la minute', description: 'Évolution instantanée continue' },
      { id: 'archive_search', label: 'Archives journalières depuis 1950 & Carnet', description: 'Recherche par date passée, profil horaire et journal local' }
    ]
  },
  {
    id: 'worldDisasters',
    number: 8,
    label: '8. Atlas des catastrophes (Monde en temps réel)',
    description: 'Surveillance mondiale en direct (NASA EONET, USGS, GDACS, RainViewer)',
    blocks: [
      { id: 'disasters_feed', label: 'Carte interactive Atlas des catastrophes', description: 'Séismes, incendies, cyclones, inondations, volcans et records' }
    ]
  },
  {
    id: 'bulletin',
    number: 9,
    label: '9. Bulletins Prévisions (J+7 & 4 Semaines)',
    description: 'Synthèse textuelle rédigée pour la commune, département et pays',
    blocks: [
      { id: 'bulletin_text', label: 'Bulletins rédigés officiels', description: 'Analyse synoptique et tendance globale' }
    ]
  },
  {
    id: 'competitive',
    number: 10,
    label: '10. Mode Compétitif, Flammes & Classement',
    description: 'Défis de chasseur météo, points GPS réels, badges et classement',
    blocks: [
      { id: 'player_card', label: 'Carte Chasseur & Flammes', description: 'Statut, points et multiplicateurs' },
      { id: 'badges_grid', label: 'Trophées & Badges Météo', description: 'Soleil, orage, neige, froid, vent...' },
      { id: 'leaderboard', label: 'Classement Général des Joueurs', description: 'Top observateurs et scores vérifiés' }
    ]
  },
  {
    id: 'discussionGroup',
    number: 11,
    label: '11. Groupe de Discussion & Salon Météo',
    description: 'Échanges en direct entre passionnés, chasseurs d\'orages et observateurs',
    blocks: [
      { id: 'channels', label: 'Salons Thématiques', description: 'Général, Chasseurs d\'orages, Alertes, Photos du ciel' },
      { id: 'messages_feed', label: 'Fil de Discussion en Direct', description: 'Messages, photos et réactions des membres' },
      { id: 'composer', label: 'Zone d\'Envoi de Message', description: 'Poster des observations avec tags météo' }
    ]
  },
  {
    id: 'natureTerritories',
    number: 12,
    label: "12. Montagne, Neige, Plage, Mer, Sécheresse & Feux, Cours d'eau",
    description: "Page unifiée regroupant Montagne & Neige (BERA), Plage & Mer (SHOM), Sécheresse & Feux (VigiEau) et Cours d'eau (Vigicrues)",
    blocks: [
      { id: 'mountain_snow', label: 'Montagne & Neige (BERA)', description: 'Risque avalanche 1 à 5, bulletins BERA, balises Nivôse et isotherme 0°C' },
      { id: 'beach_sea', label: 'Plage & Mer (SHOM)', description: 'Température de la mer, annuaire des marées SHOM, houle et drapeaux de baignade' },
      { id: 'drought_fire', label: 'Sécheresse & Feux (VigiEau)', description: 'Météo des forêts, Indice Forêt Météo (IFM) et arrêtés VigiEau' },
      { id: 'watercourses', label: "Cours d'eau (Vigicrues)", description: "Hauteurs d'eau en direct, débits instantanés m³/s et cotes d'alerte SCHAPI" }
    ]
  }
];

export function getDefaultDisplayPreferences(): DisplayPreferences {
  const visiblePages: Record<string, boolean> = {};
  const visibleBlocks: Record<string, boolean> = {};

  ALL_PAGE_DEFINITIONS.forEach(page => {
    visiblePages[page.id] = true;
    page.blocks.forEach(block => {
      visibleBlocks[`${page.id}:${block.id}`] = true;
    });
  });

  return { visiblePages, visibleBlocks };
}

export function getDisplayPreferences(): DisplayPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultDisplayPreferences();
    const parsed = JSON.parse(raw);
    const defaults = getDefaultDisplayPreferences();
    return {
      visiblePages: { ...defaults.visiblePages, ...(parsed.visiblePages || {}) },
      visibleBlocks: { ...defaults.visibleBlocks, ...(parsed.visibleBlocks || {}) }
    };
  } catch {
    return getDefaultDisplayPreferences();
  }
}

export function saveDisplayPreferences(prefs: DisplayPreferences): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    window.dispatchEvent(new CustomEvent('instant_meteo_display_preferences_updated', { detail: prefs }));
  } catch (e) {
    console.warn('Erreur sauvegarde préférences affichage:', e);
  }
}

export function isPageVisible(pageId: string): boolean {
  const prefs = getDisplayPreferences();
  return prefs.visiblePages[pageId] !== false;
}

export function isBlockVisible(pageId: string, blockId: string): boolean {
  const prefs = getDisplayPreferences();
  if (prefs.visiblePages[pageId] === false) return false;
  return prefs.visibleBlocks[`${pageId}:${blockId}`] !== false;
}
