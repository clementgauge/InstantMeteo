import React, { useState } from 'react';
import { LocationPoint, CurrentWeather, HourlyForecast, DailyForecast } from '../types/weather';
import { GigaRadarMap } from '../components/GigaRadarMap';
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
import { ThematicMapsSuite, ThematicMapType } from '../components/ThematicMapsSuite';

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
  initialMapMode?: 'radar' | 'worldTemperature' | 'communityReports' | 'thematic';
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
  const [activeMapMode, setActiveMapMode] = useState<'radar' | 'worldTemperature' | 'communityReports' | 'thematic'>(initialMapMode);
  const [thematicType, setThematicType] = useState<ThematicMapType>('airQuality');
  const [activeSubBlock, setActiveSubBlock] = useState<'storm' | 'fire' | null>(null);
  const [showOtherMapsModal, setShowOtherMapsModal] = useState<boolean>(false);

  const thunderstormAnalysis = React.useMemo(() => {
    return calculateThunderstormAnalysis(currentStation, weather, hourly);
  }, [currentStation, weather, hourly]);

  return (
    <div id="giga-radar-view" className="space-y-4">
      {/* Top Map Mode Switcher */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-[#0F172A] border border-slate-800 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveMapMode('radar')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-md font-semibold text-xs sm:text-sm transition cursor-pointer whitespace-nowrap shrink-0 ${
            activeMapMode === 'radar'
              ? 'bg-[#0284C7] text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <CloudRain className="h-4 w-4" />
          <span>Radar Précipitations &amp; Vents HD</span>
        </button>

        <button
          id="radar-tab-world-temperatures"
          onClick={() => setActiveMapMode('worldTemperature')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-md font-semibold text-xs sm:text-sm transition cursor-pointer whitespace-nowrap shrink-0 ${
            activeMapMode === 'worldTemperature'
              ? 'bg-[#0284C7] text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Thermometer className="h-4 w-4" />
          <span>Températures Moyennes Mondiales</span>
        </button>

        <button
          id="radar-tab-community-reports"
          onClick={() => setActiveMapMode('communityReports')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-md font-semibold text-xs sm:text-sm transition cursor-pointer whitespace-nowrap shrink-0 ${
            activeMapMode === 'communityReports'
              ? 'bg-[#0284C7] text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Carte Collaborative Terrain</span>
        </button>

        <button
          id="radar-tab-thematic-maps"
          onClick={() => {
            setActiveMapMode('thematic');
            setThematicType('airQuality');
          }}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-md font-semibold text-xs sm:text-sm transition cursor-pointer whitespace-nowrap shrink-0 ${
            activeMapMode === 'thematic'
              ? 'bg-[#0284C7] text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Cartes Thématiques (OSM)</span>
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
      ) : activeMapMode === 'thematic' ? (
        <ThematicMapsSuite
          initialType={thematicType}
          currentStation={currentStation}
          seniorMode={seniorMode}
          onClose={() => setActiveMapMode('radar')}
        />
      ) : (
        <>
      {/* Top Banner - In Simplified Mode: ONLY the search button. In Normal Mode: clean structured header */}
      {simplifiedMode ? (
        <div className="flex items-center justify-between gap-3 p-1">
          <button
            onClick={onOpenSearchModal}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-[#0284C7] hover:bg-[#0369a1] text-white font-semibold px-4 py-2.5 text-xs transition cursor-pointer"
          >
            <MapPin className="h-3.5 w-3.5" />
            <span>Rechercher une commune, ville ou station...</span>
          </button>
        </div>
      ) : (
        <div className="rounded-lg border border-slate-800 bg-[#0F172A] p-4 sm:p-5">
          {/* Mobile Search Button */}
          <div className="sm:hidden flex items-center justify-end">
            <button
              onClick={onOpenSearchModal}
              className="w-full flex items-center justify-center gap-2 rounded-md bg-[#0284C7] hover:bg-[#0369a1] text-white font-semibold px-3 py-2 text-xs transition cursor-pointer"
            >
              <MapPin className="h-3.5 w-3.5" />
              <span>Changer de commune</span>
            </button>
          </div>

          {/* Desktop / Tablet Header */}
          <div className="hidden sm:block">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-[#0284C7] text-xs font-bold uppercase tracking-wider mb-1">
                  <Radio className="h-3.5 w-3.5 text-[#0284C7]" />
                  <span>Réseau ARAMIS &amp; Cartographie OpenStreetMap</span>
                </div>
                <h2 className={`font-bold text-white ${seniorMode ? 'text-2xl' : 'text-xl'}`}>
                  Radar Météorologique &amp; Détection des Précipitations
                </h2>
                <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
                  Échos de précipitations, détection Doppler et surveillance du risque d'incendie autour de votre commune.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenSearchModal}
                  className="flex items-center gap-2 rounded-md bg-[#0284C7] hover:bg-[#0369a1] text-white font-semibold px-4 py-2 text-xs transition cursor-pointer"
                >
                  <MapPin className="h-3.5 w-3.5" />
                  <span>Changer de commune...</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 1. Main Interactive High-Performance Radar Map Component */}
      <GigaRadarMap
        currentStation={currentStation}
        onSelectStation={onSelectStation}
        seniorMode={seniorMode}
        onOpenSearchModal={onOpenSearchModal}
      />

      {/* Interactive Toggle Buttons for Storm and Fire Blocks */}
      {!simplifiedMode && (
        <div className="flex flex-wrap items-center justify-center gap-3 py-1">
          <button
            id="radar-toggle-storm-btn"
            onClick={() => setActiveSubBlock(activeSubBlock === 'storm' ? null : 'storm')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-semibold text-xs sm:text-sm transition border cursor-pointer ${
              activeSubBlock === 'storm'
                ? 'bg-amber-600 text-white border-amber-500'
                : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
            }`}
          >
            <Zap className="h-4 w-4 text-amber-400" />
            <span>Risque d'Orage &amp; Évolution Convective</span>
          </button>

          <button
            id="radar-toggle-fire-btn"
            onClick={() => setActiveSubBlock(activeSubBlock === 'fire' ? null : 'fire')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-semibold text-xs sm:text-sm transition border cursor-pointer ${
              activeSubBlock === 'fire'
                ? 'bg-orange-600 text-white border-orange-500'
                : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
            }`}
          >
            <Flame className="h-4 w-4 text-orange-400" />
            <span>Indice Risque Feux de Forêt (10 km)</span>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Card 1: RainViewer Radar Precision */}
          <div className="rounded-lg border border-slate-800 bg-[#0F172A] p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-[#0284C7] text-xs font-bold uppercase tracking-wider mb-2">
                <CloudRain className="h-3.5 w-3.5" />
                <span>Réseau Radar Doppler ARAMIS</span>
              </div>
              <h3 className="font-bold text-white text-sm mb-1.5">Précipitations Réelles</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Données radar temps réel croisées avec les mailles AROME 1.3 km et ECMWF pour éliminer les faux échos et garantir une concordance physique absolue avec le terrain.
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-800 text-[11px] text-slate-400 font-medium">
              Mise à jour en continu 24h/24
            </div>
          </div>

          {/* Card 2: 10 KM Fire Radar */}
          <div className="rounded-lg border border-slate-800 bg-[#0F172A] p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-orange-400 text-xs font-bold uppercase tracking-wider mb-2">
                <Flame className="h-3.5 w-3.5" />
                <span>Surveillance 10 km</span>
              </div>
              <h3 className="font-bold text-white text-sm mb-1.5">Détection Incendies</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Surveillance satellitaire thermique et calcul de l'Indice Forêt Météo pour évaluer la sécheresse de surface et le risque de départ de feu.
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-800 text-[11px] text-slate-400 font-medium">
              Consignes de sécurité SDIS intégrées
            </div>
          </div>

          {/* Card 3: Wind Particle Streams */}
          <div className="rounded-lg border border-slate-800 bg-[#0F172A] p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-teal-400 text-xs font-bold uppercase tracking-wider mb-2">
                <Wind className="h-3.5 w-3.5" />
                <span>Champs de Vent</span>
              </div>
              <h3 className="font-bold text-white text-sm mb-1.5">Flux &amp; Propagation</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Visualisation des vecteurs de vent pour anticiper le déplacement des lignes de grains et la progression des masses d'air.
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-800 text-[11px] text-slate-400 font-medium">
              Vitesse, rafales et direction
            </div>
          </div>

          {/* Card 4: Convective Storm Cells */}
          <div className="rounded-lg border border-slate-800 bg-[#0F172A] p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
                <Zap className="h-3.5 w-3.5" />
                <span>Orages &amp; Foudre</span>
              </div>
              <h3 className="font-bold text-white text-sm mb-1.5">Activité Électrique</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Détection des impacts d'éclairs et modélisation de l'instabilité (CAPE) pour repérer les cellules orageuses virulentes.
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-800 text-[11px] text-slate-400 font-medium">
              Traçage des impacts réseau Météorage
            </div>
          </div>
        </div>
      )}
      </>
      )}

      {/* 4. Bottom Section: See other map button */}
      <div className="rounded-lg border border-slate-800 bg-[#0F172A] p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-800 text-[#0284C7] border border-slate-700">
              <Globe2 className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Cartes Thématiques Complémentaires</h4>
              <p className="text-xs text-slate-400">
                Consultez la qualité de l'air ATMO, les indices UV, les isobares ou la température de la mer.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              id="radar-bottom-see-other-map-btn"
              onClick={() => setShowOtherMapsModal(!showOtherMapsModal)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-md bg-[#0284C7] hover:bg-[#0369a1] text-white font-semibold px-4 py-2 text-xs transition cursor-pointer"
            >
              <Layers className="h-3.5 w-3.5" />
              <span>{showOtherMapsModal ? 'Masquer les cartes' : 'Explorer les autres cartes'}</span>
            </button>

            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center justify-center gap-1.5 rounded-md bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-2 text-xs font-semibold transition cursor-pointer"
              title="Remonter en haut de la page radar"
            >
              <span>Haut de page</span>
            </button>
          </div>
        </div>

        {/* Collapsible / Expandable Grid of Available Other Maps */}
        {showOtherMapsModal && (
          <div className="mt-6 pt-5 border-t border-slate-800 space-y-4 animate-in fade-in duration-200">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Layers className="h-4 w-4 text-cyan-400" />
              <span>Les 6 Nouvelles Cartes Thématiques Spécialisées (OpenStreetMap &amp; Copernicus)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* 1. Qualité de l'air ATMO */}
              <button
                id="btn-thematic-air-quality"
                onClick={() => {
                  setActiveMapMode('thematic');
                  setThematicType('airQuality');
                  setShowOtherMapsModal(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex flex-col text-left p-3.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 transition group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg">🍃</span>
                  <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800/80">
                    ATMO &amp; Copernicus
                  </span>
                </div>
                <div className="font-bold text-xs text-white group-hover:text-emerald-400 transition">
                  Qualité de l'Air &amp; Polluants
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Indice ATMO en direct, PM2.5, PM10, Ozone O3, NO2 et seuils sanitaires.
                </div>
              </button>

              {/* 2. Indice UV et risque solaire */}
              <button
                id="btn-thematic-uv-index"
                onClick={() => {
                  setActiveMapMode('thematic');
                  setThematicType('uvIndex');
                  setShowOtherMapsModal(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex flex-col text-left p-3.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 transition group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg">☀️</span>
                  <span className="text-[10px] font-semibold text-amber-400 bg-amber-950 px-1.5 py-0.5 rounded border border-amber-800/80">
                    Norme OMS UV
                  </span>
                </div>
                <div className="font-bold text-xs text-white group-hover:text-amber-400 transition">
                  Indice UV &amp; Risque Solaire
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Niveau maximum quotidien d'UV et conseils de protection solaire.
                </div>
              </button>

              {/* 3. Carte des risques d'incendie */}
              <button
                id="btn-thematic-fire-risk"
                onClick={() => {
                  setActiveMapMode('thematic');
                  setThematicType('fireRisk');
                  setShowOtherMapsModal(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex flex-col text-left p-3.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 transition group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg">🔥</span>
                  <span className="text-[10px] font-semibold text-orange-400 bg-orange-950 px-1.5 py-0.5 rounded border border-orange-800/80">
                    EFFIS / IFM
                  </span>
                </div>
                <div className="font-bold text-xs text-white group-hover:text-orange-400 transition">
                  Risques d'Incendie &amp; Forêts
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Indice Forêt Météo (IFM), sécheresse des sols et vent asséchant.
                </div>
              </button>

              {/* 4. Vigilance Orages & Foudre */}
              <button
                id="btn-thematic-storms"
                onClick={() => {
                  setActiveMapMode('thematic');
                  setThematicType('stormsLightning');
                  setShowOtherMapsModal(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex flex-col text-left p-3.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 transition group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg">⚡</span>
                  <span className="text-[10px] font-semibold text-purple-400 bg-purple-950 px-1.5 py-0.5 rounded border border-purple-800/80">
                    Foudre &amp; CAPE
                  </span>
                </div>
                <div className="font-bold text-xs text-white group-hover:text-purple-400 transition">
                  Vigilance Orages &amp; Foudre
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Densité convective, énergie CAPE en J/kg et impacts d'éclairs.
                </div>
              </button>

              {/* 5. Pression atmosphérique & Isobares */}
              <button
                id="btn-thematic-pressure"
                onClick={() => {
                  setActiveMapMode('thematic');
                  setThematicType('pressureIsobars');
                  setShowOtherMapsModal(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex flex-col text-left p-3.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 transition group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg">⏱️</span>
                  <span className="text-[10px] font-semibold text-cyan-400 bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-800/80">
                    Synoptique ARPEGE
                  </span>
                </div>
                <div className="font-bold text-xs text-white group-hover:text-cyan-400 transition">
                  Pression &amp; Isobares
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Centres d'action Dépression (D) / Anticyclone (A) et baromètres.
                </div>
              </button>

              {/* 6. Température Mer & Côtes */}
              <button
                id="btn-thematic-sea-temp"
                onClick={() => {
                  setActiveMapMode('thematic');
                  setThematicType('seaTemperature');
                  setShowOtherMapsModal(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex flex-col text-left p-3.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 transition group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg">🌊</span>
                  <span className="text-[10px] font-semibold text-blue-400 bg-blue-950 px-1.5 py-0.5 rounded border border-blue-800/80">
                    Copernicus Marine
                  </span>
                </div>
                <div className="font-bold text-xs text-white group-hover:text-blue-400 transition">
                  Température Mer &amp; Côtes
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Température de surface de la mer (SST) et état des bassins maritimes.
                </div>
              </button>
            </div>

            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 pt-3 border-t border-slate-800 flex items-center gap-2">
              <Globe2 className="h-4 w-4 text-[#0284C7]" />
              <span>Autres Cartes Synoptiques &amp; Collaboratives</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <button
                id="btn-show-world-temp-map"
                onClick={() => {
                  setActiveMapMode('worldTemperature');
                  setShowOtherMapsModal(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex flex-col text-left p-3.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 transition group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg">🌡️</span>
                  <span className="text-[10px] font-semibold text-amber-400 bg-amber-950 px-1.5 py-0.5 rounded border border-amber-800/80">
                    OpenStreetMap
                  </span>
                </div>
                <div className="font-bold text-xs text-white group-hover:text-amber-400 transition">
                  Températures Mondiales
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
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
                className="flex flex-col text-left p-3.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 transition group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg">👥</span>
                  <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800/80">
                    Terrain Citoyen
                  </span>
                </div>
                <div className="font-bold text-xs text-white group-hover:text-emerald-400 transition">
                  Carte Collaborative
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Observations constatées par les utilisateurs du réseau.
                </div>
              </button>

              <button
                onClick={() => {
                  setActiveMapMode('radar');
                  setShowOtherMapsModal(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex flex-col text-left p-3.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 transition group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg">🌧️</span>
                  <span className="text-[10px] font-semibold text-[#0284C7] bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                    Radar HD
                  </span>
                </div>
                <div className="font-bold text-xs text-white group-hover:text-[#0284C7] transition">
                  Radar ARAMIS
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Pluie, neige, grêle et suivi des foyers orageux en temps réel.
                </div>
              </button>

              <button
                onClick={() => onNavigateTab ? onNavigateTab('sportsActivities') : window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="flex flex-col text-left p-3.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 transition group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg">🚗</span>
                  <span className="text-[10px] font-semibold text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                    Itinéraire
                  </span>
                </div>
                <div className="font-bold text-xs text-white group-hover:text-sky-400 transition">
                  Carte Routes
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Calculateur météo routier d'autoroutes et vent traversier.
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
