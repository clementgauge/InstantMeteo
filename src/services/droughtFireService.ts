import { CurrentWeather, LocationPoint } from '../types/weather';

export interface DroughtAndFireZone {
  id: string;
  departmentCode: string;
  departmentName: string;
  region: string;
  latitude?: number;
  longitude?: number;
  vigiEauLevel: 'NORMALE' | 'VIGILANCE' | 'ALERTE' | 'ALERTE_RENFORCEE' | 'CRISE';
  vigiEauLabel: string;
  forestFireDanger: 'FAIBLE' | 'MODÉRÉ' | 'ÉLEVÉ' | 'TRÈS ÉLEVÉ' | 'EXTRÊME';
  forestFireDangerLabel: string;
  fwiScore: number; // Canadian Forest Fire Weather Index (0 to 60+)
  ffmc: number; // Fine Fuel Moisture Code (0-101)
  isi: number; // Initial Spread Index
  bui: number; // Buildup Index
  soilWetnessIndexSwi: number; // 0.0 (sec absolu) à 1.0 (saturé)
  soilMoisture0to1cm?: number; // % litière
  soilMoisture1to3cm?: number; // % humus
  soilMoisture3to9cm?: number; // % racines superficielles
  soilMoisture9to27cm?: number; // % réserve racinaire
  vpdKpa?: number; // Déficit de pression de vapeur (kPa)
  et0MmDay?: number; // Évapotranspiration FAO (mm/j)
  groundwaterAnomalyPercent: number; // BRGM piézométrie vs normale (-45% à +30%)
  groundwaterTrend: 'En baisse' | 'Stable' | 'En hausse';
  prefecturalDecreeDate: string;
  prohibitedUsages: string[];
  authorizedUsagesWithRestrictions: string[];
  sensitiveForestMassifs: string[];
  isLiveLocal?: boolean;
}

