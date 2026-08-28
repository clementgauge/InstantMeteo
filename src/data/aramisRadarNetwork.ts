/**
 * Réseau National de Radars Météorologiques ARAMIS & RHYTMME (Météo-France)
 * 34 Stations Radar Doppler & Double Polarisation couvrant l'Hexagone, la Corse et l'Outre-Mer.
 */

export interface AramisRadarStation {
  id: string;
  name: string;
  region: string;
  department: string;
  latitude: number;
  longitude: number;
  altitudeMeters: number;
  band: 'Bande C (5.6 GHz)' | 'Bande S (2.8 GHz)' | 'Bande X (9.4 GHz)';
  polarization: 'Double Polarisation (Dual-Pol)' | 'Simple Polarisation';
  dopplerRangeKm: number;
  coverageRadiusKm: number;
  operationalStatus: 'Opérationnel 100%' | 'Maintenance programmée' | 'Calibration Doppler';
  commissioningYear: number;
  specialization: string;
}

export const ARAMIS_RADAR_STATIONS: AramisRadarStation[] = [
  {
    id: 'trappes',
    name: 'Trappes - Île-de-France',
    region: 'Île-de-France',
    department: 'Yvelines (78)',
    latitude: 48.7744,
    longitude: 2.0125,
    altitudeMeters: 168,
    band: 'Bande C (5.6 GHz)',
    polarization: 'Double Polarisation (Dual-Pol)',
    dopplerRangeKm: 250,
    coverageRadiusKm: 200,
    operationalStatus: 'Opérationnel 100%',
    commissioningYear: 1982,
    specialization: 'Surveillance Bassin Parisien, aéroports Roissy-CDG & Orly'
  },
  {
    id: 'abbeville',
    name: 'Abbeville - Baie de Somme',
    region: 'Hauts-de-France',
    department: 'Somme (80)',
    latitude: 50.1386,
    longitude: 1.8336,
    altitudeMeters: 72,
    band: 'Bande C (5.6 GHz)',
    polarization: 'Double Polarisation (Dual-Pol)',
    dopplerRangeKm: 250,
    coverageRadiusKm: 200,
    operationalStatus: 'Opérationnel 100%',
    commissioningYear: 1989,
    specialization: 'Surveillance frontale Manche et Hauts-de-France'
  },
  {
    id: 'falaise',
    name: 'Falaise - Mont Pinçon',
    region: 'Normandie',
    department: 'Calvados (14)',
    latitude: 48.8936,
    longitude: -0.1989,
    altitudeMeters: 180,
    band: 'Bande C (5.6 GHz)',
    polarization: 'Double Polarisation (Dual-Pol)',
    dopplerRangeKm: 250,
    coverageRadiusKm: 200,
    operationalStatus: 'Opérationnel 100%',
    commissioningYear: 1984,
    specialization: 'Détection des perturbations atlantiques et Manche'
  },
  {
    id: 'brest',
    name: 'Brest - Guipavas',
    region: 'Bretagne',
    department: 'Finistère (29)',
    latitude: 48.4480,
    longitude: -4.4170,
    altitudeMeters: 105,
    band: 'Bande C (5.6 GHz)',
    polarization: 'Double Polarisation (Dual-Pol)',
    dopplerRangeKm: 250,
    coverageRadiusKm: 220,
    operationalStatus: 'Opérationnel 100%',
    commissioningYear: 1981,
    specialization: 'Première ligne d\'entrée des tempêtes atlantiques'
  },
  {
    id: 'bourges',
    name: 'Bourges - Centre',
    region: 'Centre-Val de Loire',
    department: 'Cher (18)',
    latitude: 47.0583,
    longitude: 2.3703,
    altitudeMeters: 161,
    band: 'Bande C (5.6 GHz)',
    polarization: 'Double Polarisation (Dual-Pol)',
    dopplerRangeKm: 250,
    coverageRadiusKm: 200,
    operationalStatus: 'Opérationnel 100%',
    commissioningYear: 1987,
    specialization: 'Couverture centrale de l\'Hexagone et suivi orageux'
  },
  {
    id: 'nancy',
    name: 'Nancy - Forêt d\'Amance',
    region: 'Grand Est',
    department: 'Meurthe-et-Moselle (54)',
    latitude: 48.7533,
    longitude: 6.2750,
    altitudeMeters: 395,
    band: 'Bande C (5.6 GHz)',
    polarization: 'Double Polarisation (Dual-Pol)',
    dopplerRangeKm: 250,
    coverageRadiusKm: 200,
    operationalStatus: 'Opérationnel 100%',
    commissioningYear: 1985,
    specialization: 'Surveillance Lorraine, Vosges et frontières nord-est'
  },
  {
    id: 'blaisy-haut',
    name: 'Blaisy-Haut - Bourgogne',
    region: 'Bourgogne-Franche-Comté',
    department: 'Côte-d\'Or (21)',
    latitude: 47.3719,
    longitude: 4.7431,
    altitudeMeters: 580,
    band: 'Bande C (5.6 GHz)',
    polarization: 'Double Polarisation (Dual-Pol)',
    dopplerRangeKm: 250,
    coverageRadiusKm: 200,
    operationalStatus: 'Opérationnel 100%',
    commissioningYear: 1988,
    specialization: 'Surveillance du seuil de Bourgogne et axe Saône-Rhône'
  },
  {
    id: 'bordeaux',
    name: 'Bordeaux - Mérignac',
    region: 'Nouvelle-Aquitaine',
    department: 'Gironde (33)',
    latitude: 44.8306,
    longitude: -0.6914,
    altitudeMeters: 47,
    band: 'Bande C (5.6 GHz)',
    polarization: 'Double Polarisation (Dual-Pol)',
    dopplerRangeKm: 250,
    coverageRadiusKm: 210,
    operationalStatus: 'Opérationnel 100%',
    commissioningYear: 1983,
    specialization: 'Surveillance Golfe de Gascogne et orages aquitains'
  },
  {
    id: 'toulouse',
    name: 'Toulouse - Blagnac / Météopole',
    region: 'Occitanie',
    department: 'Haute-Garonne (31)',
    latitude: 43.6294,
    longitude: 1.3639,
    altitudeMeters: 151,
    band: 'Bande C (5.6 GHz)',
    polarization: 'Double Polarisation (Dual-Pol)',
    dopplerRangeKm: 250,
    coverageRadiusKm: 200,
    operationalStatus: 'Opérationnel 100%',
    commissioningYear: 1980,
    specialization: 'Surveillance Midi toulousain, Piémont pyrénéen'
  },
  {
    id: 'nimes',
    name: 'Nîmes - Courbessac',
    region: 'Occitanie',
    department: 'Gard (30)',
    latitude: 43.8569,
    longitude: 4.4064,
    altitudeMeters: 60,
    band: 'Bande S (2.8 GHz)',
    polarization: 'Double Polarisation (Dual-Pol)',
    dopplerRangeKm: 250,
    coverageRadiusKm: 220,
    operationalStatus: 'Opérationnel 100%',
    commissioningYear: 1993,
    specialization: 'Radar Bande S insensibilité à l\'atténuation des épisodes cévenols'
  },
  {
    id: 'bollene',
    name: 'Bollène - Tricastin',
    region: 'Provence-Alpes-Côte d\'Azur',
    department: 'Vaucluse (84)',
    latitude: 44.2833,
    longitude: 4.7500,
    altitudeMeters: 240,
    band: 'Bande S (2.8 GHz)',
    polarization: 'Double Polarisation (Dual-Pol)',
    dopplerRangeKm: 250,
    coverageRadiusKm: 200,
    operationalStatus: 'Opérationnel 100%',
    commissioningYear: 1996,
    specialization: 'Axe rhodanien et orages violents méditerranéens'
  },
  {
    id: 'collobrieres',
    name: 'Collobrières - Massif des Maures',
    region: 'Provence-Alpes-Côte d\'Azur',
    department: 'Var (83)',
    latitude: 43.2389,
    longitude: 6.3097,
    altitudeMeters: 645,
    band: 'Bande S (2.8 GHz)',
    polarization: 'Double Polarisation (Dual-Pol)',
    dopplerRangeKm: 250,
    coverageRadiusKm: 220,
    operationalStatus: 'Opérationnel 100%',
    commissioningYear: 1995,
    specialization: 'Surveillance Côte d\'Azur, Golfe de Gênes et épisodes méditerranéens'
  },
  {
    id: 'montclar',
    name: 'Montclar - RHYTMME (Haute-Provence)',
    region: 'Provence-Alpes-Côte d\'Azur',
    department: 'Alpes-de-Haute-Provence (04)',
    latitude: 44.3986,
    longitude: 6.3411,
    altitudeMeters: 1980,
    band: 'Bande X (9.4 GHz)',
    polarization: 'Double Polarisation (Dual-Pol)',
    dopplerRangeKm: 120,
    coverageRadiusKm: 100,
    operationalStatus: 'Opérationnel 100%',
    commissioningYear: 2012,
    specialization: 'Radar haute résolution en relief alpin (RHYTMME)'
  },
  {
    id: 'vars',
    name: 'Vars - Crête du Mayt (RHYTMME)',
    region: 'Provence-Alpes-Côte d\'Azur',
    department: 'Hautes-Alpes (05)',
    latitude: 44.5950,
    longitude: 6.6917,
    altitudeMeters: 2200,
    band: 'Bande X (9.4 GHz)',
    polarization: 'Double Polarisation (Dual-Pol)',
    dopplerRangeKm: 120,
    coverageRadiusKm: 100,
    operationalStatus: 'Opérationnel 100%',
    commissioningYear: 2014,
    specialization: 'Suivi nivologique et crues éclairs alpines'
  },
  {
    id: 'saint-nizier',
    name: 'Saint-Nizier-du-Moucherotte (Vercors / RHYTMME)',
    region: 'Auvergne-Rhône-Alpes',
    department: 'Isère (38)',
    latitude: 45.1667,
    longitude: 5.6333,
    altitudeMeters: 1800,
    band: 'Bande X (9.4 GHz)',
    polarization: 'Double Polarisation (Dual-Pol)',
    dopplerRangeKm: 120,
    coverageRadiusKm: 100,
    operationalStatus: 'Opérationnel 100%',
    commissioningYear: 2013,
    specialization: 'Surveillance bassin grenoblois, Vercors et Chartreuse'
  },
  {
    id: 'mont-colombis',
    name: 'Mont Colombis - Gap (RHYTMME)',
    region: 'Provence-Alpes-Côte d\'Azur',
    department: 'Hautes-Alpes (05)',
    latitude: 44.4833,
    longitude: 6.2167,
    altitudeMeters: 1733,
    band: 'Bande X (9.4 GHz)',
    polarization: 'Double Polarisation (Dual-Pol)',
    dopplerRangeKm: 120,
    coverageRadiusKm: 100,
    operationalStatus: 'Opérationnel 100%',
    commissioningYear: 2015,
    specialization: 'Surveillance haute vallée de la Durance'
  },
  {
    id: 'lyon-st-exupery',
    name: 'Lyon - Mont Verdun / Saint-Exupéry',
    region: 'Auvergne-Rhône-Alpes',
    department: 'Rhône (69)',
    latitude: 45.8500,
    longitude: 4.7833,
    altitudeMeters: 625,
    band: 'Bande C (5.6 GHz)',
    polarization: 'Double Polarisation (Dual-Pol)',
    dopplerRangeKm: 250,
    coverageRadiusKm: 200,
    operationalStatus: 'Opérationnel 100%',
    commissioningYear: 1986,
    specialization: 'Surveillance Métropole de Lyon et couloir rhodanien'
  },
  {
    id: 'chastreix-sancy',
    name: 'Chastreix-Sancy - Massif Central',
    region: 'Auvergne-Rhône-Alpes',
    department: 'Puy-de-Dôme (63)',
    latitude: 45.5167,
    longitude: 2.7333,
    altitudeMeters: 1400,
    band: 'Bande C (5.6 GHz)',
    polarization: 'Double Polarisation (Dual-Pol)',
    dopplerRangeKm: 250,
    coverageRadiusKm: 200,
    operationalStatus: 'Opérationnel 100%',
    commissioningYear: 2002,
    specialization: 'Surveillance haute altitude Massif Central et Auvergne'
  },
  {
    id: 'opoul',
    name: 'Opoul-Périllos - Roussillon',
    region: 'Occitanie',
    department: 'Pyrénées-Orientales (66)',
    latitude: 42.8694,
    longitude: 2.8750,
    altitudeMeters: 400,
    band: 'Bande S (2.8 GHz)',
    polarization: 'Double Polarisation (Dual-Pol)',
    dopplerRangeKm: 250,
    coverageRadiusKm: 220,
    operationalStatus: 'Opérationnel 100%',
    commissioningYear: 1999,
    specialization: 'Pluies orographiques Roussillon et épisodes méditerranéens'
  },
  {
    id: 'saint-jean-de-monts',
    name: 'Saint-Jean-de-Monts - Côte Vendéenne',
    region: 'Pays de la Loire',
    department: 'Vendée (85)',
    latitude: 46.7917,
    longitude: -2.0611,
    altitudeMeters: 15,
    band: 'Bande C (5.6 GHz)',
    polarization: 'Double Polarisation (Dual-Pol)',
    dopplerRangeKm: 250,
    coverageRadiusKm: 210,
    operationalStatus: 'Opérationnel 100%',
    commissioningYear: 1998,
    specialization: 'Façade atlantique, marais poitevin et estuaire Loire'
  },
  {
    id: 'arcis-sur-aube',
    name: 'Arcis-sur-Aube - Champagne',
    region: 'Grand Est',
    department: 'Aube (10)',
    latitude: 48.5333,
    longitude: 4.1333,
    altitudeMeters: 130,
    band: 'Bande C (5.6 GHz)',
    polarization: 'Double Polarisation (Dual-Pol)',
    dopplerRangeKm: 250,
    coverageRadiusKm: 200,
    operationalStatus: 'Opérationnel 100%',
    commissioningYear: 1990,
    specialization: 'Plaine de Champagne et surveillance orageuse'
  },
  {
    id: 'avesnes',
    name: 'Avesnes-sur-Helpe - Avesnois',
    region: 'Hauts-de-France',
    department: 'Nord (59)',
    latitude: 50.1250,
    longitude: 3.9333,
    altitudeMeters: 190,
    band: 'Bande C (5.6 GHz)',
    polarization: 'Double Polarisation (Dual-Pol)',
    dopplerRangeKm: 250,
    coverageRadiusKm: 200,
    operationalStatus: 'Opérationnel 100%',
    commissioningYear: 1994,
    specialization: 'Nord-Pas-de-Calais et frontière belge'
  },
  {
    id: 'plabennec',
    name: 'Plabennec - Nord Finistère',
    region: 'Bretagne',
    department: 'Finistère (29)',
    latitude: 48.5000,
    longitude: -4.4333,
    altitudeMeters: 90,
    band: 'Bande C (5.6 GHz)',
    polarization: 'Double Polarisation (Dual-Pol)',
    dopplerRangeKm: 250,
    coverageRadiusKm: 200,
    operationalStatus: 'Opérationnel 100%',
    commissioningYear: 2005,
    specialization: 'Couverture mer d\'Iroise et pointe bretonne'
  },
  {
    id: 'treillieres',
    name: 'Treillières - Nantes Métropole',
    region: 'Pays de la Loire',
    department: 'Loire-Atlantique (44)',
    latitude: 47.3333,
    longitude: -1.6333,
    altitudeMeters: 80,
    band: 'Bande C (5.6 GHz)',
    polarization: 'Double Polarisation (Dual-Pol)',
    dopplerRangeKm: 250,
    coverageRadiusKm: 200,
    operationalStatus: 'Opérationnel 100%',
    commissioningYear: 1997,
    specialization: 'Surveillance Pays de la Loire et estuaire de la Loire'
  },
  {
    id: 'aleria',
    name: 'Aléria - Plaine Orientale Corse',
    region: 'Corse',
    department: 'Haute-Corse (2B)',
    latitude: 42.1083,
    longitude: 9.5167,
    altitudeMeters: 40,
    band: 'Bande C (5.6 GHz)',
    polarization: 'Double Polarisation (Dual-Pol)',
    dopplerRangeKm: 250,
    coverageRadiusKm: 200,
    operationalStatus: 'Opérationnel 100%',
    commissioningYear: 2000,
    specialization: 'Surveillance Corse orientale et mer Tyrrhénienne'
  },
  {
    id: 'ajaccio',
    name: 'Ajaccio - Campo dell\'Oro',
    region: 'Corse',
    department: 'Corse-du-Sud (2A)',
    latitude: 41.9236,
    longitude: 8.7928,
    altitudeMeters: 5,
    band: 'Bande C (5.6 GHz)',
    polarization: 'Double Polarisation (Dual-Pol)',
    dopplerRangeKm: 250,
    coverageRadiusKm: 200,
    operationalStatus: 'Opérationnel 100%',
    commissioningYear: 2008,
    specialization: 'Surveillance Golfe d\'Ajaccio et façade ouest Corse'
  },
  {
    id: 'le-castellet',
    name: 'Le Castellet - Sainte-Baume',
    region: 'Provence-Alpes-Côte d\'Azur',
    department: 'Var (83)',
    latitude: 43.2500,
    longitude: 5.7833,
    altitudeMeters: 420,
    band: 'Bande C (5.6 GHz)',
    polarization: 'Double Polarisation (Dual-Pol)',
    dopplerRangeKm: 250,
    coverageRadiusKm: 200,
    operationalStatus: 'Opérationnel 100%',
    commissioningYear: 2006,
    specialization: 'Surveillance Provence littorale et rade de Toulon'
  },
  {
    id: 'sembadel',
    name: 'Sembadel - Haute-Loire',
    region: 'Auvergne-Rhône-Alpes',
    department: 'Haute-Loire (43)',
    latitude: 45.2833,
    longitude: 3.7167,
    altitudeMeters: 1080,
    band: 'Bande C (5.6 GHz)',
    polarization: 'Double Polarisation (Dual-Pol)',
    dopplerRangeKm: 250,
    coverageRadiusKm: 200,
    operationalStatus: 'Opérationnel 100%',
    commissioningYear: 2004,
    specialization: 'Haut plateau du Velay et Cévennes septentrionales'
  },
  {
    id: 'st-andre-corcy',
    name: 'Saint-André-de-Corcy - Dombes',
    region: 'Auvergne-Rhône-Alpes',
    department: 'Ain (01)',
    latitude: 45.9167,
    longitude: 4.9500,
    altitudeMeters: 290,
    band: 'Bande C (5.6 GHz)',
    polarization: 'Double Polarisation (Dual-Pol)',
    dopplerRangeKm: 250,
    coverageRadiusKm: 200,
    operationalStatus: 'Opérationnel 100%',
    commissioningYear: 2003,
    specialization: 'Surveillance Dombes, Bresse et avant-pays savoyard'
  },
  {
    id: 'momuy',
    name: 'Momuy - Chalosse / Landes',
    region: 'Nouvelle-Aquitaine',
    department: 'Landes (40)',
    latitude: 43.6167,
    longitude: -0.6333,
    altitudeMeters: 120,
    band: 'Bande C (5.6 GHz)',
    polarization: 'Double Polarisation (Dual-Pol)',
    dopplerRangeKm: 250,
    coverageRadiusKm: 200,
    operationalStatus: 'Opérationnel 100%',
    commissioningYear: 2001,
    specialization: 'Sud Aquitaine et orages pyrénéens'
  },
  {
    id: 'condom',
    name: 'Condom - Armagnac',
    region: 'Occitanie',
    department: 'Gers (32)',
    latitude: 43.9583,
    longitude: 0.3722,
    altitudeMeters: 180,
    band: 'Bande C (5.6 GHz)',
    polarization: 'Double Polarisation (Dual-Pol)',
    dopplerRangeKm: 250,
    coverageRadiusKm: 200,
    operationalStatus: 'Opérationnel 100%',
    commissioningYear: 2007,
    specialization: 'Surveillance bassin de la Garonne et Gascogne'
  },
  {
    id: 'bethune',
    name: 'Béthune - Artois',
    region: 'Hauts-de-France',
    department: 'Pas-de-Calais (62)',
    latitude: 50.5333,
    longitude: 2.6333,
    altitudeMeters: 45,
    band: 'Bande C (5.6 GHz)',
    polarization: 'Double Polarisation (Dual-Pol)',
    dopplerRangeKm: 250,
    coverageRadiusKm: 200,
    operationalStatus: 'Opérationnel 100%',
    commissioningYear: 2009,
    specialization: 'Flandres, Artois et détroit du Pas-de-Calais'
  },
  {
    id: 'guadeloupe-le-moule',
    name: 'Guadeloupe - Le Moule',
    region: 'Guadeloupe (Outre-Mer)',
    department: 'Guadeloupe (971)',
    latitude: 16.3333,
    longitude: -61.3500,
    altitudeMeters: 45,
    band: 'Bande C (5.6 GHz)',
    polarization: 'Double Polarisation (Dual-Pol)',
    dopplerRangeKm: 300,
    coverageRadiusKm: 250,
    operationalStatus: 'Opérationnel 100%',
    commissioningYear: 2003,
    specialization: 'Surveillance cyclonique Arc Antillais'
  },
  {
    id: 'reunion-ste-rose',
    name: 'La Réunion - Piton Sainte-Rose',
    region: 'La Réunion (Outre-Mer)',
    department: 'La Réunion (974)',
    latitude: -21.1333,
    longitude: 55.7833,
    altitudeMeters: 350,
    band: 'Bande S (2.8 GHz)',
    polarization: 'Double Polarisation (Dual-Pol)',
    dopplerRangeKm: 300,
    coverageRadiusKm: 250,
    operationalStatus: 'Opérationnel 100%',
    commissioningYear: 2011,
    specialization: 'Surveillance cyclones tropicaux et pluies torrentielles Océan Indien'
  }
];

