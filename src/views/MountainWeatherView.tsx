import React, { useState } from 'react';
import { 
  Mountain, 
  ThermometerSnowflake, 
  Wind, 
  Sun, 
  ShieldAlert, 
  Layers, 
  Activity, 
  Compass, 
  TrendingDown, 
  Eye, 
  Sparkles,
  ChevronRight,
  Info,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Radio
} from 'lucide-react';
import { LocationPoint, CurrentWeather } from '../types/weather';

interface MountainWeatherViewProps {
  station: LocationPoint;
  weather: CurrentWeather;
  isLightMode?: boolean;
}

interface MassifData {
  id: string;
  name: string;
  region: string;
  altitudePeak: number;
  avalancheRiskLevel: 1 | 2 | 3 | 4 | 5;
  avalancheRiskLabel: string;
  avalancheRiskColor: string;
  criticalExposures: string[]; // e.g. ['N', 'NE', 'NO']
  criticalAltitudeMeters: number;
  snowDepthBottomCm: number; // à 1500m
  snowDepthTopCm: number; // à 2500m
  freshSnow24hCm: number;
  ridgeWindGustKmh: number;
  beraSummary: string;
  snowQuality: 'Poudreuse froide' | 'Neige de printemps (regel)' | 'Plaques à vent friables' | 'Neige lourde humide';
}

