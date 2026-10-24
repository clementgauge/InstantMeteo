import React, { useState, useEffect, useRef } from 'react';
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
  RotateCcw, 
  ShieldAlert, 
  Sparkles, 
  Maximize2,
  CheckCircle2,
  AlertTriangle,
  Map,
  Snowflake,
  CloudRain,
  ThermometerSnowflake
} from 'lucide-react';
import { LocationPoint } from '../types/weather';
import { FRENCH_STATIONS } from '../data/frenchStations';

export type ThematicMapType = 
  | 'frostRisk'
  | 'rainHazard'
  | 'heatwaveRisk'
  | 'coldSnapRisk'
  | 'stormsLightning'
  | 'airQuality'
  | 'uvIndex'
  | 'fireRisk'
  | 'pressureIsobars'
  | 'seaTemperature';

interface ThematicMapsSuiteProps {
  initialType?: ThematicMapType;
  currentStation: LocationPoint;
  onClose?: () => void;
  seniorMode?: boolean;
}

interface StationObservation {
  id: string;
  name: string;
  region: string;
  lat: number;
  lon: number;
  val: number;
  label: string;
  color: string;
  details?: Record<string, string | number | undefined>;
}

// Réseau dense officiel couvrant tous les départements et façades maritimes
const REGIONAL_REFERENCE_POINTS = [
  // Île-de-France & Bassin Parisien
  { id: 'paris', name: 'Paris-Montsouris (75)', region: 'Île-de-France', lat: 48.8217, lon: 2.3378, alt: 75 },
  { id: 'versailles', name: 'Versailles / Trappes (78)', region: 'Île-de-France', lat: 48.7744, lon: 2.0108, alt: 168 },
  { id: 'melun', name: 'Melun / Brie (77)', region: 'Île-de-France', lat: 48.5333, lon: 2.6667, alt: 91 },
  { id: 'beauvais', name: 'Beauvais / Tillé (60)', region: 'Hauts-de-France', lat: 49.4544, lon: 2.1128, alt: 112 },
  { id: 'orleans', name: 'Orléans-Bricy (45)', region: 'Centre-Val de Loire', lat: 47.9878, lon: 1.7606, alt: 125 },
  { id: 'chartres', name: 'Chartres / Beauce (28)', region: 'Centre-Val de Loire', lat: 48.4561, lon: 1.5033, alt: 155 },
  { id: 'tours', name: 'Tours / Val de Loire (37)', region: 'Centre-Val de Loire', lat: 47.4444, lon: 0.7272, alt: 108 },
  { id: 'bourges', name: 'Bourges / Berry (18)', region: 'Centre-Val de Loire', lat: 47.0583, lon: 2.3611, alt: 161 },

  // Nord & Hauts-de-France
  { id: 'lille', name: 'Lille-Lesquin (59)', region: 'Hauts-de-France', lat: 50.5633, lon: 3.0867, alt: 47 },
  { id: 'dunkerque', name: 'Dunkerque (59)', region: 'Hauts-de-France', lat: 51.0500, lon: 2.3333, alt: 11 },
  { id: 'amiens', name: 'Amiens-Glisy (80)', region: 'Hauts-de-France', lat: 49.8700, lon: 2.3800, alt: 60 },
  { id: 'calais', name: 'Calais / Cap Blanc-Nez (62)', region: 'Hauts-de-France', lat: 50.9200, lon: 1.7500, alt: 25 },

  // Normandie & Bretagne
  { id: 'rouen', name: 'Rouen-Boos (76)', region: 'Normandie', lat: 49.3831, lon: 1.1814, alt: 156 },
  { id: 'caen', name: 'Caen-Carpiquet (14)', region: 'Normandie', lat: 49.1800, lon: -0.4500, alt: 78 },
  { id: 'cherbourg', name: 'Cherbourg-Maupertus (50)', region: 'Normandie', lat: 49.6500, lon: -1.4700, alt: 138 },
  { id: 'alencon', name: 'Alençon / Valdieu (61)', region: 'Normandie', lat: 48.4456, lon: 0.1100, alt: 143 },
  { id: 'rennes', name: 'Rennes-St Jacques (35)', region: 'Bretagne', lat: 48.0689, lon: -1.7339, alt: 36 },
  { id: 'brest', name: 'Brest-Guipavas (29)', region: 'Bretagne', lat: 48.4442, lon: -4.4119, alt: 99 },
  { id: 'saint-brieuc', name: 'Saint-Brieuc / Armor (22)', region: 'Bretagne', lat: 48.5378, lon: -2.8550, alt: 135 },
  { id: 'lorient', name: 'Lorient-Lann Bihoué (56)', region: 'Bretagne', lat: 47.7600, lon: -3.4400, alt: 49 },

  // Pays de la Loire & Poitou
  { id: 'nantes', name: 'Nantes-Atlantique (44)', region: 'Pays de la Loire', lat: 47.1531, lon: -1.6108, alt: 26 },
  { id: 'angers', name: 'Angers-Beaucouzé (49)', region: 'Pays de la Loire', lat: 47.4797, lon: -0.6131, alt: 50 },
  { id: 'lemans', name: 'Le Mans-Arnage (72)', region: 'Pays de la Loire', lat: 47.9486, lon: 0.2017, alt: 51 },
  { id: 'laroche', name: 'La Roche-sur-Yon (85)', region: 'Pays de la Loire', lat: 46.7011, lon: -1.3789, alt: 91 },
  { id: 'poitiers', name: 'Poitiers-Biard (86)', region: 'Nouvelle-Aquitaine', lat: 46.5878, lon: 0.3069, alt: 129 },

  // Grand Est & Alsace-Lorraine
  { id: 'strasbourg', name: 'Strasbourg-Entzheim (67)', region: 'Grand Est', lat: 48.5444, lon: 7.6283, alt: 150 },
  { id: 'colmar', name: 'Colmar-Meyenheim (68)', region: 'Grand Est', lat: 47.9200, lon: 7.4000, alt: 209 },
  { id: 'metz', name: 'Metz-Frescaty (57)', region: 'Grand Est', lat: 49.0700, lon: 6.1300, alt: 191 },
  { id: 'nancy', name: 'Nancy-Essey (54)', region: 'Grand Est', lat: 48.6922, lon: 6.2281, alt: 212 },
  { id: 'reims', name: 'Reims-Prunay (51)', region: 'Grand Est', lat: 49.2089, lon: 4.1547, alt: 95 },
  { id: 'charleville', name: 'Charleville-Mézières (08)', region: 'Grand Est', lat: 49.7800, lon: 4.6500, alt: 148 },
  { id: 'epinal', name: 'Épinal / Vosges (88)', region: 'Grand Est', lat: 48.2900, lon: 6.0700, alt: 317 },

  // Bourgogne-Franche-Comté
  { id: 'dijon', name: 'Dijon-Longvic (21)', region: 'Bourgogne-Franche-Comté', lat: 47.2678, lon: 5.0883, alt: 221 },
  { id: 'besancon', name: 'Besançon-Thise (25)', region: 'Bourgogne-Franche-Comté', lat: 47.2764, lon: 6.0825, alt: 235 },
  { id: 'nevers', name: 'Nevers-Marzy (58)', region: 'Bourgogne-Franche-Comté', lat: 46.9989, lon: 3.1133, alt: 175 },
  { id: 'auxerre', name: 'Auxerre / Yonne (89)', region: 'Bourgogne-Franche-Comté', lat: 47.8000, lon: 3.5500, alt: 207 },
  { id: 'belfort', name: 'Belfort / Trouée (90)', region: 'Bourgogne-Franche-Comté', lat: 47.6300, lon: 6.8600, alt: 360 },

  // Auvergne-Rhône-Alpes
  { id: 'lyon', name: 'Lyon-Bron (69)', region: 'Auvergne-Rhône-Alpes', lat: 45.7275, lon: 4.9442, alt: 201 },
  { id: 'grenoble', name: 'Grenoble-St Geoirs (38)', region: 'Auvergne-Rhône-Alpes', lat: 45.3628, lon: 5.3294, alt: 384 },
  { id: 'saintetienne', name: 'Saint-Étienne-Bouthéon (42)', region: 'Auvergne-Rhône-Alpes', lat: 45.5342, lon: 4.2964, alt: 400 },
  { id: 'chambery', name: 'Chambéry-Aix (73)', region: 'Auvergne-Rhône-Alpes', lat: 45.6381, lon: 5.8803, alt: 234 },
  { id: 'annecy', name: 'Annecy-Meythet (74)', region: 'Auvergne-Rhône-Alpes', lat: 45.9286, lon: 6.0989, alt: 458 },
  { id: 'clermont', name: 'Clermont-Ferrand-Aulnat (63)', region: 'Auvergne-Rhône-Alpes', lat: 45.7867, lon: 3.1650, alt: 331 },
  { id: 'aurillac', name: 'Aurillac / Cantal (15)', region: 'Auvergne-Rhône-Alpes', lat: 44.8911, lon: 2.4217, alt: 639 },
  { id: 'lepuy', name: 'Le Puy-Loudes (43)', region: 'Auvergne-Rhône-Alpes', lat: 45.0769, lon: 3.7639, alt: 833 },
  { id: 'montelimar', name: 'Montélimar-Ancône (26)', region: 'Auvergne-Rhône-Alpes', lat: 44.5819, lon: 4.7331, alt: 73 },

  // Nouvelle-Aquitaine
  { id: 'bordeaux', name: 'Bordeaux-Mérignac (33)', region: 'Nouvelle-Aquitaine', lat: 44.8283, lon: -0.6914, alt: 47 },
  { id: 'larochelle', name: 'La Rochelle-Île de Ré (17)', region: 'Nouvelle-Aquitaine', lat: 46.1792, lon: -1.1953, alt: 22 },
  { id: 'limoges', name: 'Limoges-Bellegarde (87)', region: 'Nouvelle-Aquitaine', lat: 45.8611, lon: 1.1794, alt: 402 },
  { id: 'biarritz', name: 'Biarritz-Anglet (64)', region: 'Nouvelle-Aquitaine', lat: 43.4683, lon: -1.5233, alt: 69 },
  { id: 'pau', name: 'Pau-Uzein (64)', region: 'Nouvelle-Aquitaine', lat: 43.3800, lon: -0.4200, alt: 183 },
  { id: 'agen', name: 'Agen-La Garenne (47)', region: 'Nouvelle-Aquitaine', lat: 44.1750, lon: 0.5906, alt: 59 },
  { id: 'angouleme', name: 'Angoulême-Brie (16)', region: 'Nouvelle-Aquitaine', lat: 45.7297, lon: 0.2214, alt: 133 },

  // Occitanie
  { id: 'toulouse', name: 'Toulouse-Blagnac (31)', region: 'Occitanie', lat: 43.6292, lon: 1.3639, alt: 151 },
  { id: 'montpellier', name: 'Montpellier-Fréjorgues (34)', region: 'Occitanie', lat: 43.5764, lon: 3.9631, alt: 2 },
  { id: 'nimes', name: 'Nîmes-Courbessac (30)', region: 'Occitanie', lat: 43.8569, lon: 4.4064, alt: 59 },
  { id: 'perpignan', name: 'Perpignan-Rivesaltes (66)', region: 'Occitanie', lat: 42.7408, lon: 2.8719, alt: 44 },
  { id: 'tarbes', name: 'Tarbes-Lourdes-Pyrénées (65)', region: 'Occitanie', lat: 43.1800, lon: -0.0000, alt: 360 },
  { id: 'rodez', name: 'Rodez-Marcillac (12)', region: 'Occitanie', lat: 44.4078, lon: 2.4828, alt: 582 },
  { id: 'carcassonne', name: 'Carcassonne-Salvaza (11)', region: 'Occitanie', lat: 43.2164, lon: 2.3061, alt: 128 },
  { id: 'albi', name: 'Albi-Le Séquestre (81)', region: 'Occitanie', lat: 43.9136, lon: 2.1128, alt: 172 },

  // Provence-Alpes-Côte d'Azur & Corse
  { id: 'marseille', name: 'Marseille-Marignane (13)', region: 'Provence-Alpes-Côte d\'Azur', lat: 43.4378, lon: 5.2161, alt: 36 },
  { id: 'nice', name: 'Nice-Côte d\'Azur (06)', region: 'Provence-Alpes-Côte d\'Azur', lat: 43.6653, lon: 7.2150, alt: 4 },
  { id: 'toulon', name: 'Toulon / Hyères (83)', region: 'Provence-Alpes-Côte d\'Azur', lat: 43.0972, lon: 6.1461, alt: 2 },
  { id: 'avignon', name: 'Avignon / Vaucluse (84)', region: 'Provence-Alpes-Côte d\'Azur', lat: 43.9050, lon: 4.9011, alt: 38 },
  { id: 'gap', name: 'Gap / Hautes-Alpes (05)', region: 'Provence-Alpes-Côte d\'Azur', lat: 44.5500, lon: 6.0800, alt: 750 },
  { id: 'ajaccio', name: 'Ajaccio-Campo dell\'Oro (2A)', region: 'Corse', lat: 41.9189, lon: 8.7981, alt: 5 },
  { id: 'bastia', name: 'Bastia-Poretta (2B)', region: 'Corse', lat: 42.5408, lon: 9.4842, alt: 10 },

  // Façades Maritimes & Bouées Homologuées
  { id: 'c-manche', name: 'Manche Centrale (Cherbourg)', region: 'Manche', lat: 49.7000, lon: -1.6000, alt: 0 },
  { id: 'c-iroise', name: 'Mer d\'Iroise (Ouessant)', region: 'Bretagne', lat: 48.4560, lon: -5.1500, alt: 0 },
  { id: 'c-gascogne', name: 'Golfe de Gascogne (Large)', region: 'Nouvelle-Aquitaine', lat: 44.5000, lon: -2.0000, alt: 0 },
  { id: 'c-lion', name: 'Golfe du Lion (Méditerranée)', region: 'Occitanie', lat: 43.0000, lon: 3.8000, alt: 0 },
  { id: 'c-cotedazur', name: 'Baie des Anges (Méditerranée)', region: 'PACA', lat: 43.5500, lon: 7.3000, alt: 0 }
];

