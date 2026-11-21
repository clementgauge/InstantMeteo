/**
 * Référentiel Vérifié des Domaines Skiables & Moteur Opérationnel Temps Réel
 * Sources : LiftRadar Europe (bulletins officiels temps réel), SkiRadar / data.gouv.fr,
 * plans officiels des domaines skiables et calendriers d'exploitation saisonniers.
 */

export type AspectDir = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';

export interface SkiDomainCatalogSpecs {
  totalSlopesCount: number;
  greenCount: number;
  blueCount: number;
  redCount: number;
  blackCount: number;
  totalSlopeKm: number;
  totalLiftsCount: number;
  nordicKm: number;
  hasGlacier: boolean;
  hasSnowpark: boolean;
  snowCannonsCoveragePct: number;
  openingHours: string;
  seasonWindow: string;
  seasonStartMD: [number, number]; // [mois 1-12, jour 1-31]
  seasonEndMD: [number, number];   // [mois 1-12, jour 1-31]
  linkedDomainName?: string;
  linkedDomainKm?: number;
  liftradarCountry?: string;
  liftradarId?: string;
  skiradarId?: string;
}

export interface LiveDifficultySlot {
  open: number | null;
  total: number | null;
  open_km?: number | null;
  total_km?: number | null;
}

export interface LiveSkiResortTelemetry {
  slug?: string;
  name?: string;
  status: 'open' | 'closed' | 'no_report';
  slopesOpen: number | null;
  slopesTotal: number | null;
  openKm: number | null;
  totalKm: number | null;
  liftsOpen: number | null;
  liftsTotal: number | null;
  snowValleyCm: number | null;
  snowMountainCm: number | null;
  snowFreshCm: number | null;
  avalancheDangerLevel: number | null;
  avalancheDangerLabel?: string | null;
  slopesByDifficulty?: {
    easy?: LiveDifficultySlot;
    intermediate?: LiveDifficultySlot;
    difficult?: LiveDifficultySlot;
    ski_route?: LiveDifficultySlot;
    other?: LiveDifficultySlot;
  } | null;
  checkedAt?: string | null;
  fetchedAt?: string | null;
}

export interface SkiDomainLiveOperations {
  domainStatus: 'OUVERT' | 'OUVERTURE PARTIELLE' | 'HAUTS SECTEURS / GLACIER' | 'FERMÉ / PRÉ-SAISON' | 'HORS SAISON';
  domainStatusLabel: string;
  domainStatusColorClass: string;
  telemetrySource: 'LIVE_OFFICIAL' | 'CALENDAR_AND_SNOW_ESTIMATE';
  telemetryBadgeLabel: string;
  telemetryTimestamp?: string;
  linkedDomainName?: string;
  linkedDomainKm?: number;
  isOpenKmEstimated: boolean;
  openSlopesCount: number;
  totalSlopesCount: number;
  openSlopesPct: number;
  openGreen: number;
  totalGreen: number;
  openBlue: number;
  totalBlue: number;
  openRed: number;
  totalRed: number;
  openBlack: number;
  totalBlack: number;
  openKm: number;
  totalKm: number;
  openLiftsCount: number;
  totalLiftsCount: number;
  liftsStatusNote: string;
  interResortLinksStatus: 'Liaisons ouvertes' | 'Liaisons partielles (vent/neige)' | 'Liaisons fermées' | 'Hors exploitation';
  nordicOpenKm: number;
  nordicTotalKm: number;
  snowparkStatus: 'Ouvert' | 'Ouverture partielle' | 'Fermé' | 'Non équipé';
  tobogganStatus: 'Ouvert' | 'Fermé';
  snowmakingPotentialLabel: string;
  snowmakingActive: boolean;
  snowCannonsCoveragePct: number;
  groomingQuality: string;
  visibilityStatus: string;
  roadAccessStatus: string;
  roadAlertLevel: 'NORMAL' | 'ATTENTION' | 'ÉQUIPEMENTS_OBLIGATOIRES';
  openingHours: string;
  seasonWindow: string;
  recommendedSkierLevel: string;
  avalancheDetail: {
    beraLevel: 1 | 2 | 3 | 4 | 5;
    beraShortLabel: string;
    criticalAltitudeM: number;
    criticalSlopes: AspectDir[];
    dominantMechanisms: string[];
    spontaneousActivity: string;
    skierTriggerRisk: string;
    snowpackStability: 'Bonne' | 'Modérée' | 'Fragile' | 'Critique';
    offPisteAdvice: string;
    safetyGearRequired: string;
  };
}

