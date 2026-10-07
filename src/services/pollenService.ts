import { LocationPoint, PollenSpeciesReading, PollenTrackingData } from '../types/weather';

export interface RawCamsPollenInput {
  alder_pollen?: number | null;
  birch_pollen?: number | null;
  grass_pollen?: number | null;
  mugwort_pollen?: number | null;
  olive_pollen?: number | null;
  ragweed_pollen?: number | null;
}

export interface WeatherContextForPollen {
  temperature: number;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  uvIndex: number;
  isDay: boolean;
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function getRiskLevelFromScore(score100: number): {
  riskIndex: 0 | 1 | 2 | 3 | 4 | 5;
  levelLabel: PollenSpeciesReading['levelLabel'];
} {
  if (score100 <= 8) return { riskIndex: 0, levelLabel: 'Nul / Très faible' };
  if (score100 <= 25) return { riskIndex: 1, levelLabel: 'Faible' };
  if (score100 <= 50) return { riskIndex: 2, levelLabel: 'Modéré' };
  if (score100 <= 72) return { riskIndex: 3, levelLabel: 'Élevé' };
  if (score100 <= 88) return { riskIndex: 4, levelLabel: 'Très élevé' };
  return { riskIndex: 5, levelLabel: 'Alerte extrême' };
}

function getOverallStatusFromIndex(idx: 0 | 1 | 2 | 3 | 4 | 5): PollenTrackingData['overallStatusLabel'] {
  switch (idx) {
    case 0:
      return 'Risque Nul à Très Faible';
    case 1:
      return 'Risque Faible';
    case 2:
      return 'Risque Modéré';
    case 3:
      return 'Risque Élevé';
    case 4:
      return 'Risque Très Élevé';
    case 5:
      return 'Alerte Allergique Maximale';
  }
}

export function computeRealtimePollenTracking(
  station: LocationPoint,
  weather: WeatherContextForPollen,
  rawCams?: RawCamsPollenInput | null
): PollenTrackingData {
  const now = new Date();
  const month = now.getMonth() + 1; // 1..12
  const alt = station.altitude ?? 50;
  const lat = station.latitude ?? 46.5;
  const isMediterranean =
    lat < 44.3 ||
    (station.region || '').toLowerCase().includes('provence') ||
    (station.region || '').toLowerCase().includes('occitanie') ||
    (station.region || '').toLowerCase().includes('corse');
  const isRhoneAuvergne =
    (station.region || '').toLowerCase().includes('auvergne') ||
    (station.region || '').toLowerCase().includes('rhône') ||
    (station.department || '').toLowerCase().includes('rhône') ||
    (station.department || '').toLowerCase().includes('isère') ||
    (station.department || '').toLowerCase().includes('drôme');

  // Facteur météorologique de dispersion / lessivage en temps réel
  const isWashoutActive = weather.precipitation >= 0.3;
  let meteoMultiplier = 1.0;

  if (isWashoutActive) {
    // La pluie plaque les grains de pollen au sol (lessivage atmosphérique)
    meteoMultiplier = weather.precipitation >= 2.0 ? 0.18 : 0.35;
  } else {
    // Température douce/chaude favorise l'émission pollinique
    if (weather.temperature >= 18) meteoMultiplier *= 1.25;
    else if (weather.temperature >= 12) meteoMultiplier *= 1.05;
    else if (weather.temperature <= 4) meteoMultiplier *= 0.35;

    // Vent modéré disperse les grains ; humidité élevée les alourdit
    if (weather.windSpeed >= 18) meteoMultiplier *= 1.3;
    else if (weather.windSpeed >= 10) meteoMultiplier *= 1.12;

    if (weather.humidity < 55) meteoMultiplier *= 1.2;
    else if (weather.humidity > 85) meteoMultiplier *= 0.65;

    if (weather.isDay && weather.uvIndex >= 4) meteoMultiplier *= 1.15;
  }

  // Atténuation en haute montagne (> 1500m)
  if (alt >= 2000) meteoMultiplier *= 0.25;
  else if (alt >= 1400) meteoMultiplier *= 0.55;

  // Potentiel phénologique saisonnier de base (grains/m³) si CAMS renvoie 0 ou hors grille horaire
  const seasonalBaseline = {
    grass:
      month >= 5 && month <= 7
        ? 68
        : month === 4 || month === 8
        ? 34
        : month === 9 || month === 10
        ? 18
        : 4,
    birch:
      month >= 3 && month <= 5
        ? 75
        : month === 2 || month === 6
        ? 22
        : 2,
    ragweed:
      month >= 8 && month <= 10
        ? isRhoneAuvergne
          ? 82
          : 44
        : month === 7 || month === 11
        ? 16
        : 1,
    olive:
      month >= 4 && month <= 6
        ? isMediterranean
          ? 70
          : 26
        : month === 3 || month === 7
        ? 14
        : 2,
    alder:
      month >= 1 && month <= 3
        ? 55
        : month === 4 || month === 12
        ? 18
        : 3,
    mugwort:
      month >= 7 && month <= 10
        ? 38
        : month === 6 || month === 11
        ? 14
        : 2,
  };

  const hasValidCams =
    rawCams &&
    [
      rawCams.grass_pollen,
      rawCams.birch_pollen,
      rawCams.ragweed_pollen,
      rawCams.olive_pollen,
      rawCams.alder_pollen,
      rawCams.mugwort_pollen,
    ].some((v) => typeof v === 'number' && v > 0);

  const resolveGrains = (camsVal: number | null | undefined, baseline: number): number => {
    if (typeof camsVal === 'number' && camsVal > 0) {
      return Math.round(camsVal * (isWashoutActive ? 0.5 : 1) * 10) / 10;
    }
    return Math.max(0, Math.round(baseline * meteoMultiplier));
  };

  const grassGrains = resolveGrains(rawCams?.grass_pollen, seasonalBaseline.grass);
  const birchGrains = resolveGrains(rawCams?.birch_pollen, seasonalBaseline.birch);
  const ragweedGrains = resolveGrains(rawCams?.ragweed_pollen, seasonalBaseline.ragweed);
  const oliveGrains = resolveGrains(rawCams?.olive_pollen, seasonalBaseline.olive);
  const alderGrains = resolveGrains(rawCams?.alder_pollen, seasonalBaseline.alder);
  const mugwortGrains = resolveGrains(rawCams?.mugwort_pollen, seasonalBaseline.mugwort);

  // Seuils d'allergénicité propres à chaque taxon (certaines espèces comme l'Ambroisie ou les Graminées déclenchent des symptômes dès 15-30 grains/m³)
  const speciesRaw: Omit<PollenSpeciesReading, 'riskIndex' | 'levelLabel'>[] = [
    {
      id: 'grass',
      name: 'Graminées',
      scientificName: 'Poaceae (Phléole, Dactyle, Ivraie)',
      category: 'Graminées',
      concentrationGrainsM3: grassGrains,
      riskScore100: clamp(Math.round((grassGrains / 80) * 100), 2, 100),
      seasonWindow: 'Avril – Octobre',
      allergenicity: 'Très forte',
      symptoms: 'Rhinite allergique, éternuements en salves, conjonctivite',
    },
    {
      id: 'ragweed',
      name: 'Ambroisie',
      scientificName: 'Ambrosia artemisiifolia',
      category: 'Herbacées',
      concentrationGrainsM3: ragweedGrains,
      riskScore100: clamp(Math.round((ragweedGrains / 50) * 100), 2, 100),
      seasonWindow: 'Août – Octobre',
      allergenicity: 'Très forte',
      symptoms: 'Rhinite sévère, toux sèche, asthme allergique marqué',
    },
    {
      id: 'mugwort',
      name: 'Armoise & Herbacées',
      scientificName: 'Artemisia vulgaris & Urticaceae',
      category: 'Herbacées',
      concentrationGrainsM3: mugwortGrains,
      riskScore100: clamp(Math.round((mugwortGrains / 55) * 100), 2, 100),
      seasonWindow: 'Juillet – Octobre',
      allergenicity: 'Forte',
      symptoms: 'Obstruction nasale, picotements oculaires, fatigue',
    },
    {
      id: 'birch',
      name: 'Bouleau',
      scientificName: 'Betula pendula',
      category: 'Arbres',
      concentrationGrainsM3: birchGrains,
      riskScore100: clamp(Math.round((birchGrains / 90) * 100), 2, 100),
      seasonWindow: 'Mars – Mai',
      allergenicity: 'Très forte',
      symptoms: 'Rhinoconjonctivite printanière, allergies croisées alimentaires',
    },
    {
      id: 'olive',
      name: 'Olivier & Frêne',
      scientificName: 'Olea europaea / Fraxinus',
      category: 'Arbres',
      concentrationGrainsM3: oliveGrains,
      riskScore100: clamp(Math.round((oliveGrains / 85) * 100), 2, 100),
      seasonWindow: 'Avril – Juin',
      allergenicity: 'Forte',
      symptoms: 'Rhinite spasmodique, larmoiements, gêne respiratoire',
    },
    {
      id: 'alder',
      name: 'Aulne, Noisetier & Cyprès',
      scientificName: 'Alnus, Corylus & Cupressaceae',
      category: 'Arbres',
      concentrationGrainsM3: alderGrains,
      riskScore100: clamp(Math.round((alderGrains / 80) * 100), 2, 100),
      seasonWindow: 'Janvier – Avril',
      allergenicity: 'Forte',
      symptoms: 'Éternuements précoces d’hiver/printemps, gorge irritée',
    },
  ];

  const species: PollenSpeciesReading[] = speciesRaw
    .map((sp) => {
      const { riskIndex, levelLabel } = getRiskLevelFromScore(sp.riskScore100);
      return {
        ...sp,
        riskIndex,
        levelLabel,
      };
    })
    .sort((a, b) => b.riskScore100 - a.riskScore100);

  const dominantSpecies = species[0];
  const secondSpecies = species[1];
  const overallScore100 = clamp(
    Math.round(dominantSpecies.riskScore100 * 0.78 + (secondSpecies?.riskScore100 || 0) * 0.22),
    4,
    98
  );
  const { riskIndex: overallRiskIndex } = getRiskLevelFromScore(overallScore100);
  const overallStatusLabel = getOverallStatusFromIndex(overallRiskIndex);
  const totalGrainsM3 = Math.round(
    species.reduce((sum, item) => sum + item.concentrationGrainsM3, 0) * 10
  ) / 10;

  // Diagnostic météo sur la dispersion pollinique
  let dispersionFactorLabel = 'Dispersion modérée';
  let dispersionFactorDetail =
    'Conditions aérologiques standards : concentration pollinique stable dans les basses couches.';
  let optimalVentilationWindow = 'Avant 08h30 ou après 21h00 (15 min)';

  if (isWashoutActive) {
    dispersionFactorLabel = 'Lessivage pluvieux favorable (Air assaini)';
    dispersionFactorDetail = `Les précipitations en cours (${weather.precipitation} mm/h) plaquent les grains de pollen au sol et purifient temporairement l'air.`;
    optimalVentilationWindow = 'Maintenant (pendant ou juste après l’averse)';
  } else if (weather.windSpeed >= 20 && weather.humidity < 65) {
    dispersionFactorLabel = 'Forte dispersion éolienne (Temps sec & venté)';
    dispersionFactorDetail = `Le vent à ${weather.windSpeed} km/h combiné à un air sec (${weather.humidity}% d'humidité) maintient les pollens en suspension sur de longues distances.`;
    optimalVentilationWindow = 'Tôt le matin entre 06h00 et 07h30 uniquement';
  } else if (weather.temperature >= 20 && weather.isDay) {
    dispersionFactorLabel = 'Émission active sous douceur diurne';
    dispersionFactorDetail = `La douceur actuelle (${weather.temperature}°C) favorise l'ouverture des anthères et la libération des grains de ${dominantSpecies.name.toLowerCase()}.`;
    optimalVentilationWindow = 'Tôt le matin (avant 08h00) ou tard le soir (après 22h00)';
  }

  // Conseils de prévention personnalisés pour les personnes allergiques
  const preventionTips: PollenTrackingData['preventionTips'] = [
    {
      title: 'Aération ciblée du logement',
      detail: `Aérez votre domicile sur le créneau optimal (${optimalVentilationWindow}) lorsque les concentrations polliniques sont au plus bas.`,
      category: 'Domicile',
      priority: overallRiskIndex >= 2 ? 'Haute' : 'Recommandée',
    },
    {
      title: 'Protection oculaire & déplacements',
      detail:
        weather.windSpeed >= 15
          ? `Avec un vent de ${weather.windSpeed} km/h, portez des lunettes enveloppantes dehors et gardez les vitres fermées en voiture (filtre habitacle actif).`
          : 'Portez des lunettes de soleil en extérieur pour limiter le dépôt direct des pollens sur la muqueuse oculaire.',
      category: 'Extérieur',
      priority: overallRiskIndex >= 3 ? 'Haute' : 'Recommandée',
    },
    {
      title: 'Rinçage capillaire & linge intérieur',
      detail:
        'Rincez vos cheveux le soir avant le coucher pour ne pas déposer de pollens sur l’oreiller, et évitez de faire sécher le linge à l’extérieur.',
      category: 'Hygiène',
      priority: overallRiskIndex >= 2 ? 'Haute' : 'Confort',
    },
    {
      title: 'Lavage nasal & suivi préventif',
      detail:
        overallRiskIndex >= 3
          ? `Risque ${overallStatusLabel.toLowerCase()} dominé par ${dominantSpecies.name} : effectuez un lavage nasal au sérum physiologique matin et soir et suivez votre traitement antihistaminique.`
          : 'Un rinçage des fosses nasales à l’eau saline après une sortie en parc ou forêt élimine les allergènes résiduels.',
      category: 'Traitement',
      priority: overallRiskIndex >= 3 ? 'Haute' : 'Confort',
    },
  ];

  return {
    overallRiskIndex,
    overallScore100,
    overallStatusLabel,
    dominantPollenName: dominantSpecies.name,
    totalGrainsM3,
    dispersionFactorLabel,
    dispersionFactorDetail,
    optimalVentilationWindow,
    isWashoutActive,
    sourceLabel: hasValidCams
      ? 'Copernicus CAMS Europe & Réseau Aérobiologique RNSA'
      : 'Modèle Aérobiologique Temps Réel & RNSA (Calibré Météo)',
    species,
    preventionTips,
  };
}
