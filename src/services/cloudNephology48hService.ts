import { LocationPoint, CurrentWeather, HourlyForecast } from '../types/weather';
import { 
  getIsothermComprehensiveDiagnostic, 
  probeAltitudePrecipitationPhase,
  AltitudePrecipitationProbeResult
} from '../utils/isothermCalculations';

export interface CloudLayerSlice {
  coverPct: number;
  octas: number;
  baseMeters: number;
  topMeters: number;
  thicknessMeters: number;
  dominantGenus: string;
  dominantGenusLatin: string;
  dominantSpecies: string;
  microphysicsPhase: 'Eau liquide tiède' | 'Gouttelettes surfondues' | 'Mixte eau/glace' | 'Cristaux de glace purs';
  metarCode: string;
  description: string;
}

export interface CloudHourlyDetailed48h {
  hourIndex: number; // 0 to 47
  hourOffset: number;
  timestamp: string;
  hourLabel: string; // "14h"
  timeString: string; // "14:00"
  dayOffset: number; // 0 = today, 1 = tomorrow, 2 = day after
  dayLabel: string; // "Aujourd'hui", "Demain", "Après-demain"
  dayOfWeek: string; // "Lun", "Mar"
  fullDate: string; // "Lundi 17 Août"
  isNight: boolean;
  
  // Thermodynamic variables
  temperature: number;
  dewPoint: number;
  humidity: number;
  pressureHpa: number;
  
  // Total coverage & Octas
  totalCloudCoverPct: number;
  totalCloudCoverOctas: number; // 0 to 8
  octasLabel: string; // "3/8 Éclaircies"
  cloudDensityCategory: 'CIEL_SEREIN' | 'PEU_NUAGEUX' | 'ÉCLAIRCIES' | 'TRÈS_NUAGEUX' | 'COUVERT_TOTAL';
  
  // 3-Tier Layer Sounding Slices
  lowCloud: CloudLayerSlice;
  midCloud: CloudLayerSlice;
  highCloud: CloudLayerSlice;
  
  // Convective Activity
  isConvective: boolean;
  convectiveStage: 'AUCUN' | 'CUMULUS_HUMILIS' | 'CUMULUS_CONGESTUS' | 'CUMULONIMBUS_CALVUS' | 'CUMULONIMBUS_CAPILLATUS_INCUS';
  convectiveBaseMeters: number;
  convectiveTopMeters: number;
  convectiveUpdraftMs: number;
  convectiveAnvilPresent: boolean;
  
  // Aviation & Mountaineering Vertical Profiling
  ceilingMeters: number; // Plafond nuageux (base de la première couche >= 5/8 octas)
  ceilingFeet: number;
  ceilingStatus: 'ILLIMITÉ' | 'ÉLEVÉ (> 2000m)' | 'MOYEN (600-2000m)' | 'BAS (200-600m)' | 'TRÈS BAS (< 200m / Plafond critique)';
  totalCloudThicknessMeters: number;
  cloudTopMaxMeters: number;
  cloudTopTempC: number;
  
  // Atmospheric Microphysics & Optics
  isotherm0Meters: number;
  wetBulbZeroMeters: number;
  snowRainLimitMeters: number;
  groundSnowLimitMeters: number;
  isothermieRisk: boolean;
  isothermieDropMeters: number;
  meltingLayerThicknessMeters: number;
  precipitationPhaseAtStation: string;
  cloudBaseVsLpnRelation: string;
  
  icingRiskLevel: 'NUL' | 'FAIBLE' | 'MODÉRÉ' | 'SÉVÈRE';
  icingAltitudeRange: string;
  opticalThickness: 'Nulle' | 'Mince (Voile transparent)' | 'Moyenne (Soleil tamisé)' | 'Épaisse (Sombre)';
  directSolarTransmissionPct: number; // 0 to 100%
  diffuseSkyLightPct: number;
  skyLuminanceCategory: string;
  photometeorPossibility: string;
  
  // Summary & METAR
  skyDescription: string;
  primaryWmoEmoji: string;
  syntheticMetarGroup: string;
  wmoCode: number;
}

export interface CloudGenusAtlasItem {
  id: string;
  latinName: string;
  frenchName: string;
  abbreviation: string;
  family: 'BAS' | 'MOYEN' | 'HAUT' | 'CONVECTIF';
  typicalBaseMeters: string;
  typicalTopMeters: string;
  composition: string;
  precipitationType: string;
  significance: string;
  aviationHazard: string;
  iconEmoji: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  varieties: string[];
  visualDescription: string;
}

export interface CloudSpeciesAtlasItem {
  nameLatin: string;
  nameFrench: string;
  applicableGenera: string[];
  characteristic: string;
  synopticMeaning: string;
  identifyingFeature: string;
}

export interface CloudSupplementaryFeature {
  nameLatin: string;
  nameFrench: string;
  meaning: string;
  dangerLevel: 'Nul' | 'Faible' | 'Modéré' | 'Élevé' | 'Extrême';
  meteorologicalCause: string;
}

export interface Cloud48hSynthesisDigest {
  stationName: string;
  stationAltitude: number;
  generatedAt: string;
  hourly48h: CloudHourlyDetailed48h[];
  
  // Summary statistics across 48h
  averageCover48hPct: number;
  maxCover48hPct: number;
  minCover48hPct: number;
  clearSkyHoursCount: number;
  overcastHoursCount: number;
  lowestCeilingMeters: number;
  lowestCeilingHourLabel: string;
  highestCloudTopMeters: number;
  
  // Critical warnings
  hasLowCeilingAlert: boolean;
  lowCeilingAlertTimeRange: string | null;
  hasIcingAlert: boolean;
  icingAlertTimeRange: string | null;
  hasConvectiveThreat: boolean;
  convectiveThreatTimeRange: string | null;
  hasMountainObscurationThreat: boolean;
  
  // Dominant sky regime
  dominantRegime48h: string;
  photometeorOpportunities: string[];
  aviationSummaryText: string;
}