export const SKI_DOMAIN_SPECS_BY_ID: Record<string, SkiDomainCatalogSpecs> = {
  // 1. FRANCE — ALPES DU NORD
  'chamonix': {
    totalSlopesCount: 121, greenCount: 18, blueCount: 40, redCount: 45, blackCount: 18,
    totalSlopeKm: 169, totalLiftsCount: 82, nordicKm: 58, hasGlacier: true, hasSnowpark: true,
    snowCannonsCoveragePct: 38, openingHours: '08h45 – 16h45',
    seasonWindow: '28 Nov – 3 Mai', seasonStartMD: [11, 28], seasonEndMD: [5, 3],
    liftradarCountry: 'fr', liftradarId: 'chamonix', skiradarId: 'chamonix-mont-blanc'
  },
  'val-thorens': {
    totalSlopesCount: 75, greenCount: 11, blueCount: 31, redCount: 26, blackCount: 7,
    totalSlopeKm: 150, totalLiftsCount: 23, nordicKm: 4, hasGlacier: true, hasSnowpark: true,
    snowCannonsCoveragePct: 52, openingHours: '09h00 – 17h00',
    seasonWindow: '21 Nov – 3 Mai', seasonStartMD: [11, 21], seasonEndMD: [5, 3],
    linkedDomainName: 'Les 3 Vallées', linkedDomainKm: 600,
    liftradarCountry: 'fr', liftradarId: 'val-thorens', skiradarId: 'val-thorens'
  },
  'les-menuires': {
    totalSlopesCount: 86, greenCount: 14, blueCount: 39, redCount: 24, blackCount: 9,
    totalSlopeKm: 160, totalLiftsCount: 30, nordicKm: 12, hasGlacier: false, hasSnowpark: true,
    snowCannonsCoveragePct: 55, openingHours: '09h00 – 16h45',
    seasonWindow: '5 Déc – 18 Avr', seasonStartMD: [12, 5], seasonEndMD: [4, 18],
    linkedDomainName: 'Les 3 Vallées', linkedDomainKm: 600,
    liftradarCountry: 'fr', liftradarId: 'les-menuires', skiradarId: 'les-menuires'
  },
  'courchevel': {
    totalSlopesCount: 114, greenCount: 22, blueCount: 40, redCount: 40, blackCount: 12,
    totalSlopeKm: 150, totalLiftsCount: 57, nordicKm: 66, hasGlacier: false, hasSnowpark: true,
    snowCannonsCoveragePct: 62, openingHours: '09h00 – 16h45',
    seasonWindow: '5 Déc – 18 Avr', seasonStartMD: [12, 5], seasonEndMD: [4, 18],
    linkedDomainName: 'Les 3 Vallées', linkedDomainKm: 600,
    liftradarCountry: 'fr', liftradarId: 'courchevel', skiradarId: 'courchevel'
  },
  'meribel': {
    totalSlopesCount: 78, greenCount: 9, blueCount: 29, redCount: 30, blackCount: 10,
    totalSlopeKm: 150, totalLiftsCount: 42, nordicKm: 16, hasGlacier: false, hasSnowpark: true,
    snowCannonsCoveragePct: 54, openingHours: '09h00 – 16h45',
    seasonWindow: '5 Déc – 18 Avr', seasonStartMD: [12, 5], seasonEndMD: [4, 18],
    linkedDomainName: 'Les 3 Vallées', linkedDomainKm: 600,
    liftradarCountry: 'fr', liftradarId: 'meribel', skiradarId: 'meribel'
  },
  'tignes': {
    totalSlopesCount: 82, greenCount: 8, blueCount: 35, redCount: 21, blackCount: 18,
    totalSlopeKm: 150, totalLiftsCount: 37, nordicKm: 20, hasGlacier: true, hasSnowpark: true,
    snowCannonsCoveragePct: 58, openingHours: '09h00 – 16h45',
    seasonWindow: '21 Nov – 3 Mai', seasonStartMD: [11, 21], seasonEndMD: [5, 3],
    linkedDomainName: 'Tignes – Val d’Isère', linkedDomainKm: 300,
    liftradarCountry: 'fr', liftradarId: 'tignes', skiradarId: 'tignes'
  },
  'val-d-isere': {
    totalSlopesCount: 78, greenCount: 18, blueCount: 22, redCount: 24, blackCount: 14,
    totalSlopeKm: 152, totalLiftsCount: 37, nordicKm: 24, hasGlacier: true, hasSnowpark: true,
    snowCannonsCoveragePct: 62, openingHours: '09h00 – 16h45',
    seasonWindow: '28 Nov – 3 Mai', seasonStartMD: [11, 28], seasonEndMD: [5, 3],
    linkedDomainName: 'Tignes – Val d’Isère', linkedDomainKm: 300,
    liftradarCountry: 'fr', liftradarId: 'val-d-isere', skiradarId: 'val-d-isere'
  },
  'la-plagne': {
    totalSlopesCount: 139, greenCount: 11, blueCount: 76, redCount: 33, blackCount: 19,
    totalSlopeKm: 225, totalLiftsCount: 76, nordicKm: 80, hasGlacier: true, hasSnowpark: true,
    snowCannonsCoveragePct: 50, openingHours: '09h00 – 16h45',
    seasonWindow: '12 Déc – 25 Avr', seasonStartMD: [12, 12], seasonEndMD: [4, 25],
    linkedDomainName: 'Paradiski', linkedDomainKm: 425,
    liftradarCountry: 'fr', liftradarId: 'la-plagne', skiradarId: 'la-plagne'
  },
  'les-arcs': {
    totalSlopesCount: 114, greenCount: 13, blueCount: 49, redCount: 35, blackCount: 17,
    totalSlopeKm: 200, totalLiftsCount: 52, nordicKm: 45, hasGlacier: true, hasSnowpark: true,
    snowCannonsCoveragePct: 52, openingHours: '09h00 – 16h45',
    seasonWindow: '12 Déc – 25 Avr', seasonStartMD: [12, 12], seasonEndMD: [4, 25],
    linkedDomainName: 'Paradiski', linkedDomainKm: 425,
    liftradarCountry: 'fr', liftradarId: 'les-arcs', skiradarId: 'les-arcs'
  },
  'avoriaz': {
    totalSlopesCount: 34, greenCount: 5, blueCount: 17, redCount: 8, blackCount: 4,
    totalSlopeKm: 76, totalLiftsCount: 29, nordicKm: 45, hasGlacier: false, hasSnowpark: true,
    snowCannonsCoveragePct: 45, openingHours: '09h00 – 16h45',
    seasonWindow: '12 Déc – 18 Avr', seasonStartMD: [12, 12], seasonEndMD: [4, 18],
    linkedDomainName: 'Portes du Soleil', linkedDomainKm: 600,
    liftradarCountry: 'fr', liftradarId: 'avoriaz', skiradarId: 'avoriaz'
  },
  'morzine': {
    totalSlopesCount: 76, greenCount: 12, blueCount: 31, redCount: 24, blackCount: 9,
    totalSlopeKm: 132, totalLiftsCount: 46, nordicKm: 9, hasGlacier: false, hasSnowpark: false,
    snowCannonsCoveragePct: 40, openingHours: '09h00 – 16h45',
    seasonWindow: '19 Déc – 12 Avr', seasonStartMD: [12, 19], seasonEndMD: [4, 12],
    linkedDomainName: 'Portes du Soleil', linkedDomainKm: 600,
    liftradarCountry: 'fr', liftradarId: 'morzine', skiradarId: 'morzine'
  },
  'les-gets': {
    totalSlopesCount: 75, greenCount: 11, blueCount: 30, redCount: 25, blackCount: 9,
    totalSlopeKm: 117, totalLiftsCount: 47, nordicKm: 13, hasGlacier: false, hasSnowpark: true,
    snowCannonsCoveragePct: 42, openingHours: '09h00 – 16h45',
    seasonWindow: '19 Déc – 12 Avr', seasonStartMD: [12, 19], seasonEndMD: [4, 12],
    linkedDomainName: 'Portes du Soleil', linkedDomainKm: 600,
    liftradarCountry: 'fr', liftradarId: 'les-gets', skiradarId: 'les-gets'
  },
  'la-clusaz': {
    totalSlopesCount: 54, greenCount: 10, blueCount: 20, redCount: 16, blackCount: 8,
    totalSlopeKm: 100, totalLiftsCount: 33, nordicKm: 26, hasGlacier: false, hasSnowpark: true,
    snowCannonsCoveragePct: 46, openingHours: '09h00 – 16h45',
    seasonWindow: '19 Déc – 12 Avr', seasonStartMD: [12, 19], seasonEndMD: [4, 12],
    linkedDomainName: 'La Clusaz – Manigod', linkedDomainKm: 125,
    liftradarCountry: 'fr', liftradarId: 'la-clusaz', skiradarId: 'la-clusaz'
  },
  'le-grand-bornand': {
    totalSlopesCount: 50, greenCount: 14, blueCount: 17, redCount: 14, blackCount: 5,
    totalSlopeKm: 90, totalLiftsCount: 25, nordicKm: 18, hasGlacier: false, hasSnowpark: true,
    snowCannonsCoveragePct: 45, openingHours: '09h00 – 16h45',
    seasonWindow: '19 Déc – 5 Avr', seasonStartMD: [12, 19], seasonEndMD: [4, 5],
    liftradarCountry: 'fr', liftradarId: 'le-grand-bornand', skiradarId: 'le-grand-bornand'
  },
  'flaine': {
    totalSlopesCount: 60, greenCount: 8, blueCount: 27, redCount: 19, blackCount: 6,
    totalSlopeKm: 146, totalLiftsCount: 23, nordicKm: 13, hasGlacier: false, hasSnowpark: true,
    snowCannonsCoveragePct: 44, openingHours: '09h00 – 16h45',
    seasonWindow: '12 Déc – 18 Avr', seasonStartMD: [12, 12], seasonEndMD: [4, 18],
    linkedDomainName: 'Grand Massif', linkedDomainKm: 265,
    liftradarCountry: 'fr', liftradarId: 'flaine', skiradarId: 'flaine'
  },
  'alpe-d-huez': {
    totalSlopesCount: 112, greenCount: 37, blueCount: 30, redCount: 29, blackCount: 16,
    totalSlopeKm: 143, totalLiftsCount: 68, nordicKm: 22, hasGlacier: true, hasSnowpark: true,
    snowCannonsCoveragePct: 58, openingHours: '09h00 – 17h00',
    seasonWindow: '5 Déc – 18 Avr', seasonStartMD: [12, 5], seasonEndMD: [4, 18],
    linkedDomainName: "Alpe d'Huez Grand Domaine", linkedDomainKm: 250,
    liftradarCountry: 'fr', liftradarId: 'alpe-d-huez', skiradarId: 'alpe-d-huez'
  },
  'les-2-alpes': {
    totalSlopesCount: 93, greenCount: 18, blueCount: 43, redCount: 18, blackCount: 14,
    totalSlopeKm: 220, totalLiftsCount: 43, nordicKm: 15, hasGlacier: true, hasSnowpark: true,
    snowCannonsCoveragePct: 55, openingHours: '09h00 – 17h00',
    seasonWindow: '28 Nov – 3 Mai', seasonStartMD: [11, 28], seasonEndMD: [5, 3],
    liftradarCountry: 'fr', liftradarId: 'les-2-alpes', skiradarId: 'les-deux-alpes'
  },

  // 2. FRANCE — ALPES DU SUD
  'serre-chevalier': {
    totalSlopesCount: 82, greenCount: 15, blueCount: 26, redCount: 28, blackCount: 13,
    totalSlopeKm: 250, totalLiftsCount: 59, nordicKm: 10, hasGlacier: false, hasSnowpark: true,
    snowCannonsCoveragePct: 52, openingHours: '09h00 – 16h45',
    seasonWindow: '5 Déc – 12 Avr', seasonStartMD: [12, 5], seasonEndMD: [4, 12],
    liftradarCountry: 'fr', liftradarId: 'serre-chevalier', skiradarId: 'serre-chevalier'
  },
  'montgenevre': {
    totalSlopesCount: 49, greenCount: 8, blueCount: 15, redCount: 17, blackCount: 9,
    totalSlopeKm: 95, totalLiftsCount: 22, nordicKm: 15, hasGlacier: false, hasSnowpark: true,
    snowCannonsCoveragePct: 55, openingHours: '09h00 – 16h45',
    seasonWindow: '5 Déc – 12 Avr', seasonStartMD: [12, 5], seasonEndMD: [4, 12],
    linkedDomainName: 'Voie Lactée (Via Lattea)', linkedDomainKm: 400,
    liftradarCountry: 'fr', liftradarId: 'montgenevre', skiradarId: 'montgenevre'
  },
  'vars': {
    totalSlopesCount: 66, greenCount: 10, blueCount: 29, redCount: 20, blackCount: 7,
    totalSlopeKm: 100, totalLiftsCount: 18, nordicKm: 10, hasGlacier: false, hasSnowpark: true,
    snowCannonsCoveragePct: 60, openingHours: '09h00 – 16h45',
    seasonWindow: '12 Déc – 12 Avr', seasonStartMD: [12, 12], seasonEndMD: [4, 12],
    linkedDomainName: 'La Forêt Blanche', linkedDomainKm: 185,
    liftradarCountry: 'fr', liftradarId: 'vars', skiradarId: 'vars'
  },
  'risoul': {
    totalSlopesCount: 44, greenCount: 9, blueCount: 19, redCount: 12, blackCount: 4,
    totalSlopeKm: 85, totalLiftsCount: 16, nordicKm: 8, hasGlacier: false, hasSnowpark: true,
    snowCannonsCoveragePct: 58, openingHours: '09h00 – 16h45',
    seasonWindow: '12 Déc – 12 Avr', seasonStartMD: [12, 12], seasonEndMD: [4, 12],
    linkedDomainName: 'La Forêt Blanche', linkedDomainKm: 185,
    liftradarCountry: 'fr', liftradarId: 'risoul', skiradarId: 'risoul'
  },
  'isola-2000': {
    totalSlopesCount: 45, greenCount: 8, blueCount: 21, redCount: 13, blackCount: 3,
    totalSlopeKm: 120, totalLiftsCount: 19, nordicKm: 3, hasGlacier: false, hasSnowpark: true,
    snowCannonsCoveragePct: 68, openingHours: '09h00 – 16h45',
    seasonWindow: '5 Déc – 12 Avr', seasonStartMD: [12, 5], seasonEndMD: [4, 12],
    liftradarCountry: 'fr', liftradarId: 'isola-2000', skiradarId: 'isola-2000'
  },

  // 3. FRANCE — PYRÉNÉES
  'grand-tourmalet': {
    totalSlopesCount: 58, greenCount: 11, blueCount: 21, redCount: 20, blackCount: 6,
    totalSlopeKm: 100, totalLiftsCount: 27, nordicKm: 15, hasGlacier: false, hasSnowpark: true,
    snowCannonsCoveragePct: 52, openingHours: '09h00 – 17h00',
    seasonWindow: '5 Déc – 5 Avr', seasonStartMD: [12, 5], seasonEndMD: [4, 5],
    liftradarCountry: 'fr', liftradarId: 'grand-tourmalet', skiradarId: 'grand-tourmalet'
  },
  'saint-lary': {
    totalSlopesCount: 59, greenCount: 7, blueCount: 26, redCount: 15, blackCount: 11,
    totalSlopeKm: 100, totalLiftsCount: 24, nordicKm: 12, hasGlacier: false, hasSnowpark: true,
    snowCannonsCoveragePct: 50, openingHours: '09h00 – 17h00',
    seasonWindow: '5 Déc – 5 Avr', seasonStartMD: [12, 5], seasonEndMD: [4, 5],
    liftradarCountry: 'fr', liftradarId: 'saint-lary', skiradarId: 'saint-lary-soulan'
  },
  'cauterets': {
    totalSlopesCount: 23, greenCount: 5, blueCount: 8, redCount: 7, blackCount: 3,
    totalSlopeKm: 36, totalLiftsCount: 16, nordicKm: 36, hasGlacier: false, hasSnowpark: true,
    snowCannonsCoveragePct: 45, openingHours: '09h00 – 17h00',
    seasonWindow: '5 Déc – 12 Avr', seasonStartMD: [12, 5], seasonEndMD: [4, 12],
    liftradarCountry: 'fr', liftradarId: 'cauterets', skiradarId: 'cauterets'
  },
  'peyragudes': {
    totalSlopesCount: 53, greenCount: 9, blueCount: 24, redCount: 16, blackCount: 4,
    totalSlopeKm: 60, totalLiftsCount: 18, nordicKm: 0, hasGlacier: false, hasSnowpark: true,
    snowCannonsCoveragePct: 72, openingHours: '09h00 – 17h00',
    seasonWindow: '5 Déc – 5 Avr', seasonStartMD: [12, 5], seasonEndMD: [4, 5],
    liftradarCountry: 'fr', liftradarId: 'peyragudes', skiradarId: 'peyragudes'
  },
  'font-romeu-pyrenees-2000': {
    totalSlopesCount: 47, greenCount: 16, blueCount: 12, redCount: 11, blackCount: 8,
    totalSlopeKm: 43, totalLiftsCount: 24, nordicKm: 111, hasGlacier: false, hasSnowpark: true,
    snowCannonsCoveragePct: 80, openingHours: '09h00 – 17h00',
    seasonWindow: '5 Déc – 5 Avr', seasonStartMD: [12, 5], seasonEndMD: [4, 5],
    liftradarCountry: 'fr', liftradarId: 'font-romeu-pyrenees-2000', skiradarId: 'font-romeu-pyrenees-2000'
  },
  'les-angles': {
    totalSlopesCount: 45, greenCount: 14, blueCount: 9, redCount: 14, blackCount: 8,
    totalSlopeKm: 55, totalLiftsCount: 23, nordicKm: 36, hasGlacier: false, hasSnowpark: true,
    snowCannonsCoveragePct: 75, openingHours: '09h00 – 17h00',
    seasonWindow: '5 Déc – 5 Avr', seasonStartMD: [12, 5], seasonEndMD: [4, 5],
    liftradarCountry: 'fr', liftradarId: 'les-angles', skiradarId: 'les-angles'
  },
  'ax-3-domaines': {
    totalSlopesCount: 38, greenCount: 10, blueCount: 13, redCount: 10, blackCount: 5,
    totalSlopeKm: 80, totalLiftsCount: 20, nordicKm: 18, hasGlacier: false, hasSnowpark: true,
    snowCannonsCoveragePct: 68, openingHours: '09h00 – 17h00',
    seasonWindow: '5 Déc – 5 Avr', seasonStartMD: [12, 5], seasonEndMD: [4, 5],
    liftradarCountry: 'fr', liftradarId: 'ax-3-domaines', skiradarId: 'ax-3-domaines'
  },

  // 4. FRANCE — MASSIF CENTRAL, VOSGES & JURA
  'super-besse': {
    totalSlopesCount: 34, greenCount: 6, blueCount: 13, redCount: 9, blackCount: 6,
    totalSlopeKm: 40, totalLiftsCount: 19, nordicKm: 36, hasGlacier: false, hasSnowpark: true,
    snowCannonsCoveragePct: 70, openingHours: '09h00 – 17h00',
    seasonWindow: '19 Déc – 29 Mars', seasonStartMD: [12, 19], seasonEndMD: [3, 29],
    linkedDomainName: 'Grand Sancy', linkedDomainKm: 84,
    liftradarCountry: 'fr', liftradarId: 'super-besse', skiradarId: 'super-besse'
  },
  'le-lioran': {
    totalSlopesCount: 43, greenCount: 9, blueCount: 16, redCount: 13, blackCount: 5,
    totalSlopeKm: 60, totalLiftsCount: 17, nordicKm: 45, hasGlacier: false, hasSnowpark: false,
    snowCannonsCoveragePct: 62, openingHours: '09h00 – 17h00',
    seasonWindow: '19 Déc – 29 Mars', seasonStartMD: [12, 19], seasonEndMD: [3, 29],
    liftradarCountry: 'fr', liftradarId: 'le-lioran', skiradarId: 'le-lioran'
  },
  'la-bresse-hohneck': {
    totalSlopesCount: 33, greenCount: 7, blueCount: 12, redCount: 13, blackCount: 1,
    totalSlopeKm: 21, totalLiftsCount: 15, nordicKm: 31, hasGlacier: false, hasSnowpark: true,
    snowCannonsCoveragePct: 72, openingHours: '09h00 – 17h00',
    seasonWindow: '19 Déc – 22 Mars', seasonStartMD: [12, 19], seasonEndMD: [3, 22],
    liftradarCountry: 'fr', liftradarId: 'la-bresse-hohneck', skiradarId: 'la-bresse-hohneck'
  },
  'les-rousses': {
    totalSlopesCount: 31, greenCount: 12, blueCount: 9, redCount: 7, blackCount: 3,
    totalSlopeKm: 28, totalLiftsCount: 18, nordicKm: 140, hasGlacier: false, hasSnowpark: true,
    snowCannonsCoveragePct: 50, openingHours: '09h00 – 17h00',
    seasonWindow: '19 Déc – 29 Mars', seasonStartMD: [12, 19], seasonEndMD: [3, 29],
    liftradarCountry: 'fr', liftradarId: 'les-rousses', skiradarId: 'les-rousses'
  },

  // 5. SUISSE
  'zermatt': {
    totalSlopesCount: 84, greenCount: 0, blueCount: 12, redCount: 48, blackCount: 24,
    totalSlopeKm: 200, totalLiftsCount: 36, nordicKm: 15, hasGlacier: true, hasSnowpark: true,
    snowCannonsCoveragePct: 78, openingHours: '08h30 – 16h30',
    seasonWindow: 'Toute l’année (Glacier)', seasonStartMD: [1, 1], seasonEndMD: [12, 31],
    linkedDomainName: 'Matterhorn Ski Paradise', linkedDomainKm: 360,
    liftradarCountry: 'ch', liftradarId: 'zermatt'
  },
  'verbier': {
    totalSlopesCount: 28, greenCount: 0, blueCount: 10, redCount: 7, blackCount: 11,
    totalSlopeKm: 103, totalLiftsCount: 17, nordicKm: 12, hasGlacier: true, hasSnowpark: true,
    snowCannonsCoveragePct: 48, openingHours: '08h45 – 16h30',
    seasonWindow: '14 Nov – 25 Avr', seasonStartMD: [11, 14], seasonEndMD: [4, 25],
    linkedDomainName: 'Les 4 Vallées', linkedDomainKm: 410,
    liftradarCountry: 'ch', liftradarId: 'verbier'
  },
  'saas-fee': {
    totalSlopesCount: 34, greenCount: 0, blueCount: 10, redCount: 16, blackCount: 8,
    totalSlopeKm: 100, totalLiftsCount: 23, nordicKm: 6, hasGlacier: true, hasSnowpark: true,
    snowCannonsCoveragePct: 60, openingHours: '08h30 – 16h30',
    seasonWindow: 'Juil – Fin Avr (Glacier)', seasonStartMD: [7, 15], seasonEndMD: [4, 25],
    liftradarCountry: 'ch', liftradarId: 'saas-fee'
  },
  'st-moritz-corviglia': {
    totalSlopesCount: 34, greenCount: 0, blueCount: 8, redCount: 18, blackCount: 8,
    totalSlopeKm: 164, totalLiftsCount: 23, nordicKm: 220, hasGlacier: false, hasSnowpark: true,
    snowCannonsCoveragePct: 75, openingHours: '08h30 – 16h30',
    seasonWindow: '28 Nov – 12 Avr', seasonStartMD: [11, 28], seasonEndMD: [4, 12],
    liftradarCountry: 'ch', liftradarId: 'st-moritz-corviglia'
  },
  'corvatsch': {
    totalSlopesCount: 26, greenCount: 0, blueCount: 3, redCount: 20, blackCount: 3,
    totalSlopeKm: 121, totalLiftsCount: 14, nordicKm: 180, hasGlacier: true, hasSnowpark: true,
    snowCannonsCoveragePct: 65, openingHours: '08h30 – 16h30',
    seasonWindow: '21 Nov – 3 Mai', seasonStartMD: [11, 21], seasonEndMD: [5, 3],
    liftradarCountry: 'ch', liftradarId: 'corvatsch'
  },
  'parsenn-davos': {
    totalSlopesCount: 38, greenCount: 0, blueCount: 7, redCount: 17, blackCount: 14,
    totalSlopeKm: 110, totalLiftsCount: 18, nordicKm: 100, hasGlacier: false, hasSnowpark: false,
    snowCannonsCoveragePct: 60, openingHours: '08h30 – 16h30',
    seasonWindow: '14 Nov – 18 Avr', seasonStartMD: [11, 14], seasonEndMD: [4, 18],
    linkedDomainName: 'Davos Klosters', linkedDomainKm: 300,
    liftradarCountry: 'ch', liftradarId: 'parsenn'
  },
  'laax': {
    totalSlopesCount: 144, greenCount: 0, blueCount: 81, redCount: 43, blackCount: 20,
    totalSlopeKm: 209, totalLiftsCount: 32, nordicKm: 60, hasGlacier: true, hasSnowpark: true,
    snowCannonsCoveragePct: 58, openingHours: '08h30 – 16h30',
    seasonWindow: '28 Nov – 12 Avr', seasonStartMD: [11, 28], seasonEndMD: [4, 12],
    liftradarCountry: 'ch', liftradarId: 'laax'
  },
  'grindelwald-wengen': {
    totalSlopesCount: 60, greenCount: 0, blueCount: 17, redCount: 27, blackCount: 16,
    totalSlopeKm: 103, totalLiftsCount: 21, nordicKm: 30, hasGlacier: false, hasSnowpark: true,
    snowCannonsCoveragePct: 62, openingHours: '08h30 – 16h30',
    seasonWindow: '28 Nov – 18 Avr', seasonStartMD: [11, 28], seasonEndMD: [4, 18],
    linkedDomainName: 'Jungfrau Ski Region', linkedDomainKm: 211,
    liftradarCountry: 'ch', liftradarId: 'grindelwald-wengen'
  },
  'crans-montana': {
    totalSlopesCount: 73, greenCount: 0, blueCount: 16, redCount: 36, blackCount: 21,
    totalSlopeKm: 140, totalLiftsCount: 24, nordicKm: 18, hasGlacier: true, hasSnowpark: true,
    snowCannonsCoveragePct: 55, openingHours: '08h45 – 16h30',
    seasonWindow: '28 Nov – 18 Avr', seasonStartMD: [11, 28], seasonEndMD: [4, 18],
    liftradarCountry: 'ch', liftradarId: 'crans-montana'
  },

  // 6. AUTRICHE & ALLEMAGNE
  'ski-arlberg': {
    totalSlopesCount: 203, greenCount: 0, blueCount: 77, redCount: 54, blackCount: 72,
    totalSlopeKm: 293, totalLiftsCount: 85, nordicKm: 40, hasGlacier: false, hasSnowpark: true,
    snowCannonsCoveragePct: 86, openingHours: '08h45 – 16h30',
    seasonWindow: '3 Déc – 25 Avr', seasonStartMD: [12, 3], seasonEndMD: [4, 25],
    liftradarCountry: 'at', liftradarId: 'ski-arlberg'
  },
  'ischgl-silvretta': {
    totalSlopesCount: 89, greenCount: 0, blueCount: 20, redCount: 41, blackCount: 28,
    totalSlopeKm: 239, totalLiftsCount: 46, nordicKm: 72, hasGlacier: false, hasSnowpark: true,
    snowCannonsCoveragePct: 90, openingHours: '08h30 – 16h30',
    seasonWindow: '26 Nov – 3 Mai', seasonStartMD: [11, 26], seasonEndMD: [5, 3],
    liftradarCountry: 'at', liftradarId: 'ischgl-silvretta-arena'
  },
  'soelden': {
    totalSlopesCount: 58, greenCount: 0, blueCount: 21, redCount: 15, blackCount: 22,
    totalSlopeKm: 147, totalLiftsCount: 31, nordicKm: 16, hasGlacier: true, hasSnowpark: true,
    snowCannonsCoveragePct: 82, openingHours: '08h30 – 16h30',
    seasonWindow: 'Oct – 3 Mai (Glacier)', seasonStartMD: [10, 1], seasonEndMD: [5, 3],
    liftradarCountry: 'at', liftradarId: 'soelden'
  },
  'obergurgl-hochgurgl': {
    totalSlopesCount: 50, greenCount: 0, blueCount: 24, redCount: 12, blackCount: 14,
    totalSlopeKm: 112, totalLiftsCount: 26, nordicKm: 12, hasGlacier: false, hasSnowpark: true,
    snowCannonsCoveragePct: 90, openingHours: '08h30 – 16h30',
    seasonWindow: '19 Nov – 25 Avr', seasonStartMD: [11, 19], seasonEndMD: [4, 25],
    liftradarCountry: 'at', liftradarId: 'obergurgl-hochgurgl'
  },
  'hintertux': {
    totalSlopesCount: 32, greenCount: 0, blueCount: 11, redCount: 12, blackCount: 9,
    totalSlopeKm: 64, totalLiftsCount: 21, nordicKm: 14, hasGlacier: true, hasSnowpark: true,
    snowCannonsCoveragePct: 70, openingHours: '08h15 – 16h30',
    seasonWindow: 'Toute l’année (Glacier)', seasonStartMD: [1, 1], seasonEndMD: [12, 31],
    liftradarCountry: 'at', liftradarId: 'hintertux'
  },
  'kitzsteinhorn': {
    totalSlopesCount: 33, greenCount: 0, blueCount: 12, redCount: 10, blackCount: 11,
    totalSlopeKm: 81, totalLiftsCount: 23, nordicKm: 25, hasGlacier: true, hasSnowpark: true,
    snowCannonsCoveragePct: 82, openingHours: '08h30 – 16h30',
    seasonWindow: '10 Oct – 24 Mai (Glacier)', seasonStartMD: [10, 10], seasonEndMD: [5, 24],
    liftradarCountry: 'at', liftradarId: 'kitzsteinhorn'
  },
  'kitzbuehel': {
    totalSlopesCount: 137, greenCount: 0, blueCount: 61, redCount: 43, blackCount: 33,
    totalSlopeKm: 233, totalLiftsCount: 69, nordicKm: 70, hasGlacier: false, hasSnowpark: true,
    snowCannonsCoveragePct: 85, openingHours: '08h30 – 16h30',
    seasonWindow: '14 Nov – 18 Avr', seasonStartMD: [11, 14], seasonEndMD: [4, 18],
    liftradarCountry: 'at', liftradarId: 'kitzbuehel'
  },
  'mayrhofen': {
    totalSlopesCount: 62, greenCount: 0, blueCount: 24, redCount: 27, blackCount: 11,
    totalSlopeKm: 142, totalLiftsCount: 47, nordicKm: 30, hasGlacier: false, hasSnowpark: true,
    snowCannonsCoveragePct: 92, openingHours: '08h30 – 16h30',
    seasonWindow: '5 Déc – 18 Avr', seasonStartMD: [12, 5], seasonEndMD: [4, 18],
    liftradarCountry: 'at', liftradarId: 'mayrhofen'
  },
  'saalbach-hinterglemm': {
    totalSlopesCount: 156, greenCount: 0, blueCount: 79, redCount: 49, blackCount: 28,
    totalSlopeKm: 270, totalLiftsCount: 73, nordicKm: 12, hasGlacier: false, hasSnowpark: true,
    snowCannonsCoveragePct: 90, openingHours: '08h30 – 16h30',
    seasonWindow: '28 Nov – 12 Avr', seasonStartMD: [11, 28], seasonEndMD: [4, 12],
    liftradarCountry: 'at', liftradarId: 'skicircus-saalbach'
  },
  'zugspitze': {
    totalSlopesCount: 13, greenCount: 0, blueCount: 6, redCount: 7, blackCount: 0,
    totalSlopeKm: 20, totalLiftsCount: 7, nordicKm: 0, hasGlacier: true, hasSnowpark: true,
    snowCannonsCoveragePct: 45, openingHours: '08h45 – 16h30',
    seasonWindow: '28 Nov – 3 Mai', seasonStartMD: [11, 28], seasonEndMD: [5, 3],
    liftradarCountry: 'de', liftradarId: 'zugspitze'
  },
  'garmisch-classic': {
    totalSlopesCount: 24, greenCount: 0, blueCount: 9, redCount: 9, blackCount: 6,
    totalSlopeKm: 40, totalLiftsCount: 19, nordicKm: 28, hasGlacier: false, hasSnowpark: true,
    snowCannonsCoveragePct: 75, openingHours: '08h30 – 16h30',
    seasonWindow: '12 Déc – 5 Avr', seasonStartMD: [12, 12], seasonEndMD: [4, 5],
    liftradarCountry: 'de', liftradarId: 'garmisch-classic'
  },

  // 7. ITALIE
  'cortina-d-ampezzo': {
    totalSlopesCount: 89, greenCount: 0, blueCount: 36, redCount: 40, blackCount: 13,
    totalSlopeKm: 120, totalLiftsCount: 34, nordicKm: 70, hasGlacier: false, hasSnowpark: true,
    snowCannonsCoveragePct: 95, openingHours: '08h30 – 16h45',
    seasonWindow: '28 Nov – 12 Avr', seasonStartMD: [11, 28], seasonEndMD: [4, 12],
    liftradarCountry: 'it', liftradarId: 'cortina-d-ampezzo'
  },
  'val-gardena': {
    totalSlopesCount: 124, greenCount: 0, blueCount: 50, redCount: 61, blackCount: 13,
    totalSlopeKm: 130, totalLiftsCount: 52, nordicKm: 115, hasGlacier: false, hasSnowpark: true,
    snowCannonsCoveragePct: 98, openingHours: '08h30 – 16h45',
    seasonWindow: '5 Déc – 12 Avr', seasonStartMD: [12, 5], seasonEndMD: [4, 12],
    linkedDomainName: 'Sella Ronda / Dolomiti Superski', linkedDomainKm: 500,
    liftradarCountry: 'it', liftradarId: 'val-gardena'
  },
  'breuil-cervinia': {
    totalSlopesCount: 69, greenCount: 0, blueCount: 19, redCount: 41, blackCount: 9,
    totalSlopeKm: 157, totalLiftsCount: 23, nordicKm: 10, hasGlacier: true, hasSnowpark: true,
    snowCannonsCoveragePct: 78, openingHours: '08h30 – 16h45',
    seasonWindow: '25 Oct – 3 Mai', seasonStartMD: [10, 25], seasonEndMD: [5, 3],
    linkedDomainName: 'Matterhorn Ski Paradise', linkedDomainKm: 360,
    liftradarCountry: 'it', liftradarId: 'breuil-cervinia'
  },
  'courmayeur': {
    totalSlopesCount: 45, greenCount: 0, blueCount: 13, redCount: 26, blackCount: 6,
    totalSlopeKm: 43, totalLiftsCount: 18, nordicKm: 20, hasGlacier: false, hasSnowpark: true,
    snowCannonsCoveragePct: 80, openingHours: '08h45 – 16h45',
    seasonWindow: '28 Nov – 12 Avr', seasonStartMD: [11, 28], seasonEndMD: [4, 12],
    liftradarCountry: 'it', liftradarId: 'courmayeur'
  },
  'livigno': {
    totalSlopesCount: 78, greenCount: 0, blueCount: 29, redCount: 37, blackCount: 12,
    totalSlopeKm: 115, totalLiftsCount: 32, nordicKm: 30, hasGlacier: false, hasSnowpark: true,
    snowCannonsCoveragePct: 82, openingHours: '08h30 – 16h45',
    seasonWindow: '28 Nov – 3 Mai', seasonStartMD: [11, 28], seasonEndMD: [5, 3],
    liftradarCountry: 'it', liftradarId: 'livigno'
  },

  // 8. ANDORRE & ESPAGNE
  'grandvalira': {
    totalSlopesCount: 142, greenCount: 24, blueCount: 52, redCount: 46, blackCount: 20,
    totalSlopeKm: 215, totalLiftsCount: 73, nordicKm: 15, hasGlacier: false, hasSnowpark: true,
    snowCannonsCoveragePct: 68, openingHours: '09h00 – 17h00',
    seasonWindow: '5 Déc – 12 Avr', seasonStartMD: [12, 5], seasonEndMD: [4, 12],
    liftradarCountry: 'ad', liftradarId: 'grandvalira'
  },
  'baqueira-beret': {
    totalSlopesCount: 131, greenCount: 6, blueCount: 45, redCount: 53, blackCount: 27,
    totalSlopeKm: 175, totalLiftsCount: 36, nordicKm: 7, hasGlacier: false, hasSnowpark: true,
    snowCannonsCoveragePct: 62, openingHours: '09h00 – 16h45',
    seasonWindow: '28 Nov – 12 Avr', seasonStartMD: [11, 28], seasonEndMD: [4, 12],
    liftradarCountry: 'es', liftradarId: 'baqueira-beret'
  },
  'sierra-nevada': {
    totalSlopesCount: 131, greenCount: 19, blueCount: 45, redCount: 53, blackCount: 14,
    totalSlopeKm: 112, totalLiftsCount: 24, nordicKm: 5, hasGlacier: false, hasSnowpark: true,
    snowCannonsCoveragePct: 82, openingHours: '09h00 – 16h45',
    seasonWindow: '28 Nov – 25 Avr', seasonStartMD: [11, 28], seasonEndMD: [4, 25],
    liftradarCountry: 'es', liftradarId: 'sierra-nevada'
  },

  // 9. SCANDINAVIE & EUROPE DE L'EST
  'levi': {
    totalSlopesCount: 45, greenCount: 4, blueCount: 17, redCount: 20, blackCount: 4,
    totalSlopeKm: 44, totalLiftsCount: 28, nordicKm: 230, hasGlacier: false, hasSnowpark: true,
    snowCannonsCoveragePct: 75, openingHours: '09h30 – 19h00',
    seasonWindow: '10 Oct – 10 Mai', seasonStartMD: [10, 10], seasonEndMD: [5, 10],
    liftradarCountry: 'fi', liftradarId: 'levi'
  },
  'ruka': {
    totalSlopesCount: 41, greenCount: 5, blueCount: 15, redCount: 13, blackCount: 8,
    totalSlopeKm: 20, totalLiftsCount: 22, nordicKm: 240, hasGlacier: false, hasSnowpark: true,
    snowCannonsCoveragePct: 82, openingHours: '09h30 – 19h00',
    seasonWindow: '10 Oct – 10 Mai', seasonStartMD: [10, 10], seasonEndMD: [5, 10],
    liftradarCountry: 'fi', liftradarId: 'ruka'
  },
  'trysil': {
    totalSlopesCount: 70, greenCount: 21, blueCount: 23, redCount: 13, blackCount: 13,
    totalSlopeKm: 78, totalLiftsCount: 40, nordicKm: 100, hasGlacier: false, hasSnowpark: true,
    snowCannonsCoveragePct: 75, openingHours: '09h00 – 15h30',
    seasonWindow: '28 Nov – 25 Avr', seasonStartMD: [11, 28], seasonEndMD: [4, 25],
    liftradarCountry: 'no', liftradarId: 'trysil'
  },
  'are-sweden': {
    totalSlopesCount: 89, greenCount: 12, blueCount: 39, redCount: 33, blackCount: 5,
    totalSlopeKm: 91, totalLiftsCount: 41, nordicKm: 60, hasGlacier: false, hasSnowpark: true,
    snowCannonsCoveragePct: 70, openingHours: '09h00 – 15h30',
    seasonWindow: '5 Déc – 3 Mai', seasonStartMD: [12, 5], seasonEndMD: [5, 3]
  },
  'jasna': {
    totalSlopesCount: 40, greenCount: 0, blueCount: 20, redCount: 14, blackCount: 6,
    totalSlopeKm: 51, totalLiftsCount: 20, nordicKm: 12, hasGlacier: false, hasSnowpark: true,
    snowCannonsCoveragePct: 84, openingHours: '08h30 – 16h00',
    seasonWindow: '5 Déc – 18 Avr', seasonStartMD: [12, 5], seasonEndMD: [4, 18],
    liftradarCountry: 'sk', liftradarId: 'jasna'
  },
  'bansko': {
    totalSlopesCount: 17, greenCount: 1, blueCount: 6, redCount: 8, blackCount: 2,
    totalSlopeKm: 75, totalLiftsCount: 14, nordicKm: 12, hasGlacier: false, hasSnowpark: true,
    snowCannonsCoveragePct: 90, openingHours: '08h30 – 16h30',
    seasonWindow: '12 Déc – 12 Avr', seasonStartMD: [12, 12], seasonEndMD: [4, 12]
  },

  // 10. MONDE (AMÉRIQUES, JAPON & OCÉANIE)
  'whistler-blackcomb': {
    totalSlopesCount: 200, greenCount: 38, blueCount: 108, redCount: 34, blackCount: 20,
    totalSlopeKm: 320, totalLiftsCount: 37, nordicKm: 90, hasGlacier: true, hasSnowpark: true,
    snowCannonsCoveragePct: 28, openingHours: '08h30 – 15h30',
    seasonWindow: '22 Nov – 20 Mai', seasonStartMD: [11, 22], seasonEndMD: [5, 20]
  },
  'banff-lake-louise': {
    totalSlopesCount: 137, greenCount: 27, blueCount: 69, redCount: 28, blackCount: 13,
    totalSlopeKm: 110, totalLiftsCount: 12, nordicKm: 75, hasGlacier: false, hasSnowpark: true,
    snowCannonsCoveragePct: 35, openingHours: '09h00 – 16h00',
    seasonWindow: '8 Nov – 18 Mai', seasonStartMD: [11, 8], seasonEndMD: [5, 18]
  },
  'aspen-snowmass': {
    totalSlopesCount: 98, greenCount: 6, blueCount: 46, redCount: 28, blackCount: 18,
    totalSlopeKm: 150, totalLiftsCount: 21, nordicKm: 90, hasGlacier: false, hasSnowpark: true,
    snowCannonsCoveragePct: 35, openingHours: '09h00 – 16h00',
    seasonWindow: '27 Nov – 19 Avr', seasonStartMD: [11, 27], seasonEndMD: [4, 19]
  },
  'vail-mountain': {
    totalSlopesCount: 278, greenCount: 52, blueCount: 97, redCount: 82, blackCount: 47,
    totalSlopeKm: 310, totalLiftsCount: 32, nordicKm: 50, hasGlacier: false, hasSnowpark: true,
    snowCannonsCoveragePct: 34, openingHours: '08h30 – 15h30',
    seasonWindow: '14 Nov – 20 Avr', seasonStartMD: [11, 14], seasonEndMD: [4, 20]
  },
  'jackson-hole': {
    totalSlopesCount: 133, greenCount: 13, blueCount: 53, redCount: 38, blackCount: 29,
    totalSlopeKm: 116, totalLiftsCount: 13, nordicKm: 30, hasGlacier: false, hasSnowpark: true,
    snowCannonsCoveragePct: 25, openingHours: '09h00 – 16h00',
    seasonWindow: '28 Nov – 12 Avr', seasonStartMD: [11, 28], seasonEndMD: [4, 12]
  },
  'niseko-united': {
    totalSlopesCount: 72, greenCount: 21, blueCount: 28, redCount: 15, blackCount: 8,
    totalSlopeKm: 47, totalLiftsCount: 30, nordicKm: 25, hasGlacier: false, hasSnowpark: true,
    snowCannonsCoveragePct: 12, openingHours: '08h30 – 19h00 (Nocturne)',
    seasonWindow: '30 Nov – 5 Mai', seasonStartMD: [11, 30], seasonEndMD: [5, 5]
  },
  'hakuba-valley': {
    totalSlopesCount: 16, greenCount: 5, blueCount: 4, redCount: 4, blackCount: 3,
    totalSlopeKm: 23, totalLiftsCount: 22, nordicKm: 40, hasGlacier: false, hasSnowpark: true,
    snowCannonsCoveragePct: 20, openingHours: '08h00 – 16h30',
    seasonWindow: '1 Déc – 5 Mai', seasonStartMD: [12, 1], seasonEndMD: [5, 5],
    linkedDomainName: 'Hakuba Valley', linkedDomainKm: 137
  },
  'cerro-catedral-bariloche': {
    totalSlopesCount: 60, greenCount: 12, blueCount: 26, redCount: 15, blackCount: 7,
    totalSlopeKm: 120, totalLiftsCount: 34, nordicKm: 18, hasGlacier: false, hasSnowpark: true,
    snowCannonsCoveragePct: 35, openingHours: '09h00 – 17h00',
    seasonWindow: '15 Juin – 15 Oct (Austral)', seasonStartMD: [6, 15], seasonEndMD: [10, 15]
  },
  'coronet-peak-queenstown': {
    totalSlopesCount: 28, greenCount: 7, blueCount: 11, redCount: 7, blackCount: 3,
    totalSlopeKm: 44, totalLiftsCount: 8, nordicKm: 10, hasGlacier: false, hasSnowpark: true,
    snowCannonsCoveragePct: 80, openingHours: '09h00 – 16h00',
    seasonWindow: '15 Juin – 10 Oct (Austral)', seasonStartMD: [6, 15], seasonEndMD: [10, 10]
  }
};

