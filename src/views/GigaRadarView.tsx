import React, { useState } from 'react';
import { LocationPoint, CurrentWeather, HourlyForecast, DailyForecast } from '../types/weather';
import { PrecisionRadarMap } from '../components/PrecisionRadarMap';
import { FireProximityRadarCard } from '../components/FireProximityRadarCard';
import { ThunderstormConvectiveDetailsCard } from '../components/ThunderstormConvectiveDetailsCard';
import { calculateThunderstormAnalysis } from '../services/thunderstormService';
import { FRENCH_STATIONS } from '../data/frenchStations';
import { WORLD_STATIONS } from '../data/worldStations';
import { 
  CloudRain, 
  Globe2, 
  Zap, 
  Compass, 
  Layers, 
  Info, 
  Eye, 
  MapPin, 
  Mountain,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  Radio,
  Sliders,
  Target,
  Clock,
  Activity,
  Droplets,
  Snowflake,
  Wind,
  Maximize2,
  Flame,
  CheckCircle2,
  Thermometer,
  Users
} from 'lucide-react';
import { WorldAverageTemperatureMap } from '../components/WorldAverageTemperatureMap';
import { CommunityWeatherMap } from '../components/CommunityWeatherMap';

interface GigaRadarViewProps {
  currentStation: LocationPoint;
  onSelectStation: (station: LocationPoint) => void;
  weather: CurrentWeather;
  hourly?: HourlyForecast[];
  daily?: DailyForecast[];
  seniorMode: boolean;
  simplifiedMode?: boolean;
  onOpenSearchModal: () => void;
  onNavigateTab?: (tabId: string) => void;
  initialMapMode?: 'radar' | 'worldTemperature' | 'communityReports';
}

