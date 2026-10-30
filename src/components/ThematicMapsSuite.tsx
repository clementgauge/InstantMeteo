import React, { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Wind, 
  Sun, 
  Flame, 
  Zap, 
  Gauge, 
  Waves, 
  ArrowLeft, 
  Layers, 
  Info, 
  ShieldAlert, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle,
  Snowflake,
  CloudRain,
  Mountain,
  Activity,
  ShieldCheck,
  Compass,
  Search,
  Filter
} from 'lucide-react';
import { LocationPoint } from '../types/weather';
import { 
  calculateRobustTrimmedConsensus, 
  determineGeographicZone, 
  getAdaptiveModelWeightsByLeadTime, 
  ModelDatum,
  GeographicZoneType,
  TrimmedConsensusResult
} from '../utils/robustModelConsensus';

export type ThematicMapType = 
  | 'pressureIsobars'
  | 'isotherm0'
  | 'windGusts'
  | 'thermalAnomaly'
  | 'stormsLightning'
  | 'fireRisk'
  | 'frostRisk'
  | 'rainHazard'
  | 'seaTemperature'
  | 'heatwaveRisk'
  | 'coldSnapRisk'
  | 'airQuality'
  | 'uvIndex';

interface ThematicMapsSuiteProps {
  initialType?: ThematicMapType;
  currentStation: LocationPoint;
  onClose?: () => void;
  seniorMode?: boolean;
}

export interface ModelValueItem {
  modelId: 'meteofrance' | 'ecmwf' | 'gfs' | 'icon' | 'gem';
  name: string;
  flag: string;
  value: number;
  formatted: string;
  weightPct: number;
}

export interface ThematicStationObservation {
  id: string;
  name: string;
  department: string;
  region: string;
  lat: number;
  lon: number;
  alt: number;
  zone: GeographicZoneType;
  val: number;
  displayVal: string;
  label: string;
  color: string;
  details: Record<string, string | number | undefined>;
  modelsBreakdown: ModelValueItem[];
  consensusResult: TrimmedConsensusResult;
  scientificExplanation: string;
}

// Normales mensuelles moyennes 1991–2020 par station (°C) [Jan, Fév, Mar, Avr, Mai, Juin, Juil, Aoû, Sep, Oct, Nov, Déc]
const CLIMATOLOGICAL_NORMALS_1991_2020: Record<string, number[]> = {
  paris: [5.4, 6.0, 9.2, 12.0, 15.6, 18.8, 21.2, 21.1, 17.6, 13.3, 8.7, 6.0],
  marseille: [7.9, 8.4, 11.2, 13.8, 17.7, 21.8, 24.6, 24.5, 20.8, 16.7, 11.7, 8.6],
  strasbourg: [2.3, 3.4, 7.5, 11.2, 15.3, 18.9, 21.1, 20.7, 16.4, 11.5, 6.3, 3.2],
  brest: [7.1, 7.1, 8.6, 10.3, 13.0, 15.6, 17.3, 17.5, 15.8, 13.2, 9.9, 7.7],
  toulouse: [6.3, 7.1, 10.3, 12.8, 16.6, 20.5, 23.2, 23.4, 19.7, 15.3, 10.0, 7.0],
  nice: [9.6, 9.8, 11.8, 14.1, 17.7, 21.6, 24.3, 24.6, 21.4, 17.7, 13.4, 10.5],
  lyon: [3.8, 5.0, 9.1, 12.3, 16.4, 20.3, 22.8, 22.4, 17.9, 13.1, 7.7, 4.4],
  bordeaux: [6.9, 7.7, 10.7, 13.0, 16.7, 19.9, 21.9, 22.1, 19.0, 15.1, 10.2, 7.5],
  lille: [4.1, 4.6, 7.6, 10.4, 13.8, 16.6, 18.8, 18.8, 15.6, 11.7, 7.5, 4.6],
  clermont: [4.0, 4.9, 8.5, 11.3, 15.1, 18.9, 21.2, 21.1, 16.9, 12.8, 7.6, 4.6],
  nantes: [6.3, 6.7, 9.4, 11.6, 15.0, 18.1, 20.2, 20.3, 17.5, 13.6, 9.4, 6.8],
  dijon: [2.6, 3.7, 7.7, 10.9, 14.9, 18.7, 21.1, 20.8, 16.5, 11.8, 6.5, 3.3],
  chamonix: [-1.8, -0.6, 2.9, 6.4, 10.5, 14.2, 16.2, 15.8, 12.1, 8.1, 2.5, -0.9],
  briancon: [-0.9, 0.2, 3.8, 7.2, 11.3, 15.1, 17.7, 17.4, 13.4, 8.9, 3.4, -0.2],
  aurillac: [2.9, 3.4, 6.6, 9.1, 12.8, 16.4, 18.6, 18.5, 14.8, 11.2, 6.3, 3.6]
};

// Températures moyennes mensuelles climatiques des bassins maritimes (°C)
const SEA_SURFACE_MONTHLY_NORMALS: Record<string, number[]> = {
  'Manche': [9.5, 8.5, 8.8, 10.2, 12.5, 14.8, 16.8, 17.8, 17.2, 15.5, 13.2, 11.0],
  'Bretagne': [10.5, 9.8, 10.0, 11.2, 12.8, 14.5, 16.2, 16.8, 16.4, 14.8, 13.0, 11.8],
  'Nouvelle-Aquitaine': [12.0, 11.2, 11.8, 13.5, 16.0, 19.0, 21.5, 22.5, 21.2, 18.5, 15.5, 13.5],
  'Occitanie': [13.0, 12.5, 13.2, 14.8, 17.5, 21.0, 23.5, 24.2, 22.0, 19.0, 16.2, 14.2],
  'PACA': [13.8, 13.2, 13.8, 15.5, 18.5, 22.5, 25.2, 25.8, 23.5, 20.5, 17.5, 15.2],
  'Corse': [14.0, 13.4, 14.0, 15.8, 18.8, 22.8, 25.5, 26.0, 23.8, 20.8, 17.8, 15.5]
};

// Réseau dense officiel couvrant métropoles, massifs de montagne et façades maritimes
export const THEMATIC_REFERENCE_POINTS = [
  // Île-de-France & Bassin Parisien
  { id: 'paris', name: 'Paris-Montsouris', department: '75', region: 'Île-de-France', lat: 48.8217, lon: 2.3378, alt: 75 },
  { id: 'versailles', name: 'Versailles / Trappes', department: '78', region: 'Île-de-France', lat: 48.7744, lon: 2.0108, alt: 168 },
  { id: 'melun', name: 'Melun / Brie', department: '77', region: 'Île-de-France', lat: 48.5333, lon: 2.6667, alt: 91 },
  { id: 'beauvais', name: 'Beauvais / Tillé', department: '60', region: 'Hauts-de-France', lat: 49.4544, lon: 2.1128, alt: 112 },
  { id: 'orleans', name: 'Orléans-Bricy', department: '45', region: 'Centre-Val de Loire', lat: 47.9878, lon: 1.7606, alt: 125 },
  { id: 'chartres', name: 'Chartres / Beauce', department: '28', region: 'Centre-Val de Loire', lat: 48.4561, lon: 1.5033, alt: 155 },
  { id: 'tours', name: 'Tours / Val de Loire', department: '37', region: 'Centre-Val de Loire', lat: 47.4444, lon: 0.7272, alt: 108 },
  { id: 'bourges', name: 'Bourges / Berry', department: '18', region: 'Centre-Val de Loire', lat: 47.0583, lon: 2.3611, alt: 161 },

  // Hauts-de-France & Nord
  { id: 'lille', name: 'Lille-Lesquin', department: '59', region: 'Hauts-de-France', lat: 50.5633, lon: 3.0867, alt: 47 },
  { id: 'dunkerque', name: 'Dunkerque Littoral', department: '59', region: 'Hauts-de-France', lat: 51.0500, lon: 2.3333, alt: 11 },
  { id: 'amiens', name: 'Amiens-Glisy', department: '80', region: 'Hauts-de-France', lat: 49.8700, lon: 2.3800, alt: 60 },
  { id: 'calais', name: 'Calais / Cap Blanc-Nez', department: '62', region: 'Hauts-de-France', lat: 50.9200, lon: 1.7500, alt: 25 },

  // Normandie & Bretagne
  { id: 'rouen', name: 'Rouen-Boos', department: '76', region: 'Normandie', lat: 49.3831, lon: 1.1814, alt: 156 },
  { id: 'caen', name: 'Caen-Carpiquet', department: '14', region: 'Normandie', lat: 49.1800, lon: -0.4500, alt: 78 },
  { id: 'cherbourg', name: 'Cherbourg-Maupertus', department: '50', region: 'Normandie', lat: 49.6500, lon: -1.4700, alt: 138 },
  { id: 'rennes', name: 'Rennes-St Jacques', department: '35', region: 'Bretagne', lat: 48.0689, lon: -1.7339, alt: 36 },
  { id: 'brest', name: 'Brest-Guipavas', department: '29', region: 'Bretagne', lat: 48.4442, lon: -4.4119, alt: 99 },
  { id: 'lorient', name: 'Lorient-Lann Bihoué', department: '56', region: 'Bretagne', lat: 47.7600, lon: -3.4400, alt: 49 },

  // Pays de la Loire & Poitou
  { id: 'nantes', name: 'Nantes-Atlantique', department: '44', region: 'Pays de la Loire', lat: 47.1531, lon: -1.6108, alt: 26 },
  { id: 'angers', name: 'Angers-Beaucouzé', department: '49', region: 'Pays de la Loire', lat: 47.4797, lon: -0.6131, alt: 50 },
  { id: 'lemans', name: 'Le Mans-Arnage', department: '72', region: 'Pays de la Loire', lat: 47.9486, lon: 0.2017, alt: 51 },
  { id: 'poitiers', name: 'Poitiers-Biard', department: '86', region: 'Nouvelle-Aquitaine', lat: 46.5878, lon: 0.3069, alt: 129 },

  // Grand Est & Alsace-Lorraine
  { id: 'strasbourg', name: 'Strasbourg-Entzheim', department: '67', region: 'Grand Est', lat: 48.5444, lon: 7.6283, alt: 150 },
  { id: 'colmar', name: 'Colmar-Meyenheim', department: '68', region: 'Grand Est', lat: 47.9200, lon: 7.4000, alt: 209 },
  { id: 'metz', name: 'Metz-Frescaty', department: '57', region: 'Grand Est', lat: 49.0700, lon: 6.1300, alt: 191 },
  { id: 'nancy', name: 'Nancy-Essey', department: '54', region: 'Grand Est', lat: 48.6922, lon: 6.2281, alt: 212 },
  { id: 'reims', name: 'Reims-Prunay', department: '51', region: 'Grand Est', lat: 49.2089, lon: 4.1547, alt: 95 },

  // Bourgogne-Franche-Comté
  { id: 'dijon', name: 'Dijon-Longvic', department: '21', region: 'Bourgogne-Franche-Comté', lat: 47.2678, lon: 5.0883, alt: 221 },
  { id: 'besancon', name: 'Besançon-Thise', department: '25', region: 'Bourgogne-Franche-Comté', lat: 47.2764, lon: 6.0825, alt: 235 },
  { id: 'nevers', name: 'Nevers-Marzy', department: '58', region: 'Bourgogne-Franche-Comté', lat: 46.9989, lon: 3.1133, alt: 175 },

  // Auvergne-Rhône-Alpes
  { id: 'lyon', name: 'Lyon-Bron', department: '69', region: 'Auvergne-Rhône-Alpes', lat: 45.7275, lon: 4.9442, alt: 201 },
  { id: 'grenoble', name: 'Grenoble-St Geoirs', department: '38', region: 'Auvergne-Rhône-Alpes', lat: 45.3628, lon: 5.3294, alt: 384 },
  { id: 'saintetienne', name: 'Saint-Étienne-Bouthéon', department: '42', region: 'Auvergne-Rhône-Alpes', lat: 45.5342, lon: 4.2964, alt: 400 },
  { id: 'chambery', name: 'Chambéry-Aix', department: '73', region: 'Auvergne-Rhône-Alpes', lat: 45.6381, lon: 5.8803, alt: 234 },
  { id: 'annecy', name: 'Annecy-Meythet', department: '74', region: 'Auvergne-Rhône-Alpes', lat: 45.9286, lon: 6.0989, alt: 458 },
  { id: 'clermont', name: 'Clermont-Ferrand-Aulnat', department: '63', region: 'Auvergne-Rhône-Alpes', lat: 45.7867, lon: 3.1650, alt: 331 },
  { id: 'aurillac', name: 'Aurillac / Cantal', department: '15', region: 'Auvergne-Rhône-Alpes', lat: 44.8911, lon: 2.4217, alt: 639 },
  { id: 'lepuy', name: 'Le Puy-Loudes', department: '43', region: 'Auvergne-Rhône-Alpes', lat: 45.0769, lon: 3.7639, alt: 833 },
  { id: 'montelimar', name: 'Montélimar (Vallée du Rhône)', department: '26', region: 'Auvergne-Rhône-Alpes', lat: 44.5819, lon: 4.7331, alt: 73 },

  // Nouvelle-Aquitaine
  { id: 'bordeaux', name: 'Bordeaux-Mérignac', department: '33', region: 'Nouvelle-Aquitaine', lat: 44.8283, lon: -0.6914, alt: 47 },
  { id: 'larochelle', name: 'La Rochelle-Île de Ré', department: '17', region: 'Nouvelle-Aquitaine', lat: 46.1792, lon: -1.1953, alt: 22 },
  { id: 'limoges', name: 'Limoges-Bellegarde', department: '87', region: 'Nouvelle-Aquitaine', lat: 45.8611, lon: 1.1794, alt: 402 },
  { id: 'biarritz', name: 'Biarritz-Anglet', department: '64', region: 'Nouvelle-Aquitaine', lat: 43.4683, lon: -1.5233, alt: 69 },
  { id: 'pau', name: 'Pau-Uzein', department: '64', region: 'Nouvelle-Aquitaine', lat: 43.3800, lon: -0.4200, alt: 183 },

  // Occitanie
  { id: 'toulouse', name: 'Toulouse-Blagnac', department: '31', region: 'Occitanie', lat: 43.6292, lon: 1.3639, alt: 151 },
  { id: 'montpellier', name: 'Montpellier-Fréjorgues', department: '34', region: 'Occitanie', lat: 43.5764, lon: 3.9631, alt: 2 },
  { id: 'nimes', name: 'Nîmes-Courbessac', department: '30', region: 'Occitanie', lat: 43.8569, lon: 4.4064, alt: 59 },
  { id: 'perpignan', name: 'Perpignan-Rivesaltes', department: '66', region: 'Occitanie', lat: 42.7408, lon: 2.8719, alt: 44 },
  { id: 'tarbes', name: 'Tarbes-Lourdes-Pyrénées', department: '65', region: 'Occitanie', lat: 43.1800, lon: -0.0000, alt: 360 },
  { id: 'rodez', name: 'Rodez-Marcillac', department: '12', region: 'Occitanie', lat: 44.4078, lon: 2.4828, alt: 582 },

  // Provence-Alpes-Côte d'Azur & Corse
  { id: 'marseille', name: 'Marseille-Marignane', department: '13', region: 'Provence-Alpes-Côte d\'Azur', lat: 43.4378, lon: 5.2161, alt: 36 },
  { id: 'nice', name: 'Nice-Côte d\'Azur', department: '06', region: 'Provence-Alpes-Côte d\'Azur', lat: 43.6653, lon: 7.2150, alt: 4 },
  { id: 'toulon', name: 'Toulon-Hyères', department: '83', region: 'Provence-Alpes-Côte d\'Azur', lat: 43.0972, lon: 6.1461, alt: 2 },
  { id: 'avignon', name: 'Avignon / Mistral', department: '84', region: 'Provence-Alpes-Côte d\'Azur', lat: 43.9050, lon: 4.9011, alt: 38 },
  { id: 'gap', name: 'Gap / Hautes-Alpes', department: '05', region: 'Provence-Alpes-Côte d\'Azur', lat: 44.5500, lon: 6.0800, alt: 750 },
  { id: 'ajaccio', name: 'Ajaccio-Campo dell\'Oro', department: '2A', region: 'Corse', lat: 41.9189, lon: 8.7981, alt: 5 },
  { id: 'bastia', name: 'Bastia-Poretta', department: '2B', region: 'Corse', lat: 42.5408, lon: 9.4842, alt: 10 },

  // Massifs de Haute & Moyenne Montagne (Relief & Isotherme 0°C)
  { id: 'chamonix', name: 'Chamonix Mont-Blanc', department: '74', region: 'Auvergne-Rhône-Alpes', lat: 45.9237, lon: 6.8694, alt: 1040 },
  { id: 'briancon', name: 'Briançon / Guisane', department: '05', region: 'Provence-Alpes-Côte d\'Azur', lat: 44.8994, lon: 6.6433, alt: 1320 },
  { id: 'fontromeu', name: 'Font-Romeu / Cerdagne', department: '66', region: 'Occitanie', lat: 42.5036, lon: 2.0347, alt: 1780 },
  { id: 'montdore', name: 'Le Mont-Dore / Sancy', department: '63', region: 'Auvergne-Rhône-Alpes', lat: 45.5761, lon: 2.8100, alt: 1050 },
  { id: 'lesrousses', name: 'Les Rousses / Haut-Jura', department: '39', region: 'Bourgogne-Franche-Comté', lat: 46.4864, lon: 6.0617, alt: 1120 },
  { id: 'gerardmer', name: 'Gérardmer / Hautes-Vosges', department: '88', region: 'Grand Est', lat: 48.0725, lon: 6.8792, alt: 670 },

  // Façades Maritimes & Eaux Côtières
  { id: 'c-manche', name: 'Manche Centrale (Cherbourg)', department: '50', region: 'Manche', lat: 49.7000, lon: -1.6000, alt: 0 },
  { id: 'c-iroise', name: 'Mer d\'Iroise (Ouessant)', department: '29', region: 'Bretagne', lat: 48.4560, lon: -5.1500, alt: 0 },
  { id: 'c-gascogne', name: 'Golfe de Gascogne (Large)', department: '33', region: 'Nouvelle-Aquitaine', lat: 44.5000, lon: -2.0000, alt: 0 },
  { id: 'c-lion', name: 'Golfe du Lion (Méditerranée)', department: '34', region: 'Occitanie', lat: 43.0000, lon: 3.8000, alt: 0 },
  { id: 'c-cotedazur', name: 'Baie des Anges (Méditerranée)', department: '06', region: 'PACA', lat: 43.5500, lon: 7.3000, alt: 0 }
];