export function getSkiDomainCatalogSpecs(id: string, altitudeBase = 1200, altitudePeak = 2400): SkiDomainCatalogSpecs {
  return SKI_DOMAIN_SPECS_BY_ID[id] || inferSpecsForCustomResort(altitudeBase, altitudePeak);
}

function inferSpecsForCustomResort(altitudeBase: number, altitudePeak: number): SkiDomainCatalogSpecs {
  const drop = Math.max(200, altitudePeak - altitudeBase);
  const scale = Math.min(1.4, Math.max(0.35, drop / 1100));
  const totalSlopesCount = Math.round(48 * scale);
  const greenCount = Math.max(4, Math.round(totalSlopesCount * 0.18));
  const blueCount = Math.max(8, Math.round(totalSlopesCount * 0.4));
  const redCount = Math.max(6, Math.round(totalSlopesCount * 0.3));
  const blackCount = Math.max(2, totalSlopesCount - greenCount - blueCount - redCount);
  const totalSlopeKm = Math.round(72 * scale);
  const totalLiftsCount = Math.max(6, Math.round(22 * scale));
  return {
    totalSlopesCount,
    greenCount,
    blueCount,
    redCount,
    blackCount,
    totalSlopeKm,
    totalLiftsCount,
    nordicKm: Math.round(25 * scale),
    hasGlacier: altitudePeak >= 3150,
    hasSnowpark: drop >= 450,
    snowCannonsCoveragePct: altitudePeak >= 2200 ? 55 : 42,
    openingHours: '09h00 – 16h45',
    seasonWindow: altitudePeak >= 2800 ? '5 Déc – 18 Avr' : '15 Déc – 29 Mars',
    seasonStartMD: altitudePeak >= 2800 ? [12, 5] : [12, 15],
    seasonEndMD: altitudePeak >= 2800 ? [4, 18] : [3, 29]
  };
}

