import { FRENCH_REGIONS_CATALOG, PrefectureOrSousPrefecture } from '../data/frenchPrefecturesCatalog';
import { FRENCH_STATIONS } from '../data/frenchStations';
import { RAW_MOUNTAIN_VILLAGES } from '../data/mountainVillagesRaw';

export interface CanonicalFrenchCity {
  slug: string;
  path: string;
  cityName: string;
  postalCode: string;
  stationId: string;
  deptCode: string;
  department: string;
  region: string;
  latitude: number;
  longitude: number;
  altitude: number;
  climateZone: string;
  recordMax: number;
  recordMin: number;
  recordRain24h: number;
  microclimaticTrait?: string;
  localWind?: string;
  elevationStage?: string;
  massif?: string;
  isMountain?: boolean;
  isMajorMetro?: boolean;
}

export interface MajorCitySeoConfig {
  slug: string;
  path: string;
  cityName: string;
  postalCode?: string;
  stationId: string;
  deptCode: string;
  department: string;
  region: string;
  latitude?: number;
  longitude?: number;
  altitude: number;
  climateZone: string;
  recordMax: number;
  recordMin: number;
  recordRain24h: number;
  microclimaticTrait?: string;
  localWind?: string;
  elevationStage?: string;
  massif?: string;
}

