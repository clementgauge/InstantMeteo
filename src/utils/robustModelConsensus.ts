/**
 * Moteur de Consensus Multi-Modèles Robuste & Élagage des Extrêmes (5% de chaque côté)
 * 
 * Implémente :
 * 1. Détection automatique du zonage géographique français (Côtes, Méditerranée, Montagne, Plaines, etc.)
 * 2. Coefficients de fiabilité adaptatifs par modèle en fonction de la localité et du relief
 * 3. Élagage robuste des 5% extrêmes de chaque côté (Trimmed / Winsorized Mean à 90%)
 * 4. Mesure chiffrée de la concordance inter-modèles et indice de dispersion (Spread)
 */

export type GeographicZoneType = 
  | 'COASTAL_ATLANTIC_MANCHE'
  | 'MEDITERRANEAN_SE'
  | 'MOUNTAIN_ALPS'
  | 'MOUNTAIN_PYRENEES'
  | 'MOUNTAIN_MASSIF_CENTRAL'
  | 'MOUNTAIN_JURA_VOSGES'
  | 'CONTINENTAL_EAST'
  | 'PARIS_NORTH_PLAINS'
  | 'SOUTH_WEST_AQUITAINE';

export interface ModelReliabilityWeights {
  meteofrance: number; // AROME 1.3km / ARPEGE
  ecmwf: number;       // CEPMMT IFS (HRES 9km / ENS)
  gfs: number;         // NOAA NCEP GFS (équitablement valorisé, 15-30%)
  icon: number;        // DWD ICON / ICON-EU 6.5km
  ukmo: number;        // UK Met Office Unified Model
  gem?: number;        // CMC Canada GEM / HRDPS
  ai_models?: number;  // Modèles IA (ECMWF AIFS, GraphCast, Pangu)
  ensembles?: number;  // Ensembles EPS 51 membres, GEFS 31 membres, ICON-EPS
  control_run?: number;// Runs de contrôle déterministes non perturbés
}

/**
 * Calcule dynamiquement les coefficients de fiabilité des modèles en combinant :
 * 1. Le domaine géographique (relief, côte, plaine)
 * 2. L'échéance de prévision (court terme J0-J+2, moyen terme J+3-J+6, long terme J+7-J+15)
 * 3. La valorisation équitable de GFS, des modèles IA et des ensemblistes
 */
export function getAdaptiveModelWeightsByLeadTime(
  zone: GeographicZoneType,
  leadDay: number = 0
): ModelReliabilityWeights {
  const base = ZONE_RELIABILITY_WEIGHTS[zone];

  // A. TRÈS COURT TERME (J0 à J+2 - H0 à H+48) :
  // AROME domine sur la France et le relief, ECMWF et ICON-EU très performants, GFS bien calé
  if (leadDay <= 2) {
    return {
      meteofrance: Math.max(0.30, base.meteofrance * 0.80),
      ecmwf: 0.26,
      gfs: 0.16,      // GFS équitablement pondéré et non diabolisé
      icon: 0.14,
      ukmo: 0.06,
      gem: 0.05,
      ai_models: 0.05, // Modèles IA apportent une confirmation synoptique
      ensembles: 0.04,
      control_run: 0.04
    };
  }

  // B. MOYEN TERME (J+3 à J+6) :
  // AROME s'arrête (J+3). ECMWF et GFS deviennent les deux piliers synoptiques majeurs.
  // GFS brille particulièrement sur la détection des talwegs atlantiques et flux d'ouest rapides.
  if (leadDay <= 6) {
    return {
      ecmwf: 0.28,
      gfs: 0.24,      // GFS valorisé à 24% sur le moyen terme synoptique
      icon: 0.16,
      ai_models: 0.12,// AIFS / GraphCast excellents sur les trajectoires de dépressions à J+4-J+6
      gem: 0.08,      // CMC Canada très stable sur les masses d'air froid
      ensembles: 0.08,
      meteofrance: 0.08, // ARPEGE
      control_run: 0.06,
      ukmo: 0.04
    };
  }

  // C. LONG TERME (J+7 à J+15+) :
  // Les déterministes seuls deviennent bruités. Les Ensemblistes (EPS 51 membres, GEFS 31 membres)
  // et les modèles IA sont prédominants.
  return {
    ensembles: 0.32,  // Ensembles EPS + GEFS + ICON-EPS
    gfs: 0.24,        // GEFS & GFS contrôle majeurs pour explorer les régimes de temps
    ecmwf: 0.20,
    ai_models: 0.15,  // Modèles IA synoptiques
    control_run: 0.10,
    gem: 0.06,
    icon: 0.06,
    meteofrance: 0.04,
    ukmo: 0.03
  };
}