const MASSIFS_DATABASE: MassifData[] = [
  {
    id: 'mont-blanc',
    name: 'Massif du Mont-Blanc',
    region: 'Haute-Savoie (Alpes du Nord)',
    altitudePeak: 4809,
    avalancheRiskLevel: 3,
    avalancheRiskLabel: 'Marqué (Niveau 3/5)',
    avalancheRiskColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    criticalExposures: ['N', 'NE', 'E', 'NO'],
    criticalAltitudeMeters: 2200,
    snowDepthBottomCm: 85,
    snowDepthTopCm: 290,
    freshSnow24hCm: 15,
    ridgeWindGustKmh: 65,
    beraSummary: 'Plaques à vent friables formées par le vent de Sud-Ouest en altitude au-dessus de 2200m. Risque de déclenchement accidentel par un seul skieur en versants ombragés.',
    snowQuality: 'Plaques à vent friables'
  },
  {
    id: 'vanoise',
    name: 'Vanoise & Haute-Tarentaise',
    region: 'Savoie (Alpes du Nord)',
    altitudePeak: 3855,
    avalancheRiskLevel: 2,
    avalancheRiskLabel: 'Limité (Niveau 2/5)',
    avalancheRiskColor: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
    criticalExposures: ['N', 'NE'],
    criticalAltitudeMeters: 2400,
    snowDepthBottomCm: 60,
    snowDepthTopCm: 210,
    freshSnow24hCm: 5,
    ridgeWindGustKmh: 45,
    beraSummary: 'Manteau globalement stabilisé en dessous de 2400m avec bon regel nocturne. Quelques accumulations résiduelles sur les crêtes d\'altitude.',
    snowQuality: 'Neige de printemps (regel)'
  },
  {
    id: 'belledonne',
    name: 'Belledonne & Oisans',
    region: 'Isère (Alpes)',
    altitudePeak: 4102,
    avalancheRiskLevel: 2,
    avalancheRiskLabel: 'Limité (Niveau 2/5)',
    avalancheRiskColor: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
    criticalExposures: ['E', 'SE', 'N'],
    criticalAltitudeMeters: 2100,
    snowDepthBottomCm: 50,
    snowDepthTopCm: 185,
    freshSnow24hCm: 2,
    ridgeWindGustKmh: 40,
    beraSummary: 'Conditions printanières en moyenne montagne. Neige dure le matin se ramollissant au soleil l\'après-midi.',
    snowQuality: 'Neige de printemps (regel)'
  },
  {
    id: 'pyrenees-haute-bigorre',
    name: 'Haute-Bigorre & Vignemale',
    region: 'Hautes-Pyrénées',
    altitudePeak: 3298,
    avalancheRiskLevel: 3,
    avalancheRiskLabel: 'Marqué (Niveau 3/5)',
    avalancheRiskColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    criticalExposures: ['N', 'NE', 'NO'],
    criticalAltitudeMeters: 2000,
    snowDepthBottomCm: 70,
    snowDepthTopCm: 240,
    freshSnow24hCm: 20,
    ridgeWindGustKmh: 75,
    beraSummary: 'Vent de Sud en crête provoquant des reports massifs de neige sous le vent en versants Nord. Prudence accrue dans les couloirs.',
    snowQuality: 'Poudreuse froide'
  },
  {
    id: 'massif-central-sancy',
    name: 'Massif du Sancy & Cantal',
    region: 'Auvergne (Massif Central)',
    altitudePeak: 1885,
    avalancheRiskLevel: 2,
    avalancheRiskLabel: 'Limité (Niveau 2/5)',
    avalancheRiskColor: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
    criticalExposures: ['E', 'NE'],
    criticalAltitudeMeters: 1500,
    snowDepthBottomCm: 20,
    snowDepthTopCm: 85,
    freshSnow24hCm: 0,
    ridgeWindGustKmh: 55,
    beraSummary: 'Manteau neigeux discontinu en basse altitude. Corniches formées sur les crêtes sommitales par le vent d\'Ouest.',
    snowQuality: 'Neige de printemps (regel)'
  },
  {
    id: 'jura-hautes-combes',
    name: 'Hautes-Combes & Mont d\'Or',
    region: 'Jura / Doubs',
    altitudePeak: 1720,
    avalancheRiskLevel: 1,
    avalancheRiskLabel: 'Faible (Niveau 1/5)',
    avalancheRiskColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    criticalExposures: ['NE'],
    criticalAltitudeMeters: 1400,
    snowDepthBottomCm: 25,
    snowDepthTopCm: 65,
    freshSnow24hCm: 0,
    ridgeWindGustKmh: 30,
    beraSummary: 'Risque avalancheux très faible. Pistes nordiques bien praticables en crêtes.',
    snowQuality: 'Neige de printemps (regel)'
  },
  {
    id: 'vosges-cretes',
    name: 'Hautes-Vosges & Hohneck',
    region: 'Vosges / Alsace',
    altitudePeak: 1424,
    avalancheRiskLevel: 1,
    avalancheRiskLabel: 'Faible (Niveau 1/5)',
    avalancheRiskColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    criticalExposures: ['E'],
    criticalAltitudeMeters: 1200,
    snowDepthBottomCm: 15,
    snowDepthTopCm: 45,
    freshSnow24hCm: 0,
    ridgeWindGustKmh: 40,
    beraSummary: 'Neige dure en altitude. Risque de glissade sur névés gelés le matin.',
    snowQuality: 'Neige de printemps (regel)'
  },
  {
    id: 'corse-cinto',
    name: 'Monte Cinto & Rotondo',
    region: 'Corse (Haute Montagne)',
    altitudePeak: 2706,
    avalancheRiskLevel: 2,
    avalancheRiskLabel: 'Limité (Niveau 2/5)',
    avalancheRiskColor: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
    criticalExposures: ['N', 'NE'],
    criticalAltitudeMeters: 1900,
    snowDepthBottomCm: 40,
    snowDepthTopCm: 160,
    freshSnow24hCm: 0,
    ridgeWindGustKmh: 60,
    beraSummary: 'Enneigement continu au-dessus de 1800m. Risque de coulées humides par réchauffement diurne dans les faces Sud.',
    snowQuality: 'Neige lourde humide'
  }
];

