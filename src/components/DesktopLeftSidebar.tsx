import React, { useEffect, useState } from 'react';
import {
  Sun,
  Compass,
  Cloud,
  CloudRain,
  Bell,
  Split,
  Mountain,
  MoreHorizontal,
  Sparkles,
  Star,
  History,
  Settings,
  Moon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  MapPin,
  Search,
  Globe2,
  Radio,
  FileText,
  Trophy,
  MessageSquare,
  Layers,
  X,
} from 'lucide-react';
import { CurrentWeather, LocationPoint } from '../types/weather';
import { AtmosphereThemeConfig } from '../types/atmosphere';
import { FRENCH_STATIONS } from '../data/frenchStations';
import { isPageVisible } from '../services/displayPreferencesService';
import { getRichWeatherInfo } from '../utils/weatherIcons';
import { getClientGeographicBackdrop } from '../utils/geoBackdrops';
import { getActiveSiteLocale, getSiteBrandForLocale, SupportedLocaleCode } from '../i18n/siteTranslations';
import type { NavTabId } from './BottomNavigationDock';

interface DesktopLeftSidebarProps {
  activeTab: NavTabId;
  onSelectTab: (tabId: NavTabId) => void;
  currentStation: LocationPoint;
  weather: CurrentWeather | null;
  tempUnit: 'C' | 'F';
  lastUpdatedTime?: string;
  activeAlertCount?: number;
  currentTheme: AtmosphereThemeConfig;
  isLightMode?: boolean;
  onToggleThemeMode?: () => void;
  onOpenSearchModal: () => void;
  onOpenAllPagesModal: () => void;
  onOpenAtmosphereModal: () => void;
  onSelectStation?: (station: LocationPoint) => void;
}

const SIDEBAR_COLLAPSED_KEY = 'instant_meteo_desktop_sidebar_collapsed_v1';
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
  } catch {
    // ignore storage read error
  }
  return [
    FRENCH_STATIONS.find((s) => s.name.toLowerCase().includes('paris')) || FRENCH_STATIONS[0],
    FRENCH_STATIONS.find((s) => s.name.toLowerCase().includes('lyon')) || FRENCH_STATIONS[1],
    FRENCH_STATIONS.find((s) => s.name.toLowerCase().includes('marseille')) || FRENCH_STATIONS[2],
    FRENCH_STATIONS.find((s) => s.name.toLowerCase().includes('chamonix')) || FRENCH_STATIONS[4],
  ].filter(Boolean);
};

interface SidebarRowDef {
  id: string;
  tabId?: NavTabId;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColorClass?: string;
  badgeText?: string;
  badgeVariant?: 'amber' | 'count';
  action?: () => void;
  visibleCheckId?: string;
}

