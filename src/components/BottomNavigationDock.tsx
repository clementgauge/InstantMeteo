import React, { useEffect, useRef, useState } from 'react';
import { 
  Sun, 
  ShieldAlert, 
  CloudRain, 
  FileText, 
  Globe2, 
  Layers, 
  Sparkles, 
  Search, 
  Compass, 
  ChevronUp, 
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Split,
  Mountain,
  Map,
  MapPin,
  Waves,
  History,
  Check,
  X,
  Radio,
  BellRing,
  Cloud,
  Trophy,
  MessageSquare,
  Bell,
  Flame,
  Droplets,
  Menu,
  Star,
  AlertTriangle,
  Thermometer,
  LayoutGrid,
  Settings,
  Info,
  SlidersHorizontal,
  Moon,
  Download
} from 'lucide-react';
import { AtmosphereThemeConfig } from '../types/atmosphere';
import { LocationPoint } from '../types/weather';
import { FRENCH_STATIONS } from '../data/frenchStations';
import { isPageVisible } from '../services/displayPreferencesService';

export type NavTabId = 
  | 'realtime' 
  | 'auraAI'
  | 'skymap'
  | 'cloudNephology'
  | 'vigilance' 
  | 'mountain'
  | 'beaches'
  | 'droughtFire'
  | 'watercourses'
  | 'scenarios14d' 
  | 'radar' 
  | 'eightMonths' 
  | 'historicalTrends'
  | 'worldDisasters'
  | 'weatherArchive'
  | 'bulletin'
  | 'competitive'
  | 'discussionGroup'
  | 'communityReports';

interface BottomNavigationDockProps {
  activeTab: NavTabId;
  onSelectTab: (tabId: NavTabId) => void;
  onOpenAtmosphereModal: () => void;
  onOpenSearchModal: () => void;
  onOpenNotificationsModal?: () => void;
  onOpenComparatorModal?: () => void;
  onOpenAndroidModal?: () => void;
  onSelectStation?: (station: LocationPoint) => void;
  simplifiedMode?: boolean;
  onToggleSimplifiedMode?: () => void;
  onToggleThemeMode?: () => void;
  showFloatingBubble?: boolean;
  onToggleFloatingBubble?: () => void;
  currentTheme: AtmosphereThemeConfig;
  seniorMode: boolean;
  isLightMode?: boolean;
}

const FAVORITES_STORAGE_KEY = 'instant_meteo_favorite_stations_v1';