export const MAJOR_FRENCH_CITY_SEO_LIST: MajorCitySeoConfig[] = [
  {
    slug: 'paris',
    path: '/paris',
    cityName: 'Paris',
    postalCode: '75000',
    stationId: 'paris-montsouris',
    deptCode: '75',
    department: '75 - Paris',
    region: 'Île-de-France',
    latitude: 48.8566,
    longitude: 2.3522,
    altitude: 75,
    climateZone: 'Océanique dégradé / Îlot de chaleur urbain',
    recordMax: 42.6,
    recordMin: -23.9,
    recordRain24h: 104.2,
    microclimaticTrait: 'Îlot de chaleur urbain dense (ICU) maintenant des températures nocturnes plus douces qu’en grande couronne',
    localWind: 'Flux d’Ouest modéré canalisé dans le bassin de la Seine',
    elevationStage: 'Plaine alluviale de la Seine',
  },
  {
    slug: 'marseille',
    path: '/marseille',
    cityName: 'Marseille',
    postalCode: '13000',
    stationId: 'marseille-marignane',
    deptCode: '13',
    department: '13 - Bouches-du-Rhône',
    region: "Provence-Alpes-Côte d'Azur",
    latitude: 43.2965,
    longitude: 5.3698,
    altitude: 36,
    climateZone: 'Méditerranéen franc (Mistral)',
    recordMax: 40.2,
    recordMin: -16.8,
    recordRain24h: 196.4,
    microclimaticTrait: 'Façade littorale méditerranéenne très ensoleillée, assèchement rapide par le Mistral et brises thermiques estivales',
    localWind: 'Mistral de Nord-Nord-Ouest pouvant dépasser 90 km/h',
    elevationStage: 'Littoral méditerranéen & calanques',
  },
  {
    slug: 'lyon',
    path: '/lyon',
    cityName: 'Lyon',
    postalCode: '69000',
    stationId: 'lyon-bron',
    deptCode: '69',
    department: '69 - Rhône',
    region: 'Auvergne-Rhône-Alpes',
    latitude: 45.764,
    longitude: 4.8357,
    altitude: 201,
    climateZone: 'Semi-continental à influences méridionales',
    recordMax: 41.4,
    recordMin: -24.6,
    recordRain24h: 106.0,
    microclimaticTrait: 'Confluence Rhône-Saône sujette aux brouillards d’inversion en hiver et aux remontées chaudes de la vallée du Rhône en été',
    localWind: 'Vent du Sud accéléré dans le couloir rhodanien et bise de Nord',
    elevationStage: 'Plaine alluviale Rhône-Saône',
  },
  {
    slug: 'toulouse',
    path: '/toulouse',
    cityName: 'Toulouse',
    postalCode: '31000',
    stationId: 'toulouse-blagnac',
    deptCode: '31',
    department: '31 - Haute-Garonne',
    region: 'Occitanie',
    latitude: 43.6047,
    longitude: 1.4442,
    altitude: 151,
    climateZone: "Océanique altéré / Aquitain chaud (Vent d'Autan)",
    recordMax: 42.4,
    recordMin: -19.2,
    recordRain24h: 82.7,
    microclimaticTrait: 'Plaine garonnaise soumise au contraste entre flux océanique humide d’Ouest et vent d’Autan sec et turbulent de Sud-Est',
    localWind: "Vent d'Autan débouchant du seuil du Lauragais",
    elevationStage: 'Plaine de la Garonne',
  },
  {
    slug: 'nice',
    path: '/nice',
    cityName: 'Nice',
    postalCode: '06000',
    stationId: 'nice-cote-dazur',
    deptCode: '06',
    department: '06 - Alpes-Maritimes',
    region: "Provence-Alpes-Côte d'Azur",
    latitude: 43.7102,
    longitude: 7.262,
    altitude: 4,
    climateZone: 'Méditerranéen maritime doux',
    recordMax: 37.7,
    recordMin: -7.2,
    recordRain24h: 191.0,
    microclimaticTrait: 'Baie des Anges naturellement abritée du Mistral par les Préalpes de Grasse, offrant une grande douceur hivernale',
    localWind: 'Brises côtières alternées terre-mer et flux d’Est méditerranéen',
    elevationStage: 'Littoral abrité de la Côte d’Azur',
  },
  {
    slug: 'nantes',
    path: '/nantes',
    cityName: 'Nantes',
    postalCode: '44000',
    stationId: 'nantes-atlantique',
    deptCode: '44',
    department: '44 - Loire-Atlantique',
    region: 'Pays de la Loire',
    latitude: 47.2184,
    longitude: -1.5536,
    altitude: 26,
    climateZone: 'Océanique franc tempéré',
    recordMax: 42.0,
    recordMin: -15.6,
    recordRain24h: 94.9,
    microclimaticTrait: 'Estuaire de la Loire ouvert aux perturbations atlantiques adoucies par la proximité de l’océan',
    localWind: 'Flux océanique d’Ouest à Sud-Ouest régulier',
    elevationStage: 'Estuaire alluvionnaire ligérien',
  },
  {
    slug: 'montpellier',
    path: '/montpellier',
    cityName: 'Montpellier',
    postalCode: '34000',
    stationId: 'montpellier-frejorgues',
    deptCode: '34',
    department: '34 - Hérault',
    region: 'Occitanie',
    latitude: 43.6108,
    longitude: 3.8767,
    altitude: 2,
    climateZone: 'Méditerranéen languedocien (Épisodes cévenols)',
    recordMax: 43.5,
    recordMin: -17.8,
    recordRain24h: 299.5,
    microclimaticTrait: 'Plaine littorale languedocienne exposée aux fortes chaleurs d’été et aux épisodes méditerranéens automnaux',
    localWind: 'Marin humide de Sud-Est et Tramontane sèche de Nord-Ouest',
    elevationStage: 'Littoral & plaine languedocienne',
  },
  {
    slug: 'strasbourg',
    path: '/strasbourg',
    cityName: 'Strasbourg',
    postalCode: '67000',
    stationId: 'strasbourg-entzheim',
    deptCode: '67',
    department: '67 - Bas-Rhin',
    region: 'Grand Est',
    latitude: 48.5734,
    longitude: 7.7521,
    altitude: 153,
    climateZone: "Semi-continental d'abri rhénan",
    recordMax: 38.9,
    recordMin: -23.6,
    recordRain24h: 68.4,
    microclimaticTrait: 'Plaine d’Alsace protégée des pluies océaniques par les Vosges, marquée par de fortes amplitudes saisonnières',
    localWind: 'Bise continentale de Nord-Est et effet de foehn sous les Vosges',
    elevationStage: 'Fossé rhénan',
  },
  {
    slug: 'bordeaux',
    path: '/bordeaux',
    cityName: 'Bordeaux',
    postalCode: '33000',
    stationId: 'bordeaux-merignac',
    deptCode: '33',
    department: '33 - Gironde',
    region: 'Nouvelle-Aquitaine',
    latitude: 44.8378,
    longitude: -0.5792,
    altitude: 47,
    climateZone: 'Océanique aquitain doux et humide',
    recordMax: 41.2,
    recordMin: -16.4,
    recordRain24h: 111.4,
    microclimaticTrait: 'Estuaire de la Gironde tempéré par l’Atlantique, soumis en été aux dégradations orageuses remontant du golfe de Gascogne',
    localWind: 'Flux d’Ouest atlantique dominant',
    elevationStage: 'Plaine alluviale de la Garonne',
  },
  {
    slug: 'lille',
    path: '/lille',
    cityName: 'Lille',
    postalCode: '59000',
    stationId: 'lille-lesquin',
    deptCode: '59',
    department: '59 - Nord',
    region: 'Hauts-de-France',
    latitude: 50.6292,
    longitude: 3.0573,
    altitude: 47,
    climateZone: 'Océanique flamand frais',
    recordMax: 41.5,
    recordMin: -19.5,
    recordRain24h: 64.0,
    microclimaticTrait: 'Plaine flamande ouverte aux courants maritimes de la Manche et de la mer du Nord, ciel changeant',
    localWind: 'Vent d’Ouest-Sud-Ouest modéré à soutenu',
    elevationStage: 'Plaine flamande',
  },
];

