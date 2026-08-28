import { FullNationalDigest } from '../types/weather';

export interface TerritoryDefinition {
  id: string;
  name: string;
  flag: string;
  category: 'France Métropolitaine' | 'Grandes Régions Françaises' | 'Outre-Mer (DOM-TOM)' | 'Pays Limitrophes';
  departmentCount: number;
  baseTempSummer: number;
}

export const TERRITORIES_LIST: TerritoryDefinition[] = [
  { id: 'france-metropole', name: 'France Métropolitaine', flag: '🇫🇷', category: 'France Métropolitaine', departmentCount: 96, baseTempSummer: 24.5 },
  { id: 'ile-de-france', name: 'Île-de-France', flag: '🏛️', category: 'Grandes Régions Françaises', departmentCount: 8, baseTempSummer: 25.2 },
  { id: 'nouvelle-aquitaine', name: 'Nouvelle-Aquitaine', flag: '🍇', category: 'Grandes Régions Françaises', departmentCount: 12, baseTempSummer: 27.1 },
  { id: 'occitanie', name: 'Occitanie', flag: '☀️', category: 'Grandes Régions Françaises', departmentCount: 13, baseTempSummer: 28.6 },
  { id: 'auvergne-rhone-alpes', name: 'Auvergne-Rhône-Alpes', flag: '⛰️', category: 'Grandes Régions Françaises', departmentCount: 12, baseTempSummer: 25.8 },
  { id: 'provence-alpes-cote-azur', name: "Provence-Alpes-Côte d'Azur", flag: '🏖️', category: 'Grandes Régions Françaises', departmentCount: 6, baseTempSummer: 29.4 },
  { id: 'bretagne', name: 'Bretagne', flag: '🌊', category: 'Grandes Régions Françaises', departmentCount: 4, baseTempSummer: 21.8 },
  { id: 'hauts-de-france', name: 'Hauts-de-France', flag: '🏰', category: 'Grandes Régions Françaises', departmentCount: 5, baseTempSummer: 22.4 },
  { id: 'grand-est', name: 'Grand Est', flag: '🌲', category: 'Grandes Régions Françaises', departmentCount: 10, baseTempSummer: 24.0 },
  { id: 'guadeloupe-martinique', name: 'Antilles (Guadeloupe & Martinique)', flag: '🌴', category: 'Outre-Mer (DOM-TOM)', departmentCount: 2, baseTempSummer: 31.2 },
  { id: 'reunion-mayotte', name: 'Océan Indien (La Réunion & Mayotte)', flag: '🌋', category: 'Outre-Mer (DOM-TOM)', departmentCount: 2, baseTempSummer: 27.5 },
  { id: 'guyane', name: 'Guyane Française', flag: '🦜', category: 'Outre-Mer (DOM-TOM)', departmentCount: 1, baseTempSummer: 32.0 },
  { id: 'suisse-romande', name: 'Suisse & Arc Lémanique', flag: '🇨🇭', category: 'Pays Limitrophes', departmentCount: 4, baseTempSummer: 23.5 },
  { id: 'belgique', name: 'Belgique & Wallonie', flag: '🇧🇪', category: 'Pays Limitrophes', departmentCount: 5, baseTempSummer: 22.0 }
];

