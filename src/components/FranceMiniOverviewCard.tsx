import React, { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import { 
  Compass, 
  RotateCcw,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Layers,
  Flame,
  Snowflake
} from 'lucide-react';
import { LocationPoint } from '../types/weather';
import { FRENCH_STATIONS } from '../data/frenchStations';

interface FranceMiniOverviewCardProps {
  currentStation: LocationPoint;
  onSelectStation?: (station: LocationPoint) => void;
  tempUnit?: 'C' | 'F';
  onNavigateTab?: (tab: string) => void;
  onOpenSearchModal?: () => void;
}

interface RegionWeather {
  id: string;
  name: string;
  shortLabel?: string;
  capitalName?: string;
  capitalStationId: string;
  lat: number;
  lon: number;
  altitude?: number;
  currentCode: number;
  afternoonCode: number;
  tomorrowCode: number;
  currentTemp: number;
  afternoonTemp: number;
  tomorrowTemp: number;
}

// Configuration des icônes Leaflet pour éviter toute tentative de résolution d'URL relative
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Coordonnées géographiques harmonisées des 13 grandes régions de France métropolitaine
// Placées au cœur visuel de chaque région pour une répartition équilibrée type carte TV Météo-France sans chevauchement
const FRANCE_REGIONS: RegionWeather[] = [
  { id: 'hdf', name: 'Hauts-de-France', shortLabel: 'Lille', capitalName: 'Lille', capitalStationId: 'lille-lesquin', lat: 50.32, lon: 2.85, currentCode: 1, afternoonCode: 2, tomorrowCode: 1, currentTemp: 17, afternoonTemp: 19, tomorrowTemp: 18 },
  { id: 'nor', name: 'Normandie', shortLabel: 'Caen', capitalName: 'Caen', capitalStationId: 'caen-carpiquet', lat: 49.15, lon: -0.45, currentCode: 2, afternoonCode: 2, tomorrowCode: 1, currentTemp: 18, afternoonTemp: 20, tomorrowTemp: 19 },
  { id: 'idf', name: 'Île-de-France', shortLabel: 'Paris', capitalName: 'Paris', capitalStationId: 'paris-montsouris', lat: 48.86, lon: 2.35, currentCode: 0, afternoonCode: 1, tomorrowCode: 0, currentTemp: 21, afternoonTemp: 23, tomorrowTemp: 22 },
  { id: 'ges', name: 'Grand Est', shortLabel: 'Strasbourg', capitalName: 'Strasbourg', capitalStationId: 'strasbourg-entzheim', lat: 48.62, lon: 6.45, currentCode: 1, afternoonCode: 1, tomorrowCode: 2, currentTemp: 20, afternoonTemp: 22, tomorrowTemp: 21 },
  { id: 'bre', name: 'Bretagne', shortLabel: 'Rennes', capitalName: 'Rennes', capitalStationId: 'rennes-saint-jacques', lat: 48.18, lon: -3.15, currentCode: 2, afternoonCode: 3, tomorrowCode: 2, currentTemp: 17, afternoonTemp: 19, tomorrowTemp: 18 },
  { id: 'pdl', name: 'Pays de la Loire', shortLabel: 'Nantes', capitalName: 'Nantes', capitalStationId: 'nantes-atlantique', lat: 47.22, lon: -1.45, currentCode: 0, afternoonCode: 1, tomorrowCode: 0, currentTemp: 20, afternoonTemp: 22, tomorrowTemp: 21 },
  { id: 'cvl', name: 'Centre-Val de Loire', shortLabel: 'Orléans', capitalName: 'Bourges', capitalStationId: 'bourges', lat: 47.35, lon: 1.75, currentCode: 0, afternoonCode: 1, tomorrowCode: 0, currentTemp: 21, afternoonTemp: 23, tomorrowTemp: 22 },
  { id: 'bfc', name: 'Bourgogne-Franche-Comté', shortLabel: 'Dijon', capitalName: 'Dijon', capitalStationId: 'dijon-longvic', lat: 47.15, lon: 5.15, currentCode: 0, afternoonCode: 1, tomorrowCode: 1, currentTemp: 20, afternoonTemp: 22, tomorrowTemp: 21 },
  { id: 'naq', name: 'Nouvelle-Aquitaine', shortLabel: 'Bordeaux', capitalName: 'Bordeaux', capitalStationId: 'bordeaux-merignac', lat: 45.05, lon: -0.45, currentCode: 0, afternoonCode: 0, tomorrowCode: 0, currentTemp: 23, afternoonTemp: 25, tomorrowTemp: 24 },
  { id: 'ara', name: 'Auvergne-Rhône-Alpes', shortLabel: 'Lyon', capitalName: 'Lyon', capitalStationId: 'lyon-bron', lat: 45.55, lon: 4.65, currentCode: 0, afternoonCode: 0, tomorrowCode: 1, currentTemp: 23, afternoonTemp: 25, tomorrowTemp: 24 },
  { id: 'occ', name: 'Occitanie', shortLabel: 'Toulouse', capitalName: 'Toulouse', capitalStationId: 'toulouse-blagnac', lat: 43.62, lon: 1.85, currentCode: 0, afternoonCode: 0, tomorrowCode: 0, currentTemp: 24, afternoonTemp: 26, tomorrowTemp: 25 },
  { id: 'pac', name: "Provence-Alpes-Côte d'Azur", shortLabel: 'Marseille', capitalName: 'Marseille', capitalStationId: 'marseille-marignane', lat: 43.65, lon: 5.95, currentCode: 0, afternoonCode: 0, tomorrowCode: 0, currentTemp: 25, afternoonTemp: 27, tomorrowTemp: 26 },
  { id: 'cor', name: 'Corse', shortLabel: 'Ajaccio', capitalName: 'Ajaccio', capitalStationId: 'ajaccio-campo-dell-oro', lat: 42.15, lon: 9.15, currentCode: 0, afternoonCode: 0, tomorrowCode: 0, currentTemp: 24, afternoonTemp: 26, tomorrowTemp: 25 },
];

// Zones météo du Royaume-Uni & Angleterre (Met Office Official Regions)
const UK_REGIONS: RegionWeather[] = [
  { id: 'uk-lon', name: 'Grand Londres & Sud-Est', shortLabel: 'Londres', capitalName: 'Londres', capitalStationId: 'london-uk', lat: 51.5074, lon: -0.1278, altitude: 25, currentCode: 1, afternoonCode: 2, tomorrowCode: 1, currentTemp: 16, afternoonTemp: 18, tomorrowTemp: 17 },
  { id: 'uk-sw', name: 'Angleterre Sud-Ouest & Cornouailles', shortLabel: 'Bristol', capitalName: 'Bristol', capitalStationId: 'bristol-uk', lat: 50.95, lon: -3.45, altitude: 45, currentCode: 2, afternoonCode: 2, tomorrowCode: 1, currentTemp: 16, afternoonTemp: 17, tomorrowTemp: 16 },
  { id: 'uk-ea', name: "Est de l'Angleterre (East Anglia)", shortLabel: 'Norwich', capitalName: 'Norwich', capitalStationId: 'norwich-uk', lat: 52.35, lon: 0.85, altitude: 30, currentCode: 1, afternoonCode: 1, tomorrowCode: 2, currentTemp: 16, afternoonTemp: 18, tomorrowTemp: 17 },
  { id: 'uk-mid', name: 'Midlands (Angleterre Centrale)', shortLabel: 'Birmingham', capitalName: 'Birmingham', capitalStationId: 'birmingham-uk', lat: 52.48, lon: -1.89, altitude: 140, currentCode: 2, afternoonCode: 2, tomorrowCode: 1, currentTemp: 15, afternoonTemp: 17, tomorrowTemp: 16 },
  { id: 'uk-wal', name: 'Pays de Galles (Wales)', shortLabel: 'Cardiff', capitalName: 'Cardiff', capitalStationId: 'cardiff-uk', lat: 52.15, lon: -3.85, altitude: 65, currentCode: 2, afternoonCode: 3, tomorrowCode: 2, currentTemp: 14, afternoonTemp: 16, tomorrowTemp: 15 },
  { id: 'uk-nw', name: 'Angleterre Nord-Ouest', shortLabel: 'Manchester', capitalName: 'Manchester', capitalStationId: 'manchester-uk', lat: 53.55, lon: -2.45, altitude: 75, currentCode: 2, afternoonCode: 61, tomorrowCode: 2, currentTemp: 14, afternoonTemp: 16, tomorrowTemp: 15 },
  { id: 'uk-york', name: 'Yorkshire & Humber', shortLabel: 'Leeds', capitalName: 'Leeds', capitalStationId: 'leeds-uk', lat: 53.95, lon: -1.15, altitude: 65, currentCode: 1, afternoonCode: 2, tomorrowCode: 1, currentTemp: 14, afternoonTemp: 16, tomorrowTemp: 15 },
  { id: 'uk-ne', name: 'Angleterre Nord-Est', shortLabel: 'Newcastle', capitalName: 'Newcastle', capitalStationId: 'newcastle-uk', lat: 55.02, lon: -1.75, altitude: 50, currentCode: 2, afternoonCode: 2, tomorrowCode: 1, currentTemp: 13, afternoonTemp: 15, tomorrowTemp: 14 },
  { id: 'uk-ni', name: 'Irlande du Nord', shortLabel: 'Belfast', capitalName: 'Belfast', capitalStationId: 'belfast-uk', lat: 54.60, lon: -6.30, altitude: 35, currentCode: 2, afternoonCode: 61, tomorrowCode: 2, currentTemp: 13, afternoonTemp: 15, tomorrowTemp: 14 },
  { id: 'uk-sco-s', name: 'Écosse Centrale (Lowlands)', shortLabel: 'Édimbourg', capitalName: 'Édimbourg', capitalStationId: 'edinburgh-uk', lat: 55.95, lon: -3.50, altitude: 60, currentCode: 2, afternoonCode: 3, tomorrowCode: 2, currentTemp: 12, afternoonTemp: 14, tomorrowTemp: 13 },
  { id: 'uk-sco-n', name: 'Écosse Nord (Highlands)', shortLabel: 'Inverness', capitalName: 'Inverness', capitalStationId: 'inverness-uk', lat: 57.45, lon: -4.25, altitude: 120, currentCode: 3, afternoonCode: 61, tomorrowCode: 2, currentTemp: 11, afternoonTemp: 13, tomorrowTemp: 12 },
];

// Zones météo par pays majeurs (Europe, Maghreb, Amériques, Asie, Océanie)
const COUNTRY_REGIONS_CATALOG: Record<string, RegionWeather[]> = {
  'france': FRANCE_REGIONS,
  'royaume-uni': UK_REGIONS,
  'espagne': [
    { id: 'es-gal', name: 'Galice & Asturies', shortLabel: 'Compostelle', capitalName: 'Saint-Jacques-de-Compostelle', capitalStationId: 'santiago-es', lat: 42.95, lon: -7.80, currentCode: 2, afternoonCode: 2, tomorrowCode: 1, currentTemp: 18, afternoonTemp: 20, tomorrowTemp: 19 },
    { id: 'es-bas', name: 'Pays Basque & Navarre', shortLabel: 'Bilbao', capitalName: 'Bilbao', capitalStationId: 'bilbao-es', lat: 43.10, lon: -2.60, currentCode: 1, afternoonCode: 2, tomorrowCode: 1, currentTemp: 20, afternoonTemp: 22, tomorrowTemp: 21 },
    { id: 'es-cat', name: 'Catalogne', shortLabel: 'Barcelone', capitalName: 'Barcelone', capitalStationId: 'barcelona-es', lat: 41.55, lon: 1.85, currentCode: 0, afternoonCode: 1, tomorrowCode: 0, currentTemp: 24, afternoonTemp: 26, tomorrowTemp: 25 },
    { id: 'es-ara', name: 'Aragon', shortLabel: 'Saragosse', capitalName: 'Saragosse', capitalStationId: 'zaragoza-es', lat: 41.55, lon: -0.88, currentCode: 0, afternoonCode: 0, tomorrowCode: 1, currentTemp: 24, afternoonTemp: 27, tomorrowTemp: 25 },
    { id: 'es-mad', name: 'Madrid & Centre', shortLabel: 'Madrid', capitalName: 'Madrid', capitalStationId: 'madrid-es', lat: 40.42, lon: -3.70, altitude: 650, currentCode: 0, afternoonCode: 0, tomorrowCode: 0, currentTemp: 25, afternoonTemp: 28, tomorrowTemp: 26 },
    { id: 'es-cyl', name: 'Castille-et-León', shortLabel: 'Valladolid', capitalName: 'Valladolid', capitalStationId: 'valladolid-es', lat: 41.80, lon: -4.80, altitude: 700, currentCode: 1, afternoonCode: 1, tomorrowCode: 0, currentTemp: 21, afternoonTemp: 24, tomorrowTemp: 22 },
    { id: 'es-val', name: 'Communauté Valencienne', shortLabel: 'Valence', capitalName: 'Valence', capitalStationId: 'valencia-es', lat: 39.47, lon: -0.45, currentCode: 0, afternoonCode: 0, tomorrowCode: 0, currentTemp: 26, afternoonTemp: 28, tomorrowTemp: 27 },
    { id: 'es-and-w', name: 'Andalousie Ouest', shortLabel: 'Séville', capitalName: 'Séville', capitalStationId: 'sevilla-es', lat: 37.45, lon: -5.85, currentCode: 0, afternoonCode: 0, tomorrowCode: 0, currentTemp: 29, afternoonTemp: 32, tomorrowTemp: 30 },
    { id: 'es-and-e', name: 'Andalousie Est', shortLabel: 'Malaga', capitalName: 'Malaga', capitalStationId: 'malaga-es', lat: 37.05, lon: -3.80, currentCode: 0, afternoonCode: 0, tomorrowCode: 0, currentTemp: 27, afternoonTemp: 29, tomorrowTemp: 28 },
    { id: 'es-bal', name: 'Îles Baléares', shortLabel: 'Palma', capitalName: 'Palma de Majorque', capitalStationId: 'palma-es', lat: 39.60, lon: 2.95, currentCode: 0, afternoonCode: 0, tomorrowCode: 0, currentTemp: 25, afternoonTemp: 27, tomorrowTemp: 26 },
  ],
  'italie': [
    { id: 'it-pie', name: 'Piémont & Ligurie', shortLabel: 'Turin', capitalName: 'Turin', capitalStationId: 'torino-it', lat: 44.85, lon: 7.85, currentCode: 1, afternoonCode: 1, tomorrowCode: 0, currentTemp: 21, afternoonTemp: 24, tomorrowTemp: 23 },
    { id: 'it-lom', name: 'Lombardie', shortLabel: 'Milan', capitalName: 'Milan', capitalStationId: 'milano-it', lat: 45.55, lon: 9.45, currentCode: 1, afternoonCode: 2, tomorrowCode: 1, currentTemp: 22, afternoonTemp: 25, tomorrowTemp: 24 },
    { id: 'it-ven', name: 'Vénétie & Nord-Est', shortLabel: 'Venise', capitalName: 'Venise', capitalStationId: 'venezia-it', lat: 45.65, lon: 12.10, currentCode: 1, afternoonCode: 1, tomorrowCode: 1, currentTemp: 22, afternoonTemp: 24, tomorrowTemp: 23 },
    { id: 'it-emi', name: 'Émilie-Romagne', shortLabel: 'Bologne', capitalName: 'Bologne', capitalStationId: 'bologna-it', lat: 44.50, lon: 11.20, currentCode: 0, afternoonCode: 1, tomorrowCode: 0, currentTemp: 24, afternoonTemp: 26, tomorrowTemp: 25 },
    { id: 'it-tos', name: 'Toscane', shortLabel: 'Florence', capitalName: 'Florence', capitalStationId: 'firenze-it', lat: 43.45, lon: 11.15, currentCode: 0, afternoonCode: 0, tomorrowCode: 0, currentTemp: 25, afternoonTemp: 27, tomorrowTemp: 26 },
    { id: 'it-laz', name: 'Latium & Centre', shortLabel: 'Rome', capitalName: 'Rome', capitalStationId: 'roma-it', lat: 41.90, lon: 12.50, currentCode: 0, afternoonCode: 0, tomorrowCode: 0, currentTemp: 26, afternoonTemp: 28, tomorrowTemp: 27 },
    { id: 'it-cam', name: 'Campanie', shortLabel: 'Naples', capitalName: 'Naples', capitalStationId: 'napoli-it', lat: 40.75, lon: 14.40, currentCode: 0, afternoonCode: 0, tomorrowCode: 0, currentTemp: 26, afternoonTemp: 28, tomorrowTemp: 27 },
    { id: 'it-pug', name: 'Pouilles & Sud-Est', shortLabel: 'Bari', capitalName: 'Bari', capitalStationId: 'bari-it', lat: 41.00, lon: 16.70, currentCode: 0, afternoonCode: 0, tomorrowCode: 0, currentTemp: 26, afternoonTemp: 28, tomorrowTemp: 27 },
    { id: 'it-sic', name: 'Sicile', shortLabel: 'Palerme', capitalName: 'Palerme', capitalStationId: 'palermo-it', lat: 37.60, lon: 14.15, currentCode: 0, afternoonCode: 0, tomorrowCode: 0, currentTemp: 28, afternoonTemp: 30, tomorrowTemp: 29 },
    { id: 'it-sar', name: 'Sardaigne', shortLabel: 'Cagliari', capitalName: 'Cagliari', capitalStationId: 'cagliari-it', lat: 40.00, lon: 9.05, currentCode: 0, afternoonCode: 0, tomorrowCode: 0, currentTemp: 27, afternoonTemp: 29, tomorrowTemp: 28 },
  ],
  'allemagne': [
    { id: 'de-ham', name: 'Hambourg & Schleswig-Holstein', shortLabel: 'Hambourg', capitalName: 'Hambourg', capitalStationId: 'hamburg-de', lat: 53.75, lon: 9.95, currentCode: 2, afternoonCode: 2, tomorrowCode: 1, currentTemp: 16, afternoonTemp: 18, tomorrowTemp: 17 },
    { id: 'de-han', name: 'Basse-Saxe & Brême', shortLabel: 'Hanovre', capitalName: 'Hanovre', capitalStationId: 'hannover-de', lat: 52.55, lon: 9.40, currentCode: 1, afternoonCode: 2, tomorrowCode: 1, currentTemp: 17, afternoonTemp: 19, tomorrowTemp: 18 },
    { id: 'de-nrw', name: 'Rhénanie-du-Nord-Westphalie', shortLabel: 'Cologne', capitalName: 'Cologne', capitalStationId: 'koeln-de', lat: 51.25, lon: 7.15, currentCode: 1, afternoonCode: 2, tomorrowCode: 1, currentTemp: 18, afternoonTemp: 20, tomorrowTemp: 19 },
    { id: 'de-hes', name: 'Hesse & Francfort', shortLabel: 'Francfort', capitalName: 'Francfort', capitalStationId: 'frankfurt-de', lat: 50.25, lon: 8.85, currentCode: 1, afternoonCode: 1, tomorrowCode: 1, currentTemp: 19, afternoonTemp: 21, tomorrowTemp: 20 },
    { id: 'de-ber', name: 'Berlin & Brandebourg', shortLabel: 'Berlin', capitalName: 'Berlin', capitalStationId: 'berlin-de', lat: 52.52, lon: 13.40, currentCode: 1, afternoonCode: 1, tomorrowCode: 2, currentTemp: 18, afternoonTemp: 21, tomorrowTemp: 19 },
    { id: 'de-sax', name: 'Saxe & Thuringe', shortLabel: 'Dresde', capitalName: 'Dresde', capitalStationId: 'dresden-de', lat: 51.15, lon: 13.10, currentCode: 1, afternoonCode: 2, tomorrowCode: 1, currentTemp: 18, afternoonTemp: 20, tomorrowTemp: 19 },
    { id: 'de-bw', name: 'Bade-Wurtemberg', shortLabel: 'Stuttgart', capitalName: 'Stuttgart', capitalStationId: 'stuttgart-de', lat: 48.65, lon: 9.05, currentCode: 0, afternoonCode: 1, tomorrowCode: 1, currentTemp: 20, afternoonTemp: 22, tomorrowTemp: 21 },
    { id: 'de-bay-n', name: 'Bavière Nord (Franconie)', shortLabel: 'Nuremberg', capitalName: 'Nuremberg', capitalStationId: 'nuernberg-de', lat: 49.55, lon: 11.10, currentCode: 1, afternoonCode: 1, tomorrowCode: 1, currentTemp: 19, afternoonTemp: 21, tomorrowTemp: 20 },
    { id: 'de-bay-s', name: 'Bavière Sud & Alpes', shortLabel: 'Munich', capitalName: 'Munich', capitalStationId: 'muenchen-de', lat: 48.14, lon: 11.58, altitude: 520, currentCode: 1, afternoonCode: 2, tomorrowCode: 1, currentTemp: 19, afternoonTemp: 21, tomorrowTemp: 20 },
  ],
  'suisse': [
    { id: 'ch-rom', name: 'Suisse Romande & Léman', shortLabel: 'Genève', capitalName: 'Genève', capitalStationId: 'geneve-ch', lat: 46.45, lon: 6.45, altitude: 400, currentCode: 0, afternoonCode: 1, tomorrowCode: 0, currentTemp: 20, afternoonTemp: 22, tomorrowTemp: 21 },
    { id: 'ch-mit', name: 'Espace Mittelland', shortLabel: 'Berne', capitalName: 'Berne', capitalStationId: 'bern-ch', lat: 46.95, lon: 7.45, altitude: 540, currentCode: 1, afternoonCode: 1, tomorrowCode: 1, currentTemp: 19, afternoonTemp: 21, tomorrowTemp: 20 },
    { id: 'ch-nw', name: 'Suisse Nord-Ouest', shortLabel: 'Bâle', capitalName: 'Bâle', capitalStationId: 'basel-ch', lat: 47.50, lon: 7.65, altitude: 280, currentCode: 1, afternoonCode: 1, tomorrowCode: 1, currentTemp: 20, afternoonTemp: 22, tomorrowTemp: 21 },
    { id: 'ch-zh', name: 'Grand Zurich & Nord-Est', shortLabel: 'Zurich', capitalName: 'Zurich', capitalStationId: 'zurich-ch', lat: 47.37, lon: 8.54, altitude: 410, currentCode: 1, afternoonCode: 1, tomorrowCode: 1, currentTemp: 19, afternoonTemp: 21, tomorrowTemp: 20 },
    { id: 'ch-tic', name: 'Tessin & Sud des Alpes', shortLabel: 'Lugano', capitalName: 'Lugano', capitalStationId: 'lugano-ch', lat: 46.10, lon: 8.95, altitude: 275, currentCode: 0, afternoonCode: 0, tomorrowCode: 1, currentTemp: 22, afternoonTemp: 24, tomorrowTemp: 23 },
    { id: 'ch-gr', name: 'Grisons & Alpes Orientales', shortLabel: 'Coire', capitalName: 'Coire', capitalStationId: 'chur-ch', lat: 46.75, lon: 9.65, altitude: 1100, currentCode: 1, afternoonCode: 2, tomorrowCode: 1, currentTemp: 15, afternoonTemp: 17, tomorrowTemp: 16 },
  ],
  'belgique': [
    { id: 'be-coast', name: 'Flandre Occidentale & Littoral', shortLabel: 'Bruges', capitalName: 'Bruges', capitalStationId: 'bruges-be', lat: 51.18, lon: 3.12, currentCode: 2, afternoonCode: 2, tomorrowCode: 1, currentTemp: 17, afternoonTemp: 19, tomorrowTemp: 18 },
    { id: 'be-ant', name: 'Anvers & Flandre Orientale', shortLabel: 'Anvers', capitalName: 'Anvers', capitalStationId: 'antwerp-be', lat: 51.22, lon: 4.40, currentCode: 1, afternoonCode: 2, tomorrowCode: 1, currentTemp: 18, afternoonTemp: 20, tomorrowTemp: 19 },
    { id: 'be-bru', name: 'Bruxelles & Brabant', shortLabel: 'Bruxelles', capitalName: 'Bruxelles', capitalStationId: 'brussels-be', lat: 50.85, lon: 4.35, currentCode: 1, afternoonCode: 2, tomorrowCode: 1, currentTemp: 18, afternoonTemp: 20, tomorrowTemp: 19 },
    { id: 'be-hai', name: 'Hainaut & Namur', shortLabel: 'Namur', capitalName: 'Namur', capitalStationId: 'namur-be', lat: 50.42, lon: 4.50, currentCode: 1, afternoonCode: 2, tomorrowCode: 1, currentTemp: 18, afternoonTemp: 20, tomorrowTemp: 19 },
    { id: 'be-lie', name: 'Liège & Ardennes', shortLabel: 'Liège', capitalName: 'Liège', capitalStationId: 'liege-be', lat: 50.35, lon: 5.75, altitude: 320, currentCode: 2, afternoonCode: 2, tomorrowCode: 2, currentTemp: 16, afternoonTemp: 18, tomorrowTemp: 17 },
  ],
  'pays-bas': [
    { id: 'nl-nh', name: 'Hollande-Septentrionale', shortLabel: 'Amsterdam', capitalName: 'Amsterdam', capitalStationId: 'amsterdam-nl', lat: 52.38, lon: 4.90, currentCode: 2, afternoonCode: 2, tomorrowCode: 1, currentTemp: 16, afternoonTemp: 18, tomorrowTemp: 17 },
    { id: 'nl-zh', name: 'Hollande-Méridionale', shortLabel: 'Rotterdam', capitalName: 'Rotterdam', capitalStationId: 'rotterdam-nl', lat: 51.95, lon: 4.45, currentCode: 2, afternoonCode: 2, tomorrowCode: 1, currentTemp: 17, afternoonTemp: 19, tomorrowTemp: 18 },
    { id: 'nl-no', name: 'Nord & Frise', shortLabel: 'Groningue', capitalName: 'Groningue', capitalStationId: 'groningen-nl', lat: 53.15, lon: 6.35, currentCode: 2, afternoonCode: 2, tomorrowCode: 2, currentTemp: 15, afternoonTemp: 17, tomorrowTemp: 16 },
    { id: 'nl-ce', name: 'Utrecht & Gueldre', shortLabel: 'Utrecht', capitalName: 'Utrecht', capitalStationId: 'utrecht-nl', lat: 52.10, lon: 5.65, currentCode: 1, afternoonCode: 2, tomorrowCode: 1, currentTemp: 17, afternoonTemp: 19, tomorrowTemp: 18 },
    { id: 'nl-su', name: 'Brabant & Limbourg', shortLabel: 'Eindhoven', capitalName: 'Eindhoven', capitalStationId: 'eindhoven-nl', lat: 51.40, lon: 5.50, currentCode: 1, afternoonCode: 2, tomorrowCode: 1, currentTemp: 18, afternoonTemp: 20, tomorrowTemp: 19 },
  ],
  'portugal': [
    { id: 'pt-no', name: 'Nord & Douro', shortLabel: 'Porto', capitalName: 'Porto', capitalStationId: 'porto-pt', lat: 41.25, lon: -8.35, currentCode: 1, afternoonCode: 1, tomorrowCode: 0, currentTemp: 20, afternoonTemp: 22, tomorrowTemp: 21 },
    { id: 'pt-ce', name: 'Centre & Beiras', shortLabel: 'Coimbra', capitalName: 'Coimbra', capitalStationId: 'coimbra-pt', lat: 40.20, lon: -8.15, currentCode: 0, afternoonCode: 1, tomorrowCode: 0, currentTemp: 22, afternoonTemp: 24, tomorrowTemp: 23 },
    { id: 'pt-lis', name: 'Grand Lisbonne & Tage', shortLabel: 'Lisbonne', capitalName: 'Lisbonne', capitalStationId: 'lisboa-pt', lat: 38.72, lon: -9.14, currentCode: 0, afternoonCode: 0, tomorrowCode: 0, currentTemp: 24, afternoonTemp: 26, tomorrowTemp: 25 },
    { id: 'pt-ale', name: 'Alentejo', shortLabel: 'Évora', capitalName: 'Évora', capitalStationId: 'evora-pt', lat: 38.45, lon: -7.90, currentCode: 0, afternoonCode: 0, tomorrowCode: 0, currentTemp: 26, afternoonTemp: 29, tomorrowTemp: 27 },
    { id: 'pt-alg', name: 'Algarve', shortLabel: 'Faro', capitalName: 'Faro', capitalStationId: 'faro-pt', lat: 37.10, lon: -8.05, currentCode: 0, afternoonCode: 0, tomorrowCode: 0, currentTemp: 25, afternoonTemp: 27, tomorrowTemp: 26 },
  ],
  'irlande': [
    { id: 'ie-dub', name: 'Grand Dublin & Leinster', shortLabel: 'Dublin', capitalName: 'Dublin', capitalStationId: 'dublin-ie', lat: 53.35, lon: -6.26, currentCode: 2, afternoonCode: 2, tomorrowCode: 1, currentTemp: 14, afternoonTemp: 16, tomorrowTemp: 15 },
    { id: 'ie-mun', name: 'Munster & Sud', shortLabel: 'Cork', capitalName: 'Cork', capitalStationId: 'cork-ie', lat: 51.95, lon: -8.50, currentCode: 2, afternoonCode: 61, tomorrowCode: 2, currentTemp: 14, afternoonTemp: 16, tomorrowTemp: 15 },
    { id: 'ie-con', name: 'Connacht & Ouest', shortLabel: 'Galway', capitalName: 'Galway', capitalStationId: 'galway-ie', lat: 53.30, lon: -9.05, currentCode: 3, afternoonCode: 61, tomorrowCode: 2, currentTemp: 13, afternoonTemp: 15, tomorrowTemp: 14 },
    { id: 'ie-mid', name: 'Mid-West & Shannon', shortLabel: 'Limerick', capitalName: 'Limerick', capitalStationId: 'limerick-ie', lat: 52.66, lon: -8.62, currentCode: 2, afternoonCode: 2, tomorrowCode: 2, currentTemp: 14, afternoonTemp: 16, tomorrowTemp: 15 },
    { id: 'ie-nw', name: 'Nord-Ouest & Donegal', shortLabel: 'Donegal', capitalName: 'Donegal', capitalStationId: 'donegal-ie', lat: 54.80, lon: -8.00, currentCode: 3, afternoonCode: 61, tomorrowCode: 2, currentTemp: 12, afternoonTemp: 14, tomorrowTemp: 13 },
  ],
  'autriche': [
    { id: 'at-vie', name: 'Vienne & Basse-Autriche', shortLabel: 'Vienne', capitalName: 'Vienne', capitalStationId: 'wien-at', lat: 48.20, lon: 16.37, currentCode: 1, afternoonCode: 1, tomorrowCode: 1, currentTemp: 20, afternoonTemp: 22, tomorrowTemp: 21 },
    { id: 'at-up', name: 'Haute-Autriche', shortLabel: 'Linz', capitalName: 'Linz', capitalStationId: 'linz-at', lat: 48.25, lon: 14.15, currentCode: 1, afternoonCode: 2, tomorrowCode: 1, currentTemp: 19, afternoonTemp: 21, tomorrowTemp: 20 },
    { id: 'at-sal', name: 'Salzbourg & Alpes Centrales', shortLabel: 'Salzbourg', capitalName: 'Salzbourg', capitalStationId: 'salzburg-at', lat: 47.70, lon: 13.05, altitude: 450, currentCode: 1, afternoonCode: 2, tomorrowCode: 1, currentTemp: 18, afternoonTemp: 20, tomorrowTemp: 19 },
    { id: 'at-tyr', name: 'Tyrol & Vorarlberg', shortLabel: 'Innsbruck', capitalName: 'Innsbruck', capitalStationId: 'innsbruck-at', lat: 47.26, lon: 11.40, altitude: 580, currentCode: 1, afternoonCode: 2, tomorrowCode: 1, currentTemp: 18, afternoonTemp: 20, tomorrowTemp: 19 },
    { id: 'at-sty', name: 'Styrie & Carinthie', shortLabel: 'Graz', capitalName: 'Graz', capitalStationId: 'graz-at', lat: 46.95, lon: 15.10, currentCode: 0, afternoonCode: 1, tomorrowCode: 1, currentTemp: 20, afternoonTemp: 22, tomorrowTemp: 21 },
  ],
  'grèce': [
    { id: 'gr-att', name: 'Attique & Grand Athènes', shortLabel: 'Athènes', capitalName: 'Athènes', capitalStationId: 'athens-gr', lat: 37.98, lon: 23.73, currentCode: 0, afternoonCode: 0, tomorrowCode: 0, currentTemp: 28, afternoonTemp: 30, tomorrowTemp: 29 },
    { id: 'gr-mac', name: 'Macédoine & Nord', shortLabel: 'Thessalonique', capitalName: 'Thessalonique', capitalStationId: 'thessaloniki-gr', lat: 40.64, lon: 22.94, currentCode: 0, afternoonCode: 1, tomorrowCode: 0, currentTemp: 25, afternoonTemp: 27, tomorrowTemp: 26 },
    { id: 'gr-pel', name: 'Péloponnèse', shortLabel: 'Patras', capitalName: 'Patras', capitalStationId: 'patras-gr', lat: 37.65, lon: 22.10, currentCode: 0, afternoonCode: 0, tomorrowCode: 0, currentTemp: 27, afternoonTemp: 29, tomorrowTemp: 28 },
    { id: 'gr-the', name: 'Thessalie & Grèce Centrale', shortLabel: 'Larissa', capitalName: 'Larissa', capitalStationId: 'larissa-gr', lat: 39.45, lon: 22.20, currentCode: 0, afternoonCode: 0, tomorrowCode: 0, currentTemp: 27, afternoonTemp: 29, tomorrowTemp: 28 },
    { id: 'gr-cre', name: 'Crète', shortLabel: 'Héraklion', capitalName: 'Héraklion', capitalStationId: 'heraklion-gr', lat: 35.30, lon: 24.90, currentCode: 0, afternoonCode: 0, tomorrowCode: 0, currentTemp: 27, afternoonTemp: 29, tomorrowTemp: 28 },
    { id: 'gr-aeg', name: 'Cyclades & Mer Égée', shortLabel: 'Mykonos', capitalName: 'Mykonos', capitalStationId: 'cyclades-gr', lat: 37.10, lon: 25.40, currentCode: 0, afternoonCode: 0, tomorrowCode: 0, currentTemp: 26, afternoonTemp: 28, tomorrowTemp: 27 },
  ],
  'maroc': [
    { id: 'ma-tan', name: 'Tanger-Tétouan & Rif', shortLabel: 'Tanger', capitalName: 'Tanger', capitalStationId: 'tanger-ma', lat: 35.45, lon: -5.50, currentCode: 0, afternoonCode: 0, tomorrowCode: 0, currentTemp: 25, afternoonTemp: 27, tomorrowTemp: 26 },
    { id: 'ma-rab', name: 'Rabat-Salé-Kénitra', shortLabel: 'Rabat', capitalName: 'Rabat', capitalStationId: 'rabat-ma', lat: 34.02, lon: -6.84, currentCode: 0, afternoonCode: 0, tomorrowCode: 0, currentTemp: 25, afternoonTemp: 27, tomorrowTemp: 26 },
    { id: 'ma-cas', name: 'Casablanca-Settat', shortLabel: 'Casablanca', capitalName: 'Casablanca', capitalStationId: 'casablanca-ma', lat: 33.40, lon: -7.60, currentCode: 0, afternoonCode: 0, tomorrowCode: 0, currentTemp: 25, afternoonTemp: 27, tomorrowTemp: 26 },
    { id: 'ma-fes', name: 'Fès-Meknès', shortLabel: 'Fès', capitalName: 'Fès', capitalStationId: 'fes-ma', lat: 33.95, lon: -4.85, currentCode: 0, afternoonCode: 0, tomorrowCode: 0, currentTemp: 28, afternoonTemp: 31, tomorrowTemp: 29 },
    { id: 'ma-ori', name: 'Oriental', shortLabel: 'Oujda', capitalName: 'Oujda', capitalStationId: 'oujda-ma', lat: 34.45, lon: -2.15, currentCode: 0, afternoonCode: 0, tomorrowCode: 0, currentTemp: 27, afternoonTemp: 30, tomorrowTemp: 28 },
    { id: 'ma-mar', name: 'Marrakech-Safi', shortLabel: 'Marrakech', capitalName: 'Marrakech', capitalStationId: 'marrakech-ma', lat: 31.63, lon: -8.00, currentCode: 0, afternoonCode: 0, tomorrowCode: 0, currentTemp: 31, afternoonTemp: 34, tomorrowTemp: 32 },
    { id: 'ma-aga', name: 'Souss-Massa', shortLabel: 'Agadir', capitalName: 'Agadir', capitalStationId: 'agadir-ma', lat: 30.40, lon: -9.20, currentCode: 0, afternoonCode: 0, tomorrowCode: 0, currentTemp: 27, afternoonTemp: 29, tomorrowTemp: 28 },
  ],
  'algérie': [
    { id: 'dz-alg', name: 'Alger & Mitidja', shortLabel: 'Alger', capitalName: 'Alger', capitalStationId: 'algiers-dz', lat: 36.75, lon: 3.05, currentCode: 0, afternoonCode: 0, tomorrowCode: 0, currentTemp: 26, afternoonTemp: 28, tomorrowTemp: 27 },
    { id: 'dz-ora', name: 'Oranie & Nord-Ouest', shortLabel: 'Oran', capitalName: 'Oran', capitalStationId: 'oran-dz', lat: 35.65, lon: -0.60, currentCode: 0, afternoonCode: 0, tomorrowCode: 0, currentTemp: 26, afternoonTemp: 28, tomorrowTemp: 27 },
    { id: 'dz-con', name: 'Constantine & Kabylie', shortLabel: 'Constantine', capitalName: 'Constantine', capitalStationId: 'constantine-dz', lat: 36.35, lon: 6.15, currentCode: 0, afternoonCode: 1, tomorrowCode: 0, currentTemp: 25, afternoonTemp: 28, tomorrowTemp: 26 },
    { id: 'dz-hpl', name: 'Hauts Plateaux', shortLabel: 'Sétif', capitalName: 'Sétif', capitalStationId: 'setif-dz', lat: 35.15, lon: 3.80, altitude: 950, currentCode: 0, afternoonCode: 0, tomorrowCode: 0, currentTemp: 24, afternoonTemp: 27, tomorrowTemp: 25 },
    { id: 'dz-oua', name: 'Sud-Est & Oasis', shortLabel: 'Ouargla', capitalName: 'Ouargla', capitalStationId: 'ouargla-dz', lat: 32.30, lon: 5.40, currentCode: 0, afternoonCode: 0, tomorrowCode: 0, currentTemp: 33, afternoonTemp: 36, tomorrowTemp: 35 },
    { id: 'dz-sah', name: 'Sahara Central', shortLabel: 'Ghardaïa', capitalName: 'Ghardaïa', capitalStationId: 'ghardaia-dz', lat: 31.00, lon: 2.60, currentCode: 0, afternoonCode: 0, tomorrowCode: 0, currentTemp: 34, afternoonTemp: 37, tomorrowTemp: 35 },
  ],
  'tunisie': [
    { id: 'tn-tun', name: 'Grand Tunis & Cap Bon', shortLabel: 'Tunis', capitalName: 'Tunis', capitalStationId: 'tunis-tn', lat: 36.80, lon: 10.25, currentCode: 0, afternoonCode: 0, tomorrowCode: 0, currentTemp: 27, afternoonTemp: 29, tomorrowTemp: 28 },
    { id: 'tn-nw', name: 'Nord-Ouest & Kroumirie', shortLabel: 'Béja', capitalName: 'Béja', capitalStationId: 'beja-tn', lat: 36.65, lon: 9.05, currentCode: 0, afternoonCode: 1, tomorrowCode: 0, currentTemp: 25, afternoonTemp: 27, tomorrowTemp: 26 },
    { id: 'tn-sah', name: 'Sahel & Centre-Est', shortLabel: 'Sousse', capitalName: 'Sousse', capitalStationId: 'sousse-tn', lat: 35.40, lon: 10.70, currentCode: 0, afternoonCode: 0, tomorrowCode: 0, currentTemp: 28, afternoonTemp: 30, tomorrowTemp: 29 },
    { id: 'tn-cw', name: 'Centre-Ouest', shortLabel: 'Kairouan', capitalName: 'Kairouan', capitalStationId: 'kairouan-tn', lat: 35.35, lon: 9.45, currentCode: 0, afternoonCode: 0, tomorrowCode: 0, currentTemp: 29, afternoonTemp: 32, tomorrowTemp: 30 },
    { id: 'tn-sud', name: 'Sud & Île de Djerba', shortLabel: 'Djerba', capitalName: 'Djerba', capitalStationId: 'djerba-tn', lat: 33.75, lon: 10.10, currentCode: 0, afternoonCode: 0, tomorrowCode: 0, currentTemp: 30, afternoonTemp: 33, tomorrowTemp: 31 },
  ],
  'états-unis': [
    { id: 'us-ne', name: 'Nord-Est & Nouvelle-Angleterre', shortLabel: 'New York', capitalName: 'New York', capitalStationId: 'nyc-us', lat: 41.30, lon: -73.50, currentCode: 1, afternoonCode: 1, tomorrowCode: 0, currentTemp: 19, afternoonTemp: 22, tomorrowTemp: 21 },
    { id: 'us-ma', name: 'Mid-Atlantic', shortLabel: 'Washington', capitalName: 'Washington', capitalStationId: 'dc-us', lat: 38.90, lon: -77.04, currentCode: 1, afternoonCode: 1, tomorrowCode: 1, currentTemp: 21, afternoonTemp: 24, tomorrowTemp: 22 },
    { id: 'us-se', name: 'Sud-Est & Floride', shortLabel: 'Miami', capitalName: 'Miami', capitalStationId: 'miami-us', lat: 28.50, lon: -81.40, currentCode: 1, afternoonCode: 2, tomorrowCode: 1, currentTemp: 28, afternoonTemp: 30, tomorrowTemp: 29 },
    { id: 'us-mw', name: 'Grands Lacs & Midwest', shortLabel: 'Chicago', capitalName: 'Chicago', capitalStationId: 'chicago-us', lat: 41.88, lon: -87.63, currentCode: 1, afternoonCode: 2, tomorrowCode: 1, currentTemp: 18, afternoonTemp: 21, tomorrowTemp: 19 },
    { id: 'us-sc', name: 'Texas & Sud-Central', shortLabel: 'Dallas', capitalName: 'Dallas', capitalStationId: 'dallas-us', lat: 31.80, lon: -97.00, currentCode: 0, afternoonCode: 1, tomorrowCode: 0, currentTemp: 27, afternoonTemp: 30, tomorrowTemp: 28 },
    { id: 'us-gp', name: 'Grandes Plaines', shortLabel: 'Kansas City', capitalName: 'Kansas City', capitalStationId: 'kc-us', lat: 39.10, lon: -96.50, currentCode: 0, afternoonCode: 1, tomorrowCode: 0, currentTemp: 22, afternoonTemp: 25, tomorrowTemp: 23 },
    { id: 'us-rk', name: 'Montagnes Rocheuses', shortLabel: 'Denver', capitalName: 'Denver', capitalStationId: 'denver-us', lat: 39.74, lon: -105.00, altitude: 1609, currentCode: 0, afternoonCode: 1, tomorrowCode: 0, currentTemp: 19, afternoonTemp: 22, tomorrowTemp: 20 },
    { id: 'us-nw', name: 'Nord-Ouest Pacifique', shortLabel: 'Seattle', capitalName: 'Seattle', capitalStationId: 'seattle-us', lat: 46.80, lon: -122.00, currentCode: 2, afternoonCode: 2, tomorrowCode: 1, currentTemp: 15, afternoonTemp: 18, tomorrowTemp: 17 },
    { id: 'us-ca', name: 'Californie & Sud-Ouest', shortLabel: 'Los Angeles', capitalName: 'Los Angeles', capitalStationId: 'la-us', lat: 35.20, lon: -119.20, currentCode: 0, afternoonCode: 0, tomorrowCode: 0, currentTemp: 24, afternoonTemp: 27, tomorrowTemp: 25 },
  ],
  'canada': [
    { id: 'ca-qc', name: 'Québec', shortLabel: 'Montréal', capitalName: 'Montréal', capitalStationId: 'montreal-ca', lat: 46.20, lon: -72.50, currentCode: 1, afternoonCode: 2, tomorrowCode: 1, currentTemp: 15, afternoonTemp: 18, tomorrowTemp: 16 },
    { id: 'ca-on', name: 'Ontario', shortLabel: 'Toronto', capitalName: 'Toronto', capitalStationId: 'toronto-ca', lat: 44.30, lon: -79.20, currentCode: 1, afternoonCode: 1, tomorrowCode: 1, currentTemp: 17, afternoonTemp: 19, tomorrowTemp: 18 },
    { id: 'ca-at', name: 'Provinces Atlantiques', shortLabel: 'Halifax', capitalName: 'Halifax', capitalStationId: 'halifax-ca', lat: 45.20, lon: -63.60, currentCode: 2, afternoonCode: 2, tomorrowCode: 1, currentTemp: 14, afternoonTemp: 16, tomorrowTemp: 15 },
    { id: 'ca-pr', name: 'Prairies (Manitoba / Saskatchewan)', shortLabel: 'Winnipeg', capitalName: 'Winnipeg', capitalStationId: 'winnipeg-ca', lat: 50.40, lon: -100.00, currentCode: 1, afternoonCode: 1, tomorrowCode: 1, currentTemp: 15, afternoonTemp: 18, tomorrowTemp: 16 },
    { id: 'ca-ab', name: 'Alberta & Rocheuses', shortLabel: 'Calgary', capitalName: 'Calgary', capitalStationId: 'calgary-ca', lat: 52.00, lon: -114.00, altitude: 1045, currentCode: 1, afternoonCode: 2, tomorrowCode: 1, currentTemp: 13, afternoonTemp: 16, tomorrowTemp: 14 },
    { id: 'ca-bc', name: 'Colombie-Britannique', shortLabel: 'Vancouver', capitalName: 'Vancouver', capitalStationId: 'vancouver-ca', lat: 49.50, lon: -123.10, currentCode: 2, afternoonCode: 2, tomorrowCode: 1, currentTemp: 15, afternoonTemp: 17, tomorrowTemp: 16 },
  ],
  'japon': [
    { id: 'jp-hok', name: 'Hokkaido (Nord)', shortLabel: 'Sapporo', capitalName: 'Sapporo', capitalStationId: 'sapporo-jp', lat: 43.06, lon: 141.35, currentCode: 1, afternoonCode: 2, tomorrowCode: 1, currentTemp: 15, afternoonTemp: 18, tomorrowTemp: 16 },
    { id: 'jp-toh', name: 'Tohoku', shortLabel: 'Sendai', capitalName: 'Sendai', capitalStationId: 'sendai-jp', lat: 38.27, lon: 140.87, currentCode: 1, afternoonCode: 1, tomorrowCode: 1, currentTemp: 18, afternoonTemp: 21, tomorrowTemp: 19 },
    { id: 'jp-kan', name: 'Kanto & Grand Tokyo', shortLabel: 'Tokyo', capitalName: 'Tokyo', capitalStationId: 'tokyo-jp', lat: 35.68, lon: 139.65, currentCode: 1, afternoonCode: 1, tomorrowCode: 0, currentTemp: 22, afternoonTemp: 24, tomorrowTemp: 23 },
    { id: 'jp-chu', name: 'Chubu & Alpes Japonaises', shortLabel: 'Nagoya', capitalName: 'Nagoya', capitalStationId: 'nagoya-jp', lat: 35.18, lon: 136.91, currentCode: 1, afternoonCode: 1, tomorrowCode: 1, currentTemp: 22, afternoonTemp: 24, tomorrowTemp: 23 },
    { id: 'jp-kns', name: 'Kansai (Osaka & Kyoto)', shortLabel: 'Osaka', capitalName: 'Osaka', capitalStationId: 'osaka-jp', lat: 34.69, lon: 135.50, currentCode: 0, afternoonCode: 1, tomorrowCode: 0, currentTemp: 23, afternoonTemp: 25, tomorrowTemp: 24 },
    { id: 'jp-kyu', name: 'Kyushu (Sud)', shortLabel: 'Fukuoka', capitalName: 'Fukuoka', capitalStationId: 'fukuoka-jp', lat: 33.59, lon: 130.40, currentCode: 1, afternoonCode: 1, tomorrowCode: 1, currentTemp: 23, afternoonTemp: 26, tomorrowTemp: 24 },
  ],
};

// Zones météo mondiales pour la vue "Monde"
const WORLD_MACRO_ZONES: RegionWeather[] = [
  { id: 'wm-eu-w', name: 'Europe de l’Ouest', shortLabel: 'Paris', capitalName: 'Paris', capitalStationId: 'paris-montsouris', lat: 48.85, lon: 2.35, currentCode: 1, afternoonCode: 1, tomorrowCode: 1, currentTemp: 20, afternoonTemp: 22, tomorrowTemp: 21 },
  { id: 'wm-eu-s', name: 'Bassin Méditerranéen', shortLabel: 'Rome', capitalName: 'Rome', capitalStationId: 'roma-it', lat: 40.50, lon: 12.50, currentCode: 0, afternoonCode: 0, tomorrowCode: 0, currentTemp: 26, afternoonTemp: 28, tomorrowTemp: 27 },
  { id: 'wm-eu-n', name: 'Europe du Nord & UK', shortLabel: 'Londres', capitalName: 'Londres', capitalStationId: 'london-uk', lat: 54.50, lon: -1.50, currentCode: 2, afternoonCode: 2, tomorrowCode: 1, currentTemp: 15, afternoonTemp: 17, tomorrowTemp: 16 },
  { id: 'wm-na-e', name: 'Amérique du Nord-Est', shortLabel: 'New York', capitalName: 'New York', capitalStationId: 'nyc-us', lat: 40.71, lon: -74.00, currentCode: 1, afternoonCode: 1, tomorrowCode: 0, currentTemp: 20, afternoonTemp: 22, tomorrowTemp: 21 },
  { id: 'wm-na-w', name: 'Côte Ouest Nord-Américaine', shortLabel: 'Los Angeles', capitalName: 'Los Angeles', capitalStationId: 'la-us', lat: 36.50, lon: -119.50, currentCode: 0, afternoonCode: 0, tomorrowCode: 0, currentTemp: 24, afternoonTemp: 26, tomorrowTemp: 25 },
  { id: 'wm-sa', name: 'Amérique du Sud', shortLabel: 'São Paulo', capitalName: 'São Paulo', capitalStationId: 'saopaulo-br', lat: -22.90, lon: -45.00, currentCode: 1, afternoonCode: 2, tomorrowCode: 1, currentTemp: 25, afternoonTemp: 27, tomorrowTemp: 26 },
  { id: 'wm-af-n', name: 'Afrique du Nord & Sahara', shortLabel: 'Le Caire', capitalName: 'Le Caire', capitalStationId: 'cairo-eg', lat: 28.00, lon: 12.00, currentCode: 0, afternoonCode: 0, tomorrowCode: 0, currentTemp: 31, afternoonTemp: 34, tomorrowTemp: 32 },
  { id: 'wm-af-s', name: 'Afrique Australe', shortLabel: 'Johannesburg', capitalName: 'Johannesburg', capitalStationId: 'joburg-za', lat: -26.20, lon: 28.04, currentCode: 0, afternoonCode: 1, tomorrowCode: 0, currentTemp: 22, afternoonTemp: 25, tomorrowTemp: 23 },
  { id: 'wm-as-s', name: 'Asie du Sud', shortLabel: 'New Delhi', capitalName: 'New Delhi', capitalStationId: 'delhi-in', lat: 23.00, lon: 78.00, currentCode: 1, afternoonCode: 2, tomorrowCode: 1, currentTemp: 30, afternoonTemp: 32, tomorrowTemp: 31 },
  { id: 'wm-as-e', name: 'Asie de l’Est', shortLabel: 'Tokyo', capitalName: 'Tokyo', capitalStationId: 'tokyo-jp', lat: 35.68, lon: 139.65, currentCode: 1, afternoonCode: 1, tomorrowCode: 1, currentTemp: 22, afternoonTemp: 24, tomorrowTemp: 23 },
  { id: 'wm-oc', name: 'Océanie & Australie', shortLabel: 'Sydney', capitalName: 'Sydney', capitalStationId: 'sydney-au', lat: -31.00, lon: 147.00, currentCode: 0, afternoonCode: 1, tomorrowCode: 0, currentTemp: 21, afternoonTemp: 23, tomorrowTemp: 22 },
];

// Cadre géographique équilibré pour toute la France métropolitaine + Corse avec marges confortables
const FRANCE_BOUNDS: L.LatLngBoundsLiteral = [
  [41.4, -5.0],
  [51.1, 9.6]
];

const COUNTRY_MAP_PROFILES: Record<string, { labelFr: string; bounds: L.LatLngBoundsLiteral }> = {
  'france': { labelFr: 'France', bounds: FRANCE_BOUNDS },
  'fr': { labelFr: 'France', bounds: FRANCE_BOUNDS },
  'united kingdom': { labelFr: 'Royaume-Uni', bounds: [[49.8, -8.6], [58.7, 1.8]] },
  'royaume-uni': { labelFr: 'Royaume-Uni', bounds: [[49.8, -8.6], [58.7, 1.8]] },
  'uk': { labelFr: 'Royaume-Uni', bounds: [[49.8, -8.6], [58.7, 1.8]] },
  'gb': { labelFr: 'Royaume-Uni', bounds: [[49.8, -8.6], [58.7, 1.8]] },
  'great britain': { labelFr: 'Royaume-Uni', bounds: [[49.8, -8.6], [58.7, 1.8]] },
  'england': { labelFr: 'Royaume-Uni', bounds: [[49.8, -8.6], [58.7, 1.8]] },
  'angleterre': { labelFr: 'Royaume-Uni', bounds: [[49.8, -8.6], [58.7, 1.8]] },
  'scotland': { labelFr: 'Royaume-Uni', bounds: [[49.8, -8.6], [58.7, 1.8]] },
  'écosse': { labelFr: 'Royaume-Uni', bounds: [[49.8, -8.6], [58.7, 1.8]] },
  'wales': { labelFr: 'Royaume-Uni', bounds: [[49.8, -8.6], [58.7, 1.8]] },
  'spain': { labelFr: 'Espagne', bounds: [[36.0, -9.3], [43.8, 3.3]] },
  'espagne': { labelFr: 'Espagne', bounds: [[36.0, -9.3], [43.8, 3.3]] },
  'es': { labelFr: 'Espagne', bounds: [[36.0, -9.3], [43.8, 3.3]] },
  'italy': { labelFr: 'Italie', bounds: [[36.6, 6.6], [47.1, 18.5]] },
  'italie': { labelFr: 'Italie', bounds: [[36.6, 6.6], [47.1, 18.5]] },
  'it': { labelFr: 'Italie', bounds: [[36.6, 6.6], [47.1, 18.5]] },
  'germany': { labelFr: 'Allemagne', bounds: [[47.2, 5.8], [55.1, 15.0]] },
  'allemagne': { labelFr: 'Allemagne', bounds: [[47.2, 5.8], [55.1, 15.0]] },
  'de': { labelFr: 'Allemagne', bounds: [[47.2, 5.8], [55.1, 15.0]] },
  'switzerland': { labelFr: 'Suisse', bounds: [[45.8, 5.9], [47.8, 10.5]] },
  'suisse': { labelFr: 'Suisse', bounds: [[45.8, 5.9], [47.8, 10.5]] },
  'ch': { labelFr: 'Suisse', bounds: [[45.8, 5.9], [47.8, 10.5]] },
  'belgium': { labelFr: 'Belgique', bounds: [[49.5, 2.5], [51.5, 6.4]] },
  'belgique': { labelFr: 'Belgique', bounds: [[49.5, 2.5], [51.5, 6.4]] },
  'be': { labelFr: 'Belgique', bounds: [[49.5, 2.5], [51.5, 6.4]] },
  'netherlands': { labelFr: 'Pays-Bas', bounds: [[50.7, 3.3], [53.5, 7.2]] },
  'pays-bas': { labelFr: 'Pays-Bas', bounds: [[50.7, 3.3], [53.5, 7.2]] },
  'nl': { labelFr: 'Pays-Bas', bounds: [[50.7, 3.3], [53.5, 7.2]] },
  'portugal': { labelFr: 'Portugal', bounds: [[36.9, -9.5], [42.2, -6.2]] },
  'pt': { labelFr: 'Portugal', bounds: [[36.9, -9.5], [42.2, -6.2]] },
  'austria': { labelFr: 'Autriche', bounds: [[46.3, 9.5], [49.0, 17.2]] },
  'autriche': { labelFr: 'Autriche', bounds: [[46.3, 9.5], [49.0, 17.2]] },
  'at': { labelFr: 'Autriche', bounds: [[46.3, 9.5], [49.0, 17.2]] },
  'ireland': { labelFr: 'Irlande', bounds: [[51.4, -10.5], [55.4, -6.0]] },
  'irlande': { labelFr: 'Irlande', bounds: [[51.4, -10.5], [55.4, -6.0]] },
  'ie': { labelFr: 'Irlande', bounds: [[51.4, -10.5], [55.4, -6.0]] },
  'greece': { labelFr: 'Grèce', bounds: [[34.8, 19.3], [41.7, 28.2]] },
  'grèce': { labelFr: 'Grèce', bounds: [[34.8, 19.3], [41.7, 28.2]] },
  'gr': { labelFr: 'Grèce', bounds: [[34.8, 19.3], [41.7, 28.2]] },
  'morocco': { labelFr: 'Maroc', bounds: [[27.6, -13.2], [35.9, -1.0]] },
  'maroc': { labelFr: 'Maroc', bounds: [[27.6, -13.2], [35.9, -1.0]] },
  'ma': { labelFr: 'Maroc', bounds: [[27.6, -13.2], [35.9, -1.0]] },
  'algeria': { labelFr: 'Algérie', bounds: [[28.0, -2.2], [37.1, 8.7]] },
  'algérie': { labelFr: 'Algérie', bounds: [[28.0, -2.2], [37.1, 8.7]] },
  'dz': { labelFr: 'Algérie', bounds: [[28.0, -2.2], [37.1, 8.7]] },
  'tunisia': { labelFr: 'Tunisie', bounds: [[32.0, 7.5], [37.5, 11.6]] },
  'tunisie': { labelFr: 'Tunisie', bounds: [[32.0, 7.5], [37.5, 11.6]] },
  'tn': { labelFr: 'Tunisie', bounds: [[32.0, 7.5], [37.5, 11.6]] },
  'united states': { labelFr: 'États-Unis', bounds: [[24.5, -125.0], [49.4, -66.9]] },
  'états-unis': { labelFr: 'États-Unis', bounds: [[24.5, -125.0], [49.4, -66.9]] },
  'usa': { labelFr: 'États-Unis', bounds: [[24.5, -125.0], [49.4, -66.9]] },
  'us': { labelFr: 'États-Unis', bounds: [[24.5, -125.0], [49.4, -66.9]] },
  'canada': { labelFr: 'Canada', bounds: [[42.0, -130.0], [60.0, -55.0]] },
  'ca': { labelFr: 'Canada', bounds: [[42.0, -130.0], [60.0, -55.0]] },
  'japan': { labelFr: 'Japon', bounds: [[31.0, 129.5], [45.0, 145.5]] },
  'japon': { labelFr: 'Japon', bounds: [[31.0, 129.5], [45.0, 145.5]] },
  'jp': { labelFr: 'Japon', bounds: [[31.0, 129.5], [45.0, 145.5]] },
  'australia': { labelFr: 'Australie', bounds: [[-43.6, 113.3], [-10.7, 153.6]] },
  'australie': { labelFr: 'Australie', bounds: [[-43.6, 113.3], [-10.7, 153.6]] },
  'au': { labelFr: 'Australie', bounds: [[-43.6, 113.3], [-10.7, 153.6]] },
  'brazil': { labelFr: 'Brésil', bounds: [[-33.7, -73.9], [5.2, -34.7]] },
  'brésil': { labelFr: 'Brésil', bounds: [[-33.7, -73.9], [5.2, -34.7]] },
  'br': { labelFr: 'Brésil', bounds: [[-33.7, -73.9], [5.2, -34.7]] },
  'poland': { labelFr: 'Pologne', bounds: [[49.0, 14.1], [54.8, 24.1]] },
  'pologne': { labelFr: 'Pologne', bounds: [[49.0, 14.1], [54.8, 24.1]] },
  'pl': { labelFr: 'Pologne', bounds: [[49.0, 14.1], [54.8, 24.1]] },
  'norway': { labelFr: 'Norvège', bounds: [[57.9, 4.6], [71.2, 31.1]] },
  'norvège': { labelFr: 'Norvège', bounds: [[57.9, 4.6], [71.2, 31.1]] },
  'no': { labelFr: 'Norvège', bounds: [[57.9, 4.6], [71.2, 31.1]] },
  'sweden': { labelFr: 'Suède', bounds: [[55.3, 11.1], [69.1, 24.2]] },
  'suède': { labelFr: 'Suède', bounds: [[55.3, 11.1], [69.1, 24.2]] },
  'se': { labelFr: 'Suède', bounds: [[55.3, 11.1], [69.1, 24.2]] },
};

function buildDynamicZonesForCountry(station: LocationPoint, labelFr: string, bounds: L.LatLngBoundsLiteral): RegionWeather[] {
  const [[minLat, minLon], [maxLat, maxLon]] = bounds as [[number, number], [number, number]];
  const centerLat = (minLat + maxLat) / 2;
  const centerLon = (minLon + maxLon) / 2;
  const dLat = (maxLat - minLat) * 0.28;
  const dLon = (maxLon - minLon) * 0.28;

  return [
    { id: 'dyn-c', name: `${labelFr} — Centre (${station.name})`, shortLabel: station.name, capitalName: station.name, capitalStationId: station.id, lat: station.latitude || centerLat, lon: station.longitude || centerLon, currentCode: 1, afternoonCode: 1, tomorrowCode: 1, currentTemp: 20, afternoonTemp: 22, tomorrowTemp: 21 },
    { id: 'dyn-n', name: `${labelFr} — Zone Nord`, shortLabel: 'Nord', capitalName: `${labelFr} Nord`, capitalStationId: `${labelFr}-nord`, lat: centerLat + dLat, lon: centerLon, currentCode: 1, afternoonCode: 2, tomorrowCode: 1, currentTemp: 18, afternoonTemp: 20, tomorrowTemp: 19 },
    { id: 'dyn-nw', name: `${labelFr} — Zone Nord-Ouest`, shortLabel: 'Nord-Ouest', capitalName: `${labelFr} Nord-Ouest`, capitalStationId: `${labelFr}-nw`, lat: centerLat + dLat * 0.72, lon: centerLon - dLon, currentCode: 2, afternoonCode: 2, tomorrowCode: 1, currentTemp: 18, afternoonTemp: 20, tomorrowTemp: 19 },
    { id: 'dyn-ne', name: `${labelFr} — Zone Nord-Est`, shortLabel: 'Nord-Est', capitalName: `${labelFr} Nord-Est`, capitalStationId: `${labelFr}-ne`, lat: centerLat + dLat * 0.72, lon: centerLon + dLon, currentCode: 1, afternoonCode: 1, tomorrowCode: 1, currentTemp: 19, afternoonTemp: 21, tomorrowTemp: 20 },
    { id: 'dyn-sw', name: `${labelFr} — Zone Sud-Ouest`, shortLabel: 'Sud-Ouest', capitalName: `${labelFr} Sud-Ouest`, capitalStationId: `${labelFr}-sw`, lat: centerLat - dLat * 0.72, lon: centerLon - dLon, currentCode: 0, afternoonCode: 1, tomorrowCode: 0, currentTemp: 21, afternoonTemp: 23, tomorrowTemp: 22 },
    { id: 'dyn-se', name: `${labelFr} — Zone Sud-Est`, shortLabel: 'Sud-Est', capitalName: `${labelFr} Sud-Est`, capitalStationId: `${labelFr}-se`, lat: centerLat - dLat * 0.72, lon: centerLon + dLon, currentCode: 0, afternoonCode: 1, tomorrowCode: 0, currentTemp: 21, afternoonTemp: 23, tomorrowTemp: 22 },
    { id: 'dyn-s', name: `${labelFr} — Zone Sud`, shortLabel: 'Sud', capitalName: `${labelFr} Sud`, capitalStationId: `${labelFr}-sud`, lat: centerLat - dLat, lon: centerLon, currentCode: 0, afternoonCode: 0, tomorrowCode: 0, currentTemp: 22, afternoonTemp: 24, tomorrowTemp: 23 },
  ];
}

function resolveStationCountryProfile(station: LocationPoint): { isFrance: boolean; labelFr: string; bounds: L.LatLngBoundsLiteral; regions: RegionWeather[] } {
  const rawCountry = (station.country || '').trim();
  const lowerCountry = rawCountry.toLowerCase();
  const lowerCode = (station.countryCode || '').trim().toLowerCase();
  const lowerName = (station.name || '').toLowerCase();

  if (
    lowerName.includes('londres') ||
    lowerName === 'london' ||
    lowerCode === 'gb' ||
    lowerCode === 'uk'
  ) {
    const ukBounds = COUNTRY_MAP_PROFILES['royaume-uni'].bounds;
    return { isFrance: false, labelFr: 'Royaume-Uni', bounds: ukBounds, regions: UK_REGIONS };
  }

  if (
    station.latitude >= 49.9 &&
    station.latitude <= 59.0 &&
    station.longitude >= -8.2 &&
    station.longitude <= 1.8 &&
    lowerCountry !== 'france' &&
    lowerCode !== 'fr' &&
    lowerCountry !== 'irlande' &&
    lowerCountry !== 'ireland'
  ) {
    const ukBounds = COUNTRY_MAP_PROFILES['royaume-uni'].bounds;
    return { isFrance: false, labelFr: 'Royaume-Uni', bounds: ukBounds, regions: UK_REGIONS };
  }

  if (!rawCountry || lowerCountry === 'france' || lowerCountry === 'fr' || lowerCode === 'fr') {
    return { isFrance: true, labelFr: 'France', bounds: FRANCE_BOUNDS, regions: FRANCE_REGIONS };
  }

  const profileMatch = COUNTRY_MAP_PROFILES[lowerCountry] || (lowerCode ? COUNTRY_MAP_PROFILES[lowerCode] : undefined);
  if (profileMatch) {
    const labelKey = profileMatch.labelFr.toLowerCase();
    const regions = COUNTRY_REGIONS_CATALOG[labelKey] || buildDynamicZonesForCountry(station, profileMatch.labelFr, profileMatch.bounds);
    return {
      isFrance: labelKey === 'france',
      labelFr: profileMatch.labelFr,
      bounds: profileMatch.bounds,
      regions,
    };
  }

  const lat = station.latitude || 46.5;
  const lon = station.longitude || 2.5;
  const fallbackBounds: L.LatLngBoundsLiteral = [
    [Math.max(-85, lat - 4.2), lon - 5.5],
    [Math.min(85, lat + 4.2), lon + 5.5],
  ];
  return {
    isFrance: false,
    labelFr: rawCountry,
    bounds: fallbackBounds,
    regions: buildDynamicZonesForCountry(station, rawCountry, fallbackBounds),
  };
}

// Algorithme d'anti-collision en espace écran (pixels) pour garantir que les logos météo ne se chevauchent jamais
function computeNonOverlappingLatLngs(
  map: L.Map,
  items: { id: string; lat: number; lon: number; isPriority?: boolean }[],
  minDistX = 56,
  minDistY = 38
): Record<string, [number, number]> {
  const result: Record<string, [number, number]> = {};
  const mapSize = map.getSize();
  if (mapSize.x <= 0 || mapSize.y <= 0) {
    items.forEach(it => {
      result[it.id] = [it.lat, it.lon];
    });
    return result;
  }

  const pts = items.map(it => {
    const p = map.latLngToContainerPoint([it.lat, it.lon]);
    return {
      id: it.id,
      x: p.x,
      y: p.y,
      origX: p.x,
      origY: p.y,
      isPriority: Boolean(it.isPriority),
    };
  });

  const padX = 28;
  const padY = 22;

  for (let iter = 0; iter < 18; iter++) {
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const a = pts[i];
        const b = pts[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);

        if (absDx < minDistX && absDy < minDistY) {
          const overlapX = (minDistX - absDx) * 0.35;
          const overlapY = (minDistY - absDy) * 0.35;
          const signX = dx >= 0 ? 1 : -1;
          const signY = dy >= 0 ? 1 : -1;

          // Déplacer selon l'axe où le chevauchement relatif est le plus faible
          if (absDx / minDistX > absDy / minDistY) {
            if (a.isPriority && !b.isPriority) {
              b.x += signX * overlapX * 1.6;
            } else if (b.isPriority && !a.isPriority) {
              a.x -= signX * overlapX * 1.6;
            } else {
              a.x -= signX * overlapX;
              b.x += signX * overlapX;
            }
          } else {
            if (a.isPriority && !b.isPriority) {
              b.y += signY * overlapY * 1.6;
            } else if (b.isPriority && !a.isPriority) {
              a.y -= signY * overlapY * 1.6;
            } else {
              a.y -= signY * overlapY;
              b.y += signY * overlapY;
            }
          }
        }
      }
    }

    // Rappel élastique doux vers la position géographique réelle + maintien dans le cadre
    for (const p of pts) {
      p.x += (p.origX - p.x) * 0.12;
      p.y += (p.origY - p.y) * 0.12;
      p.x = Math.max(padX, Math.min(mapSize.x - padX, p.x));
      p.y = Math.max(padY, Math.min(mapSize.y - padY, p.y));
    }
  }

  for (const p of pts) {
    const ll = map.containerPointToLatLng([p.x, p.y]);
    result[p.id] = [ll.lat, ll.lng];
  }

  return result;
}