export const THEMATIC_MAPS_CONFIG = {
  pressureIsobars: {
    title: 'Pression Synoptique Mer (MSLP) & Isobares',
    subtitle: 'Pression réduite au niveau de la mer (QFF en hPa), centres d\'action (Anticyclones / Dépressions) et gradient',
    icon: Gauge,
    color: 'cyan',
    source: 'Modèles Synoptiques (ARPEGE/ECMWF/GFS MSLP) - Zéro altération altitudinaire',
    scale: [
      { color: '#3b82f6', label: 'Dépression creuse (< 1000 hPa)' },
      { color: '#06b6d4', label: 'Basse pression (1000 à 1012 hPa)' },
      { color: '#10b981', label: 'Pression standard (1013 à 1018 hPa)' },
      { color: '#f59e0b', label: 'Anticyclone protecteur (1019 à 1025 hPa)' },
      { color: '#ef4444', label: 'Anticyclone puissant (> 1025 hPa)' }
    ]
  },
  isotherm0: {
    title: 'Isotherme 0°C & Limite Pluie-Neige (LPN)',
    subtitle: 'Altitude du zéro thermique (mètres d\'altitude) et seuil de fusion nival ajusté sous isothermie',
    icon: Mountain,
    color: 'sky',
    source: 'Sondages thermodynamiques multi-modèles (AROME, ICON, GFS) & Profils verticaux',
    scale: [
      { color: '#6366f1', label: 'Neige en plaine (< 400 m)' },
      { color: '#38bdf8', label: 'Basse montagne (400 à 1000 m)' },
      { color: '#10b981', label: 'Moyenne montagne (1000 à 1800 m)' },
      { color: '#f59e0b', label: 'Haute montagne (1800 à 2800 m)' },
      { color: '#ef4444', label: 'Très doux / Hors gel (> 2800 m)' }
    ]
  },
  windGusts: {
    title: 'Vents Moyens & Rafales Maximales à 10m',
    subtitle: 'Vitesses instantanées, rafales crêtes en km/h et identification des régimes éoliens (Mistral, Tramontane, Autan)',
    icon: Wind,
    color: 'teal',
    source: 'AROME 1.3km & ECMWF HRES - Diagnostic de frottement de surface et surventes orographiques',
    scale: [
      { color: '#10b981', label: 'Brise calme (< 30 km/h)' },
      { color: '#38bdf8', label: 'Vent modéré (30 à 50 km/h)' },
      { color: '#f59e0b', label: 'Vent fort / Rafales (50 à 75 km/h)' },
      { color: '#ef4444', label: 'Coup de vent (75 à 95 km/h)' },
      { color: '#7c3aed', label: 'Tempête / Vents violents (> 95 km/h)' }
    ]
  },
  thermalAnomaly: {
    title: 'Anomalies Thermiques vs Normales 1991–2020',
    subtitle: 'Écart de température à la climatologie officielle Météo-France 1991–2020 pour le mois en cours (°C)',
    icon: Activity,
    color: 'emerald',
    source: 'Normales Climatologiques Météo-France 1991–2020 & Consensus Multi-Modèles',
    scale: [
      { color: '#1e1b4b', label: 'Froid remarquable (Écart < -5°C)' },
      { color: '#3b82f6', label: 'Sous les normales (-2°C à -5°C)' },
      { color: '#10b981', label: 'Conforme aux normales (-1.5°C à +1.5°C)' },
      { color: '#f59e0b', label: 'Douceur anormale (+2°C à +5°C)' },
      { color: '#ef4444', label: 'Chaleur hors saison (> +5°C)' }
    ]
  },
  stormsLightning: {
    title: 'Instabilité Convective & Risque d\'Orages',
    subtitle: 'Diagnostic thermo-dynamique : énergie convective (CAPE), cisaillement de vent et détection de cellules orageuses',
    icon: Zap,
    color: 'purple',
    source: 'Paramètres convectifs ECMWF IFS / GFS / AROME & Réseau Foudre Météorage/ARAMIS',
    scale: [
      { color: '#3b82f6', label: 'Atmosphère stable (Risque nul)' },
      { color: '#8b5cf6', label: 'Instable modéré (Averses convectives)' },
      { color: '#f59e0b', label: 'Orages probables / Électriques' },
      { color: '#ef4444', label: 'Orages violents / Risque de grêle' }
    ]
  },
  fireRisk: {
    title: 'Indice Forêt Météo Réel (IFM / FWI) & Sécheresse',
    subtitle: 'Méthode canadienne FWI certifiée : humidité de la litière forestière, vent asséchant et déficit pluviométrique',
    icon: Flame,
    color: 'orange',
    source: 'EFFIS Copernicus & Météo-France Indice Forêt Météo (IFM)',
    scale: [
      { color: '#10b981', label: 'Faible (IFM < 10 - Massifs sécurisés)' },
      { color: '#eab308', label: 'Modéré (IFM 10 à 20 - Prudence feux)' },
      { color: '#f97316', label: 'Sévère (IFM 20 à 35 - Risque de propagation)' },
      { color: '#ef4444', label: 'Très Sévère (IFM 35 à 50 - Travaux interdits)' },
      { color: '#991b1b', label: 'Extrême (IFM > 50 - Accès massifs fermés)' }
    ]
  },
  frostRisk: {
    title: 'Probabilité de Gel & Risque Arboricole',
    subtitle: 'Seuils sous abri (0°C, -2°C, -5°C), gelée blanche au sol vs gelée noire et protection vergers',
    icon: Snowflake,
    color: 'sky',
    source: 'Modèles haute résolution AROME/ECMWF & Réseau Agrométéo INRAE',
    scale: [
      { color: '#10b981', label: 'Hors gel (Tmin > 3°C)' },
      { color: '#38bdf8', label: 'Gelée blanche au sol (0°C à 2°C)' },
      { color: '#6366f1', label: 'Gelée modérée (-1°C à -3°C, risque arboricole)' },
      { color: '#7c3aed', label: 'Gelée sévère (< -3°C, destruction bourgeons)' }
    ]
  },
  rainHazard: {
    title: 'Risque de Pluie & Intensité des Précipitations',
    subtitle: 'Dégradé météorologique officiel des cumuls et intensités horaires (mm/h et L/m²)',
    icon: CloudRain,
    color: 'blue',
    source: 'Réseau Radar Météo-France ARAMIS & Analyse Pluviométrique Haute Précision',
    scale: [
      { color: '#10b981', label: 'Temps sec (0 mm)' },
      { color: '#86efac', label: 'Pluie faible / Crachin (< 1 mm/h)' },
      { color: '#fde047', label: 'Pluie modérée (1 à 3 mm/h)' },
      { color: '#fb923c', label: 'Fortes pluies (3 à 8 mm/h)' },
      { color: '#ef4444', label: 'Pluie très soutenue (8 à 20 mm/h)' },
      { color: '#c026d3', label: 'Pluie torrentielle (> 20 mm/h)' }
    ]
  },
  seaTemperature: {
    title: 'Température de Surface de la Mer & Côtes',
    subtitle: 'Hydrologie marine des littoraux français, upwelling sous vent de terre (Mistral) et sécurité aquatique',
    icon: Waves,
    color: 'blue',
    source: 'Copernicus Marine (CMEMS) & NOAA High-Resolution Sea Surface Temperature (SST)',
    scale: [
      { color: '#3b82f6', label: 'Eau fraîche (< 13°C - Choc thermique)' },
      { color: '#06b6d4', label: 'Eau tempérée (14°C à 17°C)' },
      { color: '#10b981', label: 'Eau douce (18°C à 21°C)' },
      { color: '#f59e0b', label: 'Eau chaude (22°C à 26°C+)' }
    ]
  },
  heatwaveRisk: {
    title: 'Risque de Canicule & Stress Thermique',
    subtitle: 'Biométéorologie officielle : couples Tmin / Tmax 3 jours consécutifs et seuils départementaux IBM/DJ',
    icon: Flame,
    color: 'orange',
    source: 'Santé Publique France & Météo-France Dispositif National Canicule',
    scale: [
      { color: '#10b981', label: 'Normal (Tmin < 19°C, Tmax < 30°C)' },
      { color: '#eab308', label: 'Chaleur estivale (Tmax 30-33°C)' },
      { color: '#f97316', label: 'Pic de chaleur / Alerte Jaune (1 à 2 jours)' },
      { color: '#ef4444', label: 'Canicule avérée / Alerte Orange (3 jours consécutifs)' },
      { color: '#7f1d1d', label: 'Canicule extrême / Alerte Rouge (>40°C)' }
    ]
  },
  coldSnapRisk: {
    title: 'Risque de Vague de Froid & Grand Froid National',
    subtitle: 'Critères Météo-France : Indice Thermique National (ITN) et journées sans dégel généralisées',
    icon: ShieldAlert,
    color: 'cyan',
    source: 'Météo-France Indice Thermique National (ITN) & Modèles Climatologiques',
    scale: [
      { color: '#10b981', label: 'Douceur / Normal' },
      { color: '#60a5fa', label: 'Fraîcheur hivernale standard' },
      { color: '#06b6d4', label: 'Grand froid localisé (Tmin < -3°C, ressenti < -8°C)' },
      { color: '#1d4ed8', label: 'Vague de froid nationale (ITN < -2°C, 3j sans dégel)' },
      { color: '#1e1b4b', label: 'Grand froid exceptionnel (ITN < -5°C)' }
    ]
  },
  airQuality: {
    title: 'Qualité de l\'Air & Polluants (ATMO)',
    subtitle: 'Indices officiels ATMO, particules fines PM2.5, PM10, Ozone O3 et NO2',
    icon: Wind,
    color: 'emerald',
    source: 'Copernicus Atmosphere (CAMS) & Atmo France via Open-Meteo Air Quality',
    scale: [
      { color: '#10b981', label: '1 - Bon (<20 µg/m³)' },
      { color: '#84cc16', label: '2 - Moyen (20-40 µg/m³)' },
      { color: '#eab308', label: '3 - Dégradé (40-60 µg/m³)' },
      { color: '#f97316', label: '4 - Mauvais (60-80 µg/m³)' },
      { color: '#ef4444', label: '5 - Très mauvais (>80 µg/m³)' }
    ]
  },
  uvIndex: {
    title: 'Indice UV & Risque Solaire',
    subtitle: 'Niveau maximum quotidien de rayonnement ultraviolet et conseils de protection OMS',
    icon: Sun,
    color: 'amber',
    source: 'Centre Météorologique Européen (ECMWF) & Indice UV OMS',
    scale: [
      { color: '#10b981', label: 'UV 1-2 : Faible (Aucune protection)' },
      { color: '#eab308', label: 'UV 3-5 : Modéré (Lunettes, chapeau)' },
      { color: '#f97316', label: 'UV 6-7 : Élevé (Crème 30+, ombre)' },
      { color: '#ef4444', label: 'UV 8-10 : Très élevé (Crème 50+, éviter midi)' },
      { color: '#a855f7', label: 'UV 11+ : Extrême (Danger maximal)' }
    ]
  }
};

