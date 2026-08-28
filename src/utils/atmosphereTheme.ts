import { TimeOfDay, Season, AtmosphereThemeConfig, EphemerisInfo } from '../types/atmosphere';

/**
 * Calculates time of day based on hour (0-23) and optional sun elevation
 */
export function calculateTimeOfDay(date: Date = new Date(), lat?: number): TimeOfDay {
  const hour = date.getHours();
  const minutes = date.getMinutes();
  const timeFraction = hour + minutes / 60;

  // Adapt slightly by latitude if available (Northern France ~48°N)
  // Dawn: 05:30 - 08:30
  // Day: 08:30 - 19:00 (or 20:00 in summer)
  // Dusk: 19:00 - 22:00
  // Night: 22:00 - 05:30
  if (timeFraction >= 5.25 && timeFraction < 8.5) {
    return 'DAWN';
  } else if (timeFraction >= 8.5 && timeFraction < 19.5) {
    return 'DAY';
  } else if (timeFraction >= 19.5 && timeFraction < 22.25) {
    return 'DUSK';
  } else {
    return 'NIGHT';
  }
}

/**
 * Calculates meteorological season based on month and hemisphere (lat)
 */
export function calculateSeason(date: Date = new Date(), lat: number = 46.5): Season {
  const month = date.getMonth(); // 0 = Jan, 1 = Feb, ..., 11 = Dec
  const isSouthernHemisphere = lat < 0;

  let season: Season = 'SUMMER';

  // Northern Hemisphere
  if (month === 2 || month === 3 || month === 4) {
    season = 'SPRING'; // Mars, Avril, Mai
  } else if (month === 5 || month === 6 || month === 7) {
    season = 'SUMMER'; // Juin, Juillet, Août
  } else if (month === 8 || month === 9 || month === 10) {
    season = 'AUTUMN'; // Septembre, Octobre, Novembre
  } else {
    season = 'WINTER'; // Décembre, Janvier, Février
  }

  // Invert for southern hemisphere
  if (isSouthernHemisphere) {
    if (season === 'SPRING') return 'AUTUMN';
    if (season === 'SUMMER') return 'WINTER';
    if (season === 'AUTUMN') return 'SPRING';
    if (season === 'WINTER') return 'SUMMER';
  }

  return season;
}

/**
 * Compute solar ephemeris approximation for a given station
 */
export function computeEphemeris(date: Date = new Date(), lat: number = 48.85, lon: number = 2.35): EphemerisInfo {
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
  const hour = date.getHours() + date.getMinutes() / 60;

  // Approximate solar declination
  const declination = 23.45 * Math.sin(((360 / 365) * (dayOfYear - 81) * Math.PI) / 180);
  const latRad = (lat * Math.PI) / 180;
  const decRad = (declination * Math.PI) / 180;

  // Approximate sunrise / sunset in local solar time
  const cosHourAngle = -Math.tan(latRad) * Math.tan(decRad);
  const clampedCos = Math.max(-1, Math.min(1, cosHourAngle));
  const hourAngleDeg = (Math.acos(clampedCos) * 180) / Math.PI;
  const halfDayHours = hourAngleDeg / 15;

  // Solar noon ~ 13:00 to 14:00 in France depending on daylight saving
  const solarNoonHour = 13 + (2.35 - lon) * (4 / 60);
  const sunriseHour = solarNoonHour - halfDayHours;
  const sunsetHour = solarNoonHour + halfDayHours;
  const civilDuskHour = sunsetHour + 0.6; // ~36 min after sunset

  const formatH = (val: number) => {
    const norm = (val + 24) % 24;
    const h = Math.floor(norm);
    const m = Math.floor((norm - h) * 60);
    return `${h.toString().padStart(2, '0')}h${m.toString().padStart(2, '0')}`;
  };

  const dayLengthH = halfDayHours * 2;
  const dlHours = Math.floor(dayLengthH);
  const dlMins = Math.floor((dayLengthH - dlHours) * 60);

  // Approximate Sun elevation angle now
  const currentHourAngle = (hour - solarNoonHour) * 15;
  const chaRad = (currentHourAngle * Math.PI) / 180;
  const sinElevation = Math.sin(latRad) * Math.sin(decRad) + Math.cos(latRad) * Math.cos(decRad) * Math.cos(chaRad);
  const elevationDeg = Math.round((Math.asin(Math.max(-1, Math.min(1, sinElevation))) * 180) / Math.PI);

  return {
    sunrise: formatH(sunriseHour),
    solarNoon: formatH(solarNoonHour),
    sunset: formatH(sunsetHour),
    civilDusk: formatH(civilDuskHour),
    dayLengthFormatted: `${dlHours}h ${dlMins}min`,
    sunElevationDeg: elevationDeg
  };
}

