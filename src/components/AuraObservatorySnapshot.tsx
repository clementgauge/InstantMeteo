import React from 'react';
import { Camera, ExternalLink, Activity, Radio, BarChart3, CloudRain } from 'lucide-react';

export interface AuraObservatorySnapshotProps {
  type: 'radar' | 'ensemble14d' | 'nephology' | 'radiation' | 'anomaly';
  stationName: string;
  onNavigateModule?: (tab: string) => void;
}

export const AuraObservatorySnapshot: React.FC<AuraObservatorySnapshotProps> = ({
  type,
  stationName,
  onNavigateModule
}) => {
  const getSnapshotConfig = () => {
    switch (type) {
      case 'radar':
        return {
          title: `Capture Radar Doppler HD — Échos de précipitations (${stationName})`,
          badge: 'RADAR DOPPLER LIVE',
          tabId: 'radar',
          accent: 'from-blue-600 to-cyan-500',
          preview: (
            <div className="relative w-full h-36 rounded-xl overflow-hidden bg-slate-950 border border-blue-500/30 flex items-center justify-center p-2">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/40 via-slate-950 to-slate-950" />
              {/* Radar rings */}
              <div className="absolute w-28 h-28 rounded-full border border-blue-500/30 animate-ping opacity-25" />
              <div className="absolute w-20 h-20 rounded-full border border-cyan-400/40" />
              <div className="absolute w-12 h-12 rounded-full border border-sky-400/50" />
              <div className="relative z-10 flex flex-col items-center text-center">
                <Radio className="h-6 w-6 text-cyan-400 mb-1 animate-pulse" />
                <span className="text-xs font-black text-white">Échos radar en direct sur {stationName}</span>
                <span className="text-[10px] text-cyan-300">Résolution 500m &bull; Pas 5 minutes &bull; Modèle AROME RainViewer</span>
              </div>
            </div>
          )
        };
      case 'ensemble14d':
        return {
          title: `Capture Ensembliste Multi-Modèles 14 Jours — Tendances Thermiques (${stationName})`,
          badge: 'MULTI-MODÈLES ECMWF/GFS',
          tabId: 'scenarios14d',
          accent: 'from-indigo-600 to-purple-500',
          preview: (
            <div className="relative w-full h-36 rounded-xl overflow-hidden bg-slate-950 border border-indigo-500/30 p-3 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>Modèle Européen ECMWF (9km)</span>
                <span className="text-amber-400 font-bold">51 Scénarios Ensemblistes</span>
              </div>
              <div className="flex items-end gap-1.5 h-20 w-full pt-2">
                {[18, 19, 21, 22, 24, 20, 19, 17, 18, 19, 21, 23, 22, 20].map((t, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div 
                      className="w-full bg-gradient-to-t from-indigo-500 to-amber-400 rounded-t-sm opacity-85"
                      style={{ height: `${(t / 25) * 100}%` }}
                    />
                    <span className="text-[8px] text-slate-400 font-mono">J+{i}</span>
                  </div>
                ))}
              </div>
              <span className="text-[9px] text-slate-400 text-center">Étalement probabiliste P10 - P50 - P90 certifié Instant Météo</span>
            </div>
          )
        };
      case 'nephology':
        return {
          title: `Capture Stratigraphique Nuageuse — Étages Inférieurs, Moyens & Supérieurs (${stationName})`,
          badge: 'NÉPHOLOGIE ATMOSPHÉRIQUE',
          tabId: 'cloudNephology',
          accent: 'from-sky-600 to-blue-500',
          preview: (
            <div className="relative w-full h-36 rounded-xl overflow-hidden bg-slate-950 border border-sky-500/30 p-3 flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-300 font-semibold">Cirrus / Voile Supérieur (8 000 m)</span>
                  <span className="text-sky-300 font-mono">35%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-sky-300 w-[35%]" />
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-300 font-semibold">Altocumulus Moyen (4 000 m)</span>
                  <span className="text-blue-400 font-mono">60%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-blue-400 w-[60%]" />
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-300 font-semibold">Stratus / Plafond Bas (800 m)</span>
                  <span className="text-emerald-400 font-mono">15%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-emerald-400 w-[15%]" />
                </div>
              </div>
              <span className="text-[9px] text-slate-400 text-center">Diagnostic transmissivité solaire et opacité nuageuse</span>
            </div>
          )
        };
      default:
        return {
          title: `Capture Télémétrique — Observatoire Instant Météo (${stationName})`,
          badge: 'DONNÉES CERTIFIÉES',
          tabId: 'realtime',
          accent: 'from-amber-500 to-sky-500',
          preview: (
            <div className="relative w-full h-36 rounded-xl overflow-hidden bg-slate-950 border border-amber-500/30 flex items-center justify-center p-3">
              <Activity className="h-8 w-8 text-amber-400 animate-pulse mr-3" />
              <div className="text-left">
                <div className="text-xs font-black text-white">Relevés scientifiques et calibrations physiques</div>
                <div className="text-[10px] text-slate-400">Station {stationName} &bull; Validé par le réseau officiel</div>
              </div>
            </div>
          )
        };
    }
  };

  const cfg = getSnapshotConfig();

  return (
    <div className="w-full my-3 p-3.5 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/95 border border-white/15 shadow-xl space-y-2.5">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 rounded-lg bg-sky-500/20 border border-sky-400/40 items-center justify-center text-sky-400">
            <Camera className="h-3.5 w-3.5" />
          </div>
          <div>
            <div className="font-black text-white text-xs">{cfg.title}</div>
            <div className="text-[9px] text-slate-400 font-mono">Capture instantanée télémétrique &bull; {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
          </div>
        </div>
        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border bg-gradient-to-r ${cfg.accent} text-white`}>
          {cfg.badge}
        </span>
      </div>

      {cfg.preview}

      <div className="flex items-center justify-between pt-1">
        <span className="text-[10px] text-slate-400">
          Source : Instant Météo Open Data
        </span>
        <button
          type="button"
          onClick={() => onNavigateModule?.(cfg.tabId)}
          className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-sky-600/30 hover:bg-sky-600/50 text-sky-200 border border-sky-400/40 text-xs font-bold transition active:scale-95 cursor-pointer"
        >
          <span>Ouvrir le module complet</span>
          <ExternalLink className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
};
