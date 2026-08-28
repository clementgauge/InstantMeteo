import React from 'react';
import { 
  Download, 
  Smartphone, 
  BookOpen, 
  ShieldCheck, 
  Zap, 
  Sun, 
  Droplets, 
  Wind, 
  Activity,
  Layers,
  Gauge,
  Compass
} from 'lucide-react';

interface SeniorGuideViewProps {
  seniorMode?: boolean;
  onOpenAndroidModal?: () => void;
}

export const SeniorGuideView: React.FC<SeniorGuideViewProps> = ({ onOpenAndroidModal }) => {
  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-3xl border border-blue-500/30 bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/60 p-6 shadow-2xl backdrop-blur sm:p-8">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600/30 text-blue-400 border border-blue-500/50 shadow-lg">
            <BookOpen className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Lexique Météorologique &amp; Indices Techniques Pro
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Définitions rigoureuses des paramètres physiques, modèles AROME/ECMWF, thermodynamique atmosphérique et télémesure.
            </p>
          </div>
        </div>
      </div>

      {/* Part 1: High-Precision Thermodynamic & Convective Indices */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl backdrop-blur sm:p-8 space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white">
              1. Thermodynamique &amp; Indices d'Instabilité Orageuse
            </h3>
            <p className="text-xs text-slate-400">
              Paramètres calculés par les modèles haute résolution AROME pour évaluer la sévérité des orages.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-slate-950 p-5 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-amber-400 font-bold text-sm">
              <span>⚡ CAPE (J/kg)</span>
              <span className="text-[10px] bg-amber-950 px-2 py-0.5 rounded border border-amber-800">Énergie Potentielle</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong>Convective Available Potential Energy :</strong> Mesure la flottabilité verticale de la particule d'air chaud.
              &lt; 500 J/kg : Faible. 500-1500 J/kg : Modérée. &gt; 2500 J/kg : Explosive (orages supercellulaires, grêle).
            </p>
          </div>

          <div className="rounded-2xl bg-slate-950 p-5 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-cyan-400 font-bold text-sm">
              <span>📉 Lifted Index (LI)</span>
              <span className="text-[10px] bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">Stabilité</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Différence de température entre l'environnement et une particule d'air soulevée à 500 hPa.
              Un LI négatif (&lt; -3°C) indique un environnement hautement instable propice aux rafales violentes.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-950 p-5 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-blue-400 font-bold text-sm">
              <span>🏔️ Isotherme 0°C &amp; FL</span>
              <span className="text-[10px] bg-blue-950 px-2 py-0.5 rounded border border-blue-800">Altitude</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Altitude (en mètres ou Flight Level FL) où la température s'abaisse à 0°C sous abri atmosphérique.
              Détermine la limite pluie-neige et le risque de givrage en aviation et en montagne.
            </p>
          </div>
        </div>
      </div>

      {/* Part 2: Radar, Doppler & Synoptic Parameters */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl backdrop-blur sm:p-8 space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
            <Gauge className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white">
              2. Télédétection Radar (dBZ) &amp; Pression Athmosphérique QNH
            </h3>
            <p className="text-xs text-slate-400">
              Unités physiques de mesure radar Doppler et altimétrie synoptique.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-slate-950 p-5 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-indigo-400 font-bold text-sm">
              <span>📡 Réflectivité dBZ</span>
              <span className="text-[10px] bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800">Radar HD</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Logarithme de la réflectivité électromagnétique des hydrométéores. 20-30 dBZ : Pluie faible à modérée. 
              &gt; 50 dBZ : Orage fort avec risque élevé de grêle et précipitations intenses.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-950 p-5 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-emerald-400 font-bold text-sm">
              <span>⏲️ Pression QNH (hPa)</span>
              <span className="text-[10px] bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">Isobare</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Pression barométrique ramenée au niveau moyen de la mer. Normale : 1013.25 hPa.
              Chute rapide (&gt; 2 hPa/h) : Arrivée imminente d'un système dépressionnaire frontal ou d'une tempête.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-950 p-5 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-amber-400 font-bold text-sm">
              <span>💨 Vent Moyen vs Rafale</span>
              <span className="text-[10px] bg-amber-950 px-2 py-0.5 rounded border border-amber-800">Anémomètre</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Le vent moyen est calculé sur 10 minutes à 10m de hauteur. La rafale représente la pointe maximale instantanée 
              mesurée sur un intervalle de 3 secondes.
            </p>
          </div>
        </div>
      </div>

      {/* Part 3: Android APK & Mobile Direct Download */}
      <div className="rounded-3xl border border-emerald-500/30 bg-slate-900/90 p-6 shadow-xl backdrop-blur sm:p-8 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600/20 text-emerald-400">
              <Smartphone className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">
                Application Mobile &amp; Paquet APK Android Native
              </h3>
              <p className="text-xs text-slate-400">
                Installation directe sur tout smartphone Android avec synchronisation arrière-plan.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <a
              href="/Instant-Meteo.apk"
              download="Instant-Meteo.apk"
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 font-bold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 transition active:scale-95 cursor-pointer"
            >
              <Download className="h-5 w-5" />
              <span>Télécharger l'APK (Native Android)</span>
            </a>

            {onOpenAndroidModal && (
              <button
                onClick={onOpenAndroidModal}
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-800 hover:bg-slate-750 px-5 py-3 font-bold text-slate-200 border border-slate-700 transition cursor-pointer"
              >
                <Smartphone className="h-5 w-5 text-blue-400" />
                <span>Guide d'installation</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

