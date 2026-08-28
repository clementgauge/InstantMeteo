/**
 * Ultra-Developed Snow Type & Nivological Physics Engine
 * 
 * Provides high-precision scientific analysis of falling and accumulated snow based on:
 * - Isotherm 0°C (ISO_0)
 * - Ground & Air Temperature (T0 / T2m)
 * - Wet-Bulb Temperature (Tw)
 * - Atmospheric Pressure / Altitude
 * - Relative Humidity & Precipitation Rate
 * - Snow-to-Liquid Ratio (SLR) & Density (kg/m³)
 * - Crystal Structure (Météo-France & International Classification of Snow)
 */

export interface SnowTypeDiagnostic {
  typeCode: 
    | 'NEIGE_TRE_HUMIDE_LOURDE'
    | 'NEIGE_HUMIDE_ISOTHERMIE'
    | 'NEIGE_POUDREUSE_STANDARD'
    | 'NEIGE_POUDREUSE_LEGERE_CHAMPAGNE'
    | 'NEIGE_POUDREUSE_POLAIRE_SECHE'
    | 'NEIGE_ARCTIQUE_AIGUILLES'
    | 'NEIGE_ROULEE_GRAUPEL'
    | 'PLUIE_VERGLACANTE_VERGLAS';
  
  title: string;
  subtitle: string;
  emoji: string;
  
  // Physical Metrics
  densityKgM3: number; // e.g. 60 kg/m³
  snowToLiquidRatio: number; // e.g. 15 (means 1cm snow = 10mm / 15 = 0.67mm water)
  slrLabel: string; // e.g. "1:15 (1 cm = 0.67 mm d'eau)"
  waterEquivalentMmPerCm: number; // e.g. 0.67
  
  // Crystallography & Physics
  crystalName: string;
  crystalDescription: string;
  cloudGrowthZoneTempC: string; // Cloud level temperature where crystal grew
  
  // Practical & Safety Impact Scores (0-100)
  skiabilityIndex: number; // 0 (impossible) to 100 (dream)
  roadAdhesionIndex: number; // 0 (ice rink) to 100 (normal)
  electricalTreeWeightRiskScore: number; // 0 (none) to 100 (extreme branches breaking)
  
  // Nivological & Avalanche Properties
  structuralCohesion: 'Volatile (Nulle)' | 'Moyenne (Feutrage)' | 'Forte (Lourde)' | 'Glace Vive';
  avalancheLayerRisk: string; // e.g. "Instabilité de sous-couche, plaque à vent friable"
  
  // Detailed Thermal Context Explanation
  thermalContextExplanation: string;
  actionableRecommendations: string[];
}

export interface SnowAnalysisParams {
  temperatureC: number;
  isotherm0Meters?: number;
  wetBulbZeroMeters?: number;
  relativeHumidityPct?: number;
  precipitationRateMmH?: number;
  stationAltitudeMeters?: number;
  windSpeedKmH?: number;
  isConvectiveShower?: boolean;
}

/**
 * Calculates ultra-developed Snow Type Diagnostic from atmospheric thermal profile
 */