export const RESERVED_ROUTE_SLUGS = new Set<string>([
  'direct',
  'radar',
  'vigilances',
  'vigilance',
  'nuages',
  'nuage',
  '14-jours',
  'tendance-14-jours',
  'climat',
  'montagne-plages-nature',
  'montagne',
  'plages',
  'plage',
  'secheresse-incendie',
  'vigi-secheresse-incendie',
  'cours-d-eau',
  'cartes-thematiques',
  'cartes',
  'sports',
  'sport',
  'route',
  'trajets',
  'bulletins',
  'bulletin',
  'archives',
  'archive',
  'monde-catastrophes',
  'monde',
  'catastrophes',
  'communaute',
  'competition',
  'skymap',
  'skymap3d',
  'carte-3d',
  'ciel-3d',
  'api',
  'health',
  'en',
  'fr',
  'accueil',
  'home',
  'webcams',
  'webcam',
  'modeles',
  'modele',
  'modeles-meteo',
  'radar-pluie',
  'radar-meteo',
  'meteo-en-direct',
  'temps-reel',
  'alertes',
  'satellite',
  'nephologie',
  'previsions',
  'previsions-14-jours',
  'previsions-15-jours',
  'previsions-meteo',
  'tendances',
  'neige',
  'ski',
  'meteo-montagne',
  'littoral',
  'mer',
  'marees',
  'meteo-des-plages',
  'secheresse',
  'incendie',
  'feux',
  'qualite-air',
  'vigicrues',
  'crues',
  'rivieres',
  'carte-france',
  'comparateur',
  '4-semaines',
  'methodologie',
  'historique',
  'histoire',
  'records',
  'normales',
  'saisonnier',
  '8-mois',
  'evolution-climatique',
  'observations',
  'forum',
  'quiz',
  'jeu',
  'jeu-meteo',
  'paratonnerre',
  'robots.txt',
  'sitemap.xml',
  'sitemap-pages.xml',
  'manifest.json',
  'manifest.webmanifest',
  'version.json',
  'ads.txt',
  'service-worker.js',
]);

const VALID_FRENCH_DEPT_REGEX = /^(0[1-9]|[1-8]\d|9[0-5]|2[AB]|97[1-8]|98[78])\b/i;

