import React, { useState } from 'react';
import { LocationPoint, CurrentWeather, HourlyForecast, DailyForecast } from '../types/weather';
import { PrecisionRadarMap } from '../components/PrecisionRadarMap';
import { FireProximityRadarCard } from '../components/FireProximityRadarCard';
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
  CheckCircle2
} from 'lucide-react';

interface GigaRadarViewProps {
  currentStation: LocationPoint;
  onSelectStation: (station: LocationPoint) => void;
  weather: CurrentWeather;
  hourly?: HourlyForecast[];
  daily?: DailyForecast[];
  seniorMode: boolean;
  onOpenSearchModal: () => void;
}

export const GigaRadarView: React.FC<GigaRadarViewProps> = ({
  currentStation,
  onSelectStation,
  weather,
  hourly = [],
  daily = [],
  seniorMode,
  onOpenSearchModal
}) => {
  const [selectedPresetMode, setSelectedPresetMode] = useState<string>('france-national');

  const radarTerritoryPresets = [
    { id: 'france-national', label: '🇫🇷 France Entière', lat: 46.6033, lon: 1.8883, zoom: 6, stationId: 'paris-montsouris' },
    { id: 'world-global', label: '🌍 Monde Entier (Global)', lat: 25.0, lon: 10.0, zoom: 3, stationId: 'paris-montsouris' },
    { id: 'europe-cont', label: '🇪🇺 Europe Continentale', lat: 48.5, lon: 10.0, zoom: 5, stationId: 'paris-montsouris' },
    { id: 'spain-pt', label: '🇪🇸 Espagne & Portugal', lat: 40.4168, lon: -3.7038, zoom: 6, stationId: 'madrid-spain' },
    { id: 'italy-med', label: '🇮🇹 Italie & Méditerranée', lat: 41.8719, lon: 12.5674, zoom: 6, stationId: 'rome-italy' },
    { id: 'germany-cent', label: '🇩🇪 Allemagne & Europe Centrale', lat: 51.1657, lon: 10.4515, zoom: 6, stationId: 'berlin-germany' },
    { id: 'uk-irl', label: '🇬🇧 Royaume-Uni & Irlande', lat: 54.5, lon: -2.5, zoom: 6, stationId: 'london-uk' },
    { id: 'swiss-alps', label: '🇨🇭 Suisse & Alpes', lat: 46.8182, lon: 8.2275, zoom: 8, stationId: 'geneva-switzerland' },
    { id: 'benelux', label: '🇧🇪 Belgique & Pays-Bas', lat: 50.8503, lon: 4.3517, zoom: 8, stationId: 'brussels-belgium' },
    { id: 'usa-north', label: '🇺🇸 États-Unis', lat: 39.8283, lon: -98.5795, zoom: 4, stationId: 'new-york-usa' },
    { id: 'canada-zone', label: '🇨🇦 Canada', lat: 56.1304, lon: -106.3468, zoom: 4, stationId: 'montreal-canada' },
    { id: 'japan-asia', label: '🇯🇵 Japon & Asie', lat: 36.2048, lon: 138.2529, zoom: 5, stationId: 'tokyo-japan' },
    { id: 'morocco-mag', label: '🇲🇦 Maroc & Maghreb', lat: 31.7917, lon: -7.0926, zoom: 6, stationId: 'casablanca-morocco' },
    { id: 'brazil-sa', label: '🇧🇷 Brésil & Am. Sud', lat: -14.235, lon: -51.9253, zoom: 4, stationId: 'rio-de-janeiro' },
    { id: 'australia-oc', label: '🇦🇺 Australie', lat: -25.2744, lon: 133.7751, zoom: 4, stationId: 'sydney-australia' },
    { id: 'nord-idf', label: '🗼 Bassin Parisien', lat: 49.2, lon: 2.5, zoom: 8, stationId: 'paris-montsouris' },
    { id: 'ouest-atlantique', label: '🌊 Façade Atlantique', lat: 47.8, lon: -2.5, zoom: 8, stationId: 'brest-guipavas' },
    { id: 'sud-est-med', label: '☀️ Arc Méditerranéen & PACA', lat: 43.5, lon: 5.5, zoom: 8, stationId: 'marseille-marignane' },
    { id: 'sud-ouest', label: '🍷 Sud-Ouest & Aquitaine', lat: 44.5, lon: 0.2, zoom: 8, stationId: 'bordeaux-merignac' },
    { id: 'rhone-alpes', label: '🏔️ Rhône-Alpes & Alpes', lat: 45.5, lon: 5.8, zoom: 8, stationId: 'lyon-bron' },
    { id: 'grand-est', label: '🏰 Grand Est & Vosges', lat: 48.6, lon: 6.8, zoom: 8, stationId: 'strasbourg-entzheim' },
    { id: 'outre-mer', label: '🌴 Outre-Mer (La Réunion / Antilles)', lat: -21.1, lon: 55.5, zoom: 9, stationId: 'reunion-saint-denis' }
  ];

  const quickStations = [
    FRENCH_STATIONS[0], // Paris
    FRENCH_STATIONS[1], // Marseille
    FRENCH_STATIONS[2], // Lyon
    FRENCH_STATIONS[3], // Nice
    FRENCH_STATIONS[4], // Chamonix Aiguille du Midi (3842m)
    FRENCH_STATIONS[9], // Brest
    FRENCH_STATIONS[12], // Strasbourg
    FRENCH_STATIONS[14], // Biarritz
    ...WORLD_STATIONS.slice(0, 14) // London, Madrid, Rome, Berlin, Geneva, Brussels, New York, Tokyo, Montreal, Sydney, Casablanca, etc.
  ];

  const handleSelectPreset = (presetId: string) => {
    setSelectedPresetMode(presetId);
    const preset = radarTerritoryPresets.find(p => p.id === presetId);
    if (preset) {
      const matchSt = [...FRENCH_STATIONS, ...WORLD_STATIONS].find(s => s.id === preset.stationId);
      if (matchSt) {
        onSelectStation({
          ...matchSt,
          isRegion: presetId !== 'france-national' && presetId !== 'world-global',
          region: preset.label
        });
      } else {
        onSelectStation({
          id: `preset-${preset.id}`,
          name: preset.label,
          department: preset.label,
          region: preset.label,
          latitude: preset.lat,
          longitude: preset.lon,
          altitude: 100,
          climateZone: 'Climat Tempéré / Océanique / Continental',
          allTimeRecordMax: 42.0,
          allTimeRecordMin: -20.0,
          allTimeRecordRain24h: 150.0,
          isRegion: true,
          isWorldLocation: true
        });
      }
    }
  };

  return (
    <div id="giga-radar-view" className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-blue-950/40 to-slate-900 p-6 sm:p-8 shadow-2xl backdrop-blur relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-cyan-600/10 blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
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

          {/* Quick jump to station */}
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

        {/* Territory & Country Quick Presets */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-bold text-slate-400 shrink-0">Pays &amp; Territoires :</span>
          {radarTerritoryPresets.map((preset) => {
            const isSelected = selectedPresetMode === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset.id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/30 ring-2 ring-white/60'
                    : 'bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>{preset.label}</span>
              </button>
            );
          })}
        </div>

        {/* Quick Stations Bar */}
        <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-[11px] font-bold text-slate-400 shrink-0">Villes &amp; Capitales :</span>
          {quickStations.map((st) => {
            const isSelected = st.id === currentStation.id;
            const isMtn = (st.altitude ?? 0) >= 800;
            return (
              <button
                key={st.id}
                onClick={() => onSelectStation(st)}
                className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1 text-xs font-bold transition cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-1 ring-white/50'
                    : 'bg-slate-950/70 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {isMtn && <Mountain className="h-3 w-3 text-amber-400" />}
                <span>{st.name.split(' ')[0]}</span>
                <span className="text-[10px] opacity-70">({st.altitude}m)</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. Main Interactive Precision Radar Map Component */}
      <PrecisionRadarMap
        currentStation={currentStation}
        weather={weather}
        onSelectStation={onSelectStation}
        seniorMode={seniorMode}
        onOpenSearchModal={onOpenSearchModal}
      />

      {/* 2. Feux de Forêt & Départs d'Incendies dans un rayon de 10 km */}
      <FireProximityRadarCard
        station={currentStation}
        weather={weather}
        hourly={hourly}
        daily={daily}
        seniorMode={seniorMode}
      />

      {/* 3. Meteorological & Radar Guide */}
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
    </div>
  );
};
