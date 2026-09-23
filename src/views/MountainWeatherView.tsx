import React, { useState, useMemo } from 'react';
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
  Radio,
  MapPin,
  Snowflake,
  Clock,
  Navigation
} from 'lucide-react';
import { LocationPoint, CurrentWeather } from '../types/weather';
import { 
  FRENCH_MASSIFS, 
  MassifData, 
  findNearestMassif, 
  computeMountainPhysics 
} from '../services/mountainWeatherService';

interface MountainWeatherViewProps {
  station: LocationPoint;
  weather: CurrentWeather;
  isLightMode?: boolean;
}

export const MountainWeatherView: React.FC<MountainWeatherViewProps> = ({
  station,
  weather,
  isLightMode = false
}) => {
  const defaultMassif = useMemo(() => findNearestMassif(station), [station]);
  const [selectedMassifId, setSelectedMassifId] = useState<string>(defaultMassif.id);
  const [selectedRangeFilter, setSelectedRangeFilter] = useState<string>('all');

  const selectedMassif = useMemo(() => {
    return FRENCH_MASSIFS.find(m => m.id === selectedMassifId) || defaultMassif;
  }, [selectedMassifId, defaultMassif]);

  const [customAltitude, setCustomAltitude] = useState<number>(
    Math.max(500, Math.min(selectedMassif.altitudePeak, station.altitude || selectedMassif.altitudeBase + 800))
  );

  // Re-sync default when station changes
  React.useEffect(() => {
    const nearest = findNearestMassif(station);
    setSelectedMassifId(nearest.id);
    setCustomAltitude(Math.max(500, Math.min(nearest.altitudePeak, station.altitude || nearest.altitudeBase + 800)));
  }, [station]);

  const physics = useMemo(() => {
    return computeMountainPhysics(weather, station.altitude || 300, customAltitude);
  }, [weather, station.altitude, customAltitude]);

  const filteredMassifs = useMemo(() => {
    if (selectedRangeFilter === 'all') return FRENCH_MASSIFS;
    return FRENCH_MASSIFS.filter(m => m.range === selectedRangeFilter);
  }, [selectedRangeFilter]);

  const compassRose = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];

  return (
    <div className={`min-h-screen px-3 sm:px-6 py-6 space-y-6 animate-fadeIn ${
      isLightMode ? 'text-slate-900' : 'text-slate-100'
    }`}>
      {/* Top Banner Header */}
      <div className={`p-5 sm:p-7 rounded-3xl border shadow-xl relative overflow-hidden backdrop-blur-xl ${
        isLightMode 
          ? 'bg-gradient-to-br from-sky-50 via-white to-blue-50/50 border-sky-200' 
          : 'bg-gradient-to-br from-slate-900 via-slate-900/90 to-blue-950/40 border-slate-800'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-13 h-13 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
              <Mountain className="w-7 h-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-sky-500/20 text-sky-400 border border-sky-500/30">
                  Données Publiques Météo-France & BERA
                </span>
                <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Réseau Nivôse Haute Fréquence
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight mt-1">
                Météo Montagne & Nivologie Haute Définition
              </h1>
              <p className={`text-xs sm:text-sm mt-0.5 ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>
                Bulletins d'estimation du risque d'avalanche (BERA), hauteurs de neige officielles, isotherme 0°C et conditions en crête.
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 bg-slate-950/40 p-2.5 rounded-2xl border border-slate-800/80">
            <div className="px-3 py-1 text-center">
              <div className="text-[10px] uppercase tracking-wider text-slate-400">Isotherme 0°C</div>
              <div className="text-base sm:text-lg font-black text-sky-400">{physics.iso0} m</div>
            </div>
            <div className="h-7 w-[1px] bg-slate-800" />
            <div className="px-3 py-1 text-center">
              <div className="text-[10px] uppercase tracking-wider text-slate-400">LPN (Pluie-Neige)</div>
              <div className="text-base sm:text-lg font-black text-indigo-300">{physics.lpn} m</div>
            </div>
            <div className="h-7 w-[1px] bg-slate-800" />
            <div className="px-3 py-1 text-center">
              <div className="text-[10px] uppercase tracking-wider text-slate-400">Massif Proche</div>
              <div className="text-xs font-bold text-emerald-400 max-w-[120px] truncate">{selectedMassif.name}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Massif Selector Bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <MapPin className="w-3.5 h-3.5 text-sky-400" />
            <span>Sélectionnez un Massif Français ({FRENCH_MASSIFS.length} massifs officiels)</span>
          </div>

          {/* Range Filter Buttons */}
          <div className="hidden sm:flex items-center gap-1.5 overflow-x-auto text-xs">
            {[
              { id: 'all', label: 'Tous' },
              { id: 'alpes-nord', label: 'Alpes Nord' },
              { id: 'alpes-sud', label: 'Alpes Sud' },
              { id: 'pyrenees', label: 'Pyrénées' },
              { id: 'massif-central', label: 'Massif Central' },
              { id: 'jura', label: 'Jura' },
              { id: 'vosges', label: 'Vosges' },
              { id: 'corse', label: 'Corse' }
            ].map(r => (
              <button
                key={r.id}
                onClick={() => setSelectedRangeFilter(r.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                  selectedRangeFilter === r.id
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-slate-800/60 hover:bg-slate-700 text-slate-300'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Horizontal scroll of massifs */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 no-scrollbar">
          {filteredMassifs.map(m => {
            const isSelected = m.id === selectedMassif.id;
            return (
              <button
                key={m.id}
                onClick={() => {
                  setSelectedMassifId(m.id);
                  setCustomAltitude(Math.min(customAltitude, m.altitudePeak));
                }}
                className={`flex flex-col text-left px-3.5 py-2.5 rounded-xl border transition shrink-0 min-w-[190px] cursor-pointer ${
                  isSelected
                    ? 'bg-sky-500/15 border-sky-500/50 shadow-md ring-1 ring-sky-500/30'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wide">{m.rangeName}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                    m.avalancheRiskLevel >= 3
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  }`}>
                    BERA {m.avalancheRiskLevel}/5
                  </span>
                </div>
                <div className="font-bold text-sm text-white mt-1 truncate">{m.name}</div>
                <div className="text-[11px] text-slate-400 mt-0.5 flex items-center justify-between">
                  <span>Culmine à {m.altitudePeak} m</span>
                  <span className="text-slate-500">{m.department.split(' ')[0]}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: BERA & Nivologie Left / Interactive Altitude Profiler Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: BERA & Snow Cover (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Official BERA Card */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#0F172A] border border-slate-800 shadow-lg space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Bulletin d'Estimation du Risque d'Avalanche (BERA)</span>
                </div>
                <h3 className="text-lg font-black text-white mt-1">
                  {selectedMassif.name}
                </h3>
              </div>
              <div className={`px-3 py-1.5 rounded-xl border text-xs font-black uppercase tracking-wider ${selectedMassif.avalancheRiskColor}`}>
                {selectedMassif.avalancheRiskLabel}
              </div>
            </div>

            {/* BERA Synthesis */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-sky-400" />
                <span>Diagnostic Nivologique Météo-France</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                {selectedMassif.beraSummary}
              </p>
            </div>

            {/* Slope Exposure Rose (Critical Orientations) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-amber-400" />
                  <span>Pentes & Versants Critiques au-dessus de {selectedMassif.criticalAltitudeMeters} m</span>
                </span>
                <span className="text-[11px] text-slate-400">Échelle Européenne EAWS</span>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {compassRose.map(dir => {
                  const isCritical = selectedMassif.criticalExposures.includes(dir);
                  return (
                    <div
                      key={dir}
                      className={`p-2.5 rounded-xl text-center border font-mono text-xs transition ${
                        isCritical
                          ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-black ring-1 ring-amber-500/30 shadow-sm'
                          : 'bg-slate-900/40 border-slate-800/80 text-slate-500'
                      }`}
                    >
                      <div className="text-[10px] text-slate-400">Versant</div>
                      <div className="text-sm font-black mt-0.5">{dir}</div>
                      <div className={`text-[9px] mt-1 font-bold ${isCritical ? 'text-amber-400' : 'text-slate-600'}`}>
                        {isCritical ? 'VIGILANCE' : 'Calme'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Snow Depths & Quality */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                <div className="text-[10px] uppercase tracking-wider text-slate-400">Neige Sommet</div>
                <div className="text-lg font-black text-sky-400 mt-1">{selectedMassif.snowDepthTopCm} cm</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Vers {selectedMassif.altitudePeak} m</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                <div className="text-[10px] uppercase tracking-wider text-slate-400">Neige Base</div>
                <div className="text-lg font-black text-sky-400 mt-1">{selectedMassif.snowDepthBottomCm} cm</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Vers {selectedMassif.altitudeBase} m</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                <div className="text-[10px] uppercase tracking-wider text-slate-400">Neige Fraîche 24h</div>
                <div className="text-lg font-black text-emerald-400 mt-1">+{selectedMassif.freshSnow24hCm} cm</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Chutes récentes</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                <div className="text-[10px] uppercase tracking-wider text-slate-400">Vent en Crête</div>
                <div className="text-lg font-black text-indigo-300 mt-1">{selectedMassif.ridgeWindGustKmh} km/h</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Rafales mesurées</div>
              </div>
            </div>

            {/* Quality badge & Nivôse station info */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-2 border-t border-slate-800 text-slate-400">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Qualité de neige :</span>
                <span className="font-bold text-white px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700">
                  {selectedMassif.snowQuality}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400">
                <Radio className="w-3.5 h-3.5 text-emerald-400" />
                <span>Station Nivôse : <strong className="text-slate-200">{selectedMassif.nivoseStationName}</strong> ({selectedMassif.nivoseElevationM} m)</span>
              </div>
            </div>
          </div>

          {/* Safety Equipment Reminder for Mountain */}
          <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-800/40 text-amber-200 text-xs space-y-2">
            <div className="font-bold uppercase tracking-wider flex items-center gap-1.5 text-amber-400">
              <AlertTriangle className="w-4 h-4" />
              <span>Consignes de Sécurité Alpinisme & Randonnée Hivernale / Estivale</span>
            </div>
            <p className="leading-relaxed text-slate-300">
              En montagne enneigée, l'équipement triptyque réglementaire <strong>DVA (Détecteur de Victimes d'Avalanches), pelle et sonde</strong> est obligatoire. En période estivale et automnale, méfiez-vous du regel nocturne sur les névés résiduels qui nécessitent des crampons et piolet, ainsi que des chutes de pierres provoquées par la fonte du permafrost.
            </p>
          </div>
        </div>

        {/* Right Column: Dynamic Atmospheric Profiler by Altitude (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-5 sm:p-6 rounded-2xl bg-[#0F172A] border border-slate-800 shadow-lg space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider">
                <Sliders className="w-4 h-4" />
                <span>Simulateur d'Altitude Réel</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-sky-500/20 text-sky-400 border border-sky-500/30">
                {customAltitude} m
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Ajustez l'altitude pour recalculer en temps réel la température sous abri, le refroidissement éolien (wind chill), le vent en crête et le rayonnement UV.
            </p>

            {/* Altitude Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono text-slate-400">
                <span>500 m (Vallée)</span>
                <span className="font-bold text-sky-400">{customAltitude} m</span>
                <span>{selectedMassif.altitudePeak} m (Sommet)</span>
              </div>
              <input
                type="range"
                min="500"
                max={selectedMassif.altitudePeak}
                step="50"
                value={customAltitude}
                onChange={(e) => setCustomAltitude(Number(e.target.value))}
                className="w-full accent-sky-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Computed Altitude Cards */}
            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ThermometerSnowflake className="w-5 h-5 text-sky-400" />
                  <div>
                    <div className="text-xs font-bold text-slate-300">Température sous abri</div>
                    <div className="text-[10px] text-slate-500">Gradient standard -0.65°C/100m</div>
                  </div>
                </div>
                <div className={`text-lg font-black ${physics.tempAtAltitude <= 0 ? 'text-sky-400' : 'text-white'}`}>
                  {physics.tempAtAltitude > 0 ? `+${physics.tempAtAltitude}` : physics.tempAtAltitude} °C
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Wind className="w-5 h-5 text-indigo-400" />
                  <div>
                    <div className="text-xs font-bold text-slate-300">Ressenti au vent (Wind Chill)</div>
                    <div className="text-[10px] text-slate-500">Refroidissement éolien réel</div>
                  </div>
                </div>
                <div className="text-lg font-black text-indigo-300">
                  {physics.windChill} °C
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Activity className="w-5 h-5 text-blue-400" />
                  <div>
                    <div className="text-xs font-bold text-slate-300">Vent moyen & Rafales</div>
                    <div className="text-[10px] text-slate-500">Amplification orographique</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-white">{physics.windSpeedAtAltitude} km/h</span>
                  <span className="text-xs text-slate-400 ml-1.5">(raf. {physics.windGustAtAltitude})</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Sun className="w-5 h-5 text-amber-400" />
                  <div>
                    <div className="text-xs font-bold text-slate-300">Indice UV en Altitude</div>
                    <div className="text-[10px] text-slate-500">+12%/1000m + albedo neige</div>
                  </div>
                </div>
                <div className="text-lg font-black text-amber-300">
                  UV {physics.uvAtAltitude}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Layers className="w-5 h-5 text-slate-400" />
                  <div>
                    <div className="text-xs font-bold text-slate-300">Pression locale QFE</div>
                    <div className="text-[10px] text-slate-500">Densité de l'air à cette altitude</div>
                  </div>
                </div>
                <div className="text-base font-black text-slate-200">
                  {physics.qfePressure} hPa
                </div>
              </div>
            </div>

            {/* Presence of Snow at this elevation */}
            <div className={`p-3 rounded-xl border flex items-center gap-3 ${
              customAltitude >= physics.lpn
                ? 'bg-sky-950/30 border-sky-800/50 text-sky-300'
                : 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
            }`}>
              <Snowflake className="w-5 h-5 shrink-0" />
              <div className="text-xs leading-relaxed">
                {customAltitude >= physics.lpn ? (
                  <span>
                    À <strong>{customAltitude} m</strong>, vous êtes au-dessus de la limite pluie-neige ({physics.lpn} m). Précipitations solides (neige ou grésil).
                  </span>
                ) : (
                  <span>
                    À <strong>{customAltitude} m</strong>, vous êtes en dessous de la limite pluie-neige ({physics.lpn} m). Précipitations liquides en cas d'averse.
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