function isWithinSeasonWindow(date: Date, startMD: [number, number], endMD: [number, number]): boolean {
  const m = date.getMonth() + 1; // 1..12
  const d = date.getDate(); // 1..31
  const current = m * 100 + d;
  const start = startMD[0] * 100 + startMD[1];
  const end = endMD[0] * 100 + endMD[1];

  if (start === 101 && end === 1231) return true;
  if (start <= end) {
    return current >= start && current <= end;
  }
  // Saison hivernale à cheval sur le 31 décembre (ex: 2111 .. 503)
  return current >= start || current <= end;
}

function formatTelemetryTime(iso?: string | null): string | undefined {
  if (!iso) return undefined;
  const dt = new Date(iso);
  if (isNaN(dt.getTime())) return undefined;
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }).format(dt);
}

export interface ComputeLiveSkiDomainInput {
  id: string;
  altitudeBase: number;
  altitudePeak: number;
  latitude: number;
  snowDepthBottomCm: number;
  nivoseSnowDepthCm?: number;
  snowDepthTopCm: number;
  freshSnow24hCm: number;
  baseTempC?: number;
  nivoseTempC?: number;
  peakTempC?: number;
  rainSnowLimitM: number;
  isoZeroAltitudeM: number;
  ridgeWindSpeedKmh: number;
  ridgeWindGustKmh: number;
  beraRiskLevel: 1 | 2 | 3 | 4 | 5;
  criticalSlopes: AspectDir[];
  criticalAltitudeThreshold: number;
  snowQuality: string;
  liveTelemetry?: LiveSkiResortTelemetry | null;
}