/**
 * 16 Themes Dictionary: Combines 4 Times of Day × 4 Seasons
 */
export const ATMOSPHERE_THEMES: Record<string, AtmosphereThemeConfig> = {
  // ===================== DAWN (AUBE) =====================
  'DAWN_SPRING': {
    id: 'DAWN_SPRING',
    timeOfDay: 'DAWN',
    season: 'SPRING',
    name: 'Aurore Printanière & Rosée',
    subtitle: 'Brume matinale douce, reflets rosés et éveil de la végétation',
    skyToneLabel: 'Aube Boréale Pastel',
    iconName: 'Sunrise',
    bgGradient: 'radial-gradient(ellipse at 50% 0%, #172554 0%, #0f172a 40%, #030712 100%)',
    meshGlowPrimary: 'rgba(244, 114, 182, 0.18)', // Rose poudré
    meshGlowSecondary: 'rgba(56, 189, 248, 0.16)', // Cyan aurore
    accentBorder: 'border-pink-500/30',
    glowAccentColor: '#f472b6',
    particleType: 'petals',
    badgeStyle: {
      bg: 'bg-pink-500/20',
      text: 'text-pink-300',
      border: 'border-pink-500/40'
    },
    cardHighlightBorder: 'hover:border-pink-500/40',
    lightingIntensity: 0.45
  },
  'DAWN_SUMMER': {
    id: 'DAWN_SUMMER',
    timeOfDay: 'DAWN',
    season: 'SUMMER',
    name: 'Aube Dorée Estivale',
    subtitle: 'Horizon abricot et or, fraîcheur matinale avant la chaleur',
    skyToneLabel: 'Aube Ambrée & Azur',
    iconName: 'Sunrise',
    bgGradient: 'radial-gradient(ellipse at 50% 0%, #1e1b4b 0%, #0f172a 45%, #020617 100%)',
    meshGlowPrimary: 'rgba(251, 146, 60, 0.22)', // Orange abricot
    meshGlowSecondary: 'rgba(250, 204, 21, 0.18)', // Or chaud
    accentBorder: 'border-amber-500/30',
    glowAccentColor: '#f59e0b',
    particleType: 'sunflare',
    badgeStyle: {
      bg: 'bg-amber-500/20',
      text: 'text-amber-300',
      border: 'border-amber-500/40'
    },
    cardHighlightBorder: 'hover:border-amber-500/40',
    lightingIntensity: 0.55
  },
  'DAWN_AUTUMN': {
    id: 'DAWN_AUTUMN',
    timeOfDay: 'DAWN',
    season: 'AUTUMN',
    name: 'Aube Cuivrée & Brumes d\'Automne',
    subtitle: 'Nappes de brouillard en vallée, lueurs de bronze et d\'ambre',
    skyToneLabel: 'Aube Cuivrée Ocrée',
    iconName: 'Sunrise',
    bgGradient: 'radial-gradient(ellipse at 50% 0%, #2e1065 0%, #1e1b4b 35%, #09090b 100%)',
    meshGlowPrimary: 'rgba(217, 119, 6, 0.20)', // Cuivre
    meshGlowSecondary: 'rgba(180, 83, 9, 0.18)', // Ocre terreux
    accentBorder: 'border-orange-600/30',
    glowAccentColor: '#ea580c',
    particleType: 'mist',
    badgeStyle: {
      bg: 'bg-orange-500/20',
      text: 'text-orange-300',
      border: 'border-orange-500/40'
    },
    cardHighlightBorder: 'hover:border-orange-500/40',
    lightingIntensity: 0.40
  },
  'DAWN_WINTER': {
    id: 'DAWN_WINTER',
    timeOfDay: 'DAWN',
    season: 'WINTER',
    name: 'Aube Glaciale & Rose Polaire',
    subtitle: 'Cristaux givrés scintillant sous un ciel rose opalin et lilas',
    skyToneLabel: 'Aube Polaire Opaline',
    iconName: 'Sunrise',
    bgGradient: 'radial-gradient(ellipse at 50% 0%, #1e1b4b 0%, #0f172a 40%, #030712 100%)',
    meshGlowPrimary: 'rgba(224, 231, 255, 0.18)', // Lilas glacé
    meshGlowSecondary: 'rgba(56, 189, 248, 0.20)', // Cyan givre
    accentBorder: 'border-cyan-400/30',
    glowAccentColor: '#38bdf8',
    particleType: 'frost',
    badgeStyle: {
      bg: 'bg-cyan-500/20',
      text: 'text-cyan-200',
      border: 'border-cyan-400/40'
    },
    cardHighlightBorder: 'hover:border-cyan-400/40',
    lightingIntensity: 0.42
  },

  // ===================== DAY (JOURNÉE) =====================
  'DAY_SPRING': {
    id: 'DAY_SPRING',
    timeOfDay: 'DAY',
    season: 'SPRING',
    name: 'Plein Jour Printanier Lumineux',
    subtitle: 'Ciel azuré limpide, brise douce et éclat printanier vivifiant',
    skyToneLabel: 'Zénith Émeraude & Azur',
    iconName: 'CloudSun',
    bgGradient: 'radial-gradient(ellipse at 50% 0%, #0c4a6e 0%, #0f172a 50%, #020617 100%)',
    meshGlowPrimary: 'rgba(14, 165, 233, 0.22)', // Ciel azur
    meshGlowSecondary: 'rgba(52, 211, 153, 0.16)', // Émeraude douce
    accentBorder: 'border-sky-500/30',
    glowAccentColor: '#0ea5e9',
    particleType: 'petals',
    badgeStyle: {
      bg: 'bg-sky-500/20',
      text: 'text-sky-300',
      border: 'border-sky-500/40'
    },
    cardHighlightBorder: 'hover:border-sky-400/40',
    lightingIntensity: 0.85
  },
  'DAY_SUMMER': {
    id: 'DAY_SUMMER',
    timeOfDay: 'DAY',
    season: 'SUMMER',
    name: 'Plein Jour & Zénith Estival',
    subtitle: 'Intensité solaire maximale, ciel bleu profond et rayonnement généreux',
    skyToneLabel: 'Zénith Doré & Azur Profond',
    iconName: 'Sun',
    bgGradient: 'radial-gradient(ellipse at 50% 0%, #075985 0%, #0f172a 55%, #020617 100%)',
    meshGlowPrimary: 'rgba(245, 158, 11, 0.22)', // Or solaire
    meshGlowSecondary: 'rgba(2, 132, 199, 0.24)', // Bleu ciel intense
    accentBorder: 'border-blue-500/30',
    glowAccentColor: '#3b82f6',
    particleType: 'sunflare',
    badgeStyle: {
      bg: 'bg-blue-500/20',
      text: 'text-blue-300',
      border: 'border-blue-500/40'
    },
    cardHighlightBorder: 'hover:border-blue-400/40',
    lightingIntensity: 0.95
  },
  'DAY_AUTUMN': {
    id: 'DAY_AUTUMN',
    timeOfDay: 'DAY',
    season: 'AUTUMN',
    name: 'Journée d\'Automne Dorée & Feuillages',
    subtitle: 'Lumière rasante dorée, teintes d\'ambre chaud et ciel modérément voilé',
    skyToneLabel: 'Lumière Ambrée & Cèdre',
    iconName: 'Leaf',
    bgGradient: 'radial-gradient(ellipse at 50% 0%, #1e293b 0%, #0f172a 45%, #020617 100%)',
    meshGlowPrimary: 'rgba(234, 88, 12, 0.20)', // Ambre
    meshGlowSecondary: 'rgba(202, 138, 4, 0.18)', // Or automnal
    accentBorder: 'border-amber-600/30',
    glowAccentColor: '#d97706',
    particleType: 'mist',
    badgeStyle: {
      bg: 'bg-amber-600/20',
      text: 'text-amber-200',
      border: 'border-amber-500/40'
    },
    cardHighlightBorder: 'hover:border-amber-500/40',
    lightingIntensity: 0.70
  },
  'DAY_WINTER': {
    id: 'DAY_WINTER',
    timeOfDay: 'DAY',
    season: 'WINTER',
    name: 'Jour d\'Hiver Pur & Bleu Acier',
    subtitle: 'Ciel cristallin froid, réverbération immaculée et air sec',
    skyToneLabel: 'Bleu Acier & Éclat Froid',
    iconName: 'Snowflake',
    bgGradient: 'radial-gradient(ellipse at 50% 0%, #0f2c59 0%, #0f172a 45%, #020617 100%)',
    meshGlowPrimary: 'rgba(56, 189, 248, 0.20)', // Bleu glacier
    meshGlowSecondary: 'rgba(147, 197, 253, 0.16)', // Acier clair
    accentBorder: 'border-cyan-500/30',
    glowAccentColor: '#06b6d4',
    particleType: 'frost',
    badgeStyle: {
      bg: 'bg-cyan-500/20',
      text: 'text-cyan-300',
      border: 'border-cyan-500/40'
    },
    cardHighlightBorder: 'hover:border-cyan-400/40',
    lightingIntensity: 0.65
  },

  // ===================== DUSK (CRÉPUSCULE) =====================
  'DUSK_SPRING': {
    id: 'DUSK_SPRING',
    timeOfDay: 'DUSK',
    season: 'SPRING',
    name: 'Crépuscule Violet & Douceur Printanière',
    subtitle: 'Dégradé velouté lilas, indigo et premières lueurs des étoiles',
    skyToneLabel: 'Lilas & Indigo Crépusculaire',
    iconName: 'Sunset',
    bgGradient: 'radial-gradient(ellipse at 50% 0%, #4c1d95 0%, #1e1b4b 40%, #020617 100%)',
    meshGlowPrimary: 'rgba(192, 132, 252, 0.22)', // Violet lilas
    meshGlowSecondary: 'rgba(244, 114, 182, 0.18)', // Rose fuchsia
    accentBorder: 'border-purple-500/30',
    glowAccentColor: '#a855f7',
    particleType: 'stars',
    badgeStyle: {
      bg: 'bg-purple-500/20',
      text: 'text-purple-300',
      border: 'border-purple-500/40'
    },
    cardHighlightBorder: 'hover:border-purple-400/40',
    lightingIntensity: 0.38
  },
  'DUSK_SUMMER': {
    id: 'DUSK_SUMMER',
    timeOfDay: 'DUSK',
    season: 'SUMMER',
    name: 'Coucher de Soleil Flamboyant',
    subtitle: 'Crépuscule carmin, horizon pourpre incandescent et ciel d\'été infini',
    skyToneLabel: 'Feu Pourpre & Magie Solaire',
    iconName: 'Sunset',
    bgGradient: 'radial-gradient(ellipse at 50% 0%, #831843 0%, #3b0764 40%, #030712 100%)',
    meshGlowPrimary: 'rgba(239, 68, 68, 0.24)', // Carmin
    meshGlowSecondary: 'rgba(245, 158, 11, 0.22)', // Or ardent
    accentBorder: 'border-rose-500/30',
    glowAccentColor: '#f43f5e',
    particleType: 'embers',
    badgeStyle: {
      bg: 'bg-rose-500/20',
      text: 'text-rose-300',
      border: 'border-rose-500/40'
    },
    cardHighlightBorder: 'hover:border-rose-400/40',
    lightingIntensity: 0.48
  },
  'DUSK_AUTUMN': {
    id: 'DUSK_AUTUMN',
    timeOfDay: 'DUSK',
    season: 'AUTUMN',
    name: 'Crépuscule Érable & Braises Automnales',
    subtitle: 'Dégradé cuivre, rouge brique et obscurité enveloppante',
    skyToneLabel: 'Braises de Cuivre & Sienne',
    iconName: 'Sunset',
    bgGradient: 'radial-gradient(ellipse at 50% 0%, #7c2d12 0%, #2e1065 45%, #09090b 100%)',
    meshGlowPrimary: 'rgba(249, 115, 22, 0.22)', // Orange brûlé
    meshGlowSecondary: 'rgba(185, 28, 28, 0.20)', // Rouge brique
    accentBorder: 'border-amber-500/30',
    glowAccentColor: '#ea580c',
    particleType: 'embers',
    badgeStyle: {
      bg: 'bg-orange-600/20',
      text: 'text-orange-300',
      border: 'border-orange-500/40'
    },
    cardHighlightBorder: 'hover:border-orange-500/40',
    lightingIntensity: 0.35
  },
  'DUSK_WINTER': {
    id: 'DUSK_WINTER',
    timeOfDay: 'DUSK',
    season: 'WINTER',
    name: 'Crépuscule Polaire Améthyste',
    subtitle: 'Teintes froides bleu nuit et améthyste sur le manteau neigeux',
    skyToneLabel: 'Améthyste & Nuit Givrée',
    iconName: 'Sunset',
    bgGradient: 'radial-gradient(ellipse at 50% 0%, #312e81 0%, #1e1b4b 40%, #030712 100%)',
    meshGlowPrimary: 'rgba(129, 140, 248, 0.20)', // Indigo givré
    meshGlowSecondary: 'rgba(192, 132, 252, 0.16)', // Améthyste
    accentBorder: 'border-indigo-500/30',
    glowAccentColor: '#6366f1',
    particleType: 'frost',
    badgeStyle: {
      bg: 'bg-indigo-500/20',
      text: 'text-indigo-200',
      border: 'border-indigo-500/40'
    },
    cardHighlightBorder: 'hover:border-indigo-400/40',
    lightingIntensity: 0.30
  },

  // ===================== NIGHT (NUIT ÉTOILÉE) =====================
  'NIGHT_SPRING': {
    id: 'NIGHT_SPRING',
    timeOfDay: 'NIGHT',
    season: 'SPRING',
    name: 'Nuit Étoilée & Ciel Profond',
    subtitle: 'Voûte céleste sereine, constellations claires et brise nocturne',
    skyToneLabel: 'Constellations & Bleu Marine',
    iconName: 'Moon',
    bgGradient: 'radial-gradient(ellipse at 50% 0%, #0f172a 0%, #020617 60%, #000000 100%)',
    meshGlowPrimary: 'rgba(99, 102, 241, 0.16)', // Bleu nuit
    meshGlowSecondary: 'rgba(14, 165, 233, 0.14)', // Cyan lointain
    accentBorder: 'border-indigo-600/30',
    glowAccentColor: '#818cf8',
    particleType: 'stars',
    badgeStyle: {
      bg: 'bg-indigo-950/40',
      text: 'text-indigo-300',
      border: 'border-indigo-500/40'
    },
    cardHighlightBorder: 'hover:border-indigo-400/40',
    lightingIntensity: 0.12
  },
  'NIGHT_SUMMER': {
    id: 'NIGHT_SUMMER',
    timeOfDay: 'NIGHT',
    season: 'SUMMER',
    name: 'Nuit d\'Été & Voie Lactée',
    subtitle: 'Chaleur nocturne douce, nébuleuses cosmiques et étoiles filantes',
    skyToneLabel: 'Cosmos Estival & Voie Lactée',
    iconName: 'Moon',
    bgGradient: 'radial-gradient(ellipse at 50% 0%, #1e1b4b 0%, #090d16 55%, #000000 100%)',
    meshGlowPrimary: 'rgba(168, 85, 247, 0.18)', // Mauve cosmique
    meshGlowSecondary: 'rgba(59, 130, 246, 0.16)', // Bleu nuit
    accentBorder: 'border-blue-500/30',
    glowAccentColor: '#60a5fa',
    particleType: 'stars',
    badgeStyle: {
      bg: 'bg-blue-950/40',
      text: 'text-blue-300',
      border: 'border-blue-500/40'
    },
    cardHighlightBorder: 'hover:border-blue-400/40',
    lightingIntensity: 0.15
  },
  'NIGHT_AUTUMN': {
    id: 'NIGHT_AUTUMN',
    timeOfDay: 'NIGHT',
    season: 'AUTUMN',
    name: 'Nuit Brumeuse & Clair de Lune',
    subtitle: 'Halo lunaire argenté, brumes nocturnes et calme d\'arrière-saison',
    skyToneLabel: 'Clair de Lune & Brume Noire',
    iconName: 'Moon',
    bgGradient: 'radial-gradient(ellipse at 50% 0%, #111827 0%, #030712 60%, #000000 100%)',
    meshGlowPrimary: 'rgba(148, 163, 184, 0.14)', // Argent lunaire
    meshGlowSecondary: 'rgba(180, 83, 9, 0.12)', // Ambre lointain
    accentBorder: 'border-slate-700/40',
    glowAccentColor: '#94a3b8',
    particleType: 'stars',
    badgeStyle: {
      bg: 'bg-slate-900/60',
      text: 'text-slate-300',
      border: 'border-slate-600/40'
    },
    cardHighlightBorder: 'hover:border-slate-500/40',
    lightingIntensity: 0.10
  },
  'NIGHT_WINTER': {
    id: 'NIGHT_WINTER',
    timeOfDay: 'NIGHT',
    season: 'WINTER',
    name: 'Nuit Polaire & Aurore Boréale',
    subtitle: 'Froid nocturne intense, nébuleuse d\'émeraude et cristaux célestes',
    skyToneLabel: 'Nuit Boréale & Glace',
    iconName: 'Moon',
    bgGradient: 'radial-gradient(ellipse at 50% 0%, #022c22 0%, #051923 40%, #000000 100%)',
    meshGlowPrimary: 'rgba(16, 185, 129, 0.20)', // Aurore émeraude
    meshGlowSecondary: 'rgba(6, 182, 212, 0.18)', // Cyan boréal
    accentBorder: 'border-emerald-500/30',
    glowAccentColor: '#34d399',
    particleType: 'frost',
    badgeStyle: {
      bg: 'bg-emerald-950/40',
      text: 'text-emerald-300',
      border: 'border-emerald-500/40'
    },
    cardHighlightBorder: 'hover:border-emerald-400/40',
    lightingIntensity: 0.14
  }
};