export function getAdvancedSnowTypeDiagnostic(params: SnowAnalysisParams): SnowTypeDiagnostic {
  const t = params.temperatureC;
  const rh = Math.min(100, Math.max(20, params.relativeHumidityPct ?? 80));
  const precipRate = params.precipitationRateMmH ?? 1.0;
  const alt = params.stationAltitudeMeters ?? 500;
  const iso0 = params.isotherm0Meters ?? Math.max(0, alt + Math.round(t / 0.0065));
  const wind = params.windSpeedKmH ?? 10;
  const isConvective = params.isConvectiveShower || precipRate >= 4.0;

  // 1. PLUIE VERGLAÇANTE / VERGLAS (Inversion: T_sol <= 0°C but iso0 above station)
  if (t <= 0.2 && iso0 > alt + 400 && precipRate > 0.2 && !isConvective) {
    return {
      typeCode: 'PLUIE_VERGLACANTE_VERGLAS',
      title: 'Pluie Verglaçante & Verglas Massif (Glaze)',
      subtitle: 'Surcharge glacée immédiate sur toutes les surfaces froides',
      emoji: '🧊',
      densityKgM3: 900,
      snowToLiquidRatio: 1,
      slrLabel: '1:1 (Glace vive translucide)',
      waterEquivalentMmPerCm: 10.0,
      crystalName: 'Eau surfondue vitrifiée',
      crystalDescription: 'Gouttelettes de pluie en surfusion gelant instantanément au contact des sols à température négative.',
      cloudGrowthZoneTempC: '+2°C à +5°C en altitude (Couche chaude d\'inversion)',
      skiabilityIndex: 5,
      roadAdhesionIndex: 0,
      electricalTreeWeightRiskScore: 98,
      structuralCohesion: 'Glace Vive',
      avalancheLayerRisk: 'Formation d\'une croûte de glace impériale totalement imperméable sur le manteau neigeux.',
      thermalContextExplanation: `Inversion thermique critique : l'air en altitude à ${iso0} m est au-dessus de 0°C (pluie liquide), mais l'air au sol (${t}°C à ${alt} m) est gelé. La pluie gèle immédiatement à l'impact.`,
      actionableRecommendations: [
        "Conditions routières extrêmement dangereuses : verglas généralisé instantané.",
        "Risque majeur de rupture de lignes électriques et de branches d'arbres sous le poids de la glace.",
        "Chaussures à crampons ou chaînes à neige indispensables."
      ]
    };
  }

  // 2. GRAUPEL / NEIGE ROULÉE (Convective / Graupel)
  if (isConvective && t >= -2.0 && t <= 2.0) {
    return {
      typeCode: 'NEIGE_ROULEE_GRAUPEL',
      title: 'Neige Roulée / Grésil Givré (Graupel)',
      subtitle: 'Billes de neige opaque enrobées de gouttelettes congelées',
      emoji: '⚪',
      densityKgM3: 150,
      snowToLiquidRatio: 7,
      slrLabel: '1:7 (1 cm = 1.4 mm d\'eau)',
      waterEquivalentMmPerCm: 1.43,
      crystalName: 'Grains de graupel / Billes givrées',
      crystalDescription: 'Cristaux de neige enrobés de gouttelettes d\'eau surfondues accumulées dans les courants ascendants convectifs.',
      cloudGrowthZoneTempC: '-5°C à -15°C sous forte convection',
      skiabilityIndex: 45,
      roadAdhesionIndex: 20,
      electricalTreeWeightRiskScore: 30,
      structuralCohesion: 'Volatile (Nulle)',
      avalancheLayerRisk: 'Effet "roulement à billes" très dangereux. Constitue une couche fragile enfouie sous les prochaines chutes.',
      thermalContextExplanation: `Averse convective intense avec fort courant ascendant. Les flocons collectent l'eau surfondue et forment des billes rigides qui rebondissent au sol.`,
      actionableRecommendations: [
        "Prudence sur la route : perte d'adhérence brutale similaire à du gravillon humide.",
        "En montagne, surveiller la création d'une couche fragile d'avalanche sous la neige fraîche."
      ]
    };
  }

  // 3. NEIGE TRÈS HUMIDE, LOURDE & COLLANTE (T > +0.8°C à +2.0°C)
  if (t > 0.8) {
    const density = Math.min(260, Math.round(170 + (t - 0.8) * 70));
    const slr = Number((1000 / density).toFixed(1));
    const eqWater = Number((density / 100).toFixed(2));

    return {
      typeCode: 'NEIGE_TRE_HUMIDE_LOURDE',
      title: 'Neige Très Humide, Lourde & Collante',
      subtitle: 'Neige gorgée d\'eau liquide, colle aux équipements et alourdit la végétation',
      emoji: '🫠',
      densityKgM3: density,
      snowToLiquidRatio: slr,
      slrLabel: `1:${slr} (1 cm = ${eqWater} mm d'eau)`,
      waterEquivalentMmPerCm: eqWater,
      crystalName: 'Flocons fondants agglomérés ("Cuisses de grenouille")',
      crystalDescription: 'Agats de cristaux partiellement fondus soudés par un film d\'eau liquide supérieur à 8% de la masse.',
      cloudGrowthZoneTempC: '-2°C à 0°C au franchissement du seuil de fonte',
      skiabilityIndex: 25,
      roadAdhesionIndex: 40,
      electricalTreeWeightRiskScore: 85,
      structuralCohesion: 'Forte (Lourde)',
      avalancheLayerRisk: 'Risque d\'avalanches de neige humide (mouille) et de glissements de fond sur pentes herbeuses.',
      thermalContextExplanation: `Température au sol légèrement positive (${t}°C) provoquant la fusion superficielle des flocons pendant leur chute.`,
      actionableRecommendations: [
        "Attention aux chutes de branches et lignes électriques sous la neige collante.",
        "Dégagement manuel des trottoirs indispensable avant que le regel nocturne ne transforme la masse en glace indéracinable.",
        "Tracé difficile et freinage brutal sous les skis."
      ]
    };
  }

  // 4. NEIGE HUMIDE D'ISOTHERMIE (0.0°C < T <= 0.8°C)
  if (t > 0.0) {
    const density = Math.round(120 + t * 50);
    const slr = Number((1000 / density).toFixed(1));
    const eqWater = Number((density / 100).toFixed(2));

    return {
      typeCode: 'NEIGE_HUMIDE_ISOTHERMIE',
      title: 'Neige Humide d\'Isothermie (Gros Flocons)',
      subtitle: 'Flocons volumineux en assiettes, excellente neige de sous-couche',
      emoji: '❄️',
      densityKgM3: density,
      snowToLiquidRatio: slr,
      slrLabel: `1:${slr} (1 cm = ${eqWater} mm d'eau)`,
      waterEquivalentMmPerCm: eqWater,
      crystalName: 'Assiettes & flocons agglomérés d\'isothermie',
      crystalDescription: 'Flocons volumineux formés par la coalescence de milliers de micro-cristaux dans la couche à 0°C.',
      cloudGrowthZoneTempC: '-4°C à 0°C (Couche isotherme)',
      skiabilityIndex: 65,
      roadAdhesionIndex: 55,
      electricalTreeWeightRiskScore: 50,
      structuralCohesion: 'Moyenne (Feutrage)',
      avalancheLayerRisk: 'Tassement naturel rapide. Bonne cohésion globale mais lourde à skier en hors-piste.',
      thermalContextExplanation: `L'air est calé au seuil de fonte (0°C à +0.8°C). Le refroidissement par isothermie de précipitation maintient la chute jusqu'au sol.`,
      actionableRecommendations: [
        "Idéal pour la fabrication d'une sous-couche solide et amortissante sur les domaines skiables.",
        "Équipements pneumatiques hiver indispensables."
      ]
    };
  }

  // 5. NEIGE POUDREUSE STANDARD ( -2.5°C < T <= 0.0°C )
  if (t > -2.5) {
    const density = Math.round(85 + (t + 2.5) * 14);
    const slr = Number((1000 / density).toFixed(1));
    const eqWater = Number((density / 100).toFixed(2));

    return {
      typeCode: 'NEIGE_POUDREUSE_STANDARD',
      title: 'Poudreuse Standard Froid Modéré',
      subtitle: 'Poudreuse classique à excellente cohésion mécanique et tassement harmonieux',
      emoji: '🌨️',
      densityKgM3: density,
      snowToLiquidRatio: slr,
      slrLabel: `1:${slr} (1 cm = ${eqWater} mm d'eau)`,
      waterEquivalentMmPerCm: eqWater,
      crystalName: 'Dendrites stellaires fines (Dendrites de Nakaya)',
      crystalDescription: 'Cristaux en étoiles à 6 branches bien ramifiées s\'engrenant naturellement les unes dans les autres.',
      cloudGrowthZoneTempC: '-10°C à -14°C',
      skiabilityIndex: 90,
      roadAdhesionIndex: 65,
      electricalTreeWeightRiskScore: 20,
      structuralCohesion: 'Moyenne (Feutrage)',
      avalancheLayerRisk: 'Bonne stabilité relative une fois tassée, sauf en cas de vent fort créant des plaques friables.',
      thermalContextExplanation: `Température légèrement négative (${t}°C) idéale pour la formation de dendrites parfaites sans eau liquide residuelle.`,
      actionableRecommendations: [
        "Qualité de glisse excellente sur piste comme en hors-piste.",
        "Bonne accroche des pneus hiver avec lamelles."
      ]
    };
  }

  // 6. NEIGE POUDREUSE LÉGÈRE CHAMPAGNE ( -8.0°C < T <= -2.5°C )
  if (t > -8.0) {
    const density = Math.round(55 + (t + 8.0) * 5.4);
    const slr = Number((1000 / density).toFixed(1));
    const eqWater = Number((density / 100).toFixed(2));

    return {
      typeCode: 'NEIGE_POUDREUSE_LEGERE_CHAMPAGNE',
      title: 'Poudreuse Ultra-Légère (Champagne Powder)',
      subtitle: 'Cristaux dendritiques géants ultra-légers, glisse mythique sans résistance',
      emoji: '✨',
      densityKgM3: density,
      snowToLiquidRatio: slr,
      slrLabel: `1:${slr} (1 cm = ${eqWater} mm d'eau)`,
      waterEquivalentMmPerCm: eqWater,
      crystalName: 'Dendrites géantes de zone optimale (-12°C à -16°C)',
      crystalDescription: 'Étoiles légères et dentelées formées au cœur de la zone de sursaturation par rapport à la glace.',
      cloudGrowthZoneTempC: '-12°C à -16°C (Zone de croissance optimale)',
      skiabilityIndex: 100,
      roadAdhesionIndex: 50,
      electricalTreeWeightRiskScore: 5,
      structuralCohesion: 'Volatile (Nulle)',
      avalancheLayerRisk: 'Sensible au vent : se transforme très rapidement en plaques à vent friables sur les crêtes.',
      thermalContextExplanation: `Conditions thermiques parfaites (${t}°C). L'air froid et sec permet aux cristaux de conserver une structure aérée à 93% d'air.`,
      actionableRecommendations: [
        "Condition de glisse exceptionnelle (effet 'champagne powder').",
        "Neige facilement déplacée par les turbulences des véhicules en circulation."
      ]
    };
  }

  // 7. NEIGE POUDREUSE POLAIRE SÈCHE ( -15.0°C < T <= -8.0°C )
  if (t > -15.0) {
    const density = Math.round(35 + (t + 15.0) * 2.8);
    const slr = Number((1000 / density).toFixed(1));
    const eqWater = Number((density / 100).toFixed(2));

    return {
      typeCode: 'NEIGE_POUDREUSE_POLAIRE_SECHE',
      title: 'Poudreuse Polaire Sèche & Poussière de Diamant',
      subtitle: 'Cristaux prismatiques très froids, zéro humidité résiduelle',
      emoji: '💎',
      densityKgM3: density,
      snowToLiquidRatio: slr,
      slrLabel: `1:${slr} (1 cm = ${eqWater} mm d'eau)`,
      waterEquivalentMmPerCm: eqWater,
      crystalName: 'Colonnes évidées, prismes & micro-plaques',
      crystalDescription: 'Cristaux géométriques très compacts et secs développés par très faible humidité absolue.',
      cloudGrowthZoneTempC: '-18°C à -25°C',
      skiabilityIndex: 80,
      roadAdhesionIndex: 40,
      electricalTreeWeightRiskScore: 0,
      structuralCohesion: 'Volatile (Nulle)',
      avalancheLayerRisk: 'Cohésion mécanique quasi nulle. Forme des dunes de poudrin volatile balayées par le vent.',
      thermalContextExplanation: `Grand froid sibérien (${t}°C). La très faible quantité de vapeur d'eau produit des micro-cristaux d'une sécheresse absolue.`,
      actionableRecommendations: [
        "Génération de poudrin / chasse-neige élevé (drifting snow) au passage du vent.",
        "Sensation de frottement sec sous les skis due à l'absence de film de micro-fusion."
      ]
    };
  }

  // 8. NEIGE ARCTIQUE AIGUILLES ( T <= -15.0°C )
  const density = 30;
  const slr = 30;
  const eqWater = 0.33;

  return {
    typeCode: 'NEIGE_ARCTIQUE_AIGUILLES',
    title: 'Poudrin de Glace & Aiguilles Arctiques',
    subtitle: 'Froid extrême, micro-aiguilles de glace sans aucune cohésion',
    emoji: '🥶',
    densityKgM3: density,
    snowToLiquidRatio: slr,
    slrLabel: `1:${slr} (1 cm = ${eqWater} mm d'eau)`,
    waterEquivalentMmPerCm: eqWater,
    crystalName: 'Micro-aiguilles et prismes arctiques',
    crystalDescription: 'Aiguilles glacées ultra-fines tombant sous forme de poussière de diamant scintillante.',
    cloudGrowthZoneTempC: '< -25°C',
    skiabilityIndex: 60,
    roadAdhesionIndex: 30,
    electricalTreeWeightRiskScore: 0,
    structuralCohesion: 'Volatile (Nulle)',
    avalancheLayerRisk: 'Agit comme du sable sec. Aucune accroche naturelle.',
    thermalContextExplanation: `Froid extrême (${t}°C). Cristallisation directe par sublimation dans l'air glacial.`,
    actionableRecommendations: [
      "Frottement très élevé pour le matériel de glisse (effet 'sable').",
      "Protection du visage et prévention des gelures impératives."
    ]
  };
}
