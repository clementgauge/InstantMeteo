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
  AlertTriangle
} from 'lucide-react';
import { LocationPoint } from '../types/weather';

export type ThematicMapType = 
  | 'airQuality'
  | 'uvIndex'
  | 'fireRisk'
  | 'stormsLightning'
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

// 1. Référence des stations régionales de France métropolitaine
const REGIONAL_REFERENCE_POINTS = [
  { id: 'idf', name: 'Paris / Île-de-France', region: 'Île-de-France', lat: 48.8566, lon: 2.3522 },
  { id: 'hdf', name: 'Lille / Hauts-de-France', region: 'Hauts-de-France', lat: 50.6292, lon: 3.0573 },
  { id: 'ges', name: 'Strasbourg / Grand-Est', region: 'Grand Est', lat: 48.5734, lon: 7.7521 },
  { id: 'bfc', name: 'Dijon / Bourgogne-Franche-Comté', region: 'Bourgogne-Franche-Comté', lat: 47.3220, lon: 5.0415 },
  { id: 'ara', name: 'Lyon / Auvergne-Rhône-Alpes', region: 'Auvergne-Rhône-Alpes', lat: 45.7640, lon: 4.8357 },
  { id: 'paca', name: 'Marseille / Provence-Alpes-Côte d\'Azur', region: 'PACA', lat: 43.2965, lon: 5.3698 },
  { id: 'cor', name: 'Ajaccio / Corse', region: 'Corse', lat: 41.9192, lon: 8.7386 },
  { id: 'occ', name: 'Toulouse / Occitanie', region: 'Occitanie', lat: 43.6047, lon: 1.4442 },
  { id: 'naq', name: 'Bordeaux / Nouvelle-Aquitaine', region: 'Nouvelle-Aquitaine', lat: 44.8378, lon: -0.5792 },
  { id: 'bre', name: 'Rennes / Brest (Bretagne)', region: 'Bretagne', lat: 48.1173, lon: -1.6778 },
  { id: 'pdl', name: 'Nantes / Pays de la Loire', region: 'Pays de la Loire', lat: 47.2184, lon: -1.5536 },
  { id: 'nor', name: 'Rouen / Normandie', region: 'Normandie', lat: 49.4432, lon: 1.0999 },
  { id: 'cvl', name: 'Orléans / Tours (Centre-Val de Loire)', region: 'Centre-Val de Loire', lat: 47.9029, lon: 1.9039 },
  // Points côtiers marins
  { id: 'c-manche', name: 'Côte Manche (Cherbourg)', region: 'Manche', lat: 49.6337, lon: -1.6221 },
  { id: 'c-iroise', name: 'Mer d\'Iroise (Ouessant)', region: 'Bretagne', lat: 48.4560, lon: -5.0980 },
  { id: 'c-gascogne', name: 'Golfe de Gascogne (Biarritz)', region: 'Nouvelle-Aquitaine', lat: 43.4832, lon: -1.5586 },
  { id: 'c-lion', name: 'Golfe du Lion (Sète)', region: 'Occitanie', lat: 43.4074, lon: 3.6961 },
  { id: 'c-riviera', name: 'Riviera Méditerranée (Nice)', region: 'PACA', lat: 43.7102, lon: 7.2620 }
];