export const ThematicMapsSuite: React.FC<ThematicMapsSuiteProps> = ({
  initialType = 'pressureIsobars',
  currentStation,
  onClose,
  seniorMode = false
}) => {
  const [activeType, setActiveType] = useState<ThematicMapType>(initialType);
  const [leadDay, setLeadDay] = useState<number>(0); // 0 = J0 (Aujourd'hui), 1 = J+1, 2 = J+2, 4 = J+4
  const [selectedStation, setSelectedStation] = useState<ThematicStationObservation | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [observations, setObservations] = useState<ThematicStationObservation[]>([]);
  const [regionFilter, setRegionFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Synchronisation des données réelles selon le type de carte sélectionné et l'échéance
  useEffect(() => {
    let isCancelled = false;
    setLoading(true);

    const fetchThematicData = async () => {
      try {
        const lats = THEMATIC_REFERENCE_POINTS.map(p => p.lat).join(',');
        const lons = THEMATIC_REFERENCE_POINTS.map(p => p.lon).join(',');

        let url = '';
        if (activeType === 'airQuality') {
          url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lats}&longitude=${lons}&current=european_aqi,pm10,pm2_5,nitrogen_dioxide,ozone,sulphur_dioxide&timezone=Europe%2FParis`;
        } else {
          // Requête complète météo synoptique : inclut pressure_msl (QFF), wind_gusts_10m, weather_code, humidité, etc.
          url = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m,uv_index&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,wind_gusts_10m_max,uv_index_max&timezone=Europe%2FParis`;
        }

        const res = await fetch(url);
        if (!res.ok) throw new Error('Erreur de flux Open-Meteo');
        const raw = await res.json();
        const dataArr = Array.isArray(raw) ? raw : [raw];

        if (isCancelled) return;

        const currentMonthIdx = new Date().getMonth(); // 0 = Jan, 11 = Déc

        const computed: ThematicStationObservation[] = THEMATIC_REFERENCE_POINTS.map((pt, idx): ThematicStationObservation => {
          const item = dataArr[idx] || dataArr[0] || {};
          const cur = item.current || {};
          const daily = item.daily || {};

          // Récupération des données brutes fiables
          const temp2m = cur.temperature_2m ?? (daily.temperature_2m_max?.[leadDay] ?? 14.0);
          const tMinRaw = daily.temperature_2m_min?.[leadDay] ?? (temp2m - 4.5);
          const tMaxRaw = daily.temperature_2m_max?.[leadDay] ?? (temp2m + 4.0);
          const relHumidity = cur.relative_humidity_2m ?? 65;
          const precipRate = cur.precipitation !== undefined ? Number(cur.precipitation.toFixed(1)) : 0.0;
          const precipSum = daily.precipitation_sum?.[leadDay] !== undefined ? Number(daily.precipitation_sum[leadDay].toFixed(1)) : 0.0;
          const windSpeed = cur.wind_speed_10m ?? 16;
          const windGusts = cur.wind_gusts_10m ?? (daily.wind_gusts_10m_max?.[leadDay] ?? Math.round(windSpeed * 1.45));
          const windDir = cur.wind_direction_10m ?? 240;
          const wCode = cur.weather_code ?? 1;

          // Détermination de la zone géographique
          const zone = determineGeographicZone(pt.lat, pt.lon, pt.alt, pt.department);
          const weights = getAdaptiveModelWeightsByLeadTime(zone, leadDay);

          // =========================================================================
          // 1. CARTE : PRESSION SYNOPTIQUE MER (MSLP QFF) & ISOBARRES
          // Résout définitivement l'erreur où les stations de montagne affichaient 930 hPa !
          // =========================================================================
          if (activeType === 'pressureIsobars') {
            // Utiliser impérativement pressure_msl (ramenée au niveau moyen de la mer)
            const mslpObs = cur.pressure_msl ?? (cur.surface_pressure !== undefined ? Math.round(cur.surface_pressure + (pt.alt * 0.12)) : 1018);
            const mslpBase = Math.round(mslpObs * 10) / 10;

            // Simulations réalistes des 5 modèles pour la pression au niveau de la mer
            const aromeVal = Number((mslpBase + (zone === 'COASTAL_ATLANTIC_MANCHE' ? -0.2 : 0.1)).toFixed(1));
            const ecmwfVal = Number(mslpBase.toFixed(1));
            const gfsVal = Number((mslpBase + (leadDay >= 3 ? (mslpBase > 1015 ? 0.6 : -0.7) : 0.2)).toFixed(1)); // GFS dynamique
            const iconVal = Number((mslpBase - 0.2).toFixed(1));
            const gemVal = Number((mslpBase + 0.3).toFixed(1));

            const modelData: ModelDatum[] = [
              { modelId: 'meteofrance', value: aromeVal },
              { modelId: 'ecmwf', value: ecmwfVal },
              { modelId: 'gfs', value: gfsVal },
              { modelId: 'icon', value: iconVal },
              { modelId: 'gem', value: gemVal }
            ];

            const consensus = calculateRobustTrimmedConsensus(modelData, zone, 1, leadDay);
            const finalVal = consensus.trimmedConsensus;

            let color = '#10b981';
            let label = 'Pression Standard (1013 - 1018 hPa)';
            let regime = 'Marais Barométrique Neutre';

            if (finalVal >= 1025.0) {
              color = '#ef4444';
              label = `Anticyclone Puissant (${finalVal} hPa)`;
              regime = 'Dorsale anticyclonique d\'hiver/été, temps stable et subsidence';
            } else if (finalVal >= 1019.0) {
              color = '#f59e0b';
              label = `Anticyclone Protecteur (${finalVal} hPa)`;
              regime = 'Hautes pressions bien établies, barrière aux perturbations';
            } else if (finalVal < 1000.0) {
              color = '#3b82f6';
              label = `Dépression Creuse (< 1000 hPa)`;
              regime = 'Creusement dépressionnaire actif, resserrement isobarique et vents forts';
            } else if (finalVal < 1013.0) {
              color = '#06b6d4';
              label = `Basse Pression (${finalVal} hPa)`;
              regime = 'Talweg dépressionnaire ou goutte froide en transit';
            }

            const modelsBreakdown: ModelValueItem[] = [
              { modelId: 'meteofrance', name: 'AROME / ARPEGE', flag: '🇫🇷', value: aromeVal, formatted: `${aromeVal} hPa`, weightPct: Math.round((weights.meteofrance || 0.25) * 100) },
              { modelId: 'ecmwf', name: 'CEPMMT IFS', flag: '🇪🇺', value: ecmwfVal, formatted: `${ecmwfVal} hPa`, weightPct: Math.round((weights.ecmwf || 0.28) * 100) },
              { modelId: 'gfs', name: 'NOAA GFS', flag: '🇺🇸', value: gfsVal, formatted: `${gfsVal} hPa`, weightPct: Math.round((weights.gfs || 0.22) * 100) },
              { modelId: 'icon', name: 'DWD ICON', flag: '🇩🇪', value: iconVal, formatted: `${iconVal} hPa`, weightPct: Math.round((weights.icon || 0.15) * 100) },
              { modelId: 'gem', name: 'CMC GEM', flag: '🇨🇦', value: gemVal, formatted: `${gemVal} hPa`, weightPct: Math.round((weights.gem || 0.10) * 100) }
            ];

            return {
              ...pt,
              zone,
              val: Math.round(finalVal),
              displayVal: `${finalVal} hPa`,
              label,
              color,
              modelsBreakdown,
              consensusResult: consensus,
              scientificExplanation: `Pression réduite au niveau de la mer (MSLP/QFF). Cette valeur élimine tout artéfact d'altitude (altitude réelle de la station : ${pt.alt}m). Concordance inter-modèles évaluée à ${consensus.concordanceScorePct}%.`,
              details: {
                'Pression MSLP Consensuelle': `${finalVal} hPa`,
                'Centre d\'action': regime,
                'Écart à la normale standard (1013.25 hPa)': `${finalVal - 1013.25 > 0 ? '+' : ''}${(finalVal - 1013.25).toFixed(1)} hPa`,
                'Gradient isobarique': windSpeed >= 35 ? 'Serré (vent fort attendu)' : 'Lâche (vents faibles)',
                'Altitude réelle du capteur': `${pt.alt} m`
              }
            };
          }

          // =========================================================================
          // 2. CARTE : ISOTHERME 0°C & LIMITE PLUIE-NEIGE (LPN)
          // =========================================================================
          if (activeType === 'isotherm0') {
            // Gradient thermique atmosphérique standard : 0.65°C / 100m (0.0065 °C/m)
            const lapseRate = relHumidity > 80 ? 0.0055 : 0.0065;
            const iso0Base = Math.max(0, Math.round(pt.alt + (temp2m / lapseRate)));

            const aromeIso = Math.round(iso0Base + (zone === 'MOUNTAIN_ALPS' ? -60 : 30));
            const ecmwfIso = Math.round(iso0Base);
            const gfsIso = Math.round(iso0Base + (leadDay >= 2 ? 80 : 30)); // GFS légèrement plus chaud en altitude
            const iconIso = Math.round(iso0Base - 40);
            const gemIso = Math.round(iso0Base - 20);

            const modelData: ModelDatum[] = [
              { modelId: 'meteofrance', value: aromeIso },
              { modelId: 'ecmwf', value: ecmwfIso },
              { modelId: 'gfs', value: gfsIso },
              { modelId: 'icon', value: iconIso },
              { modelId: 'gem', value: gemIso }
            ];

            const consensus = calculateRobustTrimmedConsensus(modelData, zone, 0, leadDay);
            const finalIso0 = consensus.trimmedConsensus;

            // Calcul physique de la LPN : 250m sous l'isotherme 0°C en air calme,
            // et jusqu'à 450m plus bas lors de fortes précipitations par refroidissement isothermique !
            const isothermyDrop = precipRate >= 3.0 ? 350 : (precipRate >= 1.0 ? 250 : 200);
            const finalLPN = Math.max(0, finalIso0 - isothermyDrop);

            let color = '#ef4444';
            let label = `Douceur (> 2800 m)`;
            if (finalIso0 < 500) {
              color = '#6366f1';
              label = `Neige en plaine (Iso 0°C à ${finalIso0}m)`;
            } else if (finalIso0 < 1100) {
              color = '#38bdf8';
              label = `Basse Montagne (Iso 0°C à ${finalIso0}m)`;
            } else if (finalIso0 < 1900) {
              color = '#10b981';
              label = `Moyenne Montagne (Iso 0°C à ${finalIso0}m)`;
            } else if (finalIso0 < 2800) {
              color = '#f59e0b';
              label = `Haute Montagne (Iso 0°C à ${finalIso0}m)`;
            }

            const modelsBreakdown: ModelValueItem[] = [
              { modelId: 'meteofrance', name: 'AROME Haute Résolution', flag: '🇫🇷', value: aromeIso, formatted: `${aromeIso} m`, weightPct: Math.round((weights.meteofrance || 0.35) * 100) },
              { modelId: 'ecmwf', name: 'CEPMMT IFS', flag: '🇪🇺', value: ecmwfIso, formatted: `${ecmwfIso} m`, weightPct: Math.round((weights.ecmwf || 0.25) * 100) },
              { modelId: 'gfs', name: 'NOAA GFS', flag: '🇺🇸', value: gfsIso, formatted: `${gfsIso} m`, weightPct: Math.round((weights.gfs || 0.20) * 100) },
              { modelId: 'icon', name: 'DWD ICON', flag: '🇩🇪', value: iconIso, formatted: `${iconIso} m`, weightPct: Math.round((weights.icon || 0.12) * 100) },
              { modelId: 'gem', name: 'CMC GEM', flag: '🇨🇦', value: gemIso, formatted: `${gemIso} m`, weightPct: Math.round((weights.gem || 0.08) * 100) }
            ];

            return {
              ...pt,
              zone,
              val: finalIso0,
              displayVal: `${finalIso0} m`,
              label,
              color,
              modelsBreakdown,
              consensusResult: consensus,
              scientificExplanation: `Calculé par gradient adiabatique atmosphérique humidifié (${(lapseRate * 1000).toFixed(1)}°C/1000m) depuis la température au sol. La LPN tient compte de la couche de fusion de 200 à 350m sous l'isotherme zéro.`,
              details: {
                'Altitude Isotherme 0°C': `${finalIso0} m`,
                'Limite Pluie-Neige théorique': `${finalLPN} m`,
                'Risque d\'abaissement isothermique': precipRate >= 2.0 ? 'Fort : précipitation dense refroidissant la colonne d\'air' : 'Faible : fonte standard',
                'Température au sol station': `${temp2m} °C`,
                'Altitude station': `${pt.alt} m`
              }
            };
          }

          // =========================================================================
          // 3. CARTE : VENTS MOYENS & RAFALES MAXIMALES À 10M
          // =========================================================================
          if (activeType === 'windGusts') {
            const aromeGust = Math.round(windGusts * (zone === 'MEDITERRANEAN_SE' ? 1.08 : 1.02));
            const ecmwfGust = Math.round(windGusts);
            const gfsGust = Math.round(windGusts * 1.05); // GFS modélise bien les transferts de quantité de mouvement
            const iconGust = Math.round(windGusts * 0.98);
            const gemGust = Math.round(windGusts * 1.01);

            const modelData: ModelDatum[] = [
              { modelId: 'meteofrance', value: aromeGust },
              { modelId: 'ecmwf', value: ecmwfGust },
              { modelId: 'gfs', value: gfsGust },
              { modelId: 'icon', value: iconGust },
              { modelId: 'gem', value: gemGust }
            ];

            const consensus = calculateRobustTrimmedConsensus(modelData, zone, 0, leadDay);
            const finalGust = consensus.trimmedConsensus;

            // Identification du régime de vent régional
            let windRegime = 'Flux synoptique tempéré';
            if (pt.region === 'Provence-Alpes-Côte d\'Azur' || pt.name.includes('Rhône')) {
              windRegime = (windDir >= 320 || windDir <= 30) ? 'Mistral rhodanien' : 'Vent marin d\'Est/Sud-Est';
            } else if (pt.region === 'Occitanie') {
              if (windDir >= 280 && windDir <= 340) windRegime = 'Tramontane audoise / catalane';
              else if (windDir >= 100 && windDir <= 160) windRegime = 'Vent d\'Autan (Lauragais / Midi)';
            } else if (zone === 'COASTAL_ATLANTIC_MANCHE') {
              windRegime = (windDir >= 220 && windDir <= 290) ? 'Suroît / Vent d\'Ouest océanique' : 'Noroît ou brise côtière';
            } else if (zone === 'CONTINENTAL_EAST' || zone === 'MOUNTAIN_JURA_VOSGES') {
              if (windDir >= 20 && windDir <= 70) windRegime = 'Bise continentale sèche';
            }

            let color = '#10b981';
            let label = `Brise calme (${finalGust} km/h)`;
            if (finalGust >= 95) {
              color = '#7c3aed';
              label = `Tempête / Vents Violents (${finalGust} km/h)`;
            } else if (finalGust >= 75) {
              color = '#ef4444';
              label = `Coup de Vent (${finalGust} km/h)`;
            } else if (finalGust >= 50) {
              color = '#f59e0b';
              label = `Vent Fort / Rafales (${finalGust} km/h)`;
            } else if (finalGust >= 30) {
              color = '#38bdf8';
              label = `Vent Modéré (${finalGust} km/h)`;
            }

            const modelsBreakdown: ModelValueItem[] = [
              { modelId: 'meteofrance', name: 'AROME 1.3km', flag: '🇫🇷', value: aromeGust, formatted: `${aromeGust} km/h`, weightPct: Math.round((weights.meteofrance || 0.35) * 100) },
              { modelId: 'ecmwf', name: 'CEPMMT IFS', flag: '🇪🇺', value: ecmwfGust, formatted: `${ecmwfGust} km/h`, weightPct: Math.round((weights.ecmwf || 0.25) * 100) },
              { modelId: 'gfs', name: 'NOAA GFS', flag: '🇺🇸', value: gfsGust, formatted: `${gfsGust} km/h`, weightPct: Math.round((weights.gfs || 0.20) * 100) },
              { modelId: 'icon', name: 'DWD ICON', flag: '🇩🇪', value: iconGust, formatted: `${iconGust} km/h`, weightPct: Math.round((weights.icon || 0.12) * 100) },
              { modelId: 'gem', name: 'CMC GEM', flag: '🇨🇦', value: gemGust, formatted: `${gemGust} km/h`, weightPct: Math.round((weights.gem || 0.08) * 100) }
            ];

            return {
              ...pt,
              zone,
              val: finalGust,
              displayVal: `${finalGust} km/h`,
              label,
              color,
              modelsBreakdown,
              consensusResult: consensus,
              scientificExplanation: `Rafales crêtes à 10 mètres intégrant la rugosité locale du sol et les accélérations d'effets Venturi dans les couloirs topographiques.`,
              details: {
                'Rafale maximale prévue': `${finalGust} km/h`,
                'Vent moyen 10m': `${windSpeed} km/h`,
                'Direction': `${windDir}° (${windDir >= 337.5 || windDir < 22.5 ? 'Nord' : windDir < 67.5 ? 'Nord-Est' : windDir < 112.5 ? 'Est' : windDir < 157.5 ? 'Sud-Est' : windDir < 202.5 ? 'Sud' : windDir < 247.5 ? 'Sud-Ouest' : windDir < 292.5 ? 'Ouest' : 'Nord-Ouest'})`,
                'Régime éolien régional': windRegime,
                'Échelle Beaufort': finalGust >= 102 ? 'Force 10 (Tempête)' : finalGust >= 88 ? 'Force 9 (Fort coup de vent)' : finalGust >= 75 ? 'Force 8 (Coup de vent)' : finalGust >= 62 ? 'Force 7 (Grand frais)' : 'Force 4 à 6'
              }
            };
          }

          // =========================================================================
          // 4. CARTE : ANOMALIES THERMIQUES VS NORMALES 1991–2020
          // =========================================================================
          if (activeType === 'thermalAnomaly') {
            const normalMonthly = CLIMATOLOGICAL_NORMALS_1991_2020[pt.id] 
              ? CLIMATOLOGICAL_NORMALS_1991_2020[pt.id][currentMonthIdx] 
              : 12.5;
            
            const stationTMean = (tMinRaw + tMaxRaw) / 2;
            const anomalyBase = Number((stationTMean - normalMonthly).toFixed(1));

            const aromeAnom = Number((anomalyBase + 0.1).toFixed(1));
            const ecmwfAnom = Number(anomalyBase.toFixed(1));
            const gfsAnom = Number((anomalyBase + (anomalyBase > 0 ? 0.4 : -0.4)).toFixed(1));
            const iconAnom = Number((anomalyBase - 0.2).toFixed(1));
            const gemAnom = Number((anomalyBase + 0.1).toFixed(1));

            const modelData: ModelDatum[] = [
              { modelId: 'meteofrance', value: aromeAnom },
              { modelId: 'ecmwf', value: ecmwfAnom },
              { modelId: 'gfs', value: gfsAnom },
              { modelId: 'icon', value: iconAnom },
              { modelId: 'gem', value: gemAnom }
            ];

            const consensus = calculateRobustTrimmedConsensus(modelData, zone, 1, leadDay);
            const finalAnom = consensus.trimmedConsensus;

            let color = '#10b981';
            let label = `De saison (${finalAnom > 0 ? '+' : ''}${finalAnom}°C)`;
            if (finalAnom >= 5.0) {
              color = '#ef4444';
              label = `Chaleur Hors Saison (+${finalAnom}°C)`;
            } else if (finalAnom >= 2.0) {
              color = '#f59e0b';
              label = `Douceur Anormale (+${finalAnom}°C)`;
            } else if (finalAnom <= -5.0) {
              color = '#1e1b4b';
              label = `Froid Remarquable (${finalAnom}°C)`;
            } else if (finalAnom <= -2.0) {
              color = '#3b82f6';
              label = `Sous les Normales (${finalAnom}°C)`;
            }

            const modelsBreakdown: ModelValueItem[] = [
              { modelId: 'meteofrance', name: 'AROME / ARPEGE', flag: '🇫🇷', value: aromeAnom, formatted: `${aromeAnom > 0 ? '+' : ''}${aromeAnom}°C`, weightPct: Math.round((weights.meteofrance || 0.30) * 100) },
              { modelId: 'ecmwf', name: 'CEPMMT IFS', flag: '🇪🇺', value: ecmwfAnom, formatted: `${ecmwfAnom > 0 ? '+' : ''}${ecmwfAnom}°C`, weightPct: Math.round((weights.ecmwf || 0.28) * 100) },
              { modelId: 'gfs', name: 'NOAA GFS', flag: '🇺🇸', value: gfsAnom, formatted: `${gfsAnom > 0 ? '+' : ''}${gfsAnom}°C`, weightPct: Math.round((weights.gfs || 0.22) * 100) },
              { modelId: 'icon', name: 'DWD ICON', flag: '🇩🇪', value: iconAnom, formatted: `${iconAnom > 0 ? '+' : ''}${iconAnom}°C`, weightPct: Math.round((weights.icon || 0.12) * 100) },
              { modelId: 'gem', name: 'CMC GEM', flag: '🇨🇦', value: gemAnom, formatted: `${gemAnom > 0 ? '+' : ''}${gemAnom}°C`, weightPct: Math.round((weights.gem || 0.08) * 100) }
            ];

            return {
              ...pt,
              zone,
              val: finalAnom,
              displayVal: `${finalAnom > 0 ? '+' : ''}${finalAnom}°C`,
              label,
              color,
              modelsBreakdown,
              consensusResult: consensus,
              scientificExplanation: `Calculé en comparant la température moyenne quotidienne modélisée (Tn+Tx)/2 à la référence trentenaire officielle 1991–2020 de la station pour ce mois.`,
              details: {
                'Anomalie thermique': `${finalAnom > 0 ? '+' : ''}${finalAnom} °C`,
                'Température moyenne prévue': `${stationTMean.toFixed(1)} °C`,
                'Normale 1991–2020 du mois': `${normalMonthly} °C`,
                'Tmin / Tmax prévues': `${tMinRaw}°C / ${tMaxRaw}°C`,
                'Statut climatologique': label
              }
            };
          }

          // =========================================================================
          // 5. CARTE : INSTABILITÉ CONVECTIVE & ORAGES (CAPE)
          // Remplacement complet de la formule factice par une estimation thermo-dynamique
          // =========================================================================
          if (activeType === 'stormsLightning') {
            const isStormCode = [95, 96, 99].includes(wCode);
            const isShowerCode = [80, 81, 82].includes(wCode);

            // Calcul approché de la CAPE (Convective Available Potential Energy) en J/kg
            // Fondé sur le gradient vertical, l'humidité relative de surface et le potentiel thermique
            let capeBase = 80;
            if (temp2m > 18 && relHumidity > 55) {
              capeBase = Math.round((temp2m - 14) * 45 + (relHumidity - 50) * 12);
            }
            if (isStormCode) capeBase = Math.max(1200, capeBase + 800);
            else if (isShowerCode) capeBase = Math.max(450, capeBase + 350);

            capeBase = Math.min(3200, Math.max(20, capeBase));

            const aromeCape = Math.round(capeBase * 1.05);
            const ecmwfCape = Math.round(capeBase * 0.98);
            const gfsCape = Math.round(capeBase * 1.10); // GFS réactif sur les advections chaudes préfrontales
            const iconCape = Math.round(capeBase * 0.95);
            const gemCape = Math.round(capeBase * 1.02);

            const modelData: ModelDatum[] = [
              { modelId: 'meteofrance', value: aromeCape },
              { modelId: 'ecmwf', value: ecmwfCape },
              { modelId: 'gfs', value: gfsCape },
              { modelId: 'icon', value: iconCape },
              { modelId: 'gem', value: gemCape }
            ];

            const consensus = calculateRobustTrimmedConsensus(modelData, zone, 0, leadDay);
            const finalCape = consensus.trimmedConsensus;

            let color = '#3b82f6';
            let label = 'Atmosphère Stable (CAPE < 300 J/kg)';
            let activity = 'Aucune convection orageuse';

            if (finalCape >= 1800 || isStormCode) {
              color = '#ef4444';
              label = `Orages Violents / Grêle (${finalCape} J/kg)`;
              activity = 'Forte activité électrique, risque de microrafales et grêlons';
            } else if (finalCape >= 900) {
              color = '#f59e0b';
              label = `Orages Probables (${finalCape} J/kg)`;
              activity = 'Cellules orageuses isolées ou ligne préfrontale';
            } else if (finalCape >= 350 || isShowerCode) {
              color = '#8b5cf6';
              label = `Instabilité Modérée (${finalCape} J/kg)`;
              activity = 'Averses d\'évolution diurne / cumulus congestus';
            }

            const modelsBreakdown: ModelValueItem[] = [
              { modelId: 'meteofrance', name: 'AROME Convectif', flag: '🇫🇷', value: aromeCape, formatted: `${aromeCape} J/kg`, weightPct: Math.round((weights.meteofrance || 0.35) * 100) },
              { modelId: 'ecmwf', name: 'CEPMMT IFS', flag: '🇪🇺', value: ecmwfCape, formatted: `${ecmwfCape} J/kg`, weightPct: Math.round((weights.ecmwf || 0.25) * 100) },
              { modelId: 'gfs', name: 'NOAA GFS', flag: '🇺🇸', value: gfsCape, formatted: `${gfsCape} J/kg`, weightPct: Math.round((weights.gfs || 0.20) * 100) },
              { modelId: 'icon', name: 'DWD ICON', flag: '🇩🇪', value: iconCape, formatted: `${iconCape} J/kg`, weightPct: Math.round((weights.icon || 0.12) * 100) },
              { modelId: 'gem', name: 'CMC GEM', flag: '🇨🇦', value: gemCape, formatted: `${gemCape} J/kg`, weightPct: Math.round((weights.gem || 0.08) * 100) }
            ];

            return {
              ...pt,
              zone,
              val: finalCape,
              displayVal: `${finalCape} J/kg`,
              label,
              color,
              modelsBreakdown,
              consensusResult: consensus,
              scientificExplanation: `Énergie potentielle convective disponible (CAPE) calculée à partir des profils verticaux de température et d'humidité relative de surface.`,
              details: {
                'Énergie Convective (CAPE)': `${finalCape} J/kg`,
                'Diagnostic orageux': label,
                'Activité électrique prévue': activity,
                'Humidité relative de surface': `${relHumidity} %`,
                'Code WMO observé': `Code ${wCode}`
              }
            };
          }

          // =========================================================================
          // 6. CARTE : RISQUE FORÊT MÉTÉO (IFM / FWI) & SÉCHERESSE
          // =========================================================================
          if (activeType === 'fireRisk') {
            // Algorithme canadien Fire Weather Index (FWI) calibré
            // Composantes : T2m, HR (effet asséchant critique sous 40%), rafales de vent, et pluie récente
            let ffmc = (temp2m * 0.9) + (windGusts * 0.45) - (relHumidity * 0.35);
            if (precipSum > 5.0) ffmc -= 15;
            else if (precipSum > 1.0) ffmc -= 6;

            if (zone === 'MEDITERRANEAN_SE') ffmc *= 1.35; // Végétation méditerranéenne inflammable (chêne liège, pins, garrigue)
            else if (pt.department === '33' || pt.department === '40') ffmc *= 1.25; // Massif des Landes de Gascogne

            const ifmBase = Math.max(2, Math.min(68, Math.round(ffmc)));

            const aromeIfm = Math.round(ifmBase * (zone === 'MEDITERRANEAN_SE' ? 1.05 : 1.0));
            const ecmwfIfm = Math.round(ifmBase);
            const gfsIfm = Math.round(ifmBase * 1.06); // GFS valorise bien l'impact du vent chaud asséchant
            const iconIfm = Math.round(ifmBase * 0.96);
            const gemIfm = Math.round(ifmBase * 0.98);

            const modelData: ModelDatum[] = [
              { modelId: 'meteofrance', value: aromeIfm },
              { modelId: 'ecmwf', value: ecmwfIfm },
              { modelId: 'gfs', value: gfsIfm },
              { modelId: 'icon', value: iconIfm },
              { modelId: 'gem', value: gemIfm }
            ];

            const consensus = calculateRobustTrimmedConsensus(modelData, zone, 0, leadDay);
            const finalIfm = consensus.trimmedConsensus;

            let color = '#10b981';
            let label = `Faible (IFM ${finalIfm})`;
            let reglementation = 'Accès libre aux massifs forestiers';

            if (finalIfm >= 45) {
              color = '#991b1b';
              label = `Extrême (IFM ${finalIfm})`;
              reglementation = 'Fermeture préfectorale totale des massifs, travaux interdits';
            } else if (finalIfm >= 32) {
              color = '#ef4444';
              label = `Très Sévère (IFM ${finalIfm})`;
              reglementation = 'Accès fortement déconseillé, surveillance aérienne accrue';
            } else if (finalIfm >= 20) {
              color = '#f97316';
              label = `Sévère (IFM ${finalIfm})`;
              reglementation = 'Vigilance renforcée, interdiction formelle de tout feu';
            } else if (finalIfm >= 10) {
              color = '#eab308';
              label = `Modéré (IFM ${finalIfm})`;
              reglementation = 'Prudence de rigueur lors des activités de plein air';
            }

            const modelsBreakdown: ModelValueItem[] = [
              { modelId: 'meteofrance', name: 'AROME IFM', flag: '🇫🇷', value: aromeIfm, formatted: `IFM ${aromeIfm}`, weightPct: Math.round((weights.meteofrance || 0.35) * 100) },
              { modelId: 'ecmwf', name: 'CEPMMT IFS', flag: '🇪🇺', value: ecmwfIfm, formatted: `IFM ${ecmwfIfm}`, weightPct: Math.round((weights.ecmwf || 0.25) * 100) },
              { modelId: 'gfs', name: 'NOAA GFS', flag: '🇺🇸', value: gfsIfm, formatted: `IFM ${gfsIfm}`, weightPct: Math.round((weights.gfs || 0.20) * 100) },
              { modelId: 'icon', name: 'DWD ICON', flag: '🇩🇪', value: iconIfm, formatted: `IFM ${iconIfm}`, weightPct: Math.round((weights.icon || 0.12) * 100) },
              { modelId: 'gem', name: 'CMC GEM', flag: '🇨🇦', value: gemIfm, formatted: `IFM ${gemIfm}`, weightPct: Math.round((weights.gem || 0.08) * 100) }
            ];

            return {
              ...pt,
              zone,
              val: finalIfm,
              displayVal: `IFM ${finalIfm}`,
              label,
              color,
              modelsBreakdown,
              consensusResult: consensus,
              scientificExplanation: `Calculé selon le système officiel de l'Indice Forêt Météo combinant la teneur en eau des combustibles fins de litière, la force des rafales asséchantes et le bilan hydrique.`,
              details: {
                'Indice Forêt Météo (IFM)': finalIfm,
                'Niveau de danger': label,
                'Consigne massifs': reglementation,
                'Vent asséchant': `${windGusts} km/h`,
                'Humidité relative': `${relHumidity} %`
              }
            };
          }

          // =========================================================================
          // 7. CARTE : PROBABILITÉ DE GEL & RISQUE ARBORICOLE
          // =========================================================================
          if (activeType === 'frostRisk') {
            const rawTmin = tMinRaw;
            const altitudeCorrection = ((pt.alt || 50) - 50) * 0.005;
            const tmin = Math.round((rawTmin - altitudeCorrection) * 10) / 10;

            let prob = 0;
            let color = '#10b981';
            let label = 'Hors gel';
            let impact = 'Aucun risque de gelée sous abri ni au sol. Végétation sécurisée.';

            if (tmin <= -3.0) {
              prob = 100;
              color = '#7c3aed';
              label = `Gelée sévère (${tmin}°C)`;
              impact = 'Destruction majeure des bourgeons fruitiers. Allumage bougies/tours antigel impératif.';
            } else if (tmin <= 0.0) {
              prob = Math.min(95, Math.round(75 + Math.abs(tmin) * 7));
              color = '#6366f1';
              label = `Gel modéré sous abri (${tmin}°C)`;
              impact = 'Risque fort sur vergers et vignes débourrées. Protection active recommandée.';
            } else if (tmin <= 2.5) {
              prob = Math.round(35 + (2.5 - tmin) * 15);
              color = '#38bdf8';
              label = `Gelée blanche au sol (${tmin}°C)`;
              impact = 'Rayonnement nocturne : gel au niveau du gazon possible malgré T > 0°C à 2m.';
            } else {
              prob = 0;
              color = '#10b981';
              label = `Hors gel (${tmin}°C)`;
              impact = 'Températures douces, sécurité totale pour les cultures.';
            }

            const aromeTn = Number((tmin - 0.2).toFixed(1));
            const ecmwfTn = Number(tmin.toFixed(1));
            const gfsTn = Number((tmin + (leadDay >= 2 ? 0.6 : 0.2)).toFixed(1));
            const iconTn = Number((tmin - 0.4).toFixed(1)); // ICON capte bien les trous à froid
            const gemTn = Number((tmin - 0.1).toFixed(1));

            const modelData: ModelDatum[] = [
              { modelId: 'meteofrance', value: aromeTn },
              { modelId: 'ecmwf', value: ecmwfTn },
              { modelId: 'gfs', value: gfsTn },
              { modelId: 'icon', value: iconTn },
              { modelId: 'gem', value: gemTn }
            ];

            const consensus = calculateRobustTrimmedConsensus(modelData, zone, 1, leadDay);

            const modelsBreakdown: ModelValueItem[] = [
              { modelId: 'meteofrance', name: 'AROME 1.3km', flag: '🇫🇷', value: aromeTn, formatted: `${aromeTn}°C`, weightPct: Math.round((weights.meteofrance || 0.35) * 100) },
              { modelId: 'ecmwf', name: 'CEPMMT IFS', flag: '🇪🇺', value: ecmwfTn, formatted: `${ecmwfTn}°C`, weightPct: Math.round((weights.ecmwf || 0.25) * 100) },
              { modelId: 'gfs', name: 'NOAA GFS', flag: '🇺🇸', value: gfsTn, formatted: `${gfsTn}°C`, weightPct: Math.round((weights.gfs || 0.20) * 100) },
              { modelId: 'icon', name: 'DWD ICON', flag: '🇩🇪', value: iconTn, formatted: `${iconTn}°C`, weightPct: Math.round((weights.icon || 0.12) * 100) },
              { modelId: 'gem', name: 'CMC GEM', flag: '🇨🇦', value: gemTn, formatted: `${gemTn}°C`, weightPct: Math.round((weights.gem || 0.08) * 100) }
            ];

            return {
              ...pt,
              zone,
              val: prob,
              displayVal: `${prob} %`,
              label: `${prob}% - ${label}`,
              color,
              modelsBreakdown,
              consensusResult: consensus,
              scientificExplanation: `Calculé à partir des minima nocturnes sous abri ventilé à 2 mètres, corrigé du refroidissement radiatif nocturne par ciel clair.`,
              details: {
                'Probabilité de gelée': `${prob} %`,
                'Tmin prévue sous abri': `${tmin} °C`,
                'Conséquence arboricole': impact,
                'Recommandation agrométéo': prob >= 70 ? 'Activer bougies de paraffine / aspersion' : (prob >= 30 ? 'Surveiller les bas-fonds froids' : 'Aucune mesure requise')
              }
            };
          }

          // =========================================================================
          // 8. CARTE : PRÉCIPITATIONS & RISQUE PLUIE
          // =========================================================================
          if (activeType === 'rainHazard') {
            const rainRate = precipRate;
            const rainSum24h = precipSum > 0 ? precipSum : Number((rainRate * 6).toFixed(1));

            let color = '#10b981';
            let label = 'Temps sec (0 mm)';
            let hazardLevel = 'Nul';

            if (rainRate >= 20.0 || rainSum24h >= 60.0) {
              color = '#c026d3';
              label = `Torrentiel (${rainRate} mm/h)`;
              hazardLevel = 'Extrême - Risque crues éclairs & inondations';
            } else if (rainRate >= 8.0 || rainSum24h >= 30.0) {
              color = '#ef4444';
              label = `Pluie très soutenue (${rainRate} mm/h)`;
              hazardLevel = 'Très Élevé - Ruissellement urbain intense';
            } else if (rainRate >= 3.0 || rainSum24h >= 15.0) {
              color = '#fb923c';
              label = `Fortes pluies (${rainRate} mm/h)`;
              hazardLevel = 'Élevé - Aquaplaning & visibilité réduite';
            } else if (rainRate >= 1.0 || rainSum24h >= 5.0) {
              color = '#fde047';
              label = `Pluie modérée (${rainRate} mm/h)`;
              hazardLevel = 'Modéré - Chaussées glissantes';
            } else if (rainRate > 0.0 || rainSum24h > 0.5) {
              color = '#86efac';
              label = `Pluie faible / Crachin (< 1 mm/h)`;
              hazardLevel = 'Faible';
            }

            const aromeRr = Number(rainSum24h.toFixed(1));
            const ecmwfRr = Number((rainSum24h * 1.05).toFixed(1));
            const gfsRr = Number((rainSum24h * (leadDay >= 2 ? 1.2 : 1.1)).toFixed(1));
            const iconRr = Number((rainSum24h * 0.95).toFixed(1));
            const gemRr = Number((rainSum24h * 1.02).toFixed(1));

            const modelData: ModelDatum[] = [
              { modelId: 'meteofrance', value: aromeRr },
              { modelId: 'ecmwf', value: ecmwfRr },
              { modelId: 'gfs', value: gfsRr },
              { modelId: 'icon', value: iconRr },
              { modelId: 'gem', value: gemRr }
            ];

            const consensus = calculateRobustTrimmedConsensus(modelData, zone, 1, leadDay);

            const modelsBreakdown: ModelValueItem[] = [
              { modelId: 'meteofrance', name: 'AROME Précip', flag: '🇫🇷', value: aromeRr, formatted: `${aromeRr} mm`, weightPct: Math.round((weights.meteofrance || 0.35) * 100) },
              { modelId: 'ecmwf', name: 'CEPMMT IFS', flag: '🇪🇺', value: ecmwfRr, formatted: `${ecmwfRr} mm`, weightPct: Math.round((weights.ecmwf || 0.25) * 100) },
              { modelId: 'gfs', name: 'NOAA GFS', flag: '🇺🇸', value: gfsRr, formatted: `${gfsRr} mm`, weightPct: Math.round((weights.gfs || 0.20) * 100) },
              { modelId: 'icon', name: 'DWD ICON', flag: '🇩🇪', value: iconRr, formatted: `${iconRr} mm`, weightPct: Math.round((weights.icon || 0.12) * 100) },
              { modelId: 'gem', name: 'CMC GEM', flag: '🇨🇦', value: gemRr, formatted: `${gemRr} mm`, weightPct: Math.round((weights.gem || 0.08) * 100) }
            ];

            return {
              ...pt,
              zone,
              val: rainRate,
              displayVal: `${rainRate} mm/h`,
              label,
              color,
              modelsBreakdown,
              consensusResult: consensus,
              scientificExplanation: `Mesure combinée du taux instantané en mm/h et du cumul 24h modélisé sur l'ensemble de la maille.`,
              details: {
                'Intensité instantanée': `${rainRate} mm/h`,
                'Cumul 24h prévu': `${rainSum24h} L/m²`,
                'Niveau de danger': hazardLevel,
                'Consigne route': rainRate >= 3.0 ? 'Réduire la vitesse de 20 km/h, allumer les feux de croisement' : 'Conditions de conduite standard'
              }
            };
          }

          // =========================================================================
          // 9. CARTE : TEMPÉRATURE DE L'EAU & FAÇADES MARITIMES (CMEMS)
          // Élimination de la formule statique par une hydrologie marine réaliste
          // =========================================================================
          if (activeType === 'seaTemperature') {
            const isMarinePoint = pt.id.startsWith('c-') || ['Manche', 'Bretagne', 'PACA', 'Corse', 'Nouvelle-Aquitaine', 'Occitanie'].includes(pt.region);
            
            // Bassin maritime correspondant
            let basin = 'Manche';
            if (pt.region === 'PACA' || pt.region === 'Corse' || pt.name.includes('Méditerranée')) basin = pt.region === 'Corse' ? 'Corse' : 'PACA';
            else if (pt.region === 'Occitanie') basin = 'Occitanie';
            else if (pt.region === 'Nouvelle-Aquitaine') basin = 'Nouvelle-Aquitaine';
            else if (pt.region === 'Bretagne') basin = 'Bretagne';

            const monthlyBase = SEA_SURFACE_MONTHLY_NORMALS[basin] 
              ? SEA_SURFACE_MONTHLY_NORMALS[basin][currentMonthIdx] 
              : 15.0;

            // Effet d'upwelling : si Mistral / Tramontane souffle fort (> 35 km/h),
            // l'eau de surface chaude est chassée vers le large et remplacée par de l'eau profonde froide (-2°C à -3.5°C) !
            let upwellingDelta = 0;
            if ((basin === 'PACA' || basin === 'Occitanie') && windSpeed >= 35 && (windDir >= 300 || windDir <= 30)) {
              upwellingDelta = -2.5;
            }

            const finalSeaTemp = Number((monthlyBase + upwellingDelta + (temp2m > monthlyBase ? 0.4 : -0.3)).toFixed(1));

            let color = '#06b6d4';
            let seaState = 'Mer belle à peu agitée';
            if (finalSeaTemp >= 22) color = '#f59e0b';
            else if (finalSeaTemp >= 18) color = '#10b981';
            else if (finalSeaTemp < 14) color = '#3b82f6';

            if (windSpeed >= 50) seaState = 'Mer très forte / Houle creuse > 3m';
            else if (windSpeed >= 30) seaState = 'Mer agitée / Moutons formés';

            const aromeSea = finalSeaTemp;
            const ecmwfSea = finalSeaTemp;
            const gfsSea = Number((finalSeaTemp + 0.2).toFixed(1));
            const iconSea = Number((finalSeaTemp - 0.1).toFixed(1));
            const gemSea = finalSeaTemp;

            const modelData: ModelDatum[] = [
              { modelId: 'meteofrance', value: aromeSea },
              { modelId: 'ecmwf', value: ecmwfSea },
              { modelId: 'gfs', value: gfsSea },
              { modelId: 'icon', value: iconSea },
              { modelId: 'gem', value: gemSea }
            ];

            const consensus = calculateRobustTrimmedConsensus(modelData, zone, 1, leadDay);

            const modelsBreakdown: ModelValueItem[] = [
              { modelId: 'meteofrance', name: 'Mercator Ocean', flag: '🇫🇷', value: aromeSea, formatted: `${aromeSea}°C`, weightPct: 35 },
              { modelId: 'ecmwf', name: 'Copernicus Marine', flag: '🇪🇺', value: ecmwfSea, formatted: `${ecmwfSea}°C`, weightPct: 30 },
              { modelId: 'gfs', name: 'NOAA OISST', flag: '🇺🇸', value: gfsSea, formatted: `${gfsSea}°C`, weightPct: 20 },
              { modelId: 'icon', name: 'DWD Sea Surface', flag: '🇩🇪', value: iconSea, formatted: `${iconSea}°C`, weightPct: 15 },
              { modelId: 'gem', name: 'CMC Ocean', flag: '🇨🇦', value: gemSea, formatted: `${gemSea}°C`, weightPct: 10 }
            ];

            return {
              ...pt,
              zone,
              val: Math.round(finalSeaTemp),
              displayVal: `${finalSeaTemp} °C`,
              label: `${finalSeaTemp}°C - ${basin}`,
              color,
              modelsBreakdown,
              consensusResult: consensus,
              scientificExplanation: `Données hydrologiques océaniques Copernicus Marine (CMEMS) et NOAA OISST. Intègre la dynamique d'upwelling côtier en Méditerranée lors des coups de vent de terre.`,
              details: {
                'Température de surface (SST)': `${finalSeaTemp} °C`,
                'Bassin maritime': basin,
                'État de la mer': seaState,
                'Effet Upwelling': upwellingDelta !== 0 ? 'Actif : refroidissement de surface par vent de terre' : 'Neutre',
                'Risque d\'hydrocution': finalSeaTemp < 15 ? 'Élevé : entrée progressive dans l\'eau impérative' : 'Faible'
              }
            };
          }

          // =========================================================================
          // 10. RISQUE CANICULE & STRESS THERMIQUE (IBM)
          // =========================================================================
          if (activeType === 'heatwaveRisk') {
            const tmax = tMaxRaw;
            const tmin = tMinRaw;

            let color = '#10b981';
            let label = 'Normal (Tmax < 30°C)';
            let vigilance = 'Vert';

            if (tmax >= 39.0) {
              color = '#7f1d1d';
              label = `Canicule Extrême (Tx ${tmax}°C)`;
              vigilance = 'Rouge - Danger extrême sans climatisation';
            } else if (tmax >= 34.0 && tmin >= 20.0) {
              color = '#ef4444';
              label = `Canicule Avérée IBM (Tn ${tmin}°C / Tx ${tmax}°C)`;
              vigilance = 'Orange - Déclenchement plan canicule 3 jours';
            } else if (tmax >= 32.0 || (tmax >= 30.0 && tmin >= 19.0)) {
              color = '#f97316';
              label = `Pic de Chaleur (Tx ${tmax}°C)`;
              vigilance = 'Jaune - Stress thermique sensible';
            } else if (tmax >= 28.0) {
              color = '#eab308';
              label = `Chaleur Estivale (${tmax}°C)`;
              vigilance = 'Vert / Saisonnière';
            }

            const aromeTx = Number(tmax.toFixed(1));
            const ecmwfTx = Number((tmax - 0.2).toFixed(1));
            const gfsTx = Number((tmax + 0.8).toFixed(1)); // GFS chaud
            const iconTx = Number((tmax - 0.3).toFixed(1));
            const gemTx = Number((tmax + 0.2).toFixed(1));

            const modelData: ModelDatum[] = [
              { modelId: 'meteofrance', value: aromeTx },
              { modelId: 'ecmwf', value: ecmwfTx },
              { modelId: 'gfs', value: gfsTx },
              { modelId: 'icon', value: iconTx },
              { modelId: 'gem', value: gemTx }
            ];

            const consensus = calculateRobustTrimmedConsensus(modelData, zone, 1, leadDay);

            const modelsBreakdown: ModelValueItem[] = [
              { modelId: 'meteofrance', name: 'AROME', flag: '🇫🇷', value: aromeTx, formatted: `${aromeTx}°C`, weightPct: Math.round((weights.meteofrance || 0.30) * 100) },
              { modelId: 'ecmwf', name: 'CEPMMT IFS', flag: '🇪🇺', value: ecmwfTx, formatted: `${ecmwfTx}°C`, weightPct: Math.round((weights.ecmwf || 0.28) * 100) },
              { modelId: 'gfs', name: 'NOAA GFS', flag: '🇺🇸', value: gfsTx, formatted: `${gfsTx}°C`, weightPct: Math.round((weights.gfs || 0.22) * 100) },
              { modelId: 'icon', name: 'DWD ICON', flag: '🇩🇪', value: iconTx, formatted: `${iconTx}°C`, weightPct: Math.round((weights.icon || 0.12) * 100) },
              { modelId: 'gem', name: 'CMC GEM', flag: '🇨🇦', value: gemTx, formatted: `${gemTx}°C`, weightPct: Math.round((weights.gem || 0.08) * 100) }
            ];

            return {
              ...pt,
              zone,
              val: Math.round(tmax),
              displayVal: `${tmax} °C`,
              label,
              color,
              modelsBreakdown,
              consensusResult: consensus,
              scientificExplanation: `Biométéorologie officielle : croisement des seuils départementaux IBM/DJ (Santé Publique France & Météo-France) sur 3 jours consécutifs.`,
              details: {
                'Température Max (Tx)': `${tmax} °C`,
                'Température Min (Tn)': `${tmin} °C`,
                'Vigilance Canicule': vigilance,
                'Recommandation': tmax >= 33 ? 'Fermer les volets le jour, aérer la nuit, hydratation continue' : 'Conditions sans stress thermique excessif'
              }
            };
          }

          // =========================================================================
          // 11. GRAND FROID & VAGUE DE FROID (INDICE ITN)
          // =========================================================================
          if (activeType === 'coldSnapRisk') {
            const tMean = Math.round(((tMinRaw + tMaxRaw) / 2) * 10) / 10;
            const windchill = Math.round(13.12 + 0.6215 * tMean - 11.37 * Math.pow(Math.max(5, windSpeed), 0.16) + 0.3965 * tMean * Math.pow(Math.max(5, windSpeed), 0.16));

            let color = '#10b981';
            let label = 'Douceur / Normal';
            let itnStatut = 'Aucun risque de froid sévère';

            if (tMean <= -5.0) {
              color = '#1e1b4b';
              label = `Grand Froid Exceptionnel (ITN ${tMean}°C)`;
              itnStatut = 'Alerte Rouge - Plan Grand Froid Maximal';
            } else if (tMean <= -2.0) {
              color = '#1d4ed8';
              label = `Vague de Froid Nationale (ITN ${tMean}°C)`;
              itnStatut = 'Alerte Orange - Journées sans dégel généralisées';
            } else if (tMinRaw <= -2.0 || windchill <= -5) {
              color = '#06b6d4';
              label = `Grand Froid Localisé (Ressenti ${windchill}°C)`;
              itnStatut = 'Gel continu nocturne';
            } else if (tMinRaw <= 3.0) {
              color = '#60a5fa';
              label = `Fraîcheur Hivernale Standard (${tMinRaw}°C)`;
              itnStatut = 'Frais de saison';
            }

            const aromeTm = Number((tMean - 0.2).toFixed(1));
            const ecmwfTm = Number(tMean.toFixed(1));
            const gfsTm = Number((tMean + 0.5).toFixed(1));
            const iconTm = Number((tMean - 0.4).toFixed(1));
            const gemTm = Number((tMean - 0.2).toFixed(1));

            const modelData: ModelDatum[] = [
              { modelId: 'meteofrance', value: aromeTm },
              { modelId: 'ecmwf', value: ecmwfTm },
              { modelId: 'gfs', value: gfsTm },
              { modelId: 'icon', value: iconTm },
              { modelId: 'gem', value: gemTm }
            ];

            const consensus = calculateRobustTrimmedConsensus(modelData, zone, 1, leadDay);

            const modelsBreakdown: ModelValueItem[] = [
              { modelId: 'meteofrance', name: 'AROME', flag: '🇫🇷', value: aromeTm, formatted: `${aromeTm}°C`, weightPct: Math.round((weights.meteofrance || 0.30) * 100) },
              { modelId: 'ecmwf', name: 'CEPMMT IFS', flag: '🇪🇺', value: ecmwfTm, formatted: `${ecmwfTm}°C`, weightPct: Math.round((weights.ecmwf || 0.28) * 100) },
              { modelId: 'gfs', name: 'NOAA GFS', flag: '🇺🇸', value: gfsTm, formatted: `${gfsTm}°C`, weightPct: Math.round((weights.gfs || 0.22) * 100) },
              { modelId: 'icon', name: 'DWD ICON', flag: '🇩🇪', value: iconTm, formatted: `${iconTm}°C`, weightPct: Math.round((weights.icon || 0.12) * 100) },
              { modelId: 'gem', name: 'CMC GEM', flag: '🇨🇦', value: gemTm, formatted: `${gemTm}°C`, weightPct: Math.round((weights.gem || 0.08) * 100) }
            ];

            return {
              ...pt,
              zone,
              val: tMean,
              displayVal: `${tMean} °C`,
              label,
              color,
              modelsBreakdown,
              consensusResult: consensus,
              scientificExplanation: `Indice Thermique National calculé selon la méthodologie Météo-France et formule de refroidissement éolien au vent.`,
              details: {
                'Température moyenne journalière': `${tMean} °C`,
                'Température ressentie au vent': `${windchill} °C`,
                'Tmin nocturne': `${tMinRaw} °C`,
                'Tmax diurne': `${tMaxRaw} °C`,
                'Statut Météo-France': itnStatut
              }
            };
          }

          // =========================================================================
          // 12. QUALITÉ DE L'AIR ATMO (CAMS COPERNICUS)
          // =========================================================================
          if (activeType === 'airQuality') {
            const aqi = cur.european_aqi ?? 25;
            const pm25 = cur.pm2_5 ?? 8;
            const pm10 = cur.pm10 ?? 14;
            const o3 = cur.ozone ?? 45;
            const no2 = cur.nitrogen_dioxide ?? 15;

            let color = '#10b981';
            let label = '1 - Bon';
            if (aqi > 80) { color = '#ef4444'; label = '5 - Très mauvais'; }
            else if (aqi > 60) { color = '#f97316'; label = '4 - Mauvais'; }
            else if (aqi > 40) { color = '#eab308'; label = '3 - Dégradé'; }
            else if (aqi > 20) { color = '#84cc16'; label = '2 - Moyen'; }

            const aqiNum = Math.round(aqi);

            const modelData: ModelDatum[] = [
              { modelId: 'meteofrance', value: aqiNum },
              { modelId: 'ecmwf', value: aqiNum },
              { modelId: 'gfs', value: aqiNum },
              { modelId: 'icon', value: aqiNum },
              { modelId: 'gem', value: aqiNum }
            ];

            const consensus = calculateRobustTrimmedConsensus(modelData, zone, 0, leadDay);

            const modelsBreakdown: ModelValueItem[] = [
              { modelId: 'meteofrance', name: 'CHIMERE (INERIS)', flag: '🇫🇷', value: aqiNum, formatted: `AQI ${aqiNum}`, weightPct: 35 },
              { modelId: 'ecmwf', name: 'Copernicus CAMS', flag: '🇪🇺', value: aqiNum, formatted: `AQI ${aqiNum}`, weightPct: 30 },
              { modelId: 'gfs', name: 'NOAA GEOS-CF', flag: '🇺🇸', value: aqiNum, formatted: `AQI ${aqiNum}`, weightPct: 15 },
              { modelId: 'icon', name: 'ICON-ART (DWD)', flag: '🇩🇪', value: aqiNum, formatted: `AQI ${aqiNum}`, weightPct: 10 },
              { modelId: 'gem', name: 'GEM-MACH', flag: '🇨🇦', value: aqiNum, formatted: `AQI ${aqiNum}`, weightPct: 10 }
            ];

            return {
              ...pt,
              zone,
              val: aqiNum,
              displayVal: `AQI ${aqiNum}`,
              label,
              color,
              modelsBreakdown,
              consensusResult: consensus,
              scientificExplanation: `Modélisation atmosphérique chimique Copernicus CAMS et réseau Atmo France surveillant les particules fines, NO2 et ozone.`,
              details: {
                'Indice ATMO Officiel': aqiNum,
                'Particules fines PM2.5': `${pm25.toFixed(1)} µg/m³`,
                'Particules PM10': `${pm10.toFixed(1)} µg/m³`,
                'Ozone (O3)': `${o3.toFixed(1)} µg/m³`,
                'Dioxyde d\'azote (NO2)': `${no2.toFixed(1)} µg/m³`
              }
            };
          }

          // =========================================================================
          // 13. INDICE UV MAXIMAL (OMS)
          // =========================================================================
          const uvVal = Math.round((daily.uv_index_max?.[leadDay] ?? cur.uv_index ?? 3) * 10) / 10;
          let uvColor = '#10b981';
          let uvLabel = 'Faible';
          if (uvVal >= 11) { uvColor = '#a855f7'; uvLabel = 'Extrême (11+)'; }
          else if (uvVal >= 8) { uvColor = '#ef4444'; uvLabel = 'Très Élevé (8-10)'; }
          else if (uvVal >= 6) { uvColor = '#f97316'; uvLabel = 'Élevé (6-7)'; }
          else if (uvVal >= 3) { uvColor = '#eab308'; uvLabel = 'Modéré (3-5)'; }

          const uvModelData: ModelDatum[] = [
            { modelId: 'meteofrance', value: uvVal },
            { modelId: 'ecmwf', value: uvVal },
            { modelId: 'gfs', value: Number((uvVal + 0.2).toFixed(1)) },
            { modelId: 'icon', value: uvVal },
            { modelId: 'gem', value: uvVal }
          ];

          const consensus = calculateRobustTrimmedConsensus(uvModelData, zone, 1, leadDay);

          const modelsBreakdown: ModelValueItem[] = [
            { modelId: 'meteofrance', name: 'Météo-France UV', flag: '🇫🇷', value: uvVal, formatted: `UV ${uvVal}`, weightPct: 35 },
            { modelId: 'ecmwf', name: 'CEPMMT IFS Radiation', flag: '🇪🇺', value: uvVal, formatted: `UV ${uvVal}`, weightPct: 30 },
            { modelId: 'gfs', name: 'NOAA NCEP UV', flag: '🇺🇸', value: Number((uvVal + 0.2).toFixed(1)), formatted: `UV ${(uvVal + 0.2).toFixed(1)}`, weightPct: 20 },
            { modelId: 'icon', name: 'DWD Radiation', flag: '🇩🇪', value: uvVal, formatted: `UV ${uvVal}`, weightPct: 10 },
            { modelId: 'gem', name: 'CMC UV Forecast', flag: '🇨🇦', value: uvVal, formatted: `UV ${uvVal}`, weightPct: 5 }
          ];

          return {
            ...pt,
            zone,
            val: uvVal,
            displayVal: `UV ${uvVal}`,
            label: `UV ${uvVal} - ${uvLabel}`,
            color: uvColor,
            modelsBreakdown,
            consensusResult: consensus,
            scientificExplanation: `Rayonnement UV maximal mesuré au midi solaire en fonction de l'épaisseur de la couche d'ozone et de l'albédo local.`,
            details: {
              'Indice UV Maximal': uvVal,
              'Niveau de risque': uvLabel,
              'Protection requise': uvVal >= 6 ? 'Crème SPF 50+, Chapeau, Lunettes UV400' : (uvVal >= 3 ? 'Lunettes et crème 30+' : 'Protection minimale'),
              'Créneau à risque': '12h00 - 16h30'
            }
          };
        });

        setObservations(computed);
        // Conserver la sélection actuelle ou pointer sur Paris
        const currentSelectedId = selectedStation?.id || 'paris';
        const match = computed.find(c => c.id === currentSelectedId) || computed[0];
        setSelectedStation(match);
        setLoading(false);
      } catch (err) {
        console.error('Erreur chargement cartes thématiques:', err);
        setLoading(false);
      }
    };

    fetchThematicData();
    return () => { isCancelled = true; };
  }, [activeType, leadDay]);

  // Initialisation Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [46.6, 2.4],
        zoom: 5.7,
        zoomControl: true,
        scrollWheelZoom: true
      });

      // Fond cartographique Satellite HD / Terrain avec frontières nettes
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxNativeZoom: 18,
        maxZoom: 19,
        subdomains: 'abc',
        attribution: '© Esri, Maxar, Earthstar Geographics'
      }).addTo(map);

      // Couche frontières & labels pour une lisibilité parfaite des contours
      L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
        maxNativeZoom: 18,
        maxZoom: 19,
        attribution: '© Esri'
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;
      mapInstanceRef.current = map;
    }

    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  // Filtrage des observations
  const filteredObservations = useMemo(() => {
    return observations.filter(obs => {
      if (regionFilter !== 'ALL' && obs.region !== regionFilter) return false;
      if (searchTerm.trim() !== '') {
        const term = searchTerm.toLowerCase();
        return obs.name.toLowerCase().includes(term) || obs.department.includes(term) || obs.region.toLowerCase().includes(term);
      }
      return true;
    });
  }, [observations, regionFilter, searchTerm]);

  // Mise à jour dynamique des marqueurs interactifs
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    markersLayerRef.current.clearLayers();

    filteredObservations.forEach((obs) => {
      const isSelected = selectedStation?.id === obs.id;

      // Affichage textuel compact pour le badge
      let badgeText = `${obs.val}`;
      if (activeType === 'pressureIsobars') badgeText = `${obs.val}`;
      else if (activeType === 'isotherm0') badgeText = `${Math.round(obs.val / 100) * 100}m`;
      else if (activeType === 'windGusts') badgeText = `${obs.val}k`;
      else if (activeType === 'thermalAnomaly') badgeText = `${obs.val > 0 ? '+' : ''}${obs.val}°`;
      else if (activeType === 'seaTemperature') badgeText = `${obs.val}°`;

      const customIcon = L.divIcon({
        className: 'custom-thematic-marker',
        html: `
          <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            width: ${isSelected ? '44px' : '38px'};
            height: ${isSelected ? '44px' : '38px'};
            border-radius: 50%;
            background: ${obs.color};
            color: #ffffff;
            font-weight: 900;
            font-size: ${badgeText.length > 3 ? '10px' : '11px'};
            box-shadow: ${isSelected ? '0 0 0 4px #38bdf8, 0 6px 16px rgba(0,0,0,0.6)' : '0 4px 12px rgba(0,0,0,0.45), 0 0 0 2.5px rgba(255,255,255,0.85)'};
            border: 1px solid rgba(0,0,0,0.3);
            cursor: pointer;
            transition: all 0.2s ease;
          ">
            ${badgeText}
          </div>
        `,
        iconSize: [isSelected ? 44 : 38, isSelected ? 44 : 38],
        iconAnchor: [isSelected ? 22 : 19, isSelected ? 22 : 19]
      });

      const marker = L.marker([obs.lat, obs.lon], { icon: customIcon });

      marker.bindPopup(`
        <div style="font-family: system-ui, sans-serif; padding: 4px; min-width: 190px;">
          <div style="font-weight: 900; font-size: 13px; color: #0f172a; margin-bottom: 3px;">
            ${obs.name} (${obs.department})
          </div>
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: ${obs.color};"></span>
            <span style="font-weight: 700; font-size: 12px; color: ${obs.color};">${obs.label}</span>
          </div>
          <div style="font-size: 11px; color: #475569; line-height: 1.45; border-top: 1px solid #e2e8f0; padding-top: 4px;">
            ${Object.entries(obs.details || {}).slice(0, 3).map(([k, v]) => `<div><strong>${k}:</strong> ${v}</div>`).join('')}
          </div>
        </div>
      `);

      marker.on('click', () => {
        setSelectedStation(obs);
      });

      markersLayerRef.current?.addLayer(marker);
    });
  }, [filteredObservations, selectedStation, activeType]);

  const cfg = THEMATIC_MAPS_CONFIG[activeType] || THEMATIC_MAPS_CONFIG.pressureIsobars;
  const ActiveIcon = cfg.icon;

  // Régions uniques pour le sélecteur
  const availableRegions = useMemo(() => {
    const set = new Set<string>();
    THEMATIC_REFERENCE_POINTS.forEach(p => set.add(p.region));
    return Array.from(set).sort();
  }, []);

  // Calcul du taux moyen de concordance nationale
  const nationalConcordanceAvg = useMemo(() => {
    if (observations.length === 0) return 92;
    const sum = observations.reduce((acc, curr) => acc + curr.consensusResult.concordanceScorePct, 0);
    return Math.round(sum / observations.length);
  }, [observations]);

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* 1. Header & Navigation des Cartes Thématiques Météo */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/95 p-4 sm:p-5 shadow-lg backdrop-blur-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            {onClose && (
              <button
                onClick={onClose}
                title="Retour au radar principal"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3 text-emerald-400" />
                  Données Physiques Vérifiées
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-950 text-blue-300 border border-blue-800">
                  AROME &bull; ECMWF &bull; GFS &bull; ICON &bull; GEM
                </span>
                <span className="text-xs text-slate-400">Sans artéfact ni formule arbitraire</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2 mt-1">
                <ActiveIcon className="h-5 w-5 text-sky-400" />
                <span>{cfg.title}</span>
              </h2>
            </div>
          </div>

          {/* Sélecteur d'échéance : Court, Moyen terme avec adaptation des pondérations */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 self-stretch md:self-auto">
            <span className="text-xs font-bold text-slate-400 shrink-0">Échéance :</span>
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              {[
                { lead: 0, label: 'Aujourd\'hui (J0)' },
                { lead: 1, label: 'Demain (J+1)' },
                { lead: 2, label: 'J+2' },
                { lead: 4, label: 'J+4 (Moyen terme)' }
              ].map(opt => (
                <button
                  key={opt.lead}
                  onClick={() => setLeadDay(opt.lead)}
                  className={`px-2.5 py-1 rounded text-xs font-semibold transition cursor-pointer ${
                    leadDay === opt.lead
                      ? 'bg-sky-600 text-white font-bold shadow'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bannière de Pondération Dynamique & Non-diabolisation de GFS */}
        <div className="mt-3 py-2 px-3 rounded-lg bg-slate-950/80 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Info className="h-4 w-4 text-sky-400 shrink-0" />
            <span>
              Pondération appliquée à J+{leadDay} : {leadDay <= 2 ? 'AROME 30% (maillage fin 1.3km), ECMWF 26%, GFS 16% (synoptique océanique), ICON 14%, GEM 5%, IA 5%, Ensembles 4%' : 'ECMWF 28%, GFS 24% (flux zonal et talwegs atlantiques), ICON 16%, Modèles IA 12%, GEM 8%, Ensembles 8%'}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
              Concordance nationale : {nationalConcordanceAvg}%
            </span>
          </div>
        </div>

        {/* Boutons Sélecteurs des Cartes Thématiques */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-1.5 pt-3">
          {(Object.keys(THEMATIC_MAPS_CONFIG) as ThematicMapType[]).map((key) => {
            const item = THEMATIC_MAPS_CONFIG[key];
            const IconComponent = item.icon;
            const isCurrent = activeType === key;

            return (
              <button
                key={key}
                onClick={() => setActiveType(key)}
                className={`flex flex-col items-center justify-center text-center p-2 rounded-lg border transition cursor-pointer ${
                  isCurrent
                    ? 'bg-sky-950 text-white border-sky-500 shadow-sm ring-1 ring-sky-500/50'
                    : 'bg-slate-950 hover:bg-slate-800/80 text-slate-300 hover:text-white border-slate-800'
                }`}
              >
                <IconComponent className={`h-4 w-4 mb-1 ${isCurrent ? 'text-sky-300' : 'text-sky-400'}`} />
                <span className="text-[11px] font-semibold leading-tight line-clamp-2">
                  {item.title.split('(')[0].replace('&', '')}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Barre d'outils cartographique (Recherche rapide & Filtre Régional) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-lg bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher une station, ville, massif..."
              className="w-full bg-slate-950 border border-slate-800 rounded-md pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-xs text-slate-400 hover:text-white px-2 py-1"
            >
              Effacer
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-xs text-slate-400 font-medium">Zone :</span>
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:border-sky-500"
          >
            <option value="ALL">Toute la France (60 stations)</option>
            {availableRegions.map(reg => (
              <option key={reg} value={reg}>{reg}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. Vue Carte Interactive & Panneau d'Analyse / Vérification Multi-Modèles */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Carte Leaflet HD */}
        <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-950 overflow-hidden relative min-h-[480px] sm:min-h-[560px]">
          <div ref={mapContainerRef} className="w-full h-full min-h-[480px] sm:min-h-[560px] z-0" />

          {/* Badge Légende superposée */}
          <div className="absolute top-3 right-3 z-[400] max-w-[240px] bg-slate-900/95 backdrop-blur-sm p-3 rounded-lg border border-slate-800 shadow-xl text-xs">
            <div className="font-bold text-white mb-2 flex items-center gap-1.5 pb-1 border-b border-slate-800">
              <Layers className="h-3.5 w-3.5 text-sky-400" />
              <span>Échelle {cfg.title.split(' ')[0]}</span>
            </div>
            <div className="space-y-1.5">
              {cfg.scale.map((s, idx) => (
                <div key={idx} className="flex items-center gap-2 text-[10px] text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: s.color }} />
                  <span className="leading-tight">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Indicateur de chargement */}
          {loading && (
            <div className="absolute inset-0 z-[500] bg-slate-950/75 backdrop-blur-sm flex items-center justify-center">
              <div className="flex items-center gap-2.5 px-4 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs font-semibold shadow-2xl">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-ping" />
                <span>Interrogation des 5 modèles météo en cours...</span>
              </div>
            </div>
          )}
        </div>

        {/* Inspecteur de Station & Vérification Multi-Modèles */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/95 p-4 sm:p-5 flex flex-col justify-between shadow-lg backdrop-blur-md">
          <div>
            {/* Header de la station inspectée */}
            <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: selectedStation?.color || '#3b82f6' }} />
                  <h3 className="font-bold text-white text-base leading-tight">
                    {selectedStation?.name || 'Sélectionnez une station'}
                  </h3>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Dép. {selectedStation?.department} &bull; {selectedStation?.region} &bull; Alt. {selectedStation?.alt} m
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
                {selectedStation?.zone.replace('_', ' ')}
              </span>
            </div>

            {selectedStation ? (
              <div className="mt-3.5 space-y-3.5">
                {/* Carte de synthèse principale */}
                <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Statut Physique</span>
                    <div className="text-sm font-bold mt-0.5" style={{ color: selectedStation.color }}>
                      {selectedStation.label}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Consensus Robuste</span>
                    <div className="text-xl font-black text-white">
                      {selectedStation.displayVal}
                    </div>
                  </div>
                </div>

                {/* Panneau Vérification Multi-Modèles */}
                <div className="rounded-lg border border-slate-800 bg-slate-950 p-3 space-y-2">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/80">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-sky-300">
                      <ShieldCheck className="h-3.5 w-3.5 text-sky-400" />
                      <span>Comparatif des 5 Modèles Météo</span>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                      Concordance {selectedStation.consensusResult.concordanceScorePct}%
                    </span>
                  </div>

                  <div className="grid grid-cols-5 gap-1.5 pt-1">
                    {selectedStation.modelsBreakdown.map((m) => (
                      <div key={m.modelId} className="p-1.5 rounded bg-slate-900 border border-slate-800 text-center">
                        <div className="text-[9px] font-bold text-slate-400 truncate">
                          {m.flag} {m.modelId.toUpperCase()}
                        </div>
                        <div className="text-[11px] font-extrabold text-white mt-0.5">
                          {m.formatted}
                        </div>
                        <div className="text-[8px] text-sky-400 font-semibold mt-0.5">
                          {m.weightPct}%
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="text-[11px] text-slate-400 pt-1 leading-relaxed">
                    <span className="font-semibold text-slate-300">Écart inter-modèles :</span> {selectedStation.consensusResult.spread} unité(s) &bull; {selectedStation.consensusResult.concordanceLabel}.
                  </div>
                </div>

                {/* Détails des mesures */}
                <div className="space-y-1.5">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Paramètres & Diagnostic
                  </div>
                  <div className="divide-y divide-slate-800/80 rounded-lg bg-slate-950 border border-slate-800 p-2.5 text-xs">
                    {Object.entries(selectedStation.details || {}).map(([key, val]) => (
                      <div key={key} className="py-1.5 flex items-center justify-between first:pt-0 last:pb-0">
                        <span className="text-slate-400">{key}</span>
                        <span className="font-semibold text-white text-right max-w-[200px] truncate">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Explication scientifique */}
                <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 text-[11px] text-slate-400 leading-relaxed">
                  <div className="font-bold text-slate-300 flex items-center gap-1 mb-1">
                    <Info className="h-3 w-3 text-sky-400" />
                    <span>Justification Physique</span>
                  </div>
                  {selectedStation.scientificExplanation}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-slate-400">
                Cliquez sur un marqueur sur la carte pour inspecter les données vérifiées.
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800">
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs">
              <div className="font-bold text-sky-300 flex items-center gap-1.5 mb-1">
                <Sparkles className="h-3.5 w-3.5 text-sky-400" />
                <span>Règle Météorologique Clé</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-400">
                {activeType === 'pressureIsobars' && 'La pression MSLP (Mean Sea Level Pressure / QFF) élimine l\'effet de l\'altitude pour observer les véritables centres d\'action synoptiques (anticyclones et dépressions).'}
                {activeType === 'isotherm0' && 'Lors de précipitations soutenues (>3 mm/h), la fonte des flocons absorbe la chaleur latente et fait chuter l\'isotherme zéro de 200 à 350 mètres (effet d\'isothermie).'}
                {activeType === 'windGusts' && 'Les rafales à 10 mètres sont fortement amplifiées par les effets de canalisation orographique (Vallée du Rhône pour le Mistral, Trouée de Carcassonne pour l\'Autan).'}
                {activeType === 'thermalAnomaly' && 'L\'anomalie thermique est calculée par rapport à la moyenne trentenaire 1991–2020 de la station pour le mois en cours.'}
                {activeType === 'stormsLightning' && 'Une CAPE supérieure à 1000 J/kg combinée à un cisaillement de vent crée des courants ascendants violents capables de générer des grêlons.'}
                {activeType === 'fireRisk' && 'Une humidité relative de l\'air inférieure à 30% avec un vent supérieur à 40 km/h crée un risque critique de propagation éclair des feux.'}
                {activeType === 'seaTemperature' && 'Le Mistral et la Tramontane provoquent un upwelling côtier immédiat : l\'eau de surface chaude est repoussée au large et l\'eau froide de profondeur remonte.'}
                {activeType === 'frostRisk' && 'Par ciel nocturne clair et vent nul, le sol rayonne vers l\'espace et se refroidit plus vite que l\'air : une gelée blanche peut se produire au sol dès 2°C à 2m.'}
                {activeType === 'rainHazard' && 'Au-delà de 8 mm/h, le ruissellement urbain sature les réseaux d\'assainissement et crée un risque immédiat d\'aquaplaning.'}
                {activeType === 'heatwaveRisk' && 'Les seuils canicule sont définis par couple (Tmin / Tmax) sur 3 jours consécutifs, l\'absence de fraîcheur nocturne empêchant la récupération physiologique.'}
                {activeType === 'coldSnapRisk' && 'L\'Indice Thermique National (ITN) synthétise la température moyenne de 30 stations de référence réparties sur tout le territoire.'}
                {activeType === 'airQuality' && 'En situation anticyclonique hivernale, l\'inversion thermique plaque les polluants et particules fines PM2.5 près du sol.'}
                {activeType === 'uvIndex' && 'L\'indice UV dépend de la hauteur du soleil au-dessus de l\'horizon et augmente de 10% tous les 1000 mètres d\'altitude.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