export function slugifyCityName(input: string): string {
  return (input || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/['’]/g, '-')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
}

export function cleanLocalityTitleName(rawName: string): string {
  if (!rawName) return '';
  return rawName
    .split(/\s*\(/)[0]
    .split(/\s+—\s+/)[0]
    .split(/\s+\/\s+/)[0]
    .trim();
}

function extractValidFrenchDeptCode(department?: string, postalCode?: string): string | null {
  if (department) {
    const m = department.trim().match(VALID_FRENCH_DEPT_REGEX);
    if (m) {
      return m[1].toUpperCase();
    }
  }
  if (postalCode && /^\d{5}$/.test(postalCode.trim())) {
    const p = postalCode.trim();
    if (p.startsWith('20')) {
      return Number(p) >= 20200 ? '2B' : '2A';
    }
    if (p.startsWith('97') || p.startsWith('98')) {
      const code3 = p.slice(0, 3);
      if (VALID_FRENCH_DEPT_REGEX.test(code3)) return code3;
    }
    const code2 = p.slice(0, 2);
    if (VALID_FRENCH_DEPT_REGEX.test(code2)) return code2;
  }
  return null;
}

function defaultPostalForDept(deptCode: string, explicitPostal?: string): string {
  if (explicitPostal && /^\d{5}$/.test(explicitPostal.trim())) {
    return explicitPostal.trim();
  }
  if (deptCode === '2A') return '20000';
  if (deptCode === '2B') return '20200';
  if (deptCode.length === 3) return `${deptCode}00`;
  return `${deptCode}000`;
}

function buildCatalog(): {
  cities: CanonicalFrenchCity[];
  bySlug: Record<string, CanonicalFrenchCity>;
  byStationId: Record<string, CanonicalFrenchCity>;
  byDept: Record<string, CanonicalFrenchCity[]>;
  aliases: Record<string, string>;
} {
  const cities: CanonicalFrenchCity[] = [];
  const bySlug: Record<string, CanonicalFrenchCity> = {};
  const byStationId: Record<string, CanonicalFrenchCity> = {};
  const byDept: Record<string, CanonicalFrenchCity[]> = {};
  const aliases: Record<string, string> = {};

  const stationById = new Map(FRENCH_STATIONS.map((s) => [s.id, s]));
  const prefMetaByName = new Map<string, PrefectureOrSousPrefecture>();
  for (const reg of FRENCH_REGIONS_CATALOG) {
    for (const loc of reg.localities) {
      const clean = cleanLocalityTitleName(loc.name).toLowerCase();
      if (clean) prefMetaByName.set(clean, loc);
    }
  }

  const registerCity = (city: CanonicalFrenchCity, extraStationIds: string[] = []) => {
    if (!city.slug || RESERVED_ROUTE_SLUGS.has(city.slug) || bySlug[city.slug]) {
      return false;
    }
    cities.push(city);
    bySlug[city.slug] = city;
    if (city.stationId && !byStationId[city.stationId]) {
      byStationId[city.stationId] = city;
    }
    for (const sid of extraStationIds) {
      if (sid && !byStationId[sid]) {
        byStationId[sid] = city;
      }
    }
    if (!byDept[city.deptCode]) {
      byDept[city.deptCode] = [];
    }
    byDept[city.deptCode].push(city);

    aliases[`/meteo-${city.slug}`] = city.path;
    if (city.postalCode) {
      aliases[`/${city.slug}-${city.postalCode}`] = city.path;
      aliases[`/meteo-${city.slug}-${city.postalCode}`] = city.path;
    }
    return true;
  };

  // 1. Les 10 grandes métropoles prioritaires
  for (const major of MAJOR_FRENCH_CITY_SEO_LIST) {
    const st = stationById.get(major.stationId);
    const postalCode = major.postalCode || defaultPostalForDept(major.deptCode, st?.postalCode);
    registerCity(
      {
        slug: major.slug,
        path: major.path,
        cityName: major.cityName,
        postalCode,
        stationId: major.stationId,
        deptCode: major.deptCode,
        department: major.department,
        region: major.region,
        latitude: major.latitude ?? st?.latitude ?? 48.8566,
        longitude: major.longitude ?? st?.longitude ?? 2.3522,
        altitude: major.altitude,
        climateZone: major.climateZone,
        recordMax: major.recordMax,
        recordMin: major.recordMin,
        recordRain24h: major.recordRain24h,
        microclimaticTrait: major.microclimaticTrait,
        localWind: major.localWind,
        elevationStage: major.elevationStage,
        isMajorMetro: true,
      },
      [major.slug]
    );
  }

  // 2. Préfectures et sous-préfectures officielles
  for (const reg of FRENCH_REGIONS_CATALOG) {
    for (const loc of reg.localities) {
      const deptCode = extractValidFrenchDeptCode(loc.departmentCode);
      if (!deptCode) continue;
      const cleanName = cleanLocalityTitleName(loc.name);
      const slug = slugifyCityName(cleanName);
      if (!slug || RESERVED_ROUTE_SLUGS.has(slug)) continue;

      if (bySlug[slug]) {
        // Enrichit si déjà enregistré sans trait microclimatique
        if (!bySlug[slug].microclimaticTrait) bySlug[slug].microclimaticTrait = loc.microclimaticTrait;
        if (!bySlug[slug].localWind) bySlug[slug].localWind = loc.localWind;
        if (!bySlug[slug].elevationStage) bySlug[slug].elevationStage = loc.elevationStage;
        continue;
      }

      const matchingStation = FRENCH_STATIONS.find(
        (s) => s.isFrench && (s.id === slug || slugifyCityName(cleanLocalityTitleName(s.name)) === slug)
      );

      registerCity({
        slug,
        path: `/${slug}`,
        cityName: cleanName,
        postalCode: defaultPostalForDept(deptCode, matchingStation?.postalCode),
        stationId: matchingStation?.id || loc.id,
        deptCode,
        department: `${deptCode} - ${loc.departmentName}`,
        region: loc.region,
        latitude: matchingStation?.latitude ?? loc.latitude,
        longitude: matchingStation?.longitude ?? loc.longitude,
        altitude: matchingStation?.altitude ?? loc.altitude,
        climateZone: matchingStation?.climateZone || `${loc.elevationStage} (${loc.region})`,
        recordMax: matchingStation?.allTimeRecordMax ?? 40.2,
        recordMin: matchingStation?.allTimeRecordMin ?? -18.5,
        recordRain24h: matchingStation?.allTimeRecordRain24h ?? 95.0,
        microclimaticTrait: loc.microclimaticTrait,
        localWind: loc.localWind,
        elevationStage: loc.elevationStage,
      });
    }
  }

  // 3. Stations françaises officielles (FRENCH_STATIONS)
  for (const st of FRENCH_STATIONS) {
    if (!st.isFrench) continue;
    const deptCode = extractValidFrenchDeptCode(st.department, st.postalCode);
    if (!deptCode) continue;

    // Éviter de dupliquer les stations de référence des 10 métropoles déjà mappées
    if (byStationId[st.id]) continue;

    const cleanName = cleanLocalityTitleName(st.name);
    const slug = slugifyCityName(cleanName);
    if (!slug || RESERVED_ROUTE_SLUGS.has(slug)) continue;

    const prefMeta = prefMetaByName.get(cleanName.toLowerCase());
    if (bySlug[slug]) {
      if (!byStationId[st.id]) {
        byStationId[st.id] = bySlug[slug];
      }
      continue;
    }

    // Ne pas créer un doublon d'aéroport/quartier si le préfixe exact correspond à une grande ville (ex: Lyon-Saint-Exupéry -> alias vers Lyon déjà couvert ou propre page ? On garde si nom distinct de ville ou commune comme Orly)
    registerCity({
      slug,
      path: `/${slug}`,
      cityName: cleanName,
      postalCode: defaultPostalForDept(deptCode, st.postalCode),
      stationId: st.id,
      deptCode,
      department: st.department || `${deptCode}`,
      region: st.region || 'France',
      latitude: st.latitude,
      longitude: st.longitude,
      altitude: st.altitude,
      climateZone: st.climateZone || 'Tempéré français',
      recordMax: st.allTimeRecordMax ?? 40.0,
      recordMin: st.allTimeRecordMin ?? -18.0,
      recordRain24h: st.allTimeRecordRain24h ?? 90.0,
      microclimaticTrait: prefMeta?.microclimaticTrait,
      localWind: prefMeta?.localWind,
      elevationStage: prefMeta?.elevationStage || (st.altitude >= 600 ? 'Étage montagnard' : undefined),
    });
  }

  // 4. Villages & stations de montagne françaises (RAW_MOUNTAIN_VILLAGES)
  for (const mv of RAW_MOUNTAIN_VILLAGES) {
    if (mv.country && mv.country !== 'France') continue;
    const deptCode = extractValidFrenchDeptCode(mv.dept, mv.postal);
    if (!deptCode) continue;

    const cleanName = cleanLocalityTitleName(mv.name);
    const slug = slugifyCityName(cleanName);
    if (!slug || RESERVED_ROUTE_SLUGS.has(slug)) continue;

    if (bySlug[slug]) {
      if (!bySlug[slug].massif) bySlug[slug].massif = mv.massif;
      if (!byStationId[mv.id]) byStationId[mv.id] = bySlug[slug];
      continue;
    }

    registerCity({
      slug,
      path: `/${slug}`,
      cityName: cleanName,
      postalCode: defaultPostalForDept(deptCode, mv.postal),
      stationId: mv.id,
      deptCode,
      department: mv.dept,
      region: mv.region,
      latitude: mv.lat,
      longitude: mv.lon,
      altitude: mv.alt,
      climateZone: `Montagnard — ${mv.massif}`,
      recordMax: mv.alt >= 1800 ? 26.5 : mv.alt >= 1200 ? 32.0 : 36.5,
      recordMin: mv.alt >= 1800 ? -32.0 : mv.alt >= 1200 ? -27.5 : -23.0,
      recordRain24h: 135,
      massif: mv.massif,
      elevationStage: mv.alt >= 1800 ? 'Étage alpin' : mv.alt >= 1200 ? 'Étage subalpin' : 'Étage montagnard',
      isMountain: true,
    });
  }

  return { cities, bySlug, byStationId, byDept, aliases };
}

const BUILT = buildCatalog();

export const FRENCH_CITY_CATALOG_LIST: CanonicalFrenchCity[] = BUILT.cities;
export const FRENCH_CITY_BY_SLUG: Record<string, CanonicalFrenchCity> = BUILT.bySlug;
export const FRENCH_CITY_BY_STATION_ID: Record<string, CanonicalFrenchCity> = BUILT.byStationId;
export const FRENCH_CITIES_BY_DEPT: Record<string, CanonicalFrenchCity[]> = BUILT.byDept;
export const ALL_CITY_URL_ALIASES: Record<string, string> = BUILT.aliases;

export function getAvailableSitemapDepartmentCodes(): string[] {
  return Object.keys(FRENCH_CITIES_BY_DEPT).sort((a, b) => a.localeCompare(b, 'fr'));
}

export function findCatalogCityBySlug(rawSlug: string): CanonicalFrenchCity | null {
  const clean = slugifyCityName(rawSlug);
  if (!clean) return null;
  if (FRENCH_CITY_BY_SLUG[clean]) return FRENCH_CITY_BY_SLUG[clean];
  // Support direct alias resolution (ex: /paris-75000 -> paris, /meteo-lyon -> lyon)
  const asPath = `/${clean}`;
  const targetPath = ALL_CITY_URL_ALIASES[asPath];
  if (targetPath) {
    return FRENCH_CITY_BY_SLUG[targetPath.slice(1)] || null;
  }
  return null;
}
