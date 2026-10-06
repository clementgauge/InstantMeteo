import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { 
  Compass, 
  RotateCcw,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut
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

// The 13 Metropolitan Regions of France with representative centroid coordinates
const FRANCE_REGIONS: RegionWeather[] = [
  { id: 'hdf', name: 'Hauts-de-France', capitalName: 'Lille', capitalStationId: 'lille-lesquin', lat: 50.15, lon: 2.80, currentCode: 1, afternoonCode: 2, tomorrowCode: 1, currentTemp: 17, afternoonTemp: 19, tomorrowTemp: 18 },
  { id: 'nor', name: 'Normandie', capitalName: 'Caen', capitalStationId: 'caen-carpiquet', lat: 49.18, lon: 0.15, currentCode: 2, afternoonCode: 2, tomorrowCode: 1, currentTemp: 18, afternoonTemp: 20, tomorrowTemp: 19 },
  { id: 'idf', name: 'Île-de-France', capitalName: 'Paris', capitalStationId: 'paris-montsouris', lat: 48.72, lon: 2.45, currentCode: 0, afternoonCode: 1, tomorrowCode: 0, currentTemp: 21, afternoonTemp: 23, tomorrowTemp: 22 },
  { id: 'ges', name: 'Grand Est', capitalName: 'Strasbourg', capitalStationId: 'strasbourg-entzheim', lat: 48.70, lon: 5.50, currentCode: 1, afternoonCode: 1, tomorrowCode: 2, currentTemp: 20, afternoonTemp: 22, tomorrowTemp: 21 },
  { id: 'bre', name: 'Bretagne', capitalName: 'Rennes', capitalStationId: 'rennes-saint-jacques', lat: 48.15, lon: -2.80, currentCode: 2, afternoonCode: 3, tomorrowCode: 2, currentTemp: 17, afternoonTemp: 19, tomorrowTemp: 18 },
  { id: 'pdl', name: 'Pays de la Loire', capitalName: 'Nantes', capitalStationId: 'nantes-atlantique', lat: 47.45, lon: -0.65, currentCode: 0, afternoonCode: 1, tomorrowCode: 0, currentTemp: 20, afternoonTemp: 22, tomorrowTemp: 21 },
  { id: 'cvl', name: 'Centre-Val de Loire', capitalName: 'Bourges', capitalStationId: 'bourges', lat: 47.50, lon: 1.75, currentCode: 0, afternoonCode: 1, tomorrowCode: 0, currentTemp: 21, afternoonTemp: 23, tomorrowTemp: 22 },
  { id: 'bfc', name: 'Bourgogne-Franche-Comté', capitalName: 'Dijon', capitalStationId: 'dijon-longvic', lat: 47.10, lon: 4.80, currentCode: 0, afternoonCode: 1, tomorrowCode: 1, currentTemp: 20, afternoonTemp: 22, tomorrowTemp: 21 },
  { id: 'ara', name: 'Auvergne-Rhône-Alpes', capitalName: 'Lyon', capitalStationId: 'lyon-bron', lat: 45.45, lon: 4.30, currentCode: 0, afternoonCode: 0, tomorrowCode: 1, currentTemp: 23, afternoonTemp: 25, tomorrowTemp: 24 },
  { id: 'naq', name: 'Nouvelle-Aquitaine', capitalName: 'Bordeaux', capitalStationId: 'bordeaux-merignac', lat: 45.30, lon: 0.10, currentCode: 0, afternoonCode: 0, tomorrowCode: 0, currentTemp: 23, afternoonTemp: 25, tomorrowTemp: 24 },
  { id: 'occ', name: 'Occitanie', capitalName: 'Toulouse', capitalStationId: 'toulouse-blagnac', lat: 43.60, lon: 2.10, currentCode: 0, afternoonCode: 0, tomorrowCode: 0, currentTemp: 24, afternoonTemp: 26, tomorrowTemp: 25 },
  { id: 'pac', name: "Provence-Alpes-Côte d'Azur", capitalName: 'Marseille', capitalStationId: 'marseille-marignane', lat: 43.90, lon: 6.00, currentCode: 0, afternoonCode: 0, tomorrowCode: 0, currentTemp: 25, afternoonTemp: 27, tomorrowTemp: 26 },
  { id: 'cor', name: 'Corse', capitalName: 'Ajaccio', capitalStationId: 'ajaccio-campo-dell-oro', lat: 42.15, lon: 9.10, currentCode: 0, afternoonCode: 0, tomorrowCode: 0, currentTemp: 24, afternoonTemp: 26, tomorrowTemp: 25 },
];

// Zones météo du Royaume-Uni & Angleterre (Met Office Official Regions)
const UK_REGIONS: RegionWeather[] = [
  { id: 'uk-lon', name: 'Grand Londres & Sud-Est', capitalName: 'Londres', capitalStationId: 'london-uk', lat: 51.5074, lon: -0.1278, altitude: 25, currentCode: 1, afternoonCode: 2, tomorrowCode: 1, currentTemp: 16, afternoonTemp: 18, tomorrowTemp: 17 },
  { id: 'uk-sw', name: 'Angleterre Sud-Ouest & Cornouailles', capitalName: 'Bristol', capitalStationId: 'bristol-uk', lat: 50.95, lon: -3.45, altitude: 45, currentCode: 2, afternoonCode: 2, tomorrowCode: 1, currentTemp: 16, afternoonTemp: 17, tomorrowTemp: 16 },
  { id: 'uk-ea', name: "Est de l'Angleterre (East Anglia)", capitalName: 'Norwich', capitalStationId: 'norwich-uk', lat: 52.35, lon: 0.75, altitude: 30, currentCode: 1, afternoonCode: 1, tomorrowCode: 2, currentTemp: 16, afternoonTemp: 18, tomorrowTemp: 17 },
  { id: 'uk-mid', name: 'Midlands (Angleterre Centrale)', capitalName: 'Birmingham', capitalStationId: 'birmingham-uk', lat: 52.4862, lon: -1.8904, altitude: 140, currentCode: 2, afternoonCode: 2, tomorrowCode: 1, currentTemp: 15, afternoonTemp: 17, tomorrowTemp: 16 },
  { id: 'uk-wal', name: 'Pays de Galles (Wales)', capitalName: 'Cardiff', capitalStationId: 'cardiff-uk', lat: 52.05, lon: -3.65, altitude: 65, currentCode: 2, afternoonCode: 3, tomorrowCode: 2, currentTemp: 14, afternoonTemp: 16, tomorrowTemp: 15 },
  { id: 'uk-nw', name: 'Angleterre Nord-Ouest', capitalName: 'Manchester', capitalStationId: 'manchester-uk', lat: 53.55, lon: -2.35, altitude: 75, currentCode: 2, afternoonCode: 61, tomorrowCode: 2, currentTemp: 14, afternoonTemp: 16, tomorrowTemp: 15 },
  { id: 'uk-york', name: 'Yorkshire & Humber', capitalName: 'Leeds', capitalStationId: 'leeds-uk', lat: 53.95, lon: -1.35, altitude: 65, currentCode: 1, afternoonCode: 2, tomorrowCode: 1, currentTemp: 14, afternoonTemp: 16, tomorrowTemp: 15 },
  { id: 'uk-ne', name: 'Angleterre Nord-Est', capitalName: 'Newcastle', capitalStationId: 'newcastle-uk', lat: 54.97, lon: -1.75, altitude: 50, currentCode: 2, afternoonCode: 2, tomorrowCode: 1, currentTemp: 13, afternoonTemp: 15, tomorrowTemp: 14 },
  { id: 'uk-ni', name: 'Irlande du Nord', capitalName: 'Belfast', capitalStationId: 'belfast-uk', lat: 54.60, lon: -6.20, altitude: 35, currentCode: 2, afternoonCode: 61, tomorrowCode: 2, currentTemp: 13, afternoonTemp: 15, tomorrowTemp: 14 },
  { id: 'uk-sco-s', name: 'Écosse Centrale (Lowlands)', capitalName: 'Édimbourg', capitalStationId: 'edinburgh-uk', lat: 55.95, lon: -3.50, altitude: 60, currentCode: 2, afternoonCode: 3, tomorrowCode: 2, currentTemp: 12, afternoonTemp: 14, tomorrowTemp: 13 },
  { id: 'uk-sco-n', name: 'Écosse Nord (Highlands)', capitalName: 'Inverness', capitalStationId: 'inverness-uk', lat: 57.35, lon: -4.10, altitude: 120, currentCode: 3, afternoonCode: 61, tomorrowCode: 2, currentTemp: 11, afternoonTemp: 13, tomorrowTemp: 12 },
];

// Zones météo par pays majeurs (Europe, Maghreb, Amériques, Asie, Océanie)
const COUNTRY_REGIONS_CATALOG: Record<string, RegionWeather[]> = {
  'france': FRANCE_REGIONS,
  'royaume-uni': UK_REGIONS,
  'espagne': [
    { id: 'es-gal', name: 'Galice & Asturies', capitalName: 'Saint-Jacques-de-Compostelle', capitalStationId: 'santiago-es', lat: 42.95, lon: -7.80, currentCode: 2, afternoonCode: 2, tomorrowCode: 1, currentTemp: 18, afternoonTemp: 20, tomorrowTemp: 19 },
    { id: 'es-bas', name: 'Pays Basque & Navarre', capitalName: 'Bilbao', capitalStationId: 'bilbao-es', lat: 43.10, lon: -2.60, currentCode: 1, afternoonCode: 2, tomorrowCode: 1, currentTemp: 20, afternoonTemp: 22, tomorrowTemp: 21 },
    { id: 'es-cat', name: 'Catalogne', capitalName: 'Barcelone', capitalStationId: 'barcelona-es', lat: 41.55, lon: 1.85, currentCode: 0, afternoonCode: 1, tomorrowCode: 0, currentTemp: 24, afternoonTemp: 26, tomorrowTemp: 25 },
    { id: 'es-ara', name: 'Aragon', capitalName: 'Saragosse', capitalStationId: 'zaragoza-es', lat: 41.55, lon: -0.88, currentCode: 0, afternoonCode: 0, tomorrowCode: 1, currentTemp: 24, afternoonTemp: 27, tomorrowTemp: 25 },
    { id: 'es-mad', name: 'Madrid & Centre', capitalName: 'Madrid', capitalStationId: 'madrid-es', lat: 40.42, lon: -3.70, altitude: 650, currentCode: 0, afternoonCode: 0, tomorrowCode: 0, currentTemp: 25, afternoonTemp: 28, tomorrowTemp: 26 },
    { id: 'es-cyl', name: 'Castille-et-León', capitalName: 'Valladolid', capitalStationId: 'valladolid-es', lat: 41.80, lon: -4.80, altitude: 700, currentCode: 1, afternoonCode: 1, tomorrowCode: 0, currentTemp: 21, afternoonTemp: 24, tomorrowTemp: 22 },
    { id: 'es-val', name: 'Communauté Valencienne', capitalName: 'Valence', capitalStationId: 'valencia-es', lat: 39.47, lon: -0.45, currentCode: 0, afternoonCode: 0, tomorrowCode: 0, currentTemp: 26, afternoonTemp: 28, tomorrowTemp: 27 },
    { id: 'es-and-w', name: 'Andalousie Ouest', capitalName: 'Séville', capitalStationId: 'sevilla-es', lat: 37.45, lon: -5.85, currentCode: 0, afternoonCode: 0, tomorrowCode: 0, currentTemp: 29, afternoonTemp: 32, tomorrowTemp: 30 },
    { id: 'es-and-e', name: 'Andalousie Est', capitalName: 'Malaga', capitalStationId: 'malaga-es', lat: 37.05, lon: -3.80, currentCode: 0, afternoonCode: 0, tomorrowCode: 0, currentTemp: 27, afternoonTemp: 29, tomorrowTemp: 28 },
    { id: 'es-bal', name: 'Îles Baléares', capitalName: 'Palma de Majorque', capitalStationId: 'palma-es', lat: 39.60, lon: 2.95, currentCode: 0, afternoonCode: 0, tomorrowCode: 0, currentTemp: 25, afternoonTemp: 27, tomorrowTemp: 26 },
  ],
  'italie': [
    { id: 'it-pie', name: 'Piémont & Ligurie', capitalName: 'Turin', capitalStationId: 'torino-it', lat: 44.85, lon: 8.05, currentCode: 1, afternoonCode: 1, tomorrowCode: 0, currentTemp: 21, afternoonTemp: 24, tomorrowTemp: 23 },
    { id: 'it-lom', name: 'Lombardie', capitalName: 'Milan', capitalStationId: 'milano-it', lat: 45.55, lon: 9.45, currentCode: 1, afternoonCode: 2, tomorrowCode: 1, currentTemp: 22, afternoonTemp: 25, tomorrowTemp: 24 },
    { id: 'it-ven', name: 'Vénétie & Nord-Est', capitalName: 'Venise', capitalStationId: 'venezia-it', lat: 45.65, lon: 12.10, currentCode: 1, afternoonCode: 1, tomorrowCode: 1, currentTemp: 22, afternoonTemp: 24, tomorrowTemp: 23 },
    { id: 'it-emi', name: 'Émilie-Romagne', capitalName: 'Bologne', capitalStationId: 'bologna-it', lat: 44.50, lon: 11.20, currentCode: 0, afternoonCode: 1, tomorrowCode: 0, currentTemp: 24, afternoonTemp: 26, tomorrowTemp: 25 },
    { id: 'it-tos', name: 'Toscane', capitalName: 'Florence', capitalStationId: 'firenze-it', lat: 43.55, lon: 11.15, currentCode: 0, afternoonCode: 0, tomorrowCode: 0, currentTemp: 25, afternoonTemp: 27, tomorrowTemp: 26 },
    { id: 'it-laz', name: 'Latium & Centre', capitalName: 'Rome', capitalStationId: 'roma-it', lat: 41.90, lon: 12.50, currentCode: 0, afternoonCode: 0, tomorrowCode: 0, currentTemp: 26, afternoonTemp: 28, tomorrowTemp: 27 },
    { id: 'it-cam', name: 'Campanie', capitalName: 'Naples', capitalStationId: 'napoli-it', lat: 40.85, lon: 14.40, currentCode: 0, afternoonCode: 0, tomorrowCode: 0, currentTemp: 26, afternoonTemp: 28, tomorrowTemp: 27 },
    { id: 'it-pug', name: 'Pouilles & Sud-Est', capitalName: 'Bari', capitalStationId: 'bari-it', lat: 41.00, lon: 16.70, currentCode: 0, afternoonCode: 0, tomorrowCode: 0, currentTemp: 26, afternoonTemp: 28, tomorrowTemp: 27 },
    { id: 'it-sic', name: 'Sicile', capitalName: 'Palerme', capitalStationId: 'palermo-it', lat: 37.60, lon: 14.15, currentCode: 0, afternoonCode: 0, tomorrowCode: 0, currentTemp: 28, afternoonTemp: 30, tomorrowTemp: 29 },
    { id: 'it-sar', name: 'Sardaigne', capitalName: 'Cagliari', capitalStationId: 'cagliari-it', lat: 40.00, lon: 9.05, currentCode: 0, afternoonCode: 0, tomorrowCode: 0, currentTemp: 27, afternoonTemp: 29, tomorrowTemp: 28 },
  ],
  'allemagne': [
    { id: 'de-ham', name: 'Hambourg & Schleswig-Holstein', capitalName: 'Hambourg', capitalStationId: 'hamburg-de', lat: 53.75, lon: 9.95, currentCode: 2, afternoonCode: 2, tomorrowCode: 1, currentTemp: 16, afternoonTemp: 18, tomorrowTemp: 17 },
    { id: 'de-han', name: 'Basse-Saxe & Brême', capitalName: 'Hanovre', capitalStationId: 'hannover-de', lat: 52.55, lon: 9.40, currentCode: 1, afternoonCode: 2, tomorrowCode: 1, currentTemp: 17, afternoonTemp: 19, tomorrowTemp: 18 },
    { id: 'de-nrw', name: 'Rhénanie-du-Nord-Westphalie', capitalName: 'Cologne', capitalStationId: 'koeln-de', lat: 51.25, lon: 7.15, currentCode: 1, afternoonCode: 2, tomorrowCode: 1, currentTemp: 18, afternoonTemp: 20, tomorrowTemp: 19 },
    { id: 'de-hes', name: 'Hesse & Francfort', capitalName: 'Francfort', capitalStationId: 'frankfurt-de', lat: 50.35, lon: 8.85, currentCode: 1, afternoonCode: 1, tomorrowCode: 1, currentTemp: 19, afternoonTemp: 21, tomorrowTemp: 20 },
    { id: 'de-ber', name: 'Berlin & Brandebourg', capitalName: 'Berlin', capitalStationId: 'berlin-de', lat: 52.52, lon: 13.40, currentCode: 1, afternoonCode: 1, tomorrowCode: 2, currentTemp: 18, afternoonTemp: 21, tomorrowTemp: 19 },
    { id: 'de-sax', name: 'Saxe & Thuringe', capitalName: 'Dresde', capitalStationId: 'dresden-de', lat: 51.15, lon: 13.10, currentCode: 1, afternoonCode: 2, tomorrowCode: 1, currentTemp: 18, afternoonTemp: 20, tomorrowTemp: 19 },
    { id: 'de-bw', name: 'Bade-Wurtemberg', capitalName: 'Stuttgart', capitalStationId: 'stuttgart-de', lat: 48.65, lon: 9.05, currentCode: 0, afternoonCode: 1, tomorrowCode: 1, currentTemp: 20, afternoonTemp: 22, tomorrowTemp: 21 },
    { id: 'de-bay-n', name: 'Bavière Nord (Franconie)', capitalName: 'Nuremberg', capitalStationId: 'nuernberg-de', lat: 49.55, lon: 11.10, currentCode: 1, afternoonCode: 1, tomorrowCode: 1, currentTemp: 19, afternoonTemp: 21, tomorrowTemp: 20 },
    { id: 'de-bay-s', name: 'Bavière Sud & Alpes', capitalName: 'Munich', capitalStationId: 'muenchen-de', lat: 48.14, lon: 11.58, altitude: 520, currentCode: 1, afternoonCode: 2, tomorrowCode: 1, currentTemp: 19, afternoonTemp: 21, tomorrowTemp: 20 },
  ],
  'suisse': [
    { id: 'ch-rom', name: 'Suisse Romande & Léman', capitalName: 'Genève', capitalStationId: 'geneve-ch', lat: 46.45, lon: 6.45, altitude: 400, currentCode: 0, afternoonCode: 1, tomorrowCode: 0, currentTemp: 20, afternoonTemp: 22, tomorrowTemp: 21 },
    { id: 'ch-mit', name: 'Espace Mittelland', capitalName: 'Berne', capitalStationId: 'bern-ch', lat: 46.95, lon: 7.45, altitude: 540, currentCode: 1, afternoonCode: 1, tomorrowCode: 1, currentTemp: 19, afternoonTemp: 21, tomorrowTemp: 20 },
    { id: 'ch-nw', name: 'Suisse Nord-Ouest', capitalName: 'Bâle', capitalStationId: 'basel-ch', lat: 47.50, lon: 7.65, altitude: 280, currentCode: 1, afternoonCode: 1, tomorrowCode: 1, currentTemp: 20, afternoonTemp: 22, tomorrowTemp: 21 },
    { id: 'ch-zh', name: 'Grand Zurich & Nord-Est', capitalName: 'Zurich', capitalStationId: 'zurich-ch', lat: 47.37, lon: 8.54, altitude: 410, currentCode: 1, afternoonCode: 1, tomorrowCode: 1, currentTemp: 19, afternoonTemp: 21, tomorrowTemp: 20 },
    { id: 'ch-tic', name: 'Tessin & Sud des Alpes', capitalName: 'Lugano', capitalStationId: 'lugano-ch', lat: 46.10, lon: 8.95, altitude: 275, currentCode: 0, afternoonCode: 0, tomorrowCode: 1, currentTemp: 22, afternoonTemp: 24, tomorrowTemp: 23 },
    { id: 'ch-gr', name: 'Grisons & Alpes Orientales', capitalName: 'Coire', capitalStationId: 'chur-ch', lat: 46.75, lon: 9.65, altitude: 1100, currentCode: 1, afternoonCode: 2, tomorrowCode: 1, currentTemp: 15, afternoonTemp: 17, tomorrowTemp: 16 },
  ],
  'belgique': [
    { id: 'be-coast', name: 'Flandre Occidentale & Littoral', capitalName: 'Bruges', capitalStationId: 'bruges-be', lat: 51.18, lon: 3.12, currentCode: 2, afternoonCode: 2, tomorrowCode: 1, currentTemp: 17, afternoonTemp: 19, tomorrowTemp: 18 },
    { id: 'be-ant', name: 'Anvers & Flandre Orientale', capitalName: 'Anvers', capitalStationId: 'antwerp-be', lat: 51.18, lon: 4.35, currentCode: 1, afternoonCode: 2, tomorrowCode: 1, currentTemp: 18, afternoonTemp: 20, tomorrowTemp: 19 },
    { id: 'be-bru', name: 'Bruxelles & Brabant', capitalName: 'Bruxelles', capitalStationId: 'brussels-be', lat: 50.85, lon: 4.35, currentCode: 1, afternoonCode: 2, tomorrowCode: 1, currentTemp: 18, afternoonTemp: 20, tomorrowTemp: 19 },
    { id: 'be-hai', name: 'Hainaut & Namur', capitalName: 'Namur', capitalStationId: 'namur-be', lat: 50.45, lon: 4.50, currentCode: 1, afternoonCode: 2, tomorrowCode: 1, currentTemp: 18, afternoonTemp: 20, tomorrowTemp: 19 },
    { id: 'be-lie', name: 'Liège & Ardennes', capitalName: 'Liège', capitalStationId: 'liege-be', lat: 50.35, lon: 5.70, altitude: 320, currentCode: 2, afternoonCode: 2, tomorrowCode: 2, currentTemp: 16, afternoonTemp: 18, tomorrowTemp: 17 },
  ],
  'pays-bas': [
    { id: 'nl-nh', name: 'Hollande-Septentrionale', capitalName: 'Amsterdam', capitalStationId: 'amsterdam-nl', lat: 52.38, lon: 4.90, currentCode: 2, afternoonCode: 2, tomorrowCode: 1, currentTemp: 16, afternoonTemp: 18, tomorrowTemp: 17 },
    { id: 'nl-zh', name: 'Hollande-Méridionale', capitalName: 'Rotterdam', capitalStationId: 'rotterdam-nl', lat: 51.95, lon: 4.45, currentCode: 2, afternoonCode: 2, tomorrowCode: 1, currentTemp: 17, afternoonTemp: 19, tomorrowTemp: 18 },
    { id: 'nl-no', name: 'Nord & Frise', capitalName: 'Groningue', capitalStationId: 'groningen-nl', lat: 53.15, lon: 6.35, currentCode: 2, afternoonCode: 2, tomorrowCode: 2, currentTemp: 15, afternoonTemp: 17, tomorrowTemp: 16 },
    { id: 'nl-ce', name: 'Utrecht & Gueldre', capitalName: 'Utrecht', capitalStationId: 'utrecht-nl', lat: 52.10, lon: 5.65, currentCode: 1, afternoonCode: 2, tomorrowCode: 1, currentTemp: 17, afternoonTemp: 19, tomorrowTemp: 18 },
    { id: 'nl-su', name: 'Brabant & Limbourg', capitalName: 'Eindhoven', capitalStationId: 'eindhoven-nl', lat: 51.40, lon: 5.50, currentCode: 1, afternoonCode: 2, tomorrowCode: 1, currentTemp: 18, afternoonTemp: 20, tomorrowTemp: 19 },
  ],
  'portugal': [
    { id: 'pt-no', name: 'Nord & Douro', capitalName: 'Porto', capitalStationId: 'porto-pt', lat: 41.25, lon: -8.35, currentCode: 1, afternoonCode: 1, tomorrowCode: 0, currentTemp: 20, afternoonTemp: 22, tomorrowTemp: 21 },
    { id: 'pt-ce', name: 'Centre & Beiras', capitalName: 'Coimbra', capitalStationId: 'coimbra-pt', lat: 40.20, lon: -8.15, currentCode: 0, afternoonCode: 1, tomorrowCode: 0, currentTemp: 22, afternoonTemp: 24, tomorrowTemp: 23 },
    { id: 'pt-lis', name: 'Grand Lisbonne & Tage', capitalName: 'Lisbonne', capitalStationId: 'lisboa-pt', lat: 38.72, lon: -9.14, currentCode: 0, afternoonCode: 0, tomorrowCode: 0, currentTemp: 24, afternoonTemp: 26, tomorrowTemp: 25 },
    { id: 'pt-ale', name: 'Alentejo', capitalName: 'Évora', capitalStationId: 'evora-pt', lat: 38.45, lon: -7.90, currentCode: 0, afternoonCode: 0, tomorrowCode: 0, currentTemp: 26, afternoonTemp: 29, tomorrowTemp: 27 },
    { id: 'pt-alg', name: 'Algarve', capitalName: 'Faro', capitalStationId: 'faro-pt', lat: 37.10, lon: -8.05, currentCode: 0, afternoonCode: 0, tomorrowCode: 0, currentTemp: 25, afternoonTemp: 27, tomorrowTemp: 26 },
  ],
  'irlande': [
    { id: 'ie-dub', name: 'Grand Dublin & Leinster', capitalName: 'Dublin', capitalStationId: 'dublin-ie', lat: 53.35, lon: -6.26, currentCode: 2, afternoonCode: 2, tomorrowCode: 1, currentTemp: 14, afternoonTemp: 16, tomorrowTemp: 15 },
    { id: 'ie-mun', name: 'Munster & Sud', capitalName: 'Cork', capitalStationId: 'cork-ie', lat: 51.95, lon: -8.50, currentCode: 2, afternoonCode: 61, tomorrowCode: 2, currentTemp: 14, afternoonTemp: 16, tomorrowTemp: 15 },
    { id: 'ie-con', name: 'Connacht & Ouest', capitalName: 'Galway', capitalStationId: 'galway-ie', lat: 53.30, lon: -9.05, currentCode: 3, afternoonCode: 61, tomorrowCode: 2, currentTemp: 13, afternoonTemp: 15, tomorrowTemp: 14 },
    { id: 'ie-mid', name: 'Mid-West & Shannon', capitalName: 'Limerick', capitalStationId: 'limerick-ie', lat: 52.66, lon: -8.62, currentCode: 2, afternoonCode: 2, tomorrowCode: 2, currentTemp: 14, afternoonTemp: 16, tomorrowTemp: 15 },
    { id: 'ie-nw', name: 'Nord-Ouest & Donegal', capitalName: 'Donegal', capitalStationId: 'donegal-ie', lat: 54.80, lon: -8.00, currentCode: 3, afternoonCode: 61, tomorrowCode: 2, currentTemp: 12, afternoonTemp: 14, tomorrowTemp: 13 },
  ],
  'autriche': [
    { id: 'at-vie', name: 'Vienne & Basse-Autriche', capitalName: 'Vienne', capitalStationId: 'wien-at', lat: 48.20, lon: 16.37, currentCode: 1, afternoonCode: 1, tomorrowCode: 1, currentTemp: 20, afternoonTemp: 22, tomorrowTemp: 21 },
    { id: 'at-up', name: 'Haute-Autriche', capitalName: 'Linz', capitalStationId: 'linz-at', lat: 48.25, lon: 14.15, currentCode: 1, afternoonCode: 2, tomorrowCode: 1, currentTemp: 19, afternoonTemp: 21, tomorrowTemp: 20 },
    { id: 'at-sal', name: 'Salzbourg & Alpes Centrales', capitalName: 'Salzbourg', capitalStationId: 'salzburg-at', lat: 47.70, lon: 13.05, altitude: 450, currentCode: 1, afternoonCode: 2, tomorrowCode: 1, currentTemp: 18, afternoonTemp: 20, tomorrowTemp: 19 },
    { id: 'at-tyr', name: 'Tyrol & Vorarlberg', capitalName: 'Innsbruck', capitalStationId: 'innsbruck-at', lat: 47.26, lon: 11.40, altitude: 580, currentCode: 1, afternoonCode: 2, tomorrowCode: 1, currentTemp: 18, afternoonTemp: 20, tomorrowTemp: 19 },
    { id: 'at-sty', name: 'Styrie & Carinthie', capitalName: 'Graz', capitalStationId: 'graz-at', lat: 46.95, lon: 15.10, currentCode: 0, afternoonCode: 1, tomorrowCode: 1, currentTemp: 20, afternoonTemp: 22, tomorrowTemp: 21 },
  ],
  'grèce': [
    { id: 'gr-att', name: 'Attique & Grand Athènes', capitalName: 'Athènes', capitalStationId: 'athens-gr', lat: 37.98, lon: 23.73, currentCode: 0, afternoonCode: 0, tomorrowCode: 0, currentTemp: 28, afternoonTemp: 30, tomorrowTemp: 29 },
    { id: 'gr-mac', name: 'Macédoine & Nord', capitalName: 'Thessalonique', capitalStationId: 'thessaloniki-gr', lat: 40.64, lon: 22.94, currentCode: 0, afternoonCode: 1, tomorrowCode: 0, currentTemp: 25, afternoonTemp: 27, tomorrowTemp: 26 },
    { id: 'gr-pel', name: 'Péloponnèse', capitalName: 'Patras', capitalStationId: 'patras-gr', lat: 37.65, lon: 22.10, currentCode: 0, afternoonCode: 0, tomorrowCode: 0, currentTemp: 27, afternoonTemp: 29, tomorrowTemp: 28 },
    { id: 'gr-the', name: 'Thessalie & Grèce Centrale', capitalName: 'Larissa', capitalStationId: 'larissa-gr', lat: 39.45, lon: 22.20, currentCode: 0, afternoonCode: 0, tomorrowCode: 0, currentTemp: 27, afternoonTemp: 29, tomorrowTemp: 28 },
    { id: 'gr-cre', name: 'Crète', capitalName: 'Héraklion', capitalStationId: 'heraklion-gr', lat: 35.30, lon: 24.90, currentCode: 0, afternoonCode: 0, tomorrowCode: 0, currentTemp: 27, afternoonTemp: 29, tomorrowTemp: 28 },
    { id: 'gr-aeg', name: 'Cyclades & Mer Égée', capitalName: 'Mykonos', capitalStationId: 'cyclades-gr', lat: 37.10, lon: 25.40, currentCode: 0, afternoonCode: 0, tomorrowCode: 0, currentTemp: 26, afternoonTemp: 28, tomorrowTemp: 27 },
  ],
  'maroc': [
    { id: 'ma-tan', name: 'Tanger-Tétouan & Rif', capitalName: 'Tanger', capitalStationId: 'tanger-ma', lat: 35.45, lon: -5.50, currentCode: 0, afternoonCode: 0, tomorrowCode: 0, currentTemp: 25, afternoonTemp: 27, tomorrowTemp: 26 },
    { id: 'ma-rab', name: 'Rabat-Salé-Kénitra', capitalName: 'Rabat', capitalStationId: 'rabat-ma', lat: 34.02, lon: -6.84, currentCode: 0, afternoonCode: 0, tomorrowCode: 0, currentTemp: 25, afternoonTemp: 27, tomorrowTemp: 26 },
    { id: 'ma-cas', name: 'Casablanca-Settat', capitalName: 'Casablanca', capitalStationId: 'casablanca-ma', lat: 33.40, lon: -7.60, currentCode: 0, afternoonCode: 0, tomorrowCode: 0, currentTemp: 25, afternoonTemp: 27, tomorrowTemp: 26 },
    { id: 'ma-fes', name: 'Fès-Meknès', capitalName: 'Fès', capitalStationId: 'fes-ma', lat: 33.95, lon: -4.85, currentCode: 0, afternoonCode: 0, tomorrowCode: 0, currentTemp: 28, afternoonTemp: 31, tomorrowTemp: 29 },
    { id: 'ma-ori', name: 'Oriental', capitalName: 'Oujda', capitalStationId: 'oujda-ma', lat: 34.45, lon: -2.15, currentCode: 0, afternoonCode: 0, tomorrowCode: 0, currentTemp: 27, afternoonTemp: 30, tomorrowTemp: 28 },
    { id: 'ma-mar', name: 'Marrakech-Safi', capitalName: 'Marrakech', capitalStationId: 'marrakech-ma', lat: 31.63, lon: -8.00, currentCode: 0, afternoonCode: 0, tomorrowCode: 0, currentTemp: 31, afternoonTemp: 34, tomorrowTemp: 32 },
    { id: 'ma-aga', name: 'Souss-Massa', capitalName: 'Agadir', capitalStationId: 'agadir-ma', lat: 30.40, lon: -9.20, currentCode: 0, afternoonCode: 0, tomorrowCode: 0, currentTemp: 27, afternoonTemp: 29, tomorrowTemp: 28 },
  ],
  'algérie': [
    { id: 'dz-alg', name: 'Alger & Mitidja', capitalName: 'Alger', capitalStationId: 'algiers-dz', lat: 36.75, lon: 3.05, currentCode: 0, afternoonCode: 0, tomorrowCode: 0, currentTemp: 26, afternoonTemp: 28, tomorrowTemp: 27 },
    { id: 'dz-ora', name: 'Oranie & Nord-Ouest', capitalName: 'Oran', capitalStationId: 'oran-dz', lat: 35.65, lon: -0.60, currentCode: 0, afternoonCode: 0, tomorrowCode: 0, currentTemp: 26, afternoonTemp: 28, tomorrowTemp: 27 },
    { id: 'dz-con', name: 'Constantine & Kabylie', capitalName: 'Constantine', capitalStationId: 'constantine-dz', lat: 36.35, lon: 6.15, currentCode: 0, afternoonCode: 1, tomorrowCode: 0, currentTemp: 25, afternoonTemp: 28, tomorrowTemp: 26 },
    { id: 'dz-hpl', name: 'Hauts Plateaux', capitalName: 'Sétif', capitalStationId: 'setif-dz', lat: 35.15, lon: 3.80, altitude: 950, currentCode: 0, afternoonCode: 0, tomorrowCode: 0, currentTemp: 24, afternoonTemp: 27, tomorrowTemp: 25 },
    { id: 'dz-oua', name: 'Sud-Est & Oasis', capitalName: 'Ouargla', capitalStationId: 'ouargla-dz', lat: 32.30, lon: 5.40, currentCode: 0, afternoonCode: 0, tomorrowCode: 0, currentTemp: 33, afternoonTemp: 36, tomorrowTemp: 35 },
    { id: 'dz-sah', name: 'Sahara Central', capitalName: 'Ghardaïa', capitalStationId: 'ghardaia-dz', lat: 31.00, lon: 2.60, currentCode: 0, afternoonCode: 0, tomorrowCode: 0, currentTemp: 34, afternoonTemp: 37, tomorrowTemp: 35 },
  ],
  'tunisie': [
    { id: 'tn-tun', name: 'Grand Tunis & Cap Bon', capitalName: 'Tunis', capitalStationId: 'tunis-tn', lat: 36.80, lon: 10.25, currentCode: 0, afternoonCode: 0, tomorrowCode: 0, currentTemp: 27, afternoonTemp: 29, tomorrowTemp: 28 },
    { id: 'tn-nw', name: 'Nord-Ouest & Kroumirie', capitalName: 'Béja', capitalStationId: 'beja-tn', lat: 36.65, lon: 9.05, currentCode: 0, afternoonCode: 1, tomorrowCode: 0, currentTemp: 25, afternoonTemp: 27, tomorrowTemp: 26 },
    { id: 'tn-sah', name: 'Sahel & Centre-Est', capitalName: 'Sousse', capitalStationId: 'sousse-tn', lat: 35.40, lon: 10.70, currentCode: 0, afternoonCode: 0, tomorrowCode: 0, currentTemp: 28, afternoonTemp: 30, tomorrowTemp: 29 },
    { id: 'tn-cw', name: 'Centre-Ouest', capitalName: 'Kairouan', capitalStationId: 'kairouan-tn', lat: 35.35, lon: 9.45, currentCode: 0, afternoonCode: 0, tomorrowCode: 0, currentTemp: 29, afternoonTemp: 32, tomorrowTemp: 30 },
    { id: 'tn-sud', name: 'Sud & Île de Djerba', capitalName: 'Djerba', capitalStationId: 'djerba-tn', lat: 33.75, lon: 10.10, currentCode: 0, afternoonCode: 0, tomorrowCode: 0, currentTemp: 30, afternoonTemp: 33, tomorrowTemp: 31 },
  ],
  'états-unis': [
    { id: 'us-ne', name: 'Nord-Est & Nouvelle-Angleterre', capitalName: 'New York', capitalStationId: 'nyc-us', lat: 41.30, lon: -73.50, currentCode: 1, afternoonCode: 1, tomorrowCode: 0, currentTemp: 19, afternoonTemp: 22, tomorrowTemp: 21 },
    { id: 'us-ma', name: 'Mid-Atlantic', capitalName: 'Washington', capitalStationId: 'dc-us', lat: 38.90, lon: -77.04, currentCode: 1, afternoonCode: 1, tomorrowCode: 1, currentTemp: 21, afternoonTemp: 24, tomorrowTemp: 22 },
    { id: 'us-se', name: 'Sud-Est & Floride', capitalName: 'Miami', capitalStationId: 'miami-us', lat: 28.50, lon: -81.40, currentCode: 1, afternoonCode: 2, tomorrowCode: 1, currentTemp: 28, afternoonTemp: 30, tomorrowTemp: 29 },
    { id: 'us-mw', name: 'Grands Lacs & Midwest', capitalName: 'Chicago', capitalStationId: 'chicago-us', lat: 41.88, lon: -87.63, currentCode: 1, afternoonCode: 2, tomorrowCode: 1, currentTemp: 18, afternoonTemp: 21, tomorrowTemp: 19 },
    { id: 'us-sc', name: 'Texas & Sud-Central', capitalName: 'Dallas', capitalStationId: 'dallas-us', lat: 31.80, lon: -97.00, currentCode: 0, afternoonCode: 1, tomorrowCode: 0, currentTemp: 27, afternoonTemp: 30, tomorrowTemp: 28 },
    { id: 'us-gp', name: 'Grandes Plaines', capitalName: 'Kansas City', capitalStationId: 'kc-us', lat: 39.10, lon: -96.50, currentCode: 0, afternoonCode: 1, tomorrowCode: 0, currentTemp: 22, afternoonTemp: 25, tomorrowTemp: 23 },
    { id: 'us-rk', name: 'Montagnes Rocheuses', capitalName: 'Denver', capitalStationId: 'denver-us', lat: 39.74, lon: -105.00, altitude: 1609, currentCode: 0, afternoonCode: 1, tomorrowCode: 0, currentTemp: 19, afternoonTemp: 22, tomorrowTemp: 20 },
    { id: 'us-nw', name: 'Nord-Ouest Pacifique', capitalName: 'Seattle', capitalStationId: 'seattle-us', lat: 46.80, lon: -122.00, currentCode: 2, afternoonCode: 2, tomorrowCode: 1, currentTemp: 15, afternoonTemp: 18, tomorrowTemp: 17 },
    { id: 'us-ca', name: 'Californie & Sud-Ouest', capitalName: 'Los Angeles', capitalStationId: 'la-us', lat: 35.20, lon: -119.20, currentCode: 0, afternoonCode: 0, tomorrowCode: 0, currentTemp: 24, afternoonTemp: 27, tomorrowTemp: 25 },
  ],
  'canada': [
    { id: 'ca-qc', name: 'Québec', capitalName: 'Montréal', capitalStationId: 'montreal-ca', lat: 46.20, lon: -72.50, currentCode: 1, afternoonCode: 2, tomorrowCode: 1, currentTemp: 15, afternoonTemp: 18, tomorrowTemp: 16 },
    { id: 'ca-on', name: 'Ontario', capitalName: 'Toronto', capitalStationId: 'toronto-ca', lat: 44.30, lon: -79.20, currentCode: 1, afternoonCode: 1, tomorrowCode: 1, currentTemp: 17, afternoonTemp: 19, tomorrowTemp: 18 },
    { id: 'ca-at', name: 'Provinces Atlantiques', capitalName: 'Halifax', capitalStationId: 'halifax-ca', lat: 45.20, lon: -63.60, currentCode: 2, afternoonCode: 2, tomorrowCode: 1, currentTemp: 14, afternoonTemp: 16, tomorrowTemp: 15 },
    { id: 'ca-pr', name: 'Prairies (Manitoba / Saskatchewan)', capitalName: 'Winnipeg', capitalStationId: 'winnipeg-ca', lat: 50.40, lon: -100.00, currentCode: 1, afternoonCode: 1, tomorrowCode: 1, currentTemp: 15, afternoonTemp: 18, tomorrowTemp: 16 },
    { id: 'ca-ab', name: 'Alberta & Rocheuses', capitalName: 'Calgary', capitalStationId: 'calgary-ca', lat: 52.00, lon: -114.00, altitude: 1045, currentCode: 1, afternoonCode: 2, tomorrowCode: 1, currentTemp: 13, afternoonTemp: 16, tomorrowTemp: 14 },
    { id: 'ca-bc', name: 'Colombie-Britannique', capitalName: 'Vancouver', capitalStationId: 'vancouver-ca', lat: 49.50, lon: -123.10, currentCode: 2, afternoonCode: 2, tomorrowCode: 1, currentTemp: 15, afternoonTemp: 17, tomorrowTemp: 16 },
  ],
  'japon': [
    { id: 'jp-hok', name: 'Hokkaido (Nord)', capitalName: 'Sapporo', capitalStationId: 'sapporo-jp', lat: 43.06, lon: 141.35, currentCode: 1, afternoonCode: 2, tomorrowCode: 1, currentTemp: 15, afternoonTemp: 18, tomorrowTemp: 16 },
    { id: 'jp-toh', name: 'Tohoku', capitalName: 'Sendai', capitalStationId: 'sendai-jp', lat: 38.27, lon: 140.87, currentCode: 1, afternoonCode: 1, tomorrowCode: 1, currentTemp: 18, afternoonTemp: 21, tomorrowTemp: 19 },
    { id: 'jp-kan', name: 'Kanto & Grand Tokyo', capitalName: 'Tokyo', capitalStationId: 'tokyo-jp', lat: 35.68, lon: 139.65, currentCode: 1, afternoonCode: 1, tomorrowCode: 0, currentTemp: 22, afternoonTemp: 24, tomorrowTemp: 23 },
    { id: 'jp-chu', name: 'Chubu & Alpes Japonaises', capitalName: 'Nagoya', capitalStationId: 'nagoya-jp', lat: 35.18, lon: 136.91, currentCode: 1, afternoonCode: 1, tomorrowCode: 1, currentTemp: 22, afternoonTemp: 24, tomorrowTemp: 23 },
    { id: 'jp-kns', name: 'Kansai (Osaka & Kyoto)', capitalName: 'Osaka', capitalStationId: 'osaka-jp', lat: 34.69, lon: 135.50, currentCode: 0, afternoonCode: 1, tomorrowCode: 0, currentTemp: 23, afternoonTemp: 25, tomorrowTemp: 24 },
    { id: 'jp-kyu', name: 'Kyushu (Sud)', capitalName: 'Fukuoka', capitalStationId: 'fukuoka-jp', lat: 33.59, lon: 130.40, currentCode: 1, afternoonCode: 1, tomorrowCode: 1, currentTemp: 23, afternoonTemp: 26, tomorrowTemp: 24 },
  ],
};

// Zones météo mondiales pour la vue "Monde"
const WORLD_MACRO_ZONES: RegionWeather[] = [
  { id: 'wm-eu-w', name: 'Europe de l’Ouest', capitalName: 'Paris', capitalStationId: 'paris-montsouris', lat: 48.85, lon: 2.35, currentCode: 1, afternoonCode: 1, tomorrowCode: 1, currentTemp: 20, afternoonTemp: 22, tomorrowTemp: 21 },
  { id: 'wm-eu-s', name: 'Bassin Méditerranéen', capitalName: 'Rome', capitalStationId: 'roma-it', lat: 40.50, lon: 12.50, currentCode: 0, afternoonCode: 0, tomorrowCode: 0, currentTemp: 26, afternoonTemp: 28, tomorrowTemp: 27 },
  { id: 'wm-eu-n', name: 'Europe du Nord & UK', capitalName: 'Londres', capitalStationId: 'london-uk', lat: 54.50, lon: 2.00, currentCode: 2, afternoonCode: 2, tomorrowCode: 1, currentTemp: 15, afternoonTemp: 17, tomorrowTemp: 16 },
  { id: 'wm-na-e', name: 'Amérique du Nord-Est', capitalName: 'New York', capitalStationId: 'nyc-us', lat: 40.71, lon: -74.00, currentCode: 1, afternoonCode: 1, tomorrowCode: 0, currentTemp: 20, afternoonTemp: 22, tomorrowTemp: 21 },
  { id: 'wm-na-w', name: 'Côte Ouest Nord-Américaine', capitalName: 'Los Angeles', capitalStationId: 'la-us', lat: 36.50, lon: -119.50, currentCode: 0, afternoonCode: 0, tomorrowCode: 0, currentTemp: 24, afternoonTemp: 26, tomorrowTemp: 25 },
  { id: 'wm-sa', name: 'Amérique du Sud', capitalName: 'São Paulo', capitalStationId: 'saopaulo-br', lat: -22.90, lon: -45.00, currentCode: 1, afternoonCode: 2, tomorrowCode: 1, currentTemp: 25, afternoonTemp: 27, tomorrowTemp: 26 },
  { id: 'wm-af-n', name: 'Afrique du Nord & Sahara', capitalName: 'Le Caire', capitalStationId: 'cairo-eg', lat: 28.00, lon: 12.00, currentCode: 0, afternoonCode: 0, tomorrowCode: 0, currentTemp: 31, afternoonTemp: 34, tomorrowTemp: 32 },
  { id: 'wm-af-s', name: 'Afrique Australe', capitalName: 'Johannesburg', capitalStationId: 'joburg-za', lat: -26.20, lon: 28.04, currentCode: 0, afternoonCode: 1, tomorrowCode: 0, currentTemp: 22, afternoonTemp: 25, tomorrowTemp: 23 },
  { id: 'wm-as-s', name: 'Asie du Sud', capitalName: 'New Delhi', capitalStationId: 'delhi-in', lat: 23.00, lon: 78.00, currentCode: 1, afternoonCode: 2, tomorrowCode: 1, currentTemp: 30, afternoonTemp: 32, tomorrowTemp: 31 },
  { id: 'wm-as-e', name: 'Asie de l’Est', capitalName: 'Tokyo', capitalStationId: 'tokyo-jp', lat: 35.68, lon: 139.65, currentCode: 1, afternoonCode: 1, tomorrowCode: 1, currentTemp: 22, afternoonTemp: 24, tomorrowTemp: 23 },
  { id: 'wm-oc', name: 'Océanie & Australie', capitalName: 'Sydney', capitalStationId: 'sydney-au', lat: -31.00, lon: 147.00, currentCode: 0, afternoonCode: 1, tomorrowCode: 0, currentTemp: 21, afternoonTemp: 23, tomorrowTemp: 22 },
];

// Tight, perfect bounding box for all France regions including Corsica
const FRANCE_BOUNDS: L.LatLngBoundsLiteral = [
  [41.3, -5.2], // Southwest (Corsica south / Brittany west)
  [51.1, 9.6]   // Northeast (Dunkirk north / Alsace east)
];

// Country bounding boxes & French display names for automatic country map framing
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

// Générateur automatique de 7 zones météo pour tout pays du monde non listé explicitement
function buildDynamicZonesForCountry(station: LocationPoint, labelFr: string, bounds: L.LatLngBoundsLiteral): RegionWeather[] {
  const [[minLat, minLon], [maxLat, maxLon]] = bounds as [[number, number], [number, number]];
  const centerLat = (minLat + maxLat) / 2;
  const centerLon = (minLon + maxLon) / 2;
  const dLat = (maxLat - minLat) * 0.28;
  const dLon = (maxLon - minLon) * 0.28;

  return [
    { id: 'dyn-c', name: `${labelFr} — Centre (${station.name})`, capitalName: station.name, capitalStationId: station.id, lat: station.latitude || centerLat, lon: station.longitude || centerLon, currentCode: 1, afternoonCode: 1, tomorrowCode: 1, currentTemp: 20, afternoonTemp: 22, tomorrowTemp: 21 },
    { id: 'dyn-n', name: `${labelFr} — Zone Nord`, capitalName: `${labelFr} Nord`, capitalStationId: `${labelFr}-nord`, lat: centerLat + dLat, lon: centerLon, currentCode: 1, afternoonCode: 2, tomorrowCode: 1, currentTemp: 18, afternoonTemp: 20, tomorrowTemp: 19 },
    { id: 'dyn-nw', name: `${labelFr} — Zone Nord-Ouest`, capitalName: `${labelFr} Nord-Ouest`, capitalStationId: `${labelFr}-nw`, lat: centerLat + dLat * 0.75, lon: centerLon - dLon, currentCode: 2, afternoonCode: 2, tomorrowCode: 1, currentTemp: 18, afternoonTemp: 20, tomorrowTemp: 19 },
    { id: 'dyn-ne', name: `${labelFr} — Zone Nord-Est`, capitalName: `${labelFr} Nord-Est`, capitalStationId: `${labelFr}-ne`, lat: centerLat + dLat * 0.75, lon: centerLon + dLon, currentCode: 1, afternoonCode: 1, tomorrowCode: 1, currentTemp: 19, afternoonTemp: 21, tomorrowTemp: 20 },
    { id: 'dyn-sw', name: `${labelFr} — Zone Sud-Ouest`, capitalName: `${labelFr} Sud-Ouest`, capitalStationId: `${labelFr}-sw`, lat: centerLat - dLat * 0.75, lon: centerLon - dLon, currentCode: 0, afternoonCode: 1, tomorrowCode: 0, currentTemp: 21, afternoonTemp: 23, tomorrowTemp: 22 },
    { id: 'dyn-se', name: `${labelFr} — Zone Sud-Est`, capitalName: `${labelFr} Sud-Est`, capitalStationId: `${labelFr}-se`, lat: centerLat - dLat * 0.75, lon: centerLon + dLon, currentCode: 0, afternoonCode: 1, tomorrowCode: 0, currentTemp: 21, afternoonTemp: 23, tomorrowTemp: 22 },
    { id: 'dyn-s', name: `${labelFr} — Zone Sud`, capitalName: `${labelFr} Sud`, capitalStationId: `${labelFr}-sud`, lat: centerLat - dLat, lon: centerLon, currentCode: 0, afternoonCode: 0, tomorrowCode: 0, currentTemp: 22, afternoonTemp: 24, tomorrowTemp: 23 },
  ];
}

function resolveStationCountryProfile(station: LocationPoint): { isFrance: boolean; labelFr: string; bounds: L.LatLngBoundsLiteral; regions: RegionWeather[] } {
  const rawCountry = (station.country || '').trim();
  const lowerCountry = rawCountry.toLowerCase();
  const lowerCode = (station.countryCode || '').trim().toLowerCase();
  const lowerName = (station.name || '').toLowerCase();

  // Check explicit London / UK / British station names even if country was not set
  if (
    lowerName.includes('londres') ||
    lowerName === 'london' ||
    lowerCode === 'gb' ||
    lowerCode === 'uk'
  ) {
    const ukBounds = COUNTRY_MAP_PROFILES['royaume-uni'].bounds;
    return { isFrance: false, labelFr: 'Royaume-Uni', bounds: ukBounds, regions: UK_REGIONS };
  }

  // Also check if coordinates are inside the UK & Ireland archipelago when country is missing or ambiguous
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

  // Fallback for any other country on Earth: build a national bounding box & 7 meteorological zones around the country
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

export const FranceMiniOverviewCard: React.FC<FranceMiniOverviewCardProps> = ({
  currentStation,
  onSelectStation,
  onNavigateTab
}) => {
  const [selectedSlot, setSelectedSlot] = useState<'current' | 'afternoon' | 'tomorrow'>('current');
  const countryProfile = resolveStationCountryProfile(currentStation);
  const [regionsData, setRegionsData] = useState<RegionWeather[]>(countryProfile.regions);
  const [isExpandedPc, setIsExpandedPc] = useState<boolean>(false);
  // Par défaut, affiche directement le pays en global (France ou le pays de la ville demandée comme Royaume-Uni)
  const [mapScope, setMapScope] = useState<'country' | 'city' | 'world'>('country');

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Quand l'utilisateur change de ville (ex: demande Londres -> affiche automatiquement le Royaume-Uni)
  useEffect(() => {
    setMapScope('country');
  }, [currentStation.id, currentStation.name, currentStation.country]);

  // Fetch live weather codes for all zones of the active country (or world zones when in World tab)
  useEffect(() => {
    let isCancelled = false;
    const baseRegions = mapScope === 'world' ? WORLD_MACRO_ZONES : countryProfile.regions;

    // Immediately show the target country's zones while live data loads
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
      } catch (err) {
        // Retain fallback data smoothly
      }
    };

    fetchLiveRegions();
    return () => { isCancelled = true; };
  }, [countryProfile.labelFr, mapScope]);

  // Pure Meteorological Pictograms (Only symbols: sun, partly cloudy, cloudy, rain, storm, snow, fog)
  const getWeatherSymbolSvg = (code: number) => {
    // 0 = Ensoleillé pur
    if (code === 0) {
      return `<svg class="w-5 h-5 text-amber-400 fill-amber-400 drop-shadow" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`;
    }
    // 1, 2 = Éclaircies / Peu nuageux
    if (code === 1 || code === 2) {
      return `<svg class="w-5 h-5 text-amber-400 drop-shadow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="M20 12h2"/><path d="m19.07 4.93-1.41 1.41"/><path d="M15.947 12.65a4 4 0 0 0-5.925-4.128"/><path d="M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6Z" fill="#93c5fd" fill-opacity="0.3" stroke="#38bdf8"/></svg>`;
    }
    // 3 = Couvert / Nuageux
    if (code === 3) {
      return `<svg class="w-5 h-5 text-slate-300 drop-shadow" viewBox="0 0 24 24" fill="#64748b" fill-opacity="0.3" stroke="currentColor" stroke-width="2"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>`;
    }
    // 45, 48 = Brouillard
    if (code === 45 || code === 48) {
      return `<svg class="w-5 h-5 text-slate-400 drop-shadow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 10h16"/><path d="M4 14h16"/><path d="M7 18h10"/></svg>`;
    }
    // 51 to 67, 80 to 82 = Pluie / Averses
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
      return `<svg class="w-5 h-5 text-sky-400 drop-shadow" viewBox="0 0 24 24" fill="#0284c7" fill-opacity="0.25" stroke="currentColor" stroke-width="2"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 14v6" stroke-dasharray="2 2"/><path d="M8 14v6" stroke-dasharray="2 2"/><path d="M12 16v6" stroke-dasharray="2 2"/></svg>`;
    }
    // 71 to 77, 85 to 86 = Neige
    if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) {
      return `<svg class="w-5 h-5 text-cyan-300 drop-shadow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="2" x2="22" y1="12" y2="12"/><line x1="12" x2="12" y1="2" y2="22"/><path d="m20 16-4-4 4-4"/><path d="m4 8 4 4-4 4"/><path d="m16 4-4 4-4-4"/><path d="m8 20 4-4 4 4"/></svg>`;
    }
    // 95 to 99 = Orage
    if (code >= 95) {
      return `<svg class="w-5 h-5 text-amber-400 drop-shadow" viewBox="0 0 24 24" fill="#d97706" fill-opacity="0.3" stroke="currentColor" stroke-width="2"><path d="M6 16.326A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 .5 8.973"/><path d="m13 11-3 5h4l-3 5" fill="#f59e0b" stroke="#f59e0b"/></svg>`;
    }
    return `<svg class="w-5 h-5 text-amber-400 fill-amber-400 drop-shadow" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M2 12h2"/><path d="M20 12h2"/></svg>`;
  };

  const getWeatherLabel = (code: number) => {
    if (code === 0) return 'Plein Soleil';
    if (code === 1) return 'Ensoleillé';
    if (code === 2) return 'Éclaircies';
    if (code === 3) return 'Couvert';
    if (code === 45 || code === 48) return 'Brouillard';
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'Pluie';
    if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return 'Neige';
    if (code >= 95) return 'Orage';
    return 'Ensoleillé';
  };

  // Initialize Leaflet Map with High-Definition Clean Cartography (No raw OpenStreetMap)
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

        // Fond cartographique Satellite HD identique à Radar Précipitations & Vents HD
        const baseTileLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          maxNativeZoom: 18,
          maxZoom: 19,
          subdomains: 'abc',
          attribution: '© Esri, Maxar, Earthstar Geographics'
        });
        baseTileLayer.on('tileerror', () => {
          // Tolérance aux pannes réseau
        });
        baseTileLayer.addTo(map);

        // Markers Layer Group
        const markersGroup = L.layerGroup().addTo(map);
        markersLayerRef.current = markersGroup;

        mapInstanceRef.current = map;

        // Initial View: Center on country in global view (France or the station's country)
        const sz = map.getSize();
        if (countryProfile.bounds && sz.x > 0 && sz.y > 0) {
          map.fitBounds(countryProfile.bounds, { padding: [8, 8], animate: false });
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
            mapInstanceRef.current.fitBounds(countryProfile.bounds, { padding: [8, 8], animate: false });
          } else {
            mapInstanceRef.current.setView([currentStation?.latitude || 46.5, currentStation?.longitude || 2.5], 5.5, { animate: false });
          }
        } else {
          mapInstanceRef.current.setView([20, currentStation?.longitude || 0], 2, { animate: false });
        }
      } catch {
        // Ignore transient layout errors
      }
    };

    // ResizeObserver so Leaflet always fills its full flex container height
    let resizeObs: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && mapContainerRef.current) {
      resizeObs = new ResizeObserver(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
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

  // Update View when station changes or scope changes
  useEffect(() => {
    if (!mapInstanceRef.current || !mapContainerRef.current) return;
    const map = mapInstanceRef.current;
    const isVisible = mapContainerRef.current.clientWidth > 0 && mapContainerRef.current.clientHeight > 0;

    try {
      if (mapScope === 'city' && currentStation?.latitude && currentStation?.longitude) {
        if (isVisible) {
          map.flyTo([currentStation.latitude, currentStation.longitude], 9, { duration: 0.8 });
        } else {
          map.setView([currentStation.latitude, currentStation.longitude], 9, { animate: false });
        }
      } else if (mapScope === 'country') {
        if (countryProfile.bounds) {
          if (isVisible) {
            map.fitBounds(countryProfile.bounds, { padding: [8, 8] });
          } else {
            map.fitBounds(countryProfile.bounds, { padding: [8, 8], animate: false });
          }
        } else {
          map.setView([currentStation?.latitude || 46.5, currentStation?.longitude || 2.5], 5.5, { animate: false });
        }
      } else if (mapScope === 'world') {
        if (isVisible) {
          map.flyTo([20, currentStation?.longitude || 0], 2, { duration: 0.8 });
        } else {
          map.setView([20, currentStation?.longitude || 0], 2, { animate: false });
        }
      }
    } catch {
      // Fallback if container was resizing during flyTo
    }
  }, [currentStation.latitude, currentStation.longitude, currentStation.id, currentStation.country, mapScope]);

  // Update Markers: Weather Symbols for regions + Active Marker for currentStation!
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    const markersGroup = markersLayerRef.current;
    markersGroup.clearLayers();

    // 1. Regional Weather Symbols (displayed for ALL countries in country view, as well as in world view)
    if (mapScope === 'country' || mapScope === 'world') {
      regionsData.forEach(reg => {
        const isCurrentRegion = Boolean(
          (currentStation.region &&
            (reg.name.toLowerCase().includes(currentStation.region.toLowerCase()) ||
             currentStation.region.toLowerCase().includes(reg.name.toLowerCase()))) ||
          (reg.capitalName && currentStation.name.toLowerCase().includes(reg.capitalName.toLowerCase())) ||
          (Math.abs(currentStation.latitude - reg.lat) < 0.45 && Math.abs(currentStation.longitude - reg.lon) < 0.45)
        );

        const code = selectedSlot === 'current' 
          ? reg.currentCode 
          : selectedSlot === 'afternoon' 
          ? reg.afternoonCode 
          : reg.tomorrowCode;

        const temp = selectedSlot === 'current' 
          ? reg.currentTemp 
          : selectedSlot === 'afternoon' 
          ? reg.afternoonTemp 
          : reg.tomorrowTemp;

        const symbolSvg = getWeatherSymbolSvg(code);
        const labelDesc = getWeatherLabel(code);
        const citySubtitle = reg.capitalName ? ` (${reg.capitalName})` : '';

        // ONLY THE WEATHER SYMBOL: pure, elegant floating pictogram disc
        const html = `
          <div class="group cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-200 hover:scale-125" title="${reg.name}${citySubtitle} : ${labelDesc} (${temp}°C)">
            <div class="flex items-center justify-center w-8 h-8 rounded-full shadow-md backdrop-blur-md transition-all ${
              isCurrentRegion
                ? 'bg-blue-600/90 text-white ring-2 ring-blue-400 scale-110 shadow-blue-500/40'
                : 'bg-white/90 dark:bg-slate-900/90 hover:bg-white text-slate-800 dark:text-white border border-slate-300 dark:border-slate-700/80'
            }">
              ${symbolSvg}
            </div>
          </div>
        `;

        const customIcon = L.divIcon({
          className: 'france-region-symbol-marker',
          html,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        const marker = L.marker([reg.lat, reg.lon], { icon: customIcon });

        marker.bindTooltip(`<strong>${reg.name}</strong>${citySubtitle}<br/>${labelDesc} • ${temp}°C`, {
          direction: 'top',
          offset: [0, -10],
          opacity: 0.95
        });

        marker.on('click', () => {
          handleRegionClick(reg);
        });

        marker.addTo(markersGroup);
      });
    }

    // 2. Active Pulse Marker for the selected station anywhere in France or on Earth
    if (currentStation && currentStation.latitude && currentStation.longitude) {
      const isMacroScope = mapScope === 'country' || mapScope === 'world';

      const currentStationHtml = isMacroScope
        ? `
          <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2 cursor-pointer group" title="${currentStation.name} (${currentStation.altitude}m)">
            <span class="absolute inline-flex h-3 w-3 animate-ping rounded-full bg-blue-500 opacity-75"></span>
            <div class="relative h-2.5 w-2.5 rounded-full bg-blue-600 border border-white shadow-sm ring-1 ring-blue-400"></div>
          </div>
        `
        : `
          <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2 cursor-pointer group">
            <span class="absolute inline-flex h-7 w-7 animate-ping rounded-full bg-blue-500 opacity-50"></span>
            <div class="relative flex items-center gap-1.5 rounded-md bg-blue-600 px-2 py-0.5 text-white shadow-lg border border-white ring-1 ring-blue-400 font-bold text-xs whitespace-nowrap">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>${currentStation.name}</span>
              <span class="text-[10px] text-blue-200">(${currentStation.altitude}m)</span>
            </div>
          </div>
        `;

      const currentIcon = L.divIcon({
        className: 'current-station-marker',
        html: currentStationHtml,
        iconSize: isMacroScope ? [12, 12] : [100, 28],
        iconAnchor: isMacroScope ? [6, 6] : [50, 14]
      });

      const currentMarker = L.marker([currentStation.latitude, currentStation.longitude], {
        icon: currentIcon,
        zIndexOffset: 1000
      });

      currentMarker.bindTooltip(`<strong>${currentStation.name}</strong><br/>Altitude: ${currentStation.altitude}m<br/>${currentStation.department || currentStation.country || ''}`, {
        direction: 'top',
        offset: [0, isMacroScope ? -6 : -14],
        opacity: 0.95
      });

      currentMarker.addTo(markersGroup);
    }
  }, [regionsData, selectedSlot, currentStation, mapScope]);

  const handleRegionClick = (reg: RegionWeather) => {
    if (!onSelectStation) return;
    // 1. Check if it matches a French station
    const foundFrench = FRENCH_STATIONS.find(s => s.id === reg.capitalStationId) ||
      FRENCH_STATIONS.find(s => s.region?.toLowerCase() === reg.name.toLowerCase());
    
    if (foundFrench) {
      onSelectStation(foundFrench);
      return;
    }

    // 2. Construct a full LocationPoint for any foreign zone (e.g. UK/Angleterre, Espagne, Italie, etc.)
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
          mapInstanceRef.current.fitBounds(countryProfile.bounds, { padding: [8, 8] });
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

  return (
    <div className={`h-full flex flex-col rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-[#0c1424]/90 p-2.5 sm:p-3 shadow-md backdrop-blur-xl relative overflow-hidden transition-all duration-300 ${
      isExpandedPc ? 'ring-2 ring-blue-500/50 shadow-xl' : ''
    }`}>
      {/* Sleek Compact Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-1.5 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-500 shrink-0">
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
                  ? `Synthèse météo des régions françaises (${regionsData.length} zones)`
                  : `Synthèse météo par zone • ${countryProfile.labelFr} (${regionsData.length} zones)`
                : mapScope === 'world'
                ? `Synthèse atmosphérique mondiale (${regionsData.length} zones)`
                : `${currentStation.name} (${countryProfile.labelFr}) • ${currentStation.altitude}m`}
            </span>
          </div>
        </div>

        {/* Scope Selector: Pays (France / Royaume-Uni / etc.) en premier, puis Ma Ville, puis Monde */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="flex items-center bg-slate-100 dark:bg-slate-900 rounded-lg p-0.5 border border-slate-200 dark:border-slate-800 text-[11px]">
            <button
              onClick={() => setMapScope('country')}
              className={`px-2 py-0.5 rounded-md font-bold transition cursor-pointer ${
                mapScope === 'country'
                  ? 'bg-blue-600 text-white shadow-sm'
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
                  ? 'bg-blue-600 text-white shadow-sm'
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
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Vue d'ensemble de la Terre entière"
            >
              Monde
            </button>
          </div>

          {/* Time Slot Controls */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-900 rounded-lg p-0.5 border border-slate-200 dark:border-slate-800 text-[11px]">
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

          {/* PC Zoom Buttons */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800">
            <button
              onClick={handleZoomIn}
              title="Zoomer sur la carte (PC)"
              aria-label="Zoomer"
              className="flex items-center justify-center h-6 w-6 rounded-md bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/40 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 shadow-xs border border-slate-200 dark:border-slate-700 transition active:scale-95 cursor-pointer"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleZoomOut}
              title="Dézoomer de la carte (PC)"
              aria-label="Dézoomer"
              className="flex items-center justify-center h-6 w-6 rounded-md bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/40 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 shadow-xs border border-slate-200 dark:border-slate-700 transition active:scale-95 cursor-pointer"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleToggleExpandPc}
              title={isExpandedPc ? "Réduire la vue" : "Agrandir le bloc (Vue HD)"}
              className={`hidden md:flex items-center gap-1 px-1.5 h-6 rounded-md text-[10px] font-bold border transition cursor-pointer ${
                isExpandedPc 
                  ? 'bg-blue-600 text-white border-blue-500' 
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              {isExpandedPc ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
              <span>{isExpandedPc ? 'Réduire' : 'Zoomer'}</span>
            </button>
          </div>

          <button
            onClick={handleRecenter}
            title="Recentrer sur la sélection"
            className="flex items-center justify-center h-6 w-6 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Map Container (Fills the entire remaining height of the card block) */}
      <div className={`relative w-full flex-1 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 transition-all duration-300 ${
        isExpandedPc ? 'min-h-[380px] sm:min-h-[440px]' : 'min-h-[240px] sm:min-h-[285px]'
      }`}>
        <div 
          ref={mapContainerRef} 
          className="absolute inset-0 w-full h-full z-0"
        />

        {/* Floating Zoom Overlay Badge (only in city mode, discreet) */}
        {mapScope === 'city' && (
          <div className="absolute bottom-2 left-2 z-[400] flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md px-2 py-1 rounded-md text-[10px] text-slate-300 border border-slate-700/60 pointer-events-none">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{currentStation.name}</span>
          </div>
        )}
      </div>
    </div>
  );
};