const loadSavedFavoriteStations = (): LocationPoint[] => {
  try {
    const saved = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {}
  return [
    FRENCH_STATIONS.find((s) => s.name.toLowerCase().includes('paris')) || FRENCH_STATIONS[0],
    FRENCH_STATIONS.find((s) => s.name.toLowerCase().includes('lyon')) || FRENCH_STATIONS[1],
    FRENCH_STATIONS.find((s) => s.name.toLowerCase().includes('marseille')) || FRENCH_STATIONS[2],
    FRENCH_STATIONS.find((s) => s.name.toLowerCase().includes('chamonix')) || FRENCH_STATIONS[4],
  ].filter(Boolean);
};

export const BottomNavigationDock: React.FC<BottomNavigationDockProps> = ({
  activeTab,
  onSelectTab,
  onOpenAtmosphereModal,
  onOpenSearchModal,
  onOpenNotificationsModal,
  onOpenComparatorModal,
  onOpenAndroidModal,
  onSelectStation,
  simplifiedMode = false,
  onToggleSimplifiedMode,
  onToggleThemeMode,
  showFloatingBubble = false,
  onToggleFloatingBubble,
  currentTheme,
  seniorMode,
  isLightMode = false,
}) => {
  const [isMenuDrawerOpen, setIsMenuDrawerOpen] = useState(false);
  const [isPlusMenuOpen, setIsPlusMenuOpen] = useState(false);
  const [plusSubView, setPlusSubView] = useState<'main' | 'favorites'>('main');
  const [savedFavorites, setSavedFavorites] = useState<LocationPoint[]>(() => loadSavedFavoriteStations());
  const [isDockMinimized, setIsDockMinimized] = useState(false);
  const dockScrollRef = useRef<HTMLDivElement>(null);
  const autoScrollDirectionRef = useRef<-1 | 0 | 1>(0);
  const autoScrollFrameRef = useRef<number | null>(null);

  const stopDockAutoScroll = () => {
    autoScrollDirectionRef.current = 0;
    if (autoScrollFrameRef.current !== null) {
      cancelAnimationFrame(autoScrollFrameRef.current);
      autoScrollFrameRef.current = null;
    }
  };

  const runDockAutoScroll = () => {
    const scroller = dockScrollRef.current;
    const direction = autoScrollDirectionRef.current;

    if (!scroller || direction === 0) {
      autoScrollFrameRef.current = null;
      return;
    }

    scroller.scrollLeft += direction * 2.6;
    autoScrollFrameRef.current = requestAnimationFrame(runDockAutoScroll);
  };

  const startDockAutoScroll = (direction: -1 | 1) => {
    if (autoScrollDirectionRef.current === direction && autoScrollFrameRef.current !== null) return;
    stopDockAutoScroll();
    autoScrollDirectionRef.current = direction;
    autoScrollFrameRef.current = requestAnimationFrame(runDockAutoScroll);
  };

  const handleDockPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const scroller = dockScrollRef.current;
    if (!scroller) return;

    const rect = scroller.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const edgeZone = Math.min(95, rect.width * 0.2);

    if (x <= edgeZone) {
      startDockAutoScroll(-1);
    } else if (x >= rect.width - edgeZone) {
      startDockAutoScroll(1);
    } else {
      stopDockAutoScroll();
    }
  };

  useEffect(() => () => stopDockAutoScroll(), []);

  const [, setDisplayTick] = useState(0);
  useEffect(() => {
    const handlePreferencesUpdate = () => {
      setDisplayTick((t) => t + 1);
    };
    const handleFavoritesUpdate = () => {
      setSavedFavorites(loadSavedFavoriteStations());
    };
    window.addEventListener('instant_meteo_display_preferences_updated', handlePreferencesUpdate);
    window.addEventListener('instant_meteo_favorites_updated', handleFavoritesUpdate);
    return () => {
      window.removeEventListener('instant_meteo_display_preferences_updated', handlePreferencesUpdate);
      window.removeEventListener('instant_meteo_favorites_updated', handleFavoritesUpdate);
    };
  }, []);

  useEffect(() => {
    if (!isPlusMenuOpen) return;
    setSavedFavorites(loadSavedFavoriteStations());
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsPlusMenuOpen(false);
        setPlusSubView('main');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlusMenuOpen]);

  // Quick primary actions on the dock (filtrés dynamiquement par préférences de l'utilisateur)
  const allDockItems: { id: NavTabId; label: string; icon: any; shortLabel: string; badge?: string }[] = [
    { id: 'realtime', label: 'Temps Réel', shortLabel: 'Direct', icon: Sun },
    { id: 'skymap', label: 'SkyMap 3D', shortLabel: 'SkyMap 3D', icon: Compass, badge: '3D' },
    { id: 'cloudNephology', label: 'Nuages & Néphologie', shortLabel: 'Nuages', icon: Cloud, badge: '48h' },
    { id: 'vigilance', label: 'Vigilances', shortLabel: 'Alertes', icon: ShieldAlert, badge: '5m' },
    { id: 'scenarios14d', label: '14 Jours', shortLabel: '14 Jours', icon: Split },
    { id: 'radar', label: 'Radar', shortLabel: 'Radar', icon: CloudRain },
    { id: 'mountain', label: 'Météo Montagne', shortLabel: 'Montagne', icon: Mountain, badge: 'BERA' },
    { id: 'beaches', label: 'Météo des Plages', shortLabel: 'Plages', icon: Waves, badge: 'SHOM' },
    { id: 'droughtFire', label: 'Sécheresse & Incendie', shortLabel: 'Sécheresse', icon: Flame, badge: 'VigiEau' },
    { id: 'watercourses', label: 'Vigie Cours d\'Eau', shortLabel: 'Cours d\'Eau', icon: Droplets, badge: 'Vigicrues' },
    { id: 'eightMonths', label: '8 Mois', shortLabel: '8 Mois', icon: Globe2 },
    { id: 'historicalTrends', label: 'Évolution & Archives', shortLabel: 'Évolution & Archives', icon: History, badge: '2000+' },
    { id: 'worldDisasters', label: 'Atlas des catastrophes', shortLabel: 'Catastrophes', icon: Radio },
    { id: 'bulletin', label: 'Bulletins', shortLabel: 'Bulletins', icon: FileText },
    { id: 'competitive', label: 'Compétitif & Classement', shortLabel: 'Défis 🏆', icon: Trophy, badge: '🔥 +Pts' },
    { id: 'discussionGroup', label: 'Groupe de Discussion', shortLabel: 'Salon 💬', icon: MessageSquare, badge: 'Direct' },
  ];

  const primaryDockItems = allDockItems.filter(item => isPageVisible(item.id));

  // Thematic Groups for Full Drawer Hub (filtrés dynamiquement)
  const rawHubCategories = [
    {
      categoryName: '⚡ Direct, Alertes & Précipitations',
      items: [
        { id: 'realtime', label: '1. Temps Réel & Observatoire Direct', icon: Sun, desc: 'Conditions actuelles, thermo-hygrométrie, vent et relevé de la station' },
        { id: 'skymap', label: 'SkyMap 3D — Navigation, Ciel & Relief', icon: Compass, desc: 'Carte 3D vectorielle interactive, météo en direct, guidage GPS, relief et itinéraires' },
        { id: 'cloudNephology', label: '2. Observatoire Néphologique & Nuages 48h', icon: Cloud, desc: 'Sondage vertical 0-12000m, décomposition par étage, LCL, base/sommet, givrage & atlas OMM' },
        { id: 'vigilance', label: '3. Vigilances & Alertes Multi-Jours', icon: ShieldAlert, desc: 'Matrice 12 risques actualisée toutes les 5 min' },
        { id: 'radar', label: '4. Radar Précipitations, Feux NASA & Vents Open-Meteo', icon: CloudRain, desc: 'Radar Doppler légal, imagerie feux de forêt NASA FIRMS et vecteurs vents Open-Meteo' },
      ]
    },
    {
      categoryName: '⏱️ Prévisions & Scénarios Probabilistes',
      items: [
        { id: 'scenarios14d', label: '5. Tendances & Scénarios 14 Jours', icon: Split, desc: 'Ensembles probabilistes, faisceaux de scénarios et indices de confiance' },
        { id: 'eightMonths', label: '6. Tendances 8 Mois (Département / Région / Pays)', icon: Globe2, desc: '24 Décades spatialisées par département (101), région (13) et pays' },
        { id: 'historicalTrends', label: '7. Évolution 2000, Temps Réel & Archives Météo', icon: History, desc: 'Trajectoire depuis 2000, courbe à la minute, recherche par date (depuis 1950) et carnet météo' },
      ]
    },
    {
      categoryName: '🏔️ Montagne, Littoral & Risques Hydrologiques',
      items: [
        { id: 'mountain', label: 'Météo Montagne & Nivologie', icon: Mountain, desc: 'Bulletins BERA Météo-France, risque d\'avalanche (1 à 5), balises Nivôse, isotherme 0°C et limite pluie-neige' },
        { id: 'beaches', label: 'Météo des Plages & Littoral', icon: Waves, desc: 'Température de la mer en direct, horaires & coefficients des marées SHOM, houle et drapeaux de baignade' },
        { id: 'droughtFire', label: 'Vigilance Sécheresse & Météo des Forêts', icon: Flame, desc: 'Météo des forêts Météo-France, Indice Forêt Météo (IFM), arrêtés préfectoraux et restrictions VigiEau' },
        { id: 'watercourses', label: 'Vigie Cours d\'Eau & Vigicrues', icon: Droplets, desc: 'Hauteurs d\'eau en direct, débits instantanés (m³/s), cotes d\'alerte SCHAPI et crues historiques' },
      ]
    },
    {
      categoryName: '🗺️ Analyses Territoriales, Monde & Histoire',
      items: [
        { id: 'worldDisasters', label: '8. Atlas des catastrophes (Monde en temps réel)', icon: Radio, desc: 'Carte mondiale en direct (NASA EONET, USGS, GDACS, NASA Black Marble, RainViewer & records météo)' },
        { id: 'bulletin', label: '9. Bulletins Météo J+1 à J+7 & 4 Semaines', icon: FileText, desc: 'Synthèse textuelle rédigée pour la commune, département et pays' },
      ]
    },
    {
      categoryName: '🏆 Communauté, Compétition & Discussion',
      items: [
        { id: 'competitive', label: '10. Mode Compétitif, Flammes & Classement', icon: Trophy, desc: 'Gagnez des points par géolocalisation, météos rencontrées, séries de flammes (x2, x3, x10) et carte collaborative' },
        { id: 'discussionGroup', label: '11. Groupe de Discussion & Salon Météo', icon: MessageSquare, desc: 'Échangez en direct avec la communauté météo, partagez vos relevés et discutez des alertes' },
      ]
    }
  ];

  const hubCategories = rawHubCategories
    .map(cat => ({
      ...cat,
      items: cat.items.filter(it => isPageVisible(it.id))
    }))
    .filter(cat => cat.items.length > 0);

  const getDockItemStyle = (id: string, isActive: boolean) => {
    if (isActive) {
      switch (id) {
        case 'realtime':
          return 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/35 border border-amber-300 font-black';
        case 'auraAI':
          return 'bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-500 text-white shadow-lg shadow-purple-500/35 border border-sky-400 font-black';
        case 'cloudNephology':
          return 'bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 text-white shadow-lg shadow-sky-500/35 border border-sky-400 font-black';
        case 'vigilance':
          return 'bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 text-white shadow-lg shadow-rose-500/35 border border-rose-300 font-black';
        case 'scenarios14d':
          return 'bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 text-white shadow-lg shadow-indigo-500/35 border border-indigo-400 font-black';
        case 'bulletin':
          return 'bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/35 border border-cyan-300 font-black';
        case 'radar':
          return 'bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/35 border border-cyan-300 font-black';
        case 'mountain':
          return 'bg-gradient-to-r from-slate-700 via-cyan-800 to-blue-900 text-white shadow-lg shadow-cyan-500/35 border border-cyan-400 font-black';
        case 'beaches':
          return 'bg-gradient-to-r from-teal-500 via-emerald-600 to-cyan-600 text-white shadow-lg shadow-teal-500/35 border border-teal-300 font-black';
        case 'droughtFire':
          return 'bg-gradient-to-r from-orange-600 via-amber-600 to-red-600 text-white shadow-lg shadow-orange-500/35 border border-amber-300 font-black';
        case 'watercourses':
          return 'bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-500/35 border border-cyan-300 font-black';
        default:
          return 'bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 text-white shadow-lg shadow-blue-500/35 border border-blue-400 font-black';
      }
    }

    if (isLightMode) {
      return 'bg-slate-100 hover:bg-slate-200/90 text-slate-700 hover:text-slate-950 border border-slate-200/80';
    }

    switch (id) {
      case 'realtime':
        return 'bg-slate-900/80 hover:bg-amber-950/40 text-slate-300 hover:text-amber-300 border border-slate-800/80 hover:border-amber-500/40';
      case 'auraAI':
        return 'bg-slate-900/80 hover:bg-purple-950/40 text-slate-300 hover:text-purple-300 border border-slate-800/80 hover:border-purple-500/40';
      case 'cloudNephology':
        return 'bg-slate-900/80 hover:bg-sky-950/40 text-slate-300 hover:text-sky-300 border border-slate-800/80 hover:border-sky-500/40';
      case 'vigilance':
        return 'bg-slate-900/80 hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 border border-slate-800/80 hover:border-rose-500/40';
      case 'radar':
        return 'bg-slate-900/80 hover:bg-cyan-950/40 text-slate-300 hover:text-cyan-300 border border-slate-800/80 hover:border-cyan-500/40';
      case 'mountain':
        return 'bg-slate-900/80 hover:bg-cyan-950/40 text-slate-300 hover:text-cyan-300 border border-slate-800/80 hover:border-cyan-500/40';
      case 'beaches':
        return 'bg-slate-900/80 hover:bg-teal-950/40 text-slate-300 hover:text-teal-300 border border-slate-800/80 hover:border-teal-500/40';
      case 'droughtFire':
        return 'bg-slate-900/80 hover:bg-orange-950/40 text-slate-300 hover:text-orange-300 border border-slate-800/80 hover:border-orange-500/40';
      default:
        return 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800/80 hover:border-slate-700';
    }
  };

  const getDockIconColor = (id: string, isActive: boolean) => {
    if (isActive) return id === 'realtime' ? 'text-slate-950' : 'text-white';
    if (isLightMode) return 'text-slate-600';
    switch (id) {
      case 'realtime': return 'text-amber-400';
      case 'auraAI': return 'text-purple-400';
      case 'cloudNephology': return 'text-sky-400';
      case 'vigilance': return 'text-rose-400';
      case 'scenarios14d': return 'text-indigo-400';
      case 'bulletin': return 'text-blue-400';
      case 'radar': return 'text-cyan-400';
      case 'mountain': return 'text-sky-300';
      case 'beaches': return 'text-teal-400';
      case 'droughtFire': return 'text-orange-400';
      case 'watercourses': return 'text-blue-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <>
      {/* Universal Hub Full Drawer Modal */}
      {isMenuDrawerOpen && (
        <div className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-md animate-fadeIn ${
          isLightMode ? 'bg-slate-900/40' : 'bg-slate-950/80'
        }`}>
          <div className={`relative w-full max-w-4xl max-h-[85vh] overflow-y-auto rounded-t-3xl sm:rounded-xl border p-5 sm:p-6 shadow-2xl pb-24 sm:pb-6 ${
            isLightMode 
              ? 'bg-white text-slate-900 border-slate-200' 
              : 'bg-slate-900/98 text-slate-100 border-slate-700'
          }`}>
            
            {/* Header */}
            <div className={`flex items-center justify-between pb-4 border-b sticky top-0 z-10 ${
              isLightMode 
                ? 'bg-white border-slate-200 text-slate-900' 
                : 'bg-slate-900/98 border-slate-800 text-white'
            }`}>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <h2 className={`text-base sm:text-lg font-black flex items-center gap-2 ${
                    isLightMode ? 'text-slate-900' : 'text-white'
                  }`}>
                    Centre de Navigation &amp; Pages
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isLightMode 
                        ? 'bg-blue-50 border-blue-200 text-blue-800' 
                        : 'bg-blue-950 border-blue-500/30 text-blue-300'
                    }`}>
                      {primaryDockItems.length} Modules Experts
                    </span>
                  </h2>
                  <p className={`text-xs ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                    Accédez directement à l'ensemble des modules météorologiques et climatologiques
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsMenuDrawerOpen(false)}
                className={`p-2 rounded-xl transition ${
                  isLightMode 
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-600' 
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick Actions Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-4">
              {onOpenNotificationsModal && (
                <button
                  onClick={() => {
                    setIsMenuDrawerOpen(false);
                    onOpenNotificationsModal();
                  }}
                  className={`flex items-center gap-2.5 p-3 rounded-2xl border font-bold text-xs transition ${
                    isLightMode 
                      ? 'border-indigo-200 bg-indigo-50/90 hover:bg-indigo-100 text-indigo-950' 
                      : 'border-indigo-500/40 bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-200'
                  }`}
                >
                  <BellRing className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0 animate-pulse" />
                  <div className="text-left">
                    <span className={`block font-extrabold ${isLightMode ? 'text-indigo-950' : 'text-white'}`}>Alertes &amp; Push</span>
                    <span className={`text-[10px] font-normal ${isLightMode ? 'text-indigo-700' : 'text-indigo-300'}`}>Notifications Phone</span>
                  </div>
                </button>
              )}

              <button
                onClick={() => {
                  setIsMenuDrawerOpen(false);
                  onOpenAtmosphereModal();
                }}
                className={`flex items-center gap-2.5 p-3 rounded-2xl border font-bold text-xs transition ${
                  isLightMode 
                    ? 'border-amber-200 bg-amber-50/90 hover:bg-amber-100 text-amber-950' 
                    : 'border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-200'
                }`}
              >
                <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <div className="text-left">
                  <span className={`block font-extrabold ${isLightMode ? 'text-amber-950' : 'text-white'}`}>Atmosphère &amp; Saisons</span>
                  <span className={`text-[10px] font-normal ${isLightMode ? 'text-amber-700' : 'text-amber-300'}`}>{currentTheme.name}</span>
                </div>
              </button>

              <button
                onClick={() => {
                  setIsMenuDrawerOpen(false);
                  onOpenSearchModal();
                }}
                className={`flex items-center gap-2.5 p-3 rounded-2xl border font-bold text-xs transition ${
                  isLightMode 
                    ? 'border-blue-200 bg-blue-50/90 hover:bg-blue-100 text-blue-950' 
                    : 'border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-200'
                }`}
              >
                <Search className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <div className="text-left">
                  <span className={`block font-extrabold ${isLightMode ? 'text-blue-950' : 'text-white'}`}>Recherche Universelle</span>
                  <span className={`text-[10px] font-normal ${isLightMode ? 'text-blue-700' : 'text-blue-300'}`}>34 965 communes &amp; Monde</span>
                </div>
              </button>

              <button
                onClick={() => {
                  setIsMenuDrawerOpen(false);
                  onSelectTab('realtime');
                }}
                className={`flex items-center gap-2.5 p-3 rounded-2xl border font-bold text-xs transition ${
                  isLightMode 
                    ? 'border-emerald-200 bg-emerald-50/90 hover:bg-emerald-100 text-emerald-950' 
                    : 'border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-200'
                }`}
              >
                <Compass className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div className="text-left">
                  <span className={`block font-extrabold ${isLightMode ? 'text-emerald-950' : 'text-white'}`}>Retour au Direct</span>
                  <span className={`text-[10px] font-normal ${isLightMode ? 'text-emerald-700' : 'text-emerald-300'}`}>Observatoire France</span>
                </div>
              </button>
            </div>

            {/* Categorized Modules */}
            <div className="space-y-5">
              {hubCategories.map((cat, idx) => (
                <div key={idx} className="space-y-2">
                  <div className={`text-xs font-black uppercase tracking-wider px-1 ${
                    isLightMode ? 'text-slate-600' : 'text-slate-400'
                  }`}>
                    {cat.categoryName}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {cat.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setIsMenuDrawerOpen(false);
                            if (item.id === 'skymap') {
                              window.location.href = '/skymap';
                              return;
                            }
                            onSelectTab(item.id as NavTabId);
                          }}
                          className={`flex items-start gap-3 p-3 rounded-2xl border text-left transition ${
                            isActive
                              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 border-blue-500'
                              : isLightMode 
                                ? 'bg-slate-50 border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 text-slate-800'
                                : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/60 text-slate-200'
                          }`}
                        >
                          <div className={`p-2 rounded-xl shrink-0 ${
                            isActive 
                              ? 'bg-white/20 text-white' 
                              : isLightMode 
                                ? 'bg-white border border-slate-200 text-blue-600 shadow-sm' 
                                : 'bg-slate-800 text-blue-400'
                          }`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className={`text-xs font-black truncate ${isActive ? 'text-white' : (isLightMode ? 'text-slate-900' : 'text-slate-100')}`}>
                                {item.label}
                              </span>
                              {isActive && <Check className="h-3.5 w-3.5 text-white shrink-0" />}
                            </div>
                            <p className={`text-[11px] mt-0.5 line-clamp-1 ${
                              isActive ? 'text-blue-100' : (isLightMode ? 'text-slate-500' : 'text-slate-400')
                            }`}>
                              {item.desc}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* PHONE-ONLY FLOATING "PLUS" POPOVER CARD & COMPACT 5-SLOT BOTTOM BAR */}
      {/* =================================================================== */}
      {isPlusMenuOpen && (
        <>
          <button
            type="button"
            aria-label="Fermer le menu Plus"
            onClick={() => {
              setIsPlusMenuOpen(false);
              setPlusSubView('main');
            }}
            className="sm:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px]"
          />

          <div
            role="dialog"
            aria-label="Menu Plus"
            className={`mobile-plus-popover sm:hidden fixed bottom-[76px] right-2.5 z-50 w-[276px] rounded-2xl border backdrop-blur-2xl overflow-hidden transition-all duration-200 ${
              isLightMode
                ? 'border-slate-200 bg-white/97 text-slate-900 shadow-[0_18px_45px_rgba(15,23,42,0.18)]'
                : 'border-slate-700/80 bg-[#0b1220]/96 text-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.88)] ring-1 ring-white/10'
            }`}
          >
            {/* Subtle top drag/accent bar */}
            <div className="pt-2 flex justify-center">
              <span className={`w-10 h-1 rounded-full ${isLightMode ? 'bg-slate-300' : 'bg-slate-600/70'}`} />
            </div>

            {/* Popover Header */}
            <div className="flex items-center justify-between px-4 pt-1.5 pb-2">
              {plusSubView === 'favorites' ? (
                <button
                  type="button"
                  onClick={() => setPlusSubView('main')}
                  className={`flex items-center gap-1.5 text-sm font-black cursor-pointer ${
                    isLightMode ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  <ChevronLeft className="h-4 w-4 text-sky-400" />
                  <span>Favoris</span>
                </button>
              ) : (
                <h3 className={`text-sm font-black tracking-tight ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
                  Plus
                </h3>
              )}

              <button
                type="button"
                aria-label="Fermer"
                onClick={() => {
                  setIsPlusMenuOpen(false);
                  setPlusSubView('main');
                }}
                className={`h-7 w-7 rounded-lg flex items-center justify-center transition active:scale-95 cursor-pointer ${
                  isLightMode
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    : 'bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {plusSubView === 'favorites' ? (
              <div className="px-2 pb-3 max-h-[55vh] overflow-y-auto space-y-1">
                {savedFavorites.map((fav) => (
                  <button
                    key={fav.id}
                    type="button"
                    onClick={() => {
                      onSelectStation?.(fav);
                      setIsPlusMenuOpen(false);
                      setPlusSubView('main');
                    }}
                    className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-left transition active:scale-98 cursor-pointer ${
                      isLightMode
                        ? 'hover:bg-slate-100 text-slate-800'
                        : 'hover:bg-slate-800/80 text-slate-100'
                    }`}
                  >
                    <MapPin className="h-4 w-4 text-amber-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold truncate">{fav.name}</div>
                      <div className={`text-[10px] truncate ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        {fav.department || 'Station météo'} • {fav.altitude ?? 0} m
                      </div>
                    </div>
                    <ChevronRight className={`h-3.5 w-3.5 shrink-0 ${isLightMode ? 'text-slate-400' : 'text-slate-500'}`} />
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setIsPlusMenuOpen(false);
                    setPlusSubView('main');
                    onOpenSearchModal();
                  }}
                  className="w-full mt-1.5 flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 py-2 px-3 text-xs font-bold text-white transition active:scale-98 cursor-pointer"
                >
                  <Search className="h-3.5 w-3.5" />
                  <span>Rechercher / Ajouter un lieu</span>
                </button>
              </div>
            ) : (
              <div className="px-2 pb-2.5 space-y-0.5 max-h-[68vh] overflow-y-auto">
                {[
                  {
                    id: 'favoris',
                    label: 'Favoris',
                    subtitle: 'Lieux enregistrés',
                    icon: Star,
                    iconClass: 'text-amber-400 fill-amber-400',
                    onClick: () => {
                      if (onSelectStation) {
                        setPlusSubView('favorites');
                      } else {
                        setIsPlusMenuOpen(false);
                        onOpenSearchModal();
                      }
                    }
                  },
                  {
                    id: 'notifications',
                    label: 'Notifications',
                    subtitle: 'Gérer vos alertes',
                    icon: Bell,
                    iconClass: isLightMode ? 'text-slate-600' : 'text-slate-300',
                    onClick: () => {
                      setIsPlusMenuOpen(false);
                      onOpenNotificationsModal?.();
                    }
                  },
                  {
                    id: 'vigilance',
                    label: 'Vigilance',
                    subtitle: 'Cartes et risques',
                    icon: AlertTriangle,
                    iconClass: 'text-rose-400',
                    onClick: () => {
                      setIsPlusMenuOpen(false);
                      onSelectTab('vigilance');
                    }
                  },
                  {
                    id: 'radar',
                    label: 'Radar HD',
                    subtitle: 'Temps réel',
                    icon: Radio,
                    iconClass: 'text-emerald-400',
                    onClick: () => {
                      setIsPlusMenuOpen(false);
                      onSelectTab('radar');
                    }
                  },
                  {
                    id: 'stations',
                    label: 'Stations météo',
                    subtitle: 'Données et graphiques',
                    icon: Thermometer,
                    iconClass: 'text-sky-400',
                    onClick: () => {
                      setIsPlusMenuOpen(false);
                      if (onOpenComparatorModal) {
                        onOpenComparatorModal();
                      } else {
                        onSelectTab('historicalTrends');
                      }
                    }
                  },
                  {
                    id: 'widgets',
                    label: 'Widgets',
                    subtitle: showFloatingBubble ? 'Bulle écran active' : "Écran d'accueil",
                    icon: LayoutGrid,
                    iconClass: 'text-blue-400',
                    onClick: () => {
                      setIsPlusMenuOpen(false);
                      if (onToggleFloatingBubble) {
                        onToggleFloatingBubble();
                      } else {
                        onOpenAndroidModal?.();
                      }
                    }
                  },
                  ...(onToggleSimplifiedMode ? [{
                    id: 'simplified-mode',
                    label: simplifiedMode ? 'Mode Simple' : 'Mode Expert',
                    subtitle: simplifiedMode ? 'Toucher pour Mode Expert' : 'Toucher pour Mode Simple',
                    icon: SlidersHorizontal,
                    iconClass: simplifiedMode ? 'text-emerald-400' : 'text-indigo-400',
                    onClick: () => {
                      onToggleSimplifiedMode();
                      setIsPlusMenuOpen(false);
                    }
                  }] : []),
                  ...(onToggleThemeMode ? [{
                    id: 'theme-mode',
                    label: isLightMode ? 'Mode Jour (Blanc)' : 'Mode Nuit (Noir)',
                    subtitle: isLightMode ? 'Passer en Mode Nuit' : 'Passer en Mode Blanc',
                    icon: isLightMode ? Sun : Moon,
                    iconClass: isLightMode ? 'text-amber-500' : 'text-sky-400',
                    onClick: () => {
                      onToggleThemeMode();
                      setIsPlusMenuOpen(false);
                    }
                  }] : []),
                  ...(onOpenAndroidModal ? [{
                    id: 'download-app',
                    label: "Télécharger l'appli",
                    subtitle: 'Installer sur téléphone',
                    icon: Download,
                    iconClass: 'text-amber-400',
                    onClick: () => {
                      setIsPlusMenuOpen(false);
                      onOpenAndroidModal();
                    }
                  }] : []),
                  {
                    id: 'parametres',
                    label: 'Paramètres',
                    subtitle: "Préférences de l'app",
                    icon: Settings,
                    iconClass: isLightMode ? 'text-slate-600' : 'text-slate-300',
                    onClick: () => {
                      setIsPlusMenuOpen(false);
                      window.dispatchEvent(new CustomEvent('instant_meteo_open_settings'));
                    }
                  },
                  {
                    id: 'apropos',
                    label: 'À propos',
                    subtitle: 'Version et infos',
                    icon: Info,
                    iconClass: 'text-sky-400',
                    onClick: () => {
                      setIsPlusMenuOpen(false);
                      window.dispatchEvent(new CustomEvent('instant_meteo_open_legal', { detail: { tab: 'mentions' } }));
                    }
                  }
                ].map((row) => {
                  const RowIcon = row.icon;
                  return (
                    <button
                      key={row.id}
                      type="button"
                      onClick={row.onClick}
                      className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-left transition active:scale-[0.98] cursor-pointer ${
                        isLightMode
                          ? 'hover:bg-slate-100 text-slate-900'
                          : 'hover:bg-slate-800/75 text-white'
                      }`}
                    >
                      <div className="w-6 flex items-center justify-center shrink-0">
                        <RowIcon className={`h-[18px] w-[18px] ${row.iconClass}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`text-[12px] font-bold leading-tight truncate ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
                          {row.label}
                        </div>
                        <div className={`text-[10px] leading-tight truncate mt-0.5 ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                          {row.subtitle}
                        </div>
                      </div>
                      <ChevronRight className={`h-3.5 w-3.5 shrink-0 ${isLightMode ? 'text-slate-400' : 'text-slate-500'}`} />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* Mobile Bottom 5-Slot Bar (Phone Only: sm:hidden) */}
      <nav
        aria-label="Navigation mobile inférieure"
        className="mobile-bottom-dock sm:hidden fixed bottom-2.5 left-2.5 right-2.5 z-40"
      >
        <div
          className={`rounded-2xl border backdrop-blur-2xl p-1.5 grid grid-cols-5 items-center gap-1 transition-all duration-200 ${
            isLightMode
              ? 'border-slate-200/95 bg-white/95 shadow-[0_10px_30px_rgba(15,23,42,0.14)] ring-1 ring-black/5'
              : 'border-slate-700/75 bg-[#090f1d]/94 shadow-[0_14px_40px_rgba(0,0,0,0.88),0_0_24px_rgba(59,130,246,0.16)] ring-1 ring-white/10'
          }`}
        >
          {/* 1. Left Sparkles / Atmosphère Button */}
          <button
            type="button"
            onClick={() => {
              setIsPlusMenuOpen(false);
              onOpenAtmosphereModal();
            }}
            title={`Atmosphère actuelle : ${currentTheme.name}`}
            aria-label="Atmosphère et ambiance du ciel"
            className={`min-h-[48px] rounded-xl border flex items-center justify-center transition active:scale-95 cursor-pointer ${
              isLightMode
                ? 'border-slate-200 bg-slate-100/90 hover:bg-slate-200/80 text-sky-600'
                : 'border-slate-700/70 bg-slate-900/75 hover:bg-slate-800 text-sky-300'
            }`}
          >
            <Sparkles className="h-5 w-5" style={{ color: isLightMode ? '#0284c7' : currentTheme.glowAccentColor || '#38bdf8' }} />
          </button>

          {/* 2. Direct (Active Red/Coral Glow when active) */}
          <button
            type="button"
            id="mobile-dock-tab-realtime"
            onClick={() => {
              setIsPlusMenuOpen(false);
              onSelectTab('realtime');
            }}
            className={`relative min-h-[48px] rounded-xl flex flex-col items-center justify-center px-1 transition active:scale-95 cursor-pointer ${
              activeTab === 'realtime'
                ? isLightMode
                  ? 'bg-gradient-to-b from-red-500/15 to-rose-500/20 border border-red-500/50 text-red-700 shadow-[0_0_12px_rgba(239,68,68,0.22)]'
                  : 'bg-gradient-to-b from-red-500/25 via-red-600/15 to-red-950/65 border border-red-500/70 text-white shadow-[0_0_16px_rgba(239,68,68,0.42)]'
                : isLightMode
                  ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
            }`}
          >
            {activeTab === 'realtime' && (
              <span className="absolute top-1.5 right-2 w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_6px_#ef4444]" />
            )}
            <CloudRain className={`h-[19px] w-[19px] shrink-0 ${
              activeTab === 'realtime'
                ? (isLightMode ? 'text-red-600' : 'text-red-400')
                : (isLightMode ? 'text-slate-600' : 'text-slate-300')
            }`} />
            <span className={`text-[11px] leading-none mt-1 whitespace-nowrap ${
              activeTab === 'realtime' ? 'font-extrabold' : 'font-semibold'
            }`}>
              Direct
            </span>
          </button>

          {/* 3. SkyMap */}
          <button
            type="button"
            id="mobile-dock-tab-skymap"
            onClick={() => {
              setIsPlusMenuOpen(false);
              window.location.href = '/skymap';
            }}
            className={`min-h-[48px] rounded-xl flex flex-col items-center justify-center px-1 transition active:scale-95 cursor-pointer ${
              activeTab === 'skymap'
                ? isLightMode
                  ? 'bg-sky-50 border border-sky-400 text-sky-700 shadow-sm'
                  : 'bg-sky-500/20 border border-sky-400/60 text-white shadow-[0_0_14px_rgba(56,189,248,0.3)]'
                : isLightMode
                  ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
            }`}
          >
            <Map className={`h-[19px] w-[19px] shrink-0 ${
              activeTab === 'skymap'
                ? (isLightMode ? 'text-sky-600' : 'text-sky-400')
                : (isLightMode ? 'text-slate-600' : 'text-slate-200')
            }`} />
            <span className="text-[11px] font-semibold leading-none mt-1 whitespace-nowrap">
              SkyMap
            </span>
          </button>

          {/* 4. Pages (with Blue Numeric Badge) */}
          <button
            type="button"
            id="mobile-dock-pages-btn"
            onClick={() => {
              setIsPlusMenuOpen(false);
              setIsMenuDrawerOpen(true);
            }}
            className={`min-h-[48px] rounded-xl flex flex-col items-center justify-center px-1 transition active:scale-95 cursor-pointer ${
              activeTab !== 'realtime' && activeTab !== 'skymap'
                ? isLightMode
                  ? 'bg-blue-50 border border-blue-400/70 text-blue-700'
                  : 'bg-blue-600/20 border border-blue-500/60 text-white shadow-[0_0_14px_rgba(37,99,235,0.28)]'
                : isLightMode
                  ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
            }`}
          >
            <div className="relative flex items-center justify-center">
              <Layers className={`h-[19px] w-[19px] shrink-0 ${
                activeTab !== 'realtime' && activeTab !== 'skymap'
                  ? (isLightMode ? 'text-blue-600' : 'text-blue-400')
                  : (isLightMode ? 'text-slate-600' : 'text-slate-200')
              }`} />
              <span className="absolute -top-1.5 -right-3 h-4 min-w-[20px] px-1 rounded-full bg-blue-600 text-white text-[10px] font-black leading-none flex items-center justify-center shadow-md tabular-nums">
                {primaryDockItems.length}
              </span>
            </div>
            <span className="text-[11px] font-semibold leading-none mt-1 whitespace-nowrap">
              Pages
            </span>
          </button>

          {/* 5. Plus (Opens Floating Popover Menu) */}
          <button
            type="button"
            id="mobile-dock-plus-btn"
            aria-expanded={isPlusMenuOpen}
            onClick={() => {
              setPlusSubView('main');
              setIsPlusMenuOpen((prev) => !prev);
            }}
            className={`min-h-[48px] rounded-xl flex flex-col items-center justify-center px-1 transition active:scale-95 cursor-pointer ${
              isPlusMenuOpen
                ? isLightMode
                  ? 'bg-slate-200/80 text-slate-950'
                  : 'bg-slate-800/90 text-white ring-1 ring-slate-600/70'
                : isLightMode
                  ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
            }`}
          >
            <Menu className={`h-[19px] w-[19px] shrink-0 ${isLightMode ? 'text-slate-700' : 'text-slate-200'}`} />
            <span className="text-[11px] font-semibold leading-none mt-1 whitespace-nowrap">
              Plus
            </span>
          </button>
        </div>
      </nav>

      {/* =================================================================== */}
      {/* DESKTOP / TABLET FLOATING BOTTOM DOCK (Unchanged, hidden on phones) */}
      {/* =================================================================== */}
      <nav 
        aria-label="Navigation rapide inférieure"
        className="hidden sm:block fixed bottom-3.5 left-1/2 -translate-x-1/2 z-40 w-[96%] max-w-5xl transition-all duration-300 ease-out"
      >
        {isDockMinimized ? (
          /* Minimized Capsule */
          <div className="flex items-center justify-center">
            <button
              onClick={() => setIsDockMinimized(false)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold transition active:scale-95 animate-bounce shadow-xl ${
                isLightMode 
                  ? 'border-blue-300 bg-white/95 text-slate-800 hover:text-blue-600' 
                  : 'border-blue-500/40 bg-[#070d18]/95 text-slate-200 hover:text-white'
              }`}
              style={{
                boxShadow: isLightMode ? '0 8px 25px -4px rgba(37, 99, 235, 0.25)' : `0 8px 25px -4px ${currentTheme.glowAccentColor}50`
              }}
            >
              <Layers className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span>Afficher la navigation ({primaryDockItems.length} modules)</span>
              <ChevronUp className={`h-3.5 w-3.5 ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`} />
            </button>
          </div>
        ) : (
          /* Full High-Craft Floating Glass Dock */
          <div 
            className={`relative rounded-full border backdrop-blur-2xl p-1.5 flex items-center justify-between gap-1.5 transition-all duration-300 ${
              isLightMode 
                ? 'border-slate-200/90 shadow-[0_12px_35px_rgba(15,23,42,0.12)] ring-1 ring-black/5' 
                : 'border-slate-700/80 shadow-[0_12px_45px_rgba(0,0,0,0.85)] ring-1 ring-white/10'
            }`}
            style={{
              background: isLightMode ? 'rgba(255, 255, 255, 0.94)' : 'rgba(7, 13, 24, 0.96)',
              boxShadow: isLightMode 
                ? '0 12px 35px -5px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(226, 232, 240, 0.8)' 
                : `0 12px 35px -5px ${currentTheme.glowAccentColor}35, 0 0 1px 1px rgba(255,255,255,0.08)`
            }}
          >
            {/* 1. Left: Atmosphere Theme Selector */}
            <button
              onClick={onOpenAtmosphereModal}
              title={`Atmosphère actuelle : ${currentTheme.name}. Cliquez pour changer.`}
              className={`flex items-center justify-center h-8 w-8 sm:h-9 sm:w-auto sm:px-3 rounded-full border transition active:scale-95 shrink-0 ${
                isLightMode 
                  ? 'border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-800' 
                  : 'border-slate-700/60 bg-slate-900/80 hover:bg-slate-800 text-white'
              }`}
              style={{
                borderColor: isLightMode ? undefined : `${currentTheme.glowAccentColor}50`
              }}
            >
              <Sparkles className="h-4 w-4 animate-pulse shrink-0" style={{ color: currentTheme.glowAccentColor }} />
              <span className="text-[11px] font-bold hidden md:inline ml-1.5 whitespace-nowrap">
                {currentTheme.skyToneLabel}
              </span>
            </button>

            {/* 2. Center: Smooth Touch Horizontal Scroll Track */}
            <div
              ref={dockScrollRef}
              onPointerMove={handleDockPointerMove}
              onPointerLeave={stopDockAutoScroll}
              className="flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-1 justify-start px-1 scroll-smooth min-w-0"
              style={{ scrollbarWidth: 'none', overscrollBehaviorX: 'contain' }}
            >
              {primaryDockItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`dock-tab-${item.id}`}
                    onClick={() => {
                      if (item.id === 'skymap') {
                        window.location.href = '/skymap';
                        return;
                      }
                      onSelectTab(item.id);
                    }}
                    className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full text-xs transition-all relative shrink-0 active:scale-95 ${
                      getDockItemStyle(item.id, isActive)
                    } ${seniorMode ? 'py-2 px-3 text-sm' : ''}`}
                  >
                    <div className="relative">
                      <Icon className={`h-4 w-4 shrink-0 transition-colors ${getDockIconColor(item.id, isActive)}`} />
                      {item.badge && !isActive && (
                        <span className="absolute -top-1.5 -right-2 px-1 py-0.2 text-[8px] font-extrabold bg-amber-500 text-slate-950 rounded-full leading-tight">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <span className="whitespace-nowrap tracking-tight">
                      {item.shortLabel}
                    </span>
                    {isActive && (
                      <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* 3. Right: 20 Pages Hub Drawer & Minimize Button */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => setIsMenuDrawerOpen(true)}
                title={`Consulter les ${primaryDockItems.length} modules et cartes météo`}
                className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 border border-blue-400/30 transition active:scale-95 shrink-0 cursor-pointer"
              >
                <Layers className="h-3.5 w-3.5" />
                <span className="text-xs font-black whitespace-nowrap">{primaryDockItems.length} Pages</span>
              </button>

              <button
                onClick={() => setIsDockMinimized(true)}
                title="Masquer la barre"
                className={`flex items-center justify-center h-8 w-8 rounded-full border transition shrink-0 active:scale-95 cursor-pointer ${
                  isLightMode 
                    ? 'border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900' 
                    : 'border-slate-800 bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};
