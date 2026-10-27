import React, { useState, useMemo, useRef } from 'react';
import { LocationPoint } from '../types/weather';
import { FRENCH_STATIONS } from '../data/frenchStations';
import { 
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
  Sparkles
} from 'lucide-react';

export type Map3DMetric = 'temperature' | 'wind' | 'rain' | 'snow';

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
}

export const Aura3DAtmosphericMap: React.FC<Aura3DAtmosphericMapProps> = ({
  initialMetric = 'temperature',
  currentStation,
  onSelectStation,
  title
}) => {
  const [metric, setMetric] = useState<Map3DMetric>(initialMetric);
  const [rotX, setRotX] = useState<number>(42); // Pitch (inclinaison)
  const [rotZ, setRotZ] = useState<number>(-12); // Yaw (orientation 3D)
  const [zoom, setZoom] = useState<number>(1);
  const [activeCameraPreset, setActiveCameraPreset] = useState<'3d' | '2d' | 'south' | 'north'>('3d');
  const [selectedStationNode, setSelectedStationNode] = useState<Station3DNode | null>(null);

  // Échantillonnage de stations réparties sur les grands secteurs et reliefs de France
  const station3DList: Station3DNode[] = useMemo(() => {
    const benchmarkData: Record<string, { 
      short: string;
      x: number; 
      y: number; 
      temp: number; 
      wind: number; 
      gust: number; 
      rain: number; 
      lpn: number; 
      cond: string;
      region: string;
    }> = {
      'paris': { short: 'Paris', x: 50, y: 28, temp: 18.2, wind: 18, gust: 32, rain: 0.2, lpn: 2200, cond: 'Éclaircies', region: 'Île-de-France' },
      'lille': { short: 'Lille', x: 53, y: 11, temp: 16.5, wind: 24, gust: 42, rain: 1.2, lpn: 1900, cond: 'Nuageux', region: 'Hauts-de-France' },
      'brest': { short: 'Brest', x: 12, y: 34, temp: 15.8, wind: 36, gust: 60, rain: 3.6, lpn: 1800, cond: 'Averses', region: 'Bretagne' },
      'rennes': { short: 'Rennes', x: 26, y: 37, temp: 17.1, wind: 22, gust: 38, rain: 0.8, lpn: 2100, cond: 'Ciel voilé', region: 'Bretagne' },
      'strasbourg': { short: 'Strasbourg', x: 88, y: 31, temp: 19.4, wind: 12, gust: 22, rain: 0.0, lpn: 2400, cond: 'Ensoleillé', region: 'Grand Est' },
      'nantes': { short: 'Nantes', x: 25, y: 47, temp: 18.0, wind: 20, gust: 35, rain: 0.4, lpn: 2250, cond: 'Belles éclaircies', region: 'Pays de la Loire' },
      'bordeaux': { short: 'Bordeaux', x: 30, y: 68, temp: 21.0, wind: 16, gust: 28, rain: 0.0, lpn: 2600, cond: 'Beau temps', region: 'Nouvelle-Aquitaine' },
      'toulouse': { short: 'Toulouse', x: 45, y: 80, temp: 22.3, wind: 19, gust: 34, rain: 0.0, lpn: 2800, cond: 'Soleil', region: 'Occitanie' },
      'lyon': { short: 'Lyon', x: 68, y: 55, temp: 20.1, wind: 15, gust: 26, rain: 0.1, lpn: 2450, cond: 'Doux & voilé', region: 'Auvergne-Rhône-Alpes' },
      'marseille': { short: 'Marseille', x: 70, y: 84, temp: 23.2, wind: 42, gust: 68, rain: 0.0, lpn: 2950, cond: 'Grand soleil mistral', region: 'PACA' },
      'nice': { short: 'Nice', x: 86, y: 80, temp: 22.8, wind: 14, gust: 24, rain: 0.0, lpn: 2900, cond: 'Ensoleillé', region: 'Côte d\'Azur' },
      'clermont': { short: 'Clermont-Fd', x: 52, y: 58, temp: 18.6, wind: 18, gust: 30, rain: 0.3, lpn: 2300, cond: 'Éclaircies', region: 'Massif Central' },
      'chamonix': { short: 'Chamonix', x: 84, y: 53, temp: 11.2, wind: 22, gust: 48, rain: 1.8, lpn: 1650, cond: 'Frais montagnard', region: 'Alpes du Nord' },
      'mont-ventoux': { short: 'Mt Ventoux', x: 69, y: 76, temp: 8.5, wind: 65, gust: 98, rain: 0.2, lpn: 1400, cond: 'Violent mistral', region: 'Provence' },
      'pic-du-midi': { short: 'Pic du Midi', x: 38, y: 86, temp: 4.8, wind: 48, gust: 78, rain: 1.5, lpn: 1150, cond: 'Froid d\'altitude', region: 'Pyrénées' },
      'ajaccio': { short: 'Ajaccio', x: 92, y: 92, temp: 23.5, wind: 22, gust: 38, rain: 0.0, lpn: 3100, cond: 'Soleil corse', region: 'Corse' }
    };

    return Object.entries(benchmarkData).map(([key, data]) => {
      const match = FRENCH_STATIONS.find(s => s.id.toLowerCase().includes(key) || s.name.toLowerCase().includes(key)) || {
        id: key,
        name: data.short,
        altitude: 120
      };
      return {
        id: match.id,
        name: match.name,
        shortName: data.short,
        x: data.x,
        y: data.y,
        altitude: match.altitude || 100,
        temp: data.temp,
        windSpeed: data.wind,
        windGust: data.gust,
        rainMm: data.rain,
        lpnMeters: data.lpn,
        condition: data.cond,
        region: data.region
      };
    });
  }, []);

  const getNodeColor = (node: Station3DNode) => {
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
    if (metric === 'temperature') return `${node.temp.toFixed(1)}°C`;
    if (metric === 'wind') return `${node.windGust} km/h`;
    if (metric === 'rain') return `${node.rainMm.toFixed(1)} mm`;
    return `${node.lpnMeters} m`;
  };

  const setCameraPreset = (preset: '3d' | '2d' | 'south' | 'north') => {
    setActiveCameraPreset(preset);
    if (preset === '3d') {
      setRotX(42);
      setRotZ(-12);
      setZoom(1);
    } else if (preset === '2d') {
      setRotX(0);
      setRotZ(0);
      setZoom(1.02);
    } else if (preset === 'south') {
      setRotX(55);
      setRotZ(20);
      setZoom(1.08);
    } else if (preset === 'north') {
      setRotX(42);
      setRotZ(-32);
      setZoom(1.05);
    }
  };

  return (
    <div className="w-full rounded-2xl border border-sky-500/30 bg-gradient-to-b from-slate-950 via-[#070E1C] to-slate-950 p-4 sm:p-5 shadow-2xl overflow-hidden my-3 select-none">
      {/* 1. Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 rounded-xl bg-gradient-to-tr from-sky-600 to-amber-500 p-0.5 items-center justify-center text-white shadow-md">
            <div className="w-full h-full bg-slate-950/60 rounded-[10px] flex items-center justify-center">
              <Compass className="h-4 w-4 text-sky-300 animate-spin [animation-duration:16s]" />
            </div>
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-black text-white flex items-center gap-2">
              <span>{title || 'Modélisation 3D Atmosphérique du Territoire Français'}</span>
              <span className="text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Temps Réel
              </span>
            </h4>
            <p className="text-[10px] text-slate-400">
              Modèle numérique spatialisé de la France • Gradient d'altitude, isothermes et dynamique des masses d'air.
            </p>
          </div>
        </div>

        {/* Metric Selector Buttons */}
        <div className="flex items-center gap-1 bg-slate-900/90 border border-white/10 p-1 rounded-xl shrink-0 overflow-x-auto">
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
        className="relative w-full h-[380px] sm:h-[460px] rounded-2xl bg-[#02050A] border border-sky-500/20 overflow-hidden flex items-center justify-center cursor-move"
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
          className="relative w-[340px] sm:w-[460px] h-[340px] sm:h-[460px] transition-transform duration-150 ease-out"
          style={{
            transform: `rotateX(${rotX}deg) rotateZ(${rotZ}deg) scale(${zoom})`,
            transformStyle: 'preserve-3d'
          }}
        >
          {/* Base relief map plate of France with realistic vector contours */}
          <div 
            className="absolute inset-0 rounded-3xl border border-sky-500/30 bg-gradient-to-br from-slate-900/95 via-[#08152A] to-slate-950/95 shadow-[0_35px_80px_rgba(0,0,0,0.9),inset_0_0_35px_rgba(56,189,248,0.15)]"
            style={{
              transform: 'translateZ(-18px)'
            }}
          >
            {/* SVG RÉALISTE DE LA FRANCE MÉTROPOLITAINE & CORSE AVEC RELIEF ET DONNÉES */}
            <svg viewBox="0 0 100 100" className="w-full h-full p-4" fill="none">
              <defs>
                {/* Dégradé Thermique Spatial France */}
                <linearGradient id="franceThermalGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.4" />
                  <stop offset="40%" stopColor="#10B981" stopOpacity="0.35" />
                  <stop offset="75%" stopColor="#F59E0B" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#EF4444" stopOpacity="0.5" />
                </linearGradient>

                {/* Dégradé Vent Spatial */}
                <radialGradient id="franceWindMistral" cx="70%" cy="80%" r="35%">
                  <stop offset="0%" stopColor="#F97316" stopOpacity="0.55" />
                  <stop offset="50%" stopColor="#38BDF8" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                </radialGradient>

                {/* Dégradé Précipitations Radar */}
                <radialGradient id="franceRainRadar" cx="25%" cy="35%" r="40%">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity="0.6" />
                  <stop offset="60%" stopColor="#06B6D4" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                </radialGradient>

                {/* Ombre des Massifs Montagneux */}
                <filter id="reliefShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="1" dy="2" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.6" />
                </filter>
              </defs>

              {/* CONTOUR RÉALISTE HAUTE PRÉCISION DE LA FRANCE MÉTROPOLITAINE */}
              <path
                d="M 53.2 8.8
                   L 54.5 10.2 L 56.8 12.0 L 59.5 13.8 L 62.2 15.2 L 65.5 17.5 L 68.2 18.8 L 72.0 20.8
                   L 75.8 22.0 L 78.5 22.8 L 81.2 24.2 L 83.8 25.5 L 85.5 27.2 L 86.8 29.5 L 85.2 32.8
                   L 84.5 35.2 L 83.2 38.0 L 81.5 40.5 L 80.2 43.5 L 81.0 45.8 L 82.2 48.0 L 84.0 51.5
                   L 84.5 53.8 L 85.2 57.5 L 86.5 63.0 L 85.8 67.5 L 86.8 72.0 L 88.0 76.2 L 87.8 78.5
                   L 86.0 79.5 L 83.5 80.8 L 80.8 82.5 L 78.0 84.8 L 75.5 84.2 L 73.0 83.2 L 70.0 82.0
                   L 66.8 82.5 L 63.5 84.0 L 59.8 86.2 L 57.5 87.5 L 54.0 87.8 L 49.0 87.5 L 43.5 87.5
                   L 38.0 87.2 L 32.5 86.8 L 27.8 86.2 L 26.2 85.0 L 26.8 81.5 L 27.5 78.0 L 27.2 73.5
                   L 27.8 70.0 L 26.5 67.2 L 24.5 65.5 L 24.2 62.5 L 25.5 60.0 L 24.5 57.5 L 22.8 54.5
                   L 22.2 51.5 L 20.5 49.2 L 18.2 47.5 L 15.8 45.5 L 12.8 43.8 L 10.2 42.0 L 8.5 39.5
                   L 7.8 37.5 L 9.2 35.8 L 12.0 35.0 L 14.8 35.2 L 18.5 34.2 L 21.8 34.5 L 24.8 33.8
                   L 27.5 32.8 L 29.2 31.0 L 29.8 28.5 L 28.8 25.5 L 29.5 23.5 L 31.5 22.5 L 33.8 23.0
                   L 36.8 25.5 L 39.2 24.5 L 42.5 21.5 L 45.5 18.8 L 47.2 16.5 L 49.0 13.5 L 51.5 11.2 Z"
                fill={
                  metric === 'temperature'
                    ? "url(#franceThermalGrad)"
                    : metric === 'wind'
                      ? "url(#franceWindMistral)"
                      : metric === 'rain'
                        ? "url(#franceRainRadar)"
                        : "rgba(168, 85, 247, 0.25)"
                }
                stroke="#38BDF8"
                strokeWidth="1.2"
                strokeDasharray={metric === 'wind' ? "4 2" : "none"}
                className="transition-colors duration-500"
              />

              {/* CORSE RÉALISTE AVEC CAP CORSE ET RELIEFS */}
              <path
                d="M 92.5 84.5
                   L 93.8 86.2 L 94.2 89.0 L 94.5 92.5 L 93.8 95.8 L 92.5 98.0 L 91.2 97.5
                   L 90.0 95.5 L 88.8 93.2 L 89.2 90.5 L 89.8 87.8 L 91.0 85.5 Z"
                fill={metric === 'temperature' ? "#F59E0B80" : "#38BDF850"}
                stroke="#38BDF8"
                strokeWidth="1.1"
              />

              {/* RELIEFS TOPOGRAPHIQUES 3D RÉALISTES & COUCHES HYPSOMÉTRIQUES */}
              {/* 1. Alpes Françaises (Sud-Est : Mont-Blanc, Vanoise, Écrins, Mercantour) */}
              <g filter="url(#reliefShadow)">
                <path
                  d="M 77 53 Q 83 50, 85 54 Q 86 63, 85 71 Q 81 78, 77 78 Q 74 72, 75 62 Z"
                  fill="rgba(255, 255, 255, 0.20)"
                  stroke="rgba(255, 255, 255, 0.5)"
                  strokeWidth="0.8"
                />
                {/* Crêtes Alpinistes Haute Altitude > 3000m */}
                <path
                  d="M 79 55 L 83 58 L 81 65 L 82 72 L 78 74"
                  stroke="#FFFFFF"
                  strokeWidth="1"
                  strokeLinecap="round"
                  opacity="0.9"
                />
                <circle cx="83.8" cy="53.8" r="1.3" fill="#FFFFFF" stroke="#38BDF8" strokeWidth="0.5" />
                <text x="79" y="52" fill="#FFFFFF" fontSize="2.2" fontWeight="bold">Mt-Blanc (4807m)</text>
                <text x="83" y="66" fill="#BAE6FD" fontSize="2.5" fontWeight="bold">Alpes</text>
              </g>

              {/* 2. Pyrénées (Chaîne Frontalière Sud-Ouest) */}
              <g filter="url(#reliefShadow)">
                <path
                  d="M 27 85 C 36 84, 46 84, 57 86 C 56 88, 45 88, 27 86 Z"
                  fill="rgba(255, 255, 255, 0.20)"
                  stroke="rgba(255, 255, 255, 0.5)"
                  strokeWidth="0.8"
                />
                {/* Ligne de Crête Pyrénéenne */}
                <path
                  d="M 28 85.5 L 36 85.2 L 44 85.4 L 52 86 L 56 86.8"
                  stroke="#FFFFFF"
                  strokeWidth="0.9"
                  strokeLinecap="round"
                  opacity="0.85"
                />
                <text x="39" y="84" fill="#BAE6FD" fontSize="2.4" fontWeight="bold">Pyrénées</text>
              </g>

              {/* 3. Massif Central (Volcans d'Auvergne, Cantal & Cévennes) */}
              <g filter="url(#reliefShadow)">
                <ellipse cx="53" cy="63" rx="7.5" ry="8.5" fill="rgba(255, 255, 255, 0.14)" stroke="rgba(255, 255, 255, 0.35)" strokeWidth="0.7" />
                <circle cx="52" cy="59" r="1.8" fill="rgba(255, 255, 255, 0.25)" stroke="#38BDF8" strokeWidth="0.5" />
                <text x="46" y="64" fill="#BAE6FD" fontSize="2.2" fontWeight="bold" opacity="0.9">Massif Central</text>
              </g>

              {/* 4. Jura & Vosges (Nord-Est) */}
              <g filter="url(#reliefShadow)">
                {/* Jura */}
                <path d="M 76 43 Q 79 46, 80 50" stroke="#FFFFFF" strokeWidth="0.8" strokeLinecap="round" opacity="0.8" />
                <text x="73" y="47" fill="#BAE6FD" fontSize="1.9" fontWeight="bold">Jura</text>
                {/* Vosges */}
                <path d="M 81 31 Q 82 35, 80 39" stroke="#FFFFFF" strokeWidth="0.8" strokeLinecap="round" opacity="0.8" />
                <text x="77" y="36" fill="#BAE6FD" fontSize="1.9" fontWeight="bold">Vosges</text>
              </g>

              {/* 5. Monts d'Arrée (Massif Armoricain Bretagne) */}
              <path d="M 14 36 Q 19 37, 22 38" stroke="rgba(255,255,255,0.4)" strokeWidth="0.6" strokeLinecap="round" />

              {/* FLUX DE VENT (MISTRAL & TRAMONTANE) QUAND MÉTROLOGIE DU VENT ACTIVE */}
              {metric === 'wind' && (
                <g stroke="#F97316" strokeWidth="1" strokeLinecap="round" opacity="0.85">
                  {/* Flèche Mistral Vallée du Rhône */}
                  <line x1="68" y1="62" x2="70" y2="82" markerEnd="url(#arrow)" />
                  <line x1="67" y1="68" x2="69" y2="81" strokeDasharray="2 2" />
                  {/* Flèche Tramontane */}
                  <line x1="56" y1="78" x2="65" y2="84" />
                  <text x="71" y="73" fill="#FDBA74" fontSize="2.5" fontWeight="bold">Mistral</text>
                  <text x="51" y="80" fill="#FDBA74" fontSize="2.2" fontWeight="bold">Tramontane</text>
                </g>
              )}

              {/* LIGNES ISOTHERMES QUAND TEMPÉRATURE ACTIVE */}
              {metric === 'temperature' && (
                <g stroke="rgba(255, 255, 255, 0.22)" strokeWidth="0.6" strokeDasharray="3 2" fill="none">
                  {/* Isotherme 20°C */}
                  <path d="M 25 55 Q 50 50, 85 45" />
                  <text x="86" y="46" fill="#FBBF24" fontSize="2.4" fontWeight="bold">20°C</text>
                  {/* Isotherme 24°C */}
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
            const heightPx = Math.max(16, Math.min(70, Math.round((st.altitude / 3000) * 65) + 16));

            return (
              <div
                key={st.id}
                onClick={() => {
                  setSelectedStationNode(st);
                  const matched = FRENCH_STATIONS.find(s => s.id === st.id);
                  if (matched && onSelectStation) onSelectStation(matched);
                }}
                className="absolute transition-transform hover:scale-125 cursor-pointer group"
                style={{
                  left: `${st.x}%`,
                  top: `${st.y}%`,
                  transform: `translate(-50%, -50%) translateZ(${heightPx}px)`,
                  transformStyle: 'preserve-3d'
                }}
              >
                {/* 3D Vertical Pillar from terrain up to the node */}
                <div
                  className="absolute left-1/2 -translate-x-1/2 bottom-0 w-1 bg-gradient-to-t from-slate-700/60 to-white/90 pointer-events-none rounded-full"
                  style={{
                    height: `${heightPx}px`,
                    transform: `rotateX(-${rotX}deg) rotateZ(-${rotZ}deg) translateY(${heightPx}px)`
                  }}
                />

                {/* Glowing Node Sphere */}
                <div
                  className="relative flex items-center justify-center rounded-full p-1.5 shadow-xl transition-all"
                  style={{
                    backgroundColor: `${nodeColor}35`,
                    borderColor: nodeColor,
                    borderWidth: isSelected ? '2.5px' : '1.5px',
                    boxShadow: isSelected ? `0 0 24px ${nodeColor}` : `0 0 16px ${nodeColor}80`
                  }}
                >
                  <div
                    className="w-3.5 h-3.5 rounded-full animate-pulse"
                    style={{ backgroundColor: nodeColor }}
                  />

                  {/* Node Value Label Floating above pillar */}
                  <div
                    className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap px-1.5 py-0.5 rounded-md text-[9px] font-black border shadow-lg pointer-events-none"
                    style={{
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      borderColor: nodeColor,
                      color: nodeColor,
                      transform: `rotateX(-${rotX}deg) rotateZ(-${rotZ}deg)`
                    }}
                  >
                    {badgeVal}
                  </div>

                  {/* Station Name Floating under pillar */}
                  <div
                    className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-bold text-slate-300 pointer-events-none group-hover:text-white group-hover:font-black transition-colors"
                    style={{
                      transform: `rotateX(-${rotX}deg) rotateZ(-${rotZ}deg)`
                    }}
                  >
                    {st.shortName}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Camera Preset Quick Bar (Top Left) */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-slate-950/85 backdrop-blur-md border border-white/10 p-1 rounded-xl text-[10px] font-bold z-30">
          <button
            type="button"
            onClick={() => setCameraPreset('3d')}
            className={`px-2 py-1 rounded-lg transition cursor-pointer ${
              activeCameraPreset === '3d' ? 'bg-sky-500 text-slate-950 font-black' : 'text-slate-300 hover:text-white'
            }`}
          >
            Vue 3D
          </button>
          <button
            type="button"
            onClick={() => setCameraPreset('2d')}
            className={`px-2 py-1 rounded-lg transition cursor-pointer ${
              activeCameraPreset === '2d' ? 'bg-sky-500 text-slate-950 font-black' : 'text-slate-300 hover:text-white'
            }`}
          >
            Vue Ciel (2D)
          </button>
          <button
            type="button"
            onClick={() => setCameraPreset('south')}
            className={`px-2 py-1 rounded-lg transition cursor-pointer ${
              activeCameraPreset === 'south' ? 'bg-sky-500 text-slate-950 font-black' : 'text-slate-300 hover:text-white'
            }`}
          >
            Vue Sud &amp; Méditerranée
          </button>
          <button
            type="button"
            onClick={() => setCameraPreset('north')}
            className={`px-2 py-1 rounded-lg transition cursor-pointer ${
              activeCameraPreset === 'north' ? 'bg-sky-500 text-slate-950 font-black' : 'text-slate-300 hover:text-white'
            }`}
          >
            Vue Nord
          </button>
        </div>

        {/* Camera Sliders Floating HUD (Bottom) */}
        <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 bg-slate-950/85 backdrop-blur-md border border-white/10 px-3.5 py-2 rounded-xl text-xs z-30">
          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase font-mono text-slate-400 font-bold">Orientation 3D :</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-400">Pitch ({rotX}°)</span>
              <input
                type="range"
                min="0"
                max="65"
                value={rotX}
                onChange={(e) => {
                  setRotX(Number(e.target.value));
                  setActiveCameraPreset('3d');
                }}
                className="w-16 accent-sky-400 h-1 cursor-pointer"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-400">Yaw ({rotZ}°)</span>
              <input
                type="range"
                min="-60"
                max="60"
                value={rotZ}
                onChange={(e) => {
                  setRotZ(Number(e.target.value));
                  setActiveCameraPreset('3d');
                }}
                className="w-16 accent-sky-400 h-1 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCameraPreset('3d')}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] font-semibold border border-white/10 cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Centrer</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Selected Station HUD card if clicked */}
      {selectedStationNode && (
        <div className="mt-3 p-4 rounded-xl bg-slate-900/90 border border-sky-400/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/50 flex items-center justify-center font-bold text-sky-400 shrink-0">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-white text-base">{selectedStationNode.name}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  {selectedStationNode.region}
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                Altitude : {selectedStationNode.altitude} m &bull; Condition : <strong className="text-slate-200">{selectedStationNode.condition}</strong>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-right">
            <div>
              <div className="text-[10px] text-slate-400">Température</div>
              <div className="font-black text-amber-300 text-sm sm:text-base">{selectedStationNode.temp}°C</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400">Rafales</div>
              <div className="font-black text-sky-300 text-sm sm:text-base">{selectedStationNode.windGust} km/h</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400">Précipitations</div>
              <div className="font-black text-blue-300 text-sm sm:text-base">{selectedStationNode.rainMm} mm</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400">Isotherme 0°C</div>
              <div className="font-black text-purple-300 text-sm sm:text-base">{selectedStationNode.lpnMeters} m</div>
            </div>
            {onSelectStation && (
              <button
                type="button"
                onClick={() => {
                  const matched = FRENCH_STATIONS.find(s => s.id === selectedStationNode.id);
                  if (matched) onSelectStation(matched);
                }}
                className="px-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition shadow flex items-center gap-1.5 cursor-pointer ml-2"
              >
                <span>Choisir cette ville</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* 4. Légende Météorologique au bas de la carte */}
      <div className="mt-3 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-300">Échelle {metric === 'temperature' ? 'Thermique' : metric === 'wind' ? 'Éolienne' : metric === 'rain' ? 'Pluviométrique' : 'Neige / LPN'} :</span>
          {metric === 'temperature' && (
            <div className="flex items-center gap-1">
              <span className="px-1.5 py-0.5 rounded bg-blue-600 text-white text-[9px] font-bold">&lt;10°C</span>
              <span className="px-1.5 py-0.5 rounded bg-cyan-500 text-slate-950 text-[9px] font-bold">10-15°</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-500 text-slate-950 text-[9px] font-bold">15-18°</span>
              <span className="px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 text-[9px] font-bold">19-22°</span>
              <span className="px-1.5 py-0.5 rounded bg-red-500 text-white text-[9px] font-bold">&gt;22°C</span>
            </div>
          )}
          {metric === 'wind' && (
            <div className="flex items-center gap-1">
              <span className="px-1.5 py-0.5 rounded bg-sky-500 text-slate-950 text-[9px] font-bold">&lt;35 km/h</span>
              <span className="px-1.5 py-0.5 rounded bg-yellow-500 text-slate-950 text-[9px] font-bold">35-55</span>
              <span className="px-1.5 py-0.5 rounded bg-orange-500 text-white text-[9px] font-bold">55-80</span>
              <span className="px-1.5 py-0.5 rounded bg-red-600 text-white text-[9px] font-bold">&gt;80 km/h</span>
            </div>
          )}
          {metric === 'rain' && (
            <div className="flex items-center gap-1">
              <span className="px-1.5 py-0.5 rounded bg-slate-700 text-slate-200 text-[9px] font-bold">Sec (0 mm)</span>
              <span className="px-1.5 py-0.5 rounded bg-cyan-600 text-white text-[9px] font-bold">0.1 - 2 mm</span>
              <span className="px-1.5 py-0.5 rounded bg-blue-600 text-white text-[9px] font-bold">&gt;2 mm</span>
            </div>
          )}
          {metric === 'snow' && (
            <div className="flex items-center gap-1">
              <span className="px-1.5 py-0.5 rounded bg-purple-600 text-white text-[9px] font-bold">&lt;1400 m</span>
              <span className="px-1.5 py-0.5 rounded bg-blue-500 text-white text-[9px] font-bold">1400-2000 m</span>
              <span className="px-1.5 py-0.5 rounded bg-cyan-400 text-slate-950 text-[9px] font-bold">&gt;2000 m</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-slate-400">
          <Sparkles className="h-3.5 w-3.5 text-amber-400" />
          <span>Survolez ou cliquez sur un sommet / agglomération pour inspecter</span>
        </div>
      </div>
    </div>
  );
};