export const CLOUD_GENERA_ATLAS: CloudGenusAtlasItem[] = [
  {
    id: 'Ci',
    latinName: 'Cirrus',
    frenchName: 'Cirrus',
    abbreviation: 'Ci',
    family: 'HAUT',
    typicalBaseMeters: '6 000 à 10 000 m',
    typicalTopMeters: '8 000 à 12 000 m',
    composition: 'Cristaux de glace microscopiques purs',
    precipitationType: 'Aucune précipitation atteignant le sol (Virga glacée en haute altitude)',
    significance: 'Signe avant-coureur de l\'arrivée d\'un front chaud dans les 24 à 48h (têtes de réseau synoptique) ou queue de traîne de jet-stream.',
    aviationHazard: 'Nul au sol, possible givrage léger en haute altitude (FL250+), traînées de condensation persistantes.',
    iconEmoji: '☁️✨',
    badgeBg: 'bg-sky-500/10',
    badgeText: 'text-sky-300',
    badgeBorder: 'border-sky-500/30',
    varieties: ['fibratus', 'uncinus', 'spissatus', 'castellanus', 'floccus'],
    visualDescription: 'Nuages séparés en forme de filaments blancs et soyeux, ou de bandes étroites. Aspect fibreux ou éclat soyeux.'
  },
  {
    id: 'Cc',
    latinName: 'Cirrocumulus',
    frenchName: 'Cirrocumulus',
    abbreviation: 'Cc',
    family: 'HAUT',
    typicalBaseMeters: '6 000 à 9 000 m',
    typicalTopMeters: '7 000 à 10 000 m',
    composition: 'Cristaux de glace et fines gouttelettes en surfusion métastables',
    precipitationType: 'Aucune précipitation au sol',
    significance: 'Témoin d\'une onde atmosphérique ou d\'une instabilité convective en haute troposphère ("ciel moutonné").',
    aviationHazard: 'Turbulences légères à modérées en altitude.',
    iconEmoji: '🫧⛅',
    badgeBg: 'bg-cyan-500/10',
    badgeText: 'text-cyan-300',
    badgeBorder: 'border-cyan-500/30',
    varieties: ['stratiformis', 'lenticularis', 'castellanus', 'floccus', 'undulatus'],
    visualDescription: 'Nappe ou couche mince de nuages blancs sans ombres propres, composés de très petits éléments en granules ou rides régulières.'
  },
  {
    id: 'Cs',
    latinName: 'Cirrostratus',
    frenchName: 'Cirrostratus',
    abbreviation: 'Cs',
    family: 'HAUT',
    typicalBaseMeters: '6 000 à 8 500 m',
    typicalTopMeters: '8 000 à 11 000 m',
    composition: 'Cristaux de glace fins à symétrie hexagonale',
    precipitationType: 'Aucune précipitation au sol',
    significance: 'Voile régulier précédant la perturbation active. Générateur typique des photométéores (Halo de 22° et 46° autour du soleil et de la lune).',
    aviationHazard: 'Givrage très faible, visibilité oblique réduite en vol de croisière.',
    iconEmoji: '🌫️☀️',
    badgeBg: 'bg-indigo-500/10',
    badgeText: 'text-indigo-300',
    badgeBorder: 'border-indigo-500/30',
    varieties: ['fibratus', 'nebulosus', 'duplicatus', 'undulatus'],
    visualDescription: 'Voile nuageux transparent et blanchâtre, d\'aspect fibreux ou lisse, couvrant entièrement ou partiellement le ciel.'
  },
  {
    id: 'Ac',
    latinName: 'Altocumulus',
    frenchName: 'Altocumulus',
    abbreviation: 'Ac',
    family: 'MOYEN',
    typicalBaseMeters: '2 000 à 5 500 m',
    typicalTopMeters: '3 500 à 7 000 m',
    composition: 'Gouttelettes d\'eau liquide surfondue, parfois cristaux de glace',
    precipitationType: 'Virga fréquente, rares pluies faibles ou neige en montagne',
    significance: 'Indicateur majeur d\'instabilité à l\'étage moyen (notamment les castellanus annonciateurs d\'orages pré-frontaux) ou effet d\'onde de relief (lenticularis).',
    aviationHazard: 'Givrage modéré en traversée de couche, turbulences sous nuages d\'onde.',
    iconEmoji: '⛅☁️',
    badgeBg: 'bg-blue-500/10',
    badgeText: 'text-blue-300',
    badgeBorder: 'border-blue-500/30',
    varieties: ['stratiformis', 'lenticularis', 'castellanus', 'floccus', 'undulatus', 'lacunosus'],
    visualDescription: 'Banc, nappe ou couche de nuages blancs ou gris, ayant généralement des ombres propres, composés de lamelles ou galets.'
  },
  {
    id: 'As',
    latinName: 'Altostratus',
    frenchName: 'Altostratus',
    abbreviation: 'As',
    family: 'MOYEN',
    typicalBaseMeters: '2 500 à 5 000 m',
    typicalTopMeters: '4 000 à 7 500 m',
    composition: 'Mélange de gouttelettes d\'eau surfondue et de cristaux de glace/flocons',
    precipitationType: 'Pluie continue faible à modérée ou neige continue en hiver',
    significance: 'Corps principal du front chaud (nappe épaisse atténuant le soleil comme à travers un verre dépoli).',
    aviationHazard: 'Givrage modéré à fort, visibilité nulle en couche.',
    iconEmoji: '🌥️🌧️',
    badgeBg: 'bg-slate-500/10',
    badgeText: 'text-slate-300',
    badgeBorder: 'border-slate-500/30',
    varieties: ['translucidus', 'opacus', 'duplicatus', 'radiatus'],
    visualDescription: 'Nappe ou couche nuageuse grisâtre ou noirâtre, d\'aspect uniforme, strié ou fibreux, couvrant de grandes étendues de ciel.'
  },
  {
    id: 'Ns',
    latinName: 'Nimbostratus',
    frenchName: 'Nimbostratus',
    abbreviation: 'Ns',
    family: 'MOYEN',
    typicalBaseMeters: '600 à 2 000 m',
    typicalTopMeters: '3 500 à 6 000 m',
    composition: 'Gouttes de pluie, flocons de neige et cristaux denses sur une très forte épaisseur (2000-4000m)',
    precipitationType: 'Précipitations continues, régulières et durables (pluie battante ou neige abondante)',
    significance: 'Cœur actif de la perturbation cyclonique synoptique.',
    aviationHazard: 'Plafond bas, visibilité nulle, fort givrage dans la masse, turbulences thermiques modérées.',
    iconEmoji: '🌧️☔',
    badgeBg: 'bg-blue-600/20',
    badgeText: 'text-blue-200',
    badgeBorder: 'border-blue-500/40',
    varieties: ['pannus', 'praecipitatio', 'virga'],
    visualDescription: 'Couche nuageuse grise, souvent sombre, dont l\'aspect est rendu flou par les précipitations continues de pluie ou de neige.'
  },
  {
    id: 'Sc',
    latinName: 'Stratocumulus',
    frenchName: 'Stratocumulus',
    abbreviation: 'Sc',
    family: 'BAS',
    typicalBaseMeters: '500 à 1 800 m',
    typicalTopMeters: '1 200 à 2 500 m',
    composition: 'Gouttelettes d\'eau liquide, parfois neige roulée ou bruine',
    precipitationType: 'Bruine, bruine verglaçante, pluie faible intermittente ou neige en grains',
    significance: 'Nuage le plus fréquent de la planète. Typique des mers de nuages sous inversion anticyclonique ou ciels de traîne affaiblis.',
    aviationHazard: 'Plafond bas, givrage sous température négative en hiver.',
    iconEmoji: '☁️🌥️',
    badgeBg: 'bg-teal-500/10',
    badgeText: 'text-teal-300',
    badgeBorder: 'border-teal-500/30',
    varieties: ['stratiformis', 'lenticularis', 'castellanus', 'undulatus', 'mammatus'],
    visualDescription: 'Banc, nappe ou couche de nuages gris ou blanchâtres, présentant presque toujours des parties sombres et des rouleaux ou dalles.'
  },
  {
    id: 'St',
    latinName: 'Stratus',
    frenchName: 'Stratus',
    abbreviation: 'St',
    family: 'BAS',
    typicalBaseMeters: '0 à 450 m (au sol = brouillard)',
    typicalTopMeters: '300 à 900 m',
    composition: 'Minuscules gouttelettes d\'eau en suspension ou prismes de glace',
    precipitationType: 'Bruine fine continue, prismes de glace ou neige en grains fins',
    significance: 'Résultat du refroidissement radiatif nocturne ou d\'une advection d\'air doux et humide sur sol froid (inversion thermique).',
    aviationHazard: 'Plafond ultra-critique (< 100m), visibilité horizontale drastiquement réduite, atterrissages CAT II/III obligatoires.',
    iconEmoji: '🌫️🌁',
    badgeBg: 'bg-emerald-500/10',
    badgeText: 'text-emerald-300',
    badgeBorder: 'border-emerald-500/30',
    varieties: ['nebulosus', 'fractus', 'opacus', 'translucidus'],
    visualDescription: 'Couche nuageuse généralement grise, à base uniforme, pouvant donner lieu à de la bruine ou du brouillard touchant le sol.'
  },
  {
    id: 'Cu',
    latinName: 'Cumulus',
    frenchName: 'Cumulus',
    abbreviation: 'Cu',
    family: 'CONVECTIF',
    typicalBaseMeters: '800 à 2 200 m (LCL d\'Espy)',
    typicalTopMeters: '1 500 à 5 000 m (congestus)',
    composition: 'Gouttelettes d\'eau liquide, cristaux au sommet des congestus',
    precipitationType: 'Nulle pour humilis/mediocris ; averses brutales pour congestus',
    significance: 'Nuage de convection thermique diurne produit par le réchauffement du sol par le rayonnement solaire.',
    aviationHazard: 'Turbulences convectives et thermiques ascendantes sous la base (recherche des planeurs).',
    iconEmoji: '⛅🌤️',
    badgeBg: 'bg-amber-500/10',
    badgeText: 'text-amber-300',
    badgeBorder: 'border-amber-500/30',
    varieties: ['humilis', 'mediocris', 'congestus', 'fractus', 'radiatus'],
    visualDescription: 'Nuages séparés, généralement denses et à contours bien délimités, se développant verticalement en forme de dômes ou choux-fleurs.'
  },
  {
    id: 'Cb',
    latinName: 'Cumulonimbus',
    frenchName: 'Cumulonimbus',
    abbreviation: 'Cb',
    family: 'CONVECTIF',
    typicalBaseMeters: '600 à 1 500 m',
    typicalTopMeters: '9 000 à 14 000 m (Tropopause)',
    composition: 'Gouttes d\'eau, eau surfondue, grêlons massifs, cristaux de glace dans l\'enclume sommitalle',
    precipitationType: 'Averses torrentielles, grêle destructrice, rafales descendantes violentes (microbursts)',
    significance: 'L\'usine orageuse atmosphérique absolue. Associé à la foudre, aux coups de foudre, aux grains violents et aux tornades.',
    aviationHazard: 'Danger aéronautique mortel : cisaillement de vent, foudroiement, givrage sévère instantané, grêle brisant les pare-brises, évitement impératif.',
    iconEmoji: '⛈️⚡💥',
    badgeBg: 'bg-rose-600/20',
    badgeText: 'text-rose-200',
    badgeBorder: 'border-rose-500/40',
    varieties: ['calvus', 'capillatus', 'incus', 'mammatus', 'arcus', 'tuba'],
    visualDescription: 'Nuage lourd et dense, à extension verticale colossale, en forme de montagne ou de gigantesques tours couronnées d\'une enclume fibreuse.'
  }
];

