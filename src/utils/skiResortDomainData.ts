/**
 * Référentiel des Domaines Skiables & Calcul Opérationnel Temps Réel
 * (Pistes ouvertes par couleur, Remontées mécaniques, BERA détaillé,
 *  Liaisons, Neige de culture, Ski de fond, Snowpark & Accès routiers)
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
}

export interface SkiDomainLiveOperations {
  domainStatus: 'OUVERT' | 'OUVERTURE PARTIELLE' | 'HAUTS SECTEURS / GLACIER' | 'FERMÉ / PRÉ-SAISON';
  domainStatusLabel: string;
  domainStatusColorClass: string;
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
  'mont-blanc-chamonix': {
    totalSlopesCount: 118, greenCount: 17, blueCount: 41, redCount: 42, blackCount: 18,
    totalSlopeKm: 170, totalLiftsCount: 47, nordicKm: 58, hasGlacier: true, hasSnowpark: true,
    snowCannonsCoveragePct: 38, openingHours: '08h45 – 16h45', seasonWindow: 'Fin Nov – Début Mai'
  },
  'val-thorens-3-vallees': {
    totalSlopesCount: 339, greenCount: 45, blueCount: 147, redCount: 114, blackCount: 33,
    totalSlopeKm: 600, totalLiftsCount: 160, nordicKm: 120, hasGlacier: true, hasSnowpark: true,
    snowCannonsCoveragePct: 54, openingHours: '09h00 – 17h00', seasonWindow: 'Fin Nov – Début Mai'
  },
  'tignes-val-disere': {
    totalSlopesCount: 163, greenCount: 22, blueCount: 68, redCount: 46, blackCount: 27,
    totalSlopeKm: 300, totalLiftsCount: 78, nordicKm: 44, hasGlacier: true, hasSnowpark: true,
    snowCannonsCoveragePct: 60, openingHours: '09h00 – 16h45', seasonWindow: 'Fin Nov – Début Mai'
  },
  'courchevel-meribel': {
    totalSlopesCount: 166, greenCount: 27, blueCount: 62, redCount: 55, blackCount: 22,
    totalSlopeKm: 300, totalLiftsCount: 102, nordicKm: 90, hasGlacier: false, hasSnowpark: true,
    snowCannonsCoveragePct: 58, openingHours: '09h00 – 16h45', seasonWindow: 'Début Déc – Fin Avr'
  },
  'la-plagne-les-arcs': {
    totalSlopesCount: 264, greenCount: 22, blueCount: 135, redCount: 75, blackCount: 32,
    totalSlopeKm: 425, totalLiftsCount: 130, nordicKm: 153, hasGlacier: true, hasSnowpark: true,
    snowCannonsCoveragePct: 52, openingHours: '09h00 – 16h45', seasonWindow: 'Mi-Déc – Fin Avr'
  },
  'avoriaz-portes-du-soleil': {
    totalSlopesCount: 308, greenCount: 37, blueCount: 129, redCount: 109, blackCount: 33,
    totalSlopeKm: 600, totalLiftsCount: 204, nordicKm: 245, hasGlacier: false, hasSnowpark: true,
    snowCannonsCoveragePct: 42, openingHours: '09h00 – 16h45', seasonWindow: 'Mi-Déc – Fin Avr'
  },
  'la-clusaz-grand-bornand': {
    totalSlopesCount: 132, greenCount: 28, blueCount: 47, redCount: 44, blackCount: 13,
    totalSlopeKm: 210, totalLiftsCount: 72, nordicKm: 128, hasGlacier: false, hasSnowpark: true,
    snowCannonsCoveragePct: 45, openingHours: '09h00 – 16h45', seasonWindow: 'Mi-Déc – Avr'
  },
  'alpe-dhuez-2-alpes': {
    totalSlopesCount: 228, greenCount: 54, blueCount: 79, redCount: 65, blackCount: 30,
    totalSlopeKm: 450, totalLiftsCount: 112, nordicKm: 75, hasGlacier: true, hasSnowpark: true,
    snowCannonsCoveragePct: 56, openingHours: '09h00 – 17h00', seasonWindow: 'Fin Nov – Début Mai'
  },
  'serre-chevalier-montgenevre': {
    totalSlopesCount: 158, greenCount: 26, blueCount: 55, redCount: 55, blackCount: 22,
    totalSlopeKm: 350, totalLiftsCount: 83, nordicKm: 80, hasGlacier: false, hasSnowpark: true,
    snowCannonsCoveragePct: 50, openingHours: '09h00 – 16h45', seasonWindow: 'Début Déc – Avr'
  },
  'vars-risoul-isola2000': {
    totalSlopesCount: 161, greenCount: 28, blueCount: 70, redCount: 49, blackCount: 14,
    totalSlopeKm: 305, totalLiftsCount: 64, nordicKm: 55, hasGlacier: false, hasSnowpark: true,
    snowCannonsCoveragePct: 62, openingHours: '09h00 – 16h45', seasonWindow: 'Début Déc – Avr'
  },
  'tourmalet-saint-lary-cauterets': {
    totalSlopesCount: 145, greenCount: 25, blueCount: 55, redCount: 48, blackCount: 17,
    totalSlopeKm: 236, totalLiftsCount: 65, nordicKm: 60, hasGlacier: false, hasSnowpark: true,
    snowCannonsCoveragePct: 52, openingHours: '09h00 – 17h00', seasonWindow: 'Début Déc – Avr'
  },
  'font-romeu-ax-les-angles': {
    totalSlopesCount: 122, greenCount: 34, blueCount: 38, redCount: 34, blackCount: 16,
    totalSlopeKm: 178, totalLiftsCount: 54, nordicKm: 147, hasGlacier: false, hasSnowpark: true,
    snowCannonsCoveragePct: 72, openingHours: '09h00 – 17h00', seasonWindow: 'Début Déc – Avr'
  },
  'sancy-cantal-lioran': {
    totalSlopesCount: 102, greenCount: 29, blueCount: 37, redCount: 27, blackCount: 9,
    totalSlopeKm: 144, totalLiftsCount: 49, nordicKm: 250, hasGlacier: false, hasSnowpark: true,
    snowCannonsCoveragePct: 64, openingHours: '09h00 – 17h00', seasonWindow: 'Mi-Déc – Fin Mars'
  },
  'vosges-jura-rousses-bresse': {
    totalSlopesCount: 106, greenCount: 31, blueCount: 41, redCount: 26, blackCount: 8,
    totalSlopeKm: 125, totalLiftsCount: 62, nordicKm: 320, hasGlacier: false, hasSnowpark: true,
    snowCannonsCoveragePct: 58, openingHours: '09h00 – 17h00', seasonWindow: 'Mi-Déc – Fin Mars'
  },
  'zermatt-cervin': {
    totalSlopesCount: 148, greenCount: 0, blueCount: 38, redCount: 83, blackCount: 27,
    totalSlopeKm: 360, totalLiftsCount: 52, nordicKm: 15, hasGlacier: true, hasSnowpark: true,
    snowCannonsCoveragePct: 75, openingHours: '08h30 – 16h30', seasonWindow: 'Toute l\'année (Glacier)'
  },
  'verbier-4-vallees': {
    totalSlopesCount: 185, greenCount: 0, blueCount: 55, redCount: 92, blackCount: 38,
    totalSlopeKm: 410, totalLiftsCount: 67, nordicKm: 32, hasGlacier: true, hasSnowpark: true,
    snowCannonsCoveragePct: 48, openingHours: '08h45 – 16h30', seasonWindow: 'Fin Nov – Fin Avr'
  },
  'st-moritz-davos-laax': {
    totalSlopesCount: 242, greenCount: 0, blueCount: 72, redCount: 122, blackCount: 48,
    totalSlopeKm: 550, totalLiftsCount: 96, nordicKm: 240, hasGlacier: true, hasSnowpark: true,
    snowCannonsCoveragePct: 65, openingHours: '08h30 – 16h30', seasonWindow: 'Fin Nov – Début Mai'
  },
  'grindelwald-wengen-crans': {
    totalSlopesCount: 162, greenCount: 0, blueCount: 56, redCount: 78, blackCount: 28,
    totalSlopeKm: 350, totalLiftsCount: 68, nordicKm: 42, hasGlacier: true, hasSnowpark: true,
    snowCannonsCoveragePct: 60, openingHours: '08h30 – 16h30', seasonWindow: 'Fin Nov – Fin Avr'
  },
  'st-anton-lech-arlberg': {
    totalSlopesCount: 168, greenCount: 0, blueCount: 74, redCount: 68, blackCount: 26,
    totalSlopeKm: 305, totalLiftsCount: 85, nordicKm: 40, hasGlacier: false, hasSnowpark: true,
    snowCannonsCoveragePct: 85, openingHours: '08h45 – 16h30', seasonWindow: 'Début Déc – Fin Avr'
  },
  'ischgl-solden-obergurgl': {
    totalSlopesCount: 215, greenCount: 0, blueCount: 74, redCount: 105, blackCount: 36,
    totalSlopeKm: 390, totalLiftsCount: 89, nordicKm: 72, hasGlacier: true, hasSnowpark: true,
    snowCannonsCoveragePct: 88, openingHours: '08h30 – 16h30', seasonWindow: 'Oct – Début Mai (Glacier)'
  },
  'kitzbuhel-mayrhofen-kaprun': {
    totalSlopesCount: 224, greenCount: 0, blueCount: 98, redCount: 92, blackCount: 34,
    totalSlopeKm: 410, totalLiftsCount: 118, nordicKm: 120, hasGlacier: true, hasSnowpark: true,
    snowCannonsCoveragePct: 86, openingHours: '08h30 – 16h30', seasonWindow: 'Oct – Mai (Glacier)'
  },
  'dolomites-cortina-gardena': {
    totalSlopesCount: 310, greenCount: 0, blueCount: 118, redCount: 152, blackCount: 40,
    totalSlopeKm: 520, totalLiftsCount: 145, nordicKm: 133, hasGlacier: true, hasSnowpark: true,
    snowCannonsCoveragePct: 95, openingHours: '08h30 – 16h45', seasonWindow: 'Fin Nov – Mi-Avr'
  },
  'cervinia-courmayeur-livigno': {
    totalSlopesCount: 175, greenCount: 0, blueCount: 62, redCount: 86, blackCount: 27,
    totalSlopeKm: 340, totalLiftsCount: 74, nordicKm: 65, hasGlacier: true, hasSnowpark: true,
    snowCannonsCoveragePct: 78, openingHours: '08h30 – 16h45', seasonWindow: 'Fin Oct – Début Mai'
  },
  'grandvalira-baqueira-sierra-nevada': {
    totalSlopesCount: 248, greenCount: 32, blueCount: 101, redCount: 82, blackCount: 33,
    totalSlopeKm: 380, totalLiftsCount: 112, nordicKm: 35, hasGlacier: false, hasSnowpark: true,
    snowCannonsCoveragePct: 72, openingHours: '09h00 – 17h00', seasonWindow: 'Début Déc – Avr'
  },
  'garmisch-zugspitze-are-trysil': {
    totalSlopesCount: 176, greenCount: 38, blueCount: 66, redCount: 52, blackCount: 20,
    totalSlopeKm: 230, totalLiftsCount: 88, nordicKm: 140, hasGlacier: true, hasSnowpark: true,
    snowCannonsCoveragePct: 70, openingHours: '09h00 – 16h00', seasonWindow: 'Nov – Début Mai'
  },
  'bansko-jasna-zakopane': {
    totalSlopesCount: 92, greenCount: 12, blueCount: 36, redCount: 32, blackCount: 12,
    totalSlopeKm: 145, totalLiftsCount: 48, nordicKm: 45, hasGlacier: false, hasSnowpark: true,
    snowCannonsCoveragePct: 85, openingHours: '08h30 – 16h30', seasonWindow: 'Déc – Avr'
  },
  'whistler-blackcomb': {
    totalSlopesCount: 200, greenCount: 38, blueCount: 108, redCount: 34, blackCount: 20,
    totalSlopeKm: 320, totalLiftsCount: 37, nordicKm: 90, hasGlacier: true, hasSnowpark: true,
    snowCannonsCoveragePct: 28, openingHours: '08h30 – 15h30', seasonWindow: 'Fin Nov – Mai'
  },
  'banff-lake-louise': {
    totalSlopesCount: 164, greenCount: 36, blueCount: 64, redCount: 42, blackCount: 22,
    totalSlopeKm: 260, totalLiftsCount: 22, nordicKm: 75, hasGlacier: false, hasSnowpark: true,
    snowCannonsCoveragePct: 35, openingHours: '09h00 – 16h00', seasonWindow: 'Mi-Nov – Mai'
  },
  'aspen-snowmass': {
    totalSlopesCount: 238, greenCount: 22, blueCount: 102, redCount: 68, blackCount: 46,
    totalSlopeKm: 330, totalLiftsCount: 40, nordicKm: 90, hasGlacier: false, hasSnowpark: true,
    snowCannonsCoveragePct: 32, openingHours: '09h00 – 16h00', seasonWindow: 'Fin Nov – Mi-Avr'
  },
  'vail-mountain': {
    totalSlopesCount: 195, greenCount: 35, blueCount: 70, redCount: 54, blackCount: 36,
    totalSlopeKm: 310, totalLiftsCount: 32, nordicKm: 50, hasGlacier: false, hasSnowpark: true,
    snowCannonsCoveragePct: 34, openingHours: '08h30 – 15h30', seasonWindow: 'Mi-Nov – Avr'
  },
  'jackson-hole': {
    totalSlopesCount: 133, greenCount: 13, blueCount: 53, redCount: 38, blackCount: 29,
    totalSlopeKm: 210, totalLiftsCount: 15, nordicKm: 30, hasGlacier: false, hasSnowpark: true,
    snowCannonsCoveragePct: 25, openingHours: '09h00 – 16h00', seasonWindow: 'Fin Nov – Avr'
  },
  'niseko-united': {
    totalSlopesCount: 72, greenCount: 21, blueCount: 28, redCount: 15, blackCount: 8,
    totalSlopeKm: 95, totalLiftsCount: 30, nordicKm: 25, hasGlacier: false, hasSnowpark: true,
    snowCannonsCoveragePct: 12, openingHours: '08h30 – 19h00 (Nocturne)', seasonWindow: 'Fin Nov – Début Mai'
  },
  'hakuba-valley': {
    totalSlopesCount: 135, greenCount: 38, blueCount: 52, redCount: 30, blackCount: 15,
    totalSlopeKm: 137, totalLiftsCount: 58, nordicKm: 40, hasGlacier: false, hasSnowpark: true,
    snowCannonsCoveragePct: 20, openingHours: '08h00 – 16h30', seasonWindow: 'Fin Nov – Début Mai'
  },
  'cerro-catedral-bariloche': {
    totalSlopesCount: 60, greenCount: 12, blueCount: 26, redCount: 15, blackCount: 7,
    totalSlopeKm: 120, totalLiftsCount: 34, nordicKm: 18, hasGlacier: false, hasSnowpark: true,
    snowCannonsCoveragePct: 35, openingHours: '09h00 – 17h00', seasonWindow: 'Juin – Octobre (Austral)'
  },
  'coronet-peak-queenstown': {
    totalSlopesCount: 70, greenCount: 18, blueCount: 28, redCount: 16, blackCount: 8,
    totalSlopeKm: 85, totalLiftsCount: 16, nordicKm: 15, hasGlacier: false, hasSnowpark: true,
    snowCannonsCoveragePct: 78, openingHours: '09h00 – 16h00', seasonWindow: 'Juin – Octobre (Austral)'
  }
};

function inferSpecsForCustomResort(altitudeBase: number, altitudePeak: number): SkiDomainCatalogSpecs {
  const drop = Math.max(200, altitudePeak - altitudeBase);
  const scale = Math.min(1.4, Math.max(0.35, drop / 1100));
  const totalSlopesCount = Math.round(52 * scale);
  const greenCount = Math.max(4, Math.round(totalSlopesCount * 0.18));
  const blueCount = Math.max(8, Math.round(totalSlopesCount * 0.4));
  const redCount = Math.max(6, Math.round(totalSlopesCount * 0.3));
  const blackCount = Math.max(2, totalSlopesCount - greenCount - blueCount - redCount);
  const totalSlopeKm = Math.round(78 * scale);
  const totalLiftsCount = Math.max(6, Math.round(24 * scale));
  return {
    totalSlopesCount,
    greenCount,
    blueCount,
    redCount,
    blackCount,
    totalSlopeKm,
    totalLiftsCount,
    nordicKm: Math.round(35 * scale),
    hasGlacier: altitudePeak >= 3150,
    hasSnowpark: drop >= 450,
    snowCannonsCoveragePct: altitudePeak >= 2200 ? 55 : 42,
    openingHours: '09h00 – 16h45',
    seasonWindow: altitudePeak >= 2800 ? 'Déc – Fin Avr' : 'Mi-Déc – Fin Mars'
  };
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
}

/**
 * Calcule en temps réel l'état d'ouverture des pistes, remontées, BERA détaillé,
 * enneigement artificiel, liaisons, visibilité et accès routiers.
 */