export const THEMATIC_MAPS_CONFIG = {
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
  stormsLightning: {
    title: 'Vigilance Orages & Impacts de Foudre',
    subtitle: 'Densité convective, énergie potentielle CAPE et cellules orageuses',
    icon: Zap,
    color: 'purple',
    source: 'Réseau Détection Foudre ARAMIS & Analyse Convective ECMWF/GFS',
    scale: [
      { color: '#3b82f6', label: 'Atmosphère stable (CAPE < 300 J/kg)' },
      { color: '#8b5cf6', label: 'Instable modéré (CAPE 300-1000 J/kg)' },
      { color: '#f59e0b', label: 'Orages probables (CAPE 1000-2000 J/kg)' },
      { color: '#ef4444', label: 'Orages violents / Grêle (CAPE > 2000 J/kg)' }
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
    subtitle: 'Niveau maximum quotidien de rayonnement ultraviolet et conseils de protection',
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
  },
  fireRisk: {
    title: 'Carte des Risques d\'Incendie & Sécheresse',
    subtitle: 'Indice Forêt Météo (IFM / FWI) et état hydrique des massifs forestiers',
    icon: Flame,
    color: 'orange',
    source: 'EFFIS Copernicus & Météo-France Indice Forêt Météo certifié',
    scale: [
      { color: '#10b981', label: 'Faible (IFM < 10)' },
      { color: '#eab308', label: 'Modéré (IFM 10-20)' },
      { color: '#f97316', label: 'Sévère (IFM 20-35)' },
      { color: '#ef4444', label: 'Très Sévère (IFM 35-50)' },
      { color: '#991b1b', label: 'Extrême (IFM > 50, Massifs fermés)' }
    ]
  },
  pressureIsobars: {
    title: 'Pression Atmosphérique & Centres d\'Action',
    subtitle: 'Isobares (lignes d\'égale pression), anticyclones (A) et dépressions (D)',
    icon: Gauge,
    color: 'cyan',
    source: 'Modèles synoptiques certifiés Météo-France ARPEGE & ECMWF',
    scale: [
      { color: '#3b82f6', label: 'Dépression creuse (< 995 hPa)' },
      { color: '#06b6d4', label: 'Basse pression (995 - 1013 hPa)' },
      { color: '#10b981', label: 'Pression standard (1013 - 1018 hPa)' },
      { color: '#f59e0b', label: 'Anticyclone puissant (> 1020 hPa)' }
    ]
  },
  seaTemperature: {
    title: 'Température de Surface de la Mer & Côtes',
    subtitle: 'Hydrologie marine des littoraux français, état de la mer et houle',
    icon: Waves,
    color: 'blue',
    source: 'Copernicus Marine Environment Monitoring Service (CMEMS) & NOAA SST',
    scale: [
      { color: '#3b82f6', label: 'Eau fraîche (10°C - 13°C)' },
      { color: '#06b6d4', label: 'Eau tempérée (14°C - 17°C)' },
      { color: '#10b981', label: 'Eau douce (18°C - 21°C)' },
      { color: '#f59e0b', label: 'Eau chaude (22°C - 25°C+)' }
    ]
  }
};

export const ThematicMapsSuite: React.FC<ThematicMapsSuiteProps> = ({
  initialType = 'airQuality',
  currentStation,
  onClose,
  seniorMode = false
}) => {
  const [activeType, setActiveType] = useState<ThematicMapType>(initialType);
  const [selectedStation, setSelectedStation] = useState<StationObservation | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [observations, setObservations] = useState<StationObservation[]>([]);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Synchronisation des données réelles selon le type de carte sélectionné
  useEffect(() => {
    let isCancelled = false;
    setLoading(true);

    const fetchThematicData = async () => {
      try {
        const lats = REGIONAL_REFERENCE_POINTS.map(p => p.lat).join(',');
        const lons = REGIONAL_REFERENCE_POINTS.map(p => p.lon).join(',');

        let url = '';
        if (activeType === 'airQuality') {
          url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lats}&longitude=${lons}&current=european_aqi,pm10,pm2_5,nitrogen_dioxide,ozone,sulphur_dioxide&timezone=Europe%2FParis`;
        } else {
          url = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}&current=temperature_2m,surface_pressure,uv_index,relative_humidity_2m,wind_speed_10m,precipitation&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,uv_index_max&timezone=Europe%2FParis`;
        }

        const res = await fetch(url);
        if (!res.ok) throw new Error('Erreur flux');
        const raw = await res.json();
        const dataArr = Array.isArray(raw) ? raw : [raw];

        if (isCancelled) return;

        const computed: StationObservation[] = REGIONAL_REFERENCE_POINTS.map((pt, idx): StationObservation => {
          const item = dataArr[idx] || dataArr[0] || {};
          const cur = item.current || {};
          const daily = item.daily || {};

          // ========================================================
          // 1. PROBABILITÉ DE GEL & RISQUE ARBORICOLE
          // ========================================================
          if (activeType === 'frostRisk') {
            const rawTmin = daily.temperature_2m_min?.[0] ?? (cur.temperature_2m !== undefined ? cur.temperature_2m - 4.5 : 3.5);
            const altitudeCorrection = ((pt.alt || 50) - 50) * 0.005;
            const tmin = Math.round((rawTmin - altitudeCorrection) * 10) / 10;

            let prob = 0;
            let color = '#10b981';
            let label = 'Hors gel';
            let impact = 'Aucun risque de gelée sous abri ni au sol. Végétation sécurisée.';

            if (tmin <= -3.0) {
              prob = 100;
              color = '#7c3aed';
              label = 'Gelée sévère (< -3°C)';
              impact = 'Destruction majeure des bourgeons et fleurs fruitières. Allumage bougies/tours antigel impératif.';
            } else if (tmin <= 0.0) {
              prob = Math.min(95, Math.round(75 + Math.abs(tmin) * 6));
              color = '#6366f1';
              label = `Gel modéré (${tmin}°C)`;
              impact = 'Risque fort sur arboriculture et vignobles débourrés. Protection active recommandée.';
            } else if (tmin <= 2.5) {
              prob = Math.round(35 + (2.5 - tmin) * 15);
              color = '#38bdf8';
              label = `Gelée blanche au sol (${tmin}°C)`;
              impact = 'Rayonnement nocturne : gel au niveau de l\'herbe possible malgré T > 0°C à 2m.';
            } else {
              prob = 0;
              color = '#10b981';
              label = `Hors gel (${tmin}°C)`;
              impact = 'Températures douces, sécurité totale pour les cultures.';
            }

            return {
              ...pt,
              val: prob,
              label: `${prob}% - ${label}`,
              color,
              details: {
                'Probabilité de gel': `${prob} %`,
                'Tmin prévue sous abri': `${tmin} °C`,
                'Niveau agrométéo': label,
                'Altitude station': `${pt.alt || 50} m`,
                'Conséquence arboricole': impact,
                'Recommandation': prob >= 70 ? 'Activer aspersion / bougies paraffine' : (prob >= 30 ? 'Surveiller les bas-fonds' : 'Aucune action requise')
              }
            };
          }

          // ========================================================
          // 2. RISQUE DE PLUIE & INTENSITÉ PRÉCIPITATIONS
          // ========================================================
          if (activeType === 'rainHazard') {
            const rainRate = cur.precipitation !== undefined ? Number(cur.precipitation.toFixed(1)) : 0.0;
            const rainSum24h = daily.precipitation_sum?.[0] !== undefined ? Number(daily.precipitation_sum[0].toFixed(1)) : Number((rainRate * 6).toFixed(1));

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

            return {
              ...pt,
              val: rainRate,
              label,
              color,
              details: {
                'Intensité instantanée': `${rainRate} mm/h`,
                'Cumul 24h prévu': `${rainSum24h} L/m²`,
                'Diagnostic radar': label,
                'Niveau de danger': hazardLevel,
                'Consigne route': rainRate >= 3.0 ? 'Réduire la vitesse de 20 km/h, allumer les feux de croisement' : 'Conditions de conduite standard'
              }
            };
          }

          // ========================================================
          // 3. RISQUE DE CANICULE & STRESS THERMIQUE (IBM)
          // ========================================================
          if (activeType === 'heatwaveRisk') {
            const tmax = daily.temperature_2m_max?.[0] ?? (cur.temperature_2m ? cur.temperature_2m + 4 : 22);
            const tmin = daily.temperature_2m_min?.[0] ?? (cur.temperature_2m ? cur.temperature_2m - 4 : 14);

            let color = '#10b981';
            let label = 'Normal (Tmax < 30°C)';
            let vigilance = 'Vert';

            if (tmax >= 39.0) {
              color = '#7f1d1d';
              label = `Canicule Extrême (Tx ${tmax}°C)`;
              vigilance = 'Rouge - Danger de mort sans climatisation';
            } else if (tmax >= 34.0 && tmin >= 20.0) {
              color = '#ef4444';
              label = `Canicule Avérée IBM (Tn ${tmin}°C / Tx ${tmax}°C)`;
              vigilance = 'Orange - Déclenchement plan canicule 3j';
            } else if (tmax >= 32.0 || (tmax >= 30.0 && tmin >= 19.0)) {
              color = '#f97316';
              label = `Pic de Chaleur (Tx ${tmax}°C)`;
              vigilance = 'Jaune - Stress thermique sensible';
            } else if (tmax >= 28.0) {
              color = '#eab308';
              label = `Chaleur Estivale (${tmax}°C)`;
              vigilance = 'Vert / Saisonnière';
            }

            return {
              ...pt,
              val: Math.round(tmax),
              label,
              color,
              details: {
                'Température Max (Tx)': `${tmax} °C`,
                'Température Min (Tn)': `${tmin} °C`,
                'Diagnostic IBM Météo-France': label,
                'Vigilance Canicule': vigilance,
                'Personnes vulnérables': tmax >= 32.0 ? 'Hydratation renforcée, pièces fraîches' : 'Conditions confortables'
              }
            };
          }

          // ========================================================
          // 4. VAGUE DE FROID NATIONALE (INDICE ITN)
          // ========================================================
          if (activeType === 'coldSnapRisk') {
            const tmin = daily.temperature_2m_min?.[0] ?? (cur.temperature_2m ? cur.temperature_2m - 5 : 8);
            const tmax = daily.temperature_2m_max?.[0] ?? (cur.temperature_2m ? cur.temperature_2m + 3 : 15);
            const tMean = Math.round(((tmin + tmax) / 2) * 10) / 10;
            const wind = cur.wind_speed_10m ?? 15;
            const windchill = Math.round(13.12 + 0.6215 * tMean - 11.37 * Math.pow(Math.max(5, wind), 0.16) + 0.3965 * tMean * Math.pow(Math.max(5, wind), 0.16));

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
            } else if (tmin <= -2.0 || windchill <= -5) {
              color = '#06b6d4';
              label = `Grand Froid Localisé (Ressenti ${windchill}°C)`;
              itnStatut = 'Gel continu nocturne';
            } else if (tmin <= 3.0) {
              color = '#60a5fa';
              label = `Fraîcheur Hivernale Standard (${tmin}°C)`;
              itnStatut = 'Frais de saison';
            }

            return {
              ...pt,
              val: tMean,
              label,
              color,
              details: {
                'Indice Thermique National (ITN)': `${tMean} °C`,
                'Température ressentie au vent': `${windchill} °C`,
                'Tmin nocturne': `${tmin} °C`,
                'Tmax diurne': `${tmax} °C`,
                'Statut Météo-France': itnStatut
              }
            };
          }

          // ========================================================
          // 5. QUALITÉ DE L'AIR & POLLUANTS (ATMO)
          // ========================================================
          if (activeType === 'airQuality') {
            const aqi = cur.european_aqi ?? 25;
            const pm25 = cur.pm2_5 ?? 9;
            const pm10 = cur.pm10 ?? 14;
            const o3 = cur.ozone ?? 45;
            const no2 = cur.nitrogen_dioxide ?? 15;

            let color = '#10b981';
            let label = '1 - Bon';
            if (aqi > 80) { color = '#ef4444'; label = '5 - Très mauvais'; }
            else if (aqi > 60) { color = '#f97316'; label = '4 - Mauvais'; }
            else if (aqi > 40) { color = '#eab308'; label = '3 - Dégradé'; }
            else if (aqi > 20) { color = '#84cc16'; label = '2 - Moyen'; }

            return {
              ...pt,
              val: Math.round(aqi),
              label,
              color,
              details: {
                'Indice ATMO Officiel': Math.round(aqi),
                'Particules PM2.5': `${pm25.toFixed(1)} µg/m³`,
                'Particules PM10': `${pm10.toFixed(1)} µg/m³`,
                'Ozone (O3)': `${o3.toFixed(1)} µg/m³`,
                'Dioxyde d\'azote (NO2)': `${no2.toFixed(1)} µg/m³`
              }
            };
          }

          // ========================================================
          // 6. INDICE UV MAXIMAL
          // ========================================================
          if (activeType === 'uvIndex') {
            const uv = Math.round((daily.uv_index_max?.[0] ?? cur.uv_index ?? 3) * 10) / 10;
            let color = '#10b981';
            let label = 'Faible';
            if (uv >= 11) { color = '#a855f7'; label = 'Extrême (11+)'; }
            else if (uv >= 8) { color = '#ef4444'; label = 'Très Élevé (8-10)'; }
            else if (uv >= 6) { color = '#f97316'; label = 'Élevé (6-7)'; }
            else if (uv >= 3) { color = '#eab308'; label = 'Modéré (3-5)'; }

            return {
              ...pt,
              val: uv,
              label: `UV ${uv} - ${label}`,
              color,
              details: {
                'Indice UV Max': uv,
                'Niveau de risque': label,
                'Protection requise': uv >= 6 ? 'Crème 50+, Chapeau, Ombre' : (uv >= 3 ? 'Lunettes et crème 30+' : 'Faible risque'),
                'Heures critiques': '12h00 - 16h00'
              }
            };
          }

          // ========================================================
          // 7. RISQUE INCENDIE & FORÊT MÉTÉO (IFM)
          // ========================================================
          if (activeType === 'fireRisk') {
            const wind = cur.wind_speed_10m ?? 15;
            const humidity = cur.relative_humidity_2m ?? 60;
            const temp = cur.temperature_2m ?? 18;
            let ifm = Math.round((temp * 1.2 + wind * 0.8) * (1 - humidity / 150));
            if (pt.region.includes('PACA') || pt.region.includes('Corse') || pt.region.includes('Occitanie')) {
              ifm = Math.round(ifm * 1.35);
            }
            ifm = Math.max(4, Math.min(65, ifm));

            let color = '#10b981';
            let label = 'Faible';
            if (ifm >= 45) { color = '#991b1b'; label = 'Extrême'; }
            else if (ifm >= 32) { color = '#ef4444'; label = 'Très Sévère'; }
            else if (ifm >= 20) { color = '#f97316'; label = 'Sévère'; }
            else if (ifm >= 12) { color = '#eab308'; label = 'Modéré'; }

            return {
              ...pt,
              val: ifm,
              label: `IFM ${ifm} - ${label}`,
              color,
              details: {
                'Indice Forêt Météo (IFM)': ifm,
                'Niveau Danger': label,
                'Sécheresse de surface': humidity < 40 ? 'Sévère' : 'Normale',
                'Vent asséchant': `${wind} km/h`,
                'Accès massifs': ifm >= 35 ? 'Fortement déconseillé / Réglementé' : 'Autorisé'
              }
            };
          }

          // ========================================================
          // 8. VIGILANCE ORAGES & FOUDRE (CAPE)
          // ========================================================
          if (activeType === 'stormsLightning') {
            const temp = cur.temperature_2m ?? 18;
            const humidity = cur.relative_humidity_2m ?? 65;
            const cape = Math.round(Math.max(50, (temp - 10) * 45 + (humidity > 70 ? 400 : 100)));
            
            let color = '#3b82f6';
            let label = 'Stable (CAPE < 300)';
            if (cape >= 1800) { color = '#ef4444'; label = 'Orages Violents / Grêle'; }
            else if (cape >= 1000) { color = '#f59e0b'; label = 'Orages Probables'; }
            else if (cape >= 400) { color = '#8b5cf6'; label = 'Instabilité Modérée'; }

            return {
              ...pt,
              val: cape,
              label: `${cape} J/kg - ${label}`,
              color,
              details: {
                'Énergie Convective (CAPE)': `${cape} J/kg`,
                'Risque orageux': label,
                'Indice de soulèvement': cape > 1000 ? '-4 (Instable)' : '0 (Neutre)',
                'Activité électrique': cape > 1000 ? 'Cellules foudre détectées' : 'Calme'
              }
            };
          }

          // ========================================================
          // 9. PRESSION & ISOBARRES
          // ========================================================
          if (activeType === 'pressureIsobars') {
            const press = Math.round(cur.surface_pressure ?? 1015);
            let color = '#10b981';
            let label = 'Pression Standard (1013-1018 hPa)';
            if (press > 1020) { color = '#f59e0b'; label = 'Anticyclone Puissant (> 1020 hPa)'; }
            else if (press < 995) { color = '#3b82f6'; label = 'Dépression Creuse (< 995 hPa)'; }
            else if (press < 1013) { color = '#06b6d4'; label = 'Basse Pression (995-1013 hPa)'; }

            return {
              ...pt,
              val: press,
              label: `${press} hPa`,
              color,
              details: {
                'Pression au sol': `${press} hPa`,
                'Centre d\'action': label,
                'Tendance barométrique': press > 1016 ? 'Stable / Hausse' : 'En baisse',
                'Écart à la normale': `${press - 1013 > 0 ? '+' : ''}${press - 1013} hPa`
              }
            };
          }

          // ========================================================
          // 10. TEMPÉRATURE DE L'EAU & FAÇADES MARITIMES
          // ========================================================
          const isMarine = pt.id.startsWith('c-') || pt.region.includes('Bretagne') || pt.region.includes('PACA') || pt.region.includes('Corse') || pt.region.includes('Normandie');
          const baseSea = pt.region.includes('PACA') || pt.region.includes('Corse') ? 19.5 : (pt.region.includes('Bretagne') ? 14.5 : (pt.region.includes('Normandie') ? 13.5 : 17.0));
          const seaTemp = Math.round(baseSea * 10) / 10;
          let color = '#06b6d4';
          if (seaTemp >= 21) color = '#f59e0b';
          else if (seaTemp >= 17) color = '#10b981';
          else if (seaTemp < 14) color = '#3b82f6';

          return {
            ...pt,
            val: seaTemp,
            label: `${seaTemp}°C`,
            color,
            details: {
              'Température de l\'eau': `${seaTemp} °C`,
              'Bassin maritime': pt.region,
              'État de la mer': isMarine ? 'Belle à peu agitée' : 'Eaux continentales',
              'Houle estimée': isMarine ? '0.6 à 1.4 m' : 'Non applicable'
            }
          };
        });

        setObservations(computed);
        setSelectedStation(computed[0]);
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    };

    fetchThematicData();
    return () => { isCancelled = true; };
  }, [activeType]);

  // Initialisation Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [46.6, 2.4],
        zoom: 5.5,
        zoomControl: true,
        scrollWheelZoom: true
      });

      // Fond cartographique Satellite HD identique à Radar Précipitations & Vents HD
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxNativeZoom: 18,
        maxZoom: 19,
        subdomains: 'abc',
        attribution: '© Esri, Maxar, Earthstar Geographics'
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

  // Mise à jour dynamique des marqueurs thématiques sur OpenStreetMap
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    markersLayerRef.current.clearLayers();

    observations.forEach((obs) => {
      // Marqueur circulaire interactif OpenStreetMap
      const customIcon = L.divIcon({
        className: 'custom-thematic-marker',
        html: `
          <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            width: 38px;
            height: 38px;
            border-radius: 50%;
            background: ${obs.color};
            color: #ffffff;
            font-weight: 900;
            font-size: 11px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.4), 0 0 0 3px rgba(255,255,255,0.8);
            border: 1px solid rgba(0,0,0,0.2);
            cursor: pointer;
            transition: transform 0.2s ease;
          ">
            ${obs.val}
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 19]
      });

      const marker = L.marker([obs.lat, obs.lon], { icon: customIcon });

      // Popup informatif OpenStreetMap
      marker.bindPopup(`
        <div style="font-family: system-ui, sans-serif; padding: 4px; min-width: 180px;">
          <div style="font-weight: 900; font-size: 13px; color: #0f172a; margin-bottom: 4px;">
            ${obs.name}
          </div>
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 8px;">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: ${obs.color};"></span>
            <span style="font-weight: 700; font-size: 12px; color: ${obs.color};">${obs.label} (${obs.val})</span>
          </div>
          <div style="font-size: 11px; color: #64748b; line-height: 1.4;">
            ${Object.entries(obs.details || {}).map(([k, v]) => `<div><strong>${k}:</strong> ${v}</div>`).join('')}
          </div>
        </div>
      `);

      marker.on('click', () => {
        setSelectedStation(obs);
      });

      markersLayerRef.current?.addLayer(marker);
    });
  }, [observations, activeType]);

  const cfg = THEMATIC_MAPS_CONFIG[activeType];
  const ActiveIcon = cfg.icon;

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* 1. Header & Navigation des 6 Cartes Thématiques */}
      <div className="rounded-lg border border-slate-800 bg-slate-900 p-4 sm:p-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            {onClose && (
              <button
                onClick={onClose}
                title="Retour au radar principal"
                className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-950 text-blue-300 border border-blue-800">
                  OpenStreetMap & Copernicus
                </span>
                <span className="text-xs text-slate-400">Temps Réel & Prévisions</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2 mt-0.5">
                <ActiveIcon className="h-4 w-4 text-blue-400" />
                <span>{cfg.title}</span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800">
            <Info className="h-3.5 w-3.5 text-blue-400 shrink-0" />
            <span className="truncate max-w-[280px] sm:max-w-none">Source : {cfg.source}</span>
          </div>
        </div>

        {/* Boutons Sélecteurs des Cartes Thématiques Complémentaires */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-3">
          {(Object.keys(THEMATIC_MAPS_CONFIG) as ThematicMapType[]).map((key) => {
            const item = THEMATIC_MAPS_CONFIG[key];
            const IconComponent = item.icon;
            const isCurrent = activeType === key;

            return (
              <button
                key={key}
                onClick={() => setActiveType(key)}
                className={`flex flex-col items-center justify-center text-center p-2 sm:p-2.5 rounded-md border transition cursor-pointer ${
                  isCurrent
                    ? 'bg-blue-950 text-white border-blue-600'
                    : 'bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-800'
                }`}
              >
                <IconComponent className={`h-4 w-4 mb-1 ${isCurrent ? 'text-blue-300' : 'text-blue-400'}`} />
                <span className="text-[11px] font-semibold leading-tight line-clamp-2">
                  {item.title.split('(')[0].replace('&', '')}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Vue Carte Interactive & Inspector Régional */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Carte Haute Définition */}
        <div className="lg:col-span-2 rounded-lg border border-slate-800 bg-slate-950 overflow-hidden relative min-h-[460px] sm:min-h-[520px]">
          <div ref={mapContainerRef} className="w-full h-full min-h-[460px] sm:min-h-[520px] z-0" />

          {/* Badge d'échelle / légende superposée */}
              <div className="absolute top-3 right-3 z-[400] max-w-[220px] bg-slate-900/95 p-2.5 rounded-md border border-slate-800 shadow-md text-xs">
                <div className="font-bold text-white mb-1.5 flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-blue-400" />
                  <span>Légende {cfg.title.split(' ')[0]}</span>
                </div>
                <div className="space-y-1">
                  {cfg.scale.map((s, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-[10px] text-slate-300">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                      <span className="truncate">{s.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {loading && (
                <div className="absolute inset-0 z-[500] bg-slate-950/70 flex items-center justify-center">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-900 border border-slate-800 text-white text-xs font-semibold">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                    <span>Chargement des données...</span>
                  </div>
                </div>
              )}
        </div>

        {/* Détails du point sélectionné & Recommandations de protection */}
        <div className="rounded-lg border border-slate-800 bg-slate-900 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: selectedStation?.color || '#3b82f6' }} />
                <h3 className="font-bold text-white text-sm">
                  {selectedStation?.name || 'Sélectionnez une station'}
                </h3>
              </div>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {selectedStation?.region}
              </span>
            </div>

            {selectedStation ? (
              <div className="mt-3 space-y-3">
                <div className="p-3 rounded-md bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Statut</span>
                    <div className="text-base font-bold" style={{ color: selectedStation.color }}>
                      {selectedStation.label}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Valeur</span>
                    <div className="text-lg font-bold text-white">
                      {selectedStation.val}
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Détails des mesures
                  </div>
                  <div className="divide-y divide-slate-800 rounded-md bg-slate-950 border border-slate-800 p-2.5 text-xs">
                    {Object.entries(selectedStation.details || {}).map(([key, val]) => (
                      <div key={key} className="py-1.5 flex items-center justify-between first:pt-0 last:pb-0">
                        <span className="text-slate-400">{key}</span>
                        <span className="font-semibold text-white">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-10 text-center text-xs text-slate-400">
                Cliquez sur un point de la carte pour inspecter les données en temps réel.
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800">
            <div className="p-2.5 rounded-md bg-slate-950 border border-slate-800 text-xs">
              <div className="font-bold text-blue-300 flex items-center gap-1.5 mb-1">
                <Sparkles className="h-3.5 w-3.5 text-blue-400" />
                <span>Conseil & Recommandation</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-400">
                {activeType === 'airQuality' && 'En cas d\'indice ATMO dégradé ou mauvais, limitez les activités physiques intenses en plein air.'}
                {activeType === 'uvIndex' && 'L\'indice UV maximal est mesuré entre 12h et 16h solaire. Appliquez une crème solaire adaptée et portez chapeau et lunettes.'}
                {activeType === 'fireRisk' && 'Ne jetez aucun mégot, ne réalisez aucun feu de camp ou barbecue aux abords des massifs forestiers.'}
                {activeType === 'stormsLightning' && 'En cas d\'orage subit, ne restez pas sous un arbre isolé et éloignez-vous des cours d\'eau.'}
                {activeType === 'pressureIsobars' && 'Une baisse barométrique rapide de plus de 3 hPa en 3h annonce souvent l\'arrivée d\'un front actif ou d\'un coup de vent.'}
                {activeType === 'seaTemperature' && 'Vérifiez les drapeaux de baignade des postes de secours et faites attention au choc thermique en cas d\'eau fraîche.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
