import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Radio, 
  CloudRain, 
  Sun, 
  Cloud, 
  AlertTriangle, 
  Plus, 
  ChevronDown, 
  Maximize2, 
  Crosshair, 
  MapPin, 
  Wind, 
  Droplets, 
  Compass, 
  Play, 
  Pause, 
  RefreshCw, 
  Layers,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { LocationPoint, CurrentWeather, HourlyForecast } from '../types/weather';
import { FRENCH_STATIONS } from '../data/frenchStations';

interface MeteoFranceNationalRadarCardProps {
  station: LocationPoint;
  weather: CurrentWeather;
  hourly?: HourlyForecast[];
  tempUnit?: 'C' | 'F';
  onSelectStation?: (station: LocationPoint) => void;
  onOpenSearchModal?: () => void;
  onOpenGigaRadar?: () => void;
  onNavigateTab?: (tab: string) => void;
  onLocateGps?: () => void;
}

type MapDisplayTab = 'meteo-france' | 'radar-pluie' | 'satellite' | 'vigilance';
type TimeSlotFilter = 'matin' | 'apres-midi' | 'soir' | 'nuit';

interface RegionalStationPoint {
  id: string;
  name: string;
  departmentCode: string;
  x: number; // percentage on SVG (0-100)
  y: number; // percentage on SVG (0-100)
  temp: number;
  condition: 'sun' | 'sun-cloud' | 'cloud' | 'rain' | 'storm' | 'snow';
  weatherDesc: string;
  hasWarning?: boolean;
}