export function computeLiveSkiDomainOperations(input: ComputeLiveSkiDomainInput): SkiDomainLiveOperations {
  const specs = SKI_DOMAIN_SPECS_BY_ID[input.id] || inferSpecsForCustomResort(input.altitudeBase, input.altitudePeak);
  const nivoseCm = input.nivoseSnowDepthCm ?? Math.round((input.snowDepthBottomCm + input.snowDepthTopCm) / 2);
  const nowMonth = new Date().getMonth(); // 0..11
  const isNorth = input.latitude >= 0;
  const effMonth = isNorth ? nowMonth : (nowMonth + 6) % 12;

  const isCoreWinter = effMonth === 11 || effMonth <= 2; // Déc..Mars
  const isShoulderSeason = effMonth === 10 || effMonth === 3; // Nov ou Avr
  const isEarlyGlacier = effMonth === 9 || effMonth === 4; // Oct ou Mai
  const baseTemp = input.baseTempC ?? 4;
  const peakTemp = input.peakTempC ?? -2;

  // Estimation physique du % de domaine skiable exploitable selon l'épaisseur réelle de neige + altitude + saison + vent
  let snowCoverageRatio = 0;

  if (input.snowDepthBottomCm >= 35 && input.snowDepthTopCm >= 85) {
    snowCoverageRatio = 0.94;
  } else if (input.snowDepthBottomCm >= 18 && input.snowDepthTopCm >= 60) {
    snowCoverageRatio = 0.78;
  } else if (nivoseCm >= 75 && input.snowDepthTopCm >= 100) {
    // Haut du domaine très bien enneigé (ex: fin novembre > 2200 m), bas de station encore sec ou limite
    snowCoverageRatio = input.snowDepthBottomCm > 0 ? 0.62 : 0.44;
  } else if (nivoseCm >= 40 || input.snowDepthTopCm >= 70) {
    snowCoverageRatio = input.snowDepthBottomCm > 0 ? 0.52 : 0.34;
  } else if (input.snowDepthTopCm >= 35) {
    snowCoverageRatio = specs.hasGlacier ? 0.24 : 0.16;
  } else if (input.snowDepthTopCm >= 15 && specs.hasGlacier) {
    snowCoverageRatio = 0.12;
  } else {
    snowCoverageRatio = 0;
  }

  // En plein été (Juin-Septembre hémisphère ajusté), seuls quelques glaciers restent skiables partiellement
  if (!isCoreWinter && !isShoulderSeason && !isEarlyGlacier) {
    snowCoverageRatio = specs.hasGlacier && input.snowDepthTopCm >= 45 ? 0.14 : 0;
  }

  // Impact du vent violent en crête sur les remontées d'altitude & pistes exposées
  const windClosureFactor =
    input.ridgeWindGustKmh >= 95 ? 0.32 :
    input.ridgeWindGustKmh >= 80 ? 0.58 :
    input.ridgeWindGustKmh >= 65 ? 0.84 : 1.0;

  // Potentiel canons à neige (Tw <= -2°C sur bas/moyen domaine)
  const snowmakingActive = (baseTemp <= -1.5 || (input.nivoseTempC ?? peakTemp) <= -3.5) && (isCoreWinter || isShoulderSeason);
  if (snowmakingActive && snowCoverageRatio > 0 && snowCoverageRatio < 0.85) {
    snowCoverageRatio = Math.min(0.95, snowCoverageRatio + (specs.snowCannonsCoveragePct / 100) * 0.14);
  }

  const effectiveOpenRatio = Math.min(0.98, Math.max(0, snowCoverageRatio * windClosureFactor));

  const openSlopesCount = effectiveOpenRatio > 0.02
    ? Math.max(1, Math.min(specs.totalSlopesCount, Math.round(specs.totalSlopesCount * effectiveOpenRatio)))
    : 0;
  const openSlopesPct = specs.totalSlopesCount > 0 ? Math.round((openSlopesCount / specs.totalSlopesCount) * 100) : 0;

  // Répartition réaliste par couleur (quand seul le haut est ouvert, surtout bleues/rouges d'altitude ; quand le bas est ouvert, les vertes ouvrent)
  const lowOpenRatio = input.snowDepthBottomCm >= 15 ? effectiveOpenRatio : Math.max(0, effectiveOpenRatio * 0.35);
  const openGreen = openSlopesCount > 0 && specs.greenCount > 0
    ? Math.min(specs.greenCount, Math.round(specs.greenCount * lowOpenRatio))
    : 0;
  const openBlue = openSlopesCount > 0
    ? Math.min(specs.blueCount, Math.round(specs.blueCount * Math.min(1, effectiveOpenRatio * 1.1)))
    : 0;
  const openRed = openSlopesCount > 0
    ? Math.min(specs.redCount, Math.round(specs.redCount * effectiveOpenRatio))
    : 0;
  let openBlack = openSlopesCount > 0
    ? Math.min(specs.blackCount, Math.round(specs.blackCount * (effectiveOpenRatio * (input.snowDepthTopCm >= 90 && windClosureFactor > 0.7 ? 0.95 : 0.55))))
    : 0;

  // Ajustement fin pour que la somme des couleurs corresponde exactement à openSlopesCount
  let colorSum = openGreen + openBlue + openRed + openBlack;
  let adjustedBlue = openBlue;
  let adjustedRed = openRed;
  if (colorSum !== openSlopesCount && openSlopesCount > 0) {
    const diff = openSlopesCount - colorSum;
    if (diff > 0) {
      adjustedRed = Math.min(specs.redCount, adjustedRed + diff);
      colorSum = openGreen + adjustedBlue + adjustedRed + openBlack;
      if (colorSum < openSlopesCount) {
        adjustedBlue = Math.min(specs.blueCount, adjustedBlue + (openSlopesCount - colorSum));
      }
    } else {
      let rem = -diff;
      const takeBlack = Math.min(openBlack, rem);
      openBlack -= takeBlack;
      rem -= takeBlack;
      if (rem > 0) {
        const takeRed = Math.min(adjustedRed, rem);
        adjustedRed -= takeRed;
        rem -= takeRed;
      }
      if (rem > 0) {
        adjustedBlue = Math.max(0, adjustedBlue - rem);
      }
    }
  }

  const openKm = openSlopesCount > 0
    ? Math.max(1, Math.min(specs.totalSlopeKm, Math.round(specs.totalSlopeKm * (openSlopesCount / specs.totalSlopesCount))))
    : 0;

  const openLiftsCount = openSlopesCount > 0
    ? Math.max(1, Math.min(specs.totalLiftsCount, Math.round(specs.totalLiftsCount * Math.min(1, effectiveOpenRatio * 1.08))))
    : 0;

  let domainStatus: SkiDomainLiveOperations['domainStatus'] = 'FERMÉ / PRÉ-SAISON';
  let domainStatusLabel = 'Domaine fermé (hors saison ou enneigement insuffisant)';
  let domainStatusColorClass = 'bg-slate-800 border-slate-700 text-slate-300';

  if (openSlopesPct >= 65) {
    domainStatus = 'OUVERT';
    domainStatusLabel = `Domaine Ouvert (${openSlopesPct}% des pistes)`;
    domainStatusColorClass = 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300';
  } else if (openSlopesPct >= 25) {
    domainStatus = 'OUVERTURE PARTIELLE';
    domainStatusLabel = `Ouverture Partielle (${openSlopesPct}% • Secteurs d'altitude actifs)`;
    domainStatusColorClass = 'bg-sky-500/20 border-sky-400/50 text-sky-300';
  } else if (openSlopesCount > 0) {
    domainStatus = 'HAUTS SECTEURS / GLACIER';
    domainStatusLabel = specs.hasGlacier
      ? `Glacier & Hauts Secteurs Ouverts (${openSlopesCount} pistes)`
      : `Ouverture Limitée Haut de Domaine (${openSlopesCount} pistes)`;
    domainStatusColorClass = 'bg-amber-500/20 border-amber-400/50 text-amber-300';
  }

  const liftsStatusNote =
    openLiftsCount === 0
      ? 'Remontées à l’arrêt (attente d’enneigement continu / ouverture saisonnière)'
      : input.ridgeWindGustKmh >= 85
      ? `Téléphériques et crêtes fermés par sécurité (rafales ${input.ridgeWindGustKmh} km/h)`
      : input.ridgeWindGustKmh >= 65
      ? `Vent soutenu en altitude (${input.ridgeWindGustKmh} km/h) : ralentissements possibles sur les sommets`
      : 'Exploitation fluide sur les appareils ouverts';

  const interResortLinksStatus: SkiDomainLiveOperations['interResortLinksStatus'] =
    openSlopesCount === 0
      ? 'Hors exploitation'
      : input.ridgeWindGustKmh >= 80
      ? 'Liaisons fermées'
      : openSlopesPct >= 55 && input.ridgeWindGustKmh < 65
      ? 'Liaisons ouvertes'
      : 'Liaisons partielles (vent/neige)';

  const nordicOpenKm =
    input.snowDepthBottomCm >= 25 || (nivoseCm >= 50 && input.altitudeBase >= 1400)
      ? Math.round(specs.nordicKm * Math.min(1, Math.max(0.25, input.snowDepthBottomCm / 45)))
      : 0;

  const snowparkStatus: SkiDomainLiveOperations['snowparkStatus'] = !specs.hasSnowpark
    ? 'Non équipé'
    : openSlopesPct >= 60
    ? 'Ouvert'
    : openSlopesCount >= 8 && nivoseCm >= 65
    ? 'Ouverture partielle'
    : 'Fermé';

  const tobogganStatus: SkiDomainLiveOperations['tobogganStatus'] =
    input.snowDepthBottomCm >= 15 || (openSlopesCount > 0 && baseTemp <= 2) ? 'Ouvert' : 'Fermé';

  const snowmakingPotentialLabel = snowmakingActive
    ? `Production possible (air favorable : ${baseTemp}°C base / ${peakTemp}°C sommet)`
    : baseTemp > 1.5
    ? `Arrêt canons en pied (${baseTemp}°C trop doux) • maintien en altitude`
    : 'Températures limites pour la neige de culture';

  const groomingQuality =
    openSlopesCount === 0
      ? 'Pas de damage en cours (sol dégagé ou pré-saison)'
      : input.freshSnow24hCm >= 15
      ? 'Neige fraîche abondante — damage en cours de stabilisation'
      : peakTemp <= -3
      ? 'Pistes damées fermes — excellente accroche'
      : baseTemp > 2
      ? 'Neige damée transformée / souple l’après-midi en bas'
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
    roadAccessStatus = `Équipements hiver obligatoires (Loi Montagne : 4 pneus 3PMSF ou chaînes). Risque de neige/verglas dès ${Math.max(400, input.rainSnowLimitM)} m.`;
  } else if (isCoreWinter || isShoulderSeason) {
    roadAlertLevel = 'ATTENTION';
    roadAccessStatus = 'Pneus hiver recommandés / obligatoires en zone montagne (Loi Montagne Nov–Mars). Verglas possible la nuit.';
  }

  const recommendedSkierLevel =
    openSlopesCount === 0
      ? 'Domaine fermé — Randonnée pédestre / Alpinisme selon altitude'
      : openGreen === 0
      ? 'Skieurs intermédiaires & confirmés (pistes d’altitude uniquement)'
      : input.ridgeWindGustKmh >= 75
      ? 'Prudence — Secteurs abrités conseillés (vent fort en crête)'
      : 'Tous niveaux (débutants à experts)';

  // Analyse Avalanche BERA approfondie
  const dominantMechanisms: string[] = [];
  if (input.snowDepthTopCm < 15) {
    dominantMechanisms.push('Manteau très mince / discontinu : risque d’avalanche quasi nul hors couloirs d’altitude.');
  } else {
    if (input.ridgeWindGustKmh >= 50 || input.freshSnow24hCm >= 8) {
      dominantMechanisms.push(`Plaques à vent récentes formées sous le vent en versants ${input.criticalSlopes.join(', ')} au-dessus de ${input.criticalAltitudeThreshold} m.`);
    }
    if (peakTemp > 0 || baseTemp > 3.5) {
      dominantMechanisms.push('Humidification diurne en pentes raides ensoleillées (coulées de neige lourde l’après-midi).');
    }
    if (input.snowDepthTopCm >= 75 && peakTemp <= -3) {
      dominantMechanisms.push('Sous-couche froide en versants ombragés (ubacs > 2400 m) sensible aux surcharges.');
    }
    if (dominantMechanisms.length === 0) {
      dominantMechanisms.push('Manteau globalement bien consolidé par le regel nocturne.');
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
    input.beraRiskLevel >= 4
      ? 'Forte : départs spontanés d’avalanches moyennes à grandes attendus'
      : input.beraRiskLevel === 3
      ? 'Modérée : quelques purges naturelles possibles dans les pentes raides'
      : input.beraRiskLevel === 2
      ? 'Faible : rares coulées superficielles près des rochers au soleil'
      : 'Quasi nulle';

  const skierTriggerRisk =
    input.beraRiskLevel >= 4
      ? 'Très élevé : déclenchement facile par faible surcharge sur de nombreuses pentes'
      : input.beraRiskLevel === 3
      ? 'Probable : un seul skieur peut déclencher une plaque sur pente > 30°'
      : input.beraRiskLevel === 2
      ? 'Possible : principalement sur très forte pente (> 38°) avec forte surcharge'
      : 'Très faible (isolé aux zones d’accumulation extrême)';

  const snowpackStability: SkiDomainLiveOperations['avalancheDetail']['snowpackStability'] =
    input.beraRiskLevel >= 4 ? 'Critique' : input.beraRiskLevel === 3 ? 'Fragile' : input.beraRiskLevel === 2 ? 'Modérée' : 'Bonne';

  const offPisteAdvice =
    input.beraRiskLevel >= 4
      ? 'Hors-piste fortement déconseillé. Restez impérativement sur les pistes balisées et ouvertes.'
      : input.beraRiskLevel === 3
      ? 'Prudence maximale en hors-piste : contournez les pentes > 30° en orientations critiques et passez un par un.'
      : input.beraRiskLevel === 2
      ? 'Hors-piste possible pour pratiquants formés en évitant les accumulations sous crêtes.'
      : 'Conditions globalement stables ; gardez toujours de la vigilance dans les couloirs raides d’altitude.';

  const safetyGearRequired =
    input.snowDepthTopCm >= 25
      ? 'Triptyque DVA (allumé), Pelle & Sonde obligatoire en hors-piste (+ téléphone 112 / PGHM).'
      : 'Équipement montagne adapté (crampons/piolet si névés glacés en haute altitude).';

  return {
    domainStatus,
    domainStatusLabel,
    domainStatusColorClass,
    openSlopesCount,
    totalSlopesCount: specs.totalSlopesCount,
    openSlopesPct,
    openGreen,
    totalGreen: specs.greenCount,
    openBlue: adjustedBlue,
    totalBlue: specs.blueCount,
    openRed: adjustedRed,
    totalRed: specs.redCount,
    openBlack,
    totalBlack: specs.blackCount,
    openKm,
    totalKm: specs.totalSlopeKm,
    openLiftsCount,
    totalLiftsCount: specs.totalLiftsCount,
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
      beraLevel: input.beraRiskLevel,
      beraShortLabel: beraShortLabels[input.beraRiskLevel],
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