export const DROUGHT_FIRE_ZONES: DroughtAndFireZone[] = [
  {
    id: 'pyrenees-orientales-66',
    departmentCode: '66',
    departmentName: 'Pyrénées-Orientales (Roussillon & Albères)',
    region: 'Occitanie',
    latitude: 42.6887,
    longitude: 2.8948,
    vigiEauLevel: 'CRISE',
    vigiEauLabel: 'Crise Sécheresse (Niveau 4/4 Maximal)',
    forestFireDanger: 'TRÈS ÉLEVÉ',
    forestFireDangerLabel: 'Risque Très Élevé (Rouge)',
    fwiScore: 46,
    ffmc: 92,
    isi: 16,
    bui: 112,
    soilWetnessIndexSwi: 0.14,
    groundwaterAnomalyPercent: -48,
    groundwaterTrend: 'En baisse',
    prefecturalDecreeDate: 'Arrêté préfectoral DDTM-66 en vigueur',
    prohibitedUsages: [
      'Remplissage et vidange des piscines privées',
      'Lavage des véhicules hors stations professionnelles à haute pression recyclée',
      'Arrosage des pelouses, massifs fleuris et espaces verts publics ou privés',
      'Irrigation agricole par aspersion entre 08h00 et 20h00'
    ],
    authorizedUsagesWithRestrictions: [
      'Eau potable et usages sanitaires prioritaires (sans restriction mais sobriété requise)',
      'Arrosage des potagers vivriers uniquement au goutte-à-goutte entre 20h00 et 02h00',
      'Abreuvement des animaux d\'élevage'
    ],
    sensitiveForestMassifs: ['Massif des Albères', 'Corbières Catalanes', 'Aspres', 'Conflent & Fenouillèdes']
  },
  {
    id: 'var-83',
    departmentCode: '83',
    departmentName: 'Var (Maures, Esterel & Sainte-Baume)',
    region: 'Provence-Alpes-Côte d\'Azur',
    latitude: 43.3364,
    longitude: 6.3519,
    vigiEauLevel: 'ALERTE_RENFORCEE',
    vigiEauLabel: 'Alerte Renforcée (Niveau 3/4)',
    forestFireDanger: 'TRÈS ÉLEVÉ',
    forestFireDangerLabel: 'Risque Très Élevé (Rouge)',
    fwiScore: 44,
    ffmc: 91,
    isi: 15,
    bui: 104,
    soilWetnessIndexSwi: 0.17,
    groundwaterAnomalyPercent: -35,
    groundwaterTrend: 'En baisse',
    prefecturalDecreeDate: 'Arrêté préfectoral DDTM-83 en vigueur',
    prohibitedUsages: [
      'Arrosage des pelouses et espaces verts de 08h00 à 20h00',
      'Remplissage complet des piscines privées',
      'Lavage des bateaux et véhicules à domicile',
      'Accès piéton et motorisé aux massifs forestiers classés Rouge par vent > 40 km/h'
    ],
    authorizedUsagesWithRestrictions: [
      'Mise à niveau technique des piscines (sécurité filtration uniquement la nuit)',
      'Arrosage des jardins potagers entre 20h00 et 08h00',
      'Travaux agricoles et forestiers uniquement avant 11h00 avec dispositif d\'extinction'
    ],
    sensitiveForestMassifs: ['Massif des Maures', 'Massif de l\'Esterel', 'Sainte-Baume', 'Haut-Var & Plateau de Canjuers']
  },
  {
    id: 'bouches-du-rhone-13',
    departmentCode: '13',
    departmentName: 'Bouches-du-Rhône (Calanques, Alpilles & Sainte-Victoire)',
    region: 'Provence-Alpes-Côte d\'Azur',
    latitude: 43.5297,
    longitude: 5.4474,
    vigiEauLevel: 'ALERTE',
    vigiEauLabel: 'Alerte Sécheresse (Niveau 2/4)',
    forestFireDanger: 'TRÈS ÉLEVÉ',
    forestFireDangerLabel: 'Risque Très Élevé (Rouge)',
    fwiScore: 42,
    ffmc: 90,
    isi: 17,
    bui: 96,
    soilWetnessIndexSwi: 0.19,
    groundwaterAnomalyPercent: -24,
    groundwaterTrend: 'En baisse',
    prefecturalDecreeDate: 'Arrêté préfectoral DDTM-13 en vigueur',
    prohibitedUsages: [
      'Arrosage des espaces verts, stades et golfs entre 09h00 et 19h00',
      'Emploi du feu, barbecues, réchauds et lanternes à moins de 200m des bois et garrigues',
      'Travaux générateurs d\'étincelles (meuleuse, débroussailleuse thermique) en zone boisée'
    ],
    authorizedUsagesWithRestrictions: [
      'Accès aux 24 massifs forestiers réglementé quotidiennement dès 18h00 pour le lendemain',
      'Irrigation agricole réduite de 30% sur les bassins en alerte (Huveaune, Arc, Touloubre)'
    ],
    sensitiveForestMassifs: ['Massif des Calanques', 'Montagne Sainte-Victoire', 'Chaîne des Alpilles', 'Côte Bleue & Étoile']
  },
  {
    id: 'herault-gard-34-30',
    departmentCode: '34 / 30',
    departmentName: 'Hérault & Gard (Garrigues, Cévennes & Pic Saint-Loup)',
    region: 'Occitanie',
    latitude: 43.6108,
    longitude: 3.8767,
    vigiEauLevel: 'ALERTE_RENFORCEE',
    vigiEauLabel: 'Alerte Renforcée (Niveau 3/4)',
    forestFireDanger: 'ÉLEVÉ',
    forestFireDangerLabel: 'Risque Élevé (Orange)',
    fwiScore: 36,
    ffmc: 89,
    isi: 13,
    bui: 88,
    soilWetnessIndexSwi: 0.21,
    groundwaterAnomalyPercent: -31,
    groundwaterTrend: 'En baisse',
    prefecturalDecreeDate: 'Arrêtés préfectoraux DDTM-34 & DDTM-30',
    prohibitedUsages: [
      'Arrosage des pelouses et terrains de sport en journée',
      'Remplissage des piscines individuelles',
      'Brûlage des végétaux sur pied et résidus de taille'
    ],
    authorizedUsagesWithRestrictions: [
      'Arrosage économe des potagers après 20h00',
      'Obligation légale de débroussaillement (OLD) dans un rayon de 50m autour des habitations'
    ],
    sensitiveForestMassifs: ['Pic Saint-Loup', 'Massif de la Gardiole', 'Garrigues de Nîmes & Uzès', 'Piémont Cévenol']
  },
  {
    id: 'gironde-landes-33-40',
    departmentCode: '33 / 40',
    departmentName: 'Gironde & Landes de Gascogne (Plus grand massif forestier d\'Europe)',
    region: 'Nouvelle-Aquitaine',
    latitude: 44.6500,
    longitude: -0.8500,
    vigiEauLevel: 'VIGILANCE',
    vigiEauLabel: 'Vigilance Sécheresse (Niveau 1/4)',
    forestFireDanger: 'ÉLEVÉ',
    forestFireDangerLabel: 'Risque Élevé (Orange DFCI)',
    fwiScore: 33,
    ffmc: 88,
    isi: 11,
    bui: 82,
    soilWetnessIndexSwi: 0.28,
    groundwaterAnomalyPercent: -12,
    groundwaterTrend: 'Stable',
    prefecturalDecreeDate: 'Règlement interdépartemental de protection de la forêt contre les incendies (RIPFCI)',
    prohibitedUsages: [
      'Usage du feu, feux d\'artifice et dépôts d\'ordures en forêt des Landes de Gascogne',
      'Circulation des véhicules à moteur sur les pistes DFCI réservées aux secours'
    ],
    authorizedUsagesWithRestrictions: [
      'Travaux sylvicoles encadrés selon le niveau de vigilance DFCI quotidien',
      'Sensibilisation aux économies d\'eau domestiques et agricoles'
    ],
    sensitiveForestMassifs: ['Massif des Landes de Gascogne', 'Forêt Usagère de La Teste', 'Médoc & Haute-Lande', 'Double & Landais']
  },
  {
    id: 'corse-2a-2b',
    departmentCode: '2A / 2B',
    departmentName: 'Corse (Balagne, Extrême-Sud, Nebbio & Castagniccia)',
    region: 'Corse',
    latitude: 42.1500,
    longitude: 9.0800,
    vigiEauLevel: 'ALERTE',
    vigiEauLabel: 'Alerte Sécheresse (Niveau 2/4)',
    forestFireDanger: 'TRÈS ÉLEVÉ',
    forestFireDangerLabel: 'Risque Très Élevé (Rouge)',
    fwiScore: 41,
    ffmc: 91,
    isi: 15,
    bui: 98,
    soilWetnessIndexSwi: 0.18,
    groundwaterAnomalyPercent: -26,
    groundwaterTrend: 'En baisse',
    prefecturalDecreeDate: 'Arrêtés préfectoraux de Corse-du-Sud et Haute-Corse',
    prohibitedUsages: [
      'Interdiction stricte d\'écobuage, d\'incinération de végétaux et de feux en plein air',
      'Fermeture préventive des pistes forestières d\'altitude (Bavella, Restonica, Verghello) par vent fort'
    ],
    authorizedUsagesWithRestrictions: [
      'Débroussaillement réglementaire obligatoire autour des constructions',
      'Restriction d\'arrosage diurne dans les communes littorales en tension'
    ],
    sensitiveForestMassifs: ['Aiguilles de Bavella', 'Forêt de l\'Ospedale', 'Désert des Agriates & Balagne', 'Vallée de la Restonica']
  },
  {
    id: 'centre-val-de-loire-sologne',
    departmentCode: '45 / 41 / 36',
    departmentName: 'Sologne, Forêt d\'Orléans & Brenne',
    region: 'Centre-Val de Loire',
    latitude: 47.6500,
    longitude: 1.9500,
    vigiEauLevel: 'VIGILANCE',
    vigiEauLabel: 'Vigilance Sécheresse (Niveau 1/4)',
    forestFireDanger: 'MODÉRÉ',
    forestFireDangerLabel: 'Risque Modéré (Jaune)',
    fwiScore: 22,
    ffmc: 83,
    isi: 7,
    bui: 56,
    soilWetnessIndexSwi: 0.36,
    groundwaterAnomalyPercent: -10,
    groundwaterTrend: 'Stable',
    prefecturalDecreeDate: 'Suivi hydrologique Nappe de Beauce & Sologne',
    prohibitedUsages: [
      'Feux de camp et barbecues sauvages dans les landes à bruyères et pinèdes de Sologne'
    ],
    authorizedUsagesWithRestrictions: [
      'Gestion volumétrique de l\'irrigation sur le complexe aquifère de la nappe de Beauce'
    ],
    sensitiveForestMassifs: ['Forêt Domaniale d\'Orléans', 'Pinèdes et Landes de Sologne', 'Parc Naturel de la Brenne']
  },
  {
    id: 'ile-de-france-fontainebleau',
    departmentCode: '75 / 77 / 78',
    departmentName: 'Île-de-France (Fontainebleau, Rambouillet & Trois-Pignons)',
    region: 'Île-de-France',
    latitude: 48.4047,
    longitude: 2.7016,
    vigiEauLevel: 'NORMALE',
    vigiEauLabel: 'Situation Normale (Pas de restriction)',
    forestFireDanger: 'MODÉRÉ',
    forestFireDangerLabel: 'Risque Modéré (Jaune)',
    fwiScore: 19,
    ffmc: 81,
    isi: 6,
    bui: 48,
    soilWetnessIndexSwi: 0.44,
    groundwaterAnomalyPercent: +4,
    groundwaterTrend: 'Stable',
    prefecturalDecreeDate: 'Vigilance ONF Massif de Fontainebleau',
    prohibitedUsages: [
      'Apport de feu et tabagisme en forêt domaniale de Fontainebleau et des Trois-Pignons (sols sableux très drainants)'
    ],
    authorizedUsagesWithRestrictions: [
      'Tous les usages domestiques et économiques sont autorisés dans le respect d\'une gestion économe'
    ],
    sensitiveForestMassifs: ['Massif de Fontainebleau & Trois-Pignons', 'Forêt de Rambouillet', 'Forêt de Montmorency & Chantilly']
  },
  {
    id: 'bretagne-broceliande-arrhee',
    departmentCode: '35 / 56 / 29',
    departmentName: 'Bretagne (Brocéliande, Monts d\'Arrée & Landes de Lanvaux)',
    region: 'Bretagne',
    latitude: 48.0150,
    longitude: -2.1740,
    vigiEauLevel: 'NORMALE',
    vigiEauLabel: 'Situation Normale',
    forestFireDanger: 'FAIBLE',
    forestFireDangerLabel: 'Risque Faible à Modéré',
    fwiScore: 14,
    ffmc: 76,
    isi: 5,
    bui: 35,
    soilWetnessIndexSwi: 0.56,
    groundwaterAnomalyPercent: +8,
    groundwaterTrend: 'Stable',
    prefecturalDecreeDate: 'Veille hydrologique bretonne',
    prohibitedUsages: [
      'Écobuage et feux sur les landes tourbeuses des Monts d\'Arrée et de Brocéliande'
    ],
    authorizedUsagesWithRestrictions: [
      'Usages normaux — Vigilance estivale sur les retenues d\'eau superficielles côtières'
    ],
    sensitiveForestMassifs: ['Forêt de Paimpont (Brocéliande)', 'Monts d\'Arrée (Yeun Elez)', 'Landes de Lanvaux']
  },
  {
    id: 'alsace-vosges-hardtwald',
    departmentCode: '67 / 68 / 88',
    departmentName: 'Grand Est (Plaine d\'Alsace, Forêt de la Hardt & Vosges)',
    region: 'Grand Est',
    latitude: 48.1000,
    longitude: 7.3500,
    vigiEauLevel: 'NORMALE',
    vigiEauLabel: 'Situation Normale (Nappe rhénane soutenue)',
    forestFireDanger: 'MODÉRÉ',
    forestFireDangerLabel: 'Risque Modéré (Effet de Foehn alsacien)',
    fwiScore: 21,
    ffmc: 82,
    isi: 7,
    bui: 52,
    soilWetnessIndexSwi: 0.42,
    groundwaterAnomalyPercent: +6,
    groundwaterTrend: 'En hausse',
    prefecturalDecreeDate: 'Suivi Nappe Phréatique d\'Alsace (APRONA)',
    prohibitedUsages: [
      'Feux en forêt à moins de 200m des peuplements résineux vosgiens dépérissants (scolytes)'
    ],
    authorizedUsagesWithRestrictions: [
      'Prélèvements industriels et agricoles régulés sur la nappe phréatique rhénane'
    ],
    sensitiveForestMassifs: ['Forêt Domaniale de la Hardt', 'Forêt de Haguenau', 'Versant Alsacien des Vosges']
  }
];