export const NOEL_THEME: AtmosphereThemeConfig = {
  id: 'EVENT_NOEL',
  timeOfDay: 'NIGHT',
  season: 'WINTER',
  name: '🎄 Événement Féerie de Noël (24 & 25 Décembre)',
  subtitle: 'Ambiance festive rouge carmin & noir nocturne, flocons de neige et éclats dorés',
  skyToneLabel: 'Noël Rouge Carmin & Flocons',
  iconName: 'Snowflake',
  bgGradient: 'radial-gradient(ellipse at 50% 0%, #3f0713 0%, #150206 45%, #050102 100%)',
  meshGlowPrimary: 'rgba(239, 68, 68, 0.28)', // Rouge carmin festif
  meshGlowSecondary: 'rgba(245, 158, 11, 0.22)', // Or scintillant
  accentBorder: 'border-rose-500/50',
  glowAccentColor: '#f43f5e',
  particleType: 'snowflakes',
  badgeStyle: {
    bg: 'bg-rose-950/60',
    text: 'text-rose-200',
    border: 'border-rose-500/50'
  },
  cardHighlightBorder: 'hover:border-rose-400/60',
  lightingIntensity: 0.20
};

// ===================== DYNAMIC WEATHER THEMES =====================

export const WEATHER_THEMES: Record<string, AtmosphereThemeConfig> = {
  'WEATHER_RAIN': {
    id: 'WEATHER_RAIN',
    timeOfDay: 'DAY',
    season: 'AUTUMN',
    name: 'Pluie & Nuages d’Ardoise',
    subtitle: 'Ambiance pluvieuse rafraîchissante, gouttes rythmées et ciel bleu ardoise',
    skyToneLabel: 'Ardoise Pluvieuse & Reflets Bleutés',
    iconName: 'CloudRain',
    bgGradient: 'radial-gradient(ellipse at 50% 0%, #0c2136 0%, #071524 45%, #02070e 100%)',
    meshGlowPrimary: 'rgba(56, 189, 248, 0.24)', // Cyan pluie
    meshGlowSecondary: 'rgba(14, 116, 144, 0.20)', // Bleu pétrole
    accentBorder: 'border-sky-500/40',
    glowAccentColor: '#38bdf8',
    particleType: 'rain',
    badgeStyle: {
      bg: 'bg-sky-950/50',
      text: 'text-sky-300',
      border: 'border-sky-500/40'
    },
    cardHighlightBorder: 'hover:border-sky-400/50',
    lightingIntensity: 0.35
  },
  'WEATHER_THUNDER': {
    id: 'WEATHER_THUNDER',
    timeOfDay: 'DAY',
    season: 'SUMMER',
    name: 'Orage Électrique & Ciel Sombre',
    subtitle: 'Activité convective puissante, reflets violets et éclairs lointains',
    skyToneLabel: 'Indigo Électrique & Foudre',
    iconName: 'CloudLightning',
    bgGradient: 'radial-gradient(ellipse at 50% 0%, #1e1035 0%, #0d0618 45%, #020006 100%)',
    meshGlowPrimary: 'rgba(168, 85, 247, 0.28)', // Violet orage
    meshGlowSecondary: 'rgba(96, 165, 250, 0.22)', // Flash électrique
    accentBorder: 'border-purple-500/40',
    glowAccentColor: '#c084fc',
    particleType: 'thunder',
    badgeStyle: {
      bg: 'bg-purple-950/50',
      text: 'text-purple-300',
      border: 'border-purple-500/40'
    },
    cardHighlightBorder: 'hover:border-purple-400/50',
    lightingIntensity: 0.28
  },
  'WEATHER_SNOW': {
    id: 'WEATHER_SNOW',
    timeOfDay: 'DAY',
    season: 'WINTER',
    name: 'Chutes de Neige & Ciel Polaire',
    subtitle: 'Flocons cotonneux délicats, fraîcheur hivernale et reflets azur givrés',
    skyToneLabel: 'Blanc Hivernal & Azur Givré',
    iconName: 'Snowflake',
    bgGradient: 'radial-gradient(ellipse at 50% 0%, #0b2938 0%, #04141e 45%, #01060a 100%)',
    meshGlowPrimary: 'rgba(186, 230, 253, 0.28)', // Glace claire
    meshGlowSecondary: 'rgba(56, 189, 248, 0.22)', // Cyan boréal
    accentBorder: 'border-cyan-400/40',
    glowAccentColor: '#7dd3fc',
    particleType: 'snowflakes',
    badgeStyle: {
      bg: 'bg-cyan-950/50',
      text: 'text-cyan-200',
      border: 'border-cyan-400/40'
    },
    cardHighlightBorder: 'hover:border-cyan-300/50',
    lightingIntensity: 0.40
  },
  'WEATHER_OVERCAST': {
    id: 'WEATHER_OVERCAST',
    timeOfDay: 'DAY',
    season: 'AUTUMN',
    name: 'Ciel Couvert & Nuances Perle',
    subtitle: 'Couverture nuageuse dense et feutrée, lumière diffuse et brise calme',
    skyToneLabel: 'Gris Perle & Bleu Acier',
    iconName: 'Cloud',
    bgGradient: 'radial-gradient(ellipse at 50% 0%, #1a2332 0%, #0f1724 45%, #05080f 100%)',
    meshGlowPrimary: 'rgba(148, 163, 184, 0.20)', // Gris perle
    meshGlowSecondary: 'rgba(100, 116, 139, 0.16)', // Bleu acier
    accentBorder: 'border-slate-500/40',
    glowAccentColor: '#94a3b8',
    particleType: 'mist',
    badgeStyle: {
      bg: 'bg-slate-900/60',
      text: 'text-slate-200',
      border: 'border-slate-500/40'
    },
    cardHighlightBorder: 'hover:border-slate-400/50',
    lightingIntensity: 0.38
  },
  'WEATHER_FOG': {
    id: 'WEATHER_FOG',
    timeOfDay: 'DAY',
    season: 'AUTUMN',
    name: 'Brume & Brouillard Épais',
    subtitle: 'Atmosphère feutrée et mystérieuse, visibilité réduite et air humide',
    skyToneLabel: 'Brouillard Coton & Gris Doux',
    iconName: 'CloudFog',
    bgGradient: 'radial-gradient(ellipse at 50% 0%, #1e293b 0%, #0f172a 50%, #020617 100%)',
    meshGlowPrimary: 'rgba(203, 213, 225, 0.22)',
    meshGlowSecondary: 'rgba(148, 163, 184, 0.18)',
    accentBorder: 'border-slate-400/40',
    glowAccentColor: '#cbd5e1',
    particleType: 'mist',
    badgeStyle: {
      bg: 'bg-slate-900/70',
      text: 'text-slate-200',
      border: 'border-slate-400/40'
    },
    cardHighlightBorder: 'hover:border-slate-300/50',
    lightingIntensity: 0.32
  },
  'WEATHER_SUNNY_WARM': {
    id: 'WEATHER_SUNNY_WARM',
    timeOfDay: 'DAY',
    season: 'SUMMER',
    name: 'Soleil Radieux & Azur Lumineux',
    subtitle: 'Ensoleillement généreux, chaleur éclatante et ciel parfaitement dégagé',
    skyToneLabel: 'Or Solaire & Bleu Azur',
    iconName: 'Sun',
    bgGradient: 'radial-gradient(ellipse at 50% 0%, #1e3a5f 0%, #0f1f38 40%, #030814 100%)',
    meshGlowPrimary: 'rgba(251, 191, 36, 0.26)', // Or radieux
    meshGlowSecondary: 'rgba(56, 189, 248, 0.24)', // Azur
    accentBorder: 'border-amber-500/40',
    glowAccentColor: '#fbbf24',
    particleType: 'sunflare',
    badgeStyle: {
      bg: 'bg-amber-950/50',
      text: 'text-amber-200',
      border: 'border-amber-500/40'
    },
    cardHighlightBorder: 'hover:border-amber-400/50',
    lightingIntensity: 0.65
  }
};