export const CLOUD_SPECIES_ATLAS: CloudSpeciesAtlasItem[] = [
  {
    nameLatin: 'fibratus',
    nameFrench: 'Fibreux',
    applicableGenera: ['Cirrus', 'Cirrostratus'],
    characteristic: 'Nuages en filaments courbes ou droits ne se terminant pas par des crochets.',
    synopticMeaning: 'Vents réguliers et stables en très haute troposphère.',
    identifyingFeature: 'Aspect de chevelure ou de soies fines.'
  },
  {
    nameLatin: 'uncinus',
    nameFrench: 'En virgule / Crochets',
    applicableGenera: ['Cirrus'],
    characteristic: 'Filaments terminés au sommet par un crochet ou une touffe caractéristique.',
    synopticMeaning: 'Indique une forte accélération du courant-jet (jet-stream) et l\'approche imminente d\'une perturbation active.',
    identifyingFeature: 'Forme classique de griffes de chat ou virgules célestes.'
  },
  {
    nameLatin: 'spissatus',
    nameFrench: 'Épais / Dense',
    applicableGenera: ['Cirrus'],
    characteristic: 'Cirrus denses paraissant grisâtres vus face au soleil, masquant la lumière.',
    synopticMeaning: 'Souvent résidus de sommets d\'anciens cumulonimbus (enclumes orageuses orphelines dissoutes).',
    identifyingFeature: 'Épaisseur suffisante pour projeter une ombre sur le sol.'
  },
  {
    nameLatin: 'castellanus',
    nameFrench: 'Crénelé / En châteaux',
    applicableGenera: ['Altocumulus', 'Stratocumulus', 'Cirrocumulus'],
    characteristic: 'Petites tourelles ou créneaux verticaux alignés s\'élevant d\'une base horizontale commune.',
    synopticMeaning: 'Présence d\'une forte instabilité latente en altitude. Précurseur direct d\'orages violents dans les 6 à 12h.',
    identifyingFeature: 'Aspect de remparts de château-fort crénelés.'
  },
  {
    nameLatin: 'lenticularis',
    nameFrench: 'Lenticulaire / Soucoupe',
    applicableGenera: ['Altocumulus', 'Stratocumulus', 'Cirrocumulus'],
    characteristic: 'Nuages en forme de lentilles ou d\'amandes étirées aux contours nets et lisses.',
    synopticMeaning: 'Onde stationnaire de relief générée par le franchissement d\'une chaîne de montagnes (Alpes, Pyrénées, Massif central) par vent fort (Foehn, Tramontane).',
    identifyingFeature: 'Immobiles malgré un vent violent en altitude, empilements de soucoupes.'
  },
  {
    nameLatin: 'mammatus (mamma)',
    nameFrench: 'Mamelonné / Mammatus',
    applicableGenera: ['Cumulonimbus', 'Stratocumulus', 'Altocumulus', 'Cirrus'],
    characteristic: 'Protubérances pendantes en forme de mamelles ou poches inversées sous la base ou l\'enclume du nuage.',
    synopticMeaning: 'Courants descendants froids chargés d\'hydrométéores s\'évaporant dans un air plus chaud sous-jacent. Témoin d\'orage violent.',
    identifyingFeature: 'Spectacle crépusculaire spectaculaire sous les enclumes orageuses.'
  },
  {
    nameLatin: 'arcus',
    nameFrench: 'Arcus / Rouleau de grain',
    applicableGenera: ['Cumulonimbus', 'Cumulus congestus'],
    characteristic: 'Rouleau horizontal dense et sombre attaché au front de rafale à l\'avant d\'un orage.',
    synopticMeaning: 'Marque la rencontre brutale entre l\'air froid descendant du cœur de l\'orage et l\'air chaud aspiré par la cellule. Rafales destructrices immédiates.',
    identifyingFeature: 'Rouleau menaçant et turbulent rasant le sol comme une vague sombre.'
  },
  {
    nameLatin: 'asperitas',
    nameFrench: 'Asperitas',
    applicableGenera: ['Stratocumulus', 'Altocumulus'],
    characteristic: 'Ondulations chaotiques et spectaculaires sous la base nuageuse ressemblant à une mer démontée vue d\'en bas.',
    synopticMeaning: 'Cisaillement de vent extrême et instabilité sous une couche d\'inversion stable.',
    identifyingFeature: 'Relief tourmenté et contrasté officiellement reconnu par l\'OMM en 2017.'
  }
];