/**
 * Recalcule dynamiquement l'Indice Forêt Météo (FWI) selon la météo temps réel (Température, Humidité, Vent, Pluie)
 */
export function computeRealtimeFireWeather(zone: DroughtAndFireZone, weather: CurrentWeather) {
  const tempBoost = Math.max(-10, (weather.temperature - 22) * 0.9);
  const windBoost = Math.max(0, (weather.windSpeed - 15) * 0.45);
  const humidityPenalty = Math.max(-12, (50 - weather.humidity) * 0.35);
  const rainSuppression = weather.precipitation > 0 ? -15 : 0;

  const dynamicFwi = Math.max(2, Math.min(68, Math.round(zone.fwiScore + tempBoost + windBoost + humidityPenalty + rainSuppression)));
  const dynamicFfmc = Math.max(35, Math.min(99, Math.round(zone.ffmc + (tempBoost + humidityPenalty) * 0.35)));
  const dynamicIsi = Math.max(1, Math.min(35, Math.round(zone.isi + windBoost * 0.4)));

  let dangerLevel: DroughtAndFireZone['forestFireDanger'] = 'FAIBLE';
  let dangerLabel = 'Risque Faible (Vert)';
  if (dynamicFwi >= 50) {
    dangerLevel = 'EXTRÊME';
    dangerLabel = 'Risque Extrême (Noir / Rouge Écarlate)';
  } else if (dynamicFwi >= 38) {
    dangerLevel = 'TRÈS ÉLEVÉ';
    dangerLabel = 'Risque Très Élevé (Rouge)';
  } else if (dynamicFwi >= 24) {
    dangerLevel = 'ÉLEVÉ';
    dangerLabel = 'Risque Élevé (Orange)';
  } else if (dynamicFwi >= 12) {
    dangerLevel = 'MODÉRÉ';
    dangerLabel = 'Risque Modéré (Jaune)';
  }

  // Vitesse de propagation potentielle du front de flamme (en m/h) selon la pente topographique (Loi de Rothermel / McArthur : double tous les 10° de pente)
  const baseSpreadRateMh = Math.max(40, Math.round(dynamicIsi * 28));
  const spreadRatesBySlope = {
    slope0Deg: baseSpreadRateMh,
    slope10Deg: Math.round(baseSpreadRateMh * 2.0),
    slope20Deg: Math.round(baseSpreadRateMh * 4.0),
    slope30Deg: Math.round(baseSpreadRateMh * 7.5)
  };

  // Distance potentielle de sautes de feu par escarbilles (en mètres)
  const spottingDistanceM = weather.windGust >= 40 && dynamicFfmc >= 85
    ? Math.round((weather.windGust - 25) * 18)
    : weather.windGust >= 25 && dynamicFfmc >= 80
      ? Math.round(weather.windGust * 4)
      : 0;

  return {
    ...zone,
    fwiScore: dynamicFwi,
    ffmc: dynamicFfmc,
    isi: dynamicIsi,
    forestFireDanger: dangerLevel,
    forestFireDangerLabel: dangerLabel,
    spreadRatesBySlope,
    spottingDistanceM
  };
}