/**
 * Calcule la distance géodésique Haversine en km entre deux points (lat/lon)
 */
export function calculateGeodesicDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Rayon de la Terre en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

/**
 * Calcule le relèvement azimutal (gisement en degrés et direction cardinale)
 */
export function calculateAzimuthBearing(lat1: number, lon1: number, lat2: number, lon2: number): { deg: number; compass: string } {
  const y = Math.sin((lon2 - lon1) * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180);
  const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) -
            Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos((lon2 - lon1) * Math.PI / 180);
  const brng = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
  const compassPoints = [
    "Nord", "Nord-Nord-Est", "Nord-Est", "Est-Nord-Est",
    "Est", "Est-Sud-Est", "Sud-Est", "Sud-Sud-Est",
    "Sud", "Sud-Sud-Ouest", "Sud-Ouest", "Ouest-Sud-Ouest",
    "Ouest", "Ouest-Nord-Ouest", "Nord-Ouest", "Nord-Nord-Ouest"
  ];
  const compass = compassPoints[Math.floor(((brng + 11.25) % 360) / 22.5)];
  return { deg: Math.round(brng), compass };
}

/**
 * Calcule la hauteur du faisceau radar au-dessus du sol en tenant compte
 * de la courbure terrestre et de la réfraction standard de l'atmosphère (modèle 4/3 Rayon Terre).
 * Formule radar : h = h_radar + r * sin(theta) + r^2 / (2 * k * R_Terre)
 * où theta = angle d'élévation (ex: 0.5°), k = 4/3, R_Terre = 6371 km
 */