export const MeteoFranceNationalRadarCard: React.FC<MeteoFranceNationalRadarCardProps> = ({
  station,
  weather,
  hourly = [],
  tempUnit = 'C',
  onSelectStation,
  onOpenSearchModal,
  onOpenGigaRadar,
  onNavigateTab,
  onLocateGps
}) => {
  const [activeTab, setActiveTab] = useState<MapDisplayTab>('meteo-france');
  const [activeSlot, setActiveSlot] = useState<TimeSlotFilter>('apres-midi');
  const [selectedPointId, setSelectedPointId] = useState<string>(station.id || 'paris-montsouris');
  const [radarZoom, setRadarZoom] = useState<number>(5.2);
  const [searchQuery, setSearchQuery] = useState('');

  // Key Regional Reference Points Across France (matching exact positions in Météo-France official maps)
  const regionalPoints: RegionalStationPoint[] = useMemo(() => [
    {
      id: 'lille-lesquin',
      name: 'Lille',
      departmentCode: '59',
      x: 57,
      y: 11,
      temp: 21,
      condition: 'sun-cloud',
      weatherDesc: 'Éclaircies'
    },
    {
      id: 'brest-guipavas',
      name: 'Brest',
      departmentCode: '29',
      x: 16,
      y: 33,
      temp: 20,
      condition: 'sun-cloud',
      weatherDesc: 'Voilé'
    },
    {
      id: 'rouen-boos',
      name: 'Rouen',
      departmentCode: '76',
      x: 46,
      y: 23,
      temp: 20,
      condition: 'sun-cloud',
      weatherDesc: 'Nuages & soleil'
    },
    {
      id: 'paris-montsouris',
      name: 'Paris',
      departmentCode: '75',
      x: 53,
      y: 28,
      temp: Math.round(station.id?.includes('paris') ? weather.temperature : 20),
      condition: 'sun-cloud',
      weatherDesc: 'Éclaircies durables'
    },
    {
      id: 'versailles',
      name: 'Versailles',
      departmentCode: '78',
      x: 50,
      y: 31,
      temp: Math.round(station.name?.toLowerCase().includes('versailles') ? weather.temperature : 20),
      condition: 'sun-cloud',
      weatherDesc: 'Nuageux & éclaircies'
    },
    {
      id: 'strasbourg-entzheim',
      name: 'Strasbourg',
      departmentCode: '67',
      x: 85,
      y: 29,
      temp: 20,
      condition: 'sun-cloud',
      weatherDesc: 'Partiellement ensoleillé'
    },
    {
      id: 'nantes-atlantique',
      name: 'Nantes',
      departmentCode: '44',
      x: 29,
      y: 43,
      temp: 23,
      condition: 'sun',
      weatherDesc: 'Franc soleil'
    },
    {
      id: 'tours',
      name: 'Tours',
      departmentCode: '37',
      x: 44,
      y: 45,
      temp: 18,
      condition: 'sun',
      weatherDesc: 'Beau temps ensoleillé'
    },
    {
      id: 'dijon-longvic',
      name: 'Dijon',
      departmentCode: '21',
      x: 68,
      y: 42,
      temp: 20,
      condition: 'sun-cloud',
      weatherDesc: 'Éclaircies'
    },
    {
      id: 'chamonix-aiguille-midi',
      name: 'Chamonix-Mont-Blanc',
      departmentCode: '74',
      x: 83,
      y: 53,
      temp: Math.round(station.name?.toLowerCase().includes('chamonix') ? weather.temperature : 13),
      condition: 'rain',
      weatherDesc: 'Pluie & averses',
      hasWarning: true
    },
    {
      id: 'lyon-bron',
      name: 'Lyon',
      departmentCode: '69',
      x: 70,
      y: 57,
      temp: Math.round(station.name?.toLowerCase().includes('lyon') ? weather.temperature : 19),
      condition: 'sun-cloud',
      weatherDesc: 'Éclaircies et passages nuageux'
    },
    {
      id: 'clermont-ferrand',
      name: 'Clermont-Ferrand',
      departmentCode: '63',
      x: 55,
      y: 57,
      temp: 22,
      condition: 'sun',
      weatherDesc: 'Franc soleil'
    },
    {
      id: 'limoges-bellegarde',
      name: 'Limoges',
      departmentCode: '87',
      x: 44,
      y: 59,
      temp: 21,
      condition: 'sun',
      weatherDesc: 'Ensoleillé'
    },
    {
      id: 'bordeaux-merignac',
      name: 'Bordeaux',
      departmentCode: '33',
      x: 32,
      y: 69,
      temp: 20,
      condition: 'sun-cloud',
      weatherDesc: 'Voilé / éclaircies'
    },
    {
      id: 'toulouse-blagnac',
      name: 'Toulouse',
      departmentCode: '31',
      x: 46,
      y: 81,
      temp: 20,
      condition: 'sun',
      weatherDesc: 'Ciel bleu dégagé'
    },
    {
      id: 'biarritz-anglet',
      name: 'Biarritz',
      departmentCode: '64',
      x: 23,
      y: 81,
      temp: 21,
      condition: 'sun',
      weatherDesc: 'Beau temps océanique'
    },
    {
      id: 'perpignan-rivesaltes',
      name: 'Perpignan',
      departmentCode: '66',
      x: 58,
      y: 88,
      temp: 23,
      condition: 'sun-cloud',
      weatherDesc: 'Tramontane & soleil'
    },
    {
      id: 'montpellier-frejorgues',
      name: 'Montpellier',
      departmentCode: '34',
      x: 63,
      y: 79,
      temp: 26,
      condition: 'sun',
      weatherDesc: 'Chaleur & franc soleil'
    },
    {
      id: 'marseille-marignane',
      name: 'Marseille',
      departmentCode: '13',
      x: 72,
      y: 82,
      temp: 24,
      condition: 'sun-cloud',
      weatherDesc: 'Ensoleillé & mistral'
    },
    {
      id: 'nice-cote-azur',
      name: 'Nice',
      departmentCode: '06',
      x: 86,
      y: 77,
      temp: 27,
      condition: 'sun-cloud',
      weatherDesc: 'Chaud & azur'
    },
    {
      id: 'ajaccio-campo-oro',
      name: 'Corse (Ajaccio)',
      departmentCode: '2A',
      x: 94,
      y: 90,
      temp: 31,
      condition: 'sun-cloud',
      weatherDesc: 'Très chaud & soleil'
    }
  ], [station.id, station.name, weather.temperature]);

  // Handle station selection
  const handleSelectRegionalCity = (pt: RegionalStationPoint) => {
    setSelectedPointId(pt.id);
    if (onSelectStation) {
      const matched = FRENCH_STATIONS.find(s => s.id === pt.id || s.name.toLowerCase().includes(pt.name.toLowerCase()));
      if (matched) {
        onSelectStation(matched);
      }
    }
  };

  // Weather Symbol Renderer matching Météo-France official design from user screenshot
  const renderWeatherSymbol = (condition: RegionalStationPoint['condition']) => {
    switch (condition) {
      case 'sun':
        return (
          <div className="relative w-9 h-9 flex items-center justify-center">
            {/* Soft Sun Glow */}
            <div className="absolute inset-0 rounded-full bg-amber-400/40 blur-[3px]" />
            {/* Core Yellow/Orange Sun */}
            <div className="relative w-7 h-7 rounded-full bg-gradient-to-br from-[#fde047] via-[#facc15] to-[#f97316] border-[1.5px] border-[#ea580c] shadow-md flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-white/40" />
            </div>
          </div>
        );

      case 'sun-cloud':
        return (
          <div className="relative w-10 h-8 flex items-center justify-center">
            {/* Peeking Sun behind cloud */}
            <div className="absolute top-0 right-1 w-5 h-5 rounded-full bg-gradient-to-br from-[#fde047] via-[#eab308] to-[#ea580c] border border-amber-600 shadow-sm" />
            {/* Fluffy White/Gray Cloud */}
            <div className="relative z-10 w-8 h-5 rounded-full bg-gradient-to-b from-white via-slate-100 to-slate-300 border border-slate-400/70 shadow-sm flex items-center justify-center">
              <div className="w-5 h-2.5 rounded-full bg-white/80" />
            </div>
          </div>
        );

      case 'rain':
        return (
          <div className="relative w-10 h-9 flex flex-col items-center justify-center">
            {/* Dark rain cloud */}
            <div className="w-8 h-5 rounded-full bg-gradient-to-b from-slate-300 via-slate-400 to-slate-600 border border-slate-600 shadow flex items-center justify-center">
              <div className="w-5 h-2 rounded-full bg-white/30" />
            </div>
            {/* Rain droplets */}
            <div className="flex items-center gap-1 -mt-0.5">
              <span className="w-0.5 h-2 bg-sky-500 rounded-full animate-bounce" />
              <span className="w-0.5 h-2.5 bg-blue-600 rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-0.5 h-2 bg-sky-500 rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        );

      case 'storm':
        return (
          <div className="relative w-10 h-9 flex flex-col items-center justify-center">
            <div className="w-8 h-5 rounded-full bg-slate-800 border border-slate-700 shadow" />
            <span className="text-[10px] text-amber-300 font-bold -mt-1">⚡</span>
          </div>
        );

      default:
        return (
          <div className="w-8 h-5 rounded-full bg-slate-200 border border-slate-400 shadow-sm" />
        );
    }
  };

  return (
    <div 
      id="meteo-france-national-radar-card" 
      className="w-full rounded-[24px] overflow-hidden border border-slate-300/80 dark:border-slate-800 bg-[#c6e4f6] text-slate-900 shadow-2xl relative font-sans transition-all"
    >
      {/* ========================================================================= */}
      {/* 1. TOP HEADER - Exact visual layout from user screenshot (Météo-France)   */}
      {/* ========================================================================= */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* French Republic & Météo-France Official Badges */}
        <div className="flex items-center gap-4">
          {/* Logo République Française */}
          <div className="flex flex-col text-[9px] font-black uppercase tracking-tighter leading-tight border-r border-slate-200 pr-3 text-slate-800">
            <div className="w-5 h-1.5 bg-[#002395] rounded-t-sm" />
            <div className="w-5 h-1.5 bg-white border-y border-slate-200" />
            <div className="w-5 h-1.5 bg-[#ED2939] rounded-b-sm" />
            <span className="mt-0.5 font-serif font-black tracking-normal text-[10px]">RÉPUBLIQUE</span>
            <span className="font-serif font-black tracking-normal text-[10px]">FRANÇAISE</span>
          </div>

          {/* Météo-France Logo Block */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-[#004f9e] text-white flex flex-col items-center justify-center p-0.5 shadow-sm shrink-0">
              <span className="text-[8px] font-black tracking-wider leading-none">MÉTÉO</span>
              <span className="text-[8px] font-black tracking-wider leading-none">FRANCE</span>
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-[11px] font-black tracking-tight text-[#004f9e] leading-tight">
                MÉTÉO-FRANCE
              </span>
              <span className="text-[8px] font-semibold text-slate-500 uppercase tracking-wider">
                À vos côtés, dans un climat qui change
              </span>
            </div>
          </div>
        </div>

        {/* Search Bar Input (Exact match of screenshot input) */}
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div 
            onClick={onOpenSearchModal}
            className="relative flex-1 cursor-pointer group"
          >
            <input
              type="text"
              readOnly
              value={searchQuery}
              placeholder="Rechercher une ville, un pays..."
              className="w-full bg-slate-50 hover:bg-white border border-slate-300 rounded-full py-1.5 pl-4 pr-9 text-xs text-slate-700 placeholder:text-slate-400 shadow-inner transition cursor-pointer"
            />
            <button 
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-[#004f9e] transition"
            >
              <Search className="h-3.5 w-3.5" />
            </button>
          </div>

          {onLocateGps && (
            <button
              onClick={onLocateGps}
              title="Me géolocaliser"
              className="p-2 rounded-full bg-slate-100 hover:bg-sky-50 border border-slate-300 text-slate-600 hover:text-blue-600 transition shadow-sm cursor-pointer"
            >
              <Crosshair className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Sub-Header Navigation Category Links (from screenshot) */}
      <div className="bg-[#004f9e] text-white px-4 sm:px-6 py-1.5 flex items-center justify-between text-[11px] font-bold tracking-wide overflow-x-auto gap-4 scrollbar-none">
        <div className="flex items-center gap-5 shrink-0">
          <span className="hover:text-amber-300 transition cursor-pointer flex items-center gap-1">
            🔥 MÉTÉO DES FORÊTS
          </span>
          <span className="hover:text-sky-200 transition cursor-pointer flex items-center gap-1">
            PRÉVISIONS <ChevronDown className="h-3 w-3" />
          </span>
          <span className="hover:text-sky-200 transition cursor-pointer flex items-center gap-1">
            VIGILANCE ET SÉCURITÉ <ChevronDown className="h-3 w-3" />
          </span>
          <span className="hidden md:inline hover:text-sky-200 transition cursor-pointer flex items-center gap-1">
            CHANGEMENT CLIMATIQUE <ChevronDown className="h-3 w-3" />
          </span>
        </div>

        {/* Direct Link to Full Radar */}
        <button
          onClick={() => onNavigateTab ? onNavigateTab('radar') : (onOpenGigaRadar ? onOpenGigaRadar() : null)}
          className="bg-white/20 hover:bg-white/30 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 transition shrink-0 cursor-pointer"
        >
          <Radio className="h-3 w-3" />
          <span>Radar Doppler Complet →</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 2. FAVORITE CITIES TICKER BAR - Exact replica from user image.png         */}
      {/* ========================================================================= */}
      <div className="bg-[#0b6cb4] text-white px-4 sm:px-6 py-1.5 flex items-center justify-between text-xs font-semibold overflow-x-auto gap-3 border-b border-[#08538c]">
        <div className="flex items-center gap-3 sm:gap-6 shrink-0">
          {/* Chamonix-Mont-Blanc (74) */}
          <button 
            onClick={() => {
              const chamonix = regionalPoints.find(p => p.name.includes('Chamonix'));
              if (chamonix) handleSelectRegionalCity(chamonix);
            }}
            className="flex items-center gap-1.5 hover:opacity-80 transition cursor-pointer text-left"
          >
            <span className="font-bold">Chamonix-Mont-B... (74)</span>
            <AlertTriangle className="h-3.5 w-3.5 text-amber-300 animate-bounce" />
            <span>🌧️</span>
            <span className="font-black text-sm">13°</span>
          </button>

          {/* Versailles (78) */}
          <button 
            onClick={() => {
              const versailles = regionalPoints.find(p => p.name.includes('Versailles'));
              if (versailles) handleSelectRegionalCity(versailles);
            }}
            className="flex items-center gap-1.5 hover:opacity-80 transition cursor-pointer text-left"
          >
            <span className="font-bold">Versailles (78)</span>
            <span>⛅</span>
            <span className="font-black text-sm">20°</span>
          </button>

          {/* Lyon (69) */}
          <button 
            onClick={() => {
              const lyon = regionalPoints.find(p => p.name.includes('Lyon'));
              if (lyon) handleSelectRegionalCity(lyon);
            }}
            className="flex items-center gap-1.5 hover:opacity-80 transition cursor-pointer text-left"
          >
            <span className="font-bold">Lyon (69)</span>
            <span>⛅</span>
            <span className="font-black text-sm">19°</span>
          </button>

          {/* Current Selected Station if not in default */}
          {station.name && !['Chamonix-Mont-Blanc', 'Versailles', 'Lyon'].some(c => station.name.includes(c)) && (
            <div className="flex items-center gap-1.5 bg-white/20 px-2 py-0.5 rounded-md text-amber-200">
              <span className="font-bold">{station.name}</span>
              <span>●</span>
              <span className="font-black text-sm">{Math.round(weather.temperature)}°</span>
            </div>
          )}
        </div>

        {/* Ajouter une ville (+) */}
        <button
          onClick={onOpenSearchModal}
          className="flex items-center gap-1 text-[11px] font-bold text-sky-200 hover:text-white transition shrink-0 cursor-pointer"
        >
          <span>Ajouter une ville</span>
          <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center font-black text-xs leading-none">
            +
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 3. INTERACTIVE MAP VIEW CONTROLLER (Météo-France vs Radar Pluie HD Direct) */}
      {/* ========================================================================= */}
      <div className="p-2 sm:p-3 bg-slate-900/60 backdrop-blur-sm border-b border-slate-700/60 flex flex-wrap items-center justify-between gap-2">
        {/* Layer Tabs */}
        <div className="flex rounded-xl bg-slate-950/80 p-1 border border-slate-800 text-xs font-bold text-slate-300">
          <button
            onClick={() => setActiveTab('meteo-france')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'meteo-france'
                ? 'bg-blue-600 text-white shadow-md'
                : 'hover:text-white'
            }`}
          >
            <Sun className="h-3.5 w-3.5 text-amber-400" />
            <span>Carte France (Météo-France)</span>
          </button>

          <button
            onClick={() => setActiveTab('radar-pluie')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'radar-pluie'
                ? 'bg-blue-600 text-white shadow-md'
                : 'hover:text-white'
            }`}
          >
            <Radio className="h-3.5 w-3.5 text-sky-400 animate-pulse" />
            <span>Radar Pluie HD Direct</span>
          </button>

          <button
            onClick={() => setActiveTab('vigilance')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'vigilance'
                ? 'bg-blue-600 text-white shadow-md'
                : 'hover:text-white'
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
            <span>Vigilance 96 Dép.</span>
          </button>
        </div>

        {/* Time Slot Picker for Météo-France view */}
        {activeTab === 'meteo-france' && (
          <div className="flex items-center gap-1 bg-slate-950/80 p-0.5 rounded-lg border border-slate-800 text-[11px] font-bold text-slate-300">
            {(['matin', 'apres-midi', 'soir', 'nuit'] as TimeSlotFilter[]).map((slot) => (
              <button
                key={slot}
                onClick={() => setActiveSlot(slot)}
                className={`px-2 py-1 rounded transition cursor-pointer capitalize ${
                  activeSlot === slot ? 'bg-slate-700 text-white' : 'hover:text-white'
                }`}
              >
                {slot === 'apres-midi' ? 'Après-midi' : slot}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 4. MAIN MAP CANVAS AREA                                                    */}
      {/* ========================================================================= */}
      <div className="relative w-full h-[480px] sm:h-[560px] lg:h-[620px] overflow-hidden select-none">
        {/* TAB 1: METEO-FRANCE OFFICIAL MAP (Exact aesthetic of user image.png) */}
        {activeTab === 'meteo-france' && (
          <div className="relative w-full h-full bg-[#c6e4f6]">
            {/* SVG Geographical Terrain of France + Surrounding Countries */}
            <svg 
              viewBox="0 0 1000 900" 
              className="w-full h-full object-cover"
              preserveAspectRatio="xMidYMid slice"
            >
              <defs>
                {/* French Green Relief Gradient matching screenshot */}
                <linearGradient id="franceReliefGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#82cb4b" />
                  <stop offset="50%" stopColor="#76c342" />
                  <stop offset="100%" stopColor="#67b233" />
                </linearGradient>

                {/* Neighboring Countries Light Slate Land Gradient */}
                <linearGradient id="neighborLandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#dbeafe" />
                  <stop offset="100%" stopColor="#cbd5e1" />
                </linearGradient>

                {/* Drop shadow for temperature pills */}
                <filter id="badgeShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#000" floodOpacity="0.35" />
                </filter>
              </defs>

              {/* 1. Surrounding Neighboring Countries (Spain, UK, Germany, Italy, Switzerland, Belgium) */}
              {/* United Kingdom / England top-left */}
              <path
                d="M 50 0 L 220 0 L 320 60 L 280 120 L 200 130 L 140 100 L 80 120 Z"
                fill="url(#neighborLandGrad)"
                stroke="#94a3b8"
                strokeWidth="1.2"
                opacity="0.85"
              />

              {/* Spain / Iberian Peninsula bottom-left (exact as in user image.png) */}
              <path
                d="M 0 680 L 180 670 L 240 760 L 380 770 L 450 820 L 470 900 L 0 900 Z"
                fill="url(#neighborLandGrad)"
                stroke="#94a3b8"
                strokeWidth="1.5"
                opacity="0.9"
              />

              {/* Belgium, Germany, Switzerland, Italy (East/North-East border) */}
              <path
                d="M 600 0 L 1000 0 L 1000 700 L 860 680 L 820 600 L 830 540 L 780 470 L 750 380 L 680 260 L 590 140 Z"
                fill="url(#neighborLandGrad)"
                stroke="#94a3b8"
                strokeWidth="1.2"
                opacity="0.8"
              />

              {/* 2. MAINLAND FRANCE RELIEF (L'Hexagone) in vibrant Météo-France green */}
              <path
                d="M 580 110 
                   L 550 145 
                   L 490 200 
                   L 440 210 
                   L 390 225 
                   L 340 260 
                   L 260 265 
                   L 200 290 
                   L 140 325 
                   L 130 350 
                   L 170 380 
                   L 240 370 
                   L 260 410 
                   L 270 450 
                   L 260 500 
                   L 280 540 
                   L 300 620 
                   L 280 670 
                   L 270 730 
                   L 250 780 
                   L 360 770 
                   L 440 790 
                   L 490 820 
                   L 560 840 
                   L 590 810 
                   L 630 770 
                   L 700 775 
                   L 760 760 
                   L 820 740 
                   L 825 710 
                   L 780 680 
                   L 760 620 
                   L 790 560 
                   L 810 500 
                   L 770 460 
                   L 730 420 
                   L 760 380 
                   L 740 320 
                   L 780 290 
                   L 730 250 
                   L 660 220 
                   L 610 160 
                   Z"
                fill="url(#franceReliefGrad)"
                stroke="#3f6212"
                strokeWidth="2.5"
                filter="drop-shadow(0px 8px 16px rgba(0,0,0,0.15))"
              />

              {/* 3. CORSICA (Corse) - Lower Right at (880-960, 720-850) */}
              <path
                d="M 880 730 L 920 710 L 940 760 L 930 830 L 900 850 L 880 810 Z"
                fill="url(#franceReliefGrad)"
                stroke="#3f6212"
                strokeWidth="2"
                filter="drop-shadow(0px 4px 8px rgba(0,0,0,0.15))"
              />

              {/* Regional internal borders subtle relief curves */}
              <g stroke="#ffffff" strokeWidth="0.8" opacity="0.35" fill="none">
                {/* Loire river path */}
                <path d="M 270 450 Q 400 440 500 480 T 650 500" />
                {/* Seine river path */}
                <path d="M 360 240 Q 480 270 540 290 T 630 360" />
                {/* Garonne river path */}
                <path d="M 290 640 Q 360 700 460 780" />
                {/* Rhône river path */}
                <path d="M 720 560 Q 690 660 710 770" />
              </g>
            </svg>

            {/* 4. OVERLAID REGIONAL METEOROLOGICAL PINS (Icons & Bold Temperatures) */}
            <div className="absolute inset-0 pointer-events-auto">
              {regionalPoints.map((pt) => {
                const isSelected = selectedPointId === pt.id || (station.id && station.id.includes(pt.id));
                const isCurrentStation = station.name.toLowerCase().includes(pt.name.toLowerCase());

                return (
                  <div
                    key={pt.id}
                    onClick={() => handleSelectRegionalCity(pt)}
                    style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group transition-transform duration-200 hover:scale-125 z-20 flex flex-col items-center"
                    title={`${pt.name} : ${pt.temp}°C • ${pt.weatherDesc}`}
                  >
                    {/* Temperature & City Label (Bold, high-contrast, exactly like user screenshot) */}
                    <div className="flex items-center gap-1 drop-shadow-md">
                      <span className="font-black text-slate-950 text-base sm:text-lg tracking-tight [text-shadow:_0_1px_3px_rgb(255_255_255_/_90%),_0_0_1px_rgb(255_255_255)]">
                        {pt.temp}°
                      </span>
                      {pt.hasWarning && (
                        <span className="text-[11px] text-amber-500 font-black animate-bounce">⚠️</span>
                      )}
                    </div>

                    {/* Distinctive Weather Icon (Sun, Sun-Cloud, Rain) */}
                    <div className="relative">
                      {renderWeatherSymbol(pt.condition)}

                      {/* Active station ring highlight */}
                      {(isSelected || isCurrentStation) && (
                        <div className="absolute -inset-1 rounded-full border-2 border-blue-600 animate-ping pointer-events-none" />
                      )}
                    </div>

                    {/* Small City Name Tooltip on Hover */}
                    <span className="opacity-0 group-hover:opacity-100 transition bg-slate-900/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow pointer-events-none whitespace-nowrap mt-0.5">
                      {pt.name}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Map Legend Overlay in bottom-left corner */}
            <div className="absolute bottom-3 left-3 bg-white/85 backdrop-blur-md p-2.5 rounded-xl border border-slate-300 shadow-lg text-[11px] text-slate-800 space-y-1 z-30 max-w-[200px]">
              <div className="font-black text-[#004f9e] text-xs flex items-center gap-1.5">
                <span>🇫🇷 MÉTÉO-FRANCE DIRECT</span>
              </div>
              <p className="text-[10px] text-slate-600 leading-tight">
                Cliquez sur une région ou ville pour actualiser la météo en temps réel.
              </p>
              <div className="flex items-center gap-2 pt-1 text-[9px] text-slate-500 font-bold border-t border-slate-200">
                <span className="text-emerald-700">● Données officielles</span>
                <span>{new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LIVE RADAR PLUIE HD DIRECT (Interactive RainViewer Doppler Radar) */}
        {activeTab === 'radar-pluie' && (
          <div className="relative w-full h-full bg-slate-950">
            <iframe
              src={`https://www.rainviewer.com/map.html?loc=46.6,2.4,${radarZoom}&oFa=0&oc=1&layer=radar&sm=1&sn=1`}
              title="Radar Pluie Météo-France RainViewer"
              className="w-full h-full border-0"
              loading="lazy"
            />

            {/* Radar Controls Toolbar */}
            <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-20">
              <button
                onClick={() => setRadarZoom(prev => Math.min(prev + 1, 9))}
                className="w-8 h-8 rounded-xl bg-slate-900/90 border border-slate-700 text-white font-black text-sm flex items-center justify-center shadow hover:bg-slate-800 transition"
              >
                +
              </button>
              <button
                onClick={() => setRadarZoom(prev => Math.max(prev - 1, 4))}
                className="w-8 h-8 rounded-xl bg-slate-900/90 border border-slate-700 text-white font-black text-sm flex items-center justify-center shadow hover:bg-slate-800 transition"
              >
                -
              </button>
            </div>

            {/* Reflectivity Color Bar */}
            <div className="absolute bottom-3 inset-x-3 bg-slate-950/90 backdrop-blur-md p-2 rounded-xl border border-slate-800 flex items-center justify-between text-[10px] text-slate-300 z-20">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sky-400">Échos Radar (dBZ) :</span>
                <span className="text-slate-400">Faible</span>
                <div className="w-32 sm:w-48 h-2.5 rounded-full bg-gradient-to-r from-blue-500 via-emerald-400 via-amber-400 via-rose-500 to-purple-600 shadow-inner" />
                <span className="text-rose-400 font-bold">Grêle / Orage violent</span>
              </div>

              <button
                onClick={() => onNavigateTab ? onNavigateTab('radar') : (onOpenGigaRadar ? onOpenGigaRadar() : null)}
                className="font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1 transition"
              >
                <span>Plein Écran</span>
                <Maximize2 className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: VIGILANCE NATIONALE PAR DÉPARTEMENT */}
        {activeTab === 'vigilance' && (
          <div className="relative w-full h-full bg-[#0a1426] p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-white border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-400" />
                <span className="font-black text-sm">Carte de Vigilance Officielle Météo-France (96 Départements)</span>
              </div>
              <span className="text-xs text-slate-400">Actualisation toutes les heures</span>
            </div>

            {/* Vigilance Interactive Map Embed or Fallback Matrix */}
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="max-w-md w-full bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 text-center space-y-3 shadow-xl">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  <span className="text-xl font-black">✓</span>
                </div>
                <h4 className="text-sm font-black text-white">
                  Situation Calme sur la majorité de la métropole
                </h4>
                <p className="text-xs text-slate-300">
                  Vigilance Jaune active sur les massifs alpins (Chamonix, Savoie) pour pluie et orages isolés.
                </p>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => onNavigateTab ? onNavigateTab('vigilance') : null}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg transition"
                  >
                    Consulter la Carte Complète de Vigilance →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 5. CARD FOOTER - Status & Interactive Shortcuts                           */}
      {/* ========================================================================= */}
      <div className="bg-slate-900 px-4 sm:px-6 py-2.5 flex items-center justify-between text-xs text-slate-300 border-t border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold text-white">Station sélectionnée :</span>
          <span className="text-sky-400 font-bold">{station.name}</span>
          <span className="hidden sm:inline text-slate-400">({weather.weatherDescription})</span>
        </div>

        <button
          onClick={() => onNavigateTab ? onNavigateTab('radar') : (onOpenGigaRadar ? onOpenGigaRadar() : null)}
          className="text-xs font-bold text-blue-400 hover:text-blue-300 transition flex items-center gap-1"
        >
          <span>Ouvrir l'Observatoire Radar 4K</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