/**
 * Calcule les opérations temps réel d'un domaine skiable en privilégiant STRICTEMENT
 * les bulletins officiels LiftRadar (pistes ouvertes, remontées actives, km, BERA)
 * puis les calendriers d'ouverture réels + physique nivologique pour les stations hors flux Europe.
 */
export function computeLiveSkiDomainOperations(input: ComputeLiveSkiDomainInput): SkiDomainLiveOperations {
  const specs = getSkiDomainCatalogSpecs(input.id, input.altitudeBase, input.altitudePeak);
  const nivoseCm = input.nivoseSnowDepthCm ?? Math.round((input.snowDepthBottomCm + input.snowDepthTopCm) / 2);
  const now = new Date();
  const inSeason = isWithinSeasonWindow(now, specs.seasonStartMD, specs.seasonEndMD);

  const nowMonth = now.getMonth();
  const isNorth = input.latitude >= 0;
  const effMonth = isNorth ? nowMonth : (nowMonth + 6) % 12;
  const isCoreWinter = effMonth === 11 || effMonth <= 2; // Déc..Mars
  const isShoulderSeason = effMonth === 10 || effMonth === 3; // Nov ou Avr

  const baseTemp = input.baseTempC ?? 4;
  const peakTemp = input.peakTempC ?? -2;
  const live = input.liveTelemetry;

  // Totaux de référence fiabilisés (si LiftRadar fournit un total à jour, on l'harmonise sur totalSlopesCount/totalLiftsCount)
  const totalSlopesCount = (live?.slopesTotal && live.slopesTotal > 0) ? live.slopesTotal : specs.totalSlopesCount;
  const totalKm = (live?.totalKm && live.totalKm > 0) ? Math.round(live.totalKm) : specs.totalSlopeKm;
  const totalLiftsCount = (live?.liftsTotal && live.liftsTotal > 0) ? live.liftsTotal : specs.totalLiftsCount;

  let totalGreen = specs.greenCount;
  let totalBlue = specs.blueCount;
  let totalRed = specs.redCount;
  let totalBlack = specs.blackCount;

  // S'assurer que totalGreen + totalBlue + totalRed + totalBlack === totalSlopesCount
  const specSum = totalGreen + totalBlue + totalRed + totalBlack;
  if (specSum !== totalSlopesCount && specSum > 0) {
    const delta = totalSlopesCount - specSum;
    totalBlue = Math.max(0, totalBlue + delta);
  }

  let openSlopesCount = 0;
  let openGreen = 0;
  let openBlue = 0;
  let openRed = 0;
  let openBlack = 0;
  let openKm = 0;
  let isOpenKmEstimated = false;
  let openLiftsCount = 0;
  let telemetrySource: SkiDomainLiveOperations['telemetrySource'] = 'CALENDAR_AND_SNOW_ESTIMATE';
  let telemetryBadgeLabel = inSeason
    ? 'Calendrier Officiel & Estimation Nivologique'
    : 'Calendrier Officiel Station (Hors Ouverture)';
  const telemetryTimestamp = formatTelemetryTime(live?.fetchedAt || live?.checkedAt);

  if (live && live.status === 'open') {
    // CAS 1 : Bulletin officiel temps réel -> STATION OUVERTE
    telemetrySource = 'LIVE_OFFICIAL';
    telemetryBadgeLabel = 'Bulletin Officiel Temps Réel (Station / LiftRadar)';

    openLiftsCount = live.liftsOpen !== null && live.liftsOpen !== undefined
      ? Math.max(0, Math.min(totalLiftsCount, live.liftsOpen))
      : Math.max(1, Math.round(totalLiftsCount * 0.2));

    if (live.slopesOpen !== null && live.slopesOpen !== undefined) {
      openSlopesCount = Math.max(0, Math.min(totalSlopesCount, live.slopesOpen));
    } else if (openLiftsCount > 0 && totalLiftsCount > 0) {
      openSlopesCount = Math.max(1, Math.round(totalSlopesCount * (openLiftsCount / totalLiftsCount)));
    }

    const diff = live.slopesByDifficulty;
    if (diff && openSlopesCount > 0 && (diff.easy || diff.intermediate || diff.difficult)) {
      const easyOpen = Math.max(0, diff.easy?.open ?? 0);
      const interOpen = Math.max(0, diff.intermediate?.open ?? 0);
      const hardOpen = Math.max(0, (diff.difficult?.open ?? 0) + (diff.ski_route?.open ?? 0));

      const easyTotalCat = Math.max(1, totalGreen + totalBlue);
      if (totalGreen > 0 && easyOpen > 0) {
        // Quand seul le haut domaine/glacier est ouvert, une moindre proportion de vertes est ouverte
        const lowGate = (live.snowValleyCm ?? input.snowDepthBottomCm) >= 15 ? 1 : 0.45;
        openGreen = Math.min(totalGreen, Math.round(easyOpen * (totalGreen / easyTotalCat) * lowGate));
      }
      openBlue = Math.min(totalBlue, Math.max(0, easyOpen - openGreen));
      openRed = Math.min(totalRed, interOpen);
      openBlack = Math.min(totalBlack, hardOpen);

      // Si easyOpen dépassait totalBlue après cap, reporter sur vertes
      const leftEasy = easyOpen - (openGreen + openBlue);
      if (leftEasy > 0 && totalGreen > openGreen) {
        openGreen = Math.min(totalGreen, openGreen + leftEasy);
      }

      // Réconcilier somme exacte = openSlopesCount
      let sumColors = openGreen + openBlue + openRed + openBlack;
      if (sumColors < openSlopesCount) {
        let missing = openSlopesCount - sumColors;
        const addBlue = Math.min(totalBlue - openBlue, missing);
        openBlue += addBlue; missing -= addBlue;
        if (missing > 0) {
          const addRed = Math.min(totalRed - openRed, missing);
          openRed += addRed; missing -= addRed;
        }
        if (missing > 0) {
          const addGreen = Math.min(totalGreen - openGreen, missing);
          openGreen += addGreen; missing -= addGreen;
        }
        if (missing > 0) {
          openBlack = Math.min(totalBlack, openBlack + missing);
        }
      } else if (sumColors > openSlopesCount) {
        let excess = sumColors - openSlopesCount;
        const subBlack = Math.min(openBlack, excess); openBlack -= subBlack; excess -= subBlack;
        const subRed = Math.min(openRed, excess); openRed -= subRed; excess -= subRed;
        const subBlue = Math.min(openBlue, excess); openBlue -= subBlue; excess -= subBlue;
        openGreen = Math.max(0, openGreen - excess);
      }
    } else if (openSlopesCount > 0) {
      // Pas de détail difficulté dans le flux -> répartition proportionnelle réaliste
      const ratio = openSlopesCount / Math.max(1, totalSlopesCount);
      openBlue = Math.min(totalBlue, Math.round(totalBlue * Math.min(1, ratio * 1.15)));
      openRed = Math.min(totalRed, Math.round(totalRed * ratio));
      openGreen = Math.min(totalGreen, Math.round(totalGreen * ratio * ((live.snowValleyCm ?? input.snowDepthBottomCm) >= 15 ? 1 : 0.4)));
      openBlack = Math.max(0, Math.min(totalBlack, openSlopesCount - (openGreen + openBlue + openRed)));
      const diffRem = openSlopesCount - (openGreen + openBlue + openRed + openBlack);
      if (diffRem !== 0) {
        openBlue = Math.max(0, Math.min(totalBlue, openBlue + diffRem));
      }
    }

    if (live.openKm !== null && live.openKm !== undefined && live.openKm >= 0) {
      openKm = Math.round(live.openKm);
      isOpenKmEstimated = false;
    } else if (openSlopesCount > 0) {
      openKm = Math.max(1, Math.min(totalKm, Math.round(totalKm * (openSlopesCount / Math.max(1, totalSlopesCount)))));
      isOpenKmEstimated = true;
    }
  } else if (
    live &&
    (live.status === 'closed' || (live.status === 'no_report' && (live.liftsOpen ?? 0) === 0 && (live.slopesOpen ?? 0) === 0))
  ) {
    // CAS 2 : Bulletin officiel indique FERMÉ ou aucune remontée en service (pré-saison / hors ouverture)
    telemetrySource = live.status === 'closed' ? 'LIVE_OFFICIAL' : 'CALENDAR_AND_SNOW_ESTIMATE';
    telemetryBadgeLabel = live.status === 'closed'
      ? 'Bulletin Officiel Temps Réel : Domaine Fermé'
      : 'Statut Station : Fermé / Pré-saison (0 remontée active)';
    openSlopesCount = 0;
    openGreen = 0;
    openBlue = 0;
    openRed = 0;
    openBlack = 0;
    openKm = 0;
    openLiftsCount = 0;
  } else {
    // CAS 3 : Stations hors flux LiftRadar (US, Canada, Japon, Suède, Bulgarie, Hémisphère Sud, localités libres)
    // Strictement borné au calendrier d'ouverture officiel du domaine !
    if (!inSeason) {
      openSlopesCount = 0;
      openGreen = 0;
      openBlue = 0;
      openRed = 0;
      openBlack = 0;
      openKm = 0;
      openLiftsCount = 0;
    } else {
      let snowCoverageRatio = 0;
      if (input.snowDepthBottomCm >= 35 && input.snowDepthTopCm >= 85) {
        snowCoverageRatio = 0.90;
      } else if (input.snowDepthBottomCm >= 15 && input.snowDepthTopCm >= 55) {
        snowCoverageRatio = 0.72;
      } else if (nivoseCm >= 65 && input.snowDepthTopCm >= 80) {
        snowCoverageRatio = input.snowDepthBottomCm > 0 ? 0.56 : 0.38;
      } else if (nivoseCm >= 35 || input.snowDepthTopCm >= 55) {
        snowCoverageRatio = input.snowDepthBottomCm > 0 ? 0.42 : 0.25;
      } else if (input.snowDepthTopCm >= 25 && (specs.hasGlacier || specs.snowCannonsCoveragePct >= 60)) {
        snowCoverageRatio = 0.16;
      }

      const windClosureFactor =
        input.ridgeWindGustKmh >= 95 ? 0.35 :
        input.ridgeWindGustKmh >= 80 ? 0.62 :
        input.ridgeWindGustKmh >= 65 ? 0.85 : 1.0;

      const effectiveOpenRatio = Math.min(0.96, Math.max(0, snowCoverageRatio * windClosureFactor));
      openSlopesCount = effectiveOpenRatio > 0.03
        ? Math.max(1, Math.min(totalSlopesCount, Math.round(totalSlopesCount * effectiveOpenRatio)))
        : 0;

      if (openSlopesCount > 0) {
        const lowRatio = input.snowDepthBottomCm >= 15 ? effectiveOpenRatio : effectiveOpenRatio * 0.35;
        openGreen = totalGreen > 0 ? Math.min(totalGreen, Math.round(totalGreen * lowRatio)) : 0;
        openBlue = Math.min(totalBlue, Math.round(totalBlue * Math.min(1, effectiveOpenRatio * 1.1)));
        openRed = Math.min(totalRed, Math.round(totalRed * effectiveOpenRatio));
        openBlack = Math.max(0, Math.min(totalBlack, openSlopesCount - (openGreen + openBlue + openRed)));

        let sum = openGreen + openBlue + openRed + openBlack;
        if (sum < openSlopesCount) {
          openRed = Math.min(totalRed, openRed + (openSlopesCount - sum));
          sum = openGreen + openBlue + openRed + openBlack;
          if (sum < openSlopesCount) {
            openBlue = Math.min(totalBlue, openBlue + (openSlopesCount - sum));
          }
        } else if (sum > openSlopesCount) {
          let rem = sum - openSlopesCount;
          const tb = Math.min(openBlack, rem); openBlack -= tb; rem -= tb;
          const tr = Math.min(openRed, rem); openRed -= tr; rem -= tr;
          openBlue = Math.max(0, openBlue - rem);
        }

        openKm = Math.max(1, Math.min(totalKm, Math.round(totalKm * (openSlopesCount / Math.max(1, totalSlopesCount)))));
        isOpenKmEstimated = true;
        openLiftsCount = Math.max(1, Math.min(totalLiftsCount, Math.round(totalLiftsCount * Math.min(1, effectiveOpenRatio * 1.05))));
      }
    }
  }

  const openSlopesPct = totalSlopesCount > 0 ? Math.round((openSlopesCount / totalSlopesCount) * 100) : 0;

  let domainStatus: SkiDomainLiveOperations['domainStatus'] = inSeason ? 'FERMÉ / PRÉ-SAISON' : 'FERMÉ / PRÉ-SAISON';
  let domainStatusLabel = inSeason
    ? `Domaine Fermé (Saison ${specs.seasonWindow})`
    : `Fermé — Pré-saison (${specs.seasonWindow})`;
  let domainStatusColorClass = 'bg-slate-800 border-slate-700 text-slate-300';

  if (!inSeason && openSlopesCount === 0 && !isCoreWinter && !isShoulderSeason) {
    domainStatus = 'HORS SAISON';
    domainStatusLabel = `Hors Saison (Exploitation : ${specs.seasonWindow})`;
  }

  if (openSlopesPct >= 65) {
    domainStatus = 'OUVERT';
    domainStatusLabel = `Domaine Ouvert (${openSlopesPct}% des pistes)`;
    domainStatusColorClass = 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300';
  } else if (openSlopesPct >= 25) {
    domainStatus = 'OUVERTURE PARTIELLE';
    domainStatusLabel = `Ouverture Partielle (${openSlopesCount}/${totalSlopesCount} pistes)`;
    domainStatusColorClass = 'bg-sky-500/20 border-sky-400/50 text-sky-300';
  } else if (openSlopesCount > 0) {
    domainStatus = 'HAUTS SECTEURS / GLACIER';
    domainStatusLabel = specs.hasGlacier
      ? `Glacier & Hauts Secteurs Ouverts (${openSlopesCount} pistes)`
      : `Ouverture Anticipée / Partielle (${openSlopesCount} pistes)`;
    domainStatusColorClass = 'bg-amber-500/20 border-amber-400/50 text-amber-300';
  }

  const liftsStatusNote =
    openLiftsCount === 0
      ? `Remontées à l’arrêt (${specs.seasonWindow})`
      : input.ridgeWindGustKmh >= 85
      ? `Téléphériques et crêtes exposés au vent (rafales ${input.ridgeWindGustKmh} km/h)`
      : input.ridgeWindGustKmh >= 65
      ? `Vent soutenu en altitude (${input.ridgeWindGustKmh} km/h) : vigilance sommets`
      : 'Exploitation fluide sur les remontées ouvertes';

  const interResortLinksStatus: SkiDomainLiveOperations['interResortLinksStatus'] =
    openSlopesCount === 0
      ? 'Hors exploitation'
      : input.ridgeWindGustKmh >= 80
      ? 'Liaisons fermées'
      : openSlopesPct >= 55 && input.ridgeWindGustKmh < 65
      ? 'Liaisons ouvertes'
      : 'Liaisons partielles (vent/neige)';

  const nordicOpenKm =
    openSlopesCount > 0 && (input.snowDepthBottomCm >= 20 || (live?.snowValleyCm ?? 0) >= 20)
      ? Math.round(specs.nordicKm * Math.min(1, Math.max(0.2, Math.max(input.snowDepthBottomCm, live?.snowValleyCm ?? 0) / 45)))
      : 0;

  const snowparkStatus: SkiDomainLiveOperations['snowparkStatus'] = !specs.hasSnowpark
    ? 'Non équipé'
    : openSlopesPct >= 60
    ? 'Ouvert'
    : openSlopesCount >= 10 && nivoseCm >= 55
    ? 'Ouverture partielle'
    : 'Fermé';

  const tobogganStatus: SkiDomainLiveOperations['tobogganStatus'] =
    openSlopesCount > 0 && (input.snowDepthBottomCm >= 12 || (live?.snowValleyCm ?? 0) >= 12 || baseTemp <= 1) ? 'Ouvert' : 'Fermé';

  const snowmakingActive = (baseTemp <= -1.5 || (input.nivoseTempC ?? peakTemp) <= -3.5) && (isCoreWinter || isShoulderSeason);
  const snowmakingPotentialLabel = snowmakingActive
    ? `Production active possible (${baseTemp}°C base / ${peakTemp}°C sommet)`
    : baseTemp > 1.5
    ? `Arrêt canons en pied (${baseTemp}°C) • production possible en altitude`
    : 'Fenêtre thermique limite pour enneigement artificiel';

  const groomingQuality =
    openSlopesCount === 0
      ? 'Domaine non damé pour le ski (fermé)'
      : input.freshSnow24hCm >= 15
      ? 'Neige fraîche abondante — damage en cours de stabilisation'
      : peakTemp <= -3
      ? 'Pistes damées fermes — excellente accroche'
      : baseTemp > 2
      ? 'Neige damée souple l’après-midi en bas, froide au sommet'
      : 'Manteau damé compact et régulier';

  const visibilityStatus =
    input.ridgeWindGustKmh >= 75 && input.freshSnow24hCm >= 5
      ? 'Réduite en crête (chasse-neige & brouillard givrant)'
      : input.freshSnow24hCm >= 8
      ? 'Variable — jour blanc possible au-dessus de 2200 m'
      : 'Bonne visibilité générale sur le domaine';

  let roadAlertLevel: SkiDomainLiveOperations['roadAlertLevel'] = 'NORMAL';
  let roadAccessStatus = 'Chaussées dégagées jusqu’à la station.';
  if (input.rainSnowLimitM <= input.altitudeBase + 200 || input.snowDepthBottomCm > 2 || baseTemp <= 1.0) {
    roadAlertLevel = 'ÉQUIPEMENTS_OBLIGATOIRES';
    roadAccessStatus = `Équipements hiver obligatoires (Loi Montagne : 4 pneus 3PMSF ou chaînes). Risque neige/verglas dès ${Math.max(400, input.rainSnowLimitM)} m.`;
  } else if (isCoreWinter || isShoulderSeason) {
    roadAlertLevel = 'ATTENTION';
    roadAccessStatus = 'Pneus hiver / chaînes obligatoires en zone montagne (Loi Montagne 1er Nov – 31 Mars). Verglas possible la nuit.';
  }

  const recommendedSkierLevel =
    openSlopesCount === 0
      ? `Domaine fermé (${specs.seasonWindow})`
      : openGreen === 0
      ? 'Skieurs intermédiaires & confirmés (pistes d’altitude ouvertes)'
      : input.ridgeWindGustKmh >= 75
      ? 'Prudence — Secteurs abrités conseillés (vent fort en crête)'
      : 'Tous niveaux (débutants à experts)';

  // Analyse Avalanche BERA approfondie (incluant BERA officiel LiftRadar/SLF/Météo-France quand fourni)
  const effectiveBeraLevel = (
    live?.avalancheDangerLevel && live.avalancheDangerLevel >= 1 && live.avalancheDangerLevel <= 5
      ? live.avalancheDangerLevel
      : input.beraRiskLevel
  ) as 1 | 2 | 3 | 4 | 5;

  const dominantMechanisms: string[] = [];
  if (Math.max(input.snowDepthTopCm, live?.snowMountainCm ?? 0) < 15) {
    dominantMechanisms.push('Manteau très mince / discontinu : risque d’avalanche quasi nul hors couloirs haute altitude.');
  } else {
    if (input.ridgeWindGustKmh >= 50 || input.freshSnow24hCm >= 8 || effectiveBeraLevel >= 3) {
      dominantMechanisms.push(`Plaques à vent formées en altitude en versants ${input.criticalSlopes.join(', ')} au-dessus de ${input.criticalAltitudeThreshold} m.`);
    }
    if (peakTemp > 0 || baseTemp > 3.5) {
      dominantMechanisms.push('Humidification diurne en pentes raides ensoleillées l’après-midi.');
    }
    if (Math.max(input.snowDepthTopCm, live?.snowMountainCm ?? 0) >= 65 && peakTemp <= -3) {
      dominantMechanisms.push('Sous-couche froide fragile en versants ombragés (ubacs > 2300 m).');
    }
    if (dominantMechanisms.length === 0) {
      dominantMechanisms.push('Manteau globalement consolidé par le regel nocturne.');
    }
  }

  const beraShortLabels: Record<number, string> = {
    1: '1/5 — Faible',
    2: '2/5 — Limité',
    3: '3/5 — Marqué',
    4: '4/5 — Fort',
    5: '5/5 — Très Fort'
  };

  const spontaneousActivity =
    effectiveBeraLevel >= 4
      ? 'Forte : départs spontanés d’avalanches moyennes à grandes possibles'
      : effectiveBeraLevel === 3
      ? 'Modérée : purges naturelles possibles dans les pentes raides'
      : effectiveBeraLevel === 2
      ? 'Faible : rares coulées superficielles au soleil'
      : 'Quasi nulle';

  const skierTriggerRisk =
    effectiveBeraLevel >= 4
      ? 'Très élevé : déclenchement facile par faible surcharge sur de nombreuses pentes'
      : effectiveBeraLevel === 3
      ? 'Marqué : un seul skieur peut déclencher une plaque sur pente > 30°'
      : effectiveBeraLevel === 2
      ? 'Limité : possible surtout par forte surcharge sur pente raide (> 35°)'
      : 'Faible (zones d’accumulation isolées)';

  const snowpackStability: SkiDomainLiveOperations['avalancheDetail']['snowpackStability'] =
    effectiveBeraLevel >= 4 ? 'Critique' : effectiveBeraLevel === 3 ? 'Fragile' : effectiveBeraLevel === 2 ? 'Modérée' : 'Bonne';

  const offPisteAdvice =
    effectiveBeraLevel >= 4
      ? 'Hors-piste fortement déconseillé. Restez exclusivement sur les pistes balisées et ouvertes.'
      : effectiveBeraLevel === 3
      ? 'Prudence maximale en hors-piste : évitez les pentes > 30° en orientations critiques, passez un par un.'
      : effectiveBeraLevel === 2
      ? 'Hors-piste envisageable avec vigilance sur les accumulations sous crêtes.'
      : 'Conditions globalement favorables sur les itinéraires classiques ; gardez l’équipement de sécurité.';

  const safetyGearRequired =
    Math.max(input.snowDepthTopCm, live?.snowMountainCm ?? 0) >= 25
      ? 'Triptyque DVA (allumé), Pelle & Sonde obligatoire hors-piste (+ secours 112 / PGHM).'
      : 'Équipement montagne adapté (crampons/piolet si névés glacés).';

  return {
    domainStatus,
    domainStatusLabel,
    domainStatusColorClass,
    telemetrySource,
    telemetryBadgeLabel,
    telemetryTimestamp,
    linkedDomainName: specs.linkedDomainName,
    linkedDomainKm: specs.linkedDomainKm,
    isOpenKmEstimated,
    openSlopesCount,
    totalSlopesCount,
    openSlopesPct,
    openGreen,
    totalGreen,
    openBlue,
    totalBlue,
    openRed,
    totalRed,
    openBlack,
    totalBlack,
    openKm,
    totalKm,
    openLiftsCount,
    totalLiftsCount,
    liftsStatusNote,
    interResortLinksStatus,
    nordicOpenKm,
    nordicTotalKm: specs.nordicKm,
    snowparkStatus,
    tobogganStatus,
    snowmakingPotentialLabel,
    snowmakingActive,
    snowCannonsCoveragePct: specs.snowCannonsCoveragePct,
    groomingQuality,
    visibilityStatus,
    roadAccessStatus,
    roadAlertLevel,
    openingHours: specs.openingHours,
    seasonWindow: specs.seasonWindow,
    recommendedSkierLevel,
    avalancheDetail: {
      beraLevel: effectiveBeraLevel,
      beraShortLabel: beraShortLabels[effectiveBeraLevel],
      criticalAltitudeM: input.criticalAltitudeThreshold,
      criticalSlopes: input.criticalSlopes,
      dominantMechanisms,
      spontaneousActivity,
      skierTriggerRisk,
      snowpackStability,
      offPisteAdvice,
      safetyGearRequired
    }
  };
}