export const CLOUD_SUPPLEMENTARY_FEATURES: CloudSupplementaryFeature[] = [
  {
    nameLatin: 'incus',
    nameFrench: 'Enclume orageuse',
    meaning: 'Partie sommitale étalée en forme d\'enclume lisse ou fibreuse au niveau de la tropopause.',
    dangerLevel: 'Extrême',
    meteorologicalCause: 'Blocage de l\'ascendance orageuse par l\'inversion thermique de la stratosphère (tropopause).'
  },
  {
    nameLatin: 'virga',
    nameFrench: 'Virga',
    meaning: 'Traînées de précipitations s\'étendant sous la base du nuage et s\'évaporant complètement avant de toucher le sol.',
    dangerLevel: 'Modéré',
    meteorologicalCause: 'Couche d\'air sec sous-nuageuse évaporant l\'eau et générant des micro-rafales froides.'
  },
  {
    nameLatin: 'praecipitatio',
    nameFrench: 'Précipitations atteignant le sol',
    meaning: 'Rideaux de pluie, de neige ou de grêle touchant visiblement le sol.',
    dangerLevel: 'Faible',
    meteorologicalCause: 'Saturation complète de la colonne d\'air sous-nuageuse.'
  },
  {
    nameLatin: 'fluctus (Kelvin-Helmholtz)',
    nameFrench: 'Ondes de Kelvin-Helmholtz',
    meaning: 'Vagues déferlantes régulières comme des rouleaux de surf dessinés dans le ciel.',
    dangerLevel: 'Élevé',
    meteorologicalCause: 'Cisaillement de vitesse colossal entre deux couches d\'air de densités différentes.'
  },
  {
    nameLatin: 'cavum (Trou de virga / Fallstreak)',
    nameFrench: 'Trou de virga / Cavum',
    meaning: 'Grand trou circulaire ou elliptique s\'ouvrant dans une couche d\'altocumulus ou cirrocumulus.',
    dangerLevel: 'Faible',
    meteorologicalCause: 'Congélation en chaîne de gouttelettes surfondues déclenchée par le passage d\'un avion.'
  }
];

/**
 * Physical calculation of Lifted Condensation Level (LCL) based on Espy & Bolton equations
 * LCL = station_altitude + 125 * (T - Td)
 */
export function calculateLclBaseMeters(temperature: number, dewPoint: number, stationAltitude: number): number {
  const depression = Math.max(0.1, temperature - dewPoint);
  const lclAboveGround = Math.round(125 * depression);
  return Math.max(50, stationAltitude + lclAboveGround);
}

/**
 * Calculates 48-hour ultra-detailed nephological sounding data for a station
 */
