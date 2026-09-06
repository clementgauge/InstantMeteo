import React, { useEffect, useRef, useState } from 'react';
import {
  Activity,
  BarChart3,
  Bell,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Cloud,
  CloudRain,
  Compass,
  Download,
  Eye,
  FileText,
  Gauge,
  Globe,
  History,
  Home,
  KeyRound,
  Layers,
  LayoutDashboard,
  LogOut,
  LucideIcon,
  Map,
  MapPin,
  Mountain,
  Navigation,
  Radio,
  Search,
  Settings,
  ShieldAlert,
  Sparkles,
  Split,
  Sun,
  ThermometerSnowflake,
  TrendingUp,
  Trophy,
  MessageSquare,
  X,
} from 'lucide-react';
import { LocationPoint } from '../types/weather';
import { isPageVisible } from '../services/displayPreferencesService';

export interface SidebarSectionItem {
  id: string;
  label: string;
  icon?: LucideIcon;
}

interface PageSectionSidebarProps {
  title: string;
  sections: SidebarSectionItem[];
  currentStation?: LocationPoint;
  isChristmasActive?: boolean;
  onTriggerSecretCode?: (code: string) => boolean;
  onLocateGps?: () => void;
  activeTab?: string;
  onSelectTab?: (tabId: any) => void;
  onOpenSearch?: () => void;
  onOpenNotifications?: () => void;
  onOpenAtmosphere?: () => void;
  activeAlertCount?: number;
}

const fallbackIcons: LucideIcon[] = [
  LayoutDashboard,
  BarChart3,
  Gauge,
  Sparkles,
  CloudRain,
  Radio,
  Activity,
  Download,
];

// Main app pages for switcher (titres exacts et synchronisés)
const ALL_PAGES = [
  { id: 'realtime', label: '1. Temps Réel & Observatoire Direct', icon: Sun },
  { id: 'cloudNephology', label: '2. Nuages 48h & Néphologie', icon: Cloud },
  { id: 'vigilance', label: '3. Vigilances & Alertes Multi-Jours', icon: ShieldAlert },
  { id: 'scenarios14d', label: '4. Tendances & Scénarios 14 Jours', icon: Split },
  { id: 'radar', label: '5. Radar Précipitations, Feux NASA & Vents', icon: CloudRain },
  { id: 'eightMonths', label: '6. Tendances 8 Mois (Dép/Région/Pays)', icon: Globe },
  { id: 'historicalTrends', label: '7. Évolution depuis 2000 & 1min', icon: History },
  { id: 'sportsActivities', label: '8. Météo Sport & Trajet Itinéraire', icon: TrendingUp },
  { id: 'worldDisasters', label: '9. Monde & Catastrophes Naturelles', icon: Radio },
  { id: 'weatherArchive', label: '10. Archives & Historique Journalier', icon: Calendar },
  { id: 'bulletin', label: '11. Bulletins Prévisions (J+7 & 4 Semaines)', icon: FileText },
  { id: 'competitive', label: '12. Mode Compétitif & Classement', icon: Trophy },
  { id: 'discussionGroup', label: '13. Groupe de Discussion & Salon Météo', icon: MessageSquare },
];