export function isChristmasEventActive(): boolean {
  if (typeof window === 'undefined') return false;
  const override = localStorage.getItem('instant_meteo_secret_event');
  if (override === 'disabled') return false;
  if (override === 'noel') return true;

  const now = new Date();
  // Month is 0-indexed: 11 = December. Automatically active on 24th and 25th of December of every year.
  const isDec24or25 = now.getMonth() === 11 && (now.getDate() === 24 || now.getDate() === 25);
  return isDec24or25;
}

/**
 * Configure or reset Christmas event override
 */
export function setChristmasEventOverride(action: 'noel' | 'clear' | 'disabled'): boolean {
  if (typeof window === 'undefined') return false;
  if (action === 'noel') {
    localStorage.setItem('instant_meteo_secret_event', 'noel');
    return true;
  } else if (action === 'clear' || action === 'disabled') {
    const now = new Date();
    const isDec24or25 = now.getMonth() === 11 && (now.getDate() === 24 || now.getDate() === 25);
    // If currently on Dec 24/25, setting 'disabled' suppresses the auto-activation
    if (isDec24or25) {
      localStorage.setItem('instant_meteo_secret_event', 'disabled');
    } else {
      localStorage.removeItem('instant_meteo_secret_event');
    }
    return true;
  }
  return false;
}