export function calculateRadarBeamAltitudeMeters(
  radarAltitudeM: number,
  distanceKm: number,
  elevationAngleDeg: number = 0.5
): number {
  const thetaRad = elevationAngleDeg * Math.PI / 180;
  const k = 4 / 3;
  const R = 6371000; // Rayon Terre en mètres
  const r = distanceKm * 1000; // Distance en mètres

  const geometricHeight = r * Math.sin(thetaRad);
  const curvatureCorrection = (r * r) / (2 * k * R);
  const totalAltitude = radarAltitudeM + geometricHeight + curvatureCorrection;

  return Math.round(totalAltitude);
}

/**
 * Trouve la station radar ARAMIS la plus proche d'un point géographique
 */
export function findNearestAramisRadar(lat: number, lon: number): {
  radar: AramisRadarStation;
  distanceKm: number;
  bearingDeg: number;
  bearingCompass: string;
  beamAltitudeMeters: number;
  signalQualityPercent: number;
} {
  let nearest = ARAMIS_RADAR_STATIONS[0];
  let minDistance = calculateGeodesicDistanceKm(lat, lon, nearest.latitude, nearest.longitude);

  for (let i = 1; i < ARAMIS_RADAR_STATIONS.length; i++) {
    const r = ARAMIS_RADAR_STATIONS[i];
    const d = calculateGeodesicDistanceKm(lat, lon, r.latitude, r.longitude);
    if (d < minDistance) {
      minDistance = d;
      nearest = r;
    }
  }

  const bearing = calculateAzimuthBearing(lat, lon, nearest.latitude, nearest.longitude);
  const beamAlt = calculateRadarBeamAltitudeMeters(nearest.altitudeMeters, minDistance, 0.5);

  // Indice de qualité du signal radar basé sur la distance (dégradation géométrique r^-2 et élargissement du lobe)
  let quality = 100;
  if (minDistance > 50) quality -= (minDistance - 50) * 0.35;
  if (minDistance > 120) quality -= (minDistance - 120) * 0.4;
  quality = Math.max(35, Math.min(100, Math.round(quality)));

  return {
    radar: nearest,
    distanceKm: minDistance,
    bearingDeg: bearing.deg,
    bearingCompass: bearing.compass,
    beamAltitudeMeters: beamAlt,
    signalQualityPercent: quality
  };
}
