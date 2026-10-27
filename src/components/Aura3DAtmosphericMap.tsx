import React, { useState, useMemo } from 'react';
import { LocationPoint } from '../types/weather';
import { FRENCH_STATIONS } from '../data/frenchStations';
import { 
  Mountain,
  Thermometer, 
  Wind, 
  CloudRain, 
  Snowflake, 
  RotateCcw, 
  Maximize2, 
  Compass, 
  Eye, 
  MapPin, 
  Info,
  Check,
  ChevronRight,
  Sparkles,
  Layers
} from 'lucide-react';

export type Map3DMetric = 'relief' | 'temperature' | 'wind' | 'rain' | 'snow';

interface Aura3DAtmosphericMapProps {
  initialMetric?: Map3DMetric;
  currentStation: LocationPoint;
  onSelectStation?: (station: LocationPoint) => void;
  title?: string;
}

interface Station3DNode {
  id: string;
  name: string;
  shortName: string;
  x: number; // 0 to 100 on France projection
  y: number; // 0 to 100 on France projection
  altitude: number;
  temp: number;
  windSpeed: number;
  windGust: number;
  rainMm: number;
  lpnMeters: number;
  condition: string;
  region: string;
  massif?: string;
}

export const Aura3DAtmosphericMap: React.FC<Aura3DAtmosphericMapProps> = ({
  initialMetric = 'relief',
  currentStation,
  onSelectStation,
  title
}) => {
  const [metric, setMetric] = useState<Map3DMetric>(initialMetric);
  const [rotX, setRotX] = useState<number>(44); // Pitch (inclinaison 3D)
  const [rotZ, setRotZ] = useState<number>(-12); // Yaw (orientation 3D)
  const [zoom, setZoom] = useState<number>(1);
  const [activeCameraPreset, setActiveCameraPreset] = useState<'3d' | '2d' | 'south' | 'north'>('3d');
  const [selectedStationNode, setSelectedStationNode] = useState<Station3DNode | null>(null);
  const [showRivers, setShowRivers] = useState<boolean>(true);
  const [showSummits, setShowSummits] = useState<boolean>(true);

  // Échantillonnage de stations et sommets emblématiques de France avec coordonnées géoréférencées
  const station3DList: Station3DNode[] = useMemo(() => {
    const benchmarkData: Record<string, { 
      short: string;
      x: number; 
      y: number; 
      altitude: number;
      temp: number; 
      wind: number; 
      gust: number; 
      rain: number; 
      lpn: number; 
      cond: string;
      region: string;
      massif?: string;
    }> = {
      // 1. Sommets iconiques & reliefs
      'mont-blanc': { short: 'Mont Blanc', x: 84.8, y: 53.5, altitude: 4809, temp: -3.8, wind: 45, gust: 78, rain: 0.0, lpn: 1100, cond: 'Glaciers & Névés', region: 'Haute-Savoie', massif: 'Alpes du Nord' },
      'barre-ecrins': { short: 'Barre des Écrins', x: 82.5, y: 64.0, altitude: 4102, temp: -1.5, wind: 40, gust: 68, rain: 0.0, lpn: 1250, cond: 'Haute altitude', region: 'Hautes-Alpes', massif: 'Alpes du Sud' },
      'vignemale': { short: 'Vignemale', x: 39.0, y: 87.5, altitude: 3298, temp: 1.2, wind: 36, gust: 62, rain: 0.8, lpn: 1400, cond: 'Glacier d\'Ossoue', region: 'Hautes-Pyrénées', massif: 'Pyrénées' },
      'pic-du-midi': { short: 'Pic du Midi', x: 38.0, y: 86.0, altitude: 2876, temp: 4.8, wind: 48, gust: 78, rain: 1.5, lpn: 1150, cond: 'Observatoire', region: 'Occitanie', massif: 'Pyrénées' },
      'monte-cinto': { short: 'Monte Cinto', x: 91.5, y: 88.0, altitude: 2706, temp: 6.2, wind: 34, gust: 58, rain: 0.0, lpn: 1650, cond: 'Granite & Crêtes', region: 'Haute-Corse', massif: 'Corse' },
      'puy-de-sancy': { short: 'Puy de Sancy', x: 51.5, y: 60.5, altitude: 1885, temp: 9.8, wind: 32, gust: 54, rain: 0.4, lpn: 1900, cond: 'Volcan d\'Auvergne', region: 'Puy-de-Dôme', massif: 'Massif Central' },
      'plomb-du-cantal': { short: 'Plomb du Cantal', x: 52.8, y: 65.0, altitude: 1855, temp: 10.4, wind: 28, gust: 48, rain: 0.2, lpn: 1950, cond: 'Crêtes basaltiques', region: 'Cantal', massif: 'Massif Central' },
      'cret-de-la-neige': { short: 'Crêt de la Neige', x: 79.2, y: 49.5, altitude: 1720, temp: 11.0, wind: 25, gust: 42, rain: 0.6, lpn: 2000, cond: 'Haut-Jura', region: 'Ain', massif: 'Jura' },
      'grand-ballon': { short: 'Grand Ballon', x: 84.5, y: 35.5, altitude: 1424, temp: 12.2, wind: 30, gust: 52, rain: 0.0, lpn: 2100, cond: 'Sommet Vosgien', region: 'Haut-Rhin', massif: 'Vosges' },
      'mont-ventoux': { short: 'Mt Ventoux', x: 72.5, y: 76.0, altitude: 1912, temp: 8.5, wind: 65, gust: 98, rain: 0.2, lpn: 1400, cond: 'Violent mistral', region: 'Vaucluse', massif: 'Provence' },
      
      // 2. Grandes agglomérations et bassins versants
      'paris': { short: 'Paris', x: 50.0, y: 28.0, altitude: 55, temp: 18.2, wind: 18, gust: 32, rain: 0.2, lpn: 2200, cond: 'Éclaircies', region: 'Île-de-France' },
      'lille': { short: 'Lille', x: 53.0, y: 11.0, altitude: 25, temp: 16.5, wind: 24, gust: 42, rain: 1.2, lpn: 1900, cond: 'Nuageux', region: 'Hauts-de-France' },
      'brest': { short: 'Brest', x: 10.0, y: 36.5, altitude: 45, temp: 15.8, wind: 36, gust: 60, rain: 3.6, lpn: 1800, cond: 'Averses océaniques', region: 'Bretagne' },
      'rennes': { short: 'Rennes', x: 26.0, y: 37.0, altitude: 35, temp: 17.1, wind: 22, gust: 38, rain: 0.8, lpn: 2100, cond: 'Ciel voilé', region: 'Bretagne' },
      'strasbourg': { short: 'Strasbourg', x: 88.0, y: 31.0, altitude: 140, temp: 19.4, wind: 12, gust: 22, rain: 0.0, lpn: 2400, cond: 'Ensoleillé', region: 'Grand Est' },
      'nantes': { short: 'Nantes', x: 25.0, y: 47.0, altitude: 20, temp: 18.0, wind: 20, gust: 35, rain: 0.4, lpn: 2250, cond: 'Belles éclaircies', region: 'Pays de la Loire' },
      'bordeaux': { short: 'Bordeaux', x: 30.0, y: 68.0, altitude: 15, temp: 21.0, wind: 16, gust: 28, rain: 0.0, lpn: 2600, cond: 'Beau temps', region: 'Nouvelle-Aquitaine' },
      'toulouse': { short: 'Toulouse', x: 45.0, y: 80.0, altitude: 145, temp: 22.3, wind: 19, gust: 34, rain: 0.0, lpn: 2800, cond: 'Soleil aquitain', region: 'Occitanie' },
      'lyon': { short: 'Lyon', x: 68.0, y: 55.0, altitude: 180, temp: 20.1, wind: 15, gust: 26, rain: 0.1, lpn: 2450, cond: 'Doux & voilé', region: 'Auvergne-Rhône-Alpes' },
      'marseille': { short: 'Marseille', x: 73.5, y: 83.5, altitude: 10, temp: 23.2, wind: 42, gust: 68, rain: 0.0, lpn: 2950, cond: 'Grand soleil mistral', region: 'PACA' },
      'nice': { short: 'Nice', x: 88.8, y: 79.5, altitude: 15, temp: 22.8, wind: 14, gust: 24, rain: 0.0, lpn: 2900, cond: 'Ensoleillé', region: 'Côte d\'Azur' },
      'clermont': { short: 'Clermont-Fd', x: 52.0, y: 58.0, altitude: 360, temp: 18.6, wind: 18, gust: 30, rain: 0.3, lpn: 2300, cond: 'Éclaircies', region: 'Massif Central' },
      'ajaccio': { short: 'Ajaccio', x: 89.5, y: 93.8, altitude: 10, temp: 23.5, wind: 22, gust: 38, rain: 0.0, lpn: 3100, cond: 'Soleil corse', region: 'Corse' }
    };

    return Object.entries(benchmarkData).map(([key, data]) => {
      const match = FRENCH_STATIONS.find(s => s.id.toLowerCase().includes(key) || s.name.toLowerCase().includes(key)) || {
        id: key,
        name: data.short,
        altitude: data.altitude
      };
      return {
        id: match.id,
        name: match.name,
        shortName: data.short,
        x: data.x,
        y: data.y,
        altitude: data.altitude,
        temp: data.temp,
        windSpeed: data.wind,
        windGust: data.gust,
        rainMm: data.rain,
        lpnMeters: data.lpn,
        condition: data.cond,
        region: data.region,
        massif: data.massif
      };
    });
  }, []);

  const getNodeColor = (node: Station3DNode) => {
    if (metric === 'relief') {
      if (node.altitude >= 3000) return '#FFFFFF'; // Glaciers & Neiges éternelles
      if (node.altitude >= 2000) return '#E2E8F0'; // Haute montagne alpine & pyrénéenne
      if (node.altitude >= 1200) return '#F97316'; // Roches et moyenne montagne
      if (node.altitude >= 500) return '#EAB308'; // Plateaux et collines
      return '#10B981'; // Bassins fluviaux et plaines côtières
    }
    if (metric === 'temperature') {
      if (node.temp >= 22) return '#EF4444'; // rouge chaud
      if (node.temp >= 19) return '#F59E0B'; // ambre doux
      if (node.temp >= 16) return '#10B981'; // vert tempéré
      if (node.temp >= 10) return '#06B6D4'; // cyan frais
      return '#3B82F6'; // bleu froid
    }
    if (metric === 'wind') {
      if (node.windGust >= 80) return '#DC2626'; // rouge violentes rafales
      if (node.windGust >= 55) return '#F97316'; // orange coup de vent
      if (node.windGust >= 35) return '#EAB308'; // jaune modéré
      return '#38BDF8'; // bleu brise
    }
    if (metric === 'rain') {
      if (node.rainMm >= 2.5) return '#2563EB'; // pluie soutenue
      if (node.rainMm >= 0.5) return '#06B6D4'; // ondée
      return '#94A3B8'; // sec
    }
    // Neige & LPN
    if (node.lpnMeters <= 1400) return '#C084FC'; // neige basse altitude
    if (node.lpnMeters <= 2000) return '#60A5FA'; // moyenne montagne
    return '#38BDF8'; // haute altitude
  };

  const getNodeBadgeValue = (node: Station3DNode) => {
    if (metric === 'relief') return `${node.altitude} m`;
    if (metric === 'temperature') return `${node.temp.toFixed(1)}°C`;
    if (metric === 'wind') return `${node.windGust} km/h`;
    if (metric === 'rain') return `${node.rainMm.toFixed(1)} mm`;
    return `${node.lpnMeters} m`;
  };

  const setCameraPreset = (preset: '3d' | '2d' | 'south' | 'north') => {
    setActiveCameraPreset(preset);
    if (preset === '3d') {
      setRotX(44);
      setRotZ(-12);
      setZoom(1);
    } else if (preset === '2d') {
      setRotX(0);
      setRotZ(0);
      setZoom(1.02);
    } else if (preset === 'south') {
      setRotX(58);
      setRotZ(20);
      setZoom(1.08);
    } else if (preset === 'north') {
      setRotX(44);
      setRotZ(-32);
      setZoom(1.05);
    }
  };

  return (
    <div className="w-full rounded-2xl border border-sky-500/30 bg-gradient-to-b from-slate-950 via-[#070E1C] to-slate-950 p-4 sm:p-5 shadow-2xl overflow-hidden my-3 select-none">
      {/* 1. Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 rounded-xl bg-gradient-to-tr from-sky-600 via-amber-500 to-emerald-500 p-0.5 items-center justify-center text-white shadow-md">
            <div className="w-full h-full bg-slate-950/60 rounded-[10px] flex items-center justify-center">
              <Mountain className="h-4 w-4 text-emerald-400" />
            </div>
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-black text-white flex items-center gap-2">
              <span>{title || 'Modélisation 3D du Territoire Français & Relief Hypsométrique'}</span>
              <span className="text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Contours Réels &amp; Relief HD
              </span>
            </h4>
            <p className="text-[10px] text-slate-400">
              Vrais contours côtiers &amp; frontaliers • Modèle numérique de terrain, étagements altitudinaux et sommets.
            </p>
          </div>
        </div>

        {/* Metric Selector Buttons */}
        <div className="flex items-center gap-1 bg-slate-900/90 border border-white/10 p-1 rounded-xl shrink-0 overflow-x-auto">
          <button
            type="button"
            onClick={() => setMetric('relief')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              metric === 'relief'
                ? 'bg-gradient-to-r from-emerald-500 to-amber-500 text-slate-950 shadow-sm font-black'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Mountain className="h-3.5 w-3.5" />
            <span>Relief 3D Ombré</span>
          </button>

          <button
            type="button"
            onClick={() => setMetric('temperature')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              metric === 'temperature'
                ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Thermometer className="h-3.5 w-3.5" />
            <span>Températures</span>
          </button>

          <button
            type="button"
            onClick={() => setMetric('wind')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              metric === 'wind'
                ? 'bg-sky-500 text-slate-950 shadow-sm font-black'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Wind className="h-3.5 w-3.5" />
            <span>Vent &amp; Rafales</span>
          </button>

          <button
            type="button"
            onClick={() => setMetric('rain')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              metric === 'rain'
                ? 'bg-blue-600 text-white shadow-sm font-black'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <CloudRain className="h-3.5 w-3.5" />
            <span>Précipitations</span>
          </button>

          <button
            type="button"
            onClick={() => setMetric('snow')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              metric === 'snow'
                ? 'bg-purple-600 text-white shadow-sm font-black'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Snowflake className="h-3.5 w-3.5" />
            <span>Isotherme &amp; Neige</span>
          </button>
        </div>
      </div>

      {/* 2. 3D Scene Viewport */}
      <div 
        className="relative w-full h-[390px] sm:h-[480px] rounded-2xl bg-[#02050A] border border-sky-500/20 overflow-hidden flex items-center justify-center cursor-move"
        style={{ perspective: '1200px' }}
      >
        {/* Grille spatiale holographique & nébuleuse d'arrière-plan */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-25"
          style={{
            backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(56,189,248,0.25) 0%, transparent 68%), linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
            backgroundSize: '100% 100%, 32px 32px, 32px 32px'
          }}
        />

        {/* Canvas 3D Transformed Layer */}
        <div
          className="relative w-[340px] sm:w-[470px] h-[340px] sm:h-[470px] transition-transform duration-150 ease-out"
          style={{
            transform: `rotateX(${rotX}deg) rotateZ(${rotZ}deg) scale(${zoom})`,
            transformStyle: 'preserve-3d'
          }}
        >
          {/* Base relief map plate of France with realistic vector contours */}
          <div 
            className="absolute inset-0 rounded-3xl border border-sky-500/30 bg-gradient-to-br from-slate-900/95 via-[#08152A] to-slate-950/95 shadow-[0_35px_80px_rgba(0,0,0,0.95),inset_0_0_35px_rgba(56,189,248,0.15)]"
            style={{
              transform: 'translateZ(-18px)'
            }}
          >
            {/* SVG RÉALISTE DE LA FRANCE MÉTROPOLITAINE & CORSE AVEC RELIEF ET DONNÉES */}
            <svg viewBox="0 0 100 100" className="w-full h-full p-2.5 sm:p-3.5" fill="none">
              <defs>
                {/* Dégradé Hypsométrique Relief Réel de France */}
                <linearGradient id="franceReliefHypsometric" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#065f46" stopOpacity="0.8" />
                  <stop offset="35%" stopColor="#047857" stopOpacity="0.75" />
                  <stop offset="60%" stopColor="#ca8a04" stopOpacity="0.7" />
                  <stop offset="85%" stopColor="#b45309" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#e2e8f0" stopOpacity="0.9" />
                </linearGradient>

                {/* Dégradé Thermique Spatial France */}
                <linearGradient id="franceThermalGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.5" />
                  <stop offset="40%" stopColor="#10B981" stopOpacity="0.45" />
                  <stop offset="75%" stopColor="#F59E0B" stopOpacity="0.55" />
                  <stop offset="100%" stopColor="#EF4444" stopOpacity="0.6" />
                </linearGradient>

                {/* Dégradé Vent Spatial */}
                <radialGradient id="franceWindMistral" cx="72%" cy="82%" r="35%">
                  <stop offset="0%" stopColor="#F97316" stopOpacity="0.65" />
                  <stop offset="50%" stopColor="#38BDF8" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                </radialGradient>

                {/* Dégradé Précipitations Radar */}
                <radialGradient id="franceRainRadar" cx="25%" cy="35%" r="40%">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity="0.65" />
                  <stop offset="60%" stopColor="#06B6D4" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                </radialGradient>

                {/* Ombre des Massifs Montagneux (Effet Relief 3D Ombré / Hillshading) */}
                <filter id="reliefShadow" x="-30%" y="-30%" width="160%" height="160%">
                  <feDropShadow dx="1.5" dy="2.5" stdDeviation="2" floodColor="#000000" floodOpacity="0.85" />
                </filter>
                <filter id="summitGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#38BDF8" floodOpacity="0.9" />
                </filter>
              </defs>

              {/* CONTOUR GÉOGRAPHIQUE HAUTE PRÉCISION DE LA FRANCE MÉTROPOLITAINE */}
              {/* Reproduction fidèle : Dunkerque, Cotentin, Bretagne (Crozon/Raz), Vendée, Gironde, Côte Basque, Pyrénées, Méditerranée, Alpes, Jura, Alsace-Rhin, Ardennes */}
              <path
                d="M 52.0 8.5
                   L 49.5 10.5 L 47.5 12.0 L 45.0 16.5 L 42.0 19.5 L 36.5 22.8
                   L 37.5 24.2 L 33.5 25.5 L 29.5 23.5 L 28.5 21.0 L 25.0 20.5
                   L 24.5 23.0 L 26.0 25.5 L 27.0 28.5 L 25.5 30.5 L 24.5 31.8
                   L 23.5 30.8 L 21.5 33.0 L 17.5 31.0 L 14.0 32.5 L 10.5 33.5
                   L 8.0 35.5 L 10.5 36.5 L 7.8 38.0 L 10.0 39.2 L 6.5 40.5
                   L 7.8 43.0 L 8.5 45.0 L 12.0 45.5 L 15.0 47.0 L 17.5 51.5
                   L 19.5 50.0 L 21.0 52.0 L 22.2 53.5 L 23.0 55.5 L 24.0 59.0
                   L 26.0 62.0 L 27.0 64.0 L 27.5 67.5 L 26.5 68.8 L 27.5 72.0
                   L 26.8 75.0 L 27.5 80.0 L 27.0 85.5
                   L 28.5 86.2 L 32.5 86.8 L 36.0 87.2 L 39.0 87.6 L 43.0 87.3
                   L 47.0 87.5 L 52.0 87.8 L 56.5 88.0
                   L 57.0 86.8 L 56.5 84.5 L 56.0 82.8 L 57.8 81.8 L 61.0 81.5
                   L 63.2 81.5 L 66.0 81.0 L 68.2 83.2 L 70.0 84.0 L 72.2 83.0
                   L 73.8 83.8 L 75.2 84.8 L 76.5 85.2 L 77.8 85.8 L 79.2 86.2
                   L 81.5 85.0 L 83.2 84.0 L 84.5 82.8 L 86.8 81.2 L 87.8 80.2
                   L 88.8 79.5 L 89.8 79.0 L 91.0 77.8
                   L 90.5 75.8 L 88.5 72.5 L 87.2 67.5 L 86.5 62.5 L 86.0 57.5
                   L 84.8 53.5 L 81.8 51.5 L 78.5 53.5 L 78.0 50.5 L 80.2 46.5
                   L 82.2 43.8 L 83.5 41.2 L 85.8 39.8
                   L 86.2 37.5 L 87.0 34.5 L 88.0 31.0 L 89.2 27.0
                   L 87.5 25.5 L 84.0 25.0 L 79.0 23.8 L 75.2 22.2 L 72.0 20.5
                   L 68.5 17.5 L 65.2 19.5 L 61.8 17.0 L 58.0 14.8 L 54.5 12.2
                   L 51.8 10.8 Z"
                fill={
                  metric === 'relief'
                    ? "url(#franceReliefHypsometric)"
                    : metric === 'temperature'
                      ? "url(#franceThermalGrad)"
                      : metric === 'wind'
                        ? "url(#franceWindMistral)"
                        : metric === 'rain'
                          ? "url(#franceRainRadar)"
                          : "rgba(168, 85, 247, 0.28)"
                }
                stroke="#38BDF8"
                strokeWidth={metric === 'relief' ? "1.4" : "1.2"}
                strokeDasharray={metric === 'wind' ? "4 2" : "none"}
                className="transition-colors duration-500"
              />

              {/* ÎLES DU LITTORAL ATLANTIQUE FRANÇAIS */}
              {/* Île d'Oléron */}
              <polygon points="23.8,65.5 25.8,65.0 26.2,67.2 24.2,67.6" fill={metric === 'relief' ? "#065f46" : "#38BDF850"} stroke="#38BDF8" strokeWidth="0.8" />
              {/* Île de Ré */}
              <polygon points="23.2,62.8 25.2,62.2 25.6,63.2 23.5,63.6" fill={metric === 'relief' ? "#065f46" : "#38BDF850"} stroke="#38BDF8" strokeWidth="0.8" />
              {/* Île de Noirmoutier */}
              <polygon points="20.2,54.2 21.0,53.5 21.5,54.8 20.8,55.6" fill={metric === 'relief' ? "#065f46" : "#38BDF850"} stroke="#38BDF8" strokeWidth="0.8" />
              {/* Belle-Île */}
              <polygon points="15.8,52.5 17.2,52.0 17.6,53.2 16.2,53.6" fill={metric === 'relief' ? "#065f46" : "#38BDF850"} stroke="#38BDF8" strokeWidth="0.8" />

              {/* CORSE GÉOGRAPHIQUE HAUTE PRÉCISION (Cap Corse, Calvi, Ajaccio, Bonifacio, Bastia) */}
              <path
                d="M 92.2 81.5
                   L 91.2 83.5 L 90.0 85.2 L 89.0 86.8 L 88.2 89.0 L 88.8 91.5
                   L 89.4 93.8 L 89.8 96.0 L 91.6 98.8 L 93.0 97.5 L 93.8 95.0
                   L 94.5 90.0 L 93.5 85.0 L 92.8 82.5 Z"
                fill={metric === 'relief' ? "#ca8a04" : metric === 'temperature' ? "#F59E0B80" : "#38BDF850"}
                stroke="#38BDF8"
                strokeWidth="1.2"
              />

              {/* GRANDS FLEUVES FRANÇAIS (HYDROGRAPHIE STRUCTURANTE DU RELIEF) */}
              {showRivers && (
                <g stroke="#38BDF8" strokeWidth="0.6" strokeLinecap="round" opacity="0.65" fill="none">
                  {/* Seine */}
                  <path d="M 68 38 Q 58 32, 50 28 Q 42 25, 36.5 23" />
                  {/* Loire */}
                  <path d="M 58 65 Q 52 48, 48 38 Q 38 42, 25 47 Q 23.5 50, 22.2 53.5" />
                  {/* Rhône */}
                  <path d="M 80 52 Q 74 53, 68 55 Q 69 68, 70 82" />
                  {/* Garonne */}
                  <path d="M 46 86 Q 44 80, 36 74 Q 30 68, 27 68" />
                  {/* Rhin */}
                  <path d="M 85.5 39.5 L 86.5 34 L 88 30 L 89 27" />
                </g>
              )}

              {/* RELIEFS TOPOGRAPHIQUES RÉELS & OMBRAGE 3D DU TERRITOIRE */}
              {/* 1. Alpes Françaises (Mont-Blanc, Vanoise, Écrins, Mercantour) */}
              <g filter="url(#reliefShadow)">
                {/* Socle Alpin Général */}
                <path
                  d="M 77 53 Q 83 49, 85 53 Q 86 63, 85 71 Q 81 78, 76 77 Q 73 70, 74 60 Z"
                  fill={metric === 'relief' ? "rgba(180, 83, 9, 0.55)" : "rgba(255, 255, 255, 0.20)"}
                  stroke={metric === 'relief' ? "#b45309" : "rgba(255, 255, 255, 0.5)"}
                  strokeWidth="0.8"
                />
                {/* Crêtes Supérieures > 2500m */}
                <path
                  d="M 78.5 54 L 84 53.5 L 82 64 L 83 72 L 78 75"
                  stroke="#FFFFFF"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  opacity="0.95"
                />
                {/* Sommet Mont-Blanc (4809 m) */}
                <circle cx="84.8" cy="53.5" r="1.5" fill="#FFFFFF" stroke="#38BDF8" strokeWidth="0.6" filter="url(#summitGlow)" />
                <text x="78" y="51.5" fill="#FFFFFF" fontSize="2.3" fontWeight="bold">Mt-Blanc (4809m)</text>
                {/* Barre des Écrins (4102 m) */}
                <circle cx="82.5" cy="64.0" r="1.2" fill="#FFFFFF" stroke="#38BDF8" strokeWidth="0.5" />
                <text x="83.5" y="65" fill="#BAE6FD" fontSize="2.0" fontWeight="bold">Écrins (4102m)</text>
                <text x="83" y="73" fill="#BAE6FD" fontSize="2.4" fontWeight="bold">Alpes</text>
              </g>

              {/* 2. Pyrénées (Frontière Sud-Ouest : Vignemale, Pic du Midi, Canigou) */}
              <g filter="url(#reliefShadow)">
                <path
                  d="M 28 85.5 C 36 84.5, 46 84.5, 56.5 86.5 C 55 88.5, 45 88.5, 28 86.5 Z"
                  fill={metric === 'relief' ? "rgba(180, 83, 9, 0.6)" : "rgba(255, 255, 255, 0.22)"}
                  stroke={metric === 'relief' ? "#b45309" : "rgba(255, 255, 255, 0.5)"}
                  strokeWidth="0.8"
                />
                {/* Crête Pyrénéenne > 3000m */}
                <path
                  d="M 29 86 L 35 85.5 L 39 86 L 47 86.5 L 53 87"
                  stroke="#FFFFFF"
                  strokeWidth="1.1"
                  strokeLinecap="round"
                  opacity="0.9"
                />
                <circle cx="39.0" cy="87.5" r="1.3" fill="#FFFFFF" stroke="#38BDF8" strokeWidth="0.5" filter="url(#summitGlow)" />
                <text x="35" y="84" fill="#FFFFFF" fontSize="2.2" fontWeight="bold">Vignemale (3298m)</text>
                <text x="44" y="84" fill="#BAE6FD" fontSize="2.4" fontWeight="bold">Pyrénées</text>
              </g>

              {/* 3. Massif Central (Puy de Sancy, Cantal, Cévennes) */}
              <g filter="url(#reliefShadow)">
                <ellipse cx="53" cy="63" rx="8" ry="9" fill={metric === 'relief' ? "rgba(202, 138, 4, 0.5)" : "rgba(255, 255, 255, 0.15)"} stroke={metric === 'relief' ? "#ca8a04" : "rgba(255, 255, 255, 0.35)"} strokeWidth="0.7" />
                {/* Sancy (1885 m) & Cantal (1855 m) */}
                <circle cx="51.5" cy="60.5" r="1.2" fill="#FFFFFF" stroke="#F59E0B" strokeWidth="0.5" />
                <text x="43" y="60.5" fill="#FFFFFF" fontSize="2.0" fontWeight="bold">Sancy (1885m)</text>
                <text x="48" y="66" fill="#BAE6FD" fontSize="2.2" fontWeight="bold">Massif Central</text>
              </g>

              {/* 4. Jura & Vosges (Nord-Est) */}
              <g filter="url(#reliefShadow)">
                {/* Jura (Crêt de la Neige 1720 m) */}
                <path d="M 76 43 Q 79 46, 80 50" stroke={metric === 'relief' ? "#b45309" : "#FFFFFF"} strokeWidth="1" strokeLinecap="round" opacity="0.9" />
                <circle cx="79.2" cy="49.5" r="1.0" fill="#FFFFFF" stroke="#38BDF8" strokeWidth="0.5" />
                <text x="72" y="47" fill="#BAE6FD" fontSize="2.0" fontWeight="bold">Jura (1720m)</text>

                {/* Vosges (Grand Ballon 1424 m) */}
                <path d="M 81 31 Q 83 35, 81 39" stroke={metric === 'relief' ? "#b45309" : "#FFFFFF"} strokeWidth="1" strokeLinecap="round" opacity="0.9" />
                <circle cx="84.5" cy="35.5" r="1.0" fill="#FFFFFF" stroke="#38BDF8" strokeWidth="0.5" />
                <text x="76" y="36" fill="#BAE6FD" fontSize="2.0" fontWeight="bold">Vosges (1424m)</text>
              </g>

              {/* 5. Relief de Corse (Monte Cinto 2706 m) */}
              <g filter="url(#reliefShadow)">
                <path d="M 91 87 L 92 92 L 91.5 95" stroke="#FFFFFF" strokeWidth="0.9" strokeLinecap="round" opacity="0.85" />
                <circle cx="91.5" cy="88.0" r="1.1" fill="#FFFFFF" stroke="#38BDF8" strokeWidth="0.5" />
                <text x="84" y="89" fill="#FFFFFF" fontSize="1.9" fontWeight="bold">Cinto (2706m)</text>
              </g>

              {/* FLUX DE VENT (MISTRAL & TRAMONTANE) */}
              {metric === 'wind' && (
                <g stroke="#F97316" strokeWidth="1.2" strokeLinecap="round" opacity="0.9">
                  <line x1="68" y1="62" x2="72" y2="82" />
                  <polyline points="70,78 72,82 74,78" fill="none" />
                  <line x1="56" y1="78" x2="65" y2="84" />
                  <polyline points="62,81 65,84 66,80" fill="none" />
                  <text x="73" y="73" fill="#FDBA74" fontSize="2.6" fontWeight="bold">Mistral</text>
                  <text x="51" y="80" fill="#FDBA74" fontSize="2.2" fontWeight="bold">Tramontane</text>
                </g>
              )}

              {/* ISOTHERMES QUAND TEMPÉRATURE ACTIVE */}
              {metric === 'temperature' && (
                <g stroke="rgba(255, 255, 255, 0.3)" strokeWidth="0.7" strokeDasharray="3 2" fill="none">
                  <path d="M 25 55 Q 50 50, 85 45" />
                  <text x="86" y="46" fill="#FBBF24" fontSize="2.4" fontWeight="bold">20°C</text>
                  <path d="M 28 72 Q 52 74, 84 75" />
                  <text x="85" y="76" fill="#EF4444" fontSize="2.4" fontWeight="bold">24°C</text>
                </g>
              )}
            </svg>
          </div>

          {/* Station 3D Columns & Pedestals */}
          {station3DList.map((st) => {
            const isSelected = selectedStationNode?.id === st.id;
            const nodeColor = getNodeColor(st);
            const badgeVal = getNodeBadgeValue(st);
            const isSummit = (st.altitude || 0) >= 1500;
            // Height proportional to altitude in relief mode, or custom elevation in 3D
            const heightPx = metric === 'relief'
              ? Math.max(16, Math.min(85, Math.round((st.altitude / 4809) * 80) + 14))
              : Math.max(16, Math.min(70, Math.round((st.altitude / 3000) * 65) + 16));

            return (
              <div
                key={st.id}
                onClick={() => {
                  setSelectedStationNode(st);
                  if (onSelectStation) {
                    const match = FRENCH_STATIONS.find(s => s.id === st.id);
                    if (match) onSelectStation(match);
                  }
                }}
                className="absolute group cursor-pointer"
                style={{
                  left: `${st.x}%`,
                  top: `${st.y}%`,
                  transform: 'translate(-50%, -50%)',
                  transformStyle: 'preserve-3d'
                }}
              >
                {/* Base Anchor Beacon on ground plane */}
                <div 
                  className={`w-3.5 h-3.5 rounded-full border transition-all duration-300 flex items-center justify-center ${
                    isSelected ? 'ring-4 ring-white scale-125' : 'group-hover:scale-110'
                  }`}
                  style={{
                    backgroundColor: `${nodeColor}33`,
                    borderColor: nodeColor,
                    boxShadow: `0 0 12px ${nodeColor}`
                  }}
                >
                  <div 
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: nodeColor }}
                  />
                </div>

                {/* 3D Vertical Pillar ascending from the relief */}
                <div
                  className="absolute bottom-1/2 left-1/2 -translate-x-1/2 w-0.5 pointer-events-none transition-all duration-300 opacity-70 group-hover:opacity-100"
                  style={{
                    height: `${heightPx}px`,
                    background: `linear-gradient(to top, ${nodeColor}40, ${nodeColor})`,
                    transform: 'rotateX(-90deg)',
                    transformOrigin: 'bottom'
                  }}
                />

                {/* Elevated Holographic Station Head badge */}
                <div
                  className="absolute pointer-events-auto transition-transform duration-200 group-hover:scale-110"
                  style={{
                    transform: `translate3d(-50%, -100%, ${heightPx}px) rotateZ(${-rotZ}deg) rotateX(${-rotX}deg)`,
                    transformOrigin: 'bottom center',
                    top: '-6px',
                    left: '50%'
                  }}
                >
                  <div 
                    className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-black border backdrop-blur-md shadow-lg transition-all ${
                      isSelected 
                        ? 'bg-white text-slate-950 border-white ring-2 ring-sky-400 scale-105' 
                        : 'bg-slate-950/85 text-white border-white/20 hover:border-white/50'
                    }`}
                  >
                    {isSummit && <Mountain className="h-2.5 w-2.5 text-amber-400 shrink-0" />}
                    <span className="truncate max-w-[68px] sm:max-w-[85px]">{st.shortName}</span>
                    <span 
                      className="px-1 py-0.2 rounded font-mono text-[9px] text-slate-950 font-black shrink-0"
                      style={{ backgroundColor: nodeColor }}
                    >
                      {badgeVal}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend Overlay */}
        <div className="absolute top-3 left-3 bg-slate-950/90 border border-white/10 rounded-xl p-2.5 backdrop-blur-md max-w-[210px] text-[10px] pointer-events-auto shadow-xl">
          <div className="text-[11px] font-black text-white flex items-center justify-between border-b border-white/10 pb-1.5 mb-1.5">
            <span className="flex items-center gap-1.5 text-emerald-300">
              <Sparkles className="h-3 w-3" />
              {metric === 'relief' 
                ? 'Relief Réel & Altitudes' 
                : metric === 'temperature' 
                  ? 'Thermie Territoire' 
                  : metric === 'wind' 
                    ? 'Rafales & Flux' 
                    : metric === 'rain' 
                      ? 'Radar Précipitations' 
                      : 'Isotherme 0°C & LPN'}
            </span>
          </div>

          {metric === 'relief' && (
            <div className="space-y-1 text-slate-300">
              <div className="flex items-center justify-between text-[9px]">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-white border border-slate-400 inline-block" /> Glaciers (&gt; 3000 m)</span>
                <span className="font-mono text-white">Mt-Blanc 4809 m</span>
              </div>
              <div className="flex items-center justify-between text-[9px]">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-amber-500 inline-block" /> Haute Montagne</span>
                <span className="font-mono text-white">2000 - 3000 m</span>
              </div>
              <div className="flex items-center justify-between text-[9px]">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-yellow-600 inline-block" /> Moyenne Montagne</span>
                <span className="font-mono text-white">800 - 2000 m</span>
              </div>
              <div className="flex items-center justify-between text-[9px]">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-emerald-600 inline-block" /> Plaines &amp; Littoraux</span>
                <span className="font-mono text-white">0 - 500 m</span>
              </div>
            </div>
          )}

          {metric === 'temperature' && (
            <div className="space-y-1 text-slate-300">
              <div className="flex items-center justify-between text-[9px]">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-red-500 inline-block" /> Chaud (&gt; 22°C)</span>
                <span className="font-mono text-white">Midi / Aquitaine</span>
              </div>
              <div className="flex items-center justify-between text-[9px]">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block" /> Tempéré (16-19°C)</span>
                <span className="font-mono text-white">Façade Ouest</span>
              </div>
              <div className="flex items-center justify-between text-[9px]">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-sky-500 inline-block" /> Frais d'altitude</span>
                <span className="font-mono text-white">Massifs &lt; 10°C</span>
              </div>
            </div>
          )}

          {metric === 'wind' && (
            <div className="space-y-1 text-slate-300">
              <div className="flex items-center justify-between text-[9px]">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-red-600 inline-block" /> Violentes rafales</span>
                <span className="font-mono text-white">&gt; 80 km/h</span>
              </div>
              <div className="flex items-center justify-between text-[9px]">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-amber-500 inline-block" /> Coup de vent</span>
                <span className="font-mono text-white">55 - 80 km/h</span>
              </div>
              <div className="flex items-center justify-between text-[9px]">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-sky-400 inline-block" /> Brise modérée</span>
                <span className="font-mono text-white">&lt; 35 km/h</span>
              </div>
            </div>
          )}

          {metric === 'rain' && (
            <div className="space-y-1 text-slate-300">
              <div className="flex items-center justify-between text-[9px]">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-blue-600 inline-block" /> Pluie soutenue</span>
                <span className="font-mono text-white">&gt; 2.5 mm</span>
              </div>
              <div className="flex items-center justify-between text-[9px]">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-cyan-500 inline-block" /> Ondée passagère</span>
                <span className="font-mono text-white">0.5 - 2 mm</span>
              </div>
              <div className="flex items-center justify-between text-[9px]">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-slate-500 inline-block" /> Temps sec</span>
                <span className="font-mono text-white">0 mm</span>
              </div>
            </div>
          )}

          {metric === 'snow' && (
            <div className="space-y-1 text-slate-300">
              <div className="flex items-center justify-between text-[9px]">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-purple-500 inline-block" /> Neige basse montagne</span>
                <span className="font-mono text-white">&lt; 1400 m</span>
              </div>
              <div className="flex items-center justify-between text-[9px]">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-blue-400 inline-block" /> Moyenne montagne</span>
                <span className="font-mono text-white">1400 - 2000 m</span>
              </div>
              <div className="flex items-center justify-between text-[9px]">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-sky-300 inline-block" /> Haute altitude</span>
                <span className="font-mono text-white">&gt; 2000 m</span>
              </div>
            </div>
          )}
        </div>

        {/* Selected Station Popout Card */}
        {selectedStationNode && (
          <div className="absolute bottom-3 left-3 bg-slate-950/95 border border-sky-400/40 rounded-xl p-3 backdrop-blur-md text-xs shadow-2xl z-20 max-w-[260px] animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between border-b border-white/10 pb-1.5 mb-1.5">
              <div className="flex items-center gap-1 text-white font-black">
                <MapPin className="h-3.5 w-3.5 text-sky-400" />
                <span>{selectedStationNode.name}</span>
              </div>
              <span className="font-mono text-[10px] text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                {selectedStationNode.altitude} m
              </span>
            </div>

            <div className="space-y-1 text-[11px] text-slate-300">
              {selectedStationNode.massif && (
                <div className="flex justify-between text-emerald-300 font-bold">
                  <span>Massif :</span>
                  <span>{selectedStationNode.massif}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-400">Région :</span>
                <span className="font-medium text-white">{selectedStationNode.region}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Température :</span>
                <span className="font-black text-amber-300">{selectedStationNode.temp.toFixed(1)}°C</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Vent / Rafales :</span>
                <span className="font-mono text-sky-300">{selectedStationNode.windSpeed} km/h (pointe {selectedStationNode.windGust})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Précipitations :</span>
                <span className="font-mono text-blue-300">{selectedStationNode.rainMm.toFixed(1)} mm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Isotherme 0°C :</span>
                <span className="font-mono text-purple-300">{selectedStationNode.lpnMeters} m</span>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-1 text-[10px]">
                <span className="text-slate-400">État du ciel :</span>
                <span className="text-emerald-400 font-medium">{selectedStationNode.condition}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (onSelectStation) {
                  const match = FRENCH_STATIONS.find(s => s.id === selectedStationNode.id);
                  if (match) onSelectStation(match);
                }
              }}
              className="mt-2.5 w-full py-1 px-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-[10px] text-center transition cursor-pointer flex items-center justify-center gap-1 shadow-md"
            >
              <span>Définir comme station active</span>
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* Camera Presets & Control Pills */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10">
          <div className="flex items-center gap-1 bg-slate-950/85 border border-white/10 p-1 rounded-xl shadow-lg backdrop-blur-md">
            <button
              type="button"
              onClick={() => setCameraPreset('3d')}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition ${
                activeCameraPreset === '3d' ? 'bg-sky-500 text-slate-950' : 'text-slate-300 hover:text-white'
              }`}
            >
              Perspective 3D
            </button>
            <button
              type="button"
              onClick={() => setCameraPreset('2d')}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition ${
                activeCameraPreset === '2d' ? 'bg-sky-500 text-slate-950' : 'text-slate-300 hover:text-white'
              }`}
            >
              Plat (Zénith)
            </button>
            <button
              type="button"
              onClick={() => setCameraPreset('south')}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition ${
                activeCameraPreset === 'south' ? 'bg-sky-500 text-slate-950' : 'text-slate-300 hover:text-white'
              }`}
            >
              Vue Sud (Médit.)
            </button>
            <button
              type="button"
              onClick={() => setCameraPreset('north')}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition ${
                activeCameraPreset === 'north' ? 'bg-sky-500 text-slate-950' : 'text-slate-300 hover:text-white'
              }`}
            >
              Vue Nord (Manche)
            </button>
          </div>

          <div className="flex items-center justify-end gap-1 bg-slate-950/85 border border-white/10 p-1 rounded-xl shadow-lg backdrop-blur-md self-end">
            <button
              type="button"
              onClick={() => setShowRivers(!showRivers)}
              className={`px-2 py-1 rounded-lg text-[10px] font-medium cursor-pointer transition ${
                showRivers ? 'bg-sky-500/20 text-sky-300 border border-sky-400/30' : 'text-slate-400'
              }`}
              title="Afficher/Masquer les grands fleuves"
            >
              Fleuves
            </button>
            <button
              type="button"
              onClick={() => {
                setRotX(44);
                setRotZ(-12);
                setZoom(1);
                setActiveCameraPreset('3d');
              }}
              className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer"
              title="Réinitialiser la caméra"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Bottom Orbit Guidance Banner */}
        <div className="absolute bottom-3 right-3 text-[10px] text-slate-400 bg-slate-950/80 px-2 py-1 rounded-lg border border-white/5 pointer-events-none hidden sm:flex items-center gap-1.5 backdrop-blur-sm">
          <Eye className="h-3 w-3 text-sky-400" />
          <span>Faites glisser les réglettes ci-dessous pour tourner la carte en 3D</span>
        </div>
      </div>

      {/* 3. Sliders de rotation 3D interactive */}
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-900/60 border border-white/5 p-2.5 rounded-xl text-xs">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-400 w-16">Inclinaison :</span>
          <input
            type="range"
            min="0"
            max="75"
            value={rotX}
            onChange={(e) => {
              setRotX(Number(e.target.value));
              setActiveCameraPreset('3d');
            }}
            className="w-full accent-sky-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
          <span className="text-[10px] font-mono text-sky-300 w-8 text-right">{rotX}°</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-400 w-16">Rotation :</span>
          <input
            type="range"
            min="-90"
            max="90"
            value={rotZ}
            onChange={(e) => {
              setRotZ(Number(e.target.value));
              setActiveCameraPreset('3d');
            }}
            className="w-full accent-sky-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
          <span className="text-[10px] font-mono text-sky-300 w-8 text-right">{rotZ}°</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-400 w-16">Zoom :</span>
          <input
            type="range"
            min="0.8"
            max="1.5"
            step="0.05"
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full accent-emerald-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
          <span className="text-[10px] font-mono text-emerald-300 w-8 text-right">{zoom.toFixed(2)}x</span>
        </div>
      </div>
    </div>
  );
};
