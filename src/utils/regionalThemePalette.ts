import { LocationPoint } from '../types/weather';

export interface RegionalPalette {
  regionId: string;
  regionName: string;
  departmentName?: string;
  departmentCode?: string;
  crestEmoji: string;
  mottoOrLabel: string;
  primaryColor: string; // Hex
  secondaryColor: string; // Hex
  accentColor: string; // Hex
  glowLightPrimary: string; // rgba
  glowLightSecondary: string; // rgba
  lightBgGradient: string;
  badgeStyleLight: {
    bg: string;
    text: string;
    border: string;
  };
  cardAccentBorder: string;
}

/**
 * Mappe n'importe quelle station vers sa palette territoriale d'identité.
 * RÈGLES CRITIQUES EXPLICITES :
 * 1. La Loire-Atlantique (44) est STRICTEMENT rattachée à la Bretagne (Hermine, Granit & Cyan Armor BZH)
 * 2. Le Québec dispose de ses couleurs habituelles (Bleu royal fleurdelisé #003399 et blanc boréal)
 * 3. Le Pas-de-Calais (62) arbore ses couleurs or et azur des Flandres / Artois / Côte d'Opale
 */
export function getRegionalPaletteForStation(station?: LocationPoint | null): RegionalPalette {
  if (!station) {
    return DEFAULT_FRANCE_PALETTE;
  }

  const deptRaw = (station.department || '').toLowerCase();
  const nameRaw = (station.name || '').toLowerCase();
  const regionRaw = (station.region || '').toLowerCase();
  const countryRaw = (station.country || '').toLowerCase();
  const lat = station.latitude || 46.5;
  const lon = station.longitude || 2.5;

  // 1. QUÉBEC (CANADA)
  const isQuebec = 
    countryRaw.includes('canada') || 
    countryRaw.includes('québec') || 
    countryRaw.includes('quebec') || 
    regionRaw.includes('québec') || 
    regionRaw.includes('quebec') ||
    deptRaw.includes('québec') ||
    deptRaw.includes('quebec') ||
    nameRaw.includes('montréal') ||
    nameRaw.includes('montreal') ||
    nameRaw.includes('québec') ||
    nameRaw.includes('quebec') ||
    nameRaw.includes('sherbrooke') ||
    nameRaw.includes('gatineau') ||
    nameRaw.includes('saguenay') ||
    nameRaw.includes('trois-rivières') ||
    (lat >= 45.0 && lat <= 62.0 && lon >= -80.0 && lon <= -57.0);

  if (isQuebec) {
    return {
      regionId: 'quebec',
      regionName: 'Québec',
      departmentName: 'Belle Province',
      crestEmoji: '⚜️',
      mottoOrLabel: 'Je me souviens • Québec Fleurdelisé',
      primaryColor: '#003399', // Bleu royal du drapeau québécois
      secondaryColor: '#FFFFFF', // Blanc pur
      accentColor: '#1d4ed8', // Bleu Saint-Laurent
      glowLightPrimary: 'rgba(0, 51, 153, 0.22)',
      glowLightSecondary: 'rgba(59, 130, 246, 0.18)',
      lightBgGradient: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 45%, #f1f5f9 100%)',
      badgeStyleLight: {
        bg: 'bg-blue-50 text-blue-900 border-blue-400',
        text: 'text-blue-900',
        border: 'border-blue-400'
      },
      cardAccentBorder: 'hover:border-[#003399]/60'
    };
  }

  // 2. BRETAGNE (INCLUANT STRICTEMENT LA LOIRE-ATLANTIQUE 44)
  const isLoireAtlantique = 
    deptRaw.includes('44') || 
    deptRaw.includes('loire-atlantique') || 
    deptRaw.includes('loire atlantique') ||
    nameRaw.includes('nantes') ||
    nameRaw.includes('saint-nazaire') ||
    nameRaw.includes('st-nazaire') ||
    nameRaw.includes('guérande') ||
    nameRaw.includes('pornic') ||
    nameRaw.includes('châteaubriant') ||
    nameRaw.includes('ancenis');

  const isBretagne = 
    isLoireAtlantique ||
    deptRaw.includes('29') || deptRaw.includes('finistère') || deptRaw.includes('finistere') ||
    deptRaw.includes('22') || deptRaw.includes('côtes-d\'armor') || deptRaw.includes('cotes-d\'armor') ||
    deptRaw.includes('56') || deptRaw.includes('morbihan') ||
    deptRaw.includes('35') || deptRaw.includes('ille-et-vilaine') ||
    regionRaw.includes('bretagne') ||
    nameRaw.includes('rennes') || nameRaw.includes('brest') || nameRaw.includes('quimper') || 
    nameRaw.includes('lorient') || nameRaw.includes('vannes') || nameRaw.includes('saint-malo');

  if (isBretagne) {
    return {
      regionId: 'bretagne',
      regionName: isLoireAtlantique ? 'Bretagne (Loire-Atlantique 44)' : 'Bretagne (BZH)',
      departmentName: isLoireAtlantique ? 'Loire-Atlantique (44)' : station.department || 'Bretagne',
      departmentCode: isLoireAtlantique ? '44' : (station.department?.match(/\d{2}/)?.[0] || 'BZH'),
      crestEmoji: '⛵',
      mottoOrLabel: 'Kentoc\'h mervel eget bezañ saotret • Gwenn-ha-Du',
      primaryColor: '#0f172a', // Noir ardoise Gwenn-ha-Du
      secondaryColor: '#f8fafc', // Blanc hermine
      accentColor: '#0284c7', // Cyan Armor & Océan Atlantique
      glowLightPrimary: 'rgba(2, 132, 199, 0.20)', // Cyan océanique
      glowLightSecondary: 'rgba(15, 23, 42, 0.12)', // Granit
      lightBgGradient: 'linear-gradient(135deg, #f0f9ff 0%, #ffffff 45%, #f8fafc 100%)',
      badgeStyleLight: {
        bg: 'bg-sky-50 text-sky-950 border-sky-400',
        text: 'text-sky-950',
        border: 'border-sky-400'
      },
      cardAccentBorder: 'hover:border-sky-500/70'
    };
  }

  // 3. PAS-DE-CALAIS (62) / HAUTS-DE-FRANCE
  const isPasDeCalais = 
    deptRaw.includes('62') || 
    deptRaw.includes('pas-de-calais') || 
    deptRaw.includes('pas de calais') ||
    nameRaw.includes('calais') || nameRaw.includes('arras') || nameRaw.includes('lens') ||
    nameRaw.includes('boulogne') || nameRaw.includes('béthune') || nameRaw.includes('bethune') ||
    nameRaw.includes('saint-omer') || nameRaw.includes('st-omer') || nameRaw.includes('touquet') ||
    nameRaw.includes('berck') || nameRaw.includes('bruay') || nameRaw.includes('liévain') ||
    (lat >= 50.05 && lat <= 51.05 && lon >= 1.55 && lon <= 3.20);

  if (isPasDeCalais) {
    return {
      regionId: 'pas_de_calais',
      regionName: 'Hauts-de-France',
      departmentName: 'Pas-de-Calais (62)',
      departmentCode: '62',
      crestEmoji: '🏰',
      mottoOrLabel: 'Côte d\'Opale & Artois • Or et Azur',
      primaryColor: '#1e3a8a', // Bleu azur royal
      secondaryColor: '#eab308', // Or flamand
      accentColor: '#0284c7', // Bleu Côte d'Opale
      glowLightPrimary: 'rgba(30, 58, 138, 0.18)',
      glowLightSecondary: 'rgba(234, 179, 8, 0.20)',
      lightBgGradient: 'linear-gradient(135deg, #fefce8 0%, #ffffff 40%, #eff6ff 100%)',
      badgeStyleLight: {
        bg: 'bg-amber-50 text-amber-950 border-amber-400',
        text: 'text-amber-950',
        border: 'border-amber-400'
      },
      cardAccentBorder: 'hover:border-amber-500/70'
    };
  }

  // 4. AUTRES DÉPARTEMENTS HAUTS-DE-FRANCE (59, 80, 60, 02)
  if (deptRaw.includes('59') || deptRaw.includes('80') || deptRaw.includes('60') || deptRaw.includes('02') || regionRaw.includes('hauts-de-france')) {
    return {
      regionId: 'hauts_de_france',
      regionName: 'Hauts-de-France',
      departmentName: station.department || 'Nord',
      departmentCode: station.department?.match(/\d{2}/)?.[0] || '59',
      crestEmoji: '🦁',
      mottoOrLabel: 'Terres du Nord & Flandres',
      primaryColor: '#1e3a8a',
      secondaryColor: '#eab308',
      accentColor: '#38bdf8',
      glowLightPrimary: 'rgba(30, 58, 138, 0.16)',
      glowLightSecondary: 'rgba(234, 179, 8, 0.16)',
      lightBgGradient: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 50%, #eff6ff 100%)',
      badgeStyleLight: {
        bg: 'bg-blue-50 text-blue-900 border-blue-300',
        text: 'text-blue-900',
        border: 'border-blue-300'
      },
      cardAccentBorder: 'hover:border-blue-400'
    };
  }

  // 5. PROVENCE-ALPES-CÔTE D'AZUR (PACA)
  if (regionRaw.includes('paca') || regionRaw.includes('provence') || deptRaw.includes('13') || deptRaw.includes('83') || deptRaw.includes('06') || deptRaw.includes('84') || deptRaw.includes('04') || deptRaw.includes('05')) {
    return {
      regionId: 'paca',
      regionName: 'Provence-Alpes-Côte d\'Azur',
      departmentName: station.department || 'PACA',
      departmentCode: station.department?.match(/\d{2}/)?.[0] || '13',
      crestEmoji: '☀️',
      mottoOrLabel: 'Soleil de Provence & Lavande d\'Or',
      primaryColor: '#f59e0b',
      secondaryColor: '#7c3aed',
      accentColor: '#0284c7',
      glowLightPrimary: 'rgba(245, 158, 11, 0.22)',
      glowLightSecondary: 'rgba(124, 58, 237, 0.18)',
      lightBgGradient: 'linear-gradient(135deg, #fffbeb 0%, #ffffff 40%, #faf5ff 100%)',
      badgeStyleLight: {
        bg: 'bg-amber-50 text-amber-950 border-amber-300',
        text: 'text-amber-950',
        border: 'border-amber-300'
      },
      cardAccentBorder: 'hover:border-amber-400'
    };
  }

  // 6. OCCITANIE
  if (regionRaw.includes('occitanie') || deptRaw.includes('31') || deptRaw.includes('34') || deptRaw.includes('30') || deptRaw.includes('66') || deptRaw.includes('11') || deptRaw.includes('81')) {
    return {
      regionId: 'occitanie',
      regionName: 'Occitanie',
      departmentName: station.department || 'Occitanie',
      departmentCode: station.department?.match(/\d{2}/)?.[0] || '31',
      crestEmoji: '⚔️',
      mottoOrLabel: 'Croix Occitane • Sang et Or',
      primaryColor: '#b91c1c',
      secondaryColor: '#facc15',
      accentColor: '#ea580c',
      glowLightPrimary: 'rgba(185, 28, 28, 0.18)',
      glowLightSecondary: 'rgba(250, 204, 21, 0.20)',
      lightBgGradient: 'linear-gradient(135deg, #fef2f2 0%, #ffffff 45%, #fefce8 100%)',
      badgeStyleLight: {
        bg: 'bg-rose-50 text-rose-950 border-rose-300',
        text: 'text-rose-950',
        border: 'border-rose-300'
      },
      cardAccentBorder: 'hover:border-rose-400'
    };
  }

  // 7. NORMANDIE
  if (regionRaw.includes('normandie') || deptRaw.includes('76') || deptRaw.includes('14') || deptRaw.includes('50') || deptRaw.includes('27') || deptRaw.includes('61')) {
    return {
      regionId: 'normandie',
      regionName: 'Normandie',
      departmentName: station.department || 'Normandie',
      departmentCode: station.department?.match(/\d{2}/)?.[0] || '76',
      crestEmoji: '🍎',
      mottoOrLabel: 'Les Deux Léopards d\'Or',
      primaryColor: '#dc2626',
      secondaryColor: '#ca8a04',
      accentColor: '#0284c7',
      glowLightPrimary: 'rgba(220, 38, 38, 0.16)',
      glowLightSecondary: 'rgba(202, 138, 4, 0.18)',
      lightBgGradient: 'linear-gradient(135deg, #fef2f2 0%, #ffffff 45%, #fefce8 100%)',
      badgeStyleLight: {
        bg: 'bg-red-50 text-red-950 border-red-300',
        text: 'text-red-950',
        border: 'border-red-300'
      },
      cardAccentBorder: 'hover:border-red-400'
    };
  }

  // 8. GRAND EST / ALSACE
  if (regionRaw.includes('grand est') || regionRaw.includes('alsace') || deptRaw.includes('67') || deptRaw.includes('68') || deptRaw.includes('88') || deptRaw.includes('57') || deptRaw.includes('54')) {
    return {
      regionId: 'grand_est',
      regionName: 'Grand Est (Alsace & Vosges)',
      departmentName: station.department || 'Grand Est',
      departmentCode: station.department?.match(/\d{2}/)?.[0] || '67',
      crestEmoji: '🌲',
      mottoOrLabel: 'Vosges & Terroir Rhénan',
      primaryColor: '#e11d48',
      secondaryColor: '#15803d',
      accentColor: '#0284c7',
      glowLightPrimary: 'rgba(225, 29, 72, 0.16)',
      glowLightSecondary: 'rgba(21, 128, 61, 0.16)',
      lightBgGradient: 'linear-gradient(135deg, #fff1f2 0%, #ffffff 45%, #f0fdf4 100%)',
      badgeStyleLight: {
        bg: 'bg-rose-50 text-rose-950 border-rose-300',
        text: 'text-rose-950',
        border: 'border-rose-300'
      },
      cardAccentBorder: 'hover:border-rose-400'
    };
  }

  // 9. AUVERGNE-RHÔNE-ALPES
  if (regionRaw.includes('auvergne') || regionRaw.includes('rhône') || regionRaw.includes('alpes') || deptRaw.includes('69') || deptRaw.includes('38') || deptRaw.includes('73') || deptRaw.includes('74') || deptRaw.includes('63') || deptRaw.includes('42') || deptRaw.includes('01')) {
    return {
      regionId: 'ara',
      regionName: 'Auvergne-Rhône-Alpes',
      departmentName: station.department || 'AURA',
      departmentCode: station.department?.match(/\d{2}/)?.[0] || '69',
      crestEmoji: '🏔️',
      mottoOrLabel: 'Alpes, Volcans & Vallée du Rhône',
      primaryColor: '#0284c7',
      secondaryColor: '#334155',
      accentColor: '#06b6d4',
      glowLightPrimary: 'rgba(2, 132, 199, 0.18)',
      glowLightSecondary: 'rgba(51, 65, 85, 0.14)',
      lightBgGradient: 'linear-gradient(135deg, #f0f9ff 0%, #ffffff 45%, #f8fafc 100%)',
      badgeStyleLight: {
        bg: 'bg-cyan-50 text-cyan-950 border-cyan-300',
        text: 'text-cyan-950',
        border: 'border-cyan-300'
      },
      cardAccentBorder: 'hover:border-cyan-400'
    };
  }

  // 10. ÎLE-DE-FRANCE
  if (regionRaw.includes('île-de-france') || regionRaw.includes('ile-de-france') || deptRaw.includes('75') || deptRaw.includes('78') || deptRaw.includes('92') || deptRaw.includes('93') || deptRaw.includes('94') || deptRaw.includes('95') || deptRaw.includes('77') || deptRaw.includes('91')) {
    return {
      regionId: 'idf',
      regionName: 'Île-de-France',
      departmentName: station.department || 'Paris / Île-de-France',
      departmentCode: station.department?.match(/\d{2}/)?.[0] || '75',
      crestEmoji: '🗼',
      mottoOrLabel: 'Fluctuat nec mergitur',
      primaryColor: '#2563eb',
      secondaryColor: '#d97706',
      accentColor: '#0284c7',
      glowLightPrimary: 'rgba(37, 99, 235, 0.18)',
      glowLightSecondary: 'rgba(217, 119, 6, 0.16)',
      lightBgGradient: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 45%, #fffbeb 100%)',
      badgeStyleLight: {
        bg: 'bg-blue-50 text-blue-950 border-blue-300',
        text: 'text-blue-950',
        border: 'border-blue-300'
      },
      cardAccentBorder: 'hover:border-blue-400'
    };
  }

  return DEFAULT_FRANCE_PALETTE;
}

const DEFAULT_FRANCE_PALETTE: RegionalPalette = {
  regionId: 'france_nationale',
  regionName: 'France Métropole',
  departmentName: 'Territoire National',
  crestEmoji: '🇫🇷',
  mottoOrLabel: 'Réseau Météorologique Ouvert',
  primaryColor: '#0284c7',
  secondaryColor: '#3b82f6',
  accentColor: '#0ea5e9',
  glowLightPrimary: 'rgba(2, 132, 199, 0.18)',
  glowLightSecondary: 'rgba(59, 130, 246, 0.14)',
  lightBgGradient: 'linear-gradient(135deg, #f0f9ff 0%, #ffffff 45%, #f8fafc 100%)',
  badgeStyleLight: {
    bg: 'bg-sky-50 text-sky-950 border-sky-300',
    text: 'text-sky-950',
    border: 'border-sky-300'
  },
  cardAccentBorder: 'hover:border-sky-400'
};