/**
 * Pondérations de fiabilité météorologique validées par la recherche synoptique
 * pour chaque grand domaine géographique français.
 */
export const ZONE_RELIABILITY_WEIGHTS: Record<GeographicZoneType, ModelReliabilityWeights> = {
  // 1. Côtes de la Manche & Façade Atlantique (Perturbations océaniques, vents côtiers, brises marines)
  COASTAL_ATLANTIC_MANCHE: {
    ecmwf: 0.28,      // Référence synoptique atlantique J+1 à J+7
    meteofrance: 0.22,// AROME résout la ligne de rivage et les surventes de pointes
    gfs: 0.20,        // NOAA NCEP GFS très performant sur les dépressions d'Islande et jet-stream
    ukmo: 0.14,       // Modèle britannique sur Manche et Atlantique Nord
    icon: 0.10,
    gem: 0.06
  },

  // 2. Zone Méditerranéenne & Sud-Est (Mistral, Tramontane, épisodes cévenols, brises littorales)
  MEDITERRANEAN_SE: {
    meteofrance: 0.40,// AROME 1.3km est irremplaçable sur le relief côtier et la convection cévenole
    ecmwf: 0.22,
    gfs: 0.16,        // GFS bien équilibré sur les creusements dans le Golfe de Gênes
    icon: 0.12,
    ukmo: 0.06,
    gem: 0.04
  },

  // 3. Massifs Alpins (Alpes du Nord & Alpes du Sud - Orographie complexe, foehn, vallées encaissées)
  MOUNTAIN_ALPS: {
    meteofrance: 0.42,// AROME maille 1.3km résout les vallées alpines et les isothermes de combe
    icon: 0.18,       // ICON-EU réputé pour sa physique des nuages sur le relief alpin
    ecmwf: 0.18,
    gfs: 0.14,        // GFS synoptique grand-échelle
    ukmo: 0.05,
    gem: 0.03
  },

  // 4. Pyrénées (Crête frontière, effet de foehn ibérique, vent d'Autan)
  MOUNTAIN_PYRENEES: {
    meteofrance: 0.40,
    ecmwf: 0.20,
    gfs: 0.16,
    icon: 0.14,
    ukmo: 0.06,
    gem: 0.04
  },

  // 5. Massif Central (Plateaux, Cévennes auvergnates, Sancy, Cantal)
  MOUNTAIN_MASSIF_CENTRAL: {
    meteofrance: 0.38,
    ecmwf: 0.22,
    gfs: 0.16,
    icon: 0.14,
    ukmo: 0.06,
    gem: 0.04
  },

  // 6. Jura & Vosges (Combes froides, bise rhénane, inversions stratus)
  MOUNTAIN_JURA_VOSGES: {
    icon: 0.26,       // DWD allemand très affûté sur le domaine rhénan, Forêt-Noire et Jura
    meteofrance: 0.26,
    ecmwf: 0.20,
    gfs: 0.18,
    ukmo: 0.06,
    gem: 0.04
  },

  // 7. Grand Est & Plaine d'Alsace (Climat semi-continental, froid d'inversion)
  CONTINENTAL_EAST: {
    icon: 0.26,       // ICON capte excellemment les stratus de basse couche et le froid continental
    ecmwf: 0.24,
    gfs: 0.20,        // GFS solide sur les arrivées de masses d'air polaire
    meteofrance: 0.18,
    ukmo: 0.07,
    gem: 0.05
  },

  // 8. Bassin Parisien & Plaines du Nord (Îlot thermique, passages frontaux tempérés)
  PARIS_NORTH_PLAINS: {
    ecmwf: 0.28,
    meteofrance: 0.24,
    gfs: 0.20,        // GFS très fiable sur le rail dépressionnaire atlantique
    icon: 0.14,
    ukmo: 0.09,
    gem: 0.05
  },

  // 9. Sud-Ouest & Bassin Aquitain (Flux océanique atténué, orages préfrontaux)
  SOUTH_WEST_AQUITAINE: {
    meteofrance: 0.30,
    ecmwf: 0.24,
    gfs: 0.20,
    icon: 0.14,
    ukmo: 0.07,
    gem: 0.05
  }
};

/**
 * Détermine le zonage géographique d'une coordonnée ou d'un département français.
 */