export const PageSectionSidebar: React.FC<PageSectionSidebarProps> = ({
  title,
  sections,
  currentStation,
  isChristmasActive = false,
  onTriggerSecretCode,
  onLocateGps,
  activeTab = 'realtime',
  onSelectTab,
  onOpenSearch,
  onOpenNotifications,
  onOpenAtmosphere,
  activeAlertCount = 0,
}) => {
  const [, setDisplayTick] = useState(0);
  useEffect(() => {
    const handlePreferencesUpdate = () => {
      setDisplayTick((t) => t + 1);
    };
    window.addEventListener('instant_meteo_display_preferences_updated', handlePreferencesUpdate);
    return () => window.removeEventListener('instant_meteo_display_preferences_updated', handlePreferencesUpdate);
  }, []);

  const visiblePages = ALL_PAGES.filter(p => isPageVisible(p.id));

  // Desktop state: 3 distinct levels
  // Level 1: 'full' (on voit tout : titres, rubriques détaillées, noël, météo)
  // Level 2: 'icons' (les logos/icônes sont affichés en colonne rail avec infobulles)
  // Level 3: 'minimal' (juste la flèche / bouton discret de sommaire en bas à gauche, niveau par défaut)
  const [sidebarLevel, setSidebarLevel] = useState<'minimal' | 'icons' | 'full'>('minimal');
  const [activeSection, setActiveSection] = useState(sections[0]?.id ?? '');
  
  // Mobile drawer state
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [mobileViewMode, setMobileViewMode] = useState<'sections' | 'pages'>('sections');

  const scrollingToRef = useRef<string | null>(null);
  const unlockTimerRef = useRef<number | null>(null);

  const sectionIdsKey = sections.map((section) => section.id).join('|');
  const sectionIds = sections.map((section) => section.id);

  // Re-sync active section on page change
  useEffect(() => {
    setActiveSection(sections[0]?.id ?? '');
    scrollingToRef.current = null;
    if (unlockTimerRef.current !== null) {
      window.clearTimeout(unlockTimerRef.current);
      unlockTimerRef.current = null;
    }
  }, [title, sectionIdsKey]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileOpen]);

  // Scrollspy observer for page sub-sections
  useEffect(() => {
    if (typeof window === 'undefined' || sectionIds.length === 0) return;

    let frame = 0;
    const updateActiveSection = () => {
      const elements = sectionIds
        .map((id) => document.getElementById(id))
        .filter((element): element is HTMLElement => Boolean(element));

      if (elements.length === 0) return;

      const lockedTargetId = scrollingToRef.current;
      if (lockedTargetId) {
        const target = document.getElementById(lockedTargetId);
        if (target) {
          const targetTop = target.getBoundingClientRect().top;
          if (Math.abs(targetTop - 80) > 32) {
            setActiveSection((previous) =>
              previous === lockedTargetId ? previous : lockedTargetId
            );
            return;
          }
        }
        scrollingToRef.current = null;
      }

      const readingLine = window.innerHeight * 0.35;
      let current = elements[0];

      for (const element of elements) {
        const rect = element.getBoundingClientRect();
        if (rect.top <= readingLine) current = element;
        else break;
      }

      const nearBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 20;
      if (nearBottom) current = elements[elements.length - 1];

      setActiveSection((previous) => (previous === current.id ? previous : current.id));
    };

    const onScrollOrResize = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(updateActiveSection);
    };

    updateActiveSection();
    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, [sectionIdsKey]);

  const goToSection = (id: string) => {
    const element = document.getElementById(id);
    if (!element) return;

    scrollingToRef.current = id;
    setActiveSection(id);

    if (unlockTimerRef.current !== null) {
      window.clearTimeout(unlockTimerRef.current);
    }

    unlockTimerRef.current = window.setTimeout(() => {
      scrollingToRef.current = null;
      unlockTimerRef.current = null;
    }, 1600);

    const top = element.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });

    // Close mobile drawer on navigation
    setIsMobileOpen(false);
  };

  const handleSelectPage = (tabId: string) => {
    if (onSelectTab) {
      onSelectTab(tabId);
    }
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* ========================================================================= */}
      {/* MOBILE TRIGGER FLOTTANT (Format Téléphone: Flèche élégante sur le côté)   */}
      {/* ========================================================================= */}
      <div className="lg:hidden fixed left-0 top-[30%] z-40">
        <button
          type="button"
          onClick={() => setIsMobileOpen(true)}
          title="Ouvrir le menu et les rubriques"
          aria-label="Ouvrir la barre latérale mobile"
          className="group relative flex items-center pl-1.5 pr-2.5 py-3.5 rounded-r-2xl bg-gradient-to-r from-[#2948f2] via-[#243edd] to-[#1a2dbb] text-white shadow-2xl shadow-blue-700/50 border-y border-r border-blue-300/40 hover:pl-2.5 hover:pr-3.5 transition-all duration-300 active:scale-95 cursor-pointer"
        >
          <div className="flex flex-col items-center gap-1">
            <ChevronRight className="h-5 w-5 text-white drop-shadow animate-pulse" />
            <span className="text-[8px] font-black uppercase tracking-widest text-blue-200 [writing-mode:vertical-rl] rotate-180">
              Menu
            </span>
          </div>

          {/* Active alert indicator pill */}
          {activeAlertCount > 0 && (
            <span className="absolute -top-1.5 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[9px] font-black text-slate-950 shadow-md">
              {activeAlertCount}
            </span>
          )}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* MOBILE SIDEBAR DRAWER (Exactement dans le style de la photo Rlexandra)    */}
      {/* ========================================================================= */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <div
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-[295px] max-w-[85vw] bg-gradient-to-b from-[#2b4bf4] via-[#243edd] to-[#15249f] text-white shadow-2xl flex flex-col justify-between rounded-r-[36px] border-r border-blue-300/30 overflow-hidden transform transition-transform duration-300 ease-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu latéral Météo"
      >
        {/* TOP PROFILE / STATION HEADER (Style avatar + nom + sous-titre + flèche incurvée) */}
        <div className="relative p-5 pb-4 border-b border-blue-400/25 bg-blue-600/15">
          {/* Curved Back Chevron Tab Button on the right edge */}
          <button
            type="button"
            onClick={() => setIsMobileOpen(false)}
            title="Fermer le menu latéral"
            aria-label="Fermer le menu"
            className="absolute -right-3.5 top-6 h-9 w-9 rounded-full bg-gradient-to-br from-[#2a4bf4] to-[#1c30bf] border-2 border-white/50 shadow-xl flex items-center justify-center text-white hover:scale-110 active:scale-95 transition cursor-pointer"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {/* Profile row */}
          <div className="flex items-center gap-3 pr-6">
            {/* Avatar with circular white ring */}
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-sky-400 via-indigo-200 to-white text-blue-900 shadow-md ring-2 ring-white/70 overflow-hidden">
              <span className="text-sm font-black tracking-tight text-blue-900">
                {currentStation ? currentStation.name.slice(0, 2).toUpperCase() : 'IM'}
              </span>
              {isChristmasActive && (
                <span className="absolute -top-0.5 -right-0.5 text-[11px]" title="Noël actif">
                  ❄️
                </span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="text-base font-black text-white truncate leading-tight tracking-tight">
                {currentStation?.name || 'Instant Météo'}
              </h2>
              <p className="text-[11px] text-blue-200 truncate mt-0.5 font-medium">
                {currentStation
                  ? `${currentStation.department} • ${currentStation.altitude} m`
                  : 'Observatoire National France'}
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs (Rubriques de la page VS Toutes les Pages) */}
          <div className="mt-4 flex rounded-xl bg-blue-950/40 p-1 border border-blue-400/20">
            <button
              type="button"
              onClick={() => setMobileViewMode('sections')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-black transition cursor-pointer ${
                mobileViewMode === 'sections'
                  ? 'bg-white text-blue-900 shadow-sm'
                  : 'text-blue-200 hover:text-white'
              }`}
            >
              Rubriques ({sections.length})
            </button>
            <button
              type="button"
              onClick={() => setMobileViewMode('pages')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-black transition cursor-pointer ${
                mobileViewMode === 'pages'
                  ? 'bg-white text-blue-900 shadow-sm'
                  : 'text-blue-200 hover:text-white'
              }`}
            >
              {visiblePages.length} Pages
            </button>
          </div>
        </div>

        {/* MIDDLE SCROLLABLE MENU (Style navigation fluide avec icônes nettes) */}
        <div className="flex-1 overflow-y-auto px-3.5 py-3 space-y-1.5 scrollbar-none">
          {mobileViewMode === 'sections' ? (
            /* SECTIONS DU SOMMAIRE DE LA PAGE ACTIVE */
            <div className="space-y-1">
              <div className="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-blue-200 flex items-center justify-between">
                <span>Sur cette page : {title}</span>
                <span className="text-[9px] text-blue-300 lowercase font-normal">clic pour défiler</span>
              </div>

              {sections.map((section, index) => {
                const Icon = section.icon ?? fallbackIcons[index % fallbackIcons.length];
                const active = activeSection === section.id;

                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => goToSection(section.id)}
                    className={`flex w-full items-center gap-3 px-3 py-2.5 rounded-2xl text-left transition-all duration-200 cursor-pointer ${
                      active
                        ? 'bg-white text-blue-950 font-black shadow-lg shadow-black/20'
                        : 'text-blue-100 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition ${
                        active
                          ? 'bg-blue-600 text-white'
                          : 'bg-blue-800/40 text-blue-200 group-hover:bg-blue-700/50'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="text-xs font-bold leading-snug truncate">
                      {section.label}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            /* LISTE COMPLÈTE DES PAGES & MODULES VISIBLES */
            <div className="space-y-1">
              <div className="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-blue-200">
                Changer de page météo
              </div>
              {visiblePages.map((page) => {
                const Icon = page.icon;
                const active = activeTab === page.id;

                return (
                  <button
                    key={page.id}
                    type="button"
                    onClick={() => handleSelectPage(page.id)}
                    className={`flex w-full items-center gap-3 px-3 py-2 rounded-2xl text-left transition-all duration-200 cursor-pointer ${
                      active
                        ? 'bg-white text-blue-950 font-black shadow-md'
                        : 'text-blue-100 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl ${
                        active ? 'bg-blue-600 text-white' : 'bg-blue-800/40 text-blue-200'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-xs font-semibold leading-snug truncate">
                      {page.label}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Quick Action Buttons Grid (Search, Notifications, Atmosphere) */}
          <div className="pt-3 border-t border-blue-400/20 space-y-1.5">
            <div className="px-2 text-[10px] font-black uppercase tracking-wider text-blue-200">
              Raccourcis Directs
            </div>

            {onOpenSearch && (
              <button
                type="button"
                onClick={() => {
                  onOpenSearch();
                  setIsMobileOpen(false);
                }}
                className="flex w-full items-center gap-3 px-3 py-2 rounded-2xl text-left text-blue-100 hover:bg-white/10 transition cursor-pointer"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-blue-800/40 text-blue-200">
                  <Search className="h-3.5 w-3.5" />
                </span>
                <span className="text-xs font-semibold">Rechercher une ville</span>
              </button>
            )}

            {onOpenNotifications && (
              <button
                type="button"
                onClick={() => {
                  onOpenNotifications();
                  setIsMobileOpen(false);
                }}
                className="flex w-full items-center justify-between px-3 py-2 rounded-2xl text-left text-blue-100 hover:bg-white/10 transition cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-blue-800/40 text-blue-200">
                    <Bell className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-xs font-semibold">Alertes &amp; Notifications</span>
                </div>
                {activeAlertCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px]">
                    {activeAlertCount}
                  </span>
                )}
              </button>
            )}

            {onOpenAtmosphere && (
              <button
                type="button"
                onClick={() => {
                  onOpenAtmosphere();
                  setIsMobileOpen(false);
                }}
                className="flex w-full items-center gap-3 px-3 py-2 rounded-2xl text-left text-blue-100 hover:bg-white/10 transition cursor-pointer"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-blue-800/40 text-blue-200">
                  <Sparkles className="h-3.5 w-3.5" />
                </span>
                <span className="text-xs font-semibold">Atmosphère &amp; Thème</span>
              </button>
            )}
          </div>
        </div>

        {/* BOTTOM ACTION BAR (Style Log Out / Position GPS comme sur la photo) */}
        <div className="p-4 border-t border-blue-400/25 bg-blue-950/40 flex items-center justify-between gap-2">
          {onLocateGps ? (
            <button
              type="button"
              onClick={() => {
                onLocateGps();
                setIsMobileOpen(false);
              }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-black transition cursor-pointer active:scale-95"
            >
              <Navigation className="h-4 w-4 text-cyan-300" />
              <span>Ma Position GPS</span>
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={() => setIsMobileOpen(false)}
            title="Fermer la barre latérale"
            className="flex items-center gap-1.5 py-2.5 px-3 rounded-2xl bg-blue-900/60 hover:bg-blue-800 border border-blue-400/30 text-blue-200 hover:text-white text-xs font-bold transition cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Fermer</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DESKTOP SIDEBAR RAIL (3 Niveaux : 1. Tout voir / 2. Logos seuls / 3. Flèche seule) */}
      {/* ========================================================================= */}

      {/* NIVEAU 3 : JUSTE LA FLÈCHE EN BAS (Dock Minimaliste Flottant parfaitement aligné avec la barre du bas) */}
      {sidebarLevel === 'minimal' && (
        <aside
          className="fixed left-1 bottom-3 z-40 hidden lg:flex items-center"
          aria-label="Ouvrir le sommaire et les rubriques"
        >
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-950/95 border border-slate-800/90 shadow-2xl backdrop-blur-2xl ring-1 ring-white/5">
            <button
              type="button"
              onClick={() => setSidebarLevel('icons')}
              title="Ouvrir le sommaire de la page (Mode Logos)"
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white transition-all duration-200 active:scale-95 cursor-pointer font-bold text-xs"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-600/30">
                <ChevronRight className="h-3.5 w-3.5" />
              </div>
              <span className="text-xs font-black text-white">Sommaire</span>
            </button>

            {/* Direct switch to 'full' */}
            <button
              type="button"
              onClick={() => setSidebarLevel('full')}
              title="Ouvrir en mode complet (Tout voir)"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <Layers className="h-4 w-4" />
            </button>
          </div>
        </aside>
      )}

      {/* NIVEAU 1 (Tout voir: 275px) & NIVEAU 2 (Logos seuls: 68px) */}
      {sidebarLevel !== 'minimal' && (
        <aside
          className={`fixed left-1 top-24 bottom-24 z-40 hidden lg:block transition-all duration-300 pointer-events-auto ${
            sidebarLevel === 'icons' ? 'w-[68px]' : 'w-[275px]'
          }`}
          aria-label={`Sommaire et rubriques de la page ${title}`}
        >
          <div
            className={`max-h-[calc(100vh-8.5rem)] h-full overflow-y-auto rounded-[24px] border border-slate-800/90 bg-slate-950/95 p-2.5 shadow-2xl backdrop-blur-2xl transition-all duration-300 flex flex-col justify-between scrollbar-none ${
              sidebarLevel === 'icons' ? 'w-[68px]' : 'w-[275px]'
            }`}
          >
            {/* TOP BRAND & 3-LEVEL SWITCHER */}
            <div>
              <div className="relative flex items-center justify-between pb-2.5 pt-0.5 border-b border-slate-800/80">
                <div className={`flex items-center gap-2.5 ${sidebarLevel === 'icons' ? 'mx-auto' : ''}`}>
                  <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-indigo-600 to-cyan-500 text-white shadow-md shadow-blue-600/30">
                    <span className="text-xs font-black tracking-tight">IM</span>
                    {isChristmasActive && (
                      <span className="absolute -top-1 -right-1 text-[10px]" title="Mode Noël Actif">
                        ❄️
                      </span>
                    )}
                  </div>

                  {sidebarLevel === 'full' && (
                    <div className="min-w-0 pr-2">
                      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-blue-400">
                        Sur cette page
                      </p>
                      <h2 className="text-xs font-black text-white truncate leading-tight mt-0.5 max-w-[130px]">
                        {title}
                      </h2>
                    </div>
                  )}
                </div>

                {/* Level Controls at Top */}
                {sidebarLevel === 'full' ? (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setSidebarLevel('icons')}
                      title="Mode compact (icônes seules)"
                      className="flex h-6 w-6 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 hover:border-blue-500/50 transition cursor-pointer"
                    >
                      <ChevronLeft className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setSidebarLevel('minimal')}
                      title="Fermer le panneau latéral"
                      className="flex h-6 w-6 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-rose-300 hover:bg-rose-950/40 hover:border-rose-500/50 transition cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div className="hidden" />
                )}
              </div>

              {/* 3-Level Selector Pills (Visible in Full Mode) */}
              {sidebarLevel === 'full' && (
                <div className="mt-2 grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-900/90 border border-slate-800 text-[10px] font-bold">
                  <button
                    type="button"
                    onClick={() => setSidebarLevel('full')}
                    className="py-1 px-1 rounded-lg bg-blue-600 text-white font-black text-center transition cursor-pointer shadow"
                    title="Affichage complet"
                  >
                    Complet
                  </button>
                  <button
                    type="button"
                    onClick={() => setSidebarLevel('icons')}
                    className="py-1 px-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-center transition cursor-pointer"
                    title="Icônes seules"
                  >
                    Logos
                  </button>
                  <button
                    type="button"
                    onClick={() => setSidebarLevel('minimal')}
                    className="py-1 px-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-center transition cursor-pointer"
                    title="Réduire"
                  >
                    Réduire
                  </button>
                </div>
              )}

              {/* MAIN LIST: GRANDS TITRES / RUBRIQUES DE LA PAGE ACTUELLE */}
              <div className="mt-2.5 space-y-1">
                {sidebarLevel === 'full' && (
                  <div className="px-1 py-0.5 text-[9px] font-black uppercase tracking-wider text-slate-400 flex items-center justify-between">
                    <span>Rubriques ({sections.length})</span>
                    <span className="text-[8px] text-blue-400 lowercase font-normal">clic direct</span>
                  </div>
                )}

                <nav className="space-y-1" aria-label="Sections de la page">
                  {sections.map((section, index) => {
                    const Icon = section.icon ?? fallbackIcons[index % fallbackIcons.length];
                    const active = activeSection === section.id;

                    return (
                      <button
                        key={section.id}
                        type="button"
                        onClick={() => goToSection(section.id)}
                        title={section.label}
                        aria-current={active ? 'location' : undefined}
                        className={`group relative flex w-full items-center rounded-xl transition-all duration-200 cursor-pointer ${
                          sidebarLevel === 'icons' ? 'justify-center p-2' : 'gap-2 px-2.5 py-1.5 text-left'
                        } ${
                          active
                            ? 'bg-white text-slate-950 shadow-md shadow-black/25 font-bold'
                            : 'text-slate-300 hover:bg-slate-900/90 hover:text-white'
                        }`}
                      >
                        <span
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition ${
                            active
                              ? 'bg-slate-200 text-slate-950 font-black'
                              : 'bg-slate-900 text-slate-400 group-hover:text-blue-300 group-hover:bg-slate-800'
                          }`}
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </span>

                        {sidebarLevel === 'full' && (
                          <span className="text-xs font-semibold leading-snug truncate">
                            {section.label}
                          </span>
                        )}

                        {/* Tooltip in icon mode */}
                        {sidebarLevel === 'icons' && (
                          <span className="absolute left-full ml-3 px-2.5 py-1 rounded-lg bg-slate-900 text-white text-xs font-bold whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition shadow-xl border border-slate-800 z-50">
                            {section.label}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* BOTTOM: BULLETIN BUTTON, NOEL / CLEAR & LEVEL TOGGLES */}
            <div className="mt-3 pt-2.5 border-t border-slate-800/80 space-y-2">
              {/* Quick Bulletin button */}
              {onSelectTab && (
                <button
                  type="button"
                  onClick={() => onSelectTab('bulletin')}
                  title="Accéder aux Bulletins Météo (J+7 & 4 Semaines)"
                  className={`w-full flex items-center rounded-xl bg-gradient-to-r from-blue-900/50 to-indigo-900/50 border border-blue-500/40 text-blue-200 hover:text-white hover:bg-blue-600 transition cursor-pointer ${
                    sidebarLevel === 'icons' ? 'justify-center p-2' : 'gap-2 px-2.5 py-2'
                  }`}
                >
                  <FileText className="h-4 w-4 text-blue-400 shrink-0" />
                  {sidebarLevel === 'full' && (
                    <span className="text-xs font-bold truncate">
                      Bulletins Prévisions
                    </span>
                  )}
                </button>
              )}

              {/* BOTTOM CONTROLS FOR ICONS LEVEL */}
              {sidebarLevel === 'icons' ? (
                <div className="flex flex-col items-center gap-1.5">
                  {/* Expand to Full */}
                  <button
                    type="button"
                    onClick={() => setSidebarLevel('full')}
                    title="Agrandir le sommaire"
                    className="w-full flex items-center justify-center p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 hover:border-blue-500/40 transition cursor-pointer"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>

                  {/* Collapse to Minimal (Bottom Arrow) */}
                  <button
                    type="button"
                    onClick={() => setSidebarLevel('minimal')}
                    title="Fermer le panneau"
                    className="w-full flex items-center justify-center p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-rose-300 hover:bg-slate-800 transition cursor-pointer"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>

                  {isChristmasActive && (
                    <span className="text-[10px]" title="Événement Noël Actif">
                      🎄
                    </span>
                  )}
                </div>
              ) : (
                <>
                  {/* Station badge */}
                  {currentStation && (
                    <div className="flex items-center justify-between p-1.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[10px]">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <MapPin className="h-3 w-3 text-blue-400 shrink-0" />
                        <div className="min-w-0 truncate">
                          <div className="font-bold text-white truncate text-[10px]">{currentStation.name}</div>
                        </div>
                      </div>
                      {onLocateGps && (
                        <button
                          onClick={onLocateGps}
                          title="Localiser par GPS"
                          className="p-1 rounded bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white transition cursor-pointer shrink-0"
                        >
                          <Navigation className="h-2.5 w-2.5" />
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </aside>
      )}
    </>
  );
};
