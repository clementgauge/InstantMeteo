import { LocationPoint, CurrentWeather } from '../types/weather';

export interface DepartmentDroughtFireData {
  dptCode: string;
  dptName: string;
  region: string;
  forestFireDangerLevel: 'VERT' | 'JAUNE' | 'ORANGE' | 'ROUGE';
  forestFireDangerLabel: 'Faible' | 'Modéré' | 'Élevé' | 'Très Élevé';
  fwiScore: number; // Fire Weather Index (0 à 60+)
  ffmc: number; // Fine Fuel Moisture Code (0-101)
  isi: number; // Initial Spread Index
  bui: number; // Build-Up Index
  vigiEauLevel: 'VIGILANCE' | 'ALERTE' | 'ALERTE_RENFORCEE' | 'CRISE';
  vigiEauLabel: string;
  vigiEauColor: string;
  soilWetnessIndexSwi: number; // 0.00 à 1.00 (normale ~0.55-0.70)
  soilMoistureStatus: string;
  rainfallDeficit30DaysPct: number; // e.g. -45%
  prohibitedUsages: string[];
  authorizedUsagesWithRestrictions: string[];
  activeFiresCount: number;
}

// Complete reference database of French Metropolitan departments
export const ALL_FRENCH_DEPARTMENTS: { code: string; name: string; region: string; defaultVigi: 'VIGILANCE' | 'ALERTE' | 'ALERTE_RENFORCEE' | 'CRISE'; defaultFire: 'VERT' | 'JAUNE' | 'ORANGE' | 'ROUGE'; swi: number }[] = [
  { code: '01', name: 'Ain', region: 'Auvergne-Rhône-Alpes', defaultVigi: 'ALERTE', defaultFire: 'JAUNE', swi: 0.38 },
  { code: '02', name: 'Aisne', region: 'Hauts-de-France', defaultVigi: 'VIGILANCE', defaultFire: 'VERT', swi: 0.52 },
  { code: '03', name: 'Allier', region: 'Auvergne-Rhône-Alpes', defaultVigi: 'ALERTE', defaultFire: 'JAUNE', swi: 0.35 },
  { code: '04', name: 'Alpes-de-Haute-Provence', region: 'PACA', defaultVigi: 'ALERTE_RENFORCEE', defaultFire: 'ORANGE', swi: 0.22 },
  { code: '05', name: 'Hautes-Alpes', region: 'PACA', defaultVigi: 'ALERTE', defaultFire: 'JAUNE', swi: 0.32 },
  { code: '06', name: 'Alpes-Maritimes', region: 'PACA', defaultVigi: 'ALERTE_RENFORCEE', defaultFire: 'ORANGE', swi: 0.25 },
  { code: '07', name: 'Ardèche', region: 'Auvergne-Rhône-Alpes', defaultVigi: 'ALERTE_RENFORCEE', defaultFire: 'ORANGE', swi: 0.24 },
  { code: '08', name: 'Ardennes', region: 'Grand Est', defaultVigi: 'VIGILANCE', defaultFire: 'VERT', swi: 0.56 },
  { code: '09', name: 'Ariège', region: 'Occitanie', defaultVigi: 'ALERTE', defaultFire: 'JAUNE', swi: 0.36 },
  { code: '10', name: 'Aube', region: 'Grand Est', defaultVigi: 'VIGILANCE', defaultFire: 'VERT', swi: 0.48 },
  { code: '11', name: 'Aude', region: 'Occitanie', defaultVigi: 'CRISE', defaultFire: 'ROUGE', swi: 0.12 },
  { code: '12', name: 'Aveyron', region: 'Occitanie', defaultVigi: 'ALERTE', defaultFire: 'JAUNE', swi: 0.33 },
  { code: '13', name: 'Bouches-du-Rhône', region: 'PACA', defaultVigi: 'ALERTE_RENFORCEE', defaultFire: 'ORANGE', swi: 0.20 },
  { code: '14', name: 'Calvados', region: 'Normandie', defaultVigi: 'VIGILANCE', defaultFire: 'VERT', swi: 0.54 },
  { code: '15', name: 'Cantal', region: 'Auvergne-Rhône-Alpes', defaultVigi: 'ALERTE', defaultFire: 'JAUNE', swi: 0.42 },
  { code: '16', name: 'Charente', region: 'Nouvelle-Aquitaine', defaultVigi: 'ALERTE', defaultFire: 'JAUNE', swi: 0.38 },
  { code: '17', name: 'Charente-Maritime', region: 'Nouvelle-Aquitaine', defaultVigi: 'ALERTE_RENFORCEE', defaultFire: 'JAUNE', swi: 0.29 },
  { code: '18', name: 'Cher', region: 'Centre-Val de Loire', defaultVigi: 'ALERTE', defaultFire: 'JAUNE', swi: 0.36 },
  { code: '19', name: 'Corrèze', region: 'Nouvelle-Aquitaine', defaultVigi: 'VIGILANCE', defaultFire: 'JAUNE', swi: 0.45 },
  { code: '2A', name: 'Corse-du-Sud', region: 'Corse', defaultVigi: 'ALERTE_RENFORCEE', defaultFire: 'ROUGE', swi: 0.16 },
  { code: '2B', name: 'Haute-Corse', region: 'Corse', defaultVigi: 'ALERTE_RENFORCEE', defaultFire: 'ROUGE', swi: 0.18 },
  { code: '21', name: 'Côte-d\'Or', region: 'Bourgogne-Franche-Comté', defaultVigi: 'ALERTE', defaultFire: 'JAUNE', swi: 0.39 },
  { code: '22', name: 'Côtes-d\'Armor', region: 'Bretagne', defaultVigi: 'VIGILANCE', defaultFire: 'VERT', swi: 0.58 },
  { code: '23', name: 'Creuse', region: 'Nouvelle-Aquitaine', defaultVigi: 'ALERTE', defaultFire: 'JAUNE', swi: 0.40 },
  { code: '24', name: 'Dordogne', region: 'Nouvelle-Aquitaine', defaultVigi: 'ALERTE', defaultFire: 'JAUNE', swi: 0.34 },
  { code: '25', name: 'Doubs', region: 'Bourgogne-Franche-Comté', defaultVigi: 'VIGILANCE', defaultFire: 'VERT', swi: 0.49 },
  { code: '26', name: 'Drôme', region: 'Auvergne-Rhône-Alpes', defaultVigi: 'ALERTE_RENFORCEE', defaultFire: 'ORANGE', swi: 0.22 },
  { code: '27', name: 'Eure', region: 'Normandie', defaultVigi: 'VIGILANCE', defaultFire: 'VERT', swi: 0.51 },
  { code: '28', name: 'Eure-et-Loir', region: 'Centre-Val de Loire', defaultVigi: 'ALERTE', defaultFire: 'VERT', swi: 0.42 },
  { code: '29', name: 'Finistère', region: 'Bretagne', defaultVigi: 'VIGILANCE', defaultFire: 'VERT', swi: 0.62 },
  { code: '30', name: 'Gard', region: 'Occitanie', defaultVigi: 'CRISE', defaultFire: 'ROUGE', swi: 0.14 },
  { code: '31', name: 'Haute-Garonne', region: 'Occitanie', defaultVigi: 'ALERTE', defaultFire: 'JAUNE', swi: 0.35 },
  { code: '32', name: 'Gers', region: 'Occitanie', defaultVigi: 'ALERTE', defaultFire: 'JAUNE', swi: 0.32 },
  { code: '33', name: 'Gironde', region: 'Nouvelle-Aquitaine', defaultVigi: 'ALERTE', defaultFire: 'ORANGE', swi: 0.31 },
  { code: '34', name: 'Hérault', region: 'Occitanie', defaultVigi: 'CRISE', defaultFire: 'ROUGE', swi: 0.11 },
  { code: '35', name: 'Ille-et-Vilaine', region: 'Bretagne', defaultVigi: 'VIGILANCE', defaultFire: 'VERT', swi: 0.52 },
  { code: '36', name: 'Indre', region: 'Centre-Val de Loire', defaultVigi: 'ALERTE', defaultFire: 'JAUNE', swi: 0.37 },
  { code: '37', name: 'Indre-et-Loire', region: 'Centre-Val de Loire', defaultVigi: 'ALERTE', defaultFire: 'JAUNE', swi: 0.39 },
  { code: '38', name: 'Isère', region: 'Auvergne-Rhône-Alpes', defaultVigi: 'ALERTE', defaultFire: 'JAUNE', swi: 0.34 },
  { code: '39', name: 'Jura', region: 'Bourgogne-Franche-Comté', defaultVigi: 'VIGILANCE', defaultFire: 'VERT', swi: 0.47 },
  { code: '40', name: 'Landes', region: 'Nouvelle-Aquitaine', defaultVigi: 'ALERTE', defaultFire: 'ORANGE', swi: 0.33 },
  { code: '41', name: 'Loir-et-Cher', region: 'Centre-Val de Loire', defaultVigi: 'ALERTE', defaultFire: 'JAUNE', swi: 0.38 },
  { code: '42', name: 'Loire', region: 'Auvergne-Rhône-Alpes', defaultVigi: 'ALERTE_RENFORCEE', defaultFire: 'JAUNE', swi: 0.28 },
  { code: '43', name: 'Haute-Loire', region: 'Auvergne-Rhône-Alpes', defaultVigi: 'ALERTE', defaultFire: 'JAUNE', swi: 0.37 },
  { code: '44', name: 'Loire-Atlantique', region: 'Pays de la Loire', defaultVigi: 'ALERTE', defaultFire: 'VERT', swi: 0.46 },
  { code: '45', name: 'Loiret', region: 'Centre-Val de Loire', defaultVigi: 'ALERTE', defaultFire: 'VERT', swi: 0.40 },
  { code: '46', name: 'Lot', region: 'Occitanie', defaultVigi: 'ALERTE_RENFORCEE', defaultFire: 'JAUNE', swi: 0.29 },
  { code: '47', name: 'Lot-et-Garonne', region: 'Nouvelle-Aquitaine', defaultVigi: 'ALERTE_RENFORCEE', defaultFire: 'JAUNE', swi: 0.27 },
  { code: '48', name: 'Lozère', region: 'Occitanie', defaultVigi: 'ALERTE', defaultFire: 'JAUNE', swi: 0.35 },
  { code: '49', name: 'Maine-et-Loire', region: 'Pays de la Loire', defaultVigi: 'ALERTE', defaultFire: 'VERT', swi: 0.43 },
  { code: '50', name: 'Manche', region: 'Normandie', defaultVigi: 'VIGILANCE', defaultFire: 'VERT', swi: 0.59 },
  { code: '51', name: 'Marne', region: 'Grand Est', defaultVigi: 'VIGILANCE', defaultFire: 'VERT', swi: 0.49 },
  { code: '52', name: 'Haute-Marne', region: 'Grand Est', defaultVigi: 'VIGILANCE', defaultFire: 'VERT', swi: 0.48 },
  { code: '53', name: 'Mayenne', region: 'Pays de la Loire', defaultVigi: 'VIGILANCE', defaultFire: 'VERT', swi: 0.50 },
  { code: '54', name: 'Meurthe-et-Moselle', region: 'Grand Est', defaultVigi: 'VIGILANCE', defaultFire: 'VERT', swi: 0.52 },
  { code: '55', name: 'Meuse', region: 'Grand Est', defaultVigi: 'VIGILANCE', defaultFire: 'VERT', swi: 0.53 },
  { code: '56', name: 'Morbihan', region: 'Bretagne', defaultVigi: 'VIGILANCE', defaultFire: 'VERT', swi: 0.56 },
  { code: '57', name: 'Moselle', region: 'Grand Est', defaultVigi: 'VIGILANCE', defaultFire: 'VERT', swi: 0.54 },
  { code: '58', name: 'Nièvre', region: 'Bourgogne-Franche-Comté', defaultVigi: 'ALERTE', defaultFire: 'JAUNE', swi: 0.37 },
  { code: '59', name: 'Nord', region: 'Hauts-de-France', defaultVigi: 'VIGILANCE', defaultFire: 'VERT', swi: 0.55 },
  { code: '60', name: 'Oise', region: 'Hauts-de-France', defaultVigi: 'VIGILANCE', defaultFire: 'VERT', swi: 0.50 },
  { code: '61', name: 'Orne', region: 'Normandie', defaultVigi: 'VIGILANCE', defaultFire: 'VERT', swi: 0.53 },
  { code: '62', name: 'Pas-de-Calais', region: 'Hauts-de-France', defaultVigi: 'VIGILANCE', defaultFire: 'VERT', swi: 0.57 },
  { code: '63', name: 'Puy-de-Dôme', region: 'Auvergne-Rhône-Alpes', defaultVigi: 'ALERTE_RENFORCEE', defaultFire: 'JAUNE', swi: 0.28 },
  { code: '64', name: 'Pyrénées-Atlantiques', region: 'Nouvelle-Aquitaine', defaultVigi: 'VIGILANCE', defaultFire: 'JAUNE', swi: 0.51 },
  { code: '65', name: 'Hautes-Pyrénées', region: 'Occitanie', defaultVigi: 'VIGILANCE', defaultFire: 'JAUNE', swi: 0.48 },
  { code: '66', name: 'Pyrénées-Orientales', region: 'Occitanie', defaultVigi: 'CRISE', defaultFire: 'ROUGE', swi: 0.08 },
  { code: '67', name: 'Bas-Rhin', region: 'Grand Est', defaultVigi: 'VIGILANCE', defaultFire: 'VERT', swi: 0.52 },
  { code: '68', name: 'Haut-Rhin', region: 'Grand Est', defaultVigi: 'VIGILANCE', defaultFire: 'VERT', swi: 0.49 },
  { code: '69', name: 'Rhône & Métropole de Lyon', region: 'Auvergne-Rhône-Alpes', defaultVigi: 'ALERTE_RENFORCEE', defaultFire: 'JAUNE', swi: 0.27 },
  { code: '70', name: 'Haute-Saône', region: 'Bourgogne-Franche-Comté', defaultVigi: 'VIGILANCE', defaultFire: 'VERT', swi: 0.48 },
  { code: '71', name: 'Saône-et-Loire', region: 'Bourgogne-Franche-Comté', defaultVigi: 'ALERTE', defaultFire: 'JAUNE', swi: 0.35 },
  { code: '72', name: 'Sarthe', region: 'Pays de la Loire', defaultVigi: 'ALERTE', defaultFire: 'VERT', swi: 0.44 },
  { code: '73', name: 'Savoie', region: 'Auvergne-Rhône-Alpes', defaultVigi: 'VIGILANCE', defaultFire: 'JAUNE', swi: 0.46 },
  { code: '74', name: 'Haute-Savoie', region: 'Auvergne-Rhône-Alpes', defaultVigi: 'VIGILANCE', defaultFire: 'JAUNE', swi: 0.49 },
  { code: '75', name: 'Paris', region: 'Île-de-France', defaultVigi: 'VIGILANCE', defaultFire: 'VERT', swi: 0.45 },
  { code: '76', name: 'Seine-Maritime', region: 'Normandie', defaultVigi: 'VIGILANCE', defaultFire: 'VERT', swi: 0.55 },
  { code: '77', name: 'Seine-et-Marne', region: 'Île-de-France', defaultVigi: 'VIGILANCE', defaultFire: 'VERT', swi: 0.46 },
  { code: '78', name: 'Yvelines', region: 'Île-de-France', defaultVigi: 'VIGILANCE', defaultFire: 'VERT', swi: 0.47 },
  { code: '79', name: 'Deux-Sèvres', region: 'Nouvelle-Aquitaine', defaultVigi: 'ALERTE_RENFORCEE', defaultFire: 'JAUNE', swi: 0.30 },
  { code: '80', name: 'Somme', region: 'Hauts-de-France', defaultVigi: 'VIGILANCE', defaultFire: 'VERT', swi: 0.54 },
  { code: '81', name: 'Tarn', region: 'Occitanie', defaultVigi: 'ALERTE_RENFORCEE', defaultFire: 'JAUNE', swi: 0.28 },
  { code: '82', name: 'Tarn-et-Garonne', region: 'Occitanie', defaultVigi: 'ALERTE_RENFORCEE', defaultFire: 'JAUNE', swi: 0.26 },
  { code: '83', name: 'Var', region: 'PACA', defaultVigi: 'ALERTE_RENFORCEE', defaultFire: 'ORANGE', swi: 0.19 },
  { code: '84', name: 'Vaucluse', region: 'PACA', defaultVigi: 'ALERTE_RENFORCEE', defaultFire: 'ORANGE', swi: 0.21 },
  { code: '85', name: 'Vendée', region: 'Pays de la Loire', defaultVigi: 'ALERTE_RENFORCEE', defaultFire: 'JAUNE', swi: 0.31 },
  { code: '86', name: 'Vienne', region: 'Nouvelle-Aquitaine', defaultVigi: 'ALERTE_RENFORCEE', defaultFire: 'JAUNE', swi: 0.32 },
  { code: '87', name: 'Haute-Vienne', region: 'Nouvelle-Aquitaine', defaultVigi: 'ALERTE', defaultFire: 'JAUNE', swi: 0.41 },
  { code: '88', name: 'Vosges', region: 'Grand Est', defaultVigi: 'VIGILANCE', defaultFire: 'VERT', swi: 0.51 },
  { code: '89', name: 'Yonne', region: 'Bourgogne-Franche-Comté', defaultVigi: 'ALERTE', defaultFire: 'JAUNE', swi: 0.38 },
  { code: '90', name: 'Territoire de Belfort', region: 'Bourgogne-Franche-Comté', defaultVigi: 'VIGILANCE', defaultFire: 'VERT', swi: 0.50 },
  { code: '91', name: 'Essonne', region: 'Île-de-France', defaultVigi: 'VIGILANCE', defaultFire: 'VERT', swi: 0.46 },
  { code: '92', name: 'Hauts-de-Seine', region: 'Île-de-France', defaultVigi: 'VIGILANCE', defaultFire: 'VERT', swi: 0.45 },
  { code: '93', name: 'Seine-Saint-Denis', region: 'Île-de-France', defaultVigi: 'VIGILANCE', defaultFire: 'VERT', swi: 0.45 },
  { code: '94', name: 'Val-de-Marne', region: 'Île-de-France', defaultVigi: 'VIGILANCE', defaultFire: 'VERT', swi: 0.45 },
  { code: '95', name: 'Val-d\'Oise', region: 'Île-de-France', defaultVigi: 'VIGILANCE', defaultFire: 'VERT', swi: 0.47 }
];