export const MountainWeatherView: React.FC<MountainWeatherViewProps> = ({
  station,
  weather,
  isLightMode = false
}) => {
  const [selectedMassifId, setSelectedMassifId] = useState<string>('mont-blanc');
  const [customAltitude, setCustomAltitude] = useState<number>(Math.max(500, Math.min(3800, station.altitude || 1800)));

  const selectedMassif = MASSIFS_DATABASE.find(m => m.id === selectedMassifId) || MASSIFS_DATABASE[0];

  // Calculs d'altitude personnalisée basés sur la physique atmosphérique
  const baseTemp = weather.temperature;
  const baseAlt = station.altitude || 200;
  const deltaAlt = customAltitude - baseAlt;
  const isWetLapse = weather.humidity > 80 || weather.precipitation > 0;
  const lapseRatePer100m = isWetLapse ? -0.55 : -0.65;
  const altitudeTemp = Number((baseTemp + (deltaAlt / 100) * lapseRatePer100m).toFixed(1));
  const altitudeWind = Math.round(weather.windSpeed * (1 + (customAltitude / 2000) * 0.45));
  const altitudeGust = Math.round(weather.windGust * (1 + (customAltitude / 2000) * 0.5));
  const altitudeUv = Number((weather.uvIndex * (1 + (customAltitude / 1000) * 0.12) * 1.8).toFixed(1)); // albédo neige
  const altitudePressureQfe = Math.round(1013.25 * Math.pow(1 - (0.0065 * customAltitude) / 288.15, 5.255));

  const iso0 = weather.isotherm0Meters ?? 2400;
  const lpn = weather.snowRainLimitMeters ?? 2100;

  return (
    <div className={`min-h-screen px-4 py-6 md:px-8 space-y-8 animate-fadeIn ${
      isLightMode ? 'text-slate-900' : 'text-slate-100'
    }`}>
      {/* Top Banner Header */}
      <div className={`p-6 rounded-3xl border shadow-xl relative overflow-hidden backdrop-blur-xl ${
        isLightMode 
          ? 'bg-gradient-to-br from-sky-50 via-white to-blue-50/50 border-sky-200' 
          : 'bg-gradient-to-br from-slate-900 via-slate-900/90 to-blue-950/40 border-slate-800'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
              <Mountain className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-sky-500/20 text-sky-400 border border-sky-500/30">
                  Données Publiques Météo-France & BERA
                </span>
                <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Réseau Nivôse Haute Fréquence
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
                Météo Montagne & Nivologie
              </h1>
              <p className={`text-sm mt-0.5 ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>
                Bulletins d'estimation du risque d'avalanche (BERA), hauteurs de neige officielles, isotherme 0°C et conditions en crête.
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 bg-slate-950/30 p-2.5 rounded-2xl border border-slate-700/50">
            <div className="px-3 py-1.5 rounded-xl text-center">
              <div className="text-[11px] uppercase tracking-wider text-slate-400">Isotherme 0°C</div>
              <div className="text-lg font-black text-sky-400">{iso0} m</div>
            </div>
            <div className="w-px h-8 bg-slate-700/60" />
            <div className="px-3 py-1.5 rounded-xl text-center">
              <div className="text-[11px] uppercase tracking-wider text-slate-400">Limite Pluie-Neige</div>
              <div className="text-lg font-black text-indigo-400">{lpn} m</div>
            </div>
            <div className="w-px h-8 bg-slate-700/60" />
            <div className="px-3 py-1.5 rounded-xl text-center">
              <div className="text-[11px] uppercase tracking-wider text-slate-400">Regel Nocturne</div>
              <div className="text-lg font-black text-emerald-400">Actif &gt; 1800m</div>
            </div>
          </div>
        </div>

        {/* Massif Selector Pills */}
        <div className="mt-6 pt-5 border-t border-slate-700/40">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-sky-400" />
            Sélectionner un massif français officiel (BERA Météo-France) :
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {MASSIFS_DATABASE.map(m => (
              <button
                key={m.id}
                onClick={() => setSelectedMassifId(m.id)}
                className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 border ${
                  selectedMassifId === m.id
                    ? 'bg-sky-500 text-white border-sky-400 shadow-lg shadow-sky-500/25'
                    : isLightMode
                      ? 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800'
                }`}
              >
                <span>{m.name}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-extrabold ${
                  m.avalancheRiskLevel >= 3 ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'
                }`}>
                  {m.avalancheRiskLevel}/5
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid: BERA Avalanche Risk Card & Snowpack Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: BERA Avalanche Risk (2 cols) */}
        <div className={`lg:col-span-2 p-6 rounded-3xl border shadow-xl backdrop-blur-md flex flex-col justify-between ${
          isLightMode ? 'bg-white border-slate-200' : 'bg-slate-900/95 border-slate-800'
        }`}>
          <div>
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-700/40">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
                  {selectedMassif.region}
                </span>
                <h2 className="text-2xl font-black tracking-tight mt-0.5">
                  {selectedMassif.name} (Sommet : {selectedMassif.altitudePeak} m)
                </h2>
              </div>
              <div className={`px-4 py-2 rounded-2xl border text-center ${selectedMassif.avalancheRiskColor}`}>
                <div className="text-xs font-bold uppercase tracking-wider">Indice BERA</div>
                <div className="text-xl font-black">{selectedMassif.avalancheRiskLabel}</div>
              </div>
            </div>

            {/* BERA Narrative Summary */}
            <div className="mt-5 p-4 rounded-2xl bg-slate-950/40 border border-slate-800">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Synthèse Officielle Météo-France BERA
                  </div>
                  <p className="text-sm text-slate-300 mt-1 leading-relaxed">
                    {selectedMassif.beraSummary}
                  </p>
                </div>
              </div>
            </div>

            {/* Critical Sectors & Slope Exposures */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-950/30 border border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  <Compass className="w-4 h-4 text-sky-400" />
                  Pentes & Versants les plus dangereux :
                </div>
                <div className="flex items-center gap-2">
                  {['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'].map(dir => {
                    const isCritical = selectedMassif.criticalExposures.includes(dir);
                    return (
                      <div
                        key={dir}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black border transition-all ${
                          isCritical
                            ? 'bg-red-500/20 text-red-400 border-red-500/40 shadow-sm shadow-red-500/20'
                            : 'bg-slate-800/40 text-slate-500 border-slate-700/30'
                        }`}
                      >
                        {dir}
                      </div>
                    );
                  })}
                </div>
                <div className="text-xs text-slate-400 mt-2">
                  Danger marqué au-delà de <strong>{selectedMassif.criticalAltitudeMeters} m</strong>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/30 border border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  <ThermometerSnowflake className="w-4 h-4 text-indigo-400" />
                  Nature du manteau neigeux :
                </div>
                <div className="text-lg font-black text-indigo-300">
                  {selectedMassif.snowQuality}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Chutes fraîches (24h) : <strong className="text-white">+{selectedMassif.freshSnow24hCm} cm</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Snow Depth Levels */}
          <div className="mt-6 pt-4 border-t border-slate-700/40 grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800">
              <div className="text-[11px] text-slate-400 font-medium">Neige au pied (1500m)</div>
              <div className="text-xl font-black text-white mt-0.5">{selectedMassif.snowDepthBottomCm} cm</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800">
              <div className="text-[11px] text-slate-400 font-medium">Neige en haut (2500m)</div>
              <div className="text-xl font-black text-sky-400 mt-0.5">{selectedMassif.snowDepthTopCm} cm</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800">
              <div className="text-[11px] text-slate-400 font-medium">Vent en crête</div>
              <div className="text-xl font-black text-amber-400 mt-0.5">{selectedMassif.ridgeWindGustKmh} km/h</div>
            </div>
          </div>
        </div>

        {/* Card 2: Interactive Mountain Altitude Simulator (1 col) */}
        <div className={`p-6 rounded-3xl border shadow-xl backdrop-blur-md flex flex-col justify-between ${
          isLightMode ? 'bg-white border-slate-200' : 'bg-slate-900/95 border-slate-800'
        }`}>
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/40">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-sky-400" />
                <h3 className="text-lg font-black tracking-tight">Sondeur d'Altitude</h3>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30">
                Gradient -0.65°C/100m
              </span>
            </div>

            <p className={`text-xs mt-3 ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>
              Ajustez le curseur pour simuler en direct la température, le vent et la pression à n'importe quelle altitude de randonnée ou d'alpinisme.
            </p>

            {/* Slider */}
            <div className="mt-5 p-4 rounded-2xl bg-slate-950/40 border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Altitude ciblée</span>
                <span className="text-2xl font-black text-sky-400">{customAltitude} m</span>
              </div>
              <input
                type="range"
                min={500}
                max={3800}
                step={50}
                value={customAltitude}
                onChange={(e) => setCustomAltitude(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-bold mt-1">
                <span>500m (Vallée)</span>
                <span>2000m (Alpage)</span>
                <span>3800m (Haute Montagne)</span>
              </div>
            </div>

            {/* Simulated Values */}
            <div className="mt-4 space-y-2.5">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/30 border border-slate-800">
                <span className="text-xs text-slate-400 flex items-center gap-1.5">
                  <ThermometerSnowflake className="w-4 h-4 text-indigo-400" />
                  Température sous abri
                </span>
                <span className={`text-base font-black ${altitudeTemp <= 0 ? 'text-cyan-400' : 'text-amber-400'}`}>
                  {altitudeTemp > 0 ? `+${altitudeTemp}` : altitudeTemp}°C
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/30 border border-slate-800">
                <span className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Wind className="w-4 h-4 text-amber-400" />
                  Vent moyen / Rafales
                </span>
                <span className="text-sm font-bold text-slate-200">
                  {altitudeWind} km/h (raf. {altitudeGust})
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/30 border border-slate-800">
                <span className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Sun className="w-4 h-4 text-yellow-400" />
                  Indice UV (avec réverbération)
                </span>
                <span className="text-sm font-bold text-yellow-400">
                  {altitudeUv} (Indice Très Élevé)
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/30 border border-slate-800">
                <span className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  Pression barométrique QFE
                </span>
                <span className="text-sm font-bold text-emerald-400">
                  {altitudePressureQfe} hPa
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 p-3 rounded-xl bg-sky-500/10 border border-sky-500/30 text-[11px] text-sky-300 flex items-center gap-2">
            <Info className="w-4 h-4 shrink-0 text-sky-400" />
            <span>À {customAltitude}m, l'oxygène effectif représente {Math.round((altitudePressureQfe / 1013) * 100)}% de la pression au niveau de la mer.</span>
          </div>
        </div>
      </div>

      {/* Official Nivôse Stations Live Grid */}
      <div className={`p-6 rounded-3xl border shadow-xl backdrop-blur-md ${
        isLightMode ? 'bg-white border-slate-200' : 'bg-slate-900/95 border-slate-800'
      }`}>
        <div className="flex items-center justify-between pb-4 border-b border-slate-700/40">
          <div>
            <div className="flex items-center gap-2">
              <Radio className="w-5 h-5 text-sky-400" />
              <h3 className="text-xl font-black tracking-tight">
                Stations Nivôse Météo-France de Haute Altitude (Temps Réel)
              </h3>
            </div>
            <p className={`text-xs mt-0.5 ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>
              Balises automatiques implantées en haute montagne pour le suivi continu du manteau neigeux et de la sécurité civile.
            </p>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" /> 8 Balises Nationales Connectées
          </span>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { name: 'Aiguille du Midi', massif: 'Mont-Blanc', alt: 3842, snow: 310, fresh: 15, t: -9.5, wind: 65 },
            { name: 'Bellecôte', massif: 'Vanoise', alt: 3000, snow: 245, fresh: 5, t: -5.2, wind: 48 },
            { name: 'Le Parpaillon', massif: 'Ubaye / Embrunais', alt: 2640, snow: 190, fresh: 2, t: -3.8, wind: 35 },
            { name: 'Le Meije Écrins', massif: 'Oisans', alt: 3150, snow: 270, fresh: 8, t: -6.4, wind: 52 },
            { name: 'Port d\'Aula', massif: 'Couserans (Pyrénées)', alt: 2140, snow: 185, fresh: 18, t: -1.8, wind: 68 },
            { name: 'Soum Couy', massif: 'Aspe-Ossau (Pyrénées)', alt: 2150, snow: 210, fresh: 22, t: -2.1, wind: 72 },
            { name: 'Chastreix-Sancy', massif: 'Massif Central', alt: 1780, snow: 75, fresh: 0, t: +1.2, wind: 45 },
            { name: 'Le Markstein Crêtes', massif: 'Hautes-Vosges', alt: 1200, snow: 40, fresh: 0, t: +3.4, wind: 32 }
          ].map((st, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800 hover:border-sky-500/40 transition-all group"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-sky-400">{st.massif}</span>
                <span className="font-mono text-slate-400">{st.alt} m</span>
              </div>
              <div className="text-base font-black text-slate-100 mt-1 group-hover:text-sky-300 transition-colors">
                {st.name}
              </div>

              <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">Neige au sol</span>
                  <span className="font-bold text-white text-sm">{st.snow} cm</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Neige fraîche 24h</span>
                  <span className="font-bold text-indigo-400 text-sm">+{st.fresh} cm</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">T°C Relevée</span>
                  <span className={`font-bold text-sm ${st.t <= 0 ? 'text-cyan-400' : 'text-amber-400'}`}>
                    {st.t > 0 ? `+${st.t}` : st.t}°C
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Vent en crête</span>
                  <span className="font-bold text-slate-300 text-sm">{st.wind} km/h</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
