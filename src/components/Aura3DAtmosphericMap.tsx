import React, { useState, useMemo } from 'react';
import { LocationPoint } from '../types/weather';
import { FRENCH_STATIONS } from '../data/frenchStations';
import { Thermometer, Wind, CloudRain, Snowflake, RotateCcw, Maximize2, Compass } from 'lucide-react';

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
  x: number; // 0 to 100 on France projection
  y: number; // 0 to 100 on France projection
  altitude: number;
  temp: number;
  windSpeed: number;
  windGust: number;
  rainMm: number;
  lpnMeters: number;
  condition: string;
}

export const Aura3DAtmosphericMap: React.FC<Aura3DAtmosphericMapProps> = ({
  initialMetric = 'temperature',
  currentStation,
  onSelectStation,
  title
}) => {
  const [metric, setMetric] = useState<Map3DMetric>(initialMetric);
  const [rotX, setRotX] = useState<number>(45); // Pitch (inclinaison)
  const [rotZ, setRotZ] = useState<number>(-15); // Yaw (orientation 3D)
  const [zoom, setZoom] = useState<number>(1);
  const [selectedStationNode, setSelectedStationNode] = useState<Station3DNode | null>(null);

  // Échantillonnage de stations réparties sur les 4 coins et le centre de la France
  const station3DList: Station3DNode[] = useMemo(() => {
    // Coordonnées approximatives normalisées 0..100 sur l'hexagone (x: Ouest -> Est, y: Nord -> Sud)
    const benchmarkData: Record<string, { x: number; y: number; temp: number; wind: number; gust: number; rain: number; lpn: number; cond: string }> = {
      'paris': { x: 50, y: 30, temp: 18.2, wind: 18, gust: 32, rain: 0.2, lpn: 2200, cond: 'Éclaircies' },
      'lille': { x: 52, y: 12, temp: 16.5, wind: 24, gust: 42, rain: 1.2, lpn: 1900, cond: 'Nuageux' },
      'brest': { x: 12, y: 35, temp: 15.8, wind: 35, gust: 58, rain: 3.4, lpn: 1800, cond: 'Averses' },
      'rennes': { x: 26, y: 38, temp: 17.1, wind: 22, gust: 38, rain: 0.8, lpn: 2100, cond: 'Ciel voilé' },
      'strasbourg': { x: 88, y: 32, temp: 19.4, wind: 12, gust: 22, rain: 0.0, lpn: 2400, cond: 'Ensoleillé' },
      'nantes': { x: 25, y: 48, temp: 18.0, wind: 20, gust: 35, rain: 0.4, lpn: 2250, cond: 'Belles éclaircies' },
      'bordeaux': { x: 30, y: 68, temp: 21.0, wind: 16, gust: 28, rain: 0.0, lpn: 2600, cond: 'Beau temps' },
      'toulouse': { x: 45, y: 80, temp: 22.3, wind: 19, gust: 34, rain: 0.0, lpn: 2800, cond: 'Soleil' },
      'lyon': { x: 68, y: 55, temp: 20.1, wind: 15, gust: 26, rain: 0.1, lpn: 2450, cond: 'Doux & voilé' },
      'marseille': { x: 70, y: 84, temp: 23.2, wind: 42, gust: 68, rain: 0.0, lpn: 2950, cond: 'Grand soleil mistral' },
      'nice': { x: 86, y: 80, temp: 22.8, wind: 14, gust: 24, rain: 0.0, lpn: 2900, cond: 'Ensoleillé' },
      'clermont': { x: 52, y: 58, temp: 18.6, wind: 18, gust: 30, rain: 0.3, lpn: 2300, cond: 'Éclaircies' },
      'chamonix': { x: 84, y: 54, temp: 11.2, wind: 20, gust: 45, rain: 1.8, lpn: 1650, cond: 'Frais montagnard' },
      'mont-ventoux': { x: 69, y: 76, temp: 8.5, wind: 65, gust: 98, rain: 0.2, lpn: 1400, cond: 'Violent mistral' },
      'pic-du-midi': { x: 38, y: 86, temp: 4.8, wind: 48, gust: 78, rain: 1.5, lpn: 1150, cond: 'Froid d\'altitude' },
      'ajaccio': { x: 92, y: 92, temp: 23.5, wind: 22, gust: 38, rain: 0.0, lpn: 3100, cond: 'Soleil méditerranéen' }
    };

    return Object.entries(benchmarkData).map(([key, data]) => {
      const match = FRENCH_STATIONS.find(s => s.id.toLowerCase().includes(key) || s.name.toLowerCase().includes(key)) || {
        id: key,
        name: key.toUpperCase(),
        altitude: 120
      };
      return {
        id: match.id,
        name: match.name,
        x: data.x,
        y: data.y,
        altitude: match.altitude || 100,
        temp: data.temp,
        windSpeed: data.wind,
        windGust: data.gust,
        rainMm: data.rain,
        lpnMeters: data.lpn,
        condition: data.cond
      };
    });
  }, []);

  const getNodeColor = (node: Station3DNode) => {
    if (metric === 'temperature') {
      if (node.temp >= 23) return '#EF4444'; // rouge chaud
      if (node.temp >= 19) return '#F59E0B'; // ambre doux
      if (node.temp >= 15) return '#10B981'; // vert tempéré
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
    if (node.lpnMeters <= 1400) return '#C084FC'; // neige basse
    if (node.lpnMeters <= 2000) return '#60A5FA'; // moyenne montagne
    return '#38BDF8'; // haute altitude
  };

  const getNodeBadgeValue = (node: Station3DNode) => {
    if (metric === 'temperature') return `${node.temp.toFixed(1)}°C`;
    if (metric === 'wind') return `${node.windGust} km/h`;
    if (metric === 'rain') return `${node.rainMm.toFixed(1)} mm`;
    return `${node.lpnMeters} m`;
  };

  return (
    <div className="w-full rounded-2xl border border-sky-500/30 bg-gradient-to-b from-slate-950 via-[#060c18] to-slate-950 p-4 shadow-2xl overflow-hidden my-3 select-none">
      {/* 1. Header controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 rounded-lg bg-sky-500/20 border border-sky-400/40 items-center justify-center text-sky-400">
            <Compass className="h-4 w-4 animate-spin [animation-duration:14s]" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-black text-white flex items-center gap-2">
              <span>{title || 'Modélisation 3D Atmosphérique du Territoire Français'}</span>
              <span className="text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Temps Réel
              </span>
            </h4>
            <p className="text-[10px] text-slate-400">
              Perspective interactive 3D avec altimétrie et données thermiques, éoliennes et pluviométriques.
            </p>
          </div>
        </div>

        {/* Metric Selector Buttons */}
        <div className="flex items-center gap-1 bg-slate-900/90 border border-white/10 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setMetric('temperature')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
              metric === 'temperature'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Thermometer className="h-3.5 w-3.5" />
            <span>Températures</span>
          </button>

          <button
            type="button"
            onClick={() => setMetric('wind')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
              metric === 'wind'
                ? 'bg-sky-500 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Wind className="h-3.5 w-3.5" />
            <span>Vent &amp; Rafales</span>
          </button>

          <button
            type="button"
            onClick={() => setMetric('rain')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
              metric === 'rain'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <CloudRain className="h-3.5 w-3.5" />
            <span>Précipitations</span>
          </button>

          <button
            type="button"
            onClick={() => setMetric('snow')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
              metric === 'snow'
                ? 'bg-purple-600 text-white shadow-sm'
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
        className="relative w-full h-[360px] sm:h-[420px] rounded-2xl bg-[#03060c] border border-white/10 overflow-hidden flex items-center justify-center cursor-move"
        style={{ perspective: '1100px' }}
      >
        {/* Grille spatiale holographique */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(56,189,248,0.2) 0%, transparent 70%), linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)',
            backgroundSize: '100% 100%, 30px 30px, 30px 30px'
          }}
        />

        {/* Canvas 3D Transformed Layer */}
        <div
          className="relative w-[340px] sm:w-[460px] h-[340px] sm:h-[460px] transition-transform duration-100 ease-out"
          style={{
            transform: `rotateX(${rotX}deg) rotateZ(${rotZ}deg) scale(${zoom})`,
            transformStyle: 'preserve-3d'
          }}
        >
          {/* Base relief map plate of France with extrusion shadow */}
          <div 
            className="absolute inset-0 rounded-3xl border-2 border-sky-500/40 bg-gradient-to-br from-slate-900/90 via-sky-950/30 to-slate-950/90 shadow-[0_30px_70px_rgba(0,0,0,0.8),inset_0_0_30px_rgba(56,189,248,0.2)]"
            style={{
              transform: 'translateZ(-15px)'
            }}
          >
            {/* Hexagone contours stylized line */}
            <svg viewBox="0 0 100 100" className="w-full h-full p-6 opacity-35" fill="none">
              <polygon 
                points="50,12 85,28 88,65 65,88 35,84 14,50 22,25" 
                stroke="#38BDF8" 
                strokeWidth="1.5" 
                fill="rgba(56, 189, 248, 0.05)" 
                strokeDasharray="4 2"
              />
            </svg>
          </div>

          {/* Station 3D Columns & Pedestals */}
          {station3DList.map((st) => {
            const isSelected = selectedStationNode?.id === st.id;
            const nodeColor = getNodeColor(st);
            const badgeVal = getNodeBadgeValue(st);
            const heightPx = Math.max(14, Math.min(65, Math.round((st.altitude / 3000) * 60) + 14));

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
                  className="absolute left-1/2 -translate-x-1/2 bottom-0 w-1 bg-gradient-to-t from-slate-700/60 to-white/80 pointer-events-none rounded-full"
                  style={{
                    height: `${heightPx}px`,
                    transform: `rotateX(-${rotX}deg) rotateZ(-${rotZ}deg) translateY(${heightPx}px)`
                  }}
                />

                {/* Glowing Node Sphere */}
                <div
                  className="relative flex items-center justify-center rounded-full p-1.5 shadow-lg transition-all"
                  style={{
                    backgroundColor: `${nodeColor}30`,
                    borderColor: nodeColor,
                    borderWidth: isSelected ? '2px' : '1.5px',
                    boxShadow: `0 0 16px ${nodeColor}80`
                  }}
                >
                  <div
                    className="w-3 h-3 rounded-full animate-pulse"
                    style={{ backgroundColor: nodeColor }}
                  />

                  {/* Node Value Label Floating above pillar */}
                  <div
                    className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap px-1.5 py-0.5 rounded-md text-[9px] font-black border shadow-md pointer-events-none"
                    style={{
                      backgroundColor: 'rgba(15, 23, 42, 0.92)',
                      borderColor: nodeColor,
                      color: nodeColor,
                      transform: `rotateX(-${rotX}deg) rotateZ(-${rotZ}deg)`
                    }}
                  >
                    {badgeVal}
                  </div>

                  {/* Station Name */}
                  <div
                    className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[8px] font-bold text-slate-300 pointer-events-none group-hover:text-white"
                    style={{
                      transform: `rotateX(-${rotX}deg) rotateZ(-${rotZ}deg)`
                    }}
                  >
                    {st.name}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Camera Control HUD Floating Bar */}
        <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 bg-slate-950/80 backdrop-blur-md border border-white/10 px-3 py-2 rounded-xl text-xs z-30">
          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase font-mono text-slate-400 font-bold">Caméra 3D :</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-400">Inclinaison</span>
              <input
                type="range"
                min="20"
                max="65"
                value={rotX}
                onChange={(e) => setRotX(Number(e.target.value))}
                className="w-16 accent-sky-400 h-1 cursor-pointer"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-400">Rotation</span>
              <input
                type="range"
                min="-60"
                max="60"
                value={rotZ}
                onChange={(e) => setRotZ(Number(e.target.value))}
                className="w-16 accent-sky-400 h-1 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setRotX(45);
                setRotZ(-15);
                setZoom(1);
              }}
              className="flex items-center gap-1 px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] font-semibold border border-white/10 cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Réinitialiser</span>
            </button>
          </div>
        </div>
      </div>

      {/* Selected Station HUD card if clicked */}
      {selectedStationNode && (
        <div className="mt-3 p-3 rounded-xl bg-slate-900/90 border border-sky-400/30 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center font-bold text-sky-400">
              📍
            </div>
            <div>
              <div className="font-black text-white text-sm">{selectedStationNode.name}</div>
              <div className="text-[10px] text-slate-400">
                Altitude : {selectedStationNode.altitude} m &bull; Condition : {selectedStationNode.condition}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-right">
            <div>
              <div className="text-[10px] text-slate-400">Température</div>
              <div className="font-extrabold text-amber-300 text-sm">{selectedStationNode.temp}°C</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400">Rafales</div>
              <div className="font-extrabold text-sky-300 text-sm">{selectedStationNode.windGust} km/h</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400">Précipitations</div>
              <div className="font-extrabold text-blue-300 text-sm">{selectedStationNode.rainMm} mm</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400">Isotherme 0°C</div>
              <div className="font-extrabold text-purple-300 text-sm">{selectedStationNode.lpnMeters} m</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