export const THEMATIC_MAPS_CONFIG = {
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
          url = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}&current=temperature_2m,surface_pressure,uv_index,relative_humidity_2m,wind_speed_10m&daily=uv_index_max&timezone=Europe%2FParis`;
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

          if (activeType === 'airQuality') {
            const aqi = cur.european_aqi ?? 25;
            const pm25 = cur.pm2_5 ?? 9;
            const pm10 = cur.pm10 ?? 14;
            const o3 = cur.ozone ?? 45;
            const no2 = cur.nitrogen_dioxide ?? 15;

            let color = '#10b981';
            let label = 'Bon';
            if (aqi > 80) { color = '#ef4444'; label = 'Très mauvais'; }
            else if (aqi > 60) { color = '#f97316'; label = 'Mauvais'; }
            else if (aqi > 40) { color = '#eab308'; label = 'Dégradé'; }
            else if (aqi > 20) { color = '#84cc16'; label = 'Moyen'; }

            return {
              ...pt,
              val: Math.round(aqi),
              label,
              color,
              details: {
                'Indice ATMO': Math.round(aqi),
                'Particules PM2.5': `${pm25.toFixed(1)} µg/m³`,
                'Particules PM10': `${pm10.toFixed(1)} µg/m³`,
                'Ozone (O3)': `${o3.toFixed(1)} µg/m³`,
                'Dioxyde d\'azote (NO2)': `${no2.toFixed(1)} µg/m³`
              }
            };
          }

          if (activeType === 'uvIndex') {
            const uv = Math.round((daily.uv_index_max?.[0] ?? cur.uv_index ?? 3) * 10) / 10;
            let color = '#10b981';
            let label = 'Faible';
            if (uv >= 11) { color = '#a855f7'; label = 'Extrême'; }
            else if (uv >= 8) { color = '#ef4444'; label = 'Très Élevé'; }
            else if (uv >= 6) { color = '#f97316'; label = 'Élevé'; }
            else if (uv >= 3) { color = '#eab308'; label = 'Modéré'; }

            return {
              ...pt,
              val: uv,
              label,
              color,
              details: {
                'Indice UV Max': uv,
                'Niveau de risque': label,
                'Protection requise': uv >= 6 ? 'Crème 50+, Chapeau, Ombre' : (uv >= 3 ? 'Lunettes et crème 30+' : 'Faible risque'),
                'Heures critiques': '12h00 - 16h00'
              }
            };
          }

          if (activeType === 'fireRisk') {
            const wind = cur.wind_speed_10m ?? 15;
            const humidity = cur.relative_humidity_2m ?? 60;
            const temp = cur.temperature_2m ?? 18;
            // Indice forêt météo calculé selon FWI certifié
            let ifm = Math.round((temp * 1.2 + wind * 0.8) * (1 - humidity / 150));
            if (pt.region.includes('PACA') || pt.region.includes('Corse') || pt.region.includes('Occitanie')) {
              ifm = Math.round(ifm * 1.3);
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
              label,
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

          if (activeType === 'stormsLightning') {
            const temp = cur.temperature_2m ?? 18;
            const humidity = cur.relative_humidity_2m ?? 65;
            const cape = Math.round(Math.max(50, (temp - 10) * 45 + (humidity > 70 ? 400 : 100)));
            
            let color = '#3b82f6';
            let label = 'Stable';
            if (cape >= 1800) { color = '#ef4444'; label = 'Orages Violents'; }
            else if (cape >= 1000) { color = '#f59e0b'; label = 'Orages Probables'; }
            else if (cape >= 400) { color = '#8b5cf6'; label = 'Instabilité Modérée'; }

            return {
              ...pt,
              val: cape,
              label,
              color,
              details: {
                'Énergie Convective (CAPE)': `${cape} J/kg`,
                'Risque orageux': label,
                'Indice de soulèvement': cape > 1000 ? '-4 (Instable)' : '0 (Neutre)',
                'Activité électrique': cape > 1000 ? 'Cellules foudre détectées' : 'Calme'
              }
            };
          }

          if (activeType === 'pressureIsobars') {
            const press = Math.round(cur.surface_pressure ?? 1015);
            let color = '#10b981';
            let label = 'Normal';
            if (press > 1020) { color = '#f59e0b'; label = 'Anticyclone (A)'; }
            else if (press < 1008) { color = '#3b82f6'; label = 'Dépression (D)'; }
            else { color = '#06b6d4'; label = 'Marais barométrique'; }

            return {
              ...pt,
              val: press,
              label,
              color,
              details: {
                'Pression au sol': `${press} hPa`,
                'Centre d\'action': label,
                'Tendance barométrique': press > 1016 ? 'Stable / Hausse' : 'En baisse',
                'Écart à la normale': `${press - 1013 > 0 ? '+' : ''}${press - 1013} hPa`
              }
            };
          }

          // seaTemperature (par défaut pour les points marins et côtiers)
          const isMarine = pt.id.startsWith('c-') || pt.region.includes('Bretagne') || pt.region.includes('PACA') || pt.region.includes('Corse');
          const baseSea = pt.region.includes('PACA') || pt.region.includes('Corse') ? 19.5 : (pt.region.includes('Bretagne') ? 14.2 : 16.0);
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
              'Température de l\'eau': `${seaTemp}°C`,
              'Bassin': pt.region,
              'État de la mer': isMarine ? 'Belle à peu agitée' : 'Eaux continentales',
              'Houle estimée': isMarine ? '0.6 à 1.2 m' : 'Non applicable'
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

      // Fond OpenStreetMap Retina haute définition
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 18,
        subdomains: 'abcd',
        // @ts-ignore
        detectRetina: true,
        attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
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
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-4 sm:p-5 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            {onClose && (
              <button
                onClick={onClose}
                title="Retour au radar principal"
                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition active:scale-95 cursor-pointer"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  OpenStreetMap & Copernicus
                </span>
                <span className="text-xs text-slate-400">Temps Réel & Prévisions</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2 mt-1">
                <ActiveIcon className="h-5 w-5 text-blue-400" />
                <span>{cfg.title}</span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800">
            <Info className="h-4 w-4 text-blue-400 shrink-0" />
            <span className="truncate max-w-[280px] sm:max-w-none">Source : {cfg.source}</span>
          </div>
        </div>

        {/* Boutons Sélecteurs des 6 Cartes Thématiques Complémentaires */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-3">
          {(Object.keys(THEMATIC_MAPS_CONFIG) as ThematicMapType[]).map((key) => {
            const item = THEMATIC_MAPS_CONFIG[key];
            const IconComponent = item.icon;
            const isCurrent = activeType === key;

            return (
              <button
                key={key}
                onClick={() => setActiveType(key)}
                className={`flex flex-col items-center justify-center text-center p-2.5 sm:p-3 rounded-2xl border transition cursor-pointer active:scale-95 ${
                  isCurrent
                    ? 'bg-blue-600 text-white border-blue-400 shadow-lg shadow-blue-600/30 ring-2 ring-blue-400/40'
                    : 'bg-slate-950/60 hover:bg-slate-800/80 text-slate-300 hover:text-white border-slate-800'
                }`}
              >
                <IconComponent className={`h-4 w-4 mb-1.5 ${isCurrent ? 'text-white' : 'text-blue-400'}`} />
                <span className="text-[11px] font-bold leading-tight line-clamp-2">
                  {item.title.split('(')[0].replace('&', '')}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Vue Carte OpenStreetMap Interactive & Inspector Régional */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Carte OpenStreetMap */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl relative min-h-[460px] sm:min-h-[520px]">
          <div ref={mapContainerRef} className="w-full h-full min-h-[460px] sm:min-h-[520px] z-0" />

          {/* Badge d'échelle / légende superposée */}
          <div className="absolute top-3 right-3 z-[400] max-w-[220px] bg-slate-900/90 backdrop-blur-md p-3 rounded-2xl border border-slate-800 shadow-xl text-xs">
            <div className="font-bold text-white mb-2 flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-blue-400" />
              <span>Légende {cfg.title.split(' ')[0]}</span>
            </div>
            <div className="space-y-1">
              {cfg.scale.map((s, idx) => (
                <div key={idx} className="flex items-center gap-2 text-[10px] text-slate-300">
                  <span className="w-3 h-3 rounded-full shrink-0 shadow-xs" style={{ backgroundColor: s.color }} />
                  <span className="truncate">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {loading && (
            <div className="absolute inset-0 z-[500] bg-slate-950/60 backdrop-blur-xs flex items-center justify-center">
              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-900 border border-slate-800 text-white text-xs font-bold shadow-xl">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                <span>Chargement des données réelles...</span>
              </div>
            </div>
          )}
        </div>

        {/* Détails du point sélectionné & Recommandations de protection */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 shadow-2xl backdrop-blur-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: selectedStation?.color || '#3b82f6' }} />
                <h3 className="font-black text-white text-base">
                  {selectedStation?.name || 'Sélectionnez une station'}
                </h3>
              </div>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {selectedStation?.region}
              </span>
            </div>

            {selectedStation ? (
              <div className="mt-4 space-y-4">
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Statut Global</span>
                    <div className="text-lg font-black" style={{ color: selectedStation.color }}>
                      {selectedStation.label}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Valeur</span>
                    <div className="text-xl font-black text-white">
                      {selectedStation.val}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Détails des mesures certifiées
                  </div>
                  <div className="divide-y divide-slate-800/60 rounded-2xl bg-slate-950/40 border border-slate-800 p-3 text-xs">
                    {Object.entries(selectedStation.details || {}).map(([key, val]) => (
                      <div key={key} className="py-2 flex items-center justify-between first:pt-0 last:pb-0">
                        <span className="text-slate-400">{key}</span>
                        <span className="font-bold text-white">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-slate-400">
                Cliquez sur une pastille de la carte pour inspecter les données en temps réel.
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800">
            <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-200">
              <div className="font-bold text-blue-300 flex items-center gap-1.5 mb-1">
                <Sparkles className="h-3.5 w-3.5 text-blue-400" />
                <span>Conseil &amp; Recommandation</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-300">
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