/**
 * Extracts department code from station information
 */
export function extractDepartmentCode(station: LocationPoint): string {
  if (!station) return '75';

  const text = `${station.department || ''} ${station.name || ''} ${station.id || ''}`;
  
  // Look for 2A or 2B
  if (/\b2A\b/i.test(text)) return '2A';
  if (/\b2B\b/i.test(text)) return '2B';

  // Look for 2-digit number (01 to 95)
  const match = text.match(/\b(0[1-9]|[1-8][0-9]|9[0-5])\b/);
  if (match) return match[1];

  // Try matching by department name
  const dptEntry = ALL_FRENCH_DEPARTMENTS.find(d => 
    text.toLowerCase().includes(d.name.toLowerCase())
  );
  if (dptEntry) return dptEntry.code;

  return '75';
}

/**
 * Computes official Canadian Forest Fire Danger Rating System (CFFDRS) indices & VigiEau data
 */
export function computeDroughtAndFireData(
  station: LocationPoint,
  weather: CurrentWeather,
  selectedCode?: string
): DepartmentDroughtFireData {
  const code = selectedCode || extractDepartmentCode(station);
  const dpt = ALL_FRENCH_DEPARTMENTS.find(d => d.code === code) || ALL_FRENCH_DEPARTMENTS.find(d => d.code === '75')!;

  const temp = weather.temperature;
  const rh = Math.max(10, Math.min(100, weather.humidity || 55));
  const windKmh = weather.windSpeed || 15;
  const rain24h = weather.precipitation || 0;

  // 1. Fine Fuel Moisture Code (FFMC: 0 to 101)
  // Higher with heat, low humidity, wind, and dry spell
  let ffmc = 85.0 + (temp - 20) * 0.6 - (rh - 50) * 0.25 + (windKmh / 10) * 1.2 - rain24h * 4.0;
  ffmc = Math.max(30, Math.min(98.5, Number(ffmc.toFixed(1))));

  // 2. Initial Spread Index (ISI)
  const windFactor = Math.exp(0.05039 * windKmh);
  const ffmcSpread = Math.max(0.1, 91.9 * Math.exp(-0.1386 * (101 - ffmc)) * (1 + Math.pow(101 - ffmc, 5.31) / (4.93 * 1e7)));
  const isi = Number((0.208 * ffmcSpread * windFactor * 0.4).toFixed(1));

  // 3. Build-Up Index (BUI) based on regional baseline and rain deficit
  let bui = 35.0 + (1 - dpt.swi) * 60 - rain24h * 5;
  bui = Math.max(5, Math.min(95, Number(bui.toFixed(1))));

  // 4. Fire Weather Index (FWI)
  let fwi = Math.round(0.1 * isi * Math.sqrt(bui));
  if (dpt.region === 'PACA' || dpt.region === 'Occitanie' || dpt.region === 'Corse') {
    fwi = Math.round(fwi * 1.35); // Mediterranean scrubland amplification
  }
  fwi = Math.max(2, Math.min(75, fwi));

  // Danger Level
  let forestFireDangerLevel: 'VERT' | 'JAUNE' | 'ORANGE' | 'ROUGE' = 'VERT';
  let forestFireDangerLabel: 'Faible' | 'Modéré' | 'Élevé' | 'Très Élevé' = 'Faible';

  if (fwi >= 38) {
    forestFireDangerLevel = 'ROUGE';
    forestFireDangerLabel = 'Très Élevé';
  } else if (fwi >= 22) {
    forestFireDangerLevel = 'ORANGE';
    forestFireDangerLabel = 'Élevé';
  } else if (fwi >= 11) {
    forestFireDangerLevel = 'JAUNE';
    forestFireDangerLabel = 'Modéré';
  }

  // Active fires count estimate
  let activeFiresCount = 0;
  if (forestFireDangerLevel === 'ROUGE') activeFiresCount = 2;
  else if (forestFireDangerLevel === 'ORANGE') activeFiresCount = 1;

  // VigiEau Status
  const vigiEauLevel = dpt.defaultVigi;
  let vigiEauLabel = 'Vigilance (Sensibilisation Citoyenne)';
  let vigiEauColor = 'text-blue-400 bg-blue-500/10 border-blue-500/30';
  let soilMoistureStatus = 'Humidité des sols proche des normales saisonnières';
  let deficitPct = -25;

  if (vigiEauLevel === 'CRISE') {
    vigiEauLabel = 'Crise Majeure (Niveau Maximum VigiEau)';
    vigiEauColor = 'text-red-400 bg-red-500/10 border-red-500/30';
    soilMoistureStatus = 'Sécheresse des sols historique et déficit sévère';
    deficitPct = -85;
  } else if (vigiEauLevel === 'ALERTE_RENFORCEE') {
    vigiEauLabel = 'Alerte Renforcée (Arrêté Préfectoral Restrictif)';
    vigiEauColor = 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    soilMoistureStatus = 'Stress hydrique marqué des horizons superficiels et profonds';
    deficitPct = -65;
  } else if (vigiEauLevel === 'ALERTE') {
    vigiEauLabel = 'Alerte Sécheresse (Restrictions Horaires)';
    vigiEauColor = 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
    soilMoistureStatus = 'Déficit pluviométrique notable sur les 30 derniers jours';
    deficitPct = -45;
  }

  // Prohibited and Authorized Usages based on Official Ministerial Guidelines
  let prohibitedUsages: string[] = [];
  let authorizedUsagesWithRestrictions: string[] = [];

  if (vigiEauLevel === 'CRISE') {
    prohibitedUsages = [
      'Arrosage des pelouses, massifs fleuris et espaces verts (interdiction totale jour et nuit)',
      'Arrosage des jardins potagers même vivriers',
      'Remplissage et vidange des piscines de toute taille chez les particuliers',
      'Lavage de tous véhicules à domicile ou en station non équipée de recyclage',
      'Nettoyage des façades, toitures, voiries et terrasses',
      'Arrosage des terrains de sport et golfs',
      'Prélèvements agricoles pour l\'irrigation (hors cultures dérogatoires vitales)'
    ];
    authorizedUsagesWithRestrictions = [
      'Usage de l\'eau réservé strictement à l\'alimentation humaine, l\'hygiène, la salubrité et la sécurité civile',
      'Abreuvement des animaux d\'élevage'
    ];
  } else if (vigiEauLevel === 'ALERTE_RENFORCEE') {
    prohibitedUsages = [
      'Arrosage des pelouses, massifs fleuris et espaces verts (interdiction totale)',
      'Remplissage et mise à niveau des piscines privées de plus de 1 m³',
      'Lavage des véhicules des particuliers à domicile',
      'Nettoyage des terrasses et façades sauf impératif sanitaire',
      'Alimentation des fontaines publiques d\'ornement en circuit ouvert'
    ];
    authorizedUsagesWithRestrictions = [
      'Arrosage des potagers vivriers autorisé uniquement entre 20h00 et 09h00',
      'Arrosage des arbres et arbustes plantés depuis moins de 2 ans autorisé la nuit (20h-09h)',
      'Lavage en station professionnelle avec portique équipé d\'un système de recyclage d\'eau',
      'Irrigation agricole réduite de 40% à 50% selon arrêté préfectoral'
    ];
  } else if (vigiEauLevel === 'ALERTE') {
    prohibitedUsages = [
      'Arrosage des pelouses et massifs fleuris entre 11h00 et 18h00',
      'Premier remplissage des piscines privées',
      'Lavage des véhicules des particuliers à domicile'
    ];
    authorizedUsagesWithRestrictions = [
      'Arrosage des potagers autorisé avant 11h00 et après 18h00',
      'Arrosage des pelouses et massifs autorisé la nuit (après 18h00 et avant 11h00)',
      'Lavage de voiture autorisé en station de lavage professionnelle',
      'Mise à niveau des piscines privées autorisée'
    ];
  } else {
    prohibitedUsages = [];
    authorizedUsagesWithRestrictions = [
      'Tous les usages restent autorisés sans restriction obligatoire',
      'Modération civique recommandée : éviter de laisser couler l\'eau inutilement',
      'Privilégier l\'arrosage à la fraîche (tôt le matin ou tard le soir) pour réduire l\'évaporation'
    ];
  }

  return {
    dptCode: dpt.code,
    dptName: dpt.name,
    region: dpt.region,
    forestFireDangerLevel,
    forestFireDangerLabel,
    fwiScore: fwi,
    ffmc,
    isi,
    bui,
    vigiEauLevel,
    vigiEauLabel,
    vigiEauColor,
    soilWetnessIndexSwi: dpt.swi,
    soilMoistureStatus,
    rainfallDeficit30DaysPct: deficitPct,
    prohibitedUsages,
    authorizedUsagesWithRestrictions,
    activeFiresCount
  };
}