export interface WeatherConditionParam {
  weatherCode?: number;
  precipitation?: number;
  temperature?: number;
  thunderstormRisk?: number;
  cloudCover?: number;
  isDay?: boolean;
}

/**
 * Gets theme config by key, dynamic real-time weather conditions or special events
 */
export function getAtmosphereTheme(
  timeOfDay: TimeOfDay, 
  season: Season, 
  ignoreEvent: boolean = false,
  weatherCondition?: WeatherConditionParam
): AtmosphereThemeConfig {
  if (!ignoreEvent && isChristmasEventActive()) {
    return NOEL_THEME;
  }

  // 🌦️ Real-time Weather Driven Background Adaptation
  if (weatherCondition) {
    const code = weatherCondition.weatherCode ?? 0;
    const precip = weatherCondition.precipitation ?? 0;
    const temp = weatherCondition.temperature ?? 20;
    const stormRisk = weatherCondition.thunderstormRisk ?? 0;
    const cloud = weatherCondition.cloudCover ?? 20;

    // 1. Thunderstorm Priority
    if ([95, 96, 99].includes(code) || stormRisk >= 45) {
      return WEATHER_THEMES['WEATHER_THUNDER'];
    }

    // 2. Snow & Ice Priority
    if ([71, 73, 75, 77, 85, 86].includes(code) || (temp <= 0.5 && precip > 0)) {
      return WEATHER_THEMES['WEATHER_SNOW'];
    }

    // 3. Rain & Showers Priority
    if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code) || precip > 0.2) {
      return WEATHER_THEMES['WEATHER_RAIN'];
    }

    // 4. Fog / Mist
    if ([45, 48].includes(code)) {
      return WEATHER_THEMES['WEATHER_FOG'];
    }

    // 5. Overcast (during Day)
    if (timeOfDay === 'DAY' && (code === 3 || cloud >= 85)) {
      return WEATHER_THEMES['WEATHER_OVERCAST'];
    }

    // 6. Radiant Sun / Warm Summer
    if (timeOfDay === 'DAY' && [0, 1, 2].includes(code) && temp >= 24) {
      return WEATHER_THEMES['WEATHER_SUNNY_WARM'];
    }
  }

  // Solar and Seasonal Time of Day Base Themes
  const key = `${timeOfDay}_${season}`;
  return ATMOSPHERE_THEMES[key] || ATMOSPHERE_THEMES['DAY_SUMMER'];
}