export function generateNationalDigest(territoryId: string = 'france-metropole'): FullNationalDigest {
  const territory = TERRITORIES_LIST.find((t) => t.id === territoryId) || TERRITORIES_LIST[0];
  const now = new Date();
  
  const dateFormatted = now.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const timeFormatted = now.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  // Data generator tailored by territory
  let tMaxVal = 32.4;
  let tMaxStation = 'Nîmes-Courbessac';
  let tMaxDept = 'Gard (30)';
  let tMinVal = 8.6;
  let tMinStation = 'Mouthe';
  let tMinDept = 'Doubs (25)';
  let maxRainVal = 38.4;
  let maxRainStation = 'Brest-Guipavas';
  let maxRainDept = 'Finistère (29)';
  let maxWindVal = 92;
  let maxWindStation = 'Cap Béar';
  let maxWindDept = 'Pyrénées-Orientales (66)';
  let meanTemp = 22.8;
  let tempAnomaly = 1.6;
  let lightningCount = 4280;

  if (territory.id === 'bretagne') {
    tMaxVal = 24.8;
    tMaxStation = 'Rennes-St Jacques';
    tMaxDept = 'Ille-et-Vilaine (35)';
    tMinVal = 12.1;
    tMinStation = 'Rostrenen';
    tMinDept = 'Côtes-d\'Armor (22)';
    maxRainVal = 44.2;
    maxRainStation = 'Ouessant';
    maxRainDept = 'Finistère (29)';
    maxWindVal = 88;
    maxWindStation = 'Pointe du Raz';
    maxWindDept = 'Finistère (29)';
    meanTemp = 18.9;
    tempAnomaly = 0.4;
    lightningCount = 320;
  } else if (territory.id === 'provence-alpes-cote-azur' || territory.id === 'occitanie') {
    tMaxVal = 35.8;
    tMaxStation = 'Le Luc en Provence';
    tMaxDept = 'Var (83)';
    tMinVal = 16.4;
    tMinStation = 'Barcelonnette';
    tMinDept = 'Alpes-de-Haute-Provence (04)';
    maxRainVal = 0.0;
    maxRainStation = 'Toulon';
    maxRainDept = 'Var (83)';
    maxWindVal = 104;
    maxWindStation = 'Mont Aigoual';
    maxWindDept = 'Gard (30)';
    meanTemp = 27.4;
    tempAnomaly = 2.8;
    lightningCount = 1450;
  } else if (territory.id.includes('antilles') || territory.id.includes('guadeloupe')) {
    tMaxVal = 33.6;
    tMaxStation = 'Le Raizet';
    tMaxDept = 'Guadeloupe (971)';
    tMinVal = 24.2;
    tMinStation = 'Le Lamentin';
    tMinDept = 'Martinique (972)';
    maxRainVal = 62.0;
    maxRainStation = 'Saint-Claude (Soufrière)';
    maxRainDept = 'Guadeloupe (971)';
    maxWindVal = 75;
    maxWindStation = 'La Caravelle';
    maxWindDept = 'Martinique (972)';
    meanTemp = 28.5;
    tempAnomaly = 0.8;
    lightningCount = 2890;
  }

  return {
    lastUpdated: `${dateFormatted} à ${timeFormatted}`,
    territoryId: territory.id,
    territoryName: territory.name,
    flag: territory.flag,
    daily: {
      date: dateFormatted,
      tMaxNational: {
        value: tMaxVal,
        stationName: tMaxStation,
        department: tMaxDept,
        comment: 'Relevé sous abri normalisé OMM / Météo-France à 16h45 UTC.'
      },
      tMinNational: {
        value: tMinVal,
        stationName: tMinStation,
        department: tMinDept,
        comment: 'Relevé à l\'aube (06h12 UTC) favorisé par un ciel nocturne dégagé.'
      },
      maxPrecipitation24h: {
        value: maxRainVal,
        stationName: maxRainStation,
        department: maxRainDept,
        comment: maxRainVal > 0 ? 'Cumul sur 24h glissantes (pluviomètre à augets basculants).' : 'Temps sec généralisé sur les stations.'
      },
      maxWindGust: {
        value: maxWindVal,
        stationName: maxWindStation,
        department: maxWindDept,
        comment: 'Rafale instantanée mesurée par anémomètre ultrasonique.'
      },
      nationalMeanTemp: meanTemp,
      nationalTempAnomalyVsNormal: tempAnomaly,
      totalLightningStrikesCount: lightningCount,
      sunshineAverageHours: 9.4,
      sunshineAnomalyPct: 18,
      synopticSituation: `Marais barométrique sur ${territory.name} avec flux modéré. Déclenchement d'évolutions diurnes et orages convectifs locaux en fin d'après-midi, contrastant avec de belles éclaircies en plaine.`,
      keyHighlights: [
        `Tmax maximale observée de ${tMaxVal}°C à ${tMaxStation} (${tMaxDept}).`,
        `Écart thermique moyen de ${tempAnomaly > 0 ? `+${tempAnomaly}` : tempAnomaly}°C par rapport à la normale de saison 1991-2020.`,
        `${lightningCount > 0 ? `${lightningCount.toLocaleString('fr-FR')} éclairs enregistrés par le réseau de détection.` : 'Activité orageuse nulle.'}`,
        `Vent de pointe enregistré à ${maxWindVal} km/h (${maxWindStation}).`
      ],
      vigilancesSummary: [
        {
          level: 'ORANGE',
          phenomenon: 'Orages Violents & Fortes Rafales',
          territoryName: territory.name,
          details: 'Cellules orageuses actives accompagnées de grêle locale et rafales pouvant atteindre 80-100 km/h.'
        },
        {
          level: 'JAUNE',
          phenomenon: 'Canicule & Chaleur Intense',
          territoryName: territory.name,
          details: 'Températures nocturnes ne descendant pas sous 20°C dans les agglomérations.'
        },
        {
          level: 'VERT',
          phenomenon: 'Inondation & Crues',
          territoryName: territory.name,
          details: 'Niveaux des cours d\'eau et nappes dans la normale saisonnière.'
        }
      ]
    },
    weekly: {
      weeklyMeanTemp: Number((meanTemp - 0.4).toFixed(1)),
      weeklyTempAnomalyVsNormal: tempAnomaly,
      weeklyMeanPrecipitationMm: 16.8,
      weeklyPrecipAnomalyPct: -14,
      soilMoistureStatus: 'Indice d\'humidité des sols superficiels en légère baisse (-12% vs normale).',
      weeklySunshineTotalHours: 62.4,
      rainDaysCount: 2,
      fullSunDaysCount: 4,
      weeklyMaxGustKmh: Math.max(maxWindVal, 102),
      weeklyMaxGustStation: `${maxWindStation} (${maxWindDept})`,
      notableMilestones: [
        {
          dayLabel: 'Mercredi',
          eventTitle: 'Pic de chaleur hebdomadaire',
          severity: 'record',
          description: `Températures atteignant ${tMaxVal}°C sur le quart sud et les plaines intérieures.`
        },
        {
          dayLabel: 'Jeudi soir',
          eventTitle: 'Passage orageux pré-frontal',
          severity: 'warning',
          description: 'Ligne convective active avec fortes intensités pluvieuses en moins d\'une heure.'
        },
        {
          dayLabel: 'Dimanche',
          eventTitle: 'Retour des éclaircies franches',
          severity: 'info',
          description: 'Hausse des pressions (1020 hPa) garantissant une belle stabilité diurne.'
        }
      ],
      brokenRecordsList: [
        {
          stationName: `${tMaxStation} (${tMaxDept})`,
          date: dateFormatted,
          metric: 'Tmax quotidienne',
          newValue: `${tMaxVal}°C`,
          oldValue: `${(tMaxVal - 0.4).toFixed(1)}°C`,
          previousYear: 2018
        },
        {
          stationName: 'Gourdon-Bouriane (46)',
          date: 'Hier',
          metric: 'Durée d\'ensoleillement continue',
          newValue: '14.2 h',
          oldValue: '13.9 h',
          previousYear: 2020
        }
      ],
      weeklySynthesis: `Sur les 7 derniers jours, ${territory.name} a connu un régime globalement chaud avec un excédent thermique moyen de +${tempAnomaly}°C. L'ensoleillement a été généreux (62.4h cumulées) avec des épisodes orageux intermittents.`
    }
  };
}