export function generate48hCloudNephologySounding(
  station: LocationPoint,
  currentWeather: CurrentWeather,
  hourlyForecasts: HourlyForecast[]
): Cloud48hSynthesisDigest {
  const hourly48h: CloudHourlyDetailed48h[] = [];
  const now = new Date();
  
  // Build 48 consecutive hours
  for (let i = 0; i < 48; i++) {
    const forecastHour = hourlyForecasts[i];
    const hourDate = new Date(now.getTime() + i * 3600 * 1000);
    const hourOffset = i;
    const hourVal = hourDate.getHours();
    const dayOffset = Math.floor(i / 24);
    
    // Day labelling
    let dayLabel = "Aujourd'hui";
    if (dayOffset === 1) dayLabel = "Demain";
    else if (dayOffset >= 2) dayLabel = "Après-demain";
    
    const dayOfWeek = hourDate.toLocaleDateString('fr-FR', { weekday: 'short' });
    const fullDate = hourDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
    const hourLabel = `${hourVal}h`;
    const timeString = `${hourVal.toString().padStart(2, '0')}:00`;
    const isNight = hourVal < 6 || hourVal >= 22;
    
    // Thermodynamic base
    const baseTemp = forecastHour ? forecastHour.temperature : (currentWeather.temperature + (isNight ? -3 : 2));
    const baseHumidity = (forecastHour?.humidity !== undefined && forecastHour?.humidity !== null) ? forecastHour.humidity : (isNight ? 85 : 55);
    const dewPoint = forecastHour?.dewPointC ?? forecastHour?.dewPoint ?? (baseTemp - ((100 - baseHumidity) / 5));
    const pressure = forecastHour?.pressureHpa ?? currentWeather.pressure ?? 1015;
    
    // Raw cloud cover layers
    let rawTotal = forecastHour?.cloudCover ?? (forecastHour as any)?.cloudCoverTotalPct ?? 35;
    let rawLow = forecastHour?.cloudCoverLow ?? (forecastHour as any)?.cloudCoverLowPct ?? Math.round(rawTotal * 0.4);
    let rawMid = forecastHour?.cloudCoverMid ?? (forecastHour as any)?.cloudCoverMidPct ?? Math.round(rawTotal * 0.35);
    let rawHigh = forecastHour?.cloudCoverHigh ?? (forecastHour as any)?.cloudCoverHighPct ?? Math.round(rawTotal * 0.45);
    
    // Diurnal adjustments: morning stratus / afternoon cumulus
    if (!forecastHour) {
      if (hourVal >= 5 && hourVal <= 9) {
        rawLow = Math.min(100, rawLow + 25); // morning fog / low stratus tendency
      } else if (hourVal >= 13 && hourVal <= 18) {
        rawMid = Math.min(100, rawMid + 15);
      }
      rawTotal = Math.min(100, Math.max(rawLow, rawMid, rawHigh, Math.round(rawLow * 0.5 + rawMid * 0.4 + rawHigh * 0.3)));
    }
    
    // Octas conversion
    const totalOctas = Math.min(8, Math.max(0, Math.round((rawTotal / 100) * 8)));
    const lowOctas = Math.min(8, Math.max(0, Math.round((rawLow / 100) * 8)));
    const midOctas = Math.min(8, Math.max(0, Math.round((rawMid / 100) * 8)));
    const highOctas = Math.min(8, Math.max(0, Math.round((rawHigh / 100) * 8)));
    
    // Octas descriptive label
    let octasLabel = `${totalOctas}/8 Ciel serein`;
    let densityCategory: CloudHourlyDetailed48h['cloudDensityCategory'] = 'CIEL_SEREIN';
    if (totalOctas === 0) {
      octasLabel = '0/8 Ciel pur & dégagé';
      densityCategory = 'CIEL_SEREIN';
    } else if (totalOctas <= 2) {
      octasLabel = `${totalOctas}/8 Peu nuageux (FEW)`;
      densityCategory = 'PEU_NUAGEUX';
    } else if (totalOctas <= 4) {
      octasLabel = `${totalOctas}/8 Belles éclaircies (SCT)`;
      densityCategory = 'ÉCLAIRCIES';
    } else if (totalOctas <= 7) {
      octasLabel = `${totalOctas}/8 Très nuageux (BKN)`;
      densityCategory = 'TRÈS_NUAGEUX';
    } else {
      octasLabel = '8/8 Ciel couvert & bouché (OVC)';
      densityCategory = 'COUVERT_TOTAL';
    }
    
    // LCL calculation for low cloud base
    const calculatedLcl = calculateLclBaseMeters(baseTemp, dewPoint, station.altitude);
    const lowBase = rawLow > 5 ? Math.max(100, calculatedLcl) : 1200;
    const lowTop = lowBase + Math.min(2000, Math.max(400, Math.round(rawLow * 15)));
    
    // Mid cloud base and top (2500m - 6000m)
    const midBase = 2800 + Math.round((hourOffset % 5) * 150);
    const midTop = midBase + Math.min(2500, Math.max(600, Math.round(rawMid * 20)));
    
    // High cloud base and top (6500m - 11000m)
    const highBase = 7200 + Math.round((hourOffset % 7) * 200);
    const highTop = highBase + Math.min(3000, Math.max(800, Math.round(rawHigh * 25)));
    
    // 0°C Isotherm and Snow-Rain Limit (LPN) calculation harmonized with physics engine
    const hourPrecip = forecastHour?.rainMm ?? 0;
    const isoDiag = getIsothermComprehensiveDiagnostic({
      stationAltitude: station.altitude,
      temperature: baseTemp,
      relativeHumidity: baseHumidity,
      precipitationMm: hourPrecip
    });
    const isotherm0 = isoDiag.isotherm0Meters;
    const wetBulbZero = isoDiag.wetBulbZeroMeters;
    const snowRainLimit = isoDiag.snowRainLimitMeters;
    const groundSnowLimit = isoDiag.groundSnowLimitMeters;

    // Precipitation phase probe at station altitude
    const probeStation = probeAltitudePrecipitationPhase(
      station.altitude,
      station.altitude,
      baseTemp,
      baseHumidity,
      hourPrecip,
      isotherm0,
      snowRainLimit
    );

    // Relationship between lowest cloud base and LPN
    let cloudBaseVsLpnRelation = `Base nuageuse à ${lowBase} m, Isotherme 0°C à ${isotherm0} m, LPN à ${snowRainLimit} m.`;
    if (hourPrecip > 0.1) {
      if (station.altitude >= snowRainLimit) {
        cloudBaseVsLpnRelation = `Précipitations neigeuses solides à la station (${probeStation.phaseLabel}). Base nuageuse à ${lowBase} m.`;
      } else if (lowBase <= snowRainLimit) {
        cloudBaseVsLpnRelation = `Base nuageuse (${lowBase} m) sous la LPN (${snowRainLimit} m) : hydrométéores tombant en pluie froide à la station.`;
      } else {
        cloudBaseVsLpnRelation = `Isothermie active sous précipitations : LPN abaissée à ${snowRainLimit} m (Isotherme 0°C à ${isotherm0} m).`;
      }
    }
    
    // Cloud genera selection based on parameters
    let lowGenus = 'Cumulus';
    let lowGenusLatin = 'Cumulus';
    let lowSpecies = 'humilis';
    let lowPhase: CloudLayerSlice['microphysicsPhase'] = 'Eau liquide tiède';
    if (lowBase < isotherm0) {
      lowPhase = 'Eau liquide tiède';
    } else {
      lowPhase = 'Gouttelettes surfondues';
    }
    
    if (rawLow >= 70) {
      if (baseTemp <= 10 && baseHumidity >= 85) {
        lowGenus = 'Stratus';
        lowGenusLatin = 'Stratus nebulosus';
        lowSpecies = 'nebulosus';
      } else {
        lowGenus = 'Stratocumulus';
        lowGenusLatin = 'Stratocumulus stratiformis';
        lowSpecies = 'stratiformis';
      }
    } else if (rawLow >= 30) {
      if (hourVal >= 12 && hourVal <= 18 && baseTemp >= 18) {
        lowGenus = 'Cumulus';
        lowGenusLatin = 'Cumulus mediocris';
        lowSpecies = 'mediocris';
      } else {
        lowGenus = 'Stratocumulus';
        lowGenusLatin = 'Stratocumulus perlucidus';
        lowSpecies = 'perlucidus';
      }
    } else {
      lowGenus = 'Cumulus';
      lowGenusLatin = 'Cumulus humilis';
      lowSpecies = 'humilis';
    }
    
    // Mid layer genus
    let midGenus = 'Altocumulus';
    let midGenusLatin = 'Altocumulus stratiformis';
    let midSpecies = 'stratiformis';
    let midPhase: CloudLayerSlice['microphysicsPhase'] = midBase < isotherm0 ? 'Eau liquide tiède' : 'Gouttelettes surfondues';
    if (rawMid >= 70) {
      midGenus = 'Altostratus';
      midGenusLatin = 'Altostratus opacus';
      midSpecies = 'opacus';
      midPhase = 'Mixte eau/glace';
    } else if (rawMid >= 30) {
      midGenus = 'Altocumulus';
      midGenusLatin = 'Altocumulus translucidus';
      midSpecies = 'translucidus';
    }
    
    // High layer genus
    let highGenus = 'Cirrus';
    let highGenusLatin = 'Cirrus fibratus';
    let highSpecies = 'fibratus';
    let highPhase: CloudLayerSlice['microphysicsPhase'] = 'Cristaux de glace purs';
    if (rawHigh >= 75) {
      highGenus = 'Cirrostratus';
      highGenusLatin = 'Cirrostratus nebulosus';
      highSpecies = 'nebulosus';
    } else if (rawHigh >= 40) {
      highGenus = 'Cirrus';
      highGenusLatin = 'Cirrus uncinus';
      highSpecies = 'uncinus';
    }
    
    // METAR simulation codes
    const formatMetarSubCode = (oct: number, baseM: number): string => {
      const fl = Math.round(baseM / 30.48); // Flight level in hundreds of feet
      const flStr = fl.toString().padStart(3, '0');
      if (oct === 0) return 'SKC';
      if (oct <= 2) return `FEW${flStr}`;
      if (oct <= 4) return `SCT${flStr}`;
      if (oct <= 7) return `BKN${flStr}`;
      return `OVC${flStr}`;
    };
    
    const lowMetar = formatMetarSubCode(lowOctas, lowBase);
    const midMetar = formatMetarSubCode(midOctas, midBase);
    const highMetar = formatMetarSubCode(highOctas, highBase);
    
    // Overall METAR group
    const metarParts: string[] = [];
    if (lowOctas > 0) metarParts.push(lowMetar);
    if (midOctas > 0) metarParts.push(midMetar);
    if (highOctas > 0) metarParts.push(highMetar);
    const syntheticMetar = metarParts.length > 0 ? metarParts.join(' ') : 'CAVOK';
    
    // Convective assessment
    const cape = forecastHour?.convectiveCape ?? forecastHour?.capeJkg ?? 200;
    const isConvectiveTime = (hourVal >= 13 && hourVal <= 20) && cape >= 600;
    let convectiveStage: CloudHourlyDetailed48h['convectiveStage'] = 'AUCUN';
    let convectiveBase = lowBase;
    let convectiveTop = lowTop;
    let convectiveUpdraft = 1;
    let convectiveAnvil = false;
    
    if (cape >= 1800 && isConvectiveTime) {
      convectiveStage = 'CUMULONIMBUS_CAPILLATUS_INCUS';
      convectiveBase = Math.min(1200, lowBase);
      convectiveTop = 12500;
      convectiveUpdraft = 28;
      convectiveAnvil = true;
    } else if (cape >= 1200 && isConvectiveTime) {
      convectiveStage = 'CUMULONIMBUS_CALVUS';
      convectiveBase = Math.min(1400, lowBase);
      convectiveTop = 9500;
      convectiveUpdraft = 18;
    } else if (cape >= 700 && isConvectiveTime) {
      convectiveStage = 'CUMULUS_CONGESTUS';
      convectiveBase = lowBase;
      convectiveTop = 5500;
      convectiveUpdraft = 8;
    } else if (hourVal >= 11 && hourVal <= 19 && baseTemp >= 16) {
      convectiveStage = 'CUMULUS_HUMILIS';
      convectiveBase = lowBase;
      convectiveTop = lowTop;
      convectiveUpdraft = 2.5;
    }
    
    // Ceiling determination (Base of lowest layer >= 5 octas BKN or OVC)
    let ceilingMeters = 10000;
    if (lowOctas >= 5) {
      ceilingMeters = lowBase;
    } else if (midOctas >= 5) {
      ceilingMeters = midBase;
    } else if (highOctas >= 5) {
      ceilingMeters = highBase;
    }
    
    const ceilingFeet = Math.round(ceilingMeters * 3.28084);
    let ceilingStatus: CloudHourlyDetailed48h['ceilingStatus'] = 'ILLIMITÉ';
    if (ceilingMeters < 200) {
      ceilingStatus = 'TRÈS BAS (< 200m / Plafond critique)';
    } else if (ceilingMeters < 600) {
      ceilingStatus = 'BAS (200-600m)';
    } else if (ceilingMeters < 2000) {
      ceilingStatus = 'MOYEN (600-2000m)';
    } else if (ceilingMeters < 6000) {
      ceilingStatus = 'ÉLEVÉ (> 2000m)';
    }
    
    // Total vertical cloud thickness
    let totalThickness = 0;
    if (lowOctas > 0) totalThickness += (lowTop - lowBase);
    if (midOctas > 0) totalThickness += (midTop - midBase);
    if (highOctas > 0) totalThickness += (highTop - highBase);
    if (convectiveStage === 'CUMULONIMBUS_CAPILLATUS_INCUS') {
      totalThickness = convectiveTop - convectiveBase;
    }
    
    const cloudTopMax = Math.max(
      convectiveTop,
      highOctas > 0 ? highTop : (midOctas > 0 ? midTop : (lowOctas > 0 ? lowTop : 0))
    );
    
    // Radiative infrared top temp (°C) based on standard lapse rate
    const cloudTopTemp = Math.round(baseTemp - (cloudTopMax * 0.0065));
    
    // Icing risk in clouds (where liquid water / supercooled droplets exist between 0°C and -15°C)
    const icingBottom = Math.max(station.altitude, isotherm0);
    const icingTop = isotherm0 + 2300; // ~ -15°C level
    let icingRisk: CloudHourlyDetailed48h['icingRiskLevel'] = 'NUL';
    if ((lowOctas >= 4 && lowTop >= icingBottom && lowBase <= icingTop) || 
        (midOctas >= 4 && midTop >= icingBottom && midBase <= icingTop) ||
        convectiveStage.startsWith('CUMULONIMBUS')) {
      if (convectiveStage.startsWith('CUMULONIMBUS')) icingRisk = 'SÉVÈRE';
      else if (midOctas >= 6 || lowOctas >= 6) icingRisk = 'MODÉRÉ';
      else icingRisk = 'FAIBLE';
    }
    
    const icingAltitudeRange = icingRisk !== 'NUL' 
      ? `${icingBottom} m - ${icingTop} m`
      : 'Aucun risque détecté';
      
    // Optical properties & Direct solar transmission
    let opticalThickness: CloudHourlyDetailed48h['opticalThickness'] = 'Nulle';
    let directSolarTransmission = 100;
    let diffuseLight = 15;
    
    if (totalOctas === 0) {
      opticalThickness = 'Nulle';
      directSolarTransmission = 100;
      diffuseLight = 10;
    } else if (highOctas >= 6 && lowOctas <= 2 && midOctas <= 2) {
      opticalThickness = 'Mince (Voile transparent)';
      directSolarTransmission = 78;
      diffuseLight = 35;
    } else if (totalOctas <= 4) {
      opticalThickness = 'Moyenne (Soleil tamisé)';
      directSolarTransmission = 65;
      diffuseLight = 40;
    } else if (rawTotal >= 80) {
      opticalThickness = 'Épaisse (Sombre)';
      directSolarTransmission = Math.max(5, 100 - rawTotal);
      diffuseLight = 60;
    } else {
      opticalThickness = 'Moyenne (Soleil tamisé)';
      directSolarTransmission = Math.max(25, 100 - Math.round(rawTotal * 0.8));
      diffuseLight = 50;
    }
    
    // Sky luminance
    let skyLuminance = 'Plein Soleil';
    if (isNight) {
      skyLuminance = totalOctas <= 3 ? 'Nuit étoilée claire' : 'Nuit couverte sombre';
    } else {
      if (totalOctas === 0) skyLuminance = 'Plein Soleil rayonnant';
      else if (totalOctas <= 3) skyLuminance = 'Belles Éclaircies lumineuses';
      else if (totalOctas <= 6) skyLuminance = 'Lumière diffuse & ciel tamisé';
      else skyLuminance = 'Grisaille sombre sous plafond bas';
    }
    
    // Photometeor possibility
    let photometeor = 'Aucun photométéore particulier';
    if (highGenus === 'Cirrostratus' && highOctas >= 5) {
      photometeor = '☀️ Halo solaire circulaire de 22° hautement probable';
    } else if (highSpecies === 'uncinus' && (hourVal === 6 || hourVal === 20)) {
      photometeor = '🌅 Coucher / Lever de soleil flamboyant (diffusion de Rayleigh)';
    } else if (forecastHour && forecastHour.rainMm > 0 && totalOctas <= 6 && !isNight) {
      photometeor = '🌈 Arc-en-ciel visible en direction opposée au soleil';
    } else if (lowGenus === 'Stratus' && station.altitude > 800) {
      photometeor = '🏔️ Mer de nuages et Spectre de Brocken en altitude';
    }
    
    // Sky description synthesis
    let skyDesc = `${octasLabel}. Dominance de ${lowGenusLatin}`;
    if (highOctas >= 5 && lowOctas <= 2) {
      skyDesc = `Voile élevé de ${highGenusLatin} estompant légèrement le soleil.`;
    } else if (totalOctas >= 7) {
      skyDesc = `Couverture compacte de ${lowGenusLatin} (${lowOctas}/8) et ${midGenusLatin}.`;
    } else if (totalOctas === 0) {
      skyDesc = `Ciel entièrement pur sans nébulosité décelable.`;
    }
    
    // Primary Emoji
    let emoji = isNight ? '🌙' : '☀️';
    if (totalOctas >= 7) emoji = '☁️';
    else if (totalOctas >= 5) emoji = isNight ? '🌥️' : '⛅';
    else if (totalOctas >= 3) emoji = isNight ? '🌤️' : '🌤️';
    if (convectiveStage.startsWith('CUMULONIMBUS')) emoji = '⛈️';
    
    hourly48h.push({
      hourIndex: i,
      hourOffset,
      timestamp: hourDate.toISOString(),
      hourLabel,
      timeString,
      dayOffset,
      dayLabel,
      dayOfWeek,
      fullDate,
      isNight,
      temperature: baseTemp,
      dewPoint,
      humidity: baseHumidity,
      pressureHpa: pressure,
      totalCloudCoverPct: rawTotal,
      totalCloudCoverOctas: totalOctas,
      octasLabel,
      cloudDensityCategory: densityCategory,
      lowCloud: {
        coverPct: rawLow,
        octas: lowOctas,
        baseMeters: lowBase,
        topMeters: lowTop,
        thicknessMeters: lowTop - lowBase,
        dominantGenus: lowGenus,
        dominantGenusLatin: lowGenusLatin,
        dominantSpecies: lowSpecies,
        microphysicsPhase: lowPhase,
        metarCode: lowMetar,
        description: `${lowGenusLatin} (${lowOctas}/8 octas) à ${lowBase}m`
      },
      midCloud: {
        coverPct: rawMid,
        octas: midOctas,
        baseMeters: midBase,
        topMeters: midTop,
        thicknessMeters: midTop - midBase,
        dominantGenus: midGenus,
        dominantGenusLatin: midGenusLatin,
        dominantSpecies: midSpecies,
        microphysicsPhase: midPhase,
        metarCode: midMetar,
        description: `${midGenusLatin} (${midOctas}/8 octas) à ${midBase}m`
      },
      highCloud: {
        coverPct: rawHigh,
        octas: highOctas,
        baseMeters: highBase,
        topMeters: highTop,
        thicknessMeters: highTop - highBase,
        dominantGenus: highGenus,
        dominantGenusLatin: highGenusLatin,
        dominantSpecies: highSpecies,
        microphysicsPhase: highPhase,
        metarCode: highMetar,
        description: `${highGenusLatin} (${highOctas}/8 octas) à ${highBase}m`
      },
      isConvective: convectiveStage !== 'AUCUN',
      convectiveStage,
      convectiveBaseMeters: convectiveBase,
      convectiveTopMeters: convectiveTop,
      convectiveUpdraftMs: convectiveUpdraft,
      convectiveAnvilPresent: convectiveAnvil,
      ceilingMeters,
      ceilingFeet,
      ceilingStatus,
      totalCloudThicknessMeters: totalThickness,
      cloudTopMaxMeters: cloudTopMax,
      cloudTopTempC: cloudTopTemp,
      isotherm0Meters: isotherm0,
      wetBulbZeroMeters: wetBulbZero,
      snowRainLimitMeters: snowRainLimit,
      groundSnowLimitMeters: groundSnowLimit,
      isothermieRisk: isoDiag.isothermieRisk,
      isothermieDropMeters: isoDiag.isothermieDropMeters,
      meltingLayerThicknessMeters: isoDiag.meltingLayerThicknessMeters,
      precipitationPhaseAtStation: probeStation.phaseLabel,
      cloudBaseVsLpnRelation,
      icingRiskLevel: icingRisk,
      icingAltitudeRange,
      opticalThickness,
      directSolarTransmissionPct: directSolarTransmission,
      diffuseSkyLightPct: diffuseLight,
      skyLuminanceCategory: skyLuminance,
      photometeorPossibility: photometeor,
      skyDescription: skyDesc,
      primaryWmoEmoji: emoji,
      syntheticMetarGroup: syntheticMetar,
      wmoCode: forecastHour?.weatherCode ?? (totalOctas >= 6 ? 3 : (totalOctas >= 3 ? 2 : 0))
    });
  }
  
  // Aggregate statistics across 48h
  const avgCover = Math.round(hourly48h.reduce((acc, h) => acc + h.totalCloudCoverPct, 0) / hourly48h.length);
  const maxCover = Math.max(...hourly48h.map(h => h.totalCloudCoverPct));
  const minCover = Math.min(...hourly48h.map(h => h.totalCloudCoverPct));
  const clearHours = hourly48h.filter(h => h.totalCloudCoverOctas <= 2).length;
  const overcastHours = hourly48h.filter(h => h.totalCloudCoverOctas >= 7).length;
  
  // Lowest ceiling
  let lowestCeiling = 99999;
  let lowestCeilingHour = "N/A";
  hourly48h.forEach(h => {
    if (h.ceilingMeters < lowestCeiling) {
      lowestCeiling = h.ceilingMeters;
      lowestCeilingHour = `${h.dayOfWeek} ${h.hourLabel}`;
    }
  });
  if (lowestCeiling > 15000) lowestCeiling = 10000;
  
  const highestTop = Math.max(...hourly48h.map(h => h.cloudTopMaxMeters));
  
  // Critical warnings
  const lowCeilingSteps = hourly48h.filter(h => h.ceilingMeters < 300);
  const hasLowCeiling = lowCeilingSteps.length > 0;
  const lowCeilingRange = hasLowCeiling 
    ? `${lowCeilingSteps[0].dayOfWeek} ${lowCeilingSteps[0].hourLabel} à ${lowCeilingSteps[lowCeilingSteps.length - 1].hourLabel}`
    : null;
    
  const icingSteps = hourly48h.filter(h => h.icingRiskLevel === 'MODÉRÉ' || h.icingRiskLevel === 'SÉVÈRE');
  const hasIcing = icingSteps.length > 0;
  const icingRange = hasIcing 
    ? `${icingSteps[0].dayOfWeek} ${icingSteps[0].hourLabel} (Zone ${icingSteps[0].icingAltitudeRange})`
    : null;
    
  const convectiveSteps = hourly48h.filter(h => h.isConvective && (h.convectiveStage.startsWith('CUMULONIMBUS') || h.convectiveStage === 'CUMULUS_CONGESTUS'));
  const hasConvective = convectiveSteps.length > 0;
  const convectiveRange = hasConvective 
    ? `${convectiveSteps[0].dayOfWeek} ${convectiveSteps[0].hourLabel}`
    : null;
    
  const hasMountainObscuration = lowestCeiling <= station.altitude + 200 && station.altitude >= 600;
  
  let dominantRegime = "Ciel variable de saison avec alternance d'éclaircies et bancs nuageux";
  if (avgCover >= 75) dominantRegime = "Régime bouché et perturbé sous couverture compacte stratiforme";
  else if (avgCover <= 20) dominantRegime = "Régime anticyclonique radieux sous air sec subsident";
  else if (hasConvective) dominantRegime = "Régime d'instabilité diurne à évolution convective estivale";
  
  const photometeorsList = Array.from(new Set(hourly48h.map(h => h.photometeorPossibility).filter(p => !p.startsWith('Aucun'))));
  
  const aviationSummary = `Plafond mini ${lowestCeiling < 9000 ? `${lowestCeiling}m` : 'Illimité'}, sommet max ${highestTop}m. ${hasIcing ? `Givrage actif entre ${icingRange}.` : 'Pas de givrage critique.'} METAR dominant : ${hourly48h[0]?.syntheticMetarGroup ?? 'CAVOK'}.`;

  return {
    stationName: station.name,
    stationAltitude: station.altitude,
    generatedAt: now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    hourly48h,
    averageCover48hPct: avgCover,
    maxCover48hPct: maxCover,
    minCover48hPct: minCover,
    clearSkyHoursCount: clearHours,
    overcastHoursCount: overcastHours,
    lowestCeilingMeters: lowestCeiling,
    lowestCeilingHourLabel: lowestCeilingHour,
    highestCloudTopMeters: highestTop,
    hasLowCeilingAlert: hasLowCeiling,
    lowCeilingAlertTimeRange: lowCeilingRange,
    hasIcingAlert: hasIcing,
    icingAlertTimeRange: icingRange,
    hasConvectiveThreat: hasConvective,
    convectiveThreatTimeRange: convectiveRange,
    hasMountainObscurationThreat: hasMountainObscuration,
    dominantRegime48h: dominantRegime,
    photometeorOpportunities: photometeorsList,
    aviationSummaryText: aviationSummary
  };
}