export const FranceMiniOverviewCard: React.FC<FranceMiniOverviewCardProps> = ({
  currentStation,
  tempUnit = 'C',
  onSelectStation,
}) => {
  const [selectedSlot, setSelectedSlot] = useState<'current' | 'afternoon' | 'tomorrow'>('current');
  const countryProfile = resolveStationCountryProfile(currentStation);
  const [regionsData, setRegionsData] = useState<RegionWeather[]>(countryProfile.regions);
  const [isExpandedPc, setIsExpandedPc] = useState<boolean>(false);
  const [mapScope, setMapScope] = useState<'country' | 'city' | 'world'>('country');
  const [mapLayerStyle, setMapLayerStyle] = useState<'satellite' | 'dark'>('satellite');
  const [zoomVersion, setZoomVersion] = useState<number>(0);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const labelsLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const formatTempVal = (c: number) => {
    if (tempUnit === 'F') return `${Math.round(c * 9 / 5 + 32)}°`;
    return `${Math.round(c)}°`;
  };

  useEffect(() => {
    setMapScope('country');
  }, [currentStation.id, currentStation.name, currentStation.country]);

  // Fetch live weather codes for all zones of the active country (or world zones when in World tab)
  useEffect(() => {
    let isCancelled = false;
    const baseRegions = mapScope === 'world' ? WORLD_MACRO_ZONES : countryProfile.regions;

    setRegionsData(baseRegions);

    const fetchLiveRegions = async () => {
      try {
        const lats = baseRegions.map(r => r.lat).join(',');
        const lons = baseRegions.map(r => r.lon).join(',');
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}&current=temperature_2m,weather_code&daily=temperature_2m_max,weather_code&timezone=auto`;
        
        const res = await fetch(url);
        if (!res.ok) return;
        const data = await res.json();

        const items = Array.isArray(data) ? data : [data];
        if (!isCancelled) {
          const updated = baseRegions.map((reg, idx) => {
            const item = items[idx];
            if (!item) return reg;
            const curCode = item.current?.weather_code ?? reg.currentCode;
            const curT = item.current?.temperature_2m ?? reg.currentTemp;
            const dailyCodes = item.daily?.weather_code ?? [];
            const dailyMax = item.daily?.temperature_2m_max ?? [];

            return {
              ...reg,
              currentCode: curCode,
              afternoonCode: dailyCodes[0] ?? curCode,
              tomorrowCode: dailyCodes[1] ?? dailyCodes[0] ?? curCode,
              currentTemp: Math.round(curT),
              afternoonTemp: Math.round(dailyMax[0] ?? curT + 2),
              tomorrowTemp: Math.round(dailyMax[1] ?? curT + 1)
            };
          });
          setRegionsData(updated);
        }
      } catch {
        // Retain fallback data smoothly
      }
    };

    fetchLiveRegions();
    return () => { isCancelled = true; };
  }, [countryProfile.labelFr, mapScope]);

  // Logos météo vectoriels riches 3D (haute lisibilité type Météo-France / Chaîne Météo HD)
  const getWeatherSymbolSvg = (code: number) => {
    // 0 = Plein Soleil radieux
    if (code === 0) {
      return `
        <svg class="w-5 h-5 shrink-0 drop-shadow-[0_1px_3px_rgba(245,158,11,0.55)]" viewBox="0 0 28 28" fill="none">
          <circle cx="14" cy="14" r="10" fill="#fbbf24" fill-opacity="0.22"/>
          <g stroke="#fbbf24" stroke-width="2" stroke-linecap="round">
            <line x1="14" y1="2.5" x2="14" y2="5"/>
            <line x1="14" y1="23" x2="14" y2="25.5"/>
            <line x1="2.5" y1="14" x2="5" y2="14"/>
            <line x1="23" y1="14" x2="25.5" y2="14"/>
            <line x1="5.8" y1="5.8" x2="7.6" y2="7.6"/>
            <line x1="20.4" y1="20.4" x2="22.2" y2="22.2"/>
            <line x1="22.2" y1="5.8" x2="20.4" y2="7.6"/>
            <line x1="7.6" y1="20.4" x2="5.8" y2="22.2"/>
          </g>
          <circle cx="14" cy="14" r="6.2" fill="#facc15" stroke="#f59e0b" stroke-width="1.2"/>
          <circle cx="12.2" cy="12.2" r="2" fill="#fef9c3" fill-opacity="0.7"/>
        </svg>
      `;
    }
    // 1, 2 = Éclaircies / Peu nuageux (Soleil + Nuage nacré)
    if (code === 1 || code === 2) {
      return `
        <svg class="w-5 h-5 shrink-0 drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]" viewBox="0 0 28 28" fill="none">
          <g stroke="#fbbf24" stroke-width="1.8" stroke-linecap="round">
            <line x1="9.5" y1="3" x2="9.5" y2="5"/>
            <line x1="3" y1="9.5" x2="5" y2="9.5"/>
            <line x1="4.8" y1="4.8" x2="6.3" y2="6.3"/>
            <line x1="14.2" y1="4.8" x2="12.7" y2="6.3"/>
          </g>
          <circle cx="10" cy="10.5" r="4.8" fill="#facc15" stroke="#f59e0b" stroke-width="1"/>
          <path d="M10.5 22.5H20.5C23 22.5 25 20.6 25 18.2C25 16 23.3 14.2 21.1 14C20.4 10.9 17.6 8.8 14.4 8.8C11.1 8.8 8.3 11.2 7.8 14.4C5.9 14.8 4.5 16.4 4.5 18.4C4.5 20.7 6.4 22.5 8.8 22.5H10.5Z" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.1"/>
        </svg>
      `;
    }
    // 3 = Couvert / Nuageux
    if (code === 3) {
      return `
        <svg class="w-5 h-5 shrink-0 drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]" viewBox="0 0 28 28" fill="none">
          <path d="M11 19.5H21.5C23.7 19.5 25.5 17.8 25.5 15.6C25.5 13.6 23.9 11.9 21.9 11.7C21.2 9 18.7 7 15.8 7C12.7 7 10.2 9.2 9.7 12.1C8 12.5 6.8 14 6.8 15.8C6.8 17.9 8.5 19.5 10.6 19.5H11Z" fill="#94a3b8" fill-opacity="0.75"/>
          <path d="M8.5 22.5H19.5C22 22.5 24 20.6 24 18.2C24 16 22.3 14.2 20.1 14C19.4 11 16.7 9 13.5 9C10.2 9 7.5 11.3 7 14.5C5.1 14.9 3.8 16.5 3.8 18.5C3.8 20.7 5.7 22.5 8.5 22.5Z" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.1"/>
        </svg>
      `;
    }
    // 45, 48 = Brouillard
    if (code === 45 || code === 48) {
      return `
        <svg class="w-5 h-5 shrink-0 drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]" viewBox="0 0 28 28" fill="none">
          <path d="M8.5 16.5H19.5C21.5 16.5 23 15 23 13C23 11.1 21.5 9.6 19.7 9.5C19 7.2 16.8 5.5 14.2 5.5C11.4 5.5 9.1 7.5 8.7 10.2C7.1 10.5 6 11.8 6 13.5C6 15.2 7.1 16.5 8.5 16.5Z" fill="#cbd5e1"/>
          <g stroke="#94a3b8" stroke-width="2" stroke-linecap="round">
            <line x1="5" y1="19.5" x2="23" y2="19.5"/>
            <line x1="7" y1="23" x2="21" y2="23"/>
          </g>
        </svg>
      `;
    }
    // 51 to 67, 80 to 82 = Pluie / Averses
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
      return `
        <svg class="w-5 h-5 shrink-0 drop-shadow-[0_1px_2px_rgba(14,165,233,0.45)]" viewBox="0 0 28 28" fill="none">
          <path d="M8.5 18.5H19.5C21.8 18.5 23.6 16.8 23.6 14.6C23.6 12.6 22 10.9 20 10.7C19.3 8 16.8 6 13.8 6C10.6 6 8 8.3 7.5 11.3C5.7 11.7 4.4 13.2 4.4 15C4.4 17 6.2 18.5 8.5 18.5Z" fill="#cbd5e1" stroke="#64748b" stroke-width="1"/>
          <g stroke="#38bdf8" stroke-width="2" stroke-linecap="round">
            <line x1="9.5" y1="20.5" x2="8" y2="25"/>
            <line x1="14" y1="20.5" x2="12.5" y2="25"/>
            <line x1="18.5" y1="20.5" x2="17" y2="25"/>
          </g>
        </svg>
      `;
    }
    // 71 to 77, 85 to 86 = Neige
    if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) {
      return `
        <svg class="w-5 h-5 shrink-0 drop-shadow-[0_1px_2px_rgba(56,189,248,0.5)]" viewBox="0 0 28 28" fill="none">
          <path d="M8.5 18H19.5C21.8 18 23.6 16.3 23.6 14.1C23.6 12.1 22 10.4 20 10.2C19.3 7.5 16.8 5.5 13.8 5.5C10.6 5.5 8 7.8 7.5 10.8C5.7 11.2 4.4 12.7 4.4 14.5C4.4 16.5 6.2 18 8.5 18Z" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1"/>
          <circle cx="9.5" cy="22" r="1.6" fill="#7dd3fc"/>
          <circle cx="14" cy="24" r="1.6" fill="#38bdf8"/>
          <circle cx="18.5" cy="22" r="1.6" fill="#7dd3fc"/>
        </svg>
      `;
    }
    // 95 to 99 = Orage
    if (code >= 95) {
      return `
        <svg class="w-5 h-5 shrink-0 drop-shadow-[0_1px_3px_rgba(245,158,11,0.55)]" viewBox="0 0 28 28" fill="none">
          <path d="M8.5 18H19.5C21.8 18 23.6 16.3 23.6 14.1C23.6 12.1 22 10.4 20 10.2C19.3 7.5 16.8 5.5 13.8 5.5C10.6 5.5 8 7.8 7.5 10.8C5.7 11.2 4.4 12.7 4.4 14.5C4.4 16.5 6.2 18 8.5 18Z" fill="#64748b" stroke="#475569" stroke-width="1"/>
          <polygon points="15,15 10.5,21 14,21 12.5,26.5 18.5,19.5 14.8,19.5" fill="#facc15" stroke="#f59e0b" stroke-width="0.6"/>
        </svg>
      `;
    }
    return `
      <svg class="w-5 h-5 shrink-0" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="6" fill="#facc15" stroke="#f59e0b" stroke-width="1.2"/>
      </svg>
    `;
  };

  const getWeatherLabel = (code: number) => {
    if (code === 0) return 'Plein Soleil';
    if (code === 1) return 'Ensoleillé';
    if (code === 2) return 'Éclaircies';
    if (code === 3) return 'Couvert';
    if (code === 45 || code === 48) return 'Brouillard';
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'Pluie / Averses';
    if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return 'Neige';
    if (code >= 95) return 'Orage';
    return 'Ensoleillé';
  };

  // Couleur thermique subtile pour la pastille de température
  const getTempAccentClasses = (tempC: number, isActive: boolean) => {
    if (isActive) {
      return 'bg-gradient-to-br from-sky-500 to-blue-700 text-white border-sky-300 ring-2 ring-sky-400/70 shadow-[0_4px_14px_rgba(14,165,233,0.55)]';
    }
    if (tempC >= 28) {
      return 'bg-slate-950/90 text-amber-200 border-amber-400/70 shadow-[0_3px_10px_rgba(0,0,0,0.55)]';
    }
    if (tempC <= 5) {
      return 'bg-slate-950/90 text-cyan-200 border-cyan-400/70 shadow-[0_3px_10px_rgba(0,0,0,0.55)]';
    }
    return 'bg-slate-950/88 text-white border-white/30 shadow-[0_3px_10px_rgba(0,0,0,0.55)]';
  };

  // Initialize Leaflet Map with High-Definition Cartography + Crisp Borders Overlay
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      try {
        const map = L.map(mapContainerRef.current, {
          center: [46.5, 2.5],
          zoom: 5.5,
          zoomControl: false,
          attributionControl: false,
          scrollWheelZoom: false,
          doubleClickZoom: true,
          touchZoom: true
        });

        // Fond Satellite HD Esri World Imagery
        const baseTileLayer = L.tileLayer(
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          {
            maxNativeZoom: 18,
            maxZoom: 19,
            attribution: '© Esri, Maxar, Earthstar Geographics'
          }
        );
        baseTileLayer.on('tileerror', () => {});
        baseTileLayer.addTo(map);
        tileLayerRef.current = baseTileLayer;

        // Calque des frontières et côtes nettes pour sublimer le repérage visuel des régions
        const referenceLayer = L.tileLayer(
          'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
          {
            maxNativeZoom: 18,
            maxZoom: 19,
            opacity: 0.45
          }
        );
        referenceLayer.on('tileerror', () => {});
        referenceLayer.addTo(map);
        labelsLayerRef.current = referenceLayer;

        // Markers Layer Group
        const markersGroup = L.layerGroup().addTo(map);
        markersLayerRef.current = markersGroup;

        // Recalculer l'anti-collision des logos lors d'un zoom ou déplacement
        map.on('zoomend moveend resize', () => {
          setZoomVersion(v => v + 1);
        });

        mapInstanceRef.current = map;

        const sz = map.getSize();
        if (countryProfile.bounds && sz.x > 0 && sz.y > 0) {
          map.fitBounds(countryProfile.bounds, { padding: [22, 22], animate: false });
        } else if (currentStation && currentStation.latitude && currentStation.longitude) {
          map.setView([currentStation.latitude, currentStation.longitude], 5.5, { animate: false });
        } else {
          map.setView([46.5, 2.5], 5.5, { animate: false });
        }
      } catch (err) {
        console.warn('[FranceMiniOverviewCard] Map init warning:', err);
      }
    }

    const refreshMapLayout = () => {
      if (!mapInstanceRef.current || !mapContainerRef.current) return;
      if (mapContainerRef.current.clientWidth === 0 || mapContainerRef.current.clientHeight === 0) return;
      try {
        mapInstanceRef.current.invalidateSize();
        if (mapScope === 'city' && currentStation?.latitude && currentStation?.longitude) {
          mapInstanceRef.current.setView([currentStation.latitude, currentStation.longitude], 9, { animate: false });
        } else if (mapScope === 'country') {
          if (countryProfile.bounds) {
            mapInstanceRef.current.fitBounds(countryProfile.bounds, { padding: [22, 22], animate: false });
          } else {
            mapInstanceRef.current.setView([currentStation?.latitude || 46.5, currentStation?.longitude || 2.5], 5.5, { animate: false });
          }
        } else {
          mapInstanceRef.current.setView([20, currentStation?.longitude || 0], 2, { animate: false });
        }
        setZoomVersion(v => v + 1);
      } catch {
        // Ignore transient layout errors
      }
    };

    let resizeObs: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && mapContainerRef.current) {
      resizeObs = new ResizeObserver(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
          setZoomVersion(v => v + 1);
        }
      });
      resizeObs.observe(mapContainerRef.current);
    }

    const timer1 = setTimeout(refreshMapLayout, 100);
    const timer2 = setTimeout(refreshMapLayout, 400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      if (resizeObs) resizeObs.disconnect();
    };
  }, []);

  // Changement de style de fond de carte (Satellite HD vs Sombre Cartographique)
  useEffect(() => {
    if (!tileLayerRef.current) return;
    if (mapLayerStyle === 'dark') {
      tileLayerRef.current.setUrl('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png');
      if (labelsLayerRef.current) labelsLayerRef.current.setOpacity(0);
    } else {
      tileLayerRef.current.setUrl('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}');
      if (labelsLayerRef.current) labelsLayerRef.current.setOpacity(0.45);
    }
  }, [mapLayerStyle]);

  // Update View when station changes or scope changes
  useEffect(() => {
    if (!mapInstanceRef.current || !mapContainerRef.current) return;
    const map = mapInstanceRef.current;
    const isVisible = mapContainerRef.current.clientWidth > 0 && mapContainerRef.current.clientHeight > 0;

    try {
      if (mapScope === 'city' && currentStation?.latitude && currentStation?.longitude) {
        if (isVisible) {
          map.flyTo([currentStation.latitude, currentStation.longitude], 9, { duration: 0.7 });
        } else {
          map.setView([currentStation.latitude, currentStation.longitude], 9, { animate: false });
        }
      } else if (mapScope === 'country') {
        if (countryProfile.bounds) {
          if (isVisible) {
            map.fitBounds(countryProfile.bounds, { padding: [22, 22] });
          } else {
            map.fitBounds(countryProfile.bounds, { padding: [22, 22], animate: false });
          }
        } else {
          map.setView([currentStation?.latitude || 46.5, currentStation?.longitude || 2.5], 5.5, { animate: false });
        }
      } else if (mapScope === 'world') {
        if (isVisible) {
          map.flyTo([20, currentStation?.longitude || 0], 2, { duration: 0.7 });
        } else {
          map.setView([20, currentStation?.longitude || 0], 2, { animate: false });
        }
      }
    } catch {
      // Fallback if container was resizing during flyTo
    }
  }, [currentStation.latitude, currentStation.longitude, currentStation.id, currentStation.country, mapScope]);

  // Placement intelligent & esthétique des logos météo sur la carte (sans double-offset ni chevauchement)
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    markersGroup.clearLayers();

    if (mapScope === 'country' || mapScope === 'world') {
      // Vérifie si la station active correspond déjà à l'un des chefs-lieux affichés
      let matchedRegionId: string | null = null;
      let minGeoDist = Infinity;

      regionsData.forEach(reg => {
        const dLat = (currentStation.latitude || 0) - reg.lat;
        const dLon = (currentStation.longitude || 0) - reg.lon;
        const dist = Math.sqrt(dLat * dLat + dLon * dLon);
        const nameMatch =
          (reg.capitalName && currentStation.name.toLowerCase().includes(reg.capitalName.toLowerCase())) ||
          currentStation.id === reg.capitalStationId;

        if (nameMatch || (dist < 0.65 && dist < minGeoDist)) {
          minGeoDist = dist;
          matchedRegionId = reg.id;
        }
      });

      // Si aucune ville proche à moins de 0.65°, vérifier la région administrative
      if (!matchedRegionId && currentStation.region) {
        const byRegName = regionsData.find(
          r =>
            r.name.toLowerCase().includes(currentStation.region!.toLowerCase()) ||
            currentStation.region!.toLowerCase().includes(r.name.toLowerCase())
        );
        if (byRegName) matchedRegionId = byRegName.id;
      }

      // Calcul des positions anti-collision en pixels pour un placement irréprochable
      const rawPoints = regionsData.map(r => ({
        id: r.id,
        lat: r.lat,
        lon: r.lon,
        isPriority: r.id === matchedRegionId
      }));

      // Si la commune active est distincte d'un chef-lieu (ex: Chamonix, Biarritz) et dans le pays, on l'intègre à l'anti-collision
      const showSeparateStationPin =
        mapScope === 'country' &&
        currentStation?.latitude &&
        currentStation?.longitude &&
        minGeoDist >= 0.65;

      if (showSeparateStationPin) {
        rawPoints.push({
          id: '__active_station__',
          lat: currentStation.latitude,
          lon: currentStation.longitude,
          isPriority: true
        });
      }

      const adjustedCoords = computeNonOverlappingLatLngs(map, rawPoints, 54, 38);

      regionsData.forEach(reg => {
        const isCurrentRegion = reg.id === matchedRegionId && !showSeparateStationPin;

        const code =
          selectedSlot === 'current'
            ? reg.currentCode
            : selectedSlot === 'afternoon'
            ? reg.afternoonCode
            : reg.tomorrowCode;

        const temp =
          selectedSlot === 'current'
            ? reg.currentTemp
            : selectedSlot === 'afternoon'
            ? reg.afternoonTemp
            : reg.tomorrowTemp;

        const symbolSvg = getWeatherSymbolSvg(code);
        const labelDesc = getWeatherLabel(code);
        const shortCity = reg.shortLabel || reg.capitalName || reg.name.split(' ')[0];
        const accentClasses = getTempAccentClasses(temp, isCurrentRegion);
        const [adjLat, adjLon] = adjustedCoords[reg.id] || [reg.lat, reg.lon];

        // Important: Pas de "-translate-x-1/2 -translate-y-1/2" en doublon avec iconAnchor !
        // Le conteneur fait exactement [56, 38] et iconAnchor [28, 19] centre le médaillon au pixel près.
        const html = `
          <div class="w-[56px] h-[38px] flex flex-col items-center justify-center cursor-pointer group select-none transition-transform duration-200 hover:scale-125 hover:z-50">
            <div class="flex items-center justify-center gap-0.5 px-1.5 py-0.5 rounded-full border backdrop-blur-md transition-all ${accentClasses}">
              ${symbolSvg}
              <span class="text-[11px] font-black tracking-tight tabular-nums leading-none pr-0.5">${formatTempVal(temp)}</span>
            </div>
            <span class="mt-0.5 px-1.5 py-[1px] rounded-full text-[8.5px] font-extrabold tracking-tight leading-none whitespace-nowrap shadow-sm transition-all ${
              isCurrentRegion
                ? 'bg-emerald-500 text-slate-950 font-black'
                : 'bg-slate-950/80 text-slate-200 group-hover:bg-sky-500 group-hover:text-slate-950'
            }">
              ${shortCity}
            </span>
          </div>
        `;

        const customIcon = L.divIcon({
          className: '!bg-transparent !border-0',
          html,
          iconSize: [56, 38],
          iconAnchor: [28, 19]
        });

        const marker = L.marker([adjLat, adjLon], {
          icon: customIcon,
          zIndexOffset: isCurrentRegion ? 900 : 200
        });

        marker.bindTooltip(
          `<div class="text-xs font-sans"><strong>${reg.name}</strong>${reg.capitalName ? ` (${reg.capitalName})` : ''}<br/>${labelDesc} • <strong>${formatTempVal(temp)}C</strong></div>`,
          {
            direction: 'top',
            offset: [0, -18],
            opacity: 0.96
          }
        );

        marker.on('click', () => {
          handleRegionClick(reg);
        });

        marker.addTo(markersGroup);
      });

      // Marqueur dédié si la ville sélectionnée est distincte des capitales régionales
      if (showSeparateStationPin) {
        const [stLat, stLon] = adjustedCoords['__active_station__'] || [
          currentStation.latitude,
          currentStation.longitude
        ];

        const stHtml = `
          <div class="w-[76px] h-[26px] flex items-center justify-center cursor-pointer select-none">
            <div class="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 border-2 border-white shadow-[0_3px_12px_rgba(16,185,129,0.7)] font-black text-[9.5px] whitespace-nowrap">
              <span class="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping"></span>
              <span class="truncate max-w-[54px]">${currentStation.name}</span>
            </div>
          </div>
        `;

        const stIcon = L.divIcon({
          className: '!bg-transparent !border-0',
          html: stHtml,
          iconSize: [76, 26],
          iconAnchor: [38, 13]
        });

        const stMarker = L.marker([stLat, stLon], {
          icon: stIcon,
          zIndexOffset: 1000
        });

        stMarker.bindTooltip(
          `<strong>📍 ${currentStation.name}</strong><br/>Station active (${currentStation.altitude}m)`,
          { direction: 'top', offset: [0, -14], opacity: 0.96 }
        );

        stMarker.addTo(markersGroup);
      }
    } else if (mapScope === 'city' && currentStation?.latitude && currentStation?.longitude) {
      // En vue "Ma Ville", afficher un grand badge météo centré avec icône + température + altitude
      const activeReg = regionsData[0];
      const code = activeReg
        ? selectedSlot === 'current'
          ? activeReg.currentCode
          : selectedSlot === 'afternoon'
          ? activeReg.afternoonCode
          : activeReg.tomorrowCode
        : 0;
      const temp = activeReg
        ? selectedSlot === 'current'
          ? activeReg.currentTemp
          : selectedSlot === 'afternoon'
          ? activeReg.afternoonTemp
          : activeReg.tomorrowTemp
        : 20;

      const symbolSvg = getWeatherSymbolSvg(code);

      const cityHtml = `
        <div class="w-[150px] h-[48px] flex flex-col items-center justify-center cursor-pointer">
          <div class="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-950/90 text-white border-2 border-sky-400 shadow-[0_6px_20px_rgba(14,165,233,0.55)] backdrop-blur-md">
            ${symbolSvg}
            <div class="flex flex-col leading-tight">
              <span class="text-xs font-black text-white truncate max-w-[85px]">${currentStation.name}</span>
              <span class="text-[10px] font-bold text-sky-300">${formatTempVal(temp)}C • ${currentStation.altitude || 75}m</span>
            </div>
          </div>
        </div>
      `;

      const cityIcon = L.divIcon({
        className: '!bg-transparent !border-0',
        html: cityHtml,
        iconSize: [150, 48],
        iconAnchor: [75, 24]
      });

      L.marker([currentStation.latitude, currentStation.longitude], {
        icon: cityIcon,
        zIndexOffset: 1000
      }).addTo(markersGroup);
    }
  }, [regionsData, selectedSlot, currentStation, mapScope, tempUnit, zoomVersion]);

  const handleRegionClick = (reg: RegionWeather) => {
    if (!onSelectStation) return;
    const foundFrench =
      FRENCH_STATIONS.find(s => s.id === reg.capitalStationId) ||
      FRENCH_STATIONS.find(s => s.region?.toLowerCase() === reg.name.toLowerCase());

    if (foundFrench) {
      onSelectStation(foundFrench);
      return;
    }

    const altitude = reg.altitude ?? 60;
    const targetCountry = mapScope === 'world' ? reg.name : countryProfile.labelFr;
    const zoneStation: LocationPoint = {
      id: reg.capitalStationId || `zone-${reg.id}`,
      name: reg.capitalName ? `${reg.capitalName} (${reg.name})` : reg.name,
      department: reg.name,
      region: reg.name,
      country: targetCountry,
      latitude: reg.lat,
      longitude: reg.lon,
      altitude,
      climateZone: `${targetCountry} — ${reg.name}`,
      allTimeRecordMax: 38.5,
      allTimeRecordMin: -15.0,
      allTimeRecordRain24h: 95.0,
      isFrench: false,
      isWorldLocation: true,
      isMountain: altitude >= 800,
      isHighAltitude: altitude >= 1500,
    };
    onSelectStation(zoneStation);
  };

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      if (mapScope === 'city') {
        mapInstanceRef.current.flyTo([currentStation.latitude, currentStation.longitude], 9);
      } else if (mapScope === 'country') {
        if (countryProfile.bounds) {
          mapInstanceRef.current.fitBounds(countryProfile.bounds, { padding: [22, 22] });
        } else {
          mapInstanceRef.current.setView([currentStation.latitude, currentStation.longitude], 5.5);
        }
      } else {
        mapInstanceRef.current.setView([20, currentStation?.longitude || 0], 2);
      }
    }
  };

  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    }
  };

  const handleToggleExpandPc = () => {
    setIsExpandedPc(prev => !prev);
    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
        if (!isExpandedPc) {
          mapInstanceRef.current.setZoom(mapInstanceRef.current.getZoom() + 0.5);
        }
      }
    }, 200);
  };

  // Synthèse thermique min/max des zones affichées
  const thermalStats = useMemo(() => {
    if (!regionsData.length) return { min: 15, max: 24, minCity: 'Brest', maxCity: 'Marseille' };
    let min = Infinity;
    let max = -Infinity;
    let minCity = '';
    let maxCity = '';
    for (const r of regionsData) {
      const t =
        selectedSlot === 'current'
          ? r.currentTemp
          : selectedSlot === 'afternoon'
          ? r.afternoonTemp
          : r.tomorrowTemp;
      if (t < min) {
        min = t;
        minCity = r.shortLabel || r.capitalName || r.name;
      }
      if (t > max) {
        max = t;
        maxCity = r.shortLabel || r.capitalName || r.name;
      }
    }
    return { min, max, minCity, maxCity };
  }, [regionsData, selectedSlot]);

  return (
    <div
      className={`h-full flex flex-col rounded-[24px] border border-slate-200 dark:border-slate-700/70 bg-white dark:bg-[#091224]/95 p-3 sm:p-3.5 shadow-xl backdrop-blur-xl relative overflow-hidden transition-all duration-300 ${
        isExpandedPc ? 'ring-2 ring-sky-500/60 shadow-2xl' : ''
      }`}
    >
      {/* En-tête de la Carte Météo Direct */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-200 dark:border-slate-800/90">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/15 border border-sky-500/30 text-sky-400 shrink-0 shadow-inner">
            <Compass className="h-4 w-4" />
          </div>
          <div className="truncate">
            <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white tracking-tight leading-none truncate">
              {mapScope === 'country'
                ? `Carte Météo Direct • ${countryProfile.labelFr}`
                : mapScope === 'world'
                ? 'Carte Météo Direct • Monde'
                : `Carte Météo Direct • ${currentStation.name}`}
            </h3>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              {mapScope === 'country'
                ? countryProfile.isFrance
                  ? `13 régions • Logos météo & températures en direct`
                  : `Synthèse météo par zone • ${countryProfile.labelFr} (${regionsData.length} zones)`
                : mapScope === 'world'
                ? `Synthèse atmosphérique mondiale (${regionsData.length} zones)`
                : `${currentStation.name} (${countryProfile.labelFr}) • ${currentStation.altitude}m`}
            </span>
          </div>
        </div>

        {/* Sélecteurs de cadrage & d'échéance */}
        <div className="flex items-center gap-1.5 flex-wrap shrink-0">
          {/* Scope Selector */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-900/95 rounded-lg p-0.5 border border-slate-200 dark:border-slate-800 text-[11px]">
            <button
              onClick={() => setMapScope('country')}
              className={`px-2 py-0.5 rounded-md font-bold transition cursor-pointer ${
                mapScope === 'country'
                  ? 'bg-sky-500 text-slate-950 font-black shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title={`Vue d'ensemble (${countryProfile.labelFr})`}
            >
              {countryProfile.labelFr}
            </button>
            <button
              onClick={() => setMapScope('city')}
              className={`px-2 py-0.5 rounded-md font-bold transition cursor-pointer ${
                mapScope === 'city'
                  ? 'bg-sky-500 text-slate-950 font-black shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Centrer sur ma ville sélectionnée"
            >
              Ma Ville
            </button>
            <button
              onClick={() => setMapScope('world')}
              className={`px-2 py-0.5 rounded-md font-bold transition cursor-pointer ${
                mapScope === 'world'
                  ? 'bg-sky-500 text-slate-950 font-black shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Vue d'ensemble de la Terre entière"
            >
              Monde
            </button>
          </div>

          {/* Time Slot Controls */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-900/95 rounded-lg p-0.5 border border-slate-200 dark:border-slate-800 text-[11px]">
            <button
              onClick={() => setSelectedSlot('current')}
              className={`px-2 py-0.5 rounded-md font-bold transition cursor-pointer ${
                selectedSlot === 'current'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Direct
            </button>
            <button
              onClick={() => setSelectedSlot('afternoon')}
              className={`px-2 py-0.5 rounded-md font-bold transition cursor-pointer ${
                selectedSlot === 'afternoon'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Après-midi
            </button>
            <button
              onClick={() => setSelectedSlot('tomorrow')}
              className={`px-2 py-0.5 rounded-md font-bold transition cursor-pointer ${
                selectedSlot === 'tomorrow'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Demain
            </button>
          </div>

          {/* Contrôles Zoom & Fond de carte */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900/95 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setMapLayerStyle(prev => (prev === 'satellite' ? 'dark' : 'satellite'))}
              title="Basculer le fond de carte (Satellite HD / Sombre Pro)"
              className="flex items-center justify-center h-6 w-6 rounded-md bg-white dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-sky-900/40 text-slate-700 dark:text-slate-200 hover:text-sky-400 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
            >
              <Layers className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleZoomIn}
              title="Zoomer sur la carte"
              aria-label="Zoomer"
              className="hidden sm:flex items-center justify-center h-6 w-6 rounded-md bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/40 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-700 transition active:scale-95 cursor-pointer"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleZoomOut}
              title="Dézoomer de la carte"
              aria-label="Dézoomer"
              className="hidden sm:flex items-center justify-center h-6 w-6 rounded-md bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/40 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-700 transition active:scale-95 cursor-pointer"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleToggleExpandPc}
              title={isExpandedPc ? 'Réduire la vue' : 'Agrandir le bloc (Vue HD)'}
              className={`hidden md:flex items-center gap-1 px-1.5 h-6 rounded-md text-[10px] font-bold border transition cursor-pointer ${
                isExpandedPc
                  ? 'bg-blue-600 text-white border-blue-500'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              {isExpandedPc ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
            </button>
            <button
              onClick={handleRecenter}
              title="Recentrer la carte"
              className="flex items-center justify-center h-6 w-6 rounded-md bg-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Conteneur de la Carte Interactive */}
      <div
        className={`relative w-full flex-1 rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-800 bg-slate-950 transition-all duration-300 shadow-inner ${
          isExpandedPc ? 'min-h-[380px] sm:min-h-[440px]' : 'min-h-[255px] sm:min-h-[290px]'
        }`}
      >
        <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-0" />

        {/* Vignette atmosphérique douce sur les bords pour faire ressortir les médaillons météo */}
        <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_28px_rgba(2,6,23,0.55)] z-[350]" />

        {/* Bandeau inférieur de synthèse thermique (Min / Max national) */}
        <div className="absolute bottom-2 left-2 right-2 z-[400] flex items-center justify-between gap-2 pointer-events-none">
          <div className="flex items-center gap-1.5 bg-slate-950/85 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] text-slate-200 border border-white/15 shadow-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold truncate max-w-[130px]">{currentStation.name}</span>
          </div>

          <div className="flex items-center gap-2 bg-slate-950/85 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] border border-white/15 shadow-lg">
            <span className="flex items-center gap-1 text-sky-300 font-bold">
              <Snowflake className="h-3 w-3 text-sky-400" />
              <span>{thermalStats.minCity} {formatTempVal(thermalStats.min)}</span>
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1 text-amber-300 font-bold">
              <Flame className="h-3 w-3 text-amber-400" />
              <span>{thermalStats.maxCity} {formatTempVal(thermalStats.max)}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
