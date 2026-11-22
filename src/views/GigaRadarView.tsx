import React, { useState } from 'react';
import { LocationPoint, CurrentWeather, HourlyForecast, DailyForecast } from '../types/weather';
import { GigaRadarMap } from '../components/GigaRadarMap';
import { 
  CloudRain, 
  Globe2, 
  Layers, 
  MapPin, 
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
  const [showOtherMapsModal, setShowOtherMapsModal] = useState<boolean>(false);

  return (
    <div id="giga-radar-view" className="space-y-2.5">
      {/* Top Map Mode Switcher & Station Action Ribbon */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 p-2 rounded-xl bg-[#0F172A] border border-slate-800">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveMapMode('radar')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold text-xs sm:text-sm transition cursor-pointer whitespace-nowrap shrink-0 ${
              activeMapMode === 'radar'
                ? 'bg-[#0284C7] text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <CloudRain className="h-4 w-4" />
            <span>Radar &amp; Modèles HD</span>
          </button>

          <button
            id="radar-tab-world-temperatures"
            onClick={() => setActiveMapMode('worldTemperature')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold text-xs sm:text-sm transition cursor-pointer whitespace-nowrap shrink-0 ${
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
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold text-xs sm:text-sm transition cursor-pointer whitespace-nowrap shrink-0 ${
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
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold text-xs sm:text-sm transition cursor-pointer whitespace-nowrap shrink-0 ${
              activeMapMode === 'thematic'
                ? 'bg-[#0284C7] text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>Cartes Thématiques</span>
          </button>
        </div>

        <div className="flex items-center justify-between lg:justify-end gap-2 px-1 shrink-0">
          <span className="text-xs text-slate-400 hidden xl:inline truncate max-w-[220px]">
            Station : <strong className="text-slate-200">{currentStation.name}</strong>
          </span>
          <button
            onClick={onOpenSearchModal}
            className="flex items-center justify-center gap-2 rounded-lg bg-[#0284C7] hover:bg-[#0369a1] text-white font-semibold px-3.5 py-2 text-xs transition cursor-pointer whitespace-nowrap shrink-0"
          >
            <MapPin className="h-3.5 w-3.5" />
            <span>Changer de commune</span>
          </button>
        </div>
      </div>

      {activeMapMode === 'worldTemperature' ? (
        <WorldAverageTemperatureMap
          onBackToRadar={() => setActiveMapMode('radar')}
          seniorMode={seniorMode}
          currentStation={currentStation}
          weather={weather}
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
      {/* 1. Main Interactive High-Performance Radar Map Component (Full-Screen Viewport Fit) */}
      <GigaRadarMap
        currentStation={currentStation}
        onSelectStation={onSelectStation}
        seniorMode={seniorMode}
        onOpenSearchModal={onOpenSearchModal}
        weather={weather}
        fullScreenLayout={true}
      />
      </>
      )}

      {/* Bottom Section: Cartes Thématiques Complémentaires */}
      <div className="rounded-xl border border-slate-800 bg-[#0F172A] p-3 sm:p-3.5">
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
                onClick={() => { window.location.href = '/skymap'; }}
                className="flex flex-col text-left p-3.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 transition group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg">🗺️</span>
                  <span className="text-[10px] font-semibold text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                    SkyMap 3D
                  </span>
                </div>
                <div className="font-bold text-xs text-white group-hover:text-sky-400 transition">
                  Carte 3D &amp; Trajets
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Itinéraires pas à pas, relief 3D, trafic et météo routière en direct.
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
