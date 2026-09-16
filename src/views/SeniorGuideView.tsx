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
    <div className="space-y-4">
      {/* Welcome Banner */}
      <div className="rounded-lg border border-slate-800 bg-[#0F172A] p-5 sm:p-6">
        <div className="flex items-center gap-3.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-800 text-sky-400 border border-slate-700 shrink-0">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white">
              Lexique Météorologique &amp; Paramètres Techniques
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Définitions des grandeurs physiques, modèles AROME/ECMWF et thermodynamique atmosphérique.
            </p>
          </div>
        </div>
      </div>

      {/* Part 1: High-Precision Thermodynamic & Convective Indices */}
      <div className="rounded-lg border border-slate-800 bg-[#0F172A] p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-800 text-amber-400 border border-slate-700">
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white">
              1. Thermodynamique &amp; Indices d'Instabilité Orageuse
            </h3>
            <p className="text-xs text-slate-400">
              Paramètres calculés par les modèles haute résolution pour évaluer la sévérité orageuse.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="rounded-md bg-slate-900 p-4 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-amber-400 font-semibold text-xs">
              <span>⚡ CAPE (J/kg)</span>
              <span className="text-[10px] bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-800/80 text-amber-300">Énergie Potentielle</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong>Convective Available Potential Energy :</strong> Mesure la flottabilité verticale de la particule d'air chaud.
              &lt; 500 J/kg : Faible. 500-1500 J/kg : Modérée. &gt; 2500 J/kg : Explosive (orages supercellulaires, grêle).
            </p>
          </div>

          <div className="rounded-md bg-slate-900 p-4 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-sky-400 font-semibold text-xs">
              <span>📉 Lifted Index (LI)</span>
              <span className="text-[10px] bg-sky-950/80 px-1.5 py-0.5 rounded border border-sky-800/80 text-sky-300">Stabilité</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Différence de température entre l'environnement et une particule d'air soulevée à 500 hPa.
              Un LI négatif (&lt; -3°C) indique un environnement instable propice aux rafales violentes.
            </p>
          </div>

          <div className="rounded-md bg-slate-900 p-4 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-sky-400 font-semibold text-xs">
              <span>🏔️ Isotherme 0°C &amp; FL</span>
              <span className="text-[10px] bg-sky-950/80 px-1.5 py-0.5 rounded border border-sky-800/80 text-sky-300">Altitude</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Altitude (en mètres ou Flight Level FL) où la température s'abaisse à 0°C sous abri atmosphérique.
              Détermine la limite pluie-neige et le risque de givrage en montagne et aéronautique.
            </p>
          </div>
        </div>
      </div>

      {/* Part 2: Radar, Doppler & Synoptic Parameters */}
      <div className="rounded-lg border border-slate-800 bg-[#0F172A] p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-800 text-sky-400 border border-slate-700">
            <Gauge className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white">
              2. Télédétection Radar (dBZ) &amp; Pression Atmosphérique QNH
            </h3>
            <p className="text-xs text-slate-400">
              Unités physiques de mesure radar Doppler et altimétrie synoptique.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="rounded-md bg-slate-900 p-4 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-sky-400 font-semibold text-xs">
              <span>📡 Réflectivité dBZ</span>
              <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 text-slate-300">Radar HD</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Logarithme de la réflectivité électromagnétique des hydrométéores. 20-30 dBZ : Pluie modérée. 
              &gt; 50 dBZ : Précipitations intenses et grêle potentielle.
            </p>
          </div>

          <div className="rounded-md bg-slate-900 p-4 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-emerald-400 font-semibold text-xs">
              <span>⏲️ Pression QNH (hPa)</span>
              <span className="text-[10px] bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800/80 text-emerald-300">Isobare</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Pression barométrique ramenée au niveau de la mer (normale standard 1013.25 hPa).
              Une baisse rapide (&gt; 2 hPa/h) annonce l'arrivée d'une dégradation active.
            </p>
          </div>

          <div className="rounded-md bg-slate-900 p-4 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-amber-400 font-semibold text-xs">
              <span>💨 Vent Moyen vs Rafale</span>
              <span className="text-[10px] bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-800/80 text-amber-300">Anémomètre</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Le vent moyen est calculé sur 10 minutes à 10 m de hauteur. La rafale correspond à la valeur maximale mesurée sur 3 secondes.
            </p>
          </div>
        </div>
      </div>

      {/* Part 3: Android APK & Mobile Direct Download */}
      <div className="rounded-lg border border-slate-800 bg-[#0F172A] p-5 sm:p-6 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-800 text-emerald-400 border border-slate-700">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                Application Mobile &amp; Paquet APK Android
              </h3>
              <p className="text-xs text-slate-400">
                Installation directe sans intermédiaire pour smartphones Android.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href="/Instant-Meteo.apk"
              download="Instant-Meteo.apk"
              className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-4 py-2 font-semibold text-white text-xs hover:bg-emerald-500 transition cursor-pointer"
            >
              <Download className="h-4 w-4" />
              <span>Télécharger l'APK</span>
            </a>

            {onOpenAndroidModal && (
              <button
                onClick={onOpenAndroidModal}
                className="inline-flex items-center gap-1.5 rounded-md bg-slate-800 hover:bg-slate-750 px-3.5 py-2 font-semibold text-slate-200 text-xs border border-slate-700 transition cursor-pointer"
              >
                <Smartphone className="h-4 w-4 text-sky-400" />
                <span>Guide d'installation</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

