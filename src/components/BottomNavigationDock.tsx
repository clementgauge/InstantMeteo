import React, { useEffect, useRef, useState } from 'react';
import { 
  Sun, 
  ShieldAlert, 
  CloudRain, 
  FileText, 
  Clock, 
  Calendar, 
  Globe2, 
  Layers, 
  Sparkles, 
  Search, 
  Compass, 
  ChevronUp, 
  ChevronDown,
  Split,
  Mountain,
  ThermometerSnowflake,
  Map,
  Waves,
  LineChart,
  History,
  TrendingUp,
  HelpCircle,
  Check,
  X,
  Radio,
  BellRing,
  Cloud,
  Trophy,
  Users,
  MessageSquare,
  Home,
  MoreHorizontal,
  Bell,
  Camera,
  Flame,
  Droplets
} from 'lucide-react';
import { AtmosphereThemeConfig } from '../types/atmosphere';
import { isPageVisible } from '../services/displayPreferencesService';

export type NavTabId = 
  | 'realtime' 
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
  | 'sportsActivities'
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
  currentTheme: AtmosphereThemeConfig;
  seniorMode: boolean;
  isLightMode?: boolean;
}

export const BottomNavigationDock: React.FC<BottomNavigationDockProps> = ({
  activeTab,
  onSelectTab,
  onOpenAtmosphereModal,
  onOpenSearchModal,
  onOpenNotificationsModal,
  currentTheme,
  seniorMode,
  isLightMode = false,
}) => {
  const [isMenuDrawerOpen, setIsMenuDrawerOpen] = useState(false);
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
    window.addEventListener('instant_meteo_display_preferences_updated', handlePreferencesUpdate);
    return () => window.removeEventListener('instant_meteo_display_preferences_updated', handlePreferencesUpdate);
  }, []);

  // Quick primary actions on the dock (filtrés dynamiquement par préférences de l'utilisateur)
  const allDockItems: { id: NavTabId; label: string; icon: any; shortLabel: string; badge?: string }[] = [
    { id: 'realtime', label: 'Temps Réel', shortLabel: 'Direct', icon: Sun },
    { id: 'cloudNephology', label: 'Nuages & Néphologie', shortLabel: 'Nuages', icon: Cloud, badge: '48h' },
    { id: 'vigilance', label: 'Vigilances', shortLabel: 'Alertes', icon: ShieldAlert, badge: '5m' },
    { id: 'scenarios14d', label: '14 Jours', shortLabel: '14 Jours', icon: Split },
    { id: 'radar', label: 'Radar', shortLabel: 'Radar', icon: CloudRain },
    { id: 'mountain', label: 'Météo Montagne', shortLabel: 'Montagne', icon: Mountain, badge: 'BERA' },
    { id: 'beaches', label: 'Météo des Plages', shortLabel: 'Plages', icon: Waves, badge: 'SHOM' },
    { id: 'droughtFire', label: 'Sécheresse & Incendie', shortLabel: 'Sécheresse', icon: Flame, badge: 'VigiEau' },
    { id: 'watercourses', label: 'Vigie Cours d\'Eau', shortLabel: 'Cours d\'Eau', icon: Droplets, badge: 'Vigicrues' },
    { id: 'eightMonths', label: '8 Mois', shortLabel: '8 Mois', icon: Globe2 },
    { id: 'historicalTrends', label: 'Évolution', shortLabel: 'Évolution', icon: History, badge: '2000' },
    { id: 'sportsActivities', label: 'Sport & Trajet', shortLabel: 'Trajet', icon: TrendingUp },
    { id: 'worldDisasters', label: 'Monde & Catastrophes', shortLabel: 'Monde', icon: Radio },
    { id: 'weatherArchive', label: 'Archives Journalières', shortLabel: 'Archives', icon: Calendar, badge: 'Nouveau' },
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
        { id: 'historicalTrends', label: '7. Évolution depuis 2000 & Temps Réel (1 min)', icon: History, desc: 'Trajectoire climatique annuelle depuis 2000 et courbe haute fréquence à la minute' },
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
      categoryName: '🗺️ Analyses Territoriales, Trajets & Histoire',
      items: [
        { id: 'sportsActivities', label: '8. Activités Sportives & Calculateur de Trajet', icon: TrendingUp, desc: 'Index 0-10, météo d\'itinéraire pas à pas selon moyen de transport (voiture, train, vélo, à pied)' },
        { id: 'worldDisasters', label: '9. Météo Monde, Tornades & Tsunamis (24h)', icon: Radio, desc: 'Suivi mondial vérifié (Franceinfo, Le Monde, TF1, France 2, BFMTV, Le Figaro)' },
        { id: 'weatherArchive', label: '10. Archives Journalières & Historique Météo', icon: Calendar, desc: 'Recherche de date passée, météo quotidienne (pluie, soleil, vent, T°C) et journal local' },
        { id: 'bulletin', label: '11. Bulletins Météo J+1 à J+7 & 4 Semaines', icon: FileText, desc: 'Synthèse textuelle rédigée pour la commune, département et pays' },
      ]
    },
    {
      categoryName: '🏆 Communauté, Compétition & Discussion',
      items: [
        { id: 'competitive', label: '12. Mode Compétitif, Flammes & Classement', icon: Trophy, desc: 'Gagnez des points par géolocalisation, météos rencontrées, séries de flammes (x2, x3, x10) et carte collaborative' },
        { id: 'discussionGroup', label: '13. Groupe de Discussion & Salon Météo', icon: MessageSquare, desc: 'Échangez en direct avec la communauté météo, partagez vos relevés et discutez des alertes' },
      ]
    }
  ];

  const hubCategories = rawHubCategories
    .map(cat => ({
      ...cat,
      items: cat.items.filter(it => isPageVisible(it.id))
    }))
    .filter(cat => cat.items.length > 0);

  return (
    <>
      {/* Universal Hub Full Drawer Modal */}
      {isMenuDrawerOpen && (
        <div className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-md animate-fadeIn ${
          isLightMode ? 'bg-slate-900/40' : 'bg-slate-950/80'
        }`}>
          <div className={`relative w-full max-w-4xl max-h-[85vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border p-5 sm:p-6 shadow-2xl pb-24 sm:pb-6 ${
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
                      19 Modules Experts
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
                  <span className={`text-[10px] font-normal ${isLightMode ? 'text-blue-700' : 'text-blue-300'}`}>35 000 Communes &amp; Monde</span>
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
                            onSelectTab(item.id as NavTabId);
                            setIsMenuDrawerOpen(false);
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

      {/* Floating Bottom Dock */}
      <nav 
        aria-label="Navigation rapide inférieure"
        className="fixed bottom-2.5 sm:bottom-3.5 left-1/2 -translate-x-1/2 z-40 w-[96%] max-w-5xl transition-all duration-300 ease-out"
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
                    onClick={() => onSelectTab(item.id)}
                    className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full text-xs font-bold transition-all relative shrink-0 active:scale-95 ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/40 border border-blue-400/40'
                        : isLightMode 
                          ? 'bg-slate-100 hover:bg-slate-200/90 text-slate-700 hover:text-slate-950 border border-slate-200/80' 
                          : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800/80 hover:border-slate-700'
                    } ${seniorMode ? 'py-2 px-3 text-sm' : ''}`}
                  >
                    <div className="relative">
                      <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : (isLightMode ? 'text-slate-500' : 'text-slate-400')}`} />
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
                title="Ouvrir le sommaire complet des 20 modules"
                className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 border border-blue-400/30 transition active:scale-95 shrink-0 cursor-pointer"
              >
                <Layers className="h-3.5 w-3.5" />
                <span className="text-xs font-black whitespace-nowrap">20 Pages</span>
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