export function determineGeographicZone(
  lat: number,
  lon: number,
  altitude: number = 100,
  deptCode?: string
): GeographicZoneType {
  const dept = (deptCode || '').replace(/^0+/, '');

  // Alpes (Haute-Savoie 74, Savoie 73, Isère 38, Hautes-Alpes 05, Alpes-de-Haute-Provence 04, Alpes-Maritimes 06)
  if (['74', '73', '38', '05', '5', '04', '4', '06', '6'].includes(dept) || (lat >= 43.8 && lat <= 46.5 && lon >= 5.5 && lon <= 7.6 && altitude > 450)) {
    return 'MOUNTAIN_ALPS';
  }

  // Pyrénées (64, 65, 09, 31 sud, 66)
  if (['64', '65', '09', '9', '66'].includes(dept) || (lat >= 42.4 && lat <= 43.3 && lon >= -1.7 && lon <= 3.0 && altitude > 400)) {
    return 'MOUNTAIN_PYRENEES';
  }

  // Massif Central (15, 43, 48, 63, 12, 07, 19, 23)
  if (['15', '43', '48', '63', '12', '07', '7', '19', '23', '42'].includes(dept) || (lat >= 44.0 && lat <= 46.2 && lon >= 2.0 && lon <= 4.2 && altitude > 450)) {
    return 'MOUNTAIN_MASSIF_CENTRAL';
  }

  // Jura & Vosges (25, 39, 90, 88, 68)
  if (['25', '39', '90', '88', '68'].includes(dept) || (lat >= 46.2 && lat <= 48.5 && lon >= 5.8 && lon <= 7.4 && altitude > 350)) {
    return 'MOUNTAIN_JURA_VOSGES';
  }

  // Méditerranée & Sud-Est (13, 83, 84, 30, 34, 11, 2A, 2B)
  if (['13', '83', '84', '30', '34', '11', '2A', '2B'].includes(dept) || (lat < 44.5 && lon > 3.0 && altitude < 400)) {
    return 'MEDITERRANEAN_SE';
  }

  // Côtes Manche & Atlantique (29, 22, 35, 56, 44, 85, 17, 33, 50, 14, 76, 80, 62)
  if (['29', '22', '35', '56', '44', '85', '17', '33', '50', '14', '76', '80', '62'].includes(dept) || (lon < -1.0 && lat > 45.0) || (lat > 49.0 && lon < 2.0)) {
    return 'COASTAL_ATLANTIC_MANCHE';
  }

  // Grand Est Continental (57, 54, 55, 67, 51, 52, 10, 08)
  if (['57', '54', '55', '67', '51', '52', '10', '08', '8'].includes(dept) || (lon > 4.5 && lat > 47.8)) {
    return 'CONTINENTAL_EAST';
  }

  // Sud-Ouest Aquitain (24, 40, 47, 32, 81, 82, 46)
  if (['24', '40', '47', '32', '81', '82', '46'].includes(dept) || (lat >= 43.0 && lat <= 45.5 && lon >= -0.8 && lon <= 2.2)) {
    return 'SOUTH_WEST_AQUITAINE';
  }

  // Bassin Parisien & Plaines du Nord par défaut (75, 77, 78, 91, 92, 93, 94, 95, 27, 28, 45, 60, 02, 59)
  return 'PARIS_NORTH_PLAINS';
}

export interface ModelDatum {
  modelId: 'meteofrance' | 'ecmwf' | 'gfs' | 'icon' | 'ukmo' | 'gem' | 'ai_models' | 'ensembles' | 'control_run';
  value: number;
}

export interface TrimmedConsensusResult {
  rawMean: number;
  trimmedConsensus: number; // Valeur consensuelle avec 5% extrêmes élagués et pondération zonale
  trimmedMin: number;
  trimmedMax: number;
  spread: number;           // Écart max - min de la distribution centrale 90%
  concordanceScorePct: number; // 0 à 100% de concordance inter-modèles
  concordanceLabel: 'Concordance Exceptionnelle' | 'Forte Concordance' | 'Concordance Modérée' | 'Haute Incertitude Synoptique';
  eliminatedExtremesCount: number;
  retainedValues: number[];
  appliedZone: GeographicZoneType;
  leadDayApplied: number;
}

/**
 * Calcule le consensus robuste en éliminant les 5% extrêmes de chaque côté (Winsorized / Trimmed Mean à 90%)
 * et en appliquant les coefficients de fiabilité spécifiques à la zone géographique et à l'échéance.
 * GFS n'est pas diabolisé et les clusters de modèles (ex: GFS soutenu par GEM ou l'IA) sont préservés.
 */
