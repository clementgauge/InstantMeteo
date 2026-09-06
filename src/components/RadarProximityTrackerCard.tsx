import React, { useState } from 'react';
import { RadarProximityTracker, LocationPoint, RainEchoCell, ThunderstormEchoCell } from '../types/weather';
import { 
  Radar, 
  CloudRain, 
  Zap, 
  Clock, 
  Compass, 
  ShieldAlert, 
  AlertTriangle, 
  Info, 
  Navigation, 
  Sparkles,
  ArrowUpRight,
  Activity,
  CheckCircle2,
  Radio,
  Sliders,
  Layers,
  Globe,
  FileText
} from 'lucide-react';

interface RadarProximityTrackerCardProps {
  radarProximity?: RadarProximityTracker;
  station: LocationPoint;
  seniorMode: boolean;
  onOpenGigaRadar?: () => void;
}

export const RadarProximityTrackerCard: React.FC<RadarProximityTrackerCardProps> = ({
  radarProximity,
  station,
  seniorMode,
  onOpenGigaRadar
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'rain' | 'storm'>('all');
  const [distanceBandFilter, setDistanceBandFilter] = useState<'all' | '0-25km' | '25-75km' | '75-150km' | '150-300km'>('all');
  const [selectedCellId, setSelectedCellId] = useState<string | null>(null);

  if (!radarProximity) return null;

  const rainEchoes300 = radarProximity.topRainEchoes300km || radarProximity.topRainEchoes100km || [];
  const stormCells300 = radarProximity.topThunderstormCells300km || radarProximity.topThunderstormCells100km || [];
  const globalThreat = radarProximity.globalThreatAssessment;
  const storm = radarProximity.nearestThunderstorm;
  const bulletin300 = radarProximity.synopticRadarBulletin300km;

  // Filter echoes by distance band
  const filterByBand = <T extends { distanceBand?: string; distanceKm: number }>(items: T[]): T[] => {
    if (distanceBandFilter === 'all') return items;
    if (distanceBandFilter === '0-25km') return items.filter(i => i.distanceKm <= 25);
    if (distanceBandFilter === '25-75km') return items.filter(i => i.distanceKm > 25 && i.distanceKm <= 75);
    if (distanceBandFilter === '75-150km') return items.filter(i => i.distanceKm > 75 && i.distanceKm <= 150);
    if (distanceBandFilter === '150-300km') return items.filter(i => i.distanceKm > 150 && i.distanceKm <= 300);
    return items;
  };

  const filteredRainEchoes = filterByBand(rainEchoes300);
  const filteredStormCells = filterByBand(stormCells300);

  const getThreatBadgeClass = (threatLevel: string) => {
    if (threatLevel.includes('🔴') || threatLevel.includes('EXTRÊMEMENT') || threatLevel.includes('MENAÇANT')) {
      return 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-rose-950/40';
    }
    if (threatLevel.includes('🟠')) {
      return 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-amber-950/40';
    }
    if (threatLevel.includes('🟡') || threatLevel.includes('SURVEILLANCE')) {
      return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50 shadow-yellow-950/40';
    }
    if (threatLevel.includes('🟢') || threatLevel.includes('ÉLOIGNE')) {
      return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-emerald-950/40';
    }
    return 'bg-slate-800 text-slate-400 border-slate-700';
  };

  return (
    <div id="radar-proximity-tracker-card" className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 p-5 sm:p-6 shadow-2xl backdrop-blur space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="rounded-2xl bg-cyan-600/20 p-3 text-cyan-400 border border-cyan-500/30 shadow-inner shrink-0">
            <Radar className="h-6 w-6 animate-pulse text-cyan-400" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
              <Radio className="h-3.5 w-3.5" />
              <span>Dénombrement Radar Doppler & Traqueur ARAMIS (300 KM)</span>
              <span>•</span>
              <span className="text-slate-400">{station.name} ({station.altitude}m)</span>
            </div>
            <h3 className={`font-black text-white ${seniorMode ? 'text-2xl' : 'text-xl'}`}>
              Radar 300 KM : Échos Pluvieux & Cellules Convectives Orageuses
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenGigaRadar && (
            <button
              onClick={onOpenGigaRadar}
              className="flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-3.5 py-2 text-xs font-bold text-cyan-300 hover:bg-cyan-500/20 transition active:scale-95 shadow-sm"
            >
              <span>Ouvrir la Giga Carte Radar</span>
              <ArrowUpRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Global Threat Assessment Banner */}
      {globalThreat && (
        <div className={`rounded-2xl border p-4 flex flex-wrap items-center justify-between gap-4 ${
          globalThreat.hasThreateningEcho 
            ? 'bg-gradient-to-r from-rose-950/60 via-amber-950/40 to-slate-900 border-rose-500/50 text-rose-200' 
            : 'bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border-emerald-500/40 text-emerald-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`rounded-xl p-2.5 shrink-0 ${
              globalThreat.hasThreateningEcho ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
            }`}>
              {globalThreat.hasThreateningEcho ? <AlertTriangle className="h-5 w-5 animate-bounce" /> : <CheckCircle2 className="h-5 w-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wide">
                <span>Diagnostic de Menace Radar Global (Rayon Extended 300 km)</span>
                <span>•</span>
                <span className="opacity-80">{globalThreat.threateningEchoesCount} écho(s) menaçant(s)</span>
              </div>
              <p className="text-sm font-bold mt-0.5 leading-snug">
                {globalThreat.summaryMessage}
              </p>
            </div>
          </div>

          <div className="shrink-0">
            <span className={`px-3 py-1.5 rounded-xl border text-xs font-black uppercase tracking-wider ${
              globalThreat.alertLevel === 'ROUGE' ? 'bg-rose-500/30 text-rose-200 border-rose-400/60' :
              globalThreat.alertLevel === 'ORANGE' ? 'bg-amber-500/30 text-amber-200 border-amber-400/60' :
              globalThreat.alertLevel === 'JAUNE' ? 'bg-yellow-500/30 text-yellow-200 border-yellow-400/60' :
              'bg-emerald-500/30 text-emerald-200 border-emerald-400/60'
            }`}>
              Vigilance Radar {globalThreat.alertLevel}
            </span>
          </div>
        </div>
      )}

      {/* SYNOPTIC BULLETIN 300 KM */}
      {bulletin300 && (
        <div className="rounded-2xl border border-cyan-500/30 bg-slate-950/90 p-4 space-y-2 shadow-inner">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-cyan-300">
            <FileText className="h-4 w-4 text-cyan-400" />
            <span>Bulletin de Synthèse Radar & Convection ARAMIS (300 KM)</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-medium">
            {bulletin300}
          </p>
        </div>
      )}

      {/* RADAR SCOPE PPI VISUALIZER (0-300 KM) */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-3">
        <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-cyan-300">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-cyan-400" />
            <span>Scope Radar Doppler Concentrique PPI — 300 KM</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            Centre : {station.name} • Rayon max : 300 km
          </span>
        </div>

        <div className="relative w-full aspect-square max-w-[320px] mx-auto rounded-full border-2 border-cyan-500/40 bg-slate-950 flex items-center justify-center overflow-hidden shadow-2xl">
          {/* Concentric rings: 25km, 75km, 150km, 300km */}
          <div className="absolute inset-2 rounded-full border border-dashed border-cyan-500/20 flex items-center justify-center">
            <span className="absolute top-1 text-[9px] font-mono font-bold text-cyan-400/60">300 km</span>
          </div>
          <div className="absolute inset-10 rounded-full border border-dashed border-cyan-500/30 flex items-center justify-center">
            <span className="absolute top-1 text-[9px] font-mono font-bold text-cyan-400/60">150 km</span>
          </div>
          <div className="absolute inset-20 rounded-full border border-dashed border-cyan-500/40 flex items-center justify-center">
            <span className="absolute top-1 text-[9px] font-mono font-bold text-cyan-400/60">75 km</span>
          </div>
          <div className="absolute inset-28 rounded-full border border-cyan-500/60 bg-cyan-500/5 flex items-center justify-center">
            <span className="absolute top-1 text-[9px] font-mono font-bold text-cyan-300">25 km</span>
          </div>

          {/* Crosshair lines */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-full h-[1px] bg-cyan-500/20"></div>
            <div className="h-full w-[1px] bg-cyan-500/20"></div>
          </div>

          {/* Cardinal directions */}
          <span className="absolute top-1 text-[10px] font-black text-cyan-300">N</span>
          <span className="absolute bottom-1 text-[10px] font-black text-cyan-300">S</span>
          <span className="absolute right-1.5 text-[10px] font-black text-cyan-300">E</span>
          <span className="absolute left-1.5 text-[10px] font-black text-cyan-300">O</span>

          {/* Center station dot */}
          <div className="absolute w-3 h-3 rounded-full bg-cyan-400 border-2 border-white shadow-lg z-20 animate-ping"></div>
          <div className="absolute w-3 h-3 rounded-full bg-cyan-400 border-2 border-white shadow-lg z-20"></div>

          {/* Radar Sweep Animation */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-cyan-500/10 to-cyan-500/30 animate-spin opacity-40 pointer-events-none origin-center" style={{ animationDuration: '6s' }}></div>

          {/* Plot Rain Echo Nodes */}
          {rainEchoes300.map((cell) => {
            const rad = ((cell.bearingDeg - 90) * Math.PI) / 180;
            const normDist = Math.min(1, cell.distanceKm / 300);
            const radiusPx = normDist * 135; // max radius inside circle
            const x = Math.cos(rad) * radiusPx;
            const y = Math.sin(rad) * radiusPx;

            return (
              <button
                key={cell.id}
                onClick={() => setSelectedCellId(cell.id)}
                className="absolute w-5 h-5 -ml-2.5 -mt-2.5 rounded-full bg-blue-500/80 border border-blue-200 text-white font-black text-[9px] flex items-center justify-center shadow-lg hover:scale-125 transition z-10"
                style={{ transform: `translate(${x}px, ${y}px)` }}
                title={`${cell.cellName} - ${cell.distanceKm} km`}
              >
                R{cell.rank}
              </button>
            );
          })}

          {/* Plot Storm Cells Nodes */}
          {stormCells300.map((cell) => {
            const rad = ((cell.bearingDeg - 90) * Math.PI) / 180;
            const normDist = Math.min(1, cell.distanceKm / 300);
            const radiusPx = normDist * 135;
            const x = Math.cos(rad) * radiusPx;
            const y = Math.sin(rad) * radiusPx;

            return (
              <button
                key={cell.id}
                onClick={() => setSelectedCellId(cell.id)}
                className="absolute w-5 h-5 -ml-2.5 -mt-2.5 rounded-full bg-amber-500 border border-white text-slate-950 font-black text-[9px] flex items-center justify-center shadow-lg hover:scale-125 transition z-10 animate-bounce"
                style={{ transform: `translate(${x}px, ${y}px)` }}
                title={`${cell.cellName} - ${cell.distanceKm} km`}
              >
                ⚡{cell.rank}
              </button>
            );
          })}
        </div>
      </div>

      {/* FILTER TABS & DISTANCE BANDS */}
      <div className="space-y-3 border-b border-slate-800 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">Type :</span>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'all' 
                  ? 'bg-cyan-500 text-slate-950 font-black shadow' 
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              Tous ({rainEchoes300.length + stormCells300.length} Cellules)
            </button>
            <button
              onClick={() => setActiveTab('rain')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'rain' 
                  ? 'bg-blue-600 text-white font-black shadow' 
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              <CloudRain className="h-3.5 w-3.5" />
              <span>8 Échos Pluvieux</span>
            </button>
            <button
              onClick={() => setActiveTab('storm')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'storm' 
                  ? 'bg-amber-500 text-slate-950 font-black shadow' 
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              <Zap className="h-3.5 w-3.5" />
              <span>8 Échos Orageux</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="font-bold text-slate-400 mr-1">Couronne :</span>
            {(['all', '0-25km', '25-75km', '75-150km', '150-300km'] as const).map((b) => (
              <button
                key={b}
                onClick={() => setDistanceBandFilter(b)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition ${
                  distanceBandFilter === b
                    ? 'bg-slate-700 text-white border-slate-500'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                {b === 'all' ? '0 - 300 km' : b}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 1: DÉNOMBREMENT DES 8 ÉCHOS PLUVIEUX */}
      {(activeTab === 'all' || activeTab === 'rain') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-blue-300">
              <CloudRain className="h-4 w-4 text-blue-400" />
              <span>Dénombrement & Analyse des Échos Pluvieux (Jusqu'à 300 KM)</span>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {filteredRainEchoes.length} écho(s) affiché(s)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRainEchoes.map((cell: RainEchoCell) => (
              <div 
                key={cell.id} 
                className={`rounded-2xl border p-4 space-y-3 transition hover:border-blue-500/60 ${
                  cell.isThreatening 
                    ? 'bg-slate-950/95 border-blue-500/50 shadow-lg shadow-blue-950/20' 
                    : 'bg-slate-950/70 border-slate-800'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2.5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-lg bg-blue-600/30 text-blue-300 border border-blue-500/40 px-2 py-0.5 text-xs font-black">
                        #ÉCHO {cell.rank}
                      </span>
                      <h4 className="text-xs sm:text-sm font-black text-white">{cell.cellName}</h4>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                      <span>📍 {cell.locationSector}</span>
                      <span>•</span>
                      <span className="text-cyan-300 font-mono">Couronne {cell.distanceBand}</span>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-xl border text-[10px] font-black uppercase tracking-wider shrink-0 ${getThreatBadgeClass(cell.threatLevel)}`}>
                    {cell.threatLevel}
                  </span>
                </div>

                {/* Technical Specifications Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div className="bg-slate-900 p-2 rounded-xl border border-slate-800 text-center">
                    <span className="text-slate-400 block text-[10px]">Intensité</span>
                    <strong className="text-cyan-300 font-extrabold">{cell.intensityMmH} mm/h</strong>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-xl border border-slate-800 text-center">
                    <span className="text-slate-400 block text-[10px]">Réflectivité</span>
                    <strong className="text-blue-300 font-extrabold">{cell.reflectivityDbz} dBZ</strong>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-xl border border-slate-800 text-center">
                    <span className="text-slate-400 block text-[10px]">Sommet nuage</span>
                    <strong className="text-teal-300 font-extrabold">{cell.cloudTopFlightLevel || 'N/A'}</strong>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-xl border border-slate-800 text-center">
                    <span className="text-slate-400 block text-[10px]">Dépl. & ETA</span>
                    <strong className="text-amber-300 font-extrabold">{cell.speedKmh} km/h • ~{cell.estimatedArrivalMinutes ?? '—'}m</strong>
                  </div>
                </div>

                {/* COMPREHENSIVE PARAGRAPH ANALYSIS FOR THIS ECHO */}
                <div className="rounded-xl bg-slate-900/90 p-3.5 border border-slate-800 space-y-1.5">
                  <div className="text-[10px] font-black uppercase tracking-wider text-blue-300 flex items-center gap-1.5">
                    <Info className="h-3.5 w-3.5 text-blue-400" />
                    <span>Analyse Météorologique & Risque Local Détaillé</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-normal">
                    {cell.detailedParagraph}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 2: DÉNOMBREMENT DES 8 CELLULES ORAGEUSES */}
      {(activeTab === 'all' || activeTab === 'storm') && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-amber-300">
              <Zap className="h-4 w-4 text-amber-400 animate-pulse" />
              <span>Dénombrement & Analyse des Cellules Orageuses Convectives (Jusqu'à 300 KM)</span>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {filteredStormCells.length} cellule(s) affichée(s)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredStormCells.map((cell: ThunderstormEchoCell) => (
              <div 
                key={cell.id} 
                className={`rounded-2xl border p-4 space-y-3 transition hover:border-amber-500/60 ${
                  cell.isThreatening 
                    ? 'bg-slate-950/95 border-amber-500/60 shadow-lg shadow-amber-950/20' 
                    : 'bg-slate-950/70 border-slate-800'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2.5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-lg bg-amber-600/30 text-amber-300 border border-amber-500/40 px-2 py-0.5 text-xs font-black">
                        #ORAGE {cell.rank}
                      </span>
                      <h4 className="text-xs sm:text-sm font-black text-white">{cell.cellName}</h4>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                      <span>📍 {cell.locationSector}</span>
                      <span>•</span>
                      <span className="text-amber-300 font-mono">Couronne {cell.distanceBand}</span>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-xl border text-[10px] font-black uppercase tracking-wider shrink-0 ${getThreatBadgeClass(cell.threatLevel)}`}>
                    {cell.threatLevel}
                  </span>
                </div>

                {/* Technical Specifications Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div className="bg-slate-900 p-2 rounded-xl border border-slate-800 text-center">
                    <span className="text-slate-400 block text-[10px]">Éclairs / 15min</span>
                    <strong className="text-amber-300 font-extrabold">{cell.lightningStrikesCount15min} impacts</strong>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-xl border border-slate-800 text-center">
                    <span className="text-slate-400 block text-[10px]">Énergie CAPE</span>
                    <strong className="text-rose-300 font-extrabold">{cell.capeJkg} J/kg</strong>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-xl border border-slate-800 text-center">
                    <span className="text-slate-400 block text-[10px]">Réflectivité & Sommet</span>
                    <strong className="text-cyan-300 font-extrabold">{cell.reflectivityDbz} dBZ • {cell.cloudTopFlightLevel}</strong>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-xl border border-slate-800 text-center">
                    <span className="text-slate-400 block text-[10px]">Rafales max</span>
                    <strong className="text-orange-300 font-extrabold">{cell.downburstGustKmh} km/h</strong>
                  </div>
                </div>

                {/* COMPREHENSIVE PARAGRAPH ANALYSIS FOR THIS STORM CELL */}
                <div className="rounded-xl bg-slate-900/90 p-3.5 border border-slate-800 space-y-1.5">
                  <div className="text-[10px] font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5 text-amber-400" />
                    <span>Analyse Convective & Diagnostic de Danger Local</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-normal">
                    {cell.detailedParagraph}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Safety Instructions Banner */}
      <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-4 text-xs text-slate-300 flex items-start gap-3">
        <ShieldAlert className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-amber-300 font-bold block mb-1">Consignes de sécurité & Vigilance Météo-France (Rayon 300 km) :</strong>
          <span>{storm.safetyRecommendations.join(' • ')}</span>
        </div>
      </div>
    </div>
  );
};