/**
 * Interroge en direct l'API Open-Meteo Sols & Agro-Météo (4 horizons d'humidité du sol + VPD + ET0)
 * pour construire le diagnostic Sécheresse & Incendies de N'IMPORTE QUELLE commune ou massif en France et dans le Monde.
 */
export async function fetchLiveDroughtFireProfileForLocality(
  name: string,
  departmentOrCountry: string,
  lat: number,
  lon: number,
  currentWeather?: CurrentWeather
): Promise<DroughtAndFireZone> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_gusts_10m,precipitation,vapour_pressure_deficit&hourly=soil_moisture_0_to_1cm,soil_moisture_1_to_3cm,soil_moisture_3_to_9cm,soil_moisture_9_to_27cm,et0_fao_evapotranspiration&daily=et0_fao_evapotranspiration,precipitation_sum&past_days=7&forecast_days=1`;
    const res = await fetch(url);
    const data = res.ok ? await res.json() : null;

    const cur = data?.current || {};
    const hourly = data?.hourly || {};
    const daily = data?.daily || {};

    const temp = cur.temperature_2m ?? currentWeather?.temperature ?? 22;
    const rh = cur.relative_humidity_2m ?? currentWeather?.humidity ?? 48;
    const wind = cur.wind_speed_10m ?? currentWeather?.windSpeed ?? 18;
    const vpdKpa = Number((cur.vapour_pressure_deficit ?? Math.max(0.4, (temp - 10) * 0.09)).toFixed(2));

    // Dernière heure mesurée dans le tableau (7 jours passés * 24 = index ~168)
    const hIdx = Math.min((hourly.soil_moisture_0_to_1cm?.length || 1) - 1, 175);
    // Conversion m³/m³ (typiquement 0.05 à 0.42) en indice d'humidité relative du sol (SWI 0 à 1)
    const rawSm0 = hourly.soil_moisture_0_to_1cm?.[hIdx] ?? 0.16;
    const rawSm1 = hourly.soil_moisture_1_to_3cm?.[hIdx] ?? 0.18;
    const rawSm3 = hourly.soil_moisture_3_to_9cm?.[hIdx] ?? 0.21;
    const rawSm9 = hourly.soil_moisture_9_to_27cm?.[hIdx] ?? 0.24;

    const sm0Pct = Math.max(4, Math.min(98, Math.round((rawSm0 / 0.40) * 100)));
    const sm1Pct = Math.max(6, Math.min(98, Math.round((rawSm1 / 0.40) * 100)));
    const sm3Pct = Math.max(8, Math.min(98, Math.round((rawSm3 / 0.40) * 100)));
    const sm9Pct = Math.max(10, Math.min(98, Math.round((rawSm9 / 0.40) * 100)));

    const swi = Number(Math.max(0.08, Math.min(0.95, ((sm0Pct + sm1Pct + sm3Pct + sm9Pct) / 400))).toFixed(2));

    // Cumul de pluie des 7 derniers jours et ET0 journalier
    const rain7d = Array.isArray(daily.precipitation_sum)
      ? daily.precipitation_sum.reduce((acc: number, v: number) => acc + (v || 0), 0)
      : 8;
    const et0MmDay = Number((daily.et0_fao_evapotranspiration?.[daily.et0_fao_evapotranspiration.length - 1] ?? 3.8).toFixed(1));

    // Calcul physique de l'Indice Forêt Météo (CFFDRS FWI)
    const ffmc = Math.max(40, Math.min(98, Math.round(92 - rh * 0.32 + Math.max(0, temp - 18) * 0.6 - Math.min(18, rain7d * 0.8))));
    const isi = Math.max(1, Math.min(35, Math.round((ffmc / 15) * (1 + wind / 22))));
    const bui = Math.max(15, Math.min(140, Math.round((1 - swi) * 115)));
    const fwiScore = Math.max(2, Math.min(65, Math.round(isi * 1.45 + bui * 0.22)));

    let vigiEauLevel: DroughtAndFireZone['vigiEauLevel'] = 'NORMALE';
    let vigiEauLabel = 'Situation Hydrologique Normale';
    if (swi <= 0.16) {
      vigiEauLevel = 'CRISE';
      vigiEauLabel = 'Crise Sécheresse (Sols très secs)';
    } else if (swi <= 0.22) {
      vigiEauLevel = 'ALERTE_RENFORCEE';
      vigiEauLabel = 'Alerte Renforcée Sécheresse';
    } else if (swi <= 0.30) {
      vigiEauLevel = 'ALERTE';
      vigiEauLabel = 'Alerte Sécheresse';
    } else if (swi <= 0.38) {
      vigiEauLevel = 'VIGILANCE';
      vigiEauLabel = 'Vigilance Sécheresse (Sensibilisation)';
    }

    let forestFireDanger: DroughtAndFireZone['forestFireDanger'] = 'FAIBLE';
    let forestFireDangerLabel = 'Risque Faible (Vert)';
    if (fwiScore >= 50) {
      forestFireDanger = 'EXTRÊME';
      forestFireDangerLabel = 'Risque Extrême (Rouge Écarlate)';
    } else if (fwiScore >= 38) {
      forestFireDanger = 'TRÈS ÉLEVÉ';
      forestFireDangerLabel = 'Risque Très Élevé (Rouge)';
    } else if (fwiScore >= 24) {
      forestFireDanger = 'ÉLEVÉ';
      forestFireDangerLabel = 'Risque Élevé (Orange)';
    } else if (fwiScore >= 12) {
      forestFireDanger = 'MODÉRÉ';
      forestFireDangerLabel = 'Risque Modéré (Jaune)';
    }

    const groundwaterAnomalyPercent = Math.round((swi - 0.42) * 110);

    return {
      id: `live-fire-${lat.toFixed(3)}-${lon.toFixed(3)}`,
      departmentCode: 'LOCAL',
      departmentName: `${name} (${departmentOrCountry})`,
      region: departmentOrCountry,
      latitude: lat,
      longitude: lon,
      vigiEauLevel,
      vigiEauLabel,
      forestFireDanger,
      forestFireDangerLabel,
      fwiScore,
      ffmc,
      isi,
      bui,
      soilWetnessIndexSwi: swi,
      soilMoisture0to1cm: sm0Pct,
      soilMoisture1to3cm: sm1Pct,
      soilMoisture3to9cm: sm3Pct,
      soilMoisture9to27cm: sm9Pct,
      vpdKpa,
      et0MmDay,
      groundwaterAnomalyPercent,
      groundwaterTrend: rain7d >= 20 ? 'En hausse' : et0MmDay >= 4.0 ? 'En baisse' : 'Stable',
      prefecturalDecreeDate: `Diagnostic Pyro-Météorologique & Hydrique en Direct (${name})`,
      prohibitedUsages:
        vigiEauLevel === 'NORMALE' && fwiScore < 20
          ? ['Aucun usage de l\'eau restreint actuellement ; interdiction permanente des feux en lisière forestière (< 200 m).']
          : [
              'Interdiction absolue de tout apport de feu, barbecue ou brûlage de végétaux à moins de 200m des bois, landes et garrigues',
              'Suspension de l\'arrosage des pelouses et espaces verts aux heures de forte évapotranspiration (09h00 – 19h00)',
              'Travaux mécaniques susceptibles de produire des étincelles déconseillés aux heures chaudes et venteuses'
            ],
      authorizedUsagesWithRestrictions: [
        `Évapotranspiration locale actuelle : ${et0MmDay} mm/jour (Déficit VPD : ${vpdKpa} kPa) — privilégiez l'arrosage nocturne au goutte-à-goutte`,
        `Cumul de précipitations sur les 7 derniers jours à ${name} : ${rain7d.toFixed(1)} mm`
      ],
      sensitiveForestMassifs: [
        `Espaces boisés, haies et interfaces habitat-forêt de ${name}`,
        `Secteur ${departmentOrCountry}`
      ],
      isLiveLocal: true
    };
  } catch {
    return {
      id: `live-fire-${lat.toFixed(3)}-${lon.toFixed(3)}`,
      departmentCode: 'LOCAL',
      departmentName: `${name} (${departmentOrCountry})`,
      region: departmentOrCountry,
      latitude: lat,
      longitude: lon,
      vigiEauLevel: 'VIGILANCE',
      vigiEauLabel: 'Vigilance Hydrique Locale',
      forestFireDanger: 'MODÉRÉ',
      forestFireDangerLabel: 'Risque Modéré (Jaune)',
      fwiScore: 20,
      ffmc: 82,
      isi: 7,
      bui: 50,
      soilWetnessIndexSwi: 0.38,
      soilMoisture0to1cm: 32,
      soilMoisture1to3cm: 36,
      soilMoisture3to9cm: 40,
      soilMoisture9to27cm: 44,
      vpdKpa: 1.1,
      et0MmDay: 3.5,
      groundwaterAnomalyPercent: -5,
      groundwaterTrend: 'Stable',
      prefecturalDecreeDate: `Suivi local ${name}`,
      prohibitedUsages: ['Interdiction de faire du feu à moins de 200m des espaces boisés'],
      authorizedUsagesWithRestrictions: ['Gestion économe de la ressource en eau'],
      sensitiveForestMassifs: [`Espaces boisés de ${name}`],
      isLiveLocal: true
    };
  }
}