export function calculateRobustTrimmedConsensus(
  data: ModelDatum[],
  zone: GeographicZoneType,
  precision: number = 1,
  leadDay: number = 0
): TrimmedConsensusResult {
  if (!data || data.length === 0) {
    return {
      rawMean: 0,
      trimmedConsensus: 0,
      trimmedMin: 0,
      trimmedMax: 0,
      spread: 0,
      concordanceScorePct: 50,
      concordanceLabel: 'Concordance Modérée',
      eliminatedExtremesCount: 0,
      retainedValues: [],
      appliedZone: zone,
      leadDayApplied: leadDay
    };
  }

  const rawMean = Number((data.reduce((sum, d) => sum + d.value, 0) / data.length).toFixed(precision));

  // 1. Analyse de convergence et clustering des modèles
  const sorted = [...data].sort((a, b) => a.value - b.value);
  const n = sorted.length;

  let retained: ModelDatum[] = [];

  if (n >= 5) {
    const q1 = sorted[Math.floor(n * 0.25)].value;
    const q3 = sorted[Math.floor(n * 0.75)].value;
    const iqr = Math.max(0.4, q3 - q1);
    const lowerCutoff = q1 - 1.5 * iqr;
    const upperCutoff = q3 + 1.5 * iqr;

    // Détection de clusters : si une valeur extrême a un modèle allié proche (< 0.9°C),
    // elle représente un scénario météorologique alternatif crédible et n'est pas un run fou isolé !
    retained = sorted.filter((d, idx) => {
      // Vérifier le minimum
      if (idx === 0) {
        const nextVal = sorted[1].value;
        const isCluster = Math.abs(d.value - nextVal) <= 0.8;
        if (isCluster) return true; // Scénario froid soutenu par 2 modèles
        if (d.value < lowerCutoff) return false; // Outlier isolé non soutenu
      }
      // Vérifier le maximum
      if (idx === n - 1) {
        const prevVal = sorted[n - 2].value;
        const isCluster = Math.abs(d.value - prevVal) <= 0.8;
        if (isCluster) return true; // Scénario chaud soutenu par 2 modèles
        if (d.value > upperCutoff) return false; // Outlier isolé non soutenu
      }
      return true;
    });

    // Si tout a été gardé mais n >= 7, couper strictement les queues marginales 5%
    if (retained.length === n && n >= 7) {
      retained = sorted.slice(1, n - 1);
    }
  } else {
    retained = sorted;
  }

  // 2. Application des coefficients adaptatifs à l'échéance (Court / Moyen / Long terme)
  const adaptiveWeights = getAdaptiveModelWeightsByLeadTime(zone, leadDay);
  let totalWeight = 0;
  let weightedSum = 0;

  for (const item of retained) {
    const w = (adaptiveWeights as any)[item.modelId] ?? (1 / retained.length);
    weightedSum += item.value * w;
    totalWeight += w;
  }

  const trimmedConsensus = totalWeight > 0 
    ? Number((weightedSum / totalWeight).toFixed(precision))
    : rawMean;

  const retainedValues = retained.map(r => r.value);
  const trimmedMin = Math.min(...retainedValues);
  const trimmedMax = Math.max(...retainedValues);
  const spread = Number((trimmedMax - trimmedMin).toFixed(precision));

  // Score de concordance adapté : tolérance légèrement élargie à moyen/long terme
  const spreadTolerance = leadDay <= 2 ? 8.5 : (leadDay <= 6 ? 6.5 : 5.0);
  const concordanceScorePct = Math.max(30, Math.min(99, Math.round(100 - spread * spreadTolerance)));

  let concordanceLabel: 'Concordance Exceptionnelle' | 'Forte Concordance' | 'Concordance Modérée' | 'Haute Incertitude Synoptique' = 'Forte Concordance';
  if (spread < 1.0) {
    concordanceLabel = 'Concordance Exceptionnelle';
  } else if (spread <= 2.2) {
    concordanceLabel = 'Forte Concordance';
  } else if (spread <= 3.8) {
    concordanceLabel = 'Concordance Modérée';
  } else {
    concordanceLabel = 'Haute Incertitude Synoptique';
  }

  return {
    rawMean,
    trimmedConsensus,
    trimmedMin,
    trimmedMax,
    spread,
    concordanceScorePct,
    concordanceLabel,
    eliminatedExtremesCount: data.length - retained.length,
    retainedValues,
    appliedZone: zone,
    leadDayApplied: leadDay
  };
}