export const DesktopLeftSidebar: React.FC<DesktopLeftSidebarProps> = ({
  activeTab,
  onSelectTab,
  currentStation,
  weather,
  tempUnit,
  lastUpdatedTime,
  activeAlertCount = 0,
  currentTheme,
  isLightMode = false,
  onToggleThemeMode,
  onOpenSearchModal,
  onOpenAllPagesModal,
  onOpenAtmosphereModal,
  onSelectStation,
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [showMoreMaps, setShowMoreMaps] = useState<boolean>(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState<boolean>(false);
  const [savedFavorites, setSavedFavorites] = useState<LocationPoint[]>(() => loadSavedFavoriteStations());
  const [locale, setLocale] = useState<SupportedLocaleCode>(() => getActiveSiteLocale());
  const [, setDisplayTick] = useState(0);

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(isCollapsed));
    } catch {
      // ignore storage write error
    }
  }, [isCollapsed]);

  useEffect(() => {
    const syncLocale = () => setLocale(getActiveSiteLocale());
    const handlePrefs = () => setDisplayTick((t) => t + 1);
    const handleFavs = () => setSavedFavorites(loadSavedFavoriteStations());

    window.addEventListener('instant_meteo_native_lang_change', syncLocale);
    window.addEventListener('popstate', syncLocale);
    window.addEventListener('instant_meteo_display_preferences_updated', handlePrefs);
    window.addEventListener('instant_meteo_favorites_updated', handleFavs);

    return () => {
      window.removeEventListener('instant_meteo_native_lang_change', syncLocale);
      window.removeEventListener('popstate', syncLocale);
      window.removeEventListener('instant_meteo_display_preferences_updated', handlePrefs);
      window.removeEventListener('instant_meteo_favorites_updated', handleFavs);
    };
  }, []);

  useEffect(() => {
    if (!isFavoritesOpen) return;
    setSavedFavorites(loadSavedFavoriteStations());
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsFavoritesOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isFavoritesOpen]);

  const extendedModuleIds: NavTabId[] = [
    'eightMonths',
    'bulletin',
    'competitive',
    'discussionGroup',
  ];

  // Auto-open extra modules accordion if one of those pages is currently active
  useEffect(() => {
    if (extendedModuleIds.includes(activeTab)) {
      setShowMoreMaps(true);
    }
  }, [activeTab]);

  const brand = getSiteBrandForLocale(locale);
  const isDay =
    currentTheme.timeOfDay !== 'NIGHT' && currentTheme.timeOfDay !== 'DUSK';
  const weatherInfo = weather
    ? getRichWeatherInfo(
        weather.weatherCode,
        isDay,
        weather.precipitation,
        weather.windGust
      )
    : null;

  const formattedTemp = weather
    ? tempUnit === 'F'
      ? `${((weather.temperature * 9) / 5 + 32).toFixed(1)}°F`
      : `${weather.temperature.toFixed(1)}°C`
    : '--°C';

  const backdropUrl = getClientGeographicBackdrop(
    currentStation.name,
    currentStation.region,
    currentStation.department,
    currentStation.altitude
  );

  const rawPrimaryItems: SidebarRowDef[] = [
    {
      id: 'realtime',
      tabId: 'realtime',
      title: 'Direct',
      subtitle: "Vue d'ensemble",
      icon: Sun,
      iconColorClass: 'text-amber-400',
      visibleCheckId: 'realtime',
    },
    {
      id: 'skymap',
      tabId: 'skymap',
      title: 'SkyMap 3D',
      subtitle: 'Globe interactif',
      icon: Compass,
      iconColorClass: 'text-sky-400',
      visibleCheckId: 'skymap',
      action: () => {
        const isEn = window.location.pathname === '/en' || window.location.pathname.startsWith('/en/');
        window.location.href = isEn ? '/en/skymap' : '/skymap';
      },
    },
    {
      id: 'cloudNephology',
      tabId: 'cloudNephology',
      title: 'Nuages',
      subtitle: 'Prévisions nuageuses',
      icon: Cloud,
      iconColorClass: 'text-cyan-400',
      visibleCheckId: 'cloudNephology',
    },
    {
      id: 'radar',
      tabId: 'radar',
      title: 'Radar',
      subtitle: 'Pluies en temps réel',
      icon: CloudRain,
      iconColorClass: 'text-teal-400',
      visibleCheckId: 'radar',
    },
    {
      id: 'vigilance',
      tabId: 'vigilance',
      title: 'Alertes',
      subtitle: 'Vigilances météo',
      icon: Bell,
      iconColorClass: 'text-rose-400',
      badgeText: activeAlertCount > 0 ? String(activeAlertCount) : undefined,
      badgeVariant: 'count',
      visibleCheckId: 'vigilance',
    },
    {
      id: 'scenarios14d',
      tabId: 'scenarios14d',
      title: '14 Jours',
      subtitle: 'Prévisions détaillées',
      icon: Split,
      iconColorClass: 'text-indigo-400',
      visibleCheckId: 'scenarios14d',
    },
    {
      id: 'natureTerritories',
      tabId: 'natureTerritories',
      title: "Montagne, Neige, Plage, Mer, Sécheresse & Feux, Cours d'eau",
      subtitle: '4 espaces regroupés',
      icon: Mountain,
      iconColorClass: 'text-emerald-400',
      visibleCheckId: 'natureTerritories',
    },
    {
      id: 'worldDisasters',
      tabId: 'worldDisasters',
      title: 'Catastrophes',
      subtitle: 'Atlas monde temps réel',
      icon: Radio,
      iconColorClass: 'text-rose-400',
      visibleCheckId: 'worldDisasters',
    },
    {
      id: 'historicalTrends',
      tabId: 'historicalTrends',
      title: 'Historique',
      subtitle: 'Données passées',
      icon: History,
      iconColorClass: 'text-blue-400',
      visibleCheckId: 'historicalTrends',
    },
    {
      id: 'all-pages-hub',
      title: 'Tout afficher',
      subtitle: 'Toutes les pages',
      icon: Layers,
      iconColorClass: 'text-sky-400',
      action: () => {
        setIsFavoritesOpen(false);
        onOpenAllPagesModal();
      },
    },
    {
      id: 'maps-hub',
      title: 'Autre',
      subtitle: 'Autres pages & modules',
      icon: MoreHorizontal,
      iconColorClass: 'text-blue-400',
      action: () => {
        if (isCollapsed) {
          onOpenAllPagesModal();
        } else {
          setShowMoreMaps((prev) => !prev);
        }
      },
    },
  ];
  const primaryItems = rawPrimaryItems.filter((item) => !item.visibleCheckId || isPageVisible(item.visibleCheckId));

  const rawExtraMapModules: SidebarRowDef[] = [
    {
      id: 'eightMonths',
      tabId: 'eightMonths',
      title: '8 Mois',
      subtitle: 'Tendances saisonnières',
      icon: Globe2,
      iconColorClass: 'text-indigo-400',
      visibleCheckId: 'eightMonths',
    },
    {
      id: 'bulletin',
      tabId: 'bulletin',
      title: 'Bulletins',
      subtitle: 'J+1 à J+7 & 4 sem.',
      icon: FileText,
      iconColorClass: 'text-blue-400',
      visibleCheckId: 'bulletin',
    },
    {
      id: 'competitive',
      tabId: 'competitive',
      title: 'Défis Météo',
      subtitle: 'Classement & points',
      icon: Trophy,
      iconColorClass: 'text-amber-400',
      visibleCheckId: 'competitive',
    },
    {
      id: 'discussionGroup',
      tabId: 'discussionGroup',
      title: 'Salon Météo',
      subtitle: 'Discussion en direct',
      icon: MessageSquare,
      iconColorClass: 'text-emerald-400',
      visibleCheckId: 'discussionGroup',
    },
  ];
  const extraMapModules = rawExtraMapModules.filter((item) => !item.visibleCheckId || isPageVisible(item.visibleCheckId));

  const rawSecondaryUtilityItems: SidebarRowDef[] = [
    {
      id: 'favoris',
      title: 'Favoris',
      subtitle: 'Vos lieux',
      icon: Star,
      iconColorClass: 'text-sky-400',
      action: () => setIsFavoritesOpen((prev) => !prev),
    },
  ];
  const secondaryUtilityItems = rawSecondaryUtilityItems.filter((item) => !item.visibleCheckId || isPageVisible(item.visibleCheckId));

  const renderNavItem = (item: SidebarRowDef, compact = false) => {
    const Icon = item.icon;
    const isActive = Boolean(
      item.tabId &&
        (activeTab === item.tabId ||
          (item.tabId === 'historicalTrends' && activeTab === 'weatherArchive'))
    );
    const isMapsToggle = item.id === 'maps-hub';
    const isFavorisOpenItem = item.id === 'favoris' && isFavoritesOpen;

    return (
      <button
        key={item.id}
        id={`desktop-sidebar-item-${item.id}`}
        type="button"
        title={isCollapsed ? `${item.title} — ${item.subtitle}` : undefined}
        onClick={() => {
          if (item.action) {
            item.action();
            return;
          }
          if (item.tabId) {
            setIsFavoritesOpen(false);
            onSelectTab(item.tabId);
          }
        }}
        className={`group w-full flex items-center ${
          isCollapsed ? 'justify-center px-2 py-2.5' : compact ? 'gap-2.5 px-2.5 py-1.5' : 'gap-2.5 px-2.5 py-2'
        } rounded-xl text-left transition-all duration-150 cursor-pointer active:scale-[0.98] relative ${
          isActive
            ? 'desktop-sidebar-item-active bg-gradient-to-r from-[#2563eb] via-[#2b5ce7] to-[#4f46e5] text-white shadow-[0_6px_18px_-4px_rgba(37,99,235,0.62)]'
            : isFavorisOpenItem
              ? isLightMode
                ? 'bg-blue-50 text-blue-900'
                : 'bg-slate-800/80 text-white'
              : isLightMode
                ? 'text-slate-700 hover:bg-slate-100/90 hover:text-slate-950'
                : 'text-slate-200 hover:bg-slate-800/55 hover:text-white'
        }`}
      >
        <div
          className={`flex items-center justify-center shrink-0 ${
            compact ? 'w-6 h-6' : 'w-7 h-7'
          } rounded-lg transition-colors ${
            isActive
              ? 'bg-white/15 text-white'
              : isLightMode
                ? 'text-slate-600 group-hover:text-blue-600'
                : item.iconColorClass || 'text-slate-300'
          }`}
        >
          <Icon className={compact ? 'h-4 w-4' : 'h-[18px] w-[18px]'} />
        </div>

        {!isCollapsed && (
          <>
            <div className="flex-1 min-w-0">
              <div
                className={`${
                  item.id === 'natureTerritories'
                    ? 'text-[11.5px] leading-snug line-clamp-3'
                    : `${compact ? 'text-[12px]' : 'text-[13px]'} leading-tight truncate`
                } font-bold ${
                  isActive
                    ? 'text-white'
                    : isLightMode
                      ? 'text-slate-900'
                      : 'text-slate-100'
                }`}
              >
                {item.title}
              </div>
              <div
                className={`text-[10px] leading-tight truncate mt-0.5 ${
                  isActive
                    ? 'text-blue-100/90'
                    : isLightMode
                      ? 'text-slate-500'
                      : 'text-slate-400'
                }`}
              >
                {item.subtitle}
              </div>
            </div>

            {item.badgeText && item.badgeVariant === 'count' && (
              <span className="h-[18px] min-w-[18px] px-1.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black flex items-center justify-center tabular-nums shrink-0 shadow-sm">
                {item.badgeText}
              </span>
            )}

            {item.badgeText && item.badgeVariant === 'amber' && (
              <span
                className={`px-1.5 py-0.5 rounded-md text-[9px] font-black tracking-wide shrink-0 ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : isLightMode
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                }`}
              >
                {item.badgeText}
              </span>
            )}

            {isActive && <ChevronRight className="h-4 w-4 text-white/90 shrink-0" />}

            {isMapsToggle && !isActive && (
              <ChevronDown
                className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${
                  showMoreMaps ? 'rotate-180 text-sky-400' : isLightMode ? 'text-slate-400' : 'text-slate-500'
                }`}
              />
            )}
          </>
        )}

        {isCollapsed && item.badgeText && item.badgeVariant === 'count' && (
          <span className="absolute top-1 right-1 h-4 min-w-[16px] px-1 rounded-full bg-amber-400 text-slate-950 text-[9px] font-black flex items-center justify-center tabular-nums">
            {item.badgeText}
          </span>
        )}
      </button>
    );
  };

  return (
    <aside
      aria-label="Barre de navigation latérale gauche"
      className={`desktop-left-sidebar hidden sm:flex flex-col shrink-0 sticky top-0 h-screen z-40 select-none transition-[width] duration-200 ease-out border-r ${
        isCollapsed ? 'w-[74px]' : 'w-[252px]'
      } ${
        isLightMode
          ? 'bg-white border-slate-200/95 text-slate-900 shadow-[4px_0_24px_rgba(15,23,42,0.06)]'
          : 'bg-gradient-to-b from-[#0b1326] via-[#091022] to-[#060b18] border-slate-800/80 text-slate-100 shadow-[4px_0_28px_rgba(0,0,0,0.45)]'
      }`}
    >
      {/* 1. Brand Lockup & Collapse Toggle */}
      <div
        className={`flex items-center ${
          isCollapsed ? 'justify-center px-2' : 'justify-between px-3.5'
        } pt-3.5 pb-2.5 shrink-0`}
      >
        <button
          type="button"
          onClick={() => onSelectTab('realtime')}
          title="Retour au Direct Instant Météo"
          className={`flex items-center gap-2.5 text-left cursor-pointer group ${
            isCollapsed ? 'justify-center' : 'min-w-0 flex-1'
          }`}
        >
          {/* App Emblem */}
          <div className="relative h-9 w-9 rounded-xl overflow-hidden shadow-md shadow-sky-500/25 border border-white/30 bg-gradient-to-br from-sky-400 via-blue-500 to-amber-300 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
            <svg viewBox="0 0 100 100" className="w-7 h-7" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="66" cy="34" r="16" fill="#fbbf24" />
              <path
                d="M24 66h48c9 0 16-7 16-16 0-8-6-14.5-14-15.8-1-11.5-10.5-20.2-22-20.2-9.5 0-18 6-21 15.2-1.5-.6-3.4-.6-5-.6-9.5 0-17.5 8-17.5 17.5 0 9.5 8 19.9 15.5 19.9z"
                fill="#ffffff"
              />
              <polygon points="49,52 40,68 49,68 41,84 62,64 51,64" fill="#f59e0b" />
            </svg>
          </div>

          {!isCollapsed && (
            <div className="min-w-0 notranslate">
              <div className="text-[13px] font-black tracking-tight leading-none flex items-center gap-1 truncate">
                <span className={isLightMode ? 'text-slate-900' : 'text-white'}>
                  {brand.word1.toUpperCase()}
                </span>
                <span className="bg-gradient-to-r from-sky-400 via-amber-400 to-orange-500 bg-clip-text text-transparent">
                  {brand.word2.toUpperCase()}
                </span>
              </div>
              <div className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-400/35 text-[8.5px] font-black text-amber-400 uppercase tracking-wider leading-none">
                <span>⚡</span>
                <span>{locale === 'fr' ? 'HD & DIRECT' : 'HD & LIVE'}</span>
              </div>
            </div>
          )}
        </button>

        {!isCollapsed && (
          <button
            type="button"
            id="desktop-sidebar-collapse-btn"
            onClick={() => setIsCollapsed(true)}
            title="Réduire la barre latérale"
            aria-label="Réduire la barre latérale"
            className={`h-7 w-7 rounded-full border flex items-center justify-center transition cursor-pointer shrink-0 active:scale-95 ${
              isLightMode
                ? 'border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-600'
                : 'border-slate-700/80 bg-slate-800/70 hover:bg-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {isCollapsed && (
        <div className="px-2 pb-2 flex justify-center shrink-0">
          <button
            type="button"
            id="desktop-sidebar-expand-btn"
            onClick={() => setIsCollapsed(false)}
            title="Déployer la barre latérale"
            aria-label="Déployer la barre latérale"
            className={`h-7 w-7 rounded-full border flex items-center justify-center transition cursor-pointer active:scale-95 ${
              isLightMode
                ? 'border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-600'
                : 'border-slate-700/80 bg-slate-800/70 hover:bg-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* 2. Live Station Mini Card (Expanded mode) */}
      {!isCollapsed ? (
        <div className="px-3 pb-2.5 shrink-0">
          <button
            type="button"
            onClick={() => onSelectTab('realtime')}
            className={`desktop-sidebar-weather-card relative w-full rounded-2xl overflow-hidden border text-left p-3 transition group cursor-pointer active:scale-[0.99] ${
              isLightMode
                ? 'border-sky-200 bg-gradient-to-br from-sky-900 via-blue-950 to-slate-900 text-white shadow-md'
                : 'border-slate-700/70 bg-gradient-to-br from-[#0e1a36] via-[#0b152d] to-[#132245] text-white shadow-lg shadow-black/30'
            }`}
          >
            {/* Atmospheric skyline photo subtle backdrop */}
            <div
              className="absolute inset-0 bg-cover bg-center opacity-30 group-hover:opacity-40 transition-opacity pointer-events-none"
              style={{ backgroundImage: `url(${backdropUrl})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#091229]/95 via-[#0a1530]/80 to-[#0e1c3f]/70 pointer-events-none" />

            <div className="relative z-10 flex items-center gap-2.5">
              <div className="h-10 w-10 rounded-xl bg-sky-500/20 border border-sky-400/25 flex items-center justify-center text-2xl shrink-0 shadow-inner">
                <span role="img" aria-hidden="true">
                  {weatherInfo ? (isDay ? weatherInfo.emoji : weatherInfo.nightEmoji) : '🌤️'}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[12px] font-bold text-slate-100 truncate">
                  {currentStation.name}
                </div>
                <div className="text-xl font-black text-white leading-tight tabular-nums tracking-tight">
                  {formattedTemp}
                </div>
                <div className="text-[10.5px] font-medium text-sky-200/90 truncate">
                  {weatherInfo?.shortLabel || weather?.weatherDescription || 'Temps réel'}
                </div>
              </div>
            </div>

            <div className="relative z-10 mt-2 pt-2 border-t border-white/10 flex items-center justify-between gap-2 text-[10px]">
              <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Données en direct</span>
              </span>
              <span className="text-slate-300/85 font-medium tabular-nums">
                Maj : {lastUpdatedTime || '--:--'}
              </span>
            </div>
          </button>
        </div>
      ) : (
        /* Collapsed Live Temperature Pill */
        <div className="px-2 pb-2 shrink-0 flex justify-center">
          <button
            type="button"
            onClick={() => onSelectTab('realtime')}
            title={`${currentStation.name} : ${formattedTemp}`}
            className="desktop-sidebar-weather-card w-full py-1.5 px-1 rounded-xl border border-slate-700/70 bg-gradient-to-br from-[#0e1a36] to-[#132245] text-white flex flex-col items-center justify-center cursor-pointer hover:border-sky-400/60 transition"
          >
            <span className="text-base leading-none">
              {weatherInfo ? (isDay ? weatherInfo.emoji : weatherInfo.nightEmoji) : '🌤️'}
            </span>
            <span className="text-[10px] font-black tabular-nums mt-1 leading-none">
              {weather ? `${Math.round(tempUnit === 'F' ? (weather.temperature * 9) / 5 + 32 : weather.temperature)}°` : '--°'}
            </span>
          </button>
        </div>
      )}

      {/* 3. Main Scrollable Navigation List */}
      <nav
        aria-label="Navigation principale latérale"
        className="flex-1 overflow-y-auto px-2.5 py-1 space-y-0.5 no-scrollbar"
      >
        {primaryItems.map((item) => renderNavItem(item))}

        {/* Expandable Sub-list for All Additional Weather Maps & Observatories */}
        {!isCollapsed && showMoreMaps && (
          <div
            className={`ml-3 pl-2.5 my-1 border-l space-y-0.5 ${
              isLightMode ? 'border-slate-200' : 'border-slate-800'
            }`}
          >
            {extraMapModules.map((sub) => renderNavItem(sub, true))}
          </div>
        )}

        {/* Divider before Favoris, Historique */}
        <div
          className={`my-2 border-t ${
            isLightMode ? 'border-slate-200/90' : 'border-slate-800/80'
          }`}
        />

        <div className="relative">
          {secondaryUtilityItems.map((item) => renderNavItem(item))}
        </div>
      </nav>

      {/* Floating Favorites Quick-Switch Popover (opens beside sidebar) */}
      {isFavoritesOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsFavoritesOpen(false)}
          />
          <div
            role="dialog"
            aria-label="Stations favorites"
            className={`fixed z-50 bottom-24 w-72 rounded-2xl border p-3 shadow-2xl backdrop-blur-xl ${
              isCollapsed ? 'left-[82px]' : 'left-[260px]'
            } ${
              isLightMode
                ? 'bg-white/98 border-slate-200 text-slate-900 shadow-slate-900/15'
                : 'bg-[#0b1326]/98 border-slate-700/80 text-white shadow-black/70'
            }`}
          >
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/40">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                <span className="text-xs font-black">Vos lieux favoris</span>
              </div>
              <button
                type="button"
                onClick={() => setIsFavoritesOpen(false)}
                className={`p-1 rounded-lg cursor-pointer transition ${
                  isLightMode ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-slate-800 text-slate-400'
                }`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="space-y-1 max-h-60 overflow-y-auto">
              {savedFavorites.map((fav) => {
                const isSelected = fav.id === currentStation.id;
                return (
                  <button
                    key={fav.id}
                    type="button"
                    onClick={() => {
                      onSelectStation?.(fav);
                      setIsFavoritesOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left transition cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white font-bold'
                        : isLightMode
                          ? 'hover:bg-slate-100 text-slate-800'
                          : 'hover:bg-slate-800/80 text-slate-200'
                    }`}
                  >
                    <MapPin className={`h-3.5 w-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-amber-400'}`} />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold truncate">{fav.name}</div>
                      <div className={`text-[10px] truncate ${isSelected ? 'text-blue-100' : isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        {fav.department || 'Station météo'} • {fav.altitude ?? 0} m
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => {
                setIsFavoritesOpen(false);
                onOpenSearchModal();
              }}
              className="mt-2.5 w-full flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 py-2 px-3 text-xs font-bold text-white transition cursor-pointer"
            >
              <Search className="h-3.5 w-3.5" />
              <span>Rechercher une commune</span>
            </button>
          </div>
        </>
      )}

      {/* 4. Bottom Pinned PARAMÈTRES Section */}
      <div
        className={`shrink-0 border-t px-2.5 py-2.5 space-y-1 ${
          isLightMode ? 'border-slate-200/90' : 'border-slate-800/80'
        }`}
      >
        {!isCollapsed && (
          <div className="px-2 pb-0.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
            Paramètres
          </div>
        )}

        {/* Paramètres Button */}
        <button
          type="button"
          id="desktop-sidebar-settings-btn"
          title={isCollapsed ? 'Paramètres & Préférences' : undefined}
          onClick={() => {
            window.dispatchEvent(new CustomEvent('instant_meteo_open_settings'));
          }}
          className={`w-full flex items-center ${
            isCollapsed ? 'justify-center px-2 py-2' : 'gap-2.5 px-2.5 py-1.5'
          } rounded-xl text-left transition cursor-pointer ${
            isLightMode
              ? 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
              : 'text-slate-200 hover:bg-slate-800/60 hover:text-white'
          }`}
        >
          <div className="w-7 h-7 flex items-center justify-center shrink-0">
            <Settings className={`h-[17px] w-[17px] ${isLightMode ? 'text-slate-600' : 'text-slate-300'}`} />
          </div>
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <div className={`text-[12.5px] font-bold leading-tight ${isLightMode ? 'text-slate-900' : 'text-slate-100'}`}>
                Paramètres
              </div>
              <div className={`text-[10px] leading-tight ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                Préférences
              </div>
            </div>
          )}
        </button>

        {/* Thème Button */}
        <button
          type="button"
          id="desktop-sidebar-theme-btn"
          title={isLightMode ? 'Passer en Mode Nuit' : 'Passer en Mode Jour'}
          onClick={() => onToggleThemeMode?.()}
          className={`w-full flex items-center ${
            isCollapsed ? 'justify-center px-2 py-2' : 'justify-between gap-2 px-2.5 py-1.5'
          } rounded-xl text-left transition cursor-pointer ${
            isLightMode
              ? 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
              : 'text-slate-200 hover:bg-slate-800/60 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 flex items-center justify-center shrink-0">
              {isLightMode ? (
                <Sun className="h-[17px] w-[17px] text-amber-500" />
              ) : (
                <Moon className="h-[17px] w-[17px] text-sky-400" />
              )}
            </div>
            {!isCollapsed && (
              <span className={`text-[12.5px] font-bold truncate ${isLightMode ? 'text-slate-900' : 'text-slate-100'}`}>
                Thème
              </span>
            )}
          </div>

          {!isCollapsed && (
            <span
              className={`px-2 py-1 rounded-lg text-[10.5px] font-bold border shrink-0 ${
                isLightMode
                  ? 'bg-slate-100 border-slate-200 text-slate-700'
                  : 'bg-slate-800/90 border-slate-700/80 text-slate-200'
              }`}
            >
              {isLightMode ? 'Jour' : 'Nuit'} ⇅
            </span>
          )}
        </button>

        {/* Atmosphère selector shortcut when expanded */}
        {!isCollapsed && (
          <button
            type="button"
            onClick={onOpenAtmosphereModal}
            className={`w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl text-left transition cursor-pointer ${
              isLightMode
                ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 flex items-center justify-center shrink-0">
                <Sparkles className="h-4 w-4 shrink-0" style={{ color: currentTheme.glowAccentColor }} />
              </div>
              <span className="text-[11.5px] font-semibold truncate">
                {currentTheme.skyToneLabel}
              </span>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-slate-500 shrink-0" />
          </button>
        )}
      </div>
    </aside>
  );
};