export const GigaRadarView: React.FC<GigaRadarViewProps> = ({
  currentStation,
  onSelectStation,
  weather,
  hourly = [],
  daily = [],
  seniorMode,
  simplifiedMode = false,
  onOpenSearchModal,
  onNavigateTab,
  initialMapMode = 'radar'
}) => {
  const [activeMapMode, setActiveMapMode] = useState<'radar' | 'worldTemperature' | 'communityReports'>(initialMapMode);
  const [activeSubBlock, setActiveSubBlock] = useState<'storm' | 'fire' | null>(null);
  const [showOtherMapsModal, setShowOtherMapsModal] = useState<boolean>(false);

  const thunderstormAnalysis = React.useMemo(() => {
    return calculateThunderstormAnalysis(currentStation, weather, hourly);
  }, [currentStation, weather, hourly]);

  return (
    <div id="giga-radar-view" className="space-y-6">
      {/* Top Map Mode Switcher */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-[22px] sm:rounded-2xl bg-[#0c1424]/95 sm:bg-slate-900/90 border border-slate-800/90 shadow-xl overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveMapMode('radar')}
          className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full sm:rounded-xl font-black text-xs sm:text-sm transition cursor-pointer whitespace-nowrap shrink-0 active:scale-95 ${
            activeMapMode === 'radar'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <CloudRain className="h-4 w-4" />
          <span>🌧️ Radar Précipitations &amp; Vents HD</span>
        </button>

        <button
          id="radar-tab-world-temperatures"
          onClick={() => setActiveMapMode('worldTemperature')}
          className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full sm:rounded-xl font-black text-xs sm:text-sm transition cursor-pointer whitespace-nowrap shrink-0 active:scale-95 ${
            activeMapMode === 'worldTemperature'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Thermometer className="h-4 w-4 text-amber-300" />
          <span>🌡️ Températures Moyennes Mondiales (OSM)</span>
        </button>

        <button
          id="radar-tab-community-reports"
          onClick={() => setActiveMapMode('communityReports')}
          className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full sm:rounded-xl font-black text-xs sm:text-sm transition cursor-pointer whitespace-nowrap shrink-0 active:scale-95 ${
            activeMapMode === 'communityReports'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Users className="h-4 w-4 text-emerald-300" />
          <span>👥 Carte Collaborative Utilisateurs</span>
        </button>
      </div>

      {activeMapMode === 'worldTemperature' ? (
        <WorldAverageTemperatureMap
          onBackToRadar={() => setActiveMapMode('radar')}
          seniorMode={seniorMode}
        />
      ) : activeMapMode === 'communityReports' ? (
        <CommunityWeatherMap
          currentStation={currentStation}
          seniorMode={seniorMode}
        />
      ) : (
        <>
      {/* Top Banner - In Simplified Mode: ONLY the search button. In Normal Mode: full banner (without mobile logos next to search) */}
      {simplifiedMode ? (
        <div className="flex items-center justify-between gap-3 p-1">
          <button
            onClick={onOpenSearchModal}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black px-6 py-3.5 text-sm shadow-lg shadow-cyan-600/30 transition active:scale-95 cursor-pointer"
          >
            <MapPin className="h-4 w-4" />
            <span>Recherche commune, ville ou pays...</span>
          </button>
        </div>
      ) : (
        <div className="rounded-[24px] sm:rounded-3xl border border-slate-800/90 bg-[#0c1424]/95 sm:bg-gradient-to-br sm:from-slate-900 sm:via-blue-950/40 sm:to-slate-900 p-3.5 sm:p-8 shadow-xl backdrop-blur relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-cyan-600/10 blur-3xl pointer-events-none"></div>
          
          {/* Mobile-Only Header Bar: logos removed next to search */}
          <div className="sm:hidden flex items-center justify-end">
            <button
              onClick={onOpenSearchModal}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black px-4 py-2.5 text-xs shadow-md shadow-cyan-600/20 active:scale-95 transition cursor-pointer"
            >
              <MapPin className="h-3.5 w-3.5" />
              <span>Recherche commune</span>
            </button>
          </div>

          {/* Desktop / Tablet Header */}
          <div className="hidden sm:block relative z-10">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-cyan-400 text-xs font-black uppercase tracking-wider mb-2">
                  <Radio className="h-4 w-4 text-cyan-400 animate-pulse" />
                  <span>Cartographie OpenStreetMap &amp; Données Météo Publiques Réseau ARAMIS</span>
                </div>
                <h2 className={`font-black text-white ${seniorMode ? 'text-3xl' : 'text-2xl sm:text-3xl'}`}>
                  Radar Météorologique &amp; Surveillance Feux de Forêt
                </h2>
                <p className="text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
                  Précipitations, orages, vent et détection satellitaire des départs de feux en temps réel avec analyse approfondie dans un rayon de 10 km autour de votre localisation.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={onOpenSearchModal}
                  className="flex items-center gap-2 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black px-5 py-3 text-xs shadow-lg shadow-cyan-600/30 transition active:scale-95 cursor-pointer"
                >
                  <MapPin className="h-4 w-4" />
                  <span>Centrer sur une Ville ou un Pays...</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 1. Main Interactive Precision Radar Map Component */}
      <PrecisionRadarMap
        currentStation={currentStation}
        weather={weather}
        onSelectStation={onSelectStation}
        seniorMode={seniorMode}
        simplifiedMode={simplifiedMode}
        onOpenSearchModal={onOpenSearchModal}
      />

      {/* Interactive Toggle Buttons for Storm and Fire Blocks */}
      {!simplifiedMode && (
        <div className="flex flex-wrap items-center justify-center gap-4 py-2">
          <button
            id="radar-toggle-storm-btn"
            onClick={() => setActiveSubBlock(activeSubBlock === 'storm' ? null : 'storm')}
            className={`flex items-center gap-2.5 px-6 py-3.5 rounded-2xl font-black text-sm transition active:scale-95 shadow-xl border cursor-pointer ${
              activeSubBlock === 'storm'
                ? 'bg-amber-500 text-slate-950 border-amber-300 ring-4 ring-amber-500/30 shadow-amber-500/20'
                : 'bg-slate-900/90 text-amber-300 border-amber-500/40 hover:bg-slate-800 hover:border-amber-400'
            }`}
          >
            <Zap className="h-5 w-5 fill-amber-400" />
            <span>⚡ Estimation du Risque d'Orage &amp; Évolution Horaire</span>
          </button>

          <button
            id="radar-toggle-fire-btn"
            onClick={() => setActiveSubBlock(activeSubBlock === 'fire' ? null : 'fire')}
            className={`flex items-center gap-2.5 px-6 py-3.5 rounded-2xl font-black text-sm transition active:scale-95 shadow-xl border cursor-pointer ${
              activeSubBlock === 'fire'
                ? 'bg-orange-600 text-white border-orange-400 ring-4 ring-orange-500/30 shadow-orange-600/20'
                : 'bg-slate-900/90 text-orange-400 border-orange-500/40 hover:bg-slate-800 hover:border-orange-400'
            }`}
          >
            <Flame className="h-5 w-5 fill-orange-400" />
            <span>🔥 Radar Feux de Forêt &amp; Risque Végétation (10 km)</span>
          </button>
        </div>
      )}

      {/* 2. Analyse Convective & Modélisation des Orages Haute Définition (Appears on click Orage) */}
      {!simplifiedMode && activeSubBlock === 'storm' && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-300">
          <ThunderstormConvectiveDetailsCard
            thunderstormAnalysis={thunderstormAnalysis}
            station={currentStation}
            seniorMode={seniorMode}
          />
        </div>
      )}

      {/* 3. Feux de Forêt & Départs d'Incendies dans un rayon de 10 km (Appears on click Feu) */}
      {!simplifiedMode && activeSubBlock === 'fire' && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-300">
          <FireProximityRadarCard
            station={currentStation}
            weather={weather}
            hourly={hourly}
            daily={daily}
            seniorMode={seniorMode}
          />
        </div>
      )}

      {/* 4. Meteorological & Radar Guide */}
      {!simplifiedMode && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {/* Card 1: Windy Radar Precision */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl backdrop-blur flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
                <CloudRain className="h-4 w-4" />
                <span>Réseau Radar Doppler ARAMIS</span>
              </div>
              <h3 className="font-bold text-white text-base mb-2">Précipitations Réelles</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Données radar temps réel croisées avec les mailles AROME 1.3 km et ECMWF pour éliminer les faux échos et garantir une concordance physique absolue avec le terrain.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-cyan-300 font-semibold flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Mise à jour en continu 24h/24</span>
            </div>
          </div>

          {/* Card 2: 10 KM Fire Radar */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl backdrop-blur flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-orange-400 text-xs font-bold uppercase tracking-wider mb-2">
                <Flame className="h-4 w-4" />
                <span>Surveillance 10 km</span>
              </div>
              <h3 className="font-bold text-white text-base mb-2">Détection Incendies</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Surveillance satellitaire infrarouge thermique (MODIS / VIIRS) et calcul de l'Indice Météo Forêt (FWI) pour alerter immédiatement sur les départs de feux rapprochés.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-orange-300 font-semibold flex items-center gap-1">
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>Consignes de sécurité SDIS intégrées</span>
            </div>
          </div>

          {/* Card 3: Wind Particle Streams */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl backdrop-blur flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-teal-400 text-xs font-bold uppercase tracking-wider mb-2">
                <Wind className="h-4 w-4" />
                <span>Champs de Vent</span>
              </div>
              <h3 className="font-bold text-white text-base mb-2">Flux &amp; Propagation</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Animation particulaire des courants de vent pour anticiper la trajectoire des panaches de fumée et la progression des lignes d'averses ou de grains orageux.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-teal-300 font-semibold flex items-center gap-1">
              <Compass className="h-3.5 w-3.5" />
              <span>Vitesse, rafales et direction</span>
            </div>
          </div>

          {/* Card 4: Convective Storm Cells */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl backdrop-blur flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
                <Zap className="h-4 w-4" />
                <span>Orages &amp; Foudre</span>
              </div>
              <h3 className="font-bold text-white text-base mb-2">Activité Électrique</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Détection des impacts d'éclairs et modélisation de l'instabilité (CAPE) pour repérer les cellules orageuses virulentes et les risques de grêle associés.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-amber-300 font-semibold flex items-center gap-1">
              <Radio className="h-3.5 w-3.5" />
              <span>Traçage en temps réel des impacts</span>
            </div>
          </div>
        </div>
      )}
      </>
      )}

      {/* 4. Bottom Section: See other map button */}
      <div className="rounded-3xl border border-slate-800/90 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-4 sm:p-6 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
              <Globe2 className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-base font-black text-white">Cartes Thématiques Complémentaires</h4>
              <p className="text-xs text-slate-400">
                Explorez les cartes synoptiques mondiales, régionales, d'altitude ou les vigilances routières.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            <button
              id="radar-bottom-see-other-map-btn"
              onClick={() => setShowOtherMapsModal(!showOtherMapsModal)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-slate-950 font-black px-6 py-3.5 text-sm shadow-xl shadow-cyan-600/30 transition active:scale-95 cursor-pointer"
            >
              <Layers className="h-4 w-4" />
              <span>{showOtherMapsModal ? 'Masquer les cartes' : '🗺️ Voir autre carte'}</span>
            </button>

            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center justify-center gap-1.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white px-4 py-3.5 text-xs font-bold transition active:scale-95 cursor-pointer"
              title="Remonter en haut de la page radar"
            >
              <span>🔝 Haut de page</span>
            </button>
          </div>
        </div>

        {/* Collapsible / Expandable Grid of Available Other Maps */}
        {showOtherMapsModal && (
          <div className="mt-6 pt-5 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 animate-in fade-in duration-200">
            <button
              id="btn-show-world-temp-map"
              onClick={() => {
                setActiveMapMode('worldTemperature');
                setShowOtherMapsModal(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex flex-col text-left p-4 rounded-2xl bg-gradient-to-b from-amber-950/40 to-slate-900 hover:bg-slate-850 border border-amber-500/40 hover:border-amber-400 transition group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xl">🌡️</span>
                <span className="text-[10px] font-black uppercase text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-800/60">
                  OpenStreetMap
                </span>
              </div>
              <div className="font-black text-sm text-white group-hover:text-amber-300 transition">
                Températures Moyennes Mondiales
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Normales climatiques annuelles par pays &amp; records absolus.
              </div>
            </button>

            <button
              id="btn-show-community-map"
              onClick={() => {
                setActiveMapMode('communityReports');
                setShowOtherMapsModal(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex flex-col text-left p-4 rounded-2xl bg-gradient-to-b from-emerald-950/40 to-slate-900 hover:bg-slate-850 border border-emerald-500/40 hover:border-emerald-400 transition group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xl">👥</span>
                <span className="text-[10px] font-black uppercase text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/60">
                  Direct Citoyen
                </span>
              </div>
              <div className="font-black text-sm text-white group-hover:text-emerald-300 transition">
                Carte Collaborative Utilisateurs
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Observations constatées par les utilisateurs (+150 pts par signalement).
              </div>
            </button>

            <button
              onClick={() => {
                setActiveMapMode('radar');
                setShowOtherMapsModal(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex flex-col text-left p-4 rounded-2xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-blue-500/50 transition group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xl">🌧️</span>
                <span className="text-[10px] font-black uppercase text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded-full border border-blue-800/60">
                  Radar HD
                </span>
              </div>
              <div className="font-black text-sm text-white group-hover:text-blue-300 transition">
                Radar Précipitations ARAMIS
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Pluie, neige, grêle et suivi des foyers orageux en temps réel.
              </div>
            </button>

            <button
              onClick={() => onNavigateTab ? onNavigateTab('sportsActivities') : window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex flex-col text-left p-4 rounded-2xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500/50 transition group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xl">🚗</span>
                <span className="text-[10px] font-black uppercase text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded-full border border-indigo-800/60">
                  Itinéraire
                </span>
              </div>
              <div className="font-black text-sm text-white group-hover:text-indigo-300 transition">
                Carte Routes &amp; Déplacements
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Calculateur météo routier d'autoroutes, vent traversier et intempéries.
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
